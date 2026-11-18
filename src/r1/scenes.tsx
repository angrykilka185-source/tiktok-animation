// «Ты с какого района?» — серия 1 «Двадцать копеек». 1976: хрущёвки, гаражи, кирпичный завод; тебе 13, ты в школьной
// форме с пионерским галстуком. Чужие отбирают 20 копеек, Гвоздь возвращает монету — и ты пришиваешься к пацанам.
// 13 shots on the timeline of src/r1/timeline.ts (= the voice, see scripts/fit-voiceover.py --part r1).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {ArmPose, Bust, Colors, Face, Person} from '../components/Person';
import {GlobalDefs, PlankFloor, Tiles, Wallpaper, WallClock} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';

const {YELLOW, RED, rnd} = G1;
const {Finale} = G2;

// ============================================================ people ======
// you: 13, school uniform (navy jacket, white collar, red pioneer tie)
const YOU: Colors = {top: '#2c3a66', topDark: '#222e52', pants: '#2c3a66', shoes: '#1a1a1e'};
// Санька: the same uniform, fair hair
const SANKA: Colors = {...YOU, hair: '#e2bd62'};
// the older guys of your yard — quilted jackets and caps; Гвоздь in a black leather jacket
const GVOZD: Colors = {top: '#24201d', topDark: '#151210', pants: '#2b2d33', shoes: '#111216', hair: '#1f1a1a', skin: '#e3b08a'};
const GANG: Colors[] = [
	{top: '#3d4436', topDark: '#2c3127', pants: '#2b2d33', shoes: '#111216', hair: '#3a2a20'},
	{top: '#4a4d52', topDark: '#36383c', pants: '#2b2d33', shoes: '#111216', hair: '#5a3a2a'},
	{top: '#383f4a', topDark: '#282e36', pants: '#33302c', shoes: '#111216', hair: '#2a1a12'},
	{top: '#4a3d33', topDark: '#362c24', pants: '#2b2d33', shoes: '#111216', hair: '#8a5a32'},
];
const GANG_CAP = ['#3a3a3a', '#4a3a2a', '#2f3640', '#3b3226'];
// the three strangers
const STRANGERS: Colors[] = [
	{top: '#5a2a2a', topDark: '#431f1f', pants: '#2b2d33', shoes: '#111216', hair: '#2a1a12'},
	{top: '#2a3a5a', topDark: '#1f2b43', pants: '#33302c', shoes: '#111216', hair: '#3a2a20'},
	{top: '#3a4a2a', topDark: '#2b371f', pants: '#2b2d33', shoes: '#111216', hair: '#1f1a1a'},
];
const STRANGER_CAP = ['#2a2a2a', '#3a2a2a', '#22262c'];
const HARD: Face = {eyes: 'narrow', mouth: 'grin', brows: 'angry', look: [0, 0.2], stubble: false, blush: false};
const SCARED: Face = {eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'worried', look: [0, 0], blush: false};

const You: React.FC<{id: string; x: number; y: number; s: number; f: number; face?: Face; back?: boolean; walk?: number; armL?: ArmPose; armR?: ArmPose; headTurn?: number; satchel?: boolean; pockets?: number}> = ({
	id,
	x,
	y,
	s,
	f,
	face = {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0, 0], blush: false},
	back,
	walk,
	armL,
	armR,
	headTurn,
	satchel = true,
	pockets = 0,
}) => (
	<g>
		<Person kind="son" id={id} x={x} y={y} scale={s} colors={YOU} plain pioneer face={face} back={back} walk={walk} armL={armL} armR={armR} headTurn={headTurn} breathe={f} backpack={satchel} />
		{pockets > 0 && (
			<g transform={`translate(${x},${y - 330 * s}) scale(${s})`} opacity={Math.min(1, pockets)}>
				<path d={`M -96,0 L -70,0 L -76,${40 * pockets} L -102,${34 * pockets} Z`} fill="#e9e4d8" />
				<path d={`M 96,0 L 70,0 L 76,${40 * pockets} L 102,${34 * pockets} Z`} fill="#e9e4d8" />
			</g>
		)}
	</g>
);

// ============================================================ the yard ====
// a five-storey «хрущёвка»; (x, y) = bottom-left corner on the ground
const Khrush: React.FC<{x: number; y: number; w: number; color?: string; lit?: number; seed?: number}> = ({x, y, w, color = '#d6cdb8', lit = 0, seed = 1}) => {
	const cols = Math.max(3, Math.floor(w / 110));
	const fh = 112;
	const h = fh * 5 + 40;
	const cw = w / cols;
	return (
		<g>
			<rect x={x} y={y - h} width={w} height={h} fill={color} />
			<rect x={x - 8} y={y - h - 14} width={w + 16} height={18} fill="#8a8478" />
			{Array.from({length: 5}).flatMap((_, fl) =>
				Array.from({length: cols}).map((__, c) => {
					const wx = x + c * cw + cw * 0.22;
					const wy = y - h + 40 + fl * fh;
					const on = lit > 0 && rnd(seed * 31 + fl * 7 + c) > 0.45;
					return (
						<g key={`${fl}-${c}`}>
							<rect x={wx - 4} y={wy - 4} width={cw * 0.56 + 8} height={70} fill="#7d776a" />
							<rect x={wx} y={wy} width={cw * 0.56} height={62} fill={on ? '#ffd27a' : lit > 0 ? '#273047' : '#8fa6b8'} opacity={on ? 0.6 + 0.4 * lit : 1} />
							<rect x={wx + cw * 0.27} y={wy} width={4} height={62} fill="#7d776a" />
							{c % 2 === 1 && fl > 0 && <rect x={wx - 12} y={wy + 62} width={cw * 0.56 + 24} height={14} fill="#a39c8c" />}
						</g>
					);
				}),
			)}
			{[0.25, 0.75].map((k) => (
				<g key={k}>
					<rect x={x + w * k - 34} y={y - 120} width={68} height={120} fill="#5a4a3a" />
					<rect x={x + w * k - 50} y={y - 136} width={100} height={18} fill="#8a8478" />
				</g>
			))}
		</g>
	);
};

