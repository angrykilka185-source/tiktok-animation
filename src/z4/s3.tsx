// «Каково это — умереть от лап медведя» — shots 42–48 (never feed a bear; a fed bear is a dead bear; winter: the den and
// mistake six; the «шатуны»; tracks in the snow — call 112) and 50–55 (play dead: on the belly, the hands on the neck,
// the legs wide, the backpack on, lie still; when to fight back; bear spray).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Bear, BearUp} from '../components/Bear';
import {armPose, mixArm, type ArmSpec} from '../components/Choby';
import {StopChobi} from './chobiKit';
import {arm, camAt, Chip, Den, Forest, GROUND, HEAVY, INK, Layer, PALS, Plaque, RED, rnd, Sausage, Snowfall, SprayCan, SprayCloud, Spruce, Stage16, Tent, Track, Vig, Village, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const stepPh = (dist: number, k = 1) => (dist / 44) * k;
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
const ss = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const GREEN = '#3a8a4a';
const BROWN = '#7a4a24';
const WIN = PALS.winter;

// a bear that turns round: k goes 1 → -1 (it narrows and widens again); the bear inside is drawn at the origin, dir 1
const Turn: React.FC<{x: number; y: number; k: number; children: React.ReactNode}> = ({x, y, k, children}) => (
	<g transform={`translate(${x},${y}) scale(${Math.abs(k) < 0.06 ? (k < 0 ? -0.06 : 0.06) : k},1)`}>{children}</g>
);
// a walk from a to b over [t0, t1]: where it is, whether it walks, how wide the stride (it eases in and out)
const stroll = (f: number, t0: number, t1: number, a: number, b: number) => {
	const t = interpolate(f, [t0, t1], [0, 1], clamp);
	const e = ss(t);
	return {x: a + (b - a) * e, on: f >= t0 && f < t1, amp: Math.min(1, t * 5, (1 - t) * 4), t};
};
// a white «bonk» star
const Bonk: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) =>
	p <= 0 || p >= 1 ? null : (
		<g transform={`translate(${x},${y}) scale(${0.6 + p * 0.8})`} opacity={1 - p}>
			{Array.from({length: 8}).map((_, i) => {
				const a = (i / 8) * Math.PI * 2;
				return <line key={i} x1={Math.cos(a) * 20} y1={Math.sin(a) * 20} x2={Math.cos(a) * 56} y2={Math.sin(a) * 56} stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />;
			})}
		</g>
	);

// ============================================================ 42. never feed a bear: it ties people to food, loses its fear, comes back again and again =====
const SAUS = (
	<g transform="scale(0.55)">
		<Sausage />
	</g>
);
const FEED = arm([130, -352], [205, -372], {fist: true, item: SAUS, itemAng: 0});
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const n = 42;
	const never = w(n, 'корми') - 6;
	const fed = w(n, 'угостили') - 12;
	const link = w(n, 'связывать') - 6;
	const fear = w(n, 'перестаёт') - 6;
	const again = w(n, 'приходит') - 4;
	// the bear comes up for the sausage; later it walks right up to him, unafraid
	const a = stroll(f, fed - 34, fed - 2, 1340, 1160);
	const b = stroll(f, fear, fear + 36, 1160, 1000);
	const bx = f < fear ? a.x : b.x;
	const bOn = a.on || b.on;
	const bAmp = a.on ? a.amp : b.amp;
	const gx = interpolate(f, [fear + 8, fear + 40], [560, 470], {...clamp, easing: ss});
	// the toss: from his hand into its mouth
	const toss = interpolate(f, [fed, fed + 16], [0, 1], clamp);
	const hand: [number, number] = [560 + 0.55 * 205, GROUND - 0.55 * 372];
	const mouth: [number, number] = [1160 - 230, GROUND - 179];
	const tx = hand[0] + (mouth[0] - hand[0]) * toss;
	const ty = hand[1] + (mouth[1] - hand[1]) * toss - Math.sin(Math.PI * toss) * 110;
	const chew = f >= fed + 12 && f < fed + 54 ? 0.12 + 0.32 * Math.max(0, Math.sin((f - fed) / 3)) : 0;
	const armR = f < fed ? armPose(1, FEED) : mixArm(FEED, armPose(1, 'down'), ss((f - fed - 2) / 10));
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={35} />
				<Bear x={bx} y={GROUND + 10} s={0.8} pose={bOn ? 'walk' : 'stand4'} amp={bOn ? bAmp : 1} ph={(1340 - bx) / 45} mouth={chew || (f >= fed - 4 && f < fed + 14 ? 0.5 : 0)} head={f < fed && !a.on ? -6 : 0} />
				<You x={gx} y={GROUND} s={0.55} f={f} walk={f >= fear + 8 && f < fear + 40 ? stepPh(560 - gx) : undefined} face={{eyes: f >= fear ? 'wide' : 'open', mouth: f >= fear ? 'o' : 'smile', brows: f >= fear ? 'raised' : 'neutral', look: [0.85, 0], sweat: f >= fear + 10 ? 0.8 : 0}} armR={f < fed && f >= 0 ? FEED : armR} />
				{/* the sausage in the air */}
				{toss > 0 && toss < 1 && (
					<g transform={`translate(${tx},${ty}) rotate(${toss * 300}) scale(0.55)`}>
						<Sausage />
					</g>
				)}
				{/* «never!» over his hand */}
				{f >= never && f < fed && (
					<g transform={`translate(${hand[0] + 10},${hand[1]}) scale(${pop(f, never, 10) * interpolate(f, [fed - 10, fed], [1, 0], clamp)})`}>
						<circle r={78} fill="none" stroke={RED} strokeWidth={14} />
						<line x1={-55} y1={55} x2={55} y2={-55} stroke={RED} strokeWidth={14} strokeLinecap="round" />
					</g>
				)}
				{/* what it learns: a person means food */}
				{f >= link && f < fear + 6 && (
					<g transform={`translate(${bx - 120},${GROUND - 470}) scale(${pop(f, link, 11) * interpolate(f, [fear - 4, fear + 6], [1, 0], clamp)})`}>
						<circle cx={60} cy={150} r={14} fill="#ffffff" stroke={INK} strokeWidth={4} />
						<circle cx={30} cy={110} r={22} fill="#ffffff" stroke={INK} strokeWidth={4} />
						<rect x={-200} y={-90} width={400} height={170} rx={50} fill="#ffffff" stroke={INK} strokeWidth={6} />
						<You x={-110} y={64} s={0.2} f={f} bust face={{eyes: 'open', mouth: 'smile', brows: 'neutral'}} />
						<text x={0} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill={INK}>
							=
						</text>
						<g transform="translate(110,0) scale(0.75)">
							<Sausage />
						</g>
					</g>
				)}
				{/* again and again: the circle of arrows */}
				{f >= again && (
					<g transform={`translate(${bx - 120},${GROUND - 440}) scale(${pop(f, again, 10)}) rotate(${(f - again) * 6})`}>
						{[0, 180].map((r) => (
							<g key={r} transform={`rotate(${r})`}>
								<path d="M 50,0 A 50,50 0 0 1 -35,36" stroke={YEL} strokeWidth={14} fill="none" strokeLinecap="round" />
								<path d="M -52,26 L -35,36 L -26,16" stroke={YEL} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</g>
						))}
					</g>
				)}
			</Stage16>
			<Chip f={f} at={never} x={960} y={130} text="НИКОГДА НЕ КОРМИ МЕДВЕДЕЙ" color={RED} size={48} />
			<Chip f={f} at={link + 10} x={1460} y={250} text="ЛЮДИ = ЕДА" color={BROWN} size={44} to={fear + 4} />
			<Chip f={f} at={fear + 8} x={1460} y={250} text="ПЕРЕСТАЁТ БОЯТЬСЯ" color={RED} size={44} />
			<Chip f={f} at={again + 8} x={1460} y={340} text="ПРИХОДИТ СНОВА И СНОВА" color={RED} size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 43. then it has to be shot: «a fed bear is a dead bear» =====
