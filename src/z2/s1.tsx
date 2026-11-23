// «Каково это — умереть от жажды» — shots 1–3, 6–11, 15: the noon desert, the empty flask, the Sahara, the race, the
// backpack and the water at the checkpoints, the sky turning orange, the storm, lost, the first hours.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {BONE, BONE_D, BONE_SH} from '../components/Choby';
import {arm, armTo, Blowing, camAt, Chip, Dunes, Flask, HEAVY, HeatGrade, Layer, Marker, mixPal, NOON, Plaque, RED, rnd, Rock, RUNNER, Shimmer, Sky, Stage16, STORM, StormHaze, SunDisk, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;

// a thermometer stuck in the sand (local: the tip in the sand at 0)
const Stake: React.FC<{v: number; s?: number}> = ({v, s = 1}) => {
	const t = Math.max(0, Math.min(1, v / 70));
	return (
		<g transform={`scale(${s})`}>
			<rect x={-20} y={-330} width={40} height={300} rx={20} fill="#eef4fa" stroke="#1d1d24" strokeWidth={6} />
			<rect x={-9} y={-30 - 280 * t} width={18} height={280 * t} rx={9} fill="#e0463a" />
			<circle cx={0} cy={-22} r={32} fill="#e0463a" stroke="#1d1d24" strokeWidth={6} />
			{[0.25, 0.5, 0.75].map((q) => (
				<line key={q} x1={20} y1={-30 - 280 * q} x2={38} y2={-30 - 280 * q} stroke="#1d1d24" strokeWidth={5} />
			))}
		</g>
	);
};

// ============================================================ 1. «Песок — шестьдесят градусов…» =====
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const n = 1;
	const cam = camAt(f, 0, len(n), {s: 1.02, cx: 960, cy: 560}, {s: 1.1, cx: 980, cy: 520});
	const sand = w(n, 'песок') - 2;
	const air = w(n, 'воздух') - 4;
	const shade = w(n, 'только') - 4;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j1" p={NOON} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1330} y={170} r={74} />
				</Layer>
				<Dunes p={NOON} cam={cam} />
				<Shimmer f={f} y={640} />
				<Layer cam={cam}>
					<g transform={`translate(620,${lerp(f, sand, sand + 12, 1180, 900)})`}>
						<Stake v={lerp(f, sand, sand + 24, 25, 60)} s={1.1} />
					</g>
					<g transform={`translate(1350,${lerp(f, air, air + 12, 1180, 880)})`}>
						<Stake v={lerp(f, air, air + 24, 25, 45)} s={0.9} />
					</g>
				</Layer>
			</Stage16>
			<Chip f={f} at={sand + 8} x={620} y={500} text="ПЕСОК 60°" color={RED} size={58} />
			<Chip f={f} at={air + 8} x={1350} y={540} text="ВОЗДУХ 45°" color="#f08a2a" size={52} />
			<Plaque f={f} at={shade} x={960} y={200} text="ТЕНИ НЕТ" color={YEL} size={60} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 2. «Во фляге — ни капли…» =====
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const n = 2;
	const around = w(n, 'вокруг') - 4;
	const out = interpolate(f, [around, around + 16], [0, 1], clamp);
	const cam = camAt(f, around, len(n), {s: 1.25, cx: 960, cy: 560}, {s: 1, cx: 960, cy: 540});
	const shake = f < around ? Math.sin(f / 2.2) * 10 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j2" p={NOON} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={420} y={190} r={64} />
				</Layer>
				<Dunes p={NOON} cam={cam} />
				<Shimmer f={f} y={640} />
				{/* the flask upside down over the sand: not a drop */}
				<g transform={`translate(${960 - out * 1300},${520 + shake}) rotate(${172 + shake * 0.4}) translate(0,-150)`}>
					<Flask level={0} s={2.6} id="j2f" />
				</g>
				<g transform={`translate(${960 - out * 1300},${520 + shake}) rotate(${-8 + shake * 0.4})`}>
					{/* Гога's bony forearm and fist */}
					<line x1={110} y1={120} x2={700} y2={700} stroke={BONE_D} strokeWidth={112} strokeLinecap="round" />
					<line x1={110} y1={120} x2={700} y2={700} stroke={BONE} strokeWidth={92} strokeLinecap="round" />
					<line x1={140} y1={112} x2={720} y2={680} stroke={BONE_SH} strokeWidth={34} strokeLinecap="round" />
					<circle cx={104} cy={112} r={70} fill={BONE} stroke={BONE_D} strokeWidth={10} />
					<rect x={-100} y={-12} width={200} height={156} rx={66} fill={BONE} stroke={BONE_D} strokeWidth={10} />
					<path d="M 0,-12 L 34,-12 C 70,-12 100,18 100,60 L 100,80 C 100,116 70,144 34,144 L 0,144 Z" fill={BONE_SH} opacity={0.8} />
					{[-56, 0, 56].map((x) => (
						<circle key={x} cx={x} cy={-6} r={30} fill={BONE} stroke={BONE_D} strokeWidth={8} />
					))}
					{[-28, 28].map((x) => (
						<line key={x} x1={x} y1={26} x2={x} y2={74} stroke={BONE_D} strokeWidth={8} strokeLinecap="round" />
					))}
				</g>
			</Stage16>
			<Plaque f={f} at={4} to={around} x={960} y={200} text="НИ КАПЛИ" color={RED} size={64} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 3. «Это Сахара… совсем один» =====
// from high above: rows of dunes, the name and the size; a tiny you in the middle
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const n = 3;
	const you = w(n, 'ты') - 4;
	const zoom = interpolate(f, [you, you + 40], [1, 1.9], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	return (
		<AbsoluteFill style={{background: '#e9be7c'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(960,560) scale(${zoom}) translate(-960,-560)`}>
					<rect x={-200} y={-200} width={2400} height={1500} fill="#e9be7c" />
					{Array.from({length: 22}).map((_, i) => {
						const y0 = -120 + i * 64;
						let d = '';
						for (let x = -200; x <= 2200; x += 60) d += `${x === -200 ? 'M' : 'L'} ${x},${(y0 + Math.sin(x / 140 + i * 0.9) * 22 + Math.sin(x / 47 + i) * 6).toFixed(1)} `;
						return (
							<g key={i}>
								<path d={d} stroke="#c9934e" strokeWidth={14} fill="none" opacity={0.55} />
								<path d={d} stroke="#f6dcae" strokeWidth={5} fill="none" opacity={0.7} transform="translate(0,-9)" />
							</g>
						);
					})}
					{/* you: a tiny dot with radar rings */}
					{f >= you &&
						[0, 1, 2].map((k) => {
							const t = ((f - you + k * 14) % 42) / 42;
							return <circle key={k} cx={960} cy={560} r={8 + t * 70} fill="none" stroke={RED} strokeWidth={4} opacity={1 - t} />;
						})}
					{f >= you && <circle cx={960} cy={560} r={9 * pop(f, you, 10)} fill={RED} stroke="#fff" strokeWidth={3} />}
				</g>
			</svg>
			<div style={{position: 'absolute', left: 960, top: 300, transform: `translate(-50%,-50%) scale(${pop(f, 3, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 130, color: '#fff', letterSpacing: 8, textShadow: '0 8px 0 rgba(0,0,0,0.25), 5px 5px 0 #6a3e14, -5px 5px 0 #6a3e14, 5px -5px 0 #6a3e14, -5px -5px 0 #6a3e14', opacity: interpolate(f, [you, you + 14], [1, 0], clamp)}}>САХАРА</div>
			<Chip f={f} at={w(n, 'самая') - 4} x={960} y={430} text="≈ 9 МЛН КМ²" color="#a8561e" size={46} />
			{f >= you + 6 && (
				<div style={{position: 'absolute', left: 1000, top: 520, transform: `scale(${pop(f, you + 6, 11)})`, transformOrigin: 'left center', background: RED, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, padding: '6px 18px 8px', borderRadius: 12}}>ТЫ</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 6. «Ты бежишь «Марафон песков»…» =====
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const n = 6;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 900, cy: 540}, {s: 1.06, cx: 1060, cy: 540});
	const COLS = ['#2f86e0', '#3aa86a', '#e8352e', '#8a5ad8', '#f2c230', '#f08a2a', '#2abfbf'];
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j6" p={NOON} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1500} y={190} r={60} />
				</Layer>
				<Dunes p={NOON} cam={cam} only={[0, 1]} />
				<Layer cam={cam}>
					{/* a line of runners along a dune crest */}
					{COLS.map((c, i) => {
						const x = ((i * 290 + f * 3.2) % 2030) - 60;
						const y = 860 - Math.sin(x / 520) * 40;
						const me = i === 5;
						return (
							<g key={i}>
								{me && <circle cx={x} cy={y - 318} r={16} fill={RED} stroke="#fff" strokeWidth={4} />}
								{me ? (
									<You x={x} y={y} s={0.37} f={f} walk={f * 0.34 + i} pack face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0.6, 0]}} />
								) : (
								<Person kind="dad" id={`j6r${i}`} x={x} y={y} scale={0.27} colors={{top: c, topDark: c, pants: '#2b2d33', shoes: '#e8e6e0', hair: '#3a2a20', skin: i % 3 ? '#e8b48e' : '#c98a60'}} cap="#f4efe4" backpack plain kneePatch={false} walk={f * 0.34 + i} breathe={f} headTurn={0.6} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false}} />
								)}
							</g>
						);
					})}
					{[260, 1100, 1900].map((x, i) => (
						<Marker key={i} x={x} y={905 - Math.sin(x / 520) * 40} s={0.8} color={i % 2 ? YEL : RED} />
					))}
				</Layer>
				<Dunes p={NOON} cam={cam} only={[2]} />
			</Stage16>
			<Chip f={f} at={4} x={960} y={170} text="МАРОККО · АПРЕЛЬ" color="#a8561e" size={44} />
			<Plaque f={f} at={w(n, 'марафон') - 4} x={960} y={290} text="«МАРАФОН ПЕСКОВ»" color={YEL} size={60} />
			<Chip f={f} at={w(n, 'двухсот') - 4} x={780} y={410} text="200+ КМ" color={RED} size={46} />
			<Chip f={f} at={w(n, 'неделю') - 4} x={1140} y={410} text="7 ДНЕЙ" color="#2f86e0" size={46} />
			<HeatGrade k={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 7. the backpack; the water at the checkpoints =====
const FoodPack: React.FC<{c: string}> = ({c}) => (
	<g>
		<rect x={-50} y={-34} width={100} height={68} rx={10} fill={c} stroke="#1d1d24" strokeWidth={5} />
		<rect x={-30} y={-12} width={60} height={24} rx={5} fill="#fff" opacity={0.8} />
	</g>
);
const SleepingBag: React.FC = () => (
	<g>
		<rect x={-80} y={-40} width={160} height={80} rx={40} fill="#3a6ad8" stroke="#1d1d24" strokeWidth={5} />
		{[-40, 0, 40].map((x) => (
			<line key={x} x1={x} y1={-38} x2={x} y2={38} stroke="#1d1d24" strokeWidth={4} opacity={0.5} />
		))}
	</g>
);
const Bottle: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<rect x={-22} y={-110} width={44} height={110} rx={12} fill="#bfe4ff" stroke="#2a6aa8" strokeWidth={4} />
		<rect x={-12} y={-128} width={24} height={20} rx={4} fill="#2f86e0" />
		<rect x={-22} y={-70} width={44} height={26} fill="#2f86e0" opacity={0.6} />
	</g>
);
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const n = 7;
	const food = w(n, 'еду') - 2;
	const bag = w(n, 'спальник') - 2;
	const water = w(n, 'воду') - 6;
	const slide = interpolate(f, [water, water + 18], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j7" p={NOON} />
				<Dunes p={NOON} />
				<g transform={`translate(${-slide * 1500},0)`}>
					{/* Гога from behind: the backpack, its things popping out */}
					<You x={760} y={1330} s={1.3} f={f} back pack />
					{f >= food && (
						<g transform={`translate(520,720) scale(${pop(f, food, 10)})`}>
							<FoodPack c="#e8352e" />
						</g>
					)}
					{f >= food + 5 && (
						<g transform={`translate(430,810) rotate(-10) scale(${pop(f, food + 5, 10)})`}>
							<FoodPack c="#3aa86a" />
						</g>
					)}
					{f >= bag && (
						<g transform={`translate(1030,700) rotate(8) scale(${pop(f, bag, 10)})`}>
							<SleepingBag />
						</g>
					)}
				</g>
				{/* the checkpoint: a tent, a table with bottles */}
				<g transform={`translate(${1960 - slide * 900},0)`}>
					<path d="M 0,900 L 260,560 L 520,900 Z" fill="#f4f0e6" stroke="#1d1d24" strokeWidth={6} strokeLinejoin="round" />
					<path d="M 260,560 L 300,900 L 220,900 Z" fill="#d8d0c0" />
					<rect x={240} y={500} width={8} height={70} fill="#3a3a40" />
					<path d="M 248,502 L 300,518 L 248,534 Z" fill={RED} />
					<rect x={40} y={860} width={460} height={20} rx={6} fill="#a8743a" stroke="#1d1d24" strokeWidth={5} />
					{[0, 1, 2, 3, 4].map((i) => (
						<g key={i} transform={`translate(${90 + i * 90},860)`}>
							<Bottle s={0.9} />
						</g>
					))}
				</g>
			</Stage16>
			<Chip f={f} at={food + 4} x={470} y={610} text="ЕДА" color="#e8352e" size={44} to={water} />
			<Chip f={f} at={bag + 4} x={1060} y={590} text="СПАЛЬНИК" color="#3a6ad8" size={44} to={water} />
			<Plaque f={f} at={water + 10} x={1200} y={230} text="ВОДА — СТРОГО ПО ЛИТРАМ" color="#5fb0f0" size={48} />
			<HeatGrade k={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 8. the sky turns orange; the storm rises =====
const DustWall: React.FC<{k: number; f: number}> = ({k, f}) => {
	if (k <= 0) return null;
	const top = 650 - k * 400;
	return (
		<g opacity={Math.min(1, k * 3)}>
			<rect x={-400} y={top + 70} width={2800} height={1200} fill="#8e4c22" />
			{Array.from({length: 30}).map((_, i) => {
				const x = -300 + i * 92 + Math.sin(i * 2.1) * 30;
				const r = 80 + rnd(i) * 100;
				return <circle key={i} cx={x} cy={top + 70 + Math.sin(i * 1.3 + f / 25) * 12} r={r} fill={i % 2 ? '#b2662e' : '#a35a28'} />;
			})}
			{Array.from({length: 30}).map((_, i) => {
				const x = -250 + i * 92;
				return <circle key={`h${i}`} cx={x} cy={top + 30 + rnd(i + 40) * 40} r={40 + rnd(i + 9) * 50} fill="#c98a4c" opacity={0.6} />;
			})}
		</g>
	);
};
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const n = 8;
	const sky = w(n, 'небо') - 6;
	const storm = w(n, 'поднимается') - 6;
	const t = interpolate(f, [sky, sky + 40], [0, 1], clamp);
	const p = mixPal(NOON, STORM, t);
	const wall = interpolate(f, [storm, len(n)], [0, 1], clamp);
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.05, cx: 960, cy: 520});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j8" p={p} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1400} y={200} r={60} glow={1 - t * 0.7} color={t > 0.5 ? '#ffe2b0' : '#fff6d8'} />
				</Layer>
				{/* the wall of dust rising on the horizon: a lumpy top, a dark body */}
				<Layer cam={cam} d={0.4}>
					<DustWall k={wall} f={f} />
				</Layer>
				<Dunes p={p} cam={cam} />
				<Layer cam={cam}>
					{[0, 2].map((i) => (
						<Person key={i} kind="dad" id={`j8r${i}`} x={700 + i * 260} y={980} scale={0.32} colors={{...RUNNER, top: ['#2f86e0', RUNNER.top, '#3aa86a'][i], topDark: ['#2f86e0', RUNNER.topDark, '#3aa86a'][i]}} cap="#f4efe4" backpack plain kneePatch={false} back breathe={f} />
					))}
					<You x={960} y={980} s={0.44} f={f} back pack />
				</Layer>
				<Blowing f={f} k={wall * 0.8} n={60} />
			</Stage16>
			<Plaque f={f} at={storm + 4} x={960} y={200} text="ПЕСЧАНАЯ БУРЯ" color="#f08a2a" size={60} />
			<HeatGrade k={0.3} />
		</AbsoluteFill>
	);
};

