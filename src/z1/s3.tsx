// «Каково это — замёрзнуть насмерть» — shots 37–59: the strange things cold does on land (paradoxical undressing,
// burrowing), 28°, the Carpathia, the toll, the whisky myth, Anna Bågenholm, the dangerous rescue and the afterdrop.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {BodyMap, Cam, camAt, ColdGrade, Flash, HEAVY, ICE, Iceberg, InWater, INK, Layer, Lifeboat, mix, NightSky, Plaque, RED, rnd, Sea, SERIF, Stage16, Thermo, YEL} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;

// a pictogram person (safety-sign style): pose stand / lie / crawl / reach; origin at the hips
export const Picto: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; pose?: 'stand' | 'reach' | 'crawl'; kick?: number}> = ({x, y, s = 1, rot = 0, color = '#eef4fa', pose = 'stand', kick = 0}) => {
	const cap = (x1: number, y1: number, x2: number, y2: number, wd = 30) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={wd} strokeLinecap="round" />;
	const arms =
		pose === 'reach'
			? [cap(-18, -120, -40, -210), cap(18, -120, 40, -210)]
			: pose === 'crawl'
				? [cap(-18, -120, -30, -210), cap(18, -120, 30, -205)]
				: [cap(-22, -118, -40, -40), cap(22, -118, 40, -40)];
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
			<circle cx={0} cy={-170} r={26} fill={color} />
			{cap(0, -130, 0, -30, 46)}
			{arms}
			{cap(-12, -20, -20 - kick * 12, 70 + kick * 10)}
			{cap(12, -20, 20 + kick * 12, 70 - kick * 10)}
		</g>
	);
};

// ============================================================ 37. «…На суше замерзающие люди нередко… раздеваются.» =====
const Fir: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-14} y={-60} width={28} height={70} fill="#3a2a1e" />
		{[0, 1, 2, 3].map((k) => (
			<g key={k}>
				<path d={`M ${-150 + k * 30},${-50 - k * 110} L 0,${-230 - k * 110} L ${150 - k * 30},${-50 - k * 110} Z`} fill="#1e3a34" />
				<path d={`M ${-150 + k * 30},${-50 - k * 110} Q 0,${-80 - k * 110} ${150 - k * 30},${-50 - k * 110} L ${120 - k * 30},${-70 - k * 110} Q 0,${-100 - k * 110} ${-120 + k * 30},${-70 - k * 110} Z`} fill="#eef4fa" />
			</g>
		))}
	</g>
);
const SnowNight: React.FC<{f: number; cam: Cam; id: string}> = ({f, cam, id}) => (
	<>
		<Layer cam={cam} d={0.15}>
			<NightSky id={id} hz={700} f={f} />
		</Layer>
		<Layer cam={cam} d={0.5}>
			<path d="M -400,640 Q 400,560 1100,620 Q 1700,670 2400,600 L 2400,1400 L -400,1400 Z" fill="#c8d6e8" />
			{[100, 380, 1500, 1800].map((x, k) => (
				<Fir key={k} x={x} y={650} s={0.7} />
			))}
		</Layer>
		<Layer cam={cam}>
			<path d="M -400,820 Q 600,760 1300,800 Q 1900,840 2400,790 L 2400,1500 L -400,1500 Z" fill="#e6eef8" />
			{Array.from({length: 70}).map((_, k) => {
				const y = ((f * (1 + rnd(k) * 1.5) + rnd(k + 4) * 1100) % 1200) - 100;
				return <circle key={k} cx={rnd(k + 8) * 1920 + Math.sin(f / 30 + k) * 20} cy={y} r={2 + rnd(k + 2) * 3} fill="#fff" opacity={0.8} />;
			})}
		</Layer>
	</>
);
export const S37: React.FC = () => {
	const f = useCurrentFrame();
	const n = 37;
	const L = len(n);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 560}, {s: 1.12, cx: 1000, cy: 640});
	const show = w(n, 'раздеваются') - 6;
	return (
		<AbsoluteFill>
			<Stage16 bg="#0a1428">
				<SnowNight f={f} cam={cam} id="z1s37" />
				<Layer cam={cam}>
					{/* footprints and things dropped in the snow: a coat, a scarf, a hat */}
					{Array.from({length: 9}).map((_, k) => (
						<ellipse key={k} cx={400 + k * 90} cy={880 + (k % 2) * 18} rx={18} ry={9} fill="#b8c8dc" />
					))}
					<g opacity={interpolate(f, [show, show + 14], [0, 1], clamp)}>
						<path d="M 980,880 L 1120,870 L 1150,930 L 960,940 Z" fill="#3a3a46" />
						<path d="M 1000,880 L 1030,860 L 1060,880" stroke="#2a2a34" strokeWidth={8} fill="none" />
						<path d="M 1220,900 q 40,-10 80,6 q 30,14 60,0" stroke={RED} strokeWidth={14} fill="none" strokeLinecap="round" />
						<ellipse cx={1420} cy={900} rx={40} ry={14} fill="#5a3a2a" />
						<path d="M 1390,900 Q 1420,862 1450,900 Z" fill="#5a3a2a" />
					</g>
				</Layer>
			</Stage16>
			<Plaque f={f} at={3} x={960} y={190} text="НА СУШЕ" color={ICE} size={56} to={show - 6} />
			{f >= show && <Plaque f={f} at={show} x={960} y={190} text="ЗАМЕРЗАЮЩИЕ… РАЗДЕВАЮТСЯ" color={YEL} size={52} />}
			<ColdGrade cold={0.3} />
		</AbsoluteFill>
	);
};

