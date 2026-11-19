// «Ты с какого района?» — серия 1 «Игоречек» (1976), версия 3: новый сюжет, ~1,5 минуты.
// Ты — Игорь Лавров, 13 лет, слабый; мама зовёт тебя «Игоречек», а Сазон из 8 «Б» подхватил это прозвище и травит
// тебя (шапка в луже, двадцать копеек, синяк — три «обиды» в счётчике «ТЕРПЕНИЕ»). В районе боятся только Тяп-ляп;
// Никто тебя не зовёт — ты сам решаешь пойти к ним в качалку («Зашёл — значит, навсегда», говорят во дворе). В конце
// ты стоишь у двери их качалки — и выбор, как в других сериях: «1 ПРИШИТЬСЯ / 2 НЕ ПРИШИТЬСЯ» (пиши 1 или 2).
// Всё в «3D-камере» (2.5D): плоские 2D-слои на настоящей глубине (components/Scene3D.tsx), задний план размыт.
// 22 shots on the timeline of src/r1/timeline.ts (= the voice, see scripts/fit-voiceover.py --part r1).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {Bust, Colors, Face, PersonProps} from '../components/Person';
import {Wallpaper, WallClock} from '../components/Set';
import {Box3D, Cam3, Card3D, Floor3D, project, Scene3D} from '../components/Scene3D';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import {BOY_S, Figure3D, Ground3D, MAN_S, skyBg, Time, YardFar, YardNear} from './world3d';
import {Bedroom3D, BedroomBack, Briefcase, Cloakroom3D, CloakroomBack, HatArt, KachalkaFar, KachalkaGround, Puddle, SchoolFar, SchoolFenceArt} from './sets3d';
import {SHOTS} from './timeline';

const {YELLOW, RED} = G1;
const {Finale} = G2;

// ============================================================ people ======
export const IGOR: Colors = {top: '#2c3a66', topDark: '#222e52', pants: '#2c3a66', shoes: '#1a1a1e'};
export const IGOR_PJ: Colors = {top: '#a9bcd8', topDark: '#94a8c6'};
export const HAT = '#c8352c';
// Сазон, 8 «Б»: big, dark hair, a mean grin; his two friends
export const SAZON: Colors = {top: '#3b4660', topDark: '#2c3549', pants: '#3b4660', shoes: '#151515', hair: '#2a1d16', skin: '#e8b48e'};
export const SAZ_FR: Colors[] = [
	{top: '#3b4660', topDark: '#2c3549', pants: '#3b4660', shoes: '#151515', hair: '#8a5a32', skin: '#f0c09a'},
	{top: '#46506a', topDark: '#353d52', pants: '#46506a', shoes: '#151515', hair: '#d0a860', skin: '#f2c3a0'},
];
export const SAZ_FACE: Face = {eyes: 'narrow', mouth: 'grin', brows: 'angry', look: [0, 0], blush: false, glasses: false};
const MOM_COAT: Colors = {top: '#6a5866', topDark: '#55465a', shoes: '#3a2a2a'};
export const GVOZD: Colors = {top: '#24201d', topDark: '#151210', pants: '#2b2d33', shoes: '#111216', hair: '#1f1a1a', skin: '#e3b08a'};
export const GANG: Colors[] = [
	{top: '#3d4436', topDark: '#2c3127', pants: '#2b2d33', shoes: '#111216', hair: '#3a2a20'},
	{top: '#4a4d52', topDark: '#36383c', pants: '#2b2d33', shoes: '#111216', hair: '#5a3a2a'},
	{top: '#383f4a', topDark: '#282e36', pants: '#33302c', shoes: '#111216', hair: '#2a1a12'},
	{top: '#4a3d33', topDark: '#362c24', pants: '#2b2d33', shoes: '#111216', hair: '#8a5a32'},
];
export const GANG_CAP = ['#3a3a3a', '#4a3a2a', '#2f3640', '#3b3226'];
export const KID_HAIR = ['#6a4a2a', '#d9b46a', '#2a1d16', '#8a5a32', '#4a3020', '#b8863a'];
export const WARY: Face = {eyes: 'open', mouth: 'flat', brows: 'worried', look: [0, 0.1], blush: false};
export const SCARED: Face = {eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'worried', look: [0, 0], blush: false};
export const GV_FACE: Face = {eyes: 'narrow', mouth: 'smile', brows: 'flat', look: [0, 0.1], blush: false};
export const LAUGH = (f: number, k = 0): Face => ({eyes: 'happy', mouth: Math.floor((f + k * 3) / 5) % 2 ? 'open' : 'grin', brows: 'raised', look: [0, 0], blush: false, glasses: false});

export type P = Omit<PersonProps, 'x' | 'y'>;
export const igor = (id: string, extra: Partial<P> = {}): P => ({kind: 'boy', id, scale: BOY_S, plain: true, pioneer: true, colors: IGOR, ...extra});
export const sazon = (id: string, extra: Partial<P> = {}): P => ({kind: 'teen', id, scale: 0.54, plain: true, colors: SAZON, face: SAZ_FACE, ...extra});
export const sazFriend = (id: string, k: number, extra: Partial<P> = {}): P => ({kind: 'teen', id, scale: 0.52, plain: true, colors: SAZ_FR[k % 2], face: {...SAZ_FACE, mouth: 'smile'}, ...extra});
export const man = (id: string, colors: Colors, extra: Partial<P> = {}): P => ({kind: 'dad', id, scale: MAN_S, plain: true, colors, ...extra});
export const gvozd = (id: string, extra: Partial<P> = {}): P => man(id, GVOZD, {cap: '#2a2a2a', face: GV_FACE, ...extra});
export const gang = (id: string, k: number, extra: Partial<P> = {}): P => man(id, GANG[k % 4], {quilt: true, cap: GANG_CAP[k % 4], face: {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [0, 0.1], blush: false}, ...extra});
// schoolkids: boys in the uniform, girls in brown dresses with white aprons
export const kid = (id: string, k: number, extra: Partial<P> = {}): P =>
	k % 3 === 2
		? {kind: 'mom', id, scale: 0.43, colors: {top: '#6a4632', topDark: '#55382a', shoes: '#2a1a14', hair: KID_HAIR[k % 6]}, ...extra}
		: {kind: 'boy', id, scale: 0.5, plain: true, pioneer: k % 2 === 0, colors: {...IGOR, hair: KID_HAIR[k % 6], skin: k % 4 === 1 ? '#f0c09a' : '#f6cba8'}, ...extra};
export const MOM_FACE = (talk: boolean, f: number, extra: Partial<Face> = {}): Face => ({eyes: 'open', mouth: talk ? (Math.floor(f / 5) % 2 ? 'open' : 'smile') : 'smile', brows: 'raised', look: [0.6, 0], ...extra});

