import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};

const CUES: Cue[] = [
	// 1 the counter runs to 700; the lock opens
	...[0, 8, 15, 21, 27, 32, 36, 40, 43, 46].map((o) => ({at: s(1) + o, file: 'tick', vol: 0.35})),
	{at: s(1) + 49, file: 'boom', vol: 0.8},
	{at: s(1) + 49, file: 'applause', vol: 0.5, len: 60},
	// 2 the promise (recap of the poll video)
	{at: s(2), file: 'rewind', vol: 0.4},
	{at: s(2) + 94, file: 'pop', vol: 0.5},
	// 3 «Обещание выполнено. ТГК — открыт!»
	{at: s(3) + 26, file: 'stamp', vol: 0.9},
	{at: s(3) + 72, file: 'boom', vol: 0.8},
	{at: s(3) + 72, file: 'applause', vol: 0.55, len: 40},
	{at: s(3) + 72, file: 'swell', vol: 0.4},
	// 4 the channel: posts pop in
	{at: s(4), file: 'whoosh', vol: 0.4},
	{at: s(4) + 36, file: 'message', vol: 0.5},
	{at: s(4) + 72, file: 'message', vol: 0.5},
	{at: s(4) + 96, file: 'pop', vol: 0.3},
	// 5 the link in the profile header: tap
	{at: s(5) + 6, file: 'pop', vol: 0.4},
	{at: s(5) + 28, file: 'tick', vol: 0.6},
	// 6 thanks; the end card
	{at: s(6) + 58, file: 'applause', vol: 0.6, len: 70},
	{at: s(6) + 60, file: 'boom', vol: 0.6},
	{at: s(6) + 116, file: 'whoosh', vol: 0.6},
	{at: s(6) + 120, file: 'pop', vol: 0.5},
];

const SFX_GAIN = HAS_VOICE ? 0.6 : 1;

export const SFXT2: React.FC<{r: Remap}> = ({r}) => (
	<>
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
