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
	glasses?: boolean; // the «Голосовые» teen wears glasses unless false; any other kind wears them when true
	bruise?: number; // 0..1 a purple bruise under the viewer-right eye
};

// ku / kf: visible length of the upper arm / forearm (0..1). Values < 1 fake
// foreshortening when the arm points towards the camera (hand to mouth, etc).
export type ArmPose =
	| {shoulder: number; elbow: number; ku?: number; kf?: number}
	| {target: [number, number]; bend?: 1 | -1; ku?: number; kf?: number};

export type Kind = 'dad' | 'mom' | 'son' | 'teen' | 'girl' | 'boy'; // teen = hero of «Голосовые из завтра», girl = hero of «Кнопка 13», boy = hero of «Ты с какого района?» (1976)

export type Colors = Partial<Pick<Spec, 'top' | 'topDark' | 'pants' | 'shoes' | 'hair' | 'skin'>>;

export type PersonProps = {
	kind: Kind;
	id: string;
	colors?: Colors; // outfit / hair overrides (neighbours, extras)
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
	armsBehind?: boolean; // arms drawn behind the body (hands hidden behind the back)
	plain?: boolean; // extras: a plain jacket / dress (no work-jacket stripes, no dress dots or apron); hoodie kinds: a plain jacket (no hood)
	cap?: string; // a flat cap of this colour (the 70s)
	knit?: string; // a knitted «петушок» hat of this colour (white stripe, pompom)
	quilt?: boolean; // a quilted jacket (телогрейка): stitched bands across the torso
	pioneer?: boolean; // a white shirt collar and a red pioneer tie (school uniform)
	// period looks («Что будет, если ты попадёшь в XX век»)
	hat?: {type: 'peak' | 'pilotka' | 'bowler' | 'scarf' | 'kepi' | 'top' | 'chef'; color: string; band?: string}; // фуражка / пилотка / котелок / платок / кепи
	beard?: string; // a full beard (with a moustache) of this colour
	moustache?: string; // just a moustache
	hem?: number; // mom kind: how much of the legs the dress covers (default 0.55; 0.95 = to the ankles)
	apron?: string; // a long apron over the clothes (the baker, the shop assistant)
	boots?: string; // tall boots (сапоги) of this colour over the trousers
	kneePatch?: boolean; // dad kind: the dark knee band of work trousers (default true; false for suits and uniforms)
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
	teen: {
		leg: 370, legW: 60, legGap: 12,
		torso: 320, shoulderW: 220, hipW: 190,
		neck: 38, neckW: 44,
		hw: 76, hh: 96,
		upper: 170, fore: 160, armW: 50, hand: 24,
		top: '#cf4a3c', topDark: '#b13c30', pants: '#2b2d33', shoes: '#e8e6e0', hair: '#1f1a1a', skin: '#e8b48e',
	},
	boy: {
		leg: 336, legW: 64, legGap: 12,
		torso: 304, shoulderW: 220, hipW: 194,
		neck: 32, neckW: 46,
		hw: 84, hh: 94,
		upper: 162, fore: 152, armW: 54, hand: 25,
		top: '#2c3a66', topDark: '#222e52', pants: '#2c3a66', shoes: '#1a1a1e', hair: '#b4542a', skin: '#f6cba8',
	},
	girl: {
		leg: 350, legW: 54, legGap: 16,
		torso: 300, shoulderW: 200, hipW: 186,
		neck: 36, neckW: 40,
		hw: 74, hh: 94,
		upper: 160, fore: 150, armW: 46, hand: 22,
		top: '#21a19a', topDark: '#1a827c', pants: '#3b4f7a', shoes: '#f2f0ea', hair: '#c4632f', skin: '#f2c3a0',
	},
};
export const isHoodie = (k: Kind) => k === 'son' || k === 'teen' || k === 'girl';

// the girl's ponytail (high, falls behind the head to the viewer's right) and her scrunchie
const girlTail = (hw: number, hh: number, hair: string, sil: boolean) => (
	<g>
		<path d={`M ${hw * 0.05},${-hh * 1.02} C ${hw * 1.25},${-hh * 1.32} ${hw * 1.75},${-hh * 0.2} ${hw * 1.28},${hh * 0.95} C ${hw * 1.2},${hh * 0.45} ${hw * 1.0},${-hh * 0.35} ${hw * 0.2},${-hh * 0.62} Z`} fill={hair} />
		{!sil && <ellipse cx={hw * 0.42} cy={-hh * 1.06} rx={hw * 0.2} ry={hh * 0.11} fill="#e04a6a" />}
	</g>
);
// headphones around the neck and the flat key on a red lanyard (y0 = shoulder line)
export const GirlNeck: React.FC<{y0: number; front?: boolean}> = ({y0, front = true}) => (
	<g>
		{front && (
			<g>
				<path d={`M -30,${y0 + 4} L 0,${y0 + 150} L 30,${y0 + 4}`} stroke="#d63b2f" strokeWidth={6} fill="none" strokeLinejoin="round" />
				<g transform={`translate(0,${y0 + 152})`}>
					<circle r={12} fill="none" stroke="#d9c27a" strokeWidth={6} />
					<rect x={-4} y={10} width={8} height={32} fill="#d9c27a" />
					<rect x={4} y={28} width={10} height={6} fill="#d9c27a" />
				</g>
			</g>
		)}
		<path d={`M -38,${y0 - 8} Q 0,${y0 + 30} 38,${y0 - 8}`} stroke="#f4f4f4" strokeWidth={9} fill="none" strokeLinecap="round" />
		{[-1, 1].map((d) => (
			<g key={d} transform={`translate(${d * 46},${y0 - 14}) rotate(${d * -14})`}>
				<rect x={-13} y={-19} width={26} height={38} rx={13} fill="#f4f4f4" stroke="#cfcfcf" strokeWidth={3} />
				<ellipse cx={0} cy={0} rx={6} ry={11} fill="#bfc3c9" />
			</g>
		))}
	</g>
);

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

