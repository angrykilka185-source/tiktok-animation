import React from 'react';

// ---------------------------------------------------------------------------
// Flat-vector characters with the "half-face shadow" look:
// every character is drawn, then a darker copy of its silhouette is clipped to
// the right half (see <Shaded/>).
// Local coordinates: feet at (0,0), y grows downward, so the body is at y<0.
// ---------------------------------------------------------------------------

export type Eyes = 'open' | 'closed' | 'happy' | 'wide' | 'narrow' | 'stare';
export type Mouth = 'smile' | 'flat' | 'frown' | 'open' | 'o' | 'grin' | 'tight' | 'none' | 'wobble';
export type Brows = 'neutral' | 'worried' | 'angry' | 'raised' | 'sad' | 'flat';

export type Face = {
	eyes?: Eyes;
	look?: [number, number]; // pupil offset -1..1
	pupil?: number; // pupil scale (1 = normal)
	brows?: Brows;
	mouth?: Mouth;
	tears?: number; // 0..1 length of tear streams
	blink?: number; // 0..1 lid closure (overrides eyes when > 0)
	sweat?: number; // 0..1
	stubble?: boolean;
	blush?: boolean;
};

export type ArmPose =
	| {shoulder: number; elbow: number}
	| {target: [number, number]; bend?: 1 | -1};

export type Kind = 'dad' | 'mom' | 'son';

export type PersonProps = {
	kind: Kind;
	id: string;
	x?: number;
	y?: number;
	scale?: number;
	face?: Face;
	armL?: ArmPose; // viewer-left arm (character's right arm)
	armR?: ArmPose; // viewer-right arm (character's left arm)
	itemL?: React.ReactNode; // drawn in the hand of armL (hand-local coords)
	itemR?: React.ReactNode;
	walk?: number; // walk phase in radians, undefined = standing
	breathe?: number; // frame for idle breathing
	headTilt?: number;
	headTurn?: number; // -1..1 small horizontal shift of features
	back?: boolean; // seen from behind
	backpack?: boolean;
	silhouette?: string; // draw as flat silhouette of this color
	shade?: boolean;
	hideLegs?: boolean;
	towel?: boolean;
};

export const PALETTE = {
	skin: '#f2c3a0',
	skinLine: '#c98a6a',
	blush: '#ef9a8a',
	eyeWhite: '#f4f1ec',
	iris: '#3d4f66',
	pupil: '#121418',
	brow: '#2a1a12',
	mouth: '#7a2e26',
	teeth: '#fbf6ee',
	tear: '#8fd0f5',
};

type Spec = {
	leg: number; legW: number; legGap: number;
	torso: number; shoulderW: number; hipW: number;
	neck: number; neckW: number;
	hw: number; hh: number;
	upper: number; fore: number; armW: number; hand: number;
	top: string; topDark: string; pants: string; shoes: string; hair: string; skin: string;
};

export const SPECS: Record<Kind, Spec> = {
	dad: {
		leg: 470, legW: 78, legGap: 14,
		torso: 430, shoulderW: 290, hipW: 240,
		neck: 46, neckW: 58,
		hw: 82, hh: 104,
		upper: 225, fore: 215, armW: 62, hand: 30,
		top: '#33506e', topDark: '#263c55', pants: '#4b4f55', shoes: '#1f2226', hair: '#3a2a20', skin: '#e9b892',
	},
	mom: {
		leg: 400, legW: 54, legGap: 26,
		torso: 380, shoulderW: 230, hipW: 250,
		neck: 50, neckW: 46,
		hw: 76, hh: 98,
		upper: 195, fore: 185, armW: 52, hand: 26,
		top: '#4c7fae', topDark: '#3c6894', pants: '#f2c3a0', shoes: '#7c3b4c', hair: '#7a4a2c', skin: '#f2c3a0',
	},
	son: {
		leg: 330, legW: 62, legGap: 10,
		torso: 300, shoulderW: 210, hipW: 190,
		neck: 34, neckW: 44,
		hw: 78, hh: 96,
		upper: 160, fore: 150, armW: 52, hand: 24,
		top: '#f0a032', topDark: '#d8862a', pants: '#2f3f68', shoes: '#22252b', hair: '#8a5a32', skin: '#f2c3a0',
	},
};

