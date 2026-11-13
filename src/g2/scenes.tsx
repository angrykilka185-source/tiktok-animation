// «Голосовые из завтра» — серия 2 «Мяч». 14 shots on the timeline of src/g2/timeline.ts
// (≈ the final edit, see scripts/fit-voiceover.py --part g2). Phone UI and props come from series 1.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {PlankFloor, Wallpaper} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';
import * as G1 from '../g1/scenes';
import envJson from './env.json';

const {YELLOW, RED, NIGHT, PHONE_BG, Phone, ChatScreen, VoiceBubble, LockScreen, PhoneLight, Gym, Vision, NoSign, FaceClose, focus, rnd} = G1;

const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

const TEACHER = {top: '#2a5ca8', topDark: '#214a8a', pants: '#2a5ca8', shoes: '#eceae4', hair: '#4a3a2c'};
const MOM = {hair: '#3a2a22', top: '#3f7d6e', topDark: '#33685b', pants: '#e8b48e', shoes: '#5a3a3a', skin: '#e8b48e'};
const KIDS = [
	{kind: 'son' as const, scale: 0.8, colors: {top: '#3d8b5a', topDark: '#2f6e47', hair: '#2a1a12', pants: '#3a3f4a'}},
	{kind: 'mom' as const, scale: 0.7, colors: {top: '#e07aa0', topDark: '#c4628a', hair: '#c27b3a', pants: '#f2c3a0', shoes: '#f4f4f4'}},
	{kind: 'son' as const, scale: 0.78, colors: {top: '#5b6ee1', topDark: '#4a5bc4', hair: '#e8c060', pants: '#2b2d33'}},
];

