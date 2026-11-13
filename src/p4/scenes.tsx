// Part 4 «Спальня»: 16 shots on the timeline of src/p4/timeline.ts (≈ the final edit).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Cross, HEAVY, MONO} from '../components/Overlays';
import {Bust, Head, Person} from '../components/Person';
import {PlankFloor, Wallpaper, WindowBox} from '../components/Set';
import {Cam, Stage} from '../components/Stage';
import * as P1 from '../scenes';
import {Phone, SANS} from '../scenes/S12_S16';
import * as P3 from '../p3/scenes';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const NIGHT = '#0b1638';

const rnd = (i: number) => {
	const v = Math.sin(i * 12.9898 + 7.3) * 43758.5453;
	return v - Math.floor(v);
};

// ======================================================= scene pieces =====
// phone flashlight: darkness everywhere except a soft circle of light at (x, y)
const Flashlight: React.FC<{id: string; x: number; y: number; r?: number; dark?: number}> = ({id, x, y, r = 560, dark = 0.82}) => (
	<g pointerEvents="none">
		<defs>
			<radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
				<stop offset="0%" stopColor="#05070f" stopOpacity={0} />
				<stop offset="55%" stopColor="#05070f" stopOpacity={dark * 0.55} />
				<stop offset="100%" stopColor="#05070f" stopOpacity={dark} />
			</radialGradient>
		</defs>
		<rect x={-600} y={-600} width={2400} height={3200} fill={`url(#${id})`} />
		<circle cx={x} cy={y} r={r * 0.5} fill="#cfe0ff" opacity={0.06} />
	</g>
);

// the man in the dark: a black silhouette, eyes glinting when `eyes` > 0
const Shadow: React.FC<{id: string; x: number; y: number; scale: number; eyes?: number; opacity?: number}> = ({id, x, y, scale, eyes = 0, opacity = 1}) => {
	const headY = y - 1024 * scale;
	return (
		<g opacity={opacity}>
			<Person kind="dad" id={id} x={x} y={y} scale={scale} silhouette="#06080d" />
			{eyes > 0 && (
				<g opacity={eyes}>
					<ellipse cx={x - 34 * scale} cy={headY - 2 * scale} rx={9 * scale} ry={6 * scale} fill="#fff" />
					<ellipse cx={x + 34 * scale} cy={headY - 2 * scale} rx={9 * scale} ry={6 * scale} fill="#fff" />
				</g>
			)}
		</g>
	);
};

// glinting eyes, drawn on top of the darkness (same placement as <Shadow/>); both = false when the wardrobe hides one
const Glint: React.FC<{x: number; y: number; scale: number; o: number; both?: boolean}> = ({x, y, scale, o, both = true}) => {
	if (o <= 0) return null;
	const headY = y - 1024 * scale;
	const eye = (ex: number) => (
		<g key={ex}>
			<circle cx={ex} cy={headY - 2 * scale} r={24 * scale} fill="#fff" opacity={0.14} />
			<ellipse cx={ex} cy={headY - 2 * scale} rx={9 * scale} ry={6 * scale} fill="#fff" />
		</g>
	);
	return <g opacity={o}>{[eye(x - 34 * scale), both ? eye(x + 34 * scale) : null]}</g>;
};

