// «Что будет, если ты попадёшь в СССР» — the sound: the voice, quiet beds (the radio in the kitchen, the yard, the
// street, the bus, the TV evening, crickets and a guitar at night) and the effects, timed on the words of the voice.
// All sounds are procedural (scripts/make-sfx.mjs): no music tracks, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s, SHOTS} from './timeline';
import {HAS_VOICE, VOICE, w} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
type Bed = {from: number; to: number; file: string; vol: number; fade?: number};
const end = (n: number) => s(n) + SHOTS[n - 1].duration;
const at = (n: number, word: string | number, add = 0) => s(n) + w(n, word, add);

const CUES: Cue[] = [
	// the morning
	{at: s(1), file: 'alarm_bell', vol: 0.55, len: Math.max(30, SHOTS[0].duration - 20)},
	{at: end(1) - 20, file: 'bump', vol: 0.5},
	{at: at(3, 'СССР', -2), file: 'stamp', vol: 0.7},
	{at: s(4), file: 'swell', vol: 0.3},
	{at: at(5, 'сто'), file: 'pop', vol: 0.45},
	{at: at(5, 'сообщение', -4), file: 'message', vol: 0.7},
	...['один', 'день', 'сядет', 'телефон', 'вернёшься', 'домой'].map((k) => ({at: at(6, k, -2), file: 'tick', vol: 0.18})),
	{at: s(7), file: 'swell', vol: 0.4},
	{at: at(7, 'поехали'), file: 'whoosh', vol: 0.7},
	{at: at(7, 'поехали', 6), file: 'warp', vol: 0.5},
	{at: at(10, 'порошок', -4), file: 'pop', vol: 0.3},
	{at: at(11, 'чай'), file: 'plate', vol: 0.35},
	{at: at(12, 'горчицей'), file: 'water', vol: 0.35},
	{at: at(13, 'пионерский', 6), file: 'whoosh', vol: 0.35},
	...['октябрята', 'пионеры', 'комсомол'].map((k) => ({at: at(14, k, -4), file: 'pop', vol: 0.45})),
	{at: s(15) + 10, file: 'cloth', vol: 0.4},
	{at: end(15) - 14, file: 'pop', vol: 0.4},
	{at: s(16) + 6, file: 'keys', vol: 0.5},
	{at: at(16, 'родители'), file: 'slam', vol: 0.35},
	{at: at(17, 'фонарик', -6), file: 'switch', vol: 0.6},
	{at: s(17), file: 'steps_slow', vol: 0.35},
	...['жигули', 'москвич', 'запорожец'].map((k) => ({at: at(18, k, -2), file: 'pop', vol: 0.35})),
	{at: at(19, 'мечта', -2), file: 'stamp', vol: 0.6},
	{at: at(20, 'фотографируешь'), file: 'shutter', vol: 0.7},
	{at: at(20, 'бабушки'), file: 'whisper', vol: 0.4},
	// the school
	{at: s(22), file: 'school_bell', vol: 0.5},
	{at: at(23, 'дневник', -4), file: 'tear', vol: 0.3},
	...['тетради', 'ручка'].map((k) => ({at: at(25, k, -2), file: 'pop', vol: 0.4})),
	{at: at(26, 'подписывают'), file: 'typing', vol: 0.2},
	{at: at(27, 'шесть', -10), file: 'tick', vol: 0.3},
	{at: at(27, 'шесть', -2), file: 'stamp', vol: 0.5},
	{at: s(28) + 4, file: 'crunch', vol: 0.3},
	{at: at(29, 'сдай', -2), file: 'cloth', vol: 0.4},
	{at: at(30, 'кто', -2), file: 'whisper', vol: 0.45},
	{at: s(31), file: 'school_bell', vol: 0.45},
	{at: at(31, 'пять'), file: 'coin', vol: 0.4},
	{at: at(32, 'двадцать', 2), file: 'pop', vol: 0.4},
	{at: at(32, 'талон', -4), file: 'stamp', vol: 0.5},
	...['шахматы', 'авиамодели', 'танцы'].map((k) => ({at: at(33, k, -4), file: 'pop', vol: 0.4})),
	{at: at(33, 'бесплатно', -4), file: 'stamp', vol: 0.6},
	// the street
	{at: at(35, 'одна', -6), file: 'coin', vol: 0.45},
	{at: at(35, 'одна', -2), file: 'soda', vol: 0.55},
	{at: at(35, 'три', -6), file: 'soda', vol: 0.55},
	{at: at(36, 'ополаскивают', -8), file: 'water', vol: 0.5},
	{at: at(37, 'квасом'), file: 'gulp', vol: 0.4},
	{at: at(38, 'пломбир'), file: 'crunch', vol: 0.35},
	{at: at(39, 'газеты'), file: 'tear', vol: 0.3},
	{at: at(40, 'снимаешь'), file: 'shutter', vol: 0.6},
	{at: at(40, 'некому', -4), file: 'decline', vol: 0.45},
	{at: at(41, 'выбросили', -2), file: 'gasp', vol: 0.3},
	{at: at(42, 'через', -2), file: 'stamp', vol: 0.6},
	{at: at(43, 'авоськами'), file: 'cloth', vol: 0.35},
	{at: at(44, 'пятнадцать', -4), file: 'glass', vol: 0.18},
	{at: at(45, 'снимаешь'), file: 'shutter', vol: 0.5},
	{at: at(46, 'джинсы', -4), file: 'cloth', vol: 0.45},
	// the bus, the payphone
	{at: at(47, 'монетки'), file: 'coin', vol: 0.4},
	{at: at(48, 'компостером', -4), file: 'stamp', vol: 0.5},
	{at: at(49, 'годы', -4), file: 'stamp', vol: 0.5},
	{at: at(50, 'две', -2), file: 'coin', vol: 0.55},
	{at: at(50, 'диск', -2), file: 'dial', vol: 0.6},
	{at: at(51, 'первый'), file: 'decline', vol: 0.35},
	{at: at(51, 'второй', -2), file: 'crunch', vol: 0.4},
	{at: at(51, 'третий', -2), file: 'gudki', vol: 0.55},
	// the yard in the evening
	{at: at(54, 'море', -2), file: 'whistle', vol: 0.35},
	{at: at(55, 'сокровище', -4), file: 'pop', vol: 0.45},
	{at: at(56, 'весь'), file: 'gasp', vol: 0.4},
	{at: at(59, 'домой', -2), file: 'steps', vol: 0.35},
	// the TV evening
	{at: at(60, 'прогревается'), file: 'switch', vol: 0.5},
	{at: at(61, 'крутишь', 2), file: 'switch', vol: 0.55},
	{at: at(62, 'девять', -4), file: 'tick', vol: 0.4},
	{at: at(63, 'через', -2), file: 'stamp', vol: 0.45},
	{at: at(64, 'десять', -2), file: 'pop', vol: 0.4},
	{at: at(65, 'перематывают', 8), file: 'wind', vol: 0.55},
	...['проезд', 'буханка'].map((k) => ({at: at(66, k, -2), file: 'pop', vol: 0.4})),
	{at: at(67, 'зарплата', -2), file: 'pop', vol: 0.4},
	{at: at(67, 'несколько', -2), file: 'stamp', vol: 0.45},
	{at: at(68, 'бесплатно', -2), file: 'stamp', vol: 0.4},
	{at: at(68, 'десять', -2), file: 'stamp', vol: 0.5},
	{at: at(69, 'горн', -6), file: 'bugle', vol: 0.45},
	// the night, home
	{at: at(70, 'снимаешь'), file: 'shutter', vol: 0.4},
	...Array.from({length: Math.floor(SHOTS[71].duration / 30)}).map((_, k) => ({at: s(72) + k * 30, file: 'tick', vol: 0.3})),
	{at: at(73, 'один'), file: 'lowbat', vol: 0.6},
	{at: at(73, 'гаснет', -2), file: 'slowdown', vol: 0.55},
	{at: s(74) + 4, file: 'breath', vol: 0.5},
	{at: at(74, 'телефон', -4), file: 'beep', vol: 0.35},
	{at: at(75, 'две', -6), file: 'cloth', vol: 0.4},
	{at: at(75, 'значок', -6), file: 'pop', vol: 0.5},
	{at: s(77), file: 'coin', vol: 0.4},
	{at: at(77, 'ровно', -4), file: 'swell', vol: 0.35},
	{at: s(78), file: 'whoosh', vol: 0.5},
	{at: at(78, 'пиши', -4), file: 'pop', vol: 0.4},
	{at: at(78, 'ранний', -6), file: 'message', vol: 0.5},
];

