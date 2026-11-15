// «Голосовые из завтра» — серия 2 «Не трогай мяч» (the viewers chose to obey). 21 shots on the
// timeline of src/g2b/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part g2b).
// Phone UI comes from series 1, the gym, the lamp, the hall and the finale from the first cut of series 2.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Bust, Colors, Face, Head, Person} from '../components/Person';
import {Cam, Stage, toScreen} from '../components/Stage';
import {Phone as PhoneBase, SANS} from '../scenes/S12_S16';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import envJson from './env.json';

const {YELLOW, RED, NIGHT, Phone, ChatScreen, VoiceBubble, StatusBar, Empty, Glitch, PhoneLight, Gym, Vision, NoSign, focus, rnd} = G1;
const {Ball, Teacher, Lamp, BrokenLamp, Ceiling, Hall, Headphones, Recap, Stamp} = G2;

const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

// Max: the classmate who picks up the ball (green hoodie, sandy hair)
const MAX: Colors = {top: '#3d8b5a', topDark: '#2f6e47', hair: '#d9a441', pants: '#2b2d33', shoes: '#eceae4'};
const MS = 0.99; // Max next to the hero (teen at 0.95)
const MAX_ARMS = {armL: {target: [-60, -440] as [number, number], bend: 1 as const, ku: 0.55, kf: 0.55}, armR: {target: [60, -440] as [number, number], bend: -1 as const, ku: 0.55, kf: 0.55}};
const KIDS = [
	{kind: 'son' as const, scale: 0.8, colors: {top: '#5b6ee1', topDark: '#4a5bc4', hair: '#e8c060', pants: '#2b2d33'}},
	{kind: 'mom' as const, scale: 0.7, colors: {top: '#e07aa0', topDark: '#c4628a', hair: '#c27b3a', pants: '#f2c3a0', shoes: '#f4f4f4'}},
	{kind: 'son' as const, scale: 0.78, colors: {top: '#8a5ab8', topDark: '#6f4896', hair: '#2a1a12', pants: '#3a3f4a'}},
];
const SPOT = 600; // where you stood → where Max picks the ball up → where the lamp falls
const FLOOR = 1460;
const HERO_NUMBER = '+7 9•• •••-47-12'; // «Мой номер» from series 1

// ======================================================= scene pieces =====
// classmates; laugh = bouncing, a hand on the belly, pointing at you
const Kids: React.FC<{f: number; xs: (number | undefined)[]; y: number; face: Face; idp: string; laugh?: boolean}> = ({f, xs, y, face, idp, laugh = false}) => (
	<g>
		{KIDS.map((k, i) => {
			const x = xs[i];
			if (x === undefined) return null;
			const sh = k.kind === 'mom' ? -780 : -630;
			const hop = laugh ? -Math.abs(Math.sin(f / 3 + i * 1.3)) * 16 : 0;
			return (
				<Person
					key={i}
					kind={k.kind}
					id={`${idp}${i}`}
					colors={k.colors}
					x={x}
					y={y + hop}
					scale={k.scale}
					breathe={f + i * 20}
					headTilt={laugh ? 6 * Math.sin(f / 3 + i) : 0}
					face={{blush: false, ...face}}
					armL={laugh ? {target: [-30, sh + 210], bend: 1} : undefined}
					armR={laugh && i !== 1 ? {target: [70, sh + 40], bend: -1, ku: 0.6, kf: 0.6} : laugh ? {target: [40, sh + 230], bend: -1} : undefined}
				/>
			);
		})}
	</g>
);

const Max: React.FC<{id: string; x: number; y: number; s?: number; f: number; face: Face; ball?: boolean; walk?: number; back?: boolean; silhouette?: string; arms?: {armL: {target: [number, number]; bend: 1 | -1; ku?: number; kf?: number}; armR: {target: [number, number]; bend: 1 | -1; ku?: number; kf?: number}}}> = ({
	id,
	x,
	y,
	s = MS,
	f,
	face,
	ball = false,
	walk,
	back,
	silhouette,
	arms,
}) => {
	const a = arms ?? (ball ? MAX_ARMS : undefined);
	return (
		<g>
			<Person kind="son" id={id} colors={MAX} x={x} y={y} scale={s} breathe={f} walk={walk} back={back} silhouette={silhouette} face={{blush: false, ...face}} armL={a?.armL} armR={a?.armR} />
			{ball && !silhouette && <Ball x={x} y={y - 440 * s} s={0.6 * s} rot={0} />}
		</g>
	);
};

// gym bench along the wall; (x, floor) = left end on the floor
const Bench: React.FC<{x: number; w: number; floor: number}> = ({x, w, floor}) => {
	const seat = floor - 150;
	return (
		<g>
			<ellipse cx={x + w / 2} cy={floor + 4} rx={w / 2 + 30} ry={18} fill="#000" opacity={0.16} />
			{[x + 36, x + w - 66].map((lx) => (
				<rect key={lx} x={lx} y={seat + 30} width={30} height={120} fill="#7a4f2c" />
			))}
			<rect x={x + 50} y={floor - 56} width={w - 100} height={14} fill="#7a4f2c" />
			<rect x={x} y={seat} width={w} height={38} rx={8} fill="#c98a4a" />
			<rect x={x} y={seat + 28} width={w} height={10} rx={4} fill="#a86e38" />
		</g>
	);
};

