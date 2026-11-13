// Part 6 «Гараж»: 23 shots on the timeline of src/p6/timeline.ts (≈ the final edit).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Cross, HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {PlankFloor} from '../components/Set';
import {Stage} from '../components/Stage';
import * as P1 from '../scenes';
import {BigHand} from '../scenes/S01_S05';
import {Phone, SANS} from '../scenes/S12_S16';
import * as P3 from '../p3/scenes';
import * as P4 from '../p4/scenes';
import * as P5 from '../p5/scenes';
import {Hall} from '../g2/scenes';

const {Shadow, Glint, Flashlight, ParentsRoom} = P4;
const {Recap, Yard, ShadowFace} = P5;

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const NIGHT = '#0b1638';
const PYJAMA = {top: '#9fb8e0', topDark: '#86a0c8', pants: '#9fb8e0'};
const JACKET = {top: '#3a4a6a', topDark: '#2e3c58', pants: '#9fb8e0'};
const DAD_SKIN = '#e9b892';

// ======================================================= scene pieces =====
// a parked car seen from the side (local origin = ground under the middle)
const Car: React.FC<{x: number; y: number; s: number; color: string}> = ({x, y, s, color}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -270,-40 L -262,-112 Q -252,-132 -210,-136 L -130,-142 L -66,-212 Q -46,-232 -6,-232 L 130,-232 Q 172,-232 192,-206 L 244,-142 L 256,-136 Q 288,-130 288,-100 L 292,-40 Z" fill={color} />
		<path d="M -44,-204 L -4,-220 L 120,-220 L 162,-152 L -94,-152 Z" fill="#1d2433" />
		<rect x={52} y={-220} width={10} height={70} fill={color} />
		{[-165, 175].map((cx) => (
			<g key={cx}>
				<circle cx={cx} cy={-40} r={52} fill="#121317" />
				<circle cx={cx} cy={-40} r={22} fill="#6b727c" />
			</g>
		))}
		<rect x={-270} y={-60} width={562} height={10} fill="#000" opacity={0.25} />
	</g>
);

// garage №17 from the outside; lift 0..1 = the door rolled up; inside = what the open part shows
const GarageFront: React.FC<{f: number; lift?: number; light?: number; inside?: React.ReactNode; id: string}> = ({f, lift = 0, light = 1, inside, id}) => {
	const bottom = 1480 - 960 * lift;
	const flick = 0.9 + 0.1 * Math.sin(f / 3);
	return (
		<g>
			<rect x={-600} y={-600} width={2400} height={1800} fill="url(#skyNight)" />
			<rect x={-600} y={1480} width={2400} height={1200} fill="#24262f" />
			<rect x={-600} y={1470} width={2400} height={12} fill="#3a3d48" />
			{[-480, 1100].map((x) => (
				<rect key={x} x={x} y={380} width={460} height={1100} fill="#40454f" />
			))}
			<rect x={40} y={360} width={1000} height={40} fill="#3a3f48" />
			<rect x={60} y={400} width={960} height={1080} fill="#4a4f5a" />
			<defs>
				<clipPath id={`${id}open`}>
					<rect x={160} y={bottom} width={760} height={1480 - bottom} />
				</clipPath>
				<linearGradient id={`${id}glow`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#fff6d6" />
					<stop offset="100%" stopColor="#f2c66c" />
				</linearGradient>
			</defs>
			{lift > 0 && (
				<g clipPath={`url(#${id}open)`}>
					<rect x={160} y={520} width={760} height={960} fill={`url(#${id}glow)`} />
					{inside}
				</g>
			)}
			<rect x={160} y={520} width={760} height={Math.max(0, bottom - 520)} fill="#6b5a4a" />
			{Array.from({length: 9}).map((_, j) => {
				const yy = 560 + j * 104;
				return yy < bottom ? <rect key={j} x={160} y={yy} width={760} height={8} fill="#5a4b3e" /> : null;
			})}
			{bottom > 700 && (
				<text x={540} y={680} fontSize={130} fontFamily={HEAVY} fontWeight={900} fill="#e8e2d2" textAnchor="middle" opacity={0.9}>
					17
				</text>
			)}
			<rect x={150} y={510} width={780} height={12} fill="#3a3f48" />
			{/* light leaking out */}
			<g opacity={light * flick}>
				<rect x={160} y={bottom - 2} width={760} height={lift > 0 ? 4 : 12} fill="#fff3c4" />
				<rect x={154} y={520} width={6} height={bottom - 520} fill="#ffe08a" opacity={0.7} />
				<rect x={920} y={520} width={6} height={bottom - 520} fill="#ffe08a" opacity={0.7} />
				<path d={`M 160,1480 L 920,1480 L ${1080 + 400 * lift},${1700 + 300 * lift} L ${0 - 400 * lift},${1700 + 300 * lift} Z`} fill="#ffe08a" opacity={0.22 + 0.4 * lift} />
			</g>
		</g>
	);
};

// legs + boots of a man standing / walking (the view through the gap shows only this much)
const Legs: React.FC<{x: number; y: number; s: number; ph?: number; pants?: string; boots?: string}> = ({x, y, s, ph, pants = '#2b2d33', boots = '#111216'}) => {
	const a = ph !== undefined ? Math.sin(ph) * 26 : 0;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{[-1, 1].map((d) => {
				const off = d * a;
				return (
					<g key={d}>
						<rect x={d * 34 - 30 + off} y={-460} width={60} height={420} fill={pants} />
						<path d={`M ${d * 34 - 40 + off},-50 L ${d * 34 + 34 + off + 30},-50 Q ${d * 34 + 34 + off + 52},-26 ${d * 34 + 34 + off + 46},0 L ${d * 34 - 44 + off},0 Z`} fill={boots} />
					</g>
				);
			})}
		</g>
	);
};

