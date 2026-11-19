// «Ты с какого района?» — серия 2 «Прописка» (1976). Зрители выбрали «пришиться». Ты стучишь в дверь качалки, Гвоздь
// открывает, внутри — подвальная качалка и Сивый, старший у Тяп-ляп: «Один удар от меня. Устоишь — пришился».
// Удар, звон в ушах, шаг назад — и ты стоишь. «Устоял. Теперь ты наш. Здесь ты — Лавр». Первое понятие: «своих не
// сдают». Дома мама: «Опять упал?» — а ты улыбаешься. Утром Сазон: «Докажи». Выбор: позвать пацанов / ударить самому.
// Кадры 2–3 — реальная история: Казань, завод «Теплоконтроль», Антип и его подвальный спортзал (по источникам; самого
// Антипа не рисуем — бьёт Игоря вымышленный Сивый). 22 shots on the timeline of src/r2/timeline.ts (= the voice, see scripts/fit-voiceover.py --part r2).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {Bust, Colors, Face} from '../components/Person';
import {Cam3, Card3D, project, Scene3D} from '../components/Scene3D';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import {FenceArt, Figure3D, Ground3D, skyBg} from '../r1/world3d';
import {KachalkaFar, KachalkaGround, KachalkaInside3D, KachalkaInsideBack} from '../r1/sets3d';
import {CloseUp, GANG, GANG_CAP, Lamp3D, LightPool, RealStory, GV_FACE, GVOZD, GvozdHead, IGOR, Kitchen3D, KitchenBack, LAUGH, P, RulePlaque, SAZ_FACE, SAZON, SchoolYardFar, SchoolYardNear, gang, gvozd, igor, sazFriend, sazon, vignette} from '../r1/scenes';
import {SHOTS} from './timeline';

const {YELLOW, RED} = G1;
const MONO_FONT = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const {Finale} = G2;

// ============================================================ Сивый, the eldest of Тяп-ляп ======
// grey at twenty («сивый»), a scar through the brow, a striped тельняшка under a dark jacket
const SIVY: Colors = {top: '#2a2d33', topDark: '#1e2026', pants: '#2b2d33', shoes: '#111216', hair: '#c4c4bb', skin: '#e3b08a'};
const SIVY_FACE: Face = {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [0, 0.1], blush: false};
const sivy = (id: string, extra: Partial<P> = {}): P => ({kind: 'dad', id, scale: 0.5, plain: true, colors: SIVY, face: SIVY_FACE, ...extra});
// his head and shoulders (art centred on the head): the тельняшка in the collar, the scar
const SivyHead: React.FC<{id: string; s: number; face?: Face; tilt?: number}> = ({id, s, face, tilt = 0}) => (
	<g>
		<Bust kind="dad" id={id} x={0} y={0} scale={s} tilt={tilt} colors={SIVY} face={face ?? SIVY_FACE} />
		<g transform={`scale(${s})`}>
			<defs>
				<clipPath id={`${id}tv`}>
					<path d="M -62,122 L 0,250 L 62,122 Z" />
				</clipPath>
			</defs>
			<path d="M -62,122 L 0,250 L 62,122 Z" fill="#eef0f4" />
			<g clipPath={`url(#${id}tv)`}>
				{[134, 156, 178, 200, 222, 244].map((y) => (
					<rect key={y} x={-70} y={y} width={140} height={10} fill="#22305a" />
				))}
			</g>
			<path d="M -28,122 L 0,170 L 28,122 Z" fill={SIVY.skin} />
		</g>
		<g transform={`scale(${s}) rotate(${tilt})`}>
			<path d="M -54,-44 L -26,-2" stroke="#c98a76" strokeWidth={5} strokeLinecap="round" />
			{[-46, -38, -30].map((x, k) => (
				<path key={k} d={`M ${x - 5},${-30 + k * 12} l 10,-6`} stroke="#c98a76" strokeWidth={3} />
			))}
		</g>
	</g>
);

// a fist seen from the front, knuckles at the camera (art 360 × 360, centred)
const FistFront: React.FC<{sleeve?: string}> = ({sleeve = SIVY.top}) => (
	<g>
		<rect x={-110} y={90} width={220} height={260} rx={40} fill={sleeve} />
		<rect x={-128} y={-80} width={256} height={190} rx={64} fill="#e3b08a" />
		{[-84, -28, 28, 84].map((x) => (
			<g key={x}>
				<ellipse cx={x} cy={-74} rx={34} ry={30} fill="#eec09c" />
				<ellipse cx={x} cy={-66} rx={20} ry={10} fill="#d9a07a" opacity={0.7} />
			</g>
		))}
		{[-56, 0, 56].map((x) => (
			<line key={x} x1={x} y1={-40} x2={x} y2={40} stroke="#c98a6a" strokeWidth={6} opacity={0.6} />
		))}
		<rect x={-120} y={20} width={190} height={60} rx={30} fill="#d9a07a" />
	</g>
);
// your fist from behind, knocking (art centred on the knuckles)
const KnockFist: React.FC = () => (
	<g>
		<rect x={-80} y={60} width={160} height={460} rx={44} fill={IGOR.top} />
		<rect x={-84} y={40} width={168} height={40} rx={12} fill="#e9e4d8" />
		<rect x={-96} y={-90} width={192} height={150} rx={60} fill="#f6cba8" />
		{[-60, -20, 20, 60].map((x) => (
			<ellipse key={x} cx={x} cy={-86} rx={22} ry={18} fill="#e8b48e" />
		))}
	</g>
);
// two hands clasped in a handshake (yours from the left, theirs from the right; art 1300 × 800, centred)
const Handshake: React.FC<{sleeve: string; t: number}> = ({sleeve, t}) => {
	const grip = lerp(t, 2, 14, 0, 1, Easing.out(Easing.cubic));
	const sh = Math.sin(t / 3) * 10 * interpolate(t, [14, 18, 34, 42], [0, 1, 1, 0], clamp);
	return (
		<g transform={`translate(0,${sh})`}>
			<g transform={`translate(${lerp(grip, 0, 1, -900, -640)},60) rotate(-12)`}>
				<rect x={0} y={-70} width={560} height={140} rx={50} fill={IGOR.top} />
				<rect x={520} y={-74} width={50} height={148} rx={14} fill="#e9e4d8" />
			</g>
			<g transform={`translate(${lerp(grip, 0, 1, 900, 650)},10) rotate(12)`}>
				<rect x={-600} y={-80} width={600} height={160} rx={50} fill={sleeve} />
			</g>
			<g opacity={grip}>
				<ellipse cx={20} cy={-10} rx={130} ry={96} fill="#e3b08a" />
				<ellipse cx={-20} cy={30} rx={110} ry={84} fill="#f6cba8" />
				<path d="M -70,-20 Q -20,-60 50,-30" stroke="#c99a76" strokeWidth={10} fill="none" />
			</g>
		</g>
	);
};

