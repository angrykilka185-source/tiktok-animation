// «Каково это — умереть от лап медведя» — the sound: the voice (Чоби), quiet beds (the forest by day and by
// night, the winter wind, the village) and the effects (the bear, the branches, the spray…), timed on the words of the voice.
// All sounds are procedural (scripts/make-sfx.mjs): no music tracks, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {CHOBI_VISITS, IRIS, STOP_WALK} from './chobiKit';
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
// Чоби walks in from the right (his steps), raises his palm — a referee's whistle — «Стоп, Гога!» pops out, and he
// walks back out at `to` (no steps when he is still there at the cut)
const stop = (n: number, from: number, to: number): Cue[] => [
	{at: s(n) + from, file: 'steps', vol: 0.2, len: STOP_WALK + 4},
	{at: s(n) + from + STOP_WALK - 2, file: 'whistle', vol: 0.22},
	{at: s(n) + from + STOP_WALK + 2, file: 'pop', vol: 0.3},
	...(to < len(n) ? [{at: s(n) + to, file: 'steps', vol: 0.15, len: STOP_WALK + 4}] : []),
];
// the HUD crosses out one more of Гога's mistakes
const MISTAKE = (n: number) => ({at: at(n, 'ошибка'), file: 'stamp', vol: 0.4});
// the air meter drops
const AIR_DROP = (n: number, word: string) => ({at: at(n, word), file: 'decline', vol: 0.3});
// the calendar flips from day 1 to day 17
const flips = (from: number, to: number): Cue[] => Array.from({length: 16}).map((_, k) => ({at: Math.round(from + ((k + 0.5) / 16) * (to - from)), file: 'pat', vol: 0.22}));

// lines popping onto a page, on these words
const pops = (n: number, words: [string, number][], vol = 0.28): Cue[] => words.map(([wd, add]) => ({at: at(n, wd, add), file: 'pop', vol}));

