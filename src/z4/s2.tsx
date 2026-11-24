// «Каково это — умереть от лап медведя» — shots 23–27, 29, 30 (mistake three: the tree; the bluff charge; stand still and
// back off; a step from the bear) and 34–40 (mistake four: the cubs and the selfie; the mother; 664 attacks; walk away;
// mistake five: food in the tent; the nose; night guests).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Bear, BearFront, BearUp} from '../components/Bear';
import {armPose, mixArm, type ArmSpec} from '../components/Choby';
import {StopChobi} from './chobiKit';
import {arm, armTo, Bush, camAt, Chip, Crisps, Forest, GROUND, HEAVY, Headphones, INK, Layer, MilkTin, Phone, Plaque, RED, rnd, Sausage, Stage16, Tent, Vig, YEL, You} from './kit';
import type {YouFace} from '../z2/kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const stepPh = (dist: number, k = 1) => (dist / 44) * k;
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
const GREEN = '#3a8a4a';
const BROWN = '#7a4a24';

// a bear that turns round: k goes 1 → -1 (it narrows and widens again); the bear inside is drawn at the origin, dir 1
const Turn: React.FC<{x: number; y: number; k: number; children: React.ReactNode}> = ({x, y, k, children}) => (
	<g transform={`translate(${x},${y}) scale(${Math.abs(k) < 0.06 ? (k < 0 ? -0.06 : 0.06) : k},1)`}>{children}</g>
);

// the bear's frightening sounds drawn as little white strokes about a point (huffing)
const Puffs: React.FC<{f: number; x: number; y: number; dir?: number; k?: number}> = ({f, x, y, dir = -1, k = 1}) => (
	<g opacity={k}>
		{[0, 1].map((i) => {
			const t = ((f / 16 + i / 2) % 1);
			return <circle key={i} cx={x + dir * t * 60} cy={y - t * 14} r={8 + t * 16} fill="#ffffff" opacity={(1 - t) * 0.7} />;
		})}
	</g>
);

// ============================================================ the tall pine Гога climbs =====
const PINE = {bark: '#9a5a34', barkD: '#7a4224', line: '#4a2410', crown: '#2f6a48', crownD: '#24563a'};
// where Гога stands on his branch (relative to the pine's foot)
const BRANCH = {x: 140, y: -416};
const Pine: React.FC<{x: number; y: number; h?: number; flip?: boolean}> = ({x, y, h = 1340, flip = false}) => (
	<g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
		<ellipse cx={0} cy={4} rx={160} ry={22} fill="#000" opacity={0.15} />
		<path d={`M -100,6 C -72,-8 -62,-40 -58,-90 L -42,${-h + 200} L 42,${-h + 200} L 58,-90 C 62,-40 72,-8 100,6 Z`} fill={PINE.bark} stroke={PINE.line} strokeWidth={6} strokeLinejoin="round" />
		<path d={`M 12,-70 L 14,${-h + 200} L 42,${-h + 200} L 58,-90 C 62,-40 72,-8 100,6 L 34,6 Z`} fill={PINE.barkD} />
		{Array.from({length: 10}).map((_, i) => (
			<path key={i} d={`M ${-30 + (i % 3) * 22},${-120 - i * 95} q 8,-22 0,-44`} stroke={PINE.line} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
		))}
		{/* his branch (to the right) and two more on the left */}
		<path d="M 46,-412 C 140,-418 220,-424 300,-434 C 307,-427 307,-419 300,-415 C 220,-405 140,-395 50,-382 Z" fill={PINE.bark} stroke={PINE.line} strokeWidth={6} strokeLinejoin="round" />
		<path d="M -46,-560 C -110,-578 -170,-600 -220,-628 L -214,-642 C -160,-616 -104,-598 -44,-586 Z" fill={PINE.bark} stroke={PINE.line} strokeWidth={5} strokeLinejoin="round" />
		<path d="M -44,-930 C -110,-948 -170,-970 -230,-1000 L -224,-1014 C -166,-986 -108,-966 -42,-954 Z" fill={PINE.bark} stroke={PINE.line} strokeWidth={5} strokeLinejoin="round" />
		{/* the crown */}
		{(
			[
				[0, -h + 160, 240],
				[-180, -h + 270, 160],
				[180, -h + 260, 170],
				[-90, -h + 350, 150],
				[110, -h + 350, 150],
				[0, -h + 40, 180],
			] as const
		).map(([cx, cy, r], k) => (
			<circle key={k} cx={cx} cy={cy} r={r} fill={k % 2 ? PINE.crownD : PINE.crown} />
		))}
	</g>
);

// Гога on his branch: scared, his left hand on the trunk (world units; the pine's foot at (px, GROUND))
const OnBranch: React.FC<{px: number; f: number; look?: [number, number]; mouth?: string}> = ({px, f, look = [0.3, 0.8], mouth = 'o'}) => (
	<You
		x={px + BRANCH.x}
		y={GROUND + BRANCH.y}
		s={0.55}
		f={f}
		face={{eyes: 'wide', mouth, brows: 'raised', look, sweat: 0.8}}
		armL={arm([-118, -414], [-162, -436])}
		armR={arm([96, -330], [60, -420], {fist: true})}
		outer={<Headphones />}
	/>
);

// ============================================================ 23. he remembers the films — and climbs a tree =====
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const n = 23;
	const films = w(n, 'фильмы') - 10;
	const climb = w(n, 'лезет') - 22;
	const PX = 760;
	const t = Math.max(0, f - climb);
	const rise = interpolate(f, [climb, len(n)], [0, 190], clamp);
	// the hands take turns reaching up the trunk; the feet push
	const a = climbArm(t);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={25} />
				<Pine x={PX} y={GROUND} />
				<You
					x={PX}
					y={GROUND - rise}
					s={0.55}
					f={f}
					back
					walk={f >= climb ? t * 0.45 : undefined}
					armL={arm([-112, -436 + a * 30], [-100, -520 + a * 44])}
					armR={arm([112, -436 - a * 30], [100, -520 - a * 44])}
					outer={<Headphones />}
				/>
				{/* a film in his head: the hero in a tree, safe */}
				{f >= films && f < climb + 40 && (
					<g transform={`translate(${PX + 330},${GROUND - 560}) scale(${pop(f, films, 11) * interpolate(f, [climb + 30, climb + 40], [1, 0], clamp)})`}>
						<circle cx={-170} cy={150} r={14} fill="#ffffff" stroke={INK} strokeWidth={4} />
						<circle cx={-130} cy={110} r={22} fill="#ffffff" stroke={INK} strokeWidth={4} />
						<rect x={-120} y={-100} width={240} height={180} rx={40} fill="#ffffff" stroke={INK} strokeWidth={6} />
						<rect x={-86} y={-70} width={172} height={120} rx={8} fill="#22232a" />
						{[-60, -20, 20, 60].map((sx) => (
							<g key={sx}>
								<rect x={sx - 8} y={-66} width={16} height={10} rx={2} fill="#ffffff" />
								<rect x={sx - 8} y={36} width={16} height={10} rx={2} fill="#ffffff" />
							</g>
						))}
						<rect x={-6} y={-40} width={12} height={74} fill="#9a5a34" />
						<circle cx={0} cy={-38} r={28} fill="#3a8a4a" />
						<circle cx={14} cy={-18} r={9} fill="#f3eee2" />
					</g>
				)}
			</Stage16>
			<Chip f={f} at={films + 4} x={1090} y={420} text="КАК В КИНО…" color="#5a5a66" size={40} to={climb + 30} />
			<Chip f={f} at={w(n, 'дерево') - 4} x={1150} y={330} text="ЛЕЗЕТ НА ДЕРЕВО" color={RED} size={46} />
		</AbsoluteFill>
	);
};
// the climbing hands: −1…1, a smooth back-and-forth (one hand goes up while the other comes down)
const climbArm = (t: number) => Math.sin(t / 7);

