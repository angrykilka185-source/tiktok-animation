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
	{n: 1, title: 'НЕ НАЗВАЛ\nТИГРЁНКОМ', at: shotStart(3) + 80, hold: 66},
	{n: 2, title: 'ОТКАЗАЛСЯ\nОТ БОРЩА', at: shotStart(4) + 112, hold: 62},
	{n: 3, title: 'ЛЕВША\nСТАЛ ПРАВШОЙ', at: shotStart(5) + 92, hold: 52},
	{n: 4, title: 'НЕ ЗНАЕТ\nПРО РЕМОНТ', at: shotStart(7) + 100, hold: 66},
	{n: 5, title: 'НЕТ ШРАМА\nНА РУКЕ', at: shotStart(8) + 50, hold: 56},
	{n: 6, title: 'НАСТОЯЩИЙ ПАПА\nЕЩЁ НА ВАХТЕ', at: shotStart(13) + 96, hold: 70},
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

// ---- captions (no voice-over: on-screen story text, word-by-word) ----
export type Caption = {from: number; to: number; text: string; y?: number};
const s = shotStart;
export const CAPTIONS: Caption[] = [
	{from: s(1) + 50, to: s(1) + 112, text: 'ПАПА ТРИ МЕСЯЦА|БЫЛ НА ВАХТЕ'},
	{from: s(1) + 112, to: s(1) + 178, text: 'И ВЕРНУЛСЯ|НА ДВА ДНЯ РАНЬШЕ'},
	{from: s(2) + 34, to: s(2) + 118, text: 'МАМА ПЛАЧЕТ|ОТ СЧАСТЬЯ'},
	{from: s(3) + 90, to: s(3) + 148, text: 'НО ОН ВСЕГДА|ЗВАЛ МЕНЯ ТИГРЁНКОМ'},
	{from: s(4) + 10, to: s(4) + 86, text: 'ПАПА ОБОЖАЕТ|МАМИН БОРЩ'},
	{from: s(4) + 92, to: s(4) + 176, text: 'А ТЕПЕРЬ ПЬЁТ|ТОЛЬКО ВОДУ'},
	{from: s(5) + 66, to: s(5) + 148, text: 'НА ФОТО ОН|ЕСТ ЛЕВОЙ РУКОЙ'},
	{from: s(6) + 40, to: s(6) + 176, text: 'ЧТО-ТО С НИМ|НЕ ТАК'},
	{from: s(7) + 72, to: s(7) + 176, text: 'ВАННУЮ ПЕРЕНЕСЛИ|ПОКА ЕГО НЕ БЫЛО'},
	{from: s(8) + 2, to: s(8) + 48, text: 'А ГДЕ ШРАМ|ОТ ПИЛЫ?'},
	{from: s(9) + 92, to: s(9) + 148, text: 'НО Я|НЕ ВЕРЮ'},
	{from: s(10) + 30, to: s(10) + 176, text: 'НОЧЬЮ ОН ПРОСТО|СТОЯЛ В ДВЕРЯХ'},
	{from: s(11) + 20, to: s(11) + 96, text: 'ПОТОМ СИДЕЛ|В ТЕМНОТЕ'},
	{from: s(11) + 96, to: s(11) + 176, text: 'И НИ РАЗУ|НЕ МОРГНУЛ'},
	{from: s(12) + 30, to: s(12) + 118, text: 'А УТРОМ|ПРИШЛО СООБЩЕНИЕ'},
	{from: s(14) + 22, to: s(14) + 148, text: 'ТОГДА КТО|СИДИТ У НАС НА КУХНЕ?'},
];
