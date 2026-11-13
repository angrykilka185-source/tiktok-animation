import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Cross, HEAVY} from '../components/Overlays';
import {Bust, Person} from '../components/Person';
import {PlankFloor, Wallpaper} from '../components/Set';
import {Stage} from '../components/Stage';
import * as P1 from '../scenes';
import {Phone, SANS} from '../scenes/S12_S16';
import * as P2 from '../p2/scenes';
import {RECAP_STEP} from './timeline';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const NIGHT = '#0b1638';

// ------------------------------------------------------------- pieces ------
// Your bedroom door seen from inside, at night. light = brightness of the corridor light.
export const InsideDoor: React.FC<{f: number; light?: number; handle?: number; shake?: number; feet?: boolean; pulse?: number}> = ({
	f,
	light = 0.6,
	handle = 0,
	shake = 0,
	feet = true,
	pulse = 0,
}) => (
	<g>
		<rect x={-300} y={-300} width={1700} height={2600} fill="#1a2238" />
		<g transform={`translate(${shake},0)`}>
			<rect x={170} y={260} width={740} height={1380} fill="#5a3822" />
			{Array.from({length: 7}).map((_, k) => (
				<rect key={k} x={200 + k * 100} y={260} width={8} height={1380} fill="#4c2f1c" />
			))}
			<rect x={250} y={340} width={580} height={500} rx={10} fill="none" stroke="#4c2f1c" strokeWidth={14} />
			<rect x={250} y={920} width={580} height={600} rx={10} fill="none" stroke="#4c2f1c" strokeWidth={14} />
			<circle cx={790} cy={900} r={52} fill="#c9c3b7" />
			<g transform={`rotate(${handle} 790 900)`}>
				<rect x={600} y={878} width={200} height={44} rx={22} fill="#ddd7cb" />
			</g>
		</g>
		<rect x={150} y={240} width={20} height={1420} fill="#2a1a10" />
		<rect x={910} y={240} width={20} height={1420} fill="#2a1a10" />
		<rect x={150} y={240} width={780} height={20} fill="#2a1a10" />
		<PlankFloor y={1660} color="#2a2236" seam="#1d1727" />
		{/* light under the door */}
		<rect x={170} y={1640} width={740} height={20} fill="#ffd27a" opacity={Math.min(1, light + pulse * 0.4)} />
		<path d="M 170,1660 L 910,1660 L 1300,2200 L -220,2200 Z" fill="#ffd27a" opacity={(light + pulse * 0.4) * 0.22} />
		{feet && (
			<>
				<rect x={360} y={1636} width={120} height={26} rx={10} fill="#0a0806" opacity={light > 0.9 ? 0 : 1} />
				<rect x={560} y={1636} width={120} height={26} rx={10} fill="#0a0806" opacity={light > 0.9 ? 0 : 1} />
			</>
		)}
		<rect x={-300} y={-300} width={1700} height={2600} fill={NIGHT} opacity={0.35 - light * 0.15} />
		<g opacity={pulse}>
			{[0, 1, 2].map((k) => {
				const t = ((f + k * 14) % 42) / 42;
				return (
					<text key={k} x={380 + k * 160} y={1620 - t * 260} fontSize={70} textAnchor="middle" fill="#ffd27a" opacity={1 - t} fontFamily={HEAVY} fontWeight={900}>
						♪
					</text>
				);
			})}
		</g>
	</g>
);