// the chair with dad's tied feet (view through the gap)
const TiedFeet: React.FC<{x: number; y: number; s: number; ring?: number}> = ({x, y, s, ring = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[-150, 150].map((cx) => (
			<rect key={cx} x={cx - 12} y={-420} width={24} height={420} fill="#6a4a34" />
		))}
		<rect x={-170} y={-430} width={340} height={30} fill="#7a5638" />
		<rect x={-170} y={-180} width={340} height={14} fill="#5a3e2c" />
		<Legs x={0} y={0} s={1} pants="#4b4f55" boots="#5a3a24" />
		{[-34, 34].map((cx) => (
			<g key={cx}>
				{[-120, -96, -72].map((yy) => (
					<rect key={yy} x={cx - 44} y={yy} width={88} height={14} rx={7} fill="#d8c690" />
				))}
			</g>
		))}
		<path d="M -150,-110 Q -90,-80 -60,-100 M 150,-110 Q 90,-80 60,-100" stroke="#d8c690" strokeWidth={10} fill="none" />
		{ring > 0.01 && <ellipse cx={0} cy={-96} rx={170 * (0.6 + 0.4 * ring)} ry={90 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={10} opacity={Math.min(1, ring)} />}
	</g>
);

// what you see lying on the asphalt: a narrow bright slit under the garage door
const Slit: React.FC<{f: number; id: string; pan?: number; children: React.ReactNode}> = ({f, id, pan = 0, children}) => (
	<AbsoluteFill style={{background: '#020203'}}>
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
			<defs>
				<clipPath id={`${id}slit`}>
					<path d="M -20,800 L 1100,780 L 1100,1150 L -20,1170 Z" />
				</clipPath>
				<linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#d9c9a0" />
					<stop offset="100%" stopColor="#9b8a68" />
				</linearGradient>
			</defs>
			<g clipPath={`url(#${id}slit)`}>
				<g transform={`translate(${-pan},0)`}>
					<rect x={-400} y={700} width={2400} height={300} fill="#7d7a70" />
					<rect x={-400} y={1000} width={2400} height={300} fill={`url(#${id}floor)`} />
					<ellipse cx={300} cy={1080} rx={160} ry={24} fill="#5a4a3a" opacity={0.4} />
					<ellipse cx={1300} cy={1060} rx={120} ry={18} fill="#5a4a3a" opacity={0.35} />
					{children}
				</g>
				<rect x={-20} y={760} width={1120} height={420} fill="#fff3c4" opacity={0.08 + 0.04 * Math.sin(f / 3)} />
			</g>
			<rect x={-20} y={700} width={1120} height={100} fill="#5a4b3e" />
			<rect x={-20} y={1150} width={1120} height={800} fill="#1a1b20" />
			<rect x={-20} y={1150} width={1120} height={40} fill="#ffe08a" opacity={0.12} />
		</svg>
		<P3.CameraUI f={f} startSec={41} />
	</AbsoluteFill>
);

// inside the garage: walls, tool board, a bare bulb; dad tied to a chair
const GarageInside: React.FC<{f: number; id: string; lean?: number; dadFace: Face; dadTilt?: number; shadowX?: number}> = ({f, id, lean = 0, dadFace, dadTilt = 0, shadowX = 330}) => {
	const sway = Math.sin(f / 14) * 3;
	return (
		<g>
			<rect x={-500} y={-500} width={2200} height={3000} fill="#5d6066" />
			{Array.from({length: 9}).map((_, k) => (
				<rect key={k} x={-500} y={-400 + k * 220} width={2200} height={6} fill="#53565c" />
			))}
			<rect x={620} y={420} width={420} height={300} fill="#7a6a52" />
			{[680, 760, 840, 920].map((x, k) => (
				<path key={x} d={`M ${x},450 l 0,${120 + (k % 2) * 60} m -18,0 l 36,0`} stroke="#3a3d42" strokeWidth={14} strokeLinecap="round" />
			))}
			<rect x={-500} y={1400} width={2200} height={1200} fill="#8a8678" />
			<ellipse cx={540} cy={1440} rx={420} ry={50} fill="#000" opacity={0.15} />
			{/* the bulb */}
			<line x1={540 + sway} y1={-500} x2={540 + sway} y2={330} stroke="#222" strokeWidth={4} />
			<circle cx={540 + sway} cy={350} r={24} fill="#fff6d0" />
			<circle cx={540 + sway} cy={350} r={140} fill="#fff6d0" opacity={0.15} />
			{/* dad on the chair */}
			<g>
				<rect x={640} y={1180} width={260} height={26} fill="#7a5638" />
				{[660, 880].map((x) => (
					<rect key={x} x={x - 10} y={1200} width={20} height={240} fill="#6a4a34" />
				))}
				<g transform={`rotate(${dadTilt} 770 1180)`}>
					<Person kind="dad" id={`${id}dad`} x={770} y={1180 + 470 * 0.95} scale={0.95} hideLegs face={{stubble: true, ...dadFace}} armL={{target: [-120, -420], bend: 1}} armR={{target: [120, -420], bend: -1}} />
					<rect x={650} y={930} width={240} height={16} rx={8} fill="#d8c690" />
					<rect x={650} y={980} width={240} height={16} rx={8} fill="#d8c690" />
				</g>
				<Legs x={770} y={1440} s={0.6} pants="#4b4f55" boots="#5a3a24" />
			</g>
			{/* «он» — dark against the light, leaning towards dad */}
			<g transform={`rotate(${18 * lean} ${shadowX} 1450)`}>
				<Shadow id={`${id}sh`} x={shadowX} y={1450} scale={1.0} />
			</g>
			<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1a08" opacity={0.18} />
		</g>
	);
};

// chat on dad's phone (the impostor's hands): everything «папа» wrote to you was sent from here
const DAD_MSGS = ['Сынок, рейс задержали. Прилечу завтра.', 'Маме не говори. Сюрприз.', 'Сынок, ты один?', 'Не звони. Тут плохо ловит.'];
const DadChat: React.FC<{f: number; typed: string; sent: number; hl: number}> = ({f, typed, sent, hl}) => (
	<div style={{position: 'absolute', inset: 0, background: '#0f1115', fontFamily: SANS}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 190, background: '#1b1d22', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 20, boxSizing: 'border-box'}}>
			<div style={{width: 84, height: 84, borderRadius: 42, background: '#f0a032', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40}}>С</div>
			<div>
				<div style={{fontWeight: 900, fontSize: 40, color: '#f2f2f2'}}>Сынок</div>
				<div style={{fontWeight: 600, fontSize: 26, color: '#8b93a3'}}>был(а) недавно</div>
			</div>
		</div>
		<div style={{position: 'absolute', left: 24, right: 24, top: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16}}>
			{DAD_MSGS.map((m, k) => {
				const on = hl > k * 0.25;
				return (
					<div key={k} style={{maxWidth: 500, background: '#2d6cdf', borderRadius: '28px 28px 8px 28px', padding: '14px 22px', fontSize: 30, fontWeight: 700, color: '#fff', boxShadow: on ? `0 0 0 6px ${YELLOW}` : undefined, transform: `scale(${on ? 1.03 : 1})`}}>
						{m}
					</div>
				);
			})}
			{sent > 0 && <div style={{maxWidth: 500, background: '#2d6cdf', borderRadius: '28px 28px 8px 28px', padding: '14px 22px', fontSize: 34, fontWeight: 800, color: '#fff', transform: `scale(${sent})`, transformOrigin: '100% 100%'}}>Сынок, ты не спишь?</div>}
		</div>
		<div style={{position: 'absolute', left: 20, right: 20, bottom: 40, height: 86, borderRadius: 43, background: '#22252c', display: 'flex', alignItems: 'center', padding: '0 32px', fontSize: 34, fontWeight: 700, color: typed ? '#fff' : '#6b7280', boxSizing: 'border-box'}}>
			{typed || 'Сообщение'}
			{sent === 0 && Math.floor(f / 8) % 2 === 0 && <span style={{width: 3, height: 40, background: '#5aa0ff', marginLeft: 4}} />}
		</div>
	</div>
);