// ============================================================ 38. «…«парадоксальным раздеванием». …у каждого четвёртого…» =====
export const S38: React.FC = () => {
	const f = useCurrentFrame();
	const n = 38;
	const q = w(n, 'четвёртого') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				{[0, 1, 2, 3].map((k) => {
					const p = pop(f, 6 + k * 5, 11);
					const hi = f >= q && k === 3;
					return <Picto key={k} x={560 + k * 270} y={640} s={1.3 * p} color={hi ? YEL : '#5a6a8a'} />;
				})}
			</Stage16>
			<BigTitle2 f={f} at={2} text="«ПАРАДОКСАЛЬНОЕ РАЗДЕВАНИЕ»" />
			{f >= q && <Plaque f={f} at={q} x={960} y={840 - 30} text="ПРИМЕРНО У КАЖДОГО ЧЕТВЁРТОГО" color={YEL} size={42} />}
		</AbsoluteFill>
	);
};
const BigTitle2: React.FC<{f: number; at: number; text: string; y?: number; size?: number; color?: string}> = ({f, at, text, y = 150, size = 76, color = '#fff'}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${0.8 + 0.2 * pop(f, at, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color, textShadow: '0 6px 0 rgba(0,0,0,0.35), 4px 4px 0 #12141c, -4px 4px 0 #12141c, 4px -4px 0 #12141c, -4px -4px 0 #12141c'}}>
			{text}
		</div>
	);

