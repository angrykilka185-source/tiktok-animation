// «Ты с какого района?» — серия 1 «Двадцать копеек», версия 2: «3D-камера» (2.5D). Плоские 2D-слои — дома, гаражи,
// деревья, люди — стоят на настоящей глубине (components/Scene3D.tsx): камера ездит между ними, задний план размыт
// (глубина резкости), земля и пол уходят в перспективу. Новый герой — рыжий мальчик «под горшок» с веснушками
// (Person kind 'boy'), не похожий на сына из «Вахты». 1976 год, школьная форма с пионерским галстуком.
// 13 shots on the timeline of src/r1/timeline.ts (= the voice, see scripts/fit-voiceover.py --part r1).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {Bust, Colors, Face, Person, PersonProps} from '../components/Person';
import {GlobalDefs, Wallpaper, WallClock} from '../components/Set';
import {Box3D, Cam3, Card3D, Floor3D, project, Scene3D} from '../components/Scene3D';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import {BOY_S, FactoryArt, Facade, Figure3D, MAN_S, skyBg, Time, TreeArt, YardFar, YardNear} from './world3d';

const {YELLOW, RED} = G1;
const {Finale} = G2;

// ============================================================ people ======
const BOY: Colors = {top: '#2c3a66', topDark: '#222e52', pants: '#2c3a66', shoes: '#1a1a1e'};
// Санька: spiky fair hair (no glasses), the same school uniform
const SANKA: Colors = {top: '#2c3a66', topDark: '#222e52', pants: '#2c3a66', shoes: '#1a1a1e', hair: '#e2bd62', skin: '#f2c3a0'};
const SANKA_NIGHT: Colors = {...SANKA, top: '#5a4632', topDark: '#3e3022'};
const GVOZD: Colors = {top: '#24201d', topDark: '#151210', pants: '#2b2d33', shoes: '#111216', hair: '#1f1a1a', skin: '#e3b08a'};
const GANG: Colors[] = [
	{top: '#3d4436', topDark: '#2c3127', pants: '#2b2d33', shoes: '#111216', hair: '#3a2a20'},
	{top: '#4a4d52', topDark: '#36383c', pants: '#2b2d33', shoes: '#111216', hair: '#5a3a2a'},
	{top: '#383f4a', topDark: '#282e36', pants: '#33302c', shoes: '#111216', hair: '#2a1a12'},
	{top: '#4a3d33', topDark: '#362c24', pants: '#2b2d33', shoes: '#111216', hair: '#8a5a32'},
];
const GANG_CAP = ['#3a3a3a', '#4a3a2a', '#2f3640', '#3b3226'];
const STRANGERS: Colors[] = [
	{top: '#5a2a2a', topDark: '#431f1f', pants: '#2b2d33', shoes: '#111216', hair: '#2a1a12'},
	{top: '#2a3a5a', topDark: '#1f2b43', pants: '#33302c', shoes: '#111216', hair: '#3a2a20'},
	{top: '#3a4a2a', topDark: '#2b371f', pants: '#2b2d33', shoes: '#111216', hair: '#1f1a1a'},
];
const STRANGER_CAP = ['#2a2a2a', '#3a2a2a', '#22262c'];
const HARD: Face = {eyes: 'narrow', mouth: 'grin', brows: 'angry', look: [0, 0.2], blush: false};
const SCARED: Face = {eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'worried', look: [0, 0], blush: false};
const GV_FACE: Face = {eyes: 'narrow', mouth: 'smile', brows: 'flat', look: [0, 0.1], blush: false};

type P = Omit<PersonProps, 'x' | 'y'>;
const boy = (id: string, extra: Partial<P> = {}): P => ({kind: 'boy', id, scale: BOY_S, plain: true, pioneer: true, ...extra});
const man = (id: string, colors: Colors, extra: Partial<P> = {}): P => ({kind: 'dad', id, scale: MAN_S, plain: true, colors, ...extra});
const gvozd = (id: string, extra: Partial<P> = {}): P => man(id, GVOZD, {cap: '#2a2a2a', face: GV_FACE, ...extra});

