// «Откуда взялись чипсы» — the history shots (5–17): Saratoga 1853 and the spiteful chef, the old English book, the
// barrel, the wax-paper bags of 1926, the flavour of 1954, the salt twist, «Московский» 1963, the 90s kiosk.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Bubble, HEAVY} from '../components/Overlays';
import {Person} from '../components/Person';
import {Stage} from '../components/Stage';
import {Cab, Horse} from '../w1/old';
import {Stamp, YearTitle} from '../w1/kit';
import {Cap, CHEF, Chip, ChipPile, GUEST, INK, JOE, LAURA, lvl, Potato, SERIF, SOVIET, WORKER, YEL} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.cubic);

// warm old-photo tone + vignette over a history shot
const Old: React.FC<{a?: number}> = ({a = 0.16}) => (
	<>
		<AbsoluteFill style={{background: '#c8944a', opacity: a, mixBlendMode: 'multiply'}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,20,5,0.55) 100%)'}} />
	</>
);
const Flash: React.FC<{f: number; len?: number}> = ({f, len: l = 12}) => {
	const o = interpolate(f, [0, l], [1, 0], clamp);
	return o > 0 ? <AbsoluteFill style={{background: '#fff6e0', opacity: o}} /> : null;
};
// a label on a line pointing at a thing (screen coords)
const Point: React.FC<{f: number; at: number; x: number; y: number; tx: number; ty: number; text: string; color?: string; size?: number}> = ({f, at, x, y, tx, ty, text, color = YEL, size = 38}) => {
	if (f < at) return null;
	const p = pop(f, at, 12);
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<line x1={x} y1={y} x2={x + (tx - x) * Math.min(1, p)} y2={y + (ty - y) * Math.min(1, p)} stroke="#fff" strokeWidth={5} />
				<circle cx={x} cy={y} r={11 * p} fill={color} stroke={INK} strokeWidth={4} />
			</svg>
			<div style={{position: 'absolute', left: tx, top: ty, transform: `translate(-50%,-50%) scale(${p})`, background: 'rgba(14,14,18,0.9)', border: `4px solid ${color}`, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: size, padding: '6px 20px', borderRadius: 14, whiteSpace: 'nowrap'}}>
				{text}
			</div>
		</>
	);
};

// ============================================================ 5. «Америка, 1853 год. Курорт Саратога.» =====
const Tree: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#4f7a3a'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-14} y={-160} width={28} height={160} fill="#5a3a24" />
		<circle cx={0} cy={-230} r={110} fill={c} />
		<circle cx={-70} cy={-180} r={80} fill={c} />
		<circle cx={74} cy={-176} r={84} fill={c} />
		<circle cx={20} cy={-300} r={70} fill={c} />
		<circle cx={-30} cy={-250} r={60} fill="#fff" opacity={0.08} />
	</g>
);
const LakeHouse: React.FC = () => (
	<g>
		<path d="M 150,560 L 540,380 L 930,560 Z" fill="#5a5a62" />
		<rect x={170} y={556} width={740} height={440} fill="#f2ede2" />
		{Array.from({length: 22}).map((_, k) => (
			<line key={k} x1={170} y1={570 + k * 20} x2={910} y2={570 + k * 20} stroke="#ddd4c2" strokeWidth={3} />
		))}
		{[0, 1].map((row) =>
			[0, 1, 2, 3, 4].map((c) => (
				<g key={`${row}${c}`}>
					<rect x={214 + c * 140} y={600 + row * 170} width={74} height={110} fill="#38485a" />
					<rect x={206 + c * 140} y={592 + row * 170} width={90} height={10} fill="#fff" />
					<line x1={251 + c * 140} y1={600 + row * 170} x2={251 + c * 140} y2={710 + row * 170} stroke="#f2ede2" strokeWidth={5} />
				</g>
			)),
		)}
		{/* the veranda */}
		<rect x={140} y={880} width={800} height={26} fill="#6a6a72" />
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={150 + k * 96} y={900} width={16} height={110} fill="#fff" />
		))}
		<rect x={140} y={960} width={800} height={10} fill="#fff" />
		<rect x={300} y={820} width={480} height={56} fill="#2a3a2a" />
		<text x={540} y={860} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={34} fill="#f2e2b0" letterSpacing={3}>
			MOON&apos;S LAKE HOUSE
		</text>
		<rect x={536} y={300} width={6} height={100} fill="#3a3a40" />
		<path d="M 542,302 L 610,318 L 542,336 Z" fill="#b8402e" />
	</g>
);
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const n = 5;
	const ph = f * 0.22;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.08), cx: 540, cy: 960}} bg="#f4e2c0" light={{glow: 0.2, vignette: 0.3}}>
				<defs>
					<linearGradient id="c1s5sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#f2c890" />
						<stop offset="1" stopColor="#fbeed4" />
					</linearGradient>
				</defs>
				<rect x={-300} y={-300} width={1700} height={1200} fill="url(#c1s5sky)" />
				<circle cx={820} cy={260} r={70} fill="#fff4d6" />
				<rect x={-300} y={760} width={1700} height={260} fill="#7fa3b0" />
				{[800, 860, 930].map((y, k) => (
					<rect key={k} x={-100 + k * 120} y={y} width={500 - k * 80} height={6} fill="#fff" opacity={0.35} />
				))}
				{[-60, 60, 980, 1120].map((x, k) => (
					<Tree key={k} x={x} y={800} s={0.6} c="#5f7f4a" />
				))}
				<LakeHouse />
				<rect x={-300} y={1000} width={1700} height={1200} fill="#cfae7e" />
				<path d="M -300,1060 L 1400,1060" stroke="#b8956a" strokeWidth={10} />
				<Tree x={30} y={1640} s={1.6} />
				<Tree x={1060} y={1700} s={1.7} c="#46703a" />
				<g transform={`translate(${lerp(f, 0, len(n), 1500, 520)},1520) scale(0.56)`}>
					<Horse phase={ph} color="#5a3a24" mane="#2a1a12" harness duga="#5a3a24" />
					<g transform="translate(-160,0)">
						<Cab phase={ph} id="c1s5cab" color="#2a2c34" />
					</g>
				</g>
			</Stage>
			<Old />
			<YearTitle f={f} year={1853} sub="США · САРАТОГА" at={4} hold={100} />
			<Flash f={f} />
		</AbsoluteFill>
	);
};

