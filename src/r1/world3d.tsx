// «Ты с какого района?» in 2.5D: the 1976 yard built from flat 2D layers at real depths (see components/Scene3D.tsx).
// Scale: 1 m ≈ 300 px. Ground at y = 0 (up is −y). The boy is ~1.45 m, the older guys ~1.78 m.
import React from 'react';
import {Card3D, Floor3D, Box3D} from '../components/Scene3D';
import {Person, PersonProps} from '../components/Person';
import {HEAVY} from '../components/Overlays';
import * as G1 from '../g1/scenes';

const {rnd} = G1;

export const M = 300;
export const BOY_S = 0.52;
export const MAN_S = 0.465;

export type Time = 'day' | 'dusk' | 'night';
const SKY: Record<Time, [string, string]> = {day: ['#9fbad2', '#e9e4d6'], dusk: ['#2e2a58', '#e08a5a'], night: ['#050816', '#18203f']};

// a person standing on the ground at (x, z): a billboard card
export const Figure3D: React.FC<{x: number; z: number; p: Omit<PersonProps, 'x' | 'y'>; blur?: number; y?: number}> = ({x, z, p, blur, y = 0}) => (
	<Card3D x={x} y={y + 40} z={z} w={720} h={700} blur={blur}>
		<Person {...(p as PersonProps)} x={360} y={660} />
	</Card3D>
);

// the façade of a five-storey «хрущёвка» (front wall art, w × h px)
export const Facade: React.FC<{w: number; h: number; color: string; lit?: number; seed?: number; cols?: number}> = ({w, h, color, lit = 0, seed = 1, cols = 12}) => {
	const fh = (h - 200) / 5;
	const cw = w / cols;
	return (
		<g>
			<rect x={0} y={0} width={w} height={h} fill={color} />
			<rect x={0} y={0} width={w} height={60} fill="#8a8478" />
			{/* panel seams */}
			{Array.from({length: cols + 1}).map((_, c) => (
				<rect key={`s${c}`} x={c * cw - 3} y={60} width={6} height={h - 60} fill="#000" opacity={0.06} />
			))}
			{Array.from({length: 5}).flatMap((_, fl) =>
				Array.from({length: cols}).map((__, c) => {
					const wx = c * cw + cw * 0.24;
					const wy = 140 + fl * fh;
					const ww = cw * 0.52;
					const wh = fh * 0.5;
					const on = lit > 0 && rnd(seed * 31 + fl * 7 + c) > 0.45;
					return (
						<g key={`${fl}-${c}`}>
							<rect x={wx - 10} y={wy - 10} width={ww + 20} height={wh + 20} fill="#7d776a" />
							<rect x={wx} y={wy} width={ww} height={wh} fill={on ? '#ffd27a' : lit > 0 ? '#1f2740' : '#8ea4b6'} opacity={on ? 0.55 + 0.45 * lit : 1} />
							<rect x={wx + ww / 2 - 6} y={wy} width={12} height={wh} fill="#7d776a" />
							{!on && lit === 0 && <rect x={wx + 8} y={wy + 8} width={ww * 0.3} height={wh * 0.5} fill="#fff" opacity={0.25} />}
							{c % 3 === 1 && fl > 0 && (
								<g>
									<rect x={wx - 40} y={wy + wh + 10} width={ww + 80} height={34} fill="#a39c8c" />
									<rect x={wx - 40} y={wy + wh - 50} width={ww + 80} height={60} fill="#b3ac9c" opacity={0.7} />
								</g>
							)}
						</g>
					);
				}),
			)}
			{/* entrances with canopies */}
			{[0.17, 0.5, 0.83].map((k) => (
				<g key={k}>
					<rect x={w * k - 110} y={h - 330} width={220} height={330} fill="#4a3a2a" />
					<rect x={w * k - 150} y={h - 372} width={300} height={44} fill="#8a8478" />
					<rect x={w * k - 6} y={h - 330} width={12} height={330} fill="#3a2a1a" />
				</g>
			))}
		</g>
	);
};

