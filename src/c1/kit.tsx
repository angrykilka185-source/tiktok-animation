// «Откуда взялись чипсы» — the kit: the three heroes (Тёма, дед, кот Барсик), grandpa's living room, the chips and
// the props of the story. Flat picture coordinates 1080×1920 (the Stage camera zooms into them).
import React from 'react';
import {blinkAt} from '../anim';
import {HEAVY} from '../components/Overlays';
import {ArmPose, Face, Kind, Person, PersonProps, Shaded, SPECS} from '../components/Person';
import {Baseboard, PlankFloor, Wallpaper} from '../components/Set';
import envJson from './env.json';
import {shotStart} from './timeline';
import {VOICE} from './voice';

export const SANS = 'Inter, Arial, sans-serif';
export const RED = '#e0342b';
export const YEL = '#ffd34a';
export const INK = '#1d1d24';
export const GOLD = '#f2c04a';
export const GOLD_D = '#d6952a';

// ============================================================ the voice → mouths =====
const ENV = envJson as Record<string, number[]>;
const lineOf = (n: number) => VOICE.find((l) => l.shot === n);
// where the line of shot n starts (shot-local frames)
export const lineAt = (n: number) => {
	const l = lineOf(n);
	return l ? l.at - shotStart(n) : 0;
};
// loudness of the line of shot n at shot-local frame f (0 silence … ~1 loud)
export const lvl = (n: number, f: number) => {
	const a = ENV[`c${String(n).padStart(2, '0')}`];
	const i = Math.floor(f - lineAt(n));
	return a && i >= 0 && i < a.length ? a[i] : 0;
};
export const mouthOf = (v: number, rest: Face['mouth'] = 'flat'): Face['mouth'] => (v > 0.6 ? 'open' : v > 0.2 ? 'o' : rest);

// ============================================================ the heroes =====
export const TEMA = {top: '#2f9e6a', topDark: '#268256', pants: '#2b3350', shoes: '#f2f0ea', hair: '#5a3a26', skin: '#efbf98'};
export const DED = {top: '#8b6b4f', topDark: '#735840', pants: '#4a4d57', shoes: '#3a2a22', hair: '#dcdcdc', skin: '#e9b995'};
export const DED_BEARD = '#ececec';

// a person sitting: the body without legs (hips on the seat) — the seat cushion is drawn over the hips, then SitLegs
type SitProps = Omit<PersonProps, 'x' | 'y' | 'hideLegs'> & {x: number; seat: number; scale: number};
export const sitFeetY = (kind: Kind, seat: number, k: number) => seat + SPECS[kind].leg * k;
export const Sitter: React.FC<SitProps> = ({x, seat, scale, ...p}) => <Person {...p} x={x} y={sitFeetY(p.kind, seat, scale)} scale={scale} hideLegs />;
// the legs of a sitter seen from the front: short knees over the cushion, shins down to the floor, shoes
export const SitLegs: React.FC<{kind: Kind; x: number; seat: number; floor: number; k: number; pants: string; shoes: string; spread?: number; cross?: boolean}> = ({kind, x, seat, floor, k, pants, shoes, spread = 1}) => {
	const sp = SPECS[kind];
	const lw = sp.legW * k;
	const gx = (sp.legW / 2 + sp.legGap / 2) * k * spread;
	return (
		<g>
			{[-1, 1].map((s) => (
				<g key={s}>
					<rect x={x + s * gx * 1.08 - lw * 0.46} y={seat + 34 * k} width={lw * 0.92} height={Math.max(10, floor - seat - 52 * k)} fill={pants} />
					<rect x={x + s * gx * 1.08 - lw * 0.46} y={seat + 34 * k} width={lw * 0.92} height={Math.max(10, floor - seat - 52 * k)} fill="#000" opacity={s > 0 ? 0.14 : 0} />
					<rect x={x + s * gx - lw * 0.55} y={seat - 10 * k} width={lw * 1.1} height={64 * k} rx={lw * 0.45} fill={pants} />
					<rect x={x + s * gx * 1.08 - lw * 0.66} y={floor - 34 * k} width={lw * 1.32} height={36 * k} rx={14 * k} fill={shoes} />
				</g>
			))}
		</g>
	);
};

