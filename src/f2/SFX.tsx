import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 recap of part 1: the empty seat, the ticket
	{at: 0, file: 'rewind', vol: 0.45},
	{at: 4, file: 'creak', vol: 0.4},
	...W(1, 70),
	{at: 100, file: 'tear', vol: 0.35},
	// 2 title: part 2, you chose to look for dad
	{at: s(2), file: 'boom', vol: 0.85},
	{at: s(2) + 28, file: 'pop', vol: 0.45},
	// 3 you run out of the hall
	{at: s(3), file: 'steps', vol: 0.7, len: 60},
	{at: s(3) + 6, file: 'laugh', vol: 0.3},
	{at: s(3) + 36, file: 'handle', vol: 0.5},
	// 4 on the screen behind you — you run out too
	{at: s(4), file: 'glitch', vol: 0.35},
	{at: s(4) + 4, file: 'steps', vol: 0.35, len: 60},
	{at: s(4) + 50, file: 'heart', vol: 0.5, len: 60},
	// 5 the empty foyer
	{at: s(5), file: 'slam', vol: 0.4},
	{at: s(5) + 10, file: 'tick', vol: 0.3},
	{at: s(5) + 40, file: 'tick', vol: 0.3},
	// 6 you on every poster
	...W(6, 4, 60),
	{at: s(6) + 30, file: 'swell', vol: 0.45},
	{at: s(6) + 88, file: 'stamp', vol: 0.55},
	// 7 calling dad → his ringtone somewhere above the hall
	{at: s(7) + 6, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 14, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 22, file: 'beep', vol: 0.18, len: 6},
	{at: s(7) + 34, file: 'ringtone', vol: 0.35, len: 64},
	// 8 the projection booth door, the beam
	{at: s(8), file: 'whoosh', vol: 0.3},
	{at: s(8) + 64, file: 'swell', vol: 0.35},
	// 9 the narrow stairs
	{at: s(9), file: 'steps_slow', vol: 0.6, len: 90},
	{at: s(9) + 60, file: 'creak', vol: 0.5},
	// 10 nobody — dad's phone ringing with your call
	{at: s(10) + 6, file: 'vibrate', vol: 0.7, len: 70},
	{at: s(10) + 6, file: 'ringtone', vol: 0.6, len: 110},
	{at: s(10) + 82, file: 'pop', vol: 0.4},
	// 11 dad is on the screen, inside the film
	{at: s(11), file: 'whoosh', vol: 0.35},
	{at: s(11) + 64, file: 'heart_big', vol: 0.75},
	{at: s(11) + 70, file: 'swell', vol: 0.45},
	// 12 he knocks from inside; the hall laughs
	{at: s(12) + 9, file: 'knock', vol: 0.75},
	{at: s(12) + 24, file: 'knock', vol: 0.75},
	{at: s(12) + 40, file: 'knock', vol: 0.75},
	{at: s(12) + 88, file: 'laugh', vol: 0.55},
	// 13 a new line appears on the ticket
	{at: s(13), file: 'whoosh', vol: 0.3},
	{at: s(13) + 68, file: 'whisper', vol: 0.4},
	{at: s(13) + 143, file: 'heart_big', vol: 0.7},
	// 14 the reel: a couple of minutes left
	{at: s(14), file: 'tick', vol: 0.45},
	{at: s(14) + 25, file: 'tick', vol: 0.45},
	{at: s(14) + 50, file: 'tick', vol: 0.45},
	// 15 the steps creak behind you
	{at: s(15) + 14, file: 'floorcreak', vol: 0.6},
	{at: s(15) + 44, file: 'floorcreak', vol: 0.6},
	{at: s(15) + 76, file: 'floorcreak', vol: 0.7},
	{at: s(15) + 10, file: 'heart', vol: 0.55, len: 90},
	// 16 on the screen: you in this booth — and him behind you
	{at: s(16), file: 'glitch', vol: 0.4},
	{at: s(16) + 108, file: 'heart_big', vol: 0.85},
	{at: s(16) + 112, file: 'whisper', vol: 0.45},
	// 17 finale
	{at: s(17), file: 'boom', vol: 1},
	{at: s(17) + 8, file: 'pop', vol: 0.5},
	{at: s(17) + 78, file: 'pop', vol: 0.5},
	{at: s(17) + 150, file: 'beep', vol: 0.8},
	{at: s(17) + 180, file: 'beep', vol: 0.8},
	{at: s(17) + 210, file: 'beep', vol: 0.8},
	{at: s(17) + 236, file: 'beep_final', vol: 0.9},
	{at: s(17) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way; the projector chatter from the booth door (far) to the end (near)
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [
	{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(5) ? 0.22 : 0.3)}, // the hall hum from the first frame: no dead air between the words
	{
		file: 'projector',
		a: s(8),
		b: s(17) + 120,
		vol: (o) => (o < s(9) ? 0.12 : o < s(10) ? 0.3 : o < s(17) ? 0.45 : 0.25),
	},
];

export const SFXF2: React.FC<{r: Remap}> = ({r}) => (
	<>
		{BEDS.map((b, k) => {
			const from = Math.round(r.fwd(b.a));
			const len = Math.round(r.fwd(b.b)) - from;
			return (
				<Sequence key={k} from={from} durationInFrames={len} name={`sfx bed ${b.file}`}>
					<Audio src={staticFile(`sfx/${b.file}.wav`)} loop volume={(f) => b.vol(r.inv(from + f)) * interpolate(f, [0, 20, len - 30, len - 1], [0, 1, 1, 0], clampX)} />
				</Sequence>
			);
		})}
		{CUES.map((c, i) => {
			const at = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - at, r.total - at));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={i} from={at} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], clampX) : vol)} />
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
