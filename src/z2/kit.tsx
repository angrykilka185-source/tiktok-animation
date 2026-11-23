// «Каково это — умереть от жажды» — 16:9 (1920×1080). The kit: the desert at any time of day (the sky, the sun / the
// moon and the stars, three layers of dunes with parallax, the heat shimmer), the sandstorm, the runner («ты») in a
// cap with a backpack and a flask, the HUD (water lost, hours without water, the air), small props.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Person, type ArmPose, type Face} from '../components/Person';
import {camT as camTf, mix, rnd} from '../z1/kit';

export {BigTitle, camAt, camT, CX, CY, E, ES, H, ICE, INK, Layer, mix, Plaque, RED, rnd, Stage16, W, YEL} from '../z1/kit';
export type {Cam} from '../z1/kit';
export {HEAVY};

// ============================================================ palettes by the time of day =====
export type Pal = {skyTop: string; skyMid: string; skyLow: string; far: string; mid: string; near: string; crest: string; shade: string};
export const NOON: Pal = {skyTop: '#3f8fdc', skyMid: '#9cc8ea', skyLow: '#f6e6c4', far: '#efcf98', mid: '#e7b66e', near: '#dc9f55', crest: '#fbe6bc', shade: '#b97a3c'};
export const MORNING: Pal = {skyTop: '#5f9fd8', skyMid: '#b9d6ec', skyLow: '#fbe3b6', far: '#f0cf9c', mid: '#e8b874', near: '#dca15c', crest: '#fde9c4', shade: '#b47b42'};
export const SUNSET: Pal = {skyTop: '#2c2c66', skyMid: '#d4604a', skyLow: '#f7b062', far: '#cf7e4c', mid: '#b8623c', near: '#984a2e', crest: '#f0a066', shade: '#6e3020'};
export const NIGHT: Pal = {skyTop: '#03061a', skyMid: '#0b1638', skyLow: '#1d2c5c', far: '#2a3256', mid: '#20274a', near: '#181d3a', crest: '#3c4a7c', shade: '#10142a'};
export const DAWN: Pal = {skyTop: '#2a3a7c', skyMid: '#a07a9a', skyLow: '#f3b384', far: '#c99a80', mid: '#b88064', near: '#9e6a50', crest: '#e8b090', shade: '#6a4434'};
export const STORM: Pal = {skyTop: '#9a4a1e', skyMid: '#c8742e', skyLow: '#e8a456', far: '#c98a4e', mid: '#b6733c', near: '#a0602e', crest: '#d89a5a', shade: '#7a4420'};
export const HOT: Pal = {skyTop: '#6aa6d8', skyMid: '#d8d8c8', skyLow: '#fff0cc', far: '#f3d6a2', mid: '#eabd78', near: '#e0a65e', crest: '#fff0cc', shade: '#c08040'};
export const mixPal = (a: Pal, b: Pal, t: number): Pal => {
	const o = {} as Pal;
	(Object.keys(a) as (keyof Pal)[]).forEach((k) => (o[k] = mix(a[k], b[k], t)));
	return o;
};

// ============================================================ the sky =====
export const Sky: React.FC<{id: string; p: Pal; f?: number; stars?: number; hz?: number}> = ({id, p, f = 0, stars = 0, hz = 640}) => (
	<g>
		<defs>
			<linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={p.skyTop} />
				<stop offset="0.62" stopColor={p.skyMid} />
				<stop offset="1" stopColor={p.skyLow} />
			</linearGradient>
		</defs>
		<rect x={-2000} y={-1400} width={6000} height={hz + 1500} fill={`url(#${id}-sky)`} />
		{stars > 0 &&
			Array.from({length: 150}).map((_, k) => {
				const tw = 0.6 + 0.4 * Math.sin(f / 11 + k * 1.7);
				return <circle key={k} cx={-400 + rnd(k) * 2700} cy={-300 + rnd(k + 300) * (hz + 200)} r={0.9 + rnd(k + 600) * 2.3} fill="#fff" opacity={stars * (0.35 + 0.6 * rnd(k + 900)) * tw} />;
			})}
	</g>
);
export const SunDisk: React.FC<{x: number; y: number; r?: number; color?: string; glow?: number}> = ({x, y, r = 70, color = '#fff6d8', glow = 1}) => (
	<g>
		<circle cx={x} cy={y} r={r * 5} fill={color} opacity={0.12 * glow} />
		<circle cx={x} cy={y} r={r * 2.6} fill={color} opacity={0.2 * glow} />
		<circle cx={x} cy={y} r={r * 1.5} fill={color} opacity={0.35 * glow} />
		<circle cx={x} cy={y} r={r} fill={color} />
	</g>
);
export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 46}) => (
	<g>
		<circle cx={x} cy={y} r={r * 3} fill="#cfe0ff" opacity={0.08} />
		<circle cx={x} cy={y} r={r} fill="#f2f4ea" />
		<circle cx={x + r * 0.42} cy={y - r * 0.2} r={r * 0.92} fill="#0b1638" opacity={0.92} />
	</g>
);