// ======================================================= scene pieces =====
const Ball: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`}>
		<circle r={86} fill="#e8742a" />
		<path d="M -86,0 L 86,0 M 0,-86 L 0,86" stroke="#4a220c" strokeWidth={6} />
		<path d="M -60,-62 C -20,-30 -20,30 -60,62 M 60,-62 C 20,-30 20,30 60,62" stroke="#4a220c" strokeWidth={6} fill="none" />
		<circle r={86} fill="none" stroke="#4a220c" strokeWidth={4} />
		<ellipse cx={-30} cy={-36} rx={22} ry={12} fill="#fff" opacity={0.22} transform="rotate(-30 -30 -36)" />
	</g>
);

// PE teacher in a tracksuit, a whistle on a red cord (in his mouth while he blows it)
const Teacher: React.FC<{id: string; x: number; y: number; scale: number; f: number; blow?: boolean; face: Face; armL?: [number, number]; armR?: [number, number]; fore?: number; overhead?: boolean}> = ({
	id,
	x,
	y,
	scale,
	f,
	blow = false,
	face,
	armL = [-150, -470],
	armR = [150, -470],
	fore = 1,
	overhead = false,
}) => {
	// elbows always point outwards: above the shoulders the bend flips
	const bl = overhead ? -1 : 1;
	const mouthY = y - 967 * scale;
	const chestY = y - 840 * scale;
	const wy = blow ? mouthY + 6 * scale : chestY;
	return (
		<g>
			<Person kind="dad" id={id} colors={TEACHER} x={x} y={y} scale={scale} face={{stubble: true, ...face}} breathe={f} armL={{target: armL, bend: bl as 1 | -1, ku: fore, kf: fore}} armR={{target: armR, bend: -bl as 1 | -1, ku: fore, kf: fore}} />
			<path d={`M ${x - 26 * scale},${y - 905 * scale} L ${x + 4 * scale},${wy} L ${x + 26 * scale},${y - 905 * scale}`} stroke="#d63b2f" strokeWidth={5 * scale} fill="none" />
			<g transform={`translate(${x + 4 * scale},${wy}) scale(${scale}) rotate(${blow ? -10 : 8})`}>
				<rect x={-6} y={-12} width={46} height={24} rx={11} fill="#c9ced6" stroke="#7d848e" strokeWidth={3} />
				<circle cx={-4} cy={0} r={8} fill="none" stroke="#7d848e" strokeWidth={4} />
			</g>
			{blow &&
				[0, 1, 2].map((k) => (
					<path
						key={k}
						d={`M ${x + (70 + k * 26) * scale},${mouthY - (30 + k * 6) * scale} q ${14 * scale},${30 * scale} 0,${60 * scale + k * 12 * scale}`}
						stroke="#fff"
						strokeWidth={6 * scale}
						fill="none"
						strokeLinecap="round"
						opacity={0.5 + 0.5 * Math.sin(f / 2 + k)}
					/>
				))}
		</g>
	);
};

// classmates standing along the wall
const Classmates: React.FC<{f: number; xs: number[]; y: number; face: Face; idp: string}> = ({f, xs, y, face, idp}) => (
	<g>
		{KIDS.map((k, i) =>
			xs[i] === undefined ? null : <Person key={i} kind={k.kind} id={`${idp}${i}`} colors={k.colors} x={xs[i]} y={y} scale={k.scale} breathe={f + i * 20} face={{blush: false, ...face}} />,
		)}
	</g>
);

// the old caged lamp; (0,0) = the point where its wire holds it, hangs downwards
const Lamp: React.FC<{on?: boolean}> = ({on = true}) => (
	<g>
		<rect x={-8} y={-10} width={16} height={26} fill="#5d646e" />
		<path d="M -120,90 Q -110,10 0,10 Q 110,10 120,90 Z" fill="#7d8590" />
		<path d="M -120,90 L 120,90" stroke="#5d646e" strokeWidth={10} />
		<circle cx={0} cy={128} r={52} fill={on ? '#fff3c4' : '#9a9a8a'} />
		{on && <circle cx={0} cy={128} r={110} fill="#fff3c4" opacity={0.18} />}
		<g stroke="#4a4f59" strokeWidth={6} fill="none">
			<path d="M -96,90 Q -96,196 0,196 Q 96,196 96,90" />
			<path d="M -48,90 Q -50,190 0,196 M 48,90 Q 50,190 0,196 M 0,90 L 0,196" />
			<path d="M -88,140 Q 0,160 88,140" />
		</g>
	</g>
);

// the lamp smashed on the floor: (x, y) = floor point
const BrokenLamp: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
	<g>
		<ellipse cx={x} cy={y + 6} rx={190} ry={26} fill="#000" opacity={0.25} />
		<g transform={`translate(${x},${y - 40}) rotate(24)`}>
			<path d="M -120,60 Q -110,-20 0,-20 Q 110,-20 120,60 Z" fill="#6b727d" />
			<path d="M -96,60 Q -60,96 0,70 Q 60,100 96,60" stroke="#4a4f59" strokeWidth={6} fill="none" />
		</g>
		{Array.from({length: 22}).map((_, k) => {
			const a = rnd(k + 5) * Math.PI * 2;
			const r = 60 + rnd(k + 40) * 230 * Math.min(1, t / 6);
			const sx = x + Math.cos(a) * r;
			const sy = y + Math.sin(a) * r * 0.22;
			return <path key={k} d={`M ${sx},${sy} l ${8 + rnd(k) * 14},${-6 - rnd(k + 9) * 8} l ${4 + rnd(k + 3) * 8},${10} Z`} fill="#dff3ff" opacity={0.9} />;
		})}
	</g>
);

// the gym ceiling seen from below, the lamp swinging on its last wire; the top of the wall with windows far below
const Ceiling: React.FC<{f: number; spark: number}> = ({f, spark}) => {
	const th = 0.18 * Math.sin(f / 8);
	const L = 330;
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={1500} fill="#c3cabe" />
			{[
				[-300, 50],
				[60, 64],
				[480, 80],
				[880, 96],
			].map(([y, h]) => (
				<rect key={y} x={-400} y={y} width={1880} height={h} fill="#a9b2a5" />
			))}
			<rect x={-400} y={1100} width={1880} height={1300} fill="#dfe6d8" />
			<rect x={-400} y={1090} width={1880} height={16} fill="#9aa39a" />
			{[40, 400, 760].map((wx) => (
				<g key={wx}>
					<rect x={wx} y={1170} width={280} height={220} fill="url(#sky)" />
					<rect x={wx} y={1170} width={280} height={220} fill="none" stroke="#f4efe6" strokeWidth={14} />
					<rect x={wx + 133} y={1170} width={14} height={220} fill="#f4efe6" />
				</g>
			))}
			{/* the broken wire */}
			<rect x={252} y={60} width={40} height={26} fill="#5d646e" />
			<path d={`M 272,86 q ${-10 + 12 * Math.sin(f / 5)},70 ${6 * Math.sin(f / 6)},140`} stroke="#3a3f47" strokeWidth={7} fill="none" />
			{spark > 0 &&
				Array.from({length: 9}).map((_, k) => {
					const a = (k / 9) * Math.PI * 2 + f;
					const r0 = 6 + ((f * 3 + k * 5) % 34);
					return (
						<line key={k} x1={276 + Math.cos(a) * r0} y1={226 + Math.sin(a) * r0} x2={276 + Math.cos(a) * (r0 + 18)} y2={226 + Math.sin(a) * (r0 + 18)} stroke={YELLOW} strokeWidth={6} strokeLinecap="round" opacity={spark} />
					);
				})}
			{/* the last wire and the lamp */}
			<rect x={600} y={60} width={40} height={26} fill="#5d646e" />
			<g transform={`translate(620,86) rotate(${(th * 180) / Math.PI})`}>
				<line x1={0} y1={0} x2={0} y2={L} stroke="#3a3f47" strokeWidth={7} />
				<g transform={`translate(0,${L}) rotate(-14) scale(1.6)`}>
					<Lamp />
				</g>
			</g>
		</g>
	);
};

// apartment entrance: front door, coat hooks, a trash bag by the door
export const Hall: React.FC<{id: string; bag?: number; dark?: number; noBag?: boolean}> = ({id, bag = 0, dark = 0, noBag = false}) => (
	<g>
		<Wallpaper id={`${id}wp`} x={-400} y={-400} w={1880} h={1880} base="#d9c7a0" line="#c8b48a" />
		<rect x={-400} y={1440} width={1880} height={30} fill="#8a5a34" />
		<PlankFloor y={1470} color="#9a6a42" seam="#7f5534" />
		<rect x={360} y={520} width={420} height={940} rx={10} fill="#6a4a3a" />
		<rect x={380} y={540} width={380} height={900} rx={8} fill="#7c5644" />
		<rect x={410} y={580} width={320} height={380} rx={8} fill="none" stroke="#6a4a3a" strokeWidth={10} />
		<rect x={410} y={1000} width={320} height={400} rx={8} fill="none" stroke="#6a4a3a" strokeWidth={10} />
		<circle cx={570} cy={640} r={12} fill="#2a2a2a" />
		<rect x={690} y={960} width={46} height={18} rx={9} fill="#d8c090" />
		<rect x={706} y={990} width={14} height={30} rx={4} fill="#3a3a3a" />
		<rect x={850} y={600} width={170} height={18} rx={6} fill="#5a3a24" />
		{[880, 940, 1000].map((x) => (
			<circle key={x} cx={x} cy={630} r={9} fill="#c9b37a" />
		))}
		<path d="M 900,640 Q 860,760 890,900 L 1000,900 Q 1020,760 980,640 Z" fill="#3a5a7a" />
		{/* trash bag */}
		<g transform="translate(250,1470)" opacity={noBag ? 0 : 1}>
			{bag > 0 && <ellipse cx={0} cy={-110} rx={170} ry={170} fill={YELLOW} opacity={0.18 * bag} />}
			<path d="M -95,0 Q -125,-120 -40,-180 L -20,-215 Q 0,-235 20,-215 L 40,-180 Q 125,-120 95,0 Z" fill="#1d1f24" />
			<path d="M -18,-212 L -38,-250 M 18,-212 L 38,-250" stroke="#1d1f24" strokeWidth={12} strokeLinecap="round" />
			<path d="M -60,-60 Q -40,-130 -10,-150" stroke="#3a3d45" strokeWidth={8} fill="none" />
		</g>
		{dark > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={dark} />}
	</g>
);

// the door of your room seen from inside; behind it the lit hall with mom
const RoomDoor: React.FC<{id: string; open: number; shake: number; talk: boolean}> = ({id, open, shake: sh, talk}) => {
	const o = Math.max(0, Math.min(1, open));
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#26304f" />
			<Wallpaper id={`${id}wp`} x={-400} y={-400} w={1880} h={1880} base="#2f3a63" line="#29335a" />
			<PlankFloor y={1480} color="#3a2c2a" seam="#2a1f1e" />
			<defs>
				<clipPath id={`${id}clip`}>
					<rect x={290} y={360} width={500} height={1120} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}clip)`}>
				<Wallpaper id={`${id}hall`} x={290} y={360} w={500} h={1120} base="#e8d3a6" line="#d8c08e" />
				<rect x={290} y={1380} width={500} height={100} fill="#a8774a" />
				<g opacity={o > 0.05 ? 1 : 0}>
					<Person
						kind="mom"
						id={`${id}mom`}
						colors={MOM}
						x={560}
						y={1500}
						scale={1.0}
						face={{eyes: 'open', brows: 'neutral', mouth: talk ? 'o' : 'smile', look: [0.15, 0.25]}}
						armL={{target: [-120, -470], bend: 1}}
						armR={{target: [150, -380], bend: -1}}
					/>
					<g transform={`translate(${560 + 150},${1500 - 380})`}>
						<path d="M -70,170 Q -95,60 -30,10 L -14,-12 Q 0,-26 14,-12 L 30,10 Q 95,60 70,170 Z" fill="#1d1f24" />
					</g>
				</g>
			</g>
			{/* the door leaf swings into the room (hinge on the left) */}
			<path d={`M 290,360 L ${290 + 500 * (1 - o) + 40 * o},${360 - 50 * o} L ${290 + 500 * (1 - o) + 40 * o},${1480 + 50 * o} L 290,1480 Z`} fill="#7a5038" transform={`translate(${sh},0)`} />
			{o < 0.5 && <circle cx={290 + 500 * (1 - o) - 50} cy={940} r={20} fill="#d8c090" transform={`translate(${sh},0)`} />}
			<rect x={270} y={340} width={20} height={1140} fill="#5a3a26" />
			<rect x={790} y={340} width={20} height={1140} fill="#5a3a26" />
			<rect x={270} y={340} width={540} height={20} fill="#5a3a26" />
			<rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.18} />
		</g>
	);
};

