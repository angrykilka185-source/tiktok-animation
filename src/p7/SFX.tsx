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
	// 2-4 recap of part 6
	{at: s(2), file: 'rewind', vol: 0.5},
	...W(2, 42),
	{at: s(3), file: 'rewind', vol: 0.3},
	{at: s(4), file: 'rewind', vol: 0.3},
	{at: s(4) + 4, file: 'creak', vol: 0.5},
	// 5 title: the finale
	{at: s(5), file: 'boom', vol: 0.9},
	{at: s(5) + 22, file: 'pop', vol: 0.45},
	// 6 the door rises — you roll away, under the car
	{at: s(6), file: 'lift_doors', vol: 0.5},
	{at: s(6) + 2, file: 'creak', vol: 0.6},
	{at: s(6) + 12, file: 'gasp', vol: 0.5},
	...W(6, 20),
	{at: s(6) + 42, file: 'cloth', vol: 0.6},
	{at: s(6) + 66, file: 'bump', vol: 0.3},
	{at: s(6) + 50, file: 'heart', vol: 0.5, len: 58},
	// 7 «102», whispering
	{at: s(7) + 6, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 14, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 22, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 28, file: 'tick', vol: 0.4},
	{at: s(7) + 42, file: 'breath', vol: 0.35},
	// 8 the door opens, his boots come and stop
	{at: s(8), file: 'creak', vol: 0.5},
	{at: s(8) + 30, file: 'steps_slow', vol: 0.75, len: 70},
	{at: s(8) + 100, file: 'bump', vol: 0.5},
	{at: s(8) + 100, file: 'heart_big', vol: 0.8},
	// 9 the phone buzzes → pressed into the asphalt
	{at: s(9) + 4, file: 'vibrate', vol: 0.85, len: 48},
	{at: s(9) + 4, file: 'message', vol: 0.4},
	{at: s(9) + 52, file: 'cloth', vol: 0.5},
	{at: s(9) + 54, file: 'vibrate', vol: 0.2, len: 30},
	// 10 he stands… then goes to your block
	{at: s(10), file: 'heart', vol: 0.6, len: 56},
	{at: s(10) + 42, file: 'steps', vol: 0.6, len: 22},
	...W(10, 54),
	{at: s(10) + 56, file: 'steps', vol: 0.3, len: 50},
	{at: s(10) + 90, file: 'swell', vol: 0.45},
	// 11 you run into the garage
	{at: s(11), file: 'steps', vol: 0.6, len: 40},
	...W(11, 38),
	{at: s(11) + 60, file: 'breath', vol: 0.4},
	// 12 the tape, «Карась», the real one
	{at: s(12) + 8, file: 'tear', vol: 0.9},
	{at: s(12) + 18, file: 'gasp', vol: 0.5},
	{at: s(12) + 48, file: 'pop', vol: 0.45},
	{at: s(12) + 56, file: 'swell', vol: 0.5},
	{at: s(12) + 86, file: 'stamp', vol: 0.7},
	// 13 the ropes, your back to the door; rule five broken
	{at: s(13) + 6, file: 'cloth', vol: 0.45, len: 60},
	{at: s(13) + 60, file: 'pop', vol: 0.45},
	{at: s(13) + 92, file: 'stamp', vol: 0.9},
	// 14 steps behind you → a torch → police
	{at: s(14), file: 'steps_slow', vol: 0.85, len: 36},
	{at: s(14) + 22, file: 'heart_big', vol: 0.8},
	{at: s(14) + 34, file: 'switch', vol: 0.7},
	{at: s(14) + 36, file: 'boom', vol: 0.45},
	{at: s(14) + 30, file: 'siren', vol: 0.55, len: 200},
	// 15 the police run in; mom opens the door; the empty flat
	{at: s(15) + 4, file: 'steps', vol: 0.4, len: 44},
	{at: s(15) + 44, file: 'knock', vol: 0.6},
	{at: s(15) + 50, file: 'lock', vol: 0.6},
	{at: s(15) + 52, file: 'handle', vol: 0.5},
	{at: s(15) + 100, file: 'switch', vol: 0.5},
	{at: s(15) + 100, file: 'heart', vol: 0.5, len: 41},
	// 16 dad's phone on your pillow
	{at: s(16) + 20, file: 'swell', vol: 0.5},
	{at: s(16) + 40, file: 'stamp', vol: 0.5},
	// 17 searched all night — nothing
	{at: s(17), file: 'siren', vol: 0.2, len: 34},
	{at: s(17) + 4, file: 'howl', vol: 0.35},
	...W(17, 32),
	{at: s(17) + 36, file: 'creak', vol: 0.3},
	// 18 morning: borscht, the left hand
	{at: s(18) + 8, file: 'plate', vol: 0.4},
	{at: s(18) + 30, file: 'fork', vol: 0.3},
	...W(18, 62),
	{at: s(18) + 72, file: 'stamp', vol: 0.45},
	// 19 «тигрёнок», mom crying from happiness
	{at: s(19) + 4, file: 'cloth', vol: 0.4},
	{at: s(19) + 60, file: 'swell', vol: 0.4},
	// 20 at night: an unknown number
	{at: s(20) + 8, file: 'vibrate', vol: 0.7, len: 32},
	...W(20, 38),
	{at: s(20) + 44, file: 'message', vol: 0.6},
	{at: s(20) + 84, file: 'pop', vol: 0.45}, // «?» in the counter
	{at: s(20) + 100, file: 'glitch', vol: 0.6},
	{at: s(20) + 100, file: 'heart_big', vol: 0.85},
	{at: s(20) + 104, file: 'whisper', vol: 0.4},
	// 21 the end
	{at: s(21), file: 'boom', vol: 1},
	{at: s(21) + 30, file: 'pop', vol: 0.5},
	{at: s(21) + 70, file: 'pop', vol: 0.4},
	{at: s(21) + 100, file: 'whoosh', vol: 0.6},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// the night drone: from the recap until the morning, and again at night until the end
const BEDS: [number, number][] = [
	[s(2), s(18) + 10],
	[s(20), s(21) + 240],
];

export const SFX7: React.FC<{r: Remap}> = ({r}) => (
	<>
		{BEDS.map(([a, b], k) => {
			const from = Math.round(r.fwd(a));
			const len = Math.round(r.fwd(b)) - from;
			return (
				<Sequence key={k} from={from} durationInFrames={len} name={`sfx drone bed ${k + 1}`}>
					<Audio src={staticFile('sfx/drone.wav')} loop volume={(f) => 0.32 * interpolate(f, [0, 40, len - 30, len - 1], [0, 1, 1, 0], clampX)} />
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
