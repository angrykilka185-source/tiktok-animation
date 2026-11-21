// «Что будет, если ты попадёшь в СССР» — the flat of 1981 (16:9 art, picture coords 1920×1080 + margins):
// the room with a carpet on the wall and the сервант, the iron alarm clock, the kitchen with the radio, the bathroom,
// the dark stairwell, the living room in the evening with the tube TV.
import React from 'react';
import {Facade} from '../r1/world3d';
import {CarpetArt} from '../r1/sets3d';
import {Glow, rnd} from '../w1/kit';

const SANSB = "'DejaVu Sans', sans-serif";
export const FLOOR = 830; // the floor line of the interiors

// ================================================================ props =======
// the iron alarm clock with two bells; `ring` 0…1 shakes it
export const AlarmClock: React.FC<{x: number; y: number; s?: number; ring?: number; f?: number}> = ({x, y, s = 1, ring = 0, f = 0}) => {
	const jx = ring > 0 ? Math.sin(f * 3.1) * 7 * ring : 0;
	const jr = ring > 0 ? Math.sin(f * 2.3) * 5 * ring : 0;
	const jy = ring > 0 ? -Math.abs(Math.sin(f * 1.7)) * 10 * ring : 0;
	return (
		<g transform={`translate(${x + jx},${y + jy}) rotate(${jr}) scale(${s})`}>
			<path d="M -60,0 L -80,30 M 60,0 L 80,30" stroke="#2a2c30" strokeWidth={10} strokeLinecap="round" />
			<circle cx={-48} cy={-108} r={34} fill="#c9c4b8" stroke="#8a8f96" strokeWidth={5} />
			<circle cx={48} cy={-108} r={34} fill="#c9c4b8" stroke="#8a8f96" strokeWidth={5} />
			<rect x={-6} y={-150} width={12} height={30} fill="#8a8f96" />
			<circle cx={0} cy={-36} r={84} fill="#c8282a" />
			<circle cx={0} cy={-36} r={68} fill="#f4f0e8" />
			{Array.from({length: 12}).map((_, k) => (
				<line key={k} x1={Math.cos((k * Math.PI) / 6) * 56} y1={-36 + Math.sin((k * Math.PI) / 6) * 56} x2={Math.cos((k * Math.PI) / 6) * 64} y2={-36 + Math.sin((k * Math.PI) / 6) * 64} stroke="#2a2c30" strokeWidth={4} />
			))}
			<line x1={0} y1={-36} x2={0} y2={-84} stroke="#2a2c30" strokeWidth={6} strokeLinecap="round" />
			<line x1={0} y1={-36} x2={-30} y2={-36} stroke="#2a2c30" strokeWidth={7} strokeLinecap="round" />
			<circle cx={0} cy={-36} r={6} fill="#2a2c30" />
			{ring > 0 &&
				[0, 1].map((k) => (
					<path key={k} d={`M ${k ? 90 : -90},-130 q ${k ? 20 : -20},-20 ${k ? 10 : -10},-40 M ${k ? 110 : -110},-110 q ${k ? 26 : -26},-20 ${k ? 16 : -16},-50`} stroke="#ffd34a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={ring} />
				))}
		</g>
	);
};

