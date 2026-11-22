// «Откуда взялись чипсы» — 30 shots on the timeline of src/c1/timeline.ts (= the voice, scripts/fit-voiceover.py --part c1).
// Evening at grandpa's: Тёма opens a bag of crab chips — «опять полпачки воздуха!» — «это азот». Grandpa tells the
// story (1853 Saratoga, the spiteful chef; the bags of 1926; the flavour of 1954; «Московский» 1963; the 90s), then what
// is inside, the tube chips, why the nitrogen; «можно — иногда, и одну пачку на всех». Meanwhile the cat steals the bag.
// This file: the living room shots; the history shots are in hist.tsx, the explainers in info.tsx.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {ArmPose, Kind, SPECS} from '../components/Person';
import {Stage} from '../components/Stage';
import {Cat, ChairBack, ChairFront, Chip, ChipsBag, CoffeeTable, DED, DedLegs, DedSit, F, lvl, mouthOf, N2, Newspaper, RoomBack, RoomRug, SofaBack, SofaFront, TABLE, TemaLegs, TemaSit} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

export * from './hist';
export * from './info';

const len = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.cubic);
const TEMA_SKIN = '#efbf98';
const HandOval: React.FC<{x: number; y: number; r?: number; rot?: number; skin?: string}> = ({x, y, r = 27, rot = 0, skin = TEMA_SKIN}) => (
	<ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill={skin} transform={`rotate(${rot} ${x} ${y})`} />
);

// ============================================================ grandpa's living room, all together =====
const Room: React.FC<{id: string; tema?: React.ReactNode; ded?: React.ReactNode; mid?: React.ReactNode; cat?: React.ReactNode; table?: React.ReactNode; front?: React.ReactNode}> = ({
	id,
	tema,
	ded,
	mid,
	cat,
	table,
	front,
}) => (
	<g>
		<RoomBack id={id} />
		<RoomRug />
		<SofaBack />
		<ChairBack />
		{ded}
		{tema}
		{mid}
		<SofaFront />
		<ChairFront />
		<TemaLegs />
		<DedLegs />
		{cat}
		<CoffeeTable>{table}</CoffeeTable>
		{front}
	</g>
);
// where the sitters' (virtual) feet are: arm poses are built from picture points through them
type Feet = {x: number; y: number; k: number; kind: Kind};
const TF: Feet = {x: 380, y: 1092 + 370 * 0.98, k: 0.98, kind: 'teen'};
const DF: Feet = {x: 889, y: 1100 + 470 * 0.8, k: 0.8, kind: 'dad'};
// an arm that bends at `elbow` and ends with the hand at `hand` (picture coords), foreshortened to fit
const arm = (p: Feet, side: -1 | 1, elbow: [number, number], hand: [number, number]): ArmPose => {
	const sp = SPECS[p.kind];
	const sx = p.x + side * (sp.shoulderW / 2 - sp.armW / 2 + 4) * p.k;
	const sy = p.y + (-sp.leg - sp.torso + sp.armW / 2) * p.k;
	const l1 = Math.hypot(elbow[0] - sx, elbow[1] - sy) / p.k;
	const l2 = Math.hypot(hand[0] - elbow[0], hand[1] - elbow[1]) / p.k;
	const cross = (hand[0] - sx) * (elbow[1] - sy) - (hand[1] - sy) * (elbow[0] - sx);
	return {target: [(hand[0] - p.x) / p.k, (hand[1] - p.y) / p.k], bend: cross > 0 ? 1 : -1, ku: Math.max(0.3, l1 / sp.upper), kf: Math.max(0.2, (l2 - sp.armW * 0.56 * 0.8) / sp.fore)};
};
const rest = (p: Feet, side: -1 | 1): ArmPose => arm(p, side, [p.x + side * 112 * (p.kind === 'dad' ? 1.25 : 1), 990], [p.x + side * 70, 1086]);

