// «Голосовые из завтра» — серия 1 «Не садись в лифт» (authoring timeline; the edit follows the voice).
import {FPS, makeShots, Sign} from '../timeline';

export const SHOT_SECONDS = [4.3, 3.5, 4.6, 6, 4.6, 4.5, 3.1, 3.6, 3.2, 3.5, 4.6, 4.1, 3.3, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};

const s = shotStart;

export const SIGNS: Sign[] = [{n: 1, title: 'ЛИФТ\nЗАСТРЯЛ', at: s(8) + 54, hold: 34}];

export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 23:41'},
	{from: s(6), text: 'ДЕНЬ 2 · 08:14'},
	{from: s(8), text: 'ДЕНЬ 2 · 08:15'},
	{from: s(10), text: 'ДЕНЬ 2 · 08:21'},
	{from: s(11), text: 'ДЕНЬ 2 · 23:41'},
];

export const EPG1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 2, // the lift (came true) and the ball (still a question)
	pending: [{n: 2, at: s(12) + 58}],
	counterFrom: 10,
	hideFrom: s(14) + 248,
	night: [[0, s(6)], [s(11), s(14) + 300]] as [number, number][],
	counterTitle: 'СБЫЛОСЬ',
	mark: 'check' as const,
	accent: '#ffd34a',
	plaqueLabel: 'СБЫЛОСЬ',
};
