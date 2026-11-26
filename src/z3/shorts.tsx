// Vertical shorts (1080×1920) cut from «Каково это — оказаться погребённым заживо» — teasers for the full film
// (the layout: src/components/FilmShorts.tsx). The counters of the film («ОШИБКИ ГОГИ», the air) sit in the corners
// of what the band shows.
// Render: scripts/render-parallel.sh ZakopanShort1 ZakopanShort1Audio out/zakopan-short-1.mp4   (… up to 6)
import React from 'react';
import {makeFilmShorts, type FilmShortSpec} from '../components/FilmShorts';
import {CoverZakopan2m} from '../covers/Zakopan';
import {RZ3, ZakopanHud, ZakopanScenes} from './Main';
import {SFXZ3} from './SFX';
import {shotStart, SHOTS} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

export {CTA} from '../components/FilmShorts';

const RUNS: FilmShortSpec[] = [
	// «два метра земли»: the band pans right to the depth mark; «Стоп, Гога!»: the list of mistakes on the left and
	// Чоби on the right are a little wider than the band
	{
		shots: [1, 5],
		hook: ['ТЫ ПРОСНУЛСЯ', '*В ГРОБУ'],
		cta: ['ЧТО ДЕЛАТЬ', '*ДАЛЬШЕ?'],
		framing: {2: {from: 960, to: 1100, word: 'два', add: -8}, 5: {cx: 945, zoom: 0.95, top: '#2e2925', bottom: '#1d1916'}},
	},
	// Чоби's pages: the CO₂ gauge stands by the right edge
	{
		shots: [8, 12],
		hook: ['СКОЛЬКО ВОЗДУХА', '*В ГРОБУ?'],
		cta: ['КАК ЕГО', '*СБЕРЕЧЬ?'],
		framing: {10: 1000, 11: 1000, 12: 1000},
	},
	// «а сторож дежурил днём и ночью»: the band pans right to the watchman and his label
	{
		shots: [32, 37],
		hook: ['ЗАЧЕМ В ГРОБ', '*КЛАЛИ', '*КОЛОКОЛЬЧИК'],
		cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ИСТОРИИ'],
		framing: {37: {from: 960, to: 1060, word: 'сторож', add: -8}},
		hud: false, // the history part: «ОШИБКИ ГОГИ · 3/7» stands still there and would cover «ДОМА ОЖИДАНИЯ»
	},
	// Gogol's testament: the scroll reaches the right edge
	{
		shots: [38, 41],
		hook: ['ГОГОЛЯ', '*ПОХОРОНИЛИ', '*ЖИВЫМ?'],
		cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ИСТОРИИ'],
		framing: {40: 1020},
		hud: false,
	},
	// the survival chart on Чоби's last page reaches the right edge
	{
		shots: [46, 51],
		hook: ['ПОД ЛАВИНОЙ:', '*15 МИНУТ', '*НА СПАСЕНИЕ'],
		cta: ['А ЕЩЁ', '*6 ОШИБОК'],
		framing: {51: 1010},
	},
	// the three rules of shot 54 stand across the whole width
	{
		shots: [52, 55],
		hook: ['ЯМА НА ПЛЯЖЕ', '*МОЖЕТ УБИТЬ'],
		cta: ['А ЕЩЁ', '*6 ОШИБОК'],
		framing: {
			54: {cx: 989, zoom: 0.945, top: '#fff7e4', bottom: '#f0cf8a'},
		},
	},
];

export const {
	SHORTS,
	shortRange,
	shortDuration,
	Short: ZakopanShort,
	ShortAudio: ZakopanShortAudio,
} = makeFilmShorts(
	{
		kicker: ['КАКОВО ЭТО — ОКАЗАТЬСЯ', 'ПОГРЕБЁННЫМ ЗАЖИВО'],
		tint: '#5a3a1e', // earth
		r: RZ3,
		shots: SHOTS,
		shotStart,
		w,
		captions: VOICE_CAPTIONS,
		Scenes: ZakopanScenes,
		Hud: ZakopanHud,
		Sound: () => <SFXZ3 r={RZ3} />,
		Cover: CoverZakopan2m,
		coverSize: [1280, 720],
	},
	RUNS,
);
