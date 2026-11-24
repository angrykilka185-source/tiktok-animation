// Covers for «Каково это — оказаться погребённым заживо»: the caption «ОН ЖИВ!», Гога big in the coffin.
//   CoverZakopanV — vertical 1080×1920 (TikTok, Shorts): we look down into the coffin, Гога on the satin pillow almost
//                   the whole height, eyes wide with fear, the lit lighter in his hand (the warm light on his face), his
//                   other palm pressed against the lid, earth trickling down; «ОН ЖИВ!» above, «2 ЧАСА ВОЗДУХА» below.
//   CoverZakopan  — the same for YouTube, 1280×720: «ОН / ЖИВ!» on the left, an arrow to his face.
//   CoverZakopanB — the grave in section (night, the mound, Чоби on top, two metres of earth, the coffin deep down).
// Render: npx remotion still CoverZakopanV out/cover/zakopan-v.png
//         npx remotion still CoverZakopan out/cover/zakopan-a.png --scale=1.5   (→ 1920×1080)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Choby, type ArmSpec} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {arm, Coffin, COFFIN, G, inCoffin, Lighter, Marker, You} from '../z3/kit';

const RED = '#ff3b30';
const RED_D = '#7a0d0a';
const INK = '#16161c';
const SOIL = '#24160b';

const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

// the earth: dark soil with stones, pebbles and roots (deterministic)
const Earth: React.FC<{w?: number; h?: number; y0?: number; seed?: number}> = ({w = 1280, h = 720, y0 = 0, seed = 1}) => (
	<g>
		<rect x={0} y={y0} width={w} height={h - y0} fill={SOIL} />
		{/* darker and lighter layers */}
		{[0.22, 0.5, 0.78].map((t, k) => (
			<path key={k} d={`M 0,${y0 + (h - y0) * t} C ${w * 0.3},${y0 + (h - y0) * t - 26} ${w * 0.6},${y0 + (h - y0) * t + 30} ${w},${y0 + (h - y0) * t - 10} L ${w},${y0 + (h - y0) * t + 60} C ${w * 0.6},${y0 + (h - y0) * t + 90} ${w * 0.3},${y0 + (h - y0) * t + 30} 0,${y0 + (h - y0) * t + 60} Z`} fill={k % 2 ? '#2d1c0e' : '#1c1108'} opacity={0.8} />
		))}
		{Array.from({length: 70}).map((_, i) => {
			const x = rnd(seed + i) * w;
			const y = y0 + rnd(seed + i + 100) * (h - y0);
			const r = 3 + rnd(seed + i + 200) * 11;
			return <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill={i % 3 ? '#3a2614' : '#4a3420'} opacity={0.9} transform={`rotate(${rnd(seed + i + 300) * 60 - 30} ${x} ${y})`} />;
		})}
		{/* roots */}
		{Array.from({length: 7}).map((_, i) => {
			const x = rnd(seed + i + 400) * w;
			const y = y0 + rnd(seed + i + 500) * (h - y0) * 0.7;
			const L = 60 + rnd(seed + i + 600) * 90;
			return <path key={i} d={`M ${x},${y} q ${L * 0.3},${L * 0.4} ${L * 0.1},${L} m ${-L * 0.05},${-L * 0.55} q ${-L * 0.3},${L * 0.1} ${-L * 0.4},${L * 0.35}`} stroke="#5a3a1e" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />;
		})}
	</g>
);

