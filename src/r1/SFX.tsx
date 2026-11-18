import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 the hook: tomorrow 19:00 at the garages; the rewind
	{at: 0, file: 'heart', vol: 0.5, len: 130},
	{at: 2, file: 'flicker', vol: 0.4},
	{at: 6, file: 'stamp', vol: 0.9},
	{at: 100, file: 'swell', vol: 0.4},
	{at: 120, file: 'rewind', vol: 0.8},
	{at: 132, file: 'whoosh', vol: 0.7},
	// 2 the blackboard: «ИГОРЕЧЕК» in chalk
	{at: s(2) + 26, file: 'typing', vol: 0.35, len: 38},
	{at: s(2) + 70, file: 'laugh', vol: 0.4, len: 22},
	// 3 1976: you, Igor Lavrov; the yard
	{at: s(3) + 2, file: 'boom', vol: 0.5},
	{at: s(3) + 50, file: 'pop', vol: 0.4},
	...W(3, 96),
				// 4 «бьют каждый день»: a shove
	{at: s(4) + 24, file: 'whoosh', vol: 0.4},
	{at: s(4) + 30, file: 'bump', vol: 0.8},
	{at: s(4) + 32, file: 'heart', vol: 0.4, len: 50},
	// 5 mom: «Игоречек!»
	{at: s(5) + 2, file: 'plate', vol: 0.25},
	{at: s(5) + 24, file: 'pop', vol: 0.4},
	// 6 the school gate: «Игоречек, шапку надень!»
	{at: s(6), file: 'steps', vol: 0.35, len: 100},
	{at: s(6) + 98, file: 'pop', vol: 0.45},
	{at: s(6) + 110, file: 'laugh', vol: 0.3, len: 50},
	{at: s(6) + 136, file: 'cloth', vol: 0.5},
	// 7 Сазон; the whole school
	{at: s(7) + 18, file: 'stamp', vol: 0.45},
	...W(7, 72),
	{at: s(7) + 76, file: 'pop', vol: 0.4},
	{at: s(7) + 88, file: 'pop', vol: 0.4},
	{at: s(7) + 100, file: 'pop', vol: 0.4},
	{at: s(7) + 112, file: 'pop', vol: 0.4},
	{at: s(7) + 76, file: 'laugh', vol: 0.35, len: 64},
	// 8 the hat into the puddle; everybody laughs
	{at: s(8) + 32, file: 'cloth', vol: 0.6},
	{at: s(8) + 56, file: 'whoosh', vol: 0.5},
	{at: s(8) + 86, file: 'water', vol: 0.8, len: 43},
	{at: s(8) + 90, file: 'laugh', vol: 0.55, len: 39},
	// 9 the cloakroom: «Гони 20 копеек!»
	{at: s(9), file: 'steps_slow', vol: 0.45, len: 40},
	{at: s(9) + 20, file: 'bump', vol: 0.4},
	{at: s(9) + 68, file: 'heart', vol: 0.45, len: 55},
	// 10 the coin; the punch
	{at: s(10) + 30, file: 'tick', vol: 0.6},
	{at: s(10) + 103, file: 'whoosh', vol: 0.5},
	{at: s(10) + 110, file: 'slam', vol: 0.7},
	{at: s(10) + 112, file: 'heart_big', vol: 0.5},
	// 11 mom sees the bruise
	{at: s(11) + 4, file: 'plate', vol: 0.25},
	{at: s(11) + 58, file: 'gasp', vol: 0.4},
	{at: s(11) + 140, file: 'heart', vol: 0.4, len: 23},
	// 12 Тяп-ляп
	{at: s(12), file: 'howl', vol: 0.3},
	{at: s(12), file: 'steps_slow', vol: 0.6, len: 135},
	{at: s(12) + 98, file: 'boom', vol: 0.9},
	{at: s(12) + 98, file: 'stamp', vol: 0.6},
	// 13 they walk; Сазон looks down
	{at: s(13), file: 'steps', vol: 0.5, len: 112},
	...W(13, 112),
	{at: s(13) + 116, file: 'heart', vol: 0.4, len: 49},
	// 14 Гвоздь
	{at: s(14) + 16, file: 'stamp', vol: 0.45},
	{at: s(14) + 10, file: 'swell', vol: 0.3},
	// 15 the garages: «Опять Сазон гоняет?»
	{at: s(15), file: 'steps', vol: 0.4, len: 44},
	{at: s(15) + 64, file: 'pop', vol: 0.35},
	// 16 «Пришьёшься к нам…»
	{at: s(16) + 4, file: 'pat', vol: 0.6},
	{at: s(16) + 20, file: 'swell', vol: 0.35},
	// 17 «Зашёл — значит, навсегда»
	{at: s(17) + 88, file: 'stamp', vol: 0.9},
	{at: s(17) + 90, file: 'heart_big', vol: 0.6},
	// 18 alone under the lamp
	{at: s(18) + 8, file: 'flicker', vol: 0.5},
	{at: s(18) + 78, file: 'steps', vol: 0.3, len: 80},
	{at: s(18) + 100, file: 'howl', vol: 0.25},
	// 19 night: «Спи, Игоречек…»
	{at: s(19) + 2, file: 'tick', vol: 0.25},
	{at: s(19) + 84, file: 'whisper', vol: 0.35},
	// 20 the morning: Сазон with the coin
	...W(20, 0),
	{at: s(20) + 20, file: 'tick', vol: 0.35},
	{at: s(20) + 48, file: 'tick', vol: 0.35},
	{at: s(20) + 76, file: 'tick', vol: 0.35},
	// 21 finale
	{at: s(21), file: 'boom', vol: 1},
	{at: s(21) + 8, file: 'pop', vol: 0.5},
	{at: s(21) + 78, file: 'pop', vol: 0.5},
	{at: s(21) + 150, file: 'beep', vol: 0.8},
	{at: s(21) + 180, file: 'beep', vol: 0.8},
	{at: s(21) + 210, file: 'beep', vol: 0.8},
	{at: s(21) + 236, file: 'beep_final', vol: 0.9},
	{at: s(21) + 252, file: 'whoosh', vol: 0.7},
	// humiliation plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way (no dead air between the words), a bit stronger from the evening on (Тяп-ляп)
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(12) && o > s(2) ? 0.2 : 0.3)}];

export const SFXR1: React.FC<{r: Remap}> = ({r}) => (
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