// ============================================================ the restaurant =====
const Dining: React.FC = () => (
	<g>
		<rect x={-300} y={-300} width={1700} height={1380} fill="#6e2f2a" />
		{Array.from({length: 12}).map((_, k) => (
			<path key={k} d={`M ${-200 + k * 120},-300 l 0,1380`} stroke="#5e2622" strokeWidth={36} />
		))}
		<rect x={-300} y={1000} width={1700} height={420} fill="#4a2e1e" />
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={-200 + k * 170} y={1040} width={130} height={330} rx={8} fill="#3e2618" />
		))}
		<rect x={-300} y={990} width={1700} height={20} fill="#7a4a2a" />
		<rect x={-300} y={1410} width={1700} height={700} fill="#5a3a24" />
		{/* a tall window with drapes */}
		<rect x={60} y={260} width={280} height={600} fill="#f2e2b0" />
		<rect x={76} y={276} width={248} height={568} fill="#a8c4cc" />
		<path d="M 30,230 L 150,230 Q 120,560 160,890 L 30,890 Z" fill="#2f4a3a" />
		<path d="M 370,230 L 250,230 Q 280,560 240,890 L 370,890 Z" fill="#2f4a3a" />
		{/* the chandelier */}
		<line x1={700} y1={-100} x2={700} y2={260} stroke="#c8a24a" strokeWidth={6} />
		<path d="M 560,300 Q 700,380 840,300" stroke="#c8a24a" strokeWidth={10} fill="none" />
		{[560, 630, 700, 770, 840].map((x, k) => (
			<g key={k}>
				<rect x={x - 8} y={250 + (k % 2) * 20} width={16} height={46} fill="#f4efe2" />
				<ellipse cx={x} cy={240 + (k % 2) * 20} rx={9} ry={16} fill="#ffd27a" />
				<circle cx={x} cy={250 + (k % 2) * 20} r={60} fill="#ffd27a" opacity={0.14} />
			</g>
		))}
	</g>
);
const TableCloth: React.FC<{x: number; y: number; w: number}> = ({x, y, w: ww}) => (
	<g>
		<path d={`M ${x - ww / 2},${y} L ${x + ww / 2},${y} L ${x + ww / 2 + 30},${y + 300} L ${x - ww / 2 - 30},${y + 300} Z`} fill="#f6f2e8" />
		<rect x={x - ww / 2} y={y - 14} width={ww} height={20} fill="#fffdf6" />
		{Array.from({length: 6}).map((_, k) => (
			<path key={k} d={`M ${x - ww / 2 + 20 + k * (ww / 6)},${y + 30} l -6,260`} stroke="#e2dccd" strokeWidth={6} />
		))}
	</g>
);
const Fries: React.FC<{x: number; y: number; s?: number; thin?: boolean}> = ({x, y, s = 1, thin = false}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={6} rx={120} ry={36} fill="#fff" stroke="#d8d2c4" strokeWidth={5} />
		{thin ? (
			<ChipPile x={0} y={-4} w={150} n={10} r={22} seed={7} />
		) : (
			[[-60, -6, -14], [-30, -14, 8], [0, -8, -6], [30, -16, 12], [60, -6, -10], [-15, -26, 20], [15, -24, -18]].map(([fx, fy, r], k) => (
				<rect key={k} x={fx - 11} y={fy - 34} width={22} height={66} rx={6} fill="#e8b85a" stroke="#c88a2a" strokeWidth={3} transform={`rotate(${r} ${fx} ${fy})`} />
			))
		)}
	</g>
);
const Steam: React.FC<{f: number; x: number; y: number; s?: number}> = ({f, x, y, s = 1}) => (
	<g opacity={0.6}>
		{[0, 1, 2].map((k) => {
			const t = (f * 1.2 + k * 14) % 42;
			return <path key={k} d={`M ${x + (k - 1) * 22 * s},${y - t * 2 * s} q ${12 * s},${-14 * s} 0,${-28 * s} q ${-12 * s},${-14 * s} 0,${-28 * s}`} stroke="#fff" strokeWidth={6 * s} fill="none" strokeLinecap="round" opacity={1 - t / 42} />;
		})}
	</g>
);
// the guest at his table (front view, sitting behind it)
const Guest: React.FC<{id: string; f: number; face: React.ComponentProps<typeof Person>['face']; x?: number; armL?: React.ComponentProps<typeof Person>['armL']; armR?: React.ComponentProps<typeof Person>['armR']; headTurn?: number; k?: number}> = ({id, f, face, x = 790, armL, armR, headTurn = -0.3, k = 0.82}) => (
	<Person kind="dad" id={id} x={x} y={1250 + 470 * k} scale={k} colors={GUEST} plain kneePatch={false} hideLegs beard="#7a5a3a" hat={{type: 'top', color: '#1e1e26', band: '#4a1a22'}} breathe={f} headTurn={headTurn} face={{blush: true, ...face}} armL={armL} armR={armR} />
);

