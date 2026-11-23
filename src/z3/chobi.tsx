// Чоби's own scenes in «Каково это — оказаться погребённым заживо»: the intro; carbon dioxide and what it does (on
// himself); panic: claustrophobia, adrenaline, the heart; «Гога, дыши со мной» — the square breathing, the two of them
// together; snow, sand, earth — anyone can end up under them; the avalanche rules on himself, the gear, the survival
// curve; the rubble rules (a cloth, a pipe, a whistle, the battery); the finale with Гога: the rules, «подпишись».
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, pop} from '../anim';
import {Choby, type ArmSpec} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {armAt, FEET, GRAB, HEART_PT, HX, INK, len, Line, mirror, Page, PRESENT, RAISE, S, SHRUG, SPREAD, Stand, TEN, Title, useHost} from './chobiKit';
import {RED, YEL, You} from './kit';
import {w} from './voice';

const BLUE = '#2f86e0';
const GREEN = '#3aa86a';
const ORANGE = '#f08a2a';
const GX = 1660; // Гога on the page (the same spot on every page: no jumps at the cuts)
// Чоби steps aside (or back) at the start of a page instead of jumping at the cut: two steps over `dur` frames
const stepX = (f: number, from: number, to: number, at = 0, dur = 14) => {
	const t = Math.max(0, Math.min(1, (f - at) / dur));
	return {x: from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)), walk: f >= at && f < at + dur ? (2 * Math.PI * (f - at)) / dur : undefined};
};
// Гога walks onto the page from the right (he never pops out of thin air): where he is at frame f, and his step phase
const gogaIn = (f: number, at: number, toX: number, dur = 20) => {
	const t = Math.max(0, Math.min(1, (f - at) / dur));
	return {x: 2180 + (toX - 2180) * t * (2 - t), walk: f >= at && f < at + dur ? (6 * Math.PI * (f - at)) / dur : undefined};
};
const html = (x: number, y: number, s: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: HEAVY, fontWeight: 900, whiteSpace: 'nowrap', ...extra});
const pill = (bg: string): React.CSSProperties => ({background: bg, color: '#fff', padding: '10px 26px', borderRadius: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.18)'});

// a CO₂ molecule / an O₂ molecule
const CO2: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle cx={-24} r={14} fill="#9aa1ae" stroke={INK} strokeWidth={3} />
		<circle r={18} fill="#4a4f5a" stroke={INK} strokeWidth={3} />
		<circle cx={24} r={14} fill="#9aa1ae" stroke={INK} strokeWidth={3} />
	</g>
);
// a gauge 0…1 (CO₂ in the air)
const Gauge: React.FC<{x: number; y: number; v: number; label: string}> = ({x, y, v, label}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={-40} y={-260} width={80} height={300} rx={40} fill="#fff" stroke={INK} strokeWidth={6} />
		<rect x={-26} y={26 - 272 * v} width={52} height={272 * v} rx={26} fill={v > 0.6 ? RED : v > 0.3 ? ORANGE : GREEN} />
		<text x={0} y={100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={INK}>
			{label}
		</text>
	</g>
);
// a square for the breathing; t 0…4 (sides: up, across, down, back)
const BoxBreath: React.FC<{x: number; y: number; a: number; t: number}> = ({x, y, a, t}) => {
	const side = Math.min(3, Math.floor(t));
	const u = Math.max(0, Math.min(1, t - side));
	const P = [
		[-a / 2, a / 2],
		[-a / 2, -a / 2],
		[a / 2, -a / 2],
		[a / 2, a / 2],
		[-a / 2, a / 2],
	];
	const dx = P[side][0] + (P[side + 1][0] - P[side][0]) * u;
	const dy = P[side][1] + (P[side + 1][1] - P[side][1]) * u;
	const cols = [BLUE, YEL, GREEN, '#8a5ad8'];
	return (
		<g transform={`translate(${x},${y})`}>
			{[0, 1, 2, 3].map((k) => (
				<line key={k} x1={P[k][0]} y1={P[k][1]} x2={P[k + 1][0]} y2={P[k + 1][1]} stroke={k <= side ? cols[k] : '#d8dde6'} strokeWidth={16} strokeLinecap="round" />
			))}
			<circle cx={dx} cy={dy} r={26} fill="#fff" stroke={INK} strokeWidth={8} />
		</g>
	);
};

// ============================================================ 6. «Я — Чоби»: the title; what Гога does wrong; the rules =====
export const C06: React.FC = () => {
	const n = 6;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const t = w(n, 'каково') - 4;
	const goga = w(n, 'гога') - 6;
	const rules = w(n, 'правила') - 6;
	const go = w(n, 'поехали') - 6;
	const armR = armAt(1, f, [[0, 'wave'], [t - 8, PRESENT], [go, 'point']], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={t} x={1330} y={230} size={66} text="КАКОВО ЭТО —" />
					<Title f={f} at={t + 6} x={1330} y={320} size={66} color="#a0662e" text="ОКАЗАТЬСЯ ПОГРЕБЁННЫМ" />
					<Title f={f} at={t + 10} x={1330} y={400} size={66} color="#a0662e" text="ЗАЖИВО" />
					{f >= goga && <div style={html(1110, 640, pop(f, goga, 11), {...pill(RED), fontSize: 38})}>✕ ЧТО ГОГА ДЕЛАЕТ НЕ ТАК</div>}
					{f >= rules && <div style={html(1500, 760, pop(f, rules, 11), {...pill(GREEN), fontSize: 38})}>✓ ПРАВИЛА, КОТОРЫЕ СПАСАЮТ</div>}
				</>
			}
		>
			{f >= goga && <ellipse cx={gogaIn(f, goga, 1700).x} cy={FEET + 6} rx={65} ry={14} fill="#000" opacity={0.09} />}
			{f >= goga && <You x={gogaIn(f, goga, 1700).x} y={FEET} s={0.5} f={g} walk={gogaIn(f, goga, 1700).walk} brows={1} face={{eyes: 'open', mouth: 'smile', look: [-0.6, 0]}} />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < t ? [0.1, 0.1] : [0.75, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 10. it is not the lack of oxygen but the CO₂ you breathe out =====
export const C10: React.FC = () => {
	const n = 10;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const co2 = w(n, 'углекислый') - 6;
	const out = w(n, 'выдыхаешь') - 8;
	const armR = armAt(1, f, [[0, 'down'], [co2 - 6, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= 4 && <div style={html(1330, 300, pop(f, 4, 11), {fontSize: 56, color: '#9aa1ae', textDecoration: 'line-through', textDecorationThickness: 8})}>НЕ НЕХВАТКА O₂</div>}
					{f >= co2 && <div style={html(1330, 420, pop(f, co2, 11), {...pill(RED), fontSize: 56})}>А УГЛЕКИСЛЫЙ ГАЗ — CO₂</div>}
				</>
			}
		>
			{f >= out &&
				[0, 1, 2, 3].map((i) => {
					const t = ((f - out) / 30 + i / 4) % 1;
					return <CO2 key={i} x={HX + 150 + t * 520} y={FEET - 440 * S - t * 80 + Math.sin(t * 6 + i) * 20} s={0.9} o={1 - t * 0.6} />;
				})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.7, -0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 11. with every breath more of it: headache, fast breathing, sleepy, muddled =====
export const C11: React.FC = () => {
	const n = 11;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const head = w(n, 'болит') - 6;
	const fast = w(n, 'частым') - 6;
	const sleep = w(n, 'клонит') - 6;
	const muddle = w(n, 'путаются') - 6;
	const v = interpolate(f, [0, len(n)], [0.15, 0.62], clamp);
	const chest = f >= fast && f < sleep ? 1 + Math.abs(Math.sin(g / 2.6)) * 0.14 : 1;
	const drowsy = interpolate(f, [sleep, sleep + 20], [0, 0.55], clamp);
	const armL = armAt(-1, f, [[0, 'hip'], [head - 4, mirror(RAISE)], [fast + 10, 'hip']], g);
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{[
						[head, 'БОЛИТ ГОЛОВА', RED],
						[fast, 'ДЫШИТ ЧАСТО', ORANGE],
						[sleep, 'КЛОНИТ В СОН', '#8a5ad8'],
						[muddle, 'ПУТАЮТСЯ МЫСЛИ', '#5a6070'],
					].map(([at, t, c], i) => (f >= (at as number) ? <div key={i} style={html(1320, 260 + i * 110, pop(f, at as number, 11), {...pill(c as string), fontSize: 44})}>{t as string}</div> : null))}
				</>
			}
		>
			<Gauge x={1720} y={720} v={v} label="CO₂" />
			{f >= head && f < fast + 20 &&
				[-1, 1].map((sd) => <path key={sd} d={`M ${HX + sd * 170},${FEET - 600 * S} l ${sd * 24},-18 l ${sd * -8},-20 l ${sd * 28},-16`} stroke={RED} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
			{f >= sleep &&
				[0, 1, 2].map((i) => {
					const t = ((f - sleep) / 36 + i / 3) % 1;
					return (
						<text key={i} x={HX + 140 + t * 80} y={FEET - 700 * S - t * 120} fontFamily={HEAVY} fontWeight={900} fontSize={40 + i * 10} fill="#8a5ad8" opacity={1 - t}>
							Z
						</text>
					);
				})}
			{f >= muddle && <text x={HX} y={FEET - 790 * S} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#5a6070" transform={`rotate(${Math.sin(f / 6) * 20} ${HX} ${FEET - 810 * S})`}>?!</text>}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={Math.max(blink, drowsy)} tilt={tilt + drowsy * 10} f={g} look={[0.4, 0.2]} armR="down" armL={armL} chest={chest} />
			</Stand>
		</Page>
	);
};

// ============================================================ 12. then he simply falls asleep — and does not wake up =====
export const C12: React.FC = () => {
	const n = 12;
	const {f, g, jaw, b} = useHost(n);
	const close = interpolate(f, [0, 30], [0.55, 1], clamp);
	return (
		<Page
			n={n}
			f={f}
			html={<>{f >= 6 && <div style={html(1330, 340, pop(f, 6, 11), {...pill('#4a4f5a'), fontSize: 54})}>CO₂ ≈ 10% — СОН</div>}</>}
		>
			<Gauge x={1720} y={720} v={interpolate(f, [0, 30], [0.62, 0.95], clamp)} label="CO₂" />
			<Stand k={1} b={b} lean={interpolate(f, [0, len(n)], [0, 6], clamp)}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw * 0.6} blink={close} tilt={10} f={g} armR="down" armL="down" />
			</Stand>
		</Page>
	);
};

// ============================================================ 23. all three mistakes come from panic =====
export const C23: React.FC = () => {
	const n = 23;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const panic = w(n, 'паники') - 6;
	const armR = armAt(1, f, [[0, 'wave'], [6, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{['КРИК', 'КРЫШКА', 'ОГОНЬ'].map((t, i) => (f >= 4 + i * 4 ? <div key={t} style={html(1080 + i * 260, 300, pop(f, 4 + i * 4, 10), {...pill(RED), fontSize: 40})}>✕ {t}</div> : null))}
					{f >= panic && <div style={html(1340, 600, pop(f, panic, 11), {fontSize: 110, color: RED, textShadow: `6px 6px 0 ${INK}`})}>ПАНИКА</div>}
				</>
			}
		>
			{f >= panic + 4 &&
				[0, 1, 2].map((i) => (
					<path key={i} d={`M ${1080 + i * 260},350 L ${1260 + i * 40},${490}`} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={pop(f, panic + 4, 9)} markerEnd="" />
				))}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 24. claustrophobia; in such darkness anyone panics =====
export const C24: React.FC = () => {
	const n = 24;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const word = w(n, 'клаустрофобия') - 6;
	const dark = w(n, 'темноте') - 6;
	const close = interpolate(f, [dark, dark + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= word && <div style={html(1330, 300, pop(f, word, 11), {fontSize: 84, color: INK, textShadow: `5px 5px 0 ${YEL}`})}>КЛАУСТРОФОБИЯ</div>}
					{f >= word + 8 && <div style={html(1330, 390, pop(f, word + 8, 11), {fontSize: 36, color: '#5a6070'})}>страх тесноты</div>}
				</>
			}
		>
			{/* the walls close in round him */}
			{close > 0 && (
				<g opacity={close}>
					<rect x={HX - 520 + close * 220} y={FEET - 760} width={60} height={800} fill="#6e4224" />
					<rect x={HX + 460 - close * 220} y={FEET - 760} width={60} height={800} fill="#6e4224" />
					<rect x={HX - 520 + close * 220} y={FEET - 790 + (1 - close) * 0} width={1040 - close * 440} height={50} fill="#8a5630" />
				</g>
			)}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={close > 0.3 ? [Math.sin(g / 6) * 0.8, -0.2] : [0.7, -0.2]} armR={armAt(1, f, [[0, 'down'], [dark, SHRUG]], g)} armL={armAt(-1, f, [[0, 'hip'], [dark, mirror(SHRUG)]], g)} sweat={close} />
			</Stand>
		</Page>
	);
};

// ============================================================ 25. the brain sounds the alarm; adrenaline; the heart pounds; breathing ×2–3 =====
export const C25: React.FC = () => {
	const n = 25;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const alarm = w(n, 'тревогу') - 8;
	const adr = w(n, 'адреналин') - 6;
	const heart = w(n, 'сердце') - 6;
	const breath = w(n, 'дыхание') - 6;
	const beat = f >= heart ? Math.max(0, Math.sin((g / 7) * Math.PI)) ** 4 : 0;
	const chest = f >= breath ? 1 + Math.abs(Math.sin(g / 2.4)) * 0.12 : 1;
	const flash = f >= alarm ? 0.5 + 0.5 * Math.sin(g / 2) : 0;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= alarm && <div style={html(1320, 250, pop(f, alarm, 11), {...pill(RED), fontSize: 46})}>МОЗГ: ТРЕВОГА!</div>}
					{f >= adr && <div style={html(1320, 370, pop(f, adr, 11), {...pill(ORANGE), fontSize: 46})}>АДРЕНАЛИН</div>}
					{f >= heart && <div style={html(1320, 490, pop(f, heart, 11), {...pill('#c0303a'), fontSize: 46})}>♥ {Math.round(interpolate(f, [heart, heart + 60], [80, 140], clamp))}</div>}
					{f >= breath && <div style={html(1320, 610, pop(f, breath, 11), {...pill(BLUE), fontSize: 46})}>ДЫХАНИЕ × 2–3</div>}
				</>
			}
		>
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.6, -0.2]} armR="down" armL="hip" brain={f >= alarm ? 0.6 + flash * 0.4 : 0} heart={f >= heart ? {beat, size: 1.1} : undefined} heartOver chest={chest} sweat={f >= adr ? 0.8 : 0} />
			</Stand>
			{f >= alarm && <circle cx={HX} cy={FEET - 640 * S} r={170} fill={RED} opacity={0.12 * flash} />}
		</Page>
	);
};

// ============================================================ 26. the body gets ready to run — nowhere to run; panic eats the air =====
export const C26: React.FC = () => {
	const n = 26;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const nowhere = w(n, 'некуда') - 6;
	const eats = w(n, 'съедает') - 8;
	const air = interpolate(f, [eats, eats + 40], [0.7, 0.15], clamp);
	const running = f < nowhere + 10;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= 4 && <div style={html(1320, 260, pop(f, 4, 11), {...pill(ORANGE), fontSize: 46})}>ТЕЛО: «БЕГИ!»</div>}
					{f >= nowhere && <div style={html(1320, 380, pop(f, nowhere, 11), {...pill(INK), fontSize: 46})}>БЕЖАТЬ НЕКУДА</div>}
					{f >= eats && (
						<div style={html(1320, 560, pop(f, eats, 11), {width: 480})}>
							<div style={{fontSize: 34, color: INK, marginBottom: 10}}>ВОЗДУХ</div>
							<div style={{height: 34, borderRadius: 17, background: '#e4e8ee', border: `5px solid ${INK}`}}>
								<div style={{width: `${air * 100}%`, height: 24, borderRadius: 12, background: air < 0.35 ? RED : BLUE}} />
							</div>
						</div>
					)}
				</>
			}
		>
			{f >= nowhere && (
				<g opacity={pop(f, nowhere, 10)}>
					<rect x={HX - 330} y={FEET - 760} width={50} height={800} fill="#6e4224" />
					<rect x={HX + 280} y={FEET - 760} width={50} height={800} fill="#6e4224" />
				</g>
			)}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[Math.sin(g / 5) * 0.8, -0.2]} walk={running ? g * 0.55 : undefined} armR={running ? 'down' : SHRUG} armL={running ? 'down' : mirror(SHRUG)} chest={1 + Math.abs(Math.sin(g / 2.4)) * 0.1} sweat={0.6} />
			</Stand>
		</Page>
	);
};

