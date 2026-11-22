// «Каково это — замёрзнуть насмерть» — shots 13–36: the first minute (cold shock, 1-10-1), the limbs give up, the
// shivering at 35°, the lifeboats that do not come back, boat No. 14, 32° — the shivering stops.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Face, Person, solveArm, SPECS} from '../components/Person';
import {folk} from '../w1/kit';
import {BodyMap, Cam, camAt, ColdGrade, Flash, HEAVY, ICE, InWater, INK, Layer, Lifeboat, mix, NightSky, Plaque, RED, rnd, Sea, Stage16, Thermo, YEL} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;

// the open sea at night around you: sky, far debris and heads, a few far lifeboats
const Ocean: React.FC<{id: string; f: number; cam: Cam; hz?: number; heads?: number; boats?: number; debris?: boolean; children?: React.ReactNode}> = ({id, f, cam, hz = 520, heads = 9, boats = 0, debris = true, children}) => (
	<>
		<Layer cam={cam} d={0.15}>
			<NightSky id={id} hz={hz} f={f} />
		</Layer>
		<Layer cam={cam} d={0.45}>
			<Sea id={id} hz={hz} f={f} />
			{Array.from({length: boats}).map((_, k) => (
				<g key={k} transform={`translate(${300 + k * 640 + Math.sin(f / 50 + k) * 8},${hz + 20}) scale(0.22)`}>
					<Lifeboat n={6} seats={12} lantern={1} />
				</g>
			))}
			{Array.from({length: heads}).map((_, k) => (
				<g key={k} transform={`translate(${120 + k * (1680 / Math.max(1, heads)) + Math.sin(f / 30 + k) * 10},${hz + 40 + (k % 3) * 18})`}>
					<circle cx={0} cy={-10} r={9} fill="#2a2a34" />
					<rect x={-14} y={-6} width={28} height={10} rx={4} fill="#cfc8b8" opacity={0.6} />
				</g>
			))}
			{debris && (
				<>
					<rect x={300} y={hz + 80} width={160} height={16} rx={6} fill="#5a4a3a" transform={`rotate(${Math.sin(f / 40) * 4} 380 ${hz + 88})`} />
					<rect x={1400} y={hz + 70} width={110} height={14} rx={6} fill="#5a4a3a" />
				</>
			)}
		</Layer>
		<Layer cam={cam}>{children}</Layer>
	</>
);
const close = (f: number, n: number, s0 = 1.0, s1 = 1.08): Cam => camAt(f, 0, len(n), {s: s0, cx: 960, cy: 560}, {s: s1, cx: 960, cy: 560});

// ============================================================ 13. «Первая минута. Холод бьёт, как удар током.» =====
const Zap: React.FC<{f: number; x: number; y: number; r: number}> = ({f, x, y, r}) => (
	<g>
		{Array.from({length: 8}).map((_, k) => {
			const a = (k / 8) * Math.PI * 2 + (Math.floor(f / 3) % 2) * 0.2;
			const x1 = x + Math.cos(a) * r;
			const y1 = y + Math.sin(a) * r * 0.8;
			const x2 = x + Math.cos(a) * (r + 80);
			const y2 = y + Math.sin(a) * (r + 80) * 0.8;
			return <path key={k} d={`M ${x1},${y1} L ${(x1 + x2) / 2 + 14},${(y1 + y2) / 2 - 10} L ${(x1 + x2) / 2 - 10},${(y1 + y2) / 2 + 8} L ${x2},${y2}`} stroke={ICE} strokeWidth={7} fill="none" strokeLinejoin="round" />;
		})}
	</g>
);
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const n = 13;
	const hit = w(n, 'холод') - 4;
	const zap = f >= hit && f < hit + 30;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s13" f={f} cam={close(f, n, 1.15, 1.25)}>
					<InWater id="z1s13y" f={f} x={960} y={930} k={1.25} face={{eyes: zap ? 'wide' : 'open', pupil: zap ? 0.35 : 0.6, brows: 'worried', mouth: zap ? 'open' : 'o', look: [0, -0.1]}} cold={0.12} breath={zap ? 2.6 : 1} shiver={zap ? 0.5 : 0} />
					{zap && <Zap f={f} x={960} y={600} r={240} />}
				</Ocean>
			</Stage16>
			<Plaque f={f} at={2} x={960} y={190} text="ПЕРВАЯ МИНУТА" color={ICE} size={60} />
			{f >= hit && <Flash f={f - hit} len={8} color="#e8f6ff" />}
			<ColdGrade cold={0.25} />
		</AbsoluteFill>
	);
};

