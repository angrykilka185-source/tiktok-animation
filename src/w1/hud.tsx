// The film's HUD: the year (top left) and your phone's battery (top right, «нет сети») — and the jump between decades:
// a time tunnel, the battery drops by ten per cent, the year counter runs ten years forward.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {GREEN, HEAVY, RED, rnd, SANS, YEL} from './kit';

export const batColor = (pct: number) => (pct > 50 ? GREEN : pct > 20 ? YEL : RED);

// a battery icon (screen px): w × h body, the fill shows the per cent
export const Battery: React.FC<{pct: number; w: number; h: number; color?: string; stroke?: number; glow?: number}> = ({pct, w, h, color, stroke = 6, glow = 0}) => {
	const c = color ?? batColor(pct);
	const inner = Math.max(0, Math.min(1, pct / 100));
	return (
		<div style={{position: 'relative', width: w + h * 0.16, height: h}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, border: `${stroke}px solid #fff`, borderRadius: h * 0.24, boxSizing: 'border-box', boxShadow: glow > 0 ? `0 0 ${40 * glow}px ${c}` : undefined}} />
			<div style={{position: 'absolute', left: w, top: h * 0.3, width: h * 0.14, height: h * 0.4, background: '#fff', borderRadius: `0 ${h * 0.08}px ${h * 0.08}px 0`}} />
			<div style={{position: 'absolute', left: stroke * 1.8, top: stroke * 1.8, width: (w - stroke * 3.6) * inner, height: h - stroke * 3.6, background: c, borderRadius: h * 0.12}} />
		</div>
	);
};

export type Mark = {at: number; year: number; pct: number};

// the HUD over the whole film. `marks` = from frame `at` on, the year / battery are these; `show` = when it is visible
export const HUD20: React.FC<{marks: Mark[]; show: [number, number][]}> = ({marks, show}) => {
	const f = useCurrentFrame();
	const vis = show.find(([a, b]) => f >= a - 10 && f < b + 10);
	if (!vis) return null;
	const inA = interpolate(f, [vis[0], vis[0] + 10], [0, 1], clamp);
	const inB = interpolate(f, [vis[1], vis[1] + 8], [1, 0], clamp);
	const o = Math.min(inA, inB);
	if (o <= 0) return null;
	let m = marks[0];
	for (const k of marks) if (f >= k.at) m = k;
	const flip = pop(f, m.at, 12);
	const low = m.pct <= 10;
	const pulse = low ? 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(f / 5)) : 1;
	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: o}}>
			<div style={{position: 'absolute', left: 22, top: 96, transform: `translateX(${(1 - inA) * -300}px)`, background: 'rgba(14,14,18,0.88)', border: `4px solid ${YEL}`, borderRadius: 16, padding: '6px 24px 8px', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 14}}>
				<div style={{fontSize: 26, color: YEL, letterSpacing: 2}}>ГОД</div>
				<div style={{fontSize: 56, lineHeight: 1, transform: `scaleY(${0.5 + 0.5 * flip})`}}>{m.year}</div>
			</div>
			<div style={{position: 'absolute', right: 22, top: 96, transform: `translateX(${(1 - inA) * 300}px)`, background: 'rgba(14,14,18,0.88)', border: `4px solid ${low ? RED : '#4a4f5c'}`, borderRadius: 16, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#9aa3b2'}}>нет сети</div>
				<div style={{opacity: pulse}}>
					<Battery pct={m.pct} w={70} h={36} stroke={4} />
				</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: low ? RED : '#fff', minWidth: 96, textAlign: 'right', transform: `scale(${0.8 + 0.2 * flip})`}}>{m.pct}%</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------ the jump -------
