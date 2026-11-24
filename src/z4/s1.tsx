// «Каково это — умереть от лап медведя» — shots 1–5 (the hook: the forest, the headphones, the bear stands up, Гога
// runs, «Стоп, Гога!»), 7–11 (the master of the forest: weight, speed, nose, claws, how many), 14–20 (mistake one:
// alone and in headphones; how to be heard; the sudden meeting; mistake two: running; the chase; standing up to sniff).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Bear, BearFront, BearUp} from '../components/Bear';
import {Person} from '../components/Person';
import {StopChobi} from './chobiKit';
import {arm, armTo, Bush, camAt, Chip, Forest, GROUND, HEAVY, Headphones, INK, Layer, Notes, Plaque, RED, rnd, Stage16, Vig, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
// Гога's step: the walk phase grows with the distance he covers (one step ≈ 70 px at s = 0.55)
const stepPh = (dist: number, k = 1) => (dist / 44) * k;

// ============================================================ 1. the forest; Гога in headphones; branches crack ahead =====
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const n = 1;
	const crack = w(n, 'хрустят') - 6;
	const gx = interpolate(f, [0, len(n)], [260, 760], clamp);
	const shake = f >= crack ? (f - crack) / 4 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={1} />
				<Bush x={1560} y={GROUND + 6} s={1.5} c="#3f8250" shake={shake} />
				<Bush x={1760} y={GROUND + 20} s={1.2} c="#3a7a4a" shake={shake * 0.7} />
				<You x={gx} y={GROUND} s={0.55} f={f} walk={stepPh(gx - 260)} face={{eyes: 'narrow', mouth: 'smile', brows: 'neutral', look: [0.3, 0]}} outer={<Headphones />} />
				<Notes f={f} x={gx + 70} y={GROUND - 420} />
				{f >= crack &&
					[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${1500 + k * 90},${GROUND - 260 - (k % 2) * 40}) scale(${pop(f, crack + k * 4, 9)})`}>
							<path d="M -24,0 L -6,-10 L 6,8 L 24,-4" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					))}
			</Stage16>
			<Chip f={f} at={crack + 6} x={1600} y={300} text="ХРУСТ…" color="#6a4628" size={46} />
			<Chip f={f} at={w(n, 'наушниках') - 4} x={560} y={200} text="В НАУШНИКАХ" color="#2f86e0" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 2. he looks up: a bear, twenty steps away, ~300 kg =====
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const n = 2;
	const look = w(n, 'поднимает') - 2;
	const bear = w(n, 'медведь') - 10;
	const kg = w(n, 'триста') - 6;
	const bx = interpolate(f, [bear - 20, bear + 10], [1780, 1440], {...clamp, easing: (t) => t * (2 - t)});
	const walking = f >= bear - 20 && f < bear + 10;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={1} />
				<Bush x={1640} y={GROUND + 10} s={1.5} c="#3f8250" />
				<Bear x={bx} y={GROUND + 10} s={0.78} pose={walking ? 'walk' : 'stand4'} ph={(1780 - bx) / 50} head={f >= kg ? -6 : 0} />
				<Bush x={1840} y={GROUND + 30} s={1.2} c="#3a7a4a" />
				<You x={760} y={GROUND} s={0.55} f={f} face={{eyes: f >= look ? 'wide' : 'narrow', mouth: f >= bear ? 'o' : 'smile', brows: f >= look ? 'raised' : 'neutral', look: [0.8, 0], sweat: f >= bear ? 0.6 : 0}} outer={<Headphones />} />
				{/* twenty steps between them */}
				{f >= bear + 6 && (
					<g opacity={pop(f, bear + 6, 12)}>
						<path d="M 880,470 L 1180,470" stroke="#ffffff" strokeWidth={6} strokeDasharray="18 12" />
						<path d="M 896,454 L 880,470 L 896,486 M 1164,454 L 1180,470 L 1164,486" stroke="#ffffff" strokeWidth={6} fill="none" />
					</g>
				)}
			</Stage16>
			<Chip f={f} at={bear + 8} x={1030} y={400} text="20 ШАГОВ" color={INK} size={44} />
			<Chip f={f} at={kg} x={1500} y={560} text="≈ 300 КГ" color="#7a4a24" size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 3. the bear stands up — taller than Гога =====
const RISE = 8;
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const n = 3;
	const up = w(n, 'встаёт') - 4;
	const taller = w(n, 'выше') - 6;
	const r = interpolate(f, [up, up + RISE], [0.6, 1], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)});
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.12, cx: 1060, cy: 560});
	const BX = 1400;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Layer cam={cam}>
					<Forest tone="day" seed={1} />
					<Bush x={1640} y={GROUND + 10} s={1.5} c="#3f8250" />
					{f < up ? (
						<Bear x={BX + 40} y={GROUND + 10} s={0.78} pose="stand4" head={-6} />
					) : (
						<g transform={`translate(${BX},${GROUND + 10}) scale(1,${r}) translate(${-BX},${-GROUND - 10})`}>
							<BearUp x={BX} y={GROUND + 10} s={0.9} up={f >= up + RISE ? 0.6 : 0} />
						</g>
					)}
					{f >= up && f < up + 14 && <ellipse cx={BX} cy={GROUND + 12} rx={180 * pop(f, up, 10)} ry={22} fill="#c9a26a" opacity={0.6 * (1 - (f - up) / 14)} />}
					<You x={760} y={GROUND} s={0.55} f={f} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.8, -0.4], sweat: 0.8}} outer={<Headphones />} />
					{/* how tall: Гога's head and the bear's */}
					{f >= taller && (
						<g opacity={pop(f, taller, 12)}>
							<path d={`M 640,${GROUND - 450} L 1560,${GROUND - 450}`} stroke="#ffffff" strokeWidth={5} strokeDasharray="16 12" />
							<path d={`M 640,${GROUND - 580} L 1560,${GROUND - 580}`} stroke={YEL} strokeWidth={5} strokeDasharray="16 12" />
							<path d={`M 1600,${GROUND - 450} L 1600,${GROUND - 580} M 1586,${GROUND - 566} L 1600,${GROUND - 580} L 1614,${GROUND - 566}`} stroke={YEL} strokeWidth={7} fill="none" strokeLinecap="round" />
						</g>
					)}
				</Layer>
			</Stage16>
			<Chip f={f} at={taller + 4} x={1500} y={170} text="ВЫШЕ ГОГИ" color={RED} size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 4. he screams, turns away and runs =====
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const n = 4;
	const scream = w(n, 'кричит') - 4;
	const turn = w(n, 'разворачивается') - 4;
	const run = w(n, 'бежит') - 6;
	const gx = f < run ? 760 : interpolate(f, [run, run + 30], [760, 470], clamp);
	const BX = 1400;
	// the bear drops onto all fours and goes after him
	const chase = run + 6;
	const bx = interpolate(f, [chase, chase + 30], [BX - 40, 1120], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={1} />
				<Bush x={1640} y={GROUND + 10} s={1.5} c="#3f8250" />
				{f < chase ? <BearUp x={BX} y={GROUND + 10} s={0.9} up={0.6} mouth={f >= run ? 0.5 : 0} ears={f >= run ? 'back' : 'up'} /> : <Bear x={bx} y={GROUND + 10} s={0.78} pose="run" ph={(f - chase) * 0.55} mouth={0.5} ears="back" />}
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={f}
					walk={f >= run ? stepPh(760 - gx, 0.8) : undefined}
					face={{eyes: 'wide', mouth: f >= scream ? 'o' : 'open', brows: 'raised', look: f >= turn ? [-0.9, 0] : [0.8, 0], sweat: 1}}
					armL={f >= scream && f < run ? arm([-130, -400], [-190, -560], {}) : 'down'}
					armR={f >= scream && f < run ? arm([130, -400], [190, -560], {}) : 'down'}
					outer={<Headphones />}
				/>
				{f >= scream && f < run + 10 &&
					[0, 1, 2].map((k) => {
						const t = ((f - scream) / 14 + k / 3) % 1;
						return <path key={k} d={`M ${gx + 120 + t * 120},${GROUND - 380 - t * 40} q 30,40 0,80`} stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - t} />;
					})}
			</Stage16>
			<Chip f={f} at={scream + 2} x={380} y={190} text="КРИЧИТ" color={RED} size={42} />
			<Chip f={f} at={turn + 2} x={880} y={190} text="РАЗВОРАЧИВАЕТСЯ" color={RED} size={42} />
			<Chip f={f} at={run + 2} x={1380} y={190} text="БЕЖИТ" color={RED} size={42} />
		</AbsoluteFill>
	);
};

// the last frame of shot 4 — where Гога and the bear are when the picture freezes in 5 (and again in 18)
const end4 = () => {
	const n = 4;
	const F = len(n) - 1;
	const run = w(n, 'бежит') - 6;
	const chase = run + 6;
	const gx = interpolate(F, [run, run + 30], [760, 470], clamp);
	return {F, gx, walk: stepPh(760 - gx, 0.8), bx: interpolate(F, [chase, chase + 30], [1360, 1120], clamp), ph: (F - chase) * 0.55};
};
const Freeze4: React.FC = () => {
	const e = end4();
	return (
		<Stage16 bg="#8fc8ee">
			<Forest tone="day" seed={1} />
			<Bush x={1640} y={GROUND + 10} s={1.5} c="#3f8250" />
			<Bear x={e.bx} y={GROUND + 10} s={0.78} pose="run" ph={e.ph} mouth={0.5} ears="back" />
			<You x={e.gx} y={GROUND} s={0.55} f={e.F} walk={e.walk} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.9, 0], sweat: 1}} outer={<Headphones />} />
		</Stage16>
	);
};

// ============================================================ 5. «Стоп, Гога!» — two mistakes; the first one came earlier =====
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const n = 5;
	const two = w(n, 'две') - 4;
	const first = w(n, 'первую') - 4;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.75) brightness(0.85)'}}>
				<Freeze4 />
			</AbsoluteFill>
			<Vig k={0.45} />
			{[
				['1 · ?', 0],
				['2 · БЕГ', 8],
			].map(([t, d], k) =>
				f >= two + (d as number) ? (
					<div key={k} style={{position: 'absolute', left: 120, top: 330 + k * 110, transform: `scale(${pop(f, two + (d as number), 10) * (k === 0 && f >= first ? 1 + Math.max(0, Math.sin((f - first) / 3)) * 0.08 : 1)})`, transformOrigin: 'left center', background: RED, color: '#fff', border: '5px solid #fff', borderRadius: 16, padding: '8px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
						✕ {t}
					</div>
				) : null,
			)}
			<StopChobi n={n} f={f} at={0} to={len(n) - 20} />
		</AbsoluteFill>
	);
};

// ============================================================ 7. the biggest predator of our forests: 300–400 kg, over half a tonne on Kamchatka =====
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const n = 7;
	const big = w(n, 'самый') - 6;
	const kg = w(n, 'триста') - 6;
	const kam = w(n, 'камчатке') - 6;
	const bx = interpolate(f, [0, kg], [1900, 1100], {...clamp, easing: (t) => t * (2 - t)});
	const walking = f < kg;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={3} />
				<Bear x={bx} y={GROUND + 10} s={0.9} pose={walking ? 'walk' : 'stand4'} ph={(1900 - bx) / 55} />
				{/* the scale under him */}
				{f >= kg && (
					<g transform={`translate(1100,${GROUND + 24}) scale(${pop(f, kg, 12)})`}>
						<rect x={-300} y={0} width={600} height={34} rx={10} fill="#9aa4b0" stroke={INK} strokeWidth={6} />
						<rect x={318} y={-300} width={22} height={334} fill="#9aa4b0" stroke={INK} strokeWidth={5} />
						<rect x={250} y={-400} width={160} height={100} rx={16} fill="#16171b" stroke="#9aa4b0" strokeWidth={6} />
						<text x={330} y={-332} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#7cf08a">
							{Math.round(interpolate(f, [kg, kg + 30], [0, 350], clamp))}
						</text>
						<text x={330} y={-412} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#ffffff">
							КГ
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={big} x={960} y={130} text="САМЫЙ КРУПНЫЙ ХИЩНИК НАШИХ ЛЕСОВ" color="#7a4a24" size={46} />
			<Chip f={f} at={kg + 8} x={520} y={420} text="300–400 КГ" color={INK} size={60} />
			<Chip f={f} at={kam} x={520} y={540} text="КАМЧАТКА: БОЛЬШЕ 500 КГ" color={RED} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 8. clumsy? 50 km/h on a short dash — faster than the fastest man =====
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const n = 8;
	const fast = w(n, 'разгоняется') - 6;
	const fifty = w(n, 'пятидесяти') - 6;
	const man = w(n, 'быстрее') - 10;
	const v = interpolate(f, [fast, fifty + 6], [0, 50], clamp);
	const bearX = f < fast ? 1500 : interpolate(f, [fast, len(n)], [1500, 300], clamp);
	const manX = interpolate(f, [man, len(n)], [2100, 1100], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={5} path={false} />
				{/* two lanes on the meadow */}
				<rect x={-10} y={GROUND - 110} width={1940} height={12} fill="#ffffff" opacity={0.7} />
				<rect x={-10} y={GROUND + 30} width={1940} height={12} fill="#ffffff" opacity={0.7} />
				<Bear x={bearX} y={GROUND - 120} s={0.62} pose={f < fast ? 'stand4' : 'run'} ph={f * 0.55} ears="back" />
				{f >= fast &&
					[0, 1, 2].map((k) => <path key={k} d={`M ${bearX + 220 + k * 30},${GROUND - 280 + k * 50} l ${120 + k * 30},0`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
				{f >= man && <Person kind="dad" id="z4run" x={manX} y={GROUND + 20} scale={0.24} walk={f * 0.7} colors={{top: '#e8352e', topDark: '#b8252a', pants: '#2a3040', shoes: '#f4f4f4', hair: '#2a1a10', skin: '#a86a3a'}} face={{eyes: 'open', mouth: 'open', brows: 'neutral', blush: false, look: [-0.8, 0]}} plain kneePatch={false} />}
				{/* the speedometer */}
				<g transform="translate(1560,320)">
					<path d="M -150,0 A 150,150 0 0 1 150,0" stroke="#ffffff" strokeWidth={26} fill="none" opacity={0.85} />
					<path d={`M -150,0 A 150,150 0 0 1 ${-150 * Math.cos((v / 60) * Math.PI)},${-150 * Math.sin((v / 60) * Math.PI)}`} stroke={RED} strokeWidth={26} fill="none" />
					<text x={0} y={-30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill={INK}>
						{Math.round(v)}
					</text>
					<text x={0} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
						КМ/Ч
					</text>
				</g>
			</Stage16>
			<Chip f={f} at={2} x={520} y={180} text="КАЖЕТСЯ НЕУКЛЮЖИМ…" color="#7a4a24" size={44} to={fast - 2} />
			<Chip f={f} at={fifty + 4} x={520} y={180} text="ДО 50 КМ/Ч" color={RED} size={56} />
			<Chip f={f} at={man + 10} x={1400} y={560} text="РЕКОРД ЧЕЛОВЕКА ≈ 44 КМ/Ч" color={INK} size={38} />
		</AbsoluteFill>
	);
};

// a hound's head (a simple flat drawing; the origin at the middle of the head)
const Hound: React.FC = () => (
	<g>
		<ellipse cx={0} cy={0} rx={70} ry={58} fill="#c08a4a" stroke="#6a4020" strokeWidth={5} />
		<path d="M -60,-30 C -110,-10 -100,70 -66,80 C -50,60 -46,10 -40,-20 Z" fill="#7a4a24" stroke="#4a2a10" strokeWidth={5} />
		<path d="M 60,-30 C 110,-10 100,70 66,80 C 50,60 46,10 40,-20 Z" fill="#7a4a24" stroke="#4a2a10" strokeWidth={5} />
		<ellipse cx={0} cy={34} rx={36} ry={26} fill="#e0b880" />
		<ellipse cx={0} cy={20} rx={14} ry={10} fill={INK} />
		<circle cx={-26} cy={-14} r={7} fill={INK} />
		<circle cx={26} cy={-14} r={7} fill={INK} />
	</g>
);

// ============================================================ 9. a nose several times better than a bloodhound's; food from kilometres away =====
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const n = 9;
	const dog = w(n, 'собаки') - 8;
	const km = w(n, 'километры') - 8;
	return (
		<AbsoluteFill style={{background: '#eef6ea'}}>
			<Stage16 bg="#d6eedb">
				<Forest tone="day" seed={7} path={false} near={false} />
				<rect x={0} y={0} width={1920} height={1080} fill="#ffffff" opacity={0.35} />
				<Bear x={560} y={GROUND + 80} s={1.15} pose="stand4" head={-16} />
				{/* the smell: waves from far away to the nose */}
				{f >= km &&
					[0, 1, 2, 3].map((k) => {
						const t = ((f - km) / 50 + k / 4) % 1;
						return <path key={k} d={`M ${1800 - t * 1100},${420 + Math.sin(t * 8 + k) * 30} q 30,-30 60,0 q 30,30 60,0`} stroke="#e08a2a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={Math.min(1, (1 - t) * 2) * 0.9} />;
					})}
				{f >= km && (
					<g transform={`translate(1780,470) scale(${pop(f, km, 11)})`}>
						<circle r={60} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<path d="M -36,6 C -20,-26 20,-26 36,6 C 20,30 -20,30 -36,6 Z" fill="#5fb0f0" />
						<path d="M 34,6 l 22,-14 l 0,28 Z" fill="#5fb0f0" />
						<circle cx={-14} cy={0} r={4} fill={INK} />
					</g>
				)}
				{/* the bloodhound and the bear's nose: who smells better */}
				{f >= dog && (
					<g opacity={pop(f, dog, 12)}>
						<g transform="translate(1290,200) scale(0.8)">
							<Hound />
						</g>
						<rect x={1380} y={180} width={150} height={40} rx={12} fill="#c08a4a" />
						<text x={1546} y={212} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#6a4020">
							ИЩЕЙКА
						</text>
						<rect x={1380} y={250} width={480} height={40} rx={12} fill="#7a4a24" />
						<text x={1400} y={282} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#ffffff">
							МЕДВЕДЬ
						</text>
					</g>
				)}
			</Stage16>
			<Chip f={f} at={dog + 6} x={1560} y={370} text="В РАЗЫ ЛУЧШЕ ИЩЕЙКИ" color="#7a4a24" size={40} />
			<Chip f={f} at={km + 10} x={1300} y={600} text="ЧУЕТ ЗА КИЛОМЕТРЫ" color="#e08a2a" size={44} />
		</AbsoluteFill>
	);
};

// a bear's front paw up close: the pads and five long claws (the origin at the middle of the paw)
const Paw: React.FC = () => {
	const toes: [number, number][] = [
		[-118, -40],
		[-62, -92],
		[0, -108],
		[62, -92],
		[118, -40],
	];
	return (
		<g>
			{/* the claws first, then the paw over their roots */}
			{toes.map(([x, y], k) => {
				const a = Math.atan2(y + 10, x) ;
				const ex = x + Math.cos(a) * 130;
				const ey = y + Math.sin(a) * 130;
				return <path key={k} d={`M ${x - 14},${y} Q ${(x + ex) / 2 - 20},${(y + ey) / 2 - 30} ${ex},${ey} Q ${(x + ex) / 2 + 10},${(y + ey) / 2 - 4} ${x + 14},${y + 6} Z`} fill="#f2ebdf" stroke="#9a8a70" strokeWidth={5} strokeLinejoin="round" />;
			})}
			<path d="M -170,30 C -190,-80 -100,-150 0,-150 C 100,-150 190,-80 170,30 C 150,140 -150,140 -170,30 Z" fill="#7a4a24" stroke="#3a1f0c" strokeWidth={8} />
			<path d="M -96,40 C -110,0 -60,-24 0,-24 C 60,-24 110,0 96,40 C 84,90 -84,90 -96,40 Z" fill="#2e1c12" />
			{toes.map(([x, y], k) => (
				<ellipse key={k} cx={x * 0.86} cy={y * 0.82 + 6} rx={26} ry={22} fill="#2e1c12" />
			))}
		</g>
	);
};

// ============================================================ 10. claws as long as your finger; it flips heavy stones and tears stumps =====
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const n = 10;
	const finger = w(n, 'палец') - 8;
	const stone = w(n, 'переворачивает') - 6;
	const stump = w(n, 'пни') - 6;
	const flip = interpolate(f, [stone + 4, stone + 20], [0, 1], clamp);
	const torn = interpolate(f, [stump, stump + 10], [0, 1], clamp);
	const phase2 = f >= stone - 4;
	return (
		<AbsoluteFill style={{background: '#eef6ea'}}>
			{!phase2 && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(780,560) scale(${pop(f, 0, 12) * 1.45})`}>
						<Paw />
					</g>
					{f >= finger && (
						<g transform={`translate(1340,560) scale(${pop(f, finger, 11)})`}>
							{/* Гога's bony finger for scale */}
							<rect x={-26} y={-150} width={52} height={210} rx={24} fill="#f3eee2" stroke="#bdb29c" strokeWidth={6} />
							<path d="M -26,-50 L 26,-50 M -26,10 L 26,10" stroke="#bdb29c" strokeWidth={5} />
							<path d="M -70,-160 L -70,60" stroke={INK} strokeWidth={5} />
							<path d="M -82,-148 L -70,-160 L -58,-148 M -82,48 L -70,60 L -58,48" stroke={INK} strokeWidth={5} fill="none" />
						</g>
					)}
				</svg>
			)}
			{phase2 && (
				<Stage16 bg="#8fc8ee">
					<Forest tone="day" seed={9} />
					{/* a heavy stone rolls over; a stump bursts into splinters */}
					<g transform={`translate(${700 + flip * 120},${GROUND - 50 - Math.sin(flip * Math.PI) * 60}) rotate(${flip * 160})`}>
						<path d="M -110,40 C -130,-30 -60,-80 10,-74 C 90,-70 130,-10 110,40 C 80,70 -80,70 -110,40 Z" fill="#8a8a90" stroke="#4a4a50" strokeWidth={7} />
					</g>
					<Bear x={1000} y={GROUND + 10} s={0.8} pose="stand4" head={10} slap={f < stump ? interpolate(f, [stone - 4, stone + 10], [0, 1], clamp) : 0} />
					{f >= stump - 10 && (
						<g transform={`translate(1480,${GROUND})`}>
							<rect x={-60} y={-110} width={120} height={110} fill="#8a5a32" stroke="#4a2a10" strokeWidth={6} opacity={1 - torn} />
							{torn > 0 &&
								[0, 1, 2, 3, 4].map((k) => (
									<rect key={k} x={-14} y={-60} width={26} height={70} rx={6} fill="#a8703a" stroke="#4a2a10" strokeWidth={4} transform={`translate(${(k - 2) * 60 * torn},${-torn * (60 + k * 20)}) rotate(${(k - 2) * 40 * torn})`} />
								))}
						</g>
					)}
				</Stage16>
			)}
			{!phase2 && <Chip f={f} at={finger + 6} x={1340} y={250} text="≈ ДЛИНА ПАЛЬЦА" color={INK} size={46} />}
			{phase2 && <Chip f={f} at={stone + 6} x={600} y={200} text="ПЕРЕВОРАЧИВАЕТ КАМНИ" color="#4a4a50" size={44} />}
			{phase2 && <Chip f={f} at={stump + 4} x={1380} y={300} text="РАЗРЫВАЕТ ПНИ" color="#7a4a24" size={44} />}
		</AbsoluteFill>
	);
};

