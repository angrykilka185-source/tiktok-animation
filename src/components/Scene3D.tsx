// A 2.5D stage: flat 2D layers (cards) placed at different depths in a real CSS-3D space, and a camera that moves
// between them — near layers slide faster than far ones, the ground and floors recede in perspective, and layers away
// from the focus get softly blurred (depth of field). Everything inside the cards is our usual 2D art.
//
// World units are pixels of the 1080×1920 frame. z = 0 is the picture plane (a card there is drawn at its own size),
// negative z is farther away, positive z is closer. y grows downward. The camera translates by (x, y) and dollies by
// `z` (positive = moves forward, so everything comes closer); `ry`/`rx` turn it slightly (degrees).
import React from 'react';
import {AbsoluteFill} from 'remotion';

export type Cam3 = {x: number; y: number; z: number; ry?: number; rx?: number; focus?: number; dof?: number};
export const PERSP = 1300;

// where a world point lands on the screen (ignoring the small camera turns); (cx, cy) = the frame centre
export const project = (cam: Cam3, x: number, y: number, z: number, cx = 540, cy = 960) => {
	const zz = z + cam.z;
	const k = PERSP / Math.max(1, PERSP - zz);
	return {x: cx + (x - cam.x) * k, y: cy + (y - cam.y) * k, k};
};

// how blurred a layer at depth z is: 0 at the focus depth, more the farther it is from it
export const blurAt = (cam: Cam3, z: number) => {
	const d = Math.abs(z - (cam.focus ?? 0));
	return Math.min(14, d * (cam.dof ?? 0.004));
};

const CamCtx = React.createContext<Cam3>({x: 0, y: 0, z: 0});

// the world is centred on the frame (540, 960 in the vertical films; 960, 540 in 16:9)
const World: React.FC<{cam: Cam3; children: React.ReactNode}> = ({cam, children}) => (
	<AbsoluteFill style={{perspective: `${PERSP}px`, perspectiveOrigin: '50% 50%'}}>
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 0,
				height: 0,
				transformStyle: 'preserve-3d',
				transform: `translateZ(${PERSP}px) rotateX(${cam.rx ?? 0}deg) rotateY(${cam.ry ?? 0}deg) translateZ(${-PERSP}px) translate3d(${-cam.x}px, ${-cam.y}px, ${cam.z}px)`,
			}}
		>
			<CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
		</div>
	</AbsoluteFill>
);

// The stage. `far` is drawn in its own pass and blurred as a whole (depth of field: the background is soft, like a
// real lens), `children` — the near layers — stay sharp. Both passes share the camera, so everything slides correctly.
export const Scene3D: React.FC<{cam: Cam3; bg?: string; far?: React.ReactNode; farBlur?: number; children?: React.ReactNode; overlay?: React.ReactNode}> = ({cam, bg = '#000', far, farBlur = 4, children, overlay}) => (
	<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
		{far && (
			<AbsoluteFill style={{filter: farBlur > 0.3 ? `blur(${farBlur}px)` : undefined}}>
				<World cam={cam}>{far}</World>
			</AbsoluteFill>
		)}
		{children && <World cam={cam}>{children}</World>}
		{overlay}
	</AbsoluteFill>
);

// a flat card: (x, y) = the card's anchor point in the world — bottom centre by default (things standing on the ground)
// `view` = the SVG viewBox of the art inside; `ry` turns the card (side walls); `blur` overrides the depth of field.
// `res` > 1 rasterises the art that many times smaller and scales it back up: Chrome rasterises a 3D card at its own
// CSS size whatever its distance, so a huge far card (a house, the factory) would cost tens of megapixels per frame.
export const Card3D: React.FC<{
	x: number;
	y: number;
	z: number;
	w: number;
	h: number;
	view?: [number, number, number, number];
	anchor?: 'bottom' | 'center';
	ry?: number;
	blur?: number;
	opacity?: number;
	children: React.ReactNode;
	html?: boolean;
	res?: number;
}> = ({x, y, z, w, h, view, anchor = 'bottom', ry = 0, blur, opacity = 1, children, html = false, res = 1}) => {
	const b = blur ?? 0;
	const left = x - w / 2;
	const top = anchor === 'bottom' ? y - h : y - h / 2;
	const r = ry === 0 && !html ? Math.max(1, res) : 1;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: w / r,
				height: h / r,
				transform: `translate3d(${left}px, ${top}px, ${z}px) rotateY(${ry}deg)${r > 1 ? ` scale(${r})` : ''}`,
				transformOrigin: r > 1 ? '0 0' : ry > 0 ? '0% 50%' : ry < 0 ? '100% 50%' : '50% 50%',
				filter: b > 0.3 ? `blur(${b.toFixed(1)}px)` : undefined,
				opacity,
			}}
		>
			{html ? (
				children
			) : (
				<svg width={w / r} height={h / r} viewBox={(view ?? [0, 0, w, h]).join(' ')} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					{children}
				</svg>
			)}
		</div>
	);
};

// a horizontal plane (ground, floor): its near edge at depth `zNear`, `depth` px deep, `w` px wide, at height y.
// It is rasterised `res` times smaller and scaled up (huge layers are too big for the browser otherwise),
// so draw the art inside in the reduced units (w / res × depth / res).
export const Floor3D: React.FC<{y: number; zNear: number; depth: number; w: number; x?: number; res?: number; children: React.ReactNode; blur?: number}> = ({y, zNear, depth, w, x = 0, res = 6, children, blur = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: w / res,
			height: depth / res,
			transformOrigin: '50% 0%',
			transform: `translate3d(${x - w / 2 / res}px, ${y}px, ${zNear}px) rotateX(-90deg) scale(${res})`,
			filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
		}}
	>
		<svg width={w / res} height={depth / res} style={{position: 'absolute', inset: 0}}>
			{children}
		</svg>
	</div>
);

// a building block as a real box: the front wall (your 2D art) and a darker side wall going back
export const Box3D: React.FC<{x: number; y: number; z: number; w: number; h: number; d: number; side?: string; roof?: string | null; children: React.ReactNode; blur?: number; sideOn?: 'left' | 'right'; res?: number}> = ({
	x,
	y,
	z,
	w,
	h,
	d,
	side = '#8a8272',
	roof = null,
	children,
	blur,
	sideOn = 'right',
	res = 1,
}) => {
	const b = blur ?? 0;
	const r = Math.max(1, res);
	const f = b > 0.3 ? `blur(${b.toFixed(1)}px)` : undefined;
	const sx = sideOn === 'right' ? x + w / 2 : x - w / 2;
	return (
		<>
			{/* side wall */}
			<div style={{position: 'absolute', left: 0, top: 0, width: d, height: h, transformOrigin: '0% 50%', transform: `translate3d(${sx}px, ${y - h}px, ${z}px) rotateY(${sideOn === 'right' ? 90 : 90}deg)`, background: side, filter: f}} />
			{/* roof */}
			{roof && <div style={{position: 'absolute', left: 0, top: 0, width: w, height: d, transformOrigin: '50% 0%', transform: `translate3d(${x - w / 2}px, ${y - h}px, ${z}px) rotateX(-90deg)`, background: roof, filter: f}} />}
			{/* front wall */}
			<div style={{position: 'absolute', left: 0, top: 0, width: w / r, height: h / r, transformOrigin: '0 0', transform: `translate3d(${x - w / 2}px, ${y - h}px, ${z}px)${r > 1 ? ` scale(${r})` : ''}`, filter: f}}>
				<svg width={w / r} height={h / r} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					{children}
				</svg>
			</div>
		</>
	);
};
