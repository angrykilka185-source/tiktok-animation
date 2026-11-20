// «Что будет, если ты попадёшь в XX век» — 1971…2026: the «ГАСТРОНОМ» and its queue, the payphone, two reel-to-reel
// recorders, the living room with a carpet on the wall and the TV; 1981 (the stadium and the bear balloon, the chewed
// cassette and the pencil, the yard games); 1991 (the flag coming down in December, the first mobile network, the kiosk);
// 2001 (fireworks); home (the bed, the charging phone, the gallery).
import React from 'react';
import {Facade} from '../r1/world3d';
import {Glow, rnd} from './kit';
import {Sky} from './old';

const SANSB = "'DejaVu Sans', sans-serif";

// ================================================================== 1971 =====
// pyramids of tins in a shop window
const TinPyramid: React.FC<{x: number; y: number; n?: number; c?: string}> = ({x, y, n = 5, c = '#c9a54a'}) => (
	<g>
		{Array.from({length: n}).map((_, r) =>
			Array.from({length: n - r}).map((__, k) => (
				<g key={`${r}-${k}`}>
					<rect x={x + k * 44 + r * 22 - (n * 44) / 2} y={y - (r + 1) * 40} width={40} height={38} rx={4} fill={c} />
					<rect x={x + k * 44 + r * 22 - (n * 44) / 2} y={y - (r + 1) * 40 + 12} width={40} height={12} fill="#c8282a" />
				</g>
			)),
		)}
	</g>
);
export const Gastronom: React.FC<{dusk?: number}> = ({dusk = 0}) => (
	<g>
		<Sky top={dusk > 0.5 ? '#2a3058' : '#9fbad2'} bottom={dusk > 0.5 ? '#d88a5a' : '#eef0ea'} />
		<g transform="translate(-560,160)">
			<Facade w={2300} h={1080} color="#d8cdb8" cols={14} seed={9} lit={dusk} />
		</g>
		<rect x={-560} y={880} width={2300} height={360} fill="#9a8e7a" />
		<rect x={-100} y={760} width={1280} height={130} fill="#2a2c30" />
		{'ГАСТРОНОМ'.split('').map((ch, k) => (
			<text key={k} x={540 + (k - 4) * 118} y={858} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={96} fill="#e8302a">
				{ch}
			</text>
		))}
		{dusk > 0 && <rect x={-100} y={760} width={1280} height={130} fill="#ff4a3a" opacity={0.15 * dusk} />}
		{[-460, 120, 700].map((wx) => (
			<g key={wx}>
				<rect x={wx} y={920} width={460} height={300} fill="#3a4a58" />
				<rect x={wx + 10} y={930} width={440} height={280} fill={dusk > 0 ? '#e8c47a' : '#a8c0cc'} opacity={0.9} />
				<TinPyramid x={wx + 230} y={1200} n={5} c={wx === 120 ? '#8a9aa8' : '#c9a54a'} />
			</g>
		))}
		<rect x={1180} y={940} width={180} height={300} fill="#5a3a22" />
		<rect x={-600} y={1240} width={2300} height={80} fill="#a59c8e" />
		<rect x={-600} y={1320} width={2300} height={1300} fill="#6e6a62" />
		{dusk > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#141a3a" opacity={0.35 * dusk} />}
	</g>
);
// jeans (a folded pair, hand-local or flat)
export const Jeans: React.FC<{x?: number; y?: number; s?: number}> = ({x = 0, y = 0, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -60,0 L 60,0 L 70,240 L 18,240 L 0,70 L -18,240 L -70,240 Z" fill="#3a5a8a" />
		<rect x={-60} y={0} width={120} height={20} fill="#2a4a7a" />
		<path d="M -50,40 Q -30,60 -10,40 M 50,40 Q 30,60 10,40" stroke="#d8a03a" strokeWidth={3} fill="none" />
		<circle cx={0} cy={10} r={5} fill="#c9a54a" />
	</g>
);
// the payphone on the corner (a booth), and its close-up coin slot
export const Payphone: React.FC = () => (
	<g>
		<rect x={0} y={0} width={360} height={900} rx={14} fill="#b8b8b0" />
		<rect x={20} y={110} width={320} height={760} fill="#cfe0e8" opacity={0.6} />
		<rect x={0} y={0} width={360} height={100} rx={14} fill="#c8282a" />
		<text x={180} y={70} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={46} fill="#fff">
			ТАКСОФОН
		</text>
		<rect x={120} y={260} width={150} height={240} rx={10} fill="#5a5f66" />
		<circle cx={195} cy={430} r={46} fill="#2a2c30" />
		<circle cx={195} cy={430} r={20} fill="#8a8f96" />
		<rect x={90} y={250} width={34} height={150} rx={14} fill="#1a1c20" />
		<rect x={160} y={290} width={70} height={10} rx={5} fill="#1a1c20" />
	</g>
);
export const CoinSlot: React.FC<{coin: number}> = ({coin}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#6a6f76" />
		<rect x={140} y={400} width={800} height={1100} rx={40} fill="#8a8f96" />
		<rect x={170} y={430} width={740} height={1040} rx={30} fill="#9aa0a8" />
		<rect x={440} y={560} width={200} height={34} rx={17} fill="#1a1c20" />
		<text x={540} y={680} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={72} fill="#2a2c30">
			2 коп.
		</text>
		<circle cx={540} cy={1060} r={260} fill="#5a5f66" />
		{Array.from({length: 10}).map((_, k) => {
			const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
			return <circle key={k} cx={540 + Math.cos(a) * 190} cy={1060 + Math.sin(a) * 190} r={44} fill="#2a2c30" />;
		})}
		<circle cx={540} cy={1060} r={100} fill="#8a8f96" />
		<g transform={`translate(540,${lerpN(coin, 360, 560)})`}>
			<g transform={`scale(1,${coin < 0.8 ? 1 : 1 - (coin - 0.8) * 4})`}>
				<circle r={110} fill="#c9a26a" stroke="#8a6a3a" strokeWidth={10} />
				<text y={30} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={110} fill="#8a6a3a">
					2
				</text>
			</g>
		</g>
	</g>
);
const lerpN = (t: number, a: number, b: number) => a + (b - a) * Math.max(0, Math.min(1, t));

// two reel-to-reel tape recorders joined by a cable
export const Reel: React.FC<{x: number; y: number; f: number; s?: number; c?: string}> = ({x, y, f, s = 1, c = '#d8d4c8'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-260} y={-160} width={520} height={260} rx={18} fill={c} />
		<rect x={-240} y={-140} width={480} height={150} rx={10} fill="#2a2c30" />
		{[-120, 120].map((rx, j) => (
			<g key={rx} transform={`translate(${rx},-150) rotate(${f * (j ? 5 : 5)})`}>
				<circle r={110} fill="#3a3c40" />
				<circle r={100} fill="#6a5a4a" opacity={0.9} />
				<circle r={30} fill="#c9c4b8" />
				{[0, 1, 2].map((q) => (
					<circle key={q} cx={Math.cos((q * 2 * Math.PI) / 3) * 62} cy={Math.sin((q * 2 * Math.PI) / 3) * 62} r={22} fill="#2a2c30" />
				))}
			</g>
		))}
		<path d="M -120,-60 L 0,-20 L 120,-60" stroke="#6a5a4a" strokeWidth={6} fill="none" />
		<rect x={-200} y={30} width={170} height={50} rx={6} fill="#f4f0e8" />
		<path d={`M -190,72 L ${-190 + 60 + Math.sin(f / 3) * 40},44`} stroke="#c8282a" strokeWidth={4} />
		{Array.from({length: 5}).map((_, k) => (
			<rect key={k} x={10 + k * 46} y={36} width={38} height={40} rx={5} fill="#3a3c40" />
		))}
	</g>
);
// a living room of the 70s: a carpet on the wall, the sofa, the TV on legs (channel knob)
export const LivingRoom70: React.FC<{f: number; channel?: number; tvGlow?: number}> = ({f, channel = 1, tvGlow = 1}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#c9b890" />
		{Array.from({length: 24}).map((_, k) => (
			<rect key={k} x={-600 + k * 100} y={-600} width={30} height={2000} fill="#b8a77e" opacity={0.6} />
		))}
		{/* the carpet */}
		<g transform="translate(-200,160) scale(0.92)">
			<rect x={0} y={0} width={980} height={700} fill="#8a1e22" />
			<rect x={30} y={30} width={920} height={640} fill="none" stroke="#e0b06a" strokeWidth={14} />
			<rect x={70} y={70} width={840} height={560} fill="#6a1418" />
			{Array.from({length: 4}).map((_, r) =>
				Array.from({length: 6}).map((__, c) => (
					<path key={`${r}-${c}`} d={`M ${140 + c * 140},${130 + r * 140} l 50,-50 l 50,50 l -50,50 Z`} fill={(r + c) % 2 ? '#e0b06a' : '#2a4a6a'} />
				)),
			)}
			<circle cx={490} cy={350} r={120} fill="none" stroke="#e0b06a" strokeWidth={12} />
		</g>
		<rect x={-600} y={1200} width={2300} height={1500} fill="#7a5232" />
		{/* sofa */}
		<rect x={-160} y={900} width={900} height={140} rx={30} fill="#3a6a5a" />
		<rect x={-160} y={1030} width={900} height={180} rx={20} fill="#2e5a4a" />
		{/* the TV on legs */}
		<g transform="translate(860,1200)">
			<rect x={-200} y={-440} width={400} height={330} rx={24} fill="#5a3a22" />
			<rect x={-176} y={-414} width={270} height={250} rx={40} fill="#2a2e30" />
			<rect x={-160} y={-400} width={238} height={222} rx={34} fill={channel === 1 ? '#9ab8c8' : '#b8c89a'} opacity={tvGlow} />
			{channel === 1 ? <circle cx={-40} cy={-290} r={46} fill="#5a7a8a" opacity={tvGlow} /> : <rect x={-110} y={-330} width={140} height={90} fill="#7a8a5a" opacity={tvGlow} />}
			<circle cx={140} cy={-360} r={30} fill="#2a1a12" />
			<line x1={140} y1={-360} x2={140 + Math.cos(channel === 1 ? -2 : -0.6) * 26} y2={-360 + Math.sin(channel === 1 ? -2 : -0.6) * 26} stroke="#c9a54a" strokeWidth={6} />
			<text x={140} y={-300} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={26} fill="#c9a54a">
				{channel}
			</text>
			<circle cx={140} cy={-230} r={20} fill="#2a1a12" />
			<path d="M -170,-110 L -200,0 M 170,-110 L 200,0 M -60,-110 L -70,0 M 60,-110 L 70,0" stroke="#3a2a1e" strokeWidth={12} />
			<path d="M -40,-440 L -110,-600 M 40,-440 L 110,-600" stroke="#2a2c30" strokeWidth={6} />
			{tvGlow > 0 && <Glow id="w1tv70" x={-40} y={-290} r={600} color="#bfe3f2" o={0.3 * tvGlow} />}
		</g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#141a3a" opacity={0.25} />
	</g>
);

// ================================================================== 1981 =====
// the stadium at dusk, floodlights; the sky
export const Stadium: React.FC = () => (
	<g>
		<Sky top="#2a2a5a" bottom="#e8906a" />
		<path d="M -600,900 Q 540,700 1700,900 L 1700,1400 L -600,1400 Z" fill="#3a3a48" />
		{Array.from({length: 9}).map((_, r) => (
			<path key={r} d={`M -600,${930 + r * 40} Q 540,${730 + r * 40} 1700,${930 + r * 40}`} stroke={r % 2 ? '#4a4a5a' : '#2e2e3a'} strokeWidth={22} fill="none" />
		))}
		{Array.from({length: 120}).map((_, k) => (
			<circle key={k} cx={-560 + rnd(k) * 2220} cy={940 + rnd(k * 3) * 360 - Math.abs(rnd(k) - 0.5) * 300} r={7} fill={['#e0b06a', '#fff', '#c8282a', '#4a8ac8'][k % 4]} opacity={0.7} />
		))}
		{[-300, 1380].map((lx) => (
			<g key={lx}>
				<rect x={lx - 10} y={300} width={20} height={700} fill="#2a2c30" />
				<rect x={lx - 90} y={240} width={180} height={90} fill="#2a2c30" />
				{Array.from({length: 8}).map((_, k) => (
					<circle key={k} cx={lx - 70 + (k % 4) * 46} cy={264 + Math.floor(k / 4) * 40} r={14} fill="#fffbe8" />
				))}
				<Glow id={`w1st${lx}`} x={lx} y={290} r={360} color="#fff6d8" o={0.5} />
			</g>
		))}
		<rect x={-600} y={1380} width={2300} height={1300} fill="#3a7a3a" />
	</g>
);
// a big friendly bear-shaped balloon holding a bunch of balloons (generic, no emblems)
export const BearBalloon: React.FC<{sway: number}> = ({sway}) => (
	<g transform={`rotate(${sway})`}>
		{[-90, -30, 30, 90, 0].map((bx, k) => (
			<g key={k}>
				<line x1={bx * 0.3} y1={-330} x2={bx} y2={-560 - (k === 4 ? 60 : 0)} stroke="#f4f0e8" strokeWidth={3} />
				<ellipse cx={bx} cy={-600 - (k === 4 ? 60 : 0)} rx={46} ry={56} fill={['#c8282a', '#4a8ac8', '#e0b03a', '#3aa86a', '#e07a3a'][k]} />
			</g>
		))}
		<ellipse cx={0} cy={0} rx={150} ry={170} fill="#8a5a34" />
		<ellipse cx={0} cy={30} rx={90} ry={110} fill="#c9925a" />
		<circle cx={0} cy={-210} r={120} fill="#8a5a34" />
		<circle cx={-95} cy={-300} r={40} fill="#8a5a34" />
		<circle cx={95} cy={-300} r={40} fill="#8a5a34" />
		<circle cx={-95} cy={-300} r={20} fill="#c9925a" />
		<circle cx={95} cy={-300} r={20} fill="#c9925a" />
		<ellipse cx={0} cy={-170} rx={56} ry={42} fill="#c9925a" />
		<ellipse cx={0} cy={-190} rx={20} ry={14} fill="#2a1a12" />
		<path d="M -26,-160 Q 0,-138 26,-160" stroke="#2a1a12" strokeWidth={6} fill="none" />
		<circle cx={-44} cy={-236} r={13} fill="#2a1a12" />
		<circle cx={44} cy={-236} r={13} fill="#2a1a12" />
		<ellipse cx={-150} cy={-40} rx={40} ry={90} fill="#8a5a34" transform="rotate(-40 -150 -40)" />
		<ellipse cx={150} cy={-60} rx={40} ry={90} fill="#8a5a34" transform="rotate(30 150 -60)" />
		<ellipse cx={-70} cy={160} rx={50} ry={40} fill="#8a5a34" />
		<ellipse cx={70} cy={160} rx={50} ry={40} fill="#8a5a34" />
	</g>
);
// the cassette (close-up art centred at 540, 900): the tape chewed out in loops (`chew` 0…1), the pencil in a hub (`turn`)
export const Cassette: React.FC<{chew: number; pencil: number; turn: number}> = ({chew, pencil, turn}) => (
	<g>
		<rect x={140} y={620} width={800} height={520} rx={30} fill="#2a2c30" />
		<rect x={180} y={660} width={720} height={200} rx={10} fill="#e8dcc0" />
		<rect x={180} y={660} width={720} height={60} fill="#c8282a" />
		<text x={540} y={810} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={54} fill="#2a2c30">
			C-90
		</text>
		<rect x={300} y={880} width={480} height={150} rx={20} fill="#1a1c20" />
		{[390, 690].map((hx, j) => (
			<g key={hx} transform={`translate(${hx},955) rotate(${j ? turn : turn * 0.8})`}>
				<circle r={60} fill="#f4f0e8" />
				{Array.from({length: 6}).map((_, k) => (
					<rect key={k} x={-8} y={-60} width={16} height={22} fill="#1a1c20" transform={`rotate(${k * 60})`} />
				))}
				<circle r={22} fill="#1a1c20" />
			</g>
		))}
		<path d="M 250,1140 L 300,1060 L 780,1060 L 830,1140 Z" fill="#3a3c40" />
		{chew > 0 && (
			<path
				d={`M 420,1140 C 380,${1140 + 300 * chew} 600,${1180 + 360 * chew} 520,${1140 + 520 * chew} C 440,${1140 + 640 * chew} 760,${1200 + 600 * chew} 700,${1160 + 300 * chew} C 660,${1140 + 160 * chew} 640,1160 650,1140`}
				stroke="#5a3a1e"
				strokeWidth={14}
				fill="none"
			/>
		)}
		{pencil > 0 && (
			<g transform={`translate(390,955) rotate(${-50 + turn * 0.4}) translate(0,${-560 * pencil + 560})`}>
				<path d="M -26,-640 L 26,-640 L 26,-40 L 0,0 L -26,-40 Z" fill="#e0b03a" />
				<path d="M -26,-40 L 26,-40 L 0,0 Z" fill="#e8c890" />
				<path d="M -8,-12 L 8,-12 L 0,0 Z" fill="#2a2c30" />
				<rect x={-26} y={-700} width={52} height={60} fill="#e8a0a0" />
				<rect x={-26} y={-650} width={52} height={14} fill="#c9c4b8" />
				<line x1={-9} y1={-640} x2={-9} y2={-40} stroke="#c8902a" strokeWidth={4} />
			</g>
		)}
	</g>
);
// a yard of the 80s: two blocks of flats, trees, garages; hopscotch and chalk arrows on the asphalt; `dusk` 0…1
export const Yard80: React.FC<{dusk?: number; f?: number}> = ({dusk = 0, f = 0}) => (
	<g>
		<Sky top={dusk > 0.5 ? '#1e2450' : '#9fbad2'} bottom={dusk > 0.5 ? '#d8805a' : '#eef0ea'} />
		<g transform="translate(-560,260)">
			<Facade w={1100} h={980} color="#d6cdb8" cols={7} seed={3} lit={dusk} />
		</g>
		<g transform="translate(620,200)">
			<Facade w={1100} h={1040} color="#c9c2b0" cols={7} seed={6} lit={dusk} />
		</g>
		{[-300, 520, 1280].map((tx, k) => (
			<g key={tx} transform={`translate(${tx},1240) rotate(${Math.sin(f / 50 + k) * 0.6})`}>
				<rect x={-24} y={-520} width={48} height={520} fill="#5a3a22" />
				<circle cx={0} cy={-560} r={190} fill={['#4a7a3a', '#5a8a42', '#3a6a2e'][k]} />
				<circle cx={-120} cy={-460} r={120} fill={['#3a6a2e', '#4a7a3a', '#5a8a42'][k]} />
			</g>
		))}
		<rect x={-600} y={1240} width={2300} height={1400} fill="#7e7970" />
		{/* hopscotch */}
		<g transform="translate(560,1560) skewX(-20)" stroke="#f4f0e8" strokeWidth={6} fill="none">
			{[0, 1, 2, 3, 4].map((k) => (
				<rect key={k} x={-60} y={-k * 70} width={120} height={70} />
			))}
			<rect x={-120} y={-420} width={120} height={70} />
			<rect x={0} y={-420} width={120} height={70} />
		</g>
		{[1, 2, 3, 4, 5].map((n, k) => (
			<text key={n} x={560 - k * 25 + 0} y={1610 - k * 70} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={40} fill="#f4f0e8">
				{n}
			</text>
		))}
		{/* chalk arrows (казаки-разбойники) */}
		{[[-200, 1900, 0], [100, 1780, -20], [1200, 1720, 160]].map(([ax, ay, r], k) => (
			<g key={k} transform={`translate(${ax},${ay}) rotate(${r})`} stroke="#f4f0e8" strokeWidth={8} fill="none" strokeLinecap="round">
				<path d="M -90,0 L 90,0 M 50,-36 L 90,0 L 50,36" />
			</g>
		))}
		{dusk > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#141a3a" opacity={0.4 * dusk} />}
	</g>
);

// ================================================================== 1991 =====
// a winter dusk, a dome with a flagpole; `down` 0…1 lowers the red flag, `up` 0…1 raises the tricolour
export const FlagTower: React.FC<{down: number; up: number; f: number}> = ({down, up, f}) => {
	const wave = (k: number) => Math.sin(f / 7 + k) * 10;
	const red = 0 + down * 520;
	const tri = 520 - up * 520;
	return (
		<g>
			<Sky top="#141a3a" bottom="#5a6a9a" />
			{Array.from({length: 60}).map((_, k) => {
				const t = ((f / 160 + rnd(k)) % 1);
				return <circle key={k} cx={-500 + rnd(k * 7) * 2100 + Math.sin(f / 30 + k) * 30} cy={-500 + t * 2600} r={4 + rnd(k * 3) * 6} fill="#fff" opacity={0.7} />;
			})}
			<path d="M 140,1240 L 140,860 Q 540,500 940,860 L 940,1240 Z" fill="#7a8a7a" />
			<path d="M 140,860 Q 540,500 940,860" stroke="#5a6a5a" strokeWidth={16} fill="none" />
			<rect x={-560} y={980} width={2300} height={300} fill="#c9b8a0" />
			{Array.from({length: 20}).map((_, k) => (
				<rect key={k} x={-540 + k * 120} y={1030} width={60} height={110} fill={rnd(k) > 0.5 ? '#ffd27a' : '#3a4060'} />
			))}
			<rect x={530} y={-20} width={20} height={720} fill="#c9c4b8" />
			<g transform={`translate(550,${40 + red})`}>
				<path d={`M 0,0 C 90,${wave(0)} 200,${wave(1)} 300,${wave(2)} L 300,${180 + wave(2)} C 200,${180 + wave(1)} 90,${180 + wave(0)} 0,180 Z`} fill="#c8282a" />
			</g>
			{up > 0 && (
				<g transform={`translate(550,${40 + tri})`}>
					<path d={`M 0,0 C 90,${wave(0)} 200,${wave(1)} 300,${wave(2)} L 300,${60 + wave(2)} C 200,${60 + wave(1)} 90,${60 + wave(0)} 0,60 Z`} fill="#f4f4f4" />
					<path d={`M 0,60 C 90,${60 + wave(0)} 200,${60 + wave(1)} 300,${60 + wave(2)} L 300,${120 + wave(2)} C 200,${120 + wave(1)} 90,${120 + wave(0)} 0,120 Z`} fill="#2a5aa8" />
					<path d={`M 0,120 C 90,${120 + wave(0)} 200,${120 + wave(1)} 300,${120 + wave(2)} L 300,${180 + wave(2)} C 200,${180 + wave(1)} 90,${180 + wave(0)} 0,180 Z`} fill="#c8282a" />
				</g>
			)}
			<rect x={-600} y={1240} width={2300} height={1400} fill="#e8eef4" />
			<rect x={-600} y={1240} width={2300} height={40} fill="#c9d4e0" />
		</g>
	);
};
// a calendar page of 1991 (the month flies off)
export const MonthPage: React.FC<{month: string}> = ({month}) => (
	<g>
		<rect x={-220} y={-260} width={440} height={520} fill="#f4f0e8" stroke="#8a8f96" strokeWidth={6} />
		<rect x={-220} y={-260} width={440} height={90} fill="#c8282a" />
		<text x={0} y={-198} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={52} fill="#fff">
			1991
		</text>
		<text x={0} y={30} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={70} fill="#2a2c30">
			{month}
		</text>
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 7}).map((__, c) => <rect key={`${r}-${c}`} x={-190 + c * 54} y={80 + r * 40} width={40} height={26} fill="#d8d4c8" />),
		)}
	</g>
);
// St Petersburg: the canal, the granite embankment, cast-iron railings, old houses across the water
export const Embankment: React.FC<{f: number}> = ({f}) => (
	<g>
		<Sky top="#8aa0b8" bottom="#e8e4dc" />
		{[[-560, '#d8b878', 4], [-40, '#b8c8b0', 5], [520, '#e0c0a0', 4], [1060, '#c8b8d0', 5]].map(([hx, c, n], k) => (
			<g key={k}>
				<rect x={hx as number} y={300} width={540} height={720} fill={c as string} />
				<rect x={(hx as number) - 10} y={280} width={560} height={36} fill="#f4ecd8" />
				{Array.from({length: 3}).map((_, r) =>
					Array.from({length: n as number}).map((__, cc) => (
						<rect key={`${r}-${cc}`} x={(hx as number) + 30 + cc * (500 / (n as number))} y={380 + r * 200} width={500 / (n as number) - 40} height={120} fill="#8ea4b6" />
					)),
				)}
			</g>
		))}
		<rect x={-600} y={1020} width={2300} height={60} fill="#9a8e84" />
		<rect x={-600} y={1080} width={2300} height={260} fill="#5a7a8a" />
		{Array.from({length: 18}).map((_, k) => (
			<path key={k} d={`M ${-600 + ((k * 137 + f * 2) % 2300)},${1120 + (k % 5) * 44} q 30,-8 60,0`} stroke="#8ab0c0" strokeWidth={4} fill="none" />
		))}
		<rect x={-600} y={1340} width={2300} height={70} fill="#8a8078" />
		<rect x={-600} y={1240} width={2300} height={10} fill="#1a1c20" />
		{Array.from({length: 40}).map((_, k) => (
			<g key={k}>
				<rect x={-600 + k * 60} y={1240} width={6} height={100} fill="#1a1c20" />
				<circle cx={-570 + k * 60} cy={1290} r={18} fill="none" stroke="#1a1c20" strokeWidth={5} />
			</g>
		))}
		<rect x={-600} y={1410} width={2300} height={1300} fill="#9a948c" />
	</g>
);
// the brick phone of 1991 (hand-local)
export const BrickPhone: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s}) translate(-4,-80)`}>
		<rect x={-30} y={-90} width={60} height={190} rx={10} fill="#2a2c30" />
		<rect x={-20} y={-74} width={40} height={30} fill="#9ab88a" />
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 3}).map((__, c) => <rect key={`${r}-${c}`} x={-20 + c * 15} y={-30 + r * 22} width={10} height={14} rx={2} fill="#8a8f96" />),
		)}
		<rect x={14} y={-190} width={8} height={110} rx={4} fill="#1a1c20" />
	</g>
);
// the street kiosk: gum, video cassettes with action films, bottles
const VHS: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={0} y={0} width={86} height={150} fill="#1a1c20" />
		<rect x={6} y={6} width={74} height={110} fill={['#c8402a', '#2a4a8a', '#d89a2a', '#3a3a3a'][k % 4]} />
		{k % 2 ? <circle cx={43} cy={60} r={28} fill="#ffb347" /> : <path d="M 20,100 L 43,30 L 66,100 Z" fill="#1a1c20" opacity={0.6} />}
		<rect x={10} y={124} width={66} height={16} fill="#f4f0e8" />
	</g>
);
const Gum: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
	<g transform={`translate(${x},${y}) rotate(${(k % 3) * 4 - 4})`}>
		<rect x={0} y={0} width={90} height={40} rx={6} fill={['#e83a6a', '#3aa8e8', '#f4c02a', '#6ac84a'][k % 4]} />
		<rect x={10} y={12} width={70} height={16} rx={3} fill="#fff" opacity={0.8} />
	</g>
);
export const Kiosk: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#8a8a96" />
		<rect x={-600} y={1240} width={2300} height={1400} fill="#6e6a62" />
		<rect x={0} y={200} width={1080} height={1040} fill="#3a4a6a" />
		<rect x={-20} y={160} width={1120} height={60} fill="#2a3a5a" />
		<rect x={40} y={260} width={1000} height={720} fill="#cfe0e8" opacity={0.85} />
		<rect x={40} y={600} width={1000} height={12} fill="#3a4a6a" />
		{Array.from({length: 10}).map((_, k) => (
			<VHS key={k} x={70 + k * 96} y={300} k={k} />
		))}
		{Array.from({length: 10}).map((_, k) => (
			<Gum key={k} x={70 + k * 96} y={540} k={k} />
		))}
		{Array.from({length: 8}).map((_, k) => (
			<g key={k} transform={`translate(${110 + k * 120},850)`}>
				<rect x={-20} y={-200} width={40} height={200} rx={10} fill={['#c86a2a', '#3a8a5a', '#d8c02a', '#8a3a8a'][k % 4]} opacity={0.85} />
				<rect x={-10} y={-240} width={20} height={44} fill="#2a2c30" />
			</g>
		))}
		<rect x={420} y={980} width={240} height={90} fill="#1a1c20" />
		<rect x={440} y={1000} width={200} height={50} fill="#3a3c40" />
		<rect x={30} y={980} width={1020} height={40} fill="#2a3a5a" />
		<text x={540} y={140} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={76} fill="#ffd34a">
			КИОСК · ВИДЕО
		</text>
	</g>
);
// a gum insert (вкладыш) with a little car
export const Insert: React.FC<{x: number; y: number; rot: number; k: number}> = ({x, y, rot, k}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-110} y={-70} width={220} height={140} rx={8} fill="#fff" stroke="#c9c4b8" strokeWidth={4} />
		<rect x={-96} y={-56} width={192} height={96} fill={['#ffd34a', '#8fd0ff', '#ff9a8a'][k % 3]} />
		<path d="M -70,20 L -50,-6 L 40,-10 L 70,20 Z" fill={['#c8282a', '#2a5aa8', '#2a8a4a'][k % 3]} />
		<circle cx={-40} cy={24} r={12} fill="#1a1c20" />
		<circle cx={40} cy={24} r={12} fill="#1a1c20" />
		<text x={0} y={60} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={20} fill="#2a2c30">
			{['№ 17', '№ 42', '№ 8'][k % 3]}
		</text>
	</g>
);

// ================================================================== 2001 =====
// a night city and fireworks; `f` = the frame
export const Fireworks: React.FC<{f: number; o?: number}> = ({f, o = 1}) => (
	<g opacity={o}>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#060a1c" />
		{Array.from({length: 10}).map((_, k) => {
			const life = 44;
			const t = f - k * 9;
			if (t < 0) return null;
			const n = Math.floor(t / life);
			const tt = (t % life) / life;
			const cx = -40 + rnd(k * 5 + n * 31) * 1160;
			const cy = 120 + rnd(k * 7 + n * 17) * 760;
			const col = ['#ffd34a', '#ff5a4a', '#7fd0ff', '#b98aff', '#7aff9a', '#ff9ad0', '#ffffff', '#ffb347', '#5affea', '#ff7aa8'][k];
			const R = 180 + rnd(k * 3 + n) * 200;
			return (
				<g key={k} opacity={(1 - tt) * (1 - tt * 0.3)}>
					<Glow id={`w1fw${k}`} x={cx} y={cy} r={R * 1.3} color={col} o={0.45 * (1 - tt)} />
					{Array.from({length: 26}).map((__, j) => {
						const a = (j / 26) * Math.PI * 2;
						const r = 30 + Math.sqrt(tt) * R;
						const x = cx + Math.cos(a) * r;
						const y = cy + Math.sin(a) * r + tt * tt * 120;
						return <line key={j} x1={x - Math.cos(a) * 26 * (1 - tt)} y1={y - Math.sin(a) * 26 * (1 - tt)} x2={x} y2={y} stroke={col} strokeWidth={8 - tt * 5} strokeLinecap="round" />;
					})}
				</g>
			);
		})}
		{Array.from({length: 14}).map((_, k) => (
			<rect key={k} x={-600 + k * 170} y={1240 - 200 - rnd(k) * 500} width={150} height={700 + rnd(k) * 500} fill="#0e1430" />
		))}
		{Array.from({length: 80}).map((_, k) => (
			<rect key={`w${k}`} x={-580 + rnd(k * 3) * 2300} y={760 + rnd(k * 5) * 480} width={16} height={22} fill="#ffd27a" opacity={0.6} />
		))}
		<rect x={-600} y={1240} width={2300} height={1400} fill="#0a0e22" />
	</g>
);

// ================================================================== home =====
// a modern pillow (top-down) and a grey duvet
export const ModernPillow: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#dfe4ea" />
		<rect x={150} y={360} width={780} height={520} rx={120} fill="#f4f6f8" />
		<path d="M 190,620 Q 540,560 890,620" stroke="#e4e8ec" strokeWidth={10} fill="none" />
	</g>
);
export const Duvet: React.FC = () => (
	<g>
		<path d="M -300,1180 Q 540,1080 1380,1180 L 1380,2400 L -300,2400 Z" fill="#8a96a8" />
		{Array.from({length: 8}).map((_, k) => (
			<path key={k} d={`M -300,${1260 + k * 140} Q 540,${1180 + k * 140} 1380,${1260 + k * 140}`} stroke="#7a8698" strokeWidth={8} fill="none" />
		))}
		<path d="M -300,1180 Q 540,1080 1380,1180" stroke="#f4f6f8" strokeWidth={22} fill="none" />
	</g>
);
// the bedside table with the phone on its charger; the room behind (morning)
export const Bedside: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#c9d4e0" />
		<rect x={500} y={160} width={520} height={640} fill="#f4f6f8" />
		<rect x={520} y={180} width={480} height={600} fill="#a8d0f0" />
		<rect x={754} y={180} width={12} height={600} fill="#f4f6f8" />
		<rect x={-600} y={1260} width={2300} height={1400} fill="#a8865e" />
		<rect x={-200} y={1000} width={760} height={50} fill="#e8e0d4" />
		<rect x={-180} y={1050} width={720} height={300} fill="#d8cfc0" />
		<rect x={-140} y={1110} width={640} height={8} fill="#c4b9a8" />
		<rect x={-200} y={900} width={760} height={100} rx={10} fill="#8a96a8" opacity={0} />
		{/* the phone on its charger */}
		<g transform="translate(180,995)">
			<rect x={-150} y={-24} width={300} height={24} rx={8} fill="#1a1c20" />
			<rect x={-136} y={-20} width={272} height={16} rx={6} fill="#2a3a5a" />
			<path d="M 150,-12 C 260,-12 300,40 300,140" stroke="#f4f6f8" strokeWidth={10} fill="none" />
			<Glow id="w1chg" x={0} y={-40} r={180} color="#7fd0ff" o={0.5 + 0.2 * Math.sin(f / 10)} />
			<path d="M -6,-50 L -22,-26 L -4,-26 L -14,-4 L 18,-34 L 0,-34 L 12,-50 Z" fill="#7aff9a" transform="translate(0,-14)" />
		</g>
		<Glow id="w1sun" x={760} y={480} r={600} color="#fff6d8" o={0.5} />
	</g>
);
