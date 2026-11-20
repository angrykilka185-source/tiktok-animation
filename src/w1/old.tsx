// «Что будет, если ты попадёшь в XX век» — the old city (1901–1921): houses with shop signs in the old spelling,
// cobblestones, kerosene and electric lamps, the horse cab with its «дуга», the water carrier, the tram, the first car,
// the biplane, the bakery, the cinema with its piano player, the photo studio, the ration point, the literacy class.
// Flat 2D art in the 1080×1920 picture coordinates (see components/Layers3D.tsx for the 3D camera).
import React from 'react';
import {Folk, Glow, rnd, SERIF} from './kit';
import {Person} from '../components/Person';

export const GY = 1240; // street level: the bottom of the façades
export const RY = 1316; // the road begins (the sidewalk is between)

// ================================================================ houses ======
export type Sign = {text: string; fg?: string; bg?: string; size?: number};
export const House: React.FC<{
	x: number;
	w: number;
	floors?: number;
	color: string;
	trim?: string;
	roof?: 'flat' | 'pitched';
	arch?: boolean;
	shop?: Sign;
	lit?: number;
	worn?: number;
	board?: boolean; // the shop is boarded up (1921)
	cols?: number;
	seed?: number;
	litColor?: string; // the colour of the lit windows (warm kerosene by default, white = electric)
}> = ({x, w, floors = 3, color, trim = '#e9e1cf', roof = 'pitched', arch = false, shop, lit = 0, worn = 0, board = false, cols, seed = 1, litColor = '#ffd27a'}) => {
	const gfh = 300;
	const fh = 250;
	const top = GY - gfh - (floors - 1) * fh - 50;
	const n = cols ?? Math.max(2, Math.round(w / 175));
	const cw = w / n;
	const glass = (k: number) => (lit > 0 && rnd(seed * 17 + k) > (litColor === '#ffd27a' ? 0.35 : -1) ? litColor : '#7d98ab');
	return (
		<g>
			{roof === 'pitched' && (
				<g>
					<path d={`M ${x - 6},${top - 8} L ${x + 40},${top - 110} L ${x + w - 40},${top - 110} L ${x + w + 6},${top - 8} Z`} fill="#5a5f66" />
					{Array.from({length: Math.floor(w / 60)}).map((_, k) => (
						<line key={k} x1={x + 30 + k * 60} y1={top - 104} x2={x + 22 + k * 60} y2={top - 10} stroke="#4a4f56" strokeWidth={4} />
					))}
					<rect x={x + w * 0.7} y={top - 180} width={46} height={90} fill="#8a5a44" />
					<rect x={x + w * 0.7 - 6} y={top - 188} width={58} height={14} fill="#6a4434" />
				</g>
			)}
			<rect x={x} y={top} width={w} height={GY - top} fill={color} />
			<rect x={x - 12} y={top - 12} width={w + 24} height={44} fill={trim} />
			{Array.from({length: Math.floor(w / 34)}).map((_, k) => (
				<rect key={k} x={x + 6 + k * 34} y={top + 32} width={16} height={14} fill={trim} opacity={0.8} />
			))}
			{/* upper floors */}
			{Array.from({length: floors - 1}).map((_, fl) => {
				const y0 = top + 50 + fl * fh;
				return (
					<g key={fl}>
						<rect x={x} y={y0 + fh - 12} width={w} height={14} fill={trim} opacity={0.85} />
						{Array.from({length: n}).map((__, c) => {
							const wx = x + c * cw + cw * 0.27;
							const ww = cw * 0.46;
							const wy = y0 + 50;
							const wh = fh * 0.58;
							const g = glass(fl * 10 + c);
							return (
								<g key={c}>
									{arch ? (
										<>
											<path d={`M ${wx - 12},${wy + wh + 10} L ${wx - 12},${wy + ww / 2} A ${ww / 2 + 12},${ww / 2 + 12} 0 0 1 ${wx + ww + 12},${wy + ww / 2} L ${wx + ww + 12},${wy + wh + 10} Z`} fill={trim} />
											<path d={`M ${wx},${wy + wh} L ${wx},${wy + ww / 2} A ${ww / 2},${ww / 2} 0 0 1 ${wx + ww},${wy + ww / 2} L ${wx + ww},${wy + wh} Z`} fill={g} />
										</>
									) : (
										<>
											<rect x={wx - 12} y={wy - 12} width={ww + 24} height={wh + 24} fill={trim} />
											<rect x={wx} y={wy} width={ww} height={wh} fill={g} />
											<rect x={wx - 20} y={wy - 30} width={ww + 40} height={16} fill={trim} />
										</>
									)}
									<rect x={wx + ww / 2 - 4} y={wy + 8} width={8} height={wh - 8} fill={trim} />
									<rect x={wx} y={wy + wh * 0.42} width={ww} height={7} fill={trim} />
									{g === '#7d98ab' && <rect x={wx + 6} y={wy + wh * 0.48} width={ww * 0.3} height={wh * 0.4} fill="#fff" opacity={0.18} />}
									<rect x={wx - 16} y={wy + wh + 8} width={ww + 32} height={14} fill={trim} />
								</g>
							);
						})}
					</g>
				);
			})}
			{/* ground floor */}
			<rect x={x} y={GY - gfh} width={w} height={16} fill={trim} />
			{shop ? (
				<g>
					<rect x={x + 30} y={GY - gfh + 22} width={w - 60} height={shop.size ?? 86} rx={6} fill={shop.bg ?? '#1f3a2a'} stroke="#c9a54a" strokeWidth={5} />
					<text x={x + w / 2} y={GY - gfh + 22 + (shop.size ?? 86) / 2 + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={SERIF} fontWeight={700} fontSize={Math.min(64, ((w - 90) / Math.max(4, shop.text.length)) * 1.45)} fill={shop.fg ?? '#f0d27a'} letterSpacing={3}>
						{shop.text}
					</text>
					{board ? (
						<g>
							<rect x={x + 40} y={GY - 180} width={w - 80} height={180} fill="#8a6a44" />
							{Array.from({length: 5}).map((_, k) => (
								<rect key={k} x={x + 40} y={GY - 176 + k * 36} width={w - 80} height={6} fill="#6a4e30" />
							))}
							<rect x={x + 30} y={GY - 140} width={w - 60} height={22} fill="#7a5a38" transform={`rotate(-6 ${x + w / 2} ${GY - 130})`} />
						</g>
					) : (
						<g>
							<rect x={x + 40} y={GY - 186} width={w * 0.56} height={186} fill="#3a4a58" />
							<rect x={x + 48} y={GY - 178} width={w * 0.56 - 16} height={170} fill={lit > 0 ? '#e8c47a' : '#9ab0c0'} opacity={0.9} />
							<rect x={x + 40 + w * 0.28 - 4} y={GY - 186} width={8} height={186} fill="#3a4a58" />
							<rect x={x + 60} y={GY - 170} width={w * 0.12} height={120} fill="#fff" opacity={0.2} />
							<rect x={x + w * 0.66} y={GY - 230} width={w * 0.24} height={230} fill="#4a3426" />
							<rect x={x + w * 0.66 + 10} y={GY - 220} width={w * 0.24 - 20} height={100} fill="#6a4c36" />
							<circle cx={x + w * 0.66 + 20} cy={GY - 110} r={7} fill="#c9a54a" />
						</g>
					)}
				</g>
			) : (
				<g>
					{Array.from({length: n}).map((_, c) => (
						<g key={c}>
							<rect x={x + c * cw + cw * 0.27 - 10} y={GY - gfh + 60} width={cw * 0.46 + 20} height={150} fill={trim} />
							<rect x={x + c * cw + cw * 0.27} y={GY - gfh + 70} width={cw * 0.46} height={130} fill={glass(90 + c)} />
						</g>
					))}
				</g>
			)}
			<rect x={x} y={GY - 26} width={w} height={26} fill="#000" opacity={0.15} />
			{worn > 0 &&
				Array.from({length: 7}).map((_, k) => (
					<path
						key={`w${k}`}
						d={`M ${x + rnd(seed + k) * w},${top + 80 + rnd(seed * 3 + k) * (GY - top - 300)} q 30,-20 70,0 q 20,30 -10,50 q -50,10 -60,-50 Z`}
						fill={k % 2 ? '#fff' : '#000'}
						opacity={0.12 * worn}
					/>
				))}
		</g>
	);
};

// the sky behind the houses
export const Sky: React.FC<{top?: string; bottom?: string}> = ({top = '#a9c3d6', bottom = '#efe6d2'}) => (
	<g>
		<defs>
			<linearGradient id="w1sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor={top} />
				<stop offset="100%" stopColor={bottom} />
			</linearGradient>
		</defs>
		<rect x={-600} y={-600} width={2300} height={2000} fill="url(#w1sky)" />
	</g>
);

// the sidewalk and the cobbled road, rows of stones getting bigger towards you
const COBBLE_ROWS = (() => {
	const rows: {y: number; h: number; stones: {x: number; w: number; c: number}[]}[] = [];
	const R = 15;
	for (let r = 0; r < R; r++) {
		const t0 = r / R;
		const t1 = (r + 1) / R;
		const y0 = RY + (2500 - RY) * Math.pow(t0, 1.7);
		const y1 = RY + (2500 - RY) * Math.pow(t1, 1.7);
		const h = y1 - y0;
		const sw = Math.max(26, h * 1.7);
		const stones: {x: number; w: number; c: number}[] = [];
		let x = -620 - (r % 2) * sw * 0.5;
		let k = 0;
		while (x < 1720) {
			const w = sw * (0.8 + 0.4 * rnd(r * 97 + k));
			stones.push({x, w, c: Math.floor(rnd(r * 31 + k * 7) * 3)});
			x += w + 4;
			k++;
		}
		rows.push({y: y0, h, stones});
	}
	return rows;
})();
const STONE = ['#7a7066', '#857a6e', '#6e665c'];
export const Street: React.FC<{wet?: boolean; rails?: boolean; dark?: number}> = ({wet = false, rails = false, dark = 0}) => (
	<g>
		<rect x={-620} y={GY} width={2340} height={RY - GY} fill="#a59c8e" />
		{Array.from({length: 24}).map((_, k) => (
			<line key={k} x1={-600 + k * 100} y1={GY} x2={-640 + k * 100} y2={RY} stroke="#8a8274" strokeWidth={3} />
		))}
		<rect x={-620} y={RY - 8} width={2340} height={12} fill="#7a7266" />
		<rect x={-620} y={RY} width={2340} height={1300} fill="#5e574f" />
		{COBBLE_ROWS.map((row, r) => (
			<g key={r}>
				{row.stones.map((s, k) => (
					<rect key={k} x={s.x} y={row.y + 2} width={s.w} height={row.h - 4} rx={Math.min(18, row.h * 0.3)} fill={STONE[s.c]} />
				))}
			</g>
		))}
		{rails && (
			<g>
				{[0, 1].map((k) => (
					<g key={k}>
						<path d={`M -620,${1470 + k * 150} L 1720,${1470 + k * 150}`} stroke="#3a3a3e" strokeWidth={14 + k * 6} />
						<path d={`M -620,${1466 + k * 150} L 1720,${1466 + k * 150}`} stroke="#b8bcc4" strokeWidth={4 + k * 2} />
					</g>
				))}
			</g>
		)}
		{wet && <rect x={-620} y={RY} width={2340} height={1300} fill="#9ab0c0" opacity={0.12} />}
		{dark > 0 && <rect x={-620} y={GY} width={2340} height={1400} fill="#05060c" opacity={dark} />}
	</g>
);

// ========================================================== street lamps ======
export const StreetLamp: React.FC<{x: number; y: number; kind: 'kerosene' | 'electric'; lit?: number; h?: number; id: string}> = ({x, y, kind, lit = 0, h = 560, id}) => (
	<g>
		<rect x={x - 9} y={y - h} width={18} height={h} fill="#2a2c30" />
		<rect x={x - 20} y={y - 30} width={40} height={30} fill="#2a2c30" />
		<rect x={x - 14} y={y - h * 0.62} width={28} height={12} fill="#2a2c30" />
		{kind === 'kerosene' ? (
			<g>
				<rect x={x - 40} y={y - h - 8} width={80} height={10} fill="#2a2c30" />
				<path d={`M ${x - 36},${y - h - 8} L ${x - 46},${y - h - 112} L ${x + 46},${y - h - 112} L ${x + 36},${y - h - 8} Z`} fill={lit > 0 ? '#ffd88a' : '#c9d6dc'} opacity={0.92} />
				<path d={`M ${x - 36},${y - h - 8} L ${x - 46},${y - h - 112} M ${x + 36},${y - h - 8} L ${x + 46},${y - h - 112} M ${x},${y - h - 8} L ${x},${y - h - 112}`} stroke="#2a2c30" strokeWidth={5} />
				<path d={`M ${x - 56},${y - h - 110} L ${x},${y - h - 150} L ${x + 56},${y - h - 110} Z`} fill="#2a2c30" />
				<rect x={x - 70} y={y - h - 40} width={140} height={8} fill="#2a2c30" />
				{lit > 0 && (
					<>
						<ellipse cx={x} cy={y - h - 52} rx={10} ry={18} fill="#fff3c0" opacity={lit} />
						<Glow id={`${id}g`} x={x} y={y - h - 60} r={170} color="#ffc86a" o={0.8 * lit} />
					</>
				)}
			</g>
		) : (
			<g>
				<path d={`M ${x},${y - h} q 0,-60 70,-70 q 50,0 60,40`} stroke="#2a2c30" strokeWidth={14} fill="none" />
				<path d={`M ${x + 96},${y - h - 32} L ${x + 164},${y - h - 32} L ${x + 150},${y - h - 4} L ${x + 110},${y - h - 4} Z`} fill="#2a2c30" />
				<ellipse cx={x + 130} cy={y - h + 2} rx={16} ry={12} fill={lit > 0 ? '#fffbe8' : '#d9dde2'} />
				{lit > 0 && <Glow id={`${id}g`} x={x + 130} y={y - h + 8} r={220} color="#fff3d6" o={0.85 * lit} />}
			</g>
		)}
	</g>
);

// ============================================================ the horse ======
// a horse in profile facing right, trotting with `phase` (radians; undefined = standing); feet at (0,0)
export const Horse: React.FC<{phase?: number; color?: string; mane?: string; harness?: boolean; duga?: string}> = ({phase, color = '#7a4a2a', mane = '#3a2216', harness = true, duga = '#b8402e'}) => {
	const p = phase ?? 0;
	const moving = phase !== undefined;
	const leg = (hx: number, hy: number, a: number, k: number, front: boolean) => {
		const ang = moving ? Math.sin(p + a) * 26 : 0;
		const knee = moving ? Math.max(0, Math.sin(p + a + (front ? 0.6 : -0.6))) * (front ? 34 : -28) : 0;
		const dark = k > 1;
		return (
			<g key={k} transform={`translate(${hx},${hy}) rotate(${ang})`}>
				<rect x={-15} y={-10} width={30} height={124} rx={14} fill={color} opacity={dark ? 0.82 : 1} />
				<g transform={`translate(0,110) rotate(${knee})`}>
					<rect x={-11} y={-6} width={22} height={112} rx={10} fill={color} opacity={dark ? 0.82 : 1} />
					<rect x={-14} y={96} width={28} height={22} rx={5} fill="#2a2420" />
				</g>
			</g>
		);
	};
	const bob = moving ? Math.abs(Math.sin(p)) * -8 : 0;
	return (
		<g transform={`translate(0,${bob})`}>
			{/* far legs */}
			{leg(-118, -230, Math.PI, 2, false)}
			{leg(104, -232, 0, 3, true)}
			{/* tail */}
			<path d={`M -170,-300 C -230,-280 ${-246 + (moving ? Math.sin(p * 2) * 12 : 0)},-200 -236,-120 C -214,-170 -200,-240 -160,-276 Z`} fill={mane} />
			{/* body */}
			<ellipse cx={-10} cy={-290} rx={180} ry={84} fill={color} />
			{/* neck & head */}
			<path d="M 110,-330 C 140,-400 160,-460 200,-500 L 250,-470 C 236,-420 214,-340 170,-262 Z" fill={color} />
			<path d="M 196,-512 C 226,-534 252,-520 300,-440 C 312,-418 300,-400 276,-404 C 246,-410 222,-440 196,-470 Z" fill={color} />
			<ellipse cx={292} cy={-418} rx={14} ry={10} fill="#2a2420" opacity={0.6} />
			<circle cx={238} cy={-486} r={8} fill="#1a1412" />
			<path d="M 204,-516 L 214,-552 L 228,-512 Z" fill={color} />
			{/* mane */}
			<path d="M 114,-336 C 140,-410 168,-470 204,-512 C 192,-470 164,-410 140,-320 Z" fill={mane} />
			{/* near legs */}
			{leg(-140, -236, 0, 0, false)}
			{leg(84, -236, Math.PI, 1, true)}
			{harness && (
				<g>
					<path d="M 128,-380 C 150,-340 168,-300 176,-262" stroke="#3a2a1e" strokeWidth={30} fill="none" strokeLinecap="round" />
					<path d="M 132,-376 C 152,-338 170,-300 178,-264" stroke="#c9a54a" strokeWidth={6} fill="none" strokeDasharray="10 12" />
					{duga && <path d="M 112,-300 C 110,-470 230,-470 226,-300" stroke={duga} strokeWidth={18} fill="none" strokeLinecap="round" />}
					<path d="M -40,-300 L 120,-310" stroke="#3a2a1e" strokeWidth={10} />
					<path d="M 200,-470 L 290,-428" stroke="#3a2a1e" strokeWidth={8} />
				</g>
			)}
		</g>
	);
};

// a wheel with spokes turning by `rot` degrees
export const Wheel: React.FC<{x: number; y: number; r: number; rot: number; color?: string}> = ({x, y, r, rot, color = '#3a2a1e'}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<circle r={r} fill="none" stroke={color} strokeWidth={r * 0.14} />
		<circle r={r * 0.16} fill={color} />
		{Array.from({length: 10}).map((_, k) => (
			<line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 5) * r} y2={Math.sin((k * Math.PI) / 5) * r} stroke={color} strokeWidth={r * 0.06} />
		))}
	</g>
);

