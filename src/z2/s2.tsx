// «Каково это — умереть от жажды» — shots 20–34: the sweat (the air conditioner, six kettles, a litre an hour, the trap),
// the rule of threes, the evening of the first day, the dry mouth, the thick blood, the blackout, the brain, the night,
// the heat going up into the sky, night or day, the stars, the second day.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {arm, camAt, Chip, Dunes, Flask, HEAVY, HeatGrade, Layer, mix, mixPal, Moon, NIGHT, NOON, Plaque, RED, rnd, Rock, RUNNER, Shimmer, Sky, Stage16, SunDisk, SUNSET, YEL, DAWN, HOT, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const SKIN = RUNNER.skin;

// ------------------------------------------------------------------ little drawings -----
const Drop: React.FC<{x: number; y: number; r?: number; color?: string; o?: number}> = ({x, y, r = 14, color = '#7fc4ff', o = 1}) => (
	<path d={`M ${x},${y - r * 1.6} C ${x + r * 0.9},${y - r * 0.4} ${x + r},${y + r * 0.2} ${x},${y + r} C ${x - r},${y + r * 0.2} ${x - r * 0.9},${y - r * 0.4} ${x},${y - r * 1.6} Z`} fill={color} opacity={o} />
);
const Kettle: React.FC<{steam?: number; f?: number}> = ({steam = 0, f = 0}) => (
	<g>
		<path d="M -70,40 C -80,-30 -60,-70 0,-72 C 60,-70 80,-30 70,40 Z" fill="#f4f0ea" stroke="#1d1d24" strokeWidth={6} />
		<path d="M 64,-10 L 118,-46 L 124,-36 L 76,8 Z" fill="#f4f0ea" stroke="#1d1d24" strokeWidth={6} strokeLinejoin="round" />
		<path d="M -52,-58 C -52,-110 52,-110 52,-58" fill="none" stroke="#1d1d24" strokeWidth={10} strokeLinecap="round" />
		<rect x={-78} y={34} width={156} height={16} rx={6} fill="#e0463a" stroke="#1d1d24" strokeWidth={5} />
		<circle cx={0} cy={-76} r={10} fill="#1d1d24" />
		{steam > 0 &&
			[0, 1, 2].map((k) => {
				const t = ((f + k * 9) % 27) / 27;
				return <circle key={k} cx={130 + k * 6 + t * 30} cy={-60 - t * 70} r={12 + t * 16} fill="#ffffff" opacity={steam * (1 - t) * 0.9} />;
			})}
	</g>
);
const ClockFace: React.FC<{t: number; r?: number}> = ({t, r = 120}) => (
	<g>
		<circle r={r} fill="#fff8ec" stroke="#1d1d24" strokeWidth={10} />
		{Array.from({length: 12}).map((_, i) => (
			<line key={i} x1={0} y1={-r + 14} x2={0} y2={-r + 30} stroke="#1d1d24" strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30})`} />
		))}
		<path d={`M 0,0 L 0,${-r + 8} A ${r - 8},${r - 8} 0 ${t > 0.5 ? 1 : 0} 1 ${(Math.sin(t * Math.PI * 2) * (r - 8)).toFixed(1)},${(-Math.cos(t * Math.PI * 2) * (r - 8)).toFixed(1)} Z`} fill="#ffb04a" opacity={t > 0.001 ? 0.45 : 0} />
		<line x1={0} y1={0} x2={0} y2={-r + 26} stroke={RED} strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 360})`} />
		<circle r={10} fill="#1d1d24" />
	</g>
);
const HeartIcon: React.FC<{beat: number; s?: number}> = ({beat, s = 1}) => (
	<g transform={`scale(${s * (1 + 0.14 * beat)})`}>
		<path d="M 0,70 C -90,10 -100,-60 -50,-75 C -20,-84 0,-60 0,-40 C 0,-60 20,-84 50,-75 C 100,-60 90,10 0,70 Z" fill="#e0303a" stroke="#1d1d24" strokeWidth={7} strokeLinejoin="round" />
		<ellipse cx={-44} cy={-44} rx={17} ry={9} fill="#fff" opacity={0.7} transform="rotate(-30 -44 -44)" />
	</g>
);
export const BrainIcon: React.FC<{k?: number; color?: string}> = ({k = 1, color = '#f7a8b8'}) => (
	<g transform={`scale(${k})`}>
		<path d="M -95,10 C -110,-40 -70,-80 -30,-72 C -10,-100 40,-96 55,-70 C 95,-75 115,-30 100,5 C 115,40 80,75 45,62 C 25,85 -20,85 -35,62 C -75,75 -110,45 -95,10 Z" fill={color} stroke="#1d1d24" strokeWidth={7} strokeLinejoin="round" />
		<g stroke="#c96a82" strokeWidth={6} fill="none" strokeLinecap="round">
			<path d="M 0,-82 C -10,-40 15,-10 0,20 C -12,45 5,60 0,74" />
			<path d="M -70,-30 q 20,-12 34,4 M -76,20 q 22,-14 40,6 M 40,-40 q 20,-8 36,8 M 34,10 q 22,-10 44,6" />
		</g>
	</g>
);
// a dark card in the middle of the frame (for the rules)
const Card: React.FC<{f: number; at: number; x: number; y: number; big: string; unit: string; text: string; color: string; children?: React.ReactNode}> = ({f, at, x, y, big, unit, text, color, children}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f, at, 12)})`, width: 330, height: 430, background: 'rgba(16,12,10,0.92)', border: `8px solid ${color}`, borderRadius: 30, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>
			<div style={{height: 120, marginTop: 18}}>{children}</div>
			<div style={{fontSize: 120, lineHeight: 1, color}}>{big}</div>
			<div style={{fontSize: 40}}>{unit}</div>
			<div style={{fontSize: 28, marginTop: 8, color: '#d8c4a8'}}>{text}</div>
		</div>
	);

// ============================================================ 20. «Тебя спасает пот — это твой кондиционер» =====
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const n = 20;
	const sweat = w(n, 'пот') - 4;
	const ac = w(n, 'кондиционер') - 6;
	const sunY = lerp(f, 0, len(n), 300, 130);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j20" p={NOON} />
				<SunDisk x={1250} y={sunY} r={70} />
				<Dunes p={NOON} />
				<Shimmer f={f} y={640} />
				<You x={760} y={1250} s={1.25} f={f} pack face={{eyes: 'narrow', brows: 'worried', mouth: 'flat', look: [0.4, -0.3], sweat: f >= sweat ? 1 : 0.3}} />
				{/* a cool breeze from the «air conditioner» */}
				{f >= ac && (
					<g>
						<g transform={`translate(1240,500) scale(${pop(f, ac, 11)})`}>
							<rect x={-150} y={-70} width={300} height={140} rx={24} fill="#f4f8fc" stroke="#1d1d24" strokeWidth={7} />
							{[-40, -10, 20, 50].map((yy) => (
								<line key={yy} x1={-120} y1={yy * 0.9} x2={120} y2={yy * 0.9} stroke="#9aa8b8" strokeWidth={5} />
							))}
							<circle cx={110} cy={-44} r={9} fill="#3aa86a" />
						</g>
						{[0, 1, 2].map((k) => {
							const t = ((f - ac + k * 8) % 24) / 24;
							return <path key={k} d={`M ${1090 - t * 160},${470 + k * 40} q -30,-14 -60,0 t -60,0`} stroke="#7fc4ff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - t} />;
						})}
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={ac + 6} x={1240} y={290} text="ПОТ = КОНДИЦИОНЕР" color="#7fc4ff" size={50} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 21. a drop takes the heat away; six kettles =====
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const n = 21;
	const evap = w(n, 'испаряется') - 4;
	const liter = w(n, 'литр') - 6;
	const six = w(n, 'шесть') - 6;
	const part2 = interpolate(f, [liter, liter + 14], [0, 1], clamp);
	const drop = 1 - interpolate(f, [evap, evap + 40], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#fff4e2'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* the skin from very close: a drop on it, the steam takes the heat away */}
				<g opacity={1 - part2}>
					<rect x={0} y={700} width={1920} height={400} fill={SKIN} />
					<path d="M 0,700 C 300,680 600,720 960,700 C 1300,682 1600,716 1920,700 L 1920,730 L 0,730 Z" fill="#c98a60" opacity={0.4} />
					{Array.from({length: 18}).map((_, i) => (
						<circle key={i} cx={60 + i * 110 + rnd(i) * 40} cy={790 + rnd(i + 5) * 220} r={5} fill="#b9784e" opacity={0.5} />
					))}
					{drop > 0.02 && <ellipse cx={960} cy={700 - 70 * drop} rx={110 * Math.sqrt(drop)} ry={80 * drop} fill="#9fd8ff" stroke="#3a8ad8" strokeWidth={6} opacity={0.95} />}
					{f >= evap &&
						[0, 1, 2, 3].map((k) => {
							const t = ((f - evap + k * 10) % 40) / 40;
							return (
								<g key={k} opacity={1 - t}>
									<path d={`M ${880 + k * 50},${620 - t * 360} q 20,-30 0,-60 q -20,-30 0,-60`} stroke="#ffffff" strokeWidth={14} fill="none" strokeLinecap="round" />
									<path d={`M ${900 + k * 50},${600 - t * 360} l 0,-40 m -14,14 l 14,-14 l 14,14`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</g>
							);
						})}
				</g>
				{/* 1 litre of sweat = 6 kettles */}
				{part2 > 0 && (
					<g opacity={part2}>
						<g transform="translate(260,560) scale(1.5)">
							<rect x={-50} y={-110} width={100} height={210} rx={24} fill="#eaf5ff" stroke="#2a6aa8" strokeWidth={6} />
							<rect x={-44} y={-60} width={88} height={154} rx={18} fill="#9fd8ff" />
							<Drop x={0} y={10} r={20} color="#ffffff" o={0.8} />
						</g>
						<text x={480} y={590} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={120} fill="#1d1d24">
							=
						</text>
						{Array.from({length: 6}).map((_, i) => {
							const at = six + i * 5;
							return f >= at ? (
								<g key={i} transform={`translate(${700 + (i % 3) * 400},${(i < 3 ? 430 : 720)}) scale(${pop(f, at, 11) * 1.05})`}>
									<Kettle steam={1} f={f + i * 7} />
								</g>
							) : null;
						})}
					</g>
				)}
			</svg>
			<Plaque f={f} at={evap + 4} x={960} y={200} text="ПОТ УНОСИТ ТЕПЛО" color={RED} size={54} to={liter - 4} />
			<Plaque f={f} at={liter + 10} x={960} y={150} text="1 ЛИТР ПОТА = 6 ЧАЙНИКОВ" color={YEL} size={54} />
		</AbsoluteFill>
	);
};

// ============================================================ 22. up to a litre an hour =====
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const n = 22;
	const walk = w(n, 'идёшь') - 6;
	const fast = f >= walk;
	const t = interpolate(f, [4, len(n)], [0, 1], clamp);
	const lvl = fast ? interpolate(f, [walk, walk + 40], [1 - interpolate(walk, [4, len(n)], [0, 0.6], clamp), 0], clamp) : 1 - t * 0.6;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j22" p={HOT} />
				<SunDisk x={1600} y={140} r={70} />
				<Dunes p={HOT} />
				<g transform="translate(620,470)">
					<ClockFace t={t} r={150} />
				</g>
				<g transform="translate(1100,520) scale(1.5)">
					<rect x={-50} y={-110} width={100} height={210} rx={24} fill="#eaf5ff" stroke="#2a6aa8" strokeWidth={6} />
					<rect x={-44} y={-104 + 198 * (1 - lvl)} width={88} height={198 * lvl} rx={18} fill="#5fb0f0" />
				</g>
				{fast && (
					<You x={1460} y={1060} s={0.74} f={f} walk={f * 0.4} pack face={{eyes: 'narrow', brows: 'worried', mouth: 'open', look: [0.3, 0], sweat: 1}} />
				)}
			</Stage16>
			<Chip f={f} at={4} x={860} y={190} text="ДО 1 Л ПОТА В ЧАС" color={RED} size={52} />
			<Chip f={f} at={walk + 6} x={1460} y={330} text="ИДЁШЬ — ЕЩЁ БОЛЬШЕ" color="#f08a2a" size={42} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 23. the trap: to cool down, the body spends water =====
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const n = 23;
	const trap = w(n, 'ловушка') - 4;
	const noWater = w(n, 'нет') - 6;
	const rot = f * 1.2;
	const nodes = [
		{a: -90, label: 'ЖАРА', c: '#f08a2a'},
		{a: 30, label: 'ПОТ', c: '#5fb0f0'},
		{a: 150, label: '− ВОДА', c: RED},
	];
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j23" p={HOT} />
				<SunDisk x={300} y={160} r={60} />
				<Dunes p={HOT} />
				<g transform="translate(960,560)">
					<circle r={250} fill="rgba(20,12,6,0.55)" />
					{/* the arrows going round */}
					<g transform={`rotate(${rot})`}>
						{[0, 120, 240].map((a) => (
							<path key={a} d="M 0,-250 A 250,250 0 0 1 200,-150" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" transform={`rotate(${a + 15})`} markerEnd="" />
						))}
						{[0, 120, 240].map((a) => (
							<path key={`h${a}`} d="M 200,-150 l -40,-6 m 40,6 l -14,-38" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" transform={`rotate(${a + 15})`} />
						))}
					</g>
					{nodes.map((nd, i) => {
						const a = (nd.a * Math.PI) / 180;
						const at = 6 + i * 8;
						return f >= at ? (
							<g key={i} transform={`translate(${Math.cos(a) * 250},${Math.sin(a) * 250}) scale(${pop(f, at, 11)})`}>
								<circle r={86} fill={nd.c} stroke="#fff" strokeWidth={8} />
								<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#fff">
									{nd.label}
								</text>
							</g>
						) : null;
					})}
					{f >= noWater && (
						<g transform={`scale(${pop(f, noWater, 10)})`}>
							<Flask level={0} s={1.1} id="j23f" />
							<g stroke={RED} strokeWidth={14} strokeLinecap="round">
								<line x1={-60} y1={-150} x2={60} y2={10} />
								<line x1={60} y1={-150} x2={-60} y2={10} />
							</g>
						</g>
					)}
				</g>
			</Stage16>
			<Plaque f={f} at={trap} x={960} y={150} text="ЛОВУШКА" color={RED} size={64} />
			<HeatGrade k={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 24. the rule of threes — and the desert =====
const Lungs: React.FC = () => (
	<svg width={140} height={120} viewBox="-70 -60 140 120">
		<path d="M -8,-50 L -8,-6 C -20,-10 -30,-34 -46,-30 C -66,-24 -66,30 -56,44 C -46,56 -14,50 -8,30 Z" fill="#f7a8b8" stroke="#fff" strokeWidth={4} />
		<path d="M 8,-50 L 8,-6 C 20,-10 30,-34 46,-30 C 66,-24 66,30 56,44 C 46,56 14,50 8,30 Z" fill="#f7a8b8" stroke="#fff" strokeWidth={4} />
	</svg>
);
const DropIco: React.FC = () => (
	<svg width={100} height={120} viewBox="-50 -64 100 120">
		<path d="M 0,-58 C 30,-20 44,0 44,18 A 44,40 0 0 1 -44,18 C -44,0 -30,-20 0,-58 Z" fill="#5fb0f0" stroke="#fff" strokeWidth={4} />
	</svg>
);
const Bread: React.FC = () => (
	<svg width={140} height={110} viewBox="-70 -55 140 110">
		<path d="M -60,30 L -60,-10 C -60,-50 60,-50 60,-10 L 60,30 Z" fill="#e0a050" stroke="#fff" strokeWidth={4} />
		{[-30, 0, 30].map((x) => (
			<line key={x} x1={x - 10} y1={-26} x2={x + 10} y2={-6} stroke="#a8682a" strokeWidth={6} strokeLinecap="round" />
		))}
	</svg>
);
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const n = 24;
	const c1 = w(n, 'минуты') - 6;
	const c2 = w(n, 'дня') - 6;
	const c3 = w(n, 'недели') - 6;
	const but = w(n, 'пустыне') - 8;
	const stamp = w(n, 'день') - 6;
	const shake = f >= but && f < but + 14 ? Math.sin(f * 2.2) * 8 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j24" p={HOT} />
				<SunDisk x={1640} y={140} r={60} />
				<Dunes p={HOT} />
			</Stage16>
			<AbsoluteFill style={{background: 'rgba(30,16,6,0.35)'}} />
			<Card f={f} at={c1} x={560} y={540} big="3" unit="МИНУТЫ" text="без воздуха" color="#f7a8b8">
				<Lungs />
			</Card>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px,0)`}}>
				<Card f={f} at={c2} x={960} y={540} big="3" unit="ДНЯ" text="без воды" color="#5fb0f0">
					<DropIco />
				</Card>
			</div>
			<Card f={f} at={c3} x={1360} y={540} big="3" unit="НЕДЕЛИ" text="без еды" color="#e0a050">
				<Bread />
			</Card>
			{f >= stamp && (
				<div style={{position: 'absolute', left: 960, top: 600, transform: `translate(-50%,-50%) rotate(-10deg) scale(${pop(f, stamp, 9) * 1.0})`, border: `10px solid ${RED}`, color: RED, background: 'rgba(255,248,236,0.96)', borderRadius: 18, padding: '10px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: 54, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05}}>
					В ПУСТЫНЕ
					<br />
					1–2 ДНЯ
				</div>
			)}
			<Plaque f={f} at={2} x={960} y={160} text="ПРАВИЛО ТРЁХ" color={YEL} size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 25. the evening of the first day =====
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const n = 25;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.05, cx: 1000, cy: 540});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f7b062">
				<Sky id="j25" p={SUNSET} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1350} y={560} r={80} color="#ffd0a0" />
				</Layer>
				<Dunes p={SUNSET} cam={cam} />
				<Layer cam={cam}>
					<ellipse cx={lerp(f, 0, len(n), 820, 900) - 220} cy={985} rx={260} ry={14} fill="#3a1808" opacity={0.35} />
					<You x={lerp(f, 0, len(n), 820, 900)} y={990} s={0.6} f={f} walk={f * 0.2} tilt={6} pack face={{eyes: 'narrow', brows: 'worried', mouth: 'flat', look: [0.4, 0], sweat: 0.4}} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={3} x={960} y={200} text="ВЕЧЕР ПЕРВОГО ДНЯ" color="#f7b062" size={54} />
			<HeatGrade k={0.4} vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 26. a dry mouth, sticky saliva, a headache =====
