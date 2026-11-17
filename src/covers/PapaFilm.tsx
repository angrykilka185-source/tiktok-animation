// Cover for the long video «Папа вернулся с вахты» (all parts as one film):
// YouTube thumbnail 1280×720 and a vertical 1080×1920 version.
// Big «ВАХТА», small «ВСЕ СЕРИИ»; "dad" (the close-up face from part 1, shot 15, with a dead stare
// and a grin, lit red) stands in the night hallway against the open front door — he has just come back;
// the scared son in the corner.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {Bust, Person} from '../components/Person';
import {Baseboard, DoorFrame, GlobalDefs, PlankFloor, Wallpaper} from '../components/Set';

const RED = '#ff3b30';
const YELLOW = '#ffd34a';

type L = {
	w: number;
	h: number;
	door: {cx: number; top: number; k: number}; // where the front door lands (scene door: x 330..710, top 560, floor 1260)
	dad: {x: number; y: number; s: number}; // y = feet (the head centre is 1024·s above)
	son: {x: number; y: number; s: number};
	text: React.CSSProperties;
	big: number;
	small: number;
};

const LAYOUT: Record<'h' | 'v', L> = {
	h: {
		w: 1280,
		h: 720,
		door: {cx: 990, top: 34, k: 1.15},
		dad: {x: 990, y: 222 + 1024 * 0.85, s: 0.85},
		son: {x: 330, y: 572, s: 1.42},
		text: {top: 64, left: 40, width: 760},
		big: 140,
		small: 40,
	},
	v: {
		w: 1080,
		h: 1920,
		door: {cx: 640, top: 520, k: 1.9},
		dad: {x: 640, y: 813 + 1024 * 1.45, s: 1.45},
		son: {x: 270, y: 1640, s: 2.2},
		text: {top: 120, left: 0, width: 1080, textAlign: 'center'},
		big: 190,
		small: 56,
	},
};

// the night hallway with the front door wide open; cold-warm stairwell light pours in behind "dad"
// (door = where the scene door lands: x 330..710, top 560, floor 1260; w × h = the picture it fills)
export const NightDoor: React.FC<{id: string; door: {cx: number; top: number; k: number}; w: number; h: number}> = ({id, door, w, h}) => {
	const {cx, top, k} = door;
	const T = `translate(${cx - 520 * k},${top - 560 * k}) scale(${k})`;
	return (
		<g>
			<defs>
				<linearGradient id={`${id}-stair`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff4d6" />
					<stop offset="0.55" stopColor="#f4d79a" />
					<stop offset="1" stopColor="#b98a52" />
				</linearGradient>
				<linearGradient id={`${id}-spill`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#f4d79a" stopOpacity={0.55} />
					<stop offset="1" stopColor="#f4d79a" stopOpacity={0} />
				</linearGradient>
				<radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#ff9f45" stopOpacity={0.4} />
					<stop offset="1" stopColor="#ff9f45" stopOpacity={0} />
				</radialGradient>
			</defs>
			<g transform={T}>
				<Wallpaper id={`${id}-wp`} x={-2000} y={-1500} w={5000} h={2760} />
				<PlankFloor y={1260} />
				<Baseboard y={1260} />
				<DoorFrame x={330} y={560} w={380} h={700} open={1} />
			</g>
			{/* night */}
			<rect x={0} y={0} width={w} height={h} fill="#121a42" opacity={0.92} style={{mixBlendMode: 'multiply'}} />
			{/* the doorway stays lit: stairwell light, a spill on the floor and a halo around the frame */}
			<g transform={T}>
				<rect x={330} y={560} width={338} height={700} fill={`url(#${id}-stair)`} />
				<path d="M 330,1262 L 668,1262 L 900,1700 L 120,1700 Z" fill={`url(#${id}-spill)`} />
				<ellipse cx={520} cy={900} rx={440} ry={560} fill={`url(#${id}-halo)`} style={{mixBlendMode: 'screen'}} />
			</g>
		</g>
	);
};

const Cover: React.FC<{v: 'h' | 'v'}> = ({v}) => {
	const L = LAYOUT[v];
	const id = `cov${v}`;
	return (
		<AbsoluteFill style={{background: '#05060b', overflow: 'hidden'}}>
			<svg width={L.w} height={L.h} viewBox={`0 0 ${L.w} ${L.h}`} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<defs>
					{/* "dad" lit red (the look of the first cover) — only him, the hallway stays night-blue */}
					<filter id={`${id}-red`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values="0.92 0 0 0 0  0 0.68 0 0 0  0 0 0.7 0 0  0 0 0 1 0" />
					</filter>
					<linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity={0.55} />
						<stop offset="0.35" stopColor="#000" stopOpacity={0} />
					</linearGradient>
					<linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#03040a" stopOpacity={v === 'h' ? 0.7 : 0} />
						<stop offset="0.5" stopColor="#03040a" stopOpacity={0} />
					</linearGradient>
					<linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0.6" stopColor="#05060b" stopOpacity={0} />
						<stop offset="1" stopColor="#05060b" stopOpacity={0.8} />
					</linearGradient>
					<radialGradient id={`${id}-vig`} cx="0.5" cy="0.5" r="0.75">
						<stop offset="0.55" stopColor="#000" stopOpacity={0} />
						<stop offset="1" stopColor="#000" stopOpacity={0.7} />
					</radialGradient>
				</defs>
				<NightDoor id={`${id}-door`} door={L.door} w={L.w} h={L.h} />
				{/* "dad" stands in the doorway: dead stare straight at you, a wide grin, head slightly tilted */}
				<g filter={`url(#${id}-red)`}>
					<Person
						kind="dad"
						id={`${id}dad`}
						x={L.dad.x}
						y={L.dad.y}
						scale={L.dad.s}
						headTilt={-6}
						face={{eyes: 'stare', mouth: 'grin', look: [0, 0.15], pupil: 0.4, brows: 'flat', stubble: true, blush: false}}
					/>
				</g>
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#${id}-top)`} />
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#${id}-left)`} />
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#${id}-fade)`} />
				<Bust
					kind="son"
					id={`${id}son`}
					x={L.son.x}
					y={L.son.y}
					scale={L.son.s}
					face={{eyes: 'wide', pupil: 0.35, look: [0.85, -0.45], brows: 'worried', mouth: 'o', sweat: 1, blush: false}}
				/>
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#${id}-vig)`} />
			</svg>
			<div style={{position: 'absolute', ...L.text, fontFamily: HEAVY, fontWeight: 900, lineHeight: 1}}>
				<div style={{fontSize: L.big, letterSpacing: -1, color: RED, textShadow: '0 9px 0 #000, 0 0 40px rgba(0,0,0,0.85)'}}>«ВАХТА»</div>
				<div
					style={{
						display: 'inline-block',
						marginTop: v === 'h' ? 18 : 30,
						marginLeft: v === 'h' ? 8 : 0,
						background: YELLOW,
						color: '#111',
						borderRadius: 14,
						padding: v === 'h' ? '9px 24px' : '14px 36px',
						fontSize: L.small,
						letterSpacing: 2,
						boxShadow: '0 6px 0 #000',
					}}
				>
					ВСЕ СЕРИИ
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const CoverPapaFilm: React.FC = () => <Cover v="h" />;
export const CoverPapaFilmV: React.FC = () => <Cover v="v" />;