// ============================================================ the dunes =====
// a smooth dune line through samples every `step` px; base = the line's mean height
const duneD = (seed: number, base: number, amp: number, x0 = -2200, x1 = 4400, step = 220) => {
	const pts: [number, number][] = [];
	for (let x = x0; x <= x1; x += step) {
		const h = amp * (0.55 * (0.5 + 0.5 * Math.sin(x / 410 + seed)) + 0.45 * (0.5 + 0.5 * Math.sin(x / 173 + seed * 2.3)) * rnd(Math.floor(x / step) + seed * 31));
		pts.push([x, base - h]);
	}
	let d = `M ${pts[0][0]},${pts[0][1]}`;
	for (let i = 1; i < pts.length - 1; i++) {
		const mx = (pts[i][0] + pts[i + 1][0]) / 2;
		const my = (pts[i][1] + pts[i + 1][1]) / 2;
		d += ` Q ${pts[i][0]},${pts[i][1]} ${mx},${my}`;
	}
	return {top: d, fill: `${d} L ${x1},${base + 2200} L ${x0},${base + 2200} Z`};
};
const DUNES = [duneD(1.3, 640, 70), duneD(4.1, 760, 120), duneD(7.7, 930, 160)];
// three layers (far, mid, near) drawn through the camera with parallax 0.35 / 0.65 / 1
export const Dunes: React.FC<{p: Pal; cam?: {s: number; cx: number; cy: number}; only?: number[]}> = ({p, cam, only}) => (
	<g>
		{DUNES.map((d, k) => {
			if (only && !only.includes(k)) return null;
			const col = [p.far, p.mid, p.near][k];
			const tr = cam ? camTf(cam, [0.35, 0.65, 1][k]) : undefined;
			return (
				<g key={k} transform={tr}>
					<path d={d.fill} fill={col} />
					<path d={d.top} fill="none" stroke={p.crest} strokeWidth={4} opacity={0.55} />
				</g>
			);
		})}
	</g>
);
// heat shimmer: thin bright wavy bands over the horizon
export const Shimmer: React.FC<{f: number; y: number; k?: number; color?: string}> = ({f, y, k = 1, color = '#fff6e0'}) => (
	<g opacity={0.5 * k}>
		{Array.from({length: 6}).map((_, i) => {
			const yy = y + i * 9 - 20;
			const ph = f / 5 + i * 1.3;
			let d = '';
			for (let x = -100; x <= 2020; x += 40) d += `${x === -100 ? 'M' : 'L'} ${x},${(yy + Math.sin(x / 70 + ph) * 3).toFixed(1)} `;
			return <path key={i} d={d} stroke={color} strokeWidth={3} fill="none" opacity={0.5 - i * 0.06} />;
		})}
	</g>
);
// sand blown by the wind (screen space)
export const Blowing: React.FC<{f: number; n?: number; k?: number; color?: string; dir?: number; speed?: number}> = ({f, n = 90, k = 1, color = '#f1c88a', dir = -1, speed = 26}) => (
	<g opacity={k}>
		{Array.from({length: n}).map((_, i) => {
			const sp = speed * (0.6 + rnd(i + 5) * 0.8);
			const x = (((rnd(i) * 2400 + dir * f * sp) % 2400) + 2400) % 2400 - 240;
			const y = rnd(i + 99) * 1080 + Math.sin(f / 9 + i) * 10;
			const l = 14 + rnd(i + 7) * 40;
			return <line key={i} x1={x} y1={y} x2={x - dir * l} y2={y - 2} stroke={color} strokeWidth={2 + rnd(i + 3) * 2.5} strokeLinecap="round" opacity={0.35 + 0.45 * rnd(i + 11)} />;
		})}
	</g>
);
// the storm: an orange-brown haze that eats the picture (k 0…1), in screen space
export const StormHaze: React.FC<{f: number; k: number}> = ({f, k}) =>
	k <= 0 ? null : (
		<>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #8a4418 0%, #c8742e 55%, #e3a65c 100%)', opacity: 0.85 * k}} />
			<AbsoluteFill style={{opacity: k}}>
				<svg width={1920} height={1080} viewBox="0 0 1920 1080">
					{Array.from({length: 7}).map((_, i) => {
						const x = ((f * (6 + i * 2) + i * 400) % 2800) - 600;
						return <ellipse key={i} cx={1920 - x} cy={140 + i * 140} rx={520} ry={70 + (i % 3) * 30} fill="#f0b46a" opacity={0.18} />;
					})}
					<Blowing f={f} n={140} k={1} color="#f6d6a0" speed={38} />
				</svg>
			</AbsoluteFill>
		</>
	);

