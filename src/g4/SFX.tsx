import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1-3 recap: the lift, the lamp, the double in the door viewer, «выключи телефон», «Мой номер»
	{at: s(1), file: 'rewind', vol: 0.45},
	{at: s(1) + 70, file: 'stamp', vol: 0.6},
	...W(1, 78),
	{at: s(1) + 90, file: 'stamp', vol: 0.6},
	{at: s(2), file: 'rewind', vol: 0.3},
	...W(2, 82),
	{at: s(3), file: 'rewind', vol: 0.3},
	...W(3, 116),
	{at: s(3) + 118, file: 'ringtone', vol: 0.4, len: 62},
	// 4 title
	{at: s(4), file: 'boom', vol: 0.9},
	{at: s(4) + 28, file: 'pop', vol: 0.4},
	// 5 you hold the button; the call breaks off; the screen goes dark
	{at: s(5), file: 'ringtone', vol: 0.6, len: 50},
	{at: s(5), file: 'vibrate', vol: 0.6, len: 50},
	{at: s(5) + 10, file: 'tick', vol: 0.5},
	...W(5, 32),
	{at: s(5) + 50, file: 'decline', vol: 0.6},
	{at: s(5) + 80, file: 'switch', vol: 0.6},
	// 6 the reflection blinks a second late
	{at: s(6), file: 'heart', vol: 0.5, len: 147},
	{at: s(6) + 106, file: 'glitch', vol: 0.45},
	// 7 morning: 9:20
	{at: s(7) + 76, file: 'gasp', vol: 0.5},
	{at: s(7) + 98, file: 'boom', vol: 0.6},
	{at: s(7) + 100, file: 'tick', vol: 0.4},
	// 8 mom freezes with the cup
	{at: s(8) + 24, file: 'glass', vol: 0.35},
	{at: s(8) + 30, file: 'water', vol: 0.3, len: 26},
	...W(8, 56),
	// 9 running to school, the window
	{at: s(9), file: 'steps', vol: 0.6, len: 34},
	...W(9, 32),
	// 10-12 the double at your desk; «к доске»; he waves
	{at: s(10), file: 'heart', vol: 0.4, len: 150},
	{at: s(11) + 40, file: 'pop', vol: 0.4},
	{at: s(11) + 94, file: 'creak', vol: 0.5},
	{at: s(12) + 10, file: 'swell', vol: 0.45},
	{at: s(12) + 64, file: 'heart_big', vol: 0.7},
	// 13 switching on: 47 missed calls
	{at: s(13) + 4, file: 'beep', vol: 0.3, len: 8},
	{at: s(13) + 30, file: 'vibrate', vol: 0.6, len: 40},
	{at: s(13) + 30, file: 'message', vol: 0.5},
	// 14 one voice message
	{at: s(14) + 20, file: 'message', vol: 0.5},
	{at: s(14) + 48, file: 'tick', vol: 0.4},
	// 15 the message → him recording it at night → «не давай ему дотронуться»
	{at: s(15), file: 'heart', vol: 0.45, len: 234},
	{at: s(15) + 88, file: 'glitch', vol: 0.6},
	{at: s(15) + 160, file: 'glitch', vol: 0.4},
	{at: s(15) + 206, file: 'pop', vol: 0.5}, // «?» in the counter
	{at: s(15) + 206, file: 'stamp', vol: 0.5},
	// 16 the whisper «Это не ты», the reflection smiles
	{at: s(16) + 64, file: 'whisper', vol: 0.5},
	{at: s(16) + 64, file: 'glitch', vol: 0.6},
	{at: s(16) + 64, file: 'heart_big', vol: 0.8},
	// 17 the bell; he walks straight to you
	{at: s(17), file: 'alarm', vol: 0.5, len: 30},
	{at: s(17) + 30, file: 'steps_slow', vol: 0.6, len: 70},
	// 18 his hand
	{at: s(18), file: 'heart', vol: 0.5, len: 123},
	{at: s(18) + 6, file: 'swell', vol: 0.5},
	// 19 finale
	{at: s(19), file: 'boom', vol: 1},
	{at: s(19) + 8, file: 'pop', vol: 0.5},
	{at: s(19) + 78, file: 'pop', vol: 0.5},
	{at: s(19) + 150, file: 'beep', vol: 0.8},
	{at: s(19) + 180, file: 'beep', vol: 0.8},
	{at: s(19) + 210, file: 'beep', vol: 0.8},
	{at: s(19) + 236, file: 'beep_final', vol: 0.9},
	{at: s(19) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(19) + 252;

export const SFXG4: React.FC<{r: Remap}> = ({r}) => (
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
