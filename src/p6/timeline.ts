// Part 6 «Гараж»: 23 shots (authoring timeline; the final edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6, 3.7, 3.4, 2.1, 4.1, 3.6, 3.8, 3.7, 2.2, 4.5, 3.1, 4.2, 3.2, 3.6, 5, 4.6, 3.9, 4.4, 3.5, 4.2, 3.7, 3.8, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

export const SIGNS: Sign[] = [
	{n: 20, title: 'НАСТОЯЩИЙ ПАПА\nВ ГАРАЖЕ', at: s(15) + 16, hold: 30, y: 1540},
	{n: 21, title: 'ПИШЕТ С ПАПИНОГО\nТЕЛЕФОНА', at: s(19) + 78, hold: 22, y: 1540},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 3 · 03:07'},
	{from: s(5), text: 'ДЕНЬ 3 · 03:12'},
	{from: s(8), text: 'ДЕНЬ 3 · 03:14'},
	{from: s(10), text: 'ДЕНЬ 3 · 03:16'},
	{from: s(20), text: 'ДЕНЬ 3 · 03:18'},
];

export const EP6 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 21,
	prefilled: 19,
	counterFrom: s(2),
	hideFrom: s(23) + 248,
	night: [[s(2), s(23) + 300]] as [number, number][],
};
