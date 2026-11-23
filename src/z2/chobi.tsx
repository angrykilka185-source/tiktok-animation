// Чоби's own scenes in «Каково это — умереть от жажды»: the intro; you are 60 % water; the thirst that comes late, the
// salty blood, the order to the kidneys, the dark urine; the broken air conditioner, the rising temperature, the dizzy
// spell; the myths (urine, sea water, the cactus); the water that kills (the kidneys, the swelling brain, sip by sip);
// drink before you are thirsty, the colour chart; first aid; the head, the question, «подпишись».
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, pop} from '../anim';
import {Choby, type ArmSpec} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {armAt, ease, EAT_BITE, EAT_REST, FAN, HEART_PT, HX, INK, len, Line, mirror, Page, PRESENT, px, py, S, SHRUG, Stand, Title, useHost, FEET} from './chobiKit';
import {Plaque, RED, YEL} from './kit';
import {Runner} from './kit';
import {w} from './voice';

const BLUE = '#2f86e0';
const GREEN = '#3aa86a';
const ORANGE = '#f08a2a';
const URINE = ['#fbf3c4', '#f4e07a', '#e4b23a', '#b8741e'];

// ------------------------------------------------------------------ drawings for the white page -----
const Drop: React.FC<{x: number; y: number; r?: number; color?: string; o?: number}> = ({x, y, r = 16, color = '#5fb0f0', o = 1}) => (
	<path d={`M ${x},${y - r * 1.6} C ${x + r * 0.9},${y - r * 0.4} ${x + r},${y + r * 0.2} ${x},${y + r} C ${x - r},${y + r * 0.2} ${x - r * 0.9},${y - r * 0.4} ${x},${y - r * 1.6} Z`} fill={color} opacity={o} stroke={INK} strokeWidth={3} />
);
// a stamp «МИФ» (HTML)
const Stamp: React.FC<{f: number; at: number; x: number; y: number; text?: string; rot?: number; size?: number}> = ({f, at, x, y, text = 'МИФ', rot = -12, size = 84}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${pop(f, at, 9)})`, border: `10px solid ${RED}`, color: RED, background: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: '4px 30px 8px', fontFamily: HEAVY, fontWeight: 900, fontSize: size, letterSpacing: 4}}>{text}</div>
	);
// the kidneys inside him (his own units): two beans by the spine
const Kidneys: React.FC<{glow?: number}> = ({glow = 0}) => (
	<g>
		{glow > 0 && [-1, 1].map((sd) => <circle key={sd} cx={sd * 54} cy={-238} r={52} fill="#ff8a7a" opacity={0.35 * glow} />)}
		{[-1, 1].map((sd) => (
			<path key={sd} d={`M ${sd * 30},${-262} C ${sd * 30},${-296} ${sd * 84},${-300} ${sd * 84},${-250} C ${sd * 84},${-200} ${sd * 30},${-196} ${sd * 34},${-226} C ${sd * 40},${-238} ${sd * 30},${-244} ${sd * 30},${-262} Z`} fill="#b8463c" stroke="#7a2420" strokeWidth={4} />
		))}
	</g>
);
// test tubes with the colours of urine (light → dark), the levels go down
const Tubes: React.FC<{f: number; at: number; mark?: number; levels?: number[]}> = ({f, at, mark = -1, levels = [0.9, 0.75, 0.55, 0.35]}) => (
	<g>
		{URINE.map((c, i) => {
			const t0 = at + i * 5;
			if (f < t0) return null;
			const p = pop(f, t0, 11);
			return (
				<g key={i} transform={`translate(${i * 150},0) scale(${p})`}>
					{mark === i && <rect x={-62} y={-300} width={124} height={390} rx={30} fill="none" stroke={i === 0 ? GREEN : RED} strokeWidth={10} />}
					<rect x={-40} y={-270} width={80} height={330} rx={40} fill="#f4f8fb" stroke={INK} strokeWidth={7} />
					<rect x={-32} y={-262 + 322 * (1 - levels[i])} width={64} height={322 * levels[i]} rx={32} fill={c} />
					<rect x={-52} y={-280} width={104} height={20} rx={8} fill="#c8d2da" stroke={INK} strokeWidth={5} />
				</g>
			);
		})}
	</g>
);
const Bottle: React.FC<{s?: number; level?: number}> = ({s = 1, level = 0.8}) => (
	<g transform={`scale(${s})`}>
		<rect x={-26} y={-120} width={52} height={120} rx={14} fill="#eaf5ff" stroke="#2a6aa8" strokeWidth={5} />
		<rect x={-21} y={-115 + 110 * (1 - level)} width={42} height={110 * level} rx={10} fill="#7fc4ff" />
		<rect x={-14} y={-140} width={28} height={22} rx={5} fill={BLUE} stroke="#2a6aa8" strokeWidth={4} />
	</g>
);
const Cup: React.FC<{c?: string}> = ({c = '#7fc4ff'}) => (
	<g>
		<path d="M -34,-56 L 34,-56 L 26,20 L -26,20 Z" fill="#f4f8fb" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
		<path d="M -30,-36 L 30,-36 L 25,14 L -25,14 Z" fill={c} />
	</g>
);
// a human outline (front), local height ≈ 600, the feet at 0
const OUTLINE = 'M 0,-600 C 44,-600 60,-570 60,-530 C 60,-494 44,-470 26,-462 L 26,-446 C 90,-440 120,-420 124,-360 L 136,-200 C 138,-176 112,-170 106,-196 L 92,-330 L 86,-330 L 86,-200 L 74,0 L 22,0 L 10,-180 L -10,-180 L -22,0 L -74,0 L -86,-200 L -86,-330 L -92,-330 L -106,-196 C -112,-170 -138,-176 -136,-200 L -124,-360 C -120,-420 -90,-440 -26,-446 L -26,-462 C -44,-470 -60,-494 -60,-530 C -60,-570 -44,-600 0,-600 Z';
const Body: React.FC<{id: string; level?: number; f?: number; color?: string; stroke?: string}> = ({id, level = 0, f = 0, color = '#7fc4ff', stroke = INK}) => {
	const top = -600 * level;
	return (
		<g>
			<defs>
				<clipPath id={id}>
					<path d={OUTLINE} />
				</clipPath>
			</defs>
			<path d={OUTLINE} fill="#f4f8fb" />
			{level > 0 && (
				<g clipPath={`url(#${id})`}>
					<path d={`M -200,${top} Q -150,${top - 14 * Math.sin(f / 6)} -100,${top} T 0,${top} T 100,${top} T 200,${top} L 200,40 L -200,40 Z`} fill={color} />
				</g>
			)}
			<path d={OUTLINE} fill="none" stroke={stroke} strokeWidth={8} strokeLinejoin="round" />
		</g>
	);
};
// the «air conditioner» (local centre)
const AC: React.FC<{f: number; on: number; broken: number}> = ({f, on, broken}) => (
	<g transform={`rotate(${broken * 8 + (broken > 0 && broken < 1 ? Math.sin(f * 2) * 3 : 0)})`}>
		<rect x={-170} y={-80} width={340} height={160} rx={26} fill="#f4f8fc" stroke={INK} strokeWidth={8} />
		{[-44, -14, 16, 46].map((yy) => (
			<line key={yy} x1={-136} y1={yy} x2={136} y2={yy} stroke="#9aa8b8" strokeWidth={6} />
		))}
		<circle cx={128} cy={-52} r={11} fill={broken > 0.3 ? RED : GREEN} />
		{on > 0 &&
			[0, 1, 2].map((k) => {
				const t = ((f + k * 8) % 24) / 24;
				return <path key={k} d={`M ${-120 + k * 110},${100 + t * 90} q -16,30 0,60`} stroke="#7fc4ff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={on * (1 - t)} />;
			})}
		{broken > 0 &&
			[0, 1, 2].map((k) => {
				const t = ((f + k * 11) % 33) / 33;
				return <circle key={k} cx={60 + k * 30 + t * 20} cy={-100 - t * 120} r={16 + t * 26} fill="#8a8a92" opacity={broken * (1 - t) * 0.7} />;
			})}
	</g>
);
const Thermo: React.FC<{v: number}> = ({v}) => {
	const t = Math.max(0, Math.min(1, (v - 35) / 6));
	const col = v >= 39 ? RED : v >= 37.5 ? ORANGE : BLUE;
	return (
		<g>
			<rect x={-34} y={-440} width={68} height={420} rx={34} fill="#f4f8fb" stroke={INK} strokeWidth={8} />
			<rect x={-18} y={-40 - 380 * t} width={36} height={380 * t + 20} rx={18} fill={col} />
			<circle cx={0} cy={0} r={60} fill={col} stroke={INK} strokeWidth={8} />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<line key={i} x1={34} y1={-40 - (380 * i) / 6} x2={60} y2={-40 - (380 * i) / 6} stroke={INK} strokeWidth={6} />
			))}
		</g>
	);
};
// a gauge with a needle (t 0…1)
const Gauge: React.FC<{t: number; label: string}> = ({t, label}) => (
	<g>
		<path d="M -170,0 A 170,170 0 0 1 170,0" fill="none" stroke="#e8eef4" strokeWidth={40} />
		<path d="M -170,0 A 170,170 0 0 1 0,-170" fill="none" stroke="#9fd8ff" strokeWidth={40} />
		<path d="M 0,-170 A 170,170 0 0 1 170,0" fill="none" stroke="#ffb0a0" strokeWidth={40} />
		<line x1={0} y1={0} x2={0} y2={-150} stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${-80 + t * 160})`} />
		<circle r={18} fill={INK} />
		<text x={0} y={60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			{label}
		</text>
	</g>
);
const Clapper: React.FC = () => (
	<g>
		<rect x={-130} y={-40} width={260} height={170} rx={12} fill={INK} />
		<g transform="rotate(-14 -130 -40)">
			<rect x={-130} y={-86} width={260} height={46} rx={6} fill={INK} />
			{[0, 1, 2, 3, 4].map((i) => (
				<path key={i} d={`M ${-110 + i * 56},-86 L ${-80 + i * 56},-86 L ${-104 + i * 56},-40 L ${-134 + i * 56},-40 Z`} fill="#fff" />
			))}
		</g>
		<rect x={-110} y={0} width={220} height={10} fill="#fff" opacity={0.5} />
		<rect x={-110} y={40} width={220} height={10} fill="#fff" opacity={0.5} />
	</g>
);
const Cactus: React.FC<{cut?: number}> = ({cut = 0}) => (
	<g>
		<ellipse cx={0} cy={6} rx={170} ry={22} fill="#000" opacity={0.08} />
		<path d="M -50,0 L -50,-420 C -50,-470 50,-470 50,-420 L 50,0 Z" fill="#4aa85a" stroke={INK} strokeWidth={7} />
		<path d="M -50,-200 L -110,-200 C -140,-200 -140,-230 -140,-250 L -140,-320 C -140,-350 -100,-350 -100,-320 L -100,-240 L -50,-240" fill="#4aa85a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<path d="M 50,-260 L 110,-260 C 140,-260 140,-290 140,-310 L 140,-370 C 140,-400 100,-400 100,-370 L 100,-300 L 50,-300" fill="#4aa85a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		{[-24, 0, 24].map((x) => (
			<line key={x} x1={x} y1={-430} x2={x} y2={-10} stroke="#3a8a4a" strokeWidth={5} />
		))}
		{cut > 0 && <path d="M -70,-330 L 70,-290" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeDasharray="12 10" opacity={Math.min(1, cut * 2)} />}
	</g>
);

// ============================================================ 4. «Сегодня ты узнаешь, каково это — умереть от жажды…» =====
const LOSS: [string, string][] = [
	['1%', '#5fb0f0'],
	['4%', '#f0a030'],
	['7%', '#f06a2a'],
	['10%', RED],
];
export const C04: React.FC = () => {
	const n = 4;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const t = w(n, 'каково') - 4;
	const chips = w(n, 'час') - 4;
	const armR = armAt(1, f, [[0, 'wave'], [t - 8, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={t} x={1345} y={330} size={74} text="КАКОВО ЭТО —" />
					<Title f={f} at={t + 6} x={1345} y={430} size={74} color="#e8702a" text="УМЕРЕТЬ ОТ ЖАЖДЫ" />
					{LOSS.map(([v, c], i) =>
						f < chips + i * 7 ? null : (
							<div key={v} style={{position: 'absolute', left: 1345 + (i - 1.5) * 200, top: 570, transform: `translate(-50%,-50%) scale(${pop(f, chips + i * 7, 10)})`, background: c, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, padding: '10px 22px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8}}>
								−{v}
							</div>
						),
					)}
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < t ? [0.1, 0.1] : [0.75, -0.2]} armR={armR} armL="hip" sweat={0.4} />
			</Stand>
		</Page>
	);
};

// ============================================================ 5. «А в конце — главное: как этого не допустить. Поехали.» =====
const Umbrella: React.FC = () => (
	<g>
		<path d="M -90,0 A 90,70 0 0 1 90,0 Z" fill={RED} stroke={INK} strokeWidth={6} />
		<path d="M -30,0 A 30,70 0 0 1 30,0" fill="none" stroke={INK} strokeWidth={4} />
		<line x1={0} y1={0} x2={0} y2={90} stroke={INK} strokeWidth={7} strokeLinecap="round" />
	</g>
);
const MoonIco: React.FC = () => (
	<g>
		<circle r={66} fill="#ffe07a" stroke={INK} strokeWidth={6} />
		<circle cx={30} cy={-16} r={60} fill="#fff" />
	</g>
);
export const C05: React.FC = () => {
	const n = 5;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const main = w(n, 'главное') - 6;
	const avoid = w(n, 'допустить') - 6;
	const go = w(n, 'поехали') - 6;
	const armR = armAt(1, f, [[0, PRESENT], [main, 'point'], [go, PRESENT]], g);
	const armL = armAt(-1, f, [[0, 'hip'], [go, 'wave']], g);
	const icons = [<Umbrella key="u" />, <MoonIco key="m" />, <g key="b" transform="translate(0,60)"><Bottle s={1.3} /></g>];
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<Title f={f} at={main} x={1345} y={250} size={64} text="КАК ЭТОГО НЕ ДОПУСТИТЬ" />
					<Title f={f} at={go} x={1345} y={720} size={110} color="#e8702a" text="ПОЕХАЛИ!" />
				</>
			}
		>
			{icons.map((ic, i) => {
				const at = avoid + i * 6;
				return f >= at ? (
					<g key={i} transform={`translate(${1065 + i * 280},460) scale(${pop(f, at, 11)})`}>
						<circle r={110} fill="#fff8ec" stroke={INK} strokeWidth={6} />
						<g transform="scale(0.85)">{ic}</g>
					</g>
				) : null;
			})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < go ? [0.7, -0.15] : [0.1, 0.1]} armR={armR} armL={armL} sweat={0.4} />
			</Stand>
		</Page>
	);
};

// ============================================================ 12. you are 60 % water, about 40 litres =====
export const C12: React.FC = () => {
	const n = 12;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const sixty = w(n, 'шестьдесят') - 8;
	const forty = w(n, 'сорока') - 8;
	const level = ease(f, sixty, sixty + 30, 0, 0.6);
	const armR = armAt(1, f, [[0, 'down'], [sixty - 4, 'pointer']], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={sixty + 20} x={1110} y={190} text="60% — ВОДА" color={BLUE} size={52} />
					<Plaque f={f} at={forty + 10} x={1610} y={190} text="≈ 40 ЛИТРОВ" color={BLUE} size={52} />
				</>
			}
		>
			<g transform="translate(1110,800) scale(0.95)">
				<Body id="c12b" level={level} f={g} />
			</g>
			{f >= forty &&
				Array.from({length: 40}).map((_, i) => {
					const at = forty + i;
					if (f < at) return null;
					const cx = 1470 + (i % 5) * 70;
					const cy = 360 + Math.floor(i / 5) * 64;
					return (
						<g key={i} transform={`translate(${cx},${cy + 60}) scale(${0.5 * pop(f, at, 12)})`}>
							<Bottle />
						</g>
					);
				})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armR} pointerAng={72} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 13. the blood is 4/5 water, the brain 3/4 =====
export const C13: React.FC = () => {
	const n = 13;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const blood = w(n, 'кровь') - 6;
	const brainAt = w(n, 'мозг') - 6;
	const beat = Math.max(0, Math.sin((g / 23) * Math.PI * 2)) ** 3;
	const vess = ease(f, blood, blood + 16, 0, 1);
	const brain = ease(f, brainAt, brainAt + 10, 0, 0.9);
	const armR = armAt(1, f, [[0, 'pointer'], [blood, HEART_PT], [brainAt, 'point']], g);
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<Plaque f={f} at={blood + 6} x={1300} y={360} text="КРОВЬ ≈ 80% ВОДЫ" color={RED} size={52} />
					<Plaque f={f} at={brainAt + 6} x={1300} y={520} text="МОЗГ ≈ 75% ВОДЫ" color="#f39aa8" size={52} />
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} heart={vess > 0.01 ? {beat, size: 1.1} : undefined} heartOver vessels={vess > 0.01 ? {warm: 1, reach: vess} : undefined} brain={brain} capAt={brain > 0.01 ? [0, -130 * (brain / 0.9), -6 * (brain / 0.9)] : undefined} look={f < brainAt ? [-0.2, 0.7] : [0.2, -0.9]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 14. you lose it all the time: sweat, skin, breath =====
const DLine: React.FC<{f: number; at: number; x: number; y: number; text: string}> = ({f, at, x, y, text}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(0,-50%) scale(${pop(f, at, 12)})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22, fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: INK, whiteSpace: 'nowrap'}}>
			<svg width={56} height={72} viewBox="-28 -40 56 72">
				<path d="M 0,-36 C 18,-12 26,2 26,12 A 26,24 0 0 1 -26,12 C -26,2 -18,-12 0,-36 Z" fill="#5fb0f0" stroke={INK} strokeWidth={4} />
			</svg>
			{text}
		</div>
	);
export const C14: React.FC = () => {
	const n = 14;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const sweatAt = w(n, 'потом') - 6;
	const skin = w(n, 'кожу') - 6;
	const breath = w(n, 'выдохом') - 8;
	const armR = armAt(1, f, [[0, 'point'], [sweatAt, 'down']], g);
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<Title f={f} at={2} x={1300} y={220} size={56} text="ВОДА УХОДИТ ВСЁ ВРЕМЯ:" />
					<DLine f={f} at={sweatAt} x={1000} y={360} text="С ПОТОМ" />
					<DLine f={f} at={skin} x={1000} y={480} text="ЧЕРЕЗ КОЖУ" />
					<DLine f={f} at={breath} x={1000} y={600} text="С КАЖДЫМ ВЫДОХОМ" />
				</>
			}
		>
			{f >= breath &&
				[0, 1, 2].map((i) => {
					const t = ((f - breath + i * 10) % 30) / 30;
					return <circle key={i} cx={px(70) + t * 90} cy={py(-440) - t * 40} r={14 + t * 18} fill="#bfe4ff" opacity={(1 - t) * 0.85} />;
				})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} sweat={f >= sweatAt ? 1 : 0} look={[0.7, -0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 16. thirst comes late =====
export const C16: React.FC = () => {
	const n = 16;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const late = w(n, 'опаздывает') - 8;
	const want = w(n, 'хочется') - 6;
	// the chart: x 960…1760, y 700 (zero) … 300
	const X0 = 960;
	const X1 = 1760;
	const Y0 = 690;
	const draw = ease(f, 2, late + 10, 0, 1);
	const thirstX = X0 + (X1 - X0) * 0.38;
	const loss = (x: number) => Y0 - ((x - X0) / (X1 - X0)) * 330;
	const thirst = (x: number) => Y0 - Math.max(0, (x - thirstX) / (X1 - thirstX)) * 300;
	const ptsL: string[] = [];
	const ptsT: string[] = [];
	for (let x = X0; x <= X0 + (X1 - X0) * draw; x += 10) {
		ptsL.push(`${x},${loss(x).toFixed(1)}`);
		if (f >= late) ptsT.push(`${x},${thirst(x).toFixed(1)}`);
	}
	const armR = armAt(1, f, [[0, 'down'], [4, 'pointer']], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Title f={f} at={2} x={1360} y={230} size={56} text="ЖАЖДА ОПАЗДЫВАЕТ" />
					<Plaque f={f} at={want + 4} x={1360} y={790} text="ХОЧЕТСЯ ПИТЬ = УЖЕ −1–2%" color={RED} size={40} />
				</>
			}
		>
			<rect x={900} y={190} width={920} height={560} rx={26} fill="#f6f8fa" stroke="#d8dee6" strokeWidth={6} />
			<line x1={X0} y1={Y0} x2={X1 + 20} y2={Y0} stroke={INK} strokeWidth={6} />
			<line x1={X0} y1={Y0} x2={X0} y2={330} stroke={INK} strokeWidth={6} />
			<text x={X1} y={Y0 + 44} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={28} fill="#6a7280">
				ВРЕМЯ →
			</text>
			<polyline points={ptsL.join(' ')} fill="none" stroke={BLUE} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
			{ptsT.length > 1 && <polyline points={ptsT.join(' ')} fill="none" stroke={RED} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />}
			{draw > 0.3 && (
				<text x={1330} y={loss(1330) - 26} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={BLUE}>
					ПОТЕРЯ ВОДЫ
				</text>
			)}
			{f >= late + 6 && (
				<g opacity={pop(f, late + 6, 12)}>
					<text x={1500} y={thirst(1500) + 56} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={RED}>
						ЖАЖДА
					</text>
					<path d={`M ${X0 + 10},${Y0 + 22} L ${thirstX - 10},${Y0 + 22} M ${thirstX - 26},${Y0 + 10} L ${thirstX - 10},${Y0 + 22} L ${thirstX - 26},${Y0 + 34}`} stroke={ORANGE} strokeWidth={7} fill="none" strokeLinecap="round" />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, -0.1]} armR={armR} pointerAng={76} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 17. the brain checks how salty the blood is =====
export const C17: React.FC = () => {
	const n = 17;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const brainAt = w(n, 'мозг') - 6;
	const salty = w(n, 'солонее') - 10;
	const brain = ease(f, brainAt, brainAt + 10, 0, 0.9);
	const needle = ease(f, salty, salty + 24, 0.3, 0.88);
	const crystals = Math.round(ease(f, salty, salty + 24, 3, 12));
	const armR = armAt(1, f, [[0, 'pointer'], [brainAt, 'point'], [salty - 10, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={brainAt + 8} x={1360} y={200} text="МОЗГ ПРОВЕРЯЕТ СОЛЬ В КРОВИ" color="#f39aa8" size={44} />
					<Plaque f={f} at={salty + 10} x={1360} y={780} text="КРОВЬ СОЛОНЕЕ" color={RED} size={48} />
				</>
			}
		>
			{f >= brainAt + 4 && (
				<g transform={`translate(1150,560) scale(${pop(f, brainAt + 4, 12)})`}>
					<Gauge t={needle} label="СОЛЬ В КРОВИ" />
				</g>
			)}
			{f >= brainAt + 10 && (
				<g transform={`translate(1600,520) scale(${pop(f, brainAt + 10, 12)})`}>
					<path d="M 0,-150 C 80,-50 110,10 110,60 A 110,100 0 0 1 -110,60 C -110,10 -80,-50 0,-150 Z" fill="#d8323a" stroke={INK} strokeWidth={7} />
					{Array.from({length: crystals}).map((_, i) => (
						<rect key={i} x={-60 + ((i * 37) % 120)} y={-30 + ((i * 53) % 110)} width={18} height={18} fill="#fff" stroke={INK} strokeWidth={3} transform={`rotate(${i * 23} ${-51 + ((i * 37) % 120)} ${-21 + ((i * 53) % 110)})`} />
					))}
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} brain={brain} capAt={brain > 0.01 ? [0, -130 * (brain / 0.9), -6 * (brain / 0.9)] : undefined} look={f < salty ? [0.2, -0.9] : [0.8, -0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 18. thirst on, an order to the kidneys =====
export const C18: React.FC = () => {
	const n = 18;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const on = w(n, 'включает') - 6;
	const kid = w(n, 'почкам') - 8;
	const order = w(n, 'беречь') - 6;
	const fly = ease(f, kid, kid + 26, 0, 1);
	// the letter flies from his head round to his kidneys
	const lx = px(0) + Math.sin(fly * Math.PI) * 260;
	const ly = py(-650) + (py(-250) - py(-650)) * fly;
	const armR = armAt(1, f, [[0, 'point'], [kid, 'down']], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={order} x={1350} y={560} text="ПРИКАЗ: БЕРЕЧЬ КАЖДУЮ КАПЛЮ" color={BLUE} size={44} />
				</>
			}
		>
			{f >= on && (
				<g transform={`translate(1350,320) scale(${pop(f, on, 11)})`}>
					<rect x={-200} y={-70} width={400} height={140} rx={70} fill="#f4f8fb" stroke={INK} strokeWidth={7} />
					<rect x={-180} y={-50} width={360} height={100} rx={50} fill={ease(f, on + 6, on + 14, 0, 1) > 0.5 ? RED : '#c8d2da'} />
					<circle cx={ease(f, on + 6, on + 14, -130, 130)} cy={0} r={44} fill="#fff" stroke={INK} strokeWidth={5} />
					<text x={0} y={120} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={INK}>
						ЖАЖДА: ВКЛ
					</text>
				</g>
			)}
			{f >= kid && fly < 1 && (
				<g transform={`translate(${lx},${ly}) rotate(${Math.sin(fly * 6) * 8})`}>
					<rect x={-44} y={-30} width={88} height={60} rx={6} fill="#fff8ec" stroke={INK} strokeWidth={5} />
					<path d="M -44,-30 L 0,6 L 44,-30" fill="none" stroke={INK} strokeWidth={5} />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} brain={f < kid + 10 ? 0.8 : 0.3} capAt={[0, -110, -5]} inner={f >= kid ? <Kidneys glow={ease(f, kid + 20, kid + 30, 0, 1)} /> : undefined} look={f < kid ? [0.6, -0.4] : [0.2, 0.8]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 19. the kidneys obey; the urine gets dark =====
export const C19: React.FC = () => {
	const n = 19;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const tubes = w(n, 'моча') - 8;
	const conc = w(n, 'концентрированная') - 6;
	const armR = armAt(1, f, [[0, 'down'], [tubes - 4, 'pointer']], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={2} x={1300} y={200} text="ПОЧКИ БЕРЕГУТ ВОДУ" color={BLUE} size={48} />
					<Plaque f={f} at={conc} x={1300} y={790} text="МАЛО — И ОЧЕНЬ ТЁМНАЯ" color="#b8741e" size={44} />
				</>
			}
		>
			<g transform="translate(1075,640)">
				<Tubes f={f} at={tubes} />
			</g>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} capAt={[0, -110, -5]} brain={0.3} inner={<Kidneys glow={0.6 + 0.4 * Math.sin(g / 6)} />} look={[0.8, 0]} armR={armR} pointerAng={80} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 35. less and less sweat: the air conditioner breaks =====
export const C35: React.FC = () => {
	const n = 35;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const brk = w(n, 'ломается') - 8;
	const sweat = ease(f, 4, brk, 1, 0.1);
	const broken = ease(f, brk, brk + 16, 0, 1);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={4} x={1350} y={200} text="ПОТА ВСЁ МЕНЬШЕ" color="#5fb0f0" size={50} />
					<Plaque f={f} at={brk + 10} x={1350} y={760} text="КОНДИЦИОНЕР СЛОМАН" color={RED} size={48} />
				</>
			}
		>
			<g transform="translate(1350,440)">
				<AC f={g} on={1 - broken} broken={broken} />
			</g>
			{broken > 0.5 && (
				<g transform={`translate(1350,440) scale(${pop(f, brk + 8, 10)})`} stroke={RED} strokeWidth={18} strokeLinecap="round">
					<line x1={-120} y1={-120} x2={120} y2={120} />
					<line x1={120} y1={-120} x2={-120} y2={120} />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} sweat={sweat} look={[0.8, -0.2]} armR="down" armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 36. 38, 39 =====
export const C36: React.FC = () => {
	const n = 36;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const a38 = w(n, 'восемь') - 6;
	const a39 = w(n, 'девять') - 6;
	const v = f < a38 ? 36.6 + ease(f, 0, a38, 0, 1.2) : f < a39 ? 37.8 + ease(f, a38, a38 + 12, 0, 0.2) : 38 + ease(f, a39, a39 + 14, 0, 1);
	const flush = ease(f, a38, a39 + 10, 0.3, 1);
	const fan: ArmSpec = {...FAN, hang: 200 + Math.sin(g / 2.4) * 28};
	const armR = armAt(1, f, [[0, 'down'], [a38, fan]], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Title f={f} at={a38} x={1600} y={420} size={92} color={ORANGE} text="38°" />
					<Title f={f} at={a39} x={1600} y={560} size={110} color={RED} text="39°" />
				</>
			}
		>
			<defs>
				<radialGradient id="c36glow">
					<stop offset="0%" stopColor="#ff5a4a" stopOpacity={0.4} />
					<stop offset="100%" stopColor="#ff5a4a" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={HX} cy={py(-390)} rx={330} ry={430} fill="url(#c36glow)" opacity={flush} />
			<g transform="translate(1250,720)">
				<Thermo v={v} />
			</g>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.6, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 37. sick, dizzy, the legs give way, cramps =====
export const C37: React.FC = () => {
	const n = 37;
	const {f, g, k, jaw, blink, b} = useHost(n);
	const sick = w(n, 'тошнит') - 4;
	const dizzy = w(n, 'кружится') - 4;
	const legs = w(n, 'ноги') - 4;
	const cramp = w(n, 'судорогой') - 6;
	const wob = f >= dizzy ? Math.sin(g / 7) * 6 : 0;
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Line f={f} at={sick + 2} x={1060} y={300} ok={false} size={50} text="ТОШНИТ" />
					<Line f={f} at={dizzy + 2} x={1060} y={420} ok={false} size={50} text="КРУЖИТСЯ ГОЛОВА" />
					<Line f={f} at={legs + 2} x={1060} y={540} ok={false} size={50} text="НОГИ ВАТНЫЕ" />
					<Line f={f} at={cramp + 2} x={1060} y={660} ok={false} size={50} text="СУДОРОГИ" />
				</>
			}
		>
			{/* stars going round his head */}
			{f >= dizzy &&
				[0, 1, 2, 3].map((i) => {
					const a = g / 9 + (i * Math.PI) / 2;
					const x = px(0) + Math.cos(a) * 180;
					const y = py(-760) + Math.sin(a) * 40;
					return <path key={i} d={`M ${x},${y - 20} L ${x + 6},${y - 6} L ${x + 20},${y} L ${x + 6},${y + 6} L ${x},${y + 20} L ${x - 6},${y + 6} L ${x - 20},${y} L ${x - 6},${y - 6} Z`} fill={YEL} stroke={INK} strokeWidth={3} />;
				})}
			{f >= sick && (
				<g transform={`translate(${px(170)},${py(-470)}) scale(${pop(f, sick, 11)})`}>
					<circle r={44} fill="#9ad86a" stroke={INK} strokeWidth={5} />
					<path d="M -20,-6 q 10,-14 20,0 t 20,0 M -20,14 q 10,-14 20,0 t 20,0" stroke="#3a7a2a" strokeWidth={5} fill="none" strokeLinecap="round" />
				</g>
			)}
			{f >= cramp && (
				<g transform={`translate(${px(48)},${py(-110)}) scale(${pop(f, cramp, 10) * 0.55})`}>
					<path d="M 14,-90 L -46,10 L -6,10 L -22,90 L 46,-14 L 4,-14 L 26,-90 Z" fill={YEL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
				</g>
			)}
			<Stand k={k} b={b} lean={wob}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={Math.max(blink, f >= dizzy ? 0.35 : 0)} tilt={wob * 1.5} f={g} look={[Math.sin(g / 5) * 0.6, 0.2]} armR="down" armL="down" />
			</Stand>
		</Page>
	);
};

// ============================================================ 56. the myth: drinking urine =====
export const C56: React.FC = () => {
	const n = 56;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const films = w(n, 'фильмах') - 6;
	const no = w(n, 'помогает') - 6;
	const wag: ArmSpec = {el: [112, -330], ha: [116, -420], hang: 180 + Math.sin(g / 2.5) * 22, finger: true};
	const armR = armAt(1, f, [[0, 'down'], [films, PRESENT], [no - 6, wag]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			snow={false}
			html={
				<>
					<Plaque f={f} at={films + 6} x={1350} y={680} text="«В ФИЛЬМАХ ПЬЮТ — ЧТОБЫ ВЫЖИТЬ»" color={YEL} size={40} />
					<Stamp f={f} at={no} x={1350} y={430} />
				</>
			}
		>
			{f >= films && (
				<g transform={`translate(1350,430) scale(${pop(f, films, 11) * 1.2})`}>
					<Clapper />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < no ? [0.8, -0.1] : [0.1, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 57. salt and wastes; the stronger the thirst, the stronger it is =====
export const C57: React.FC = () => {
	const n = 57;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const salt = w(n, 'соль') - 6;
	const waste = w(n, 'отходы') - 6;
	const conc = w(n, 'концентрированнее') - 12;
	const bar = ease(f, conc, conc + 30, 0.2, 1);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={salt + 4} x={1200} y={300} text="СОЛЬ" color="#bfc8d4" size={50} />
					<Plaque f={f} at={waste + 4} x={1560} y={300} text="ОТХОДЫ" color="#8a7a6a" size={50} />
					<Plaque f={f} at={conc + 8} x={1380} y={790} text="ЧЕМ СИЛЬНЕЕ ЖАЖДА — ТЕМ ГУЩЕ" color="#b8741e" size={40} />
				</>
			}
		>
			{f >= salt && (
				<g transform={`translate(1200,450) scale(${pop(f, salt, 11)})`}>
					{Array.from({length: 7}).map((_, i) => (
						<rect key={i} x={-90 + i * 26} y={-20 + ((i * 37) % 50)} width={30} height={30} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(${i * 21} ${-75 + i * 26} ${-5 + ((i * 37) % 50)})`} />
					))}
				</g>
			)}
			{f >= waste && (
				<g transform={`translate(1560,450) scale(${pop(f, waste, 11)})`}>
					{Array.from({length: 9}).map((_, i) => (
						<circle key={i} cx={-80 + ((i * 41) % 170)} cy={-30 + ((i * 29) % 70)} r={10 + (i % 3) * 5} fill="#8a7a6a" stroke={INK} strokeWidth={3} />
					))}
				</g>
			)}
			{f >= conc && (
				<g transform="translate(1380,620)">
					<rect x={-360} y={-34} width={720} height={68} rx={34} fill="#f4f8fb" stroke={INK} strokeWidth={6} />
					<rect x={-352} y={-26} width={704 * bar} height={52} rx={26} fill={bar < 0.6 ? URINE[1] : bar < 0.85 ? URINE[2] : URINE[3]} />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} inner={<Kidneys glow={0.5 + 0.5 * Math.sin(g / 6)} />} look={[0.8, -0.1]} armR={armAt(1, f, [[0, 'down'], [salt, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 58. like sea water: the thirst gets worse =====
const CROSS: ArmSpec = {el: [96, -332], ha: [10, -396], hang: 128, fist: true};
export const C58: React.FC = () => {
	const n = 58;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const sea = w(n, 'морскую') - 6;
	const worse = w(n, 'жажда') - 6;
	const armR = armAt(1, f, [[0, 'down'], [sea - 4, CROSS]], g);
	const armL = armAt(-1, f, [[0, 'hip'], [sea - 4, mirror(CROSS)]], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={sea + 8} x={1350} y={660} text="≈ МОРСКАЯ ВОДА" color={BLUE} size={52} />
					<Plaque f={f} at={worse + 4} x={1350} y={790} text="ЖАЖДА ТОЛЬКО СИЛЬНЕЕ" color={RED} size={46} />
				</>
			}
		>
			<g transform="translate(1120,420) scale(1.8)">
				<Cup c={URINE[2]} />
			</g>
			{f >= sea && (
				<g transform={`translate(1350,410) scale(${pop(f, sea, 11)})`}>
					<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={INK}>
						≈
					</text>
				</g>
			)}
			{f >= sea + 6 && (
				<g transform={`translate(1600,400) scale(${pop(f, sea + 6, 11)})`}>
					<path d="M -120,40 Q -90,-10 -60,40 T 0,40 T 60,40 T 120,40 L 120,90 L -120,90 Z" fill="#3a8ad8" stroke={INK} strokeWidth={6} />
					<path d="M -120,0 Q -90,-50 -60,0 T 0,0 T 60,0 T 120,0" fill="none" stroke="#7fc4ff" strokeWidth={10} strokeLinecap="round" />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt + (f >= worse ? Math.sin(g / 3) * 4 : 0)} f={g} look={[0.1, 0.1]} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 59. the cactus myth =====
export const C59: React.FC = () => {
	const n = 59;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const cut = w(n, 'разрезают') - 6;
	const drink = w(n, 'пьют') - 8;
	const bitter = w(n, 'горькая') - 6;
	const vomit = w(n, 'рвоту') - 6;
	const lose = w(n, 'теряешь') - 6;
	const piece = ease(f, cut + 4, cut + 18, 0, 1);
	const armR = armAt(1, f, [[0, 'down'], [drink, EAT_REST], [drink + 10, EAT_BITE], [bitter, EAT_REST], [vomit, 'down']], g);
	const showPiece = f >= drink && f < vomit + 4;
	const disgust = f >= bitter;
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={bitter + 6} x={1500} y={200} text="ГОРЬКО · ТОШНИТ" color="#6aa84a" size={46} />
					<Stamp f={f} at={vomit + 6} x={1380} y={470} />
					<Plaque f={f} at={lose + 4} x={1380} y={790} text="ВОДЫ ЕЩЁ МЕНЬШЕ" color={RED} size={46} />
				</>
			}
		>
			<g transform="translate(1380,800)">
				<Cactus cut={ease(f, cut, cut + 6, 0, 1)} />
			</g>
			{piece > 0 && !showPiece && (
				<g transform={`translate(${1380 + piece * 60},${800 - 310 + piece * 240}) rotate(${piece * 80})`}>
					<rect x={-40} y={-26} width={80} height={52} rx={18} fill="#8ad06a" stroke={INK} strokeWidth={5} />
				</g>
			)}
			{disgust && (
				<g transform={`translate(${px(170)},${py(-470)}) scale(${pop(f, bitter, 11)})`}>
					<circle r={44} fill="#9ad86a" stroke={INK} strokeWidth={5} />
					<path d="M -20,-6 q 10,-14 20,0 t 20,0 M -20,14 q 10,-14 20,0 t 20,0" stroke="#3a7a2a" strokeWidth={5} fill="none" strokeLinecap="round" />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby
					x={HX}
					y={FEET}
					s={S}
					jaw={disgust ? 0.5 : jaw}
					blink={disgust ? Math.max(blink, 0.5) : blink}
					tilt={disgust ? -8 : tilt}
					f={g}
					outer={showPiece ? <g transform={`translate(${armR.ha[0] - 38},${armR.ha[1] - 22}) scale(1.1)`}><rect x={-40} y={-26} width={80} height={52} rx={18} fill="#8ad06a" stroke={INK} strokeWidth={5} /></g> : undefined}
					look={disgust ? [-0.6, 0.3] : [0.8, -0.1]}
					armR={armR}
					armL="hip"
				/>
			</Stand>
		</Page>
	);
};

// ============================================================ 63. the kidneys: about a litre an hour =====
const Funnel: React.FC<{f: number; flow: number; over: number}> = ({f, flow, over}) => (
	<g>
		<path d="M -150,-120 L 150,-120 L 30,40 L 30,120 L -30,120 L -30,40 Z" fill="#f4f8fb" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
		<path d={`M ${-150 + 120 * (1 - flow)},${-120 + 160 * (1 - flow)} L ${150 - 120 * (1 - flow)},${-120 + 160 * (1 - flow)} L 30,40 L 30,120 L -30,120 L -30,40 Z`} fill="#7fc4ff" opacity={0.9} />
		{flow > 0 &&
			[0, 1, 2].map((i) => {
				const t = ((f + i * 6) % 18) / 18;
				return <circle key={i} cx={0} cy={140 + t * 90} r={12} fill="#7fc4ff" opacity={1 - t} />;
			})}
		{over > 0 &&
			[-1, 1].map((sd) =>
				[0, 1].map((i) => {
					const t = ((f + i * 9 + (sd > 0 ? 4 : 0)) % 18) / 18;
					return <circle key={`${sd}${i}`} cx={sd * (150 + t * 60)} cy={-120 + t * 160} r={13} fill="#7fc4ff" opacity={over * (1 - t)} />;
				}),
			)}
	</g>
);
export const C63: React.FC = () => {
	const n = 63;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const liter = w(n, 'литр') - 6;
	const fast = w(n, 'быстрее') - 6;
	const salt = w(n, 'соли') - 8;
	const crystals = Math.round(ease(f, salt, salt + 24, 10, 2));
	const armR = armAt(1, f, [[0, 'down'], [liter - 4, 'pointer']], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			snow={false}
			html={
				<>
					<Plaque f={f} at={liter + 4} x={1150} y={200} text="ПОЧКИ: ≈ 1 Л В ЧАС" color={BLUE} size={48} />
					<Plaque f={f} at={salt + 8} x={1600} y={790} text="СОЛИ СЛИШКОМ МАЛО" color={RED} size={42} />
				</>
			}
		>
			<g transform="translate(1150,500)">
				<Funnel f={g} flow={ease(f, liter, liter + 10, 0, 1)} over={ease(f, fast, fast + 10, 0, 1)} />
			</g>
			{f >= salt - 4 && (
				<g transform={`translate(1600,500) scale(${pop(f, salt - 4, 12)})`}>
					<path d="M 0,-150 C 80,-50 110,10 110,60 A 110,100 0 0 1 -110,60 C -110,10 -80,-50 0,-150 Z" fill="#e87a7a" stroke={INK} strokeWidth={7} />
					{Array.from({length: crystals}).map((_, i) => (
						<rect key={i} x={-60 + ((i * 37) % 120)} y={-30 + ((i * 53) % 110)} width={18} height={18} fill="#fff" stroke={INK} strokeWidth={3} />
					))}
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, -0.1]} armR={armR} pointerAng={74} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 64. the cells swell; the brain has nowhere to go =====
export const C64: React.FC = () => {
	const n = 64;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const swell = w(n, 'набухают') - 8;
	const brainAt = w(n, 'мозге') - 6;
	const sw = ease(f, swell, swell + 24, 1, 1.45);
	const brain = ease(f, brainAt, brainAt + 10, 0, 1);
	const pressure = ease(f, brainAt + 8, brainAt + 30, 0, 1);
	const capY = -130 - pressure * 110 - (pressure > 0 ? Math.abs(Math.sin(g / 4)) * 20 : 0);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={swell + 4} x={1350} y={200} text="КЛЕТКИ НАБУХАЮТ" color={BLUE} size={48} />
					<Plaque f={f} at={brainAt + 14} x={1350} y={790} text="МОЗГУ НЕКУДА РАСШИРЯТЬСЯ" color={RED} size={42} />
				</>
			}
		>
			{[0, 1, 2, 3, 4].map((i) => {
				const cx = 1150 + (i % 3) * 190 + (i > 2 ? 95 : 0);
				const cy = 400 + (i > 2 ? 170 : 0);
				return (
					<g key={i} transform={`translate(${cx},${cy}) scale(${sw})`}>
						<circle r={70} fill="#fbe3e8" stroke="#c96a82" strokeWidth={7} />
						<circle cx={10} cy={-6} r={22} fill="#c96a82" />
					</g>
				);
			})}
			{f >= swell &&
				[0, 1, 2].map((i) => {
					const t = ((f - swell + i * 8) % 24) / 24;
					return <Drop key={i} x={1060 + i * 190} y={260 + t * 80} r={12} o={1 - t} />;
				})}
			{pressure > 0 &&
				[-1, 1].map((sd) => (
					<path key={sd} d={`M ${px(sd * 165)},${py(-640)} l ${sd * 30},-14 M ${px(sd * 172)},${py(-590)} l ${sd * 34},0 M ${px(sd * 165)},${py(-540)} l ${sd * 30},14`} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={pressure} />
				))}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} brain={brain} capAt={brain > 0.01 ? [0, capY * brain, -6 * brain] : undefined} look={f < brainAt ? [0.8, -0.1] : [0, -0.8]} armR="down" armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 65. not litres at once — little and often =====
export const C65: React.FC = () => {
	const n = 65;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const litres = w(n, 'литрами') - 6;
	const little = w(n, 'понемногу') - 8;
	const sip = little + 14;
	const armR = armAt(1, f, [[0, 'down'], [little, EAT_REST], [sip, EAT_BITE], [sip + 12, EAT_REST]], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Line f={f} at={litres + 6} x={980} y={620} ok={false} size={44} text="ЛИТРАМИ ЗА РАЗ" />
					<Line f={f} at={little + 6} x={980} y={740} size={44} text="ПОНЕМНОГУ И ЧАСТО" />
				</>
			}
		>
			{f >= litres && (
				<g transform={`translate(1160,400) scale(${pop(f, litres, 11)})`}>
					<path d="M -90,-150 L 90,-150 L 110,150 L -110,150 Z" fill="#eaf5ff" stroke={INK} strokeWidth={8} />
					<path d="M -82,-90 L 82,-90 L 100,142 L -100,142 Z" fill="#7fc4ff" />
					<path d="M 90,-110 C 160,-110 160,40 100,40" fill="none" stroke={INK} strokeWidth={14} />
					<text x={0} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff">
						5 Л
					</text>
				</g>
			)}
			{f >= little && (
				<g transform={`translate(1560,440) scale(${pop(f, little, 11) * 1.6})`}>
					<Cup />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} outer={f >= little ? <g transform={`translate(${armR.ha[0] - 30},${armR.ha[1] - 20})`}><Cup /></g> : undefined} look={[0.5, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 67. drink before you want to =====
export const C67: React.FC = () => {
	const n = 67;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const sip = 8;
	const late = w(n, 'опаздывает') - 8;
	const armR = armAt(1, f, [[0, EAT_REST], [sip, EAT_BITE], [sip + 14, EAT_REST]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			snow={false}
			html={
				<>
					<Line f={f} at={4} x={1000} y={380} size={56} text="ПЕЙ ДО ЖАЖДЫ" />
					<Plaque f={f} at={late} x={1340} y={560} text="ЖАЖДА ОПАЗДЫВАЕТ" color={RED} size={46} />
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} outer={<g transform={`translate(${armR.ha[0] - 30},${armR.ha[1] - 10})`}><Bottle s={0.9} /></g>} look={[0.5, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 68. the colour of urine =====
export const C68: React.FC = () => {
	const n = 68;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const light = w(n, 'светлая') - 6;
	const dark = w(n, 'тёмная') - 6;
	const mark = f >= dark ? 3 : f >= light ? 0 : -1;
	const armR = armAt(1, f, [[0, EAT_REST], [4, 'pointer']], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={light + 2} x={1075} y={760} text="ВСЁ ХОРОШО" color={GREEN} size={40} />
					<Plaque f={f} at={dark + 2} x={1525} y={760} text="ПОРА ПИТЬ" color={RED} size={40} />
				</>
			}
		>
			<g transform="translate(1075,600)">
				<Tubes f={f} at={0} mark={mark} levels={[0.8, 0.8, 0.8, 0.8]} />
			</g>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armR} pointerAng={80} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 79. first aid: into the shade, undo the clothes =====
export const C79: React.FC = () => {
	const n = 79;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const shade = w(n, 'тень') - 6;
	const undo = w(n, 'расстегни') - 6;
	const armR = armAt(1, f, [[0, 'down'], [shade - 4, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			snow={false}
			html={
				<>
					<Line f={f} at={shade + 2} x={1000} y={190} size={46} text="В ТЕНЬ ИЛИ ПРОХЛАДУ" />
					<Line f={f} at={undo + 2} x={1000} y={285} size={46} text="РАССТЕГНИ ОДЕЖДУ" />
				</>
			}
		>
			{/* a big umbrella; the person lies in its shade */}
			<g transform="translate(1420,770)">
				<ellipse cx={0} cy={60} rx={330} ry={34} fill="#000" opacity={f >= shade ? 0.16 : 0.06} />
				<line x1={0} y1={-330} x2={0} y2={60} stroke={INK} strokeWidth={10} />
				<path d="M -320,-250 A 320,120 0 0 1 320,-250 Z" fill={RED} stroke={INK} strokeWidth={8} />
				<path d="M -110,-250 A 110,120 0 0 1 110,-250" fill="none" stroke={INK} strokeWidth={6} />
				<g transform="translate(190,40) rotate(-90)">
					<Runner id="c79p" x={0} y={0} s={0.36} f={g} face={{eyes: 'closed', brows: 'worried', mouth: 'open', sweat: 0.4}} />
				</g>
			</g>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 80. cool: neck, armpits, groin; fan =====
export const C80: React.FC = () => {
	const n = 80;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const neck = w(n, 'шею') - 6;
	const pits = w(n, 'подмышки') - 6;
	const groin = w(n, 'пах') - 6;
	const fanAt = w(n, 'обмахивай') - 6;
	const fan: ArmSpec = {...FAN, hang: 200 + Math.sin(g / 2.4) * 28};
	const armR = armAt(1, f, [[0, 'down'], [neck - 4, PRESENT], [fanAt, fan]], g);
	const spot = (at: number, x: number, y: number, r = 34) => (f >= at ? <circle cx={x} cy={y} r={r * pop(f, at, 10)} fill="#7fc4ff" stroke="#2a6aa8" strokeWidth={5} opacity={0.9} /> : null);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={<Plaque f={f} at={2} x={1350} y={180} text="МОКРАЯ ТКАНЬ" color={BLUE} size={48} />}
		>
			<g transform="translate(1350,880) scale(1.05)">
				<Body id="c80b" />
				{spot(neck, 0, -452)}
				{spot(pits, -98, -372)}
				{spot(pits + 3, 98, -372)}
				{spot(groin, 0, -190)}
			</g>
			{f >= fanAt &&
				[0, 1].map((i) => {
					const t = ((g + i * 9) % 18) / 18;
					return <path key={i} d={`M ${px(250) + t * 60},${py(-480) + i * 40} q 20,-12 40,0`} stroke="#7fc4ff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - t} />;
				})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 81. small sips, better salted =====
export const C81: React.FC = () => {
	const n = 81;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const sips = w(n, 'маленькими') - 6;
	const salt = w(n, 'подсоленную') - 6;
	const armR = armAt(1, f, [[0, 'down'], [sips - 6, EAT_REST], [sips + 4, EAT_BITE], [sips + 16, EAT_REST]], g);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Line f={f} at={sips + 2} x={1000} y={300} size={48} text="МАЛЕНЬКИМИ ГЛОТКАМИ" />
					<Line f={f} at={salt + 2} x={1000} y={420} size={48} text="ЛУЧШЕ С ЩЕПОТКОЙ СОЛИ" />
				</>
			}
		>
			{f >= salt && (
				<g transform={`translate(1450,640) scale(${pop(f, salt, 11)})`}>
					<path d="M -50,-90 L 50,-90 L 60,90 L -60,90 Z" fill="#f4f8fb" stroke={INK} strokeWidth={7} />
					<rect x={-56} y={-130} width={112} height={44} rx={14} fill="#c8d2da" stroke={INK} strokeWidth={6} />
					{[-24, 0, 24].map((x) => (
						<circle key={x} cx={x} cy={-108} r={6} fill={INK} />
					))}
					{[0, 1, 2].map((i) => {
						const t = ((g + i * 7) % 21) / 21;
						return <rect key={i} x={-10 + i * 10} y={-150 - t * 50} width={9} height={9} fill="#fff" stroke={INK} strokeWidth={2} opacity={1 - t} />;
					})}
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} outer={f >= sips - 6 ? <g transform={`translate(${armR.ha[0] - 30},${armR.ha[1] - 20})`}><Cup /></g> : undefined} look={[0.6, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 86. you have a head: shade by day, the road by night, the water inside =====
export const C86: React.FC = () => {
	const n = 86;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const head = w(n, 'голова') - 6;
	const day = w(n, 'днём') - 6;
	const night = w(n, 'ночью') - 6;
	const water = w(n, 'внутри') - 8;
	const brain = ease(f, head, head + 10, 0, 0.9) * (1 - ease(f, day + 10, day + 20, 0, 0.6));
	const armR = armAt(1, f, [[0, 'down'], [head - 4, 'point'], [day + 6, PRESENT]], g);
	const card = (at: number, x: number, label: string, ic: React.ReactNode) =>
		f < at ? null : (
			<g transform={`translate(${x},470) scale(${pop(f, at, 11)})`}>
				<rect x={-150} y={-170} width={300} height={340} rx={30} fill="#fff8ec" stroke={INK} strokeWidth={7} />
				<g transform="translate(0,-40)">{ic}</g>
				<text x={0} y={130} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={27} fill={INK}>
					{label}
				</text>
			</g>
		);
	return (
		<Page n={n} f={f} shadow={k} snow={false}>
			{card(day, 1060, 'ДНЁМ — ТЕНЬ', <g transform="scale(0.9)"><Umbrella /></g>)}
			{card(night, 1380, 'НОЧЬЮ — ПУТЬ', <g transform="scale(0.9)"><MoonIco /></g>)}
			{card(water, 1700, 'ВОДА — ВНУТРИ', <g transform="translate(0,90) scale(0.3)"><Body id="c86b" level={0.6} f={g} /></g>)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} brain={brain} capAt={brain > 0.01 ? [0, -120 * (brain / 0.9), -5] : undefined} look={f < day ? [0.2, -0.9] : [0.8, -0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 87. how long would you hold out? =====
export const C87: React.FC = () => {
	const n = 87;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const how = w(n, 'сколько') - 6;
	const write = w(n, 'пиши') - 6;
	const armR = armAt(1, f, [[0, PRESENT], [how, SHRUG]], g);
	const armL = armAt(-1, f, [[0, 'hip'], [how, mirror(SHRUG)]], g);
	const OPTS = ['1 ДЕНЬ?', '3 ДНЯ?', '9 ДНЕЙ?'];
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					{OPTS.map((o, i) =>
						f < how + 6 + i * 6 ? null : (
							<div key={o} style={{position: 'absolute', left: 1100 + i * 260, top: 520, transform: `translate(-50%,-50%) scale(${pop(f, how + 6 + i * 6, 11)})`, background: [BLUE, ORANGE, RED][i], color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, padding: '10px 24px', borderRadius: 18, whiteSpace: 'nowrap'}}>
								{o}
							</div>
						),
					)}
					<Plaque f={f} at={write} x={1360} y={720} text="ПИШИ В КОММЕНТАРИЯХ 👇" color={YEL} size={48} />
				</>
			}
		>
			<g transform={`translate(1360,300) scale(${pop(f, 2, 12)})`}>
				<path d="M -170,-100 Q -170,-140 -130,-140 L 130,-140 Q 170,-140 170,-100 L 170,40 Q 170,80 130,80 L -20,80 L -70,130 L -60,80 L -130,80 Q -170,80 -170,40 Z" fill={YEL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
				<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={INK}>
					?
				</text>
			</g>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.1, 0.1]} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 88. «подпишись» =====
export const C88: React.FC = () => {
	const n = 88;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const press = w(n, 'подпишись') - 6;
	const tgk = w(n, 'тгк') - 8;
	const link = w(n, 'ссылка') - 4;
	const armR = armAt(1, f, [[0, 'wave'], [press, PRESENT], [tgk, 'point'], [link + 14, 'wave']], g);
	const click = press + 22;
	const done = f >= click + 2;
	const cur = interpolate(f, [press + 6, press + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const pressK = f >= click && f < click + 5 ? 0.93 : 1;
	const look: [number, number] = f >= press && f < tgk ? [0.8, -0.1] : [0.1, 0.1];
	const L = len(n);
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					{f >= 6 && <div style={{position: 'absolute', left: 1370, top: 240, transform: `translate(-50%,-50%) scale(${pop(f, 6, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 150, color: INK, textShadow: `9px 9px 0 ${YEL}`}}>CHOBI</div>}
					{f >= press && (
						<div style={{position: 'absolute', left: 1370, top: 460, transform: `translate(-50%,-50%) scale(${pop(f, press, 12) * pressK})`, background: done ? '#e4e4ea' : RED, color: done ? INK : '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 62, padding: '20px 56px 24px', borderRadius: 60, whiteSpace: 'nowrap', boxShadow: done ? 'none' : '0 8px 0 #8f1416'}}>
							{done ? 'ВЫ ПОДПИСАНЫ ✓' : 'ПОДПИСАТЬСЯ'}
						</div>
					)}
					{f >= press + 6 && f < click + 30 && (
						<svg width={80} height={90} viewBox="0 0 80 90" style={{position: 'absolute', left: 1760 - cur * 330, top: 760 - cur * 270, opacity: interpolate(f, [click + 20, click + 30], [1, 0], clamp)}}>
							<path d="M 6,4 L 6,70 L 22,56 L 34,84 L 46,78 L 34,52 L 56,52 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
						</svg>
					)}
					{f >= tgk && <div style={{position: 'absolute', left: 1370, top: 640, transform: `translate(-50%,-50%) scale(${pop(f, tgk, 12)})`, background: '#2a9ad8', color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, padding: '14px 38px', borderRadius: 22, whiteSpace: 'nowrap'}}>РАННИЙ ДОСТУП — В ТГК</div>}
					{f >= link && f < L && <div style={{position: 'absolute', left: 1370, top: 730, transform: `translate(-50%,-50%) scale(${pop(f, link, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 34, color: '#6a7280', letterSpacing: 2, whiteSpace: 'nowrap'}}>ССЫЛКА В ПРОФИЛЕ</div>}
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={look} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// which shots Чоби takes over
export const CHOBI_SHOTS: Partial<Record<number, React.FC>> = {
	4: C04, 5: C05, 12: C12, 13: C13, 14: C14, 16: C16, 17: C17, 18: C18, 19: C19, 35: C35, 36: C36, 37: C37,
	56: C56, 57: C57, 58: C58, 59: C59, 63: C63, 64: C64, 65: C65, 67: C67, 68: C68, 79: C79, 80: C80, 81: C81, 86: C86, 87: C87, 88: C88,
};
