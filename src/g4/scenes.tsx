// «Голосовые из завтра» — часть 4 (the viewers chose to turn the phone off). 19 shots on the
// timeline of src/g4/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part g4).
// Phone UI from part 1, mom / recap frame / big clock / finale from part 2, Max and the kids from 2b,
// the call screen and the double from part 3.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {HEAVY} from '../components/Overlays';
import {Bust, Colors, Face, Person} from '../components/Person';
import {Kitchen} from '../components/Set';
import {Stage} from '../components/Stage';
import {SANS} from '../scenes/S12_S16';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import * as G2B from '../g2b/scenes';
import * as G3 from '../g3/scenes';
import envJson from './env.json';

const {YELLOW, RED, NIGHT, PHONE_BG, Phone, ChatScreen, VoiceBubble, Bedroom, Vision, rnd, focus} = G1;
const {Recap, Stamp, MOM, Finale, BigClock} = G2;
const {Max, MAX} = G2B;
const {CallScreen, WarmClose, DOUBLE_FACE} = G3;

const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

const TEACH: Colors = {top: '#6a4a8a', topDark: '#55396f', hair: '#5a3a2a', pants: '#e8b48e', shoes: '#3a2a2a', skin: '#f2c3a0'};
const KID_COLS: Colors[] = [
	{top: '#3b6fd6', topDark: '#2f5bb0', hair: '#2a1a12'},
	{top: '#e0a526', topDark: '#c08a18', hair: '#8a5a32'},
	{top: '#8a5ab8', topDark: '#6f4896', hair: '#1f1a1a'},
	{top: '#2a9a9a', topDark: '#207a7a', hair: '#c27b3a'},
];
const SMILE: Face = {...DOUBLE_FACE, mouth: 'smile'};
const GRIN: Face = {eyes: 'stare', pupil: 0.45, brows: 'flat', mouth: 'grin', look: [0, 0], blush: false};