// inside the качалка: the back wall in its own pass, the room in the near pass
const GYM_FAR = (f: number) => <KachalkaInsideBack f={f} />;
const GymCU: React.FC<{cam: Cam3; f: number; children: React.ReactNode; blur?: number}> = ({cam, f, children, blur = 8}) => (
	<CloseUp
		cam={cam}
		f={f}
		bg="#141210"
		blur={blur}
		far={
			<>
				<KachalkaInsideBack f={f} />
				<KachalkaInside3D id="r2cu" />
			</>
		}
	>
		{children}
	</CloseUp>
);
// the guys of Тяп-ляп in the gym
const GUYS: [number, number, number, boolean][] = [
	[-420, -980, 0, true],
	[460, -900, 1, false],
	[-150, -1300, 2, true],
	[220, -1220, 3, false],
	[-600, -1250, 1, false],
	[600, -1300, 2, true],
];
const guy = (id: string, k: number, cap: boolean, extra: Partial<P> = {}): P => gang(id, k, {cap: cap ? GANG_CAP[k % 4] : undefined, ...extra});
// the ring around you and Сивый
const RING: [number, number, number][] = [
	[-560, -820, 0],
	[560, -820, 1],
	[-470, -1200, 2],
	[470, -1200, 3],
	[-250, -1380, 1],
	[250, -1380, 0],
];
// the ring's mood: 'flat' (watching), 'laugh' (you fell), 'shock' (you got up); `point` 0…1 — Сивый points at the door
type Mood = 'flat' | 'laugh' | 'shock';
const ringFace = (mood: Mood, f: number, i: number, x: number): Face =>
	mood === 'laugh'
		? LAUGH(f, i)
		: mood === 'shock'
			? {eyes: 'wide', pupil: 0.7, mouth: 'flat', brows: 'raised', look: [x > 0 ? -0.6 : 0.6, 0.3], blush: false}
			: {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [x > 0 ? -0.6 : 0.6, 0.1], blush: false};
const GymRing: React.FC<{cam: Cam3; f: number; you?: boolean; youFace?: Face; youBack?: boolean; sway?: number; mood?: Mood; point?: number; sivyFace?: Face}> = ({cam, f, you = true, youFace, youBack = true, sway = 0, mood = 'flat', point = 0, sivyFace}) => (
	<Scene3D cam={cam} bg="#141210" far={GYM_FAR(f)} farBlur={0}>
		<KachalkaInside3D id="r2ring" />
		{RING.map(([x, z, k], i) => (
			<Figure3D key={i} x={x} z={z} p={guy(`r2rg${i}`, k, i % 2 === 0, {breathe: f + i * 7, face: ringFace(mood, f, i, x)})} />
		))}
		<Figure3D x={40} z={-1080} p={gvozd('r2rgv', {breathe: f, face: mood === 'laugh' ? {...GV_FACE, mouth: 'grin', look: [-0.3, 0.3]} : mood === 'shock' ? {...GV_FACE, eyes: 'open', brows: 'raised', mouth: 'flat', look: [-0.3, 0.3]} : {...GV_FACE, mouth: 'flat', look: [-0.3, 0.1]}})} />
		<Figure3D x={-60} z={-1000} p={sivy('r2rsv', {breathe: f, face: sivyFace, armL: point > 0 ? {target: [lerp(point, 0, 1, -60, -330), lerp(point, 0, 1, -200, -480)], bend: 1} : undefined})} />
		{you && <Figure3D x={20} z={-720} p={igor('r2ryou', {back: youBack, breathe: f, headTilt: sway, face: youFace})} />}
	</Scene3D>
);

// ============================================================== SHOTS =======
// 1. THE HOOK: the fist in slow motion — «Один удар. Упадёшь — ты никто. Устоишь — ты свой.» — then rewind
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const D = SHOTS[0].duration;
	const slow = lerp(f, 0, D - 20, 0, 1, Easing.inOut(Easing.quad));
	const rw = interpolate(f, [D - 16, D], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: rw > 0 ? `blur(${rw * 6}px) saturate(${1 - rw})` : undefined, transform: `skewX(${rw * -10}deg) scale(${1 + rw * 0.08})`}}>
				<GymCU cam={{x: 0, y: -540, z: lerp(slow, 0, 1, 520, 640)}} f={f}>
					<Card3D x={0} y={-600} z={-460} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
						<SivyHead id="r2s1sv" s={1.5} face={{eyes: 'narrow', mouth: 'flat', brows: 'angry', look: [0, 0], blush: false}} />
					</Card3D>
					<Card3D x={60} y={-470} z={lerp(slow, 0, 1, -380, 260)} w={360} h={360} anchor="center" view={[-180, -180, 360, 360]}>
						<g transform="scale(0.5)">
							<FistFront />
						</g>
					</Card3D>
				</GymCU>
				{vignette(0.7)}
			</AbsoluteFill>
			<div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 120, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.5)', transform: `scale(${pop(f, 6, 9)})`, opacity: interpolate(f, [D - 24, D - 16], [1, 0], clamp)}}>
				ОДИН <span style={{color: RED}}>УДАР</span>
			</div>
			{rw > 0 &&
				Array.from({length: 9}).map((_, k) => (
					<div key={k} style={{position: 'absolute', left: 0, right: 0, top: (k * 233 + f * 61) % 1920, height: 10 + (k % 3) * 8, background: '#fff', opacity: 0.35 * rw}} />
				))}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [D - 8, D], [0, 0.8], clamp)}} />
		</AbsoluteFill>
	);
};

