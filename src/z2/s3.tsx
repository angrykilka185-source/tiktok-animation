// «Каково это — умереть от жажды» — shots 38–48: the skin and the eyes, the mirage (the lake that runs away, a photo of
// it, how hot air bends the light), the hallucinations, the third day, the heatstroke, the confusion, the kidneys and the
// heart giving up, the scale to 20 %, and the story that ended otherwise.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {camAt, Chip, Dunes, HEAVY, HeatGrade, HOT, Layer, mix, NOON, Plaque, RED, rnd, RUNNER, Shimmer, Sky, Stage16, SunDisk, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const INK = '#1d1d24';

// the «lake» on the horizon: a shimmering band of sky colour
const Lake: React.FC<{f: number; x: number; y: number; w: number; o?: number}> = ({f, x, y, w: ww, o = 1}) => (
	<g opacity={o}>
		<ellipse cx={x} cy={y} rx={ww / 2} ry={26} fill="#8ec6f0" />
		<ellipse cx={x} cy={y - 4} rx={ww / 2.4} ry={12} fill="#cfe8fb" />
		{Array.from({length: 7}).map((_, i) => {
			const yy = y - 18 + i * 6;
			let d = '';
			for (let xx = x - ww / 2.2; xx <= x + ww / 2.2; xx += 24) d += `${xx === x - ww / 2.2 ? 'M' : 'L'} ${xx.toFixed(1)},${(yy + Math.sin(xx / 30 + f / 3 + i) * 2.5).toFixed(1)} `;
			return <path key={i} d={d} stroke="#ffffff" strokeWidth={2.5} fill="none" opacity={0.6} />;
		})}
	</g>
);

