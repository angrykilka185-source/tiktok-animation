// ---------------------------------------------------------------------------
// Narration lines + word timings, shared by all episodes.
// Word timings come from the fitted voice-over (scripts/fit-voiceover.py) or
// ElevenLabs; without audio they are estimated so the captions still work.
// ---------------------------------------------------------------------------

export type CapWord = {w: string; at: number; red: boolean; quote: boolean};
export type VoiceLine = {
	id: string;
	shot: number;
	offset: number;
	text: string;
	nocap?: boolean;
	whisper?: boolean;
	reuse?: string;
	at: number;
	duration: number; // seconds
	hasAudio: boolean;
	src: string; // audio file in public/
	words: CapWord[];
};
export type CapChunk = {from: number; to: number; words: CapWord[]};

export type Timing = {text: string; duration: number; at?: number; words: {w: string; s: number; e: number}[]};
export type LineCfg = {id: string; shot: number; offset: number; text: string; nocap?: boolean; whisper?: boolean; reuse?: string};
export type VoiceCfg = {model: string; lines: LineCfg[]};

const CHARS_PER_SEC = 15;

export const ttsText = (text: string, whisper: boolean | undefined, model: string) => {
	let t = text.replace(/\*/g, '');
	if (whisper && model === 'eleven_v3') t = t.replace('«', '[whispers] «');
	return t;
};

// split the marked-up text into caption tokens with colour flags (*red*, «quote»)
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

export const makeVoice = (
	cfg: VoiceCfg,
	timings: Record<string, Timing>,
	shotStart: (n: number) => number,
	audioDir: string,
	reused: {timings: Record<string, Timing>; audioDir: string} | null = null,
	fps = 30,
) => {
	const VOICE: VoiceLine[] = cfg.lines.map((l) => {
		const tk = tokens(l.text);
		const tts = ttsText(l.text, l.whisper, cfg.model);
		const fromOther = !!l.reuse && !!reused;
		const t = fromOther ? reused!.timings[l.reuse!] : timings[l.id];
		const real = !!t && t.text === tts && t.words.length > 0;
		const at = real && typeof t.at === 'number' ? t.at : shotStart(l.shot) + l.offset;
		let words: CapWord[];
		let duration: number;
		if (real) {
			duration = t.duration;
			const ws = t.words;
			words = tk.map((k, i) => {
				const src = ws.length === tk.length ? ws[i] : ws[Math.min(ws.length - 1, Math.floor((i * ws.length) / tk.length))];
				return {...k, at: at + Math.round(src.s * fps)};
			});
		} else {
			duration = tts.replace(/\[[^\]]*\]\s*/g, '').length / CHARS_PER_SEC;
			const total = tk.map((k) => k.w).join(' ').length;
			let pos = 0;
			words = tk.map((k) => {
				const w = {...k, at: at + Math.round((pos / total) * duration * fps)};
				pos += k.w.length + 1;
				return w;
			});
		}
		const src = fromOther ? `${reused!.audioDir}/${l.reuse}.mp3` : `${audioDir}/${l.id}.mp3`;
		return {...l, at, duration, hasAudio: real, src, words};
	});

	const HAS_VOICE = VOICE.some((l) => l.hasAudio && !l.reuse);

	// caption chunks: up to 3 words / 20 characters, break after punctuation
	const VOICE_CAPTIONS: CapChunk[] = (() => {
		const out: CapChunk[] = [];
		for (const l of VOICE) {
			if (l.nocap) continue;
			const lineEnd = l.at + Math.round(l.duration * fps) + 12;
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

	return {VOICE, HAS_VOICE, VOICE_CAPTIONS};
};