// ============================================================ 24. mistake three: bears climb (the young ones nimbly); or it just waits below =====
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const n = 24;
	const out = w(n, 'медведи') - 4;
	const climb = w(n, 'лазать') - 10;
	const young = w(n, 'молодые') - 6;
	const wait = w(n, 'если') - 6;
	const below = w(n, 'ждать') - 6;
	const PX = 640;
	const P2 = 1900;
	// the camera: on Гога's pine, over to the pine where a young bear climbs, and back
	const cam =
		f < wait
			? camAt(f, out + 10, climb + 26, {s: 0.78, cx: 900, cy: 420}, {s: 0.78, cx: 1640, cy: 420})
			: camAt(f, wait, wait + 30, {s: 0.78, cx: 1640, cy: 420}, {s: 0.78, cx: 900, cy: 420});
	// the young bear goes up the trunk (fast after «молодые»)
	const cy = interpolate(f, [climb, young, young + 40], [690, 540, 330], clamp);
	const cph = (690 - cy) / 26;
	// the big bear walks up to the foot of Гога's pine and looks up at him
	const T0 = wait + 6;
	const T1 = below - 4;
	const bt = interpolate(f, [T0, T1], [0, 1], clamp);
	const bx = 2300 - (2300 - 1010) * (1 - (1 - bt) * (1 - bt));
	const bamp = Math.min(1, (1 - bt) * 2.2);
	const gray = interpolate(f, [out + 8, out + 20], [0.75, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: `grayscale(${gray}) brightness(${1 - gray * 0.15})`}}>
				<Stage16 bg="#8fc8ee">
					<Layer cam={cam}>
						<g transform="translate(-500,0)">
							<Forest tone="day" seed={25} w={3300} />
						</g>
						<Pine x={PX} y={GROUND} />
						<Pine x={P2} y={GROUND} flip />
						{/* the young bear climbing: a bear on its side, turned up the trunk (its paws on the bark) */}
						{f >= climb - 10 && (
							<g transform={`translate(${P2 + 50},${cy}) rotate(90)`}>
								<Bear s={0.5} pose="walk" ph={cph} fur="brown" />
							</g>
						)}
						<OnBranch px={PX} f={f} look={f >= wait && f < T1 ? [0.9, 0.3] : [0.4, 0.8]} />
						{f >= T0 && <Bear x={bx} y={GROUND + 10} s={0.78} pose={bt < 1 ? 'walk' : 'stand4'} amp={bamp} ph={(2300 - bx) / 50} head={bt >= 1 ? interpolate(f, [T1, T1 + 12], [0, -26], clamp) : 0} />}
					</Layer>
				</Stage16>
			</AbsoluteFill>
			<StopChobi n={n} f={f} at={0} to={out} label="ОШИБКА №3 · ДЕРЕВО" />
			<Chip f={f} at={climb + 20} x={1260} y={170} text="МЕДВЕДИ ЛАЗАЮТ ПО ДЕРЕВЬЯМ" color={BROWN} size={42} to={wait} />
			<Chip f={f} at={young + 4} x={1260} y={270} text="МОЛОДЫЕ — ОСОБЕННО ЛОВКО" color={RED} size={42} to={wait} />
			<Chip f={f} at={below + 2} x={1240} y={420} text="ЖДЁТ ВНИЗУ" color={RED} size={54} />
		</AbsoluteFill>
	);
};

// ============================================================ 25. a tree is no refuge — it is a trap with no way out =====
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const n = 25;
	const trap = w(n, 'ловушка') - 6;
	const nowhere = w(n, 'некуда') - 6;
	const PX = 640;
	const cam = camAt(f, 0, len(n), {s: 0.78, cx: 900, cy: 420}, {s: 0.7, cx: 860, cy: 380});
	// the bear paces under the tree: a few steps to the right, it turns, back again
	const t0 = 18;
	const t1 = 30;
	const t2 = 70;
	const t3 = 82;
	const t4 = 124;
	const bx = f < t1 ? 1010 : f < t2 ? interpolate(f, [t1, t2], [1010, 1220], {...clamp, easing: (t) => t * t * (3 - 2 * t)}) : f < t3 ? 1220 : interpolate(f, [t3, t4], [1220, 1010], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const moving = (f >= t1 && f < t2) || (f >= t3 && f < t4);
	// it faces left (1), turns to face right (−1) to walk off, turns back (1) to walk back
	const k = f < t0 ? 1 : f < t1 ? Math.cos(Math.PI * sm((f - t0) / 10)) : f < t2 ? -1 : f < t3 ? Math.cos(Math.PI * (1 + sm((f - t2) / 10))) : 1;
	const segT = f < t2 ? (f - t1) / (t2 - t1) : (f - t3) / (t4 - t3);
	const amp = moving ? Math.min(1, Math.sin(Math.PI * Math.max(0, Math.min(1, segT))) * 2) : 0;
	const dusk = interpolate(f, [0, len(n)], [0, 0.32], clamp);
	const G = GROUND + BRANCH.y;
	const HX = PX + BRANCH.x;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Layer cam={cam}>
					<g transform="translate(-500,0)">
						<Forest tone="day" seed={25} w={3300} />
					</g>
					<Pine x={PX} y={GROUND} />
					<Pine x={1900} y={GROUND} flip />
					<g transform={`translate(${1900 + 50},330) rotate(90)`}>
						<Bear s={0.5} pose="walk" ph={(690 - 330) / 26} fur="brown" />
					</g>
					<rect x={-600} y={-800} width={3600} height={1700} fill="#f08a3a" opacity={dusk} />
					<OnBranch px={PX} f={f} look={[0.5, 0.9]} />
					<Turn x={bx} y={GROUND + 10} k={k}>
						<Bear s={0.78} pose={moving ? 'walk' : 'stand4'} amp={amp} ph={Math.abs(bx - 1010) / 50} head={moving ? 0 : -22} />
					</Turn>
					{/* the cage round him */}
					{f >= trap && (
						<g transform={`translate(${HX},${G - 200}) scale(${pop(f, trap, 10)})`} opacity={0.9}>
							<rect x={-170} y={-280} width={340} height={330} rx={40} fill="none" stroke={RED} strokeWidth={12} />
							{[-112, -56, 0, 56, 112].map((x) => (
								<line key={x} x1={x} y1={-276} x2={x} y2={46} stroke={RED} strokeWidth={9} opacity={0.75} />
							))}
						</g>
					)}
					{/* nowhere to go: left, right, down — all crossed out */}
					{f >= nowhere &&
						(
							[
								[-1, 0],
								[1, 0],
								[0, 1],
							] as const
						).map(([dx, dy], i) => {
							const p = pop(f, nowhere + i * 5, 10);
							const ax = HX + dx * 260;
							const ay = G - 200 + dy * 300;
							return (
								<g key={i} transform={`translate(${ax},${ay}) scale(${p})`}>
									<circle r={46} fill="#ffffff" stroke={RED} strokeWidth={8} />
									<path d="M -20,-20 L 20,20 M 20,-20 L -20,20" stroke={RED} strokeWidth={10} strokeLinecap="round" />
								</g>
							);
						})}
				</Layer>
			</Stage16>
			<Plaque f={f} at={2} x={960} y={110} text="ДЕРЕВО — НЕ УБЕЖИЩЕ" color={BROWN} size={46} />
			<Chip f={f} at={trap + 6} x={1330} y={300} text="ЛОВУШКА" color={RED} size={64} />
		</AbsoluteFill>
	);
};