// a row of metal garages; (x, y) = bottom-left on the ground
const Garages: React.FC<{x: number; y: number; n: number; w?: number; first?: number}> = ({x, y, n, w = 200, first = 41}) => (
	<g>
		{Array.from({length: n}).map((_, k) => {
			const gx = x + k * w;
			const paint = ['#5a6a5a', '#6a5a4a', '#56606a', '#6a6450'][k % 4];
			return (
				<g key={k}>
					<rect x={gx} y={y - 230} width={w - 6} height={230} fill="#4a4f5a" />
					<rect x={gx - 4} y={y - 246} width={w + 2} height={18} fill="#3a3f48" />
					<rect x={gx + 14} y={y - 200} width={(w - 34) / 2} height={200} fill={paint} />
					<rect x={gx + 18 + (w - 34) / 2} y={y - 200} width={(w - 34) / 2} height={200} fill={paint} />
					<rect x={gx + 20} y={y - 120} width={30} height={60} fill="#8a5a3a" opacity={0.35} />
					<text x={gx + w / 2} y={y - 160} fontSize={30} fontFamily={HEAVY} fontWeight={900} fill="#e9e4d8" textAnchor="middle" opacity={0.8}>
						{first + k}
					</text>
				</g>
			);
		})}
	</g>
);

// the brick factory chimney with smoke; (x, y) = bottom centre
const Chimney: React.FC<{x: number; y: number; h: number; f: number}> = ({x, y, h, f}) => (
	<g>
		<path d={`M ${x - 46},${y} L ${x - 26},${y - h} L ${x + 26},${y - h} L ${x + 46},${y} Z`} fill="#a4533a" />
		{[0.82, 0.9].map((k) => (
			<rect key={k} x={x - 30} y={y - h * k - 10} width={60} height={14} fill="#e9e4d8" opacity={0.85} />
		))}
		{Array.from({length: 8}).map((_, k) => {
			const t = ((f + k * 22) % 176) / 176;
			return <circle key={k} cx={x + 40 * t + 60 * t * t} cy={y - h - 30 - 260 * t} r={22 + 70 * t} fill="#c9c6c0" opacity={0.55 * (1 - t)} />;
		})}
		<rect x={x - 180} y={y - 160} width={360} height={160} fill="#8a4a36" />
		{Array.from({length: 5}).map((_, k) => (
			<rect key={k} x={x - 160 + k * 70} y={y - 120} width={40} height={50} fill="#4a3a30" />
		))}
	</g>
);