// ============================================================ 38. the skin stays in a fold; the eyes sink =====
export const S38: React.FC = () => {
	const f = useCurrentFrame();
	const n = 38;
	const pinch = w(n, 'ущипни') - 6;
	const fold = w(n, 'складка') - 4;
	const eyes = w(n, 'глаза') - 6;
	const up = interpolate(f, [pinch, pinch + 10], [0, 1], {...clamp, easing: ease3});
	const stay = f >= fold;
	const part2 = interpolate(f, [eyes, eyes + 12], [0, 1], clamp);
	const tent = up * 90;
	return (
		<AbsoluteFill style={{background: '#fff4e2'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g opacity={1 - part2}>
					{/* the back of a hand */}
					<path d={`M 300,760 C 300,640 420,600 600,600 L 760,600 C 860,600 900,${600 - tent} 960,${600 - tent} C 1020,${600 - tent} 1060,600 1160,600 L 1500,590 C 1620,586 1700,640 1700,720 C 1700,800 1620,840 1500,840 L 420,840 C 340,840 300,820 300,760 Z`} fill={RUNNER.skin} stroke="#b9784e" strokeWidth={6} />
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={1600} y={600 + i * 56} width={260} height={50} rx={25} fill={RUNNER.skin} stroke="#b9784e" strokeWidth={6} />
					))}
					{[1260, 1360, 1460].map((x) => (
						<ellipse key={x} cx={x} cy={640} rx={26} ry={14} fill="#c98a60" opacity={0.6} />
					))}
					{/* two fingers pinching the skin from above */}
					<g transform={`translate(960,${612 - tent})`}>
						<rect x={-130} y={-360} width={100} height={340} rx={50} fill={mix(RUNNER.skin, '#e8b48e', 0.5)} stroke="#b9784e" strokeWidth={6} transform={`rotate(${stay ? -4 : -14 + up * 10} -80 -20)`} />
						<rect x={30} y={-360} width={100} height={340} rx={50} fill={mix(RUNNER.skin, '#e8b48e', 0.5)} stroke="#b9784e" strokeWidth={6} transform={`rotate(${stay ? 4 : 14 - up * 10} 80 -20)`} />
					</g>
				</g>
				{part2 > 0 && (
					<g opacity={part2}>
						<rect x={0} y={0} width={1920} height={1080} fill="#f3d6a2" />
						<You
							x={960}
							y={1346}
							s={1.6}
							f={f}
							bust
							pack
							dry={0.8}
							face={{eyes: 'narrow', brows: 'worried', mouth: 'flat', look: [0, 0.2]}}
							outer={[-1, 1].map((sd) => (
								<g key={sd} opacity={part2} fill="none" strokeLinecap="round">
									<path d={`M ${sd * 58 - 44},-536 Q ${sd * 58},-498 ${sd * 58 + 44},-536`} stroke="#7a4a5a" strokeWidth={13} opacity={0.5} />
									<path d={`M ${sd * 58 - 30},-506 Q ${sd * 58},-488 ${sd * 58 + 30},-506`} stroke="#7a4a5a" strokeWidth={7} opacity={0.32} />
								</g>
							))}
						/>
					</g>
				)}
			</svg>
			<Plaque f={f} at={pinch + 2} x={960} y={190} text="УЩИПНИ КОЖУ" color="#c98a60" size={52} to={fold - 4} />
			<Plaque f={f} at={fold} x={960} y={190} text="СКЛАДКА НЕ РАСПРАВЛЯЕТСЯ" color={RED} size={50} to={eyes - 2} />
			<Plaque f={f} at={eyes + 8} x={960} y={190} text="ГЛАЗА ЗАПАДАЮТ" color="#8a5ad8" size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 39. a lake on the horizon — it runs away =====
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const n = 39;
	const lake = w(n, 'озеро') - 6;
	const run = w(n, 'бежишь') - 6;
	const away = interpolate(f, [run, len(n)], [0, 1], {...clamp, easing: ease3});
	const lo = interpolate(f, [lake, lake + 14], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j39" p={HOT} />
				<SunDisk x={1600} y={150} r={66} />
				<Dunes p={HOT} only={[0]} />
				<Lake f={f} x={1180 + away * 60} y={622 - away * 6} w={620 * (1 - away * 0.45)} o={lo} />
				<Shimmer f={f} y={640} k={1.4} />
				<Dunes p={HOT} only={[1, 2]} />
				<You x={lerp(f, run, len(n), 700, 820)} y={lerp(f, run, len(n), 1080, 960)} s={lerp(f, run, len(n), 0.8, 0.5)} f={f} walk={f >= run ? f * 0.5 : undefined} back pack />
			</Stage16>
			<Plaque f={f} at={lake + 4} x={960} y={200} text="ОЗЕРО?!" color="#7fc4ff" size={64} to={run + 6} />
			<Plaque f={f} at={run + 16} x={960} y={200} text="ОНО ОТОДВИГАЕТСЯ" color={YEL} size={54} />
			<HeatGrade k={0.7} />
		</AbsoluteFill>
	);
};