// ============================================================ 6. «Повар Джордж Крам подаёт жареную картошку.» =====
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const n = 6;
	const L = len(n);
	const x = lerp(f, 0, L * 0.8, -60, 360, Easing.out(Easing.cubic));
	const walking = f < L * 0.8;
	const k = 0.95;
	return (
		<AbsoluteFill>
			<Stage cam={{s: 1.02, cx: 540, cy: 990}} bg="#2a1a14">
				<Dining />
				<Guest id="c1s6g" f={f} face={{eyes: 'narrow', brows: 'neutral', mouth: 'flat', look: [-0.8, 0]}} />
				<TableCloth x={790} y={1250} w={420} />
				<Person
					kind="dad"
					id="c1s6c"
					x={x}
					y={1880}
					scale={k}
					colors={CHEF}
					plain
					kneePatch={false}
					apron="#ffffff"
					moustache="#231c18"
					hat={{type: 'chef', color: '#ffffff'}}
					walk={walking ? f * 0.32 : undefined}
					breathe={f}
					headTurn={0.4}
					face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [0.7, 0], blush: false}}
					armR={{target: [150, -780], bend: 1}}
				/>
				<Fries x={x + 150 * k + 30} y={1880 - 800 * k} s={0.75} />
				<Steam f={f} x={x + 150 * k + 30} y={1880 - 820 * k} s={0.8} />
			</Stage>
			<Old />
			<Point f={f} at={Math.max(4, w(n, 'джордж') - 4)} x={260} y={760} tx={300} ty={440} text="ДЖОРДЖ КРАМ, ПОВАР" />
		</AbsoluteFill>
	);
};

// ============================================================ 7. «А капризный гость отправляет её назад: «Толсто! Мягко!»» =====
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const n = 7;
	const push = lerp(f, w(n, 'назад') - 6, w(n, 'назад') + 8, 0, 1, Easing.out(Easing.back(1.6)));
	const plateX = lerp(push, 0, 1, 760, 560);
	const q = w(n, 'толсто');
	return (
		<AbsoluteFill>
			<Stage cam={{s: 1.5, cx: 700, cy: 1000}} bg="#2a1a14">
				<Dining />
				<Guest
					id="c1s7g"
					f={f}
					face={{eyes: 'narrow', brows: 'angry', mouth: f >= q && f < q + 40 ? 'open' : 'frown', look: [-0.3, 0.3]}}
					armR={{target: [lerp(push, 0, 1, 80, -120), -560], bend: 1}}
					headTurn={-0.2}
				/>
				<TableCloth x={790} y={1250} w={420} />
				<Fries x={plateX} y={1236} s={0.8} />
				<Person kind="dad" id="c1s7c" x={330} y={1880} scale={0.95} colors={CHEF} plain kneePatch={false} apron="#ffffff" moustache="#231c18" hat={{type: 'chef', color: '#ffffff'}} breathe={f} headTurn={0.5} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [0.8, 0], blush: false}} />
			</Stage>
			<Old />
			<Bubble x={700} y={500} text="Толсто! Мягко!" from={q - 4} to={len(n)} tail="right" />
		</AbsoluteFill>
	);
};

// ============================================================ the kitchen =====
const Kitchen1853: React.FC = () => (
	<g>
		<rect x={-300} y={-300} width={1700} height={1500} fill="#a8563e" />
		{Array.from({length: 30}).map((_, r) =>
			Array.from({length: 9}).map((_, c) => <rect key={`${r}-${c}`} x={-280 + c * 190 + (r % 2) * 95} y={-280 + r * 52} width={180} height={44} fill="#b4624a" />),
		)}
		<rect x={-300} y={360} width={1700} height={24} fill="#6a4228" />
		{[100, 260, 420].map((x, k) => (
			<g key={k}>
				<rect x={x} y={250} width={110} height={110} rx={14} fill="#4a4a52" />
				<rect x={x - 10} y={240} width={130} height={20} rx={8} fill="#5a5a62" />
			</g>
		))}
		<rect x={700} y={140} width={260} height={220} fill="#e8dcc0" />
		<rect x={716} y={156} width={228} height={188} fill="#b8d4dc" />
	</g>
);
const Knife: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-10} y={-30} width={20} height={60} rx={6} fill="#4a2e1e" />
		<path d="M -12,30 L 12,30 L 8,170 L -14,150 Z" fill="#d8dce2" />
		<path d="M 4,34 L 8,170" stroke="#fff" strokeWidth={3} />
	</g>
);
// ============================================================ 8. «Повар злится — и назло режет картошку тонко, как бумагу.» =====
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const n = 8;
	const chop = f > 18 ? Math.abs(Math.sin(f / 2.4)) : 0;
	const k = 1.0;
	const handY = lerp(chop, 0, 1, 1240, 1110);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.12, 1.2), cx: 540, cy: 1020}} bg="#2a1a14">
				<Kitchen1853 />
				<Person
					kind="dad"
					id="c1s8c"
					x={520}
					y={1250 + 470 * k}
					scale={k}
					colors={CHEF}
					plain
					kneePatch={false}
					hideLegs
					moustache="#231c18"
					hat={{type: 'chef', color: '#ffffff'}}
					breathe={f}
					face={{eyes: 'narrow', brows: 'angry', mouth: 'tight', look: [0.2, 0.8], blush: false}}
					armR={{target: [200, handY - 1250 - 470 * k], bend: 1}}
					armL={{target: [-90, -470 - 10], bend: -1}}
				/>
				{/* steam of anger from under the toque */}
				{[-1, 1].map((sd) => (
					<g key={sd} opacity={0.75}>
						{[0, 1].map((j) => {
							const t = (f * 1.6 + j * 18) % 36;
							return <circle key={j} cx={520 + sd * (100 + t * 1.5)} cy={720 - t * 3} r={16 + t * 0.6} fill="#fff" opacity={1 - t / 36} />;
						})}
					</g>
				))}
				{/* the work table, the board, the potato getting thinner, the knife */}
				<rect x={-300} y={1250} width={1700} height={700} fill="#8a5a36" />
				<rect x={-300} y={1240} width={1700} height={22} fill="#a8724a" />
				<rect x={560} y={1196} width={300} height={56} rx={12} fill="#c8955a" />
				<Potato x={lerp(f, 0, len(n), 700, 760)} y={1200} r={lerp(f, 0, len(n), 64, 34)} cut />
				<Knife x={720} y={handY - 30} rot={-6} />
				{/* thin slices flying off */}
				{Array.from({length: 9}).map((_, j) => {
					const t = f - 20 - j * 10;
					if (t < 0) return null;
					const tt = Math.min(t, 26);
					const x = 760 - tt * 9 - j * 6;
					const y = 1160 - tt * 10 + tt * tt * 0.55;
					return <ellipse key={j} cx={x} cy={y} rx={34} ry={22} fill="#f6e8b8" opacity={0.85} stroke="#e8d08a" strokeWidth={3} transform={`rotate(${tt * 14} ${x} ${y})`} />;
				})}
				{Array.from({length: Math.max(0, Math.min(8, Math.floor((f - 46) / 10)))}).map((_, j) => (
					<ellipse key={j} cx={540 - (j % 3) * 22} cy={1236 - j * 5} rx={34} ry={14} fill="#f6e8b8" stroke="#e8d08a" strokeWidth={3} opacity={0.9} />
				))}
			</Stage>
			<Old />
			<Point f={f} at={w(n, 'бумагу') - 4} x={540} y={1210} tx={540} ty={420} text="ТОНКО, КАК БУМАГА" />
		</AbsoluteFill>
	);
};