const Bins: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-150} y={-150} width={110} height={150} rx={10} fill="#3a7a4a" stroke="#1f4a2a" strokeWidth={6} />
		<rect x={-160} y={-170} width={130} height={26} rx={8} fill="#2f6a3e" stroke="#1f4a2a" strokeWidth={6} />
		<g transform="translate(40,-52) rotate(80)">
			<rect x={-55} y={-75} width={110} height={150} rx={10} fill="#3a7a4a" stroke="#1f4a2a" strokeWidth={6} />
		</g>
		{(
			[
				[150, -8, '#e8e0d0'],
				[200, 2, '#c9a35a'],
				[250, -4, '#e0c040'],
				[110, 6, '#b8434a'],
			] as const
		).map(([dx, dy, c], i) => (
			<ellipse key={i} cx={dx} cy={dy} rx={22} ry={9} fill={c} />
		))}
	</g>
);
export const S43: React.FC = () => {
	const f = useCurrentFrame();
	const n = 43;
	const shoot = w(n, 'отстреливать') - 12;
	const say = w(n, 'поэтому') - 6;
	const l1 = w(n, 'прикормленный') - 4;
	const l2 = w(n, 'мёртвый') - 4;
	const gray = interpolate(f, [shoot, shoot + 30], [0, 1], clamp);
	const dark = interpolate(f, [say, say + 14], [0, 1], {...clamp, easing: ss});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: `grayscale(${gray}) brightness(${1 - gray * 0.25})`}}>
				<Stage16 bg="#060a1e">
					<Forest tone="night" seed={39} path={false} />
					<Village x={1200} y={GROUND - 50} s={0.9} />
					<Bins x={640} y={GROUND + 8} />
					<Bear x={880} y={GROUND + 12} s={0.8} pose="stand4" head={f < shoot ? 22 + Math.sin(f / 5) * 6 : interpolate(f, [shoot, shoot + 12], [22, -4], clamp)} glow={0.6} />
				</Stage16>
			</AbsoluteFill>
			<Vig k={0.4 + gray * 0.3} />
			<Chip f={f} at={4} x={960} y={130} text="ПРИХОДИТ К ЛЮДЯМ ЗА ЕДОЙ" color={BROWN} size={44} to={shoot - 4} />
			<Plaque f={f} at={shoot + 6} x={960} y={150} text="ПРИХОДИТСЯ ОТСТРЕЛИВАТЬ" color={RED} size={48} to={say} />
			{dark > 0 && (
				<AbsoluteFill style={{background: `rgba(12,14,20,${0.94 * dark})`}}>
					<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: dark * 0.35}}>
						<g transform="translate(960,860)">
							<Bear s={0.9} pose="stand4" fur="polar" />
						</g>
					</svg>
					{f >= l1 && <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${pop(f, l1, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: '#ffffff'}}>ПРИКОРМЛЕННЫЙ МЕДВЕДЬ —</div>}
					{f >= l2 && <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', transform: `scale(${pop(f, l2, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: RED}}>МЁРТВЫЙ МЕДВЕДЬ</div>}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 44. winter: Гога skis, sees a snowdrift with a little hole and hoarfrost; pokes it =====
// skis under his boots (they point right; the near one a little lower); slide: the skis push forward in turn
const Skis: React.FC<{x: number; y: number; slide?: number}> = ({x, y, slide = 0}) => (
	<g>
		{[0, 1].map((k) => (
			<g key={k} transform={`translate(${x + (k ? -1 : 1) * slide * 16},${y + 2 + k * 10})`}>
				<path d="M -140,0 L 150,0 C 172,0 182,-10 186,-26 C 176,-15 166,-11 150,-11 L -140,-11 C -147,-11 -151,-6 -151,-5 C -151,-1 -147,0 -140,0 Z" fill={k ? '#c0392b' : '#e74c3c'} stroke="#7a1f16" strokeWidth={4} strokeLinejoin="round" />
			</g>
		))}
	</g>
);
// a ski pole held in the hand (its own frame: down the pole)
const POLE = (
	<g>
		<line x1={0} y1={-12} x2={0} y2={262} stroke="#4a4a52" strokeWidth={9} strokeLinecap="round" />
		<ellipse cx={0} cy={236} rx={20} ry={6} fill="none" stroke="#4a4a52" strokeWidth={5} />
	</g>
);
const poleArm = (side: 1 | -1, ph: number): ArmSpec => {
	const a = Math.sin(ph) * side;
	return {el: [side * 112, -318 + a * 8], ha: [side * (134 + a * 16), -250 + a * 12], hang: side * 10, fist: true, item: POLE, itemAng: side * 6 - a * 8};
};
const DEN_X = 1240;
const HOLE: [number, number] = [DEN_X - 30 * 1.25, GROUND + 6 - 112 * 1.25];
const poke44 = (f: number) => {
	const n = 44;
	return {see: w(n, 'видит') - 4, hole: w(n, 'дырочкой') - 24, frost: w(n, 'иней') - 6, breath: w(n, 'дышит') - 14, wow: w(n, 'интересно') - 4, poke: w(n, 'тычет') - 6};
};
// what 45 adds to the frozen scene of 44: t — 45's own clock for the snow and the breath; xray 0…1 — the den seen
// through (the hollow, the bear asleep in it); wake — its eyes open; burst 0…1 — it breaks out and stands up roaring
type X45 = {t: number; xray: number; wake: boolean; burst: number};
// the whole winter scene at frame f (44 plays it; 45 freezes its last frame and goes on from it)
const Snow44: React.FC<{f: number; x?: X45}> = ({f, x}) => {
	const T = poke44(f);
	const amb = x ? f + x.t : f;
	const g1 = interpolate(f, [0, 58], [-150, 600], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)});
	const g2 = interpolate(f, [T.wow + 12, T.poke - 2], [600, 930], {...clamp, easing: ss});
	const scared = x ? ss(x.burst * 1.6) : 0;
	const gx = (f < T.wow + 12 ? g1 : g2) - scared * 70;
	const gliding = f < 58 || (f >= T.wow + 12 && f < T.poke - 2);
	const ph = gx / 70;
	const poking = f >= T.poke;
	const thrust = poking && !x ? Math.max(0, Math.sin((f - T.poke) / 3.2)) * 18 : 0;
	const POKE: ArmSpec = {el: [130, -338], ha: [215 + thrust, -306], hang: 60, fist: true, item: POLE, itemAng: -80};
	const UP: ArmSpec = {el: [120, -440], ha: [150, -524], hang: 180, fist: true, item: POLE, itemAng: 170};
	const armR: ArmSpec = scared > 0 ? mixArm(POKE, UP, scared) : poking ? mixArm(poleArm(1, ph), POKE, ss((f - T.poke) / 6)) : poleArm(1, ph);
	const zoomIn = camAt(f, T.hole, T.hole + 28, {s: 1, cx: 960, cy: 540}, {s: 2.3, cx: HOLE[0], cy: HOLE[1] - 20});
	const cam = f < T.wow - 16 ? zoomIn : camAt(f, T.wow - 16, T.wow + 10, {s: 2.3, cx: HOLE[0], cy: HOLE[1] - 20}, {s: 1, cx: 960, cy: 540});
	const CY = GROUND + 6 - 56;
	return (
		<Stage16 bg={WIN.sky0}>
			<Layer cam={cam}>
				<Forest tone="winter" seed={41} />
				<Spruce x={DEN_X + 40} y={GROUND - 10} h={860} c={WIN.mid} d={WIN.midD} trunk={WIN.trunk} snow />
				<g opacity={x ? 1 - x.burst : 1}>
					<Den x={DEN_X} y={GROUND + 6} s={1.25} steam={x ? 1 - x.xray : interpolate(f, [T.breath, T.breath + 10], [0, 1], clamp)} f={amb} />
				</g>
				{/* seen through the snow: the hollow and the bear asleep in it */}
				{x && x.xray > 0 && x.burst < 1 && (
					<g opacity={x.xray * (1 - x.burst)}>
						<ellipse cx={DEN_X} cy={CY} rx={204} ry={60} fill="#34415c" />
						<ellipse cx={DEN_X} cy={CY} rx={204} ry={60} fill="none" stroke="#ffffff" strokeWidth={5} strokeDasharray="16 12" />
						<rect x={HOLE[0] - 11} y={HOLE[1]} width={22} height={26} fill="#34415c" />
						<g transform={`translate(${DEN_X + 14},${GROUND - 2})`}>
							<Bear s={0.36} pose="lie" eyes={x.wake ? 'open' : 'closed'} />
						</g>
						{!x.wake &&
							[0, 1, 2].map((i) => {
								const t = ((amb / 30 + i / 3) % 1);
								return (
									<text key={i} x={DEN_X - 70 + t * 50} y={CY - 70 - t * 70} fontFamily={HEAVY} fontWeight={900} fontSize={26 + t * 14} fill="#ffffff" opacity={1 - t}>
										Z
									</text>
								);
							})}
					</g>
				)}
				{/* it bursts out of the snow and stands up */}
				{x && x.burst > 0 && (
					<g transform={`translate(${DEN_X},${GROUND + 6}) scale(1,${0.6 + 0.4 * x.burst}) translate(${-DEN_X},${-GROUND - 6})`}>
						<BearUp x={DEN_X} y={GROUND + 6} s={0.9} mouth={0.85} ears="back" arms={0.3} />
					</g>
				)}
				<Skis x={gx + 10} y={GROUND} slide={gliding ? Math.sin(ph) : 0} />
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={amb}
					outfit="winter"
					face={scared > 0 ? {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.85, -0.3], sweat: 1} : {eyes: f >= T.wow ? 'wide' : 'open', mouth: poking ? 'open' : f >= T.wow ? 'smile' : 'flat', brows: f >= T.see && f < T.wow ? 'raised' : 'neutral', look: f >= T.see ? [0.85, 0.25] : [0.6, 0]}}
					armL={poleArm(-1, ph)}
					armR={armR}
				/>
				{x &&
					x.burst > 0 &&
					Array.from({length: 14}).map((_, i) => {
						const a = Math.PI + (i / 13) * Math.PI;
						const d = x.burst * (200 + rnd(i) * 200);
						return <circle key={i} cx={DEN_X + Math.cos(a) * d} cy={GROUND - 60 + Math.sin(a) * d * 0.8 + x.burst * x.burst * 240} r={16 + rnd(i + 5) * 22} fill="#f4f8fb" stroke="#c9d8e6" strokeWidth={4} opacity={1 - x.burst * 0.7} />;
					})}
				{!x && f >= T.wow && f < T.poke + 10 && (
					<g transform={`translate(${gx + 40},${GROUND - 500}) scale(${pop(f, T.wow, 10)})`}>
						<circle r={36} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={INK}>
							?!
						</text>
					</g>
				)}
			</Layer>
			<Snowfall f={amb} n={40} k={0.8} />
		</Stage16>
	);
};
export const S44: React.FC = () => {
	const f = useCurrentFrame();
	const n = 44;
	const T = poke44(f);
	return (
		<AbsoluteFill>
			<Snow44 f={f} />
			<Chip f={f} at={2} x={960} y={110} text="ЗИМА" color="#2f86e0" size={46} to={T.see - 4} />
			<Chip f={f} at={T.see + 8} x={1240} y={240} text="СУГРОБ ПОД ЁЛКОЙ" color="#5a6a86" size={42} to={T.hole} />
			<Chip f={f} at={T.frost + 6} x={960} y={150} text="ИНЕЙ ВОКРУГ ДЫРОЧКИ" color="#5a6a86" size={44} to={T.wow - 18} />
			<Chip f={f} at={T.breath + 8} x={960} y={250} text="КТО-ТО ДЫШИТ?" color={INK} size={44} to={T.wow - 18} />
			<Chip f={f} at={T.poke + 4} x={1240} y={300} text="ТЫЧЕТ ПАЛКОЙ" color={RED} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 45. mistake six: it is a den; a bear woken in midwinter is angry and hungry =====
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const n = 45;
	const out = w(n, 'это') - 16;
	const den = w(n, 'берлога') - 4;
	const wake = w(n, 'разбудили') - 6;
	const angry = w(n, 'злой') - 10;
	const F = len(44) - 1;
	// frozen while Чоби speaks; then the colour comes back and the scene goes on: the den seen through, the bear wakes, bursts out
	const gray = interpolate(f, [out + 4, out + 16], [0.75, 0], clamp);
	const t = Math.max(0, f - out - 4);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: `grayscale(${gray}) brightness(${1 - gray * 0.15})`}}>
				<Snow44 f={F} x={{t, xray: interpolate(f, [den - 6, den + 8], [0, 1], clamp), wake: f >= wake, burst: interpolate(f, [angry, angry + 14], [0, 1], clamp)}} />
			</AbsoluteFill>
			{f >= wake && f < angry + 4 && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(${DEN_X + 120},${GROUND - 150}) scale(${pop(f, wake, 9)})`}>
						<circle r={34} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={RED}>
							!
						</text>
					</g>
				</svg>
			)}
			<StopChobi n={n} f={f} at={0} to={out} label="ОШИБКА №6 · БЕРЛОГА" />
			<Chip f={f} at={den + 4} x={1460} y={560} text="БЕРЛОГА" color="#5a6a86" size={50} to={angry} />
			<Chip f={f} at={wake + 6} x={1300} y={250} text="РАЗБУДИЛИ ПОСРЕДИ ЗИМЫ" color={INK} size={42} to={angry} />
			<Chip f={f} at={angry + 10} x={700} y={240} text="ЗЛОЙ" color={RED} size={60} />
			<Chip f={f} at={w(n, 'голодный') - 2} x={1680} y={240} text="ГОЛОДНЫЙ" color={RED} size={60} />
		</AbsoluteFill>
	);
};

// ============================================================ 46. the «шатуны»: bears that did not put on fat over the summer and could not den =====
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const n = 46;
	const name = w(n, 'шатуны') - 6;
	const fat = w(n, 'накопили') - 8;
	const den = w(n, 'залечь') - 8;
	const bx = interpolate(f, [0, len(n)], [1760, 860], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg={WIN.sky0}>
				<Forest tone="winter" seed={45} />
				<rect x={0} y={0} width={1920} height={1080} fill="#2a3550" opacity={0.28} />
				<Bear x={bx} y={GROUND + 10} s={0.8} pose="walk" ph={(1760 - bx) / 40} head={14} thin ears="back" />
				{[0, 1].map((i) => {
					const t = ((f / 26 + i / 2) % 1);
					return <circle key={i} cx={bx - 270 - t * 40} cy={GROUND - 150 - t * 20} r={10 + t * 16} fill="#ffffff" opacity={(1 - t) * 0.7} />;
				})}
				{/* the fat it needed for the winter: a nearly empty gauge */}
				{f >= fat && (
					<g transform={`translate(1660,360) scale(${pop(f, fat, 11)})`}>
						<rect x={-50} y={-130} width={100} height={260} rx={20} fill="#ffffff" stroke={INK} strokeWidth={7} />
						<rect x={-20} y={-146} width={40} height={18} rx={6} fill={INK} />
						<rect x={-38} y={118 - interpolate(f, [fat, fat + 20], [230, 36], clamp)} width={76} height={interpolate(f, [fat, fat + 20], [230, 36], clamp)} rx={10} fill={RED} />
						<text x={0} y={180} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke">
							ЖИР
						</text>
					</g>
				)}
				{/* no den for it */}
				{f >= den && (
					<g transform={`translate(1660,${GROUND - 90}) scale(${pop(f, den, 11) * 0.55})`}>
						<Den x={0} y={60} />
						<path d="M -130,-130 L 130,90 M 130,-130 L -130,90" stroke={RED} strokeWidth={26} strokeLinecap="round" />
					</g>
				)}
			</Stage16>
			<Snowfall f={f} n={50} />
			<Plaque f={f} at={name} x={960} y={120} text="ШАТУН" color={RED} size={64} />
			<Chip f={f} at={fat + 10} x={1260} y={260} text="ЗА ЛЕТО — МАЛО ЖИРА" color={INK} size={42} />
			<Chip f={f} at={den + 10} x={1260} y={350} text="НЕ ЗАЛЁГ В СПЯЧКУ" color={RED} size={42} />
		</AbsoluteFill>
	);
};

// ============================================================ 47. they roam the winter forest hungry and come out to villages; one of the most dangerous animals =====
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const n = 47;
	const vil = w(n, 'выходят') - 10;
	const danger = w(n, 'шатун') - 6;
	const bx = interpolate(f, [0, len(n)], [380, 2180], clamp);
	const cam = camAt(f, vil, vil + 50, {s: 1, cx: 960, cy: 540}, {s: 1, cx: 1900, cy: 540});
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={cam}>
					<Forest tone="wnight" seed={47} w={3000} />
					<Village x={2340} y={GROUND - 60} s={0.9} />
					<Bear x={bx} y={GROUND + 10} s={0.72} dir={-1} pose="walk" ph={(bx - 380) / 36} head={10} thin glow={0.8} />
				</Layer>
			</Stage16>
			<Snowfall f={f} n={60} />
			<Chip f={f} at={w(n, 'бродят') - 4} x={760} y={150} text="БРОДЯТ ГОЛОДНЫЕ" color="#5a6a86" size={44} to={vil + 20} />
			<Chip f={f} at={vil + 24} x={1200} y={150} text="ВЫХОДЯТ К ДЕРЕВНЯМ" color={BROWN} size={44} to={danger - 2} />
			<Plaque f={f} at={danger} x={960} y={140} text="ОДИН ИЗ САМЫХ ОПАСНЫХ ЗВЕРЕЙ" color={RED} size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 48. bear tracks in winter: leave and call 112 =====
const PHONE_EAR = (
	<g transform="scale(0.5)">
		<rect x={-44} y={-80} width={88} height={160} rx={16} fill="#16171b" />
		<rect x={-36} y={-66} width={72} height={124} rx={8} fill="#3a8a4a" />
	</g>
);
export const S48: React.FC = () => {
	const f = useCurrentFrame();
	const n = 48;
	const tracks = w(n, 'следы') - 12;
	const leave = w(n, 'уходи') - 6;
	const call = w(n, 'звони') - 8;
	const num = w(n, 'сто') - 4;
	const gx = f < leave ? interpolate(f, [0, tracks], [300, 640], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)}) : interpolate(f, [leave, len(n) + 20], [640, 380], clamp);
	const walking = f < tracks - 2 || f >= leave;
	const EAR: ArmSpec = {el: [120, -400], ha: [140, -480], hang: 196, fist: true, item: PHONE_EAR, itemAng: 0};
	return (
		<AbsoluteFill>
			<Stage16 bg={WIN.sky0}>
				<Forest tone="winter" seed={49} />
				{/* the tracks cross the path and go off into the forest */}
				{Array.from({length: 9}).map((_, i) => {
					const t = i / 8;
					const x = 820 + t * 900;
					const y = GROUND + 60 - t * 170 + (i % 2 ? 14 : -14);
					const s = 1.5 - t * 0.7;
					return (
						<g key={i} transform={`translate(${x},${y}) scale(${s},${s * 0.5}) rotate(80)`}>
							<Track c="#7b8fb4" />
						</g>
					);
				})}
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={f}
					outfit="winter"
					walk={walking ? (f < leave ? stepPh(gx - 300, 1.2) : stepPh(640 - gx, 1.2)) : undefined}
					face={{eyes: f >= tracks ? 'wide' : 'open', mouth: f >= call ? (Math.sin(f / 3.5) > 0 ? 'open' : 'flat') : f >= tracks ? 'o' : 'smile', brows: f >= tracks ? 'raised' : 'neutral', look: f >= leave ? [-0.8, 0] : f >= tracks ? [0.7, 0.8] : [0.6, 0]}}
					armR={f >= call ? mixArm(armPose(1, 'down'), EAR, ss((f - call) / 8)) : 'down'}
				/>
			</Stage16>
			<Chip f={f} at={tracks + 10} x={1260} y={360} text="МЕДВЕЖЬИ СЛЕДЫ" color="#5a6a86" size={44} />
			<Chip f={f} at={leave + 4} x={560} y={220} text="УХОДИ" color={GREEN} size={52} />
			{f >= num && (
				<div style={{position: 'absolute', left: 1260, top: 190, transform: `translate(-50%,-50%) scale(${pop(f, num, 10)})`, background: RED, color: '#fff', border: '6px solid #fff', borderRadius: 26, padding: '6px 34px 10px', fontFamily: HEAVY, fontWeight: 900, fontSize: 96, boxShadow: '0 12px 30px rgba(0,0,0,0.35)'}}>112</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 50–52. play dead: the meadow seen from above and in front =====
const HZ = 300;
const Meadow: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="mdwSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#8fc8ee" />
				<stop offset="1" stopColor="#d6eedb" />
			</linearGradient>
			<linearGradient id="mdwGrass" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#9ac86e" />
				<stop offset="1" stopColor="#5f9a46" />
			</linearGradient>
		</defs>
		<rect x={-200} y={-200} width={2320} height={HZ + 200} fill="url(#mdwSky)" />
		{Array.from({length: 32}).map((_, i) => (
			<Spruce key={i} x={-60 + i * 66 + rnd(i + 3) * 30} y={HZ + 12} h={110 + rnd(i + 7) * 80} c="#2f6a48" d="#24563a" trunk="#6a4628" />
		))}
		<rect x={-200} y={HZ} width={2320} height={1300} fill="url(#mdwGrass)" />
		{Array.from({length: 80}).map((_, i) => {
			const t = rnd(i + 31);
			const y = HZ + 24 + t * t * 760;
			const x = rnd(i + 57) * 1920;
			const k = 0.4 + t * 1.3;
			return <path key={i} d={`M ${x - 10 * k},${y} l ${4 * k},${-18 * k} l ${6 * k},${14 * k} l ${6 * k},${-20 * k} l ${4 * k},${24 * k} Z`} fill="#4f8a3c" opacity={0.75} />;
		})}
	</g>
);
// Гога lying face down, seen from above and in front (his back, the backpack; the head to the left): hands 0…1 — the
// hands go from his sides to the back of his neck (the elbows out); spread 0…1 — the legs wide; wob — a little rock
const NECK_L: ArmSpec = {el: [-128, -436], ha: [-40, -470], hang: 75, fist: true, front: true};
const NECK_R: ArmSpec = {el: [128, -436], ha: [40, -470], hang: -75, fist: true, front: true};
const PX = 880;
const PY = 700;
const PS = 0.72;
const Prone: React.FC<{f: number; hands: number; spread?: number; wob?: number; x?: number; y?: number; s?: number}> = ({f, hands, spread = 0, wob = 0, x = PX, y = PY, s = PS}) => (
	<g transform={`translate(${x},${y}) rotate(${wob}) scale(1,0.62) rotate(-90) translate(0,${(750 * s) / 2})`}>
		<ellipse cx={0} cy={-375} rx={150} ry={400} fill="#000" opacity={0.12} transform={`scale(${s})`} />
		<You x={0} y={0} s={s} f={f} back pack spread={spread} armL={mixArm(armPose(-1, 'down'), NECK_L, ss(hands))} armR={mixArm(armPose(1, 'down'), NECK_R, ss(hands))} />
	</g>
);
// where things are on his lying body (screen): the neck, the backpack
// (his own units along the body: the feet at 0, the neck at −410, the backpack about −335; the feet lie at PX + 375·PS)
const NECK: [number, number] = [PX + (375 - 410) * PS, PY];
const PACKAT: [number, number] = [PX + (375 - 335) * PS, PY];
// the bear stands just behind him: x, facing k (1 left, −1 right), head down to sniff
const BY = 650;

export const S50: React.FC = () => {
	const f = useCurrentFrame();
	const n = 50;
	const dead = w(n, 'притворись') - 2;
	const belly = w(n, 'ложись') - 4;
	const hands = w(n, 'сцепи') - 4;
	const neck = w(n, 'шею') - 12;
	const b = stroll(f, 0, 70, 1640, 1080);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Meadow />
				<Bear x={b.x} y={BY} s={0.8} pose={b.on ? 'walk' : 'stand4'} amp={b.on ? b.amp : 1} ph={(1640 - b.x) / 45} head={b.on ? 0 : interpolate(f, [70, 84], [0, 34], clamp)} mouth={0.1} />
				{/* the dust where he dropped */}
				{f < 18 &&
					[-1, -0.4, 0.4, 1].map((d, i) => {
						const t = f / 18;
						return <circle key={i} cx={PX + d * (220 + t * 120)} cy={PY + 20 - t * 30} r={26 * (1 - t * 0.4)} fill="#d8e8c0" opacity={(1 - t) * 0.8} />;
					})}
				<Prone f={f} hands={interpolate(f, [hands, hands + 14], [0, 1], clamp)} />
				{f >= neck && (
					<g transform={`translate(${NECK[0]},${NECK[1]}) scale(${pop(f, neck, 10)})`}>
						<ellipse rx={92} ry={70} fill="none" stroke="#3aa86a" strokeWidth={10} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={dead} x={960} y={110} text="ПРИТВОРИСЬ МЁРТВЫМ" color={GREEN} size={50} />
			<Chip f={f} at={belly + 4} x={520} y={250} text="1 · НА ЖИВОТ" color={GREEN} size={42} />
			<Chip f={f} at={hands + 4} x={520} y={340} text="2 · ПАЛЬЦЫ НА ЗАТЫЛОК" color={GREEN} size={42} />
			<Chip f={f} at={neck + 6} x={520} y={430} text="ШЕЯ ЗАКРЫТА" color="#3aa86a" size={42} />
		</AbsoluteFill>
	);
};

export const S51: React.FC = () => {
	const f = useCurrentFrame();
	const n = 51;
	const legs = w(n, 'расставь') - 8;
	const turn = w(n, 'медведю') - 6;
	const pack = w(n, 'рюкзак') - 6;
	const back = w(n, 'защитит') - 6;
	// the bear paws at him to turn him over — he does not roll
	const slapT = (k: number) => interpolate(f, [turn + k * 22, turn + k * 22 + 16], [0, 1], clamp);
	const slap = f >= turn && f < turn + 60 ? slapT(f < turn + 22 ? 0 : f < turn + 44 ? 1 : 2) : 0;
	const hit = [0, 1, 2].map((k) => interpolate(f, [turn + k * 22 + 8, turn + k * 22 + 14], [0, 1], clamp) * (1 - interpolate(f, [turn + k * 22 + 14, turn + k * 22 + 22], [0, 1], clamp)));
	const wob = (hit[0] + hit[1] + hit[2]) * 3;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Meadow />
				<Bear x={1080} y={BY} s={0.8} pose="stand4" head={34} mouth={0.1} slap={slap} />
				<Prone f={f} hands={1} spread={interpolate(f, [legs, legs + 14], [0, 1], {...clamp, easing: ss})} wob={wob} />
				{f >= pack && (
					<g transform={`translate(${PACKAT[0]},${PACKAT[1]}) scale(${pop(f, pack, 10)})`}>
						<rect x={-96} y={-66} width={192} height={132} rx={36} fill="none" stroke={YEL} strokeWidth={10} />
					</g>
				)}
				{/* the backpack shields his back */}
				{f >= back && (
					<g transform={`translate(${PACKAT[0]},${PY - 150}) scale(${pop(f, back, 10)})`}>
						<path d="M 0,-60 L 52,-40 C 52,10 34,44 0,62 C -34,44 -52,10 -52,-40 Z" fill="#3aa86a" stroke="#ffffff" strokeWidth={7} />
						<path d="M -20,0 L -4,16 L 24,-16" stroke="#ffffff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
			</Stage16>
			<Chip f={f} at={legs + 4} x={520} y={250} text="3 · НОГИ ШИРЕ" color={GREEN} size={42} />
			<Chip f={f} at={turn + 10} x={520} y={340} text="ТРУДНО ПЕРЕВЕРНУТЬ" color={GREEN} size={42} />
			<Chip f={f} at={pack + 4} x={520} y={430} text="4 · РЮКЗАК НЕ СНИМАЙ" color={GREEN} size={42} />
			<Chip f={f} at={back + 6} x={520} y={520} text="ЗАЩИТИТ СПИНУ" color="#3aa86a" size={42} />
		</AbsoluteFill>
	);
};

export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const n = 52;
	const quiet = w(n, 'лежи') - 4;
	const went = w(n, 'отошёл') - 24;
	const check = w(n, 'стоять') - 6;
	const leaves = w(n, 'уходит') - 10;
	// it turns away, walks off, stops and looks back (checking), turns and goes for good
	const t1 = went;
	const a = stroll(f, t1 + 10, t1 + 50, 1080, 1460);
	const look = check;
	const b = stroll(f, leaves + 10, leaves + 60, 1460, 2200);
	const k = f < t1 ? 1 : f < t1 + 10 ? Math.cos(Math.PI * sm((f - t1) / 10)) : f < look ? -1 : f < look + 10 ? Math.cos(Math.PI * (1 + sm((f - look) / 10))) : f < leaves ? 1 : f < leaves + 10 ? Math.cos(Math.PI * sm((f - leaves) / 10)) : -1;
	const bx = f < leaves ? a.x : b.x;
	const on = a.on || b.on;
	const amp = a.on ? a.amp : b.amp;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Meadow />
				<Turn x={bx} y={BY} k={k}>
					<Bear s={0.8} pose={on ? 'walk' : 'stand4'} amp={on ? amp : 1} ph={Math.abs(bx - 1080) / 45} head={f < t1 ? 34 : f >= look && f < leaves ? -4 : 0} />
				</Turn>
				<Prone f={f} hands={1} spread={1} />
				{/* «quiet»: a finger to the lips sign over him */}
				{f >= quiet && f < leaves && (
					<g transform={`translate(${PX - 200},${PY - 190}) scale(${pop(f, quiet, 10)})`}>
						<circle r={44} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={INK}>
							ТСС
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={quiet} x={960} y={110} text="ЛЕЖИ ТИХО" color={GREEN} size={50} />
			<Chip f={f} at={went + 30} x={520} y={250} text="ДАЖЕ КОГДА ОН ОТОШЁЛ" color={INK} size={40} />
			<Chip f={f} at={check + 8} x={520} y={340} text="ОН МОЖЕТ ПРОВЕРЯТЬ" color={RED} size={42} />
			<Chip f={f} at={leaves + 12} x={520} y={430} text="НЕ ОПАСЕН → УХОДИТ" color={GREEN} size={42} />
		</AbsoluteFill>
	);
};

// ============================================================ 53. the exception: it stalks you, gets into the tent at night, keeps attacking — it sees prey; playing dead is useless =====
const Panel: React.FC<{f: number; at: number; x: number; label: string; children: React.ReactNode; vb: string}> = ({f, at, x, label, children, vb}) =>
	f < at ? null : (
		<g transform={`translate(${x},520) scale(${pop(f, at, 11)})`}>
			<rect x={-292} y={-212} width={584} height={424} rx={28} fill="#ffffff" />
			<svg x={-280} y={-200} width={560} height={400} viewBox={vb} preserveAspectRatio="xMidYMid slice">
				{children}
			</svg>
			<rect x={-280} y={-200} width={560} height={400} rx={18} fill="none" stroke={INK} strokeWidth={6} />
			<g transform="translate(0,262)">
				<rect x={-280} y={-34} width={560} height={68} rx={18} fill={RED} />
				<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#ffffff">
					{label}
				</text>
			</g>
		</g>
	);
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const n = 53;
	const exc = w(n, 'исключение') - 6;
	const p1 = w(n, 'крадётся') - 6;
	const p2 = w(n, 'лезет') - 6;
	const p3 = w(n, 'уходит') - 8;
	const prey = w(n, 'видит') - 6;
	const useless = w(n, 'притворяться') - 4;
	const gx = 1150 + ((f * 3) % 200);
	return (
		<AbsoluteFill style={{background: '#eef3ea'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<Panel f={f} at={p1} x={340} label="КРАДЁТСЯ ЗА ТОБОЙ" vb="250 300 1500 1071">
					<Forest tone="day" seed={51} />
					<Bear x={gx - 560} y={GROUND + 10} s={0.7} dir={-1} pose="walk" ph={f * 0.12} head={18} ears="back" />
					<You x={gx} y={GROUND} s={0.55} f={f} walk={f * 0.2} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0.8, 0]}} />
				</Panel>
				<Panel f={f} at={p2} x={960} label="ЛЕЗЕТ НОЧЬЮ В ПАЛАТКУ" vb="250 300 1500 1071">
					<Forest tone="night" seed={33} />
					<Tent x={900} y={GROUND + 8} glow={0.9} open={0.2} />
					<Bear x={1290} y={GROUND + 10} s={0.8} pose="stand4" head={26} glow={1} mouth={0.3} />
				</Panel>
				<Panel f={f} at={p3} x={1580} label="НЕ УХОДИТ, НАПАДАЕТ" vb="300 330 1400 1000">
					<Meadow />
					<Bear x={1080} y={BY} s={0.8} pose="stand4" head={30} mouth={0.4} ears="back" slap={Math.max(0, Math.sin(f / 7))} />
					<Prone f={f} hands={1} spread={1} />
				</Panel>
				{/* prey: the cross hairs on all three of him */}
				{f >= prey &&
					[340, 960, 1580].map((x, i) => (
						<g key={i} transform={`translate(${x + (i === 0 ? 110 : i === 1 ? -20 : -40)},${i === 2 ? 540 : 470}) scale(${pop(f, prey + i * 4, 10)})`}>
							<circle r={70} fill="none" stroke={RED} strokeWidth={8} />
							<path d="M -96,0 L -46,0 M 46,0 L 96,0 M 0,-96 L 0,-46 M 0,46 L 0,96" stroke={RED} strokeWidth={8} strokeLinecap="round" />
						</g>
					))}
			</svg>
			<Plaque f={f} at={exc} x={960} y={110} text="ИСКЛЮЧЕНИЕ" color={RED} size={50} to={prey - 2} />
			<Plaque f={f} at={prey + 4} x={960} y={110} text="ЗНАЧИТ, ТЫ ДЛЯ НЕГО — ДОБЫЧА" color={RED} size={50} />
			{f >= useless && (
				<div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) rotate(-6deg) scale(${pop(f, useless, 9)})`, background: '#fff', color: RED, border: `10px solid ${RED}`, borderRadius: 26, padding: '14px 40px', fontFamily: HEAVY, fontWeight: 900, fontSize: 72, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
					ПРИТВОРЯТЬСЯ БЕСПОЛЕЗНО
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 54. fight with whatever you have: stones, a stick, a knife; hit the face and the nose. Polar bear: always fight =====
const STICK = <rect x={-12} y={-230} width={24} height={250} rx={12} fill="#8a5a32" stroke="#4a2a10" strokeWidth={5} />;
const Stone: React.FC = () => <path d="M -30,10 C -36,-14 -14,-30 8,-26 C 30,-22 38,0 28,16 C 14,30 -22,30 -30,10 Z" fill="#8a8a92" stroke="#4a4a50" strokeWidth={5} />;
const Arctic: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="arcSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#bcd8ee" />
				<stop offset="1" stopColor="#eef5fb" />
			</linearGradient>
		</defs>
		<rect x={-200} y={-200} width={2320} height={GROUND - 30} fill="url(#arcSky)" />
		<rect x={-200} y={GROUND - 260} width={2320} height={90} fill="#4f86ad" />
		{[
			[300, 120, 160],
			[1100, 170, 220],
			[1650, 100, 140],
		].map(([x, h, wd], i) => (
			<path key={i} d={`M ${x - wd},${GROUND - 240} L ${x - wd * 0.3},${GROUND - 240 - h} L ${x + wd * 0.2},${GROUND - 240 - h * 0.7} L ${x + wd},${GROUND - 240} Z`} fill="#f4f8fb" stroke="#c9d8e6" strokeWidth={5} />
		))}
		<rect x={-200} y={GROUND - 175} width={2320} height={900} fill="#f4f8fb" />
		<path d={`M 200,${GROUND + 60} l 120,-30 l 90,24 M 1300,${GROUND - 80} l 140,22 l 80,-30`} stroke="#c9d8e6" strokeWidth={6} fill="none" strokeLinecap="round" />
	</g>
);
export const S54: React.FC = () => {
	const f = useCurrentFrame();
	const n = 54;
	const fight = w(n, 'дерись');
	const stone = w(n, 'камнями') - 6;
	const stick = w(n, 'палкой') - 4;
	const knife = w(n, 'ножом') - 4;
	const hit = w(n, 'бей') - 4;
	const nose = w(n, 'носу') - 6;
	const polar = w(n, 'белым') - 6;
	const only = w(n, 'только') - 4;
	const GX = 640;
	const BX = 1150;
	// the stone flies from his left hand to the bear's head
	const st = interpolate(f, [stone, stone + 14], [0, 1], clamp);
	const sx = GX - 60 + (BX - 250 - (GX - 60)) * st;
	const sy = GROUND - 300 - Math.sin(Math.PI * st) * 160 + st * 10;
	// the stick swings at the nose twice
	const swing = f >= hit && f < nose + 30 ? Math.max(0, Math.sin(((f - hit) / 16) * Math.PI)) : 0;
	const RAISED: ArmSpec = {el: [112, -436], ha: [150, -512], hang: 160, fist: true, item: STICK, itemAng: 30};
	const STRIKE: ArmSpec = {el: [134, -392], ha: [220, -384], hang: 100, fist: true, item: STICK, itemAng: 80};
	const armR = mixArm(RAISED, STRIKE, swing);
	const flinch = f >= nose && f < nose + 16 ? Math.sin(((f - nose) / 16) * Math.PI) : 0;
	const isPolar = f >= polar;
	return (
		<AbsoluteFill>
			{!isPolar ? (
				<Stage16 bg="#8fc8ee">
					<Forest tone="day" seed={53} />
					<Bear x={BX + flinch * 40} y={GROUND + 10} s={0.8} pose="stand4" mouth={0.55} ears="back" head={-flinch * 16} />
					<You x={GX} y={GROUND} s={0.55} f={f} face={{eyes: 'wide', mouth: 'open', brows: 'angry', look: [0.9, 0], sweat: 0.6}} armR={armR} armL={f >= stone - 10 && f < stone + 4 ? {el: [-120, -440], ha: [-142, -520], hang: 190, fist: true} : 'down'} />
					{st > 0 && st < 1 && (
						<g transform={`translate(${sx},${sy}) rotate(${st * 400})`}>
							<Stone />
						</g>
					)}
					<Bonk x={BX - 250} y={GROUND - 290} p={interpolate(f, [stone + 14, stone + 26], [0, 1], clamp)} />
					{f >= nose && (
						<g transform={`translate(${BX - 254},${GROUND - 214}) scale(${pop(f, nose, 10)})`}>
							<circle r={44} fill="none" stroke={RED} strokeWidth={7} />
							<circle r={8} fill={RED} />
						</g>
					)}
					<Bonk x={BX - 254} y={GROUND - 214} p={interpolate(f, [nose, nose + 12], [0, 1], clamp)} />
				</Stage16>
			) : (
				<Stage16 bg="#bcd8ee">
					<Arctic />
					<Bear x={1180} y={GROUND + 10} s={0.85} pose="stand4" fur="polar" mouth={0.5} ears="back" />
					<You x={GX} y={GROUND} s={0.55} f={f} outfit="winter" face={{eyes: 'wide', mouth: 'open', brows: 'angry', look: [0.9, 0], sweat: 0.4}} armR={RAISED} />
				</Stage16>
			)}
			{/* what to fight with */}
			{!isPolar &&
				(
					[
						[stone, 'КАМНИ', 700],
						[stick, 'ПАЛКА', 960],
						[knife, 'НОЖ', 1220],
					] as const
				).map(([at, t, x]) => <Chip key={t} f={f} at={at + 4} x={x} y={260} text={t} color={INK} size={44} />)}
			<Plaque f={f} at={fight} x={960} y={120} text="ДЕРИСЬ ВСЕМ, ЧТО ЕСТЬ" color={RED} size={50} to={polar - 2} />
			<Chip f={f} at={hit + 4} x={1300} y={360} text="БЕЙ ПО МОРДЕ И ПО НОСУ" color={RED} size={42} to={polar - 2} />
			<Plaque f={f} at={polar + 2} x={960} y={120} text="БЕЛЫЙ МЕДВЕДЬ" color="#5a8aba" size={50} />
			<Chip f={f} at={only + 4} x={960} y={260} text="ТОЛЬКО ДРАТЬСЯ" color={RED} size={60} />
		</AbsoluteFill>
	);
};