// ============================================================ close-up art (inside cards) ==========
export const Coin: React.FC<{x: number; y: number; s: number; rot?: number; flip?: number}> = ({x, y, s, rot = 0, flip = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s * flip},${s}) rotate(${rot})`}>
		<circle r={100} fill="#c9ccd2" />
		<circle r={88} fill="#dfe2e6" stroke="#aeb2ba" strokeWidth={6} />
		<text y={20} fontSize={86} fontFamily={HEAVY} fontWeight={900} fill="#8a8e96" textAnchor="middle">
			20
		</text>
		<text y={56} fontSize={20} fontFamily={HEAVY} fontWeight={900} fill="#8a8e96" textAnchor="middle">
			КОПЕЕК
		</text>
		<text y={-48} fontSize={20} fontFamily={HEAVY} fontWeight={900} fill="#8a8e96" textAnchor="middle">
			1976
		</text>
	</g>
);
// your open palm, seen from above (navy sleeve, white cuff)
export const Palm: React.FC<{s: number; children?: React.ReactNode}> = ({s, children}) => (
	<g transform={`scale(${s})`}>
		<rect x={-130} y={170} width={260} height={500} rx={40} fill={IGOR.top} />
		<rect x={-120} y={150} width={240} height={40} rx={12} fill="#e9e4d8" />
		<ellipse cx={0} cy={60} rx={150} ry={150} fill="#f6cba8" />
		{[-90, -30, 30, 90].map((fx, k) => (
			<rect key={k} x={fx - 28} y={-250 + Math.abs(fx) * 0.5} width={56} height={240} rx={28} fill="#f6cba8" />
		))}
		<rect x={-220} y={-40} width={56} height={180} rx={28} fill="#f6cba8" transform="rotate(-38 -192 50)" />
		{children}
	</g>
);
// a fist with a sleeve, the knuckles pointing right (art centred on the knuckles)
export const Fist: React.FC<{sleeve: string}> = ({sleeve}) => (
	<g>
		<rect x={-640} y={-70} width={560} height={140} rx={50} fill={sleeve} />
		<rect x={-110} y={-76} width={40} height={152} rx={12} fill="#e9e4d8" />
		<rect x={-80} y={-80} width={150} height={160} rx={56} fill="#e8b48e" />
		{[-46, -14, 18, 50].map((y) => (
			<rect key={y} x={30} y={y - 14} width={50} height={28} rx={14} fill="#d9a07a" />
		))}
	</g>
);
// Гвоздь close up: cap, a match between his teeth (art centred on his head)
export const GvozdHead: React.FC<{id: string; t: number; s: number; face?: Face; tilt?: number}> = ({id, t, s, face, tilt = 0}) => (
	<g>
		<Bust kind="dad" id={id} x={0} y={0} scale={s} tilt={tilt} colors={GVOZD} face={face ?? GV_FACE} />
		<g transform={`scale(${s}) rotate(${tilt})`}>
			<path d="M -90,-31 C -96,-135 96,-135 90,-31 Q 0,-44 -90,-31 Z" fill="#2a2a2a" />
			<ellipse cx={0} cy={-31} rx={78} ry={13} fill="#2a2a2a" stroke="rgba(0,0,0,0.35)" strokeWidth={4} />
			<g transform={`rotate(${-14 + Math.sin(t / 8) * 6} 30 52)`}>
				<rect x={30} y={50} width={46} height={5} rx={2} fill="#e8d6a8" />
				<circle cx={77} cy={52} r={5} fill="#b8322a" />
			</g>
		</g>
	</g>
);
// the small print under the HUD on the history shots
export const RealStory: React.FC<{f: number}> = ({f}) => (
	<div style={{position: 'absolute', top: 236, width: '100%', textAlign: 'center', opacity: interpolate(f, [4, 12], [0, 1], clamp)}}>
		<span style={{display: 'inline-block', background: 'rgba(8,8,12,0.62)', borderRadius: 12, padding: '8px 22px', fontFamily: "'Inter', 'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 25, letterSpacing: 2, color: '#e9e2cf'}}>
			ПО МОТИВАМ РЕАЛЬНОЙ ИСТОРИИ · ГЕРОИ ВЫМЫШЛЕНЫ
		</span>
	</div>
);

// a yard street lamp (art 700 × 1900, the lamp head at (565, 204))
export const Lamp3D: React.FC<{x: number; z: number; on?: number; cone?: number}> = ({x, z, on = 1, cone = 0}) => (
	<Card3D x={x} y={0} z={z} w={700} h={1900}>
		{cone > 0 && <path d="M 545,210 L 585,210 L 900,1900 L 230,1900 Z" fill="#ffe7a0" opacity={0.14 * cone * on} />}
		<rect x={330} y={260} width={40} height={1640} fill="#6d6a62" />
		<path d="M 350,280 Q 370,150 560,160" stroke="#6d6a62" strokeWidth={30} fill="none" />
		<path d="M 510,150 L 620,150 L 600,200 L 530,200 Z" fill="#4f4d46" />
		{on > 0 && (
			<g opacity={on}>
				<ellipse cx={565} cy={204} rx={40} ry={14} fill="#fff1c0" />
				<circle cx={565} cy={210} r={160} fill="#ffe7a0" opacity={0.18} />
			</g>
		)}
	</Card3D>
);
// a pool of lamp light on the ground
export const LightPool: React.FC<{x: number; z: number; on?: number}> = ({x, z, on = 1}) => (
	<Floor3D y={-1} zNear={z + 500} depth={1000} w={1400} x={x} res={1}>
		<defs>
			<radialGradient id={`lp${x}${z}`} cx={0.5} cy={0.5} r={0.5}>
				<stop offset="0" stopColor="#ffe7a0" stopOpacity={0.55 * on} />
				<stop offset="1" stopColor="#ffe7a0" stopOpacity={0} />
			</radialGradient>
		</defs>
		<rect width={1400} height={1000} fill={`url(#lp${x}${z})`} />
	</Floor3D>
);

// a close-up card in front of the blurred yard (palm, fist, faces)
export const CloseUp: React.FC<{cam: Cam3; f: number; time?: Time; children: React.ReactNode; blur?: number; far?: React.ReactNode; bg?: string}> = ({cam, f, time = 'day', children, blur = 9, far, bg}) => (
	<Scene3D
		cam={cam}
		bg={bg ?? skyBg(time)}
		far={
			far ?? (
				<>
					<YardFar f={f} time={time} />
					<YardNear id={`cu${time}`} time={time} />
				</>
			)
		}
		farBlur={blur}
	>
		{children}
	</Scene3D>
);
// the school yard: ground, the fence with the gate (z −1700), the school far behind
export const SchoolYardFar: React.FC<{f: number}> = ({f}) => (
	<>
		<SchoolFar f={f} />
	</>
);
export const SchoolYardNear: React.FC<{id: string; fence?: boolean}> = ({id, fence = true}) => (
	<>
		<Ground3D id={`${id}g`} time="day" />
		{fence && (
			<Card3D x={0} y={0} z={-1700} w={10000} h={560}>
				<SchoolFenceArt w={10000} h={560} gx0={4700} gx1={5300} />
			</Card3D>
		)}
	</>
);
// a comic «ХА!» popping over a laughing kid
export const Ha: React.FC<{x: number; y: number; at: number; rot?: number; size?: number}> = ({x, y, at, rot = 0, size = 64}) => {
	const f = useCurrentFrame();
	if (f < at || f > at + 30) return null;
	const p = pop(f, at, 8) * interpolate(f, [at + 22, at + 30], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color: '#fff', WebkitTextStroke: '0px', textShadow: '0 0 0 #000, 4px 4px 0 #111, -4px -4px 0 #111, 4px -4px 0 #111, -4px 4px 0 #111'}}>
			ХА!
		</div>
	);
};
// a static plaque in the style of the rule plaques (does not fly to the counter)
export const RulePlaque: React.FC<{title: string; label: string; from: number; to: number; y?: number}> = ({title, label, from, to, y = 430}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const p = pop(f, from, 10) * interpolate(f, [to - 8, to], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 540, top: y, width: 860, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -4}deg)`, opacity: p, background: '#121214', border: '7px solid #e0342b', borderRadius: 26, padding: '26px 40px 30px', boxShadow: '0 0 0 4px rgba(0,0,0,0.6), 0 18px 40px rgba(0,0,0,0.45)', boxSizing: 'border-box', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
			<div style={{fontSize: 38, letterSpacing: 10, color: '#ff9a2e'}}>{label}</div>
			{title.split('\n').map((l) => (
				<div key={l} style={{fontSize: 66, lineHeight: 1.08, color: '#fff', marginTop: 8}}>
					{l}
				</div>
			))}
		</div>
	);
};
export const vignette = (a = 0.5) => <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, transparent 48%, rgba(0,0,0,${a}) 100%)`}} />;

