// «Каково это — замёрзнуть насмерть» — the sound: the author's voice, quiet beds (the night sea, the icy wind, the far
// cries over the water, a low tension drone) and the effects, timed on the words of the voice so they follow it.
// All sounds are procedural (scripts/make-sfx.mjs): no music tracks, no samples.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {shotStart as s, SHOTS} from './timeline';
import {HAS_VOICE, VOICE, w} from './voice';

type Cue = {at: number; file: string; vol?: number; len?: number};
type Bed = {from: number; to: number; file: string; vol: number; fade?: number};
const end = (n: number) => s(n) + SHOTS[n - 1].duration;
const at = (n: number, word: string | number, add = 0) => s(n) + w(n, word, add);
// the same cue every `every` frames in [from, to)
const rep = (from: number, to: number, every: number, file: string, vol: number, len?: number): Cue[] =>
	Array.from({length: Math.max(0, Math.ceil((to - from) / every))}).map((_, k) => ({at: from + k * every, file, vol, len}));
// a heart that slows down and stumbles: beats at these offsets (frames) from `from`
const beats = (from: number, offs: number[], vol: number, ecg = false): Cue[] =>
	offs.flatMap((o) => [{at: from + o, file: 'heart_one', vol}, ...(ecg ? [{at: from + o + 2, file: 'ecg', vol: vol * 0.45}] : [])]);