// the square breathing on the voice's own counts (shot 28): [phase start word, its four counts]
const PHASES: [number, number[]][] = [
	[0, [2, 3, 4, 5]],
	[6, [8, 9, 10, 11]],
	[12, [14, 15, 16, 17]],
	[19, [21, 22, 23, 24]],
];
const breathAt = (n: number, f: number) => {
	const starts = PHASES.map(([s]) => w(n, s));
	let ph = 0;
	while (ph < 3 && f >= starts[ph + 1]) ph++;
	const a = starts[ph];
	const bEnd = ph < 3 ? starts[ph + 1] : w(n, PHASES[3][1][3]) + 24;
	const u = Math.max(0, Math.min(1, (f - a) / Math.max(1, bEnd - a)));
	const count = PHASES[ph][1].filter((i) => f >= w(n, i) - 2).length;
	// the chest: in on the breath in, held, out on the breath out, held empty
	const chest = ph === 0 ? 1 + 0.13 * u : ph === 1 ? 1.13 : ph === 2 ? 1.13 - 0.13 * u : 1;
	return {ph, t: f < a && ph === 0 ? 0 : ph + u, count, chest};
};
const PHASE_NAME = ['ВДОХ', 'ЗАДЕРЖИ', 'ВЫДОХ', 'ПАУЗА'];
const PHASE_COL = [BLUE, '#c99a1a', GREEN, '#8a5ad8'];

