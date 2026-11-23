// Чоби — the channel's host (the channel is called «Чоби» too): a small, cute skeleton teacher. A big round head, a
// short body, big shiny eyes behind round glasses, pink cheeks, a red bow tie and an oversized mortarboard.
// Feet at (x, y); about 750 units tall at s = 1 (the head centre at y − 560·s). Flat shading like the other
// characters: the viewer-right half of every bone a shade darker.
//   jaw    0…1  the mouth opens (talking: drive it from the voice envelope)
//   look   [-1…1, -1…1] where the pupils look;  blink 0…1;  tilt — the head tilt in degrees
//   armR / armL  a named pose — 'pointer' | 'wave' | 'point' (a finger up) | 'down' | 'hip' — or an exact arm:
//          {el, ha, hang?, fist?, finger?, curl?, item?, itemAng?} in his own units (shoulders at (±62, −380))
//   pointerAng — where the pointer points (degrees from straight up, outwards)
//   bust   draw only from the pelvis up;  shiver 0…1 (with f) — trembling and chattering teeth;  cold 0…1 — blue cheeks
//   capTilt — the mortarboard's own tilt; cap: false — no mortarboard; capAt [dx, dy, rot] — the cap away from the head
//   heart  {beat 0…1, size} — a red heart inside the ribcage (heartOver: drawn over the ribs, to show it);  brain 0…1 — a pink brain glowing in the skull
//   vessels {warm 0…1 (blue → red), reach 0…1 (how far into the arms and legs)}
//   chest  1… the ribcage breathes in;  frost 0…1 — hoarfrost, icicles, frosted glasses;  sweat 0…1 (with f)
//   handFrost 0…1 — only the fingers freeze, glassFrost 0…1 — only the glasses frost over (both default to frost)
//   scarf  a striped scarf;  mittens — red mittens on the hands;  inner / outer — extra drawing in his own units
//          (inner: inside the ribcage, behind the ribs; outer: on top of everything)
// For other characters of the same family (his brother Гога, src/components/Goga.tsx): glasses / tie: false — no glasses,
//   no bow tie; hat — drawn instead of the mortarboard; face — extra drawing on the face (brows, freckles…); torso —
//   clothes over the bones, under the arms; shoe(side) — drawn instead of a bony foot (it goes with the foot); behind —
//   drawn behind everything; cloak — over the arms (sleeves); cheek — the colour of the cheeks. All in his own units; hat and face turn with the head.
//   walk — the walk phase in radians (the feet step, the hanging arms swing, he bobs); back — seen from behind (no face).
import React from 'react';

export const BONE = '#f3eee2';
export const BONE_SH = '#e3dbca';
export const BONE_D = '#bdb29c';
const INK = '#1d2024';

const mixHex = (a: string, b: string, t: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
};

export type Pose = 'pointer' | 'wave' | 'point' | 'down' | 'hip';
// front: the arm is drawn over the head (a hand over the eyes, on the cap, at the mouth)
export type ArmSpec = {el: [number, number]; ha: [number, number]; hang?: number; fist?: boolean; finger?: boolean; curl?: number; item?: React.ReactNode; itemAng?: number; front?: boolean};

const Bone: React.FC<{a: [number, number]; b: [number, number]; w?: number}> = ({a, b, w = 20}) => (
	<g>
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE_D} strokeWidth={w + 8} strokeLinecap="round" />
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
		{[a, b].map(([cx, cy], k) => (
			<circle key={k} cx={cx} cy={cy} r={w * 0.78} fill={BONE} stroke={BONE_D} strokeWidth={4} />
		))}
	</g>
);

