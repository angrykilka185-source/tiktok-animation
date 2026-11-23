// «Каково это — умереть от жажды» — the sound: the author's voice, quiet beds (the desert wind, the sandstorm, the
// crickets at night, a low tension drone) and the effects, timed on the words of the voice so they follow it.
// All sounds are procedural (scripts/make-sfx.mjs): no music tracks, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {CHOBI_VISITS, IRIS} from './chobiKit';
import {shotStart as s, SHOTS} from './timeline';
import {HAS_VOICE, VOICE, w} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
type Bed = {from: number; to: number; file: string; vol: number; fade?: number};
const end = (n: number) => s(n) + SHOTS[n - 1].duration;
const at = (n: number, word: string | number, add = 0) => s(n) + w(n, word, add);
// a few of the same cue, `every` frames apart
const rep = (from: number, count: number, every: number, file: string, vol: number, len?: number): Cue[] =>
	Array.from({length: count}).map((_, k) => ({at: from + k * every, file, vol, len}));
// a heart that labours: beats at these offsets (frames) from `from`
const beats = (from: number, offs: number[], vol: number, ecg = false): Cue[] =>
	offs.flatMap((o) => [{at: from + o, file: 'heart_one', vol}, ...(ecg ? [{at: from + o + 2, file: 'ecg', vol: vol * 0.45}] : [])]);

// Чоби's page opens with a circle and a soft whoosh (he springs up with a pop) and closes the same way
const VISITS: Cue[] = CHOBI_VISITS.flatMap((v) => {
	const first = v[0];
	const last = v[v.length - 1];
	const close = last === SHOTS.length ? end(last) - IRIS - 4 : end(last);
	return [
		{at: s(first), file: 'whoosh', vol: 0.3},
		{at: s(first) + 4, file: 'pop', vol: 0.25},
		{at: close, file: 'whoosh', vol: 0.22},
	];
});