const CUES: Cue[] = [
	...VISITS,
	// the hook: the forest, branches cracking ahead; the bear; it stands up; he screams and runs
	{at: s(1) + 4, file: 'steps', vol: 0.14},
	{at: s(1) + 60, file: 'steps', vol: 0.14},
	{at: at(1, 'хрустят', -6), file: 'twig', vol: 0.5},
	{at: at(1, 'хрустят', 4), file: 'rustle', vol: 0.3},
	{at: at(1, 'хрустят', 10), file: 'twig', vol: 0.35},
	{at: at(2, 'медведь', -12), file: 'paws', vol: 0.35},
	{at: at(2, 'медведь', -10), file: 'rustle', vol: 0.25},
	{at: at(2, 'медведь', -2), file: 'heart_big', vol: 0.35},
	{at: at(2, 'шагах', -4), file: 'pop', vol: 0.25},
	{at: at(2, 'триста', -6), file: 'pop', vol: 0.3},
	{at: at(3, 'встаёт', -6), file: 'whoosh', vol: 0.22},
	{at: at(3, 'встаёт', -2), file: 'growl', vol: 0.4},
	...beats(s(3) + 6, [0, 22, 44, 66, 88, 110], 0.28),
	{at: at(3, 'выше', -6), file: 'pop', vol: 0.3},
	{at: at(4, 'кричит', -4), file: 'gasp', vol: 0.4},
	{at: at(4, 'разворачивается', -4), file: 'whoosh', vol: 0.25},
	{at: at(4, 'бежит', -6), file: 'steps', vol: 0.3},
	{at: at(4, 'бежит', 0), file: 'roar', vol: 0.45},
	{at: at(4, 'бежит', 4), file: 'gallop', vol: 0.4},
	// «Стоп, Гога!» — two mistakes
	{at: s(5) - 3, file: 'slowdown', vol: 0.3},
	...stop(5, 0, len(5) - 20),
	{at: at(5, 'две', -4), file: 'stamp', vol: 0.35},
	{at: at(5, 'две', 4), file: 'stamp', vol: 0.35},
	{at: at(5, 'первую', -4), file: 'pop', vol: 0.3},
	// Чоби's intro: the claw marks across the title
	{at: at(6, 'каково', -4), file: 'pop', vol: 0.3},
	{at: at(6, 'медведя', -2), file: 'tear', vol: 0.35},
	{at: at(6, 'медведя', 0), file: 'growl', vol: 0.2},
	{at: at(6, 'гога', -6), file: 'steps', vol: 0.14},
	{at: at(6, 'гога', -2), file: 'pop', vol: 0.28},
	{at: at(6, 'правила', -6), file: 'pop', vol: 0.28},
	{at: at(6, 'поехали', -6), file: 'whoosh', vol: 0.45},
	// the master of the forest: the weight, the speed, the nose, the claws, how many
	{at: s(7) + 2, file: 'paws', vol: 0.32},
	{at: s(7) + 50, file: 'paws', vol: 0.28},
	{at: at(7, 'самый', -6), file: 'pop', vol: 0.3},
	{at: at(7, 'триста', -6), file: 'clank', vol: 0.3},
	{at: at(7, 'триста', 2), file: 'abacus', vol: 0.15, len: 30},
	{at: at(7, 'камчатке', -6), file: 'stamp', vol: 0.3},
	{at: at(8, 'разгоняется', -8), file: 'gallop', vol: 0.45},
	{at: at(8, 'разгоняется', -6), file: 'whoosh', vol: 0.3},
	{at: at(8, 'разгоняется', 64), file: 'gallop', vol: 0.4},
	{at: at(8, 'пятидесяти', 4), file: 'pop', vol: 0.3},
	{at: at(8, 'быстрее', -10), file: 'steps', vol: 0.2},
	{at: s(9) + 4, file: 'sniff', vol: 0.4},
	{at: at(9, 'собаки', -8), file: 'bark', vol: 0.22},
	{at: at(9, 'километры', -8), file: 'sniff', vol: 0.4},
	{at: at(9, 'километры', -4), file: 'whoosh', vol: 0.2},
	{at: at(10, 'палец', -8), file: 'pop', vol: 0.3},
	{at: at(10, 'переворачивает', -2), file: 'bump', vol: 0.4},
	{at: at(10, 'переворачивает', 10), file: 'thud', vol: 0.3},
	{at: at(10, 'пни', -6), file: 'crunch', vol: 0.45},
	{at: at(11, 'трёхсот', -6), file: 'abacus', vol: 0.2, len: 40},
	{at: at(11, 'больше', -6), file: 'stamp', vol: 0.35},
	// a person is not food; when it attacks
	{at: at(12, 'не', -4), file: 'stamp', vol: 0.35},
	...pops(12, [
		['траву', -4],
		['ягоды', -4],
		['корни', -4],
		['орехи', -4],
		['рыбу', -4],
	]),
	...pops(13, [
		['редко', -6],
		['защищается', -8],
		['застали', -6],
		['медвежатам', -10],
		['добыче', -8],
	]),
	// mistake one: alone, in headphones; be heard; the sudden meeting; clap and sing
	...stop(14, w(14, 'ошибка', -14), len(14) - 18),
	MISTAKE(14),
	{at: s(14) + 2, file: 'steps', vol: 0.14},
	{at: at(15, 'услышит', -8), file: 'pop', vol: 0.25},
	{at: at(15, 'уйдёт', -8), file: 'paws', vol: 0.3},
	{at: at(15, 'уйдёт', -6), file: 'rustle', vol: 0.25},
	{at: at(16, 'поворота', -30), file: 'steps', vol: 0.14},
	{at: at(16, 'нескольких', -6), file: 'heart_big', vol: 0.4},
	{at: at(16, 'нескольких', -4), file: 'rustle', vol: 0.3},
	{at: at(16, 'защищается', -8), file: 'roar', vol: 0.45},
	...peaks(at(17, 'хлопай', -6), at(17, 'компанией', -8), 3, 'pat', 0.3),
	{at: at(17, 'компанией', -8), file: 'steps', vol: 0.2},
	{at: at(17, 'первым', -8), file: 'paws', vol: 0.2},
	// mistake two: running; the chase; standing up to sniff
	{at: s(18) - 3, file: 'slowdown', vol: 0.3},
	...stop(18, 0, len(18) - 18),
	MISTAKE(18),
	...rep(s(19), 4, 72, 'gallop', 0.32),
	...rep(s(19) + 6, 10, 30, 'steps', 0.14),
	{at: at(19, 'секунд', -8), file: 'tick', vol: 0.2, len: 60},
	{at: at(19, 'добычу', -8), file: 'stamp', vol: 0.3},
	{at: at(19, 'инстинкт', -8), file: 'growl', vol: 0.35},
	{at: at(20, 'не', -4), file: 'pop', vol: 0.28},
	{at: at(20, 'принюхивается', -8), file: 'sniff', vol: 0.45},
	{at: at(20, 'принюхивается', 20), file: 'sniff', vol: 0.3},
	{at: at(20, 'разглядывает', -8), file: 'pop', vol: 0.28},
	// the right way (Чоби)
	{at: s(21) + 6, file: 'paws', vol: 0.18},
	...pops(21, [
		['остановись', -6],
		['кричи', -6],
		['смотри', -6],
	]),
	{at: at(22, 'подними', -6), file: 'whoosh', vol: 0.2},
	{at: at(22, 'кажешься', -6), file: 'swell', vol: 0.2},
	{at: at(22, 'медленно', -6), file: 'steps_slow', vol: 0.2},
	...pops(22, [
		['человек', -10],
		['поворачиваясь', -6],
	]),
	// mistake three: the tree
	{at: at(23, 'фильмы', -10), file: 'projector', vol: 0.15, len: 40},
	{at: at(23, 'лезет', -22), file: 'scrape', vol: 0.3},
	{at: at(23, 'лезет', -4), file: 'cloth', vol: 0.25},
	{at: at(23, 'дерево', -4), file: 'scrape', vol: 0.25},
	...stop(24, 0, w(24, 'медведи', -4)),
	MISTAKE(24),
	{at: at(24, 'лазать', -10), file: 'scrape', vol: 0.3},
	{at: at(24, 'молодые', -6), file: 'scrape', vol: 0.3},
	{at: at(24, 'если', 0), file: 'paws', vol: 0.3},
	{at: at(24, 'если', 40), file: 'paws', vol: 0.25},
	{at: at(24, 'ждать', -4), file: 'growl', vol: 0.3},
	{at: s(25) + 30, file: 'paws', vol: 0.18},
	{at: at(25, 'ловушка', -6), file: 'slam', vol: 0.3},
	...rep(at(25, 'некуда', -6), 3, 5, 'pop', 0.25),
	// the charge; the bluff
	{at: at(26, 'бросился', -10), file: 'roar', vol: 0.5},
	{at: at(26, 'бросился', -8), file: 'gallop', vol: 0.5},
	{at: at(27, 'ложная', -4), file: 'stamp', vol: 0.3},
	{at: at(27, 'несётся', -6), file: 'gallop', vol: 0.45},
	{at: at(27, 'останавливается', -4), file: 'dirt', vol: 0.25, len: 40},
	{at: at(27, 'останавливается', 2), file: 'huff', vol: 0.4},
	{at: at(27, 'проносится', -8), file: 'gallop', vol: 0.4},
	{at: at(27, 'проносится', -4), file: 'whoosh', vol: 0.3},
	{at: at(27, 'проверяет', -2), file: 'sniff', vol: 0.3},
	// the warnings (Чоби)
	{at: s(28) + 2, file: 'paws', vol: 0.2},
	{at: at(28, 'пыхтит', -6), file: 'huff', vol: 0.45},
	{at: at(28, 'щёлкает', -4), file: 'jaw', vol: 0.5},
	{at: at(28, 'бьёт', 6), file: 'thud', vol: 0.45},
	{at: at(28, 'прижимает', -4), file: 'growl', vol: 0.35},
	// stand still; a step from the bear
	...rep(s(29) + 10, 4, 64, 'huff', 0.2),
	{at: at(29, 'бежать', 4), file: 'stamp', vol: 0.3},
	{at: at(29, 'стой', -6), file: 'pop', vol: 0.28},
	{at: at(29, 'говори', 10), file: 'pop', vol: 0.28},
	{at: at(29, 'медленно', -4), file: 'steps_slow', vol: 0.2},
	...beats(s(30), [0, 30, 60], 0.4),
	{at: s(30) + 16, file: 'huff', vol: 0.2},
	{at: at(30, 'шаге', -6), file: 'pop', vol: 0.3},
	// what it feels like (Чоби): the heart, the tunnel, the time; the pain; «беги» — «стой»
	...beats(s(31), [0, 14, 28, 42, 56, 70, 84, 98], 0.28),
	{at: at(31, 'адреналин', -6), file: 'swell', vol: 0.3},
	{at: at(31, 'видишь', -6), file: 'warp', vol: 0.15, len: 60},
	{at: at(31, 'время', -6), file: 'slowdown', vol: 0.3},
	{at: at(31, 'время', 4), file: 'tick', vol: 0.22, len: 100},
	{at: at(32, 'боли', -6), file: 'pop', vol: 0.3},
	{at: at(32, 'адреналин', -6), file: 'swell', vol: 0.25},
	{at: at(32, 'тело', -6), file: 'shimmer', vol: 0.2},
	{at: at(33, 'беги', -8), file: 'heart_big', vol: 0.35},
	{at: at(33, 'стой', -8), file: 'shimmer', vol: 0.22},
	{at: at(33, 'стой', -6), file: 'pop', vol: 0.3},
	// mistake four: the cubs and the selfie; the mother
	{at: s(34) + 2, file: 'steps', vol: 0.16},
	{at: at(34, 'милые', -6), file: 'shimmer', vol: 0.25},
	{at: at(34, 'телефон', -10), file: 'cloth', vol: 0.2},
	{at: at(34, 'идёт', -4), file: 'steps', vol: 0.15},
	{at: at(34, 'селфи', 4), file: 'shutter', vol: 0.45},
	{at: s(35) - 3, file: 'slowdown', vol: 0.3},
	...stop(35, 0, len(35) - 18),
	MISTAKE(35),
	{at: at(36, 'мама', -16), file: 'rustle', vol: 0.35},
	{at: at(36, 'мама', -14), file: 'paws', vol: 0.35},
	{at: at(36, 'медведица', -4), file: 'growl', vol: 0.4},
	{at: at(36, 'самый', -8), file: 'whoosh', vol: 0.2},
	{at: at(36, 'самый', -4), file: 'roar', vol: 0.55},
	{at: at(36, 'самый', 2), file: 'heart_big', vol: 0.3},
	{at: at(37, 'шестисот', -8), file: 'abacus', vol: 0.22, len: 40},
	{at: at(37, 'самая', -6), file: 'whoosh', vol: 0.25},
	{at: at(37, 'медведицей', -8), file: 'stamp', vol: 0.4},
	{at: at(38, 'медвежонка', -6), file: 'pop', vol: 0.28},
	{at: at(38, 'уходи', -8), file: 'steps', vol: 0.18},
	{at: at(38, 'уходи', 40), file: 'steps', vol: 0.16},
	{at: at(38, 'мамы', -6), file: 'rustle', vol: 0.35},
	{at: at(38, 'почти', -6), file: 'growl', vol: 0.35},
	// mistake five: food in the tent; night guests
	{at: at(39, 'ставит', -6), file: 'cloth', vol: 0.35},
	{at: at(39, 'ставит', -2), file: 'whoosh', vol: 0.2},
	...pops(39, [
		['колбасу', -6],
		['сгущёнку', -6],
		['чипсы', -6],
	]),
	{at: at(39, 'вдруг', -8), file: 'steps', vol: 0.15},
	{at: at(39, 'вдруг', 18), file: 'cloth', vol: 0.25},
	{at: at(39, 'ночью', -4), file: 'shimmer', vol: 0.2},
	...stop(40, 0, w(40, 'медвежий', -6)),
	MISTAKE(40),
	{at: at(40, 'нос', 0), file: 'owl', vol: 0.22},
	{at: at(40, 'учует', -6), file: 'paws', vol: 0.2},
	{at: at(40, 'учует', 4), file: 'sniff', vol: 0.4},
	{at: at(40, 'километры', -6), file: 'sniff', vol: 0.35},
	{at: at(40, 'ночью', -6), file: 'paws', vol: 0.3},
	{at: at(40, 'ночью', 20), file: 'twig', vol: 0.35},
	{at: at(40, 'придут', -4), file: 'growl', vol: 0.35},
	...pops(41, [
		['подальше', -6],
		['контейнерах', -10],
		['готовь', -6],
		['мусор', -6],
	]),
	// never feed a bear; a fed bear is a dead bear
	{at: at(42, 'корми', -6), file: 'stamp', vol: 0.35},
	{at: at(42, 'угостили', -46), file: 'paws', vol: 0.28},
	{at: at(42, 'угостили', -12), file: 'whoosh', vol: 0.2},
	{at: at(42, 'угостили', 2), file: 'chew', vol: 0.4},
	{at: at(42, 'связывать', -6), file: 'pop', vol: 0.28},
	{at: at(42, 'перестаёт', -6), file: 'paws', vol: 0.3},
	{at: at(42, 'приходит', -4), file: 'whoosh', vol: 0.25},
	{at: s(43) + 4, file: 'clank', vol: 0.25},
	{at: s(43) + 24, file: 'bark', vol: 0.18},
	{at: at(43, 'отстреливать', -12), file: 'decline', vol: 0.3},
	{at: at(43, 'поэтому', -6), file: 'boom', vol: 0.22},
	{at: at(43, 'мёртвый', -4), file: 'stamp', vol: 0.4},
	// winter: the skis, the den, the poke; mistake six; the «шатуны»; tracks — 112
	{at: s(44), file: 'ski', vol: 0.35},
	{at: s(44) + 30, file: 'ski', vol: 0.3},
	{at: at(44, 'видит', -4), file: 'pop', vol: 0.25},
	{at: at(44, 'дырочкой', -24), file: 'whoosh', vol: 0.2},
	{at: at(44, 'иней', -6), file: 'shimmer', vol: 0.3},
	{at: at(44, 'дышит', -14), file: 'breath', vol: 0.3, len: 60},
	{at: at(44, 'интересно', -4), file: 'pop', vol: 0.3},
	{at: at(44, 'интересно', 12), file: 'ski', vol: 0.3},
	...rep(at(44, 'тычет', -2), 4, 10, 'thud', 0.22),
	...stop(45, 0, w(45, 'это', -16)),
	MISTAKE(45),
	{at: at(45, 'берлога', -6), file: 'breath', vol: 0.25, len: 60},
	{at: at(45, 'разбудили', -6), file: 'growl', vol: 0.35},
	{at: at(45, 'злой', -10), file: 'roar', vol: 0.6},
	{at: at(45, 'злой', -10), file: 'dirt', vol: 0.4, len: 60},
	{at: at(45, 'злой', -8), file: 'boom', vol: 0.25},
	...rep(s(46), 4, 50, 'paws', 0.18),
	{at: at(46, 'шатуны', -6), file: 'stamp', vol: 0.35},
	{at: at(46, 'накопили', -8), file: 'decline', vol: 0.3},
	{at: at(46, 'залечь', -8), file: 'stamp', vol: 0.3},
	...rep(s(47), 4, 54, 'snowstep', 0.15),
	{at: at(47, 'выходят', 30), file: 'bark', vol: 0.28},
	{at: at(47, 'выходят', 60), file: 'bark', vol: 0.22},
	{at: at(47, 'шатун', -6), file: 'growl', vol: 0.35},
	{at: s(48), file: 'snowstep', vol: 0.3},
	{at: at(48, 'следы', -12), file: 'pop', vol: 0.3},
	{at: at(48, 'уходи', -6), file: 'snowstep', vol: 0.3},
	{at: at(48, 'звони', -8), file: 'dtmf112', vol: 0.35},
	{at: at(48, 'сто', -4), file: 'pop', vol: 0.3},
	// if it attacks: play dead; the exception: fight; the spray
	{at: at(49, 'главное', -8), file: 'stamp', vol: 0.3},
	{at: at(49, 'бурый', -8), file: 'pop', vol: 0.3},
	{at: s(50), file: 'bump', vol: 0.35},
	{at: s(50) + 2, file: 'cloth', vol: 0.3},
	{at: s(50) + 6, file: 'paws', vol: 0.28},
	{at: s(50) + 84, file: 'sniff', vol: 0.3},
	{at: at(50, 'ложись', -4), file: 'pop', vol: 0.28},
	{at: at(50, 'сцепи', -4), file: 'cloth', vol: 0.25},
	{at: at(50, 'шею', -12), file: 'shimmer', vol: 0.2},
	{at: at(51, 'расставь', -8), file: 'cloth', vol: 0.25},
	...[8, 30, 52].map((o) => ({at: at(51, 'медведю', -6 + o), file: 'thud', vol: 0.32})),
	{at: at(51, 'медведю', 4), file: 'huff', vol: 0.22},
	{at: at(51, 'рюкзак', -6), file: 'pop', vol: 0.28},
	{at: at(51, 'защитит', -6), file: 'shimmer', vol: 0.25},
	{at: at(52, 'лежи', -4), file: 'pop', vol: 0.25},
	{at: at(52, 'отошёл', -14), file: 'paws', vol: 0.25},
	{at: at(52, 'стоять', -6), file: 'sniff', vol: 0.25},
	{at: at(52, 'уходит', 0), file: 'paws', vol: 0.2},
	{at: at(53, 'исключение', -6), file: 'stamp', vol: 0.35},
	...[w(53, 'крадётся', -6), w(53, 'лезет', -6), w(53, 'уходит', -8)].map((o) => ({at: s(53) + o, file: 'whoosh', vol: 0.2})),
	...rep(at(53, 'видит', -6), 3, 4, 'beep', 0.15),
	{at: at(53, 'притворяться', -4), file: 'stamp', vol: 0.5},
	{at: at(54, 'дерись', 0), file: 'whoosh', vol: 0.25},
	{at: at(54, 'камнями', -6), file: 'whoosh', vol: 0.25},
	{at: at(54, 'камнями', 8), file: 'knock', vol: 0.45},
	{at: at(54, 'палкой', -4), file: 'pop', vol: 0.28},
	{at: at(54, 'ножом', -4), file: 'pop', vol: 0.28},
	{at: at(54, 'бей', -2), file: 'whoosh', vol: 0.3},
	{at: at(54, 'носу', -6), file: 'knock', vol: 0.45},
	{at: at(54, 'носу', -4), file: 'huff', vol: 0.3},
	{at: at(54, 'белым', -6), file: 'gust', vol: 0.3},
	{at: at(54, 'только', -4), file: 'roar', vol: 0.4},
	{at: at(54, 'только', -2), file: 'stamp', vol: 0.3},
	{at: at(55, 'перцовый', -6), file: 'pop', vol: 0.3},
	{at: at(55, 'перцовый', 2), file: 'spray', vol: 0.2},
	{at: at(55, 'медведей', -6), file: 'pop', vol: 0.28},
	{at: at(55, 'его', -4), file: 'gallop', vol: 0.45},
	{at: at(55, 'облаком', -6), file: 'spray', vol: 0.5},
	{at: at(55, 'морду', -4), file: 'huff', vol: 0.35},
	{at: at(55, 'морду', 6), file: 'growl', vol: 0.25},
	{at: at(55, 'бежит', 4), file: 'gallop', vol: 0.3},
	{at: at(56, 'аляске', -6), file: 'pop', vol: 0.28},
	{at: at(56, 'десятки', -6), file: 'abacus', vol: 0.2, len: 30},
	{at: at(56, 'девяти', -6), file: 'shimmer', vol: 0.3},
	{at: at(56, 'девяти', -2), file: 'stamp', vol: 0.3},
	// the man among the grizzlies; autumn 2003; the film; not a toy
	{at: s(57) + 2, file: 'steps', vol: 0.14},
	{at: at(57, 'тринадцать', -6), file: 'abacus', vol: 0.18, len: 30},
	{at: at(57, 'подходил', -6), file: 'steps', vol: 0.15},
	...pops(57, [
		['имена', -8],
		['разговаривал', -6],
	]),
	{at: at(57, 'друзья', -16), file: 'shimmer', vol: 0.25},
	{at: at(58, 'задержался', -6), file: 'tick', vol: 0.2, len: 40},
	{at: at(58, 'медведи', -6), file: 'paws', vol: 0.3},
	{at: at(58, 'голодные', -6), file: 'growl', vol: 0.25},
	{at: at(58, 'набрать', -6), file: 'swell', vol: 0.2},
	{at: at(59, 'погибли', -6), file: 'heart_one', vol: 0.25},
	{at: at(59, 'сняли', -10), file: 'projector', vol: 0.15, len: 60},
	{at: s(60) + 2, file: 'squeak', vol: 0.35},
	{at: at(60, 'игрушка', -10), file: 'stamp', vol: 0.45},
	{at: at(60, 'дикий', -10), file: 'roar', vol: 0.6},
	{at: at(60, 'дикий', -8), file: 'boom', vol: 0.2},
	// the recap with Гога; the finale
	{at: s(61) + 4, file: 'steps', vol: 0.15},
	{at: s(61) + 10, file: 'pop', vol: 0.28},
	...pops(62, [
		['шуми', -6],
		['беги', -8],
		['говори', -6],
		['медвежат', -8],
		['еду', -6],
		['корми', -10],
		['ложись', -8],
		['дерись', -8],
	]),
	{at: at(63, 'запомнил', -8), file: 'shimmer', vol: 0.25},
	{at: at(63, 'запомнил', -6), file: 'pop', vol: 0.3},
	{at: at(64, 'гостях', -46), file: 'steps', vol: 0.2},
	{at: at(64, 'гостях', -40), file: 'chatter', vol: 0.1, len: 80},
	{at: at(64, 'правила', -8), file: 'pop', vol: 0.28},
	{at: at(64, 'встреча', -2), file: 'huff', vol: 0.18},
	{at: at(64, 'разойдётесь', -10), file: 'paws', vol: 0.25},
	{at: at(64, 'разойдётесь', -6), file: 'steps', vol: 0.18},
	{at: at(64, 'разойдётесь', 6), file: 'shimmer', vol: 0.2},
	{at: at(65, 'пиши', -6), file: 'message', vol: 0.4},
	{at: at(66, 'подпишись', -6), file: 'switch', vol: 0.35},
	{at: at(66, 'тгк', -8), file: 'message', vol: 0.4},
	{at: at(66, 'ссылка', -4), file: 'pop', vol: 0.3},
];

