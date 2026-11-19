// «Ты с какого района?» — серия 2 «Прописка» (1976). Зрители выбрали «пришиться». Ты стучишь в дверь качалки, Гвоздь
// открывает, внутри — подвальная качалка и Сивый, старший у Тяп-ляп: «Один удар от меня. Устоишь — пришился».
// Удар, звон в ушах, шаг назад — и ты стоишь. «Устоял. Теперь ты наш. Здесь ты — Лавр». Первое понятие: «своих не
// сдают». Дома мама: «Опять упал?» — а ты улыбаешься. Утром Сазон: «Докажи». Выбор: позвать пацанов / ударить самому.
// 20 shots on the timeline of src/r2/timeline.ts (= the voice, see scripts/fit-voiceover.py --part r2).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {Bust, Colors, Face} from '../components/Person';
import {Cam3, Card3D, project, Scene3D} from '../components/Scene3D';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import {Figure3D, Ground3D, skyBg} from '../r1/world3d';
import {KachalkaFar, KachalkaInside3D, KachalkaInsideBack} from '../r1/sets3d';
import {CloseUp, GANG, GANG_CAP, GV_FACE, GVOZD, GvozdHead, IGOR, Kitchen3D, KitchenBack, LAUGH, P, RulePlaque, SAZ_FACE, SAZON, SchoolYardFar, SchoolYardNear, gang, gvozd, igor, sazFriend, sazon, vignette} from '../r1/scenes';
import {SHOTS} from './timeline';

const {YELLOW, RED} = G1;
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
const GymRing: React.FC<{cam: Cam3; f: number; you?: boolean; youFace?: Face; youBack?: boolean; sway?: number}> = ({cam, f, you = true, youFace, youBack = true, sway = 0}) => (
	<Scene3D cam={cam} bg="#141210" far={GYM_FAR(f)} farBlur={0}>
		<KachalkaInside3D id="r2ring" />
		{RING.map(([x, z, k], i) => (
			<Figure3D key={i} x={x} z={z} p={guy(`r2rg${i}`, k, i % 2 === 0, {breathe: f + i * 7, face: {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [x > 0 ? -0.6 : 0.6, 0.1], blush: false}})} />
		))}
		<Figure3D x={40} z={-1080} p={gvozd('r2rgv', {breathe: f, face: {...GV_FACE, mouth: 'flat', look: [-0.3, 0.1]}})} />
		<Figure3D x={-60} z={-1000} p={sivy('r2rsv', {breathe: f})} />
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

// 2. «А минуту назад ты постучал в дверь их качалки.» — your fist knocks three times on the iron door
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: 1700, y: -420, z: lerp(f, 0, 96, 1150, 1260)};
	const knock = [30, 38, 46].reduce((a, k) => a + Math.max(0, 1 - Math.abs(f - k) / 3), 0);
	const up = lerp(f, 4, 24, 0, 1, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} />} farBlur={0}>
				<Ground3D id="r2s2g" time="night" />
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

// 3. The door opens — Гвоздь: «Опа. Игоречек? Ты чего тут забыл?»
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 0, 14, 0, 1, Easing.out(Easing.cubic));
	const cam: Cam3 = {x: 1700, y: -440, z: lerp(f, 0, 108, 1180, 1260)};
	const g = project(cam, 1700, -560, -1180);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('night')} far={<KachalkaFar f={f} open={open} />} farBlur={0}>
				<Ground3D id="r2s3g" time="night" />
				{open > 0.4 && <Figure3D x={1720} z={-1180} p={gvozd('r2s3gv', {breathe: f, face: {...GV_FACE, eyes: 'open', brows: 'raised', mouth: Math.floor(f / 5) % 2 && f > 16 && f < 100 ? 'open' : 'smile', look: [0, 0.2]}})} />}
			</Scene3D>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 55% 55%, rgba(255,217,138,0.18) 0%, transparent 45%)', opacity: open}} />
			{vignette(0.55)}
			<Bubble x={Math.min(700, Math.max(380, g.x))} y={g.y - 120} text="ОПА. ИГОРЕЧЕК?" from={16} to={58} tail="left" />
			<Bubble x={Math.min(700, Math.max(380, g.x))} y={g.y - 120} text="ТЫ ЧЕГО ТУТ ЗАБЫЛ?" from={60} to={108} tail="left" />
		</AbsoluteFill>
	);
};

// 4. «Я хочу к вам.» — and it goes quiet inside (your face in the light from the door)
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: 1700, y: -470, z: lerp(f, 0, 108, 640, 760)}} f={f} bg={skyBg('night')} blur={9} far={<><KachalkaFar f={f} open={1} /><Ground3D id="r2s4g" time="night" /></>}>
				<Card3D x={1700} y={-470} z={-200} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<Bust kind="boy" id="r2s4you" x={0} y={0} scale={1.4} colors={IGOR} face={{eyes: 'open', mouth: f > 14 && f < 44 && Math.floor(f / 5) % 2 ? 'open' : 'flat', brows: 'angry', look: [0, 0], blush: false, bruise: 0.6}} />
				</Card3D>
			</CloseUp>
			<AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(255,210,130,0.22), transparent 55%)'}} />
			{vignette(0.55)}
			<Bubble x={600} y={560} text="Я ХОЧУ К ВАМ." from={12} to={70} tail="right" />
		</AbsoluteFill>
	);
};