// big bedside clock
const BigClock: React.FC<{text: string; f: number; p: number}> = ({text, f, p}) => {
	const colon = Math.floor(f / 15) % 2 === 0;
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#1a2140" />
			<rect x={-400} y={1130} width={1880} height={1300} fill="#3d2a20" />
			<rect x={-400} y={1130} width={1880} height={14} fill="#53392b" />
			<g transform={`translate(540,895) scale(${0.85 + 0.15 * p}) translate(-540,-895)`}>
				<rect x={150} y={680} width={780} height={430} rx={60} fill="#121317" />
				<rect x={182} y={712} width={716} height={366} rx={40} fill="#08080a" />
				<text x={540} y={975} fontSize={220} fontFamily={MONO} fontWeight={700} fill={RED} textAnchor="middle" style={{filter: 'drop-shadow(0 0 18px rgba(255,59,48,0.8))'}}>
					{colon ? text : text.replace(':', ' ')}
				</text>
			</g>
		</g>
	);
};

// big headphones over a bust at (x, y) with the given scale (son/teen head size)
const Headphones: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -92,10 C -100,-150 100,-150 92,10" stroke="#2b2d33" strokeWidth={16} fill="none" strokeLinecap="round" />
		<rect x={-112} y={-24} width={38} height={78} rx={16} fill="#2b2d33" />
		<rect x={74} y={-24} width={38} height={78} rx={16} fill="#2b2d33" />
		<rect x={-104} y={-14} width={10} height={58} rx={5} fill={RED} />
		<rect x={94} y={-14} width={10} height={58} rx={5} fill={RED} />
	</g>
);

