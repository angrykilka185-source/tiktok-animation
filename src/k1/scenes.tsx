// «Кнопка 13» — часть 1. 20 shots on the timeline of src/k1/timeline.ts (≈ the final edit,
// see scripts/fit-voiceover.py --part k1). New hero: the girl (Person kind="girl").
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Colors, Face, Head, Person} from '../components/Person';
import {Wallpaper} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';

const {YELLOW, RED, NIGHT, rnd} = G1;
const {Hall, Finale} = G2;

const MOM13: Colors = {hair: '#8a5a3a', top: '#7a6ab8', topDark: '#64579a', pants: '#f2c3a0', shoes: '#4a3a5a', skin: '#f2c3a0'};
const VITYA: Colors = {top: '#5b6b7a', topDark: '#4a5866', pants: '#2b2d33', shoes: '#1f2226', hair: '#a6a6a6', skin: '#e9b892'};
const GIRL_SKIN = '#f2c3a0';
const GIRL_SLEEVE = '#1a827c';

// ======================================================= scene pieces =====
// the neighbour, uncle Vitya: grey hair, a grey moustache, a flat cap
const Cap: React.FC<{x: number; hy: number; hw: number; hh: number}> = ({x, hy, hw, hh}) => (
	<g>
		<path d={`M ${x - 1.08 * hw},${hy - 0.42 * hh} C ${x - 1.12 * hw},${hy - 1.28 * hh} ${x + 1.12 * hw},${hy - 1.28 * hh} ${x + 1.08 * hw},${hy - 0.42 * hh} Z`} fill="#4a4f57" />
		<path d={`M ${x - 1.12 * hw},${hy - 0.42 * hh} Q ${x},${hy - 0.18 * hh} ${x + 1.12 * hw},${hy - 0.42 * hh} L ${x + 1.02 * hw},${hy - 0.52 * hh} Q ${x},${hy - 0.34 * hh} ${x - 1.02 * hw},${hy - 0.52 * hh} Z`} fill="#33373e" />
	</g>
);
const Moustache: React.FC<{x: number; hy: number; hw: number; hh: number}> = ({x, hy, hw, hh}) => (
	<path
		d={`M ${x - 0.66 * hw},${hy + 0.52 * hh} Q ${x - 0.32 * hw},${hy + 0.26 * hh} ${x},${hy + 0.4 * hh} Q ${x + 0.32 * hw},${hy + 0.26 * hh} ${x + 0.66 * hw},${hy + 0.52 * hh} Q ${x + 0.3 * hw},${hy + 0.6 * hh} ${x},${hy + 0.5 * hh} Q ${x - 0.3 * hw},${hy + 0.6 * hh} ${x - 0.66 * hw},${hy + 0.52 * hh} Z`}
		fill="#dcdcdc"
	/>
);
type Arm = {target: [number, number]; bend?: 1 | -1; ku?: number; kf?: number};
const Vitya: React.FC<{id: string; x: number; y: number; s: number; f: number; face: Face; armL?: Arm; armR?: Arm; walk?: number}> = (p) => {
	const hy = p.y - 1024.4 * p.s;
	return (
		<g>
			<Person kind="dad" id={p.id} colors={VITYA} x={p.x} y={p.y} scale={p.s} breathe={p.f} walk={p.walk} face={{stubble: false, blush: false, ...p.face}} armL={p.armL} armR={p.armR} />
			<Moustache x={p.x} hy={hy} hw={82 * p.s} hh={104 * p.s} />
			<Cap x={p.x} hy={hy} hw={82 * p.s} hh={104 * p.s} />
		</g>
	);
};
const VityaBust: React.FC<{id: string; x: number; y: number; s: number; face: Face; turn?: number}> = ({id, x, y, s, face, turn = 0}) => (
	<g>
		<Bust kind="dad" id={id} colors={VITYA} x={x} y={y} scale={s} turn={turn} face={{stubble: false, blush: false, ...face}} />
		<Moustache x={x + turn * 82 * s * 0.12} hy={y} hw={82 * s} hh={104 * s} />
		<Cap x={x} hy={y} hw={82 * s} hh={104 * s} />
	</g>
);

// the 12-storey block at dusk; floors get their numbers one by one, then your window lights up
const Building: React.FC<{count: number; you: number}> = ({count, you}) => {
	const X = 300;
	const W = 480;
	const top = 260;
	const fh = 96;
	const bottom = top + 12 * fh;
	return (
		<g>
			<defs>
				<linearGradient id="k1dusk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#24285e" />
					<stop offset="55%" stopColor="#7a5294" />
					<stop offset="100%" stopColor="#f0a25a" />
				</linearGradient>
			</defs>
			<rect x={-400} y={-400} width={1880} height={2100} fill="url(#k1dusk)" />
			{Array.from({length: 18}).map((_, k) => (
				<circle key={k} cx={-300 + rnd(k + 3) * 1700} cy={-300 + rnd(k + 30) * 700} r={2 + rnd(k) * 3} fill="#fff" opacity={0.7} />
			))}
			<rect x={-260} y={760} width={400} height={900} fill="#3a3562" />
			<rect x={920} y={860} width={460} height={800} fill="#3a3562" />
			{[-200, -80, 960, 1080, 1200].map((x, k) => (
				<rect key={x} x={x} y={820 + (k % 2) * 120} width={50} height={46} fill="#ffd98a" opacity={0.7} />
			))}
			<rect x={X} y={top - 30} width={W} height={12 * fh + 30} fill="#cfc8bb" />
			<rect x={X - 12} y={top - 44} width={W + 24} height={22} fill="#9a948a" />
			<rect x={X + 380} y={top - 140} width={8} height={100} fill="#555a60" />
			<path d={`M ${X + 352},${top - 120} L ${X + 416},${top - 120} M ${X + 360},${top - 100} L ${X + 408},${top - 100}`} stroke="#555a60" strokeWidth={6} />
			{Array.from({length: 12}).map((_, r) => {
				const floor = 12 - r;
				const y = top + r * fh;
				return (
					<g key={r}>
						<line x1={X} y1={y + fh} x2={X + W} y2={y + fh} stroke="#b4ad9f" strokeWidth={4} />
						{Array.from({length: 5}).map((__, c) => {
							const mine = floor === 12 && c === 2;
							const lit = mine ? you > 0 : rnd(r * 7 + c * 3 + 1) > 0.45;
							return <rect key={c} x={X + 26 + c * 90} y={y + 22} width={56} height={52} fill={mine && you > 0 ? '#fff1a8' : lit ? '#ffd98a' : '#4a5270'} />;
						})}
						{floor <= count && (
							<text x={X + W + 34} y={y + 64} fontSize={40} fontFamily={MONO} fontWeight={700} fill="#fff" opacity={0.9}>
								{floor}
							</text>
						)}
					</g>
				);
			})}
			{you > 0 && <rect x={X + 26 + 2 * 90 - 30} y={top - 8} width={116} height={112} rx={10} fill="none" stroke={YELLOW} strokeWidth={8} opacity={you} />}
			<rect x={X + 200} y={bottom - 80} width={80} height={80} fill="#5a4a3a" />
			<rect x={X + 190} y={bottom - 96} width={100} height={18} fill="#8a8478" />
			<rect x={-400} y={bottom} width={1880} height={700} fill="#2f3a34" />
		</g>
	);
};

