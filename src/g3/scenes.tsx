// «Голосовые из завтра» — часть 3 «Глазок» (the viewers chose not to go out). 24 shots on the
// timeline of src/g3/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part g3).
// Phone UI from part 1, the hall / mom / recap frame / finale from part 2, Max from part 2b.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Wallpaper} from '../components/Set';
import {Cam, Stage} from '../components/Stage';
import {SANS} from '../scenes/S12_S16';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import * as G2B from '../g2b/scenes';
import envJson from './env.json';

const {YELLOW, RED, NIGHT, PHONE_BG, Phone, ChatScreen, VoiceBubble, StatusBar, LockScreen, Bedroom, Gym, Vision, rnd, focus} = G1;
const {Hall, Recap, Stamp, MOM, Teacher, Finale} = G2;

const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

// the bulb on the landing: mostly on, now and then it blinks
const flick = (t: number, seed = 0) => {
	const r = rnd(Math.floor(t / 2) * 7 + seed * 131);
	return r < 0.1 ? 0.12 : r < 0.18 ? 0.55 : 1;
};

const DOUBLE_FACE: Face = {eyes: 'stare', pupil: 0.6, brows: 'flat', mouth: 'flat', blush: false};
const PEEP = {x: 540, y: 820, r: 470};
// camera for scenes seen through the door viewer (the round window is centred at PEEP)
const pcam = (s: number, cx: number, cy: number): Cam => ({s, cx, cy, dy: PEEP.y - 960});
const BAG_D = 'M -70,170 Q -95,60 -30,10 L -14,-12 Q 0,-26 14,-12 L 30,10 Q 95,60 70,170 Z';

// ======================================================= scene pieces =====
// the trash bag hanging from a hand at (x, y)
const Bag: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d={BAG_D} fill="#1d1f24" />
		<path d="M -40,120 Q -30,60 -6,40" stroke="#3a3d45" strokeWidth={7} fill="none" />
	</g>
);

// the landing outside your flat: the lift, the neighbours' door, the trash chute, one bare bulb
const Landing: React.FC<{light: number; hatch?: number}> = ({light, hatch = 0}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={1500} fill="#d9d6c6" />
		<rect x={-400} y={1100} width={1880} height={380} fill="#5f8f74" />
		<rect x={-400} y={1092} width={1880} height={12} fill="#4a7560" />
		<rect x={-400} y={1480} width={1880} height={1100} fill="#8a6a58" />
		{[1560, 1680, 1840, 2050].map((y) => (
			<line key={y} x1={-400} y1={y} x2={1480} y2={y} stroke="#7a5c4c" strokeWidth={5} />
		))}
		{Array.from({length: 13}).map((_, k) => (
			<line key={k} x1={-420 + k * 160} y1={1480} x2={-900 + k * 260} y2={2580} stroke="#7a5c4c" strokeWidth={5} />
		))}
		{/* lift */}
		<rect x={20} y={640} width={310} height={840} fill="#5d636b" />
		<rect x={40} y={660} width={270} height={820} fill="#a7adb5" />
		<line x1={175} y1={660} x2={175} y2={1480} stroke="#7d838b" strokeWidth={6} />
		<rect x={350} y={1010} width={34} height={56} rx={6} fill="#3a3f47" />
		<circle cx={367} cy={1038} r={10} fill="#ffb02e" />
		{/* the neighbours' door, quilted leatherette, flat 48 */}
		<rect x={420} y={700} width={240} height={780} fill="#4a2e22" />
		<rect x={436} y={716} width={208} height={764} fill="#7a4a36" />
		{Array.from({length: 4}).flatMap((_, cx) =>
			Array.from({length: 9}).map((__, cy) => <circle key={`${cx}-${cy}`} cx={470 + cx * 46} cy={800 + cy * 76} r={5} fill="#5a3426" />),
		)}
		<rect x={512} y={736} width={56} height={34} rx={4} fill="#c9b37a" />
		<text x={540} y={762} fontSize={26} fontFamily={HEAVY} fontWeight={900} fill="#3a2a1a" textAnchor="middle">
			48
		</text>
		<circle cx={620} cy={1100} r={12} fill="#c9b37a" />
		{/* trash chute with its hatch */}
		<rect x={860} y={-400} width={130} height={1880} fill="#7d848c" />
		{[200, 600, 1000, 1400].map((y) => (
			<rect key={y} x={852} y={y} width={146} height={16} fill="#666c74" />
		))}
		<g transform="translate(925,1150)">
			<rect x={-95} y={-30} width={190} height={130} rx={8} fill="#5e646c" />
			<rect x={-80} y={-10} width={160} height={90} fill="#22252a" />
			<g transform={`translate(0,-10) scale(1,${1 - 0.85 * hatch})`}>
				<rect x={-80} y={0} width={160} height={90} rx={4} fill="#8a9098" />
				<rect x={-24} y={58} width={48} height={14} rx={7} fill="#4a4f57" />
			</g>
		</g>
		{/* the bulb */}
		<line x1={600} y1={-400} x2={600} y2={300} stroke="#2a2a2a" strokeWidth={5} />
		<rect x={588} y={296} width={24} height={22} fill="#4a4a4a" />
		<circle cx={600} cy={340} r={30} fill={light > 0.5 ? '#fff6c8' : '#6a6a5a'} />
		{light > 0.5 && <circle cx={600} cy={340} r={170} fill="#fff3c0" opacity={0.22 * light} />}
	</g>
);

// darkness of the landing (drawn over the people too)
const Dark: React.FC<{light: number; base?: number}> = ({light, base = 0.1}) => (
	<rect x={-800} y={-800} width={2800} height={3800} fill="#04060c" opacity={Math.min(0.94, base + 0.85 * (1 - light))} />
);