// ============================================================ the kitchen (S05 morning, S11 evening) ======
const KW = 650; // half the width of the kitchen
const KITCHEN_TILE = {background: '#d8e4dc', backgroundImage: 'linear-gradient(#b7cbc1 3px, transparent 3px), linear-gradient(90deg, #b7cbc1 3px, transparent 3px)', backgroundSize: '60px 60px'};
// the back wall — its own pass behind the room (Chrome drops parts of a far layer when the near planes of the same
// 3D context cross behind the camera during a push-in)
export const KitchenBack: React.FC<{id: string; f: number; morning?: boolean}> = ({id, f, morning = false}) => (
	<Card3D x={0} y={0} z={-1200} w={KW * 2} h={900}>
		<Wallpaper id={`${id}wp`} x={0} y={0} w={KW * 2} h={900} base="#c9d8c0" line="#b0c4a6" />
		<rect x={0} y={560} width={KW * 2} height={340} fill="#d8e4dc" />
		{Array.from({length: Math.floor((KW * 2) / 60)}).map((_, k) => (
			<line key={`v${k}`} x1={(k + 1) * 60} y1={560} x2={(k + 1) * 60} y2={900} stroke="#b7cbc1" strokeWidth={3} />
		))}
		{Array.from({length: 5}).map((_, k) => (
			<line key={`h${k}`} x1={0} y1={560 + (k + 1) * 60} x2={KW * 2} y2={560 + (k + 1) * 60} stroke="#b7cbc1" strokeWidth={3} />
		))}
		<rect x={150} y={150} width={340} height={360} fill="#5a4a3a" />
		{morning ? (
			<>
				<rect x={166} y={166} width={308} height={328} fill="#cfe0ec" />
				<rect x={166} y={380} width={308} height={114} fill="#d6c9a8" />
				{[190, 290, 390].map((x) => (
					<rect key={x} x={x} y={300} width={60} height={90} fill="#c2b490" />
				))}
			</>
		) : (
			<>
				<rect x={166} y={166} width={308} height={328} fill="#0f1834" />
				{[
					[196, 330],
					[260, 380],
					[380, 330],
					[420, 400],
					[200, 430],
				].map(([x, y], k) => (
					<rect key={k} x={x} y={y} width={22} height={26} fill="#f2c96a" opacity={0.8} />
				))}
				<circle cx={410} cy={214} r={20} fill="#f4f0d8" opacity={0.85} />
			</>
		)}
		<rect x={316} y={166} width={8} height={328} fill="#5a4a3a" />
		<rect x={166} y={262} width={308} height={8} fill="#5a4a3a" />
		<rect x={140} y={500} width={360} height={22} fill="#e9e4d8" />
		<path d="M 128,138 Q 158,330 138,520 L 200,520 Q 214,330 190,138 Z" fill="#e8d6a6" />
		<path d="M 512,138 Q 482,330 502,520 L 440,520 Q 426,330 450,138 Z" fill="#e8d6a6" />
		<rect x={116} y={126} width={408} height={14} rx={7} fill="#7a6a5a" />
		<g transform="translate(-260,-120) scale(0.9)">
			<WallClock x={900} y={260} h={morning ? 7 : 6} m={morning ? 30 : 10} tick={f} />
		</g>
	</Card3D>
);
export const Kitchen3D: React.FC<{id: string; lamp?: boolean}> = ({id, lamp = true}) => (
	<>
		<Floor3D y={0} zNear={700} depth={1900} w={KW * 2} res={1}>
			<defs>
				<pattern id={`${id}lin`} width={120} height={120} patternUnits="userSpaceOnUse">
					<rect width={120} height={120} fill="#b8915e" />
					<rect width={60} height={60} fill="#a9824f" />
					<rect x={60} y={60} width={60} height={60} fill="#a9824f" />
				</pattern>
			</defs>
			<rect width={KW * 2} height={1900} fill={`url(#${id}lin)`} />
		</Floor3D>
		<Floor3D y={-900} zNear={700} depth={1900} w={KW * 2} res={1}>
			<defs>
				<radialGradient id={`${id}ceil`} cx={0.5} cy={0.55} r={0.65}>
					<stop offset="0" stopColor={lamp ? '#efe6cf' : '#dcd8cc'} />
					<stop offset="1" stopColor="#8d8676" />
				</radialGradient>
			</defs>
			<rect width={KW * 2} height={1900} fill={`url(#${id}ceil)`} />
		</Floor3D>
		{[-1, 1].map((sd) => (
			<Card3D key={sd} x={sd * (KW - 950)} y={0} z={700} w={1900} h={900} ry={sd * -90} html>
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sd < 0 ? 90 : 270}deg, #b9c8b0, #a3b29a)`}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 560, bottom: 0, ...KITCHEN_TILE, filter: 'brightness(0.9)'}} />
			</Card3D>
		))}
		<Floor3D y={-230} zNear={-820} depth={380} w={400} x={-450} res={1}>
			<defs>
				<pattern id={`${id}oil`} width={80} height={80} patternUnits="userSpaceOnUse">
					<rect width={80} height={80} fill="#f4f0e8" />
					<rect width={40} height={40} fill="#d84a3a" />
					<rect x={40} y={40} width={40} height={40} fill="#d84a3a" />
				</pattern>
			</defs>
			<rect width={400} height={380} fill={`url(#${id}oil)`} />
			<ellipse cx={250} cy={210} rx={46} ry={34} fill="#f8f8f4" />
			<ellipse cx={250} cy={210} rx={30} ry={20} fill="#e2d6b8" />
		</Floor3D>
		<Card3D x={-450} y={0} z={-820} w={400} h={230}>
			<rect x={0} y={0} width={400} height={34} fill="#d84a3a" />
			{Array.from({length: 5}).map((_, k) => (
				<rect key={k} x={k * 80 + 40} y={0} width={40} height={34} fill="#f4f0e8" />
			))}
			<rect x={22} y={34} width={22} height={196} fill="#6a4a2a" />
			<rect x={356} y={34} width={22} height={196} fill="#6a4a2a" />
		</Card3D>
		<Card3D x={180} y={0} z={-1060} w={340} h={402} view={[0, 0, 440, 520]}>
			<rect x={0} y={60} width={440} height={460} fill="#ecebe6" />
			<rect x={0} y={30} width={440} height={40} fill="#d6d4cc" />
			<ellipse cx={110} cy={28} rx={60} ry={12} fill="#3a3a3a" />
			<ellipse cx={330} cy={28} rx={60} ry={12} fill="#3a3a3a" />
			<rect x={40} y={140} width={360} height={260} rx={14} fill="#d6d4cc" />
			{[0, 1, 2, 3].map((k) => (
				<circle key={k} cx={80 + k * 94} cy={100} r={13} fill="#2a2a2a" />
			))}
			<path d="M 92,-10 Q 92,-60 132,-60 L 160,-60 Q 196,-60 196,-20 L 196,10 L 92,10 Z" fill="#7d8a96" />
		</Card3D>
		<Box3D x={520} y={0} z={-760} w={240} h={560} d={260} side="#cfcdc5" sideOn="left">
			<rect x={0} y={0} width={240} height={560} rx={30} fill="#f1efe8" />
			<rect x={0} y={0} width={240} height={560} rx={30} fill="none" stroke="#d8d5cc" strokeWidth={6} />
			<rect x={22} y={180} width={14} height={110} rx={7} fill="#b9bcc0" />
			<text x={120} y={80} textAnchor="middle" fontFamily="serif" fontStyle="italic" fontWeight={700} fontSize={36} fill="#b9bcc0">
				ЗИЛ
			</text>
		</Box3D>
		<Card3D x={0} y={-600} z={-300} w={300} h={300}>
			<line x1={150} y1={0} x2={150} y2={200} stroke="#3a3330" strokeWidth={5} />
			{lamp && <circle cx={150} cy={262} r={150} fill="#ffe7a0" opacity={0.16} />}
			<path d="M 98,200 L 202,200 L 250,274 L 50,274 Z" fill="#e2803a" />
			<path d="M 98,200 L 202,200 L 214,218 L 86,218 Z" fill="#c4672a" />
			<ellipse cx={150} cy={276} rx={40} ry={12} fill={lamp ? '#fff4cc' : '#d8d0b8'} />
		</Card3D>
	</>
);

// ============================================================== SHOTS =======
// 1. THE HOOK (cold open): the door of the «качалка» of Тяп-ляп at night — and you came here yourself.
// «Ты стоишь у двери самой опасной группировки района. И пришёл ты сюда сам.» Your POV walks up; your hand rises.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const D = SHOTS[0].duration;
	const push = lerp(f, 0, D - 18, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(push, 0, 1, 1640, 1700), y: lerp(push, 0, 1, -450, -420), z: lerp(push, 0, 1, 380, 1500)};
	const rw = interpolate(f, [D - 16, D], [0, 1], clamp); // the rewind into the past
	const hand = lerp(f, D - 60, D - 22, 0, 1, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: rw > 0 ? `blur(${rw * 6}px) saturate(${1 - rw})` : undefined, transform: `skewX(${rw * -10}deg) scale(${1 + rw * 0.08})`}}>
				<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
					<KachalkaGround id="r1hookg" />
					{hand > 0 && (
						<Card3D x={1700} y={-430} z={-1000} w={900} h={700} anchor="center" view={[-450, -350, 900, 700]}>
							<g transform={`translate(${lerp(hand, 0, 1, -620, -120)},${lerp(hand, 0, 1, 420, 20)}) rotate(-70)`}>
								<rect x={-560} y={-60} width={520} height={120} rx={44} fill={IGOR.top} />
								<rect x={-60} y={-64} width={40} height={128} rx={12} fill="#e9e4d8" />
								<rect x={-20} y={-66} width={150} height={132} rx={52} fill="#f6cba8" />
								{[-40, -13, 14, 41].map((y) => (
									<rect key={y} x={100} y={y - 12} width={44} height={24} rx={12} fill="#e8b48e" />
								))}
							</g>
						</Card3D>
					)}
				</Scene3D>
				{vignette(0.65)}
			</AbsoluteFill>
			{rw > 0 &&
				Array.from({length: 9}).map((_, k) => (
					<div key={k} style={{position: 'absolute', left: 0, right: 0, top: (k * 233 + f * 61) % 1920, height: 10 + (k % 3) * 8, background: '#fff', opacity: 0.35 * rw}} />
				))}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [D - 8, D], [0, 0.8], clamp)}} />
		</AbsoluteFill>
	);
};