const CUES: Cue[] = [
	// the hook
	{at: s(1), file: 'gust', vol: 0.35},
	{at: at(1, 'тело', -2), file: 'heart_one', vol: 0.5},
	{at: at(2, 'минут', -2), file: 'tick', vol: 0.3, len: 45},
	{at: at(3, 'пассажир', -6), file: 'steam_horn', vol: 0.4},
	{at: s(4), file: 'swell', vol: 0.35},
	{at: s(4) + 2, file: 'ice_crack', vol: 0.35},
	{at: at(4, 'шаг', -2), file: 'tick', vol: 0.25, len: 40},
	{at: at(5, 'поехали'), file: 'whoosh', vol: 0.6},
	// the night of the Titanic
	{at: at(6, 'задевает', -2), file: 'scrape', vol: 0.7},
	{at: at(6, 'задевает', 30), file: 'creak', vol: 0.3},
	{at: at(7, 'пинает', -2), file: 'crunch', vol: 0.35},
	{at: s(8), file: 'water', vol: 0.3, len: 100},
	{at: at(8, 'непотопляемым', -4), file: 'groan', vol: 0.45},
	{at: at(9, 'шлюпках', -2), file: 'stamp', vol: 0.4},
	{at: s(10) + 4, file: 'creak', vol: 0.3},
	{at: at(10, 'полупустыми', -4), file: 'pop', vol: 0.4},
	{at: s(11), file: 'groan', vol: 0.55},
	{at: at(11, 'океане', -6), file: 'splash', vol: 0.7},
	{at: at(12, 'жилет', -2), file: 'cloth', vol: 0.4},
	{at: at(12, 'холода', -2), file: 'gust', vol: 0.3},
	// the first minute: the cold shock
	{at: at(13, 'холод', -2), file: 'gasp', vol: 0.6},
	{at: at(13, 'холод', 4), file: 'heart', vol: 0.3},
	{at: at(14, 'шок', -4), file: 'gasp', vol: 0.45},
	{at: at(14, 'под', -2), file: 'bubbles', vol: 0.4},
	{at: s(15), file: 'pant', vol: 0.4, len: 110},
	{at: at(15, 'сердце', -2), file: 'heart', vol: 0.4},
	{at: at(16, 'шока', -4), file: 'heart_one', vol: 0.6},
	...['одна', 'десяти', 'час'].map((k) => ({at: at(17, k, -2), file: 'pop', vol: 0.4})),
	{at: at(18, 'дыши', -2), file: 'breath', vol: 0.4, len: 150},
	// the body fights
	{at: at(19, 'тело', -2), file: 'swell', vol: 0.3},
	{at: at(20, 'сжимает', -2), file: 'heart_one', vol: 0.4},
	{at: at(20, 'тёплая'), file: 'whoosh', vol: 0.25},
	{at: at(21, 'деревенеют', -2), file: 'crunch', vol: 0.3},
	{at: at(21, 'сжать'), file: 'cloth', vol: 0.3},
	{at: at(22, 'чужими', -4), file: 'slowdown', vol: 0.35},
	{at: at(23, 'доплыть'), file: 'water', vol: 0.35, len: 80},
	{at: at(24, 'нет', -2), file: 'decline', vol: 0.4},
	...rep(s(25) + 6, end(25), 46, 'chatter', 0.4),
	{at: at(25, 'обогреватель'), file: 'switch', vol: 0.35},
	{at: at(26, 'переохлаждение', -4), file: 'stamp', vol: 0.45},
	{at: at(26, 'двадцать', -2), file: 'pop', vol: 0.4},
	...rep(s(27), s(27) + 60, 46, 'chatter', 0.28),
	{at: at(27, 'мысли'), file: 'slowdown', vol: 0.3},
	// the boats that do not come back
	{at: at(29, 'свободные', -2), file: 'pop', vol: 0.4},
	{at: at(29, 'не', -2), file: 'decline', vol: 0.35},
	{at: at(30, 'перевернут', -6), file: 'water', vol: 0.35, len: 60},
	{at: at(30, 'перевернут'), file: 'creak', vol: 0.3},
	{at: s(31), file: 'lake', vol: 0.3, len: SHOTS[30].duration},
	{at: at(31, 'четырнадцать', -4), file: 'pop', vol: 0.45},
	{at: at(32, 'четверых', -4), file: 'stamp', vol: 0.5},
	{at: at(32, 'один', -2), file: 'heart_one', vol: 0.3},
	// 32°: the shivering stops, the heater goes off
	...rep(s(33), at(33, 'прекращается', -6), 46, 'chatter', 0.35),
	{at: at(34, 'выключился', -2), file: 'switch', vol: 0.4},
	{at: at(34, 'выключился'), file: 'slowdown', vol: 0.45},
	{at: at(35, 'сонливость'), file: 'breath', vol: 0.3, len: 150},
	{at: s(36), file: 'tick', vol: 0.25, len: SHOTS[35].duration},
	// the paradoxical undressing, the burrowing
	{at: at(37, 'раздеваются', -4), file: 'cloth', vol: 0.5},
	{at: at(38, 'четвёртого', -2), file: 'pop', vol: 0.45},
	{at: at(39, 'расслабляются', -2), file: 'whoosh', vol: 0.35},
	{at: at(39, 'жарко', -4), file: 'swell', vol: 0.35},
	{at: at(40, 'терминальным', -2), file: 'cloth', vol: 0.35},
	// 28°: the heart
	{at: at(41, 'сознание'), file: 'slowdown', vol: 0.4},
	...beats(s(42) + 8, [0, 30, 64, 108, 150, 210], 0.5, true),
	{at: s(43), file: 'tick', vol: 0.3, len: Math.min(150, SHOTS[42].duration)},
	{at: at(44, 'карпатия', -6), file: 'steam_horn', vol: 0.5},
	{at: at(44, 'некого', -2), file: 'decline', vol: 0.3},
	{at: at(45, 'погибли', -2), file: 'swell', vol: 0.3},
	{at: at(45, 'холод', -2), file: 'heart_one', vol: 0.65},
	// the legend of the baker, alcohol
	{at: at(46, 'пекарь', -4), file: 'pop', vol: 0.4},
	{at: at(46, 'двух', -2), file: 'tick', vol: 0.25, len: 40},
	{at: at(47, 'не', -2), file: 'stamp', vol: 0.5},
	{at: at(48, 'расширяет', -2), file: 'whoosh', vol: 0.3},
	{at: at(48, 'теряет', -2), file: 'slowdown', vol: 0.3},
	// the cold that saves: Anna Bågenholm
	{at: at(49, 'спасает', -8), file: 'swell', vol: 0.45},
	{at: at(49, 'спасает', -2), file: 'whoosh', vol: 0.4},
	{at: s(50), file: 'gust', vol: 0.3},
	{at: at(50, 'анна', 6), file: 'whoosh', vol: 0.35},
	{at: at(50, 'падает', -2), file: 'ice_crack', vol: 0.6},
	{at: at(50, 'падает', 8), file: 'splash', vol: 0.6},
	{at: s(51) + 4, file: 'bubbles', vol: 0.35},
	{at: at(51, 'кармане'), file: 'breath', vol: 0.3, len: 90},
	...beats(at(51, 'останавливается', -70), [0, 26, 56], 0.4, true),
	{at: at(51, 'останавливается', -2), file: 'flat', vol: 0.35},
	{at: at(52, 'температура', -2), file: 'tick', vol: 0.25, len: 40},
	{at: at(52, 'рекорд', -2), file: 'stamp', vol: 0.55},
	{at: s(53) + 6, file: 'fridge', vol: 0.25, len: Math.max(30, w(53, 'биться'))},
	...beats(at(53, 'биться', -2), [0, 26, 52, 78, 104, 130], 0.45, true),
	{at: at(54, 'пять', -2), file: 'pop', vol: 0.4},
	{at: at(54, 'работу', -2), file: 'message', vol: 0.4},
	{at: at(55, 'правило', -2), file: 'stamp', vol: 0.45},
	// the rescue
	{at: at(56, 'опасный', -2), file: 'heart_one', vol: 0.4},
	{at: at(57, 'вытащить', -2), file: 'water', vol: 0.35, len: 60},
	{at: at(57, 'ноги', -4), file: 'slowdown', vol: 0.35},
	{at: at(58, 'горизонтально', -2), file: 'pop', vol: 0.4},
	{at: at(59, 'последействие', -2), file: 'stamp', vol: 0.4},
	{at: at(59, 'падает'), file: 'slowdown', vol: 0.3},
	// the city in winter
	{at: s(60), file: 'whoosh', vol: 0.4},
	{at: s(60) + 4, file: 'steps', vol: 0.3},
	{at: at(61, 'присели', -4), file: 'creak', vol: 0.3},
	{at: at(62, 'засыпает'), file: 'breath', vol: 0.22, len: 120},
	{at: s(63), file: 'gust', vol: 0.45},
	{at: at(63, 'мокрая', -4), file: 'water', vol: 0.2, len: 40},
	...[0, 12, 24].map((o) => ({at: at(64, 'слоями', -2 + o), file: 'cloth', vol: 0.4})),
	{at: at(64, 'промокла', -2), file: 'cloth', vol: 0.3},
	{at: at(65, 'топливо', -2), file: 'crunch', vol: 0.35},
	{at: at(65, 'телефон', -2), file: 'lowbat', vol: 0.4},
	// the ice gives way
	{at: at(66, 'лёд', -4), file: 'ice_crack', vol: 0.7},
	{at: at(66, 'лёд', 6), file: 'splash', vol: 0.7},
	{at: s(67), file: 'gasp', vol: 0.5},
	{at: at(67, 'шок', -10), file: 'pant', vol: 0.35, len: 70},
	{at: at(67, 'шок', 60), file: 'breath', vol: 0.3, len: 90},
	{at: at(68, 'выдержал', -2), file: 'water', vol: 0.3, len: 60},
	{at: at(69, 'руки', -2), file: 'crunch', vol: 0.35},
	{at: at(69, 'ногами'), file: 'water', vol: 0.35, len: 60},
	{at: at(69, 'тюлень', -2), file: 'cloth', vol: 0.35},
	{at: at(70, 'откатись', -2), file: 'crunch', vol: 0.35},
	{at: at(70, 'откатись', 12), file: 'crunch', vol: 0.3},
	{at: at(71, 'звони', -2), file: 'dtmf112', vol: 0.45},
	{at: at(71, 'протяни', -2), file: 'whoosh', vol: 0.35},
	{at: at(71, 'ложись', -2), file: 'crunch', vol: 0.3},
	// first aid
	{at: at(72, 'сними', -2), file: 'cloth', vol: 0.45},
	{at: at(72, 'грудь', -2), file: 'cloth', vol: 0.3},
	{at: at(73, 'растирай', -2), file: 'decline', vol: 0.4},
	{at: at(73, 'алкоголя', -2), file: 'stamp', vol: 0.4},
	{at: at(74, 'чай', -6), file: 'spoon', vol: 0.45},
	{at: at(74, 'скорую', -4), file: 'siren', vol: 0.2, len: 120},
	// the end
	{at: s(75), file: 'gust', vol: 0.3},
	{at: s(75) + 10, file: 'tick', vol: 0.18, len: Math.max(30, SHOTS[74].duration - 10)},
	{at: s(76), file: 'swell', vol: 0.3},
	...['минута', 'десять', 'голова'].map((k) => ({at: at(76, k, -2), file: 'pop', vol: 0.4})),
	{at: at(77, 'комментариях', -4), file: 'message', vol: 0.5},
	{at: s(78), file: 'whoosh', vol: 0.4},
	{at: at(78, 'тгк', -6), file: 'message', vol: 0.5},
];