// the shoulder and elbow angles that a target pose solves to for this kind of person — so a scene can blend an arm
// smoothly from hanging ({shoulder: side · −6, elbow: side · 4}) into a target pose instead of snapping to it
export const armAngles = (kind: Kind, side: -1 | 1, target: [number, number], bend?: 1 | -1) => {
	const sp = SPECS[kind];
	const sw = sp.shoulderW / 2;
	const sx = side < 0 ? -sw + sp.armW / 2 - 4 : sw - sp.armW / 2 + 4;
	const sy = -sp.leg - sp.torso + sp.armW / 2;
	return solveArm({target: [target[0] - sx, target[1] - sy], bend}, sp.upper, sp.fore + sp.armW * 0.56 * 0.8, side);
};

// ---------------------------------------------------------------------------
export const Head: React.FC<{
	kind: Kind;
	face?: Face;
	back?: boolean;
	turn?: number;
	silhouette?: string;
	uid?: string;
	colors?: Colors;
}> = ({kind, face = {}, back, turn = 0, silhouette, uid = 'h', colors}) => {
	const sp = {...SPECS[kind], ...(colors ?? {})};
	const {hw, hh} = sp;
	const skin = silhouette ?? sp.skin;
	const hair = silhouette ?? sp.hair;
	const tx = turn * hw * 0.12;

	const facePath = `M ${-hw},${-hh * 0.15} C ${-hw},${-hh * 1.08} ${hw},${-hh * 1.08} ${hw},${-hh * 0.15} C ${hw},${hh * 0.5} ${hw * 0.5},${hh} 0,${hh} C ${-hw * 0.5},${hh} ${-hw},${hh * 0.5} ${-hw},${-hh * 0.15} Z`;

	const ears = (
		<>
			<ellipse cx={-hw * (kind === 'boy' ? 1.04 : 1.0)} cy={hh * 0.08} rx={hw * (kind === 'boy' ? 0.25 : 0.17)} ry={hh * (kind === 'boy' ? 0.24 : 0.17)} fill={skin} />
			<ellipse cx={hw * (kind === 'boy' ? 1.04 : 1.0)} cy={hh * 0.08} rx={hw * (kind === 'boy' ? 0.25 : 0.17)} ry={hh * (kind === 'boy' ? 0.24 : 0.17)} fill={skin} />
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
	} else if (kind === 'teen') {
		const P = (x: number, y: number) => `${hw * x},${hh * y}`;
		hairFront = (
			<path
				d={`M ${P(-1.04, -0.02)} L ${P(-1.13, -0.6)} L ${P(-0.98, -1.22)} L ${P(-0.66, -0.98)} L ${P(-0.46, -1.42)} L ${P(-0.2, -1.06)} L ${P(0.1, -1.5)} L ${P(0.3, -1.08)} L ${P(0.7, -1.36)} L ${P(0.76, -0.98)} L ${P(1.16, -1.02)} L ${P(1.1, -0.55)} L ${P(1.04, -0.02)} L ${P(0.9, -0.36)} L ${P(0.58, -0.52)} L ${P(0.4, -0.38)} L ${P(0.16, -0.56)} L ${P(-0.16, -0.4)} L ${P(-0.42, -0.58)} L ${P(-0.8, -0.44)} Z`}
				fill={hair}
				stroke={hair}
				strokeWidth={hw * 0.08}
				strokeLinejoin="round"
			/>
		);
	} else if (kind === 'boy') {
		const P = (x: number, y: number) => `${hw * x},${hh * y}`;
		hairFront = (
			<path
				d={`M ${P(-1.1, 0.02)} C ${P(-1.26, -1.36)} ${P(1.26, -1.36)} ${P(1.1, 0.02)} L ${P(0.98, -0.02)} L ${P(0.96, -0.36)} L ${P(0.7, -0.3)} L ${P(0.52, -0.38)} L ${P(0.28, -0.3)} L ${P(0.06, -0.38)} L ${P(-0.18, -0.3)} L ${P(-0.42, -0.38)} L ${P(-0.66, -0.3)} L ${P(-0.96, -0.36)} L ${P(-0.98, -0.02)} Z`}
				fill={hair}
				stroke={hair}
				strokeWidth={hw * 0.05}
				strokeLinejoin="round"
			/>
		);
	} else if (kind === 'girl') {
		hairBack = girlTail(hw, hh, hair, !!silhouette);
		hairFront = (
			<path
				d={`M ${-hw * 1.07},${hh * 0.32} C ${-hw * 1.22},${-hh * 1.28} ${hw * 1.22},${-hh * 1.28} ${hw * 1.07},${hh * 0.32} L ${hw * 0.95},${hh * 0.14} C ${hw * 0.93},${-hh * 0.18} ${hw * 0.8},${-hh * 0.36} ${hw * 0.55},${-hh * 0.4} L ${-hw * 0.55},${-hh * 0.4} C ${-hw * 0.8},${-hh * 0.36} ${-hw * 0.93},${-hh * 0.18} ${-hw * 0.95},${hh * 0.14} Z`}
				fill={hair}
			/>
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
				{kind === 'girl' && <g transform="scale(-1,1)">{girlTail(hw, hh, hair, false)}</g>}
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
				{!!face.bruise && (
					<g opacity={face.bruise}>
						<ellipse cx={ex * 1.05} cy={ey + hh * 0.1} rx={hw * 0.34} ry={hh * 0.24} fill="#8a5a9a" opacity={0.55} />
						<ellipse cx={ex * 1.05} cy={ey + hh * 0.16} rx={hw * 0.24} ry={hh * 0.12} fill="#6a3a7a" opacity={0.45} />
					</g>
				)}
				{eye(-ex)}
				{eye(ex)}
				{((kind === 'teen' && face.glasses !== false) || (kind !== 'teen' && face.glasses === true)) && (
					<g stroke="#1d1d22" strokeWidth={hw * 0.065} fill="none" strokeLinecap="round">
						<circle cx={-ex} cy={ey} r={hw * 0.33} fill="#ffffff" fillOpacity={0.08} />
						<circle cx={ex} cy={ey} r={hw * 0.33} fill="#ffffff" fillOpacity={0.08} />
						<path d={`M ${-ex + hw * 0.31},${ey - hw * 0.08} Q 0,${ey - hw * 0.2} ${ex - hw * 0.31},${ey - hw * 0.08}`} />
						<path d={`M ${-ex - hw * 0.33},${ey - hw * 0.04} L ${-hw * 0.98},${ey - hh * 0.06}`} />
						<path d={`M ${ex + hw * 0.33},${ey - hw * 0.04} L ${hw * 0.98},${ey - hh * 0.06}`} />
						<path d={`M ${-ex + hw * 0.06},${ey - hw * 0.22} q ${hw * 0.12},${-hw * 0.02} ${hw * 0.18},${hw * 0.1}`} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={hw * 0.045} />
						<path d={`M ${ex + hw * 0.06},${ey - hw * 0.22} q ${hw * 0.12},${-hw * 0.02} ${hw * 0.18},${hw * 0.1}`} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={hw * 0.045} />
					</g>
				)}
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
				{kind === 'boy' && !silhouette &&
					[
						[-0.5, 0.22], [-0.38, 0.3], [-0.58, 0.34], [-0.44, 0.16], [0.5, 0.22], [0.38, 0.3], [0.58, 0.34], [0.44, 0.16], [-0.08, 0.12], [0.08, 0.14],
					].map(([fx, fy], i) => <circle key={`fr${i}`} cx={hw * fx} cy={hh * fy} r={hw * 0.035} fill="#c77a4a" opacity={0.7} />)}
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

// a flat cap (кепка) over the hair; the visor points at the camera (no visor from behind)
export const Cap: React.FC<{hw: number; hh: number; color: string; back?: boolean; turn?: number}> = ({hw, hh, color, back, turn = 0}) => {
	const tx = turn * hw * 0.12;
	return (
		<g>
			<path d={`M ${-hw * 1.1},${-hh * 0.3} C ${-hw * 1.16},${-hh * 1.3} ${hw * 1.16},${-hh * 1.3} ${hw * 1.1},${-hh * 0.3} Q 0,${-hh * 0.42} ${-hw * 1.1},${-hh * 0.3} Z`} fill={color} />
			<path d={`M ${-hw * 1.1},${-hh * 0.3} Q 0,${-hh * 0.42} ${hw * 1.1},${-hh * 0.3}`} stroke="rgba(0,0,0,0.35)" strokeWidth={hw * 0.08} fill="none" />
			{!back && <ellipse cx={tx} cy={-hh * 0.3} rx={hw * 0.95} ry={hh * 0.13} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={hw * 0.05} />}
			<circle cx={0} cy={-hh * 1.02} r={hw * 0.09} fill="rgba(0,0,0,0.3)" />
		</g>
	);
};

// a beard / a moustache (head coords; drawn over the face, the mouth stays visible between them)
export const Whiskers: React.FC<{hw: number; hh: number; color: string; full: boolean; turn?: number}> = ({hw, hh, color, full, turn = 0}) => {
	const tx = turn * hw * 0.12;
	return (
		<g>
			{full && (
				<path
					d={`M ${-hw * 0.94},${hh * 0.1} C ${-hw * 0.98},${hh * 1.25} ${-hw * 0.35},${hh * 1.55} 0,${hh * 1.55} C ${hw * 0.35},${hh * 1.55} ${hw * 0.98},${hh * 1.25} ${hw * 0.94},${hh * 0.1} C ${hw * 0.8},${hh * 0.62} ${hw * 0.5},${hh * 0.76} ${tx},${hh * 0.76} C ${-hw * 0.5},${hh * 0.76} ${-hw * 0.8},${hh * 0.62} ${-hw * 0.94},${hh * 0.1} Z`}
					fill={color}
				/>
			)}
			<path
				d={`M ${tx - hw * 0.5},${hh * 0.54} Q ${tx - hw * 0.22},${hh * 0.34} ${tx},${hh * 0.44} Q ${tx + hw * 0.22},${hh * 0.34} ${tx + hw * 0.5},${hh * 0.54} Q ${tx + hw * 0.22},${hh * 0.5} ${tx},${hh * 0.52} Q ${tx - hw * 0.22},${hh * 0.5} ${tx - hw * 0.5},${hh * 0.54} Z`}
				fill={color}
			/>
		</g>
	);
};

// period hats: фуражка (a peaked cap with a band), пилотка (a side cap with a star), котелок (a bowler), платок (a
// headscarf tied under the chin), кепи (a tall peaked cap of the gendarmes / the city police of 1901)
export const PeriodHat: React.FC<{hw: number; hh: number; type: 'peak' | 'pilotka' | 'bowler' | 'scarf' | 'kepi' | 'top' | 'chef'; color: string; band?: string; back?: boolean; turn?: number}> = ({hw, hh, type, color, band, back, turn = 0}) => {
	const tx = turn * hw * 0.12;
	if (type === 'scarf') {
		const outer = `M ${-hw * 1.2},${hh * 0.45} C ${-hw * 1.34},${-hh * 1.42} ${hw * 1.34},${-hh * 1.42} ${hw * 1.2},${hh * 0.45} C ${hw * 1.0},${hh * 0.95} ${hw * 0.5},${hh * 1.16} 0,${hh * 1.18} C ${-hw * 0.5},${hh * 1.16} ${-hw * 1.0},${hh * 0.95} ${-hw * 1.2},${hh * 0.45} Z`;
		const inner = `M ${-hw * 0.96},${hh * 0.12} C ${-hw * 0.98},${-hh * 0.78} ${hw * 0.98},${-hh * 0.78} ${hw * 0.96},${hh * 0.12} C ${hw * 0.95},${hh * 0.6} ${hw * 0.5},${hh * 1.0} 0,${hh * 1.0} C ${-hw * 0.5},${hh * 1.0} ${-hw * 0.95},${hh * 0.6} ${-hw * 0.96},${hh * 0.12} Z`;
		return (
			<g>
				<path d={back ? `M ${-hw * 1.2},${hh * 0.6} C ${-hw * 1.34},${-hh * 1.42} ${hw * 1.34},${-hh * 1.42} ${hw * 1.2},${hh * 0.6} L 0,${hh * 1.3} Z` : `${outer} ${inner}`} fill={color} fillRule="evenodd" />
				{band && !back && (
					<path d={`M ${-hw * 0.98},${-hh * 0.22} C ${-hw * 0.9},${-hh * 0.95} ${hw * 0.9},${-hh * 0.95} ${hw * 0.98},${-hh * 0.22}`} stroke={band} strokeWidth={hw * 0.1} fill="none" strokeDasharray={`${hw * 0.12} ${hw * 0.14}`} />
				)}
				{!back && (
					<g>
						<ellipse cx={0} cy={hh * 1.16} rx={hw * 0.18} ry={hh * 0.1} fill={color} />
						<path d={`M ${-hw * 0.06},${hh * 1.2} L ${-hw * 0.28},${hh * 1.55} L ${-hw * 0.06},${hh * 1.5} Z M ${hw * 0.06},${hh * 1.2} L ${hw * 0.3},${hh * 1.52} L ${hw * 0.08},${hh * 1.5} Z`} fill={color} />
						<path d={`M ${-hw * 0.96},${hh * 0.12} C ${-hw * 0.98},${-hh * 0.78} ${hw * 0.98},${-hh * 0.78} ${hw * 0.96},${hh * 0.12}`} stroke="rgba(0,0,0,0.25)" strokeWidth={hw * 0.05} fill="none" />
					</g>
				)}
			</g>
		);
	}
	if (type === 'pilotka') {
		return (
			<g>
				<path d={`M ${-hw * 0.95},${-hh * 0.58} L ${-hw * 0.72},${-hh * 1.16} Q 0,${-hh * 1.36} ${hw * 0.72},${-hh * 1.16} L ${hw * 0.95},${-hh * 0.58} Q 0,${-hh * 0.74} ${-hw * 0.95},${-hh * 0.58} Z`} fill={color} />
				<path d={`M ${-hw * 0.95},${-hh * 0.58} Q 0,${-hh * 0.74} ${hw * 0.95},${-hh * 0.58} L ${hw * 0.9},${-hh * 0.76} Q 0,${-hh * 0.9} ${-hw * 0.9},${-hh * 0.76} Z`} fill="#000" opacity={0.18} />
				{!back && <path d={starPath(tx, -hh * 0.86, hw * 0.13)} fill={band ?? '#d8261e'} />}
			</g>
		);
	}
	if (type === 'top') {
		// a top hat (цилиндр): a brim, a tall crown, a band
		return (
			<g>
				<path d={`M ${-hw * 0.84},${-hh * 0.64} L ${-hw * 0.9},${-hh * 2.02} Q 0,${-hh * 2.1} ${hw * 0.9},${-hh * 2.02} L ${hw * 0.84},${-hh * 0.64} Z`} fill={color} />
				<path d={`M ${-hw * 0.85},${-hh * 0.7} L ${hw * 0.85},${-hh * 0.7} L ${hw * 0.86},${-hh * 0.94} L ${-hw * 0.86},${-hh * 0.94} Z`} fill={band ?? '#5a1a1e'} />
				<ellipse cx={0} cy={-hh * 0.62} rx={hw * 1.36} ry={hh * 0.14} fill={color} />
				<path d={`M ${-hw * 0.55},${-hh * 1.9} L ${-hw * 0.5},${-hh * 1.05}`} stroke="#fff" strokeOpacity={0.16} strokeWidth={hw * 0.12} strokeLinecap="round" />
			</g>
		);
	}
	if (type === 'chef') {
		// a chef's toque: a white band and a puffed top
		return (
			<g>
				{[-0.5, 0.06, 0.56].map((k, i) => (
					<circle key={i} cx={hw * k} cy={-hh * (1.38 + (i === 1 ? 0.14 : 0))} r={hw * 0.6} fill={color} />
				))}
				<path d={`M ${-hw * 0.98},${-hh * 0.52} L ${-hw * 0.92},${-hh * 1.08} L ${hw * 0.92},${-hh * 1.08} L ${hw * 0.98},${-hh * 0.52} Z`} fill={color} />
				<path d={`M ${-hw * 0.98},${-hh * 0.52} L ${hw * 0.98},${-hh * 0.52} L ${hw * 0.97},${-hh * 0.64} L ${-hw * 0.97},${-hh * 0.64} Z`} fill="#000" opacity={0.08} />
				{[-0.4, 0.05, 0.5].map((k, i) => (
					<path key={i} d={`M ${hw * k},${-hh * 1.08} Q ${hw * (k + 0.06)},${-hh * 1.3} ${hw * (k - 0.02)},${-hh * 1.52}`} stroke="#000" strokeOpacity={0.08} strokeWidth={hw * 0.05} fill="none" />
				))}
			</g>
		);
	}
	if (type === 'bowler') {
		return (
			<g>
				<ellipse cx={0} cy={-hh * 0.62} rx={hw * 1.3} ry={hh * 0.13} fill={color} />
				<path d={`M ${-hw * 0.92},${-hh * 0.64} C ${-hw * 1.0},${-hh * 1.62} ${hw * 1.0},${-hh * 1.62} ${hw * 0.92},${-hh * 0.64} Z`} fill={color} />
				<path d={`M ${-hw * 0.93},${-hh * 0.72} Q 0,${-hh * 0.82} ${hw * 0.93},${-hh * 0.72} L ${hw * 0.93},${-hh * 0.84} Q 0,${-hh * 0.94} ${-hw * 0.93},${-hh * 0.84} Z`} fill={band ?? '#000'} opacity={band ? 1 : 0.35} />
				<path d={`M ${-hw * 0.5},${-hh * 1.3} Q ${-hw * 0.2},${-hh * 1.42} ${hw * 0.1},${-hh * 1.38}`} stroke="#fff" strokeOpacity={0.18} strokeWidth={hw * 0.08} fill="none" strokeLinecap="round" />
			</g>
		);
	}
	// peak / kepi: a crown, a coloured band and (from the front) a black visor and a badge
	const tall = type === 'kepi' ? 1.2 : 1;
	return (
		<g>
			{type === 'peak' ? (
				<path d={`M ${-hw * 1.02},${-hh * 0.56} L ${-hw * 1.2},${-hh * 1.02} Q 0,${-hh * 1.36} ${hw * 1.2},${-hh * 1.02} L ${hw * 1.02},${-hh * 0.56} Z`} fill={color} />
			) : (
				<path d={`M ${-hw * 0.98},${-hh * 0.5} L ${-hw * 0.9},${-hh * 1.18 * tall} Q 0,${-hh * 1.3 * tall} ${hw * 0.9},${-hh * 1.18 * tall} L ${hw * 0.98},${-hh * 0.5} Z`} fill={color} />
			)}
			<path d={`M ${-hw * 1.02},${-hh * 0.48} L ${hw * 1.02},${-hh * 0.48} L ${hw * 1.0},${-hh * 0.72} L ${-hw * 1.0},${-hh * 0.72} Z`} fill={band ?? '#b8202a'} />
			{!back && (
				<>
					<path d={`M ${tx - hw * 0.95},${-hh * 0.5} Q ${tx},${-hh * 0.28} ${tx + hw * 0.95},${-hh * 0.5} Q ${tx},${-hh * 0.38} ${tx - hw * 0.95},${-hh * 0.5} Z`} fill="#15161a" />
					<ellipse cx={tx} cy={-hh * 0.62} rx={hw * 0.13} ry={hh * 0.1} fill="#e8c24a" />
				</>
			)}
		</g>
	);
};
const starPath = (cx: number, cy: number, r: number) =>
	Array.from({length: 10})
		.map((_, k) => {
			const a = -Math.PI / 2 + (k * Math.PI) / 5;
			const rr = k % 2 === 0 ? r : r * 0.42;
			return `${k === 0 ? 'M' : 'L'} ${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
		})
		.join(' ') + ' Z';

// a knitted «петушок» hat (the 70s): a pointed dome with a white stripe, a ribbed cuff and a pompom (head coords)
export const KnitHat: React.FC<{hw: number; hh: number; color: string}> = ({hw, hh, color}) => (
	<g>
		<path d={`M ${-hw * 1.1},${-hh * 0.3} C ${-hw * 1.16},${-hh * 1.2} ${-hw * 0.4},${-hh * 1.5} ${hw * 0.3},${-hh * 1.66} C ${hw * 0.86},${-hh * 1.36} ${hw * 1.16},${-hh * 0.95} ${hw * 1.1},${-hh * 0.3} Z`} fill={color} />
		<path d={`M ${-hw * 1.13},${-hh * 0.74} Q 0,${-hh * 0.94} ${hw * 1.13},${-hh * 0.74} L ${hw * 1.12},${-hh * 0.6} Q 0,${-hh * 0.8} ${-hw * 1.12},${-hh * 0.6} Z`} fill="#f4f0e8" />
		<path d={`M ${-hw * 1.16},${-hh * 0.46} Q 0,${-hh * 0.62} ${hw * 1.16},${-hh * 0.46} L ${hw * 1.13},${-hh * 0.2} Q 0,${-hh * 0.36} ${-hw * 1.13},${-hh * 0.2} Z`} fill={color} />
		<path d={`M ${-hw * 1.16},${-hh * 0.46} Q 0,${-hh * 0.62} ${hw * 1.16},${-hh * 0.46} L ${hw * 1.13},${-hh * 0.2} Q 0,${-hh * 0.36} ${-hw * 1.13},${-hh * 0.2} Z`} fill="#000" opacity={0.18} />
		{Array.from({length: 9}).map((_, k) => (
			<line key={k} x1={-hw + k * hw * 0.25} y1={-hh * 0.5} x2={-hw + k * hw * 0.25} y2={-hh * 0.26} stroke="#000" strokeOpacity={0.15} strokeWidth={hw * 0.05} />
		))}
		<circle cx={hw * 0.34} cy={-hh * 1.66} r={hw * 0.24} fill="#f4f0e8" />
	</g>
);

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
// Hand in the reference style: a plain skin-coloured oval, no fingers, no outline.
// Local coords: wrist at (0,0), the hand extends to +y.
export const Hand: React.FC<{r: number; skin: string; grip?: boolean; thumb?: -1 | 1; line?: string}> = ({r, skin}) => (
	<ellipse cx={0} cy={r * 0.95} rx={r * 0.98} ry={r * 1.1} fill={skin} />
);

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
	sil?: boolean;
}> = ({sx, sy, side, pose, sp, color, skin, item, stripe, sil}) => {
	const r = sp.armW * 0.56;
	const ku = pose?.ku ?? 1;
	const kf = pose?.kf ?? 1;
	const upper = sp.upper * ku;
	const fore = sp.fore * kf;
	const gripY = fore + r * 0.8;
	const target =
		pose && 'target' in pose ? {target: [pose.target[0] - sx, pose.target[1] - sy] as [number, number], bend: pose.bend} : pose;
	const {shoulder, elbow} = solveArm(target, upper, gripY, side);
	const w = sp.armW;
	return (
		<g transform={`translate(${sx},${sy}) rotate(${shoulder})`}>
			<rect x={-w / 2} y={-w / 2} width={w} height={upper + w / 2} rx={w / 2} fill={color} />
			<g transform={`translate(0,${upper}) rotate(${elbow})`}>
				<circle cx={0} cy={0} r={w / 2} fill={color} />
				<path d={`M ${-w / 2},0 L ${w / 2},0 L ${w * 0.44},${Math.max(4, fore - 4)} L ${-w * 0.44},${Math.max(4, fore - 4)} Z`} fill={color} />
				{stripe && kf > 0.6 && <rect x={-w * 0.47} y={fore * 0.45} width={w * 0.94} height={w * 0.26} fill={stripe} />}
				{item && <g transform={`translate(0,${gripY})`}>{item}</g>}
				<g transform={`translate(0,${fore - 10})`}>
					<Hand r={r} skin={skin} />
				</g>
			</g>
		</g>
	);
};

// ---------------------------------------------------------------------------
export const Person: React.FC<PersonProps> = (p) => {
	const sp = {...SPECS[p.kind], ...(p.colors ?? {})};
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
						{p.kind === 'dad' && !sil && !p.boots && p.kneePatch !== false && <rect x={-sp.legW / 2} y={sp.leg * 0.48} width={sp.legW} height={50} rx={10} fill="#3a3d42" />}
						{p.boots && p.kind !== 'mom' && <path d={`M ${-sp.legW / 2 - 4},${sp.leg * 0.5} L ${sp.legW / 2 + 4},${sp.leg * 0.5} L ${sp.legW / 2 + 1},${sp.leg - 20} L ${-sp.legW / 2 - 1},${sp.leg - 20} Z`} fill={sil ?? p.boots} />}
						<rect x={-sp.legW / 2 - (p.back ? 4 : 10)} y={sp.leg - 34} width={sp.legW + 20} height={36} rx={14} fill={p.boots && p.kind !== 'mom' ? sil ?? p.boots : shoes} />
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
		const hem = hipY + sp.leg * (p.hem ?? 0.55);
		torso = (
			<g>
				<path d={`M ${-sw},${shY + 18} Q ${-sw},${shY} ${-sw + 20},${shY} L ${sw - 20},${shY} Q ${sw},${shY} ${sw},${shY + 18} L ${sw + 30},${hem} L ${-sw - 30},${hem} Z`} fill={top} />
				{!sil && (
					<>
						{!p.plain && Array.from({length: 22}).map((_, i) => {
							const px = ((i * 73) % (sw * 2 + 40)) - sw - 20;
							const py = shY + 60 + ((i * 137) % (hem - shY - 80));
							return <circle key={i} cx={px} cy={py} r={7} fill="#cfdcec" opacity={0.85} />;
						})}
						{!p.back && !p.plain && (
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
				{!sil && p.quilt && Array.from({length: 6}).map((_, k) => <rect key={`q${k}`} x={-sw + 6} y={shY + 40 + k * ((sp.torso - 50) / 6)} width={sw * 2 - 12} height={5} fill={topDark} opacity={0.8} />)}
				{!sil && p.quilt && !p.back && <line x1={0} y1={shY + 10} x2={0} y2={hipY + 16} stroke={topDark} strokeWidth={6} />}
				{!sil && p.kind === 'dad' && p.plain && !p.back && <path d={`M -34,${shY} L 0,${shY + 58} L 34,${shY}`} fill={sp.skin} />}
				{!sil && p.kind === 'dad' && !p.plain && (
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
				{!sil && isHoodie(p.kind) && !p.plain && (
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

	const [bpMain, bpDark, bpBuckle] = p.kind === 'teen' ? ['#33363d', '#24262b', '#9aa0aa'] : ['#4d5a3a', '#3f4a30', '#c9b37a'];
	const backpack =
		p.backpack && !sil ? (
			p.back ? (
				<g>
					<rect x={-sw + 20} y={shY - 30} width={sw * 2 - 40} height={sp.torso * 0.88} rx={40} fill={bpMain} />
					<rect x={-sw + 46} y={shY + sp.torso * 0.42} width={sw * 2 - 92} height={sp.torso * 0.36} rx={22} fill={bpDark} />
					<rect x={-sw + 70} y={shY - 18} width={sw * 2 - 140} height={22} rx={8} fill={bpDark} />
					<rect x={-30} y={shY + sp.torso * 0.5} width={60} height={14} rx={7} fill={bpBuckle} />
				</g>
			) : (
				<g>
					<rect x={-sw - 22} y={shY - 18} width={sw * 2 + 44} height={sp.torso * 0.8} rx={36} fill={bpMain} />
				</g>
			)
		) : null;

	const backpackStraps =
		p.backpack && !sil && !p.back ? (
			<g>
				<rect x={-sw + 26} y={shY - 4} width={26} height={sp.torso * 0.7} rx={8} fill={bpDark} />
				<rect x={sw - 52} y={shY - 4} width={26} height={sp.torso * 0.7} rx={8} fill={bpDark} />
			</g>
		) : null;

	const stripe = p.kind === 'dad' && !sil && !p.plain ? '#f39a2e' : undefined;
	const armColor = topDark;

	const arms = (
		<>
			<Arm sx={-sw + sp.armW / 2 - 4} sy={shY + sp.armW / 2} side={-1} pose={p.armL} sp={sp} color={armColor} skin={skin} item={p.itemL} stripe={stripe} sil={!!sil} />
			<Arm sx={sw - sp.armW / 2 + 4} sy={shY + sp.armW / 2} side={1} pose={p.armR} sp={sp} color={armColor} skin={skin} item={p.itemR} stripe={stripe} sil={!!sil} />
		</>
	);

	const head = (
		<g transform={`translate(0,${headCY}) rotate(${p.headTilt ?? 0})`}>
			<Head kind={p.kind} face={p.face} back={p.back} turn={p.headTurn} silhouette={sil} uid={p.id} colors={p.colors} />
			{!p.back && !sil && (p.beard || p.moustache) && <Whiskers hw={sp.hw} hh={sp.hh} color={(p.beard ?? p.moustache) as string} full={!!p.beard} turn={p.headTurn ?? 0} />}
			{p.cap && <Cap hw={sp.hw} hh={sp.hh} color={sil ?? p.cap} back={p.back} turn={p.headTurn ?? 0} />}
			{p.knit && <KnitHat hw={sp.hw} hh={sp.hh} color={sil ?? p.knit} />}
			{p.hat && <PeriodHat hw={sp.hw} hh={sp.hh} type={p.hat.type} color={sil ?? p.hat.color} band={sil ?? p.hat.band} back={p.back} turn={p.headTurn ?? 0} />}
		</g>
	);
	const apron =
		p.apron && !p.back ? (
			<path d={`M ${-sw * 0.62},${shY + 70} Q 0,${shY + 50} ${sw * 0.62},${shY + 70} L ${hwid + 4},${hipY + sp.leg * 0.5} L ${-hwid - 4},${hipY + sp.leg * 0.5} Z`} fill={sil ?? p.apron} />
		) : null;

	const pioneerTie =
		p.pioneer && !sil && !p.back ? (
			<g>
				<path d={`M -46,${shY - 4} L -6,${shY + 26} L -40,${shY + 40} Z`} fill="#f4f2ec" />
				<path d={`M 46,${shY - 4} L 6,${shY + 26} L 40,${shY + 40} Z`} fill="#f4f2ec" />
				<path d={`M -14,${shY + 18} L 14,${shY + 18} L 10,${shY + 34} L -10,${shY + 34} Z`} fill="#c8102e" />
				<path d={`M -8,${shY + 32} L -30,${shY + 120} L -14,${shY + 124} L 0,${shY + 40} Z`} fill="#d81e2c" />
				<path d={`M 8,${shY + 32} L 26,${shY + 112} L 12,${shY + 118} L 0,${shY + 40} Z`} fill="#b70e1e" />
			</g>
		) : null;

	const body = (
		<g transform={`translate(0,${bob}) scale(${1 - breathe * 0.4},${1 + breathe})`}>
			{p.back ? null : backpack}
			{p.armsBehind ? arms : null}
			{legs}
			<rect x={-sp.neckW / 2} y={neckTop} width={sp.neckW} height={sp.neck + 20} fill={skin} />
			{torso}
			{p.back ? backpack : null}
			{backpackStraps}
			{p.kind === 'girl' && !sil && !p.plain && <GirlNeck y0={shY} front={!p.back} />}
			{pioneerTie}
			{apron}
			{head}
			{p.armsBehind ? null : arms}
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
export const Bust: React.FC<{kind: Kind; id: string; face?: Face; x?: number; y?: number; scale?: number; tilt?: number; turn?: number; colors?: Colors; plain?: boolean}> = ({
	kind,
	id,
	face,
	x = 0,
	y = 0,
	scale = 1,
	tilt = 0,
	turn = 0,
	colors,
	plain = false,
}) => {
	const sp = {...SPECS[kind], ...(colors ?? {})};
	const neckTop = sp.hh * 0.85;
	const shY = neckTop + sp.neck - 10;
	const sw = sp.shoulderW / 2 + 40;
	return (
		<g transform={`translate(${x},${y}) scale(${scale})`}>
			<Shaded id={id}>
				<g>
					<rect x={-sp.neckW / 2} y={neckTop - 30} width={sp.neckW} height={sp.neck + 60} fill={sp.skin} />
					<path d={`M ${-sw - 60},${shY + 600} L ${-sw},${shY + 60} Q ${-sw},${shY} ${-sw + 60},${shY} L ${sw - 60},${shY} Q ${sw},${shY} ${sw},${shY + 60} L ${sw + 60},${shY + 600} Z`} fill={sp.top} />
					{/* plain: a jacket with lapels over a light sweater instead of the hoodie */}
					{isHoodie(kind) && plain && (
						<>
							<path d={`M -44,${shY - 2} L 0,${shY + 76} L 44,${shY - 2} Z`} fill="#d9d2c0" />
							<path d={`M -58,${shY - 6} L -6,${shY + 130} L -34,${shY + 168} L -100,${shY + 14} Z`} fill={sp.topDark} />
							<path d={`M 58,${shY - 6} L 6,${shY + 130} L 34,${shY + 168} L 100,${shY + 14} Z`} fill={sp.topDark} />
						</>
					)}
					{isHoodie(kind) && !plain && (
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
					{kind === 'girl' && <GirlNeck y0={shY} />}
					<g transform={`rotate(${tilt})`}>
						<Head kind={kind} face={face} turn={turn} uid={id} colors={colors} />
					</g>
				</g>
			</Shaded>
		</g>
	);
};
