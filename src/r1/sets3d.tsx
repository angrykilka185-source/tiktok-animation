// «Ты с какого района?» — new 2.5D sets for the episode «Игоречек»: the school (building, fence with the gate, the
// puddle), the cloakroom, Igor's room, and small props (the knitted hat, the briefcase, the string bag).
// Same world as world3d.tsx: 1 m ≈ 300 px, ground at y = 0, up is −y, cards placed with Card3D / Box3D / Floor3D.
import React from 'react';
import {Box3D, Card3D, Floor3D} from '../components/Scene3D';
import {KnitHat} from '../components/Person';
import {HEAVY} from '../components/Overlays';
import {Ground3D, Time, TreeArt} from './world3d';

// ------------------------------------------------------------------ school ----
// the façade of a three-storey school (w × h): yellow plaster, white pilasters, big windows
export const SchoolArt: React.FC<{w: number; h: number; skip?: [number, number]; dim?: number}> = ({w, h, skip, dim = 0}) => {
	const floors = 3;
	const top = 220;
	const fh = (h - top - 180) / floors;
	const cols = 16;
	const cw = w / cols;
	return (
		<g>
			<rect width={w} height={h} fill="#e3cf9a" />
			<rect width={w} height={top - 40} fill="#d2bd88" />
			<rect y={top - 60} width={w} height={26} fill="#f2ead2" />
			<rect y={h - 180} width={w} height={180} fill="#a98f68" />
			{Array.from({length: cols / 2 + 1}).map((_, k) => (
				<rect key={`p${k}`} x={k * cw * 2 - 30} y={top - 34} width={60} height={h - top - 146} fill="#f2ead2" opacity={0.9} />
			))}
			{Array.from({length: floors}).flatMap((_, fl) =>
				Array.from({length: cols}).map((__, c) => {
					const cx = c * cw + cw / 2;
					if (skip && cx > skip[0] && cx < skip[1]) return null;
					const wy = top + 40 + fl * fh;
					const ww = cw * 0.62;
					const wh = fh * 0.66;
					return (
						<g key={`${fl}-${c}`}>
							<rect x={cx - ww / 2 - 14} y={wy - 14} width={ww + 28} height={wh + 28} fill="#f4efe0" />
							<rect x={cx - ww / 2} y={wy} width={ww} height={wh} fill={dim > 0 ? '#2a3350' : '#93a9b8'} />
							<rect x={cx - 5} y={wy} width={10} height={wh} fill="#f4efe0" />
							<rect x={cx - ww / 2} y={wy + wh * 0.3} width={ww} height={10} fill="#f4efe0" />
							{dim === 0 && <rect x={cx - ww / 2 + 10} y={wy + wh * 0.36} width={ww * 0.3} height={wh * 0.4} fill="#fff" opacity={0.25} />}
						</g>
					);
				}),
			)}
		</g>
	);
};

// the entrance block: doors, a canopy, the sign «ШКОЛА № 17», the stairwell window strip
export const SchoolEntranceArt: React.FC<{w: number; h: number}> = ({w, h}) => (
	<g>
		<rect width={w} height={h} fill="#eadbb0" />
		<rect width={w} height={160} fill="#d2bd88" />
		{[0.18, 0.82].map((k) => (
			<rect key={k} x={w * k - 40} y={160} width={80} height={h - 160} fill="#f4efe0" />
		))}
		{[0, 1, 2].map((k) => (
			<g key={k}>
				<rect x={w / 2 - 260} y={300 + k * 640} width={520} height={460} fill="#f4efe0" />
				<rect x={w / 2 - 236} y={324 + k * 640} width={472} height={412} fill="#8ea2b2" />
				<rect x={w / 2 - 6} y={324 + k * 640} width={12} height={412} fill="#f4efe0" />
			</g>
		))}
		<rect x={w / 2 - 420} y={h - 900} width={840} height={150} fill="#f8f6ee" stroke="#b03a2e" strokeWidth={14} />
		<text x={w / 2} y={h - 798} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill="#b03a2e">
			ШКОЛА № 17
		</text>
		<rect x={w / 2 - 380} y={h - 700} width={760} height={50} fill="#9a8a70" />
		<rect x={w / 2 - 300} y={h - 650} width={600} height={650} fill="#6a4a32" />
		<rect x={w / 2 - 270} y={h - 620} width={260} height={360} fill="#a8bccb" opacity={0.85} />
		<rect x={w / 2 + 10} y={h - 620} width={260} height={360} fill="#a8bccb" opacity={0.85} />
		<rect x={w / 2 - 6} y={h - 650} width={12} height={650} fill="#4a3220" />
	</g>
);

