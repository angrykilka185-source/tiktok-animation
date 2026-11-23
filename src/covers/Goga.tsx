// Гога — the character sheet (1920×1080, the white style of the channel): Чоби and his brother Гога side by side (Чоби
// explains, Гога goes through it all), and Гога in the heat of the desert and in the icy water.
// Render: npx remotion still GogaSheet out/cover/goga.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {type ArmSpec, Choby} from '../components/Choby';
import {Goga} from '../components/Goga';
import {HEAVY} from '../components/Overlays';

const INK = '#1d2024';

// the name as a sticker: a 3D body, a white edge with a soft shadow, a shine on the upper part of the letters
const Name: React.FC<{x: number; y: number; size: number; text: string; face: string; side: string; deep: string; id: string}> = ({x, y, size, text, face, side, deep, id}) => {
	const D = Math.round(size * 0.05);
	const font = {fontFamily: HEAVY, fontWeight: 900, fontSize: size, textAnchor: 'middle' as const};
	const t = (key: string, dx: number, dy: number, props: React.SVGProps<SVGTextElement>) => (
		<text key={key} x={x + dx} y={y + dy} {...font} {...props}>
			{text}
		</text>
	);
	return (
		<g>
			<defs>
				<clipPath id={`${id}c`}>{t('c', 0, 0, {})}</clipPath>
				<filter id={`${id}s`} x="-10%" y="-40%" width="120%" height="190%" colorInterpolationFilters="sRGB">
					<feGaussianBlur in="SourceAlpha" stdDeviation={12} />
					<feOffset dx={0} dy={14} result="b" />
					<feFlood floodColor="#3a1a00" floodOpacity={0.28} />
					<feComposite in2="b" operator="in" />
					<feMerge>
						<feMergeNode />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<g filter={`url(#${id}s)`}>
				{t('w0', 0, 0, {fill: '#fff', stroke: '#fff', strokeWidth: size * 0.14, strokeLinejoin: 'round'})}
				{t('w1', D, D, {fill: '#fff', stroke: '#fff', strokeWidth: size * 0.14, strokeLinejoin: 'round'})}
			</g>
			{Array.from({length: D}).map((_, i) => t(`d${i}`, D - i, D - i, {fill: i < 2 ? deep : side}))}
			{t('f', 0, 0, {fill: face})}
			<rect x={x - size * 3} y={y - size * 0.74} width={size * 6} height={size * 0.3} fill="#ffffff" opacity={0.2} clipPath={`url(#${id}c)`} />
		</g>
	);
};

const Pill: React.FC<{x: number; y: number; bg: string; children: React.ReactNode; size?: number}> = ({x, y, bg, children, size = 30}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', background: bg, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: size, padding: '10px 24px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,0.16)', border: '5px solid #fff'}}>
		{children}
	</div>
);

// an empty flask, tilted over his mouth: the last drop
const EmptyFlask: React.FC = () => (
	<g transform="rotate(-140)">
		<rect x={-26} y={-30} width={52} height={74} rx={18} fill="#9fb1c6" stroke={INK} strokeWidth={5} />
		<rect x={-26} y={-6} width={52} height={22} fill="#6f8398" opacity={0.6} />
		<rect x={-11} y={-48} width={22} height={20} rx={5} fill="#5a6676" stroke={INK} strokeWidth={4} />
		<path d="M 0,-74 C 7,-64 7,-58 0,-56 C -7,-58 -7,-64 0,-74 Z" fill="#6cb8ff" transform="rotate(180 0 -65)" />
	</g>
);

const sun = (cx: number, cy: number) => (
	<g>
		<circle cx={cx} cy={cy} r={86} fill="#fff1b0" opacity={0.6} />
		<circle cx={cx} cy={cy} r={56} fill="#ffd23a" />
		{Array.from({length: 10}).map((_, k) => {
			const a = (k / 10) * Math.PI * 2;
			return <line key={k} x1={cx + Math.cos(a) * 70} y1={cy + Math.sin(a) * 70} x2={cx + Math.cos(a) * 96} y2={cy + Math.sin(a) * 96} stroke="#ffc21a" strokeWidth={9} strokeLinecap="round" />;
		})}
	</g>
);

