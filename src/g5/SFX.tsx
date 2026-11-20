import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1-3 recap: 09:20, he at your desk, «не давай дотронуться», his hand
	{at: s(1), file: 'rewind', vol: 0.45},
	...W(1, 64),
	{at: s(2), file: 'rewind', vol: 0.3},
	{at: s(3), file: 'rewind', vol: 0.3},
	// 4 title
	{at: s(4), file: 'boom', vol: 0.9},
	{at: s(4) + 26, file: 'pop', vol: 0.4},
	// 5 you pull your hand away; his smile fades
	{at: s(5) + 6, file: 'whoosh', vol: 0.5},
	{at: s(5) + 40, file: 'heart', vol: 0.5, len: 67},
	// 6 «Зря» — in your voice
	{at: s(6) + 4, file: 'pop', vol: 0.4},
	{at: s(6) + 52, file: 'glitch', vol: 0.6},
	// 7 you run; your own footsteps behind you
	{at: s(7), file: 'steps', vol: 0.7, len: 102},
	{at: s(7) + 50, file: 'steps_slow', vol: 0.5, len: 52},
	// 8 he just walks
	{at: s(8), file: 'steps_slow', vol: 0.7, len: 105},
	{at: s(8) + 80, file: 'heart_big', vol: 0.5},
	// 9 Max grabs you at the stairs
	{at: s(9) + 40, file: 'cloth', vol: 0.6},
	{at: s(9) + 56, file: 'pop', vol: 0.4},
	{at: s(9) + 80, file: 'pop', vol: 0.4},
	// 10 the cloakroom
	{at: s(10) + 8, file: 'whoosh', vol: 0.4},
	{at: s(10) + 32, file: 'cloth', vol: 0.6},
	{at: s(10) + 50, file: 'heart', vol: 0.4, len: 55},
	// 11 the phone vibrates: a new voice message
	{at: s(11), file: 'vibrate', vol: 0.7, len: 36},
	{at: s(11) + 38, file: 'message', vol: 0.5},
	{at: s(11) + 74, file: 'tick', vol: 0.4},
	// 12 the message (phone voice)
	{at: s(12), file: 'heart', vol: 0.4, len: 170},
	// 13 the see-through hand
	{at: s(13) + 36, file: 'swell', vol: 0.5},
	{at: s(13) + 44, file: 'glitch', vol: 0.35},
	// 14 «мама… исчезнешь совсем… беги домой»
	{at: s(14), file: 'heart', vol: 0.45, len: 141},
	{at: s(14) + 90, file: 'pop', vol: 0.5}, // «?» in the counter
	{at: s(14) + 118, file: 'stamp', vol: 0.7},
	// 15 running home, past the lift
	{at: s(15), file: 'steps', vol: 0.7, len: 72},
	{at: s(15) + 40, file: 'lift_ding', vol: 0.4},
	{at: s(15) + 84, file: 'whisper', vol: 0.35},
	// 16 the 7th floor; the doorbell
	{at: s(16), file: 'steps', vol: 0.5, len: 30},
	...W(16, 32),
	{at: s(16) + 40, file: 'ringtone_door', vol: 0.6, len: 40},
	{at: s(16) + 70, file: 'swell', vol: 0.4},
	// 17 mom opens the door
	{at: s(17), file: 'creak', vol: 0.6},
	{at: s(17) + 44, file: 'heart', vol: 0.45, len: 54},
	// 18 HE comes out of the kitchen
	{at: s(18) + 4, file: 'steps_slow', vol: 0.5, len: 46},
	{at: s(18) + 48, file: 'heart_big', vol: 0.6},
	{at: s(18) + 100, file: 'pop', vol: 0.4},
	// 19 two sons, one face
	{at: s(19), file: 'heart', vol: 0.5, len: 72},
	...W(19, 70),
	{at: s(19) + 102, file: 'boom', vol: 0.7},
	// 20 «Кто из вас… мой?»
	{at: s(20), file: 'swell', vol: 0.5},
	// 21 finale
	{at: s(21), file: 'boom', vol: 1},
	{at: s(21) + 8, file: 'pop', vol: 0.5},
	{at: s(21) + 78, file: 'pop', vol: 0.5},
	{at: s(21) + 150, file: 'beep', vol: 0.8},
	{at: s(21) + 180, file: 'beep', vol: 0.8},
	{at: s(21) + 210, file: 'beep', vol: 0.8},
	{at: s(21) + 236, file: 'beep_final', vol: 0.9},
	{at: s(21) + 252, file: 'whoosh', vol: 0.7},
	{at: s(21) + 285, file: 'pop', vol: 0.5},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(21) + 252;

export const SFXG5: React.FC<{r: Remap}> = ({r}) => (
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
