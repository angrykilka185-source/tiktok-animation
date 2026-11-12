import React from 'react';
import {Person} from './Person';

// ----------------------------- walls & floors ------------------------------
export const Wallpaper: React.FC<{id: string; x?: number; y?: number; w: number; h: number; base?: string; line?: string}> = ({
	id,
	x = 0,
	y = 0,
	w,
	h,
	base = '#ecd5a8',
	line = '#d9bd88',
}) => (
	<g>
		<defs>
			<pattern id={id} width={36} height={240} patternUnits="userSpaceOnUse">
				<rect width={36} height={240} fill={base} />
				<path d="M 6,0 C 9,60 3,120 7,180 S 5,230 6,240" stroke={line} strokeWidth={3} fill="none" />
				<path d="M 20,0 C 18,50 23,110 19,170 S 21,220 20,240" stroke={line} strokeWidth={2} fill="none" opacity={0.7} />
				<path d="M 30,40 l 2,30 l -2,30" stroke={line} strokeWidth={2} fill="none" opacity={0.5} />
			</pattern>
		</defs>
		<rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
	</g>
);

export const PlankFloor: React.FC<{y: number; h?: number; vx?: number; color?: string; seam?: string}> = ({
	y,
	h = 1200,
	vx = 540,
	color = '#c78a52',
	seam = '#a86d3c',
}) => {
	const lines = [];
	for (let i = -14; i <= 14; i++) {
		const xb = vx + i * 150;
		lines.push(<line key={'v' + i} x1={vx + i * 46} y1={y} x2={xb + i * 40} y2={y + h} stroke={seam} strokeWidth={4} />);
	}
	const rows = [];
	let yy = y + 26;
	let step = 30;
	let k = 0;
	while (yy < y + h) {
		for (let i = -14; i <= 14; i++) {
			if ((i + k) % 3 !== 0) continue;
			const t = (yy - y) / h;
			const xa = vx + i * (46 + (150 + i * 0 + 40 * 0) * 0) + i * (104 + 40) * t;
			rows.push(<line key={`r${k}_${i}`} x1={xa} y1={yy} x2={xa + 46 + 104 * t} y2={yy} stroke={seam} strokeWidth={3} />);
		}
		yy += step;
		step *= 1.35;
		k++;
	}
	return (
		<g>
			<rect x={-2000} y={y} width={5000} height={h} fill={color} />
			{lines}
			{rows}
			<rect x={-2000} y={y} width={5000} height={h} fill="url(#floorShade)" />
		</g>
	);
};

export const Baseboard: React.FC<{y: number; color?: string}> = ({y, color = '#8a5a34'}) => (
	<rect x={-2000} y={y - 26} width={5000} height={28} fill={color} />
);

export const Rug: React.FC<{cx: number; y: number; w: number; h: number}> = ({cx, y, w, h}) => {
	const top = w * 0.72;
	const pt = (u: number, v: number) => {
		const ww = top + (w - top) * v;
		return `${cx - ww / 2 + ww * u},${y + h * v}`;
	};
	const quad = (u0: number, v0: number, u1: number, v1: number) => `M ${pt(u0, v0)} L ${pt(u1, v0)} L ${pt(u1, v1)} L ${pt(u0, v1)} Z`;
	return (
		<g>
			<path d={quad(0, 0, 1, 1)} fill="#b8433a" />
			<path d={quad(0.06, 0.08, 0.94, 0.92)} fill="#e0b84c" />
			<path d={quad(0.1, 0.14, 0.9, 0.86)} fill="#3f7a5e" />
			<path d={`M ${pt(0.5, 0.22)} L ${pt(0.68, 0.5)} L ${pt(0.5, 0.78)} L ${pt(0.32, 0.5)} Z`} fill="#e9d27a" />
			<ellipse cx={cx} cy={y + h * 0.5} rx={w * 0.06} ry={h * 0.1} fill="#d6543f" />
		</g>
	);
};