// ======================================================= scene pieces =====
// «slide to power off» with the knob sliding across (p = pop of the bar, k = 0..1 slide)
const SlideOff: React.FC<{p: number; k: number}> = ({p, k}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: 36, right: 36, top: 90, height: 110, borderRadius: 55, background: 'rgba(240,240,245,0.94)', transform: `scale(${p})`, zIndex: 5, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
			<div style={{position: 'absolute', left: 140, top: 32, fontFamily: SANS, fontSize: 38, fontWeight: 800, color: '#5a5f6a', opacity: 1 - k}}>выключить</div>
			<div style={{position: 'absolute', left: 12 + k * 450, top: 12, width: 86, height: 86, borderRadius: 43, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={50} height={50} viewBox="0 0 24 24">
					<path d="M 12,3 L 12,12" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
					<path d="M 7,6.5 A 7.5,7.5 0 1 0 17,6.5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
				</svg>
			</div>
		</div>
	) : null;

// your face reflected in the dark phone screen (phone-screen content). blink = the reflection's eyes shut, grin = it smiles
const Reflection: React.FC<{blink?: boolean; grin?: boolean; ring?: number}> = ({blink = false, grin = false, ring = 0}) => (
	<div style={{position: 'absolute', inset: 0, background: '#040507', overflow: 'hidden'}}>
		<svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
			<g opacity={0.5} transform="translate(1080,0) scale(-1,1)">
				<Bust kind="teen" id="g4refl" x={540} y={980} scale={5.2} face={{eyes: blink ? 'closed' : 'open', pupil: 0.8, brows: grin ? 'flat' : 'worried', mouth: grin ? 'grin' : 'flat', look: [0, 0], blush: false}} />
			</g>
			<rect x={0} y={0} width={1080} height={1920} fill="#26407a" opacity={0.28} />
			<path d="M -100,600 L 700,-100 L 900,-100 L 100,600 Z" fill="#fff" opacity={0.06} />
			{ring > 0.01 && <ellipse cx={540} cy={930} rx={340 * (0.6 + 0.4 * ring)} ry={150 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={14} opacity={Math.min(1, ring)} />}
		</svg>
	</div>
);

// the lock screen after switching on: a stack of missed calls from «Мой номер»
const Missed: React.FC<{t: number}> = ({t}) => {
	const n = Math.min(47, Math.max(0, Math.floor(interpolate(t, [6, 40], [0, 47], clamp))));
	return (
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #2a3c6e 0%, #121a33 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
			<div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
				<div style={{fontSize: 170, fontWeight: 800, lineHeight: 1.05}}>09:36</div>
			</div>
			{[2, 1, 0].map((k) => (
				<div key={k} style={{position: 'absolute', left: 22 + k * 14, right: 22 + k * 14, top: 430 + k * 26, height: 150, borderRadius: 30, background: k === 0 ? 'rgba(245,245,250,0.95)' : 'rgba(225,225,235,0.6)', opacity: n > 0 ? 1 : 0}} />
			))}
			{n > 0 && (
				<div style={{position: 'absolute', left: 22, right: 22, top: 430, height: 150, display: 'flex', gap: 18, alignItems: 'center', padding: '0 24px', boxSizing: 'border-box'}}>
					<div style={{width: 80, height: 80, borderRadius: 40, background: '#8a5a32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, flex: 'none'}}>Я</div>
					<div style={{flex: 1}}>
						<div style={{display: 'flex', justifyContent: 'space-between'}}>
							<span style={{fontWeight: 900, fontSize: 34, color: '#111'}}>Мой номер</span>
							<span style={{fontSize: 24, color: '#666', fontWeight: 600}}>23:42</span>
						</div>
						<div style={{fontWeight: 800, fontSize: 32, color: RED, marginTop: 4}}>Пропущенные вызовы</div>
					</div>
				</div>
			)}
			{n > 0 && (
				<div style={{position: 'absolute', right: 6, top: 400, minWidth: 120, height: 92, borderRadius: 46, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 56, padding: '0 22px', boxSizing: 'border-box', boxShadow: '0 6px 20px rgba(0,0,0,0.5)'}}>
					{n}
				</div>
			)}
		</div>
	);
};

// your hand holding the phone's side button (screen coordinates next to the phone at x=540, w=680)
const ThumbOnButton: React.FC<{press: number; jx?: number}> = ({press, jx = 0}) => {
	const thumbX = 1180 + (905 - 1180) * press;
	return (
		<>
			<div style={{position: 'absolute', left: 540 + 340 - 6 + jx, top: 640, width: 12, height: 120, borderRadius: 4, background: '#2a2b30'}} />
			<div style={{position: 'absolute', left: thumbX + jx, top: 640, width: 150, height: 120, borderRadius: '50% 40% 40% 50%', background: '#e8b48e', boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.08)'}} />
			<div style={{position: 'absolute', left: thumbX + 120 + jx, top: 600, width: 260, height: 200, borderRadius: 60, background: '#cf4a3c'}} />
		</>
	);
};

// a seated pupil (hips on the bench, legs hidden behind the desk)
const Pupil: React.FC<{kind: 'teen' | 'son' | 'girl'; id: string; x: number; hip: number; s: number; f: number; face: Face; colors?: Colors; stand?: number; armL?: {target: [number, number]; bend: 1 | -1}; armR?: {target: [number, number]; bend: 1 | -1}; headTurn?: number}> = ({
	kind,
	id,
	x,
	hip,
	s,
	f,
	face,
	colors,
	stand = 0,
	armL,
	armR,
	headTurn,
}) => {
	const leg = kind === 'teen' ? 370 : kind === 'girl' ? 350 : 330;
	const y = hip - 0.55 * leg * s * stand + leg * s;
	return (
		<Person
			kind={kind}
			id={id}
			colors={colors}
			x={x}
			y={y}
			scale={s}
			hideLegs
			breathe={f}
			headTurn={headTurn}
			face={face}
			armL={armL ?? {target: [-90, -(leg + 40)], bend: 1}}
			armR={armR ?? {target: [90, -(leg + 40)], bend: -1}}
		/>
	);
};
// a school desk seen from the front; (x, y) = the desk top's front edge
const Desk: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g>
		<rect x={x - 170 * s} y={y - 18 * s} width={340 * s} height={30 * s} rx={6 * s} fill="#c08a52" />
		<rect x={x - 160 * s} y={y + 12 * s} width={320 * s} height={150 * s} fill="#9a6a3a" />
		<rect x={x - 160 * s} y={y + 12 * s} width={320 * s} height={14 * s} fill="#7a5028" />
	</g>
);

// the classroom seen through its window: the pupils face the window (the board is on this wall);
// dbl = the double at YOUR desk (front row, middle), Max next to him; the teacher stands at the left
const Classroom: React.FC<{f: number; id: string; dbl: {face: Face; stand?: number; headTurn?: number}; maxFace?: Face; teacher?: {point: number; talk: boolean}}> = ({f, id, dbl, maxFace, teacher}) => {
	const back = 1100;
	const front = 1280;
	const sb = 0.56;
	const sf = 0.7;
	const kidFace = (k: number): Face => ({eyes: k % 2 ? 'open' : 'happy', mouth: 'smile', brows: 'neutral', look: [0.2 * (k - 1), 0.1], blush: false});
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={1800} fill="#efe6cc" />
			<rect x={-400} y={1040} width={1880} height={360} fill="#a8c3a0" />
			<rect x={-400} y={1034} width={1880} height={10} fill="#8aa883" />
			<rect x={-400} y={1400} width={1880} height={1200} fill="#b58a5a" />
			{/* the back wall: a map, a clock, the alphabet strip */}
			<rect x={140} y={430} width={300} height={220} fill="#7fb2d8" stroke="#6a4a2a" strokeWidth={8} />
			<path d="M 180,520 q 40,-50 90,-10 t 90,10 q 20,60 -40,80 q -60,20 -100,-20 Z" fill="#8fc27a" />
			<circle cx={760} cy={470} r={64} fill="#fff" stroke="#333" strokeWidth={8} />
			<path d={`M 760,470 L 760,430 M 760,470 L 790,488`} stroke="#333" strokeWidth={7} strokeLinecap="round" />
			{['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж'].map((l, k) => (
				<g key={l}>
					<rect x={80 + k * 130} y={330} width={100} height={70} rx={8} fill={['#e0a526', '#3b6fd6', '#d65a3b', '#3d8b5a'][k % 4]} />
					<text x={130 + k * 130} y={385} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#fff">
						{l}
					</text>
				</g>
			))}
			{/* back row */}
			{[300, 600, 880].map((x, k) => (
				<g key={`b${k}`}>
					<Pupil kind={k === 1 ? 'girl' : 'son'} id={`${id}b${k}`} x={x} hip={back} s={sb} f={f} face={kidFace(k)} colors={KID_COLS[k]} />
					<Desk x={x} y={back + 6} s={sb * 1.2} />
				</g>
			))}
			{/* front row: a kid, the double at your desk, Max */}
			<Pupil kind="son" id={`${id}f0`} x={200} hip={front} s={sf} f={f} face={kidFace(3)} colors={KID_COLS[3]} />
			<Desk x={200} y={front + 6} s={sf * 1.2} />
			<Pupil kind="teen" id={`${id}dbl`} x={500} hip={front} s={sf} f={f} face={dbl.face} stand={dbl.stand ?? 0} headTurn={dbl.headTurn} />
			<Max id={`${id}max`} x={760} y={front + 330 * sf} s={sf} f={f} face={maxFace ?? {eyes: 'happy', mouth: 'grin', brows: 'raised', look: [-0.7, 0]}} />
			<Desk x={630} y={front + 6} s={sf * 1.6} />
			{/* the teacher by the board (on this side of the room) */}
			{teacher && (
				<Person
					kind="mom"
					id={`${id}tch`}
					plain
					colors={TEACH}
					x={190}
					y={1700}
					scale={0.78}
					breathe={f}
					face={{eyes: 'open', brows: 'raised', mouth: teacher.talk ? 'o' : 'flat', look: [0.8, 0], blush: false}}
					armR={{target: [130 + 230 * teacher.point, -560 - 300 * teacher.point], bend: -1}}
					armL={{target: [-110, -420], bend: 1}}
				/>
			)}
		</g>
	);
};

// looking in through the classroom window from the street: the frame, its bars, the glare on the glass
const ClassWindow: React.FC<{f: number; children: React.ReactNode; zoom?: number}> = ({f, children, zoom = 1}) => (
	<AbsoluteFill style={{background: '#d9c79c'}}>
		<AbsoluteFill style={{clipPath: 'inset(250px 80px 470px 80px)'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 860px'}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.18) 38%, rgba(255,255,255,0) 46%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.12) 66%, rgba(255,255,255,0) 72%)'}} />
		</AbsoluteFill>
		<div style={{position: 'absolute', left: 64, top: 234, width: 952, height: 1232, border: '22px solid #f4f1ea', boxSizing: 'border-box', boxShadow: 'inset 0 0 0 6px #d4cfc4'}} />
		<div style={{position: 'absolute', left: 529, top: 250, width: 22, height: 1200, background: '#f4f1ea'}} />
		<div style={{position: 'absolute', left: 80, top: 640, width: 920, height: 22, background: '#f4f1ea'}} />
		<div style={{position: 'absolute', left: 30, top: 1450, width: 1020, height: 54, borderRadius: 8, background: '#cfc8b8', boxShadow: '0 10px 0 #b3ac9c'}} />
		<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: `rgba(255,240,200,${0.03 + 0.02 * Math.sin(f / 9)})`}} />
	</AbsoluteFill>
);

// the school from the street, morning
const SchoolFront: React.FC = () => (
	<g>
		<rect x={-500} y={-500} width={2100} height={1600} fill="#9fd3ff" />
		<rect x={-300} y={360} width={1680} height={1140} fill="#e9d9a8" />
		<rect x={-300} y={340} width={1680} height={30} fill="#c9b98a" />
		{Array.from({length: 3}).flatMap((_, r) =>
			Array.from({length: 7}).map((__, c) => <rect key={`${r}-${c}`} x={-240 + c * 240} y={430 + r * 280} width={150} height={190} fill="#cfe6f7" stroke="#f4f1ea" strokeWidth={12} />),
		)}
		<rect x={400} y={1150} width={280} height={350} fill="#8a5a3a" />
		<rect x={414} y={1164} width={124} height={336} fill="#a06a42" />
		<rect x={542} y={1164} width={124} height={336} fill="#a06a42" />
		<rect x={340} y={1090} width={400} height={60} rx={8} fill="#3b6fd6" />
		<text x={540} y={1136} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#fff">
			ШКОЛА
		</text>
		<rect x={-500} y={1500} width={2100} height={900} fill="#9a9aa0" />
		<rect x={-500} y={1500} width={2100} height={14} fill="#7a7a80" />
		{[-200, 1100].map((x) => (
			<g key={x}>
				<rect x={x - 14} y={1200} width={28} height={300} fill="#6a4a2a" />
				<circle cx={x} cy={1150} r={150} fill="#5aa04a" />
			</g>
		))}
	</g>
);

// the school corridor: classroom doors on the left, windows on the right, ceiling lamps
const Corridor: React.FC = () => (
	<g>
		<rect x={-500} y={-500} width={2100} height={3000} fill="#e9e3d2" />
		<path d="M -500,1500 L 380,1050 L 700,1050 L 1580,1500 L 1580,2500 L -500,2500 Z" fill="#c9b48a" />
		{Array.from({length: 7}).map((_, k) => (
			<path key={k} d={`M ${-500 + k * 300},2500 L ${380 + k * 53},1050`} stroke="#b8a37a" strokeWidth={6} />
		))}
		<path d="M -500,-500 L 380,620 L 380,1050 L -500,1500 Z" fill="#a8c3a0" opacity={0.6} />
		<path d="M 1580,-500 L 700,620 L 700,1050 L 1580,1500 Z" fill="#dfe9ef" />
		<rect x={380} y={620} width={320} height={430} fill="#f2ede0" />
		{[0, 1].map((k) => (
			<path key={k} d={`M ${-260 + k * 330},${1340 - k * 130} L ${-260 + k * 330},${560 + k * 90} L ${-100 + k * 270},${620 + k * 75} L ${-100 + k * 270},${1270 - k * 105} Z`} fill="#8a5a3a" />
		))}
		{[0, 1, 2].map((k) => (
			<path key={k} d={`M ${1260 - k * 250},${300 + k * 110} L ${1100 - k * 200},${380 + k * 90} L ${1100 - k * 200},${1150 - k * 60} L ${1260 - k * 250},${1250 - k * 70} Z`} fill="#bfe0f5" stroke="#f4f1ea" strokeWidth={10} />
		))}
		{[0, 1, 2].map((k) => (
			<rect key={k} x={540 - 120 / (k + 1)} y={140 + k * 200} width={240 / (k + 1)} height={20 / (k + 1)} rx={6} fill="#fffbe6" />
		))}
	</g>
);

// a hand held out for a handshake, seen from the side: fingers towards the left, thumb up; (x, y) = the grip
const ProfileHand: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[3, 2, 1, 0].map((k) => (
			<rect key={k} x={-150 + k * 6} y={-30 + k * 15} width={112} height={20} rx={10} fill={k === 0 ? '#e8b48e' : '#dda57d'} />
		))}
		<rect x={-60} y={-40} width={112} height={84} rx={34} fill="#e8b48e" />
		<ellipse cx={-48} cy={-50} rx={40} ry={17} fill="#e8b48e" transform="rotate(-34 -48 -50)" />
		<path d="M -20,-24 q 20,-8 40,0" stroke="#c98a6a" strokeWidth={5} fill="none" opacity={0.5} />
	</g>
);

