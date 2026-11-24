// «Каково это — оказаться погребённым заживо» — a white X-ray cover (in the manner of a viral «ОТОРВАЛО» thumbnail): a
// realistic X-ray of a buried coffin seen from the side (a skeleton inside presses the lid with its finger bones and
// screams), one hand-written word on top, a thin hand-drawn arrow at the detail that matters. The X-ray picture is
// generated (Seedream 5 Pro in ElevenLabs) and kept in public/covers/; the word is set in Neucha (SIL OFL, Cyrillic).
// Render: npx remotion still CoverXrayA out/cover/xray-a.png
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';

const FONT = 'NeuchaCover';
// load the hand-written font before the still is taken
const useHandFont = () => {
	const [handle] = useState(() => delayRender('hand font'));
	useEffect(() => {
		const faces = [
			new FontFace(FONT, `url(${staticFile('fonts/neucha-cyrillic-400-normal.woff2')}) format('woff2')`, {unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'}),
			new FontFace(FONT, `url(${staticFile('fonts/neucha-latin-400-normal.woff2')}) format('woff2')`),
		];
		Promise.all(faces.map((f) => f.load()))
			.then((loaded) => {
				loaded.forEach((f) => document.fonts.add(f));
				continueRender(handle);
			})
			.catch((e) => {
				console.error('hand font failed', String(e));
				continueRender(handle);
			});
	}, [handle]);
};

type Pt = [number, number];
// a thin hand-drawn arrow: a slightly wavy line from a to b through c, an open head
const HandArrow: React.FC<{a: Pt; c: Pt; b: Pt; w?: number}> = ({a, c, b, w = 7}) => {
	const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
	const s = 46;
	const h1: Pt = [b[0] + Math.cos(ang + Math.PI - 0.45) * s, b[1] + Math.sin(ang + Math.PI - 0.45) * s];
	const h2: Pt = [b[0] + Math.cos(ang + Math.PI + 0.45) * s, b[1] + Math.sin(ang + Math.PI + 0.45) * s];
	return (
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			<path d={`M ${a[0]},${a[1]} Q ${c[0]},${c[1]} ${b[0]},${b[1]}`} stroke="#111111" strokeWidth={w} fill="none" strokeLinecap="round" />
			<path d={`M ${h1[0]},${h1[1]} L ${b[0]},${b[1]} L ${h2[0]},${h2[1]}`} stroke="#111111" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

const XrayCover: React.FC<{img: string; word: string; size?: number; spacing?: number; top?: number; arrow?: {a: Pt; c: Pt; b: Pt}; imgY?: number; imgScale?: number}> = ({img, word, size = 230, spacing = 26, top = 36, arrow, imgY = 0, imgScale = 1}) => {
	useHandFont();
	return (
		<AbsoluteFill style={{background: '#ffffff'}}>
			<Img src={staticFile(img)} style={{position: 'absolute', left: 0, top: imgY, width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${imgScale})`, transformOrigin: 'center bottom'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: `'${FONT}', 'DejaVu Sans', sans-serif`, fontSize: size, lineHeight: 1, letterSpacing: spacing, color: '#111111', WebkitTextStroke: `${Math.round(size * 0.045)}px #111111`, whiteSpace: 'nowrap'}}>{word}</div>
			{arrow && <HandArrow {...arrow} />}
		</AbsoluteFill>
	);
};

export const CoverXrayA: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЗАКОПАЛИ" arrow={{a: [560, 330], c: [660, 360], b: [760, 470]}} />;
export const CoverXrayB: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЖИВОЙ" spacing={40} arrow={{a: [560, 330], c: [660, 360], b: [760, 470]}} />;