const CUES: Cue[] = [
	...VISITS,
	// the hook: the heat, the empty flask, alone
	{at: s(1), file: 'swell', vol: 0.3},
	{at: at(1, 'песок', -2), file: 'sizzle', vol: 0.35},
	{at: at(1, 'шестьдесят', -2), file: 'pop', vol: 0.35},
	{at: at(1, 'воздух', -2), file: 'pop', vol: 0.35},
	{at: at(1, 'нет', -2), file: 'decline', vol: 0.3},
	{at: at(2, 'капли', -4), file: 'drip', vol: 0.55},
	{at: at(2, 'вокруг', -4), file: 'whoosh', vol: 0.3},
	{at: at(3, 'сахара', -4), file: 'swell', vol: 0.3},
	{at: at(3, 'один', -2), file: 'heart_one', vol: 0.55},
	{at: at(4, 'каково', -4), file: 'pop', vol: 0.35},
	{at: at(4, 'час', -4), file: 'pop', vol: 0.3},
	{at: at(4, 'глоток', -2), file: 'gulp', vol: 0.3},
	{at: at(5, 'главное', -6), file: 'pop', vol: 0.35},
	{at: at(5, 'допустить', -6), file: 'stamp', vol: 0.4},
	{at: at(5, 'поехали', -2), file: 'whoosh', vol: 0.55},
	// the race
	{at: s(6), file: 'crowd', vol: 0.16, len: 150},
	{at: s(6) + 10, file: 'steps', vol: 0.25},
	{at: at(6, 'двухсот', -4), file: 'pop', vol: 0.35},
	{at: at(6, 'неделю', -4), file: 'pop', vol: 0.35},
	{at: at(7, 'еду', -2), file: 'cloth', vol: 0.35},
	{at: at(7, 'спальник', -2), file: 'cloth', vol: 0.3},
	{at: at(7, 'воду', -6), file: 'pour', vol: 0.35},
	// the sandstorm
	{at: at(8, 'небо', -6), file: 'swell', vol: 0.35},
	{at: at(8, 'поднимается', -6), file: 'gust', vol: 0.45},
	{at: at(9, 'ног', -6), file: 'gust', vol: 0.3},
	{at: at(9, 'лечь', -6), file: 'cloth', vol: 0.4},
	{at: at(10, 'поднимаешься', -6), file: 'cloth', vol: 0.3},
	{at: at(10, 'флажков', -2), file: 'pop', vol: 0.3},
	{at: at(10, 'следов', -2), file: 'pop', vol: 0.3},
	{at: at(10, 'людей', -2), file: 'pop', vol: 0.3},
	{at: at(11, 'потерялся', -4), file: 'heart_one', vol: 0.6},
	{at: at(11, 'потерялся', 22), file: 'heart_one', vol: 0.45},
	{at: at(11, 'глотков', -4), file: 'drip', vol: 0.45},
	// the body is water
	{at: at(12, 'шестьдесят', -8), file: 'bubbles', vol: 0.3},
	{at: at(12, 'сорока', -8), file: 'pop', vol: 0.35},
	{at: at(13, 'кровь', -6), file: 'pop', vol: 0.35},
	{at: at(13, 'мозг', -6), file: 'pop', vol: 0.35},
	{at: at(14, 'потом', -6), file: 'drip', vol: 0.45},
	{at: at(14, 'кожу', -6), file: 'sizzle', vol: 0.25},
	{at: at(14, 'выдохом', -8), file: 'breath', vol: 0.3, len: 60},
	// the first hours: thirst
	{at: s(15), file: 'tick', vol: 0.22, len: 40},
	{at: at(15, 'литр', -4), file: 'pop', vol: 0.35},
	{at: at(15, 'жажда', -4), file: 'gulp', vol: 0.35},
	{at: at(16, 'опаздывает', -8), file: 'tick', vol: 0.25, len: 40},
	{at: at(16, 'высыхать', -4), file: 'decline', vol: 0.3},
	{at: at(17, 'мозг', -6), file: 'pop', vol: 0.3},
	{at: at(17, 'солонее', -10), file: 'salt', vol: 0.45},
	{at: at(18, 'включает', -6), file: 'switch', vol: 0.4},
	{at: at(18, 'почкам', -8), file: 'message', vol: 0.3},
	{at: at(18, 'беречь', -6), file: 'stamp', vol: 0.4},
	{at: at(19, 'моча', -8), file: 'pop', vol: 0.3},
	{at: at(19, 'концентрированная', -6), file: 'drip', vol: 0.4},
	// sweat, the air conditioner
	{at: s(20), file: 'swell', vol: 0.25},
	{at: at(20, 'пот', -4), file: 'drip', vol: 0.45},
	{at: at(20, 'кондиционер', -6), file: 'switch', vol: 0.4},
	{at: at(20, 'кондиционер', -2), file: 'fridge', vol: 0.18, len: 50},
	{at: at(21, 'испаряется', -4), file: 'sizzle', vol: 0.3},
	{at: at(21, 'литр', -6), file: 'pop', vol: 0.3},
	{at: at(21, 'шесть', -6), file: 'kettle', vol: 0.22},
	{at: s(22), file: 'tick', vol: 0.2, len: 45},
	{at: at(22, 'идёшь', -6), file: 'steps', vol: 0.3},
	{at: at(23, 'ловушка', -4), file: 'lock', vol: 0.45},
	{at: at(23, 'ловушка', -2), file: 'stamp', vol: 0.3},
	{at: at(23, 'нет', -6), file: 'decline', vol: 0.35},
	// the rule of three
	{at: at(24, 'минуты', -6), file: 'pop', vol: 0.35},
	{at: at(24, 'дня', -6), file: 'pop', vol: 0.35},
	{at: at(24, 'недели', -6), file: 'pop', vol: 0.35},
	{at: at(24, 'пустыне', -8), file: 'swell', vol: 0.3},
	{at: at(24, 'день', -6), file: 'stamp', vol: 0.5},
	// the evening of the first day
	{at: s(25), file: 'swell', vol: 0.25},
	{at: at(25, 'четыре', -4), file: 'heart_one', vol: 0.45},
	{at: at(26, 'сухо', -4), file: 'gulp', vol: 0.3},
	{at: at(26, 'слюна', -4), file: 'pop', vol: 0.3},
	{at: at(26, 'язык', -4), file: 'pop', vol: 0.3},
	...beats(at(26, 'болит', -4), [0, 18, 36], 0.4),
	{at: at(27, 'густеет', -4), file: 'slowdown', vol: 0.35},
	{at: at(27, 'сердцу', -6), file: 'heart', vol: 0.35, len: 150},
	{at: at(28, 'темнеет', -4), file: 'slowdown', vol: 0.45},
	{at: at(28, 'падает', -4), file: 'decline', vol: 0.35},
	{at: at(29, 'думать', -4), file: 'glitch', vol: 0.25},
	{at: at(29, 'считать', -4), file: 'abacus', vol: 0.3},
	{at: at(29, 'злишься', -6), file: 'bump', vol: 0.4},
	// the night
	{at: at(30, 'садится', -4), file: 'swell', vol: 0.3},
	{at: at(30, 'холодно', -8), file: 'gust', vol: 0.35},
	{at: at(31, 'отдаёт', -6), file: 'whoosh', vol: 0.3},
	{at: at(32, 'шанс', -4), file: 'swell', vol: 0.3},
	{at: at(32, 'идти', -6), file: 'steps_slow', vol: 0.3},
	{at: at(32, 'днём', -6), file: 'pop', vol: 0.3},
	{at: at(32, 'меньше', -8), file: 'pop', vol: 0.3},
	{at: at(33, 'звёздам', -4), file: 'shimmer', vol: 0.2},
	{at: s(33) + 6, file: 'steps_slow', vol: 0.25},
	{at: at(33, 'куда', -6), file: 'pop', vol: 0.3},
	// the second day
	{at: s(34), file: 'swell', vol: 0.3},
	{at: s(34) + 8, file: 'sizzle', vol: 0.3},
	{at: at(34, 'семь', -4), file: 'heart_one', vol: 0.5},
	{at: at(35, 'пота', -4), file: 'drip', vol: 0.4},
	{at: at(35, 'ломается', -8), file: 'sparks', vol: 0.45},
	{at: at(35, 'ломается', -2), file: 'decline', vol: 0.3},
	{at: at(36, 'восемь', -6), file: 'pop', vol: 0.35},
	{at: at(36, 'девять', -6), file: 'pop', vol: 0.4},
	{at: at(37, 'тошнит', -4), file: 'warp', vol: 0.25},
	{at: at(37, 'кружится', -4), file: 'slowdown', vol: 0.3},
	{at: at(37, 'судорогой', -6), file: 'crunch', vol: 0.3},
	{at: at(38, 'ущипни', -6), file: 'cloth', vol: 0.35},
	{at: at(38, 'складка', -4), file: 'slowdown', vol: 0.3},
	{at: at(38, 'глаза', -6), file: 'swell', vol: 0.25},
	// the mirage
	{at: at(39, 'озеро', -6), file: 'shimmer', vol: 0.35},
	{at: at(39, 'бежишь', -6), file: 'steps', vol: 0.3},
	{at: at(39, 'отодвигается', -6), file: 'whoosh', vol: 0.25},
	{at: at(40, 'мираж', -6), file: 'stamp', vol: 0.4},
	{at: at(40, 'галлюцинация', -6), file: 'pop', vol: 0.35},
	{at: at(40, 'сфотографировать', -2), file: 'shutter', vol: 0.5},
	{at: at(41, 'раскалённым', -4), file: 'sizzle', vol: 0.3},
	{at: at(41, 'изгибает', -6), file: 'whoosh', vol: 0.3},
	{at: at(41, 'кусочек', -6), file: 'shimmer', vol: 0.3},
	{at: at(42, 'галлюцинации', -8), file: 'warp', vol: 0.35},
	{at: at(42, 'видит', -4), file: 'whisper', vol: 0.18, len: 70},
	// the third day: heatstroke
	{at: s(43), file: 'swell', vol: 0.35},
	{at: at(43, 'десять', -4), file: 'heart_one', vol: 0.6},
	{at: at(44, 'кожа', -4), file: 'sizzle', vol: 0.35},
	{at: at(44, 'сорок', -6), file: 'pop', vol: 0.4},
	{at: at(44, 'тепловой', -6), file: 'stamp', vol: 0.45},
	{at: at(44, 'тепловой', -4), file: 'heart_big', vol: 0.35},
	{at: at(45, 'путается', -4), file: 'glitch', vol: 0.3},
	{at: at(45, 'куда', -6), file: 'tick', vol: 0.22, len: 40},
	{at: at(45, 'губы', -4), file: 'crunch', vol: 0.25},
	{at: at(46, 'почки', -4), file: 'decline', vol: 0.35},
	...beats(at(46, 'сердце', -6), [0, 20, 62, 80, 136], 0.45, true),
	{at: at(47, 'пятнадцать', -6), file: 'pop', vol: 0.4},
	{at: at(47, 'жить', -4), file: 'slowdown', vol: 0.4},
	{at: at(48, 'по-другому', -10), file: 'swell', vol: 0.4},
	{at: at(48, 'по-другому', -2), file: 'whoosh', vol: 0.35},
	// Mauro Prosperi
	{at: at(49, 'выдумка', -6), file: 'stamp', vol: 0.5},
	{at: at(49, 'тысяча', -6), file: 'pop', vol: 0.35},
	{at: at(49, 'мауро', -8), file: 'shutter', vol: 0.35},
	{at: s(50), file: 'gust', vol: 0.4},
	{at: at(51, 'пил', -4), file: 'gulp', vol: 0.3},
	{at: at(51, 'святилище', -8), file: 'whoosh', vol: 0.3},
	{at: at(51, 'прятался', -4), file: 'steps_slow', vol: 0.25},
	{at: at(52, 'летучих', -6), file: 'bats', vol: 0.45},
	{at: at(52, 'ящериц', -6), file: 'crunch', vol: 0.3},
	{at: at(52, 'днём', -6), file: 'whoosh', vol: 0.4},
	{at: at(52, 'днём', 4), file: 'pop', vol: 0.3},
	{at: at(52, 'днём', 10), file: 'pop', vol: 0.3},
	{at: s(53) + 2, file: 'stamp', vol: 0.4},
	{at: at(53, 'кочевники', -4), file: 'steps', vol: 0.3},
	{at: at(53, 'алжире', -8), file: 'pop', vol: 0.4},
	{at: at(54, 'пятнадцать', -6), file: 'tick', vol: 0.25, len: 26},
	...rep(at(54, 'восстанавливался', 0), 3, 26, 'ecg', 0.25),
	{at: at(55, 'снова', -6), file: 'cheer', vol: 0.3},
	{at: at(55, 'старт', -4), file: 'pop', vol: 0.35},
	// myths: urine, the cactus
	{at: at(56, 'фильмах', -6), file: 'snap', vol: 0.4},
	{at: at(56, 'помогает', -6), file: 'stamp', vol: 0.45},
	{at: at(57, 'соль', -6), file: 'salt', vol: 0.45},
	{at: at(57, 'отходы', -6), file: 'pop', vol: 0.3},
	{at: at(57, 'концентрированнее', -12), file: 'pop', vol: 0.3},
	{at: at(58, 'морскую', -6), file: 'pour', vol: 0.3},
	{at: at(58, 'жажда', -6), file: 'decline', vol: 0.3},
	{at: at(59, 'мультиках', -4), file: 'toon', vol: 0.25, len: 40},
	{at: at(59, 'разрезают', -6), file: 'crunch', vol: 0.35},
	{at: at(59, 'пьют', -8), file: 'gulp', vol: 0.3},
	{at: at(59, 'горькая', -6), file: 'decline', vol: 0.3},
	{at: at(59, 'рвоту', -6), file: 'warp', vol: 0.25},
	{at: at(59, 'теряешь', -6), file: 'drip', vol: 0.35},
	// water that kills
	{at: at(60, 'поворот', -4), file: 'whoosh', vol: 0.4},
	{at: s(60) + 2, file: 'pour', vol: 0.3},
	{at: at(60, 'убить', -8), file: 'swell', vol: 0.4},
	{at: at(60, 'убить', -2), file: 'boom', vol: 0.35},
	{at: at(61, 'радиостанция', -6), file: 'radio', vol: 0.3, len: 70},
	{at: at(61, 'выпьет', -6), file: 'pop', vol: 0.3},
	{at: at(61, 'туалет', -6), file: 'pop', vol: 0.3},
	{at: at(61, 'приставку', -8), file: 'applause', vol: 0.22, len: 60},
	...rep(at(62, 'шести', -8), 6, 5, 'pop', 0.28),
	{at: at(62, 'три', -6), file: 'tick', vol: 0.22, len: 40},
	{at: at(62, 'стало', -10), file: 'heart_one', vol: 0.4},
	{at: at(62, 'стало', -6), file: 'slowdown', vol: 0.4},
	{at: at(63, 'литр', -6), file: 'pop', vol: 0.3},
	{at: at(63, 'быстрее', -6), file: 'pour', vol: 0.3},
	{at: at(63, 'соли', -8), file: 'decline', vol: 0.3},
	{at: at(64, 'внутрь', -4), file: 'bubbles', vol: 0.3},
	{at: at(64, 'набухают', -8), file: 'swell', vol: 0.35},
	{at: at(64, 'мозге', -6), file: 'heart_one', vol: 0.45},
	{at: at(65, 'литрами', -6), file: 'decline', vol: 0.3},
	...rep(at(65, 'понемногу', -8), 3, 14, 'gulp', 0.25),
	// the city in the heat
	{at: at(66, 'городе', -8), file: 'whoosh', vol: 0.3},
	{at: at(66, 'футболе', -8), file: 'whistle', vol: 0.3},
	{at: at(66, 'футболе', -2), file: 'ball', vol: 0.3},
	{at: at(66, 'прогулке', -8), file: 'steps', vol: 0.3},
	{at: at(67, 'пей', -2), file: 'gulp', vol: 0.3},
	{at: at(67, 'опаздывает', -8), file: 'tick', vol: 0.25, len: 40},
	{at: at(68, 'светлая', -6), file: 'pop', vol: 0.3},
	{at: at(68, 'тёмная', -6), file: 'pop', vol: 0.35},
	{at: at(69, 'кепка', -6), file: 'pop', vol: 0.3},
	{at: at(69, 'светлая', -6), file: 'pop', vol: 0.3},
	{at: at(69, 'тень', -6), file: 'pop', vol: 0.3},
	{at: at(70, 'минералку', -6), file: 'soda', vol: 0.3},
	{at: at(70, 'щепоткой', -6), file: 'salt', vol: 0.45},
	{at: at(70, 'уходит', -6), file: 'drip', vol: 0.35},
	{at: at(71, 'никогда', -4), file: 'stamp', vol: 0.45},
	{at: at(71, 'животных', -2), file: 'bark', vol: 0.3},
	{at: at(71, 'закрытой', -4), file: 'lock', vol: 0.4},
	{at: at(71, 'духовку', -10), file: 'sizzle', vol: 0.35},
	// the rules
	{at: at(72, 'застрял', -6), file: 'swell', vol: 0.3},
	{at: at(72, 'запомни', -6), file: 'stamp', vol: 0.45},
	{at: s(73) + 4, file: 'sparks', vol: 0.3},
	{at: at(73, 'заметить', -6), file: 'pop', vol: 0.3},
	{at: at(73, 'тени', -6), file: 'whoosh', vol: 0.25},
	{at: at(74, 'днём', -4), file: 'pop', vol: 0.3},
	{at: at(74, 'идти', -6), file: 'steps_slow', vol: 0.3},
	{at: at(75, 'раздевайся', -4), file: 'cloth', vol: 0.4},
	{at: at(75, 'одежда', -6), file: 'cloth', vol: 0.3},
	{at: at(76, 'носом', -8), file: 'breath', vol: 0.3, len: 70},
	...rep(at(77, 'пей', -6), 2, 12, 'gulp', 0.3),
	{at: at(77, 'экономь', -6), file: 'stamp', vol: 0.4},
	{at: at(77, 'фляге', -8), file: 'drip', vol: 0.4},
	{at: at(78, 'зеркальцем', -6), file: 'glint', vol: 0.45},
	{at: at(78, 'огнём', -6), file: 'fire', vol: 0.4},
	// first aid
	{at: at(79, 'тень', -6), file: 'pop', vol: 0.3},
	{at: at(79, 'расстегни', -6), file: 'cloth', vol: 0.35},
	{at: at(80, 'шею', -6), file: 'drip', vol: 0.35},
	{at: at(80, 'подмышки', -6), file: 'pop', vol: 0.3},
	{at: at(80, 'пах', -6), file: 'pop', vol: 0.3},
	...rep(at(80, 'обмахивай', -6), 3, 10, 'whoosh', 0.18),
	...rep(at(81, 'маленькими', -6), 2, 14, 'gulp', 0.25),
	{at: at(81, 'подсоленную', -6), file: 'salt', vol: 0.4},
	{at: at(82, 'тепловой', -6), file: 'stamp', vol: 0.45},
	{at: at(82, 'звони', -6), file: 'dtmf112', vol: 0.45},
	{at: at(82, 'звони', 30), file: 'siren', vol: 0.15, len: 100},
	{at: at(83, 'вливай', -4), file: 'decline', vol: 0.35},
	{at: at(83, 'без', -4), file: 'stamp', vol: 0.4},
	// the end
	{at: at(84, 'сигнал', -6), file: 'message', vol: 0.4},
	{at: at(84, 'опозданием', -10), file: 'tick', vol: 0.22, len: 40},
	{at: at(85, 'ждёт', -4), file: 'swell', vol: 0.25},
	{at: at(85, 'кончится', -4), file: 'drip', vol: 0.45},
	{at: at(86, 'голова', -6), file: 'pop', vol: 0.35},
	{at: at(86, 'днём', -6), file: 'pop', vol: 0.3},
	{at: at(86, 'ночью', -6), file: 'pop', vol: 0.3},
	{at: at(86, 'внутри', -8), file: 'pop', vol: 0.3},
	{at: at(87, 'сколько', -6), file: 'pop', vol: 0.35},
	{at: at(87, 'пиши', -6), file: 'message', vol: 0.45},
	{at: at(88, 'подпишись', -6), file: 'switch', vol: 0.35},
	{at: at(88, 'тгк', -8), file: 'message', vol: 0.45},
];