const Tree: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(f / 30 + x) * 1.5})`}>
		<rect x={-12} y={-300} width={24} height={300} fill="#5a3f2a" />
		{[
			[-60, -330, 90, '#d9a23a'],
			[50, -350, 100, '#c9782a'],
			[0, -420, 110, '#e0b44a'],
			[-30, -260, 70, '#b8682a'],
		].map(([cx, cy, r, c], k) => (
			<circle key={k} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />
		))}
	</g>
);

const Lamp: React.FC<{x: number; y: number; on?: number}> = ({x, y, on = 0}) => (
	<g>
		<rect x={x - 8} y={y - 520} width={16} height={520} fill="#7d7a72" />
		<path d={`M ${x},${y - 510} Q ${x + 10},${y - 560} ${x + 80},${y - 556}`} stroke="#7d7a72" strokeWidth={12} fill="none" />
		<path d={`M ${x + 60},${y - 560} L ${x + 104},${y - 560} L ${x + 96},${y - 540} L ${x + 68},${y - 540} Z`} fill="#5a5850" />
		{on > 0 && (
			<g opacity={on}>
				<ellipse cx={x + 82} cy={y - 538} rx={18} ry={6} fill="#fff1c0" />
				<path d={`M ${x + 66},${y - 538} L ${x + 98},${y - 538} L ${x + 260},${y} L ${x - 96},${y} Z`} fill="#ffe7a0" opacity={0.18} />
			</g>
		)}
	</g>
);

type Time = 'day' | 'dusk' | 'night';
const SKY: Record<Time, [string, string]> = {day: ['#a9c3d8', '#e7e2d2'], dusk: ['#3a3460', '#d9825a'], night: ['#070b1e', '#1c2448']};
// the whole yard: sky, the factory far away, two хрущёвки, trees, garages on the right, a bench, the ground
const Yard76: React.FC<{id: string; f: number; time?: Time; garages?: boolean}> = ({id, f, time = 'day', garages = true}) => {
	const lit = time === 'day' ? 0 : time === 'dusk' ? 0.7 : 1;
	return (
		<g>
			<defs>
				<linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={SKY[time][0]} />
					<stop offset="1" stopColor={SKY[time][1]} />
				</linearGradient>
			</defs>
			<rect x={-800} y={-800} width={2700} height={2400} fill={`url(#${id}sky)`} />
			<Chimney x={900} y={1040} h={760} f={f} />
			<Khrush x={-160} y={1420} w={720} color={time === 'day' ? '#d6cdb8' : '#8f8778'} lit={lit} seed={3} />
			<Khrush x={620} y={1300} w={560} color={time === 'day' ? '#c9c2b0' : '#7f786a'} lit={lit} seed={7} />
			<Tree x={60} y={1500} s={1.1} f={f} />
			<Tree x={600} y={1480} s={0.9} f={f} />
			<rect x={-800} y={1420} width={2700} height={900} fill={time === 'day' ? '#8a8478' : '#3a3a40'} />
			<rect x={-800} y={1500} width={2700} height={800} fill={time === 'day' ? '#6f6a60' : '#2c2c33'} />
			{garages && <Garages x={560} y={1520} n={4} />}
			<g>
				<rect x={180} y={1560} width={200} height={16} fill="#7a5a3a" />
				<rect x={190} y={1576} width={12} height={50} fill="#4a4a4a" />
				<rect x={358} y={1576} width={12} height={50} fill="#4a4a4a" />
			</g>
			{Array.from({length: 14}).map((_, k) => (
				<ellipse key={k} cx={-100 + rnd(k + 3) * 1300} cy={1540 + rnd(k + 9) * 360} rx={14} ry={7} fill={['#d9a23a', '#c9782a', '#b8682a'][k % 3]} opacity={0.8} />
			))}
			{time !== 'day' && <rect x={-800} y={-800} width={2700} height={2400} fill="#0b1638" opacity={time === 'dusk' ? 0.25 : 0.45} />}
		</g>
	);
};

// the 20-kopeck coin
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

// a close-up open palm (you), seen from above, with a jacket cuff
const Palm: React.FC<{x: number; y: number; s: number; children?: React.ReactNode}> = ({x, y, s, children}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-130} y={170} width={260} height={500} rx={40} fill={YOU.top} />
		<rect x={-120} y={150} width={240} height={40} rx={12} fill="#e9e4d8" />
		<ellipse cx={0} cy={60} rx={150} ry={150} fill="#f2c3a0" />
		{[-90, -30, 30, 90].map((fx, k) => (
			<rect key={k} x={fx - 28} y={-250 + Math.abs(fx) * 0.5} width={56} height={240} rx={28} fill="#f2c3a0" />
		))}
		<rect x={-220} y={-40} width={56} height={180} rx={28} fill="#f2c3a0" transform="rotate(-38 -192 50)" />
		{children}
	</g>
);

