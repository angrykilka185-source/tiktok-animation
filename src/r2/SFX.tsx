import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 the hook: the fist in slow motion; the rewind
	{at: 0, file: 'heart_big', vol: 0.6},
	{at: 30, file: 'heart_big', vol: 0.6},
	{at: 60, file: 'heart_big', vol: 0.6},
	{at: 4, file: 'slowdown', vol: 0.5},
	{at: 100, file: 'rewind', vol: 0.8},
	{at: 112, file: 'whoosh', vol: 0.7},
	// 2 you knock on the iron door
	{at: s(2) + 30, file: 'knock', vol: 0.9},
	{at: s(2) + 60, file: 'slam', vol: 0.2},
	// 3 the door opens: Гвоздь
	{at: s(3), file: 'creak', vol: 0.7},
	{at: s(3) + 18, file: 'pop', vol: 0.4},
	{at: s(3) + 60, file: 'pop', vol: 0.4},
	// 4 «Я хочу к вам» — silence
	{at: s(4) + 8, file: 'pop', vol: 0.4},
	{at: s(4) + 60, file: 'heart', vol: 0.4, len: 48},
	// 5 the gym
	...W(5, 0),
	{at: s(5) + 20, file: 'slam', vol: 0.25},
	{at: s(5) + 70, file: 'slam', vol: 0.25},
	// 6 Сивый rises
	{at: s(6) + 10, file: 'steps_slow', vol: 0.6, len: 60},
	{at: s(6) + 40, file: 'stamp', vol: 0.5},
	// 7 «один удар»
	{at: s(7) + 60, file: 'stamp', vol: 0.8},
	{at: s(7) + 62, file: 'heart_big', vol: 0.5},
	// 8 the circle; the sleeve
	{at: s(8), file: 'steps', vol: 0.45, len: 50},
	{at: s(8) + 54, file: 'cloth', vol: 0.7},
	// 9 fists
	{at: s(9), file: 'heart', vol: 0.6, len: 84},
	// 10 the blow
	{at: s(10) + 18, file: 'whoosh', vol: 0.7},
	{at: s(10) + 32, file: 'slam', vol: 1},
	{at: s(10) + 32, file: 'boom', vol: 0.8},
	// 11 ringing in the ears; a step back
	{at: s(11), file: 'slowdown', vol: 0.6},
	{at: s(11) + 80, file: 'floorcreak', vol: 0.5},
	// 12 …and you stand
	{at: s(12) + 20, file: 'heart_big', vol: 0.6},
	// 13 «Устоял. Теперь ты наш»
	{at: s(13) + 6, file: 'pop', vol: 0.4},
	{at: s(13) + 30, file: 'swell', vol: 0.4},
	// 14 «Здесь ты — Лавр»
	{at: s(14) + 40, file: 'tear', vol: 0.6},
	{at: s(14) + 62, file: 'stamp', vol: 1},
	{at: s(14) + 62, file: 'boom', vol: 0.6},
	// 15 handshakes
	{at: s(15) + 10, file: 'pat', vol: 0.6},
	{at: s(15) + 54, file: 'pat', vol: 0.6},
	{at: s(15) + 96, file: 'pat', vol: 0.6},
	// 16 «своих не сдают»
	{at: s(16) + 6, file: 'pat', vol: 0.7},
	// 17 mom: «опять упал?»
	{at: s(17) + 4, file: 'plate', vol: 0.3},
	{at: s(17) + 30, file: 'pop', vol: 0.4},
	// 18 the morning: Сазон
	...W(18, 0),
	{at: s(18) + 50, file: 'pop', vol: 0.4},
	// 19 «Я теперь с Тяп-ляп» — «Докажи»
	{at: s(19) + 10, file: 'pop', vol: 0.4},
	{at: s(19) + 76, file: 'laugh', vol: 0.4, len: 40},
	{at: s(19) + 88, file: 'pop', vol: 0.45},
	// 20 finale
	{at: s(20), file: 'boom', vol: 1},
	{at: s(20) + 8, file: 'pop', vol: 0.5},
	{at: s(20) + 78, file: 'pop', vol: 0.5},
	{at: s(20) + 150, file: 'beep', vol: 0.8},
	{at: s(20) + 180, file: 'beep', vol: 0.8},
	{at: s(20) + 210, file: 'beep', vol: 0.8},
	{at: s(20) + 236, file: 'beep_final', vol: 0.9},
	{at: s(20) + 252, file: 'whoosh', vol: 0.7},
	// rule plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way (no dead air between the words), stronger in the basement (night)
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(18) ? 0.3 : 0.2)}];

export const SFXR2: React.FC<{r: Remap}> = ({r}) => (
	<>
		{BEDS.map((b, k) => {
			const from = Math.round(r.fwd(b.a));
			const len = Math.round(r.fwd(b.b)) - from;
			return (
				<Sequence key={k} from={from} durationInFrames={len} name={`sfx bed ${b.file}`}>
					<Audio src={staticFile(`sfx/${b.file}.wav`)} loop volume={(f) => b.vol(r.inv(from + f)) * interpolate(f, [0, 20, len - 30, len - 1], [0, 1, 1, 0], clampX)} />
				</Sequence>
			);
		})}
		{CUES.map((c, i) => {
			const at = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - at, r.total - at));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={i} from={at} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], clampX) : vol)} />
				</Sequence>
			);
		})}
		{VOICE.filter((l) => l.hasAudio).map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.min(Math.ceil(l.duration * 30) + 20, r.total - l.at)} name={`voice ${l.id}`}>
				<Audio src={staticFile(l.src)} volume={1} />
			</Sequence>
		))}
	</>
);