// the school seen from the yard (far pass): the building, the protruding entrance block, trees
export const SchoolFar: React.FC<{f: number; time?: Time; z?: number}> = ({f, time = 'day', z = -4800}) => (
	<>
		<Box3D x={0} y={0} z={z} w={8000} h={2900} d={1800} side="#c2ae7e" res={4}>
			<SchoolArt w={8000} h={2900} skip={[3100, 4900]} dim={time === 'night' ? 1 : 0} />
		</Box3D>
		<Box3D x={0} y={0} z={z + 320} w={1700} h={3250} d={320} side="#d9c79a" res={2}>
			<SchoolEntranceArt w={1700} h={3250} />
		</Box3D>
		{[
			[-2600, z + 1500, 4],
			[2900, z + 1300, 5],
			[-4200, z + 900, 6],
		].map(([x, zz, k]) => (
			<Card3D key={k} x={x} y={0} z={zz} w={1000} h={2600} res={2}>
				<TreeArt f={f} seed={k} />
			</Card3D>
		))}
	</>
);

// a metal school fence (w × h) with brick gate pillars around a gap (gate) from gx0 to gx1 (local x)
export const SchoolFenceArt: React.FC<{w: number; h: number; gx0: number; gx1: number}> = ({w, h, gx0, gx1}) => {
	const rods: number[] = [];
	for (let x = 20; x < w; x += 56) if (x < gx0 - 60 || x > gx1 + 60) rods.push(x);
	return (
		<g>
			{[60, h - 70].map((y) => (
				<g key={y}>
					<rect x={0} y={y} width={gx0 - 50} height={14} fill="#3a4a3a" />
					<rect x={gx1 + 50} y={y} width={w - gx1 - 50} height={14} fill="#3a4a3a" />
				</g>
			))}
			{rods.map((x) => (
				<g key={x}>
					<rect x={x - 5} y={30} width={10} height={h - 30} fill="#3a4a3a" />
					<path d={`M ${x - 12},34 L ${x},4 L ${x + 12},34 Z`} fill="#3a4a3a" />
				</g>
			))}
			{[gx0 - 50, gx1 + 50].map((x) => (
				<g key={x}>
					<rect x={x - 55} y={-120} width={110} height={h + 120} fill="#9a4a3a" />
					<rect x={x - 70} y={-150} width={140} height={40} fill="#7a3a2c" />
					{Array.from({length: 7}).map((_, k) => (
						<rect key={k} x={x - 55} y={-100 + k * 90} width={110} height={6} fill="#7a3a2c" opacity={0.6} />
					))}
				</g>
			))}
		</g>
	);
};

// a puddle on the asphalt (a flat decal on the ground plane) with rings spreading from `splash` (frames since the hit)
export const Puddle: React.FC<{x: number; z: number; w?: number; d?: number; splash?: number; sky?: string}> = ({x, z, w = 900, d = 600, splash = -1, sky = '#b9c9d6'}) => (
	<Floor3D y={-1} zNear={z + d / 2} depth={d} w={w} x={x} res={1}>
		<defs>
			<radialGradient id={`pud${x}${z}`} cx={0.5} cy={0.45} r={0.6}>
				<stop offset="0" stopColor={sky} />
				<stop offset="1" stopColor="#5a6470" />
			</radialGradient>
		</defs>
		<path
			d={`M ${w * 0.08},${d * 0.5} C ${w * 0.05},${d * 0.12} ${w * 0.4},${d * 0.02} ${w * 0.6},${d * 0.1} C ${w * 0.95},${d * 0.2} ${w * 0.98},${d * 0.62} ${w * 0.8},${d * 0.85} C ${w * 0.55},${d * 1.0} ${w * 0.15},${d * 0.92} ${w * 0.08},${d * 0.5} Z`}
			fill={`url(#pud${x}${z})`}
		/>
		{splash >= 0 &&
			[0, 7, 14].map((dl) => {
				const t = Math.max(0, splash - dl) / 36;
				if (t <= 0 || t >= 1) return null;
				return <ellipse key={dl} cx={w / 2} cy={d / 2} rx={60 + 360 * t} ry={40 + 240 * t} fill="none" stroke="#eef4f8" strokeWidth={10 * (1 - t)} opacity={0.8 * (1 - t)} />;
			})}
	</Floor3D>
);

