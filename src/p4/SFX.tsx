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
	// 2-3 recap of part 3
	{at: s(2), file: 'rewind', vol: 0.5},
	{at: s(2) + 10, file: 'beep', vol: 0.4},
	{at: s(2) + 58, file: 'ringtone_door', vol: 0.8, len: 60},
	{at: s(3), file: 'rewind', vol: 0.3},
	// 4 title
	{at: s(4), file: 'boom', vol: 0.9},
	// 5 3:00, the camera, the corridor
	{at: s(5), file: 'tick', vol: 0.45, len: 36},
	{at: s(5) + 40, file: 'recbeep', vol: 0.7},
	{at: s(5) + 70, file: 'steps_slow', vol: 0.6, len: 59},
	{at: s(5) + 100, file: 'floorcreak', vol: 0.5},
	// 6 the door ajar
	{at: s(6), file: 'heart', vol: 0.5, len: 81},
	{at: s(6) + 46, file: 'creak', vol: 0.6},
	// 7-8 the bedroom, someone under the blanket
	{at: s(7), file: 'breath', vol: 0.35, len: 129},
	{at: s(8), file: 'heart', vol: 0.7, len: 99},
	// 9 the blanket → pillows
	{at: s(9) + 12, file: 'cloth', vol: 0.9},
	{at: s(9) + 30, file: 'swell', vol: 0.5},
	{at: s(9) + 44, file: 'boom', vol: 0.6},
	// 10 where is he?
	{at: s(10), file: 'gasp', vol: 0.6},
	// 11 rewinding
	{at: s(11), file: 'rewind', vol: 0.8},
	// 12 0:12 — the man in the corner
	{at: s(12), file: 'heart', vol: 0.6, len: 156},
	{at: s(12) + 60, file: 'swell', vol: 0.6},
	{at: s(12) + 110, file: 'heart_big', vol: 1},
	// 13 the corner is empty
	{at: s(13), file: 'breath', vol: 0.3, len: 66},
	...W(13, 18),
	// 14 rule 5, the shape behind you
	{at: s(14) + 2, file: 'stamp', vol: 0.45},
	{at: s(14) + 56, file: 'floorcreak', vol: 0.7},
	// 15 the whisper behind your back
	{at: s(15) + 28, file: 'whisper', vol: 0.75, len: 50},
	{at: s(15) + 70, file: 'heart_big', vol: 1},
	// 16 finale
	{at: s(16), file: 'boom', vol: 1},
	{at: s(16) + 8, file: 'pop', vol: 0.5},
	{at: s(16) + 80, file: 'pop', vol: 0.5},
	{at: s(16) + 150, file: 'beep', vol: 0.8},
	{at: s(16) + 180, file: 'beep', vol: 0.8},
	{at: s(16) + 210, file: 'beep', vol: 0.8},
	{at: s(16) + 236, file: 'beep_final', vol: 0.9},
	{at: s(16) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(16) + 252;

export const SFX4: React.FC<{r: Remap}> = ({r}) => (
	<>
		<Sequence from={0} durationInFrames={Math.round(r.fwd(BED_END)) + 30} name="sfx drone bed">
			<Audio src={staticFile('sfx/drone.wav')} volume={(f) => 0.32 * interpolate(f, [0, 60, r.fwd(BED_END) - 10, r.fwd(BED_END) + 20], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
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
