// Generates the voice-over with ElevenLabs (text-to-speech with timestamps).
// Writes public/voice/<id>.mp3 and src/voice-timings.json (word timings for captions).
// Key: ELEVENLABS_API_KEY env var (or injected by a proxy).
//   node scripts/make-voice.mjs            -> only missing/changed lines
//   node scripts/make-voice.mjs --force    -> regenerate everything
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'src/voice-lines.json'), 'utf8'));
const outDir = path.join(root, 'public/voice');
const timingsFile = path.join(root, 'src/voice-timings.json');
fs.mkdirSync(outDir, {recursive: true});
const force = process.argv.includes('--force');
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected';
const FPS = 30;
const SHOT_SECONDS = [6, 4, 5, 6, 5, 6, 6, 4, 5, 6, 6, 4, 6, 5, 6, 10];
const shotStart = (n) => SHOT_SECONDS.slice(0, n - 1).reduce((a, b) => a + b, 0) * FPS;

const old = fs.existsSync(timingsFile) ? JSON.parse(fs.readFileSync(timingsFile, 'utf8')) : {lines: {}};
const result = {lines: {}};

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
	return out;
};

for (const line of cfg.lines) {
	const voice = cfg.voices[line.voice];
	const hash = crypto.createHash('md5').update(JSON.stringify([line.text, voice, cfg.model])).digest('hex').slice(0, 10);
	const file = path.join(outDir, `${line.id}.mp3`);
	const prev = old.lines[line.id];
	if (!force && prev && prev.hash === hash && fs.existsSync(file)) {
		result.lines[line.id] = prev;
		continue;
	}
	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}/with-timestamps?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
		body: JSON.stringify({text: line.text, model_id: cfg.model, voice_settings: voice.settings, language_code: 'ru'}),
	});
	if (!res.ok) {
		console.error(`ElevenLabs error for ${line.id}: ${res.status} ${await res.text()}`);
		process.exit(1);
	}
	const data = await res.json();
	fs.writeFileSync(file, Buffer.from(data.audio_base64, 'base64'));
	const w = words(data.alignment);
	const dur = w.length ? w[w.length - 1].e : 0;
	result.lines[line.id] = {hash, duration: dur, words: w};
	console.log(`voice ${line.id} ${dur.toFixed(2)}s  ${line.text}`);
}

// sanity check: a line must end before the next one starts and before its shot ends
const placed = cfg.lines.map((l) => ({...l, at: shotStart(l.shot) + l.offset, end: shotStart(l.shot) + l.offset + Math.ceil(result.lines[l.id].duration * FPS)}));
placed.forEach((l, i) => {
	const next = placed[i + 1];
	const shotEnd = shotStart(l.shot) + SHOT_SECONDS[l.shot - 1] * FPS;
	if (next && l.end > next.at) console.warn(`! ${l.id} overlaps ${next.id} by ${l.end - next.at} frames`);
	if (l.end > shotEnd + 6) console.warn(`! ${l.id} runs ${l.end - shotEnd} frames past the end of shot ${l.shot}`);
});
fs.writeFileSync(timingsFile, JSON.stringify(result, null, 1));
console.log('wrote', path.relative(root, timingsFile));
