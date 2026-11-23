// «Каково это — оказаться погребённым заживо» — the sound: the voice (Чоби), quiet beds (the night over the
// grave, the heartbeat in the coffin, the mountain wind, the sea, the rubble) and the effects, timed on the words of the voice so they follow it.
// All sounds are procedural (scripts/make-sfx.mjs): no music tracks, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {CHOBI_VISITS, IRIS} from './chobiKit';
import {shotStart as s, SHOTS} from './timeline';
import {HAS_VOICE, VOICE, w} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
type Bed = {from: number; to: number; file: string; vol: number; fade?: number};
const end = (n: number) => s(n) + SHOTS[n - 1].duration;
const at = (n: number, word: string | number, add = 0) => s(n) + w(n, word, add);
// a few of the same cue, `every` frames apart
const rep = (from: number, count: number, every: number, file: string, vol: number, len?: number): Cue[] =>
	Array.from({length: count}).map((_, k) => ({at: from + k * every, file, vol, len}));
// a heart that labours: beats at these offsets (frames) from `from`
const beats = (from: number, offs: number[], vol: number, ecg = false): Cue[] =>
	offs.flatMap((o) => [{at: from + o, file: 'heart_one', vol}, ...(ecg ? [{at: from + o + 2, file: 'ecg', vol: vol * 0.45}] : [])]);

// Чоби's page opens with a circle and a soft whoosh (he springs up with a pop) and closes the same way
const VISITS: Cue[] = CHOBI_VISITS.flatMap((v) => {
	const first = v[0];
	const last = v[v.length - 1];
	const close = last === SHOTS.length ? end(last) - IRIS - 4 : end(last);
	return [
		{at: s(first), file: 'whoosh', vol: 0.3},
		{at: s(first) + 4, file: 'pop', vol: 0.25},
		{at: close, file: 'whoosh', vol: 0.22},
	];
});

const len = (n: number) => SHOTS[n - 1].duration;
// one cue on every peak of |sin((f - from) / per)| in [from, to): the fist on the lid, the shovel
const peaks = (from: number, to: number, per: number, file: string, vol: number, len?: number): Cue[] => {
	const out: Cue[] = [];
	for (let k = 0; ; k++) {
		const t = from + Math.round(per * (Math.PI / 2 + k * Math.PI));
		if (t >= to) break;
		out.push({at: t, file, vol, len});
	}
	return out;
};
// Чоби steps in from the right: «Стоп, Гога!» — a referee's whistle, his bubble pops, he slides out at `to`
const stop = (n: number, from: number, to: number): Cue[] => [
	{at: s(n) + from, file: 'whistle', vol: 0.22},
	{at: s(n) + from + 2, file: 'whoosh', vol: 0.25},
	{at: s(n) + from + 6, file: 'pop', vol: 0.3},
	{at: s(n) + to, file: 'whoosh', vol: 0.15},
];
// the HUD crosses out one more of Гога's mistakes
const MISTAKE = (n: number) => ({at: at(n, 'ошибка'), file: 'stamp', vol: 0.4});
// the air meter drops
const AIR_DROP = (n: number, word: string) => ({at: at(n, word), file: 'decline', vol: 0.3});
// the calendar flips from day 1 to day 17
const flips = (from: number, to: number): Cue[] => Array.from({length: 16}).map((_, k) => ({at: Math.round(from + ((k + 0.5) / 16) * (to - from)), file: 'pat', vol: 0.22}));