// 2. «А началось всё с одного слова — «Игоречек».» A school blackboard: the word in chalk and a caricature of you.
const Blackboard: React.FC<{f: number}> = ({f}) => {
	const word = 'ИГОРЕЧЕК';
	const shown = Math.floor(interpolate(f, [26, 62], [0, word.length], clamp));
	return (
		<g>
			<rect x={-40} y={-40} width={2080} height={1180} fill="#6a4a2e" />
			<rect width={2000} height={1100} fill="#2f4a3c" />
			<rect width={2000} height={1100} fill="url(#r1chalkdust)" />
			<path d="M 120,180 Q 600,120 1000,210 T 1880,170" stroke="#e8efe8" strokeOpacity={0.12} strokeWidth={60} fill="none" />
			<text x={1000} y={560} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={158} fill="#f2f4ee" fillOpacity={0.92} letterSpacing={4} transform="rotate(-4 1000 560)">
				{word.slice(0, shown)}
			</text>
			{f > 64 && (
				<g transform="translate(1380,190) rotate(6) scale(0.7)" stroke="#f2f4ee" strokeWidth={9} fill="none" strokeLinecap="round" opacity={interpolate(f, [64, 70], [0, 0.9], clamp)}>
					<circle cx={0} cy={0} r={60} />
					<path d="M -66,-20 Q 0,-110 66,-20 M 20,-90 l 16,-30" />
					<circle cx={40} cy={-126} r={14} />
					<path d="M -22,-6 l 8,8 M 14,-6 l 8,8 M -20,30 Q 0,16 20,30 M -24,8 q 4,24 -6,40" />
					<path d="M 0,60 L 0,200 M 0,110 L -60,160 M 0,110 L 60,160 M 0,200 L -50,290 M 0,200 L 50,290" />
				</g>
			)}
			{f > 72 && (
				<text x={640} y={330} fontFamily={HEAVY} fontWeight={900} fontSize={76} fill="#f2f4ee" fillOpacity={0.85} transform="rotate(-8 640 330)">
					ХА-ХА
				</text>
			)}
			<rect x={-40} y={1100} width={2080} height={40} fill="#7a5a3a" />
			<rect x={300} y={1080} width={140} height={26} rx={8} fill="#f2f4ee" />
		</g>
	);
};
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 90, -110, 70), y: -10, z: lerp(f, 0, 90, 240, 360), ry: lerp(f, 0, 90, 5, -3)};
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="radial-gradient(circle at 50% 45%, #3a3a34 0%, #141412 75%)">
				<Card3D x={0} y={0} z={-300} w={2000} h={1100} anchor="center" view={[0, 0, 2000, 1100]}>
					<defs>
						<pattern id="r1chalkdust" width={60} height={60} patternUnits="userSpaceOnUse">
							<circle cx={10} cy={14} r={2} fill="#fff" opacity={0.07} />
							<circle cx={40} cy={44} r={3} fill="#fff" opacity={0.05} />
						</pattern>
					</defs>
					<Blackboard f={f} />
				</Card3D>
				<Card3D x={-520} y={420} z={60} w={900} h={120} anchor="center">
					<rect width={900} height={120} rx={14} fill="#5a3f28" />
					<rect y={0} width={900} height={20} fill="#6e4e33" />
				</Card3D>
			</Scene3D>
			{vignette(0.6)}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 8], [0.8, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 3. (after the flashback) Казань, 1976. You are Igor Lavrov, thirteen — your yard. (close-up → crane up)
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const out = lerp(f, 110, 137, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(out, 0, 1, 0, 300), y: lerp(out, 0, 1, -380, -1150), z: lerp(out, 0, 1, 950, -1500), rx: lerp(out, 0, 1, 0, 8)};
	const tag = (x: number, y: number, z: number) => project(cam, x, y, z);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<YardFar f={f} />} farBlur={lerp(out, 0, 1, 7, 2.5)}>
				<YardNear id="r1s1" />
				<Figure3D x={0} z={0} p={igor('r1s1you', {breathe: f, face: WARY, armR: {target: [150, -260], bend: -1}, itemR: <Briefcase />})} />
			</Scene3D>
			<div style={{position: 'absolute', top: 380, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: interpolate(f, [2, 7, 52, 58], [0, 1, 1, 0], clamp)}}>
				<div style={{fontSize: 220, lineHeight: 1, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.45)', transform: `scale(${pop(f, 2, 10)})`}}>1976</div>
				<div style={{fontSize: 46, letterSpacing: 10, color: YELLOW, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>КАЗАНЬ · ОКТЯБРЬ</div>
			</div>
			<RealStory f={f} />
			{f >= 72 && f < 128 && <NameTag x={540} y={tag(0, -470, 0).y - 110} title="ИГОРЬ ЛАВРОВ" sub="13 ЛЕТ" at={72} pin={82} color={YELLOW} to={128} />}
		</AbsoluteFill>
	);
};

// 4. «И тебя здесь бьют каждый день» — a shove at the garages: the camera shakes, a flash
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const at = 30;
	const k = interpolate(f, [at, at + 5, at + 34], [0, 1, 0.6], clamp);
	const shake = f >= at ? Math.sin((f - at) * 2.1) * 26 * Math.exp(-(f - at) / 10) : 0;
	const hand = interpolate(f, [at - 8, at, at + 10, at + 24], [-900, -70, -170, -900], clamp);
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 1700 + shake, y: -380 + shake * 0.4, z: lerp(f, 0, 78, 640, 760)}} f={f} blur={9}>
				<Card3D x={1700 + 150 * k} y={-420} z={-220} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<g transform={`rotate(${14 * k})`}>
						<Bust kind="boy" id="r1s2you" x={0} y={0} scale={1.4} colors={IGOR} face={f < at ? {...WARY, look: [-0.7, 0]} : {...SCARED, eyes: 'closed'}} />
					</g>
				</Card3D>
				<Card3D x={1700} y={-300} z={-120} w={1400} h={600} anchor="center" view={[-700, -300, 1400, 600]}>
					<g transform={`translate(${hand},40) rotate(-8)`}>
						<rect x={-700} y={-70} width={620} height={140} rx={50} fill={SAZON.top} />
						<ellipse cx={-40} cy={0} rx={96} ry={84} fill="#e8b48e" />
					</g>
				</Card3D>
			</CloseUp>
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [at, at + 1, at + 7], [0, 0.6, 0], clamp)}} />
			{vignette(0.55)}
		</AbsoluteFill>
	);
};

// 5. At home you are «Игоречек» — mom ruffles your hair in the morning kitchen
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 90, 90, 130), y: -440, z: lerp(f, 0, 90, 800, 920)};
	const reach = interpolate(f, [6, 18], [0, 1], clamp);
	const rub = Math.sin(f / 3) * 30 * reach;
	const m = project(cam, 0, -470, -650);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#1a1520" far={<KitchenBack id="r1s3" f={f} morning />} farBlur={0}>
				<Kitchen3D id="r1s3" lamp={false} />
				<Figure3D
					x={0}
					z={-650}
					p={{
						kind: 'mom',
						id: 'r1s3mom',
						scale: 0.48,
						breathe: f,
						face: MOM_FACE(f > 10 && f < 50, f, {eyes: 'happy'}),
						armR: reach > 0 ? {target: [lerp(reach, 0, 1, 190, 400 + rub), lerp(reach, 0, 1, -380, -930)], bend: 1} : undefined,
					}}
				/>
				<Figure3D x={200} z={-600} p={igor('r1s3you', {breathe: f, headTilt: reach * 6, face: {eyes: 'closed', mouth: 'flat', brows: 'worried', blush: true}, armR: {target: [150, -260], bend: -1}, itemR: <Briefcase />})} />
			</Scene3D>
			<Bubble x={Math.max(300, m.x - 40)} y={m.y - 70} text="ИГОРЕЧЕК!" from={24} to={86} tail="left" />
		</AbsoluteFill>
	);
};