const BEDS: Bed[] = [
	// over the water at night
	{from: s(1), to: s(6), file: 'sea', vol: 0.1, fade: 20},
	{from: s(1), to: s(6), file: 'wind_cold', vol: 0.08, fade: 20},
	{from: s(6), to: s(11), file: 'sea', vol: 0.06},
	{from: s(6), to: s(12), file: 'drone', vol: 0.1, fade: 30},
	// in the water
	{from: s(11), to: s(46), file: 'sea', vol: 0.14, fade: 24},
	{from: s(11), to: s(46), file: 'wind_cold', vol: 0.09, fade: 24},
	{from: s(11) + 20, to: at(28, 'тише', 30), file: 'cries', vol: 0.11, fade: 45},
	{from: s(33), to: s(46), file: 'drone', vol: 0.12, fade: 40},
	// Norway: the mountains, under the ice
	{from: s(50), to: s(51), file: 'wind_cold', vol: 0.12},
	{from: s(51), to: s(53), file: 'drone', vol: 0.1, fade: 24},
	// the rescue
	{from: s(56), to: s(58), file: 'sea', vol: 0.08},
	// the city in winter, the frozen lake
	{from: s(60), to: s(66), file: 'wind_cold', vol: 0.13, fade: 20},
	{from: s(66), to: s(72), file: 'wind_cold', vol: 0.1},
	{from: s(75), to: s(77), file: 'wind_cold', vol: 0.11, fade: 24},
];

const SFX_GAIN = HAS_VOICE ? 0.6 : 1;

export const SFXZ1: React.FC<{r: Remap}> = ({r}) => (
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
