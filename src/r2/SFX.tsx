import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {SIGN_FLY} from '../timeline';
import {SIGNS, shotStart as s, TOTAL} from './timeline';
import {HAS_VOICE, VOICE} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
const W = (shot: number, ...offs: number[]): Cue[] => offs.map((o) => ({at: s(shot) + o, file: 'whoosh', vol: 0.3}));

const CUES: Cue[] = [
	// 1 the hook: the fist in slow motion; the rewind
	{at: 0, file: 'heart_big', vol: 0.6},
	{at: 30, file: 'heart_big', vol: 0.6},
	{at: 60, file: 'heart_big', vol: 0.6},
	{at: 4, file: 'slowdown', vol: 0.5},
	{at: 100, file: 'rewind', vol: 0.8},
	{at: 112, file: 'whoosh', vol: 0.7},
	// 2 Казань, the plant at night: the rooftop letters light up, the crowd walks at you, «ТЯП-ЛЯП»
	{at: s(2), file: 'whoosh', vol: 0.6},
	{at: s(2) + 58, file: 'switch', vol: 0.5},
	{at: s(2) + 70, file: 'switch', vol: 0.35},
	{at: s(2) + 84, file: 'switch', vol: 0.35},
	{at: s(2) + 20, file: 'steps_slow', vol: 0.35, len: 150},
	{at: s(2) + 155, file: 'stamp', vol: 0.9},
	{at: s(2) + 155, file: 'boom', vol: 0.5},
	// 3 the old photo of Антип's basement gym; the caption is typed
	{at: s(3), file: 'projector', vol: 0.45, len: 118},
	{at: s(3) + 22, file: 'typing', vol: 0.55, len: 36},
	// 4 you knock on the iron door
	{at: s(4) + 30, file: 'knock', vol: 0.9},
	{at: s(4) + 60, file: 'slam', vol: 0.2},
	// 5 the door opens: Гвоздь
	{at: s(5), file: 'creak', vol: 0.7},
	{at: s(5) + 42, file: 'pop', vol: 0.4},
	{at: s(5) + 84, file: 'pop', vol: 0.4},
	// 6 «Я хочу к вам» — silence
	{at: s(6) + 30, file: 'pop', vol: 0.4},
	{at: s(6) + 64, file: 'heart', vol: 0.4, len: 43},
	// 7 the gym
	...W(7, 0),
	{at: s(7) + 20, file: 'slam', vol: 0.25},
	{at: s(7) + 70, file: 'slam', vol: 0.25},
	// 8 Сивый rises
	{at: s(8) + 10, file: 'steps_slow', vol: 0.6, len: 60},
	{at: s(8) + 34, file: 'stamp', vol: 0.5},
	// 9 «один удар»
	{at: s(9) + 60, file: 'stamp', vol: 0.8},
	{at: s(9) + 62, file: 'heart_big', vol: 0.5},
	// 10 the circle; the sleeve
	{at: s(10), file: 'steps', vol: 0.45, len: 50},
	{at: s(10) + 50, file: 'cloth', vol: 0.7},
	// 11 fists
	{at: s(11), file: 'heart', vol: 0.6, len: 84},
	// 12 the blow
	{at: s(12), file: 'whoosh', vol: 0.7},
	{at: s(12) + 8, file: 'slam', vol: 1},
	{at: s(12) + 8, file: 'boom', vol: 0.8},
	// 13 ringing in the ears — and you fall
	{at: s(13), file: 'slowdown', vol: 0.6},
	{at: s(13) + 84, file: 'whoosh', vol: 0.5},
	{at: s(13) + 98, file: 'bump', vol: 1},
	{at: s(13) + 98, file: 'boom', vol: 0.5},
	// 14 on the floor: they laugh; «Упал — свободен»
	{at: s(14), file: 'laugh', vol: 0.55, len: 70},
	{at: s(14) + 46, file: 'cloth', vol: 0.4},
	{at: s(14) + 78, file: 'pop', vol: 0.4},
	// 15 you get up; «Бей ещё»
	{at: s(15) + 6, file: 'cloth', vol: 0.6},
	{at: s(15) + 10, file: 'breath', vol: 0.5},
	{at: s(15) + 30, file: 'heart', vol: 0.5, len: 60},
	{at: s(15) + 96, file: 'pop', vol: 0.45},
	// 16 silence; the second blow (impact at 58 + 28)
	{at: s(16) + 20, file: 'heart_big', vol: 0.5},
	{at: s(16) + 76, file: 'whoosh', vol: 0.7},
	{at: s(16) + 86, file: 'slam', vol: 1},
	{at: s(16) + 86, file: 'boom', vol: 0.8},
	// 17 …and you stand
	{at: s(17) + 20, file: 'heart_big', vol: 0.6},
	// 18 «Упал — и встал. Теперь ты наш»
	{at: s(18) + 42, file: 'pop', vol: 0.4},
	{at: s(18) + 86, file: 'pop', vol: 0.4},
	{at: s(18) + 30, file: 'swell', vol: 0.4},
	// 19 «Здесь ты — Лавр. Тяп-ляповский»
	{at: s(19) + 22, file: 'tear', vol: 0.6},
	{at: s(19) + 75, file: 'stamp', vol: 1},
	{at: s(19) + 75, file: 'boom', vol: 0.6},
	{at: s(19) + 95, file: 'stamp', vol: 0.9},
	// 20 handshakes
	{at: s(20) + 10, file: 'pat', vol: 0.6},
	{at: s(20) + 54, file: 'pat', vol: 0.6},
	{at: s(20) + 96, file: 'pat', vol: 0.6},
	// 21 «правила Антипа: …своих не бросать»
	{at: s(21) + 6, file: 'pat', vol: 0.7},
	// 22 the night: the head spins; the ambulance; «СОТРЯСЕНИЕ МОЗГА»
	{at: s(22), file: 'heart', vol: 0.5, len: 50},
	{at: s(22) + 10, file: 'slowdown', vol: 0.35},
	{at: s(22) + 50, file: 'siren', vol: 0.3, len: 66},
	{at: s(22) + 84, file: 'whoosh', vol: 0.5},
	{at: s(22) + 96, file: 'stamp', vol: 1},
	// 23 the ward: «Игоречек, кто тебя так?» — «Упал»
	{at: s(23) + 4, file: 'tick', vol: 0.25, len: 150},
	{at: s(23) + 50, file: 'pop', vol: 0.4},
	{at: s(23) + 142, file: 'pop', vol: 0.4},
	// 24 the notebook: the pen scratches «Т» and «К»
	{at: s(24) + 24, file: 'cloth', vol: 0.35},
	{at: s(24) + 92, file: 'pop', vol: 0.35},
	{at: s(24) + 101, file: 'pop', vol: 0.35},
	// 25 a week later: Сазон
	...W(25, 0),
	{at: s(25) + 113, file: 'pop', vol: 0.4},
	// 26 «Я теперь тяп-ляповский» — «Докажи»
	{at: s(26) + 24, file: 'pop', vol: 0.4},
	{at: s(26) + 82, file: 'laugh', vol: 0.4, len: 40},
	{at: s(26) + 102, file: 'pop', vol: 0.45},
	// 27 finale
	{at: s(27), file: 'boom', vol: 1},
	{at: s(27) + 8, file: 'pop', vol: 0.5},
	{at: s(27) + 78, file: 'pop', vol: 0.5},
	{at: s(27) + 150, file: 'beep', vol: 0.8},
	{at: s(27) + 180, file: 'beep', vol: 0.8},
	{at: s(27) + 210, file: 'beep', vol: 0.8},
	{at: s(27) + 236, file: 'beep_final', vol: 0.9},
	{at: s(27) + 252, file: 'whoosh', vol: 0.7},
	{at: s(27) + 284, file: 'pop', vol: 0.5},
	// rule plaques
	...SIGNS.flatMap((g) => [
		{at: g.at, file: 'stamp', vol: 1},
		{at: g.at + g.hold + SIGN_FLY, file: 'pop', vol: 0.35},
	]),
];

const SFX_GAIN = HAS_VOICE ? 0.55 : 1;
const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// a low drone all the way (no dead air between the words), stronger in the basement (night)
const BEDS: {file: string; a: number; b: number; vol: (old: number) => number}[] = [{file: 'drone', a: 0, b: TOTAL, vol: (o) => (o < s(25) ? 0.3 : 0.2)}];

export const SFXR2: React.FC<{r: Remap}> = ({r}) => (
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
