import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import envJson from './env.json';
import {makeVoice, Timing, VoiceCfg} from '../voiceCore';
import {shotStart} from './timeline';

const T = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;
const ENV = envJson as Record<string, number[]>;

export const {VOICE, HAS_VOICE, VOICE_CAPTIONS} = makeVoice(cfg as VoiceCfg, T, shotStart, 'voice-q1');

// shot-local frame of a word of shot n's line: the first word starting with `prefix` (case-insensitive), or word #i
const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export const w = (n: number, key: string | number, add = 0) => {
	const line = VOICE.find((l) => l.shot === n);
	if (!line) return 0;
	const s = shotStart(n);
	if (typeof key === 'number') return (line.words[Math.min(key, line.words.length - 1)]?.at ?? s) - s + add;
	const k = clean(key);
	const hit = line.words.find((x) => clean(x.w).startsWith(k));
	return (hit ? hit.at : line.at) - s + add;
};
// where shot n's line ends (shot-local frames)
export const wEnd = (n: number) => {
	const line = VOICE.find((l) => l.shot === n);
	return line ? line.at - shotStart(n) + Math.round(line.duration * 30) : 0;
};

// how far Чоби's jaw opens at shot-local frame f of shot n: the loudness of the recording, and — while there is no
// recording yet — a mouth that opens on every word
export const jawAt = (n: number, f: number): number => {
	const g = shotStart(n) + f;
	for (const l of VOICE) {
		const a = ENV[l.id];
		if (a) {
			const i0 = Math.floor(g - l.at);
			if (i0 < -1 || i0 > a.length) continue;
			const at = (i: number) => (i >= 0 && i < a.length ? a[i] : 0);
			return Math.min(1, ((at(i0 - 1) + 2 * at(i0) + at(i0 + 1)) / 4) * 0.9);
		}
		const end = l.at + Math.round(l.duration * 30);
		if (g < l.at || g > end) continue;
		const k = l.words.findIndex((x, i) => g >= x.at && (i === l.words.length - 1 || g < l.words[i + 1].at));
		if (k < 0) continue;
		const a0 = l.words[k].at;
		const a1 = k + 1 < l.words.length ? l.words[k + 1].at : end;
		const len = Math.max(4, a1 - a0 - 2);
		const t = (g - a0) / len;
		return t > 1 ? 0 : 0.25 + 0.6 * Math.abs(Math.sin(Math.PI * t * (len > 10 ? 2 : 1)));
	}
	return 0;
};
