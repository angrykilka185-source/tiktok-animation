import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {blinkAt, clamp, kick, lerp, pop, seg, shake} from '../anim';
import {Cross, HEAVY} from '../components/Overlays';
import {Bust, Person} from '../components/Person';
import {FamilyPhoto, Kitchen, PlankFloor, Table, Tiles, Wallpaper} from '../components/Set';
import {Cam, Stage} from '../components/Stage';
import * as P1 from '../scenes';
import {Phone, SANS} from '../scenes/S12_S16';
import {RECAP_STEP} from './timeline';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';

// ------------------------------------------------------------- props -------
const Mug: React.FC<{x: number; y: number; steam?: number}> = ({x, y, steam = 0}) => (
	<g transform={`translate(${x},${y})`}>
		{[-14, 6, 26].map((sx, i) => (
			<path key={sx} d={`M ${sx},-120 c -10,-16 10,-28 0,-44 c -10,-16 10,-28 0,-44`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.45 * Math.abs(Math.sin(steam / 20 + i))} />
		))}
		<rect x={-52} y={-110} width={104} height={110} rx={14} fill="#e8eef2" />
		<rect x={-52} y={-110} width={104} height={20} rx={8} fill="#7a3b2a" />
		<path d="M 52,-82 q 36,4 34,34 q -2,26 -34,26" stroke="#e8eef2" strokeWidth={14} fill="none" />
	</g>
);

// table setting shared by the kitchen shots of part 2
const tableY = 1400;
const D = {x: 560, y: tableY + 470 * 1.05 - 30, s: 1.05};
const toDad = (wx: number, wy: number): [number, number] => [(wx - D.x) / D.s, (wy - D.y) / D.s];

const KitchenTable: React.FC<{f: number; dadFace: React.ComponentProps<typeof Person>['face']; stir?: boolean; point?: boolean; mom?: React.ReactNode; son?: boolean}> = ({
	f,
	dadFace,
	stir = true,
	point = false,
	mom,
	son = true,
}) => {
	const mug = {x: 720, y: tableY + 24};
	const a = f / 4;
	const hand: [number, number] = stir ? toDad(mug.x + Math.cos(a) * 14, mug.y - 120 + Math.sin(a) * 6) : toDad(mug.x - 40, tableY + 8);
	return (
		<g>
			<Kitchen id="p2k" floorY={1300} clock={[7, 15]} tick={f / 30} />
			{mom}
			<Person
				kind="dad"
				id="p2dad"
				hideLegs
				x={D.x}
				y={D.y}
				scale={D.s}
				face={dadFace}
				armL={point ? {target: toDad(250, 1250), bend: 1, ku: 0.9, kf: 0.9} : {target: toDad(420, tableY + 8), bend: 1, ku: 0.85, kf: 0.7}}
				armR={{target: hand, bend: -1, ku: 0.75, kf: 0.8}}
			/>
			<Table y={tableY} />
			<Mug x={mug.x} y={mug.y} steam={f} />
			{stir && <line x1={D.x + hand[0] * D.s} y1={D.y + hand[1] * D.s} x2={mug.x + 4} y2={mug.y - 60} stroke="#c9ced6" strokeWidth={8} strokeLinecap="round" />}
			{son && <Person kind="son" id="p2son" back x={250} y={2330} scale={1.55} armL={{shoulder: 4, elbow: 0}} armR={{shoulder: -4, elbow: 0}} />}
		</g>
	);
};

// ---------------------------------------------------------------- SHOT 1 ---
// Same opening as part 1 (people who see part 2 first get the setup).
export const S01: React.FC = () => <P1.S01 />;

