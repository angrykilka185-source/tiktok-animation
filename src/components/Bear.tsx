// The bear of «Каково это — умереть от лап медведя»: a big brown bear in the channel's flat style (each part is filled
// with its colour and outlined with a darker shade of it — like Чоби's bones). Units at s = 1 suit Гога at s ≈ 0.55:
// on all fours the shoulder is ~300 high and the bear ~560 long; standing on its hind legs it is ~620 tall.
//
//   <Bear pose="walk" ph={…}/>   side view, facing left (dir = -1 faces right); the origin is on the ground under its middle
//        pose: 'stand4' (on all fours, still) | 'walk' | 'run' (a gallop) | 'lie' (asleep, legs tucked in)
//        head: the head's angle (negative = the nose up: sniffing); mouth 0…1 (the jaw opens, teeth); eyes 'open' | 'closed'
//        ears 'up' | 'back' (pinned back: a warning); fur: 'brown' | 'grizzly' | 'polar' | 'cub'; thin (a hungry «шатун»)
//   <BearUp/>                    standing up on its hind legs, side view facing left; the origin under its hind paws
//   <BearFront/>                 seen from the front (the charge towards you, the face up close); the origin on the ground
import React from 'react';

export type Fur = 'brown' | 'grizzly' | 'polar' | 'cub';
const FURS: Record<Fur, {fur: string; dark: string; far: string; muzzle: string; line: string}> = {
	brown: {fur: '#7a4a24', dark: '#603618', far: '#5a3418', muzzle: '#b98552', line: '#3a1f0c'},
	grizzly: {fur: '#8a5a32', dark: '#6a4020', far: '#644020', muzzle: '#caa27a', line: '#3a210e'},
	polar: {fur: '#f4f0e4', dark: '#ddd5c2', far: '#d6cdb8', muzzle: '#fbf8ef', line: '#9a907c'},
	cub: {fur: '#8e5a2e', dark: '#70421e', far: '#6a401e', muzzle: '#c9965f', line: '#3f2410'},
};
const NOSE = '#1d1410';
const CLAW = '#efe6d8';
const TOOTH = '#fffbf0';

// one leg from its joint (jx, jy) down to the ground; it swings about the joint by `ang` degrees; claws on the paw
const Leg: React.FC<{jx: number; jy: number; len: number; w: number; ang: number; c: string; line: string; claws?: boolean; lift?: number}> = ({jx, jy, len, w, ang, c, line, claws = false, lift = 0}) => (
	<g transform={`translate(${jx},${jy - lift}) rotate(${ang})`}>
		<path d={`M ${-w * 0.62},-30 C ${-w * 0.66},${len * 0.35} ${-w * 0.4},${len * 0.7} ${-w * 0.38},${len - 10} L ${w * 0.36},${len - 10} C ${w * 0.4},${len * 0.7} ${w * 0.66},${len * 0.35} ${w * 0.6},-30 Z`} fill={c} stroke={line} strokeWidth={5} strokeLinejoin="round" />
		<ellipse cx={-w * 0.12} cy={len - 10} rx={w * 0.62} ry={15} fill={c} stroke={line} strokeWidth={5} />
		{claws && [0, 1, 2, 3].map((k) => <path key={k} d={`M ${-w * 0.62 - 4 + k * 9},${len - 6} q -8,4 -10,12`} stroke={CLAW} strokeWidth={4} fill="none" strokeLinecap="round" />)}
	</g>
);