// ============================================================ 39. «Сжатые сосуды… резко расслабляются, кровь приливает к коже — …кажется, что ему жарко.» =====
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const n = 39;
	const relax = w(n, 'расслабляются') - 4;
	const flush = interpolate(f, [relax, relax + 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const hot = w(n, 'жарко') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<BodyMap id="z1s39b" f={f} x={960} y={500} s={1.06} cold={1 - flush} flush={flush} beat={0.8} />
				{f >= hot && (
					<g transform={`translate(1360,250) scale(${pop(f, hot, 11)})`}>
						<path d="M -170,-80 Q -170,-130 -120,-130 L 120,-130 Q 170,-130 170,-80 L 170,30 Q 170,80 120,80 L -40,80 L -90,130 L -80,80 L -120,80 Q -170,80 -170,30 Z" fill="#fff" stroke={INK} strokeWidth={6} />
						<text x={0} y={-4} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={RED}>
							ЖАРКО?!
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={relax} x={470} y={300} text="СОСУДЫ РАССЛАБИЛИСЬ" color="#ff8a6a" size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 40. «…забиться в укрытие… «терминальным зарыванием»… древний инстинкт: спрятаться.» =====
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const n = 40;
	const L = len(n);
	const go = interpolate(f, [6, L * 0.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const term = w(n, 'терминальным') - 4;
	const inst = w(n, 'инстинкт') - 4;
	return (
		<AbsoluteFill>
			<Stage16 bg="#0a1428">
				<SnowNight f={f} cam={{s: 1, cx: 960, cy: 540}} id="z1s40" />
				{/* a gap under the roots of a big fir: the hiding place */}
				<g transform="translate(1330,840)">
					<Fir x={0} y={0} s={1.25} />
					<path d="M -160,10 Q -60,-90 60,-60 Q 140,-40 160,10 Z" fill="#0e1628" />
				</g>
				<Picto x={lerp(go, 0, 1, 520, 1210)} y={862} s={0.55} rot={90} pose="crawl" color="#5a6a8a" kick={Math.sin(f / 5) * (go < 1 ? 1 : 0)} />
				<path d={`M 560,900 L ${lerp(go, 0, 1, 560, 1150)},900`} stroke={YEL} strokeWidth={6} strokeDasharray="16 12" opacity={0.7} />
			</Stage16>
			{f >= term && <Plaque f={f} at={term} x={960} y={190} text="«ТЕРМИНАЛЬНОЕ ЗАРЫВАНИЕ»" color={YEL} size={52} />}
			{f >= inst && <Plaque f={f} at={inst} x={960} y={300} text="ДРЕВНИЙ ИНСТИНКТ: СПРЯТАТЬСЯ" color={ICE} size={38} />}
			<ColdGrade cold={0.3} />
		</AbsoluteFill>
	);
};

// ============================================================ 41. «Температура — двадцать восемь. Сознание гаснет.» =====
export const S41: React.FC = () => {
	const f = useCurrentFrame();
	const n = 41;
	const L = len(n);
	const fade = w(n, 'сознание') - 4;
	const close = interpolate(f, [fade, L], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const v = interpolate(f, [2, 30], [30, 28], clamp);
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={camAt(f, 0, L, {s: 1.2, cx: 960, cy: 600}, {s: 1.34, cx: 960, cy: 620})} d={0.15}>
					<NightSky id="z1s41" hz={520} f={f} />
				</Layer>
				<Layer cam={camAt(f, 0, L, {s: 1.2, cx: 960, cy: 600}, {s: 1.34, cx: 960, cy: 620})} d={0.45}>
					<Sea id="z1s41" hz={520} f={f} />
				</Layer>
				<Layer cam={camAt(f, 0, L, {s: 1.2, cx: 960, cy: 600}, {s: 1.34, cx: 960, cy: 620})}>
					<InWater id="z1s41y" f={f} x={860} y={930} k={1.15} face={{eyes: 'narrow', brows: 'flat', mouth: 'flat', look: [0, 0.4], blink: Math.min(1, 0.5 + close * 0.5)}} cold={0.95} breath={0.2} bob={0.35} tilt={-10} />
				</Layer>
				<Thermo x={1560} y={760} v={v} lo={10} hi={40} h={520} />
			</Stage16>
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 45% 50%, rgba(0,0,0,0) ${Math.round(60 - close * 50)}%, rgba(0,0,6,0.96) ${Math.round(96 - close * 40)}%)`}} />
			<ColdGrade cold={0.85} vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 42. «Сердце бьётся всё медленнее и сбивается с ритма… может остановиться в любую секунду.» =====
export const ECG: React.FC<{f: number; x: number; y: number; w: number; rate: number; irregular?: number; flat?: number; color?: string}> = ({f, x, y, w: ww, rate, irregular = 0, flat = 0, color = '#5aff8a'}) => {
	const pts: string[] = [];
	const per = 30 / rate;
	for (let i = 0; i <= ww; i += 6) {
		const t = (i / ww) * 90 + f;
		const k = Math.floor(t / per);
		const off = irregular * (rnd(k) - 0.5) * per * 0.9;
		const ph = ((t + off) % per) / per;
		let v = 0;
		if (ph > 0.42 && ph < 0.46) v = -20;
		else if (ph > 0.46 && ph < 0.5) v = 120;
		else if (ph > 0.5 && ph < 0.54) v = -60;
		else if (ph > 0.62 && ph < 0.72) v = 24;
		pts.push(`${x + i},${y - v * (1 - flat)}`);
	}
	return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />;
};
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const n = 42;
	const slow = interpolate(f, [0, len(n)], [1.2, 0.5], clamp);
	const irr = interpolate(f, [w(n, 'ритма') - 6, w(n, 'ритма') + 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#03070c'}}>
			<Stage16 bg="transparent">
				<rect x={160} y={180} width={1600} height={520} rx={30} fill="#06140c" stroke="#1e4a2e" strokeWidth={6} />
				{Array.from({length: 16}).map((_, k) => (
					<line key={k} x1={160 + k * 100} y1={180} x2={160 + k * 100} y2={700} stroke="#0e2a1a" strokeWidth={2} />
				))}
				<ECG f={f} x={200} y={470} w={1520} rate={slow} irregular={irr} />
				<text x={1700} y={250} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontWeight={900} fontSize={60} fill="#5aff8a">
					{Math.round(slow * 60)}
				</text>
			</Stage16>
			<Plaque f={f} at={w(n, 'ниже') - 4} x={960} y={850 - 40} text="НИЖЕ 28° — СЕРДЦЕ МОЖЕТ ОСТАНОВИТЬСЯ" color={RED} size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 43. «В такой ледяной воде до этого момента обычно проходит меньше часа.» =====
export const S43: React.FC = () => {
	const f = useCurrentFrame();
	const n = 43;
	const sweep = interpolate(f, [4, len(n) - 6], [0, 0.92], {...clamp, easing: Easing.out(Easing.cubic)});
	const a = sweep * Math.PI * 2;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #10243f 0%, #03070f 80%)'}}>
			<Stage16 bg="transparent">
				<g transform="translate(960,470)">
					<circle r={260} fill="#0e1628" stroke="#3a5a8a" strokeWidth={10} />
					<path d={`M 0,0 L 0,-250 A 250 250 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * 250},${-Math.cos(a) * 250} Z`} fill="#4a7ad8" opacity={0.6} />
					<line x1={0} y1={0} x2={Math.sin(a) * 230} y2={-Math.cos(a) * 230} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
					<circle r={14} fill="#fff" />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'меньше') - 4} x={960} y={840 - 40} text="МЕНЬШЕ ЧАСА" color={ICE} size={64} />
		</AbsoluteFill>
	);
};

// ============================================================ 44. «В четыре часа утра… «Карпатия». Он подбирает шлюпки. Из воды спасать уже некого.» =====
const Carpathia: React.FC = () => (
	<g>
		<line x1={-420} y1={-60} x2={-400} y2={-360} stroke="#2a2a30" strokeWidth={8} />
		<line x1={380} y1={-60} x2={400} y2={-330} stroke="#2a2a30" strokeWidth={8} />
		<g transform="translate(-20,-180) skewX(-6)">
			<rect x={-50} y={-200} width={100} height={200} fill="#c8402a" />
			<rect x={-50} y={-200} width={100} height={50} fill="#141418" />
		</g>
		<path d="M -300,-120 L 300,-120 L 300,-190 L -280,-190 Z" fill="#f2efe6" />
		{Array.from({length: 24}).map((_, k) => (
			<rect key={k} x={-286 + k * 24} y={-172} width={12} height={14} fill="#3a3a44" />
		))}
		<path d="M -520,-120 L 500,-120 Q 540,-110 530,-30 L 510,30 L -460,30 Q -500,-30 -520,-120 Z" fill="#1a1a20" />
	</g>
);
export const S44: React.FC = () => {
	const f = useCurrentFrame();
	const n = 44;
	const L = len(n);
	const cam = camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.06, cx: 980, cy: 540});
	const dawn = 0.75;
	return (
		<AbsoluteFill>
			<Stage16>
				<Layer cam={cam} d={0.15}>
					<NightSky id="z1s44" hz={620} f={f} dawn={dawn} />
				</Layer>
				<Layer cam={cam} d={0.5}>
					<Sea id="z1s44" hz={620} f={f} dawn={dawn} />
					<g transform="translate(260,640) scale(0.55)">
						<Iceberg />
					</g>
					<g transform="translate(1700,632) scale(0.35)">
						<Iceberg />
					</g>
				</Layer>
				<Layer cam={cam}>
					<g transform={`translate(${lerp(f, 0, L, 1250, 1080)},700) scale(0.75)`}>
						<Carpathia />
					</g>
					{[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${520 + k * 220 + Math.sin(f / 40 + k) * 6},${760 + k * 14}) scale(0.32)`}>
							<Lifeboat n={8} seats={12} f={f + k * 9} />
						</g>
					))}
					<rect x={-400} y={790} width={2800} height={500} fill={mix('#0b1634', '#2a3a58', dawn)} />
				</Layer>
			</Stage16>
			<Plaque f={f} at={3} x={330} y={300} text="04:00" color={YEL} size={70} />
			<Plaque f={f} at={w(n, 'карпатия') - 4} x={960} y={160} text="ПАРОХОД «КАРПАТИЯ»" color={ICE} size={50} />
			{f >= w(n, 'некого') - 4 && <Plaque f={f} at={w(n, 'некого') - 4} x={960} y={280} text="ИЗ ВОДЫ СПАСАТЬ УЖЕ НЕКОГО" color="#b8c4d8" size={40} />}
		</AbsoluteFill>
	);
};