// the chip: a stopwatch and «2 ЧАСА ВОЗДУХА»
const AirChip: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y}) rotate(-3)`}>
		<rect x={0} y={-40} width={470} height={84} rx={20} fill={INK} stroke="#ffffff" strokeWidth={5} />
		<g transform="translate(46,2)">
			<circle r={26} fill="#ffffff" />
			<circle r={20} fill="none" stroke={RED} strokeWidth={5} />
			<rect x={-6} y={-36} width={12} height={10} rx={3} fill="#ffffff" />
			<path d="M 0,-12 L 0,0 L 9,6" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
		</g>
		<text x={88} y={15} fontFamily={HEAVY} fontWeight={900} fontSize={40} textLength={356} lengthAdjust="spacingAndGlyphs" fill="#ffffff">
			2 ЧАСА ВОЗДУХА
		</text>
	</g>
);

// ---------------------------------------------------------- the coffin seen from above, Гога in it -----
// in its own units: the coffin's centre at (0, 0), the head end at y −330, the foot end at +520 (out of the frames)
const OUTER = 'M -128,-330 L 128,-330 L 262,-170 L 176,520 L -176,520 L -262,-170 Z';
const INNER = 'M -104,-302 L 104,-302 L 230,-160 L 150,520 L -150,520 L -230,-160 Z';
const LINING = 'M -86,-280 L 86,-280 L 204,-150 L 130,520 L -130,520 L -204,-150 Z';
const TILT = -5;
// the warm light (between the flame and his face), in the coffin's units after its tilt
const LIGHT_AT: [number, number] = (() => {
	const [x, y] = [170, -150];
	const a = (TILT * Math.PI) / 180;
	return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
})();
// the lighter in his right hand, the left palm pressed against the lid
const LIGHT: ArmSpec = {el: [150, -360], ha: [196, -486], hang: 190, fist: true, item: <Lighter f={9} lit={1} s={0.62} />, itemAng: 0};
const PALM: ArmSpec = {el: [-150, -372], ha: [-196, -520], hang: -192};
const CoffinGoga: React.FC<{id: string}> = ({id}) => (
	<g transform={`rotate(${TILT})`}>
		<defs>
			<clipPath id={`${id}in`}>
				<path d={LINING} />
			</clipPath>
		</defs>
		{/* the boards, the satin lining with its pleats, the pillow */}
		<path d={OUTER} fill="#6e4224" stroke="#1c0f06" strokeWidth={8} strokeLinejoin="round" />
		<path d={OUTER} fill="none" stroke="#8a5630" strokeWidth={3} transform="translate(0,4)" opacity={0.6} />
		<path d={INNER} fill="#4a2c16" />
		<path d={LINING} fill="#efe3c6" />
		<g clipPath={`url(#${id}in)`}>
			{Array.from({length: 22}).map((_, k) => (
				<path key={k} d={`M ${-260 + k * 26},-300 q 10,300 -4,820`} stroke="#d9c79f" strokeWidth={6} fill="none" opacity={0.7} />
			))}
			<rect x={-150} y={-290} width={300} height={820} fill="#f6ecd4" opacity={0.35} />
		</g>
		<ellipse cx={0} cy={-236} rx={150} ry={70} fill="#fbf3df" stroke="#cdb98e" strokeWidth={4} />
		{/* Гога: eyes wide with fear, the light of the lighter on his face */}
		<You x={0} y={470} s={0.98} f={50} blink={0} face={{eyes: 'wide', brows: 'worried', mouth: 'o', look: [0.25, -0.15], sweat: 1}} armR={LIGHT} armL={PALM} />
		{/* earth trickling down onto him from above */}
		{Array.from({length: 26}).map((_, i) => {
			const t = rnd(i + 700);
			return <circle key={i} cx={-214 + (rnd(i + 710) - 0.5) * 36 + t * 26} cy={-640 + t * 380} r={3 + rnd(i + 720) * 6} fill={i % 3 ? '#7a5230' : '#5a3a1e'} />;
		})}
	</g>
);
// the warm light of the lighter and the darkness round it, for a coffin placed at (cx, cy) at scale k
const Light: React.FC<{id: string; cx: number; cy: number; k: number; w: number; h: number}> = ({id, cx, cy, k, w, h}) => {
	const lx = cx + LIGHT_AT[0] * k;
	const ly = cy + LIGHT_AT[1] * k;
	return (
		<g>
			<defs>
				<radialGradient id={`${id}l`} cx={lx} cy={ly} r={430 * k} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#ffb547" stopOpacity={0.55} />
					<stop offset="0.35" stopColor="#ff9a2a" stopOpacity={0.22} />
					<stop offset="1" stopColor="#ff9a2a" stopOpacity={0} />
				</radialGradient>
				<radialGradient id={`${id}d`} cx={lx - 90 * k} cy={ly + 90 * k} r={Math.max(w, h) * 0.75} gradientUnits="userSpaceOnUse">
					<stop offset="0.35" stopColor="#000" stopOpacity={0} />
					<stop offset="1" stopColor="#000" stopOpacity={0.7} />
				</radialGradient>
			</defs>
			<rect x={0} y={0} width={w} height={h} fill={`url(#${id}l)`} />
			<rect x={0} y={0} width={w} height={h} fill={`url(#${id}d)`} />
		</g>
	);
};

