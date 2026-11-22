// «Каково это — замёрзнуть насмерть» — shots 1–12: the hook, the night of the Titanic, you in the water.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {folk} from '../w1/kit';
import {BigTitle, camAt, ColdGrade, E, Flash, HEAVY, ICE, Iceberg, InWater, INK, Layer, Lifeboat, mix, NightSky, Plaque, RED, rnd, Sea, Stage16, Thermo, Titanic, Vapor, YEL} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;

// ============================================================ 1. «Вода — минус два… тело — плюс тридцать шесть и шесть» =====
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const n = 1;
	const body = w(n, 'тело') - 4;
	const pb = f >= body ? pop(f, body, 12) : 0;
	const cam = camAt(f, 0, len(n), {s: 1.0, cx: 960, cy: 540}, {s: 1.06, cx: 960, cy: 540});
	return (
		<AbsoluteFill>
			<Stage16 bg="#04070f">
				<defs>
					<linearGradient id="z1s1c" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0e2a4a" />
						<stop offset="1" stopColor="#04101e" />
					</linearGradient>
					<radialGradient id="z1s1w">
						<stop offset="0" stopColor="#7a1e1e" />
						<stop offset="1" stopColor="#1a0608" />
					</radialGradient>
				</defs>
				<Layer cam={cam} d={0.5}>
					<rect x={-200} y={-200} width={1180} height={1500} fill="url(#z1s1c)" />
					<rect x={960} y={-200} width={1180} height={1500} fill="url(#z1s1w)" opacity={0.25 + 0.75 * pb} />
					{Array.from({length: 26}).map((_, k) => {
						const y = ((f * (0.6 + rnd(k) * 0.8) + rnd(k + 9) * 1200) % 1300) - 100;
						return <path key={k} d={`M ${60 + rnd(k + 3) * 820},${y} l 14,-8 l 14,8 l -14,8 Z`} fill="#cfeaff" opacity={0.25 + rnd(k + 5) * 0.4} />;
					})}
					<rect x={954} y={-200} width={12} height={1500} fill="#cfeaff" opacity={0.6} />
				</Layer>
				<Layer cam={cam}>
					<Thermo x={560} y={700} v={-2} lo={-10} hi={40} h={470} label={false} />
					{f >= body && (
						<g opacity={Math.min(1, pb * 1.4)}>
							<Thermo x={1360} y={700} v={36.6} lo={-10} hi={40} h={470} label={false} />
						</g>
					)}
				</Layer>
			</Stage16>
			<Plaque f={f} at={2} x={560} y={150} text="ВОДА: −2°" color={ICE} size={64} />
			<Plaque f={f} at={body} x={1360} y={150} text="ТЕЛО: +36,6°" color={RED} size={64} />
			<ColdGrade vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 2. «Между вами — тонкая рубашка и пара часов. А может, всего пара минут.» =====
const ClockFace: React.FC<{x: number; y: number; r: number; t: number; label: string; color?: string}> = ({x, y, r, t, label, color = ICE}) => (
	<g transform={`translate(${x},${y})`}>
		<circle r={r} fill="#0e1628" stroke={color} strokeWidth={10} />
		{Array.from({length: 12}).map((_, k) => {
			const a = (k / 12) * Math.PI * 2;
			return <line key={k} x1={Math.cos(a) * r * 0.82} y1={Math.sin(a) * r * 0.82} x2={Math.cos(a) * r * 0.94} y2={Math.sin(a) * r * 0.94} stroke="#cfe0f8" strokeWidth={6} />;
		})}
		<line x1={0} y1={0} x2={Math.sin(t * 0.5) * r * 0.5} y2={-Math.cos(t * 0.5) * r * 0.5} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
		<line x1={0} y1={0} x2={Math.sin(t * 6) * r * 0.78} y2={-Math.cos(t * 6) * r * 0.78} stroke={color} strokeWidth={7} strokeLinecap="round" />
		<circle r={12} fill="#fff" />
		<text x={0} y={r + 76} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">
			{label}
		</text>
	</g>
);
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const n = 2;
	const mn = w(n, 'минут') - 6;
	const fast = f >= mn;
	const t = f / 30 + (fast ? (f - mn) * 0.25 : 0);
	return (
		<AbsoluteFill>
			<Stage16 bg="#05080f">
				{/* the layers: the sea, a thin shirt, the skin */}
				<rect x={0} y={0} width={760} height={1080} fill="#0c2a4c" />
				{Array.from({length: 9}).map((_, k) => (
					<path key={k} d={`M 0,${80 + k * 110 + Math.sin(f / 16 + k) * 8} q 190,-24 380,0 t 380,0`} stroke="#5a8ac8" strokeWidth={3} fill="none" opacity={0.35} />
				))}
				<rect x={760} y={0} width={56} height={1080} fill="#e9e4d8" />
				{Array.from({length: 30}).map((_, k) => (
					<line key={k} x1={760} y1={k * 38} x2={816} y2={k * 38 + 20} stroke="#cfc8b8" strokeWidth={3} />
				))}
				<rect x={816} y={0} width={180} height={1080} fill="#efbf98" />
				<rect x={816} y={0} width={180} height={1080} fill="#d88a6a" opacity={0.3} />
				<text x={380} y={170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill={ICE}>
					ВОДА −2°
				</text>
				<text x={788} y={560} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#5a5448" transform="rotate(-90 788 560)">
					РУБАШКА
				</text>
				<text x={906} y={170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#7a3a2a">
					ТЫ
				</text>
				{/* the heat flowing out */}
				{Array.from({length: 7}).map((_, k) => {
					const tt = (f * 1.4 + k * 17) % 70;
					return <path key={k} d={`M ${820 - tt * 6},${200 + k * 110} q -20,-10 -40,0`} stroke="#ff8a5a" strokeWidth={6} fill="none" opacity={1 - tt / 70} strokeLinecap="round" />;
				})}
				<g opacity={interpolate(f, [8, 20], [0, 1], clamp)}>
					<ClockFace x={1460} y={440} r={230} t={t} label={fast ? 'ПАРА МИНУТ?' : 'ПАРА ЧАСОВ?'} color={fast ? RED : ICE} />
				</g>
			</Stage16>
			<ColdGrade vig={0.45} />
		</AbsoluteFill>
	);
};

// ============================================================ 3. «Это Атлантический океан. Ночь на пятнадцатое апреля 1912… пассажир «Титаника».» =====
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const n = 3;
	const L = len(n);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 520}, {s: 1.1, cx: 1010, cy: 520});
	const pass = w(n, 'пассажир') - 4;
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.2}>
					<NightSky id="z1s3" hz={640} f={f} />
				</Layer>
				<Layer cam={cam} d={0.6}>
					<Sea id="z1s3" hz={640} f={f} />
				</Layer>
				<Layer cam={cam}>
					<g transform={`translate(${lerp(f, 0, L, 1180, 900, Easing.linear)},640) scale(0.62)`}>
						<Titanic lights={1} smoke={1} f={f} />
					</g>
					<rect x={-400} y={646} width={2800} height={600} fill="#0b1634" />
					<ellipse cx={lerp(f, 0, L, 1180, 900, Easing.linear)} cy={660} rx={560} ry={30} fill="#ffd98a" opacity={0.07} />
				</Layer>
			</Stage16>
			<BigTitle f={f} at={4} lines={['1912']} y={110} size={150} out={w(n, 'пассажир') - 14} />
			<Plaque f={f} at={14} x={960} y={330} text="15 АПРЕЛЯ · АТЛАНТИКА" color={ICE} size={42} to={pass - 10} />
			{f >= pass && (
				<div style={{position: 'absolute', left: 960, top: 300, transform: `translate(-50%,-50%) rotate(-4deg) scale(${pop(f, pass, 12)})`, width: 560, background: '#f4ecd6', border: '6px solid #8a6a3a', borderRadius: 14, padding: '18px 26px', fontFamily: HEAVY, fontWeight: 900, color: '#3a2a18', textAlign: 'center', boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>
					<div style={{fontSize: 26, letterSpacing: 4, color: '#8a6a3a'}}>WHITE STAR LINE</div>
					<div style={{fontSize: 54, marginTop: 4}}>R.M.S. TITANIC</div>
					<div style={{fontSize: 34, marginTop: 6, color: RED}}>ПАССАЖИР: ТЫ</div>
				</div>
			)}
			<ColdGrade vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 4. «Сегодня ты узнаешь, каково это — замёрзнуть насмерть. Шаг за шагом. Градус за градусом.» =====
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const n = 4;
	const frost = interpolate(f, [0, len(n)], [0.2, 1], clamp);
	const step = w(n, 'шаг') - 4;
	const temps = ['36,6°', '35°', '32°', '28°'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #12305a 0%, #050a16 75%)'}}>
			<Stage16 bg="transparent">
				{Array.from({length: 60}).map((_, k) => {
					const a = rnd(k) * Math.PI * 2;
					const edge = rnd(k + 7) > 0.5;
					const x = edge ? (rnd(k + 2) > 0.5 ? 40 : 1880) : 80 + rnd(k + 3) * 1760;
					const y = edge ? 60 + rnd(k + 4) * 960 : rnd(k + 5) > 0.5 ? 40 : 1040;
					const r = 40 + rnd(k + 6) * 120 * frost;
					return (
						<g key={k} opacity={0.35 * frost} stroke="#dff2ff" strokeWidth={3}>
							{[0, 1, 2].map((q) => (
								<line key={q} x1={x} y1={y} x2={x + Math.cos(a + (q * Math.PI) / 3) * r} y2={y + Math.sin(a + (q * Math.PI) / 3) * r} />
							))}
						</g>
					);
				})}
			</Stage16>
			<BigTitle f={f} at={2} lines={['КАКОВО ЭТО —', 'ЗАМЁРЗНУТЬ НАСМЕРТЬ']} y={190} size={118} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 28}}>
				{temps.map((t, k) => {
					const at = step + k * 9;
					if (f < at) return <div key={t} style={{width: 220}} />;
					const p = pop(f, at, 11);
					return (
						<div key={t} style={{width: 220, transform: `scale(${p})`, background: mix('#e0463a', '#3a6ad8', k / 3), color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 64, textAlign: 'center', padding: '14px 0 18px', borderRadius: 18, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
							{t}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ============================================================ 5. «А в конце — главное: как этого не допустить. Поехали.» =====
const Lifebuoy: React.FC<{r?: number}> = ({r = 150}) => (
	<g>
		<circle r={r} fill="none" stroke="#f4f2ee" strokeWidth={r * 0.5} />
		{[0, 1, 2, 3].map((k) => (
			<path key={k} d={`M ${Math.cos((k * Math.PI) / 2 - 0.4) * r},${Math.sin((k * Math.PI) / 2 - 0.4) * r} A ${r} ${r} 0 0 1 ${Math.cos((k * Math.PI) / 2 + 0.4) * r},${Math.sin((k * Math.PI) / 2 + 0.4) * r}`} stroke={RED} strokeWidth={r * 0.5} fill="none" />
		))}
		<circle r={r * 1.25} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={6} />
	</g>
);
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const n = 5;
	const L = len(n);
	const go = w(n, 'поехали') - 2;
	const zoom = lerp(f, go, L, 1, 6, Easing.in(Easing.cubic));
	return (
		<AbsoluteFill>
			<Stage16 bg="#07101e">
				<Sea id="z1s5" hz={-200} f={f} />
				<g transform={`translate(960,500) scale(${zoom}) rotate(${f * 0.6})`}>
					<Lifebuoy r={170} />
				</g>
			</Stage16>
			<Plaque f={f} at={6} x={960} y={860 - 760} text="КАК ВЫЖИТЬ — В КОНЦЕ" color={YEL} size={50} to={go - 4} />
			{f >= L - 8 && <AbsoluteFill style={{background: '#04070f', opacity: interpolate(f, [L - 8, L], [0, 1], clamp)}} />}
		</AbsoluteFill>
	);
};

// ============================================================ 6. «Без двадцати двенадцать ночи корабль задевает айсберг…» =====
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const n = 6;
	const L = len(n);
	const hit = w(n, 'задевает');
	const shake = f > hit && f < hit + 24 ? Math.sin(f * 1.3) * 3 * (1 - (f - hit) / 24) : 0;
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.12, cx: 860, cy: 520});
	const bx = lerp(f, 0, L, 1500, 760, Easing.linear);
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.2}>
					<NightSky id="z1s6" hz={660} f={f} />
				</Layer>
				<Layer cam={cam} d={0.6}>
					<Sea id="z1s6" hz={660} f={f} />
				</Layer>
				<Layer cam={cam}>
					<g transform={`translate(${shake},0)`}>
						<g transform={`translate(${bx},700) scale(0.7)`}>
							<Titanic lights={1} smoke={1} f={f} />
						</g>
						<g transform="translate(470,712) scale(0.9)">
							<Iceberg />
						</g>
						<rect x={-400} y={704} width={2800} height={600} fill="#0b1634" />
						<path d="M -400,704 L 2400,704" stroke="#3a5a9a" strokeWidth={3} opacity={0.6} />
						{f > hit &&
							Array.from({length: 8}).map((_, k) => {
								const t = Math.min(30, f - hit - k * 3);
								if (t < 0) return null;
								return <path key={k} d={`M ${640 + k * 18},${560 + t * t * 0.18} l 14,-10 l 16,6 l -6,14 Z`} fill="#e8f4fc" />;
							})}
					</g>
				</Layer>
			</Stage16>
			<Plaque f={f} at={4} x={1500} y={150} text="23:40" color={ICE} size={70} />
			<ColdGrade vig={0.55} />
		</AbsoluteFill>
	);
};

// ============================================================ 7. «Многие пассажиры даже не просыпаются. Кто-то… пинает куски льда, как мяч.» =====
const DeckBg: React.FC = () => (
	<g>
		<rect x={-200} y={-200} width={2400} height={720} fill="#0a1026" />
		{Array.from({length: 60}).map((_, k) => (
			<circle key={k} cx={rnd(k) * 1920} cy={rnd(k + 9) * 480} r={1 + rnd(k + 2) * 2} fill="#fff" opacity={0.6} />
		))}
		{/* the superstructure wall with lit windows */}
		<rect x={-200} y={300} width={2400} height={360} fill="#e8e4da" />
		{Array.from({length: 18}).map((_, k) => (
			<g key={k}>
				<rect x={30 + k * 110} y={360} width={70} height={90} rx={8} fill="#ffd98a" />
				<rect x={30 + k * 110} y={360} width={70} height={90} rx={8} fill="#000" opacity={k % 3 === 0 ? 0.55 : 0} />
			</g>
		))}
		<rect x={-200} y={640} width={2400} height={30} fill="#c8c2b4" />
		{/* the deck planks */}
		<rect x={-200} y={660} width={2400} height={640} fill="#9a7a52" />
		{Array.from({length: 14}).map((_, k) => (
			<line key={k} x1={-200} y1={680 + k * k * 4.6} x2={2200} y2={680 + k * k * 4.6} stroke="#7a5a3a" strokeWidth={3} />
		))}
	</g>
);
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const n = 7;
	const L = len(n);
	const kick = w(n, 'пинает') - 6;
	const kp = interpolate(f, [kick, kick + 8], [0, 1], clamp);
	const ice = interpolate(f, [kick + 4, kick + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.06, cx: 980, cy: 560});
	const a = folk(1911, 2, 'm');
	const b = folk(1911, 5, 'm');
	const c = folk(1911, 3, 'f');
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.5}>
					<DeckBg />
				</Layer>
				<Layer cam={cam}>
					{/* zzz in a dark window */}
					{[0, 1, 2].map((k) => {
						const t = (f * 0.8 + k * 16) % 48;
						return (
							<text key={k} x={1000 + t * 1.2} y={380 - t * 1.6} fontFamily={HEAVY} fontWeight={900} fontSize={30 + k * 6} fill="#fff" opacity={1 - t / 48}>
								z
							</text>
						);
					})}
					<Person {...a} id="z1s7a" x={760} y={1000} scale={0.5} colors={a.colors} walk={kp > 0 && kp < 1 ? 1.2 : undefined} breathe={f} headTurn={0.4} face={{eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0.6, 0.3], blush: true}} />
					<Person {...b} id="z1s7b" x={1260} y={1010} scale={0.5} colors={b.colors} breathe={f + 13} headTurn={-0.4} face={{eyes: 'happy', brows: 'raised', mouth: 'open', look: [-0.6, 0.3], blush: true}} />
					<Person {...c} id="z1s7c" x={1460} y={1000} scale={0.47} colors={c.colors} breathe={f + 7} headTurn={-0.5} face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [-0.7, 0.3], blush: true}} />
					{/* the ice lumps on the deck */}
					<path d={`M ${lerp(ice, 0, 1, 840, 1160)},${lerp(ice, 0, 1, 990, 1000) - Math.sin(ice * Math.PI) * 60} l 30,-24 l 34,8 l 6,30 l -40,14 Z`} fill="#e8f4fc" stroke="#a8c8dc" strokeWidth={4} />
					<path d="M 560,1010 l 24,-18 l 28,8 l 2,22 l -34,10 Z" fill="#e8f4fc" stroke="#a8c8dc" strokeWidth={4} />
					<path d="M 1640,1020 l 20,-14 l 22,6 l 2,18 l -26,8 Z" fill="#e8f4fc" stroke="#a8c8dc" strokeWidth={4} />
				</Layer>
			</Stage16>
			<ColdGrade vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 8. «Но в трюм уже хлещет вода. Корабль, который называли непотопляемым, обречён.» =====
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const n = 8;
	const L = len(n);
	const unsink = w(n, 'непотопляемым') - 4;
	const comps = 8;
	return (
		<AbsoluteFill>
			<Stage16 bg="#050912">
				<rect x={0} y={0} width={1920} height={1080} fill="#08101f" />
				{/* the hull in section: watertight compartments, the front ones fill */}
				<g transform="translate(160,240)">
					<path d="M 0,40 L 1600,40 L 1600,520 Q 1600,560 1560,560 L 120,560 Q 40,540 0,40 Z" fill="#1a1c24" stroke="#5a6a8a" strokeWidth={6} />
					{Array.from({length: comps}).map((_, k) => {
						const x0 = 40 + k * 192;
						const lvl = k < 5 ? interpolate(f, [6 + k * 12, L - 6], [0, 1 - k * 0.12], clamp) : 0;
						return (
							<g key={k}>
								<rect x={x0} y={80} width={180} height={460} fill="#232838" />
								<rect x={x0} y={540 - 460 * lvl} width={180} height={460 * lvl} fill="#2a5a9a" />
								<rect x={x0} y={540 - 460 * lvl} width={180} height={8} fill="#8ab8f0" opacity={lvl > 0 ? 0.8 : 0} />
								<line x1={x0 + 186} y1={80} x2={x0 + 186} y2={540} stroke="#5a6a8a" strokeWidth={6} />
							</g>
						);
					})}
					<path d="M 10,300 L 1600,300" stroke="#8ab8f0" strokeWidth={3} strokeDasharray="14 10" opacity={0.6} />
					<text x={1560} y={290} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={28} fill="#8ab8f0">
						ВАТЕРЛИНИЯ
					</text>
				</g>
			</Stage16>
			{f >= unsink && (
				<div style={{position: 'absolute', left: 960, top: 140, transform: `translate(-50%,-50%) rotate(-5deg) scale(${f - unsink < 6 ? lerp(f - unsink, 0, 6, 2, 1) : 1})`, opacity: interpolate(f, [unsink, unsink + 4], [0, 1], clamp), border: `9px solid ${RED}`, borderRadius: 16, padding: '6px 26px', color: RED, fontFamily: HEAVY, fontWeight: 900, fontSize: 70, letterSpacing: 4}}>
					<span style={{textDecoration: 'line-through', textDecorationThickness: 8}}>НЕПОТОПЛЯЕМЫЙ</span>
				</div>
			)}
			<ColdGrade vig={0.45} />
		</AbsoluteFill>
	);
};