// ============================================================ 45. «…погибли около полутора тысяч… Их убил холод.» =====
const Man: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<circle cx={0} cy={-34} r={9} fill={c} />
		<path d="M -12,-22 L 12,-22 L 10,6 L -10,6 Z" fill={c} />
	</g>
);
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const n = 45;
	const died = w(n, 'погибли') - 4;
	const cold = w(n, 'холод') - 6;
	const cols = 30;
	const rows = 8;
	const total = cols * rows;
	const lost = Math.round(total * (1500 / 2224));
	return (
		<AbsoluteFill style={{background: '#05080f'}}>
			<Stage16 bg="transparent">
				{Array.from({length: total}).map((_, k) => {
					const c = k % cols;
					const r = Math.floor(k / cols);
					const isLost = k >= total - lost;
					const col = f >= died ? (isLost ? '#3a4458' : YEL) : '#cfd8e8';
					return <Man key={k} x={264 + c * 47} y={300 + r * 62} c={col} s={interpolate(f, [2 + (k / total) * 16, 8 + (k / total) * 16], [0, 1], clamp)} />;
				})}
				{f >= cold && (
					<g transform={`translate(960,560) scale(${pop(f, cold, 12)})`} opacity={0.9}>
						{[0, 1, 2].map((q) => (
							<g key={q} transform={`rotate(${q * 60})`}>
								<line x1={0} y1={-200} x2={0} y2={200} stroke={ICE} strokeWidth={22} strokeLinecap="round" />
								<path d="M -50,-150 L 0,-110 L 50,-150 M -50,150 L 0,110 L 50,150" stroke={ICE} strokeWidth={18} fill="none" strokeLinecap="round" />
							</g>
						))}
					</g>
				)}
			</Stage16>
			{f >= died && <Plaque f={f} at={died} x={640} y={180} text="ПОГИБЛИ ≈ 1500" color="#7a8aa8" size={46} />}
			{f >= died && <Plaque f={f} at={died + 8} x={1300} y={180} text="СПАСЛИСЬ ≈ 700" color={YEL} size={46} />}
			{f >= cold && <Plaque f={f} at={cold + 4} x={960} y={850 - 40} text="ИХ УБИЛ ХОЛОД" color={ICE} size={60} />}
		</AbsoluteFill>
	);
};

// ============================================================ 46. «…Шеф-пекарь «Титаника» Чарльз Джофин… выжил благодаря виски.» =====
const Bottle: React.FC = () => (
	<g>
		<rect x={-16} y={-150} width={32} height={50} rx={6} fill="#4a2e1a" />
		<path d="M -16,-100 Q -50,-80 -50,-30 L -50,90 Q -50,110 -30,110 L 30,110 Q 50,110 50,90 L 50,-30 Q 50,-80 16,-100 Z" fill="#6a3a1a" opacity={0.92} />
		<rect x={-40} y={-10} width={80} height={60} rx={6} fill="#f2e2b0" />
	</g>
);
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const n = 46;
	const k = 0.9;
	return (
		<AbsoluteFill>
			<Stage16 bg="#1a1410">
				<rect x={0} y={0} width={1920} height={1080} fill="#2a1e16" />
				{Array.from({length: 12}).map((_, q) => (
					<rect key={q} x={q * 170} y={0} width={160} height={1080} fill="#32241a" />
				))}
				<rect x={0} y={860} width={1920} height={220} fill="#1e140e" />
				<Person kind="dad" id="z1s46b" x={760} y={1160} scale={k} colors={{top: '#f6f3ec', topDark: '#e2ddd2', pants: '#2b2b33', hair: '#4a3a2a', skin: '#efc6a4'}} plain kneePatch={false} moustache="#4a3a2a" hat={{type: 'chef', color: '#ffffff'}} breathe={f} headTurn={0.3} face={{eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0.4, 0], blush: true}} armR={{shoulder: -50, elbow: -130}} itemR={
					<g transform={`translate(0,${-(10 + 62 * 0.56 * 0.8)}) rotate(180) scale(0.75) translate(0,-60)`}>
						<Bottle />
					</g>
				} />
			</Stage16>
			<Plaque f={f} at={w(n, 'пекарь') - 4} x={1360} y={260} text="ЧАРЛЬЗ ДЖОФИН" sub="шеф-пекарь «Титаника»" color={YEL} size={48} />
			<Plaque f={f} at={w(n, 'двух') - 4} x={1360} y={460} text="«2 ЧАСА В ВОДЕ»?" color={ICE} size={44} />
			<ColdGrade vig={0.5} />
		</AbsoluteFill>
	);
};

// ============================================================ 47. «Историки сомневаются в его рассказе. А врачи говорят точно: алкоголь не греет.» =====
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const n = 47;
	const myth = w(n, 'не') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a1e16 0%, #0a0706 80%)'}}>
			<div style={{position: 'absolute', left: 960, top: 420, transform: `translate(-50%,-50%) scale(${pop(f, 3, 12)})`, background: '#f4ecd6', border: '6px solid #8a6a3a', borderRadius: 18, padding: '30px 60px', fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: '#3a2a18', textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.5)'}}>
				ВИСКИ ГРЕЕТ
			</div>
			{f >= myth && (
				<div style={{position: 'absolute', left: 960, top: 420, transform: `translate(-50%,-50%) rotate(-10deg) scale(${f - myth < 6 ? lerp(f - myth, 0, 6, 2.2, 1) : 1})`, opacity: interpolate(f, [myth, myth + 4], [0, 1], clamp), border: `12px solid ${RED}`, borderRadius: 20, padding: '4px 40px', color: RED, fontFamily: HEAVY, fontWeight: 900, fontSize: 130, letterSpacing: 8}}>
					МИФ
				</div>
			)}
			<Plaque f={f} at={w(n, 'алкоголь') - 4} x={960} y={850 - 40} text="АЛКОГОЛЬ НЕ ГРЕЕТ" color={RED} size={60} />
		</AbsoluteFill>
	);
};