// ============================================================ 11. about 300,000 brown bears in Russia — more than anywhere =====
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const n = 11;
	const num = w(n, 'трёхсот') - 6;
	const most = w(n, 'больше') - 6;
	const count = Math.round(interpolate(f, [num, num + 40], [0, 300000], {...clamp, easing: (t) => 1 - (1 - t) * (1 - t)}) / 1000) * 1000;
	const shown = Math.floor(interpolate(f, [4, num + 30], [0, 105], clamp));
	return (
		<AbsoluteFill style={{background: '#e8f1e2'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* the field of little bears: each one stands for 2,500 */}
				{Array.from({length: shown}).map((_, i) => {
					const col = i % 15;
					const row = Math.floor(i / 15);
					return (
						<g key={i} transform={`translate(${200 + col * 110 + (row % 2) * 40},${320 + row * 80}) scale(${0.14 * pop(f, 4 + i * 0.25, 12)})`} opacity={0.9}>
							<Bear pose="stand4" s={1} fur={rnd(i) > 0.5 ? 'brown' : 'grizzly'} />
						</g>
					);
				})}
			</svg>
			{f >= num && (
				<div style={{position: 'absolute', left: 960, top: 190, transform: `translate(-50%,-50%) scale(${pop(f, num, 11)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 150, color: INK, textShadow: `8px 8px 0 ${YEL}`, whiteSpace: 'nowrap'}}>≈ {count.toLocaleString('ru-RU')}</div>
			)}
			<Plaque f={f} at={2} x={960} y={70} text="БУРЫЕ МЕДВЕДИ В РОССИИ" color="#7a4a24" size={40} />
			<Chip f={f} at={most} x={1560} y={330} text="№1 В МИРЕ" color={RED} size={58} />
		</AbsoluteFill>
	);
};

// ============================================================ 14. mistake one: alone, in headphones =====
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const n = 14;
	const one = w(n, 'ошибка') - 4;
	const alone = w(n, 'один', 0);
	const head = w(n, 'наушниках') - 6;
	const gx = interpolate(f, [0, one], [300, 620], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={1} />
				<You x={gx} y={GROUND} s={0.55} f={f} walk={f < one ? stepPh(gx - 300) : undefined} face={{eyes: 'narrow', mouth: 'smile', brows: 'neutral', look: [0.4, 0]}} outer={<Headphones />} />
				<Notes f={f} x={gx + 70} y={GROUND - 420} />
			</Stage16>
			<Chip f={f} at={alone + 4} x={420} y={300} text="ОДИН" color={RED} size={48} />
			<Chip f={f} at={head + 2} x={420} y={400} text="В НАУШНИКАХ" color={RED} size={48} />
			<StopChobi n={n} f={f} at={one - 10} to={len(n) - 18} label="ОШИБКА №1 · ОДИН И В НАУШНИКАХ" />
		</AbsoluteFill>
	);
};

// ============================================================ 15. a bear does not seek you out: if it hears you from afar, it steps off the path =====
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const n = 15;
	const hear = w(n, 'услышит') - 8;
	const go = w(n, 'уйдёт') - 8;
	const gx = interpolate(f, [0, len(n)], [260, 620], clamp);
	const bx = f < go ? 1500 : interpolate(f, [go, go + 50], [1500, 2200], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={11} />
				<Bear x={bx} y={GROUND - 40} s={0.5} dir={f >= go ? -1 : 1} pose={f >= go ? 'walk' : 'stand4'} ph={(bx - 1500) / 40} head={f >= hear && f < go ? -10 : 8} />
				<You x={gx} y={GROUND} s={0.55} f={f} walk={stepPh(gx - 260)} face={{eyes: 'open', mouth: Math.sin(f / 4) > 0 ? 'open' : 'smile', brows: 'neutral', look: [0.5, 0]}} />
				{/* he talks out loud: the sound travels */}
				{[0, 1, 2].map((k) => {
					const t = ((f / 24 + k / 3) % 1);
					return <path key={k} d={`M ${gx + 120 + t * 700},${GROUND - 360} q 24,40 0,80`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.8} />;
				})}
				{f >= hear && f < go + 20 && (
					<g transform={`translate(1500,${GROUND - 300}) scale(${pop(f, hear, 10)})`}>
						<circle r={34} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={INK}>
							!
						</text>
					</g>
				)}
			</Stage16>
			<Chip f={f} at={2} x={960} y={160} text="МЕДВЕДЬ НЕ ИЩЕТ ВСТРЕЧИ" color="#3a8a4a" size={44} />
			<Chip f={f} at={go + 6} x={1500} y={360} text="УХОДИТ С ДОРОГИ" color="#3a8a4a" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 16. the sudden meeting round a bend; a frightened bear defends itself =====
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const n = 16;
	const bend = w(n, 'поворота') - 10;
	const near = w(n, 'нескольких') - 6;
	const def = w(n, 'защищается') - 8;
	const gx = interpolate(f, [bend - 30, near], [420, 820], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={13} />
				{/* the bear behind the bend, eating berries */}
				{f < def ? <Bear x={1240} y={GROUND + 10} s={0.8} pose="stand4" head={f >= near ? -4 : 26} /> : <BearUp x={1240} y={GROUND + 10} s={0.88} mouth={0.7} ears="back" />}
				<You x={gx} y={GROUND} s={0.55} f={f} walk={f < near ? stepPh(gx - 420) : undefined} face={{eyes: f >= near ? 'wide' : 'open', mouth: f >= near ? 'o' : 'smile', brows: f >= near ? 'raised' : 'neutral', look: [0.6, 0], sweat: f >= near ? 0.8 : 0}} />
				{/* the bend: a wall of bushes between them until they meet */}
				<g opacity={interpolate(f, [near - 6, near + 4], [1, 0.0], clamp)}>
					<Bush x={1000} y={GROUND + 20} s={2.4} c="#2f6a40" />
				</g>
				{f >= near && f < near + 16 && <circle cx={1040} cy={GROUND - 300} r={pop(f, near, 8) * 120} fill="none" stroke="#ffffff" strokeWidth={10} opacity={1 - (f - near) / 16} />}
			</Stage16>
			<Plaque f={f} at={2} x={960} y={130} text="САМЫЕ ОПАСНЫЕ ВСТРЕЧИ — ВНЕЗАПНЫЕ" color={RED} size={44} />
			<Chip f={f} at={def + 4} x={1460} y={300} text="ИСПУГАН → ЗАЩИЩАЕТСЯ" color={RED} size={42} />
		</AbsoluteFill>
	);
};

// ============================================================ 17. talk, clap, sing; walk in company — let the bear know first =====
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const n = 17;
	const clap = w(n, 'хлопай') - 6;
	const sing = w(n, 'пой') - 4;
	const company = w(n, 'компанией') - 8;
	const first = w(n, 'первым') - 8;
	const c = Math.abs(Math.sin((f - clap) / 3));
	const gx = interpolate(f, [0, len(n)], [520, 900], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={15} />
				{f >= company && <Person kind="boy" id="z4fr1" x={gx - 260} y={GROUND} scale={0.4} walk={f * 0.3} face={{eyes: 'open', mouth: 'open', brows: 'neutral', blush: false, look: [0.6, 0]}} />}
				{f >= company && <Person kind="girl" id="z4fr2" x={gx + 240} y={GROUND} scale={0.4} walk={f * 0.3 + 1} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', blush: false, look: [-0.4, 0]}} />}
				<You
					x={gx}
					y={GROUND}
					s={0.55}
					f={f}
					walk={f < clap || f >= company ? stepPh(gx - 520) : undefined}
					face={{eyes: 'open', mouth: f >= sing ? (Math.sin(f / 4) > 0 ? 'o' : 'open') : 'open', brows: 'neutral', look: [0.4, 0]}}
					armL={f >= clap && f < company ? arm([-120, -380], [-30 - c * 60, -430], {}) : 'down'}
					armR={f >= clap && f < company ? arm([120, -380], [30 + c * 60, -430], {}) : 'down'}
				/>
				{f >= sing && <Notes f={f} x={gx + 60} y={GROUND - 440} />}
				{f >= clap && f < company && c > 0.95 && <path d={`M ${gx - 40},${GROUND - 300} l -20,-20 M ${gx + 40},${GROUND - 300} l 20,-20 M ${gx},${GROUND - 330} l 0,-26`} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" />}
				{f >= first && (
					<g transform={`translate(1620,${GROUND - 40})`} opacity={pop(f, first, 12)}>
						<Bear s={0.4} dir={-1} pose="walk" ph={f * 0.15} />
					</g>
				)}
			</Stage16>
			<Chip f={f} at={w(n, 'разговаривай') - 4} x={400} y={180} text="РАЗГОВАРИВАЙ" color="#3a8a4a" size={40} />
			<Chip f={f} at={clap + 2} x={780} y={180} text="ХЛОПАЙ" color="#3a8a4a" size={40} />
			<Chip f={f} at={sing + 2} x={1080} y={180} text="ПОЙ" color="#3a8a4a" size={40} />
			<Chip f={f} at={company + 4} x={1420} y={180} text="ХОДИ КОМПАНИЕЙ" color="#3a8a4a" size={40} />
			<Chip f={f} at={first + 4} x={1560} y={460} text="ОН УЗНАЕТ ПЕРВЫМ — И УЙДЁТ" color="#3a8a4a" size={36} />
		</AbsoluteFill>
	);
};

// ============================================================ 18. mistake two: Гога ran =====
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const n = 18;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.75) brightness(0.85)'}}>
				<Freeze4 />
			</AbsoluteFill>
			<StopChobi n={n} f={f} at={0} to={len(n) - 18} label="ОШИБКА №2 · БЕГ" />
		</AbsoluteFill>
	);
};

// ============================================================ 19. you cannot outrun a bear: seconds; what runs is prey; the chase instinct =====
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const n = 19;
	const secs = w(n, 'секунд') - 8;
	const prey = w(n, 'добычу') - 8;
	const inst = w(n, 'инстинкт') - 8;
	const L = len(n);
	// the camera runs with them; the gap closes
	const gx = 700;
	const gap = interpolate(f, [0, L], [620, 220], clamp);
	const t = Math.min(3, Math.floor(interpolate(f, [secs, secs + 60], [0, 3.99], clamp)));
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<g transform={`translate(${-((f * 18) % 1920)},0)`}>
					<Forest tone="day" seed={1} near={false} />
					<g transform="translate(1920,0)">
						<Forest tone="day" seed={1} near={false} />
					</g>
				</g>
				<Bear x={gx + gap} y={GROUND + 10} s={0.78} pose="run" ph={f * 0.55} mouth={0.4} ears="back" />
				<You x={gx} y={GROUND} s={0.55} f={f} walk={f * 0.75} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [-0.9, 0], sweat: 1}} />
				{f >= prey && (
					<g transform={`translate(${gx},${GROUND - 250})`} opacity={pop(f, prey, 10)}>
						<circle r={150} fill="none" stroke={RED} strokeWidth={8} />
						<circle r={90} fill="none" stroke={RED} strokeWidth={6} />
						<path d="M -180,0 L -110,0 M 110,0 L 180,0 M 0,-180 L 0,-110 M 0,110 L 0,180" stroke={RED} strokeWidth={8} />
					</g>
				)}
			</Stage16>
			{f >= secs && <div style={{position: 'absolute', left: 1640, top: 150, transform: `translate(-50%,-50%) scale(${pop(f, secs, 11)})`, background: INK, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 64, padding: '10px 30px', borderRadius: 20}}>{t} СЕК</div>}
			<Chip f={f} at={2} x={560} y={160} text="НЕ УБЕЖАТЬ" color={RED} size={48} />
			<Chip f={f} at={prey + 6} x={700} y={300} text="ДОБЫЧА" color={RED} size={44} />
			<Plaque f={f} at={inst + 4} x={1220} y={300} text="ИНСТИНКТ ПОГОНИ" color={RED} size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 20. standing up is not an attack: it sniffs and looks at you =====
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const n = 20;
	const not = w(n, 'не') - 4;
	const sniff = w(n, 'принюхивается') - 8;
	const look = w(n, 'разглядывает') - 8;
	const upK = f >= sniff ? 0.5 + Math.sin((f - sniff) / 5) * 0.5 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc8ee">
				<Forest tone="day" seed={17} />
				<BearUp x={1100} y={GROUND + 10} s={1.0} up={upK} head={f >= look ? -8 : 0} />
				{f >= sniff &&
					[0, 1, 2].map((k) => {
						const t = ((f - sniff) / 24 + k / 3) % 1;
						return <path key={k} d={`M ${700 + t * 300},${GROUND - 560 + Math.sin(t * 6) * 16} q 20,-16 40,0 q 20,16 40,0`} stroke="#e08a2a" strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.9} />;
					})}
				{f >= look && (
					<g transform={`translate(1100,${GROUND - 760}) scale(${pop(f, look, 10)})`}>
						<circle r={44} fill="#ffffff" stroke={INK} strokeWidth={5} />
						<text x={0} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={INK}>
							?
						</text>
					</g>
				)}
			</Stage16>
			<Chip f={f} at={not + 4} x={520} y={200} text="ВСТАЛ — НЕ ЗНАЧИТ НАПАДАЕТ" color="#3a8a4a" size={40} />
			<Chip f={f} at={sniff + 4} x={520} y={320} text="ПРИНЮХИВАЕТСЯ" color="#e08a2a" size={44} />
			<Chip f={f} at={look + 4} x={520} y={430} text="РАЗГЛЯДЫВАЕТ" color="#2f86e0" size={44} />
		</AbsoluteFill>
	);
};

export const _S1 = {BearFront, armTo};
