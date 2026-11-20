// «ТГК открыт» — 700 subscribers: the promise from the poll «Открывать ТГК?» (src/t1) is kept, the Telegram channel is
// open. 6 shots on the timeline of src/t2/timeline.ts (= the voice). The heroes of the series stand in the «3D camera»
// of «Ты с какого района?» (src/components/Layers3D.tsx).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Baseboard, PlankFloor, Wallpaper} from '../components/Set';
import {Cam3, project} from '../components/Scene3D';
import {Far, kz, Lay, personBox, Set3D} from '../components/Layers3D';
import {Phone} from '../g1/scenes';
import {Recap, Stamp} from '../g2/scenes';
import {IGOR} from '../r1/scenes';
import * as T1 from '../t1/scenes';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const TG = '#229ed9'; // Telegram blue
const SANS = "'Inter', 'DejaVu Sans', sans-serif";

const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
// where a point of a 3D layer (flat-picture coordinates) lands on the screen
const scr = (cam: Cam3, X: number, Y: number, z: number) => {
	const k = kz(z);
	return project(cam, (X - 540) / k, (Y - 960) / k, z);
};

// the paper plane (Telegram)
const Plane: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M 2,11.5 L 21.5,3.5 L 18,20.5 L 12,15.5 L 9,19 L 8.6,14.2 L 17.5,7 L 7,13.2 Z" fill={color} />
	</svg>
);

// confetti from a point, falling (t = frames since the burst)
const Confetti: React.FC<{t: number; x?: number; y?: number; n?: number}> = ({t, x = 540, y = 700, n = 70}) => {
	if (t < 0 || t > 90) return null;
	const cols = [YELLOW, RED, TG, '#7ee08a', '#ff9ad5', '#fff'];
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: n}).map((_, i) => {
				const a = rnd(i) * Math.PI * 2;
				const v = 14 + 22 * rnd(i + 50);
				const px = x + Math.cos(a) * v * t * 0.9;
				const py = y + Math.sin(a) * v * t * 0.6 + 0.55 * t * t;
				const rot = (rnd(i + 99) - 0.5) * 40 * t;
				return <div key={i} style={{position: 'absolute', left: px, top: py, width: 18, height: 30, background: cols[i % cols.length], transform: `rotate(${rot}deg)`, opacity: interpolate(t, [60, 90], [1, 0], clamp), borderRadius: 3}} />;
			})}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------- the heroes ---
// the cosy room where the heroes gather (far layer)
const Room: React.FC = () => (
	<g>
		<Wallpaper id="t2wp" x={-500} y={-400} w={2100} h={1950} base="#e9cfa0" line="#d5b47e" />
		<PlankFloor y={1500} />
		<Baseboard y={1500} />
		{/* garlands: it's a party */}
		{[0, 1].map((r) => (
			<g key={r}>
				<path d={`M -300,${250 + r * 140} Q 540,${430 + r * 140} 1380,${250 + r * 140}`} stroke="#8a6a3a" strokeWidth={4} fill="none" />
				{Array.from({length: 14}).map((_, k) => {
					const x = -260 + k * 120;
					const yy = 250 + r * 140 + 180 * Math.sin((Math.PI * (x + 300)) / 1680);
					return <path key={k} d={`M ${x - 26},${yy} L ${x + 26},${yy} L ${x},${yy + 56} Z`} fill={[YELLOW, RED, TG, '#7ee08a'][(k + r) % 4]} />;
				})}
			</g>
		))}
	</g>
);
type Hero = {key: string; x: number; z: number; s: number; tag: string; sub?: string; color: string; draw: (f: number, face: Face, hop: number) => React.ReactNode};
const FEET = 1720;
const HEROES: Hero[] = [
	{key: 'teen', x: 400, z: -720, s: 0.78, tag: 'ГОЛОСОВЫЕ', sub: 'ИЗ ЗАВТРА', color: '#cf4a3c', draw: (f, face, hop) => <Person kind="teen" id="t2teen" x={400} y={FEET - hop} scale={0.78} breathe={f} face={face} armL={{target: [-130, -980], bend: 1}} />},
	{key: 'son', x: 690, z: -720, s: 0.78, tag: 'ВАХТА', color: '#f0a032', draw: (f, face, hop) => <Person kind="son" id="t2son" x={690} y={FEET - hop} scale={0.78} breathe={f + 9} face={face} armR={{target: [140, -900], bend: -1}} />},
	{key: 'girl', x: 175, z: -420, s: 0.84, tag: 'КНОПКА 13', color: '#1a827c', draw: (f, face, hop) => <Person kind="girl" id="t2girl" x={175} y={FEET + 60 - hop} scale={0.84} breathe={f + 4} face={face} armR={{target: [150, -880], bend: -1}} />},
	{key: 'boy', x: 915, z: -420, s: 0.84, tag: 'ТЫ С КАКОГО', sub: 'РАЙОНА?', color: '#e0342b', draw: (f, face, hop) => <Person kind="boy" id="t2boy" x={915} y={FEET + 60 - hop} scale={0.84} plain pioneer colors={IGOR} breathe={f + 13} face={face} armL={{target: [-150, -820], bend: 1}} />},
];
const JOY: Face = {eyes: 'happy', mouth: 'open', brows: 'raised', look: [0, 0], blush: true};
const WAIT: Face = {eyes: 'open', mouth: 'smile', brows: 'raised', look: [0, 0.1], blush: false};