const flake = (x: number, y: number, r: number, k: number) => (
	<g key={k} transform={`translate(${x},${y}) rotate(${k * 17})`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round">
		<path d={`M 0,${-r} L 0,${r} M ${-r * 0.87},${-r / 2} L ${r * 0.87},${r / 2} M ${-r * 0.87},${r / 2} L ${r * 0.87},${-r / 2}`} />
	</g>
);

// a card: a rounded window with a white edge and a soft shadow
const Card: React.FC<{x: number; y: number; w: number; h: number; id: string; top: string; bottom: string; children: React.ReactNode}> = ({x, y, w, h, id, top, bottom, children}) => (
	<g>
		<defs>
			<linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={top} />
				<stop offset="1" stopColor={bottom} />
			</linearGradient>
			<clipPath id={`${id}k`}>
				<rect x={x} y={y} width={w} height={h} rx={36} />
			</clipPath>
			<filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%">
				<feDropShadow dx={0} dy={14} stdDeviation={16} floodColor="#2a2030" floodOpacity={0.16} />
			</filter>
		</defs>
		<rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={44} fill="#fff" filter={`url(#${id}f)`} />
		<g clipPath={`url(#${id}k)`}>
			<rect x={x} y={y} width={w} height={h} fill={`url(#${id}g)`} />
			{children}
		</g>
	</g>
);

const HUG_R: ArmSpec = {el: [100, -318], ha: [18, -345], hang: 108, fist: true};
const HUG_L: ArmSpec = {el: [-100, -318], ha: [-18, -345], hang: -108, fist: true};

export const GogaSheet: React.FC = () => (
	<AbsoluteFill style={{background: '#ffffff'}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			<defs>
				<radialGradient id="gsGlow" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} />
					<stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
				</radialGradient>
			</defs>
			{/* pale squares of an exercise book */}
			<g stroke="#e9f0f7" strokeWidth={2}>
				{Array.from({length: 41}).map((_, k) => (
					<line key={`v${k}`} x1={k * 48} y1={0} x2={k * 48} y2={1080} />
				))}
				{Array.from({length: 24}).map((_, k) => (
					<line key={`h${k}`} x1={0} y1={k * 48} x2={1920} y2={k * 48} />
				))}
			</g>
			<ellipse cx={540} cy={640} rx={560} ry={430} fill="url(#gsGlow)" />
			{/* the brothers */}
			<ellipse cx={300} cy={936} rx={150} ry={20} fill="#000" opacity={0.1} />
			<ellipse cx={760} cy={936} rx={160} ry={20} fill="#000" opacity={0.1} />
			<Choby x={300} y={930} s={0.8} armR="pointer" pointerAng={58} armL="hip" look={[0.75, 0.05]} jaw={0.3} tilt={4} />
			<Goga x={760} y={930} s={0.84} armR="wave" armL="hip" brows={1} jaw={0.45} look={[-0.15, 0.05]} tilt={-4} f={6} />
			{/* in the heat of the desert */}
			<Card x={1118} y={300} w={360} h={560} id="gsHot" top="#ffe7b8" bottom="#ffb45a">
				{sun(1400, 380)}
				<path d="M 1118,760 C 1220,720 1330,740 1478,700 L 1478,860 L 1118,860 Z" fill="#f2a24a" />
				<path d="M 1118,800 C 1250,770 1360,800 1478,770 L 1478,860 L 1118,860 Z" fill="#e48a34" />
				{[0, 1, 2].map((k) => (
					<path key={k} d={`M ${1160 + k * 26},${560 - k * 10} q 10,-14 0,-28 q -10,-14 0,-28`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
				))}
				<ellipse cx={1298} cy={826} rx={96} ry={13} fill="#000" opacity={0.14} />
				<Goga x={1298} y={822} s={0.6} brows={-1} hot={1} sweat={1} f={9} jaw={0.55} blink={0.32} look={[0.2, 0.3]} armR={{el: [150, -404], ha: [204, -498], hang: 200, item: <EmptyFlask />}} armL="down" tilt={6} />
			</Card>
			{/* in the icy water */}
			<Card x={1514} y={300} w={360} h={560} id="gsCold" top="#eef7ff" bottom="#b9dcff">
				{[
					[1560, 380, 14],
					[1830, 350, 11],
					[1600, 520, 9],
					[1846, 560, 13],
					[1700, 340, 8],
					[1560, 700, 10],
				].map(([fx, fy, r], k) => flake(fx, fy, r, k))}
				<path d="M 1514,770 C 1600,752 1700,780 1874,756 L 1874,860 L 1514,860 Z" fill="#7fb4ea" />
				<path d="M 1514,800 C 1640,786 1740,806 1874,790 L 1874,860 L 1514,860 Z" fill="#5f98d6" />
				<ellipse cx={1694} cy={826} rx={96} ry={13} fill="#000" opacity={0.12} />
				<Goga x={1694} y={822} s={0.6} brows={-1} frost={0.85} cold={1} shiver={0.7} f={5} jaw={0.2} look={[0, 0.2]} armR={HUG_R} armL={HUG_L} />
			</Card>
			{/* the name */}
			<Name x={560} y={168} size={150} text="ГОГА" face="#e8413f" side="#ff9a2e" deep="#b85a0a" id="gsName" />
		</svg>
		<div style={{position: 'absolute', left: 560, top: 236, transform: 'translate(-50%,-50%)', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap', letterSpacing: 1}}>
			брат Чоби
		</div>
		<Pill x={300} y={1000} bg={INK} size={28}>
			ЧОБИ — ОБЪЯСНЯЕТ
		</Pill>
		<Pill x={760} y={1000} bg="#e8413f" size={28}>
			ГОГА — ПРОХОДИТ ЧЕРЕЗ ВСЁ
		</Pill>
		<div style={{position: 'absolute', left: 1496, top: 228, transform: 'translate(-50%,-50%)', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>
			НА НЁМ ВСЁ И ПРОИСХОДИТ
		</div>
		<Pill x={1298} y={300} bg="#f07a1a" size={28}>
			ЖАРА · +45°
		</Pill>
		<Pill x={1694} y={300} bg="#2f86e0" size={28}>
			ХОЛОД · −2°
		</Pill>
	</AbsoluteFill>
);
