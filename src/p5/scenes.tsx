// Part 5 «Лунатик»: 23 shots on the timeline of src/p5/timeline.ts (≈ the final edit).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {Cross, HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {PlankFloor, Wallpaper} from '../components/Set';
import {Stage} from '../components/Stage';
import * as P1 from '../scenes';
import * as P2 from '../p2/scenes';
import * as P4 from '../p4/scenes';
import {Bedroom} from '../g1/scenes';
import {Hall} from '../g2/scenes';

const {Shadow, Glint, Flashlight, Corridor, FaceDark} = P4;

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const NIGHT = '#0b1638';
const ORANGE = '#f0a032';
const ORANGE_D = '#d8862a';
const SKIN = '#f2c3a0';

const rnd = (i: number) => {
	const v = Math.sin(i * 12.9898 + 3.7) * 43758.5453;
	return v - Math.floor(v);
};

// sleepwalker: eyes half shut, arms held out in front (foreshortened towards the camera)
const SLEEPWALK = {
	face: {eyes: 'narrow' as const, brows: 'flat' as const, mouth: 'flat' as const, look: [0, 0.1] as [number, number], blush: false},
	armL: {target: [-34, -540] as [number, number], bend: 1 as const, ku: 0.15, kf: 0.15},
	armR: {target: [34, -540] as [number, number], bend: -1 as const, ku: 0.15, kf: 0.15},
};

// ======================================================= scene pieces =====
// recap frames from the previous part: VHS look
const Recap: React.FC<{f: number; label: string; children: React.ReactNode}> = ({f, label, children}) => {
	const flash = interpolate(f, [0, 4], [0.55, 0], clamp);
	const jitter = f < 3 ? (f % 2 ? 8 : -8) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translateX(${jitter}px)`}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 7px)'}} />
			<AbsoluteFill style={{background: 'rgba(40,20,10,0.18)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
			<div style={{position: 'absolute', left: 40, top: 236, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 2}}>{label}</div>
		</AbsoluteFill>
	);
};

// your head on the pillow, big (lying on your side). Children are drawn between the head and the night tint.
const PillowFace: React.FC<{t: number; id: string; face: Face; zoom?: [number, number]; children?: React.ReactNode; after?: React.ReactNode; red?: number}> = ({t, id, face, zoom = [1, 1.08], children, after, red = 0}) => (
	<Stage cam={{s: lerp(t, 0, 90, zoom[0], zoom[1]), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
		<rect x={-500} y={-500} width={2200} height={3000} fill="#232c52" />
		<ellipse cx={400} cy={1180} rx={760} ry={330} fill="#dcd8e8" />
		<g transform="rotate(-90 420 1040)">
			<Bust kind="son" id={id} x={420} y={1040} scale={3.6} face={{blush: false, ...face}} />
		</g>
		<path d="M 690,1500 C 700,1200 760,1000 900,960 C 1100,900 1500,900 1700,1000 L 1700,2400 L 690,2400 Z" fill="#4b69a6" />
		<path d="M 700,1480 C 710,1220 760,1040 880,990" stroke="#6f8cc8" strokeWidth={40} fill="none" strokeLinecap="round" />
		{children}
		<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.4} />
		{after}
		{red > 0 && <rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={red} />}
	</Stage>
);

// the door of your room seen from inside; behind it the dark corridor. open 0..1, hinge on the left
const SonDoor: React.FC<{id: string; open: number; inside?: React.ReactNode}> = ({id, open, inside}) => {
	const o = Math.max(0, Math.min(1, open));
	return (
		<g>
			<rect x={-500} y={-500} width={2200} height={3000} fill="#26304f" />
			<Wallpaper id={`${id}wp`} x={-500} y={-500} w={2200} h={1980} base="#2f3a63" line="#29335a" />
			<PlankFloor y={1480} color="#3a2c2a" seam="#2a1f1e" />
			<defs>
				<clipPath id={`${id}clip`}>
					<rect x={330} y={420} width={420} height={1060} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}clip)`}>
				<rect x={330} y={420} width={420} height={1060} fill="#10131f" />
				{inside}
			</g>
			<path d={`M 330,420 L ${330 + 420 * (1 - o) + 30 * o},${420 - 40 * o} L ${330 + 420 * (1 - o) + 30 * o},${1480 + 40 * o} L 330,1480 Z`} fill="#7a5038" />
			{o < 0.4 && <circle cx={330 + 420 * (1 - o) - 46} cy={980} r={18} fill="#d8c090" />}
			<rect x={310} y={400} width={20} height={1080} fill="#5a3a26" />
			<rect x={750} y={400} width={20} height={1080} fill="#5a3a26" />
			<rect x={310} y={400} width={460} height={20} fill="#5a3a26" />
		</g>
	);
};