// ============================================================== SHOTS =======
// 1. the same opening as parts 1–5
export const S01: React.FC = () => <P1.S01 />;

// 2. Recap: he sat on the edge of your bed, fishing for your word.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 5">
			{i === 0 ? (
				<Freeze frame={80}>
					<P5.S12 />
				</Freeze>
			) : (
				<Freeze frame={80}>
					<P5.S15 />
				</Freeze>
			)}
		</Recap>
	);
};

// 3. Recap: at 3 a.m. he left — to dad's garage.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [66]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 5">
			{i === 0 ? (
				<Freeze frame={60}>
					<P5.S20 />
				</Freeze>
			) : (
				<Freeze frame={72}>
					<P5.S22 />
				</Freeze>
			)}
		</Recap>
	);
};

// 4. Title: part 6 «Гараж».
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 20, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a2a10 0%, #1a1208 58%, #070503 100%)'}}>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 6</div>
				<div style={{fontSize: 76, color: '#ffc25a', marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ГАРАЖ</div>
				<div style={{display: 'inline-block', marginTop: 56, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 36px', fontSize: 40, transform: `scale(${c})`}}>ЧАСТИ 1–5 — В ПРОФИЛЕ</div>
			</div>
		</AbsoluteFill>
	);
};

// 5. A jacket straight over your pyjamas — and quietly out.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const jacket = f >= 30;
	const puff = f >= 30 && f < 42 ? 1 - (f - 30) / 12 : 0;
	const x = f < 72 ? 300 : lerp(f, 72, 123, 300, 520, Easing.linear);
	return (
		<Stage cam={{s: lerp(f, 0, 123, 1.0, 1.08), cx: 520, cy: 1040}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Hall id="p6s5" dark={0.55} />
			<Person kind="son" id="p6s5son" colors={jacket ? JACKET : PYJAMA} x={x} y={1560} scale={0.95} walk={f >= 72 ? f * 0.18 : undefined} breathe={f} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.6, 0], blush: false}} />
			{puff > 0 && <circle cx={x} cy={1560 - 560} r={260 * (1 - puff) + 60} fill="#fff" opacity={0.35 * puff} />}
			<Flashlight id="p6s5fl" x={x + 60} y={1100} r={760} dark={0.62} />
		</Stage>
	);
};

