import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {blinkAt, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, NameTag} from '../components/Overlays';
import {Bust, Person, SPECS} from '../components/Person';
import {BorschtBowl, FamilyPhoto, Fork, Glass, Hallway, Kitchen, Table, Wallpaper} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';

const Towel: React.FC<{rot?: number}> = ({rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		<path d="M -70,-20 L 70,-20 L 80,120 Q 0,140 -80,120 Z" fill="#f4f1ea" />
		<rect x={-75} y={70} width={155} height={14} fill="#d9534f" opacity={0.8} />
	</g>
);

// Close-up hand (sleeve from the top), reference style: plain shapes, no fingers.
export const BigHand: React.FC<{
	x: number;
	y: number;
	rot?: number;
	s?: number;
	fork?: boolean;
	scar?: boolean;
	sleeve?: string;
	skin?: string;
	thumb?: -1 | 1;
}> = ({x, y, rot = 0, s = 1, fork, scar, sleeve = '#33506e', skin = '#e9b892', thumb = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-86} y={-760} width={172} height={640} rx={72} fill={sleeve} />
		<rect x={-86} y={-330} width={172} height={40} fill="#f39a2e" />
		<rect x={-64} y={-150} width={128} height={90} fill={skin} />
		<rect x={-88} y={-200} width={176} height={70} rx={26} fill={sleeve} />
		<rect x={-88} y={-200} width={176} height={70} rx={26} fill="#000" opacity={0.12} />
		{fork && (
			<g transform="translate(0,40) rotate(180)">
				<Fork scale={2.4} />
			</g>
		)}
		{fork ? (
			<g>
				<rect x={-84} y={-86} width={168} height={168} rx={70} fill={skin} />
				<ellipse cx={thumb * 40} cy={-10} rx={70} ry={32} fill={skin} />
				<path d={`M ${thumb * -10},-26 q ${thumb * 50},-16 ${thumb * 96},2`} stroke="#c98a6a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
			</g>
		) : (
			<g>
				<path d="M -92,-90 C -116,20 -104,120 -50,160 C -6,186 56,176 92,132 C 116,90 112,0 92,-90 Z" fill={skin} />
				<ellipse cx={thumb * 104} cy={-14} rx={34} ry={66} fill={skin} transform={`rotate(${thumb * -26} ${thumb * 104} -14)`} />
			</g>
		)}
		{scar && (
			<g>
				<path d="M -64,-40 L 70,36" stroke="#c4475a" strokeWidth={13} strokeLinecap="round" />
				{[-42, -14, 14, 42].map((t) => (
					<line key={t} x1={t - 4} y1={-40 + (t + 64) * 0.57 - 18} x2={t + 6} y2={-40 + (t + 64) * 0.57 + 16} stroke="#a33447" strokeWidth={7} strokeLinecap="round" />
				))}
			</g>
		)}
	</g>
);

// ---------------------------------------------------------------- SHOT 1 ---
// Hallway → the lock turns by itself → door opens → close-up of "dad".
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [70, 120, 156]);
	const dadFace = {eyes: 'open' as const, mouth: 'smile' as const, stubble: true, blink: blinkAt(f, 1, 70), look: [0, 0.1] as [number, number]};

	if (i === 1) {
		// extreme close-up: the thumb-turn of the lock rotates by itself
		const rot = lerp(t, 22, 34, 0, 90, Easing.inOut(Easing.cubic));
		const [jx, jy] = shake(t, 30, 6, 8);
		return (
			<Stage cam={{s: lerp(t, 0, 50, 1.0, 1.12) * kick(t), cx: 540, cy: 960, dx: jx, dy: jy}} light={{glow: 0.2, vignette: 0.75}} bg="#5a3620">
				<rect x={-200} y={-200} width={1500} height={2400} fill="#7a4a2c" />
				{Array.from({length: 14}).map((_, k) => (
					<path key={k} d={`M ${-100 + k * 95},-200 C ${-80 + k * 95},500 ${-120 + k * 95},1200 ${-90 + k * 95},2200`} stroke="#6a3f24" strokeWidth={10} fill="none" opacity={0.6} />
				))}
				<rect x={380} y={560} width={320} height={820} rx={60} fill="#c9a24e" />
				<rect x={400} y={580} width={280} height={780} rx={50} fill="#d9b45a" />
				<circle cx={540} cy={820} r={110} fill="#b38a3a" />
				<g transform={`rotate(${rot} 540 820)`}>
					<rect x={505} y={700} width={70} height={240} rx={35} fill="#e8c56a" />
					<rect x={520} y={712} width={14} height={216} rx={7} fill="#fff3c4" opacity={0.6} />
				</g>
				<circle cx={540} cy={1180} r={42} fill="#8a6a2a" />
				<rect x={530} y={1180} width={20} height={70} rx={6} fill="#5a4418" />
				<rect x={600} y={760} width={420} height={36} rx={18} fill="#b8bec6" opacity={0.9} />
				{[0, 1, 2, 3, 4].map((k) => (
					<circle key={k} cx={760 + k * 52} cy={800 + Math.sin(k + t / 6) * 6} r={20} fill="none" stroke="#c9ced6" strokeWidth={9} />
				))}
			</Stage>
		);
	}

	if (i === 3) {
		// close-up of "dad" in the doorway
		return (
			<Stage cam={{s: lerp(t, 0, 24, 1.0, 1.06) * kick(t), cx: 540, cy: 900}} light={{glow: 0.35, vignette: 0.6}} bg="#e8eee0">
				<rect x={-200} y={-200} width={1500} height={2400} fill="url(#stairLight)" />
				<rect x={60} y={-200} width={60} height={2400} fill="#6e3f22" />
				<rect x={960} y={-200} width={60} height={2400} fill="#6e3f22" />
				<rect x={240} y={1060} width={600} height={900} rx={80} fill="#4d5a3a" />
				<Bust kind="dad" id="s1cu" x={540} y={860} scale={3.2} face={{...dadFace, mouth: 'smile', look: [0, 0.25]}} />
				<rect x={330} y={1160} width={70} height={800} rx={20} fill="#3f4a30" />
				<rect x={680} y={1160} width={70} height={800} rx={20} fill="#3f4a30" />
			</Stage>
		);
	}

	// wide hallway (i = 0: door closed, i = 2: door opens)
	const open = i === 2 ? lerp(t, 0, 26, 0, 1, Easing.out(Easing.cubic)) : 0;
	const cam: Cam = i === 0 ? {s: lerp(t, 0, 70, 1.0, 1.1), cx: 540, cy: 960} : {s: lerp(t, 0, 36, 1.12, 1.26) * kick(t), cx: 530, cy: 930};
	const tagPos = toScreen(cam, 520, 1252 - 690);
	const momLook: [number, number] = i === 0 ? [-0.8, 0] : [-1, -0.2];
	return (
		<Stage
			cam={cam}
			light={{glow: 0.4, vignette: 0.5}}
			overlay={i === 2 ? <NameTag x={tagPos.x} y={tagPos.y - 150} title="ПАПА" sub="3 МЕСЯЦА НА ВАХТЕ" at={134} pin={60} /> : null}
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
					eyes: i === 2 ? 'wide' : 'open',
					mouth: i === 2 ? 'o' : 'smile',
					look: momLook,
					blink: blinkAt(f, 3),
					brows: i === 2 ? 'raised' : 'neutral',
				}}
				armL={{target: [-34, -640], kf: 0.5, bend: 1}}
				armR={{target: [34, -632], kf: 0.5, bend: -1}}
				itemL={<Towel rot={10} />}
			/>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 2 ---