// the yard at night seen from your window: blocks of flats, a streetlight, a row of garages (№17 is dad's)
const Yard: React.FC<{f: number; id: string; light?: number; walker?: {x: number; y: number; s: number; eyes?: number; walk?: boolean}}> = ({f, id, light = 0, walker}) => (
	<g>
		<rect x={-500} y={-500} width={2200} height={1700} fill="url(#skyNight)" />
		{Array.from({length: 26}).map((_, k) => (
			<circle key={k} cx={-300 + rnd(k) * 1700} cy={-300 + rnd(k + 30) * 900} r={2 + rnd(k + 60) * 2} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 11 + k))} />
		))}
		{[
			[-420, 520, 300],
			[-60, 600, 280],
			[1160, 480, 320],
		].map(([x, y, w], k) => (
			<g key={k}>
				<rect x={x} y={y} width={w} height={700} fill="#161a2b" />
				{Array.from({length: 12}).map((_, j) => (
					<rect key={j} x={x + 30 + (j % 4) * (w / 4.6)} y={y + 40 + Math.floor(j / 4) * 110} width={34} height={50} fill={rnd(k * 20 + j) > 0.72 ? '#ffd27a' : '#232842'} opacity={0.9} />
				))}
			</g>
		))}
		<rect x={-500} y={1180} width={2200} height={1400} fill="#24262f" />
		<rect x={-500} y={1170} width={2200} height={14} fill="#3a3d48" />
		{/* garages №14–18 */}
		{[14, 15, 16, 17, 18].map((n, k) => {
			const x = 40 + k * 205;
			const lit = n === 17 ? light : 0;
			return (
				<g key={n}>
					<rect x={x - 6} y={890} width={202} height={22} fill="#3a3f48" />
					<rect x={x} y={910} width={190} height={270} fill="#4a4f5a" />
					<rect x={x + 20} y={950} width={150} height={230} fill={n === 17 ? '#6b5a4a' : '#5d5248'} />
					{Array.from({length: 5}).map((_, j) => (
						<rect key={j} x={x + 30 + j * 28} y={955} width={6} height={220} fill="#4e443c" />
					))}
					<text x={x + 95} y={1010} fontSize={34} fontFamily={HEAVY} fontWeight={900} fill="#d9d4c6" textAnchor="middle" opacity={0.85}>
						{n}
					</text>
					{lit > 0 && (
						<g opacity={lit}>
							<rect x={x + 16} y={946} width={158} height={6} fill="#ffe08a" />
							<rect x={x + 16} y={946} width={6} height={236} fill="#ffe08a" />
							<rect x={x + 168} y={946} width={6} height={236} fill="#ffe08a" />
							<rect x={x + 20} y={1172} width={150} height={10} fill="#fff3c4" />
							<path d={`M ${x + 20},1182 L ${x + 170},1182 L ${x + 250},1320 L ${x - 60},1320 Z`} fill="#ffe08a" opacity={0.25} />
						</g>
					)}
				</g>
			);
		})}
		{/* streetlight */}
		<rect x={890} y={600} width={12} height={720} fill="#3a3d48" />
		<rect x={830} y={590} width={70} height={14} rx={6} fill="#3a3d48" />
		<ellipse cx={840} cy={610} rx={26} ry={10} fill="#fff3c4" />
		<path d="M 816,612 L 864,612 L 1010,1330 L 670,1330 Z" fill="#ffe9a8" opacity={0.12} />
		{walker && (
			<g>
				<Shadow id={`${id}w`} x={walker.x} y={walker.y} scale={walker.s} />
				<Glint x={walker.x} y={walker.y} scale={walker.s} o={walker.eyes ?? 0} />
			</g>
		)}
		<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.25} />
	</g>
);