// ============================================================ 9. «Жарит до хруста и солит от души.» =====
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const n = 9;
	const gold = interpolate(f, [4, 40], [0, 1], clamp);
	const salt = w(n, 'солит') - 4;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.08), cx: 540, cy: 960}} bg="#1a120c">
				<rect x={-300} y={-300} width={1700} height={2600} fill="#2a1e16" />
				<ellipse cx={540} cy={1140} rx={520} ry={140} fill="#ff8a3a" opacity={0.25} />
				{/* the pan */}
				<rect x={900} y={980} width={260} height={46} rx={20} fill="#1d1d22" transform="rotate(-8 900 1000)" />
				<ellipse cx={540} cy={1010} rx={420} ry={190} fill="#26262c" />
				<ellipse cx={540} cy={990} rx={380} ry={160} fill="#c89a3a" />
				<ellipse cx={540} cy={990} rx={380} ry={160} fill="#e8b04a" opacity={0.4} />
				{Array.from({length: 18}).map((_, k) => {
					const t = (f + k * 7) % 20;
					const a = k * 2.4;
					return <circle key={k} cx={540 + Math.cos(a) * (60 + (k % 5) * 60)} cy={990 + Math.sin(a) * (30 + (k % 4) * 30)} r={4 + t * 0.6} fill="none" stroke="#fff6d0" strokeWidth={3} opacity={1 - t / 20} />;
				})}
				{Array.from({length: 11}).map((_, k) => {
					const a = k * 2.1;
					const x = 540 + Math.cos(a) * (40 + (k % 4) * 70);
					const y = 990 + Math.sin(a) * (20 + (k % 3) * 40);
					return (
						<g key={k}>
							<ellipse cx={x} cy={y} rx={56} ry={38} fill={gold > 0.5 ? '#e8a838' : '#f2e0a8'} opacity={0.95} transform={`rotate(${k * 33} ${x} ${y})`} />
							<ellipse cx={x} cy={y} rx={56} ry={38} fill="#d88a22" opacity={gold * 0.6} transform={`rotate(${k * 33} ${x} ${y})`} />
						</g>
					);
				})}
				{/* a hand with salt pours a heap of it */}
				{f >= salt - 10 && (
					<g transform={`translate(${lerp(f, salt - 10, salt, 900, 640, E)},520) rotate(150)`}>
						<rect x={-36} y={-70} width={72} height={130} rx={16} fill="#f4f2ee" stroke="#c8c4ba" strokeWidth={5} />
						<rect x={-40} y={-90} width={80} height={30} rx={10} fill="#b8b4aa" />
					</g>
				)}
				{f >= salt &&
					Array.from({length: 40}).map((_, k) => {
						const t = (f - salt + k * 1.7) % 22;
						return <circle key={k} cx={640 + ((k * 37) % 120) - 60 + t * 0.5} cy={620 + t * 18} r={4} fill="#fff" />;
					})}
			</Stage>
			<Cap text="ХРУСТ!" x={300} y={400} size={70} bg="#e0342b" rot={-8} p={pop(f, 30, 10)} />
		</AbsoluteFill>
	);
};