// the horse cab (пролётка): the horse, the cab with a folded hood, the bearded driver; faces right; feet at (0,0)
export const Cab: React.FC<{phase?: number; id: string; color?: string; fare?: React.ReactNode}> = ({phase, id, color = '#2a2c34', fare}) => {
	const rot = ((phase ?? 0) * 180) / Math.PI;
	return (
		<g>
			<Wheel x={-420} y={-120} r={120} rot={rot * 0.8} />
			<Wheel x={-150} y={-90} r={90} rot={rot} />
			<path d="M -520,-250 L -460,-150 L -110,-150 L -70,-230 L -150,-250 Z" fill={color} />
			<path d="M -540,-252 C -560,-340 -520,-420 -440,-430 L -420,-252 Z" fill="#1a1c22" />
			{fare}
			<path d="M -500,-260 L -380,-260 L -380,-330 L -500,-330 Z" fill="#5a2a2a" />
			<g transform="translate(-170,-92)">
				<Person kind="dad" id={`${id}drv`} plain hideLegs colors={{top: '#2a3a5a', topDark: '#2a3a5a', hair: '#3a2a20'}} beard="#3a2a20" hat={{type: 'bowler', color: '#1c1c20'}} scale={0.34} armR={{target: [260, -160], bend: -1}} armL={{target: [250, -180], bend: -1}} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false}} />
			</g>
			<path d="M -100,-230 L 40,-262" stroke="#3a2a1e" strokeWidth={10} />
			<path d="M -90,-200 L 60,-270" stroke="#3a2a1e" strokeWidth={8} />
			<g transform="translate(220,0)">
				<Horse phase={phase} />
			</g>
			<path d="M -80,-342 L 360,-392" stroke="#2a1e14" strokeWidth={4} />
		</g>
	);
};