// the parents' bedroom at night, seen from the foot of the bed.
// pulled 0..1 = the blanket on dad's side pulled off (pillows underneath); shadow = the man by the wardrobe
const ParentsRoom: React.FC<{f: number; id: string; pulled?: number; shadow?: number; eyes?: number}> = ({f, id, pulled = 0, shadow = 0, eyes = 0}) => {
	const pl = Math.max(0, Math.min(1, pulled));
	const edge = 1150 + 330 * pl; // top edge of the blanket on dad's half
	return (
		<g>
			<rect x={-600} y={-600} width={2400} height={3200} fill="#262a42" />
			<Wallpaper id={`${id}wp`} x={-600} y={-600} w={2400} h={2060} base="#363a5a" line="#30344f" />
			<WindowBox x={60} y={420} w={300} h={380} sky="url(#skyNight)" curtain={false} />
			<circle cx={290} cy={500} r={30} fill="#f3eecb" />
			<path d="M 20,380 L 110,380 Q 90,600 110,830 L 20,830 Z" fill="#4a3f5e" />
			<path d="M 400,380 L 310,380 Q 330,600 310,830 L 400,830 Z" fill="#4a3f5e" />
			<PlankFloor y={1460} color="#3a2c2a" seam="#2a1f1e" />
			{/* the corner behind the wardrobe and whoever stands there */}
			<rect x={720} y={420} width={120} height={1040} fill="#1d2035" />
			{shadow > 0 && <Shadow id={`${id}sh`} x={790} y={1470} scale={0.95} eyes={eyes} opacity={shadow} />}
			{/* wardrobe */}
			<rect x={800} y={460} width={300} height={1010} fill="#5a3e2c" />
			<rect x={800} y={460} width={300} height={22} fill="#4a3224" />
			<rect x={950} y={500} width={6} height={930} fill="#4a3224" />
			<circle cx={930} cy={960} r={9} fill="#c9a86a" />
			<circle cx={976} cy={960} r={9} fill="#c9a86a" />
			<rect x={792} y={460} width={10} height={1010} fill="#3e2a1e" />
			{/* bed */}
			<rect x={150} y={860} width={620} height={260} rx={30} fill="#5a3e2c" />
			<rect x={180} y={890} width={560} height={200} rx={20} fill="#6a4a34" />
			<path d="M 170,1110 L 750,1110 L 880,1640 L 40,1640 Z" fill="#d9d4e6" />
			{/* pillows */}
			<ellipse cx={320} cy={1110} rx={130} ry={46} fill="#eeeaf6" />
			<ellipse cx={600} cy={1110} rx={130} ry={46} fill="#eeeaf6" />
			{/* mom asleep on the left */}
			<g transform="translate(320,1100) scale(0.72)">
				<Head kind="mom" face={{eyes: 'closed', mouth: 'flat', brows: 'neutral', blush: false}} uid={`${id}mom`} />
			</g>
			{/* the pillows made up like a man (seen once the blanket is pulled) */}
			<g opacity={pl > 0.05 ? 1 : 0}>
				<ellipse cx={600} cy={1170} rx={92} ry={70} fill="#f4f1fa" />
				<rect x={490} y={1230} width={230} height={170} rx={60} fill="#e8e4f2" />
				<rect x={500} y={1400} width={220} height={150} rx={60} fill="#e1dcee" />
				<path d="M 520,1250 Q 600,1280 690,1250" stroke="#cfc9df" strokeWidth={6} fill="none" />
				<path d="M 530,1430 Q 610,1460 690,1430" stroke="#cfc9df" strokeWidth={6} fill="none" />
			</g>
			{/* blanket: mom's half and dad's half (with a body-shaped mound until it is pulled) */}
			<path d="M 200,1150 Q 250,1120 330,1140 Q 420,1130 460,1150 L 470,1640 L 40,1640 Z" fill="#5d6fa8" />
			<path d="M 230,1170 Q 330,1200 440,1180" stroke="#4c5d94" strokeWidth={8} fill="none" />
			<path
				d={`M 460,${edge} Q ${520},${edge - 70 * (1 - pl)} ${600},${edge - 80 * (1 - pl)} Q ${680},${edge - 70 * (1 - pl)} ${740},${edge} L 880,1640 L 460,1640 Z`}
				fill="#4f61a0"
			/>
			{pl < 0.05 && <path d="M 470,1300 Q 600,1250 730,1320" stroke="#42528a" strokeWidth={10} fill="none" />}
			<rect x={30} y={1630} width={860} height={60} rx={10} fill="#5a3e2c" />
			{/* nightstands */}
			<rect x={20} y={1000} width={120} height={180} fill="#4a3224" />
			<rect x={780} y={1000} width={90} height={180} fill="#4a3224" />
		</g>
	);
};

