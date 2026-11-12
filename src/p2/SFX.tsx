import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {SIGN_FLY} from '../timeline';
import {SIGNS, TOTAL, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';
import type {Remap} from '../edit';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.32}));

// shot 1 is the same as in part 1
const OPENING: Cue[] = [
	{at: 72, file: 'keys', vol: 0.8},
	{at: 102, file: 'lock'},
	{at: 116, file: 'creak', vol: 0.8},
	{at: 134, file: 'pop', vol: 0.35},
	...W(1, 70, 120, 156),
];

const CUES: Cue[] = [
	...OPENING,
	// 2 recap, 3 title
	{at: s(2), file: 'rewind', vol: 0.5},
	{at: s(3), file: 'boom', vol: 0.9},
	// 4 kitchen, the question
	{at: s(4) + 4, file: 'fork', vol: 0.35},
	{at: s(4) + 40, file: 'fork', vol: 0.3},
	{at: s(4), file: 'tick', vol: 0.4, len: 150},
	...W(4, 72),
	// 5 fishing flashback
	{at: s(5), file: 'lake', vol: 0.6, len: 120},
	{at: s(5), file: 'swell', vol: 0.35},
	// 6 he thinks
	{at: s(6), file: 'tick', vol: 0.75, len: 150},
	{at: s(6) + 60, file: 'heart', vol: 0.7, len: 90},
	// 7 answer → verdict
	{at: s(7) + 62, file: 'whoosh', vol: 0.5},
	{at: s(7) + 68, file: 'stamp', vol: 0.8},
	{at: s(7) + 84, file: 'pop', vol: 0.6},
	// 8 the smile goes away
	{at: s(8), file: 'swell', vol: 0.5},
	{at: s(8) + 70, file: 'flicker', vol: 0.6},
	// 9 mom
	{at: s(9), file: 'steps', vol: 0.7},
	// 10 whisper
	{at: s(10), file: 'steps_slow', vol: 0.6},
	{at: s(10) + 46, file: 'whisper', vol: 0.5, len: 80},
	...W(10, 40),
	// 11 phone
	{at: s(11), file: 'whoosh', vol: 0.4},
	{at: s(11) + 40, file: 'heart_big', vol: 0.9},
	...W(11, 84),
	// 12 empty wall
	{at: s(12), file: 'tick', vol: 0.5, len: 150},
	{at: s(12) + 100, file: 'stamp', vol: 0.5},
	// 13 torn photo
	{at: s(13) + 60, file: 'tear', vol: 1},
	{at: s(13) + 120, file: 'whoosh', vol: 0.4},
	// 14 night: lock, handle
	{at: s(14) + 28, file: 'lock', vol: 0.9},
	{at: s(14) + 80, file: 'handle', vol: 0.9},
	{at: s(14) + 70, file: 'breath', vol: 0.4, len: 110},
	...W(14, 70),
	// 15 message
	{at: s(15) + 20, file: 'vibrate', vol: 0.9, len: 46},
	{at: s(15) + 26, file: 'message', vol: 0.7},
	// 16 under the door
	{at: s(16), file: 'breath', vol: 0.6, len: 150},
	{at: s(16) + 40, file: 'floorcreak', vol: 0.7},
	{at: s(16) + 130, file: 'swell', vol: 0.7},
	// 17 finale
	{at: s(17), file: 'boom', vol: 1},
	{at: s(17) + 8, file: 'pop', vol: 0.5},
	{at: s(17) + 40, file: 'pop', vol: 0.5},
	{at: s(17) + 150, file: 'beep', vol: 0.8},
	{at: s(17) + 180, file: 'beep', vol: 0.8},
	{at: s(17) + 210, file: 'beep', vol: 0.8},
	{at: s(17) + 236, file: 'beep_final', vol: 0.9},
	{at: s(17) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: g.n <= 6 ? 0.55 : 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(17) + 252;

export const SFX2: React.FC<{r: Remap}> = ({r}) => (
	<>
		<Sequence from={0} durationInFrames={Math.round(r.fwd(BED_END)) + 30} name="sfx drone bed">
			<Audio src={staticFile('sfx/drone.wav')} volume={(f) => 0.32 * interpolate(f, [0, 60, r.fwd(BED_END) - 10, r.fwd(BED_END) + 20], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
		</Sequence>
		{CUES.map((c, i) => {
			// every effect fades out at the end of its slot instead of being cut off
			const at = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - at, r.total - at));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={i} from={at} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio
						src={staticFile(`sfx/${c.file}.wav`)}
						volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : vol)}
					/>
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
