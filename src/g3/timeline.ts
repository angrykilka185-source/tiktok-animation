// «Голосовые из завтра» — часть 3 «Глазок» (the viewers chose not to go out).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part g3 retimes it to the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.4, 3.7, 6.1, 3.6, 2.7, 3.8, 3.4, 3.4, 3, 3.4, 3.1, 2.4, 2.8, 4.1, 2.9, 2.5, 1.9, 3, 1.9, 3.2, 7.5, 2.5, 1.7, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// «не выходи из дома»: behind the door waited your double
export const SIGNS: Sign[] = [{n: 3, title: 'ЗА ДВЕРЬЮ\nЖДАЛ ДВОЙНИК', at: s(19) + 26, hold: 30, y: 1540}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 23:41'},
	{from: 44, text: 'ДЕНЬ 2 · 08:15'},
	{from: 102, text: 'ДЕНЬ 3 · 10:40'},
	{from: s(2), text: 'ДЕНЬ 3 · 10:41'},
	{from: s(3), text: 'ДЕНЬ 3 · 10:43'},
	{from: s(3) + 112, text: 'ДЕНЬ 3 · 18:30'},
	{from: s(4), text: 'ДЕНЬ 3 · 19:00'},
	{from: s(9), text: 'ДЕНЬ 3 · 19:01'},
	{from: s(17), text: 'ДЕНЬ 3 · 19:02'},
	{from: s(20), text: 'ДЕНЬ 3 · 23:41'},
	{from: s(22), text: 'ДЕНЬ 3 · 23:42'},
];

export const EPG3 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 4, // lift ✓, lamp ✓, «не выходи» (→ ✓ when you see the double), the new one «?»
	prefilled: 2,
	pending: [
		{n: 3, at: 0},
		{n: 4, at: s(21) + 132},
	],
	counterFrom: 10,
	hideFrom: s(24) + 248,
	night: [[s(3) + 112, s(24) + 300]] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
