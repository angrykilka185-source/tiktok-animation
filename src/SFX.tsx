import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {SIGN_FLY, SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

// Sound effects only: no music, no voice.
type Cue = {at: number; file: string; vol?: number; len?: number};
const CUES: Cue[] = [
	// 1 hallway
	{at: s(1) + 4, file: 'keys', vol: 0.8},
	{at: s(1) + 36, file: 'lock'},
	{at: s(1) + 42, file: 'creak', vol: 0.8},
	{at: s(1) + 86, file: 'pop', vol: 0.35},
	// 2 mom
	{at: s(2) + 4, file: 'pop', vol: 0.3},
	{at: s(2) + 14, file: 'gasp', vol: 0.9},
	{at: s(2) + 26, file: 'cloth', vol: 0.8},
	// 3 hand on head
	{at: s(3), file: 'steps', vol: 0.8},
	{at: s(3) + 56, file: 'pat', vol: 0.9},
	// 4 kitchen
	{at: s(4) + 26, file: 'plate', vol: 0.8},
	{at: s(4) + 50, file: 'plate', vol: 0.35},
	{at: s(4) + 102, file: 'gulp', vol: 0.9},
	// 5 fork
	{at: s(5) + 11, file: 'fork', vol: 0.9},
	{at: s(5) + 48, file: 'whoosh', vol: 0.7},
	// 6 eyes
	{at: s(6), file: 'tick', vol: 0.7, len: 180},
	{at: s(6) + 84, file: 'heart', vol: 0.9, len: 96},
	// 7 wall
	{at: s(7), file: 'steps', vol: 0.8},
	{at: s(7) + 60, file: 'bump', vol: 1},
	// 8 scar
	{at: s(8), file: 'whoosh', vol: 0.6},
	// 9 whisper + tap water
	{at: s(9), file: 'water', vol: 0.45, len: 150},
	{at: s(9) + 20, file: 'whisper', vol: 0.8, len: 72},
	// 10 night
	{at: s(10), file: 'breath', vol: 0.7, len: 180},
	{at: s(10) + 12, file: 'floorcreak', vol: 0.8},
	{at: s(10) + 120, file: 'floorcreak', vol: 0.6},
	// 11 dark kitchen
	{at: s(11), file: 'fridge', vol: 0.6, len: 180},
	{at: s(11), file: 'tick', vol: 0.55, len: 180},
	// 12 phone
	{at: s(12), file: 'vibrate', vol: 0.9, len: 120},
	// 13 message
	{at: s(13) + 34, file: 'message', vol: 0.8},
	// 14 face
	{at: s(14) + 16, file: 'heart_big', vol: 1},
	{at: s(14) + 60, file: 'heart', vol: 0.75, len: 90},
	// 15 he enters
	{at: s(15) + 2, file: 'steps_slow', vol: 0.8},
	{at: s(15) + 48, file: 'floorcreak', vol: 0.8},
	{at: s(15) + 160, file: 'swell', vol: 0.8},
	// 16 finale
	{at: s(16), file: 'boom', vol: 1},
	{at: s(16) + 50, file: 'pop', vol: 0.5},
	{at: s(16) + 66, file: 'pop', vol: 0.5},
	{at: s(16) + 135, file: 'beep', vol: 0.8},
	{at: s(16) + 165, file: 'beep', vol: 0.8},
	{at: s(16) + 195, file: 'beep', vol: 0.8},
	{at: s(16) + 225, file: 'beep_final', vol: 0.9},
	// sign plaques: stamp on appear, pop on landing in the counter
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold, file: 'whoosh', vol: 0.35},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

// with a voice-over the effects sit a bit lower in the mix
const SFX_GAIN = HAS_VOICE ? 0.6 : 1;

export const SFX: React.FC = () => (
	<>
		{CUES.map((c, i) => (
			<Sequence key={i} from={c.at} durationInFrames={c.len ?? 200} name={`sfx ${c.file}`}>
				<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(c.vol ?? 1) * SFX_GAIN} />
			</Sequence>
		))}
		{VOICE.map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.ceil(l.duration * 30) + 20} name={`voice ${l.id}`}>
				<Audio src={staticFile(`voice/${l.id}.mp3`)} volume={l.whisper ? 0.8 : 1} />
			</Sequence>
		))}
	</>
);
