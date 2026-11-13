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
	// 2-4 recap of part 4
	{at: s(2), file: 'rewind', vol: 0.5},
	...W(2, 54),
	{at: s(3), file: 'rewind', vol: 0.3},
	{at: s(4) + 38, file: 'whisper', vol: 0.5, len: 50},
	// 5 title
	{at: s(5), file: 'boom', vol: 0.9},
	// 6 sleepwalker
	{at: s(6), file: 'heart', vol: 0.5, len: 80},
	...W(6, 78),
	// 7 past him
	{at: s(7), file: 'steps_slow', vol: 0.55, len: 114},
	{at: s(7) + 60, file: 'breath', vol: 0.35, len: 54},
	// 8 the smell of diesel / nothing
	{at: s(8) + 60, file: 'swell', vol: 0.5},
	...W(8, 60),
	// 9 he follows you step for step
	{at: s(9), file: 'steps_slow', vol: 0.7, len: 105},
	{at: s(9) + 70, file: 'floorcreak', vol: 0.5},
	// 10 rule five broken
	{at: s(10), file: 'heart', vol: 0.45, len: 120},
	{at: s(10) + 50, file: 'pop', vol: 0.45},
	{at: s(10) + 80, file: 'stamp', vol: 1},
	{at: s(10) + 81, file: 'boom', vol: 0.5},
	// 11 lying down, the heartbeat
	{at: s(11) + 6, file: 'cloth', vol: 0.5},
	{at: s(11) + 60, file: 'heart', vol: 0.9, len: 72},
	// 12 the bed creaks
	{at: s(12) + 4, file: 'creak', vol: 0.7},
	{at: s(12) + 40, file: 'cloth', vol: 0.4},
	// 13 finger snaps
	{at: s(13) + 78, file: 'snap', vol: 1},
	{at: s(13) + 84, file: 'snap', vol: 1},
	// 14 he watches you
	{at: s(14), file: 'tick', vol: 0.5, len: 96},
	// 15 the whisper at your ear
	{at: s(15) + 48, file: 'whisper', vol: 0.6, len: 48},
	{at: s(15), file: 'heart', vol: 0.45, len: 102},
	// 16 memory: the lake
	{at: s(16), file: 'lake', vol: 0.5, len: 123},
	{at: s(16), file: 'rewind', vol: 0.3},
	// 17 «Папа сам скажет»
	{at: s(17) + 54, file: 'whisper', vol: 0.55, len: 40},
	{at: s(17) + 78, file: 'heart_big', vol: 0.9},
	// 18 he leaves
	{at: s(18), file: 'steps_slow', vol: 0.5, len: 36},
	{at: s(18) + 36, file: 'creak', vol: 0.55},
	{at: s(18) + 56, file: 'lock', vol: 0.6},
	{at: s(18) + 62, file: 'gasp', vol: 0.5},
	// 19 the front door slams
	{at: s(19) + 23, file: 'slam', vol: 1},
	{at: s(19) + 24, file: 'boom', vol: 0.6},
	// 20 run to the window
	{at: s(20), file: 'steps', vol: 0.6, len: 26},
	...W(20, 28),
	// 21 he turns, you duck
	{at: s(21) + 20, file: 'heart_big', vol: 0.9},
	{at: s(21) + 46, file: 'whoosh', vol: 0.5},
	{at: s(21) + 52, file: 'cloth', vol: 0.5},
	// 22 the light in dad's garage
	{at: s(22) + 26, file: 'switch', vol: 0.5},
	{at: s(22) + 40, file: 'swell', vol: 0.6},
	{at: s(22) + 60, file: 'stamp', vol: 0.5},
	// 23 finale
	{at: s(23), file: 'boom', vol: 1},
	{at: s(23) + 8, file: 'pop', vol: 0.5},
	{at: s(23) + 71, file: 'pop', vol: 0.5},
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

export const SFX5: React.FC<{r: Remap}> = ({r}) => (
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