// ============================================================ 10. «А гость — в восторге! Так, по легенде, и родились чипсы.» =====
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const n = 10;
	const bite = f % 14 < 7;
	const st = w(n, 'легенде') - 4;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.62, 1.72), cx: 790, cy: 920}} bg="#2a1a14">
				<Dining />
				<Guest
					id="c1s10g"
					f={f}
					face={{eyes: 'happy', brows: 'raised', mouth: bite ? 'grin' : 'open', look: [0, 0]}}
					armR={{target: [40, -650], bend: 1}}
					headTurn={0}
				/>
				<g transform="translate(830,790)">
					<Chip x={0} y={0} r={28} rot={20} />
				</g>
				<TableCloth x={790} y={1250} w={420} />
				<Fries x={760} y={1236} s={0.8} thin />
				{[0, 1, 2, 3, 4].map((k) => {
					const t = (f + k * 9) % 40;
					const a = (k / 5) * Math.PI * 2 + f / 30;
					const r = 170 + t * 2;
					return <path key={k} d={starD(790 + Math.cos(a) * r, 730 + Math.sin(a) * r * 0.7, 18)} fill="#ffd34a" opacity={1 - t / 40} />;
				})}
			</Stage>
			<Old a={0.12} />
			<Cap text="ХРУМ!" x={260} y={560} size={64} bg="#ffd34a" color={INK} rot={-10} p={pop(f, 6, 10) * (f % 28 < 20 ? 1 : 0.94)} />
			<Stamp f={f} at={st} x={540} y={1560} text="ПО ЛЕГЕНДЕ" rot={-6} />
		</AbsoluteFill>
	);
};
const starD = (cx: number, cy: number, r: number) =>
	Array.from({length: 10})
		.map((_, k) => {
			const a = -Math.PI / 2 + (k * Math.PI) / 5;
			const rr = k % 2 === 0 ? r : r * 0.42;
			return `${k === 0 ? 'M' : 'L'} ${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
		})
		.join(' ') + ' Z';

// ============================================================ 11. «Правда, историки сомневаются: похожий рецепт был в английской книге ещё раньше.» =====
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const n = 11;
	const mx = lerp(f, 0, len(n), 330, 760, E);
	const q = w(n, 'сомневаются') - 4;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.06), cx: 540, cy: 980}} bg="#3a2616">
				<rect x={-300} y={-300} width={1700} height={2600} fill="#5a3a22" />
				{Array.from({length: 14}).map((_, k) => (
					<rect key={k} x={-300} y={-200 + k * 170} width={1700} height={6} fill="#4a2e1a" />
				))}
				{/* the open book */}
				<path d="M 60,620 Q 300,580 540,640 Q 780,580 1020,620 L 1020,1420 Q 780,1380 540,1440 Q 300,1380 60,1420 Z" fill="#6a3a22" />
				<path d="M 80,600 Q 300,560 530,620 L 530,1410 Q 300,1360 80,1400 Z" fill="#f2e6c8" />
				<path d="M 550,620 Q 780,560 1000,600 L 1000,1400 Q 780,1360 550,1410 Z" fill="#efe2c2" />
				<path d="M 530,620 L 550,620 L 550,1410 L 530,1410 Z" fill="#c8b48a" />
				{/* left page: an engraving of potatoes */}
				<g opacity={0.85}>
					<Potato x={250} y={900} r={90} rot={-12} />
					<Potato x={380} y={980} r={70} rot={20} />
					{Array.from({length: 7}).map((_, k) => (
						<ellipse key={k} cx={200 + k * 34} cy={1150 + (k % 2) * 16} rx={40} ry={16} fill="none" stroke="#6a4a2a" strokeWidth={4} transform={`rotate(${k * 20 - 40} ${200 + k * 34} ${1150 + (k % 2) * 16})`} />
					))}
				</g>
				{/* right page: the recipe */}
				<text x={775} y={680} textAnchor="middle" fontFamily={SERIF} fontSize={30} fill="#6a4a2a">
					— 1817 —
				</text>
				<text x={775} y={760} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={40} fill="#3a2414">
					POTATOES
				</text>
				<text x={775} y={810} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={32} fill="#3a2414">
					fried in slices
				</text>
				{Array.from({length: 13}).map((_, k) => (
					<rect key={k} x={600} y={860 + k * 36} width={k % 4 === 3 ? 220 : 350} height={10} rx={4} fill="#9a8460" />
				))}
				{/* the magnifying glass */}
				<g transform={`translate(${mx},${900 + Math.sin(f / 18) * 60})`}>
					<circle r={120} fill="#dff0f8" opacity={0.35} />
					<circle r={120} fill="none" stroke="#2a2a30" strokeWidth={20} />
					<rect x={80} y={80} width={36} height={190} rx={14} fill="#4a2e1e" transform="rotate(-45 98 175)" />
				</g>
			</Stage>
			<Old a={0.1} />
			<Point f={f} at={w(n, 'английской') - 4} x={775} y={760} tx={600} ty={430} text="АНГЛИЯ · 1817" />
			{f >= q &&
				[0, 1, 2].map((k) => {
					const p = pop(f, q + k * 6, 10);
					return (
						<div key={k} style={{position: 'absolute', left: 170 + k * 120, top: 1500 - k * 40, transform: `translate(-50%,-50%) scale(${p}) rotate(${(k - 1) * 12}deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: '#ffd34a', textShadow: '4px 4px 0 #1d1d24'}}>
							?
						</div>
					);
				})}
		</AbsoluteFill>
	);
};

// ============================================================ 12. «Сначала чипсы продавали из бочек — и они быстро отсыревали.» =====
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const n = 12;
	const wet = interpolate(f, [w(n, 'отсыревали') - 6, w(n, 'отсыревали') + 14], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.1), cx: 540, cy: 1060}} bg="#3a2616">
				<rect x={-300} y={-300} width={1700} height={1500} fill="#c8a878" />
				{[260, 520, 780].map((y, r) => (
					<g key={r}>
						<rect x={-300} y={y} width={1700} height={20} fill="#7a4a2a" />
						{Array.from({length: 9}).map((_, c) => (
							<rect key={c} x={-200 + c * 150 + (r % 2) * 40} y={y - 130} width={90} height={130} rx={10} fill={['#b8d4c8', '#e8c890', '#d8a8a0'][(c + r) % 3]} opacity={0.9} />
						))}
					</g>
				))}
				<rect x={-300} y={1000} width={1700} height={80} fill="#7a4a2a" />
				<rect x={-300} y={1080} width={1700} height={1200} fill="#8a5a36" />
				{/* the barrel */}
				<path d="M 300,1200 Q 270,1500 320,1800 L 760,1800 Q 810,1500 780,1200 Z" fill="#a8723e" />
				{[1260, 1520, 1760].map((y, k) => (
					<path key={k} d={`M ${292 - (k === 1 ? 14 : 0)},${y} Q 540,${y + 26} ${788 + (k === 1 ? 14 : 0)},${y}`} stroke="#4a4a52" strokeWidth={22} fill="none" />
				))}
				<ellipse cx={540} cy={1200} rx={244} ry={60} fill="#6a4228" />
				<ChipPile x={540} y={1224} w={420} n={20} r={34} wet={wet} seed={5} />
				<rect x={430} y={1380} width={220} height={80} rx={10} fill="#f2e6c8" stroke="#6a4a2a" strokeWidth={6} />
				<text x={540} y={1436} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={40} fill="#3a2414">
					CHIPS
				</text>
				{wet > 0 &&
					Array.from({length: 14}).map((_, k) => {
						const t = (f * 1.4 + k * 11) % 50;
						return <path key={k} d={`M ${330 + ((k * 61) % 420)},${700 + t * 9} q 8,14 0,22 q -8,-8 0,-22 Z`} fill="#8ec8f0" opacity={wet * (1 - t / 50)} />;
					})}
			</Stage>
			<Old a={0.12} />
			{wet > 0.3 && <Cap text="ОТСЫРЕЛИ" x={540} y={460} size={64} bg="#3a6aa8" rot={-4} p={pop(f, w(n, 'отсыревали') + 2, 10)} />}
		</AbsoluteFill>
	);
};