// dark corridor in perspective, the parents' door at the end (ajar = black gap)
const Corridor: React.FC<{id: string; gap?: number}> = ({id, gap = 0.25}) => (
	<g>
		<rect x={-600} y={-600} width={2400} height={3200} fill="#1a1f33" />
		<path d="M -600,-600 L 380,640 L 380,1180 L -600,2600 Z" fill="#2c3454" />
		<path d="M 1680,-600 L 700,640 L 700,1180 L 1680,2600 Z" fill="#283050" />
		<path d="M -600,-600 L 1680,-600 L 700,640 L 380,640 Z" fill="#20263e" />
		<path d="M -600,2600 L 380,1180 L 700,1180 L 1680,2600 Z" fill="#3a2c2a" />
		{[0.15, 0.32, 0.5, 0.7].map((k) => (
			<line key={k} x1={380 - 980 * k} y1={1180 + 1420 * k} x2={700 + 980 * k} y2={1180 + 1420 * k} stroke="#2a1f1e" strokeWidth={6} />
		))}
		<Wallpaper id={`${id}end`} x={380} y={640} w={320} h={540} base="#363a5a" line="#30344f" />
		{/* side doors */}
		<path d="M 90,560 L 250,770 L 250,1260 L 90,1560 Z" fill="#4a3426" />
		<path d="M 990,560 L 830,770 L 830,1260 L 990,1560 Z" fill="#4a3426" />
		{/* the bedroom door at the end, ajar */}
		<rect x={450} y={780} width={180} height={400} fill="#5a3e2c" />
		<rect x={450} y={780} width={180 * gap} height={400} fill="#020306" />
		<rect x={440} y={770} width={200} height={12} fill="#3e2a1e" />
		<rect x={438} y={770} width={12} height={410} fill="#3e2a1e" />
		<rect x={630} y={770} width={12} height={410} fill="#3e2a1e" />
	</g>
);

// recap frames from part 3: VHS look, «◀◀ ЧАСТЬ 3»
const Recap: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
	const flash = interpolate(f, [0, 4], [0.55, 0], clamp);
	const jitter = f < 3 ? (f % 2 ? 8 : -8) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translateX(${jitter}px)`}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 7px)'}} />
			<AbsoluteFill style={{background: 'rgba(40,20,10,0.18)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
			<div style={{position: 'absolute', left: 40, top: 250, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 2}}>◀◀ ЧАСТЬ 3</div>
		</AbsoluteFill>
	);
};

// video player on your phone: the recording of the bedroom, a progress bar
const Player: React.FC<{f: number; at: number; total?: number; rewinding?: boolean; zoom?: number; shadow?: number; eyes?: number; ring?: number}> = ({
	f,
	at,
	total = 37,
	rewinding = false,
	zoom = 1,
	shadow = 1,
	eyes = 0,
	ring = 0,
}) => {
	const sec = Math.max(0, Math.min(total, at));
	const fmt = (x: number) => `0:${String(Math.floor(x)).padStart(2, '0')}`;
	const k = (zoom - 1) / 1.4;
	const c: Cam = {s: zoom, cx: 540 + (790 - 540) * k, cy: 1000 + (560 - 1000) * k};
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
			<svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(${540 + (rewinding ? (rnd(f) - 0.5) * 30 : 0)},960) scale(${c.s}) translate(${-c.cx},${-c.cy})`}>
					<ParentsRoom f={0} id="p4pl" shadow={shadow} />
					<Flashlight id="p4plfl" x={560} y={1150} r={760} dark={0.7} />
					<Glint x={790} y={1470} scale={0.95} o={eyes} both={false} />
					{ring > 0.01 && <circle cx={790} cy={497} r={110 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={10 / c.s} opacity={Math.min(1, ring)} />}
				</g>
			</svg>
			{rewinding && <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 3px, transparent 3px, transparent 26px)', transform: `translateY(${(f * 37) % 26}px)`}} />}
			<div style={{position: 'absolute', left: 30, top: 120, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff', textShadow: '0 2px 4px #000'}}>● REC 00:{String(Math.floor(sec)).padStart(2, '0')}</div>
			{rewinding && (
				<div style={{position: 'absolute', top: '40%', width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 120, color: '#fff', opacity: 0.85, textShadow: '0 6px 0 rgba(0,0,0,0.5)'}}>◀◀</div>
			)}
			<div style={{position: 'absolute', left: 30, right: 30, bottom: 70, fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#fff'}}>
				<div style={{position: 'relative', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.3)'}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(sec / total) * 100}%`, borderRadius: 5, background: RED}} />
					<div style={{position: 'absolute', left: `${(sec / total) * 100}%`, top: -9, width: 28, height: 28, marginLeft: -14, borderRadius: 14, background: '#fff'}} />
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12}}>
					<span>{fmt(sec)}</span>
					<span>{fmt(total)}</span>
				</div>
			</div>
		</div>
	);
};

// your face in the dark, lit by the phone
const FaceDark: React.FC<{t: number; id: string; face: React.ComponentProps<typeof Bust>['face']; zoom?: [number, number]; red?: number; behind?: React.ReactNode}> = ({t, id, face, zoom = [1, 1.1], red = 0, behind}) => (
	<Stage cam={{s: lerp(t, 0, 60, zoom[0], zoom[1]) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
		<rect x={-500} y={-500} width={2200} height={3000} fill="#1c2747" />
		{behind}
		<Bust kind="son" id={id} x={480} y={1040} scale={5.6} face={{blush: false, ...face}} />
		<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.35} />
		<circle cx={560} cy={1900} r={1200} fill="#cfe0ff" opacity={0.08} />
		{red > 0 && <rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={red} />}
	</Stage>
);

// ============================================================== SHOTS =======
// 1. the same opening as parts 1–3
export const S01: React.FC = () => <P1.S01 />;

// 2. Recap: the video call — and the phone rang behind your door.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	return (
		<Recap f={t}>
			{i === 0 ? (
				<Freeze frame={50}>
					<P3.S04 />
				</Freeze>
			) : (
				<P3.S05 />
			)}
		</Recap>
	);
};

// 3. Recap: mom — «Папа спит. Я только что от него».
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f}>
			<P3.S17 />
		</Recap>
	);
};