// a wall calendar «МАЙ 1981»
export const WallCal: React.FC<{x: number; y: number; s?: number; day?: string}> = ({x, y, s = 1, day = '15'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={0} y={0} width={180} height={220} fill="#f4f0e8" stroke="#8a8f96" strokeWidth={4} />
		<rect x={0} y={0} width={180} height={46} fill="#c8282a" />
		<text x={90} y={32} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={26} fill="#fff">
			МАЙ 1981
		</text>
		<text x={90} y={150} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={96} fill="#2a2c30">
			{day}
		</text>
		<text x={90} y={196} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={22} fill="#5a5f66">
			ПЯТНИЦА
		</text>
	</g>
);

// crystal in the сервант
const Crystal: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
	k % 3 === 0 ? (
		<path d={`M ${x - 26},${y} L ${x - 34},${y - 70} L ${x + 34},${y - 70} L ${x + 26},${y} Z`} fill="#dfeaf0" stroke="#9fb8c8" strokeWidth={3} />
	) : k % 3 === 1 ? (
		<g>
			<path d={`M ${x - 20},${y - 40} L ${x - 30},${y - 90} L ${x + 30},${y - 90} L ${x + 20},${y - 40} Z`} fill="#dfeaf0" stroke="#9fb8c8" strokeWidth={3} />
			<rect x={x - 4} y={y - 40} width={8} height={34} fill="#dfeaf0" />
			<ellipse cx={x} cy={y - 4} rx={20} ry={6} fill="#dfeaf0" stroke="#9fb8c8" strokeWidth={2} />
		</g>
	) : (
		<ellipse cx={x} cy={y - 30} rx={46} ry={30} fill="#dfeaf0" stroke="#9fb8c8" strokeWidth={3} />
	);
export const Servant: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 520, h = 660}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={0} y={0} width={w} height={h} fill="#5a3420" />
		<rect x={16} y={16} width={w - 32} height={h * 0.52} fill="#3a2214" />
		{[0, 1].map((r) => (
			<g key={r}>
				<rect x={16} y={16 + r * h * 0.26 + h * 0.24} width={w - 32} height={8} fill="#6a4026" />
				{Array.from({length: 5}).map((_, k) => (
					<Crystal key={k} x={70 + k * ((w - 120) / 4)} y={16 + r * h * 0.26 + h * 0.24} k={k + r} />
				))}
			</g>
		))}
		<rect x={16} y={16} width={(w - 32) / 2 - 4} height={h * 0.52} fill="#bcd2de" opacity={0.18} />
		<rect x={w / 2 + 4} y={16} width={(w - 32) / 2 - 4} height={h * 0.52} fill="#bcd2de" opacity={0.18} />
		<rect x={16} y={h * 0.56} width={w - 32} height={h * 0.42} fill="#6a4026" />
		<rect x={30} y={h * 0.6} width={w / 2 - 40} height={h * 0.34} fill="#5a3420" />
		<rect x={w / 2 + 10} y={h * 0.6} width={w / 2 - 40} height={h * 0.34} fill="#5a3420" />
		<circle cx={w / 2 - 20} cy={h * 0.77} r={7} fill="#c9a54a" />
		<circle cx={w / 2 + 20} cy={h * 0.77} r={7} fill="#c9a54a" />
	</g>
);
// a window with tulle, looking at a five-storey block
export const FlatWindow: React.FC<{x: number; y: number; w: number; h: number; night?: number; seed?: number}> = ({x, y, w, h, night = 0, seed = 2}) => (
	<g>
		<rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill="#f4f0e8" />
		<svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
			<rect width={w} height={h} fill={night > 0.5 ? '#141a3a' : '#9fc4e0'} />
			<g transform={`translate(${-w * 0.2},${h * 0.25}) scale(0.5)`}>
				<Facade w={w * 3} h={h * 2} color={night > 0.5 ? '#3a3c48' : '#d6cdb8'} lit={night} seed={seed} cols={9} />
			</g>
		</svg>
		<rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#f4f0e8" />
		<rect x={x} y={y + h * 0.35} width={w} height={10} fill="#f4f0e8" />
		<rect x={x - 40} y={y + h + 20} width={w + 80} height={26} fill="#e8e0d0" />
		<path d={`M ${x - 30},${y - 30} C ${x + w * 0.18},${y + h * 0.4} ${x - 10},${y + h * 0.8} ${x + w * 0.1},${y + h + 20} L ${x - 30},${y + h + 20} Z`} fill="#fff" opacity={0.75} />
		<path d={`M ${x + w + 30},${y - 30} C ${x + w * 0.82},${y + h * 0.4} ${x + w + 10},${y + h * 0.8} ${x + w * 0.9},${y + h + 20} L ${x + w + 30},${y + h + 20} Z`} fill="#fff" opacity={0.75} />
		<rect x={x - 60} y={y - 46} width={w + 120} height={14} fill="#8a6a44" />
	</g>
);
// wallpaper and parquet
const Walls: React.FC<{paper?: string; stripe?: string; floor?: string}> = ({paper = '#d8c89a', stripe = '#c8b47e', floor = '#8a5a34'}) => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill={paper} />
		{Array.from({length: 40}).map((_, k) => (
			<g key={k}>
				<rect x={-800 + k * 90} y={-600} width={30} height={1600} fill={stripe} opacity={0.6} />
				{Array.from({length: 10}).map((__, j) => (
					<circle key={j} cx={-760 + k * 90} cy={-560 + j * 150 + (k % 2) * 75} r={8} fill={stripe} />
				))}
			</g>
		))}
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill={floor} />
		{Array.from({length: 30}).map((_, k) => (
			<path key={k} d={`M ${-800 + k * 120},${FLOOR} L ${-860 + k * 120},${FLOOR + 1000}`} stroke="#6a4026" strokeWidth={4} opacity={0.5} />
		))}
		<rect x={-800} y={FLOOR - 16} width={3600} height={18} fill="#6a4026" />
	</g>
);