// the head (facing left) about its neck point (0, 0): skull, ear, muzzle, nose, eye, the jaw that opens
export const BearHead: React.FC<{c: (typeof FURS)[Fur]; mouth?: number; eyes?: 'open' | 'closed'; ears?: 'up' | 'back'; cub?: boolean; f?: number; glow?: number}> = ({c, mouth = 0, eyes = 'open', ears = 'up', cub = false, glow = 0}) => {
	const jaw = mouth * 26;
	return (
		<g transform={cub ? 'scale(1.38)' : undefined}>
			{/* the ear (pinned back when it warns) */}
			<g transform={ears === 'back' ? 'rotate(58 -14 -44)' : undefined}>
				<circle cx={-20} cy={-62} r={24} fill={c.fur} stroke={c.line} strokeWidth={5} />
				<circle cx={-22} cy={-60} r={12} fill={c.muzzle} />
			</g>
			{/* the lower jaw (it opens), the teeth and the tongue */}
			<g transform={`translate(-60,-2) rotate(${-jaw}) translate(60,2)`}>
				<path d="M -60,-4 C -80,6 -118,12 -134,6 C -132,-2 -118,-6 -98,-8 Z" fill={c.muzzle} stroke={c.line} strokeWidth={5} strokeLinejoin="round" />
				{mouth > 0.1 && <path d="M -124,4 l 6,-12 l 6,12 M -104,4 l 6,-12 l 6,12" fill={TOOTH} stroke={c.line} strokeWidth={2} />}
			</g>
			{mouth > 0.1 && <path d={`M -64,-6 C -84,${-4 + jaw * 0.2} -112,${0 + jaw * 0.3} -128,${2 + jaw * 0.2}`} stroke="#c0405a" strokeWidth={10} fill="none" strokeLinecap="round" />}
			{/* the skull and the muzzle */}
			<path d="M 10,-40 C 8,-86 -48,-100 -78,-74 C -96,-60 -110,-50 -134,-42 C -152,-36 -150,-12 -132,-6 C -110,2 -78,0 -56,-2 C -24,-4 12,-8 10,-40 Z" fill={c.fur} stroke={c.line} strokeWidth={5} strokeLinejoin="round" />
			<path d="M -84,-52 C -100,-46 -116,-42 -132,-38 C -148,-32 -146,-12 -130,-8 C -110,-2 -88,-4 -74,-8 C -70,-24 -74,-42 -84,-52 Z" fill={c.muzzle} />
			{mouth > 0.1 && <path d="M -126,-6 l 5,10 l 5,-10 M -106,-4 l 5,10 l 5,-10" fill={TOOTH} stroke={c.line} strokeWidth={2} />}
			<ellipse cx={-140} cy={-34} rx={14} ry={11} fill={NOSE} />
			<ellipse cx={-144} cy={-38} rx={4} ry={3} fill="#ffffff" opacity={0.5} />
			{/* the eye */}
			{eyes === 'open' ? (
				<g>
					{glow > 0 && <circle cx={-70} cy={-58} r={22} fill="#ffe27a" opacity={0.35 * glow} />}
					{glow > 0 && <circle cx={-70} cy={-58} r={12} fill="#ffe27a" opacity={glow} />}
					<circle cx={-70} cy={-58} r={8} fill={NOSE} />
					<circle cx={-72} cy={-61} r={2.6} fill="#ffffff" />
				</g>
			) : (
				<path d="M -79,-57 q 9,6 18,0" stroke={NOSE} strokeWidth={4} fill="none" strokeLinecap="round" />
			)}
		</g>
	);
};

