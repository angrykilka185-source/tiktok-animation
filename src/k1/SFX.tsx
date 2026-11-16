import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 the block: twelve floors, you on the top one
	{at: s(1) + 18, file: 'tick', vol: 0.35, len: 34},
	{at: s(1) + 72, file: 'pop', vol: 0.5},
	// 2 the red 13 appears → title card
	{at: s(2) + 2, file: 'lift_ding', vol: 0.35},
	{at: s(2) + 70, file: 'glitch', vol: 0.5},
	{at: s(2) + 70, file: 'boom', vol: 0.45},
	...W(2, 94),
	{at: s(2) + 97, file: 'boom', vol: 0.7},
	{at: s(2) + 106, file: 'pop', vol: 0.5},
	{at: s(2) + 116, file: 'pop', vol: 0.45},
	// 3 warm, as if just pressed
	{at: s(3) + 58, file: 'pop', vol: 0.3},
	{at: s(3) + 62, file: 'swell', vol: 0.35},
	{at: s(3) + 96, file: 'whisper', vol: 0.25},
	// 4 uncle Vitya comes in, presses «1»
	{at: s(4), file: 'lift_doors', vol: 0.55},
	{at: s(4) + 4, file: 'steps', vol: 0.4, len: 30},
	{at: s(4) + 46, file: 'pop', vol: 0.45},
	{at: s(4) + 84, file: 'switch', vol: 0.45},
	// 5 «Какая кнопка?»
	...W(5, 42),
	// 6 evening, alone with the button
	{at: s(6) + 20, file: 'keys', vol: 0.35},
	{at: s(6) + 64, file: 'lift_doors', vol: 0.4},
	...W(6, 64),
	{at: s(6) + 80, file: 'heart', vol: 0.45, len: 60},
	// 7 click
	{at: s(7) + 46, file: 'switch', vol: 0.9},
	{at: s(7) + 46, file: 'boom', vol: 0.4},
	{at: s(7) + 48, file: 'heart_big', vol: 0.6},
	// 8 up, longer than usual: 12… 13
	{at: s(8) + 2, file: 'swell', vol: 0.4},
	{at: s(8) + 12, file: 'flicker', vol: 0.3, len: 20},
	{at: s(8) + 39, file: 'flicker', vol: 0.3, len: 20},
	...W(8, 84),
	{at: s(8) + 132, file: 'lift_ding', vol: 0.8},
	{at: s(8) + 132, file: 'glitch', vol: 0.5},
	// 9 the doors open: your floor
	{at: s(9) + 4, file: 'lift_doors', vol: 0.6},
	...W(9, 108),
	// 10 everything the other way round: 48 → 84
	{at: s(10) + 26, file: 'whoosh', vol: 0.5},
	{at: s(10) + 36, file: 'glitch', vol: 0.4},
	...W(10, 80),
	{at: s(10) + 144, file: 'glitch', vol: 0.6},
	{at: s(10) + 148, file: 'stamp', vol: 0.5},
	// 11 your lost sneaker
	{at: s(11) + 56, file: 'heart', vol: 0.4, len: 50},
	{at: s(11) + 76, file: 'stamp', vol: 0.6},
	// 12 mom's voice behind the door
	{at: s(12), file: 'heart', vol: 0.5, len: 129},
	// 13 but mom is one floor below
	{at: s(13), file: 'swell', vol: 0.4},
	{at: s(13) + 40, file: 'pop', vol: 0.5},
	// 14 the handle goes down
	{at: s(14) + 10, file: 'handle', vol: 0.8},
	{at: s(14) + 40, file: 'creak', vol: 0.5},
	// 15 you jab 12, the doors close forever, door 84 opens
	...[6, 18, 30, 42].map((o) => ({at: s(15) + o, file: 'switch', vol: 0.6})),
	...W(15, 58),
	{at: s(15) + 64, file: 'lift_doors', vol: 0.6},
	{at: s(15) + 70, file: 'heart_big', vol: 0.7},
	{at: s(15) + 80, file: 'creak', vol: 0.5},
	// 16 «12», home, «А хлеб где?»
	{at: s(16), file: 'lift_ding', vol: 0.7},
	{at: s(16) + 30, file: 'steps', vol: 0.5, len: 30},
	{at: s(16) + 40, file: 'slam', vol: 0.4},
	{at: s(16) + 80, file: 'pop', vol: 0.4},
	// 17 the bed at the other wall
	{at: s(17) + 4, file: 'creak', vol: 0.4},
	{at: s(17) + 50, file: 'heart_big', vol: 0.7},
	...W(17, 56),
	{at: s(17) + 62, file: 'pop', vol: 0.4},
	{at: s(17) + 72, file: 'pop', vol: 0.4},
	// 18 «Она всегда там стояла»
	...W(18, 50),
	// 19 at night the lift goes above the twelfth
	{at: s(19) + 6, file: 'swell', vol: 0.5},
	{at: s(19) + 6, file: 'floorcreak', vol: 0.35},
	...W(19, 60),
	{at: s(19) + 106, file: 'lift_ding', vol: 0.6},
	{at: s(19) + 106, file: 'glitch', vol: 0.5},
	{at: s(19) + 110, file: 'pop', vol: 0.4}, // «?» in the counter
	// 20 finale
	{at: s(20), file: 'boom', vol: 1},
	{at: s(20) + 8, file: 'pop', vol: 0.5},
	{at: s(20) + 78, file: 'pop', vol: 0.5},
	{at: s(20) + 150, file: 'beep', vol: 0.8},
	{at: s(20) + 180, file: 'beep', vol: 0.8},
	{at: s(20) + 210, file: 'beep', vol: 0.8},
	{at: s(20) + 236, file: 'beep_final', vol: 0.9},
	{at: s(20) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(20) + 252;

export const SFXK1: React.FC<{r: Remap}> = ({r}) => (
	<>
		<Sequence from={0} durationInFrames={Math.round(r.fwd(BED_END)) + 30} name="sfx drone bed">
			<Audio src={staticFile('sfx/drone.wav')} volume={(f) => 0.3 * interpolate(f, [0, 60, r.fwd(BED_END) - 10, r.fwd(BED_END) + 20], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
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