// ============================================================ the cat =====
const FUR = '#ea9440';
const FUR_D = '#c8702a';
const WHITE = '#fbf3e6';
// Барсик: a fat ginger tabby. sit = front view; walk = side view facing right (phase = walk cycle, bag = the bag in his
// teeth); eat = sitting with a chip in his paws, chewing. Origin: the middle of the ground under him.
export const Cat: React.FC<{
	id: string;
	x: number;
	y: number;
	s?: number;
	pose?: 'sit' | 'walk' | 'eat';
	phase?: number;
	look?: [number, number];
	blink?: number;
	happy?: boolean;
	chew?: number;
	tail?: number;
	bag?: boolean;
	flip?: boolean;
}> = ({id, x, y, s = 1, pose = 'sit', phase = 0, look = [0, 0], blink = 0, happy = false, chew = 0, tail = 0, bag = false, flip = false}) => {
	const sw = Math.sin(tail);
	if (pose === 'walk') {
		const legs = [-82, -54, 56, 84].map((lx, i) => {
			const a = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 22 * (i < 2 ? 1 : -1);
			return (
				<g key={i} transform={`translate(${lx},-66) rotate(${a})`}>
					<rect x={-13} y={0} width={26} height={68} rx={12} fill={i === 1 || i === 2 ? FUR : FUR_D} />
					<ellipse cx={3} cy={66} rx={17} ry={9} fill={WHITE} />
				</g>
			);
		});
		return (
			<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
				<Shaded id={id}>
					<g>
						<path d={`M -112,-108 C -176,${-150 + sw * 20} ${-178 + sw * 14},-230 ${-136 + sw * 26},-262`} stroke={FUR} strokeWidth={26} fill="none" strokeLinecap="round" />
						<path d={`M ${-150 + sw * 20},-236 C ${-146 + sw * 22},-250 ${-140 + sw * 24},-258 ${-136 + sw * 26},-262`} stroke={FUR_D} strokeWidth={26} fill="none" strokeLinecap="round" />
						{legs}
						<ellipse cx={0} cy={-104} rx={124} ry={56} fill={FUR} />
						<ellipse cx={14} cy={-80} rx={86} ry={28} fill={WHITE} />
						{[-60, -20, 20].map((k) => (
							<path key={k} d={`M ${k},-158 q 10,22 0,40`} stroke={FUR_D} strokeWidth={10} fill="none" strokeLinecap="round" />
						))}
						<g transform="translate(118,-152)">
							<path d="M -44,-26 L -36,-86 L -6,-46 Z" fill={FUR} />
							<path d="M 6,-44 L 30,-92 L 46,-30 Z" fill={FUR} />
							<path d="M -36,-36 L -32,-72 L -14,-46 Z" fill="#f2a8a0" />
							<ellipse cx={0} cy={0} rx={60} ry={52} fill={FUR} />
							<ellipse cx={34} cy={18} rx={30} ry={22} fill={WHITE} />
							<path d="M 54,6 L 66,10 L 56,18 Z" fill="#e07a80" />
							<ellipse cx={20} cy={-10} rx={11} ry={13} fill="#86c04a" />
							<ellipse cx={22 + look[0] * 3} cy={-10} rx={4} ry={11} fill="#14161a" />
							{blink > 0 && <rect x={6} y={-24} width={28} height={28 * blink} fill={FUR} />}
							{[-8, 0, 8].map((k) => (
								<line key={k} x1={-14 + k} y1={-44} x2={-10 + k} y2={-30} stroke={FUR_D} strokeWidth={6} strokeLinecap="round" />
							))}
							<line x1={46} y1={20} x2={96} y2={12} stroke="#fff" strokeWidth={3} opacity={0.8} />
							<line x1={46} y1={26} x2={94} y2={30} stroke="#fff" strokeWidth={3} opacity={0.8} />
						</g>
					</g>
				</Shaded>
				{bag && (
					<g transform="translate(206,-98) rotate(-18)">
						<ChipsBag s={0.4} flavor="КРАБ" open={1} />
					</g>
				)}
			</g>
		);
	}
	const eat = pose === 'eat';
	const eye = (ex: number) =>
		happy ? (
			<path key={ex} d={`M ${ex - 15},-206 Q ${ex},-224 ${ex + 15},-206`} stroke="#14161a" strokeWidth={7} fill="none" strokeLinecap="round" />
		) : (
			<g key={ex}>
				<ellipse cx={ex} cy={-208} rx={15} ry={18} fill="#86c04a" />
				<ellipse cx={ex + look[0] * 6} cy={-208 + look[1] * 6} rx={5.5} ry={14} fill="#14161a" />
				<circle cx={ex - 5 + look[0] * 5} cy={-214} r={3.5} fill="#fff" />
				{blink > 0 && <rect x={ex - 17} y={-228} width={34} height={38 * blink} fill={FUR} />}
			</g>
		);
	const cheek = eat ? 1 + chew * 0.12 : 1;
	return (
		<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
			<Shaded id={id}>
				<g>
					<path d={`M 52,-24 C 130,-14 ${160 + sw * 12},-84 ${126 + sw * 28},-150`} stroke={FUR} strokeWidth={26} fill="none" strokeLinecap="round" />
					<path d={`M ${136 + sw * 22},-128 C ${133 + sw * 25},-138 ${129 + sw * 27},-145 ${126 + sw * 28},-150`} stroke={FUR_D} strokeWidth={26} fill="none" strokeLinecap="round" />
					<ellipse cx={0} cy={-92} rx={76} ry={94} fill={FUR} />
					{[-1, 1].map((k) => (
						<g key={k}>
							<path d={`M ${k * 62},-120 q ${k * 14},18 ${k * 4},40`} stroke={FUR_D} strokeWidth={10} fill="none" strokeLinecap="round" />
							<path d={`M ${k * 70},-80 q ${k * 10},16 ${k * 2},34`} stroke={FUR_D} strokeWidth={10} fill="none" strokeLinecap="round" />
						</g>
					))}
					<ellipse cx={0} cy={-118} rx={40} ry={52} fill={WHITE} />
					{eat ? (
						<>
							<rect x={-40} y={-178} width={26} height={74} rx={13} fill={FUR} transform="rotate(-24 -27 -104)" />
							<rect x={14} y={-178} width={26} height={74} rx={13} fill={FUR} transform="rotate(24 27 -104)" />
							<ellipse cx={-46} cy={-12} rx={20} ry={11} fill={WHITE} />
							<ellipse cx={46} cy={-12} rx={20} ry={11} fill={WHITE} />
						</>
					) : (
						<>
							<rect x={-36} y={-72} width={26} height={66} rx={12} fill={FUR} />
							<rect x={10} y={-72} width={26} height={66} rx={12} fill={FUR} />
							<ellipse cx={-23} cy={-8} rx={18} ry={10} fill={WHITE} />
							<ellipse cx={23} cy={-8} rx={18} ry={10} fill={WHITE} />
						</>
					)}
					<path d="M -60,-224 L -48,-296 L -10,-252 Z" fill={FUR} />
					<path d="M 60,-224 L 48,-296 L 10,-252 Z" fill={FUR} />
					<path d="M -50,-236 L -44,-278 L -22,-252 Z" fill="#f2a8a0" />
					<path d="M 50,-236 L 44,-278 L 22,-252 Z" fill="#f2a8a0" />
					<ellipse cx={0} cy={-200} rx={70 * cheek} ry={60} fill={FUR} />
					<path d={`M ${-70 * cheek},-196 L ${-86 * cheek},-180 L ${-66 * cheek},-176 Z M ${70 * cheek},-196 L ${86 * cheek},-180 L ${66 * cheek},-176 Z`} fill={FUR} />
					{[-14, 0, 14].map((k) => (
						<line key={k} x1={k} y1={-256} x2={k * 0.8} y2={-232} stroke={FUR_D} strokeWidth={7} strokeLinecap="round" />
					))}
					{eye(-27)}
					{eye(27)}
					<ellipse cx={-15} cy={-178} rx={19 * cheek} ry={14} fill={WHITE} />
					<ellipse cx={15} cy={-178} rx={19 * cheek} ry={14} fill={WHITE} />
					<path d="M -8,-190 L 8,-190 L 0,-181 Z" fill="#e07a80" />
					{eat && chew > 0.5 ? (
						<ellipse cx={0} cy={-166} rx={9} ry={6} fill="#7a2e26" />
					) : (
						<path d="M -12,-170 Q -6,-164 0,-170 Q 6,-164 12,-170" stroke="#7a2e26" strokeWidth={3.5} fill="none" strokeLinecap="round" />
					)}
					{[-1, 1].map((k) => (
						<g key={k} stroke="#fff" strokeWidth={3} opacity={0.85}>
							<line x1={k * 34} y1={-180} x2={k * 92} y2={-192} />
							<line x1={k * 34} y1={-174} x2={k * 94} y2={-172} />
							<line x1={k * 34} y1={-168} x2={k * 88} y2={-152} />
						</g>
					))}
				</g>
			</Shaded>
			{eat && (
				<g transform="translate(0,-168) rotate(-10)">
					<Chip x={0} y={0} r={30} />
				</g>
			)}
		</g>
	);
};

