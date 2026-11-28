import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s} from './timeline';
import {HAS_VOICE, VOICE, w} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const at = (n: number, word: string | number, add = 0) => s(n) + w(n, word, add);

const CUES: Cue[] = [
	// 1 a quarrel: STOP, the spark
	{at: Math.max(0, at(1, 'стоп', -6)), file: 'stamp', vol: 0.9},
	{at: at(1, 'спор', -2), file: 'boom', vol: 0.8},
	{at: at(1, 'спор', 4), file: 'sparks', vol: 0.4, len: 40},
	{at: at(1, 'стоп', 8), file: 'pop', vol: 0.45},
	{at: at(1, 'спор', 6), file: 'pop', vol: 0.45},
	// 2 Чоби: long videos — the bar fills up, Гога yawns
	{at: s(2), file: 'whoosh', vol: 0.4},
	{at: at(2, 'длинные', -2), file: 'pop', vol: 0.55},
	{at: at(2, 'девять'), file: 'pop', vol: 0.5},
	...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: at(2, 'девять', 4 + i * 8), file: 'tick', vol: 0.3})),
	{at: at(2, 'подробности'), file: 'pop', vol: 0.5},
	{at: at(2, 'источники'), file: 'pop', vol: 0.5},
	{at: at(2, 'девять', 18), file: 'exhale', vol: 0.4, len: 40},
	// 3 Гога: short videos — the feed flips
	{at: s(3), file: 'whoosh', vol: 0.4},
	{at: at(3, 'короткие', -2), file: 'pop', vol: 0.55},
	{at: at(3, 'тридцать'), file: 'pop', vol: 0.5},
	...[at(3, 'тридцать', 4), at(3, 'секунд', 6), at(3, 'дальше', -8), at(3, 'дальше', 6), at(3, 'дальше', 18)].map((t) => ({at: t, file: 'whoosh', vol: 0.25, len: 14})),
	{at: at(3, 'дальше', -6), file: 'pop', vol: 0.45},
	{at: at(3, 'дальше', 8), file: 'pop', vol: 0.5},
	{at: at(3, 'дальше', 20), file: 'pop', vol: 0.55},
	// 4 the question: the scales
	{at: s(4), file: 'whoosh', vol: 0.4},
	{at: s(4) + 4, file: 'pop', vol: 0.5},
	{at: at(4, 'лучше', -2), file: 'clank', vol: 0.5},
	{at: at(4, 'лучше', 2), file: 'pop', vol: 0.5},
	{at: at(4, 'лучше', 14), file: 'tick', vol: 0.3},
	{at: at(4, 'лучше', 30), file: 'tick', vol: 0.3},
	{at: at(4, 'тебе'), file: 'pop', vol: 0.55},
	{at: at(4, 'тебе', 2), file: 'glint', vol: 0.4},
	// 5 the vote
	{at: s(5), file: 'whoosh', vol: 0.4},
	{at: at(5, 'пиши', 2), file: 'pop', vol: 0.5},
	{at: at(5, 'пиши', 8), file: 'pop', vol: 0.5},
	{at: at(5, 'один', -2), file: 'stamp', vol: 0.6},
	{at: at(5, 'один'), file: 'pop', vol: 0.5},
	{at: at(5, 'два', -2), file: 'stamp', vol: 0.6},
	{at: at(5, 'два'), file: 'pop', vol: 0.5},
	// 6 the tug of war
	{at: s(6), file: 'whoosh', vol: 0.4},
	{at: at(6, 'победит', -2), file: 'pop', vol: 0.5},
	{at: at(6, 'победит', 4), file: 'pop', vol: 0.5},
	{at: at(6, 'победит', 6), file: 'scrape', vol: 0.3, len: 60},
	{at: at(6, 'чаще', 2), file: 'swell', vol: 0.35},
	{at: at(6, 'чаще', 8), file: 'pop', vol: 0.55},
	// 7 the finish: the vote, the swipe
	{at: at(7, 'голосуй', -2), file: 'boom', vol: 0.6},
	{at: at(7, 'голосуй', 2), file: 'pop', vol: 0.5},
	{at: at(7, 'голосуй', 10), file: 'pop', vol: 0.5},
	{at: at(7, 'пролистал', 4), file: 'whoosh', vol: 0.7, len: 30},
	{at: at(7, 'пролистал', 10), file: 'snap', vol: 0.5},
];

const SFX_GAIN = HAS_VOICE ? 0.42 : 1; // the voice comes first
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SFXQ1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{CUES.map((c, i) => {
			const from = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - from, r.total - from));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={i} from={from} durationInFrames={len} name={`sfx ${c.file}`}>
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