// 5. The basement: a crowbar barbell, a kettlebell, a sandbag — and ten guys in caps, who all turn to you
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const look = interpolate(f, [50, 62], [0, 1], clamp);
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

// 6. Сивый rises from the bench in the corner — the eldest of Тяп-ляп. Grey at twenty, a scar through the brow.
export const S06: React.FC = () => {
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
			{f >= 24 && <NameTag x={Math.min(760, Math.max(330, t.x))} y={Math.max(330, t.y - 120)} title="СИВЫЙ" sub="СТАРШИЙ У ТЯП-ЛЯП" at={24} color={RED} />}
		</AbsoluteFill>
	);
};

// 7. «Хочешь к нам? У нас так: один удар от меня. Устоишь — пришился. Упадёшь — дверь там.»
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const door = interpolate(f, [150, 162], [0, 1], clamp);
	const talk = Math.floor(f / 5) % 2 === 1 && f > 4 && f < 172;
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

// 8. The guys form a ring. Сивый slowly rolls up his sleeve.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [54]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<GymRing cam={{x: 0, y: lerp(t, 0, 54, -640, -760), z: lerp(t, 0, 54, 360, 440), rx: -6}} f={t} />
				{vignette(0.6)}
			</AbsoluteFill>
		);
	}
	const roll = lerp(t, 4, 40, 0, 1, Easing.inOut(Easing.cubic));
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

// 9. You clench your fists. And you don't close your eyes.
export const S09: React.FC = () => {
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

// 10. «Удар.» — his fist flies at you; the hit: a flash, the world jolts
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const at = 32;
	const fly = lerp(f, 0, at, 0, 1, Easing.in(Easing.cubic));
	const shake = f >= at ? Math.sin((f - at) * 2.4) * 40 * Math.exp(-(f - at) / 8) : 0;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `rotate(${f >= at ? lerp(f, at, at + 10, 0, 9) : 0}deg)`}}>
				<GymCU cam={{x: shake, y: -540 + shake * 0.5, z: 560}} f={f} blur={10}>
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
			<AbsoluteFill style={{background: '#7a0000', opacity: interpolate(f, [at + 2, at + 6, 48], [0, 0.35, 0.15], clamp)}} />
		</AbsoluteFill>
	);
};

// 11. Your ears ring. The floor slips away. You step back… (double vision, the frame sways, then you steady)
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const daze = interpolate(f, [0, 70, 110, 120], [1, 1, 0.35, 0.2], clamp);
	const back = lerp(f, 72, 96, 0, 1, Easing.out(Easing.cubic));
	const rot = Math.sin(f / 9) * 10 * daze - back * 4 * (1 - back);
	const cam: Cam3 = {x: Math.sin(f / 13) * 40 * daze, y: -480 + back * 30, z: 520 - back * 160, rx: Math.sin(f / 11) * 3 * daze};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `rotate(${rot}deg) scale(1.12)`, filter: `blur(${(2 + 3 * Math.abs(Math.sin(f / 7))) * daze}px)`}}>
				<GymRing cam={cam} f={f} you={false} />
				<AbsoluteFill style={{opacity: 0.38 * daze, transform: `translate(${30 + Math.sin(f / 5) * 16}px, ${-12}px)`}}>
					<GymRing cam={cam} f={f} you={false} />
				</AbsoluteFill>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(60,0,0,0.75) 100%)', opacity: daze}} />
		</AbsoluteFill>
	);
};

// 12. …and you stand. Silence. (you on your feet in the middle of the ring)
export const S12: React.FC = () => {
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

// 13. Сивый smirks: «Устоял. Теперь ты наш.»
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<GymCU cam={{x: 0, y: -560, z: lerp(f, 0, 102, 560, 660)}} f={f}>
				<Card3D x={0} y={-580} z={-320} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
					<SivyHead id="r2s13sv" s={1.9} face={{eyes: 'narrow', mouth: Math.floor(f / 5) % 2 && f > 30 && f < 90 ? 'open' : 'smile', brows: 'flat', look: [0, 0.1], blush: false}} />
				</Card3D>
			</GymCU>
			{vignette(0.6)}
			<Bubble x={540} y={470} text="УСТОЯЛ. ТЕПЕРЬ ТЫ НАШ." from={26} to={102} tail="left" />
		</AbsoluteFill>
	);
};

// 14. «И забудь про Игоречка. Здесь ты — Лавр.» — «ИГОРЕЧЕК» crossed out, «ЛАВР» stamped
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const strike = lerp(f, 30, 44, 0, 1, Easing.out(Easing.cubic));
	const at = 60;
	const k = interpolate(f, [at, at + 6], [1.8, 1], {...clamp, easing: Easing.in(Easing.quad)});
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
		</AbsoluteFill>
	);
};