// ============================================================ 40. a mirage is no hallucination: it can be photographed =====
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const n = 40;
	const no = w(n, 'галлюцинация') - 6;
	const snap = w(n, 'сфотографировать') - 2;
	const flash = f >= snap ? interpolate(f, [snap, snap + 8], [1, 0], clamp) : 0;
	const phoneIn = interpolate(f, [snap - 22, snap - 8], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j40" p={HOT} />
				<SunDisk x={1600} y={150} r={66} />
				<Dunes p={HOT} only={[0]} />
				<Lake f={f} x={960} y={650} w={520} />
				<Shimmer f={f} y={640} k={1.4} />
				<Dunes p={HOT} only={[1, 2]} />
				{/* a phone comes up and takes a picture of it */}
				{phoneIn > 0 && (
					<g transform={`translate(960,${lerp(phoneIn, 0, 1, 1500, 640)})`}>
						<rect x={-248} y={-408} width={496} height={816} rx={50} fill="none" stroke="#16171b" strokeWidth={26} />
						<rect x={-232} y={-392} width={464} height={784} rx={36} fill="#fff" opacity={flash * 0.85} />
						<rect x={-60} y={-392} width={120} height={26} rx={12} fill="#16171b" />
						<circle cx={0} cy={330} r={42} fill="#fff" opacity={0.85} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="МИРАЖ" color="#7fc4ff" size={64} to={no - 4} />
			<Plaque f={f} at={no} x={960} y={190} text="МИРАЖ ≠ ГАЛЛЮЦИНАЦИЯ" color={YEL} size={54} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};

// ============================================================ 41. how the hot air bends the light =====
export const S41: React.FC = () => {
	const f = useCurrentFrame();
	const n = 41;
	const layer = w(n, 'слой') - 6;
	const bend = w(n, 'изгибает') - 6;
	const sky = w(n, 'кусочек') - 6;
	const ray = interpolate(f, [bend, bend + 30], [0, 1], {...clamp, easing: ease3});
	// the ray: from the sky (upper right) down near the ground and up into the eye (left)
	const P = [
		[1700, 180],
		[1250, 690],
		[760, 700],
		[420, 520],
	];
	const path = `M ${P[0][0]},${P[0][1]} C ${P[1][0]},${P[1][1]} ${P[2][0]},${P[2][1]} ${P[3][0]},${P[3][1]}`;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j41" p={HOT} />
				<rect x={0} y={760} width={1920} height={320} fill="#e0a65e" />
				{/* the layer of hot air */}
				{f >= layer && (
					<g opacity={interpolate(f, [layer, layer + 12], [0, 1], clamp)}>
						<rect x={0} y={660} width={1920} height={100} fill="#ff8a3a" opacity={0.25} />
						{[0, 1, 2].map((i) => {
							let d = '';
							for (let x = 0; x <= 1920; x += 40) d += `${x === 0 ? 'M' : 'L'} ${x},${(690 + i * 24 + Math.sin(x / 60 + f / 4 + i) * 6).toFixed(1)} `;
							return <path key={i} d={d} stroke="#ff8a3a" strokeWidth={4} fill="none" opacity={0.6} />;
						})}
					</g>
				)}
				{/* the eye: your head on the left */}
				<You x={300} y={1000} s={0.85} f={f} bust pack face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0.8, 0.2]}} />
				{/* the bent ray */}
				{ray > 0 && (
					<g>
						<path d={path} stroke="#2f86e0" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="2400" strokeDashoffset={2400 * (1 - ray)} />
						{ray > 0.95 && <path d="M 440,548 L 420,520 L 454,516" stroke="#2f86e0" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
					</g>
				)}
				{/* what you see: the sky down on the sand */}
				{f >= sky && (
					<g opacity={interpolate(f, [sky, sky + 14], [0, 1], clamp)}>
						<Lake f={f} x={1180} y={790} w={460} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={layer + 4} x={960} y={600} text="ГОРЯЧИЙ ВОЗДУХ" color="#ff8a3a" size={42} />
			<Plaque f={f} at={bend + 6} x={1500} y={190} text="СВЕТ ИЗГИБАЕТСЯ" color="#2f86e0" size={48} />
			<Chip f={f} at={sky + 10} x={1180} y={880 - 40} text="НЕБО — «ОЗЕРО»" color="#2f86e0" size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 42. the hallucinations =====
const Fridge: React.FC = () => (
	<g>
		<rect x={-110} y={-220} width={220} height={440} rx={24} fill="#f4f8fc" stroke={INK} strokeWidth={8} />
		<line x1={-110} y1={-60} x2={110} y2={-60} stroke={INK} strokeWidth={6} />
		<rect x={70} y={-180} width={14} height={90} rx={7} fill="#9aa8b8" />
		<rect x={70} y={-20} width={14} height={120} rx={7} fill="#9aa8b8" />
		{[0, 1, 2].map((i) => (
			<g key={i} transform={`translate(${-60 + i * 52},${-110})`}>
				<rect x={-18} y={-34} width={36} height={60} rx={8} fill={['#e8352e', '#2f86e0', '#3aa86a'][i]} />
			</g>
		))}
	</g>
);
const Glass: React.FC = () => (
	<g>
		<path d="M -90,-150 L 90,-150 L 70,150 L -70,150 Z" fill="#dff1ff" stroke={INK} strokeWidth={8} />
		<path d="M -80,-60 L 80,-60 L 70,140 L -70,140 Z" fill="#7fc4ff" />
		<rect x={-50} y={-60} width={50} height={50} rx={8} fill="#fff" opacity={0.8} transform="rotate(14 -25 -35)" />
		<rect x={10} y={-30} width={46} height={46} rx={8} fill="#fff" opacity={0.8} transform="rotate(-10 33 -7)" />
		<rect x={30} y={-210} width={14} height={180} rx={7} fill={RED} transform="rotate(16 37 -120)" />
	</g>
);
const Palm: React.FC = () => (
	<g>
		<path d="M -10,0 C -20,-120 10,-220 0,-320" stroke="#8a5a32" strokeWidth={26} fill="none" strokeLinecap="round" />
		{[-150, -100, -40, 30, 90, 150].map((a) => (
			<path key={a} d="M 0,-320 C 50,-340 110,-320 150,-280" stroke="#3aa86a" strokeWidth={22} fill="none" strokeLinecap="round" transform={`rotate(${a} 0 -320)`} />
		))}
	</g>
);
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const n = 42;
	const hall = w(n, 'галлюцинации') - 8;
	const items = [
		{at: hall, x: 1300, y: 520, c: <Fridge />, s: 1},
		{at: hall + 10, x: 620, y: 470, c: <Glass />, s: 1},
		{at: hall + 20, x: 1620, y: 700, c: <Palm />, s: 1},
	];
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j42" p={HOT} />
				<SunDisk x={300} y={150} r={60} />
				<Dunes p={HOT} />
				<Shimmer f={f} y={640} k={1.4} />
				{items.map((it, i) =>
					f >= it.at ? (
						<g key={i} transform={`translate(${it.x},${it.y + Math.sin(f / 9 + i) * 14}) rotate(${Math.sin(f / 11 + i * 2) * 6}) scale(${pop(f, it.at, 9) * (1 + Math.sin(f / 7 + i) * 0.04)})`} opacity={0.85 + Math.sin(f / 6 + i) * 0.15}>
							{it.c}
						</g>
					) : null,
				)}
				<You x={960} y={1120} s={0.9} f={f} pack dry={0.6} face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [Math.sin(f / 14), -0.4]}} />
			</Stage16>
			<Plaque f={f} at={hall + 4} x={960} y={190} text="ГАЛЛЮЦИНАЦИИ" color="#c96aff" size={60} />
			<HeatGrade k={0.8} />
		</AbsoluteFill>
	);
};