// Тёма holding the bag at (bx, by): elbows at his sides, hands on the bag
const TemaBag: React.FC<{id: string; f: number; face: React.ComponentProps<typeof TemaSit>['face']; bx: number; by: number; s?: number; rot?: number; open?: number; cut?: number; gas?: 'air' | 'n2'; headTurn?: number; headTilt?: number; puff?: number}> = ({
	id,
	f,
	face,
	bx,
	by,
	s = 0.55,
	rot = 0,
	open = 1,
	cut = 0,
	gas = 'air',
	headTurn,
	headTilt,
	puff = 0,
}) => {
	const hw = 136 * s;
	const hy = by + 30 * s;
	const c = Math.cos((rot * Math.PI) / 180);
	const sn = Math.sin((rot * Math.PI) / 180);
	const L: [number, number] = [bx - hw * c - 30 * s * sn, hy - hw * sn];
	const R: [number, number] = [bx + hw * c - 30 * s * sn, hy + hw * sn];
	return (
		<>
			<TemaSit id={id} f={f} face={face} headTurn={headTurn} headTilt={headTilt} armL={arm(TF, -1, [TF.x - 118, Math.min(985, L[1] - 10)], L)} armR={arm(TF, 1, [TF.x + 118, Math.min(985, R[1] - 10)], R)} />
			<g transform={`translate(${bx},${by}) rotate(${rot})`}>
				<ChipsBag s={s} open={open} cut={cut} gas={gas} id={`${id}-bag`} puff={puff} />
			</g>
			<HandOval x={L[0]} y={L[1]} rot={rot} />
			<HandOval x={R[0]} y={R[1]} rot={rot} />
		</>
	);
};
// grandpa holding the newspaper at (x, y)
const DedPaper: React.FC<{id: string; f: number; face: React.ComponentProps<typeof DedSit>['face']; y: number; fold?: number; headTurn?: number; x?: number}> = ({id, f, face, y, fold = 0, headTurn, x = 889}) => {
	const half = 150 * (1 - fold * 0.5);
	const L: [number, number] = [x - half - 6, y + 40];
	const R: [number, number] = [x + half + 6, y + 40];
	return (
		<>
			<DedSit id={id} f={f} face={face} headTurn={headTurn} armL={arm(DF, -1, [DF.x - 150, Math.min(1000, L[1] + 20)], L)} armR={arm(DF, 1, [DF.x + 150, Math.min(1000, R[1] + 20)], R)} />
			<g transform={`translate(${x},${y})`}>
				<Newspaper w={300} h={340} fold={fold} />
			</g>
			<HandOval x={L[0]} y={L[1]} r={26} skin={DED.skin} />
			<HandOval x={R[0]} y={R[1]} r={26} skin={DED.skin} />
		</>
	);
};
const CatArm: React.FC<{f: number; look?: [number, number]; blink?: number; id: string}> = ({f, look = [0.6, 0.2], blink = 0, id}) => <Cat id={id} x={70} y={968} s={0.62} look={look} tail={f / 14} blink={blink} />;

// the title at the very start
const Title: React.FC<{f: number}> = ({f}) => {
	const p = pop(f, 0, 14);
	const o = interpolate(f, [62, 74], [1, 0], clamp);
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', transform: `scale(${0.8 + 0.2 * p})`, opacity: o}}>
			<div style={{display: 'inline-block', fontFamily: HEAVY, fontWeight: 900, fontSize: 80, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,0.35), 5px 5px 0 #1d1d24, -5px 5px 0 #1d1d24, 5px -5px 0 #1d1d24, -5px -5px 0 #1d1d24'}}>
				ОТКУДА ВЗЯЛИСЬ
				<br />
				<span style={{color: '#ffd34a'}}>ЧИПСЫ?</span>
			</div>
		</div>
	);
};

