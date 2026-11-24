// «Каково это — умереть от лап медведя» — shots 57–60 (the man who lived among grizzlies in Alaska; autumn 2003; the
// film; a bear is not a plush toy) and 64 (the master of the forest: know its rules and you just go your separate ways).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Bear, BearFront} from '../components/Bear';
import {Person} from '../components/Person';
import {arm, camAt, Chip, Forest, GROUND, HEAVY, INK, Layer, Mountains, Plaque, RED, rnd, Spruce, Stage16, Tent, Vig, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const stepPh = (dist: number, k = 1) => (dist / 44) * k;
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
const ss = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const GREEN = '#3a8a4a';
const BROWN = '#7a4a24';

const Turn: React.FC<{x: number; y: number; k: number; children: React.ReactNode}> = ({x, y, k, children}) => (
	<g transform={`translate(${x},${y}) scale(${Math.abs(k) < 0.06 ? (k < 0 ? -0.06 : 0.06) : k},1)`}>{children}</g>
);
const stroll = (f: number, t0: number, t1: number, a: number, b: number) => {
	const t = interpolate(f, [t0, t1], [0, 1], clamp);
	return {x: a + (b - a) * ss(t), on: f >= t0 && f < t1, amp: Math.min(1, t * 5, (1 - t) * 4)};
};

// ============================================================ Alaska: mountains, a meadow, a few spruces (summer / autumn / dusk) =====
type Season = 'summer' | 'autumn' | 'dusk';
const SEASON: Record<Season, {sky0: string; sky1: string; ground: string; groundD: string; mtn: string; tree: string; treeD: string}> = {
	summer: {sky0: '#8fc0e6', sky1: '#e4f1f4', ground: '#8fbf62', groundD: '#6fa04a', mtn: '#7a8aa6', tree: '#2f6a48', treeD: '#24563a'},
	autumn: {sky0: '#9cbfe0', sky1: '#f2e6c8', ground: '#c9a24a', groundD: '#a8822e', mtn: '#8a8aa0', tree: '#3a5a3a', treeD: '#2c482c'},
	dusk: {sky0: '#2c2c4a', sky1: '#b47a6a', ground: '#6a5a3a', groundD: '#54462c', mtn: '#4a4a62', tree: '#24302a', treeD: '#1a241e'},
};
const Alaska: React.FC<{season?: Season; seed?: number}> = ({season = 'summer', seed = 1}) => {
	const P = SEASON[season];
	return (
		<g>
			<defs>
				<linearGradient id={`ak${season}${seed}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={P.sky0} />
					<stop offset="1" stopColor={P.sky1} />
				</linearGradient>
			</defs>
			<rect x={-400} y={-400} width={2720} height={GROUND + 300} fill={`url(#ak${season}${seed})`} />
			<Mountains y={GROUND - 150} c={P.mtn} />
			{Array.from({length: 22}).map((_, i) => (
				<Spruce key={i} x={-60 + i * 92 + rnd(i + seed) * 40} y={GROUND - 140} h={150 + rnd(i + seed * 3) * 110} c={P.tree} d={P.treeD} trunk="#4a3020" />
			))}
			<rect x={-400} y={GROUND - 150} width={2720} height={900} fill={P.ground} />
			{Array.from({length: 40}).map((_, i) => {
				const x = rnd(i + seed * 17) * 1920;
				const y = GROUND - 120 + rnd(i + seed * 19) * 330;
				return <path key={i} d={`M ${x - 12},${y} l 4,-22 l 6,18 l 6,-24 l 4,26 Z`} fill={P.groundD} />;
			})}
		</g>
	);
};
// the man (a plain figure in dark clothes, fair hair)
const MAN = {top: '#2a2a30', topDark: '#1a1a20', pants: '#3a3a44', shoes: '#5a4a3a', hair: '#e2c26a', skin: '#efc6a4'};
const Man: React.FC<{x: number; f: number; walk?: number; look?: [number, number]; mouth?: string; armR?: {target: [number, number]; bend?: 1 | -1}}> = ({x, f, walk, look = [0.6, 0], mouth = 'smile', armR}) => (
	<Person kind="dad" id="z4man" x={x} y={GROUND} scale={0.38} walk={walk} breathe={f} colors={MAN} plain kneePatch={false} face={{eyes: 'open', mouth: mouth as never, brows: 'neutral', blush: false, look}} armR={armR} />
);

// ============================================================ 57. thirteen summers among the grizzlies in Alaska; close up, names, talk — «friends» =====
export const S57: React.FC = () => {
	const f = useCurrentFrame();
	const n = 57;
	const name = 4;
	const years = w(n, 'тринадцать') - 6;
	const alaska = w(n, 'аляске') - 10;
	const close = w(n, 'подходил') - 6;
	const names = w(n, 'имена') - 8;
	const talk = w(n, 'разговаривал') - 6;
	const friends = w(n, 'друзья') - 16;
	const a = stroll(f, 0, years, 160, 520);
	const b = stroll(f, close, close + 40, 520, 960);
	const mx = f < close ? a.x : b.x;
	const walking = a.on || b.on;
	const G1 = 1300;
	const G2 = 1660;
	const talking = f >= talk && f < friends + 20;
	return (
		<AbsoluteFill>
			<Stage16 bg="#8fc0e6">
				<Alaska season="summer" seed={3} />
				<Bear x={G2} y={GROUND - 30} s={0.62} fur="grizzly" pose="stand4" head={24 + Math.sin(f / 13) * 6} />
				<Bear x={G1} y={GROUND + 10} s={0.8} fur="grizzly" pose="stand4" head={f >= close + 30 ? -4 : 22 + Math.sin(f / 11) * 5} />
				<Man x={mx} f={f} walk={walking ? stepPh(mx - 160, 0.9) : undefined} look={[0.8, 0]} mouth={talking ? (Math.sin(f / 3.6) > 0 ? 'open' : 'smile') : 'smile'} armR={f >= talk ? {target: [150, -560], bend: 1} : undefined} />
				{/* thirteen summers */}
				{f >= years &&
					Array.from({length: 13}).map((_, i) => (
						<g key={i} transform={`translate(${420 + i * 90},210) scale(${pop(f, years + i * 2, 11) * 0.5})`}>
							<circle r={34} fill={YEL} stroke="#e0a020" strokeWidth={5} />
							{Array.from({length: 8}).map((_, k) => {
								const an = (k / 8) * Math.PI * 2;
								return <line key={k} x1={Math.cos(an) * 46} y1={Math.sin(an) * 46} x2={Math.cos(an) * 62} y2={Math.sin(an) * 62} stroke="#e0a020" strokeWidth={7} strokeLinecap="round" />;
							})}
						</g>
					))}
				{/* names: a tag over each bear */}
				{f >= names &&
					[
						[G1 - 120, GROUND - 330],
						[G2 - 90, GROUND - 270],
					].map(([x, y], i) => (
						<g key={i} transform={`translate(${x},${y}) scale(${pop(f, names + i * 6, 10)})`}>
							<rect x={-70} y={-30} width={140} height={60} rx={16} fill="#ffffff" stroke={INK} strokeWidth={5} />
							<circle cx={-40} cy={0} r={9} fill="#e8507a" />
							<rect x={-20} y={-10} width={70} height={8} rx={4} fill="#9aa1ae" />
							<rect x={-20} y={6} width={48} height={8} rx={4} fill="#9aa1ae" />
						</g>
					))}
				{/* «friends»: hearts round him */}
				{f >= friends &&
					[0, 1, 2].map((k) => {
						const t = ((f - friends) / 40 + k / 3) % 1;
						return <path key={k} transform={`translate(${mx - 50 + k * 50},${GROUND - 500 - t * 90}) scale(${0.9 + t * 0.4})`} d="M 0,14 C -22,0 -24,-18 -11,-20 C -4,-21 0,-16 0,-12 C 0,-16 4,-21 11,-20 C 24,-18 22,0 0,14 Z" fill="#e8507a" opacity={(1 - t) * 0.95} />;
					})}
			</Stage16>
			{talking && f < friends && (
				<div style={{position: 'absolute', left: mx + 210, top: 360, transform: `translate(-50%,-50%) scale(${pop(f, talk, 10)})`, background: '#fff', border: `6px solid ${INK}`, borderRadius: 24, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>… … …</div>
			)}
			<Plaque f={f} at={name} x={960} y={130} text="ТИМОТИ ТРЕДУЭЛЛ" sub="АЛЯСКА, США" color="#e2c26a" size={44} to={years - 4} />
			<Chip f={f} at={years + 10} x={960} y={110} text="13 ЛЕТ ПОДРЯД — КАЖДОЕ ЛЕТО" color="#c08a10" size={44} to={close - 4} />
			<Chip f={f} at={alaska} x={1440} y={330} text="СРЕДИ ГРИЗЛИ" color={BROWN} size={44} to={close - 4} />
			<Chip f={f} at={close + 10} x={960} y={110} text="ВПЛОТНУЮ К МЕДВЕДЯМ" color={RED} size={44} to={names - 4} />
			<Chip f={f} at={names + 4} x={960} y={110} text="ДАВАЛ ИМЕНА" color={BROWN} size={44} to={talk - 4} />
			<Chip f={f} at={talk + 4} x={960} y={110} text="РАЗГОВАРИВАЛ С НИМИ" color={BROWN} size={44} to={friends - 4} />
			<Chip f={f} at={friends + 6} x={960} y={110} text="ВЕРИЛ, ЧТО ОНИ — ДРУЗЬЯ" color="#e8507a" size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 58. autumn 2003: he stayed in camp longer than usual; in autumn the bears are hungriest — fat for the winter =====
export const S58: React.FC = () => {
	const f = useCurrentFrame();
	const n = 58;
	const stay = w(n, 'задержался') - 6;
	const hungry = w(n, 'медведи') - 6;
	const fat = w(n, 'набрать') - 6;
	const bar = interpolate(f, [stay + 6, stay + 40], [0, 1], {...clamp, easing: ss});
	const g = stroll(f, hungry - 10, hungry + 40, 2120, 1480);
	return (
		<AbsoluteFill>
			<Stage16 bg="#9cbfe0">
				<Alaska season="autumn" seed={5} />
				<Tent x={640} y={GROUND + 8} />
				{/* the falling leaves */}
				{Array.from({length: 18}).map((_, i) => {
					const sp = 1.4 + rnd(i + 3) * 1.6;
					const y = ((rnd(i + 9) * 900 + f * sp) % 980) - 40;
					const x = rnd(i + 13) * 1920 + Math.sin(f / 20 + i) * 40;
					return <ellipse key={i} cx={x} cy={y} rx={10} ry={5} transform={`rotate(${(f * 3 + i * 40) % 360} ${x} ${y})`} fill={i % 2 ? '#e0902a' : '#c8501e'} />;
				})}
				{f >= hungry - 10 && <Bear x={g.x} y={GROUND + 10} s={0.8} fur="grizzly" pose={g.on ? 'walk' : 'stand4'} amp={g.on ? g.amp : 1} ph={(2120 - g.x) / 45} head={g.on ? 0 : 10} mouth={g.on ? 0 : 0.2} />}
				{/* the fat it needs for its sleep: the gauge fills toward the line */}
				{f >= fat && (
					<g transform={`translate(1700,330) scale(${pop(f, fat, 11)})`}>
						<rect x={-50} y={-130} width={100} height={260} rx={20} fill="#ffffff" stroke={INK} strokeWidth={7} />
						<rect x={-20} y={-146} width={40} height={18} rx={6} fill={INK} />
						<rect x={-38} y={118 - interpolate(f, [fat, fat + 50], [50, 210], clamp)} width={76} height={interpolate(f, [fat, fat + 50], [50, 210], clamp)} rx={10} fill="#e0a020" />
						<line x1={-64} y1={-80} x2={64} y2={-80} stroke={RED} strokeWidth={6} strokeDasharray="12 8" />
						<text x={0} y={180} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#ffffff" stroke={INK} strokeWidth={8} paintOrder="stroke">
							ЖИР
						</text>
					</g>
				)}
			</Stage16>
			{/* the usual time in camp, and how far past it he stayed */}
			{f >= stay && (
				<div style={{position: 'absolute', left: 560, top: 250, width: 800, transform: `scale(${pop(f, stay, 11)})`, transformOrigin: 'left center', fontFamily: HEAVY, fontWeight: 900}}>
					<div style={{display: 'flex', height: 46, borderRadius: 14, overflow: 'hidden', border: `5px solid ${INK}`, background: '#ffffff'}}>
						<div style={{width: '62%', background: '#8a9aa8'}} />
						<div style={{width: `${38 * bar}%`, background: RED}} />
					</div>
					<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 26, color: INK}}>
						<span>ОБЫЧНО</span>
						<span style={{color: RED, opacity: bar}}>ЗАДЕРЖАЛСЯ</span>
					</div>
				</div>
			)}
			<Plaque f={f} at={4} x={960} y={110} text="ОСЕНЬ 2003" color="#e0902a" size={50} to={hungry - 4} />
			<Chip f={f} at={hungry + 6} x={960} y={110} text="ОСЕНЬЮ МЕДВЕДИ ГОЛОДНЫЕ" color={RED} size={46} />
			<Chip f={f} at={fat + 10} x={1380} y={470} text="ЖИР ПЕРЕД СПЯЧКОЙ" color="#c08a10" size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 59. Treadwell and his girlfriend Amie died; later a film was made about him =====
export const S59: React.FC = () => {
	const f = useCurrentFrame();
	const n = 59;
	const died = w(n, 'погибли') - 6;
	const film = w(n, 'сняли') - 10;
	const dark = interpolate(f, [film - 6, film + 8], [0, 1], {...clamp, easing: ss});
	const gray = interpolate(f, [0, died + 10], [0.2, 0.85], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: `grayscale(${gray})`}}>
				<Stage16 bg="#2c2c4a">
					<Alaska season="dusk" seed={7} />
					<Tent x={900} y={GROUND + 8} />
					{Array.from({length: 10}).map((_, i) => {
						const x = ((rnd(i + 3) * 2200 - f * (3 + rnd(i) * 3)) % 2200 + 2200) % 2200 - 140;
						const y = GROUND - 120 + rnd(i + 7) * 200 + Math.sin(f / 9 + i) * 14;
						return <ellipse key={i} cx={x} cy={y} rx={9} ry={4} fill="#a8822e" opacity={0.8} />;
					})}
				</Stage16>
			</AbsoluteFill>
			<Vig k={0.55} />
			{f >= died && f < film + 8 && <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 72, color: '#ffffff', opacity: pop(f, died, 14) * (1 - dark), textShadow: '0 6px 20px rgba(0,0,0,0.6)'}}>ТРЕДУЭЛЛ И ЭМИ ПОГИБЛИ</div>}
			{dark > 0 && (
				<AbsoluteFill style={{background: `rgba(10,10,14,${0.95 * dark})`}}>
					{f >= film && (
						<div style={{position: 'absolute', left: 960, top: 470, transform: `translate(-50%,-50%) scale(${pop(f, film, 12)})`, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap'}}>
							<svg width={180} height={130} viewBox="0 0 180 130" style={{display: 'block', margin: '0 auto 24px'}}>
								<rect x={10} y={40} width={160} height={84} rx={8} fill="#2a2a30" stroke="#ffffff" strokeWidth={5} />
								<path d="M 10,40 L 22,10 L 172,10 L 170,40 Z" fill="#ffffff" />
								{[0, 1, 2, 3].map((k) => (
									<path key={k} d={`M ${40 + k * 36},10 L ${28 + k * 36},40`} stroke="#2a2a30" strokeWidth={12} />
								))}
							</svg>
							<div style={{fontSize: 34, color: '#b8c4d8', letterSpacing: 4}}>ФИЛЬМ</div>
							<div style={{fontSize: 92}}>«ЧЕЛОВЕК-ГРИЗЛИ»</div>
							<div style={{fontSize: 40, color: '#b8c4d8', marginTop: 6}}>2005</div>
						</div>
					)}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 60. a bear is not a plush toy; even calm — a wild animal =====
const Teddy: React.FC = () => (
	<g>
		{[-1, 1].map((sd) => (
			<g key={sd}>
				<circle cx={sd * 92} cy={-250} r={44} fill="#c8955a" stroke="#8a5a2a" strokeWidth={7} />
				<circle cx={sd * 92} cy={-250} r={22} fill="#f0c890" />
				<ellipse cx={sd * 120} cy={-60} rx={48} ry={70} fill="#c8955a" stroke="#8a5a2a" strokeWidth={7} transform={`rotate(${sd * -24} ${sd * 120} -60)`} />
				<ellipse cx={sd * 70} cy={40} rx={58} ry={46} fill="#c8955a" stroke="#8a5a2a" strokeWidth={7} />
				<ellipse cx={sd * 70} cy={46} rx={30} ry={24} fill="#f0c890" />
			</g>
		))}
		<ellipse cx={0} cy={-40} rx={120} ry={110} fill="#c8955a" stroke="#8a5a2a" strokeWidth={7} />
		<ellipse cx={0} cy={-20} rx={70} ry={66} fill="#f0c890" />
		<circle cx={0} cy={-190} r={110} fill="#c8955a" stroke="#8a5a2a" strokeWidth={7} />
		<ellipse cx={0} cy={-160} rx={52} ry={40} fill="#f0c890" />
		<ellipse cx={0} cy={-176} rx={18} ry={13} fill="#3a2414" />
		<path d="M -14,-148 Q 0,-136 14,-148" stroke="#3a2414" strokeWidth={5} fill="none" strokeLinecap="round" />
		{[-1, 1].map((sd) => (
			<circle key={sd} cx={sd * 40} cy={-210} r={11} fill="#1a1a1a" />
		))}
		<path d="M -40,-92 L 0,-80 L 40,-92 L 40,-60 L 0,-72 L -40,-60 Z" fill="#e8507a" stroke="#a02a4a" strokeWidth={4} />
		<circle cx={0} cy={-76} r={12} fill="#e8507a" stroke="#a02a4a" strokeWidth={4} />
	</g>
);
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const n = 60;
	const toy = w(n, 'игрушка') - 10;
	const calm = w(n, 'даже') - 6;
	const wild = w(n, 'дикий') - 10;
	const cam = camAt(f, wild, wild + 16, {s: 1, cx: 960, cy: 540}, {s: 1.35, cx: 960, cy: 520});
	return (
		<AbsoluteFill>
			{f < calm ? (
				<AbsoluteFill style={{background: '#fbe9ef'}}>
					<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
						<g transform={`translate(960,${680 + Math.sin(f / 10) * 6}) scale(${1.25 * pop(f, 0, 12)})`}>
							<Teddy />
						</g>
						{f >= toy && (
							<g transform={`translate(960,520) scale(${pop(f, toy, 9)})`}>
								<path d="M -260,-260 L 260,260 M 260,-260 L -260,260" stroke={RED} strokeWidth={38} strokeLinecap="round" opacity={0.92} />
							</g>
						)}
					</svg>
					<Plaque f={f} at={toy + 4} x={960} y={130} text="НЕ ПЛЮШЕВАЯ ИГРУШКА" color={RED} size={50} />
				</AbsoluteFill>
			) : (
				<Stage16 bg="#8fc8ee">
					<Layer cam={cam}>
						<Forest tone="day" seed={57} />
						{f < wild ? <Bear x={1060} y={GROUND + 10} s={0.85} pose="stand4" head={26 + Math.sin(f / 12) * 4} eyes={Math.sin(f / 20) > 0.3 ? 'closed' : 'open'} /> : <BearFront x={960} y={GROUND + 30} s={1.15} mouth={interpolate(f, [wild, wild + 8], [0.1, 0.9], clamp)} ears="back" />}
					</Layer>
				</Stage16>
			)}
			{f >= calm && <Chip f={f} at={calm + 6} x={960} y={130} text="КАЖЕТСЯ СПОКОЙНЫМ…" color={GREEN} size={46} to={wild - 4} />}
			{f >= wild && <Plaque f={f} at={wild + 6} x={960} y={130} text="ЭТО ДИКИЙ ЗВЕРЬ" color={RED} size={56} />}
		</AbsoluteFill>
	);
};

// ============================================================ 64. the master of the forest; we are guests; know its rules — and you go your separate ways =====
export const S64: React.FC = () => {
	const f = useCurrentFrame();
	const n = 64;
	const master = w(n, 'хозяин') - 6;
	const guests = w(n, 'гостях') - 16;
	const rules = w(n, 'правила') - 8;
	const meet = w(n, 'встреча') - 6;
	const part = w(n, 'разойдётесь') - 10;
	// Гога and his friends walk in talking; they meet the bear at a distance; Гога stops and talks; they part
	const gIn = stroll(f, guests - 30, meet, -200, 600);
	const gOut = stroll(f, part, len(n) + 30, 600, 100);
	const gx = f < part ? gIn.x : gOut.x;
	const gWalk = gIn.on || gOut.on;
	const bOut = stroll(f, part, len(n) + 20, 1380, 2000);
	const k = f < part - 6 ? 1 : Math.cos(Math.PI * sm((f - part + 6) / 10));
	const talking = f >= meet + 8 && f < part;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f0905a">
				<Forest tone="dusk" seed={61} />
				<rect x={0} y={0} width={1920} height={1080} fill="#ffd27a" opacity={0.12} />
				<Turn x={bOut.x} y={GROUND + 10} k={k}>
					<Bear s={0.8} pose={bOut.on ? 'walk' : 'stand4'} amp={bOut.on ? bOut.amp : 1} ph={Math.abs(bOut.x - 1380) / 45} head={f >= meet && f < part ? -4 : 6} />
				</Turn>
				{f >= guests - 30 && (
					<>
						<Person kind="boy" id="z4fin1" x={gx - 230} y={GROUND} scale={0.4} walk={gWalk ? stepPh(gx, 1) : undefined} face={{eyes: 'open', mouth: talking ? 'flat' : 'open', brows: 'neutral', blush: false, look: f >= part ? [-0.6, 0] : [0.6, 0]}} />
						<Person kind="girl" id="z4fin2" x={gx - 420} y={GROUND} scale={0.4} walk={gWalk ? stepPh(gx, 1) + 1 : undefined} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', blush: false, look: f >= part ? [-0.6, 0] : [0.6, 0]}} />
						<You x={gx} y={GROUND} s={0.55} f={f} walk={gWalk ? stepPh(gx, 1) + 2 : undefined} face={{eyes: 'open', mouth: talking ? (Math.sin(f / 3.5) > 0 ? 'open' : 'flat') : 'smile', brows: 'neutral', look: f >= part ? [-0.7, 0] : [0.7, 0]}} armL={talking ? arm([-116, -436], [-148, -520]) : 'down'} armR={talking ? arm([116, -436], [148, -520]) : 'down'} />
					</>
				)}
				{/* they talk as they walk: the bear hears them */}
				{f >= guests - 20 &&
					f < meet &&
					[0, 1, 2].map((i) => {
						const t = ((f / 24 + i / 3) % 1);
						return <path key={i} d={`M ${gx + 110 + t * 500},${GROUND - 360} q 24,40 0,80`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.8} />;
					})}
				{f >= rules && f < part && (
					<g transform={`translate(${gx},${GROUND - 500}) scale(${pop(f, rules, 10)})`}>
						<rect x={-40} y={-40} width={80} height={80} rx={18} fill="#3aa86a" stroke="#ffffff" strokeWidth={6} />
						<path d="M -18,0 L -4,14 L 20,-14" stroke="#ffffff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
				{/* separate ways */}
				{f >= part + 6 && (
					<g opacity={pop(f, part + 6, 12)}>
						<path d={`M 820,${GROUND + 16} L 520,${GROUND + 16}`} stroke="#ffffff" strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />
						<path d={`M 550,${GROUND - 8} L 516,${GROUND + 16} L 550,${GROUND + 40}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						<path d={`M 1100,${GROUND + 16} L 1400,${GROUND + 16}`} stroke="#ffffff" strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" />
						<path d={`M 1370,${GROUND - 8} L 1404,${GROUND + 16} L 1370,${GROUND + 40}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={master} x={960} y={110} text="ХОЗЯИН ЛЕСА" color={BROWN} size={52} to={guests - 2} />
			<Chip f={f} at={guests + 4} x={960} y={110} text="МЫ — У НЕГО В ГОСТЯХ" color={GREEN} size={46} to={rules - 2} />
			<Chip f={f} at={rules + 4} x={960} y={110} text="ЗНАЕШЬ ЕГО ПРАВИЛА?" color={GREEN} size={46} to={part - 2} />
			<Chip f={f} at={part + 8} x={960} y={110} text="ПРОСТО РАЗОЙДЁТЕСЬ" color={GREEN} size={50} />
		</AbsoluteFill>
	);
};
