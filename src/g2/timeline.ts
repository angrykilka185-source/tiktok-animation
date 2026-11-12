// «Голосовые из завтра» — серия 2 «Мяч» (authoring timeline; the edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [3.5, 3.1, 4.6, 3, 2.6, 2.9, 3.7, 3.6, 3.7, 6.6, 4.1, 1.6, 3.6, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

export const SIGNS: Sign[] = [{n: 2, title: 'ЛАМПА\nУПАЛА', at: s(7) + 58, hold: 34}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 23:41'},
	{from: s(2), text: 'ДЕНЬ 2 · 08:15'},
	{from: s(3), text: 'ДЕНЬ 2 · 23:41'},
	{from: s(4), text: 'ДЕНЬ 3 · 10:40'},
	{from: s(9), text: 'ДЕНЬ 3 · 10:41'},
	{from: s(11), text: 'ДЕНЬ 3 · 18:30'},
	{from: s(13), text: 'ДЕНЬ 3 · 19:00'},
];

export const EPG2 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // the lift ✓, the ball (→ ✓ when the lamp falls), the new one «?»
	prefilled: 1,
	pending: [
		{n: 2, at: 0},
		{n: 3, at: s(10) + 158},
	],
	counterFrom: 10,
	hideFrom: s(14) + 248,
	night: [
		[0, s(2)],
		[s(3), s(4)],
		[s(11), s(14) + 300],
	] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
