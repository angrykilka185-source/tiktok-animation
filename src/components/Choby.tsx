// Чоби — the channel's host (the channel is called «Чоби» too): a small, cute skeleton teacher. A big round head, a
// short body, big shiny eyes behind round glasses, pink cheeks, a red bow tie and an oversized mortarboard.
// Feet at (x, y); about 750 units tall at s = 1 (the head centre at y − 560·s). Flat shading like the other
// characters: the viewer-right half of every bone a shade darker.
//   jaw   0…1  the mouth opens (talking: drive it from the voice envelope)
//   look  [-1…1, -1…1] where the pupils look;  blink 0…1;  tilt — the head tilt in degrees
//   armR  'pointer' | 'wave' | 'point' (a finger up: «запомни») | 'down' | 'hip';   armL  'hip' | 'down' | 'wave' | 'point'
//   bust  draw only from the pelvis up;  shiver 0…1 (with f) — trembling from the cold
import React from 'react';

export const BONE = '#f3eee2';
export const BONE_SH = '#e3dbca';
export const BONE_D = '#bdb29c';
const INK = '#1d2024';

type ArmR = 'pointer' | 'wave' | 'point' | 'down' | 'hip';
type ArmL = 'hip' | 'down' | 'wave' | 'point';

const Bone: React.FC<{a: [number, number]; b: [number, number]; w?: number}> = ({a, b, w = 20}) => (
	<g>
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE_D} strokeWidth={w + 8} strokeLinecap="round" />
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
		{[a, b].map(([cx, cy], k) => (
			<circle key={k} cx={cx} cy={cy} r={w * 0.78} fill={BONE} stroke={BONE_D} strokeWidth={4} />
		))}
	</g>
);

// a small rounded bony hand pointing along `ang` (degrees, 0 = down): a palm and three stubby fingers
const Hand: React.FC<{at: [number, number]; ang?: number; fist?: boolean; finger?: boolean}> = ({at, ang = 0, fist = false, finger = false}) => (
	<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
		{!fist &&
			[-9, 0, 9].map((fx, k) => (
				<g key={k}>
					<line x1={fx} y1={8} x2={fx * 1.15} y2={finger ? 16 : 30} stroke={BONE_D} strokeWidth={12} strokeLinecap="round" />
					<line x1={fx} y1={8} x2={fx * 1.15} y2={finger ? 16 : 30} stroke={BONE} strokeWidth={7} strokeLinecap="round" />
				</g>
			))}
		{finger && (
			<g>
				<line x1={-10} y1={8} x2={-12} y2={44} stroke={BONE_D} strokeWidth={12} strokeLinecap="round" />
				<line x1={-10} y1={8} x2={-12} y2={44} stroke={BONE} strokeWidth={7} strokeLinecap="round" />
			</g>
		)}
		<ellipse cx={0} cy={0} rx={18} ry={16} fill={BONE} stroke={BONE_D} strokeWidth={4} />
	</g>
);

const Pointer: React.FC<{at: [number, number]; ang: number; len?: number}> = ({at, ang, len = 260}) => (
	<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
		<line x1={0} y1={24} x2={0} y2={-len} stroke="#7a5434" strokeWidth={10} strokeLinecap="round" />
		<line x1={0} y1={-len + 32} x2={0} y2={-len} stroke="#f4f1ea" strokeWidth={10} strokeLinecap="round" />
	</g>
);