// 4. Title: part 4 «Спальня».
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 12, 10);
	const c = pop(f, 26, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a1a40 0%, #120a1e 58%, #05030a 100%)'}}>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 4</div>
				<div style={{fontSize: 76, color: '#b98aff', marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>СПАЛЬНЯ</div>
				<div style={{display: 'inline-block', marginTop: 56, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 36px', fontSize: 40, transform: `scale(${c})`}}>ЧАСТИ 1–3 — В ПРОФИЛЕ</div>
			</div>
		</AbsoluteFill>
	);
};

// 5. 3:00 → you switch the camera on and step into the corridor.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [36]);
	if (i === 0) {
		const colon = Math.floor(f / 15) % 2 === 0;
		return (
			<Stage cam={{s: lerp(t, 0, 36, 1.0, 1.08) * kick(t), cx: 540, cy: 940}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<rect x={-400} y={-400} width={1880} height={2800} fill="#1a2140" />
				<rect x={-400} y={1130} width={1880} height={1300} fill="#3d2a20" />
				<rect x={150} y={680} width={780} height={430} rx={60} fill="#121317" />
				<rect x={182} y={712} width={716} height={366} rx={40} fill="#08080a" />
				<text x={540} y={975} fontSize={220} fontFamily={MONO} fontWeight={700} fill={RED} textAnchor="middle" style={{filter: 'drop-shadow(0 0 18px rgba(255,59,48,0.8))'}}>
					{colon ? '03:00' : '03 00'}
				</text>
			</Stage>
		);
	}
	const walk = Math.max(0, t - 30);
	const bob = Math.sin(walk / 5) * 10 * (t > 30 ? 1 : 0);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(t, 0, 93, 1.0, 1.45, Easing.in(Easing.quad)), cx: 540, cy: 920, dy: bob, rot: Math.sin(walk / 10) * 1.2}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Corridor id="p4s5" gap={0.2} />
				<Flashlight id="p4s5fl" x={540} y={960} r={700} dark={0.75} />
			</Stage>
			<P3.CameraUI f={t} />
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(t, [0, 3, 6], [0, 0.4, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 6. The bedroom door is ajar. Dark inside.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const gap = lerp(f, 46, 80, 0.2, 0.45);
	const bob = Math.sin(f / 5) * 6;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 81, 2.0, 2.6), cx: 540, cy: 980, dy: bob}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Corridor id="p4s6" gap={gap} />
				<Flashlight id="p4s6fl" x={540} y={980} r={360} dark={0.7} />
			</Stage>
			<P3.CameraUI f={f} startSec={3} />
		</AbsoluteFill>
	);
};

// 7. Mom asleep by the wall. On dad's half — someone under the blanket.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const pan = lerp(f, 40, 90, 0, 1, Easing.inOut(Easing.cubic));
	const c: Cam = {s: lerp(f, 0, 129, 1.5, 1.65), cx: 330 + 270 * pan, cy: 1180};
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<ParentsRoom f={f} id="p4s7" />
				<Flashlight id="p4s7fl" x={330 + 270 * pan} y={1170} r={420} />
			</Stage>
			<P3.CameraUI f={f} startSec={6} />
		</AbsoluteFill>
	);
};

