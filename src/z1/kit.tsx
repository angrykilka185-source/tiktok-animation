// «Каково это — замёрзнуть насмерть» — 16:9 (1920×1080). The kit: a 2D camera with parallax layers, the HUD (body
// temperature + time in the water), the night ocean, the Titanic, the iceberg, lifeboats, «you» in the water in a
// cork life jacket, the body diagram (vessels, heart, heat), the thermometer, the cards.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Bust, Face} from '../components/Person';

export {HEAVY};
export const W = 1920;
export const H = 1080;
export const CX = W / 2;
export const CY = H / 2;
export const SANS = 'Inter, Arial, sans-serif';
export const SERIF = "'PT Serif', Georgia, serif";
export const RED = '#e0342b';
export const YEL = '#ffd34a';
export const ICE = '#9fd8ff';
export const INK = '#12141c';
export const E = Easing.inOut(Easing.cubic);
export const ES = Easing.inOut(Easing.sin);

// ============================================================ camera =====
export type Cam = {s: number; cx: number; cy: number};
// the camera transform for a layer at depth factor d (0 = still background … 1 = moves with the camera)
export const camT = (c: Cam, d = 1) => {
	const s = 1 + (c.s - 1) * d;
	const cx = CX + (c.cx - CX) * d;
	const cy = CY + (c.cy - CY) * d;
	return `translate(${CX},${CY}) scale(${s}) translate(${-cx},${-cy})`;
};
export const camAt = (f: number, a: number, b: number, c0: Cam, c1: Cam, ease = E): Cam => ({
	s: lerp(f, a, b, c0.s, c1.s, ease),
	cx: lerp(f, a, b, c0.cx, c1.cx, ease),
	cy: lerp(f, a, b, c0.cy, c1.cy, ease),
});
export const Stage16: React.FC<{bg?: string; children: React.ReactNode}> = ({bg = '#070b1c', children}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			{children}
		</svg>
	</AbsoluteFill>
);
export const Layer: React.FC<{cam: Cam; d?: number; children: React.ReactNode}> = ({cam, d = 1, children}) => <g transform={camT(cam, d)}>{children}</g>;

