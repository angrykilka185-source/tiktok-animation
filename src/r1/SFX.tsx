import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 1976: you, Igor Lavrov; the yard
	{at: 4, file: 'boom', vol: 0.6},
	{at: 52, file: 'pop', vol: 0.4},
	...W(1, 104),
	{at: 132, file: 'pop', vol: 0.35},
	{at: 150, file: 'pop', vol: 0.35},
	{at: 168, file: 'pop', vol: 0.35},
	{at: 168, file: 'whistle', vol: 0.2},
	// 2 «бьют каждый день»: a shove
	{at: s(2) + 24, file: 'whoosh', vol: 0.4},
	{at: s(2) + 30, file: 'bump', vol: 0.8},
	{at: s(2) + 32, file: 'heart', vol: 0.4, len: 50},
	// 3 mom: «Игоречек!»
	{at: s(3) + 2, file: 'plate', vol: 0.25},
	{at: s(3) + 10, file: 'pop', vol: 0.4},
	// 4 the school gate: «Игоречек, шапку надень!»
	{at: s(4), file: 'steps', vol: 0.35, len: 60},
	{at: s(4) + 30, file: 'pop', vol: 0.45},
	{at: s(4) + 62, file: 'laugh', vol: 0.3, len: 60},
	{at: s(4) + 118, file: 'cloth', vol: 0.5},
	// 5 Сазон; the whole school
	{at: s(5) + 18, file: 'stamp', vol: 0.45},
	...W(5, 72),
	{at: s(5) + 78, file: 'pop', vol: 0.4},
	{at: s(5) + 94, file: 'pop', vol: 0.4},
	{at: s(5) + 110, file: 'pop', vol: 0.4},
	{at: s(5) + 124, file: 'pop', vol: 0.4},
	{at: s(5) + 80, file: 'laugh', vol: 0.35, len: 70},
	// 6 the hat into the puddle; everybody laughs
	{at: s(6) + 8, file: 'cloth', vol: 0.6},
	{at: s(6) + 30, file: 'whoosh', vol: 0.5},
	{at: s(6) + 70, file: 'water', vol: 0.8, len: 50},
	{at: s(6) + 74, file: 'laugh', vol: 0.55, len: 73},
	// 7 the cloakroom: «Гони 20 копеек!»
	{at: s(7), file: 'steps_slow', vol: 0.45, len: 40},
	{at: s(7) + 20, file: 'bump', vol: 0.4},
	{at: s(7) + 30, file: 'heart', vol: 0.45, len: 80},
	// 8 the coin; the punch
	{at: s(8) + 30, file: 'tick', vol: 0.6},
	{at: s(8) + 79, file: 'whoosh', vol: 0.5},
	{at: s(8) + 86, file: 'slam', vol: 0.7},
	{at: s(8) + 88, file: 'heart_big', vol: 0.5},
	// 9 mom sees the bruise
	{at: s(9) + 4, file: 'plate', vol: 0.25},
	{at: s(9) + 30, file: 'gasp', vol: 0.4},
	{at: s(9) + 96, file: 'heart', vol: 0.4, len: 40},
	// 10 Тяп-ляп
	{at: s(10), file: 'howl', vol: 0.3},
	{at: s(10), file: 'steps_slow', vol: 0.6, len: 135},
	{at: s(10) + 98, file: 'boom', vol: 0.9},
	{at: s(10) + 98, file: 'stamp', vol: 0.6},
	// 11 they walk; Сазон looks down
	{at: s(11), file: 'steps', vol: 0.5, len: 140},
	...W(11, 140),
	{at: s(11) + 146, file: 'heart', vol: 0.4, len: 60},
	// 12 Гвоздь
	{at: s(12) + 16, file: 'stamp', vol: 0.45},
	{at: s(12) + 10, file: 'swell', vol: 0.3},
	// 13 the garages: «Опять Сазон гоняет?»
	{at: s(13), file: 'steps', vol: 0.4, len: 44},
	{at: s(13) + 50, file: 'pop', vol: 0.35},
	// 14 «Пришьёшься к нам…»
	{at: s(14) + 4, file: 'pat', vol: 0.6},
	{at: s(14) + 20, file: 'swell', vol: 0.35},
	// 15 «Зашёл — значит, навсегда»
	{at: s(15) + 72, file: 'stamp', vol: 0.9},
	{at: s(15) + 74, file: 'heart_big', vol: 0.6},
	// 16 alone under the lamp
	{at: s(16) + 8, file: 'flicker', vol: 0.5},
	{at: s(16) + 30, file: 'steps', vol: 0.3, len: 110},
	{at: s(16) + 60, file: 'howl', vol: 0.25},
	// 17 night: «Спи, Игоречек…»
	{at: s(17) + 2, file: 'tick', vol: 0.25},
	{at: s(17) + 56, file: 'whisper', vol: 0.35},
	// 18 the morning: Сазон with the coin
	...W(18, 0),
	{at: s(18) + 20, file: 'tick', vol: 0.35},
	{at: s(18) + 48, file: 'tick', vol: 0.35},
	{at: s(18) + 76, file: 'tick', vol: 0.35},
	// 19 finale
	{at: s(19), file: 'boom', vol: 1},
	{at: s(19) + 8, file: 'pop', vol: 0.5},
	{at: s(19) + 78, file: 'pop', vol: 0.5},
	{at: s(19) + 150, file: 'beep', vol: 0.8},
	{at: s(19) + 180, file: 'beep', vol: 0.8},
	{at: s(19) + 210, file: 'beep', vol: 0.8},
	{at: s(19) + 236, file: 'beep_final', vol: 0.9},
	{at: s(19) + 252, file: 'whoosh', vol: 0.7},
	// humiliation plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way (no dead air between the words), a bit stronger from the evening on (Тяп-ляп)
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(10) ? 0.2 : 0.3)}];

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
