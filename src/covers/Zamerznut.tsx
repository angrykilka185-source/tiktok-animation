// Covers (YouTube thumbnails, 1280×720) for «Каково это — замёрзнуть насмерть» with Чоби — two to test against
// each other (YouTube Studio → «Тестирование обложек»):
//   CoverZamerznut  — the channel's white page: Чоби frozen into a block of ice up to the neck (his ribs show through
//                     the ice), hoarfrost and icicles on the cap, blue cheeks, chattering teeth; the title on the left
//                     «КАКОВО ЭТО — / ЗАМЁРЗНУТЬ / НАСМЕРТЬ» (icicles hang from «ЗАМЁРЗНУТЬ»), the chips 36,6° → 28°.
//   CoverZamerznutB — night: the Titanic going down on the horizon with its lights on, Чоби in the black water up to
//                     his chest among the ice floes; «ВОДА −2°».
// Render: npx remotion still CoverZamerznut out/cover/zamerznut.png --scale=1.5   (→ 1920×1080)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Choby, type ArmSpec} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {NightSky, Sea, Titanic} from '../z1/kit';

const RED = '#d8282a';
const RED_D = '#8f1416';
const INK = '#16161c';
const ICE_D = '#0f3f86';

// arms pressed to the chest, fists together: brr (the right arm; the left one mirrored)
const HUG: ArmSpec = {el: [100, -318], ha: [18, -345], hang: 108, fist: true};
const HUG_L: ArmSpec = {el: [-100, -318], ha: [-18, -345], hang: -108, fist: true};

// a "sticker": a white outline and a soft shadow under it
const StickerFilter: React.FC<{id: string; shadow?: string}> = ({id, shadow = '#0a2a4a'}) => (
	<filter id={id} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
		<feMorphology in="SourceAlpha" operator="dilate" radius={6} result="d" />
		<feFlood floodColor="#ffffff" />
		<feComposite in2="d" operator="in" result="outline" />
		<feGaussianBlur in="d" stdDeviation={7} result="b" />
		<feOffset in="b" dx={0} dy={9} result="sh" />
		<feFlood floodColor={shadow} floodOpacity={0.25} />
		<feComposite in2="sh" operator="in" result="shadow" />
		<feMerge>
			<feMergeNode in="shadow" />
			<feMergeNode in="outline" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
);

// a six-armed snowflake
const Flake: React.FC<{x: number; y: number; r: number; color: string; rot?: number; w?: number}> = ({x, y, r, color, rot = 0, w = 5}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
		{[0, 60, 120].map((a) => (
			<line key={a} x1={0} y1={-r} x2={0} y2={r} transform={`rotate(${a})`} />
		))}
		{[0, 60, 120, 180, 240, 300].map((a) => (
			<path key={a} d={`M ${-r * 0.28},${-r * 0.72} L 0,${-r * 0.5} L ${r * 0.28},${-r * 0.72}`} transform={`rotate(${a})`} />
		))}
	</g>
);

// frost on a window pane: feathery ferns growing from a corner (deterministic)
const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const Frost: React.FC<{x: number; y: number; dir: number; color: string; seed: number; n?: number; len?: number}> = ({x, y, dir, color, seed, n = 7, len = 260}) => (
	<g stroke={color} strokeLinecap="round" fill="none">
		{Array.from({length: n}).map((_, i) => {
			const a = dir + (i / (n - 1) - 0.5) * 80 + (rnd(seed + i) - 0.5) * 14;
			const L = len * (0.55 + rnd(seed + i + 40) * 0.6);
			const rad = (a * Math.PI) / 180;
			const ex = x + Math.cos(rad) * L;
			const ey = y + Math.sin(rad) * L;
			const bend = (rnd(seed + i + 80) - 0.5) * 60;
			const side = Array.from({length: 7}).map((__, j) => {
				const t = 0.18 + j * 0.11;
				const bx = x + (ex - x) * t;
				const by = y + (ey - y) * t;
				const l = (1 - t) * 46 + 8;
				return [1, -1].map((sd) => {
					const ra = rad + sd * 0.75;
					return <line key={`${j}${sd}`} x1={bx} y1={by} x2={bx + Math.cos(ra) * l} y2={by + Math.sin(ra) * l} strokeWidth={3} />;
				});
			});
			return (
				<g key={i}>
					<path d={`M ${x},${y} Q ${(x + ex) / 2 + bend},${(y + ey) / 2 - bend} ${ex},${ey}`} strokeWidth={5} />
					{side}
				</g>
			);
		})}
	</g>
);

