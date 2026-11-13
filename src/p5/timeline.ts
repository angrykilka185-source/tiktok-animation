// Part 5 «Лунатик»: 23 shots (authoring timeline; the final edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6, 4, 2.2, 3.4, 2.4, 4.1, 3.8, 3.8, 3.5, 4, 4.4, 3.7, 4.1, 3.2, 3.4, 4.1, 3.6, 4.4, 3.9, 2.3, 3.2, 2.5, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

export const SIGNS: Sign[] = [
	{n: 16, title: 'ПАХНЕТ\nНЕ ПАПОЙ', at: s(8) + 96, hold: 24, y: 1540},
	{n: 17, title: 'ПРОВЕРЯЕТ,\nСПИШЬ ЛИ ТЫ', at: s(13) + 100, hold: 20, y: 1540},
	{n: 18, title: 'ВЫПЫТЫВАЕТ\nНАШЕ СЛОВО', at: s(15) + 84, hold: 18, y: 1540},
	{n: 19, title: 'ЗНАЕТ, ГДЕ\nНАСТОЯЩИЙ ПАПА', at: s(18) + 100, hold: 26, y: 1540},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 3 · 03:02'},
	{from: s(6), text: 'ДЕНЬ 3 · 03:03'},
	{from: s(11), text: 'ДЕНЬ 3 · 03:05'},
	{from: s(14) + 52, text: 'ДЕНЬ 3 · 03:06'},
	{from: s(14) + 85, text: 'ДЕНЬ 3 · 03:07'},
	{from: s(19), text: 'ДЕНЬ 3 · 03:11'},
];

export const EP5 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 19,
	prefilled: 15,
	counterFrom: s(2),
	hideFrom: s(23) + 248,
	night: [[s(2), s(23) + 300]] as [number, number][],
};
