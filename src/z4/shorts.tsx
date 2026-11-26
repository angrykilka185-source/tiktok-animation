// Vertical shorts (1080×1920) cut from «Каково это — умереть от лап медведя» — teasers for the full film
// (the layout: src/components/FilmShorts.tsx). The counter «ОШИБКИ ГОГИ» sits in the band's top-left corner where
// it ticks; on the end card, the film's X-ray cover «ЗАДРАЛ».
// The framing keeps every label, Чоби and the bears inside the band (the band shows ≈ 1576 of the film's 1920 px).
// Render: scripts/render-parallel.sh MedvedShort1 MedvedShort1Audio out/medved-short-1.mp4   (… up to 6)
import React from 'react';
import {makeFilmShorts, type FilmShortSpec} from '../components/FilmShorts';
import {CoverMedvedXray} from '../covers/MedvedXray';
import {MedvedHud, MedvedScenes, RZ4} from './Main';
import {SFXZ4} from './SFX';
import {shotStart, SHOTS} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// the colours at the top and bottom edges of a zoomed-out shot
const FOREST = {top: '#9ed0ea', bottom: '#7aad58'}; // the day forest: sky, grass
const PAGE = {top: '#ffffff', bottom: '#f6efe3'}; // Чоби's page

const RUNS: FilmShortSpec[] = [
	// the encounter. «впереди хрустят ветки»: the band slides right to the bush where the bear hides and «ХРУСТ…»,
	// then back with the bear as it steps out; «Стоп, Гога!»: the two mistakes on the left and Чоби on the right are
	// a little wider than the band
	{
		shots: [1, 5],
		hook: ['МЕДВЕДЬ', '*В 20 ШАГАХ'],
		cta: ['КАКИЕ', '*ДВЕ ОШИБКИ?'],
		framing: {
			1: {from: 960, to: {cx: 1107, zoom: 0.97}, word: 'впереди', add: -6, ...FOREST},
			2: {from: {cx: 1107, zoom: 0.97}, to: 960, word: 'медведь', add: -10, ...FOREST},
			5: {from: 960, to: {cx: 951, zoom: 0.945}, top: '#7f878c', bottom: '#636b5d'},
		},
	},
	// mistake two, running. Чоби and «3 СЕК» by the right edge; «ВСТАЛ — НЕ ЗНАЧИТ НАПАДАЕТ» by the left one; on
	// Чоби's pages the list and the little bear are a little wider than the band
	{
		shots: [18, 22],
		hook: ['ОТ МЕДВЕДЯ', '*НЕЛЬЗЯ', '*УБЕГАТЬ'],
		cta: ['А ЕСЛИ ОН', '*БРОСИЛСЯ?'],
		framing: {
			18: 990,
			19: 990,
			20: 895,
			21: {from: 895, to: {cx: 1066, zoom: 0.96}, ...PAGE},
			22: {cx: 1066, zoom: 0.96, ...PAGE},
		},
	},
	// mistake four, the cubs. Чоби and the mother bear by the right edge; the study's source note in the corner;
	// «сразу уходи»: the arrow back on the left and the mother in the bushes on the right
	{
		shots: [34, 38],
		hook: ['СЕЛФИ', '*С МЕДВЕЖАТАМИ?'],
		cta: ['А ЕЩЁ', '*5 ОШИБОК'],
		framing: {
			34: 1010,
			35: 1010,
			36: 1010,
			37: {cx: 1088, zoom: 0.96, top: '#f3efe6', bottom: '#f3efe6'},
			38: {cx: 937, zoom: 0.93, ...FOREST},
		},
		hud: [34, 35], // it ticks at «ошибка номер четыре»; later it would cover «ГДЕ МЕДВЕЖАТА — ТАМ И МАМА»
	},
	// mistake six, the den. Чоби by the right edge, then «ГОЛОДНЫЙ»; the battery of fat and the cross; the village
	// the shatun comes to
	{
		shots: [44, 48],
		hook: ['НЕ ТРОГАЙ', '*ЭТОТ СУГРОБ'],
		cta: ['А ЕСЛИ МЕДВЕДЬ', '*НАПАДЁТ?'],
		framing: {
			44: 1000,
			45: {from: 1000, to: 1132, word: 'разбудили', add: -6},
			46: 980,
			47: {from: 960, to: {cx: 1081, zoom: 0.94}, word: 'выходят', add: -8, top: '#0b102a', bottom: '#8d98b1'},
		},
		hud: [44, 46], // it ticks at «ошибка номер шесть»; at night it would cover «ОДИН ИЗ САМЫХ ОПАСНЫХ ЗВЕРЕЙ»
	},
	// the attack: play dead, and when to fight. «САМОЕ ГЛАВНОЕ» reaches the right edge; the three cases of the
	// exception stand across the whole width
	{
		shots: [49, 54],
		hook: ['МЕДВЕДЬ НАПАЛ:', '*ЛЕЧЬ ИЛИ', '*ДРАТЬСЯ?'],
		cta: ['ЧТО ОСТАНОВИТ', '*МЕДВЕДЯ?'],
		framing: {
			49: 1000,
			50: {from: 1000, to: 940}, // the list of the rules reaches the left edge
			51: 940,
			52: 940,
			53: {cx: 960, zoom: 0.855, top: '#eef3ea', bottom: '#eef3ea'},
		},
		hud: false, // all six mistakes are behind: the counter would only stand still
	},
	// Timothy Treadwell: the bears by the right edge, then the battery of fat
	{
		shots: [57, 60],
		hook: ['ОН ВЕРИЛ,', 'ЧТО МЕДВЕДИ —', '*ЕГО ДРУЗЬЯ'],
		cta: ['КАК НЕ СТАТЬ', '*ДОБЫЧЕЙ?'],
		framing: {57: 1062, 58: 1000},
		hud: false,
	},
];

export const {
	SHORTS,
	shortRange,
	shortDuration,
	Short: MedvedShort,
	ShortAudio: MedvedShortAudio,
} = makeFilmShorts(
	{
		kicker: ['КАКОВО ЭТО —', 'УМЕРЕТЬ ОТ ЛАП МЕДВЕДЯ'],
		tint: '#2f6a48', // the forest
		r: RZ4,
		shots: SHOTS,
		shotStart,
		w,
		captions: VOICE_CAPTIONS,
		Scenes: MedvedScenes,
		Hud: MedvedHud,
		Sound: () => <SFXZ4 r={RZ4} />,
		Cover: CoverMedvedXray,
		coverSize: [1920, 1080],
	},
	RUNS,
);
