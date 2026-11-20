// The «3D camera» of «Ты с какого района?» for flat 2D sets: every flat layer stands at its own depth in CSS 3D and the
// camera moves between them — near layers slide faster than far ones, the background is soft (depth of field).
// A layer is drawn in the flat 1080×1920 picture coordinates (like a 2D Stage at rest) and placed so that the resting
// camera sees it exactly where the flat picture had it; any camera move then gives parallax.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam3, Card3D, PERSP, Scene3D} from './Scene3D';

export type Box = [number, number, number, number];
export const kz = (z: number) => PERSP / (PERSP - z);

export const Lay: React.FC<{z: number; box: Box; res?: number; blur?: number; children: React.ReactNode}> = ({z, box, res, blur, children}) => {
	const k = kz(z);
	const [bx, by, bw, bh] = box;
	return (
		<Card3D x={(bx + bw / 2 - 540) / k} y={(by + bh / 2 - 960) / k} z={z} w={bw / k} h={bh / k} anchor="center" view={box} res={res ?? Math.max(1, Math.round(1 / k))} blur={blur}>
			{children}
		</Card3D>
	);
};

// a person's layer: a box around a figure standing at (x, y) with scale s
export const personBox = (x: number, y: number, s: number, wide = 520): Box => [x - wide * s, y - 1260 * s, 2 * wide * s, 1320 * s];

const lensVignette = (a: number) => <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, transparent 48%, rgba(0,0,0,${a}) 100%)`}} />;

// the stage: far pass (blurred) + near layers + the lens vignette
export const Set3D: React.FC<{cam: Cam3; bg: string; far: React.ReactNode; blur?: number; vig?: number; children?: React.ReactNode}> = ({cam, bg, far, blur = 3, vig = 0.55, children}) => (
	<AbsoluteFill>
		<Scene3D cam={cam} bg={bg} far={far} farBlur={blur}>
			{children}
		</Scene3D>
		{lensVignette(vig)}
	</AbsoluteFill>
);

// a far set layer (the whole flat background, rasterised a bit smaller: it is blurred anyway)
export const Far: React.FC<{z?: number; box?: Box; children: React.ReactNode}> = ({z = -1400, box = [-460, -300, 2000, 2600], children}) => (
	<Lay z={z} box={box} res={Math.round(1 / kz(z)) + 1}>
		{children}
	</Lay>
);
