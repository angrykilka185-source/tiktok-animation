// «Каково это — умереть от лап медведя» — 16:9 (1920×1080). The kit: the forest (day, dusk, night, autumn, winter) seen
// from the side with its path (everyone stands on GROUND), spruces, birches, bushes; the tent, the den in the snow (and
// in section), the village at night, Alaska; Гога's headphones, the snacks, the bear spray, tracks in the snow; the HUD
// with Гога's six mistakes. The bear is src/components/Bear.tsx; Гога is «You» from the thirst film (src/z2/kit.tsx).
import React from 'react';
import {interpolate} from 'remotion';
import {clamp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {mix, rnd} from '../z1/kit';

export {BigTitle, camAt, camT, ICE, INK, Layer, mix, Plaque, RED, rnd, Stage16, YEL} from '../z1/kit';
export {arm, armTo, Chip, hangTo, Moon, You} from '../z2/kit';
export {Phone, Vig} from '../z3/kit';
export {HEAVY};

const INKC = '#16161c';
const REDC = '#e8352e';

// everyone in the forest stands on this line
export const GROUND = 830; // above the captions (they sit on the grass in front)

// ============================================================ the HUD: Гога's mistakes =====
export const HUDB: React.FC<{f: number; mist: number[]; show: [number, number]}> = ({f, mist, show}) => {
	const o = interpolate(f, [show[0], show[0] + 10, show[1] - 10, show[1]], [0, 1, 1, 0], clamp);
	if (o <= 0) return null;
	const n = mist.filter((m) => f >= m).length;
	return (
		<div style={{position: 'absolute', top: 24, left: 24, opacity: o, background: 'rgba(10,12,20,0.86)', border: '3px solid rgba(255,255,255,0.14)', borderRadius: 18, padding: '10px 18px', color: '#fff', fontFamily: HEAVY, fontWeight: 900}}>
			<div style={{fontSize: 18, letterSpacing: 2, opacity: 0.75, marginBottom: 6}}>
				ОШИБКИ ГОГИ · {n}/{mist.length}
			</div>
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
	);
};

// ============================================================ the forest =====
export type Tone = 'day' | 'dusk' | 'night' | 'autumn' | 'winter' | 'wnight';
type Pal = {sky0: string; sky1: string; far: string; mid: string; midD: string; trunk: string; ground: string; groundD: string; path: string; bush: string; snow: boolean};
export const PALS: Record<Tone, Pal> = {
	day: {sky0: '#8fc8ee', sky1: '#d6eedb', far: '#7fa98a', mid: '#2f6a48', midD: '#24563a', trunk: '#6a4628', ground: '#7aad58', groundD: '#5f9246', path: '#c9a26a', bush: '#3f8250', snow: false},
	dusk: {sky0: '#f0905a', sky1: '#f6d29a', far: '#8a6a6a', mid: '#3a4a3a', midD: '#2c382c', trunk: '#4a3020', ground: '#6a7a40', groundD: '#56663a', path: '#a8805a', bush: '#3a5a3a', snow: false},
	night: {sky0: '#060a1e', sky1: '#1b2550', far: '#1e2a40', mid: '#152030', midD: '#0f1826', trunk: '#1d1a20', ground: '#1f3020', groundD: '#18261a', path: '#3a3328', bush: '#14261a', snow: false},
	autumn: {sky0: '#9cc6e6', sky1: '#f2e6c8', far: '#b0987a', mid: '#4a6a3a', midD: '#3a5430', trunk: '#6a4628', ground: '#b08a4a', groundD: '#967238', path: '#c9a26a', bush: '#c0702a', snow: false},
	winter: {sky0: '#bcd8ee', sky1: '#eef5fb', far: '#a8bccb', mid: '#2f5a48', midD: '#244a3a', trunk: '#5a4030', ground: '#f4f8fb', groundD: '#dbe6ef', path: '#e4ecf3', bush: '#3a6a52', snow: true},
	wnight: {sky0: '#060a1e', sky1: '#1d2a54', far: '#263650', mid: '#152a2a', midD: '#0f2020', trunk: '#2a2226', ground: '#b8c6dc', groundD: '#93a3bf', path: '#a9b8d0', bush: '#163028', snow: true},
};

// a spruce: tiers of branches on a trunk (x, y = the ground at its foot, h = height); snow on the tiers in winter
export const Spruce: React.FC<{x: number; y: number; h: number; c: string; d: string; trunk: string; snow?: boolean}> = ({x, y, h, c, d, trunk, snow = false}) => {
	const w = h * 0.42;
	const tiers = 4;
	return (
		<g transform={`translate(${x},${y})`}>
			<rect x={-h * 0.03} y={-h * 0.16} width={h * 0.06} height={h * 0.16} fill={trunk} />
			{Array.from({length: tiers}).map((_, k) => {
				const t = k / tiers;
				const top = -h * (0.32 + t * 0.62) - h * 0.12;
				const bot = -h * (0.12 + t * 0.6);
				const hw = w * (1 - t * 0.62) * 0.5;
				return (
					<g key={k}>
						<path d={`M 0,${top} L ${hw},${bot} L ${-hw},${bot} Z`} fill={c} />
						<path d={`M 0,${top} L ${hw},${bot} L ${hw * 0.2},${bot} Z`} fill={d} />
						{snow && <path d={`M 0,${top} L ${hw * 0.55},${top + (bot - top) * 0.55} q ${-hw * 0.3},10 ${-hw * 0.55},0 q ${-hw * 0.3},-8 ${-hw * 0.55},0 Z`} fill="#ffffff" />}
					</g>
				);
			})}
		</g>
	);
};
// a birch: a white trunk with black marks and a light crown
export const Birch: React.FC<{x: number; y: number; h: number; leaves: string}> = ({x, y, h, leaves}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-h * 0.025} y={-h} width={h * 0.05} height={h} fill="#f2efe6" />
		{[0.2, 0.38, 0.55, 0.7].map((t, k) => (
			<rect key={k} x={-h * 0.025 + (k % 2) * h * 0.02} y={-h * t} width={h * 0.03} height={h * 0.012} fill="#2a2a2a" />
		))}
		{[
			[0, -0.92, 0.2],
			[-0.12, -0.8, 0.16],
			[0.13, -0.78, 0.17],
			[0, -0.68, 0.15],
		].map(([dx, dy, r], k) => (
			<circle key={k} cx={h * dx} cy={h * dy} r={h * r} fill={leaves} />
		))}
	</g>
);
// a bush (it shakes when something moves in it; k scales the sway, so it can die down)
export const Bush: React.FC<{x: number; y: number; s?: number; c: string; shake?: number; k?: number}> = ({x, y, s = 1, c, shake = 0, k = 1}) => (
	<g transform={`translate(${x + Math.sin(shake * 3) * 6 * Math.min(1, Math.abs(shake)) * k},${y}) scale(${s})`}>
		{[
			[-60, -40, 50],
			[0, -60, 62],
			[60, -38, 48],
			[-24, -20, 46],
			[34, -18, 44],
		].map(([dx, dy, r], k) => (
			<circle key={k} cx={dx} cy={dy} r={r} fill={c} />
		))}
		<path d="M -100,0 L 100,0" stroke="#000" strokeOpacity={0.15} strokeWidth={6} />
	</g>
);