// 6. Mom is asleep → you close the front door so the lock doesn't click.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [27]);
	if (i === 0) {
		return (
			<Stage cam={{s: 2.2, cx: 330, cy: 1120}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<ParentsRoom f={f} id="p6s6" pulled={1} />
				<Flashlight id="p6s6fl" x={330} y={1110} r={300} dark={0.75} />
			</Stage>
		);
	}
	const turn = lerp(t, 26, 70, 0, 85, Easing.inOut(Easing.sin));
	const sh = interpolate(t, [40, 60], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(t, 0, 81, 1.0, 1.12), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={1600} fill="#e6e9dd" />
				<rect x={-500} y={1100} width={2200} height={1400} fill="#5f9a83" />
				<rect x={120} y={-200} width={840} height={2400} fill="#6a4a3a" />
				<rect x={150} y={-200} width={780} height={2400} fill="#7c5644" />
				<rect x={380} y={760} width={320} height={420} rx={30} fill="#c9b37a" />
				<rect x={410} y={790} width={260} height={360} rx={20} fill="#b39a62" />
				<circle cx={540} cy={920} r={60} fill="#8a7444" />
				<g transform={`rotate(${turn} 540 920)`}>
					<rect x={530} y={880} width={20} height={80} rx={6} fill="#3a2f18" />
					<rect x={520} y={800} width={40} height={100} rx={10} fill="#d8c090" />
					<circle cx={540} cy={790} r={46} fill="#d8c090" />
					<circle cx={540} cy={790} r={16} fill="#8a7444" />
				</g>
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.35} />
			</Stage>
			<div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: '#fff', textShadow: '0 6px 0 #000', opacity: sh, transform: `scale(${0.8 + 0.2 * sh})`}}>ТСС…</div>
		</AbsoluteFill>
	);
};