// a small rounded bony hand pointing along `ang` (degrees, 0 = down): a palm and three stubby fingers (curl 0…1 bends them)
const Hand: React.FC<{at: [number, number]; ang?: number; fist?: boolean; finger?: boolean; curl?: number; mitten?: boolean; frost?: number}> = ({at, ang = 0, fist = false, finger = false, curl = 0, mitten = false, frost = 0}) => {
	if (mitten)
		return (
			<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
				<rect x={-21} y={-14} width={42} height={46} rx={18} fill="#d23436" stroke="#9a1e20" strokeWidth={4} />
				<rect x={-27} y={-6} width={14} height={24} rx={7} fill="#d23436" stroke="#9a1e20" strokeWidth={4} transform="rotate(-25 -20 6)" />
				<rect x={-21} y={-16} width={42} height={10} rx={5} fill="#fff" />
			</g>
		);
	const len = finger ? 16 : 30 - curl * 16;
	const bend = curl * 10;
	const fc = frost > 0 ? mixHex(BONE, '#cfe6ff', frost) : BONE;
	return (
		<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
			{!fist &&
				[-9, 0, 9].map((fx, k) => (
					<g key={k}>
						<path d={`M ${fx},8 Q ${fx * 1.15},${8 + len * 0.6} ${fx * 1.15 + bend},${8 + len}`} stroke={BONE_D} strokeWidth={12} strokeLinecap="round" fill="none" />
						<path d={`M ${fx},8 Q ${fx * 1.15},${8 + len * 0.6} ${fx * 1.15 + bend},${8 + len}`} stroke={fc} strokeWidth={7} strokeLinecap="round" fill="none" />
						{frost > 0.3 && <circle cx={fx * 1.15 + bend} cy={8 + len + 6} r={4 * frost} fill="#e8f6ff" />}
					</g>
				))}
			{finger && (
				<g>
					<line x1={-10} y1={8} x2={-12} y2={44} stroke={BONE_D} strokeWidth={12} strokeLinecap="round" />
					<line x1={-10} y1={8} x2={-12} y2={44} stroke={BONE} strokeWidth={7} strokeLinecap="round" />
				</g>
			)}
			<ellipse cx={0} cy={0} rx={18} ry={16} fill={fc} stroke={BONE_D} strokeWidth={4} />
		</g>
	);
};

const Pointer: React.FC<{at: [number, number]; ang: number; len?: number}> = ({at, ang, len = 260}) => (
	<g transform={`translate(${at[0]},${at[1]}) rotate(${ang})`}>
		<line x1={0} y1={24} x2={0} y2={-len} stroke="#7a5434" strokeWidth={10} strokeLinecap="round" />
		<line x1={0} y1={-len + 32} x2={0} y2={-len} stroke="#f4f1ea" strokeWidth={10} strokeLinecap="round" />
	</g>
);

export const Mortarboard: React.FC<{tassel?: number}> = ({tassel = 0}) => (
	<g>
		<path d="M -176,-690 L 0,-748 L 176,-690 L 0,-636 Z" fill="#1d1d24" />
		<path d="M 0,-748 L 176,-690 L 0,-636 Z" fill="#15151b" />
		<path d="M -96,-688 L 96,-688 L 92,-652 Q 0,-636 -92,-652 Z" fill="#26262e" />
		<path d={`M 0,-690 L 128,-676 L ${134 + tassel * 10},-596`} stroke="#f2c230" strokeWidth={6} fill="none" strokeLinecap="round" />
		<circle cx={134 + tassel * 10} cy={-590} r={12} fill="#f2c230" />
	</g>
);