// the knitted hat on its own (a card art centred on the hat, ~200 px wide)
export const HatArt: React.FC<{color: string; soaked?: number}> = ({color, soaked = 0}) => (
	<g>
		<KnitHat hw={84} hh={94} color={color} />
		{soaked > 0 && <path d="M -96,-30 Q 0,-10 96,-30 L 90,-10 Q 0,10 -90,-10 Z" fill="#3a4a5a" opacity={0.6 * soaked} />}
	</g>
);

// ------------------------------------------------------------------ hand-held props (forearm frame, +y = along the arm)
export const Briefcase: React.FC = () => (
	<g>
		<path d="M -26,4 Q -26,-22 0,-22 Q 26,-22 26,4" stroke="#3a2618" strokeWidth={9} fill="none" />
		<rect x={-80} y={2} width={160} height={118} rx={10} fill="#6a4a2e" />
		<rect x={-80} y={2} width={160} height={34} rx={8} fill="#5a3c24" />
		<rect x={-12} y={28} width={24} height={16} rx={3} fill="#c9b27a" />
	</g>
);
// the string bag (авоська) with a loaf and a milk bottle
export const Avoska: React.FC = () => (
	<g>
		<path d="M -12,0 L -40,40 M 12,0 L 40,40" stroke="#c9a46a" strokeWidth={5} />
		<rect x={-46} y={70} width={30} height={92} rx={8} fill="#f4f4ee" />
		<rect x={-42} y={60} width={22} height={16} rx={4} fill="#c0c4c8" />
		<ellipse cx={14} cy={118} rx={44} ry={46} fill="#c98a4a" />
		<path d="M -6,90 Q 14,84 34,92 M -8,112 Q 14,106 36,114" stroke="#a86a34" strokeWidth={5} fill="none" />
		<path d="M -60,40 Q 0,30 60,40 L 54,170 Q 0,184 -54,170 Z" fill="none" stroke="#c9a46a" strokeWidth={4} />
		{[-40, -10, 20, 50].map((x) => (
			<path key={x} d={`M ${x},40 Q ${x + 6},110 ${x - 4},174`} stroke="#c9a46a" strokeWidth={3} fill="none" />
		))}
		<path d="M -58,90 Q 0,82 58,90 M -56,134 Q 0,128 56,134" stroke="#c9a46a" strokeWidth={3} fill="none" />
	</g>
);

// ------------------------------------------------------------------ the cloakroom ----
// rows of coats on a rail (w × 760): colours of school coats, a hood, a scarf, a bag
export const CoatsArt: React.FC<{w: number; seed?: number; dark?: number}> = ({w, seed = 1, dark = 0}) => {
	const n = Math.max(2, Math.round(w / 170));
	const cols = ['#5a4a3a', '#3a4a5a', '#6a3a3a', '#4a5a3a', '#7a6a4a', '#2f3a4a', '#5e5e66', '#7a4a2a'];
	return (
		<g>
			<rect x={0} y={20} width={w} height={20} fill="#6a5a4a" />
			{[30, w - 30].map((x) => (
				<rect key={x} x={x - 12} y={20} width={24} height={740} fill="#5a4a3a" />
			))}
			{Array.from({length: n}).map((_, k) => {
				const cx = (k + 0.5) * (w / n) + Math.sin(seed * 7 + k * 3) * 14;
				const c = cols[(k * 3 + seed) % cols.length];
				const len = 420 + ((k * 37 + seed * 11) % 120);
				return (
					<g key={k}>
						<path d={`M ${cx - 6},30 q 6,-14 12,0 l 0,24`} stroke="#9a9a9a" strokeWidth={6} fill="none" />
						<path d={`M ${cx - 60},86 Q ${cx},50 ${cx + 60},86 L ${cx + 78},${86 + len} L ${cx - 78},${86 + len} Z`} fill={c} />
						<path d={`M ${cx - 30},64 Q ${cx},96 ${cx + 30},64 L ${cx + 20},140 L ${cx - 20},140 Z`} fill="#000" opacity={0.18} />
						<line x1={cx} y1={110} x2={cx} y2={80 + len} stroke="#000" strokeOpacity={0.2} strokeWidth={5} />
						{(k + seed) % 3 === 0 && <rect x={cx - 66} y={150} width={18} height={160} rx={8} fill="#c03a2e" />}
						{(k + seed) % 4 === 1 && <rect x={cx + 20} y={300} width={90} height={110} rx={10} fill="#6a4a2e" />}
					</g>
				);
			})}
			{dark > 0 && <rect x={0} y={0} width={w} height={760} fill="#000" opacity={dark} />}
		</g>
	);
};