// The corridor outside your door, as seen through "dad's" phone.
export const OutsideView: React.FC<{f: number; hand?: number; handle?: number}> = ({f, hand = 0, handle = 0}) => {
	const sx = Math.sin(f / 7) * 6;
	const sy = Math.cos(f / 9) * 5;
	return (
		<g transform={`translate(${sx},${sy})`}>
			<Wallpaper id="p3out" x={-300} y={-300} w={1700} h={1900} base="#4a5a7a" line="#3f4e6c" />
			<rect x={250} y={300} width={580} height={1300} fill="#6a4228" />
			<rect x={230} y={280} width={620} height={20} fill="#3a2414" />
			<rect x={230} y={280} width={20} height={1320} fill="#3a2414" />
			<rect x={830} y={280} width={20} height={1320} fill="#3a2414" />
			<rect x={300} y={360} width={480} height={440} rx={10} fill="none" stroke="#583520" strokeWidth={12} />
			<rect x={300} y={900} width={480} height={560} rx={10} fill="none" stroke="#583520" strokeWidth={12} />
			<circle cx={300} cy={880} r={44} fill="#c9c3b7" />
			<g transform={`rotate(${-handle} 300 880)`}>
				<rect x={290} y={860} width={170} height={40} rx={20} fill="#ddd7cb" />
			</g>
			<PlankFloor y={1600} color="#3a2a22" seam="#2a1d18" />
			{/* the phone light in the dark corridor */}
			<rect x={-300} y={-300} width={1700} height={2400} fill="url(#p3flash)" />
			{hand > 0 && (
				<g transform={`translate(${1200 - 760 * hand},${940 - 40 * hand}) rotate(-80)`}>
					<rect x={-70} y={-700} width={140} height={680} rx={60} fill="#33506e" />
					<rect x={-70} y={-300} width={140} height={34} fill="#f39a2e" />
					<ellipse cx={0} cy={20} rx={78} ry={96} fill="#e9b892" />
				</g>
			)}
			<defs>
				<radialGradient id="p3flash" cx="45%" cy="55%" r="65%">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.12} />
					<stop offset="100%" stopColor="#000" stopOpacity={0.75} />
				</radialGradient>
			</defs>
		</g>
	);
};

