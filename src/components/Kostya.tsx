// Костя — the channel's host: a friendly cartoon skeleton teacher in a mortarboard, round glasses and a red tie.
// Feet at (x, y); about 1160 units tall at s = 1 (skull centre at y − 1010·s). Flat shading like the other characters:
// the viewer-right half of every bone a shade darker.
//   jaw   0…1  the mouth opens (talking: drive it from the voice envelope)
//   look  [-1…1, -1…1] where the pupils look;  blink 0…1;  tilt — the head tilt in degrees
//   armR  'pointer' (a pointer up and out) | 'wave' | 'point' (a finger up: «запомни») | 'down' | 'hip'
//   armL  'hip' | 'down' | 'wave' | 'point'
//   bust  draw only from the pelvis up (the legs are hidden by the frame or a desk)
import React from 'react';

export const BONE = '#f1ece0';
export const BONE_SH = '#e2dac9';
export const BONE_D = '#bfb5a0';
const INK = '#1d2024';

type ArmR = 'pointer' | 'wave' | 'point' | 'down' | 'hip';
type ArmL = 'hip' | 'down' | 'wave' | 'point';

const Bone: React.FC<{a: [number, number]; b: [number, number]; w?: number}> = ({a, b, w = 26}) => (
	<g>
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE_D} strokeWidth={w + 9} strokeLinecap="round" />
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
		{[a, b].map(([cx, cy], k) => (
			<circle key={k} cx={cx} cy={cy} r={w * 0.74} fill={BONE} stroke={BONE_D} strokeWidth={4.5} />
		))}
	</g>
);

// a bony hand: a palm and four short fingers (+ a thumb), pointing along `ang` (degrees, 0 = down)
const Hand: React.FC<{at: [number, number]; ang?: number; fist?: boolean; finger?: boolean}> = ({at, ang = 0, fist = false, finger = false}) => (
	<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
		{!fist &&
			[-15, -5, 5, 15].map((fx, k) => (
				<line key={k} x1={fx} y1={10} x2={fx * 1.1} y2={finger && k > 0 ? 22 : 44} stroke={BONE_D} strokeWidth={13} strokeLinecap="round" />
			))}
		{!fist &&
			[-15, -5, 5, 15].map((fx, k) => (
				<line key={`i${k}`} x1={fx} y1={10} x2={fx * 1.1} y2={finger && k > 0 ? 22 : 44} stroke={BONE} strokeWidth={8} strokeLinecap="round" />
			))}
		{finger && (
			<g>
				<line x1={-15} y1={10} x2={-17} y2={60} stroke={BONE_D} strokeWidth={13} strokeLinecap="round" />
				<line x1={-15} y1={10} x2={-17} y2={60} stroke={BONE} strokeWidth={8} strokeLinecap="round" />
			</g>
		)}
		<line x1={-22} y1={-2} x2={-34} y2={22} stroke={BONE_D} strokeWidth={13} strokeLinecap="round" />
		<line x1={-22} y1={-2} x2={-34} y2={22} stroke={BONE} strokeWidth={8} strokeLinecap="round" />
		<ellipse cx={0} cy={0} rx={24} ry={20} fill={BONE} stroke={BONE_D} strokeWidth={4.5} />
	</g>
);

const Pointer: React.FC<{at: [number, number]; ang: number; len?: number}> = ({at, ang, len = 420}) => (
	<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
		<line x1={0} y1={30} x2={0} y2={-len} stroke="#7a5434" strokeWidth={12} strokeLinecap="round" />
		<line x1={0} y1={-len + 40} x2={0} y2={-len} stroke="#f4f1ea" strokeWidth={12} strokeLinecap="round" />
	</g>
);