// deterministic noise
export const rnd = (i: number) => {
	const u = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return u - Math.floor(u);
};
// colour mix (#rrggbb)
export const mix = (a: string, b: string, t: number) => {
	const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
	const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
	const c = pa.map((v, k) => Math.round(v + (pb[k] - v) * Math.max(0, Math.min(1, t))));
	return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

// ============================================================ the night ocean =====
// sky down to the horizon (y = hz), moonless, full of stars; the sea below
export const NightSky: React.FC<{id: string; hz?: number; f: number; dawn?: number}> = ({id, hz = 600, f, dawn = 0}) => (
	<g>
		<defs>
			<linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={mix('#04060f', '#3a4a7a', dawn)} />
				<stop offset="0.7" stopColor={mix('#0c1636', '#c89a8a', dawn)} />
				<stop offset="1" stopColor={mix('#1a2a5a', '#f2c89a', dawn)} />
			</linearGradient>
		</defs>
		<rect x={-1200} y={-1200} width={4400} height={hz + 1200} fill={`url(#${id}-sky)`} />
		{Array.from({length: 130}).map((_, k) => {
			const tw = 0.55 + 0.45 * Math.sin(f / 9 + k * 1.7);
			return <circle key={k} cx={-600 + rnd(k) * 3200} cy={-400 + rnd(k + 300) * (hz + 360)} r={0.8 + rnd(k + 600) * 2.2} fill="#fff" opacity={(0.35 + 0.55 * rnd(k + 900)) * tw * (1 - dawn)} />;
		})}
	</g>
);
export const Sea: React.FC<{id: string; hz?: number; f: number; dawn?: number; calm?: boolean}> = ({id, hz = 600, f, dawn = 0, calm = true}) => (
	<g>
		<defs>
			<linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={mix('#0e1a3c', '#5a6a8a', dawn)} />
				<stop offset="1" stopColor={mix('#03060f', '#1a2a44', dawn)} />
			</linearGradient>
		</defs>
		<rect x={-1200} y={hz} width={4400} height={2200} fill={`url(#${id}-sea)`} />
		{Array.from({length: 26}).map((_, k) => {
			const y = hz + 10 + k * k * 2.4;
			const off = ((f * (0.4 + k * 0.05) + k * 90) % 260) - 130;
			return <path key={k} d={`M ${-800 + off},${y} q 60,${calm ? -3 : -8} 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0 t 120,0`} stroke="#9fb8e8" strokeWidth={1 + k * 0.08} fill="none" opacity={0.08 + k * 0.004} />;
		})}
	</g>
);

// ============================================================ the Titanic =====
// side view, bow to the left; waterline at y = 0; length ≈ 1600. lights 0…1
const FUNNELS = [-330, -110, 110, 330];
export const Titanic: React.FC<{lights?: number; smoke?: number; f?: number}> = ({lights = 1, smoke = 0, f = 0}) => (
	<g>
		{/* masts and wires */}
		<line x1={-640} y1={-60} x2={-610} y2={-560} stroke="#2a2a30" strokeWidth={8} />
		<line x1={600} y1={-60} x2={620} y2={-520} stroke="#2a2a30" strokeWidth={8} />
		<line x1={-610} y1={-540} x2={620} y2={-500} stroke="#2a2a30" strokeWidth={2} />
		{/* funnels with a little rake */}
		{FUNNELS.map((x, k) => (
			<g key={k} transform={`translate(${x},-235) skewX(-8)`}>
				<rect x={-34} y={-250} width={68} height={250} fill="#d89a4a" />
				<rect x={-34} y={-250} width={68} height={52} fill="#141418" />
				<rect x={-34} y={-250} width={68} height={250} fill="#000" opacity={0.12} transform="translate(34,0) scale(0.5,1)" />
				{smoke > 0 && k < 3 && (
					<g opacity={smoke}>
						{[0, 1, 2].map((q) => {
							const t = (f * 0.6 + q * 22 + k * 9) % 66;
							return <circle key={q} cx={6 + t * 2.2} cy={-270 - t * 1.6} r={24 + t * 0.7} fill="#3a3e4a" opacity={0.5 * (1 - t / 66)} />;
						})}
					</g>
				)}
			</g>
		))}
		{/* superstructure */}
		<path d="M -560,-150 L 560,-150 L 560,-236 L -540,-236 Z" fill="#f2efe6" />
		<rect x={-560} y={-170} width={1120} height={20} fill="#dcd8cc" />
		{Array.from({length: 46}).map((_, k) => (
			<rect key={k} x={-544 + k * 24} y={-218} width={12} height={16} fill={mix('#3a3a44', '#ffd98a', lights)} />
		))}
		{/* hull: black, with a gold line */}
		<path d="M -800,-150 L 760,-150 Q 810,-140 800,-40 L 780,40 L -720,40 Q -770,-40 -800,-150 Z" fill="#15161c" />
		<line x1={-790} y1={-140} x2={790} y2={-140} stroke="#c8a24a" strokeWidth={3} />
		{[-110, -70].map((y, r) =>
			Array.from({length: 58}).map((_, k) => <circle key={`${r}-${k}`} cx={-700 + k * 25} cy={y} r={4.5} fill={mix('#2a2a30', '#ffd98a', lights * (rnd(k + r * 70) > 0.12 ? 1 : 0.3))} />),
		)}
		{lights > 0 && <ellipse cx={0} cy={-120} rx={900} ry={160} fill="#ffd98a" opacity={0.08 * lights} />}
	</g>
);
// the iceberg: above-water part (local: waterline y = 0)
export const Iceberg: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M -300,0 L -240,-120 L -170,-160 L -120,-300 L -40,-380 L 30,-310 L 90,-340 L 160,-210 L 230,-170 L 300,0 Z" fill="#dcecf6" />
		<path d="M -40,-380 L 30,-310 L 0,-140 L -120,-300 Z" fill="#f6fbff" />
		<path d="M 90,-340 L 160,-210 L 230,-170 L 300,0 L 60,0 L 30,-310 Z" fill="#a8c8dc" />
		<path d="M -300,0 L -240,-120 L -170,-160 L -60,0 Z" fill="#c4dcea" />
		<path d="M -280,0 L 280,0 L 220,120 L -200,110 Z" fill="#6a9ab8" opacity={0.35} />
	</g>
);
// a lifeboat (side view, waterline y = 0); n heads; empty seats show as gaps
export const Lifeboat: React.FC<{n?: number; seats?: number; lantern?: number; s?: number; f?: number; tip?: number}> = ({n = 8, seats = 12, lantern = 0, s = 1, f = 0, tip = 0}) => (
	<g transform={`scale(${s}) rotate(${tip})`}>
		{Array.from({length: seats}).map((_, k) => {
			const x = -190 + k * (380 / (seats - 1));
			if (rnd(k + 40) > n / seats) return null;
			return (
				<g key={k}>
					<rect x={x - 13} y={-74} width={26} height={44} rx={8} fill={['#3a3a46', '#5a4a3a', '#2a3a4a', '#6a5a4a'][k % 4]} />
					<circle cx={x} cy={-86} r={13} fill="#e9c4a0" />
					{k % 3 === 0 && <rect x={x - 15} y={-104} width={30} height={10} rx={4} fill="#2a2a30" />}
					{k % 3 === 1 && <path d={`M ${x - 14},${-90} Q ${x},${-112} ${x + 14},${-90} Z`} fill="#6a4a3a" />}
				</g>
			);
		})}
		<path d="M -250,-40 L 250,-40 Q 270,-38 262,-20 L 230,20 L -230,20 L -262,-20 Q -270,-38 -250,-40 Z" fill="#f2efe6" />
		<rect x={-250} y={-44} width={500} height={10} rx={4} fill="#8a6a4a" />
		<path d="M -230,10 L 230,10" stroke="#c8c2b2" strokeWidth={4} />
		{lantern > 0 && (
			<g>
				<circle cx={210} cy={-70} r={70} fill="#ffd27a" opacity={0.18 * lantern} />
				<rect x={202} y={-82} width={16} height={22} rx={3} fill="#ffe2a0" opacity={lantern} />
			</g>
		)}
		{f > 0 && <line x1={-140} y1={-50} x2={-220 + Math.sin(f / 9) * 20} y2={30} stroke="#8a6a4a" strokeWidth={7} />}
	</g>
);