// the double in the corridor turned to you (you: the back of your head, bottom left), holding out his hand; p = 0..1 reach
const Offer: React.FC<{f: number; p: number; talk?: boolean}> = ({f, p, talk = false}) => {
	const X = 700;
	const Y = 1900;
	const S = 1.5;
	const tgt: [number, number] = [-110 - 290 * p, -380 - 220 * p];
	return (
		<g>
			<Corridor />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" opacity={0.35} />
			<Person kind="teen" id="g4offer" x={X} y={Y} scale={S} breathe={f} headTurn={-0.45} face={{...GRIN, mouth: talk ? 'o' : 'grin', look: [-0.8, 0.05]}} armL={{target: tgt, bend: -1}} armR={{target: [110, -380], bend: -1}} />
			{p > 0.35 && <ProfileHand x={X + tgt[0] * S} y={Y + tgt[1] * S} s={S * 0.9} />}
			<Person kind="teen" id="g4you" back x={40} y={2780} scale={2.0} />
		</g>
	);
};

// ============================================================== SHOTS =======
// 1. Recap: the voice messages from tomorrow saved you from the lift and from the lamp.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		return (
			<Recap f={t} label="◀◀ ЧАСТЬ 1">
				<Freeze frame={95}>
					<G1.S08 />
				</Freeze>
				<Stamp p={pop(t, 70, 10)} mark="check" label="ЛИФТ" />
			</Recap>
		);
	}
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 2">
			<Freeze frame={50}>
				<G2B.S10 />
			</Freeze>
			<Stamp p={pop(t, 10, 10)} mark="check" label="ЛАМПА" />
		</Recap>
	);
};