export const Lighting: React.FC<{glow?: number; vignette?: number; tint?: string; tintOpacity?: number}> = ({
	glow = 0.35,
	vignette = 0.45,
	tint,
	tintOpacity = 0,
}) => (
	<g pointerEvents="none">
		<rect x={0} y={0} width={1080} height={1920} fill="url(#glowGrad)" opacity={glow} />
		<rect x={0} y={0} width={1080} height={1920} fill="url(#vignetteGrad)" opacity={vignette} />
		{tint && <rect x={0} y={0} width={1080} height={1920} fill={tint} opacity={tintOpacity} />}
	</g>
);

export const GlobalDefs: React.FC = () => (
	<defs>
		<radialGradient id="glowGrad" cx="50%" cy="38%" r="60%">
			<stop offset="0%" stopColor="#fffaf0" stopOpacity={0.9} />
			<stop offset="100%" stopColor="#fffaf0" stopOpacity={0} />
		</radialGradient>
		<radialGradient id="vignetteGrad" cx="50%" cy="50%" r="75%">
			<stop offset="55%" stopColor="#1a0e06" stopOpacity={0} />
			<stop offset="100%" stopColor="#1a0e06" stopOpacity={0.9} />
		</radialGradient>
		<linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#3a1f0c" stopOpacity={0.25} />
			<stop offset="40%" stopColor="#3a1f0c" stopOpacity={0} />
		</linearGradient>
		<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#5fa8e6" />
			<stop offset="100%" stopColor="#bfe2f7" />
		</linearGradient>
		<linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#0c1430" />
			<stop offset="100%" stopColor="#253a6b" />
		</linearGradient>
		<linearGradient id="skyMorning" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#f7b98a" />
			<stop offset="100%" stopColor="#fde7c6" />
		</linearGradient>
		<linearGradient id="stairLight" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#f6f7ef" />
			<stop offset="55%" stopColor="#e8eee0" />
			<stop offset="56%" stopColor="#7fae96" />
			<stop offset="100%" stopColor="#6b9a82" />
		</linearGradient>
		<radialGradient id="redVignette" cx="50%" cy="50%" r="70%">
			<stop offset="45%" stopColor="#7a0000" stopOpacity={0} />
			<stop offset="100%" stopColor="#5a0000" stopOpacity={0.95} />
		</radialGradient>
		<linearGradient id="doorLight" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#ffe9a8" />
			<stop offset="100%" stopColor="#f2c66c" />
		</linearGradient>
	</defs>
);

// --------------------------------- props -----------------------------------
export const DoorFrame: React.FC<{x: number; y: number; w: number; h: number; open: number; behind?: React.ReactNode; color?: string}> = ({
	x,
	y,
	w,
	h,
	open,
	behind,
	color = '#6e3f22',
}) => {
	const panelW = w * Math.max(0.0, Math.cos((open * Math.PI) / 2.15));
	const swing = (1 - Math.cos((open * Math.PI) / 2)) * 60; // panel comes towards camera -> grows taller on the free edge
	return (
		<g>
			<rect x={x} y={y} width={w} height={h} fill="url(#stairLight)" />
			{behind}
			{/* panel hinged on the right */}
			<path
				d={`M ${x + w},${y} L ${x + w - panelW},${y - swing * 0.35} L ${x + w - panelW},${y + h + swing * 0.35} L ${x + w},${y + h} Z`}
				fill={open > 0.05 ? '#8a5432' : '#7a4a2c'}
			/>
			{open < 0.3 && <circle cx={x + w - panelW + 26} cy={y + h * 0.52} r={9} fill="#d8b25a" />}
			<rect x={x - 22} y={y - 22} width={22} height={h + 22} fill={color} />
			<rect x={x + w} y={y - 22} width={22} height={h + 22} fill={color} />
			<rect x={x - 22} y={y - 22} width={w + 44} height={22} fill={color} />
		</g>
	);
};