// ============================================================ 9. «На борту — больше двух тысяч человек. А в шлюпках — всего 1178 мест.» =====
const Man: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<circle cx={0} cy={-34} r={9} fill={c} />
		<path d="M -12,-22 L 12,-22 L 10,6 L -10,6 Z" fill={c} />
	</g>
);
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const n = 9;
	const seats = w(n, 'шлюпках') - 4;
	const cols = 30;
	const rows = 8;
	const total = cols * rows;
	const saved = Math.round(total * (1178 / 2224));
	return (
		<AbsoluteFill>
			<Stage16 bg="#070c18">
				{Array.from({length: total}).map((_, k) => {
					const c = k % cols;
					const r = Math.floor(k / cols);
					const appear = interpolate(f, [4 + (k / total) * 24, 10 + (k / total) * 24], [0, 1], clamp);
					const inBoat = f >= seats && k < saved;
					return <Man key={k} x={264 + c * 47} y={330 + r * 62} c={inBoat ? YEL : f >= seats ? '#5a6478' : '#cfd8e8'} s={appear} />;
				})}
			</Stage16>
			<Plaque f={f} at={4} x={640} y={215} text="НА БОРТУ: 2200+" color="#cfd8e8" size={50} />
			<Plaque f={f} at={seats} x={1300} y={215} text="МЕСТ В ШЛЮПКАХ: 1178" color={YEL} size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 10. «Первые шлюпки уходят полупустыми…» =====
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const n = 10;
	const L = len(n);
	const down = lerp(f, 0, L, 0, 1, Easing.linear);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.03, cx: 980, cy: 540});
	const k = 0.28;
	const by = 300 + down * 330; // the boat's waterline on its way down the side
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.3}>
					<NightSky id="z1s10" hz={1300} f={f} />
				</Layer>
				<Layer cam={cam}>
					<g transform="translate(0,130)">
					{/* the side of the ship, a lifeboat going down on its ropes */}
					<rect x={-200} y={-100} width={2400} height={420} fill="#e8e4da" />
					{Array.from({length: 18}).map((_, j) => (
						<rect key={j} x={40 + j * 110} y={-20} width={60} height={70} rx={6} fill="#ffd98a" />
					))}
					<rect x={-200} y={300} width={2400} height={900} fill="#15161c" />
					<rect x={-200} y={294} width={2400} height={10} fill="#b9a888" />
					{Array.from({length: 40}).map((_, j) => (
						<circle key={j} cx={20 + j * 50} cy={360 + (j % 2) * 40} r={6} fill="#ffd98a" />
					))}
					{[770, 1450].map((x, j) => (
						<path key={j} d={`M ${x},300 L ${x},120 q 40,-80 90,-60 L ${x + 90},20`} stroke="#3a3a42" strokeWidth={14} fill="none" strokeLinejoin="round" />
					))}
					{/* people on the deck, not believing */}
					{[0, 1, 2, 3].map((j) => {
						const lk = folk(1911, j + 4, j % 2 ? 'f' : 'm');
						return <Person key={j} {...lk} id={`z1s10p${j}`} x={490 + j * 118} y={300} scale={k} colors={lk.colors} breathe={f + j * 7} headTurn={0.3} face={{eyes: 'open', brows: j % 2 ? 'worried' : 'neutral', mouth: 'flat', look: [0.6, 0.4], blush: false}} />;
					})}
					{/* the deck rail in front of them */}
					<rect x={-200} y={186} width={2400} height={9} rx={4} fill="#8a6a4a" />
					<rect x={-200} y={244} width={2400} height={5} fill="#6a6a72" />
					{Array.from({length: 26}).map((_, j) => (
						<rect key={j} x={-160 + j * 100} y={190} width={6} height={108} fill="#6a6a72" />
					))}
					{[860, 1540].map((x, j) => (
						<line key={j} x1={x} y1={20} x2={x} y2={by - 20} stroke="#cfc8b8" strokeWidth={4} />
					))}
					<g transform={`translate(1200,${by})`}>
						{[
							{x: -150, i: 1, who: 'm' as const},
							{x: 130, i: 3, who: 'f' as const},
						].map((p, j) => {
							const lk = folk(1911, p.i, p.who);
							return <Person key={j} {...lk} id={`z1s10b${j}`} x={p.x} y={-40 + (lk.kind === 'dad' ? 470 : 400) * k} scale={k} colors={lk.colors} hideLegs breathe={f + j * 11} headTurn={-0.2} face={{eyes: 'open', brows: 'neutral', mouth: 'flat', look: [-0.3, -0.3], blush: false}} />;
						})}
						<Lifeboat n={0} seats={14} s={1.25} />
					</g>
					</g>
				</Layer>
			</Stage16>
			<Plaque f={f} at={w(n, 'полупустыми') - 4} x={1500} y={140} text="ПОЛУПУСТЫЕ" color={YEL} size={60} rot={-3} />
			<ColdGrade vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 11. «Два часа двадцать минут ночи. «Титаник» уходит под воду. А ты — в океане.» =====
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const n = 11;
	const L = len(n);
	const sink = interpolate(f, [0, L - 20], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const lights = interpolate(f, [L * 0.35, L * 0.55], [1, 0], clamp);
	const ocean = w(n, 'океане') - 6;
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.08, cx: 960, cy: 580});
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.2}>
					<NightSky id="z1s11" hz={680} f={f} />
				</Layer>
				<Layer cam={cam}>
					<g transform={`translate(${960 + 120},${640 + sink * 380}) rotate(${-14 - sink * 34})`}>
						<g transform="scale(0.6)">
							<Titanic lights={lights} f={f} />
						</g>
					</g>
				</Layer>
				<Layer cam={cam} d={0.6}>
					<Sea id="z1s11" hz={680} f={f} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={4} x={1500} y={150} text="02:20" color={ICE} size={70} />
			{f >= ocean && <Flash f={f - ocean} len={14} color="#dff0ff" />}
			<ColdGrade vig={0.55} />
		</AbsoluteFill>
	);
};

