// «Что будет, если ты попадёшь в XX век» — shared pieces: the hero, people of every decade, the camera moves, the
// colour grade of each era, the year titles, labels and stamps.
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person, PersonProps} from '../components/Person';
import {Cam3, project} from '../components/Scene3D';
import {kz} from '../components/Layers3D';
import {HEAVY} from '../components/Overlays';
import {Phone as PhoneBase, SANS} from '../scenes/S12_S16';

export {HEAVY, SANS};
export const SERIF = "'DejaVu Serif', 'FreeSerif', serif";
export const YEL = '#ffd34a';
export const RED = '#ff3b30';
export const GREEN = '#3ac569';

export const rnd = (i: number) => {
	const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
	return v - Math.floor(v);
};

// ================================================================ the hero ====
// you: a mustard hoodie, jeans, white sneakers, no glasses (not a hero of the series)
export const YOU = {top: '#e3a72f', topDark: '#c48a1f', pants: '#34466e', shoes: '#f2f0ea', hair: '#3a2a22'};
export type PP = Omit<PersonProps, 'kind' | 'colors'>;
export const You: React.FC<PP> = (p) => <Person kind="teen" colors={YOU} {...p} face={{blush: false, ...(p.face ?? {}), glasses: false}} />;

// the phone in your hand (hand-local coords), screen towards the viewer
export const HandPhone: React.FC<{lit?: boolean; flash?: number; s?: number; screen?: string}> = ({lit = true, flash = 0, s = 1, screen}) => (
	<g transform={`scale(${s}) translate(-4,-46)`}>
		<rect x={-26} y={-50} width={52} height={100} rx={9} fill="#16171b" />
		<rect x={-22} y={-45} width={44} height={88} rx={6} fill={screen ?? (lit ? '#7fb2ff' : '#23262e')} />
		{lit && <rect x={-22} y={-45} width={44} height={30} rx={6} fill="#ffffff" opacity={0.2} />}
		{flash > 0 && <circle cx={0} cy={-38} r={90 * flash} fill="#fffbe8" opacity={0.8 * flash} />}
	</g>
);

// the big phone in the hand (screen space) — your mustard sleeve
export const Phone: React.FC<React.ComponentProps<typeof PhoneBase>> = (p) => <PhoneBase sleeve={YOU.top} skin="#e8b48e" {...p} />;

// ======================================================= people of the decades ===
export type Era = 1901 | 1911 | 1921 | 1931 | 1941 | 1951 | 1961 | 1971 | 1981 | 1991;
type Look = Pick<PersonProps, 'kind' | 'colors' | 'plain' | 'cap' | 'hat' | 'beard' | 'moustache' | 'hem' | 'pioneer' | 'quilt' | 'knit' | 'apron' | 'boots' | 'kneePatch'>;
const pick = <T,>(a: T[], i: number) => a[((i % a.length) + a.length) % a.length];
const HAIR = ['#3a2a20', '#5a3a28', '#2a2220', '#7a5a3a', '#8a7a68', '#1f1a1a', '#a4643a'];
const SKIN = ['#f2c3a0', '#e9b892', '#f6cba8', '#dcae88', '#f0c09c'];