// legs of somebody sitting, seen from the front: the lap, the shins down to the floor
const SitLegs: React.FC<{x: number; hipY: number; floorY: number; s: number; pants: string; shoes: string}> = ({x, hipY, floorY, s, pants, shoes}) => {
	const lw = 60 * s;
	const kneeY = hipY + 14 * s;
	const off = lw / 2 + 10 * s;
	return (
		<g>
			{[-1, 1].map((d) => (
				<g key={d}>
					<rect x={x + d * off - lw / 2} y={kneeY} width={lw} height={floorY - kneeY - 16 * s} fill={pants} />
					<rect x={x + d * off - lw / 2 - 10 * s} y={floorY - 34 * s} width={lw + 20 * s} height={36 * s} rx={14 * s} fill={shoes} />
				</g>
			))}
			<rect x={x - 104 * s} y={hipY - 24 * s} width={208 * s} height={70 * s} rx={30 * s} fill={pants} />
			<rect x={x - 104 * s} y={hipY + 30 * s} width={208 * s} height={14 * s} rx={7 * s} fill="#000" opacity={0.18} />
		</g>
	);
};

// you, sitting on the bench (hips on the seat)
const SittingHero: React.FC<{id: string; x: number; floor: number; s: number; f: number; face: Face}> = ({id, x, floor, s, f, face}) => {
	const hip = floor - 150 + 8;
	return (
		<g>
			<SitLegs x={x} hipY={hip} floorY={floor} s={s} pants="#2b2d33" shoes="#e8e6e0" />
			<Person kind="teen" id={id} x={x} y={hip + 370 * s} scale={s} hideLegs breathe={f} face={{blush: false, ...face}} armL={{target: [-70, -340], bend: 1}} armR={{target: [70, -340], bend: -1}} />
		</g>
	);
};

// the lamp hanging over the spot, swinging a little; (x, y) = bottom of its wire
const HangingLamp: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
	<g>
		<line x1={x} y1={-400} x2={x} y2={y} stroke="#3a3f47" strokeWidth={6} />
		<g transform={`translate(${x},${y}) rotate(${-12 + 3 * Math.sin(f / 9)})`}>
			<Lamp />
		</g>
	</g>
);

// blurred gym behind a phone held up at school
const GymBlur: React.FC<{dim?: number}> = ({dim = 0.35}) => (
	<Stage cam={{s: 1.4, cx: 560, cy: 900}} light={{glow: 0.2, vignette: 0.6}} bg="#dfe6d8">
		<g style={{filter: 'blur(14px)'}}>
			<Gym />
		</g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#000" opacity={dim} />
	</Stage>
);

// daylight close-up of a face in the gym
const DayClose: React.FC<{t: number; children: React.ReactNode; zoom?: [number, number]; len?: number}> = ({t, children, zoom = [1, 1.08], len = 45}) => (
	<Stage cam={{s: lerp(t, 0, len, zoom[0], zoom[1]) * kick(t), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.65}} bg="#dfe6d8">
		<rect x={-500} y={-500} width={2200} height={2000} fill="#d5ddcf" />
		<rect x={-500} y={1500} width={2200} height={1500} fill="#8fb3a0" />
		<rect x={-500} y={1490} width={2200} height={14} fill="#6f9482" />
		{children}
	</Stage>
);

// Max's phone: his green sleeve, his hand
const MaxPhone: React.FC<React.ComponentProps<typeof PhoneBase>> = (p) => <PhoneBase sleeve="#2f6e47" skin="#f2c3a0" {...p} />;

// the chat on Max's phone with YOUR number: your face on the avatar, the same digits as «Мой номер»
const ContactChat: React.FC<{time: string; ring?: number; children?: React.ReactNode}> = ({time, ring = 0, children}) => (
	<div style={{position: 'absolute', inset: 0, background: '#0f1115', overflow: 'hidden'}}>
		<div style={{position: 'absolute', top: 214, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#6b7280'}}>вчера</div>
		{children}
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 200, background: '#1b1d22', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 18, fontFamily: SANS, boxSizing: 'border-box', zIndex: 2}}>
			<div style={{fontSize: 64, lineHeight: '84px', color: '#5aa0ff', fontWeight: 600}}>‹</div>
			<div style={{width: 84, height: 84, borderRadius: 42, background: '#cf4a3c', overflow: 'hidden', flex: 'none'}}>
				<svg width={84} height={84} viewBox="-125 -150 250 250">
					<Head kind="teen" uid="g2bav" face={{eyes: 'open', mouth: 'smile', brows: 'neutral', blush: false}} />
				</svg>
			</div>
			<div>
				<div style={{position: 'relative', display: 'inline-block', fontWeight: 900, fontSize: 36, color: ring > 0.5 ? YELLOW : '#f2f2f2'}}>
					{HERO_NUMBER}
					{ring > 0 && <div style={{position: 'absolute', inset: '-14px -22px', border: `6px solid ${YELLOW}`, borderRadius: '50%', transform: `scale(${0.6 + 0.4 * ring}) rotate(-3deg)`, opacity: Math.min(1, ring)}} />}
				</div>
				<div style={{fontWeight: 600, fontSize: 26, color: '#8b93a3'}}>был в сети в 23:59</div>
			</div>
		</div>
		<StatusBar time={time} />
	</div>
);

// «ТВОЙ НОМЕР» chip with an arrow pointing down at the header
const Callout: React.FC<{p: number; x: number; y: number; text: string}> = ({p, x, y, text}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div style={{background: YELLOW, color: '#111', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, borderRadius: 18, padding: '8px 26px', boxShadow: '0 10px 24px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{text}</div>
			<div style={{width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `30px solid ${YELLOW}`}} />
		</div>
	) : null;

// white action lines (screen coords)
const Lines: React.FC<{x: number; y: number; o: number; dir?: 1 | -1; s?: number}> = ({x, y, o, dir = 1, s = 1}) =>
	o > 0.01 ? (
		<g stroke="#fff" strokeWidth={10 * s} strokeLinecap="round" opacity={o}>
			<line x1={x} y1={y - 60 * s} x2={x + dir * 70 * s} y2={y - 100 * s} />
			<line x1={x + dir * 10 * s} y1={y} x2={x + dir * 95 * s} y2={y} />
			<line x1={x} y1={y + 60 * s} x2={x + dir * 70 * s} y2={y + 100 * s} />
		</g>
	) : null;

// ============================================================== SHOTS =======
// 1. Recap of series 1: voice messages from tomorrow — from your own number.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f}>
			<G2.S01 />
		</Recap>
	);
};

