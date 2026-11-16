// «Фильм про тебя» — часть 1 (продолжение «Папа вернулся с вахты»).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part f1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [5, 3.9, 3, 3.9, 5.4, 4.1, 6.1, 4.9, 3.9, 5.3, 3.9, 3.7, 3.3, 2, 4.9, 4, 4.9, 6.5, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// what the film showed — and then happened for real
export const SIGNS: Sign[] = [
	{n: 1, title: 'ШЁПОТ\nЗА СПИНОЙ', at: s(14) + 34, hold: 24, y: 1540},
	{n: 2, title: 'ПАПА\nИСЧЕЗ', at: s(16) + 46, hold: 22, y: 1540},
];

// the cartoon runs in real time; after the glitch the film about you races to «now»
const tick = (from: number, to: number, startMin: number, endMin: number, step = 15) =>
	Array.from({length: Math.ceil((to - from) / step)}, (_, k) => {
		const m = Math.round(startMin + ((endMin - startMin) * k * step) / (to - from));
		return {from: from + k * step, text: `ФИЛЬМ · ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`};
	});
const NOW = s(10) + 132;
export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'НЕДЕЛЮ СПУСТЯ'},
	{from: s(1) + 100, text: 'СЕАНС · 19:00'},
	...tick(s(3), s(4) + 24, 31, 37, 30),
	{from: s(4) + 24, text: 'ФИЛЬМ · ??:??'},
	...tick(s(5) + 30, NOW, 0, 86),
	{from: NOW, text: 'ФИЛЬМ · СЕЙЧАС'},
];

export const EPF1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // the whisper ✓, dad gone ✓, what next «?»
	prefilled: 0,
	pending: [{n: 3, at: s(18) + 60}],
	counterFrom: 10,
	hideFrom: s(19) + 248,
	night: [[s(3), s(19) + 300]] as [number, number][],
	counterTitle: 'КАК В ФИЛЬМЕ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