// «ОН ЖИВ!»: white «ОН», red «ЖИВ!» with a white edge; each with a dark 3D edge under it; fixed widths
const AliveWord: React.FC<{x: number; y: number; w: number; size: number; text: string; red?: boolean; anchor?: 'start' | 'middle'}> = ({x, y, w, size, text, red = false, anchor = 'start'}) => {
	const common = {x, fontSize: size, textLength: w, lengthAdjust: 'spacingAndGlyphs' as const, textAnchor: anchor, strokeLinejoin: 'round' as const};
	const d = Math.round(size * 0.07);
	return (
		<g fontFamily={HEAVY} fontWeight={900}>
			<text {...common} y={y + d} fill={red ? RED_D : INK} stroke={red ? RED_D : INK} strokeWidth={size * 0.13}>
				{text}
			</text>
			<text {...common} y={y} fill={red ? RED : '#ffffff'} stroke={red ? '#ffffff' : INK} strokeWidth={size * 0.07} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};
// a hand-drawn arrow: a curve from a to b (through c), a white edge round the red
const Arrow: React.FC<{a: [number, number]; c: [number, number]; b: [number, number]; w?: number}> = ({a, c, b, w = 16}) => {
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

// ============================================================ A: YouTube 16:9 — «ОН ЖИВ!», Гога big in the coffin =====
export const CoverZakopan: React.FC = () => {
	const cx = 905;
	const cy = 478;
	const k = 1.3;
	return (
		<AbsoluteFill style={{background: SOIL, overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<Earth seed={3} />
				<g transform={`translate(${cx},${cy}) scale(${k})`}>
					<CoffinGoga id="cza" />
				</g>
				<Light id="cza" cx={cx} cy={cy} k={k} w={1280} h={720} />
				<AliveWord x={46} y={262} w={300} size={210} text="ОН" />
				<AliveWord x={40} y={500} w={470} size={236} text="ЖИВ!" red />
				<Arrow a={[470, 560]} c={[640, 610]} b={[742, 420]} />
				<AirChip x={46} y={636} />
			</svg>
		</AbsoluteFill>
	);
};

// ============================================================ V: vertical 9:16 (TikTok, Shorts) — «ОН ЖИВ!» over the coffin =====
export const CoverZakopanV: React.FC = () => {
	const cx = 540;
	const cy = 1200;
	const k = 1.95;
	return (
		<AbsoluteFill style={{background: SOIL, overflow: 'hidden'}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
				<Earth w={1080} h={1920} seed={5} />
				<g transform={`translate(${cx},${cy}) scale(${k})`}>
					<CoffinGoga id="czv" />
				</g>
				<Light id="czv" cx={cx} cy={cy} k={k} w={1080} h={1920} />
				<AliveWord x={56} y={470} w={330} size={260} text="ОН" />
				<AliveWord x={420} y={470} w={604} size={260} text="ЖИВ!" red />
				<g transform="translate(188,1600) scale(1.5)">
					<AirChip x={0} y={0} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// ============================================================ B: the grave in section, Чоби on top =====
// the film's section (1920-wide world units) scaled into the cover: the ground at y = 260·K + TY
const K = 0.6;
const TX = 344;
const TY = 82;
export const CoverZakopanB: React.FC = () => {
	const GR = G * K + TY; // the ground line on the cover
	const lidY = COFFIN.y * K + TY;
	const cx = COFFIN.x * K + TX;
	const flame: [number, number] = [cx + 20, lidY + 60];
	const POINT: ArmSpec = {el: [-120, -330], ha: [-176, -250], hang: -40, finger: true};
	return (
		<AbsoluteFill style={{background: '#070b1c', overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="czb-sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#060a1e" />
						<stop offset="1" stopColor="#1f2a58" />
					</linearGradient>
					<radialGradient id="czb-light" cx={flame[0]} cy={flame[1]} r={300} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#ffb547" stopOpacity={0.5} />
						<stop offset="0.5" stopColor="#ff9a2a" stopOpacity={0.15} />
						<stop offset="1" stopColor="#ff9a2a" stopOpacity={0} />
					</radialGradient>
				</defs>
				{/* the night, the stars and the moon; the earth below the grass */}
				<rect x={0} y={0} width={1280} height={GR} fill="url(#czb-sky)" />
				{Array.from({length: 46}).map((_, i) => (
					<circle key={i} cx={rnd(i + 30) * 1280} cy={rnd(i + 60) * (GR - 30)} r={1 + rnd(i + 90) * 2} fill="#ffffff" opacity={0.4 + rnd(i) * 0.5} />
				))}
				<circle cx={1190} cy={66} r={36} fill="#f4f1dc" />
				<Earth y0={GR} seed={11} />
				<rect x={0} y={GR - 8} width={1280} height={14} fill="#2f5a2a" />
				{/* the mound, the marker, the coffin with Гога: the film's own pieces */}
				<g transform={`translate(${TX},${TY}) scale(${K})`}>
					<path d={`M ${COFFIN.x - 380},${G + 6} C ${COFFIN.x - 240},${G - 70} ${COFFIN.x + 240},${G - 70} ${COFFIN.x + 380},${G + 6} Z`} fill="#4a3018" />
					<Marker />
					<Coffin id="czbc" light={0.85}>
						<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
							<You x={0} y={0} s={inCoffin.s} f={50} blink={0} face={{eyes: 'wide', brows: 'worried', mouth: 'o', look: [0, -0.6], sweat: 1}} armR={arm([110, -400], [104, -480], {fist: true, item: <Lighter f={9} lit={1} s={0.7} />, itemAng: 90})} />
						</g>
					</Coffin>
				</g>
				<rect x={0} y={GR} width={1280} height={720 - GR} fill="url(#czb-light)" />
				{/* two metres of earth */}
				<g stroke="#ffffff" strokeWidth={6} strokeLinecap="round" fill="none">
					<path d={`M 690,${GR + 16} L 690,${lidY - 10} M 674,${GR + 34} L 690,${GR + 16} L 706,${GR + 34} M 674,${lidY - 28} L 690,${lidY - 10} L 706,${lidY - 28}`} />
				</g>
				<g transform={`translate(690,${(GR + lidY) / 2})`}>
					<rect x={-54} y={-30} width={108} height={60} rx={14} fill={INK} stroke="#ffffff" strokeWidth={4} />
					<text x={0} y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#ffffff">
						2 М
					</text>
				</g>
				{/* Чоби on the grave, pointing down at it */}
				<ellipse cx={cx + 118} cy={GR - 14} rx={70} ry={11} fill="#000" opacity={0.4} />
				<Choby x={cx + 118} y={GR - 16} s={0.3} jaw={0.5} blink={0} f={9} look={[-0.5, 0.7]} armL={POINT} armR="hip" tilt={-8} />
				<AliveWord x={46} y={420} w={300} size={190} text="ОН" />
				<AliveWord x={40} y={630} w={470} size={214} text="ЖИВ!" red />
			</svg>
		</AbsoluteFill>
	);
};