// the cloakroom: a real box (floor of tiles, a whitewashed ceiling with a lamp, green-painted walls), coat racks
// standing in rows on both sides of an aisle — they slide past the camera as it moves in. Back wall: CloakroomBack.
export const CW = 700; // half width
export const Cloakroom3D: React.FC<{id: string}> = ({id}) => (
	<>
		<Floor3D y={0} zNear={700} depth={2300} w={CW * 2} res={1}>
			<defs>
				<pattern id={`${id}fl`} width={100} height={100} patternUnits="userSpaceOnUse">
					<rect width={100} height={100} fill="#a86a4a" />
					<rect width={50} height={50} fill="#c9a07a" />
					<rect x={50} y={50} width={50} height={50} fill="#c9a07a" />
				</pattern>
			</defs>
			<rect width={CW * 2} height={2300} fill={`url(#${id}fl)`} />
		</Floor3D>
		<Floor3D y={-900} zNear={700} depth={2300} w={CW * 2} res={1}>
			<rect width={CW * 2} height={2300} fill="#d8d4c6" />
			{[500, 1200, 1900].map((y) => (
				<g key={y}>
					<rect x={CW - 30} y={y - 160} width={60} height={320} fill="#fffbe8" />
					<rect x={CW - 120} y={y - 220} width={240} height={440} fill="#fffbe8" opacity={0.18} />
				</g>
			))}
		</Floor3D>
		{[-1, 1].map((sd) => (
			<Card3D key={sd} x={sd * (CW - 1150)} y={0} z={700} w={2300} h={900} ry={sd * -90} html>
				<div style={{position: 'absolute', inset: 0, background: '#e8e4d6'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 480, bottom: 0, background: '#4f7a62'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 474, height: 8, background: '#3a5a48'}} />
			</Card3D>
		))}
		{/* coat racks along both sides */}
		{[
			[-480, 350, 1],
			[-480, -250, 2],
			[-480, -850, 3],
			[480, 150, 4],
			[480, -450, 5],
			[480, -1050, 6],
		].map(([x, z, k]) => (
			<Card3D key={k} x={x} y={0} z={z} w={520} h={800}>
				<CoatsArt w={520} seed={k} />
			</Card3D>
		))}
	</>
);
// the back wall of the cloakroom (its own pass, like the kitchen): a barred window high up, a bench
export const CloakroomBack: React.FC = () => (
	<Card3D x={0} y={0} z={-1600} w={CW * 2} h={900}>
		<rect width={CW * 2} height={900} fill="#e8e4d6" />
		<rect y={480} width={CW * 2} height={420} fill="#4f7a62" />
		<rect y={474} width={CW * 2} height={8} fill="#3a5a48" />
		<rect x={CW - 260} y={120} width={520} height={260} fill="#f4efe0" />
		<rect x={CW - 240} y={140} width={480} height={220} fill="#a8bccb" />
		{Array.from({length: 7}).map((_, k) => (
			<rect key={k} x={CW - 230 + k * 76} y={140} width={10} height={220} fill="#3a3a3a" />
		))}
		<rect x={CW - 300} y={640} width={600} height={40} fill="#8a6a4a" />
		<rect x={CW - 280} y={680} width={24} height={220} fill="#5a4a3a" />
		<rect x={CW + 256} y={680} width={24} height={220} fill="#5a4a3a" />
	</Card3D>
);