const CUES: Cue[] = [
	...VISITS,
	// the hook: total darkness; he opens his eyes; the boards; two metres of earth above
	{at: s(1), file: 'heart_big', vol: 0.45},
	{at: at(1, 'открывает', -6), file: 'gasp', vol: 0.35},
	{at: at(1, 'руки', -14), file: 'cloth', vol: 0.3},
	{at: at(2, 'пытается', -2), file: 'cloth', vol: 0.3},
	{at: at(2, 'бьётся', -2), file: 'thud', vol: 0.8},
	{at: at(2, 'бьётся', -2), file: 'bump', vol: 0.45},
	{at: at(2, 'справа', -6), file: 'thud', vol: 0.3},
	{at: at(2, 'слева', -6), file: 'thud', vol: 0.3},
	{at: at(2, 'сверху', -6), file: 'whoosh', vol: 0.35},
	{at: at(2, 'сверху', -2), file: 'dirt', vol: 0.3, len: 50},
	{at: at(2, 'метра', -4), file: 'pop', vol: 0.3},
	{at: s(3) + 1, file: 'boom', vol: 0.4},
	{at: s(3) + 2, file: 'stamp', vol: 0.4},
	// he screams, bangs on the lid, clicks the lighter
	{at: at(4, 'кричит', -4), file: 'pop', vol: 0.3},
	{at: at(4, 'колотит', -4), file: 'pop', vol: 0.3},
	...peaks(at(4, 'колотит', -4), at(4, 'щёлкает', -2), 3, 'thud', 0.45),
	{at: at(4, 'щёлкает', -2), file: 'lighter', vol: 0.55},
	// «Стоп, Гога!» — the picture freezes; three mistakes; the air drains
	{at: s(5) - 3, file: 'slowdown', vol: 0.3},
	...stop(5, 0, len(5) - 12),
	...rep(at(5, 'три', -4), 3, 6, 'stamp', 0.35),
	{at: at(5, 'воздух', -6), file: 'decline', vol: 0.35},
	// Чоби's intro
	{at: at(6, 'каково', -4), file: 'pop', vol: 0.3},
	{at: at(6, 'гога', -6), file: 'pop', vol: 0.3},
	{at: at(6, 'правила', -6), file: 'pop', vol: 0.3},
	{at: at(6, 'поехали', -6), file: 'whoosh', vol: 0.45},
	// silence; the heart; earth and wood
	...beats(at(7, 'сердце', -1), Array.from({length: 12}).map((_, k) => k * 20).filter((o) => w(7, 'сердце', -1) + o < len(7) - 10), 0.4),
	{at: at(7, 'пахнет', -2), file: 'dirt', vol: 0.18, len: 40},
	// a few hundred litres of air — a fridge
	{at: at(8, 'несколько', -4), file: 'swell', vol: 0.25},
	{at: at(8, 'несколько', 6), file: 'pop', vol: 0.3},
	{at: at(8, 'холодильнике', -10), file: 'pop', vol: 0.35},
	{at: at(8, 'холодильнике', -6), file: 'fridge', vol: 0.18, len: 70},
	// about two hours
	{at: at(9, 'часа', -6), file: 'pop', vol: 0.3},
	{at: at(9, 'часа', -2), file: 'tick', vol: 0.18, len: 110},
	// carbon dioxide
	{at: at(10, 'углекислый', -6), file: 'pop', vol: 0.3},
	{at: at(10, 'выдыхаешь', -8), file: 'exhale', vol: 0.35, len: 60},
	{at: at(11, 'болит', -6), file: 'pop', vol: 0.3},
	{at: at(11, 'частым', -6), file: 'pant', vol: 0.22, len: 60},
	{at: at(11, 'клонит', -6), file: 'slowdown', vol: 0.25},
	{at: at(11, 'путаются', -6), file: 'glitch', vol: 0.2},
	{at: s(12) + 6, file: 'heart_one', vol: 0.35},
	{at: s(12) + 36, file: 'heart_one', vol: 0.25},
	{at: at(12, 'не', -6), file: 'decline', vol: 0.3},
	// mistake one: the scream
	...stop(13, IRIS, len(13) - 4),
	MISTAKE(13),
	{at: at(14, 'глубокие', -6), file: 'inhale', vol: 0.3, len: 30},
	{at: at(14, 'резкие', -6), file: 'exhale', vol: 0.3, len: 30},
	AIR_DROP(14, 'воздух'),
	{at: at(15, 'никто', -6), file: 'stamp', vol: 0.35},
	{at: at(15, 'человек', -14), file: 'steps_slow', vol: 0.3},
	// mistake two: banging on the lid
	...stop(16, 2, len(16) - 4),
	...peaks(s(16), end(16), 3.2, 'thud', 0.35),
	{at: at(16, 'колотит'), file: 'stamp', vol: 0.4},
	AIR_DROP(17, 'дышит'),
	{at: s(17) + 4, file: 'pant', vol: 0.2, len: 70},
	...rep(at(17, 'тонны', -8), 3, 5, 'bump', 0.35),
	{at: at(17, 'тонны', -6), file: 'creak', vol: 0.3},
	// the board cracks, the earth pours in
	{at: at(18, 'треснет', -6), file: 'crunch', vol: 0.55},
	{at: at(18, 'хлынет', -6), file: 'dirt', vol: 0.55},
	{at: at(18, 'хлынет', 40), file: 'dirt', vol: 0.35},
	// in the movies — in real life
	{at: s(19), file: 'projector', vol: 0.12, len: Math.max(20, w(19, 'жизни', -6))},
	{at: at(19, 'пробивает', -4), file: 'crunch', vol: 0.4},
	{at: at(19, 'жизни', -6), file: 'whoosh', vol: 0.3},
	{at: at(19, 'рыхлая', -4), file: 'dirt', vol: 0.45},
	{at: at(19, 'давит', -4), file: 'dirt', vol: 0.3},
	{at: at(19, 'вдохнуть', -4), file: 'gasp', vol: 0.3},
	// mistake three: the lighter
	...stop(20, 2, len(20) - 2),
	{at: s(20) + 2, file: 'lighter', vol: 0.5},
	{at: at(20, 'зажигалка'), file: 'stamp', vol: 0.4},
	{at: s(21), file: 'fire', vol: 0.18, len: len(21)},
	AIR_DROP(21, 'сжигает'),
	{at: at(21, 'углекислый', -6), file: 'pop', vol: 0.3},
	// light without fire
	{at: s(22) + 2, file: 'pop', vol: 0.3},
	{at: at(22, 'экран', -6), file: 'switch', vol: 0.4},
	{at: at(22, 'экран', -4), file: 'shimmer', vol: 0.2},
	{at: at(22, 'свет', 30), file: 'pop', vol: 0.3},
	// panic
	{at: at(23, 'паники', -6), file: 'heart_one', vol: 0.45},
	{at: at(23, 'паники', -6), file: 'pop', vol: 0.3},
	{at: at(24, 'клаустрофобия', -6), file: 'stamp', vol: 0.35},
	{at: at(24, 'темноте', -6), file: 'swell', vol: 0.25},
	{at: at(25, 'тревогу', -8), file: 'alarm', vol: 0.12, len: 45},
	{at: at(25, 'адреналин', -6), file: 'pop', vol: 0.35},
	...beats(at(25, 'сердце', -6), [0, 12, 24, 36, 48, 60], 0.35),
	{at: at(25, 'дыхание', -6), file: 'pant', vol: 0.22, len: 60},
	{at: s(26) + 4, file: 'steps', vol: 0.25},
	{at: at(26, 'некуда', -6), file: 'bump', vol: 0.4},
	AIR_DROP(26, 'паника'),
	// «Гога, дыши со мной»: the square breath
	{at: s(27) + 2, file: 'pop', vol: 0.3},
	{at: at(28, 0), file: 'inhale', vol: 0.4, len: Math.max(20, w(28, 6) - w(28, 0))},
	{at: at(28, 12), file: 'exhale', vol: 0.4, len: Math.max(20, w(28, 19) - w(28, 12))},
	{at: at(29, 'квадратное', -6), file: 'pop', vol: 0.3},
	{at: at(29, 'спецназовцы', -8), file: 'pop', vol: 0.3},
	...beats(at(29, 'пульс', -6), [0, 26, 56], 0.3),
	{at: at(29, 'мысли', -6), file: 'shimmer', vol: 0.2},
	{at: at(29, 'меньше', -8), file: 'pop', vol: 0.3},
	// lie still; the phone
	{at: s(30) + 2, file: 'pop', vol: 0.3},
	{at: at(30, 'телефон', -6), file: 'switch', vol: 0.35},
	{at: at(30, 'звонить', -4), file: 'dial', vol: 0.18, len: 30},
	{at: at(30, 'писать', -4), file: 'typing', vol: 0.3},
	{at: at(30, 'геолокацию', -8), file: 'message', vol: 0.35},
	// few chances — but today it is almost impossible
	{at: s(31) + 4, file: 'decline', vol: 0.3},
	{at: at(31, 'хорошая', -6), file: 'shimmer', vol: 0.25},
	{at: at(31, 'хорошая', 20), file: 'pop', vol: 0.35},
	// two hundred years ago: taphophobia
	{at: s(32), file: 'rewind', vol: 0.3},
	{at: at(32, 'тафофобия', -6), file: 'stamp', vol: 0.4},
	{at: at(33, 'обморока', -8), file: 'pop', vol: 0.3},
	{at: at(33, 'показаться', -8), file: 'pop', vol: 0.35},
	{at: at(34, 'по', -4), file: 'tear', vol: 0.2},
	{at: at(34, 'модным', -10), file: 'pop', vol: 0.35},
	{at: at(35, 'через', -6), file: 'pop', vol: 0.3},
	{at: at(35, 'андерсен', -10), file: 'pop', vol: 0.3},
	{at: at(35, 'записку', -6), file: 'tear', vol: 0.25},
	// the safety coffin: a tube, a flag, a bell
	{at: at(36, 'трубкой', -6), file: 'pop', vol: 0.3},
	{at: at(36, 'флажком', -6), file: 'pop', vol: 0.3},
	{at: at(36, 'колокольчиком', -6), file: 'bell', vol: 0.18, len: 30},
	{at: at(36, 'дёрнул', -4), file: 'cloth', vol: 0.3},
	{at: at(36, 'дёрнул', 6), file: 'bell', vol: 0.4},
	// the waiting mortuaries: strings with bells, a guard
	{at: at(37, 'пальцам', -8), file: 'bell', vol: 0.18},
	{at: at(37, 'сторож', -8), file: 'steps_slow', vol: 0.3},
	// Gogol
	{at: at(38, 'гоголя', -6), file: 'pop', vol: 0.3},
	{at: at(38, 'вскрыли', -6), file: 'dig', vol: 0.3},
	{at: at(38, 'повёрнут', -6), file: 'creak', vol: 0.3},
	{at: at(38, 'повёрнут', 8), file: 'pop', vol: 0.35},
	{at: at(39, 'легенда', -4), file: 'stamp', vol: 0.5},
	{at: at(39, 'родственники', -10), file: 'pop', vol: 0.3},
	{at: at(40, 'завещании', -6), file: 'tear', vol: 0.2},
	{at: at(40, 'не', 10), file: 'pop', vol: 0.3},
	...rep(at(41, 'свидетели', -4), 3, 10, 'pop', 0.25),
	{at: at(41, 'мифом', -6), file: 'stamp', vol: 0.5},
	// «Гога, просыпайся» — only a nightmare
	{at: at(42, 'просыпайся', -4), file: 'gasp', vol: 0.4},
	{at: at(42, 'просыпайся', -2), file: 'cloth', vol: 0.35},
	{at: at(42, 'кошмар', -6), file: 'pop', vol: 0.35},
	// under snow, sand or earth
	...[w(43, 'снега', -4), w(43, 'песка', -4), w(43, 'земли', -4)].map((o) => ({at: s(43) + o, file: 'pop', vol: 0.3})),
	{at: at(43, 'нужен', -6), file: 'stamp', vol: 0.35},
	{at: at(44, 'смертельными', -8), file: 'heart_big', vol: 0.4},
	// mistake four: alone in the mountains, no beacon
	{at: s(45) + 2, file: 'whoosh', vol: 0.3},
	{at: at(45, 'один', -4), file: 'pop', vol: 0.3},
	{at: at(45, 'датчика', -8), file: 'decline', vol: 0.3},
	...stop(45, w(45, 'ошибка', -4), len(45) + 10),
	MISTAKE(45),
	// the avalanche
	{at: s(46) + 1, file: 'boom', vol: 0.45},
	{at: at(46, 'кричит', -6), file: 'gust', vol: 0.3},
	{at: at(46, 'забивает', -4), file: 'crunch', vol: 0.35},
	{at: at(46, 'крутит', -6), file: 'whoosh', vol: 0.35},
	{at: at(46, 'крутит', 14), file: 'whoosh', vol: 0.3},
	{at: at(46, 'останавливается', -6), file: 'bump', vol: 0.5},
	{at: at(46, 'схватывается', -6), file: 'ice_crack', vol: 0.35},
	...beats(s(47) + 10, [0, 26, 52, 78, 104, 130, 156, 182, 208].filter((o) => o < len(47) - 20), 0.3),
	{at: at(47, 'верх', -6), file: 'warp', vol: 0.15, len: 40},
	{at: at(47, 'никто', -6), file: 'stamp', vol: 0.35},
	{at: at(48, 'сотни', -8), file: 'pop', vol: 0.35},
	// the rule in an avalanche; the gear; the airbag; the minutes
	{at: at(49, 'вверх', -8), file: 'whoosh', vol: 0.3},
	{at: at(49, 'лицо', -8), file: 'cloth', vol: 0.35},
	{at: at(49, 'карман', -6), file: 'shimmer', vol: 0.2},
	{at: at(50, 'друзьями', -6), file: 'pop', vol: 0.3},
	...[w(50, 'датчик', -4), w(50, 'щуп', -4), w(50, 'лопата', -4)].map((o) => ({at: s(50) + o, file: 'pop', vol: 0.28})),
	{at: at(50, 'рюкзак', -6), file: 'pop', vol: 0.3},
	{at: at(50, 'дёрнул', -4), file: 'hiss', vol: 0.4, len: 30},
	{at: at(50, 'дёрнул', 8), file: 'pop', vol: 0.35},
	{at: at(51, 'пятнадцать', -6), file: 'pop', vol: 0.3},
	{at: at(51, 'девять', -6), file: 'shimmer', vol: 0.18},
	{at: at(51, 'тридцать', -6), file: 'decline', vol: 0.3},
	// the beach: deeper and deeper; a photo
	...peaks(s(52) + 4, at(52, 'залезает', -6), 3.5, 'dig', 0.25, 30).filter((_, k) => k % 2 === 0),
	{at: at(52, 'колена', -6), file: 'pop', vol: 0.28},
	{at: at(52, 'пояса', -6), file: 'pop', vol: 0.28},
	{at: at(52, 'залезает', -6), file: 'cloth', vol: 0.3},
	{at: at(52, 'сфотографироваться', -8), file: 'shutter', vol: 0.45},
	{at: at(53, 'обрушиваются', -6), file: 'dirt', vol: 0.55},
	{at: at(53, 'обрушиваются', -4), file: 'bump', vol: 0.4},
	{at: at(53, 'тонны', -8), file: 'pop', vol: 0.35},
	{at: at(53, 'грудь', -6), file: 'gasp', vol: 0.3},
	// mistake five
	...stop(54, 0, w(54, 'не', -6)),
	MISTAKE(54),
	{at: at(54, 'туннели', -8), file: 'pop', vol: 0.3},
	{at: at(54, 'дети', -6), file: 'kids', vol: 0.12, len: 90},
	...rep(at(55, 'сбоку', -6), 2, 16, 'dig', 0.3, 30),
	{at: at(55, 'лицо', -6), file: 'inhale', vol: 0.3, len: 40},
	// the trench and the silo
	{at: at(56, 'траншея', -6), file: 'pop', vol: 0.3},
	{at: at(56, 'зернохранилище', -10), file: 'pop', vol: 0.3},
	{at: at(57, 'легковая', -6), file: 'horn', vol: 0.2},
	{at: at(57, 'легковая', -4), file: 'bump', vol: 0.3},
	{at: at(57, 'полутора', -6), file: 'pop', vol: 0.3},
	{at: at(57, 'укреплённых', -6), file: 'stamp', vol: 0.3},
	{at: s(58) + 4, file: 'dirt', vol: 0.22, len: len(58) - 10},
	{at: s(58) + 4, file: 'tick', vol: 0.15, len: w(58, 'двадцать', 14)},
	{at: at(58, 'двадцать', -6), file: 'decline', vol: 0.3},
	// mistake six
	...stop(59, w(59, 'ошибка', -4), w(59, 'никогда', 14)),
	MISTAKE(59),
	{at: at(59, 'никогда', -6), file: 'stamp', vol: 0.35},
	{at: at(59, 'страховочным', -8), file: 'snap', vol: 0.4},
	{at: at(59, 'напарником', -6), file: 'pop', vol: 0.3},
	// the earthquake; the rubble; the lighter again
	{at: s(60), file: 'boom', vol: 0.5},
	{at: at(60, 'землетрясения', -8), file: 'crash', vol: 0.4},
	{at: at(60, 'землетрясения', -4), file: 'dirt', vol: 0.4},
	{at: at(61, 'кричит', -6), file: 'pop', vol: 0.3},
	{at: at(61, 'зажигалка', -8), file: 'lighter', vol: 0.55},
	// mistake seven: the gas
	{at: s(62) - 3, file: 'slowdown', vol: 0.3},
	...stop(62, 0, len(62) - 16),
	{at: at(62, 'газ', -6), file: 'hiss', vol: 0.35, len: Math.max(30, len(62) - w(62, 'газ', -6))},
	{at: at(62, 'искра', -6), file: 'sparks', vol: 0.4},
	{at: at(62, 'взрыв', -4), file: 'boom', vol: 0.3},
	MISTAKE(62),
	// the right way under rubble
	{at: at(63, 'тканью', -8), file: 'cloth', vol: 0.4},
	{at: at(63, 'лежи', -6), file: 'exhale', vol: 0.25, len: 50},
	{at: at(64, 'стучи', -6), file: 'knock', vol: 0.4},
	{at: at(64, 'металлу', -8), file: 'clank', vol: 0.45},
	{at: at(64, 'свисти'), file: 'whistle', vol: 0.3},
	{at: at(64, 'кричи', -6), file: 'pop', vol: 0.3},
	{at: at(64, 'заряд', -8), file: 'lowbat', vol: 0.35},
	// the dogs; seventeen days; hold on
	{at: at(65, 'собаки', -8), file: 'steps', vol: 0.25},
	{at: at(65, 'собаки', 10), file: 'bark', vol: 0.4},
	{at: at(65, 'чуют', -6), file: 'inhale', vol: 0.2, len: 24},
	{at: at(65, 'чуют', 24), file: 'bark', vol: 0.3},
	{at: s(66) + 2, file: 'pop', vol: 0.3},
	{at: at(66, 'тысячи', -6), file: 'pop', vol: 0.3},
	...flips(at(66, 'тысячи', -6), at(66, 'семнадцать', -10)),
	{at: at(66, 'семнадцать', -10), file: 'stamp', vol: 0.45},
	{at: at(66, 'семнадцать', -4), file: 'shimmer', vol: 0.22},
	{at: s(67), file: 'swell', vol: 0.3},
	{at: s(67) + 4, file: 'shimmer', vol: 0.3},
	// the recap
	{at: s(68) + 4, file: 'pop', vol: 0.3},
	...[w(69, 'трать', -6), w(69, 'квадратом', -8), w(69, 'никакого', -6), w(69, 'сигналы', -6), w(69, 'лезь', -6)].map((o) => ({at: s(69) + o, file: 'pop', vol: 0.3})),
	{at: at(70, 'запомнил', -6), file: 'shimmer', vol: 0.22},
	{at: at(70, 'запомнил', -4), file: 'pop', vol: 0.3},
	{at: s(71) + 2, file: 'swell', vol: 0.25},
	{at: at(71, 'знания', -8), file: 'shimmer', vol: 0.25},
	{at: at(72, 'спокойствие', -6), file: 'pop', vol: 0.3},
	{at: at(72, 'пиши', -6), file: 'message', vol: 0.4},
	{at: at(73, 'подпишись', -6), file: 'switch', vol: 0.35},
	{at: at(73, 'тгк', -8), file: 'message', vol: 0.4},
	{at: at(73, 'ссылка', -4), file: 'pop', vol: 0.3},
];

