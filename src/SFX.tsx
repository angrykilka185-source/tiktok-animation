import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {SIGN_FLY, SIGNS, TOTAL, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

// Sound design: effects + a quiet low tension bed (no music), plus the narrator.
type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.32}));
const CUES: Cue[] = [
	// 1 hallway → lock → door → close-up
	{at: s(1) + 72, file: 'keys', vol: 0.8},
	{at: s(1) + 102, file: 'lock'},
	{at: s(1) + 116, file: 'creak', vol: 0.8},
	{at: s(1) + 134, file: 'pop', vol: 0.35},
	...W(1, 70, 120, 156),
	// 2 mom
	{at: s(2) + 4, file: 'gasp', vol: 0.8},
	{at: s(2) + 28, file: 'cloth', vol: 0.8},
	...W(2, 38),
	// 3 pat on the head, close-ups
	{at: s(3), file: 'steps', vol: 0.8},
	{at: s(3) + 40, file: 'pat', vol: 0.9},
	...W(3, 46, 86),
	// 4 kitchen
	{at: s(4) + 40, file: 'plate', vol: 0.8},
	{at: s(4) + 98, file: 'plate', vol: 0.35},
	{at: s(4) + 140, file: 'gulp', vol: 0.9},
	...W(4, 90, 125),
	// 5 fork
	{at: s(5) + 10, file: 'fork', vol: 0.9},
	...W(5, 58),
	// 6 photo → face → eyes
	{at: s(6), file: 'tick', vol: 0.5, len: 192},
	{at: s(6) + 86, file: 'heart', vol: 0.8, len: 106},
	...W(6, 48, 86),
	// 7 wall
	{at: s(7), file: 'steps', vol: 0.8},
	{at: s(7) + 100, file: 'bump', vol: 1},
	...W(7, 112, 160),
	// 8 scar
	...W(8, 0, 58),
	// 9 whisper + tap water
	{at: s(9), file: 'water', vol: 0.35, len: 150},
	...W(9, 70),
	// 10 night
	{at: s(10), file: 'breath', vol: 0.5, len: 180},
	{at: s(10) + 6, file: 'floorcreak', vol: 0.8},
	{at: s(10) + 100, file: 'floorcreak', vol: 0.6},
	...W(10, 84),
	// 11 dark kitchen
	{at: s(11), file: 'fridge', vol: 0.5, len: 180},
	{at: s(11), file: 'tick', vol: 0.45, len: 180},
	{at: s(11) + 80, file: 'pop', vol: 0.4},
	...W(11, 62),
	// 12 phone
	{at: s(12), file: 'vibrate', vol: 0.9, len: 120},
	...W(12, 70),
	// 13 message
	{at: s(13) + 30, file: 'message', vol: 0.8},
	...W(13, 90),
	// 14 face
	{at: s(14) + 8, file: 'heart_big', vol: 1},
	{at: s(14) + 88, file: 'heart', vol: 0.7, len: 62},
	...W(14, 88),
	// 15 he enters
	{at: s(15) + 2, file: 'steps_slow', vol: 0.8},
	{at: s(15) + 50, file: 'floorcreak', vol: 0.8},
	{at: s(15) + 150, file: 'swell', vol: 0.8},
	...W(15, 92),
	// 16 finale
	{at: s(16), file: 'boom', vol: 1},
	{at: s(16) + 8, file: 'pop', vol: 0.5},
	{at: s(16) + 40, file: 'pop', vol: 0.5},
	{at: s(16) + 150, file: 'beep', vol: 0.8},
	{at: s(16) + 180, file: 'beep', vol: 0.8},
	{at: s(16) + 210, file: 'beep', vol: 0.8},
	{at: s(16) + 236, file: 'beep_final', vol: 0.9},
	{at: s(16) + 252, file: 'whoosh', vol: 0.7},
	// sign plaques: stamp on appear, whoosh + pop when they land in the counter
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold, file: 'whoosh', vol: 0.3},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

// with a voice-over the effects sit lower in the mix
const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(16) + 252;

export const SFX: React.FC = () => (
	<>
		{/* low tension bed, fades out before the end card */}
		<Sequence from={0} durationInFrames={BED_END + 30} name="sfx drone bed">
			<Audio
				src={staticFile('sfx/drone.wav')}
				volume={(f) => 0.32 * interpolate(f, [0, 60, BED_END - 10, BED_END + 20], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
		</Sequence>
		{CUES.map((c, i) => (
			<Sequence key={i} from={c.at} durationInFrames={Math.min(c.len ?? 200, TOTAL - c.at)} name={`sfx ${c.file}`}>
				<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(c.vol ?? 1) * SFX_GAIN} />
			</Sequence>
		))}
		{VOICE.filter((l) => l.hasAudio).map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.min(Math.ceil(l.duration * 30) + 20, TOTAL - l.at)} name={`voice ${l.id}`}>
				<Audio src={staticFile(`voice/${l.id}.mp3`)} volume={1} />
			</Sequence>
		))}
	</>
);
