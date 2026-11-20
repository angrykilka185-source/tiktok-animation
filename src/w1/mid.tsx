// «Что будет, если ты попадёшь в XX век» — 1931…1961: the communal room with the black radio «тарелка», the five-year
// plan (factories, the dam, the tractor), the library and its card catalogue, the abacus, the yard; 1941 (the radio,
// leaving for the front); 1951 (the city rebuilt, the first TV with a water lens, a full bakery); 1961 (12 April, the
// crowds, the boys who want to be cosmonauts, the computer hall).
import React from 'react';
import {Facade} from '../r1/world3d';
import {Glow, rnd, SERIF} from './kit';
import {Poster, Sky, starD} from './old';

const SANSB = "'DejaVu Sans', sans-serif";

// ========================================================== the 1930s room ===
// the black paper loudspeaker on the wall (centre x, y; r = radius); `sound` 0…1 draws sound rings
export const Tarelka: React.FC<{x: number; y: number; r?: number; sound?: number; f?: number}> = ({x, y, r = 120, sound = 0, f = 0}) => (
	<g>
		<path d={`M ${x},${y - r - 10} L ${x + 30},${y - r - 150}`} stroke="#1a1a1a" strokeWidth={5} />
		<circle cx={x + 2} cy={y + 8} r={r} fill="#000" opacity={0.25} />
		<circle cx={x} cy={y} r={r} fill="#1c1c1e" />
		<circle cx={x} cy={y} r={r * 0.8} fill="#29292c" />
		{Array.from({length: 12}).map((_, k) => (
			<line key={k} x1={x + Math.cos((k * Math.PI) / 6) * r * 0.2} y1={y + Math.sin((k * Math.PI) / 6) * r * 0.2} x2={x + Math.cos((k * Math.PI) / 6) * r * 0.95} y2={y + Math.sin((k * Math.PI) / 6) * r * 0.95} stroke="#111" strokeWidth={3} />
		))}
		<circle cx={x} cy={y} r={r * 0.18} fill="#3a3a3e" />
		<rect x={x - r * 0.12} y={y - r * 1.04} width={r * 0.24} height={r * 0.16} rx={4} fill="#3a3a3e" />
		{sound > 0 &&
			[0, 1, 2].map((k) => {
				const t = ((f / 18 + k / 3) % 1);
				return <circle key={k} cx={x} cy={y} r={r * (1.1 + t * 1.2)} fill="none" stroke="#fff" strokeWidth={6} opacity={sound * (1 - t) * 0.5} />;
			})}
	</g>
);
// wall clock with weights («ходики»)
export const Hodiki: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
	const sw = Math.sin(f / 9) * 14;
	return (
		<g>
			<path d={`M ${x},${y + 70} L ${x + sw},${y + 230}`} stroke="#c9a54a" strokeWidth={4} />
			<circle cx={x + sw} cy={y + 236} r={14} fill="#c9a54a" />
			<line x1={x - 24} y1={y + 70} x2={x - 24} y2={y + 300} stroke="#4a4a4a" strokeWidth={2} />
			<rect x={x - 34} y={y + 300} width={20} height={56} rx={6} fill="#4a4a4a" />
			<line x1={x + 24} y1={y + 70} x2={x + 24} y2={y + 220} stroke="#4a4a4a" strokeWidth={2} />
			<rect x={x + 14} y={y + 220} width={20} height={56} rx={6} fill="#4a4a4a" />
			<path d={`M ${x - 70},${y - 80} L ${x},${y - 130} L ${x + 70},${y - 80} L ${x + 70},${y + 70} L ${x - 70},${y + 70} Z`} fill="#6a4628" />
			<circle cx={x} cy={y - 10} r={52} fill="#f4ecd8" />
			<line x1={x} y1={y - 10} x2={x} y2={y - 48} stroke="#222" strokeWidth={5} />
			<line x1={x} y1={y - 10} x2={x + 28} y2={y + 4} stroke="#222" strokeWidth={5} />
		</g>
	);
};
export const Room30: React.FC<{f: number; sound?: number; dark?: number; calendar?: string}> = ({f, sound = 0, dark = 0, calendar}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#c9b48a" />
		{Array.from({length: 26}).map((_, k) => (
			<g key={k}>
				<rect x={-600 + k * 90} y={-600} width={34} height={2000} fill="#b8a07a" opacity={0.5} />
				{Array.from({length: 12}).map((__, j) => (
					<circle key={j} cx={-583 + k * 90} cy={-560 + j * 170 + (k % 2) * 85} r={9} fill="#9a7e5a" opacity={0.5} />
				))}
			</g>
		))}
		<rect x={-600} y={1200} width={2300} height={1500} fill="#7a5232" />
		{Array.from({length: 16}).map((_, k) => (
			<rect key={k} x={-600 + k * 150} y={1200} width={8} height={1500} fill="#5a3a22" />
		))}
		<rect x={-600} y={1180} width={2300} height={24} fill="#5a3a22" />
		{/* the window */}
		<rect x={640} y={240} width={400} height={560} fill="#5a3a22" />
		<rect x={660} y={260} width={360} height={520} fill="#bcd2de" />
		<rect x={834} y={260} width={12} height={520} fill="#5a3a22" />
		<rect x={660} y={470} width={360} height={12} fill="#5a3a22" />
		<path d="M 640,240 C 700,500 660,700 700,800 L 640,800 Z M 1040,240 C 980,500 1020,700 980,800 L 1040,800 Z" fill="#f4ecd8" opacity={0.9} />
		{/* the cupboard */}
		<rect x={-460} y={420} width={420} height={780} fill="#6a4628" />
		<rect x={-440} y={440} width={180} height={300} fill="#bcd2de" opacity={0.6} />
		<rect x={-240} y={440} width={180} height={300} fill="#bcd2de" opacity={0.6} />
		{[0, 1, 2].map((k) => (
			<ellipse key={k} cx={-380 + k * 110} cy={600} rx={36} ry={14} fill="#f4f0e8" />
		))}
		<rect x={-440} y={780} width={380} height={400} fill="#5a3a22" />
		<Hodiki x={130} y={360} f={f} />
		<Tarelka x={420} y={460} r={110} sound={sound} f={f} />
		{calendar && (
			<g>
				<rect x={-10} y={640} width={220} height={260} fill="#f4ecd8" stroke="#8a6a44" strokeWidth={5} />
				<rect x={-10} y={640} width={220} height={60} fill="#a8302a" />
				<text x={100} y={682} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={30} fill="#fff">
					ИЮНЬ 1941
				</text>
				<text x={100} y={820} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={120} fill="#a8302a">
					22
				</text>
				<text x={100} y={876} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={26} fill="#2a2220">
					ВОСКРЕСЕНЬЕ
				</text>
			</g>
		)}
		{/* the table with a lace cloth */}
		<rect x={80} y={1060} width={900} height={40} fill="#f4f0e8" />
		<path d="M 80,1100 L 980,1100 L 960,1160 L 100,1160 Z" fill="#f4f0e8" />
		{Array.from({length: 18}).map((_, k) => (
			<circle key={k} cx={100 + k * 50} cy={1160} r={12} fill="#f4f0e8" />
		))}
		<rect x={140} y={1160} width={26} height={300} fill="#5a3a22" />
		<rect x={900} y={1160} width={26} height={300} fill="#5a3a22" />
		<path d="M 520,1060 L 500,980 L 600,980 L 580,1060 Z" fill="#e8e4d8" />
		{dark > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#0c0e18" opacity={dark} />}
	</g>
);

// ================================================== the five-year plan =====
const Chimney: React.FC<{x: number; y: number; h: number; f: number; w?: number}> = ({x, y, h, f, w = 70}) => (
	<g>
		<path d={`M ${x - w / 2},${y} L ${x - w * 0.36},${y - h} L ${x + w * 0.36},${y - h} L ${x + w / 2},${y} Z`} fill="#8a4a3a" />
		{[0.3, 0.55, 0.8].map((k) => (
			<rect key={k} x={x - w * 0.45} y={y - h * k} width={w * 0.9} height={12} fill="#e9e4d6" />
		))}
		{Array.from({length: 5}).map((_, k) => {
			const t = ((f / 40 + k / 5) % 1);
			return <circle key={k} cx={x + t * 160 + Math.sin(t * 5 + k) * 20} cy={y - h - 40 - t * 260} r={30 + t * 70} fill="#d8d4cc" opacity={0.8 * (1 - t)} />;
		})}
	</g>
);
export const Industry: React.FC<{f: number}> = ({f}) => (
	<g>
		<Sky top="#9fb8cc" bottom="#efe6d2" />
		{/* the dam with the power station */}
		<path d="M -600,900 L 1700,900 L 1700,1240 L -600,1240 Z" fill="#a8b8c0" />
		<rect x={-600} y={760} width={1100} height={480} fill="#c9c4b8" />
		{Array.from({length: 10}).map((_, k) => (
			<rect key={k} x={-580 + k * 108} y={800} width={60} height={420} fill="#b4ae9e" />
		))}
		{Array.from({length: 10}).map((_, k) => (
			<rect key={`w${k}`} x={-576 + k * 108} y={1150} width={52} height={90} fill="#e8f4fa" opacity={0.8} />
		))}
		<rect x={-600} y={740} width={1100} height={30} fill="#9a9488" />
		{/* power line towers */}
		{[650, 1000, 1350].map((tx, k) => (
			<g key={tx}>
				<path d={`M ${tx - 60},1240 L ${tx},${700 + k * 60} L ${tx + 60},1240 M ${tx - 80},${780 + k * 60} L ${tx + 80},${780 + k * 60}`} stroke="#4a4f56" strokeWidth={8} fill="none" />
				<path d={`M ${tx - 45},1100 L ${tx + 30},${900 + k * 40} M ${tx + 45},1100 L ${tx - 30},${900 + k * 40}`} stroke="#4a4f56" strokeWidth={5} />
			</g>
		))}
		<path d="M 500,790 Q 575,830 650,780 Q 825,840 1000,840 Q 1175,900 1350,900 Q 1500,940 1700,950" stroke="#2a2c30" strokeWidth={3} fill="none" />
		{/* factory */}
		<rect x={300} y={1000} width={1300} height={240} fill="#9a6e5a" />
		{Array.from({length: 8}).map((_, k) => (
			<path key={k} d={`M ${300 + k * 165},1000 L ${380 + k * 165},930 L ${465 + k * 165},1000 Z`} fill="#8a5e4a" />
		))}
		{Array.from({length: 12}).map((_, k) => (
			<rect key={k} x={330 + k * 105} y={1060} width={60} height={110} fill="#d8e4ea" opacity={0.85} />
		))}
		<Chimney x={420} y={1000} h={520} f={f} />
		<Chimney x={620} y={1000} h={440} f={f + 13} w={60} />
		<Chimney x={1180} y={1000} h={600} f={f + 27} w={80} />
		{/* the crane */}
		<path d="M 900,1000 L 900,400 M 760,420 L 1240,420 M 900,400 L 1240,420 M 900,400 L 760,420" stroke="#c8402a" strokeWidth={14} fill="none" />
		{Array.from({length: 10}).map((_, k) => (
			<path key={k} d={`M 880,${1000 - k * 60} L 920,${940 - k * 60}`} stroke="#c8402a" strokeWidth={5} />
		))}
		<line x1={1180} y1={420} x2={1180} y2={600 + Math.sin(f / 20) * 40} stroke="#2a2c30" strokeWidth={4} />
		<rect x={1140} y={600 + Math.sin(f / 20) * 40} width={80} height={40} fill="#6a4a3a" />
		{/* the field */}
		<rect x={-600} y={1240} width={2300} height={1400} fill="#8a7a4a" />
		{Array.from({length: 14}).map((_, k) => (
			<path key={k} d={`M -600,${1270 + k * k * 9} L 1700,${1250 + k * k * 9}`} stroke="#6e5e36" strokeWidth={3 + k * 0.8} />
		))}
	</g>
);
// a tractor of the early 30s (steel wheels with lugs), facing right; feet at (0,0); `rot` = wheel turn
export const Tractor: React.FC<{rot: number; id: string; driver?: React.ReactNode}> = ({rot, driver}) => (
	<g>
		<rect x={-80} y={-300} width={360} height={140} rx={14} fill="#5a6a5a" />
		<rect x={220} y={-330} width={30} height={90} fill="#2a2c30" />
		<rect x={-40} y={-340} width={240} height={50} rx={10} fill="#6a7a6a" />
		<rect x={260} y={-280} width={60} height={110} rx={10} fill="#3a4a3a" />
		{Array.from({length: 6}).map((_, k) => (
			<rect key={k} x={270} y={-270 + k * 16} width={40} height={8} fill="#2a2c30" />
		))}
		{driver}
		<g transform={`translate(-150,-170) rotate(${rot})`}>
			<circle r={170} fill="none" stroke="#6a3a2a" strokeWidth={26} />
			{Array.from({length: 16}).map((_, k) => (
				<rect key={k} x={-14} y={-196} width={28} height={30} fill="#4a2a1e" transform={`rotate(${k * 22.5})`} />
			))}
			{Array.from({length: 8}).map((_, k) => (
				<line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 4) * 160} y2={Math.sin((k * Math.PI) / 4) * 160} stroke="#6a3a2a" strokeWidth={14} />
			))}
			<circle r={30} fill="#3a2a1e" />
		</g>
		<g transform={`translate(260,-80) rotate(${rot * 2})`}>
			<circle r={80} fill="none" stroke="#6a3a2a" strokeWidth={18} />
			{Array.from({length: 6}).map((_, k) => (
				<line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 3) * 74} y2={Math.sin((k * Math.PI) / 3) * 74} stroke="#6a3a2a" strokeWidth={10} />
			))}
		</g>
	</g>
);