// ============================================================ 48. «Он расширяет сосуды… теряет тепло ещё быстрее. И дрожь… слабеет.» =====
export const S48: React.FC = () => {
	const f = useCurrentFrame();
	const n = 48;
	const wide = interpolate(f, [w(n, 'расширяет') - 4, w(n, 'расширяет') + 24], [0, 1], clamp);
	const loss = interpolate(f, [w(n, 'теряет') - 4, w(n, 'теряет') + 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<BodyMap id="z1s48b" f={f} x={960} y={500} s={1.06} cold={0.6 - wide * 0.6} flush={wide * 0.7} heat={loss} beat={1.1} shiver={Math.max(0, 1 - interpolate(f, [w(n, 'слабеет') - 4, w(n, 'слабеет') + 14], [0, 1], clamp)) * 0.8} />
			</Stage16>
			<Plaque f={f} at={w(n, 'кажется') - 4} x={420} y={300} text="КАЖЕТСЯ: ТЕПЛЕЕ" color="#ff8a6a" size={42} />
			<Plaque f={f} at={w(n, 'теряет') - 4} x={1500} y={300} text="НА САМОМ ДЕЛЕ: ХОЛОДНЕЕ" color={ICE} size={42} />
		</AbsoluteFill>
	);
};

// ============================================================ 49. «Но вот поворот. Холод не только убивает. Иногда он спасает.» =====
export const S49: React.FC = () => {
	const f = useCurrentFrame();
	const n = 49;
	const save = w(n, 'спасает') - 4;
	const glow = interpolate(f, [save, save + 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, ${mix('#0e1e3c', '#3a6aa8', glow)} 0%, #03060e 80%)`}}>
			<Stage16 bg="transparent">
				{[0, 1, 2, 3, 4, 5].map((q) => (
					<g key={q} transform={`translate(960,480) rotate(${q * 60 + f * 0.2})`} opacity={0.35 * (1 - glow * 0.6)}>
						<line x1={0} y1={0} x2={0} y2={-300} stroke={ICE} strokeWidth={10} strokeLinecap="round" />
						<path d="M -50,-210 L 0,-170 L 50,-210 M -36,-270 L 0,-240 L 36,-270" stroke={ICE} strokeWidth={8} fill="none" strokeLinecap="round" />
					</g>
				))}
				<g transform={`translate(960,480) scale(${3.2 + glow * 0.4})`}>
					<path d="M 0,26 C -40,0 -36,-30 -14,-30 C -4,-30 0,-20 0,-14 C 0,-20 4,-30 14,-30 C 36,-30 40,0 0,26 Z" fill={mix('#5a6a8a', '#ff4a5a', glow)} stroke="#fff" strokeWidth={2} />
				</g>
			</Stage16>
			<BigTitle2 f={f} at={2} text="ПОВОРОТ" y={120} size={90} color={YEL} />
			{f >= save && <Plaque f={f} at={save} x={960} y={850 - 40} text="ИНОГДА ХОЛОД СПАСАЕТ" color={ICE} size={56} />}
		</AbsoluteFill>
	);
};

// ============================================================ 50. «1999 год, север Норвегии… Анна Багенхольм… падает в горный ручей, под лёд.» =====
const Mountains: React.FC = () => (
	<g>
		<rect x={-400} y={-400} width={2800} height={1000} fill="#bcd2ea" />
		<path d="M -400,620 L 200,180 L 520,420 L 900,120 L 1300,460 L 1640,220 L 2300,620 Z" fill="#8aa4c4" />
		<path d="M 200,180 L 300,260 L 260,300 L 160,230 Z M 900,120 L 1000,200 L 940,250 L 840,170 Z M 1640,220 L 1740,300 L 1680,340 L 1580,270 Z" fill="#fff" />
		<path d="M -400,700 Q 500,520 1100,640 Q 1700,760 2400,600 L 2400,1500 L -400,1500 Z" fill="#eef4fa" />
	</g>
);
export const S50: React.FC = () => {
	const f = useCurrentFrame();
	const n = 50;
	const L = len(n);
	const fall = w(n, 'падает') - 4;
	const ride = interpolate(f, [0, fall], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const x = lerp(ride, 0, 1, 300, 1220);
	const y = lerp(ride, 0, 1, 640, 860);
	const k = 0.42;
	return (
		<AbsoluteFill>
			<Stage16 bg="#bcd2ea">
				<Layer cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.08, cx: 1080, cy: 600})} d={0.4}>
					<Mountains />
				</Layer>
				<Layer cam={camAt(f, 0, L, {s: 1.0, cx: 960, cy: 540}, {s: 1.08, cx: 1080, cy: 600})}>
					{/* the frozen stream */}
					<path d="M 1060,930 Q 1300,880 1600,960 Q 1800,1010 2100,960 L 2100,1010 Q 1800,1060 1600,1010 Q 1300,930 1060,980 Z" fill="#a8d0ec" />
					{f < fall + 6 && (
						<g transform={`translate(${x},${y}) rotate(14)`}>
							<line x1={-110} y1={2} x2={110} y2={2} stroke="#2a2a30" strokeWidth={8} strokeLinecap="round" />
							<Person kind="mom" id="z1s50a" x={0} y={0} scale={k} colors={{top: '#d8402a', topDark: '#b8341f', pants: '#2a2e3a', shoes: '#1d1d22', hair: '#d8b06a', skin: '#efc6a4'}} hem={0.2} knit="#2f6ad8" breathe={f} face={{eyes: 'open', brows: 'neutral', mouth: 'smile', look: [0.6, 0], blush: true}} armL={{target: [-120, -320], bend: -1}} armR={{target: [130, -320], bend: 1}} />
							<line x1={-58} y1={-140} x2={-90} y2={0} stroke="#3a3a42" strokeWidth={5} />
							<line x1={60} y1={-140} x2={92} y2={0} stroke="#3a3a42" strokeWidth={5} />
						</g>
					)}
					{f >= fall &&
						Array.from({length: 10}).map((_, q) => {
							const t = Math.min(26, f - fall);
							const a = (q / 10) * Math.PI;
							return <circle key={q} cx={1250 + Math.cos(a) * t * 5} cy={950 - Math.sin(a) * t * 5 + t * t * 0.2} r={8} fill="#cfe8fa" opacity={1 - t / 26} />;
						})}
				</Layer>
			</Stage16>
			<BigTitle2 f={f} at={2} text="1999 · НОРВЕГИЯ" y={90} size={84} />
			<Plaque f={f} at={w(n, 'анна') - 4} x={1500} y={300} text="АННА БАГЕНХОЛЬМ" sub="врач из Швеции" color={YEL} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 51. «Её зажимает подо льдом. Сорок минут… в воздушном кармане. Потом сердце останавливается.» =====
export const S51: React.FC = () => {
	const f = useCurrentFrame();
	const n = 51;
	const stop = w(n, 'останавливается') - 6;
	const beat = f < stop ? 1 : interpolate(f, [stop, stop + 20], [1, 0], clamp);
	const pulse = 1 + 0.15 * beat * Math.max(0, Math.sin(f / 4.5)) ** 6;
	return (
		<AbsoluteFill style={{background: '#06101c'}}>
			<Stage16 bg="transparent">
				{/* a section: snow, the ice, the water of the stream, an air pocket under the ice */}
				<rect x={0} y={0} width={1920} height={300} fill="#dfeaf6" />
				<rect x={0} y={300} width={1920} height={90} fill="#a8d0ec" />
				<rect x={0} y={390} width={1920} height={690} fill="#0c2a4c" />
				{Array.from({length: 12}).map((_, k) => (
					<path key={k} d={`M ${((f * 2 + k * 170) % 2100) - 100},${470 + (k % 4) * 120} l 60,0`} stroke="#5a8ac8" strokeWidth={4} opacity={0.5} />
				))}
				<path d="M 760,390 Q 960,470 1160,390 Z" fill="#1a4a7a" />
				<Picto x={960} y={470} s={0.75} rot={90} color="#cfe0f8" />
				<g transform={`translate(1560,640) scale(${2.2 * pulse})`}>
					<path d="M 0,26 C -40,0 -36,-30 -14,-30 C -4,-30 0,-20 0,-14 C 0,-20 4,-30 14,-30 C 36,-30 40,0 0,26 Z" fill={mix('#5a6a8a', '#ff3a4a', beat)} stroke="#fff" strokeWidth={2} />
				</g>
			</Stage16>
			<Plaque f={f} at={w(n, 'кармане') - 4} x={960} y={190} text="40 МИНУТ — В ВОЗДУШНОМ КАРМАНЕ" color={ICE} size={40} />
			{f >= stop && <Plaque f={f} at={stop + 6} x={1560} y={830 - 40} text="СЕРДЦЕ ОСТАНОВИЛОСЬ" color={RED} size={38} />}
		</AbsoluteFill>
	);
};

// ============================================================ 52. «Её достают через восемьдесят минут. Температура тела — 13,7 градуса. Это рекорд.» =====
export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const n = 52;
	const tt = w(n, 'температура') - 4;
	const v = interpolate(f, [tt, tt + 40], [36.6, 13.7], {...clamp, easing: Easing.out(Easing.cubic)});
	const rec = w(n, 'рекорд') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 45%, #11264a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<Thermo x={560} y={800} v={v} lo={0} hi={40} h={560} />
				{f >= rec && (
					<g transform={`translate(1260,470) scale(${pop(f, rec, 12)})`}>
						<circle r={250} fill={YEL} stroke={INK} strokeWidth={10} />
						<circle r={210} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="14 10" />
						<text x={0} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={120} fill={INK}>
							13,7°
						</text>
						<text x={0} y={110} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={INK}>
							РЕКОРД
						</text>
					</g>
				)}
			</Stage16>
			<Plaque f={f} at={3} x={1260} y={150} text="ЧЕРЕЗ 80 МИНУТ" color={ICE} size={52} />
		</AbsoluteFill>
	);
};

