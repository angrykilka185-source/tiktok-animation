// «Каково это — оказаться погребённым заживо» — 16:9 (1920×1080). The kit: the ground in section (the night above, the
// layers of soil, the coffin two metres down), the coffin up close, the light of a lighter or a phone, sound waves
// that die in the soil, the HUD (Гога's mistakes 1–7 and the air he has left), the mountains and the avalanche, the
// beach and the hole, the trench, the grain bin, the rubble, the bedroom, and the 19th century (old cards, the safety
// coffin with its bell, the waiting hall). Гога is «You» from the thirst film (src/z2/kit.tsx).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {clamp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {mix, rnd} from '../z1/kit';

export {BigTitle, camAt, camT, ICE, INK, Layer, mix, Plaque, RED, rnd, Stage16, YEL} from '../z1/kit';
export {arm, armTo, Chip, Flask, hangTo, Moon, You} from '../z2/kit';
export {HEAVY};

const INKC = '#16161c';
const REDC = '#e8352e';

// ============================================================ the world of the grave: the surface at y = G, 2 m = 520 px =====
export const G = 260;
export const M = 260; // px per metre
export const COFFIN = {x: 960, y: G + 2 * M, w: 640, h: 250}; // the lid's top edge is two metres down

// the night above the grave: a deep blue sky, stars, a moon, far trees
export const NightTop: React.FC<{id: string; f?: number; w?: number}> = ({id, f = 0, w = 1920}) => (
	<g>
		<defs>
			<linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#060a1e" />
				<stop offset="100%" stopColor="#1b2a58" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-600} width={w + 800} height={G + 600} fill={`url(#${id}sky)`} />
		{Array.from({length: 46}).map((_, i) => (
			<circle key={i} cx={-200 + rnd(i) * (w + 400)} cy={-560 + rnd(i + 70) * (G + 480)} r={1.4 + rnd(i + 9) * 2.2} fill="#fff" opacity={0.45 + 0.4 * Math.abs(Math.sin(f / 30 + i))} />
		))}
		<circle cx={w - 330} cy={70} r={46} fill="#f4efd8" />
		<circle cx={w - 312} cy={58} r={46} fill="#1b2a58" opacity={0.0} />
		{/* far trees */}
		<path d={`M -400,${G} ${Array.from({length: 28}).map((_, i) => `L ${-400 + i * 100},${G - 60 - rnd(i + 3) * 70} L ${-350 + i * 100},${G - 20}`).join(' ')} L ${w + 400},${G} Z`} fill="#0d1530" />
	</g>
);
// the soil from the surface down: layers, stones, roots; grass on top
export const Soil: React.FC<{w?: number; depth?: number; mound?: boolean}> = ({w = 1920, depth = 1100, mound = true}) => (
	<g>
		{[
			['#6b4a2e', 0],
			['#5d3f27', 0.22],
			['#4f3520', 0.48],
			['#432c1a', 0.74],
		].map(([c, t], k) => (
			<rect key={k} x={-400} y={G + (t as number) * depth} width={w + 800} height={depth} fill={c as string} />
		))}
		{Array.from({length: 60}).map((_, i) => (
			<ellipse key={i} cx={-300 + rnd(i + 200) * (w + 600)} cy={G + 30 + rnd(i + 300) * (depth - 60)} rx={8 + rnd(i) * 22} ry={5 + rnd(i + 1) * 12} fill="#2e1e12" opacity={0.35 + rnd(i + 2) * 0.3} />
		))}
		{Array.from({length: 9}).map((_, i) => {
			const x = rnd(i + 400) * w;
			return <path key={`r${i}`} d={`M ${x},${G} C ${x + 20},${G + 50} ${x - 30},${G + 90} ${x + 10},${G + 140 + rnd(i) * 80}`} stroke="#8a6a44" strokeWidth={4} fill="none" opacity={0.6} />;
		})}
		{/* the grave was dug and filled: a looser, lighter column above the coffin */}
		<rect x={COFFIN.x - COFFIN.w / 2 - 40} y={G} width={COFFIN.w + 80} height={2 * M + 10} fill="#7a5638" opacity={0.35} />
		{/* the grass line and the mound */}
		<rect x={-400} y={G - 10} width={w + 800} height={22} fill="#2f4d2c" />
		{mound && <path d={`M ${COFFIN.x - COFFIN.w / 2 - 40},${G} C ${COFFIN.x - 200},${G - 46} ${COFFIN.x + 200},${G - 46} ${COFFIN.x + COFFIN.w / 2 + 40},${G} Z`} fill="#5d3f27" />}
		{Array.from({length: 60}).map((_, i) => {
			const x = -300 + i * 42 + rnd(i) * 20;
			return <path key={`g${i}`} d={`M ${x},${G} l ${-4 + rnd(i) * 8},${-14 - rnd(i + 5) * 10}`} stroke="#3f6a38" strokeWidth={4} strokeLinecap="round" />;
		})}
	</g>
);
// a plain wooden marker on the mound
export const Marker: React.FC<{x?: number}> = ({x = COFFIN.x}) => (
	<g transform={`translate(${x},${G - 30})`}>
		<rect x={-12} y={-150} width={24} height={150} fill="#7a5634" stroke="#3a2210" strokeWidth={4} />
		<rect x={-70} y={-160} width={140} height={60} rx={8} fill="#8a6440" stroke="#3a2210" strokeWidth={4} />
		<path d="M -44,-136 L 44,-136 M -34,-118 L 34,-118" stroke="#3a2210" strokeWidth={4} opacity={0.5} />
	</g>
);
// the coffin from the side; inside: dark, and whatever is drawn in it (`children`, in world units)
export const Coffin: React.FC<{light?: number; crack?: number; children?: React.ReactNode; id?: string}> = ({light = 0, crack = 0, children, id = 'cof'}) => {
	const {x, y, w, h} = COFFIN;
	const L = x - w / 2;
	const T = y;
	return (
		<g>
			<defs>
				<clipPath id={`${id}in`}>
					<rect x={L + 16} y={T + 30} width={w - 32} height={h - 46} rx={8} />
				</clipPath>
				<radialGradient id={`${id}glow`} cx="0.5" cy="0.5" r="0.5">
					<stop offset="0%" stopColor="#ffcf7a" stopOpacity={0.85} />
					<stop offset="100%" stopColor="#ffcf7a" stopOpacity={0} />
				</radialGradient>
			</defs>
			<rect x={L} y={T} width={w} height={h} rx={14} fill="#6e4224" stroke="#2a180a" strokeWidth={8} />
			<rect x={L + 16} y={T + 30} width={w - 32} height={h - 46} rx={8} fill={mix('#120c08', '#3a2614', light)} />
			<g clipPath={`url(#${id}in)`}>
				{light > 0 && <ellipse cx={x - 120} cy={T + h / 2} rx={420} ry={220} fill={`url(#${id}glow)`} opacity={light} />}
				{children}
			</g>
			{/* the lid */}
			<rect x={L - 10} y={T - 6} width={w + 20} height={36} rx={10} fill="#8a5630" stroke="#2a180a" strokeWidth={8} />
			{[0.2, 0.45, 0.7].map((t) => (
				<path key={t} d={`M ${L + w * t},${T + 6} q 40,8 90,0`} stroke="#5a3418" strokeWidth={4} fill="none" opacity={0.6} />
			))}
			{crack > 0 && <path d={`M ${x - 40},${T - 6} l 18,${12 * crack} l -14,${10 * crack} l 22,${14 * crack}`} stroke="#120c08" strokeWidth={7} fill="none" strokeLinejoin="round" />}
			{[-1, 1].map((s) => (
				<rect key={s} x={x + s * (w / 2 - 60) - 30} y={T + h - 60} width={60} height={16} rx={6} fill="#c9a35a" stroke="#2a180a" strokeWidth={4} />
			))}
		</g>
	);
};
// Гога lying in the coffin (his head to the left); `pose` gives his arms and face
export const inCoffin = {x: COFFIN.x + COFFIN.w / 2 - 34, y: COFFIN.y + COFFIN.h / 2 + 8, s: 0.6};
// a depth arrow with a label
export const DepthArrow: React.FC<{x: number; y0: number; y1: number; label: string; p?: number}> = ({x, y0, y1, label, p = 1}) => (
	<g opacity={p} transform={`translate(${x},0)`}>
		<line x1={0} y1={y0 + 14} x2={0} y2={y0 + (y1 - y0) * p - 14} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
		<path d={`M -18,${y0 + 22} L 0,${y0} L 18,${y0 + 22}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		{p > 0.95 && <path d={`M -18,${y1 - 22} L 0,${y1} L 18,${y1 - 22}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
		<g transform={`translate(30,${(y0 + y1) / 2})`}>
			<rect x={0} y={-34} width={label.length * 30 + 40} height={68} rx={14} fill={INKC} />
			<text x={20} y={16} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#fff">
				{label}
			</text>
		</g>
	</g>
);
// sound waves from a point; inside the soil they fade fast (damp 0…1)
export const Waves: React.FC<{f: number; x: number; y: number; dir?: number; color?: string; damp?: number; n?: number}> = ({f, x, y, dir = -90, color = '#fff', damp = 0, n = 4}) => (
	<g transform={`translate(${x},${y}) rotate(${dir + 90})`}>
		{Array.from({length: n}).map((_, k) => {
			const t = ((f / 14 + k / n) % 1);
			const r = 40 + t * 260;
			const o = (1 - t) * (damp > 0 ? Math.max(0, 1 - t * (1 + damp * 3)) : 1);
			return <path key={k} d={`M ${-r * 0.7},${-r * 0.7} A ${r},${r} 0 0 1 ${r * 0.7},${-r * 0.7}`} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" opacity={o} />;
		})}
	</g>
);
// a lighter with its flame (at its own origin: the flame tip goes up)
export const Lighter: React.FC<{f: number; lit?: number; s?: number}> = ({f, lit = 1, s = 1}) => (
	<g transform={`scale(${s})`}>
		<rect x={-20} y={-10} width={40} height={70} rx={8} fill="#e8352e" stroke={INKC} strokeWidth={5} />
		<rect x={-18} y={-26} width={36} height={18} rx={4} fill="#c9ccd3" stroke={INKC} strokeWidth={4} />
		{lit > 0 && (
			<g transform={`translate(0,-30) scale(${lit})`}>
				<circle r={70} fill="#ffcf6a" opacity={0.25} />
				<path d={`M 0,${-74 - Math.sin(f / 2) * 6} C 22,-40 22,-8 0,0 C -22,-8 -22,-40 0,${-74 - Math.sin(f / 2) * 6} Z`} fill="#ff8a2a" />
				<path d={`M 0,${-46 - Math.sin(f / 1.6) * 4} C 12,-26 12,-6 0,0 C -12,-6 -12,-26 0,${-46 - Math.sin(f / 1.6) * 4} Z`} fill="#ffe07a" />
			</g>
		)}
	</g>
);
// a phone with a glowing screen (at its own centre)
export const Phone: React.FC<{glow?: number; s?: number; children?: React.ReactNode}> = ({glow = 1, s = 1, children}) => (
	<g transform={`scale(${s})`}>
		{glow > 0 && <circle r={160} fill="#9fd8ff" opacity={0.22 * glow} />}
		<rect x={-44} y={-80} width={88} height={160} rx={16} fill="#16171b" />
		<rect x={-36} y={-68} width={72} height={136} rx={8} fill={mix('#2a3448', '#dff3ff', glow)} />
		{children}
	</g>
);
// heavy weights: «тонны» on the lid
export const Weight: React.FC<{text?: string}> = ({text = '1 Т'}) => (
	<g>
		<path d="M -70,0 L -54,-90 L 54,-90 L 70,0 Z" fill="#3a3d44" stroke={INKC} strokeWidth={6} strokeLinejoin="round" />
		<path d="M -26,-90 C -26,-130 26,-130 26,-90" stroke="#3a3d44" strokeWidth={16} fill="none" />
		<text x={0} y={-30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff">
			{text}
		</text>
	</g>
);

// ============================================================ the HUD: Гога's mistakes, and the air he has left =====
export type AirTick = {at: number; min: number; len?: number};
const airAt = (f: number, ticks: AirTick[]) => {
	let v = ticks[0].min;
	for (let i = 1; i < ticks.length; i++) {
		const t = ticks[i];
		if (f >= t.at) v = interpolate(f, [t.at, t.at + (t.len ?? 30)], [ticks[i - 1].min, t.min], clamp);
	}
	return v;
};
export const HUDZ: React.FC<{f: number; mist: number[]; show: [number, number]; air?: {show: [number, number]; ticks: AirTick[]}}> = ({f, mist, show, air}) => {
	const o = interpolate(f, [show[0], show[0] + 10, show[1] - 10, show[1]], [0, 1, 1, 0], clamp);
	const ao = air ? interpolate(f, [air.show[0], air.show[0] + 10, air.show[1] - 10, air.show[1]], [0, 1, 1, 0], clamp) : 0;
	const n = mist.filter((m) => f >= m).length;
	const m = air ? airAt(f, air.ticks) : 0;
	const pill: React.CSSProperties = {position: 'absolute', top: 24, background: 'rgba(10,12,20,0.86)', border: '3px solid rgba(255,255,255,0.14)', borderRadius: 18, padding: '10px 18px', color: '#fff', fontFamily: HEAVY, fontWeight: 900};
	return (
		<>
			{o > 0 && (
				<div style={{...pill, left: 24, opacity: o}}>
					<div style={{fontSize: 18, letterSpacing: 2, opacity: 0.75, marginBottom: 6}}>ОШИБКИ ГОГИ · {n}/7</div>
					<div style={{display: 'flex', gap: 8}}>
						{mist.map((at, k) => {
							const on = f >= at;
							const p = on ? pop(f, at, 9) : 1;
							return (
								<div key={k} style={{width: 40, height: 40, borderRadius: 10, background: on ? REDC : 'rgba(255,255,255,0.1)', border: on ? '3px solid #fff' : '3px solid rgba(255,255,255,0.2)', transform: `scale(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>
									{on ? '✕' : <span style={{fontSize: 18, opacity: 0.5}}>{k + 1}</span>}
								</div>
							);
						})}
					</div>
				</div>
			)}
			{ao > 0 && (
				<div style={{...pill, right: 24, opacity: ao, minWidth: 270}}>
					<div style={{fontSize: 18, letterSpacing: 2, opacity: 0.75, marginBottom: 6}}>ВОЗДУХ В ГРОБУ</div>
					<div style={{fontSize: 34, color: m < 60 ? '#ff7a6a' : '#9fe0ff'}}>
						≈ {Math.floor(m / 60)} ч {String(Math.round(m % 60)).padStart(2, '0')} мин
					</div>
					<div style={{marginTop: 8, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)'}}>
						<div style={{width: `${Math.max(0, Math.min(1, m / 130)) * 100}%`, height: 12, borderRadius: 6, background: m < 60 ? REDC : '#5fb0f0'}} />
					</div>
				</div>
			)}
		</>
	);
};

// a dark vignette
export const Vig: React.FC<{k?: number; color?: string}> = ({k = 0.6, color = '0,0,0'}) => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(${color},0) 45%, rgba(${color},${k}) 100%)`}} />;

// ============================================================ the mountains, the snow, the avalanche =====
export const Mountains: React.FC<{id: string}> = ({id}) => (
	<g>
		<defs>
			<linearGradient id={`${id}ms`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#4f8fd8" />
				<stop offset="100%" stopColor="#cfe6fb" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-400} width={2720} height={1600} fill={`url(#${id}ms)`} />
		<path d="M -300,620 L 160,180 L 420,430 L 760,90 L 1080,420 L 1360,160 L 1700,470 L 2200,240 L 2300,700 Z" fill="#8aa4c4" />
		<path d="M 160,180 L 240,262 L 200,300 L 150,250 L 110,300 L 80,260 Z M 760,90 L 860,190 L 810,230 L 760,180 L 700,240 L 660,186 Z M 1360,160 L 1450,246 L 1400,282 L 1350,236 L 1300,280 L 1270,232 Z" fill="#fff" />
		<path d="M -300,700 C 300,520 900,560 1500,600 C 1800,620 2100,560 2300,520 L 2300,1300 L -300,1300 Z" fill="#f4f8fc" />
		<path d="M -300,820 C 400,700 1100,760 2300,700 L 2300,1300 L -300,1300 Z" fill="#e6eef7" />
	</g>
);
// the avalanche: a rolling white cloud front at x (moving right), with snow puffs
export const AvalancheFront: React.FC<{f: number; x: number; y?: number; h?: number}> = ({f, x, y = 700, h = 520}) => (
	<g>
		<rect x={-600} y={y - h} width={x + 600} height={h + 600} fill="#ffffff" />
		{Array.from({length: 14}).map((_, i) => {
			const yy = y - h + i * (h / 12) + Math.sin(f / 5 + i) * 10;
			const r = 70 + rnd(i) * 60;
			return <circle key={i} cx={x + Math.sin(f / 4 + i * 1.7) * 20} cy={yy} r={r} fill={i % 2 ? '#ffffff' : '#eef4fb'} />;
		})}
		{Array.from({length: 22}).map((_, i) => (
			<circle key={`p${i}`} cx={x + 60 + rnd(i + 30) * 160 + ((f * 6 + i * 13) % 120)} cy={y - rnd(i + 60) * h} r={6 + rnd(i) * 12} fill="#ffffff" opacity={0.8} />
		))}
	</g>
);

// ============================================================ the beach =====
export const Beach: React.FC<{id: string; f: number; sand?: number}> = ({id, f, sand = 700}) => (
	<g>
		<defs>
			<linearGradient id={`${id}bs`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#4aa0e6" />
				<stop offset="100%" stopColor="#bfe3fb" />
			</linearGradient>
		</defs>
		<rect x={-400} y={-400} width={2720} height={1600} fill={`url(#${id}bs)`} />
		<circle cx={1600} cy={150} r={70} fill="#fff6d0" />
		<rect x={-400} y={sand - 190} width={2720} height={200} fill="#2f86d0" />
		{Array.from({length: 4}).map((_, k) => (
			<path key={k} d={`M -400,${sand - 150 + k * 34} ${Array.from({length: 30}).map((_, i) => `q 50,${(i + k) % 2 ? -10 : 10} 100,0`).join(' ')}`} stroke="#9fd2f6" strokeWidth={5} fill="none" opacity={0.7} transform={`translate(${((f * 1.5 + k * 40) % 200) - 100},0)`} />
		))}
		<rect x={-400} y={sand - 6} width={2720} height={1200} fill="#f0cf8a" />
		{Array.from({length: 40}).map((_, i) => (
			<circle key={i} cx={-300 + rnd(i + 500) * 2500} cy={sand + 20 + rnd(i + 600) * 400} r={3 + rnd(i) * 4} fill="#d9b06a" />
		))}
	</g>
);
// a wet-sand hole in section at (x, top), w × d
export const HoleSection: React.FC<{x: number; top: number; w: number; d: number; fill?: number}> = ({x, top, w, d, fill = 0}) => (
	<g>
		<rect x={x - w / 2} y={top} width={w} height={d} fill="#5a3a1a" opacity={0.35} />
		{fill > 0 && <rect x={x - w / 2} y={top + d * (1 - fill)} width={w} height={d * fill} fill="#c99a52" />}
	</g>
);

// ============================================================ the trench, the grain bin, the rubble =====
export const GrainPile: React.FC<{x: number; y: number; w: number; h: number; f?: number}> = ({x, y, w, h, f = 0}) => (
	<g>
		<path d={`M ${x - w / 2},${y} Q ${x},${y - h * 2} ${x + w / 2},${y} Z`} fill="#e3b64a" stroke="#a87a1e" strokeWidth={5} />
		{Array.from({length: 60}).map((_, i) => {
			const t = rnd(i + 700);
			const u = rnd(i + 800);
			const px = x - w / 2 + t * w;
			const top = y - h * 2 * (1 - Math.pow((px - x) / (w / 2), 2)) * 0.5;
			return <ellipse key={i} cx={px} cy={top + u * (y - top) + ((f * 1.2 + i * 7) % 6)} rx={6} ry={3.5} fill="#c9952e" opacity={0.8} />;
		})}
	</g>
);
// broken concrete slabs over a dark hollow; a pipe runs through it
export const Rubble: React.FC = () => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1500} fill="#3a3a40" />
		<path d="M -100,300 L 700,180 L 760,240 L -100,420 Z" fill="#8a8a8f" stroke={INKC} strokeWidth={6} />
		<path d="M 600,140 L 1500,260 L 1460,330 L 560,220 Z" fill="#9a9a9f" stroke={INKC} strokeWidth={6} />
		<path d="M 1300,200 L 2100,120 L 2100,260 L 1340,300 Z" fill="#7e7e84" stroke={INKC} strokeWidth={6} />
		<path d="M -100,860 L 900,800 L 1000,900 L 2100,840 L 2100,1300 L -100,1300 Z" fill="#6a6a70" stroke={INKC} strokeWidth={6} />
		{Array.from({length: 30}).map((_, i) => (
			<path key={i} d={`M ${rnd(i) * 1920},${780 + rnd(i + 40) * 60} l ${20 + rnd(i + 3) * 40},${-10 + rnd(i + 5) * 20} l ${-10},${20} Z`} fill="#55555b" />
		))}
		{[300, 700, 1200, 1600].map((x, k) => (
			<line key={k} x1={x} y1={200 + k * 20} x2={x + 40} y2={330 + k * 10} stroke="#c97a3a" strokeWidth={6} />
		))}
	</g>
);

// ============================================================ the bedroom at night =====
export const Bedroom: React.FC<{f: number; light?: number}> = ({f, light = 0}) => (
	<g>
		<rect x={-200} y={-200} width={2400} height={1500} fill={mix('#1e2440', '#f3e6cf', light)} />
		<rect x={-200} y={820} width={2400} height={500} fill={mix('#2a2238', '#c9a77a', light)} />
		{/* a window with the moon */}
		<rect x={1340} y={150} width={360} height={300} rx={12} fill={mix('#0b1230', '#9fd2f6', light)} stroke="#4a3a5a" strokeWidth={14} />
		<line x1={1520} y1={150} x2={1520} y2={450} stroke="#4a3a5a" strokeWidth={10} />
		<circle cx={1610} cy={240} r={40} fill="#f4efd8" opacity={1 - light} />
		{/* the bed */}
		<rect x={320} y={640} width={1000} height={70} rx={14} fill="#7a4a2a" />
		<rect x={300} y={500} width={60} height={330} rx={12} fill="#6a3e22" />
		<rect x={1290} y={600} width={50} height={230} rx={12} fill="#6a3e22" />
		<rect x={350} y={600} width={260} height={80} rx={34} fill="#f4f4f8" />
		<path d={`M 520,${640 - Math.sin(f / 10) * 4} C 700,${590 - Math.sin(f / 10) * 4} 1100,600 1300,640 L 1300,720 L 520,720 Z`} fill="#4f7fd8" />
		<path d="M 560,690 L 1290,690" stroke="#3a64b8" strokeWidth={6} />
	</g>
);

// ============================================================ the 19th century =====
// an old photo card (sepia) with a caption; the drawing inside is `children` (centred at 0,0 in a 300×360 window)
export const OldCard: React.FC<{caption: string; sub?: string; children?: React.ReactNode; id: string}> = ({caption, sub, children, id}) => (
	<g>
		<defs>
			<clipPath id={`${id}cl`}>
				<rect x={-150} y={-200} width={300} height={360} rx={6} />
			</clipPath>
		</defs>
		<rect x={-180} y={-230} width={360} height={520} rx={14} fill="#f3e6c8" stroke="#7a5a32" strokeWidth={6} />
		<rect x={-150} y={-200} width={300} height={360} rx={6} fill="#d9c49a" />
		<g clipPath={`url(#${id}cl)`}>{children}</g>
		<text x={0} y={212} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#3a2a14">
			{caption}
		</text>
		{sub && (
			<text x={0} y={256} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#7a5a32">
				{sub}
			</text>
		)}
	</g>
);
// a hand bell (at its own origin: the handle top)
export const Bell: React.FC<{swing?: number; s?: number}> = ({swing = 0, s = 1}) => (
	<g transform={`scale(${s}) rotate(${swing})`}>
		<rect x={-8} y={0} width={16} height={36} rx={6} fill="#6a4a2a" />
		<path d="M -50,120 C -50,60 -30,36 0,36 C 30,36 50,60 50,120 L 60,132 L -60,132 Z" fill="#e6b84a" stroke="#8a6416" strokeWidth={6} strokeLinejoin="round" />
		<circle cx={0} cy={140} r={12} fill="#8a6416" />
	</g>
);
// a dashed rope from a to b
export const Rope: React.FC<{a: [number, number]; b: [number, number]; sag?: number}> = ({a, b, sag = 30}) => (
	<path d={`M ${a[0]},${a[1]} Q ${(a[0] + b[0]) / 2},${Math.max(a[1], b[1]) + sag} ${b[0]},${b[1]}`} stroke="#c9a35a" strokeWidth={5} fill="none" strokeDasharray="14 8" />
);