// the lift button panel in close-up: 1-12 in two columns, the red «13» above them
const BTN = (n: number) => ({x: 430 + ((n - 1) % 2) * 220, y: 1340 - Math.floor((n - 1) / 2) * 150});
const B13 = {x: 540, y: 430};
const Panel: React.FC<{show13?: number; glow13?: number; lit?: number[]; print?: number}> = ({show13 = 1, glow13 = 0, lit = [], print = 0}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#8d939b" />
		{Array.from({length: 40}).map((_, k) => (
			<line key={k} x1={-400} y1={-400 + k * 70} x2={1480} y2={-380 + k * 70} stroke="#9aa0a8" strokeWidth={3} opacity={0.5} />
		))}
		<rect x={300} y={290} width={480} height={1380} rx={30} fill="#c9ced6" stroke="#737a84" strokeWidth={8} />
		{[
			[330, 320],
			[750, 320],
			[330, 1640],
			[750, 1640],
		].map(([x, y]) => (
			<circle key={`${x}${y}`} cx={x} cy={y} r={10} fill="#8a9099" />
		))}
		{Array.from({length: 12}, (_, k) => k + 1).map((n) => {
			const b = BTN(n);
			const on = lit.includes(n);
			return (
				<g key={n}>
					{on && <circle cx={b.x} cy={b.y} r={84} fill="#ffb02e" opacity={0.25} />}
					<circle cx={b.x} cy={b.y} r={62} fill="#eef0f3" stroke={on ? '#ffb02e' : '#8a9099'} strokeWidth={on ? 12 : 6} />
					<text x={b.x} y={b.y + 20} fontSize={56} fontFamily={HEAVY} fontWeight={900} fill={on ? '#e07a00' : '#3a3f47'} textAnchor="middle">
						{n}
					</text>
				</g>
			);
		})}
		{show13 > 0.01 && (
			<g transform={`translate(${B13.x},${B13.y}) scale(${show13})`}>
				{glow13 > 0 && <circle r={150} fill="#ff4a3d" opacity={0.22 * glow13} />}
				<circle r={68} fill="#d63b2f" stroke="#7a1a12" strokeWidth={9} />
				<path d="M -40,-30 L 10,-48 M -50,10 L 30,-20 M -20,44 L 46,14 M 20,-56 L 50,-40" stroke="#f2a89e" strokeWidth={3} opacity={0.8} />
				<text y={22} fontSize={64} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
					13
				</text>
				{print > 0 && (
					<g stroke="#ffd2c8" strokeWidth={2.5} fill="none" opacity={0.75 * print}>
						{[10, 18, 26, 34].map((r) => (
							<path key={r} d={`M ${-r},6 A ${r},${r * 1.2} 0 0 1 ${r},6`} />
						))}
					</g>
				)}
			</g>
		)}
	</g>
);

