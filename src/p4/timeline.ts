// Part 4 «Спальня»: 16 shots (authoring timeline; the final edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6, 4, 3.3, 2.7, 4.3, 2.7, 4.3, 3.3, 4.5, 1.4, 1.7, 5.2, 2.2, 3.7, 2.8, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

export const SIGNS: Sign[] = [
	{n: 13, title: 'ВМЕСТО НЕГО\nПОДУШКИ', at: s(9) + 60, hold: 36},
	{n: 14, title: 'ПРЯЧЕТСЯ\nВ ТЕМНОТЕ', at: s(12) + 86, hold: 26, y: 1540},
	{n: 15, title: 'ПОДКРАЛСЯ\nСЗАДИ', at: s(15) + 52, hold: 22, y: 1540},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 2 · 23:53'},
	{from: s(3), text: 'ДЕНЬ 2 · 23:56'},
	{from: s(5), text: 'ДЕНЬ 3 · 03:00'},
	{from: s(11), text: 'ДЕНЬ 3 · 03:02'},
];

export const EP4 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 15,
	prefilled: 12,
	counterFrom: s(2),
	hideFrom: s(16) + 248,
	night: [[s(2), s(16) + 300]] as [number, number][],
};