const deg = (r: number) => (r * 180) / Math.PI;

// 2-bone IK. Arm local rotation: 0 = hanging straight down, positive = clockwise.
export const solveArm = (pose: ArmPose | undefined, L1: number, L2: number, side: -1 | 1) => {
	if (!pose) return {shoulder: side * -6, elbow: side * 4};
	if ('shoulder' in pose) return pose;
	const [dx, dy] = pose.target;
	const d = Math.max(1, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
	const base = deg(Math.atan2(-dx, dy));
	const a = deg(Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))));
	const b = deg(Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)))));
	const bend = pose.bend ?? (side === 1 ? 1 : -1);
	return {shoulder: base + bend * a, elbow: -bend * (180 - b)};
};

// ---------------------------------------------------------------------------
export const Head: React.FC<{
	kind: Kind;
	face?: Face;
	back?: boolean;
	turn?: number;
	silhouette?: string;
	uid?: string;
}> = ({kind, face = {}, back, turn = 0, silhouette, uid = 'h'}) => {
	const sp = SPECS[kind];
	const {hw, hh} = sp;
	const skin = silhouette ?? sp.skin;
	const hair = silhouette ?? sp.hair;
	const tx = turn * hw * 0.12;

	const facePath = `M ${-hw},${-hh * 0.15} C ${-hw},${-hh * 1.08} ${hw},${-hh * 1.08} ${hw},${-hh * 0.15} C ${hw},${hh * 0.5} ${hw * 0.5},${hh} 0,${hh} C ${-hw * 0.5},${hh} ${-hw},${hh * 0.5} ${-hw},${-hh * 0.15} Z`;

	const ears = (
		<>
			<ellipse cx={-hw * 1.0} cy={hh * 0.08} rx={hw * 0.17} ry={hh * 0.17} fill={skin} />
			<ellipse cx={hw * 1.0} cy={hh * 0.08} rx={hw * 0.17} ry={hh * 0.17} fill={skin} />
		</>
	);

	// ---- hair (behind / front) ----
	let hairBack: React.ReactNode = null;
	let hairFront: React.ReactNode = null;
	if (kind === 'dad') {
		hairFront = (
			<path
				d={`M ${-hw * 1.02},${-hh * 0.12} C ${-hw * 1.1},${-hh * 1.15} ${hw * 1.1},${-hh * 1.15} ${hw * 1.02},${-hh * 0.12} C ${hw * 0.95},${-hh * 0.5} ${hw * 0.7},${-hh * 0.62} ${hw * 0.2},${-hh * 0.6} C ${-hw * 0.3},${-hh * 0.58} ${-hw * 0.85},${-hh * 0.55} ${-hw * 1.02},${-hh * 0.12} Z`}
				fill={hair}
			/>
		);
	} else if (kind === 'mom') {
		hairBack = <circle cx={0} cy={-hh * 1.05} r={hw * 0.48} fill={hair} />;
		hairFront = (
			<>
				<path
					d={`M ${-hw * 1.05},${hh * 0.1} C ${-hw * 1.15},${-hh * 1.2} ${hw * 1.15},${-hh * 1.2} ${hw * 1.05},${hh * 0.1} C ${hw * 0.9},${-hh * 0.4} ${hw * 0.45},${-hh * 0.62} 0,${-hh * 0.62} C ${-hw * 0.45},${-hh * 0.62} ${-hw * 0.9},${-hh * 0.4} ${-hw * 1.05},${hh * 0.1} Z`}
					fill={hair}
				/>
				{!silhouette && (
					<path
						d={`M ${-hw * 0.75},${-hh * 0.55} Q ${-hw * 0.3},${-hh * 0.95} ${hw * 0.1},${-hh * 0.88}`}
						stroke="#d9c3b0"
						strokeWidth={hw * 0.07}
						fill="none"
						strokeLinecap="round"
						opacity={0.8}
					/>
				)}
			</>
		);
	} else {
		hairFront = (
			<path
				d={`M ${-hw * 1.1},${hh * 0.35} C ${-hw * 1.3},${-hh * 1.3} ${hw * 1.3},${-hh * 1.3} ${hw * 1.1},${hh * 0.35} L ${hw * 0.98},${hh * 0.3} C ${hw * 0.95},${-hh * 0.15} ${hw * 0.8},${-hh * 0.35} ${hw * 0.55},${-hh * 0.42} L ${hw * 0.25},${-hh * 0.3} L ${hw * 0.1},${-hh * 0.45} C ${-hw * 0.3},${-hh * 0.45} ${-hw * 0.9},${-hh * 0.35} ${-hw * 0.98},${hh * 0.3} Z`}
				fill={hair}
			/>
		);
	}

	if (back) {
		return (
			<g>
				{hairBack}
				{ears}
				<path d={facePath} fill={skin} />
				<path
					d={`M ${-hw * 1.04},${hh * (kind === 'mom' ? 0.55 : 0.35)} C ${-hw * 1.15},${-hh * 1.2} ${hw * 1.15},${-hh * 1.2} ${hw * 1.04},${hh * (kind === 'mom' ? 0.55 : 0.35)} C ${hw * 0.6},${hh * 0.6} ${-hw * 0.6},${hh * 0.6} ${-hw * 1.04},${hh * (kind === 'mom' ? 0.55 : 0.35)} Z`}
					fill={hair}
				/>
			</g>
		);
	}

	if (silhouette) {
		return (
			<g>
				{hairBack}
				{ears}
				<path d={facePath} fill={skin} />
				{hairFront}
			</g>
		);
	}

	// ---- features ----
	const ex = hw * 0.42;
	const ey = -hh * 0.02;
	const eRx = hw * 0.25;
	const eRy = hh * 0.12;
	const [lx, ly] = face.look ?? [0, 0];
	const pr = hw * 0.125 * (face.pupil ?? 1);
	const eyes = face.eyes ?? 'open';
	const blink = face.blink ?? 0;

	const eye = (cx: number) => {
		if (eyes === 'closed' || blink > 0.85) {
			return (
				<path
					d={`M ${cx - eRx * 0.85},${ey + 2} Q ${cx},${ey + eRy * 0.7} ${cx + eRx * 0.85},${ey + 2}`}
					stroke={PALETTE.brow}
					strokeWidth={hw * 0.075}
					fill="none"
					strokeLinecap="round"
				/>
			);
		}
		if (eyes === 'happy') {
			return (
				<path
					d={`M ${cx - eRx * 0.85},${ey + eRy * 0.3} Q ${cx},${ey - eRy * 1.0} ${cx + eRx * 0.85},${ey + eRy * 0.3}`}
					stroke={PALETTE.brow}
					strokeWidth={hw * 0.08}
					fill="none"
					strokeLinecap="round"
				/>
			);
		}
		const sY = eyes === 'wide' ? 1.35 : eyes === 'narrow' ? 0.6 : eyes === 'stare' ? 1.15 : 1;
		const sX = eyes === 'wide' ? 1.12 : 1;
		const ry = eRy * sY * (1 - blink);
		const id = `${uid}-${kind}e${Math.round(cx)}`;
		return (
			<g>
				<clipPath id={id}>
					<ellipse cx={cx} cy={ey} rx={eRx * sX} ry={Math.max(0.5, ry)} />
				</clipPath>
				<ellipse cx={cx} cy={ey} rx={eRx * sX} ry={Math.max(0.5, ry)} fill={PALETTE.eyeWhite} />
				<g clipPath={`url(#${id})`}>
					<circle cx={cx + lx * eRx * 0.5} cy={ey + ly * eRy * 0.45} r={pr * 1.25} fill={PALETTE.iris} />
					<circle cx={cx + lx * eRx * 0.5} cy={ey + ly * eRy * 0.45} r={pr * 0.78} fill={PALETTE.pupil} />
					{eyes !== 'stare' && (
						<circle cx={cx + lx * eRx * 0.5 - pr * 0.45} cy={ey + ly * eRy * 0.45 - pr * 0.45} r={pr * 0.32} fill="#fff" />
					)}
				</g>
				{eyes === 'narrow' && (
					<path d={`M ${cx - eRx * 1.05},${ey - ry * 0.7} L ${cx + eRx * 1.05},${ey - ry * 0.9}`} stroke={sp.skin} strokeWidth={eRy * 0.5} />
				)}
			</g>
		);
	};

	const brows = face.brows ?? 'neutral';
	const by = -hh * 0.3;
	const bw = hw * 0.36;
	const browPath = (cx: number, side: -1 | 1) => {
		let inner = 0, outer = 0, arch = -hh * 0.06;
		if (brows === 'worried' || brows === 'sad') { inner = -hh * 0.12; outer = hh * 0.04; arch = -hh * 0.02; }
		if (brows === 'angry') { inner = hh * 0.08; outer = -hh * 0.06; arch = 0; }
		if (brows === 'raised') { inner = -hh * 0.12; outer = -hh * 0.1; arch = -hh * 0.08; }
		if (brows === 'flat') { inner = 0; outer = 0; arch = 0; }
		const xi = cx - side * bw * 0.5; // inner end (towards the nose)
		const xo = cx + side * bw * 0.6;
		return `M ${xi},${by + inner} Q ${cx},${by + Math.min(inner, outer) + arch} ${xo},${by + outer}`;
	};

	const mouth = face.mouth ?? 'smile';
	const my = hh * 0.58;
	const mw = hw * 0.38;
	let mouthEl: React.ReactNode = null;
	switch (mouth) {
		case 'smile':
			mouthEl = <path d={`M ${-mw},${my - 6} Q 0,${my + hh * 0.18} ${mw},${my - 6} Q 0,${my + hh * 0.05} ${-mw},${my - 6} Z`} fill={PALETTE.mouth} />;
			break;
		case 'grin':
			mouthEl = (
				<g>
					<path d={`M ${-mw * 1.35},${my - hh * 0.06} Q 0,${my + hh * 0.3} ${mw * 1.35},${my - hh * 0.06} Q 0,${my + hh * 0.05} ${-mw * 1.35},${my - hh * 0.06} Z`} fill={PALETTE.mouth} />
					<path d={`M ${-mw * 1.2},${my - hh * 0.035} Q 0,${my + hh * 0.06} ${mw * 1.2},${my - hh * 0.035} L ${mw * 1.05},${my + hh * 0.06} Q 0,${my + hh * 0.12} ${-mw * 1.05},${my + hh * 0.06} Z`} fill={PALETTE.teeth} />
					{[-0.7, -0.35, 0, 0.35, 0.7].map((k) => (
						<line key={k} x1={k * mw} y1={my} x2={k * mw} y2={my + hh * 0.09} stroke="#d9cfc2" strokeWidth={2} />
					))}
				</g>
			);
			break;
		case 'flat':
			mouthEl = <path d={`M ${-mw * 0.8},${my} L ${mw * 0.8},${my}`} stroke={PALETTE.mouth} strokeWidth={hh * 0.06} strokeLinecap="round" />;
			break;
		case 'tight':
			mouthEl = <path d={`M ${-mw * 0.5},${my + 3} Q 0,${my - 4} ${mw * 0.5},${my + 3}`} stroke={PALETTE.mouth} strokeWidth={hh * 0.055} fill="none" strokeLinecap="round" />;
			break;
		case 'frown':
			mouthEl = <path d={`M ${-mw * 0.75},${my + hh * 0.05} Q 0,${my - hh * 0.09} ${mw * 0.75},${my + hh * 0.05}`} stroke={PALETTE.mouth} strokeWidth={hh * 0.075} fill="none" strokeLinecap="round" />;
			break;
		case 'wobble':
			mouthEl = <path d={`M ${-mw * 0.8},${my + 4} q ${mw * 0.27},-10 ${mw * 0.53},0 t ${mw * 0.53},0 t ${mw * 0.53},0`} stroke={PALETTE.mouth} strokeWidth={hh * 0.05} fill="none" strokeLinecap="round" />;
			break;
		case 'open':
			mouthEl = <ellipse cx={0} cy={my + 4} rx={mw * 0.62} ry={hh * 0.12} fill={PALETTE.mouth} />;
			break;
		case 'o':
			mouthEl = <ellipse cx={0} cy={my + 2} rx={mw * 0.32} ry={hh * 0.085} fill={PALETTE.mouth} />;
			break;
		default:
			mouthEl = null;
	}

	const tears = face.tears ?? 0;

	return (
		<g>
			{hairBack}
			{ears}
			<path d={facePath} fill={skin} />
			{face.stubble && (
				<path
					d={`M ${-hw * 0.92},${hh * 0.25} C ${-hw * 0.8},${hh * 0.95} ${hw * 0.8},${hh * 0.95} ${hw * 0.92},${hh * 0.25} C ${hw * 0.5},${hh * 0.45} ${-hw * 0.5},${hh * 0.45} ${-hw * 0.92},${hh * 0.25} Z`}
					fill="#6b4a3a"
					opacity={0.16}
				/>
			)}
			<g transform={`translate(${tx},0)`}>
				{face.blush !== false && (
					<>
						<ellipse cx={-hw * 0.55} cy={hh * 0.3} rx={hw * 0.2} ry={hh * 0.09} fill={PALETTE.blush} opacity={0.55} />
						<ellipse cx={hw * 0.55} cy={hh * 0.3} rx={hw * 0.2} ry={hh * 0.09} fill={PALETTE.blush} opacity={0.55} />
					</>
				)}
				{eye(-ex)}
				{eye(ex)}
				<path d={browPath(-ex, -1)} stroke={PALETTE.brow} strokeWidth={hh * 0.085} fill="none" strokeLinecap="round" />
				<path d={browPath(ex, 1)} stroke={PALETTE.brow} strokeWidth={hh * 0.085} fill="none" strokeLinecap="round" />
				{/* nose */}
				<path
					d={`M ${hw * 0.04},${-hh * 0.05} L ${-hw * 0.06},${hh * 0.32} Q ${hw * 0.02},${hh * 0.38} ${hw * 0.16},${hh * 0.33}`}
					stroke={PALETTE.skinLine}
					strokeWidth={hh * 0.045}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{mouthEl}
				{tears > 0 && (
					<>
						<path d={`M ${-ex},${ey + eRy} L ${-ex - 2},${ey + eRy + hh * 0.55 * tears}`} stroke={PALETTE.tear} strokeWidth={hw * 0.07} strokeLinecap="round" />
						<path d={`M ${ex},${ey + eRy} L ${ex + 2},${ey + eRy + hh * 0.55 * tears}`} stroke={PALETTE.tear} strokeWidth={hw * 0.07} strokeLinecap="round" />
					</>
				)}
				{(face.sweat ?? 0) > 0 && (
					<path
						d={`M ${hw * 0.82},${-hh * 0.5 + hh * 0.3 * (face.sweat ?? 0)} q ${-hw * 0.09},${hh * 0.12} 0,${hh * 0.15} q ${hw * 0.09},${-hh * 0.03} 0,${-hh * 0.15} Z`}
						fill={PALETTE.tear}
					/>
				)}
			</g>
			{hairFront}
		</g>
	);
};