// your finger (teal sleeve) coming in from the lower right towards (x, y) on the screen
const Finger: React.FC<{x: number; y: number; s?: number; press?: number}> = ({x, y, s = 1, press = 0}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s * (1 - 0.06 * press)}) rotate(-28deg)`, transformOrigin: '0 0'}}>
		<div style={{position: 'absolute', left: -38, top: -20, width: 76, height: 300, borderRadius: 38, background: GIRL_SKIN, boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.08)'}} />
		<div style={{position: 'absolute', left: -96, top: 220, width: 200, height: 260, borderRadius: 70, background: GIRL_SKIN}} />
		<div style={{position: 'absolute', left: -140, top: 400, width: 280, height: 700, borderRadius: 90, background: GIRL_SLEEVE}} />
	</div>
);

// inside the lift seen from its doors: wood back wall with a mirror, side walls, the button panel by the camera
const Cabin: React.FC<{light?: number; lit?: number[]; glow13?: number}> = ({light = 1, lit = [], glow13 = 0}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#2a2420" />
		<path d="M -400,-400 L 200,250 L 200,1500 L -400,2400 Z" fill="#a8855c" />
		<path d="M 1480,-400 L 880,250 L 880,1500 L 1480,2400 Z" fill="#9c7a52" />
		<path d="M -400,-400 L 1480,-400 L 880,250 L 200,250 Z" fill="#d8d4cc" />
		<rect x={360} y={120} width={360} height={60} rx={10} fill={light > 0.5 ? '#fffbe6' : '#8a887e'} transform="skewX(0)" />
		<rect x={200} y={250} width={680} height={1250} fill="#b89a74" />
		{Array.from({length: 8}).map((_, k) => (
			<line key={k} x1={200 + k * 85} y1={250} x2={200 + k * 85} y2={1500} stroke="#a5865f" strokeWidth={4} />
		))}
		<rect x={330} y={380} width={420} height={560} rx={8} fill="#cfdfe6" stroke="#8a8f96" strokeWidth={10} />
		<path d="M 380,880 L 520,420 M 470,900 L 640,420" stroke="#fff" strokeWidth={16} opacity={0.35} />
		<rect x={200} y={1180} width={680} height={20} fill="#8a6a46" />
		<path d="M 200,1500 L 880,1500 L 1480,2400 L -400,2400 Z" fill="#4a4440" />
		{Array.from({length: 30}).map((_, k) => (
			<circle key={k} cx={rnd(k + 5) * 1080} cy={1560 + rnd(k + 9) * 700} r={6} fill="#5a524c" />
		))}
		{/* the panel on the right wall, near the camera */}
		<path d="M 960,560 L 1060,520 L 1060,1360 L 960,1300 Z" fill="#c9ced6" stroke="#737a84" strokeWidth={6} />
		{Array.from({length: 12}).map((_, k) => {
			const n = k + 1;
			const cx = 985 + (k % 2) * 45;
			const cy = 1220 - Math.floor(k / 2) * 100;
			return <circle key={k} cx={cx} cy={cy} r={14} fill={lit.includes(n) ? '#ffb02e' : '#eef0f3'} stroke="#8a9099" strokeWidth={3} />;
		})}
		{glow13 > 0 && <circle cx={1008} cy={600} r={46} fill="#ff4a3d" opacity={0.3 * glow13} />}
		<circle cx={1008} cy={600} r={17} fill="#d63b2f" stroke="#7a1a12" strokeWidth={3} />
		{light < 1 && <rect x={-400} y={-400} width={1880} height={2800} fill="#04060c" opacity={0.7 * (1 - light)} />}
	</g>
);

// your floor's landing (full frame). mirror = the 13th floor: everything the other way round, the door says «84»
const Floor: React.FC<{mirror?: boolean; num?: string; sneaker?: boolean; dark?: number}> = ({mirror = false, num = '48', sneaker = false, dark = 0}) => {
	const DX = mirror ? 1080 - 760 : 760; // door centre on the screen
	const D0 = 760; // door centre before the mirror
	return (
		<g>
			<g transform={mirror ? 'translate(1080,0) scale(-1,1)' : undefined}>
				<rect x={-400} y={-400} width={1880} height={1620} fill="#e8e2d0" />
				<rect x={-400} y={1060} width={1880} height={420} fill="#6a9a8a" />
				<rect x={-400} y={1052} width={1880} height={12} fill="#527e70" />
				{/* checkered floor */}
				<rect x={-400} y={1480} width={1880} height={1100} fill="#c9b79a" />
				{Array.from({length: 7}).flatMap((_, r) =>
					Array.from({length: 16}).map((__, c) => {
						const y0 = 1480 + r * r * 22 + r * 40;
						const h = 40 + (2 * r + 1) * 22;
						const w = 120 + r * 26;
						const x0 = 540 - 8 * w + c * w;
						return (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={x0} y={y0} width={w} height={h} fill="#8a6a4a" /> : null;
					}),
				)}
				{/* window with the flower */}
				<rect x={70} y={420} width={380} height={520} fill="#9fc3e0" />
				<rect x={70} y={420} width={380} height={520} fill="none" stroke="#f4f1ea" strokeWidth={18} />
				<rect x={252} y={420} width={16} height={520} fill="#f4f1ea" />
				<rect x={40} y={930} width={440} height={30} fill="#f4f1ea" />
				<path d="M 300,930 L 312,860 L 368,860 L 380,930 Z" fill="#c4632f" />
				<path d="M 340,860 Q 300,780 320,720 M 340,860 Q 350,770 390,730 M 340,860 Q 330,790 350,700" stroke="#3f8a3a" strokeWidth={10} fill="none" />
				{[
					[320, 712],
					[392, 724],
					[352, 690],
				].map(([x, y]) => (
					<circle key={`${x}`} cx={x} cy={y} r={22} fill="#e04a4a" />
				))}
				{/* your door */}
				<rect x={D0 - 170} y={520} width={340} height={960} fill="#4a2e22" />
				<rect x={D0 - 154} y={536} width={308} height={944} fill="#7a4a36" />
				{Array.from({length: 5}).flatMap((_, cx) =>
					Array.from({length: 10}).map((__, cy) => <circle key={`${cx}-${cy}`} cx={D0 - 120 + cx * 60} cy={600 + cy * 86} r={6} fill="#5a3426" />),
				)}
				<circle cx={D0} cy={640} r={10} fill="#2a1d14" />
				<rect x={D0 - 134} y={1000} width={44} height={14} rx={7} fill="#c9b37a" />
				<rect x={D0 - 190} y={1478} width={380} height={40} rx={8} fill="#5a3a3a" />
			</g>
			{/* the number plate is never mirrored: «48» here, «84» upstairs */}
			<ellipse cx={DX} cy={760} rx={56} ry={34} fill="#d9c27a" stroke="#8a6a2a" strokeWidth={4} />
			<text x={DX} y={776} fontSize={42} fontFamily={HEAVY} fontWeight={900} fill="#3a2a1a" textAnchor="middle">
				{num}
			</text>
			{sneaker && <Sneaker x={DX - 60} y={1500} s={0.55} />}
			{dark > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill="#04060c" opacity={dark} />}
		</g>
	);
};

// your lost sneaker: white, a teal stripe; (x, y) = sole bottom left
const Sneaker: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M 0,0 L 0,-60 Q 10,-150 90,-150 L 140,-150 Q 160,-110 200,-100 L 280,-80 Q 330,-66 330,-20 L 330,0 Z" fill="#f4f4f2" stroke="#c9c9c4" strokeWidth={5} />
		<rect x={-4} y={-22} width={338} height={22} rx={8} fill="#d9d9d4" />
		<path d="M 60,-90 Q 140,-70 250,-60" stroke="#21a19a" strokeWidth={16} fill="none" strokeLinecap="round" />
		<path d="M 110,-140 L 170,-110 M 130,-150 L 190,-118 M 150,-156 L 205,-125" stroke="#9aa0a8" strokeWidth={5} />
	</g>
);

// looking out of the lift: the cabin around the door opening, the doors slide apart by `open`
const CabinPOV: React.FC<{id: string; open: number; floor: string; children: React.ReactNode; light?: number}> = ({id, open, floor, children, light = 1}) => {
	const o = Math.max(0, Math.min(1, open));
	return (
		<g>
			<defs>
				<clipPath id={`${id}op`}>
					<rect x={300} y={400} width={480} height={1160} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}op)`}>
				<g transform="translate(540,980) scale(0.5) translate(-540,-960)">{children}</g>
				<rect x={300 - 240 * o} y={400} width={240} height={1160} fill="#a7adb5" stroke="#7d838b" strokeWidth={4} />
				<rect x={540 + 240 * o} y={400} width={240} height={1160} fill="#a7adb5" stroke="#7d838b" strokeWidth={4} />
			</g>
			<path d="M -400,-400 L 1480,-400 L 1480,2400 L -400,2400 Z M 300,400 L 300,1560 L 780,1560 L 780,400 Z" fill="#b89a74" fillRule="evenodd" />
			<path d="M -400,-400 L 300,400 L 300,1560 L -400,2400 Z" fill="#a8855c" />
			<path d="M 1480,-400 L 780,400 L 780,1560 L 1480,2400 Z" fill="#9c7a52" />
			<path d="M -400,2400 L 300,1560 L 780,1560 L 1480,2400 Z" fill="#4a4440" />
			<rect x={286} y={386} width={508} height={1188} fill="none" stroke="#8a9099" strokeWidth={14} />
			<rect x={455} y={262} width={170} height={96} rx={8} fill="#0d0f13" stroke="#5d636b" strokeWidth={6} />
			<text x={540} y={336} fontSize={72} fontFamily={MONO} fontWeight={700} fill="#ff3b30" textAnchor="middle" style={{filter: 'drop-shadow(0 0 10px rgba(255,59,48,0.8))'}}>
				{floor}
			</text>
			{light < 1 && <rect x={-400} y={-400} width={1880} height={2800} fill="#04060c" opacity={0.7 * (1 - light)} />}
		</g>
	);
};

// big red floor display (LED), the arrow blinks while the lift moves
const Display: React.FC<{text: string; f: number; moving?: boolean; hot?: number; frame?: 'cabin' | 'landing'}> = ({text, f, moving = false, hot = 0, frame = 'cabin'}) => (
	<AbsoluteFill style={{background: frame === 'cabin' ? 'radial-gradient(circle at 50% 45%, #6a5a48 0%, #1d1812 75%)' : 'radial-gradient(circle at 50% 45%, #3a4048 0%, #08090c 75%)'}}>
		<div style={{position: 'absolute', left: 190, top: 540, width: 700, height: 420, borderRadius: 30, background: '#0b0c0f', border: '14px solid #7d838b', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
			<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 120, color: '#ff3b30', opacity: moving && Math.floor(f / 8) % 2 === 0 ? 1 : moving ? 0.25 : 0.15}}>▲</div>
			<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 280, lineHeight: 1, color: '#ff3b30', textShadow: `0 0 ${24 + 30 * hot}px rgba(255,59,48,${0.8 + 0.2 * hot})`, transform: `scale(${1 + 0.06 * hot})`}}>{text}</div>
		</div>
	</AbsoluteFill>
);

