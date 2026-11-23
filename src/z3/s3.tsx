// «Каково это — оказаться погребённым заживо» — shots 45–48 (the avalanche), 52–55 (the hole on the beach), 56–59 (the
// trench and the grain bin), 60–62 (the rubble after an earthquake). Гога makes mistakes four to seven; Чоби stops him.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {armAngles, Person, type ArmPose, type Kind} from '../components/Person';
import {STOP_WALK, StopChobi} from './chobiKit';
import {arm, armTo, AvalancheFront, Beach, Chip, GrainPile, HEAVY, INK, Lighter, Mountains, Phone, Plaque, RED, Rope, Rubble, Stage16, Vig, Waves, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const SLOPE = 0.28; // the ski slope: y = 380 + x · SLOPE
const slopeY = (x: number) => 380 + x * SLOPE;
// where Гога stops on the slope in 45 — and where the avalanche catches him in 46 (no jump at the cut)
const GOGA46 = 700;
const SLOPE_DEG = (Math.atan(SLOPE) * 180) / Math.PI;

// a snowboard under his feet (Choby units: the feet at y 0)
const Board: React.FC = () => <rect x={-130} y={-6} width={260} height={26} rx={13} fill="#2f86e0" stroke={INK} strokeWidth={5} />;
// the slope: a white field running down to the right
const Slope: React.FC = () => <path d={`M -200,${slopeY(-200)} L 2200,${slopeY(2200)} L 2200,1400 L -200,1400 Z`} fill="#f4f8fc" />;
// a crossed-out avalanche beacon
const NoBeacon: React.FC = () => (
	<g>
		<circle r={66} fill="#fff" stroke={INK} strokeWidth={6} />
		<rect x={-26} y={-40} width={52} height={80} rx={12} fill="#f08a2a" stroke={INK} strokeWidth={5} />
		<rect x={-16} y={-28} width={32} height={22} rx={4} fill="#1d2430" />
		<path d="M -40,-40 L 40,40 M 40,-40 L -40,40" stroke={RED} strokeWidth={12} strokeLinecap="round" />
	</g>
);

// ============================================================ 45. alone, without a beacon: mistake four =====
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const n = 45;
	const alone = w(n, 'один') - 4;
	const beacon = w(n, 'датчика') - 8;
	const four = w(n, 'ошибка') - 4;
	// he rides down and slows to a stop as Чоби steps in («Стоп, Гога!»)
	const ride = Math.min(1, f / Math.max(1, four + 6));
	const x = 380 + (GOGA46 - 380) * (1 - (1 - ride) ** 2);
	const speed = 1 - interpolate(f, [four - 12, four + 6], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#cfe6fb">
				<Mountains id="z45" />
				<Slope />
				<g transform={`translate(${x},${slopeY(x)}) rotate(${SLOPE_DEG})`}>
					<Board />
					<You x={0} y={0} s={0.55} f={f} brows={1} face={{eyes: 'open', mouth: 'smile', look: [0.6, 0]}} armL={arm([-130, -360], [-210, -390], {})} armR={arm([130, -360], [210, -340], {})} />
				</g>
				{Array.from({length: 8}).map((_, i) => {
					const t = ((f / 8 + i / 8) % 1);
					return <circle key={i} cx={x - 120 - t * 200} cy={slopeY(x - 120 - t * 200) - 10 - t * 40} r={10 + t * 10} fill="#fff" opacity={(1 - t) * speed} />;
				})}
			</Stage16>
			<Chip f={f} at={alone + 2} x={1250} y={330} text="ОДИН" color="#3a78e0" size={52} to={four - 4} />
			{f >= beacon && f < four + 6 && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(1560,330) scale(${pop(f, beacon, 10) * interpolate(f, [four - 4, four + 6], [1, 0], clamp)})`}>
						<NoBeacon />
					</g>
				</svg>
			)}
			<Chip f={f} at={beacon + 6} x={1560} y={440} text="БЕЗ ДАТЧИКА" color={RED} size={40} to={four - 4} />
			<StopChobi n={n} f={f} at={four} to={len(n) + 10} label="ОШИБКА №4 · ОДИН В ГОРАХ" />
		</AbsoluteFill>
	);
};

// ============================================================ 46. the avalanche: he screams, the snow fills his mouth; the washing machine; it sets like concrete =====
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const n = 46;
	const scream = w(n, 'кричит') - 6;
	const mouth = w(n, 'забивает') - 4;
	const spin = w(n, 'крутит') - 6;
	const stop = w(n, 'останавливается') - 6;
	const set = w(n, 'схватывается') - 6;
	const front = lerp(f, 0, spin, -200, 2400);
	const swallowed = f >= spin;
	const rot = swallowed ? (f < stop ? (f - spin) * 14 : (stop - spin) * 14) : 0;
	const grey = interpolate(f, [set, set + 20], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#cfe6fb">
				<Mountains id="z46" />
				<Slope />
				<AvalancheFront f={f} x={front} y={slopeY(1000) + 200} h={900} />
				{!swallowed && (
					<g transform={`translate(${GOGA46},${slopeY(GOGA46)}) rotate(${SLOPE_DEG})`}>
						<Board />
						<You x={0} y={0} s={0.55} f={f} face={{eyes: 'wide', brows: 'raised', mouth: f >= scream ? 'o' : 'open', look: [-0.8, -0.2]}} armL={arm([-120, -440], [-170 + Math.sin(f / 2) * 30, -540], {})} armR={arm([120, -440], [170 - Math.sin(f / 2) * 30, -540], {})} outer={f >= mouth ? <ellipse cx={0} cy={-440} rx={40} ry={26} fill="#fff" stroke="#cfe0ef" strokeWidth={4} /> : undefined} />
					</g>
				)}
				{/* once the front has reached him, snow flies past in front of him: he is inside the avalanche, not on top of it */}
				{!swallowed && front > GOGA46 - 150 &&
					Array.from({length: 26}).map((_, k) => {
						const t = ((f * 0.045 + k * 0.137) % 1);
						const cy = slopeY(GOGA46) - 520 + ((k * 97) % 560);
						const op = interpolate(front, [GOGA46 - 150, GOGA46 + 250], [0, 0.85], clamp);
						return <circle key={k} cx={GOGA46 - 420 + t * 840} cy={cy + Math.sin(t * 6 + k) * 30} r={12 + (k % 4) * 9} fill={k % 3 ? '#ffffff' : '#e6eef7'} opacity={op * (1 - Math.abs(t - 0.5) * 1.4)} />;
					})}
				{swallowed && (
					<g>
						<rect x={-100} y={-100} width={2200} height={1300} fill="#eef4fb" />
						{Array.from({length: 30}).map((_, i) => {
							const a = f / 4 + i;
							return <circle key={i} cx={960 + Math.cos(a) * (160 + (i % 5) * 80)} cy={540 + Math.sin(a) * (120 + (i % 4) * 60)} r={14 + (i % 3) * 10} fill="#fff" stroke="#d6e4f2" strokeWidth={3} />;
						})}
						<g transform={`translate(960,560) rotate(${rot}) translate(0,200)`}>
							<You x={0} y={0} s={0.5} f={f} face={{eyes: 'closed', brows: 'worried', mouth: 'tight'}} armL={arm([-130, -350], [-200, -300], {})} armR={arm([130, -350], [200, -420], {})} />
						</g>
						{grey > 0 && (
							<g opacity={grey}>
								<rect x={-100} y={-100} width={2200} height={1300} fill="#c9ced6" opacity={0.6} />
								{Array.from({length: 60}).map((_, i) => (
									<circle key={i} cx={(i * 197) % 1920} cy={(i * 113) % 1080} r={4 + (i % 4)} fill="#9aa1ae" />
								))}
							</g>
						)}
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={2} x={1250} y={150} text="ЛАВИНА!" color={RED} size={60} to={spin - 4} />
			<Chip f={f} at={mouth + 2} x={1400} y={300} text="СНЕГ В РОТ" color="#3a78e0" size={44} to={spin - 4} />
			<Chip f={f} at={spin + 4} x={960} y={150} text="КАК В СТИРАЛЬНОЙ МАШИНЕ" color="#3a78e0" size={48} to={set - 4} />
			<Plaque f={f} at={set + 6} x={960} y={150} text="СНЕГ — КАК БЕТОН" color="#7a808c" size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 47. can't move a finger; which way is up?; nobody gets out alone =====
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const n = 47;
	const up = w(n, 'верх') - 6;
	const nobody = w(n, 'никто') - 6;
	return (
		<AbsoluteFill style={{background: '#9fb8d0'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={0} width={1920} height={180} fill="#cfe6fb" />
				<path d="M 0,180 C 400,150 1400,210 1920,170 L 1920,1080 L 0,1080 Z" fill="#e6eef7" />
				{Array.from({length: 7}).map((_, k) => (
					<path key={k} d={`M 0,${300 + k * 110} C 500,${280 + k * 110} 1400,${330 + k * 110} 1920,${300 + k * 110}`} stroke="#d0dceb" strokeWidth={6} fill="none" />
				))}
				{/* Гога packed in the snow, at a slant; a small pocket of air at his face */}
				<g transform="translate(960,620) rotate(-28)">
					<ellipse cx={0} cy={-330} rx={150} ry={120} fill="#c7d6e8" opacity={0.6} />
					<You x={0} y={0} s={0.62} f={f} face={{eyes: 'wide', brows: 'worried', mouth: 'tight', look: [Math.sin(f / 8) * 0.8, Math.cos(f / 8) * 0.6]}} armL={arm([-120, -300], [-160, -220], {})} armR={arm([120, -420], [150, -520], {})} />
				</g>
				{f >= up &&
					[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${1400 + k * 120},${420 + (k % 2) * 140}) rotate(${(f * 4 + k * 120) % 360}) scale(${pop(f, up + k * 4, 9)})`}>
							<path d="M 0,-50 L 0,50 M -20,-28 L 0,-50 L 20,-28" stroke="#2a4a7a" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					))}
			</svg>
			<Chip f={f} at={4} x={470} y={200} text="НИ ПАЛЬЦЕМ" color="#3a78e0" size={48} />
			<Chip f={f} at={up + 4} x={1520} y={230} text="ГДЕ ВЕРХ?" color="#2a4a7a" size={48} />
			<Plaque f={f} at={nobody + 4} x={1380} y={760} text="САМ НЕ ВЫБЕРЕШЬСЯ" color={RED} size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 48. about a hundred every year in the Alps =====
