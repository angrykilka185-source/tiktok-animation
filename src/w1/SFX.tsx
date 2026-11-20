// «Что будет, если ты попадёшь в XX век» — the sound: the voice, a quiet bed of each decade (hooves and the crowd of
// 1901, the cinema piano of 1911, the radio of the 30s, the clock of 22 June 1941, building sites, cheering crowds,
// the winter wind of 1991) and the effects. All sounds are procedural (scripts/make-sfx.mjs): no music, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s, SHOTS} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
type Bed = {from: number; to: number; file: string; vol: number; fade?: number};
const end = (n: number) => s(n) + SHOTS[n - 1].duration;

const JUMPS = [15, 22, 28, 34, 43, 48, 54, 59];
const OPENERS = [16, 23, 29, 39, 44, 49, 55, 60];

const CUES: Cue[] = [
	// the hook: the room of 1901, the phone, the message, the title
	{at: s(1) + 2, file: 'breath', vol: 0.5},
	{at: s(2) + 104, file: 'stamp', vol: 0.6},
	{at: s(3) + 30, file: 'pop', vol: 0.3},
	{at: s(3) + 51, file: 'pop', vol: 0.5},
	{at: s(3) + 104, file: 'message', vol: 0.7},
	...[6, 17, 29, 51, 63, 70, 90, 100, 122, 138].map((o) => ({at: s(4) + o - 2, file: 'tick', vol: 0.2})),
	{at: s(5), file: 'swell', vol: 0.4},
	{at: s(5) + 30, file: 'pop', vol: 0.4},
	{at: s(5) + 62, file: 'whoosh', vol: 0.7},
	{at: s(5) + 68, file: 'warp', vol: 0.6},
	// 1901
	{at: s(6), file: 'boom', vol: 0.35},
	{at: s(6) + 71, file: 'pop', vol: 0.35},
	{at: s(6) + 97, file: 'pop', vol: 0.35},
	{at: s(7) + 104, file: 'gasp', vol: 0.35},
	{at: s(8) + 69, file: 'pop', vol: 0.4},
	{at: s(8) + 79, file: 'pop', vol: 0.4},
	{at: s(8) + 150, file: 'stamp', vol: 0.7},
	{at: s(9) + 26, file: 'decline', vol: 0.4},
	{at: s(9) + 92, file: 'pop', vol: 0.3},
	{at: s(10) + 8, file: 'sparks', vol: 0.3},
	{at: s(10) + 142, file: 'switch', vol: 0.4},
	{at: s(11) + 8, file: 'water', vol: 0.35},
	{at: s(12) + 128, file: 'laugh', vol: 0.3},
	{at: s(13) + 40, file: 'coin', vol: 0.5},
	{at: s(13) + 104, file: 'whoosh', vol: 0.4},
	{at: s(13) + 134, file: 'stamp', vol: 0.7},
	{at: s(14) + 8, file: 'whistle', vol: 0.55},
	{at: s(14) + 44, file: 'steps', vol: 0.45},
	{at: s(14) + 110, file: 'shutter', vol: 0.8},
	{at: s(14) + 137, file: 'gasp', vol: 0.6},
	// 1911
	{at: s(16) + 100, file: 'horn', vol: 0.5},
	{at: s(16) + 140, file: 'horn', vol: 0.4},
	{at: s(17) + 18, file: 'tram_bell', vol: 0.7},
	{at: s(17) + 88, file: 'tear', vol: 0.5},
	{at: s(18) + 62, file: 'whoosh', vol: 0.35},
	{at: s(19) + 8, file: 'toon', vol: 0.35, len: 90},
	{at: s(19) + 99, file: 'gasp', vol: 0.35},
	{at: s(20) + 61, file: 'pop', vol: 0.3},
	{at: s(20) + 83, file: 'pop', vol: 0.3},
	{at: s(20) + 97, file: 'pop', vol: 0.3},
	{at: s(20) + 118, file: 'swell', vol: 0.35},
	{at: s(21) + 40, file: 'pop', vol: 0.35},
	{at: s(21) + 108, file: 'pop', vol: 0.3},
	// 1921
	{at: s(24) + 30, file: 'cheer', vol: 0.3},
	{at: s(25) + 6, file: 'cloth', vol: 0.4},
	...[30, 46, 62, 78].map((o) => ({at: s(25) + o, file: 'tick', vol: 0.35})),
	{at: s(26) + 100, file: 'pop', vol: 0.3},
	{at: s(27) + 40, file: 'pop', vol: 0.35},
	{at: s(27) + 94, file: 'decline', vol: 0.3},
	// 1931
	{at: s(29) + 140, file: 'pop', vol: 0.3},
	{at: s(30) + 4, file: 'stamp', vol: 0.6},
	{at: s(31) + 4, file: 'typing', vol: 0.3},
	{at: s(31) + 44, file: 'decline', vol: 0.4},
	{at: s(31) + 70, file: 'decline', vol: 0.35},
	{at: s(31) + 96, file: 'steps_slow', vol: 0.3},
	{at: s(31) + 128, file: 'handle', vol: 0.4},
	{at: s(32) + 32, file: 'typing', vol: 0.3},
	{at: s(32) + 70, file: 'abacus', vol: 0.55},
	{at: s(32) + 118, file: 'pop', vol: 0.45},
	{at: s(32) + 126, file: 'stamp', vol: 0.6},
	{at: s(33) + 63, file: 'snap', vol: 0.7},
	{at: s(33) + 64, file: 'whoosh', vol: 0.4},
	{at: s(33) + 70, file: 'laugh', vol: 0.3},
	// 1941
	{at: s(35) + 150, file: 'heart', vol: 0.3},
	{at: s(36) + 124, file: 'swell', vol: 0.3},
	// 1951
	{at: s(40) + 30, file: 'stamp', vol: 0.5},
	{at: s(40) + 84, file: 'pop', vol: 0.35},
	{at: s(40) + 138, file: 'water', vol: 0.4},
	{at: s(41) + 38, file: 'stamp', vol: 0.7},
	{at: s(42) + 30, file: 'laugh', vol: 0.2},
	// 1961
	{at: s(44) + 100, file: 'cheer', vol: 0.5},
	{at: s(44) + 150, file: 'cheer', vol: 0.55},
	{at: s(45) + 4, file: 'cheer', vol: 0.35},
	{at: s(45) + 56, file: 'laugh', vol: 0.4},
	{at: s(46) + 30, file: 'pop', vol: 0.35},
	{at: s(46) + 58, file: 'pop', vol: 0.35},
	{at: s(47) + 54, file: 'pop', vol: 0.3},
	{at: s(47) + 70, file: 'pop', vol: 0.3},
	// 1971
	{at: s(49) + 92, file: 'stamp', vol: 0.7},
	{at: s(49) + 176, file: 'cloth', vol: 0.5},
	{at: s(50) + 38, file: 'switch', vol: 0.5},
	{at: s(50) + 60, file: 'gasp', vol: 0.5},
	{at: s(51) + 2, file: 'steps', vol: 0.3},
	{at: s(51) + 76, file: 'coin', vol: 0.6},
	{at: s(51) + 84, file: 'stamp', vol: 0.5},
	{at: s(53) + 26, file: 'switch', vol: 0.45},
	{at: s(53) + 31, file: 'switch', vol: 0.35},
	// 1981
	{at: s(55) + 110, file: 'cheer', vol: 0.4},
	{at: s(55) + 150, file: 'applause', vol: 0.3},
	{at: s(56) + 38, file: 'crunch', vol: 0.5},
	{at: s(56) + 86, file: 'wind', vol: 0.6},
	{at: s(57) + 10, file: 'laugh', vol: 0.3},
	{at: s(57) + 60, file: 'steps', vol: 0.3},
	{at: s(57) + 70, file: 'laugh', vol: 0.3},
	{at: s(57) + 118, file: 'pop', vol: 0.3},
	// 1991
	...[52, 58, 64, 70, 76, 82, 88, 94].map((o) => ({at: s(60) + o, file: 'tear', vol: 0.25})),
	{at: s(61) + 28, file: 'beep', vol: 0.35},
	{at: s(61) + 132, file: 'decline', vol: 0.4},
	{at: s(62) + 30, file: 'cloth', vol: 0.4},
	// 1 % … 0 % … 2001 … home
	{at: s(63), file: 'heart', vol: 0.35},
	{at: s(63) + 16, file: 'lowbat', vol: 0.6},
	{at: s(63) + 50, file: 'lowbat', vol: 0.6},
	{at: s(64) + 2, file: 'slowdown', vol: 0.6},
	{at: s(64) + 22, file: 'fireworks', vol: 0.75},
	{at: s(64) + 62, file: 'fireworks', vol: 0.55},
	{at: s(65) + 8, file: 'breath', vol: 0.55},
	{at: s(65) + 60, file: 'beep', vol: 0.35},
	{at: s(66) + 52, file: 'tick', vol: 0.5},
	{at: s(67) + 4, file: 'whoosh', vol: 0.35},
	{at: s(67) + 92, file: 'swell', vol: 0.4},
	{at: s(67) + 122, file: 'pop', vol: 0.5},
	{at: s(68) + 70, file: 'swell', vol: 0.35},
	{at: s(68) + 72, file: 'pop', vol: 0.5},
	{at: s(69) + 2, file: 'whoosh', vol: 0.5},
	...Array.from({length: 10}).map((_, k) => ({at: s(69) + 12 + k * 4, file: 'tick', vol: 0.18})),
	{at: s(69) + 48, file: 'pop', vol: 0.4},
	{at: s(69) + 84, file: 'message', vol: 0.5},
	// the jumps between the decades: the warp, the glitch, the year counter, the landing
	...JUMPS.flatMap((j) => [
		{at: s(j), file: 'warp', vol: 0.65},
		{at: s(j) + 2, file: 'glitch', vol: 0.3},
		...[10, 16, 22, 28, 34, 40].map((o) => ({at: s(j) + o, file: 'tick', vol: 0.22})),
		{at: end(j) - 8, file: 'whoosh', vol: 0.55},
		{at: end(j), file: 'boom', vol: 0.35},
	]),
	// the quiet jump of 1941 → 1951 (it stops at 9 May 1945)
	{at: s(38), file: 'swell', vol: 0.35},
	{at: s(38) + 24, file: 'boom', vol: 0.22},
	{at: end(38) - 8, file: 'whoosh', vol: 0.35},
	// the year titles
	...OPENERS.map((n) => ({at: s(n) + 2, file: 'stamp', vol: 0.45})),
	{at: s(35) + 2, file: 'boom', vol: 0.2},
];

