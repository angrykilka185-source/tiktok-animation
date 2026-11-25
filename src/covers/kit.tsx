// Shared pieces of the YouTube covers on the channel's white page: the heavy caption word with a 3D edge and the red
// hand-drawn arrow (first made for «ОН ЖИВ!», src/covers/Zakopan.tsx); the X-ray cover layout — a radiograph on the
// white page, one hand-written word (Neucha, SIL OFL) and a thin hand-drawn arrow (src/covers/ZakopanXray.tsx).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {HEAVY} from '../components/Overlays';

export const RED = '#ff3b30';
export const RED_D = '#7a0d0a';
export const INK = '#16161c';

// «ОН ЖИВ!»: white «ОН», red «ЖИВ!» with a white edge; each with a dark 3D edge under it; fixed widths
export const AliveWord: React.FC<{x: number; y: number; w: number; size: number; text: string; red?: boolean; anchor?: 'start' | 'middle'; onWhite?: boolean}> = ({x, y, w, size, text, red = false, anchor = 'start', onWhite = false}) => {
	const common = {x, fontSize: size, textLength: w, lengthAdjust: 'spacingAndGlyphs' as const, textAnchor: anchor, strokeLinejoin: 'round' as const};
	const d = Math.round(size * 0.07);
	// on the white page: dark «ОН» with a grey edge, red «ЖИВ!» with a dark-red edge (no white outline)
	const face = red ? RED : onWhite ? INK : '#ffffff';
	const edge = red ? RED_D : onWhite ? '#9aa0aa' : INK;
	return (
		<g fontFamily={HEAVY} fontWeight={900}>
			<text {...common} y={y + d} fill={edge} stroke={edge} strokeWidth={size * (onWhite ? 0.04 : 0.13)}>
				{text}
			</text>
			<text {...common} y={y} fill={face} stroke={onWhite ? face : red ? '#ffffff' : INK} strokeWidth={size * (onWhite ? 0.02 : 0.07)} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};
// a hand-drawn arrow: a curve from a to b (through c), a white edge round the red
export const Arrow: React.FC<{a: [number, number]; c: [number, number]; b: [number, number]; w?: number}> = ({a, c, b, w = 16}) => {
	const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
	const head = (r: number, sp: number) => `${b[0] - Math.cos(ang - sp) * r},${b[1] - Math.sin(ang - sp) * r} ${b[0]},${b[1]} ${b[0] - Math.cos(ang + sp) * r},${b[1] - Math.sin(ang + sp) * r}`;
	const d = `M ${a[0]},${a[1]} Q ${c[0]},${c[1]} ${b[0] - Math.cos(ang) * w},${b[1] - Math.sin(ang) * w}`;
	return (
		<g strokeLinecap="round" strokeLinejoin="round" fill="none">
			<path d={d} stroke="#ffffff" strokeWidth={w + 12} />
			<polyline points={head(w * 3.2, 0.55)} stroke="#ffffff" strokeWidth={w + 12} />
			<path d={d} stroke={RED} strokeWidth={w} />
			<polyline points={head(w * 3.2, 0.55)} stroke={RED} strokeWidth={w} />
		</g>
	);
};

// ---------------------------------------------------------------- the X-ray covers -----
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

export type Pt = [number, number];
// a thin hand-drawn arrow from a to b through c, with an open head; a white halo under the black line keeps it
// readable where it crosses the dark radiograph (on the white page the halo is invisible)
export const HandArrow: React.FC<{a: Pt; c: Pt; b: Pt; w?: number}> = ({a, c, b, w = 7}) => {
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

export const XrayCover: React.FC<{img: string; word: string; size?: number; spacing?: number; top?: number; cx?: number; arrow?: {a: Pt; c: Pt; b: Pt}}> = ({img, word, size = 200, spacing = 24, top = 22, cx = 960, arrow}) => {
	useHandFont();
	return (
		<AbsoluteFill style={{background: '#ffffff'}}>
			<Img src={staticFile(img)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain'}} />
			<div style={{position: 'absolute', left: cx - 960, width: 1920, top, textAlign: 'center', fontFamily: `'${FONT}', 'DejaVu Sans', sans-serif`, fontSize: size, lineHeight: 1, letterSpacing: spacing, color: '#111111', WebkitTextStroke: `${Math.round(size * 0.045)}px #111111`, whiteSpace: 'nowrap'}}>{word}</div>
			{arrow && <HandArrow {...arrow} />}
		</AbsoluteFill>
	);
};
