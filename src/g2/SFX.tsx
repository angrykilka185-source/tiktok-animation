import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 voice messages from tomorrow
	{at: s(1) + 2, file: 'vibrate', vol: 0.7, len: 16},
	{at: s(1) + 3, file: 'message', vol: 0.6},
	{at: s(1) + 72, file: 'pop', vol: 0.45},
	// 2-3 recap of series 1
	{at: s(2), file: 'rewind', vol: 0.45},
	{at: s(2) + 73, file: 'stamp', vol: 0.6},
	...W(2, 56),
	{at: s(3), file: 'rewind', vol: 0.3},
	{at: s(3) + 64, file: 'stamp', vol: 0.6},
	{at: s(3) + 78, file: 'swell', vol: 0.5},
	...W(3, 74),
	// 4 PE: the whistle, the throw
	{at: s(4) + 22, file: 'whistle', vol: 0.7},
	{at: s(4) + 41, file: 'whoosh', vol: 0.5},
	// 5 catch, the creak above
	{at: s(5) + 5, file: 'ball', vol: 0.9, len: 8},
	{at: s(5) + 42, file: 'creak', vol: 0.8},
	...W(5, 24),
	// 6 the lamp on its last wire
	{at: s(6), file: 'creak', vol: 0.55},
	{at: s(6) + 56, file: 'sparks', vol: 0.8},
	// 7 jump back, the crash
	{at: s(7) + 8, file: 'whoosh', vol: 0.4},
	{at: s(7) + 36, file: 'whoosh', vol: 0.5},
	{at: s(7) + 46, file: 'glass', vol: 1},
	{at: s(7) + 46, file: 'crash', vol: 0.55},
	{at: s(7) + 47, file: 'boom', vol: 0.7},
	{at: s(7) + 54, file: 'sparks', vol: 0.6},
	// 8 silence → the phone buzzes in your pocket
	{at: s(8), file: 'heart', vol: 0.45, len: 45},
	{at: s(8) + 63, file: 'vibrate', vol: 0.9, len: 40},
	...W(8, 43),
	// 9 the new voice message, 23:59
	{at: s(9) + 6, file: 'message', vol: 0.8},
	{at: s(9) + 64, file: 'stamp', vol: 0.55},
	// 10 «Я же просил…» → vision of tonight
	{at: s(10), file: 'heart', vol: 0.5, len: 198},
	{at: s(10) + 64, file: 'glitch', vol: 0.7},
	{at: s(10) + 156, file: 'stamp', vol: 0.6},
	{at: s(10) + 160, file: 'pop', vol: 0.5}, // «?» in the counter
	// 11 slowing the recording down
	{at: s(11) + 21, file: 'pop', vol: 0.5},
	{at: s(11) + 22, file: 'slowdown', vol: 0.8},
	{at: s(11) + 60, file: 'heart', vol: 0.5, len: 63},
	...W(11, 58),
	// 12 the whisper
	{at: s(12) + 4, file: 'heart_big', vol: 1},
	{at: s(12) + 16, file: 'glitch', vol: 0.45},
	// 13 19:00, knock-knock, mom
	{at: s(13), file: 'tick', vol: 0.45, len: 30},
	{at: s(13) + 12, file: 'boom', vol: 0.45},
	{at: s(13) + 34, file: 'knock', vol: 1},
	{at: s(13) + 60, file: 'creak', vol: 0.6},
	...W(13, 28),
	// 14 finale
	{at: s(14), file: 'boom', vol: 1},
	{at: s(14) + 8, file: 'pop', vol: 0.5},
	{at: s(14) + 78, file: 'pop', vol: 0.5},
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

export const SFXG2: React.FC<{r: Remap}> = ({r}) => (
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