// your door on the 13th floor in close-up: quilted leatherette, the number plate, the handle, the doormat
const DoorClose: React.FC<{num: string; handle?: number; sneaker?: boolean; flip?: number}> = ({num, handle = 0, sneaker = false, flip = 1}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#e8e2d0" />
		<rect x={-400} y={1500} width={1880} height={1000} fill="#c9b79a" />
		<rect x={130} y={-400} width={820} height={1900} fill="#4a2e22" />
		<rect x={160} y={-380} width={760} height={1880} fill="#7a4a36" />
		{Array.from({length: 6}).flatMap((_, cx) =>
			Array.from({length: 12}).map((__, cy) => <circle key={`${cx}-${cy}`} cx={220 + cx * 128} cy={-320 + cy * 150} r={10} fill="#5a3426" />),
		)}
		<g transform={`translate(540,330) scale(${flip},1)`}>
			<ellipse rx={150} ry={92} fill="#d9c27a" stroke="#8a6a2a" strokeWidth={8} />
			<text y={40} fontSize={120} fontFamily={HEAVY} fontWeight={900} fill="#3a2a1a" textAnchor="middle">
				{num}
			</text>
		</g>
		<circle cx={540} cy={560} r={20} fill="#2a1d14" stroke="#c9b37a" strokeWidth={6} />
		<g transform={`translate(800,980) rotate(${32 * handle})`}>
			<circle r={34} fill="#c9b37a" />
			<rect x={-150} y={-16} width={160} height={32} rx={16} fill="#d9c27a" stroke="#8a6a2a" strokeWidth={4} />
		</g>
		<rect x={784} y={1060} width={32} height={60} rx={8} fill="#c9b37a" />
		<rect x={80} y={1500} width={920} height={110} rx={14} fill="#5a3a3a" />
		<rect x={100} y={1520} width={880} height={70} rx={10} fill="none" stroke="#6e4a4a" strokeWidth={6} strokeDasharray="20 14" />
		{sneaker && <Sneaker x={330} y={1540} s={1.0} />}
	</g>
);

// your room; bed = which wall the bed stands at
const GirlRoom: React.FC<{id: string; bed: 'left' | 'right'; night?: number}> = ({id, bed, night = 0}) => {
	const bx = bed === 'left' ? -80 : 640;
	return (
		<g>
			<Wallpaper id={`${id}wp`} x={-400} y={-400} w={1880} h={1900} base="#e6dcef" line="#d8cbe4" />
			<rect x={-400} y={1440} width={1880} height={30} fill="#9a7a9a" />
			<rect x={-400} y={1470} width={1880} height={1000} fill="#b98a62" />
			{Array.from({length: 9}).map((_, k) => (
				<line key={k} x1={-400 + k * 240} y1={1470} x2={-600 + k * 300} y2={2470} stroke="#a77a54" strokeWidth={5} />
			))}
			{/* window */}
			<rect x={380} y={420} width={320} height={420} fill={night > 0.5 ? '#16204a' : '#a8d0ec'} />
			<rect x={380} y={420} width={320} height={420} fill="none" stroke="#fff" strokeWidth={16} />
			<rect x={532} y={420} width={16} height={420} fill="#fff" />
			{night > 0.5 && <circle cx={640} cy={500} r={34} fill="#fff6d0" />}
			<path d="M 360,400 Q 330,640 350,880 L 400,880 Q 380,640 410,400 Z" fill="#f0a2b8" />
			<path d="M 720,400 Q 750,640 730,880 L 680,880 Q 700,640 670,400 Z" fill="#f0a2b8" />
			{/* poster and desk on the wall opposite the bed */}
			<g transform={bed === 'left' ? 'translate(0,0)' : 'translate(-640,0)'}>
				<rect x={800} y={520} width={190} height={250} rx={6} fill="#fff" stroke="#c9b9d9" strokeWidth={6} />
				<circle cx={895} cy={620} r={60} fill="#f2a65a" />
				<path d="M 850,580 L 870,540 L 890,580 M 900,580 L 920,540 L 940,580" fill="#f2a65a" />
				<rect x={770} y={1120} width={300} height={24} fill="#a8775a" />
				<rect x={790} y={1144} width={20} height={330} fill="#8a5f46" />
				<rect x={1030} y={1144} width={20} height={330} fill="#8a5f46" />
				<rect x={940} y={1040} width={14} height={80} fill="#555" />
				<path d="M 905,1040 L 990,1040 L 970,990 L 925,990 Z" fill="#21a19a" />
			</g>
			{/* the bed */}
			<g transform={`translate(${bx},0)`}>
				<rect x={0} y={1180} width={520} height={60} rx={10} fill="#a8775a" />
				<rect x={0} y={1060} width={40} height={420} rx={8} fill="#8a5f46" />
				<rect x={480} y={1140} width={40} height={340} rx={8} fill="#8a5f46" />
				<rect x={30} y={1120} width={470} height={80} rx={20} fill="#21a19a" />
				<rect x={50} y={1090} width={140} height={60} rx={24} fill="#fff" />
				<path d="M 200,1120 Q 330,1100 500,1130 L 500,1200 L 200,1200 Z" fill="#1a827c" />
			</g>
			{night > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.62 * night} />}
		</g>
	);
};

// the block cut open: 13th floor above (you at door 84), 12th below (mom at the stove)
const CrossSection: React.FC<{t: number}> = ({t}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#1d2140" />
		{/* floor 13 */}
		<rect x={80} y={300} width={920} height={560} fill="#e8e2d0" />
		<rect x={80} y={690} width={920} height={170} fill="#6a9a8a" />
		<rect x={600} y={420} width={200} height={440} fill="#7a4a36" />
		<text x={700} y={500} fontSize={44} fontFamily={HEAVY} fontWeight={900} fill="#d9c27a" textAnchor="middle">
			84
		</text>
		<Person kind="girl" id="k1cs1" x={420} y={860} scale={0.5} breathe={t} face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0.8, 0]}} />
		{/* slab */}
		<rect x={60} y={860} width={960} height={50} fill="#8a8478" />
		{/* floor 12: the kitchen */}
		<rect x={80} y={910} width={920} height={560} fill="#f2e6c8" />
		<rect x={600} y={1240} width={300} height={230} fill="#d9d4cc" />
		<rect x={610} y={1220} width={280} height={24} fill="#3a3f47" />
		<ellipse cx={700} cy={1210} rx={60} ry={14} fill="#5a5f66" />
		<Person kind="mom" id="k1cs2" colors={MOM13} x={520} y={1470} scale={0.5} breathe={t} face={{eyes: 'happy', mouth: 'smile', look: [0.8, 0]}} armR={{target: [200, -420], bend: -1}} />
		<rect x={60} y={1470} width={960} height={50} fill="#8a8478" />
		{/* labels */}
		{[
			['13', 340],
			['12', 950],
		].map(([n, y]) => (
			<g key={n}>
				<rect x={100} y={Number(y)} width={110} height={70} rx={10} fill="#0b0c0f" />
				<text x={155} y={Number(y) + 54} fontSize={52} fontFamily={MONO} fontWeight={700} fill="#ff3b30" textAnchor="middle">
					{n}
				</text>
			</g>
		))}
	</g>
);

