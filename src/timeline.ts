// Single source of truth for timing. 30 fps, 90 s, 16 shots.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

// durations in seconds, as in the script
export const SHOT_SECONDS = [6, 4, 5, 6, 5, 6, 6, 4, 5, 6, 6, 4, 6, 5, 6, 10];

export const SHOTS = (() => {
	let from = 0;
	return SHOT_SECONDS.map((s, i) => {
		const r = {index: i + 1, from, duration: s * FPS};
		from += s * FPS;
		return r;
	});
})();

export const TOTAL = SHOTS[SHOTS.length - 1].from + SHOTS[SHOTS.length - 1].duration; // 2700

export const shotStart = (n: number) => SHOTS[n - 1].from;

// ---- signs ("признаки") ----
export type Sign = {n: number; title: string; at: number; hold: number};
export const SIGNS: Sign[] = [
	{n: 1, title: 'НЕ НАЗВАЛ\nТИГРЁНКОМ', at: shotStart(3) + 112, hold: 50},
	{n: 2, title: 'ОТКАЗАЛСЯ\nОТ БОРЩА', at: shotStart(4) + 150, hold: 40},
	{n: 3, title: 'ЛЕВША\nСТАЛ ПРАВШОЙ', at: shotStart(5) + 100, hold: 36},
	{n: 4, title: 'НЕ ЗНАЕТ\nПРО РЕМОНТ', at: shotStart(7) + 150, hold: 40},
	{n: 5, title: 'НЕТ ШРАМА\nНА РУКЕ', at: shotStart(8) + 70, hold: 36},
	{n: 6, title: 'НАСТОЯЩИЙ ПАПА\nЕЩЁ НА ВАХТЕ', at: shotStart(13) + 118, hold: 46},
];
export const SIGN_FLY = 14; // frames for the plaque to fly into the counter

// ---- HUD clock ----
export const CLOCK: {from: number; text: string}[] = [
	{from: 0, text: 'ДЕНЬ 1 · 14:20'},
	{from: shotStart(3), text: 'ДЕНЬ 1 · 14:21'},
	{from: shotStart(4), text: 'ДЕНЬ 1 · 15:05'},
	{from: shotStart(7), text: 'ДЕНЬ 1 · 18:30'},
	{from: shotStart(10), text: 'ДЕНЬ 1 · 23:40'},
	{from: shotStart(11), text: 'ДЕНЬ 2 · 03:17'},
	{from: shotStart(12), text: 'ДЕНЬ 2 · 07:10'},
	{from: shotStart(15), text: 'ДЕНЬ 2 · 07:12'},
];

