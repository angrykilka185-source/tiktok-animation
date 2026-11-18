// «Ты с какого района?» — серия 1 «Двадцать копеек» (1976).
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [5.933, 3.8, 5.733, 5.033, 3.933, 4.8, 4.067, 3.9, 3.6, 3.867, 4.6, 4.267, 11.133];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// the rules of the yard — plaques that fly into the «ПОНЯТИЯ» counter
export const SIGNS: Sign[] = [
	{n: 1, title: 'СВОИХ\nНЕ СДАЮТ', at: s(7) + 58, hold: 44, y: 430},
	{n: 2, title: 'СЛОВО ДАЛ —\nДЕРЖИ', at: s(8) + 30, hold: 40, y: 430},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: '27 ОКТ 1976 · 14:30'},
	{from: s(6), text: '27 ОКТ 1976 · 19:40'},
	{from: s(9), text: '27 ОКТ 1976 · 21:15'},
	{from: s(10), text: '3 НОЯ 1976 · 16:05'},
	{from: s(12), text: '3 НОЯ 1976 · 23:50'},
];

export const EPR1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // two rules learned, the third — «?»
	prefilled: 0,
	pending: [{n: 3, at: s(12) + 110}],
	counterFrom: 10,
	hideFrom: s(13) + 248,
	night: [[s(6), s(13) + 340]] as [number, number][],
	counterTitle: 'ПОНЯТИЯ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'ПОНЯТИЕ',
};