// recap frames from series 1: frozen, VHS look, «◀◀ СЕРИЯ 1»
const Recap: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
	const flash = interpolate(f, [0, 4], [0.55, 0], clamp);
	const jitter = f < 3 ? (f % 2 ? 8 : -8) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translateX(${jitter}px)`}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 7px)'}} />
			<AbsoluteFill style={{background: 'rgba(40,20,10,0.18)'}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
			<div style={{position: 'absolute', left: 40, top: 304, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 2}}>◀◀ СЕРИЯ 1</div>
		</AbsoluteFill>
	);
};

// a big stamp in the middle of the screen: ✓ (came true) or ? (not checked yet)
const Stamp: React.FC<{p: number; mark: 'check' | 'q'; label: string}> = ({p, mark, label}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -12 - 6}deg)`, opacity: Math.min(1, p * 2)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(14,14,16,0.92)', border: `8px solid ${YELLOW}`, borderRadius: 26, padding: '18px 36px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)'}}>
				<div style={{width: 110, height: 110, borderRadius: 55, background: mark === 'check' ? YELLOW : 'transparent', border: `8px solid ${YELLOW}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 76, color: YELLOW}}>
					{mark === 'check' ? (
						<svg width={60} height={60} viewBox="0 0 24 24">
							<path d="M 4,13 L 10,19 L 20,5" stroke="#111" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					) : (
						'?'
					)}
				</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 54, color: '#fff', lineHeight: 1.05}}>{label}</div>
			</div>
		</div>
	) : null;

// ============================================================== SHOTS =======
// 1. Voice messages from tomorrow — from your own number.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const buzz = f >= 2 && f < 16;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + (buzz ? Math.sin(f * 2.9) * 8 : 0)} y={1000} w={680} scale={lerp(f, 0, 105, 1.0, 1.12) * kick(f)}>
				<LockScreen notif={pop(f, 3, 12)} ring={pop(f, 72, 12)} />
			</Phone>
		</AbsoluteFill>
	);
};

// 2. Recap: «Не садись в лифт» → the lift got stuck ✓.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	return (
		<Recap f={t}>
			<Freeze frame={i === 0 ? 118 : 95}>{i === 0 ? <G1.S03 /> : <G1.S08 />}</Freeze>
			{i === 1 && <Stamp p={pop(t, 15, 10)} mark="check" label="ЛИФТ ЗАСТРЯЛ" />}
		</Recap>
	);
};

// 3. Recap: «На физре не трогай мяч» ? → your face: you decided to check.
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
	return <FaceClose t={t} id="g2s3" zoom={[1.0, 1.12]} face={{eyes: 'narrow', brows: 'angry', mouth: t < 22 ? 'flat' : 'smile', look: [0, 0.1]}} />;
};

// 4. PE: the teacher blows the whistle and throws the ball right at you.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const S = 0.9;
	const blow = f >= 20 && f < 34;
	// hold the ball low → lift it over the head (34-41) → throw it at you (41)
	const up = interpolate(f, [34, 41], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const thrown = f >= 41;
	const rest = interpolate(f, [54, 72], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const hold: [number, number] = [75, -640 - 540 * up];
	const armR: [number, number] = thrown ? [80 + 70 * rest, -1180 + 710 * rest] : hold;
	const armL: [number, number] = [-armR[0], armR[1]];
	const fore = thrown ? 1 : 0.62 + 0.38 * up;
	const fly = interpolate(f, [41, 86], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const ballY0 = 1500 - (640 + 550 * up) * S;
	const bx = 540 + 90 * fly;
	const by = thrown ? ballY0 + (1050 - ballY0) * fly : ballY0;
	const bs = 0.72 + 4.2 * fly;
	return (
		<Stage cam={{s: lerp(f, 0, 90, 1.0, 1.05) * kick(f), cx: 540, cy: 980}} light={{glow: 0.3, vignette: 0.5}} bg="#dfe6d8">
			<Gym />
			<Classmates f={f} xs={[110, 990, 870]} y={1470} idp="g2s4k" face={{eyes: 'open', mouth: 'flat', brows: 'neutral'}} />
			<Teacher
				id="g2s4t"
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

// 5. You catch it → something creaks above you.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [26]);
	if (i === 0) {
		const inb = interpolate(t, [0, 6], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
		const S = 1.15;
		const caught = t >= 6;
		const hitK = caught ? Math.exp(-(t - 6) / 4) : 0;
		return (
			<Stage cam={{s: 1.0 * (caught ? 1 + 0.04 * hitK : 1), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
				<Gym />
				<Person
					kind="teen"
					id="g2s5"
					x={540}
					y={1640 + 10 * hitK}
					scale={S}
					backpack={false}
					breathe={t}
					face={caught ? {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0, 0.2]} : {eyes: 'wide', mouth: 'flat', brows: 'raised', look: [0, 0.3]}}
					armL={{target: [-70, -520], bend: 1, ku: 0.55, kf: 0.55}}
					armR={{target: [70, -520], bend: -1, ku: 0.55, kf: 0.55}}
				/>
				<Ball x={560 - 20 * inb} y={900 + (1640 - 520 * S - 900) * inb} s={3.2 - 2.4 * inb} rot={t * 10} />
				{caught && t < 16 && (
					<g stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={1 - (t - 6) / 10}>
						{[-1, 1].map((d) => (
							<g key={d}>
								<line x1={540 + d * 120} y1={1020} x2={540 + d * 170} y2={990} />
								<line x1={540 + d * 125} y1={1050} x2={540 + d * 185} y2={1050} />
							</g>
						))}
					</g>
				)}
			</Stage>
		);
	}
	return (
		<AbsoluteFill>
			<FaceClose t={t} id="g2s5f" zoom={[1.0, 1.1]} face={{eyes: t < 26 ? 'open' : 'wide', look: [0, -0.95], brows: 'raised', mouth: t < 26 ? 'flat' : 'o'}} />
			<AbsoluteFill>
				<svg width={1080} height={1920}>
					{Array.from({length: 14}).map((_, k) => (
						<circle key={k} cx={100 + rnd(k + 3) * 880} cy={-20 + ((t - 16 + rnd(k + 9) * 40) * (5 + rnd(k) * 5)) % 1300} r={3 + rnd(k + 2) * 5} fill="#e8e2d6" opacity={t > 16 ? 0.8 : 0} />
					))}
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// 6. The old lamp hangs on its last wire.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const ring = pop(f, 60, 10);
	return (
		<Stage cam={{s: lerp(f, 0, 87, 1.0, 1.12) * kick(f), cx: 560, cy: 830}} light={{glow: 0.25, vignette: 0.7}} bg="#c9d0c6">
			<Ceiling f={f + 20} spark={f >= 56 ? 1 : 0} />
			{ring > 0.01 && <ellipse cx={622} cy={250} rx={70 * (0.6 + 0.4 * ring)} ry={150 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={12} opacity={Math.min(1, ring)} />}
			{Array.from({length: 10}).map((_, k) => (
				<circle key={k} cx={420 + rnd(k + 1) * 400} cy={200 + ((f * (4 + rnd(k) * 4) + rnd(k + 7) * 600) % 1000)} r={3 + rnd(k + 4) * 4} fill="#8a8f86" opacity={0.7} />
			))}
		</Stage>
	);
};

// 7. You jump back — the lamp smashes exactly where you stood.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const jump = lerp(f, 8, 26, 0, 1, Easing.out(Easing.cubic));
	const hop = Math.sin(Math.min(1, Math.max(0, (f - 8) / 18)) * Math.PI) * 50;
	const fall = interpolate(f, [36, 46], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const crashed = f >= 46;
	const [sx, sy] = shake(f, 46, 28, 16);
	const SPOT = 600;
	const FLOOR = 1460;
	const lampY = 470 + (FLOOR - 120 - 470) * fall;
	const ghost = interpolate(f, [62, 72], [0, 1], clamp);
	return (
		<Stage cam={{s: 0.85 * kick(f), cx: 540 + sx, cy: 1250 + sy}} light={{glow: 0.3, vignette: 0.55}} bg="#dfe6d8">
			<Gym />
			<line x1={SPOT + 10} y1={-400} x2={SPOT + 10} y2={crashed ? 200 : lampY} stroke="#3a3f47" strokeWidth={6} opacity={crashed ? 0.5 : 1} />
			{ghost > 0 && <Person kind="teen" id="g2s7g" x={SPOT} y={FLOOR + 20} scale={0.95} silhouette="#ffffff" />}
			{ghost > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill="#dfe6d8" opacity={0.6 * (1 - ghost)} />}
			<Person
				kind="teen"
				id="g2s7"
				x={SPOT - 330 * jump}
				y={FLOOR + 20 - hop}
				scale={0.95}
				breathe={f}
				face={crashed ? {eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'raised', look: [0.9, 0.2]} : {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.6, -0.8]}}
				armL={{target: [-62, -520], bend: 1, ku: 0.55, kf: 0.55}}
				armR={{target: [62, -520], bend: -1, ku: 0.55, kf: 0.55}}
			/>
			<Ball x={SPOT - 330 * jump} y={FLOOR + 20 - hop - 520 * 0.95} s={0.62} rot={0} />
			{!crashed && (
				<g transform={`translate(${SPOT + 10},${lampY}) rotate(${-12 + 50 * fall})`}>
					<Lamp />
				</g>
			)}
			{crashed && <BrokenLamp x={SPOT + 10} y={FLOOR} t={f - 46} />}
			{crashed && f < 70 && (
				<g opacity={1 - (f - 46) / 24}>
					{Array.from({length: 12}).map((_, k) => (
						<circle key={k} cx={SPOT + (rnd(k + 2) - 0.5) * 420 * Math.min(1, (f - 46) / 10)} cy={FLOOR - 40 - rnd(k + 6) * 160 * Math.min(1, (f - 46) / 12)} r={20 + rnd(k) * 30} fill="#efe9dc" opacity={0.7} />
					))}
				</g>
			)}
			{crashed && <rect x={-400} y={-400} width={1880} height={2800} fill="#fff" opacity={interpolate(f, [46, 52], [0.6, 0], clamp)} />}
		</Stage>
	);
};

// 8. The whole gym is silent → the phone vibrates in your pocket.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [45]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 45, 1.0, 1.06) * kick(t), cx: 540, cy: 1000}} light={{glow: 0.3, vignette: 0.6}} bg="#dfe6d8">
				<Gym />
				<Classmates f={t} xs={[170, 420, 650]} y={1480} idp="g2s8k" face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.2, 0.3]}} />
				<Teacher id="g2s8t" x={900} y={1500} scale={0.88} f={t} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.6, 0.3]}} />
			</Stage>
		);
	}
	const buzz = t >= 18 && t < 50 && Math.floor((t - 18) / 8) % 2 === 0;
	const jx = buzz ? Math.sin(t * 3.1) * 7 : 0;
	return (
		<Stage cam={{s: lerp(t, 0, 63, 1.0, 1.1) * kick(t), cx: 540, cy: 960}} light={{glow: 0.15, vignette: 0.7}} bg="#8a2f26">
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
};

// 9. A new voice message. Sent at 23:59.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const z = lerp(f, 26, 62, 0, 1, Easing.inOut(Easing.cubic));
	const s = (1 + 0.75 * z) * (f >= 64 ? kick(f - 64, 0.06) : 1) * kick(f);
	const p = focus(680, 512, 567, 728 + (680 - 728) * z, 885 + (760 - 885) * z, s);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="10:41">
					<VoiceBubble top={250} f={f} progress={1} />
					<div style={{position: 'absolute', inset: 0, transform: `scale(${pop(f, 6, 11)})`, transformOrigin: '10% 40%'}}>
						<VoiceBubble top={430} f={f} progress={0} ring={pop(f, 64, 10)} />
					</div>
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 10. «Я же просил…» plays → vision of tonight: 19:00, the trash bag, the front door — don't go out.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [64]);
	if (i === 0) {
		const s = lerp(t, 0, 64, 1.55, 1.7) * kick(t, 0.05);
		const p = focus(680, 304, 510, 540, 760, s);
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="10:41">
						<VoiceBubble top={250} f={t} progress={1} />
						<VoiceBubble top={430} f={t} progress={interpolate(t, [6, 196], [0.03, 0.98], clamp)} lvl={level('g10', t - 6)} />
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	const c: Cam = {s: lerp(t, 0, 134, 1.0, 1.12), cx: 560, cy: 1000};
	const sp = toScreen(c, 570, 1000);
	return (
		<Vision f={t} label="СЕГОДНЯ · 19:00">
			<Stage cam={c} light={{glow: 0.2, vignette: 0.6}} bg="#000">
				<Hall id="g2s10" bag={t >= 72 ? 0.5 + 0.5 * Math.sin((t - 72) / 4) : 0} />
				{t >= 36 && <Person kind="mom" id="g2s10m" x={880} y={1500} scale={0.95} silhouette="#2a1414" />}
			</Stage>
			<NoSign p={pop(t, 92, 9)} x={sp.x} y={sp.y} r={300} />
		</Vision>
	);
};

// 11. In the evening you slow the recording down…
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60]);
	if (i === 0) {
		const slow = t >= 21;
		const tap = interpolate(t, [17, 30], [0, 1], clamp);
		const s = lerp(t, 0, 60, 1.45, 1.6) * kick(t, 0.05);
		const p = focus(680, 304, 330, 540, 760, s);
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a2a4a 0%, #0b0710 65%)'}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="18:30">
						<VoiceBubble top={250} f={t} progress={slow ? interpolate(t, [21, 60], [0.55, 0.7], clamp) : interpolate(t, [0, 21], [0.4, 0.55], clamp)} lvl={0.4 + 0.3 * Math.abs(Math.sin(t / (slow ? 6 : 3)))} />
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
								transform: `scale(${slow ? 1 + 0.3 * pop(t, 21, 8) - 0.3 : 1})`,
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
	const wide = t >= 40;
	return (
		<Stage cam={{s: lerp(t, 0, 63, 1.0, 1.12) * kick(t), cx: 540, cy: 980}} light={{glow: 0, vignette: 0.85}} bg="#0b0710">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#2a2440" />
			<circle cx={900} cy={420} r={260} fill="#ffd27a" opacity={0.12} />
			<Bust kind="teen" id="g2s11b" x={540} y={1050} scale={3.4} face={{eyes: wide ? 'wide' : 'narrow', pupil: wide ? 0.55 : 1, look: [0, 0.6], brows: wide ? 'raised' : 'worried', mouth: wide ? 'o' : 'flat', blush: false}} />
			<Headphones x={540} y={1050} s={3.4 * 0.78} />
			<rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.3} />
			<PhoneLight id="g2s11pl" x={560} y={1900} r={1200} />
		</Stage>
	);
};

// 12. The whisper: «Это не ты».
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const words = [
		{w: 'ЭТО', at: 6},
		{w: 'НЕ', at: 16},
		{w: 'ТЫ', at: 22},
	];
	const jit = (k: number) => (rnd(f * 3 + k) - 0.5) * 10;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2a0507 0%, #000 70%)'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<path
					d={Array.from({length: 60}, (_, k) => `${k === 0 ? 'M' : 'L'} ${k * 18 + 10},${1250 + Math.sin(k * 1.3 + f) * 30 * level('g12', f - 8) + (rnd(k + f) - 0.5) * 18}`).join(' ')}
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

// 13. Exactly at seven: knock-knock, mom with a trash bag: «Сынок, вынеси мусор».
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [30]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 30, 1.0, 1.06) * kick(t), cx: 540, cy: 940}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
				<BigClock text="19:00" f={f} p={pop(t, 12, 10)} />
			</Stage>
		);
	}
	const knocks = [4, 17, 29];
	const hit = knocks.reduce((a, k) => (t >= k && t < k + 6 ? Math.max(a, 1 - (t - k) / 6) : a), 0);
	const open = lerp(t, 31, 42, 0, 1, Easing.out(Easing.cubic));
	const talk = t >= 38 && t < 72 && Math.floor(t / 5) % 2 === 0;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(t, 0, 78, 1.0, 1.1) * (1 + hit * 0.02), cx: 540, cy: 980}} light={{glow: 0.1, vignette: 0.75}} bg="#05070f">
				<RoomDoor id="g2s13" open={open} shake={hit * 8} talk={talk} />
			</Stage>
			{knocks.map((k, n) =>
				t >= k ? (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 300 + n * 240,
							top: 600 + (n % 2) * 110,
							transform: `translate(-50%,-50%) scale(${pop(t, k, 8)}) rotate(${(n - 0.5) * 14}deg)`,
							fontFamily: HEAVY,
							fontWeight: 900,
							fontSize: 96,
							color: '#fff',
							textShadow: '0 6px 0 #000, 0 0 20px rgba(0,0,0,0.6)',
							opacity: interpolate(t, [k + 16, k + 26], [1, 0], clamp),
						}}
					>
						ТУК
					</div>
				) : null,
			)}
		</AbsoluteFill>
	);
};

// 14. Finale: stay home, or go out and check who is lying? Countdown, end card.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 78, 11);
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
			<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 54, color: '#fff', lineHeight: 1.08}}>
				{text}
				<div style={{fontSize: 30, color: hot === idx ? '#fff' : color, marginTop: 6}}>{sub}</div>
			</div>
		</div>
	);
	const box = (k: number) => {
		const q = k === 2;
		return (
			<div
				key={k}
				style={{
					width: 80,
					height: 56,
					borderRadius: 12,
					background: q ? `rgba(255,211,74,${0.18 + 0.12 * Math.sin(f / 5)})` : YELLOW,
					border: `3px solid ${q ? YELLOW : '#fff3c4'}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `scale(${pop(f, 18 + k * 4, 9) * (q ? 1 + 0.06 * Math.sin(f / 5) : 1)})`,
					boxSizing: 'border-box',
					fontSize: 44,
					color: YELLOW,
					textShadow: 'none',
				}}
			>
				{q ? (
					'?'
				) : (
					<svg width={34} height={34} viewBox="0 0 24 24">
						<path d="M 4,13 L 10,19 L 20,5" stroke="#111" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</div>
		);
	};
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 300, 1.0, 1.1), cx: 560, cy: 1000}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<Hall id="g2fin" dark={0.55} bag={0.4 + 0.4 * Math.sin(f / 6)} />
				<rect x={-400} y={-400} width={1880} height={2800} fill="#000" opacity={0.35} />
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 86, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #6b4a00, 0 0 30px rgba(255,211,74,0.45)'}}>
				ЧТО <span style={{color: YELLOW}}>ВЫБЕРЕШЬ?</span>
				<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18}}>
					<span style={{fontSize: 34, color: YELLOW, marginRight: 8}}>СБЫЛОСЬ</span>
					{[0, 1, 2].map(box)}
				</div>
			</div>
			{card(c1, 680, '1', 'НЕ ВЫХОДИТЬ', '#3b82f6', 'послушаться голосового', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: YELLOW, opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ВЫЙТИ', '#e0342b', 'и проверить, кто врёт', 2)}
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
						background: YELLOW,
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
					<div style={{fontSize: 96, color: YELLOW, textShadow: '0 6px 0 #000'}}>ВЫБИРАЙ!</div>
					<div style={{fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000', marginTop: 6}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
				</div>
			)}
			{endCard > 0 && (
				<AbsoluteFill style={{opacity: endCard, background: 'radial-gradient(circle at 50% 42%, #1d2a55 0%, #0a1024 55%, #04060d 100%)'}}>
					<div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{fontSize: 40, letterSpacing: 8, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>СЕРИЯ 3</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
						<div style={{fontSize: 30, color: '#9fb0d6', marginTop: 30, letterSpacing: 1}}>
							СБЫЛОСЬ <span style={{color: '#7ee08a'}}>2 ИЗ 3</span> · ТРЕТЬЕ — <span style={{color: YELLOW}}>ПОД ВОПРОСОМ</span>
						</div>
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