// ============================================================ 27. «Гога, дыши со мной» — he joins Чоби on the page =====
export const C27: React.FC = () => {
	const n = 27;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const armR = armAt(1, f, [[0, 'down'], [2, PRESENT]], g);
	return (
		<Page n={n} f={f}>
			<ellipse cx={gogaIn(f, 0, GX).x} cy={FEET + 6} rx={110} ry={14} fill="#000" opacity={0.09} />
			<You x={gogaIn(f, 0, GX).x} y={FEET} s={0.85} f={g} walk={gogaIn(f, 0, GX).walk} face={{eyes: 'wide', brows: 'worried', mouth: 'open', look: [-0.6, 0], sweat: 0.6}} />
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 28. the square: in 1-2-3-4, hold, out, pause — both of them breathe =====
export const C28: React.FC = () => {
	const n = 28;
	const {f, g, jaw, blink, tilt} = useHost(n);
	const {ph, t, count, chest} = breathAt(n, f);
	const armR: ArmSpec = PRESENT;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<div style={html(1095, 180, 1, {fontSize: 62, color: PHASE_COL[ph]})}>{PHASE_NAME[ph]}</div>
					<div style={html(1095, 520, 1, {fontSize: 150, color: PHASE_COL[ph]})}>{count || ''}</div>
				</>
			}
		>
			<BoxBreath x={1095} y={520} a={380} t={t} />
			<ellipse cx={GX} cy={FEET + 6} rx={110} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.85} f={g} chest={chest} face={{eyes: 'narrow', brows: 'neutral', mouth: ph === 2 ? 'o' : 'tight', look: [-0.5, 0]}} />
			<Stand k={1} b={1}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armR} armL="hip" chest={chest} />
			</Stand>
		</Page>
	);
};