// quiet beds under the voice (looped)
const BEDS: Bed[] = [
	{from: s(1), to: s(1) + 124, file: 'hooves', vol: 0.4},
	{from: s(1) + 60, to: s(2), file: 'crowd', vol: 0.12},
	{from: s(6), to: s(13), file: 'crowd', vol: 0.18},
	{from: s(6) + 118, to: s(7), file: 'hooves', vol: 0.45},
	{from: s(11) + 36, to: s(12), file: 'hooves', vol: 0.35},
	{from: s(14), to: s(15), file: 'crowd', vol: 0.2},
	{from: s(16), to: s(18) + 62, file: 'crowd', vol: 0.15},
	{from: s(16) + 56, to: s(17), file: 'engine', vol: 0.35},
	{from: s(18) + 62, to: s(19) + 62, file: 'piano', vol: 0.42, fade: 4},
	{from: s(18) + 62, to: s(20), file: 'projector', vol: 0.18},
	{from: s(20), to: s(20) + 118, file: 'plane', vol: 0.45},
	{from: s(23), to: s(28), file: 'crowd', vol: 0.22},
	{from: s(29) + 136, to: s(30), file: 'radio', vol: 0.32},
	{from: s(30) + 56, to: s(31), file: 'hammers', vol: 0.3},
	{from: s(30) + 110, to: s(31), file: 'engine', vol: 0.35},
	{from: s(35) + 102, to: s(36), file: 'radio', vol: 0.3},
	{from: s(35) + 140, to: s(38), file: 'drone', vol: 0.14},
	{from: s(37), to: s(38), file: 'steps', vol: 0.35},
	{from: s(39), to: s(40), file: 'hammers', vol: 0.3},
	{from: s(39), to: s(40), file: 'crowd', vol: 0.12},
	{from: s(40), to: s(41), file: 'fridge', vol: 0.15},
	{from: s(42), to: s(43), file: 'crowd', vol: 0.15},
	{from: s(44), to: s(46), file: 'crowd', vol: 0.22},
	{from: s(47), to: s(48), file: 'fridge', vol: 0.18},
	{from: s(49), to: s(51), file: 'crowd', vol: 0.18},
	{from: s(52), to: s(53), file: 'tape', vol: 0.3},
	{from: s(52) + 30, to: s(53), file: 'toon', vol: 0.22},
	{from: s(53), to: s(54), file: 'fridge', vol: 0.12},
	{from: s(55), to: s(56), file: 'crowd', vol: 0.25},
	{from: s(57), to: s(59), file: 'crowd', vol: 0.1},
	{from: s(58) + 20, to: s(59), file: 'toon', vol: 0.28},
	{from: s(60) + 102, to: s(61), file: 'wind_cold', vol: 0.35},
	{from: s(61), to: s(63), file: 'crowd', vol: 0.12},
];
// the wall clock («ходики») ticking through 22 June 1941 — one tick a second
const CLOCK: Cue[] = Array.from({length: Math.floor((end(36) - s(35)) / 30)}).map((_, k) => ({at: s(35) + k * 30, file: 'tick', vol: 0.2}));
const CLOCK31: Cue[] = Array.from({length: Math.floor((SHOTS[28].duration) / 30)}).map((_, k) => ({at: s(29) + k * 30, file: 'tick', vol: 0.12}));

const SFX_GAIN = HAS_VOICE ? 0.6 : 1;

export const SFXW1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{[...CUES, ...CLOCK, ...CLOCK31].map((c, i) => {
			const at = Math.round(r.fwd(c.at));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - at, r.total - at));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={`c${i}`} from={at} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : vol)} />
				</Sequence>
			);
		})}
		{BEDS.filter((b) => b.vol > 0).map((b, i) => {
			const a = Math.round(r.fwd(b.from));
			const len = Math.max(10, Math.round(r.fwd(b.to)) - a);
			const fd = Math.min(b.fade ?? 14, Math.floor(len / 3));
			const vol = b.vol * SFX_GAIN;
			return (
				<Sequence key={`b${i}`} from={a} durationInFrames={len} name={`bed ${b.file}`}>
					<Audio src={staticFile(`sfx/${b.file}.wav`)} loop volume={(f) => vol * interpolate(f, [0, fd, len - fd, len - 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
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
