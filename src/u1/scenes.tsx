// «Что будет, если ты попадёшь в СССР» — a 16:9 film. One day of May 1981: the alarm clock, the kitchen, the school,
// the street (soda machines, kvass, ice cream, the queue), the bus, the payphone, the yard, the TV evening, the night
// — and home again, with two kopecks and a pioneer badge in your pocket. Shots 1…40 here, 41…78 in scenes2.tsx.
// The beats are timed on the words of the voice (w(n, 'слово')), so they follow the narration whatever its pace.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Lay, Set3D} from '../components/Layers3D';
import {Fact, Glow, HandPhone, Phone, Stamp, Tag, YOU} from '../w1/kit';
import {Battery} from '../w1/hud';
import {Bedside, ModernPillow} from '../w1/late';
import {CX, CY, FarW, GREEN, H, HEAVY, mv, P81, pBox, Price, RED, SANS, scrW, W, YEL, You} from './kit';
import {AlarmClock, Bath81, Breakfast, FLOOR, Kitchen81, PhoneFlat, Room81, Soap, Stairwell, ToothPowder, Tumba, WallCal} from './home';
import {Bench, Car81, GROUND, IceCream, KvassBarrel, Kiosk81, School81, SodaMachine, Street81, Yard81} from './town';
import {BookCoupon, Bundle, Canteen81, Class81, Diary, NotebookPen, Parta, PieCompote, Scrap81, Stool, Workshop81} from './school';
import {SHOTS} from './timeline';
import {w} from './voice';

export * from './scenes2';

const L = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.sin);
const CALM: Face = {eyes: 'open', brows: 'neutral', mouth: 'flat', blush: false};
const SMILE: Face = {eyes: 'open', brows: 'neutral', mouth: 'smile', blush: false};
const WIDE: Face = {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false};
const LAUGH: Face = {eyes: 'happy', brows: 'raised', mouth: 'grin', blush: false};

// ====================================================== shot helpers ========
// a set in the 3D camera: the far set (blurred a little), near layers as children
const Shot: React.FC<{f: number; len: number; far: React.ReactNode; bg: string; m: {x?: [number, number]; y?: [number, number]; z?: [number, number]}; blur?: number; vig?: number; children?: React.ReactNode}> = ({f, len, far, bg, m, blur = 3, vig = 0.5, children}) => (
	<Set3D cam={mv(f, len, m)} bg={bg} far={<FarW>{far}</FarW>} blur={blur} vig={vig}>
		{children}
	</Set3D>
);
// the phone held up (screen space) in front of a blurred set
const PhoneUp: React.FC<{f: number; len: number; far: React.ReactNode; bg: string; x?: number; children: React.ReactNode}> = ({f, len, far, bg, x = 960, children}) => {
	const rise = lerp(f, 0, 14, 260, 0, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<Set3D cam={mv(f, len, {x: [-30, 30], z: [0, 80]})} bg={bg} far={<FarW>{far}</FarW>} blur={12} vig={0.7} />
			<AbsoluteFill style={{background: 'rgba(8,10,18,0.35)'}} />
			<Phone x={x} y={560 + rise} w={420} rot={-2}>
				{children}
			</Phone>
		</AbsoluteFill>
	);
};
const StatusLine: React.FC<{pct: number; time?: string}> = ({pct, time = '7:00'}) => (
	<div style={{position: 'absolute', left: 30, right: 26, top: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#fff', zIndex: 3}}>
		<span>{time}</span>
		<span style={{display: 'flex', alignItems: 'center', gap: 8}}>
			<span style={{fontSize: 18, color: '#ffb3ad'}}>Нет сети</span>
			<span style={{fontSize: 18}}>{pct}%</span>
		</span>
	</div>
);
// a person standing at (x, y) with scale s in a near layer at depth z
const At: React.FC<{z: number; x: number; y: number; s: number; wide?: number; children: React.ReactNode}> = ({z, x, y, s, wide, children}) => (
	<Lay z={z} box={pBox(x, y, s, wide)}>
		{children}
	</Lay>
);

// ======================================================= the morning ========
// 1. The iron alarm clock wakes you, jumping on the bedside table. (будильник, подпрыгивает)
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(1);
	const hand = interpolate(f, [len - 34, len - 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const ring = hand > 0.9 ? 0 : 1;
	return (
		<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [-40, 40], z: [120, 200]}} blur={8} vig={0.62}>
			<Lay z={-300} box={[560, 300, 800, 780]}>
				<Tumba x={960} y={860} />
				<AlarmClock x={960} y={860} s={2.1} ring={ring} f={f} />
				<g transform={`translate(${lerp(hand, 0, 1, 1700, 1080)},${lerp(hand, 0, 1, 360, 440)})`}>
					<rect x={0} y={-40} width={700} height={110} rx={55} fill={YOU.top} />
					<ellipse cx={0} cy={10} rx={90} ry={70} fill="#e8b48e" />
				</g>
			</Lay>
		</Shot>
	);
};

// 2. A carpet on the wall, a sideboard with crystal, identical five-storey blocks outside. (ковёр, сервант, пятиэтажки)
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(2);
	const look = interpolate(f, [w(2, 'ковёр'), w(2, 'сервант'), w(2, 'пятиэтажки')], [-0.7, 0.3, 0.8], clamp);
	return (
		<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [-300, 380], z: [0, 60]}} vig={0.55}>
			<At z={-300} x={560} y={1180} s={1.0}>
				<You id="u1s2" uniform={false} x={560} y={1180} scale={1.0} breathe={f} headTurn={look} face={{...WIDE, look: [look, -0.1]}} />
			</At>
			<Lay z={-240} box={[-200, 800, 1600, 400]}>
				<path d="M 0,1000 Q 560,940 1200,1000 L 1200,1200 L 0,1200 Z" fill="#c9a227" />
				{Array.from({length: 6}).map((_, k) => (
					<rect key={k} x={20 + k * 190} y={980} width={180} height={220} fill={['#a8402e', '#4a6a8a', '#7a8a4a'][k % 3]} opacity={0.85} />
				))}
			</Lay>
		</Shot>
	);
};

// 3. The calendar: May 1981. You are in the USSR. (тысяча девятьсот, СССР)
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(3);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [-120, -40], y: [-260, -280], z: [380, 480]}} blur={6} vig={0.6}>
				<Lay z={-500} box={[960, 200, 300, 300]}>
					<WallCal x={1010} y={250} s={1} />
				</Lay>
			</Shot>
			<Stamp f={f} at={w(3, 'СССР', -2)} x={1380} y={520} text="СССР" sub="1981" rot={-8} size={130} />
		</AbsoluteFill>
	);
};

// 4. The last thing you remember: falling asleep at home with the phone in your hand (a flashback).
const Flashback: React.FC<{f: number; len: number}> = ({f, len}) => (
	<AbsoluteFill style={{filter: 'saturate(0.35) contrast(1.05)'}}>
		<Set3D cam={mv(f, len, {x: [30, -30], z: [0, 90]})} bg="#c9d4e0" far={<FarW><g transform="translate(560,-380) scale(1.0)"><Bedside f={f} /></g></FarW>} blur={5} vig={0.8}>
			<Lay z={-300} box={[300, 160, 1320, 900]}>
				<g transform="translate(960,560) scale(0.9) translate(-540,-760)">
					<ModernPillow />
				</g>
				<g transform="translate(960,520)">
					<Bust kind="teen" id="u1fb" colors={YOU} scale={1.6} face={{eyes: 'closed', mouth: 'flat', brows: 'neutral', blush: false, glasses: false}} tilt={-14} />
				</g>
				<g transform="translate(1180,760) rotate(-20)">
					<rect x={-50} y={-90} width={100} height={180} rx={14} fill="#16171b" />
					<rect x={-42} y={-80} width={84} height={160} rx={10} fill="#7fb2ff" />
				</g>
				<Glow id="u1fbg" x={1180} y={740} r={300} color="#7fb2ff" o={0.6} />
			</Lay>
		</Set3D>
		<AbsoluteFill style={{boxShadow: 'inset 0 0 200px 80px rgba(255,255,255,0.55)'}} />
	</AbsoluteFill>
);
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return <Flashback f={f} len={L(4)} />;
};

