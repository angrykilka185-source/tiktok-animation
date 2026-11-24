// «Каково это — оказаться погребённым заживо» — a white X-ray cover (in the manner of a viral «ОТОРВАЛО» thumbnail):
// a radiograph of a coffin seen from above — a screaming skull (the jaw open) and two hands pressed against the lid —
// cut out on a white page, one hand-written word on top and a thin hand-drawn arrow at the hand.
// The radiograph (public/covers/xray-a.jpg) is computed, not drawn: scripts/xray-cover/ projects a real open CT scan
// (TotalSegmentator dataset, subject s1380, Wasserthal et al., CC BY 4.0) with the jaw opened and the arms re-posed,
// adds hands built from bone shapes with the same X-ray physics, and the coffin (wood, nails, handles).
// The word is set in Neucha (SIL OFL, Cyrillic).
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
// a thin hand-drawn arrow from a to b through c, with an open head; a white halo under the black line keeps it
// readable where it crosses the dark radiograph (on the white page the halo is invisible)
const HandArrow: React.FC<{a: Pt; c: Pt; b: Pt; w?: number}> = ({a, c, b, w = 7}) => {
	const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
	const s = 46;
	const h1: Pt = [b[0] + Math.cos(ang + Math.PI - 0.45) * s, b[1] + Math.sin(ang + Math.PI - 0.45) * s];
	const h2: Pt = [b[0] + Math.cos(ang + Math.PI + 0.45) * s, b[1] + Math.sin(ang + Math.PI + 0.45) * s];
	const line = `M ${a[0]},${a[1]} Q ${c[0]},${c[1]} ${b[0]},${b[1]}`;
	const head = `M ${h1[0]},${h1[1]} L ${b[0]},${b[1]} L ${h2[0]},${h2[1]}`;
	return (
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			{[line, head].map((d) => (
				<path key={`h${d}`} d={d} stroke="#ffffff" strokeWidth={w + 12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			{[line, head].map((d) => (
				<path key={`l${d}`} d={d} stroke="#111111" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
		</svg>
	);
};

const XrayCover: React.FC<{img: string; word: string; size?: number; spacing?: number; top?: number; arrow?: {a: Pt; c: Pt; b: Pt}}> = ({img, word, size = 200, spacing = 24, top = 22, arrow}) => {
	useHandFont();
	return (
		<AbsoluteFill style={{background: '#ffffff'}}>
			<Img src={staticFile(img)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: `'${FONT}', 'DejaVu Sans', sans-serif`, fontSize: size, lineHeight: 1, letterSpacing: spacing, color: '#111111', WebkitTextStroke: `${Math.round(size * 0.045)}px #111111`, whiteSpace: 'nowrap'}}>{word}</div>
			{arrow && <HandArrow {...arrow} />}
		</AbsoluteFill>
	);
};

// the arrow runs from the end of the word over the coffin's corner down to the fingers of the right hand
// (the middle fingertip of that hand is at about 1288, 578)
export const CoverXrayA: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЗАКОПАЛИ" arrow={{a: [1585, 150], c: [1700, 420], b: [1312, 552]}} />;
// «Й» has a breve above the cap height, so this word sits lower
export const CoverXrayB: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЖИВОЙ" spacing={40} top={44} arrow={{a: [1345, 165], c: [1580, 330], b: [1312, 552]}} />;