// i = which person (deterministic), who = man / woman / kid
export const folk = (era: Era, i: number, who: 'm' | 'f' | 'k'): Look => {
	const hair = pick(HAIR, i * 3 + 1);
	const skin = pick(SKIN, i * 7 + 2);
	if (who === 'k') {
		const tops: Record<number, string[]> = {
			1901: ['#6a5a44', '#4a5a6a', '#7a4a3a'],
			1911: ['#5a5a6a', '#7a6a4a', '#4a4a3a'],
			1921: ['#6a6a52', '#5a4a3a', '#4a5a5a'],
			1931: ['#e9e4d6', '#5a6a8a', '#7a6a4a'],
			1941: ['#e9e4d6', '#6a7a5a', '#5a5a6a'],
			1951: ['#3a4a6a', '#6a5a4a', '#e9e4d6'],
			1961: ['#e9e4d6', '#3a5a8a', '#8a4a3a'],
			1971: ['#2c3a66', '#c9783a', '#3a7a6a'],
			1981: ['#2c3a66', '#2a5aa8', '#a83a3a'],
			1991: ['#2a6aa8', '#a8402a', '#3a3a44'],
		};
		const top = pick(tops[era], i);
		const pio = (era === 1931 || era === 1961 || era === 1981) && top === '#e9e4d6';
		return {
			kind: 'boy',
			colors: {top, topDark: top, pants: era < 1951 ? '#3a3a40' : '#2c3a66', hair: pick(['#b4542a', '#5a3a28', '#2a2220', '#d6a24a'], i), skin},
			cap: era <= 1941 && i % 2 === 0 ? pick(['#3a3a40', '#4a3a2c', '#2e3a4c'], i) : undefined,
			pioneer: pio || ((era === 1961 || era === 1971 || era === 1981) && i % 3 === 1),
		};
	}
	if (who === 'm') {
		const coats: Record<number, string[]> = {
			1901: ['#3b3a40', '#4a3a2c', '#2f3b4c', '#5b4a36', '#433a48'],
			1911: ['#2e2e36', '#4a3a2c', '#3a4a5a', '#5b4a36', '#20242c'],
			1921: ['#6b6a52', '#2a2422', '#5a4a3a', '#4a4a44', '#6a5a44'],
			1931: ['#3b5a8a', '#4a4a44', '#5a4a3a', '#e9e4d6', '#3a3a44'],
			1941: ['#5f6a45', '#4a4a44', '#3a3a44', '#e9e4d6', '#5a4a3a'],
			1951: ['#3a4150', '#4a3a2c', '#5a5a5a', '#2e3a4c', '#6a5a44'],
			1961: ['#5a6a7a', '#3a4150', '#8a7a5a', '#e9e4d6', '#4a5a4a'],
			1971: ['#7a4a2a', '#4a5a3a', '#3a4a6a', '#8a6a3a', '#5a3a2a'],
			1981: ['#3a4a6a', '#5a5a5a', '#2a5aa8', '#6a4a3a', '#4a6a4a'],
			1991: ['#2a2a30', '#7a2a3a', '#3a5a8a', '#5a4a3a', '#2a4a3a'],
		};
		const top = pick(coats[era], i);
		const pants = era === 1941 && top === '#5f6a45' ? '#5f6a45' : era >= 1971 ? pick(['#3a4a6a', '#5a4a3a', '#2a2a30'], i) : pick(['#2a2a2e', '#3a3530', '#2e3038'], i);
		const old = era <= 1911;
		return {
			kind: 'dad',
			plain: true,
			colors: {top, topDark: top, pants, shoes: '#18181b', hair: old && i % 4 === 3 ? '#9a9a96' : hair, skin},
			cap: (era <= 1941 && i % 3 !== 2) || (era === 1951 && i % 2 === 0) ? pick(['#26262c', '#3a3530', '#4a4038'], i) : undefined,
			hat: era === 1911 && i % 3 === 2 ? {type: 'bowler', color: '#1c1c20'} : era === 1951 && i % 4 === 1 ? {type: 'peak', color: '#3a4150', band: '#2a2e38'} : undefined,
			beard: old && i % 2 === 0 ? pick(['#3a2a20', '#5a4030', '#8a8a86'], i) : undefined,
			moustache: (old && i % 2 === 1) || (era === 1971 && i % 3 === 0) ? pick(['#3a2a20', '#2a2220'], i) : undefined,
			quilt: era === 1921 && i % 4 === 2,
			boots: era <= 1921 || (era === 1941 && top === '#5f6a45') ? '#1a1a1c' : undefined,
			kneePatch: false,
		};
	}
	const dresses: Record<number, string[]> = {
		1901: ['#6e3434', '#34466e', '#5a5636', '#5e3e5e', '#2e2e38', '#7a5a3a'],
		1911: ['#e8e0cc', '#34466e', '#6e3434', '#3a3a44', '#7a6a8a'],
		1921: ['#5a5a52', '#4a4a5a', '#6a5a44', '#3a3a44'],
		1931: ['#3a5a8a', '#6a5a44', '#e9e4d6', '#5a4a5a'],
		1941: ['#4a5a7a', '#6a5a5a', '#e9e4d6', '#5a6a5a'],
		1951: ['#4c7fae', '#8a4a4a', '#5a7a5a', '#7a6a8a'],
		1961: ['#e05a4a', '#4c7fae', '#e0b03a', '#5aa08a'],
		1971: ['#d8762a', '#2a8a8a', '#a83a5a', '#e0b03a'],
		1981: ['#a83a5a', '#3a6aa8', '#5aa08a', '#e07a3a'],
		1991: ['#7a2a5a', '#2a6aa8', '#e0503a', '#3a3a44'],
	};
	const hem: Record<number, number> = {1901: 0.95, 1911: 0.92, 1921: 0.8, 1931: 0.7, 1941: 0.62, 1951: 0.6, 1961: 0.5, 1971: 0.3, 1981: 0.45, 1991: 0.4};
	const scarf =
		era <= 1911 ? i % 2 === 0 : era === 1921 ? i % 3 !== 1 : era === 1931 || era === 1941 ? i % 2 === 1 : false;
	return {
		kind: 'mom',
		plain: true,
		hem: hem[era],
		colors: {top: pick(dresses[era], i), topDark: pick(dresses[era], i), hair: pick(['#7a4a2c', '#3a2a20', '#5a3a28', '#a4643a', '#8a8a86', '#2a2220'], i), skin, shoes: '#2a2226'},
		hat: scarf
			? {type: 'scarf', color: era === 1921 || era === 1931 ? '#c8282a' : pick(['#d6b04a', '#b8402e', '#e8e2d0', '#8a6a9a', '#5a7a9a'], i)}
			: undefined,
	};
};
export const Folk: React.FC<PP & {era: Era; n: number; who: 'm' | 'f' | 'k'}> = ({era, n, who, ...p}) => {
	const look = folk(era, n, who);
	return <Person {...look} {...p} colors={look.colors} />;
};