// ============================================================ close-up art (inside cards) ==========
const Coin: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`}>
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
const Palm: React.FC<{s: number; children?: React.ReactNode}> = ({s, children}) => (
	<g transform={`scale(${s})`}>
		<rect x={-130} y={170} width={260} height={500} rx={40} fill={BOY.top} />
		<rect x={-120} y={150} width={240} height={40} rx={12} fill="#e9e4d8" />
		<ellipse cx={0} cy={60} rx={150} ry={150} fill="#f6cba8" />
		{[-90, -30, 30, 90].map((fx, k) => (
			<rect key={k} x={fx - 28} y={-250 + Math.abs(fx) * 0.5} width={56} height={240} rx={28} fill="#f6cba8" />
		))}
		<rect x={-220} y={-40} width={56} height={180} rx={28} fill="#f6cba8" transform="rotate(-38 -192 50)" />
		{children}
	</g>
);
// somebody's hand from above (sleeve colour), fingers pointing down
const HandDown: React.FC<{sleeve: string; skin?: string}> = ({sleeve, skin = '#e3b08a'}) => (
	<g>
		<rect x={-80} y={-560} width={160} height={540} rx={36} fill={sleeve} />
		<ellipse cx={0} cy={30} rx={92} ry={100} fill={skin} />
		{[-46, -16, 14, 44].map((fx, k) => (
			<rect key={k} x={fx - 15} y={60} width={30} height={84 - Math.abs(fx) * 0.4} rx={15} fill={skin} />
		))}
	</g>
);
// Гвоздь close up: cap, a match between his teeth (art centred on his head)
const GvozdHead: React.FC<{id: string; t: number; s: number; face?: Face; tilt?: number}> = ({id, t, s, face, tilt = 0}) => (
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
const Lamp3D: React.FC<{x: number; z: number; on?: number}> = ({x, z, on = 1}) => (
	<Card3D x={x} y={0} z={z} w={700} h={1900}>
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

// ============================================================== SHOTS =======
// 1. 1976. You are thirteen. Your yard — хрущёвки, garages and the brick factory. (close-up → the camera cranes up)
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const out = lerp(f, 40, 150, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(out, 0, 1, 0, 300), y: lerp(out, 0, 1, -380, -1150), z: lerp(out, 0, 1, 950, -1500), rx: lerp(out, 0, 1, 0, 8)};
	const p = (at: number) => pop(f, at, 10);
	const tag = (x: number, y: number, z: number) => project(cam, x, y, z);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<YardFar f={f} />} farBlur={lerp(out, 0, 1, 7, 2.5)}>
				<YardNear id="r1s1" />
				<Figure3D x={0} z={0} p={boy('r1s1you', {backpack: true, breathe: f, face: {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.3, 0], blush: false}})} />
			</Scene3D>
			<div style={{position: 'absolute', top: 380, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: interpolate(f, [4, 10, 40, 48], [0, 1, 1, 0], clamp)}}>
				<div style={{fontSize: 220, lineHeight: 1, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.45)', transform: `scale(${p(4)})`}}>1976</div>
				<div style={{fontSize: 46, letterSpacing: 12, color: YELLOW, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>ОКТЯБРЬ</div>
			</div>
			{f >= 49 && f < 88 && <NameTag x={tag(0, -470, 0).x} y={tag(0, -470, 0).y - 90} title="ТЫ" sub="13 ЛЕТ" at={49} pin={50} color={YELLOW} to={88} />}
			{f >= 103 && <NameTag x={Math.max(250, tag(-2600, -3000, -6400).x)} y={Math.max(260, tag(-2600, -3000, -6400).y)} title="ХРУЩЁВКИ" at={103} color="#e9e4d8" />}
			{f >= 120 && <NameTag x={Math.min(800, tag(2300, -1100, -1500).x)} y={tag(2300, -1100, -1500).y} title="ГАРАЖИ" at={120} color="#9fb4c8" />}
			{f >= 140 && <NameTag x={Math.min(690, Math.max(340, tag(1300, -8200, -20000).x))} y={Math.max(260, tag(1300, -8200, -20000).y)} title="КИРПИЧНЫЙ ЗАВОД" at={140} color="#e08a5a" />}
		</AbsoluteFill>
	);
};

// 2. Every day on the way from school: «Ты с какого района?» (the camera tracks you along the concrete fence)
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [38, 76]);
	const bx = [-1100, -300, 300][i] + Math.min(t, 30) * 9;
	const cam: Cam3 = {x: bx + 160, y: -440, z: 1020, ry: -2};
	const groups = [
		[{x: -500, k: 0}],
		[
			{x: -700, k: 1},
			{x: -380, k: 2},
		],
		[
			{x: 470, k: 0},
			{x: 760, k: 2},
			{x: 1040, k: 1},
		],
	][i];
	const lead = groups[groups.length - 1];
	const b = project(cam, lead.x, -560, -1150);
	const text = ['С КАКОГО?', 'ТЫ ЧЕЙ?', 'ТЫ С КАКОГО РАЙОНА?'][i];
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<YardFar f={f} />} farBlur={5}>
				<YardNear id={`r1s2${i}`} fence garages={false} />
				{groups.map((g, j) => (
					<Figure3D key={j} x={g.x} z={-1150} p={man(`r1s2g${i}${j}`, STRANGERS[g.k], {quilt: true, cap: STRANGER_CAP[g.k], face: HARD, breathe: f + j * 9})} />
				))}
				<Figure3D x={bx} z={-450} p={boy(`r1s2you${i}`, {backpack: true, walk: t < 30 ? t * 0.42 : undefined, headTurn: 0.5, face: {eyes: 'open', mouth: 'flat', brows: i === 2 ? 'worried' : 'neutral', look: [0.8, 0], blush: false}})} />
			</Scene3D>
			<Bubble x={Math.min(700, Math.max(380, b.x))} y={b.y - 40} text={text} from={[0, 38, 76][i] + 8} to={[36, 74, 114][i]} tail="right" dark={i === 2} />
		</AbsoluteFill>
	);
};

// at the garages: you (back to a garage door), the three strangers, Гвоздь coming in, the strangers leaving
const GarageAction: React.FC<{id: string; f: number; pockets?: number; leaving?: number; gv?: number; time?: Time}> = ({id, f, pockets = 0, leaving = 0, gv = -1, time = 'day'}) => (
	<>
		<YardNear id={id} time={time} />
		{[
			[1420, -1250],
			[2060, -1220],
			[2380, -1380],
		].map(([x, z], k) => (
			<Figure3D
				key={k}
				x={x + leaving * (1900 + k * 300)}
				z={z}
				p={man(`${id}st${k}`, STRANGERS[k], {
					quilt: k !== 1,
					cap: STRANGER_CAP[k],
					face: HARD,
					back: leaving > 0.05,
					walk: leaving > 0.05 && leaving < 1 ? f * 0.5 + k : undefined,
					breathe: f + k * 11,
					armR: k === 0 && pockets > 0 && leaving === 0 ? {target: [200, -560], bend: -1} : undefined,
				})}
			/>
		))}
		<Figure3D x={1720} z={-1300} p={boy(`${id}you`, {face: SCARED, armL: {target: [-110, -380], bend: 1}, armR: {target: [110, -380], bend: -1}, breathe: f})} />
		{pockets > 0 && (
			<Card3D x={1720} y={-160} z={-1290} w={130} h={80} anchor="center">
				<path d={`M 8,10 L 30,10 L 27,${10 + 38 * pockets} L 5,${10 + 32 * pockets} Z`} fill="#e9e4d8" />
				<path d={`M 122,10 L 100,10 L 103,${10 + 38 * pockets} L 125,${10 + 32 * pockets} Z`} fill="#e9e4d8" />
			</Card3D>
		)}
		{gv >= 0 && <Figure3D x={lerp(gv, 0, 1, 300, 1180)} z={-1180} p={gvozd(`${id}gv`, {walk: gv < 1 ? f * 0.45 : undefined, breathe: f, face: {...GV_FACE, look: [0.6, 0]}})} />}
	</>
);

// a close-up card in front of the blurred yard (palm, coin, hands)
const CloseUp: React.FC<{cam: Cam3; f: number; time?: Time; children: React.ReactNode; blur?: number}> = ({cam, f, time = 'day', children, blur = 9}) => (
	<Scene3D
		cam={cam}
		bg={skyBg(time)}
		far={
			<>
				<YardFar f={f} time={time} />
				<YardNear id={`cu${time}`} time={time} />
			</>
		}
		farBlur={blur}
	>
		{children}
	</Scene3D>
);

// 3. Three strangers corner you at the garages, turn out your pockets, take the twenty kopecks.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [112]);
	if (i === 0) {
		return (
			<Scene3D cam={{x: lerp(t, 0, 112, 1860, 1720), y: lerp(t, 0, 112, -420, -220), z: lerp(t, 0, 112, 1400, 1780), ry: lerp(t, 0, 112, -4, 2)}} bg={skyBg('day')} far={<YardFar f={t} />} farBlur={6}>
				<GarageAction id="r1s3" f={t} pockets={interpolate(t, [80, 92], [0, 1], clamp)} />
			</Scene3D>
		);
	}
	const take = lerp(t, 22, 36, 0, 1, Easing.in(Easing.cubic));
	return (
		<CloseUp cam={{x: lerp(t, 0, 60, 1760, 1680), y: -180, z: 800, rx: 6}} f={t}>
			<Card3D x={1720} y={-300} z={-120} w={800} h={1200} anchor="center" view={[-400, -600, 800, 1200]}>
				<Palm s={0.95}>
					<Coin x={0} y={take * -900} s={0.9} rot={take * 40} />
				</Palm>
				<g transform={`translate(${lerp(t, 0, 22, 700, 120) - take * 40},${lerp(t, 0, 22, -700, -260) - take * 900}) rotate(150)`}>
					<rect x={-70} y={-520} width={140} height={420} rx={30} fill={STRANGERS[0].top} />
					<ellipse cx={0} cy={-60} rx={88} ry={110} fill="#e9b892" />
				</g>
			</Card3D>
		</CloseUp>
	);
};

// 4. Гвоздь comes — the oldest of your yard. The strangers leave without looking back.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const gv = lerp(f, 13, 45, 0, 1, Easing.out(Easing.quad));
	const cam: Cam3 = {x: lerp(f, 0, 151, 1600, 1450), y: -460, z: lerp(f, 0, 151, 1350, 1450), ry: lerp(f, 0, 151, 3, -1)};
	const gp = project(cam, lerp(gv, 0, 1, 300, 1180), -620, -1180);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg={skyBg('day')} far={<YardFar f={f} />} farBlur={5}>
				<GarageAction id="r1s4" f={f} pockets={1} gv={gv} leaving={lerp(f, 95, 151, 0, 1)} />
			</Scene3D>
			{f >= 39 && <NameTag x={Math.min(760, Math.max(330, gp.x))} y={gp.y - 140} title="ГВОЗДЬ" sub="СТАРШИЙ С ТВОЕГО ДВОРА" at={39} color={YELLOW} />}
		</AbsoluteFill>
	);
};

// 5. Гвоздь gives the coin back: «Пришьёшься к нам — больше никто не тронет».
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const drop = lerp(t, 4, 18, 0, 1, Easing.in(Easing.quad));
		return (
			<CloseUp cam={{x: 1700, y: -180, z: 800, rx: 6}} f={t}>
				<Card3D x={1720} y={-300} z={-120} w={800} h={1200} anchor="center" view={[-400, -600, 800, 1200]}>
					<Palm s={0.95}>
						<Coin x={0} y={lerp(drop, 0, 1, -340, 0)} s={0.9} rot={lerp(drop, 0, 1, -60, 0)} />
					</Palm>
					<g transform={`translate(20,${lerp(t, 0, 14, -500, -420)})`}>
						<HandDown sleeve={GVOZD.top ?? "#24201d"} />
					</g>
				</Card3D>
			</CloseUp>
		);
	}
	return (
		<CloseUp cam={{x: lerp(t, 0, 74, 1080, 1020), y: -560, z: lerp(t, 0, 74, 560, 680)}} f={t} blur={8}>
			<Card3D x={1000} y={-560} z={-300} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
				<GvozdHead id="r1s5gv" t={t} s={1.9} />
			</Card3D>
		</CloseUp>
	);
};

// 6. Evening behind the garages: the guys in caps and quilted jackets. Everybody looks at you.
const DuskCircle: React.FC<{id: string; f: number; look?: number}> = ({id, f, look = 0}) => (
	<>
		<YardNear id={id} time="dusk" />
		<Lamp3D x={600} z={-1250} />
		{[
			[1180, -900],
			[1520, -1060],
			[2280, -1060],
			[2620, -900],
		].map(([x, z], k) => (
			<Figure3D
				key={k}
				x={x}
				z={z}
				p={man(`${id}g${k}`, GANG[k], {
					quilt: true,
					cap: GANG_CAP[k],
					breathe: f + k * 13,
					headTurn: look ? (1900 - x) / 1600 : k % 2 ? 0.6 : -0.6,
					face: {eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [look ? (1900 - x) / 900 : 0, 0.3 * look], blush: false},
				})}
			/>
		))}
		<Figure3D x={1900} z={-1140} p={gvozd(`${id}gv`, {breathe: f, face: {...GV_FACE, look: [0, 0.3 * look]}})} />
		<Figure3D x={1900} z={-420} p={boy(`${id}you`, {back: true, breathe: f})} />
	</>
);
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const look = interpolate(f, [108, 118], [0, 1], clamp);
	return (
		<Scene3D cam={{x: lerp(f, 0, 144, 1780, 1900), y: -540, z: lerp(f, 0, 144, 700, 980), ry: lerp(f, 0, 144, 3, 0)}} bg={skyBg('dusk')} far={<YardFar f={f} time="dusk" />} farBlur={6}>
			<DuskCircle id="r1s6" f={f} look={look} />
		</Scene3D>
	);
};

// 7. «Теперь ты наш. Правило первое: своих не сдают». (8 starts the same) — Гвоздь's hand on your shoulder
const TwoShot: React.FC<{t: number}> = ({t}) => (
	<CloseUp cam={{x: lerp(t, 0, 200, 1880, 1960), y: -540, z: 560}} f={t} time="dusk" blur={8}>
		<Card3D x={1700} y={-640} z={-420} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
			<GvozdHead id="r1s7gv" t={t} s={1.6} tilt={-4} />
		</Card3D>
		<Card3D x={2150} y={-470} z={-260} w={760} h={900} anchor="center" view={[-380, -450, 760, 900]}>
			<Bust kind="boy" id="r1s7you" x={0} y={0} scale={1.6} colors={BOY} face={{eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'raised', look: [-0.6, -0.2], blush: false}} />
			<g transform={`translate(${lerp(t, 0, 12, -420, -180)},${lerp(t, 0, 12, 600, 300)}) rotate(-50)`}>
				<rect x={-50} y={0} width={100} height={420} rx={26} fill={GVOZD.top} />
				<ellipse cx={0} cy={-8} rx={66} ry={54} fill="#e3b08a" />
			</g>
		</Card3D>
	</CloseUp>
);
export const S07: React.FC = () => <TwoShot t={useCurrentFrame()} />;

// 8. «Правило второе: слово дал — держи». And you give your word: a handshake.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [74]);
	if (i === 0) return <TwoShot t={f + 122} />;
	const sh = Math.sin(t / 3) * 14 * interpolate(t, [4, 10, 30, 40], [0, 1, 1, 0], clamp);
	return (
		<CloseUp cam={{x: lerp(t, 0, 43, 1880, 1940), y: -500, z: 700}} f={t} time="dusk" blur={9}>
			<Card3D x={1900} y={-500} z={-150} w={1300} h={800} anchor="center" view={[-650, -400, 1300, 800]}>
				<g transform={`translate(0,${sh})`}>
					<g transform="translate(-640,60) rotate(-12)">
						<rect x={0} y={-70} width={560} height={140} rx={50} fill={BOY.top} />
						<rect x={520} y={-74} width={50} height={148} rx={14} fill="#e9e4d8" />
					</g>
					<g transform="translate(650,10) rotate(12)">
						<rect x={-600} y={-80} width={600} height={160} rx={50} fill={GVOZD.top} />
					</g>
					<ellipse cx={20} cy={-10} rx={130} ry={96} fill="#e3b08a" />
					<ellipse cx={-20} cy={30} rx={110} ry={84} fill="#f6cba8" />
					<path d="M -70,-20 Q -20,-60 50,-30" stroke="#c99a76" strokeWidth={10} fill="none" />
				</g>
			</Card3D>
		</CloseUp>
	);
};

// 9. Mom asks where you were. You say nothing. You are «пацан» now. A real 3D kitchen: a box of floor, ceiling and
// three walls, the table with an oilcloth by the window, the gas stove, the ЗИЛ fridge, the lamp hanging close to the
// camera (it slides past fastest when the camera pushes in).
const KW = 650; // half the width of the kitchen
const KITCHEN_TILE = {background: '#d8e4dc', backgroundImage: 'linear-gradient(#b7cbc1 3px, transparent 3px), linear-gradient(90deg, #b7cbc1 3px, transparent 3px)', backgroundSize: '60px 60px'};
// the back wall of the kitchen — drawn in its own pass behind the room (see S09)
const KitchenBack: React.FC<{id: string; f: number}> = ({id, f}) => (
	<>
		{/* back wall: wallpaper, tiles, the window at night with curtains, the clock */}
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
			<rect x={316} y={166} width={8} height={328} fill="#5a4a3a" />
			<rect x={166} y={262} width={308} height={8} fill="#5a4a3a" />
			<rect x={140} y={500} width={360} height={22} fill="#e9e4d8" />
			<path d="M 128,138 Q 158,330 138,520 L 200,520 Q 214,330 190,138 Z" fill="#e8d6a6" />
			<path d="M 512,138 Q 482,330 502,520 L 440,520 Q 426,330 450,138 Z" fill="#e8d6a6" />
			<rect x={116} y={126} width={408} height={14} rx={7} fill="#7a6a5a" />
			<g transform="translate(-260,-120) scale(0.9)">
				<WallClock x={900} y={260} h={9} m={15} tick={f} />
			</g>
		</Card3D>
	</>
);
const Kitchen3D: React.FC<{id: string; f: number; talk: boolean; face: Face}> = ({id, f, talk, face}) => (
	<>
		{/* floor (linoleum) */}
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
		{/* ceiling, lit by the lamp */}
		<Floor3D y={-900} zNear={700} depth={1900} w={KW * 2} res={1}>
			<defs>
				<radialGradient id={`${id}ceil`} cx={0.5} cy={0.55} r={0.65}>
					<stop offset="0" stopColor="#efe6cf" />
					<stop offset="1" stopColor="#8d8676" />
				</radialGradient>
			</defs>
			<rect width={KW * 2} height={1900} fill={`url(#${id}ceil)`} />
		</Floor3D>
		{/* side walls (wallpaper above, tiles below) */}
		{[-1, 1].map((sd) => (
			<Card3D key={sd} x={sd * (KW - 950)} y={0} z={700} w={1900} h={900} ry={sd * -90} html>
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sd < 0 ? 90 : 270}deg, #b9c8b0, #a3b29a)`}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 560, bottom: 0, ...KITCHEN_TILE, filter: 'brightness(0.9)'}} />
			</Card3D>
		))}
		{/* the table by the window: the top (a real horizontal plane — you see the oilcloth from above) and the front */}
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
		{/* the gas stove, against the back wall */}
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
		{/* the ЗИЛ fridge against the right wall — a real box, you see its side */}
		<Box3D x={520} y={0} z={-760} w={240} h={560} d={260} side="#cfcdc5" sideOn="left">
			<rect x={0} y={0} width={240} height={560} rx={30} fill="#f1efe8" />
			<rect x={0} y={0} width={240} height={560} rx={30} fill="none" stroke="#d8d5cc" strokeWidth={6} />
			<rect x={22} y={180} width={14} height={110} rx={7} fill="#b9bcc0" />
			<text x={120} y={80} textAnchor="middle" fontFamily="serif" fontStyle="italic" fontWeight={700} fontSize={36} fill="#b9bcc0">
				ЗИЛ
			</text>
		</Box3D>
		{/* mom by the window, hands on hips */}
		<Figure3D x={-110} z={-1000} p={{kind: 'mom', id: `${id}mom`, scale: 0.48, breathe: f, face: {eyes: 'open', mouth: talk ? (Math.floor(f / 5) % 2 ? 'open' : 'flat') : 'frown', brows: 'worried', look: [0.8, 0]}, armL: {target: [-90, -560], bend: 1}, armR: {target: [90, -560], bend: -1}}} />
		<Figure3D x={280} z={-380} p={boy(`${id}you`, {breathe: f, face})} />
		{/* the lamp: a cord and an orange shade, hanging close to the camera */}
		<Card3D x={0} y={-600} z={-300} w={300} h={300}>
			<line x1={150} y1={0} x2={150} y2={200} stroke="#3a3330" strokeWidth={5} />
			<circle cx={150} cy={262} r={150} fill="#ffe7a0" opacity={0.16} />
			<path d="M 98,200 L 202,200 L 250,274 L 50,274 Z" fill="#e2803a" />
			<path d="M 98,200 L 202,200 L 214,218 L 86,218 Z" fill="#c4672a" />
			<ellipse cx={150} cy={276} rx={40} ry={12} fill="#fff4cc" />
		</Card3D>
	</>
);
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const push = lerp(f, 70, 104, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam3 = {x: lerp(push, 0, 1, lerp(f, 0, 70, -80, 30), 280), y: lerp(push, 0, 1, -430, -390), z: lerp(push, 0, 1, 640, 1050)};
	const b = project(cam, -110, -560, -1000);
	return (
		<AbsoluteFill>
			<Scene3D cam={cam} bg="#1a1520" far={<KitchenBack id="r1s9" f={f} />} farBlur={0}>
				<Kitchen3D id="r1s9" f={f} talk={f >= 26 && f < 46} face={{eyes: 'open', mouth: 'flat', brows: 'flat', look: [push > 0.5 ? 0 : -0.8, 0.2], blush: false}} />
			</Scene3D>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 50%, rgba(0,0,0,0.5) 100%)'}} />
			<Bubble x={Math.max(300, b.x + 40)} y={b.y - 60} text="ГДЕ ТЫ БЫЛ?" from={26} to={64} tail="left" />
		</AbsoluteFill>
	);
};

