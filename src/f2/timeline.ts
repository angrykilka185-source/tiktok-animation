// «Фильм про тебя» — часть 2 (зрители выбрали: искать папу).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part f2 retimes it to the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.867, 2.4, 1.3, 3.967, 1.5, 3.567, 3.267, 3.167, 3.133, 4.367, 3.867, 4.167, 5.6, 1.7, 3.533, 4.067, 11.6];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

// what the film shows — and happens for real
export const SIGNS: Sign[] = [
	{n: 3, title: 'ФИЛЬМ ИДЁТ\nЗА ТОБОЙ', at: s(4) + 82, hold: 24, y: 1540},
	{n: 4, title: 'ПАПА\nВНУТРИ ФИЛЬМА', at: s(11) + 90, hold: 24, y: 1540},
];

// «плёнки — на пару минут»: from the reel on, the clock counts down what is left of the film
const left = (from: number, to: number, sec: number) =>
	Array.from({length: Math.ceil((to - from) / 30)}, (_, k) => {
		const r = sec - k;
		return {from: from + k * 30, text: `ДО КОНЦА · ${String(Math.floor(r / 60)).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`};
	});
export const CLOCK: {from: number; text: string}[] = [{from: 0, text: 'ФИЛЬМ · СЕЙЧАС'}, ...left(s(14), s(17) + 300, 120)];

export const EPF2 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 5, // whisper ✓, dad gone ✓ (part 1), the film follows you ✓, dad inside the film ✓, him behind you «?»
	prefilled: 2,
	pending: [{n: 5, at: s(16) + 112}],
	counterFrom: 10,
	hideFrom: s(17) + 248,
	night: [[0, s(17) + 300]] as [number, number][],
	counterTitle: 'КАК В ФИЛЬМЕ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