// ============================================================ history (real): «Теплоконтроль», Антип ======
// the plant «Теплоконтроль» at night: the long three-storey block with ribbon windows (the night shift is on), the taller
// office block with the rooftop letters, the chimney (art 9000 × 6000, ground at the bottom). `lit` 0…13 = letters lit.
const rnd = (k: number) => {
	const x = Math.sin(k * 12.9898) * 43758.5453;
	return x - Math.floor(x);
};
const SIGN = 'ТЕПЛОКОНТРОЛЬ';
const PlantArt: React.FC<{f: number; lit: number}> = ({f, lit}) => (
	<g>
		{/* the chimney, its smoke and the red light on top (steady — nothing blinks) */}
		{Array.from({length: 7}).map((_, k) => {
			const t = ((f + k * 25) % 175) / 175;
			return <circle key={k} cx={7520 + 700 * t + 500 * t * t} cy={560 - 900 * t} r={160 + 420 * t} fill="#6a6670" opacity={0.4 * (1 - t)} />;
		})}
		<path d="M 7300,6000 L 7420,600 L 7620,600 L 7740,6000 Z" fill="#4a2e2a" />
		{[1300, 1700].map((y) => (
			<rect key={y} x={7395} y={y} width={250} height={90} fill="#9a98a0" opacity={0.55} />
		))}
		<circle cx={7520} cy={640} r={34} fill="#ff4a3a" />
		<circle cx={7520} cy={640} r={140} fill="#ff4a3a" opacity={0.18} />
		{/* the long block */}
		<rect x={0} y={2800} width={9000} height={3200} fill="#3a3942" />
		<rect x={0} y={2760} width={9000} height={70} fill="#2a2930" />
		{[3150, 3950, 4750].map((y, r) =>
			Array.from({length: 30}).map((_, c) => {
				const on = rnd(r * 31 + c + 3) < 0.45;
				return <rect key={`${r}-${c}`} x={110 + c * 296} y={y} width={250} height={520} fill={on ? '#ffd98a' : '#202129'} opacity={on ? 0.9 : 1} />;
			}),
		)}
		{[3150, 3950, 4750].map((y) => (
			<rect key={y} x={0} y={y + 250} width={9000} height={16} fill="#3a3942" />
		))}
		{/* the office block in the middle, the lit entrance */}
		<rect x={3300} y={2300} width={2400} height={3700} fill="#45444e" />
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 6}).map((_, c) => {
				const on = rnd(r * 7 + c + 50) < 0.35;
				return <rect key={`o${r}-${c}`} x={3420 + c * 380} y={2480 + r * 620} width={240} height={360} fill={on ? '#ffe2a0' : '#24252d'} />;
			}),
		)}
		<rect x={4100} y={5150} width={800} height={850} fill="#ffe2a0" opacity={0.9} />
		<rect x={3950} y={5050} width={1100} height={110} fill="#2a2930" />
		{/* the rooftop letters on their lattice */}
		<defs>
			<radialGradient id="plantglow" cx={0.5} cy={0.5} r={0.5}>
				<stop offset="0" stopColor="#ff3b2f" stopOpacity={0.3} />
				<stop offset="1" stopColor="#ff3b2f" stopOpacity={0} />
			</radialGradient>
		</defs>
		<ellipse cx={4500} cy={1990} rx={2900} ry={760} fill="url(#plantglow)" opacity={Math.min(1, lit / 13)} />
		<rect x={2350} y={2150} width={4300} height={26} fill="#2a2930" />
		{Array.from({length: 22}).map((_, k) => (
			<line key={k} x1={2400 + k * 200} y1={2176} x2={2500 + k * 200} y2={2300} stroke="#2a2930" strokeWidth={16} />
		))}
		{SIGN.split('').map((ch, i) => {
			const on = Math.max(0, Math.min(1, lit - i));
			const x = 2620 + i * 313;
			return (
				<g key={i}>
					{on > 0 && (
						<text x={x} y={2140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={430} fill="none" stroke="#ff3b2f" strokeWidth={70} opacity={0.22 * on}>
							{ch}
						</text>
					)}
					<text x={x} y={2140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={430} fill={on > 0.5 ? '#ff5446' : '#4a1f1c'} opacity={on > 0.5 ? 0.6 + 0.4 * on : 1}>
						{ch}
					</text>
				</g>
			);
		})}
	</g>
);
// 2. «Казань, семьдесят шестой. Район завода «Теплоконтроль». Здесь всё держат пацаны из Тяп-ляп.» — the plant at
// night, its rooftop letters light up one by one; out of the dark a crowd in caps walks at you
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const D = SHOTS[1].duration;
	const cam: Cam3 = {x: lerp(f, 0, D, 520, -80), y: -300, z: lerp(f, 0, D, 380, 600)};
	const lit = interpolate(f, [58, 96], [0, 13], clamp);
	const slam = 155;
	const tp = pop(f, slam, 8);
	const walkZ = lerp(f, 0, D, -5000, -3700, Easing.linear);
	const sign = project(cam, 0, -3800, -7000);
	return (
		<AbsoluteFill>
			<Scene3D
				cam={cam}
				bg={skyBg('night')}
				farBlur={0}
				far={
					<>
						<Card3D x={0} y={0} z={-7000} w={9000} h={6000} res={6}>
							<PlantArt f={f} lit={lit} />
						</Card3D>
						<Card3D x={0} y={0} z={-5200} w={12000} h={760} res={4}>
							<FenceArt w={12000} />
							<rect width={12000} height={760} fill="#0b0b14" opacity={0.62} />
						</Card3D>
					</>
				}
			>
				<Ground3D id="r2s2plant" time="night" depth={2500 + 5196} w={14000} x={0} noFar />
				<LightPool x={-1300} z={-3500} />
				<LightPool x={1700} z={-3700} />
				<Lamp3D x={-1300} z={-3500} />
				<Lamp3D x={1700} z={-3700} />
				{[-460, -230, 0, 230, 460].map((dx, k) => (
					<Figure3D key={k} x={250 + dx} z={walkZ - Math.abs(dx) * 0.5} p={k === 2 ? gvozd('r2s2gv', {walk: f * 0.3, silhouette: '#121018'}) : gang(`r2s2g${k}`, k, {walk: f * 0.3 + k, silhouette: '#121018'})} />
				))}
			</Scene3D>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 18% at ${sign.x}px 1180px, rgba(255,59,47,${0.12 * Math.min(1, lit / 13)}), transparent 70%)`}} />
			{vignette(0.55)}
			<RealStory f={f} />
			{f >= slam && (
				<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', transform: `scale(${tp}) rotate(-4deg)`, fontFamily: HEAVY, fontWeight: 900}}>
					<div style={{fontSize: 170, lineHeight: 1, color: '#e0342b', textShadow: '6px 6px 0 #fff, -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff, 0 16px 30px rgba(0,0,0,0.6)'}}>ТЯП-ЛЯП</div>
				</div>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [slam, slam + 1, slam + 6], [0, 0.4, 0], clamp)}} />
		</AbsoluteFill>
	);
};

// 3. «Начал всё Антип: пришёл из армии и открыл в подвале спортзал.» — an old photo of the empty basement gym (his
// rules on the wall); nobody real is drawn — only the caption names him
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const D = SHOTS[2].duration;
	const k = lerp(f, 0, D, 1, 1.07, Easing.linear);
	const rot = lerp(f, 0, D, -3.2, -1.6, Easing.linear);
	const line = 'АНТИП — ОСНОВАТЕЛЬ «ТЯП-ЛЯП»';
	const typed = Math.max(0, Math.min(line.length, Math.floor((f - 22) / 1.2)));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2a221a 0%, #120e0a 75%)'}}>
			<div style={{position: 'absolute', left: 540, top: 1010, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k * pop(f, 0, 14)})`, background: '#e8dec6', padding: '22px 22px 96px 22px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
				<div style={{position: 'relative', width: 800, height: 1080, overflow: 'hidden', background: '#000'}}>
					<div style={{position: 'absolute', left: 400 - 540, top: 540 - 960, width: 1080, height: 1920, transform: 'scale(0.78)', filter: 'sepia(0.9) contrast(1.12) brightness(0.92) saturate(0.85)'}}>
						<Scene3D cam={{x: 40, y: -470, z: 380, ry: -2}} bg="#141210" far={GYM_FAR(40)} farBlur={0}>
							<KachalkaInside3D id="r2s3" />
						</Scene3D>
					</div>
					<svg width={800} height={1080} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply'}}>
						<defs>
							<filter id="r2s3grain">
								<feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={7} />
								<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.55 0" />
							</filter>
							<radialGradient id="r2s3vg" cx={0.5} cy={0.5} r={0.7}>
								<stop offset="0.55" stopColor="#fff" />
								<stop offset="1" stopColor="#8a7a62" />
							</radialGradient>
						</defs>
						<rect width={800} height={1080} fill="url(#r2s3vg)" />
						<rect width={800} height={1080} filter="url(#r2s3grain)" opacity={0.5} />
						<path d="M 140,0 L 170,1080 M 610,0 L 590,700" stroke="#fff" strokeWidth={2} opacity={0.35} />
					</svg>
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: "'DejaVu Serif', serif", fontStyle: 'italic', fontSize: 38, color: '#2a3470', opacity: interpolate(f, [84, 92], [0, 1], clamp)}}>
					Казань, «Теплоконтроль». Подвал.
				</div>
			</div>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center'}}>
				<span style={{display: 'inline-block', minHeight: 70, background: 'rgba(8,8,12,0.78)', border: `4px solid ${YELLOW}`, borderRadius: 14, padding: '10px 26px', fontFamily: MONO_FONT, fontWeight: 800, fontSize: 40, color: '#fff', opacity: f >= 22 ? 1 : 0}}>
					{line.slice(0, typed)}
					<span style={{opacity: typed < line.length || Math.floor(f / 8) % 2 ? 1 : 0, color: YELLOW}}>▌</span>
				</span>
			</div>
			<RealStory f={f} />
		</AbsoluteFill>
	);
};