// ============================================================ 29. square breathing — the special forces; the pulse slows; less air goes =====
export const C29: React.FC = () => {
	const n = 29;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const sf = w(n, 'спецназовцы') - 8;
	const pulse = w(n, 'пульс') - 6;
	const clear = w(n, 'мысли') - 6;
	const less = w(n, 'меньше') - 8;
	const bpm = Math.round(interpolate(f, [pulse, pulse + 50], [130, 72], clamp));
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<Title f={f} at={2} x={1120} y={200} size={44} text="КВАДРАТНОЕ ДЫХАНИЕ" />
					{f >= sf && <div style={html(1095, 320, pop(f, sf, 11), {...pill(INK), fontSize: 40})}>ТАК ДЫШИТ СПЕЦНАЗ</div>}
					{f >= pulse && <div style={html(1095, 440, pop(f, pulse, 11), {...pill('#c0303a'), fontSize: 46})}>♥ {bpm}</div>}
					{f >= clear && <div style={html(1095, 560, pop(f, clear, 11), {...pill(BLUE), fontSize: 40})}>МЫСЛИ ЯСНЕЕ</div>}
					{f >= less && <div style={html(1095, 680, pop(f, less, 11), {...pill(GREEN), fontSize: 40})}>ВОЗДУХА УХОДИТ МЕНЬШЕ</div>}
				</>
			}
		>
			<ellipse cx={GX} cy={FEET + 6} rx={110} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.85} f={g} chest={1 + Math.sin(g / 26) * 0.05} face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [-0.5, 0]}} />
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, PRESENT], [pulse, HEART_PT]], g)} armL="hip" heart={f >= pulse ? {beat: Math.max(0, Math.sin((g / 12) * Math.PI)) ** 4} : undefined} heartOver />
			</Stand>
		</Page>
	);
};