// ============================================================ 55. the best defence: bear spray — a cloud right in its face as it charges =====
const CAN = (
	<g transform="scale(0.8)">
		<SprayCan />
	</g>
);
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const n = 55;
	const spray = w(n, 'перцовый') - 6;
	const bears = w(n, 'медведей') - 6;
	const scene = w(n, 'его') - 6;
	const cloud = w(n, 'облаком') - 6;
	const face = w(n, 'морду') - 6;
	const runs = w(n, 'бежит') - 6;
	const GX = 560;
	// the bear charges from the right; the cloud stops it; it turns and runs off
	const r = interpolate(f, [scene + 4, face], [0, 1], clamp);
	const bx = f < face ? 1880 - (1880 - 1060) * (1 - (1 - r) * (1 - r)) : f < runs ? 1060 : interpolate(f, [runs + 8, len(n)], [1060, 1700], {...clamp, easing: (t) => t * t});
	const amp = f < face ? Math.min(1, (1 - r) * 3) : f >= runs + 8 ? Math.min(1, (f - runs - 8) / 8) : 0;
	const k = f < runs ? 1 : Math.cos(Math.PI * sm((f - runs) / 10));
	const hand: [number, number] = [GX + 0.55 * 232, GROUND - 0.55 * 372];
	const AIM: ArmSpec = {el: [140, -360], ha: [232, -372], hang: 90, fist: true, item: CAN, itemAng: 90};
	return (
		<AbsoluteFill>
			{f < scene ? (
				<AbsoluteFill style={{background: '#f3efe6'}}>
					<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
						<g transform={`translate(760,560) scale(${3.2 * pop(f, 0, 12)}) rotate(${Math.sin(f / 20) * 4})`}>
							<SprayCan />
						</g>
						{f >= spray &&
							[0, 1, 2].map((i) => {
								const t = ((f - spray) / 30 + i / 3) % 1;
								return <circle key={i} cx={760 + 30 + t * 260} cy={560 - 290 - t * 30} r={20 + t * 50} fill="#ff9a4a" opacity={(1 - t) * 0.5} />;
							})}
					</svg>
					<Chip f={f} at={spray + 4} x={1360} y={460} text="ПЕРЦОВЫЙ БАЛЛОНЧИК" color={RED} size={52} />
					<Chip f={f} at={bears + 4} x={1360} y={570} text="ОТ МЕДВЕДЕЙ" color={INK} size={46} />
					<Plaque f={f} at={2} x={960} y={120} text="ЛУЧШАЯ ЗАЩИТА" color={GREEN} size={50} />
				</AbsoluteFill>
			) : (
				<Stage16 bg="#8fc8ee">
					<Forest tone="day" seed={55} />
					<Turn x={bx} y={GROUND + 10} k={k}>
						<Bear s={0.8} pose={amp > 0.01 ? 'run' : 'stand4'} amp={amp} ph={Math.abs(1880 - bx) / 30} mouth={f < face ? 0.5 : 0.1} eyes={f >= face && f < runs + 6 ? 'closed' : 'open'} ears="back" />
					</Turn>
					<You x={GX} y={GROUND} s={0.55} f={f} face={{eyes: 'wide', mouth: 'tight', brows: 'angry', look: [0.9, 0], sweat: 0.6}} armR={mixArm(armPose(1, 'down'), AIM, ss((f - scene) / 10))} />
					{f >= cloud && <SprayCloud x={hand[0] + 50} y={hand[1] - 4} dir={4} p={interpolate(f, [cloud, cloud + 60], [0, 1], clamp)} />}
				</Stage16>
			)}
			<Chip f={f} at={cloud + 6} x={960} y={150} text="ОБЛАКОМ — ПРЯМО В МОРДУ" color={RED} size={46} />
			<Chip f={f} at={runs + 4} x={960} y={250} text="КОГДА ОН БЕЖИТ НА ТЕБЯ" color={INK} size={42} />
		</AbsoluteFill>
	);
};