// ============================================================ the room =======
export const Room81: React.FC<{night?: number; seed?: number}> = ({night = 0}) => (
	<g>
		<Walls />
		<g transform="translate(140,110)">
			<CarpetArt w={820} h={560} />
		</g>
		<Servant x={1240} y={170} />
		<FlatWindow x={1860} y={140} w={420} h={480} night={night} />
		<WallCal x={1010} y={250} s={1} />
		{/* the sofa-bed */}
		<rect x={110} y={640} width={900} height={60} rx={20} fill="#5a6a8a" />
		<rect x={110} y={690} width={900} height={150} rx={16} fill="#4a5a7a" />
		<rect x={90} y={600} width={50} height={250} rx={14} fill="#3a4a6a" />
		<rect x={980} y={600} width={50} height={250} rx={14} fill="#3a4a6a" />
		{night > 0 && <rect x={-800} y={-600} width={3600} height={2400} fill="#0a1030" opacity={0.5 * night} />}
	</g>
);
// the bedside table (picture coords) — the alarm clock and the phone go on it
export const Tumba: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 110} y={y} width={220} height={22} fill="#6a4026" />
		<rect x={x - 100} y={y + 22} width={200} height={FLOOR - y - 10} fill="#5a3420" />
		<rect x={x - 86} y={y + 40} width={172} height={60} fill="#6a4026" />
		<circle cx={x} cy={y + 70} r={6} fill="#c9a54a" />
	</g>
);
// the phone lying on a table (top view-ish), screen glowing; `msg` shows a notification
export const PhoneFlat: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{glow > 0 && <Glow id={`pf${Math.round(x)}`} x={0} y={-8} r={160} color="#7fb2ff" o={0.6 * glow} />}
		<path d="M -70,0 L 50,0 L 70,-18 L -50,-18 Z" fill="#16171b" />
		<path d="M -62,-3 L 46,-3 L 62,-15 L -46,-15 Z" fill={glow > 0 ? '#7fb2ff' : '#23262e'} />
	</g>
);