export const WindowBox: React.FC<{x: number; y: number; w: number; h: number; sky?: string; curtain?: boolean}> = ({x, y, w, h, sky = 'url(#sky)', curtain = true}) => (
	<g>
		<rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill="#f4efe6" />
		<rect x={x} y={y} width={w} height={h} fill={sky} />
		<rect x={x + w / 2 - 7} y={y} width={14} height={h} fill="#f4efe6" />
		<rect x={x} y={y + h * 0.38} width={w} height={12} fill="#f4efe6" />
		<rect x={x - 34} y={y + h + 10} width={w + 68} height={22} rx={4} fill="#e9e2d4" />
		{curtain && (
			<>
				<path d={`M ${x - 40},${y - 40} L ${x + w * 0.18},${y - 40} Q ${x + w * 0.08},${y + h * 0.5} ${x + w * 0.16},${y + h + 20} L ${x - 40},${y + h + 20} Z`} fill="#c9584a" opacity={0.92} />
				<path d={`M ${x + w + 40},${y - 40} L ${x + w * 0.82},${y - 40} Q ${x + w * 0.92},${y + h * 0.5} ${x + w * 0.84},${y + h + 20} L ${x + w + 40},${y + h + 20} Z`} fill="#c9584a" opacity={0.92} />
			</>
		)}
	</g>
);

export const WallClock: React.FC<{x: number; y: number; r?: number; h?: number; m?: number; tick?: number}> = ({x, y, r = 56, h = 3, m = 5, tick = 0}) => {
	const sec = (tick % 60) * 6;
	return (
		<g transform={`translate(${x},${y})`}>
			<circle r={r + 8} fill="#3b2a1e" />
			<circle r={r} fill="#fbf7ee" />
			{Array.from({length: 12}).map((_, i) => (
				<rect key={i} x={-2} y={-r + 6} width={4} height={i % 3 === 0 ? 12 : 7} fill="#3b2a1e" transform={`rotate(${i * 30})`} />
			))}
			<rect x={-3.5} y={-r * 0.5} width={7} height={r * 0.5} rx={3} fill="#222" transform={`rotate(${(h % 12) * 30 + m * 0.5})`} />
			<rect x={-2.5} y={-r * 0.78} width={5} height={r * 0.78} rx={2} fill="#222" transform={`rotate(${m * 6})`} />
			<rect x={-1} y={-r * 0.85} width={2} height={r * 0.95} fill="#d63b2f" transform={`rotate(${sec})`} />
			<circle r={5} fill="#d63b2f" />
		</g>
	);
};

// Framed family photo. Variant 'fork': dad eats with LEFT hand; 'saw': shows the scar.
export const FamilyPhoto: React.FC<{x: number; y: number; w: number; h: number; variant?: 'fork' | 'saw'; highlight?: number; id: string}> = ({
	x,
	y,
	w,
	h,
	variant = 'fork',
	highlight = 0,
	id,
}) => {
	const sc = (h / 1500) * 2.1;
	const px = x + w * 0.42;
	const py = y + h * 0.3 + 1024 * sc;
	const hand: [number, number] = variant === 'fork' ? [190, -880] : [210, -760];
	const hx = px + hand[0] * sc;
	const hy = py + hand[1] * sc;
	return (
		<g>
			<rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill="#5a3a22" />
			<rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} fill="#e8dcc4" />
			<clipPath id={id}>
				<rect x={x} y={y} width={w} height={h} />
			</clipPath>
			<g clipPath={`url(#${id})`}>
				<rect x={x} y={y} width={w} height={h} fill="#cfe3d8" />
				<rect x={x} y={y + h * 0.62} width={w} height={h} fill="#8fb27e" />
				<circle cx={x + w * 0.82} cy={y + h * 0.16} r={h * 0.09} fill="#fff3c2" />
				<Person
					kind="dad"
					id={`${id}-dad`}
					x={px}
					y={py}
					scale={sc}
					face={{eyes: 'happy', mouth: 'smile', stubble: true}}
					armL={{shoulder: 8, elbow: 0}}
					armR={variant === 'fork' ? {target: hand} : {target: hand}}
					itemR={variant === 'fork' ? <Fork scale={1.4} /> : <Saw />}
				/>
			</g>
			{highlight > 0 && (
				<circle
					cx={hx}
					cy={hy - (variant === 'fork' ? 40 * sc : 0)}
					r={h * 0.2 * (0.85 + 0.15 * highlight)}
					fill="none"
					stroke="#ff3b30"
					strokeWidth={10}
					opacity={highlight}
				/>
			)}
		</g>
	);
};