// window frame seen from inside (the yard is drawn behind it)
const WindowFrame: React.FC = () => (
	<g>
		<path d="M -500,-500 L 1700,-500 L 1700,2600 L -500,2600 Z M 140,260 L 140,1560 L 940,1560 L 940,260 Z" fill="#2c3454" fillRule="evenodd" />
		<rect x={130} y={250} width={820} height={1320} fill="none" stroke="#e9e2d4" strokeWidth={22} />
		<rect x={530} y={250} width={20} height={1320} fill="#e9e2d4" />
		<rect x={130} y={760} width={820} height={18} fill="#e9e2d4" />
		<rect x={90} y={1566} width={900} height={40} rx={6} fill="#d9d2c4" />
		<path d="M 60,200 L 190,200 Q 160,900 190,1620 L 60,1620 Z" fill="#4a3f5e" />
		<path d="M 1020,200 L 890,200 Q 920,900 890,1620 L 1020,1620 Z" fill="#4a3f5e" />
	</g>
);

// a dark hand coming in from the right and snapping its fingers
const SnapHand: React.FC<{x: number; y: number; snap: number}> = ({x, y, snap}) => (
	<g>
		<path d={`M 1400,${y + 120} L ${x + 80},${y + 30} L ${x + 60},${y - 60} L 1400,${y - 20} Z`} fill="#06080d" />
		<ellipse cx={x} cy={y} rx={95} ry={80} fill="#06080d" />
		<ellipse cx={x - 70} cy={y - 50} rx={36} ry={26} fill="#06080d" />
		{snap > 0 && (
			<g stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={snap}>
				{[-60, -20, 20, 60, 100].map((a) => {
					const r = (a * Math.PI) / 180;
					return <line key={a} x1={x - 110 + Math.cos(Math.PI + r) * 40} y1={y - 80 + Math.sin(Math.PI + r) * 40} x2={x - 110 + Math.cos(Math.PI + r) * 90} y2={y - 80 + Math.sin(Math.PI + r) * 90} />;
				})}
			</g>
		)}
	</g>
);

// the rule card with a red «НАРУШЕНО» stamp
const RuleBroken: React.FC<{f: number; from: number; stampAt: number}> = ({f, from, stampAt}) => {
	if (f < from) return null;
	const p = pop(f, from, 12);
	const st = pop(f, stampAt, 9);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: 'rgba(8,8,12,0.55)'}} />
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${p})`}}>
				<div style={{display: 'inline-block', background: '#111', border: '5px solid #f4efe6', borderRadius: 18, padding: '8px 38px', fontFamily: HEAVY, fontWeight: 900, fontSize: 54, color: '#fff', letterSpacing: 3}}>ПРАВИЛО 5</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 66, color: RED, marginTop: 18, lineHeight: 1.05, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>
					НЕ ПОВОРАЧИВАЙСЯ
					<br />К НЕМУ СПИНОЙ
				</div>
			</div>
			{f >= stampAt && (
				<div style={{position: 'absolute', top: 640, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${2.2 - 1.2 * st}) rotate(-12deg)`, opacity: Math.min(1, st * 1.5)}}>
					<div style={{border: `10px solid ${RED}`, borderRadius: 18, padding: '6px 34px', fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: RED, letterSpacing: 6, background: 'rgba(20,0,0,0.35)'}}>НАРУШЕНО</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// big face of the dark man (head + shoulders), glinting eyes, a thin smile