// a named pose as an exact arm (the pointer pose carries the pointer as its item)
export const armPose = (side: 1 | -1, pose: Pose | ArmSpec, f = 0, pointerAng = 30): ArmSpec => {
	if (typeof pose === 'object') return pose;
	if (pose === 'pointer') {
		const a = (pointerAng * Math.PI) / 180;
		return {el: [side * 118, -330], ha: [side * (128 + 40 * Math.sin(a)), -330 - 80 * Math.cos(a)], hang: side * 200, fist: true, item: <Pointer at={[side * 4, -8]} ang={side * pointerAng} />};
	}
	if (pose === 'wave') return {el: [side * 118, -350], ha: [side * 132, -440], hang: side * 190 + Math.sin(f / 5) * 14};
	if (pose === 'point') return {el: [side * 112, -330], ha: [side * 116, -420], hang: 180, finger: true};
	if (pose === 'hip') return {el: [side * 108, -300], ha: [side * 58, -232], hang: side * -60, fist: true};
	return {el: [side * 86, -300], ha: [side * 90, -226]};
};
// a smooth move from one arm to another (t 0…1): the joints glide, the hand turns the short way round, an item in the
// hand shrinks away and the new one grows in
export const mixArm = (a: ArmSpec, b: ArmSpec, t: number): ArmSpec => {
	if (t <= 0) return a;
	if (t >= 1) return b;
	const L = (p: number, q: number) => p + (q - p) * t;
	const h0 = a.hang ?? 0;
	let dh = (b.hang ?? 0) - h0;
	dh = ((((dh + 180) % 360) + 360) % 360) - 180;
	const first = t < 0.5;
	const k = first ? 1 - 2 * t : 2 * t - 1;
	const it = first ? a.item : b.item;
	return {
		el: [L(a.el[0], b.el[0]), L(a.el[1], b.el[1])],
		ha: [L(a.ha[0], b.ha[0]), L(a.ha[1], b.ha[1])],
		hang: h0 + dh * t,
		curl: L(a.curl ?? 0, b.curl ?? 0),
		fist: first ? a.fist : b.fist,
		finger: first ? a.finger : b.finger,
		front: a.front || b.front,
		item: it ? <g transform={`scale(${k})`}>{it}</g> : undefined,
		itemAng: first ? a.itemAng : b.itemAng,
	};
};

