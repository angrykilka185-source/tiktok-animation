// «Каково это — замёрзнуть насмерть» — shots 60–78: winter in the city (the bench, wind and wet clothes, layers,
// food, the phone), getting out of the ice, helping someone else, first aid, the finale and the end card.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Bust, Person} from '../components/Person';
import {SitLegs, Sitter} from '../c1/kit';
import {camAt, ColdGrade, HEAVY, ICE, InWater, INK, Layer, NightSky, Plaque, RED, rnd, Stage16, YEL} from './kit';
import {Picto} from './s3';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const NOW = {top: '#2f5a9a', topDark: '#264a82', pants: '#2a2e3a', shoes: '#1d1d22', hair: '#5a3a26', skin: '#efbf98'};
const MAN = {top: '#4a4a52', topDark: '#3a3a42', pants: '#2a2a30', shoes: '#1d1d22', hair: '#3a2a20', skin: '#e9b892'};

// ============================================================ the winter yard at night =====
const Snowfall: React.FC<{f: number; n?: number; o?: number}> = ({f, n = 80, o = 0.85}) => (
	<g>
		{Array.from({length: n}).map((_, k) => {
			const y = ((f * (1 + rnd(k) * 1.4) + rnd(k + 4) * 1200) % 1240) - 120;
			return <circle key={k} cx={rnd(k + 8) * 1920 + Math.sin(f / 26 + k) * 18} cy={y} r={2 + rnd(k + 2) * 3.5} fill="#fff" opacity={o} />;
		})}
	</g>
);
const Panel: React.FC<{x: number; w: number; h: number; lit?: number}> = ({x, w: ww, h, lit = 0.5}) => (
	<g>
		<rect x={x} y={760 - h} width={ww} height={h} fill="#7a8494" />
		{Array.from({length: Math.floor((h - 40) / 70)}).map((_, r) =>
			Array.from({length: Math.floor(ww / 70)}).map((_, c) => (
				<rect key={`${r}-${c}`} x={x + 20 + c * 70} y={760 - h + 30 + r * 70} width={40} height={44} fill={rnd(r * 13 + c + x) < lit ? '#ffd98a' : '#2a3242'} />
			)),
		)}
		<rect x={x - 6} y={760 - h - 14} width={ww + 12} height={16} fill="#5a6474" />
	</g>
);
const Yard: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-400} y={-400} width={2800} height={1200} fill="#0c1430" />
		<Panel x={-120} w={760} h={560} />
		<Panel x={700} w={620} h={470} lit={0.4} />
		<Panel x={1380} w={700} h={600} lit={0.55} />
		<rect x={-400} y={740} width={2800} height={600} fill="#dfe8f2" />
		<path d="M -400,760 Q 400,730 1100,760 Q 1700,790 2400,750" stroke="#c8d6e8" strokeWidth={10} fill="none" />
		<Snowfall f={f} />
	</g>
);
const Lamp: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 6} y={y - 520} width={12} height={520} fill="#2a2e38" />
		<path d={`M ${x},${y - 520} q 60,-30 110,-10`} stroke="#2a2e38" strokeWidth={10} fill="none" />
		<rect x={x + 90} y={y - 540} width={50} height={18} rx={6} fill="#ffe2a0" />
		<path d={`M ${x + 92},${y - 524} L ${x - 60},${y} L ${x + 300},${y} L ${x + 138},${y - 524} Z`} fill="#ffe9b0" opacity={0.12} />
	</g>
);

