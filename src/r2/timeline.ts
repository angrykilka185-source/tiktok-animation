// «Ты с какого района?» — серия 2 «Прописка» (1976). Зрители выбрали «пришиться»: удар старшего — надо устоять.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r2).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.167, 2.633, 3.833, 3.567, 5.2, 5.333, 6.2, 3.6, 2.967, 1.6, 4.133, 2.4, 3.5, 3.1, 4.233, 5.0, 5.233, 4.2, 4.133, 10.567];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// the rules — plaques that fly into the «ПОНЯТИЯ» counter; the third is still «?»
export const SIGNS: Sign[] = [
	{n: 1, title: 'УДАР ДЕРЖАТ\nСТОЯ', at: s(12) + 20, hold: 40, y: 430},
	{n: 2, title: 'СВОИХ\nНЕ СДАЮТ', at: s(16) + 86, hold: 40, y: 430},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: '3 ОКТ 1976 · 19:06'},
	{from: s(2), text: '3 ОКТ 1976 · 19:00'},
	{from: s(5), text: '3 ОКТ 1976 · 19:02'},
	{from: s(11), text: '3 ОКТ 1976 · 19:06'},
	{from: s(17), text: '3 ОКТ 1976 · 21:30'},
	{from: s(18), text: '4 ОКТ 1976 · 07:50'},
];

export const EPR2 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // two rules learned, the third — «?»
	prefilled: 0,
	pending: [{n: 3, at: s(19) + 60}],
	counterFrom: 10,
	hideFrom: s(20) + 248,
	night: [[0, s(18)]] as [number, number][],
	counterTitle: 'ПОНЯТИЯ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'ПОНЯТИЕ',
};