// ============================================================== SHOTS =======
// 1. 1976. You are thirteen. Your yard — хрущёвки, garages and the brick factory.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const out = lerp(f, 40, 100, 0, 1, Easing.inOut(Easing.cubic));
	const cam: Cam = {s: lerp(out, 0, 1, 1.7, 1.0), cx: lerp(out, 0, 1, 420, 540), cy: lerp(out, 0, 1, 1180, 960)};
	const p = (at: number) => pop(f, at, 10);
	const tag = (x: number, y: number) => toScreen(cam, x, y);
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0.2, vignette: 0.6}} bg="#a9c3d8">
				<Yard76 id="r1s1" f={f} />
				<You id="r1s1you" x={420} y={1860} s={0.95} f={f} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.3, 0], blush: false}} />
			</Stage>
			{/* the year */}
			<div style={{position: 'absolute', top: 380, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: interpolate(f, [4, 10, 40, 48], [0, 1, 1, 0], clamp)}}>
				<div style={{fontSize: 220, lineHeight: 1, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.45)', transform: `scale(${p(4)})`}}>1976</div>
				<div style={{fontSize: 46, letterSpacing: 12, color: YELLOW, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>ОКТЯБРЬ</div>
			</div>
			{f >= 49 && f < 100 && <NameTag x={tag(420, 960).x} y={tag(420, 960).y - 120} title="ТЫ" sub="13 ЛЕТ" at={49} pin={60} color={YELLOW} to={100} />}
			{f >= 103 && <NameTag x={Math.max(250, tag(240, 900).x)} y={tag(240, 900).y} title="ХРУЩЁВКИ" at={103} color="#e9e4d8" />}
			{f >= 120 && <NameTag x={tag(860, 1150).x} y={tag(860, 1150).y} title="ГАРАЖИ" at={120} color="#9fb4c8" />}
			{f >= 140 && <NameTag x={Math.min(690, tag(900, 520).x)} y={tag(900, 520).y} title="КИРПИЧНЫЙ ЗАВОД" at={140} color="#e08a5a" />}
		</AbsoluteFill>
	);
};

// 2. And every day on the way from school: «Ты с какого района?»
const Fence: React.FC<{id: string; f: number}> = ({id, f}) => (
	<g>
		<rect x={-800} y={-800} width={2700} height={2400} fill="#b8c6d2" />
		<Khrush x={-200} y={1100} w={600} seed={11} />
		<Khrush x={560} y={1060} w={620} color="#c9c2b0" seed={13} />
		{/* the concrete fence with its diamond pattern */}
		<rect x={-800} y={1100} width={2700} height={420} fill="#b7b2a6" />
		{Array.from({length: 18}).map((_, k) => (
			<g key={k}>
				<rect x={-800 + k * 160} y={1100} width={8} height={420} fill="#8f8a7e" />
				<path d={`M ${-720 + k * 160},1180 l 50,60 l -50,60 l -50,-60 Z`} fill="none" stroke="#9a9588" strokeWidth={6} />
				<path d={`M ${-720 + k * 160},1330 l 50,60 l -50,60 l -50,-60 Z`} fill="none" stroke="#9a9588" strokeWidth={6} />
			</g>
		))}
		<rect x={-800} y={1520} width={2700} height={800} fill="#6f6a60" />
		{Array.from({length: 10}).map((_, k) => (
			<ellipse key={k} cx={-100 + rnd(k + 33) * 1300} cy={1560 + rnd(k + 19) * 300} rx={14} ry={7} fill={['#d9a23a', '#c9782a'][k % 2]} opacity={0.8} />
		))}
		<rect x={-800} y={-800} width={2700} height={2400} fill={id === 'b' ? '#a05a2a' : '#000'} opacity={0.05} />
	</g>
);
const Lean: React.FC<{id: string; x: number; f: number; k: number; face?: Face}> = ({id, x, f, k, face = HARD}) => (
	<Person kind="dad" id={id} x={x} y={1640} scale={0.82} plain quilt cap={GANG_CAP[k % 4]} colors={STRANGERS[k % 3]} face={face} breathe={f + k * 9} armL={k % 2 ? {target: [-120, -560], bend: 1} : undefined} armR={k % 2 ? {target: [120, -560], bend: -1} : undefined} />
);
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [38, 76]);
	const walkX = lerp(t, 0, 40, -120, 120);
	const bubbles = [
		{text: 'С КАКОГО?', from: 6},
		{text: 'ТЫ ЧЕЙ?', from: 6},
		{text: 'ТЫ С КАКОГО РАЙОНА?', from: 10},
	];
	const b = bubbles[i];
	return (
		<AbsoluteFill>
			<Stage cam={{s: i === 2 ? lerp(t, 0, 38, 1.15, 1.25) : 1.05, cx: 540 + (i === 1 ? 80 : 0), cy: 1150}} light={{glow: 0.15, vignette: 0.6}} bg="#b8c6d2">
				<Fence id={['a', 'b', 'c'][i]} f={f} />
				{i !== 1 && <Lean id={`r1s2a${i}`} x={i === 2 ? 760 : 820} f={f} k={i} />}
				{i !== 0 && <Lean id={`r1s2b${i}`} x={i === 2 ? 990 : 260} f={f} k={i + 1} />}
				{i === 2 && <Lean id="r1s2c" x={590} f={f} k={2} />}
				<You id={`r1s2you${i}`} x={(i === 2 ? 330 : 380) + walkX} y={1820} s={0.95} f={f} walk={i === 2 && t > 30 ? undefined : t * 0.42} headTurn={0.5} face={{eyes: 'open', mouth: 'flat', brows: i === 2 ? 'worried' : 'neutral', look: [0.8, 0], blush: false}} />
			</Stage>
			<Bubble x={i === 1 ? 330 : 560} y={i === 2 ? 560 : 640} text={b.text} from={[0, 38, 76][i] + b.from} to={[36, 74, 114][i]} tail={i === 1 ? 'left' : 'right'} dark={i === 2} />
		</AbsoluteFill>
	);
};