// ============================================================ the runner («ты») =====
export const RUNNER = {top: '#f08a2a', topDark: '#d47222', pants: '#2b2d33', shoes: '#e8e6e0', hair: '#3a2a20', skin: '#dfa274'};
export const Runner: React.FC<{
	id: string;
	x: number;
	y: number;
	s?: number;
	f?: number;
	walk?: number;
	face?: Face;
	armL?: ArmPose;
	armR?: ArmPose;
	itemL?: React.ReactNode;
	itemR?: React.ReactNode;
	tilt?: number;
	turn?: number;
	back?: boolean;
	dry?: number; // 0…1: the lips crack, the skin reddens
	hideLegs?: boolean;
}> = ({id, x, y, s = 0.5, f = 0, walk, face, armL, armR, itemL, itemR, tilt = 0, turn = 0, back, dry = 0, hideLegs}) => (
	<g>
		<Person
			kind="dad"
			id={id}
			x={x}
			y={y}
			scale={s}
			colors={{...RUNNER, skin: mix(RUNNER.skin, '#d98a6a', dry * 0.6)}}
			cap="#f4efe4"
			backpack
			plain
			kneePatch={false}
			walk={walk}
			breathe={f}
			headTilt={tilt}
			headTurn={turn}
			back={back}
			hideLegs={hideLegs}
			armL={armL}
			armR={armR}
			itemL={itemL}
			itemR={itemR}
			face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, sweat: 0, ...(face ?? {})}}
		/>
	</g>
);

// the flask: water level 0…1 (local: the bottom at y = 0, ~150 tall)
export const Flask: React.FC<{level?: number; s?: number; tilt?: number; id?: string}> = ({level = 0.5, s = 1, tilt = 0, id = 'fl'}) => {
	const h = 130;
	const top = -h + h * (1 - level);
	return (
		<g transform={`rotate(${tilt}) scale(${s})`}>
			<defs>
				<clipPath id={`${id}-c`}>
					<rect x={-34} y={-h} width={68} height={h} rx={22} />
				</clipPath>
			</defs>
			<rect x={-34} y={-h} width={68} height={h} rx={22} fill="#c8d2da" stroke="#2a2f38" strokeWidth={6} />
			{level > 0.01 && <rect x={-40} y={top} width={80} height={h - top + 10} fill="#5fb0f0" opacity={0.9} clipPath={`url(#${id}-c)`} />}
			<rect x={-26} y={-h + 18} width={10} height={h - 40} rx={5} fill="#fff" opacity={0.55} />
			<rect x={-16} y={-h - 26} width={32} height={30} rx={7} fill="#2f86e0" stroke="#2a2f38" strokeWidth={5} />
		</g>
	);
};