// ================================================================== camera ====
export type Mv = {x?: [number, number]; y?: [number, number]; z?: [number, number]; ry?: [number, number]; rx?: [number, number]};
const E = Easing.inOut(Easing.sin);
export const move = (f: number, len: number, m: Mv, a = 0, b?: number): Cam3 => {
	const e = b ?? len;
	const g = (v?: [number, number]) => (v ? lerp(f, a, e, v[0], v[1], E) : 0);
	return {x: g(m.x), y: g(m.y), z: g(m.z), ry: m.ry ? g(m.ry) : undefined, rx: m.rx ? g(m.rx) : undefined};
};

// where a point of a flat layer at depth z (picture coords) is on the screen for this camera
export const scr = (cam: Cam3, z: number, px: number, py: number) => {
	const k = kz(z);
	return project(cam, (px - 540) / k, (py - 960) / k, z);
};

// ================================================================== grade =====
// every decade has its own colour: old photographs → film → the colour 60s → the 70s → the 80s → VHS dusk
export const GRADE: Record<number, {tint: string; a: number; vig: number}> = {
	1901: {tint: '#b8864a', a: 0.2, vig: 0.62},
	1911: {tint: '#b8905a', a: 0.15, vig: 0.58},
	1921: {tint: '#8a8070', a: 0.16, vig: 0.6},
	1931: {tint: '#6a7a8a', a: 0.12, vig: 0.56},
	1941: {tint: '#3a4250', a: 0.2, vig: 0.66},
	1951: {tint: '#b8a070', a: 0.1, vig: 0.55},
	1961: {tint: '#7aa0c8', a: 0.06, vig: 0.5},
	1971: {tint: '#c88a4a', a: 0.1, vig: 0.52},
	1981: {tint: '#5aa0a0', a: 0.07, vig: 0.5},
	1991: {tint: '#6a4a8a', a: 0.1, vig: 0.55},
	2026: {tint: '#ffffff', a: 0, vig: 0.45},
};
export const Grade: React.FC<{era: number; extra?: number}> = ({era, extra = 0}) => {
	const g = GRADE[era] ?? GRADE[2026];
	return (
		<>
			{g.a > 0 && <AbsoluteFill style={{background: g.tint, opacity: g.a}} />}
			{extra > 0 && <AbsoluteFill style={{background: '#05060c', opacity: extra}} />}
		</>
	);
};

// =========================================================== titles & tags ====
// the year of a new decade: big in the middle, then it flies into the corner (where the HUD chip is)
export const YearTitle: React.FC<{f: number; year: number; sub: string; at?: number; hold?: number; color?: string}> = ({f, year, sub, at = 2, hold = 70, color = YEL}) => {
	const p = pop(f, at, 12);
	const out = interpolate(f, [at + hold, at + hold + 14], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	if (out >= 1) return null;
	const x = lerp(out, 0, 1, 540, 150, Easing.linear);
	const y = lerp(out, 0, 1, 520, 128, Easing.linear);
	const s = (0.6 + 0.4 * p) * (1 - 0.72 * out);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: 1 - out * 0.6, whiteSpace: 'nowrap'}}>
			<div style={{fontSize: 230, lineHeight: 0.95, color: '#fff', letterSpacing: 4, textShadow: '0 10px 0 rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.5), 5px 5px 0 #1d1d24, -5px 5px 0 #1d1d24, 5px -5px 0 #1d1d24, -5px -5px 0 #1d1d24'}}>{year}</div>
			<div style={{display: 'inline-block', marginTop: 14, background: 'rgba(14,14,18,0.86)', color, fontSize: 40, letterSpacing: 6, padding: '8px 26px', borderRadius: 14, opacity: interpolate(f, [at + 8, at + 16], [0, 1], clamp)}}>{sub}</div>
		</div>
	);
};

