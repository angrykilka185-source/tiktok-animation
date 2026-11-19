// «Ты с какого района?» — серия 2 «Прописка» (Казань, 1976). Кадры 2–3 — реальная история Тяп-ляп. Зрители выбрали «пришиться»: удар старшего — надо устоять.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part r2).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.167, 5.767, 3.933, 2.6, 3.867, 3.567, 5.2, 5.6, 6.2, 3.6, 2.933, 1.633, 3.7, 4.067, 4.333, 3.333, 2.367, 3.933, 4.167, 4.233, 5.867, 5.233, 4.2, 4.233, 10.567];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// the rules — plaques that fly into the «ПОНЯТИЯ» counter; the third is still «?»
export const SIGNS: Sign[] = [
	{n: 1, title: 'УПАЛ —\nВСТАВАЙ', at: s(17) + 20, hold: 40, y: 430},
	{n: 2, title: 'СВОИХ\nНЕ БРОСАТЬ', at: s(21) + 143, hold: 34, y: 430},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: '3 ОКТ 1976 · 19:06'},
	{from: s(2), text: 'КАЗАНЬ · 1976'},
	{from: s(4), text: '3 ОКТ 1976 · 19:00'},
	{from: s(7), text: '3 ОКТ 1976 · 19:02'},
	{from: s(13), text: '3 ОКТ 1976 · 19:06'},
	{from: s(22), text: '3 ОКТ 1976 · 21:30'},
	{from: s(23), text: '4 ОКТ 1976 · 07:50'},
];

export const EPR2 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // two rules learned, the third — «?»
	prefilled: 0,
	pending: [{n: 3, at: s(24) + 60}],
	counterFrom: 10,
	hideFrom: s(25) + 248,
	night: [[0, s(23)]] as [number, number][],
	counterTitle: 'ПОНЯТИЯ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'ПОНЯТИЕ',
};
