// «Кнопка 13» — часть 1. Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part k1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [3.6, 4.6, 4.9, 3.9, 5.1, 4.7, 2.1, 5.3, 6.5, 6.4, 4.3, 4.3, 2.5, 2.6, 5.1, 4.1, 4.6, 4.1, 4.8, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// what changed at home after the ride to the 13th floor
export const SIGNS: Sign[] = [{n: 1, title: 'КРОВАТЬ У\nДРУГОЙ СТЕНЫ', at: s(17) + 112, hold: 34, y: 1540}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 16:40'},
	{from: s(6), text: 'ДЕНЬ 1 · 19:30'},
	{from: s(16), text: 'ДЕНЬ 1 · 19:34'},
	{from: s(19), text: 'ДЕНЬ 2 · 03:13'},
];

export const EPK1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 2, // the bed ✕, the next change «?»
	prefilled: 0,
	pending: [{n: 2, at: s(19) + 110}],
	counterFrom: 10,
	hideFrom: s(20) + 248,
	night: [[s(6), s(20) + 300]] as [number, number][],
	counterTitle: 'ИЗМЕНИЛОСЬ',
	mark: 'cross' as const,
	accent: '#ff4a3d',
	plaqueLabel: 'ИЗМЕНЕНИЕ',
};