// ============================================================ 1. «Ну вот, опять полпачки воздуха!» =====
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const n = 1;
	const tilt = lerp(f, 16, 32, 0, 1, E);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.72, 1.84), cx: 440, cy: 880}} bg="#2a2030">
				<Room
					id="c1s1"
					tema={<TemaBag id="c1s1t" f={f} face={{...F.angry, eyes: 'open', mouth: mouthOf(lvl(n, f), 'frown'), look: [0.1, 0.7 - tilt * 0.7]}} bx={400} by={1000} rot={-14 * tilt} cut={tilt} headTilt={6 - tilt * 6} />}
					ded={<DedSit id="c1s1d" f={f} face={{...F.calm, look: [-0.4, 0.3]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
					cat={<CatArm f={f} id="c1s1c" />}
				/>
			</Stage>
			<Title f={f} />
		</AbsoluteFill>
	);
};

// ============================================================ 2. «Это не воздух, внучок. Это азот.» =====
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const n = 2;
	const down = lerp(f, 0, 14, 0, 1, E);
	const fold = lerp(f, 16, 34, 0, 0.7, E);
	const at = w(n, 'азот');
	const p = pop(f, at, 12);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.78, 1.86), cx: 860, cy: 860}} bg="#2a2030">
				<Room
					id="c1s2"
					tema={<TemaSit id="c1s2t" f={f} face={{...F.calm, mouth: 'flat', look: [0.6, 0]}} armL={rest(TF, -1)} armR={rest(TF, 1)} />}
					ded={<DedPaper id="c1s2d" f={f} face={{...F.calm, mouth: mouthOf(lvl(n, f), 'smile'), look: [-0.7, 0.05]}} y={lerp(down, 0, 1, 800, 1010)} fold={fold} headTurn={-0.45} />}
					cat={<CatArm f={f} id="c1s2c" />}
				/>
				{f >= at && <N2 x={760} y={600} s={1.4 * p} rot={-12} />}
			</Stage>
		</AbsoluteFill>
	);
};

// ============================================================ 3. «Какой ещё азот? Нас обманывают!» =====
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const n = 3;
	const shake = f > 6 && f < 54 ? Math.sin(f / 2.2) * 12 : 0;
	return (
		<Stage cam={{s: lerp(f, 0, len(n), 1.86, 1.94), cx: 420, cy: 880}} bg="#2a2030">
			<Room
				id="c1s3"
				tema={<TemaBag id="c1s3t" f={f} face={{eyes: 'wide', pupil: 0.6, brows: 'angry', mouth: mouthOf(lvl(n, f), 'frown'), look: [0.5, -0.05]}} bx={410} by={960 - Math.abs(shake) * 1.5} rot={shake} headTurn={0.5} />}
				ded={<DedSit id="c1s3d" f={f} face={{...F.calm, look: [-0.5, 0]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
				cat={<CatArm f={f} look={[0.9, 0.1]} id="c1s3c" />}
			/>
		</Stage>
	);
};

// ============================================================ 4. «Садись. Расскажу, откуда взялись твои чипсы.» =====
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const n = 4;
	const L = len(n);
	const fold = lerp(f, 0, 16, 0.7, 1, E);
	const away = lerp(f, 10, 30, 0, 1, E);
	const dive = lerp(f, L - 26, L, 0, 1, Easing.in(Easing.cubic));
	const flash = interpolate(f, [L - 10, L], [0, 1], clamp);
	const gesture = lerp(f, 30, 44, 0, 1, E);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(dive, 0, 1, 1.04, 3.6, Easing.linear), cx: lerp(dive, 0, 1, 560, 404, Easing.linear), cy: lerp(dive, 0, 1, 960, 1004, Easing.linear)}} bg="#2a2030">
				<Room
					id="c1s4"
					tema={<TemaBag id="c1s4t" f={f} face={{...F.calm, mouth: 'smile', look: [0.8, -0.1]}} bx={400} by={1000} headTurn={0.55} />}
					ded={
						<>
							<DedSit
								id="c1s4d"
								f={f}
								face={{...F.sly, mouth: mouthOf(lvl(n, f), 'smile'), look: [-0.7, 0.1]}}
								headTurn={-0.45}
								armL={rest(DF, -1)}
								armR={arm(DF, 1, [DF.x + 160, 980], [lerp(gesture, 0, 1, DF.x + 90, DF.x + 40), lerp(gesture, 0, 1, 1080, 900)])}
							/>
							<g transform={`translate(${lerp(away, 0, 1, 889, 1012)},${lerp(away, 0, 1, 1010, 1040)}) rotate(${away * 8}) scale(${1 - away * 0.35})`}>
								<Newspaper w={300} h={340} fold={fold} />
							</g>
						</>
					}
					cat={<CatArm f={f} look={[0.7, 0.1]} id="c1s4c" />}
				/>
			</Stage>
			{flash > 0 && <AbsoluteFill style={{background: '#fff6e0', opacity: flash}} />}
		</AbsoluteFill>
	);
};