// 4. «А минуту назад ты постучал в дверь их качалки.» — your fist knocks three times on the iron door
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: 1700, y: -420, z: lerp(f, 0, 96, 1150, 1260)};
	const knock = [30, 38, 46].reduce((a, k) => a + Math.max(0, 1 - Math.abs(f - k) / 3), 0);
	const up = lerp(f, 4, 24, 0, 1, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
				<KachalkaGround id="r2s4g" />
				<Card3D x={1720} y={-430} z={lerp(knock, 0, 1, -1150, -1210)} w={700} h={700} anchor="center" view={[-350, -350, 700, 700]}>
					<g transform={`translate(${lerp(up, 0, 1, 60, 20)},${lerp(up, 0, 1, 560, 90)}) scale(0.55)`}>
						<KnockFist />
					</g>
				</Card3D>
			</Scene3D>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 5. The door opens — Гвоздь: «Опа. Игоречек? Ты чего тут забыл?»
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 0, 14, 0, 1, Easing.out(Easing.cubic));
	const cam: Cam3 = {x: 1700, y: -440, z: lerp(f, 0, 108, 1180, 1260)};
	const g = project(cam, 1700, -560, -1180);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} open={open} />} farBlur={0}>
				<KachalkaGround id="r2s5g" />
				{open > 0.4 && <Figure3D x={1720} z={-1180} p={gvozd('r2s3gv', {breathe: f, face: {...GV_FACE, eyes: 'open', brows: 'raised', mouth: Math.floor(f / 5) % 2 && f > 42 && f < 110 ? 'open' : 'smile', look: [0, 0.2]}})} />}
			</Scene3D>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 55% 55%, rgba(255,217,138,0.18) 0%, transparent 45%)', opacity: open}} />
			{vignette(0.55)}
			<Bubble x={Math.min(700, Math.max(380, g.x))} y={g.y - 120} text="ОПА. ИГОРЕЧЕК?" from={42} to={82} tail="left" />
			<Bubble x={Math.min(700, Math.max(380, g.x))} y={g.y - 120} text="ТЫ ЧЕГО ТУТ ЗАБЫЛ?" from={84} to={115} tail="left" />
		</AbsoluteFill>
	);
};

// 6. «Я хочу к вам.» — and it goes quiet inside (your face in the light from the door)
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 1700, y: -470, z: lerp(f, 0, 108, 640, 760)}} f={f} bg={skyBg('night')} blur={9} far={<><KachalkaFar f={f} open={1} /><KachalkaGround id="r2s6g" /></>}>
				<Card3D x={1700} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s4you" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: 'open', mouth: f > 32 && f < 56 && Math.floor(f / 5) % 2 ? 'open' : 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 0.6}} />
				</Card3D>
			</CloseUp>
			<AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(255,210,130,0.22), transparent 55%)'}} />
			{vignette(0.55)}
			<Bubble x={600} y={560} text="Я ХОЧУ К ВАМ." from={30} to={84} tail="right" />
		</AbsoluteFill>
	);
};