// ============================================================ 13. «В 1926-м американка Лора Скаддер придумала пакет: вощёную бумагу запечатывали утюгом.» =====
const Iron: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<path d="M -70,0 L 60,0 Q 80,-10 70,-40 L -40,-40 Q -70,-30 -70,0 Z" fill="#3a3a42" />
		<path d="M -36,-40 Q -30,-84 0,-84 L 30,-84 Q 46,-84 40,-40" stroke="#2a2a30" strokeWidth={14} fill="none" />
		<rect x={-60} y={-6} width={120} height={8} fill="#8a8a96" />
	</g>
);
const WaxBag: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-60} y={-80} width={120} height={160} rx={6} fill="#f4ecd8" stroke="#d8c8a0" strokeWidth={4} />
		<rect x={-60} y={-80} width={120} height={18} fill="#e8dcc0" />
		<path d="M -60,-62 L 60,-62" stroke="#c8b48a" strokeWidth={3} strokeDasharray="8 6" />
		<circle cx={0} cy={10} r={36} fill="#ffd34a" opacity={0.85} />
		<Chip x={0} y={10} r={22} />
	</g>
);
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const n = 13;
	const k = 0.9;
	const ironA = Math.sin(f / 7) * 70;
	const ironB = Math.sin(f / 7 + 1.6) * 70;
	const stack = Math.min(7, Math.floor(f / 26) + 2);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.08), cx: 540, cy: 1050}} bg="#3a2c20">
				<rect x={-300} y={-300} width={1700} height={1500} fill="#e8dcc4" />
				<rect x={-300} y={760} width={1700} height={440} fill="#c8b898" />
				<rect x={120} y={260} width={300} height={360} fill="#f6f0e0" stroke="#9a8a6a" strokeWidth={10} />
				<rect x={660} y={260} width={300} height={360} fill="#f6f0e0" stroke="#9a8a6a" strokeWidth={10} />
				<Person kind="mom" id="c1s13a" x={300} y={1250 + 400 * k} scale={k} colors={LAURA} hem={0.5} hideLegs breathe={f} face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0, 0.8], blush: true}} armR={{target: [70 + ironA / k, -400 - 30], bend: 1}} armL={{target: [-80, -440], bend: -1}} />
				<Person kind="mom" id="c1s13b" x={780} y={1250 + 400 * k} scale={k} colors={WORKER} hem={0.5} hideLegs apron="#f4efe6" hat={{type: 'scarf', color: '#d8c8a8'}} breathe={f + 9} face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0, 0.8], blush: true}} armR={{target: [70 + ironB / k, -400 - 30], bend: 1}} armL={{target: [-80, -440], bend: -1}} />
				{/* the long table with wax paper, the irons, the stack of sealed bags */}
				<rect x={-300} y={1250} width={1700} height={1000} fill="#8a5a36" />
				<rect x={-300} y={1236} width={1700} height={22} fill="#a8724a" />
				<rect x={200} y={1170} width={260} height={74} fill="#f4ecd8" opacity={0.9} />
				<rect x={680} y={1170} width={260} height={74} fill="#f4ecd8" opacity={0.9} />
				<Iron x={300 + 70 + ironA} y={1214} />
				<Iron x={780 + 70 + ironB} y={1214} />
				{[0, 1].map((j) => (
					<g key={j} opacity={0.7}>
						{[0, 1, 2].map((q) => {
							const t = (f * 1.3 + q * 12 + j * 7) % 36;
							return <circle key={q} cx={(j ? 850 : 370) + (j ? ironB : ironA) + (q - 1) * 16} cy={1150 - t * 3} r={12 + t * 0.5} fill="#fff" opacity={1 - t / 36} />;
						})}
					</g>
				))}
				{Array.from({length: stack}).map((_, q) => (
					<WaxBag key={q} x={540} y={1180 - q * 26} s={0.6} />
				))}
			</Stage>
			<Old a={0.12} />
			<YearTitle f={f} year={1926} sub="США · КАЛИФОРНИЯ" at={4} hold={80} />
			<Point f={f} at={w(n, 'лора') - 4} x={300} y={720} tx={300} ty={520} text="ЛОРА СКАДДЕР" />
			<Cap text="ЗАПЕЧАТАНО УТЮГОМ" x={540} y={1560} size={44} p={pop(f, w(n, 'утюгом') - 4, 12)} />
		</AbsoluteFill>
	);
};