const ShadowFace: React.FC<{x: number; headY: number; s: number; eyes: number; smile?: number}> = ({x, headY, s, eyes, smile = 0}) => (
	<g>
		<Shadow id={`sf${Math.round(x)}`} x={x} y={headY + 1024 * s} scale={s} />
		<Glint x={x} y={headY + 1024 * s} scale={s} o={eyes} />
		{smile > 0 && <path d={`M ${x - 46 * s},${headY + 52 * s} Q ${x},${headY + 80 * s} ${x + 46 * s},${headY + 52 * s}`} stroke="#fff" strokeWidth={4 * s} fill="none" strokeLinecap="round" opacity={smile * 0.85} />}
	</g>
);

// ============================================================== SHOTS =======
// 1. the same opening as parts 1–4
export const S01: React.FC = () => <P1.S01 />;

// 2. Recap: the bedroom → pillows under dad's blanket.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 4">
			{i === 0 ? (
				<Freeze frame={70}>
					<P4.S07 />
				</Freeze>
			) : (
				<Freeze frame={80}>
					<P4.S09 />
				</Freeze>
			)}
		</Recap>
	);
};

// 3. Recap: on the recording he stood behind the wardrobe.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 4">
			<Freeze frame={135}>
				<P4.S12 />
			</Freeze>
		</Recap>
	);
};

// 4. Recap: the whisper behind your back.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 4">
			<P4.S15 />
		</Recap>
	);
};

// 5. Title: part 5 «Лунатик».
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 12, 10);
	const c = pop(f, 26, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #13304a 0%, #08121e 58%, #03060a 100%)'}}>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 5</div>
				<div style={{fontSize: 76, color: '#7fd0ff', marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ЛУНАТИК</div>
				<div style={{display: 'inline-block', marginTop: 56, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 36px', fontSize: 40, transform: `scale(${c})`}}>ЧАСТИ 1–4 — В ПРОФИЛЕ</div>
			</div>
		</AbsoluteFill>
	);
};

// 6. You don't turn round. Eyes half shut. Arms out in front.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		const half = t >= 44;
		const sh = (
			<g>
				<ShadowFace x={800} headY={600} s={2.6} eyes={1} />
			</g>
		);
		return (
			<FaceDark
				t={t}
				id="p5s6"
				zoom={[1.0, 1.06]}
				behind={sh}
				face={half ? {eyes: 'narrow', brows: 'flat', mouth: 'flat', look: [0, 0.1]} : {eyes: 'wide', pupil: 0.4, brows: 'worried', mouth: 'flat', sweat: 1, look: [0.5, 0]}}
			/>
		);
	}
	// first person: your arms stretched into the dark
	const sway = Math.sin(t / 9) * 14;
	return (
		<Stage cam={{s: lerp(t, 0, 43, 1.0, 1.08), cx: 540, cy: 960, dy: Math.sin(t / 6) * 6}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Corridor id="p5s6c" gap={0.3} />
			<Flashlight id="p5s6fl" x={540} y={1000} r={720} dark={0.8} />
			{[-1, 1].map((d) => {
				const x0 = 540 + d * 420;
				const x1 = 540 + d * 150 + sway * d;
				return (
					<g key={d}>
						<path d={`M ${x0 - 110},2100 L ${x0 + 110},2100 L ${x1 + 60},1070 L ${x1 - 60},1070 Z`} fill={ORANGE} />
						<path d={`M ${x0 + d * 110},2100 L ${x1 + d * 60},1070`} stroke={ORANGE_D} strokeWidth={26} />
						<ellipse cx={x1} cy={1020} rx={72} ry={92} fill={SKIN} />
					</g>
				);
			})}
		</Stage>
	);
};

// a dark corridor wall seen straight on (for walking past him)
const Hallwall: React.FC<{id: string}> = ({id}) => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#262a42" />
		<Wallpaper id={`${id}wp`} x={-500} y={-500} w={2200} h={1980} base="#363a5a" line="#30344f" />
		<rect x={-500} y={1440} width={2200} height={40} fill="#4a3224" />
		<PlankFloor y={1480} color="#3a2c2a" seam="#2a1f1e" />
		<rect x={640} y={520} width={380} height={920} fill="#4a3426" />
		<rect x={660} y={540} width={340} height={900} fill="#5a3e2c" />
		<circle cx={960} cy={1000} r={14} fill="#c9a86a" />
	</g>
);

// 7. Slowly past him — so close you can smell him.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const x = lerp(f, 0, 114, 980, 560, Easing.linear);
	const c = {s: lerp(f, 40, 114, 0.95, 1.35, Easing.inOut(Easing.cubic)), cx: 470, cy: 1060};
	return (
		<Stage cam={c} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Hallwall id="p5s7" />
			<Shadow id="p5s7sh" x={330} y={1500} scale={1.0} />
			<Person kind="son" id="p5s7son" x={x} y={1510} scale={0.98} walk={f * 0.2} face={SLEEPWALK.face} armL={SLEEPWALK.armL} armR={SLEEPWALK.armR} />
			<Flashlight id="p5s7fl" x={480} y={1000} r={760} dark={0.7} />
			<Glint x={330} y={1500} scale={1.0} o={1} />
		</Stage>
	);
};