const BEDS: Bed[] = [
	{from: s(2), to: s(8), file: 'fridge', vol: 0.08},
	{from: s(8), to: s(13), file: 'radio', vol: 0.18},
	{from: s(18), to: s(22), file: 'kids', vol: 0.1},
	{from: s(22), to: s(24), file: 'kids', vol: 0.18},
	{from: s(30), to: s(32), file: 'kids', vol: 0.12},
	{from: s(32), to: s(34), file: 'kids', vol: 0.14},
	{from: s(34), to: s(47), file: 'crowd', vol: 0.16},
	{from: s(41), to: s(47), file: 'crowd', vol: 0.12},
	{from: s(47), to: s(49), file: 'bus', vol: 0.3},
	{from: s(50), to: s(52), file: 'crowd', vol: 0.12},
	{from: s(52), to: s(53), file: 'typing', vol: 0.1},
	{from: s(53), to: s(60), file: 'kids', vol: 0.2},
	{from: s(60), to: s(64), file: 'fridge', vol: 0.12},
	{from: s(64), to: s(65), file: 'kids', vol: 0.15},
	{from: s(69), to: s(70), file: 'kids', vol: 0.12},
	{from: s(70), to: s(73), file: 'crickets', vol: 0.3},
	{from: s(71), to: s(72), file: 'guitar', vol: 0.32, fade: 10},
];

const SFX_GAIN = HAS_VOICE ? 0.6 : 1;

export const SFXU1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{CUES.map((c, i) => {
			const a = Math.max(0, Math.round(r.fwd(c.at)));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - a, r.total - a));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={`c${i}`} from={a} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : vol)} />
				</Sequence>
			);
		})}
		{BEDS.map((b, i) => {
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
