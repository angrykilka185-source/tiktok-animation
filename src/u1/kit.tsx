// «Что будет, если ты попадёшь в СССР» — a 16:9 film (1920×1080). Shared pieces: the frame, the 3D-camera helpers
// for the wide frame, you (in your hoodie, then in the school uniform), people of 1981, the HUD (the time of day and
// the battery), the colour of the 80s. Re-uses the people, tags and stamps of «XX век» (src/w1/kit.tsx).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person, PersonProps} from '../components/Person';
import {Cam3, project} from '../components/Scene3D';
import {Box, kz, Lay} from '../components/Layers3D';
import {folk, GREEN, HEAVY, RED, SANS, YEL, YOU} from '../w1/kit';
import {Battery, batColor} from '../w1/hud';

export {GREEN, HEAVY, RED, SANS, YEL};
export const W = 1920;
export const H = 1080;
export const CX = W / 2;
export const CY = H / 2;

// ============================================================ 3D camera ======
// a far layer covering the whole wide frame (+ margins for the camera moves)
export const FarW: React.FC<{z?: number; box?: Box; children: React.ReactNode}> = ({z = -1400, box = [-700, -500, 3320, 2100], children}) => (
	<Lay z={z} box={box} res={Math.round(1 / kz(z)) + 1}>
		{children}
	</Lay>
);
// a person's layer box in the wide frame
export const pBox = (x: number, y: number, s: number, wide = 520): Box => [x - wide * s, y - 1260 * s, 2 * wide * s, 1320 * s];
// screen point of a picture point of a layer at depth z (wide frame)
export const scrW = (cam: Cam3, z: number, px: number, py: number) => {
	const k = kz(z);
	return project(cam, (px - CX) / k, (py - CY) / k, z, CX, CY);
};
const E = Easing.inOut(Easing.sin);
export type Mv = {x?: [number, number]; y?: [number, number]; z?: [number, number]};
export const mv = (f: number, len: number, m: Mv, a = 0): Cam3 => {
	const g = (v?: [number, number]) => (v ? lerp(f, a, len, v[0], v[1], E) : 0);
	return {x: g(m.x), y: g(m.y), z: g(m.z)};
};

// ================================================================= you =======
// you: in your own mustard hoodie (the morning you wake up), then in the Soviet school uniform with the pioneer tie
export const UNIFORM = {top: '#2c3a66', topDark: '#243056', pants: '#2c3a66', shoes: '#1a1a1e', hair: YOU.hair};
type PP = Omit<PersonProps, 'kind' | 'colors'>;
export const You: React.FC<PP & {uniform?: boolean}> = ({uniform = true, ...p}) => (
	<Person kind="teen" colors={uniform ? UNIFORM : YOU} plain={uniform} pioneer={uniform} {...p} face={{blush: false, ...(p.face ?? {}), glasses: false}} />
);
// people of 1981 (the looks of «XX век», 1981)
export const P81: React.FC<PP & {n: number; who: 'm' | 'f' | 'k'}> = ({n, who, ...p}) => {
	const look = folk(1981, n, who);
	return <Person {...look} {...p} colors={look.colors} />;
};
// a Soviet schoolboy / schoolgirl of 1981 (blue uniform; the girls: a brown dress and a black apron)
export const Pupil: React.FC<PP & {girl?: boolean; n?: number}> = ({girl = false, n = 0, ...p}) =>
	girl ? (
		<Person kind="girl" plain hem={0.42} colors={{top: '#6a3a24', topDark: '#5a3020', hair: ['#3a2a20', '#7a4a2c', '#5a3a28', '#2a2220'][n % 4], pants: '#2a2226'}} apron="#1a1a1e" pioneer {...p} face={{blush: true, ...(p.face ?? {})}} />
	) : (
		<Person kind="boy" colors={{top: '#2c3a66', topDark: '#243056', pants: '#2c3a66', hair: ['#5a3a28', '#b4542a', '#2a2220', '#d6a24a'][n % 4]}} pioneer {...p} face={{blush: true, ...(p.face ?? {})}} />
	);

// ================================================================= HUD =======
// top left: «СССР · 1981» and the clock of the day; top right: no network and the battery
export type Tick = {at: number; time: string; pct: number};
export const HUD81: React.FC<{ticks: Tick[]; show: [number, number]}> = ({ticks, show}) => {
	const f = useCurrentFrame();
	if (f < show[0] - 10 || f > show[1] + 10) return null;
	const o = Math.min(interpolate(f, [show[0], show[0] + 10], [0, 1], clamp), interpolate(f, [show[1], show[1] + 8], [1, 0], clamp));
	if (o <= 0) return null;
	let t = ticks[0];
	for (const k of ticks) if (f >= k.at) t = k;
	const flip = pop(f, t.at, 12);
	const low = t.pct <= 10;
	const pulse = low ? 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(f / 5)) : 1;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: 36, top: 34, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(14,14,18,0.86)', border: `4px solid ${RED}`, borderRadius: 16, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<div style={{fontSize: 26, color: '#ff8a7a', letterSpacing: 2}}>СССР · 1981</div>
				<div style={{fontSize: 44, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace", transform: `scaleY(${0.6 + 0.4 * flip})`}}>{t.time}</div>
			</div>
			<div style={{position: 'absolute', right: 36, top: 34, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(14,14,18,0.86)', border: `4px solid ${low ? RED : '#4a4f5c'}`, borderRadius: 16, padding: '10px 18px', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#9aa3b2'}}>нет сети</div>
				<div style={{opacity: pulse}}>
					<Battery pct={t.pct} w={62} h={32} stroke={4} />
				</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 36, color: low ? RED : batColor(t.pct) === GREEN ? '#fff' : batColor(t.pct), minWidth: 86, textAlign: 'right', transform: `scale(${0.8 + 0.2 * flip})`}}>{t.pct}%</div>
			</div>
		</div>
	);
};

// the warm colour of an old Soviet colour film
export const Grade81: React.FC<{night?: number}> = ({night = 0}) => (
	<>
		<AbsoluteFill style={{background: '#c8904a', opacity: 0.08}} />
		{night > 0 && <AbsoluteFill style={{background: '#0a1030', opacity: 0.35 * night}} />}
	</>
);

// a price tag popping up (screen coords): «ПИРОЖОК — 5 коп.»
export const Price: React.FC<{f: number; at: number; x: number; y: number; what: string; price: string; to?: number; color?: string}> = ({f, at, x, y, what, price, to, color = YEL}) => {
	if (f < at || (to !== undefined && f > to)) return null;
	const p = pop(f, at, 11) * (to !== undefined ? interpolate(f, [to - 6, to], [1, 0], clamp) : 1);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(-3deg)`, display: 'flex', alignItems: 'stretch', fontFamily: HEAVY, fontWeight: 900, boxShadow: '0 12px 26px rgba(0,0,0,0.4)', borderRadius: 16, overflow: 'hidden', whiteSpace: 'nowrap'}}>
			<div style={{background: 'rgba(14,14,18,0.92)', color: '#fff', fontSize: 38, padding: '10px 22px'}}>{what}</div>
			<div style={{background: color, color: '#111', fontSize: 44, padding: '6px 22px', display: 'flex', alignItems: 'center'}}>{price}</div>
		</div>
	);
};

export const _KEEP_U1KIT = {AbsoluteFill};
