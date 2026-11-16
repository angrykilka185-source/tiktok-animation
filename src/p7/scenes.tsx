// Part 7 «Финал» (зрители выбрали: позвонить в полицию): 21 shots on the timeline of src/p7/timeline.ts.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY} from '../components/Overlays';
import {ArmPose, Bust, Colors, Face, Person} from '../components/Person';
import {BorschtBowl, Kitchen, Table} from '../components/Set';
import {Stage, toScreen} from '../components/Stage';
import * as P1 from '../scenes';
import {BigHand} from '../scenes/S01_S05';
import {Phone, SANS} from '../scenes/S12_S16';
import {Hall} from '../g2/scenes';
import {Bedroom, rnd} from '../g1/scenes';
import * as P4 from '../p4/scenes';
import * as P5 from '../p5/scenes';
import * as P6 from '../p6/scenes';

const {Shadow, Glint, Flashlight} = P4;
const {Recap, Yard, ShadowFace, RuleBroken} = P5;
const {Car, GarageFront, Legs, SitLegs, DadChat} = P6;

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const GREEN = '#7ee08a';
const NIGHT = '#0b1638';
const JACKET: Colors = {top: '#3a4a6a', topDark: '#2e3c58', pants: '#9fb8e0'};
const POLICE: Colors = {top: '#26344f', topDark: '#1b2740', pants: '#26344f', shoes: '#111216', hair: '#2a1a12'};
const NIGHTIE: Colors = {top: '#c9a6d6', topDark: '#b38fc2'};
const DAD_SKIN = '#e9b892';

// play another scene from its frame `at`
const Play: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => (
	<Sequence from={-at} layout="none">
		{children}
	</Sequence>
);

// ======================================================= scene pieces =====
// police flashers washing over everything
const Flashers: React.FC<{f: number; o?: number}> = ({f, o = 1}) => {
	const blue = Math.floor(f / 6) % 2 === 0;
	return <AbsoluteFill style={{background: blue ? '#2a6bff' : '#ff2a3a', opacity: 0.17 * o, mixBlendMode: 'screen'}} />;
};

// a police car seen from the side (local origin = ground under the middle, like <Car/>)
const PoliceCar: React.FC<{f: number; x: number; y: number; s: number}> = ({f, x, y, s}) => {
	const blue = Math.floor(f / 6) % 2 === 0;
	return (
		<g>
			<Car x={x} y={y} s={s} color="#eef1f5" />
			<g transform={`translate(${x},${y}) scale(${s})`}>
				<rect x={-266} y={-122} width={552} height={28} fill="#2456c8" />
				<text x={8} y={-60} fontSize={44} fontFamily={HEAVY} fontWeight={900} fill="#2456c8" textAnchor="middle">
					ПОЛИЦИЯ
				</text>
				<rect x={2} y={-258} width={124} height={28} rx={9} fill="#222" />
				<rect x={7} y={-254} width={55} height={20} rx={6} fill={blue ? '#3d7bff' : '#1b2238'} />
				<rect x={66} y={-254} width={55} height={20} rx={6} fill={blue ? '#3a1418' : '#ff3344'} />
				<circle cx={blue ? 34 : 94} cy={-244} r={120} fill={blue ? '#3d7bff' : '#ff3344'} opacity={0.22} />
			</g>
		</g>
	);
};

// a police officer (dad's proportions, plain uniform, a cap); torch = a flashlight in the viewer-right hand
const Officer: React.FC<{id: string; x: number; y: number; s: number; face?: Face; armL?: ArmPose; armR?: ArmPose; torch?: boolean; back?: boolean; walk?: number}> = ({id, x, y, s, face, armL, armR, torch, back, walk}) => {
	const headY = y - 1024 * s + (walk !== undefined ? -Math.abs(Math.sin(walk)) * 10 * s : 0);
	return (
		<g>
			<Person
				kind="dad"
				id={id}
				plain
				colors={POLICE}
				x={x}
				y={y}
				scale={s}
				back={back}
				walk={walk}
				face={face ?? {eyes: 'open', brows: 'flat', mouth: 'flat', blush: false}}
				armL={armL}
				armR={armR}
				itemR={
					torch ? (
						<g>
							<rect x={-13} y={-6} width={26} height={70} rx={6} fill="#26272b" />
							<circle cx={0} cy={66} r={16} fill="#fffbe6" />
						</g>
					) : undefined
				}
			/>
			<g transform={`translate(${x},${headY}) scale(${s})`}>
				<path d="M -90,-58 Q -96,-124 0,-132 Q 96,-124 90,-58 Z" fill="#1b2740" />
				<rect x={-96} y={-66} width={192} height={22} rx={8} fill="#121a2c" />
				{!back && <path d="M -74,-46 Q 0,-28 74,-46 L 66,-34 Q 0,-16 -66,-34 Z" fill="#0b111e" />}
				{!back && <circle cx={0} cy={-98} r={15} fill="#d9b44a" />}
			</g>
		</g>
	);
};

// the phone's lock screen with one notification (`note` = 0..1 pop)
const LockNote: React.FC<{time: string; day: string; from: string; avatar: string; avatarBg: string; text: string; note: number; textColor?: string}> = ({time, day, from, avatar, avatarBg, text, note, textColor = RED}) => (
	<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #2a3c6e 0%, #121a33 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
		<div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
			<div style={{fontSize: 32, fontWeight: 700, opacity: 0.85}}>{day}</div>
			<div style={{fontSize: 170, fontWeight: 800, lineHeight: 1.05}}>{time}</div>
		</div>
		{note > 0.01 && (
			<div style={{position: 'absolute', left: 22, right: 22, top: 430, transform: `scale(${note})`, transformOrigin: '50% 0%', background: 'rgba(245,245,250,0.95)', borderRadius: 30, padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'center', boxSizing: 'border-box'}}>
				<div style={{width: 80, height: 80, borderRadius: 40, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, flex: 'none'}}>{avatar}</div>
				<div style={{flex: 1}}>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<span style={{fontWeight: 900, fontSize: 32, color: '#111'}}>{from}</span>
						<span style={{fontSize: 24, color: '#666', fontWeight: 600}}>сейчас</span>
					</div>
					<div style={{fontWeight: 800, fontSize: 34, color: textColor, marginTop: 4, lineHeight: 1.15}}>{text}</div>
				</div>
			</div>
		)}
	</div>
);