// ============================================================ chips & props =====
// one chip: a wavy golden oval (r = half its width)
export const Chip: React.FC<{x: number; y: number; r?: number; rot?: number; wet?: number}> = ({x, y, r = 40, rot = 0, wet = 0}) => {
	const pts = Array.from({length: 14}).map((_, k) => {
		const a = (k / 14) * Math.PI * 2;
		const rr = r * (1 + 0.08 * Math.sin(k * 2.3));
		return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr * 0.78}`;
	});
	return (
		<g transform={`rotate(${rot} ${x} ${y})`}>
			<polygon points={pts.join(' ')} fill={wet > 0 ? '#d8b770' : GOLD} stroke={GOLD_D} strokeWidth={r * 0.09} strokeLinejoin="round" />
			<path d={`M ${x - r * 0.55},${y - r * 0.05} Q ${x},${y - r * 0.38} ${x + r * 0.5},${y - r * 0.08}`} stroke="#fff3c4" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" opacity={wet > 0 ? 0.2 : 0.8} />
			<circle cx={x + r * 0.25} cy={y + r * 0.22} r={r * 0.07} fill={GOLD_D} />
			<circle cx={x - r * 0.3} cy={y + r * 0.28} r={r * 0.05} fill={GOLD_D} />
		</g>
	);
};
// a heap of chips (a pile on a plate, in a barrel, in a bowl)
export const ChipPile: React.FC<{x: number; y: number; w: number; n?: number; r?: number; wet?: number; seed?: number}> = ({x, y, w, n = 14, r = 34, wet = 0, seed = 1}) => (
	<g>
		{Array.from({length: n}).map((_, k) => {
			const u = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
			const fr = u - Math.floor(u);
			const row = Math.floor(k / 5);
			return <Chip key={k} x={x - w / 2 + ((k % 5) + 0.5 + (row % 2) * 0.4) * (w / 5.4)} y={y - row * r * 0.7 - fr * 10} r={r * (0.85 + fr * 0.3)} rot={fr * 160 - 80} wet={wet} />;
		})}
	</g>
);

// the bag of chips (centre at the origin; ~260×340 at s = 1). open: the top torn open; flavor: the label;
// cut: a see-through window into the bag — the chips at the bottom, the gas above (1 = shown)
export const ChipsBag: React.FC<{s?: number; open?: number; flavor?: string; color?: string; cut?: number; gas?: 'air' | 'n2'; puff?: number; id?: string}> = ({
	s = 1,
	open = 0,
	flavor = 'КРАБ',
	color = '#e8352e',
	cut = 0,
	gas = 'n2',
	puff = 0,
	id = 'bag',
}) => {
	const w = 130 + puff * 14;
	const h = 170;
	const body = `M ${-w},${-h + 18} Q 0,${-h - 8 - puff * 10} ${w},${-h + 18} Q ${w + 16 + puff * 10},0 ${w},${h - 18} Q 0,${h + 8 + puff * 10} ${-w},${h - 18} Q ${-w - 16 - puff * 10},0 ${-w},${-h + 18} Z`;
	const zig = (yy: number) =>
		Array.from({length: 14})
			.map((_, k) => `${k === 0 ? 'M' : 'L'} ${-w + (k * 2 * w) / 13},${yy + (k % 2 ? 9 : -9)}`)
			.join(' ');
	return (
		<g transform={`scale(${s})`}>
			<path d={body} fill={color} />
			<path d={body} fill="#000" opacity={0.12} transform={`translate(${w * 0.55},0) scale(0.45,1)`} />
			<path d={zig(-h + 14)} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={8} fill="none" />
			<path d={zig(h - 14)} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={8} fill="none" />
			{/* the print: a yellow sun with chips, the word, the flavour ribbon */}
			<circle cx={0} cy={-6} r={88} fill={YEL} />
			<Chip x={-26} y={-2} r={44} rot={-18} />
			<Chip x={30} y={14} r={40} rot={22} />
			<text x={0} y={-92} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">
				ЧИПСЫ
			</text>
			<g transform="translate(0,112) rotate(-4)">
				<rect x={-104} y={-26} width={208} height={52} rx={12} fill={INK} />
				<text x={0} y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={YEL}>
					{flavor}
				</text>
			</g>
			{cut > 0 && (
				<g opacity={cut}>
					<defs>
						<clipPath id={`${id}-cut`}>
							<rect x={-w + 22} y={-h + 34} width={2 * w - 44} height={2 * h - 68} rx={22} />
						</clipPath>
					</defs>
					<g clipPath={`url(#${id}-cut)`}>
						<rect x={-w} y={-h} width={2 * w} height={2 * h} fill={gas === 'n2' ? '#dbeeff' : '#eef2f6'} />
						<ChipPile x={0} y={h - 52} w={2 * w - 40} n={15} r={30} seed={3} />
						{gas === 'n2' &&
							[[-70, -100], [40, -120], [-10, -40], [80, -40], [-80, -10], [30, 10]].map(([mx, my], k) => <N2 key={k} x={mx} y={my} s={0.9} rot={k * 37} />)}
					</g>
					<rect x={-w + 22} y={-h + 34} width={2 * w - 44} height={2 * h - 68} rx={22} fill="none" stroke="#fff" strokeWidth={8} />
				</g>
			)}
			{open > 0 && <ellipse cx={0} cy={-h + 20} rx={(w - 12) * open} ry={24 * open} fill="#3a1410" />}
		</g>
	);
};