// ============================================================ 14. «А в 1954-м ирландец Джо Мёрфи по прозвищу «Картошка» выпустил чипсы со вкусом — сыр и лук.» =====
const Bowl: React.FC<{x: number; y: number; color: string; label: string; s?: number}> = ({x, y, color, label, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -110,-20 Q -100,80 0,90 Q 100,80 110,-20 Z" fill="#f4f2ee" stroke="#c8c4ba" strokeWidth={5} />
		<ellipse cx={0} cy={-20} rx={110} ry={26} fill={color} />
		<text x={0} y={56} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={INK}>
			{label}
		</text>
	</g>
);
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const n = 14;
	const k = 0.92;
	const shake = Math.sin(f / 2.2) * 26;
	const cheese = w(n, 'сыр') - 4;
	const onion = w(n, 'лук') - 4;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.08), cx: 540, cy: 1040}} bg="#2a3020">
				<rect x={-300} y={-300} width={1700} height={1600} fill="#e8e0c8" />
				<rect x={300} y={240} width={480} height={420} fill="#f6f0e0" stroke="#7a6a4a" strokeWidth={14} />
				<rect x={318} y={258} width={444} height={384} fill="#9cc8e0" />
				<path d="M 318,560 Q 420,470 540,540 Q 660,460 762,540 L 762,642 L 318,642 Z" fill="#5aa04a" />
				<path d="M 318,600 Q 460,540 600,600 Q 700,560 762,590 L 762,642 L 318,642 Z" fill="#4a8a3a" />
				<line x1={540} y1={258} x2={540} y2={642} stroke="#f6f0e0" strokeWidth={10} />
				<Person
					kind="dad"
					id="c1s14j"
					x={540}
					y={1260 + 470 * k}
					scale={k}
					colors={JOE}
					plain
					kneePatch={false}
					hideLegs
					cap="#6a5a48"
					breathe={f}
					face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [0.3, 0.6], blush: true}}
					armR={{target: [150, -470 - 140 + shake * 0.3], bend: 1}}
					armL={{target: [-120, -470 - 20], bend: -1}}
				/>
				{/* the shaker in his hand */}
				<g transform={`translate(${540 + 150 * k + 6},${1260 - 140 * k - 46 + shake * 0.3}) rotate(160)`}>
					<rect x={-26} y={-50} width={52} height={90} rx={12} fill="#f4f2ee" stroke="#c8c4ba" strokeWidth={4} />
					<rect x={-30} y={-66} width={60} height={22} rx={8} fill="#b8b4aa" />
				</g>
				{Array.from({length: 24}).map((_, q) => {
					const t = (f * 1.5 + q * 3.1) % 20;
					return <circle key={q} cx={690 + ((q * 29) % 70) - 35} cy={1130 + t * 6} r={4} fill={f > onion ? '#9ac86a' : '#f2c84a'} opacity={1 - t / 20} />;
				})}
				<rect x={-300} y={1250} width={1700} height={1000} fill="#6a4a30" />
				<rect x={-300} y={1236} width={1700} height={22} fill="#8a6a48" />
				<path d="M 560,1190 Q 570,1290 700,1300 Q 830,1290 840,1190 Z" fill="#f4f2ee" stroke="#c8c4ba" strokeWidth={5} />
				<ChipPile x={700} y={1200} w={240} n={10} r={26} seed={9} />
				{f >= cheese && <Bowl x={210} y={1220} color="#f2c84a" label="СЫР" s={pop(f, cheese, 11)} />}
				{f >= onion && <Bowl x={420} y={1250} color="#9ac86a" label="ЛУК" s={0.9 * pop(f, onion, 11)} />}
			</Stage>
			<YearTitle f={f} year={1954} sub="ИРЛАНДИЯ" at={4} hold={80} color="#9ac86a" />
			<Point f={f} at={w(n, 'джо') - 4} x={540} y={640} tx={540} ty={430} text="ДЖО «КАРТОШКА» МЁРФИ" color="#9ac86a" />
		</AbsoluteFill>
	);
};

// ============================================================ 15. «До этого соль клали в пачку отдельным пакетиком.» =====
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const n = 15;
	const out = lerp(f, 8, 34, 0, 1, E);
	const pour = f > 46;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.06), cx: 540, cy: 980}} bg="#2a3020">
				<rect x={-300} y={-300} width={1700} height={2600} fill="#d8cfb8" />
				<rect x={-300} y={1300} width={1700} height={1200} fill="#8a6a48" />
				{/* an old plain bag of crisps */}
				<g transform="translate(400,1100)">
					<rect x={-190} y={-280} width={380} height={520} rx={14} fill="#f4f2ee" stroke="#c8c4ba" strokeWidth={6} />
					<rect x={-190} y={-200} width={380} height={140} fill="#3a6aa8" />
					<text x={0} y={-112} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#fff">
						ЧИПСЫ
					</text>
					<ChipPile x={0} y={170} w={300} n={10} r={34} seed={11} />
					<ellipse cx={0} cy={-280} rx={180} ry={26} fill="#5a4a3a" />
				</g>
				{/* the blue salt twist comes out of the bag */}
				<g transform={`translate(${lerp(out, 0, 1, 420, 760)},${lerp(out, 0, 1, 920, 620)}) rotate(${lerp(out, 0, 1, 0, pour ? 140 : 30)})`}>
					<path d="M -40,-60 L 40,-60 L 30,40 Q 0,70 -30,40 Z" fill="#2f6ad8" />
					<path d="M -14,40 L -24,90 L 0,70 L 24,90 L 14,40 Z" fill="#2f6ad8" />
					<path d="M -40,-60 L 40,-60" stroke="#fff" strokeWidth={6} opacity={0.5} />
				</g>
				{pour &&
					Array.from({length: 26}).map((_, q) => {
						const t = (f * 1.4 + q * 2.3) % 24;
						return <circle key={q} cx={720 + ((q * 23) % 50) - 25 - t * 4} cy={660 + t * 16} r={4} fill="#fff" opacity={1 - t / 24} />;
					})}
			</Stage>
			<Old a={0.08} />
			<Cap text="СОЛЬ — ОТДЕЛЬНО" x={540} y={420} size={56} bg="#2f6ad8" rot={-3} p={pop(f, 14, 12)} />
		</AbsoluteFill>
	);
};