const TitleCard: React.FC<{t: number}> = ({t}) => {
	const a = pop(t, 2, 10);
	const b = pop(t, 10, 9);
	const c = pop(t, 20, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #4a1414 0%, #1a0808 60%, #070303 100%)'}}>
			<div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 12, color: YELLOW, opacity: a}}>НОВЫЙ СЕРИАЛ</div>
				<div style={{fontSize: 150, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${a})`}}>КНОПКА</div>
				<div style={{display: 'inline-flex', marginTop: 20, width: 300, height: 300, borderRadius: 150, background: '#d63b2f', border: '16px solid #7a1a12', alignItems: 'center', justifyContent: 'center', fontSize: 170, color: '#fff', transform: `scale(${b})`, boxShadow: '0 0 80px rgba(255,74,61,0.55)', boxSizing: 'border-box'}}>13</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 36, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 36px', fontSize: 48, transform: `scale(${c})`}}>ЧАСТЬ 1</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ============================================================== SHOTS =======
// 1. Your block has twelve floors. You live on the top one.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const count = Math.floor(interpolate(f, [18, 52], [0, 12], clamp));
	const you = interpolate(f, [70, 78], [0, 1], clamp);
	const c: Cam = {s: lerp(f, 0, 108, 0.92, 1.3, Easing.inOut(Easing.cubic)), cx: 560, cy: lerp(f, 0, 108, 900, 420, Easing.inOut(Easing.cubic))};
	const p = toScreen(c, 300 + 26 + 2 * 90 + 28, 260 - 8);
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0.2, vignette: 0.55}} bg="#24285e">
				<Building count={count} you={you} />
			</Stage>
			{you > 0 && (
				<div style={{position: 'absolute', left: p.x, top: p.y - 20, transform: `translate(-50%,-100%) scale(${pop(f, 72, 10)})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{background: YELLOW, color: '#111', fontFamily: HEAVY, fontWeight: 900, fontSize: 52, borderRadius: 16, padding: '4px 26px'}}>ТЫ</div>
					<div style={{width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: `24px solid ${YELLOW}`}} />
				</div>
			)}
		</AbsoluteFill>
	);
};

// 2. But today button 13 appeared in the lift → title card.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [96]);
	if (i === 1) return <TitleCard t={t} />;
	const show = pop(t, 70, 9);
	const [sx, sy] = shake(t, 70, 14, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 96, 1.0, 1.1) * kick(t) * (t >= 70 ? kick(t - 70, 0.06) : 1), cx: 540 + sx, cy: 860 + sy}} light={{glow: 0.2, vignette: 0.6}} bg="#8d939b">
			<Panel show13={show} glow13={t >= 70 ? 0.6 + 0.4 * Math.sin(t / 3) : 0} />
		</Stage>
	);
};

// 3. Red, scratched — and warm, as if somebody just pressed it.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const c: Cam = {s: lerp(f, 0, 147, 2.6, 3.0), cx: 540, cy: 440};
	const touch = lerp(f, 46, 62, 0, 1, Easing.out(Easing.cubic)) * (1 - lerp(f, 84, 100, 0, 1));
	const b = toScreen(c, B13.x, B13.y);
	const heat = f >= 62;
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0.2, vignette: 0.7}} bg="#8d939b">
				<Panel glow13={heat ? 0.5 + 0.3 * Math.sin(f / 4) : 0.2} print={interpolate(f, [96, 108], [0, 1], clamp)} />
			</Stage>
			{touch > 0.01 && <Finger x={b.x + 30 + 300 * (1 - touch)} y={b.y + 20 + 420 * (1 - touch)} s={1.5} press={touch > 0.95 ? 1 : 0} />}
			{heat && (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{[0, 1, 2].map((k) => {
						const p = ((f - 62 + k * 12) % 36) / 36;
						return <path key={k} d={`M ${b.x - 120 + k * 120},${b.y - 160 - 200 * p} q -24,-40 0,-80 q 24,-40 0,-80`} stroke="#ff8a3d" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.8 * (1 - p)} />;
					})}
				</svg>
			)}
		</AbsoluteFill>
	);
};