// a nitrogen molecule N≡N (blue) and an oxygen molecule O=O (red)
export const N2: React.FC<{x: number; y: number; s?: number; rot?: number; label?: boolean}> = ({x, y, s = 1, rot = 0, label = true}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<circle cx={-17} cy={0} r={19} fill="#3d7fe0" />
		<circle cx={17} cy={0} r={19} fill="#3d7fe0" />
		<circle cx={-22} cy={-6} r={6} fill="#fff" opacity={0.5} />
		{label && (
			<text x={0} y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={20} fill="#fff" transform={`rotate(${-rot})`}>
				N₂
			</text>
		)}
	</g>
);
export const O2: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<circle cx={-16} cy={0} r={18} fill="#e0463a" />
		<circle cx={16} cy={0} r={18} fill="#e0463a" />
		<text x={0} y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={20} fill="#fff" transform={`rotate(${-rot})`}>
			O₂
		</text>
	</g>
);

export const Potato: React.FC<{x: number; y: number; r?: number; rot?: number; cut?: boolean}> = ({x, y, r = 60, rot = 0, cut = false}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<ellipse cx={0} cy={0} rx={r} ry={r * 0.72} fill="#b98a55" />
		<ellipse cx={r * 0.2} cy={r * 0.12} rx={r * 0.75} ry={r * 0.5} fill="#a87a48" opacity={0.5} />
		{[[-0.4, -0.2], [0.3, -0.3], [0.1, 0.3], [-0.2, 0.35]].map(([a, b], k) => (
			<circle key={k} cx={a * r} cy={b * r} r={r * 0.05} fill="#7a5530" />
		))}
		{cut && <ellipse cx={r * 0.85} cy={0} rx={r * 0.18} ry={r * 0.62} fill="#f4e2b0" />}
	</g>
);

