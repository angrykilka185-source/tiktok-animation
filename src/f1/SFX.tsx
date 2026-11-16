import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 a photo: dad is home → the cinema
	{at: s(1) + 2, file: 'pop', vol: 0.4},
	...W(1, 98),
	{at: s(1) + 100, file: 'steps', vol: 0.4, len: 50},
	// 2 free tickets, the cashier
	{at: s(2) + 24, file: 'stamp', vol: 0.6},
	...W(2, 46),
	{at: s(2) + 80, file: 'swell', vol: 0.4},
	// 3 the empty hall
	{at: s(3) + 10, file: 'creak', vol: 0.25},
	{at: s(3) + 30, file: 'heart', vol: 0.3, len: 60},
	// 4 lights out, the title
	{at: s(4) + 22, file: 'switch', vol: 0.6},
	{at: s(4) + 60, file: 'boom', vol: 0.6},
	{at: s(4) + 60, file: 'swell', vol: 0.4},
	// 5-7 the film: your entrance, your flat, you, the door, borscht, garage 17, «карась»
	...W(5, 42, 74),
	{at: s(6) + 10, file: 'handle', vol: 0.4},
	{at: s(6) + 76, file: 'stamp', vol: 0.7},
	...W(7, 31, 45, 64, 123),
	{at: s(7) + 34, file: 'pop', vol: 0.4},
	{at: s(7) + 48, file: 'pop', vol: 0.4},
	{at: s(7) + 67, file: 'pop', vol: 0.4},
	{at: s(7) + 125, file: 'boom', vol: 0.5},
	// 8 «Пап, кто это снял?»
	...W(8, 62),
	{at: s(8) + 64, file: 'heart', vol: 0.45, len: 110},
	// 9 the screen shows this hall — now
	{at: s(9) + 36, file: 'glitch', vol: 0.5},
	{at: s(9) + 124, file: 'heart_big', vol: 0.7},
	{at: s(9) + 124, file: 'boom', vol: 0.5},
	// 10 on the screen dad's seat is empty
	{at: s(10) + 40, file: 'swell', vol: 0.4},
	{at: s(10) + 112, file: 'stamp', vol: 0.55},
	// 11 dad doesn't blink
	{at: s(11), file: 'heart', vol: 0.5, len: 105},
	// 12 a seat creaks behind you
	{at: s(12) + 14, file: 'creak', vol: 0.9},
	{at: s(12) + 40, file: 'floorcreak', vol: 0.4},
	{at: s(12) + 50, file: 'gasp', vol: 0.4},
	// 13-14 the figure leans to your ear: «Привет, тигрёнок»
	{at: s(13), file: 'heart', vol: 0.5, len: 90},
	{at: s(13) + 10, file: 'swell', vol: 0.45},
	{at: s(14) + 4, file: 'heart_big', vol: 0.8},
	{at: s(14) + 6, file: 'whisper', vol: 0.5},
	{at: s(14) + 18, file: 'glitch', vol: 0.45},
	// 15 not from the speakers
	{at: s(15) + 22, file: 'stamp', vol: 0.6},
	...W(15, 42),
	{at: s(15) + 48, file: 'breath', vol: 0.5},
	// 16 nobody behind, a seat folds up
	{at: s(16), file: 'whoosh', vol: 0.6},
	{at: s(16) + 30, file: 'creak', vol: 0.6},
	// 17 dad's seat is empty
	{at: s(17) + 40, file: 'heart_big', vol: 0.8},
	...W(17, 78),
	// 18 his ticket: «Не досматривай»
	...W(18, 54),
	{at: s(18) + 56, file: 'cloth', vol: 0.35},
	{at: s(18) + 100, file: 'swell', vol: 0.4},
	// 19 «Продолжение следует»
	{at: s(19) + 18, file: 'boom', vol: 0.6},
	{at: s(19) + 18, file: 'swell', vol: 0.4},
	{at: s(19) + 60, file: 'pop', vol: 0.4}, // «?» in the counter
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

export const SFXF1: React.FC<{r: Remap}> = ({r}) => (
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