// 8. Closer. He does not move. He does not breathe.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const beat = f % 24 < 3 ? 1.006 : 1;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 99, 1.9, 2.4) * beat, cx: 600, cy: 1230}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<ParentsRoom f={f} id="p4s8" />
				<Flashlight id="p4s8fl" x={600} y={1220} r={330} />
			</Stage>
			<P3.CameraUI f={f} startSec={10} />
		</AbsoluteFill>
	);
};

// 9. You pull the blanket… pillows, made up like a sleeping man.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const pulled = lerp(f, 12, 42, 0, 1, Easing.inOut(Easing.cubic));
	const reveal = f >= 44 ? kick(f - 44, 0.06) : 1;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 135, 1.6, 1.75) * reveal, cx: 600, cy: 1290}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<ParentsRoom f={f} id="p4s9" pulled={pulled} />
				<Flashlight id="p4s9fl" x={600} y={1280} r={420} />
			</Stage>
			<P3.CameraUI f={f} startSec={13} />
		</AbsoluteFill>
	);
};

// 10. Then where is he?
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const look = Math.floor(f / 9) % 2 === 0 ? -0.9 : 0.9;
	return <FaceDark t={f} id="p4s10" zoom={[1.05, 1.15]} face={{eyes: 'wide', pupil: 0.6, look: [look, 0.1], brows: 'worried', mouth: 'o', sweat: 0.6}} />;
};

// 11. You rewind the recording…
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const at = interpolate(f, [4, 46], [36, 12], {...clamp, easing: Easing.inOut(Easing.quad)});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540} y={1000} w={680} scale={lerp(f, 0, 51, 1.0, 1.08) * kick(f)}>
				<Player f={f} at={at} rewinding={f < 46} shadow={0} />
			</Phone>
		</AbsoluteFill>
	);
};

// 12. 0:12 — in the corner behind the wardrobe stands HE. Looking right into the camera.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const zoom = lerp(f, 50, 92, 1, 2.4, Easing.inOut(Easing.cubic));
	const eyes = interpolate(f, [110, 116], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540} y={1000} w={680} scale={lerp(f, 0, 156, 1.08, 1.2) * kick(f)}>
				<Player f={f} at={12} zoom={zoom} shadow={1} eyes={eyes} ring={pop(f, 112, 10)} />
			</Phone>
			{f >= 84 && f < 98 && <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [84, 98], [0.25, 0], clamp)}} />}
		</AbsoluteFill>
	);
};