// 4. Uncle Vitya, the neighbour, comes into the lift and presses «1».
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const walk = lerp(f, 4, 36, 0, 1, Easing.out(Easing.quad));
	const vx = 1250 + (760 - 1250) * walk;
	const press = lerp(f, 74, 84, 0, 1, Easing.out(Easing.cubic)) * (1 - lerp(f, 96, 108, 0, 1));
	const c: Cam = {s: lerp(f, 0, 117, 1.0, 1.04) * kick(f), cx: 540, cy: 960};
	const tag = pop(f, 46, 11);
	const head = toScreen(c, vx, 1600 - 1024 * 0.95);
	return (
		<AbsoluteFill>
			<Stage cam={c} light={{glow: 0.3, vignette: 0.55}} bg="#2a2420">
				<Cabin lit={f >= 84 ? [1] : []} glow13={0.4} />
				<Person kind="girl" id="k1s4g" x={360} y={1580} scale={1.0} breathe={f} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.7, 0]}} />
				<Vitya id="k1s4v" x={vx} y={1600} s={0.95} f={f} walk={walk < 1 ? f * 0.4 : undefined} face={{eyes: 'narrow', mouth: 'flat', brows: 'flat', look: [0.6, 0.1]}} armR={press > 0 ? {target: [200 + 120 * press, -800 - 60 * press], bend: -1} : undefined} />
			</Stage>
			{tag > 0.01 && (
				<div style={{position: 'absolute', left: head.x, top: head.y - 150, transform: `translate(-50%,-100%) scale(${tag})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{background: '#fff', border: '6px solid #5b6b7a', color: '#2a3440', fontFamily: HEAVY, fontWeight: 900, fontSize: 48, borderRadius: 16, padding: '4px 24px', whiteSpace: 'nowrap'}}>ДЯДЯ ВИТЯ</div>
					<div style={{width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: '24px solid #5b6b7a'}} />
				</div>
			)}
		</AbsoluteFill>
	);
};

// 5. You point at the button. He looks right at it: «Какая кнопка? Их тут двенадцать».
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const point = lerp(t, 2, 16, 0, 1, Easing.out(Easing.cubic));
		const c: Cam = {s: 1.7 * kick(t), cx: 560, cy: 600};
		const b = toScreen(c, B13.x, B13.y);
		return (
			<AbsoluteFill>
				<Stage cam={c} light={{glow: 0.2, vignette: 0.7}} bg="#8d939b">
					<Panel lit={[1]} glow13={0.6 + 0.3 * Math.sin(t / 3)} />
				</Stage>
				<Finger x={b.x + 110 + 300 * (1 - point)} y={b.y + 120 + 420 * (1 - point)} s={1.1} />
			</AbsoluteFill>
		);
	}
	// his face, the glowing button right in front of him — he does not see it
	const look = t < 46 ? [0.9, -0.2] : [-0.5, 0];
	const talk = t >= 46 && t < 90 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 109, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.6}} bg="#2a2420">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#b89a74" />
			{Array.from({length: 14}).map((_, k) => (
				<line key={k} x1={-400 + k * 140} y1={-400} x2={-400 + k * 140} y2={2400} stroke="#a5865f" strokeWidth={6} />
			))}
			<g transform="translate(840,620) scale(1.3)">
				<circle r={150} fill="#ff4a3d" opacity={0.18 + 0.1 * Math.sin(t / 3)} />
				<circle r={66} fill="#d63b2f" stroke="#7a1a12" strokeWidth={9} />
				<text y={22} fontSize={64} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
					13
				</text>
			</g>
			<VityaBust id="k1s5b" x={470} y={1100} s={4.2} turn={t < 46 ? 0.6 : 0} face={{eyes: t < 46 ? 'open' : 'narrow', brows: t < 46 ? 'neutral' : 'raised', mouth: talk ? 'o' : 'flat', look: look as [number, number]}} />
		</Stage>
	);
};

// 6. In the evening mom sends you for bread → alone in the lift with the button.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [66]);
	if (i === 0) {
		const talk = t >= 2 && t < 54 && Math.floor(t / 4) % 2 === 0;
		return (
			<Stage cam={{s: lerp(t, 0, 66, 1.0, 1.05) * kick(t), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.55}} bg="#cdb88f">
				<Hall id="k1s6h" noBag />
				<Person kind="mom" id="k1s6m" colors={MOM13} x={780} y={1560} scale={1.0} breathe={t} face={{eyes: 'happy', mouth: talk ? 'o' : 'smile', brows: 'neutral', look: [-0.8, 0.1]}} armL={{target: [-300, -560], bend: 1}} />
				<g transform={`translate(${780 - 300},${1560 - 560})`}>
					<rect x={-40} y={-30} width={80} height={46} rx={6} fill="#9ac27a" stroke="#6a8a4a" strokeWidth={4} />
					<text y={6} fontSize={22} fontFamily={HEAVY} fontWeight={900} fill="#3a5a2a" textAnchor="middle">
						100
					</text>
				</g>
				<Person kind="girl" id="k1s6g" x={380} y={1560} scale={1.0} breathe={t} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.8, 0]}} />
			</Stage>
		);
	}
	const glow = 0.6 + 0.4 * Math.sin(t / 4);
	return (
		<Stage cam={{s: lerp(t, 0, 75, 1.05, 1.3, Easing.inOut(Easing.cubic)) * kick(t), cx: lerp(t, 0, 75, 540, 820), cy: lerp(t, 0, 75, 1000, 860)}} light={{glow: 0.2, vignette: 0.7}} bg="#2a2420">
			<Cabin light={0.75} glow13={glow} />
			<Person kind="girl" id="k1s6g2" x={560} y={1580} scale={1.0} breathe={t} face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [0.9, -0.5]}} />
		</Stage>
	);
};

// 7. Your finger reaches for 13 on its own. Click.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const c: Cam = {s: 1.6 * kick(f), cx: 560, cy: 560};
	const reach = lerp(f, 0, 44, 0, 1, Easing.inOut(Easing.cubic));
	const pressed = f >= 46;
	const b = toScreen(c, B13.x, B13.y);
	const [sx, sy] = shake(f, 46, 10, 8);
	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<Stage cam={c} light={{glow: 0.2, vignette: 0.7}} bg="#8d939b">
				<Panel glow13={pressed ? 1 : 0.5 + 0.3 * Math.sin(f / 3)} lit={pressed ? [13] : []} />
				{pressed && <circle cx={B13.x} cy={B13.y} r={100} fill="none" stroke="#ffb02e" strokeWidth={14} opacity={1 - Math.min(1, (f - 46) / 14)} />}
			</Stage>
			<Finger x={b.x + 30 + 380 * (1 - reach)} y={b.y + 20 + 560 * (1 - reach)} s={1.1} press={pressed ? 1 : 0} />
			{pressed && (
				<div style={{position: 'absolute', left: 300, top: 300, transform: `translate(-50%,-50%) scale(${pop(f, 46, 8)}) rotate(-10deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: '#fff', textShadow: '0 6px 0 #000, 0 0 20px rgba(0,0,0,0.6)'}}>ЩЁЛК</div>
			)}
		</AbsoluteFill>
	);
};

// 8. The lift goes up. Longer than usual. On the display: 12… and 13.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [86]);
	if (i === 0) {
		const light = Math.floor(t / 3) % 9 === 4 ? 0.3 : 1;
		const [sx, sy] = [Math.sin(t * 1.7) * 3, Math.cos(t * 2.3) * 3];
		return (
			<Stage cam={{s: lerp(t, 0, 86, 1.0, 1.12) * kick(t), cx: 540 + sx, cy: 960 + sy}} light={{glow: 0.2, vignette: 0.7}} bg="#2a2420">
				<Cabin light={light} lit={[13]} glow13={1} />
				<Person kind="girl" id="k1s8g" x={540} y={1580} scale={1.0} breathe={t} face={{eyes: 'wide', mouth: 'flat', brows: 'worried', look: [0, -0.9]}} armL={{target: [-80, -420], bend: 1, ku: 0.7, kf: 0.7}} armR={{target: [80, -420], bend: -1, ku: 0.7, kf: 0.7}} />
			</Stage>
		);
	}
	const text = t < 18 ? '11' : t < 46 ? '12' : '13';
	const hot = t >= 46 ? Math.max(0, 1 - (t - 46) / 20) : 0;
	const glitch = t >= 46 && t < 54;
	return (
		<AbsoluteFill style={{transform: glitch ? `translateX(${(rnd(t) - 0.5) * 30}px)` : undefined}}>
			<Display text={text} f={t} moving hot={hot} />
			{glitch && <AbsoluteFill style={{background: '#ff2a1f', opacity: 0.15}} />}
		</AbsoluteFill>
	);
};

