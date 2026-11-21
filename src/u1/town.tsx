// «Что будет, если ты попадёшь в СССР» — outside (16:9 art, picture coords 1920×1080 + margins): the yard of
// five-storey blocks with the roof slogan, Soviet cars (generic shapes), the school, the street with the soda
// machines, the kvass barrel, the ice-cream and newspaper kiosks, the bus, the cinema, the pioneer camp, the balcony at night.
import React from 'react';
import {Facade} from '../r1/world3d';
import {SchoolArt} from '../r1/sets3d';
import {Glow, rnd} from '../w1/kit';
import {starD} from '../w1/old';

const SANSB = "'DejaVu Sans', sans-serif";
export const GROUND = 760; // where the buildings meet the ground

const skyCol = (dusk: number, night: number) => (night > 0.5 ? ['#0a1030', '#1e2a58'] : dusk > 0.5 ? ['#2e3060', '#e8906a'] : ['#8fb4d8', '#eef0ea']);
export const SkyW: React.FC<{dusk?: number; night?: number}> = ({dusk = 0, night = 0}) => {
	const [a, b] = skyCol(dusk, night);
	return (
		<g>
			<defs>
				<linearGradient id={`skyw${dusk}${night}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={a} />
					<stop offset="100%" stopColor={b} />
				</linearGradient>
			</defs>
			<rect x={-800} y={-600} width={3600} height={1500} fill={`url(#skyw${dusk}${night})`} />
		</g>
	);
};
export const Tree: React.FC<{x: number; y: number; s?: number; k?: number; f?: number; lilac?: boolean}> = ({x, y, s = 1, k = 0, f = 0, lilac = false}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(f / 50 + k) * 0.8})`}>
		<rect x={-20} y={-420} width={40} height={420} fill="#5a3a22" />
		<circle cx={0} cy={-470} r={170} fill={['#4a7a3a', '#5a8a42', '#3a6a2e'][k % 3]} />
		<circle cx={-110} cy={-380} r={110} fill={['#3a6a2e', '#4a7a3a', '#5a8a42'][k % 3]} />
		<circle cx={110} cy={-400} r={120} fill={['#5a8a42', '#3a6a2e', '#4a7a3a'][k % 3]} />
		{lilac &&
			Array.from({length: 14}).map((_, j) => (
				<ellipse key={j} cx={-150 + rnd(j + k * 9) * 300} cy={-560 + rnd(j * 3 + k) * 260} rx={18} ry={26} fill={j % 2 ? '#b98ad8' : '#d8b4f0'} />
			))}
	</g>
);

// =============================================================== cars ========
// generic Soviet cars in profile, facing right; feet (the road) at (0,0)
export const Car81: React.FC<{kind?: 'sedan' | 'small' | 'hatch'; color?: string; wheel?: number}> = ({kind = 'sedan', color = '#c8402a', wheel = 0}) => {
	const W = (x: number) => (
		<g transform={`translate(${x},-46) rotate(${wheel})`}>
			<circle r={46} fill="#1a1c20" />
			<circle r={22} fill="#a8b0b8" />
			<rect x={-4} y={-22} width={8} height={44} fill="#6a7078" />
		</g>
	);
	if (kind === 'small') {
		return (
			<g>
				<path d="M -230,-60 Q -240,-150 -150,-170 Q -40,-260 90,-180 Q 200,-160 220,-60 Z" fill={color} />
				<path d="M -120,-170 Q -40,-230 70,-180 L 70,-130 L -120,-130 Z" fill="#bcd2de" />
				<rect x={-20} y={-180} width={10} height={50} fill={color} />
				<rect x={-240} y={-70} width={480} height={20} rx={8} fill="#8a8f96" />
				{W(-140)}
				{W(140)}
			</g>
		);
	}
	const hatch = kind === 'hatch';
	return (
		<g>
			<path d={`M -300,-60 L -300,-130 L -200,-140 L -140,-210 L ${hatch ? 120 : 80},-210 L ${hatch ? 180 : 150},-140 L 300,-130 L 300,-60 Z`} fill={color} />
			<path d={`M -125,-198 L ${hatch ? 105 : 70},-198 L ${hatch ? 155 : 135},-142 L -180,-142 Z`} fill="#bcd2de" />
			<rect x={-20} y={-200} width={12} height={60} fill={color} />
			<rect x={-310} y={-74} width={620} height={18} rx={6} fill="#c9ccd2" />
			<rect x={286} y={-122} width={20} height={26} rx={4} fill="#fff4c0" />
			<rect x={-306} y={-120} width={16} height={22} rx={3} fill="#c8282a" />
			<rect x={-60} y={-130} width={40} height={8} rx={3} fill="#c9ccd2" />
			{W(-190)}
			{W(190)}
		</g>
	);
};

// ================================================================ yard =======
// the yard: two five-storey blocks, the far one with «МИРУ — МИР!» on its roof, trees (lilac), benches, swings
export const Yard81: React.FC<{f?: number; dusk?: number; night?: number; slogan?: boolean}> = ({f = 0, dusk = 0, night = 0, slogan = true}) => {
	const lit = night > 0.5 ? 1 : dusk > 0.5 ? 0.7 : 0;
	return (
		<g>
			<SkyW dusk={dusk} night={night} />
			<g transform="translate(-700,40)">
				<Facade w={1500} h={720} color={night > 0.5 ? '#3a3c48' : '#d6cdb8'} lit={lit} seed={3} cols={10} />
			</g>
			<g transform="translate(860,-40)">
				<Facade w={1900} h={800} color={night > 0.5 ? '#34363f' : '#c9c2b0'} lit={lit} seed={6} cols={12} />
				{slogan && (
					<g>
						<path d="M 300,-10 L 300,-90 M 1600,-10 L 1600,-90" stroke="#3a3c40" strokeWidth={10} />
						<rect x={290} y={-100} width={1320} height={14} fill="#3a3c40" />
						{'МИРУ — МИР!'.split('').map((ch, k) => (
							<text key={k} x={380 + k * 124} y={-112} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={120} fill={night > 0.5 ? '#ff4a3a' : '#c8282a'}>
								{ch}
							</text>
						))}
					</g>
				)}
			</g>
			<rect x={-800} y={GROUND} width={3600} height={900} fill={night > 0.5 ? '#2a2c34' : '#7e7970'} />
			<rect x={-800} y={GROUND} width={3600} height={60} fill={night > 0.5 ? '#243020' : '#6a8a4a'} />
			{[-300, 420, 1480, 2200].map((tx, k) => (
				<Tree key={tx} x={tx} y={GROUND + 40} s={0.9} k={k} f={f} lilac={k % 2 === 1} />
			))}
			{/* swings and the horizontal bar */}
			<g transform="translate(1160,900)" stroke="#c8402a" strokeWidth={12} fill="none">
				<path d="M -140,0 L -100,-300 L 100,-300 L 140,0" />
				<path d={`M -40,-300 L ${-40 + Math.sin(f / 12) * 30},-90 M 40,-300 L ${40 + Math.sin(f / 12) * 30},-90`} strokeWidth={5} stroke="#3a3a3a" />
				<rect x={-60 + Math.sin(f / 12) * 30} y={-96} width={120} height={14} fill="#8a5a34" stroke="none" />
			</g>
			<rect x={-800} y={GROUND} width={3600} height={900} fill="#000" opacity={0.2 * night} />
			{(dusk > 0 || night > 0) && <rect x={-800} y={-600} width={3600} height={2600} fill="#141a3a" opacity={0.25 * dusk + 0.35 * night} />}
		</g>
	);
};
// a bench with two grannies in headscarves (they turn their heads by `look`)
export const Bench: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-260} y={-150} width={520} height={30} fill="#7a5a3a" />
		<rect x={-260} y={-230} width={520} height={26} fill="#7a5a3a" />
		<rect x={-240} y={-120} width={22} height={120} fill="#3a3a3a" />
		<rect x={218} y={-120} width={22} height={120} fill="#3a3a3a" />
	</g>
);

// ============================================================== school =======
export const School81: React.FC<{f?: number}> = () => (
	<g>
		<SkyW />
		<g transform="translate(-500,20)">
			<SchoolArt w={2900} h={760} />
		</g>
		{/* the entrance */}
		<g transform="translate(960,780)">
			<rect x={-260} y={-330} width={520} height={330} fill="#e8dcc0" />
			<rect x={-300} y={-370} width={600} height={50} fill="#c9bca2" />
			<rect x={-110} y={-260} width={220} height={260} fill="#6a4a2a" />
			<rect x={-100} y={-250} width={95} height={240} fill="#8aa0b0" />
			<rect x={5} y={-250} width={95} height={240} fill="#8aa0b0" />
			<rect x={-200} y={-440} width={400} height={64} rx={6} fill="#1f3a5a" />
			<text x={0} y={-396} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#fff">
				ШКОЛА № 7
			</text>
			{[0, 1, 2].map((k) => (
				<rect key={k} x={-300 - k * 30} y={k * 26} width={600 + k * 60} height={26} fill={k % 2 ? '#b8b0a0' : '#c9c2b2'} />
			))}
		</g>
		<rect x={-800} y={860} width={3600} height={800} fill="#8a8478" />
	</g>
);
// a red armband (on a sleeve) — drawn by the caller near the shoulder of a pupil
export const Armband: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <rect x={x - 30 * s} y={y} width={60 * s} height={26 * s} rx={4} fill="#d8282a" />;

// =============================================================== street ======
const Shop: React.FC<{x: number; w: number; sign: string; bg?: string; fg?: string; win?: string}> = ({x, w, sign, bg = '#1f3a5a', fg = '#fff', win = '#a8c0cc'}) => (
	<g>
		<rect x={x} y={GROUND - 300} width={w} height={300} fill="#9a8e7a" />
		<rect x={x + 20} y={GROUND - 290} width={w - 40} height={70} fill={bg} />
		<text x={x + w / 2} y={GROUND - 238} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={Math.min(52, (w - 60) / (sign.length * 0.68))} fill={fg} letterSpacing={3}>
			{sign}
		</text>
		<rect x={x + 30} y={GROUND - 200} width={w * 0.55} height={190} fill="#3a4a58" />
		<rect x={x + 38} y={GROUND - 192} width={w * 0.55 - 16} height={174} fill={win} />
		<rect x={x + w * 0.66} y={GROUND - 210} width={w * 0.26} height={210} fill="#5a3a22" />
	</g>
);
export const Street81: React.FC<{f?: number}> = ({f = 0}) => (
	<g>
		<SkyW />
		<g transform="translate(-700,-60)">
			<Facade w={1300} h={820} color="#d8cdb8" seed={9} cols={8} />
		</g>
		<rect x={600} y={-120} width={1000} height={880} fill="#e0d4bc" />
		<rect x={580} y={-150} width={1040} height={50} fill="#c9bca2" />
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 6}).map((__, c) => <rect key={`${r}-${c}`} x={640 + c * 160} y={-40 + r * 150} width={90} height={110} fill="#8ea4b6" />),
		)}
		<g transform="translate(1600,-20)">
			<Facade w={1300} h={780} color="#c9d0c8" seed={5} cols={8} />
		</g>
		<Shop x={-600} w={560} sign="ХЛЕБ" bg="#6a3a1e" />
		<Shop x={-20} w={620} sign="МОЛОКО" bg="#2a5a8a" />
		<Shop x={600} w={1000} sign="ГАСТРОНОМ" bg="#2a2c30" fg="#ff4a3a" />
		<Shop x={1600} w={760} sign="ОВОЩИ — ФРУКТЫ" bg="#3a6a2a" />
		<rect x={-800} y={GROUND} width={3600} height={70} fill="#a59c8e" />
		<rect x={-800} y={GROUND + 70} width={3600} height={900} fill="#6e6a62" />
		{Array.from({length: 20}).map((_, k) => (
			<rect key={k} x={-760 + k * 200} y={GROUND + 260} width={100} height={12} fill="#e8e4d8" opacity={0.6} />
		))}
		<path d="M -800,40 Q 960,80 2800,40 M -800,70 Q 960,110 2800,70" stroke="#2a2c30" strokeWidth={3} fill="none" />
	</g>
);
// the soda water machine (front); `glass` 0…1 = how full the glass is; `rinse` = the glass upside down being rinsed
export const SodaMachine: React.FC<{x: number; y: number; s?: number; glass?: number; rinse?: number; f?: number; label?: boolean}> = ({x, y, s = 1, glass = 0, rinse = 0, f = 0, label = true}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-170} y={-760} width={340} height={760} rx={24} fill="#c8282a" />
		<rect x={-150} y={-740} width={300} height={190} rx={12} fill="#f4f0e8" />
		{label && (
			<>
				<text x={0} y={-670} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#c8282a">
					ГАЗИРОВАННАЯ
				</text>
				<text x={0} y={-620} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={42} fill="#c8282a">
					ВОДА
				</text>
			</>
		)}
		<rect x={-150} y={-520} width={140} height={60} rx={8} fill="#f4f0e8" />
		<rect x={10} y={-520} width={140} height={60} rx={8} fill="#f4f0e8" />
		<text x={-80} y={-480} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={24} fill="#2a2c30">
			1 коп.
		</text>
		<text x={80} y={-480} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={24} fill="#2a2c30">
			3 коп.
		</text>
		<rect x={-100} y={-440} width={40} height={10} rx={5} fill="#1a1c20" />
		<rect x={60} y={-440} width={40} height={10} rx={5} fill="#1a1c20" />
		<rect x={-110} y={-380} width={220} height={250} rx={14} fill="#2a2c30" />
		<rect x={-12} y={-380} width={24} height={30} fill="#8a8f96" />
		{glass > 0 && <rect x={-4} y={-350} width={8} height={180} fill="#d8f0f8" opacity={0.6} />}
		{/* the glass */}
		<g transform={`translate(0,${-150 - rinse * 40}) rotate(${rinse * 180})`}>
			<path d="M -36,0 L -30,-110 L 30,-110 L 36,0 Z" fill="#dfeaf0" opacity={0.55} stroke="#9fb8c8" strokeWidth={4} />
			{glass > 0 && <path d={`M -35,0 L ${-30 - 5 * (1 - glass)},${-100 * glass} L ${30 + 5 * (1 - glass)},${-100 * glass} L 35,0 Z`} fill={glass > 0.5 ? '#f0d8a0' : '#d8f0f8'} opacity={0.85} />}
			{[-20, 0, 20].map((bx) => (
				<line key={bx} x1={bx} y1={-6} x2={bx} y2={-104} stroke="#9fb8c8" strokeWidth={2} opacity={0.6} />
			))}
		</g>
		{rinse > 0 &&
			Array.from({length: 6}).map((_, k) => (
				<line key={k} x1={-20 + k * 8} y1={-120} x2={-26 + k * 10} y2={-60 - ((f * 7 + k * 13) % 40)} stroke="#bfe3f2" strokeWidth={4} opacity={0.8 * rinse} />
			))}
		<rect x={-130} y={-120} width={260} height={30} rx={8} fill="#8a1e1e" />
	</g>
);
// the yellow kvass barrel on wheels, the saleswoman's stool, the tap
export const KvassBarrel: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<circle cx={-170} cy={-70} r={70} fill="#1a1c20" />
		<circle cx={170} cy={-70} r={70} fill="#1a1c20" />
		<circle cx={-170} cy={-70} r={30} fill="#a8b0b8" />
		<circle cx={170} cy={-70} r={30} fill="#a8b0b8" />
		<rect x={-360} y={-380} width={720} height={260} rx={130} fill="#e8b828" />
		<rect x={-360} y={-380} width={720} height={260} rx={130} fill="none" stroke="#c89818" strokeWidth={10} />
		<text x={0} y={-218} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={90} fill="#c8282a" letterSpacing={8}>
			КВАС
		</text>
		<rect x={-440} y={-160} width={100} height={20} fill="#3a3a3a" />
		<path d="M 330,-250 L 400,-250 L 400,-200" stroke="#a8b0b8" strokeWidth={14} fill="none" />
	</g>
);
// a kiosk: «МОРОЖЕНОЕ» (white) or «СОЮЗПЕЧАТЬ» (blue, newspapers and stamps)
export const Kiosk81: React.FC<{x: number; y: number; s?: number; kind: 'ice' | 'press'}> = ({x, y, s = 1, kind}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-300} y={-560} width={600} height={560} fill={kind === 'ice' ? '#f4f4f0' : '#3a5a8a'} />
		<path d="M -340,-560 L 340,-560 L 300,-640 L -300,-640 Z" fill={kind === 'ice' ? '#4a8ac8' : '#2a4a7a'} />
		<rect x={-280} y={-540} width={560} height={70} fill={kind === 'ice' ? '#4a8ac8' : '#f4f0e8'} />
		<text x={0} y={-490} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={kind === 'ice' ? 50 : 44} fill={kind === 'ice' ? '#fff' : '#2a4a7a'} letterSpacing={3}>
			{kind === 'ice' ? 'МОРОЖЕНОЕ' : 'СОЮЗПЕЧАТЬ'}
		</text>
		<rect x={-250} y={-440} width={500} height={260} fill="#cfe0e8" opacity={0.85} />
		{kind === 'press'
			? Array.from({length: 6}).map((_, k) => (
					<g key={k} transform={`translate(${-220 + k * 80},${-420})`}>
						<rect x={0} y={0} width={70} height={100} fill={['#f4f0e8', '#e8e0c8', '#f4f0e8'][k % 3]} />
						<rect x={6} y={8} width={58} height={14} fill={k % 2 ? '#c8282a' : '#2a2c30'} />
						{[0, 1, 2, 3].map((j) => (
							<rect key={j} x={6} y={30 + j * 14} width={58} height={6} fill="#8a8f96" />
						))}
						{k < 4 && <rect x={10} y={130} width={50} height={60} fill={['#e07a3a', '#3aa86a', '#4a8ac8', '#c8a02a'][k]} stroke="#fff" strokeWidth={4} strokeDasharray="4 3" />}
					</g>
				))
			: Array.from({length: 5}).map((_, k) => (
					<g key={k} transform={`translate(${-200 + k * 100},${-330})`}>
						<path d="M -26,0 L 26,0 L 18,70 L -18,70 Z" fill="#e8c48a" />
						<ellipse cx={0} cy={0} rx={30} ry={14} fill="#fff4e8" />
						<ellipse cx={0} cy={-10} rx={26} ry={16} fill="#fff8f0" />
					</g>
				))}
		<rect x={-300} y={-180} width={600} height={30} fill={kind === 'ice' ? '#d8d4c8' : '#2a4a7a'} />
	</g>
);
// a pломбир in a wafer cup (hand-local)
export const IceCream: React.FC<{s?: number; bite?: number}> = ({s = 1, bite = 0}) => (
	<g transform={`scale(${s}) translate(0,-40)`}>
		<path d="M -40,-20 L 40,-20 L 28,70 L -28,70 Z" fill="#e8c48a" />
		{[-20, 0, 20].map((k) => (
			<line key={k} x1={k - 10} y1={-20} x2={k + 6} y2={70} stroke="#c8a06a" strokeWidth={3} />
		))}
		<ellipse cx={0} cy={-20} rx={44} ry={18} fill="#fff4e8" />
		<ellipse cx={0} cy={-34} rx={38} ry={22} fill="#fffaf2" />
		{bite > 0 && <circle cx={26} cy={-44} r={20 * bite} fill="#000" opacity={0} />}
	</g>
);
// the payphone booth (glass, red) at the corner
export const Booth: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-150} y={-720} width={300} height={720} fill="#cfe0e8" opacity={0.55} stroke="#c8282a" strokeWidth={14} />
		<rect x={-160} y={-760} width={320} height={60} fill="#c8282a" />
		<text x={0} y={-718} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#fff">
			ТАКСОФОН
		</text>
		<rect x={-60} y={-520} width={120} height={180} rx={10} fill="#5a5f66" />
		<circle cx={0} cy={-400} r={36} fill="#2a2c30" />
		<rect x={-90} y={-530} width={26} height={110} rx={10} fill="#1a1c20" />
	</g>
);
// a bus stop sign («А»)
export const BusStop: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 6} y={y - 420} width={12} height={420} fill="#5a5f66" />
		<rect x={x - 70} y={y - 520} width={140} height={110} rx={10} fill="#f4c02a" stroke="#2a2c30" strokeWidth={6} />
		<text x={x} y={y - 440} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={76} fill="#2a2c30">
			А
		</text>
	</g>
);

// ========================================================== the bus ==========
// inside a bus (an articulated yellow «гармошка»): windows with the town sliding past, yellow poles, seats
export const BusInside: React.FC<{f: number}> = ({f}) => {
	const slide = (f * 9) % 900;
	return (
		<g>
			<rect x={-800} y={-600} width={3600} height={2400} fill="#e8d8a8" />
			<rect x={-800} y={60} width={3600} height={420} fill="#9fc4e0" />
			<g transform={`translate(${-slide},0)`}>
				{Array.from({length: 8}).map((_, k) => (
					<g key={k} transform={`translate(${-800 + k * 900},150)`}>
						<Facade w={700} h={420} color={k % 2 ? '#d6cdb8' : '#c9c2b0'} seed={k + 2} cols={5} />
						<circle cx={800} cy={300} r={120} fill="#4a7a3a" />
					</g>
				))}
			</g>
			{Array.from({length: 6}).map((_, k) => (
				<rect key={k} x={-800 + k * 640} y={40} width={40} height={460} fill="#c8b478" />
			))}
			<rect x={-800} y={40} width={3600} height={30} fill="#c8b478" />
			<rect x={-800} y={480} width={3600} height={40} fill="#c8b478" />
			{/* seats */}
			{Array.from({length: 6}).map((_, k) => (
				<g key={k} transform={`translate(${-500 + k * 520},640)`}>
					<rect x={0} y={-140} width={200} height={150} rx={20} fill="#8a3a2a" />
					<rect x={-10} y={0} width={240} height={50} rx={12} fill="#7a2e22" />
				</g>
			))}
			{[200, 1100, 1900].map((px) => (
				<rect key={px} x={px - 10} y={-600} width={20} height={1600} fill="#e8c020" />
			))}
			<rect x={-800} y={-20} width={3600} height={18} fill="#e8c020" />
			<rect x={-800} y={830} width={3600} height={900} fill="#5a5a52" />
		</g>
	);
};
// the ticket punch on a pole (close-up art centred at its own origin); `press` 0…1
export const Compostor: React.FC<{press: number}> = ({press}) => (
	<g>
		<rect x={-14} y={-700} width={28} height={1400} fill="#e8c020" />
		<rect x={-170} y={-260} width={340} height={420} rx={30} fill="#c8282a" />
		<rect x={-120} y={-200} width={240} height={60} rx={10} fill="#2a2c30" />
		<rect x={-110} y={-110 + press * 40} width={220} height={120} rx={14} fill="#a81e1e" />
		<text x={0} y={-30 + press * 40} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#fff">
			НАЖМИ
		</text>
	</g>
);
// a bus ticket with its holes
export const Ticket: React.FC<{holes: number}> = ({holes}) => (
	<g>
		<rect x={-160} y={-90} width={320} height={180} fill="#f4f0d8" stroke="#8a8a6a" strokeWidth={5} />
		<text x={0} y={-36} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={30} fill="#4a4a3a">
			АВТОБУС · 5 коп.
		</text>
		<text x={0} y={10} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight={700} fontSize={30} fill="#4a4a3a">
			№ 194 572
		</text>
		{holes > 0 && [[-90, 50], [-40, 54], [10, 50], [60, 54], [110, 50]].map(([hx, hy], k) => <circle key={k} cx={hx} cy={hy} r={9} fill="#2a2c30" opacity={holes} />)}
	</g>
);

// ======================================================= the switchboard ======
export const Switchboard: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#c8c4b0" />
		<rect x={200} y={60} width={1520} height={620} fill="#5a4a3a" />
		{Array.from({length: 6}).map((_, r) =>
			Array.from({length: 24}).map((__, c) => (
				<g key={`${r}-${c}`}>
					<circle cx={250 + c * 61} cy={110 + r * 90} r={12} fill="#1a1c20" />
					<circle cx={250 + c * 61} cy={140 + r * 90} r={6} fill={rnd(r * 24 + c + Math.floor(f / 20)) > 0.86 ? '#ffd34a' : '#4a3a2a'} />
				</g>
			)),
		)}
		{Array.from({length: 7}).map((_, k) => (
			<path key={k} d={`M ${300 + k * 200},700 Q ${330 + k * 200},${520 - (k % 3) * 80} ${250 + ((k * 7) % 24) * 61},${110 + (k % 6) * 90}`} stroke={['#c8282a', '#2a5aa8', '#2a8a4a'][k % 3]} strokeWidth={8} fill="none" />
		))}
		<rect x={160} y={680} width={1600} height={60} fill="#6a5a4a" />
		<rect x={-800} y={820} width={3600} height={900} fill="#8a7a62" />
	</g>
);

// ======================================================= the cinema ==========
export const Cinema81: React.FC = () => (
	<g>
		<SkyW />
		<rect x={-200} y={-60} width={2320} height={820} fill="#d8ccb4" />
		<rect x={-240} y={-100} width={2400} height={60} fill="#c0b49c" />
		{Array.from({length: 10}).map((_, k) => (
			<rect key={k} x={-120 + k * 230} y={160} width={90} height={600} fill="#e8dcc4" />
		))}
		<rect x={420} y={0} width={1080} height={120} rx={10} fill="#2a2c30" />
		<text x={960} y={84} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={80} fill="#ffd34a" letterSpacing={10}>
			КИНОТЕАТР
		</text>
		<g transform="translate(1360,240)">
			<rect x={0} y={0} width={420} height={460} fill="#f4f0e8" stroke="#8a6a44" strokeWidth={10} />
			<rect x={20} y={20} width={380} height={220} fill="#4a8ac8" />
			<circle cx={210} cy={130} r={70} fill="#ffd34a" />
			<text x={210} y={300} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={40} fill="#c8282a">
				ДЕТСКИЙ СЕАНС
			</text>
			<text x={210} y={380} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={64} fill="#2a2c30">
				10 коп.
			</text>
		</g>
		<rect x={-800} y={GROUND} width={3600} height={900} fill="#8a8478" />
	</g>
);

// ======================================================= the pioneer camp =====
export const Camp: React.FC<{f: number; night?: number}> = ({f, night = 0}) => (
	<g>
		<SkyW night={night} />
		{Array.from({length: 5}).map((_, k) => (
			<g key={k} transform={`translate(${-500 + k * 650},${GROUND - 10})`}>
				<rect x={0} y={-260} width={480} height={260} fill={night > 0.5 ? '#4a4038' : '#c8a06a'} />
				<path d="M -30,-250 L 240,-400 L 510,-250 Z" fill={night > 0.5 ? '#2a3a2a' : '#4a7a3a'} />
				{[0, 1, 2].map((j) => (
					<rect key={j} x={60 + j * 140} y={-190} width={90} height={90} fill={night > 0.5 ? '#ffd27a' : '#8ea4b6'} opacity={night > 0.5 ? 0.8 : 1} />
				))}
			</g>
		))}
		{/* the flag pole */}
		<rect x={950} y={-160} width={16} height={920} fill="#c9c4b8" />
		<path d={`M 966,-150 C 1040,${-150 + Math.sin(f / 7) * 10} 1100,${-130 + Math.sin(f / 7 + 1) * 10} 1180,${-140 + Math.sin(f / 7 + 2) * 10} L 1180,${-20 + Math.sin(f / 7 + 2) * 10} C 1100,${-10 + Math.sin(f / 7 + 1) * 10} 1040,${-30 + Math.sin(f / 7) * 10} 966,-30 Z`} fill="#c8282a" />
		<rect x={-800} y={GROUND} width={3600} height={900} fill={night > 0.5 ? '#1e2a1a' : '#6a9a4a'} />
		{night > 0 && (
			<g>
				{Array.from({length: 30}).map((_, k) => (
					<circle key={k} cx={-600 + rnd(k) * 3200} cy={-500 + rnd(k * 3) * 700} r={2 + rnd(k * 7) * 3} fill="#fff" opacity={night} />
				))}
			</g>
		)}
	</g>
);
// a camp fire (centre at the base)
export const Fire: React.FC<{f: number; s?: number}> = ({f, s = 1}) => (
	<g transform={`scale(${s})`}>
		<Glow id="fire" x={0} y={-80} r={420} color="#ffb347" o={0.6} />
		{[-60, 0, 60].map((k, j) => (
			<rect key={k} x={-120} y={-20 + j * 4} width={240} height={26} rx={12} fill="#5a3a22" transform={`rotate(${(j - 1) * 20})`} />
		))}
		{[0, 1, 2, 3, 4].map((k) => {
			const h = 120 + Math.sin(f / 3 + k * 1.7) * 30;
			return <path key={k} d={`M ${-70 + k * 35},-10 C ${-90 + k * 35},${-h * 0.5} ${-50 + k * 35},${-h * 0.8} ${-50 + k * 35 + Math.sin(f / 4 + k) * 10},${-h} C ${-20 + k * 35},${-h * 0.6} ${-10 + k * 35},${-h * 0.3} ${-30 + k * 35},-10 Z`} fill={k % 2 ? '#ffb347' : '#ff7a2a'} />;
		})}
	</g>
);
// the bugle (горн), hand-local
export const Bugle: React.FC = () => (
	<g>
		<path d="M 0,0 L 0,-180" stroke="#e0b03a" strokeWidth={14} />
		<path d="M -40,-260 L 40,-260 L 8,-180 L -8,-180 Z" fill="#e0b03a" />
		<rect x={-14} y={-150} width={28} height={50} fill="#c8282a" />
		<path d="M 14,-150 L 40,-110 L 20,-90" fill="#c8282a" />
	</g>
);

// =========================================================== the pocket ======
// the pioneer badge (a red star with a flame; no portrait) — centre at the origin
export const PioneerBadge: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M -40,-150 C -60,-200 -10,-230 0,-270 C 10,-230 60,-200 40,-150 Z" fill="#ff7a2a" />
		<path d={starD(0, 0, 150)} fill="#d8282a" stroke="#a81e1e" strokeWidth={6} />
		<circle cx={0} cy={0} r={54} fill="#e8c04a" />
		<circle cx={0} cy={0} r={40} fill="#d8282a" />
		<path d="M -110,90 Q 0,130 110,90 L 100,130 Q 0,170 -100,130 Z" fill="#d8282a" />
		<text x={0} y={128} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={22} fill="#e8c04a">
			ВСЕГДА ГОТОВ
		</text>
	</g>
);
// a 2-kopeck coin (centre at the origin)
export const Kopeck2: React.FC<{s?: number; spin?: number}> = ({s = 1, spin = 0}) => (
	<g transform={`scale(${s * Math.max(0.15, Math.abs(Math.cos(spin)))},${s})`}>
		<circle r={110} fill="#c9a26a" stroke="#8a6a3a" strokeWidth={10} />
		<circle r={90} fill="none" stroke="#a8844e" strokeWidth={4} strokeDasharray="6 6" />
		<text y={20} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={110} fill="#8a6a3a">
			2
		</text>
		<text y={70} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={26} fill="#8a6a3a">
			КОПЕЙКИ
		</text>
	</g>
);
