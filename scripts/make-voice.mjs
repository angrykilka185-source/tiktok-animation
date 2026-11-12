// Voice-over with ElevenLabs (text-to-speech with timestamps): one narrator (Adam).
// Writes public/voice/<id>.mp3 and src/voice-timings.json (word timings for the captions).
// Every line gets a time window (until the next line starts); if the voice is longer,
// the line is sped up with ffmpeg atempo (max 1.25x) so the picture stays in sync.
// Key: ELEVENLABS_API_KEY env var, or injected by the session proxy.
//   npm run voice                 -> only new/changed lines
//   npm run voice -- --force      -> regenerate everything
//   npm run voice -- --dry        -> no API calls: texts + estimated timing check
//   npm run voice -- --voice <id> -> another narrator voice
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'src/voice-lines.json'), 'utf8'));
const outDir = path.join(root, 'public/voice');
const rawDir = path.join(root, 'out/voice-raw');
const timingsFile = path.join(root, 'src/voice-timings.json');
fs.mkdirSync(outDir, {recursive: true});
fs.mkdirSync(rawDir, {recursive: true});
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const dry = argv.includes('--dry');
const vi = argv.indexOf('--voice');
const voiceId = vi >= 0 ? argv[vi + 1] : cfg.narrator.id;
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected';
const FPS = 30;
const MAX_TEMPO = 1.25;
const CHARS_PER_SEC = 15;
const SHOT_SECONDS = fs.readFileSync(path.join(root, 'src/timeline.ts'), 'utf8').match(/SHOT_SECONDS = \[([^\]]+)\]/)[1].split(',').map(Number);
const shotStart = (n) => SHOT_SECONDS.slice(0, n - 1).reduce((a, b) => a + Math.round(b * FPS), 0);
const TOTAL = SHOT_SECONDS.reduce((a, b) => a + Math.round(b * FPS), 0);

const ttsText = (l) => {
	let t = l.text.replace(/\*/g, '');
	if (l.whisper && cfg.model === 'eleven_v3') t = t.replace('«', '[whispers] «');
	return t;
};

const lines = cfg.lines.map((l) => ({...l, at: shotStart(l.shot) + l.offset, tts: ttsText(l)}));
lines.forEach((l, i) => {
	const next = lines[i + 1];
	l.window = (next ? next.at - 3 : TOTAL) - l.at; // frames available for this line
});

const old = fs.existsSync(timingsFile) ? JSON.parse(fs.readFileSync(timingsFile, 'utf8')) : {lines: {}};
const result = {voice: voiceId, model: cfg.model, lines: {}};

const words = (alignment) => {
	const {characters: ch, character_start_times_seconds: st, character_end_times_seconds: en} = alignment;
	const out = [];
	let cur = null;
	for (let i = 0; i < ch.length; i++) {
		if (/\s/.test(ch[i])) {
			if (cur) out.push(cur);
			cur = null;
			continue;
		}
		if (!cur) cur = {w: '', s: st[i], e: en[i]};
		cur.w += ch[i];
		cur.e = en[i];
	}
	if (cur) out.push(cur);
	return out.filter((w) => !/^\[.*\]$/.test(w.w));
};

const save = () => fs.writeFileSync(timingsFile, JSON.stringify(result, null, 1));

for (const [i, line] of lines.entries()) {
	const key = JSON.stringify([line.tts, voiceId, cfg.model, cfg.narrator.settings]);
	const raw = path.join(rawDir, `${line.id}.mp3`);
	const file = path.join(outDir, `${line.id}.mp3`);
	const prev = old.lines[line.id];
	if (dry) {
		const d = line.tts.replace(/\[[^\]]*\]\s*/g, '').length / CHARS_PER_SEC;
		const need = (d * FPS) / line.window;
		console.log(`dry ${line.id} ~${d.toFixed(1)}s / window ${(line.window / FPS).toFixed(1)}s${need > 1 ? `  (x${need.toFixed(2)})` : ''}  ${line.tts}`);
		continue;
	}
	let data = null;
	if (!force && prev && prev.key === key && fs.existsSync(raw)) {
		data = prev;
	} else {
		const body = {
			text: line.tts,
			model_id: cfg.model,
			voice_settings: cfg.narrator.settings,
			language_code: 'ru',
		};
		if (cfg.model !== 'eleven_v3') {
			if (lines[i - 1]) body.previous_text = lines[i - 1].tts;
			if (lines[i + 1]) body.next_text = lines[i + 1].tts;
		}
		const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
			method: 'POST',
			headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			const txt = await res.text();
			console.error(`ElevenLabs error for ${line.id}: ${res.status} ${txt}`);
			if (txt.includes('quota_exceeded')) console.error('-> На аккаунте ElevenLabs закончились символы. Пополните тариф или дождитесь обновления лимита.');
			save();
			process.exit(1);
		}
		const json = await res.json();
		fs.writeFileSync(raw, Buffer.from(json.audio_base64, 'base64'));
		const w = words(json.alignment);
		data = {key, text: line.tts, rawDuration: w.length ? w[w.length - 1].e : 0, rawWords: w};
		console.log(`voice ${line.id} ${data.rawDuration.toFixed(2)}s  ${line.tts}`);
	}
	// fit into the window (speed up slightly if needed)
	const need = (data.rawDuration * FPS) / line.window;
	const tempo = need > 1 ? Math.min(MAX_TEMPO, need) : 1;
	if (need > MAX_TEMPO) console.warn(`! ${line.id} is too long for its window (needs x${need.toFixed(2)}): shorten the text or move the next line`);
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, ...(tempo > 1 ? ['-filter:a', `atempo=${tempo.toFixed(4)}`] : []), '-ar', '44100', '-b:a', '160k', file]);
	result.lines[line.id] = {
		...data,
		tempo,
		duration: data.rawDuration / tempo,
		words: data.rawWords.map((w) => ({w: w.w, s: w.s / tempo, e: w.e / tempo})),
	};
	if (tempo > 1) console.log(`  ${line.id}: sped up x${tempo.toFixed(2)} to fit`);
}
if (!dry) {
	save();
	console.log('wrote', path.relative(root, timingsFile));
}