// ============================================================ the HUD =====
// left: how much water you have lost (a drop that empties, a bar to 20 %); right: hours without water and the air
export type JTick = {at: number; loss: number; hours?: number; air?: number; len?: number};
export const HUDJ: React.FC<{ticks: JTick[]; show: [number, number]}> = ({ticks, show}) => {
	const f = useCurrentFrame();
	if (f < show[0] - 12 || f > show[1] + 12) return null;
	const o = Math.min(interpolate(f, [show[0], show[0] + 12], [0, 1], clamp), interpolate(f, [show[1], show[1] + 12], [1, 0], clamp));
	if (o <= 0) return null;
	let loss = ticks[0].loss;
	let hours = ticks[0].hours ?? 0;
	let air = ticks[0].air ?? 45;
	let pl = loss;
	let ph = hours;
	let pa = air;
	for (const k of ticks) {
		if (f < k.at) break;
		const t = interpolate(f, [k.at, k.at + (k.len ?? 40)], [0, 1], clamp);
		loss = pl + (k.loss - pl) * t;
		hours = ph + ((k.hours ?? ph) - ph) * t;
		air = pa + ((k.air ?? pa) - pa) * t;
		pl = k.loss;
		ph = k.hours ?? ph;
		pa = k.air ?? pa;
	}
	const danger = Math.min(1, loss / 10);
	const col = mix('#5fb0f0', '#ff5a3a', danger);
	const fill = Math.max(0, 1 - loss / 20);
	const d = Math.floor(hours / 24);
	const hh = Math.floor(hours % 24);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: 40, top: 34, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(24,14,6,0.86)', border: `4px solid ${col}`, borderRadius: 18, padding: '10px 24px 12px 16px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<svg width={46} height={62} viewBox="0 0 46 62">
					<defs>
						<clipPath id="hudj-drop">
							<path d="M 23,2 C 34,20 44,32 44,42 A 21,19 0 0 1 2,42 C 2,32 12,20 23,2 Z" />
						</clipPath>
					</defs>
					<path d="M 23,2 C 34,20 44,32 44,42 A 21,19 0 0 1 2,42 C 2,32 12,20 23,2 Z" fill="#2a3240" />
					<rect x={0} y={62 - 60 * fill} width={46} height={62} fill={col} clipPath="url(#hudj-drop)" />
					<path d="M 23,2 C 34,20 44,32 44,42 A 21,19 0 0 1 2,42 C 2,32 12,20 23,2 Z" fill="none" stroke="#eef4fa" strokeWidth={3} />
				</svg>
				<div>
					<div style={{fontSize: 22, color: '#d8c4a8', letterSpacing: 2}}>ПОТЕРЯ ВОДЫ</div>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
						<div style={{fontSize: 54, lineHeight: 1, color: col, fontFamily: "'JetBrains Mono', monospace"}}>{loss < 9.95 ? loss.toFixed(1).replace('.', ',') : Math.round(loss)}%</div>
						<div style={{width: 150, height: 14, borderRadius: 7, background: '#3a2f26', overflow: 'hidden'}}>
							<div style={{width: `${Math.min(100, (loss / 20) * 100)}%`, height: '100%', background: col}} />
						</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', right: 40, top: 34, display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(24,14,6,0.86)', border: '4px solid #7a5a3a', borderRadius: 18, padding: '12px 24px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<div>
					<div style={{fontSize: 22, color: '#d8c4a8', letterSpacing: 2}}>БЕЗ ВОДЫ</div>
					<div style={{fontSize: 50, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace"}}>{d > 0 ? `${d} д ${String(hh).padStart(2, '0')} ч` : `${hh} ч`}</div>
				</div>
				<div style={{width: 3, alignSelf: 'stretch', background: '#5a4430'}} />
				<div>
					<div style={{fontSize: 22, color: '#d8c4a8', letterSpacing: 2}}>ВОЗДУХ</div>
					<div style={{fontSize: 50, lineHeight: 1, color: mix('#7ab8ff', '#ffb04a', (air - 10) / 35), fontFamily: "'JetBrains Mono', monospace"}}>{Math.round(air)}°</div>
				</div>
			</div>
		</div>
	);
};

// ============================================================ small props =====
export const Rock: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#8a6a4e'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -150,0 C -150,-60 -110,-110 -40,-120 C 30,-130 110,-100 140,-50 C 160,-20 160,0 160,0 Z" fill={color} />
		<path d="M 10,-125 C 80,-120 130,-90 145,-50 C 158,-20 160,0 160,0 L 30,0 C 40,-40 30,-90 10,-125 Z" fill="#000" opacity={0.16} />
	</g>
);
// a race marker flag on a pole
export const Marker: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#e8352e'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<line x1={0} y1={0} x2={0} y2={-150} stroke="#3a3a40" strokeWidth={6} />
		<path d="M 3,-150 L 70,-128 L 3,-106 Z" fill={color} />
	</g>
);
// footprints along a curve (screen coords), from t0 to t1 of the path
export const Steps: React.FC<{pts: [number, number][]; k?: number; color?: string; size?: number}> = ({pts, k = 1, color = '#000', size = 12}) => (
	<g opacity={0.18}>
		{pts.slice(0, Math.max(0, Math.round(pts.length * k))).map(([x, y], i) => (
			<ellipse key={i} cx={x + (i % 2 ? 10 : -10)} cy={y} rx={size * 0.6} ry={size * 0.32} fill={color} />
		))}
	</g>
);
// a temperature chip
export const Chip: React.FC<{f: number; at: number; x: number; y: number; text: string; color: string; size?: number; to?: number}> = ({f, at, x, y, text, color, size = 48, to}) =>
	f < at || (to !== undefined && f > to + 10) ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f, at, 11) * (to !== undefined ? interpolate(f, [to, to + 10], [1, 0], clamp) : 1)})`, background: color, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: size, padding: '8px 22px 10px', borderRadius: 16, whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'}}>
			{text}
		</div>
	);
// warm grade + vignette over a desert shot
export const HeatGrade: React.FC<{k?: number; vig?: number}> = ({k = 0, vig = 0.45}) => (
	<>
		{k > 0 && <AbsoluteFill style={{background: '#ff8a3a', opacity: 0.12 * k, mixBlendMode: 'multiply'}} />}
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,10,0,${vig}) 100%)`}} />
	</>
);