const BEDS: Bed[] = [
	// inside the coffin: a low hum of pressure (the hook, the air, the three mistakes, the phone)
	{from: s(1), to: s(6) + IRIS, file: 'drone', vol: 0.12, fade: 24},
	{from: s(7), to: s(10) + IRIS, file: 'drone', vol: 0.09, fade: 24},
	{from: s(13), to: s(23) + IRIS, file: 'drone', vol: 0.09, fade: 24},
	{from: s(30), to: at(31, 'хорошая', 0), file: 'drone', vol: 0.08, fade: 24},
	// the night above the grave
	{from: at(2, 'сверху', -6), to: s(4), file: 'crickets', vol: 0.1, fade: 14},
	{from: s(15), to: s(16), file: 'crickets', vol: 0.12, fade: 14},
	{from: s(17), to: s(19), file: 'crickets', vol: 0.07, fade: 14},
	{from: s(36), to: s(38), file: 'crickets', vol: 0.08, fade: 20},
	// the old days: a film projector
	{from: s(32), to: s(36), file: 'projector', vol: 0.05, fade: 20},
	{from: s(38), to: s(42), file: 'projector', vol: 0.05, fade: 20},
	// the mountains; the avalanche roars until it stops
	{from: s(45), to: s(49) + IRIS, file: 'wind_cold', vol: 0.12, fade: 24},
	{from: s(46), to: at(46, 'останавливается', -4), file: 'sandstorm', vol: 0.22, fade: 10},
	{from: at(46, 'останавливается', -4), to: s(48), file: 'drone', vol: 0.08, fade: 20},
	// the beach
	{from: s(52), to: s(56), file: 'sea', vol: 0.14, fade: 24},
	// the grain; the rubble; the rescuers far away
	{from: s(58), to: s(60), file: 'drone', vol: 0.06, fade: 24},
	{from: s(60), to: s(63) + IRIS, file: 'drone', vol: 0.1, fade: 20},
	{from: s(65), to: end(67), file: 'drone', vol: 0.07, fade: 20},
	{from: s(65), to: end(67), file: 'siren', vol: 0.05, fade: 30},
];

// the voice-over sits at about -18.4 LUFS (2.4 dB under the usual -16): the effects follow it down
const SFX_GAIN = HAS_VOICE ? 0.5 : 1;

export const SFXZ3: React.FC<{r: Remap}> = ({r}) => (
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
