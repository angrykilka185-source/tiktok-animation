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
	// 2-3 recap of series 1, then you decide to obey
	{at: s(2), file: 'rewind', vol: 0.45},
	{at: s(2) + 73, file: 'stamp', vol: 0.6},
	...W(2, 56),
	{at: s(3), file: 'rewind', vol: 0.3},
	{at: s(3) + 64, file: 'stamp', vol: 0.6},
	...W(3, 74),
	{at: s(3) + 80, file: 'pop', vol: 0.55},
	{at: s(3) + 91, file: 'breath', vol: 0.4},
	// 4 PE: the whistle, the throw
	{at: s(4) + 26, file: 'whistle', vol: 0.7},
	{at: s(4) + 56, file: 'whoosh', vol: 0.5},
	// 5 hands behind the back, the ball drops at your feet
	{at: s(5) + 4, file: 'whoosh', vol: 0.35},
	{at: s(5) + 12, file: 'cloth', vol: 0.55},
	...W(5, 56),
	{at: s(5) + 69, file: 'ball', vol: 0.95, len: 8},
	{at: s(5) + 83, file: 'ball', vol: 0.55, len: 8},
	{at: s(5) + 93, file: 'ball', vol: 0.3, len: 6},
	{at: s(5) + 99, file: 'ball', vol: 0.15, len: 5},
	// 6 the teacher yells, the class laughs
	{at: s(6) + 2, file: 'whistle', vol: 0.35},
	{at: s(6) + 56, file: 'boom', vol: 0.45},
	...W(6, 82),
	...[3, 9, 15, 21, 27, 33].map((o) => ({at: s(6) + 84 + o, file: 'pop', vol: 0.3})),
	// 7 Max picks the ball up where you stood
	{at: s(7) + 2, file: 'steps', vol: 0.45, len: 22},
	{at: s(7) + 30, file: 'pop', vol: 0.5},
	{at: s(7) + 46, file: 'swell', vol: 0.45},
	{at: s(7) + 70, file: 'creak', vol: 0.25},
	// 8 the creak above, the lamp on its last wire
	{at: s(8) + 28, file: 'creak', vol: 0.85},
	...W(8, 46),
	{at: s(8) + 50, file: 'creak', vol: 0.5},
	{at: s(8) + 78, file: 'sparks', vol: 0.8},
	// 9 «Макс, в сторону!»
	{at: s(9), file: 'whoosh', vol: 0.5},
	{at: s(9) + 44, file: 'boom', vol: 0.5},
	// 10 Max jumps aside, the crash
	{at: s(10) + 5, file: 'whoosh', vol: 0.45},
	{at: s(10) + 31, file: 'whoosh', vol: 0.5},
	{at: s(10) + 41, file: 'glass', vol: 1},
	{at: s(10) + 41, file: 'crash', vol: 0.55},
	{at: s(10) + 42, file: 'boom', vol: 0.7},
	{at: s(10) + 49, file: 'sparks', vol: 0.6},
	// 11 silence → Max turns to you
	{at: s(11), file: 'heart', vol: 0.45, len: 42},
	...W(11, 40),
	{at: s(11) + 44, file: 'swell', vol: 0.4},
	{at: s(11) + 88, file: 'heart', vol: 0.5, len: 23},
	// 12 Max's phone: your number, 23:59
	{at: s(12) + 2, file: 'cloth', vol: 0.4},
	{at: s(12) + 8, file: 'whoosh', vol: 0.4},
	...W(12, 56, 128),
	{at: s(12) + 100, file: 'stamp', vol: 0.55},
	{at: s(12) + 102, file: 'pop', vol: 0.4},
	{at: s(12) + 162, file: 'stamp', vol: 0.6},
	// 13 your voice on his phone
	{at: s(13), file: 'heart', vol: 0.5, len: 96},
	{at: s(13) + 74, file: 'glitch', vol: 0.6},
	// 14 your voice, but not you
	{at: s(14) + 3, file: 'heart_big', vol: 0.8},
	...W(14, 34),
	// 15 your chat: the voice message is gone
	{at: s(15) + 3, file: 'pop', vol: 0.3},
	{at: s(15) + 44, file: 'glitch', vol: 0.75},
	{at: s(15) + 66, file: 'pop', vol: 0.4},
	// 16 the pocket buzzes → a new voice message, 23:59
	{at: s(16) + 6, file: 'vibrate', vol: 0.9, len: 40},
	...W(16, 48),
	{at: s(16) + 55, file: 'message', vol: 0.8},
	{at: s(16) + 96, file: 'stamp', vol: 0.55},
	// 17 «Молодец, что послушался…» → vision of tonight
	{at: s(17), file: 'heart', vol: 0.5, len: 207},
	{at: s(17) + 70, file: 'glitch', vol: 0.7},
	{at: s(17) + 163, file: 'stamp', vol: 0.6},
	{at: s(17) + 167, file: 'pop', vol: 0.5}, // «?» in the counter
	// 18 slowing the recording down
	{at: s(18) + 14, file: 'pop', vol: 0.5},
	{at: s(18) + 18, file: 'slowdown', vol: 0.8},
	...W(18, 54),
	{at: s(18) + 60, file: 'heart', vol: 0.5, len: 100},
	// 19 the whisper
	{at: s(19) + 4, file: 'heart_big', vol: 1},
	{at: s(19) + 18, file: 'glitch', vol: 0.45},
	// 20 19:00, knock-knock, mom
	{at: s(20), file: 'tick', vol: 0.45, len: 30},
	{at: s(20) + 12, file: 'boom', vol: 0.45},
	{at: s(20) + 34, file: 'knock', vol: 1},
	{at: s(20) + 60, file: 'creak', vol: 0.6},
	...W(20, 28),
	// 21 finale
	{at: s(21), file: 'boom', vol: 1},
	{at: s(21) + 8, file: 'pop', vol: 0.5},
	{at: s(21) + 78, file: 'pop', vol: 0.5},
	{at: s(21) + 150, file: 'beep', vol: 0.8},
	{at: s(21) + 180, file: 'beep', vol: 0.8},
	{at: s(21) + 210, file: 'beep', vol: 0.8},
	{at: s(21) + 236, file: 'beep_final', vol: 0.9},
	{at: s(21) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(21) + 252;

export const SFXG2B: React.FC<{r: Remap}> = ({r}) => (
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