// the water carrier's cart: the horse, a big barrel on two wheels; faces right; feet at (0,0)
export const WaterCart: React.FC<{phase?: number}> = ({phase}) => {
	const rot = ((phase ?? 0) * 180) / Math.PI;
	return (
		<g>
			<Wheel x={-260} y={-110} r={110} rot={rot * 0.9} />
			<rect x={-460} y={-200} width={380} height={24} fill="#5a3a24" />
			<ellipse cx={-280} cy={-320} rx={170} ry={120} fill="#8a5a34" />
			{[-0.7, -0.25, 0.25, 0.7].map((k) => (
				<line key={k} x1={-280 + k * 170} y1={-430} x2={-280 + k * 170} y2={-210} stroke="#3a2a1e" strokeWidth={14} />
			))}
			<rect x={-300} y={-450} width={40} height={30} fill="#5a3a24" />
			<path d="M -80,-200 L 60,-250" stroke="#3a2a1e" strokeWidth={10} />
			<g transform="translate(200,0)">
				<Horse phase={phase} color="#8a7a6a" mane="#4a3e34" />
			</g>
		</g>
	);
};

// =========================================================== the tram 1911 ===
export const Tram: React.FC<{id: string; num?: string; wheel?: number}> = ({id, num = '4', wheel = 0}) => (
	<g>
		<rect x={-470} y={-560} width={940} height={36} fill="#2a2c30" />
		<path d="M 0,-560 L 160,-1200" stroke="#2a2c30" strokeWidth={10} />
		<circle cx={160} cy={-1200} r={10} fill="#2a2c30" />
		<rect x={-500} y={-524} width={1000} height={250} rx={18} fill="#efe2c0" />
		{Array.from({length: 7}).map((_, k) => (
			<rect key={k} x={-430 + k * 124} y={-500} width={100} height={150} rx={10} fill="#7d98ab" />
		))}
		<rect x={-500} y={-274} width={1000} height={170} fill="#a8302a" />
		<rect x={-500} y={-280} width={1000} height={14} fill="#c9a54a" />
		<text x={0} y={-180} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={52} fill="#f0d27a" letterSpacing={6}>
			ГОРОДСКОЙ ТРАМВАЙ
		</text>
		<rect x={-560} y={-470} width={60} height={366} fill="#8a2622" />
		<rect x={500} y={-470} width={60} height={366} fill="#8a2622" />
		<rect x={-80} y={-610} width={160} height={70} rx={10} fill="#fff" stroke="#2a2c30" strokeWidth={5} />
		<text x={0} y={-560} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={56} fill="#a8302a">
			№{num}
		</text>
		<rect x={-560} y={-104} width={1120} height={30} fill="#2a2c30" />
		{[-330, 330].map((wx) => (
			<g key={wx}>
				<Wheel x={wx} y={-50} r={56} rot={wheel} color="#1a1c20" />
			</g>
		))}
		<g transform="translate(530,-104)">
			<Person kind="dad" id={`${id}mot`} plain kneePatch={false} colors={{top: '#2a3a5a', topDark: '#2a3a5a'}} moustache="#3a2a20" hat={{type: 'peak', color: '#2a3a5a', band: '#a8302a'}} scale={0.27} armL={{target: [-120, -420], bend: 1}} face={{mouth: 'flat', blush: false}} />
		</g>
	</g>
);