// ============================================================ breath, frost =====
// breath clouds from a mouth at (x, y); rate = puffs per second
export const Vapor: React.FC<{f: number; x: number; y: number; rate?: number; s?: number; dir?: number}> = ({f, x, y, rate = 0.5, s = 1, dir = 1}) => {
	const per = 30 / Math.max(0.1, rate);
	return (
		<g>
			{[0, 1].map((k) => {
				const t = (f + k * per * 0.5) % per;
				const life = Math.min(per, 40);
				if (t > life) return null;
				const p = t / life;
				return <circle key={k} cx={x + dir * p * 70 * s} cy={y - p * 30 * s} r={(10 + p * 36) * s} fill="#eef6ff" opacity={0.55 * (1 - p)} />;
			})}
		</g>
	);
};

// ============================================================ you, in the water =====
export const YOU1912 = {top: '#3a3a46', topDark: '#2b2b36', hair: '#5a3a26', skin: '#efbf98'};
const SKIN_COLD = '#c8c4d2';
// «you» up to the shoulders in the sea, in a cork life jacket. cold 0…1 (pale skin, frost on hair), shiver 0…1,
// breath = puffs/s. The local origin is the waterline under the chin (k = scale).
export const InWater: React.FC<{id: string; f: number; x: number; y: number; k?: number; face: Face; cold?: number; shiver?: number; breath?: number; tilt?: number; bob?: number; sea?: string; vest?: boolean; colors?: typeof YOU1912}> = ({
	id,
	f,
	x,
	y,
	k = 1,
	face,
	cold = 0,
	shiver = 0,
	breath = 0.4,
	tilt = 0,
	bob = 1,
	sea = '#0b1634',
	vest = true,
	colors = YOU1912,
}) => {
	const dy = Math.sin(f / 22) * 7 * k * bob;
	const dx = shiver > 0 ? Math.sin(f * 1.9) * 2.4 * k * shiver : 0;
	const skin = mix(colors.skin, SKIN_COLD, cold);
	return (
		<g transform={`translate(${x + dx},${y + dy})`}>
			<g transform={`scale(${k})`}>
				{/* head + shoulders (head centre at y = -250) */}
				<Bust kind="teen" id={id} x={0} y={-250} scale={1} colors={{...colors, skin}} plain={vest} tilt={tilt} face={{blush: false, glasses: false, ...face}} />
				{/* the cork life jacket: canvas straps and blocks over the shoulders and the chest */}
				{vest && [-1, 1].map((sd) => (
					<g key={sd}>
						<rect x={sd * 70 - 26} y={-150} width={52} height={150} rx={10} fill="#efe9da" />
						<rect x={sd * 70 - 26} y={-150} width={52} height={150} rx={10} fill="#000" opacity={sd > 0 ? 0.1 : 0} />
						{[0, 1, 2].map((q) => (
							<line key={q} x1={sd * 70 - 22} y1={-118 + q * 40} x2={sd * 70 + 22} y2={-118 + q * 40} stroke="#cfc6b0" strokeWidth={4} />
						))}
					</g>
				))}
				{vest && <rect x={-42} y={-132} width={84} height={14} rx={6} fill="#cfc6b0" />}
				{/* frost on the hair and the brows */}
				{cold > 0.35 &&
					Array.from({length: 18}).map((_, q) => (
						<circle key={q} cx={-80 + rnd(q + 11) * 160} cy={-350 + rnd(q + 31) * 70} r={2 + rnd(q + 51) * 3} fill="#f4fbff" opacity={Math.min(1, (cold - 0.35) * 2.2)} />
					))}
				{/* the water: rings around you and the surface over your chest */}
				{[0, 1].map((q) => {
					const t = (f * 0.6 + q * 30) % 60;
					return <ellipse key={q} cx={0} cy={-4} rx={150 + t * 3} ry={20 + t * 0.6} fill="none" stroke="#9fb8e8" strokeWidth={3} opacity={0.35 * (1 - t / 60)} />;
				})}
				<path d={`M -600,0 Q -300,${-10 + Math.sin(f / 14) * 6} 0,0 T 600,0 L 600,600 L -600,600 Z`} fill={sea} />
				<path d={`M -600,0 Q -300,${-10 + Math.sin(f / 14) * 6} 0,0 T 600,0`} stroke="#8aa8e0" strokeWidth={4} fill="none" opacity={0.55} />
			</g>
			{breath > 0 && <Vapor f={f} x={10 * k} y={-200 * k} rate={breath} s={k} />}
		</g>
	);
};