// a white flash fading out (you have just arrived in a new decade)
export const Arrive: React.FC<{f: number; len?: number}> = ({f, len = 10}) => {
	const o = interpolate(f, [0, len], [1, 0], clamp);
	return o > 0 ? <AbsoluteFill style={{background: '#fffaf0', opacity: o}} /> : null;
};

// a tag on a thin line pointing at a thing (screen coords)
export const Tag: React.FC<{f: number; at: number; to?: number; x: number; y: number; tx: number; ty: number; text: string; color?: string; size?: number}> = ({f, at, to, x, y, tx, ty, text, color = '#fff', size = 40}) => {
	const p = pop(f, at, 12) * (to !== undefined ? interpolate(f, [to - 6, to], [1, 0], clamp) : 1);
	if (f < at || (to !== undefined && f >= to)) return null;
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<line x1={x} y1={y} x2={x + (tx - x) * Math.min(1, p)} y2={y + (ty - y) * Math.min(1, p)} stroke="#fff" strokeWidth={5} />
				<circle cx={x} cy={y} r={11 * p} fill={color === '#fff' ? YEL : color} stroke="#1d1d24" strokeWidth={4} />
			</svg>
			<div style={{position: 'absolute', left: tx, top: ty, transform: `translate(-50%,-50%) scale(${p})`, background: 'rgba(14,14,18,0.9)', border: `4px solid ${color === '#fff' ? YEL : color}`, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: size, padding: '6px 20px', borderRadius: 14, whiteSpace: 'nowrap'}}>
				{text}
			</div>
		</>
	);
};

// a rubber stamp slammed onto the picture
export const Stamp: React.FC<{f: number; at: number; x: number; y: number; text: string; rot?: number; color?: string; size?: number; sub?: string}> = ({f, at, x, y, text, rot = -8, color = '#e0342b', size = 84, sub}) => {
	if (f < at) return null;
	const t = f - at;
	const s = t < 6 ? lerp(t, 0, 6, 2.2, 1, Easing.in(Easing.cubic)) : 1;
	const o = interpolate(t, [0, 4], [0, 1], clamp);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o, border: `9px solid ${color}`, borderRadius: 18, padding: '6px 28px', color, fontFamily: HEAVY, fontWeight: 900, fontSize: size, letterSpacing: 4, textAlign: 'center', background: 'rgba(255,250,240,0.12)', whiteSpace: 'nowrap', lineHeight: 1.05}}>
			{text}
			{sub && <div style={{fontSize: size * 0.42, letterSpacing: 2}}>{sub}</div>}
		</div>
	);
};

// a fact card: a short line of history at the top of the picture
export const Fact: React.FC<{f: number; at: number; to?: number; text: string; y?: number; color?: string}> = ({f, at, to = 99999, text, y = 300, color = YEL}) => {
	const p = pop(f, at, 13);
	const o = interpolate(f, [to - 8, to], [1, 0], clamp);
	if (f < at || o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: o, background: 'rgba(14,14,18,0.9)', borderLeft: `10px solid ${color}`, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, padding: '14px 30px', borderRadius: 14, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
			{text}
		</div>
	);
};

// close-ups are drawn zoomed into a flat picture around (cx, cy)
export const zoomT = (s: number, cx: number, cy: number) => `translate(540,960) scale(${s}) translate(${-cx},${-cy})`;

// a soft glow (lamps, the screen, the flashlight)
export const Glow: React.FC<{id: string; x: number; y: number; r: number; color?: string; o?: number}> = ({id, x, y, r, color = '#ffd27a', o = 1}) => (
	<g>
		<defs>
			<radialGradient id={id}>
				<stop offset="0%" stopColor={color} stopOpacity={0.75} />
				<stop offset="40%" stopColor={color} stopOpacity={0.25} />
				<stop offset="100%" stopColor={color} stopOpacity={0} />
			</radialGradient>
		</defs>
		<circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />
	</g>
);