// 7. The camera is on. Rule four: film everything. (the stairwell, through the phone)
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const bob = Math.sin(f / 6) * 8;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 114, 1.0, 1.15), cx: 540, cy: 1000, dy: bob}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={1500} fill="#cfd3c6" />
				<rect x={-500} y={1000} width={2200} height={1600} fill="#4f8571" />
				<rect x={-500} y={994} width={2200} height={10} fill="#3d6a58" />
				<rect x={330} y={560} width={420} height={900} fill="#3a2a22" />
				<rect x={350} y={580} width={380} height={860} fill="#4a3628" />
				<rect x={350} y={580} width={380} height={300} fill="#1a1f33" opacity={0.6} />
				<PlankFloor y={1460} color="#6a5a4a" seam="#5a4a3a" />
				<Flashlight id="p6s7fl" x={540} y={1000} r={640} dark={0.8} />
			</Stage>
			{f >= 4 && <P3.CameraUI f={f - 4} />}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [4, 7, 10], [0, 0.4, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 8. The yard is empty. The streetlight hums; somewhere a dog howls.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const flick = f >= 46 && f < 72 && Math.floor(f / 3) % 3 === 0 ? 0.35 : 0;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 111, 1.0, 1.08), cx: 560, cy: 960}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<Yard f={f} id="p6s8" light={0.9} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#000" opacity={flick} />
			</Stage>
			<P3.CameraUI f={f} startSec={4} />
		</AbsoluteFill>
	);
};

// 9. You follow him, hiding behind the cars.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const peek = interpolate(f, [8, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
			<Yard f={f} id="p6s9" light={0.9} walker={{x: lerp(f, 0, 66, 520, 660, Easing.linear), y: 1260, s: 0.26}} />
			<Person kind="son" id="p6s9son" colors={JACKET} x={820} y={1880 - 150 * peek} scale={1.0} face={{eyes: 'wide', look: [-0.9, -0.2], brows: 'worried', mouth: 'flat', blush: false}} />
			<Car x={420} y={1820} s={1.9} color="#5a6a7a" />
			<rect x={-500} y={1800} width={2200} height={800} fill="#1c1e25" />
		</Stage>
	);
};

// 10. Garage №17. The door is pulled to; at the bottom — a strip of light.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const num = pop(f, 26, 10);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 135, 0.95, 1.12), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<GarageFront f={f} id="p6s10" light={interpolate(f, [100, 112], [0.55, 1], clamp)} />
				{num > 0.01 && <circle cx={540} cy={640} r={120 * (0.6 + 0.4 * num)} fill="none" stroke={RED} strokeWidth={10} opacity={Math.min(1, num)} />}
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.25} />
			</Stage>
			<P3.CameraUI f={f} startSec={12} />
		</AbsoluteFill>
	);
};