// the title: three lines on the left; widths are fixed (textLength) so the layout is exact
const Title: React.FC<{x: number; y: number; dark?: boolean}> = ({x, y, dark = false}) => {
	const W2 = 800;
	// icicles under «ЗАМЁРЗНУТЬ» (under the letters, not in the gaps)
	const icicles = [0.06, 0.15, 0.25, 0.36, 0.45, 0.55, 0.66, 0.75, 0.86, 0.95];
	return (
		<g fontFamily={HEAVY} fontWeight={900}>
			<defs>
				<linearGradient id="ttlIce" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#7cc8ff" />
					<stop offset="0.55" stopColor="#2f86e0" />
					<stop offset="1" stopColor="#1a5cc0" />
				</linearGradient>
				<linearGradient id="ttlIceL" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="1" stopColor="#a8dcff" />
				</linearGradient>
			</defs>
			<text x={x + 2} y={y} fontSize={68} textLength={600} lengthAdjust="spacing" fill={dark ? '#ffffff' : INK}>
				КАКОВО ЭТО —
			</text>
			{/* «ЗАМЁРЗНУТЬ»: icy blue with a dark 3D edge, icicles hanging from it */}
			<g>
				{icicles.map((t, i) => {
					const ix = x + W2 * t + (rnd(i + 5) - 0.5) * 10;
					const L = 22 + rnd(i + 17) * 26;
					const wd = 9 + rnd(i + 29) * 6;
					return (
						<g key={i}>
							<path d={`M ${ix - wd},${y + 128} L ${ix + wd},${y + 128} L ${ix + 1},${y + 128 + L} Z`} fill="#bfe4ff" stroke="#5aa6e0" strokeWidth={2.5} strokeLinejoin="round" />
							<line x1={ix - wd * 0.35} y1={y + 131} x2={ix} y2={y + 124 + L * 0.7} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
						</g>
					);
				})}
				<text x={x} y={y + 138} fontSize={112} textLength={W2} lengthAdjust="spacing" fill={dark ? '#2f86e0' : ICE_D}>
					ЗАМЁРЗНУТЬ
				</text>
				<text x={x} y={y + 130} fontSize={112} textLength={W2} lengthAdjust="spacing" fill={dark ? 'url(#ttlIceL)' : 'url(#ttlIce)'}>
					ЗАМЁРЗНУТЬ
				</text>
				{/* snow lying on the letters */}
				{[0.02, 0.13, 0.23, 0.34, 0.44, 0.53, 0.63, 0.73, 0.84, 0.93].map((t, i) => (
					<ellipse key={i} cx={x + W2 * (t + 0.035)} cy={y + 52} rx={24 + rnd(i + 3) * 8} ry={7} fill="#ffffff" opacity={dark ? 0.95 : 0.9} />
				))}
			</g>
			{/* «НАСМЕРТЬ»: red with a dark-red 3D edge */}
			<text x={x - 4} y={y + 300} fontSize={136} textLength={800} lengthAdjust="spacing" fill={RED_D}>
				НАСМЕРТЬ
			</text>
			<text x={x - 4} y={y + 291} fontSize={136} textLength={800} lengthAdjust="spacing" fill={dark ? '#ff3b30' : RED}>
				НАСМЕРТЬ
			</text>
		</g>
	);
};