// 6. Every morning she walks you to school and shouts across the yard: «Игоречек, шапку надень!»
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [128]);
	if (i === 0) {
		const cam: Cam3 = {x: lerp(t, 0, 128, -380, -140), y: -470, z: lerp(t, 0, 128, 950, 1250), ry: lerp(t, 0, 128, -3, 2)};
		const turn = t > 108;
		const m = project(cam, -560, -560, -1450);
		return (
			<AbsoluteFill>
				<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={t} />} farBlur={5}>
					<SchoolYardNear id="r1s4" />
					{[
						[-900, -2500, 0],
						[700, -2700, 1],
						[420, -2400, 2],
						[-420, -2900, 3],
						[1100, -2350, 4],
					].map(([x, z, k]) => (
						<Figure3D key={k} x={x} z={z} p={kid(`r1s4k${k}`, k, {breathe: t + k * 7, back: !turn || k === 3, face: turn ? LAUGH(t, k) : undefined})} />
					))}
					<Figure3D x={lerp(t, 0, 100, -120, 120)} z={lerp(t, 0, 100, -1950, -2250)} p={igor('r1s4you', {back: !turn, walk: !turn ? t * 0.45 : undefined, breathe: t, face: {...WARY, blush: true, brows: 'worried'}, armR: {target: [150, -260], bend: -1}, itemR: <Briefcase />})} />
					<Figure3D x={-560} z={-1450} p={{kind: 'mom', id: 'r1s4mom', scale: 0.48, back: true, plain: true, colors: MOM_COAT, breathe: t, armR: {target: [260, -1020], bend: -1}}} />
				</Scene3D>
				<Bubble x={Math.min(620, Math.max(470, m.x + 260))} y={m.y - 40} text="ИГОРЕЧЕК, ШАПКУ НАДЕНЬ!" from={98} to={128} tail="left" />
			</AbsoluteFill>
		);
	}
	// you pull the red hat on, red in the face; the yard giggles behind you
	const on = lerp(t, 8, 28, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<CloseUp cam={{x: 100, y: -470, z: lerp(t, 0, 40, 650, 740)}} f={t} far={<><SchoolYardFar f={t} /><SchoolYardNear id="r1s4cu" /></>} blur={9}>
			<Card3D x={100} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
				<Bust kind="boy" id="r1s4cu" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: 'closed', mouth: 'flat', brows: 'worried', blush: true}} />
				<g transform={`translate(0,${lerp(on, 0, 1, -330, 0)}) scale(1.4)`}>
					<HatArt color={HAT} />
				</g>
			</Card3D>
		</CloseUp>
	);
};

// 7. Сазон from 8 «Б» hears it — and now the whole school calls you «Игоречек»
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [72]);
	if (i === 0) {
		const cam: Cam3 = {x: lerp(t, 0, 72, 640, 700), y: -470, z: lerp(t, 0, 72, 880, 1120)};
		const s = project(cam, 700, -500, -700);
		return (
			<AbsoluteFill>
				<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={t} />} farBlur={6}>
					<SchoolYardNear id="r1s5" fence={false} />
					<Figure3D x={420} z={-820} p={sazFriend('r1s5f0', 0, {breathe: t + 5, face: LAUGH(t, 1)})} />
					<Figure3D x={980} z={-860} p={sazFriend('r1s5f1', 1, {breathe: t + 11, face: LAUGH(t, 2)})} />
					<Figure3D x={700} z={-700} p={sazon('r1s5saz', {breathe: t, headTurn: -0.5, face: {...SAZ_FACE, look: [-0.8, 0]}})} />
				</Scene3D>
				{t >= 18 && <NameTag x={Math.min(760, Math.max(330, s.x))} y={s.y - 150} title="САЗОН" sub="8 «Б»" at={18} color={RED} />}
			</AbsoluteFill>
		);
	}
	// the whole school: kids at every depth, «ИГОРЕЧЕК!» from all sides
	const cam: Cam3 = {x: lerp(t, 0, 78, -100, 120), y: -440, z: lerp(t, 0, 78, 500, 1000), ry: lerp(t, 0, 78, 4, -3)};
	const KIDS = [
		[-520, -700, 0],
		[380, -560, 1],
		[-180, -1100, 2],
		[640, -1300, 3],
		[-760, -1500, 4],
		[140, -1700, 5],
		[-380, -2100, 6],
		[880, -2000, 7],
	];
	const calls = [
		{k: 1, at: 4},
		{k: 0, at: 16},
		{k: 3, at: 28},
		{k: 2, at: 40},
	];
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={t} />} farBlur={6}>
				<SchoolYardNear id="r1s5b" fence={false} />
				{KIDS.map(([x, z, k]) => (
					<Figure3D key={k} x={x} z={z} p={kid(`r1s5k${k}`, k, {breathe: t + k * 5, face: LAUGH(t, k), headTurn: x > 0 ? -0.4 : 0.4})} />
				))}
			</Scene3D>
			{calls.map((c) => {
				const [x, z] = KIDS[c.k];
				const pp = project(cam, x, -520, z);
				return <Bubble key={c.k} x={Math.min(700, Math.max(380, pp.x))} y={pp.y - 30} text="ИГОРЕЧЕК!" from={72 + c.at} to={72 + c.at + 34} tail={pp.x > 540 ? 'right' : 'left'} />;
			})}
		</AbsoluteFill>
	);
};

// 8. At the break Сазон pulls the hat off your head and throws it into a puddle. Everybody laughs.
const PUDDLE = {x: -260, z: -300};
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		const grab = interpolate(t, [30, 42], [0, 1], clamp);
		const thrown = t >= 56;
		const fly = lerp(t, 56, 80, 0, 1);
		const hx = lerp(fly, 0, 1, 160, PUDDLE.x);
		const hy = lerp(fly, 0, 1, -600, -40) - Math.sin(fly * Math.PI) * 260;
		const hz = lerp(fly, 0, 1, -760, PUDDLE.z);
		const cam: Cam3 = {x: lerp(t, 40, 80, 170, 30), y: -450, z: lerp(t, 0, 80, 800, 900)};
		return (
			<AbsoluteFill>
				<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={t} />} farBlur={6}>
					<SchoolYardNear id="r1s6" fence={false} />
					<Puddle x={PUDDLE.x} z={PUDDLE.z} />
					{[
						[-560, -1200, 0],
						[640, -1300, 1],
						[860, -900, 2],
					].map(([x, z, k]) => (
						<Figure3D key={k} x={x} z={z} p={kid(`r1s6k${k}`, k + 3, {breathe: t + k * 9, face: thrown ? LAUGH(t, k) : undefined})} />
					))}
					<Figure3D x={300} z={-700} p={igor('r1s6you', {breathe: t, knit: grab < 0.6 ? HAT : undefined, face: grab > 0.5 ? SCARED : WARY, headTilt: grab * -6})} />
					<Figure3D
						x={40}
						z={-760}
						p={sazon('r1s6saz', {
							breathe: t,
							face: {...SAZ_FACE, look: [0.7, -0.2]},
							armR: thrown ? {target: [lerp(fly, 0, 0.3, 300, -200), -760], bend: 1} : {target: [lerp(grab, 0, 1, 120, 470), lerp(grab, 0, 1, -500, -900)], bend: -1},
							itemR: grab >= 0.6 && !thrown ? (
								<g transform="translate(0,60) scale(0.9)">
									<HatArt color={HAT} />
								</g>
							) : undefined,
						})}
					/>
					{thrown && fly < 1 && (
						<Card3D x={hx} y={hy} z={hz} w={200} h={200} anchor="center" view={[-200, -200, 400, 400]}>
							<g transform={`rotate(${fly * 540})`}>
								<HatArt color={HAT} />
							</g>
						</Card3D>
					)}
				</Scene3D>
			</AbsoluteFill>
		);
	}
	// low by the puddle: the hat lands with a splash, everybody laughs
	const land = 6;
	const fall = lerp(t, 0, land, 0, 1, Easing.in(Easing.quad));
	const cam: Cam3 = {x: PUDDLE.x + 40, y: -170, z: lerp(t, 0, 49, 720, 800), rx: -5};
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={t} />} farBlur={7}>
				<SchoolYardNear id="r1s6b" fence={false} />
				<Puddle x={PUDDLE.x} z={PUDDLE.z} splash={t - land} />
				{t >= land && (
					<Floor3D y={-2} zNear={PUDDLE.z + 90} depth={180} w={220} x={PUDDLE.x + 40} res={1}>
						<g transform="translate(110,90) scale(0.55,0.42)">
							<HatArt color={HAT} soaked={lerp(t, land, land + 30, 0.2, 1)} />
						</g>
					</Floor3D>
				)}
				{t < land && (
					<Card3D x={PUDDLE.x + 40} y={lerp(fall, 0, 1, -420, -10)} z={PUDDLE.z} w={200} h={200} anchor="center" view={[-200, -200, 400, 400]}>
						<g transform={`rotate(${120 + fall * 80})`}>
							<HatArt color={HAT} />
						</g>
					</Card3D>
				)}
				{t >= land && t < land + 20 && (
					<Card3D x={PUDDLE.x + 40} y={-60} z={PUDDLE.z} w={500} h={300} anchor="center" view={[-250, -150, 500, 300]}>
						{Array.from({length: 9}).map((_, k) => {
							const a = (k / 9) * Math.PI;
							const tt = (t - land) / 20;
							return <circle key={k} cx={Math.cos(a) * 200 * tt} cy={-Math.sin(a) * 160 * tt + 200 * tt * tt} r={10 * (1 - tt) + 2} fill="#cfe0ec" />;
						})}
					</Card3D>
				)}
				{[
					[-760, -1100, 0],
					[60, -1300, 1],
					[420, -1050, 2],
					[-1100, -1500, 3],
				].map(([x, z, k]) => (
					<Figure3D key={k} x={x} z={z} p={k === 1 ? sazon('r1s6bsaz', {breathe: t, face: LAUGH(t, 0)}) : kid(`r1s6bk${k}`, k + 4, {breathe: t + k * 7, face: LAUGH(t, k)})} />
				))}
			</Scene3D>
			<Ha x={300} y={560} at={80 + 12} rot={-12} />
			<Ha x={760} y={500} at={80 + 20} rot={10} size={78} />
			<Ha x={500} y={360} at={80 + 28} rot={-4} />
			<Ha x={820} y={700} at={80 + 36} rot={14} />
		</AbsoluteFill>
	);
};

