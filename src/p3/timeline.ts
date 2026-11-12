// Part 3 «Видеозвонок»: 19 shots (authoring timeline; the final edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6, 5, 3, 4, 4, 3, 4, 5, 4, 4, 5, 4, 5, 5, 4, 5, 4, 5, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// recap of part 2: signs 7–9 fly into the counter (1–6 are already filled)
export const RECAP_STEP = 40;
export const SIGNS: Sign[] = [
	{n: 7, title: 'НЕ ЗНАЕТ\nСЕКРЕТНОЕ СЛОВО', at: s(2) + 6, hold: 18},
	{n: 8, title: 'ГОВОРИТ СЛОВАМИ\nИЗ СООБЩЕНИЙ', at: s(2) + 6 + RECAP_STEP, hold: 18},
	{n: 9, title: 'СПРЯТАЛ ФОТО\nНАСТОЯЩЕГО ПАПЫ', at: s(2) + 6 + RECAP_STEP * 2, hold: 18},
	{n: 10, title: 'У НЕГО\nПАПИН ТЕЛЕФОН', at: s(5) + 60, hold: 40},
	{n: 11, title: 'ВРЁТ\nПРО СВЯЗЬ', at: s(8) + 80, hold: 40},
	{n: 12, title: 'ЗВОНИТ ИЗ-ЗА\nТВОЕЙ ДВЕРИ', at: s(13) + 80, hold: 44},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 2 · 23:52'},
	{from: s(4), text: 'ДЕНЬ 2 · 23:53'},
	{from: s(12), text: 'ДЕНЬ 2 · 23:55'},
	{from: s(15), text: 'ДЕНЬ 2 · 23:56'},
];

export const EP3 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 12,
	prefilled: 6,
	counterFrom: s(2),
	hideFrom: s(19) + 248,
	night: [[s(2), s(19) + 300]] as [number, number][],
};