// 9. The doors open. It is your floor. The same tiles, the same flower on the windowsill.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [110]);
	if (i === 0) {
		const open = lerp(t, 4, 34, 0, 1, Easing.inOut(Easing.cubic));
		return (
			<Stage cam={{s: lerp(t, 0, 110, 1.0, 1.25, Easing.inOut(Easing.cubic)) * kick(t), cx: 540, cy: 980}} light={{glow: 0.2, vignette: 0.6}} bg="#2a2420">
				<CabinPOV id="k1s9" open={open} floor="13">
					<Floor mirror num="84" />
				</CabinPOV>
			</Stage>
		);
	}
	// stepping out: the tiles, then the flower on the window (the window is on the right — the other way round)
	const pan = lerp(t, 0, 85, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<Stage cam={{s: 1.0 + 0.6 * pan, cx: 540 + (800 - 540) * pan, cy: 1500 + (740 - 1500) * pan}} light={{glow: 0.2, vignette: 0.6}} bg="#e8e2d0">
			<Floor mirror num="84" />
		</Stage>
	);
};

// 10. Only everything is the other way round: the window on the other side, and the door says not 48 but 84.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [82]);
	if (i === 0) {
		// your real floor flips over into the 13th
		const flip = lerp(t, 26, 46, 1, -1, Easing.inOut(Easing.cubic));
		const mirror = flip < 0;
		return (
			<AbsoluteFill>
				<AbsoluteFill style={{transform: `scaleX(${Math.abs(flip) < 0.02 ? 0.02 : Math.abs(flip)})`}}>
					<Stage cam={{s: 0.75 * kick(t), cx: 540, cy: 1000}} light={{glow: 0.2, vignette: 0.6}} bg="#e8e2d0">
						<Floor mirror={mirror} num={mirror ? '84' : '48'} />
					</Stage>
				</AbsoluteFill>
				<div style={{position: 'absolute', left: 40, top: 290, background: '#111', border: `5px solid ${mirror ? RED : YELLOW}`, borderRadius: 14, padding: '8px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#fff'}}>{mirror ? '13 ЭТАЖ' : '12 ЭТАЖ'}</div>
			</AbsoluteFill>
		);
	}
	const flip = t < 62 ? 1 : t < 70 ? Math.cos(((t - 62) / 8) * Math.PI) : -1;
	const num = t < 66 ? '48' : '84';
	return (
		<Stage cam={{s: lerp(t, 0, 110, 1.0, 1.15) * kick(t) * (t >= 66 ? kick(t - 66, 0.06) : 1), cx: 540, cy: 520}} light={{glow: 0.2, vignette: 0.65}} bg="#7a4a36">
			<DoorClose num={num} flip={Math.abs(flip) < 0.05 ? 0.05 : flip < 0 ? 1 : flip} />
		</Stage>
	);
};

// 11. On the doormat: a sneaker. Yours. The one that went missing a month ago.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const stamp = pop(f, 76, 9);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 129, 1.4, 1.6) * kick(f) * (f >= 56 ? kick(f - 56, 0.05) : 1), cx: 540, cy: 1460}} light={{glow: 0.2, vignette: 0.65}} bg="#c9b79a">
				<DoorClose num="84" sneaker />
			</Stage>
			{stamp > 0.01 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * -16 - 4}deg)`, opacity: Math.min(1, stamp * 2)}}>
					<div style={{background: 'rgba(14,14,16,0.92)', border: `7px solid ${RED}`, borderRadius: 22, padding: '12px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, color: '#fff', textAlign: 'center'}}>
						ПРОПАЛ
						<div style={{fontSize: 34, color: RED}}>МЕСЯЦ НАЗАД</div>
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 12. Mom's voice from behind the door: «Это ты? Заходи, ужин стынет».
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 129, 0.9, 0.98) * kick(f), cx: 540, cy: 1040}} light={{glow: 0.2, vignette: 0.7}} bg="#e8e2d0">
				<DoorClose num="84" sneaker />
				<Person kind="girl" id="k1s12g" x={300} y={1780} scale={1.1} breathe={f} face={{eyes: 'wide', pupil: 0.55, mouth: 'o', brows: 'raised', look: [0.8, -0.2]}} />
			</Stage>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{f >= 50 &&
					[0, 1, 2].map((k) => {
						const p = ((f - 50 + k * 10) % 30) / 30;
						return <path key={k} d={`M ${720 + 40 * p},${500 - 120 - 80 * p} a ${80 + 120 * p},${80 + 120 * p} 0 0 1 0,${2 * (80 + 120 * p)}`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.8 * (1 - p)} />;
					})}
			</svg>
		</AbsoluteFill>
	);
};

// 13. But mom is at home right now. One floor below.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const arrow = pop(f, 40, 10);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 75, 0.95, 1.02) * kick(f), cx: 540, cy: 900}} light={{glow: 0.1, vignette: 0.6}} bg="#1d2140">
				<CrossSection t={f} />
			</Stage>
			{arrow > 0.01 && (
				<div style={{position: 'absolute', left: 300, top: 900, transform: `scale(${arrow})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 10}}>
					<div style={{background: YELLOW, color: '#111', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, borderRadius: 14, padding: '6px 22px'}}>МАМА — ЗДЕСЬ</div>
					<div style={{fontSize: 80, color: YELLOW, fontFamily: HEAVY, fontWeight: 900}}>↓</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 14. The door handle slowly goes down.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const h = lerp(f, 10, 62, 0, 1, Easing.inOut(Easing.sin));
	return (
		<Stage cam={{s: lerp(f, 0, 78, 2.1, 2.4) * kick(f), cx: 740, cy: 1000}} light={{glow: 0.1, vignette: 0.75}} bg="#7a4a36">
			<DoorClose num="84" handle={h} />
			<rect x={-400} y={-400} width={1880} height={2800} fill="#04060c" opacity={0.25} />
		</Stage>
	);
};

// 15. You fly into the lift and jab 12 → the doors take forever to close (behind them door 84 opens).
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60]);
	if (i === 0) {
		const taps = [6, 18, 30, 42];
		const tap = taps.some((k) => t >= k && t < k + 6);
		const c: Cam = {s: 1.5 * kick(t), cx: 540, cy: 760};
		const b = toScreen(c, BTN(12).x, BTN(12).y);
		return (
			<AbsoluteFill>
				<Stage cam={c} light={{glow: 0.2, vignette: 0.7}} bg="#8d939b">
					<Panel lit={[12]} glow13={0.5} />
				</Stage>
				<Finger x={b.x + 20 + (tap ? 0 : 60)} y={b.y + 20 + (tap ? 0 : 80)} s={1.0} press={tap ? 1 : 0} />
			</AbsoluteFill>
		);
	}
	const close = lerp(t, 4, 88, 0, 1, Easing.inOut(Easing.sin));
	return (
		<Stage cam={{s: lerp(t, 0, 93, 1.15, 1.3) * kick(t), cx: 540, cy: 980}} light={{glow: 0.1, vignette: 0.75}} bg="#2a2420">
			<CabinPOV id="k1s15" open={1 - close} floor="13">
				<Floor mirror num="84" sneaker dark={0.15} />
				{/* door 84 opens onto darkness */}
				<rect x={1080 - 760 - 154} y={536} width={308 * lerp(t, 20, 70, 0, 0.8)} height={944} fill="#000" />
			</CabinPOV>
		</Stage>
	);
};