// grandpa's newspaper, open (w × h around the origin)
export const Newspaper: React.FC<{w?: number; h?: number; fold?: number}> = ({w = 300, h = 380, fold = 0}) => {
	const ww = w * (1 - fold * 0.5);
	return (
		<g>
			<rect x={-ww / 2} y={-h / 2} width={ww} height={h} fill="#f1ece0" stroke="#cfc7b4" strokeWidth={3} />
			<line x1={0} y1={-h / 2} x2={0} y2={h / 2} stroke="#cfc7b4" strokeWidth={3} />
			<text x={-ww / 2 + 16} y={-h / 2 + 44} fontFamily={SERIF} fontWeight={900} fontSize={34} fill="#2a2a30">
				ВЕСТИ
			</text>
			{Array.from({length: 9}).map((_, k) => (
				<g key={k}>
					<rect x={-ww / 2 + 16} y={-h / 2 + 70 + k * 30} width={ww / 2 - 30} height={9} fill="#9a9488" />
					{fold < 0.5 && <rect x={14} y={-h / 2 + 70 + k * 30} width={ww / 2 - 30} height={9} fill="#9a9488" />}
				</g>
			))}
			<rect x={-ww / 2 + 16} y={h / 2 - 96} width={ww / 2 - 30} height={70} fill="#b8b0a0" />
		</g>
	);
};
export const SERIF = "'PT Serif', Georgia, serif";