// ============================================================ 12. «Вокруг темнота, крики и ледяная вода. На тебе спасательный жилет…» =====
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const n = 12;
	const L = len(n);
	const vest = w(n, 'жилет') - 4;
	const cold = w(n, 'холода') - 4;
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 560}, {s: 1.1, cx: 960, cy: 560});
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.2}>
					<NightSky id="z1s12" hz={520} f={f} />
				</Layer>
				<Layer cam={cam} d={0.5}>
					<Sea id="z1s12" hz={520} f={f} />
					{/* far: debris and other people in the water */}
					{Array.from({length: 9}).map((_, k) => (
						<g key={k} transform={`translate(${120 + k * 210 + Math.sin(f / 30 + k) * 10},${560 + (k % 3) * 18})`}>
							<circle cx={0} cy={-10} r={9} fill="#2a2a34" />
							<rect x={-14} y={-6} width={28} height={10} rx={4} fill="#cfc8b8" opacity={0.6} />
						</g>
					))}
					<rect x={300} y={600} width={160} height={16} rx={6} fill="#5a4a3a" transform={`rotate(${Math.sin(f / 40) * 4} 380 608)`} />
					<rect x={1400} y={590} width={110} height={14} rx={6} fill="#5a4a3a" />
				</Layer>
				<Layer cam={cam}>
					<InWater id="z1s12y" f={f} x={960} y={900} k={1.05} face={{eyes: 'wide', pupil: 0.5, brows: 'worried', mouth: 'o', look: [-0.2, -0.1]}} breath={1.4} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={vest} x={1420} y={470} text="СПАСАТЕЛЬНЫЙ ЖИЛЕТ" color={YEL} size={38} to={cold - 6} />
			{f >= cold && <Plaque f={f} at={cold} x={960} y={150} text="ОТ ХОЛОДА НЕ СПАСЁТ" color={ICE} size={56} />}
			<ColdGrade cold={interpolate(f, [cold, cold + 30], [0, 0.6], clamp)} vig={0.6} />
		</AbsoluteFill>
	);
};
export const _S1 = {Vapor, INK, mix};
