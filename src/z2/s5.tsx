// «Каково это — умереть от жажды» — shots 66–85 (those without Чоби): the summer in the city, the cap and the shade, the
// salt, the closed car; the rules when you are stuck in the heat (stay by the car, shade by day, keep your clothes on,
// breathe through the nose, drink the water you have, signal); the heatstroke signs and 112; the ending in the desert.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {BONE, BONE_D} from '../components/Choby';
import {Person} from '../components/Person';
import {arm, camAt, Chip, DAWN, Dunes, Flask, HEAVY, HeatGrade, HOT, Layer, mix, mixPal, Moon, NIGHT, Plaque, RED, RUNNER, Shimmer, Sky, Stage16, SunDisk, SUNSET, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const INK = '#1d1d24';
const GREEN = '#3aa86a';

// ------------------------------------------------------------------ the city in summer -----
const CitySky: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="j-city" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#5aa0e0" />
				<stop offset="1" stopColor="#f6e8cc" />
			</linearGradient>
		</defs>
		<rect x={0} y={0} width={1920} height={1080} fill="url(#j-city)" />
	</g>
);
const Blocks: React.FC = () => (
	<g>
		{[
			[0, 300, 260, '#c8b8a8'],
			[240, 220, 300, '#d8c4a8'],
			[520, 340, 240, '#b8a898'],
			[740, 260, 320, '#d4bca0'],
			[1040, 360, 260, '#c4b4a4'],
			[1280, 240, 300, '#d8c4a8'],
			[1560, 320, 380, '#bca890'],
		].map(([x, h, wd, c], i) => (
			<g key={i}>
				<rect x={x as number} y={720 - (h as number)} width={wd as number} height={h as number} fill={c as string} />
				{Array.from({length: Math.floor((h as number) / 70)}).map((_, r) =>
					Array.from({length: Math.floor((wd as number) / 70)}).map((__, cI) => <rect key={`${r}-${cI}`} x={(x as number) + 22 + cI * 70} y={720 - (h as number) + 24 + r * 70} width={34} height={40} fill="#7aa0c8" opacity={0.7} />),
				)}
			</g>
		))}
		<rect x={0} y={720} width={1920} height={360} fill="#9a9a96" />
		<rect x={0} y={720} width={1920} height={20} fill="#b8b8b2" />
	</g>
);
const Ball: React.FC<{r?: number}> = ({r = 40}) => (
	<g>
		<circle r={r} fill="#fff" stroke={INK} strokeWidth={5} />
		<path d={`M 0,${-r * 0.4} L ${r * 0.38},${-r * 0.12} L ${r * 0.24},${r * 0.32} L ${-r * 0.24},${r * 0.32} L ${-r * 0.38},${-r * 0.12} Z`} fill={INK} />
	</g>
);