// the dial pad: «1», «0», «2», call → «ПОЛИЦИЯ · 102 · вызов»
const Dialer: React.FC<{f: number}> = ({f}) => {
	const presses = [6, 14, 22];
	const n = presses.filter((p) => f >= p).length;
	const pressed = presses.findIndex((p) => f >= p && f < p + 5);
	const keyOf = ['1', '0', '2'];
	const calling = f >= 32;
	if (calling) {
		return (
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#16264a, #060c1a)', fontFamily: SANS, color: '#fff', textAlign: 'center'}}>
				<div style={{marginTop: 210, fontSize: 38, fontWeight: 700, opacity: 0.75}}>{Math.floor(f / 10) % 3 === 0 ? 'вызов.' : Math.floor(f / 10) % 3 === 1 ? 'вызов..' : 'вызов...'}</div>
				<div style={{fontSize: 150, fontWeight: 900, marginTop: 6, lineHeight: 1}}>102</div>
				<div style={{fontSize: 56, fontWeight: 900, color: '#7fb0ff', marginTop: 10, letterSpacing: 4}}>ПОЛИЦИЯ</div>
				<div style={{position: 'absolute', left: '50%', bottom: 150, width: 150, height: 150, marginLeft: -75, borderRadius: 75, background: '#e0342b'}} />
			</div>
		);
	}
	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
	return (
		<div style={{position: 'absolute', inset: 0, background: '#0b0d12', fontFamily: SANS, color: '#fff', textAlign: 'center'}}>
			<div style={{height: 150, marginTop: 120, fontSize: 120, fontWeight: 800, letterSpacing: 8}}>{'102'.slice(0, n)}</div>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 130px)', gap: '26px 40px', justifyContent: 'center', marginTop: 40}}>
				{keys.map((k) => {
					const hot = pressed >= 0 && keyOf[pressed] === k;
					return (
						<div key={k} style={{width: 130, height: 130, borderRadius: 65, background: hot ? '#e7e9ee' : '#2a2d35', color: hot ? '#111' : '#fff', fontSize: 58, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							{k}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: '50%', bottom: 120, width: 150, height: 150, marginLeft: -75, borderRadius: 75, background: f >= 27 ? '#5be37d' : '#34c759', transform: `scale(${f >= 27 && f < 32 ? 0.9 : 1})`}} />
		</div>
	);
};

// lying under the neighbour's car: its underside above, the asphalt below, garage №17 through the gap.
// legs = his legs/boots on the asphalt (they get bigger and lower when he comes closer)
const UnderCar: React.FC<{f: number; id: string; lift: number; zoom?: number; legs?: {x: number; y: number; s: number; ph?: number}; dy?: number; children?: React.ReactNode}> = ({f, id, lift, zoom = 1, legs, dy = 0, children}) => (
	<Stage cam={{s: zoom, cx: 540, cy: 1000, dy}} light={{glow: 0, vignette: 0.85}} bg="#020203">
		<defs>
			<clipPath id={`${id}gap`}>
				<rect x={-300} y={760} width={1680} height={460} />
			</clipPath>
			<linearGradient id={`${id}spill`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#ffe08a" stopOpacity={0.3 * lift} />
				<stop offset="100%" stopColor="#ffe08a" stopOpacity={0} />
			</linearGradient>
		</defs>
		<g clipPath={`url(#${id}gap)`}>
			<g transform="translate(205,222) scale(0.62)">
				<GarageFront f={f} id={`${id}g`} lift={lift} />
			</g>
		</g>
		{/* the asphalt between you and the garage */}
		<rect x={-300} y={1150} width={1680} height={1000} fill="#17181d" />
		<rect x={-300} y={1150} width={1680} height={760} fill={`url(#${id}spill)`} />
		{Array.from({length: 22}).map((_, k) => (
			<circle key={k} cx={rnd(k + 3) * 1080} cy={1200 + rnd(k + 40) * 700} r={3 + rnd(k + 9) * 5} fill="#2a2c33" />
		))}
		{legs && <Legs x={legs.x} y={legs.y} s={legs.s} ph={legs.ph} />}
		{/* the car's underside: sills, an exhaust pipe, an axle */}
		<path d="M -300,-300 L 1380,-300 L 1380,770 Q 540,736 -300,770 Z" fill="#0f1013" />
		<path d="M -300,742 Q 540,708 1380,742 L 1380,780 Q 540,746 -300,780 Z" fill="#1c1e24" />
		<rect x={-300} y={560} width={1680} height={34} fill="#18191e" />
		<path d="M 120,640 L 980,612" stroke="#26282f" strokeWidth={26} strokeLinecap="round" />
		<ellipse cx={1000} cy={612} rx={34} ry={22} fill="#26282f" />
		{/* the inner sides of the wheels */}
		<circle cx={-70} cy={980} r={250} fill="#0a0a0c" />
		<circle cx={-70} cy={980} r={120} fill="#141519" />
		<circle cx={1150} cy={980} r={250} fill="#0a0a0c" />
		<circle cx={1150} cy={980} r={120} fill="#141519" />
		{children}
		<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.18} />
	</Stage>
);

// a person lying on the ground, rolling sideways (feet at (x, y), head to the left): the body bobs and wobbles
const Roller: React.FC<{id: string; x: number; y: number; s: number; roll: number; face: Face}> = ({id, x, y, s, roll, face}) => {
	const bob = -Math.abs(Math.sin(roll)) * 16;
	const wob = Math.sin(roll) * 7;
	return (
		<g transform={`translate(${x},${y + bob}) rotate(${-90 + wob})`}>
			<Person kind="son" id={id} colors={JACKET} x={0} y={0} scale={s} face={face} armL={{target: [-50, -560], bend: 1}} armR={{target: [50, -560], bend: -1}} />
		</g>
	);
};

// the tape over dad's mouth
const Tape: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = -6}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-62} y={-24} width={124} height={48} rx={6} fill="#c9c8bf" />
		<rect x={-62} y={-24} width={124} height={10} fill="#e2e1d8" opacity={0.7} />
		<path d="M -62,-24 l -6,8 l 6,8 l -6,8 l 6,8 l -6,8 l 6,8 M 62,-24 l 6,8 l -6,8 l 6,8 l -6,8 l 6,8 l -6,8" stroke="#c9c8bf" strokeWidth={4} fill="none" />
	</g>
);