export const Kostya: React.FC<{
	x: number;
	y: number;
	s?: number;
	jaw?: number;
	look?: [number, number];
	blink?: number;
	tilt?: number;
	armR?: ArmR;
	armL?: ArmL;
	bust?: boolean;
	shiver?: number;
	f?: number;
}> = ({x, y, s = 1, jaw = 0.15, look = [0, 0], blink = 0, tilt = 0, armR = 'pointer', armL = 'hip', bust = false, shiver = 0, f = 0}) => {
	const sx = shiver ? Math.sin(f * 2.1) * 4 * shiver : 0;
	const jo = Math.max(0, Math.min(1, jaw)) * 30;
	const arm = (side: 1 | -1, pose: ArmR | ArmL) => {
		const sh: [number, number] = [side * 128, -830];
		let el: [number, number];
		let ha: [number, number];
		let hang = 0;
		let extra: React.ReactNode = null;
		let fist = false;
		let finger = false;
		if (pose === 'pointer') {
			el = [side * 260, -760];
			ha = [side * 330, -900];
			hang = side * 200;
			fist = true;
			extra = <Pointer at={[side * 336, -916]} ang={side * 28} len={340} />;
		} else if (pose === 'wave') {
			el = [side * 250, -820];
			ha = [side * 285, -1000];
			hang = side * 190 + Math.sin(f / 5) * 12;
		} else if (pose === 'point') {
			el = [side * 235, -770];
			ha = [side * 250, -950];
			hang = 180;
			finger = true;
		} else if (pose === 'hip') {
			el = [side * 172, -650];
			ha = [side * 96, -540];
			hang = side * -60;
			fist = true;
		} else {
			el = [side * 160, -650];
			ha = [side * 168, -480];
			hang = 0;
		}
		return (
			<g>
				<Bone a={sh} b={el} />
				<Bone a={el} b={ha} />
				{extra}
				<Hand at={ha} ang={hang} fist={fist} finger={finger} />
			</g>
		);
	};
	return (
		<g transform={`translate(${x + sx * s},${y}) scale(${s})`}>
			{!bust && (
				<g>
					<Bone a={[-55, -470]} b={[-62, -250]} />
					<Bone a={[-62, -250]} b={[-64, -40]} />
					<Bone a={[55, -470]} b={[62, -250]} />
					<Bone a={[62, -250]} b={[64, -40]} />
					<ellipse cx={-80} cy={-22} rx={50} ry={22} fill={BONE} stroke={BONE_D} strokeWidth={5} />
					<ellipse cx={80} cy={-22} rx={50} ry={22} fill={BONE_SH} stroke={BONE_D} strokeWidth={5} />
				</g>
			)}
			{/* pelvis */}
			<path d="M -110,-520 C -120,-470 -80,-440 -40,-450 L 0,-470 L 40,-450 C 80,-440 120,-470 110,-520 C 60,-500 -60,-500 -110,-520 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
			<path d="M 0,-505 L 40,-450 C 80,-440 120,-470 110,-520 C 70,-506 30,-503 0,-505 Z" fill={BONE_SH} />
			<circle cx={-52} cy={-482} r={16} fill={INK} opacity={0.22} />
			<circle cx={52} cy={-482} r={16} fill={INK} opacity={0.22} />
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
						<path d={`M 10,${yy} C ${wd},${yy - 10} ${wd + 10},${yy + 50} ${wd - 30},${yy + 62}`} stroke={BONE_SH} strokeWidth={14} />
					</g>
				);
			})}
			<rect x={-16} y={-830} width={32} height={190} rx={14} fill={BONE} stroke={BONE_D} strokeWidth={5} />
			{/* the tie */}
			<path d="M -16,-850 L 16,-850 L 10,-830 L 26,-700 L 0,-670 L -26,-700 L -10,-830 Z" fill="#c42c2e" />
			<path d="M 0,-850 L 16,-850 L 10,-830 L 26,-700 L 0,-670 Z" fill="#a82224" />
			{/* collarbones */}
			<Bone a={[-120, -840]} b={[120, -840]} w={22} />
			{arm(-1, armL)}
			{arm(1, armR)}
			{/* the neck */}
			{Array.from({length: 3}).map((_, k) => (
				<rect key={k} x={-16} y={-905 + k * 20} width={32} height={15} rx={6} fill={BONE} stroke={BONE_D} strokeWidth={4} />
			))}
			{/* the head */}
			<g transform={`rotate(${tilt} 0 -900)`}>
				{/* the jaw drops when talking: a dark mouth opens behind the teeth */}
				<path d={`M -58,-934 C -56,${-900 + jo} 56,${-900 + jo} 58,-934 Z`} fill="#3a2226" />
				<path d={`M -62,${-930 + jo} C -60,${-886 + jo} 60,${-886 + jo} 62,${-930 + jo} L 50,${-924 + jo} L -50,${-924 + jo} Z`} fill={BONE} stroke={BONE_D} strokeWidth={6} />
				{Array.from({length: 6}).map((_, k) => (
					<rect key={`l${k}`} x={-42 + k * 14} y={-930 + jo} width={11} height={13} rx={3} fill="#fbf8f0" stroke={BONE_D} strokeWidth={2.5} />
				))}
				{/* the skull */}
				<path d="M -100,-1010 C -100,-1130 100,-1130 100,-1010 C 100,-960 80,-940 60,-930 L -60,-930 C -80,-940 -100,-960 -100,-1010 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
				<path d="M 0,-1098 C 60,-1098 100,-1070 100,-1010 C 100,-960 80,-940 60,-930 L 0,-930 Z" fill={BONE_SH} />
				<ellipse cx={-48} cy={-1080} rx={26} ry={12} fill="#fff" opacity={0.45} transform="rotate(-18 -48 -1080)" />
				{Array.from({length: 6}).map((_, k) => (
					<rect key={k} x={-42 + k * 14} y={-944} width={11} height={16} rx={3} fill="#fbf8f0" stroke={BONE_D} strokeWidth={2.5} />
				))}
				{/* eyes: dark sockets with friendly white pupils */}
				{[-1, 1].map((sd) => (
					<g key={sd}>
						<ellipse cx={sd * 40} cy={-1010} rx={30} ry={34} fill={INK} />
						{blink < 0.6 && (
							<g>
								<circle cx={sd * 40 + 4 + look[0] * 9} cy={-1006 + look[1] * 9} r={10} fill="#fff" />
								<circle cx={sd * 40 + 8 + look[0] * 9} cy={-1012 + look[1] * 9} r={3.5} fill="#fff" />
							</g>
						)}
						{blink > 0 && <rect x={sd * 40 - 32} y={-1046} width={64} height={70 * Math.min(1, blink)} fill={BONE} />}
					</g>
				))}
				<path d="M 0,-985 L -12,-962 L 12,-962 Z" fill={INK} />
				{/* round glasses */}
				<g fill="none" stroke="#2a2a30" strokeWidth={7}>
					<circle cx={-40} cy={-1010} r={42} />
					<circle cx={40} cy={-1010} r={42} />
					<path d="M -2,-1014 Q 0,-1022 2,-1014" />
					<path d="M -82,-1014 L -98,-1022 M 82,-1014 L 98,-1022" />
				</g>
				{/* the mortarboard */}
				<path d="M -132,-1112 L 0,-1162 L 132,-1112 L 0,-1064 Z" fill="#1d1d24" />
				<path d="M 0,-1162 L 132,-1112 L 0,-1064 Z" fill="#15151b" />
				<rect x={-72} y={-1112} width={144} height={34} rx={6} fill="#26262e" />
				<path d="M 0,-1112 L 98,-1100 L 102,-1040" stroke="#e8b830" strokeWidth={6} fill="none" />
				<circle cx={102} cy={-1036} r={9} fill="#e8b830" />
			</g>
		</g>
	);
};
