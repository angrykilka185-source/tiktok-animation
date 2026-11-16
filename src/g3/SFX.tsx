import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));
// the blinking bulb on the landing
const FL = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'flicker', vol: 0.35, len: 20}));

const CUES: Cue[] = [
	// 1-4 recap: the lift, the lamp, Max's message, the trash, the whisper, mom at seven
	{at: s(1), file: 'rewind', vol: 0.45},
	...W(1, 42, 92),
	{at: s(1) + 84, file: 'stamp', vol: 0.6},
	{at: s(1) + 112, file: 'stamp', vol: 0.6},
	{at: s(2), file: 'rewind', vol: 0.3},
	...W(2, 46),
	{at: s(2) + 84, file: 'glitch', vol: 0.4},
	{at: s(3), file: 'rewind', vol: 0.3},
	{at: s(3) + 74, file: 'stamp', vol: 0.6},
	...W(3, 110),
	{at: s(3) + 156, file: 'whisper', vol: 0.5},
	{at: s(4), file: 'tick', vol: 0.4, len: 30},
	{at: s(4) + 34, file: 'knock', vol: 0.9},
	// 5 title card
	...W(5, 0),
	{at: s(5) + 2, file: 'boom', vol: 0.6},
	{at: s(5) + 10, file: 'pop', vol: 0.45},
	{at: s(5) + 22, file: 'pop', vol: 0.55},
	{at: s(5) + 36, file: 'pop', vol: 0.4},
	// 6 the lie, mom's hand on your forehead
	{at: s(6) + 20, file: 'gulp', vol: 0.4},
	{at: s(6) + 60, file: 'pat', vol: 0.35},
	// 7 «Ладно, сама вынесу» → she goes out
	{at: s(7) + 2, file: 'breath', vol: 0.45},
	...W(7, 42),
	{at: s(7) + 46, file: 'steps', vol: 0.45, len: 34},
	{at: s(7) + 52, file: 'handle', vol: 0.6},
	{at: s(7) + 90, file: 'slam', vol: 0.55},
	// 8 the lock clicks → «А мама?»
	{at: s(8) + 9, file: 'lock', vol: 1},
	...W(8, 32),
	{at: s(8) + 80, file: 'stamp', vol: 0.6},
	{at: s(8) + 34, file: 'heart', vol: 0.45, len: 68},
	// 9 you rush to the viewer, the landing behind it
	{at: s(9) + 2, file: 'steps', vol: 0.6, len: 26},
	{at: s(9) + 30, file: 'bump', vol: 0.5},
	...W(9, 42),
	...FL(9, 50, 74),
	// 10-13 through the viewer
	{at: s(10), file: 'steps_slow', vol: 0.35, len: 58},
	...FL(10, 20, 64),
	{at: s(10) + 60, file: 'heart', vol: 0.5, len: 42},
	...FL(11, 8, 40),
	{at: s(11) + 14, file: 'swell', vol: 0.5},
	{at: s(11) + 76, file: 'pop', vol: 0.35},
	...FL(12, 20),
	...FL(13, 12),
	{at: s(13) + 32, file: 'creak', vol: 0.5},
	{at: s(13) + 48, file: 'crash', vol: 0.35},
	{at: s(13) + 56, file: 'slam', vol: 0.35},
	// 14 he turns → your face
	{at: s(14), file: 'heart', vol: 0.55, len: 80},
	{at: s(14) + 60, file: 'swell', vol: 0.5},
	...W(14, 78),
	{at: s(14) + 82, file: 'heart_big', vol: 0.8},
	// 15 he comes up to the viewer, smiles
	{at: s(15) + 2, file: 'steps_slow', vol: 0.45, len: 42},
	{at: s(15) + 58, file: 'glitch', vol: 0.5},
	// 16 the light goes out, you jump back
	{at: s(16) + 10, file: 'switch', vol: 0.8},
	{at: s(16) + 12, file: 'boom', vol: 0.5},
	{at: s(16) + 33, file: 'gasp', vol: 0.55},
	{at: s(16) + 36, file: 'whoosh', vol: 0.45},
	// 17-19 mom comes back: «Спасибо, что помог»
	{at: s(17), file: 'handle', vol: 0.5},
	{at: s(17) + 6, file: 'steps', vol: 0.4, len: 28},
	{at: s(19), file: 'heart_big', vol: 0.8},
	// 20 night, 23:41, the buzz
	{at: s(20) + 14, file: 'vibrate', vol: 0.8, len: 36},
	...W(20, 50),
	{at: s(20) + 55, file: 'message', vol: 0.7},
	{at: s(20) + 74, file: 'pop', vol: 0.4},
	// 21 the message → vision of tomorrow → «Выключи телефон»
	{at: s(21), file: 'heart', vol: 0.45, len: 225},
	{at: s(21) + 80, file: 'glitch', vol: 0.65},
	{at: s(21) + 132, file: 'pop', vol: 0.5}, // «?» in the counter
	{at: s(21) + 150, file: 'glitch', vol: 0.4},
	{at: s(21) + 156, file: 'pop', vol: 0.5},
	// 22-23 the phone rings: «Мой номер»
	{at: s(22) + 42, file: 'ringtone', vol: 0.65, len: 85},
	{at: s(22) + 42, file: 'vibrate', vol: 0.7, len: 85},
	{at: s(23) + 26, file: 'stamp', vol: 0.55},
	// 24 finale (the ringing goes on quietly under the cards)
	{at: s(24), file: 'boom', vol: 1},
	{at: s(24), file: 'ringtone', vol: 0.25, len: 240},
	{at: s(24) + 8, file: 'pop', vol: 0.5},
	{at: s(24) + 78, file: 'pop', vol: 0.5},
	{at: s(24) + 150, file: 'beep', vol: 0.8},
	{at: s(24) + 180, file: 'beep', vol: 0.8},
	{at: s(24) + 210, file: 'beep', vol: 0.8},
	{at: s(24) + 236, file: 'beep_final', vol: 0.9},
	{at: s(24) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(24) + 252;

export const SFXG3: React.FC<{r: Remap}> = ({r}) => (
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