// ============================================================ 60. «Ты скажешь: «Титаник» — это далеко. А я в океан не собираюсь.» =====
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const n = 60;
	const L = len(n);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.1, cx: 960, cy: 600});
	return (
		<AbsoluteFill>
			<Stage16 bg="#0c1430">
				<Layer cam={cam} d={0.6}>
					<Yard f={f} />
				</Layer>
				<Layer cam={cam}>
					<Lamp x={1420} y={980} />
					<Person kind="teen" id="z1s60y" x={900} y={1060} scale={0.72} colors={NOW} plain knit="#d8402a" breathe={f} headTurn={0.15} face={{eyes: 'narrow', brows: 'raised', mouth: 'smile', look: [0.1, 0], blush: true, glasses: false}} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={w(n, 'далеко') - 4} x={960} y={190} text="«ТИТАНИК» — ЭТО ДАЛЕКО" color={ICE} size={50} />
			<ColdGrade cold={0.2} vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 61–62. the bench at the bus stop =====
const Stop: React.FC = () => (
	<g>
		<rect x={600} y={420} width={760} height={24} fill="#3a4250" />
		<rect x={610} y={440} width={12} height={430} fill="#3a4250" />
		<rect x={1338} y={440} width={12} height={430} fill="#3a4250" />
		<rect x={620} y={450} width={720} height={330} fill="#a8c8e0" opacity={0.25} />
		<rect x={1150} y={470} width={170} height={110} rx={8} fill="#2f6ad8" />
		<text x={1235} y={540} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#fff">
			А
		</text>
	</g>
);
const BenchBack: React.FC = () => <rect x={700} y={660} width={480} height={30} rx={8} fill="#5a3a24" />;
const BenchFront: React.FC = () => (
	<g>
		<rect x={690} y={770} width={500} height={34} rx={8} fill="#7a5034" />
		<rect x={720} y={800} width={18} height={80} fill="#2a2e38" />
		<rect x={1142} y={800} width={18} height={80} fill="#2a2e38" />
	</g>
);
const BenchMan: React.FC<{f: number; id: string; sleep: number; snow: number}> = ({f, id, sleep, snow}) => (
	<g>
		<Sitter kind="dad" id={id} x={940} seat={782} scale={0.52} colors={MAN} plain kneePatch={false} cap="#3a3a42" breathe={f} headTilt={sleep * 14} armL={{target: [-80, -480], bend: 1, kf: 0.72}} armR={{target: [80, -480], bend: -1, kf: 0.72}} face={{eyes: sleep > 0.5 ? 'closed' : 'open', brows: 'neutral', mouth: 'flat', look: [0, 0.4], blush: false}} />
		<BenchFront />
		<SitLegs kind="dad" x={940} seat={782} floor={880} k={0.52} pants={MAN.pants} shoes={MAN.shoes} />
		{snow > 0 && (
			<g opacity={snow}>
				<ellipse cx={940 - 48} cy={782 - 0.52 * 430 - 2} rx={34} ry={9} fill="#fff" />
				<ellipse cx={940 + 48} cy={782 - 0.52 * 430 - 2} rx={34} ry={9} fill="#fff" />
				<ellipse cx={940} cy={782 - 0.52 * (430 + 46 + 190)} rx={50} ry={12} fill="#fff" />
				<path d="M 690,770 L 1190,770 L 1190,764 Q 940,744 690,764 Z" fill="#fff" />
			</g>
		)}
	</g>
);
export const S61: React.FC = () => {
	const f = useCurrentFrame();
	const n = 61;
	const L = len(n);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 560}, {s: 1.12, cx: 960, cy: 620});
	return (
		<AbsoluteFill>
			<Stage16 bg="#0c1430">
				<Layer cam={cam} d={0.6}>
					<Yard f={f} />
				</Layer>
				<Layer cam={cam}>
					<Stop />
					<Lamp x={460} y={900} />
					<BenchBack />
					<BenchMan f={f} id="z1s61m" sleep={0} snow={0} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={w(n, 'городе') - 4} x={960} y={180} text="ЗАМЁРЗНУТЬ МОЖНО И В ГОРОДЕ" color={ICE} size={46} />
			<Plaque f={f} at={w(n, 'присели') - 4} x={960} y={290} text="«ПРИСЕЛ ОТДОХНУТЬ»" color={YEL} size={40} />
			<ColdGrade cold={0.25} vig={0.55} />
		</AbsoluteFill>
	);
};
export const S62: React.FC = () => {
	const f = useCurrentFrame();
	const n = 62;
	const L = len(n);
	const sleep = interpolate(f, [w(n, 'засыпает') - 6, w(n, 'засыпает') + 10], [0, 1], clamp);
	const snow = interpolate(f, [w(n, 'засыпает'), L], [0, 1], clamp);
	const cam = camAt(f, 0, L, {s: 1.22, cx: 900, cy: 600}, {s: 1.3, cx: 900, cy: 610});
	return (
		<AbsoluteFill>
			<Stage16 bg="#0c1430">
				<Layer cam={cam} d={0.6}>
					<Yard f={f} />
				</Layer>
				<Layer cam={cam}>
					<Stop />
					<BenchBack />
					<BenchMan f={f} id="z1s62m" sleep={sleep} snow={snow} />
					{sleep > 0.5 &&
						[0, 1, 2].map((k) => {
							const t = (f * 0.7 + k * 14) % 42;
							return (
								<text key={k} x={1000 + t * 1.4} y={520 - t * 1.6} fontFamily={HEAVY} fontWeight={900} fontSize={26 + k * 6} fill="#fff" opacity={1 - t / 42}>
									z
								</text>
							);
						})}
				</Layer>
			</Stage16>
			<Plaque f={f} at={w(n, 'алкоголя') - 4} x={1500} y={330} text="ОСОБЕННО ПОСЛЕ АЛКОГОЛЯ" color={RED} size={40} />
			<Plaque f={f} at={w(n, 'чувствует') - 4} x={1500} y={440} text="ХОЛОДА УЖЕ НЕ ЧУВСТВУЕТ" color={ICE} size={36} />
			<ColdGrade cold={0.3} vig={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 63. «Опаснее мороза — ветер и мокрая одежда…» =====
export const S63: React.FC = () => {
	const f = useCurrentFrame();
	const n = 63;
	const wet = w(n, 'мокрая') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<g transform={`translate(520,470) scale(${pop(f, 4, 12)})`}>
					<rect x={-330} y={-300} width={660} height={600} rx={30} fill="#0e1830" stroke="#cfe0f8" strokeWidth={5} />
					<Picto x={0} y={140} s={1.1} color="#cfe0f8" />
					<ellipse cx={0} cy={0} rx={140} ry={230} fill="#ff8a5a" opacity={0.18 * (1 - interpolate(f, [8, 40], [0, 1], clamp) * 0.7)} />
					{Array.from({length: 5}).map((_, k) => {
						const t = ((f * 2.2 + k * 17) % 80) / 80;
						return <path key={k} d={`M ${-300 + t * 600},${-160 + k * 70} q 40,-14 80,0`} stroke={ICE} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - Math.abs(t - 0.5) * 1.6} />;
					})}
					<text x={0} y={-230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#fff">
						ВЕТЕР
					</text>
				</g>
				{f >= wet && (
					<g transform={`translate(1400,470) scale(${pop(f, wet, 12)})`}>
						<rect x={-330} y={-300} width={660} height={600} rx={30} fill="#0c2a4c" stroke={ICE} strokeWidth={5} />
						<path d="M -180,-120 L 180,-120 L 210,170 L -210,170 Z" fill="#5a6a8a" />
						{Array.from({length: 9}).map((_, k) => {
							const t = ((f * 1.4 + k * 13) % 60) / 60;
							return <path key={k} d={`M ${-150 + (k % 5) * 75},${-80 + t * 260} q 8,14 0,22 q -8,-8 0,-22 Z`} fill="#8ec8f0" opacity={1 - t} />;
						})}
						{Array.from({length: 5}).map((_, k) => {
							const t = ((f * 1.8 + k * 16) % 60) / 60;
							return <path key={k} d={`M ${-120 + k * 60},${-140 - t * 120} q 12,-14 0,-28 q -12,-14 0,-28`} stroke="#ff8a5a" strokeWidth={7} fill="none" strokeLinecap="round" opacity={1 - t} />;
						})}
						<text x={0} y={-230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#fff">
							МОКРАЯ ОДЕЖДА
						</text>
					</g>
				)}
			</Stage16>
			{f >= wet && <Plaque f={f} at={wet + 10} x={1400} y={850 - 40} text="ТЕПЛО УХОДИТ В РАЗЫ БЫСТРЕЕ" color={ICE} size={36} />}
		</AbsoluteFill>
	);
};

// ============================================================ 64. «Поэтому одевайся слоями. Не потей на морозе. Промокла одежда — переоденься сразу.» =====
const Check: React.FC<{f: number; at: number; x: number; y: number; text: string}> = ({f, at, x, y, text}) => {
	if (f < at) return null;
	const p = pop(f, at, 12);
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(0,-50%) scale(${p})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22, fontFamily: HEAVY, fontWeight: 900, fontSize: 56, color: '#fff'}}>
			<div style={{width: 70, height: 70, borderRadius: 18, background: '#3aa86a', color: '#fff', textAlign: 'center', lineHeight: '72px', fontSize: 50}}>✓</div>
			{text}
		</div>
	);
};
export const S64: React.FC = () => {
	const f = useCurrentFrame();
	const n = 64;
	const layers = ['#e8e4da', '#b8543a', '#2f5a9a'];
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<g transform="translate(470,520)">
					{layers.map((c, k) => {
						const p = pop(f, 6 + k * 10, 12);
						const r = 1 + k * 0.16;
						return (
							<g key={k} transform={`scale(${r * p})`} opacity={0.95}>
								<path d="M -120,-230 Q 0,-260 120,-230 L 150,-120 L 130,-110 L 120,160 L -120,160 L -130,-110 L -150,-120 Z" fill={c} stroke="#12141c" strokeWidth={4} />
							</g>
						);
					}).reverse()}
				</g>
			</Stage16>
			<Check f={f} at={w(n, 'слоями') - 4} x={860} y={300} text="ОДЕВАЙСЯ СЛОЯМИ" />
			<Check f={f} at={w(n, 'потей') - 4} x={860} y={440} text="НЕ ПОТЕЙ НА МОРОЗЕ" />
			<Check f={f} at={w(n, 'промокла') - 4} x={860} y={580} text="ПРОМОКЛО — ПЕРЕОДЕНЬСЯ" />
		</AbsoluteFill>
	);
};