// 8. Dad always smells of diesel from the shift. He smells of nothing.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		return (
			<AbsoluteFill style={{filter: 'sepia(0.45) saturate(1.1)'}}>
				<Stage cam={{s: lerp(t, 0, 62, 1.0, 1.08), cx: 540, cy: 1000}} light={{glow: 0.5, vignette: 0.6, tint: '#c98a3a', tintOpacity: 0.15}} bg="#e9c99a">
					<rect x={-500} y={-500} width={2200} height={3000} fill="#e9d2a6" />
					<Wallpaper id="p5s8wp" x={-500} y={-500} w={2200} h={1960} base="#ecd5a8" line="#d9bd88" />
					<PlankFloor y={1460} />
					<Person kind="dad" id="p5s8dad" x={480} y={1520} scale={0.95} breathe={t} face={{eyes: 'happy', mouth: 'smile', stubble: true}} />
					<g transform="translate(790,1500)">
						<rect x={-80} y={-230} width={160} height={230} rx={14} fill="#d63b2f" />
						<rect x={-50} y={-270} width={70} height={46} rx={10} fill="none" stroke="#d63b2f" strokeWidth={14} />
						<rect x={30} y={-262} width={34} height={34} rx={6} fill="#b02e24" />
						<text x={0} y={-100} fontSize={56} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
							ДТ
						</text>
					</g>
					{[0, 1, 2].map((k) => {
						const yy = 520 - ((t * 3 + k * 40) % 120);
						return <path key={k} d={`M ${640 + k * 70},${yy + 520} q 30,-50 0,-100 q -30,-50 0,-100`} stroke="#6b8a3a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.75} />;
					})}
				</Stage>
				<div style={{position: 'absolute', left: 40, top: 236, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff'}}>НАСТОЯЩИЙ ПАПА</div>
			</AbsoluteFill>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 52, 1.6, 1.75), cx: 540, cy: 760}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
			<Hallwall id="p5s8b" />
			<Shadow id="p5s8sh" x={540} y={1500} scale={1.0} />
			<Flashlight id="p5s8fl" x={540} y={700} r={520} dark={0.7} />
			<Glint x={540} y={1500} scale={1.0} o={1} />
			<circle cx={540} cy={560} r={260} fill="none" stroke="#9aa3b2" strokeWidth={8} strokeDasharray="20 22" opacity={interpolate(t, [20, 36], [0, 0.7], clamp)} />
		</Stage>
	);
};