// =============================================================== library ====
export const Library: React.FC<{pull?: number}> = ({pull = 0}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#d8cdb4" />
		<rect x={-600} y={1220} width={2300} height={1400} fill="#8a6a44" />
		{[-560, 300].map((sx) => (
			<g key={sx}>
				<rect x={sx} y={-300} width={760} height={1520} fill="#5a3a22" />
				{Array.from({length: 7}).map((_, r) => (
					<g key={r}>
						<rect x={sx + 20} y={-280 + r * 210} width={720} height={190} fill="#3a2414" />
						{Array.from({length: 22}).map((__, k) => {
							const w = 22 + rnd(sx + r * 40 + k) * 12;
							const h = 130 + rnd(sx * 2 + r * 13 + k) * 50;
							return <rect key={k} x={sx + 26 + k * 32.5} y={-280 + r * 210 + 190 - h} width={w} height={h} fill={['#8a2a2a', '#2a4a6a', '#3a5a3a', '#6a5a3a', '#4a3a5a', '#7a6a4a'][Math.floor(rnd(sx + r * 7 + k * 3) * 6)]} />;
						})}
					</g>
				))}
			</g>
		))}
		{/* the card catalogue */}
		<g transform="translate(240,640)">
			<rect x={0} y={0} width={620} height={560} fill="#7a5232" />
			{Array.from({length: 5}).map((_, r) =>
				Array.from({length: 4}).map((__, c) => {
					const pulled = r === 2 && c === 1 ? pull : 0;
					return (
						<g key={`${r}-${c}`} transform={`translate(${20 + c * 150},${20 + r * 104})`}>
							<rect x={0} y={0} width={130} height={86} fill="#6a4628" />
							<rect x={-pulled * 8} y={-pulled * 6} width={130 + pulled * 16} height={86 + pulled * 10} fill="#8a6038" />
							<rect x={40 - pulled * 2} y={22 - pulled * 4} width={50} height={22} fill="#f4ecd8" />
							<circle cx={65} cy={64 + pulled * 4} r={8} fill="#c9a54a" />
						</g>
					);
				}),
			)}
			<rect x={-20} y={560} width={660} height={30} fill="#5a3a22" />
			<rect x={0} y={590} width={30} height={60} fill="#5a3a22" />
			<rect x={590} y={590} width={30} height={60} fill="#5a3a22" />
		</g>
		<g transform="translate(980,700)">
			<rect x={-8} y={0} width={16} height={240} fill="#2a2a2a" />
			<path d="M -90,0 L 90,0 L 60,-70 L -60,-70 Z" fill="#2a6a3a" />
			<Glow id="w1lib" x={0} y={40} r={220} color="#fff3c0" o={0.6} />
		</g>
	</g>
);
// the drawer pulled out towards you: cards on a rod (close-up art, centred at 540, 960)
export const Drawer: React.FC<{flip: number}> = ({flip}) => (
	<g>
		<path d="M 140,1400 L 940,1400 L 860,700 L 220,700 Z" fill="#8a6038" />
		<path d="M 180,1380 L 900,1380 L 830,720 L 250,720 Z" fill="#6a4628" />
		{Array.from({length: 14}).map((_, k) => {
			const y = 760 + k * 44;
			const w = 520 + k * 22;
			const lean = k === Math.floor(flip) ? -14 : k < flip ? -22 : 0;
			return (
				<g key={k} transform={`rotate(${lean} 540 ${y + 120})`}>
					<rect x={540 - w / 2} y={y - 60} width={w} height={180} rx={6} fill={k % 4 === 0 ? '#f0dcae' : '#f4ecd8'} stroke="#c9b48a" strokeWidth={3} />
					{k % 4 === 0 && <rect x={540 - 60} y={y - 82} width={120} height={30} rx={6} fill="#c9a54a" />}
					<line x1={540 - w / 2 + 30} y1={y - 20} x2={540 + w / 2 - 80} y2={y - 20} stroke="#8a7a62" strokeWidth={4} />
				</g>
			);
		})}
		<rect x={530} y={760} width={20} height={640} fill="#8a8f96" />
	</g>
);