export const S48: React.FC = () => {
	const f = useCurrentFrame();
	const n = 48;
	const hund = w(n, 'сотни') - 8;
	return (
		<AbsoluteFill>
			<Stage16 bg="#cfe6fb">
				<Mountains id="z48" />
			</Stage16>
			<Plaque f={f} at={2} x={960} y={200} text="АЛЬПЫ · КАЖДЫЙ ГОД" color="#3a78e0" size={52} />
			{f >= hund && (
				<div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) scale(${pop(f, hund, 11)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 170, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.25), 6px 6px 0 #1d3a6a, -6px 6px 0 #1d3a6a, 6px -6px 0 #1d3a6a, -6px -6px 0 #1d3a6a', whiteSpace: 'nowrap'}}>
					≈ 100 ЧЕЛОВЕК
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 52. the beach: Гога digs deeper than the knee, the waist, and climbs in for a photo =====
const HOLE = {x: 960, top: 570, w: 360};
export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const n = 52;
	const knee = w(n, 'колена') - 6;
	const waist = w(n, 'пояса') - 6;
	const inside = w(n, 'залезает') - 6;
	const photo = w(n, 'сфотографироваться') - 8;
	const depth = interpolate(f, [4, knee, waist, inside], [40, 160, 300, 380], clamp);
	const dig = Math.sin(f / 3.5);
	const inT = interpolate(f, [inside, inside + 16], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill>
			<Stage16 bg="#bfe3fb">
				<Beach id="z52" f={f} sand={HOLE.top} />
				{/* the hole in section: the wet sand walls */}
				<rect x={HOLE.x - HOLE.w / 2} y={HOLE.top} width={HOLE.w} height={depth} fill="#8a6a3a" />
				<path d={`M ${HOLE.x - HOLE.w / 2 - 160},${HOLE.top} q 80,-60 160,0 M ${HOLE.x + HOLE.w / 2},${HOLE.top} q 80,-60 160,0`} fill="#e0bc78" />
				{inT < 1 && (
					<g transform={`translate(${lerp(inT, 0, 1, HOLE.x + HOLE.w / 2 + 130, HOLE.x)},${HOLE.top + inT * depth})`}>
						<You x={0} y={0} s={0.52} f={f} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [-0.6, 0.4]}} armR={f < inside ? arm([110, -330], [60 + dig * 30, -240], {fist: true, item: <g><rect x={-8} y={0} width={16} height={160} fill="#a0662e" /><path d="M -34,150 L 34,150 L 26,220 L -26,220 Z" fill="#e8352e" /></g>, itemAng: 30}) : 'down'} />
					</g>
				)}
				{inT >= 1 && (
					<You x={HOLE.x} y={HOLE.top + depth} s={0.52} f={f} brows={1} face={{eyes: 'open', mouth: 'smile', look: [0.3, -0.5]}} armR={arm([110, -420], [150, -540], {fist: true, item: <Phone glow={0.8} s={0.5} />})} />
				)}
				{[
					[knee, 160, 'КОЛЕНО'],
					[waist, 300, 'ПОЯС'],
				].map(([at, d, t], k) =>
					f >= (at as number) ? (
						<g key={k} opacity={pop(f, at as number, 10)}>
							<line x1={HOLE.x - HOLE.w / 2 - 230} y1={HOLE.top + (d as number)} x2={HOLE.x - HOLE.w / 2} y2={HOLE.top + (d as number)} stroke="#fff" strokeWidth={6} strokeDasharray="16 10" />
							<text x={HOLE.x - HOLE.w / 2 - 20} y={HOLE.top + (d as number) - 14} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#fff" stroke="#8a6a3a" strokeWidth={6} paintOrder="stroke">
								{t}
							</text>
						</g>
					) : null,
				)}
			</Stage16>
			<Chip f={f} at={2} x={960} y={150} text="ЛЕТО · ПЛЯЖ" color="#2f86d0" size={48} />
			<Chip f={f} at={photo + 4} x={1400} y={420} text="ФОТО!" color="#8a5ad8" size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 53. the walls collapse; two tonnes a cubic metre; the sand presses on the chest =====
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const n = 53;
	const fall = w(n, 'обрушиваются') - 6;
	const tons = w(n, 'тонны') - 8;
	const chest = w(n, 'грудь') - 6;
	const fill = interpolate(f, [fall, fall + 18], [0, 1], {...clamp, easing: ease3});
	const depth = 380;
	return (
		<AbsoluteFill>
			<Stage16 bg="#bfe3fb">
				<Beach id="z53" f={f} sand={HOLE.top} />
				<rect x={HOLE.x - HOLE.w / 2} y={HOLE.top} width={HOLE.w} height={depth} fill="#8a6a3a" />
				<You x={HOLE.x} y={HOLE.top + depth} s={0.52} f={f} face={{eyes: fill > 0.5 ? 'wide' : 'open', brows: fill > 0.5 ? 'worried' : 'neutral', mouth: fill > 0.5 ? 'open' : 'smile', look: [0, -0.4]}} armL={fill > 0.5 ? arm([-130, -380], [-170, -460], {}) : 'down'} armR={fill > 0.5 ? arm([130, -380], [170, -460], {}) : arm([110, -420], [150, -540], {fist: true, item: <Phone glow={0.8} s={0.5} />})} />
				{/* the sand falls in from the walls and fills the hole to his chest */}
				<path d={`M ${HOLE.x - HOLE.w / 2 - 40 * fill},${HOLE.top + depth} L ${HOLE.x - HOLE.w / 2 - 40 * fill},${HOLE.top + depth - fill * 190} C ${HOLE.x - 80},${HOLE.top + depth - fill * 205} ${HOLE.x + 80},${HOLE.top + depth - fill * 205} ${HOLE.x + HOLE.w / 2 + 40 * fill},${HOLE.top + depth - fill * 190} L ${HOLE.x + HOLE.w / 2 + 40 * fill},${HOLE.top + depth} Z`} fill="#d9b06a" />
				{f >= chest &&
					[-1, 0, 1].map((k) => (
						<path key={k} d={`M ${HOLE.x + k * 90},${HOLE.top - 40} l 0,90 m -22,-26 l 22,26 l 22,-26`} stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={pop(f, chest + k * 3, 8)} />
					))}
			</Stage16>
			<Chip f={f} at={fall + 2} x={960} y={150} text="ОБВАЛ — БЕЗ ПРЕДУПРЕЖДЕНИЯ" color={RED} size={44} to={tons - 4} />
			{f >= tons && (
				<div style={{position: 'absolute', left: 1500, top: 320, transform: `translate(-50%,-50%) scale(${pop(f, tons, 11)})`, background: '#16161c', color: '#fff', borderRadius: 20, padding: '14px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, textAlign: 'center'}}>
					1 м³ мокрого песка
					<div style={{fontSize: 66, color: YEL}}>≈ 2 ТОННЫ</div>
				</div>
			)}
			<Chip f={f} at={chest + 4} x={520} y={320} text="НЕ ВДОХНУТЬ" color={RED} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 54. mistake five; the rules for holes =====
export const S54: React.FC = () => {
	const f = useCurrentFrame();
	const n = 54;
	const rules = w(n, 'не') - 4;
	const tunnel = w(n, 'туннели') - 8;
	const kids = w(n, 'дети') - 6;
	return (
		<AbsoluteFill style={{background: '#fff6e4'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={720} width={1920} height={360} fill="#f0cf8a" />
				{f >= rules && (
					<g transform={`translate(420,720) scale(${pop(f, rules, 11)})`}>
						<rect x={-150} y={0} width={300} height={130} fill="#8a6a3a" />
						<You x={0} y={130} s={0.42} f={f} brows={0} face={{eyes: 'open', mouth: 'smile', look: [0.4, 0]}} />
						<path d="M 190,-10 l 0,140 m -20,-120 l 20,-20 l 20,20 m -40,100 l 20,20 l 20,-20" stroke="#3aa86a" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
				{f >= tunnel && (
					<g transform={`translate(1000,760) scale(${pop(f, tunnel, 11)})`}>
						<path d="M -160,0 L -160,-20 C -100,-20 -60,60 60,60 L 160,60 L 160,100 L -160,100 Z" fill="#8a6a3a" />
						<circle cx={0} cy={-90} r={60} fill="#fff" stroke={INK} strokeWidth={6} />
						<path d="M -40,-130 L 40,-50 M 40,-130 L -40,-50" stroke={RED} strokeWidth={12} strokeLinecap="round" />
					</g>
				)}
				{f >= kids && (
					<g transform={`translate(1560,720) scale(${pop(f, kids, 11)})`}>
						<rect x={-110} y={0} width={220} height={260} fill="#8a6a3a" />
						<Person kind="boy" id="z54k" x={0} y={250} scale={0.32} face={{eyes: 'wide', mouth: 'o', brows: 'raised', blush: true}} />
					</g>
				)}
			</svg>
			<StopChobi n={n} f={f} at={0} to={rules - 2} label="ОШИБКА №5 · ГЛУБОКАЯ ЯМА" />
			<Chip f={f} at={rules + 4} x={420} y={560} text="НЕ ГЛУБЖЕ КОЛЕНА" color="#3aa86a" size={40} />
			<Chip f={f} at={tunnel + 4} x={1000} y={560} text="НЕ РЫТЬ ТУННЕЛИ" color={RED} size={40} />
			<Chip f={f} at={kids + 4} x={1560} y={560} text="ДЕТЯМ — ЛОВУШКА" color={RED} size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 55. if someone is buried: dig from the side, free the face and the chest first =====
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const n = 55;
	const side = w(n, 'сбоку') - 6;
	const face = w(n, 'лицо') - 6;
	const freed = interpolate(f, [face, face + 30], [0, 1], clamp);
	const dig = Math.sin(f / 3);
	// they run in from off the frame and stop at the edges of the hole (six strides, feet down when they stop)
	const R0 = side - 30;
	const running = f >= R0 && f < side;
	const runX = interpolate(f, [R0, side], [1260, 360], {...clamp, easing: (t) => t * (1.5 - 0.5 * t)});
	// once there, their arms rise from hanging into digging over 8 frames (no snap)
	const u = interpolate(f, [side, side + 8], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const digArm = (kind: Kind, s: -1 | 1, target: [number, number], bend: 1 | -1): ArmPose | undefined => {
		if (running) return undefined;
		if (u >= 1) return {target, bend};
		const a = armAngles(kind, s, target, bend);
		return {shoulder: s * -6 + (a.shoulder - s * -6) * u, elbow: s * 4 + (a.elbow - s * 4) * u};
	};
	return (
		<AbsoluteFill>
			<Stage16 bg="#bfe3fb">
				<Beach id="z55" f={f} sand={HOLE.top} />
				<rect x={HOLE.x - HOLE.w / 2} y={HOLE.top} width={HOLE.w} height={380} fill="#8a6a3a" />
				<You x={HOLE.x} y={HOLE.top + 380} s={0.52} f={f} face={{eyes: 'open', brows: 'worried', mouth: 'open', look: [0.4, -0.4]}} />
				<path d={`M ${HOLE.x - HOLE.w / 2 - 40},${HOLE.top + 380} L ${HOLE.x - HOLE.w / 2 - 40},${HOLE.top + 130 + freed * 90} C ${HOLE.x - 80},${HOLE.top + 100 + freed * 120} ${HOLE.x + 80},${HOLE.top + 100 + freed * 120} ${HOLE.x + HOLE.w / 2 + 40},${HOLE.top + 130 + freed * 90} L ${HOLE.x + HOLE.w / 2 + 40},${HOLE.top + 380} Z`} fill="#d9b06a" />
				{/* two people run in from both sides and dig from the side, sand flying from their hands */}
				{f >= R0 &&
					([-1, 1] as const).map((sd) => (
						<g key={sd}>
							<Person kind={sd < 0 ? 'mom' : 'dad'} id={`z55h${sd}`} x={HOLE.x + sd * runX} y={HOLE.top + 20} walk={running ? (6 * Math.PI * (f - R0)) / (side - R0) : undefined} scale={0.36} face={{eyes: 'open', mouth: 'flat', brows: 'worried', blush: false, look: [-sd * 0.8, 0.6]}} armL={digArm(sd < 0 ? 'mom' : 'dad', -1, [sd < 0 ? 160 : -160, -300 + dig * 40], sd < 0 ? -1 : 1)} armR={digArm(sd < 0 ? 'mom' : 'dad', 1, [sd < 0 ? 200 : -200, -280 - dig * 40], sd < 0 ? -1 : 1)} />
							{f >= side && <g opacity={pop(f, side, 10)}><path d={`M ${HOLE.x + sd * 280},${HOLE.top - 120} l ${-sd * 70},40 m ${sd * 10},-34 l ${-sd * 10},34 l ${sd * 36},4`} stroke="#3aa86a" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
							{f >= side &&
								[0, 1, 2, 3].map((k) => {
									const t = ((f - side) / 14 + k / 4) % 1;
									return <circle key={k} cx={HOLE.x + sd * (HOLE.w / 2 + 10 + t * 130)} cy={HOLE.top - 10 - Math.sin(t * Math.PI) * 90} r={7 + (k % 2) * 4} fill="#c99a52" opacity={1 - t} />;
								})}
						</g>
					))}
			</Stage16>
			<Chip f={f} at={side + 4} x={960} y={110} text="КОПАЙ СБОКУ" color="#3aa86a" size={50} />
			<Chip f={f} at={face + 4} x={960} y={195} text="СНАЧАЛА ЛИЦО И ГРУДЬ" color="#3aa86a" size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 56. two more traps: the trench and the grain bin =====
const Silo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-150} y={-420} width={300} height={420} fill="#c9ced6" stroke={INK} strokeWidth={6} />
		<path d="M -170,-420 L 0,-540 L 170,-420 Z" fill="#9aa1ae" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
		{[-330, -240, -150, -60].map((yy) => (
			<line key={yy} x1={-150} y1={yy} x2={150} y2={yy} stroke="#9aa1ae" strokeWidth={4} />
		))}
	</g>
);
const TrenchIcon: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-260} y={-40} width={520} height={260} fill="#6b4a2e" />
		<rect x={-80} y={-40} width={160} height={240} fill="#2a1a0e" />
		<rect x={-300} y={-60} width={600} height={24} fill="#3f6a38" />
	</g>
);
export const S56: React.FC = () => {
	const f = useCurrentFrame();
	const n = 56;
	const trench = w(n, 'траншея') - 6;
	const silo = w(n, 'зернохранилище') - 10;
	return (
		<AbsoluteFill style={{background: '#eef2f6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* a warning sign until the two traps appear */}
				{f < trench + 10 && (
					<g transform={`translate(960,520) scale(${pop(f, 2, 12) * interpolate(f, [trench - 2, trench + 8], [1, 0], clamp)})`}>
						<path d="M 0,-190 L 200,160 L -200,160 Z" fill={YEL} stroke={INK} strokeWidth={14} strokeLinejoin="round" />
						<rect x={-18} y={-80} width={36} height={150} rx={18} fill={INK} />
						<circle cx={0} cy={115} r={22} fill={INK} />
					</g>
				)}
				{f >= trench && (
					<g transform={`translate(560,560) scale(${pop(f, trench, 11)})`}>
						<TrenchIcon x={0} y={0} />
					</g>
				)}
				{f >= silo && (
					<g transform={`translate(1360,720) scale(${pop(f, silo, 11)})`}>
						<Silo x={0} y={0} s={1.1} />
					</g>
				)}
			</svg>
			<Plaque f={f} at={2} x={960} y={150} text="ЕЩЁ ДВЕ ЛОВУШКИ" color={RED} size={52} to={silo - 2} />
			<Chip f={f} at={trench + 4} x={560} y={300} text="ТРАНШЕЯ" color="#6b4a2e" size={56} />
			<Chip f={f} at={silo + 4} x={1360} y={130} text="ЗЕРНОХРАНИЛИЩЕ" color="#c9952e" size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 57. a cubic metre of earth weighs a car; no trench deeper than 1.5 m without shoring =====
export const S57: React.FC = () => {
	const f = useCurrentFrame();
	const n = 57;
	const car = w(n, 'легковая') - 6;
	const deep = w(n, 'полутора') - 6;
	const walls = w(n, 'укреплённых') - 6;
	return (
		<AbsoluteFill style={{background: '#eef2f6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* a balance: a cube of earth against a car */}
				<g transform="translate(480,640)">
					<path d="M -260,0 L 260,0 L 0,60 Z" fill="#9aa1ae" stroke={INK} strokeWidth={5} />
					<rect x={-280} y={-10} width={560} height={16} rx={8} fill="#3a3d44" />
					<rect x={-250} y={-150} width={140} height={140} fill="#6b4a2e" stroke={INK} strokeWidth={5} />
					<text x={-180} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#fff">
						1 м³
					</text>
					{f >= car && (
						<g transform={`translate(160,-10) scale(${pop(f, car, 10) * 0.7})`}>
							<path d="M -160,0 L -160,-60 L -110,-70 L -70,-130 L 80,-130 L 130,-70 L 170,-60 L 170,0 Z" fill="#e8352e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
							<rect x={-60} y={-120} width={60} height={46} fill="#9ac0d8" />
							<rect x={10} y={-120} width={60} height={46} fill="#9ac0d8" />
							<circle cx={-90} cy={0} r={32} fill="#2a2a30" />
							<circle cx={100} cy={0} r={32} fill="#2a2a30" />
						</g>
					)}
				</g>
				{/* the trench: 1.5 m; shored walls ✓, bare walls ✕ */}
				{f >= deep && (
					<g transform={`translate(1380,420) scale(${pop(f, deep, 11)})`}>
						<rect x={-300} y={0} width={600} height={420} fill="#6b4a2e" />
						<rect x={-90} y={0} width={180} height={380} fill="#2a1a0e" />
						<rect x={-320} y={-20} width={640} height={24} fill="#3f6a38" />
						<line x1={-310} y1={0} x2={-310} y2={300} stroke={INK} strokeWidth={6} />
						<text x={-320} y={170} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={INK}>
							1,5 м
						</text>
						{f >= walls &&
							[60, 180, 300].map((yy) => (
								<g key={yy} opacity={pop(f, walls, 9)}>
									<rect x={-96} y={yy - 10} width={192} height={20} fill="#c9a35a" stroke={INK} strokeWidth={4} />
								</g>
							))}
						{f >= walls && (
							<g opacity={pop(f, walls, 9)}>
								<rect x={-94} y={0} width={14} height={380} fill="#c9a35a" />
								<rect x={80} y={0} width={14} height={380} fill="#c9a35a" />
							</g>
						)}
					</g>
				)}
			</svg>
			<Chip f={f} at={car + 4} x={480} y={330} text="1 м³ ЗЕМЛИ ≈ ЛЕГКОВАЯ МАШИНА" color="#6b4a2e" size={42} />
			<Chip f={f} at={walls + 6} x={1380} y={330} text="ТОЛЬКО С УКРЕПЛЁННЫМИ СТЕНКАМИ" color="#3aa86a" size={36} />
		</AbsoluteFill>
	);
};

// ============================================================ 58. grain: knee-deep in seconds, over the head in twenty =====
export const S58: React.FC = () => {
	const f = useCurrentFrame();
	const n = 58;
	const knee = w(n, 'колено') - 8;
	const twenty = w(n, 'двадцать') - 6;
	const sink = interpolate(f, [4, knee, twenty, twenty + 20], [0, 0.25, 0.5, 1], clamp);
	const secs = Math.round(interpolate(f, [4, twenty + 20], [0, 20], clamp));
	return (
		<AbsoluteFill style={{background: '#2a2620'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<defs>
					<clipPath id="z58c">
						<rect x={0} y={0} width={1920} height={700} />
					</clipPath>
				</defs>
				<rect x={560} y={120} width={800} height={980} fill="#3a3630" stroke="#9aa1ae" strokeWidth={10} />
				<g clipPath="url(#z58c)">
					<Person kind="dad" id="z58p" x={960} y={700 + sink * 560} scale={0.46} silhouette="#5a4a3a" />
				</g>
				<rect x={570} y={700} width={780} height={400} fill="#e3b64a" />
				{Array.from({length: 50}).map((_, i) => (
					<ellipse key={i} cx={580 + ((i * 89) % 760)} cy={712 + ((i * 53 + f * 2) % 360)} rx={7} ry={4} fill="#c9952e" />
				))}
				<path d="M 570,700 Q 960,640 1350,700" fill="#e3b64a" />
			</svg>
			<div style={{position: 'absolute', left: 1650, top: 420, transform: 'translate(-50%,-50%)', background: '#16161c', border: '6px solid #fff', borderRadius: 24, padding: '10px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 90, whiteSpace: 'nowrap', color: secs >= 20 ? RED : '#fff'}}>
				{secs} с
			</div>
			<Chip f={f} at={knee + 2} x={300} y={600} text="ПО КОЛЕНО — СЕКУНДЫ" color="#c9952e" size={36} />
			<Chip f={f} at={twenty + 2} x={300} y={720} text="20 С — С ГОЛОВОЙ" color={RED} size={36} />
			<Plaque f={f} at={2} x={960} y={70} text="ЗЕРНО — КАК БОЛОТО" color={YEL} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 59. Гога on the grain pile: mistake six; inside only with a safety rope and a partner =====
export const S59: React.FC = () => {
	const f = useCurrentFrame();
	const n = 59;
	const six = w(n, 'ошибка') - 4;
	const never = w(n, 'никогда') - 6;
	const rope = w(n, 'страховочным') - 8;
	// the partner walks in from the right once Чоби has gone (no crossing), then the line goes over the bin to Гога
	const P0 = Math.max(rope - 34, never + 20 + STOP_WALK + 2);
	const P1 = P0 + 30;
	const px = interpolate(f, [P0, P1], [2120, 1680], {...clamp, easing: (t) => t * (1.4 - 0.4 * t)});
	const pwalk = f >= P0 && f < P1 ? (8 * Math.PI * (f - P0)) / (P1 - P0) : undefined;
	const D0 = Math.max(rope, P1 + 2);
	const drop = interpolate(f, [D0, D0 + 16], [0, 1], clamp);
	const u = interpolate(f, [P1, P1 + 8], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
	const hold = armAngles('dad', -1, [-220, -900], -1);
	const holdArm: ArmPose = u >= 1 ? {target: [-220, -900], bend: -1} : {shoulder: 6 + (hold.shoulder - 6) * u, elbow: -4 + (hold.elbow + 4) * u};
	const right = f >= D0;
	return (
		<AbsoluteFill style={{background: '#2a2620'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={460} y={60} width={1000} height={1040} fill="#3a3630" stroke="#9aa1ae" strokeWidth={10} />
				<rect x={860} y={40} width={200} height={40} fill="#9aa1ae" />
				<GrainPile x={960} y={1080} w={980} h={330} f={f} />
				<You x={960} y={760} s={0.5} f={f} brows={right ? 0 : 1} face={{eyes: 'open', mouth: right ? 'flat' : 'smile', look: [0.2, -0.4]}} />
				{/* outside the bin: the ground where the partner stands */}
				<rect x={1470} y={900} width={450} height={180} fill="#4a463e" />
				{f >= P0 && <Person kind="dad" id="z59p" x={px} y={920} walk={pwalk} scale={0.36} colors={{top: '#f08a2a', topDark: '#d47222', pants: '#2a3040', shoes: '#1d1410', hair: '#3a2a20', skin: '#e8c8a0'}} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, look: [-0.8, 0.6]}} armL={f >= P1 ? holdArm : undefined} />}
				{/* the line runs from his hands over the top of the bin and down through the hatch to Гога's harness */}
				{f >= D0 && (
					<g>
						<path d={`M 1600,560 L 1520,80 L ${1032 + 488 * (1 - Math.min(1, drop * 2))},80`} stroke="#c9a35a" strokeWidth={5} fill="none" strokeDasharray="14 8" />
						{/* the rope comes down beside him (not over his face) to the ring of his harness */}
						{drop > 0.5 && <Rope a={[1032, 80 + 570 * (drop - 0.5) * 2]} b={[1032, 80]} sag={0} />}
						{drop >= 1 && (
							<g opacity={pop(f, D0 + 16, 8)}>
								<path d="M 912,640 L 1036,640 L 1036,700 L 912,700 Z" fill="none" stroke="#f08a2a" strokeWidth={8} />
								<circle cx={1032} cy={650} r={10} fill="none" stroke="#9aa1ae" strokeWidth={5} />
							</g>
						)}
					</g>
				)}
			</svg>
			<StopChobi n={n} f={f} at={six} to={never + 20} label="ОШИБКА №6 · ПО ЗЕРНУ" />
			<Chip f={f} at={D0 + 6} x={420} y={300} text="СТРАХОВОЧНЫЙ ТРОС" color="#f08a2a" size={40} />
			<Chip f={f} at={P1 + 4} x={1620} y={320} text="НАПАРНИК СНАРУЖИ" color="#3aa86a" size={36} />
		</AbsoluteFill>
	);
};

// ============================================================ 60. the earthquake: the building falls =====
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const n = 60;
	const quake = w(n, 'землетрясения') - 8;
	const shake = (Math.sin(f * 0.9) * 9 + Math.sin(f * 1.4 + 1) * 4) * interpolate(f, [0, len(n)], [1, 0.3], clamp);
	const fall = interpolate(f, [quake, len(n)], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill style={{background: '#9fb8d0'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={860} width={1920} height={220} fill="#6a6a70" />
				<g transform={`translate(${shake},0)`}>
					{[0, 1, 2, 3, 4].map((k) => (
						<g key={k} transform={`translate(${760 + (k % 2) * fall * 60},${760 - k * 140 + fall * k * 90}) rotate(${fall * (k % 2 ? 8 : -6) * k})`}>
							<rect x={-220} y={-140} width={440} height={140} fill="#c9b8a0" stroke={INK} strokeWidth={6} />
							{[-140, -40, 60, 160].map((x) => (
								<rect key={x} x={x - 30} y={-110} width={60} height={60} fill="#6a8aa8" stroke={INK} strokeWidth={4} />
							))}
						</g>
					))}
				</g>
				{fall > 0.3 &&
					Array.from({length: 16}).map((_, i) => (
						<circle key={i} cx={560 + ((i * 97) % 500)} cy={860 - ((f * 3 + i * 31) % 300)} r={20 + (i % 3) * 14} fill="#b8b0a4" opacity={0.6} />
					))}
			</svg>
			<Plaque f={f} at={quake} x={1420} y={300} text="ЗЕМЛЕТРЯСЕНИЕ" color={RED} size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 61. under the rubble he screams again — and the lighter again! =====
export const S61: React.FC = () => {
	const f = useCurrentFrame();
	const n = 61;
	const scream = w(n, 'кричит') - 6;
	const light = w(n, 'зажигалка') - 8;
	const lit = f >= light + 4 ? pop(f, light + 4, 6) : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#3a3a40">
				<Rubble />
				<rect x={620} y={360} width={680} height={430} fill="#141418" />
				{lit > 0 && <ellipse cx={1030} cy={560} rx={380} ry={240} fill="#ffcf7a" opacity={0.25 * lit} />}
				<g transform="translate(1260,640) rotate(-90)">
					<You x={0} y={0} s={0.52} f={f} face={{eyes: 'wide', brows: 'raised', mouth: f >= scream && f < light ? 'o' : 'open', look: [0, -0.6]}} armR={f >= light ? arm([110, -400], [104, -480], {fist: true, item: <Lighter f={f} lit={lit} s={0.7} />, itemAng: 90}) : 'down'} />
				</g>
				<path d="M 600,380 L 1320,330 L 1320,380 L 600,420 Z" fill="#8a8a8f" stroke={INK} strokeWidth={6} />
				{f >= scream && f < light && <Waves f={f} x={1000} y={560} dir={-90} color="#fff" damp={0.6} />}
			</Stage16>
			<Vig k={0.55} />
			<Chip f={f} at={scream + 2} x={560} y={180} text="СНОВА КРИЧИТ" color={RED} size={46} />
			<Chip f={f} at={light + 2} x={1360} y={180} text="И СНОВА ЗАЖИГАЛКА!" color={RED} size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 62. «Гога, стоп! Здесь может течь газ»: mistake seven =====
export const S62: React.FC = () => {
	const f = useCurrentFrame();
	const n = 62;
	const gas = w(n, 'газ') - 6;
	const spark = w(n, 'искра') - 6;
	const seven = w(n, 'ошибка') - 4;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.6) brightness(0.85)'}}>
				<Stage16 bg="#3a3a40">
					<Rubble />
					<rect x={620} y={360} width={680} height={430} fill="#141418" />
					<ellipse cx={1030} cy={560} rx={380} ry={240} fill="#ffcf7a" opacity={0.25} />
					<g transform="translate(1260,640) rotate(-90)">
						<You x={0} y={0} s={0.52} f={8} face={{eyes: 'wide', brows: 'raised', mouth: 'open', look: [0, -0.6]}} armR={arm([110, -400], [104, -480], {fist: true, item: <Lighter f={8} lit={1} s={0.7} />, itemAng: 90})} />
					</g>
					<path d="M 600,380 L 1320,330 L 1320,380 L 600,420 Z" fill="#8a8a8f" stroke={INK} strokeWidth={6} />
					{/* a broken gas pipe */}
					<rect x={300} y={480} width={330} height={44} fill="#e3b64a" stroke={INK} strokeWidth={6} />
				</Stage16>
			</AbsoluteFill>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{f >= gas &&
					[0, 1, 2, 3].map((k) => {
						const t = ((f - gas) / 30 + k / 4) % 1;
						return <circle key={k} cx={640 + t * 300} cy={500 - Math.sin(t * 3) * 40} r={30 + t * 40} fill="#b8e070" opacity={(1 - t) * 0.55} />;
					})}
				{f >= spark && (
					<g transform={`translate(470,400) scale(${pop(f, spark, 9)})`}>
						<circle r={80} fill="#fff" stroke={RED} strokeWidth={10} />
						<path d="M 0,-50 L 14,-14 L 50,0 L 14,14 L 0,50 L -14,14 L -50,0 L -14,-14 Z" fill="#ff8a2a" />
						<path d="M -56,-56 L 56,56" stroke={RED} strokeWidth={12} strokeLinecap="round" />
					</g>
				)}
			</svg>
			<Chip f={f} at={gas + 2} x={470} y={250} text="ГАЗ!" color="#7aa82a" size={56} />
			<Chip f={f} at={spark + 4} x={470} y={560} text="ИСКРА = ВЗРЫВ" color={RED} size={44} />
			<StopChobi n={n} f={f} at={0} to={len(n) - 20} label="ОШИБКА №7 · ОГОНЬ" labelAt={seven} />
		</AbsoluteFill>
	);
};

export const ARMTO = armTo;