// 9. After school he catches you in the cloakroom: «Гони двадцать копеек, Игоречек»
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 120, 60, 160), y: -430, z: interpolate(f, [0, 50, 120], [260, 720, 800], {...clamp, easing: Easing.out(Easing.quad)})};
	const s = project(cam, 110, -520, -800);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#2a2a28" far={<CloakroomBack />} farBlur={0}>
				<Cloakroom3D id="r1s7" />
				<Figure3D x={320} z={-900} p={igor('r1s7you', {breathe: f, face: SCARED, armL: {target: [-120, -380], bend: 1}, armR: {target: [130, -380], bend: -1}})} />
				<Figure3D x={-160} z={-760} p={sazFriend('r1s7f', 0, {back: true, breathe: f + 6})} />
				<Figure3D x={110} z={-800} p={sazon('r1s7saz', {back: true, breathe: f, armR: {target: [360, -560], bend: -1}})} />
			</Scene3D>
			{vignette(0.45)}
			<Bubble x={Math.min(640, Math.max(400, s.x - 40))} y={s.y - 50} text="ГОНИ 20 КОПЕЕК!" from={68} to={123} tail="left" dark />
		</AbsoluteFill>
	);
};

// 10. You give it. You always give. But Сазон hits you anyway: «Это — чтобы завтра не забыл»
const CLOAK_FAR = (
	<>
		<CloakroomBack />
		<Cloakroom3D id="r1cuf" />
	</>
);
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [90]);
	if (i === 0) {
		const take = lerp(t, 26, 40, 0, 1, Easing.in(Easing.cubic));
		return (
			<CloseUp cam={{x: lerp(t, 0, 90, 100, 30), y: -180, z: 800, rx: 6}} f={t} far={CLOAK_FAR} bg="#2a2a28" blur={9}>
				<Card3D x={60} y={-300} z={-120} w={800} h={1200} anchor="center" view={[-400, -600, 800, 1200]}>
					<Palm s={0.95}>
						<Coin x={0} y={take * -900} s={0.9} rot={take * 40} />
					</Palm>
					<g transform={`translate(${lerp(t, 0, 26, -700, -120) + take * 40},${lerp(t, 0, 26, -700, -260) - take * 900}) rotate(-150)`}>
						<rect x={-70} y={-520} width={140} height={420} rx={30} fill={SAZON.top} />
						<ellipse cx={0} cy={-60} rx={88} ry={110} fill="#e8b48e" />
					</g>
				</Card3D>
			</CloseUp>
		);
	}
	const at = 20; // the punch (≈ «бьёт»)
	const k = interpolate(t, [at, at + 4, at + 40], [0, 1, 0.55], clamp);
	const shake = t >= at ? Math.sin((t - at) * 2.3) * 30 * Math.exp(-(t - at) / 9) : 0;
	const fist = interpolate(t, [at - 7, at, at + 8, at + 22], [-1100, -170, -260, -1100], clamp);
	const bruise = interpolate(t, [at + 4, at + 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 120 + shake, y: -400 + shake * 0.3, z: lerp(t, 0, 90, 640, 720)}} f={t} far={CLOAK_FAR} bg="#2a2a28" blur={9}>
				<Card3D x={130 + 170 * k} y={-430} z={-220} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<g transform={`rotate(${16 * k})`}>
						<Bust kind="boy" id="r1s8you" x={0} y={0} scale={1.4} colors={IGOR} face={t < at ? {...SCARED, look: [-0.7, 0]} : {eyes: 'closed', mouth: 'o', brows: 'worried', blush: false, bruise}} />
					</g>
				</Card3D>
				<Card3D x={130} y={-400} z={-120} w={1600} h={600} anchor="center" view={[-800, -300, 1600, 600]}>
					<g transform={`translate(${fist},0)`}>
						<Fist sleeve={SAZON.top ?? '#3b4660'} />
					</g>
				</Card3D>
			</CloseUp>
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(t, [at, at + 1, at + 6], [0, 0.7, 0], clamp)}} />
			{vignette(0.55)}
			<Bubble x={430} y={640} text="ЧТОБЫ ЗАВТРА НЕ ЗАБЫЛ!" from={124} to={180} tail="left" dark />
		</AbsoluteFill>
	);
};

// 11. In the evening mom notices the bruise: «Игоречек, кто тебя?» — «Упал».
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const push = lerp(f, 100, 150, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(push, 0, 1, 50, 170), y: lerp(push, 0, 1, -430, -400), z: lerp(push, 0, 1, 840, 1080)};
	const touch = interpolate(f, [14, 26], [0, 1], clamp);
	const m = project(cam, -60, -470, -760);
	const y = project(cam, 170, -470, -640);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#1a1520" far={<KitchenBack id="r1s9" f={f} />} farBlur={0}>
				<Kitchen3D id="r1s9" />
				<Figure3D
					x={-60}
					z={-760}
					p={{kind: 'mom', id: 'r1s9mom', scale: 0.48, breathe: f, face: {eyes: 'wide', pupil: 0.7, mouth: f > 58 && f < 100 ? (Math.floor(f / 5) % 2 ? 'open' : 'o') : 'o', brows: 'worried', look: [0.8, 0]}, armR: touch > 0 ? {target: [lerp(touch, 0, 1, 200, 420), lerp(touch, 0, 1, -380, -790)], bend: 1} : undefined}}
				/>
				<Figure3D x={170} z={-640} p={igor('r1s9you', {breathe: f, face: {eyes: 'open', mouth: f > 142 && f < 156 ? 'o' : 'flat', brows: 'worried', look: [-0.3, 0.8], blush: false, bruise: 1}})} />
			</Scene3D>
			{vignette(0.5)}
			<Bubble x={Math.max(330, m.x + 40)} y={m.y - 60} text="ИГОРЕЧЕК, КТО ТЕБЯ?" from={58} to={118} tail="left" />
			<Bubble x={Math.min(760, y.x + 60)} y={y.y - 70} text="УПАЛ." from={140} to={163} tail="right" />
		</AbsoluteFill>
	);
};