// 10. A week later Гвоздь says: «Завтра идём на Заводских. Ты — с нами».
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [96]);
	if (i === 0) {
		const cam: Cam3 = {x: lerp(t, 0, 96, 1280, 1360), y: -500, z: lerp(t, 0, 96, 900, 1020), rx: -4};
		const lab = project(cam, 1300, -8200, -20000);
		return (
			<AbsoluteFill>
				<Scene3D cam={cam} bg={skyBg('day')} far={<YardFar f={t} />} farBlur={4}>
					<YardNear id="r1s10" />
					<Figure3D x={1050} z={-950} p={gvozd('r1s10gv', {breathe: t, headTurn: 0.4, face: {...GV_FACE, mouth: Math.floor(t / 5) % 2 && t >= 46 && t < 82 ? 'open' : 'smile', look: [0.5, -0.6]}, armR: {target: [520, -880], bend: 1}})} />
					<Figure3D x={1600} z={-800} p={boy('r1s10you', {breathe: t, face: {eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'worried', look: [-0.6, -0.2], blush: false}})} />
				</Scene3D>
				{t >= 70 && <NameTag x={Math.min(740, Math.max(340, lab.x))} y={Math.max(280, lab.y + 60)} title="ЗАВОДСКИЕ" sub="СОСЕДНИЙ ДВОР" at={70} color={RED} />}
			</AbsoluteFill>
		);
	}
	// «Ты — с нами»: he points at you
	return (
		<CloseUp cam={{x: 1060, y: -560, z: lerp(t, 0, 20, 560, 640)}} f={t} blur={8}>
			<Card3D x={1000} y={-560} z={-300} w={900} h={1000} anchor="center" view={[-450, -500, 900, 1000]}>
				<GvozdHead id="r1s10cu" t={t} s={1.9} face={{...GV_FACE, brows: 'angry'}} />
			</Card3D>
			<Card3D x={1260} y={-260} z={lerp(t, 0, 8, -100, 120)} w={400} h={900} anchor="center" view={[-200, -450, 400, 900]}>
				<rect x={-80} y={0} width={160} height={600} rx={40} fill="#24201d" />
				<ellipse cx={0} cy={-20} rx={90} ry={80} fill="#e3b08a" />
				<rect x={-22} y={-200} width={44} height={170} rx={22} fill="#e3b08a" />
			</Card3D>
		</CloseUp>
	);
};