// snow, sand, earth icons
const Icon3: React.FC<{kind: number}> = ({kind}) => (
	<g>
		<circle r={110} fill="#fff" stroke={INK} strokeWidth={8} />
		{kind === 0 && (
			<g stroke={BLUE} strokeWidth={12} strokeLinecap="round">
				{[0, 60, 120].map((a) => (
					<line key={a} x1={0} y1={-70} x2={0} y2={70} transform={`rotate(${a})`} />
				))}
			</g>
		)}
		{kind === 1 && (
			<g>
				<path d="M -70,40 Q 0,-60 70,40 Z" fill="#e3b86a" stroke={INK} strokeWidth={6} />
				<rect x={20} y={-70} width={14} height={90} fill="#a0662e" transform="rotate(20)" />
			</g>
		)}
		{kind === 2 && (
			<g>
				<rect x={-70} y={-10} width={140} height={70} fill="#6b4a2e" stroke={INK} strokeWidth={6} />
				<path d="M -20,-80 L 20,-80 L 14,-10 L -14,-10 Z" fill="#9aa1ae" stroke={INK} strokeWidth={5} />
			</g>
		)}
	</g>
);
// ============================================================ 43. today no one wakes in a coffin — but snow, sand or earth can bury anyone =====
export const C43: React.FC = () => {
	const n = 43;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const items = [w(n, 'снега') - 4, w(n, 'песка') - 4, w(n, 'земли') - 4];
	const nocoffin = w(n, 'гроб', 0) > w(n, 'земли') ? w(n, 'гроб') - 6 : w(n, 'нужен') - 6;
	const armR = armAt(1, f, [[0, 'wave'], [items[0] - 6, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{['СНЕГ', 'ПЕСОК', 'ЗЕМЛЯ'].map((t, i) => (f >= items[i] ? <div key={t} style={html(1000 + i * 300, 560, pop(f, items[i], 11), {fontSize: 40, color: INK})}>{t}</div> : null))}
					{f >= nocoffin && <div style={html(1300, 720, pop(f, nocoffin, 11), {...pill(INK), fontSize: 40})}>И ГРОБ ДЛЯ ЭТОГО НЕ НУЖЕН</div>}
				</>
			}
		>
			{items.map((at, i) =>
				f >= at ? (
					<g key={i} transform={`translate(${1000 + i * 300},400) scale(${pop(f, at, 11)})`}>
						<Icon3 kind={i} />
					</g>
				) : null,
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 44. and here Гога's mistakes become deadly =====
export const C44: React.FC = () => {
	const n = 44;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const deadly = w(n, 'смертельными') - 8;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<div style={html(1300, 380, pop(f, 2, 11), {...pill(INK), fontSize: 46})}>ОШИБКИ ГОГИ</div>
					{f >= deadly && <div style={html(1300, 520, pop(f, deadly, 9), {fontSize: 110, color: RED, textShadow: `6px 6px 0 ${INK}`})}>СМЕРТЕЛЬНЫ</div>}
				</>
			}
		>
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.7, -0.1]} armR={armAt(1, f, [[0, PRESENT], [deadly, TEN]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 49. the rule: one hand up, the other over the face — a pocket of air =====
export const C49: React.FC = () => {
	const n = 49;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const up = w(n, 'вверх') - 8;
	const face = w(n, 'лицо') - 8;
	const pocket = w(n, 'карман') - 6;
	const armR = armAt(1, f, [[0, 'down'], [up, {el: [140, -470], ha: [196, -640], hang: 200}]], g);
	const armL = armAt(-1, f, [[0, 'hip'], [face, {el: [-96, -380], ha: [-26, -520], hang: -150, front: true}]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= up && <div style={html(1320, 300, pop(f, up, 11), {...pill(BLUE), fontSize: 44})}>↑ ОДНУ РУКУ ВВЕРХ</div>}
					{f >= face && <div style={html(1320, 420, pop(f, face, 11), {...pill(ORANGE), fontSize: 44})}>ДРУГОЙ ЗАКРОЙ ЛИЦО</div>}
					{f >= pocket && <div style={html(1320, 560, pop(f, pocket, 11), {...pill(GREEN), fontSize: 44})}>КАРМАН ВОЗДУХА</div>}
				</>
			}
		>
			{f >= pocket && <ellipse cx={HX + 10} cy={FEET - 520 * S} rx={170} ry={150} fill="#9fd8ff" opacity={0.35 * pop(f, pocket, 10)} stroke={BLUE} strokeWidth={6} strokeDasharray="14 10" />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.6, 0]} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// the avalanche gear (in his own units of a card)
const Gear: React.FC<{kind: number}> = ({kind}) => (
	<g>
		<rect x={-110} y={-110} width={220} height={220} rx={28} fill="#fff" stroke={INK} strokeWidth={7} />
		{kind === 0 && (
			<g>
				<rect x={-36} y={-60} width={72} height={120} rx={16} fill={ORANGE} stroke={INK} strokeWidth={5} />
				<rect x={-22} y={-44} width={44} height={30} rx={4} fill="#1d2430" />
				<path d="M 50,-40 q 20,20 0,40 M 64,-54 q 32,34 0,68" stroke={BLUE} strokeWidth={6} fill="none" strokeLinecap="round" />
			</g>
		)}
		{kind === 1 && <g stroke={INK} strokeWidth={10} strokeLinecap="round"><line x1={0} y1={-80} x2={0} y2={80} /><line x1={-10} y1={-80} x2={10} y2={-80} /></g>}
		{kind === 2 && (
			<g>
				<rect x={-8} y={-80} width={16} height={100} fill="#6a6a70" />
				<path d="M -46,10 L 46,10 L 40,80 L -40,80 Z" fill={RED} stroke={INK} strokeWidth={5} />
			</g>
		)}
	</g>
);
// ============================================================ 50. only with friends: beacon, probe, shovel; the avalanche airbag =====
export const C50: React.FC = () => {
	const n = 50;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const friends = w(n, 'друзьями') - 6;
	const gear = [w(n, 'датчик') - 4, w(n, 'щуп') - 4, w(n, 'лопата') - 4];
	const bag = w(n, 'рюкзак') - 6;
	const pull = w(n, 'дёрнул') - 4;
	const inflate = interpolate(f, [pull, pull + 16], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= friends && f < bag && <div style={html(1330, 230, pop(f, friends, 11), {...pill(GREEN), fontSize: 44})}>ТОЛЬКО С ДРУЗЬЯМИ</div>}
					{['ДАТЧИК', 'ЩУП', 'ЛОПАТА'].map((t, i) => (f >= gear[i] && f < bag ? <div key={t} style={html(1080 + i * 260, 610, pop(f, gear[i], 11), {fontSize: 38, color: INK})}>{t}</div> : null))}
					{f >= bag && <div style={html(1330, 230, pop(f, bag, 11), {...pill(RED), fontSize: 44})}>ЛАВИННЫЙ РЮКЗАК</div>}
					{f >= pull + 10 && <div style={html(1330, 760, pop(f, pull + 10, 11), {fontSize: 38, color: INK})}>подушка держит у поверхности</div>}
				</>
			}
		>
			{gear.map((at, i) =>
				f >= at && f < bag ? (
					<g key={i} transform={`translate(${1080 + i * 260},450) scale(${pop(f, at, 11)})`}>
						<Gear kind={i} />
					</g>
				) : null,
			)}
			{f >= bag && (
				<g transform={`translate(1330,480) scale(${pop(f, bag, 11)})`}>
					{inflate > 0 && <path d={`M -150,${-40} C -170,${-200 * inflate - 40} 170,${-200 * inflate - 40} 150,-40 Z`} fill={RED} stroke={INK} strokeWidth={6} opacity={0.9} />}
					<rect x={-110} y={-60} width={220} height={240} rx={40} fill="#2e4f96" stroke={INK} strokeWidth={6} />
					<rect x={70} y={20} width={50} height={40} rx={10} fill={RED} stroke={INK} strokeWidth={4} />
				</g>
			)}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, PRESENT], [pull, GRAB], [pull + 16, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 51. dug out in 15 minutes: 9 of 10 live; at 35 minutes: a third =====
export const C51: React.FC = () => {
	const n = 51;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const m15 = w(n, 'пятнадцать') - 6;
	const m35 = w(n, 'тридцать') - 6;
	const X0 = 960;
	const Y0 = 760;
	const W = 800;
	const H = 460;
	const pt = (m: number, p: number) => [X0 + (m / 60) * W, Y0 - (p / 100) * H] as const;
	const curve = (m: number) => (m <= 15 ? 92 - m * 0.13 : m <= 35 ? 90 - ((m - 15) / 20) * 57 : 33 - (m - 35) * 0.15);
	const upto = interpolate(f, [4, m35 + 30], [0, 60], clamp);
	let d = '';
	for (let m = 0; m <= upto; m += 1) {
		const [x, y] = pt(m, curve(m));
		d += `${m === 0 ? 'M' : 'L'} ${x},${y} `;
	}
	return (
		<Page
			sx={stepX(f, HX, HX - 100).x} n={n}
			f={f}
			html={
				<>
					{f >= m15 && <div style={html(pt(15, 92)[0] + 40, pt(15, 92)[1] - 70, pop(f, m15, 11), {...pill(GREEN), fontSize: 36})}>15 МИН — 9 ИЗ 10</div>}
					{f >= m35 && <div style={html(pt(35, 33)[0] + 160, pt(35, 33)[1] - 70, pop(f, m35, 11), {...pill(RED), fontSize: 36})}>35 МИН — ТРЕТЬ</div>}
				</>
			}
		>
			<line x1={X0} y1={Y0} x2={X0 + W} y2={Y0} stroke={INK} strokeWidth={6} />
			<line x1={X0} y1={Y0} x2={X0} y2={Y0 - H} stroke={INK} strokeWidth={6} />
			<text x={X0 + W} y={Y0 + 50} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={INK}>
				минуты под снегом
			</text>
			<text x={X0 - 20} y={Y0 - H + 10} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={INK}>
				выжили
			</text>
			<path d={d} stroke={RED} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			{f >= m15 && <circle cx={pt(15, 90)[0]} cy={pt(15, 90)[1]} r={16} fill={GREEN} stroke="#fff" strokeWidth={5} />}
			{f >= m35 && <circle cx={pt(35, 33)[0]} cy={pt(35, 33)[1]} r={16} fill={RED} stroke="#fff" strokeWidth={5} />}
			<Stand k={1} b={b}>
				<Choby x={stepX(f, HX, HX - 100).x} walk={stepX(f, HX, HX - 100).walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, -0.1]} armR={PRESENT} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 63. cover the mouth and nose with cloth; lie still; no dust =====
export const C63: React.FC = () => {
	const n = 63;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const cloth = w(n, 'тканью') - 8;
	const still = w(n, 'лежи') - 6;
	const armR = armAt(1, f, [[0, 'down'], [cloth, {el: [100, -380], ha: [20, -455], hang: 100, front: true, item: <rect x={-60} y={-30} width={120} height={70} rx={14} fill="#e8e0f0" stroke={INK} strokeWidth={5} />}]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= cloth && <div style={html(1320, 320, pop(f, cloth, 11), {...pill(BLUE), fontSize: 44})}>РОТ И НОС — ТКАНЬЮ</div>}
					{f >= still && <div style={html(1320, 440, pop(f, still, 11), {...pill(GREEN), fontSize: 44})}>ЛЕЖИ ТИХО</div>}
					{f >= still + 10 && <div style={html(1320, 560, pop(f, still + 10, 11), {...pill(INK), fontSize: 44})}>НЕ ПОДНИМАЙ ПЫЛЬ</div>}
				</>
			}
		>
			{Array.from({length: 16}).map((_, i) => {
				const t = ((g / 60 + i / 16) % 1);
				return <circle key={i} cx={HX - 300 + ((i * 97) % 600)} cy={FEET - t * 700} r={4 + (i % 3) * 3} fill="#b8b0a4" opacity={0.5 * (1 - t)} />;
			})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={f >= cloth ? 0 : jaw} blink={blink} tilt={tilt} f={g} look={[0.6, 0]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 64. knock on a pipe — metal carries it; the whistle; shout only for the rescuers; the battery =====
export const C64: React.FC = () => {
	const n = 64;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const knock = w(n, 'стучи') - 6;
	const metal = w(n, 'металлу') - 8;
	const whistle = w(n, 'свисток') - 6;
	const shout = w(n, 'кричи') - 6;
	const battery = w(n, 'заряд') - 8;
	const hit = f >= knock && f < whistle ? Math.abs(Math.sin(g / 4)) : 0;
	const armR = armAt(1, f, [[0, 'down'], [knock, {el: [130, -300], ha: [200 - hit * 20, -250 + hit * 40], hang: 200, fist: true, item: <ellipse rx={20} ry={16} fill="#8a8a8f" stroke={INK} strokeWidth={4} />}], [whistle, {el: [100, -380], ha: [30, -450], hang: 110, fist: true, front: true, item: <rect x={-30} y={-12} width={60} height={24} rx={10} fill={YEL} stroke={INK} strokeWidth={4} />}], [shout, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= knock && <div style={html(1330, 220, pop(f, knock, 11), {...pill(INK), fontSize: 40})}>СТУК СЛЫШНО ДАЛЬШЕ ГОЛОСА</div>}
					{f >= metal && <div style={html(1330, 330, pop(f, metal, 11), {...pill('#6a7280'), fontSize: 40})}>ЛУЧШЕ — ПО МЕТАЛЛУ</div>}
					{f >= whistle && <div style={html(1330, 440, pop(f, whistle, 11), {...pill(ORANGE), fontSize: 40})}>ЕСТЬ СВИСТОК — СВИСТИ</div>}
					{f >= shout && <div style={html(1330, 550, pop(f, shout, 11), {...pill(BLUE), fontSize: 40})}>КРИЧИ, КОГДА СЛЫШИШЬ СПАСАТЕЛЕЙ</div>}
					{f >= battery && <div style={html(1330, 660, pop(f, battery, 11), {...pill(GREEN), fontSize: 40})}>БЕРЕГИ ЗАРЯД ТЕЛЕФОНА</div>}
				</>
			}
		>
			{/* a pipe along the floor; knocks run along it (it goes once he takes out the whistle) */}
			<rect x={HX + 120} y={FEET - 250} width={1300} height={34} rx={17} fill="#9aa4b0" stroke={INK} strokeWidth={5} opacity={1 - interpolate(f, [whistle, whistle + 12], [0, 1], clamp)} />
			{f >= knock && f < whistle &&
				[0, 1, 2].map((i) => {
					const t = ((f - knock) / 30 + i / 3) % 1;
					return <path key={i} d={`M ${HX + 260 + t * 1100},${FEET - 290} q 10,-20 0,-40 M ${HX + 280 + t * 1100},${FEET - 290} q 10,-20 0,-40`} stroke={INK} strokeWidth={5} fill="none" opacity={1 - t} />;
				})}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.7, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 68. «Итак, Гога, повторим» — Гога comes back to the page =====
export const C68: React.FC = () => {
	const n = 68;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	return (
		<Page n={n} f={f} shadow={k} html={<>{f >= 10 && <div style={html(1120, 300, pop(f, 10, 11), {fontSize: 72, color: INK, textShadow: `5px 5px 0 ${YEL}`})}>ПОВТОРИМ</div>}</>}>
			<ellipse cx={gogaIn(f, 4, GX).x} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={gogaIn(f, 4, GX).x} y={FEET} s={0.8} f={g} walk={gogaIn(f, 4, GX).walk} face={{eyes: 'open', brows: 'neutral', mouth: 'flat', look: [-0.6, 0]}} />
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armAt(1, f, [[0, 'wave'], [12, 'point']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 69. the rules, line by line =====
export const C69: React.FC = () => {
	const n = 69;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const L = [w(n, 'трать') - 6, w(n, 'квадратом') - 8, w(n, 'никакого') - 6, w(n, 'сигналы') - 6, w(n, 'лезь') - 6];
	const TXT = ['НЕ ТРАТЬ ВОЗДУХ НА КРИК', 'ДЫШИ КВАДРАТОМ', 'НИКАКОГО ОГНЯ', 'СТУЧИ — НЕ КРИЧИ', 'НЕ ЛЕЗЬ, ГДЕ ЗАСЫПЛЕТ'];
	return (
		<Page
			sx={stepX(f, HX, HX - 60).x} n={n}
			f={f}
			html={
				<>
					{TXT.map((t, i) => (
						<Line key={t} f={f} at={L[i]} x={830} y={250 + i * 110} size={40} text={t} />
					))}
				</>
			}
		>
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} face={{eyes: 'open', brows: 'neutral', mouth: 'flat', look: [-0.7, -0.1]}} />
			<Stand k={1} b={b}>
				<Choby x={stepX(f, HX, HX - 60).x} walk={stepX(f, HX, HX - 60).walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, -0.1]} armR={armAt(1, f, [[0, 'point'], [L[0], PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 70. Гога nods: remembered =====
export const C70: React.FC = () => {
	const n = 70;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	// he nods a few times, smaller and smaller
	const nod = Math.sin(f / 3) * 8 * Math.max(0, 1 - f / 40);
	const got = w(n, 'запомнил') - 6;
	return (
		<Page sx={stepX(f, HX - 60, HX).x} n={n} f={f} html={<>{f >= got && <div style={html(GX, 230, pop(f, got, 10), {...pill(GREEN), fontSize: 44})}>ЗАПОМНИЛ ✓</div>}</>}>
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} tilt={nod} brows={1} face={{eyes: 'open', mouth: 'smile', look: [-0.5, 0]}} />
			<Stand k={1} b={b}>
				<Choby x={stepX(f, HX - 60, HX).x} walk={stepX(f, HX - 60, HX).walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={PRESENT} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 71. one of the oldest fears — but you have knowledge =====
export const C71: React.FC = () => {
	const n = 71;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const know = w(n, 'знания') - 8;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= 6 && <div style={html(1100, 290, pop(f, 6, 11), {fontSize: 34, color: '#6a7280'})}>ОДИН ИЗ САМЫХ ДРЕВНИХ СТРАХОВ</div>}
					{f >= know && <div style={html(1100, 470, pop(f, know, 9), {fontSize: 120, color: INK, textShadow: `7px 7px 0 ${YEL}`})}>ЗНАНИЯ</div>}
				</>
			}
		>
			{f >= know && (
				<g transform={`translate(1100,640) scale(${pop(f, know + 4, 10)})`}>
					<circle r={60} fill={YEL} opacity={0.35} />
					<path d="M -30,-10 C -30,-50 30,-50 30,-10 C 30,10 14,20 14,36 L -14,36 C -14,20 -30,10 -30,-10 Z" fill={YEL} stroke={INK} strokeWidth={5} />
					<rect x={-14} y={36} width={28} height={16} rx={4} fill="#9aa4b0" stroke={INK} strokeWidth={4} />
				</g>
			)}
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} brows={1} face={{eyes: 'open', mouth: 'smile', look: [-0.5, -0.2]}} />
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={armAt(1, f, [[0, 'down'], [know, 'point']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 72. could you stay calm under the ground? write in the comments =====
export const C72: React.FC = () => {
	const n = 72;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const write = w(n, 'пиши') - 6;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= 4 && (
						<div style={html(1100, 320, pop(f, 4, 11), {background: YEL, border: `7px solid ${INK}`, borderRadius: 30, padding: '10px 50px', fontSize: 110, color: INK})}>?</div>
					)}
					{f >= write && <div style={html(1100, 520, pop(f, write, 11), {...pill(INK), fontSize: 44})}>ПИШИ В КОММЕНТАРИЯХ 👇</div>}
				</>
			}
		>
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} face={{eyes: 'open', mouth: 'smile', brows: 'raised', look: [-0.5, -0.2]}} />
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={SHRUG} armL={mirror(SHRUG)} />
			</Stand>
		</Page>
	);
};

// ============================================================ 73. «подпишись»: CHOBI, the button, early access in the TG channel; Гога waves =====
export const C73: React.FC = () => {
	const n = 73;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const press = w(n, 'подпишись') - 6;
	const tgk = w(n, 'тгк') - 8;
	const link = w(n, 'ссылка') - 4;
	const armR = armAt(1, f, [[0, 'wave'], [press, PRESENT], [tgk, 'point'], [link + 14, 'wave']], g);
	const click = press + 22;
	const done = f >= click + 2;
	const cur = interpolate(f, [press + 6, press + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const pressK = f >= click && f < click + 5 ? 0.93 : 1;
	const L = len(n);
	const XC = 1100;
	return (
		<Page
			sx={stepX(f, HX, HX - 60).x} n={n}
			f={f}
			html={
				<>
					{f >= 6 && <div style={html(XC, 240, pop(f, 6, 12), {fontSize: 140, color: INK, textShadow: `9px 9px 0 ${YEL}`})}>CHOBI</div>}
					{f >= press && (
						<div style={html(XC, 450, pop(f, press, 12) * pressK, {background: done ? '#e4e4ea' : RED, color: done ? INK : '#fff', fontSize: 58, padding: '20px 50px 24px', borderRadius: 60, boxShadow: done ? 'none' : '0 8px 0 #8f1416'})}>
							{done ? 'ВЫ ПОДПИСАНЫ ✓' : 'ПОДПИСАТЬСЯ'}
						</div>
					)}
					{f >= press + 6 && f < click + 30 && (
						<svg width={80} height={90} viewBox="0 0 80 90" style={{position: 'absolute', left: 1480 - cur * 330, top: 760 - cur * 270, opacity: interpolate(f, [click + 20, click + 30], [1, 0], clamp)}}>
							<path d="M 6,4 L 6,70 L 22,56 L 34,84 L 46,78 L 34,52 L 56,52 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
						</svg>
					)}
					{f >= tgk && <div style={html(XC, 630, pop(f, tgk, 12), {background: '#2a9ad8', color: '#fff', fontSize: 44, padding: '14px 36px', borderRadius: 22})}>РАННИЙ ДОСТУП — В ТГК</div>}
					{f >= link && f < L && <div style={html(XC, 720, pop(f, link, 12), {fontSize: 32, color: '#6a7280', letterSpacing: 2})}>ССЫЛКА В ПРОФИЛЕ</div>}
				</>
			}
		>
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} brows={1} face={{eyes: 'open', mouth: 'smile', look: [-0.5, -0.1]}} armR={armAt(1, f, [[0, 'down'], [link, 'wave']], g)} />
			<Stand k={1} b={b}>
				<Choby x={stepX(f, HX, HX - 60).x} walk={stepX(f, HX, HX - 60).walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f >= press && f < tgk ? [0.8, -0.1] : [0.1, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

export const CHOBI_SHOTS: Partial<Record<number, React.FC>> = {
	6: C06,
	10: C10,
	11: C11,
	12: C12,
	23: C23,
	24: C24,
	25: C25,
	26: C26,
	27: C27,
	28: C28,
	29: C29,
	43: C43,
	44: C44,
	49: C49,
	50: C50,
	51: C51,
	63: C63,
	64: C64,
	68: C68,
	69: C69,
	70: C70,
	71: C71,
	72: C72,
	73: C73,
};

export const _SPREAD = SPREAD;