// 11. You lie down on the cold asphalt and look through the gap.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [50]);
	if (i === 0) {
		const down = interpolate(t, [4, 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
		return (
			<Stage cam={{s: lerp(t, 0, 50, 1.0, 1.15), cx: 540, cy: 1250}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<GarageFront f={f} id="p6s11" />
				<g transform={`rotate(${-90 * down} 1000 1560)`}>
					<Person kind="son" id="p6s11son" back colors={JACKET} x={1000} y={1560} scale={0.95} />
				</g>
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.25} />
			</Stage>
		);
	}
	// close: your face at the ground, the strip of light across your eye
	return (
		<Stage cam={{s: lerp(t, 0, 43, 1.0, 1.08), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#1a1b20" />
			<rect x={-500} y={-500} width={2200} height={1300} fill="#5a4b3e" />
			<rect x={-500} y={800} width={2200} height={60} fill="#fff3c4" />
			<rect x={-500} y={860} width={2200} height={300} fill="#ffe08a" opacity={0.15} />
			<g transform="rotate(90 380 1180)">
				<Bust kind="son" id="p6s11b" x={380} y={1180} scale={3.4} face={{eyes: 'narrow', look: [-1, 0], brows: 'worried', mouth: 'flat', blush: false}} />
			</g>
			<rect x={-500} y={820} width={2200} height={140} fill="#fff3c4" opacity={0.18} />
		</Stage>
	);
};

// 12. Through the gap: only boots. HIS boots. Pacing to and fro.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const x = 540 + Math.sin((f - 26) / 22) * 380;
	const vis = f >= 24;
	return (
		<Slit f={f} id="p6s12">
			{vis && <Legs x={x} y={1110} s={0.9} ph={f * 0.28} />}
		</Slit>
	);
};

// 13. Then — a chair. And someone tied to it.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const pan = lerp(f, 0, 40, 0, 700, Easing.inOut(Easing.cubic));
	return (
		<Slit f={f} id="p6s13" pan={pan}>
			<Legs x={300} y={1110} s={0.9} />
			<TiedFeet x={1240} y={1120} s={0.9} ring={pop(f, 79, 10)} />
		</Slit>
	);
};

// 14. A work jacket with an orange stripe. And a saw scar on the hand.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 62, 2.0, 2.3), cx: 560, cy: 860}} light={{glow: 0.2, vignette: 0.85}} bg="#05070f">
				<GarageInside f={f} id="p6s14" dadFace={{eyes: 'closed', brows: 'sad', mouth: 'flat'}} dadTilt={14} shadowX={-300} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={0.2} />
			</Stage>
		);
	}
	const ring = pop(t, 6, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 46, 1.0, 1.1), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.8}} bg="#3a3226">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#6a5a44" />
			<BigHand x={520} y={1060} rot={-20} s={1.25} scar />
			<rect x={330} y={700} width={330} height={34} rx={14} fill="#d8c690" transform="rotate(-20 495 717)" />
			<rect x={340} y={760} width={330} height={34} rx={14} fill="#c9b67c" transform="rotate(-20 505 777)" />
			{ring > 0.01 && <circle cx={545} cy={1040} r={170 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={12} opacity={Math.min(1, ring)} />}
		</Stage>
	);
};

// 15. It's dad. The real one. Alive. He's been here all three days.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Stage cam={{s: lerp(f, 0, 150, 1.0, 1.14), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.85}} bg="#2a2218">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#5d6066" />
			<circle cx={760} cy={260} r={240} fill="#fff6d0" opacity={0.2} />
			<Bust kind="dad" id="p6s15" x={540} y={980} scale={3.5} tilt={6} face={{eyes: 'narrow', brows: 'sad', mouth: 'flat', stubble: true, sweat: 0.5, look: [0.2, 0.4], blush: false}} />
			<rect x={-100} y={1420} width={1280} height={40} rx={20} fill="#d8c690" />
			<rect x={-100} y={1500} width={1280} height={40} rx={20} fill="#c9b67c" />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1a08" opacity={0.15} />
		</Stage>
	);
};

// 16. «Он» leans over dad: «Последний раз спрашиваю. Какое слово?»
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const lean = interpolate(f, [8, 36], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Stage cam={{s: lerp(f, 0, 138, 1.0, 1.1) * (f >= 109 ? kick(f - 109, 0.05) : 1), cx: 560, cy: 1000}} light={{glow: 0.2, vignette: 0.85}} bg="#2a2218">
			<GarageInside f={f} id="p6s16" lean={lean} dadFace={{eyes: 'narrow', brows: 'sad', mouth: 'flat'}} dadTilt={10} />
		</Stage>
	);
};

