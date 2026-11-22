import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {makeVoice, Timing, VoiceCfg} from '../voiceCore';
import {shotStart} from './timeline';

const T = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;

export const {VOICE, HAS_VOICE, VOICE_CAPTIONS} = makeVoice(cfg as VoiceCfg, T, shotStart, 'voice-c1');

// shot-local frame of a word of shot n's line: the first word starting with `prefix` (case-insensitive), or word #i.
// The scenes time their beats on the words, so they follow the voice whatever its pace.
const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
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