// 7. The basement: a crowbar barbell, a kettlebell, a sandbag — and ten guys in caps, who all turn to you
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const look = interpolate(f, [100, 112], [0, 1], clamp);
	const cam: Cam3 = {x: lerp(f, 0, 138, -60, 40), y: -430, z: lerp(f, 0, 138, 260, 560), ry: lerp(f, 0, 138, 4, -2)};
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#141210" far={GYM_FAR(f)} farBlur={0}>
				<KachalkaInside3D id="r2s5" />
				{GUYS.map(([x, z, k, cap], i) => (
					<Figure3D key={i} x={x} z={z} p={guy(`r2s5g${i}`, k, cap, {breathe: f + i * 9, headTurn: look * (x > 0 ? -0.5 : 0.5), face: {eyes: 'narrow', mouth: 'flat', brows: look > 0.5 ? 'angry' : 'flat', look: [look * (x > 0 ? -0.7 : 0.7), 0.1], blush: false}})} />
				))}
			</Scene3D>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 8. Сивый rises from the bench in the corner — the eldest of Тяп-ляп. Grey at twenty, a scar through the brow.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const rise = lerp(f, 8, 40, 0, 1, Easing.out(Easing.cubic));
	const walk = lerp(f, 44, 130, 0, 1);
	const cam: Cam3 = {x: lerp(f, 0, 150, 120, 20), y: -440, z: lerp(f, 0, 150, 460, 760)};
	const sz = lerp(walk, 0, 1, -1300, -1060);
	const t = project(cam, 40, -620, sz);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#141210" far={GYM_FAR(f)} farBlur={0}>
				<KachalkaInside3D id="r2s6" />
				{GUYS.slice(0, 2).map(([x, z, k, cap], i) => (
					<Figure3D key={i} x={x} z={z} p={guy(`r2s6g${i}`, k, cap, {breathe: f + i * 9, face: {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [x > 0 ? -0.7 : 0.7, 0.1], blush: false}})} />
				))}
				<Figure3D x={40} z={sz} y={lerp(rise, 0, 1, 150, 0)} p={sivy('r2s6sv', {breathe: f, walk: walk > 0 && walk < 1 ? f * 0.36 : undefined})} />
				<Card3D x={40} y={0} z={-1240} w={620} h={200} opacity={1 - walk}>
					<rect x={0} y={40} width={620} height={46} fill="#7a5a3a" />
					<rect x={40} y={86} width={90} height={114} fill="#8f4e3a" />
					<rect x={490} y={86} width={90} height={114} fill="#8f4e3a" />
				</Card3D>
			</Scene3D>
			{vignette(0.6)}
			{f >= 34 && <NameTag x={Math.min(760, Math.max(330, t.x))} y={Math.max(330, t.y - 120)} title="СИВЫЙ" sub="СТАРШИЙ В КАЧАЛКЕ" at={34} color={RED} />}
		</AbsoluteFill>
	);
};

// 9. «Хочешь к нам? У нас так: один удар от меня. Устоишь — пришился. Упадёшь — дверь там.»
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const door = interpolate(f, [158, 170], [0, 1], clamp);
	const talk = Math.floor(f / 5) % 2 === 1 && f > 4 && f < 180;
	return (
		<AbsoluteFill>
			<GymCU cam={{x: lerp(f, 0, 180, 40, -20), y: -540, z: lerp(f, 0, 180, 560, 680), rx: 3}} f={f}>
				<Card3D x={0} y={-580} z={-320} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<SivyHead id="r2s7sv" s={1.9} tilt={door * -8} face={{eyes: 'narrow', mouth: talk ? 'open' : 'flat', brows: 'flat', look: [door * -0.9, 0.1], blush: false}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
			<RulePlaque label="ПРОПИСКА" title={'ОДИН УДАР —\nУСТОЯТЬ'} from={60} to={146} y={420} />
		</AbsoluteFill>
	);
};

// 10. The guys form a ring. Сивый slowly rolls up his sleeve.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<GymRing cam={{x: 0, y: lerp(t, 0, 44, -640, -760), z: lerp(t, 0, 44, 360, 440), rx: -6}} f={t} />
				{vignette(0.6)}
			</AbsoluteFill>
		);
	}
	const roll = lerp(t, 8, 52, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 0, y: -460, z: lerp(t, 0, 50, 700, 760)}} f={t} blur={10}>
				<Card3D x={0} y={-460} z={-140} w={1400} h={700} anchor="center" view={[-700, -350, 1400, 700]}>
					<g transform="translate(-260,0) rotate(-8)">
						<rect x={-700} y={-80} width={1100} height={160} rx={60} fill="#e3b08a" />
						<rect x={380} y={-96} width={220} height={192} rx={70} fill="#e3b08a" />
						{[-60, -20, 20, 60].map((y) => (
							<ellipse key={y} cx={600} cy={y} rx={22} ry={18} fill="#d9a07a" />
						))}
						<rect x={-760} y={-96} width={lerp(roll, 0, 1, 1080, 520)} height={192} rx={50} fill={SIVY.top} />
						<rect x={lerp(roll, 0, 1, 280, -280)} y={-104} width={70} height={208} rx={30} fill={SIVY.topDark} />
					</g>
				</Card3D>
			</GymCU>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 11. You clench your fists. And you don't close your eyes.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const clench = interpolate(f, [4, 14], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 20, y: -470, z: lerp(f, 0, 84, 640, 820)}} f={f} blur={9}>
				<Card3D x={20} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s9you" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: f > 40 ? 'wide' : 'open', pupil: 0.5, mouth: 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 0.5, sweat: 0.6}} />
				</Card3D>
				{[-1, 1].map((sd) => (
					<Card3D key={sd} x={20 + sd * 300} y={-120} z={-100} w={360} h={360} anchor="center" view={[-180, -180, 360, 360]}>
						<g transform={`scale(${0.42 * (1 - 0.08 * clench)}) rotate(${sd * 12})`}>
							<FistFront sleeve={IGOR.top} />
						</g>
					</Card3D>
				))}
			</GymCU>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 12. «Удар.» — his fist flies at you; the hit: a flash, the world jolts