// ============================================================ 53. «Врачи несколько часов разогревают её кровь через специальный аппарат. И сердце снова начинает биться.» =====
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const n = 53;
	const back = w(n, 'биться') - 6;
	const on = interpolate(f, [back, back + 10], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#0a1420'}}>
			<Stage16 bg="transparent">
				<rect x={0} y={0} width={1920} height={1080} fill="#dfe8ee" />
				<rect x={0} y={760} width={1920} height={320} fill="#b8c8d0" />
				{/* the heart-lung machine: pumps and tubes, the warm blood going round */}
				<rect x={240} y={300} width={460} height={460} rx={24} fill="#f4f6f8" stroke="#8a9aa8" strokeWidth={6} />
				{[0, 1].map((k) => (
					<g key={k} transform={`translate(${360 + k * 220},460)`}>
						<circle r={70} fill="#cfd8e0" stroke="#6a7a88" strokeWidth={6} />
						<g transform={`rotate(${f * 6 + k * 40})`}>
							<rect x={-8} y={-62} width={16} height={124} rx={8} fill="#6a7a88" />
						</g>
					</g>
				))}
				<rect x={300} y={600} width={340} height={110} rx={14} fill="#26303a" />
				<text x={470} y={672} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight={900} fontSize={50} fill="#ff8a5a">
					{interpolate(f, [0, len(n)], [14, 30], clamp).toFixed(1)}°
				</text>
				<path d="M 700,420 Q 900,360 1100,460" stroke="#d8343a" strokeWidth={22} fill="none" strokeLinecap="round" />
				<path d="M 700,560 Q 900,620 1100,520" stroke="#7a2a5a" strokeWidth={22} fill="none" strokeLinecap="round" />
				{Array.from({length: 6}).map((_, k) => {
					const t = ((f * 1.5 + k * 12) % 72) / 72;
					return <circle key={k} cx={700 + t * 400} cy={420 - Math.sin(t * Math.PI) * 60 + t * 40} r={9} fill="#ffb0a0" />;
				})}
				{/* the monitor */}
				<rect x={1220} y={260} width={520} height={360} rx={20} fill="#0a140e" stroke="#2a3a30" strokeWidth={8} />
				<g transform="translate(0,0)">
					{on > 0 ? null : <line x1={1250} y1={440} x2={1710} y2={440} stroke="#5aff8a" strokeWidth={6} />}
				</g>
			</Stage16>
			{on > 0 && (
				<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
					<polyline
						points={Array.from({length: 78})
							.map((_, i) => {
								const x = 1250 + i * 6;
								const ph = ((i * 6 + f * 5) % 160) / 160;
								const v = ph > 0.45 && ph < 0.5 ? 90 : ph > 0.5 && ph < 0.55 ? -40 : 0;
								return `${x},${440 - v * on}`;
							})
							.join(' ')}
						fill="none"
						stroke="#5aff8a"
						strokeWidth={6}
					/>
				</svg>
			)}
			<Plaque f={f} at={w(n, 'аппарат') - 4} x={760} y={190} text="АППАРАТ ИСКУССТВЕННОГО КРОВООБРАЩЕНИЯ" color={ICE} size={34} />
			{f >= back && <Plaque f={f} at={back} x={1480} y={720} text="СЕРДЦЕ БЬЁТСЯ!" color="#5aff8a" size={50} />}
		</AbsoluteFill>
	);
};