// ============================================================ 9. inside the storm; down behind a rock =====
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const n = 9;
	const legs = w(n, 'ног') - 6;
	const down = w(n, 'лечь') - 6;
	const lie = interpolate(f, [down, down + 16], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const fog = interpolate(f, [legs, legs + 20], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#c8742e">
				<Sky id="j9" p={STORM} />
				<Dunes p={STORM} />
				<Rock x={1130} y={1030} s={2.2} color="#7a5032" />
				<You
					x={880}
					y={1150 + lie * 190}
					s={1}
					f={f}
					tilt={-4 + lie * 14}
					pack
					face={{eyes: 'closed', brows: 'worried', mouth: 'tight'}}
					armL={armTo(-1, f, down, arm([-128, -470], [-40, -572], {fist: true, front: true}), arm([-150, -560], [-60, -690], {fist: true, front: true}), 16)}
					armR={armTo(1, f, down, 'down', arm([150, -560], [60, -690], {fist: true, front: true}), 16)}
				/>
				<Rock x={1070} y={1080} s={2.0} color="#8a5c3a" />
			</Stage16>
			<StormHaze f={f} k={0.62 - lie * 0.12} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(200,116,46,0) 45%, rgba(200,116,46,0.95) 75%)', opacity: fog * (1 - lie)}} />
			<Plaque f={f} at={w(n, 'песок') - 2} x={960} y={190} text="ГЛАЗА · НОС · РОТ" color="#f08a2a" size={52} to={down - 6} />
			<Plaque f={f} at={down + 8} x={960} y={190} text="ЛЕЧЬ И ЖДАТЬ" color={YEL} size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 10. the storm dies down; nothing is left =====
const Icon: React.FC<{f: number; at: number; x: number; y: number; kind: 'flag' | 'steps' | 'people'}> = ({f, at, x, y, kind}) => {
	if (f < at) return null;
	const p = pop(f, at, 11);
	const cross = interpolate(f, [at + 5, at + 12], [0, 1], clamp);
	return (
		<g transform={`translate(${x},${y}) scale(${p})`}>
			<circle r={84} fill="#fff8ec" stroke="#1d1d24" strokeWidth={7} />
			{kind === 'flag' && (
				<g>
					<line x1={-18} y1={50} x2={-18} y2={-52} stroke="#3a3a40" strokeWidth={8} strokeLinecap="round" />
					<path d="M -14,-52 L 42,-34 L -14,-14 Z" fill={RED} />
				</g>
			)}
			{kind === 'steps' &&
				[
					[-24, 30, -12],
					[22, -6, 12],
					[-20, -40, -12],
				].map(([sx, sy, r], i) => <ellipse key={i} cx={sx} cy={sy} rx={13} ry={22} fill="#7a5032" transform={`rotate(${r} ${sx} ${sy})`} />)}
			{kind === 'people' &&
				[-26, 26].map((sx, i) => (
					<g key={i}>
						<circle cx={sx} cy={-28} r={16} fill="#3a3a40" />
						<path d={`M ${sx - 24},40 Q ${sx - 24},-6 ${sx},-6 Q ${sx + 24},-6 ${sx + 24},40 Z`} fill="#3a3a40" />
					</g>
				))}
			{cross > 0 && (
				<g stroke={RED} strokeWidth={13} strokeLinecap="round">
					<line x1={-56} y1={-56} x2={-56 + 112 * cross} y2={-56 + 112 * cross} />
					{cross > 0.5 && <line x1={56} y1={-56} x2={56 - 112 * (cross - 0.5) * 2} y2={-56 + 112 * (cross - 0.5) * 2} />}
				</g>
			)}
		</g>
	);
};
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const n = 10;
	const clear = interpolate(f, [0, w(n, 'ты') - 4], [0.8, 0], clamp);
	const up = w(n, 'поднимаешься') - 6;
	const rise = interpolate(f, [up, up + 16], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const p = mixPal(STORM, NOON, interpolate(f, [0, w(n, 'ты')], [0.2, 1], clamp));
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j10" p={p} />
				<SunDisk x={1500} y={200} r={60} glow={0.6} />
				<Dunes p={p} />
				<Rock x={700} y={1040} s={1.6} color="#8a5c3a" />
				<You x={520} y={1120 - rise * 80} s={0.84} f={f} pack face={{eyes: rise > 0.5 ? 'wide' : 'closed', brows: rise > 0.5 ? 'raised' : 'worried', mouth: rise > 0.5 ? 'o' : 'tight', look: [0.7, 0]}} />
			</Stage16>
			<StormHaze f={f} k={clear} />
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<Icon f={f} at={w(n, 'флажков') - 8} x={1080} y={420} kind="flag" />
				<Icon f={f} at={w(n, 'следов') - 8} x={1330} y={420} kind="steps" />
				<Icon f={f} at={w(n, 'людей') - 8} x={1580} y={420} kind="people" />
			</svg>
			<Chip f={f} at={2} x={960} y={150} text="ЧЕРЕЗ НЕСКОЛЬКО ЧАСОВ" color="#a8561e" size={40} />
			<HeatGrade k={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 11. lost; two gulps left =====
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const n = 11;
	const flask = w(n, 'во') - 4;
	const cam = camAt(f, 0, len(n), {s: 1.25, cx: 960, cy: 600}, {s: 1, cx: 960, cy: 540});
	const look = Math.sin(f / 12) * 0.8;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j11" p={NOON} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1500} y={190} r={62} />
				</Layer>
				<Dunes p={NOON} cam={cam} />
				<Shimmer f={f} y={640} />
				<Layer cam={cam}>
					<You
						x={960}
						y={1010}
						s={0.68}
						f={f}
						pack
						face={{eyes: 'wide', brows: 'worried', mouth: 'flat', look: [look, 0]}}
						armR={armTo(1, f, flask - 2, 'down', arm([150, -430], [190, -540], {fist: true, item: <Flask level={0.08} s={1.1} tilt={180 + Math.sin(f / 2.5) * 16} id="j11f" />}), 10)}
					/>
				</Layer>
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="ТЫ ПОТЕРЯЛСЯ" color={RED} size={60} to={flask - 4} />
			<Chip f={f} at={flask + 6} x={1300} y={420} text="2 ГЛОТКА" color="#2f86e0" size={50} />
			<HeatGrade k={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 15. the first hours: thirst =====
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const n = 15;
	const liter = w(n, 'литр') - 4;
	const thirst = w(n, 'жажда') - 6;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 900, cy: 540}, {s: 1.05, cx: 1020, cy: 540});
	const x = lerp(f, 0, len(n), 760, 1060);
	const drink = interpolate(f, [liter, liter + 40], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j15" p={NOON} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1300} y={150} r={68} />
				</Layer>
				<Dunes p={NOON} cam={cam} />
				<Shimmer f={f} y={640} />
				<Layer cam={cam}>
					<You
						x={x}
						y={1010}
						s={0.66}
						f={f}
						walk={f * 0.28}
						pack
						face={{eyes: f >= thirst ? 'narrow' : 'open', brows: f >= thirst ? 'worried' : 'neutral', mouth: f >= thirst ? 'open' : 'flat', look: [0.5, 0], sweat: 0.6}}
						armR={armTo(1, f, thirst - 2, 'down', arm([118, -352], [36, -424], {fist: true, front: true}), 10)}
					/>
				</Layer>
			</Stage16>
			{f >= liter && (
				<svg width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', left: 1420, top: 300}}>
					<g transform={`scale(${pop(f, liter, 11)})`}>
						<rect x={-50} y={-110} width={100} height={210} rx={24} fill="#eaf5ff" stroke="#2a6aa8" strokeWidth={6} />
						<rect x={-44} y={-104 + 198 * (1 - drink)} width={88} height={198 * drink} rx={18} fill="#5fb0f0" />
						<text x={0} y={140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#fff" stroke="#1d1d24" strokeWidth={6} paintOrder="stroke">
							1 Л
						</text>
					</g>
				</svg>
			)}
			<Plaque f={f} at={thirst + 4} x={760} y={220} text="ЖАЖДА" color={RED} size={70} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};