// looking through the door viewer: a round fisheye window, the door around it
const Peephole: React.FC<{children: React.ReactNode; dark?: number}> = ({children, dark = 0}) => (
	<AbsoluteFill style={{background: '#0d0907'}}>
		<AbsoluteFill style={{clipPath: `circle(${PEEP.r}px at ${PEEP.x}px ${PEEP.y}px)`}}>
			<AbsoluteFill style={{transform: 'scale(1.06)', transformOrigin: `${PEEP.x}px ${PEEP.y}px`}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(circle at ${PEEP.x}px ${PEEP.y}px, rgba(0,0,0,0) ${PEEP.r * 0.5}px, rgba(0,0,0,0.55) ${PEEP.r * 0.86}px, rgba(0,0,0,0.92) ${PEEP.r}px)`}} />
			<AbsoluteFill style={{background: `radial-gradient(circle at ${PEEP.x - 170}px ${PEEP.y - 210}px, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0) 170px)`}} />
			{dark > 0 && <AbsoluteFill style={{background: '#000', opacity: dark}} />}
		</AbsoluteFill>
		<div
			style={{
				position: 'absolute',
				left: PEEP.x - PEEP.r - 18,
				top: PEEP.y - PEEP.r - 18,
				width: 2 * PEEP.r + 36,
				height: 2 * PEEP.r + 36,
				borderRadius: '50%',
				border: '18px solid #3a2a1e',
				boxShadow: '0 0 0 6px #1a120c, inset 0 0 30px rgba(0,0,0,0.9)',
				boxSizing: 'border-box',
			}}
		/>
	</AbsoluteFill>
);

// the hall's front door swung open by `open` (Hall itself draws it shut); the landing behind it.
// children are drawn inside the doorway (people stepping out / in), under the landing's darkness
export const FrontDoor: React.FC<{id: string; open: number; light?: number; children?: React.ReactNode}> = ({id, open, light = 1, children}) => {
	const o = Math.max(0, Math.min(1, open));
	if (o <= 0.001) return null;
	const xe = 380 + 356 * (1 - o) + 24;
	return (
		<g>
			<defs>
				<clipPath id={`${id}dw`}>
					<rect x={380} y={540} width={380} height={900} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}dw)`}>
				<rect x={380} y={540} width={380} height={640} fill="#d9d6c6" />
				<rect x={380} y={1180} width={380} height={220} fill="#5f8f74" />
				<rect x={380} y={1400} width={380} height={40} fill="#8a6a58" />
				<rect x={505} y={860} width={140} height={540} fill="#7a4a36" />
				<circle cx={575} cy={600} r={16} fill={light > 0.5 ? '#fff6c8' : '#6a6a5a'} />
				{children}
				<rect x={380} y={540} width={380} height={900} fill="#04060c" opacity={Math.min(0.92, 0.12 + 0.8 * (1 - light))} />
			</g>
			<path d={`M 380,540 L ${xe},${540 + 34 * o} L ${xe},${1440 - 34 * o} L 380,1440 Z`} fill="#6e4a3a" />
			<path d={`M 380,540 L ${xe},${540 + 34 * o}`} stroke="#5a3a2c" strokeWidth={8} />
		</g>
	);
};

// warm close-up in the flat (wallpaper behind)
const WarmClose: React.FC<{id: string; t: number; len: number; zoom?: [number, number]; dim?: number; children: React.ReactNode}> = ({id, t, len, zoom = [1, 1.08], dim = 0, children}) => (
	<Stage cam={{s: lerp(t, 0, len, zoom[0], zoom[1]) * kick(t), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.7}} bg="#cdb88f">
		<Wallpaper id={`${id}wp`} x={-600} y={-600} w={2300} h={3200} base="#d9c7a0" line="#c8b48a" />
		{children}
		{dim > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill={NIGHT} opacity={dim} />}
	</Stage>
);

// your door lock in close-up: the thumb-turn snaps shut
const LockClose: React.FC<{t: number}> = ({t}) => {
	const turn = lerp(t, 7, 12, 0, 90, Easing.out(Easing.cubic));
	const [sx, sy] = shake(t, 11, 12, 9);
	return (
		<Stage cam={{s: kick(t), cx: 540 + sx, cy: 960 + sy}} light={{glow: 0.2, vignette: 0.75}} bg="#5a3a2a">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#7c5644" />
			{Array.from({length: 9}).map((_, k) => (
				<path key={k} d={`M ${-100 + k * 150},-400 q 30,800 -10,1600 t 20,1300`} stroke="#6f4c3c" strokeWidth={6} fill="none" opacity={0.6} />
			))}
			<rect x={250} y={260} width={580} height={1360} rx={20} fill="none" stroke="#6a4a3a" strokeWidth={22} />
			<circle cx={540} cy={860} r={175} fill="#a8822e" />
			<circle cx={540} cy={860} r={150} fill="#e0bb62" />
			<g transform={`rotate(${turn} 540 860)`}>
				<rect x={503} y={716} width={74} height={288} rx={32} fill="#c79a3e" stroke="#8a6a2a" strokeWidth={7} />
			</g>
			<circle cx={540} cy={1210} r={60} fill="#a8822e" />
			<circle cx={540} cy={1200} r={16} fill="#2a1d14" />
			<path d="M 530,1206 L 550,1206 L 556,1244 L 524,1244 Z" fill="#2a1d14" />
		</Stage>
	);
};