// ========================================================== the kitchen ======
export const Kitchen81: React.FC<{f?: number; steam?: number}> = ({f = 0, steam = 0}) => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#e8e0c8" />
		{/* tiles */}
		{Array.from({length: 7}).map((_, r) =>
			Array.from({length: 40}).map((__, c) => <rect key={`${r}-${c}`} x={-800 + c * 90 + 2} y={400 + r * 64 + 2} width={86} height={60} fill={(r + c) % 2 ? '#d8e8e0' : '#e8f2ee'} />),
		)}
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill="#9a7a5a" />
		{Array.from({length: 24}).map((_, k) => (
			<rect key={k} x={-800 + k * 150} y={FLOOR} width={148} height={1000} fill={k % 2 ? '#a8885e' : '#8f6f4f'} />
		))}
		{/* the window */}
		<FlatWindow x={700} y={90} w={460} h={430} />
		{/* the radio («радиоточка») on the wall */}
		<g transform="translate(240,260)">
			<rect x={-90} y={-70} width={180} height={140} rx={18} fill="#e8dcc0" stroke="#bcb39a" strokeWidth={5} />
			{Array.from({length: 6}).map((_, k) => (
				<rect key={k} x={-70} y={-50 + k * 16} width={100} height={8} rx={4} fill="#8a7a5a" />
			))}
			<circle cx={56} cy={-20} r={14} fill="#5a4a3a" />
			<circle cx={56} cy={24} r={14} fill="#5a4a3a" />
			<path d="M 0,70 L 0,140" stroke="#3a3a3a" strokeWidth={4} />
		</g>
		{/* the gas stove */}
		<g transform="translate(1260,560)">
			<rect x={0} y={0} width={320} height={FLOOR - 560} fill="#f4f4f0" stroke="#c9c4b8" strokeWidth={5} />
			<rect x={0} y={-14} width={320} height={20} fill="#3a3a3a" />
			<rect x={30} y={60} width={260} height={150} rx={10} fill="#2a2c30" />
			{[60, 120, 200, 260].map((kx) => (
				<circle key={kx} cx={kx} cy={36} r={12} fill="#2a2c30" />
			))}
			<path d="M 60,-14 L 60,-60 Q 60,-80 110,-80 L 140,-80 Q 160,-80 160,-60 L 160,-14 Z" fill="#c9c4b8" />
			{steam > 0 &&
				[0, 1, 2].map((k) => {
					const t = ((f / 30 + k / 3) % 1);
					return <circle key={k} cx={110 + Math.sin(t * 6 + k) * 20} cy={-100 - t * 160} r={20 + t * 30} fill="#fff" opacity={steam * (1 - t) * 0.6} />;
				})}
		</g>
		{/* the fridge */}
		<g transform="translate(1660,250)">
			<rect x={0} y={0} width={260} height={FLOOR - 250} rx={50} fill="#f4f4f0" stroke="#c9c4b8" strokeWidth={6} />
			<rect x={20} y={200} width={220} height={6} fill="#c9c4b8" />
			<rect x={210} y={240} width={14} height={110} rx={7} fill="#c9c4b8" />
			<text x={130} y={120} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#c9a54a" fontStyle="italic">
				Зил
			</text>
		</g>
		{/* the table with an oilcloth */}
		<rect x={240} y={640} width={760} height={30} fill="#e8f0f8" />
		{Array.from({length: 19}).map((_, k) => (
			<rect key={k} x={240 + k * 40} y={640} width={20} height={30} fill="#4a7ab8" opacity={0.5} />
		))}
		<path d="M 240,670 L 1000,670 L 980,720 L 260,720 Z" fill="#c8d8e8" />
		<rect x={280} y={720} width={22} height={FLOOR - 720} fill="#6a4628" />
		<rect x={940} y={720} width={22} height={FLOOR - 720} fill="#6a4628" />
		{/* the sink with the jars: mustard powder and soda */}
		<rect x={1020} y={560} width={220} height={FLOOR - 560} fill="#d8d4c8" />
		<rect x={1030} y={540} width={200} height={30} fill="#c9c4b8" />
		<g transform="translate(1060,430)">
			<rect x={0} y={0} width={60} height={100} rx={6} fill="#e0b03a" />
			<text x={30} y={60} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={14} fill="#5a3a1e" transform="rotate(-90 30 60)">
				ГОРЧИЦА
			</text>
		</g>
		<g transform="translate(1140,450)">
			<rect x={0} y={0} width={70} height={80} fill="#f4f4f0" stroke="#4a7ab8" strokeWidth={4} />
			<text x={35} y={48} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={18} fill="#4a7ab8">
				СОДА
			</text>
		</g>
	</g>
);
// a plate of porridge, a sandwich, a glass of tea (table-top props, local coords on the table edge)
export const Breakfast: React.FC<{steam?: number; f?: number}> = ({steam = 1, f = 0}) => (
	<g>
		<ellipse cx={0} cy={0} rx={110} ry={26} fill="#f4f4f0" stroke="#c9c4b8" strokeWidth={4} />
		<ellipse cx={0} cy={-6} rx={80} ry={16} fill="#e8d6a0" />
		<rect x={150} y={-30} width={130} height={26} rx={6} fill="#c9843a" />
		<rect x={154} y={-38} width={122} height={12} rx={5} fill="#f4e6a0" />
		<g transform="translate(-200,0)">
			<path d="M -34,-110 L 34,-110 L 28,0 L -28,0 Z" fill="#c87a2a" opacity={0.85} />
			<path d="M -36,-112 L 36,-112 L 30,2 L -30,2 Z" fill="none" stroke="#dfeaf0" strokeWidth={5} />
			{steam > 0 &&
				[0, 1].map((k) => {
					const t = ((f / 26 + k / 2) % 1);
					return <circle key={k} cx={Math.sin(t * 6 + k) * 10} cy={-130 - t * 90} r={12 + t * 14} fill="#fff" opacity={steam * (1 - t) * 0.5} />;
				})}
		</g>
	</g>
);