// 15. The guys shake your hand one by one. For the first time they look at you as an equal.
export const S15: React.FC = () => {
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

// 16. Гвоздь slaps your shoulder: «Правило первое: своих не сдают. Никогда.»
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<GymCU cam={{x: lerp(f, 0, 138, 1880, 1960) - 1900, y: -540, z: 560}} f={f}>
				<Card3D x={-200} y={-640} z={-420} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<GvozdHead id="r2s16gv" t={f} s={1.6} tilt={-4} face={{...GV_FACE, mouth: Math.floor(f / 5) % 2 && f > 20 && f < 126 ? 'open' : 'smile'}} />
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

// 17. At home mom gasps: «Игоречек, опять упал?» — and for the first time you smile
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const push = lerp(f, 70, 130, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(push, 0, 1, 50, 170), y: lerp(push, 0, 1, -430, -400), z: lerp(push, 0, 1, 840, 1080)};
	const m = project(cam, -60, -470, -760);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#1a1520" far={<KitchenBack id="r2s17" f={f} />} farBlur={0}>
				<Kitchen3D id="r2s17" />
				<Figure3D x={-60} z={-760} p={{kind: 'mom', id: 'r2s17mom', scale: 0.48, breathe: f, face: {eyes: 'wide', pupil: 0.7, mouth: f > 20 && f < 70 && Math.floor(f / 5) % 2 ? 'open' : 'o', brows: 'worried', look: [0.8, 0]}, armL: {target: [-90, -560], bend: 1}, armR: {target: [90, -560], bend: -1}}} />
				<Figure3D x={170} z={-640} p={igor('r2s17you', {breathe: f, face: {eyes: f > 80 ? 'happy' : 'open', mouth: f > 80 ? 'smile' : 'flat', brows: 'flat', look: [-0.4, 0], blush: false, bruise: 1}})} />
			</Scene3D>
			{vignette(0.5)}
			<Bubble x={Math.max(360, m.x + 60)} y={m.y - 60} text="ИГОРЕЧЕК, ОПЯТЬ УПАЛ?" from={16} to={80} tail="left" />
		</AbsoluteFill>
	);
};

// 18. In the morning Сазон waits at the school again: «Гони двадцать копеек, Игоречек.»
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam3 = {x: lerp(f, 0, 132, -260, -200), y: -470, z: lerp(f, 0, 132, 800, 960)};
	const sz = project(cam, -330, -540, -1150);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<SchoolYardFar f={f} />} farBlur={6}>
				<SchoolYardNear id="r2s18" />
				<Figure3D x={-560} z={-1300} p={sazFriend('r2s18f0', 0, {breathe: f + 5})} />
				<Figure3D x={-60} z={-1340} p={sazFriend('r2s18f1', 1, {breathe: f + 11})} />
				<Figure3D x={-330} z={-1150} p={sazon('r2s18saz', {breathe: f, face: {...SAZ_FACE, mouth: Math.floor(f / 5) % 2 && f > 40 && f < 110 ? 'open' : 'grin'}})} />
				<Figure3D x={-140} z={-560} p={igor('r2s18you', {back: true, breathe: f})} />
			</Scene3D>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(235,240,245,0.3), rgba(235,240,245,0.05) 60%)'}} />
			{vignette(0.45)}
			<Bubble x={Math.min(640, Math.max(440, sz.x + 60))} y={sz.y - 60} text="ГОНИ 20 КОПЕЕК, ИГОРЕЧЕК!" from={44} to={132} tail="left" dark />
		</AbsoluteFill>
	);
};

// 19. «Я теперь с Тяп-ляп.» — Сазон laughs: «Докажи.»
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<CloseUp cam={{x: lerp(f, 0, 132, -20, 20), y: -520, z: 560}} f={f} far={<><SchoolYardFar f={f} /><SchoolYardNear id="r2s19cu" /></>} blur={9}>
				<Card3D x={-230} y={-470} z={-260} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<Bust kind="boy" id="r2s19you" x={0} y={0} scale={1.6} colors={IGOR} face={{eyes: 'narrow', mouth: f > 8 && f < 60 && Math.floor(f / 5) % 2 ? 'open' : 'flat', brows: 'angry', look: [0.6, -0.1], blush: false, bruise: 1}} />
				</Card3D>
				<Card3D x={260} y={-640} z={-420} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
					<Bust kind="teen" id="r2s19saz" x={0} y={0} scale={1.6} colors={SAZON} plain face={f > 72 ? LAUGH(f, 0) : {...SAZ_FACE, look: [-0.6, 0.1]}} tilt={f > 72 ? Math.sin(f / 4) * 3 : 0} />
				</Card3D>
			</CloseUp>
			{vignette(0.5)}
			<Bubble x={430} y={520} text="Я ТЕПЕРЬ С ТЯП-ЛЯП." from={8} to={70} tail="left" />
			<Bubble x={700} y={420} text="ДОКАЖИ!" from={84} to={132} tail="right" dark />
		</AbsoluteFill>
	);
};

// 20. Finale: call the guys — let them deal with him? Or hit Сазон yourself?
export const S20: React.FC = () => {
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