// ============================================================ A: frozen into a block of ice (white page) =====
export const CoverZamerznut: React.FC = () => {
	const CX = 1082;
	const s = 1.08;
	const FY = 890; // his feet (below the frame); the head centre at FY − 560·s ≈ 285
	const iceTop = 452;
	return (
		<AbsoluteFill style={{background: '#ffffff', overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<defs>
					<StickerFilter id="cvz-stk" />
					<radialGradient id="cvz-glow" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#cfe9fd" />
						<stop offset="0.7" stopColor="#e6f4ff" />
						<stop offset="1" stopColor="#ffffff" stopOpacity={0} />
					</radialGradient>
					<radialGradient id="cvz-fade" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0.3" stopColor="#fff" />
						<stop offset="1" stopColor="#000" />
					</radialGradient>
					<mask id="cvz-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1280} height={720}>
						<circle cx={CX} cy={330} r={640} fill="url(#cvz-fade)" />
					</mask>
					<linearGradient id="cvz-ice" x1="0" y1="0" x2="0.3" y2="1">
						<stop offset="0" stopColor="#e3f4ff" stopOpacity={0.8} />
						<stop offset="1" stopColor="#8fcaf2" stopOpacity={0.92} />
					</linearGradient>
				</defs>
				{/* behind him: a cold glow, faint rays, frost in the corners, snowflakes */}
				<circle cx={CX} cy={330} r={470} fill="url(#cvz-glow)" />
				<g mask="url(#cvz-mask)">
					{Array.from({length: 16}).map((_, k) => {
						const a = (k / 16) * Math.PI * 2 + 0.1;
						const R = 1000;
						return <path key={k} d={`M ${CX},330 L ${CX + Math.cos(a) * R},${330 + Math.sin(a) * R} L ${CX + Math.cos(a + 0.12) * R},${330 + Math.sin(a + 0.12) * R} Z`} fill="#2f86e0" opacity={0.05} />;
					})}
				</g>
				<Frost x={-10} y={730} dir={-45} color="#cbe6fa" seed={3} />
				<Frost x={1290} y={-10} dir={135} color="#d6ecfc" seed={11} n={6} len={220} />
				<Flake x={672} y={600} r={34} color="#d3e9fa" rot={12} />
				<Flake x={560} y={672} r={20} color="#dcedfb" rot={30} w={4} />
				<Flake x={830} y={70} r={24} color="#d3e9fa" rot={20} w={4} />
				<Flake x={760} y={540} r={16} color="#dcedfb" rot={5} w={4} />
				{/* Чоби frozen into the ice up to the neck: you see his ribs through it */}
				<g filter="url(#cvz-stk)">
					<Choby x={CX} y={FY} s={s} jaw={0.32} look={[0, 0.08]} blink={0} tilt={-3} cold={1} frost={0.6} glassFrost={0} handFrost={1} armR={HUG} armL={HUG_L} f={7} />
					<rect x={CX - 226} y={iceTop} width={520} height={340} rx={42} fill="url(#cvz-ice)" stroke="#5aa6e0" strokeWidth={7} />
					{/* the ice: a lighter rim, highlights, cracks, little bubbles, snow on top */}
					<rect x={CX - 212} y={iceTop + 14} width={492} height={320} rx={32} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.6} />
					<path d={`M ${CX - 204},${iceTop + 40} L ${CX - 150},${iceTop + 30} L ${CX - 196},${iceTop + 170} Z`} fill="#ffffff" opacity={0.7} />
					<path d={`M ${CX - 128},${iceTop + 34} L ${CX - 104},${iceTop + 30} L ${CX - 150},${iceTop + 120} Z`} fill="#ffffff" opacity={0.5} />
					<path d={`M ${CX + 150},${iceTop + 26} l -22,44 l 20,24 l -30,56 M ${CX + 128},${iceTop + 70} l 30,10`} stroke="#ffffff" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />
					{[
						[CX - 120, iceTop + 210, 6],
						[CX - 96, iceTop + 236, 4],
						[CX + 120, iceTop + 190, 5],
						[CX + 150, iceTop + 228, 7],
						[CX + 40, iceTop + 250, 4],
					].map(([bx, by, br], i) => (
						<circle key={i} cx={bx} cy={by} r={br} fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.8} />
					))}
					<path
						d={`M ${CX - 230},${iceTop + 16} q 0,-22 26,-20 q 18,-14 40,-2 q 22,-16 46,0 q 20,-12 40,2 q 24,-14 46,2 q 18,-10 36,4 q 24,-16 48,0 q 22,-12 44,2 q 26,-14 50,4 q 22,-6 34,8 L ${CX + 280},${iceTop + 20} Z`}
						fill="#ffffff"
					/>
				</g>
			</svg>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<Title x={46} y={142} />
			</svg>
			{/* the chips: the body temperature falls */}
			<div style={{position: 'absolute', left: 46, top: 506, display: 'flex', alignItems: 'center', gap: 14, fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{background: RED, color: '#fff', fontSize: 46, padding: '8px 24px 10px', borderRadius: 16}}>36,6°</div>
				<svg width={70} height={40} viewBox="0 0 70 40">
					<path d="M 4,20 L 56,20 M 42,6 L 60,20 L 42,34" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
				<div style={{background: '#1e3a8a', color: '#fff', fontSize: 46, padding: '8px 24px 10px', borderRadius: 16}}>28°</div>
			</div>
		</AbsoluteFill>
	);
};

// ============================================================ B: night, the Titanic, the icy water =====
export const CoverZamerznutB: React.FC = () => {
	const HZ = 548;
	const CX = 1070;
	const s = 1.15;
	const FY = 940;
	const WL = 588; // the water line around him
	return (
		<AbsoluteFill style={{background: '#04060f', overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="cvb-glow" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#3a6ab0" stopOpacity={0.55} />
						<stop offset="1" stopColor="#3a6ab0" stopOpacity={0} />
					</radialGradient>
					<linearGradient id="cvb-near" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#163a6e" stopOpacity={0.94} />
						<stop offset="1" stopColor="#050c1c" stopOpacity={1} />
					</linearGradient>
				</defs>
				<NightSky id="cvb" hz={HZ} f={0} />
				{/* the Titanic going down by the bow, its lights still on */}
				<g transform={`translate(330,${HZ + 12}) scale(0.21) rotate(-8)`}>
					<Titanic lights={1} />
				</g>
				<Sea id="cvb" hz={HZ} f={0} />
				<ellipse cx={330} cy={HZ + 4} rx={220} ry={14} fill="#ffd98a" opacity={0.12} />
				{/* a cold light behind Чоби */}
				<circle cx={CX} cy={320} r={420} fill="url(#cvb-glow)" />
				{/* Чоби in the water up to his chest */}
				<Choby x={CX} y={FY} s={s} jaw={0.32} look={[0, 0.08]} blink={0} tilt={-3} cold={1} frost={0.6} glassFrost={0} armR={HUG} armL={HUG_L} f={7} />
				<rect x={-10} y={WL} width={1300} height={200} fill="url(#cvb-near)" />
				{/* ripples round him, the floes */}
				{[0, 1, 2].map((k) => (
					<ellipse key={k} cx={CX} cy={WL + 6 + k * 14} rx={190 + k * 70} ry={16 + k * 7} fill="none" stroke="#9fc4ee" strokeWidth={3 - k * 0.6} opacity={0.5 - k * 0.12} />
				))}
				{[
					[760, WL + 34, 1.1, -8],
					[1238, WL + 58, 0.8, 10],
					[880, WL + 96, 1.4, 4],
					[560, WL + 70, 0.9, -4],
				].map(([fx, fy, fs, fr], i) => (
					<g key={i} transform={`translate(${fx},${fy}) rotate(${fr}) scale(${fs})`}>
						<path d="M -64,0 L -50,-16 L 20,-22 L 66,-8 L 56,8 L -40,12 Z" fill="#e8f4ff" />
						<path d="M -64,0 L -40,12 L 56,8 L 66,-8 L 60,14 L -36,22 Z" fill="#9cc6ea" />
					</g>
				))}
				{/* the sticker: the water temperature */}
				<g transform={`translate(${CX - 252},${WL - 44}) rotate(-10)`}>
					<circle r={74} fill="#2f86e0" stroke="#ffffff" strokeWidth={8} />
					<text x={0} y={-10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#dff0ff">
						ВОДА
					</text>
					<text x={0} y={36} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#ffffff">
						−2°
					</text>
				</g>
			</svg>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<Title x={46} y={118} dark />
			</svg>
		</AbsoluteFill>
	);
};
