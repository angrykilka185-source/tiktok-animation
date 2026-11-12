// Voice-over with ElevenLabs (text-to-speech with timestamps), one narrator like the reference.
// Writes public/voice/<id>.mp3 and src/voice-timings.json (word timings for the captions).
// Key: ELEVENLABS_API_KEY env var, or injected by the session proxy.
//   npm run voice                 -> only new/changed lines
//   npm run voice -- --force      -> regenerate everything
//   npm run voice -- --voice <id> -> try another narrator voice (regenerates all)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cfgFile = path.join(root, 'src/voice-lines.json');
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const outDir = path.join(root, 'public/voice');
const timingsFile = path.join(root, 'src/voice-timings.json');
fs.mkdirSync(outDir, {recursive: true});
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const dry = argv.includes('--dry'); // no API calls: print texts and check timing with estimated durations
const vi = argv.indexOf('--voice');
const voiceId = vi >= 0 ? argv[vi + 1] : cfg.narrator.id;
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected';
const FPS = 30;
const SHOT_SECONDS = [6, 4, 5, 6, 5, 6, 6, 4, 5, 6, 6, 4, 6, 5, 6, 10];
const shotStart = (n) => SHOT_SECONDS.slice(0, n - 1).reduce((a, b) => a + b, 0) * FPS;

// text sent to the TTS: no caption markup; whisper tag before the quote (eleven_v3 audio tags)
export const ttsText = (l, model) => {
	let t = l.text.replace(/\*/g, '');
	if (l.whisper && model === 'eleven_v3') t = t.replace('«', '[whispers] «');
	return t;
};

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
	return out.filter((w) => !/^\[.*\]$/.test(w.w)); // drop audio tags like [whispers]
};

for (const line of cfg.lines) {
	const text = ttsText(line, cfg.model);
	const key = JSON.stringify([text, voiceId, cfg.model, cfg.narrator.settings]);
	const file = path.join(outDir, `${line.id}.mp3`);
	const prev = old.lines[line.id];
	if (dry) {
		result.lines[line.id] = {key, text, duration: text.replace(/\[[^\]]*\]\s*/g, '').length / 14, words: [], estimated: true};
		console.log(`dry ${line.id} ~${result.lines[line.id].duration.toFixed(1)}s  ${text}`);
		continue;
	}
	if (!force && prev && prev.key === key && fs.existsSync(file)) {
		result.lines[line.id] = prev;
		continue;
	}
	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
		body: JSON.stringify({text, model_id: cfg.model, voice_settings: cfg.narrator.settings, language_code: 'ru'}),
	});
	if (!res.ok) {
		const body = await res.text();
		console.error(`ElevenLabs error for ${line.id}: ${res.status} ${body}`);
		if (body.includes('quota_exceeded')) console.error('-> На аккаунте ElevenLabs закончились символы. Пополните тариф или дождитесь обновления лимита.');
		fs.writeFileSync(timingsFile, JSON.stringify({...result, lines: {...old.lines, ...result.lines}}, null, 1));
		process.exit(1);
	}
	const data = await res.json();
	fs.writeFileSync(file, Buffer.from(data.audio_base64, 'base64'));
	const w = words(data.alignment);
	const dur = w.length ? w[w.length - 1].e : 0;
	result.lines[line.id] = {key, text, duration: dur, words: w};
	console.log(`voice ${line.id} ${dur.toFixed(2)}s  ${text}`);
}

// fit check: a line must end before the next one starts and close to the end of its shot
const placed = cfg.lines.map((l) => {
	const at = shotStart(l.shot) + l.offset;
	return {...l, at, end: at + Math.ceil((result.lines[l.id]?.duration ?? 0) * FPS)};
});
let ok = true;
placed.forEach((l, i) => {
	const next = placed[i + 1];
	const shotEnd = shotStart(l.shot) + SHOT_SECONDS[l.shot - 1] * FPS;
	if (next && l.end > next.at - 2) {
		ok = false;
		console.warn(`! ${l.id} overlaps ${next.id} by ${l.end - next.at + 2} frames`);
	}
	if (l.end > shotEnd + 20) console.warn(`! ${l.id} runs ${l.end - shotEnd} frames past the end of shot ${l.shot}`);
});
if (!dry) fs.writeFileSync(timingsFile, JSON.stringify(result, null, 1));
console.log(ok ? 'all lines fit' : 'some lines overlap: shift offsets in src/voice-lines.json');
if (!dry) console.log('wrote', path.relative(root, timingsFile));
