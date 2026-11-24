// Covers (YouTube thumbnails, 1280×720) for «Каково это — оказаться погребённым заживо» — two to test against each
// other (YouTube Studio → «Тестирование обложек»):
//   CoverZakopan  — we look down into the coffin: Гога on the satin pillow, eyes wide, the lit lighter in his hand
//                   (the warm light on his face), his other palm pressed against the lid, earth trickling in through a
//                   crack; the title on the left «КАКОВО ЭТО — / ПОХОРОНЕН / ЗАЖИВО», the chip «2 ЧАСА ВОЗДУХА».
//   CoverZakopanB — the grave in section: the night, the mound and the marker, Чоби on top with his palm up
//                   («СТОП, ГОГА!»), two metres of earth, and deep down the coffin with Гога lit by the lighter.
// Render: npx remotion still CoverZakopan out/cover/zakopan-a.png --scale=1.5   (→ 1920×1080)
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

// the title on the left: «КАКОВО ЭТО —» small, «ПОХОРОНЕН» white and «ЗАЖИВО» red, each big line with a dark 3D edge;
// the widths are fixed (textLength, the glyphs a little condensed) so the layout is exact
const Title: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
	const fit = {lengthAdjust: 'spacingAndGlyphs' as const, strokeLinejoin: 'round' as const};
	return (
		<g fontFamily={HEAVY} fontWeight={900}>
			<text x={x + 4} y={y} fontSize={50} textLength={w * 0.74} {...fit} fill="#ffffff" stroke={INK} strokeWidth={10} paintOrder="stroke">
				КАКОВО ЭТО —
			</text>
			<text x={x} y={y + 124} fontSize={104} textLength={w} {...fit} fill={INK} stroke={INK} strokeWidth={14}>
				ПОХОРОНЕН
			</text>
			<text x={x} y={y + 116} fontSize={104} textLength={w} {...fit} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke">
				ПОХОРОНЕН
			</text>
			<text x={x - 2} y={y + 270} fontSize={150} textLength={w} {...fit} fill={RED_D} stroke={RED_D} strokeWidth={16}>
				ЗАЖИВО
			</text>
			<text x={x - 2} y={y + 260} fontSize={150} textLength={w} {...fit} fill={RED} stroke="#ffffff" strokeWidth={8} paintOrder="stroke">
				ЗАЖИВО
			</text>
		</g>
	);
};

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

// ============================================================ A: we look down into the coffin =====
export const CoverZakopan: React.FC = () => {
	const CX = 960;
	const CY = 380;
	const s = 0.98;
	const FEET = CY + 470; // his feet (out of the frame); his head on the pillow near the top of the coffin
	// the coffin from above: narrow head end, wide shoulders, the foot end below the frame
	const outer = `M ${CX - 128},${CY - 330} L ${CX + 128},${CY - 330} L ${CX + 262},${CY - 170} L ${CX + 176},${CY + 520} L ${CX - 176},${CY + 520} L ${CX - 262},${CY - 170} Z`;
	const inner = `M ${CX - 104},${CY - 302} L ${CX + 104},${CY - 302} L ${CX + 230},${CY - 160} L ${CX + 150},${CY + 520} L ${CX - 150},${CY + 520} L ${CX - 230},${CY - 160} Z`;
	const lining = `M ${CX - 86},${CY - 280} L ${CX + 86},${CY - 280} L ${CX + 204},${CY - 150} L ${CX + 130},${CY + 520} L ${CX - 130},${CY + 520} L ${CX - 204},${CY - 150} Z`;
	// the lighter in his right hand, the left palm pressed against the lid
	const flame: [number, number] = [CX + 196, CY - 214];
	const LIGHT: ArmSpec = {el: [150, -360], ha: [196, -486], hang: 190, fist: true, item: <Lighter f={9} lit={1} s={0.62} />, itemAng: 0};
	const PALM: ArmSpec = {el: [-150, -372], ha: [-196, -520], hang: -192};
	return (
		<AbsoluteFill style={{background: SOIL, overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="cza-light" cx={flame[0]} cy={flame[1]} r={560} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#ffb547" stopOpacity={0.55} />
						<stop offset="0.35" stopColor="#ff9a2a" stopOpacity={0.22} />
						<stop offset="1" stopColor="#ff9a2a" stopOpacity={0} />
					</radialGradient>
					<radialGradient id="cza-dark" cx={flame[0] - 120} cy={flame[1] + 120} r={900} gradientUnits="userSpaceOnUse">
						<stop offset="0.35" stopColor="#000" stopOpacity={0} />
						<stop offset="1" stopColor="#000" stopOpacity={0.7} />
					</radialGradient>
					<clipPath id="cza-in">
						<path d={lining} />
					</clipPath>
				</defs>
				<Earth seed={3} />
				{/* the coffin: the boards, the satin lining with its pleats, the pillow */}
				<g transform={`rotate(-5 ${CX} ${CY})`}>
					<path d={outer} fill="#6e4224" stroke="#1c0f06" strokeWidth={8} strokeLinejoin="round" />
					<path d={outer} fill="none" stroke="#8a5630" strokeWidth={3} transform={`translate(0,4)`} opacity={0.6} />
					<path d={inner} fill="#4a2c16" />
					<path d={lining} fill="#efe3c6" />
					<g clipPath="url(#cza-in)">
						{Array.from({length: 22}).map((_, k) => (
							<path key={k} d={`M ${CX - 260 + k * 26},${CY - 300} q 10,300 -4,820`} stroke="#d9c79f" strokeWidth={6} fill="none" opacity={0.7} />
						))}
						<rect x={CX - 150} y={CY - 290} width={300} height={720} fill="#f6ecd4" opacity={0.35} />
					</g>
					<ellipse cx={CX} cy={CY - 236} rx={150} ry={70} fill="#fbf3df" stroke="#cdb98e" strokeWidth={4} />
					{/* Гога: eyes wide, the light of the lighter on his face */}
					<You x={CX} y={FEET} s={s} f={50} blink={0} face={{eyes: 'wide', brows: 'worried', mouth: 'o', look: [0.25, -0.15], sweat: 1}} armR={LIGHT} armL={PALM} />
				</g>
				{/* earth trickling down onto him from above (through the lid we look through) */}
				{Array.from({length: 26}).map((_, i) => {
					const t = rnd(i + 700);
					return <circle key={i} cx={CX - 214 + (rnd(i + 710) - 0.5) * 36 + t * 26} cy={-10 + t * 300} r={3 + rnd(i + 720) * 6} fill={i % 3 ? '#7a5230' : '#5a3a1e'} />;
				})}
				<rect x={0} y={0} width={1280} height={720} fill="url(#cza-light)" />
				<rect x={0} y={0} width={1280} height={720} fill="url(#cza-dark)" />
				<Title x={44} y={128} w={600} />
				<AirChip x={48} y={560} />
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
				<Title x={40} y={300} w={560} />
			</svg>
		</AbsoluteFill>
	);
};