// your block's entrance at night (the same entrance the film showed later); open = the right door leaf swung out
const NightEntrance: React.FC<{open?: number; ring?: number}> = ({open = 0, ring = 0}) => (
	<g>
		<rect x={-500} y={-500} width={2100} height={2900} fill="#0b1230" />
		<rect x={-200} y={-200} width={1480} height={1700} fill="#4f4c55" />
		{Array.from({length: 4}).flatMap((_, r) =>
			Array.from({length: 4}).map((__, c) => {
				const mom = r === 3 && c === 2;
				const lit = mom || rnd(r * 7 + c + 3) > 0.8;
				return <rect key={`${r}-${c}`} x={-120 + c * 360} y={-100 + r * 260} width={150} height={150} fill={lit ? '#ffd27a' : '#232842'} />;
			}),
		)}
		{/* the lit stairwell behind the door */}
		<rect x={360} y={1020} width={360} height={480} fill="#2a332a" />
		<rect x={380} y={1040} width={320} height={460} fill="#ffd98a" opacity={0.85} />
		<rect x={380} y={1040} width={150} height={460} fill="#34433a" />
		<rect x={700 - 150 * (1 - 0.8 * open)} y={1040} width={150 * (1 - 0.8 * open)} height={460} fill="#34433a" />
		<rect x={320} y={980} width={440} height={40} fill="#5a5850" />
		<circle cx={540} cy={950} r={20} fill="#fff6c8" />
		<circle cx={540} cy={950} r={110} fill="#fff6c8" opacity={0.22} />
		<path d="M 520,960 L 560,960 L 780,1500 L 300,1500 Z" fill="#fff6c8" opacity={0.08} />
		<rect x={730} y={1180} width={60} height={90} rx={8} fill="#1d2026" />
		<rect x={500} y={900} width={80} height={40} rx={6} fill="#2a5a8a" />
		<text x={540} y={930} fontSize={30} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
			3
		</text>
		<rect x={-500} y={1500} width={2100} height={900} fill="#25262c" />
		<rect x={-500} y={1500} width={2100} height={10} fill="#33343c" />
		<rect x={820} y={1400} width={260} height={30} fill="#4a3a2a" />
		<rect x={840} y={1430} width={16} height={70} fill="#3a2a1e" />
		<rect x={1040} y={1430} width={16} height={70} fill="#3a2a1e" />
		<rect x={-500} y={-500} width={2100} height={2900} fill={NIGHT} opacity={0.2} />
		{ring > 0.01 && (
			<g opacity={Math.min(1, ring)}>
				<circle cx={675} cy={755} r={125 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={10} />
				<text x={675} y={600} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill="#fff" stroke="#111" strokeWidth={9} paintOrder="stroke">
					МАМА
				</text>
			</g>
		)}
	</g>
);

// inside the garage, seen from the open door: dad tied to a chair; `son` = you kneeling at his knees with the ropes
const GarageView: React.FC<{f: number; id: string; son?: 'back' | 'front'; dadFace: Face; tape?: boolean}> = ({f, id, son, dadFace, tape = false}) => {
	const sway = Math.sin(f / 14) * 3;
	const dS = 0.55;
	const floorY = 1450;
	const dHip = 1322;
	const work = Math.sin(f / 3) * 16;
	const sS = 0.62;
	const sHip = 1352;
	const sx = 455;
	return (
		<g>
			<rect x={160} y={520} width={760} height={960} fill="#5d6066" />
			{Array.from({length: 5}).map((_, k) => (
				<rect key={k} x={160} y={560 + k * 180} width={760} height={5} fill="#53565c" />
			))}
			<rect x={680} y={640} width={200} height={150} fill="#7a6a52" />
			<rect x={160} y={floorY - 20} width={760} height={100} fill="#8a8678" />
			<line x1={540 + sway} y1={520} x2={540 + sway} y2={640} stroke="#222" strokeWidth={3} />
			<circle cx={540 + sway} cy={652} r={14} fill="#fff6d0" />
			<circle cx={540 + sway} cy={652} r={90} fill="#fff6d0" opacity={0.18} />
			{/* the chair: back posts and the top rail behind dad, the seat */}
			<rect x={600 - 108} y={dHip - 205} width={14} height={floorY - dHip + 205} fill="#6a4a34" />
			<rect x={600 + 94} y={dHip - 205} width={14} height={floorY - dHip + 205} fill="#6a4a34" />
			<rect x={600 - 114} y={dHip - 212} width={228} height={20} rx={7} fill="#7a5638" />
			<rect x={600 - 116} y={dHip - 8} width={232} height={22} rx={6} fill="#7a5638" />
			<Person kind="dad" id={`${id}dad`} x={600} y={dHip + 470 * dS} scale={dS} hideLegs face={{stubble: true, ...dadFace}} armL={{target: [-100, -480], bend: 1}} armR={{target: [100, -480], bend: -1}} />
			{/* ropes round his chest and belly */}
			<rect x={600 - 92} y={dHip - 176} width={184} height={11} rx={5} fill="#d8c690" />
			<rect x={600 - 92} y={dHip - 130} width={184} height={11} rx={5} fill="#d8c690" />
			{tape && <Tape x={600} y={dHip + 470 * dS - (1024 - 0.58 * 104) * dS} s={dS * 0.9} />}
			<SitLegs x={600} hipY={dHip + 4} floorY={floorY} s={dS} />
			{/* the chair's front legs */}
			<rect x={600 - 116} y={dHip + 12} width={12} height={floorY - dHip - 12} fill="#5a3e2c" />
			<rect x={600 + 104} y={dHip + 12} width={12} height={floorY - dHip - 12} fill="#5a3e2c" />
			{son && (
				<g>
					{/* kneeling: shins on the floor, soles towards us */}
					{son === 'back' &&
						[-1, 1].map((d) => (
							<g key={d}>
								<rect x={sx + d * 26 - 22} y={sHip - 10} width={44} height={floorY - sHip + 4} rx={18} fill="#9fb8e0" />
								<ellipse cx={sx + d * 30} cy={floorY + 2} rx={30} ry={18} fill="#22252b" />
							</g>
						))}
					<Person
						kind="son"
						id={`${id}son`}
						colors={JACKET}
						x={sx}
						y={sHip + 330 * sS}
						scale={sS}
						hideLegs
						back={son === 'back'}
						face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false}}
						armL={son === 'back' ? {target: [170 + work, -300], bend: 1} : {target: [-120, -380], bend: 1}}
						armR={son === 'back' ? {target: [250 - work, -280], bend: -1} : {target: [120, -380], bend: -1}}
					/>
				</g>
			)}
		</g>
	);
};

// ============================================================== SHOTS =======
// 1. the same opening as parts 1–6
export const S01: React.FC = () => <P1.S01 />;

// 2. Recap: you followed him to garage №17.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 6">
			{i === 0 ? (
				<Freeze frame={40}>
					<P6.S09 />
				</Freeze>
			) : (
				<Freeze frame={64}>
					<P6.S10 />
				</Freeze>
			)}
		</Recap>
	);
};

// 3. Recap: inside — the real dad, tied up.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 6">
			<Freeze frame={60}>
				<P6.S15 />
			</Freeze>
		</Recap>
	);
};

// 4. Recap: and the door is rising right in front of you.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 6">
			<Play at={14}>
				<P6.S22 />
			</Play>
		</Recap>
	);
};