// incoming call screen (phone screen content)
const Handset: React.FC<{size: number; rot?: number}> = ({size, rot = 0}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${rot}deg)`}}>
		<path
			d="M 6.6,10.8 C 8,13.6 10.4,16 13.2,17.4 L 15.4,15.2 C 15.7,14.9 16.1,14.8 16.4,14.9 C 17.5,15.3 18.7,15.5 20,15.5 C 20.6,15.5 21,15.9 21,16.5 L 21,20 C 21,20.6 20.6,21 20,21 C 10.6,21 3,13.4 3,4 C 3,3.4 3.4,3 4,3 L 7.5,3 C 8.1,3 8.5,3.4 8.5,4 C 8.5,5.3 8.7,6.5 9.1,7.6 C 9.2,7.9 9.1,8.3 8.9,8.6 Z"
			fill="#fff"
		/>
	</svg>
);
const CallScreen: React.FC<{f: number; ring?: number}> = ({f, ring = 0}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #23304f 0%, #0c1120 100%)', fontFamily: SANS, color: '#fff', overflow: 'hidden'}}>
		<StatusBar time="23:42" />
		<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
			<div style={{fontSize: 30, fontWeight: 700, color: '#aeb6c8'}}>входящий вызов…</div>
			<div style={{position: 'relative', display: 'inline-block', fontSize: 66, fontWeight: 900, marginTop: 10, color: ring > 0.5 ? YELLOW : '#fff'}}>
				Мой номер
				{ring > 0 && <div style={{position: 'absolute', inset: '-16px -30px', border: `7px solid ${RED}`, borderRadius: '50%', transform: `scale(${0.6 + 0.4 * ring}) rotate(-4deg)`, opacity: Math.min(1, ring)}} />}
			</div>
			<div style={{fontSize: 28, fontWeight: 700, color: '#aeb6c8', marginTop: 6}}>+7 9•• •••-47-12</div>
		</div>
		<div style={{position: 'absolute', left: '50%', top: 520, width: 230, height: 230, marginLeft: -115}}>
			{[0, 1, 2].map((k) => {
				const p = ((f + k * 12) % 36) / 36;
				return <div key={k} style={{position: 'absolute', inset: -90 * p, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.5)', opacity: 1 - p}} />;
			})}
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#8a5a32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 900}}>Я</div>
		</div>
		<div style={{position: 'absolute', bottom: 130, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>
			<div style={{textAlign: 'center'}}>
				<div style={{width: 140, height: 140, borderRadius: 70, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Handset size={70} rot={135} />
				</div>
				<div style={{fontSize: 26, fontWeight: 700, marginTop: 12, color: '#cfd5e0'}}>Отклонить</div>
			</div>
			<div style={{textAlign: 'center'}}>
				<div style={{width: 140, height: 140, borderRadius: 70, background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${Math.sin(f / 3) * 6}px)`}}>
					<Handset size={70} />
				</div>
				<div style={{fontSize: 26, fontWeight: 700, marginTop: 12, color: '#cfd5e0'}}>Ответить</div>
			</div>
		</div>
	</div>
);