const BEDS: Bed[] = [
	// the forest by day: birds and leaves
	{from: s(1), to: s(5), file: 'forest', vol: 0.12, fade: 20},
	{from: s(7), to: s(12), file: 'forest', vol: 0.1, fade: 20},
	{from: s(14), to: s(21), file: 'forest', vol: 0.11, fade: 20},
	{from: s(23), to: s(28), file: 'forest', vol: 0.1, fade: 20},
	{from: s(29), to: s(31), file: 'forest', vol: 0.08, fade: 20},
	{from: s(34), to: s(39), file: 'forest', vol: 0.11, fade: 20},
	{from: s(42), to: s(43), file: 'forest', vol: 0.1, fade: 20},
	{from: s(50), to: s(53), file: 'forest', vol: 0.08, fade: 20},
	{from: s(54), to: at(54, 'белым', -6), file: 'forest', vol: 0.08, fade: 14},
	{from: at(55, 'его', -6), to: s(56), file: 'forest', vol: 0.08, fade: 14},
	{from: s(57), to: s(58), file: 'forest', vol: 0.07, fade: 20},
	{from: at(60, 'даже', -6), to: s(61), file: 'forest', vol: 0.1, fade: 14},
	{from: s(64), to: s(65), file: 'forest', vol: 0.1, fade: 20},
	// the tension of a step from the bear
	{from: s(30), to: s(31), file: 'drone', vol: 0.08, fade: 14},
	// dusk and night: crickets
	{from: s(39), to: s(40), file: 'crickets', vol: 0.06, fade: 20},
	{from: at(40, 'медвежий', 0), to: s(41), file: 'crickets', vol: 0.1, fade: 20},
	{from: s(43), to: at(43, 'поэтому', -6), file: 'crickets', vol: 0.08, fade: 14},
	{from: at(43, 'поэтому', -6), to: s(44), file: 'drone', vol: 0.08, fade: 14},
	// winter wind
	{from: s(44), to: s(49), file: 'wind_cold', vol: 0.1, fade: 24},
	{from: at(54, 'белым', -6), to: s(55), file: 'wind_cold', vol: 0.12, fade: 14},
	// Alaska: the wind; autumn; the sad end
	{from: s(57), to: s(59), file: 'wind', vol: 0.06, fade: 24},
	{from: s(59), to: s(60), file: 'drone', vol: 0.09, fade: 20},
];

// the voice-over sits at about -18.2 LUFS (as in «погребённым заживо»): the effects follow it down
const SFX_GAIN = HAS_VOICE ? 0.5 : 1;

export const SFXZ4: React.FC<{r: Remap}> = ({r}) => (
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