// a row of metal garages (front art)
export const GarageFronts: React.FC<{n: number; w: number; h: number; first?: number; lit?: number}> = ({n, w, h, first = 14, lit = -1}) => {
	const gw = w / n;
	return (
		<g>
			<rect x={0} y={0} width={w} height={h} fill="#4a4f5a" />
			<rect x={0} y={0} width={w} height={50} fill="#3a3f48" />
			{Array.from({length: n}).map((_, k) => {
				const gx = k * gw;
				const paint = ['#5a6a5a', '#6a5a4a', '#56606a', '#6a6450', '#5d5f52'][k % 5];
				return (
					<g key={k}>
						<rect x={gx + 6} y={70} width={8} height={h - 70} fill="#2e3238" />
						<rect x={gx + 40} y={110} width={(gw - 90) / 2} height={h - 110} fill={paint} />
						<rect x={gx + 50 + (gw - 90) / 2} y={110} width={(gw - 90) / 2} height={h - 110} fill={paint} />
						<rect x={gx + 60} y={h - 260} width={70} height={140} fill="#8a5a3a" opacity={0.35} />
						<rect x={gx + gw / 2 - 26} y={h * 0.55} width={52} height={14} fill="#2a2a2a" />
						<text x={gx + gw / 2} y={200} fontSize={70} fontFamily={HEAVY} fontWeight={900} fill="#e9e4d8" textAnchor="middle" opacity={0.85}>
							{first + k}
						</text>
						{k === lit && <rect x={gx + 40} y={h - 16} width={gw - 80} height={16} fill="#ffe7a0" />}
					</g>
				);
			})}
		</g>
	);
};

// an autumn tree (art in a 1000×2600 box, trunk at the bottom centre)
export const TreeArt: React.FC<{f: number; seed?: number}> = ({f, seed = 1}) => (
	<g transform={`rotate(${Math.sin(f / 30 + seed) * 1.2} 500 2600)`}>
		<rect x={460} y={1300} width={80} height={1300} fill="#5a3f2a" />
		<path d="M 500,1700 L 300,1350 M 500,1550 L 720,1250" stroke="#5a3f2a" strokeWidth={36} />
		{[
			[300, 1150, 330, '#d9a23a'],
			[700, 1080, 360, '#c9782a'],
			[500, 800, 400, '#e0b44a'],
			[380, 1450, 240, '#b8682a'],
			[680, 1420, 220, '#d08a30'],
		].map(([cx, cy, r, c], k) => (
			<circle key={k} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />
		))}
	</g>
);

// the brick factory with its chimney and smoke (art in a 6000×9000 box, ground at the bottom)
export const FactoryArt: React.FC<{f: number}> = ({f}) => (
	<g>
		<path d="M 3060,9000 L 3200,1400 L 3500,1400 L 3640,9000 Z" fill="#a4533a" />
		{[1700, 2000].map((y) => (
			<rect key={y} x={3180} y={y} width={340} height={80} fill="#e9e4d8" opacity={0.85} />
		))}
		{Array.from({length: 8}).map((_, k) => {
			const t = ((f + k * 22) % 176) / 176;
			return <circle key={k} cx={3350 + 600 * t + 600 * t * t} cy={1300 - 1600 * t} r={200 + 500 * t} fill="#c9c6c0" opacity={0.55 * (1 - t)} />;
		})}
		<rect x={1200} y={7400} width={4200} height={1600} fill="#8a4a36" />
		<path d="M 1200,7400 L 1900,6900 L 2600,7400 L 3300,6900 L 4000,7400 L 4700,6900 L 5400,7400 Z" fill="#7a3e2c" />
		{Array.from({length: 7}).map((_, k) => (
			<rect key={k} x={1400 + k * 560} y={7800} width={300} height={420} fill="#4a3a30" />
		))}
	</g>
);

// the concrete fence with the diamond pattern (art w × 760)
export const FenceArt: React.FC<{w: number}> = ({w}) => (
	<g>
		<rect x={0} y={0} width={w} height={760} fill="#b7b2a6" />
		{Array.from({length: Math.ceil(w / 900)}).map((_, k) => (
			<g key={k}>
				<rect x={k * 900} y={0} width={30} height={760} fill="#8f8a7e" />
				{[190, 520].map((y) => (
					<path key={y} d={`M ${k * 900 + 450},${y - 150} l 160,150 l -160,150 l -160,-150 Z`} fill="none" stroke="#9a9588" strokeWidth={22} />
				))}
			</g>
		))}
	</g>
);