// ================================================================ abacus ====
// счёты: a wooden frame, ten wires of beads; `slide` per wire 0…1 moves the beads to the left
export const Abacus: React.FC<{x: number; y: number; s?: number; slide: number[]}> = ({x, y, s = 1, slide}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-260} y={-300} width={520} height={600} rx={20} fill="#8a5a34" />
		<rect x={-230} y={-270} width={460} height={540} fill="#e8dcc0" />
		{Array.from({length: 10}).map((_, r) => {
			const yy = -240 + r * 54;
			const n = r === 6 ? 4 : 10;
			const moved = Math.round((slide[r] ?? 0) * n);
			return (
				<g key={r}>
					<line x1={-230} y1={yy} x2={230} y2={yy} stroke="#5a3a22" strokeWidth={5} />
					{Array.from({length: n}).map((__, k) => {
						const left = k < moved;
						const bx = left ? -205 + k * 34 : 205 - (n - 1 - k) * 34;
						return <ellipse key={k} cx={bx} cy={yy} rx={17} ry={22} fill={k === 4 || k === 5 ? '#1a1a1a' : '#a8402e'} />;
					})}
				</g>
			);
		})}
	</g>
);

// a bat for лапта (a long flat paddle) — hand-local coords
export const Bat: React.FC = () => <rect x={-14} y={-20} width={28} height={300} rx={12} fill="#c9a26a" stroke="#8a6a3a" strokeWidth={4} />;

