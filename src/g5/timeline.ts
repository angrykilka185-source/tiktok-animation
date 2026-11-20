// «Голосовые из завтра» — часть 5 «Побег» (the viewers chose to run).
// Authoring timeline = the voice (scripts/fit-voiceover.py --part g5).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.3, 3.567, 2.833, 2.6, 3.567, 2.733, 3.4, 3.5, 4.033, 3.5, 3.2, 5.667, 3.6, 7.0, 4.667, 3.933, 4.1, 3.3, 4.367, 4.333, 1.733, 15.867];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// «каждый, кто примет его за тебя, делает тебя прозрачнее» — your hand is see-through
export const SIGNS: Sign[] = [{n: 5, title: 'ТЫ СТАНОВИШЬСЯ\nПРОЗРАЧНЕЕ', at: s(13) + 60, hold: 30, y: 1540}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 4 · 09:20'},
	{from: s(3), text: 'ДЕНЬ 4 · 09:45'},
	{from: s(9), text: 'ДЕНЬ 4 · 09:46'},
	{from: s(10), text: 'ДЕНЬ 4 · 09:48'},
	{from: s(16), text: 'ДЕНЬ 4 · 10:07'},
	{from: s(18), text: 'ДЕНЬ 4 · 10:09'},
];

export const EPG5 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 6, // lift ✓, lamp ✓, «не выходи» ✓, «придёт в школу вместо тебя» ✓, «прозрачнее» (→ ✓), «мама не узнает» «?»
	prefilled: 4,
	pending: [
		{n: 5, at: s(12) + 120},
		{n: 6, at: s(15) + 90},
	],
	counterFrom: 10,
	hideFrom: s(22) + 248,
	night: [] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