// ============================================================ 16. «В СССР в 1963-м появился хрустящий картофель «Московский». Картошка, масло, соль.» =====
const SovietPack: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-120} y={-170} width={240} height={340} rx={10} fill="#f6f2e6" stroke="#c8c0a8" strokeWidth={6} />
		<rect x={-120} y={-170} width={240} height={70} fill="#c8302a" />
		<text x={0} y={-124} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#fff">
			ХРУСТЯЩИЙ
		</text>
		<text x={0} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#2a4a8a">
			КАРТОФЕЛЬ
		</text>
		<Potato x={0} y={30} r={62} rot={-10} />
		<text x={0} y={140} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={30} fill="#c8302a">
			«Московский»
		</text>
	</g>
);
const OilBottle: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -14,-120 L 14,-120 L 14,-80 Q 50,-60 50,-10 L 50,90 Q 50,110 30,110 L -30,110 Q -50,110 -50,90 L -50,-10 Q -50,-60 -14,-80 Z" fill="#f2c84a" opacity={0.92} stroke="#c8962a" strokeWidth={5} />
		<rect x={-18} y={-140} width={36} height={24} rx={6} fill="#c8302a" />
		<rect x={-40} y={0} width={80} height={56} rx={8} fill="#fff" opacity={0.8} />
	</g>
);
const SaltShaker: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -40,-60 Q -40,-100 0,-100 Q 40,-100 40,-60 L 50,90 Q 50,110 30,110 L -30,110 Q -50,110 -50,90 Z" fill="#f4f2ee" stroke="#9a968c" strokeWidth={5} />
		{[-14, 0, 14].map((k) => (
			<circle key={k} cx={k} cy={-82} r={4} fill="#5a5a62" />
		))}
		<text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			СОЛЬ
		</text>
	</g>
);
export {OilBottle, SaltShaker, SovietPack, Bowl, Fries};
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const n = 16;
	const k = 0.9;
	const words: [string, number][] = [
		['картошка', 0],
		['масло', 1],
		['соль', 2],
	];
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.06), cx: 540, cy: 1040}} bg="#22283a">
				<rect x={-300} y={-300} width={1700} height={1600} fill="#cfd8d0" />
				{[300, 520].map((y, r) => (
					<g key={r}>
						<rect x={-300} y={y} width={1700} height={18} fill="#8a7a5a" />
						{Array.from({length: 10}).map((_, c) => (
							<rect key={c} x={-220 + c * 140} y={y - 110} width={80} height={110} rx={8} fill={['#e8d8b0', '#c8b48a', '#b8c8a8'][(c + r) % 3]} />
						))}
					</g>
				))}
				<Person kind="mom" id="c1s16s" x={760} y={1150 + 400 * k} scale={k} colors={SOVIET} hem={0.5} hideLegs hat={{type: 'scarf', color: '#ffffff'}} breathe={f} face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [-0.6, 0.2], blush: true}} armL={{target: [-150, -420], bend: -1}} />
				{/* the counter with a glass top */}
				<rect x={-300} y={1150} width={1700} height={900} fill="#7a5a3a" />
				<rect x={-300} y={1130} width={1700} height={30} fill="#9a7a5a" />
				<rect x={-200} y={1170} width={1400} height={180} fill="#a8c8d0" opacity={0.5} />
				{[[-40, 0], [120, 0], [60, -40]].map(([dx, dy], q) => (
					<SovietPack key={q} x={400 + dx} y={1000 + dy} s={0.72} rot={(q - 1) * 6} />
				))}
				<SovietPack x={420} y={940} s={0.95} />
			</Stage>
			<YearTitle f={f} year={1963} sub="СССР" at={4} hold={80} color="#ff6b5e" />
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{words.map(([wd, i]) => {
					const at = w(n, wd) - 4;
					if (f < at) return null;
					const p = pop(f, at, 11);
					const x = 220 + i * 320;
					return (
						<g key={wd} transform={`translate(${x},1560) scale(${p})`}>
							<circle r={120} fill="#fff" stroke="#1d1d24" strokeWidth={8} />
							{i === 0 ? <Potato x={0} y={0} r={70} /> : i === 1 ? <OilBottle x={0} y={4} s={0.8} /> : <SaltShaker x={0} y={4} s={0.8} />}
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

// ============================================================ 17. «А в 90-е — яркие пачки и новые вкусы: бекон, сметана с луком… и краб.» =====
const BrightBag: React.FC<{x: number; y: number; c: string; s?: number; rot?: number}> = ({x, y, c, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M -60,-80 Q 0,-92 60,-80 L 66,80 Q 0,92 -66,80 Z" fill={c} />
		<circle cx={0} cy={0} r={34} fill="#ffd34a" />
		<Chip x={0} y={0} r={20} />
		<rect x={-46} y={44} width={92} height={18} rx={6} fill="#fff" opacity={0.7} />
	</g>
);
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const n = 17;
	const flavors: [string, string, number, string][] = [
		['бекон', 'БЕКОН', 0, '#c8503a'],
		['сметана', 'СМЕТАНА И ЛУК', 1, '#4a9a5a'],
		['краб', 'КРАБ', 2, '#e0342b'],
	];
	const neon = 0.75 + 0.25 * Math.sin(f / 3);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, len(n), 1.0, 1.08), cx: 540, cy: 980}} bg="#0e1226">
				<rect x={-300} y={-300} width={1700} height={1600} fill="#1a1f3a" />
				<rect x={-300} y={1300} width={1700} height={1000} fill="#2a2a32" />
				<ellipse cx={540} cy={1340} rx={600} ry={70} fill="#4a6ad8" opacity={0.25} />
				{/* the kiosk */}
				<rect x={130} y={420} width={820} height={900} rx={18} fill="#e8eef4" />
				<rect x={130} y={420} width={820} height={120} rx={18} fill="#2f6ad8" />
				<text x={540} y={505} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#fff">
					КИОСК 24
				</text>
				<rect x={190} y={580} width={700} height={560} fill="#ffe9a8" opacity={0.95} />
				{Array.from({length: 4}).map((_, r) =>
					Array.from({length: 5}).map((_, c) => (
						<BrightBag key={`${r}${c}`} x={262 + c * 140} y={660 + r * 140} c={['#e0342b', '#2f6ad8', '#4a9a5a', '#f08a2a', '#8a4ac8'][(c + r * 2) % 5]} s={0.78} rot={((c + r) % 3 - 1) * 5} />
					)),
				)}
				<rect x={190} y={1140} width={700} height={30} fill="#9aa4b4" />
				<rect x={430} y={1170} width={220} height={150} fill="#c8d0dc" />
				<rect x={470} y={1190} width={140} height={90} fill="#3a3a48" />
				<circle cx={900} cy={380} r={46} fill="#ff4a8a" opacity={neon} />
				<circle cx={900} cy={380} r={110} fill="#ff4a8a" opacity={0.18 * neon} />
			</Stage>
			<YearTitle f={f} year={90} sub="РОССИЯ" at={4} hold={60} color="#ff4a8a" />
			{flavors.map(([wd, text, i, c]) => {
				const at = w(n, wd) - 4;
				return <Cap key={wd} text={text} x={i === 1 ? 540 : i === 0 ? 260 : 820} y={1500 + (i === 1 ? 110 : 0)} size={50} bg={c} rot={(i - 1) * 5} p={f >= at ? pop(f, at, 11) : 0} />;
			})}
		</AbsoluteFill>
	);
};
export const _H = {lvl, Easing};