// a 1930s yard: wooden two-storey houses, a fence, a big tree
export const Yard30: React.FC<{f: number}> = ({f}) => (
	<g>
		<Sky top="#9fbad2" bottom="#eee6d2" />
		{[-520, 120, 760].map((hx, k) => (
			<g key={hx}>
				<rect x={hx} y={560} width={560} height={640} fill={['#8a6a4a', '#9a7a52', '#7a5e40'][k]} />
				{Array.from({length: 16}).map((_, j) => (
					<rect key={j} x={hx} y={560 + j * 40} width={560} height={6} fill="#5a3a22" opacity={0.5} />
				))}
				<path d={`M ${hx - 30},570 L ${hx + 280},380 L ${hx + 590},570 Z`} fill="#5a5f66" />
				{[0, 1, 2].map((c) => (
					<g key={c}>
						<rect x={hx + 60 + c * 170} y={640} width={110} height={150} fill="#f4ecd8" />
						<rect x={hx + 70 + c * 170} y={650} width={90} height={130} fill="#9ab0c0" />
						<rect x={hx + 60 + c * 170} y={900} width={110} height={150} fill="#f4ecd8" />
						<rect x={hx + 70 + c * 170} y={910} width={90} height={130} fill="#9ab0c0" />
					</g>
				))}
			</g>
		))}
		<rect x={-600} y={1100} width={2300} height={140} fill="#7a6a52" />
		{Array.from({length: 46}).map((_, k) => (
			<rect key={k} x={-600 + k * 50} y={1060 + (k % 2) * 6} width={38} height={180} fill="#9a7a52" />
		))}
		<rect x={-600} y={1240} width={2300} height={1400} fill="#8a9a5a" />
		<path d="M -600,1240 L 1700,1240 L 1700,1300 L -600,1300 Z" fill="#7a8a4a" />
		<g transform={`translate(1100,1240) rotate(${Math.sin(f / 40) * 0.6})`}>
			<rect x={-30} y={-700} width={60} height={700} fill="#5a3a22" />
			<circle cx={0} cy={-760} r={240} fill="#4a7a3a" />
			<circle cx={-150} cy={-640} r={160} fill="#3a6a2e" />
			<circle cx={160} cy={-660} r={170} fill="#5a8a42" />
		</g>
	</g>
);