export const S26: React.FC = () => {
	const f = useCurrentFrame();
	const n = 26;
	const glue = w(n, 'слюна') - 4;
	const tongue = w(n, 'язык') - 4;
	const head = w(n, 'болит') - 4;
	const S = 1.6;
	const X = 960;
	const Y = 1346;
	const mouthY = Y - 444 * S;
	const pain = f >= head ? 0.6 + 0.4 * Math.abs(Math.sin((f - head) / 5)) : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j26" p={mixPal(NOON, SUNSET, 0.5)} />
				<Dunes p={mixPal(NOON, SUNSET, 0.5)} />
				<You x={X} y={Y} s={S} f={f} bust pack dry={0.5} face={{eyes: f >= head ? 'closed' : 'narrow', brows: 'worried', mouth: 'open', sweat: 0.3}} />
				{/* sticky saliva between the lips */}
				{f >= glue &&
					[-18, 0, 20].map((dx, i) => (
						<path key={i} d={`M ${X + dx * S},${mouthY - 14} Q ${X + dx * S + 5},${mouthY + 2} ${X + dx * S},${mouthY + 16}`} stroke="#fffdf6" strokeWidth={6} fill="none" opacity={0.95 * pop(f, glue + i * 3, 12)} />
					))}
				{/* the headache */}
				{pain > 0 &&
					[-1, 1].map((sd) => (
						<path key={sd} d={`M ${X + sd * 258},${Y - 560 * S} l ${sd * 30},-20 l ${sd * -10},-24 l ${sd * 34},-18`} stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={pain} transform={`translate(${sd * 10 * pain},0)`} />
					))}
			</Stage16>
			<Chip f={f} at={4} x={420} y={300} text="ВО РТУ СУХО" color="#a8561e" size={46} />
			<Chip f={f} at={glue + 4} x={420} y={410} text="СЛЮНА КАК КЛЕЙ" color="#8a7a6a" size={46} />
			<Chip f={f} at={tongue + 4} x={420} y={520} text="ЯЗЫК ЛИПНЕТ" color="#c9603a" size={46} />
			<Chip f={f} at={head + 4} x={1560} y={240} text="БОЛИТ ГОЛОВА" color={RED} size={46} />
			<HeatGrade k={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 27. the blood thickens; the pulse runs =====
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const n = 27;
	const heart = w(n, 'сердцу') - 6;
	const thick = interpolate(f, [4, heart], [0, 1], clamp);
	const speed = lerp(f, 0, heart, 6, 2.5);
	const bpm = Math.round(interpolate(f, [heart, len(n)], [72, 112], clamp));
	const per = 1800 / bpm;
	const ph = (f % per) / per;
	const beat = ph < 0.2 ? Math.sin((ph / 0.2) * Math.PI) : 0;
	const cells = Math.round(18 + thick * 22);
	return (
		<AbsoluteFill style={{background: '#2a0e10'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* a vessel: the plasma gets less, the cells crowd */}
				<rect x={-20} y={240} width={1960} height={380} fill={mix('#f2b0a0', '#a8282e', thick)} />
				<rect x={-20} y={220} width={1960} height={30} fill="#c8505a" />
				<rect x={-20} y={610} width={1960} height={30} fill="#c8505a" />
				{Array.from({length: cells}).map((_, i) => {
					const x = ((rnd(i) * 2200 + f * speed * (0.8 + rnd(i + 3) * 0.4)) % 2200) - 140;
					const y = 280 + rnd(i + 7) * 300;
					return (
						<g key={i} transform={`translate(${x},${y}) rotate(${rnd(i + 11) * 60 - 30})`}>
							<ellipse rx={48} ry={30} fill="#d8323a" stroke="#8a1418" strokeWidth={4} />
							<ellipse rx={22} ry={12} fill="#a81e26" />
						</g>
					);
				})}
				{f >= heart && (
					<g transform={`translate(1380,770) scale(${pop(f, heart, 11) * 0.75})`}>
						<HeartIcon beat={beat} />
					</g>
				)}
			</svg>
			<Plaque f={f} at={4} x={960} y={150} text="КРОВЬ ГУСТЕЕТ" color={RED} size={58} />
			{f >= heart && (
				<div style={{position: 'absolute', left: 1480, top: 730, fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 0 #000'}}>
					♥ {bpm}
				</div>
			)}
			<Chip f={f} at={heart + 10} x={1000} y={770} text="ПУЛЬС РАЗГОНЯЕТСЯ" color={RED} size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 28. you stand up — and it goes dark =====
export const S28: React.FC = () => {
	const f = useCurrentFrame();
	const n = 28;
	const up = interpolate(f, [2, 16], [0, 1], {...clamp, easing: ease3});
	const dark = w(n, 'темнеет') - 4;
	const r = f < dark ? 1800 : f < dark + 8 ? lerp(f, dark, dark + 8, 1800, 260) : lerp(f, dark + 8, len(n), 260, 1400);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j28" p={mixPal(NOON, SUNSET, 0.6)} />
				<Dunes p={mixPal(NOON, SUNSET, 0.6)} />
				<Rock x={1250} y={1000} s={1.2} color="#7a5032" />
				<You x={900} y={1150 - up * 90} s={0.95} f={f} pack tilt={f >= dark ? 8 : 0} face={{eyes: f >= dark ? 'closed' : 'open', brows: 'worried', mouth: 'flat'}} />
			</Stage16>
			<AbsoluteFill style={{background: `radial-gradient(circle ${Math.round(r)}px at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.96) 100%)`}} />
			<Chip f={f} at={dark + 10} x={960} y={200} text="ДАВЛЕНИЕ ПАДАЕТ" color={RED} size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 29. the brain loses water too =====
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const n = 29;
	const think = w(n, 'думать') - 4;
	const count = w(n, 'считать') - 4;
	const angry = w(n, 'злишься') - 6;
	const shrink = interpolate(f, [4, think], [1, 0.9], clamp);
	return (
		<AbsoluteFill style={{background: '#fff4e2'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform="translate(560,460) scale(2.2)">
					<BrainIcon k={shrink} color={mix('#f7a8b8', '#d8a0a8', 1 - shrink)} />
				</g>
				{[0, 1, 2].map((k) => {
					const t = ((f + k * 12) % 36) / 36;
					return <Drop key={k} x={420 + k * 140} y={700 + t * 120} r={16} o={1 - t} />;
				})}
				{f >= count && (
					<g transform={`translate(1360,380) scale(${pop(f, count, 11)})`}>
						<rect x={-260} y={-90} width={520} height={180} rx={24} fill="#1d1d24" />
						<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill="#fff">
							17 + 26 = <tspan fill={RED}>?</tspan>
						</text>
					</g>
				)}
				{f >= angry && (
					<g transform={`translate(1360,640) scale(${pop(f, angry, 10) * 0.8})`}>
						<path d="M -60,-60 L -10,-10 M 60,-60 L 10,-10 M -60,60 L -10,10 M 60,60 L 10,10" stroke={RED} strokeWidth={22} strokeLinecap="round" />
						<path d="M -50,-80 Q -80,-80 -80,-50 M 50,-80 Q 80,-80 80,-50 M -50,80 Q -80,80 -80,50 M 50,80 Q 80,80 80,50" stroke={RED} strokeWidth={14} fill="none" strokeLinecap="round" />
					</g>
				)}
			</svg>
			<Plaque f={f} at={4} x={560} y={170} text="МОЗГ ТЕРЯЕТ ВОДУ" color="#f7a8b8" size={52} />
			<Chip f={f} at={think + 4} x={1360} y={230} text="ТРУДНО ДУМАТЬ" color="#8a5ad8" size={44} />
			<Chip f={f} at={angry + 6} x={1360} y={790} text="ЗЛИШЬСЯ НА ВСЁ" color={RED} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 30. the sun sets; the night is cold =====
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const n = 30;
	const sets = w(n, 'садится');
	const cold = w(n, 'холодно') - 8;
	const t = interpolate(f, [sets - 6, sets + 70], [0, 1], {...clamp, easing: ease3});
	const p = mixPal(SUNSET, NIGHT, t);
	const sunY = lerp(f, 0, sets + 60, 600, 900);
	const shiver = f >= cold ? Math.sin(f * 1.6) * 4 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#0b1638">
				<Sky id="j30" p={p} f={f} stars={t} />
				<SunDisk x={1300} y={sunY} r={80} color="#ffc890" glow={1 - t} />
				<Dunes p={p} />
				<g transform={`translate(${shiver},0)`}>
					<You x={760} y={1010} s={0.66} f={f} pack cold={f >= cold ? 0.7 : 0} shiver={f >= cold ? 0.3 : 0} face={{eyes: 'narrow', brows: 'worried', mouth: 'tight', look: [0.3, 0]}} armL={f >= cold ? arm([-100, -318], [-18, -345], {fist: true}) : 'down'} armR={f >= cold ? arm([100, -318], [18, -345], {fist: true}) : 'down'} />
				</g>
			</Stage16>
			<Chip f={f} at={cold} x={1300} y={300} text="НОЧЬЮ ≈ 10°" color="#3a78e0" size={54} />
			<Plaque f={f} at={cold + 4} x={960} y={170} text="НОЧЬЮ — ХОЛОДНО" color="#7fc4ff" size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 31. the heat goes straight up into the sky =====
export const S31: React.FC = () => {
	const f = useCurrentFrame();
	const n = 31;
	const clouds = w(n, 'облаков') - 2;
	return (
		<AbsoluteFill>
			<Stage16 bg="#0b1638">
				<Sky id="j31" p={NIGHT} f={f} stars={1} />
				<Moon x={1500} y={200} />
				<Dunes p={NIGHT} />
				{Array.from({length: 9}).map((_, i) => {
					const t = ((f * 1.4 + i * 23) % 100) / 100;
					const x = 140 + i * 210;
					return <path key={i} d={`M ${x},${800 - t * 700} q 18,-24 0,-48 q -18,-24 0,-48`} stroke="#ff8a4a" strokeWidth={9} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.9} />;
				})}
				{f >= clouds && (
					<g transform={`translate(420,240) scale(${pop(f, clouds, 11)})`}>
						<path d="M -90,30 C -120,30 -120,-20 -84,-24 C -80,-70 -10,-74 0,-36 C 20,-70 90,-60 84,-16 C 120,-14 118,30 90,30 Z" fill="#cfd8e8" />
						<g stroke={RED} strokeWidth={13} strokeLinecap="round">
							<line x1={-70} y1={-60} x2={70} y2={40} />
							<line x1={70} y1={-60} x2={-70} y2={40} />
						</g>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={w(n, 'тепло') - 4} x={960} y={170} text="ТЕПЛО УХОДИТ В НЕБО" color="#ff8a4a" size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 32. night is your chance =====
export const S32: React.FC = () => {
	const f = useCurrentFrame();
	const n = 32;
	const night = w(n, 'идти') - 6;
	const day = w(n, 'днём') - 6;
	const less = w(n, 'меньше') - 8;
	const panel = (x: number, at: number, children: React.ReactNode, label: string, col: string) =>
		f < at ? null : (
			<g transform={`translate(${x},540) scale(${pop(f, at, 12)})`}>
				<rect x={-420} y={-330} width={840} height={620} rx={36} fill="#000" opacity={0.3} />
				<g>{children}</g>
				<rect x={-420} y={-330} width={840} height={620} rx={36} fill="none" stroke={col} strokeWidth={10} />
				<text x={0} y={250} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">
					{label}
				</text>
			</g>
		);
	return (
		<AbsoluteFill style={{background: '#20160e'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<defs>
					<clipPath id="j32clip">
						<rect x={-420} y={-330} width={840} height={620} rx={36} />
					</clipPath>
				</defs>
				{panel(
					500,
					night,
					<g clipPath="url(#j32clip)">
						<rect x={-420} y={-330} width={840} height={620} fill="#0b1638" />
						{Array.from({length: 40}).map((_, i) => (
							<circle key={i} cx={-400 + rnd(i) * 800} cy={-320 + rnd(i + 50) * 300} r={1.5 + rnd(i + 9) * 2} fill="#fff" opacity={0.8} />
						))}
						<Moon x={260} y={-220} r={40} />
						<path d="M -420,120 Q -200,60 0,100 T 420,90 L 420,300 L -420,300 Z" fill="#20274a" />
						<You x={-250} y={206} s={0.42} f={f} walk={f * 0.3} pack face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.5, 0]}} />
					</g>,
					'НОЧЬЮ — ИДТИ',
					'#7fc4ff',
				)}
				{panel(
					1420,
					day,
					<g clipPath="url(#j32clip)">
						<rect x={-420} y={-330} width={840} height={620} fill="#f6e6c4" />
						<circle cx={250} cy={-220} r={56} fill="#fff6d8" />
						<path d="M -420,120 Q -200,60 0,100 T 420,90 L 420,300 L -420,300 Z" fill="#e7b66e" />
						{/* a cloth on two sticks: the shade */}
						<path d="M -200,-20 L 200,-40 L 210,0 L -190,20 Z" fill="#f4efe4" stroke="#1d1d24" strokeWidth={5} />
						<line x1={-190} y1={20} x2={-190} y2={150} stroke="#6a4a2a" strokeWidth={8} />
						<line x1={200} y1={0} x2={200} y2={140} stroke="#6a4a2a" strokeWidth={8} />
						<ellipse cx={0} cy={150} rx={210} ry={26} fill="#000" opacity={0.25} />
						<g transform="translate(150,146) rotate(-90)">
							<You x={0} y={0} s={0.36} f={f} face={{eyes: 'closed', mouth: 'flat', brows: 'neutral'}} />
						</g>
					</g>,
					'ДНЁМ — В ТЕНИ',
					YEL,
				)}
			</svg>
			<Plaque f={f} at={2} to={less - 6} x={960} y={150} text="НОЧЬ — ТВОЙ ШАНС" color="#7fc4ff" size={54} />
			<Chip f={f} at={less + 2} x={960} y={150} text="ВОДЫ УХОДИТ В РАЗЫ МЕНЬШЕ" color="#3aa86a" size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 33. by the stars — but where to? =====
export const S33: React.FC = () => {
	const f = useCurrentFrame();
	const n = 33;
	const where = w(n, 'куда') - 6;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.06, cx: 960, cy: 500});
	return (
		<AbsoluteFill>
			<Stage16 bg="#03061a">
				<Sky id="j33" p={NIGHT} f={f} stars={1} />
				{/* the Milky Way */}
				<Layer cam={cam} d={0.2}>
					<path d="M -100,700 C 400,300 1100,200 2000,-50" stroke="#9fb4ff" strokeWidth={180} opacity={0.08} fill="none" strokeLinecap="round" />
					<path d="M -100,700 C 400,300 1100,200 2000,-50" stroke="#cfd8ff" strokeWidth={60} opacity={0.08} fill="none" strokeLinecap="round" />
					{f >= where && (
						<g transform={`translate(1240,250) scale(${pop(f, where, 11)})`} fill="#fff">
							{[
								[-40, -70],
								[-20, -90],
								[10, -92],
								[36, -76],
								[44, -50],
								[30, -26],
								[8, -10],
								[0, 16],
								[0, 60],
							].map(([x, y], i) => (
								<circle key={i} cx={x} cy={y} r={7} />
							))}
							<path d="M -40,-70 L -20,-90 L 10,-92 L 36,-76 L 44,-50 L 30,-26 L 8,-10 L 0,16" stroke="#cfe0ff" strokeWidth={3} fill="none" opacity={0.7} />
						</g>
					)}
				</Layer>
				<Dunes p={NIGHT} cam={cam} />
				<Layer cam={cam}>
					<You x={lerp(f, 0, len(n), 860, 980)} y={960} s={0.55} f={f} walk={f * 0.26} back pack />
				</Layer>
			</Stage16>
		</AbsoluteFill>
	);
};

// ============================================================ 34. the second day: seven percent =====
export const S34: React.FC = () => {
	const f = useCurrentFrame();
	const n = 34;
	const t = interpolate(f, [0, 30], [0, 1], clamp);
	const p = mixPal(DAWN, HOT, t);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j34" p={p} />
				<SunDisk x={1400} y={lerp(f, 0, 40, 520, 260)} r={74} />
				<Dunes p={p} />
				<Shimmer f={f} y={640} k={t} />
				<You x={lerp(f, 0, len(n), 900, 960)} y={1000} s={0.66} f={f} walk={f * 0.18} tilt={10} pack dry={0.5} face={{eyes: 'narrow', brows: 'worried', mouth: 'open', look: [0.3, 0], sweat: 0.2}} />
			</Stage16>
			<Plaque f={f} at={2} x={960} y={200} text="ДЕНЬ ВТОРОЙ" color={YEL} size={58} />
			<HeatGrade k={0.7} />
		</AbsoluteFill>
	);
};
