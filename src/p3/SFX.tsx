import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, TOTAL, shotStart as s} from './timeline';
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
	// 2 recap, 3 title
	{at: s(2), file: 'rewind', vol: 0.5},
	{at: s(3), file: 'boom', vol: 0.9},
	// 4 video call: tap + ringback
	{at: s(4) + 4, file: 'pop', vol: 0.5},
	{at: s(4) + 30, file: 'beep', vol: 0.45},
	{at: s(4) + 75, file: 'beep', vol: 0.45},
	// 5 the ringtone behind the door
	{at: s(5) + 6, file: 'ringtone_door', vol: 0.9, len: 110},
	// 6 declined, 7 message
	{at: s(6) + 2, file: 'decline', vol: 0.8},
	{at: s(7) + 8, file: 'message', vol: 0.8},
	// 8 eyes → shadow
	{at: s(8), file: 'heart', vol: 0.8, len: 150},
	...W(8, 56),
	// 9 record, 10 handle
	{at: s(9) + 6, file: 'recbeep', vol: 0.7},
	{at: s(9), file: 'breath', vol: 0.4, len: 120},
	{at: s(10) + 30, file: 'handle', vol: 0.9},
	// 11 knocks + whisper
	{at: s(11) + 8, file: 'knock', vol: 1},
	{at: s(11) + 60, file: 'whisper', vol: 0.5, len: 70},
	// 12 incoming call
	{at: s(12), file: 'vibrate', vol: 0.8, len: 120},
	{at: s(12) + 4, file: 'ringtone', vol: 0.6, len: 116},
	// 13 your door on the screen
	{at: s(13) + 4, file: 'boom', vol: 0.7},
	{at: s(13) + 40, file: 'swell', vol: 0.6},
	// 14 split screen: the handle
	{at: s(14), file: 'heart', vol: 0.7, len: 150},
	{at: s(14) + 66, file: 'handle', vol: 0.9},
	// 15 light + mom
	{at: s(15) + 10, file: 'switch', vol: 0.9},
	{at: s(15) + 20, file: 'steps', vol: 0.5},
	// 16 call ended, door opens
	{at: s(16) + 4, file: 'decline', vol: 0.7},
	{at: s(16) + 48, file: 'creak', vol: 0.7},
	// 18 pupils, the bedroom door
	{at: s(18) + 6, file: 'heart_big', vol: 1},
	{at: s(18) + 60, file: 'swell', vol: 0.6},
	// 19 finale
	{at: s(19), file: 'boom', vol: 1},
	{at: s(19) + 8, file: 'pop', vol: 0.5},
	{at: s(19) + 40, file: 'pop', vol: 0.5},
	{at: s(19) + 150, file: 'beep', vol: 0.8},
	{at: s(19) + 180, file: 'beep', vol: 0.8},
	{at: s(19) + 210, file: 'beep', vol: 0.8},
	{at: s(19) + 236, file: 'beep_final', vol: 0.9},
	{at: s(19) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: g.n <= 9 ? 0.55 : 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_END = s(19) + 252;

export const SFX3: React.FC<{r: Remap}> = ({r}) => (
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