// ---------------------------------------------------------------------------
// The signature look: a darker copy of the silhouette on the right half.
export const Shaded: React.FC<{id: string; x0?: number; enabled?: boolean; opacity?: number; children: React.ReactNode}> = ({
	id,
	x0 = 0,
	enabled = true,
	opacity = 0.2,
	children,
}) => {
	if (!enabled) return <g>{children}</g>;
	return (
		<g>
			<defs>
				<g id={id}>{children}</g>
				<clipPath id={`${id}-c`} clipPathUnits="userSpaceOnUse">
					<rect x={x0} y={-20000} width={40000} height={40000} />
				</clipPath>
				<filter id={`${id}-f`} x="-5%" y="-5%" width="110%" height="110%">
					<feFlood floodColor="#2a1408" floodOpacity={opacity} />
					<feComposite in2="SourceAlpha" operator="in" />
				</filter>
			</defs>
			<use href={`#${id}`} />
			<g clipPath={`url(#${id}-c)`}>
				<use href={`#${id}`} filter={`url(#${id}-f)`} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------------------
const Arm: React.FC<{
	sx: number;
	sy: number;
	side: -1 | 1;
	pose?: ArmPose;
	sp: Spec;
	color: string;
	skin: string;
	item?: React.ReactNode;
	stripe?: string;
}> = ({sx, sy, side, pose, sp, color, skin, item, stripe}) => {
	const L2 = sp.fore + sp.hand * 0.6;
	const target = pose && 'target' in pose ? {target: [pose.target[0] - sx, pose.target[1] - sy] as [number, number], bend: pose.bend} : pose;
	const {shoulder, elbow} = solveArm(target, sp.upper, L2, side);
	const w = sp.armW;
	return (
		<g transform={`translate(${sx},${sy}) rotate(${shoulder})`}>
			<rect x={-w / 2} y={-w / 2} width={w} height={sp.upper + w / 2} rx={w / 2} fill={color} />
			<g transform={`translate(0,${sp.upper}) rotate(${elbow})`}>
				<rect x={-w / 2} y={-w / 2} width={w} height={sp.fore + w / 2 - 6} rx={w / 2.2} fill={color} />
				{stripe && <rect x={-w / 2} y={sp.fore * 0.45} width={w} height={w * 0.28} fill={stripe} />}
				<circle cx={0} cy={sp.fore + sp.hand * 0.4} r={sp.hand} fill={skin} stroke={skin === sp.skin ? 'rgba(140,70,40,0.45)' : 'none'} strokeWidth={3} />
				{item && <g transform={`translate(0,${sp.fore + sp.hand * 0.4})`}>{item}</g>}
			</g>
		</g>
	);
};

// ---------------------------------------------------------------------------
export const Person: React.FC<PersonProps> = (p) => {
	const sp = SPECS[p.kind];
	const sil = p.silhouette;
	const top = sil ?? sp.top;
	const topDark = sil ?? sp.topDark;
	const pants = sil ?? sp.pants;
	const shoes = sil ?? sp.shoes;
	const skin = sil ?? sp.skin;

	const walking = p.walk !== undefined;
	const ph = p.walk ?? 0;
	const bob = walking ? -Math.abs(Math.sin(ph)) * 10 : 0;
	const breathe = p.breathe !== undefined ? Math.sin(p.breathe / 14) * 0.006 : 0;

	const hipY = -sp.leg;
	const shY = hipY - sp.torso;
	const neckTop = shY - sp.neck + 10;
	const headCY = neckTop - sp.hh * 0.85;

	const swing = walking ? Math.sin(ph) * 16 : 0;

	const legs = p.hideLegs ? null : (
		<g>
			{[-1, 1].map((s) => {
				const lx = s * (sp.legW / 2 + sp.legGap / 2);
				const rot = s * swing;
				return (
					<g key={s} transform={`translate(${lx},${hipY}) rotate(${rot})`}>
						{p.kind === 'mom' ? (
							<rect x={-sp.legW / 2} y={0} width={sp.legW} height={sp.leg} fill={skin} />
						) : (
							<rect x={-sp.legW / 2} y={0} width={sp.legW} height={sp.leg - 20} fill={pants} />
						)}
						{p.kind === 'dad' && !sil && <rect x={-sp.legW / 2} y={sp.leg * 0.48} width={sp.legW} height={50} rx={10} fill="#3a3d42" />}
						<rect x={-sp.legW / 2 - (p.back ? 4 : 10)} y={sp.leg - 34} width={sp.legW + 20} height={36} rx={14} fill={shoes} />
					</g>
				);
			})}
		</g>
	);

	// torso
	const sw = sp.shoulderW / 2;
	const hwid = sp.hipW / 2;
	let torso: React.ReactNode;
	if (p.kind === 'mom') {
		// dress to below knees
		const hem = hipY + sp.leg * 0.55;
		torso = (
			<g>
				<path d={`M ${-sw},${shY + 18} Q ${-sw},${shY} ${-sw + 20},${shY} L ${sw - 20},${shY} Q ${sw},${shY} ${sw},${shY + 18} L ${sw + 30},${hem} L ${-sw - 30},${hem} Z`} fill={top} />
				{!sil && (
					<>
						{Array.from({length: 22}).map((_, i) => {
							const px = ((i * 73) % (sw * 2 + 40)) - sw - 20;
							const py = shY + 60 + ((i * 137) % (hem - shY - 80));
							return <circle key={i} cx={px} cy={py} r={7} fill="#cfdcec" opacity={0.85} />;
						})}
						{!p.back && (
							<path d={`M ${-sw * 0.62},${shY + 120} L ${sw * 0.62},${shY + 120} L ${sw * 0.78},${hem - 6} L ${-sw * 0.78},${hem - 6} Z`} fill="#f3ead8" />
						)}
						{!p.back && <path d={`M ${-40},${shY} Q 0,${shY + 50} 40,${shY}`} fill={sp.skin} />}
						{p.back && <rect x={-sw * 0.62} y={hipY - 60} width={sw * 1.24} height={14} fill="#f3ead8" />}
					</>
				)}
			</g>
		);
	} else {
		torso = (
			<g>
				<path d={`M ${-sw},${shY + 30} Q ${-sw},${shY} ${-sw + 34},${shY} L ${sw - 34},${shY} Q ${sw},${shY} ${sw},${shY + 30} L ${hwid + 6},${hipY + 18} L ${-hwid - 6},${hipY + 18} Z`} fill={top} />
				{!sil && p.kind === 'dad' && (
					<>
						{/* reflective stripes of a work jacket */}
						<rect x={-hwid - 2} y={shY + sp.torso * 0.55} width={hwid * 2 + 4} height={30} fill="#f39a2e" />
						<rect x={-hwid - 2} y={shY + sp.torso * 0.55 + 11} width={hwid * 2 + 4} height={8} fill="#e6e9ec" />
						{!p.back && (
							<>
								<path d={`M -44,${shY} L 0,${shY + 70} L 44,${shY}`} fill="#d9dde2" />
								<path d={`M -30,${shY} L 0,${shY + 52} L 30,${shY}`} fill={sp.skin} />
								<line x1={0} y1={shY + 70} x2={0} y2={hipY + 18} stroke={topDark} strokeWidth={6} />
								<rect x={-sw + 40} y={shY + 80} width={78} height={60} rx={6} fill={topDark} />
								<rect x={sw - 118} y={shY + 80} width={78} height={60} rx={6} fill={topDark} />
							</>
						)}
						<rect x={-hwid - 6} y={hipY - 6} width={hwid * 2 + 12} height={26} fill="#2b2e33" />
					</>
				)}
				{!sil && p.kind === 'son' && (
					<>
						{!p.back ? (
							<>
								<path d={`M -58,${shY - 2} Q 0,${shY + 46} 58,${shY - 2}`} fill={topDark} />
								<line x1={-18} y1={shY + 22} x2={-22} y2={shY + 120} stroke="#f7efe3" strokeWidth={6} strokeLinecap="round" />
								<line x1={18} y1={shY + 22} x2={22} y2={shY + 120} stroke="#f7efe3" strokeWidth={6} strokeLinecap="round" />
								<path d={`M ${-hwid + 30},${hipY - 90} L ${hwid - 30},${hipY - 90} L ${hwid - 16},${hipY - 10} L ${-hwid + 16},${hipY - 10} Z`} fill={topDark} />
								<line x1={-hwid + 40} y1={shY + 60} x2={-hwid + 70} y2={shY + 62} stroke={topDark} strokeWidth={5} />
							</>
						) : (
							<path d={`M -70,${shY - 6} Q 0,${shY + 80} 70,${shY - 6} Z`} fill={topDark} />
						)}
						<rect x={-hwid - 6} y={hipY - 4} width={hwid * 2 + 12} height={22} fill={topDark} />
					</>
				)}
			</g>
		);
	}

	const backpack =
		p.backpack && !sil ? (
			p.back ? (
				<g>
					<rect x={-sw + 20} y={shY - 30} width={sw * 2 - 40} height={sp.torso * 0.88} rx={40} fill="#4d5a3a" />
					<rect x={-sw + 46} y={shY + sp.torso * 0.42} width={sw * 2 - 92} height={sp.torso * 0.36} rx={22} fill="#3f4a30" />
					<rect x={-sw + 70} y={shY - 18} width={sw * 2 - 140} height={22} rx={8} fill="#3f4a30" />
					<rect x={-30} y={shY + sp.torso * 0.5} width={60} height={14} rx={7} fill="#c9b37a" />
				</g>
			) : (
				<g>
					<rect x={-sw - 22} y={shY - 18} width={sw * 2 + 44} height={sp.torso * 0.8} rx={36} fill="#4d5a3a" />
				</g>
			)
		) : null;

	const backpackStraps =
		p.backpack && !sil && !p.back ? (
			<g>
				<rect x={-sw + 26} y={shY - 4} width={26} height={sp.torso * 0.7} rx={8} fill="#3f4a30" />
				<rect x={sw - 52} y={shY - 4} width={26} height={sp.torso * 0.7} rx={8} fill="#3f4a30" />
			</g>
		) : null;

	const stripe = p.kind === 'dad' && !sil ? '#f39a2e' : undefined;
	const armColor = topDark;

	const arms = (
		<>
			<Arm sx={-sw + sp.armW / 2 - 4} sy={shY + sp.armW / 2} side={-1} pose={p.armL} sp={sp} color={armColor} skin={skin} item={p.itemL} stripe={stripe} />
			<Arm sx={sw - sp.armW / 2 + 4} sy={shY + sp.armW / 2} side={1} pose={p.armR} sp={sp} color={armColor} skin={skin} item={p.itemR} stripe={stripe} />
		</>
	);

	const head = (
		<g transform={`translate(0,${headCY}) rotate(${p.headTilt ?? 0})`}>
			<Head kind={p.kind} face={p.face} back={p.back} turn={p.headTurn} silhouette={sil} uid={p.id} />
		</g>
	);

	const body = (
		<g transform={`translate(0,${bob}) scale(${1 - breathe * 0.4},${1 + breathe})`}>
			{p.back ? null : backpack}
			{legs}
			<rect x={-sp.neckW / 2} y={neckTop} width={sp.neckW} height={sp.neck + 20} fill={skin} />
			{torso}
			{p.back ? backpack : null}
			{backpackStraps}
			{head}
			{arms}
		</g>
	);

	return (
		<g transform={`translate(${p.x ?? 0},${p.y ?? 0}) scale(${p.scale ?? 1})`}>
			<Shaded id={p.id} enabled={p.shade !== false && !sil}>
				{body}
			</Shaded>
		</g>
	);
};

// Head-and-shoulders bust for close-ups (head centred at 0,0).
export const Bust: React.FC<{kind: Kind; id: string; face?: Face; x?: number; y?: number; scale?: number; tilt?: number; turn?: number}> = ({
	kind,
	id,
	face,
	x = 0,
	y = 0,
	scale = 1,
	tilt = 0,
	turn = 0,
}) => {
	const sp = SPECS[kind];
	const neckTop = sp.hh * 0.85;
	const shY = neckTop + sp.neck - 10;
	const sw = sp.shoulderW / 2 + 40;
	return (
		<g transform={`translate(${x},${y}) scale(${scale})`}>
			<Shaded id={id}>
				<g>
					<rect x={-sp.neckW / 2} y={neckTop - 30} width={sp.neckW} height={sp.neck + 60} fill={sp.skin} />
					<path d={`M ${-sw - 60},${shY + 600} L ${-sw},${shY + 60} Q ${-sw},${shY} ${-sw + 60},${shY} L ${sw - 60},${shY} Q ${sw},${shY} ${sw},${shY + 60} L ${sw + 60},${shY + 600} Z`} fill={sp.top} />
					{kind === 'son' && (
						<>
							<path d={`M -70,${shY - 2} Q 0,${shY + 60} 70,${shY - 2}`} fill={sp.topDark} />
							<line x1={-22} y1={shY + 30} x2={-26} y2={shY + 150} stroke="#f7efe3" strokeWidth={7} strokeLinecap="round" />
							<line x1={22} y1={shY + 30} x2={26} y2={shY + 150} stroke="#f7efe3" strokeWidth={7} strokeLinecap="round" />
						</>
					)}
					{kind === 'dad' && (
						<>
							<path d={`M -50,${shY} L 0,${shY + 80} L 50,${shY}`} fill="#d9dde2" />
							<path d={`M -34,${shY} L 0,${shY + 58} L 34,${shY}`} fill={sp.skin} />
						</>
					)}
					{kind === 'mom' && <path d={`M -48,${shY} Q 0,${shY + 60} 48,${shY}`} fill={sp.skin} />}
					<g transform={`rotate(${tilt})`}>
						<Head kind={kind} face={face} turn={turn} uid={id} />
					</g>
				</g>
			</Shaded>
		</g>
	);
};