// ============================================================ 66. you can overheat in the city too =====
export const S66: React.FC = () => {
	const f = useCurrentFrame();
	const n = 66;
	const city = w(n, 'городе') - 8;
	const foot = w(n, 'футболе') - 8;
	const walk = w(n, 'прогулке') - 8;
	const cam = camAt(f, 0, len(n), {s: 1.02, cx: 960, cy: 540}, {s: 1.08, cx: 960, cy: 560});
	const ballX = 760 + Math.sin(f / 14) * 260;
	const ballY = 940 - Math.abs(Math.sin(f / 7)) * 120;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e8cc">
				<CitySky />
				<SunDisk x={1500} y={160} r={70} />
				<Layer cam={cam} d={0.5}>
					<Blocks />
				</Layer>
				<Layer cam={cam}>
					{/* the pitch */}
					<rect x={-200} y={820} width={2400} height={400} fill="#7ab05a" />
					<rect x={-200} y={820} width={2400} height={12} fill="#fff" opacity={0.7} />
					<Shimmer f={f} y={780} k={1.2} />
					{f >= foot && (
						<g>
							<You x={560} y={1060} s={0.52} f={f} walk={f * 0.4} dry={0.5} face={{eyes: 'open', mouth: 'open', brows: 'neutral', look: [0.5, 0.3], sweat: 1}} />
							<Person kind="son" id="j66b" x={980} y={1060} scale={0.4} breathe={f} walk={f * 0.42 + 1} face={{eyes: 'open', mouth: 'open', brows: 'worried', blush: true, sweat: 1}} />
							<g transform={`translate(${ballX},${ballY})`}>
								<Ball />
							</g>
						</g>
					)}
					{f >= walk && <Person kind="mom" id="j66c" x={lerp(f, walk, len(n), 1500, 1620)} y={1000} scale={0.4} breathe={f} walk={f * 0.25} face={{eyes: 'narrow', mouth: 'flat', brows: 'worried', blush: true, sweat: 0.8}} />}
				</Layer>
			</Stage16>
			<Plaque f={f} at={4} x={960} y={190} text="«В САХАРУ Я НЕ СОБИРАЮСЬ»" color={YEL} size={50} to={city - 6} />
			<Chip f={f} at={city + 4} x={600} y={200} text="В ЖАРУ" color={RED} size={46} />
			<Chip f={f} at={foot + 4} x={960} y={200} text="НА ФУТБОЛЕ" color={GREEN} size={46} />
			<Chip f={f} at={walk + 4} x={1340} y={200} text="НА ПРОГУЛКЕ" color="#2f86e0" size={46} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 69. a cap, light clothes, shade from 12 to 4 =====
const Cap: React.FC = () => (
	<g>
		<path d="M -110,10 C -110,-90 110,-90 110,10 Z" fill={RED} stroke={INK} strokeWidth={7} />
		<path d="M 60,10 L 190,24 C 200,30 190,40 180,40 L 60,30 Z" fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<circle cx={0} cy={-78} r={10} fill={INK} />
	</g>
);
const Tee: React.FC = () => (
	<path d="M -60,-110 L -150,-60 L -110,10 L -80,-10 L -80,120 L 80,120 L 80,-10 L 110,10 L 150,-60 L 60,-110 C 40,-80 -40,-80 -60,-110 Z" fill="#f8f6f0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
);
const ShadeClock: React.FC = () => (
	<g>
		<circle r={110} fill="#fff8ec" stroke={INK} strokeWidth={8} />
		<path d="M 0,0 L 0,-100 A 100,100 0 0 1 86.6,50 Z" fill="#7fc4ff" opacity={0.6} />
		<line x1={0} y1={0} x2={0} y2={-80} stroke={INK} strokeWidth={8} strokeLinecap="round" />
		<line x1={0} y1={0} x2={50} y2={20} stroke={INK} strokeWidth={8} strokeLinecap="round" />
		<text x={0} y={-118} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			12
		</text>
		<text x={116} y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			16
		</text>
	</g>
);
export const S69: React.FC = () => {
	const f = useCurrentFrame();
	const n = 69;
	const items = [
		{at: w(n, 'кепка') - 6, x: 480, c: <Cap />, t: 'КЕПКА'},
		{at: w(n, 'светлая') - 6, x: 960, c: <Tee />, t: 'СВЕТЛАЯ ОДЕЖДА'},
		{at: w(n, 'тень') - 6, x: 1440, c: <ShadeClock />, t: 'ТЕНЬ С 12 ДО 16'},
	];
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e8cc">
				<CitySky />
				<SunDisk x={1700} y={140} r={60} />
				<Blocks />
				<rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.25} />
				{items.map((it, i) =>
					f >= it.at ? (
						<g key={i} transform={`translate(${it.x},520) scale(${pop(f, it.at, 11)})`}>
							<rect x={-200} y={-230} width={400} height={460} rx={34} fill="#fff8ec" stroke={INK} strokeWidth={8} />
							<g transform="translate(0,-30)">{it.c}</g>
							<circle cx={150} cy={-180} r={34} fill={GREEN} stroke="#fff" strokeWidth={5} />
							<path d="M 134,-180 L 146,-166 L 168,-194" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							<text x={0} y={190} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={INK}>
								{it.t}
							</text>
						</g>
					) : null,
				)}
			</Stage16>
		</AbsoluteFill>
	);
};