export const Choby: React.FC<{
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
	blush?: boolean;
	shiver?: number;
	f?: number;
}> = ({x, y, s = 1, jaw = 0.15, look = [0, 0], blink = 0, tilt = 0, armR = 'pointer', armL = 'hip', bust = false, blush = true, shiver = 0, f = 0}) => {
	const sx = shiver ? Math.sin(f * 2.1) * 3 * shiver : 0;
	const jo = Math.max(0, Math.min(1, jaw)) * 22;
	const arm = (side: 1 | -1, pose: ArmR | ArmL) => {
		const sh: [number, number] = [side * 62, -380];
		let el: [number, number];
		let ha: [number, number];
		let hang = 0;
		let extra: React.ReactNode = null;
		let fist = false;
		let finger = false;
		if (pose === 'pointer') {
			el = [side * 118, -330];
			ha = [side * 150, -410];
			hang = side * 200;
			fist = true;
			extra = <Pointer at={[side * 154, -418]} ang={side * 30} />;
		} else if (pose === 'wave') {
			el = [side * 118, -350];
			ha = [side * 132, -440];
			hang = side * 190 + Math.sin(f / 5) * 14;
		} else if (pose === 'point') {
			el = [side * 112, -330];
			ha = [side * 116, -420];
			hang = 180;
			finger = true;
		} else if (pose === 'hip') {
			el = [side * 108, -300];
			ha = [side * 58, -232];
			hang = side * -60;
			fist = true;
		} else {
			el = [side * 86, -300];
			ha = [side * 90, -226];
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
					<Bone a={[-30, -185]} b={[-34, -105]} w={22} />
					<Bone a={[-34, -105]} b={[-36, -32]} w={22} />
					<Bone a={[30, -185]} b={[34, -105]} w={22} />
					<Bone a={[34, -105]} b={[36, -32]} w={22} />
					<ellipse cx={-46} cy={-16} rx={36} ry={18} fill={BONE} stroke={BONE_D} strokeWidth={4.5} />
					<ellipse cx={46} cy={-16} rx={36} ry={18} fill={BONE_SH} stroke={BONE_D} strokeWidth={4.5} />
				</g>
			)}
			{/* pelvis */}
			<path d="M -66,-212 C -72,-182 -46,-166 -20,-172 L 0,-182 L 20,-172 C 46,-166 72,-182 66,-212 C 36,-200 -36,-200 -66,-212 Z" fill={BONE} stroke={BONE_D} strokeWidth={5} />
			<path d="M 0,-202 L 20,-172 C 46,-166 72,-182 66,-212 C 42,-203 20,-201 0,-202 Z" fill={BONE_SH} />
			{/* spine */}
			{Array.from({length: 3}).map((_, k) => (
				<rect key={k} x={-13} y={-268 + k * 20} width={26} height={15} rx={6} fill={BONE} stroke={BONE_D} strokeWidth={3.5} />
			))}
			{/* ribcage */}
			{[0, 1, 2].map((k) => {
				const yy = -372 + k * 30;
				const wd = 66 - k * 6;
				return (
					<g key={k} fill="none" strokeLinecap="round">
						<path d={`M -8,${yy} C ${-wd},${yy - 8} ${-wd - 6},${yy + 40} ${-wd + 22},${yy + 48}`} stroke={BONE_D} strokeWidth={19} />
						<path d={`M -8,${yy} C ${-wd},${yy - 8} ${-wd - 6},${yy + 40} ${-wd + 22},${yy + 48}`} stroke={BONE} strokeWidth={12} />
						<path d={`M 8,${yy} C ${wd},${yy - 8} ${wd + 6},${yy + 40} ${wd - 22},${yy + 48}`} stroke={BONE_D} strokeWidth={19} />
						<path d={`M 8,${yy} C ${wd},${yy - 8} ${wd + 6},${yy + 40} ${wd - 22},${yy + 48}`} stroke={BONE_SH} strokeWidth={12} />
					</g>
				);
			})}
			<rect x={-12} y={-388} width={24} height={118} rx={11} fill={BONE} stroke={BONE_D} strokeWidth={4} />
			{/* collarbones and arms */}
			<Bone a={[-62, -386]} b={[62, -386]} w={18} />
			{arm(-1, armL)}
			{arm(1, armR)}
			{/* the neck and the red bow tie */}
			<rect x={-13} y={-424} width={26} height={22} rx={7} fill={BONE} stroke={BONE_D} strokeWidth={3.5} />
			<g transform="translate(0,-398)">
				<path d="M -4,0 L -40,-18 L -40,18 Z" fill="#d23436" />
				<path d="M 4,0 L 40,-18 L 40,18 Z" fill="#b8282a" />
				<rect x={-10} y={-9} width={20} height={18} rx={6} fill="#9a1e20" />
			</g>
			{/* the head */}
			<g transform={`rotate(${tilt} 0 -430)`}>
				{/* the jaw: a dark mouth opens behind the teeth */}
				<path d={`M -50,-456 C -46,${-428 + jo} 46,${-428 + jo} 50,-456 Z`} fill="#3a2226" />
				<path d={`M -56,${-452 + jo} C -52,${-418 + jo} 52,${-418 + jo} 56,${-452 + jo} L 44,${-448 + jo} L -44,${-448 + jo} Z`} fill={BONE} stroke={BONE_D} strokeWidth={5} />
				{[-28, -14, 0, 14, 28].map((tx, k) => (
					<rect key={`l${k}`} x={tx - 5.5} y={-452 + jo + Math.abs(tx) * 0.06} width={11} height={11} rx={4} fill="#fffdf6" stroke={BONE_D} strokeWidth={2.2} />
				))}
				{/* the round skull */}
				<path d="M -150,-560 C -150,-650 -85,-698 0,-698 C 85,-698 150,-650 150,-560 C 150,-500 120,-464 84,-452 L -84,-452 C -120,-464 -150,-500 -150,-560 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
				<path d="M 0,-698 C 85,-698 150,-650 150,-560 C 150,-500 120,-464 84,-452 L 0,-452 Z" fill={BONE_SH} />
				<ellipse cx={-70} cy={-650} rx={34} ry={16} fill="#fff" opacity={0.5} transform="rotate(-22 -70 -650)" />
				{/* upper teeth on a little smile */}
				{[-28, -14, 0, 14, 28].map((tx, k) => (
					<rect key={k} x={tx - 5.5} y={-466 + Math.abs(tx) * -0.06} width={11} height={13} rx={4} fill="#fffdf6" stroke={BONE_D} strokeWidth={2.2} />
				))}
				{/* pink cheeks */}
				{blush && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 100} cy={-500} rx={22} ry={12} fill="#f0868e" opacity={0.5} />)}
				{/* big shiny eyes */}
				{[-1, 1].map((sd) => (
					<g key={sd}>
						<ellipse cx={sd * 58} cy={-566} rx={44} ry={48} fill={INK} />
						{blink < 0.6 && (
							<g>
								<circle cx={sd * 58 + 5 + look[0] * 12} cy={-560 + look[1] * 12} r={16} fill="#fff" />
								<circle cx={sd * 58 - 12 + look[0] * 12} cy={-544 + look[1] * 12} r={6} fill="#fff" opacity={0.85} />
							</g>
						)}
						{blink > 0 && <rect x={sd * 58 - 46} y={-616} width={92} height={100 * Math.min(1, blink)} fill={BONE} />}
					</g>
				))}
				{/* a little heart-shaped nose */}
				<path d="M 0,-498 C -16,-510 -15,-528 -6,-528 C -2,-528 0,-524 0,-520 C 0,-524 2,-528 6,-528 C 15,-528 16,-510 0,-498 Z" fill={INK} />
				{/* round glasses */}
				<g fill="none" stroke="#2a2a30" strokeWidth={6}>
					<circle cx={-58} cy={-566} r={58} />
					<circle cx={58} cy={-566} r={58} />
					<path d="M -4,-572 Q 0,-580 4,-572" />
					<path d="M -116,-572 L -144,-586 M 116,-572 L 144,-586" />
				</g>
				{/* the oversized mortarboard with its tassel */}
				<g transform="rotate(-5 0 -690)">
					<path d="M -176,-690 L 0,-748 L 176,-690 L 0,-636 Z" fill="#1d1d24" />
					<path d="M 0,-748 L 176,-690 L 0,-636 Z" fill="#15151b" />
					<path d="M -96,-688 L 96,-688 L 92,-652 Q 0,-636 -92,-652 Z" fill="#26262e" />
					<path d="M 0,-690 L 128,-676 L 134,-596" stroke="#f2c230" strokeWidth={6} fill="none" strokeLinecap="round" />
					<circle cx={134} cy={-590} r={12} fill="#f2c230" />
				</g>
			</g>
		</g>
	);
};
