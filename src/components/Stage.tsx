import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GlobalDefs, Lighting} from './Set';

export type Cam = {s: number; cx: number; cy: number; rot?: number; dx?: number; dy?: number};

export const camT = (c: Cam) =>
	`translate(${540 + (c.dx ?? 0)},${960 + (c.dy ?? 0)}) rotate(${c.rot ?? 0}) scale(${c.s}) translate(${-c.cx},${-c.cy})`;

// scene point -> screen point (ignores rotation)
export const toScreen = (c: Cam, x: number, y: number) => ({x: 540 + (c.dx ?? 0) + (x - c.cx) * c.s, y: 960 + (c.dy ?? 0) + (y - c.cy) * c.s});

export const Stage: React.FC<{
	cam: Cam;
	children: React.ReactNode;
	overlay?: React.ReactNode;
	screen?: React.ReactNode; // svg drawn in screen space above the scene
	light?: React.ComponentProps<typeof Lighting>;
	bg?: string;
}> = ({cam, children, overlay, screen, light, bg = '#222'}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
			<GlobalDefs />
			<g transform={camT(cam)}>{children}</g>
			{screen}
			<Lighting {...light} />
		</svg>
		{overlay}
	</AbsoluteFill>
);