export type BearPose = 'stand4' | 'walk' | 'run' | 'lie';
export const Bear: React.FC<{
	x?: number;
	y?: number;
	s?: number;
	dir?: 1 | -1;
	pose?: BearPose;
	ph?: number;
	head?: number;
	mouth?: number;
	eyes?: 'open' | 'closed';
	ears?: 'up' | 'back';
	fur?: Fur;
	thin?: boolean;
	slap?: number; // 0…1: the near front paw rises and slaps the ground
	amp?: number; // 0…1: how wide the stride is (it slows down to a stop: the legs come together before the pose turns to 'stand4')
	glow?: number; // 0…1: the eyes catch the light (at night)
}> = ({x = 0, y = 0, s = 1, dir = 1, pose = 'stand4', ph = 0, head = 0, mouth = 0, eyes = 'open', ears = 'up', fur = 'brown', thin = false, slap = 0, amp = 1, glow = 0}) => {
	const c = FURS[fur];
	const cub = fur === 'cub';
	const run = pose === 'run';
	const walk = pose === 'walk';
	const lie = pose === 'lie';
	// the gait: each leg swings about its joint; a walk is a four-beat step, a gallop moves the front pair and the hind pair together
	const A = (run ? 34 : walk ? 20 : 0) * amp;
	const sw = (o: number) => (A ? Math.sin(ph + o) * A : 0);
	const up = (o: number) => (A ? Math.max(0, Math.sin(ph + o + Math.PI / 2)) * (run ? 26 : 14) * amp : 0);
	const bob = (run ? -Math.abs(Math.sin(ph)) * 22 : walk ? -Math.abs(Math.sin(ph)) * 6 : 0) * amp;
	const pitch = run ? Math.sin(ph) * 4 * amp : 0;
	const by = thin ? 0.82 : 1;
	const offs = run ? {nh: Math.PI, nf: 0, fh: Math.PI + 0.5, ff: 0.5} : {nh: 0, nf: Math.PI / 2, fh: Math.PI, ff: (3 * Math.PI) / 2};
	const legLen = cub ? 150 : 170;
	return (
		<g transform={`translate(${x},${y}) scale(${s * dir},${s})`}>
			<g transform={`translate(0,${bob}) rotate(${pitch})`}>
				{/* the legs come out from under the body: the far pair (darker), then the near pair */}
				{!lie && (
					<>
						<Leg jx={170} jy={-150} len={legLen} w={64} ang={sw(offs.fh)} c={c.far} line={c.line} lift={up(offs.fh)} />
						<Leg jx={-108} jy={-150} len={legLen} w={58} ang={sw(offs.ff)} c={c.far} line={c.line} claws lift={up(offs.ff)} />
						<Leg jx={150} jy={-160} len={legLen + 6} w={70} ang={sw(offs.nh)} c={c.fur} line={c.line} lift={up(offs.nh)} />
						{slap <= 0 && <Leg jx={-128} jy={-160} len={legLen + 6} w={62} ang={sw(offs.nf)} c={c.fur} line={c.line} claws lift={up(offs.nf)} />}
					</>
				)}
				{/* lying: the paws stick out on the ground in front and behind */}
				{lie && <ellipse cx={186} cy={-16} rx={70} ry={22} fill={c.far} stroke={c.line} strokeWidth={5} />}
				{/* the body with the shoulder hump; a lighter belly; a hungry bear is thin (its ribs show) */}
				<g transform={`translate(0,${lie ? 70 : 0}) translate(0,-190) scale(1,${by}) translate(0,190)`}>
					<path d="M 246,-150 C 256,-252 154,-292 40,-284 C -36,-300 -100,-336 -168,-288 C -206,-264 -218,-220 -208,-180 C -202,-112 -150,-80 -60,-78 L 150,-80 C 222,-84 252,-108 246,-150 Z" fill={c.fur} stroke={c.line} strokeWidth={6} strokeLinejoin="round" />
					<path d="M -120,-300 C -80,-318 -30,-306 10,-290" stroke={c.dark} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
					<path d="M -40,-96 C 20,-88 120,-88 190,-98" stroke={c.dark} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.45} />
					{thin && [0, 1, 2, 3].map((k) => <path key={k} d={`M ${-40 + k * 44},-230 q 14,40 4,92`} stroke={c.dark} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />)}
					<path d="M 238,-170 q 18,-6 22,8 q -6,12 -20,8" fill={c.fur} stroke={c.line} strokeWidth={5} />
				</g>
				{/* the paw that slaps the ground comes up in front of the chest */}
				{!lie && slap > 0 && <Leg jx={-128} jy={-170} len={legLen + 6} w={62} ang={-Math.sin(slap * Math.PI) * 55} c={c.fur} line={c.line} claws lift={Math.sin(slap * Math.PI) * 50} />}
				{lie && <ellipse cx={-196} cy={-16} rx={62} ry={20} fill={c.fur} stroke={c.line} strokeWidth={5} />}
				{lie && [0, 1, 2, 3].map((k) => <path key={k} d={`M ${-252 + k * 9},-10 q -8,4 -10,12`} stroke={CLAW} strokeWidth={4} fill="none" strokeLinecap="round" />)}
				{/* the head on its neck */}
				<g transform={`translate(${lie ? -170 : -178},${lie ? -96 : -236}) rotate(${lie ? 16 : head})`}>
					<BearHead c={c} mouth={mouth} eyes={eyes} ears={ears} cub={cub} glow={glow} />
				</g>
			</g>
		</g>
	);
};