// 3. Three strangers corner you at the garages, turn out your pockets, take the twenty kopecks for bread.
const GarageCorner: React.FC<{id: string; f: number; pockets?: number; leaving?: number; gvozd?: number; time?: Time}> = ({id, f, pockets = 0, leaving = 0, gvozd = -1, time = 'day'}) => (
	<g>
		<Yard76 id={`${id}y`} f={f} time={time} garages={false} />
		<Garages x={-120} y={1560} n={6} w={230} first={14} />
		{/* the strangers, around you — they turn and walk away when Гвоздь comes */}
		{STRANGERS.map((c, k) => {
			const bx = [190, 820, 980][k];
			const x = bx + leaving * (520 + k * 80);
			return (
				<Person
					key={k}
					kind="dad"
					id={`${id}st${k}`}
					x={x}
					y={1880 + (k === 0 ? 0 : 20)}
					scale={0.95}
					plain
					quilt={k !== 1}
					cap={STRANGER_CAP[k]}
					colors={c}
					face={HARD}
					back={leaving > 0.05}
					walk={leaving > 0.05 && leaving < 1 ? f * 0.5 + k : undefined}
					breathe={f + k * 11}
					armR={k === 0 && pockets > 0 && leaving === 0 ? {target: [200, -560], bend: -1} : undefined}
				/>
			);
		})}
		<You id={`${id}you`} x={520} y={1840} s={0.95} f={f} satchel={false} pockets={pockets} face={SCARED} armL={{target: [-110, -380], bend: 1}} armR={{target: [110, -380], bend: -1}} />
		{gvozd >= 0 && (
			<Person kind="dad" id={`${id}gv`} x={lerp(gvozd, 0, 1, -260, 230)} y={1900} scale={1.0} plain cap="#2a2a2a" colors={GVOZD} walk={gvozd < 1 ? f * 0.45 : undefined} breathe={f} face={{eyes: 'narrow', mouth: 'smile', brows: 'flat', look: [0.6, 0], blush: false}} />
		)}
	</g>
);
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [112]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 112, 1.25, 1.4) * kick(t), cx: 560, cy: 1300}} light={{glow: 0.1, vignette: 0.75}} bg="#a9c3d8">
				<GarageCorner id="r1s3" f={t} pockets={interpolate(t, [80, 92], [0, 1], clamp)} />
			</Stage>
		);
	}
	// the coin taken from your palm
	const take = lerp(t, 22, 36, 0, 1, Easing.in(Easing.cubic));
	return (
		<AbsoluteFill style={{background: '#6f6a60', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={0} width={1080} height={1920} fill="#6f6a60" />
				<Palm x={540} y={1180} s={1.6}>
					<Coin x={0} y={take * -900} s={0.9} rot={take * 40} />
				</Palm>
				{/* a stranger's hand coming for it */}
				<g transform={`translate(${lerp(t, 0, 22, 1300, 620) - take * 40},${lerp(t, 0, 22, 300, 860) - take * 900}) rotate(150)`}>
					<rect x={-70} y={-520} width={140} height={420} rx={30} fill={STRANGERS[0].top} />
					<ellipse cx={0} cy={-60} rx={88} ry={110} fill="#e9b892" />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 4. Then Гвоздь comes — the oldest of your yard. The strangers leave without looking back.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: 1.2, cx: 520, cy: 1300};
	const gp = toScreen(cam, lerp(lerp(f, 13, 45, 0, 1), 0, 1, -260, 230), 960);
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0.1, vignette: 0.75}} bg="#a9c3d8">
				<GarageCorner id="r1s4" f={f} pockets={1} gvozd={lerp(f, 13, 45, 0, 1, Easing.out(Easing.quad))} leaving={lerp(f, 95, 151, 0, 1)} />
			</Stage>
			{f >= 39 && <NameTag x={Math.max(330, gp.x)} y={gp.y - 210} title="ГВОЗДЬ" sub="СТАРШИЙ С ТВОЕГО ДВОРА" at={39} color={YELLOW} />}
		</AbsoluteFill>
	);
};

// 5. Гвоздь gives the coin back: «Пришьёшься к нам — больше никто не тронет».
const GvozdBust: React.FC<{id: string; t: number; x?: number; y?: number; s?: number; face?: Face; tilt?: number}> = ({id, t, x = 540, y = 900, s = 3.2, face, tilt = 0}) => (
	<g>
		<Bust kind="dad" id={id} x={x} y={y} scale={s} tilt={tilt} colors={GVOZD} face={face ?? {eyes: 'narrow', mouth: 'smile', brows: 'flat', look: [0, 0.1], blush: false}} />
		{/* the cap and a match between his teeth */}
		<g transform={`translate(${x},${y}) scale(${s}) rotate(${tilt})`}>
			<path d="M -90,-31 C -96,-135 96,-135 90,-31 Q 0,-44 -90,-31 Z" fill="#2a2a2a" />
			<ellipse cx={0} cy={-31} rx={78} ry={13} fill="#2a2a2a" stroke="rgba(0,0,0,0.35)" strokeWidth={4} />
			<g transform={`rotate(${-14 + Math.sin(t / 8) * 6} 30 52)`}>
				<rect x={30} y={50} width={46} height={5} rx={2} fill="#e8d6a8" />
				<circle cx={77} cy={52} r={5} fill="#b8322a" />
			</g>
		</g>
	</g>
);
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const drop = lerp(t, 4, 18, 0, 1, Easing.in(Easing.quad));
		return (
			<AbsoluteFill style={{background: '#6f6a60', overflow: 'hidden'}}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<Palm x={540} y={1180} s={1.6}>
						<Coin x={0} y={lerp(drop, 0, 1, -560, 0)} s={0.9} rot={lerp(drop, 0, 1, -60, 0)} />
					</Palm>
					<g transform={`translate(560,${lerp(t, 0, 14, 330, 430)})`}>
						<rect x={-80} y={-500} width={160} height={480} rx={36} fill={GVOZD.top} />
						<ellipse cx={0} cy={30} rx={92} ry={100} fill="#e3b08a" />
						{[-46, -16, 14, 44].map((fx, k) => (
							<rect key={k} x={fx - 15} y={60} width={30} height={84 - Math.abs(fx) * 0.4} rx={15} fill="#e3b08a" />
						))}
					</g>
				</svg>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #a9c3d8 0%, #e7e2d2 100%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<g transform={`translate(0,0)`}>
					<Garages x={-200} y={1700} n={7} w={230} first={13} />
				</g>
				<GvozdBust id="r1s5gv" t={t} y={lerp(t, 0, 74, 980, 940)} s={lerp(t, 0, 74, 3.0, 3.3)} />
			</svg>
		</AbsoluteFill>
	);
};