// ============================================================ 65. «Ешь: еда — это топливо для дрожи. И держи телефон во внутреннем кармане…» =====
export const S65: React.FC = () => {
	const f = useCurrentFrame();
	const n = 65;
	const ph = w(n, 'телефон') - 4;
	const bat = interpolate(f, [ph, ph + 50], [80, 15], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<g transform={`translate(520,460) scale(${pop(f, 4, 12)})`}>
					<ellipse cx={-120} cy={60} rx={110} ry={40} fill="#f4f2ee" />
					<path d="M -220,40 Q -120,140 -20,40 Z" fill="#e8a838" />
					<rect x={40} y={-10} width={200} height={110} rx={50} fill="#c8843a" />
					<rect x={-80} y={-170} width={150} height={90} rx={8} fill="#5a3a24" />
					<path d="M -30,-200 q 20,-30 0,-60 M 10,-200 q 20,-30 0,-60" stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />
					<path d="M 0,170 q -40,-60 0,-120 q 50,60 0,120 Z" fill="#ff8a3a" transform="translate(0,40)" />
				</g>
				{f >= ph && (
					<g transform={`translate(1400,470) scale(${pop(f, ph, 12)})`}>
						<rect x={-120} y={-230} width={240} height={460} rx={34} fill="#14161c" />
						<rect x={-104} y={-206} width={208} height={412} rx={22} fill="#1e2a40" />
						<rect x={-60} y={-40} width={110} height={56} rx={10} fill="none" stroke="#fff" strokeWidth={8} />
						<rect x={52} y={-22} width={10} height={20} rx={3} fill="#fff" />
						<rect x={-52} y={-32} width={94 * (bat / 100)} height={40} rx={6} fill={bat > 30 ? '#3aa86a' : RED} />
						<text x={0} y={90} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#fff">
							{Math.round(bat)}%
						</text>
						{Array.from({length: 6}).map((_, k) => (
							<path key={k} d={`M ${-150 + rnd(k) * 300},${-260 + rnd(k + 3) * 520} l 10,-6 l 10,6 l -10,6 Z`} fill={ICE} opacity={0.7} />
						))}
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={w(n, 'топливо') - 4} x={520} y={820 - 30} text="ЕДА = ТОПЛИВО ДЛЯ ДРОЖИ" color="#ff8a3a" size={40} />
			{f >= ph && <Plaque f={f} at={ph + 10} x={1400} y={820 - 30} text="ТЕЛЕФОН — ВО ВНУТРЕННИЙ КАРМАН" color={ICE} size={34} />}
		</AbsoluteFill>
	);
};

// ============================================================ 66–67. the ice =====
const IceRiver: React.FC<{f: number; hole?: number; crack?: number}> = ({f, hole = 0, crack = 0}) => (
	<g>
		<rect x={-400} y={-400} width={2800} height={1000} fill="#2a3a5e" />
		<path d="M -400,560 Q 300,500 900,540 Q 1500,580 2400,520 L 2400,1500 L -400,1500 Z" fill="#c8dcec" />
		{Array.from({length: 7}).map((_, k) => (
			<g key={k} transform={`translate(${-100 + k * 330},540)`}>
				<rect x={-10} y={-120} width={20} height={120} fill="#2a2a30" />
				<path d="M -70,-90 L 0,-260 L 70,-90 Z" fill="#1e2e2a" />
			</g>
		))}
		<path d="M -400,620 Q 400,600 1000,640 Q 1600,680 2400,620 L 2400,1500 L -400,1500 Z" fill="#dbeaf6" />
		{crack > 0 &&
			Array.from({length: 7}).map((_, k) => {
				const a = (k / 7) * Math.PI * 2 + 0.3;
				return <path key={k} d={`M 960,860 l ${Math.cos(a) * 160 * crack},${Math.sin(a) * 70 * crack} l ${Math.cos(a + 0.5) * 60 * crack},${Math.sin(a + 0.5) * 30 * crack}`} stroke="#5a7a9a" strokeWidth={5} fill="none" />;
			})}
		{hole > 0 && <ellipse cx={960} cy={860} rx={190 * hole} ry={60 * hole} fill="#0b2442" stroke="#a8c4dc" strokeWidth={8} />}
		<Snowfall f={f} n={40} o={0.6} />
	</g>
);
export const S66: React.FC = () => {
	const f = useCurrentFrame();
	const n = 66;
	const L = len(n);
	const crack = w(n, 'лёд') - 4;
	const cr = interpolate(f, [crack, crack + 10], [0, 1], clamp);
	const down = interpolate(f, [crack + 10, crack + 24], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const walk = Math.min(1, f / Math.max(1, crack));
	const k = 0.5;
	return (
		<AbsoluteFill>
			<Stage16 bg="#2a3a5e">
				<Layer cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 600}, {s: 1.12, cx: 960, cy: 680})}>
					<IceRiver f={f} crack={cr} hole={down} />
					{down < 1 && (
						<g>
							<defs>
								<clipPath id="z1s66c">
									<rect x={0} y={-2000} width={1920} height={2860 + (1 - down) * 400} />
								</clipPath>
							</defs>
							<g clipPath="url(#z1s66c)">
								<Person kind="teen" id="z1s66y" x={lerp(walk, 0, 1, 640, 960)} y={870 + down * 260} scale={k} colors={NOW} plain knit="#d8402a" walk={f < crack ? f * 0.3 : undefined} breathe={f} headTurn={0.2} face={{eyes: cr > 0 ? 'wide' : 'open', pupil: cr > 0 ? 0.45 : 1, brows: cr > 0 ? 'raised' : 'neutral', mouth: cr > 0 ? 'o' : 'smile', look: [0.3, 0.5], blush: true, glasses: false}} />
							</g>
						</g>
					)}
				</Layer>
			</Stage16>
			<Plaque f={f} at={3} x={960} y={190} text="САМОЕ ПОЛЕЗНОЕ" color={YEL} size={56} to={crack + 6} />
			{f >= crack + 6 && <Plaque f={f} at={crack + 6} x={960} y={190} text="ЕСЛИ ЛЁД ПРОВАЛИЛСЯ" color={ICE} size={56} />}
		</AbsoluteFill>
	);
};
export const S67: React.FC = () => {
	const f = useCurrentFrame();
	const n = 67;
	const calm = interpolate(f, [w(n, 'шок') - 4, len(n)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#2a3a5e">
				<Layer cam={camAt(f, 0, len(n), {s: 1.5, cx: 960, cy: 760}, {s: 1.56, cx: 960, cy: 760})}>
					<IceRiver f={f} hole={1} />
					<defs>
						<clipPath id="z1s67c">
							<rect x={-400} y={-2000} width={2800} height={2872} />
							<ellipse cx={960} cy={872} rx={186} ry={58} />
						</clipPath>
					</defs>
					<g clipPath="url(#z1s67c)">
					<InWater id="z1s67y" f={f} x={960} y={872} k={0.62} face={{eyes: calm > 0.5 ? 'narrow' : 'wide', brows: calm > 0.5 ? 'neutral' : 'worried', mouth: 'flat', look: [0, 0]}} cold={0.15} breath={lerp(calm, 0, 1, 2.2, 0.6)} vest={false} colors={NOW} sea="#0b2442" bob={0.4} />
					</g>
					<ellipse cx={960} cy={872} rx={190} ry={60} fill="none" stroke="#a8c4dc" strokeWidth={8} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={3} x={960} y={190} text="1 МИНУТА — ДЫШИ" color={ICE} size={60} />
			<Plaque f={f} at={w(n, 'кричи') - 4} x={960} y={300} text="НЕ КРИЧИ, НЕ БАРАХТАЙСЯ" color={YEL} size={42} />
		</AbsoluteFill>
	);
};

// ============================================================ 68–70. getting out: the diagrams =====
const IceTop: React.FC = () => (
	<g>
		<rect x={0} y={0} width={1920} height={1080} fill="#dbeaf6" />
		{Array.from({length: 20}).map((_, k) => (
			<path key={k} d={`M ${rnd(k) * 1920},${rnd(k + 5) * 1080} l ${60 + rnd(k + 2) * 80},${20 - rnd(k + 3) * 40}`} stroke="#c0d4e6" strokeWidth={4} />
		))}
		<rect x={0} y={900} width={1920} height={180} fill="#e8d8b8" />
		<text x={960} y={1010} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#8a7a5a">
			БЕРЕГ
		</text>
	</g>
);
export const S68: React.FC = () => {
	const f = useCurrentFrame();
	const n = 68;
	const arrow = interpolate(f, [8, 34], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill>
			<Stage16 bg="#dbeaf6">
				<IceTop />
				{/* your footprints from the shore to the hole */}
				{Array.from({length: 8}).map((_, k) => (
					<ellipse key={k} cx={960 + (k % 2 ? 26 : -26)} cy={860 - k * 56} rx={16} ry={24} fill="#a8bcd0" />
				))}
				<ellipse cx={960} cy={360} rx={180} ry={110} fill="#0b2442" stroke="#a8c4dc" strokeWidth={8} />
				<circle cx={960} cy={360} r={34} fill="#d8402a" />
				<path d={`M 960,420 L 960,${420 + 300 * arrow}`} stroke="#3aa86a" strokeWidth={26} strokeLinecap="round" />
				{arrow > 0.9 && <path d="M 920,700 L 960,760 L 1000,700 Z" fill="#3aa86a" />}
				<path d="M 1160,300 l 120,-90 M 1160,420 l 140,40 M 760,300 l -130,-80" stroke="#c84a3a" strokeWidth={8} strokeDasharray="14 10" />
			</Stage16>
			<Plaque f={f} at={w(n, 'выдержал') - 6} x={1440} y={640} text="ТУДА, ГДЕ ЛЁД ВЫДЕРЖАЛ" color="#3aa86a" size={42} />
		</AbsoluteFill>
	);
};
export const S69: React.FC = () => {
	const f = useCurrentFrame();
	const n = 69;
	const L = len(n);
	const horiz = interpolate(f, [w(n, 'ногами') - 6, w(n, 'ногами') + 20], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const slide = interpolate(f, [w(n, 'выползай') - 4, L - 6], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	return (
		<AbsoluteFill style={{background: '#dbeaf6'}}>
			<Stage16 bg="transparent">
				{/* side view: the water in the hole on the left, the ice edge, the ice on the right */}
				<rect x={0} y={520} width={760} height={560} fill="#0b2442" />
				<rect x={760} y={480} width={1160} height={80} fill="#c8dcec" />
				<rect x={760} y={560} width={1160} height={520} fill="#0b2442" />
				<path d="M 0,520 L 760,520" stroke="#5a8ac8" strokeWidth={4} />
				<g transform={`translate(${lerp(slide, 0, 1, 560, 1240)},${lerp(horiz, 0, 1, 640, 500) - slide * 20})`}>
					<Picto x={0} y={0} s={0.95} rot={lerp(horiz, 0, 1, 0, 90)} pose="reach" color="#d8402a" kick={horiz > 0.5 && slide < 1 ? Math.sin(f / 3) : 0} />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'руки') - 4} x={1340} y={190} text="РУКИ — НА ЛЁД" color={YEL} size={50} />
			<Plaque f={f} at={w(n, 'ногами') - 4} x={1340} y={300} text="НОГИ РАБОТАЮТ — ТЕЛО ГОРИЗОНТАЛЬНО" color="#2a3a5e" size={34} />
			{f >= w(n, 'тюлень') - 4 && <Plaque f={f} at={w(n, 'тюлень') - 4} x={1340} y={410} text="ВЫПОЛЗАЙ, КАК ТЮЛЕНЬ" color="#3aa86a" size={44} />}
		</AbsoluteFill>
	);
};
export const S70: React.FC = () => {
	const f = useCurrentFrame();
	const n = 70;
	const L = len(n);
	const roll = interpolate(f, [w(n, 'откатись') - 4, w(n, 'ползи') - 6], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const crawl = interpolate(f, [w(n, 'ползи') - 6, L], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#dbeaf6">
				<IceTop />
				<ellipse cx={420} cy={420} rx={170} ry={100} fill="#0b2442" stroke="#a8c4dc" strokeWidth={8} />
				<g transform={`translate(${lerp(roll, 0, 1, 640, 1100) + crawl * 300},${420 + crawl * 360})`}>
					<Picto x={0} y={0} s={0.8} rot={90 + roll * 720 + (crawl > 0 ? 0 : 0)} pose={crawl > 0 ? 'crawl' : 'stand'} color="#d8402a" kick={crawl > 0 && crawl < 1 ? Math.sin(f / 4) : 0} />
				</g>
				{/* a standing person crossed out */}
				<g transform={`translate(1620,380) scale(${pop(f, w(n, 'вставай') - 4, 11)})`}>
					<Picto x={0} y={60} s={0.9} color="#5a6a8a" />
					<path d="M -110,-180 L 110,120 M 110,-180 L -110,120" stroke={RED} strokeWidth={18} strokeLinecap="round" />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'вставай') - 4} x={1620} y={640} text="НЕ ВСТАВАЙ" color={RED} size={50} />
			<Plaque f={f} at={w(n, 'откатись') - 4} x={760} y={150} text="ОТКАТИСЬ ОТ ПОЛЫНЬИ" color="#3aa86a" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 71. «Если под лёд провалился кто-то другой — не беги к нему. Звони 112… ложись на лёд…» =====
export const S71: React.FC = () => {
	const f = useCurrentFrame();
	const n = 71;
	const lie = w(n, 'ложись') - 4;
	const reach = interpolate(f, [w(n, 'протяни') - 4, w(n, 'протяни') + 20], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#dbeaf6">
				<IceTop />
				<ellipse cx={520} cy={420} rx={170} ry={100} fill="#0b2442" stroke="#a8c4dc" strokeWidth={8} />
				<circle cx={520} cy={420} r={34} fill="#d8402a" />
				{/* the helper: lying flat, holding out a scarf */}
				<Picto x={1080} y={430} s={0.85} rot={f >= lie ? 90 : 0} pose={f >= lie ? 'reach' : 'stand'} color="#2f6ad8" />
				<path d={`M ${880},${430} L ${lerp(reach, 0, 1, 880, 600)},${430}`} stroke="#d8402a" strokeWidth={16} strokeLinecap="round" strokeDasharray="2 18" />
				<path d={`M ${880},${430} L ${lerp(reach, 0, 1, 880, 600)},${430}`} stroke="#d8402a" strokeWidth={10} strokeLinecap="round" />
				{/* 112 */}
				<g transform={`translate(1560,330) scale(${pop(f, w(n, 'звони') - 4, 11)})`}>
					<rect x={-110} y={-190} width={220} height={380} rx={32} fill="#14161c" />
					<rect x={-94} y={-168} width={188} height={336} rx={20} fill="#e0342b" />
					<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={86} fill="#fff">
						112
					</text>
				</g>
			</Stage16>
			<Plaque f={f} at={2} x={760} y={150} text="НЕ БЕГИ К ПОЛЫНЬЕ" color={RED} size={48} />
			{f >= lie && <Plaque f={f} at={lie} x={1080} y={640} text="ЛОЖИСЬ НА ЛЁД" color="#2f6ad8" size={44} />}
		</AbsoluteFill>
	);
};

// ============================================================ 72–74. first aid =====
export const S72: React.FC = () => {
	const f = useCurrentFrame();
	const n = 72;
	const spots = w(n, 'грудь') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #3a2a1e 0%, #120a06 80%)'}}>
			<Stage16 bg="transparent">
				{/* a warm room: a blanket, the lamp */}
				<circle cx={1500} cy={260} r={260} fill="#ffd98a" opacity={0.12} />
				<g transform="translate(700,520)">
					<path d="M -250,-120 Q 0,-210 250,-120 L 290,330 L -290,330 Z" fill="#b8543a" />
					<path d="M -250,-120 Q 0,-210 250,-120" stroke="#f2d79a" strokeWidth={10} fill="none" />
					{[0, 1, 2].map((k) => (
						<line key={k} x1={-260 + k * 10} y1={-40 + k * 120} x2={260 - k * 10} y2={-40 + k * 120} stroke="#9a4430" strokeWidth={8} />
					))}
					<Bust kind="teen" id="z1s72b" x={0} y={-250} scale={0.95} colors={NOW} plain face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0.3, 0.1], blush: true, glasses: false}} />
					<path d="M -250,-120 Q 0,-210 250,-120 L 290,330 L -290,330 Z" fill="#b8543a" />
					<path d="M -250,-120 Q 0,-210 250,-120" stroke="#f2d79a" strokeWidth={10} fill="none" />
				</g>
				<g transform="translate(1420,560)">
					<rect x={-230} y={-330} width={460} height={660} rx={30} fill="#1a1210" stroke="#7a5a3a" strokeWidth={5} />
					<circle cx={0} cy={-220} r={50} fill="none" stroke="#f2d79a" strokeWidth={6} />
					<path d="M -110,-150 Q 0,-170 110,-150 L 100,120 L -100,120 Z" fill="none" stroke="#f2d79a" strokeWidth={6} />
					{[[0, -110, 'ГРУДЬ'], [0, -168, 'ШЕЯ'], [-90, -120, ''], [90, -120, '']].map(([dx, dy, t], k) =>
						f >= spots + k * 6 ? (
							<g key={k} transform={`translate(${dx},${dy}) scale(${pop(f, spots + k * 6, 11)})`}>
								<circle r={30} fill="#ff8a4a" opacity={0.9} />
							</g>
						) : null,
					)}
				</g>
			</Stage16>
			<Plaque f={f} at={2} x={700} y={130} text="В ТЕПЛО" color="#ff8a4a" size={56} />
			<Plaque f={f} at={w(n, 'сними') - 4} x={700} y={850 - 40} text="СНЯТЬ МОКРОЕ · УКУТАТЬ" color={YEL} size={40} />
			{f >= spots && <Plaque f={f} at={spots} x={1420} y={850 - 40} text="ГРЕТЬ: ГРУДЬ, ШЕЮ, ПОДМЫШКИ" color="#ff8a4a" size={34} />}
		</AbsoluteFill>
	);
};
export const S73: React.FC = () => {
	const f = useCurrentFrame();
	const n = 73;
	const a = w(n, 'растирай') - 4;
	const b = w(n, 'алкоголя') - 4;
	const Cross: React.FC<{p: number}> = ({p}) => (
		<g transform={`scale(${p})`}>
			<circle r={190} fill="none" stroke={RED} strokeWidth={20} />
			<path d="M -134,-134 L 134,134" stroke={RED} strokeWidth={22} strokeLinecap="round" />
		</g>
	);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				{f >= a && (
					<g transform="translate(600,470)">
						<circle r={170} fill="#0e1830" />
						<circle cx={-20} cy={10} r={80} fill="#f4fbff" stroke="#cfe0f8" strokeWidth={6} />
						<ellipse cx={60} cy={-30} rx={70} ry={50} fill="#efbf98" />
						<Cross p={pop(f, a + 6, 11)} />
					</g>
				)}
				{f >= b && (
					<g transform="translate(1320,470)">
						<circle r={170} fill="#0e1830" />
						<g transform="scale(0.9)">
							<rect x={-16} y={-150} width={32} height={50} rx={6} fill="#4a2e1a" />
							<path d="M -16,-100 Q -50,-80 -50,-30 L -50,90 Q -50,110 -30,110 L 30,110 Q 50,110 50,90 L 50,-30 Q 50,-80 16,-100 Z" fill="#6a3a1a" />
						</g>
						<Cross p={pop(f, b + 6, 11)} />
					</g>
				)}
			</Stage16>
			{f >= a && <Plaque f={f} at={a} x={600} y={800} text="НЕ РАСТИРАЙ СНЕГОМ" color={RED} size={42} />}
			{f >= b && <Plaque f={f} at={b} x={1320} y={800} text="НИКАКОГО АЛКОГОЛЯ" color={RED} size={42} />}
		</AbsoluteFill>
	);
};
export const S74: React.FC = () => {
	const f = useCurrentFrame();
	const n = 74;
	const amb = w(n, 'скорую') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2a3a 0%, #0a0a12 80%)'}}>
			<Stage16 bg="transparent">
				<g transform={`translate(600,520) scale(${pop(f, 4, 12)})`}>
					<path d="M -120,-140 L 120,-140 L 100,140 Q 98,160 78,160 L -78,160 Q -98,160 -100,140 Z" fill="#f4f2ee" stroke="#1d1d24" strokeWidth={6} />
					<path d="M 120,-80 Q 210,-80 200,0 Q 190,70 112,70" stroke="#f4f2ee" strokeWidth={26} fill="none" />
					<rect x={-104} y={-120} width={208} height={40} fill="#b8743a" />
					{[0, 1, 2].map((k) => {
						const t = (f * 1.2 + k * 14) % 42;
						return <path key={k} d={`M ${-50 + k * 50},${-170 - t * 2} q 16,-16 0,-32 q -16,-16 0,-32`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8 * (1 - t / 42)} />;
					})}
					<rect x={160} y={110} width={60} height={60} rx={8} fill="#fff" stroke="#c8c4ba" strokeWidth={4} />
					<rect x={230} y={130} width={60} height={60} rx={8} fill="#fff" stroke="#c8c4ba" strokeWidth={4} />
				</g>
				{f >= amb && (
					<g transform={`translate(${lerp(f, amb, amb + 30, 2100, 1400, Easing.out(Easing.cubic))},560)`}>
						<rect x={-260} y={-200} width={520} height={260} rx={30} fill="#f4f6f8" stroke="#1d1d24" strokeWidth={6} />
						<rect x={-260} y={-40} width={520} height={40} fill={RED} />
						<path d="M -20,-150 h 40 v 40 h 40 v 40 h -40 v 40 h -40 v -40 h -40 v -40 h 40 Z" fill={RED} />
						<rect x={140} y={-180} width={100} height={90} rx={14} fill="#9fc8e8" />
						<circle cx={-150} cy={70} r={50} fill="#1d1d24" />
						<circle cx={150} cy={70} r={50} fill="#1d1d24" />
						<rect x={-80} y={-230} width={160} height={34} rx={10} fill={f % 20 < 10 ? '#3a6ad8' : RED} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={w(n, 'чай') - 4} x={600} y={850 - 40} text="ТЁПЛЫЙ СЛАДКИЙ ЧАЙ" color="#ffb84a" size={40} />
			{f >= amb && <Plaque f={f} at={amb + 8} x={1400} y={850 - 40} text="СКОРАЯ: 103 ИЛИ 112" color={RED} size={40} />}
		</AbsoluteFill>
	);
};

// ============================================================ 75. «Холод не злой. Он просто медленный и тихий…» =====
export const S75: React.FC = () => {
	const f = useCurrentFrame();
	const n = 75;
	const L = len(n);
	return (
		<AbsoluteFill>
			<Stage16 bg="#1a2a4a">
				<Layer cam={camAt(f, 0, L, {s: 1.0, cx: 900, cy: 540}, {s: 1.06, cx: 1020, cy: 540})} d={0.3}>
					<NightSky id="z1s75" hz={640} f={f} dawn={0.35} />
				</Layer>
				<Layer cam={camAt(f, 0, L, {s: 1.0, cx: 900, cy: 540}, {s: 1.06, cx: 1020, cy: 540})}>
					<path d="M -400,620 Q 300,560 900,600 Q 1500,640 2400,580 L 2400,1500 L -400,1500 Z" fill="#dbe6f2" />
					{[180, 420, 1500, 1760].map((x, k) => (
						<g key={k} transform={`translate(${x},640) scale(0.8)`}>
							<rect x={-14} y={-60} width={28} height={70} fill="#3a2a1e" />
							{[0, 1, 2, 3].map((q) => (
								<path key={q} d={`M ${-150 + q * 30},${-50 - q * 110} L 0,${-230 - q * 110} L ${150 - q * 30},${-50 - q * 110} Z`} fill="#24403a" />
							))}
						</g>
					))}
					<Snowfall f={f} n={90} o={0.9} />
				</Layer>
			</Stage16>
			<ColdGrade cold={0.2} vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 76. «Но у тебя всегда есть минута, чтобы вдохнуть. Десять минут… И голова…» =====
const Card: React.FC<{f: number; at: number; x: number; big: string; unit?: string; text: string; color: string; small?: boolean}> = ({f, at, x, big, unit, text, color, small}) => {
	if (f < at) return null;
	return (
		<div style={{position: 'absolute', left: x, top: 440, transform: `translate(-50%,-50%) scale(${pop(f, at, 12)})`, width: 470, height: 500, background: 'rgba(10,14,24,0.92)', border: `8px solid ${color}`, borderRadius: 30, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
			<div style={{fontSize: small ? 96 : 200, lineHeight: 1, marginTop: small ? 110 : 40, color}}>{big}</div>
			{unit && <div style={{fontSize: 52, marginTop: 4}}>{unit}</div>}
			<div style={{fontSize: 44, marginTop: small ? 56 : 34, color: '#b8c4d8'}}>{text}</div>
		</div>
	);
};
export const S76: React.FC = () => {
	const f = useCurrentFrame();
	const n = 76;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #142a50 0%, #050a16 80%)'}}>
			<Card f={f} at={w(n, 'минута') - 4} x={420} big="1" unit="МИНУТА" text="ВДОХНУТЬ" color={ICE} />
			<Card f={f} at={w(n, 'десять') - 4} x={960} big="10" unit="МИНУТ" text="ДЕЙСТВОВАТЬ" color={YEL} />
			<Card f={f} at={w(n, 'голова') - 4} x={1500} big="ГОЛОВА" text="ЗНАТЬ, ЧТО ДЕЛАТЬ" color="#3aa86a" small />
		</AbsoluteFill>
	);
};

// ============================================================ 77. «Как думаешь, сколько можно продержаться в такой воде? Пиши в комментариях.» =====
export const S77: React.FC = () => {
	const f = useCurrentFrame();
	const n = 77;
	const com = w(n, 'комментариях') - 6;
	return (
		<AbsoluteFill>
			<Stage16>
				<rect x={0} y={0} width={1920} height={1080} fill="#07101e" />
				<rect x={0} y={640} width={1920} height={440} fill="#0b1634" />
				<InWater id="z1s77y" f={f} x={560} y={900} k={0.95} face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [0.7, -0.2]}} cold={0.1} breath={0.5} />
				{['?', '?', '?'].map((q, k) => (
					<g key={k} transform={`translate(${1100 + k * 230},${340 + Math.sin(f / 12 + k) * 16}) scale(${pop(f, 4 + k * 6, 11)})`}>
						<path d="M -90,-70 Q -90,-110 -50,-110 L 50,-110 Q 90,-110 90,-70 L 90,20 Q 90,60 50,60 L -20,60 L -60,100 L -54,60 Q -90,56 -90,20 Z" fill="#fff" stroke={INK} strokeWidth={6} />
						<text x={0} y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={90} fill={INK}>
							{q}
						</text>
					</g>
				))}
			</Stage16>
			{f >= com && <Plaque f={f} at={com} x={1330} y={640} text="ПИШИ В КОММЕНТАРИЯХ" color={YEL} size={50} />}
		</AbsoluteFill>
	);
};

// ============================================================ 78. the end card: «И подпишись… ранний доступ… в моём ТГК» =====
export const S78: React.FC = () => {
	const f = useCurrentFrame();
	const n = 78;
	const tg = w(n, 'тгк') - 6;
	const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - 20) / 4);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #12305a 0%, #050a16 75%)'}}>
			<Stage16 bg="transparent">
				<Snowfall f={f} n={60} o={0.6} />
			</Stage16>
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', transform: `scale(${pop(f, 2, 13)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 96, lineHeight: 1.04, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,0.35), 5px 5px 0 #12141c, -5px 5px 0 #12141c, 5px -5px 0 #12141c, -5px -5px 0 #12141c'}}>
				КАКОВО ЭТО —
				<br />
				<span style={{color: ICE}}>ЗАМЁРЗНУТЬ НАСМЕРТЬ</span>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', transform: `scale(${pop(f, 10, 12) * pulse})`}}>
				<div style={{display: 'inline-block', background: RED, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, padding: '20px 60px 26px', borderRadius: 30, boxShadow: '0 10px 0 #8f1416'}}>ПОДПИШИСЬ</div>
			</div>
			{f >= tg && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', transform: `scale(${pop(f, tg, 12)})`}}>
					<div style={{display: 'inline-block', background: '#2a9ae0', color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, padding: '14px 44px 18px', borderRadius: 24}}>РАННИЙ ДОСТУП — В ТГК</div>
				</div>
			)}
		</AbsoluteFill>
	);
};
