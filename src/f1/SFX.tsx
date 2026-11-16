import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 a photo: dad is home → the cinema
	{at: s(1) + 2, file: 'pop', vol: 0.4},
	...W(1, 98),
	{at: s(1) + 100, file: 'steps', vol: 0.4, len: 50},
	// 2 the cashier yawns, a ticket for the cartoon
	{at: s(2) + 6, file: 'breath', vol: 0.3},
	...W(2, 50),
	{at: s(2) + 52, file: 'tear', vol: 0.35},
	// 3 a full hall (the cartoon's theme is below)
	...W(3, 32),
	// 4 the picture jerks, stripes, the sound is gone
	{at: s(4) + 22, file: 'glitch', vol: 0.55},
	{at: s(4) + 38, file: 'glitch', vol: 0.45},
	{at: s(4) + 58, file: 'sparks', vol: 0.4, len: 28},
	// 5-7 the film about you: your entrance, your flat, you, the door, borscht, «тигрёнок», garage 17, «карась»
	{at: s(5) + 30, file: 'glitch', vol: 0.3},
	{at: s(5) + 32, file: 'flicker', vol: 0.4},
	...W(5, 110, 144),
	{at: s(5) + 148, file: 'heart_big', vol: 0.6},
	{at: s(6) + 10, file: 'handle', vol: 0.4},
	{at: s(6) + 90, file: 'stamp', vol: 0.7},
	...W(7, 32, 46, 64, 124),
	{at: s(7) + 35, file: 'pop', vol: 0.4},
	{at: s(7) + 49, file: 'pop', vol: 0.4},
	{at: s(7) + 67, file: 'pop', vol: 0.4},
	{at: s(7) + 126, file: 'boom', vol: 0.5},
	// 8 you look round: the hall laughs, nobody notices
	...W(8, 34),
	{at: s(8) + 40, file: 'heart', vol: 0.45, len: 105},
	// 9 «Пап, ты это видишь?» — crunch-crunch, «Смешной, да?»
	{at: s(9) + 50, file: 'crunch', vol: 0.6},
	{at: s(9) + 64, file: 'crunch', vol: 0.5},
	// 10 the screen shows this hall — now
	{at: s(10) + 36, file: 'glitch', vol: 0.45},
	{at: s(10) + 40, file: 'swell', vol: 0.35},
	{at: s(10) + 130, file: 'heart_big', vol: 0.7},
	{at: s(10) + 130, file: 'boom', vol: 0.5},
	// 11 on the screen dad's seat is empty
	...W(11, 18),
	{at: s(11) + 54, file: 'glitch', vol: 0.35},
	{at: s(11) + 92, file: 'stamp', vol: 0.5},
	// 12 a seat creaks behind you, somebody sits down
	{at: s(12) + 14, file: 'creak', vol: 0.9},
	{at: s(12) + 46, file: 'floorcreak', vol: 0.4},
	{at: s(12) + 56, file: 'gasp', vol: 0.4},
	{at: s(12) + 62, file: 'creak', vol: 0.45},
	// 13-14 the figure leans to your ear: «Привет, тигрёнок»
	{at: s(13), file: 'heart', vol: 0.5, len: 90},
	{at: s(13) + 10, file: 'swell', vol: 0.45},
	{at: s(14) + 4, file: 'heart_big', vol: 0.8},
	{at: s(14) + 6, file: 'whisper', vol: 0.5},
	{at: s(14) + 18, file: 'glitch', vol: 0.45},
	// 15 nobody behind: the only empty seat in the hall folds up
	{at: s(15), file: 'whoosh', vol: 0.6},
	{at: s(15) + 30, file: 'creak', vol: 0.6},
	{at: s(15) + 70, file: 'swell', vol: 0.35},
	{at: s(15) + 112, file: 'stamp', vol: 0.55},
	// 16 dad's seat is empty — like on the screen
	{at: s(16), file: 'whoosh', vol: 0.5},
	{at: s(16) + 40, file: 'heart_big', vol: 0.8},
	...W(16, 78),
	// 17 his ticket: «Не досматривай»
	...W(17, 48),
	{at: s(17) + 50, file: 'cloth', vol: 0.35},
	{at: s(17) + 92, file: 'swell', vol: 0.4},
	// 18 «Продолжение следует», the hall applauds, for them it was a cartoon
	{at: s(18) + 18, file: 'boom', vol: 0.6},
	{at: s(18) + 18, file: 'swell', vol: 0.4},
	{at: s(18) + 60, file: 'pop', vol: 0.4}, // «?» in the counter
	{at: s(18) + 90, file: 'applause', vol: 0.55, len: 110},
	...W(18, 128),
	// 19 finale
	{at: s(19), file: 'boom', vol: 1},
	{at: s(19) + 8, file: 'pop', vol: 0.5},
	{at: s(19) + 78, file: 'pop', vol: 0.5},
	{at: s(19) + 150, file: 'beep', vol: 0.8},
	{at: s(19) + 180, file: 'beep', vol: 0.8},
	{at: s(19) + 210, file: 'beep', vol: 0.8},
	{at: s(19) + 236, file: 'beep_final', vol: 0.9},
	{at: s(19) + 252, file: 'whoosh', vol: 0.7},
	// plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.4},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const BED_FROM = s(4) + 90; // the eerie bed starts when the cartoon's sound is gone
const BED_END = s(19) + 252;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// the cartoon's theme from shot 3; it stutters with the picture (4: 22-84) and then is gone
const TOON_FROM = s(3);
const TOON_CUT = s(4) + 84;
const hash = (n: number) => {
	const x = Math.sin(n * 127.1) * 43758.5453;
	return x - Math.floor(x);
};
const toonGate = (old: number) => {
	const g0 = s(4) + 22;
	if (old >= TOON_CUT) return 0;
	if (old < g0) return 1;
	if (old < s(4) + 44) return hash(Math.floor(old / 2)) > 0.45 ? 1 : 0;
	if (old < s(4) + 60) return hash(Math.floor(old / 3) + 7) > 0.3 ? 0.7 : 0;
	return hash(Math.floor(old / 2) + 13) > 0.6 ? 0.35 : 0;
};

export const SFXF1: React.FC<{r: Remap}> = ({r}) => {
	const toonFrom = Math.round(r.fwd(TOON_FROM));
	const toonLen = Math.round(r.fwd(TOON_CUT)) - toonFrom + 2;
	const bedFrom = Math.round(r.fwd(BED_FROM));
	const bedLen = Math.round(r.fwd(BED_END)) + 30 - bedFrom;
	return (
		<>
			<Sequence from={toonFrom} durationInFrames={toonLen} name="sfx cartoon theme">
				<Audio src={staticFile('sfx/toon.wav')} volume={(f) => 0.32 * SFX_GAIN * interpolate(f, [0, 4], [0, 1], clampX) * toonGate(r.inv(toonFrom + f))} />
			</Sequence>
			<Sequence from={bedFrom} durationInFrames={bedLen} name="sfx drone bed">
				<Audio src={staticFile('sfx/drone.wav')} volume={(f) => 0.3 * interpolate(f, [0, 60, bedLen - 40, bedLen - 10], [0, 1, 1, 0], clampX)} />
			</Sequence>
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
};
