// Single source of truth for timing. 30 fps, 90 s, 16 shots.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

// durations in seconds, as in the script
export const SHOT_SECONDS = [6, 3.6, 5, 6, 5, 6.4, 6.6, 4, 5, 6, 6, 3.8, 6, 4.6, 6, 10];

export type Shot = {index: number; from: number; duration: number};
export const makeShots = (seconds: number[]) => {
	let from = 0;
	const shots: Shot[] = seconds.map((s, i) => {
		const r = {index: i + 1, from, duration: Math.round(s * FPS)};
		from += Math.round(s * FPS);
		return r;
	});
	const total = shots[shots.length - 1].from + shots[shots.length - 1].duration;
	return {shots, total, shotStart: (n: number) => shots[n - 1].from};
};

const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total; // 2700
export const shotStart = built.shotStart;

// ---- signs ("признаки") ----
export type Sign = {n: number; title: string; at: number; hold: number};
export const SIGNS: Sign[] = [
	{n: 1, title: 'НЕ НАЗВАЛ\nТИГРЁНКОМ', at: shotStart(3) + 112, hold: 50},
	{n: 2, title: 'ОТКАЗАЛСЯ\nОТ БОРЩА', at: shotStart(4) + 150, hold: 40},
	{n: 3, title: 'ЛЕВША\nСТАЛ ПРАВШОЙ', at: shotStart(5) + 100, hold: 36},
	{n: 4, title: 'НЕ ЗНАЕТ\nПРО РЕМОНТ', at: shotStart(7) + 166, hold: 40},
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


// everything the HUD / plaques need for part 1
export const EP1 = {
	clock: CLOCK,
	signs: SIGNS,
	slots: 6,
	counterFrom: shotStart(3) - 4,
	hideFrom: shotStart(16) + 248,
	night: [[shotStart(10), shotStart(12)]] as [number, number][],
};
