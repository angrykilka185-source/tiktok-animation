import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {FPS, shotStart} from './timeline';

export type VoiceWord = {w: string; s: number; e: number};
export type VoiceLine = {id: string; shot: number; offset: number; voice: string; text: string; whisper?: boolean; at: number; duration: number; words: VoiceWord[]};

const T = (timings as {lines: Record<string, {duration: number; words: VoiceWord[]}>}).lines;

export const VOICE: VoiceLine[] = (cfg.lines as Omit<VoiceLine, 'at' | 'duration' | 'words'>[])
	.filter((l) => T[l.id])
	.map((l) => ({...l, at: shotStart(l.shot) + l.offset, duration: T[l.id].duration, words: T[l.id].words}));

export const HAS_VOICE = VOICE.length > 0;

// Caption chunks driven by the real word timings of the narrator.
export type CapChunk = {from: number; to: number; words: {w: string; at: number}[]};
export const VOICE_CAPTIONS: CapChunk[] = (() => {
	const out: CapChunk[] = [];
	for (const l of VOICE) {
		if (l.voice !== 'narrator' || l.shot === 16) continue;
		let cur: {w: string; at: number}[] = [];
		const flush = () => {
			if (cur.length) out.push({from: cur[0].at, to: 0, words: cur});
			cur = [];
		};
		l.words.forEach((w) => {
			const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
			if (cur.length >= 3 || len + w.w.length > 20) flush();
			cur.push({w: w.w.toUpperCase(), at: l.at + Math.round(w.s * FPS)});
			if (/[.!?…,—]$/.test(w.w)) flush();
		});
		flush();
		// close the chunks of this line
		const lineEnd = l.at + Math.round(l.duration * FPS) + 10;
		for (let i = out.length - 1; i >= 0 && out[i].to === 0; i--) out[i].to = i + 1 < out.length && out[i + 1].to !== 0 ? out[i + 1].from : lineEnd;
	}
	// chunks of the same line: each ends where the next begins
	for (let i = 0; i < out.length - 1; i++) if (out[i].to > out[i + 1].from) out[i].to = out[i + 1].from;
	return out;
})();
