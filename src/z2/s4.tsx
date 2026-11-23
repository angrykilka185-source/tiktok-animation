// «Каково это — умереть от жажды» — shots 49–55: the true story (Mauro Prosperi, 1994: the search from the air, the shrine,
// the bats and the lizards, the nomads in Algeria, minus fifteen kilos, back at the start); 60–62: the water that kills
// (the radio contest, six litres in three hours).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {Chip, Dunes, HEAVY, HeatGrade, HOT, Moon, NOON, Plaque, RED, Sky, Stage16, SunDisk, YEL} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const INK = '#1d1d24';
// Mauro: a blue shirt (not «you»), the same cap and backpack
const MAURO = {
	top: '#2f6ad8',
	topDark: '#2455b4',
	pants: '#2b2d33',
	shoes: '#e8e6e0',
	hair: '#3a2a20',
	skin: '#e2a878',
};
const Mauro: React.FC<React.ComponentProps<typeof Person>> = (p) => <Person {...p} colors={MAURO} cap="#f4efe4" backpack plain kneePatch={false} />;

// ============================================================ 49. not made up: Mauro Prosperi, 1994 =====
export const S49: React.FC = () => {
	const f = useCurrentFrame();
	const n = 49;
	const real = w(n, 'выдумка') - 6;
	const year = w(n, 'тысяча') - 6;
	const name = w(n, 'мауро') - 8;
	return (
		<AbsoluteFill
			style={{
				background: 'radial-gradient(ellipse at 50% 40%, #4a3424 0%, #1c120c 80%)',
			}}
		>
			{f >= year && (
				<div
					style={{
						position: 'absolute',
						left: 960,
						top: 540,
						transform: `translate(-50%,-50%) rotate(-3deg) scale(${pop(f, year, 13)})`,
						width: 1100,
						height: 620,
						background: '#f2e6cc',
						borderRadius: 10,
						boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
					}}
				>
					<svg width={1100} height={620} viewBox="0 0 1100 620" style={{position: 'absolute', inset: 0}}>
						<defs>
							<clipPath id="j49c">
								<rect x={60} y={70} width={380} height={480} />
							</clipPath>
						</defs>
						<rect x={60} y={70} width={380} height={480} fill="#d8c8a6" stroke="#8a7a5a" strokeWidth={6} />
						<g clipPath="url(#j49c)">
							<Mauro
								kind="dad"
								id="j49m"
								x={250}
								y={900}
								scale={0.6}
								breathe={f}
								hideLegs
								face={{
									eyes: 'open',
									mouth: 'smile',
									brows: 'neutral',
									blush: false,
								}}
							/>
						</g>
						<rect x={60} y={70} width={380} height={480} fill="#8a6a3a" opacity={0.18} />
						{[0, 1, 2].map((i) => (
							<rect key={i} x={500 + i * 40} y={80} width={40} height={26} fill={['#2a9a4a', '#ffffff', '#d8282a'][i]} stroke="#8a7a5a" strokeWidth={2} />
						))}
						<text x={500} y={220} fontFamily={HEAVY} fontWeight={900} fontSize={110} fill="#3a2a1a">
							1994
						</text>
					</svg>
					{f >= name && (
						<div
							style={{
								position: 'absolute',
								left: 500,
								top: 270,
								transform: `scale(${pop(f, name, 12)})`,
								transformOrigin: 'left top',
								fontFamily: HEAVY,
								fontWeight: 900,
								color: '#3a2a1a',
							}}
						>
							<div style={{fontSize: 64, lineHeight: 1.05}}>МАУРО</div>
							<div style={{fontSize: 64, lineHeight: 1.05}}>ПРОСПЕРИ</div>
							<div style={{fontSize: 30, marginTop: 14, color: '#7a6a4a'}}>ИТАЛИЯ · ПОЛИЦЕЙСКИЙ</div>
						</div>
					)}
				</div>
			)}
			{f >= real && (
				<div
					style={{
						position: 'absolute',
						left: 960,
						top: 150,
						transform: `translate(-50%,-50%) rotate(-4deg) scale(${pop(f, real, 9)})`,
						border: `10px solid ${RED}`,
						color: RED,
						background: 'rgba(255,248,236,0.95)',
						borderRadius: 16,
						padding: '4px 30px 8px',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 60,
						whiteSpace: 'nowrap',
					}}
				>
					РЕАЛЬНАЯ ИСТОРИЯ
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 50. the storm took him off the course; searched from the air — not seen =====
const Heli: React.FC<{f: number}> = ({f}) => (
	<g>
		<path
			d="M -110,-10 C -110,-60 -40,-70 20,-60 L 90,-40 L 200,-36 L 210,-60 L 230,-60 L 230,0 L 90,-10 C 60,30 -110,30 -110,-10 Z"
			fill="#e8402e"
			stroke={INK}
			strokeWidth={6}
			strokeLinejoin="round"
		/>
		<path d="M -80,-44 C -70,-62 -30,-62 -20,-44 L -20,-14 L -86,-14 Z" fill="#bfe4ff" stroke={INK} strokeWidth={5} />
		<line x1={-150} y1={34} x2={70} y2={34} stroke={INK} strokeWidth={7} strokeLinecap="round" />
		<line x1={-50} y1={20} x2={-50} y2={34} stroke={INK} strokeWidth={6} />
		<line x1={30} y1={20} x2={30} y2={34} stroke={INK} strokeWidth={6} />
		<rect x={-10} y={-80} width={14} height={20} fill={INK} />
		<line x1={-180 * Math.cos(f / 1.3)} y1={-82} x2={180 * Math.cos(f / 1.3)} y2={-82} stroke={INK} strokeWidth={8} strokeLinecap="round" />
	</g>
);
export const S50: React.FC = () => {
	const f = useCurrentFrame();
	const n = 50;
	const air = w(n, 'воздуха') - 14;
	const hx = lerp(f, air, len(n), -300, 2300);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j50" p={NOON} />
				<SunDisk x={300} y={160} r={60} />
				<Dunes p={NOON} />
				{f >= air && (
					<g transform={`translate(${hx},${240 + Math.sin(f / 9) * 10}) scale(0.9)`}>
						<Heli f={f} />
					</g>
				)}
				<Mauro
					kind="dad"
					id="j50m"
					x={1100}
					y={860}
					scale={0.3}
					breathe={f}
					armL={f >= air ? {target: [-160, -1150], bend: 1} : undefined}
					armR={f >= air ? {target: [160 + Math.sin(f / 3) * 30, -1150], bend: -1} : undefined}
					face={{eyes: 'wide', mouth: 'open', brows: 'raised', blush: false}}
				/>
			</Stage16>
			<Plaque f={f} at={4} x={960} y={190} text="БУРЯ СБИЛА С ТРАССЫ" color="#f08a2a" size={50} to={air + 10} />
			<Plaque f={f} at={air + 26} x={960} y={190} text="ИСКАЛИ С ВОЗДУХА — НЕ ЗАМЕТИЛИ" color={RED} size={46} />
			<HeatGrade k={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 51. his own urine; a little shrine in the desert =====
const Shrine: React.FC = () => (
	<g>
		<ellipse cx={0} cy={10} rx={300} ry={26} fill="#000" opacity={0.14} />
		<rect x={-200} y={-220} width={400} height={230} fill="#f4efe4" stroke={INK} strokeWidth={7} />
		<path d="M -150,-220 C -150,-400 150,-400 150,-220 Z" fill="#f4efe4" stroke={INK} strokeWidth={7} />
		<path d="M 0,-220 C 0,-380 150,-380 150,-220 Z" fill="#000" opacity={0.08} />
		<path d="M -50,10 L -50,-90 C -50,-140 50,-140 50,-90 L 50,10 Z" fill="#3a2a1a" />
		<rect x={200} y={-220} width={0} height={0} />
		<rect x={0} y={-220} width={200} height={230} fill="#000" opacity={0.08} />
	</g>
);
export const S51: React.FC = () => {
	const f = useCurrentFrame();
	const n = 51;
	const shrine = w(n, 'святилище') - 8;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j51" p={HOT} />
				<SunDisk x={1600} y={150} r={66} />
				<Dunes p={HOT} />
				{f >= shrine && (
					<g transform={`translate(1100,880) scale(${pop(f, shrine, 12)})`}>
						<Shrine />
					</g>
				)}
				{f < shrine ? (
					<Mauro kind="dad" id="j51w" x={lerp(f, 0, shrine, 560, 1000)} y={lerp(f, 0, shrine, 1000, 1040)} scale={lerp(f, 0, shrine, 0.36, 0.32)} breathe={f} walk={f * 0.18} face={{eyes: 'narrow', mouth: 'flat', brows: 'worried', blush: false, look: [0.6, 0]}} />
				) : (
					<Mauro kind="dad" id="j51m" x={lerp(f, shrine, shrine + 40, 1000, 1060)} y={1040} scale={0.32} breathe={f} back walk={f * 0.2} />
				)}
			</Stage16>
			<Chip f={f} at={2} x={960} y={190} text="ПИЛ СОБСТВЕННУЮ МОЧУ" color="#b8741e" size={48} to={shrine - 2} />
			<Plaque f={f} at={shrine + 8} x={960} y={190} text="МАЛЕНЬКОЕ СВЯТИЛИЩЕ" color={YEL} size={52} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 52. bats, lizards; shade by day, walking at night =====
const Bat: React.FC<{f: number; i: number}> = ({f, i}) => (
	<g transform={`rotate(${180 + Math.sin(f / 9 + i) * 6})`}>
		<path d="M 0,-20 C -30,-50 -70,-40 -90,-10 C -70,-16 -54,-4 -46,10 C -34,0 -20,6 0,16 C 20,6 34,0 46,10 C 54,-4 70,-16 90,-10 C 70,-40 30,-50 0,-20 Z" fill="#3a2a3a" />
		<circle cx={0} cy={4} r={16} fill="#4a3a4a" />
		<circle cx={-6} cy={0} r={3} fill="#fff" />
		<circle cx={6} cy={0} r={3} fill="#fff" />
	</g>
);
const Lizard: React.FC = () => (
	<g>
		<path d="M -120,0 C -60,-20 0,-20 40,-10 C 80,-2 110,-10 130,-30 C 120,0 90,20 40,16 C 0,14 -60,20 -120,0 Z" fill="#8aa84a" stroke={INK} strokeWidth={5} />
		<circle cx={30} cy={-8} r={5} fill={INK} />
		{[-60, -10].map((x) => (
			<g key={x} stroke={INK} strokeWidth={5} strokeLinecap="round">
				<line x1={x} y1={0} x2={x - 16} y2={24} />
				<line x1={x} y1={-10} x2={x - 16} y2={-30} />
			</g>
		))}
	</g>
);
export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const n = 52;
	const bats = w(n, 'летучих') - 6;
	const liz = w(n, 'ящериц') - 6;
	const day = w(n, 'днём') - 6;
	const split = interpolate(f, [day, day + 14], [0, 1], {
		...clamp,
		easing: ease3,
	});
	return (
		<AbsoluteFill style={{background: '#1c120c'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{split < 1 && (
					<g>
						{/* inside the shrine: a dim room, the bright doorway */}
						<rect x={0} y={0} width={1920} height={1080} fill="#7a5c40" />
						<path d="M 760,1080 L 760,560 C 760,420 1160,420 1160,560 L 1160,1080 Z" fill="#f6dca8" />
						<path d="M 760,1080 L 1160,1080 L 1500,1080 L 1160,800 Z" fill="#f6dca8" opacity={0.35} />
						{[0, 1, 2, 3].map((i) =>
							f >= bats + i * 4 ? (
								<g key={i} transform={`translate(${320 + i * 330},${110 + (i % 2) * 50}) scale(${1.7 * pop(f, bats + i * 4, 11)})`}>
									<Bat f={f} i={i} />
								</g>
							) : null,
						)}
						{f >= liz && (
							<g transform={`translate(${lerp(f, liz, liz + 40, 380, 480)},760) scale(${1.4 * pop(f, liz, 11)})`}>
								<Lizard />
							</g>
						)}
						<Mauro
							kind="dad"
							id="j52m"
							x={1500}
							y={1240}
							scale={0.62}
							breathe={f}
							hideLegs
							face={{
								eyes: 'narrow',
								mouth: 'flat',
								brows: 'worried',
								blush: false,
								look: [-0.6, -0.4],
							}}
						/>
					</g>
				)}
				{split > 0 && (
					<g>
						<g transform={`translate(${-960 * (1 - split)},0)`}>
							<rect x={0} y={0} width={960} height={1080} fill="#f6e6c4" />
							<circle cx={760} cy={200} r={70} fill="#fff6d8" />
							<rect x={0} y={760} width={960} height={320} fill="#e7b66e" />
							<path d="M 200,560 L 640,540 L 650,580 L 210,600 Z" fill="#f4efe4" stroke={INK} strokeWidth={6} />
							<line x1={210} y1={600} x2={210} y2={780} stroke="#6a4a2a" strokeWidth={9} />
							<line x1={640} y1={580} x2={640} y2={770} stroke="#6a4a2a" strokeWidth={9} />
							<g transform="translate(600,742) rotate(-90)">
								<Mauro
									kind="dad"
									id="j52d"
									x={0}
									y={0}
									scale={0.3}
									breathe={f}
									face={{
										eyes: 'closed',
										mouth: 'flat',
										brows: 'neutral',
										blush: false,
									}}
								/>
							</g>
						</g>
						<g transform={`translate(${960 * (1 - split)},0)`}>
							<rect x={960} y={0} width={960} height={1080} fill="#0b1638" />
							<Moon x={1680} y={200} />
							<rect x={960} y={760} width={960} height={320} fill="#20274a" />
							<Mauro
								kind="dad"
								id="j52n"
								x={1440}
								y={900}
								scale={0.36}
								breathe={f}
								walk={f * 0.3}
								face={{
									eyes: 'open',
									mouth: 'flat',
									brows: 'neutral',
									blush: false,
								}}
							/>
							<rect x={956} y={0} width={8} height={1080} fill="#fff" />
						</g>
					</g>
				)}
			</svg>
			<Chip f={f} at={bats + 6} x={960} y={300} text="КРОВЬ ЛЕТУЧИХ МЫШЕЙ" color="#8a5ad8" size={44} to={day - 4} />
			<Chip f={f} at={liz + 4} x={430} y={640} text="СЫРЫЕ ЯЩЕРИЦЫ" color="#6a8a2a" size={40} to={day - 4} />
			<Plaque f={f} at={day + 10} x={480} y={190} text="ДНЁМ — В ТЕНИ" color={YEL} size={48} />
			<Plaque f={f} at={day + 16} x={1440} y={190} text="НОЧЬЮ — В ПУТЬ" color="#7fc4ff" size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 53. on the ninth day the nomads found him — in Algeria =====
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const n = 53;
	const alg = w(n, 'алжире') - 8;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j53" p={NOON} />
				<SunDisk x={1500} y={160} r={60} />
				<Dunes p={NOON} />
				{/* the camel and the nomads in blue */}
				<g transform="translate(560,900) scale(1.1)">
					<path
						d="M -160,0 L -150,-140 C -150,-180 -120,-200 -80,-190 C -40,-260 40,-260 60,-190 C 90,-200 130,-200 150,-170 L 210,-230 C 230,-250 260,-240 250,-210 L 200,-130 L 170,-120 L 160,0 L 130,0 L 120,-110 L -100,-110 L -110,0 Z"
						fill="#a8743a"
						stroke={INK}
						strokeWidth={5}
					/>
				</g>
				<Person
					kind="dad"
					id="j53n1"
					x={880}
					y={1000}
					scale={0.42}
					colors={{
						top: '#2a4aa8',
						topDark: '#22408f',
						pants: '#2a4aa8',
						shoes: '#3a2a1a',
						hair: '#2a2a2a',
						skin: '#a8724a',
					}}
					hat={{type: 'scarf', color: '#2a3a8a'}}
					apron="#2a4aa8"
					breathe={f}
					armR={{target: [200, -560], bend: 1}}
					face={{
						eyes: 'open',
						mouth: 'flat',
						brows: 'neutral',
						blush: false,
						look: [0.6, 0.4],
					}}
				/>
				<Person
					kind="dad"
					id="j53n2"
					x={1500}
					y={1010}
					scale={0.4}
					colors={{
						top: '#2a4aa8',
						topDark: '#22408f',
						pants: '#2a4aa8',
						shoes: '#3a2a1a',
						hair: '#2a2a2a',
						skin: '#a8724a',
					}}
					hat={{type: 'scarf', color: '#2a3a8a'}}
					apron="#2a4aa8"
					breathe={f}
					face={{
						eyes: 'open',
						mouth: 'flat',
						brows: 'neutral',
						blush: false,
						look: [-0.6, 0.4],
					}}
				/>
				<g transform="translate(1220,872) rotate(-90)">
					<Mauro
						kind="dad"
						id="j53m"
						x={0}
						y={0}
						scale={0.34}
						breathe={f}
						face={{
							eyes: 'narrow',
							mouth: 'open',
							brows: 'worried',
							blush: false,
						}}
					/>
				</g>
			</Stage16>
			<Chip f={f} at={2} x={420} y={200} text="ДЕНЬ 9" color={RED} size={56} />
			{f >= alg && (
				<div
					style={{
						position: 'absolute',
						left: 1360,
						top: 200,
						transform: `translate(-50%,-50%) scale(${pop(f, alg, 11)})`,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 44,
						color: '#fff',
					}}
				>
					<span
						style={{
							background: '#a8561e',
							padding: '8px 20px',
							borderRadius: 14,
						}}
					>
						МАРОККО
					</span>
					<span style={{color: '#1d1d24', fontSize: 56}}>→</span>
					<span
						style={{
							background: '#3aa86a',
							padding: '8px 20px',
							borderRadius: 14,
						}}
					>
						АЛЖИР
					</span>
				</div>
			)}
			<HeatGrade k={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 54. minus 15 kilos; months to recover =====
export const S54: React.FC = () => {
	const f = useCurrentFrame();
	const n = 54;
	const kg = w(n, 'пятнадцать') - 6;
	const months = w(n, 'месяцев') - 10;
	const val = Math.round(interpolate(f, [kg, kg + 24], [0, 15], clamp));
	return (
		<AbsoluteFill style={{background: '#f4efe6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* the scales */}
				<g transform="translate(600,560)">
					<rect x={-230} y={-60} width={460} height={260} rx={50} fill="#e8eef4" stroke={INK} strokeWidth={8} />
					<rect x={-130} y={-30} width={260} height={110} rx={16} fill="#1d2a1d" />
					<text x={0} y={52} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight={900} fontSize={72} fill="#7aff8a">
						−{val} КГ
					</text>
				</g>
				{/* the hospital bed with a drip */}
				{f >= months && (
					<g transform={`translate(1360,620) scale(${pop(f, months, 12)})`}>
						<rect x={-260} y={0} width={520} height={50} rx={12} fill="#c8d2da" stroke={INK} strokeWidth={6} />
						<rect x={-250} y={-40} width={500} height={50} rx={14} fill="#ffffff" stroke={INK} strokeWidth={6} />
						<rect x={-270} y={-120} width={30} height={240} rx={8} fill="#9aa8b8" stroke={INK} strokeWidth={5} />
						<line x1={300} y1={-260} x2={300} y2={120} stroke="#9aa8b8" strokeWidth={10} />
						<rect x={270} y={-300} width={60} height={90} rx={12} fill="#dff1ff" stroke={INK} strokeWidth={5} />
						<path d="M 300,-210 C 300,-120 200,-100 120,-40" stroke="#7fc4ff" strokeWidth={6} fill="none" />
						<Mauro
							kind="dad"
							id="j54m"
							x={-170}
							y={-10}
							scale={0.22}
							hideLegs
							breathe={f}
							face={{
								eyes: 'closed',
								mouth: 'smile',
								brows: 'neutral',
								blush: false,
							}}
						/>
					</g>
				)}
			</svg>
			<Plaque f={f} at={kg + 4} x={600} y={260} text="ПОХУДЕЛ НА 15+ КГ" color={RED} size={48} />
			<Plaque f={f} at={months + 8} x={1360} y={260} text="НЕСКОЛЬКО МЕСЯЦЕВ" color="#2f86e0" size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 55. years later: at the start again =====
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const n = 55;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j55" p={NOON} />
				<SunDisk x={1600} y={160} r={60} />
				<Dunes p={NOON} />
				{/* the start arch */}
				<g transform="translate(960,980)">
					<rect x={-560} y={-620} width={40} height={620} fill="#3a3a40" />
					<rect x={520} y={-620} width={40} height={620} fill="#3a3a40" />
					<rect x={-580} y={-700} width={1160} height={120} rx={18} fill={RED} stroke={INK} strokeWidth={6} />
					<text x={0} y={-616} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#fff">
						МАРАФОН ПЕСКОВ · СТАРТ
					</text>
				</g>
				{[0, 1, 2, 3].map((i) => (
					<Person
						key={i}
						kind="dad"
						id={`j55r${i}`}
						x={560 + i * 280}
						y={1000}
						scale={0.34}
						colors={{
							top: ['#3aa86a', '#e8352e', '#8a5ad8', '#f2c230'][i],
							topDark: ['#3aa86a', '#e8352e', '#8a5ad8', '#f2c230'][i],
							pants: '#2b2d33',
							shoes: '#e8e6e0',
							hair: '#3a2a20',
							skin: '#e8b48e',
						}}
						cap="#f4efe4"
						backpack
						plain
						kneePatch={false}
						breathe={f + i * 10}
						face={{
							eyes: 'open',
							mouth: 'smile',
							brows: 'neutral',
							blush: false,
						}}
					/>
				))}
				<Mauro
					kind="dad"
					id="j55m"
					x={980}
					y={1060}
					scale={0.5}
					breathe={f}
					armL={{target: [-160, -1150], bend: 1}}
					armR={{target: [160, -1150], bend: -1}}
					face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false}}
				/>
				{/* confetti */}
				{Array.from({length: 30}).map((_, i) => {
					const t = ((f * 3 + i * 37) % 600) / 600;
					return (
						<rect
							key={i}
							x={((i * 157) % 1920) + Math.sin(f / 8 + i) * 20}
							y={-40 + t * 1100}
							width={14}
							height={22}
							fill={['#e8352e', '#f2c230', '#3aa86a', '#2f86e0'][i % 4]}
							transform={`rotate(${f * 6 + i * 40} ${(i * 157) % 1920} ${-40 + t * 1100})`}
						/>
					);
				})}
			</Stage16>
			<Plaque f={f} at={w(n, 'снова') - 4} x={960} y={190} text="СНОВА НА СТАРТЕ" color={YEL} size={60} />
			<HeatGrade k={0.3} />
		</AbsoluteFill>
	);
};

// ============================================================ 60. the twist: water can kill =====
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const n = 60;
	const kill = w(n, 'убить') - 6;
	const glow = interpolate(f, [kill, kill + 16], [0, 1], clamp);
	return (
		<AbsoluteFill
			style={{
				background: 'radial-gradient(ellipse at 50% 45%, #1c2a44 0%, #05070e 75%)',
			}}
		>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<ellipse cx={960} cy={820} rx={200} ry={26} fill="#000" opacity={0.5} />
				<g transform="translate(960,560) scale(1.6)">
					<path d="M -90,-150 L 90,-150 L 70,150 L -70,150 Z" fill="#dff1ff" opacity={0.9} stroke="#9fd8ff" strokeWidth={5} />
					<path d="M -80,-70 L 80,-70 L 70,140 L -70,140 Z" fill="#5fb0f0" opacity={0.9} />
					<path d="M -60,-130 L -40,-130 L -46,130 L -60,130 Z" fill="#fff" opacity={0.4} />
				</g>
				{glow > 0 && (
					<g transform={`translate(1360,420) scale(${pop(f, kill, 9)})`}>
						<path d="M 0,-120 L 120,90 L -120,90 Z" fill={RED} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
						<text x={0} y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={140} fill="#fff">
							!
						</text>
					</g>
				)}
			</svg>
			<Plaque f={f} at={2} x={960} y={160} text="ПОВОРОТ" color={YEL} size={56} to={kill - 4} />
			<Plaque f={f} at={kill + 4} x={960} y={160} text="ВОДА МОЖЕТ УБИТЬ" color={RED} size={60} />
		</AbsoluteFill>
	);
};

// ============================================================ 61. 2007, California: the radio contest =====
export const S61: React.FC = () => {
	const f = useCurrentFrame();
	const n = 61;
	const radio = w(n, 'радиостанция') - 6;
	const more = w(n, 'выпьет') - 6;
	const wc = w(n, 'туалет') - 6;
	const prize = w(n, 'приставку') - 8;
	const onAir = 0.78 + 0.22 * Math.sin(f / 6);
	return (
		<AbsoluteFill style={{background: '#2a2238'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* the studio: a wall of foam, the ON AIR lamp, the microphone */}
				{Array.from({length: 12}).map((_, i) => (
					<g key={i}>
						{Array.from({length: 6}).map((__, j) => (
							<rect key={j} x={i * 170 + (j % 2) * 40} y={j * 180} width={150} height={160} rx={16} fill={(i + j) % 2 ? '#352c48' : '#2f2742'} />
						))}
					</g>
				))}
				<g transform="translate(960,150)">
					<rect x={-180} y={-50} width={360} height={100} rx={20} fill={RED} opacity={onAir} stroke="#000" strokeWidth={6} />
					<text x={0} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff">
						ON AIR
					</text>
				</g>
				{f >= radio && (
					<g transform={`translate(420,700) scale(${pop(f, radio, 11)})`}>
						<rect x={-60} y={-260} width={120} height={200} rx={60} fill="#3a3a44" stroke="#000" strokeWidth={6} />
						{[-200, -170, -140, -110].map((y) => (
							<line key={y} x1={-50} y1={y} x2={50} y2={y} stroke="#5a5a66" strokeWidth={5} />
						))}
						<path d="M -90,-150 C -90,-20 90,-20 90,-150" fill="none" stroke="#5a5a66" strokeWidth={14} />
						<rect x={-10} y={-40} width={20} height={140} fill="#5a5a66" />
						<rect x={-80} y={100} width={160} height={20} rx={8} fill="#5a5a66" />
					</g>
				)}
				{/* the prize: a box with a gamepad */}
				{f >= prize && (
					<g transform={`translate(1480,620) scale(${pop(f, prize, 11)})`}>
						<rect x={-200} y={-150} width={400} height={300} rx={20} fill="#f4f4f8" stroke="#000" strokeWidth={7} />
						<path d="M -110,-30 C -150,-30 -170,60 -130,70 C -100,78 -80,30 -60,30 L 60,30 C 80,30 100,78 130,70 C 170,60 150,-30 110,-30 Z" fill="#3a3a44" />
						<circle cx={90} cy={0} r={12} fill={RED} />
						<circle cx={120} cy={20} r={12} fill="#3aa86a" />
						<rect x={-108} y={-6} width={36} height={12} rx={4} fill="#fff" />
						<rect x={-96} y={-18} width={12} height={36} rx={4} fill="#fff" />
					</g>
				)}
			</svg>
			<Chip f={f} at={2} x={960} y={300} text="2007 · КАЛИФОРНИЯ" color="#8a5ad8" size={46} />
			{f >= more && (
				<div
					style={{
						position: 'absolute',
						left: 960,
						top: 560,
						transform: `translate(-50%,-50%) scale(${pop(f, more, 12)})`,
						background: '#fff8ec',
						border: '8px solid #000',
						borderRadius: 26,
						padding: '22px 40px',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 44,
						color: '#1d1d24',
						textAlign: 'center',
						lineHeight: 1.25,
					}}
				>
					КОНКУРС:
					<br />
					<span style={{color: '#2f86e0'}}>ВЫПЕЙ БОЛЬШЕ ВОДЫ</span>
					{f >= wc && (
						<>
							<br />
							<span style={{color: RED}}>И НЕ ХОДИ В ТУАЛЕТ</span>
						</>
					)}
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 62. six litres in three hours =====
export const S62: React.FC = () => {
	const f = useCurrentFrame();
	const n = 62;
	const six = w(n, 'шести') - 8;
	const three = w(n, 'три') - 6;
	const gone = w(n, 'стало') - 10;
	const dim = interpolate(f, [gone, gone + 30], [0, 0.75], clamp);
	return (
		<AbsoluteFill style={{background: '#f4efe6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{f < six + 10 && (
					<g opacity={interpolate(f, [six - 2, six + 8], [1, 0], clamp)} transform={`translate(960,560) scale(${pop(f, 3, 12)})`}>
						<rect x={-170} y={-220} width={340} height={430} rx={24} fill="#fff" stroke="#1d1d24" strokeWidth={6} />
						<rect x={-140} y={-190} width={280} height={310} rx={12} fill="#ece4f8" />
						<path d="M -116,120 C -116,36 -64,6 0,6 C 64,6 116,36 116,120 Z" fill="#8a5ad8" />
						<path d="M -72,-64 C -78,-150 78,-150 72,-64 C 84,-14 74,36 54,48 L -54,48 C -74,36 -84,-14 -72,-64 Z" fill="#5e3a9e" />
						<circle cx={0} cy={-58} r={58} fill="#8a5ad8" />
						<path d="M -60,-70 C -56,-118 56,-118 60,-70 C 30,-96 -30,-96 -60,-70 Z" fill="#5e3a9e" />
						<text x={0} y={178} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#1d1d24">
							2007
						</text>
					</g>
				)}
				{Array.from({length: 6}).map((_, i) => {
					const at = six + i * 5;
					return f >= at ? (
						<g key={i} transform={`translate(${440 + i * 180},740) scale(${pop(f, at, 11) * 1.5})`}>
							<rect x={-40} y={-200} width={80} height={200} rx={20} fill="#eaf5ff" stroke="#2a6aa8" strokeWidth={5} />
							<rect x={-24} y={-226} width={48} height={30} rx={8} fill="#2f86e0" />
							<text x={0} y={-80} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#2a6aa8">
								1 Л
							</text>
						</g>
					) : null;
				})}
				{f >= three && (
					<g transform={`translate(960,290) scale(${pop(f, three, 11)})`}>
						<rect x={-330} y={-60} width={660} height={120} rx={60} fill="#1d1d24" />
						<text x={0} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff">
							≈ 6 Л ЗА 3 ЧАСА
						</text>
					</g>
				)}
			</svg>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: '#0a0a10',
					opacity: dim,
				}}
			/>
			{dim > 0.3 && (
				<svg
					width={160}
					height={260}
					viewBox="-80 -180 160 260"
					style={{
						position: 'absolute',
						left: 880,
						top: 380,
						opacity: (dim - 0.3) / 0.45,
					}}
				>
					<rect x={-26} y={-60} width={52} height={130} rx={10} fill="#f4efe6" />
					<path d={`M 0,-70 C ${12 + Math.sin(f / 4) * 3},-96 ${10 + Math.sin(f / 5) * 4},-120 0,-150 C -10,-120 -12,-96 0,-70 Z`} fill="#ffcf6a" />
					<line x1={0} y1={-60} x2={0} y2={-72} stroke="#3a3a40" strokeWidth={4} />
				</svg>
			)}
			<Chip f={f} at={2} x={960} y={140} text="ДЖЕННИФЕР СТРЕЙНДЖ · 28 ЛЕТ" color="#8a5ad8" size={42} to={gone - 2} />
		</AbsoluteFill>
	);
};
