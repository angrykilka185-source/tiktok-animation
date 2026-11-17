// Cover for the long video «Папа вернулся с вахты» (all 7 parts as one film):
// YouTube thumbnail 1280×720 and a vertical 1080×1920 version.
// The fake dad (same close-up face as in part 1, shot 15) and the scared son.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {Bust} from '../components/Person';
import {GlobalDefs} from '../components/Set';

const RED = '#ff3b30';
const YELLOW = '#ffd34a';

type L = {
	w: number;
	h: number;
	glow: string; // radial glow behind "dad"
	dad: {x: number; y: number; s: number};
	son: {x: number; y: number; s: number};
	text: React.CSSProperties;
	title: number;
	big: number;
	badge: number;
};

const LAYOUT: Record<'h' | 'v', L> = {
	h: {
		w: 1280,
		h: 720,
		glow: 'radial-gradient(circle at 75% 40%, #7a1216 0%, #3a080c 30%, #0c0609 62%, #05060b 100%)',
		dad: {x: 965, y: 300, s: 1.75},
		son: {x: 330, y: 572, s: 1.42},
		text: {top: 34, left: 46, width: 640},
		title: 34,
		big: 124,
		badge: 38,
	},
	v: {
		w: 1080,
		h: 1920,
		glow: 'radial-gradient(circle at 60% 52%, #7a1216 0%, #3a080c 30%, #0c0609 62%, #05060b 100%)',
		dad: {x: 640, y: 1010, s: 3.0},
		son: {x: 270, y: 1640, s: 2.2},
		text: {top: 120, left: 0, width: 1080, textAlign: 'center'},
		title: 46,
		big: 178,
		badge: 52,
	},
};

const Cover: React.FC<{v: 'h' | 'v'}> = ({v}) => {
	const L = LAYOUT[v];
	return (
		<AbsoluteFill style={{background: L.glow, overflow: 'hidden'}}>
			<svg width={L.w} height={L.h} viewBox={`0 0 ${L.w} ${L.h}`} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				{/* "dad": dead stare straight at you, a wide grin, head slightly tilted */}
				<g transform={`rotate(-4 ${L.dad.x} ${L.dad.y})`}>
					<Bust
						kind="dad"
						id={`cov${v}dad`}
						x={L.dad.x}
						y={L.dad.y}
						scale={L.dad.s}
						face={{eyes: 'stare', mouth: 'grin', look: [0, 0.15], pupil: 0.4, brows: 'flat', stubble: true, blush: false}}
					/>
				</g>
				{/* horror light on him: red multiply, dark from above and from below */}
				<rect x={0} y={0} width={L.w} height={L.h} fill="#b3001b" opacity={0.3} style={{mixBlendMode: 'multiply'}} />
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#cov${v}top)`} />
				<defs>
					<linearGradient id={`cov${v}top`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity={0.75} />
						<stop offset="0.38" stopColor="#000" stopOpacity={0} />
					</linearGradient>
					<linearGradient id={`cov${v}fade`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0.55" stopColor="#05060b" stopOpacity={0} />
						<stop offset="1" stopColor="#05060b" stopOpacity={0.85} />
					</linearGradient>
					<radialGradient id={`cov${v}vig`} cx="0.5" cy="0.5" r="0.75">
						<stop offset="0.55" stopColor="#000" stopOpacity={0} />
						<stop offset="1" stopColor="#000" stopOpacity={0.75} />
					</radialGradient>
				</defs>
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#cov${v}fade)`} />
				<Bust
					kind="son"
					id={`cov${v}son`}
					x={L.son.x}
					y={L.son.y}
					scale={L.son.s}
					face={{eyes: 'wide', pupil: 0.35, look: [0.85, -0.45], brows: 'worried', mouth: 'o', sweat: 1, blush: false}}
				/>
				<rect x={0} y={0} width={L.w} height={L.h} fill={`url(#cov${v}vig)`} />
			</svg>
			<div style={{position: 'absolute', ...L.text, fontFamily: HEAVY, fontWeight: 900, lineHeight: 1}}>
				<div style={{fontSize: L.title, letterSpacing: v === 'h' ? 5 : 7, color: '#fff', textShadow: '0 3px 0 #000'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: L.big, lineHeight: 0.92, color: RED, marginTop: v === 'h' ? 14 : 24, textShadow: '0 8px 0 #000, 0 0 36px rgba(0,0,0,0.8)'}}>
					ЭТО НЕ
					<br />
					ПАПА
				</div>
				<div
					style={{
						display: 'inline-block',
						marginTop: v === 'h' ? 22 : 40,
						background: YELLOW,
						color: '#111',
						borderRadius: 14,
						padding: v === 'h' ? '10px 24px' : '14px 36px',
						fontSize: L.badge,
						boxShadow: '0 6px 0 #000',
						transform: 'rotate(-2deg)',
					}}
				>
					ВСЕ 7 ЧАСТЕЙ
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const CoverPapaFilm: React.FC = () => <Cover v="h" />;
export const CoverPapaFilmV: React.FC = () => <Cover v="v" />;