// 17. Dad lifts his head… and says nothing. He won't tell. Not even him.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const up = interpolate(f, [10, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<Stage cam={{s: lerp(f, 0, 117, 1.0, 1.12), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.85}} bg="#2a2218">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#5d6066" />
			<circle cx={760} cy={260} r={240} fill="#fff6d0" opacity={0.2} />
			<Bust kind="dad" id="p6s17" x={540} y={1000 - 40 * up} scale={3.5} tilt={22 * (1 - up)} face={{eyes: up > 0.5 ? 'open' : 'narrow', brows: up > 0.5 ? 'angry' : 'sad', mouth: 'tight', stubble: true, look: [-0.5, up > 0.5 ? -0.3 : 0.6], blush: false}} />
			<rect x={-100} y={1420} width={1280} height={40} rx={20} fill="#d8c690" />
			<rect x={-100} y={1500} width={1280} height={40} rx={20} fill="#c9b67c" />
		</Stage>
	);
};

// 18. He takes out dad's phone — its light shows his face… (it's dad's face)
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const light = interpolate(f, [30, 46], [0, 1], clamp);
	return (
		<Stage cam={{s: lerp(f, 0, 132, 1.0, 1.12), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#121418" />
			<Bust kind="dad" id="p6s18" x={540} y={940} scale={3.4} face={{eyes: 'narrow', brows: 'angry', mouth: f >= 74 ? 'smile' : 'flat', stubble: true, look: [0, 0.8], blush: false}} />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#05070f" opacity={0.92 - 0.45 * light} />
			<Flashlight id="p6s18fl" x={540} y={1500} r={900} dark={0.95 - 0.35 * light} />
			<g transform={`translate(540,${1520 - 60 * light})`}>
				<rect x={-110} y={-200} width={220} height={400} rx={30} fill="#15161a" />
				<rect x={-96} y={-186} width={192} height={372} rx={22} fill="#cfe2ff" opacity={light} />
				<ellipse cx={-130} cy={60} rx={70} ry={100} fill="#06080d" />
				<ellipse cx={130} cy={60} rx={70} ry={100} fill="#06080d" />
			</g>
		</Stage>
	);
};

// 19. He types to you. So that's who's been writing as dad all along.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const msg = 'Сынок, ты не спишь?';
	const n = Math.max(0, Math.min(msg.length, Math.floor((f - 6) / 1.6)));
	const sent = f >= 38 ? pop(f, 38, 11) : 0;
	const hl = interpolate(f, [74, 100], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #2a2016 0%, #05070f 70%)'}}>
			<Phone x={540} y={1000} w={680} scale={lerp(f, 0, 105, 1.05, 1.15) * kick(f)} sleeve="#33506e" skin={DAD_SKIN}>
				<DadChat f={f} typed={sent > 0 ? '' : msg.slice(0, n)} sent={sent} hl={hl} />
			</Phone>
		</AbsoluteFill>
	);
};