// =================================================================== 1941 ====
// a street of the early 40s, a summer morning; `dark` dims it
export const Street40: React.FC<{dark?: number; speaker?: boolean}> = ({dark = 0, speaker = false}) => (
	<g>
		<Sky top="#9fbad2" bottom="#efe8d8" />
		<rect x={-560} y={240} width={900} height={1000} fill="#c9b8a0" />
		<rect x={380} y={160} width={760} height={1080} fill="#d8ccb4" />
		<rect x={1180} y={300} width={560} height={940} fill="#b8a890" />
		{[[-560, 240, 900, 5], [380, 160, 760, 6], [1180, 300, 560, 4]].map(([hx, hy, hw, n], k) => (
			<g key={k}>
				<rect x={hx - 10} y={hy - 20} width={hw + 20} height={40} fill="#efe6d2" />
				{Array.from({length: 4}).map((_, r) =>
					Array.from({length: n}).map((__, c) => (
						<g key={`${r}-${c}`}>
							<rect x={hx + 40 + c * ((hw - 40) / n)} y={hy + 80 + r * 230} width={(hw - 40) / n - 50} height={150} fill="#f4ecd8" />
							<rect x={hx + 50 + c * ((hw - 40) / n)} y={hy + 90 + r * 230} width={(hw - 40) / n - 70} height={130} fill="#8ea4b6" />
							<rect x={hx + 50 + c * ((hw - 40) / n) + ((hw - 40) / n - 70) / 2 - 3} y={hy + 90 + r * 230} width={6} height={130} fill="#f4ecd8" />
						</g>
					)),
				)}
			</g>
		))}
		<rect x={-600} y={1240} width={2300} height={80} fill="#a59c8e" />
		<rect x={-600} y={1320} width={2300} height={1300} fill="#6a665e" />
		{speaker && (
			<g>
				<rect x={240} y={500} width={18} height={820} fill="#2a2c30" />
				<path d="M 258,560 L 380,500 L 380,640 L 258,600 Z" fill="#3a3c40" />
				<ellipse cx={384} cy={570} rx={20} ry={72} fill="#1a1c20" />
			</g>
		)}
		{dark > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#101420" opacity={dark} />}
	</g>
);
// the soldier's look (1941): a khaki tunic, a side cap with a red star, boots, a rolled greatcoat
export const SOLDIER = {colors: {top: '#6b6b45', topDark: '#5a5a3a', pants: '#5a5a3a', shoes: '#1a1a1c'}, hat: {type: 'pilotka' as const, color: '#6b6b45', band: '#c8282a'}, boots: '#1a1a1c', plain: true};

// =================================================================== 1951 ====
export const Rebuild: React.FC<{f: number}> = ({f}) => (
	<g>
		<Sky top="#a9c3d6" bottom="#f0e8d8" />
		{/* the new building (columns, a spire) */}
		<rect x={-200} y={180} width={1480} height={1060} fill="#e0d4bc" />
		<rect x={-220} y={150} width={1520} height={50} fill="#c9bca2" />
		<path d="M 340,150 L 540,-160 L 740,150 Z" fill="#d8ccb2" />
		<path d="M 530,-160 L 540,-400 L 550,-160 Z" fill="#c9a54a" />
		<path d={starD(540, -420, 30)} fill="#c8282a" />
		{Array.from({length: 4}).map((_, r) =>
			Array.from({length: 9}).map((__, c) => (
				<g key={`${r}-${c}`}>
					<rect x={-150 + c * 160} y={240 + r * 200} width={90} height={130} fill="#8ea4b6" />
					<rect x={-160 + c * 160} y={226 + r * 200} width={110} height={14} fill="#c9bca2" />
				</g>
			)),
		)}
		{Array.from({length: 8}).map((_, k) => (
			<rect key={k} x={-130 + k * 200} y={1040} width={40} height={200} fill="#efe6d2" />
		))}
		{/* scaffolding on the right half */}
		<g>
			{Array.from({length: 8}).map((_, k) => (
				<line key={k} x1={560 + k * 100} y1={160} x2={560 + k * 100} y2={1240} stroke="#8a6a44" strokeWidth={10} />
			))}
			{Array.from({length: 6}).map((_, k) => (
				<g key={k}>
					<rect x={540} y={300 + k * 180} width={760} height={14} fill="#8a6a44" />
					<line x1={560} y1={300 + k * 180} x2={660} y2={480 + k * 180} stroke="#8a6a44" strokeWidth={5} />
				</g>
			))}
			{Array.from({length: 4}).map((_, k) => (
				<rect key={k} x={600 + k * 160} y={1140 - k * 4} width={110} height={40} fill="#b8643a" />
			))}
		</g>
		{/* tower crane */}
		<path d="M 1350,1240 L 1350,0 M 1000,20 L 1600,20 M 1350,0 L 1000,20 M 1350,0 L 1600,20" stroke="#c8a02a" strokeWidth={14} fill="none" />
		{Array.from({length: 16}).map((_, k) => (
			<path key={k} d={`M 1330,${1240 - k * 76} L 1370,${1170 - k * 76}`} stroke="#c8a02a" strokeWidth={5} />
		))}
		<line x1={1100 + Math.sin(f / 30) * 60} y1={20} x2={1100 + Math.sin(f / 30) * 60} y2={420} stroke="#2a2c30" strokeWidth={4} />
		<rect x={1050 + Math.sin(f / 30) * 60} y={420} width={100} height={46} fill="#b8643a" />
		<rect x={-600} y={1240} width={2300} height={80} fill="#a59c8e" />
		<rect x={-600} y={1320} width={2300} height={1300} fill="#77726a" />
		<rect x={-160} y={440} width={620} height={110} fill="#c8282a" />
		<text x={150} y={512} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={54} fill="#f4ecd8">
			ВОССТАНОВИМ!
		</text>
	</g>
);
// the first TV (a wooden box with a tiny screen) and the water lens in front of it; `pic` = the picture frame
export const KVN: React.FC<{x: number; y: number; s?: number; f: number; lens?: number; on?: boolean}> = ({x, y, s = 1, f, lens = 1, on = true}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-170} y={-300} width={340} height={300} rx={18} fill="#6a4026" />
		<rect x={-150} y={-280} width={300} height={260} rx={10} fill="#7a4e30" />
		<rect x={-80} y={-250} width={160} height={120} rx={14} fill={on ? '#cfd8dc' : '#2a2e30'} />
		{on && (
			<g>
				<rect x={-60} y={-200} width={40} height={60} fill="#7a8488" />
				<circle cx={30} cy={-200} r={22} fill="#7a8488" />
				<line x1={-80} y1={-180 + ((f * 4) % 120) - 60} x2={80} y2={-180 + ((f * 4) % 120) - 60} stroke="#fff" strokeWidth={2} opacity={0.25} />
			</g>
		)}
		{[-90, -30, 30, 90].map((kx) => (
			<circle key={kx} cx={kx} cy={-70} r={14} fill="#2a1a12" />
		))}
		{lens > 0 && (
			<g opacity={lens}>
				<rect x={-12} y={-30} width={24} height={60} fill="#5a5f66" transform="translate(0,-10)" />
				<circle cx={0} cy={-200} r={150} fill="#bfe3f2" opacity={0.35} stroke="#8fb8c8" strokeWidth={8} />
				{on && (
					<g opacity={0.6}>
						<rect x={-110} y={-280} width={110} height={160} fill="#7a8488" />
						<circle cx={70} cy={-280} r={60} fill="#7a8488" />
					</g>
				)}
				<ellipse cx={-50} cy={-270} rx={40} ry={20} fill="#fff" opacity={0.4} transform="rotate(-30 -50 -270)" />
			</g>
		)}
	</g>
);
// porcelain elephants on the sideboard («слоники»)
export const Sideboard: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={0} y={0} width={560} height={420} fill="#6a4026" />
		<rect x={20} y={20} width={250} height={180} fill="#bcd2de" opacity={0.5} />
		<rect x={290} y={20} width={250} height={180} fill="#bcd2de" opacity={0.5} />
		<rect x={20} y={220} width={520} height={180} fill="#5a3420" />
		{[0, 1, 2, 3, 4, 5, 6].map((k) => (
			<g key={k} transform={`translate(${60 + k * 70},${-10}) scale(${1 - k * 0.08})`}>
				<ellipse cx={0} cy={-30} rx={34} ry={26} fill="#f4f0e8" />
				<circle cx={30} cy={-46} r={18} fill="#f4f0e8" />
				<path d="M 44,-40 Q 56,-20 48,0" stroke="#f4f0e8" strokeWidth={8} fill="none" />
				<rect x={-26} y={-12} width={10} height={12} fill="#f4f0e8" />
				<rect x={14} y={-12} width={10} height={12} fill="#f4f0e8" />
			</g>
		))}
	</g>
);
export const TVRoom: React.FC<{f: number; lens?: number}> = ({f, lens = 1}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#d8c8a0" />
		{Array.from({length: 24}).map((_, k) => (
			<rect key={k} x={-600 + k * 100} y={-600} width={40} height={2000} fill="#c8b890" opacity={0.6} />
		))}
		<rect x={-600} y={1200} width={2300} height={1500} fill="#8a5a34" />
		<Sideboard x={-480} y={780} />
		<rect x={240} y={1000} width={560} height={30} fill="#5a3420" />
		<rect x={260} y={1030} width={24} height={200} fill="#5a3420" />
		<rect x={756} y={1030} width={24} height={200} fill="#5a3420" />
		<rect x={240} y={980} width={560} height={24} fill="#f4f0e8" />
		<KVN x={520} y={980} s={1} f={f} lens={lens} />
		<rect x={860} y={300} width={300} height={400} fill="#5a3a22" />
		<rect x={876} y={316} width={268} height={368} fill="#9ab0c0" />
		<Glow id="w1tvg" x={520} y={780} r={420} color="#cfe6f2" o={0.35} />
	</g>
);
// a bread card (хлебная карточка) and its cancelled stamp
export const BreadCard: React.FC = () => (
	<g>
		<rect x={-300} y={-200} width={600} height={400} fill="#efe4c4" stroke="#8a7a52" strokeWidth={8} />
		<text x={0} y={-120} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={44} fill="#4a3a1e">
			ХЛЕБНАЯ КАРТОЧКА
		</text>
		{Array.from({length: 3}).map((_, r) =>
			Array.from({length: 6}).map((__, c) => (
				<rect key={`${r}-${c}`} x={-270 + c * 92} y={-80 + r * 90} width={84} height={80} fill="none" stroke="#8a7a52" strokeWidth={3} strokeDasharray="8 5" />
			)),
		)}
	</g>
);