// ============================================================ 54. «Через пять месяцев Анна вышла на работу.» =====
export const S54: React.FC = () => {
	const f = useCurrentFrame();
	const n = 54;
	const k = 0.78;
	return (
		<AbsoluteFill>
			<Stage16 bg="#e6eef2">
				<rect x={0} y={0} width={1920} height={1080} fill="#e6eef2" />
				<rect x={0} y={820} width={1920} height={260} fill="#c8d4da" />
				<rect x={1160} y={220} width={420} height={300} rx={10} fill="#bcd8e8" stroke="#8a9aa8" strokeWidth={8} />
				<Person kind="mom" id="z1s54a" x={760} y={1200} scale={k} colors={{top: '#f6f8fa', topDark: '#dfe4e8', pants: '#3a4a6a', shoes: '#2a2a30', hair: '#d8b06a', skin: '#efc6a4'}} hem={0.3} breathe={f} headTurn={0.1} face={{eyes: 'happy', brows: 'raised', mouth: 'grin', look: [0, 0], blush: true}} />
				<path d={`M ${760 - 46},${1200 - (400 + 380) * k + 30} q 46,90 92,0`} stroke="#3a4a5a" strokeWidth={8} fill="none" />
				<circle cx={760} cy={1200 - (400 + 380) * k + 100} r={14} fill="#8a9aa8" />
			</Stage16>
			<Plaque f={f} at={w(n, 'пять') - 4} x={1370} y={370} text="5 МЕСЯЦЕВ СПУСТЯ" color={YEL} size={46} />
			<Plaque f={f} at={w(n, 'работу') - 4} x={1370} y={600} text="СНОВА НА РАБОТЕ" color="#3aa86a" size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 55. «Холод замедлил всё… меньше кислорода… «Никто не мёртв, пока он не тёплый и мёртвый».» =====
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const n = 55;
	const rule = w(n, 'правило') - 4;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #13284a 0%, #040912 80%)'}}>
			{f < rule && (
				<Stage16 bg="transparent">
					<g transform="translate(960,460)">
						<path d="M -180,0 C -200,-140 -60,-200 0,-170 C 60,-200 200,-140 180,0 C 200,120 80,180 0,150 C -80,180 -200,120 -180,0 Z" fill="#ff9aa8" stroke="#fff" strokeWidth={8} />
						<path d="M 0,-170 L 0,150 M -120,-60 Q -60,-20 -120,40 M 120,-60 Q 60,-20 120,40" stroke="#d86a7a" strokeWidth={8} fill="none" />
					</g>
					<g transform="translate(1440,460)">
						<rect x={-40} y={-200} width={80} height={400} rx={40} fill="#1e2e4e" stroke="#cfe0f8" strokeWidth={6} />
						<rect x={-26} y={200 - 380 * interpolate(f, [4, 40], [0.8, 0.3], clamp)} width={52} height={380 * interpolate(f, [4, 40], [0.8, 0.3], clamp)} rx={26} fill={ICE} />
						<text x={0} y={270} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#cfe0f8">
							O₂
						</text>
					</g>
				</Stage16>
			)}
			{f < rule && <Plaque f={f} at={w(n, 'кислорода') - 4} x={960} y={150} text="МОЗГУ НУЖНО МЕНЬШЕ КИСЛОРОДА" color={ICE} size={44} />}
			{f >= rule && (
				<div style={{position: 'absolute', left: 960, top: 430, transform: `translate(-50%,-50%) scale(${pop(f, rule, 13)})`, width: 1500, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 92, lineHeight: 1.15, color: '#fff', textShadow: '0 6px 20px rgba(0,0,0,0.6)'}}>
					«Никто не мёртв,
					<br />
					пока он не <span style={{color: '#ff8a6a'}}>тёплый</span> и мёртвый»
					<div style={{fontFamily: HEAVY, fontSize: 36, color: '#9fb0c8', marginTop: 24, letterSpacing: 3}}>ПРАВИЛО ВРАЧЕЙ</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 56. «Но и спасение — опасный момент… умирает прямо на руках у спасателей.» =====
export const S56: React.FC = () => {
	const f = useCurrentFrame();
	const n = 56;
	const lift = interpolate(f, [8, len(n) - 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	return (
		<AbsoluteFill>
			<Stage16 bg="#06101e">
				<rect x={0} y={0} width={1920} height={1080} fill="#08152a" />
				<rect x={0} y={640} width={1920} height={440} fill="#0c2a4c" />
				<path d="M 0,640 L 1920,640" stroke="#5a8ac8" strokeWidth={4} />
				{/* the rescue boat's side and a person pulled up out of the water (pictograms) */}
				<path d="M 1100,560 L 1900,560 L 1860,700 L 1140,700 Z" fill="#e8562a" />
				<rect x={1100} y={548} width={800} height={20} fill="#c8481f" />
				<Picto x={1320} y={520} s={0.9} color="#f2c84a" pose="reach" />
				<Picto x={1520} y={520} s={0.9} color="#f2c84a" pose="reach" />
				<Picto x={1100} y={lerp(lift, 0, 1, 760, 560)} s={0.9} color="#cfe0f8" />
				<rect x={0} y={660} width={1080} height={420} fill="#0c2a4c" opacity={0.85} />
			</Stage16>
			<Plaque f={f} at={w(n, 'опасный') - 4} x={700} y={190} text="ОПАСНЫЙ МОМЕНТ" color={RED} size={56} />
			<ColdGrade cold={0.3} />
		</AbsoluteFill>
	);
};

// ============================================================ 57. «Пока ты в воде, она сжимает тело… вертикально, кровь уходит в ноги — и сердце не справляется.» =====
export const S57: React.FC = () => {
	const f = useCurrentFrame();
	const n = 57;
	const out = w(n, 'вытащить') - 4;
	const up = interpolate(f, [out, out + 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const legs = interpolate(f, [w(n, 'ноги') - 4, w(n, 'ноги') + 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#06101e'}}>
			<Stage16 bg="transparent">
				<rect x={0} y={560} width={1920} height={520} fill="#0c2a4c" />
				<path d="M 0,560 L 1920,560" stroke="#5a8ac8" strokeWidth={4} />
				<g transform={`translate(760,${lerp(up, 0, 1, 700, 420)})`}>
					<BodyMap id="z1s57b" f={f} x={0} y={0} s={0.55} cold={0.5} beat={lerp(legs, 0, 1, 1.2, 2.4)} />
					{legs > 0 &&
						Array.from({length: 6}).map((_, k) => {
							const t = ((f * 1.6 + k * 10) % 50) / 50;
							return <circle key={k} cx={(k % 2 ? 1 : -1) * 36} cy={-80 + t * 260} r={8} fill="#ff4a4a" opacity={legs * (1 - t)} />;
						})}
				</g>
				{up < 0.2 &&
					[-1, 1].map((sd) =>
						[0, 1, 2].map((q) => <path key={`${sd}${q}`} d={`M ${760 + sd * 240},${560 + 60 + q * 70} l ${-sd * 70},0 l ${sd * 16},-12 m ${-sd * 16},12 l ${sd * 16},12`} stroke={ICE} strokeWidth={6} fill="none" opacity={0.8} />),
					)}
			</Stage16>
			<Plaque f={f} at={w(n, 'сжимает') - 4} x={1400} y={250} text="ВОДА ПОДДЕРЖИВАЕТ СЕРДЦЕ" color={ICE} size={40} to={out - 4} />
			{f >= out && <Plaque f={f} at={out} x={1400} y={250} text="ВЕРТИКАЛЬНО — КРОВЬ УХОДИТ В НОГИ" color={RED} size={36} />}
		</AbsoluteFill>
	);
};

// ============================================================ 58. «…поднимать людей из воды горизонтально. А согревают постепенно — начиная с груди…» =====
export const S58: React.FC = () => {
	const f = useCurrentFrame();
	const n = 58;
	const warm = w(n, 'согревают') - 4;
	return (
		<AbsoluteFill style={{background: '#06101e'}}>
			<Stage16 bg="transparent">
				{f < warm ? (
					<g>
						<rect x={0} y={620} width={1920} height={460} fill="#0c2a4c" />
						<path d="M 0,620 L 1920,620" stroke="#5a8ac8" strokeWidth={4} />
						<g transform={`translate(960,${lerp(interpolate(f, [6, warm - 6], [0, 1], clamp), 0, 1, 700, 520)})`}>
							<path d="M -330,-20 Q 0,60 330,-20" stroke="#e8562a" strokeWidth={12} fill="none" />
							<Picto x={0} y={-30} s={0.8} rot={90} color="#cfe0f8" />
							<line x1={-330} y1={-20} x2={-330} y2={-260} stroke="#e8562a" strokeWidth={8} />
							<line x1={330} y1={-20} x2={330} y2={-260} stroke="#e8562a" strokeWidth={8} />
						</g>
					</g>
				) : (
					<g>
						<BodyMap id="z1s58b" f={f} x={960} y={500} s={1.0} cold={0.6} beat={1.0} />
						{[[-14, -170], [0, -260], [-90, -200], [80, -200]].map(([dx, dy], k) => (
							<g key={k} transform={`translate(${960 + dx},${500 + dy}) scale(${pop(f, warm + k * 5, 11)})`}>
								<rect x={-40} y={-26} width={80} height={52} rx={12} fill="#ff8a4a" stroke="#fff" strokeWidth={5} />
							</g>
						))}
						{[[-180, 70], [180, 70], [-70, 350], [70, 350]].map(([dx, dy], k) => (
							<g key={k} transform={`translate(${960 + dx},${500 + dy}) scale(${pop(f, warm + 20 + k * 4, 11)})`}>
								<circle r={30} fill="#1d1d24" stroke={RED} strokeWidth={6} />
								<path d="M -14,-14 L 14,14 M 14,-14 L -14,14" stroke={RED} strokeWidth={8} strokeLinecap="round" />
							</g>
						))}
					</g>
				)}
			</Stage16>
			{f < warm && <Plaque f={f} at={w(n, 'горизонтально') - 4} x={960} y={190} text="ГОРИЗОНТАЛЬНО" color={YEL} size={60} />}
			{f >= warm && <Plaque f={f} at={warm} x={420} y={300} text="СНАЧАЛА — ГРУДЬ" color="#ff8a4a" size={44} />}
		</AbsoluteFill>
	);
};

// ============================================================ 59. «Есть и «последействие»… Холодная кровь из рук и ног возвращается к сердцу.» =====
export const S59: React.FC = () => {
	const f = useCurrentFrame();
	const n = 59;
	const back = w(n, 'возвращается') - 6;
	const v = interpolate(f, [w(n, 'падает') - 4, len(n)], [30, 29.2], clamp);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 45%, #13284a 0%, #040912 80%)'}}>
			<Stage16 bg="transparent">
				<BodyMap id="z1s59b" f={f} x={860} y={500} s={1.04} cold={0.8} beat={1.0} core={0.7} />
				{f >= back &&
					[[-1, -0.2], [1, -0.2], [-0.5, 1], [0.5, 1]].map(([sx, sy], k) => {
						const t = (((f - back) * 1.2 + k * 10) % 40) / 40;
						const x0 = 860 + sx * 210;
						const y0 = 500 + sy * 260;
						return <circle key={k} cx={x0 + (846 - x0) * t} cy={y0 + (330 - y0) * t} r={12} fill="#4a7ad8" opacity={1 - t} />;
					})}
				<Thermo x={1460} y={760} v={v} lo={20} hi={40} h={520} />
			</Stage16>
			<Plaque f={f} at={w(n, 'последействие') - 4} x={860} y={130} text="«ПОСЛЕДЕЙСТВИЕ»" color={ICE} size={56} />
		</AbsoluteFill>
	);
};
export const _S3 = {Flash, Iceberg, InWater, Lifeboat, rnd};
