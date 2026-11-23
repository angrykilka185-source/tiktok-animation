// The channel «Чоби» in the white style of the covers (a white page, a soft yellow glow with faint rays, everything a
// sticker with a white edge and a soft shadow):
//   ChannelAvatarW 1024×1024 — Чоби close up, waving (reads at 48 px; safe for the circle crop)
//   ChannelBannerW 2560×1440 — a white page in pale squares (a school exercise book); Чоби with his pointer shows the
//     name CHOBI; round them stickers of what the channel explains: the Titanic and the iceberg, a thermometer, a bag of
//     chips, the pioneer badge, a brain, a heart, a lightbulb, «?»… Чоби and the name sit in YouTube's safe area
//     (1546×423 in the middle: phones), the stickers fill the band beside it (computers, 2560×423) and the rest (TVs).
// Render: npx remotion still ChannelAvatarW out/cover/avatar-w.png ; npx remotion still ChannelBannerW out/cover/banner-w.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ChipsBag} from '../c1/kit';
import {Choby} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {Kopeck2, PioneerBadge} from '../u1/town';
import {Iceberg, Thermo, Titanic} from '../z1/kit';

const INK = '#16161c';
const YEL = '#f2c230';
const BLUE = '#2f86e0';

// a sticker: a white edge and a soft shadow under it
const StickerFilter: React.FC<{id: string; r?: number; blur?: number; dy?: number}> = ({id, r = 6, blur = 7, dy = 9}) => (
	<filter id={id} x="-25%" y="-25%" width="150%" height="160%" colorInterpolationFilters="sRGB">
		<feMorphology in="SourceAlpha" operator="dilate" radius={r} result="d" />
		<feFlood floodColor="#ffffff" />
		<feComposite in2="d" operator="in" result="outline" />
		<feGaussianBlur in="d" stdDeviation={blur} result="b" />
		<feOffset in="b" dx={0} dy={dy} result="sh" />
		<feFlood floodColor="#2a2210" floodOpacity={0.22} />
		<feComposite in2="sh" operator="in" result="shadow" />
		<feMerge>
			<feMergeNode in="shadow" />
			<feMergeNode in="outline" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
);
const St: React.FC<{x: number; y: number; r?: number; s?: number; children: React.ReactNode}> = ({x, y, r = 0, s = 1, children}) => (
	<g filter="url(#chw-stk)">
		<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>{children}</g>
	</g>
);