// ============================================================ grandpa's living room =====
// back wall, window with the night, a lamp; the sofa (Тёма) on the left, the armchair (дед) on the right, a coffee table
export const FLOOR = 1180;
export const SOFA = {x0: 18, x1: 706, seat: 1092, base: 1296};
export const CHAIR = {x0: 712, x1: 1066, seat: 1100, base: 1306};
export const TABLE = {x: 470, y: 1452};
export const RoomBack: React.FC<{id: string; lamp?: number}> = ({id, lamp = 1}) => (
	<g>
		<Wallpaper id={`${id}-wp`} x={-400} y={-400} w={1900} h={FLOOR + 400} base="#e6c9a0" line="#d9b888" />
		<PlankFloor y={FLOOR} h={1200} color="#9a6a42" />
		<Baseboard y={FLOOR} />
		{/* the window: the night, the moon, the houses' lights */}
		<rect x={52} y={232} width={336} height={470} fill="#f4efe6" />
		<rect x={70} y={250} width={300} height={434} fill="#1c2550" />
		<circle cx={300} cy={330} r={34} fill="#f4eac4" />
		{[[110, 300], [180, 360], [240, 280], [140, 420]].map(([sx, sy], k) => (
			<circle key={k} cx={sx} cy={sy} r={3} fill="#fff" opacity={0.8} />
		))}
		<rect x={86} y={520} width={120} height={164} fill="#2d3660" />
		<rect x={226} y={480} width={130} height={204} fill="#262f58" />
		{[[100, 540], [140, 540], [100, 590], [240, 500], [290, 560], [250, 620]].map(([wx, wy], k) => (
			<rect key={k} x={wx} y={wy} width={22} height={26} fill="#ffd27a" opacity={0.85} />
		))}
		<rect x={217} y={250} width={6} height={434} fill="#f4efe6" />
		<rect x={70} y={460} width={300} height={6} fill="#f4efe6" />
		<path d="M 30,214 L 120,214 Q 92,450 128,720 L 30,720 Z" fill="#b8453a" />
		<path d="M 410,214 L 320,214 Q 348,450 312,720 L 410,720 Z" fill="#b8453a" />
		<rect x={20} y={204} width={400} height={16} rx={8} fill="#6a4a30" />
		{/* a picture and a shelf with a clock */}
		<rect x={492} y={318} width={190} height={150} fill="#7a5a3a" />
		<rect x={506} y={332} width={162} height={122} fill="#8fb4c8" />
		<path d="M 506,454 L 560,390 L 600,430 L 630,400 L 668,454 Z" fill="#5a8a5a" />
		<circle cx={630} cy={360} r={14} fill="#f4e2a0" />
		{/* the floor lamp behind the armchair */}
		<rect x={1006} y={500} width={10} height={700} fill="#3a3a40" />
		<path d="M 950,430 L 1072,430 L 1100,540 L 922,540 Z" fill="#f2d79a" />
		<path d="M 950,430 L 1072,430 L 1100,540 L 922,540 Z" fill="#fff6d8" opacity={0.4 * lamp} />
		<ellipse cx={1011} cy={560} rx={420} ry={360} fill="#ffd98a" opacity={0.16 * lamp} />
	</g>
);
// the sofa: the back (behind Тёма) and the front (seat cushion over his hips, the arms, the base)
const SOFA_C = {c: '#3f6f78', c2: '#4f8590', c3: '#2f565e'};
export const SofaBack: React.FC = () => (
	<g>
		<rect x={SOFA.x0 + 40} y={870} width={SOFA.x1 - SOFA.x0 - 80} height={260} rx={46} fill={SOFA_C.c} />
		<rect x={SOFA.x0 + 70} y={892} width={(SOFA.x1 - SOFA.x0 - 150) / 2} height={210} rx={38} fill={SOFA_C.c2} />
		<rect x={SOFA.x0 + 80 + (SOFA.x1 - SOFA.x0 - 150) / 2} y={892} width={(SOFA.x1 - SOFA.x0 - 150) / 2} height={210} rx={38} fill={SOFA_C.c2} />
	</g>
);
export const SofaFront: React.FC = () => (
	<g>
		<rect x={SOFA.x0 + 60} y={SOFA.seat - 24} width={SOFA.x1 - SOFA.x0 - 120} height={56} rx={22} fill={SOFA_C.c2} />
		<rect x={SOFA.x0 + 40} y={SOFA.seat + 22} width={SOFA.x1 - SOFA.x0 - 80} height={150} rx={24} fill={SOFA_C.c} />
		<rect x={SOFA.x0 + 40} y={SOFA.seat + 120} width={SOFA.x1 - SOFA.x0 - 80} height={52} fill={SOFA_C.c3} />
		{[SOFA.x0, SOFA.x1 - 84].map((ax, k) => (
			<g key={k}>
				<rect x={ax} y={960} width={84} height={300} rx={36} fill={SOFA_C.c} />
				<rect x={ax + 8} y={966} width={68} height={48} rx={24} fill={SOFA_C.c2} />
			</g>
		))}
		{[SOFA.x0 + 40, SOFA.x1 - 60].map((fx, k) => (
			<rect key={k} x={fx} y={SOFA.base - 30} width={22} height={34} fill="#3a2a1e" />
		))}
	</g>
);
const CHAIR_C = {c: '#9a4a36', c2: '#b45d46', c3: '#7a3a2a'};
export const ChairBack: React.FC = () => (
	<g>
		<rect x={CHAIR.x0 + 40} y={846} width={CHAIR.x1 - CHAIR.x0 - 80} height={290} rx={60} fill={CHAIR_C.c} />
		<rect x={CHAIR.x0 + 66} y={872} width={CHAIR.x1 - CHAIR.x0 - 132} height={230} rx={44} fill={CHAIR_C.c2} />
	</g>
);
export const ChairFront: React.FC = () => (
	<g>
		<rect x={CHAIR.x0 + 56} y={CHAIR.seat - 24} width={CHAIR.x1 - CHAIR.x0 - 112} height={56} rx={22} fill={CHAIR_C.c2} />
		<rect x={CHAIR.x0 + 40} y={CHAIR.seat + 22} width={CHAIR.x1 - CHAIR.x0 - 80} height={152} rx={24} fill={CHAIR_C.c} />
		<rect x={CHAIR.x0 + 40} y={CHAIR.seat + 122} width={CHAIR.x1 - CHAIR.x0 - 80} height={52} fill={CHAIR_C.c3} />
		{[CHAIR.x0, CHAIR.x1 - 80].map((ax, k) => (
			<g key={k}>
				<rect x={ax} y={980} width={80} height={290} rx={36} fill={CHAIR_C.c} />
				<rect x={ax + 8} y={986} width={64} height={46} rx={23} fill={CHAIR_C.c2} />
			</g>
		))}
		{[CHAIR.x0 + 40, CHAIR.x1 - 60].map((fx, k) => (
			<rect key={k} x={fx} y={CHAIR.base - 30} width={22} height={34} fill="#3a2a1e" />
		))}
	</g>
);
export const CoffeeTable: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<g>
		<ellipse cx={TABLE.x} cy={TABLE.y + 196} rx={280} ry={40} fill="#000" opacity={0.18} />
		{[-190, 170].map((dx, k) => (
			<rect key={k} x={TABLE.x + dx} y={TABLE.y + 10} width={24} height={180} fill="#6a4228" />
		))}
		<rect x={TABLE.x - 250} y={TABLE.y - 16} width={500} height={44} rx={14} fill="#8a5a36" />
		<rect x={TABLE.x - 250} y={TABLE.y - 26} width={500} height={24} rx={12} fill="#a8724a" />
		{children}
	</g>
);
export const RoomRug: React.FC = () => (
	<g>
		<path d="M 150,1330 L 930,1330 L 1080,1960 L 0,1960 Z" fill="#a8423a" />
		<path d="M 190,1356 L 890,1356 L 1020,1930 L 60,1930 Z" fill="none" stroke="#e8c26a" strokeWidth={10} />
		<path d="M 540,1420 L 640,1560 L 540,1700 L 440,1560 Z" fill="#e8c26a" opacity={0.7} />
	</g>
);

