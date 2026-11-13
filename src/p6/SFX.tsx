import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.32}));

const CUES: Cue[] = [
	// 1 same opening as part 1
	{at: 72, file: 'keys', vol: 0.8},
	{at: 102, file: 'lock'},
	{at: 116, file: 'creak', vol: 0.8},
	{at: 134, file: 'pop', vol: 0.35},
	...W(1, 70, 120, 156),
	// 2-3 recap of part 5
	{at: s(2), file: 'rewind', vol: 0.5},
	...W(2, 58),
	{at: s(3), file: 'rewind', vol: 0.3},
	...W(3, 64),
	// 4 title
	{at: s(4), file: 'boom', vol: 0.9},
	// 5 jacket over pyjamas, tiptoe
	{at: s(5) + 30, file: 'cloth', vol: 0.7},
	{at: s(5) + 72, file: 'steps_slow', vol: 0.45, len: 51},
	// 6 mom asleep, the lock that must not click
	{at: s(6), file: 'breath', vol: 0.3, len: 27},
	{at: s(6) + 27, file: 'heart', vol: 0.5, len: 81},
	{at: s(6) + 90, file: 'lock', vol: 0.12},
	// 7 the camera
	{at: s(7) + 4, file: 'recbeep', vol: 0.7},
	{at: s(7) + 34, file: 'pop', vol: 0.4},
	// 8 the empty yard
	{at: s(8) + 46, file: 'flicker', vol: 0.5, len: 26},
	{at: s(8) + 80, file: 'howl', vol: 0.8},
	// 9 hiding behind the cars
	{at: s(9), file: 'steps_slow', vol: 0.4, len: 66},
	// 10 garage 17
	{at: s(10), file: 'heart', vol: 0.4, len: 135},
	{at: s(10) + 26, file: 'pop', vol: 0.45},
	{at: s(10) + 104, file: 'swell', vol: 0.5},
	// 11 lying down at the gap
	{at: s(11) + 8, file: 'cloth', vol: 0.5},
	...W(11, 48),
	// 12 the boots, pacing
	{at: s(12) + 24, file: 'steps_slow', vol: 0.55, len: 102},
	// 13 the chair, someone tied
	{at: s(13), file: 'heart', vol: 0.5, len: 96},
	{at: s(13) + 79, file: 'stamp', vol: 0.45},
	// 14 the jacket, the scar
	...W(14, 60),
	{at: s(14) + 66, file: 'swell', vol: 0.55},
	// 15 dad, alive
	{at: s(15) + 10, file: 'heart_big', vol: 0.8},
	// 16 «Какое слово?»
	{at: s(16) + 8, file: 'steps_slow', vol: 0.4, len: 30},
	{at: s(16) + 108, file: 'boom', vol: 0.4},
	// 17 dad says nothing
	{at: s(17), file: 'heart', vol: 0.45, len: 117},
	// 18 dad's phone lights his face
	{at: s(18) + 38, file: 'beep', vol: 0.35},
	{at: s(18) + 46, file: 'swell', vol: 0.55},
	// 19 typing to you
	{at: s(19) + 6, file: 'typing', vol: 0.6},
	{at: s(19) + 20, file: 'typing', vol: 0.5},
	{at: s(19) + 38, file: 'pop', vol: 0.6},
	// 20 your phone buzzes
	{at: s(20) + 26, file: 'vibrate', vol: 0.9, len: 34},
	{at: s(20) + 62, file: 'message', vol: 0.6},
	...W(20, 58),
	// 21 silence → steps to the door
	{at: s(21), file: 'heart', vol: 0.6, len: 111},
	{at: s(21) + 62, file: 'steps_slow', vol: 0.85, len: 49},
	// 22 the door rises
	{at: s(22) + 4, file: 'lift_doors', vol: 0.6},
	{at: s(22) + 6, file: 'creak', vol: 0.7},
	{at: s(22) + 34, file: 'swell', vol: 0.6},
	{at: s(22) + 86, file: 'heart_big', vol: 1},
	// 23 finale
	{at: s(23), file: 'boom', vol: 1},
	{at: s(23) + 8, file: 'pop', vol: 0.5},
	{at: s(23) + 63, file: 'pop', vol: 0.5},
	{at: s(23) + 150, file: 'beep', vol: 0.8},
	{at: s(23) + 180, file: 'beep', vol: 0.8},
	{at: s(23) + 210, file: 'beep', vol: 0.8},
	{at: s(23) + 236, file: 'beep_final', vol: 0.9},
	{at: s(23) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(23) + 252;

export const SFX6: React.FC<{r: Remap}> = ({r}) => (
	<>
		<Sequence from={0} durationInFrames={Math.round(r.fwd(BED_END)) + 30} name="sfx drone bed">
			<Audio src={staticFile('sfx/drone.wav')} loop volume={(f) => 0.32 * interpolate(f, [0, 60, r.fwd(BED_END) - 10, r.fwd(BED_END) + 20], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
		</Sequence>
		{CUES.map((c, i) => {
			const at = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - at, r.total - at));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={i} from={at} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : vol)} />
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