const Tag: React.FC<{x: number; y: number; text: string; sub?: string; color: string; p: number}> = ({x, y, text, sub, color, p}) =>
	p <= 0.001 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%'}}>
			<div style={{background: '#111', border: `5px solid ${color}`, borderRadius: 14, padding: '6px 16px', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.05, boxShadow: '0 8px 20px rgba(0,0,0,0.3)'}}>
				<div style={{fontSize: 28}}>{text}</div>
				{sub && <div style={{fontSize: 22, color}}>{sub}</div>}
			</div>
		</div>
	);

// the heroes in 3D: the room far and soft, two rows of heroes at their own depths; `jump` = everyone hops
const HeroesShot: React.FC<{f: number; cam: Cam3; face: Face; jump: number; tags?: number}> = ({f, cam, face, jump, tags = 1}) => (
	<AbsoluteFill>
		<Set3D cam={cam} bg="#e9cfa0" far={<Far z={-1500}><Room /></Far>} blur={3} vig={0.5}>
			{HEROES.map((h, i) => {
				const hop = jump > 0 ? Math.abs(Math.sin(f / 4 + i * 0.9)) * 90 * jump : 0;
				return (
					<Lay key={h.key} z={h.z} box={personBox(h.x, FEET + 60, h.s, 620)}>
						{h.draw(f, face, hop)}
					</Lay>
				);
			})}
		</Set3D>
		{HEROES.map((h, i) => {
			const top = scr(cam, h.x, FEET + (h.z > -500 ? 60 : 0) - 1030 * h.s, h.z);
			return <Tag key={h.key} x={top.x} y={top.y - 20} text={h.tag} sub={h.sub} color={h.color} p={tags * pop(f, 6 + i * 6, 11)} />;
		})}
	</AbsoluteFill>
);

