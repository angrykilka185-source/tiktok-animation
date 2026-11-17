import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};

const CUES: Cue[] = [
	// 1 an "episode" starts: dad in the doorway → STOP (pause)
	{at: 0, file: 'creak', vol: 0.5},
	{at: 4, file: 'heart', vol: 0.4, len: 20},
	{at: 20, file: 'switch', vol: 0.8},
	{at: 20, file: 'glitch', vol: 0.55},
	{at: 22, file: 'stamp', vol: 0.9},
	// 2 the heroes gather
	{at: s(2), file: 'whoosh', vol: 0.4},
	{at: s(2) + 8, file: 'pop', vol: 0.5},
	{at: s(2) + 14, file: 'pop', vol: 0.3},
	{at: s(2) + 34, file: 'pop', vol: 0.5},
	{at: s(2) + 40, file: 'pop', vol: 0.3},
	// 3 the big button
	{at: s(3), file: 'whoosh', vol: 0.35},
	{at: s(3) + 6, file: 'pop', vol: 0.45},
	{at: s(3) + 30, file: 'swell', vol: 0.35},
	// 4 the channel feed
	{at: s(4), file: 'whoosh', vol: 0.35},
	{at: s(4) + 14, file: 'message', vol: 0.5},
	{at: s(4) + 64, file: 'message', vol: 0.5},
	{at: s(4) + 80, file: 'tick', vol: 0.4},
	{at: s(4) + 90, file: 'tick', vol: 0.4},
	// 5 the goal: 700 subscribers
	{at: s(5), file: 'whoosh', vol: 0.35},
	...[7, 13, 19, 25, 31, 37, 43].map((o) => ({at: s(5) + o, file: 'tick', vol: 0.3})),
	{at: s(5) + 12, file: 'swell', vol: 0.4},
	{at: s(5) + 47, file: 'pop', vol: 0.6},
	{at: s(5) + 47, file: 'switch', vol: 0.5},
	{at: s(5) + 49, file: 'applause', vol: 0.3, len: 40},
	// 6 "dad" is already subscribed
	{at: s(6), file: 'creak', vol: 0.45},
	{at: s(6) + 2, file: 'heart_big', vol: 0.6},
	{at: s(6) + 33, file: 'pop', vol: 0.5},
	{at: s(6) + 35, file: 'whisper', vol: 0.3},
	{at: s(6) + 41, file: 'pop', vol: 0.3},
	// 7 so — are we opening it?
	{at: s(7), file: 'whoosh', vol: 0.4},
	{at: s(7) + 16, file: 'pop', vol: 0.5},
	// 8 the choice
	{at: s(8), file: 'boom', vol: 0.9},
	{at: s(8) + 8, file: 'pop', vol: 0.5},
	{at: s(8) + 76, file: 'pop', vol: 0.5},
	{at: s(8) + 120, file: 'beep', vol: 0.8},
	{at: s(8) + 150, file: 'beep', vol: 0.8},
	{at: s(8) + 180, file: 'beep', vol: 0.8},
	{at: s(8) + 206, file: 'beep_final', vol: 0.9},
	{at: s(8) + 222, file: 'whoosh', vol: 0.6},
];

const SFX_GAIN = HAS_VOICE ? 0.42 : 1; // a promo: the voice comes first
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone under the whole video, like in the series: no dead silence between the phrases
const BEDS: [number, number][] = [[0, TOTAL]];

export const SFXT1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{BEDS.map(([a, b], k) => {
			const from = Math.round(r.fwd(a));
			const len = Math.round(r.fwd(b)) - from;
			return (
				<Sequence key={k} from={from} durationInFrames={len} name={`sfx drone bed ${k + 1}`}>
					<Audio src={staticFile('sfx/drone.wav')} loop volume={(f) => 0.2 * interpolate(f, [0, 12, len - 12, len - 1], [0, 1, 1, 0], clampX)} />
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