const BEDS: Bed[] = [
	// the desert at noon
	{from: s(1), to: s(4) + IRIS, file: 'desert_wind', vol: 0.13, fade: 20},
	// the race, the storm and after it
	{from: s(6), to: s(12) + IRIS, file: 'desert_wind', vol: 0.08, fade: 20},
	{from: at(8, 'поднимается', -10), to: at(10, 'стихает', 12), file: 'sandstorm', vol: 0.16, fade: 30},
	// the first day
	{from: s(15), to: s(16) + IRIS, file: 'desert_wind', vol: 0.08},
	{from: s(20), to: at(30, 'ночью', 0), file: 'desert_wind', vol: 0.09, fade: 30},
	// the night
	{from: at(30, 'ночью', -10), to: s(34), file: 'crickets', vol: 0.12, fade: 30},
	{from: at(30, 'холодно', -8), to: s(34), file: 'desert_wind', vol: 0.05, fade: 30},
	// the second and third days
	{from: s(34), to: s(35) + IRIS, file: 'desert_wind', vol: 0.1},
	{from: s(38), to: at(48, 'по-другому', 6), file: 'desert_wind', vol: 0.09, fade: 30},
	{from: s(42), to: at(48, 'по-другому', 6), file: 'drone', vol: 0.1, fade: 40},
	// Mauro
	{from: s(50), to: at(50, 'искали', 12), file: 'sandstorm', vol: 0.12, fade: 20},
	{from: at(50, 'воздуха', -16), to: end(50) + 10, file: 'heli', vol: 0.22, fade: 24},
	{from: s(51), to: s(54), file: 'desert_wind', vol: 0.07, fade: 24},
	{from: s(55), to: s(56) + IRIS, file: 'crowd', vol: 0.09, fade: 20},
	// water that kills
	{from: s(60), to: s(63) + IRIS, file: 'drone', vol: 0.08, fade: 30},
	// the rules in the desert
	{from: s(73), to: s(79) + IRIS, file: 'desert_wind', vol: 0.07, fade: 24},
	{from: at(74, 'ночью', -10), to: s(75), file: 'crickets', vol: 0.1, fade: 14},
	{from: at(78, 'огнём', -6), to: s(79) + IRIS, file: 'crickets', vol: 0.08, fade: 14},
	// the end
	{from: s(84), to: s(86) + IRIS, file: 'desert_wind', vol: 0.1, fade: 24},
];