// ---------------------------------------------------------------- SHOT 2 ---
// "В прошлой серии": six frozen shots of part 1 flash by, plaques fly into the counter.
const RECAP: {C: React.FC; frame: number}[] = [
	{C: P1.S03, frame: 100},
	{C: P1.S04, frame: 105},
	{C: P1.S05, frame: 30},
	{C: P1.S07, frame: 104},
	{C: P1.S08, frame: 40},
	{C: P1.S13, frame: 112},
];
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const t0 = f - 4;
	const k = Math.min(RECAP.length, Math.max(0, Math.floor(t0 / RECAP_STEP)));
	const last = k >= RECAP.length;
	const item = last ? {C: P1.S13, frame: 124} : RECAP[k];
	const t = last ? t0 - RECAP.length * RECAP_STEP : t0 - k * RECAP_STEP;
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
			<div
				style={{
					position: 'absolute',
					left: 40,
					top: 250,
					background: '#111',
					border: `5px solid ${YELLOW}`,
					borderRadius: 14,
					padding: '8px 22px',
					fontFamily: HEAVY,
					fontWeight: 900,
					fontSize: 40,
					color: '#fff',
					letterSpacing: 2,
				}}
			>
				◀◀ ЧАСТЬ 1
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
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #4a0d10 0%, #1a0607 58%, #0a0304 100%)'}}>
			<div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 900, color: '#fff', opacity: 0.05, lineHeight: 1}}>?</div>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 200, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 2</div>
				<div style={{fontSize: 66, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>КОНТРОЛЬНЫЙ ВОПРОС</div>
				<div style={{display: 'inline-block', marginTop: 56, background: YELLOW, color: '#111', borderRadius: 18, padding: '12px 36px', fontSize: 40, transform: `scale(${c})`}}>
					ЧАСТЬ 1 — В ПРОФИЛЕ
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 4 ---
// Morning, kitchen: you sit opposite him and ask «Пап, какое наше слово?»
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [72]);
	if (i === 1) {
		const talking = t > 6 && t < 64 && Math.floor(t / 4) % 2 === 0;
		return (
			<Stage cam={{s: lerp(t, 0, 78, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#e9d6b0">
				<Wallpaper id="p2s4wp" x={-300} y={-300} w={1700} h={1500} base="#f0dcb0" line="#dfc490" />
				<Tiles y={1150} h={1200} />
				<Bust kind="son" id="p2s4cu" x={540} y={980} scale={3.6} face={{eyes: 'open', brows: 'worried', mouth: talking ? 'open' : 'tight', look: [0.2, -0.3], blink: blinkAt(t, 1, 80)}} />
			</Stage>
		);
	}
	return (
		<Stage cam={{s: lerp(f, 0, 72, 1.0, 1.06), cx: 540, cy: 1000}} light={{glow: 0.35, vignette: 0.5}}>
			<KitchenTable f={f} dadFace={{eyes: 'open', mouth: 'smile', stubble: true, look: [-0.4, 0.5], blink: blinkAt(f, 2, 90)}} />
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 5 ---
// Flashback: summer, the boat — the secret word you and dad made up.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const bob = Math.sin(f / 10) * 6;
	const label = pop(f, 10, 11);
	const dots = Math.floor(f / 8) % 4;
	return (
		<Stage
			cam={{s: lerp(f, 0, 120, 1.0, 1.08), cx: 540, cy: 1000}}
			light={{glow: 0.55, vignette: 0.65, tint: '#c98a3a', tintOpacity: 0.16}}
			bg="#f3b16b"
			overlay={
				<div style={{position: 'absolute', left: 540, top: 420, transform: `translate(-50%,-50%) scale(${label}) rotate(-2deg)`, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
					<div style={{background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 16, padding: '10px 30px 12px'}}>
						<div style={{fontSize: 46, color: '#fff'}}>ПРИДУМАЛИ НА РЫБАЛКЕ</div>
						<div style={{fontSize: 32, color: YELLOW, letterSpacing: 2}}>НИГДЕ НЕ ЗАПИСАНО</div>
					</div>
				</div>
			}
		>
			<defs>
				<linearGradient id="p2sunset" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#f6c27a" />
					<stop offset="100%" stopColor="#f08a5d" />
				</linearGradient>
			</defs>
			<rect x={-300} y={-300} width={1700} height={1450} fill="url(#p2sunset)" />
			<circle cx={800} cy={860} r={120} fill="#ffe3a3" />
			<path d="M -300,1080 Q 0,980 300,1060 T 900,1040 T 1400,1070 L 1400,1160 L -300,1160 Z" fill="#3f5f3a" />
			<rect x={-300} y={1140} width={1700} height={1200} fill="#4f86a8" />
			{Array.from({length: 10}).map((_, k) => (
				<rect key={k} x={-200 + ((k * 230 + f * 2) % 1500)} y={1200 + k * 60} width={160} height={6} rx={3} fill="#a9d3ea" opacity={0.6} />
			))}
			{[60, 90, 120, 150].map((x) => (
				<path key={x} d={`M ${x},1300 q 10,-160 -10,-300`} stroke="#4f7a3a" strokeWidth={8} fill="none" />
			))}
			{/* fishing lines and floats */}
			<line x1={760} y1={760} x2={980} y2={1330 + bob} stroke="#222" strokeWidth={3} />
			<circle cx={980} cy={1330 + bob} r={12} fill="#e8392f" />
			<line x1={940} y1={900} x2={1060} y2={1360 - bob} stroke="#222" strokeWidth={3} />
			<circle cx={1060} cy={1360 - bob} r={10} fill="#e8392f" />
			<g transform={`translate(0,${bob * 0.6})`}>
				<Person kind="dad" id="p2fdad" hideLegs x={440} y={1330 + 470 * 0.8} scale={0.8} headTilt={10} face={{eyes: 'happy', mouth: 'smile', stubble: true}} armL={{shoulder: 6, elbow: -4}} armR={{target: [170, -640], bend: -1, ku: 0.8, kf: 0.75}} />
				<Person kind="son" id="p2fson" hideLegs x={700} y={1330 + 330 * 0.8} scale={0.8} face={{eyes: 'happy', mouth: 'smile'}} armL={{shoulder: 6, elbow: -4}} armR={{target: [150, -420], bend: -1, ku: 0.8, kf: 0.75}} />
				{/* rods: dad holds his in the LEFT hand (he is left-handed) */}
				<line x1={440 + 170 * 0.8} y1={1330 + 470 * 0.8 - 640 * 0.8} x2={760} y2={760} stroke="#5a3a22" strokeWidth={9} strokeLinecap="round" />
				<line x1={700 + 150 * 0.8} y1={1330 + 330 * 0.8 - 420 * 0.8} x2={940} y2={900} stroke="#5a3a22" strokeWidth={8} strokeLinecap="round" />
				<path d="M 240,1300 L 900,1300 L 840,1420 L 300,1420 Z" fill="#7a4a2c" />
				<rect x={232} y={1288} width={676} height={22} rx={10} fill="#9a6238" />
				{/* the whisper: the word itself stays hidden */}
				<g transform="translate(560,820)">
					<rect x={-70} y={-44} width={140} height={70} rx={30} fill="#fff" />
					<path d="M -30,24 l -18,30 l 34,-30 Z" fill="#fff" />
					<text x={0} y={6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#111">
						{'•'.repeat(dots)}
					</text>
				</g>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 6 ---
// He freezes. "ДУМАЕТ" timer counts the seconds.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const sec = Math.max(0, Math.min(5, Math.floor((f - 20) / 22) + 1));
	const box = pop(f, 16, 11);
	const prog = Math.min(1, Math.max(0, (f - 20) / 110));
	return (
		<Stage
			cam={{s: lerp(f, 0, 150, 1.0, 1.16) * kick(f), cx: 540, cy: 900}}
			light={{glow: 0.2, vignette: 0.75}}
			bg="#e9d6b0"
			overlay={
				<div style={{position: 'absolute', left: 540, top: 1520, transform: `translate(-50%,-50%) scale(${box})`, fontFamily: HEAVY, fontWeight: 900, textAlign: 'center'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#111', border: '6px solid #e0342b', borderRadius: 22, padding: '10px 30px'}}>
						<svg width={90} height={90} viewBox="0 0 100 100">
							<circle cx={50} cy={50} r={40} fill="none" stroke="#333" strokeWidth={12} />
							<circle cx={50} cy={50} r={40} fill="none" stroke="#ff4a3d" strokeWidth={12} strokeDasharray={`${prog * 251} 251`} transform="rotate(-90 50 50)" strokeLinecap="round" />
						</svg>
						<div>
							<div style={{fontSize: 34, color: '#ff4a3d', letterSpacing: 4}}>ДУМАЕТ</div>
							<div style={{fontSize: 92, color: '#fff', lineHeight: 1}}>{sec} СЕК</div>
						</div>
					</div>
				</div>
			}
		>
			<Wallpaper id="p2s6wp" x={-300} y={-300} w={1700} h={1500} base="#f0dcb0" line="#dfc490" />
			<Tiles y={1150} h={1200} />
			<Bust kind="dad" id="p2s6cu" x={540} y={860} scale={3.4} face={{eyes: 'open', mouth: 'flat', stubble: true, brows: 'flat', look: [0, 0.1], pupil: lerp(f, 30, 120, 1, 0.7), blush: false}} />
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 7 ---
// «Тигрёнок» → verdict card: the word was «КАРАСЬ».
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		const talking = t > 8 && t < 34 && Math.floor(t / 4) % 2 === 0;
		return (
			<Stage cam={{s: lerp(t, 0, 62, 1.05, 1.12) * kick(t), cx: 540, cy: 900}} light={{glow: 0.3, vignette: 0.65}} bg="#e9d6b0">
				<Wallpaper id="p2s7wp" x={-300} y={-300} w={1700} h={1500} base="#f0dcb0" line="#dfc490" />
				<Tiles y={1150} h={1200} />
				<Bust kind="dad" id="p2s7cu" x={540} y={880} scale={3.4} face={{eyes: 'open', mouth: talking ? 'open' : 'smile', stubble: true, look: [0, 0.2], blink: blinkAt(t, 3, 80)}} />
			</Stage>
		);
	}
	const strike = lerp(t, 6, 18, 0, 1);
	const word = pop(t, 22, 9);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2b2f3a 0%, #121418 70%)'}}>
			<div style={{position: 'absolute', top: 820, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{position: 'relative', display: 'inline-block', fontSize: 84, color: '#9aa0ad'}}>
					«ТИГРЁНОК»
					<div style={{position: 'absolute', left: -10, top: '52%', height: 12, width: `${strike * 104}%`, background: RED, borderRadius: 6, transform: 'rotate(-4deg)'}} />
				</div>
				<div style={{fontSize: 36, color: '#cfd3dc', letterSpacing: 8, marginTop: 40}}>НАШЕ СЛОВО</div>
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 24, marginTop: 6, transform: `scale(${word})`}}>
					<svg width={150} height={90} viewBox="0 0 150 90">
						<path d="M 10,45 C 40,0 100,0 120,45 C 100,90 40,90 10,45 Z" fill="#e8b84c" />
						<path d="M 118,45 L 148,20 L 148,70 Z" fill="#e8b84c" />
						<circle cx={38} cy={38} r={6} fill="#111" />
						<path d="M 60,30 q 10,15 0,30 M 78,28 q 10,17 0,34" stroke="#c4902c" strokeWidth={5} fill="none" />
					</svg>
					<span style={{fontSize: 150, color: YELLOW, textShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>КАРАСЬ</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 8 ---
// He understands. The smile slowly goes away; the light flickers.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const flick = f > 70 && f < 96 && [72, 73, 78, 84, 85, 92].includes(f) ? 0.65 : 0;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 135, 1.0, 1.22, Easing.inOut(Easing.quad)), cx: 540, cy: 860}} light={{glow: 0.15, vignette: 0.85, tint: '#4a0000', tintOpacity: lerp(f, 20, 135, 0, 0.3)}} bg="#e9d6b0">
				<Wallpaper id="p2s8wp" x={-300} y={-300} w={1700} h={1500} base="#f0dcb0" line="#dfc490" />
				<Tiles y={1150} h={1200} />
				<Bust
					kind="dad"
					id="p2s8cu"
					x={540}
					y={880}
					scale={3.4}
					face={{eyes: f > 50 ? 'narrow' : 'open', mouth: f < 28 ? 'smile' : 'flat', brows: f > 60 ? 'angry' : 'flat', stubble: true, look: [0, 0.15], blush: false}}
				/>
			</Stage>
			<AbsoluteFill style={{background: '#000', opacity: flick}} />
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- SHOT 9 ---
// Mom comes in — and he smiles again: «Он меня проверяет!»
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const k = lerp(f, 0, 46, 0, 1, Easing.out(Easing.quad));
	const walking = f < 46;
	const laugh = f > 56 && f < 140 ? Math.abs(Math.sin(f / 3)) * 10 : 0;
	return (
		<Stage cam={{s: lerp(f, 0, 150, 1.0, 1.06), cx: 540, cy: 1000}} light={{glow: 0.35, vignette: 0.5}}>
			<KitchenTable
				f={f}
				stir={false}
				point={f > 40}
				dadFace={{eyes: 'open', mouth: f > 40 ? 'grin' : 'smile', stubble: true, look: f > 40 ? [-0.6, 0.6] : [0.8, 0], blink: blinkAt(f, 2, 90)}}
				mom={
					<g transform={`translate(0,${-laugh * 0.3})`}>
						<Person
							kind="mom"
							id="p2mom"
							x={1240 + (880 - 1240) * k}
							y={tableY + 460}
							scale={1.0}
							walk={walking ? f / 4 : undefined}
							headTilt={laugh > 0 ? Math.sin(f / 3) * 3 : 0}
							face={{eyes: f > 56 ? 'happy' : 'open', mouth: f > 56 ? 'open' : 'smile', look: [-0.8, 0.3], blink: blinkAt(f, 5)}}
							armL={{target: [-26, -560], kf: 0.55, bend: 1}}
							armR={{target: [26, -556], kf: 0.55, bend: -1}}
						/>
					</g>
				}
			/>
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 10 ---
// Mom leaves. He leans over the table and whispers.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [40]);
	if (i === 0) {
		const k = lerp(t, 0, 40, 0, 1, Easing.in(Easing.quad));
		return (
			<Stage cam={{s: 1.04, cx: 540, cy: 1000}} light={{glow: 0.3, vignette: 0.55}}>
				<KitchenTable
					f={f}
					stir={false}
					dadFace={{eyes: 'open', mouth: 'smile', stubble: true, look: [0.9, 0.1]}}
					mom={
						<Person kind="mom" id="p2mom2" x={880 + 420 * k} y={tableY + 460} scale={1.0} walk={t / 4} face={{eyes: 'happy', mouth: 'smile', look: [0.8, 0]}} armL={{target: [-26, -560], kf: 0.55, bend: 1}} armR={{target: [26, -556], kf: 0.55, bend: -1}} />
					}
				/>
			</Stage>
		);
	}
	const lean = lerp(t, 0, 50, 0, 1, Easing.out(Easing.cubic));
	const whisper = t > 10 && t < 90 && Math.floor(t / 5) % 2 === 0;
	return (
		<Stage cam={{s: (1.0 + 0.25 * lean) * kick(t), cx: 540, cy: 900, rot: -3 * lean}} light={{glow: 0.05, vignette: 0.9, tint: '#0b1638', tintOpacity: 0.25}} bg="#e9d6b0">
			<Wallpaper id="p2s10wp" x={-300} y={-300} w={1700} h={1500} base="#f0dcb0" line="#dfc490" />
			<Tiles y={1150} h={1200} />
			<rect x={-300} y={-300} width={1700} height={2600} fill="#000" opacity={0.25} />
			<Bust kind="dad" id="p2s10cu" x={540} y={900 + 60 * lean} scale={3.4 + 0.5 * lean} tilt={-6 * lean} face={{eyes: 'narrow', mouth: whisper ? 'o' : 'flat', brows: 'flat', stubble: true, look: [0, 0.1], blush: false}} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 11 ---
// Your phone: yesterday's message used exactly the same words.
const ChatHeader: React.FC<{status: string; dark?: boolean}> = ({status, dark}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 190, background: dark ? '#1b1d22' : '#f7f7f9', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 20, fontFamily: SANS, boxSizing: 'border-box'}}>
		<div style={{width: 84, height: 84, borderRadius: 42, background: '#33506e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40}}>П</div>
		<div>
			<div style={{fontWeight: 900, fontSize: 40, color: dark ? '#f2f2f2' : '#111'}}>Папа (вахта)</div>
			<div style={{fontWeight: 600, fontSize: 26, color: '#3a8f5c'}}>{status}</div>
		</div>
	</div>
);

export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const mark = lerp(f, 40, 64, 0, 1);
	const zoom = f < 84 ? lerp(f, 0, 84, 1.0, 1.05) : lerp(f, 84, 150, 1.5, 1.6) * kick(f - 84, 0.1);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a22 0%, #120c0a 80%)'}}>
			<Phone x={f < 84 ? 520 : 600} y={f < 84 ? 1060 : 1400} w={700} scale={zoom}>
				<div style={{position: 'absolute', inset: 0, background: '#e9e3da'}} />
				<ChatHeader status="был(а) недавно" />
				<div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: '#777', fontWeight: 600}}>Вчера</div>
				<div
					style={{position: 'absolute', left: 28, top: 300, width: 560, background: '#fff', borderRadius: '30px 30px 30px 6px', padding: '22px 28px', fontFamily: SANS, fontSize: 40, lineHeight: 1.3, fontWeight: 700, color: '#111', boxSizing: 'border-box'}}
				>
					Сынок, рейс задержали, прилечу завтра.{' '}
					<span style={{background: `linear-gradient(90deg, rgba(255,59,48,0.85) ${mark * 100}%, transparent ${mark * 100}%)`, color: mark > 0.5 ? '#fff' : '#111', borderRadius: 6, padding: '0 4px'}}>
						Маме не говори, сюрприз.
					</span>
					<div style={{fontSize: 22, color: '#999', textAlign: 'right', fontWeight: 600}}>07:10</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 12 ---
// 14:00. An empty patch on the wall: the family photo is gone.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const k = lerp(f, 30, 110, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam = {s: 1 + 1.5 * k, cx: 540 + (710 - 540) * k, cy: 960 + (440 - 960) * k};
	const ring = f > 104 ? 0.6 + 0.4 * Math.abs(Math.sin(f / 6)) : 0;
	return (
		<Stage cam={cam} light={{glow: 0.4, vignette: 0.55}}>
			<Kitchen id="p2s12" floorY={1300} clock={[2, 0]} tick={f / 30} photoMissing />
			<Table y={1400} />
			<g opacity={ring}>
				<rect x={590} y={300} width={240} height={275} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="22 14" />
				<text x={710} y={470} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={130} fill={RED}>
					?
				</text>
			</g>
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 13 ---
// The photo where you could see the real dad (left hand) — torn in half.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const tear = lerp(f, 60, 92, 0, 1, Easing.out(Easing.cubic));
	const fall = lerp(f, 120, 180, 0, 1, Easing.in(Easing.quad));
	const zig = Array.from({length: 13}, (_, k) => `${540 + (k % 2 ? 22 : -22)},${700 + k * 60}`).join(' ');
	const half = (side: -1 | 1, id: string) => (
		<g transform={`translate(${side * (70 * tear + 120 * fall)},${700 * fall}) rotate(${side * (7 * tear + 14 * fall)} 540 1040)`}>
			<clipPath id={`${id}-c`}>
				<polygon points={side < 0 ? `100,600 562,600 ${zig} 518,1480 100,1480` : `980,600 518,600 ${zig} 562,1480 980,1480`} />
			</clipPath>
			<g clipPath={`url(#${id}-c)`}>
				<FamilyPhoto x={170} y={720} w={740} h={640} variant="fork" id={id} highlight={f < 60 ? pop(f, 14, 10) : 0} />
			</g>
		</g>
	);
	return (
		<Stage cam={{s: lerp(f, 0, 180, 1.0, 1.08) * kick(f), cx: 540, cy: 1000}} light={{glow: 0.3, vignette: 0.7, tint: '#7a5a2a', tintOpacity: 0.22}} bg="#3a2a22">
			<rect x={-300} y={-300} width={1700} height={2600} fill="#4a352a" />
			{half(-1, 'p2tl')}
			{half(1, 'p2tr')}
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 14 ---
// 23:50. You lock your door (rule 3)… and the handle slowly goes down.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [70]);
	if (i === 0) {
		const rot = lerp(t, 16, 28, 0, 90, Easing.inOut(Easing.cubic));
		return (
			<Stage cam={{s: lerp(t, 0, 70, 1.0, 1.08), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85, tint: '#0b1638', tintOpacity: 0.55}} bg="#1a1410">
				<rect x={-200} y={-200} width={1500} height={2400} fill="#6a4228" />
				<rect x={380} y={560} width={320} height={820} rx={60} fill="#b8b2a6" />
				<circle cx={540} cy={820} r={110} fill="#8f8a80" />
				<g transform={`rotate(${rot} 540 820)`}>
					<rect x={505} y={700} width={70} height={240} rx={35} fill="#d6d0c4" />
				</g>
				<circle cx={540} cy={1180} r={42} fill="#6f6a60" />
			</Stage>
		);
	}
	const down = lerp(t, 26, 96, 0, 34, Easing.inOut(Easing.sin));
	const [jx] = shake(t, 96, 3, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 110, 1.0, 1.12) * kick(t), cx: 540, cy: 960, dx: jx}} light={{glow: 0, vignette: 0.9, tint: '#0b1638', tintOpacity: 0.5}} bg="#140f0c">
			<rect x={-200} y={-200} width={1500} height={2400} fill="#5a3822" />
			{Array.from({length: 12}).map((_, k) => (
				<path key={k} d={`M ${-100 + k * 110},-200 C ${-80 + k * 110},600 ${-120 + k * 110},1300 ${-90 + k * 110},2200`} stroke="#4c2f1c" strokeWidth={10} fill="none" />
			))}
			<circle cx={420} cy={900} r={110} fill="#c9c3b7" />
			<circle cx={420} cy={900} r={80} fill="#b3ada1" />
			<g transform={`rotate(${down} 420 900)`}>
				<rect x={400} y={860} width={480} height={80} rx={40} fill="#ddd7cb" />
				<rect x={410} y={872} width={440} height={16} rx={8} fill="#fff" opacity={0.5} />
			</g>
			<rect x={-200} y={1820} width={1500} height={40} fill="#ffcf73" opacity={0.6} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 15 ---
// The phone lights up in the dark: «Сынок, ты один?»
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const msg = pop(f, 26, 11);
	const buzzing = (f >= 22 && f < 36) || (f >= 50 && f < 62);
	const jx = buzzing ? Math.sin(f * 2.9) * 8 : 0;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)'}}>
			<Phone x={540 + jx} y={1060} w={680} scale={lerp(f, 0, 150, 1.0, 1.12)}>
				<div style={{position: 'absolute', inset: 0, background: '#0f1115'}} />
				<ChatHeader status="в сети" dark />
				<div style={{position: 'absolute', left: 28, top: 260, width: 520, background: '#24272e', borderRadius: '30px 30px 30px 6px', padding: '18px 26px', fontFamily: SANS, fontSize: 30, fontWeight: 600, color: '#8b8f99', opacity: 0.8}}>
					Сынок, рейс задержали, прилечу завтра. Маме не говори, сюрприз.
				</div>
				{f >= 26 && (
					<div
						style={{
							position: 'absolute',
							left: 28,
							top: 470,
							background: '#2d6cdf',
							borderRadius: '34px 34px 34px 6px',
							padding: '24px 34px',
							fontFamily: SANS,
							fontSize: 54,
							fontWeight: 800,
							color: '#fff',
							transform: `scale(${msg})`,
							transformOrigin: '0% 100%',
						}}
					>
						Сынок, ты один?
						<div style={{fontSize: 22, color: '#cfe0ff', textAlign: 'right', fontWeight: 600}}>23:52</div>
					</div>
				)}
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 16 ---
// Under the door: his shadow and the blue light of a phone.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const blue = 0.3 + 0.3 * Math.abs(Math.sin(f / 5)) + (f % 23 < 2 ? 0.25 : 0);
	const step = Math.sin(f / 30) * 5;
	return (
		<Stage cam={{s: lerp(f, 0, 150, 1.0, 1.2), cx: 540, cy: 1020}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
			<defs>
				<linearGradient id="p2spill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffd27a" stopOpacity={0.6} />
					<stop offset="100%" stopColor="#ffd27a" stopOpacity={0} />
				</linearGradient>
			</defs>
			<rect x={-300} y={-300} width={1700} height={1300} fill="#3b2516" />
			{Array.from({length: 10}).map((_, k) => (
				<rect key={k} x={-200 + k * 160} y={-300} width={10} height={1300} fill="#2c1b10" />
			))}
			<rect x={-300} y={960} width={1700} height={36} fill="#2a190e" />
			<PlankFloor y={1044} color="#2a2236" seam="#1d1727" />
			{/* warm light from the corridor through the gap */}
			<rect x={-300} y={996} width={1700} height={48} fill="#ffd27a" />
			<path d="M -300,1044 L 1400,1044 L 1800,1700 L -700,1700 Z" fill="url(#p2spill)" />
			{/* cold phone light between his feet */}
			<ellipse cx={560} cy={1020} rx={150} ry={26} fill="#6fb0ff" opacity={blue} />
			{/* his feet block the light, their shadows run towards you */}
			<path d={`M ${330 + step},1044 L ${520 + step},1044 L ${470 + step * 2},1700 L ${120 + step * 2},1700 Z`} fill="#000" opacity={0.55} />
			<path d={`M ${600 - step},1044 L ${790 - step},1044 L ${960 - step * 2},1700 L ${640 - step * 2},1700 Z`} fill="#000" opacity={0.55} />
			<rect x={330 + step} y={992} width={190} height={56} rx={20} fill="#0a0806" />
			<rect x={600 - step} y={992} width={190} height={56} rx={20} fill="#0a0806" />
			<rect x={-300} y={-300} width={1700} height={2600} fill="#0b1638" opacity={0.18} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 17 ---
// Finale: choose. Countdown 3-2-1, end card for part 3.
export const S17: React.FC = () => {
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
			<Stage cam={{s: lerp(f, 0, 300, 1.0, 1.12), cx: 540, cy: 900}} light={{glow: 0, vignette: 0.9, tint: '#00103a', tintOpacity: 0.35}} bg="#05070f">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#141a2a" />
				<Bust kind="dad" id="p2s17" x={540} y={760} scale={3.6} face={{eyes: 'stare', mouth: 'flat', pupil: 0.6, brows: 'flat', stubble: true, blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="url(#p2phoneGlow)" />
				<defs>
					<radialGradient id="p2phoneGlow" cx="50%" cy="70%" r="60%">
						<stop offset="0%" stopColor="#5aa0ff" stopOpacity={0.35} />
						<stop offset="100%" stopColor="#000" stopOpacity={0.6} />
					</radialGradient>
				</defs>
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 108, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)'}}>
				ОН ИЛИ <span style={{color: RED}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18}}>
					{Array.from({length: 9}).map((_, i) => (
						<div key={i} style={{width: 62, height: 62, borderRadius: 12, background: '#e0342b', border: '4px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 18 + i * 3, 9)})`}}>
							<Cross size={34} width={5} />
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'ОТВЕТИТЬ «ДА»', '#3b82f6', 'и посмотреть, что будет', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ПОЗВОНИТЬ ПАПЕ ПО ВИДЕОСВЯЗИ', '#e0342b', 'и увидеть, кто ответит', 2)}
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
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 3</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ЧАСТИ 1–2 — В ПРОФИЛЕ</div>
						<div style={{fontSize: 32, color: '#b9a9aa', marginTop: 30, letterSpacing: 2}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
						<div
							style={{
								display: 'inline-block',
								marginTop: 46,
								background: '#ff2d3d',
								borderRadius: 60,
								padding: '22px 70px',
								fontSize: 52,
								color: '#fff',
								boxShadow: '0 0 40px rgba(255,45,61,0.6)',
								transform: `scale(${1 + Math.sin(f / 5) * 0.04})`,
							}}
						>
							ПОДПИШИСЬ
						</div>
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};