// =================================================================== 1961 ====
export const Street61: React.FC<{f: number}> = ({f}) => (
	<g>
		<Sky top="#8fb8e0" bottom="#eef4f8" />
		<g transform="translate(-560,230)">
			<Facade w={900} h={1010} color="#d8d0c0" cols={6} seed={4} />
		</g>
		<rect x={380} y={120} width={820} height={1120} fill="#e8dcc4" />
		<rect x={360} y={90} width={860} height={50} fill="#d8ccb2" />
		{Array.from({length: 5}).map((_, r) =>
			Array.from({length: 5}).map((__, c) => (
				<g key={`${r}-${c}`}>
					<rect x={430 + c * 160} y={180 + r * 190} width={90} height={130} fill="#8ea4b6" />
					<rect x={420 + c * 160} y={166 + r * 190} width={110} height={14} fill="#d8ccb2" />
				</g>
			)),
		)}
		<g transform="translate(1220,330)">
			<Facade w={700} h={910} color="#c9d0c8" cols={5} seed={7} />
		</g>
		<rect x={-600} y={1240} width={2300} height={80} fill="#a59c8e" />
		<rect x={-600} y={1320} width={2300} height={1300} fill="#6e6a62" />
		{Array.from({length: 30}).map((_, k) => {
			const t = ((f / 70 + rnd(k)) % 1);
			return <rect key={k} x={-500 + rnd(k * 3) * 2100} y={-100 + t * 1500} width={18} height={24} fill={['#fff', '#ffd34a', '#ff7a6a', '#8fd0ff'][k % 4]} opacity={0.8} transform={`rotate(${t * 720 + k * 40} ${-500 + rnd(k * 3) * 2100} ${-100 + t * 1500})`} />;
		})}
	</g>
);
// a hand-made sign held up high (hand-local: the stick in the hand)
export const HandSign: React.FC<{text: string; w?: number; color?: string}> = ({text, w = 360, color = '#c8282a'}) => (
	<g>
		<rect x={-8} y={-360} width={16} height={380} fill="#8a6a44" />
		<rect x={-w / 2} y={-560} width={w} height={220} rx={8} fill="#f4f0e8" stroke="#8a6a44" strokeWidth={6} />
		{text.split('\n').map((line, k, all) => (
			<text key={k} x={0} y={-450 + (k - (all.length - 1) / 2) * 70} textAnchor="middle" dominantBaseline="middle" fontFamily={SANSB} fontWeight={900} fontSize={Math.min(64, (w / Math.max(...all.map((l) => l.length))) * 1.6)} fill={color}>
				{line}
			</text>
		))}
	</g>
);
// a cardboard space helmet with «СССР» (head coords: drawn by the caller over a head)
export const Helmet: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -105,40 C -120,-130 120,-130 105,40 L 80,50 C 80,-60 -80,-60 -80,50 Z" fill="#f4f0e8" stroke="#c9c4b8" strokeWidth={6} />
		<text x={0} y={-70} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={34} fill="#c8282a">
			СССР
		</text>
	</g>
);
// the computer hall: tall cabinets with panels of lamps, tape drives, the operator's desk
export const EVM: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#dde2e0" />
		<rect x={-600} y={1220} width={2300} height={1400} fill="#9aa09c" />
		{Array.from({length: 22}).map((_, k) => (
			<rect key={k} x={-600 + k * 110} y={1220} width={4} height={1400} fill="#8a908c" />
		))}
		{Array.from({length: 7}).map((_, k) => {
			const cx = -520 + k * 330;
			const tape = k % 3 === 1;
			return (
				<g key={k}>
					<rect x={cx} y={300} width={280} height={920} fill="#b8c0bc" />
					<rect x={cx + 10} y={310} width={260} height={900} fill="#c9d0cc" />
					{tape ? (
						<g>
							{[0, 1].map((j) => (
								<g key={j} transform={`translate(${cx + 140},${470 + j * 240}) rotate(${f * (j ? -6 : 6)})`}>
									<circle r={90} fill="#3a3c40" />
									<circle r={34} fill="#c9d0cc" />
									{[0, 1, 2].map((q) => (
										<rect key={q} x={-8} y={-80} width={16} height={40} fill="#c9d0cc" transform={`rotate(${q * 120})`} />
									))}
								</g>
							))}
							<rect x={cx + 40} y={900} width={200} height={200} fill="#a8b0ac" />
						</g>
					) : (
						<g>
							{Array.from({length: 8}).map((_, r) =>
								Array.from({length: 6}).map((__, c) => (
									<circle key={`${r}-${c}`} cx={cx + 50 + c * 36} cy={380 + r * 50} r={10} fill={rnd(k * 50 + r * 6 + c) > 0.55 ? '#ffd34a' : '#6a706c'} />
								)),
							)}
							{[0, 1, 2].map((j) => (
								<rect key={j} x={cx + 40} y={820 + j * 110} width={200} height={80} fill="#a8b0ac" />
							))}
						</g>
					)}
				</g>
			);
		})}
		<rect x={-600} y={1100} width={2300} height={30} fill="#7a807c" opacity={0.5} />
	</g>
);