// the blink of a hero (seeded)
export const blink = (f: number, seed: number) => blinkAt(f, seed, 88);

// common faces
export const F = {
	calm: {eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0, 0]} as Face,
	angry: {eyes: 'narrow', brows: 'angry', mouth: 'frown', look: [0, 0]} as Face,
	shock: {eyes: 'wide', pupil: 0.55, brows: 'raised', mouth: 'o', look: [0, 0]} as Face,
	happy: {eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0, 0]} as Face,
	sly: {eyes: 'narrow', brows: 'raised', mouth: 'smile', look: [0, 0]} as Face,
	sad: {eyes: 'open', brows: 'sad', mouth: 'frown', look: [0, 0.2]} as Face,
};

// Тёма on the sofa (x = his middle), with the bag in his hands or not
export const TemaSit: React.FC<{id: string; f: number; face: Face; x?: number; armL?: ArmPose; armR?: ArmPose; headTurn?: number; headTilt?: number; itemL?: React.ReactNode; itemR?: React.ReactNode}> = ({
	id,
	f,
	face,
	x = 380,
	armL,
	armR,
	headTurn = 0.3,
	headTilt = 0,
	itemL,
	itemR,
}) => (
	<Sitter
		kind="teen"
		id={id}
		x={x}
		seat={SOFA.seat}
		scale={0.98}
		colors={TEMA}
		breathe={f}
		headTurn={headTurn}
		headTilt={headTilt}
		face={{blush: false, glasses: false, blink: blink(f, 3), ...face}}
		armL={armL}
		armR={armR}
		itemL={itemL}
		itemR={itemR}
	/>
);
export const TemaLegs: React.FC<{x?: number}> = ({x = 380}) => <SitLegs kind="teen" x={x} seat={SOFA.seat} floor={1300} k={0.98} pants={TEMA.pants} shoes={TEMA.shoes} />;