// 2. Recap: yesterday you saw the double through the door viewer. With your face.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 3">
			{i === 0 ? (
				<Freeze frame={70}>
					<G3.S15 />
				</Freeze>
			) : (
				<Freeze frame={112}>
					<G3.S14 />
				</Freeze>
			)}
		</Recap>
	);
};

// 3. Recap: at night the voice said «Выключи телефон…» — and «Мой номер» called.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [118]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 3">
			{i === 0 ? (
				<Freeze frame={172}>
					<G3.S21 />
				</Freeze>
			) : (
				<Freeze frame={44}>
					<G3.S23 />
				</Freeze>
			)}
		</Recap>
	);
};

// 4. Title card: part 4, what the viewers chose.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 28, 11);
	const d = pop(f, 44, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 58%, #04060d 100%)'}}>
			<div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 10, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
				<div style={{fontSize: 180, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 4</div>
				<div style={{fontSize: 76, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ПОДМЕНА</div>
				<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, background: 'rgba(14,14,16,0.92)', border: '6px solid #3b82f6', borderRadius: 24, padding: '12px 34px 16px', transform: `scale(${c})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
					<div style={{fontSize: 30, color: '#9cc2ff', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
						<div style={{width: 66, height: 66, borderRadius: 33, background: '#3b82f6', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>
						<div style={{fontSize: 54, color: '#fff'}}>ВЫКЛЮЧИТЬ</div>
					</div>
				</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 34, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 32px', fontSize: 36, transform: `scale(${d})`}}>ЧАСТИ 1–3 — В ПРОФИЛЕ</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 5. You hold the button. The call breaks off. The screen goes dark.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const press = lerp(f, 0, 12, 0, 1, Easing.out(Easing.cubic));
	const bar = pop(f, 12, 10);
	const k = lerp(f, 32, 50, 0, 1, Easing.inOut(Easing.cubic));
	const off = interpolate(f, [80, 90], [0, 1], clamp);
	const ringing = f < 50;
	const jx = ringing ? Math.sin(f * 3.1) * 8 : 0;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + jx} y={1000} w={680} scale={lerp(f, 0, 99, 1.0, 1.06) * kick(f)}>
				{f < 52 ? <CallScreen f={f} /> : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #23304f 0%, #0c1120 100%)', fontFamily: SANS, color: '#aeb6c8', textAlign: 'center', paddingTop: 260, fontSize: 40, fontWeight: 800}}>Вызов завершён</div>}
				<SlideOff p={bar * (1 - off)} k={k} />
				<div style={{position: 'absolute', inset: 0, background: '#000', opacity: off}} />
			</Phone>
			<ThumbOnButton press={press} jx={jx} />
		</AbsoluteFill>
	);
};

// 6. In the black screen — your reflection. It blinks a second later than you.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const lid = interpolate(f, [76, 80, 84], [0, 1, 0], clamp);
	const late = f >= 106 && f < 114;
	const s = lerp(f, 0, 147, 1.25, 1.45);
	const p = focus(680, 324, 640, 540, 820, s);
	return (
		<AbsoluteFill style={{background: '#020203'}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<Reflection blink={late} ring={pop(f, 106, 10)} />
			</Phone>
			{/* your own blink: the world goes dark for a moment */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960 * lid, background: '#000'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 960 * lid, background: '#000'}} />
		</AbsoluteFill>
	);
};

// 7. Morning. The alarm was in the phone. You wake up — at 9:20.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [98]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 98, 1.12, 1.24), cx: 575, cy: 1130}} light={{glow: 0.3, vignette: 0.5}} bg="#05070f">
					<Bedroom f={t} id="g4s7" glow={0} buzz={false} eyes={t < 76 ? 'closed' : 'wide'} day clock="09:20" />
				</Stage>
			</AbsoluteFill>
		);
	}
	return (
		<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.7}} bg="#1a2140">
			<BigClock text="09:20" f={t} p={pop(t, 2, 10)} />
		</Stage>
	);
};

// 8. Mom freezes in the kitchen with a cup: «Ты дома? Я же только что проводила тебя в школу».
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		const freeze = interpolate(t, [22, 30], [0, 1], clamp);
		const tilt = 28 * freeze;
		return (
			<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.06) * kick(t), cx: 560, cy: 1000}} light={{glow: 0.35, vignette: 0.5}}>
				<Kitchen id="g4s8k" floorY={1300} clock={[9, 21]} tick={f / 30} sky="#9fd3ff" />
				<Person kind="teen" id="g4s8h" x={170} y={1620} scale={0.95} breathe={t} face={{eyes: 'wide', pupil: 0.7, brows: 'worried', mouth: 'o', look: [0.8, 0], blush: false}} />
				<Person
					kind="mom"
					id="g4s8m"
					colors={MOM}
					x={720}
					y={1620}
					scale={1.0}
					breathe={t}
					face={freeze > 0.5 ? {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [-0.9, 0]} : {eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0.2, 0.3]}}
					armL={{target: [-60, -560], bend: 1, ku: 0.85, kf: 0.8}}
					armR={{target: [120, -420], bend: -1}}
					itemL={
						<g transform={`rotate(${180 + tilt})`}>
							<rect x={-30} y={-70} width={60} height={70} rx={10} fill="#f4f1ea" />
							<path d="M 30,-55 q 26,0 26,22 q 0,22 -26,22" stroke="#f4f1ea" strokeWidth={10} fill="none" />
							<rect x={-24} y={-64} width={48} height={14} fill="#8a5a32" />
						</g>
					}
				/>
				{freeze > 0.5 &&
					[0, 1, 2].map((k) => {
						const d = ((t * 6 + k * 22) % 60) / 60;
						return <ellipse key={k} cx={640 - 6 * k} cy={1080 + 320 * d} rx={9} ry={14} fill="#8a5a32" opacity={1 - d} />;
					})}
			</Stage>
		);
	}
	const talk = t >= 2 && t < 72 && Math.floor(t / 4) % 2 === 0;
	return (
		<WarmClose id="g4s8c" t={t} len={80} zoom={[1, 1.08]}>
			<Bust kind="mom" id="g4s8b" colors={MOM} x={540} y={1000} scale={5.6} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: talk ? 'o' : 'flat', look: [-0.3, 0.1], blush: false}} />
		</WarmClose>
	);
};

// 9. You run to school and look in through the classroom window.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [34]);
	if (i === 0) {
		const run = lerp(t, 0, 34, 0, 1, Easing.linear);
		return (
			<Stage cam={{s: lerp(t, 0, 34, 1.0, 1.08), cx: 540, cy: 1150}} light={{glow: 0.3, vignette: 0.5}} bg="#9fd3ff">
				<SchoolFront />
				<Person kind="teen" id="g4s9run" back x={540 + 120 * Math.sin(run * 2)} y={2200 - 600 * run} scale={1.15 - 0.6 * run} walk={t * 0.55} />
			</Stage>
		);
	}
	return (
		<AbsoluteFill>
			<ClassWindow f={f} zoom={1.0}>
				<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.4}} bg="#efe6cc">
					<Classroom f={f} id="g4s9c" dbl={{face: SMILE}} />
				</Stage>
				<AbsoluteFill style={{backdropFilter: 'blur(5px)', background: 'rgba(255,255,255,0.05)'}} />
			</ClassWindow>
			{/* you, from behind, hands on the sill */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<Person kind="teen" id="g4s9you" back x={300} y={2650} scale={1.6} armL={{target: [-120, -740], bend: 1}} armR={{target: [150, -740], bend: -1}} />
			</svg>
		</AbsoluteFill>
	);
};

// 10. At your desk sits — you. In the red hoodie. Max laughs at his joke.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const joke = f >= 78 && f < 120 && Math.floor(f / 4) % 2 === 0;
	return (
		<ClassWindow f={f} zoom={lerp(f, 0, 150, 1.0, 1.1)}>
			<Stage cam={{s: 1.15, cx: 560, cy: 1050}} light={{glow: 0.2, vignette: 0.4}} bg="#efe6cc">
				<Classroom f={f} id="g4s10c" dbl={{face: {...SMILE, mouth: joke ? 'o' : 'smile', look: [0.7, 0]}}} maxFace={{eyes: 'happy', mouth: f >= 96 ? (Math.floor(f / 5) % 2 === 0 ? 'grin' : 'o') : 'smile', brows: 'raised', look: [-0.8, 0]}} />
			</Stage>
		</ClassWindow>
	);
};

// 11. The teacher calls «к доске» — by your surname. And HE stands up.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const stand = lerp(f, 92, 112, 0, 1, Easing.inOut(Easing.cubic));
	const talk = f >= 26 && f < 76 && Math.floor(f / 4) % 2 === 0;
	return (
		<AbsoluteFill>
			<ClassWindow f={f} zoom={lerp(f, 0, 120, 1.0, 1.06)}>
				<Stage cam={{s: 1.0, cx: 540, cy: 1000}} light={{glow: 0.2, vignette: 0.4}} bg="#efe6cc">
					<Classroom f={f} id="g4s11c" dbl={{face: {...SMILE, look: [-0.8, 0]}, stand}} maxFace={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [-0.6, 0]}} teacher={{point: pop(f, 30, 10), talk}} />
				</Stage>
			</ClassWindow>
			{f >= 40 && (
				<div style={{position: 'absolute', left: 120, top: 300, transform: `scale(${pop(f, 40, 10)})`, transformOrigin: '10% 100%', background: '#fff', borderRadius: 34, padding: '14px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 54, color: '#111', boxShadow: '0 8px 0 rgba(0,0,0,0.25)'}}>
					К ДОСКЕ!
					<div style={{position: 'absolute', left: 60, bottom: -28, width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '30px solid #fff'}} />
				</div>
			)}
		</AbsoluteFill>
	);
};

// 12. He slowly turns to the window… and waves to you.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const turn = lerp(f, 4, 40, 1, 0, Easing.inOut(Easing.cubic));
	const wave = f >= 62 ? Math.sin((f - 62) / 3) : 0;
	const up = interpolate(f, [56, 64], [0, 1], clamp);
	return (
		<ClassWindow f={f} zoom={lerp(f, 0, 90, 1.0, 1.05)}>
			<Stage cam={{s: 1.0, cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.5}} bg="#efe6cc">
				<rect x={-400} y={-400} width={1880} height={1800} fill="#efe6cc" />
				<rect x={-400} y={1040} width={1880} height={600} fill="#a8c3a0" />
				<circle cx={300} cy={470} r={64} fill="#fff" stroke="#333" strokeWidth={8} />
				<rect x={150} y={760} width={300} height={200} fill="#24533d" stroke="#6a4a2a" strokeWidth={10} />
				<path d="M 190,820 l 60,0 M 190,860 l 120,0 M 190,900 l 80,0" stroke="#e8f0e8" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
				<Person
					kind="teen"
					id="g4s12d"
					x={770}
					y={2250}
					scale={1.55}
					breathe={f}
					headTurn={0.9 * turn}
					face={{...(f >= 56 ? GRIN : SMILE), look: [0.9 * turn, 0]}}
					armL={{target: [-120, -420], bend: 1}}
					armR={{target: [140 + 40 * up + 30 * wave, -440 - 470 * up], bend: -1}}
				/>
			</Stage>
		</ClassWindow>
	);
};

// 13. You switch the phone on. Forty-seven missed calls. All — «Мой номер».
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [24]);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540} y={1000} w={680} scale={lerp(f, 0, 108, 1.0, 1.08) * kick(f)}>
				{i === 0 ? (
					<div style={{position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{width: 120, height: 120, borderRadius: 60, border: '10px solid #fff', opacity: interpolate(t, [4, 10], [0, 1], clamp), boxSizing: 'border-box'}} />
					</div>
				) : (
					<Missed t={t} />
				)}
			</Phone>
		</AbsoluteFill>
	);
};

// 14. And one voice message. Your voice, out of breath:
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 78, 1.3, 1.45) * kick(f);
	const p = focus(680, 304, 330, 540, 760, s);
	const tap = interpolate(f, [44, 50, 56], [0, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:36">
					<VoiceBubble top={250} f={f} progress={0} lvl={0} sent="23:59" ring={pop(f, 20, 10)} />
				</ChatScreen>
			</Phone>
			{tap > 0 && <div style={{position: 'absolute', left: 330, top: 700, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.35)', transform: `scale(${0.6 + 0.6 * tap})`}} />}
		</AbsoluteFill>
	);
};

// 15. «Зачем ты выключил? Тот голос был не мой. Это он…» → yesterday night: HE records a message in your voice → «…не давай ему до себя дотронуться».
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [88, 160]);
	if (i === 1) {
		return (
			<Vision f={t} label="ВЧЕРА · 23:41">
				<Stage cam={{s: lerp(t, 0, 72, 1.0, 1.08), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
					<rect x={-500} y={-500} width={2200} height={3000} fill="#0b0f1e" />
					<Bust kind="teen" id="g4s15d" x={540} y={1000} scale={4.4} face={{...GRIN, look: [0.2, 0.5]}} />
					<rect x={-500} y={-500} width={2200} height={3000} fill="#05070f" opacity={0.45} />
					<ellipse cx={600} cy={1300} rx={330} ry={260} fill="#9fc0ff" opacity={0.18} />
					<g transform="translate(640,1290) rotate(-12)">
						<rect x={-80} y={-150} width={160} height={300} rx={26} fill="#15161a" />
						<rect x={-68} y={-138} width={136} height={276} rx={18} fill="#cfe2ff" opacity={0.9} />
						<circle cx={0} cy={60} r={34} fill={RED} />
					</g>
				</Stage>
			</Vision>
		);
	}
	const s = lerp(f, 0, 234, 1.45, 1.6) * kick(t, 0.05);
	const p = focus(680, 304, 330, 540, 760, s);
	const warn = pop(t, 46, 10);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:36">
					<VoiceBubble top={250} f={f} progress={interpolate(f, [6, 228], [0.03, 0.98], clamp)} lvl={level('g15', f - 6)} sent="23:59" />
				</ChatScreen>
			</Phone>
			{i === 2 && warn > 0.01 && (
				<div style={{position: 'absolute', top: 1030, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${warn}) rotate(-3deg)`}}>
					<div style={{background: 'rgba(14,14,16,0.94)', border: `6px solid ${RED}`, borderRadius: 22, padding: '12px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 48, color: '#fff', textAlign: 'center', lineHeight: 1.1}}>
						НЕ ДАВАЙ ЕМУ
						<br />
						<span style={{color: RED}}>ДОТРОНУТЬСЯ</span>
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 16. And at the very end — the whisper again: «Это не ты». (your reflection smiles)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 90, 1.3, 1.5);
	const p = focus(680, 324, 640, 540, 820, s);
	const word = f >= 64;
	const jit = word ? (rnd(f * 3) - 0.5) * 12 : 0;
	return (
		<AbsoluteFill style={{background: '#020203'}}>
			<Phone x={p.x + jit} y={p.y} w={680} scale={s}>
				<Reflection grin={f >= 70} />
			</Phone>
			{word && (
				<div style={{position: 'absolute', top: 280, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 120, transform: `scale(${pop(f, 64, 9)}) translateX(${jit}px)`}}>
					<span style={{position: 'absolute', left: 0, right: 0, color: '#00e5ff', opacity: 0.5, transform: 'translateX(-8px)'}}>ЭТО НЕ ТЫ</span>
					<span style={{position: 'relative', color: RED, textShadow: '6px 0 0 rgba(255,0,60,0.5)'}}>ЭТО НЕ ТЫ</span>
				</div>
			)}
			<AbsoluteFill style={{background: '#ff0030', mixBlendMode: 'screen', opacity: word ? 0.1 + 0.06 * Math.sin(f) : 0}} />
		</AbsoluteFill>
	);
};

// 17. The bell rings. He comes out of the classroom and walks straight to you.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [30]);
	if (i === 0) {
		const shakeX = Math.sin(t * 2.6) * 10;
		return (
			<AbsoluteFill>
				<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.6}} bg="#e9e3d2">
					<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" />
					<rect x={-500} y={1100} width={2200} height={1500} fill="#a8c3a0" />
					<g transform={`translate(${540 + shakeX},760)`}>
						<rect x={-30} y={-260} width={60} height={110} fill="#5a5f66" />
						<circle cx={0} cy={0} r={170} fill="#d63b2f" />
						<circle cx={0} cy={0} r={120} fill="#b8322a" />
						<circle cx={0} cy={0} r={34} fill="#2a2b30" />
					</g>
					{[0, 1, 2].map((k) => (
						<path key={k} d={`M ${300 - k * 40},${640 - k * 30} q -40,120 0,240 M ${780 + k * 40},${640 - k * 30} q 40,120 0,240`} stroke="#333" strokeWidth={10} fill="none" strokeLinecap="round" opacity={Math.floor(t / 3) % 2 === 0 ? 0.8 : 0.3} />
					))}
				</Stage>
				<div style={{position: 'absolute', top: 1000, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 120, color: '#111', transform: `scale(${pop(t, 2, 8)}) rotate(-6deg)`}}>ДЗЫНЬ!</div>
			</AbsoluteFill>
		);
	}
	const come = lerp(t, 0, 69, 0, 1, Easing.in(Easing.quad));
	return (
		<Stage cam={{s: lerp(t, 0, 69, 1.0, 1.06), cx: 540, cy: 1000}} light={{glow: 0.2, vignette: 0.6}} bg="#e9e3d2">
			<Corridor />
			<Person kind="son" id="g4s17k1" colors={KID_COLS[0]} back x={300} y={1230} scale={0.32} walk={t * 0.4} />
			<Person kind="girl" id="g4s17k2" colors={KID_COLS[1]} back x={780} y={1250} scale={0.34} walk={t * 0.4 + 1} />
			<Person kind="teen" id="g4s17d" x={540} y={1300 + 760 * come} scale={0.42 + 1.0 * come} walk={t * 0.4} face={{...SMILE, look: [0, 0]}} />
		</Stage>
	);
};