export const S12: React.FC = () => <Punch f={useCurrentFrame()} at={8} />;
const Punch: React.FC<{f: number; at: number}> = ({f, at}) => {
	const fly = lerp(f, 0, at, 0, 1, Easing.in(Easing.cubic));
	const shake = f >= at ? Math.sin((f - at) * 2.4) * 40 * Math.exp(-(f - at) / 8) : 0;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `rotate(${f >= at ? lerp(f, at, at + 10, 0, 9) : 0}deg)`}}>
				<GymCU cam={{x: shake, y: -540 + shake * 0.5, z: 560 + lerp(f, 0, at, -40, 0)}} f={f} blur={10}>
					<Card3D x={0} y={-600} z={-460} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
						<SivyHead id="r2s10sv" s={1.5} face={{eyes: 'narrow', mouth: 'grin', brows: 'angry', look: [0, 0], blush: false}} />
					</Card3D>
					{f < at + 2 && (
						<Card3D x={50} y={-480} z={lerp(fly, 0, 1, -300, 560)} w={360} h={360} anchor="center" view={[-180, -180, 360, 360]}>
							<g transform="scale(0.5)">
								<FistFront />
							</g>
						</Card3D>
					)}
				</GymCU>
			</AbsoluteFill>
			{vignette(0.65)}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [at, at + 1, at + 10], [0, 1, 0], clamp)}} />
			<AbsoluteFill style={{background: '#7a0000', opacity: interpolate(f, [at + 2, at + 6, at + 40], [0, 0.35, 0.15], clamp)}} />
		</AbsoluteFill>
	);
};