// 6. Evening behind the garages: the guys in caps and quilted jackets. Everybody looks at you.
const Circle: React.FC<{id: string; f: number; look?: number}> = ({id, f, look = 0}) => (
	<g>
		<Yard76 id={`${id}y`} f={f} time="dusk" garages={false} />
		<Garages x={-160} y={1500} n={6} w={230} first={20} />
		<Lamp x={900} y={1520} on={1} />
		{[
			[130, 1640, 0.82],
			[330, 1600, 0.8],
			[740, 1600, 0.8],
			[940, 1640, 0.82],
		].map(([x, y, s], k) => (
			<Person key={k} kind="dad" id={`${id}g${k}`} x={x} y={y} scale={s} plain quilt cap={GANG_CAP[k]} colors={GANG[k]} breathe={f + k * 13} headTurn={look ? (540 - x) / 900 : (k % 2 ? 0.6 : -0.6)} face={{eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [look ? (540 - x) / 500 : 0, look * 0.5], blush: false}} />
		))}
		<Person kind="dad" id={`${id}gv`} x={540} y={1580} scale={0.86} plain cap="#2a2a2a" colors={GVOZD} breathe={f} face={{eyes: 'narrow', mouth: 'smile', brows: 'flat', look: [0, 0.4 * look], blush: false}} />
		<You id={`${id}you`} x={560} y={2160} s={1.25} f={f} back satchel={false} />
	</g>
);
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const look = interpolate(f, [108, 118], [0, 1], clamp);
	return (
		<Stage cam={{s: lerp(f, 0, 144, 1.05, 1.22) * (f >= 110 ? kick(f - 110, 0.06) : 1), cx: 540, cy: 1250}} light={{glow: 0, vignette: 0.8}} bg="#3a3460">
			<Circle id="r1s6" f={f} look={look} />
		</Stage>
	);
};

// 7. «Теперь ты наш. Правило первое: своих не сдают. Никогда».
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #3a3460 0%, #d9825a 100%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<Garages x={-200} y={1500} n={7} w={230} first={20} />
				<rect x={0} y={0} width={1080} height={1920} fill="#0b1638" opacity={0.3} />
				<GvozdBust id="r1s7gv" t={f} x={380} y={760} s={2.4} tilt={-4} />
				<Bust kind="son" id="r1s7you" x={720} y={1080} scale={2.3} colors={YOU} face={{eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'raised', look: [-0.6, -0.2], blush: false}} />
				{/* his hand on your shoulder */}
				<g transform={`translate(${lerp(f, 0, 12, 200, 520)},${lerp(f, 0, 12, 1700, 1440)}) rotate(-50)`}>
					<rect x={-60} y={0} width={120} height={500} rx={30} fill={GVOZD.top} />
					<ellipse cx={0} cy={-10} rx={80} ry={64} fill="#e3b08a" />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 8. «Правило второе: слово дал — держи». And you give your word: a handshake.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [74]);
	if (i === 0) return <S07 />;
	const shake = Math.sin(t / 3) * 14 * interpolate(t, [4, 10, 30, 40], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #d9825a 0%, #3a3460 80%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(0,${shake})`}>
					{/* your arm from the left (navy sleeve, white cuff), his from the right (black leather) */}
					<g transform="translate(-60,1080) rotate(-12)">
						<rect x={0} y={-70} width={560} height={140} rx={50} fill={YOU.top} />
						<rect x={520} y={-74} width={50} height={148} rx={14} fill="#e9e4d8" />
					</g>
					<g transform="translate(1140,1030) rotate(12)">
						<rect x={-600} y={-80} width={600} height={160} rx={50} fill={GVOZD.top} />
					</g>
					<ellipse cx={560} cy={1010} rx={130} ry={96} fill="#e3b08a" />
					<ellipse cx={520} cy={1050} rx={110} ry={84} fill="#f2c3a0" />
					<path d="M 470,1000 Q 520,960 590,990" stroke="#c99a76" strokeWidth={10} fill="none" />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 9. Mom asks where you were. You say nothing. You are «пацан» now.
const Kitchen76: React.FC<{id: string; f: number}> = ({id, f}) => (
	<g>
		<Wallpaper id={`${id}wp`} x={-600} y={-600} w={2300} h={1900} base="#c9d8c0" line="#b0c4a6" />
		<Tiles y={760} h={540} color="#d8e4dc" />
		<PlankFloor y={1300} color="#a8784a" seam="#8a5e36" />
		<rect x={80} y={300} width={330} height={420} fill="#5a4a3a" />
		<rect x={96} y={316} width={298} height={388} fill="#101a3a" />
		<rect x={243} y={316} width={4} height={388} fill="#5a4a3a" />
		<circle cx={340} cy={380} r={24} fill="#f4f0d8" opacity={0.8} />
		<WallClock x={560} y={250} h={9} m={15} tick={f} />
		{/* gas stove */}
		<rect x={760} y={940} width={300} height={360} fill="#ecebe6" />
		<rect x={760} y={920} width={300} height={30} fill="#d6d4cc" />
		{[810, 1000].map((x) => (
			<ellipse key={x} cx={x} cy={918} rx={46} ry={10} fill="#3a3a3a" />
		))}
		<rect x={790} y={1000} width={240} height={180} rx={10} fill="#d6d4cc" />
		{/* table with an oilcloth */}
		<rect x={-100} y={1080} width={560} height={30} fill="#d84a3a" />
		{Array.from({length: 7}).map((_, k) => (
			<rect key={k} x={-100 + k * 80} y={1080} width={40} height={30} fill="#f4f0e8" opacity={0.85} />
		))}
		<rect x={-80} y={1110} width={20} height={190} fill="#6a4a2a" />
		<rect x={420} y={1110} width={20} height={190} fill="#6a4a2a" />
		<rect x={-600} y={-600} width={2300} height={2600} fill="#1a1530" opacity={0.18} />
	</g>
);
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const push = lerp(f, 70, 104, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(push, 0, 1, 1.0, 2.1), cx: lerp(push, 0, 1, 540, 700), cy: lerp(push, 0, 1, 1050, 1000)}} light={{glow: 0.25, vignette: 0.7}} bg="#c9d8c0">
				<Kitchen76 id="r1s9" f={f} />
				<Person kind="mom" id="r1s9mom" x={260} y={1700} scale={0.95} breathe={f} face={{eyes: 'open', mouth: f < 40 ? (Math.floor(f / 5) % 2 ? 'open' : 'flat') : 'frown', brows: 'worried', look: [0.8, 0]}} armL={{target: [-90, -560], bend: 1}} armR={{target: [90, -560], bend: -1}} />
				<You id="r1s9you" x={700} y={1760} s={0.95} f={f} satchel={false} face={{eyes: 'open', mouth: 'flat', brows: 'flat', look: [push > 0.5 ? 0 : -0.8, 0.2], blush: false}} />
			</Stage>
			<Bubble x={300} y={620} text="ГДЕ ТЫ БЫЛ?" from={4} to={46} tail="left" />
		</AbsoluteFill>
	);
};