// ============================================================ 14. «…огромный вдох. Это холодовой шок. Если в этот момент голова под водой — ты вдохнёшь воду.» =====
const Lungs: React.FC<{x: number; y: number; s?: number; fill: number; water?: number}> = ({x, y, s = 1, fill, water = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s * (0.86 + 0.14 * fill)})`}>
		<rect x={-12} y={-190} width={24} height={110} rx={10} fill="#cfe0f8" />
		{[-1, 1].map((sd) => (
			<g key={sd}>
				<path d={`M ${sd * 14},-90 C ${sd * 140},-120 ${sd * 170},40 ${sd * 120},140 C ${sd * 80},170 ${sd * 30},150 ${sd * 22},110 Z`} fill="#ff8a9a" stroke="#fff" strokeWidth={6} />
				{water > 0 && <path d={`M ${sd * 26},${140 - 120 * water} L ${sd * 150},${140 - 120 * water} L ${sd * 120},140 C ${sd * 80},170 ${sd * 30},150 ${sd * 22},110 Z`} fill="#3a7ad8" opacity={0.85} />}
			</g>
		))}
	</g>
);
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const n = 14;
	const gasp = interpolate(f, [2, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const shock = w(n, 'шок') - 4;
	const under = w(n, 'под') - 4;
	const water = interpolate(f, [under + 6, under + 30], [0, 0.8], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s14" f={f} cam={close(f, n, 1.12, 1.18)} heads={6}>
					<InWater id="z1s14y" f={f} x={620} y={930} k={1.15} face={{eyes: 'wide', pupil: 0.35, brows: 'raised', mouth: 'open', look: [0.2, -0.2]}} cold={0.15} breath={2.4} />
				</Ocean>
				<g opacity={interpolate(f, [4, 12], [0, 1], clamp)}>
					<rect x={1150} y={150} width={620} height={640} rx={30} fill="#0b1428" stroke="#3a5a8a" strokeWidth={5} />
					<Lungs x={1460} y={470} s={1.25} fill={gasp} water={water} />
					{f >= under && (
						<g transform={`translate(1700,220) scale(${pop(f, under, 11)})`}>
							<path d="M 0,-46 L 46,36 L -46,36 Z" fill={YEL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
							<text x={0} y={26} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill={INK}>
								!
							</text>
						</g>
					)}
				</g>
			</Stage16>
			<Plaque f={f} at={shock} x={1460} y={860 - 30} text="ХОЛОДОВОЙ ШОК" color={ICE} size={50} />
			<ColdGrade cold={0.25} />
		</AbsoluteFill>
	);
};

// ============================================================ 15. «Дыхание срывается… Сердце колотится, давление скачет.» =====
const HeartRate: React.FC<{f: number; x: number; y: number; bpm: number}> = ({f, x, y, bpm}) => {
	const per = (60 / bpm) * 30;
	const ph = (f % per) / per;
	const s = 1 + 0.16 * Math.max(0, 1 - ph * 5);
	return (
		<g transform={`translate(${x},${y})`}>
			<g transform={`scale(${s * 2.4})`}>
				<path d="M 0,26 C -40,0 -36,-30 -14,-30 C -4,-30 0,-20 0,-14 C 0,-20 4,-30 14,-30 C 36,-30 40,0 0,26 Z" fill="#ff3a4a" stroke="#fff" strokeWidth={3} />
			</g>
			<text x={0} y={150} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke">
				{Math.round(bpm)}
			</text>
			<text x={0} y={192} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#ffb0b8">
				УДАРОВ В МИНУТУ
			</text>
		</g>
	);
};
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const n = 15;
	const heart = w(n, 'сердце') - 4;
	const bpm = interpolate(f, [heart, heart + 40], [80, 150], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s15" f={f} cam={close(f, n, 1.1, 1.16)} heads={5}>
					<InWater id="z1s15y" f={f} x={700} y={930} k={1.15} face={{eyes: 'wide', pupil: 0.45, brows: 'worried', mouth: f % 10 < 5 ? 'open' : 'o', look: [0.1, -0.1]}} cold={0.18} breath={3.2} shiver={0.25} />
				</Ocean>
				{f >= heart && (
					<g opacity={interpolate(f, [heart, heart + 8], [0, 1], clamp)}>
						<HeartRate f={f} x={1460} y={380} bpm={bpm} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={3} x={1460} y={170} text="ДЫХАНИЕ СРЫВАЕТСЯ" color={ICE} size={44} to={heart - 4} />
			<ColdGrade cold={0.25} />
		</AbsoluteFill>
	);
};

// ============================================================ 16. «…многие погибают не от переохлаждения, а в эти первые минуты — от шока.» =====
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const n = 16;
	const shock = w(n, 'шока') - 6;
	const grow = interpolate(f, [4, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #12284a 0%, #050a16 80%)'}}>
			<Stage16 bg="transparent">
				{/* the time line of an hour in ice water */}
				<g transform="translate(260,520)">
					<rect x={0} y={-30} width={1400 * grow} height={60} rx={30} fill="#1e2e4e" />
					<rect x={0} y={-30} width={Math.min(1, grow * 4) * 150} height={60} rx={30} fill={RED} />
					<rect x={1050} y={-30} width={Math.max(0, grow * 1400 - 1050)} height={60} rx={0} fill="#4a7ad8" />
					{[0, 10, 30, 60].map((m) => (
						<g key={m} transform={`translate(${(m / 60) * 1400},0)`} opacity={grow}>
							<line x1={0} y1={40} x2={0} y2={70} stroke="#cfe0f8" strokeWidth={5} />
							<text x={0} y={112} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#cfe0f8">
								{m === 60 ? '1 ч' : `${m} мин`}
							</text>
						</g>
					))}
				</g>
			</Stage16>
			<Plaque f={f} at={8} x={1500} y={330} text="ПЕРЕОХЛАЖДЕНИЕ" color="#7aa8f0" size={44} />
			{f >= shock && <Plaque f={f} at={shock} x={420} y={330} text="ШОК!" color={RED} size={80} rot={-4} />}
		</AbsoluteFill>
	);
};

// ============================================================ 17. «…правилу «один — десять — один»…» =====
const RuleCard: React.FC<{f: number; at: number; x: number; big: string; unit: string; text: string; color: string}> = ({f, at, x, big, unit, text, color}) => {
	if (f < at) return null;
	const p = pop(f, at, 12);
	return (
		<div style={{position: 'absolute', left: x, top: 430, transform: `translate(-50%,-50%) scale(${p})`, width: 470, height: 520, background: 'rgba(10,14,24,0.92)', border: `8px solid ${color}`, borderRadius: 32, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.5)'}}>
			<div style={{fontSize: 230, lineHeight: 1, marginTop: 40, color}}>{big}</div>
			<div style={{fontSize: 54, marginTop: 4}}>{unit}</div>
			<div style={{fontSize: 40, marginTop: 36, color: '#b8c4d8'}}>{text}</div>
		</div>
	);
};
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const n = 17;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #142a50 0%, #050a16 80%)'}}>
			<Plaque f={f} at={2} x={960} y={100} text="ПРАВИЛО СПАСАТЕЛЕЙ" color={YEL} size={46} />
			<RuleCard f={f} at={w(n, 'одна') - 4} x={420} big="1" unit="МИНУТА" text="справиться с дыханием" color={ICE} />
			<RuleCard f={f} at={w(n, 'десяти') - 4} x={960} big="10" unit="МИНУТ" text="руки и ноги слушаются" color={YEL} />
			<RuleCard f={f} at={w(n, 'час') - 4} x={1500} big="1" unit="ЧАС" text="до потери сознания" color={RED} />
		</AbsoluteFill>
	);
};

// ============================================================ 18. «Это не точный секундомер, а подсказка… не паникуй. Дыши.» =====
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const n = 18;
	const br = w(n, 'дыши') - 6;
	const calm = interpolate(f, [0, len(n)], [0, 1], clamp);
	const ring = 1 + 0.25 * Math.sin(Math.max(0, f - br) / 16);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s18" f={f} cam={close(f, n, 1.1, 1.2)} heads={6}>
					<InWater id="z1s18y" f={f} x={960} y={930} k={1.15} face={{eyes: calm > 0.6 ? 'narrow' : 'open', brows: calm > 0.5 ? 'neutral' : 'worried', mouth: 'flat', look: [0, 0]}} cold={0.2} breath={lerp(calm, 0, 1, 2.4, 0.5)} />
				</Ocean>
				{f >= br && (
					<g transform="translate(960,560)" opacity={interpolate(f, [br, br + 10], [0, 0.85], clamp)}>
						<circle r={250 * ring} fill="none" stroke={ICE} strokeWidth={8} />
						<circle r={300 * ring} fill="none" stroke={ICE} strokeWidth={3} opacity={0.5} />
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={3} x={960} y={160} text="НЕ ПАНИКУЙ" color={YEL} size={60} to={br - 4} />
			{f >= br && <Plaque f={f} at={br} x={960} y={160} text="ДЫШИ" color={ICE} size={80} />}
			<ColdGrade cold={0.25} />
		</AbsoluteFill>
	);
};

// ============================================================ 19–20. the body: vessels close in the arms and legs =====
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const n = 19;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s19" f={f} cam={close(f, n, 1.0, 1.05)} heads={6}>
					<InWater id="z1s19y" f={f} x={560} y={930} k={1.0} face={{eyes: 'open', brows: 'neutral', mouth: 'flat', look: [0.6, 0]}} cold={0.22} breath={0.6} />
				</Ocean>
				<g opacity={interpolate(f, [8, 22], [0, 1], clamp)}>
					<rect x={1060} y={90} width={700} height={760} rx={34} fill="#0a1226" stroke="#3a5a8a" strokeWidth={5} opacity={0.94} />
					<BodyMap id="z1s19b" f={f} x={1410} y={520} s={0.95} cold={0} beat={1.3} />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'тело') - 4} x={1410} y={170} text="ТЕЛО ВКЛЮЧАЕТ ЗАЩИТУ" color={YEL} size={40} />
			<ColdGrade cold={0.25} />
		</AbsoluteFill>
	);
};
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const n = 20;
	const sq = w(n, 'сжимает') - 4;
	const cold = interpolate(f, [sq, sq + 50], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const warm = w(n, 'тёплая') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #112446 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<BodyMap id="z1s20b" f={f} x={960} y={500} s={1.06} cold={cold} beat={1.3} core={1} brain={1} />
				{f >= warm &&
					[[-1, -0.2], [1, -0.2], [-0.5, 1], [0.5, 1]].map(([sx, sy], k) => {
						const t = ((f - warm) * 1.2 + k * 10) % 40;
						const x0 = 960 + sx * 220;
						const y0 = 500 + sy * 260;
						const x1 = 960 - 12;
						const y1 = 330;
						const p = t / 40;
						return <circle key={k} cx={x0 + (x1 - x0) * p} cy={y0 + (y1 - y0) * p} r={12} fill="#ff6a4a" opacity={1 - p} />;
					})}
			</Stage16>
			<Plaque f={f} at={sq} x={420} y={300} text="СОСУДЫ СЖИМАЮТСЯ" color="#7aa8f0" size={42} />
			{f >= warm && <Plaque f={f} at={warm} x={1500} y={300} text="КРОВЬ — К СЕРДЦУ И МОЗГУ" color="#ff8a6a" size={40} />}
		</AbsoluteFill>
	);
};

// ============================================================ 21. «…пальцы деревенеют. Не получается сжать кулак…» =====
// a hand in the diagram style: the fingers try to close and stop half way; a rope slides away
const DiagramHand: React.FC<{curl: number; cold: number}> = ({curl, cold}) => {
	const fill = mix('#14203e', '#2a3e72', cold);
	const line = mix('#9fd8ff', '#7ab0ff', cold);
	const fingers = [-66, -22, 22, 66];
	return (
		<g>
			<path d="M -100,0 Q -110,140 -40,200 L 60,200 Q 120,140 110,0 Z" fill={fill} stroke={line} strokeWidth={6} strokeLinejoin="round" />
			{fingers.map((x, k) => {
				const L = k === 0 || k === 3 ? 150 : 175;
				return (
					<g key={k} transform={`translate(${x},6) rotate(${-curl * 30 * (k % 2 ? 1 : 0.8)} 0 0)`}>
						<rect x={-19} y={-L} width={38} height={L + 14} rx={19} fill={fill} stroke={line} strokeWidth={6} />
						<rect x={-13} y={-L + 6} width={26} height={30} rx={13} fill="#5a8ae8" opacity={cold * 0.7} />
					</g>
				);
			})}
			<g transform={`translate(-92,120) rotate(${-38 + curl * 18})`}>
				<rect x={-21} y={-118} width={42} height={128} rx={21} fill={fill} stroke={line} strokeWidth={6} />
			</g>
			<path d="M -100,0 Q -110,140 -40,200 L 60,200 Q 120,140 110,0 Z" fill={fill} />
		</g>
	);
};
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const n = 21;
	const stiff = w(n, 'деревенеют') - 4;
	const cold = interpolate(f, [stiff, stiff + 30], [0, 1], clamp);
	const curl = Math.min(0.45, interpolate(f, [w(n, 'сжать') - 4, w(n, 'сжать') + 20], [0, 0.45], clamp)) * (1 - cold * 0.3);
	const rope = interpolate(f, [w(n, 'верёвку') - 4, w(n, 'верёвку') + 40], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #112446 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<path d={`M ${760 + rope * 40},-100 Q ${820 + rope * 120},420 ${860 + rope * 260},${1200}`} stroke="#d8c8a0" strokeWidth={22} fill="none" />
				<g transform="translate(960,620) scale(1.4)">
					<DiagramHand curl={curl} cold={cold} />
				</g>
			</Stage16>
			<Plaque f={f} at={stiff} x={480} y={240} text="ПАЛЬЦЫ ДЕРЕВЕНЕЮТ" color="#7aa8f0" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 22. «Минут через десять грести почти невозможно. Руки становятся чужими.» =====
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const n = 22;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s22" f={f} cam={camAt(f, 0, len(n), {s: 1.0, cx: 960, cy: 600}, {s: 1.06, cx: 960, cy: 600})} heads={7}>
					<InWater id="z1s22y" f={f} x={960} y={900} k={0.95} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0, 0.3]}} cold={0.3} breath={0.7} bob={0.6} />
					{[0, 1].map((k) => {
						const t = (f * 0.25 + k * 20) % 40;
						return <ellipse key={k} cx={960 + (k ? 220 : -220)} cy={905} rx={40 + t * 2} ry={8 + t * 0.4} fill="none" stroke="#9fb8e8" strokeWidth={3} opacity={0.3 * (1 - t / 40)} />;
					})}
				</Ocean>
			</Stage16>
			<Plaque f={f} at={3} x={960} y={190} text="10 МИНУТ" color={YEL} size={64} />
			<Plaque f={f} at={w(n, 'чужими') - 4} x={960} y={300} text="РУКИ СТАНОВЯТСЯ ЧУЖИМИ" color="#7aa8f0" size={40} />
			<ColdGrade cold={0.35} />
		</AbsoluteFill>
	);
};

// ============================================================ 23. «…доплыть до обломка, забраться на него повыше — нужно успеть в первые минуты.» =====
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const n = 23;
	const L = len(n);
	const x = lerp(f, 0, L, 660, 900, Easing.inOut(Easing.sin));
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s23" f={f} cam={camAt(f, 0, L, {s: 1.0, cx: 900, cy: 600}, {s: 1.06, cx: 1000, cy: 600})} heads={6} debris={false}>
					<g transform={`translate(1230,${880 + Math.sin(f / 24) * 6}) rotate(-3)`}>
						<rect x={-200} y={-30} width={400} height={50} rx={10} fill="#7a5a3a" />
						{[-150, -60, 30, 120].map((k) => (
							<line key={k} x1={k} y1={-30} x2={k} y2={20} stroke="#5a4028" strokeWidth={6} />
						))}
					</g>
					<InWater id="z1s23y" f={f} x={x} y={900} k={0.95} face={{eyes: 'open', brows: 'raised', mouth: 'flat', look: [0.8, 0]}} cold={0.3} breath={0.9} />
				</Ocean>
			</Stage16>
			<Plaque f={f} at={w(n, 'доплыть') - 4} x={960} y={190} text="ВЫБРАТЬСЯ ИЗ ВОДЫ — СРАЗУ" color={YEL} size={50} />
			<ColdGrade cold={0.35} />
		</AbsoluteFill>
	);
};

// ============================================================ 24. «Ты видишь перевёрнутую шлюпку… на ней уже нет места.» =====
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const n = 24;
	const L = len(n);
	const full = w(n, 'нет') - 4;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s24" f={f} cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 560}, {s: 1.08, cx: 1000, cy: 560})} heads={5}>
					{/* the overturned boat: its keel above the water, people standing on it */}
					<g transform={`translate(1150,${740 + Math.sin(f / 28) * 5})`}>
						<path d="M -330,0 Q -300,-60 0,-70 Q 300,-60 330,0 Z" fill="#e8e2d2" />
						<path d="M -330,0 Q -300,-60 0,-70 Q 300,-60 330,0" stroke="#8a7a5a" strokeWidth={6} fill="none" />
						{Array.from({length: 11}).map((_, k) => (
							<g key={k} transform={`translate(${-260 + k * 52},-70)`}>
								<rect x={-12} y={-74} width={24} height={74} rx={8} fill={['#2a2a34', '#3a3a46', '#4a3a2a'][k % 3]} />
								<circle cx={0} cy={-86} r={12} fill="#d8b896" />
							</g>
						))}
						<rect x={-400} y={0} width={800} height={200} fill="#0b1634" />
					</g>
					<InWater id="z1s24y" f={f} x={560} y={900} k={0.95} face={{eyes: 'open', brows: f >= full ? 'sad' : 'raised', mouth: f >= full ? 'frown' : 'flat', look: [0.8, -0.2]}} cold={0.35} breath={0.8} />
				</Ocean>
			</Stage16>
			{f >= full && <Plaque f={f} at={full} x={1150} y={300} text="НЕТ МЕСТА" color={RED} size={60} />}
			<ColdGrade cold={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 25. «Тебя трясёт. Это дрожь — твой внутренний обогреватель…» =====
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const n = 25;
	const heat = w(n, 'обогреватель') - 4;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s25" f={f} cam={close(f, n, 1.08, 1.14)} heads={4}>
					<InWater id="z1s25y" f={f} x={620} y={930} k={1.1} face={{eyes: 'narrow', brows: 'worried', mouth: 'tight', look: [0, 0.1]}} cold={0.45} breath={0.8} shiver={1} />
				</Ocean>
				<g opacity={interpolate(f, [heat - 4, heat + 8], [0, 1], clamp)}>
					<rect x={1140} y={100} width={620} height={740} rx={34} fill="#0a1226" stroke="#3a5a8a" strokeWidth={5} opacity={0.94} />
					<BodyMap id="z1s25b" f={f} x={1450} y={540} s={0.85} cold={0.7} shiver={1} beat={1.2} />
				</g>
			</Stage16>
			{f >= heat && <Plaque f={f} at={heat} x={1450} y={170} text="ДРОЖЬ = ОБОГРЕВАТЕЛЬ" color={YEL} size={40} />}
			<ColdGrade cold={0.45} />
		</AbsoluteFill>
	);
};

// ============================================================ 26. «Температура тела — тридцать пять… в двадцать пять раз быстрее воздуха.» =====
export const S26: React.FC = () => {
	const f = useCurrentFrame();
	const n = 26;
	const x25 = w(n, 'двадцать') - 6;
	const v = interpolate(f, [2, 30], [36.6, 35], clamp);
	const showX = f >= x25;
	const p = pop(f, x25, 12);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 45%, #11264a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<Thermo x={360} y={760} v={v} lo={20} hi={40} h={520} />
				{showX && (
					<g transform={`translate(1220,480) scale(${p})`}>
						<rect x={-520} y={-260} width={460} height={420} rx={30} fill="#0e1830" stroke="#cfe0f8" strokeWidth={5} />
						<rect x={60} y={-260} width={460} height={420} rx={30} fill="#0c2a4c" stroke={ICE} strokeWidth={5} />
						<text x={-290} y={-170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#cfe0f8">
							ВОЗДУХ
						</text>
						<text x={290} y={-170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={ICE}>
							ВОДА
						</text>
						<text x={-290} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill="#cfe0f8">
							×1
						</text>
						<text x={290} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={RED}>
							×25
						</text>
						<text x={0} y={230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#b8c4d8">
							КАК БЫСТРО УХОДИТ ТЕПЛО
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={w(n, 'переохлаждение') - 4} x={1220} y={showX ? 120 : 330} text="ЛЁГКОЕ ПЕРЕОХЛАЖДЕНИЕ" color="#f08a4a" size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 27. «Язык заплетается. Слова путаются. Мысли медленные, как сквозь вату.» =====
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const n = 27;
	const fog = interpolate(f, [w(n, 'мысли') - 4, w(n, 'мысли') + 30], [0, 1], clamp);
	const words = ['ГДЕ', 'ЛОД…', 'КА', 'Я…', 'ХОЛ…'];
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s27" f={f} cam={close(f, n, 1.15, 1.22)} heads={3}>
					<InWater id="z1s27y" f={f} x={960} y={930} k={1.15} face={{eyes: 'narrow', brows: 'sad', mouth: 'wobble', look: [0.3, 0.2]}} cold={0.5} breath={0.6} shiver={0.9} tilt={-4} />
				</Ocean>
				{words.map((wd, k) => {
					const at = 6 + k * 9;
					if (f < at) return null;
					const t = f - at;
					return (
						<text key={k} x={700 + k * 130 + Math.sin(t / 9 + k) * 14} y={250 + (k % 2) * 70 + Math.cos(t / 11 + k) * 10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff" opacity={Math.min(1, t / 8) * (1 - fog * 0.6)} transform={`rotate(${(k - 2) * 8} ${700 + k * 130} 260)`}>
							{wd}
						</text>
					);
				})}
			</Stage16>
			{fog > 0 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(220,230,245,0.75) 0%, rgba(220,230,245,0) 60%)', opacity: fog * 0.8}} />}
			<ColdGrade cold={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 28. «А вокруг становится всё тише. Люди перестают кричать.» =====
export const S28: React.FC = () => {
	const f = useCurrentFrame();
	const n = 28;
	const L = len(n);
	const fade = interpolate(f, [0, L], [1, 0.2], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s28" f={f} cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 560}, {s: 0.94, cx: 960, cy: 540})} heads={Math.max(2, Math.round(10 * fade))}>
					{[0, 1, 2, 3].map((k) => (
						<text key={k} x={300 + k * 420} y={620 - (k % 2) * 40} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#cfe0f8" opacity={fade * (0.4 + 0.3 * Math.sin(f / 8 + k))}>
							!!
						</text>
					))}
				</Ocean>
			</Stage16>
			<Plaque f={f} at={w(n, 'тише') - 4} x={960} y={190} text="ТИШИНА" color={ICE} size={60} />
			<ColdGrade cold={0.5} vig={0.7} />
		</AbsoluteFill>
	);
};

// ============================================================ 29. «Неподалёку — шлюпки. В них есть свободные места. Но они не возвращаются.» =====
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const n = 29;
	const free = w(n, 'свободные') - 4;
	const away = interpolate(f, [w(n, 'не') - 4, len(n)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s29" f={f} cam={camAt(f, 0, len(n), {s: 1.0, cx: 960, cy: 560}, {s: 1.05, cx: 960, cy: 560})} heads={0}>
					{[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${380 + k * 580 + away * (k - 1) * 120},${600 - away * 20}) scale(${0.62 - away * 0.12})`}>
							<Lifeboat n={6 + k} seats={14} lantern={1} />
							{f >= free &&
								[2, 6, 10].map((q) => (
									<rect key={q} x={-190 + q * (380 / 13) - 13} y={-110} width={26} height={70} rx={8} fill="none" stroke={YEL} strokeWidth={5} strokeDasharray="8 6" opacity={pop(f, free + q, 10)} />
								))}
						</g>
					))}
				</Ocean>
			</Stage16>
			{f >= free && <Plaque f={f} at={free} x={960} y={190} text="СВОБОДНЫЕ МЕСТА" color={YEL} size={54} />}
			<ColdGrade cold={0.45} />
		</AbsoluteFill>
	);
};

