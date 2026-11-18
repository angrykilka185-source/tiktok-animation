// «Ты с какого района?» — серия 1 «Игоречек» (1976), версия 3.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6.8, 2.6, 3.0, 5.6, 5.0, 4.9, 4.0, 5.4, 4.6, 4.5, 6.9, 3.3, 4.0, 4.8, 4.6, 5.7, 4.1, 3.5, 11.2];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// three humiliations — plaques that fly into the «ТЕРПЕНИЕ» counter (red crosses); the fourth box is «?»
export const SIGNS: Sign[] = [
	{n: 1, title: 'ШАПКА\nВ ЛУЖЕ', at: s(6) + 96, hold: 40, y: 430},
	{n: 2, title: 'МИНУС\n20 КОПЕЕК', at: s(8) + 30, hold: 34, y: 430},
	{n: 3, title: 'СИНЯК', at: s(9) + 22, hold: 36, y: 430},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: '2 ОКТ 1976 · 07:30'},
	{from: s(4), text: '2 ОКТ 1976 · 07:55'},
	{from: s(6), text: '2 ОКТ 1976 · 10:40'},
	{from: s(7), text: '2 ОКТ 1976 · 13:50'},
	{from: s(9), text: '2 ОКТ 1976 · 18:10'},
	{from: s(10), text: '2 ОКТ 1976 · 18:40'},
	{from: s(13), text: '2 ОКТ 1976 · 19:30'},
	{from: s(17), text: '2 ОКТ 1976 · 23:50'},
	{from: s(18), text: '3 ОКТ 1976 · 07:50'},
];

export const EPR1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 4, // three humiliations + «?» (what you choose)
	prefilled: 0,
	pending: [{n: 4, at: s(18) + 50}],
	counterFrom: 10,
	hideFrom: s(19) + 248,
	night: [[s(10), s(18)]] as [number, number][],
	counterTitle: 'ТЕРПЕНИЕ',
	mark: 'cross' as const,
	accent: '#e8392f',
	plaqueLabel: 'ОБИДА',
};
