// The channel's look with its host Костя (src/components/Kostya.tsx):
//   ChannelAvatar 1024×1024 — Костя close up on a navy ground with a yellow disc (reads at 48 px, safe for a circle crop)
//   ChannelBanner 2560×1440 — a chalkboard, Костя with the pointer and «КАКОВО ЭТО? · ЧТО БУДЕТ, ЕСЛИ… ·
//   ОТКУДА ВЗЯЛОСЬ…»; everything that matters sits in YouTube's safe area 1546×423 in the middle, the chalk
//   doodles (the Titanic, a thermometer, a heart, the chips…) fill the sides seen on wide screens.
// Render: npx remotion still ChannelAvatar out/cover/avatar.png ; npx remotion still ChannelBanner out/cover/banner.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {Kostya} from '../components/Kostya';

const CHALK = '#eef3ea';
const YEL = '#f2c230';

export const ChannelAvatar: React.FC = () => (
	<AbsoluteFill style={{background: '#0d1528'}}>
		<svg width={1024} height={1024} viewBox="0 0 1024 1024">
			<defs>
				<radialGradient id="avBg" cx="50%" cy="42%" r="62%">
					<stop offset="0%" stopColor="#24365e" />
					<stop offset="100%" stopColor="#0b1224" />
				</radialGradient>
			</defs>
			<rect width={1024} height={1024} fill="url(#avBg)" />
			<circle cx={512} cy={470} r={330} fill={YEL} />
			<circle cx={512} cy={470} r={330} fill="none" stroke="#d9a91c" strokeWidth={14} />
			{/* chalk sparkles */}
			<g stroke={CHALK} strokeWidth={10} strokeLinecap="round" opacity={0.7}>
				<path d="M 150,250 l 0,60 M 120,280 l 60,0" />
				<path d="M 880,700 l 0,50 M 855,725 l 50,0" />
				<path d="M 860,210 l 0,40 M 840,230 l 40,0" />
			</g>
			<Kostya x={512} y={470 + 1010 * 2.05} s={2.05} jaw={0.35} look={[0, 0.1]} tilt={-6} armR="down" armL="down" bust />
		</svg>
	</AbsoluteFill>
);

// chalk doodles, drawn as strokes
const Doodles: React.FC = () => (
	<g stroke={CHALK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}>
		{/* the Titanic */}
		<path d="M 90,640 L 430,640 L 400,700 L 120,700 Z M 150,640 l 0,-40 l 40,0 l 0,40 M 230,640 l 0,-50 l 40,0 l 0,50 M 310,640 l 0,-40 l 40,0 l 0,40" />
		<path d="M 60,730 q 40,-20 80,0 t 80,0 t 80,0 t 80,0 t 80,0" />
		{/* an iceberg */}
		<path d="M 300,560 l 40,-70 l 30,40 l 30,-60 l 50,90" />
		{/* a thermometer */}
		<path d="M 2350,520 l 0,190 m -26,0 a 26,26 0 1,0 52,0 a 26,26 0 1,0 -52,0 M 2336,540 l 0,160 M 2364,540 l 0,160 M 2336,540 a 14,14 0 0,1 28,0" />
		<path d="M 2390,580 l 30,0 M 2390,620 l 30,0 M 2390,660 l 30,0" />
		{/* a heart */}
		<path d="M 2180,840 c -30,-40 -90,-10 -60,40 l 60,50 l 60,-50 c 30,-50 -30,-80 -60,-40 Z" />
		{/* a snowflake */}
		<path d="M 200,880 l 0,100 M 150,930 l 100,0 M 165,895 l 70,70 M 235,895 l -70,70" />
		{/* a chips bag */}
		<path d="M 2200,450 l 120,0 l -10,150 l -100,0 Z M 2215,470 l 90,0" />
		{/* question marks */}
		<path d="M 470,850 q 0,-40 35,-40 q 35,0 35,35 q 0,25 -35,35 l 0,25 M 505,945 l 0,2" />
		<path d="M 2440,830 q 0,-30 26,-30 q 26,0 26,26 q 0,19 -26,26 l 0,19 M 2466,900 l 0,2" />
		{/* a Soviet star and «1 · 10 · 1» */}
		<path d="M 120,470 l 18,40 l 44,4 l -34,28 l 10,42 l -38,-22 l -38,22 l 10,-42 l -34,-28 l 44,-4 Z" />
		<text x={2160} y={1010} fontFamily={HEAVY} fontWeight={900} fontSize={60} fill={CHALK} stroke="none">
			1 · 10 · 1
		</text>
	</g>
);

export const ChannelBanner: React.FC = () => {
	// YouTube safe area: x 507…2053, y 508…931
	return (
		<AbsoluteFill style={{background: '#203c33'}}>
			<svg width={2560} height={1440} viewBox="0 0 2560 1440">
				<defs>
					<radialGradient id="bnBg" cx="50%" cy="50%" r="70%">
						<stop offset="0%" stopColor="#2f5547" />
						<stop offset="100%" stopColor="#15291f" />
					</radialGradient>
				</defs>
				<rect width={2560} height={1440} fill="url(#bnBg)" />
				{/* chalk dust */}
				{Array.from({length: 60}).map((_, k) => (
					<circle key={k} cx={(k * 437) % 2560} cy={(k * 271) % 1440} r={2 + (k % 3)} fill={CHALK} opacity={0.12} />
				))}
				<Doodles />
				{/* Костя on the left of the safe area, pointing at the title */}
				<ellipse cx={700} cy={1101} rx={200} ry={18} fill="#000" opacity={0.2} />
				<Kostya x={700} y={1101} s={0.5} jaw={0.3} look={[0.6, -0.2]} tilt={-4} armR="pointer" armL="hip" />
				{/* the title */}
				<text x={1480} y={686} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={132} fill="#fff" stroke="#0d1a14" strokeWidth={10} paintOrder="stroke">
					КАКОВО ЭТО?
				</text>
				{[
					{x: 1215, t: 'ЧТО БУДЕТ, ЕСЛИ…'},
					{x: 1745, t: 'ОТКУДА ВЗЯЛОСЬ…'},
				].map((c) => (
					<g key={c.t}>
						<rect x={c.x - 250} y={730} width={500} height={84} rx={42} fill={YEL} />
						<text x={c.x} y={786} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#16161c">
							{c.t}
						</text>
					</g>
				))}
				<text x={1480} y={885} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={CHALK} opacity={0.92}>
					ОБЪЯСНЯЕТ КОСТЯ — СКЕЛЕТ-УЧИТЕЛЬ
				</text>
			</svg>
		</AbsoluteFill>
	);
};
