// Three ideas for the channel's host — the one who explains everything, like a teacher — side by side in a classroom:
// А · Профессор Палыч (a kind old professor: tweed, round glasses, grey moustache, a bow tie, a pointer),
// Б · Док (a young scientist: a white coat over a hoodie, glasses, a stethoscope, waving),
// В · Костя (a skeleton teacher in a mortarboard and round glasses: «knows everything about the body — he is made of it»).
// Render: npx remotion still HostConcepts out/cover/hosts.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {Person} from '../components/Person';

const CHALK = '#eef3ea';
const BONE = '#f1ece0';
const BONE_D = '#c9c0ad';
const INK = '#1d2024';

const Board: React.FC = () => (
	<g>
		<rect x={0} y={0} width={1920} height={1080} fill="#2e2a26" />
		{/* the blackboard in a wooden frame */}
		<rect x={70} y={60} width={1780} height={690} rx={14} fill="#7a5434" />
		<rect x={92} y={82} width={1736} height={646} rx={8} fill="#24443a" />
		<rect x={92} y={82} width={1736} height={646} rx={8} fill="url(#hostsBoard)" />
		<rect x={70} y={742} width={1780} height={22} rx={6} fill="#5a3c24" />
		{/* chalk doodles */}
		<g stroke={CHALK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55}>
			<path d="M 1770,330 l 0,170 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0 M 1758,350 l 0,140 M 1782,350 l 0,140 M 1758,350 a 12,12 0 0,1 24,0" />
			<path d="M 1800,400 l 26,0 M 1800,440 l 26,0 M 1800,480 l 26,0" />
			<path d="M 160,420 l 0,90 M 115,465 l 90,0 M 128,432 l 64,66 M 192,432 l -64,66" />
			<path d="M 620,640 q 60,-60 120,0 q -60,60 -120,0 Z" />
			<path d="M 1240,600 c -30,-40 -90,-10 -60,40 l 60,50 l 60,-50 c 30,-50 -30,-80 -60,-40 Z" />
		</g>
		<text x={960} y={170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={CHALK} opacity={0.9}>
			КТО БУДЕТ ВЕДУЩИМ?
		</text>
		{/* the floor */}
		<rect x={0} y={790} width={1920} height={290} fill="#8a5e3a" />
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={0} y={790 + k * 34} width={1920} height={3} fill="#7a5032" />
		))}
		{[360, 960, 1560].map((x) => (
			<ellipse key={x} cx={x} cy={985} rx={190} ry={26} fill="#000" opacity={0.25} />
		))}
	</g>
);

// a bow tie and the white shirt collar, at the neck (x, y)
const BowTie: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -34,-6 L 34,-6 L 0,52 Z" fill="#f4f1ea" />
		<path d="M -6,8 L -52,-12 L -52,32 Z M 6,8 L 52,-12 L 52,32 Z" fill="#b8282a" />
		<rect x={-12} y={-2} width={24} height={22} rx={6} fill="#8f1416" />
	</g>
);

// the young scientist's hoodie under the coat and the stethoscope
const Stetho: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -46,-8 L 46,-8 L 0,90 Z" fill="#2a8a8a" />
		<path d="M -60,-4 C -70,120 -20,170 0,180 C 20,170 70,120 60,-4" stroke="#55606a" strokeWidth={12} fill="none" strokeLinecap="round" />
		<circle cx={0} cy={190} r={22} fill="#9aa6b0" stroke="#55606a" strokeWidth={8} />
	</g>
);

// a long wooden pointer in a fist (hand-local coords: along the forearm)
const Pointer: React.FC<{len?: number}> = ({len = 430}) => (
	<g>
		<line x1={0} y1={-20} x2={0} y2={len} stroke="#7a5434" strokeWidth={12} strokeLinecap="round" />
		<line x1={0} y1={len - 40} x2={0} y2={len} stroke="#f4f1ea" strokeWidth={12} strokeLinecap="round" />
	</g>
);

