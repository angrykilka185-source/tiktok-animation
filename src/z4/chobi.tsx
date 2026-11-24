// Чоби's own pages in «Каково это — умереть от лап медведя»: the intro; a person is not food (what a bear eats), why it
// attacks; the right way to meet one (stop, don't shout, no eye contact; talk low, arms up, back off sideways); its
// warnings; what it feels like (the heart, the tunnel vision, the stretched time; no pain at first; «беги» vs «стой»);
// food away from the tent; «what if it attacks?»; bear spray works 9 times in 10; the rules with Гога; «подпишись».
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp, pop} from '../anim';
import {Bear} from '../components/Bear';
import {Choby, type ArmSpec} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {armAt, FEET, HEART_PT, HX, INK, len, Line, mirror, Page, PRESENT, S, SHRUG, Stand, TEN, Title, useHost} from './chobiKit';
import {Forest, GROUND, RED, SprayCan, Tent, YEL, You} from './kit';
import {w} from './voice';

const BLUE = '#2f86e0';
const GREEN = '#3aa86a';
const ORANGE = '#f08a2a';
const BROWN = '#7a4a24';
const GX = 1720; // Гога on the page (the same spot on every page: no jumps at the cuts)
// Чоби steps aside (or back) at the start of a page instead of jumping at the cut
const stepX = (f: number, from: number, to: number, at = 0, dur = 14) => {
	const t = Math.max(0, Math.min(1, (f - at) / dur));
	return {x: from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)), walk: f >= at && f < at + dur ? (2 * Math.PI * (f - at)) / dur : undefined};
};
// Гога walks onto the page from the right (he never pops out of thin air)
const gogaIn = (f: number, at: number, toX: number, dur = 20) => {
	const t = Math.max(0, Math.min(1, (f - at) / dur));
	return {x: 2180 + (toX - 2180) * t * (2 - t), walk: f >= at && f < at + dur ? (6 * Math.PI * (f - at)) / dur : undefined};
};
// a bear walks onto the page from the right and stops
const bearIn = (f: number, at: number, toX: number, dur = 30) => {
	const t = Math.max(0, Math.min(1, (f - at) / dur));
	const e = t * t * (3 - 2 * t);
	return {x: 2200 + (toX - 2200) * e, on: f >= at && f < at + dur, amp: Math.min(1, t * 5, (1 - t) * 4)};
};
const html = (x: number, y: number, s: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: HEAVY, fontWeight: 900, whiteSpace: 'nowrap', ...extra});
const pill = (bg: string): React.CSSProperties => ({background: bg, color: '#fff', padding: '10px 26px', borderRadius: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.18)'});
const UP: ArmSpec = {el: [116, -436], ha: [148, -520], hang: 200}; // a hand up beside the head (both: «руки вверх»)

// ============================================================ 6. «Я — Чоби»: the title; what Гога does wrong; the rules =====
export const C06: React.FC = () => {
	const n = 6;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const t = w(n, 'каково') - 4;
	const claw = w(n, 'медведя') - 2;
	const goga = w(n, 'гога') - 6;
	const rules = w(n, 'правила') - 6;
	const go = w(n, 'поехали') - 6;
	const armR = armAt(1, f, [[0, 'wave'], [t - 8, PRESENT], [go, 'point']], g);
	const G = gogaIn(f, goga, 1700);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={t} x={1300} y={210} size={66} text="КАКОВО ЭТО —" />
					<Title f={f} at={t + 8} x={1300} y={300} size={70} color={BROWN} text="УМЕРЕТЬ" />
					<Title f={f} at={t + 14} x={1300} y={386} size={70} color={BROWN} text="ОТ ЛАП МЕДВЕДЯ" />
					{f >= goga && <div style={html(1180, 560, pop(f, goga, 11), {...pill(RED), fontSize: 36})}>✕ ЧТО ГОГА ДЕЛАЕТ НЕ ТАК</div>}
					{f >= rules && <div style={html(1180, 660, pop(f, rules, 11), {...pill(GREEN), fontSize: 36})}>✓ ПРАВИЛА, КОТОРЫЕ СПАСАЮТ</div>}
				</>
			}
		>
			{/* three claw marks across the title */}
			{f >= claw &&
				[0, 1, 2].map((i) => {
					const p = interpolate(f, [claw + i * 2, claw + i * 2 + 6], [0, 1], clamp);
					return <path key={i} d={`M ${1790 + i * 46},${160} L ${1790 + i * 46 - 90 * p},${160 + 250 * p}`} stroke={RED} strokeWidth={16} strokeLinecap="round" opacity={0.85} />;
				})}
			{f >= goga && <ellipse cx={G.x} cy={FEET + 6} rx={70} ry={14} fill="#000" opacity={0.09} />}
			{f >= goga && <You x={G.x} y={FEET} s={0.55} f={g} walk={G.walk} brows={1} face={{eyes: 'open', mouth: 'smile', look: [-0.6, 0]}} />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < t ? [0.1, 0.1] : [0.75, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 12. a person is not food: grass, berries, roots, nuts, fish =====
const Grass: React.FC = () => (
	<g>
		{[-36, -18, 0, 18, 36].map((x, i) => (
			<path key={i} d={`M ${x - 8},40 Q ${x - 4 + (i - 2) * 6},-10 ${x + (i - 2) * 12},${-50 + Math.abs(i - 2) * 10} Q ${x + 4},-6 ${x + 8},40 Z`} fill={i % 2 ? '#3a8a4a' : '#5fae4a'} />
		))}
	</g>
);
const Berries: React.FC = () => (
	<g>
		<path d="M 0,-30 C 20,-60 50,-50 54,-30 C 30,-36 16,-30 0,-30 Z" fill="#3a8a4a" />
		{[
			[-22, 0],
			[10, -6],
			[-4, 24],
			[28, 18],
			[-30, 30],
		].map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={17} fill="#d8283a" stroke="#8a1020" strokeWidth={3} />
		))}
	</g>
);
const Roots: React.FC = () => (
	<g>
		<path d="M -16,-44 C -18,0 -8,30 0,52 C 8,30 18,0 16,-44 Z" fill="#c8955a" stroke="#8a5a2a" strokeWidth={4} />
		<path d="M -6,0 L -30,20 M 8,14 L 32,30 M -2,30 L -20,46" stroke="#8a5a2a" strokeWidth={4} strokeLinecap="round" />
		<path d="M -10,-44 L -20,-66 M 0,-44 L 0,-70 M 10,-44 L 20,-66" stroke="#3a8a4a" strokeWidth={6} strokeLinecap="round" />
	</g>
);
const Nut: React.FC = () => (
	<g>
		<path d="M -30,-6 C -30,40 30,40 30,-6 Z" fill="#c8955a" stroke="#8a5a2a" strokeWidth={4} />
		<path d="M -36,-6 C -36,-34 36,-34 36,-6 Z" fill="#7a4a24" stroke="#4a2a10" strokeWidth={4} />
		<rect x={-4} y={-44} width={8} height={14} rx={3} fill="#4a2a10" />
	</g>
);
const Fish: React.FC = () => (
	<g>
		<path d="M -50,0 C -30,-30 30,-30 44,0 C 30,30 -30,30 -50,0 Z" fill="#e8806a" stroke="#a04a3a" strokeWidth={4} />
		<path d="M 40,0 L 64,-22 L 64,22 Z" fill="#e8806a" stroke="#a04a3a" strokeWidth={4} strokeLinejoin="round" />
		<circle cx={-28} cy={-6} r={5} fill={INK} />
		<path d="M -8,-14 C 0,-4 0,4 -8,14" stroke="#a04a3a" strokeWidth={3} fill="none" />
	</g>
);
export const C12: React.FC = () => {
	const n = 12;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const food = w(n, 'не', 0) - 4;
	const eats = w(n, 'большую') - 4;
	const items: [number, string, React.FC][] = [
		[w(n, 'траву') - 4, 'ТРАВА', Grass],
		[w(n, 'ягоды') - 4, 'ЯГОДЫ', Berries],
		[w(n, 'корни') - 4, 'КОРНИ', Roots],
		[w(n, 'орехи') - 4, 'ОРЕХИ', Nut],
		[w(n, 'рыбу') - 4, 'РЫБА', Fish],
	];
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= food && <div style={html(1320, 230, pop(f, food, 10), {...pill(RED), fontSize: 64})}>ЧЕЛОВЕК — НЕ ЕДА</div>}
					{f >= eats && <div style={html(1320, 370, pop(f, eats, 11), {fontSize: 40, color: '#6a7280'})}>БОЛЬШУЮ ЧАСТЬ ГОДА ОН ЕСТ:</div>}
					{items.map(([at, t], i) => (f >= at ? <div key={t} style={html(980 + i * 170, 640, pop(f, at, 11), {fontSize: 30, color: INK})}>{t}</div> : null))}
				</>
			}
		>
			{items.map(([at, t, Icon], i) =>
				f >= at ? (
					<g key={t} transform={`translate(${980 + i * 170},520) scale(${pop(f, at, 10) * 1.15})`}>
						<circle r={70} fill="#f4f1ea" />
						<Icon />
					</g>
				) : null,
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, 'down'], [food - 6, 'point'], [eats, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 13. it attacks people rarely — mostly in defence: surprised, near its cubs, near its kill =====
export const C13: React.FC = () => {
	const n = 13;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const rare = w(n, 'редко') - 6;
	const def = w(n, 'защищается') - 8;
	const L = [w(n, 'застали') - 6, w(n, 'медвежатам') - 10, w(n, 'добыче') - 8];
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= rare && <div style={html(1300, 220, pop(f, rare, 11), {...pill(GREEN), fontSize: 50})}>НАПАДАЕТ РЕДКО</div>}
					{f >= def && <div style={html(1300, 330, pop(f, def, 11), {...pill(ORANGE), fontSize: 44})}>ЧАЩЕ ВСЕГО — ЗАЩИЩАЕТСЯ</div>}
					<Line f={f} at={L[0]} x={900} y={470} size={42} ok={false} text="ЗАСТАЛИ ВРАСПЛОХ" />
					<Line f={f} at={L[1]} x={900} y={580} size={42} ok={false} text="ПОДОШЛИ К МЕДВЕЖАТАМ" />
					<Line f={f} at={L[2]} x={900} y={690} size={42} ok={false} text="ПОДОШЛИ К ЕГО ДОБЫЧЕ" />
				</>
			}
		>
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, PRESENT], [L[0], 'point']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 21. the right way: stop; don't shout; don't look it in the eyes — a challenge =====
export const C21: React.FC = () => {
	const n = 21;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const stop = w(n, 'остановись') - 6;
	const shout = w(n, 'кричи') - 6;
	const eyes = w(n, 'смотри') - 6;
	const dare = w(n, 'вызов') - 12;
	const B = bearIn(f, 4, 1660);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={4} x={1180} y={200} size={60} text="ПРАВИЛЬНО ТАК:" />
					<Line f={f} at={stop} x={880} y={330} size={46} text="ОСТАНОВИСЬ" />
					<Line f={f} at={shout} x={880} y={440} size={46} ok={false} text="НЕ КРИЧИ" />
					<Line f={f} at={eyes} x={880} y={550} size={46} ok={false} text="НЕ СМОТРИ В ГЛАЗА" />
					{f >= dare && <div style={html(1180, 650, pop(f, dare, 11), {fontSize: 34, color: '#8a6a5a'})}>ДЛЯ НЕГО ЭТО ВЫЗОВ</div>}
				</>
			}
		>
			<Bear x={B.x} y={FEET} s={0.55} pose={B.on ? 'walk' : 'stand4'} amp={B.on ? B.amp : 1} ph={(2200 - B.x) / 40} head={4} ears={f >= dare ? 'back' : 'up'} />
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f >= eyes ? [0.3, 0.7] : [0.8, 0]} armR={armAt(1, f, [[0, 'down'], [stop, TEN], [eyes + 20, 'down']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 22. talk calmly and low; arms up — look bigger; back off sideways, never your back to it =====
export const C22: React.FC = () => {
	const n = 22;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const talk = 4;
	const man = w(n, 'человек') - 10;
	const arms = w(n, 'подними') - 6;
	const big = w(n, 'кажешься') - 6;
	const back = w(n, 'медленно') - 6;
	const noBack = w(n, 'поворачиваясь') - 6;
	const sx = stepX(f, HX, HX - 160, back, 80);
	// the low, calm voice: slow long waves
	const waves = f < arms;
	const up = armAt(1, f, [[0, 'down'], [arms, UP]], g, 10);
	return (
		<Page
			sx={sx.x}
			n={n}
			f={f}
			html={
				<>
					<Line f={f} at={talk} x={880} y={220} size={42} text="ГОВОРИ СПОКОЙНО, НИЗКО" />
					{f >= man && <div style={html(1190, 286, pop(f, man, 11), {fontSize: 30, color: '#6a7280'})}>ОН ПОЙМЁТ: ПЕРЕД НИМ ЧЕЛОВЕК</div>}
					<Line f={f} at={arms} x={880} y={380} size={42} text="ПОДНИМИ РУКИ" />
					{f >= big && <div style={html(1110, 446, pop(f, big, 11), {fontSize: 30, color: '#6a7280'})}>ТАК ТЫ КАЖЕШЬСЯ БОЛЬШЕ</div>}
					<Line f={f} at={back} x={880} y={540} size={42} text="ОТСТУПАЙ БОКОМ, МЕДЛЕННО" />
					<Line f={f} at={noBack} x={880} y={650} size={42} ok={false} text="НЕ ПОВОРАЧИВАЙСЯ СПИНОЙ" />
				</>
			}
		>
			<Bear x={1720} y={FEET} s={0.55} pose="stand4" head={4} />
			{waves &&
				[0, 1, 2].map((i) => {
					const t = ((f / 36 + i / 3) % 1);
					return <path key={i} d={`M ${HX + 170 + t * 300},${FEET - 520 * S} q 30,-26 60,0 q 30,26 60,0`} stroke="#9aa1ae" strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.8} />;
				})}
			{/* «bigger»: his outline grows */}
			{f >= big && f < back + 20 && <ellipse cx={HX} cy={FEET - 380 * S} rx={260 * pop(f, big, 12)} ry={420 * pop(f, big, 12)} fill="none" stroke={GREEN} strokeWidth={8} strokeDasharray="20 14" opacity={0.7} />}
			<Stand k={1} b={b}>
				<Choby x={sx.x} walk={sx.walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.85, 0]} armR={up} armL={mirror(up)} />
			</Stand>
		</Page>
	);
};

// ============================================================ 28. the warnings: it huffs loudly, clacks its teeth, slaps the ground, pins its ears =====
export const C28: React.FC = () => {
	const n = 28;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const warn = w(n, 'предупреждает') - 6;
	const huff = w(n, 'пыхтит') - 6;
	const clack = w(n, 'щёлкает') - 4;
	const slap = w(n, 'бьёт') - 4;
	const ears = w(n, 'прижимает') - 4;
	const B = bearIn(f, 0, 1440, 26);
	const mouth = f >= clack && f < slap ? (Math.sin((f - clack) * 0.9) > 0 ? 0.55 : 0) : f >= huff && f < clack ? 0.25 : 0.1;
	const sl = f >= slap && f < ears + 10 ? Math.max(0, Math.sin(((f - slap) / 20) * Math.PI)) : 0;
	const X = B.x;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={warn} x={1300} y={170} size={58} text="ОН ПРЕДУПРЕЖДАЕТ:" />
					{f >= huff && <div style={html(1040, 280, pop(f, huff, 11), {...pill(ORANGE), fontSize: 36})}>ПЫХТИТ</div>}
					{f >= clack && <div style={html(1480, 280, pop(f, clack, 11), {...pill(ORANGE), fontSize: 36})}>ЩЁЛКАЕТ ЗУБАМИ</div>}
					{f >= slap && <div style={html(1040, 380, pop(f, slap, 11), {...pill(ORANGE), fontSize: 36})}>БЬЁТ ЛАПОЙ</div>}
					{f >= ears && <div style={html(1480, 380, pop(f, ears, 11), {...pill(RED), fontSize: 36})}>ПРИЖИМАЕТ УШИ</div>}
				</>
			}
		>
			<Bear x={X} y={FEET} s={0.75} pose={B.on ? 'walk' : 'stand4'} amp={B.on ? B.amp : 1} ph={(2200 - X) / 45} mouth={mouth} slap={sl} ears={f >= ears ? 'back' : 'up'} />
			{f >= huff &&
				f < clack + 20 &&
				[0, 1].map((i) => {
					const t = (((f - huff) / 14 + i / 2) % 1);
					return <circle key={i} cx={X - 238 - t * 70} cy={FEET - 200 - t * 16} r={10 + t * 20} fill="#cfd6e0" opacity={(1 - t) * 0.8} />;
				})}
			{sl > 0.9 && [0, 1, 2].map((i) => <circle key={i} cx={X - 96 + (i - 1) * 40} cy={FEET - 6} r={14} fill="#e6d2ae" opacity={0.8} />)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.85, 0]} armR={armAt(1, f, [[0, 'down'], [warn, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 31. the heart pounds in your ears; adrenaline narrows your sight; time stretches =====
export const C31: React.FC = () => {
	const n = 31;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const ears = w(n, 'стучит') - 6;
	const adr = w(n, 'адреналин') - 6;
	const only = w(n, 'видишь') - 6;
	const gone = w(n, 'исчезает') - 30;
	const time = w(n, 'время') - 6;
	const mins = w(n, 'секунды') - 6;
	const beat = Math.max(0, Math.sin((g / 6) * Math.PI)) ** 4;
	const R = interpolate(f, [only, gone + 30], [330, 120], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const tunnel = f >= adr && f < time + 10;
	const clockOn = f >= time;
	const hand = clockOn ? ((f - time) / 220) * 360 : 0;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= adr && f < time + 10 && <div style={html(1320, 200, pop(f, adr, 11) * interpolate(f, [time, time + 10], [1, 0], clamp), {...pill(ORANGE), fontSize: 46})}>АДРЕНАЛИН</div>}
					{f >= only && f < time + 10 && <div style={html(1320, 760, pop(f, only, 11) * interpolate(f, [time, time + 10], [1, 0], clamp), {fontSize: 34, color: '#6a7280'})}>ВИДИШЬ ТОЛЬКО МЕДВЕДЯ</div>}
					{clockOn && <div style={html(1320, 200, pop(f, time, 11), {...pill(BLUE), fontSize: 44})}>ВРЕМЯ РАСТЯГИВАЕТСЯ</div>}
					{f >= mins && <div style={html(1320, 760, pop(f, mins, 11), {fontSize: 46, color: INK})}>СЕКУНДЫ = МИНУТЫ</div>}
				</>
			}
		>
			{/* «тук-тук» in his ears */}
			{f >= ears &&
				[-1, 1].map((sd) => (
					<text key={sd} x={HX + sd * 230} y={FEET - 560 * S} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34 + beat * 12} fill={RED} opacity={0.5 + beat * 0.5}>
						ТУК
					</text>
				))}
			{/* the tunnel: the forest fades away, only the bear is left */}
			{tunnel && (
				<g transform={`translate(1320,480) scale(${pop(f, adr, 12) * interpolate(f, [time, time + 10], [1, 0], clamp)})`}>
					<defs>
						<clipPath id="c31frame">
							<rect x={-300} y={-200} width={600} height={400} rx={30} />
						</clipPath>
						<mask id="c31tunnel">
							<rect x={-300} y={-200} width={600} height={400} fill="#fff" />
							<circle cx={0} cy={20} r={R} fill="#000" />
						</mask>
					</defs>
					<g clipPath="url(#c31frame)">
						<g transform={`scale(0.42) translate(${-960},${-GROUND + 60})`}>
							<Forest tone="day" seed={63} />
							<Bear x={960} y={GROUND + 10} s={0.9} pose="stand4" ears="back" mouth={0.3} />
						</g>
						<rect x={-300} y={-200} width={600} height={400} fill="#0a0c14" opacity={0.92} mask="url(#c31tunnel)" />
					</g>
					<rect x={-300} y={-200} width={600} height={400} rx={30} fill="none" stroke={INK} strokeWidth={8} />
				</g>
			)}
			{/* the slow clock */}
			{clockOn && (
				<g transform={`translate(1320,480) scale(${pop(f, time + 4, 12)})`}>
					<circle r={200} fill="#ffffff" stroke={INK} strokeWidth={12} />
					{Array.from({length: 12}).map((_, i) => {
						const a = (i / 12) * Math.PI * 2;
						return <line key={i} x1={Math.sin(a) * 168} y1={-Math.cos(a) * 168} x2={Math.sin(a) * 186} y2={-Math.cos(a) * 186} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
					})}
					<line x1={0} y1={0} x2={Math.sin((hand * Math.PI) / 180) * 160} y2={-Math.cos((hand * Math.PI) / 180) * 160} stroke={RED} strokeWidth={8} strokeLinecap="round" />
					<circle r={14} fill={INK} />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.7, -0.1]} armR={armAt(1, f, [[0, HEART_PT], [adr, PRESENT]], g)} armL="hip" heart={{beat, size: 1.1}} heartOver sweat={f >= adr ? 0.6 : 0} />
			</Stand>
		</Page>
	);
};

// ============================================================ 32. survivors say: at first you hardly feel pain; adrenaline numbs it; the body fights to save you =====
export const C32: React.FC = () => {
	const n = 32;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const pain = w(n, 'боли') - 6;
	const adr = w(n, 'адреналин') - 6;
	const body = w(n, 'тело') - 6;
	const needle = interpolate(f, [pain, pain + 30], [0.0, 0.18], clamp);
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= 6 && <div style={html(1300, 190, pop(f, 6, 11), {fontSize: 34, color: '#6a7280'})}>ТЕ, КТО ВЫЖИЛ, РАССКАЗЫВАЮТ:</div>}
					{f >= pain && <div style={html(1300, 300, pop(f, pain, 11), {fontSize: 52, color: INK})}>«БОЛИ ПОЧТИ НЕ ЧУВСТВУЕШЬ»</div>}
					{f >= adr && <div style={html(1300, 650, pop(f, adr, 11), {...pill(ORANGE), fontSize: 42})}>АДРЕНАЛИН ГЛУШИТ БОЛЬ</div>}
					{f >= body && <div style={html(1300, 755, pop(f, body, 11), {...pill(GREEN), fontSize: 42})}>ТЕЛО ДЕЛАЕТ ВСЁ, ЧТОБЫ ТЫ СПАССЯ</div>}
				</>
			}
		>
			{/* the pain gauge stays low */}
			{f >= pain && (
				<g transform={`translate(1300,530) scale(${pop(f, pain + 4, 11) * 0.7})`}>
					<path d="M -220,0 A 220,220 0 0 1 220,0" stroke="#e6e9ee" strokeWidth={40} fill="none" />
					<path d="M -220,0 A 220,220 0 0 1 -156,-156" stroke={GREEN} strokeWidth={40} fill="none" />
					<path d="M 156,-156 A 220,220 0 0 1 220,0" stroke={RED} strokeWidth={40} fill="none" />
					<line x1={0} y1={0} x2={-Math.cos(needle * Math.PI) * 180} y2={-Math.sin(needle * Math.PI) * 180} stroke={INK} strokeWidth={12} strokeLinecap="round" />
					<circle r={20} fill={INK} />
					<text x={0} y={60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={INK}>
						БОЛЬ
					</text>
				</g>
			)}
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, 'down'], [pain, PRESENT]], g)} armL="hip" brain={f >= adr ? 0.7 : 0} />
			</Stand>
		</Page>
	);
};