// 5. Title: part 7, the finale. You chose: call the police.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 22, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a2a10 0%, #1a1208 58%, #070503 100%)'}}>
			<div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 176, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 7</div>
				<div style={{fontSize: 96, color: YELLOW, marginTop: 6, letterSpacing: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ФИНАЛ</div>
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 46, background: '#121214', border: '7px solid #e0342b', borderRadius: 26, padding: '16px 30px', transform: `scale(${c})`}}>
					<div style={{width: 84, height: 84, borderRadius: 42, background: '#e0342b', color: '#fff', fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2</div>
					<div style={{textAlign: 'left'}}>
						<div style={{fontSize: 28, color: '#ff6b5e', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
						<div style={{fontSize: 46, color: '#fff'}}>ЗВОНИТЬ В ПОЛИЦИЮ</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 6. At the last second you roll under the neighbour's car.
//    a) from inside: the door rises — your face in the gap — you jerk away; b) you roll into the dark under the car
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [40]);
	if (i === 0) {
		const rise = interpolate(t, [0, 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
		const edge = 880 - 380 * rise;
		const away = interpolate(t, [18, 34], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
		return (
			<Stage cam={{s: 1.0 + 0.06 * rise, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#020203">
				<defs>
					<clipPath id="p7s6gap">
						<rect x={-200} y={edge} width={1480} height={1048 - edge} />
					</clipPath>
				</defs>
				<rect x={-500} y={-500} width={2200} height={3000} fill="#2e261f" />
				{Array.from({length: 7}).map((_, k) => (
					<rect key={k} x={-500} y={120 + k * 104} width={2200} height={8} fill="#251e18" />
				))}
				<g clipPath="url(#p7s6gap)">
					<rect x={-500} y={300} width={2200} height={800} fill="#0d0f16" />
					<g transform={`translate(${1150 * away},${20 * away})`}>
						<Bust kind="son" id="p7s6eyes" colors={JACKET} x={540} y={1010} scale={4.4} face={{eyes: 'wide', pupil: 0.5, look: [0.4, -0.3], brows: 'raised', mouth: t > 10 ? 'o' : 'flat', blush: false}} />
					</g>
					<rect x={-500} y={300} width={2200} height={800} fill="#ffe08a" opacity={0.25 * rise} />
				</g>
				<rect x={-500} y={edge - 16} width={2200} height={16} fill="#4a3d31" />
				<rect x={-500} y={1048} width={2200} height={1000} fill="#6b6658" />
				<rect x={-500} y={1048} width={2200} height={14} fill="#ffe08a" opacity={0.25 + 0.3 * rise} />
			</Stage>
		);
	}
	// side view: garage 17 (its door half up, light pouring out), the car in front of №18, you rolling under it
	const x = lerp(t, 0, 36, -260, 560, Easing.out(Easing.cubic));
	const roll = lerp(t, 0, 36, 0, 3 * Math.PI, Easing.out(Easing.cubic));
	const dark = interpolate(t, [28, 44], [0, 0.55], clamp);
	return (
		<Stage cam={{s: lerp(t, 0, 59, 1.0, 1.05), cx: 540, cy: 1420}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<defs>
				<linearGradient id="p7s6spill" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#ffe08a" stopOpacity={0.55} />
					<stop offset="65%" stopColor="#ffe08a" stopOpacity={0} />
				</linearGradient>
			</defs>
			<rect x={-500} y={-500} width={2200} height={1300} fill="url(#skyNight)" />
			<rect x={-500} y={700} width={2200} height={50} fill="#3a3f48" />
			<rect x={-500} y={750} width={2200} height={780} fill="#4a4f5a" />
			{[
				[-150, 17],
				[290, 18],
				[730, 19],
			].map(([gx, n]) => (
				<g key={n}>
					<rect x={gx} y={820} width={380} height={710} fill={n === 17 ? '#ffe9a8' : '#5d5248'} />
					{n === 17 && <rect x={gx} y={820} width={380} height={300} fill="#6b5a4a" />}
					{Array.from({length: n === 17 ? 3 : 7}).map((_, j) => (
						<rect key={j} x={gx} y={860 + j * 100} width={380} height={7} fill="#4e443c" />
					))}
					<text x={gx + 190} y={930} fontSize={56} fontFamily={HEAVY} fontWeight={900} fill="#d9d4c6" textAnchor="middle" opacity={0.85}>
						{n}
					</text>
				</g>
			))}
			<rect x={-500} y={1529} width={2200} height={700} fill="#24262f" />
			<rect x={-500} y={1529} width={2200} height={700} fill="url(#p7s6spill)" />
			<Roller id="p7s6roll" x={x + 470} y={1529 - 60} s={0.54} roll={roll} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'tight', blush: false}} />
			<Car x={640} y={1529 - 12 * 2.4} s={2.4} color="#5a6a7a" />
			{/* the shadow under the car swallows you */}
			<path d="M 100,1404 L 1160,1404 L 1160,1529 L 100,1529 Z" fill="#05070f" opacity={dark} />
			<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.22} />
		</Stage>
	);
};

// 7. You dial «102» and whisper: «Гараж семнадцать. Там мой папа».
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [42]);
	if (i === 0) {
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
				<Phone x={540} y={860} w={600} scale={lerp(t, 0, 42, 0.96, 1.0) * kick(t)} sleeve="#3a4a6a">
					<Dialer f={t} />
				</Phone>
			</AbsoluteFill>
		);
	}
	const talk = t >= 6 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 87, 1.0, 1.08), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#020203">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#07080c" />
			<Bust kind="son" id="p7s7face" colors={JACKET} x={500} y={880} scale={4.0} face={{eyes: 'wide', pupil: 0.6, brows: 'worried', mouth: talk ? 'o' : 'flat', look: [0.5, 0.1], blush: false}} />
			{/* the phone at your ear; its screen lights your cheek */}
			<ellipse cx={820} cy={900} rx={300} ry={380} fill="#9fc0ff" opacity={0.14} />
			<rect x={860} y={1040} width={150} height={620} rx={70} fill="#3a4a6a" transform="rotate(-14 935 1040)" />
			<g transform="rotate(10 845 880)">
				<rect x={780} y={740} width={130} height={270} rx={22} fill="#15161a" />
				<rect x={790} y={752} width={110} height={246} rx={16} fill="#cfe2ff" opacity={0.85} />
			</g>
			<ellipse cx={880} cy={1010} rx={66} ry={92} fill="#f2c3a0" transform="rotate(-14 880 1010)" />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#05070f" opacity={0.2} />
			{/* the car's underside right above your head */}
			<path d="M -300,-300 L 1380,-300 L 1380,380 Q 540,330 -300,380 Z" fill="#0f1013" />
			<path d="M -300,360 Q 540,312 1380,360 L 1380,390 Q 540,342 -300,390 Z" fill="#1c1e24" />
			{t >= 6 &&
				[0, 1, 2].map((k) => {
					const r = 26 + ((t * 3 + k * 22) % 60);
					return <path key={k} d={`M ${620 + r * 0.6},${1080 - r * 0.4} q ${r * 0.35},${r * 0.35} 0,${r * 0.8}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.55 * (1 - r / 86)} />;
				})}
		</Stage>
	);
};

// 8. The door opens. His boots come out and stop a step from your face.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const lift = lerp(f, 0, 36, 0.45, 1, Easing.inOut(Easing.sin));
	const come = interpolate(f, [30, 100], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const walking = f >= 30 && f < 100;
	const [sx, sy] = f >= 100 ? shake(f, 100, 10, 6) : [0, 0];
	return (
		<UnderCar f={f} id="p7s8" lift={lift} zoom={lerp(f, 0, 129, 1.0, 1.06)} dy={sy} legs={f >= 26 ? {x: 540 + 70 * come + sx, y: 1140 + 470 * come, s: 0.5 + 1.75 * come, ph: walking ? f * 0.3 : undefined} : undefined} />
	);
};

// 9. The phone buzzes: «Сынок, ты где?» You press it into the asphalt.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [66]);
	if (i === 0) {
		const buzz = t >= 4 && Math.floor((t - 4) / 7) % 2 === 0;
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
				<Phone x={540 + (buzz ? Math.sin(t * 2.9) * 10 : 0)} y={1000} w={680} scale={lerp(t, 0, 66, 1.0, 1.08) * kick(t)} sleeve="#3a4a6a">
					<LockNote time="03:19" day="четверг" from="Папа (вахта)" avatar="П" avatarBg="#33506e" text="Сынок, ты где?" note={pop(t, 4, 12)} />
				</Phone>
			</AbsoluteFill>
		);
	}
	// top-down: your hand presses the phone face down into the asphalt; its light leaks out round the edges
	const press = interpolate(t, [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const leak = (1 - interpolate(t, [12, 50], [0, 1], clamp)) * (Math.floor(t / 7) % 2 === 0 ? 1 : 0.6);
	const jx = t < 40 && Math.floor(t / 7) % 2 === 0 ? Math.sin(t * 3) * 4 : 0;
	return (
		<Stage cam={{s: lerp(t, 0, 78, 1.0, 1.06) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#121317">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#1c1d22" />
			{Array.from({length: 60}).map((_, k) => (
				<circle key={k} cx={rnd(k + 5) * 1080} cy={200 + rnd(k + 70) * 1500} r={3 + rnd(k + 11) * 7} fill={k % 3 ? '#26272d' : '#141519'} />
			))}
			<g transform={`translate(${jx},0)`}>
				{[64, 42, 22].map((g, k) => (
					<rect key={g} x={410 - g} y={640 - g} width={260 + 2 * g} height={480 + 2 * g} rx={40 + g} fill="#cfe2ff" opacity={leak * (0.12 + 0.1 * k)} />
				))}
				<rect x={410} y={640} width={260} height={480} rx={36} fill="#15161a" />
				<rect x={430} y={660} width={220} height={440} rx={28} fill="#1d1f25" />
			</g>
			{/* your hand pressing it down */}
			<g transform={`translate(0,${-30 * (1 - press)})`}>
				<rect x={445} y={1000} width={190} height={1000} rx={90} fill="#3a4a6a" />
				<rect x={445} y={1000} width={190} height={60} rx={26} fill="#2e3c58" />
				<ellipse cx={540} cy={900} rx={150} ry={135} fill="#f2c3a0" />
				<ellipse cx={398} cy={940} rx={38} ry={84} fill="#f2c3a0" transform="rotate(30 398 940)" />
				{[-100, -35, 30, 95].map((dx, k) => (
					<ellipse key={dx} cx={540 + dx} cy={752 - (k === 1 || k === 2 ? 14 : 0)} rx={32} ry={76} fill="#f2c3a0" />
				))}
				{[-68, 0, 64].map((dx) => (
					<path key={dx} d={`M ${540 + dx - 12},${840} q 12,-8 24,0`} stroke="#d9a284" strokeWidth={5} fill="none" strokeLinecap="round" />
				))}
			</g>
			<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.25} />
		</Stage>
	);
};

// 10. He stands… a long time. Then quickly walks off to your block. To mom.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		const go = interpolate(t, [42, 56], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
		return <UnderCar f={f} id="p7s10" lift={1} zoom={1.06} legs={{x: 610 - 900 * go, y: 1610, s: 2.25, ph: t >= 42 ? t * 0.35 : undefined}} />;
	}
	// your block's entrance: he walks in fast; up there — your window, mom is asleep
	const x = lerp(t, 0, 44, 1180, 560, Easing.inOut(Easing.sin));
	const gone = interpolate(t, [42, 50], [1, 0], clamp);
	return (
		<Stage cam={{s: lerp(t, 0, 55, 0.9, 0.95), cx: 560, cy: 1250}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
			<NightEntrance open={interpolate(t, [32, 44], [0, 1], clamp) * gone} ring={pop(t, 38, 10)} />
			<g opacity={gone}>
				<Shadow id="p7s10sh" x={x} y={1500} scale={0.36} />
			</g>
		</Stage>
	);
};

// 11. You run into the garage. Dad is tied to the chair, his mouth taped.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [40]);
	if (i === 0) {
		const run = interpolate(t, [0, 40], [0, 1], clamp);
		return (
			<Stage cam={{s: 1.2, cx: 540, cy: 1150}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<GarageFront f={f} id="p7s11g" lift={1} inside={<GarageView f={f} id="p7s11in" dadFace={{eyes: 'wide', brows: 'worried', mouth: 'flat', look: [0, 0.3]}} tape />} />
				<Person kind="son" id="p7s11son" colors={JACKET} back x={560} y={1980 - 420 * run} scale={1.0 - 0.45 * run} walk={t * 0.5} />
			</Stage>
		);
	}
	const sx = lerp(t, 0, 30, -80, 450, Easing.out(Easing.quad));
	return (
		<Stage cam={{s: lerp(t, 0, 68, 1.25, 1.35), cx: 640, cy: 1000}} light={{glow: 0.2, vignette: 0.85}} bg="#2a2218">
			<P6.GarageInside f={f} id="p7s11" dadFace={{eyes: 'wide', brows: 'worried', mouth: 'flat', look: [-0.8, 0]}} shadowX={-900} />
			<Tape x={770} y={708} s={0.95} />
			<Person kind="son" id="p7s11sonin" colors={JACKET} x={sx} y={1460} scale={0.85} walk={t < 30 ? t * 0.5 : undefined} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [0.8, 0], blush: false}} />
		</Stage>
	);
};

// 12. You rip off the tape. Dad croaks one word: «Карась». It's him. The real one.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const rip = interpolate(f, [8, 16], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const say = f >= 62 && f < 82 && Math.floor(f / 4) % 2 === 0;
	const word = pop(f, 68, 10);
	const real = pop(f, 91, 10);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 117, 1.0, 1.1) * kick(f), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.85}} bg="#2a2218">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#5d6066" />
				<circle cx={760} cy={260} r={240} fill="#fff6d0" opacity={0.2} />
				<Bust
					kind="dad"
					id="p7s12"
					x={540}
					y={860}
					scale={3.5}
					tilt={4}
					face={{eyes: f < 40 ? 'narrow' : 'open', brows: 'sad', mouth: f < 16 ? 'flat' : f < 40 ? 'o' : f < 62 ? 'flat' : say ? 'o' : 'smile', stubble: true, sweat: 0.4, tears: f >= 84 ? 0.5 : 0, look: [-0.2, 0.3], blush: false}}
				/>
				{rip < 1 && (
					<g transform={`translate(${700 * rip},${-260 * rip}) rotate(${50 * rip} 540 1071)`}>
						<Tape x={540} y={1071} s={3.5 * 0.9} rot={-6} />
					</g>
				)}
				{f >= 16 && f < 22 && <rect x={300} y={1020} width={480} height={100} rx={40} fill="#ff9a8a" opacity={0.25} />}
				<rect x={-100} y={1420} width={1280} height={40} rx={20} fill="#d8c690" />
				<rect x={-100} y={1500} width={1280} height={40} rx={20} fill="#c9b67c" />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1a08" opacity={0.15} />
			</Stage>
			{word > 0.01 && (
				<div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 130, color: YELLOW, transform: `scale(${word}) rotate(-4deg)`, textShadow: '0 8px 0 #000'}}>«КАРАСЬ»</div>
			)}
			{real > 0.01 && (
				<div style={{position: 'absolute', left: 540, top: 520, transform: `translate(-50%,-50%) scale(${2 - real}) rotate(-10deg)`, opacity: Math.min(1, real * 1.5), border: `9px solid ${GREEN}`, borderRadius: 18, padding: '4px 28px', fontFamily: HEAVY, fontWeight: 900, fontSize: 84, color: GREEN, background: 'rgba(5,20,8,0.6)', whiteSpace: 'nowrap'}}>
					✓ НАСТОЯЩИЙ
				</div>
			)}
		</AbsoluteFill>
	);
};

// 13. You fumble with the ropes, your back to the door. Rule five — broken.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 168, 1.45, 1.58), cx: 560, cy: 1120}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<GarageFront f={f} id="p7s13g" lift={1} inside={<GarageView f={f} id="p7s13in" son="back" dadFace={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.6, -0.4]}} />} />
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.2} />
			</Stage>
			<RuleBroken f={f} from={118} stampAt={146} />
		</AbsoluteFill>
	);
};

// 14. Steps behind you. A torch in your face… «Полиция! Где он?»
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [42]);
	if (i === 0) {
		const come = interpolate(t, [0, 36], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
		return (
			<Stage cam={{s: 1.5, cx: 560, cy: 1120}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<GarageFront f={f} id="p7s14g" lift={1} inside={<GarageView f={f} id="p7s14in" son={t >= 26 ? 'front' : 'back'} dadFace={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [-0.6, 0.2]}} />} />
				<Shadow id="p7s14sh" x={-120 + 440 * come} y={2350} scale={1.35} />
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.2} />
			</Stage>
		);
	}
	const cam = {s: lerp(t, 0, 66, 1.0, 1.06), cx: 540, cy: 1000};
	const hand: [number, number] = [150, -740];
	const s = 1.1;
	const hp = toScreen(cam, 540 + hand[0] * s, 1980 + hand[1] * s);
	const glare = interpolate(t, [0, 4, 14], [0, 1, 0.55], clamp);
	const shout = t >= 30 && t < 60 && Math.floor(t / 4) % 2 === 0;
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#0c1020" />
				<PoliceCar f={f} x={880} y={1500} s={0.9} />
				<rect x={-500} y={1500} width={2200} height={900} fill="#1c1e25" />
				<Officer id="p7s14cop" x={540} y={1980} s={s} torch armR={{target: hand, bend: -1}} armL={{target: [-170, -470], bend: 1}} face={{eyes: 'narrow', brows: 'angry', mouth: shout ? 'o' : 'flat', blush: false}} />
			</Stage>
			<Flashers f={f} o={1.2} />
			<AbsoluteFill style={{background: `radial-gradient(circle at ${hp.x}px ${hp.y}px, rgba(255,251,230,${glare}) 0px, rgba(255,251,230,${0.6 * glare}) 120px, rgba(255,251,230,0) 520px)`}} />
			<AbsoluteFill style={{background: '#fffbe6', opacity: interpolate(t, [0, 3, 9], [0, 0.9, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 15. The police run into your block. Mom opens the door, half asleep. He isn't in the flat.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56, 110]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 56, 0.9, 0.94), cx: 560, cy: 1250}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
					<NightEntrance open={1} />
					{[0, 1].map((k) => {
						const run = interpolate(t, [k * 8, 50 + k * 6], [0, 1], clamp);
						return (
							<g key={k} opacity={interpolate(run, [0.92, 1], [1, 0], clamp)}>
								<Officer id={`p7s15c${k}`} x={1150 + k * 120 - (590 + k * 120) * run} y={1500} s={0.34} back walk={t * 0.6 + k * 2} />
							</g>
						);
					})}
					<PoliceCar f={f} x={820} y={1780} s={1.05} />
				</Stage>
				<Flashers f={f} />
			</AbsoluteFill>
		);
	}
	if (i === 1) {
		const open = interpolate(t, [2, 18], [0, 0.75], {...clamp, easing: Easing.out(Easing.cubic)});
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 54, 1.0, 1.06), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
					<rect x={-500} y={-500} width={2200} height={1500} fill="#cfd3c6" />
					<rect x={-500} y={1000} width={2200} height={1600} fill="#4f8571" />
					<rect x={-500} y={994} width={2200} height={10} fill="#3d6a58" />
					<rect x={330} y={560} width={420} height={900} fill="#3a2a22" />
					{/* behind the door: the lit hallway and mom in her nightie, in the doorway */}
					<rect x={350} y={580} width={380} height={880} fill="#e8d4a8" />
					<rect x={350} y={1380} width={380} height={80} fill="#b38a5a" />
					<Person kind="mom" id="p7s15mom" plain colors={NIGHTIE} x={575} y={1458} scale={0.78} face={{eyes: 'narrow', brows: 'raised', mouth: t > 20 ? 'o' : 'flat', look: [0, 0.2], blush: false}} armL={{target: [-165, -560], bend: 1}} armR={{target: [90, -470], bend: -1}} />
					<path d={`M 350,580 L ${350 + 380 * (1 - open)},${580 - 16 * open} L ${350 + 380 * (1 - open)},${1460 + 16 * open} L 350,1460 Z`} fill="#4a3628" />
					<rect x={330} y={1460} width={420} height={14} fill="#2a1e18" />
					<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.3} />
				</Stage>
				<Flashers f={f} o={0.7} />
			</AbsoluteFill>
		);
	}
	// the dark flat: a torch beam goes over the hall — nobody
	const bx = lerp(t, 0, 40, 280, 820, Easing.inOut(Easing.sin));
	return (
		<Stage cam={{s: 1.05, cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<Hall id="p7s15h" dark={0.5} noBag />
			<Flashlight id="p7s15fl" x={bx} y={1000} r={420} dark={0.92} />
			{t >= 26 && (
				<text x={540} y={760} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill="#fff" stroke="#111" strokeWidth={12} paintOrder="stroke" opacity={pop(t, 26, 10)}>
					ПУСТО
				</text>
			)}
		</Stage>
	);
};

// 16. Only — on your pillow lies dad's phone (where your head was).
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const ring = pop(f, 54, 10);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 81, 1.0, 1.1), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#232c52" />
				<rect x={-500} y={360} width={2200} height={2200} fill="#cfcbdc" />
				{/* the pillow, a dent where your head was */}
				<path d="M 180,540 Q 160,450 270,452 L 810,452 Q 920,450 900,540 L 922,1150 Q 940,1250 830,1250 L 250,1250 Q 140,1250 158,1150 Z" fill="#eeebf6" />
				<path d="M 170,1180 Q 540,1240 910,1180 L 900,1250 L 180,1250 Z" fill="#d8d3e6" />
				<path d="M 230,500 Q 540,476 850,500" stroke="#dcd8e8" strokeWidth={8} fill="none" />
				<ellipse cx={540} cy={860} rx={250} ry={190} fill="#e0dcec" />
				{/* the blanket thrown back */}
				<path d="M -300,1300 C 100,1240 900,1240 1380,1300 L 1380,2400 L -300,2400 Z" fill="#4b69a6" />
				<path d="M -300,1300 C 100,1240 900,1240 1380,1300" stroke="#6f8cc8" strokeWidth={36} fill="none" />
				<g transform="translate(540,860) rotate(-14)">
					<rect x={-130} y={-240} width={260} height={480} rx={36} fill="#15161a" />
					<rect x={-116} y={-226} width={232} height={452} rx={26} fill="#2d6cdf" opacity={0.95} />
					<rect x={-96} y={-150} width={192} height={60} rx={20} fill="#fff" opacity={0.9} />
					<rect x={-96} y={-70} width={150} height={50} rx={18} fill="#fff" opacity={0.8} />
					<rect x={-96} y={0} width={180} height={50} rx={18} fill="#fff" opacity={0.8} />
					<text x={0} y={-112} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#2d6cdf">
						Сынок, ты где?
					</text>
				</g>
				<ellipse cx={540} cy={860} rx={420} ry={420} fill="#cfe2ff" opacity={0.08 + 0.04 * Math.sin(f / 4)} />
				{ring > 0.01 && <ellipse cx={540} cy={860} rx={240 * (0.6 + 0.4 * ring)} ry={330 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={10} opacity={Math.min(1, ring)} />}
				<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.35} />
			</Stage>
			<Flashers f={f} o={0.5} />
		</AbsoluteFill>
	);
};

// 17. They search for him all night. And don't find him.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [40]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Stage cam={{s: 1.05, cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
					<Yard f={f} id="p7s17y" light={0.3} />
					{[0, 1, 2].map((k) => {
						const a = Math.sin(t / 9 + k * 2) * 40;
						const bx = 180 + k * 330;
						return <path key={k} d={`M ${bx},1420 L ${bx + a * 6 - 160},880 L ${bx + a * 6 + 160},880 Z`} fill="#fffbe6" opacity={0.16} />;
					})}
				</Stage>
				<Flashers f={f} />
			</AbsoluteFill>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 32, 1.15, 1.22), cx: 640, cy: 1150}} light={{glow: 0.15, vignette: 0.85}} bg="#2a2218">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#5d6066" />
			{Array.from({length: 9}).map((_, k) => (
				<rect key={k} x={-500} y={-400 + k * 220} width={2200} height={6} fill="#53565c" />
			))}
			<rect x={-500} y={1400} width={2200} height={1200} fill="#8a8678" />
			<line x1={540} y1={-500} x2={540} y2={330} stroke="#222" strokeWidth={4} />
			<circle cx={540} cy={350} r={24} fill="#fff6d0" />
			<rect x={640} y={1180} width={260} height={26} fill="#7a5638" />
			{[660, 880].map((x) => (
				<rect key={x} x={x - 10} y={1200} width={20} height={240} fill="#6a4a34" />
			))}
			<rect x={650} y={860} width={240} height={330} rx={10} fill="#6a4a34" />
			{/* cut ropes on the floor */}
			<path d="M 560,1450 q 60,-30 120,0 t 120,0 M 720,1470 q 40,20 90,-6 M 600,1490 q 70,10 150,-10" stroke="#d8c690" strokeWidth={14} fill="none" strokeLinecap="round" />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1a08" opacity={0.2} />
		</Stage>
	);
};

// 18. Morning. Dad is in the kitchen. Smells of diesel. Eats borscht — with his LEFT hand.
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	if (i === 0) {
		// his LEFT hand (viewer-right): spoon from the bowl to the mouth and back; the right hand rests on the table
		const cyc = (t % 40) / 40;
		const up = cyc < 0.35 ? 0 : cyc < 0.6 ? (cyc - 0.35) / 0.25 : cyc < 0.8 ? 1 : 1 - (cyc - 0.8) / 0.2;
		const smell = interpolate(t, [40, 52], [0, 1], clamp);
		return (
			<Stage cam={{s: lerp(t, 0, 84, 1.0, 1.08), cx: 520, cy: 1000}} light={{glow: 0.35, vignette: 0.5}}>
				<Kitchen id="p7s18k" floorY={1300} clock={[8, 15]} tick={f / 30} sky="#9fd3ff" />
				<Person
					kind="dad"
					id="p7s18dad"
					hideLegs
					x={420}
					y={1400 + 470 * 1.05 - 30}
					scale={1.05}
					breathe={t}
					face={{eyes: 'happy', mouth: up > 0.8 ? 'o' : 'smile', brows: 'raised', stubble: true, look: [0.4, 0.6]}}
					armL={{target: [-80, -450], bend: 1, ku: 0.8, kf: 0.7}}
					armR={{target: [171 - 135 * up, -450 - 505 * up], bend: -1, ku: 0.85, kf: 0.75}}
					itemR={
						<g transform="rotate(200)">
							<rect x={-6} y={-90} width={12} height={90} rx={5} fill="#c9ced6" />
							<ellipse cx={0} cy={-104} rx={22} ry={30} fill="#c9ced6" />
						</g>
					}
				/>
				<Table y={1400} />
				<g transform="translate(600,1430)">
					<BorschtBowl steam={f / 30} scale={0.95} />
				</g>
				{/* the smell of diesel from his work jacket (from the shoulders, not the mouth) */}
				{smell > 0 &&
					[0, 1, 2, 3].map((k) => {
						const ph = (t * 2 + k * 24) % 90;
						const bx = [230, 290, 560, 620][k];
						return <path key={k} d={`M ${bx},${1150 - ph * 2} c -26,-36 26,-62 0,-98 c -26,-36 26,-62 0,-98`} stroke="#6f7d4e" strokeWidth={13} fill="none" strokeLinecap="round" opacity={smell * 0.7 * (1 - ph / 90)} />;
					})}
			</Stage>
		);
	}
	const ring = pop(t, 22, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 48, 1.0, 1.06) * kick(t), cx: 540, cy: 1000}} light={{glow: 0.3, vignette: 0.55}}>
			<rect x={-200} y={-200} width={1500} height={1000} fill="#f0dcb0" />
			<rect x={-200} y={720} width={1500} height={1500} fill="#e7553f" />
			{Array.from({length: 24}).map((_, k) => (
				<rect key={k} x={-200 + k * 80} y={720} width={40} height={1500} fill="#f4efe6" opacity={0.5} />
			))}
			<g transform="translate(560,1300)">
				<BorschtBowl steam={f / 30} scale={2.2} />
			</g>
			<BigHand x={760} y={960} rot={20} spoon thumb={-1} scar />
			{ring > 0.01 && <circle cx={745} cy={960} r={200 * (0.7 + 0.3 * ring)} fill="none" stroke={GREEN} strokeWidth={12} opacity={ring} />}
			<text x={760} y={680} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill="#fff" stroke="#111" strokeWidth={10} paintOrder="stroke" opacity={ring} transform="rotate(-4 760 680)">
				ЛЕВАЯ
			</text>
		</Stage>
	);
};

// 19. He calls you «тигрёнок» (his hands on your shoulders). And mom cries — now really from happiness.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const hug = interpolate(f, [2, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const say = f >= 18 && f < 40 && Math.floor(f / 4) % 2 === 0;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 153, 1.0, 1.08), cx: 560, cy: 1000}} light={{glow: 0.4, vignette: 0.45}}>
				<Kitchen id="p7s19k" floorY={1300} clock={[8, 20]} tick={f / 30} sky="#9fd3ff" />
				<Person
					kind="dad"
					id="p7s19dad"
					x={440}
					y={1720}
					scale={0.95}
					breathe={f}
					face={{eyes: 'happy', mouth: say ? 'o' : 'grin', brows: 'raised', stubble: true, tears: 0.3}}
					armL={{target: [-40 + 20 * hug, -640 + 40 * hug], bend: 1, ku: 0.95, kf: 0.9}}
					armR={{target: [150 - 10 * hug, -640 + 40 * hug], bend: -1, ku: 0.95, kf: 0.9}}
				/>
				<Person kind="son" id="p7s19son" x={500} y={1735} scale={0.9} breathe={f} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', tears: 0.4}} armL={{target: [-90, -300], bend: 1}} armR={{target: [90, -300], bend: -1}} />
				<Person kind="mom" id="p7s19mom" x={820} y={1720} scale={0.95} breathe={f} face={{eyes: 'happy', mouth: 'smile', brows: 'raised', tears: interpolate(f, [50, 80], [0.2, 1], clamp)}} armL={{target: [-30, -690], bend: 1, ku: 0.8, kf: 0.8}} armR={{target: [30, -690], bend: -1, ku: 0.8, kf: 0.8}} />
			</Stage>
			{f >= 22 && (
				<div style={{position: 'absolute', left: 140, top: 330, transform: `scale(${pop(f, 22, 10)})`, transformOrigin: '30% 100%', background: '#fff', borderRadius: 40, padding: '18px 34px', fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: '#111', boxShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
					ТИГРЁНОК!
					<div style={{position: 'absolute', left: 150, bottom: -30, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '34px solid #fff'}} />
				</div>
			)}
		</AbsoluteFill>
	);
};

// 20. At night — a message from an unknown number: «Карась. Я запомнил, тигрёнок».
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [40]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 40, 1.15, 1.25), cx: 400, cy: 1080}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<Bedroom f={f} id="p7s20b" glow={t >= 8 ? 1 : 0} buzz={t >= 8} eyes={t >= 24 ? 'open' : 'closed'} kind="son" />
			</Stage>
		);
	}
	const glitch = t >= 70 ? (rnd(Math.floor(t / 2)) - 0.5) * 16 : 0;
	const face = interpolate(t, [72, 100], [0, 0.35], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #2a0d12 0%, #05070f 65%)'}}>
			<Phone x={540 + glitch} y={1000} w={680} scale={lerp(t, 0, 119, 1.05, 1.18) * kick(t)} sleeve="#3a4a6a">
				<LockNote time="23:47" day="четверг" from="Неизвестный номер" avatar="?" avatarBg="#5a5f66" text="Карась. Я запомнил, тигрёнок." note={pop(t, 4, 12)} />
				{face > 0 && (
					<svg width={648} height={1362} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: face}}>
						<ShadowFace x={540} headY={1300} s={3.2} eyes={1} smile={1} />
					</svg>
				)}
			</Phone>
			{t >= 70 && <AbsoluteFill style={{background: '#ff0030', mixBlendMode: 'screen', opacity: 0.12 + 0.08 * Math.sin(t)}} />}
		</AbsoluteFill>
	);
};

// 21. The end: who is he? Write in the comments.
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 12);
	const q = pop(f, 44, 10);
	const c = pop(f, 92, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #4a0d10 0%, #1a0607 55%, #0a0304 100%)'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
				<ShadowFace x={540} headY={1450} s={2.6} eyes={interpolate(f, [110, 130], [0, 1], clamp)} smile={interpolate(f, [140, 160], [0, 1], clamp)} />
			</svg>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 210, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${a})`}}>КОНЕЦ</div>
				<div style={{fontSize: 92, color: RED, marginTop: 30, transform: `scale(${q})`, textShadow: '0 6px 0 #000'}}>КТО ОН ТАКОЙ?</div>
				<div style={{display: 'inline-block', marginTop: 44, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 34px', fontSize: 44, transform: `scale(${c})`}}>ПИШИ В КОММЕНТАРИЯХ</div>
				<div style={{fontSize: 34, color: '#b9a9aa', marginTop: 26, letterSpacing: 2, opacity: c}}>ЧАСТИ 1–7 — В ПРОФИЛЕ</div>
				<div style={{display: 'inline-block', marginTop: 40, background: '#ff2d3d', borderRadius: 60, padding: '22px 70px', fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(255,45,61,0.6)', transform: `scale(${pop(f, 122, 10) * (1 + Math.sin(f / 5) * 0.04)})`}}>
					ПОДПИШИСЬ
				</div>
			</div>
		</AbsoluteFill>
	);
};