// 13. You look up — the corner is empty.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [20]);
	if (i === 0) return <FaceDark t={t} id="p4s13" zoom={[1.0, 1.08]} face={{eyes: 'wide', pupil: 0.7, look: [0.5, -0.9], brows: 'raised', mouth: 'flat'}} />;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(t, 0, 46, 2.0, 2.2), cx: 780, cy: 900}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<ParentsRoom f={f} id="p4s13" pulled={1} />
				<Flashlight id="p4s13fl" x={780} y={900} r={380} dark={0.7} />
			</Stage>
			<P3.CameraUI f={t} startSec={21} />
		</AbsoluteFill>
	);
};

// 14. Rule five: never turn your back on him. (behind you, in the doorway, a shape)
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const appear = interpolate(f, [50, 80], [0, 1], clamp);
	return (
		<Stage cam={{s: lerp(f, 0, 111, 1.0, 1.08), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#262a42" />
			<Wallpaper id="p4s14wp" x={-400} y={-400} w={1880} h={1880} base="#363a5a" line="#30344f" />
			<rect x={330} y={420} width={420} height={1060} fill="#10131f" />
			<Shadow id="p4s14sh" x={540} y={1500} scale={0.95} opacity={appear} />
			<rect x={310} y={400} width={460} height={22} fill="#3e2a1e" />
			<rect x={310} y={400} width={22} height={1080} fill="#3e2a1e" />
			<rect x={748} y={400} width={22} height={1080} fill="#3e2a1e" />
			<PlankFloor y={1480} color="#3a2c2a" seam="#2a1f1e" />
			<Person kind="son" id="p4s14son" x={540} y={1780} scale={1.15} breathe={f} face={{eyes: 'wide', pupil: 0.6, look: [0, 0.2], brows: 'worried', mouth: 'flat', blush: false}} />
			<Flashlight id="p4s14fl" x={540} y={1250} r={700} dark={0.75} />
			<Glint x={540} y={1500} scale={0.95} o={interpolate(f, [86, 92], [0, 1], clamp)} />
		</Stage>
	);
};

// 15. A whisper right behind you: «Ты чего не спишь, парень?»
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const lean = interpolate(f, [26, 76], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const sh = (
		<g>
			<Shadow id="p4s15sh" x={900 - 120 * lean} y={640 + 1024 * (2.3 + 0.4 * lean) - 40 * lean} scale={2.3 + 0.4 * lean} eyes={interpolate(f, [44, 50], [0, 1], clamp)} opacity={interpolate(f, [22, 40], [0, 1], clamp)} />
		</g>
	);
	return (
		<FaceDark
			t={f}
			id="p4s15"
			zoom={[1.0, 1.08]}
			red={interpolate(f, [40, 76], [0, 0.7], clamp)}
			behind={sh}
			face={{eyes: 'wide', pupil: interpolate(f, [30, 46], [1, 0.35], {...clamp, easing: Easing.out(Easing.cubic)}), look: [0.6, 0], brows: 'worried', mouth: f < 50 ? 'flat' : 'o', sweat: 1}}
		/>
	);
};

// 16. Finale: wake mom up, or pretend you're sleepwalking? Countdown, end card.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 80, 11);
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
			<Stage cam={{s: lerp(f, 0, 300, 1.25, 1.4), cx: 560, cy: 1100}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<ParentsRoom f={f} id="p4fin" pulled={1} shadow={1} />
				<rect x={-600} y={-600} width={2400} height={3200} fill="#000" opacity={0.5} />
				<Glint x={790} y={1470} scale={0.95} o={1} both={false} />
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)'}}>
				ОН ИЛИ <span style={{color: RED}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18}}>
					{Array.from({length: 15}).map((_, k) => (
						<div key={k} style={{width: 44, height: 50, borderRadius: 9, background: '#e0342b', border: '3px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 18 + k * 2, 9)})`, boxSizing: 'border-box'}}>
							<Cross size={24} width={5} />
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'РАЗБУДИТЬ МАМУ', '#3b82f6', 'и показать подушки', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ПРИТВОРИТЬСЯ ЛУНАТИКОМ', '#e0342b', 'и вернуться в кровать', 2)}
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
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 5</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ЧАСТИ 1–4 — В ПРОФИЛЕ</div>
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