// the voice-over sits at about -21 LUFS (5 dB under the usual -16): the effects follow it down
const SFX_GAIN = HAS_VOICE ? 0.38 : 1;

export const SFXZ2: React.FC<{r: Remap}> = ({r}) => (
	<>
		{CUES.map((c, i) => {
			const a = Math.max(0, Math.round(r.fwd(c.at)));
			const len = Math.max(6, Math.min(Math.round(r.fwd(c.at + (c.len ?? 200))) - a, r.total - a));
			const fadeLen = Math.min(18, Math.floor(len / 3));
			const vol = (c.vol ?? 1) * SFX_GAIN;
			return (
				<Sequence key={`c${i}`} from={a} durationInFrames={len} name={`sfx ${c.file}`}>
					<Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f) => (fadeLen >= 2 ? vol * interpolate(f, [len - fadeLen, len - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : vol)} />
				</Sequence>
			);
		})}
		{BEDS.map((b, i) => {
			const a = Math.round(r.fwd(b.from));
			const len = Math.max(10, Math.round(r.fwd(b.to)) - a);
			const fd = Math.min(b.fade ?? 14, Math.floor(len / 3));
			const vol = b.vol * SFX_GAIN;
			return (
				<Sequence key={`b${i}`} from={a} durationInFrames={len} name={`bed ${b.file}`}>
					<Audio src={staticFile(`sfx/${b.file}.wav`)} loop volume={(f) => vol * interpolate(f, [0, fd, len - fd, len - 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			);
		})}
		{VOICE.filter((l) => l.hasAudio).map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.min(Math.ceil(l.duration * 30) + 20, r.total - l.at)} name={`voice ${l.id}`}>
				<Audio src={staticFile(l.src)} volume={1} />
			</Sequence>
		))}
	</>
);