// ============================================================ the car 1911 ===
// an open motor car facing right, feet (the road) at (0,0)
export const Car1911: React.FC<{id: string; wheel?: number; color?: string}> = ({id, wheel = 0, color = '#1f3a2a'}) => (
	<g>
		<g transform="translate(-40,-100)">
			<Person kind="dad" id={`${id}drv`} plain hideLegs colors={{top: '#5a4a36', topDark: '#5a4a36'}} moustache="#3a2a20" cap="#3a3530" scale={0.32} armR={{target: [200, -60], bend: -1}} armL={{target: [180, -80], bend: -1}} face={{eyes: 'open', mouth: 'smile', blush: false}} />
			<rect x={-26} y={-338} width={52} height={14} rx={7} fill="#2a2c30" />
			<circle cx={-11} cy={-330} r={10} fill="#9ad0e0" stroke="#c9a54a" strokeWidth={3} />
			<circle cx={11} cy={-330} r={10} fill="#9ad0e0" stroke="#c9a54a" strokeWidth={3} />
		</g>
		<g transform="translate(-330,-180)">
			<Person kind="dad" id={`${id}pas`} plain hideLegs colors={{top: '#2e2e36', topDark: '#2e2e36'}} moustache="#2a2220" hat={{type: 'bowler', color: '#1c1c20'}} scale={0.3} face={{eyes: 'open', mouth: 'flat', blush: false}} />
		</g>
		<path d="M -460,-150 L -460,-330 L -250,-330 L -230,-250 L 120,-250 L 330,-220 L 360,-150 Z" fill={color} />
		<rect x={120} y={-290} width={210} height={70} rx={10} fill={color} />
		<rect x={300} y={-300} width={40} height={90} rx={6} fill="#c9a54a" />
		<ellipse cx={370} cy={-270} rx={22} ry={26} fill="#f4e6b0" stroke="#c9a54a" strokeWidth={6} />
		<rect x={-480} y={-160} width={860} height={22} fill="#1a1c20" />
		<path d="M -540,-150 Q -500,-220 -380,-210 L -380,-150 Z M 200,-150 Q 240,-230 360,-210 L 380,-150 Z" fill="#1a1c20" />
		<path d="M 60,-360 L 100,-250" stroke="#1a1c20" strokeWidth={10} />
		<path d="M 90,-372 L 110,-252" stroke="#cfe6f0" strokeWidth={26} opacity={0.5} />
		<Wheel x={-330} y={-90} r={90} rot={wheel} color="#1a1c20" />
		<Wheel x={250} y={-90} r={90} rot={wheel} color="#1a1c20" />
	</g>
);

