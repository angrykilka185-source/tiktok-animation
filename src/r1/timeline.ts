// «Ты с какого района?» — серия 1 «Игоречек» (1976), версия 3: в конце Игорь сам решает пришиться.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.6, 2.833, 4.3, 2.067, 3.067, 5.567, 4.7, 4.3, 4.1, 6.0, 5.433, 4.033, 5.5, 3.033, 3.733, 4.367, 4.767, 5.333, 4.133, 2.8, 3.0, 3.4, 5.6, 7.2, 6.0];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// three humiliations — plaques that fly into the «ТЕРПЕНИЕ» counter (red crosses); then «ТЕРПЕНИЕ ЛОПНУЛО» (shot 21)
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
	{from: s(19), text: '2 ОКТ 1976 · 23:50'},
	{from: s(20), text: '3 ОКТ 1976 · 07:50'},
	{from: s(22), text: '3 ОКТ 1976 · 19:00'},
];

export const EPR1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // three humiliations
	prefilled: 0,
	counterFrom: 10,
	hideFrom: s(25) + 92,
	night: [
		[0, s(2)],
		[s(12), s(20)],
		[s(22), s(25) + 200],
	] as [number, number][],
	counterTitle: 'ТЕРПЕНИЕ',
	mark: 'cross' as const,
	accent: '#e8392f',
	plaqueLabel: 'ОБИДА',
};