// «slide to power off» bar on top of the phone screen
const PowerSlider: React.FC<{p: number; f: number}> = ({p, f}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: 36, right: 36, top: 90, height: 110, borderRadius: 55, background: 'rgba(240,240,245,0.94)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 26, transform: `scale(${p})`, zIndex: 5, boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
			<div style={{width: 86, height: 86, borderRadius: 43, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${Math.max(0, Math.sin(f / 5)) * 18}px)`}}>
				<svg width={50} height={50} viewBox="0 0 24 24">
					<path d="M 12,3 L 12,12" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
					<path d="M 7,6.5 A 7.5,7.5 0 1 0 17,6.5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
				</svg>
			</div>
			<div style={{fontFamily: SANS, fontSize: 38, fontWeight: 800, color: '#5a5f6a'}}>выключить</div>
		</div>
	) : null;

// the dark phone in your hand at night (lock screen, no notification)
const NightLock: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, opacity: 0.55}}>
		<LockScreen notif={0} time="23:42" date="суббота, 14 ноября" />
	</div>
);

// ============================================================== SHOTS =======
// 1. Recap: the voice messages from tomorrow saved you twice — from the lift and from the lamp.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44, 102]);
	if (i === 0) {
		return (
			<Recap f={t} label="◀◀ ЧАСТЬ 1">
				<Freeze frame={40}>
					<G2.S01 />
				</Freeze>
			</Recap>
		);
	}
	if (i === 1) {
		return (
			<Recap f={t} label="◀◀ ЧАСТЬ 1">
				<Freeze frame={95}>
					<G1.S08 />
				</Freeze>
				<Stamp p={pop(t, 40, 10)} mark="check" label="ЛИФТ" />
			</Recap>
		);
	}
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 2">
			<Freeze frame={50}>
				<G2B.S10 />
			</Freeze>
			<Stamp p={pop(t, 12, 10)} mark="check" label="ЛАМПА" />
		</Recap>
	);
};

// 2. Recap: Max got a voice message in your voice: «Возьми мяч».
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [48]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 2">
			{i === 0 ? (
				<Freeze frame={100}>
					<G2B.S11 />
				</Freeze>
			) : (
				<Freeze frame={84}>
					<G2B.S13 />
				</Freeze>
			)}
		</Recap>
	);
};

// 3. Recap: the third one — «мама попросит вынести мусор, не выходи из дома» ? — and the whisper «Это не ты».
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [112]);
	if (i === 0) {
		return (
			<Recap f={t} label="◀◀ ЧАСТЬ 2">
				<Freeze frame={175}>
					<G2B.S17 />
				</Freeze>
				<Stamp p={pop(t, 74, 10)} mark="q" label="МУСОР" />
			</Recap>
		);
	}
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 2">
			<AbsoluteFill style={{transform: 'translateY(-170px)'}}>
				<Freeze frame={55}>
					<G2B.S19 />
				</Freeze>
			</AbsoluteFill>
		</Recap>
	);
};

// 4. Recap: exactly at seven mom knocks: «Сынок, вынеси мусор».
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 2">
			<G2.S13 />
		</Recap>
	);
};

// 5. Title card: part 3 «Глазок», what the viewers chose.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 22, 11);
	const d = pop(f, 36, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 58%, #04060d 100%)'}}>
			<div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 10, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 3</div>
				<div style={{fontSize: 76, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ГЛАЗОК</div>
				<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, background: 'rgba(14,14,16,0.92)', border: '6px solid #3b82f6', borderRadius: 24, padding: '12px 34px 16px', transform: `scale(${c})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
					<div style={{fontSize: 30, color: '#9cc2ff', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
						<div style={{width: 66, height: 66, borderRadius: 33, background: '#3b82f6', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>
						<div style={{fontSize: 54, color: '#fff'}}>НЕ ВЫХОДИТЬ</div>
					</div>
				</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 34, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 32px', fontSize: 36, transform: `scale(${d})`}}>ЧАСТИ 1–2 — В ПРОФИЛЕ</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 6. You lie to mom that your stomach hurts. She touches your forehead and frowns.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const touch = lerp(f, 54, 66, 0, 1, Easing.out(Easing.cubic));
	const HX = 380;
	const MX = 760;
	const Y = 1560;
	const rest: [number, number] = [-120, -420];
	const reach: [number, number] = [HX + 18 - MX, -770];
	const armL: [number, number] = [rest[0] + (reach[0] - rest[0]) * touch, rest[1] + (reach[1] - rest[1]) * touch];
	const frown = f >= 86;
	return (
		<Stage cam={{s: lerp(f, 0, 114, 1.0, 1.06) * kick(f), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.55}} bg="#cdb88f">
			<Hall id="g3s6" noBag />
			<Person
				kind="teen"
				id="g3s6h"
				x={HX}
				y={Y}
				scale={1.0}
				breathe={f}
				face={touch > 0.5 ? {eyes: 'open', brows: 'worried', mouth: 'wobble', look: [0.5, -0.5], blush: false} : {eyes: 'narrow', brows: 'worried', mouth: 'wobble', look: [0.7, 0], blush: false}}
				armL={{target: [-30, -440], bend: 1, ku: 0.7, kf: 0.7}}
				armR={{target: [40, -410], bend: -1, ku: 0.7, kf: 0.7}}
			/>
			<Person
				kind="mom"
				id="g3s6m"
				colors={MOM}
				x={MX}
				y={Y}
				scale={1.0}
				breathe={f}
				face={frown ? {eyes: 'narrow', brows: 'angry', mouth: 'tight', look: [-0.8, 0.1]} : {eyes: 'open', brows: 'raised', mouth: 'flat', look: [-0.8, 0.1]}}
				armL={{target: armL, bend: -1}}
				armR={{target: [140, -400], bend: -1}}
			/>
			<Bag x={MX + 140} y={Y - 400} s={0.9} />
		</Stage>
	);
};

// 7. «Ладно, сама вынесу» → mom takes the bag and goes out of the front door.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const sigh = t < 12;
		const talk = t >= 2 && t < 36 && Math.floor(t / 4) % 2 === 0;
		return (
			<WarmClose id="g3s7" t={t} len={44} zoom={[1, 1.06]}>
				<Bust kind="mom" id="g3s7b" colors={MOM} x={540} y={1000} scale={5.6} face={{eyes: sigh ? 'closed' : 'narrow', brows: 'flat', mouth: talk ? 'o' : 'tight', look: [-0.3, 0.1], blush: false}} />
				{sigh && <path d={`M 360,${1240 - t * 4} q -40,-30 0,-60 q 40,-30 0,-60`} stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.7 * (1 - t / 12)} />}
			</WarmClose>
		);
	}
	// from the hall: she walks to the door, it opens, she steps out, it shuts
	const walk = lerp(t, 2, 36, 0, 1, Easing.inOut(Easing.quad));
	const open = lerp(t, 8, 16, 0, 1, Easing.out(Easing.cubic)) * (1 - lerp(t, 42, 52, 0, 1, Easing.in(Easing.cubic)));
	const mx = 650 + (575 - 650) * walk;
	const my = 1660 + (1430 - 1660) * walk;
	const ms = 1.05 + (0.74 - 1.05) * walk;
	const outside = my < 1470;
	const mom = (
		<g>
			<Person kind="mom" id="g3s7m" colors={MOM} x={mx} y={my} scale={ms} back walk={t < 38 ? t * 0.35 : undefined} armL={{target: [-110, -400], bend: 1}} armR={{target: [120, -400], bend: -1}} />
			<Bag x={mx - 120 * ms} y={my - 400 * ms} s={0.9 * ms} />
		</g>
	);
	return (
		<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.04) * kick(t), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
			<Hall id="g3s7h" noBag />
			<FrontDoor id="g3s7d" open={open} light={flick(t, 1)}>
				{outside && t < 46 ? mom : null}
			</FrontDoor>
			{!outside && mom}
		</Stage>
	);
};

// 8. Click — the lock. And the voice said nothing about mom…
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [34]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<LockClose t={t} />
				{t >= 11 && (
					<div style={{position: 'absolute', left: 760, top: 560, transform: `translate(-50%,-50%) scale(${pop(t, 11, 8)}) rotate(-10deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: '#fff', textShadow: '0 6px 0 #000, 0 0 20px rgba(0,0,0,0.6)'}}>
						ЩЁЛК
					</div>
				)}
			</AbsoluteFill>
		);
	}
	const card = pop(t, 4, 11);
	const stamp = pop(t, 46, 9);
	return (
		<AbsoluteFill>
			<WarmClose id="g3s8" t={t} len={68} zoom={[1, 1.1]}>
				<Bust kind="teen" id="g3s8b" x={540} y={1040} scale={6.4} face={{eyes: t < 40 ? 'open' : 'wide', pupil: t < 40 ? 1 : 0.55, brows: t < 40 ? 'worried' : 'raised', mouth: t < 40 ? 'flat' : 'o', look: [-0.7, 0], blush: false}} />
			</WarmClose>
			{card > 0.01 && (
				<div style={{position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${card}) rotate(-2deg)`}}>
					<div style={{background: 'rgba(14,14,16,0.92)', border: `6px solid ${YELLOW}`, borderRadius: 22, padding: '14px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, color: YELLOW}}>«НЕ ВЫХОДИ ИЗ ДОМА»</div>
				</div>
			)}
			{stamp > 0.01 && (
				<div style={{position: 'absolute', left: 700, top: 470, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * -20 + 8}deg)`, opacity: Math.min(1, stamp * 2), background: RED, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 58, borderRadius: 16, padding: '6px 26px', boxShadow: '0 8px 20px rgba(0,0,0,0.45)'}}>
					А МАМА?
				</div>
			)}
		</AbsoluteFill>
	);
};

// 9. You rush to the door viewer → the light on the landing blinks.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const run = lerp(t, 0, 26, 0, 1, Easing.out(Easing.quad));
		const tip = lerp(t, 26, 34, 0, 1);
		const hx = 600 + (570 - 600) * run;
		const hy = 1900 + (1500 - 1900) * run - 40 * tip;
		const hs = 1.35 + (1.0 - 1.35) * run;
		const hands: [number, number] = [-120, -700 - 60 * tip];
		return (
			<Stage cam={{s: kick(t), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
				<Hall id="g3s9h" noBag />
				<Person kind="teen" id="g3s9" x={hx} y={hy} scale={hs} back walk={run < 1 ? t * 0.6 : undefined} armL={tip > 0 ? {target: hands, bend: 1} : undefined} armR={tip > 0 ? {target: [-hands[0], hands[1]], bend: -1} : undefined} />
			</Stage>
		);
	}
	// through the viewer: mom just outside, walking away under the blinking bulb
	const light = flick(t, 2);
	const w = lerp(t, 0, 46, 0, 1, Easing.linear);
	const mx = 560 + 40 * w;
	const my = 1900 + (1780 - 1900) * w;
	const ms = 1.25 + (1.12 - 1.25) * w;
	return (
		<Peephole>
			<Stage cam={pcam(0.85 * kick(t, 0.05), 560, 1100)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<Landing light={light} />
				<Person kind="mom" id="g3s9m" colors={MOM} x={mx} y={my} scale={ms} back walk={t * 0.3} armL={{target: [-110, -400], bend: 1}} armR={{target: [120, -400], bend: -1}} />
				<Bag x={mx - 120 * ms} y={my - 400 * ms} s={0.9 * ms} />
				<Dark light={light} />
			</Stage>
		</Peephole>
	);
};

// 10. Mom walks to the trash chute… and suddenly stops (someone stands in the dark by it).
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const light = flick(f, 3);
	const w = lerp(f, 0, 58, 0, 1, Easing.out(Easing.quad));
	const mx = 600 + (640 - 600) * w;
	const my = 1780 + (1600 - 1780) * w;
	const ms = 1.12 + (0.98 - 1.12) * w;
	const stopped = f >= 58;
	return (
		<Peephole>
			<Stage cam={pcam(0.85 * kick(f, 0.05), 560 + 30 * w, 1100)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<Landing light={light} />
				{/* a dark figure by the chute */}
				<Person kind="teen" id="g3s10d" x={840} y={1560} scale={0.9} silhouette="#14161c" />
				<Person kind="mom" id="g3s10m" colors={MOM} x={mx} y={my} scale={ms} back walk={stopped ? undefined : f * 0.3} headTurn={stopped ? 0.4 : 0} armL={{target: [-110, -400], bend: 1}} armR={{target: [120, -400], bend: -1}} />
				<Bag x={mx - 120 * ms} y={my - 400 * ms} s={0.9 * ms} />
				<Dark light={light} />
			</Stage>
		</Peephole>
	);
};

// 11. Next to the chute stands a boy. A red hoodie. Glasses.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const light = f < 12 ? 0.12 : flick(f, 4);
	const z1 = lerp(f, 34, 46, 0, 1, Easing.inOut(Easing.cubic));
	const z2 = lerp(f, 60, 72, 0, 1, Easing.inOut(Easing.cubic));
	const s = 0.85 + 0.75 * z1 + 1.3 * z2;
	const cx = 700 + (840 - 700) * z1;
	const cy = 1100 + (1250 - 1100) * z1 + (915 - 1250) * z2;
	const glint = f >= 76 && f < 86 ? 1 - (f - 76) / 10 : 0;
	return (
		<Peephole>
			<Stage cam={pcam(s * kick(f, 0.04), cx, cy)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<Landing light={light} />
				<Person kind="teen" id="g3s11d" x={840} y={1560} scale={0.9} breathe={f} face={{...DOUBLE_FACE, look: [-0.8, 0.1]}} />
				<Person kind="mom" id="g3s11m" colors={MOM} x={610} y={1600} scale={0.98} face={{eyes: 'open', brows: 'raised', mouth: 'o', look: [0.8, 0]}} armL={{target: [-110, -400], bend: 1}} armR={{target: [120, -400], bend: -1}} />
				<Bag x={610 + 120 * 0.98} y={1600 - 400 * 0.98} s={0.88} />
				{glint > 0 && <path d={`M ${840 - 50},${1560 - 700 * 0.9 - 24} l 50,-34 M ${840 + 22},${1560 - 700 * 0.9 - 24} l 50,-34`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={glint} />}
				<Dark light={light} />
			</Stage>
		</Peephole>
	);
};

// 12. Mom talks to him calmly. As if to you.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const light = flick(f, 5);
	const talk = Math.floor(f / 5) % 2 === 0;
	const nod = Math.sin(f / 6) * 3;
	return (
		<Peephole>
			<Stage cam={pcam(1.1 * kick(f, 0.04), 730, 1060)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<Landing light={light} />
				<Person kind="teen" id="g3s12d" x={840} y={1560} scale={0.9} breathe={f} headTilt={nod} face={{...DOUBLE_FACE, look: [-0.8, 0.1]}} />
				<Person kind="mom" id="g3s12m" colors={MOM} x={610} y={1600} scale={0.98} breathe={f} face={{eyes: 'happy', brows: 'neutral', mouth: talk ? 'o' : 'smile', look: [0.8, 0]}} armL={{target: [-110, -400], bend: 1}} armR={{target: [120, -400], bend: -1}} />
				<Bag x={610 + 120 * 0.98} y={1600 - 400 * 0.98} s={0.88} />
				<Dark light={light} />
			</Stage>
			<div style={{position: 'absolute', left: 150, top: 330, transform: `scale(${pop(f, 6, 10)})`, background: '#fff', borderRadius: 30, padding: '6px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: 56, color: '#333', boxShadow: '0 6px 16px rgba(0,0,0,0.4)'}}>
				{'. . .'.slice(0, 1 + 2 * (Math.floor(f / 8) % 3))}
			</div>
		</Peephole>
	);
};

// 13. He takes the bag from her and throws it into the chute.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const light = flick(f, 6);
	const MX = 610;
	const DX = 840;
	const take = lerp(f, 6, 22, 0, 1, Easing.inOut(Easing.cubic));
	const lift = lerp(f, 30, 42, 0, 1, Easing.inOut(Easing.cubic));
	const drop = lerp(f, 42, 50, 0, 1, Easing.in(Easing.quad));
	const hatch = lerp(f, 30, 38, 0, 1) * (1 - lerp(f, 54, 60, 0, 1));
	const hand0: [number, number] = [MX + 120 * 0.98, 1600 - 400 * 0.98];
	const hand1: [number, number] = [DX - 110 * 0.9, 1560 - 420 * 0.9];
	const hatchP: [number, number] = [925, 1100];
	let bx = hand0[0] + (hand1[0] - hand0[0]) * take;
	let by = hand0[1] + (hand1[1] - hand0[1]) * take;
	bx += (hatchP[0] - bx) * lift;
	by += (hatchP[1] - 120 - by) * lift + 140 * drop;
	const bagGone = f >= 50;
	const dArm: [number, number] = [(bx - DX) / 0.9, (by - 1560) / 0.9];
	return (
		<Peephole>
			<Stage cam={pcam(1.1 * kick(f, 0.04), 750, 1060)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<Landing light={light} hatch={hatch} />
				<Person
					kind="teen"
					id="g3s13d"
					x={DX}
					y={1560}
					scale={0.9}
					breathe={f}
					face={{...DOUBLE_FACE, look: lift > 0.3 ? [0.8, -0.2] : [-0.8, 0.1]}}
					armL={take > 0.2 && !bagGone ? {target: f < 30 ? [-110, -420] : [Math.max(-60, Math.min(190, dArm[0])), Math.max(-760, dArm[1])], bend: 1} : undefined}
				/>
				<Person kind="mom" id="g3s13m" colors={MOM} x={MX} y={1600} scale={0.98} breathe={f} face={{eyes: 'happy', brows: 'neutral', mouth: 'smile', look: [0.8, 0]}} armL={{target: [-110, -400], bend: 1}} armR={{target: take < 0.5 ? [120, -400] : [60, -360], bend: -1}} />
				{!bagGone && <Bag x={bx} y={by} s={0.88} rot={30 * lift} />}
				<Dark light={light} />
			</Stage>
		</Peephole>
	);
};

// 14. Then he slowly turns to your door → he has your face (you | him).
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		const light = flick(t, 7);
		const turn = lerp(t, 14, 58, 1, 0, Easing.inOut(Easing.cubic));
		const s = lerp(t, 0, 80, 1.1, 1.6);
		return (
			<Peephole>
				<Stage cam={pcam(s, 760 + 80 * ((s - 1.1) / 0.5), 1060 - 80 * ((s - 1.1) / 0.5))} light={{glow: 0, vignette: 0.4}} bg="#000">
					<Landing light={light} />
					<Person kind="mom" id="g3s14m" colors={MOM} x={600} y={1600} scale={0.98} back walk={t * 0.25} />
					<Person kind="teen" id="g3s14d" x={840} y={1560} scale={0.9} breathe={t} headTurn={0.9 * turn} face={{...DOUBLE_FACE, look: [0.9 * turn, 0.1 * turn]}} />
					<Dark light={light} />
				</Stage>
			</Peephole>
		);
	}
	const light = flick(t, 8);
	const lbl = (p: number, x: number, text: string, color: string) => (
		<div style={{position: 'absolute', left: x, top: 330, transform: `translate(-50%,0) scale(${p})`, background: 'rgba(14,14,16,0.9)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color}}>{text}</div>
	);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
				<WarmClose id="g3s14a" t={t} len={43} zoom={[1.05, 1.12]}>
					<Bust kind="teen" id="g3s14ab" x={540} y={1000} scale={6.6} face={{eyes: 'wide', pupil: 0.55, brows: 'raised', mouth: 'o', look: [0.2, 0], blush: false}} />
				</WarmClose>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}>
				<Stage cam={{s: lerp(t, 0, 43, 1.05, 1.12), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.8}} bg="#0d1210">
					<rect x={-600} y={-600} width={2300} height={2100} fill="#bdb9a9" />
					<rect x={-600} y={1500} width={2300} height={1500} fill="#4f7a63" />
					<Bust kind="teen" id="g3s14bb" x={540} y={1000} scale={6.6} face={{...DOUBLE_FACE, look: [0, 0]}} />
					<Dark light={light} base={0.35} />
				</Stage>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 534, top: 0, width: 12, height: 1920, background: '#fff', opacity: 0.9}} />
			{lbl(pop(t, 4, 10), 270, 'ТЫ', '#3b82f6')}
			{lbl(pop(t, 10, 10), 810, 'ОН', RED)}
		</AbsoluteFill>
	);
};

// 15. He comes right up to the viewer… and smiles.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const light = flick(f, 9);
	const near = lerp(f, 0, 44, 0, 1, Easing.in(Easing.quad));
	const smile = f >= 58;
	const bs = 1.5 + (5.6 - 1.5) * near;
	return (
		<Peephole>
			<Stage cam={pcam(1.0, 540, 960)} light={{glow: 0, vignette: 0.4}} bg="#000">
				<g transform={`translate(540,960) scale(${1.4 + 1.2 * near}) translate(-800,-1250)`}>
					<Landing light={light} />
				</g>
				<Bust kind="teen" id="g3s15b" x={540} y={840 + 160 * (1 - near)} scale={bs} face={smile ? {eyes: 'stare', pupil: 0.45, brows: 'flat', mouth: 'grin', look: [0, 0], blush: false} : {...DOUBLE_FACE, look: [0, 0]}} />
				<Dark light={light} base={smile ? 0.2 : 0.1} />
			</Stage>
		</Peephole>
	);
};

// 16. The light goes out (his glasses glint once) → you jump back from the door.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [30]);
	if (i === 0) {
		const off = t >= 10;
		const glint = off && t < 18;
		return (
			<Peephole>
				<Stage cam={pcam(1.0, 540, 960)} light={{glow: 0, vignette: 0.4}} bg="#000">
					<Bust kind="teen" id="g3s16b" x={540} y={840} scale={5.6} face={{eyes: 'stare', pupil: 0.45, brows: 'flat', mouth: 'grin', look: [0, 0], blush: false}} />
					<Dark light={1} base={off ? 1 : 0.2} />
				</Stage>
				{glint && (
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						{[-1, 1].map((d) => (
							<circle key={d} cx={540 + d * 180} cy={700} r={13} fill="#fff" opacity={1 - (t - 10) / 8} />
						))}
					</svg>
				)}
			</Peephole>
		);
	}
	const back = lerp(t, 4, 22, 0, 1, Easing.out(Easing.cubic));
	const hop = Math.sin(Math.min(1, Math.max(0, (t - 4) / 18)) * Math.PI) * 60;
	return (
		<Stage cam={{s: kick(t) * (t >= 4 ? kick(t - 4, 0.05) : 1), cx: 570, cy: 1000}} light={{glow: 0.2, vignette: 0.7}} bg="#cdb88f">
			<Hall id="g3s16h" noBag dark={0.25} />
			<Person
				kind="teen"
				id="g3s16"
				x={570 - 40 * back}
				y={1500 + 300 * back - hop}
				scale={1.0 + 0.3 * back}
				breathe={t}
				face={{eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: 'o', look: [0, -0.2], blush: false}}
				armL={{target: [-270, -620], bend: 1}}
				armR={{target: [270, -620], bend: -1}}
			/>
		</Stage>
	);
};

// 17. A minute later mom comes back in. Without the bag.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 0, 8, 0, 1, Easing.out(Easing.cubic));
	const w = lerp(f, 4, 34, 0, 1, Easing.out(Easing.quad));
	const mx = 575 + (640 - 575) * w;
	const my = 1440 + (1640 - 1440) * w;
	const ms = 0.76 + (1.04 - 0.76) * w;
	const inside = my >= 1470;
	const mom = <Person kind="mom" id="g3s17m" colors={MOM} x={mx} y={my} scale={ms} walk={w < 1 ? f * 0.35 : undefined} breathe={f} face={{eyes: 'happy', brows: 'neutral', mouth: 'smile', look: [-0.3, 0.2]}} />;
	return (
		<Stage cam={{s: lerp(f, 0, 57, 1.0, 1.05) * kick(f), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
			<Hall id="g3s17h" noBag />
			<FrontDoor id="g3s17d" open={open} light={1}>
				{!inside ? mom : null}
			</FrontDoor>
			{inside && mom}
		</Stage>
	);
};

// 18. «Спасибо, что помог, сынок. А как ты так быстро вернулся?»
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const talk = ((f >= 2 && f < 34) || (f >= 46 && f < 78)) && Math.floor(f / 4) % 2 === 0;
	const ask = f >= 44;
	return (
		<WarmClose id="g3s18" t={f} len={90} zoom={[1, 1.08]}>
			<Bust kind="mom" id="g3s18b" colors={MOM} x={540} y={1000} scale={5.6} tilt={ask ? -5 : 0} face={{eyes: ask ? 'open' : 'happy', brows: ask ? 'raised' : 'neutral', mouth: talk ? 'o' : 'smile', look: [-0.3, 0.1], blush: false}} />
		</WarmClose>
	);
};

// 19. But you never left the flat.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<WarmClose id="g3s19" t={f} len={57} zoom={[1.02, 1.12]} dim={0.15}>
			<Bust kind="teen" id="g3s19b" x={540} y={1000} scale={6.6} face={{eyes: 'wide', pupil: 0.45, brows: 'raised', mouth: 'o', look: [0, 0.1], blush: false}} />
		</WarmClose>
	);
};

// 20. At night, 23:41 → a new voice message.
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [52]);
	if (i === 0) {
		const z = 1 - lerp(t, 12, 34, 0, 1, Easing.inOut(Easing.cubic));
		const buzz = t >= 14 && t < 50 && Math.floor((t - 14) / 7) % 2 === 0;
		return (
			<Stage cam={{s: (2.5 + (1.12 - 2.5) * z) * kick(t), cx: 865 + (575 - 865) * z, cy: 1135 + (1130 - 1135) * z}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<Bedroom f={t} id="g3s20" glow={interpolate(t, [14, 18], [0, 1], clamp)} buzz={buzz} eyes={t < 18 ? 'open' : 'wide'} />
			</Stage>
		);
	}
	const buzz = t >= 2 && t < 16;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + (buzz ? Math.sin(t * 2.9) * 8 : 0)} y={1000} w={680} scale={lerp(t, 0, 44, 1.0, 1.1) * kick(t)}>
				<LockScreen notif={pop(t, 4, 12)} ring={pop(t, 22, 12)} date="суббота, 14 ноября" />
			</Phone>
		</AbsoluteFill>
	);
};

// 21. «Ты его видел…» → vision of tomorrow: he stands in the gym in your place → «Выключи телефон».
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80, 150]);
	if (i === 1) {
		const c: Cam = {s: lerp(t, 0, 70, 0.95, 1.05), cx: 560, cy: 1150};
		return (
			<Vision f={t} label="ЗАВТРА · 08:30">
				<Stage cam={c} light={{glow: 0.2, vignette: 0.6}} bg="#000">
					<Gym />
					<G2B.Kids f={t} xs={[150, 300, undefined]} y={1470} idp="g3s21k" face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0.6, 0.1]}} />
					<Teacher id="g3s21t" x={1000} y={1490} scale={0.85} f={t} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [-0.6, 0.2]}} />
					<Person kind="teen" id="g3s21d" x={560} y={1480} scale={0.95} breathe={t} face={{eyes: 'stare', pupil: 0.6, brows: 'flat', mouth: 'smile', look: [0, 0], blush: false}} />
					<G2B.Max id="g3s21m" x={760} y={1480} f={t} face={{eyes: 'open', mouth: 'flat', brows: 'raised', look: [-0.8, 0.1]}} />
				</Stage>
			</Vision>
		);
	}
	const s = lerp(f, 0, 225, 1.45, 1.7) * kick(t, 0.05);
	const p = focus(680, 304, 330, 540, 780, s);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="23:41">
					<VoiceBubble top={250} f={f} progress={interpolate(f, [6, 222], [0.03, 0.98], clamp)} lvl={level('g21', f - 6)} />
					{i === 2 && <PowerSlider p={pop(t, 6, 11)} f={t} />}
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 22. You reach for the button… and the phone rings.
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const ringing = f >= 42;
	const reach = lerp(f, 4, 30, 0, 1, Easing.out(Easing.cubic));
	const flinch = lerp(f, 42, 50, 0, 1, Easing.out(Easing.cubic));
	const jx = ringing ? Math.sin(f * 3.1) * 9 : 0;
	const thumbX = 1180 + (905 - 1180) * reach + 140 * flinch;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + jx} y={1000} w={680} scale={1.0 * (ringing ? kick(f - 42, 0.05) : 1)}>
				{ringing ? <CallScreen f={f} /> : <NightLock />}
			</Phone>
			<div style={{position: 'absolute', left: 540 + 340 - 6 + jx, top: 640, width: 12, height: 120, borderRadius: 4, background: '#2a2b30'}} />
			<div style={{position: 'absolute', left: thumbX, top: 640, width: 150, height: 120, borderRadius: '50% 40% 40% 50%', background: '#e8b48e', boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.08)'}} />
			<div style={{position: 'absolute', left: thumbX + 120, top: 600, width: 260, height: 200, borderRadius: 60, background: '#cf4a3c'}} />
		</AbsoluteFill>
	);
};

// 23. On the screen: «Мой номер».
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 51, 1.45, 1.6) * kick(f);
	const jx = Math.sin(f * 3.1) * 7;
	const p = focus(680, 324, 250, 540 + jx, 700, s);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<CallScreen f={f} ring={pop(f, 26, 10)} />
			</Phone>
		</AbsoluteFill>
	);
};

// 24. Finale: turn the phone off as the voice says, or answer the call? Countdown, end card.
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const jx = Math.floor(f / 20) % 2 === 0 ? Math.sin(f * 3.1) * 6 : 0;
	return (
		<Finale
			next="ЧАСТЬ 4"
			boxes={4}
			opt1={{text: 'ВЫКЛЮЧИТЬ', sub: 'телефон, как велит голос'}}
			opt2={{text: 'ОТВЕТИТЬ', sub: 'на звонок «Мой номер»'}}
			tally={{done: '3 ИЗ 4', rest: 'ЧЕТВЁРТОЕ'}}
			bg={
				<AbsoluteFill style={{background: PHONE_BG}}>
					<Phone x={540 + jx} y={1000} w={680} scale={lerp(f, 0, 300, 1.0, 1.08)}>
						<CallScreen f={f} />
					</Phone>
					<AbsoluteFill style={{background: '#000', opacity: 0.6}} />
				</AbsoluteFill>
			}
		/>
	);
};
