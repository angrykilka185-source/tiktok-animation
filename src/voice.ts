import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {FPS, shotStart} from './timeline';

// ---------------------------------------------------------------------------
// Narration lines + word timings. Word timings come from ElevenLabs
// (src/voice-timings.json); without audio they are estimated so the captions
// still work as a preview.
// ---------------------------------------------------------------------------

export type CapWord = {w: string; at: number; red: boolean; quote: boolean};
export type VoiceLine = {
	id: string;
	shot: number;
	offset: number;
	text: string;
	nocap?: boolean;
	whisper?: boolean;
	at: number;
	duration: number; // seconds
	hasAudio: boolean;
	words: CapWord[];
};

type Timing = {text: string; duration: number; words: {w: string; s: number; e: number}[]};
const T = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;

const ttsText = (text: string, whisper?: boolean) => {
	let t = text.replace(/\*/g, '');
	if (whisper && cfg.model === 'eleven_v3') t = t.replace('«', '[whispers] «');
	return t;
};

// split the marked-up text into caption tokens with colour flags
const tokens = (text: string) => {
	const out: {w: string; red: boolean; quote: boolean}[] = [];
	let red = false;
	let quote = false;
	let cur = {w: '', red: false, quote: false};
	const flush = () => {
		if (cur.w) out.push(cur);
		cur = {w: '', red: false, quote: false};
	};
	for (const ch of text) {
		if (/\s/.test(ch)) {
			flush();
			continue;
		}
		if (ch === '*') {
			red = !red;
			continue;
		}
		if (ch === '«') quote = true;
		cur.w += ch;
		if (red && /[\p{L}\p{N}]/u.test(ch)) cur.red = true;
		if (quote) cur.quote = true;
		if (ch === '»') quote = false;
	}
	flush();
	return out;
};

const CHARS_PER_SEC = 14;

export const VOICE: VoiceLine[] = (cfg.lines as {id: string; shot: number; offset: number; text: string; nocap?: boolean; whisper?: boolean}[]).map((l) => {
	const at = shotStart(l.shot) + l.offset;
	const tk = tokens(l.text);
	const tts = ttsText(l.text, l.whisper);
	const t = T[l.id];
	const real = !!t && t.text === tts && t.words.length > 0;
	let words: CapWord[];
	let duration: number;
	if (real) {
		duration = t.duration;
		const ws = t.words;
		words = tk.map((k, i) => {
			const src = ws.length === tk.length ? ws[i] : ws[Math.min(ws.length - 1, Math.floor((i * ws.length) / tk.length))];
			return {...k, at: at + Math.round(src.s * FPS)};
		});
	} else {
		duration = tts.replace(/\[[^\]]*\]\s*/g, '').length / CHARS_PER_SEC;
		const plain = tk.map((k) => k.w);
		const total = plain.join(' ').length;
		let pos = 0;
		words = tk.map((k) => {
			const w = {...k, at: at + Math.round((pos / total) * duration * FPS)};
			pos += k.w.length + 1;
			return w;
		});
	}
	return {...l, at, duration, hasAudio: real, words};
});

export const HAS_VOICE = VOICE.some((l) => l.hasAudio);

// caption chunks: up to 3 words / 20 characters, break after punctuation
export type CapChunk = {from: number; to: number; words: CapWord[]};
export const VOICE_CAPTIONS: CapChunk[] = (() => {
	const out: CapChunk[] = [];
	for (const l of VOICE) {
		if (l.nocap) continue;
		const lineEnd = l.at + Math.round(l.duration * FPS) + 12;
		const start = out.length;
		let cur: CapWord[] = [];
		const flush = () => {
			if (cur.length) out.push({from: cur[0].at, to: 0, words: cur});
			cur = [];
		};
		l.words.forEach((w) => {
			const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
			if (cur.length >= 3 || (cur.length > 0 && len + w.w.length > 20)) flush();
			cur.push(w);
			if (/[.!?…,—:]»?$/.test(w.w)) flush();
		});
		flush();
		for (let i = start; i < out.length; i++) out[i].to = i + 1 < out.length ? out[i + 1].from : lineEnd;
	}
	for (let i = 0; i < out.length - 1; i++) if (out[i].to > out[i + 1].from) out[i].to = out[i + 1].from;
	return out;
})();