// ============================================================ 33. the body screams «run» — the head must say «stop» =====
export const C33: React.FC = () => {
	const n = 33;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const run = w(n, 'беги') - 8;
	const head = w(n, 'голова') - 6;
	const stop = w(n, 'стой') - 8;
	const shake = f >= run && f < head ? Math.sin(f * 2.2) * 4 : 0;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					{f >= run && <div style={html(1180 + shake, 560, pop(f, run, 9), {...pill(RED), fontSize: 64})}>ТЕЛО: БЕГИ!</div>}
					{f >= stop && <div style={html(1180, 280, pop(f, stop, 10), {...pill(GREEN), fontSize: 64})}>ГОЛОВА: СТОЙ.</div>}
				</>
			}
		>
			<Stand k={1} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.7, -0.2]} armR={armAt(1, f, [[0, HEART_PT], [head, 'point']], g)} armL="hip" heart={{beat: f < head ? Math.max(0, Math.sin((g / 5) * Math.PI)) ** 4 : 0.2, size: 1.05}} heartOver brain={f >= head ? 0.6 : 0} />
			</Stand>
		</Page>
	);
};

// ============================================================ 41. keep food away from the tent, in tight containers; cook and eat aside; take your rubbish =====
const Canister: React.FC = () => (
	<g>
		<rect x={-46} y={-120} width={92} height={120} rx={18} fill="#2f6a48" stroke="#1d4030" strokeWidth={6} />
		<rect x={-52} y={-132} width={104} height={24} rx={10} fill="#24563a" stroke="#1d4030" strokeWidth={6} />
		<rect x={-46} y={-80} width={92} height={10} fill="#1d4030" opacity={0.5} />
	</g>
);
export const C41: React.FC = () => {
	const n = 41;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const far = w(n, 'подальше') - 6;
	const box = w(n, 'контейнерах') - 10;
	const cook = w(n, 'готовь') - 6;
	const trash = w(n, 'мусор') - 6;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Line f={f} at={far} x={880} y={200} size={40} text="ЕДУ — ПОДАЛЬШЕ ОТ ПАЛАТКИ" />
					<Line f={f} at={box} x={880} y={300} size={40} text="В ПЛОТНЫХ КОНТЕЙНЕРАХ" />
					<Line f={f} at={cook} x={880} y={400} size={40} text="ГОТОВЬ И ЕШЬ В СТОРОНЕ" />
					<Line f={f} at={trash} x={880} y={500} size={40} text="МУСОР — С СОБОЙ" />
				</>
			}
		>
			{f >= far && (
				<g opacity={pop(f, far, 12)}>
					<g transform={`translate(1060,${FEET}) scale(0.42)`}>
						<Tent x={0} y={0} />
					</g>
					<path d={`M 1180,${FEET - 60} L 1600,${FEET - 60}`} stroke="#9aa1ae" strokeWidth={8} strokeDasharray="20 14" strokeLinecap="round" />
					<path d={`M 1576,${FEET - 80} L 1604,${FEET - 60} L 1576,${FEET - 40}`} stroke="#9aa1ae" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
			)}
			{f >= box && (
				<g transform={`translate(1700,${FEET}) scale(${pop(f, box, 10)})`}>
					<Canister />
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, 'down'], [far, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 49. the most important thing: what if a brown bear does attack? =====
export const C49: React.FC = () => {
	const n = 49;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const main = w(n, 'главное') - 8;
	const q = w(n, 'бурый') - 8;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= main && <div style={html(1300, 230, pop(f, main, 10), {fontSize: 96, color: INK, textShadow: `6px 6px 0 ${YEL}`})}>САМОЕ ГЛАВНОЕ</div>}
					{f >= q && <div style={html(1300, 400, pop(f, q, 11), {fontSize: 54, color: RED})}>ЧТО ДЕЛАТЬ, ЕСЛИ</div>}
					{f >= q + 8 && <div style={html(1300, 480, pop(f, q + 8, 11), {fontSize: 54, color: RED})}>МЕДВЕДЬ НАПАЛ?</div>}
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={armAt(1, f, [[0, 'down'], [main - 6, 'point']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 56. Alaska: dozens of cases; the spray stopped a brown bear 9 times in 10 =====
const CAN: ArmSpec = {el: [118, -352], ha: [140, -440], hang: 194, fist: true, item: <g transform="scale(0.7)"><SprayCan /></g>, itemAng: 0};
export const C56: React.FC = () => {
	const n = 56;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const ak = w(n, 'аляске') - 6;
	const cases = w(n, 'десятки') - 6;
	const stop = w(n, 'останавливал') - 6;
	const nine = w(n, 'девяти') - 6;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= ak && <div style={html(1050, 190, pop(f, ak, 11), {...pill(BLUE), fontSize: 40})}>АЛЯСКА</div>}
					{f >= cases && <div style={html(1480, 190, pop(f, cases, 11), {...pill(INK), fontSize: 40})}>ДЕСЯТКИ СЛУЧАЕВ</div>}
					{f >= nine && <div style={html(1320, 700, pop(f, nine, 10), {fontSize: 110, color: GREEN, textShadow: `6px 6px 0 ${INK}`})}>9 ИЗ 10</div>}
					{f >= stop && <div style={html(1320, 800, pop(f, stop, 11), {fontSize: 30, color: '#6a7280'})}>БАЛЛОНЧИК ОСТАНОВИЛ МЕДВЕДЯ</div>}
					<div style={{position: 'absolute', right: 34, top: 26, fontFamily: HEAVY, fontWeight: 900, fontSize: 22, color: '#8a7a6a'}}>Smith и др., 2008</div>
				</>
			}
		>
			{f >= cases &&
				Array.from({length: 10}).map((_, i) => {
					const col = i % 5;
					const row = Math.floor(i / 5);
					const ok = f >= nine + i * 2 && i < 9;
					return (
						<g key={i} transform={`translate(${1000 + col * 160},${360 + row * 140}) scale(${pop(f, cases + i * 2, 11)})`}>
							<circle r={58} fill={ok ? '#e6f4ea' : '#f1f1f1'} stroke={ok ? GREEN : '#c8c8c8'} strokeWidth={6} />
							<g transform="translate(0,36) scale(0.19)">
								<Bear pose="stand4" fur={ok ? 'brown' : 'brown'} />
							</g>
							{ok && (
								<g transform={`translate(36,-36) scale(${pop(f, nine + i * 2, 9)})`}>
									<circle r={20} fill={GREEN} />
									<path d="M -9,0 L -2,8 L 10,-8" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</g>
							)}
						</g>
					);
				})}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.1]} armR={armAt(1, f, [[0, CAN], [nine, PRESENT]], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 61. «Итак, Гога, повторим» — Гога comes to the page =====
export const C61: React.FC = () => {
	const n = 61;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const G = gogaIn(f, 4, GX);
	return (
		<Page n={n} f={f} shadow={k} html={<>{f >= 10 && <div style={html(1120, 300, pop(f, 10, 11), {fontSize: 72, color: INK, textShadow: `5px 5px 0 ${YEL}`})}>ПОВТОРИМ</div>}</>}>
			<ellipse cx={G.x} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={G.x} y={FEET} s={0.8} f={g} walk={G.walk} face={{eyes: 'open', brows: 'neutral', mouth: 'flat', look: [-0.6, 0]}} />
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.8, 0]} armR={armAt(1, f, [[0, 'wave'], [12, 'point']], g)} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 62. the rules, line by line =====
export const C62: React.FC = () => {
	const n = 62;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const L = [w(n, 'шуми') - 6, w(n, 'беги') - 8, w(n, 'говори') - 6, w(n, 'медвежат') - 8, w(n, 'еду') - 6, w(n, 'корми') - 10, w(n, 'ложись') - 8, w(n, 'дерись') - 8];
	const TXT: [string, boolean][] = [
		['ШУМИ, ХОДИ КОМПАНИЕЙ', true],
		['НЕ БЕГИ, НЕ ЛЕЗЬ НА ДЕРЕВО', false],
		['ГОВОРИ СПОКОЙНО, ОТСТУПАЙ', true],
		['МЕДВЕЖАТА — СРАЗУ УХОДИ', true],
		['ЕДА — НЕ В ПАЛАТКЕ', false],
		['НЕ КОРМИ МЕДВЕДЕЙ', false],
		['НАПАЛ — НА ЖИВОТ, ЗАКРОЙ ШЕЮ', true],
		['ОХОТИТСЯ — ДЕРИСЬ', true],
	];
	return (
		<Page
			sx={stepX(f, HX, HX - 60).x}
			n={n}
			f={f}
			html={
				<>
					{TXT.map(([t, ok], i) => (
						<Line key={t} f={f} at={L[i]} x={780} y={190 + i * 82} size={34} ok={ok} text={t} />
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

// ============================================================ 63. Гога nods: remembered =====
export const C63: React.FC = () => {
	const n = 63;
	const {f, g, jaw, blink, tilt, b} = useHost(n);
	const nod = Math.sin(f / 3) * 8 * Math.max(0, 1 - f / 40);
	const got = w(n, 'запомнил') - 8;
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

// ============================================================ 65. have you met a bear in the forest? write in the comments =====
export const C65: React.FC = () => {
	const n = 65;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const write = w(n, 'пиши') - 6;
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					{f >= 4 && <div style={html(1100, 300, pop(f, 4, 11), {background: YEL, border: `7px solid ${INK}`, borderRadius: 30, padding: '10px 50px', fontSize: 110, color: INK})}>?</div>}
					{f >= 12 && <div style={html(1100, 450, pop(f, 12, 11), {fontSize: 46, color: INK})}>ВСТРЕЧАЛ МЕДВЕДЯ?</div>}
					{f >= write && <div style={html(1100, 570, pop(f, write, 11), {...pill(INK), fontSize: 44})}>ПИШИ В КОММЕНТАРИЯХ 👇</div>}
				</>
			}
		>
			<ellipse cx={GX} cy={FEET + 6} rx={104} ry={14} fill="#000" opacity={0.09} />
			<You x={GX} y={FEET} s={0.8} f={g} face={{eyes: 'open', mouth: 'smile', brows: 'raised', look: [-0.5, -0.2]}} />
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={[0.75, -0.2]} armR={SHRUG} armL={mirror(SHRUG)} />
			</Stand>
		</Page>
	);
};

// ============================================================ 66. «подпишись»: CHOBI, the button, early access in the TG channel; Гога waves =====
export const C66: React.FC = () => {
	const n = 66;
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
	const sx = stepX(f, HX, HX - 60);
	return (
		<Page
			sx={sx.x}
			n={n}
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
				<Choby x={sx.x} walk={sx.walk} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f >= press && f < tgk ? [0.8, -0.1] : [0.1, 0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

export const CHOBI_SHOTS: Partial<Record<number, React.FC>> = {
	6: C06,
	12: C12,
	13: C13,
	21: C21,
	22: C22,
	28: C28,
	31: C31,
	32: C32,
	33: C33,
	41: C41,
	49: C49,
	56: C56,
	61: C61,
	62: C62,
	63: C63,
	65: C65,
	66: C66,
};