// ========================================================= the bathroom ======
export const Bath81: React.FC = () => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#bcd8e8" />
		{Array.from({length: 18}).map((_, r) =>
			Array.from({length: 40}).map((__, c) => <rect key={`${r}-${c}`} x={-800 + c * 90 + 2} y={-600 + r * 90 + 2} width={86} height={86} fill={(r + c) % 2 ? '#c8e0ec' : '#b0d0e2'} />),
		)}
		<rect x={600} y={60} width={720} height={420} rx={20} fill="#dfeaf0" stroke="#9fb8c8" strokeWidth={10} />
		<rect x={640} y={100} width={640} height={340} rx={10} fill="#e8f4f8" />
		<path d="M 680,140 L 780,140 L 700,240 Z" fill="#fff" opacity={0.5} />
		<rect x={560} y={560} width={800} height={40} rx={10} fill="#f4f4f0" />
		<path d="M 600,600 L 1320,600 L 1240,760 L 680,760 Z" fill="#f4f4f0" stroke="#c9c4b8" strokeWidth={5} />
		<path d="M 960,520 L 960,580 M 920,520 L 1000,520" stroke="#a8b0b8" strokeWidth={14} strokeLinecap="round" />
	</g>
);
// the round box of tooth powder and the bar of household soap (close-up props)
export const ToothPowder: React.FC<{x: number; y: number; s?: number; open?: number}> = ({x, y, s = 1, open = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={40} rx={130} ry={34} fill="#d8d4c8" />
		<rect x={-130} y={-60} width={260} height={100} fill="#f4f0e8" />
		<ellipse cx={0} cy={-60 - open * 60} rx={130} ry={34} fill="#4a8ac8" />
		<text x={0} y={-50 - open * 60} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={24} fill="#fff">
			ЗУБНОЙ ПОРОШОК
		</text>
		<rect x={-130} y={-20} width={260} height={30} fill="#4a8ac8" opacity={0.25} />
		{open > 0 && <ellipse cx={0} cy={-60} rx={110} ry={26} fill="#fff" />}
	</g>
);
export const Soap: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -150,0 L 130,0 L 160,-40 L -120,-40 Z" fill="#a8783a" />
		<rect x={-150} y={0} width={280} height={90} fill="#8a6a3a" />
		<text x={-10} y={58} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={40} fill="#6a4a1e">
			72%
		</text>
	</g>
);

// ========================================================= the stairwell =====
// dark; the flashlight (`beam` 0…1, aimed at x, y) shows the steps, the railing, the mail boxes and the empty socket
export const Stairwell: React.FC = () => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#5a6a6a" />
		<rect x={-800} y={-600} width={3600} height={700} fill="#c8d0c0" />
		<rect x={-800} y={100} width={3600} height={20} fill="#3a4a4a" />
		{Array.from({length: 9}).map((_, k) => (
			<g key={k}>
				<rect x={700 + k * 120} y={820 - k * 70} width={1400} height={70} fill="#8a8a86" />
				<rect x={700 + k * 120} y={820 - k * 70} width={1400} height={10} fill="#a8a8a2" />
			</g>
		))}
		<path d="M 680,620 L 1900,-60" stroke="#6a4a2a" strokeWidth={22} strokeLinecap="round" />
		{Array.from({length: 10}).map((_, k) => (
			<line key={k} x1={740 + k * 120} y1={600 - k * 67} x2={740 + k * 120} y2={820 - k * 70} stroke="#3a3a3a" strokeWidth={8} />
		))}
		{/* mail boxes */}
		<g transform="translate(80,260)">
			<rect x={0} y={0} width={440} height={300} fill="#7a8a7a" />
			{Array.from({length: 3}).map((_, r) =>
				Array.from({length: 4}).map((__, c) => (
					<g key={`${r}-${c}`}>
						<rect x={12 + c * 107} y={12 + r * 96} width={96} height={86} fill="#5a6a5a" />
						<rect x={30 + c * 107} y={30 + r * 96} width={60} height={10} fill="#2a2c30" />
						<text x={60 + c * 107} y={80 + r * 96} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={20} fill="#e8e4d8">
							{1 + r * 4 + c}
						</text>
					</g>
				)),
			)}
		</g>
		{/* the empty socket on its cord */}
		<line x1={1000} y1={-600} x2={1000} y2={-80} stroke="#2a2c30" strokeWidth={5} />
		<rect x={984} y={-90} width={32} height={50} rx={6} fill="#3a3a3a" />
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill="#6a6a64" />
	</g>
);