// Костя: a friendly cartoon skeleton, feet at (0,0), about 1130 units tall
const Skeleton: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
	const bone = (x1: number, y1: number, x2: number, y2: number, w = 26) => (
		<g>
			<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BONE_D} strokeWidth={w + 8} strokeLinecap="round" />
			<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
			{[
				[x1, y1],
				[x2, y2],
			].map(([cx, cy], k) => (
				<circle key={k} cx={cx} cy={cy} r={w * 0.72} fill={BONE} stroke={BONE_D} strokeWidth={4} />
			))}
		</g>
	);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{/* legs */}
			{bone(-55, -470, -62, -250)}
			{bone(-62, -250, -64, -40)}
			{bone(55, -470, 62, -250)}
			{bone(62, -250, 64, -40)}
			<ellipse cx={-80} cy={-22} rx={50} ry={22} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			<ellipse cx={80} cy={-22} rx={50} ry={22} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			{/* pelvis */}
			<path d="M -110,-520 C -120,-470 -80,-440 -40,-450 L 0,-470 L 40,-450 C 80,-440 120,-470 110,-520 C 60,-500 -60,-500 -110,-520 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
			<circle cx={-52} cy={-482} r={16} fill={INK} opacity={0.25} />
			<circle cx={52} cy={-482} r={16} fill={INK} opacity={0.25} />
			{/* spine */}
			{Array.from({length: 6}).map((_, k) => (
				<rect key={k} x={-18} y={-650 + k * 24} width={36} height={18} rx={7} fill={BONE} stroke={BONE_D} strokeWidth={4} />
			))}
			{/* ribcage */}
			{Array.from({length: 5}).map((_, k) => {
				const yy = -820 + k * 36;
				const wd = 120 - Math.abs(k - 1.5) * 10;
				return (
					<g key={k} fill="none" strokeLinecap="round">
						<path d={`M -10,${yy} C ${-wd},${yy - 10} ${-wd - 10},${yy + 50} ${-wd + 30},${yy + 62}`} stroke={BONE_D} strokeWidth={22} />
						<path d={`M -10,${yy} C ${-wd},${yy - 10} ${-wd - 10},${yy + 50} ${-wd + 30},${yy + 62}`} stroke={BONE} strokeWidth={14} />
						<path d={`M 10,${yy} C ${wd},${yy - 10} ${wd + 10},${yy + 50} ${wd - 30},${yy + 62}`} stroke={BONE_D} strokeWidth={22} />
						<path d={`M 10,${yy} C ${wd},${yy - 10} ${wd + 10},${yy + 50} ${wd - 30},${yy + 62}`} stroke={BONE} strokeWidth={14} />
					</g>
				);
			})}
			<rect x={-16} y={-830} width={32} height={190} rx={14} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			{/* the tie */}
			<path d="M -16,-850 L 16,-850 L 10,-830 L 26,-700 L 0,-670 L -26,-700 L -10,-830 Z" fill="#b8282a" />
			{/* shoulders and arms: the left one on the hip, the right one holds the pointer up */}
			{bone(-120, -840, 120, -840, 22)}
			{bone(-128, -830, -168, -650)}
			{bone(-168, -650, -96, -540)}
			<ellipse cx={-90} cy={-526} rx={26} ry={30} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			{bone(128, -830, 260, -760)}
			{bone(260, -760, 330, -900)}
			<g transform="translate(340,-918) rotate(28)">
				<line x1={0} y1={30} x2={0} y2={-420} stroke="#7a5434" strokeWidth={12} strokeLinecap="round" />
				<line x1={0} y1={-380} x2={0} y2={-420} stroke="#f4f1ea" strokeWidth={12} strokeLinecap="round" />
			</g>
			<ellipse cx={336} cy={-916} rx={28} ry={30} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			{/* neck */}
			{Array.from({length: 3}).map((_, k) => (
				<rect key={k} x={-16} y={-905 + k * 20} width={32} height={15} rx={6} fill={BONE} stroke={BONE_D} strokeWidth={4} />
			))}
			{/* the skull */}
			<path d="M -100,-1010 C -100,-1130 100,-1130 100,-1010 C 100,-960 80,-940 60,-930 L -60,-930 C -80,-940 -100,-960 -100,-1010 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
			{/* the jaw (it will move with the voice) */}
			<path d="M -62,-934 C -60,-890 60,-890 62,-934 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
			{Array.from({length: 6}).map((_, k) => (
				<rect key={k} x={-42 + k * 14} y={-940} width={11} height={16} rx={3} fill="#fbf8f0" stroke={BONE_D} strokeWidth={2.5} />
			))}
			{/* eyes: dark sockets with friendly white pupils */}
			{[-1, 1].map((sd) => (
				<g key={sd}>
					<ellipse cx={sd * 40} cy={-1010} rx={30} ry={34} fill={INK} />
					<circle cx={sd * 40 + 4} cy={-1006} r={10} fill="#fff" />
					<circle cx={sd * 40 + 8} cy={-1012} r={3.5} fill="#fff" />
				</g>
			))}
			<path d="M 0,-985 L -12,-962 L 12,-962 Z" fill={INK} />
			{/* round glasses */}
			<g fill="none" stroke="#2a2a30" strokeWidth={7}>
				<circle cx={-40} cy={-1010} r={42} />
				<circle cx={40} cy={-1010} r={42} />
				<path d="M -2,-1014 Q 0,-1022 2,-1014" />
			</g>
			{/* the mortarboard */}
			<path d="M -130,-1112 L 0,-1160 L 130,-1112 L 0,-1066 Z" fill="#1d1d24" />
			<rect x={-70} y={-1112} width={140} height={34} rx={6} fill="#26262e" />
			<path d="M 0,-1112 L 96,-1100 L 100,-1040" stroke="#e8b830" strokeWidth={6} fill="none" />
			<circle cx={100} cy={-1036} r={9} fill="#e8b830" />
		</g>
	);
};

