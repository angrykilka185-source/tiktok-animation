import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {blinkAt, clamp, lerp, pop, shake} from '../anim';
import {Bubble, HEAVY, NameTag} from '../components/Overlays';
import {Bust, Hand, Person} from '../components/Person';
import {BorschtBowl, FamilyPhoto, Fork, Glass, Hallway, Kitchen, Table, Wallpaper} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';

const Towel: React.FC<{rot?: number}> = ({rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		<path d="M -70,-20 L 70,-20 L 80,120 Q 0,140 -80,120 Z" fill="#f4f1ea" />
		<rect x={-75} y={70} width={155} height={14} fill="#d9534f" opacity={0.8} />
	</g>
);

// ---------------------------------------------------------------- SHOT 1 ---
// Hallway, the door opens: tall dad with a backpack in the doorway.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 44, 78, 0, 1, Easing.out(Easing.cubic));
	const s = lerp(f, 0, 180, 1.0, 1.32, Easing.inOut(Easing.quad));
	const cam: Cam = {s, cx: 540, cy: lerp(f, 0, 180, 960, 930)};
	const [sx, sy] = shake(f, 36, 4, 6);
	cam.dx = sx;
	cam.dy = sy;
	const dadFace = {eyes: 'open' as const, mouth: 'smile' as const, stubble: true, blink: blinkAt(f, 1, 70), look: [0, 0.1] as [number, number]};
	const momLook = f < 40 ? [-0.6, 0] : [-1, -0.2];
	const tagPos = toScreen(cam, 520, 1262 - 690);
	return (
		<Stage
			cam={cam}
			light={{glow: 0.4, vignette: 0.5}}
			overlay={<NameTag x={tagPos.x} y={tagPos.y - 170} title="ПАПА" sub="3 МЕСЯЦА НА ВАХТЕ" at={86} pin={70} />}
		>
			<Hallway
				id="s1"
				open={open}
				behind={
					<Person
						kind="dad"
						id="s1dad"
						x={520}
						y={1252}
						scale={0.6}
						backpack
						face={dadFace}
						breathe={f}
						armL={{target: [-104, -735], kf: 0.42, bend: 1}}
						armR={{target: [104, -735], kf: 0.42, bend: -1}}
					/>
				}
			/>
			<Person
				kind="mom"
				id="s1mom"
				x={960}
				y={1760}
				scale={0.95}
				breathe={f + 20}
				face={{
					eyes: f > 70 ? 'wide' : 'open',
					mouth: f > 70 ? 'o' : 'smile',
					look: momLook as [number, number],
					blink: blinkAt(f, 3),
					brows: f > 70 ? 'raised' : 'neutral',
				}}
				armL={{target: [-34, -640], kf: 0.5, bend: 1}}
				armR={{target: [34, -632], kf: 0.5, bend: -1}}
				itemL={<Towel rot={10} />}
			/>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 2 ---
// Mom drops the towel, covers her mouth, happy tears.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: lerp(f, 0, 120, 1.0, 1.12), cx: 540, cy: 960};
	const up = lerp(f, 14, 30, 0, 1, Easing.out(Easing.back(1.4)));
	// hands: chest -> mouth
	const mouthY = -846;
	const tL: [number, number] = [-30 + (-26 + 30) * up, -650 + (mouthY + 10 - -650) * up];
	const tR: [number, number] = [30 + (26 - 30) * up, -650 + (mouthY + 10 - -650) * up];
	const towelT = Math.max(0, f - 12);
	const towelY = 0.5 * 2.2 * towelT * towelT;
	const tears = lerp(f, 40, 90, 0, 1);
	const shakeY = f > 30 ? Math.sin(f / 2.2) * 3 : 0;
	return (
		<Stage
			cam={cam}
			light={{glow: 0.45, vignette: 0.55}}
			overlay={<NameTag x={540} y={260} title="МАМА" at={4} hang color="#f2a7c3" />}
		>
			<Wallpaper id="s2wp" x={-500} y={-500} w={2200} h={3000} />
			<rect x={-40} y={300} width={330} height={1700} fill="#2a1d18" />
			<rect x={250} y={260} width={40} height={1700} fill="#6e3f22" />
			<rect x={-40} y={260} width={330} height={40} fill="#6e3f22" />
			<rect x={-60} y={300} width={30} height={1700} fill="#b8433a" />
			<g transform={`translate(0,${shakeY})`}>
				<Person
					kind="mom"
					id="s2mom"
					x={560}
					y={2240}
					scale={1.6}
					breathe={f}
					face={{
						eyes: f < 26 ? 'wide' : 'happy',
						brows: f < 26 ? 'raised' : 'worried',
						mouth: f < 14 ? 'o' : 'smile',
						tears,
						blink: f < 26 ? blinkAt(f, 2) : 0,
					}}
					armL={{target: tL, bend: 1}}
					armR={{target: tR, bend: -1}}
					itemL={f < 12 ? <Towel rot={10} /> : undefined}
				/>
			</g>
			{f >= 12 && (
				<g transform={`translate(${560 - 30 * 1.6 + towelT * 3},${2240 - 640 * 1.6 + towelY}) scale(1.6)`}>
					<Towel rot={10 + towelT * 9} />
				</g>
			)}
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 3 ---
// Dad puts his hand on your head: «Привет, парень». Then two close-ups.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const cut1 = 58; // close-up: dad
	const cut2 = 92; // close-up: you, his hand still on your head
	if (f >= cut2) {
		const t = f - cut2;
		const pat = t < 18 ? Math.sin(t / 2.2) * 10 * (1 - t / 18) : 0;
		return (
			<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.08), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#e9d1a2">
				<Wallpaper id="s3c2wp" x={-300} y={-300} w={1700} h={2600} />
				<rect x={-300} y={-300} width={1700} height={2600} fill="#000" opacity={0.08} />
				<Bust
					kind="son"
					id="s3cu2"
					x={540}
					y={1010}
					scale={3.5}
					face={{eyes: 'wide', brows: 'worried', mouth: 'flat', look: [-0.7, -0.9], pupil: 0.85, blink: blinkAt(t, 3, 70)}}
				/>
				<g transform={`translate(0,${pat})`}>
					<rect x={-160} y={330} width={600} height={190} rx={90} fill="#263c55" transform="rotate(18 140 425)" />
					<rect x={330} y={430} width={70} height={190} fill="#f39a2e" transform="rotate(18 140 425)" />
					<g transform="translate(470,560) rotate(-62) scale(3.3)">
						<Hand r={29} skin="#e9b892" thumb={-1} />
					</g>
				</g>
			</Stage>
		);
	}
	if (f >= cut1) {
		const t = f - cut1;
		return (
			<Stage cam={{s: lerp(t, 0, 34, 1.0, 1.07), cx: 540, cy: 900}} light={{glow: 0.3, vignette: 0.6}} bg="#e9d1a2">
				<Wallpaper id="s3c1wp" x={-300} y={-300} w={1700} h={2600} />
				<rect x={760} y={-300} width={600} height={2600} fill="#f6f7ef" opacity={0.9} />
				<rect x={740} y={-300} width={30} height={2600} fill="#6e3f22" />
				<Bust kind="dad" id="s3cu1" x={520} y={900} scale={3.4} turn={0.4} face={{eyes: 'open', mouth: 'smile', stubble: true, look: [0.6, 0.7], blink: blinkAt(t, 2, 60)}} />
			</Stage>
		);
	}
	const cam: Cam = {s: lerp(f, 0, cut1, 1.0, 1.05), cx: 540, cy: 960};
	const dadX = lerp(f, 0, 36, -160, 300, Easing.out(Easing.quad));
	const walking = f < 36;
	const dadY = 1560;
	const sonX = 770, sonY = 1640;
	const headTop: [number, number] = [sonX - dadX, sonY - 830 - dadY - 10];
	const reach = lerp(f, 36, 50, 0, 1, Easing.out(Easing.cubic));
	const pat = f > 50 && f < 58 ? Math.sin((f - 50) / 2.5) * 8 : 0;
	const rest: [number, number] = [150, -470];
	const armR: [number, number] = [rest[0] + (headTop[0] - rest[0]) * reach, rest[1] + (headTop[1] - rest[1]) * reach + pat];
	const sonFace =
		f < 50
			? {eyes: 'open' as const, mouth: 'smile' as const, look: [-0.9, -0.5] as [number, number], blink: blinkAt(f, 5)}
			: {eyes: 'closed' as const, mouth: 'smile' as const};
	return (
		<Stage cam={cam} light={{glow: 0.35, vignette: 0.5}} overlay={<NameTag x={770} y={650} title="ТЫ" at={6} to={50} pin={40} />}>
			<Hallway id="s3" open={1} />
			<Person kind="son" id="s3son" x={sonX} y={sonY} scale={1.0} breathe={f} face={sonFace} />
			<Person
				kind="dad"
				id="s3dad"
				x={dadX}
				y={dadY}
				scale={1.0}
				walk={walking ? f / 4.2 : undefined}
				breathe={f}
				face={{eyes: 'open', mouth: 'smile', stubble: true, look: [0.8, 0.4], blink: blinkAt(f, 2)}}
				armL={{shoulder: walking ? Math.sin(f / 4.2) * 14 : 4, elbow: -6}}
				armR={{target: armR, bend: 1}}
			/>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 4 ---
// Kitchen: borscht is pushed away, he drinks only water.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: lerp(f, 0, 180, 1.0, 1.12), cx: 540, cy: lerp(f, 0, 180, 960, 1020)};
	const tableY = 1400;
	const D = {x: 340, y: 0, s: 1.05};
	D.y = tableY + 470 * D.s - 30;
	const toDad = (wx: number, wy: number): [number, number] => [(wx - D.x) / D.s, (wy - D.y) / D.s];
	const M = {x: 790, y: tableY + 400 * 1.0 + 60, s: 1.0};
	const toMom = (wx: number, wy: number): [number, number] => [(wx - M.x) / M.s, (wy - M.y) / M.s];

	// bowl: carried by mom with both hands (0..30), on the table, then pushed away (46..64)
	const place = lerp(f, 18, 48, 0, 1, Easing.inOut(Easing.cubic));
	const push = lerp(f, 102, 120, 0, 1, Easing.out(Easing.cubic));
	const bowl0 = {x: 760, y: 1235};
	const bowl1 = {x: 520, y: tableY + 20};
	const bowlX = f < 48 ? bowl0.x + (bowl1.x - bowl0.x) * place : bowl1.x + 170 * push;
	const bowlY = f < 48 ? bowl0.y + (bowl1.y - bowl0.y) * place - Math.sin(place * Math.PI) * 40 : bowl1.y;

	// glass (in dad's RIGHT hand = viewer-left): lifted 80..100, drink 100..140, down 140..158
	const lift = lerp(f, 126, 142, 0, 1) - lerp(f, 166, 178, 0, 1);
	const mouth = {x: D.x, y: D.y - 1024 * D.s + 0.58 * 104 * D.s};
	const g0 = {x: 190, y: tableY + 26};
	const gX = g0.x + (mouth.x - 46 - g0.x) * lift;
	const gY = g0.y + (mouth.y + 96 - g0.y) * lift;
	const tilt = lerp(f, 142, 150, 0, 30) - lerp(f, 160, 168, 0, 30);
	const level = lerp(f, 144, 164, 0.8, 0.3);

	// mom: both hands on the bowl, then hands folded on the apron
	const holding = f < 52;
	const momL: [number, number] = holding ? toMom(bowlX - 70, bowlY - 26) : [-26, -560];
	const momR: [number, number] = holding ? toMom(bowlX + 70, bowlY - 26) : [26, -556];
	const restBlend = lerp(f, 52, 64, 0, 1);
	const mL: [number, number] = holding ? momL : [toMom(bowl1.x - 70, bowl1.y - 26)[0] * (1 - restBlend) + -26 * restBlend, toMom(bowl1.x - 70, bowl1.y - 26)[1] * (1 - restBlend) + -560 * restBlend];
	const mR: [number, number] = holding ? momR : [toMom(bowl1.x + 70, bowl1.y - 26)[0] * (1 - restBlend) + 26 * restBlend, toMom(bowl1.x + 70, bowl1.y - 26)[1] * (1 - restBlend) + -556 * restBlend];

	// dad: forearms resting on the table; left hand (viewer-right) pushes the bowl away
	const pushHand = f >= 94 && f < 124;
	const dadArmR: [number, number] = pushHand ? toDad(bowlX - 95, tableY + 6) : toDad(430, tableY + 8);
	const dadArmL: [number, number] = f < 122 ? toDad(220, tableY + 8) : toDad(gX + 6, gY - 44);

	const dadLook: [number, number] = f < 94 ? [0.6, 0.8] : f < 124 ? [-0.2, 0.2] : [-0.5, 0.4];
	return (
		<Stage cam={cam} light={{glow: 0.35, vignette: 0.5}}>
			<Kitchen id="s4" floorY={1300} clock={[3, 5]} tick={f / 30} />
			<Person
				kind="mom"
				id="s4mom"
				x={M.x}
				y={M.y}
				scale={M.s}
				breathe={f}
				headTilt={holding ? -6 * place : -6 * (1 - restBlend)}
				face={{
					eyes: 'open',
					mouth: f < 112 ? 'smile' : 'frown',
					brows: f < 112 ? 'neutral' : 'worried',
					look: f < 60 ? [-0.6, 0.7] : [-0.9, 0.1],
					blink: blinkAt(f, 7),
				}}
				armL={{target: mL, bend: 1, ku: 0.9, kf: holding ? 0.9 : 0.55}}
				armR={{target: mR, bend: -1, ku: 0.9, kf: holding ? 0.9 : 0.55}}
			/>
			<Person
				kind="dad"
				id="s4dad"
				hideLegs
				x={D.x}
				y={D.y}
				scale={D.s}
				face={{eyes: 'open', mouth: 'flat', stubble: true, look: dadLook, blink: blinkAt(f, 4, 80), brows: 'flat'}}
				armL={{target: dadArmL, bend: 1, ku: f < 122 ? 0.85 : 0.62, kf: f < 122 ? 0.7 : 0.85}}
				armR={{target: dadArmR, bend: -1, ku: 0.85, kf: 0.7}}
			/>
			<Table y={tableY} />
			<g transform={`translate(${bowlX},${bowlY})`}>
				<BorschtBowl steam={f / 30} scale={0.95} />
			</g>
			<g transform={`translate(${gX},${gY}) rotate(${tilt})`}>
				<Glass level={level} scale={1.05} />
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 5 ---
// Close-up: fork in the RIGHT hand. Then the wall photo: on it he eats with the LEFT.
const BigHand: React.FC<{x: number; y: number; rot?: number; fork?: boolean; scar?: boolean; s?: number; sleeve?: string}> = ({
	x,
	y,
	rot = 0,
	fork,
	scar,
	s = 1,
	sleeve = '#33506e',
}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-80} y={-700} width={160} height={560} rx={60} fill={sleeve} />
		<rect x={-80} y={-300} width={160} height={40} fill="#f39a2e" />
		<rect x={-66} y={-170} width={132} height={70} fill="#e9b892" />
		<path d="M -86,-120 Q -96,40 -60,90 L 70,90 Q 100,30 86,-120 Z" fill="#e9b892" />
		{[-56, -18, 20, 56].map((fx, i) => (
			<rect key={fx} x={fx - 17} y={60} width={34} height={i === 0 || i === 3 ? 92 : 112} rx={17} fill="#e9b892" />
		))}
		<rect x={-130} y={-60} width={50} height={110} rx={25} fill="#e9b892" transform="rotate(30 -100 -10)" />
		{scar && (
			<g>
				<path d="M -60,-60 L 64,10" stroke="#c4475a" strokeWidth={12} strokeLinecap="round" />
				{[-40, -14, 12, 38].map((t) => (
					<line key={t} x1={t - 2} y1={-58 + (t + 60) * 0.56 - 16} x2={t + 6} y2={-58 + (t + 60) * 0.56 + 14} stroke="#a33447" strokeWidth={6} strokeLinecap="round" />
				))}
			</g>
		)}
		{fork && (
			<g transform="translate(0,40) rotate(170)">
				<Fork scale={2.2} />
			</g>
		)}
	</g>
);
export {BigHand};

export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const cut = 52;
	if (f < cut) {
		const cam: Cam = {s: lerp(f, 0, cut, 1.0, 1.08), cx: 540, cy: 1000};
		const tap = f > 8 && f < 16 ? Math.sin(((f - 8) / 8) * Math.PI) * 18 : 0;
		const ring = pop(f, 22, 10);
		return (
			<Stage
				cam={cam}
				light={{glow: 0.3, vignette: 0.6}}
				screen={
					f >= 22 ? (
						<g opacity={ring}>
							<circle cx={330} cy={1040} r={170 * (0.7 + 0.3 * ring)} fill="none" stroke="#ff3b30" strokeWidth={12} />
							<text x={330} y={820} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={72} fill="#fff" stroke="#111" strokeWidth={10} paintOrder="stroke">
								ПРАВАЯ
							</text>
						</g>
					) : null
				}
			>
				<rect x={-200} y={-200} width={1500} height={1000} fill="#e8d2a4" />
				<rect x={-200} y={-200} width={1500} height={900} fill="#33506e" opacity={0.85} />
				<rect x={-200} y={720} width={1500} height={1500} fill="#e7553f" />
				{Array.from({length: 24}).map((_, i) => (
					<rect key={i} x={-200 + i * 80} y={720} width={40} height={1500} fill="#f4efe6" opacity={0.5} />
				))}
				{Array.from({length: 18}).map((_, i) => (
					<rect key={'r' + i} x={-200} y={740 + i * 80} width={1500} height={40} fill="#f4efe6" opacity={0.4} />
				))}
				<ellipse cx={560} cy={1260} rx={300} ry={110} fill="#f5f2ea" />
				<ellipse cx={560} cy={1250} rx={230} ry={78} fill="#e9e4da" />
				<ellipse cx={560} cy={1250} rx={160} ry={50} fill="#d6b169" />
				<BigHand x={320} y={900 + tap} rot={-12} fork />
				<BigHand x={800} y={880} rot={14} />
			</Stage>
		);
	}
	const t = f - cut;
	const slide = lerp(t, 0, 10, 1, 0, Easing.out(Easing.cubic));
	const cam: Cam = {s: lerp(t, 0, 98, 1.0, 1.08), cx: 540, cy: 1000, dx: slide * 900};
	const ring = pop(f, cut + 14, 10);
	return (
		<Stage cam={cam} light={{glow: 0.35, vignette: 0.55}}>
			<Wallpaper id="s5wp" x={-600} y={-400} w={2400} h={2800} base="#f0dcb0" line="#dfc490" />
			<g transform="rotate(-2 540 1000)">
				<FamilyPhoto x={170} y={720} w={740} h={640} variant="fork" id="s5ph" highlight={ring} />
			</g>
			<text
				x={760}
				y={700}
				textAnchor="middle"
				fontFamily={HEAVY}
				fontWeight={900}
				fontSize={72}
				fill="#fff"
				stroke="#111"
				strokeWidth={10}
				paintOrder="stroke"
				opacity={ring}
				transform={`rotate(-4 760 700)`}
			>
				ЛЕВАЯ
			</text>
		</Stage>
	);
};

export {Towel, Bust};