// --------------------------------------------------------------- SHOTS ---
// 1. The counter runs up to 700 (семьсот@49); the lock «ТГК» springs open, confetti.
const GOAL = 700;
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const k = lerp(f, 0, 49, 0, 1, Easing.out(Easing.cubic));
	const n = Math.round(684 + 16 * k);
	const done = f >= 49;
	const burst = pop(f, 49, 8);
	const shine = done ? 0.5 + 0.5 * Math.sin((f - 49) / 4) : 0;
	const W = 860;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 55%, #04060d 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 54, color: '#9fb3d9', letterSpacing: 6}}>НАС УЖЕ</div>
				<div style={{fontSize: 300, lineHeight: 1, color: done ? YELLOW : '#fff', transform: `scale(${done ? 1 + 0.14 * (1 - burst) + 0.03 * shine : 1})`, textShadow: done ? '0 12px 0 #6b4a00, 0 0 60px rgba(255,211,74,0.55)' : '0 10px 0 #000'}}>{done ? GOAL : n}</div>
				<div style={{fontSize: 72, color: '#fff', marginTop: -6, textShadow: '0 6px 0 #000'}}>ПОДПИСЧИКОВ</div>
			</div>
			<div style={{position: 'absolute', left: (1080 - W) / 2, top: 880, width: W, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.12)', border: '4px solid rgba(255,255,255,0.25)', boxSizing: 'border-box'}}>
				<div style={{height: '100%', width: `${100 * (0.977 + 0.023 * k)}%`, borderRadius: 28, background: done ? YELLOW : TG, boxShadow: done ? '0 0 30px rgba(255,211,74,0.7)' : 'none'}} />
			</div>
			<div style={{position: 'absolute', left: (1080 + W) / 2, top: 908, transform: `translate(-50%,-50%) scale(${1 + 0.25 * burst * (done ? 1 : 0)})`}}>
				<div style={{width: 130, height: 130, borderRadius: 65, background: done ? YELLOW : '#1b2550', border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={70} height={70} viewBox="0 0 24 24">
						<rect x={4} y={10} width={16} height={12} rx={2.5} fill={done ? '#111' : '#fff'} />
						<path d={done ? 'M 7.5,10 V 7 a 4.5,4.5 0 0 1 9,0' : 'M 7.5,10 V 7 a 4.5,4.5 0 0 1 9,0 V 10'} stroke={done ? '#111' : '#fff'} strokeWidth={2.6} fill="none" transform={done ? 'translate(5,-2) rotate(20 12 7)' : undefined} />
					</svg>
				</div>
				<div style={{position: 'absolute', top: 140, left: '50%', transform: 'translateX(-50%)', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: done ? YELLOW : '#fff', whiteSpace: 'nowrap'}}>ТГК</div>
			</div>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
				<Bust kind="son" id="t2s1s" x={250} y={1720 - 50 * burst} scale={1.6} face={{eyes: done ? 'happy' : 'wide', mouth: done ? 'open' : 'o', brows: 'raised', look: [0.4, -0.6], blush: false}} />
				<Bust kind="teen" id="t2s1t" x={830} y={1730 - 50 * burst} scale={1.6} face={{eyes: done ? 'happy' : 'wide', mouth: done ? 'open' : 'o', brows: 'raised', look: [-0.4, -0.6], blush: false}} />
			</svg>
			<Confetti t={f - 49} x={540} y={560} />
		</AbsoluteFill>
	);
};

// 2. «Мы обещали: семьсот подписчиков — и открываем свой Телеграм-канал.» — the promise from the poll video
// (обещали@9, семьсот@35, открываем@73, Телеграм-канал@96)
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const tg = pop(f, 94, 10);
	return (
		<AbsoluteFill>
			<Recap f={f} label="◀◀ МЫ ОБЕЩАЛИ">
				<Freeze frame={44}>
					<T1.S05 />
				</Freeze>
			</Recap>
			{tg > 0.01 && (
				<div style={{position: 'absolute', top: 1040, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${tg}) rotate(-3deg)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, background: TG, borderRadius: 28, padding: '14px 34px', fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(34,158,217,0.6)'}}>
						<Plane size={58} />
						ТЕЛЕГРАМ-КАНАЛ
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 3. «Обещание выполнено. ТГК — открыт!» — the heroes of all the series, in 3D; the stamp; «ТГК ОТКРЫТ», confetti.
// (выполнено@27, ТГК@60, открыт@74)
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const open = f >= 72;
	const cam: Cam3 = {x: lerp(f, 0, 97, -70, 60), y: 60, z: lerp(f, 0, 97, 0, 170)};
	const plate = pop(f, 72, 9);
	return (
		<AbsoluteFill>
			<HeroesShot f={f} cam={cam} face={open ? JOY : WAIT} jump={open ? 1 : 0} />
			{f < 70 && <Stamp p={pop(f, 26, 10)} mark="check" label="ОБЕЩАНИЕ ВЫПОЛНЕНО" />}
			{plate > 0.01 && (
				<div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${plate}) rotate(-4deg)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, background: TG, borderRadius: 34, padding: '18px 42px', fontFamily: HEAVY, fontWeight: 900, fontSize: 92, color: '#fff', boxShadow: '0 0 60px rgba(34,158,217,0.65), 0 14px 0 rgba(0,0,0,0.25)'}}>
						<Plane size={96} />
						ТГК ОТКРЫТ!
					</div>
				</div>
			)}
			<Confetti t={f - 72} x={540} y={520} />
		</AbsoluteFill>
	);
};

// the channel in the phone: open now; early access, and the plot votes
const ChannelScreen: React.FC<{f: number}> = ({f}) => {
	const p1 = pop(f, 36, 11);
	const p2 = pop(f, 72, 11);
	const bar = lerp(f, 96, 130, 0, 1, Easing.out(Easing.cubic));
	const opts = [
		{n: '1', t: 'сказать маме секрет', v: 58},
		{n: '2', t: 'включить голосовые', v: 42},
	];
	return (
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f1c2c 0%, #13243a 100%)', fontFamily: HEAVY}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: '#17263a', display: 'flex', alignItems: 'center', gap: 18, padding: '40px 24px 0', boxSizing: 'border-box'}}>
				<div style={{width: 76, height: 76, borderRadius: 38, background: TG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Plane size={46} />
				</div>
				<div style={{color: '#fff', fontWeight: 900}}>
					<div style={{fontSize: 34}}>НАШ ТГК</div>
					<div style={{fontSize: 21, color: '#7ee08a', fontWeight: 800}}>канал открыт</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 22, right: 22, top: 180, transform: `scale(${p1})`, transformOrigin: '10% 0%', background: '#1d2d44', borderRadius: 22, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
				<div style={{height: 230, position: 'relative', background: 'radial-gradient(circle at 60% 45%, #f4d79a 0%, #8a5a2c 26%, #1b1530 52%, #070812 100%)'}}>
					<div style={{position: 'absolute', left: 300, top: 40, width: 110, height: 190, background: '#0a0b10', borderRadius: '55px 55px 8px 8px'}} />
					<div style={{position: 'absolute', left: 331, top: 84, width: 14, height: 9, borderRadius: 6, background: '#fff'}} />
					<div style={{position: 'absolute', left: 365, top: 84, width: 14, height: 9, borderRadius: 6, background: '#fff'}} />
					<div style={{position: 'absolute', left: 18, top: 18, background: 'rgba(0,0,0,0.65)', borderRadius: 14, padding: '8px 16px', color: '#fff', fontWeight: 900, fontSize: 26}}>РАННИЙ ДОСТУП</div>
				</div>
				<div style={{padding: '16px 22px 20px', color: '#fff', fontWeight: 900, fontSize: 32}}>
					НОВАЯ СЕРИЯ — РАНЬШЕ ВСЕХ
					<div style={{fontSize: 22, color: '#8aa6c4', fontWeight: 800, marginTop: 4}}>здесь — раньше, чем в ТикТоке</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 22, right: 22, top: 540, transform: `scale(${p2})`, transformOrigin: '10% 0%', background: '#1d2d44', borderRadius: 22, padding: '20px 22px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
				<div style={{color: '#8aa6c4', fontSize: 20, fontWeight: 800}}>ОПРОС</div>
				<div style={{color: '#fff', fontSize: 31, fontWeight: 900, marginTop: 4}}>КУДА ПОЙДЁТ СЮЖЕТ?</div>
				{opts.map((o, i) => (
					<div key={o.n} style={{marginTop: 16}}>
						<div style={{display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 25, fontWeight: 900}}>
							<span>
								{o.n} — {o.t}
							</span>
							<span style={{color: '#8aa6c4'}}>{i === 0 ? '👆' : ''}</span>
						</div>
						<div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.12)', marginTop: 6}}>
							<div style={{height: 14, borderRadius: 7, width: `${o.v * bar}%`, background: i === 0 ? TG : '#e0342b'}} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// 4. «Там новые серии — раньше всех. И голосования: куда пойдёт сюжет.» — the channel in a phone turned in 3D
// (раньше всех@39, голосования@75, сюжет@128)
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const rise = lerp(f, 0, 16, 260, 0, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #1c2f4a 0%, #0b1220 60%, #04060b 100%)', overflow: 'hidden'}}>
			<AbsoluteFill style={{perspective: '1300px', perspectiveOrigin: '540px 960px'}}>
				<AbsoluteFill style={{transform: `rotateY(${lerp(f, 0, 152, -12, -4)}deg) rotateX(${lerp(f, 0, 152, 6, 2)}deg)`, transformOrigin: '540px 900px'}}>
					<Phone x={540} y={880 + rise} w={640} scale={lerp(f, 0, 152, 1.0, 1.06) * kick(f, 0.03)}>
						<ChannelScreen f={f} />
					</Phone>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// 5. «Ссылка — в шапке профиля.» — a profile header; your finger taps the link (шапке@28, профиля@37)
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const tap = interpolate(f, [24, 30, 36], [0, 1, 0], clamp);
	const fin = lerp(f, 4, 26, 0, 1, Easing.out(Easing.cubic));
	const chip = pop(f, 6, 11);
	return (
		<AbsoluteFill style={{background: '#101216', fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 60, right: 60, top: 300, background: '#1a1d23', borderRadius: 40, padding: '50px 40px 56px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transform: `scale(${lerp(f, 0, 55, 1, 1.05)})`}}>
				<svg width={220} height={220} viewBox="0 0 220 220" style={{borderRadius: 110, background: '#2a2f3a'}}>
					<Bust kind="teen" id="t2s5av" x={110} y={150} scale={0.62} face={{eyes: 'happy', mouth: 'smile', brows: 'raised', look: [0, 0], blush: true}} />
				</svg>
				<div style={{display: 'flex', justifyContent: 'center', gap: 70, marginTop: 30, color: '#fff'}}>
					{[
						['700', 'подписчиков'],
						['❤', 'спасибо'],
					].map(([a, b]) => (
						<div key={b}>
							<div style={{fontSize: 52, fontWeight: 900}}>{a}</div>
							<div style={{fontSize: 26, color: '#9aa3b2', fontWeight: 600}}>{b}</div>
						</div>
					))}
				</div>
				<div style={{marginTop: 30, color: '#d9dde4', fontSize: 32, fontWeight: 600}}>сериалы, где выбираешь ты</div>
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 26, background: tap > 0.3 ? '#1b7fb3' : TG, borderRadius: 22, padding: '14px 30px', fontSize: 40, fontWeight: 900, color: '#fff', transform: `scale(${chip * (1 - 0.06 * tap)})`, boxShadow: `0 0 ${30 + 30 * tap}px rgba(34,158,217,${0.5 + 0.4 * tap})`}}>
					<Plane size={46} />
					ТГК · ранний доступ
				</div>
			</div>
			<div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 58, color: YELLOW, transform: `scale(${pop(f, 26, 10)})`}}>↑ ССЫЛКА — ТУТ</div>
			{tap > 0 && <div style={{position: 'absolute', left: 540 - 90, top: 1002 - 90, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.3)', transform: `scale(${0.5 + tap})`}} />}
			<div style={{position: 'absolute', left: lerp(fin, 0, 1, 860, 560), top: lerp(fin, 0, 1, 1700, 1010) + 10 * tap, transform: 'rotate(-20deg)', transformOrigin: '0 0'}}>
				<div style={{position: 'absolute', left: -34, top: -14, width: 68, height: 260, borderRadius: 34, background: '#f2c3a0'}} />
				<div style={{position: 'absolute', left: -88, top: 200, width: 186, height: 240, borderRadius: 70, background: '#f2c3a0'}} />
				<div style={{position: 'absolute', left: -130, top: 380, width: 270, height: 700, borderRadius: 90, background: '#cf4a3c'}} />
			</div>
		</AbsoluteFill>
	);
};

// 6. «Жми — и ты уже с нами. Спасибо за семьсот!» — the heroes wave, «СПАСИБО ЗА 700!», then the end card
// (Жми@4, нами@44, Спасибо@62, семьсот@84)
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const thanks = pop(f, 60, 9);
	const card = interpolate(f, [116, 126], [0, 1], clamp);
	const cam: Cam3 = {x: lerp(f, 0, 120, 60, -60), y: 60, z: lerp(f, 0, 120, 80, 230)};
	return (
		<AbsoluteFill>
			<HeroesShot f={f} cam={cam} face={JOY} jump={f >= 58 ? 1 : 0.3} tags={0} />
			{thanks > 0.01 && (
				<div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${thanks}) rotate(-3deg)`}}>
					<div style={{fontSize: 110, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.45)'}}>СПАСИБО</div>
					<div style={{fontSize: 170, lineHeight: 1, color: YELLOW, textShadow: '0 12px 0 #6b4a00, 0 0 50px rgba(255,211,74,0.5)'}}>ЗА 700!</div>
				</div>
			)}
			<Confetti t={f - 60} x={540} y={600} n={80} />
			{card > 0 && (
				<AbsoluteFill style={{opacity: card, background: 'radial-gradient(circle at 50% 42%, #1d2a55 0%, #0a1024 55%, #04060d 100%)'}}>
					<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{display: 'inline-flex', alignItems: 'center', gap: 22, transform: `scale(${pop(f, 118, 10)})`}}>
							<div style={{width: 150, height: 150, borderRadius: 75, background: TG, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(34,158,217,0.6)'}}>
								<Plane size={96} />
							</div>
							<div style={{fontSize: 130, color: '#fff', lineHeight: 1}}>ТГК</div>
						</div>
						<div style={{fontSize: 96, color: YELLOW, marginTop: 10}}>ОТКРЫТ</div>
						<div style={{display: 'inline-block', marginTop: 40, background: YELLOW, color: '#111', borderRadius: 20, padding: '12px 34px', fontSize: 44, transform: `scale(${1 + 0.035 * Math.sin(f / 5)})`}}>ССЫЛКА — В ШАПКЕ ПРОФИЛЯ</div>
						<div style={{fontSize: 32, color: '#9fb0d6', marginTop: 30, letterSpacing: 1}}>
							РАННИЙ ДОСТУП · ГОЛОСОВАНИЯ ЗА <span style={{color: '#fff'}}>СЮЖЕТ</span>
						</div>
						<div style={{display: 'inline-block', marginTop: 46, background: RED, borderRadius: 60, padding: '22px 70px', fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(255,59,48,0.6)', transform: `scale(${1 + Math.sin(f / 5) * 0.04})`}}>ПОДПИШИСЬ</div>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