// the forest from the side: the sky, a far tree line, a row of spruces and birches, the forest floor with its path.
// seed varies the trees; `path` draws the path along the ground; `near` adds foreground trunks at the edges
export const Forest: React.FC<{tone?: Tone; seed?: number; path?: boolean; near?: boolean; w?: number}> = ({tone = 'day', seed = 1, path = true, near = true, w = 1920}) => {
	const P = PALS[tone];
	const night = tone === 'night' || tone === 'wnight';
	return (
		<g>
			<defs>
				<linearGradient id={`fsky${tone}${seed}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={P.sky0} />
					<stop offset="1" stopColor={P.sky1} />
				</linearGradient>
			</defs>
			<rect x={-400} y={-400} width={w + 800} height={1900} fill={`url(#fsky${tone}${seed})`} />
			{night &&
				Array.from({length: 60}).map((_, i) => (
					<circle key={i} cx={rnd(i + seed * 7) * w} cy={rnd(i + 40 + seed) * 420} r={1 + rnd(i + 90) * 2} fill="#ffffff" opacity={0.35 + rnd(i) * 0.5} />
				))}
			{/* the far tree line */}
			<path
				d={`M -400,${GROUND - 290} ${Array.from({length: Math.ceil((w + 800) / 80)})
					.map((_, i) => {
						const x = -400 + i * 80;
						const hh = 70 + rnd(i + seed * 13) * 80;
						return `L ${x + 40},${GROUND - 290 - hh} L ${x + 80},${GROUND - 290}`;
					})
					.join(' ')} L ${w + 400},${GROUND - 150} L -400,${GROUND - 150} Z`}
				fill={P.far}
			/>
			{P.snow && <rect x={-400} y={GROUND - 230} width={w + 800} height={90} fill={P.groundD} />}
			{/* the row of trees behind the path */}
			{Array.from({length: Math.ceil((w + 400) / 140)}).map((_, i) => {
				const x = -120 + i * 140 + (rnd(i + seed * 3) - 0.5) * 70;
				const h = 420 + rnd(i + seed * 5) * 260;
				const birch = !P.snow && rnd(i + seed * 11) > 0.72;
				return birch ? <Birch key={i} x={x} y={GROUND - 130} h={h * 0.9} leaves={tone === 'autumn' ? '#e8b03a' : night ? '#20301e' : '#8fbf5a'} /> : <Spruce key={i} x={x} y={GROUND - 130} h={h} c={P.mid} d={P.midD} trunk={P.trunk} snow={P.snow} />;
			})}
			{/* the forest floor */}
			<rect x={-400} y={GROUND - 140} width={w + 800} height={900} fill={P.ground} />
			<path d={`M -400,${GROUND - 130} C 300,${GROUND - 150} 900,${GROUND - 110} 1500,${GROUND - 134} C 1800,${GROUND - 144} 2100,${GROUND - 130} ${w + 400},${GROUND - 134} L ${w + 400},${GROUND - 90} L -400,${GROUND - 90} Z`} fill={P.groundD} opacity={0.6} />
			{path && <path d={`M -400,${GROUND - 34} C 400,${GROUND - 44} 1200,${GROUND - 24} ${w + 400},${GROUND - 36} L ${w + 400},${GROUND + 44} C 1200,${GROUND + 56} 400,${GROUND + 36} -400,${GROUND + 46} Z`} fill={P.path} />}
			{/* grass tufts and leaves (snow lumps in winter) */}
			{Array.from({length: 26}).map((_, i) => {
				const x = rnd(i + seed * 17) * w;
				const y = GROUND - 90 + rnd(i + seed * 19) * 320;
				if (path && Math.abs(y - GROUND) < 60) return null;
				return P.snow ? <ellipse key={i} cx={x} cy={y} rx={30} ry={8} fill="#ffffff" opacity={0.8} /> : <path key={i} d={`M ${x - 12},${y} l 4,-22 l 6,18 l 6,-24 l 4,26 Z`} fill={P.groundD} />;
			})}
			{near && (
				<g>
					<Bush x={90} y={1080} s={1.4} c={P.bush} />
					<Bush x={1840} y={1086} s={1.2} c={P.bush} />
				</g>
			)}
			{night && <rect x={-400} y={-400} width={w + 800} height={1900} fill="#0a1030" opacity={0.25} />}
		</g>
	);
};

// ============================================================ things =====
// headphones on Гога's head (drawn in his own units through You's `outer`)
export const Headphones: React.FC<{on?: boolean}> = ({on = true}) =>
	on ? (
		<g>
			<path d="M -134,-560 C -150,-760 150,-760 134,-560" stroke="#2a2a30" strokeWidth={20} fill="none" strokeLinecap="round" />
			{[-1, 1].map((sd) => (
				<g key={sd}>
					<rect x={sd * 140 - 26} y={-610} width={52} height={96} rx={22} fill="#2f86e0" stroke="#1d4f8a" strokeWidth={6} />
					<rect x={sd * 140 - 12} y={-596} width={24} height={68} rx={10} fill="#5aa6f0" />
				</g>
			))}
		</g>
	) : null;
// music notes rising from the headphones (screen units)
export const Notes: React.FC<{f: number; x: number; y: number; k?: number}> = ({f, x, y, k = 1}) => (
	<g opacity={k}>
		{[0, 1, 2].map((i) => {
			const t = ((f / 40 + i / 3) % 1);
			return (
				<g key={i} transform={`translate(${x + Math.sin(t * 6 + i) * 30 + i * 30},${y - t * 160}) scale(${0.8 + t * 0.4})`} opacity={1 - t}>
					<path d="M 0,0 L 0,-40 L 22,-46 L 22,-8" stroke="#2f86e0" strokeWidth={6} fill="none" />
					<ellipse cx={-6} cy={0} rx={10} ry={8} fill="#2f86e0" />
					<ellipse cx={16} cy={-8} rx={10} ry={8} fill="#2f86e0" />
				</g>
			);
		})}
	</g>
);
// a dome tent (x, y = the middle of its floor); glow: the light inside at night
export const Tent: React.FC<{x: number; y: number; s?: number; glow?: number; open?: number}> = ({x, y, s = 1, glow = 0, open = 0.5}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={4} rx={250} ry={24} fill="#000" opacity={0.2} />
		<path d="M -230,0 C -220,-220 220,-220 230,0 Z" fill={mix('#e07a2a', '#ffd27a', glow * 0.6)} stroke="#7a3a10" strokeWidth={7} strokeLinejoin="round" />
		<path d="M -230,0 C -120,-150 120,-150 230,0" stroke="#7a3a10" strokeWidth={5} fill="none" opacity={0.6} />
		<path d="M 0,-166 L 0,0" stroke="#7a3a10" strokeWidth={5} opacity={0.6} />
		{/* the door */}
		<path d={`M -70,0 C -60,-110 60,-110 70,0 Z`} fill={glow > 0 ? mix('#3a2a20', '#ffe9a0', glow) : '#3a2418'} />
		<path d={`M -70,0 C -60,-110 ${-60 + open * 40},-110 ${-70 + open * 60},0 Z`} fill="#c8641e" stroke="#7a3a10" strokeWidth={4} />
		{glow > 0 && <ellipse cx={0} cy={-60} rx={300} ry={180} fill="#ffd27a" opacity={0.12 * glow} />}
	</g>
);
// the snacks Гога takes into the tent: a sausage, a tin of condensed milk, a bag of crisps (at the origin, ~100 wide)
export const Sausage: React.FC = () => (
	<g>
		<path d="M -60,0 C -60,-24 60,-24 60,0 C 60,24 -60,24 -60,0 Z" fill="#b8434a" stroke="#6a1a20" strokeWidth={5} />
		<circle cx={-20} cy={-4} r={5} fill="#f0c0c0" />
		<circle cx={12} cy={6} r={5} fill="#f0c0c0" />
		<path d="M 60,0 l 14,-8 m -14,8 l 14,8" stroke="#c9a35a" strokeWidth={4} />
	</g>
);
export const MilkTin: React.FC = () => (
	<g>
		<rect x={-34} y={-30} width={68} height={60} rx={8} fill="#2f6fd0" stroke="#1d3f7a" strokeWidth={5} />
		<rect x={-34} y={-10} width={68} height={22} fill="#ffffff" />
		<text x={0} y={7} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={14} fill="#2f6fd0">
			СГУЩЁНКА
		</text>
	</g>
);
export const Crisps: React.FC = () => (
	<g>
		<path d="M -40,-50 L 40,-50 L 46,50 L -46,50 Z" fill="#f2c230" stroke="#9a6a10" strokeWidth={5} strokeLinejoin="round" />
		<path d="M -40,-50 l 8,-8 l 8,8 l 8,-8 l 8,8 l 8,-8 l 8,8 l 8,-8 l 8,8 l 8,-8 l 8,8" stroke="#9a6a10" strokeWidth={4} fill="none" />
		<circle cx={0} cy={4} r={22} fill="#ffe27a" stroke="#9a6a10" strokeWidth={4} />
		<text x={0} y={42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={16} fill="#9a2a10">
			ЧИПСЫ
		</text>
	</g>
);
// a can of bear spray (at the origin, the nozzle up)
export const SprayCan: React.FC = () => (
	<g>
		<rect x={-22} y={-60} width={44} height={110} rx={10} fill="#d8282a" stroke="#7a0d0a" strokeWidth={5} />
		<rect x={-22} y={-20} width={44} height={30} fill="#ffffff" />
		<rect x={-12} y={-80} width={24} height={22} rx={4} fill="#2a2a30" />
		<rect x={-26} y={-92} width={30} height={14} rx={4} fill="#ffb020" />
	</g>
);
// the cloud of pepper spray from (x, y) along dir (degrees), p 0…1
export const SprayCloud: React.FC<{x: number; y: number; dir?: number; p: number}> = ({x, y, dir = 0, p}) => (
	<g transform={`translate(${x},${y}) rotate(${dir})`} opacity={Math.min(1, p * 3) * (1 - Math.max(0, p - 0.7) / 0.3) * 0.9}>
		{Array.from({length: 14}).map((_, i) => {
			const t = Math.min(1, p * 1.4 - i * 0.03);
			if (t <= 0) return null;
			return <circle key={i} cx={t * (180 + i * 22)} cy={(rnd(i + 3) - 0.5) * 90 * t} r={30 + t * 50 * (0.6 + rnd(i) * 0.6)} fill={i % 2 ? '#ff8a3a' : '#ffb060'} opacity={0.55} />;
		})}
	</g>
);
// a bear's footprint in the snow (at the origin, pointing up)
export const Track: React.FC<{s?: number; c?: string}> = ({s = 1, c = '#9aaccc'}) => (
	<g transform={`scale(${s})`}>
		<ellipse cx={0} cy={10} rx={26} ry={32} fill={c} />
		{[-24, -8, 8, 24].map((dx, k) => (
			<circle key={k} cx={dx} cy={-32 - (k === 1 || k === 2 ? 6 : 0)} r={9} fill={c} />
		))}
	</g>
);
// a snow mound under a spruce with a breathing hole and hoarfrost round it (x, y = the ground)
export const Den: React.FC<{x: number; y: number; s?: number; steam?: number; f?: number}> = ({x, y, s = 1, steam = 0, f = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -260,0 C -240,-170 240,-170 260,0 Z" fill="#f4f8fb" stroke="#c9d8e6" strokeWidth={6} />
		<path d="M -180,-40 C -120,-90 80,-110 160,-60" stroke="#dbe6ef" strokeWidth={14} fill="none" strokeLinecap="round" />
		<ellipse cx={-30} cy={-112} rx={26} ry={14} fill="#2a3448" />
		{Array.from({length: 10}).map((_, i) => {
			const a = (i / 10) * Math.PI * 2;
			return <path key={i} d={`M ${-30 + Math.cos(a) * 34},${-112 + Math.sin(a) * 20} l ${Math.cos(a) * 14},${Math.sin(a) * 10}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />;
		})}
		{steam > 0 &&
			[0, 1].map((i) => {
				const t = ((f / 50 + i / 2) % 1);
				return <path key={i} d={`M ${-30 + Math.sin(t * 5) * 8},${-124 - t * 70} q 10,-16 0,-30`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.7 * steam} />;
			})}
	</g>
);
// a village at night: log houses with lit windows, a fence, snow on the roofs (x, y = the ground)
export const Village: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[0, 1, 2].map((k) => {
			const hx = k * 330;
			const hh = 170 + (k % 2) * 30;
			return (
				<g key={k} transform={`translate(${hx},0)`}>
					<rect x={-120} y={-hh} width={240} height={hh} fill="#5a3a24" stroke="#2a180a" strokeWidth={6} />
					{Array.from({length: 6}).map((_, i) => (
						<line key={i} x1={-120} y1={-hh + 14 + i * (hh / 6)} x2={120} y2={-hh + 14 + i * (hh / 6)} stroke="#3a2414" strokeWidth={4} />
					))}
					<path d={`M -150,${-hh} L 0,${-hh - 120} L 150,${-hh} Z`} fill="#3a3a48" stroke="#1d1d26" strokeWidth={6} />
					<path d={`M -150,${-hh} L 0,${-hh - 120} L 150,${-hh} L 120,${-hh - 6} L 0,${-hh - 100} L -120,${-hh - 6} Z`} fill="#ffffff" />
					<rect x={-50} y={-hh + 50} width={100} height={70} fill="#ffd36a" stroke="#2a180a" strokeWidth={6} />
					<path d={`M 0,${-hh + 50} L 0,${-hh + 120} M -50,${-hh + 85} L 50,${-hh + 85}`} stroke="#2a180a" strokeWidth={5} />
					<ellipse cx={0} cy={-hh + 85} rx={150} ry={90} fill="#ffd36a" opacity={0.12} />
				</g>
			);
		})}
		{Array.from({length: 16}).map((_, i) => (
			<rect key={i} x={-200 + i * 60} y={-80} width={14} height={80} fill="#6a4a30" />
		))}
		<rect x={-200} y={-60} width={960} height={10} fill="#6a4a30" />
	</g>
);
// a mountain range with snowy peaks (Alaska), drawn behind the ground line y
export const Mountains: React.FC<{y: number; c?: string}> = ({y, c = '#7a8aa6'}) => (
	<g>
		{[
			[-100, 520, 380],
			[380, 640, 460],
			[900, 560, 420],
			[1400, 700, 480],
			[1900, 560, 400],
		].map(([mx, mh, mw], k) => (
			<g key={k}>
				<path d={`M ${mx - mw},${y} L ${mx},${y - mh} L ${mx + mw},${y} Z`} fill={k % 2 ? c : mix(c, '#5a6a86', 0.4)} />
				<path d={`M ${mx},${y - mh} L ${mx + mw * 0.28},${y - mh * 0.72} L ${mx + mw * 0.1},${y - mh * 0.76} L ${mx - mw * 0.06},${y - mh * 0.7} L ${mx - mw * 0.26},${y - mh * 0.74} Z`} fill="#ffffff" />
			</g>
		))}
	</g>
);
// a falling snowflake field (screen units)
export const Snowfall: React.FC<{f: number; n?: number; k?: number}> = ({f, n = 50, k = 1}) => (
	<g opacity={k}>
		{Array.from({length: n}).map((_, i) => {
			const sp = 1.2 + rnd(i + 5) * 1.8;
			const y = ((rnd(i + 9) * 1080 + f * sp) % 1140) - 30;
			const x = rnd(i + 13) * 1920 + Math.sin(f / 30 + i) * 20;
			return <circle key={i} cx={x} cy={y} r={2 + rnd(i) * 4} fill="#ffffff" opacity={0.8} />;
		})}
	</g>
);
export const _K = {INKC};