export const DedSit: React.FC<{id: string; f: number; face: Face; armL?: ArmPose; armR?: ArmPose; headTurn?: number; headTilt?: number; itemL?: React.ReactNode; itemR?: React.ReactNode}> = ({id, f, face, armL, armR, headTurn = -0.35, headTilt = 0, itemL, itemR}) => (
	<Sitter
		kind="dad"
		id={id}
		x={889}
		seat={CHAIR.seat}
		scale={0.8}
		colors={DED}
		plain
		beard={DED_BEARD}
		kneePatch={false}
		breathe={f + 20}
		headTurn={headTurn}
		headTilt={headTilt}
		face={{blush: false, glasses: true, blink: blink(f, 7), ...face}}
		armL={armL}
		armR={armR}
		itemL={itemL}
		itemR={itemR}
	/>
);
export const DedLegs: React.FC = () => <SitLegs kind="dad" x={889} seat={CHAIR.seat} floor={1312} k={0.8} pants={DED.pants} shoes={DED.shoes} />;

// ============================================================ the history people =====
export const CHEF = {top: '#f6f3ec', topDark: '#e2ddd2', pants: '#2b2b33', shoes: '#1d1d22', hair: '#231c18', skin: '#8d5b3e'};
export const GUEST = {top: '#2c2c3a', topDark: '#22222e', pants: '#3a3a46', shoes: '#141418', hair: '#7a5a3a', skin: '#efc6a4'};
export const LAURA = {top: '#5f86b0', topDark: '#4e7298', pants: '#efc6a4', shoes: '#4a2e2a', hair: '#3a2a20', skin: '#efc6a4'};
export const WORKER = {top: '#c98a6a', topDark: '#b07658', pants: '#efc6a4', shoes: '#4a2e2a', hair: '#6a4a2c', skin: '#f2c3a0'};
export const JOE = {top: '#5e6b48', topDark: '#4d583a', pants: '#4a4a40', shoes: '#2a2420', hair: '#3a2a20', skin: '#f2c3a0'};
export const SOVIET = {top: '#f4f2ee', topDark: '#dedad2', pants: '#efc6a4', shoes: '#3a2a2a', hair: '#6a4a2c', skin: '#f2c3a0'};

// a pleasant warm "old photo" tone over the history scenes (0 = none)
export const Sepia: React.FC<{a?: number}> = ({a = 0.22}) => (
	<>
		<rect x={-2000} y={-2000} width={6000} height={6000} fill="#c8944a" opacity={a} style={{mixBlendMode: 'multiply'}} />
	</>
);

// ============================================================ helpers =====
export const Cap: React.FC<{text: string; x: number; y: number; size?: number; color?: string; bg?: string; rot?: number; p?: number}> = ({text, x, y, size = 40, color = '#fff', bg = 'rgba(14,14,18,0.9)', rot = 0, p = 1}) =>
	p <= 0 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, background: bg, color, fontFamily: HEAVY, fontWeight: 900, fontSize: size, padding: '8px 24px', borderRadius: 14, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,0.35)'}}>
			{text}
		</div>
	);