// ============================================================ 30. «Люди в шлюпках боятся: если подплыть к толпе в воде, лодку перевернут.» =====
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const n = 30;
	const tip = w(n, 'перевернут') - 6;
	const rot = f >= tip ? Math.sin(Math.min(1, (f - tip) / 16) * Math.PI) * -14 : 0;
	const faces: Face[] = [
		{eyes: 'wide', brows: 'worried', mouth: 'o', look: [0.6, 0.4], blush: false},
		{eyes: 'open', brows: 'worried', mouth: 'frown', look: [0.7, 0.4], blush: false},
	];
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s30" f={f} cam={camAt(f, 0, len(n), {s: 1.18, cx: 960, cy: 620}, {s: 1.24, cx: 960, cy: 620})} heads={0} debris={false}>
					<g transform={`translate(960,760) rotate(${rot})`}>
						{[0, 1].map((k) => (
							<Person key={k} kind={k ? 'mom' : 'dad'} id={`z1s30p${k}`} x={-90 + k * 170} y={-40 + (k ? 400 : 470) * 0.42} scale={0.42} colors={k ? {top: '#5a4a6a', topDark: '#4a3a5a', hair: '#6a4a2c'} : {top: '#2e2e36', topDark: '#24242c', hair: '#3a2a20'}} plain kneePatch={false} hideLegs breathe={f + k * 9} hat={k ? {type: 'scarf', color: '#7a6a8a'} : {type: 'bowler', color: '#1e1e26'}} face={faces[k]} />
						))}
						<g transform="scale(1.4)">
							<path d="M -250,-40 L 250,-40 Q 270,-38 262,-20 L 230,20 L -230,20 L -262,-20 Q -270,-38 -250,-40 Z" fill="#f2efe6" />
							<rect x={-250} y={-44} width={500} height={10} rx={4} fill="#8a6a4a" />
						</g>
					</g>
					<rect x={-400} y={772} width={2800} height={500} fill="#0b1634" />
					{Array.from({length: 7}).map((_, k) => (
						<g key={k} transform={`translate(${1260 + k * 70},${800 + (k % 2) * 16})`}>
							<circle cx={0} cy={-10} r={16} fill="#2a2a34" />
							<rect x={-20} y={-2} width={40} height={14} rx={5} fill="#cfc8b8" opacity={0.7} />
						</g>
					))}
				</Ocean>
			</Stage16>
			<ColdGrade cold={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 31. «Назад повернула только одна — шлюпка номер четырнадцать офицера Гарольда Лоу.» =====
// a ship's lantern hanging from a fist at (0,0), person units (drawn as an item in the hand, counter-rotated upright)
const LanternBody: React.FC<{f: number}> = ({f}) => (
	<g transform={`rotate(${Math.sin(f / 14) * 5})`}>
		<path d="M -22,44 L 0,0 L 22,44" stroke="#2a2a30" strokeWidth={6} fill="none" strokeLinejoin="round" />
		<rect x={-32} y={40} width={64} height={14} rx={4} fill="#3a3a42" />
		<rect x={-27} y={54} width={54} height={74} rx={10} fill="#ffe2a0" />
		<ellipse cx={0} cy={94} rx={10} ry={18} fill="#fff8e2" />
		{[-14, 14].map((x) => (
			<line key={x} x1={x} y1={56} x2={x} y2={126} stroke="#3a3a42" strokeWidth={4} opacity={0.55} />
		))}
		<rect x={-32} y={126} width={64} height={14} rx={4} fill="#3a3a42" />
	</g>
);
export const S31: React.FC = () => {
	const f = useCurrentFrame();
	const n = 31;
	const L = len(n);
	const go = interpolate(f, [0, L], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const k = 0.42;
	const bx = lerp(go, 0, 1, 1110, 960); // the boat glides left — back to the people in the water
	const bob = Math.sin(f / 22) * 4;
	const row = Math.sin(f / 11);
	// officer Lowe stands at the stern; his right hand (viewer-left) holds the lantern out over the bow
	const LX = 250;
	const LY = 24; // his feet on the bottom boards, hidden by the hull
	const sp = SPECS.dad;
	const sx = -sp.shoulderW / 2 + sp.armW / 2 - 4;
	const sy = -sp.leg - sp.torso + sp.armW / 2;
	const r = sp.armW * 0.56;
	const tgt: [number, number] = [sx - 400, sy - 130];
	const {shoulder, elbow} = solveArm({target: [tgt[0] - sx, tgt[1] - sy]}, sp.upper, sp.fore + r * 0.8, -1);
	const rad = (d: number) => (d * Math.PI) / 180;
	const ex = sx - sp.upper * Math.sin(rad(shoulder));
	const ey = sy + sp.upper * Math.cos(rad(shoulder));
	const hx = ex - (sp.fore - 10) * Math.sin(rad(shoulder + elbow));
	const hy = ey + (sp.fore - 10) * Math.cos(rad(shoulder + elbow));
	const glowX = LX + hx * k;
	const glowY = LY + (hy + 90) * k;
	const seated: {x: number; i: number; who: 'm' | 'f'}[] = [
		{x: -255, i: 6, who: 'f'},
		{x: -105, i: 2, who: 'm'},
		{x: 40, i: 9, who: 'm'},
	];
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s31" f={f} cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 580}, {s: 1.05, cx: 950, cy: 580})} heads={0} debris={false}>
					<defs>
						<radialGradient id="z1s31glow">
							<stop offset="0%" stopColor="#ffd27a" stopOpacity={0.42} />
							<stop offset="100%" stopColor="#ffd27a" stopOpacity={0} />
						</radialGradient>
					</defs>
					<g transform={`translate(${bx},${760 + bob})`}>
						<circle cx={glowX} cy={glowY} r={260} fill="url(#z1s31glow)" />
						{seated.map((p, j) => {
							const lk = folk(1911, p.i, p.who);
							return (
								<Person
									key={j}
									{...lk}
									id={`z1s31p${j}`}
									x={p.x}
									y={-40 + SPECS[lk.kind].leg * k}
									scale={k}
									hideLegs
									breathe={f + j * 9}
									headTurn={-0.35}
									face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [-0.7, 0.2], blush: false}}
								/>
							);
						})}
						<Person
							kind="dad"
							id="z1s31o"
							x={LX}
							y={LY}
							scale={k}
							colors={{top: '#1e2440', topDark: '#181d36', pants: '#1e2440', shoes: '#111216', hair: '#3a2a20'}}
							plain
							kneePatch={false}
							breathe={f}
							hat={{type: 'peak', color: '#1e2440', band: '#c9a64a'}}
							headTurn={-0.5}
							face={{eyes: 'open', brows: 'neutral', mouth: 'tight', look: [-0.8, 0], blush: false}}
							armL={{target: tgt}}
							itemL={
								<g transform={`translate(0,${-(10 + r * 0.8)}) rotate(${-(shoulder + elbow)})`}>
									<LanternBody f={f} />
								</g>
							}
						/>
						<g transform="scale(1.4)">
							<path d="M -250,-40 L 250,-40 Q 270,-38 262,-20 L 230,20 L -230,20 L -262,-20 Q -270,-38 -250,-40 Z" fill="#f2efe6" />
							<rect x={-250} y={-44} width={500} height={10} rx={4} fill="#8a6a4a" />
							<path d="M -230,10 L 230,10" stroke="#c8c2b2" strokeWidth={4} />
						</g>
						<text x={-290} y={10} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#3a3a46">
							14
						</text>
						{[-150, 10].map((ox, j) => (
							<line key={j} x1={ox} y1={-58} x2={ox - 120 + row * 46} y2={70} stroke="#8a6a4a" strokeWidth={10} strokeLinecap="round" />
						))}
					</g>
					<rect x={-400} y={780} width={2800} height={500} fill="#0b1634" />
					<path d={`M -400,780 ${Array.from({length: 30}).map((_, j) => `Q ${-360 + j * 100},${772 + Math.sin(f / 10 + j) * 3} ${-300 + j * 100},780`).join(' ')}`} fill="#0b1634" />
				</Ocean>
			</Stage16>
			<Plaque f={f} at={w(n, 'четырнадцать') - 4} x={620} y={200} text="ШЛЮПКА № 14" color={YEL} size={60} />
			<Plaque f={f} at={w(n, 'гарольда') - 4} x={620} y={300} text="ОФИЦЕР ГАРОЛЬД ЛОУ" color={ICE} size={40} />
			<ColdGrade cold={0.4} />
		</AbsoluteFill>
	);
};