// 10. A week later Гвоздь says: «Завтра идём на Заводских. Ты — с нами».
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [96]);
	if (i === 0) {
		const cam: Cam = {s: 1.1, cx: 600, cy: 1150};
		const lab = toScreen(cam, 900, 520);
		return (
			<AbsoluteFill>
				<Stage cam={cam} light={{glow: 0.15, vignette: 0.7}} bg="#a9c3d8">
					<Yard76 id="r1s10" f={t} garages={false} />
					<Garages x={-200} y={1600} n={6} w={230} first={20} />
					<Person kind="dad" id="r1s10gv" x={420} y={1900} scale={1.0} plain cap="#2a2a2a" colors={GVOZD} breathe={t} headTurn={0.6} face={{eyes: 'narrow', mouth: Math.floor(t / 5) % 2 && t < 70 ? 'open' : 'smile', brows: 'flat', look: [0.8, -0.3], blush: false}} armR={{target: [330, -900], bend: -1}} />
					<You id="r1s10you" x={760} y={1960} s={1.0} f={t} satchel={false} face={{eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'worried', look: [-0.6, 0], blush: false}} />
				</Stage>
				{t >= 70 && <NameTag x={Math.min(740, lab.x)} y={lab.y + 60} title="ЗАВОДСКИЕ" sub="СОСЕДНИЙ ДВОР" at={70} color={RED} />}
			</AbsoluteFill>
		);
	}
	// «Ты — с нами»: he points at you
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #a9c3d8 0%, #e7e2d2 100%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<Garages x={-200} y={1700} n={7} w={230} first={20} />
				<GvozdBust id="r1s10cu" t={t} y={900} s={lerp(t, 0, 20, 3.0, 3.2)} face={{eyes: 'narrow', mouth: 'smile', brows: 'angry', look: [0, 0.1], blush: false}} />
				<g transform={`translate(800,${lerp(t, 0, 8, 1700, 1380)}) scale(${lerp(t, 0, 8, 0.8, 1.15)})`}>
					<rect x={-80} y={0} width={160} height={600} rx={40} fill={GVOZD.top} />
					<ellipse cx={0} cy={-20} rx={90} ry={80} fill="#e3b08a" />
					<rect x={-22} y={-200} width={44} height={170} rx={22} fill="#e3b08a" />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 11. Заводские is the next yard. Санька lives there — your best friend since the first grade.