// standing up on its hind legs, seen from the front (taller than a person); the origin on the ground between its feet.
// arms: 0 = the front paws hang at its sides, 1 = raised up and forward; head: tilt (degrees), up: the nose raised (sniffing)
export const BearUp: React.FC<{x?: number; y?: number; s?: number; head?: number; up?: number; mouth?: number; ears?: 'up' | 'back'; fur?: Fur; arms?: number; eyes?: 'open' | 'closed'}> = ({x = 0, y = 0, s = 1, head = 0, up = 0, mouth = 0, ears = 'up', fur = 'brown', arms = 0, eyes = 'open'}) => {
	const c = FURS[fur];
	const arm = (sd: 1 | -1) => {
		const a = sd * (8 + arms * 70);
		return (
			<g transform={`translate(${sd * 118},-450) rotate(${-a})`}>
				<path d="M -38,-10 C -44,60 -38,130 -30,176 L 30,176 C 38,130 44,60 38,-10 Z" fill={c.fur} stroke={c.line} strokeWidth={6} strokeLinejoin="round" />
				<ellipse cx={0} cy={182} rx={40} ry={24} fill={c.fur} stroke={c.line} strokeWidth={5} />
				{[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M ${k * 13},198 q 0,10 -3,18`} stroke={CLAW} strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
			</g>
		);
	};
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{/* the hump behind the head */}
			<path d="M -170,-420 C -170,-520 -90,-580 0,-580 C 90,-580 170,-520 170,-420 Z" fill={c.dark} stroke={c.line} strokeWidth={6} />
			{/* the hind legs and the broad feet with their claws */}
			{[-1, 1].map((sd) => (
				<g key={sd}>
					<path d={`M ${sd * 80 - 60},-170 C ${sd * 80 - 66},-110 ${sd * 80 - 58},-50 ${sd * 80 - 52},-16 L ${sd * 80 + 52},-16 C ${sd * 80 + 58},-50 ${sd * 80 + 66},-110 ${sd * 80 + 60},-170 Z`} fill={c.far} stroke={c.line} strokeWidth={6} strokeLinejoin="round" />
					<ellipse cx={sd * 86} cy={-12} rx={66} ry={20} fill={c.fur} stroke={c.line} strokeWidth={5} />
					{[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M ${sd * 86 + k * 20},-2 q 0,9 -3,15`} stroke={CLAW} strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
				</g>
			))}
			{/* the body: wide at the belly, the lighter belly fur */}
			<path d="M -150,-440 C -200,-360 -200,-230 -160,-150 C -120,-90 120,-90 160,-150 C 200,-230 200,-360 150,-440 C 100,-480 -100,-480 -150,-440 Z" fill={c.fur} stroke={c.line} strokeWidth={6} />
			<path d="M -80,-380 C -110,-300 -100,-200 -60,-150 C -20,-130 20,-130 60,-150 C 100,-200 110,-300 80,-380 C 40,-400 -40,-400 -80,-380 Z" fill={c.muzzle} opacity={0.35} />
			{arm(-1)}
			{arm(1)}
			{/* the head; sniffing, the nose goes up */}
			<g transform={`translate(0,-500) rotate(${head}) translate(0,${-up * 10}) scale(0.82,${0.82 - up * 0.1})`}>
				<FrontHead c={c} mouth={mouth} ears={ears} eyes={eyes} />
			</g>
		</g>
	);
};