// 12. But in your district, by the plant «Теплоконтроль», there are those whom even Сазон fears. Тяп-ляп.
// (silhouettes walking at you at dusk)
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: 1200, y: -170, z: lerp(f, 0, 172, 1300, 1150), rx: 5};
	const slam = 148;
	const tp = pop(f, slam, 8);
	const sh = f >= slam ? Math.sin((f - slam) * 2) * 14 * Math.exp(-(f - slam) / 8) : 0;
	return (
		<AbsoluteFill>
			<Scene3D cam={{...cam, x: cam.x + sh}} bg={skyBg('dusk')} far={<YardFar f={f} time="dusk" />} farBlur={4}>
				<YardNear id="r1s10" time="dusk" />
				{[-460, -230, 0, 230, 460].map((dx, k) => (
					<Figure3D
						key={k}
						x={1200 + dx}
						z={lerp(f, 0, 172, -1600, -820) - Math.abs(dx) * 0.4}
						p={k === 2 ? gvozd('r1s10gv', {walk: f * 0.38, silhouette: '#15131c'}) : gang(`r1s10g${k}`, k, {walk: f * 0.38 + k, silhouette: '#15131c'})}
					/>
				))}
			</Scene3D>
			{vignette(0.55)}
			{f >= slam && (
				<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${tp * (1 + 0.04 * Math.sin((f - slam) / 4))}) rotate(-4deg)`, fontFamily: HEAVY, fontWeight: 900}}>
					<div style={{fontSize: 190, lineHeight: 1, color: '#e0342b', textShadow: '0 0 0 #000, 6px 6px 0 #fff, -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff, 0 16px 30px rgba(0,0,0,0.6)'}}>ТЯП-ЛЯП</div>
				</div>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [slam, slam + 1, slam + 6], [0, 0.5, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 13. They walk across the yard in caps and quilted jackets; even the seniors step aside; Сазон looks at the ground
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [112]);
	if (i === 0) {
		const gx = lerp(t, 0, 112, -700, 760);
		const cam: Cam3 = {x: gx - 260, y: -470, z: 900, ry: -2};
		const aside = interpolate(gx, [100, 500], [0, 1], clamp);
		return (
			<Scene3D cam={cam} bg={skyBg('dusk')} far={<YardFar f={t} time="dusk" />} farBlur={6}>
				<YardNear id="r1s11" time="dusk" garages={false} />
				{[
					[260, -900, 0],
					[470, -1000, 1],
					[660, -880, 2],
				].map(([x, z, k]) => (
					<Figure3D key={k} x={x + aside * 300} z={z - aside * 420} p={sazFriend(`r1s11s${k}`, k, {breathe: t + k * 7, walk: aside > 0.05 && aside < 0.95 ? t * 0.5 + k : undefined, headTurn: -0.6, face: {eyes: 'open', mouth: 'flat', brows: 'worried', look: [-0.4, 0.8], blush: false, glasses: false}, colors: {...SAZ_FR[k % 2], top: ['#4a4038', '#38424e', '#4e4a40'][k]}})} />
				))}
				{[0, 1, 2, 3, 4].map((k) => (
					<Figure3D key={`g${k}`} x={gx - k * 280} z={-760 - (k % 2) * 140} p={k === 1 ? gvozd('r1s11gv', {walk: t * 0.42 + k}) : gang(`r1s11g${k}`, k, {walk: t * 0.42 + k})} />
				))}
			</Scene3D>
		);
	}
	// Сазон close: eyes on the ground while they pass in front of him
	const pass = lerp(t, 0, 53, -900, 1000);
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 1700, y: -470, z: lerp(t, 0, 53, 640, 720)}} f={t} time="dusk" blur={9}>
				<Card3D x={1700} y={-470} z={-260} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="teen" id="r1s11saz" x={0} y={0} scale={1.4} colors={SAZON} plain face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [0, 1], blush: false, glasses: false}} tilt={-6} />
				</Card3D>
				<Card3D x={1700 + pass} y={-300} z={160} w={700} h={1400} anchor="center" view={[-350, -700, 700, 1400]} blur={10}>
					<path d="M -260,-420 Q -260,-560 -120,-560 L 120,-560 Q 260,-560 260,-420 L 300,700 L -300,700 Z" fill="#1d1c20" />
					{Array.from({length: 6}).map((_, k) => (
						<rect key={k} x={-280} y={-380 + k * 150} width={560} height={10} fill="#111" />
					))}
				</Card3D>
			</CloseUp>
			{vignette(0.5)}
		</AbsoluteFill>
	);
};

// 14. Among them is Гвоздь. He lives in your entrance.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: lerp(f, 0, 99, 1040, 1100), y: -560, z: lerp(f, 0, 99, 560, 680), ry: lerp(f, 0, 99, 6, -4)}} f={f} time="dusk" blur={8}>
				<Card3D x={1000} y={-560} z={-300} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<GvozdHead id="r1s12gv" t={f} s={1.9} />
				</Card3D>
			</CloseUp>
			{f >= 16 && <NameTag x={540} y={420} title="ГВОЗДЬ" sub="ЖИВЁТ В ТВОЁМ ПОДЪЕЗДЕ" at={16} color={YELLOW} />}
		</AbsoluteFill>
	);
};

// a rubber stamp slammed onto the screen
export const Stamp: React.FC<{text: string; at: number; y?: number}> = ({text, at, y = 470}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const k = interpolate(f, [at, at + 6], [1.7, 1], {...clamp, easing: Easing.in(Easing.quad)});
	return (
		<div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) rotate(-8deg) scale(${k})`, opacity: interpolate(f, [at, at + 3], [0, 1], clamp)}}>
			<div style={{border: '12px solid #e0342b', borderRadius: 22, padding: '14px 40px', fontFamily: HEAVY, fontWeight: 900, fontSize: 92, lineHeight: 1.02, color: '#e0342b', textAlign: 'center', background: 'rgba(12,10,12,0.55)', letterSpacing: 2, whiteSpace: 'pre'}}>{text}</div>
		</div>
	);
};

// 15. «Ты знаешь, где они собираются: в подвальной качалке за гаражами.» — from behind a garage corner you watch
// two of them go to the iron door; light and the clank of iron behind it
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 120, 1380, 1460), y: -470, z: lerp(f, 0, 120, 380, 520)};
	const d = project(cam, 1700, -1250, -1300);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('dusk')} far={<KachalkaFar f={f} />} farBlur={0}>
				<KachalkaGround id="r1s15g" time="dusk" />
				{[0, 1].map((k) => (
					<Figure3D key={k} x={lerp(f, 0, 110, 1450 + k * 260, 1640 + k * 140)} z={lerp(f, 0, 110, -650 - k * 60, -1120)} p={gang(`r1s15g${k}`, k + 1, {back: true, walk: f * 0.42 + k})} />
				))}
				<Figure3D x={1170} z={-430} p={igor('r1s15you', {back: true, breathe: f})} />
				<Card3D x={900} y={0} z={-360} w={500} h={1000}>
					<rect width={500} height={1000} fill="#4a4f5a" />
					<rect width={500} height={60} fill="#3a3f48" />
					<rect x={440} y={60} width={60} height={940} fill="#3c414a" />
					<rect x={60} y={120} width={340} height={880} fill="#5d5f52" />
				</Card3D>
			</Scene3D>
			{vignette(0.55)}
			{f >= 70 && <NameTag x={Math.min(760, Math.max(360, d.x))} y={Math.max(330, d.y - 60)} title="КАЧАЛКА" sub="ПОДВАЛ ЗА ГАРАЖАМИ" at={70} color={RED} />}
		</AbsoluteFill>
	);
};