export const Fork: React.FC<{scale?: number; rot?: number}> = ({scale = 1, rot = 0}) => (
	<g transform={`rotate(${rot}) scale(${scale})`}>
		<rect x={-5} y={-80} width={10} height={70} rx={4} fill="#c9ced6" />
		<rect x={-14} y={-110} width={28} height={34} rx={6} fill="#c9ced6" />
		{[-10, -3.5, 3.5, 10].map((t) => (
			<rect key={t} x={t - 2} y={-150} width={4} height={44} rx={2} fill="#c9ced6" />
		))}
	</g>
);

export const Saw: React.FC = () => (
	<g transform="rotate(-100)">
		<rect x={-16} y={-14} width={50} height={28} rx={8} fill="#b8432f" />
		<path d="M 30,-12 L 200,-30 L 200,14 L 30,14 Z" fill="#cfd5dc" />
		{Array.from({length: 12}).map((_, i) => (
			<path key={i} d={`M ${40 + i * 14},14 l 7,10 l 7,-10 Z`} fill="#cfd5dc" />
		))}
	</g>
);

export const Glass: React.FC<{level?: number; scale?: number}> = ({level = 0.7, scale = 1}) => (
	<g transform={`scale(${scale})`}>
		<path d="M -34,-110 L 34,-110 L 28,0 L -28,0 Z" fill="#d8eef7" opacity={0.75} />
		<path d={`M ${-34 + 6 * (1 - level)},${-110 * level} L ${34 - 6 * (1 - level)},${-110 * level} L 28,0 L -28,0 Z`} fill="#9fd3ea" opacity={0.85} />
		<path d="M -22,-100 L -18,-12" stroke="#fff" strokeWidth={6} opacity={0.7} strokeLinecap="round" />
	</g>
);

export const BorschtBowl: React.FC<{steam?: number; scale?: number}> = ({steam = 0, scale = 1}) => (
	<g transform={`scale(${scale})`}>
		<ellipse cx={0} cy={6} rx={150} ry={34} fill="#e9e4da" />
		<path d="M -110,-30 Q -100,40 0,46 Q 100,40 110,-30 Z" fill="#f5f2ea" />
		<ellipse cx={0} cy={-30} rx={110} ry={26} fill="#f5f2ea" />
		<ellipse cx={0} cy={-28} rx={96} ry={20} fill="#b3262c" />
		<ellipse cx={-14} cy={-30} rx={22} ry={7} fill="#fbf4ea" />
		<path d="M 30,-30 l 18,-4 M 50,-24 l 14,2" stroke="#3f8a3e" strokeWidth={5} strokeLinecap="round" />
		{[-40, 0, 40].map((sx, i) => (
			<path
				key={sx}
				d={`M ${sx},-60 c -14,-20 14,-34 0,-56 c -14,-20 14,-34 0,-56`}
				stroke="#ffffff"
				strokeWidth={8}
				fill="none"
				strokeLinecap="round"
				opacity={0.55 * steam}
				transform={`translate(0,${-((steam * 30 + i * 10) % 20)})`}
			/>
		))}
	</g>
);

export const Table: React.FC<{y: number; x?: number; w?: number; h?: number}> = ({y, x = -100, w = 1300, h = 900}) => (
	<g>
		<rect x={x} y={y} width={w} height={34} fill="#f1ece2" />
		<rect x={x} y={y + 30} width={w} height={h} fill="#e7553f" />
		{Array.from({length: Math.ceil(w / 70)}).map((_, i) => (
			<rect key={'c' + i} x={x + i * 70} y={y + 30} width={35} height={h} fill="#f4efe6" opacity={0.55} />
		))}
		{Array.from({length: Math.ceil(h / 70)}).map((_, i) => (
			<rect key={'r' + i} x={x} y={y + 30 + i * 70} width={w} height={35} fill="#f4efe6" opacity={0.45} />
		))}
		<rect x={x} y={y + 30} width={w} height={26} fill="#000" opacity={0.12} />
	</g>
);