// =========================================================== the biplane =====
export const Biplane: React.FC<{prop: number}> = ({prop}) => (
	<g>
		<rect x={-300} y={-120} width={600} height={30} rx={14} fill="#e8dcc0" />
		<rect x={-300} y={40} width={600} height={30} rx={14} fill="#dccfb0" />
		{[-220, -80, 80, 220].map((x) => (
			<line key={x} x1={x} y1={-92} x2={x} y2={42} stroke="#6a4a2a" strokeWidth={8} />
		))}
		<path d="M -220,-92 L -80,42 M -80,-92 L -220,42 M 220,-92 L 80,42 M 80,-92 L 220,42" stroke="#555" strokeWidth={2.5} />
		<path d="M -300,-30 L 60,-20 L 60,40 L -300,30 Z" fill="#c9b48a" />
		<path d="M -300,-30 L -380,-90 L -360,10 L -300,30 Z" fill="#b8a07a" />
		<rect x={-380} y={-6} width={110} height={16} fill="#b8a07a" />
		<rect x={40} y={-36} width={60} height={86} rx={20} fill="#6a6a70" />
		<ellipse cx={112} cy={6} rx={10} ry={86 * Math.abs(Math.cos(prop))} fill="#3a2a1e" />
		<ellipse cx={112} cy={6} rx={8} ry={90} fill="#3a2a1e" opacity={0.2} />
		<circle cx={-40} cy={-44} r={26} fill="#5a3a24" />
		<rect x={-66} y={-56} width={52} height={14} rx={7} fill="#9ad0e0" />
		<Wheel x={0} y={110} r={34} rot={0} color="#2a2c30" />
		<line x1={0} y1={70} x2={0} y2={110} stroke="#2a2c30" strokeWidth={8} />
	</g>
);

// ===================================================== the room of 1901 =====
// a log wall, a small window onto the street (`view` = what is outside), the iron bed, the kerosene lamp on the table
export const Room1901: React.FC<{view?: React.ReactNode; lamp?: number; calendar?: boolean; id: string}> = ({view, lamp = 1, calendar = true, id}) => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#9a6e44" />
		{Array.from({length: 30}).map((_, k) => (
			<g key={k}>
				<rect x={-600} y={-560 + k * 90} width={2300} height={10} fill="#7a5232" />
				<rect x={-600} y={-530 + k * 90} width={2300} height={30} fill="#b07e50" opacity={0.25} />
			</g>
		))}
		{/* the window */}
		<rect x={600} y={300} width={420} height={520} fill="#5a3a22" />
		<svg x={620} y={320} width={380} height={480} viewBox="600 300 380 480" overflow="hidden">
			{view ?? <rect x={600} y={300} width={380} height={480} fill="#cfe0ea" />}
		</svg>
		<rect x={804} y={320} width={12} height={480} fill="#5a3a22" />
		<rect x={620} y={540} width={380} height={12} fill="#5a3a22" />
		<rect x={580} y={810} width={460} height={34} fill="#6a4628" />
		{calendar && <Calendar x={150} y={330} />}
		{/* the bed */}
		<rect x={-520} y={1080} width={1100} height={60} fill="#3a3a40" />
		<rect x={-500} y={980} width={1060} height={150} rx={30} fill="#d8c8a8" />
		{Array.from({length: 7}).map((_, k) => (
			<rect key={k} x={-490 + k * 150} y={1000} width={140} height={120} fill={['#a8402e', '#c9a227', '#4a6a8a', '#7a8a4a', '#8a4a6a', '#c9783a', '#4a7a6a'][k]} opacity={0.85} />
		))}
		<path d="M 560,1140 L 560,820 Q 560,780 600,780 L 620,780" stroke="#3a3a40" strokeWidth={16} fill="none" />
		{[600, 640, 680].map((x) => (
			<line key={x} x1={x - 20} y1={800} x2={x - 20} y2={1130} stroke="#3a3a40" strokeWidth={8} />
		))}
		<rect x={-520} y={1140} width={22} height={260} fill="#3a3a40" />
		<rect x={540} y={1140} width={22} height={260} fill="#3a3a40" />
		{/* the table with the lamp */}
		<rect x={700} y={1180} width={420} height={30} fill="#6a4628" />
		<rect x={730} y={1210} width={24} height={300} fill="#5a3a22" />
		<rect x={1060} y={1210} width={24} height={300} fill="#5a3a22" />
		<KeroseneLamp x={880} y={1180} s={0.9} flame={lamp} id={`${id}lamp`} />
		<rect x={-600} y={1400} width={2300} height={1300} fill="#7a5232" />
		{Array.from({length: 16}).map((_, k) => (
			<rect key={k} x={-600 + k * 150} y={1400} width={8} height={1300} fill="#5a3a22" />
		))}
	</g>
);

// the wall calendar «КАЛЕНДАРЬ НА 1901 ГОДЪ» (250 × 330, top-left at x, y); `hi` 0…1 = the year glows
export const Calendar: React.FC<{x: number; y: number; hi?: number}> = ({x, y, hi = 0}) => (
	<g transform={`translate(${x},${y})`}>
		<rect x={6} y={8} width={250} height={330} fill="#000" opacity={0.2} />
		<rect x={0} y={0} width={250} height={330} fill="#f4ecd8" stroke="#8a6a44" strokeWidth={6} />
		<rect x={20} y={20} width={210} height={52} fill="#a8302a" />
		<text x={125} y={56} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} fill="#f4ecd8">
			КАЛЕНДАРЬ
		</text>
		<text x={125} y={104} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={24} fill="#5a4a3a">
			НА
		</text>
		{hi > 0 && <ellipse cx={125} cy={170} rx={120 * hi} ry={60 * hi} fill="#ffd34a" opacity={0.35 * hi} />}
		<text x={125} y={200} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={92} fill={hi > 0.5 ? '#a8302a' : '#2a2220'}>
			1901
		</text>
		<text x={125} y={256} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={40} fill="#2a2220">
			ГОДЪ
		</text>
		<path d="M 40,290 L 210,290" stroke="#a8302a" strokeWidth={6} />
		<path d="M 60,306 L 190,306" stroke="#a8302a" strokeWidth={3} />
		<circle cx={125} cy={0} r={8} fill="#3a2a1e" />
	</g>
);

// a table kerosene lamp (glass chimney, the flame `flame` 0…1); (x, y) = the bottom
export const KeroseneLamp: React.FC<{x: number; y: number; s?: number; flame?: number; id: string}> = ({x, y, s = 1, flame = 1, id}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{flame > 0 && <Glow id={`${id}g`} x={0} y={-230} r={360} color="#ffc86a" o={0.75 * flame} />}
		<ellipse cx={0} cy={-6} rx={70} ry={14} fill="#6a5a3a" />
		<path d="M -60,-6 C -80,-60 -60,-110 0,-118 C 60,-110 80,-60 60,-6 Z" fill="#c9a54a" />
		<rect x={-30} y={-140} width={60} height={26} rx={6} fill="#8a7a5a" />
		<path d="M -26,-140 C -46,-190 -30,-240 -18,-300 L 18,-300 C 30,-240 46,-190 26,-140 Z" fill="#f4f0e0" opacity={0.55} stroke="#fff" strokeWidth={3} />
		{flame > 0 && <path d={`M 0,${-150 - 60 * flame} C 14,${-170 - 30 * flame} 12,-150 0,-142 C -12,-150 -14,${-170 - 30 * flame} 0,${-150 - 60 * flame} Z`} fill="#ffb347" />}
		{flame > 0 && <path d={`M 0,${-152 - 34 * flame} C 6,-160 5,-150 0,-146 C -5,-150 -6,-160 0,${-152 - 34 * flame} Z`} fill="#fff3c0" />}
	</g>
);