export const Choby: React.FC<{
	x: number;
	y: number;
	s?: number;
	jaw?: number;
	look?: [number, number];
	blink?: number;
	tilt?: number;
	armR?: Pose | ArmSpec;
	armL?: Pose | ArmSpec;
	pointerAng?: number;
	bust?: boolean;
	blush?: boolean;
	shiver?: number;
	f?: number;
	capTilt?: number;
	cold?: number;
	cap?: boolean;
	capAt?: [number, number, number];
	heart?: {beat: number; size?: number};
	heartOver?: boolean;
	brain?: number;
	vessels?: {warm: number; reach: number};
	chest?: number;
	frost?: number;
	handFrost?: number;
	glassFrost?: number;
	sweat?: number;
	scarf?: boolean;
	mittens?: boolean;
	inner?: React.ReactNode;
	outer?: React.ReactNode;
	glasses?: boolean;
	tie?: boolean;
	hat?: React.ReactNode;
	face?: React.ReactNode;
	torso?: React.ReactNode;
	shoe?: (side: 1 | -1) => React.ReactNode;
	behind?: React.ReactNode;
	cloak?: React.ReactNode;
	cheek?: string;
	walk?: number;
	back?: boolean;
}> = ({
	x,
	y,
	s = 1,
	jaw = 0.15,
	look = [0, 0],
	blink = 0,
	tilt = 0,
	armR = 'pointer',
	armL = 'hip',
	pointerAng = 30,
	bust = false,
	blush = true,
	shiver = 0,
	f = 0,
	capTilt = 0,
	cold = 0,
	cap = true,
	capAt,
	heart,
	heartOver = false,
	brain = 0,
	vessels,
	chest = 1,
	frost = 0,
	handFrost,
	glassFrost,
	sweat = 0,
	scarf = false,
	mittens = false,
	inner,
	outer,
	glasses = true,
	tie = true,
	hat,
	face,
	torso,
	shoe,
	behind,
	cloak,
	cheek: cheekColor,
	walk,
	back = false,
}) => {
	const sx = shiver ? Math.sin(f * 1.3) * 8 * shiver : 0;
	const walking = walk !== undefined;
	const ph = walk ?? 0;
	const bob = walking ? -Math.abs(Math.sin(ph)) * 6 : 0;
	// while walking, a foot lifts (one, then the other) and the hanging arm on the other side swings forward
	const lift = (sd: 1 | -1) => (walking ? Math.max(0, Math.sin(ph + (sd < 0 ? 0 : Math.PI))) : 0);
	const chatter = shiver ? Math.abs(Math.sin(f * 1.7)) * 0.3 * shiver : 0;
	const jo = Math.max(0, Math.min(1, jaw + chatter)) * 22;
	const cheek0 = cheekColor ?? '#f0868e';
	const cheek = cold > 0 ? mixHex(cheek0, '#8fb8ff', Math.min(1, cold)) : cheek0;
	const vcol = vessels ? mixHex('#3a78e0', '#e0303a', vessels.warm) : '';
	const vline = (a: [number, number], b: [number, number], part: number) =>
		vessels && part > 0 ? <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * part} y2={a[1] + (b[1] - a[1]) * part} stroke={vcol} strokeWidth={6} strokeLinecap="round" opacity={0.9} /> : null;
	const arm = (side: 1 | -1, pose: Pose | ArmSpec) => {
		const sh: [number, number] = [side * 62, -380];
		const p0 = armPose(side, pose, f, pointerAng);
		const sw = walking && pose === 'down' ? lift((-side) as 1 | -1) : 0;
		const p = sw ? {...p0, el: [p0.el[0] - side * sw * 6, p0.el[1] - sw * 8] as [number, number], ha: [p0.ha[0] - side * sw * 14, p0.ha[1] - sw * 26] as [number, number], hang: -side * sw * 30} : p0;
		const {el, ha} = p;
		const hang = p.hang ?? 0;
		const fist = !!p.fist;
		const finger = !!p.finger;
		const curl = p.curl ?? 0;
		const extra = p.item ? <g transform={`translate(${ha[0]},${ha[1]}) rotate(${p.itemAng ?? 0})`}>{p.item}</g> : null;
		const reach = vessels ? vessels.reach : 0;
		return (
			<g>
				<Bone a={sh} b={el} />
				<Bone a={el} b={ha} />
				{vline(sh, el, Math.min(1, reach * 2))}
				{vline(el, ha, Math.max(0, reach * 2 - 1))}
				{extra}
				<Hand at={ha} ang={hang} fist={fist || mittens} finger={finger && !mittens} curl={curl} mitten={mittens} frost={handFrost ?? frost} />
			</g>
		);
	};
	const isFront = (a: Pose | ArmSpec) => typeof a === 'object' && !!a.front;
	const heartEl = heart ? (
		<g transform={`translate(0,-330) scale(${(heart.size ?? 1) * (1 + 0.16 * Math.max(0, heart.beat))})`}>
			<circle r={58} fill="#ff6a70" opacity={0.18 * Math.max(0, heart.beat)} />
			<path d="M 0,26 C -40,0 -44,-34 -20,-38 C -8,-40 0,-30 0,-22 C 0,-30 8,-40 20,-38 C 44,-34 40,0 0,26 Z" fill="#e0303a" stroke="#9a1e20" strokeWidth={4} />
			<ellipse cx={-14} cy={-22} rx={7} ry={4} fill="#fff" opacity={0.6} />
		</g>
	) : null;
	return (
		<g transform={`translate(${x + sx * s},${y + bob * s}) scale(${s})`}>
			{behind}
			{!bust &&
				([-1, 1] as const).map((sd) => {
					const l = lift(sd);
					const K: [number, number] = [sd * (34 + l * 10), -105 - l * 22];
					const A: [number, number] = [sd * (36 + l * 4), -32 - l * 36];
					return (
						<g key={sd}>
							<Bone a={[sd * 30, -185]} b={K} w={22} />
							<Bone a={K} b={A} w={22} />
							{vline([sd * 30, -185], A, vessels ? vessels.reach : 0)}
							<g transform={l ? `translate(${A[0] - sd * 36},${A[1] + 32})` : undefined}>
								{shoe ? shoe(sd) : <ellipse cx={sd * 46} cy={-16} rx={36} ry={18} fill={sd < 0 ? BONE : BONE_SH} stroke={BONE_D} strokeWidth={4.5} />}
							</g>
						</g>
					);
				})}
			{/* pelvis */}
			<path d="M -66,-212 C -72,-182 -46,-166 -20,-172 L 0,-182 L 20,-172 C 46,-166 72,-182 66,-212 C 36,-200 -36,-200 -66,-212 Z" fill={BONE} stroke={BONE_D} strokeWidth={5} />
			<path d="M 0,-202 L 20,-172 C 46,-166 72,-182 66,-212 C 42,-203 20,-201 0,-202 Z" fill={BONE_SH} />
			{/* spine */}
			{Array.from({length: 3}).map((_, k) => (
				<rect key={k} x={-13} y={-268 + k * 20} width={26} height={15} rx={6} fill={BONE} stroke={BONE_D} strokeWidth={3.5} />
			))}
			{/* what is inside the ribcage: the heart, anything else */}
			{heart && !heartOver && heartEl}
			{inner}
			{/* ribcage (it breathes in with chest > 1) */}
			<g transform={`translate(0,-330) scale(${chest},${1 + (chest - 1) * 0.6}) translate(0,330)`}>
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
			</g>
			{heart && heartOver && heartEl}
			{/* collarbones and arms */}
			<Bone a={[-62, -386]} b={[62, -386]} w={18} />
			{torso}
			{!isFront(armL) && arm(-1, armL)}
			{!isFront(armR) && arm(1, armR)}
			{cloak}
			{/* the neck and the red bow tie (or a striped scarf) */}
			<rect x={-13} y={-424} width={26} height={22} rx={7} fill={BONE} stroke={BONE_D} strokeWidth={3.5} />
			{scarf ? (
				<g>
					<path d="M -70,-428 Q 0,-392 70,-428 L 74,-396 Q 0,-356 -74,-396 Z" fill="#d23436" />
					{[-48, -16, 16, 48].map((qx) => (
						<rect key={qx} x={qx - 6} y={-424 + Math.abs(qx) * 0.12} width={12} height={34} fill="#fff" opacity={0.9} />
					))}
					<path d="M 30,-396 L 58,-300 L 86,-306 L 60,-398 Z" fill="#d23436" />
					<rect x={46} y={-352} width={30} height={10} fill="#fff" transform="rotate(-15 60 -347)" />
					<path d="M 58,-300 l -4,16 M 66,-302 l -2,16 M 74,-304 l 0,16 M 82,-305 l 2,16" stroke="#d23436" strokeWidth={5} strokeLinecap="round" />
				</g>
			) : (
				tie && (
					<g transform="translate(0,-398)">
						<path d="M -4,0 L -40,-18 L -40,18 Z" fill="#d23436" />
						<path d="M 4,0 L 40,-18 L 40,18 Z" fill="#b8282a" />
						<rect x={-10} y={-9} width={20} height={18} rx={6} fill="#9a1e20" />
					</g>
				)
			)}
			{/* the head */}
			<g transform={`rotate(${tilt} 0 -430)`}>
				{/* the jaw: a dark mouth opens behind the teeth */}
				{!back && <path d={`M -50,-456 C -46,${-428 + jo} 46,${-428 + jo} 50,-456 Z`} fill="#3a2226" />}
				<path d={`M -56,${-452 + jo} C -52,${-418 + jo} 52,${-418 + jo} 56,${-452 + jo} L 44,${-448 + jo} L -44,${-448 + jo} Z`} fill={BONE} stroke={BONE_D} strokeWidth={5} />
				{!back &&
					[-28, -14, 0, 14, 28].map((tx, k) => (
					<rect key={`l${k}`} x={tx - 5.5} y={-452 + jo + Math.abs(tx) * 0.06} width={11} height={11} rx={4} fill="#fffdf6" stroke={BONE_D} strokeWidth={2.2} />
				))}
				{/* the round skull */}
				<path d="M -150,-560 C -150,-650 -85,-698 0,-698 C 85,-698 150,-650 150,-560 C 150,-500 120,-464 84,-452 L -84,-452 C -120,-464 -150,-500 -150,-560 Z" fill={BONE} stroke={BONE_D} strokeWidth={6} />
				<path d="M 0,-698 C 85,-698 150,-650 150,-560 C 150,-500 120,-464 84,-452 L 0,-452 Z" fill={BONE_SH} />
				{brain > 0 && (
					<g opacity={brain}>
						<ellipse cx={0} cy={-640} rx={86} ry={42} fill="#f39aa8" />
						<path d="M -60,-646 q 20,-22 40,0 q 20,-22 40,0 q 20,-22 40,0 M -50,-628 q 25,14 50,0 q 25,14 50,0" stroke="#d86a80" strokeWidth={5} fill="none" strokeLinecap="round" />
					</g>
				)}
				<ellipse cx={-70} cy={-650} rx={34} ry={16} fill="#fff" opacity={0.5} transform="rotate(-22 -70 -650)" />
				{/* seen from behind: only a faint seam on the back of the skull */}
				{back && <path d="M -96,-560 C -60,-590 60,-590 96,-560" stroke={BONE_D} strokeWidth={4} fill="none" opacity={0.6} />}
				{/* upper teeth on a little smile */}
				{!back &&
					[-28, -14, 0, 14, 28].map((tx, k) => (
					<rect key={k} x={tx - 5.5} y={-466 + Math.abs(tx) * -0.06} width={11} height={13} rx={4} fill="#fffdf6" stroke={BONE_D} strokeWidth={2.2} />
				))}
				{/* pink cheeks (blue in the cold) */}
				{!back && blush && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 100} cy={-500} rx={22} ry={12} fill={cheek} opacity={0.55} />)}
				{/* big shiny eyes */}
				{!back &&
					[-1, 1].map((sd) => (
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
				{!back && <path d="M 0,-498 C -16,-510 -15,-528 -6,-528 C -2,-528 0,-524 0,-520 C 0,-524 2,-528 6,-528 C 15,-528 16,-510 0,-498 Z" fill={INK} />}
				{!back && face}
				{/* round glasses (they frost over in the cold) */}
				{!back && glasses && (glassFrost ?? frost) > 0 && [-1, 1].map((sd) => <circle key={sd} cx={sd * 58} cy={-566} r={55} fill="#eaf6ff" opacity={0.55 * (glassFrost ?? frost)} />)}
				{!back && glasses && (
					<g fill="none" stroke="#2a2a30" strokeWidth={6}>
						<circle cx={-58} cy={-566} r={58} />
						<circle cx={58} cy={-566} r={58} />
						<path d="M -4,-572 Q 0,-580 4,-572" />
						<path d="M -116,-572 L -144,-586 M 116,-572 L 144,-586" />
					</g>
				)}
				{/* hoarfrost on the skull */}
				{frost > 0 && (
					<g opacity={Math.min(1, frost * 1.3)}>
						<path d="M -140,-600 C -120,-660 -60,-690 0,-692 C 60,-690 120,-660 140,-600 C 110,-620 90,-610 70,-630 C 50,-612 30,-628 0,-616 C -30,-628 -50,-612 -70,-630 C -90,-610 -110,-620 -140,-600 Z" fill="#f4fbff" />
						{[-130, -100, 104, 132].map((cx2, k) => (
							<circle key={k} cx={cx2} cy={-520 - (k % 2) * 30} r={7} fill="#f4fbff" />
						))}
					</g>
				)}
				{/* sweat drops when hot */}
				{sweat > 0 &&
					[0, 1, 2].map((k) => {
						const t = ((f + k * 11) % 30) / 30;
						return <path key={k} d="M 0,-14 C 8,-2 8,8 0,10 C -8,8 -8,-2 0,-14 Z" fill="#7fc4ff" opacity={sweat * (1 - t)} transform={`translate(${[-150, 150, -120][k] + (k === 1 ? 10 : -10) * t},${-600 + t * 70})`} />;
					})}
				{/* the oversized mortarboard with its tassel (icicles hang from it in the frost) */}
				{hat}
				{!hat && cap && (
					<g transform={capAt ? `translate(${capAt[0]},${capAt[1]}) rotate(${capAt[2]} 0 -690)` : `rotate(${capTilt} 0 -690)`}>
						<Mortarboard tassel={Math.sin(f / 9) * 0.6} />
						{frost > 0.2 &&
							[-120, -70, -20, 40, 90].map((ix, k) => (
								<path key={k} d={`M ${ix - 8},-652 L ${ix + 8},-652 L ${ix},${-652 + (18 + (k % 3) * 10) * Math.min(1, frost * 1.4)} Z`} fill="#dff2ff" />
							))}
					</g>
				)}
			</g>
			{isFront(armL) && arm(-1, armL)}
			{isFront(armR) && arm(1, armR)}
			{outer}
		</g>
	);
};
