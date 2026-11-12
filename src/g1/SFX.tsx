import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 night: the phone buzzes, notification
	{at: s(1) + 8, file: 'vibrate', vol: 0.8, len: 52},
	{at: s(1) + 10, file: 'message', vol: 0.6},
	{at: s(1) + 70, file: 'vibrate', vol: 0.5, len: 16},
	{at: s(1) + 98, file: 'pop', vol: 0.45},
	...W(1, 66),
	// 2 play → your own voice
	{at: s(2) + 26, file: 'pop', vol: 0.6},
	{at: s(2) + 66, file: 'swell', vol: 0.55},
	...W(2, 60),
	// 3 the voice from tomorrow → vision of the lift
	{at: s(3), file: 'heart', vol: 0.55, len: 138},
	{at: s(3) + 66, file: 'glitch', vol: 0.7},
	{at: s(3) + 72, file: 'lift_ding', vol: 0.3},
	{at: s(3) + 104, file: 'stamp', vol: 0.6},
	// 4 23:59 vs 23:41
	{at: s(4), file: 'tick', vol: 0.45, len: 106},
	{at: s(4) + 50, file: 'stamp', vol: 0.55},
	{at: s(4) + 133, file: 'boom', vol: 0.55},
	...W(4, 104),
	// 5 chat
	{at: s(5) + 6, file: 'typing', vol: 0.6},
	{at: s(5) + 24, file: 'pop', vol: 0.5},
	{at: s(5) + 88, file: 'message', vol: 0.8},
	// 6 morning, the lift
	{at: s(6), file: 'steps', vol: 0.6, len: 50},
	{at: s(6) + 84, file: 'lift_ding', vol: 0.8},
	{at: s(6) + 92, file: 'lift_doors', vol: 0.75},
	// 7 the voice in your head → stairs
	{at: s(7) + 2, file: 'whisper', vol: 0.4, len: 46},
	{at: s(7) + 56, file: 'steps_slow', vol: 0.7, len: 37},
	...W(7, 54),
	// 8 crash → the stuck cabin
	{at: s(8), file: 'steps', vol: 0.45, len: 32},
	{at: s(8) + 34, file: 'crash', vol: 1},
	{at: s(8) + 35, file: 'boom', vol: 0.75},
	{at: s(8) + 54, file: 'alarm', vol: 0.4, len: 54},
	// 9 inside: alarm + the dog
	{at: s(9), file: 'alarm', vol: 0.3, len: 96},
	{at: s(9) + 20, file: 'bark', vol: 0.9},
	{at: s(9) + 62, file: 'bark', vol: 1},
	...W(9, 46),
	// 10 the message disappears
	{at: s(10) + 40, file: 'glitch', vol: 0.9},
	{at: s(10) + 62, file: 'swell', vol: 0.45},
	// 11 night again
	{at: s(11), file: 'tick', vol: 0.45, len: 60},
	{at: s(11) + 70, file: 'vibrate', vol: 0.9, len: 32},
	{at: s(11) + 102, file: 'message', vol: 0.7},
	{at: s(11) + 116, file: 'pop', vol: 0.45},
	...W(11, 98),
	// 12 second message → vision: the gym, the ball
	{at: s(12), file: 'heart', vol: 0.55, len: 123},
	{at: s(12) + 24, file: 'glitch', vol: 0.6},
	{at: s(12) + 38, file: 'ball', vol: 0.8, len: 14},
	{at: s(12) + 40, file: 'whoosh', vol: 0.45},
	{at: s(12) + 58, file: 'stamp', vol: 0.55},
	{at: s(12) + 62, file: 'pop', vol: 0.5}, // «?» in the counter
	...W(12, 84),
	// 13 the whisper
	{at: s(13) + 46, file: 'whisper', vol: 0.75, len: 40},
	{at: s(13) + 62, file: 'heart_big', vol: 1},
	// 14 finale
	{at: s(14), file: 'boom', vol: 1},
	{at: s(14) + 8, file: 'pop', vol: 0.5},
	{at: s(14) + 80, file: 'pop', vol: 0.5},
	{at: s(14) + 150, file: 'beep', vol: 0.8},
	{at: s(14) + 180, file: 'beep', vol: 0.8},
	{at: s(14) + 210, file: 'beep', vol: 0.8},
	{at: s(14) + 236, file: 'beep_final', vol: 0.9},
	{at: s(14) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(14) + 252;

export const SFXG1: React.FC<{r: Remap}> = ({r}) => (
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