// 20. Your phone buzzes in your pocket: «Сынок, ты не спишь?»
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60]);
	if (i === 0) {
		const buzz = t >= 26 && Math.floor((t - 26) / 7) % 2 === 0;
		const jx = buzz ? Math.sin(t * 3.1) * 8 : 0;
		return (
			<Stage cam={{s: lerp(t, 0, 60, 1.0, 1.1) * kick(t), cx: 540, cy: 960}} light={{glow: 0.1, vignette: 0.75}} bg="#1a2030">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#3a4a6a" />
				{[-200, 100, 400, 700, 1000, 1300].map((x) => (
					<line key={x} x1={x} y1={-400} x2={x + 60} y2={2400} stroke="#33425f" strokeWidth={6} opacity={0.6} />
				))}
				<path d="M 160,880 L 920,880 Q 960,880 960,920 L 960,1560 L 120,1560 L 120,920 Q 120,880 160,880 Z" fill="#2e3c58" />
				<rect x={160} y={870} width={760} height={18} rx={9} fill="#25314a" />
				<g transform={`translate(${540 + jx},1260)`}>
					<rect x={-150} y={-260} width={300} height={520} rx={44} fill="#26324c" />
					<rect x={-124} y={-232} width={248} height={464} rx={30} fill="#dfeaff" opacity={buzz ? 0.55 : 0.2} />
				</g>
				{buzz && (
					<g stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85}>
						<path d="M 330,1100 q -30,60 0,120" />
						<path d="M 750,1100 q 30,60 0,120" />
					</g>
				)}
			</Stage>
		);
	}
	const note = pop(t, 4, 12);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540 + (t < 14 ? Math.sin(t * 2.9) * 8 : 0)} y={1000} w={680} scale={lerp(t, 0, 66, 1.0, 1.1) * kick(t)} sleeve="#3a4a6a">
				<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #2a3c6e 0%, #121a33 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
					<div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
						<div style={{fontSize: 32, fontWeight: 700, opacity: 0.85}}>четверг</div>
						<div style={{fontSize: 170, fontWeight: 800, lineHeight: 1.05}}>03:18</div>
					</div>
					<div style={{position: 'absolute', left: 22, right: 22, top: 430, transform: `scale(${note})`, transformOrigin: '50% 0%', background: 'rgba(245,245,250,0.95)', borderRadius: 30, padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'center', boxSizing: 'border-box'}}>
						<div style={{width: 80, height: 80, borderRadius: 40, background: '#33506e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, flex: 'none'}}>П</div>
						<div style={{flex: 1}}>
							<div style={{display: 'flex', justifyContent: 'space-between'}}>
								<span style={{fontWeight: 900, fontSize: 34, color: '#111'}}>Папа (вахта)</span>
								<span style={{fontSize: 24, color: '#666', fontWeight: 600}}>сейчас</span>
							</div>
							<div style={{fontWeight: 800, fontSize: 34, color: RED, marginTop: 4}}>Сынок, ты не спишь?</div>
						</div>
					</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// 21. Suddenly it's quiet in the garage. Steps… straight to the door.
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const come = interpolate(f, [62, 111], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const s = 0.9 + 2.2 * come;
	return (
		<Slit f={f} id="p6s21">
			<Legs x={560 + 40 * come} y={1110 + 420 * come} s={s} ph={f >= 62 ? f * 0.3 : undefined} />
		</Slit>
	);
};

// 22. The door slowly rises… and you can't even get up.
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const lift = lerp(f, 4, 70, 0, 1, Easing.inOut(Easing.sin));
	const flood = interpolate(f, [30, 70], [0, 0.18], clamp);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 114, 1.1, 1.3), cx: 540, cy: lerp(f, 0, 114, 1180, 980)}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<GarageFront
					f={f}
					id="p6s22"
					lift={lift}
					inside={
						<g>
							<Shadow id="p6s22sh" x={540} y={1480} scale={0.84} />
						</g>
					}
				/>
				<Glint x={540} y={1480} scale={0.84} o={interpolate(f, [84, 92], [0, 1], clamp)} />
			</Stage>
			<AbsoluteFill style={{background: '#fff3c4', opacity: flood}} />
		</AbsoluteFill>
	);
};

// 23. Finale: run home for mom, or call the police right here? Countdown, end card.
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 63, 11);
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
			<Stage cam={{s: lerp(f, 0, 300, 1.15, 1.3), cx: 540, cy: 1150}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<GarageFront f={f} id="p6fin" lift={1} inside={<Shadow id="p6finsh" x={540} y={1480} scale={0.84} />} />
				<Glint x={540} y={1480} scale={0.84} o={1} />
				<rect x={-600} y={-600} width={2400} height={3200} fill="#000" opacity={0.45} />
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)'}}>
				ОН ИЛИ <span style={{color: RED}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 4, marginTop: 18}}>
					{Array.from({length: 21}).map((_, k) => (
						<div key={k} style={{width: 36, height: 44, borderRadius: 8, background: '#e0342b', border: '3px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 18 + k * 2, 9)})`, boxSizing: 'border-box'}}>
							<Cross size={18} width={5} />
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'БЕЖАТЬ ДОМОЙ', '#3b82f6', 'и будить маму', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ЗВОНИТЬ В ПОЛИЦИЮ', '#e0342b', 'прямо здесь', 2)}
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
					<div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 7</div>
						<div style={{fontSize: 64, color: YELLOW, marginTop: 4, letterSpacing: 6}}>ФИНАЛ</div>
						<div style={{fontSize: 52, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 44, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ЧАСТИ 1–6 — В ПРОФИЛЕ</div>
						<div style={{fontSize: 32, color: '#b9a9aa', marginTop: 28, letterSpacing: 2}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
						<div style={{display: 'inline-block', marginTop: 40, background: '#ff2d3d', borderRadius: 60, padding: '22px 70px', fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(255,45,61,0.6)', transform: `scale(${1 + Math.sin(f / 5) * 0.04})`}}>
							ПОДПИШИСЬ
						</div>
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