// 18. He holds out his hand and smiles: «Привет. Давай поменяемся обратно?»
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const reach = lerp(f, 6, 40, 0, 1, Easing.out(Easing.cubic));
	const talk = f >= 62 && f < 112 && Math.floor(f / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(f, 0, 123, 1.0, 1.06), cx: 560, cy: 1000}} light={{glow: 0.2, vignette: 0.7}} bg="#e9e3d2">
			<Offer f={f} p={reach} talk={talk} />
		</Stage>
	);
};

// 19. Finale: shake his hand, or run? Countdown, end card.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="ЧАСТЬ 5"
			boxes={5}
			opt1={{text: 'ПОЖАТЬ РУКУ', sub: '«давай поменяемся»'}}
			opt2={{text: 'УБЕЖАТЬ', sub: 'как велит голос'}}
			tally={{done: '4 ИЗ 5', rest: 'ПЯТОЕ'}}
			bg={
				<AbsoluteFill>
					<Stage cam={{s: lerp(f, 0, 300, 1.06, 1.12), cx: 560, cy: 1000}} light={{glow: 0.2, vignette: 0.7}} bg="#e9e3d2">
						<Offer f={f} p={1} />
					</Stage>
					<AbsoluteFill style={{background: '#000', opacity: 0.6}} />
				</AbsoluteFill>
			}
		/>
	);
};

// keep the night tint helper referenced (used by the HUD night windows)
export const _NIGHT = NIGHT;