// 16. «12». You run home. Mom: «А хлеб где?»
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [30]);
	if (i === 0) return <Display text="12" f={t} />;
	const run = lerp(t, 0, 30, 0, 1, Easing.out(Easing.quad));
	const ask = t >= 46;
	const talk = ask && t < 84 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 93, 1.0, 1.06) * kick(t), cx: 570, cy: 1000}} light={{glow: 0.3, vignette: 0.55}} bg="#cdb88f">
			<Hall id="k1s16h" noBag />
			<Person kind="girl" id="k1s16g" x={570 - 200 * run} y={1460 + 120 * run} scale={0.9 + 0.12 * run} walk={run < 1 ? t * 0.6 : undefined} breathe={t} face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.6, 0]}} />
			<Person kind="mom" id="k1s16m" colors={MOM13} x={800} y={1590} scale={1.02} breathe={t} face={{eyes: ask ? 'narrow' : 'open', mouth: talk ? 'o' : 'flat', brows: ask ? 'raised' : 'neutral', look: [-0.8, 0.1]}} armL={{target: [-150, -430], bend: 1}} armR={{target: [150, -430], bend: -1}} />
			{ask && (
				<g transform={`translate(${800 + 140},${1590 - 1150}) scale(${pop(t, 50, 9)})`}>
					<circle r={60} fill="#fff" />
					<text y={30} fontSize={90} fontFamily={HEAVY} fontWeight={900} fill="#d63b2f" textAnchor="middle">
						?
					</text>
				</g>
			)}
		</Stage>
	);
};

// 17. You go to your room… and freeze. The bed stands at the other wall.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.08) * kick(t), cx: 540, cy: 1000}} light={{glow: 0.25, vignette: 0.6}} bg="#e6dcef">
				<GirlRoom id="k1s17a" bed="right" night={0.25} />
				<Person kind="girl" id="k1s17g" x={300} y={1780} scale={1.15} back breathe={t} />
			</Stage>
		);
	}
	// before | now
	const lbl = (p: number, x: number, text: string, color: string) => (
		<div style={{position: 'absolute', left: x, top: 300, transform: `translate(-50%,0) scale(${p})`, background: 'rgba(14,14,16,0.9)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, color}}>{text}</div>
	);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)', filter: 'grayscale(0.85) brightness(0.9)'}}>
				<Stage cam={{s: 0.62, cx: 540, cy: 1080, dy: -420}} light={{glow: 0, vignette: 0.5}} bg="#e6dcef">
					<GirlRoom id="k1s17b" bed="left" />
				</Stage>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)'}}>
				<Stage cam={{s: 0.62, cx: 540, cy: 1080, dy: 440}} light={{glow: 0.1, vignette: 0.5}} bg="#e6dcef">
					<GirlRoom id="k1s17c" bed="right" night={0.25} />
				</Stage>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: '#fff'}} />
			{lbl(pop(t, 4, 10), 230, 'БЫЛО', '#9fb0d6')}
			<div style={{position: 'absolute', left: 230, top: 1000, transform: `translate(-50%,0) scale(${pop(t, 14, 10)})`, background: 'rgba(14,14,16,0.9)', border: `5px solid ${RED}`, borderRadius: 16, padding: '6px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, color: RED}}>СТАЛО</div>
		</AbsoluteFill>
	);
};

// 18. «Мам, кто переставил кровать?» — «Никто. Она всегда там стояла».
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [52]);
	if (i === 0) {
		const talk = t >= 2 && t < 40 && Math.floor(t / 4) % 2 === 0;
		return (
			<Stage cam={{s: lerp(t, 0, 52, 1.0, 1.06) * kick(t), cx: 540, cy: 960}} light={{glow: 0.25, vignette: 0.65}} bg="#e6dcef">
				<Wallpaper id="k1s18wp" x={-500} y={-500} w={2200} h={3000} base="#e6dcef" line="#d8cbe4" />
				<Bust kind="girl" id="k1s18g" x={540} y={1000} scale={6.0} face={{eyes: 'wide', brows: 'worried', mouth: talk ? 'o' : 'flat', look: [0.6, 0], blush: false}} />
			</Stage>
		);
	}
	const talk = t >= 6 && t < 58 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 71, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.7}} bg="#cdb88f">
			<Wallpaper id="k1s18wp2" x={-500} y={-500} w={2200} h={3000} base="#e6dcef" line="#d8cbe4" />
			<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.15} />
			<Bust kind="mom" id="k1s18m" colors={MOM13} x={540} y={1000} scale={5.6} face={{eyes: 'happy', brows: 'neutral', mouth: talk ? 'o' : 'smile', look: [0, 0], blush: false}} />
		</Stage>
	);
};

// 19. At night the hum of the lift wakes you. It goes up. Above the twelfth.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		const awake = t >= 14;
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 62, 1.0, 1.12) * kick(t), cx: 640, cy: 1150}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
					<GirlRoom id="k1s19" bed="right" night={1} />
					<g transform="translate(720,1100) rotate(-78) scale(0.72)">
						<Head kind="girl" uid="k1s19h" face={awake ? {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'flat', look: [0, -0.6], blush: false} : {eyes: 'closed', brows: 'neutral', mouth: 'flat', blush: false}} />
					</g>
					<path d="M 770,1150 Q 900,1120 1160,1150 L 1160,1240 L 770,1240 Z" fill="#1a827c" />
				</Stage>
				{t >= 6 && (
					<div style={{position: 'absolute', left: 540, top: 520, transform: `translate(-50%,-50%) scale(${pop(t, 6, 10)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: '#cfd8ff', letterSpacing: 6, textShadow: '0 6px 0 #000', opacity: 0.9}}>ГУУУУ…</div>
				)}
			</AbsoluteFill>
		);
	}
	const text = t < 22 ? '11' : t < 44 ? '12' : '13';
	return <Display text={text} f={t} moving hot={t >= 44 ? Math.max(0, 1 - (t - 44) / 20) : 0} frame="landing" />;
};

// 20. Finale: go back to the 13th and open door 84, or tape the button over and forget it?
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="ЧАСТЬ 2"
			series="КНОПКА 13"
			boxes={2}
			boxLabel="ИЗМЕНИЛОСЬ"
			boxMark="cross"
			opt1={{text: 'ДВЕРЬ 84', sub: 'вернуться на 13-й и открыть'}}
			opt2={{text: 'ЗАКЛЕИТЬ', sub: 'кнопку и забыть о ней'}}
			tallyLine={
				<>
					ДОМА ИЗМЕНИЛОСЬ: <span style={{color: '#ff6a5f'}}>1</span> · ЧТО ДАЛЬШЕ — <span style={{color: YELLOW}}>ПОД ВОПРОСОМ</span>
				</>
			}
			bg={
				<Stage cam={{s: lerp(f, 0, 300, 1.2, 1.32), cx: 540, cy: 700}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
					<Panel glow13={0.6 + 0.4 * Math.sin(f / 4)} />
					<rect x={-400} y={-400} width={1880} height={2800} fill="#000" opacity={0.6} />
				</Stage>
			}
		/>
	);
};