// ============================================================ 26. what if it charges? =====
export const S26: React.FC = () => {
	const f = useCurrentFrame();
	const n = 26;
	const go = w(n, 'бросился') - 10;
	const p = interpolate(f, [go, len(n) + 6], [0, 1], clamp);
	const e = p * p;
	const s = 0.24 + e * 1.45;
	const y = GROUND - 116 + e * 520;
	// the ground shakes as it comes — a slow sway, not a jitter
	const sh = e * 6;
	const sx = Math.sin(f * 0.8) * sh;
	const sy = Math.cos(f * 1.05) * sh;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<g transform={`translate(${sx},${sy})`}>
					<Forest tone="day" seed={19} path={false} />
					{f >= go &&
						[0, 1, 2, 3].map((k) => {
							const t = ((f - go) / 12 + k / 4) % 1;
							return <circle key={k} cx={960 + (rnd(k + 4) - 0.5) * 420 * s} cy={y - 8 - t * 40 * s} r={(26 + t * 60) * s} fill="#d8c09a" opacity={(1 - t) * 0.55} />;
						})}
					<ellipse cx={960} cy={y + 4} rx={250 * s} ry={28 * s} fill="#000" opacity={0.18} />
					<BearFront x={960} y={y} s={s} run={f >= go ? (f - go) * 0.6 : undefined} mouth={f >= go ? 0.5 : 0} ears={f >= go ? 'back' : 'up'} />
				</g>
			</Stage16>
			<Vig k={0.2 + e * 0.45} color="60,0,0" />
			<Chip f={f} at={go + 6} x={960} y={140} text="А ЕСЛИ БРОСИЛСЯ?" color={RED} size={58} />
		</AbsoluteFill>
	);
};

