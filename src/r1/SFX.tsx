import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 1976: the yard, the garages, the brick factory
	{at: 4, file: 'boom', vol: 0.6},
	...W(1, 46, 100),
	{at: 103, file: 'pop', vol: 0.35},
	{at: 120, file: 'pop', vol: 0.35},
	{at: 140, file: 'pop', vol: 0.35},
	{at: 140, file: 'whistle', vol: 0.25},
	// 2 «Ты с какого района?» every day
	{at: s(2), file: 'steps', vol: 0.45, len: 110},
	{at: s(2) + 8, file: 'pop', vol: 0.3},
	{at: s(2) + 44, file: 'pop', vol: 0.3},
	{at: s(2) + 86, file: 'pop', vol: 0.45},
	// 3 cornered at the garages; the twenty kopecks
	{at: s(3), file: 'bump', vol: 0.5},
	{at: s(3) + 6, file: 'heart', vol: 0.5, len: 100},
	{at: s(3) + 82, file: 'cloth', vol: 0.6},
	{at: s(3) + 112, file: 'whoosh', vol: 0.3},
	{at: s(3) + 136, file: 'tick', vol: 0.5},
	// 4 Гвоздь; the strangers leave
	{at: s(4) + 12, file: 'steps_slow', vol: 0.6, len: 40},
	{at: s(4) + 39, file: 'stamp', vol: 0.5},
	{at: s(4) + 95, file: 'steps', vol: 0.4, len: 40},
	// 5 the coin back; «Пришьёшься к нам»
	{at: s(5) + 18, file: 'tick', vol: 0.6},
	...W(5, 44),
	{at: s(5) + 55, file: 'swell', vol: 0.4},
	// 6 evening behind the garages
	{at: s(6), file: 'howl', vol: 0.25},
	{at: s(6) + 110, file: 'heart_big', vol: 0.6},
	// 7–8 the rules
	{at: s(7) + 4, file: 'pat', vol: 0.6},
	{at: s(8) + 77, file: 'snap', vol: 0.5},
	// 9 mom
	{at: s(9) + 4, file: 'plate', vol: 0.3},
	{at: s(9) + 73, file: 'heart', vol: 0.45, len: 40},
	// 10 a week later: «Завтра идём на Заводских»
	...W(10, 0),
	{at: s(10) + 72, file: 'stamp', vol: 0.45},
	{at: s(10) + 99, file: 'heart_big', vol: 0.7},
	// 11 Санька, the photo
	...W(11, 0, 80),
	{at: s(11) + 82, file: 'switch', vol: 0.4},
	// 12 a knock on the window at night
	{at: s(12) + 17, file: 'knock', vol: 0.8},
	{at: s(12) + 44, file: 'gasp', vol: 0.4},
	{at: s(12) + 94, file: 'whisper', vol: 0.35},
	// 13 finale
	{at: s(13), file: 'boom', vol: 1},
	{at: s(13) + 8, file: 'pop', vol: 0.5},
	{at: s(13) + 78, file: 'pop', vol: 0.5},
	{at: s(13) + 150, file: 'beep', vol: 0.8},
	{at: s(13) + 180, file: 'beep', vol: 0.8},
	{at: s(13) + 210, file: 'beep', vol: 0.8},
	{at: s(13) + 236, file: 'beep_final', vol: 0.9},
	{at: s(13) + 252, file: 'whoosh', vol: 0.7},
	// rule plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way (no dead air between the words), a bit stronger from the evening on
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(6) ? 0.2 : 0.3)}];

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