const FirstGrade: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a1a 0%, #120c08 70%)'}}>
		<div style={{position: 'absolute', left: 140, top: 330, width: 800, height: 900, background: '#f2ede2', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', transform: `rotate(-3deg) scale(${lerp(t, 0, 58, 0.96, 1.02)})`, padding: 34, boxSizing: 'border-box'}}>
			<div style={{position: 'relative', width: 732, height: 700, overflow: 'hidden', background: '#bfb8a8', filter: 'grayscale(1) sepia(0.35) contrast(1.05)'}}>
				<svg width={732} height={700} viewBox="0 0 732 700">
					<GlobalDefs />
					<rect x={0} y={0} width={732} height={420} fill="#d8d2c4" />
					<rect x={0} y={420} width={732} height={280} fill="#a59e8e" />
					<rect x={40} y={60} width={652} height={300} fill="#c4bcaa" />
					{Array.from({length: 4}).map((_, k) => (
						<rect key={k} x={80 + k * 160} y={110} width={90} height={160} fill="#8e877a" />
					))}
					{[
						[230, 'ты', YOU],
						[500, 'санька', SANKA],
					].map(([x, , c], k) => (
						<g key={k}>
							<Person kind="son" id={`r1s11p${k}`} x={x as number} y={760} scale={0.62} colors={c as Colors} plain face={{eyes: 'happy', mouth: 'smile', brows: 'raised', look: [0, 0], blush: false}} armR={{target: [70, -520], bend: -1}} />
							{/* a gladiolus for the teacher */}
							<g transform={`translate(${(x as number) + 46},${760 - 520 * 0.62}) scale(0.62)`}>
								<rect x={-4} y={-260} width={8} height={300} fill="#4a5a3a" />
								{[0, 1, 2, 3, 4].map((j) => (
									<circle key={j} cx={j % 2 ? 14 : -14} cy={-250 + j * 40} r={24} fill="#e8e0d0" />
								))}
							</g>
						</g>
					))}
				</svg>
			</div>
			<div style={{position: 'absolute', left: 34, bottom: 34, fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: '#3a3a5a'}}>1 сентября 1970</div>
		</div>
		<div style={{position: 'absolute', left: 260, top: 1120, transform: `scale(${pop(t, 8, 10)})`}}>
			<div style={{background: '#111', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '4px 18px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff'}}>ТЫ</div>
		</div>
		<div style={{position: 'absolute', left: 600, top: 1120, transform: `scale(${pop(t, 14, 10)})`}}>
			<div style={{background: '#111', border: `5px solid ${RED}`, borderRadius: 14, padding: '4px 18px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff'}}>САНЬКА</div>
		</div>
	</AbsoluteFill>
);
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	if (i === 0) {
		const cam: Cam = {s: lerp(t, 0, 84, 1.0, 1.12), cx: 600, cy: 1000};
		const w = toScreen(cam, 700, 1085);
		return (
			<AbsoluteFill>
				<Stage cam={cam} light={{glow: 0.15, vignette: 0.7}} bg="#a9c3d8">
					<Yard76 id="r1s11" f={t} garages={false} />
					<rect x={-800} y={-800} width={2700} height={2400} fill="#6a4a3a" opacity={0.12} />
				</Stage>
				{t >= 56 && <NameTag x={w.x} y={w.y - 190} title="САНЬКА" sub="ЖИВЁТ ЗДЕСЬ" at={56} pin={120} color={RED} />}
				{t >= 4 && <NameTag x={540} y={360} title="ЗАВОДСКИЕ" at={4} color={RED} />}
			</AbsoluteFill>
		);
	}
	return <FirstGrade t={t} />;
};

// 12. At night — a knock on the window. It's Санька: «Я слышал… Ты правда теперь с ними?»
const NightWindow: React.FC<{id: string; f: number; knock?: number; close?: number}> = ({id, f, knock = 0, close = 0}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
		<GlobalDefs />
		<g transform={`translate(540,900) scale(${1 + 0.9 * close}) translate(-540,-900)`}>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#141a2e" />
			{/* the window: the yard at night behind the glass, Санька's face pressed to it */}
			<rect x={240} y={420} width={600} height={760} fill="#4a3a2a" />
			<rect x={262} y={442} width={556} height={716} fill="#0a1024" />
			<circle cx={700} cy={540} r={40} fill="#f4f0d8" opacity={0.9} />
			<Bust kind="son" id={`${id}sanka`} x={520} y={900} scale={1.9} colors={SANKA} face={{eyes: 'wide', pupil: 0.6, mouth: Math.floor(f / 6) % 2 && f > 66 && f < 120 ? 'open' : 'flat', brows: 'worried', look: [0, 0.1], blush: false}} />
			{knock > 0 && (
				<g transform={`translate(${700},${820 - 14 * Math.max(0, Math.sin(f * 1.4)) * knock})`}>
					<ellipse cx={0} cy={0} rx={56} ry={64} fill="#f2c3a0" />
					<rect x={-50} y={40} width={100} height={260} rx={30} fill={SANKA.top} />
				</g>
			)}
			<ellipse cx={520} cy={1020} rx={160} ry={60} fill="#cfd8e8" opacity={0.18 * close} />
			<rect x={262} y={442} width={556} height={716} fill="#9fb4ff" opacity={0.08} />
			<rect x={536} y={442} width={10} height={716} fill="#4a3a2a" />
			<rect x={262} y={700} width={556} height={10} fill="#4a3a2a" />
			<rect x={200} y={1170} width={680} height={40} fill="#6a5a4a" />
			<rect x={-400} y={1210} width={1880} height={1200} fill="#1c2238" />
		</g>
	</svg>
);
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#141a2e'}}>
			<NightWindow id="r1s12" f={f} knock={interpolate(f, [12, 16, 30, 36], [0, 1, 1, 0], clamp)} close={lerp(f, 40, 70, 0, 1, Easing.inOut(Easing.cubic))} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
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
					<NightWindow id="r1s13" f={f} close={1} />
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
				</AbsoluteFill>
			}
		/>
	);
};