// 9. He steps aside… and follows you. Step for step.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const ph = f * 0.22;
	const hs = lerp(f, 0, 105, 0.95, 1.15, Easing.linear);
	const ss = lerp(f, 0, 105, 0.55, 0.68, Easing.linear);
	const follow = interpolate(f, [8, 30], [0, 1], clamp);
	return (
		<Stage cam={{s: 1.0, cx: 540, cy: 1020}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Corridor id="p5s9c" gap={0.6} />
			<Shadow id="p5s9sh" x={540 + 200 * (1 - follow)} y={1560 + 60 * (hs - 0.95) * 5} scale={ss} />
			<Person kind="son" id="p5s9son" x={540} y={2050 + 300 * (hs - 0.95)} scale={hs} walk={ph} face={SLEEPWALK.face} armL={SLEEPWALK.armL} armR={SLEEPWALK.armR} />
			<Flashlight id="p5s9fl" x={540} y={1250} r={820} dark={0.72} />
			<Glint x={540 + 200 * (1 - follow)} y={1560 + 60 * (hs - 0.95) * 5} scale={ss} o={1} />
		</Stage>
	);
};

// 10. To lie down you must turn your back on him. Rule five — broken.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 120, 1.0, 1.08), cx: 540, cy: 1060}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<SonDoor
					id="p5s10"
					open={1}
					inside={
						<g>
							<Shadow id="p5s10sh" x={540} y={1500} scale={0.95} />
						</g>
					}
				/>
				<Person kind="son" id="p5s10son" x={540} y={1840} scale={1.15} walk={f < 50 ? f * 0.2 : undefined} breathe={f} face={SLEEPWALK.face} armL={SLEEPWALK.armL} armR={SLEEPWALK.armR} />
				<Flashlight id="p5s10fl" x={540} y={1200} r={760} dark={0.72} />
				<Glint x={540} y={1500} scale={0.95} o={1} />
			</Stage>
			<RuleBroken f={f} from={50} stampAt={80} />
		</AbsoluteFill>
	);
};

// 11. You lie down, close your eyes. Your heart pounds in your ears.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const beats = [64, 82, 98, 112, 124];
	const hb = beats.reduce((a, b) => (f >= b && f < b + 8 ? Math.max(a, 1 - (f - b) / 8) : a), 0);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 132, 1.25, 1.45) * (1 + 0.025 * hb), cx: 380, cy: 1180}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Bedroom f={f} id="p5s11" glow={0} buzz={false} eyes={f < 47 ? 'open' : 'closed'} kind="son" look={[0.6, 0.2]} />
			</Stage>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(120,0,0,0.75) 100%)', opacity: 0.25 + 0.55 * hb}} />
		</AbsoluteFill>
	);
};

// 12. The bed creaks. He sits down on the edge. Very close.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const sit = interpolate(f, [38, 54], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const X = 450;
	const S = 0.85;
	return (
		<Stage cam={{s: lerp(f, 0, 111, 1.15, 1.32), cx: 400, cy: 1080}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Bedroom f={f} id="p5s12" glow={0} buzz={false} eyes="closed" kind="son" />
			{f < 38 ? (
				<Shadow id="p5s12st" x={X + 120} y={1460} scale={S} />
			) : (
				<g>
					<Person kind="dad" id="p5s12si" x={X + 120 * (1 - sit)} y={1460 + (1300 + 470 * S - 1460) * sit} scale={S} hideLegs silhouette="#06080d" />
					<rect x={X - 120 * S} y={1270} width={240 * S} height={120} rx={50} fill="#06080d" opacity={sit} />
					<rect x={X - 92 * S} y={1360} width={58 * S} height={96} rx={14} fill="#06080d" opacity={sit} />
					<rect x={X + 34 * S} y={1360} width={58 * S} height={96} rx={14} fill="#06080d" opacity={sit} />
				</g>
			)}
			<Glint x={f < 38 ? X + 120 : X + 120 * (1 - sit)} y={f < 38 ? 1460 : 1460 + (1300 + 470 * S - 1460) * sit} scale={S} o={1} />
		</Stage>
	);
};

