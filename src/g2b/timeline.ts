// «Голосовые из завтра» — серия 2 «Не трогай мяч» (the viewers chose to obey).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part g2b retimes it to the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [3.3, 3, 4.9, 3.5, 3.9, 4.3, 3.9, 3.6, 2.3, 3.3, 3.7, 6.9, 3.2, 3.2, 3.1, 4.7, 6.9, 5.4, 2, 3.7, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// the lamp falls where Max (and a minute ago you) stood: the ball prediction came true
export const SIGNS: Sign[] = [{n: 2, title: 'ЛАМПА\nУПАЛА', at: s(10) + 54, hold: 34, y: 1540}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 23:41'},
	{from: s(2), text: 'ДЕНЬ 2 · 08:15'},
	{from: s(3), text: 'ДЕНЬ 2 · 23:41'},
	{from: s(4), text: 'ДЕНЬ 3 · 10:40'},
	{from: s(15), text: 'ДЕНЬ 3 · 10:42'},
	{from: s(18), text: 'ДЕНЬ 3 · 18:30'},
	{from: s(20), text: 'ДЕНЬ 3 · 19:00'},
];

export const EPG2B = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // the lift ✓, the ball (→ ✓ when the lamp falls), the new one «?»
	prefilled: 1,
	pending: [
		{n: 2, at: 0},
		{n: 3, at: s(17) + 165},
	],
	counterFrom: 10,
	hideFrom: s(21) + 248,
	night: [
		[0, s(2)],
		[s(3), s(4)],
		[s(18), s(21) + 300],
	] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
