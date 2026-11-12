import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {blinkAt, lerp, pop, shake} from '../anim';
import {Bubble, HEAVY} from '../components/Overlays';
import {Bust, Head, Person} from '../components/Person';
import {FamilyPhoto, Kitchen, PlankFloor, Baseboard, Table, Wallpaper, WindowBox} from '../components/Set';
import {Cam, Stage} from '../components/Stage';
import {BigHand} from './S01_S05';

// ---------------------------------------------------------------- SHOT 6 ---
// The son looks at the photo, then at dad. Extreme close-up of the eyes.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const cut = 84;
	if (f < cut) {
		const cam: Cam = {s: lerp(f, 0, cut, 1.05, 1.15), cx: 560, cy: 900};
		const look: [number, number] = f < 30 ? [0.4, 0] : f < 56 ? [0.9, -0.9] : [1, 0.2];
		return (
			<Stage cam={cam} light={{glow: 0.3, vignette: 0.6}}>
				<Kitchen id="s6" floorY={1300} clock={[3, 25]} tick={f / 30} />
				<Person
					kind="dad"
					id="s6dad"
					x={800}
					y={1400 + 470 - 30}
					scale={1.0}
					face={{eyes: 'open', mouth: 'flat', stubble: true, look: [-0.3, 0.6], brows: 'flat', blink: blinkAt(f, 2, 120)}}
					armL={{target: [-60, -440]}}
					armR={{target: [60, -440]}}
				/>
				<Table y={1400} x={480} w={900} />
				<Person
					kind="son"
					id="s6son"
					x={250}
					y={1960}
					scale={1.25}
					breathe={f}
					face={{eyes: 'open', mouth: 'flat', look, brows: f > 56 ? 'worried' : 'neutral', blink: blinkAt(f, 4)}}
				/>
			</Stage>
		);
	}
	const t = f - cut;
	const dart = Math.sin(t / 5) > 0 ? 0.85 : -0.85;
	const look: [number, number] = t < 30 ? [0.9, -0.6] : [dart, 0];
	return (
		<Stage cam={{s: lerp(t, 0, 96, 1, 1.15), cx: 540, cy: 960}} light={{glow: 0.1, vignette: 0.85}} bg="#e9d6b0">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#d9c49c" />
			<Bust kind="son" id="s6bust" x={540} y={1060} scale={5.6} face={{eyes: 'wide', look, brows: 'worried', mouth: 'flat', sweat: lerp(t, 30, 90, 0, 1)}} />
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 7 ---
// He walks to the bathroom by the old route and bumps into the wall.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const [sx, sy] = shake(f, 60, 22, 14);
	const cam: Cam = {s: 1.0, cx: 540, cy: 960, dx: sx, dy: sy};
	const k = lerp(f, 0, 60, 0, 1, Easing.inOut(Easing.sin));
	const walking = f < 60;
	const dy = lerp(f, 60, 64, 0, -14) + lerp(f, 64, 72, 0, 14);
	const y = 2350 + (1400 - 2350) * k + dy;
	const sc = 1.45 + (0.62 - 1.45) * k;
	const x = 420 + (500 - 420) * k;
	const labels = pop(f, 74, 12);
	const stars = f > 60 && f < 100;
	return (
		<Stage
			cam={cam}
			light={{glow: 0.3, vignette: 0.55}}
			screen={
				<g opacity={labels}>
					<text x={500} y={1520} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#fff" stroke="#111" strokeWidth={9} paintOrder="stroke">
						ДВЕРЬ БЫЛА ТУТ
					</text>
					<path d="M 760,1500 Q 860,1480 900,1380" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
					<path d="M 875,1395 L 902,1370 L 915,1408" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
			}
		>
			<Wallpaper id="s7wp" x={-1000} y={-1000} w={3200} h={2400} base="#e9d1a2" line="#d6b983" />
			{/* plastered patch where the old door was */}
			<rect x={330} y={700} width={360} height={700} fill="#f2e6c9" />
			<rect x={330} y={700} width={360} height={700} fill="none" stroke="#c9b48a" strokeWidth={6} strokeDasharray="22 16" />
			{[0, 1, 2].map((i) => (
				<path key={i} d={`M ${360 + i * 100},${760 + i * 120} q 40,-20 80,0`} stroke="#e3d3b0" strokeWidth={14} fill="none" strokeLinecap="round" />
			))}
			{/* the new bathroom door */}
			<rect x={850} y={700} width={330} height={700} fill="#8a5432" />
			<rect x={830} y={680} width={20} height={720} fill="#6e3f22" />
			<rect x={850} y={680} width={330} height={20} fill="#6e3f22" />
			<circle cx={880} cy={1060} r={10} fill="#d8b25a" />
			<rect x={920} y={820} width={140} height={110} rx={14} fill="#3b7fc4" />
			<path d="M 960,850 q 30,-20 60,0 M 990,850 l 0,-14 M 965,870 l -6,22 M 990,870 l 0,26 M 1015,870 l 6,22" stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="none" />
			<PlankFloor y={1400} />
			<Baseboard y={1400} />
			<Person kind="dad" id="s7dad" back x={x} y={y} scale={sc} walk={walking ? f / 4 : undefined} armL={{shoulder: walking ? Math.sin(f / 4) * 12 : 4, elbow: -4}} armR={{shoulder: walking ? -Math.sin(f / 4) * 12 : -4, elbow: 4}} />
			{stars &&
				[0, 1, 2].map((i) => {
					const a = (f - 60) / 8 + (i * Math.PI * 2) / 3;
					return (
						<text key={i} x={x + Math.cos(a) * 120} y={y - 1090 * sc + Math.sin(a) * 30} fontSize={56} textAnchor="middle" fill="#ffd34a" stroke="#111" strokeWidth={4} paintOrder="stroke">
							★
						</text>
					);
				})}
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 8 ---
// Split: photo (scar from the saw) vs now (smooth skin).
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const inL = lerp(f, 0, 12, -600, 0, Easing.out(Easing.cubic));
	const inR = lerp(f, 4, 16, 600, 0, Easing.out(Easing.cubic));
	const mag = lerp(f, 18, 44, 0, 1);
	const mx = 810 + Math.sin(mag * Math.PI * 2) * 60;
	const my = 1080 + Math.cos(mag * Math.PI * 1.5) * 50;
	const panel = (x: number, title: string, scar: boolean, id: string, color: string) => (
		<g>
			<clipPath id={id}>
				<rect x={x} y={760} width={500} height={620} rx={24} />
			</clipPath>
			<rect x={x} y={760} width={500} height={620} rx={24} fill={scar ? '#e6d3ad' : '#dbe7ef'} />
			<g clipPath={`url(#${id})`}>
				<BigHand x={x + 250} y={1150} s={1.25} scar={scar} sleeve={scar ? '#6b7f5a' : '#33506e'} />
				{scar && <rect x={x} y={760} width={500} height={620} fill="#c08a3a" opacity={0.18} />}
			</g>
			<rect x={x} y={760} width={500} height={620} rx={24} fill="none" stroke={color} strokeWidth={10} />
			<rect x={x + 90} y={730} width={320} height={64} rx={14} fill="#111" stroke={color} strokeWidth={5} />
			<text x={x + 250} y={776} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff">
				{title}
			</text>
		</g>
	);
	return (
		<Stage cam={{s: 1, cx: 540, cy: 960}} light={{glow: 0.15, vignette: 0.7}} bg="#3a2a22">
			<rect x={-100} y={-100} width={1300} height={2200} fill="#4a352a" />
			<g transform={`translate(${inL},0)`}>{panel(30, 'НА ФОТО', true, 's8a', '#e7c44a')}</g>
			<g transform={`translate(${inR},0)`}>{panel(550, 'СЕЙЧАС', false, 's8b', '#e0342b')}</g>
			{f > 16 && (
				<g transform={`translate(${mx},${my})`} opacity={lerp(f, 16, 20, 0, 1)}>
					<circle r={90} fill="#ffffff" opacity={0.22} stroke="#2b2b30" strokeWidth={16} />
					<rect x={56} y={56} width={36} height={130} rx={16} fill="#2b2b30" transform="rotate(-45 74 74)" />
				</g>
			)}
		</Stage>
	);
};

// ---------------------------------------------------------------- SHOT 9 ---
// Mom whispers at the sink: "Он просто устал". The son doesn't believe it.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: lerp(f, 0, 150, 1.35, 1.45), cx: 540, cy: 930};
	const lean = lerp(f, 10, 24, 0, 8) - lerp(f, 90, 104, 0, 8);
	return (
		<Stage
			cam={cam}
			light={{glow: 0.3, vignette: 0.6}}
			overlay={<Bubble x={430} y={360} text="Он просто устал..." from={18} to={92} whisper />}
		>
			<Kitchen id="s9" floorY={1300} clock={[3, 40]} tick={f / 30} />
			{/* sink counter */}
			<rect x={80} y={1180} width={920} height={600} fill="#d8c3a0" />
			<rect x={60} y={1150} width={960} height={40} fill="#9c7a54" />
			<rect x={150} y={1150} width={240} height={30} rx={8} fill="#b9c2c9" />
			<path d="M 260,1150 L 260,1060 Q 260,1030 300,1030 L 330,1030" stroke="#aeb7bf" strokeWidth={20} fill="none" strokeLinecap="round" />
			<rect x={318} y={1034} width={14} height={120} fill="#bfe3f5" opacity={0.75 + Math.sin(f) * 0.15} />
			<Person
				kind="mom"
				id="s9mom"
				x={380}
				y={1700}
				scale={0.9}
				headTilt={lean}
				breathe={f}
				face={{eyes: 'open', mouth: f > 18 && f < 90 && f % 6 < 3 ? 'o' : 'tight', brows: 'worried', look: [0.9, 0.2], blink: blinkAt(f, 3)}}
				armL={{target: [-40, -640]}}
				armR={{target: [88, -842], bend: 1}}
			/>
			<Person
				kind="son"
				id="s9son"
				x={760}
				y={1720}
				scale={1.05}
				breathe={f}
				face={{
					eyes: f > 70 ? 'narrow' : 'open',
					mouth: 'tight',
					brows: 'angry',
					look: f < 60 ? [-0.9, 0] : [0.9, -0.1],
					blink: blinkAt(f, 6),
				}}
			/>
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 10 ---
// Night, 23:40. The son in bed; a motionless silhouette in the doorway.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: lerp(f, 0, 180, 1.0, 1.28, Easing.inOut(Easing.quad)), cx: 560, cy: lerp(f, 0, 180, 960, 820)};
	const glint = lerp(f, 110, 130, 0, 1);
	return (
		<Stage cam={cam} light={{glow: 0.0, vignette: 0.85}} bg="#060914">
			<Wallpaper id="s10wp" x={-1000} y={-1000} w={3200} h={2300} base="#2a3a66" line="#24335a" />
			<WindowBox x={-60} y={360} w={260} h={360} sky="url(#skyNight)" curtain={false} />
			<circle cx={120} cy={430} r={34} fill="#f3f0d8" opacity={0.85} />
			{/* doorway with warm light */}
			<rect x={380} y={560} width={360} height={740} fill="url(#doorLight)" />
			<path d="M 380,1300 L 740,1300 L 980,1920 L 160,1920 Z" fill="#f2c66c" opacity={0.28} />
			<Person kind="dad" id="s10dad" x={560} y={1300} scale={0.62} silhouette="#07080d" armL={{shoulder: 2, elbow: 0}} armR={{shoulder: -2, elbow: 0}} />
			<g opacity={glint}>
				<circle cx={542} cy={1300 - 1024 * 0.62} r={4} fill="#fff" />
				<circle cx={578} cy={1300 - 1024 * 0.62} r={4} fill="#fff" />
			</g>
			<rect x={360} y={540} width={20} height={760} fill="#1c1410" />
			<rect x={740} y={540} width={20} height={760} fill="#1c1410" />
			<rect x={360} y={540} width={400} height={20} fill="#1c1410" />
			<PlankFloor y={1300} color="#3a3048" seam="#2d253a" />
			{/* bed */}
			<rect x={-100} y={1460} width={900} height={600} rx={30} fill="#3b2a3a" />
			<ellipse cx={170} cy={1520} rx={200} ry={80} fill="#c9cfe0" />
			<g transform="translate(200,1480) rotate(-80) scale(1.25)">
				<Head kind="son" uid="s10h" face={{eyes: 'wide', look: [0.3, -1], brows: 'worried', mouth: 'none', pupil: 0.8, blush: false}} />
			</g>
			<path d="M -100,1560 Q 300,1500 800,1540 L 800,2000 L -100,2000 Z" fill="#4b5f99" />
			<path d="M -100,1600 Q 300,1540 800,1590" stroke="#6d80b8" strokeWidth={14} fill="none" />
			{/* night tint */}
			<rect x={-1000} y={-1000} width={3200} height={4000} fill="#0b1638" opacity={0.35} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 11 ---
// Dad sits in the dark kitchen staring at the wall. No blinking, no breathing.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const cam: Cam = {s: lerp(f, 0, 180, 1.0, 1.55, Easing.inOut(Easing.quad)), cx: 560, cy: lerp(f, 0, 180, 960, 860)};
	return (
		<Stage cam={cam} light={{glow: 0, vignette: 0.9}} bg="#05070f">
			<Kitchen id="s11" floorY={1300} clock={[3, 17]} tick={0} sky="url(#skyNight)" />
			<Person kind="dad" id="s11dad" x={560} y={1400 + 470 - 30} scale={1.0} face={{eyes: 'stare', mouth: 'flat', stubble: true, pupil: 0.7, brows: 'flat', blush: false}} armL={{target: [-80, -430]}} armR={{target: [80, -430]}} />
			<Table y={1400} />
			<rect x={-1000} y={-1000} width={3200} height={4000} fill="#0a1433" style={{mixBlendMode: 'multiply'}} opacity={0.8} />
			<path d="M 120,340 L 400,340 L 760,1400 L 260,1400 Z" fill="#9fb6ff" opacity={0.12} />
		</Stage>
	);
};