// ============================================================ 32. «…в воде нашли лишь четверых живых. Один из них умер уже в лодке.» =====
export const S32: React.FC = () => {
	const f = useCurrentFrame();
	const n = 32;
	const four = w(n, 'четверых') - 4;
	const one = w(n, 'один') - 4;
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s32" f={f} cam={camAt(f, 0, len(n), {s: 1.0, cx: 960, cy: 600}, {s: 1.05, cx: 960, cy: 600})} heads={0} debris={false}>
					{/* the lantern light over empty floating life jackets */}
					<ellipse cx={960} cy={700} rx={520} ry={120} fill="#ffd27a" opacity={0.08} />
					{Array.from({length: 14}).map((_, k) => (
						<rect key={k} x={260 + rnd(k) * 1400} y={640 + rnd(k + 3) * 200} width={44} height={16} rx={6} fill="#e8e2d2" opacity={0.75} transform={`rotate(${rnd(k + 5) * 60 - 30} ${282 + rnd(k) * 1400} ${648 + rnd(k + 3) * 200})`} />
					))}
					<g transform="translate(960,600) scale(0.7)">
						<Lifeboat n={7} seats={12} lantern={1} f={f + 1} />
					</g>
				</Ocean>
			</Stage16>
			{f >= four && <Plaque f={f} at={four} x={960} y={200} text="4 ЖИВЫХ" color={YEL} size={80} />}
			{f >= one && <Plaque f={f} at={one} x={960} y={330} text="ОДИН УМЕР УЖЕ В ЛОДКЕ" color="#b8c4d8" size={36} />}
			<ColdGrade cold={0.45} vig={0.65} />
		</AbsoluteFill>
	);
};

