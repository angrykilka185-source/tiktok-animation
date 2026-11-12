// Part 2 «Контрольный вопрос»: 17 shots, 90 s.
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [6, 5.5, 3, 5, 4, 5, 5, 4.5, 5, 5, 5, 5, 6, 6, 5, 5, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// recap of part 1: the six plaques flash by and fly into the counter
const RECAP = ['НЕ НАЗВАЛ\nТИГРЁНКОМ', 'ОТКАЗАЛСЯ\nОТ БОРЩА', 'ЛЕВША\nСТАЛ ПРАВШОЙ', 'НЕ ЗНАЕТ\nПРО РЕМОНТ', 'НЕТ ШРАМА\nНА РУКЕ', 'НАСТОЯЩИЙ ПАПА\nЕЩЁ НА ВАХТЕ'];
export const RECAP_STEP = 22;
export const SIGNS: Sign[] = [
	...RECAP.map((title, k) => ({n: k + 1, title, at: s(2) + 4 + k * RECAP_STEP, hold: 6})),
	{n: 7, title: 'НЕ ЗНАЕТ\nСЕКРЕТНОЕ СЛОВО', at: s(7) + 96, hold: 40},
	{n: 8, title: 'ГОВОРИТ СЛОВАМИ\nИЗ СООБЩЕНИЙ', at: s(11) + 100, hold: 40},
	{n: 9, title: 'СПРЯТАЛ ФОТО\nНАСТОЯЩЕГО ПАПЫ', at: s(13) + 110, hold: 50},
];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: s(2), text: 'ДЕНЬ 2 · 07:12'},
	{from: s(4), text: 'ДЕНЬ 2 · 07:15'},
	{from: s(12), text: 'ДЕНЬ 2 · 14:00'},
	{from: s(14), text: 'ДЕНЬ 2 · 23:50'},
];

export const EP2 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 9,
	counterFrom: s(2),
	hideFrom: s(17) + 248,
	night: [[s(14), s(17)]] as [number, number][],
};