// the time tunnel: light streaks rushing out of the centre; the battery drops by ten, the year runs on.
// `calm` (after 1941): no glitch, slower, the counter stops for a moment at 9 May 1945.
export const Jump: React.FC<{len: number; fromYear: number; toYear: number; fromPct: number; toPct: number; calm?: boolean}> = ({len, fromYear, toYear, fromPct, toPct, calm = false}) => {
	const f = useCurrentFrame();
	const speed = calm ? 0.012 : 0.03;
	const drain = lerp(f, 4, 22, fromPct, toPct, Easing.inOut(Easing.cubic));
	// the year: plain run, or with a stop at 1945 (calm)
	let year: number;
	let victory = 0;
	if (calm) {
		const a = lerp(f, 6, 24, 0, 1, Easing.inOut(Easing.cubic));
		const b = lerp(f, 44, len - 8, 0, 1, Easing.inOut(Easing.cubic));
		year = Math.round(a < 1 ? fromYear + 4 * a : 1945 + (toYear - 1945) * b);
		victory = interpolate(f, [22, 28, 44, 50], [0, 1, 1, 0], clamp);
	} else {
		year = Math.round(lerp(f, 6, len - 8, fromYear, toYear, Easing.inOut(Easing.cubic)));
	}
	const zoomOut = interpolate(f, [len - 8, len], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const flashIn = interpolate(f, [0, 6], [1, 0], clamp);
	const shakeX = calm ? 0 : Math.sin(f * 2.3) * 6 * (1 - zoomOut);
	const N = 56;
	return (
		<AbsoluteFill style={{background: calm ? 'radial-gradient(circle at 50% 46%, #2a2f3a 0%, #0c0e14 60%, #050608 100%)' : 'radial-gradient(circle at 50% 46%, #23306a 0%, #0b1030 55%, #04050c 100%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{Array.from({length: N}).map((_, k) => {
					const a = rnd(k * 3 + 1) * Math.PI * 2 + f * (calm ? 0.002 : 0.006);
					const t = (rnd(k * 5 + 2) + f * speed * (0.7 + 0.6 * rnd(k))) % 1;
					const r0 = 60 + t * t * 1300;
					const r1 = r0 + 40 + t * 260 * (calm ? 0.5 : 1);
					const c = calm ? '#d9dde6' : k % 4 === 0 ? YEL : k % 4 === 1 ? '#7fd0ff' : '#ffffff';
					return <line key={k} x1={540 + Math.cos(a) * r0} y1={880 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={880 + Math.sin(a) * r1} stroke={c} strokeWidth={2 + t * 7} strokeLinecap="round" opacity={0.15 + 0.7 * t} />;
				})}
				{[0, 1, 2].map((k) => {
					const t = ((f * (calm ? 0.01 : 0.025) + k / 3) % 1);
					return <circle key={`r${k}`} cx={540} cy={880} r={120 + t * 900} fill="none" stroke={calm ? '#9aa3b2' : '#7fd0ff'} strokeWidth={6} opacity={(1 - t) * 0.35} />;
				})}
			</svg>
			<div style={{position: 'absolute', left: 540 + shakeX, top: 880, transform: `translate(-50%,-50%) scale(${1 + zoomOut * 2.5})`, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - zoomOut}}>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 170, lineHeight: 1, color: '#fff', letterSpacing: 6, textShadow: '0 0 40px rgba(127,208,255,0.6), 0 8px 0 rgba(0,0,0,0.4)'}}>{year}</div>
				<div style={{height: 26}} />
				<Battery pct={drain} w={300} h={140} stroke={10} glow={0.6} />
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 120, lineHeight: 1.1, color: batColor(drain), marginTop: 16, textShadow: '0 6px 0 rgba(0,0,0,0.45)'}}>{Math.round(drain)}%</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#cfd6e6', letterSpacing: 6, marginTop: 6}}>+10 ЛЕТ</div>
			</div>
			{calm && victory > 0 && (
				<div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * victory})`, opacity: victory, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, whiteSpace: 'nowrap'}}>
					<div style={{fontSize: 64, color: '#ff5a4a', letterSpacing: 4, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>9 МАЯ 1945</div>
					<div style={{fontSize: 46, color: '#fff', letterSpacing: 10, marginTop: 6}}>ПОБЕДА</div>
				</div>
			)}
			{!calm && f > 2 && f < 14 && rnd(f) > 0.5 && <AbsoluteFill style={{background: `linear-gradient(180deg, transparent ${30 + rnd(f + 1) * 40}%, rgba(127,208,255,0.25) ${30 + rnd(f + 1) * 40}%, rgba(127,208,255,0.25) ${36 + rnd(f + 1) * 40}%, transparent ${36 + rnd(f + 1) * 40}%)`}} />}
			{flashIn > 0 && <AbsoluteFill style={{background: '#fff', opacity: flashIn}} />}
			{zoomOut > 0 && <AbsoluteFill style={{background: '#fffaf0', opacity: zoomOut}} />}
		</AbsoluteFill>
	);
};
