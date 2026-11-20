// The same street through the decades: 1901 (the bakery «ХЛѢБЪ», a tea shop, the tavern, the clock maker), 1911 (the
// tram wire, the cinema, the photo studio, electric lamps), 1921 (the old signs boarded up, red banners and flags).
import React from 'react';
import {Banner, House, Poster, Sky, Street, WallFlag} from './old';

export type OldEra = 1901 | 1911 | 1921;
export const HOUSES = {
	tea: {x: -440, w: 440},
	bakery: {x: 40, w: 520},
	tavern: {x: 580, w: 480},
	clock: {x: 1080, w: 470},
};

// the far set (sky, houses, the sidewalk, the road); `dusk` 0…1 lights the windows and darkens the sky
export const OldTown: React.FC<{era: OldEra; dusk?: number; f?: number; rails?: boolean}> = ({era, dusk = 0, f = 0, rails}) => {
	const sky = dusk > 0.5 ? ['#2a2a50', '#d88a5a'] : era === 1921 ? ['#b8c0c4', '#e9e4d6'] : ['#a9c3d6', '#efe6d2'];
	const lit = dusk;
	const worn = era === 1921 ? 1 : 0;
	const r = rails ?? era !== 1901;
	return (
		<g>
			<Sky top={sky[0]} bottom={sky[1]} />
			<House {...HOUSES.tea} floors={3} color={era === 1921 ? '#a8957a' : '#c9a882'} trim="#ece2cc" shop={era === 1911 ? {text: 'ФОТОГРАФІЯ', bg: '#2a2a3a'} : era === 1921 ? {text: 'КООПЕРАТИВЪ', bg: '#3a3a3a', fg: '#e8dcc0'} : {text: 'ЧАЙ · САХАРЪ', bg: '#3a1f1f'}} lit={lit} worn={worn} seed={1} />
			<House {...HOUSES.bakery} floors={2} color={era === 1921 ? '#9a7a5e' : '#b8805a'} trim="#efe4cc" arch shop={{text: 'ХЛѢБЪ', bg: '#1f3a2a', size: 100}} lit={lit} worn={worn} board={era === 1921} seed={2} />
			<House {...HOUSES.tavern} floors={3} color={era === 1921 ? '#b8b09a' : '#d8c8a0'} trim="#f2ead6" shop={era === 1911 ? {text: 'СИНЕМАТОГРАФЪ', bg: '#5a1a1a', fg: '#ffe08a'} : era === 1921 ? {text: 'СТОЛОВАЯ №3', bg: '#5a1a1a', fg: '#f4ecd8'} : {text: 'ТРАКТИРЪ', bg: '#2a2a3a'}} lit={lit} worn={worn} seed={3} />
			<House {...HOUSES.clock} floors={2} color={era === 1921 ? '#8a9488' : '#a8b0a0'} trim="#eae4d4" arch shop={era === 1921 ? {text: 'ЧАСЫ', bg: '#3a3a3a'} : {text: 'ЧАСЫ', bg: '#1f2a3a'}} lit={lit} worn={worn} seed={4} />
			{era === 1911 && (
				<g>
					<path d="M -600,560 Q 540,600 1700,560" stroke="#2a2c30" strokeWidth={4} fill="none" />
					<path d="M -600,600 Q 540,640 1700,600" stroke="#2a2c30" strokeWidth={3} fill="none" />
				</g>
			)}
			{era === 1921 && (
				<g>
					<path d="M -600,560 Q 540,600 1700,560" stroke="#2a2c30" strokeWidth={4} fill="none" />
					<Banner x={-60} y={420} w={1200} text="ВСЯ ВЛАСТЬ СОВЕТАМ!" />
					<WallFlag x={30} y={760} wave={f / 9} />
					<WallFlag x={1050} y={760} wave={f / 9 + 1} flip />
					<Poster x={-400} y={1010} w={170} h={220} text={'ВСЕ НА\nСУББОТНИК'} art="gear" />
					<Poster x={630} y={1000} w={170} h={230} text={'ГРАМОТА —\nПУТЬ\nВПЕРЁД'} art="book" rot={-3} />
					<Poster x={1110} y={1010} w={160} h={210} text={'РСФСР'} art="star" rot={2} />
				</g>
			)}
			<Street rails={r} />
			{dusk > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#141a3a" opacity={0.35 * dusk} />}
		</g>
	);
};