// ============================================================= the bakery ====
const Loaf: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
	k === 0 ? (
		<g>
			<ellipse cx={x} cy={y} rx={56} ry={34} fill="#c9843a" />
			<path d={`M ${x - 34},${y - 10} q 34,-16 68,0`} stroke="#e8b06a" strokeWidth={6} fill="none" />
		</g>
	) : k === 1 ? (
		<g>
			<circle cx={x} cy={y} r={30} fill="none" stroke="#d8984a" strokeWidth={16} />
		</g>
	) : (
		<g>
			<path d={`M ${x - 50},${y + 20} A 50,46 0 0 1 ${x + 50},${y + 20} Z`} fill="#b8743a" />
			<path d={`M ${x - 14},${y + 18} L ${x - 14},${y - 8} A 14,14 0 0 1 ${x + 14},${y - 8} L ${x + 14},${y + 18}`} fill="#8a5428" />
		</g>
	);
export const Bakery: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#e8d6b0" />
		<rect x={-600} y={1150} width={2300} height={1500} fill="#8a6a44" />
		{/* shelves */}
		{[260, 520, 780].map((sy, r) => (
			<g key={sy}>
				<rect x={-200} y={sy} width={1480} height={24} fill="#6a4628" />
				{Array.from({length: 11}).map((_, k) => (
					<Loaf key={k} x={-140 + k * 136} y={sy - 34} k={(k + r) % 3} />
				))}
			</g>
		))}
		<rect x={-220} y={-200} width={30} height={1100} fill="#6a4628" />
		<rect x={1270} y={-200} width={30} height={1100} fill="#6a4628" />
		{/* baranki strings */}
		{[40, 980].map((sx) => (
			<g key={sx}>
				<line x1={sx} y1={-100} x2={sx} y2={140} stroke="#6a4628" strokeWidth={6} />
				{[0, 1, 2, 3, 4].map((k) => (
					<circle key={k} cx={sx} cy={-60 + k * 44} r={20} fill="none" stroke="#d8984a" strokeWidth={11} />
				))}
			</g>
		))}
		<rect x={300} y={-140} width={480} height={90} rx={8} fill="#1f3a2a" stroke="#c9a54a" strokeWidth={6} />
		<text x={540} y={-80} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={56} fill="#f0d27a" letterSpacing={4}>
			БУЛОЧНАЯ
		</text>
		{/* the counter */}
		<rect x={-600} y={1080} width={2300} height={70} fill="#7a5232" />
		<rect x={-600} y={1150} width={2300} height={500} fill="#6a4628" />
		{Array.from({length: 10}).map((_, k) => (
			<rect key={k} x={-560 + k * 240} y={1190} width={200} height={400} rx={10} fill="#5a3a22" />
		))}
		{/* the scales */}
		<g transform="translate(860,1080)">
			<rect x={-90} y={-20} width={180} height={20} fill="#c9a54a" />
			<rect x={-8} y={-150} width={16} height={130} fill="#8a7a5a" />
			<path d="M -110,-150 L 110,-150" stroke="#8a7a5a" strokeWidth={10} />
			<path d="M -150,-110 Q -110,-80 -70,-110 Z M 70,-110 Q 110,-80 150,-110 Z" fill="#c9a54a" />
			<path d="M -110,-150 L -150,-110 M -110,-150 L -70,-110 M 110,-150 L 70,-110 M 110,-150 L 150,-110" stroke="#8a7a5a" strokeWidth={3} />
		</g>
	</g>
);