// 13. Your ears ring. The floor slips away — and you fall. (double vision, the frame sways, then the floor rushes up)
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const daze = 1;
	const hit = 98; // you hit the floor
	const fall = interpolate(f, [80, hit], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const thud = f >= hit ? Math.sin((f - hit) * 2.2) * 26 * Math.exp(-(f - hit) / 5) : 0;
	const rot = Math.sin(f / 9) * 10 * (1 - fall) + fall * 64;
	const cam: Cam3 = {x: Math.sin(f / 13) * 40 * (1 - fall), y: -480 + fall * 400, z: 520 + fall * 80, rx: Math.sin(f / 11) * 3 * (1 - fall)};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateY(${thud}px) rotate(${rot}deg) scale(${1.12 + fall * 0.25})`, filter: `blur(${(2 + 3 * Math.abs(Math.sin(f / 7))) * (1 - fall) + fall * 6}px)`}}>
				<GymRing cam={cam} f={f} you={false} />
				<AbsoluteFill style={{opacity: 0.38 * daze, transform: `translate(${30 + Math.sin(f / 5) * 16}px, ${-12}px)`}}>
					<GymRing cam={cam} f={f} you={false} />
				</AbsoluteFill>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(60,0,0,0.75) 100%)', opacity: daze}} />
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [hit - 2, hit, hit + 5, hit + 13], [0, 0.85, 0.85, 0.35], clamp)}} />
		</AbsoluteFill>
	);
};

// 14. «Пацаны ржут. Сивый кивает на дверь: «Упал — свободен».» — you lie on the floor: the ring from below, the horizon
// tilted, everybody laughs; Сивый points at the door (Сивый@38, кивает@48, «Упал@80)
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 122, -40, 20), y: -150, z: lerp(f, 0, 122, 760, 820), rx: 4};
	const point = lerp(f, 46, 62, 0, 1, Easing.out(Easing.cubic));
	const s = project(cam, -60, -560, -1000);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `rotate(${-14 + Math.sin(f / 20) * 1.5}deg) scale(1.22)`}}>
				<GymRing cam={cam} f={f} you={false} mood="laugh" point={point} sivyFace={{eyes: 'narrow', mouth: f > 78 && f < 112 && Math.floor(f / 5) % 2 ? 'open' : 'smile', brows: 'flat', look: [0.2, 0.4], blush: false}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 35%, rgba(40,0,0,0.6) 100%)'}} />
			{vignette(0.6)}
			<Bubble x={Math.min(700, Math.max(380, s.x + 80))} y={Math.max(380, s.y - 40)} text="УПАЛ — СВОБОДЕН." from={78} to={120} tail="left" dark />
		</AbsoluteFill>
	);
};

// 15. «Но ты встаёшь. Ноги дрожат. И ты говоришь: «Бей ещё».» — you get up (the view rises from the floor, the laughter
// stops), then your face: «БЕЙ ЕЩЁ.» (встаёшь@14, дрожат@49, «Бей@98)
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [64]);
	if (i === 0) {
		const up = lerp(t, 4, 44, 0, 1, Easing.inOut(Easing.cubic));
		const wob = Math.sin(t / 3.5) * 5 * up;
		const cam: Cam3 = {x: wob * 3, y: lerp(up, 0, 1, -150, -480), z: lerp(up, 0, 1, 820, 600), rx: lerp(up, 0, 1, 4, 0)};
		return (
			<AbsoluteFill>
				<AbsoluteFill style={{transform: `rotate(${lerp(up, 0, 1, -14, 0) + wob * 0.6}deg) scale(${lerp(up, 0, 1, 1.22, 1.1)})`, filter: `blur(${lerp(up, 0, 1, 3, 0.5)}px)`}}>
					<GymRing cam={cam} f={t} you={false} mood={t < 18 ? 'laugh' : 'shock'} />
				</AbsoluteFill>
				{vignette(0.6)}
			</AbsoluteFill>
		);
	}
	const talk = f > 96 && f < 118 && Math.floor(f / 5) % 2 === 1;
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 20 + Math.sin(t / 4) * 4, y: -470, z: lerp(t, 0, 66, 620, 720)}} f={t}>
				<Card3D x={20} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s15you" x={0} y={0} scale={1.4} colors={IGOR} tilt={Math.sin(t / 5) * 2} face={{eyes: 'narrow', mouth: talk ? 'open' : 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 1}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
			<Bubble x={600} y={540} text="БЕЙ ЕЩЁ." from={96} to={128} tail="right" />
		</AbsoluteFill>
	);
};

// 16. «В подвале становится тихо. Сивый бьёт второй раз.» — the silent ring, Сивый steps in; the second blow
// (Сивый@53, бьёт@65, второй@74, раз@88)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<GymRing cam={{x: lerp(t, 0, 58, -20, 10), y: -480, z: lerp(t, 0, 58, 560, 640)}} f={t} you={false} mood="shock" sivyFace={{eyes: 'narrow', mouth: 'flat', brows: 'angry', look: [0, 0.1], blush: false}} />
				{vignette(0.65)}
			</AbsoluteFill>
		);
	}
	return <Punch f={t} at={28} />;
};

// 17. …and you stand. Silence. (you on your feet in the middle of the ring)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const sway = Math.sin(f / 6) * 6 * Math.exp(-f / 30);
	return (
		<AbsoluteFill>
			<Scene3D cam={{x: 20, y: -430, z: lerp(f, 0, 78, 420, 520)}} bg="#141210" far={GYM_FAR(f)} farBlur={0}>
				<KachalkaInside3D id="r2s12" />
				{RING.map(([x, z, k], i) => (
					<Figure3D key={i} x={x * 0.8} z={z + 200} p={guy(`r2s12g${i}`, k, i % 2 === 0, {breathe: f + i * 7, face: {eyes: 'wide', pupil: 0.7, mouth: 'flat', brows: 'raised', look: [x > 0 ? -0.6 : 0.6, 0], blush: false}})} />
				))}
				<Figure3D x={20} z={-860} p={igor('r2s12you', {breathe: f, headTilt: sway, face: {eyes: 'narrow', mouth: 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 1}})} />
			</Scene3D>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 18. Сивый smirks: «Упал — и встал. Теперь ты наш.»
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 0, y: -560, z: lerp(f, 0, 102, 560, 660)}} f={f}>
				<Card3D x={0} y={-580} z={-320} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<SivyHead id="r2s13sv" s={1.9} face={{eyes: 'narrow', mouth: Math.floor(f / 5) % 2 && f > 44 && f < 114 ? 'open' : 'smile', brows: 'flat', look: [0, 0.1], blush: false}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
			<Bubble x={540} y={470} text="УПАЛ — И ВСТАЛ." from={42} to={84} tail="left" />
			<Bubble x={540} y={470} text="ТЕПЕРЬ ТЫ НАШ." from={86} to={117} tail="left" />
		</AbsoluteFill>
	);
};

// 19. «И забудь про Игоречка. Здесь ты — Лавр. Тяп-ляповский.» — «ИГОРЕЧЕК» crossed out, «ЛАВР» stamped, then
// «ТЯП-ЛЯПОВСКИЙ» under it
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const strike = lerp(f, 20, 34, 0, 1, Easing.out(Easing.cubic));
	const at = 75;
	const at2 = 95;
	const k = interpolate(f, [at, at + 6], [1.8, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const k2 = interpolate(f, [at2, at2 + 6], [1.8, 1], {...clamp, easing: Easing.in(Easing.quad)});
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 20, y: -470, z: lerp(f, 0, 102, 640, 760)}} f={f}>
				<Card3D x={20} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s14you" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: 'narrow', mouth: f > at ? 'smile' : 'flat', brows: 'flat', look: [0, 0], blush: false, bruise: 1}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
			<div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: interpolate(f, [2, 8], [0, 1], clamp)}}>
				<span style={{position: 'relative', display: 'inline-block', fontSize: 104, color: '#f2efe6', textShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>
					ИГОРЕЧЕК
					<span style={{position: 'absolute', left: -10, top: '52%', height: 16, width: `${strike * 104}%`, background: RED, transform: 'rotate(-6deg)', borderRadius: 8}} />
				</span>
			</div>
			{f >= at && (
				<div style={{position: 'absolute', left: 540, top: 600, transform: `translate(-50%,-50%) rotate(-6deg) scale(${k})`, opacity: interpolate(f, [at, at + 3], [0, 1], clamp)}}>
					<div style={{border: `14px solid ${YELLOW}`, borderRadius: 26, padding: '6px 54px', fontFamily: HEAVY, fontWeight: 900, fontSize: 170, lineHeight: 1.05, color: YELLOW, background: 'rgba(12,10,12,0.6)', letterSpacing: 8}}>ЛАВР</div>
				</div>
			)}
			{f >= at2 && (
				<div style={{position: 'absolute', left: 540, top: 790, transform: `translate(-50%,-50%) rotate(3deg) scale(${k2})`, opacity: interpolate(f, [at2, at2 + 3], [0, 1], clamp)}}>
					<div style={{border: `10px solid ${RED}`, borderRadius: 20, padding: '4px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: '#fff', background: RED, letterSpacing: 3, whiteSpace: 'nowrap', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>ТЯП-ЛЯПОВСКИЙ</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 20. The guys shake your hand one by one. For the first time they look at you as an equal.
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44, 88]);
	if (i < 2) {
		return (
			<AbsoluteFill>
				<GymCU cam={{x: lerp(t, 0, 44, i ? 60 : -60, i ? 0 : 0), y: -480, z: 700}} f={t} blur={10}>
					<Card3D x={0} y={-480} z={-150} w={1300} h={800} anchor="center" view={[-650, -400, 1300, 800]}>
						<Handshake sleeve={(i === 0 ? GANG[0] : GANG[2]).top ?? '#3d4436'} t={t} />
					</Card3D>
				</GymCU>
				{vignette(0.6)}
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 20, y: -470, z: lerp(t, 0, 44, 660, 740)}} f={t}>
				<Card3D x={20} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s15you" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: 'happy', mouth: 'smile', brows: 'raised', look: [0, 0], blush: true, bruise: 1}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
		</AbsoluteFill>
	);
};

// 21. Гвоздь slaps your shoulder: «У нас правила Антипа: не пить, не курить. И своих не бросать.»
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<GymCU cam={{x: lerp(f, 0, 138, 1880, 1960) - 1900, y: -540, z: 560}} f={f}>
				<Card3D x={-200} y={-640} z={-420} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<GvozdHead id="r2s16gv" t={f} s={1.6} tilt={-4} face={{...GV_FACE, mouth: Math.floor(f / 5) % 2 && f > 56 && f < 172 ? 'open' : 'smile'}} />
				</Card3D>
				<Card3D x={250} y={-470} z={-260} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<Bust kind="boy" id="r2s16you" x={0} y={0} scale={1.6} colors={IGOR} face={{eyes: 'open', mouth: 'smile', brows: 'flat', look: [-0.6, -0.2], blush: false, bruise: 1}} />
					<g transform={`translate(${lerp(f, 0, 10, -420, -180)},${lerp(f, 0, 10, 600, 300)}) rotate(-50)`}>
						<rect x={-50} y={0} width={100} height={420} rx={26} fill={GVOZD.top} />
						<ellipse cx={0} cy={-8} rx={66} ry={54} fill="#e3b08a" />
					</g>
				</Card3D>
			</GymCU>
			{vignette(0.55)}
		</AbsoluteFill>
	);
};

// 22. At home mom gasps: «Игоречек, опять упал?» — and for the first time you smile
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const push = lerp(f, 96, 150, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(push, 0, 1, 50, 170), y: lerp(push, 0, 1, -430, -400), z: lerp(push, 0, 1, 840, 1080)};
	const m = project(cam, -60, -470, -760);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#1a1520" far={<KitchenBack id="r2s17" f={f} />} farBlur={0}>
				<Kitchen3D id="r2s17" />
				<Figure3D x={-60} z={-760} p={{kind: 'mom', id: 'r2s17mom', scale: 0.48, breathe: f, face: {eyes: 'wide', pupil: 0.7, mouth: f > 46 && f < 90 && Math.floor(f / 5) % 2 ? 'open' : 'o', brows: 'worried', look: [0.8, 0]}, armL: {target: [-90, -560], bend: 1}, armR: {target: [90, -560], bend: -1}}} />
				<Figure3D x={170} z={-640} p={igor('r2s17you', {breathe: f, face: {eyes: f > 104 ? 'happy' : 'open', mouth: f > 104 ? 'smile' : 'flat', brows: 'flat', look: [-0.4, 0], blush: false, bruise: 1}})} />
			</Scene3D>
			{vignette(0.5)}
			<Bubble x={Math.max(360, m.x + 60)} y={m.y - 60} text="ИГОРЕЧЕК, ОПЯТЬ УПАЛ?" from={44} to={100} tail="left" />
		</AbsoluteFill>
	);
};

// 23. In the morning Сазон waits at the school again: «Гони двадцать копеек, Игоречек.»
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 132, -260, -200), y: -470, z: lerp(f, 0, 132, 800, 960)};
	const sz = project(cam, -330, -540, -1150);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={f} />} farBlur={6}>
				<SchoolYardNear id="r2s18" />
				<Figure3D x={-560} z={-1300} p={sazFriend('r2s18f0', 0, {breathe: f + 5})} />
				<Figure3D x={-60} z={-1340} p={sazFriend('r2s18f1', 1, {breathe: f + 11})} />
				<Figure3D x={-330} z={-1150} p={sazon('r2s18saz', {breathe: f, face: {...SAZ_FACE, mouth: Math.floor(f / 5) % 2 && f > 72 && f < 112 ? 'open' : 'grin'}})} />
				<Figure3D x={-140} z={-560} p={igor('r2s18you', {back: true, breathe: f})} />
			</Scene3D>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(235,240,245,0.3), rgba(235,240,245,0.05) 60%)'}} />
			{vignette(0.45)}
			<Bubble x={Math.min(640, Math.max(440, sz.x + 60))} y={sz.y - 60} text="ГОНИ 20 КОПЕЕК, ИГОРЕЧЕК!" from={70} to={126} tail="left" dark />
		</AbsoluteFill>
	);
};

// 24. «Я теперь тяп-ляповский.» — Сазон laughs: «Докажи.»
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: lerp(f, 0, 132, -20, 20), y: -520, z: 560}} f={f} far={<><SchoolYardFar f={f} /><SchoolYardNear id="r2s19cu" /></>} blur={9}>
				<Card3D x={-230} y={-470} z={-260} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<Bust kind="boy" id="r2s19you" x={0} y={0} scale={1.6} colors={IGOR} face={{eyes: 'narrow', mouth: f > 26 && f < 72 && Math.floor(f / 5) % 2 ? 'open' : 'flat', brows: 'angry', look: [0.6, -0.1], blush: false, bruise: 1}} />
				</Card3D>
				<Card3D x={260} y={-640} z={-420} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<Bust kind="teen" id="r2s19saz" x={0} y={0} scale={1.6} colors={SAZON} plain face={f > 80 ? LAUGH(f, 0) : {...SAZ_FACE, look: [-0.6, 0.1]}} tilt={f > 80 ? Math.sin(f / 4) * 3 : 0} />
				</Card3D>
			</CloseUp>
			{vignette(0.5)}
			<Bubble x={430} y={520} text="Я ТЕПЕРЬ ТЯП-ЛЯПОВСКИЙ." from={24} to={78} tail="left" />
			<Bubble x={700} y={420} text="ДОКАЖИ!" from={102} to={126} tail="right" dark />
		</AbsoluteFill>
	);
};

// 25. Finale: call the guys — let them deal with him? Or hit Сазон yourself?
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="СЕРИЯ 3"
			series="ТЫ С КАКОГО РАЙОНА?"
			boxes={3}
			boxLabel="ПОНЯТИЯ"
			boxMark="check"
			opt1={{text: 'ПОЗВАТЬ ПАЦАНОВ', sub: 'пусть разберутся'}}
			opt2={{text: 'УДАРИТЬ САМОМУ', sub: 'и доказать, что ты Лавр'}}
			note="По мотивам истории группировки «Тяп-ляп» (Казань, 1970-е). Герои и события сериала вымышлены."
			tallyLine={
				<>
					ПОНЯТИЙ: <span style={{color: '#7ee08a'}}>2</span> · ДАЛЬШЕ — <span style={{color: YELLOW}}>ВЫБИРАЕШЬ ТЫ</span>
				</>
			}
			bg={
				<AbsoluteFill>
					<Scene3D cam={{x: -260, y: -470, z: 900}} bg={skyBg('day')} far={<SchoolYardFar f={f} />} farBlur={6}>
						<SchoolYardNear id="r2s20" />
						<Figure3D x={-330} z={-1150} p={sazon('r2s20saz', {breathe: f})} />
					</Scene3D>
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
				</AbsoluteFill>
			}
		/>
	);
};