// the head seen from the front, about (0, 0) = the middle of the face: ears, face, muzzle, nose, eyes, the open mouth
const FrontHead: React.FC<{c: (typeof FURS)[Fur]; mouth?: number; ears?: 'up' | 'back'; eyes?: 'open' | 'closed'}> = ({c, mouth = 0, ears = 'up', eyes = 'open'}) => {
	const jaw = mouth * 34;
	return (
		<g>
			{[-1, 1].map((sd) => (
				<g key={sd} transform={ears === 'back' ? `translate(${sd * 30},26) rotate(${sd * 50} ${sd * 86} -96)` : undefined}>
					<circle cx={sd * 86} cy={-96} r={34} fill={c.fur} stroke={c.line} strokeWidth={6} />
					<circle cx={sd * 86} cy={-94} r={18} fill={c.muzzle} />
				</g>
			))}
			<path d="M -120,-30 C -130,-110 -70,-150 0,-150 C 70,-150 130,-110 120,-30 C 110,40 60,70 0,72 C -60,70 -110,40 -120,-30 Z" fill={c.fur} stroke={c.line} strokeWidth={6} />
			<path d="M -62,8 C -66,-30 -34,-44 0,-44 C 34,-44 66,-30 62,8 C 58,46 30,60 0,60 C -30,60 -58,46 -62,8 Z" fill={c.muzzle} stroke={c.line} strokeWidth={4} />
			{/* the open mouth: dark, the teeth, the tongue */}
			{mouth > 0.05 && (
				<g>
					<path d={`M -40,20 C -36,${30 + jaw} 36,${30 + jaw} 40,20 C 20,26 -20,26 -40,20 Z`} fill="#4a1018" stroke={c.line} strokeWidth={4} />
					<path d={`M -24,${24 + jaw * 0.8} C -10,${16 + jaw * 0.6} 10,${16 + jaw * 0.6} 24,${24 + jaw * 0.8}`} stroke="#c0405a" strokeWidth={10} fill="none" strokeLinecap="round" />
					{[-30, 30].map((tx) => <path key={tx} d={`M ${tx - 6},22 l 6,12 l 6,-12 Z`} fill={TOOTH} />)}
					{[-26, 26].map((tx) => <path key={tx} d={`M ${tx - 6},${22 + jaw} l 6,-10 l 6,10 Z`} fill={TOOTH} />)}
				</g>
			)}
			<path d="M -26,-22 C -26,-40 26,-40 26,-22 C 26,-6 10,2 0,2 C -10,2 -26,-6 -26,-22 Z" fill={NOSE} />
			<ellipse cx={-8} cy={-28} rx={7} ry={4} fill="#ffffff" opacity={0.45} />
			{[-1, 1].map((sd) =>
				eyes === 'open' ? (
					<g key={sd}>
						<circle cx={sd * 52} cy={-64} r={11} fill={NOSE} />
						<circle cx={sd * 52 - 3} cy={-68} r={3.5} fill="#ffffff" />
					</g>
				) : (
					<path key={sd} d={`M ${sd * 52 - 12},-62 q 12,8 24,0`} stroke={NOSE} strokeWidth={5} fill="none" strokeLinecap="round" />
				),
			)}
			</g>
	);
};

// seen from the front: the charge towards you, the face up close. The origin on the ground between the front paws.
// run: the gallop phase (the head bobs, the paws step); mouth 0…1; ears 'up' | 'back'
export const BearFront: React.FC<{x?: number; y?: number; s?: number; run?: number; mouth?: number; ears?: 'up' | 'back'; fur?: Fur; eyes?: 'open' | 'closed'}> = ({x = 0, y = 0, s = 1, run, mouth = 0, ears = 'up', fur = 'brown', eyes = 'open'}) => {
	const c = FURS[fur];
	const r = run !== undefined;
	const bob = r ? -Math.abs(Math.sin(run)) * 16 : 0;
	const step = (o: number) => (r ? Math.max(0, Math.sin(run + o)) * 30 : 0);
	return (
		<g transform={`translate(${x},${y + bob}) scale(${s})`}>
			{/* the hump and the shoulders behind the head */}
			<path d="M -230,-140 C -250,-260 -170,-360 0,-370 C 170,-360 250,-260 230,-140 C 210,-80 -210,-80 -230,-140 Z" fill={c.dark} stroke={c.line} strokeWidth={6} />
			{/* the front legs like pillars */}
			{[-1, 1].map((sd) => (
				<g key={sd} transform={`translate(0,${-step(sd < 0 ? 0 : Math.PI)})`}>
					<path d={`M ${sd * 150 - 52},-190 C ${sd * 150 - 58},-120 ${sd * 150 - 50},-50 ${sd * 150 - 44},-12 L ${sd * 150 + 44},-12 C ${sd * 150 + 50},-50 ${sd * 150 + 58},-120 ${sd * 150 + 52},-190 Z`} fill={c.fur} stroke={c.line} strokeWidth={6} strokeLinejoin="round" />
					<ellipse cx={sd * 150} cy={-10} rx={58} ry={20} fill={c.fur} stroke={c.line} strokeWidth={5} />
					{[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M ${sd * 150 + k * 18},-2 q 0,10 -2,18`} stroke={CLAW} strokeWidth={5} fill="none" strokeLinecap="round" />)}
				</g>
			))}
			{/* the chest */}
			<path d="M -150,-260 C -160,-170 -110,-100 0,-96 C 110,-100 160,-170 150,-260 C 100,-300 -100,-300 -150,-260 Z" fill={c.fur} stroke={c.line} strokeWidth={6} />
			{/* the head: ears, face, muzzle, nose, eyes, the mouth */}
			<g transform="translate(0,-300)">
				<FrontHead c={c} mouth={mouth} ears={ears} eyes={eyes} />
			</g>
		</g>
	);
};