// 16. «И ты решаешь: хватит быть Игоречком. Ты пойдёшь к ним сам.» — fear turns into resolve; «ТЕРПЕНИЕ ЛОПНУЛО»
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const stamp = 34;
	const sh = f >= stamp ? Math.sin((f - stamp) * 2) * 12 * Math.exp(-(f - stamp) / 8) : 0;
	const hard = f >= 30;
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 1700 + sh, y: -470, z: lerp(f, 0, 120, 640, 800)}} f={f} time="dusk" blur={9}>
				<Card3D x={1700} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r1s16you" x={0} y={0} scale={1.4} colors={IGOR} face={hard ? {eyes: 'narrow', mouth: 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 1} : {...SCARED, look: [0.5, 0], bruise: 1}} />
				</Card3D>
			</CloseUp>
			{vignette(0.55)}
			<Stamp text={'ТЕРПЕНИЕ\nЛОПНУЛО'} at={stamp} y={440} />
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [stamp, stamp + 1, stamp + 6], [0, 0.4, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 17. «Только пацаны во дворе говорят: у Тяп-ляп назад дороги нет. Зашёл — значит, навсегда.» — two seniors whisper
// by the bench at dusk; the rule comes up as a plaque
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 150, -1420, -1360), y: -470, z: lerp(f, 0, 150, 760, 940)};
	const talk = (k: number) => (Math.floor((f + k * 7) / 5) % 2 && f % 60 < 40 ? 'open' : 'flat') as Face['mouth'];
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('dusk')} far={<YardFar f={f} time="dusk" />} farBlur={6}>
				<YardNear id="r1s17" time="dusk" garages={false} />
				<Figure3D x={-1620} z={-760} p={sazFriend('r1s17a', 0, {breathe: f, headTurn: 0.6, face: {eyes: 'narrow', mouth: talk(0), brows: 'worried', look: [0.7, 0], blush: false, glasses: false}, colors: {...SAZ_FR[0], top: '#4a4038'}})} />
				<Figure3D x={-1240} z={-800} p={sazFriend('r1s17b', 1, {breathe: f + 9, headTurn: -0.6, face: {eyes: 'wide', pupil: 0.7, mouth: talk(1), brows: 'worried', look: [-0.7, 0], blush: false, glasses: false}, colors: {...SAZ_FR[1], top: '#38424e'}})} />
			</Scene3D>
			{vignette(0.55)}
			<RulePlaque label="У ТЯП-ЛЯП" title={'ЗАШЁЛ —\nЗНАЧИТ, НАВСЕГДА'} from={108} to={168} y={420} />
		</AbsoluteFill>
	);
};

// 18. At night you can't sleep. Through the wall mom whispers: «Спи, Игоречек…»
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 123, -40, 70), y: -420, z: lerp(f, 0, 123, 640, 860)};
	const d = project(cam, -500, -460, -1200);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#0b0f1e" far={<BedroomBack f={f} />} farBlur={0}>
				<Bedroom3D id="r1s17" />
				{/* the pillow, you (sitting up), the bed with the blanket in a cover with the diamond opening */}
				<Card3D x={120} y={-170} z={-930} w={420} h={170}>
					<rect x={0} y={0} width={420} height={170} rx={60} fill="#e6e8ee" />
				</Card3D>
				<Card3D x={120} y={-470} z={-880} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r1s18you" x={0} y={0} scale={1.0} colors={IGOR_PJ} face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [-0.8, -0.1], blush: false, bruise: 0.9}} />
				</Card3D>
				<Card3D x={20} y={0} z={-820} w={1100} h={300}>
					<rect x={0} y={150} width={1100} height={150} fill="#5a4030" />
					<path d="M 0,40 Q 550,0 1100,40 L 1100,220 L 0,220 Z" fill="#e8ecf2" />
					<path d="M 550,60 L 700,130 L 550,200 L 400,130 Z" fill="#7a8ab0" />
					<path d="M 0,40 Q 550,0 1100,40 L 1100,60 Q 550,22 0,60 Z" fill="#000" opacity={0.08} />
					<rect x={0} y={0} width={40} height={300} fill="#4a3424" />
					<rect x={1060} y={60} width={40} height={240} fill="#4a3424" />
				</Card3D>
			</Scene3D>
			<AbsoluteFill style={{background: 'linear-gradient(200deg, rgba(120,150,255,0.18), rgba(0,0,30,0.25))'}} />
			{vignette(0.6)}
			<Bubble x={Math.max(330, d.x + 120)} y={d.y - 60} text="СПИ, ИГОРЕЧЕК…" from={84} to={124} tail="left" whisper />
		</AbsoluteFill>
	);
};

// 19. And in the morning Сазон will be waiting at the school again (tossing a coin)
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 105, -420, -360), y: -480, z: lerp(f, 0, 105, 1050, 1300)};
	const toss = Math.abs(Math.sin(f / 9));
	const c = project(cam, -300, -560 - toss * 220, -1100);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={f} />} farBlur={6}>
				<SchoolYardNear id="r1s18" />
				<Figure3D x={-380} z={-1100} p={sazon('r1s18saz', {breathe: f, face: {...SAZ_FACE, look: [0.1, 0]}, armR: {target: [190, -620], bend: 1}})} />
			</Scene3D>
			<div style={{position: 'absolute', left: c.x, top: c.y, width: 70, height: 70, marginLeft: -35, marginTop: -35, transform: `scaleX(${Math.cos(f / 2.2)})`}}>
				<svg width={70} height={70} viewBox="-100 -100 200 200">
					<Coin x={0} y={0} s={1} />
				</svg>
			</div>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(235,240,245,0.35), rgba(235,240,245,0.05) 60%)'}} />
			{vignette(0.45)}
		</AbsoluteFill>
	);
};

// 20. «В семь вечера ты стоишь у двери их качалки.» — you walk up to the iron door; light and the clank of iron inside
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: 1700, y: -470, z: lerp(f, 0, 102, 420, 760)};
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
				<KachalkaGround id="r1s21g" />
				<Figure3D x={lerp(f, 0, 70, 1620, 1680)} z={lerp(f, 0, 70, -560, -980)} p={igor('r1s21you', {back: true, walk: f < 70 ? f * 0.42 : undefined, breathe: f})} />
			</Scene3D>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 21. «Шаг за эту дверь — и назад дороги нет.» — your hand stops short of the handle; your heart pounds
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const reach = lerp(f, 8, 50, 0, 1, Easing.out(Easing.cubic));
	const shake = Math.sin(f * 0.9) * 4 * interpolate(f, [50, 60], [0, 1], clamp);
	const cam: Cam3 = {x: lerp(f, 0, 90, 1640, 1690), y: -450, z: lerp(f, 0, 90, 1080, 1160)};
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
				<KachalkaGround id="r1s22g" />
				<Card3D x={1700} y={-330} z={-1160} w={900} h={700} anchor="center" view={[-450, -350, 900, 700]}>
					<g transform={`translate(${lerp(reach, 0, 1, -760, -300) + shake},${lerp(reach, 0, 1, 360, 60)}) rotate(-20)`}>
						<rect x={-560} y={-60} width={520} height={120} rx={44} fill={IGOR.top} />
						<rect x={-60} y={-64} width={40} height={128} rx={12} fill="#e9e4d8" />
						<ellipse cx={30} cy={0} rx={80} ry={64} fill="#f6cba8" />
						{[-36, -12, 12, 36].map((y) => (
							<rect key={y} x={70} y={y - 11} width={60} height={22} rx={11} fill="#f6cba8" />
						))}
					</g>
				</Card3D>
			</Scene3D>
			{vignette(0.65)}
			<AbsoluteFill style={{background: '#300', opacity: 0.12 * (0.5 + 0.5 * Math.sin(f / 4))}} />
		</AbsoluteFill>
	);
};

// 22. Finale (as in the other series): «Пришиться — и больше никогда не бояться? Или не пришиться — и остаться
// Игоречком?» — the two choice cards over the darkened door of the качалка, 3-2-1, «пиши 1 или 2», next episode.
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="СЕРИЯ 2"
			series="ТЫ С КАКОГО РАЙОНА?"
			boxes={4}
			boxLabel="ТЕРПЕНИЕ"
			boxMark="cross"
			opt1={{text: 'ПРИШИТЬСЯ', sub: 'и больше не бояться'}}
			opt2={{text: 'НЕ ПРИШИТЬСЯ', sub: 'и остаться Игоречком'}}
			note="По мотивам истории группировки «Тяп-ляп» (Казань, 1970-е). Герои и события сериала вымышлены."
			tallyLine={
				<>
					ОБИД: <span style={{color: '#ff6a5f'}}>3</span> · ДАЛЬШЕ — <span style={{color: YELLOW}}>ВЫБИРАЕШЬ ТЫ</span>
				</>
			}
			bg={
				<AbsoluteFill>
					<Scene3D cam={{x: 1700, y: -420, z: lerp(f, 0, 300, 900, 980)}} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
						<KachalkaGround id="r1s23g" />
					</Scene3D>
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
				</AbsoluteFill>
			}
		/>
	);
};
