import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {SIGN_FLY, SIGNS, TOTAL, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

// Sound design: effects + a quiet low tension bed (no music), plus the narrator.
type Cue = {at: number; file: string; vol?: number; len?: number};
const CUES: Cue[] = [
	// 1 hallway
	{at: s(1) + 4, file: 'keys', vol: 0.8},
	{at: s(1) + 36, file: 'lock'},
	{at: s(1) + 42, file: 'creak', vol: 0.8},
	{at: s(1) + 86, file: 'pop', vol: 0.35},
	// 2 mom
	{at: s(2) + 4, file: 'pop', vol: 0.3},
	{at: s(2) + 14, file: 'gasp', vol: 0.8},
	{at: s(2) + 26, file: 'cloth', vol: 0.8},
	// 3 hand on head, close-ups
	{at: s(3), file: 'steps', vol: 0.8},
	{at: s(3) + 52, file: 'pat', vol: 0.9},
	{at: s(3) + 58, file: 'whoosh', vol: 0.4},
	{at: s(3) + 92, file: 'whoosh', vol: 0.4},
	// 4 kitchen
	{at: s(4) + 48, file: 'plate', vol: 0.8},
	{at: s(4) + 104, file: 'plate', vol: 0.35},
	{at: s(4) + 140, file: 'gulp', vol: 0.9},
	// 5 fork
	{at: s(5) + 11, file: 'fork', vol: 0.9},
	{at: s(5) + 48, file: 'whoosh', vol: 0.6},
	// 6 eyes
	{at: s(6), file: 'tick', vol: 0.6, len: 180},
	{at: s(6) + 84, file: 'heart', vol: 0.8, len: 96},
	// 7 wall
	{at: s(7), file: 'steps', vol: 0.8},
	{at: s(7) + 72, file: 'bump', vol: 1},
	// 8 scar
	{at: s(8), file: 'whoosh', vol: 0.6},
	// 9 whisper + tap water
	{at: s(9), file: 'water', vol: 0.4, len: 150},
	// 10 night
	{at: s(10), file: 'breath', vol: 0.6, len: 180},
	{at: s(10) + 12, file: 'floorcreak', vol: 0.8},
	{at: s(10) + 120, file: 'floorcreak', vol: 0.6},
	// 11 dark kitchen
	{at: s(11), file: 'fridge', vol: 0.55, len: 180},
	{at: s(11), file: 'tick', vol: 0.5, len: 180},
	// 12 phone
	{at: s(12), file: 'vibrate', vol: 0.9, len: 120},
	// 13 message
	{at: s(13) + 34, file: 'message', vol: 0.8},
	// 14 face
	{at: s(14) + 16, file: 'heart_big', vol: 1},
	{at: s(14) + 60, file: 'heart', vol: 0.7, len: 90},
	// 15 he enters
	{at: s(15) + 2, file: 'steps_slow', vol: 0.8},
	{at: s(15) + 48, file: 'floorcreak', vol: 0.8},
	{at: s(15) + 160, file: 'swell', vol: 0.8},
	// 16 finale
	{at: s(16), file: 'boom', vol: 1},
	{at: s(16) + 50, file: 'pop', vol: 0.5},
	{at: s(16) + 66, file: 'pop', vol: 0.5},
	{at: s(16) + 120, file: 'beep', vol: 0.8},
	{at: s(16) + 150, file: 'beep', vol: 0.8},
	{at: s(16) + 180, file: 'beep', vol: 0.8},
	{at: s(16) + 210, file: 'beep_final', vol: 0.9},
	{at: s(16) + 248, file: 'whoosh', vol: 0.7},
	// sign plaques: stamp on appear, whoosh + pop when they land in the counter
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold, file: 'whoosh', vol: 0.35},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

// with a voice-over the effects sit lower in the mix
const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(16) + 248;

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