// ============================================================ 33. «Температура — тридцать два. И случается самое страшное: дрожь прекращается.» =====
export const S33: React.FC = () => {
	const f = useCurrentFrame();
	const n = 33;
	const stop = w(n, 'прекращается') - 4;
	const shiver = f < stop ? 1 : interpolate(f, [stop, stop + 6], [1, 0], clamp);
	const v = interpolate(f, [2, 30], [34, 32], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s33" f={f} cam={close(f, n, 1.12, 1.18)} heads={2}>
					<InWater id="z1s33y" f={f} x={760} y={930} k={1.12} face={{eyes: 'narrow', brows: 'sad', mouth: 'flat', look: [0, 0.2]}} cold={0.7} breath={0.4} shiver={shiver} />
				</Ocean>
				<Thermo x={1500} y={760} v={v} lo={20} hi={40} h={520} />
			</Stage16>
			{f >= stop && <Plaque f={f} at={stop} x={760} y={200} text="ДРОЖЬ ПРЕКРАТИЛАСЬ" color={RED} size={54} />}
			<ColdGrade cold={0.65} />
		</AbsoluteFill>
	);
};

// ============================================================ 34. «Кажется, что стало легче… Обогреватель выключился.» =====
const Heater: React.FC<{on: number}> = ({on}) => (
	<g>
		{[0, 1, 2, 3, 4, 5].map((k) => (
			<rect key={k} x={-210 + k * 72} y={-150} width={56} height={300} rx={22} fill={mix('#4a4e5a', '#ff6a3a', on)} stroke="#1d1d24" strokeWidth={6} />
		))}
		<rect x={-230} y={140} width={460} height={24} rx={10} fill="#3a3e48" />
		{on > 0 &&
			[0, 1, 2].map((k) => (
				<path key={k} d={`M ${-120 + k * 120},-190 q 16,-20 0,-40 q -16,-20 0,-40`} stroke="#ff8a5a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={on} />
			))}
	</g>
);
export const S34: React.FC = () => {
	const f = useCurrentFrame();
	const n = 34;
	const off = w(n, 'выключился') - 4;
	const on = f < off ? 1 : interpolate(f, [off, off + 12], [1, 0], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #11264a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<g transform="translate(960,520) scale(1.3)">
					<Heater on={on} />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'силы') - 4} x={960} y={150} text="СИЛЫ КОНЧИЛИСЬ" color="#7aa8f0" size={54} />
			{f >= off && <Plaque f={f} at={off} x={960} y={850 - 40} text="ОБОГРЕВАТЕЛЬ ВЫКЛЮЧИЛСЯ" color={RED} size={44} />}
		</AbsoluteFill>
	);
};