// 13. He snaps his fingers in front of your face. Once. Twice. You don't blink.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const snaps = [78, 84];
	const sn = snaps.reduce((a, b) => (f >= b && f < b + 6 ? Math.max(a, 1 - (f - b) / 6) : a), 0);
	const handIn = interpolate(f, [10, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill>
			<PillowFace t={f} id="p5s13" face={{eyes: 'closed', brows: 'neutral', mouth: 'flat'}} after={<SnapHand x={980 - 260 * handIn} y={760} snap={sn} />} />
			{snaps.map((b, k) =>
				f >= b ? (
					<div key={b} style={{position: 'absolute', left: 560 + k * 170, top: 420 + k * 70, transform: `translate(-50%,-50%) scale(${pop(f, b, 8)}) rotate(${-8 + k * 14}deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 92, color: '#fff', textShadow: '0 6px 0 #000', opacity: interpolate(f, [b + 18, b + 28], [1, 0], clamp)}}>
						ЩЁЛК
					</div>
				) : null,
			)}
		</AbsoluteFill>
	);
};

// 14. He looks at you for a long time. A minute. Maybe two.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const lean = lerp(f, 0, 96, 0, 1, Easing.inOut(Easing.sin));
	return (
		<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#1a1f33" />
			<rect x={-500} y={-500} width={2200} height={420} fill="#151a2b" />
			<ShadowFace x={600 - 40 * lean} headY={520 + 120 * lean} s={3.0 + 0.4 * lean} eyes={1} />
		</Stage>
	);
};

// 15. He leans to your ear: «Скажи наше слово, тигрёнок».
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const lean = interpolate(f, [10, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const talk = f >= 50 && f < 96;
	return (
		<PillowFace
			t={f}
			id="p5s15"
			face={{eyes: 'closed', brows: 'neutral', mouth: 'flat'}}
			red={interpolate(f, [50, 96], [0, 0.6], clamp)}
			after={
				<g>
					<ShadowFace x={980 - 120 * lean} headY={520 + 60 * lean} s={2.4} eyes={1} />
					{talk &&
						[0, 1, 2].map((k) => {
							const r = 40 + ((f * 3 + k * 26) % 78);
							return <path key={k} d={`M ${560 + r},${660 - r * 0.6} q ${-r * 0.5},${r * 0.6} 0,${r * 1.2}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.7 * (1 - r / 118)} />;
						})}
				</g>
			}
		/>
	);
};

