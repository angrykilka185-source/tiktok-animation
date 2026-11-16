// Part 7 «Финал» (зрители выбрали: позвонить в полицию): 21 shots (authoring timeline; the final edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [5.9, 2.7, 2.3, 2.6, 2.1, 3.3, 4.3, 4.4, 4.8, 3.7, 4.0, 3.6, 5.6, 3.6, 5.0, 2.7, 2.4, 4.4, 5.1, 5.3, 7.5];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// the real dad, sign by sign (the reverse of part 1's signs); the last one stays «?» — he knows the word too
export const SIGNS: Sign[] = [
	{n: 1, title: 'ЗНАЕТ СЛОВО\n«КАРАСЬ»', at: s(12) + 96, hold: 22, y: 1540},
	{n: 2, title: 'ПАХНЕТ\nСОЛЯРКОЙ', at: s(18) + 58, hold: 18, y: 1540},
	{n: 3, title: 'ЕСТ\nЛЕВОЙ РУКОЙ', at: s(18) + 112, hold: 18, y: 1540},
	{n: 4, title: 'ЗОВЁТ\n«ТИГРЁНОК»', at: s(19) + 36, hold: 20, y: 1540},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 3 · 03:18'},
	{from: s(8), text: 'ДЕНЬ 3 · 03:19'},
	{from: s(11), text: 'ДЕНЬ 3 · 03:21'},
	{from: s(14), text: 'ДЕНЬ 3 · 03:26'},
	{from: s(17), text: 'ДЕНЬ 3 · 05:40'},
	{from: s(18), text: 'ДЕНЬ 3 · 08:15'},
	{from: s(20), text: 'ДЕНЬ 3 · 23:47'},
];

export const EP7 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 5, // 4 ✓ and a «?»
	prefilled: 0,
	pending: [{n: 5, at: s(20) + 112}],
	counterFrom: s(12),
	hideFrom: s(21),
	night: [
		[s(2), s(18)],
		[s(20), s(21) + 400],
	] as [number, number][],
	counterTitle: 'НАСТОЯЩИЙ ПАПА',
	mark: 'check' as const,
	accent: '#7ee08a',
	plaqueLabel: 'ЭТО ОН',
};