// ------------------------------------------------------------------ Igor's room at night ----
// a wall carpet (ковёр) with a red ornament (w × h)
export const CarpetArt: React.FC<{w: number; h: number}> = ({w, h}) => (
	<g>
		<rect width={w} height={h} fill="#7a1e22" />
		<rect x={24} y={24} width={w - 48} height={h - 48} fill="none" stroke="#d9b45a" strokeWidth={14} />
		<rect x={60} y={60} width={w - 120} height={h - 120} fill="#9a2a2a" stroke="#2a1a3a" strokeWidth={10} />
		{[0.25, 0.5, 0.75].map((k) => (
			<g key={k} transform={`translate(${w * k},${h / 2})`}>
				<path d="M 0,-150 L 110,0 L 0,150 L -110,0 Z" fill="#2a1a3a" />
				<path d="M 0,-100 L 70,0 L 0,100 L -70,0 Z" fill="#d9b45a" />
				<path d="M 0,-50 L 34,0 L 0,50 L -34,0 Z" fill="#7a1e22" />
			</g>
		))}
		{Array.from({length: Math.floor(w / 60)}).map((_, k) => (
			<rect key={k} x={40 + k * 60} y={h - 18} width={8} height={30} fill="#d9b45a" />
		))}
	</g>
);
export const RW = 650; // half width of the room
// the room: floor boards, a dark ceiling, side walls (night blue); the bed is drawn by the shot (it holds Igor)
export const Bedroom3D: React.FC<{id: string}> = ({id}) => (
	<>
		<Floor3D y={0} zNear={700} depth={1900} w={RW * 2} res={1}>
			<defs>
				<pattern id={`${id}bd`} width={1300} height={80} patternUnits="userSpaceOnUse">
					<rect width={1300} height={80} fill="#5a4636" />
					<rect y={74} width={1300} height={6} fill="#3e3026" />
				</pattern>
			</defs>
			<rect width={RW * 2} height={1900} fill={`url(#${id}bd)`} />
		</Floor3D>
		<Floor3D y={-900} zNear={700} depth={1900} w={RW * 2} res={1}>
			<rect width={RW * 2} height={1900} fill="#22273a" />
		</Floor3D>
		{[-1, 1].map((sd) => (
			<Card3D key={sd} x={sd * (RW - 950)} y={0} z={700} w={1900} h={900} ry={sd * -90} html>
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sd < 0 ? 90 : 270}deg, #2e3550, #262c44)`}} />
			</Card3D>
		))}
	</>
);
// the back wall of the room (own pass): wallpaper, the carpet, the window with the moon, the door with light under it
export const BedroomBack: React.FC<{f: number; doorLight?: number}> = ({f, doorLight = 1}) => (
	<Card3D x={0} y={0} z={-1200} w={RW * 2} h={900}>
		<rect width={RW * 2} height={900} fill="#39405e" />
		{Array.from({length: 22}).map((_, k) => (
			<rect key={k} x={k * 60} y={0} width={4} height={900} fill="#4a5274" opacity={0.6} />
		))}
		<g transform="translate(330,120)">
			<CarpetArt w={640} h={420} />
		</g>
		<rect x={1040} y={150} width={220} height={330} fill="#1a1f30" />
		<rect x={1052} y={162} width={196} height={306} fill="#0c1430" />
		<circle cx={1190} cy={220} r={26} fill="#f4f0d8" opacity={0.9} />
		{[
			[1080, 360],
			[1150, 420],
			[1210, 330],
		].map(([x, y], k) => (
			<rect key={k} x={x} y={y} width={18} height={22} fill="#f2c96a" opacity={0.7 + 0.2 * Math.sin(f / 9 + k)} />
		))}
		<rect x={1146} y={162} width={8} height={306} fill="#1a1f30" />
		<rect x={40} y={260} width={220} height={640} fill="#4a3a30" />
		<rect x={56} y={276} width={188} height={624} fill="#5a4838" />
		<circle cx={222} cy={600} r={10} fill="#c9b27a" />
		<rect x={44} y={884} width={212} height={16} fill="#ffd98a" opacity={0.85 * doorLight} />
	</Card3D>
);