// 11. Заводские is the next yard; Санька lives there — your best friend since the first grade.
const ZavodFar: React.FC<{f: number}> = ({f}) => (
	<>
		<Card3D x={1200} y={0} z={-9000} w={6000} h={9000} res={5}>
			<FactoryArt f={f} />
		</Card3D>
		<Box3D x={-1700} y={0} z={-4600} w={5000} h={4400} d={3600} side="#a39b88" res={3}>
			<Facade w={5000} h={4400} color="#cbbfa6" seed={11} cols={7} />
		</Box3D>
		<Box3D x={4300} y={0} z={-6200} w={5000} h={4400} d={3600} side="#9a9382" sideOn="left" res={3}>
			<Facade w={5000} h={4400} color="#c2b8a2" seed={17} cols={7} />
		</Box3D>
		{[
			[-300, -2600, 4],
			[2300, -3400, 5],
		].map(([x, z, k]) => (
			<Card3D key={k} x={x} y={0} z={z} w={1000} h={2600} res={2}>
				<TreeArt f={f} seed={k} />
			</Card3D>
		))}
	</>
);
const FirstGrade: React.FC<{t: number}> = ({t}) => (
	<div style={{position: 'absolute', inset: 0, background: '#f2ede2', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', padding: 34, boxSizing: 'border-box'}}>
		<div style={{position: 'relative', width: 732, height: 700, overflow: 'hidden', background: '#bfb8a8', filter: 'grayscale(1) sepia(0.35) contrast(1.05)'}}>
			<svg width={732} height={700} viewBox="0 0 732 700">
				<GlobalDefs />
				<rect x={0} y={0} width={732} height={420} fill="#d8d2c4" />
				<rect x={0} y={420} width={732} height={280} fill="#a59e8e" />
				<rect x={40} y={60} width={652} height={300} fill="#c4bcaa" />
				{Array.from({length: 4}).map((_, k) => (
					<rect key={k} x={80 + k * 160} y={110} width={90} height={160} fill="#8e877a" />
				))}
				<Person kind="boy" id="r1s11p0" x={230} y={760} scale={0.6} colors={BOY} plain face={{eyes: 'happy', mouth: 'smile', brows: 'raised', look: [0, 0], blush: false}} armR={{target: [70, -520], bend: -1}} />
				<Person kind="teen" id="r1s11p1" x={500} y={760} scale={0.58} colors={SANKA} plain face={{eyes: 'happy', mouth: 'smile', brows: 'raised', look: [0, 0], blush: false, glasses: false}} armR={{target: [70, -520], bend: -1}} />
				{[230, 500].map((x) => (
					<g key={x} transform={`translate(${x + 50},${760 - 520 * 0.6 + 100}) scale(0.6)`}>
						<rect x={-4} y={-260} width={8} height={300} fill="#4a5a3a" />
						{[0, 1, 2, 3, 4].map((j) => (
							<circle key={j} cx={j % 2 ? 14 : -14} cy={-250 + j * 40} r={24} fill="#e8e0d0" />
						))}
					</g>
				))}
			</svg>
		</div>
		<div style={{position: 'absolute', left: 34, bottom: 34, fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: '#3a3a5a'}}>1 сентября 1970</div>
		<div style={{position: 'absolute', left: 200, top: 74, transform: `scale(${pop(t, 8, 10)})`, background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '4px 18px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff'}}>ТЫ</div>
		<div style={{position: 'absolute', left: 410, top: 74, transform: `scale(${pop(t, 14, 10)})`, background: '#111', border: `5px solid ${RED}`, borderRadius: 14, padding: '4px 18px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff'}}>САНЬКА</div>
	</div>
);
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	if (i === 0) {
		const cam: Cam3 = {x: lerp(t, 0, 84, -600, -1200), y: lerp(t, 0, 84, -800, -1150), z: lerp(t, 0, 84, -200, 700), rx: -6};
		const win = project(cam, -2230, -1560, -4590);
		return (
			<AbsoluteFill>
				<Scene3D cam={cam} bg={skyBg('day')} far={<ZavodFar f={t} />} farBlur={lerp(t, 0, 84, 3, 1.5)}>
					<YardNear id="r1s11" garages={false} />
					<Card3D x={-2230} y={-1560} z={-4580} w={320} h={300} anchor="center">
						<rect x={40} y={40} width={240} height={220} fill="#ffd27a" opacity={0.95} />
						<rect x={40} y={40} width={240} height={220} fill="none" stroke={RED} strokeWidth={14} opacity={interpolate(t, [56, 64], [0, 1], clamp)} />
					</Card3D>
				</Scene3D>
				{t >= 4 && <NameTag x={540} y={360} title="ЗАВОДСКИЕ" at={4} color={RED} />}
				{t >= 56 && <NameTag x={Math.min(760, Math.max(320, win.x))} y={Math.max(480, win.y - 200)} title="САНЬКА" sub="ЖИВЁТ ЗДЕСЬ" at={56} pin={110} color={RED} />}
			</AbsoluteFill>
		);
	}
	// the old photo on the table, the camera drifting over it
	return (
		<Scene3D cam={{x: lerp(t, 0, 54, -60, 60), y: lerp(t, 0, 54, -40, 20), z: lerp(t, 0, 54, 100, 220)}} bg="radial-gradient(circle at 50% 45%, #3a2a1a 0%, #120c08 70%)">
			<Card3D x={0} y={-270} z={-200} w={800} h={900} anchor="center" ry={lerp(t, 0, 54, -8, 6)} html>
				<FirstGrade t={t} />
			</Card3D>
		</Scene3D>
	);
};

// 12. At night — a knock on the window. It's Санька: «Я слышал… Ты правда теперь с ними?»
// The window frame is close (sharp), Санька just behind the glass, the night yard far (blurred).
const NightWindow: React.FC<{id: string; f: number; knock?: number; push?: number}> = ({id, f, knock = 0, push = 0}) => {
	const cam: Cam3 = {x: lerp(push, 0, 1, -60, 190), y: -880, z: lerp(push, 0, 1, 250, 760)};
	const talk = Math.floor(f / 6) % 2 === 1 && f > 66 && f < 120;
	return (
		<Scene3D cam={cam} bg={`radial-gradient(circle at 72% 22%, #f4f0d8 0 2.2%, rgba(244,240,216,0.15) 3%, transparent 6%), ${skyBg('night')}`} far={<YardFar f={f} time="night" />} farBlur={6}>
			{/* Санька outside, pressed to the glass */}
			<Card3D x={180} y={-900} z={-420} w={800} h={900} anchor="center" view={[-400, -450, 800, 900]}>
				<Bust kind="teen" id={`${id}sanka`} x={0} y={60} scale={1.55} colors={SANKA_NIGHT} plain face={{eyes: 'wide', pupil: 0.6, mouth: talk ? 'open' : 'flat', brows: 'worried', look: [0, 0.1], blush: false, glasses: false}} />
				{knock > 0 && (
					<g transform={`translate(210,${-40 - 16 * Math.max(0, Math.sin(f * 1.4)) * knock})`}>
						<ellipse cx={0} cy={0} rx={56} ry={64} fill="#f2c3a0" />
						<rect x={-50} y={40} width={100} height={300} rx={30} fill={SANKA_NIGHT.top} />
					</g>
				)}
			</Card3D>
			{/* the wall of your room with the window opening, frame and sill */}
			<Card3D x={0} y={-900} z={-160} w={2400} h={2600} anchor="center" view={[-1200, -1300, 2400, 2600]}>
				<path d="M -1200,-1300 H 1200 V 1300 H -1200 Z M -420,-560 V 520 H 420 V -560 Z" fill="#1c2236" fillRule="evenodd" />
				<rect x={-440} y={-580} width={880} height={1120} fill="none" stroke="#4a3a2a" strokeWidth={40} />
				<rect x={-12} y={-560} width={24} height={1080} fill="#4a3a2a" />
				<rect x={-420} y={-340} width={840} height={22} fill="#4a3a2a" />
				<rect x={-420} y={-560} width={840} height={1080} fill="#9fb4ff" opacity={0.06} />
				<rect x={-500} y={530} width={1000} height={60} fill="#6a5a4a" />
			</Card3D>
		</Scene3D>
	);
};
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#0b0f1e'}}>
			<NightWindow id="r1s12" f={f} knock={interpolate(f, [12, 16, 30, 36], [0, 1, 1, 0], clamp)} push={lerp(f, 30, 120, 0, 1, Easing.inOut(Easing.cubic))} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
		</AbsoluteFill>
	);
};

// 13. Finale: go with your own — against your friend? Or warn Санька and break your word?
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="СЕРИЯ 2"
			series="ТЫ С КАКОГО РАЙОНА?"
			boxes={3}
			boxLabel="ПОНЯТИЯ"
			opt1={{text: 'ПОЙТИ СО СВОИМИ', sub: 'против друга'}}
			opt2={{text: 'ПРЕДУПРЕДИТЬ САНЬКУ', sub: 'и нарушить слово'}}
			tallyLine={
				<>
					ПОНЯТИЙ: <span style={{color: '#7ee08a'}}>2</span> · ДАЛЬШЕ — <span style={{color: YELLOW}}>ВЫБИРАЕШЬ ТЫ</span>
				</>
			}
			bg={
				<AbsoluteFill>
					<NightWindow id="r1s13" f={f} push={1} />
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
				</AbsoluteFill>
			}
		/>
	);
};
