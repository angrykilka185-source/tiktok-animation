// «Ты с какого района?» — серия 1 «Игоречек» (1976), версия 3: Игорь сам решает пойти к Тяп-ляп; выбор у двери качалки.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.6, 2.9, 4.267, 2.067, 3.2, 5.5, 4.467, 4.333, 4.1, 5.967, 5.333, 4.267, 5.467, 3.1, 3.6, 3.8, 5.6, 4.233, 2.933, 2.567, 2.6, 12.033];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// three humiliations — plaques that fly into the «ТЕРПЕНИЕ» counter (red crosses); the fourth box is «?» (your choice)
export const SIGNS: Sign[] = [
	{n: 1, title: 'ШАПКА\nВ ЛУЖЕ', at: s(8) + 96, hold: 40, y: 430},
	{n: 2, title: 'МИНУС\n20 КОПЕЕК', at: s(10) + 30, hold: 34, y: 430},
	{n: 3, title: 'СИНЯК', at: s(11) + 40, hold: 36, y: 430},
];

// the hook is tomorrow evening; then the clock jumps back a day (the flashback)
export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: '3 ОКТ 1976 · 19:00'},
	{from: s(2), text: '2 ОКТ 1976 · 07:30'},
	{from: s(6), text: '2 ОКТ 1976 · 07:55'},
	{from: s(8), text: '2 ОКТ 1976 · 10:40'},
	{from: s(9), text: '2 ОКТ 1976 · 13:50'},
	{from: s(11), text: '2 ОКТ 1976 · 18:10'},
	{from: s(12), text: '2 ОКТ 1976 · 18:40'},
	{from: s(15), text: '2 ОКТ 1976 · 19:30'},
	{from: s(18), text: '2 ОКТ 1976 · 23:50'},
	{from: s(19), text: '3 ОКТ 1976 · 07:50'},
	{from: s(20), text: '3 ОКТ 1976 · 19:00'},
];

export const EPR1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 4, // three humiliations + «?» (your choice at the door)
	pending: [{n: 4, at: s(21) + 30}],
	prefilled: 0,
	counterFrom: 10,
	hideFrom: s(22) + 248,
	night: [
		[0, s(2)],
		[s(12), s(19)],
		[s(20), s(22) + 400],
	] as [number, number][],
	counterTitle: 'ТЕРПЕНИЕ',
	mark: 'cross' as const,
	accent: '#e8392f',
	plaqueLabel: 'ОБИДА',
};