// ------------------------------------------------------------------ the gang's «качалка» (a basement gym) ----
// the end wall of a building with the iron door of the basement gym (art w × h, the door centred at the bottom):
// plaster with bare bricks, a drainpipe, «КАЧАЛКА» painted above the door with a barbell, light under the door.
export const KachalkaArt: React.FC<{w: number; h: number; inside?: number; open?: number}> = ({w, h, inside = 1, open = 0}) => {
	const dx = w / 2;
	const dw = 420;
	const dh = 640;
	const top = h - dh;
	return (
		<g>
			<rect width={w} height={h} fill="#a99d88" />
			{[
				[180, 260, 520, 300],
				[w - 760, 420, 460, 260],
				[dx + 340, top - 300, 300, 200],
			].map(([x, y, bw, bh], k) => (
				<g key={k}>
					<rect x={x} y={y} width={bw} height={bh} fill="#8f4e3a" />
					{Array.from({length: Math.floor(bh / 34)}).map((_, r) => (
						<g key={r}>
							<rect x={x} y={y + r * 34 + 30} width={bw} height={4} fill="#c9b9a0" opacity={0.6} />
							{Array.from({length: Math.floor(bw / 90)}).map((__, c) => (
								<rect key={c} x={x + c * 90 + (r % 2) * 45} y={y + r * 34} width={4} height={30} fill="#c9b9a0" opacity={0.6} />
							))}
						</g>
					))}
				</g>
			))}
			<rect x={w - 300} y={0} width={44} height={h} fill="#7d7f80" />
			{[300, 900, 1500].map((y) => (
				<rect key={y} x={w - 312} y={y} width={68} height={16} fill="#5d5f60" />
			))}
			{/* «КАЧАЛКА» in white paint with drips, a barbell */}
			<g transform={`translate(${dx},${top - 190}) rotate(-3)`}>
				<text x={0} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={120} fill="#f2efe6" opacity={0.92} letterSpacing={6}>
					КАЧАЛКА
				</text>
				{[-220, -60, 130, 250].map((x, k) => (
					<rect key={k} x={x} y={8} width={8} height={30 + (k % 2) * 26} rx={4} fill="#f2efe6" opacity={0.8} />
				))}
				<g transform="translate(0,70)" fill="#f2efe6" opacity={0.85}>
					<rect x={-170} y={-6} width={340} height={12} rx={6} />
					<rect x={-150} y={-40} width={30} height={80} rx={8} />
					<rect x={120} y={-40} width={30} height={80} rx={8} />
				</g>
			</g>
			{/* the iron door: two leaves, rivets, rust, the handle, light from inside under it */}
			<rect x={dx - dw / 2 - 30} y={top - 30} width={dw + 60} height={dh + 30} fill="#3a3e3a" />
			{[-1, 1].map((sd) => {
				const lx = sd < 0 ? dx - dw / 2 : dx;
				return (
					<g key={sd}>
						<rect x={lx + 4} y={top} width={dw / 2 - 8} height={dh - 14} fill="#3f5a4a" />
						<rect x={lx + 24} y={top + 30} width={dw / 2 - 48} height={dh - 80} fill="none" stroke="#33493c" strokeWidth={10} />
						{Array.from({length: 6}).map((_, r) => (
							<circle key={r} cx={lx + 16} cy={top + 40 + r * 100} r={6} fill="#2c3a32" />
						))}
						<path d={`M ${lx + 60},${top + 120} q 10,120 -6,260`} stroke="#7a4a2a" strokeWidth={14} opacity={0.35} fill="none" />
					</g>
				);
			})}
			{open > 0 && (
				<g>
					<defs>
						<linearGradient id="kachLight" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#ffe9b0" />
							<stop offset="1" stopColor="#d99a4a" />
						</linearGradient>
					</defs>
					<rect x={dx + 4} y={top} width={dw / 2 - 8} height={dh - 14} fill="url(#kachLight)" />
					<path d={`M ${dx + dw / 2 - 4},${top} L ${dx + dw / 2 - 4 - (dw / 2 - 8) * (1 - open * 0.85)},${top + 30} L ${dx + dw / 2 - 4 - (dw / 2 - 8) * (1 - open * 0.85)},${top + dh - 40} L ${dx + dw / 2 - 4},${top + dh - 14} Z`} fill="#33493c" />
				</g>
			)}
			<rect x={dx - 46} y={top + dh * 0.5} width={28} height={70} rx={8} fill="#9a9a9a" />
			<rect x={dx + 18} y={top + dh * 0.5} width={28} height={70} rx={8} fill="#9a9a9a" />
			<rect x={dx - dw / 2 + 6} y={h - 14} width={dw - 12} height={14} fill="#ffd98a" opacity={0.85 * inside} />
		</g>
	);
};
// the качалка: the end wall with the door (z −1300, door at x), the step, a caged bulb above the door, its light.
// Drawn in its OWN pass (Scene3D `far`, farBlur 0) — in one 3D context with the ground (which crosses behind the camera)
// Chrome drops half of this big wall. The ground goes to the near pass: <Ground3D id time="night" />.
export const KachalkaFar: React.FC<{f: number; x?: number; open?: number}> = ({f, x = 1700, open = 0}) => {
	const flick = 0.85 + 0.15 * Math.sin(f * 1.7) * Math.sin(f * 0.37);
	return (
		<>
			<Card3D x={x} y={0} z={-1300} w={3200} h={2000} res={2}>
				<KachalkaArt w={3200} h={2000} open={open} />
			</Card3D>
			<Card3D x={x} y={0} z={-1240} w={560} h={36}>
				<rect width={560} height={36} fill="#a39d90" />
				<rect width={560} height={8} fill="#b9b3a6" />
			</Card3D>
			<Card3D x={x} y={-700} z={-1270} w={300} h={300} anchor="center">
				<circle cx={150} cy={150} r={140} fill="#ffe7a0" opacity={0.2 * flick} />
				<path d="M 150,20 L 150,90" stroke="#3a3a3a" strokeWidth={8} />
				<circle cx={150} cy={140} r={34} fill="#fff1c0" opacity={flick} />
				<g stroke="#3a3a3a" strokeWidth={5} fill="none">
					<circle cx={150} cy={140} r={44} />
					<path d="M 106,140 L 194,140 M 150,96 L 150,184 M 119,109 L 181,171 M 181,109 L 119,171" />
				</g>
			</Card3D>
			<Card3D x={x} y={0} z={-1250} w={900} h={700}>
				<path d="M 380,10 L 520,10 L 900,700 L 0,700 Z" fill="#ffe7a0" opacity={0.1 * flick} />
			</Card3D>
		</>
	);
};