// 2. Recap: «Не садись в лифт» → the lift got stuck ✓.
export const S02: React.FC = G2.S02;

// 3. Recap: «На физре не трогай мяч» ? → title card: series 2, what the viewers chose (as in «Папа»).
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [76]);
	if (i === 0) {
		return (
			<Recap f={t}>
				<Freeze frame={72}>
					<G1.S12 />
				</Freeze>
				<Stamp p={pop(t, 64, 10)} mark="q" label="МЯЧ" />
			</Recap>
		);
	}
	const a = pop(t, 2, 10);
	const b = pop(t, 10, 10);
	const c = pop(t, 20, 11);
	const d = pop(t, 34, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 58%, #04060d 100%)'}}>
			<div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 10, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>СЕРИЯ 2</div>
				<div style={{fontSize: 76, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>НЕ ТРОГАЙ МЯЧ</div>
				<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, background: 'rgba(14,14,16,0.92)', border: '6px solid #3b82f6', borderRadius: 24, padding: '12px 34px 16px', transform: `scale(${c})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
					<div style={{fontSize: 30, color: '#9cc2ff', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
						<div style={{width: 66, height: 66, borderRadius: 33, background: '#3b82f6', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>
						<div style={{fontSize: 54, color: '#fff'}}>ПОСЛУШАТЬСЯ</div>
					</div>
				</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 34, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 32px', fontSize: 36, transform: `scale(${d})`}}>СЕРИЯ 1 — В ПРОФИЛЕ</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 4. PE: the teacher blows the whistle and throws the ball right at you.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const S = 0.9;
	const blow = f >= 26 && f < 44;
	const up = interpolate(f, [44, 54], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const thrown = f >= 56;
	const rest = interpolate(f, [68, 86], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const hold: [number, number] = [75, -640 - 540 * up];
	const armR: [number, number] = thrown ? [80 + 70 * rest, -1180 + 710 * rest] : hold;
	const armL: [number, number] = [-armR[0], armR[1]];
	const fore = thrown ? 1 : 0.62 + 0.38 * up;
	const fly = interpolate(f, [56, 103], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const ballY0 = 1500 - (640 + 550 * up) * S;
	const bx = 540 + 90 * fly;
	const by = thrown ? ballY0 + (1050 - ballY0) * fly : ballY0;
	const bs = 0.72 + 4.2 * fly;
	return (
		<Stage cam={{s: lerp(f, 0, 105, 1.0, 1.05) * kick(f), cx: 540, cy: 980}} light={{glow: 0.3, vignette: 0.5}} bg="#dfe6d8">
			<Gym />
			<Max id="g2bs4m" x={120} y={1470} s={0.8} f={f} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.4, 0.2]}} />
			<Kids f={f} xs={[undefined, 990, 870]} y={1470} idp="g2bs4k" face={{eyes: 'open', mouth: 'flat', brows: 'neutral'}} />
			<Teacher
				id="g2bs4t"
				x={540}
				y={1500}
				scale={S}
				f={f}
				blow={blow}
				armL={armL}
				armR={armR}
				fore={fore}
				overhead={armR[1] < -880}
				face={blow ? {eyes: 'narrow', mouth: 'o', brows: 'angry'} : thrown ? {eyes: 'open', mouth: 'open', brows: 'raised', look: [0, 0.3]} : {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0, -0.3 * up]}}
			/>
			<Ball x={bx} y={by} s={bs} rot={f * 9} />
		</Stage>
	);
};

// 5. You hide your hands behind your back… → the ball drops right at your feet.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	const S = 1.15;
	if (i === 0) {
		const hide = lerp(t, 10, 28, 0, 1, Easing.inOut(Easing.cubic));
		const arm = (side: -1 | 1) => ({target: [side * (95 - 78 * hide), -335 - 85 * hide] as [number, number], bend: (side === -1 ? 1 : -1) as 1 | -1});
		const brace = t >= 24;
		const fly = t / 58;
		return (
			<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.06) * kick(t), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
				<Gym />
				<Person
					kind="teen"
					id="g2bs5"
					x={540}
					y={1640}
					scale={S}
					breathe={t}
					armsBehind={hide > 0.4}
					face={brace ? {eyes: 'closed', mouth: 'tight', brows: 'worried'} : {eyes: 'wide', mouth: 'flat', brows: 'raised', look: [0, 0.3]}}
					armL={arm(-1)}
					armR={arm(1)}
				/>
				{/* the ball comes at you in slow motion, heading for your feet */}
				<Ball x={860 - 190 * fly} y={640 + 560 * fly} s={2.5 - 1.1 * fly} rot={t * 5} />
				{brace && <Lines x={300} y={1000} o={0.7} dir={-1} s={1.1} />}
				{brace && <Lines x={780} y={1000} o={0.7} dir={1} s={1.1} />}
			</Stage>
		);
	}
	// floor-level close-up: your sneakers; the ball drops right in front of them and bounces
	const c: Cam = {s: 2.3 * kick(t, 0.05), cx: 540, cy: 1650};
	const R = 86 * 1.2;
	const ground = 1700;
	const bounces: [number, number, number][] = [
		[11, 25, 170],
		[25, 35, 70],
		[35, 41, 24],
	];
	let by = ground - R;
	if (t < 11) by = 1150 + (ground - R - 1150) * (t / 11) ** 2;
	for (const [a, b, h] of bounces) {
		if (t >= a && t < b) {
			const u = (t - a) / (b - a);
			by = ground - R - 4 * h * u * (1 - u);
		}
	}
	const squash = t >= 11 && t < 13 ? 0.86 : 1;
	const roll = interpolate(t, [41, 56], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const bx = 560 + 26 * roll;
	const hit = t >= 11 && t < 19;
	return (
		<Stage cam={c} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
			<Gym />
			<Person kind="teen" id="g2bs5b" x={540} y={1640} scale={S} breathe={t} armsBehind face={{eyes: 'closed', mouth: 'tight', brows: 'worried'}} armL={{target: [-17, -420], bend: 1}} armR={{target: [17, -420], bend: -1}} />
			<ellipse cx={bx} cy={ground + 4} rx={R * (0.6 + 0.4 * Math.min(1, (by - 1150) / (ground - R - 1150)))} ry={R * 0.16} fill="#000" opacity={0.25} />
			<g transform={`translate(${bx},${by + R * (1 - squash)}) scale(1,${squash}) translate(${-bx},${-by})`}>
				<Ball x={bx} y={by} s={1.2} rot={t * 4 + 30 * roll} />
			</g>
			{hit && (
				<g stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={1 - (t - 11) / 8}>
					{[-1, 1].map((d) => (
						<g key={d}>
							<line x1={bx + d * 130} y1={ground - 20} x2={bx + d * 190} y2={ground - 50} />
							<line x1={bx + d * 135} y1={ground + 6} x2={bx + d * 200} y2={ground + 6} />
						</g>
					))}
				</g>
			)}
		</Stage>
	);
};

// 6. The teacher yells: «Уснул, что ли? На скамейку!» → the whole class laughs.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	if (i === 0) {
		const point = lerp(t, 50, 58, 0, 1, Easing.out(Easing.cubic));
		const talk = (t >= 22 && t < 48) || (t >= 54 && t < 80);
		const open = talk && Math.floor(t / 4) % 2 === 0;
		const [sx, sy] = shake(t, 56, 14, 10);
		const S = 1.75;
		const X = 700;
		const Y = 2450;
		const armL: [number, number] = [-150 - 450 * point, -470 - 350 * point];
		const head = {x: X, y: Y - 1024 * S};
		return (
			<Stage cam={{s: kick(t) * (t >= 56 ? kick(t - 56, 0.05) : 1), cx: 540 + sx, cy: 960 + sy}} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
				<Gym />
				<Teacher id="g2bs6t" x={X} y={Y} scale={S} f={t} face={{eyes: 'narrow', brows: 'angry', mouth: open ? 'open' : 'tight', look: [-0.2 * point, 0.25]}} armL={armL} armR={[150, -470]} />
				{/* anger mark */}
				<g transform={`translate(${head.x + 78 * S},${head.y - 92 * S}) scale(${1 + 0.12 * Math.sin(t / 2)})`} stroke={RED} strokeWidth={13} strokeLinecap="round" fill="none">
					<path d="M -34,-10 Q -12,-12 -10,-34" />
					<path d="M 10,-34 Q 12,-12 34,-10" />
					<path d="M 34,10 Q 12,12 10,34" />
					<path d="M -10,34 Q -12,12 -34,10" />
				</g>
				{open && <Lines x={head.x - 96 * S} y={head.y + 60 * S} o={0.85} dir={-1} />}
			</Stage>
		);
	}
	const HA = [
		{x: 250, y: 560, at: 3, r: -12},
		{x: 830, y: 500, at: 9, r: 10},
		{x: 520, y: 420, at: 15, r: -4},
		{x: 160, y: 820, at: 21, r: 8},
		{x: 900, y: 780, at: 27, r: -10},
		{x: 600, y: 640, at: 33, r: 6},
	];
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(t, 0, 45, 1.2, 1.28) * kick(t), cx: 560, cy: 1100}} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
				<Gym />
				<Kids f={t} xs={[250, 470, 690]} y={1470} idp="g2bs6k" laugh face={{eyes: 'happy', mouth: 'grin', brows: 'raised'}} />
				{/* Max does not laugh */}
				<Max id="g2bs6m" x={905} y={1470} s={0.8} f={t} face={{eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [-0.5, 0.2]}} />
			</Stage>
			{HA.map((h, k) =>
				t >= h.at ? (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: h.x,
							top: h.y,
							transform: `translate(-50%,-50%) scale(${pop(t, h.at, 8)}) rotate(${h.r}deg)`,
							fontFamily: HEAVY,
							fontWeight: 900,
							fontSize: 92,
							color: '#fff',
							textShadow: '0 6px 0 #22222a, 4px 4px 0 #22222a, -4px 4px 0 #22222a, 4px -4px 0 #22222a, -4px -4px 0 #22222a',
						}}
					>
						ХА
					</div>
				) : null,
			)}
		</AbsoluteFill>
	);
};

// 7. Max picks up the ball — exactly where you just stood (you sit on the bench). The lamp hangs right above.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const c: Cam = {s: 0.85 * kick(f), cx: 540, cy: 1300};
	const walkIn = lerp(f, 0, 22, 0, 1, Easing.out(Easing.quad));
	const mx = 1180 + (SPOT - 1180) * walkIn;
	const dip = Math.sin(Math.min(1, Math.max(0, (f - 22) / 18)) * Math.PI);
	const lift = interpolate(f, [30, 38], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const reach: [number, number] = [-50, -300 + 120 * dip];
	const armsDown = {armL: {target: reach, bend: 1 as const}, armR: {target: [-reach[0], reach[1]] as [number, number], bend: -1 as const}};
	const holding = f >= 34;
	const ghost = interpolate(f, [46, 58], [0, 1], clamp);
	const pulse = 0.7 + 0.15 * Math.sin(f / 4);
	const tag = pop(f, 30, 11);
	const head = toScreen(c, mx, FLOOR + 20 + 60 * dip - 830 * MS);
	const ballY = holding ? FLOOR + 20 + 60 * dip - 440 * MS : FLOOR + 20 - 52 - (FLOOR + 20 - 52 - (FLOOR + 20 + 60 * dip - 300 * MS)) * lift;
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
				<Gym />
				<HangingLamp x={SPOT + 10} y={470} f={f} />
				<Bench x={10} w={430} floor={1490} />
				<SittingHero id="g2bs7h" x={225} floor={1490} s={0.95} f={f} face={{eyes: 'open', brows: 'sad', mouth: 'frown', look: [0.7, 0.4]}} />
				{ghost > 0 && (
					<g opacity={ghost * pulse}>
						<Person kind="teen" id="g2bs7g" x={SPOT} y={FLOOR + 20} scale={0.95} silhouette="#ffffff" />
					</g>
				)}
				{ghost > 0 && <ellipse cx={SPOT} cy={FLOOR + 24} rx={150} ry={26} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="22 16" opacity={ghost} />}
				<Max
					id="g2bs7m"
					x={mx}
					y={FLOOR + 20 + 60 * dip}
					f={f}
					walk={walkIn < 1 ? f * 0.55 : undefined}
					face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: holding ? [-0.6, 0.2] : [0, 0.7]}}
					arms={holding ? MAX_ARMS : f >= 22 ? armsDown : undefined}
				/>
				<Ball x={holding ? mx : SPOT + 30 - 30 * lift} y={ballY} s={0.6 * MS} rot={holding ? 0 : 20} />
			</Stage>
			{tag > 0.01 && (
				<div style={{position: 'absolute', left: head.x + 92, top: head.y + 40, transform: `translate(0,-50%) scale(${tag})`, transformOrigin: '0% 50%', display: 'flex', alignItems: 'center'}}>
					<div style={{width: 0, height: 0, borderTop: '18px solid transparent', borderBottom: '18px solid transparent', borderRight: '24px solid #3d8b5a'}} />
					<div style={{background: '#fff', border: '6px solid #3d8b5a', color: '#1d3a28', fontFamily: HEAVY, fontWeight: 900, fontSize: 52, borderRadius: 16, padding: '4px 24px', boxShadow: '0 8px 18px rgba(0,0,0,0.3)'}}>МАКС</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 8. Something creaks above Max → the old lamp hangs on its last wire.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [48]);
	if (i === 0) {
		const up = t >= 26;
		return (
			<Stage cam={{s: lerp(t, 0, 48, 1.0, 1.08) * kick(t) * (t >= 28 ? kick(t - 28, 0.04) : 1), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
				<Gym />
				<Max id="g2bs8m" x={540} y={1700} s={1.5} f={t} ball face={up ? {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0, -0.95]} : {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.3, 0.3]}} />
				{up &&
					Array.from({length: 14}).map((_, k) => (
						<circle key={k} cx={180 + rnd(k + 3) * 720} cy={-40 + ((t - 26 + rnd(k + 9) * 30) * (6 + rnd(k) * 5)) % 1300} r={3 + rnd(k + 2) * 5} fill="#8a8f86" opacity={0.75} />
					))}
			</Stage>
		);
	}
	const ring = pop(t, 35, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 60, 1.0, 1.12) * kick(t), cx: 560, cy: 830}} light={{glow: 0.25, vignette: 0.7}} bg="#c9d0c6">
			<Ceiling f={t + 20} spark={t >= 30 ? 1 : 0} />
			{ring > 0.01 && <ellipse cx={622} cy={250} rx={70 * (0.6 + 0.4 * ring)} ry={150 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={12} opacity={Math.min(1, ring)} />}
			{Array.from({length: 10}).map((_, k) => (
				<circle key={k} cx={420 + rnd(k + 1) * 400} cy={200 + ((t * (4 + rnd(k) * 4) + rnd(k + 7) * 600) % 1000)} r={3 + rnd(k + 4) * 4} fill="#8a8f86" opacity={0.7} />
			))}
		</Stage>
	);
};

// 9. You jump up from the bench: «Макс, в сторону!»
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const rise = lerp(f, 0, 9, 1, 0, Easing.out(Easing.cubic));
	const shout = f >= 26;
	const [sx, sy] = shake(f, 44, 16, 12);
	const c: Cam = {s: 1.8 * kick(f) * (f >= 44 ? kick(f - 44, 0.05) : 1), cx: 420 + sx, cy: 1060 + sy};
	const m = toScreen(c, 330 + 40 * 0.95, 1500 - 760 * 0.95);
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
				<Gym />
				<Bench x={10} w={430} floor={1490} />
				<Person
					kind="teen"
					id="g2bs9"
					x={330}
					y={1500 + 110 * rise}
					scale={0.95}
					breathe={f}
					face={shout ? {eyes: 'wide', mouth: 'open', brows: 'raised', look: [0.9, 0]} : {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.9, -0.3]}}
					armL={shout ? {target: [-40, -735], bend: 1, ku: 0.7, kf: 0.7} : {target: [-120, -420], bend: 1}}
					armR={{target: shout ? [390, -630] : [200, -560], bend: -1}}
				/>
			</Stage>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<Lines x={m.x + 30} y={m.y} o={shout ? 0.9 : 0} dir={1} s={1.4} />
			</svg>
		</AbsoluteFill>
	);
};

// 10. Max jumps aside — the lamp smashes where he stood.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const jump = lerp(f, 5, 23, 0, 1, Easing.out(Easing.cubic));
	const hop = Math.sin(Math.min(1, Math.max(0, (f - 5) / 18)) * Math.PI) * 50;
	const fall = interpolate(f, [31, 41], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const crashed = f >= 41;
	const [sx, sy] = shake(f, 41, 28, 16);
	const lampY = 470 + (FLOOR - 120 - 470) * fall;
	const ghost = interpolate(f, [58, 68], [0, 1], clamp);
	return (
		<Stage cam={{s: 0.85 * kick(f), cx: 540 + sx, cy: 1250 + sy}} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
			<Gym />
			<line x1={SPOT + 10} y1={-400} x2={SPOT + 10} y2={crashed ? 200 : lampY} stroke="#3a3f47" strokeWidth={6} opacity={crashed ? 0.5 : 1} />
			{ghost > 0 && <Max id="g2bs10g" x={SPOT} y={FLOOR + 20} f={f} silhouette="#ffffff" face={{}} />}
			{ghost > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill="#dfe6d8" opacity={0.6 * (1 - ghost)} />}
			<Max id="g2bs10m" x={SPOT - 330 * jump} y={FLOOR + 20 - hop} f={f} ball face={crashed ? {eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'raised', look: [0.9, 0.2]} : {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.6, -0.8]}} />
			{!crashed && (
				<g transform={`translate(${SPOT + 10},${lampY}) rotate(${-12 + 50 * fall})`}>
					<Lamp />
				</g>
			)}
			{crashed && <BrokenLamp x={SPOT + 10} y={FLOOR} t={f - 41} />}
			{crashed && f < 65 && (
				<g opacity={1 - (f - 41) / 24}>
					{Array.from({length: 12}).map((_, k) => (
						<circle key={k} cx={SPOT + (rnd(k + 2) - 0.5) * 420 * Math.min(1, (f - 41) / 10)} cy={FLOOR - 40 - rnd(k + 6) * 160 * Math.min(1, (f - 41) / 12)} r={20 + rnd(k) * 30} fill="#efe9dc" opacity={0.7} />
					))}
				</g>
			)}
			{crashed && <rect x={-400} y={-400} width={1880} height={2800} fill="#fff" opacity={interpolate(f, [41, 47], [0.6, 0], clamp)} />}
		</Stage>
	);
};

// 11. The whole gym is silent → Max slowly turns to you: «Откуда ты знал?»
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [42]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 42, 0.8, 0.84) * kick(t), cx: 560, cy: 1220}} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
					<Gym />
					<BrokenLamp x={SPOT + 10} y={FLOOR} t={60} />
					<Teacher id="g2bs11t" x={1090} y={1490} scale={0.88} f={t} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.8, 0.4]}} />
					<Max id="g2bs11m" x={SPOT - 330} y={FLOOR + 20} f={t} ball face={{eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'raised', look: [0.9, 0.7]}} />
					<Kids f={t} xs={[800, 900, 990]} y={1490} idp="g2bs11k" face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.6, 0.5]}} />
				</Stage>
				{/* silence: three dots appear one by one */}
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{[0, 1, 2].map((k) => {
						const p = pop(t, 6 + k * 8, 10);
						return p > 0.01 ? <circle key={k} cx={460 + k * 80} cy={470} r={22 * p} fill="#fff" stroke="#22222a" strokeWidth={6} /> : null;
					})}
				</svg>
			</AbsoluteFill>
		);
	}
	const turn = lerp(t, 0, 26, 0.85, 0, Easing.inOut(Easing.cubic));
	const ask = t >= 46;
	const talk = t >= 46 && t < 66 && Math.floor(t / 4) % 2 === 0;
	return (
		<DayClose t={t} zoom={[1, 1.1]} len={69}>
			<Bust
				kind="son"
				id="g2bs11b"
				colors={MAX}
				x={540}
				y={1000}
				scale={6.4}
				turn={turn}
				tilt={6 * turn}
				face={ask ? {eyes: 'narrow', brows: 'angry', mouth: talk ? 'o' : 'flat', look: [0, 0.05], blush: false} : {eyes: 'open', brows: 'raised', mouth: 'flat', look: [0.9 * turn, 0.1], blush: false}}
			/>
		</DayClose>
	);
};

// 12. Max shows his phone: a voice message from YOUR number, sent at 23:59.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	const chat = (ring: number, sentRing: number) => (
		<ContactChat time="10:41" ring={ring}>
			<VoiceBubble top={250} f={f} progress={0} ring={sentRing} />
		</ContactChat>
	);
	if (i === 0) {
		const up = lerp(t, 0, 22, 0, 1, Easing.out(Easing.cubic));
		return (
			<AbsoluteFill>
				<GymBlur />
				<MaxPhone x={540} y={1950 - 950 * up} w={680} rot={16 * (1 - up) - 3 * Math.sin(Math.min(1, t / 22) * Math.PI)} scale={0.92 + 0.08 * up}>
					{chat(0, 0)}
				</MaxPhone>
			</AbsoluteFill>
		);
	}
	// zoom on the header (your number) → then on the send time of the voice message
	const z1 = lerp(t, 0, 20, 0, 1, Easing.inOut(Easing.cubic));
	const z2 = lerp(t, 70, 94, 0, 1, Easing.inOut(Easing.cubic));
	const s = (1 + 0.6 * z1 + 0.3 * z2) * kick(t, 0.04);
	const cx = 300 + (512 - 300) * z2;
	const cy = 140 + (387 - 140) * z2;
	const X = 728 + (540 - 728) * z1 + (620 - 540) * z2;
	const Y = 459 + (660 - 459) * z1 + (780 - 660) * z2;
	const p = focus(680, cx, cy, X, Y, s);
	const callout = pop(t, 44, 11) * lerp(t, 62, 70, 1, 0);
	return (
		<AbsoluteFill>
			<GymBlur />
			<MaxPhone x={p.x} y={p.y} w={680} scale={s}>
				{chat(pop(t, 42, 10), pop(t, 104, 10))}
			</MaxPhone>
			<Callout p={callout} x={540} y={560} text="ТВОЙ НОМЕР" />
		</AbsoluteFill>
	);
};

// 13. It plays: «Макс, завтра на физре обязательно возьми мяч» — your voice.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 96, 1.55, 1.7) * kick(f, 0.05);
	const p = focus(680, 304, 330, 540, 760, s);
	const bad = f >= 74 && f < 90;
	const jx = bad ? (rnd(f) - 0.5) * 22 : 0;
	return (
		<AbsoluteFill>
			<GymBlur />
			<MaxPhone x={p.x + jx} y={p.y} w={680} scale={s}>
				<ContactChat time="10:41">
					<VoiceBubble top={250} f={f} progress={interpolate(f, [6, 92], [0.03, 0.98], clamp)} lvl={level('g13', f - 6)} redTail={interpolate(f, [72, 86], [0, 1], clamp)} />
				</ContactChat>
			</MaxPhone>
			{bad && <AbsoluteFill style={{background: RED, opacity: 0.12 + 0.1 * Math.sin(f * 2), mixBlendMode: 'multiply'}} />}
		</AbsoluteFill>
	);
};

// 14. It is your voice → but you would never say that (you shake your head).
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [36]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<DayClose t={t} zoom={[1.05, 1.14]} len={36}>
					<Bust kind="teen" id="g2bs14a" x={540} y={1000} scale={6.6} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [0, 0.1], blush: false}} />
				</DayClose>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{[0, 12, 24].map((d) => {
						const k = ((t + 36 - d) % 36) / 36;
						return <circle key={d} cx={540} cy={1000} r={420 + 420 * k} fill="none" stroke="#fff" strokeWidth={10} opacity={0.5 * (1 - k)} />;
					})}
				</svg>
			</AbsoluteFill>
		);
	}
	const shakeHead = Math.sin(t / 2.6) * Math.exp(-t / 45);
	return (
		<DayClose t={t} zoom={[1, 1.06]} len={60}>
			<Bust kind="teen" id="g2bs14b" x={540 + 26 * shakeHead} y={1000} scale={6.6} turn={0.75 * shakeHead} tilt={-3 * shakeHead} face={{eyes: 'open', brows: 'worried', mouth: 'frown', look: [0.5 * shakeHead, 0.1], blush: false}} />
		</DayClose>
	);
};

// 15. You open your own chat — the voice message about the ball is gone.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const G0 = 44;
	const G1_ = 66;
	const msgs = <VoiceBubble top={250} f={f} progress={1} />;
	const glitching = f >= G0 && f < G1_;
	return (
		<AbsoluteFill>
			<GymBlur />
			<Phone x={540 + (glitching ? (rnd(f) - 0.5) * 18 : 0)} y={1000} w={680} scale={lerp(f, 0, 93, 1.04, 1.14) * kick(f)}>
				<ChatScreen time="10:42">
					{f < G0 && msgs}
					{glitching && (
						<Glitch f={f} from={G0} to={G1_}>
							{msgs}
						</Glitch>
					)}
					{f >= G1_ && <Empty p={interpolate(f, [G1_, G1_ + 10], [0, 1], clamp)} />}
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 16. Your phone vibrates in the pocket → a new voice message. Also sent at 23:59.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [50]);
	if (i === 0) {
		const buzz = t >= 6 && t < 46 && Math.floor((t - 6) / 8) % 2 === 0;
		const jx = buzz ? Math.sin(t * 3.1) * 7 : 0;
		return (
			<Stage cam={{s: lerp(t, 0, 50, 1.0, 1.1) * kick(t), cx: 540, cy: 960}} light={{glow: 0.15, vignette: 0.7}} bg="#8a2f26">
				<rect x={-400} y={-400} width={1880} height={2800} fill="#cf4a3c" />
				{[-200, 100, 400, 700, 1000, 1300].map((x) => (
					<line key={x} x1={x} y1={-400} x2={x + 60} y2={2400} stroke="#b9402f" strokeWidth={6} opacity={0.5} />
				))}
				<line x1={420} y1={-400} x2={430} y2={760} stroke="#f7efe3" strokeWidth={14} strokeLinecap="round" />
				<line x1={660} y1={-400} x2={650} y2={760} stroke="#f7efe3" strokeWidth={14} strokeLinecap="round" />
				<path d="M 140,900 L 940,900 L 1020,1700 L 60,1700 Z" fill="#b13c30" />
				<path d="M 140,900 L 940,900" stroke="#9a3428" strokeWidth={12} />
				<g transform={`translate(${540 + jx},1260)`}>
					<rect x={-150} y={-280} width={300} height={560} rx={44} fill="#8f3026" />
					<rect x={-126} y={-252} width={252} height={504} rx={30} fill="#dfeaff" opacity={buzz ? 0.6 : 0.28} />
					{buzz && <rect x={-200} y={-330} width={400} height={660} rx={90} fill="#dfeaff" opacity={0.15} />}
				</g>
				{buzz && (
					<g stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85}>
						<path d="M 330,1100 q -30,60 0,120" />
						<path d="M 290,1080 q -40,80 0,160" />
						<path d="M 750,1100 q 30,60 0,120" />
						<path d="M 790,1080 q 40,80 0,160" />
					</g>
				)}
			</Stage>
		);
	}
	const z = lerp(t, 22, 44, 0, 1, Easing.inOut(Easing.cubic));
	const s = (1 + 0.75 * z) * (t >= 46 ? kick(t - 46, 0.06) : 1) * kick(t);
	const p = focus(680, 512, 387, 728 + (600 - 728) * z, 706 + (760 - 706) * z, s);
	return (
		<AbsoluteFill>
			<GymBlur />
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="10:43">
					{t < 5 && <Empty p={1} />}
					<div style={{position: 'absolute', inset: 0, transform: `scale(${pop(t, 5, 11)})`, transformOrigin: '10% 20%'}}>
						<VoiceBubble top={250} f={t} progress={0} ring={pop(t, 46, 10)} />
					</div>
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 17. «Молодец, что послушался…» plays → vision of tonight: 19:00, the trash bag, the front door — don't go out.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [70]);
	if (i === 0) {
		const s = lerp(t, 0, 70, 1.55, 1.7) * kick(t, 0.05);
		const p = focus(680, 304, 330, 540, 760, s);
		return (
			<AbsoluteFill>
				<GymBlur />
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="10:43">
						<VoiceBubble top={250} f={t} progress={interpolate(f, [6, 200], [0.03, 0.98], clamp)} lvl={level('g17', f - 6)} />
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	const c: Cam = {s: lerp(t, 0, 137, 1.0, 1.12), cx: 560, cy: 1000};
	const sp = toScreen(c, 570, 1000);
	return (
		<Vision f={t} label="СЕГОДНЯ · 19:00">
			<Stage cam={c} light={{glow: 0.2, vignette: 0.6}} bg="#000">
				<Hall id="g2bs17" bag={t >= 75 ? 0.5 + 0.5 * Math.sin((t - 75) / 4) : 0} />
				<Person kind="mom" id="g2bs17m" x={880} y={1500} scale={0.95} breathe={t} silhouette="#2a1414" />
			</Stage>
			<NoSign p={pop(t, 93, 9)} x={sp.x} y={sp.y} r={300} />
		</Vision>
	);
};

// 18. In the evening you slow the recording down… and finally make out the whisper.
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		const slow = t >= 18;
		const tap = interpolate(t, [14, 27], [0, 1], clamp);
		const s = lerp(t, 0, 56, 1.45, 1.6) * kick(t, 0.05);
		const p = focus(680, 304, 330, 540, 760, s);
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a2a4a 0%, #0b0710 65%)'}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="18:30">
						<VoiceBubble top={250} f={t} progress={slow ? interpolate(t, [18, 56], [0.55, 0.7], clamp) : interpolate(t, [0, 18], [0.4, 0.55], clamp)} lvl={0.4 + 0.3 * Math.abs(Math.sin(t / (slow ? 6 : 3)))} />
						<div
							style={{
								position: 'absolute',
								left: 170,
								top: 362,
								padding: '4px 16px',
								borderRadius: 16,
								background: slow ? YELLOW : '#3a3f4a',
								color: slow ? '#111' : '#cfd5e0',
								fontFamily: HEAVY,
								fontWeight: 900,
								fontSize: 26,
								transform: `scale(${slow ? 1 + 0.3 * pop(t, 18, 8) - 0.3 : 1})`,
							}}
						>
							{slow ? '0.5x' : '1x'}
						</div>
						{tap > 0 && tap < 1 && <div style={{position: 'absolute', left: 205 - 70 * tap, top: 380 - 70 * tap, width: 140 * tap, height: 140 * tap, borderRadius: '50%', border: '6px solid #fff', opacity: 1 - tap, boxSizing: 'border-box'}} />}
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	const wide = t >= 76;
	return (
		<Stage cam={{s: lerp(t, 0, 106, 1.0, 1.14) * kick(t), cx: 540, cy: 980}} light={{glow: 0, vignette: 0.85}} bg="#0b0710">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#2a2440" />
			<circle cx={900} cy={420} r={260} fill="#ffd27a" opacity={0.12} />
			<Bust kind="teen" id="g2bs18b" x={540} y={1050} scale={3.4} face={{eyes: wide ? 'wide' : 'narrow', pupil: wide ? 0.55 : 1, look: [0, 0.6], brows: wide ? 'raised' : 'worried', mouth: wide ? 'o' : 'flat', blush: false}} />
			<Headphones x={540} y={1050} s={3.4 * 0.78} />
			<rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.3} />
			<PhoneLight id="g2bs18pl" x={560} y={1900} r={1200} />
		</Stage>
	);
};

// 19. The whisper: «Это не ты».
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const words = [
		{w: 'ЭТО', at: 7},
		{w: 'НЕ', at: 24},
		{w: 'ТЫ', at: 34},
	];
	const jit = (k: number) => (rnd(f * 3 + k) - 0.5) * 10;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2a0507 0%, #000 70%)'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<path
					d={Array.from({length: 60}, (_, k) => `${k === 0 ? 'M' : 'L'} ${k * 18 + 10},${1250 + Math.sin(k * 1.3 + f) * 30 * level('g19', f - 7) + (rnd(k + f) - 0.5) * 18}`).join(' ')}
					stroke={RED}
					strokeWidth={5}
					fill="none"
					opacity={0.7}
				/>
			</svg>
			<div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 190, lineHeight: 1.05}}>
				{words.map((x, k) =>
					f >= x.at ? (
						<div key={k} style={{position: 'relative', transform: `scale(${pop(f, x.at, 9)}) translateX(${jit(k)}px)`}}>
							<span style={{position: 'absolute', left: 0, right: 0, color: '#00e5ff', opacity: 0.5, transform: 'translateX(-8px)'}}>{x.w}</span>
							<span style={{position: 'relative', color: k === 0 ? '#fff' : RED, textShadow: '6px 0 0 rgba(255,0,60,0.5)'}}>{x.w}</span>
						</div>
					) : (
						<div key={k} style={{height: 200}} />
					),
				)}
			</div>
		</AbsoluteFill>
	);
};

// 20. Exactly at seven: knock-knock, mom with a trash bag: «Сынок, вынеси мусор».
export const S20: React.FC = G2.S13;

// 21. Finale: stay home, or go out and check who is lying? Countdown, end card.
export const S21: React.FC = G2.S14;
