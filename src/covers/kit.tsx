// Shared pieces of the YouTube covers on the channel's white page: the heavy caption word with a 3D edge and the red
// hand-drawn arrow (first made for «ОН ЖИВ!», src/covers/Zakopan.tsx).
import React from 'react';
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

