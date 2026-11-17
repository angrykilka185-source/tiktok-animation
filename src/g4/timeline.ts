// «Голосовые из завтра» — часть 4 (the viewers chose to turn the phone off).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part g4 retimes it to the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [3.2, 3.1, 4.7, 3.0, 3.3, 4.0, 3.3, 4.6, 3.0, 4.1, 3.6, 3.0, 3.6, 2.6, 6.2, 2.4, 3.3, 3.9, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// «завтра он придёт в школу вместо тебя» — he did
export const SIGNS: Sign[] = [{n: 4, title: 'ПРИШЁЛ В ШКОЛУ\nВМЕСТО ТЕБЯ', at: s(10) + 40, hold: 26, y: 1540}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 2 · 08:15'},
	{from: 48, text: 'ДЕНЬ 3 · 10:40'},
	{from: s(2), text: 'ДЕНЬ 3 · 19:01'},
	{from: s(3), text: 'ДЕНЬ 3 · 23:41'},
	{from: s(3) + 80, text: 'ДЕНЬ 3 · 23:42'},
	{from: s(7), text: 'ДЕНЬ 4 · 09:20'},
	{from: s(8), text: 'ДЕНЬ 4 · 09:21'},
	{from: s(9), text: 'ДЕНЬ 4 · 09:34'},
	{from: s(13), text: 'ДЕНЬ 4 · 09:36'},
	{from: s(17), text: 'ДЕНЬ 4 · 09:45'},
];

export const EPG4 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 5, // lift ✓, lamp ✓, «не выходи» ✓, «придёт в школу вместо тебя» (→ ✓), the new one «?»
	prefilled: 3,
	pending: [
		{n: 4, at: 0},
		{n: 5, at: s(15) + 150},
	],
	counterFrom: 10,
	hideFrom: s(19) + 248,
	night: [[s(2), s(7)]] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