// ============================================================ the body diagram =====
// a glassy front silhouette with vessels. cold 0…1 (vessels of the arms/legs turn blue and thin), flush 0…1 (the skin
// glows red — the false heat), heat 0…1 (heat waves leave the body), beat = heart beats per second, shiver 0…1
export const BodyMap: React.FC<{f: number; x: number; y: number; s?: number; cold?: number; flush?: number; heat?: number; beat?: number; shiver?: number; core?: number; brain?: number; id: string}> = ({
	f,
	x,
	y,
	s = 1,
	cold = 0,
	flush = 0,
	heat = 0,
	beat = 1.2,
	shiver = 0,
	core = 1,
	brain = 1,
	id,
}) => {
	const pulse = 1 + 0.12 * Math.max(0, Math.sin(f * ((beat * Math.PI * 2) / 30))) ** 6;
	const limb = mix('#e0463a', '#4a7ad8', cold);
	const lw = 10 * (1 - cold * 0.6);
	const dx = shiver > 0 ? Math.sin(f * 1.9) * 2.5 * shiver : 0;
	const outline = '#9fd8ff';
	const fill = mix('#14203e', '#5a1e2a', flush);
	return (
		<g transform={`translate(${x + dx},${y}) scale(${s})`}>
			<defs>
				<radialGradient id={`${id}-core`}>
					<stop offset="0" stopColor="#ff6a4a" stopOpacity={0.7 * core} />
					<stop offset="1" stopColor="#ff6a4a" stopOpacity={0} />
				</radialGradient>
			</defs>
			{heat > 0 &&
				Array.from({length: 10}).map((_, k) => {
					const t = (f * 0.9 + k * 11) % 50;
					const a = (k / 10) * Math.PI * 2;
					const r = 260 + t * 4;
					return <path key={k} d={`M ${Math.cos(a) * r},${-60 + Math.sin(a) * r * 1.3} q 10,-14 0,-28 q -10,-14 0,-28`} stroke="#ff8a5a" strokeWidth={6} fill="none" opacity={heat * 0.8 * (1 - t / 50)} strokeLinecap="round" />;
				})}
			{/* the silhouette */}
			<g fill={fill} stroke={outline} strokeWidth={5} strokeLinejoin="round">
				<circle cx={0} cy={-330} r={62} />
				<rect x={-22} y={-276} width={44} height={40} />
				<path d="M -120,-240 Q 0,-262 120,-240 L 110,30 Q 0,52 -110,30 Z" />
				<path d="M -122,-232 Q -170,-200 -186,-40 L -196,80 L -160,84 L -140,-40 L -118,-150 Z" />
				<path d="M 122,-232 Q 170,-200 186,-40 L 196,80 L 160,84 L 140,-40 L 118,-150 Z" />
				<path d="M -104,30 L -96,360 L -40,360 L -14,40 Z" />
				<path d="M 104,30 L 96,360 L 40,360 L 14,40 Z" />
			</g>
			{flush > 0 && <ellipse cx={0} cy={-60} rx={240} ry={460} fill="#ff4a3a" opacity={0.12 * flush} />}
			{/* vessels: core red; arms and legs from red to blue */}
			<g fill="none" strokeLinecap="round">
				<path d="M -14,-170 L -14,-300" stroke="#e0463a" strokeWidth={10} />
				<path d="M -20,-200 Q -100,-220 -150,-120 L -176,70" stroke={limb} strokeWidth={lw} />
				<path d="M 0,-200 Q 100,-220 150,-120 L 176,70" stroke={limb} strokeWidth={lw} />
				<path d="M -10,-160 L -10,20" stroke="#e0463a" strokeWidth={12} />
				<path d="M -10,20 Q -50,40 -68,140 L -70,350" stroke={limb} strokeWidth={lw} />
				<path d="M -10,20 Q 30,40 56,140 L 68,350" stroke={limb} strokeWidth={lw} />
			</g>
			<circle cx={0} cy={-150} r={150} fill={`url(#${id}-core)`} />
			<circle cx={0} cy={-330} r={50} fill="#ff8a6a" opacity={0.25 * brain} />
			{/* the heart */}
			<g transform={`translate(-14,-170) scale(${pulse})`}>
				<path d="M 0,26 C -40,0 -36,-30 -14,-30 C -4,-30 0,-20 0,-14 C 0,-20 4,-30 14,-30 C 36,-30 40,0 0,26 Z" fill="#ff3a3a" />
			</g>
			{shiver > 0 &&
				[[-150, -80], [150, -80], [-70, 200], [70, 200], [-60, -120], [60, -120]].map(([mx, my], k) => (
					<path key={k} d={`M ${mx - 18},${my} l 9,-12 l 9,12 l 9,-12 l 9,12`} stroke="#ffd34a" strokeWidth={5} fill="none" opacity={shiver * (0.6 + 0.4 * Math.sin(f / 3 + k))} />
				))}
		</g>
	);
};