// ============================================================ 70. sweat takes salt away: mineral water or a pinch of salt =====
export const S70: React.FC = () => {
	const f = useCurrentFrame();
	const n = 70;
	const mineral = w(n, 'минералку') - 6;
	const salt = w(n, 'щепоткой') - 6;
	const away = w(n, 'уходит') - 6;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e8cc">
				<CitySky />
				<SunDisk x={1600} y={150} r={60} />
				<Blocks />
				<rect x={-200} y={820} width={2400} height={400} fill="#7ab05a" />
				<You x={560} y={1230} s={1.12} f={f} dry={0.5} face={{eyes: 'narrow', mouth: 'open', brows: 'worried', look: [0.5, 0], sweat: 1}} />
				{/* the salt in the sweat drops */}
				{f >= away &&
					[0, 1, 2].map((i) => {
						const t = ((f - away + i * 9) % 27) / 27;
						const x = 376 + i * 34;
						const y = 560 + t * 170;
						return (
							<g key={i} opacity={1 - t}>
								<path d={`M ${x},${y - 22} C ${x + 14},${y - 6} ${x + 16},${y + 4} ${x},${y + 14} C ${x - 16},${y + 4} ${x - 14},${y - 6} ${x},${y - 22} Z`} fill="#9fd8ff" stroke={INK} strokeWidth={3} />
								<rect x={x - 5} y={y - 4} width={9} height={9} fill="#fff" stroke={INK} strokeWidth={2} />
							</g>
						);
					})}
				{f >= mineral && (
					<g transform={`translate(1180,620) scale(${pop(f, mineral, 11) * 1.6})`}>
						<rect x={-36} y={-150} width={72} height={150} rx={18} fill="#d8f0ff" stroke="#2a6aa8" strokeWidth={5} />
						<rect x={-36} y={-100} width={72} height={46} fill="#2f86e0" />
						<text x={0} y={-68} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={16} fill="#fff">
							МИНЕРАЛЬНАЯ
						</text>
						<rect x={-18} y={-176} width={36} height={30} rx={6} fill="#2f86e0" stroke="#2a6aa8" strokeWidth={4} />
					</g>
				)}
				{f >= salt && (
					<g transform={`translate(1560,600) scale(${pop(f, salt, 11)})`}>
						<path d="M -50,-90 L 50,-90 L 60,90 L -60,90 Z" fill="#f4f8fb" stroke={INK} strokeWidth={7} />
						<rect x={-56} y={-130} width={112} height={44} rx={14} fill="#c8d2da" stroke={INK} strokeWidth={6} />
						{[0, 1, 2].map((i) => {
							const t = ((f + i * 7) % 21) / 21;
							return <rect key={i} x={-10 + i * 10} y={-150 - t * 50} width={9} height={9} fill="#fff" stroke={INK} strokeWidth={2} opacity={1 - t} />;
						})}
					</g>
				)}
			</Stage16>
			<Chip f={f} at={mineral + 4} x={1180} y={300} text="МИНЕРАЛКА" color="#2f86e0" size={44} />
			<Chip f={f} at={salt + 4} x={1560} y={300} text="ЩЕПОТКА СОЛИ" color="#8a7a6a" size={44} />
			<Plaque f={f} at={away + 4} x={960} y={160} text="С ПОТОМ УХОДИТ И СОЛЬ" color={YEL} size={48} />
			<HeatGrade k={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 71. never leave children or pets in a closed car =====
export const S71: React.FC = () => {
	const f = useCurrentFrame();
	const n = 71;
	const never = w(n, 'никогда') - 4;
	const oven = w(n, 'духовку') - 10;
	const heat = interpolate(f, [never, len(n)], [0, 1], clamp);
	const t = Math.round(lerp(f, never, len(n) - 10, 30, 58));
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e8cc">
				<CitySky />
				<SunDisk x={1500} y={160} r={70} />
				<Blocks />
				{/* the car, side view */}
				<g transform="translate(860,820)">
					<ellipse cx={0} cy={120} rx={560} ry={30} fill="#000" opacity={0.2} />
					<path d="M -520,60 L -520,-20 C -520,-60 -480,-80 -420,-90 L -250,-110 L -140,-230 C -120,-250 -100,-260 -60,-260 L 220,-260 C 260,-260 290,-240 310,-210 L 400,-100 L 480,-80 C 520,-70 540,-40 540,0 L 540,60 Z" fill="#e8402e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
					{/* the windows with the inside heating up */}
					<path d="M -110,-220 L 90,-220 L 90,-110 L -210,-110 Z" fill={mix('#bfe4ff', '#ff7a3a', heat)} stroke={INK} strokeWidth={6} />
					<path d="M 120,-220 L 240,-220 C 260,-220 270,-210 280,-196 L 350,-110 L 120,-110 Z" fill={mix('#bfe4ff', '#ff7a3a', heat)} stroke={INK} strokeWidth={6} />
					{/* the dog inside */}
					<g transform="translate(180,-150)">
						<ellipse cx={0} cy={10} rx={42} ry={36} fill="#c98a4a" />
						<ellipse cx={-34} cy={-10} rx={14} ry={26} fill="#8a5a2a" />
						<ellipse cx={34} cy={-10} rx={14} ry={26} fill="#8a5a2a" />
						<circle cx={-14} cy={0} r={6} fill={INK} />
						<circle cx={14} cy={0} r={6} fill={INK} />
						<ellipse cx={0} cy={22} rx={10} ry={7} fill={INK} />
						{heat > 0.4 && <path d="M -6,32 C -6,52 6,52 6,32" fill="#e8607a" />}
					</g>
					{[-300, 330].map((x) => (
						<g key={x} transform={`translate(${x},60)`}>
							<circle r={86} fill="#2a2a30" />
							<circle r={40} fill="#9aa1ae" />
						</g>
					))}
					{heat > 0.2 &&
						[0, 1, 2].map((i) => {
							const tt = ((f + i * 10) % 30) / 30;
							return <path key={i} d={`M ${-60 + i * 120},${-280 - tt * 90} q 14,-18 0,-36 q -14,-18 0,-36`} stroke="#ff8a3a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={heat * (1 - tt)} />;
						})}
				</g>
				{/* the thermometer */}
				<g transform="translate(1600,820)">
					<rect x={-30} y={-460} width={60} height={440} rx={30} fill="#f4f8fb" stroke={INK} strokeWidth={7} />
					<rect x={-16} y={-40 - 400 * ((t - 20) / 45)} width={32} height={400 * ((t - 20) / 45) + 20} rx={16} fill={RED} />
					<circle r={54} fill={RED} stroke={INK} strokeWidth={7} />
					<text x={-60} y={-40 - 400 * ((t - 20) / 45) + 20} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">
						{t}°
					</text>
				</g>
			</Stage16>
			{f >= never && (
				<div style={{position: 'absolute', left: 860, top: 220, transform: `translate(-50%,-50%) rotate(-6deg) scale(${pop(f, never, 9)})`, border: `10px solid ${RED}`, color: RED, background: 'rgba(255,248,236,0.96)', borderRadius: 18, padding: '4px 30px 8px', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, whiteSpace: 'nowrap'}}>НИКОГДА</div>
			)}
			<Chip f={f} at={oven + 4} x={1600} y={240} text="ДУХОВКА ЗА МИНУТЫ" color="#ff7a3a" size={42} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 72. stuck in the heat without water: the rules =====
export const S72: React.FC = () => {
	const f = useCurrentFrame();
	const n = 72;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j72" p={HOT} />
				<SunDisk x={1600} y={150} r={66} />
				<Dunes p={HOT} />
				<Shimmer f={f} y={640} />
				<You x={520} y={1080} s={0.8} f={f} face={{eyes: 'open', mouth: 'flat', brows: 'raised', look: [0.8, -0.2]}} />
			</Stage16>
			{f >= w(n, 'запомни') - 6 && (
				<div style={{position: 'absolute', left: 1220, top: 500, transform: `translate(-50%,-50%) rotate(-2deg) scale(${pop(f, w(n, 'запомни') - 6, 12)})`, width: 720, padding: '34px 40px', background: '#fff8ec', border: '8px solid #1d1d24', borderRadius: 26, fontFamily: HEAVY, fontWeight: 900, color: INK, boxShadow: '0 16px 40px rgba(0,0,0,0.3)'}}>
					<div style={{fontSize: 30, color: '#a8561e', letterSpacing: 3}}>ЕСЛИ ЗАСТРЯЛ В ЖАРЕ БЕЗ ВОДЫ</div>
					<div style={{fontSize: 74, marginTop: 6}}>ПРАВИЛА</div>
					<div style={{fontSize: 74, color: RED}}>ВЫЖИВАНИЯ</div>
				</div>
			)}
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 73. the car broke down: stay by it =====
export const S73: React.FC = () => {
	const f = useCurrentFrame();
	const n = 73;
	const spot = w(n, 'заметить') - 6;
	const shade = w(n, 'тени') - 6;
	const ring = f >= spot ? ((f - spot) % 30) / 30 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j73" p={HOT} />
				<SunDisk x={1600} y={140} r={64} />
				<Dunes p={HOT} />
				<g transform="translate(980,860)">
					{f >= shade && <path d="M -420,110 L 300,110 L 560,190 L -200,190 Z" fill="#000" opacity={0.25 * pop(f, shade, 12)} />}
					<path d="M -460,60 L -460,-60 L -380,-80 L -300,-220 L 220,-220 L 300,-90 L 440,-70 C 470,-60 480,-30 480,0 L 480,60 Z" fill="#e8e0d0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
					<path d="M -270,-200 L -20,-200 L -20,-100 L -340,-100 Z" fill="#9ac0d8" stroke={INK} strokeWidth={6} />
					<path d="M 10,-200 L 200,-200 L 260,-100 L 10,-100 Z" fill="#9ac0d8" stroke={INK} strokeWidth={6} />
					{/* the bonnet up, steam */}
					<path d="M 300,-90 L 460,-200 L 480,-180 L 340,-80 Z" fill="#d8d0c0" stroke={INK} strokeWidth={6} />
					{[0, 1, 2].map((i) => {
						const t = ((f + i * 9) % 27) / 27;
						return <circle key={i} cx={400 + t * 30} cy={-120 - t * 120} r={20 + t * 26} fill="#f4f4f4" opacity={0.7 * (1 - t)} />;
					})}
					{[-290, 300].map((x) => (
						<g key={x} transform={`translate(${x},60)`}>
							<circle r={80} fill="#2a2a30" />
							<circle r={36} fill="#9aa1ae" />
						</g>
					))}
					{f >= spot && <circle cx={0} cy={-60} r={360 + ring * 140} fill="none" stroke={RED} strokeWidth={8} opacity={1 - ring} />}
				</g>
				<You x={1580} y={1060} s={0.56} f={f} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.7, 0]}} />
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="ОСТАВАЙСЯ У МАШИНЫ" color={YEL} size={54} to={spot - 4} />
			<Plaque f={f} at={spot + 4} x={960} y={190} text="ЕЁ ЛЕГЧЕ ЗАМЕТИТЬ" color={RED} size={54} to={shade - 4} />
			<Plaque f={f} at={shade + 4} x={960} y={190} text="В ЕЁ ТЕНИ МОЖНО ПРЯТАТЬСЯ" color="#7fc4ff" size={50} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 74. shade by day, walk only at night =====
export const S74: React.FC = () => {
	const f = useCurrentFrame();
	const n = 74;
	const night = w(n, 'идти') - 6;
	const t = interpolate(f, [night, night + 14], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j74" p={mixPal(HOT, NIGHT, t)} f={f} stars={t} />
				{t < 1 && <SunDisk x={1500} y={160} r={64} glow={1 - t} />}
				{t > 0 && <g opacity={t}><Moon x={1500} y={180} /></g>}
				<Dunes p={mixPal(HOT, NIGHT, t)} />
				{t < 0.5 ? (
					<g opacity={1 - t * 2} transform="translate(0,-120)">
						<path d="M 500,700 L 1000,680 L 1010,720 L 510,740 Z" fill="#f4efe4" stroke={INK} strokeWidth={6} />
						<line x1={510} y1={740} x2={510} y2={940} stroke="#6a4a2a" strokeWidth={10} />
						<line x1={1000} y1={720} x2={1000} y2={930} stroke="#6a4a2a" strokeWidth={10} />
						<ellipse cx={760} cy={940} rx={300} ry={30} fill="#000" opacity={0.25} />
						<g transform="translate(900,900) rotate(-90)">
							<You x={0} y={0} s={0.48} f={f} face={{eyes: 'closed', mouth: 'flat', brows: 'neutral'}} />
						</g>
					</g>
				) : (
					<g opacity={(t - 0.5) * 2}>
						<You x={lerp(f, night, len(n), 760, 980)} y={1000} s={0.66} f={f} walk={f * 0.3} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.5, 0]}} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="ДНЁМ — В ТЕНИ, НЕ ДВИГАЙСЯ" color={YEL} size={48} to={night - 4} />
			<Plaque f={f} at={night + 8} x={960} y={190} text="ИДТИ — ТОЛЬКО НОЧЬЮ" color="#7fc4ff" size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 75. keep your clothes on =====
export const S75: React.FC = () => {
	const f = useCurrentFrame();
	const n = 75;
	const why = w(n, 'одежда') - 6;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j75" p={HOT} />
				<SunDisk x={960} y={140} r={64} />
				<Dunes p={HOT} />
				{/* without a shirt — burnt; covered up — right */}
				<You x={560} y={1110} s={0.8} f={f} outfit="none" noCap dry={1} face={{eyes: 'narrow', mouth: 'open', brows: 'worried', look: [0.3, -0.2], sweat: 1}} outer={<ellipse cx={0} cy={-575} rx={150} ry={124} fill="#ff4a2a" opacity={0.14} />} />
				<You x={1360} y={1110} s={0.8} f={f} outfit="robe" seed={3} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [-0.3, 0]}} />
				{[0, 1].map((i) => (
					<g key={i} transform={`translate(${i ? 1560 : 760},360) scale(${pop(f, 4 + i * 6, 10)})`}>
						<circle r={56} fill={i ? GREEN : RED} stroke="#fff" strokeWidth={6} />
						{i ? <path d="M -24,0 L -6,20 L 26,-20" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <g stroke="#fff" strokeWidth={12} strokeLinecap="round"><line x1={-20} y1={-20} x2={20} y2={20} /><line x1={20} y1={-20} x2={-20} y2={20} /></g>}
					</g>
				))}
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="НЕ РАЗДЕВАЙСЯ" color={RED} size={56} to={why - 4} />
			<Plaque f={f} at={why + 4} x={960} y={190} text="ОДЕЖДА — ЗАЩИТА ОТ СОЛНЦА" color={YEL} size={48} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 76. talk less, breathe through the nose =====
export const S76: React.FC = () => {
	const f = useCurrentFrame();
	const n = 76;
	const nose = w(n, 'носом') - 8;
	const S = 1.6;
	const X = 960;
	const Y = 1346;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j76" p={HOT} />
				<Dunes p={HOT} />
				<You x={X} y={Y} s={S} f={f} bust face={{eyes: 'open', mouth: 'tight', brows: 'neutral', look: [0, 0.1]}} />
				{f >= nose &&
					[-1, 1].map((sd) =>
						[0, 1].map((i) => {
							const t = ((f - nose + i * 12) % 24) / 24;
							return <path key={`${sd}${i}`} d={`M ${X + sd * 16},${Y - 500 * S} l ${sd * (20 + t * 40)},${30 + t * 60}`} stroke="#9fd8ff" strokeWidth={8} strokeLinecap="round" opacity={1 - t} />;
						}),
					)}
				{/* a crossed-out chatter bubble */}
				<g transform={`translate(1580,400) scale(${pop(f, 4, 11)})`}>
					<path d="M -150,-80 Q -150,-120 -110,-120 L 110,-120 Q 150,-120 150,-80 L 150,30 Q 150,70 110,70 L -30,70 L -80,120 L -70,70 L -110,70 Q -150,70 -150,30 Z" fill="#fff8ec" stroke={INK} strokeWidth={7} />
					<text x={0} y={-10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={INK}>
						БЛА-БЛА
					</text>
					<g stroke={RED} strokeWidth={14} strokeLinecap="round">
						<line x1={-120} y1={-100} x2={120} y2={50} />
						<line x1={120} y1={-100} x2={-120} y2={50} />
					</g>
				</g>
			</Stage16>
			<Plaque f={f} at={2} x={500} y={200} text="МЕНЬШЕ ГОВОРИ" color={RED} size={50} />
			<Plaque f={f} at={nose + 4} x={500} y={320} text="ДЫШИ НОСОМ" color="#7fc4ff" size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 77. if you have water — drink it =====
export const S77: React.FC = () => {
	const f = useCurrentFrame();
	const n = 77;
	const drink = w(n, 'пей') - 6;
	const save = w(n, 'экономь') - 6;
	const flaskAt = w(n, 'фляге') - 8;
	const lvl = interpolate(f, [drink, drink + 40], [0.8, 0.35], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j77" p={HOT} />
				<SunDisk x={1600} y={150} r={60} />
				<Dunes p={HOT} />
				<You
					x={760}
					y={1100}
					s={0.9}
					f={f}
					face={{eyes: f >= drink ? 'closed' : 'open', mouth: f >= drink ? 'o' : 'flat', brows: 'neutral', look: [0.3, -0.3]}}
					armR={f >= drink ? arm([150, -396], [60, -470], {fist: true}) : arm([112, -318], [150, -250], {fist: true, item: <Flask level={lvl} s={0.85} tilt={0} id="j77f" />})}
					outer={
						f >= drink ? (
							<g>
								<g transform="translate(91,-506)">
									<Flask level={lvl} s={0.85} tilt={230} id="j77f" />
								</g>
								<ellipse cx={50} cy={-470} rx={19} ry={17} fill={BONE} stroke={BONE_D} strokeWidth={4} />
							</g>
						) : undefined
					}
				/>
				{f >= flaskAt && (
					<g transform={`translate(1420,700) scale(${pop(f, flaskAt, 11)})`}>
						<Flask level={0.95} s={2.2} id="j77g" />
						<g stroke={RED} strokeWidth={16} strokeLinecap="round">
							<line x1={-100} y1={-300} x2={100} y2={10} />
							<line x1={100} y1={-300} x2={-100} y2={10} />
						</g>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={drink + 4} x={960} y={190} text="ЕСТЬ ВОДА — ПЕЙ" color="#7fc4ff" size={54} to={save - 4} />
			<Plaque f={f} at={save + 4} x={960} y={190} text="ЭКОНОМЬ ПОТ, А НЕ ВОДУ" color={YEL} size={52} />
			<Chip f={f} at={flaskAt + 8} x={1420} y={290} text="ВО ФЛЯГЕ — НЕ ОХЛАДИТ" color={RED} size={40} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 78. signal: a mirror by day, a fire by night =====
export const S78: React.FC = () => {
	const f = useCurrentFrame();
	const n = 78;
	const mirror = w(n, 'зеркальцем') - 6;
	const fire = w(n, 'огнём') - 6;
	const glint = f >= mirror ? 0.6 + 0.4 * Math.sin((f - mirror) / 3) : 0;
	return (
		<AbsoluteFill style={{background: '#20160e'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* day */}
				<rect x={0} y={0} width={956} height={1080} fill="#f6e6c4" />
				<rect x={0} y={0} width={956} height={620} fill="#9cc8ea" />
				<circle cx={160} cy={160} r={56} fill="#fff6d8" />
				<rect x={0} y={620} width={956} height={460} fill="#e7b66e" />
				<g transform={`translate(${lerp(f, 0, len(n), 520, 760)},160) scale(0.5)`}>
					<path d="M -110,-10 C -110,-60 -40,-70 20,-60 L 90,-40 L 200,-36 L 210,-60 L 230,-60 L 230,0 L 90,-10 C 60,30 -110,30 -110,-10 Z" fill="#e8402e" stroke={INK} strokeWidth={6} />
					<line x1={-180 * Math.cos(f / 1.3)} y1={-82} x2={180 * Math.cos(f / 1.3)} y2={-82} stroke={INK} strokeWidth={8} strokeLinecap="round" />
				</g>
				<You x={360} y={1060} s={0.56} f={f} armR={arm([124, -470], [160, -600], {fist: true, item: <rect x={-30} y={-60} width={60} height={46} rx={7} fill="#cfe8ff" stroke={INK} strokeWidth={5} />})} face={{eyes: 'narrow', mouth: 'flat', brows: 'neutral', look: [0.7, -0.6]}} />
				{glint > 0 && (
					<g transform={`translate(${360 + 0.56 * 160},${1060 - 0.56 * 640})`} opacity={glint}>
						<path d="M 0,-60 L 10,-10 L 60,0 L 10,10 L 0,60 L -10,10 L -60,0 L -10,-10 Z" fill="#fffbe0" />
						<line x1={20} y1={-20} x2={300} y2={-380} stroke="#fffbe0" strokeWidth={6} opacity={0.6} />
					</g>
				)}
				{/* night */}
				<rect x={964} y={0} width={956} height={1080} fill="#0b1638" />
				{Array.from({length: 40}).map((_, i) => (
					<circle key={i} cx={980 + ((i * 97) % 920)} cy={20 + ((i * 53) % 560)} r={2} fill="#fff" opacity={0.7} />
				))}
				<rect x={964} y={620} width={956} height={460} fill="#20274a" />
				{f >= fire && (
					<g transform={`translate(1440,900) scale(${pop(f, fire, 11)})`}>
						<ellipse cx={0} cy={0} rx={380} ry={180} fill="#ff9a3a" opacity={0.15} />
						{[-50, 0, 50].map((x, i) => (
							<line key={i} x1={x - 40} y1={30} x2={x + 40} y2={-10} stroke="#6a4a2a" strokeWidth={18} strokeLinecap="round" />
						))}
						<path d={`M 0,${-160 - Math.sin(f / 3) * 14} C 70,-80 80,-20 40,10 C 30,-30 10,-40 0,-30 C -10,-40 -30,-30 -40,10 C -80,-20 -70,-80 0,${-160 - Math.sin(f / 3) * 14} Z`} fill="#ff7a2a" />
						<path d={`M 0,${-90 - Math.sin(f / 2.5) * 10} C 34,-50 40,-10 20,10 L -20,10 C -40,-10 -34,-50 0,${-90 - Math.sin(f / 2.5) * 10} Z`} fill="#ffd84a" />
					</g>
				)}
				<rect x={956} y={0} width={8} height={1080} fill="#fff" />
			</svg>
			<Plaque f={f} at={mirror + 2} x={480} y={190} text="ДНЁМ — ЗЕРКАЛЬЦЕМ" color={YEL} size={44} />
			<Plaque f={f} at={fire + 2} x={1440} y={190} text="НОЧЬЮ — ОГНЁМ" color="#ff8a3a" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 82. heatstroke signs: call 112, keep cooling =====
export const S82: React.FC = () => {
	const f = useCurrentFrame();
	const n = 82;
	const signs = [
		{at: w(n, 'кожа') - 6, t: 'КОЖА ГОРЯЧАЯ И СУХАЯ'},
		{at: w(n, 'бредит') - 6, t: 'БРЕДИТ'},
		{at: w(n, 'теряет') - 6, t: 'ТЕРЯЕТ СОЗНАНИЕ'},
	];
	const stroke = w(n, 'тепловой') - 6;
	const call = w(n, 'звони') - 6;
	const cool = w(n, 'охлаждай') - 6;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a1410 0%, #140806 80%)'}}>
			{signs.map((s, i) =>
				f < s.at ? null : (
					<div key={i} style={{position: 'absolute', left: 140, top: 300 + i * 120, transform: `scale(${pop(f, s.at, 12)})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 20, fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: '#fff', whiteSpace: 'nowrap'}}>
						<div style={{width: 60, height: 60, borderRadius: 14, background: RED, textAlign: 'center', lineHeight: '62px', fontSize: 44}}>!</div>
						{s.t}
					</div>
				),
			)}
			{f >= stroke && (
				<div style={{position: 'absolute', left: 520, top: 180, transform: `translate(-50%,-50%) scale(${pop(f, stroke, 10)})`, background: RED, color: '#fff', borderRadius: 18, padding: '8px 30px 12px', fontFamily: HEAVY, fontWeight: 900, fontSize: 64, whiteSpace: 'nowrap', border: '8px solid #fff'}}>ТЕПЛОВОЙ УДАР</div>
			)}
			{f >= call && (
				<svg width={560} height={760} viewBox="-280 -380 560 760" style={{position: 'absolute', left: 1180, top: 160, transform: `scale(${pop(f, call, 11)})`}}>
					<rect x={-180} y={-340} width={360} height={680} rx={48} fill="#16171b" />
					<rect x={-160} y={-310} width={320} height={620} rx={30} fill="#f4f8fb" />
					<text x={0} y={-120} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={140} fill={RED}>
						112
					</text>
					<circle cx={0} cy={140} r={80} fill={GREEN} />
					<path d="M -30,110 C -40,120 -36,150 -10,176 C 16,200 44,206 54,196 L 40,168 L 18,176 C 6,170 -10,154 -16,142 L -8,120 Z" fill="#fff" transform="translate(-10,-14)" />
				</svg>
			)}
			<Plaque f={f} at={cool} x={520} y={760} text="ОХЛАЖДАЙ, НЕ ОСТАНАВЛИВАЯСЬ" color="#7fc4ff" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 83. never pour water into someone unconscious =====
export const S83: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#fff4e2'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform="translate(720,640) rotate(-90)">
					<You x={0} y={0} s={0.66} f={f} face={{eyes: 'closed', mouth: 'open', brows: 'neutral'}} />
				</g>
				<g transform="translate(1180,320) rotate(-120)">
					<path d="M -60,-90 L 60,-90 L 50,90 L -50,90 Z" fill="#dff1ff" stroke={INK} strokeWidth={7} />
					<path d="M -56,-40 L 56,-40 L 50,86 L -50,86 Z" fill="#7fc4ff" />
				</g>
				<g transform={`translate(1000,480) scale(${pop(f, 2, 9)})`} stroke={RED} strokeWidth={30} strokeLinecap="round">
					<line x1={-220} y1={-220} x2={220} y2={220} />
					<line x1={220} y1={-220} x2={-220} y2={220} />
				</g>
			</svg>
			<Plaque f={f} at={2} x={960} y={160} text="НЕ ВЛИВАЙ ВОДУ БЕЗ СОЗНАНИЯ" color={RED} size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 84. thirst is not evil — it is a signal that comes late =====
export const S84: React.FC = () => {
	const f = useCurrentFrame();
	const n = 84;
	const sig = w(n, 'сигнал') - 6;
	const late = w(n, 'опозданием') - 10;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.06, cx: 960, cy: 520});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f3b384">
				<Sky id="j84" p={DAWN} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={960} y={600} r={90} color="#ffd8b0" />
				</Layer>
				<Dunes p={DAWN} cam={cam} />
				{f >= sig && (
					<g transform={`translate(960,380) scale(${pop(f, sig, 11)})`}>
						<path d="M 0,-150 C 80,-50 110,10 110,60 A 110,100 0 0 1 -110,60 C -110,10 -80,-50 0,-150 Z" fill="#5fb0f0" stroke="#fff" strokeWidth={10} />
						{[0, 1, 2].map((i) => {
							const t = ((f + i * 10) % 30) / 30;
							return <circle key={i} cx={0} cy={10} r={120 + t * 120} fill="none" stroke="#fff" strokeWidth={6} opacity={(1 - t) * 0.8} />;
						})}
						<text x={0} y={60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={90} fill="#fff">
							!
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={sig + 4} x={960} y={160} text="ЖАЖДА — ЭТО СИГНАЛ" color="#7fc4ff" size={52} to={late - 4} />
			<Plaque f={f} at={late + 2} x={960} y={160} text="ОН ПРИХОДИТ С ОПОЗДАНИЕМ" color={YEL} size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 85. the desert just waits =====
export const S85: React.FC = () => {
	const f = useCurrentFrame();
	const n = 85;
	const cam = camAt(f, 0, len(n), {s: 1.12, cx: 900, cy: 600}, {s: 1, cx: 960, cy: 540});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f7b062">
				<Sky id="j85" p={SUNSET} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1300} y={590} r={84} color="#ffc890" />
				</Layer>
				<Dunes p={SUNSET} cam={cam} />
				<Layer cam={cam}>
					<g transform="translate(470,820) rotate(-80)">
						<Flask level={0} s={1.6} id="j85f" />
					</g>
				</Layer>
			</Stage16>
			<Plaque f={f} at={w(n, 'ждёт') - 4} x={960} y={190} text="ПУСТЫНЯ ПРОСТО ЖДЁТ" color="#f7b062" size={52} />
			<HeatGrade k={0.3} vig={0.55} />
		</AbsoluteFill>
	);
};