// ======================================================== the cinema 1911 ====
// the dark hall: the screen with a silent film (`film` = the frame number), the piano under it, rows of heads
export const Cinema: React.FC<{film: number; sound?: number; heads?: number; taper?: React.ReactNode}> = ({film, sound = 0, heads = 0, taper}) => {
	const tx = ((film * 7) % 900) - 300;
	return (
		<g>
			<rect x={-600} y={-600} width={2300} height={3200} fill="#16131a" />
			<rect x={-600} y={-600} width={2300} height={3200} fill="#3a2a40" opacity={0.25} />
			{/* the screen */}
			<rect x={70} y={180} width={940} height={620} fill="#d9d6cc" />
			<svg x={90} y={200} width={900} height={580} viewBox="0 0 900 580">
				<rect width={900} height={580} fill="#a9a69c" />
				<rect y={380} width={900} height={200} fill="#76746c" />
				<path d={`M -100,400 L 1000,400`} stroke="#3a3a36" strokeWidth={10} />
				<g transform={`translate(${tx},0)`}>
					<rect x={0} y={220} width={300} height={150} fill="#2a2a28" />
					<rect x={240} y={150} width={50} height={80} fill="#2a2a28" />
					<circle cx={60} cy={380} r={40} fill="#1a1a18" />
					<circle cx={170} cy={380} r={40} fill="#1a1a18" />
					<circle cx={260} cy={380} r={30} fill="#1a1a18" />
					<ellipse cx={265} cy={120} rx={40} ry={26} fill="#e8e6de" opacity={0.6} />
					<ellipse cx={230} cy={70} rx={60} ry={36} fill="#e8e6de" opacity={0.4} />
				</g>
				<line x1={320 + ((film * 13) % 300)} y1={0} x2={318 + ((film * 13) % 300)} y2={580} stroke="#fff" strokeWidth={2} opacity={0.35} />
				<line x1={700 - ((film * 9) % 400)} y1={0} x2={702 - ((film * 9) % 400)} y2={580} stroke="#000" strokeWidth={2} opacity={0.3} />
			</svg>
			<rect x={40} y={150} width={1000} height={36} fill="#5a1a1a" />
			<rect x={-600} y={150} width={640} height={720} fill="#6a1e22" />
			<rect x={1040} y={150} width={640} height={720} fill="#6a1e22" />
			{/* the beam from the projector */}
			<path d="M 540,-600 L 70,180 L 1010,180 Z" fill="#f4f0e0" opacity={0.07} />
			{/* the piano */}
			<g transform="translate(-40,1020)">
				<rect x={0} y={-260} width={440} height={260} rx={10} fill="#2a1a14" />
				<rect x={20} y={-120} width={400} height={40} fill="#f4f0e8" />
				{Array.from({length: 14}).map((_, k) => (
					<rect key={k} x={36 + k * 28} y={-120} width={14} height={24} fill="#1a1a1a" />
				))}
				<rect x={30} y={-250} width={380} height={110} fill="#3a241c" />
			</g>
			{taper}
			{/* rows of heads (from behind) */}
			{Array.from({length: 3}).map((_, r) =>
				Array.from({length: 7}).map((__, k) => {
					const hx = -60 + k * 190 + (r % 2) * 90;
					const hy = 1300 + r * 230;
					const turn = heads > 0 && rnd(r * 9 + k) > 0.3 ? heads : 0;
					return (
						<g key={`${r}-${k}`} transform={`translate(${hx},${hy}) scale(${1 + r * 0.25})`}>
							<rect x={-110} y={40} width={220} height={260} rx={70} fill="#0c0a10" />
							<ellipse cx={turn * 14} cy={0} rx={62} ry={74} fill="#1c1820" />
							{turn > 0.3 && <ellipse cx={turn * 30} cy={4} rx={40} ry={56} fill="#c9a08a" opacity={0.55 * turn} />}
							{rnd(r * 5 + k) > 0.6 && <ellipse cx={0} cy={-56} rx={92} ry={20} fill="#0c0a10" />}
						</g>
					);
				}),
			)}
			{sound > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#000" opacity={0.15 * sound} />}
		</g>
	);
};

// ===================================================== the photo studio ======
// a painted backdrop (a column and a curtain), the big wooden camera on a tripod with its black cloth
export const Studio: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#5a4a3e" />
		<rect x={-200} y={60} width={900} height={1180} fill="#c9bca2" />
		<rect x={-200} y={60} width={900} height={1180} fill="#8a7a62" opacity={0.25} />
		<rect x={40} y={200} width={110} height={900} fill="#e8dcc4" />
		<rect x={20} y={170} width={150} height={40} fill="#e8dcc4" />
		<rect x={20} y={1090} width={150} height={40} fill="#e8dcc4" />
		<path d="M 500,60 C 460,400 640,700 560,1240 L 700,1240 L 700,60 Z" fill="#7a2a2a" />
		<path d="M 520,60 C 500,300 600,500 580,700" stroke="#5a1a1a" strokeWidth={12} fill="none" />
		<rect x={-600} y={1240} width={2300} height={1400} fill="#6a5040" />
		<rect x={-140} y={1100} width={240} height={30} fill="#5a3a22" />
		<rect x={-130} y={1130} width={18} height={180} fill="#5a3a22" />
		<rect x={70} y={1130} width={18} height={180} fill="#5a3a22" />
	</g>
);
export const BigCamera: React.FC<{cloth?: number}> = ({cloth = 1}) => (
	<g>
		<path d="M 0,-470 L -150,0 M 0,-470 L 150,0 M 0,-470 L 30,0" stroke="#6a4628" strokeWidth={22} strokeLinecap="round" />
		<rect x={-130} y={-640} width={260} height={180} rx={10} fill="#6a4628" />
		<rect x={-120} y={-630} width={240} height={160} rx={8} fill="#8a5a34" />
		<path d="M -120,-620 L -250,-600 L -250,-500 L -120,-480 Z" fill="#2a2420" />
		{[-150, -180, -210, -240].map((x) => (
			<line key={x} x1={x} y1={-610 + (x + 120) * -0.14} x2={x} y2={-490 - (x + 120) * -0.14} stroke="#4a3a30" strokeWidth={3} />
		))}
		<rect x={-300} y={-590} width={60} height={80} rx={8} fill="#c9a54a" />
		<circle cx={-306} cy={-550} r={30} fill="#1a1a1a" stroke="#c9a54a" strokeWidth={6} />
		<path d={`M 110,-650 C 210,-660 ${240 + 20 * cloth},-500 ${200 + 30 * cloth},-300 L 90,-300 Z`} fill="#141418" />
	</g>
);