// 16. The word only you and dad know — made up on a fishing trip. (memory)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(0.9) brightness(0.95)'}}>
				<P2.S05 />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(30,15,5,0.85) 100%)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 8], [0.6, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 17. You stay silent. He whispers: «Ничего. Папа сам скажет». (a smile in the dark)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Stage cam={{s: lerp(f, 0, 108, 1.0, 1.12), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#141829" />
			<ShadowFace x={540} headY={760} s={4.2} eyes={1} smile={interpolate(f, [76, 90], [0, 1], clamp)} />
		</Stage>
	);
};

// 18. He leaves (the door closes) → you open your eyes: he knows where the real dad is.
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		const away = interpolate(t, [0, 34], [0, 1], clamp);
		const open = lerp(t, 36, 56, 1, 0, Easing.inOut(Easing.cubic));
		return (
			<Stage cam={{s: 1.05, cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<SonDoor
					id="p5s18"
					open={open}
					inside={<Shadow id="p5s18sh" x={540 + 40 * away} y={1500 - 60 * away} scale={0.95 - 0.25 * away} opacity={1 - away * 0.4} />}
				/>
				<Flashlight id="p5s18fl" x={540} y={1000} r={760} dark={0.65} />
			</Stage>
		);
	}
	const opened = t >= 4;
	return <PillowFace t={t} id="p5s18f" zoom={[1.05, 1.15]} face={opened ? {eyes: 'wide', pupil: 0.45, look: [1, 0], brows: 'worried', mouth: 'o'} : {eyes: 'closed', mouth: 'flat'}} />;
};

// 19. A minute later the front door slams. He's gone. At three in the morning.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const [sx, sy] = shake(f, 23, 22, 14);
	const bam = pop(f, 23, 8);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 117, 1.0, 1.1), cx: 560 + sx, cy: 1000 + sy}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Hall id="p5s19" dark={0.6} />
				<Flashlight id="p5s19fl" x={570} y={960} r={760} dark={0.6} />
			</Stage>
			{f >= 23 && (
				<div style={{position: 'absolute', left: 540, top: 600, transform: `translate(-50%,-50%) scale(${bam}) rotate(-6deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 150, color: '#fff', textShadow: '0 8px 0 #000', opacity: interpolate(f, [50, 62], [1, 0], clamp)}}>
					БАМ!
				</div>
			)}
		</AbsoluteFill>
	);
};

// 20. You run to the window. He walks towards the garages.
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [30]);
	if (i === 0) {
		return (
			<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Yard f={f} id="p5s20a" />
				<WindowFrame />
				<Person kind="son" id="p5s20son" back x={540} y={lerp(t, 0, 30, 2300, 1900)} scale={lerp(t, 0, 30, 1.5, 1.15)} walk={t * 0.6} />
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.3} />
			</Stage>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 39, 1.15, 1.25), cx: 500, cy: 1000}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
			<Yard f={f} id="p5s20b" walker={{x: lerp(t, 0, 39, 260, 420, Easing.linear), y: 1300, s: 0.32}} />
			<WindowFrame />
		</Stage>
	);
};

// 21. He turns to your window — you barely duck in time.
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [46]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 46, 2.6, 3.0), cx: 450, cy: 1180}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Yard f={f} id="p5s21a" walker={{x: 450, y: 1300, s: 0.32, eyes: interpolate(t, [18, 24], [0, 1], clamp)}} />
			</Stage>
		);
	}
	const duck = interpolate(t, [4, 12], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	return (
		<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Yard f={f} id="p5s21b" walker={{x: 450, y: 1300, s: 0.32, eyes: 1}} />
			<WindowFrame />
			<Person kind="son" id="p5s21son" back x={560} y={1900 + 700 * duck} scale={1.15} />
			<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.3} />
		</Stage>
	);
};

// 22. In one garage the light is on. In dad's.
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const ring = pop(f, 60, 10);
	return (
		<Stage cam={{s: lerp(f, 0, 75, 1.8, 2.3), cx: 710, cy: 1060}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Yard f={f} id="p5s22" light={interpolate(f, [24, 34], [0, 1], clamp) * (0.85 + 0.15 * Math.sin(f / 3))} />
			{ring > 0.01 && <circle cx={710} cy={1060} r={150 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={8} opacity={Math.min(1, ring)} />}
		</Stage>
	);
};

// 23. Finale: follow him to the garages, or wake mom and tell her everything? Countdown, end card.
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 71, 11);
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
			<Stage cam={{s: lerp(f, 0, 300, 1.3, 1.45), cx: 640, cy: 1180}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<Yard f={f} id="p5fin" light={0.9 + 0.1 * Math.sin(f / 3)} />
				<rect x={-600} y={-600} width={2400} height={3200} fill="#000" opacity={0.45} />
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)'}}>
				ОН ИЛИ <span style={{color: RED}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 5, marginTop: 18}}>
					{Array.from({length: 19}).map((_, k) => (
						<div key={k} style={{width: 38, height: 46, borderRadius: 8, background: '#e0342b', border: '3px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 18 + k * 2, 9)})`, boxSizing: 'border-box'}}>
							<Cross size={20} width={5} />
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'ПРОСЛЕДИТЬ ЗА НИМ', '#3b82f6', 'до папиного гаража', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'РАЗБУДИТЬ МАМУ', '#e0342b', 'и рассказать всё', 2)}
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
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 6</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ЧАСТИ 1–5 — В ПРОФИЛЕ</div>
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