// ============================================================ 18. «О, краба я люблю!» =====
const Hearts: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => (
	<g>
		{[0, 1, 2].map((k) => {
			const t = f - at - k * 5;
			if (t < 0) return null;
			const yy = y - t * 3.2 - k * 20;
			const xx = x + Math.sin(t / 6 + k) * 22 + (k - 1) * 60;
			const o = interpolate(t, [0, 6, 30, 40], [0, 1, 1, 0], clamp);
			return <path key={k} d={`M ${xx},${yy + 18} C ${xx - 40},${yy - 10} ${xx - 18},${yy - 38} ${xx},${yy - 16} C ${xx + 18},${yy - 38} ${xx + 40},${yy - 10} ${xx},${yy + 18} Z`} fill="#e8384a" opacity={o} />;
		})}
	</g>
);
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const n = 18;
	const up = lerp(f, 0, 10, 0, 1, E);
	return (
		<Stage cam={{s: 1.95, cx: 420, cy: 860}} bg="#2a2030">
			<Room
				id="c1s18"
				tema={<TemaBag id="c1s18t" f={f} face={{eyes: 'happy', brows: 'raised', mouth: mouthOf(lvl(n, f), 'grin'), look: [0, 0]}} bx={lerp(up, 0, 1, 400, 470)} by={lerp(up, 0, 1, 1000, 900)} rot={lerp(up, 0, 1, 0, 10)} s={0.6} headTurn={0.1} open={1} />}
				ded={<DedSit id="c1s18d" f={f} face={{...F.calm, look: [-0.5, 0]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
				cat={<CatArm f={f} id="c1s18c" />}
			/>
			<Hearts f={f} at={6} x={330} y={640} />
		</Stage>
	);
};

// ============================================================ 19. «Краба там нет. Есть ароматизатор.» =====
const Finger: React.FC<{x: number; y: number; wag: number}> = ({x, y, wag}) => (
	<g transform={`rotate(${wag} ${x} ${y + 26})`}>
		<rect x={x - 9} y={y - 58} width={18} height={56} rx={9} fill={DED.skin} />
		<ellipse cx={x} cy={y} rx={28} ry={31} fill={DED.skin} />
	</g>
);
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const n = 19;
	const up = lerp(f, 0, 10, 0, 1, E);
	const wag = Math.sin(f / 3) * 14 * interpolate(f, [8, 14, 40, 50], [0, 1, 1, 0], clamp);
	const hand: [number, number] = [lerp(up, 0, 1, 960, 1000), lerp(up, 0, 1, 1060, 860)];
	const aro = w(n, 'ароматизатор');
	const pc = pop(f, 4, 12);
	const pa = pop(f, aro - 2, 12);
	return (
		<AbsoluteFill>
			<Stage cam={{s: 1.8, cx: 860, cy: 870}} bg="#2a2030">
				<Room
					id="c1s19"
					tema={<TemaSit id="c1s19t" f={f} face={{...F.shock, look: [0.7, 0]}} armL={rest(TF, -1)} armR={rest(TF, 1)} />}
					ded={
						<>
							<DedSit id="c1s19d" f={f} face={{...F.sly, mouth: mouthOf(lvl(n, f), 'smile'), look: [-0.6, 0]}} headTurn={-0.4} armL={rest(DF, -1)} armR={arm(DF, 1, [DF.x + 150, 980], hand)} />
							<Finger x={hand[0]} y={hand[1]} wag={wag} />
						</>
					}
					cat={<CatArm f={f} id="c1s19c" />}
				/>
			</Stage>
			{/* the crab crossed out → the flask «АРОМАТИЗАТОР» */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(300,400) scale(${pc})`}>
					<circle r={130} fill="#fff" stroke="#1d1d24" strokeWidth={8} />
					<CrabIcon s={1} />
					{f >= aro - 2 && <line x1={-96} y1={-96} x2={96} y2={96} stroke="#e0342b" strokeWidth={22 * Math.min(1, pa)} strokeLinecap="round" />}
				</g>
				{f >= aro - 2 && (
					<g transform={`translate(780,400) scale(${pa})`}>
						<circle r={130} fill="#fff" stroke="#1d1d24" strokeWidth={8} />
						<Flask />
					</g>
				)}
			</svg>
			{f >= aro - 2 && (
				<div style={{position: 'absolute', left: 780, top: 580, transform: `translate(-50%,0) scale(${pa})`, background: '#1d1d24', color: '#ffd34a', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, padding: '8px 22px', borderRadius: 14, whiteSpace: 'nowrap'}}>
					АРОМАТИЗАТОР
				</div>
			)}
		</AbsoluteFill>
	);
};
export const CrabIcon: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		{[-1, 1].map((k) => (
			<g key={k}>
				<path d={`M ${k * 40},-10 Q ${k * 80},-60 ${k * 70},-80`} stroke="#e0463a" strokeWidth={14} fill="none" strokeLinecap="round" />
				<path d={`M ${k * 70},-80 l ${k * 22},-18 l ${k * -6},26 Z`} fill="#e0463a" />
				{[0, 1, 2].map((j) => (
					<line key={j} x1={k * 40} y1={10 + j * 14} x2={k * 86} y2={26 + j * 22} stroke="#e0463a" strokeWidth={10} strokeLinecap="round" />
				))}
			</g>
		))}
		<ellipse cx={0} cy={10} rx={58} ry={40} fill="#e8553f" />
		<circle cx={-16} cy={-30} r={9} fill="#fff" />
		<circle cx={16} cy={-30} r={9} fill="#fff" />
		<circle cx={-16} cy={-30} r={4} fill="#1d1d24" />
		<circle cx={16} cy={-30} r={4} fill="#1d1d24" />
	</g>
);
export const Flask: React.FC<{color?: string}> = ({color = '#7ac0f0'}) => (
	<g>
		<path d="M -22,-80 L 22,-80 L 22,-30 L 66,58 Q 70,76 52,76 L -52,76 Q -70,76 -66,58 L -22,-30 Z" fill="#eef6fb" stroke="#1d1d24" strokeWidth={7} strokeLinejoin="round" />
		<path d="M -40,20 L 40,20 L 60,60 Q 62,68 52,68 L -52,68 Q -62,68 -60,60 Z" fill={color} />
		<rect x={-30} y={-96} width={60} height={20} rx={6} fill="#1d1d24" />
		<circle cx={-12} cy={40} r={6} fill="#fff" opacity={0.7} />
		<circle cx={14} cy={50} r={4} fill="#fff" opacity={0.7} />
	</g>
);

// ============================================================ 25. «А воздух? Это же обман!» =====
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const n = 25;
	const up = lerp(f, 0, 10, 0, 1, E);
	const shake = f > 12 && f < 40 ? Math.sin(f / 2) * 10 : 0;
	return (
		<Stage cam={{s: 1.9, cx: 430, cy: 860}} bg="#2a2030">
			<Room
				id="c1s25"
				tema={<TemaBag id="c1s25t" f={f} face={{eyes: 'narrow', brows: 'raised', mouth: mouthOf(lvl(n, f), 'flat'), look: [0.6, -0.2]}} bx={lerp(up, 0, 1, 400, 470)} by={lerp(up, 0, 1, 1000, 880)} rot={shake} s={0.6} headTurn={0.5} />}
				ded={<DedSit id="c1s25d" f={f} face={{...F.calm, look: [-0.5, 0]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
				cat={<CatArm f={f} look={[0.7, 0]} id="c1s25c" />}
			/>
		</Stage>
	);
};

// ============================================================ 27. «Так что, чипсы — нельзя?» =====
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const n = 27;
	return (
		<Stage cam={{s: lerp(f, 0, len(n), 1.95, 2.05), cx: 420, cy: 870}} bg="#2a2030">
			<Room
				id="c1s27"
				tema={<TemaBag id="c1s27t" f={f} face={{eyes: 'wide', pupil: 1.35, brows: 'sad', mouth: mouthOf(lvl(n, f), 'frown'), look: [0.6, -0.15]}} bx={405} by={960} s={0.5} rot={6} headTurn={0.45} headTilt={-5} />}
				ded={<DedSit id="c1s27d" f={f} face={{...F.calm, look: [-0.5, 0]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
				cat={<CatArm f={f} look={[0.8, 0.3]} id="c1s27c" />}
			/>
		</Stage>
	);
};

// ============================================================ 28. «Можно. Иногда. И одну пачку — на всех.» =====
// Тёма puts the bag on the table; the cat on the armrest locks onto it
export const S28: React.FC = () => {
	const f = useCurrentFrame();
	const n = 28;
	const put = lerp(f, 30, 58, 0, 1, E);
	const arc = Math.sin(put * Math.PI) * -60;
	const bx = lerp(put, 0, 1, 400, 470);
	const by = lerp(put, 0, 1, 1000, TABLE.y - 98) + arc;
	const crouch = lerp(f, 70, len(n), 0, 1, E);
	return (
		<Stage cam={{s: lerp(f, 0, len(n), 1.04, 1.1), cx: 540, cy: 1000}} bg="#2a2030">
			<Room
				id="c1s28"
				tema={
					put < 0.02 ? (
						<TemaBag id="c1s28t" f={f} face={{...F.calm, mouth: 'smile', look: [0.7, 0]}} bx={400} by={1000} s={0.55} headTurn={0.5} />
					) : (
						<TemaSit id="c1s28t2" f={f} face={{...F.happy, mouth: 'smile', look: [0.3, 0.4]}} headTurn={0.3} armL={rest(TF, -1)} armR={arm(TF, 1, [TF.x + 120, 990], [lerp(put, 0, 1, 470, 560), lerp(put, 0, 1, 1010, 1090)])} />
					)
				}
				ded={<DedSit id="c1s28d" f={f} face={{...F.calm, mouth: mouthOf(lvl(n, f), 'smile'), look: [-0.6, 0.1]}} headTurn={-0.4} armL={rest(DF, -1)} armR={arm(DF, 1, [DF.x + 160, 990], [DF.x + 60, 960])} />}
				cat={<Cat id="c1s28c" x={lerp(crouch, 0, 1, 70, 96)} y={lerp(crouch, 0, 1, 968, 990)} s={0.62} look={[0.9, 0.9]} blink={0} tail={f / 5} />}
				table={put >= 0.02 ? <g transform={`translate(${bx},${by}) rotate(${(1 - put) * -10})`}><ChipsBag s={0.5} open={1} /></g> : null}
			/>
		</Stage>
	);
};

// ============================================================ 29. «Деда… а где пачка?» =====
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const n = 29;
	const tail = lerp(f, 0, 26, 0, 1, E);
	return (
		<Stage cam={{s: 1.42, cx: 560, cy: 1180}} bg="#2a2030">
			<Room
				id="c1s29"
				tema={<TemaSit id="c1s29t" f={f} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: mouthOf(lvl(n, f), 'o'), look: [0.3, 0.8]}} headTurn={0.3} armL={rest(TF, -1)} armR={rest(TF, 1)} />}
				ded={<DedSit id="c1s29d" f={f} face={{...F.calm, look: [-0.4, 0.6]}} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
				table={
					<g>
						<Chip x={430} y={TABLE.y - 30} r={12} rot={30} />
						<Chip x={520} y={TABLE.y - 26} r={9} rot={-20} />
					</g>
				}
				front={
					// the end of a ginger tail slipping away behind the armchair
					<path d={`M ${lerp(tail, 0, 1, 700, 1000)},1300 q 40,-40 90,-20`} stroke="#ea9440" strokeWidth={26} fill="none" strokeLinecap="round" opacity={1 - tail * 0.9} />
				}
			/>
		</Stage>
	);
};

// ============================================================ 30. «Ха! Вот кто знает толк в чипсах. Подпишись…» =====
// the cat behind the armchair with the bag, crunching; then all of them, grandpa laughing; the end card
const Crumbs: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => (
	<g>
		{Array.from({length: 7}).map((_, k) => {
			const t = (f * 1.3 + k * 9) % 26;
			const a = k * 0.9;
			return <Chip key={k} x={x + Math.cos(a) * t * 3} y={y + t * t * 0.18 - 10} r={6 + (k % 3) * 2} rot={t * 20} />;
		})}
	</g>
);
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const n = 30;
	const cut = w(n, 'подпишись') - 6;
	const chew = (Math.sin(f / 2.2) + 1) / 2;
	if (f < cut) {
		// the corner behind the armchair: the cat with the bag
		return (
			<Stage cam={{s: lerp(f, 0, cut, 1.0, 1.08), cx: 540, cy: 1100}} bg="#2a2030">
				<RoomBack id="c1s30a" lamp={1} />
				<rect x={-400} y={1180} width={1900} height={1200} fill="#8a5c38" />
				<rect x={640} y={760} width={520} height={720} rx={60} fill="#9a4a36" />
				<rect x={600} y={1000} width={110} height={460} rx={40} fill="#b45d46" />
				<g transform="translate(250,1310) rotate(-8)">
					<ChipsBag s={0.85} open={1} />
				</g>
				<Cat id="c1s30c" x={520} y={1420} s={1.25} pose="eat" chew={chew} happy />
				<Crumbs f={f} x={520} y={1230} />
			</Stage>
		);
	}
	const g = f - cut;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(g, 0, 60, 1.18, 1.02, E), cx: 540, cy: 1000}} bg="#2a2030">
				<Room
					id="c1s30"
					tema={<TemaSit id="c1s30t" f={f} face={{eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0, 0]}} headTurn={0.2} armL={rest(TF, -1)} armR={rest(TF, 1)} />}
					ded={<DedSit id="c1s30d" f={f} face={{eyes: 'happy', brows: 'raised', mouth: mouthOf(lvl(n, f), 'grin'), look: [0, 0]}} headTilt={Math.sin(f / 4) * 3} headTurn={-0.2} armL={rest(DF, -1)} armR={rest(DF, 1)} />}
					front={
						<>
							<g transform="translate(250,1720) rotate(-8)">
								<ChipsBag s={0.62} open={1} />
							</g>
							<Cat id="c1s30c2" x={470} y={1830} s={1.0} pose="eat" chew={chew} happy />
						</>
					}
				/>
			</Stage>
			<EndCard f={g} />
		</AbsoluteFill>
	);
};
const EndCard: React.FC<{f: number}> = ({f}) => {
	const p = pop(f, 10, 12);
	const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - 24) / 4);
	return (
		<>
			<div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', transform: `scale(${pop(f, 2, 13)})`}}>
				<div style={{display: 'inline-block', fontFamily: HEAVY, fontWeight: 900, fontSize: 76, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,0.35), 5px 5px 0 #1d1d24, -5px 5px 0 #1d1d24, 5px -5px 0 #1d1d24, -5px -5px 0 #1d1d24'}}>
					ЗНАЙ, ЧТО
					<br />
					<span style={{color: '#ffd34a'}}>У ТЕБЯ В ПАЧКЕ</span>
				</div>
			</div>
			{f >= 10 && (
				<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', transform: `scale(${p * pulse})`}}>
					<div style={{display: 'inline-block', background: '#e0342b', color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 60, padding: '18px 48px 22px', borderRadius: 28, boxShadow: '0 9px 0 #8f1416'}}>ПОДПИШИСЬ</div>
				</div>
			)}
		</>
	);
};
export const _K1 = {DedLegs, TemaLegs, SofaBack, SofaFront, ChairBack, ChairFront, RoomRug, CoffeeTable};