// a thermometer (screen coords): value in °C between lo and hi
export const Thermo: React.FC<{x: number; y: number; v: number; lo?: number; hi?: number; h?: number; label?: boolean}> = ({x, y, v, lo = 10, hi = 40, h = 520, label = true}) => {
	const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
	const col = v >= 36 ? '#e0463a' : v >= 32 ? '#f08a4a' : v >= 28 ? '#7aa8f0' : '#4a7ad8';
	return (
		<g transform={`translate(${x},${y})`}>
			<rect x={-26} y={-h} width={52} height={h + 10} rx={26} fill="#eef4fa" stroke="#1d1d24" strokeWidth={6} />
			<rect x={-14} y={-h * t + 6} width={28} height={h * t} rx={14} fill={col} />
			<circle cx={0} cy={36} r={46} fill={col} stroke="#1d1d24" strokeWidth={6} />
			{[0, 0.25, 0.5, 0.75, 1].map((q) => (
				<line key={q} x1={26} y1={-q * h + 6} x2={50} y2={-q * h + 6} stroke="#eef4fa" strokeWidth={5} />
			))}
			{label && (
				<text x={70} y={-h * t + 22} fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">
					{v.toFixed(1).replace('.', ',')}°
				</text>
			)}
		</g>
	);
};

// ============================================================ HUD =====
// the body temperature (left) and the time in the water (right). Ticks: at frame `at` the values start moving to
// the new ones over `len` frames.
export type ZTick = {at: number; temp: number; mins?: number; len?: number};
export const HUDZ: React.FC<{ticks: ZTick[]; show: [number, number]; timer: [number, number]}> = ({ticks, show, timer}) => {
	const f = useCurrentFrame();
	if (f < show[0] - 12 || f > show[1] + 12) return null;
	const o = Math.min(interpolate(f, [show[0], show[0] + 12], [0, 1], clamp), interpolate(f, [show[1], show[1] + 12], [1, 0], clamp));
	if (o <= 0) return null;
	// value at frame f: between the previous tick's value and this one
	let temp = ticks[0].temp;
	let mins = ticks[0].mins ?? 0;
	let prevT = temp;
	let prevM = mins;
	for (const k of ticks) {
		if (f < k.at) break;
		const p = interpolate(f, [k.at, k.at + (k.len ?? 40)], [0, 1], {...clamp, easing: ES});
		temp = prevT + (k.temp - prevT) * p;
		mins = prevM + ((k.mins ?? prevM) - prevM) * p;
		prevT = k.temp;
		prevM = k.mins ?? prevM;
	}
	const cold = Math.max(0, Math.min(1, (36.6 - temp) / 8.6));
	const col = mix('#ff6a5a', '#7ab8ff', cold);
	const showTimer = f >= timer[0] && f <= timer[1] + 12;
	const to = Math.min(interpolate(f, [timer[0], timer[0] + 12], [0, 1], clamp), interpolate(f, [timer[1], timer[1] + 12], [1, 0], clamp));
	const mm = Math.floor(mins);
	const ss = Math.floor((mins - mm) * 60);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: 40, top: 34, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,14,24,0.86)', border: `4px solid ${col}`, borderRadius: 18, padding: '10px 24px 10px 18px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<svg width={34} height={70} viewBox="0 0 34 70">
					<rect x={10} y={2} width={14} height={50} rx={7} fill="#eef4fa" />
					<rect x={13} y={52 - 46 * (1 - cold * 0.8)} width={8} height={46 * (1 - cold * 0.8)} rx={4} fill={col} />
					<circle cx={17} cy={56} r={12} fill={col} />
				</svg>
				<div>
					<div style={{fontSize: 22, color: '#9fb0c8', letterSpacing: 2}}>ТЕМПЕРАТУРА ТЕЛА</div>
					<div style={{fontSize: 54, lineHeight: 1, color: col, fontFamily: "'JetBrains Mono', monospace"}}>{temp.toFixed(1).replace('.', ',')}°</div>
				</div>
			</div>
			{showTimer && to > 0 && (
				<div style={{position: 'absolute', right: 40, top: 34, opacity: to, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(10,14,24,0.86)', border: '4px solid #4a5a7a', borderRadius: 18, padding: '12px 24px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
					<div>
						<div style={{fontSize: 22, color: '#9fb0c8', letterSpacing: 2}}>В ВОДЕ · −2°</div>
						<div style={{fontSize: 54, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace"}}>
							{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// ============================================================ titles & cards =====
export const BigTitle: React.FC<{f: number; at?: number; lines: string[]; y?: number; size?: number; color?: string; out?: number}> = ({f, at = 0, lines, y = 380, size = 110, color = '#fff', out}) => {
	if (f < at) return null;
	const p = pop(f, at, 13);
	const o = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${0.75 + 0.25 * p})`, opacity: o * Math.min(1, p * 1.4)}}>
			{lines.map((l, k) => (
				<div key={k} style={{fontFamily: HEAVY, fontWeight: 900, fontSize: size * (k === 0 ? 1 : 0.92), lineHeight: 1.04, color: k === lines.length - 1 && lines.length > 1 ? ICE : color, textShadow: '0 8px 0 rgba(0,0,0,0.35), 5px 5px 0 #12141c, -5px 5px 0 #12141c, 5px -5px 0 #12141c, -5px -5px 0 #12141c'}}>
					{l}
				</div>
			))}
		</div>
	);
};
// a fact plaque (screen coords, centre)
export const Plaque: React.FC<{f: number; at: number; x: number; y: number; text: string; sub?: string; color?: string; size?: number; to?: number; rot?: number}> = ({f, at, x, y, text, sub, color = ICE, size = 46, to, rot = 0}) => {
	if (f < at || (to !== undefined && f > to + 10)) return null;
	const p = pop(f, at, 12) * (to !== undefined ? interpolate(f, [to, to + 10], [1, 0], clamp) : 1);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, background: 'rgba(10,14,24,0.9)', borderLeft: `10px solid ${color}`, borderRadius: 16, padding: '14px 30px', color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', textAlign: 'center'}}>
			{text}
			{sub && <div style={{fontSize: size * 0.5, color: '#b8c4d8', marginTop: 6, letterSpacing: 1}}>{sub}</div>}
		</div>
	);
};
// a dark vignette + a cold tint (0…1)
export const ColdGrade: React.FC<{cold?: number; vig?: number}> = ({cold = 0, vig = 0.55}) => (
	<>
		{cold > 0 && <AbsoluteFill style={{background: '#2a4a8a', opacity: 0.18 * cold, mixBlendMode: 'multiply'}} />}
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,10,${vig}) 100%)`}} />
	</>
);
// a soft white flash at the start of a shot
export const Flash: React.FC<{f: number; len?: number; color?: string}> = ({f, len = 10, color = '#eaf4ff'}) => {
	const o = interpolate(f, [0, len], [0.9, 0], clamp);
	return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};
export const _K = {lerp};