// ------------------------------------------------------------------------------------------- the stickers -----
const Heart: React.FC = () => (
	<g>
		<path d="M 0,70 C -90,10 -100,-60 -50,-75 C -20,-84 0,-60 0,-40 C 0,-60 20,-84 50,-75 C 100,-60 90,10 0,70 Z" fill="#e0303a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<ellipse cx={-44} cy={-44} rx={17} ry={9} fill="#fff" opacity={0.75} transform="rotate(-30 -44 -44)" />
	</g>
);
const Brain: React.FC = () => (
	<g>
		<path d="M -95,10 C -110,-40 -70,-80 -30,-72 C -10,-100 40,-96 55,-70 C 95,-75 115,-30 100,5 C 115,40 80,75 45,62 C 25,85 -20,85 -35,62 C -75,75 -110,45 -95,10 Z" fill="#f7a8b8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<g stroke="#c96a82" strokeWidth={6} fill="none" strokeLinecap="round">
			<path d="M 0,-82 C -10,-40 15,-10 0,20 C -12,45 5,60 0,74" />
			<path d="M -70,-30 q 20,-12 34,4 M -76,20 q 22,-14 40,6 M 40,-40 q 20,-8 36,8 M 34,10 q 22,-10 44,6" />
		</g>
	</g>
);
const Ask: React.FC<{mark?: string}> = ({mark = '?'}) => (
	<g>
		<path d="M -70,-60 Q -70,-90 -40,-90 L 50,-90 Q 80,-90 80,-60 L 80,10 Q 80,40 50,40 L 4,40 L -30,76 L -22,40 L -40,40 Q -70,40 -70,10 Z" fill={YEL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<text x={5} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={108} fill={INK}>
			{mark}
		</text>
	</g>
);
const Snow: React.FC<{color?: string}> = ({color = BLUE}) => (
	<g stroke={color} strokeWidth={13} strokeLinecap="round" fill="none">
		{[0, 60, 120].map((a) => (
			<line key={a} x1={0} y1={-70} x2={0} y2={70} transform={`rotate(${a})`} />
		))}
		{[0, 60, 120, 180, 240, 300].map((a) => (
			<path key={a} d="M -20,-52 L 0,-34 L 20,-52" transform={`rotate(${a})`} />
		))}
	</g>
);
const IceCube: React.FC = () => (
	<g>
		<rect x={-62} y={-62} width={124} height={124} rx={22} fill="#cfeaff" stroke="#4a9ad8" strokeWidth={7} />
		<path d="M -44,-40 L -12,-46 L -40,10 Z" fill="#fff" opacity={0.85} />
		<path d="M 26,30 l 12,-26" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
	</g>
);
const Bolt: React.FC = () => <path d="M 14,-90 L -46,10 L -6,10 L -22,90 L 46,-14 L 4,-14 L 26,-90 Z" fill={YEL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />;
const Star: React.FC = () => {
	const pts = Array.from({length: 10}).map((_, k) => {
		const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
		const R = k % 2 ? 34 : 80;
		return `${(Math.cos(a) * R).toFixed(1)},${(Math.sin(a) * R).toFixed(1)}`;
	});
	return <polygon points={pts.join(' ')} fill={YEL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />;
};
const Hourglass: React.FC = () => (
	<g>
		<path d="M -45,-82 L 45,-82 Q 45,-30 8,0 Q 45,30 45,82 L -45,82 Q -45,30 -8,0 Q -45,-30 -45,-82 Z" fill="#eaf5ff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
		<path d="M -32,-54 L 32,-54 Q 22,-22 0,-6 Q -22,-22 -32,-54 Z" fill={YEL} />
		<path d="M -38,78 Q 0,38 38,78 Z" fill={YEL} />
		<rect x={-62} y={-102} width={124} height={22} rx={8} fill="#b07a3e" stroke={INK} strokeWidth={6} />
		<rect x={-62} y={80} width={124} height={22} rx={8} fill="#b07a3e" stroke={INK} strokeWidth={6} />
	</g>
);
const Phone: React.FC = () => (
	<g>
		<rect x={-58} y={-104} width={116} height={208} rx={20} fill={INK} />
		<rect x={-48} y={-90} width={96} height={180} rx={12} fill="#5aa6e8" />
		<rect x={-30} y={-22} width={54} height={30} rx={6} fill="none" stroke="#fff" strokeWidth={6} />
		<rect x={24} y={-13} width={7} height={12} rx={2} fill="#fff" />
		<rect x={-24} y={-16} width={42} height={18} rx={3} fill="#3fd06a" />
		<text x={0} y={46} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#fff">
			100%
		</text>
	</g>
);
const Bulb: React.FC = () => (
	<g>
		{[-60, -30, 0, 30, 60].map((a) => (
			<line key={a} x1={0} y1={-100} x2={0} y2={-126} stroke={YEL} strokeWidth={11} strokeLinecap="round" transform={`rotate(${a} 0 -20)`} />
		))}
		<path d="M -52,-20 C -52,-76 52,-76 52,-20 C 52,10 30,26 26,50 L -26,50 C -30,26 -52,10 -52,-20 Z" fill="#ffe46a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<rect x={-28} y={50} width={56} height={34} rx={8} fill="#9aa1ae" stroke={INK} strokeWidth={6} />
		<path d="M -16,-22 q 16,18 32,0" stroke="#e0a020" strokeWidth={6} fill="none" strokeLinecap="round" />
		<ellipse cx={-26} cy={-36} rx={8} ry={14} fill="#fff" opacity={0.85} />
	</g>
);
const Flask: React.FC = () => (
	<g>
		<path d="M -22,-80 L 22,-80 L 22,-30 L 66,58 Q 70,76 52,76 L -52,76 Q -70,76 -66,58 L -22,-30 Z" fill="#eef6fb" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
		<path d="M -40,20 L 40,20 L 60,60 Q 62,68 52,68 L -52,68 Q -62,68 -60,60 Z" fill="#7ac86a" />
		<circle cx={-10} cy={-6} r={8} fill="#7ac86a" />
		<circle cx={8} cy={-32} r={6} fill="#7ac86a" />
		<rect x={-30} y={-92} width={60} height={16} rx={6} fill="#b07a3e" stroke={INK} strokeWidth={6} />
	</g>
);
// the Titanic on a strip of sea, the iceberg ahead of her
const TitanicCard: React.FC = () => (
	<g>
		<path d="M -190,10 Q -95,-2 0,10 T 190,10 L 190,52 Q 0,64 -190,52 Z" fill="#2f6fb8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
		<g transform="translate(-150,14) scale(0.27)">
			<Iceberg />
		</g>
		<g transform="translate(40,12) scale(0.17)">
			<Titanic lights={0.6} />
		</g>
		<path d="M -170,26 q 20,-8 40,0 t 40,0 M 20,34 q 20,-8 40,0 t 40,0" stroke="#bfe0ff" strokeWidth={4} fill="none" strokeLinecap="round" />
	</g>
);
const Thermometer: React.FC = () => (
	<g transform="scale(0.5)">
		<Thermo x={0} y={110} v={34} h={300} label={false} />
	</g>
);

// pale squares of a school exercise book
const Grid: React.FC<{w: number; h: number; step: number}> = ({w, h, step}) => (
	<g stroke="#e8eff7" strokeWidth={2}>
		{Array.from({length: Math.ceil(w / step) + 1}).map((_, k) => (
			<line key={`v${k}`} x1={k * step} y1={0} x2={k * step} y2={h} />
		))}
		{Array.from({length: Math.ceil(h / step) + 1}).map((_, k) => (
			<line key={`h${k}`} x1={0} y1={k * step} x2={w} y2={k * step} />
		))}
	</g>
);

// the glow and the faint rays behind the main figure
const Glow: React.FC<{id: string; cx: number; cy: number; r: number; rays?: number}> = ({id, cx, cy, r, rays = 18}) => (
	<g>
		<defs>
			<radialGradient id={`${id}-g`} cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#fff1b0" />
				<stop offset="0.6" stopColor="#fff8dc" />
				<stop offset="1" stopColor="#ffffff" stopOpacity={0} />
			</radialGradient>
			<radialGradient id={`${id}-f`} cx="0.5" cy="0.5" r="0.5">
				<stop offset="0.25" stopColor="#fff" />
				<stop offset="1" stopColor="#000" />
			</radialGradient>
			<mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={cx - r * 1.6} y={cy - r * 1.6} width={r * 3.2} height={r * 3.2}>
				<circle cx={cx} cy={cy} r={r * 1.5} fill={`url(#${id}-f)`} />
			</mask>
		</defs>
		<circle cx={cx} cy={cy} r={r} fill={`url(#${id}-g)`} />
		<g mask={`url(#${id}-m)`}>
			{Array.from({length: rays}).map((_, k) => {
				const a = (k / rays) * Math.PI * 2 + 0.12;
				const R = r * 1.6;
				return <path key={k} d={`M ${cx},${cy} L ${cx + Math.cos(a) * R},${cy + Math.sin(a) * R} L ${cx + Math.cos(a + 0.11) * R},${cy + Math.sin(a + 0.11) * R} Z`} fill={YEL} opacity={0.14} />;
			})}
		</g>
	</g>
);

// ============================================================ the avatar =====
export const ChannelAvatarW: React.FC = () => (
	<AbsoluteFill style={{background: '#ffffff'}}>
		<svg width={1024} height={1024} viewBox="0 0 1024 1024">
			<defs>
				<StickerFilter id="chw-stk" r={10} blur={12} dy={14} />
			</defs>
			<Glow id="chw-av" cx={512} cy={480} r={500} rays={16} />
			<g filter="url(#chw-stk)">
				<Choby x={512} y={500 + 560 * 2.1} s={2.1} jaw={0.32} look={[0, 0.06]} armR="wave" armL="down" bust f={0} />
			</g>
		</svg>
	</AbsoluteFill>
);

// ============================================================ the banner =====
// YouTube shows: phones 1546×423 in the middle (x 507…2053, y 508…931), computers the whole width of that band,
// TVs everything
export const ChannelBannerW: React.FC = () => {
	const CX = 905;
	const FY = 926;
	const s = 0.5;
	return (
		<AbsoluteFill style={{background: '#ffffff'}}>
			<svg width={2560} height={1440} viewBox="0 0 2560 1440">
				<defs>
					<StickerFilter id="chw-stk" />
				</defs>
				<Grid w={2560} h={1440} step={64} />
				<Glow id="chw-bn" cx={1290} cy={735} r={760} />
				{/* the band beside the middle (computers): the stickers of the topics */}
				<St x={255} y={655} r={-5}>
					<TitanicCard />
				</St>
				<St x={118} y={812} r={-10} s={0.5}>
					<ChipsBag s={1} />
				</St>
				<St x={432} y={796} r={10}>
					<Thermometer />
				</St>
				<St x={2172} y={668} r={10} s={0.4}>
					<PioneerBadge />
				</St>
				<St x={2404} y={640} r={-8} s={0.85}>
					<Brain />
				</St>
				<St x={2196} y={848} r={-10} s={0.72}>
					<Heart />
				</St>
				<St x={2436} y={836} r={12} s={0.8}>
					<Bulb />
				</St>
				{/* TVs only: above and below the band */}
				<St x={300} y={300} r={10} s={0.9}>
					<Snow />
				</St>
				<St x={720} y={250} r={-12} s={0.5}>
					<Kopeck2 />
				</St>
				<St x={1280} y={240} r={8} s={0.85}>
					<Hourglass />
				</St>
				<St x={1840} y={270} r={10} s={0.85}>
					<Bolt />
				</St>
				<St x={2280} y={320} r={-8} s={0.9}>
					<IceCube />
				</St>
				<St x={420} y={1170} r={-8} s={0.85}>
					<Phone />
				</St>
				<St x={980} y={1200} r={6} s={0.85}>
					<Flask />
				</St>
				<St x={1560} y={1180} r={-6} s={0.7}>
					<Star />
				</St>
				<St x={2050} y={1170} r={-10} s={0.8}>
					<Snow color="#7cc0f0" />
				</St>
				<St x={2400} y={1160} r={8} s={0.8}>
					<Ask mark="!" />
				</St>
				{/* the middle (phones): Чоби shows the name with his pointer and waves */}
				<ellipse cx={CX} cy={FY + 4} rx={92} ry={10} fill="#000" opacity={0.08} />
				<g filter="url(#chw-stk)">
					<Choby x={CX} y={FY} s={s} jaw={0.3} look={[0.15, 0.05]} armR="pointer" pointerAng={60} armL="wave" f={0} />
				</g>
				<St x={700} y={604} r={-8} s={0.62}>
					<Ask />
				</St>
				<St x={2018} y={566} r={12} s={0.42}>
					<Star />
				</St>
				<g fontFamily={HEAVY} fontWeight={900} fontSize={250} textAnchor="middle">
					<text x={1612} y={846} fill={YEL}>
						CHOBI
					</text>
					<text x={1600} y={834} fill={INK}>
						CHOBI
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