// ============================================================ 35. «Тебе всё равно. Ни страха, ни боли. Только сонливость и странное спокойствие.» =====
export const S35: React.FC = () => {
	const f = useCurrentFrame();
	const n = 35;
	const sleepy = interpolate(f, [w(n, 'сонливость') - 4, len(n)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Ocean id="z1s35" f={f} cam={camAt(f, 0, len(n), {s: 1.2, cx: 960, cy: 600}, {s: 1.32, cx: 960, cy: 640})} heads={1}>
					<InWater id="z1s35y" f={f} x={960} y={930} k={1.15} face={{eyes: 'narrow', brows: 'flat', mouth: 'flat', look: [0, 0.4], blink: sleepy * 0.55}} cold={0.78} breath={0.3} bob={0.5} tilt={-6} />
				</Ocean>
			</Stage16>
			<ColdGrade cold={0.7} vig={0.7} />
		</AbsoluteFill>
	);
};

// ============================================================ 36. «Мозг путается. Ты не понимаешь, где ты и сколько прошло времени.» =====
export const S36: React.FC = () => {
	const f = useCurrentFrame();
	const n = 36;
	const spin = f * 0.12 + Math.sin(f / 11) * 1.4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0e1e3c 0%, #03060e 80%)'}}>
			<Stage16 bg="transparent">
				<g transform="translate(960,480)" opacity={0.95}>
					<circle r={250} fill="#0e1628" stroke="#7aa8f0" strokeWidth={10} />
					{Array.from({length: 12}).map((_, k) => {
						const a = (k / 12) * Math.PI * 2;
						return <line key={k} x1={Math.cos(a) * 210} y1={Math.sin(a) * 210} x2={Math.cos(a) * 232} y2={Math.sin(a) * 232} stroke="#cfe0f8" strokeWidth={6} />;
					})}
					<line x1={0} y1={0} x2={Math.sin(spin) * 130} y2={-Math.cos(spin) * 130} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
					<line x1={0} y1={0} x2={Math.sin(-spin * 2.3) * 200} y2={-Math.cos(-spin * 2.3) * 200} stroke="#7aa8f0" strokeWidth={8} strokeLinecap="round" />
					<circle r={14} fill="#fff" />
				</g>
				{['?', '?', '?'].map((q, k) => (
					<text key={k} x={560 + k * 400} y={300 + Math.sin(f / 14 + k) * 30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={130} fill="#cfe0f8" opacity={0.5 + 0.3 * Math.sin(f / 9 + k)}>
						{q}
					</text>
				))}
			</Stage16>
			<ColdGrade cold={0.6} vig={0.7} />
		</AbsoluteFill>
	);
};
export const _S2 = {Flash, INK, RED};