// phone camera "recording" frame
export const CameraUI: React.FC<{f: number; startSec?: number}> = ({f, startSec = 0}) => {
	const sec = startSec + Math.floor(f / 30);
	const dot = Math.floor(f / 15) % 2 === 0;
	const corner = (style: React.CSSProperties) => <div style={{position: 'absolute', width: 90, height: 90, borderColor: '#fff', borderStyle: 'solid', borderWidth: 0, ...style}} />;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{corner({left: 60, top: 260, borderLeftWidth: 8, borderTopWidth: 8})}
			{corner({right: 60, top: 260, borderRightWidth: 8, borderTopWidth: 8})}
			{corner({left: 60, bottom: 420, borderLeftWidth: 8, borderBottomWidth: 8})}
			{corner({right: 60, bottom: 420, borderRightWidth: 8, borderBottomWidth: 8})}
			<div style={{position: 'absolute', left: 90, top: 300, display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff'}}>
				<div style={{width: 26, height: 26, borderRadius: 13, background: RED, opacity: dot ? 1 : 0.25}} />
				REC 00:{String(sec).padStart(2, '0')}
			</div>
		</AbsoluteFill>
	);
};

export const CallScreen: React.FC<{mode: 'out' | 'in' | 'declined' | 'ended'; f: number}> = ({mode, f}) => {
	const ring = (f % 30) / 30;
	const btn = 1 + Math.sin(f / 4) * 0.06;
	return (
		<div style={{position: 'absolute', inset: 0, background: mode === 'declined' || mode === 'ended' ? '#1a1b20' : 'linear-gradient(170deg,#24324f,#0b0f1a)', fontFamily: SANS, color: '#fff', textAlign: 'center'}}>
			<div style={{position: 'absolute', top: 230, width: '100%'}}>
				<div style={{position: 'relative', width: 220, height: 220, margin: '0 auto'}}>
					{(mode === 'out' || mode === 'in') && (
						<div style={{position: 'absolute', inset: -60 * ring, borderRadius: '50%', border: '6px solid rgba(90,160,255,0.6)', opacity: 1 - ring}} />
					)}
					<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#33506e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 900}}>П</div>
				</div>
				<div style={{fontSize: 56, fontWeight: 900, marginTop: 40}}>Папа (вахта)</div>
				<div style={{fontSize: 34, fontWeight: 600, marginTop: 12, color: mode === 'declined' ? '#ff5a4f' : '#b9c3d6'}}>
					{mode === 'out' ? `Видеовызов${'.'.repeat(1 + (Math.floor(f / 10) % 3))}` : mode === 'in' ? 'Входящий видеозвонок' : mode === 'declined' ? 'Вызов отклонён' : 'Звонок завершён'}
				</div>
			</div>
			{mode === 'in' ? (
				<div style={{position: 'absolute', bottom: 170, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>
					<div style={{width: 150, height: 150, borderRadius: 75, background: '#e8392f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70}}>✕</div>
					<div style={{width: 150, height: 150, borderRadius: 75, background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, transform: `scale(${btn})`}}>✓</div>
				</div>
			) : mode === 'out' ? (
				<div style={{position: 'absolute', bottom: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
					<div style={{width: 150, height: 150, borderRadius: 75, background: '#e8392f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70}}>✕</div>
				</div>
			) : null}
		</div>
	);
};

// ---------------------------------------------------------------- SHOT 1 ---
export const S01: React.FC = () => <P1.S01 />;

// ---------------------------------------------------------------- SHOT 2 ---
// "В прошлой серии" (part 2): the word card, the torn photo, «Сынок, ты один?»
const RECAP: {C: React.FC; frame: number}[] = [
	{C: P2.S07, frame: 110},
	{C: P2.S13, frame: 120},
	{C: P2.S15, frame: 70},
];
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const t0 = f - 6;
	const k = Math.min(RECAP.length - 1, Math.max(0, Math.floor(t0 / RECAP_STEP)));
	const item = RECAP[k];
	const t = t0 - k * RECAP_STEP;
	const flash = interpolate(t, [0, 4], [0.55, 0], clamp);
	const jitter = t < 3 ? (t % 2 ? 8 : -8) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translateX(${jitter}px)`}}>
				<Freeze frame={item.frame}>
					<item.C />
				</Freeze>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 7px)'}} />
			<AbsoluteFill style={{background: 'rgba(40,20,10,0.18)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
			<div style={{position: 'absolute', left: 40, top: 250, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 2}}>
				◀◀ ЧАСТЬ 2
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 3 ---
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 12, 10);
	const c = pop(f, 26, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #0d2a4a 0%, #071022 58%, #03060d 100%)'}}>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 3</div>
				<div style={{fontSize: 70, color: '#5aa0ff', marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ВИДЕОЗВОНОК</div>
				<div style={{display: 'inline-block', marginTop: 56, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 36px', fontSize: 40, transform: `scale(${c})`}}>ЧАСТИ 1–2 — В ПРОФИЛЕ</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 4 ---
// You press "video call".
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const tap = f < 22;
	const ripple = interpolate(f, [4, 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540} y={1060} w={680} scale={lerp(f, 0, 120, 1.0, 1.1) * kick(f)}>
				{tap ? (
					<div style={{position: 'absolute', inset: 0, background: '#0f1115'}}>
						<P2.ChatHeader status="в сети" dark />
						<div style={{position: 'absolute', right: 40, top: 100, width: 80, height: 80, borderRadius: 40, background: '#2d6cdf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff'}}>▶</div>
						<div style={{position: 'absolute', right: 80 - 70 * ripple, top: 140 - 70 * ripple, width: 140 * ripple, height: 140 * ripple, borderRadius: '50%', border: '6px solid #5aa0ff', opacity: 1 - ripple}} />
					</div>
				) : (
					<CallScreen mode="out" f={f} />
				)}
			</Phone>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 5 ---
// The phone rings behind your door (dad's ringtone).
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const pulse = f > 6 ? 0.5 + 0.5 * Math.abs(Math.sin(f / 5)) : 0;
	return (
		<Stage cam={{s: lerp(f, 0, 120, 1.0, 1.12) * kick(f), cx: 540, cy: 1100}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<InsideDoor f={f} light={0.5} pulse={pulse} />
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 6 ---
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540} y={1060} w={680} scale={1.08 * kick(f)}>
				<CallScreen mode="declined" f={f} />
			</Phone>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 7 ---
// «Не звони, тут плохо ловит».
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const msg = pop(f, 8, 11);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540} y={1060} w={680} scale={lerp(f, 0, 120, 1.05, 1.14) * kick(f)}>
				<div style={{position: 'absolute', inset: 0, background: '#0f1115'}} />
				<P2.ChatHeader status="в сети" dark />
				<div style={{position: 'absolute', left: 28, top: 250, width: 500, background: '#24272e', borderRadius: '30px 30px 30px 6px', padding: '18px 26px', fontFamily: SANS, fontSize: 30, fontWeight: 600, color: '#8b8f99'}}>Сынок, ты один?</div>
				<div style={{position: 'absolute', right: 28, top: 380, background: '#3a3f4a', borderRadius: '30px 30px 6px 30px', padding: '16px 24px', fontFamily: SANS, fontSize: 28, fontWeight: 600, color: '#ff8a80'}}>Видеовызов · отклонён</div>
				<div style={{position: 'absolute', left: 28, top: 500, background: '#2d6cdf', borderRadius: '34px 34px 34px 6px', padding: '24px 34px', fontFamily: SANS, fontSize: 50, fontWeight: 800, color: '#fff', transform: `scale(${msg})`, transformOrigin: '0% 100%', maxWidth: 560}}>
					Не звони. Тут плохо ловит.
					<div style={{fontSize: 22, color: '#cfe0ff', textAlign: 'right', fontWeight: 600}}>23:54</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 8 ---
// Your eyes → his shadow under your door.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 56, 1, 1.1), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#1c2747" />
				<Bust kind="son" id="p3s8" x={540} y={1000} scale={7.2} face={{eyes: 'wide', pupil: 0.6, look: [Math.sin(t / 5) > 0 ? 0.6 : -0.6, 0.4], brows: 'worried', mouth: 'o', blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.35} />
			</Stage>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 94, 1.0, 1.15) * kick(t), cx: 540, cy: 1300}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<InsideDoor f={f} light={0.6} />
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 9 ---
// Rule 4: film everything. The camera starts recording.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 120, 1.0, 1.06), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<InsideDoor f={f} light={0.55} />
			</Stage>
			<CameraUI f={f} />
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 10 ---
// Recording: the handle goes down again.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const down = lerp(f, 30, 90, 0, -32, Easing.inOut(Easing.sin));
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 120, 1.6, 1.8), cx: 760, cy: 920}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<InsideDoor f={f} light={0.55} handle={down} />
			</Stage>
			<CameraUI f={f} startSec={3} />
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 11 ---
// Three knocks. A whisper: «Тигрёнок… открой».
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const knocks = [8, 21, 34];
	const hit = knocks.reduce((a, k) => (f >= k && f < k + 6 ? Math.max(a, 1 - (f - k) / 6) : a), 0);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 150, 1.05, 1.18) * (1 + hit * 0.02), cx: 540, cy: 900}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<InsideDoor f={f} light={0.55} shake={hit * 10} />
			</Stage>
			{knocks.map((k, i) =>
				f >= k ? (
					<div key={k} style={{position: 'absolute', left: 260 + i * 200, top: 560 + (i % 2) * 120, transform: `translate(-50%,-50%) scale(${pop(f, k, 8)}) rotate(${(i - 1) * 8}deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 90, color: '#fff', textShadow: '0 6px 0 #000, 0 0 20px rgba(0,0,0,0.6)', opacity: interpolate(f, [k + 30, k + 44], [1, 0], clamp)}}>
						ТУК
					</div>
				) : null,
			)}
			<CameraUI f={f} startSec={7} />
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 12 ---
// Incoming video call from "dad".
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const buzz = Math.floor(f / 12) % 2 === 0;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540 + (buzz ? Math.sin(f * 2.9) * 8 : 0)} y={1060} w={680} scale={lerp(f, 0, 120, 1.0, 1.08) * kick(f)}>
				<CallScreen mode="in" f={f} />
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 13 ---
// You answer: the screen shows YOUR door — from the corridor.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Phone x={540} y={980} w={760} scale={lerp(f, 0, 150, 1.12, 1.24) * kick(f)}>
				<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
					<svg width="100%" height="100%" viewBox="0 0 1080 1700" preserveAspectRatio="xMidYMid slice">
						<OutsideView f={f} />
					</svg>
					<div style={{position: 'absolute', right: 24, top: 120, width: 170, height: 240, borderRadius: 20, overflow: 'hidden', border: '4px solid rgba(255,255,255,0.6)', background: '#1c2747'}}>
						<svg width="100%" height="100%" viewBox="0 0 340 480">
							<rect width={340} height={480} fill="#1c2747" />
							<Bust kind="son" id="p3pip" x={170} y={250} scale={1.25} face={{eyes: 'wide', pupil: 0.6, brows: 'worried', mouth: 'o', blush: false}} />
						</svg>
					</div>
					<div style={{position: 'absolute', left: 30, top: 120, fontFamily: SANS, fontSize: 30, fontWeight: 800, color: '#fff', textShadow: '0 2px 4px #000'}}>Папа (вахта) · 00:0{Math.min(9, Math.floor(f / 30) + 1)}</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 14 ---
// Split screen: on the phone a hand reaches for the handle — and your handle goes down.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const hand = lerp(f, 6, 70, 0, 1, Easing.out(Easing.cubic));
	const down = lerp(f, 66, 110, 0, 32, Easing.inOut(Easing.sin));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 958, overflow: 'hidden'}}>
				<svg width={1080} height={958} viewBox="0 380 1080 958" preserveAspectRatio="xMidYMid slice">
					<OutsideView f={f} hand={hand} handle={down} />
				</svg>
				<div style={{position: 'absolute', left: 30, top: 230, fontFamily: SANS, fontSize: 30, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 10}}>ЭКРАН ТЕЛЕФОНА</div>
			</div>
			<div style={{position: 'absolute', left: 0, top: 958, width: 1080, height: 4, background: RED}} />
			<div style={{position: 'absolute', left: 0, top: 962, width: 1080, height: 958, overflow: 'hidden'}}>
				<svg width={1080} height={958} viewBox="440 600 700 620" preserveAspectRatio="xMidYMid slice">
					<InsideDoor f={f} light={0.55} handle={-down} />
				</svg>
			</div>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 15 ---
// The corridor light comes on (mom). The shadow is gone.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const on = f >= 10;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 120, 1.05, 1.12) * kick(Math.max(0, f - 10)), cx: 540, cy: 1250}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<InsideDoor f={f} light={on ? 1.0 : 0.55} feet={!on} />
			</Stage>
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [10, 16], [0.35, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 16 ---
// The call ends. Mom opens the door — nobody in the corridor.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
				<Phone x={540} y={1060} w={680} scale={1.08}>
					<div style={{position: 'absolute', inset: 0, background: '#000', opacity: interpolate(t, [18, 30], [0, 1], clamp), zIndex: 2}} />
					<CallScreen mode="ended" f={t} />
				</Phone>
			</AbsoluteFill>
		);
	}
	const open = lerp(t, 4, 30, 0, 1, Easing.out(Easing.cubic));
	return (
		<Stage cam={{s: lerp(t, 0, 106, 1.0, 1.1) * kick(t), cx: 540, cy: 1000}} light={{glow: 0.2, vignette: 0.7}} bg="#05070f">
			<rect x={-300} y={-300} width={1700} height={2600} fill="#1a2238" />
			{/* lit corridor behind the door */}
			<Wallpaper id="p3hall" x={170} y={260} w={740} h={1400} base="#f0dcb0" line="#dfc490" />
			<rect x={500} y={300} width={80} height={40} rx={10} fill="#fff6d8" />
			<PlankFloor y={1400} />
			<Person
				kind="mom"
				id="p3mom"
				x={560}
				y={1700}
				scale={1.05}
				face={{eyes: 'narrow', mouth: 'flat', brows: 'neutral', look: [0, 0.3]}}
				armL={{target: [-26, -560], kf: 0.55, bend: 1}}
				armR={{target: [150, -700], ku: 0.9, kf: 0.8, bend: -1}}
			/>
			{/* the door panel swinging open */}
			<path d={`M 910,260 L ${910 - 740 * (1 - open)},${260 - 30 * open} L ${910 - 740 * (1 - open)},${1660 + 30 * open} L 910,1660 Z`} fill="#5a3822" />
			<rect x={150} y={240} width={20} height={1420} fill="#2a1a10" />
			<rect x={910} y={240} width={20} height={1420} fill="#2a1a10" />
			<rect x={150} y={240} width={780} height={20} fill="#2a1a10" />
			<rect x={-300} y={-300} width={470} height={2600} fill={NIGHT} opacity={0.5} />
			<rect x={930} y={-300} width={600} height={2600} fill={NIGHT} opacity={0.5} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 17 ---
// Mom: «Папа спит. Я только что от него».
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const talking = f > 20 && f < 100 && Math.floor(f / 5) % 2 === 0;
	return (
		<Stage cam={{s: lerp(f, 0, 120, 1.0, 1.08) * kick(f), cx: 540, cy: 900}} light={{glow: 0.3, vignette: 0.7}} bg="#e9d1a2">
			<Wallpaper id="p3s17" x={-300} y={-300} w={1700} h={2600} base="#f0dcb0" line="#dfc490" />
			<Bust kind="mom" id="p3mom17" x={540} y={880} scale={3.3} face={{eyes: 'narrow', mouth: talking ? 'o' : 'smile', brows: 'neutral', look: [0, 0.3]}} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 18 ---
// Your pupils shrink → the parents' bedroom door is ajar…
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60]);
	if (i === 0) {
		const pupil = interpolate(t, [6, 16], [1.1, 0.35], {...clamp, easing: Easing.out(Easing.cubic)});
		return (
			<Stage cam={{s: lerp(t, 0, 60, 1.0, 1.1), cx: 540, cy: 960}} light={{glow: 0.1, vignette: 0.85}} bg="#2a1a14">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#7a5a44" />
				<Bust kind="son" id="p3s18" x={540} y={1000} scale={7.2} face={{eyes: 'wide', pupil, brows: 'worried', mouth: 'o', sweat: 1, blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={0.55} />
			</Stage>
		);
	}
	const glint = interpolate(t, [50, 62], [0, 1], clamp);
	return (
		<Stage cam={{s: lerp(t, 0, 90, 1.0, 1.35, Easing.inOut(Easing.quad)) * kick(t), cx: 540, cy: 960}} light={{glow: 0.1, vignette: 0.85}} bg="#05070f">
			<Wallpaper id="p3s18wp" x={-300} y={-300} w={1700} h={1800} base="#c9b48a" line="#b8a278" />
			<rect x={330} y={420} width={420} height={1080} fill="#6e4628" />
			<rect x={330} y={420} width={150} height={1080} fill="#050505" />
			<g opacity={glint}>
				<circle cx={392} cy={760} r={7} fill="#fff" />
				<circle cx={428} cy={760} r={7} fill="#fff" />
			</g>
			<rect x={310} y={400} width={460} height={20} fill="#3a2414" />
			<rect x={310} y={400} width={20} height={1100} fill="#3a2414" />
			<rect x={750} y={400} width={20} height={1100} fill="#3a2414" />
			<PlankFloor y={1500} />
			<rect x={-300} y={-300} width={1700} height={2600} fill={NIGHT} opacity={0.35} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 19 ---
// Finale: choose. Countdown 3-2-1, end card for part 4.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 40, 11);
	const nums = [
		{n: '3', at: 150},
		{n: '2', at: 180},
		{n: '1', at: 210},
	];
	const cur = [...nums].reverse().find((x) => f >= x.at);
	const final = f >= 236;
	const fp = pop(f, 236, 9);
	const pulse = final ? 1 + Math.sin((f - 236) / 4) * 0.03 : 1;
	const counting = f >= 150 && f < 236;
	const hot = counting ? (Math.floor((f - 150) / 15) % 2 === 0 ? 1 : 2) : 0;
	const endCard = interpolate(f, [252, 260], [0, 1], clamp);
	const card = (p: number, top: number, num: string, text: string, color: string, sub: string, idx: number) => (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top,
				width: 720,
				transform: `translateX(${(1 - p) * -800}px) scale(${pulse * (hot === idx ? 1.04 : 1)})`,
				background: hot === idx ? color : '#121214',
				border: `7px solid ${color}`,
				borderRadius: 28,
				padding: '26px 30px',
				display: 'flex',
				gap: 26,
				alignItems: 'center',
				boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
				boxSizing: 'border-box',
			}}
		>
			<div style={{minWidth: 110, height: 110, borderRadius: 55, background: color, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</div>
			<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 50, color: '#fff', lineHeight: 1.08}}>
				{text}
				<div style={{fontSize: 30, color: hot === idx ? '#fff' : color, marginTop: 6}}>{sub}</div>
			</div>
		</div>
	);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 300, 1.0, 1.12), cx: 540, cy: 900}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<Wallpaper id="p3fin" x={-300} y={-300} w={1700} h={1800} base="#8a7a5a" line="#7a6a4a" />
				<rect x={330} y={420} width={420} height={1080} fill="#4e3220" />
				<rect x={330} y={420} width={150} height={1080} fill="#050505" />
				<circle cx={392} cy={760} r={7} fill="#fff" />
				<circle cx={428} cy={760} r={7} fill="#fff" />
				<PlankFloor y={1500} color="#3a2a22" seam="#2a1d18" />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#000" opacity={0.55} />
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)'}}>
				ОН ИЛИ <span style={{color: RED}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18}}>
					{Array.from({length: 12}).map((_, i) => (
						<div key={i} style={{width: 52, height: 52, borderRadius: 10, background: '#e0342b', border: '3px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 18 + i * 2, 9)})`}}>
							<Cross size={28} width={5} />
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'ПОКАЗАТЬ МАМЕ ВИДЕО', '#3b82f6', 'и доказать, что это не он', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ПРОВЕРИТЬ СПАЛЬНЮ РОДИТЕЛЕЙ', '#e0342b', 'и увидеть, кто там спит', 2)}
			{cur && !final && (
				<div
					style={{
						position: 'absolute',
						left: 420,
						top: 1340,
						width: 200,
						height: 200,
						marginLeft: -100,
						borderRadius: 100,
						background: '#e7c44a',
						border: '8px solid #111',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 140,
						color: '#111',
						transform: `scale(${pop(f, cur.at, 8) * interpolate(f, [cur.at + 22, cur.at + 30], [1, 0.6], clamp)})`,
					}}
				>
					{cur.n}
				</div>
			)}
			{final && (
				<div style={{position: 'absolute', left: 40, width: 760, top: 1290, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${fp})`}}>
					<div style={{fontSize: 96, color: '#e7c44a', textShadow: '0 6px 0 #000'}}>ВЫБИРАЙ!</div>
					<div style={{fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000', marginTop: 6}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
				</div>
			)}
			{endCard > 0 && (
				<AbsoluteFill style={{opacity: endCard, background: 'radial-gradient(circle at 50% 42%, #4a0d10 0%, #1a0607 55%, #0a0304 100%)'}}>
					<div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 4</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ЧАСТИ 1–3 — В ПРОФИЛЕ</div>
						<div style={{fontSize: 32, color: '#b9a9aa', marginTop: 30, letterSpacing: 2}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
						<div style={{display: 'inline-block', marginTop: 46, background: '#ff2d3d', borderRadius: 60, padding: '22px 70px', fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(255,45,61,0.6)', transform: `scale(${1 + Math.sin(f / 5) * 0.04})`}}>
							ПОДПИШИСЬ
						</div>
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};