// 5. The phone: 100 %, no network — and one message. (сто процентов, сообщение)
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(5);
	const big = f >= w(5, 'сто') ? pop(f, w(5, 'сто'), 11) : 0;
	const notif = lerp(f, w(5, 'сообщение', -4), w(5, 'сообщение', 8), 0, 1, Easing.out(Easing.back(1.4)));
	return (
		<PhoneUp f={f} len={len} far={<Room81 />} bg="#d8c89a">
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #3a4a7a 0%, #161d38 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
				<StatusLine pct={100} />
				<div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center'}}>
					<div style={{fontSize: 24, fontWeight: 700, opacity: 0.85}}>??.??.????</div>
					<div style={{fontSize: 110, fontWeight: 800, lineHeight: 1.05}}>7:00</div>
				</div>
				{big > 0 && (
					<div style={{position: 'absolute', top: 330, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${big})`}}>
						<Battery pct={100} w={180} h={86} stroke={8} color={GREEN} glow={0.7} />
						<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 70, color: GREEN, marginTop: 8}}>100%</div>
					</div>
				)}
				<div style={{position: 'absolute', left: 16, right: 16, top: 200, transform: `translateY(${(1 - notif) * -220}px)`, opacity: notif, background: 'rgba(245,245,250,0.96)', borderRadius: 24, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center'}}>
					<div style={{width: 60, height: 60, borderRadius: 30, background: '#2a2a33', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 34, flex: 'none'}}>?</div>
					<div>
						<div style={{fontWeight: 900, fontSize: 24, color: '#111'}}>Без отправителя</div>
						<div style={{fontWeight: 600, fontSize: 20, color: '#444'}}>1 новое сообщение</div>
					</div>
				</div>
			</div>
		</PhoneUp>
	);
};

// 6. The message (the phone voice), word by word.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(6);
	const words = ['Один', 'день', 'в СССР.', 'Сядет', 'телефон —', 'вернёшься', 'домой.'];
	const keys = ['один', 'день', 'в', 'сядет', 'телефон', 'вернёшься', 'домой'];
	const shown = words.filter((_, k) => f >= w(6, keys[k], -2));
	return (
		<PhoneUp f={f} len={len} far={<Room81 />} bg="#d8c89a">
			<div style={{position: 'absolute', inset: 0, background: '#0f1115', fontFamily: SANS}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: '#1b1d22', display: 'flex', alignItems: 'flex-end', padding: '0 22px 16px', gap: 14}}>
					<div style={{width: 62, height: 62, borderRadius: 31, background: '#2a2a33', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 34}}>?</div>
					<div style={{fontWeight: 900, fontSize: 28, color: '#f2f2f2'}}>Без отправителя</div>
				</div>
				<StatusLine pct={100} />
				<div style={{position: 'absolute', left: 18, top: 200, maxWidth: 330, background: '#262a33', borderRadius: '24px 24px 24px 6px', padding: '16px 20px', fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.2, transform: `scale(${pop(f, 2, 12)})`, transformOrigin: '0% 100%'}}>
					{shown.length ? shown.join(' ') : '…'}
				</div>
			</div>
		</PhoneUp>
	);
};

// 7. The title: one day, one charge. Let's go. (поехали)
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(7);
	const go = interpolate(f, [w(7, 'поехали'), len - 2], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #5a1a1a 0%, #2a0a0e 60%, #0c0306 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + go * 2.5})`, transformOrigin: '50% 60%'}}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.18}}>
					{Array.from({length: 24}).map((_, k) => (
						<line key={k} x1={CX} y1={CY} x2={CX + Math.cos((k * Math.PI) / 12) * 2000} y2={CY + Math.sin((k * Math.PI) / 12) * 2000} stroke="#ff6a4a" strokeWidth={40} />
					))}
				</svg>
				<div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${pop(f, 2, 12)})`}}>
					<div style={{fontSize: 70, color: '#fff'}}>ЧТО БУДЕТ, ЕСЛИ ТЫ ПОПАДЁШЬ</div>
					<div style={{fontSize: 230, color: YEL, lineHeight: 1.05, textShadow: '0 12px 0 rgba(0,0,0,0.45)'}}>В СССР</div>
				</div>
				<div style={{position: 'absolute', top: 700, width: '100%', display: 'flex', justifyContent: 'center', gap: 40, fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: '#fff'}}>
					{['1 ДЕНЬ', '1981', '1 ЗАРЯД'].map((t, k) => (
						<div key={t} style={{background: 'rgba(14,14,18,0.8)', border: `5px solid ${k === 1 ? RED : YEL}`, borderRadius: 20, padding: '10px 34px', transform: `scale(${pop(f, 10 + k * 8, 12)})`}}>
							{t}
						</div>
					))}
				</div>
			</div>
			{go > 0.4 && <AbsoluteFill style={{background: '#fffaf0', opacity: (go - 0.4) / 0.6}} />}
		</AbsoluteFill>
	);
};

// 8. Mum shouts from the kitchen: «Get up, you'll be late for school!» (кричит)
const Mum: React.FC<{x: number; y: number; s: number; f: number; face?: Face; armR?: object; armL?: object; back?: boolean}> = ({x, y, s, f, face = CALM, armR, armL, back}) => (
	<Person kind="mom" id={`u1mum${Math.round(x)}`} plain hem={0.6} colors={{top: '#4c7fae', topDark: '#3c6894', hair: '#7a4a2c'}} apron="#f3ead8" x={x} y={y} scale={s} breathe={f} face={face} armR={armR as never} armL={armL as never} back={back} />
);
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(8);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Kitchen81 f={f} steam={1} />} bg="#e8e0c8" m={{x: [80, -40], z: [0, 90]}}>
				<At z={-360} x={1280} y={1080} s={0.86}>
					<Mum x={1280} y={1080} s={0.86} f={f} face={{eyes: 'narrow', brows: 'raised', mouth: Math.floor(f / 5) % 2 ? 'open' : 'o', blush: false, look: [-0.8, 0]}} armL={{target: [-300, -760], bend: 1}} />
				</At>
			</Shot>
			<Bubble x={1120} y={300} text="Вставай, в школу опоздаешь!" from={w(8, 'вставай', -4)} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 9. The radio plays the morning exercises — and many people really do them. (гимнастика, зарядку)
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(9);
	const up = Math.abs(Math.sin(f / 9));
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Kitchen81 f={f} />} bg="#e8e0c8" m={{x: [-200, -60], z: [40, 120]}}>
				<At z={-400} x={700} y={1060} s={0.84}>
					<P81 n={1} who="m" id="u1dad" x={700} y={1060} scale={0.84} face={{eyes: 'closed', mouth: 'smile', brows: 'neutral', blush: false}} armL={{target: [-300 - 40 * up, -700 - 500 * up], bend: 1}} armR={{target: [300 + 40 * up, -700 - 500 * up], bend: -1}} />
				</At>
			</Shot>
			{[0, 1, 2].map((k) => {
				const t = ((f / 18 + k / 3) % 1);
				return <div key={k} style={{position: 'absolute', left: 240 - 120 - t * 120, top: 260 - 120 - t * 120, width: 240 + t * 240, height: 240 + t * 240, border: '6px solid #fff', borderRadius: '50%', opacity: (1 - t) * 0.5}} />;
			})}
			<Fact f={f} at={w(9, 'гимнастика', -2)} text="«НА ЗАРЯДКУ СТАНОВИСЬ!»" y={170} />
		</AbsoluteFill>
	);
};

// 10. The bathroom: tooth powder in a round box and household soap. (порошок, мыло)
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(10);
	const open = interpolate(f, [w(10, 'порошок', -6), w(10, 'порошок', 10)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Bath81 />} bg="#bcd8e8" m={{x: [-40, 40], z: [40, 120]}} blur={7}>
				<Lay z={-260} box={[300, 500, 1300, 600]}>
					<rect x={200} y={820} width={1500} height={60} rx={20} fill="#f4f4f0" />
					<ToothPowder x={700} y={790} s={1.4} open={open} />
					<Soap x={1260} y={810} s={1.3} />
				</Lay>
			</Shot>
			<Tag f={f} at={w(10, 'порошок')} x={700} y={640} tx={560} ty={240} text="ЗУБНОЙ ПОРОШОК" />
			<Tag f={f} at={w(10, 'мыло')} x={1260} y={760} tx={1400} ty={300} text="ХОЗЯЙСТВЕННОЕ МЫЛО" />
		</AbsoluteFill>
	);
};

// 11. Breakfast: porridge, a sandwich with butter, sweet tea. (каша, бутерброд, чай)
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(11);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Kitchen81 f={f} />} bg="#e8e0c8" m={{x: [-80, 60], y: [80, 120], z: [140, 240]}} blur={6}>
				<Lay z={-240} box={[300, 600, 1300, 400]}>
					<rect x={200} y={760} width={1500} height={300} fill="#e8f0f8" />
					{Array.from({length: 38}).map((_, k) => (
						<rect key={k} x={200 + k * 40} y={760} width={20} height={300} fill="#4a7ab8" opacity={0.35} />
					))}
					<g transform="translate(960,860) scale(1.6)">
						<Breakfast f={f} />
					</g>
				</Lay>
			</Shot>
			<Tag f={f} at={w(11, 'каша')} x={960} y={840} tx={760} ty={360} text="КАША" />
			<Tag f={f} at={w(11, 'бутерброд')} x={1310} y={820} tx={1380} ty={420} text="БУТЕРБРОД С МАСЛОМ" />
		</AbsoluteFill>
	);
};

// 12. Dishes are washed with mustard powder or soda — there may be no detergent in the shop. (горчицей, содой)
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(12);
	const scrub = Math.sin(f / 4) * 40;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Kitchen81 f={f} />} bg="#e8e0c8" m={{x: [60, 160], y: [-60, -100], z: [200, 300]}} blur={5}>
				<At z={-420} x={1060} y={1120} s={0.9}>
					<Mum x={1060} y={1120} s={0.9} f={f} back armL={{target: [-120 + scrub, -640], bend: 1}} armR={{target: [140 - scrub, -620], bend: -1}} />
				</At>
			</Shot>
			<Tag f={f} at={w(12, 'горчицей')} x={1090} y={420} tx={760} ty={240} text="ГОРЧИЧНЫЙ ПОРОШОК" color={YEL} />
			<Tag f={f} at={w(12, 'содой')} x={1175} y={450} tx={1450} ty={260} text="СОДА" />
		</AbsoluteFill>
	);
};

// 13. The school uniform on the chair: blue suit, white shirt, red pioneer tie — and you in it. (форма, галстук)
const Chair: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-110} y={-420} width={24} height={420} fill="#6a4628" />
		<rect x={-110} y={-430} width={220} height={60} rx={10} fill="#7a5232" />
		<rect x={-120} y={-200} width={240} height={30} fill="#7a5232" />
		<rect x={86} y={-200} width={24} height={200} fill="#6a4628" />
	</g>
);
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(13);
	const {i, t} = seg(f, [w(13, 'пионерский', 10)]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [200, 260], y: [60, 80], z: [150, 260]}} blur={7}>
					<Lay z={-300} box={[500, 200, 900, 900]}>
						<Chair x={960} y={1040} />
						<path d="M 840,640 L 1080,640 L 1120,900 L 800,900 Z" fill="#2c3a66" />
						<path d="M 900,640 L 960,720 L 1020,640" fill="#f4f4f0" />
						<path d="M 940,700 L 980,700 L 1000,860 L 960,880 L 920,860 Z" fill="#d81e2c" />
						<rect x={800} y={600} width={320} height={40} rx={10} fill="#243056" />
					</Lay>
				</Shot>
				<Tag f={f} at={w(13, 'синий')} x={830} y={760} tx={520} ty={320} text="СИНИЙ КОСТЮМ" />
				<Tag f={f} at={w(13, 'пионерский', -2)} x={960} y={800} tx={1300} ty={300} text="ПИОНЕРСКИЙ ГАЛСТУК" color={RED} />
			</AbsoluteFill>
		);
	}
	return (
		<Shot f={t} len={len - w(13, 'пионерский', 10)} far={<Room81 />} bg="#d8c89a" m={{x: [-40, 40], z: [60, 140]}}>
			<At z={-300} x={960} y={1220} s={1.05}>
				<You id="u1s13" x={960} y={1220} scale={1.05} breathe={f} face={{...SMILE, look: [0, 0]}} armL={{target: [-120, -560], bend: 1}} />
			</At>
		</Shot>
	);
};

// 14. Little ones are «октябрята» with a star, from ten — pioneers, from fourteen — the Komsomol. (октябрята, пионеры, комсомол)
const Step: React.FC<{f: number; at: number; x: number; age: string; title: string; icon: React.ReactNode; color: string}> = ({f, at, x, age, title, icon, color}) => {
	if (f < at) return null;
	const p = pop(f, at, 12);
	return (
		<div style={{position: 'absolute', left: x, top: 520, transform: `translate(-50%,-50%) scale(${p})`, width: 460, background: 'rgba(14,14,18,0.86)', border: `6px solid ${color}`, borderRadius: 28, padding: '26px 0 30px', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
			<svg width={200} height={200} viewBox="-100 -100 200 200">
				{icon}
			</svg>
			<div style={{fontSize: 48, color: '#fff', marginTop: 8}}>{title}</div>
			<div style={{fontSize: 34, color, marginTop: 6}}>{age}</div>
		</div>
	);
};
const star = (r: number) =>
	Array.from({length: 10})
		.map((_, k) => `${k === 0 ? 'M' : 'L'} ${Math.cos(-Math.PI / 2 + (k * Math.PI) / 5) * (k % 2 ? r * 0.42 : r)},${Math.sin(-Math.PI / 2 + (k * Math.PI) / 5) * (k % 2 ? r * 0.42 : r)}`)
		.join(' ') + ' Z';
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a1a1a 0%, #1a0a0c 70%)'}}>
			<Step f={f} at={w(14, 'октябрята', -4)} x={420} age="7–9 ЛЕТ" title="ОКТЯБРЯТА" color={YEL} icon={<path d={star(80)} fill="#d8282a" stroke="#e8c04a" strokeWidth={6} />} />
			<Step f={f} at={w(14, 'пионеры', -4)} x={960} age="С 10 ЛЕТ" title="ПИОНЕРЫ" color={RED} icon={<path d="M -90,-40 L 90,-40 L 20,0 L 70,90 L 0,30 L -70,90 L -20,0 Z" fill="#d81e2c" />} />
			<Step f={f} at={w(14, 'комсомол', -4)} x={1500} age="С 14 ЛЕТ" title="КОМСОМОЛ" color="#7fd0ff" icon={<g><path d="M -70,-60 L 70,-60 L 60,70 L 0,90 L -60,70 Z" fill="#d8282a" stroke="#e8c04a" strokeWidth={6} /><text x={0} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#e8c04a">ВЛКСМ</text></g>} />
		</AbsoluteFill>
	);
};

// 15. The tie only gets tied at the third attempt. (с третьей попытки)
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(15);
	const tries = Math.min(3, 1 + Math.floor(interpolate(f, [0, len * 0.8], [0, 2.99], clamp)));
	const fumble = Math.sin(f / 3) * 30;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [-30, 30], z: [200, 300]}} blur={8}>
				<Lay z={-240} box={[300, 120, 1320, 960]}>
					<g transform="translate(960,330)">
						<Bust kind="teen" id="u1tie" colors={{top: '#2c3a66', topDark: '#243056', hair: YOU.hair}} plain scale={1.7} face={{eyes: 'narrow', brows: tries < 3 ? 'angry' : 'raised', mouth: tries < 3 ? 'tight' : 'smile', blush: false, glasses: false, look: [0, 0.8]}} />
					</g>
					<path d="M 880,520 L 960,580 L 1040,520 L 1040,560 L 960,620 L 880,560 Z" fill="#f4f4f0" />
					<g transform={`translate(960,600) rotate(${tries < 3 ? fumble * 0.3 : 0})`}>
						<path d="M -30,0 L 30,0 L 20,40 L -20,40 Z" fill="#d81e2c" />
						<path d={tries < 3 ? 'M -20,40 L -90,260 L -50,270 L 0,60 Z M 20,40 L 60,240 L 20,250 L 0,60 Z' : 'M -14,40 L -60,300 L -20,310 L 0,60 Z M 14,40 L 50,280 L 14,290 L 0,60 Z'} fill="#c8102e" />
					</g>
					{[-1, 1].map((d) => (
						<g key={d} transform={`translate(${960 + d * (180 + (tries < 3 ? fumble : 0))},760)`}>
							<rect x={-60} y={-40} width={120} height={260} rx={50} fill="#2c3a66" />
							<ellipse cx={0} cy={-50} rx={60} ry={54} fill="#e8b48e" />
						</g>
					))}
				</Lay>
			</Shot>
			<div style={{position: 'absolute', right: 120, top: 360, fontFamily: HEAVY, fontWeight: 900, fontSize: 90, color: tries === 3 ? GREEN : '#fff', textShadow: '0 6px 0 rgba(0,0,0,0.5)', transform: `scale(${pop(f, Math.floor(((tries - 1) * len * 0.8) / 2.99), 10)})`}}>
				{tries}/3
			</div>
		</AbsoluteFill>
	);
};

// 16. A key on a string round your neck: your parents work till evening; you'll come home by yourself. (ключ, сам)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(16);
	const sw = Math.sin(f / 10) * 8;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Room81 />} bg="#d8c89a" m={{x: [-40, 40], y: [40, 0], z: [260, 330]}} blur={8}>
				<Lay z={-220} box={[400, 60, 1120, 1020]}>
					<g transform="translate(960,260)">
						<Bust kind="teen" id="u1key" colors={{top: '#2c3a66', topDark: '#243056', hair: YOU.hair}} plain scale={1.9} face={{...SMILE, glasses: false, look: [0, 0.6]}} />
					</g>
					<path d={`M 860,560 Q 960,${820 + sw} 1060,560`} stroke="#d8c8a0" strokeWidth={6} fill="none" />
					<g transform={`translate(${960 + sw},${830}) rotate(${sw})`}>
						<circle cx={0} cy={0} r={34} fill="none" stroke="#c9a54a" strokeWidth={14} />
						<rect x={-10} y={30} width={20} height={110} fill="#c9a54a" />
						<rect x={0} y={100} width={34} height={14} fill="#c9a54a" />
						<rect x={0} y={124} width={24} height={14} fill="#c9a54a" />
					</g>
				</Lay>
			</Shot>
			<Fact f={f} at={w(16, 'родители', -2)} text="РОДИТЕЛИ — НА РАБОТЕ ДО ВЕЧЕРА" y={170} />
		</AbsoluteFill>
	);
};

// 17. The stairwell is dark — the bulb has been unscrewed again. Good thing you have a flashlight. (темно, фонарик)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(17);
	const on = interpolate(f, [w(17, 'фонарик', -8), w(17, 'фонарик', -2)], [0, 1], clamp);
	const bx = lerp(f, w(17, 'фонарик'), len, 900, 1300);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Shot f={f} len={len} far={<Stairwell />} bg="#3a4444" m={{x: [-40, 60], z: [0, 80]}} blur={2} vig={0.7} />
			<AbsoluteFill style={{background: `radial-gradient(circle at ${bx}px 560px, rgba(0,0,0,${0.05 + 0.85 * (1 - on)}) 0px, rgba(0,0,0,${0.05 + 0.85 * (1 - on)}) ${120 + 260 * on}px, rgba(0,0,0,0.93) ${180 + 380 * on}px)`}} />
			<Tag f={f} at={w(17, 'лампочку')} x={1000} y={110} tx={700} ty={200} text="ЛАМПОЧКИ НЕТ" color={RED} />
		</AbsoluteFill>
	);
};

// 18. The yard: no foreign cars, only «Жигули», «Москвич» and «Запорожец». (Жигули, Москвич, Запорожец)
const CARS: {x: number; kind: 'sedan' | 'small' | 'hatch'; color: string; name: string; word: string}[] = [
	{x: 340, kind: 'sedan', color: '#c8402a', name: '«ЖИГУЛИ»', word: 'жигули'},
	{x: 1000, kind: 'hatch', color: '#3a7a5a', name: '«МОСКВИЧ»', word: 'москвич'},
	{x: 1620, kind: 'small', color: '#e0b03a', name: '«ЗАПОРОЖЕЦ»', word: 'запорожец'},
];
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(18);
	const cam = mv(f, len, {x: [-80, 80], z: [0, 80]});
	return (
		<AbsoluteFill>
			<Set3D cam={cam} bg="#8fb4d8" far={<FarW><Yard81 f={f} /></FarW>}>
				<Lay z={-420} box={[-200, 700, 2300, 420]}>
					{CARS.map((c) => (
						<g key={c.x} transform={`translate(${c.x},1040) scale(0.9)`}>
							<Car81 kind={c.kind} color={c.color} />
						</g>
					))}
				</Lay>
			</Set3D>
			{CARS.map((c) => {
				const p = scrW(cam, -420, c.x, 860);
				return <Tag key={c.x} f={f} at={w(18, c.word, -2)} x={p.x} y={p.y} tx={p.x} ty={300} text={c.name} />;
			})}
		</AbsoluteFill>
	);
};

// 19. A car is waited for for years, in a queue. It's not a luxury — it's a dream. (годами, мечта)
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(19);
	const rub = Math.sin(f / 4) * 60;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} />} bg="#8fb4d8" m={{x: [60, -60], z: [80, 180]}}>
				<Lay z={-380} box={[200, 500, 1500, 600]}>
					<g transform="translate(900,1060) scale(1.15)">
						<Car81 kind="sedan" color="#2a5aa8" />
					</g>
				</Lay>
				<At z={-300} x={1420} y={1120} s={0.86}>
					<P81 n={0} who="m" id="u1owner" x={1420} y={1120} scale={0.86} breathe={f} headTurn={-0.6} face={{eyes: 'happy', mouth: 'smile', brows: 'neutral', blush: true}} armL={{target: [-260 + rub, -520], bend: 1}} itemL={<rect x={-30} y={-20} width={60} height={40} rx={8} fill="#e8d860" />} />
				</At>
			</Shot>
			<Stamp f={f} at={w(19, 'мечта', -2)} x={960} y={250} text="МЕЧТА" rot={-6} color={YEL} size={100} />
		</AbsoluteFill>
	);
};

// 20. Battery 90 %. You photograph the yard; the grannies on the bench already discuss whose you are. (девяносто, бабушки)
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(20);
	const flash = f >= w(20, 'фотографируешь') ? interpolate(f, [w(20, 'фотографируешь'), w(20, 'фотографируешь', 3), w(20, 'фотографируешь', 10)], [0, 0.8, 0], clamp) : 0;
	const look = interpolate(f, [w(20, 'бабушки', -4), w(20, 'бабушки', 6)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} />} bg="#8fb4d8" m={{x: [-60, 60], z: [40, 120]}}>
				<Lay z={-460} box={[900, 600, 1100, 520]}>
					<Bench x={1460} y={1000} s={1.1} />
					{[0, 1].map((k) => (
						<Person key={k} kind="mom" id={`u1gran${k}`} plain hem={0.6} hideLegs colors={{top: ['#5a4a6a', '#6a3a3a'][k], topDark: ['#5a4a6a', '#6a3a3a'][k], hair: '#a8a8a4'}} hat={{type: 'scarf', color: ['#d6b04a', '#e8e2d0'][k]}} x={1320 + k * 280} y={835 + 400 * 0.7} scale={0.7} breathe={f + k * 9} headTurn={-0.6 * look} face={{eyes: 'narrow', brows: 'raised', mouth: Math.floor(f / 6) % 2 && look > 0.5 ? 'o' : 'flat', blush: false, look: [-0.9 * look, 0]}} />
					))}
				</Lay>
				<At z={-260} x={420} y={1180} s={1.0}>
					<You id="u1s20" x={420} y={1180} scale={1.0} breathe={f} headTurn={0.4} face={{...SMILE, look: [0.6, -0.2]}} armR={{target: [260, -900], bend: -1}} itemR={<HandPhone s={1.2} flash={flash} />} />
				</At>
			</Shot>
			{flash > 0 && <AbsoluteFill style={{background: '#fffbe8', opacity: flash * 0.6}} />}
			<Bubble x={1380} y={500} text="Чей это?" from={w(20, 'бабушки')} to={len} tail="right" whisper />
		</AbsoluteFill>
	);
};

// 21. No advertising on the streets; on the roof — huge letters: «Миру — мир!» (рекламы, мир)
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(21);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} />} bg="#8fb4d8" m={{x: [200, 260], y: [140, -380], z: [0, 200]}} />
			<Fact f={f} at={w(21, 'рекламы', -2)} to={w(21, 'зато')} text="НИ ОДНОЙ РЕКЛАМЫ" y={900} color="#9aa3b2" />
		</AbsoluteFill>
	);
};

// 22. School. Pupils on duty with red armbands check your change shoes. (школа, сменку)
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(22);
	const kids = [
		{x: 260, girl: false, n: 0},
		{x: 460, girl: true, n: 1},
		{x: 1480, girl: true, n: 2},
		{x: 1680, girl: false, n: 3},
	];
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<School81 f={f} />} bg="#8fb4d8" m={{x: [-60, 60], z: [0, 110]}}>
				<Lay z={-520} box={[-200, 500, 2300, 600]}>
					{kids.map((k, j) => (
						<g key={j}>
							<Pupil2 x={k.x} y={1010} s={0.62} girl={k.girl} n={k.n} f={f} />
						</g>
					))}
				</Lay>
				<Lay z={-380} box={[700, 380, 520, 720]}>
					<Pupil2 x={860} y={1060} s={0.78} girl f={f} n={2} duty armR={{target: [200, -560], bend: -1}} />
					<Pupil2 x={1080} y={1060} s={0.8} f={f} n={1} duty />
				</Lay>
			</Shot>
			<Bubble x={940} y={300} text="Сменка есть?" from={w(22, 'проверяют', -2)} to={len} />
		</AbsoluteFill>
	);
};
// a pupil (with the red duty armband if `duty`)
const Pupil2: React.FC<{x: number; y: number; s: number; girl?: boolean; n?: number; f: number; duty?: boolean; armR?: object; face?: Face}> = ({x, y, s, girl = false, n = 0, f, duty, armR, face}) => (
	<g>
		<Pupil3 x={x} y={y} s={s} girl={girl} n={n} f={f} armR={armR} face={face} />
		{duty && <rect x={x - (girl ? 118 : 128) * s} y={y - (girl ? 610 : 590) * s} width={46 * s} height={30 * s} rx={4} fill="#d8282a" />}
	</g>
);
const Pupil3: React.FC<{x: number; y: number; s: number; girl: boolean; n: number; f: number; armR?: object; armL?: object; itemR?: React.ReactNode; face?: Face}> = ({x, y, s, girl, n, f, armR, armL, itemR, face}) =>
	girl ? (
		<Person kind="girl" id={`u1pg${Math.round(x)}${n}`} plain colors={{top: '#6a3a24', topDark: '#5a3020', hair: ['#3a2a20', '#7a4a2c', '#5a3a28', '#2a2220'][n % 4], pants: '#2a2226'}} apron="#1a1a1e" pioneer x={x} y={y} scale={s} breathe={f + n * 7} armR={armR as never} armL={armL as never} itemR={itemR} face={{...(face ?? SMILE), blush: true}} />
	) : (
		<Person kind="boy" id={`u1pb${Math.round(x)}${n}`} colors={{top: '#2c3a66', topDark: '#243056', pants: '#2c3a66', hair: ['#5a3a28', '#b4542a', '#2a2220', '#d6a24a'][n % 4]}} pioneer x={x} y={y} scale={s} breathe={f + n * 7} armR={armR as never} armL={armL as never} itemR={itemR} face={{...(face ?? SMILE), blush: true}} />
	);

// 23. «Сменка» — a second pair of shoes in a bag. Forgot it — a note in your diary. (мешке, дневник)
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(23);
	const {i} = seg(f, [w(23, 'забыл', -6)]);
	if (i === 0) {
		return (
			<Shot f={f} len={len} far={<School81 f={f} />} bg="#8fb4d8" m={{x: [0, 0], z: [200, 260]}} blur={10}>
				<Lay z={-220} box={[500, 180, 920, 900]}>
					<path d="M 780,300 Q 960,250 1140,300 L 1190,960 L 730,960 Z" fill="#3a6a9a" />
					<path d="M 800,300 Q 960,180 1120,300" stroke="#e8e4d8" strokeWidth={10} fill="none" />
					<path d="M 840,700 Q 900,600 1000,660 L 1080,700 L 1080,760 L 840,760 Z" fill="#2a2c30" />
					<rect x={830} y={760} width={260} height={30} rx={10} fill="#1a1c20" />
				</Lay>
			</Shot>
		);
	}
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [0, 0], z: [200, 240]}} blur={12}>
				<Lay z={-220} box={[400, 220, 1120, 720]}>
					<g transform="translate(960,580) scale(0.95)">
						<Diary />
					</g>
				</Lay>
			</Shot>
			<div style={{position: 'absolute', left: 1210, top: 330, transform: `rotate(-6deg) scale(${pop(f, w(23, 'дневник', -4), 12)})`, fontFamily: "'DejaVu Serif', serif", fontStyle: 'italic', fontSize: 40, color: '#c8282a', width: 380, lineHeight: 1.2}}>
				Забыл сменную обувь!
			</div>
		</AbsoluteFill>
	);
};

// 24. The classroom: desks with lift-up lids, chalk and a wet rag at the board. (парты, мел)
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(24);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [-140, 80], z: [0, 110]}}>
				<Lay z={-420} box={[-200, 700, 2300, 500]}>
					{[300, 900, 1500].map((px, k) => (
						<Parta key={px} x={px} y={930} s={0.9} open={k === 1 ? interpolate(f, [w(24, 'откидными', -4), w(24, 'откидными', 10)], [0, 1], clamp) : 0} />
					))}
				</Lay>
				<Lay z={-260} box={[-400, 800, 2700, 400]}>
					{[-100, 640, 1380, 2100].map((px) => (
						<Parta key={px} x={px} y={1060} s={1.1} />
					))}
				</Lay>
			</Shot>
			<Tag f={f} at={w(24, 'мел')} x={535} y={780} tx={420} ty={180} text="МЕЛ" />
			<Tag f={f} at={w(24, 'тряпка')} x={1360} y={775} tx={1480} ty={190} text="МОКРАЯ ТРЯПКА" />
		</AbsoluteFill>
	);
};

// 25. In the satchel: squared notebooks at 2 kopecks and a ballpoint pen at 35. (две копейки, тридцать пять)
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(25);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [-30, 30], z: [200, 260]}} blur={12}>
				<Lay z={-220} box={[400, 200, 1120, 760]}>
					<g transform="translate(960,560) scale(1.05)">
						<NotebookPen />
					</g>
				</Lay>
			</Shot>
			<Price f={f} at={w(25, 'тетради', -2)} x={560} y={320} what="ТЕТРАДЬ" price="2 коп." />
			<Price f={f} at={w(25, 'ручка', -2)} x={1440} y={300} what="РУЧКА" price="35 коп." />
		</AbsoluteFill>
	);
};

// 26. Grades from 1 to 5; parents sign the diary every week. (единицы, пятёрки, подписывают)
export const S26: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(26);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [-30, 30], z: [200, 260]}} blur={12}>
				<Lay z={-220} box={[380, 200, 1160, 760]}>
					<g transform="translate(960,580)">
						<Diary sign={interpolate(f, [w(26, 'подписывают', -4), w(26, 'подписывают', 20)], [0, 1], clamp)} />
					</g>
				</Lay>
			</Shot>
			<Tag f={f} at={w(26, 'оценки')} x={850} y={380} tx={520} ty={190} text="ОТ «1» ДО «5»" />
		</AbsoluteFill>
	);
};

// 27. And yes — school on Saturday too. A six-day week. (субботу, шесть дней)
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a3a5a 0%, #101828 70%)'}}>
			<div style={{position: 'absolute', top: 360, width: '100%', display: 'flex', justifyContent: 'center', gap: 26, fontFamily: HEAVY, fontWeight: 900}}>
				{days.map((d, k) => {
					const on = k < 6 && f >= w(27, 'шесть', -10) + k * 3;
					const sat = k === 5 && f >= w(27, 'субботу', -4);
					return (
						<div key={d} style={{width: 190, height: 220, borderRadius: 26, background: k === 6 ? '#3a4a5a' : on || sat ? (k === 5 ? RED : '#2a8a5a') : 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 70, transform: `scale(${sat || on ? 0.9 + 0.1 * pop(f, w(27, 'шесть', -10) + k * 3, 10) : 0.9})`}}>
							{d}
							<div style={{fontSize: 30, marginTop: 10, opacity: 0.85}}>{k === 6 ? 'выходной' : 'школа'}</div>
						</div>
					);
				})}
			</div>
			<Fact f={f} at={w(27, 'шесть', -2)} text="ШЕСТИДНЕВКА" y={780} color={YEL} />
		</AbsoluteFill>
	);
};

// 28. At the labour lessons the boys plane stools and the girls sew aprons. (табуретки, фартуки)
export const S28: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(28);
	const plane = Math.sin(f / 4) * 80;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Workshop81 />} bg="#c8c0a8" m={{x: [-160, 160], z: [40, 110]}}>
				<Lay z={-380} box={[-200, 400, 1500, 700]}>
					<g transform="translate(560,620)">
						<Stool done={interpolate(f, [0, len], [0.3, 1], clamp)} />
					</g>
					<Pupil3 x={560 + plane * 0.4} y={1060} s={0.74} girl={false} n={1} f={f} armR={{target: [140 + plane, -480], bend: -1}} face={{eyes: 'narrow', mouth: 'tight', brows: 'angry', blush: true}} />
				</Lay>
				<Lay z={-380} box={[1100, 400, 900, 700]}>
					<Pupil3 x={1500} y={1060} s={0.74} girl n={0} f={f} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0, 0.8], blush: true}} armR={{target: [120, -470 + Math.sin(f / 3) * 10], bend: -1}} />
				</Lay>
			</Shot>
			<Tag f={f} at={w(28, 'табуретки')} x={560} y={420} tx={480} ty={170} text="ТАБУРЕТКА" />
			<Tag f={f} at={w(28, 'фартуки')} x={1520} y={420} tx={1520} ty={170} text="ФАРТУК" />
		</AbsoluteFill>
	);
};

// 29. The teacher spots the phone: «What's that, a calculator? Hand it in till the end of the lesson!» (калькулятор)
const Teacher: React.FC<{x: number; y: number; s: number; f: number; face?: Face; armR?: object; armL?: object; itemL?: React.ReactNode}> = ({x, y, s, f, face = CALM, armR, armL, itemL}) => (
	<Person kind="mom" id={`u1tch${Math.round(x)}`} plain hem={0.62} colors={{top: '#6a4a6a', topDark: '#5a3a5a', hair: '#5a3a28'}} x={x} y={y} scale={s} breathe={f} face={face} armR={armR as never} armL={armL as never} itemL={itemL} />
);
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(29);
	const give = interpolate(f, [w(29, 'сдай', -4), w(29, 'сдай', 12)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [80, -40], z: [60, 140]}}>
				<At z={-420} x={1300} y={1100} s={0.92}>
					<Teacher x={1300} y={1100} s={0.92} f={f} face={{eyes: 'narrow', brows: 'raised', mouth: Math.floor(f / 5) % 2 && f < w(29, 'урока', 8) ? 'open' : 'tight', blush: false, look: [-0.8, 0.2]}} armL={{target: [-420 + 120 * give, -700], bend: 1}} itemL={give > 0.6 ? <HandPhone s={1.1} /> : undefined} />
				</At>
				<At z={-260} x={560} y={1220} s={1.0}>
					<You id="u1s29" x={560} y={1220} scale={1.0} breathe={f} headTurn={0.5} face={{eyes: 'wide', brows: 'worried', mouth: 'o', blush: true, look: [0.7, -0.2]}} armR={give < 0.6 ? {target: [280 + 200 * give, -760], bend: -1} : undefined} itemR={give < 0.6 ? <HandPhone s={1.2} /> : undefined} />
				</At>
			</Shot>
			<Bubble x={1220} y={250} text="Это что, калькулятор?" from={w(29, 'это', -2)} to={w(29, 'сдай', -2)} tail="right" />
			<Bubble x={1220} y={250} text="Сдай до конца урока!" from={w(29, 'сдай', -2)} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 30. The whole lesson the class whispers; someone is sure — it's a spy device. (шепчется, шпионский)
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(30);
	const turn = (k: number) => Math.sin(f / 14 + k) * 0.6;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Class81 />} bg="#e0dcc8" m={{x: [-60, 60], z: [20, 100]}}>
				<Lay z={-380} box={[-200, 500, 2300, 700]}>
					{[200, 560, 920, 1280, 1640].map((px, k) => (
						<g key={px}>
							<Pupil3 x={px} y={1080} s={0.7} girl={k % 2 === 1} n={k} f={f} face={{eyes: 'narrow', brows: 'raised', mouth: Math.floor(f / 7 + k) % 3 === 0 ? 'o' : 'flat', look: [turn(k), 0], blush: true}} />
							<Parta x={px} y={900} s={0.62} />
						</g>
					))}
				</Lay>
			</Shot>
			<Bubble x={760} y={330} text="Это шпионский прибор!" from={w(30, 'кто', -2)} to={len} whisper />
		</AbsoluteFill>
	);
};

// 31. Break: in the canteen a jam pie for 5 kopecks and compote in a faceted glass. (пирожок, пять копеек, компот)
export const S31: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(31);
	const {i, t} = seg(f, [w(31, 'пирожок', -8)]);
	if (i === 0) {
		return (
			<Shot f={f} len={len} far={<Canteen81 />} bg="#e8e4d4" m={{x: [-100, 100], z: [0, 80]}}>
				<Lay z={-360} box={[-200, 600, 2300, 520]}>
					{[200, 560, 1300, 1660].map((px, k) => (
						<Pupil3 key={px} x={px} y={1120} s={0.78} girl={k % 2 === 0} n={k + 1} f={f} face={LAUGH} />
					))}
				</Lay>
			</Shot>
		);
	}
	return (
		<AbsoluteFill>
			<Shot f={t} len={len - w(31, 'пирожок', -8)} far={<Canteen81 />} bg="#e8e4d4" m={{x: [-20, 20], z: [200, 260]}} blur={12}>
				<Lay z={-220} box={[400, 200, 1120, 760]}>
					<rect x={500} y={760} width={920} height={40} rx={10} fill="#c9c4b8" />
					<g transform="translate(960,760) scale(1.5)">
						<PieCompote />
					</g>
				</Lay>
			</Shot>
			<Price f={f} at={w(31, 'пять')} x={560} y={260} what="ПИРОЖОК" price="5 коп." />
			<Tag f={f} at={w(31, 'компот', -2)} x={1150} y={560} tx={1450} ty={220} text="ГРАНЁНЫЙ СТАКАН" />
		</AbsoluteFill>
	);
};

// 32. After school — waste paper. 20 kg of old newspapers = a coupon for a book. (макулатура, двадцать, талон)
export const S32: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(32);
	const kg = Math.round(interpolate(f, [w(32, 'двадцать', -20), w(32, 'двадцать', 4)], [0, 20], clamp));
	const card = f >= w(32, 'талон', -4);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Scrap81 kg={kg} />} bg="#9fc4e0" m={{x: [-60, 60], z: [0, 100]}}>
				<Lay z={-380} box={[200, 500, 1500, 600]}>
					{[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${880 + (k - 1) * 120},${880 - (k === 1 ? 0 : 0)})`}>
							<Bundle s={0.7} />
						</g>
					))}
					<Pupil3 x={420} y={1080} s={0.76} girl={false} n={2} f={f} face={LAUGH} armR={{target: [220, -560], bend: -1}} itemR={<g transform="translate(0,40)"><Bundle s={0.4} /></g>} />
					<Pupil3 x={1420} y={1080} s={0.74} girl n={3} f={f} face={SMILE} />
				</Lay>
			</Shot>
			{card && (
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(1540,330) scale(${0.8 * pop(f, w(32, 'талон', -4), 12)}) rotate(-5)`}>
						<BookCoupon />
					</g>
				</svg>
			)}
		</AbsoluteFill>
	);
};

// 33. In the evening — clubs at the Palace of Pioneers: chess, model planes, dances. All free. (шахматы, авиамодели, бесплатно)
const ChessBoard: React.FC = () => (
	<g>
		{Array.from({length: 8}).flatMap((_, r) => Array.from({length: 8}).map((__, c) => <rect key={`${r}-${c}`} x={c * 50} y={r * 50} width={50} height={50} fill={(r + c) % 2 ? '#8a5a34' : '#f0d8a8'} />))}
		{[[1, 1], [3, 2], [5, 5], [6, 3]].map(([c, r], k) => (
			<g key={k} transform={`translate(${c * 50 + 25},${r * 50 + 40})`}>
				<path d="M -14,0 L 14,0 L 8,-26 Q 0,-40 -8,-26 Z" fill={k % 2 ? '#1a1a1a' : '#f4f0e8'} stroke="#3a3a3a" strokeWidth={2} />
			</g>
		))}
	</g>
);
const ModelPlane: React.FC = () => (
	<g>
		<rect x={-120} y={-10} width={240} height={20} rx={10} fill="#f4f0e8" />
		<rect x={-20} y={-90} width={40} height={180} rx={10} fill="#e0b03a" />
		<path d="M 100,-10 L 140,-50 L 150,-10 Z" fill="#c8282a" />
		<path d="M -140,-20 L -120,20 L -150,20 Z" fill="#c8282a" />
	</g>
);
export const S33: React.FC = () => {
	const f = useCurrentFrame();
	const fly = f / 12;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #f4ecd8 0%, #d8c8a0 70%)'}}>
			<div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 60, color: '#8a1e1e', letterSpacing: 6}}>ДВОРЕЦ ПИОНЕРОВ</div>
			{[
				{x: 360, word: 'шахматы', title: 'ШАХМАТЫ', art: <g transform="translate(-200,-200)"><ChessBoard /></g>},
				{x: 960, word: 'авиамодели', title: 'АВИАМОДЕЛИ', art: <g transform={`rotate(${Math.sin(fly) * 10}) translate(${Math.sin(fly) * 40},${Math.cos(fly) * 20})`}><ModelPlane /></g>},
				{x: 1560, word: 'танцы', title: 'ТАНЦЫ', art: <g>{[-80, 80].map((dx, k) => <g key={k} transform={`translate(${dx},120) scale(0.26)`}><Pupil3 x={0} y={0} s={1} girl={k === 0} n={k} f={f} face={LAUGH} armL={{target: [-160, -1000 + Math.sin(f / 5 + k) * 80], bend: 1} as never} /></g>)}</g>},
			].map((c) =>
				f >= w(33, c.word, -4) ? (
					<div key={c.x} style={{position: 'absolute', left: c.x, top: 520, transform: `translate(-50%,-50%) scale(${pop(f, w(33, c.word, -4), 12)})`, width: 500, height: 540, background: '#fff', borderRadius: 30, boxShadow: '0 16px 40px rgba(0,0,0,0.25)', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<svg width={500} height={420} viewBox="-250 -230 500 420">
							{c.art}
						</svg>
						<div style={{fontSize: 46, color: '#2a2c30'}}>{c.title}</div>
					</div>
				) : null,
			)}
			<Stamp f={f} at={w(33, 'бесплатно', -4)} x={960} y={900} text="БЕСПЛАТНО" rot={-5} color={GREEN} size={80} />
		</AbsoluteFill>
	);
};

// 34. The street: soda machines at the corner. (автоматы)
export const S34: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(34);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-200, 120], z: [0, 140]}}>
				<Lay z={-500} box={[-200, 300, 2300, 800]}>
					{[200, 420, 640].map((sx) => (
						<SodaMachine key={sx} x={sx} y={1000} s={0.62} />
					))}
					<Kiosk81 x={1500} y={1000} s={0.75} kind="ice" />
				</Lay>
				<Lay z={-320} box={[700, 300, 700, 800]}>
					<You id="u1s34" x={1040} y={1170} scale={0.92} walk={f * 0.28} headTurn={-0.4} face={{...SMILE, look: [-0.6, 0]}} />
				</Lay>
			</Shot>
		</AbsoluteFill>
	);
};

// 35. Without syrup — one kopeck, with syrup — three. (одна копейка, три)
export const S35: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(35);
	const fill = interpolate(f, [w(35, 'одна', -6), w(35, 'одна', 12)], [0, 0.45], clamp) + interpolate(f, [w(35, 'три', -6), w(35, 'три', 14)], [0, 0.55], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-20, 20], z: [180, 220]}} blur={12}>
				<Lay z={-220} box={[560, -60, 800, 1180]}>
					<SodaMachine x={960} y={1120} s={1.35} glass={fill} f={f} />
				</Lay>
			</Shot>
			<Price f={f} at={w(35, 'одна', -2)} x={420} y={360} what="БЕЗ СИРОПА" price="1 коп." color="#bfe3f2" />
			<Price f={f} at={w(35, 'три', -2)} x={1500} y={360} what="С СИРОПОМ" price="3 коп." color={YEL} />
		</AbsoluteFill>
	);
};

// 36. One glass for everybody. Glass. It's rinsed right inside the machine. (стакан, ополаскивают)
export const S36: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(36);
	const rinse = interpolate(f, [w(36, 'ополаскивают', -8), w(36, 'ополаскивают', 4)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-20, 20], z: [200, 240]}} blur={12}>
				<Lay z={-220} box={[560, -60, 800, 1180]}>
					<SodaMachine x={960} y={1120} s={1.35} rinse={rinse} f={f} />
				</Lay>
				<Lay z={-200} box={[1200, 300, 800, 800]}>
					{[0, 1, 2].map((k) => (
						<P81 key={k} n={k + 2} who={(['m', 'f', 'k'] as const)[k]} id={`u1q36${k}`} x={1420 + k * 200} y={1180 + k * 10} scale={0.7} breathe={f + k * 5} headTurn={-0.5} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.8, 0], blush: false}} />
					))}
				</Lay>
			</Shot>
			<Fact f={f} at={w(36, 'один', -2)} text="ОДИН СТАКАН НА ВСЕХ" y={170} />
		</AbsoluteFill>
	);
};

// 37. Next to it — the yellow kvass barrel: a small mug 3 kopecks, a big one 6. (квасом, три, шесть)
export const S37: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(37);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [80, -80], z: [60, 150]}}>
				<Lay z={-400} box={[200, 300, 1500, 800]}>
					<KvassBarrel x={900} y={1000} s={1.0} />
					<Person kind="mom" id="u1kvass" plain hem={0.6} colors={{top: '#f4f4f0', topDark: '#f4f4f0', hair: '#c47a3a'}} x={1460} y={1010} scale={0.74} breathe={f} headTurn={-0.4} face={SMILE} armL={{target: [-300, -560], bend: 1}} itemL={<g><path d="M -26,0 L 26,0 L 22,-90 L -22,-90 Z" fill="#c8843a" opacity={0.85} /><rect x={-26} y={-96} width={52} height={14} fill="#fff4e0" /></g>} />
				</Lay>
			</Shot>
			<Price f={f} at={w(37, 'маленькая', -2)} x={460} y={260} what="МАЛЕНЬКАЯ КРУЖКА" price="3 коп." />
			<Price f={f} at={w(37, 'большая', -2)} x={1460} y={260} what="БОЛЬШАЯ" price="6 коп." />
		</AbsoluteFill>
	);
};

// 38. At the kiosk — «пломбир» in a wafer cup, about 20 kopecks. (пломбир, двадцати)
export const S38: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(38);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-60, 60], z: [60, 140]}}>
				<Lay z={-420} box={[900, 300, 1100, 800]}>
					<Kiosk81 x={1460} y={1000} s={0.9} kind="ice" />
				</Lay>
				<At z={-260} x={620} y={1200} s={1.02}>
					<You id="u1s38" x={620} y={1200} scale={1.02} breathe={f} headTurn={0.2} face={{eyes: 'happy', mouth: 'smile', brows: 'raised', blush: true}} armR={{target: [200, -900], bend: -1}} itemR={<IceCream s={1.6} />} />
				</At>
			</Shot>
			<Price f={f} at={w(38, 'двадцати', -2)} x={1300} y={230} what="ПЛОМБИР" price="≈ 20 коп." />
		</AbsoluteFill>
	);
};

// 39. And at «Союзпечать» — newspapers for 2–3 kopecks and stamps for the collection. (газеты, марки)
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(39);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [60, -60], y: [40, 0], z: [120, 220]}}>
				<Lay z={-360} box={[300, 200, 1300, 900]}>
					<Kiosk81 x={960} y={1040} s={1.25} kind="press" />
				</Lay>
			</Shot>
			<Price f={f} at={w(39, 'газеты', -2)} x={440} y={300} what="ГАЗЕТА" price="2–3 коп." />
			<Tag f={f} at={w(39, 'марки', -2)} x={830} y={680} tx={1500} ty={260} text="МАРКИ" />
		</AbsoluteFill>
	);
};

// 40. Battery 70 %. You shoot the ice cream for your stories… which there's nobody to show. (семьдесят, сторис, некому)
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(40);
	const err = f >= w(40, 'некому', -6);
	return (
		<PhoneUp f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8">
			<div style={{position: 'absolute', inset: 0, background: '#000', fontFamily: SANS}}>
				<svg width="100%" height="100%" viewBox="0 0 400 820" preserveAspectRatio="xMidYMid slice">
					<rect width={400} height={820} fill="#8fb4d8" />
					<rect y={520} width={400} height={300} fill="#a59c8e" />
					<g transform="translate(200,520) scale(3)">
						<IceCream />
					</g>
				</svg>
				<StatusLine pct={70} time="15:40" />
				<div style={{position: 'absolute', left: 16, right: 16, bottom: 30, display: 'flex', justifyContent: 'space-between'}}>
					<div style={{background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 20, padding: '10px 18px', fontSize: 22, fontWeight: 800}}>Ваша история</div>
					<div style={{background: err ? RED : '#2d6cdf', color: '#fff', borderRadius: 20, padding: '10px 18px', fontSize: 22, fontWeight: 800}}>{err ? 'Нет сети ✕' : 'Отправить'}</div>
				</div>
			</div>
		</PhoneUp>
	);
};

export const _KEEP_U1 = {CY, GROUND, FLOOR, interpolate, Glow, Kiosk81, Lay};