// =================================================== the evening room, TV ======
// the tube TV on legs; `screen` = what it shows; `warm` 0…1 = the picture appears as the tubes warm up
export const TubeTV: React.FC<{x: number; y: number; s?: number; channel?: 1 | 2; warm?: number; show?: 'night' | 'news' | 'cartoon' | 'film' | 'none'; f?: number}> = ({x, y, s = 1, channel = 1, warm = 1, show = 'none', f = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-220} y={-470} width={440} height={350} rx={26} fill="#5a3a22" />
		<rect x={-196} y={-446} width={300} height={270} rx={44} fill="#20242a" />
		<g opacity={warm}>
			<rect x={-180} y={-430} width={268} height={238} rx={38} fill={show === 'news' ? '#2a4a8a' : show === 'night' ? '#1a2450' : show === 'cartoon' ? '#7ac0e0' : '#7a8a96'} />
			{show === 'night' && (
				<g>
					{Array.from({length: 10}).map((_, k) => (
						<circle key={k} cx={-160 + rnd(k) * 230} cy={-410 + rnd(k * 3) * 120} r={3} fill="#fff" />
					))}
					<circle cx={40} cy={-380} r={22} fill="#f4e6a0" />
					<text x={-46} y={-250} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={20} fill="#fff">
						СПОКОЙНОЙ НОЧИ,
					</text>
					<text x={-46} y={-222} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={20} fill="#fff">
						МАЛЫШИ!
					</text>
				</g>
			)}
			{show === 'news' && (
				<g>
					<circle cx={-46} cy={-330} r={70} fill="none" stroke="#9ab8e8" strokeWidth={6} />
					<path d="M -116,-330 L 24,-330 M -46,-400 L -46,-260 M -100,-370 Q -46,-350 8,-370 M -100,-290 Q -46,-310 8,-290" stroke="#9ab8e8" strokeWidth={4} fill="none" />
					<text x={-46} y={-218} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#fff" letterSpacing={4}>
						ВРЕМЯ
					</text>
				</g>
			)}
			{show === 'cartoon' && (
				<g>
					<circle cx={-90 + Math.sin(f / 6) * 40} cy={-300} r={36} fill="#e07a3a" />
					<circle cx={20 - Math.sin(f / 6) * 40} cy={-290} r={30} fill="#8a6a4a" />
					<rect x={-180} y={-232} width={268} height={40} fill="#5aa04a" />
				</g>
			)}
			<rect x={-180} y={-430} width={268} height={238} rx={38} fill="#fff" opacity={0.06} />
		</g>
		<circle cx={160} cy={-400} r={32} fill="#2a1a12" />
		<line x1={160} y1={-400} x2={160 + Math.cos(channel === 1 ? -2.2 : -0.9) * 26} y2={-400 + Math.sin(channel === 1 ? -2.2 : -0.9) * 26} stroke="#c9a54a" strokeWidth={7} strokeLinecap="round" />
		<text x={160} y={-338} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={26} fill="#c9a54a">
			{channel}
		</text>
		<circle cx={160} cy={-270} r={22} fill="#2a1a12" />
		<path d="M -190,-120 L -220,0 M 190,-120 L 220,0 M -70,-120 L -80,0 M 70,-120 L 80,0" stroke="#3a2a1e" strokeWidth={14} />
		<path d="M -40,-470 L -120,-640 M 40,-470 L 120,-640" stroke="#2a2c30" strokeWidth={7} />
		{warm > 0 && <Glow id={`tv${Math.round(x)}`} x={-46} y={-310} r={520} color="#bfe3f2" o={0.28 * warm} />}
	</g>
);
export const Living81: React.FC<{night?: number}> = ({night = 0.4}) => (
	<g>
		<Walls paper="#c9b890" stripe="#b8a77e" />
		<g transform="translate(-260,120)">
			<CarpetArt w={900} h={560} />
		</g>
		<rect x={-300} y={600} width={1000} height={120} rx={30} fill="#3a6a5a" />
		<rect x={-300} y={710} width={1000} height={130} rx={20} fill="#2e5a4a" />
		<Servant x={1500} y={170} w={560} />
		<g transform="translate(1340,560)">
			<rect x={-6} y={-380} width={12} height={650} fill="#3a2a1e" />
			<path d="M -90,-380 L 90,-380 L 60,-470 L -60,-470 Z" fill="#e0b06a" />
			<Glow id="lamp81" x={0} y={-400} r={300} color="#ffd27a" o={0.5 * night} />
		</g>
		{night > 0 && <rect x={-800} y={-600} width={3600} height={2400} fill="#0a1030" opacity={0.3 * night} />}
	</g>
);