// ===================================================== the 1921 extras =======
// a red banner across the street
export const Banner: React.FC<{x: number; y: number; w: number; text: string; color?: string; sag?: number}> = ({x, y, w, text, color = '#c8282a', sag = 20}) => (
	<g>
		<path d={`M ${x - 60},${y - 20} L ${x},${y}`} stroke="#3a3a3e" strokeWidth={5} />
		<path d={`M ${x + w + 60},${y - 20} L ${x + w},${y}`} stroke="#3a3a3e" strokeWidth={5} />
		<path d={`M ${x},${y} Q ${x + w / 2},${y + sag} ${x + w},${y} L ${x + w},${y + 110} Q ${x + w / 2},${y + 110 + sag} ${x},${y + 110} Z`} fill={color} />
		<text x={x + w / 2} y={y + 72 + sag * 0.6} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={Math.min(62, (w / text.length) * 1.55)} fill="#f4ecd8" letterSpacing={3}>
			{text}
		</text>
	</g>
);
// a flag on a pole fixed to a wall; `wave` = phase
export const WallFlag: React.FC<{x: number; y: number; wave: number; color?: string; flip?: boolean}> = ({x, y, wave, color = '#c8282a', flip = false}) => {
	const d = flip ? -1 : 1;
	const w1 = Math.sin(wave) * 14;
	const w2 = Math.sin(wave + 1.4) * 14;
	return (
		<g>
			<line x1={x} y1={y} x2={x + 150 * d} y2={y - 150} stroke="#3a3a3e" strokeWidth={8} />
			<path d={`M ${x + 150 * d},${y - 150} C ${x + 210 * d},${y - 150 + w1} ${x + 260 * d},${y - 110 + w2} ${x + 330 * d},${y - 100 + w1} L ${x + 300 * d},${y + 10 + w2} C ${x + 240 * d},${y + w1} ${x + 190 * d},${y - 30 + w2} ${x + 110 * d},${y - 40} Z`} fill={color} />
		</g>
	);
};
// a poster on a wall (a simple flat composition and a slogan)
export const Poster: React.FC<{x: number; y: number; w: number; h: number; text: string; bg?: string; fg?: string; art?: 'star' | 'gear' | 'book' | 'rocket'; rot?: number}> = ({x, y, w, h, text, bg = '#e8dcc0', fg = '#c8282a', art = 'star', rot = 0}) => (
	<g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
		<rect x={x} y={y} width={w} height={h} fill={bg} />
		{art === 'star' && <path d={starD(x + w / 2, y + h * 0.36, w * 0.28)} fill={fg} />}
		{art === 'gear' && (
			<g>
				<circle cx={x + w / 2} cy={y + h * 0.36} r={w * 0.22} fill="none" stroke={fg} strokeWidth={w * 0.09} strokeDasharray={`${w * 0.06} ${w * 0.05}`} />
				<circle cx={x + w / 2} cy={y + h * 0.36} r={w * 0.14} fill={fg} />
			</g>
		)}
		{art === 'book' && (
			<g>
				<path d={`M ${x + w * 0.2},${y + h * 0.2} L ${x + w / 2},${y + h * 0.26} L ${x + w * 0.8},${y + h * 0.2} L ${x + w * 0.8},${y + h * 0.52} L ${x + w / 2},${y + h * 0.58} L ${x + w * 0.2},${y + h * 0.52} Z`} fill={fg} />
				<line x1={x + w / 2} y1={y + h * 0.26} x2={x + w / 2} y2={y + h * 0.58} stroke={bg} strokeWidth={5} />
			</g>
		)}
		{art === 'rocket' && (
			<g>
				<path d={`M ${x + w / 2},${y + h * 0.1} C ${x + w * 0.62},${y + h * 0.2} ${x + w * 0.62},${y + h * 0.42} ${x + w * 0.58},${y + h * 0.55} L ${x + w * 0.42},${y + h * 0.55} C ${x + w * 0.38},${y + h * 0.42} ${x + w * 0.38},${y + h * 0.2} ${x + w / 2},${y + h * 0.1} Z`} fill={fg} />
				<path d={`M ${x + w * 0.44},${y + h * 0.55} L ${x + w / 2},${y + h * 0.66} L ${x + w * 0.56},${y + h * 0.55} Z`} fill="#ffb347" />
			</g>
		)}
		{text.split('\n').map((line, k, all) => (
			<text key={k} x={x + w / 2} y={y + h * 0.74 + (k - (all.length - 1) / 2) * h * 0.12} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={Math.min(h * 0.1, (w / Math.max(...all.map((l) => l.length))) * 1.5)} fill={fg === bg ? '#111' : fg}>
				{line}
			</text>
		))}
	</g>
);
export const starD = (cx: number, cy: number, r: number) =>
	Array.from({length: 10})
		.map((_, k) => {
			const a = -Math.PI / 2 + (k * Math.PI) / 5;
			const rr = k % 2 === 0 ? r : r * 0.42;
			return `${k === 0 ? 'M' : 'L'} ${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
		})
		.join(' ') + ' Z';

// the literacy class: the blackboard with the famous primer line, desks
export const Classroom: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#d8cfb8" />
		<rect x={-600} y={1180} width={2300} height={1500} fill="#8a6a44" />
		<rect x={60} y={200} width={960} height={520} fill="#2a3a30" stroke="#6a4628" strokeWidth={18} />
		<text x={540} y={380} textAnchor="middle" fontFamily={SERIF} fontSize={78} fill="#f4f0e8" fontWeight={700}>
			МЫ НЕ РАБЫ.
		</text>
		<text x={540} y={500} textAnchor="middle" fontFamily={SERIF} fontSize={78} fill="#f4f0e8" fontWeight={700}>
			РАБЫ НЕ МЫ.
		</text>
		<text x={540} y={640} textAnchor="middle" fontFamily={SERIF} fontSize={48} fill="#f4f0e8" opacity={0.75}>
			А · Б · В · Г · Д
		</text>
		<rect x={60} y={720} width={960} height={20} fill="#6a4628" />
		<rect x={-500} y={-100} width={400} height={540} fill="#c9bca2" />
		<Poster x={-480} y={-80} w={360} h={500} text={'ГРАМОТА —\nПУТЬ К\nКОММУНИЗМУ'} art="book" bg="#e8dcc0" />
	</g>
);
export const Desk: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 460}) => (
	<g>
		<path d={`M ${x - w / 2},${y} L ${x + w / 2},${y} L ${x + w / 2 - 20},${y + 40} L ${x - w / 2 + 20},${y + 40} Z`} fill="#6a4628" />
		<rect x={x - w / 2 + 20} y={y + 40} width={w - 40} height={150} fill="#5a3a22" />
		<rect x={x - w / 2 + 40} y={y + 190} width={16} height={120} fill="#3a2a1e" />
		<rect x={x + w / 2 - 56} y={y + 190} width={16} height={120} fill="#3a2a1e" />
		<rect x={x - 60} y={y - 8} width={120} height={10} fill="#f4f0e8" />
	</g>
);

// 1921 money: a bundle of banknotes
export const Banknote: React.FC<{x: number; y: number; rot?: number; value?: string}> = ({x, y, rot = 0, value = '10 000'}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-170} y={-80} width={340} height={160} rx={8} fill="#c9b48a" stroke="#6a5a3a" strokeWidth={5} />
		<rect x={-150} y={-62} width={300} height={124} rx={4} fill="none" stroke="#8a6a3a" strokeWidth={3} strokeDasharray="8 6" />
		<circle cx={-100} cy={0} r={40} fill="#a8946a" />
		<text x={50} y={-6} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={44} fill="#4a3a1e">
			{value}
		</text>
		<text x={50} y={38} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={26} fill="#4a3a1e">
			РУБЛЕЙ
		</text>
	</g>
);

// a crowd of the era (screen-flat): `n` people in a row from x0 with step dx, scale s, at ground y
export const CrowdRow: React.FC<{era: 1901 | 1911 | 1921 | 1931 | 1941 | 1951 | 1961 | 1971 | 1981 | 1991; x0: number; dx: number; n: number; y: number; s: number; id: string; seed?: number; look?: (k: number) => number; f?: number; face?: (k: number) => object; back?: boolean}> = ({era, x0, dx, n, y, s, id, seed = 0, look, f = 0, face, back = false}) => (
	<g>
		{Array.from({length: n}).map((_, k) => {
			const who = (['m', 'f', 'm', 'f', 'k'] as const)[(k + seed) % 5];
			const kx = x0 + k * dx + (rnd(seed * 13 + k) - 0.5) * dx * 0.3;
			const ky = y + (rnd(seed * 7 + k) - 0.5) * 20;
			const sc = s * (who === 'k' ? 0.92 : 1) * (0.94 + 0.12 * rnd(seed * 3 + k));
			return <Folk key={k} era={era} n={k + seed * 5} who={who} id={`${id}${k}`} x={kx} y={ky} scale={sc} breathe={f + k * 9} headTurn={look ? look(k) : 0} face={{blush: false, ...(face ? face(k) : {})}} back={back} />;
		})}
	</g>
);
