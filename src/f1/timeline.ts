// «Фильм про тебя» — часть 1 (продолжение «Папа вернулся с вахты»).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part f1).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [5, 4.3, 3.1, 4.2, 3.4, 3.6, 6.1, 5.8, 5, 4.9, 3.5, 3.3, 3, 1.9, 3.3, 2.2, 3.9, 5.1, 3.5, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// what the film showed — and then happened for real
export const SIGNS: Sign[] = [
	{n: 1, title: 'ШЁПОТ\nЗА СПИНОЙ', at: s(15) + 58, hold: 30, y: 1540},
	{n: 2, title: 'ПАПА\nИСЧЕЗ', at: s(17) + 46, hold: 22, y: 1540},
];

// the film's own clock runs fast (the whole film in a few seconds), until it reaches «now»
const FILM_FROM = s(4) + 20;
const NOW = s(9) + 124;
const filmClock = Array.from({length: Math.ceil((NOW - FILM_FROM) / 15)}, (_, k) => {
	const min = Math.min(86, Math.round((k * 15 * 86) / (NOW - FILM_FROM)));
	return {from: FILM_FROM + k * 15, text: `ФИЛЬМ · ${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`};
});
export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'НЕДЕЛЮ СПУСТЯ'},
	{from: s(1) + 100, text: 'СЕАНС · 19:00'},
	...filmClock,
	{from: NOW, text: 'ФИЛЬМ · СЕЙЧАС'},
];

export const EPF1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 3, // the whisper ✓, dad gone ✓, what next «?»
	prefilled: 0,
	pending: [{n: 3, at: s(19) + 60}],
	counterFrom: 10,
	hideFrom: s(20) + 248,
	night: [[s(3), s(20) + 300]] as [number, number][],
	counterTitle: 'КАК В ФИЛЬМЕ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
