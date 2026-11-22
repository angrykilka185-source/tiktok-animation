// The channel «Чоби» and its host Чоби — a small, cute skeleton teacher (src/components/Choby.tsx):
//   ChannelAvatar 1024×1024 — Чоби close up on a navy ground with a yellow disc (reads at 48 px, safe for a circle crop)
//   ChannelBanner 2560×1440 — a chalkboard, Чоби with the pointer, the name «ЧОБИ» and the formats
//   «КАКОВО ЭТО? · ЧТО БУДЕТ, ЕСЛИ… · ОТКУДА ВЗЯЛОСЬ…». Everything that matters sits in YouTube's safe area
//   1546×423 in the middle; the chalk doodles (the Titanic, a thermometer, a heart, the chips…) fill the sides.
// Render: npx remotion still ChannelAvatar out/cover/avatar.png ; npx remotion still ChannelBanner out/cover/banner.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Choby} from '../components/Choby';
import {HEAVY} from '../components/Overlays';

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
			<circle cx={512} cy={520} r={360} fill={YEL} />
			<circle cx={512} cy={520} r={360} fill="none" stroke="#d9a91c" strokeWidth={14} />
			<g stroke={CHALK} strokeWidth={10} strokeLinecap="round" opacity={0.7}>
				<path d="M 150,250 l 0,60 M 120,280 l 60,0" />
				<path d="M 880,720 l 0,50 M 855,745 l 50,0" />
				<path d="M 870,200 l 0,40 M 850,220 l 40,0" />
			</g>
			<Choby x={512} y={520 + 560 * 1.75} s={1.75} jaw={0.3} look={[0, 0.15]} tilt={-6} armR="down" armL="down" bust />
		</svg>
	</AbsoluteFill>
);

// chalk doodles, drawn as strokes
const Doodles: React.FC = () => (
	<g stroke={CHALK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5}>
		<path d="M 90,640 L 430,640 L 400,700 L 120,700 Z M 150,640 l 0,-40 l 40,0 l 0,40 M 230,640 l 0,-50 l 40,0 l 0,50 M 310,640 l 0,-40 l 40,0 l 0,40" />
		<path d="M 60,730 q 40,-20 80,0 t 80,0 t 80,0 t 80,0 t 80,0" />
		<path d="M 300,560 l 40,-70 l 30,40 l 30,-60 l 50,90" />
		<path d="M 2350,520 l 0,190 m -26,0 a 26,26 0 1,0 52,0 a 26,26 0 1,0 -52,0 M 2336,540 l 0,160 M 2364,540 l 0,160 M 2336,540 a 14,14 0 0,1 28,0" />
		<path d="M 2390,580 l 30,0 M 2390,620 l 30,0 M 2390,660 l 30,0" />
		<path d="M 2180,840 c -30,-40 -90,-10 -60,40 l 60,50 l 60,-50 c 30,-50 -30,-80 -60,-40 Z" />
		<path d="M 200,880 l 0,100 M 150,930 l 100,0 M 165,895 l 70,70 M 235,895 l -70,70" />
		<path d="M 2200,450 l 120,0 l -10,150 l -100,0 Z M 2215,470 l 90,0" />
		<path d="M 2440,830 q 0,-30 26,-30 q 26,0 26,26 q 0,19 -26,26 l 0,19 M 2466,900 l 0,2" />
		<path d="M 120,470 l 18,40 l 44,4 l -34,28 l 10,42 l -38,-22 l -38,22 l 10,-42 l -34,-28 l 44,-4 Z" />
		<text x={2160} y={1010} fontFamily={HEAVY} fontWeight={900} fontSize={60} fill={CHALK} stroke="none">
			1 · 10 · 1
		</text>
	</g>
);

export const ChannelBanner: React.FC = () => (
	// YouTube safe area: x 507…2053, y 508…931
	<AbsoluteFill style={{background: '#203c33'}}>
		<svg width={2560} height={1440} viewBox="0 0 2560 1440">
			<defs>
				<radialGradient id="bnBg" cx="50%" cy="50%" r="70%">
					<stop offset="0%" stopColor="#2f5547" />
					<stop offset="100%" stopColor="#15291f" />
				</radialGradient>
			</defs>
			<rect width={2560} height={1440} fill="url(#bnBg)" />
			{Array.from({length: 60}).map((_, k) => (
				<circle key={k} cx={(k * 437) % 2560} cy={(k * 271) % 1440} r={2 + (k % 3)} fill={CHALK} opacity={0.12} />
			))}
			<Doodles />
			{/* Чоби, the whole of him inside the safe area, pointing at the name */}
			<ellipse cx={780} cy={928} rx={150} ry={14} fill="#000" opacity={0.22} />
			<Choby x={780} y={926} s={0.53} jaw={0.3} look={[0.7, -0.2]} tilt={-5} armR="pointer" armL="hip" />
			<text x={1505} y={700} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={210} fill="#fff" stroke="#0d1a14" strokeWidth={12} paintOrder="stroke">
				ЧОБИ
			</text>
			{[
				{x: 1115, w: 280, t: 'КАКОВО ЭТО?'},
				{x: 1464, w: 382, t: 'ЧТО БУДЕТ, ЕСЛИ…'},
				{x: 1854, w: 362, t: 'ОТКУДА ВЗЯЛОСЬ…'},
			].map((c) => (
				<g key={c.t}>
					<rect x={c.x - c.w / 2} y={760} width={c.w} height={72} rx={36} fill={YEL} />
					<text x={c.x} y={807} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={28} fill="#16161c">
						{c.t}
					</text>
				</g>
			))}
			<text x={1505} y={892} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={CHALK} opacity={0.9}>
				СКЕЛЕТ-УЧИТЕЛЬ ОБЪЯСНЯЕТ ИНТЕРЕСНОЕ И СТРАШНОЕ
			</text>
		</svg>
	</AbsoluteFill>
);