// ============================================================ 43. the third day: ten percent =====
export const S43: React.FC = () => {
	const f = useCurrentFrame();
	const n = 43;
	const cam = camAt(f, 0, len(n), {s: 1, cx: 960, cy: 540}, {s: 1.05, cx: 960, cy: 560});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j43" p={HOT} />
				<Layer cam={cam} d={0.2}>
					<SunDisk x={1300} y={150} r={78} />
				</Layer>
				<Dunes p={HOT} cam={cam} />
				<Shimmer f={f} y={640} k={1.5} />
				<Layer cam={cam}>
					<You x={lerp(f, 0, len(n), 900, 940)} y={1000} s={0.66} f={f} walk={f * 0.14} tilt={16} pack dry={0.9} face={{eyes: 'narrow', brows: 'worried', mouth: 'open', look: [0.3, 0.2]}} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={2} x={960} y={200} text="ДЕНЬ ТРЕТИЙ" color={RED} size={58} />
			<HeatGrade k={1} vig={0.55} />
		</AbsoluteFill>
	);
};

// ============================================================ 44. no sweat, hot dry skin, over 40: heatstroke =====
export const S44: React.FC = () => {
	const f = useCurrentFrame();
	const n = 44;
	const forty = w(n, 'сорок') - 6;
	const stroke = w(n, 'тепловой') - 6;
	const glow = interpolate(f, [4, forty + 10], [0.3, 1], clamp);
	const v = interpolate(f, [forty - 20, forty + 10], [38.5, 40.8], clamp);
	return (
		<AbsoluteFill style={{background: '#2a0e06'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="j44g">
						<stop offset="0%" stopColor="#ffde5a" />
						<stop offset="45%" stopColor="#ff6a2a" />
						<stop offset="100%" stopColor="#2a0e06" stopOpacity={0} />
					</radialGradient>
				</defs>
				<ellipse cx={760} cy={560} rx={520} ry={620} fill="url(#j44g)" opacity={glow} />
				<You x={760} y={1290} s={1.28} f={f} pack dry={1} tilt={6} face={{eyes: 'narrow', brows: 'worried', mouth: 'open', look: [0.2, 0.2]}} outer={<ellipse cx={0} cy={-575} rx={150} ry={124} fill="#ff4a2a" opacity={0.16} />} />
				{/* the thermometer */}
				<g transform="translate(1450,800)">
					<rect x={-34} y={-520} width={68} height={500} rx={34} fill="#f4f8fb" stroke="#000" strokeWidth={8} />
					<rect x={-18} y={-40 - 460 * ((v - 35) / 7)} width={36} height={460 * ((v - 35) / 7) + 20} rx={18} fill={RED} />
					<circle r={60} fill={RED} stroke="#000" strokeWidth={8} />
					<text x={90} y={-40 - 460 * ((v - 35) / 7) + 20} fontFamily={HEAVY} fontWeight={900} fontSize={64} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">
						{v.toFixed(1).replace('.', ',')}°
					</text>
				</g>
			</svg>
			<Chip f={f} at={4} x={1300} y={240} text="ПОТА НЕТ" color="#7a5a3a" size={44} />
			<Chip f={f} at={w(n, 'кожа') - 4} x={1640} y={240} text="КОЖА СУХАЯ" color="#c9603a" size={44} />
			{f >= stroke && (
				<div style={{position: 'absolute', left: 760, top: 178, transform: `translate(-50%,-50%) rotate(-8deg) scale(${pop(f, stroke, 9)})`, border: '12px solid #fff', background: RED, color: '#fff', borderRadius: 20, padding: '8px 34px 14px', fontFamily: HEAVY, fontWeight: 900, fontSize: 86, whiteSpace: 'nowrap', boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>ТЕПЛОВОЙ УДАР</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 45. the mind gets lost; the tongue swells, the lips crack =====
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const n = 45;
	const where = w(n, 'куда') - 6;
	const tongue = w(n, 'язык') - 4;
	const lips = w(n, 'губы') - 4;
	const spin = f * 9 + Math.sin(f / 5) * 40;
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j45" p={HOT} />
				<SunDisk x={1500} y={160} r={70} />
				<Dunes p={HOT} />
				<Shimmer f={f} y={640} k={1.4} />
				<You x={760} y={1100} s={0.9} f={f} pack tilt={Math.sin(f / 10) * 8} dry={1} face={{eyes: 'narrow', brows: 'worried', mouth: 'open', look: [Math.sin(f / 13), 0]}} />
				{/* question marks circling */}
				{[0, 1, 2].map((i) => {
					const a = f / 14 + (i * Math.PI * 2) / 3;
					return (
						<text key={i} x={760 + Math.cos(a) * 230} y={360 + Math.sin(a) * 50} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={90} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">
							?
						</text>
					);
				})}
				{/* the compass goes mad */}
				{f >= where && (
					<g transform={`translate(1350,520) scale(${pop(f, where, 11)})`}>
						<circle r={150} fill="#fff8ec" stroke={INK} strokeWidth={10} />
						<text x={0} y={-100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={INK}>
							С
						</text>
						<g transform={`rotate(${spin})`}>
							<path d="M 0,-110 L 22,0 L -22,0 Z" fill={RED} />
							<path d="M 0,110 L 22,0 L -22,0 Z" fill="#3a3a40" />
						</g>
						<circle r={12} fill={INK} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={where} x={1350} y={190} text="КУДА? ЗАЧЕМ?" color="#c96aff" size={52} />
			<Chip f={f} at={tongue + 2} x={1350} y={790} text="ЯЗЫК РАСПУХ" color="#c9603a" size={42} to={lips - 2} />
			<Chip f={f} at={lips + 2} x={1350} y={790} text="ГУБЫ ПОТРЕСКАЛИСЬ" color={RED} size={42} />
			<HeatGrade k={1} vig={0.55} />
		</AbsoluteFill>
	);
};

// ============================================================ 46. the kidneys give up; the heart can't cope =====
const OUTLINE = 'M 0,-600 C 44,-600 60,-570 60,-530 C 60,-494 44,-470 26,-462 L 26,-446 C 90,-440 120,-420 124,-360 L 136,-200 C 138,-176 112,-170 106,-196 L 92,-330 L 86,-330 L 86,-200 L 74,0 L 22,0 L 10,-180 L -10,-180 L -22,0 L -74,0 L -86,-200 L -86,-330 L -92,-330 L -106,-196 C -112,-170 -138,-176 -136,-200 L -124,-360 C -120,-420 -90,-440 -26,-446 L -26,-462 C -44,-470 -60,-494 -60,-530 C -60,-570 -44,-600 0,-600 Z';
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const n = 46;
	const kid = w(n, 'почки') - 4;
	const heart = w(n, 'сердце') - 6;
	const grey = interpolate(f, [kid, kid + 20], [0, 1], clamp);
	const per = 34;
	const ph = (f % per) / per;
	const beat = ph < 0.18 ? Math.sin((ph / 0.18) * Math.PI) * (0.6 + 0.4 * rnd(Math.floor(f / per))) : 0;
	return (
		<AbsoluteFill style={{background: '#14080a'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform="translate(700,960) scale(1.45)">
					<path d={OUTLINE} fill="#2a1418" stroke="#ff8a7a" strokeWidth={5} opacity={0.9} />
					{[-1, 1].map((sd) => (
						<path key={sd} d={`M ${sd * 20},${-300} C ${sd * 20},${-330} ${sd * 64},${-334} ${sd * 64},${-290} C ${sd * 64},${-246} ${sd * 20},${-244} ${sd * 24},${-268} Z`} fill={mix('#c8463c', '#5a5a62', grey)} stroke="#000" strokeWidth={3} />
					))}
					{grey > 0.5 &&
						[-1, 1].map((sd) => (
							<g key={sd} stroke={RED} strokeWidth={6} strokeLinecap="round">
								<line x1={sd * 42 - 18} y1={-308} x2={sd * 42 + 18} y2={-272} />
								<line x1={sd * 42 + 18} y1={-308} x2={sd * 42 - 18} y2={-272} />
							</g>
						))}
					<g transform={`translate(10,-372) scale(${0.32 * (1 + 0.12 * beat)})`}>
						<path d="M 0,70 C -90,10 -100,-60 -50,-75 C -20,-84 0,-60 0,-40 C 0,-60 20,-84 50,-75 C 100,-60 90,10 0,70 Z" fill="#e0303a" stroke="#000" strokeWidth={8} />
					</g>
				</g>
				{f >= heart && (
					<g transform="translate(1100,560)">
						<rect x={0} y={-150} width={700} height={300} rx={26} fill="#06140c" stroke="#1e4a2e" strokeWidth={6} />
						{(() => {
							const pts: string[] = [];
							for (let i = 0; i <= 640; i += 6) {
								const t = (i / 640) * 120 + f;
								const k = Math.floor(t / 34);
								const off = (rnd(k) - 0.5) * 18;
								const p2 = ((t + off) % 34) / 34;
								let v = 0;
								if (p2 > 0.42 && p2 < 0.46) v = -10;
								else if (p2 > 0.46 && p2 < 0.5) v = 60 * (0.5 + rnd(k + 3) * 0.6);
								else if (p2 > 0.5 && p2 < 0.54) v = -30;
								pts.push(`${30 + i},${-v}`);
							}
							return <polyline points={pts.join(' ')} fill="none" stroke="#5aff8a" strokeWidth={5} />;
						})()}
					</g>
				)}
			</svg>
			<Plaque f={f} at={kid + 6} x={1450} y={250} text="ПОЧКИ СДАЮТСЯ" color="#9aa1ae" size={50} />
			<Plaque f={f} at={heart + 8} x={1450} y={840 - 40} text="СЕРДЦЕ НЕ СПРАВЛЯЕТСЯ" color={RED} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 47. at 15–20 % the body can't live =====
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const n = 47;
	const fif = w(n, 'пятнадцать') - 6;
	const X0 = 260;
	const X1 = 1660;
	const xs = (p: number) => X0 + ((X1 - X0) * p) / 20;
	const marker = interpolate(f, [4, fif], [10, 10], clamp) + interpolate(f, [fif, fif + 24], [0, 7.5], {...clamp, easing: ease3});
	const ZONES: [number, number, string][] = [
		[0, 2, '#5fb0f0'],
		[2, 5, '#f4d04a'],
		[5, 10, '#f08a2a'],
		[10, 15, '#e0463a'],
		[15, 20, '#7a0a10'],
	];
	const TICKS: [number, string][] = [
		[1.5, 'ЖАЖДА'],
		[4, 'ГУСТАЯ КРОВЬ'],
		[7, 'ПЕРЕГРЕВ'],
		[10, 'ТЕПЛОВОЙ УДАР'],
	];
	return (
		<AbsoluteFill style={{background: '#1a0c08'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{ZONES.map(([a, b, c], i) => (
					<rect key={i} x={xs(a)} y={500} width={xs(b) - xs(a)} height={90} fill={c} rx={i === 0 ? 20 : i === 4 ? 20 : 0} />
				))}
				{[0, 5, 10, 15, 20].map((p) => (
					<text key={p} x={xs(p)} y={650} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#fff">
						{p}%
					</text>
				))}
				{TICKS.map(([p, t], i) => (
					<g key={i} opacity={0.9}>
						<line x1={xs(p)} y1={470} x2={xs(p)} y2={400 - (i % 2) * 70} stroke="#fff" strokeWidth={4} />
						<text x={xs(p)} y={386 - (i % 2) * 70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={28} fill="#fff">
							{t}
						</text>
					</g>
				))}
				<g transform={`translate(${xs(marker)},500)`}>
					<path d="M 0,0 L -26,-40 L 26,-40 Z" fill="#fff" />
					<path d="M 0,90 L -26,130 L 26,130 Z" fill="#fff" />
				</g>
			</svg>
			<Plaque f={f} at={fif + 10} x={xs(17.5)} y={260} text="15–20% — СМЕРТЕЛЬНО" color={RED} size={44} />
			<Plaque f={f} at={2} x={960} y={150} text="ПОТЕРЯ ВОДЫ" color="#5fb0f0" size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 48. «Но эта история закончилась по-другому» =====
export const S48: React.FC = () => {
	const f = useCurrentFrame();
	const n = 48;
	const other = w(n, 'по-другому') - 8;
	const t = interpolate(f, [other, other + 16], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill>
			<Stage16 bg="#f6e6c4">
				<Sky id="j48" p={NOON} />
				<SunDisk x={1400} y={170} r={66} />
				<Dunes p={NOON} />
				{/* on the dune ridge: people with a camel */}
				<g opacity={t} transform={`translate(0,${(1 - t) * 30})`}>
					<g transform="translate(1340,705) scale(0.55)">
						<path d="M -160,0 L -150,-140 C -150,-180 -120,-200 -80,-190 C -40,-260 40,-260 60,-190 C 90,-200 130,-200 150,-170 L 210,-230 C 230,-250 260,-240 250,-210 L 200,-130 L 170,-120 L 160,0 L 130,0 L 120,-110 L -100,-110 L -110,0 Z" fill="#5a3a22" />
					</g>
					<Person kind="dad" id="j48n1" x={1230} y={700} scale={0.17} silhouette="#2a3a6a" hat={{type: 'scarf', color: '#2a3a6a'}} />
				</g>
				<g transform="translate(1000,800) rotate(-90)">
					<You x={0} y={0} s={0.44} f={f} pack dry={1} face={{eyes: 'closed', brows: 'worried', mouth: 'open'}} />
				</g>
			</Stage16>
			<Plaque f={f} at={other + 10} x={960} y={200} text="НО…" color={YEL} size={60} />
			<HeatGrade k={0.6} />
		</AbsoluteFill>
	);
};