// ============================================================ 27. mostly a bluff: it rushes at you and stops short or runs past — testing you =====
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const n = 27;
	const bluff = w(n, 'ложная') - 4;
	const r1 = w(n, 'несётся') - 6;
	const stop = w(n, 'останавливается') + 2;
	const r2 = w(n, 'проносится') - 8;
	const back = w(n, 'проверяет') - 12;
	const test = w(n, 'проверяет') - 2;
	const GX = 640;
	const X0 = 1780;
	const X1 = 1180;
	const X2 = 170;
	let bx = X0;
	let by = GROUND + 10;
	let amp = 0;
	let run = false;
	if (f >= r1 && f < stop) {
		const t = (f - r1) / (stop - r1);
		bx = X0 - (X0 - X1) * (1 - (1 - t) * (1 - t));
		amp = Math.min(1, (1 - t) * 2.4);
		run = true;
	} else if (f >= stop && f < r2) bx = X1;
	else if (f >= r2 && f < back) {
		const t = (f - r2) / (back - r2);
		const e = sm(t);
		bx = X1 - (X1 - X2) * e;
		by = GROUND + 10 + 66 * e;
		amp = Math.min(1, Math.sin(Math.PI * t) * 1.6);
		run = true;
	} else if (f >= back) {
		bx = X2;
		by = GROUND + 76;
	}
	const ph = f < r2 ? (X0 - bx) / 30 : (X1 - bx) / 30;
	const k = f < back ? 1 : Math.cos(Math.PI * sm((f - back) / 10));
	const angry = f >= r1 && f < r2 + 10;
	const lookX = Math.max(-1, Math.min(1, (bx - GX) / 420));
	const passing = f >= r2;
	const bear = (
		<Turn x={bx} y={by} k={k}>
			<Bear s={0.78} pose={run ? 'run' : 'stand4'} amp={run ? amp : 1} ph={ph} mouth={angry ? 0.45 : 0.1} ears={angry ? 'back' : 'up'} head={f >= back + 10 ? -6 : 0} />
		</Turn>
	);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={27} />
				{!passing && bear}
				{/* the dust where it stops dead */}
				{f >= stop - 14 &&
					f < stop + 26 &&
					[0, 1, 2, 3, 4].map((i) => {
						const t = (f - (stop - 14)) / 40;
						return <circle key={i} cx={X1 - 150 + (i - 2) * 50 - t * 90} cy={GROUND - 10 - t * 50 - (i % 2) * 20} r={22 + t * 50} fill="#d8c09a" opacity={(1 - t) * 0.6} />;
					})}
				<You x={GX} y={GROUND} s={0.55} f={f} face={{eyes: 'wide', mouth: f >= r1 ? 'o' : 'flat', brows: 'raised', look: [lookX, passing ? 0.4 : 0], sweat: f >= r1 ? 1 : 0.4}} />
				{passing && bear}
				{/* it looks him over */}
				{f >= test && (
					<g transform={`translate(${X2 + 150},${GROUND - 330}) scale(${pop(f, test, 10)})`}>
						<circle r={40} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={17} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={48} fill={INK}>
							?
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={bluff} x={960} y={110} text="ЛОЖНАЯ АТАКА" color={RED} size={52} />
			<Chip f={f} at={stop} x={1180} y={330} text="ОСТАНОВИЛСЯ" color={INK} size={46} to={r2} />
			<Chip f={f} at={r2 + 10} x={1180} y={330} text="ИЛИ ПРОНЁССЯ МИМО" color={INK} size={46} to={back} />
			<Chip f={f} at={test + 4} x={1080} y={330} text="ПРОВЕРЯЕТ: ОПАСЕН ЛИ ТЫ?" color={BROWN} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 29. don't run; stand still; talk calmly; back off slowly once it stops =====
const UP_R = arm([116, -436], [148, -520]);
const UP_L = arm([-116, -436], [-148, -520]);
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const n = 29;
	const noRun = w(n, 'бежать') - 6;
	const stand = w(n, 'стой') - 6;
	const talk = w(n, 'говори') - 4;
	const backOff = w(n, 'медленно') - 4;
	const stops = w(n, 'остановится') - 6;
	const gx = interpolate(f, [backOff, len(n)], [640, 430], clamp);
	const talking = f >= talk && f < talk + 44;
	const huff = f < stops;
	// the ghost of a running Гога (the wrong move), crossed out
	const ghost = interpolate(f, [noRun, noRun + 40], [640, 300], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={29} />
				<Bear x={1260} y={GROUND + 10} s={0.8} pose="stand4" mouth={huff ? 0.2 + 0.25 * Math.max(0, Math.sin(f / 6)) : 0} ears={huff ? 'back' : 'up'} head={huff ? 0 : 8} />
				{huff && <Puffs f={f} x={1260 - 290} y={GROUND - 210} />}
				{f >= noRun && f < stand + 6 && (
					<g opacity={0.4 * interpolate(f, [stand - 6, stand + 6], [1, 0], clamp)}>
						<You x={ghost} y={GROUND} s={0.55} f={f} walk={f * 0.75} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.9, 0]}} />
					</g>
				)}
				{f >= noRun + 10 && f < stand + 6 && (
					<g transform={`translate(${ghost},${GROUND - 220}) scale(${pop(f, noRun + 10, 10) * interpolate(f, [stand - 6, stand + 6], [1, 0], clamp)})`}>
						<path d="M -120,-120 L 120,120 M 120,-120 L -120,120" stroke={RED} strokeWidth={22} strokeLinecap="round" />
					</g>
				)}
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={f}
					walk={f >= backOff ? stepPh(640 - gx, 0.9) : undefined}
					face={{eyes: 'wide', mouth: talking ? (Math.sin(f / 3.5) > 0 ? 'open' : 'flat') : 'tight', brows: f >= stand ? 'neutral' : 'raised', look: [0.85, 0], sweat: 0.9}}
					armL={f >= stand ? armTo(-1, f, stand, 'down', UP_L, 12) : 'down'}
					armR={f >= stand ? armTo(1, f, stand, 'down', UP_R, 12) : 'down'}
				/>
				{/* «back off sideways, facing it» */}
				{f >= backOff + 6 && (
					<g opacity={pop(f, backOff + 6, 12)}>
						<path d={`M ${gx - 90},${GROUND + 14} L ${gx - 230},${GROUND + 14}`} stroke="#ffffff" strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />
						<path d={`M ${gx - 206},${GROUND - 8} L ${gx - 236},${GROUND + 14} L ${gx - 206},${GROUND + 36}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
			</Stage16>
			{talking && (
				<div style={{position: 'absolute', left: gx + 250, top: 330, transform: `translate(-50%,-50%) scale(${pop(f, talk, 10)})`, background: '#fff', border: `6px solid ${INK}`, borderRadius: 24, padding: '10px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>ЭЙ, МИШКА… СПОКОЙНО…</div>
			)}
			<Chip f={f} at={2} x={960} y={110} text="САМОЕ СТРАШНОЕ В ЛЕСУ" color={BROWN} size={44} to={noRun - 4} />
			<Chip f={f} at={noRun + 6} x={1450} y={160} text="НЕ БЕГИ" color={RED} size={44} />
			<Chip f={f} at={stand + 4} x={1450} y={245} text="СТОЙ НА МЕСТЕ" color={GREEN} size={44} />
			<Chip f={f} at={talk + 14} x={1450} y={330} text="ГОВОРИ СПОКОЙНО" color={GREEN} size={44} />
			<Chip f={f} at={backOff + 4} x={1450} y={415} text="МЕДЛЕННО ОТХОДИ" color={GREEN} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 30. what is it like — one step from a bear? =====
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const n = 30;
	const step = w(n, 'шаге') - 6;
	const cam = camAt(f, 0, len(n), {s: 1.6, cx: 830, cy: 560}, {s: 1.95, cx: 820, cy: 540});
	const beat = Math.max(0, Math.sin((f / 30) * Math.PI * 2)) ** 6;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Layer cam={cam}>
					<Forest tone="day" seed={29} />
					<Bear x={1130} y={GROUND + 10} s={0.8} pose="stand4" head={-10} mouth={0.12} ears="back" />
					<Puffs f={f} x={880} y={GROUND - 232} k={0.6} />
					<You x={700} y={GROUND} s={0.55} f={f} face={{eyes: 'wide', mouth: 'tight', brows: 'raised', look: [0.95, 0.15], sweat: 1}} />
				</Layer>
			</Stage16>
			<Vig k={0.45 + beat * 0.25} color="40,0,0" />
			<Chip f={f} at={step} x={960} y={150} text="В ШАГЕ ОТ МЕДВЕДЯ" color={RED} size={58} />
		</AbsoluteFill>
	);
};

// ============================================================ 34. a new day: two cubs on a glade; so cute; the phone, a selfie =====
const PHONE = (
	<g transform="scale(0.55)">
		<Phone glow={0} />
	</g>
);
const HOLD_S = arm([112, -318], [150, -400], {fist: true, item: PHONE, itemAng: 0});
const SELFIE_S = arm([118, -440], [160, -516], {fist: true, item: PHONE, itemAng: 0});
const LOW_S = arm([96, -300], [116, -220], {fist: true, item: PHONE, itemAng: 0});
// one arm to another with the same thing in the hand (it stays in the hand all the way)
const glide = (a: ArmSpec, b: ArmSpec, t: number): ArmSpec => {
	const e = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
	const L = (p: number, q: number) => p + (q - p) * e;
	return {...b, el: [L(a.el[0], b.el[0]), L(a.el[1], b.el[1])], ha: [L(a.ha[0], b.ha[0]), L(a.ha[1], b.ha[1])], hang: L(a.hang ?? 0, b.hang ?? 0)};
};
const CUB_A = 1060;
const CUB_B = 1250;
// the glade: two cubs playing, Гога (gx) with or without his phone; drawn by 34 and 35 (frozen), and 36 goes on from it
const Glade: React.FC<{f: number; gx: number; walk?: number; hand: ArmSpec | 'down'; face: YouFace; mom?: React.ReactNode; aX?: number; aRun?: boolean; aAmp?: number}> = ({f, gx, walk, hand, face, mom, aX = CUB_A, aRun = false, aAmp = 1}) => {
	return (
		<g>
			<Forest tone="day" seed={21} />
			{/* flowers on the glade */}
			{Array.from({length: 34}).map((_, i) => {
				const x = rnd(i + 300) * 1920;
				const y = GROUND - 100 + rnd(i + 320) * 260;
				if (Math.abs(y - GROUND) < 56) return null;
				return <circle key={i} cx={x} cy={y} r={6 + rnd(i) * 4} fill={['#ffffff', '#f2c230', '#e86a9a'][i % 3]} />;
			})}
			{mom}
			<Bush x={1660} y={GROUND - 40} s={1.6} c="#3f8250" />
			<Bush x={1860} y={GROUND - 20} s={1.4} c="#3a7a4a" />
			{/* cub A paws at cub B; cub B stands up and waves its paws */}
			<Bear x={aX} y={GROUND + 6} s={0.36} dir={-1} fur="cub" pose={aRun ? 'run' : 'stand4'} amp={aAmp} ph={aRun ? (aX - CUB_A) / 18 : 0} head={aRun ? 0 : Math.sin(f / 8) * 10} slap={aRun ? 0 : Math.max(0, Math.sin(f / 10))} />
			<BearUp x={CUB_B} y={GROUND + 6} s={0.4} fur="cub" arms={0.45 + 0.3 * Math.sin(f / 9)} head={Math.sin(f / 11) * 8} />
			<You x={gx} y={GROUND} s={0.55} f={f} walk={walk} face={face} armR={hand} />
		</g>
	);
};
const g34 = (f: number) => {
	const n = 34;
	const walkTo = w(n, 'видит');
	const go = w(n, 'идёт') - 4;
	const arrive = w(n, 'селфи') - 6;
	return f < go ? interpolate(f, [0, walkTo], [140, 480], clamp) : interpolate(f, [go, arrive], [480, 760], clamp);
};
const face34 = (f: number): YouFace => {
	const n = 34;
	const sees = w(n, 'видит');
	const cute = w(n, 'милые') - 6;
	return {eyes: f >= cute ? 'narrow' : f >= sees ? 'wide' : 'open', mouth: f >= cute ? 'smile' : f >= sees ? 'o' : 'smile', brows: f >= sees && f < cute ? 'raised' : 'neutral', look: f >= w(n, 'селфи') - 4 ? [0.7, -0.5] : [0.7, 0]};
};
const hand34 = (f: number): ArmSpec | 'down' => {
	const n = 34;
	const phone = w(n, 'телефон') - 10;
	const selfie = w(n, 'селфи') - 6;
	if (f < phone) return 'down';
	return f < selfie ? armTo(1, f, phone, 'down', HOLD_S, 8) : glide(HOLD_S, SELFIE_S, (f - selfie) / 10);
};
export const S34: React.FC = () => {
	const f = useCurrentFrame();
	const n = 34;
	const sees = w(n, 'видит');
	const two = w(n, 'двух') - 6;
	const cute = w(n, 'милые') - 6;
	const go = w(n, 'идёт') - 4;
	const selfie = w(n, 'селфи') - 6;
	const gx = g34(f);
	const walking = f < sees || (f >= go && f < selfie);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Glade f={f} gx={gx} walk={walking ? stepPh(gx - 140, 1.4) : undefined} hand={hand34(f)} face={face34(f)} />
				{/* hearts: so cute */}
				{f >= cute &&
					[0, 1, 2].map((k) => {
						const t = ((f - cute) / 40 + k / 3) % 1;
						return <path key={k} transform={`translate(${gx - 40 + k * 40},${GROUND - 460 - t * 90}) scale(${0.8 + t * 0.4})`} d="M 0,14 C -22,0 -24,-18 -11,-20 C -4,-21 0,-16 0,-12 C 0,-16 4,-21 11,-20 C 24,-18 22,0 0,14 Z" fill="#e8507a" opacity={(1 - t) * 0.95} />;
					})}
				{/* the shutter: a little burst at the phone */}
				{f >= selfie + 10 && f < selfie + 22 && (
					<g transform={`translate(${gx + 160 * 0.55},${GROUND - 560 * 0.55})`} opacity={1 - (f - selfie - 10) / 12}>
						{Array.from({length: 8}).map((_, i) => {
							const a = (i / 8) * Math.PI * 2;
							return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" />;
						})}
					</g>
				)}
			</Stage16>
			<Chip f={f} at={2} x={960} y={110} text="НОВЫЙ ДЕНЬ" color={GREEN} size={44} to={two - 4} />
			<Chip f={f} at={two + 4} x={1150} y={430} text="ДВА МЕДВЕЖОНКА" color={BROWN} size={44} to={cute + 30} />
			<Chip f={f} at={selfie + 8} x={960} y={140} text="СЕЛФИ С МЕДВЕЖАТАМИ?!" color={RED} size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 35. «Стоп, Гога!» — mistake four =====
export const S35: React.FC = () => {
	const f = useCurrentFrame();
	const n = 35;
	const F = len(34) - 1;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.75) brightness(0.85)'}}>
				<Stage16 bg="#8fc8ee">
					<Glade f={F} gx={g34(F)} hand={hand34(F)} face={face34(F)} />
				</Stage16>
			</AbsoluteFill>
			<StopChobi n={n} f={f} at={0} to={len(n) - 18} label="ОШИБКА №4 · МЕДВЕЖАТА" />
		</AbsoluteFill>
	);
};

// ============================================================ 36. where the cubs are, the mother is: the most dangerous bear in the forest =====
const RISE = 8;
export const S36: React.FC = () => {
	const f = useCurrentFrame();
	const n = 36;
	const F = len(34) - 1;
	const mama = w(n, 'мама') - 16;
	const her = w(n, 'медведица') - 4;
	const up = w(n, 'самый') - 8;
	const MX = 1560;
	const mt = interpolate(f, [mama, mama + 40], [0, 1], clamp);
	const mx = 2100 - (2100 - MX) * (1 - (1 - mt) * (1 - mt));
	const r = interpolate(f, [up, up + RISE], [0.6, 1], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)});
	// cub A runs to its mother
	const aX = interpolate(f, [mama + 30, mama + 64], [CUB_A, 1380], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const aRun = f >= mama + 30 && f < mama + 64;
	const aAmp = Math.min(1, (aX - CUB_A) / 40, (1380 - aX) / 60);
	const mom =
		f < mama ? null : f < up ? (
			<Bear x={mx} y={GROUND + 6} s={0.86} pose={mt < 1 ? 'walk' : 'stand4'} amp={Math.min(1, (1 - mt) * 2.2)} ph={(2100 - mx) / 50} head={f >= her ? -4 : 0} ears={f >= her ? 'back' : 'up'} />
		) : (
			<g transform={`translate(${MX},${GROUND + 6}) scale(1,${r}) translate(${-MX},${-GROUND - 6})`}>
				<BearUp x={MX} y={GROUND + 6} s={0.95} mouth={f >= up + RISE ? 0.85 : 0.3} ears="back" arms={0.25} />
			</g>
		);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Glade f={F + f} gx={g34(F)} hand={glide(SELFIE_S, LOW_S, (f - mama - 10) / 14)} face={{eyes: 'wide', mouth: f >= mama + 10 ? 'o' : 'smile', brows: f >= mama + 10 ? 'raised' : 'neutral', look: f >= mama + 6 ? [0.9, 0] : [0.7, -0.5], sweat: f >= up ? 1 : f >= mama + 10 ? 0.5 : 0}} mom={mom} aX={aX} aRun={aRun} aAmp={aAmp} />
				{f >= up && f < up + 14 && <ellipse cx={MX} cy={GROUND + 8} rx={180 * pop(f, up, 10)} ry={22} fill="#c9a26a" opacity={0.6 * (1 - (f - up) / 14)} />}
			</Stage16>
			<Chip f={f} at={mama + 8} x={960} y={130} text="ГДЕ МЕДВЕЖАТА — ТАМ И МАМА" color={BROWN} size={48} />
			<Chip f={f} at={up + 10} x={1080} y={260} text="САМЫЙ ОПАСНЫЙ МЕДВЕДЬ В ЛЕСУ" color={RED} size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 37. 600+ attacks studied worldwide; the commonest story — a mother with cubs =====
// the continents on the little globe (rough blobs) and where the attacks were (the north: America, Europe, Russia, Japan)
const LANDS = [
	'M -210,-120 C -170,-190 -90,-200 -60,-150 C -40,-110 -80,-60 -110,-20 C -130,10 -120,60 -150,70 C -190,40 -230,-40 -210,-120 Z',
	'M -10,-190 C 60,-230 190,-200 220,-120 C 236,-80 200,-40 150,-30 C 110,-20 90,10 60,-10 C 30,-40 -10,-60 -30,-100 C -40,-140 -30,-170 -10,-190 Z',
	'M -40,-30 C 0,-20 30,20 20,80 C 10,130 -20,160 -40,120 C -60,80 -70,10 -40,-30 Z',
	'M 120,40 C 160,30 200,60 190,100 C 180,130 140,130 120,100 Z',
];
export const S37: React.FC = () => {
	const f = useCurrentFrame();
	const n = 37;
	const num = w(n, 'шестисот') - 8;
	const most = w(n, 'самая') - 6;
	const mama = w(n, 'медведицей') - 8;
	const count = Math.round(interpolate(f, [num, num + 36], [0, 664], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)}));
	const dots = Math.floor(interpolate(f, [num, num + 40], [0, 46], clamp));
	const out = interpolate(f, [most - 10, most + 2], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	return (
		<AbsoluteFill style={{background: '#f3efe6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{out < 1 && (
					<g opacity={1 - out} transform={`translate(${-out * 300},0)`}>
						<g transform={`translate(560,540) scale(${pop(f, 2, 12)})`}>
							<circle r={270} fill="#bfe1f5" stroke={INK} strokeWidth={8} />
							{LANDS.map((d, i) => (
								<path key={i} d={d} fill="#8fc07a" stroke="#5a8a4a" strokeWidth={4} />
							))}
							{Array.from({length: dots}).map((_, i) => {
								const zones = [
									[-160, -120, 90, 70],
									[40, -150, 160, 70],
									[-10, -120, 60, 50],
									[170, -90, 30, 40],
								];
								const z = zones[i % 4];
								return <circle key={i} cx={z[0] + (rnd(i + 50) - 0.5) * z[2]} cy={z[1] + (rnd(i + 80) - 0.5) * z[3]} r={7} fill={RED} stroke="#ffffff" strokeWidth={2.5} />;
							})}
						</g>
					</g>
				)}
				{/* the commonest story: a mother with her cubs */}
				{f >= most + 2 && (
					<g transform={`translate(960,560) scale(${pop(f, most + 2, 12)})`}>
						<rect x={-560} y={-330} width={1120} height={560} rx={40} fill="#ffffff" stroke={RED} strokeWidth={12} />
						<rect x={-560} y={70} width={1120} height={160} rx={0} fill="#7aad58" />
						<rect x={-560} y={70} width={1120} height={160} rx={40} fill="none" />
						<g transform="translate(-60,150)">
							<BearUp s={0.62} mouth={0.8} ears="back" arms={0.25} />
						</g>
						<g transform="translate(230,150)">
							<Bear s={0.34} dir={-1} fur="cub" pose="stand4" />
						</g>
						<g transform="translate(-330,150)">
							<Bear s={0.32} fur="cub" pose="stand4" head={-8} />
						</g>
					</g>
				)}
			</svg>
			{out < 1 && (
				<div style={{position: 'absolute', left: 1320, top: 470, transform: `translate(-50%,-50%) translateX(${-out * 300}px)`, opacity: 1 - out, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: INK, whiteSpace: 'nowrap'}}>
					{f >= num && <div style={{fontSize: 190, lineHeight: 1, textShadow: `8px 8px 0 ${YEL}`, transform: `scale(${pop(f, num, 11)})`}}>{count}</div>}
					{f >= num + 10 && <div style={{fontSize: 46, marginTop: 14, transform: `scale(${pop(f, num + 10, 11)})`}}>НАПАДЕНИЙ БУРЫХ МЕДВЕДЕЙ</div>}
					{f >= num + 20 && <div style={{fontSize: 38, marginTop: 10, color: '#7a6a5a', transform: `scale(${pop(f, num + 20, 11)})`}}>2000–2015 · ПО ВСЕМУ МИРУ</div>}
				</div>
			)}
			<Plaque f={f} at={2} x={960} y={90} text="УЧЁНЫЕ РАЗОБРАЛИ НАПАДЕНИЯ" color={BROWN} size={42} to={most - 8} />
			<Plaque f={f} at={most} x={960} y={130} text="САМАЯ ЧАСТАЯ ИСТОРИЯ — №1" color={RED} size={46} />
			<Chip f={f} at={mama} x={960} y={790} text="МЕДВЕДИЦА С МЕДВЕЖАТАМИ" color={RED} size={56} />
			<div style={{position: 'absolute', right: 34, top: 26, fontFamily: HEAVY, fontWeight: 900, fontSize: 22, color: '#8a7a6a'}}>Bombieri и др., Scientific Reports, 2019</div>
		</AbsoluteFill>
	);
};

// ============================================================ 38. saw a cub — walk away the way you came; the mother is almost surely near =====
export const S38: React.FC = () => {
	const f = useCurrentFrame();
	const n = 38;
	const cub = w(n, 'медвежонка') - 6;
	const leave = w(n, 'уходи') - 8;
	const way = w(n, 'туда') - 4;
	const unseen = w(n, 'мамы') - 6;
	const near = w(n, 'почти') - 6;
	const gx = f < leave ? interpolate(f, [0, cub + 6], [420, 600], clamp) : interpolate(f, [leave, len(n) - 10], [600, 150], clamp);
	const walking = f < cub + 6 || f >= leave;
	const MX = 1600;
	const peek = interpolate(f, [near, near + 16], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)});
	const shake = f >= unseen && f < near + 30 ? (f - unseen) / 4 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={31} />
				{/* the mother rises behind the bush */}
				{f >= near && (
					<g transform={`translate(0,${(1 - peek) * 260})`}>
						<BearUp x={MX} y={GROUND} s={0.85} ears="back" head={-6} />
					</g>
				)}
				<Bush x={MX - 20} y={GROUND + 10} s={2.3} c="#2f6a40" shake={shake} />
				<Bear x={1250} y={GROUND + 6} s={0.36} fur="cub" pose="stand4" head={Math.sin(f / 9) * 8} />
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={f}
					walk={walking ? (f < leave ? stepPh(gx - 420, 1.4) : stepPh(600 - gx, 1.4)) : undefined}
					face={{eyes: f >= cub ? 'wide' : 'open', mouth: f >= cub ? 'flat' : 'smile', brows: f >= cub ? 'raised' : 'neutral', look: f >= leave ? [-0.8, 0] : [0.7, 0], sweat: f >= cub ? 0.5 : 0}}
				/>
				{/* back the way he came */}
				{f >= way && (
					<g opacity={pop(f, way, 12)}>
						<path d={`M 560,${GROUND + 16} L 120,${GROUND + 16}`} stroke="#ffffff" strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />
						<path d={`M 150,${GROUND - 8} L 116,${GROUND + 16} L 150,${GROUND + 40}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
			</Stage16>
			<Chip f={f} at={cub + 4} x={1250} y={480} text="МЕДВЕЖОНОК" color={BROWN} size={42} to={unseen - 4} />
			<Chip f={f} at={leave + 4} x={560} y={180} text="СРАЗУ УХОДИ" color={GREEN} size={50} />
			<Chip f={f} at={way + 6} x={560} y={290} text="ТУДА, ОТКУДА ПРИШЁЛ" color={GREEN} size={40} />
			<Chip f={f} at={unseen + 4} x={1350} y={180} text="МАМЫ НЕ ВИДНО…" color={INK} size={42} to={near + 4} />
			<Chip f={f} at={near + 14} x={1350} y={180} text="НО ОНА РЯДОМ" color={RED} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 39. evening: the tent; he takes a sausage, condensed milk, crisps in with him =====
const TX = 1180;
const SNACKS = [Sausage, MilkTin, Crisps];
// his arms full: where each snack sits in front of his belly (px from his feet) and how big it is
const PILE: [number, number, number][] = [
	[0, -128, 0.6],
	[-12, -164, 0.62],
	[30, -166, 0.5],
];
const BAG = 630; // his backpack on the ground (the snacks come out of it)
const HUG_L = arm([-106, -300], [-56, -262], {fist: true});
const HUG_R = arm([106, -300], [56, -262], {fist: true});
const DOOR: [number, number] = [TX - 10, GROUND - 46];
const Pack: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<ellipse cx={0} cy={2} rx={62} ry={10} fill="#000" opacity={0.18} />
		<rect x={-48} y={-104} width={96} height={104} rx={26} fill="#2e4f96" stroke="#18284c" strokeWidth={5} />
		<path d="M -48,-74 C -30,-112 30,-112 48,-74 L 48,-60 L -48,-60 Z" fill="#243f7a" stroke="#18284c" strokeWidth={5} strokeLinejoin="round" />
		<rect x={-30} y={-46} width={60} height={34} rx={9} fill="#243f7a" stroke="#18284c" strokeWidth={4} />
	</g>
);
type CampS = {tent: number; take: number[]; put: number[]; gx: number; walk?: number; hug: number; think: number; look: [number, number]};
// the evening, frame by frame: the tent goes up; each snack comes out of the bag into his arms on its word; he carries
// them to the tent and puts them in; the thought of a midnight snack
const camp39 = (f: number): CampS => {
	const n = 39;
	const pitch = w(n, 'ставит') - 6;
	const words = [w(n, 'колбасу') - 6, w(n, 'сгущёнку') - 6, w(n, 'чипсы') - 6];
	const inT = w(n, 'вдруг') - 8;
	const night = w(n, 'ночью') - 4;
	const gx = interpolate(f, [inT, inT + 24], [820, 1010], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const put0 = inT + 26;
	return {
		tent: interpolate(f, [pitch, pitch + 22], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3}),
		take: words.map((a) => interpolate(f, [a, a + 14], [0, 1], clamp) * (f >= a ? 1 : 0)),
		put: [0, 1, 2].map((k) => interpolate(f, [put0 + k * 6, put0 + k * 6 + 12], [0, 1], clamp)),
		gx,
		walk: f >= inT && f < inT + 24 ? stepPh(gx - 820, 1.3) : undefined,
		hug: interpolate(f, [words[0] - 8, words[0] + 4, put0 + 18, put0 + 28], [0, 1, 1, 0], clamp),
		think: f >= night ? pop(f, night, 11) : 0,
		look: f >= words[0] - 10 && f < inT ? [-0.7, 0.5] : [0.7, 0],
	};
};
const Camp: React.FC<{f: number; c: CampS; working?: number}> = ({f, c, working = 0}) => {
	const armL = working > 0 ? arm([-110, -330], [-60 - working * 30, -420], {fist: true}) : mixArm(armPose(-1, 'down'), HUG_L, c.hug);
	const armR = working > 0 ? arm([110, -330], [60 + working * 30, -420], {fist: true}) : mixArm(armPose(1, 'down'), HUG_R, c.hug);
	return (
		<g>
			<Forest tone="dusk" seed={33} />
			<g transform={`translate(${TX},${GROUND + 8}) scale(${0.3 + 0.7 * c.tent},${c.tent}) translate(${-TX},${-GROUND - 8})`}>{c.tent > 0.02 && <Tent x={TX} y={GROUND + 8} />}</g>
			<Pack x={BAG} y={GROUND + 6} />
			<You x={c.gx} y={GROUND} s={0.55} f={f} walk={c.walk} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: c.look}} armL={armL} armR={armR} />
			{SNACKS.map((Item, k) => {
				if (c.take[k] <= 0 || c.put[k] >= 1) return null;
				const [dx, dy, sc] = PILE[k];
				// out of the bag into his arms, then from his arms into the tent (each along a little arc)
				const hold: [number, number] = [c.gx + dx, GROUND + dy];
				const a: [number, number] = c.put[k] > 0 ? hold : [BAG, GROUND - 70];
				const b: [number, number] = c.put[k] > 0 ? DOOR : hold;
				const p = c.put[k] > 0 ? c.put[k] : c.take[k];
				const e = p * p * (3 - 2 * p);
				const x = a[0] + (b[0] - a[0]) * e;
				const y = a[1] + (b[1] - a[1]) * e - Math.sin(Math.PI * e) * 70;
				const k2 = c.put[k] > 0 ? sc * (1 - 0.7 * e) : sc * (0.5 + 0.5 * e);
				return (
					<g key={k} transform={`translate(${x},${y}) scale(${k2})`}>
						<Item />
					</g>
				);
			})}
			{/* a thought: a midnight snack under the moon */}
			{c.think > 0 && (
				<g transform={`translate(${c.gx - 300},${GROUND - 600}) scale(${c.think})`}>
					<circle cx={200} cy={160} r={14} fill="#ffffff" stroke={INK} strokeWidth={4} />
					<circle cx={150} cy={100} r={22} fill="#ffffff" stroke={INK} strokeWidth={4} />
					<rect x={-130} y={-100} width={240} height={150} rx={40} fill="#1b2550" stroke={INK} strokeWidth={6} />
					<circle cx={-60} cy={-30} r={30} fill="#f2f4ea" />
					<circle cx={-48} cy={-38} r={28} fill="#1b2550" />
					<g transform="translate(40,-10) scale(0.7)">
						<Sausage />
					</g>
				</g>
			)}
		</g>
	);
};
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const n = 39;
	const pitch = w(n, 'ставит') - 6;
	const night = w(n, 'ночью') - 4;
	const c = camp39(f);
	const working = f >= pitch && f < pitch + 26 ? 0.5 + 0.5 * Math.sin(f / 3) : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f0905a">
				<Camp f={f} c={c} working={working} />
			</Stage16>
			<Chip f={f} at={2} x={960} y={110} text="ВЕЧЕР" color="#c0702a" size={44} to={pitch - 4} />
			<Chip f={f} at={w(n, 'колбасу') - 2} x={1500} y={250} text="КОЛБАСА" color="#b8434a" size={40} />
			<Chip f={f} at={w(n, 'сгущёнку') - 2} x={1500} y={340} text="СГУЩЁНКА" color="#2f6fd0" size={40} />
			<Chip f={f} at={w(n, 'чипсы') - 2} x={1500} y={430} text="ЧИПСЫ" color="#c09a10" size={40} />
			<Chip f={f} at={night + 10} x={1500} y={150} text="ВСЁ — В ПАЛАТКУ" color={RED} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 40. mistake five: the nose smells the food from kilometres; night guests =====
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const n = 40;
	const out = w(n, 'медвежий') - 6;
	const nose = w(n, 'учует') - 6;
	const km = w(n, 'километры') - 6;
	const night = w(n, 'ночью') - 6;
	const guests = w(n, 'придут') - 4;
	const F = len(39) - 1;
	const c = camp39(F);
	// the dusk freezes (Чоби), then night falls: the light comes on in the tent, Гога is inside
	const dark = interpolate(f, [out + 6, out + 30], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const gray = interpolate(f, [out, out + 12], [0.75, 0], clamp);
	// the bear: walks in at the far right, stops and sniffs; at night it comes up to the tent (nearer: bigger, lower)
	const a1 = interpolate(f, [nose, km], [0, 1], clamp);
	const a2 = interpolate(f, [night, guests + 10], [0, 1], clamp);
	const e1 = 1 - (1 - a1) * (1 - a1);
	const e2 = a2 * a2 * (3 - 2 * a2);
	const bx = f < night ? 2100 - (2100 - 1800) * e1 : 1800 - (1800 - 1560) * e2;
	const by = f < night ? GROUND - 40 : GROUND - 40 + 50 * e2;
	const bs = f < night ? 0.5 : 0.5 + 0.3 * e2;
	const bWalk = (f >= nose && a1 < 1) || (f >= night && a2 < 1);
	const bAmp = f < night ? Math.min(1, (1 - a1) * 2.2) : Math.min(1, a2 * 4, (1 - a2) * 2.2);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: `grayscale(${gray}) brightness(${1 - gray * 0.15})`}}>
				<Stage16 bg="#f0905a">
					{dark < 1 && <Camp f={F} c={c} />}
					{dark > 0 && (
						<g opacity={dark}>
							<Forest tone="night" seed={33} />
							<Tent x={TX} y={GROUND + 8} glow={0.8 + 0.1 * Math.sin(f / 5)} open={0.2} />
							{/* the smell of the food drifts from the tent across the forest */}
							{f >= nose &&
								[0, 1, 2, 3].map((k) => {
									const t = ((f - nose) / 46 + k / 4) % 1;
									return <path key={k} d={`M ${TX + 150 + t * 700},${GROUND - 200 - t * 60 + Math.sin(t * 8 + k) * 20} q 30,-30 60,0 q 30,30 60,0`} stroke="#e08a2a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={Math.min(1, (1 - t) * 2) * 0.85} />;
								})}
							{f >= nose && <Bear x={bx} y={by} s={bs} pose={bWalk ? 'walk' : 'stand4'} amp={bWalk ? bAmp : 1} ph={(2100 - bx) / 40} head={f >= km && f < night ? interpolate(f, [km, km + 10], [0, -18], clamp) : a2 >= 1 ? -12 : 0} glow={1} />}
						</g>
					)}
				</Stage16>
			</AbsoluteFill>
			<StopChobi n={n} f={f} at={0} to={out} label="ОШИБКА №5 · ЕДА В ПАЛАТКЕ" />
			<Chip f={f} at={nose + 4} x={1300} y={200} text="НОС ЧУЕТ ЕДУ" color="#e08a2a" size={46} />
			<Chip f={f} at={km + 4} x={1300} y={300} text="ЗА КИЛОМЕТРЫ" color="#e08a2a" size={46} to={night} />
			<Chip f={f} at={guests + 6} x={1300} y={300} text="НОЧНЫЕ ГОСТИ" color={RED} size={54} />
		</AbsoluteFill>
	);
};