const Plate: React.FC<{x: number; letter: string; name: string; tag: string}> = ({x, letter, name, tag}) => (
	<g>
		<text x={x} y={262} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={CHALK} opacity={0.85}>
			{tag}
		</text>
		<rect x={x - 230} y={1006} width={460} height={62} rx={31} fill="#16161c" stroke="#e8b830" strokeWidth={4} />
		<circle cx={x - 196} cy={1037} r={24} fill="#e8b830" />
		<text x={x - 196} y={1049} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill="#16161c">
			{letter}
		</text>
		<text x={x + 22} y={1050} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={name.length > 10 ? 30 : 36} fill="#fff">
			{name}
		</text>
	</g>
);

export const HostConcepts: React.FC = () => {
	const k = 0.6;
	return (
		<AbsoluteFill style={{background: '#2e2a26'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<defs>
					<radialGradient id="hostsBoard" cx="50%" cy="40%" r="70%">
						<stop offset="0%" stopColor="#fff" stopOpacity={0.08} />
						<stop offset="100%" stopColor="#000" stopOpacity={0.25} />
					</radialGradient>
				</defs>
				<Board />
				{/* А · Профессор Палыч */}
				<Person
					kind="dad"
					id="hostA"
					x={360}
					y={980}
					scale={k}
					colors={{top: '#7a5a3e', topDark: '#6a4c33', pants: '#3a3a40', shoes: '#1f1f22', hair: '#cfc9bf', skin: '#efc6a4'}}
					plain
					kneePatch={false}
					moustache="#cfc9bf"
					face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [0.2, 0], blush: true, glasses: true}}
					armR={{shoulder: -35, elbow: -95}}
					itemR={
						<g transform="translate(0,-30)">
							<Pointer />
						</g>
					}
				/>
				<BowTie x={360} y={980 - 900 * k + 6} s={k} />
				{/* Б · Док */}
				<Person
					kind="dad"
					id="hostB"
					x={960}
					y={980}
					scale={k}
					colors={{top: '#f6f8fa', topDark: '#dfe4e8', pants: '#2f3b55', shoes: '#2a2a30', hair: '#2a2220', skin: '#e9b892'}}
					plain
					kneePatch={false}
					face={{eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0, 0], blush: true, glasses: true}}
					armR={{shoulder: -75, elbow: -95}}
				/>
				<Stetho x={960} y={980 - 900 * k + 6} s={k} />
				{/* В · Костя */}
				<Skeleton x={1560} y={980} s={k} />
				<Plate x={360} letter="А" name="ПРОФЕССОР ПАЛЫЧ" tag="ДОБРЫЙ ПРОФЕССОР" />
				<Plate x={960} letter="Б" name="ДОК" tag="МОЛОДОЙ УЧЁНЫЙ" />
				<Plate x={1560} letter="В" name="КОСТЯ" tag="СКЕЛЕТ-УЧИТЕЛЬ" />
			</svg>
		</AbsoluteFill>
	);
};