// the ground: asphalt with fallen leaves near the camera (a 53 × 30 m plane rasterised 5× smaller, see Floor3D) and a
// plain far plane beyond it — a solid colour is free to draw, a huge pattern costs seconds per frame
const GR = 5;
export const Ground3D: React.FC<{id: string; time: Time; zNear?: number}> = ({id, time, zNear = 2500}) => {
	const base = time === 'day' ? '#77726a' : time === 'dusk' ? '#4a4646' : '#22222a';
	const u = 6 / GR; // the leaves keep their world size
	return (
		<>
			<Floor3D y={0} zNear={zNear} depth={9000} w={16000} x={1000} res={GR}>
				<defs>
					<pattern id={`${id}gp`} width={150 * u} height={150 * u} patternUnits="userSpaceOnUse">
						<rect width={150 * u} height={150 * u} fill={base} />
						<ellipse cx={34 * u} cy={50 * u} rx={30 * u} ry={15 * u} fill="#000" opacity={0.06} />
						{[
							[20, 24, '#d9a23a'],
							[106, 36, '#c9782a'],
							[64, 102, '#b8682a'],
							[126, 120, '#e0b44a'],
						].map(([x, y, c], k) => (
							<ellipse key={k} cx={(x as number) * u} cy={(y as number) * u} rx={6 * u} ry={3 * u} fill={c as string} opacity={time === 'day' ? 0.85 : 0.4} transform={`rotate(${k * 40} ${(x as number) * u} ${(y as number) * u})`} />
						))}
					</pattern>
				</defs>
				<rect x={0} y={0} width={16000 / GR} height={9000 / GR} fill={`url(#${id}gp)`} />
			</Floor3D>
			<div style={{position: 'absolute', left: 0, top: 0, width: 60000, height: 40000, background: base, transformOrigin: '50% 0%', transform: `translate3d(-30000px, 0px, ${zNear - 9000}px) rotateX(-90deg)`}} />
		</>
	);
};

// the sky: the stage background (infinitely far — it doesn't slide)
export const skyBg = (time: Time) => `linear-gradient(180deg, ${SKY[time][0]} 0%, ${SKY[time][0]} 22%, ${SKY[time][1]} 58%, ${SKY[time][1]} 100%)`;

// the yard, far pass: the factory, two хрущёвки (real boxes), trees — drawn blurred (depth of field)
export const YardFar: React.FC<{f: number; time?: Time}> = ({f, time = 'day'}) => {
	const lit = time === 'day' ? 0 : time === 'dusk' ? 0.7 : 1;
	const wall = time === 'day' ? '#d6cdb8' : time === 'dusk' ? '#9a8f80' : '#4c4a52';
	const wall2 = time === 'day' ? '#c9c2b0' : time === 'dusk' ? '#8a8072' : '#43414a';
	return (
		<>
			<Card3D x={1300} y={0} z={-20000} w={6000} h={9000} res={6}>
				<FactoryArt f={f} />
			</Card3D>
			<Box3D x={-2600} y={0} z={-6400} w={5600} h={4400} d={3600} side={time === 'day' ? '#a39b88' : '#3a3840'} res={4}>
				<Facade w={5600} h={4400} color={wall} lit={lit} seed={3} cols={8} />
			</Box3D>
			<Box3D x={4600} y={0} z={-8400} w={5600} h={4400} d={3600} side={time === 'day' ? '#9a9382' : '#36343c'} sideOn="left" res={4}>
				<Facade w={5600} h={4400} color={wall2} lit={lit} seed={7} cols={8} />
			</Box3D>
			{[
				[-2000, -3200, 1],
				[1100, -4400, 2],
				[-500, -2300, 3],
			].map(([x, z, k]) => (
				<Card3D key={k} x={x} y={0} z={z} w={1000} h={2600} res={2}>
					<TreeArt f={f} seed={k} />
				</Card3D>
			))}
		</>
	);
};

// the yard, near pass: the ground, garages, the bench, the fence — sharp
export const YardNear: React.FC<{id: string; time?: Time; fence?: boolean; garages?: boolean; litGarage?: number}> = ({id, time = 'day', fence = false, garages = true, litGarage = -1}) => (
	<>
		<Ground3D id={`${id}g`} time={time} />
		{garages && (
			<Box3D x={2300} y={0} z={-1500} w={4000} h={760} d={1800} side="#3e434c">
				<GarageFronts n={5} w={4000} h={760} first={41} lit={litGarage} />
			</Box3D>
		)}
		{fence && (
			<Card3D x={0} y={0} z={-1300} w={9000} h={760}>
				<FenceArt w={9000} />
			</Card3D>
		)}
		<Card3D x={-1500} y={0} z={-900} w={700} h={170}>
			<rect x={0} y={20} width={700} height={44} fill="#7a5a3a" />
			<rect x={0} y={80} width={700} height={30} fill="#7a5a3a" />
			<rect x={40} y={60} width={34} height={110} fill="#4a4a4a" />
			<rect x={620} y={60} width={34} height={110} fill="#4a4a4a" />
		</Card3D>
	</>
);