export const Fridge: React.FC<{x: number; y: number; h?: number}> = ({x, y, h = 760}) => (
	<g>
		<rect x={x} y={y} width={270} height={h} rx={22} fill="#eef1f2" />
		<rect x={x} y={y + h * 0.36} width={270} height={8} fill="#c9cfd3" />
		<rect x={x + 228} y={y + 80} width={14} height={120} rx={7} fill="#b7bec4" />
		<rect x={x + 228} y={y + h * 0.36 + 60} width={14} height={160} rx={7} fill="#b7bec4" />
		<rect x={x + 40} y={y + 60} width={60} height={70} rx={4} fill="#f6d36b" transform={`rotate(-6 ${x + 70} ${y + 95})`} />
		<circle cx={x + 150} cy={y + 110} r={18} fill="#e8604c" />
	</g>
);

export const Tiles: React.FC<{y: number; h: number; color?: string}> = ({y, h, color = '#bfe0d6'}) => (
	<g>
		<rect x={-2000} y={y} width={5000} height={h} fill={color} />
		{Array.from({length: 60}).map((_, i) => (
			<line key={'v' + i} x1={-600 + i * 60} y1={y} x2={-600 + i * 60} y2={y + h} stroke="#a6cdc1" strokeWidth={3} />
		))}
		{Array.from({length: Math.ceil(h / 60)}).map((_, i) => (
			<line key={'h' + i} x1={-2000} y1={y + i * 60} x2={3000} y2={y + i * 60} stroke="#a6cdc1" strokeWidth={3} />
		))}
	</g>
);

// Whole kitchen backdrop (wall, window, fridge, clock, photo). Floor line at y = floorY.
export const Kitchen: React.FC<{floorY?: number; clock?: [number, number]; tick?: number; sky?: string; photoHighlight?: number; id: string}> = ({
	floorY = 1300,
	clock = [3, 5],
	tick = 0,
	sky,
	photoHighlight = 0,
	id,
}) => (
	<g>
		<Wallpaper id={`${id}-wp`} x={-1000} y={-1000} w={3200} h={floorY + 1000} base="#f0dcb0" line="#dfc490" />
		<Tiles y={floorY - 520} h={520} />
		<PlankFloor y={floorY} color="#b9824d" seam="#9a6638" />
		<WindowBox x={90} y={300} w={330} h={420} sky={sky} />
		<WallClock x={510} y={260} h={clock[0]} m={clock[1]} tick={tick} />
		<FamilyPhoto x={620} y={330} w={180} h={215} id={`${id}-ph`} highlight={photoHighlight} />
		<Fridge x={880} y={floorY - 780} h={780} />
		{/* counter + sink */}
		<rect x={-300} y={floorY - 360} width={420} height={360} fill="#d8c3a0" />
		<rect x={-300} y={floorY - 380} width={440} height={30} fill="#9c7a54" />
	</g>
);

// Hallway backdrop with the entrance door.
export const Hallway: React.FC<{open: number; behind?: React.ReactNode; id: string; floorY?: number}> = ({open, behind, id, floorY = 1260}) => (
	<g>
		<Wallpaper id={`${id}-wp`} x={-1000} y={-1000} w={3200} h={floorY + 1000} />
		<PlankFloor y={floorY} />
		<Baseboard y={floorY} />
		<DoorFrame x={330} y={floorY - 700} w={380} h={700} open={open} behind={behind} />
		{/* mirror */}
		<rect x={-30} y={floorY - 820} width={240} height={420} rx={10} fill="#7a4a2c" />
		<rect x={-14} y={floorY - 804} width={208} height={388} rx={6} fill="#cfe4ef" />
		<path d={`M 20,${floorY - 760} l 60,-30 M 30,${floorY - 700} l 120,-60`} stroke="#fff" strokeWidth={10} opacity={0.6} />
		{/* coat rack */}
		<rect x={790} y={floorY - 860} width={260} height={18} rx={6} fill="#6e3f22" />
		{[830, 900, 970].map((cx) => (
			<circle key={cx} cx={cx} cy={floorY - 830} r={10} fill="#d8b25a" />
		))}
		<path d={`M 840,${floorY - 820} q -40,140 -10,330 l 120,0 q 20,-200 -40,-330 Z`} fill="#8e3b46" />
		<Rug cx={520} y={floorY + 60} w={560} h={300} />
	</g>
);