// ------------------------------------------------------------------ inside the качалка (a basement gym) ----
// a box: concrete floor, a low ceiling with pipes, peeling walls; the back wall goes to its own pass (KachalkaInsideBack)
export const GW = 700; // half width
export const KachalkaInside3D: React.FC<{id: string}> = ({id}) => (
	<>
		<Floor3D y={0} zNear={700} depth={2300} w={GW * 2} res={1}>
			<rect width={GW * 2} height={2300} fill="#6e6a62" />
			{[
				[300, 500, 180],
				[900, 1200, 240],
				[500, 1800, 160],
			].map(([x, y, r], k) => (
				<ellipse key={k} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#5d5a53" opacity={0.6} />
			))}
			<rect x={GW - 240} y={1500} width={480} height={300} fill="#4a3f36" opacity={0.7} />
		</Floor3D>
		<Floor3D y={-760} zNear={700} depth={2300} w={GW * 2} res={1}>
			<rect width={GW * 2} height={2300} fill="#3c3a36" />
			{[300, 760, 1100].map((x) => (
				<rect key={x} x={x - 26} y={0} width={52} height={2300} fill="#55524c" />
			))}
		</Floor3D>
		{[-1, 1].map((sd) => (
			<Card3D key={sd} x={sd * (GW - 1150)} y={0} z={700} w={2300} h={760} ry={sd * -90} html>
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(${sd < 0 ? 90 : 270}deg, #6f6658, #4f493f)`}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 420, bottom: 0, background: '#3f4a42', opacity: 0.85}} />
			</Card3D>
		))}
		{/* a barbell from a crowbar on a rack */}
		<Card3D x={-420} y={0} z={-900} w={700} h={520}>
			<rect x={80} y={160} width={30} height={360} fill="#4a4a4a" />
			<rect x={590} y={160} width={30} height={360} fill="#4a4a4a" />
			<rect x={20} y={150} width={660} height={16} rx={8} fill="#8a8a8a" />
			{[40, 80, 580, 620].map((x) => (
				<rect key={x} x={x} y={90} width={34} height={136} rx={8} fill="#2e2e30" />
			))}
		</Card3D>
		{/* a bench of planks on bricks */}
		<Card3D x={-380} y={0} z={-620} w={620} h={200}>
			<rect x={0} y={40} width={620} height={46} fill="#7a5a3a" />
			<rect x={40} y={86} width={90} height={114} fill="#8f4e3a" />
			<rect x={490} y={86} width={90} height={114} fill="#8f4e3a" />
		</Card3D>
		{/* the sandbag hanging from a pipe */}
		<Card3D x={460} y={-760} z={-760} w={300} h={760} anchor="bottom">
			<line x1={150} y1={0} x2={150} y2={150} stroke="#2a2a2a" strokeWidth={8} />
			<rect x={70} y={150} width={160} height={420} rx={60} fill="#6a3a2a" />
			<rect x={70} y={210} width={160} height={14} fill="#4a2a1e" />
			<rect x={70} y={500} width={160} height={14} fill="#4a2a1e" />
		</Card3D>
		{/* a kettlebell */}
		<Card3D x={200} y={0} z={-500} w={140} h={150}>
			<path d="M 40,40 Q 70,-10 100,40" stroke="#2a2a2a" strokeWidth={18} fill="none" />
			<circle cx={70} cy={95} r={55} fill="#2a2a2a" />
			<text x={70} y={108} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill="#6a6a6a">32</text>
		</Card3D>
	</>
);
// the back wall: brick and peeling plaster, a sports poster, a mirror shard, the bulb on a wire
export const KachalkaInsideBack: React.FC<{f: number}> = ({f}) => {
	const flick = 0.85 + 0.15 * Math.sin(f * 1.3) * Math.sin(f * 0.29);
	return (
		<Card3D x={0} y={0} z={-1600} w={GW * 2} h={760}>
			<rect width={GW * 2} height={760} fill="#6f6658" />
			<rect x={0} y={0} width={GW * 2} height={760} fill="#8f4e3a" opacity={0.55} />
			{Array.from({length: 22}).map((_, r) => (
				<rect key={r} x={0} y={r * 34 + 30} width={GW * 2} height={4} fill="#5a3a2a" opacity={0.5} />
			))}
			<path d="M 0,0 L 520,0 Q 560,160 470,260 Q 380,420 160,380 Q 40,420 0,520 Z" fill="#a39b88" opacity={0.9} />
			<path d="M 1400,0 L 980,0 Q 940,120 1040,220 Q 1150,300 1400,260 Z" fill="#a39b88" opacity={0.9} />
			<g transform="translate(560,110)">
				<rect width={260} height={360} fill="#e9e1cc" />
				<rect x={14} y={14} width={232} height={150} fill="#c0392b" />
				<circle cx={130} cy={240} r={56} fill="#2a2a2a" opacity={0.85} />
				<text x={130} y={110} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#f4efe0">СПОРТ</text>
				<text x={130} y={340} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#2a2a2a">ЭТО СИЛА</text>
			</g>
			<path d="M 980,330 L 1150,300 L 1170,520 L 990,560 Z" fill="#9fb4c8" opacity={0.75} />
			<line x1={700} y1={0} x2={700} y2={40} stroke="#2a2a2a" strokeWidth={5} />
			<circle cx={700} cy={58} r={22} fill="#fff1c0" opacity={flick} />
			<circle cx={700} cy={58} r={160} fill="#ffe7a0" opacity={0.16 * flick} />
		</Card3D>
	);
};