// Mom drops the towel → close-up: hands over her mouth, happy tears.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [38]);
	if (i === 0) {
		const towelT = Math.max(0, t - 6);
		const towelY = 0.5 * 2.4 * towelT * towelT;
		return (
			<Stage cam={{s: lerp(t, 0, 38, 1.0, 1.08), cx: 540, cy: 1000}} light={{glow: 0.45, vignette: 0.55}}>
				<Wallpaper id="s2wp" x={-500} y={-500} w={2200} h={3000} />
				<rect x={-40} y={300} width={330} height={1700} fill="#2a1d18" />
				<rect x={250} y={260} width={40} height={1700} fill="#6e3f22" />
				<Person
					kind="mom"
					id="s2mom"
					x={560}
					y={2240}
					scale={1.6}
					breathe={f}
					face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [-0.6, 0]}}
					armL={{target: [-34, -640], kf: 0.5, bend: 1}}
					armR={{target: [34, -632], kf: 0.5, bend: -1}}
					itemL={t < 6 ? <Towel rot={10} /> : undefined}
				/>
				{t >= 6 && (
					<g transform={`translate(${560 - 34 * 1.6 + towelT * 3},${2240 - 640 * 1.6 + towelY}) scale(1.6)`}>
						<Towel rot={10 + towelT * 9} />
					</g>
				)}
			</Stage>
		);
	}
	// close-up with both hands over the mouth
	const sp = SPECS.mom;
	const S = 3.0;
	const hx = 540, hy = 820;
	const mouthY = hy + sp.hh * 0.58 * S;
	const r = sp.armW * 0.56 * S;
	const sob = Math.sin(t / 3.2) * 4;
	return (
		<Stage cam={{s: lerp(t, 0, 82, 1.0, 1.1) * kick(t), cx: 540, cy: 900}} light={{glow: 0.45, vignette: 0.6}}>
			<Wallpaper id="s2cwp" x={-500} y={-500} w={2200} h={3000} />
			<rect x={-40} y={-100} width={250} height={2400} fill="#2a1d18" />
			<rect x={190} y={-100} width={40} height={2400} fill="#6e3f22" />
			<g transform={`translate(0,${sob})`}>
				<Bust kind="mom" id="s2cu" x={hx} y={hy} scale={S} face={{eyes: 'happy', brows: 'worried', mouth: 'none', tears: lerp(t, 6, 60, 0.2, 1)}} />
				{/* forearms coming up from below, hands over the mouth */}
				<g>
					<path d={`M ${hx - 420},${hy + 1300} C ${hx - 380},${mouthY + 380} ${hx - 230},${mouthY + 150} ${hx - 120},${mouthY + 70} L ${hx - 20},${mouthY + 150} C ${hx - 120},${mouthY + 260} ${hx - 200},${mouthY + 500} ${hx - 160},${hy + 1300} Z`} fill={sp.topDark} />
					<path d={`M ${hx + 420},${hy + 1300} C ${hx + 380},${mouthY + 380} ${hx + 230},${mouthY + 150} ${hx + 120},${mouthY + 70} L ${hx + 20},${mouthY + 150} C ${hx + 120},${mouthY + 260} ${hx + 200},${mouthY + 500} ${hx + 160},${hy + 1300} Z`} fill={sp.topDark} />
					{[-1, 1].map((k) => (
						<g key={k}>
							<ellipse cx={hx + k * 66 + 10} cy={mouthY + 26} rx={r * 1.05} ry={r * 1.2} fill="#000" opacity={0.14} transform={`rotate(${k * 18} ${hx + k * 66} ${mouthY + 10})`} />
							<ellipse cx={hx + k * 66} cy={mouthY + 10} rx={r * 1.05} ry={r * 1.2} fill="#e8b48e" stroke="rgba(150,85,55,0.45)" strokeWidth={6} transform={`rotate(${k * 18} ${hx + k * 66} ${mouthY + 10})`} />
						</g>
					))}
				</g>
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 3 ---
// He pats your head: «Привет, парень» → close-up of him → close-up of you.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [46, 86]);
	if (i === 2) {
		const pat = t < 18 ? Math.sin(t / 2.2) * 10 * (1 - t / 18) : 0;
		return (
			<Stage cam={{s: lerp(t, 0, 64, 1.0, 1.1) * kick(t), cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#e9d1a2">
				<Wallpaper id="s3c2wp" x={-300} y={-300} w={1700} h={2600} />
				<rect x={-300} y={-300} width={1700} height={2600} fill="#000" opacity={0.08} />
				<Bust kind="son" id="s3cu2" x={540} y={1010} scale={3.5} face={{eyes: 'wide', brows: 'worried', mouth: 'flat', look: [-0.7, -0.9], pupil: 0.85, blink: blinkAt(t, 3, 70)}} />
				<g transform={`translate(0,${pat})`}>
					<rect x={-200} y={420} width={700} height={190} rx={95} fill="#33506e" transform="rotate(10 150 515)" />
					<rect x={330} y={470} width={64} height={190} fill="#f39a2e" transform="rotate(10 150 515)" />
					<ellipse cx={560} cy={610} rx={115} ry={95} fill="#e9b892" transform="rotate(10 560 610)" />
				</g>
			</Stage>
		);
	}
	if (i === 1) {
		return (
			<Stage cam={{s: lerp(t, 0, 40, 1.0, 1.08) * kick(t), cx: 540, cy: 900}} light={{glow: 0.3, vignette: 0.6}} bg="#e9d1a2">
				<Wallpaper id="s3c1wp" x={-300} y={-300} w={1700} h={2600} />
				<rect x={760} y={-300} width={600} height={2600} fill="#f6f7ef" opacity={0.9} />
				<rect x={740} y={-300} width={30} height={2600} fill="#6e3f22" />
				<Bust kind="dad" id="s3cu1" x={520} y={900} scale={3.4} turn={0.4} face={{eyes: 'open', mouth: 'smile', stubble: true, look: [0.6, 0.7], blink: blinkAt(t, 2, 60)}} />
			</Stage>
		);
	}
	const cam: Cam = {s: lerp(f, 0, 46, 1.0, 1.06), cx: 540, cy: 960};
	const dadX = lerp(f, 0, 28, -160, 300, Easing.out(Easing.quad));
	const walking = f < 28;
	const dadY = 1560;
	const sonX = 770, sonY = 1640;
	const headTop: [number, number] = [sonX - dadX, sonY - 830 - dadY - 10];
	const reach = lerp(f, 28, 40, 0, 1, Easing.out(Easing.cubic));
	const rest: [number, number] = [150, -470];
	const armR: [number, number] = [rest[0] + (headTop[0] - rest[0]) * reach, rest[1] + (headTop[1] - rest[1]) * reach];
	return (
		<Stage cam={cam} light={{glow: 0.35, vignette: 0.5}} overlay={<NameTag x={770} y={650} title="ТЫ" at={4} to={46} pin={40} />}>
			<Hallway id="s3" open={1} />
			<Person kind="son" id="s3son" x={sonX} y={sonY} scale={1.0} breathe={f} face={f < 40 ? {eyes: 'open', mouth: 'smile', look: [-0.9, -0.5], blink: blinkAt(f, 5)} : {eyes: 'closed', mouth: 'smile'}} />
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
// Kitchen: mom serves borscht → close-up: he pushes the plate away → he drinks water.
const tableY = 1400;
const D = {x: 340, y: tableY + 470 * 1.05 - 30, s: 1.05};
const toDad = (wx: number, wy: number): [number, number] => [(wx - D.x) / D.s, (wy - D.y) / D.s];
const M = {x: 790, y: tableY + 460, s: 1.0};
const toMom = (wx: number, wy: number): [number, number] => [(wx - M.x) / M.s, (wy - M.y) / M.s];

export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [90, 125]);

	if (i === 1) {
		// top-down close-up of the table: his hand slides the bowl away
		const push = lerp(t, 6, 26, 0, 1, Easing.out(Easing.cubic));
		const bx = 470 + 330 * push;
		return (
			<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.6}} bg="#e7553f">
				<rect x={-200} y={-200} width={1500} height={2400} fill="#e7553f" />
				{Array.from({length: 18}).map((_, k) => (
					<rect key={'c' + k} x={-200 + k * 90} y={-200} width={45} height={2400} fill="#f4efe6" opacity={0.55} />
				))}
				{Array.from({length: 28}).map((_, k) => (
					<rect key={'r' + k} x={-200} y={-200 + k * 90} width={1500} height={45} fill="#f4efe6" opacity={0.45} />
				))}
				<ellipse cx={bx + 20} cy={1010} rx={250} ry={240} fill="#000" opacity={0.15} />
				<circle cx={bx} cy={990} r={250} fill="#f5f2ea" />
				<circle cx={bx} cy={990} r={190} fill="#e9e4da" />
				<circle cx={bx} cy={990} r={165} fill="#b3262c" />
				<ellipse cx={bx - 30} cy={970} rx={50} ry={38} fill="#fbf4ea" />
				<path d={`M ${bx + 50},${1000} l 30,-8 M ${bx + 70},${1030} l 24,6`} stroke="#3f8a3e" strokeWidth={9} strokeLinecap="round" />
				<g transform={`translate(${bx - 300},${1010}) rotate(-90)`}>
					<BigHand x={0} y={0} s={1.15} thumb={-1} />
				</g>
			</Stage>
		);
	}

	// wide (i = 0) and medium on dad drinking (i = 2)
	const place = lerp(f, 12, 40, 0, 1, Easing.inOut(Easing.cubic));
	const bowl0 = {x: 760, y: 1235};
	const bowl1 = {x: 520, y: tableY + 20};
	const pushed = i === 2;
	const bowlX = pushed ? bowl1.x + 170 : f < 40 ? bowl0.x + (bowl1.x - bowl0.x) * place : bowl1.x;
	const bowlY = f < 40 && !pushed ? bowl0.y + (bowl1.y - bowl0.y) * place - Math.sin(place * Math.PI) * 40 : bowl1.y;

	const lift = i === 2 ? lerp(t, 2, 14, 0, 1) - lerp(t, 44, 54, 0, 1) : 0;
	const mouth = {x: D.x, y: D.y - 1024 * D.s + 0.58 * 104 * D.s};
	const g0 = {x: 190, y: tableY + 26};
	const gX = g0.x + (mouth.x - 46 - g0.x) * lift;
	const gY = g0.y + (mouth.y + 96 - g0.y) * lift;
	const tilt = i === 2 ? lerp(t, 14, 22, 0, 30) - lerp(t, 38, 46, 0, 30) : 0;
	const level = i === 2 ? lerp(t, 16, 40, 0.8, 0.3) : 0.8;

	const holding = i === 0 && f < 44;
	const restBlend = i === 0 ? lerp(f, 44, 56, 0, 1) : 1;
	const mix = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
	const mL: [number, number] = holding ? toMom(bowlX - 70, bowlY - 26) : mix(toMom(bowl1.x - 70, bowl1.y - 26), [-26, -560], restBlend);
	const mR: [number, number] = holding ? toMom(bowlX + 70, bowlY - 26) : mix(toMom(bowl1.x + 70, bowl1.y - 26), [26, -556], restBlend);

	const dadArmL: [number, number] = lift > 0 ? toDad(gX + 6, gY - 44) : toDad(220, tableY + 8);
	const dadArmR: [number, number] = toDad(430, tableY + 8);

	const cam: Cam = i === 0 ? {s: lerp(f, 0, 90, 1.0, 1.08), cx: 540, cy: 1000} : {s: 1.65 * kick(t), cx: 330, cy: 900};
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
				face={{eyes: 'open', mouth: i === 0 ? 'smile' : 'frown', brows: i === 0 ? 'neutral' : 'worried', look: f < 50 ? [-0.6, 0.7] : [-0.9, 0.1], blink: blinkAt(f, 7)}}
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
				face={{eyes: 'open', mouth: 'flat', stubble: true, look: i === 0 ? [0.6, 0.8] : [-0.5, 0.4], blink: blinkAt(f, 4, 80), brows: 'flat'}}
				armL={{target: dadArmL, bend: 1, ku: lift > 0 ? 0.62 : 0.85, kf: lift > 0 ? 0.85 : 0.7}}
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
// Close-up: fork in the RIGHT hand → the wall photo: he eats with the LEFT.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		const tap = t > 8 && t < 16 ? Math.sin(((t - 8) / 8) * Math.PI) * 18 : 0;
		const ring = pop(f, 18, 10);
		return (
			<Stage
				cam={{s: lerp(t, 0, 58, 1.0, 1.1), cx: 540, cy: 1000}}
				light={{glow: 0.3, vignette: 0.6}}
				screen={
					f >= 18 ? (
						<g opacity={ring}>
							<circle cx={330} cy={1010} r={190 * (0.7 + 0.3 * ring)} fill="none" stroke="#ff3b30" strokeWidth={12} />
							<text x={330} y={770} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={76} fill="#fff" stroke="#111" strokeWidth={10} paintOrder="stroke">
								ПРАВАЯ
							</text>
						</g>
					) : null
				}
			>
				<rect x={-200} y={-200} width={1500} height={1000} fill="#33506e" />
				<rect x={-200} y={720} width={1500} height={1500} fill="#e7553f" />
				{Array.from({length: 24}).map((_, k) => (
					<rect key={k} x={-200 + k * 80} y={720} width={40} height={1500} fill="#f4efe6" opacity={0.5} />
				))}
				{Array.from({length: 18}).map((_, k) => (
					<rect key={'r' + k} x={-200} y={740 + k * 80} width={1500} height={40} fill="#f4efe6" opacity={0.4} />
				))}
				<ellipse cx={560} cy={1290} rx={300} ry={110} fill="#f5f2ea" />
				<ellipse cx={560} cy={1280} rx={230} ry={78} fill="#e9e4da" />
				<ellipse cx={560} cy={1280} rx={160} ry={50} fill="#d6b169" />
				<BigHand x={330} y={930 + tap} rot={-10} fork thumb={1} />
				<BigHand x={800} y={900} rot={12} thumb={-1} />
			</Stage>
		);
	}
	const ring = pop(f, 76, 10);
	return (
		<Stage cam={{s: lerp(t, 0, 92, 1.0, 1.14) * kick(t), cx: 540, cy: 1000}} light={{glow: 0.35, vignette: 0.55}}>
			<Wallpaper id="s5wp" x={-600} y={-400} w={2400} h={2800} base="#f0dcb0" line="#dfc490" />
			<g transform="rotate(-2 540 1000)">
				<FamilyPhoto x={170} y={720} w={740} h={640} variant="fork" id="s5ph" highlight={ring} />
			</g>
			<text x={760} y={700} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={76} fill="#fff" stroke="#111" strokeWidth={10} paintOrder="stroke" opacity={ring} transform="rotate(-4 760 700)">
				ЛЕВАЯ
			</text>
		</Stage>
	);
};

export {Towel};
