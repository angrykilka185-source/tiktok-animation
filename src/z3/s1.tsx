// «Каково это — оказаться погребённым заживо» — shots 1–9 and 13–22: the hook in the dark (seen from above: the
// boards right and left; then the section through two metres of soil), «стоп, Гога!», the air in the coffin, and
// Гога's first three mistakes: the scream, the lid, the lighter.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {BONE, BONE_D} from '../components/Choby';
import {Person} from '../components/Person';
import {IRIS, StopChobi} from './chobiKit';
import {arm, armTo, BigTitle, camAt, Chip, COFFIN, Coffin, DepthArrow, G, HEAVY, inCoffin, INK, Layer, Lighter, Marker, NightTop, Phone, Plaque, RED, Soil, Stage16, Vig, Waves, Weight, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);

// ============================================================ the coffin seen from above (the lid is the camera) =====
const CoffinTop: React.FC<{glowL?: number; glowR?: number}> = ({glowL = 0, glowR = 0}) => (
	<g>
		<rect x={0} y={0} width={1920} height={1080} fill="#2a1a0e" />
		{/* the floor of the coffin */}
		<path d="M 700,-60 L 1220,-60 L 1330,300 L 1250,1140 L 670,1140 L 590,300 Z" fill="#3a2614" />
		{/* the side boards */}
		{[-1, 1].map((sd) => {
			const glow = sd < 0 ? glowL : glowR;
			return (
				<g key={sd} transform={sd > 0 ? 'translate(1920,0) scale(-1,1)' : undefined}>
					<path d="M 590,300 L 700,-60 L 640,-60 L 520,300 L 600,1140 L 670,1140 Z" fill="#7a4a28" stroke="#2a180a" strokeWidth={6} />
					<path d="M 600,320 L 690,20 M 620,600 L 650,1100" stroke="#5a3418" strokeWidth={4} opacity={0.6} />
					{glow > 0 && <path d="M 590,300 L 700,-60 L 640,-60 L 520,300 L 600,1140 L 670,1140 Z" fill="#ffd36a" opacity={0.55 * glow} />}
				</g>
			);
		})}
	</g>
);

// ============================================================ 1. «Темнота. Полная.» =====
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const n = 1;
	const open = w(n, 'открывает') - 4;
	const hand = w(n, 'руки') - 14;
	const lids = interpolate(f, [open, open + 8], [1, 0], clamp);
	const dark = interpolate(f, [0, 30], [1, 0.86], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Stage16 bg="#000">
				<CoffinTop />
				<You x={960} y={1180} s={1.3} f={f} blink={lids} face={{eyes: 'open', brows: 'worried', mouth: 'tight', look: [0.1, -0.2]}} armR={armTo(1, f, hand, 'down', arm([120, -430], [56, -560], {front: true}), 14)} />
			</Stage16>
			<AbsoluteFill style={{background: '#000', opacity: dark}} />
			{/* only the shine of his eyes in the dark */}
			{lids < 0.6 && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					{[-1, 1].map((sd) => (
						<circle key={sd} cx={960 + sd * 75 + 6} cy={452} r={20} fill="#fff" opacity={(1 - lids) * 0.9} />
					))}
				</svg>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 2. sits up — bang; the boards right and left; above — two metres of earth =====
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const n = 2;
	const sit = w(n, 'пытается') - 2;
	const bang = w(n, 'бьётся') - 2;
	const right = w(n, 'справа') - 6;
	const left = w(n, 'слева') - 6;
	const top = w(n, 'сверху') - 4;
	const rise = interpolate(f, [sit, bang], [0, 1], {...clamp, easing: ease3}) * (1 - interpolate(f, [bang, bang + 10], [0, 1], clamp));
	const flash = f >= bang ? interpolate(f, [bang, bang + 6], [0.9, 0], clamp) : 0;
	const shake = f >= bang && f < bang + 12 ? Math.sin((f - bang) * 1.3) * (12 - (f - bang)) * 1.2 : 0;
	const side = interpolate(f, [top, top + 6], [0, 1], clamp);
	const cam = camAt(f, top, len(n), {s: 2.3, cx: 960, cy: 900}, FULL);
	const ruler = interpolate(f, [top + 20, top + 50], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{side < 1 && (
				<AbsoluteFill style={{transform: `translate(${shake}px,0)`}}>
					<Stage16 bg="#000">
						<CoffinTop glowR={f >= right ? pop(f, right, 8) * interpolate(f, [right, left + 10], [1, 0.4], clamp) : 0} glowL={f >= left ? pop(f, left, 8) : 0} />
						<g transform={`translate(960,${1180 - rise * 160}) scale(${1 + rise * 0.25}) translate(-960,-1180)`}>
							<You x={960} y={1180} s={1.3} f={f} blink={f >= bang && f < bang + 14 ? 1 : 0} face={{eyes: 'open', brows: f >= bang ? 'angry' : 'worried', mouth: f >= bang && f < bang + 20 ? 'open' : 'tight', look: [0, -0.3]}} />
						</g>
						{f >= bang && f < bang + 22 && (
							<g transform={`translate(960,260) scale(${pop(f, bang, 7)})`}>
								<path d="M 0,-90 L 24,-30 L 90,-40 L 40,10 L 70,70 L 0,36 L -70,70 L -40,10 L -90,-40 L -24,-30 Z" fill="#ffd84a" stroke={INK} strokeWidth={6} />
								<text x={0} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={INK}>
									БАМ!
								</text>
							</g>
						)}
					</Stage16>
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
					<AbsoluteFill style={{background: '#fff', opacity: flash}} />
					<Chip f={f} at={right + 4} x={1500} y={540} text="ДОСКА" color="#8a5630" size={48} to={top - 2} />
					<Chip f={f} at={left + 4} x={420} y={540} text="ДОСКА" color="#8a5630" size={48} to={top - 2} />
				</AbsoluteFill>
			)}
			{side > 0 && (
				<AbsoluteFill style={{opacity: side}}>
					<Stage16 bg="#060a1e">
						<Layer cam={cam}>
							<NightTop id="z2n" f={f} />
							<Soil />
							<Marker />
							<Coffin id="z2c" light={0.25}>
								<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
									<You x={0} y={0} s={inCoffin.s} f={f} face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0, -0.6]}} />
								</g>
							</Coffin>
							<DepthArrow x={1420} y0={G + 4} y1={COFFIN.y - 6} label="2 М" p={ruler} />
						</Layer>
					</Stage16>
					<Vig k={0.5} />
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

// the whole section: night, soil, the coffin with Гога inside
const Section: React.FC<{f: number; id: string; light?: number; crack?: number; face?: React.ComponentProps<typeof You>['face']; armR?: React.ComponentProps<typeof You>['armR']; armL?: React.ComponentProps<typeof You>['armL']; extra?: React.ReactNode; inside?: React.ReactNode; mound?: boolean}> = ({f, id, light = 0.25, crack = 0, face, armR, armL, extra, inside, mound = true}) => (
	<g>
		<NightTop id={`${id}n`} f={f} />
		<Soil mound={mound} />
		{mound && <Marker />}
		{extra}
		<Coffin id={`${id}c`} light={light} crack={crack}>
			{inside}
			<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
				<You x={0} y={0} s={inCoffin.s} f={f} face={face} armR={armR} armL={armL} />
			</g>
		</Coffin>
	</g>
);
// the close-up inside the coffin, and the whole section (the coffin above the captions)
const CLOSE = {s: 2.25, cx: 950, cy: 905};
const FULL = {s: 0.85, cx: 960, cy: 660};
// the section with a person standing on top
const CAM15 = {s: 0.8, cx: 960, cy: 650};

// ============================================================ 3. «Гога похоронен заживо.» =====
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const cam = camAt(f, 0, len(3), FULL, {s: 0.9, cx: 960, cy: 680});
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={cam}>
					<Section f={f} id="z3" face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0, -0.6]}} />
				</Layer>
			</Stage16>
			<Vig k={0.5} />
			<BigTitle f={f} at={2} lines={['ПОХОРОНЕН', 'ЗАЖИВО']} y={60} size={96} />
		</AbsoluteFill>
	);
};

// ============================================================ 4. he screams, bangs on the lid, clicks the lighter =====
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const n = 4;
	const scream = w(n, 'кричит') - 4;
	const bang = w(n, 'колотит') - 4;
	const light = w(n, 'щёлкает') - 2;
	const punch = f >= bang && f < light ? Math.abs(Math.sin((f - bang) / 3)) : 0;
	const lit = f >= light + 4 ? pop(f, light + 4, 6) : 0;
	// each blow jolts the picture down a little and back (smooth, no jitter)
	const shake = punch ** 10 * 7;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translate(0,${shake}px)`}}>
				<Stage16 bg="#060a1e">
					<Layer cam={CLOSE}>
						<Section
							f={f}
							id="z4"
							light={0.25 + lit * 0.6}
							face={{eyes: 'wide', brows: f >= bang ? 'angry' : 'raised', mouth: f >= scream && f < light ? 'o' : 'open', look: [0, -0.6]}}
							armR={f >= light ? arm([110, -400], [104, -480], {fist: true, item: <Lighter f={f} lit={lit} s={0.7} />, itemAng: 90}) : f >= bang ? arm([150, -400], [200 + punch * 70, -420], {fist: true}) : 'down'}
						/>
						{f >= scream && f < bang && <Waves f={f} x={980} y={880} dir={-90} color="#fff" />}
					</Layer>
				</Stage16>
			</AbsoluteFill>
			<Vig k={0.55} />
			<Chip f={f} at={scream + 2} x={560} y={210} text="КРИЧИТ" color={RED} size={48} />
			<Chip f={f} at={bang + 2} x={960} y={210} text="КОЛОТИТ" color={RED} size={48} />
			<Chip f={f} at={light + 2} x={1360} y={210} text="ЗАЖИГАЛКА" color={RED} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 5. «Стоп, Гога! три ошибки» — the frame stops, Чоби steps in =====
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const n = 5;
	const three = w(n, 'три') - 4;
	const air = w(n, 'воздух') - 6;
	const drain = interpolate(f, [air, air + 30], [1, 0.25], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'grayscale(0.75) brightness(0.8)'}}>
				<Stage16 bg="#060a1e">
					<Layer cam={CLOSE}>
						<Section f={12} id="z5" light={0.8} face={{eyes: 'wide', brows: 'angry', mouth: 'open', look: [0, -0.6]}} armR={arm([110, -400], [104, -480], {fist: true, item: <Lighter f={12} lit={1} s={0.7} />, itemAng: 90})} />
					</Layer>
				</Stage16>
			</AbsoluteFill>
			<Vig k={0.6} />
			{[
				['1 · КРИК', 0],
				['2 · КРЫШКА', 6],
				['3 · ОГОНЬ', 12],
			].map(([t, d], k) =>
				f >= three + (d as number) ? (
					<div key={k} style={{position: 'absolute', left: 120, top: 330 + k * 110, transform: `scale(${pop(f, three + (d as number), 10)})`, transformOrigin: 'left center', background: RED, color: '#fff', border: '5px solid #fff', borderRadius: 16, padding: '8px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
						✕ {t}
					</div>
				) : null,
			)}
			{f >= air && (
				<div style={{position: 'absolute', left: 120, top: 700, width: 420, transform: `scale(${pop(f, air, 10)})`, transformOrigin: 'left center'}}>
					<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 30, color: '#fff', marginBottom: 8, textShadow: '0 3px 0 #000'}}>ВОЗДУХ</div>
					<div style={{height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.25)', border: '4px solid #fff'}}>
						<div style={{width: `${drain * 100}%`, height: 20, borderRadius: 10, background: drain < 0.5 ? RED : '#5fb0f0'}} />
					</div>
				</div>
			)}
			<StopChobi n={n} f={f} at={0} to={len(n) - 20} />
		</AbsoluteFill>
	);
};

// ============================================================ 7. the silence; the heart; earth and wood =====
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const n = 7;
	const heart = w(n, 'сердце') - 6;
	const smell = w(n, 'пахнет') - 4;
	const cam = camAt(f, 0, len(n), {s: 1.5, cx: 960, cy: 820}, {s: 1.7, cx: 960, cy: 860});
	const beat = f >= heart ? Math.max(0, Math.sin(((f - heart) / 20) * Math.PI * 2)) ** 6 : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={cam}>
					<Section f={f} id="z7" face={{eyes: 'open', brows: 'worried', mouth: 'tight', look: [0, -0.5]}} />
				</Layer>
			</Stage16>
			<Vig k={0.6} />
			{f >= heart && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(1300,330) scale(${pop(f, heart, 10) * (1 + beat * 0.18)})`}>
						<circle r={80} fill="#ff4a5a" opacity={0.18 + beat * 0.2} />
						<path d="M 0,40 C -64,0 -70,-54 -32,-60 C -12,-64 0,-48 0,-36 C 0,-48 12,-64 32,-60 C 70,-54 64,0 0,40 Z" fill="#e8352e" stroke="#fff" strokeWidth={6} />
					</g>
					<text x={1420} y={346} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#fff" opacity={beat > 0.3 ? 1 : 0.5}>
						тук-тук
					</text>
				</svg>
			)}
			<Chip f={f} at={smell + 2} x={600} y={220} text="СЫРАЯ ЗЕМЛЯ" color="#7a5634" size={44} />
			<Chip f={f} at={smell + 10} x={600} y={310} text="ДЕРЕВО" color="#a0662e" size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 8. a few hundred litres of air — about a fridge =====
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const n = 8;
	const litres = w(n, 'несколько') - 4;
	const fridge = w(n, 'холодильнике') - 10;
	const fill = interpolate(f, [litres, litres + 24], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill style={{background: '#1b1410'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* the coffin (side), its air in blue */}
				<g transform="translate(560,600)">
					<rect x={-380} y={-130} width={760} height={260} rx={16} fill="#6e4224" stroke="#2a180a" strokeWidth={8} />
					<rect x={-362} y={-100} width={724} height={212} rx={10} fill="#120c08" />
					<rect x={-362} y={112 - 212 * fill} width={724} height={212 * fill} rx={10} fill="#5fb0f0" opacity={0.65} />
					<rect x={-392} y={-140} width={784} height={36} rx={10} fill="#8a5630" stroke="#2a180a" strokeWidth={8} />
				</g>
				{f >= litres + 10 && (
					<text x={560} y={420} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#fff" opacity={pop(f, litres + 10, 10)}>
						≈ 300–400 Л
					</text>
				)}
				{f >= fridge && (
					<g transform={`translate(1500,600) scale(${pop(f, fridge, 11)})`}>
						<text x={-260} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill="#fff">
							≈
						</text>
						<rect x={-130} y={-280} width={260} height={520} rx={26} fill="#eef3f8" stroke="#16161c" strokeWidth={8} />
						<line x1={-130} y1={-90} x2={130} y2={-90} stroke="#16161c" strokeWidth={8} />
						<rect x={90} y={-230} width={16} height={90} rx={8} fill="#9aa4b0" />
						<rect x={90} y={-50} width={16} height={130} rx={8} fill="#9aa4b0" />
					</g>
				)}
			</svg>
			<Plaque f={f} at={2} x={960} y={150} text="СКОЛЬКО ВОЗДУХА В ГРОБУ" color="#5fb0f0" size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 9. lying still: about two hours =====
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const n = 9;
	const two = w(n, 'часа') - 6;
	const sand = interpolate(f, [two, len(n)], [0, 0.35], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z9" face={{eyes: 'narrow', brows: 'neutral', mouth: 'tight', look: [0, -0.4]}} />
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			{f >= two && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<g transform={`translate(860,150) scale(${pop(f, two, 11) * 0.5})`}>
						<path d="M -90,-150 L 90,-150 L 10,0 L 90,150 L -90,150 L -10,0 Z" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
						<path d={`M ${-70 + sand * 60},${-130 + sand * 120} L ${70 - sand * 60},${-130 + sand * 120} L 0,-6 Z`} fill="#f2c230" />
						<path d={`M ${-70 * sand * 2.4},${130 - 120 * sand * 2.4} L ${70 * sand * 2.4},${130 - 120 * sand * 2.4} L 80,130 L -80,130 Z`} fill="#f2c230" />
						<line x1={0} y1={-6} x2={0} y2={130} stroke="#f2c230" strokeWidth={4} />
					</g>
				</svg>
			)}
			<Chip f={f} at={two + 6} x={1080} y={150} text="≈ 2 ЧАСА" color="#3a78e0" size={56} />
		</AbsoluteFill>
	);
};

// ============================================================ 13. mistake one: he screams =====
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const n = 13;
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z13" face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0, -0.6]}} />
					<Waves f={f} x={980} y={880} dir={-90} color="#fff" />
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<StopChobi n={n} f={f} at={IRIS} to={len(n) - 18} label="ОШИБКА №1 · КРИК" />
		</AbsoluteFill>
	);
};

// ============================================================ 14. deep breaths in, sharp out: the air goes three times as fast =====
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const n = 14;
	const air = w(n, 'воздух') - 6;
	const inhale = Math.sin(f / 5) > 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z14" face={{eyes: 'wide', brows: 'raised', mouth: inhale ? 'open' : 'o', look: [0, -0.6]}} />
					<Waves f={f} x={980} y={880} dir={-90} color="#fff" n={3} />
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{[0, 1, 2].map((k) => {
					const t = ((f / 18 + k / 3) % 1);
					return <circle key={k} cx={1060 - t * 260} cy={420 + Math.sin(t * 6 + k) * 30} r={18 + t * 14} fill="#9fd8ff" opacity={(1 - t) * 0.8} />;
				})}
			</svg>
			<Plaque f={f} at={4} x={560} y={190} text="ГЛУБОКИЙ ВДОХ — РЕЗКИЙ ВЫДОХ" color="#9fd8ff" size={42} />
			<Chip f={f} at={air + 4} x={1460} y={190} text="ВОЗДУХ × 3 БЫСТРЕЕ" color={RED} size={48} />
		</AbsoluteFill>
	);
};

// ============================================================ 15. no one will hear: the soil swallows the sound =====
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const n = 15;
	const nobody = w(n, 'никто') - 6;
	const man = w(n, 'человек') - 14;
	// a passer-by walks in from the right and stops right above the grave (nine steps: both feet down when he stops)
	const W0 = man - 70;
	const px = interpolate(f, [W0, man + 10], [2260, 1250], {...clamp, easing: (t) => t * (1.3 - 0.3 * t)});
	const pwalk = f >= W0 && f < man + 10 ? (9 * Math.PI * (f - W0)) / (man + 10 - W0) : undefined;
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CAM15}>
				<Section
					f={f}
					id="z15"
					face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0, -0.6]}}
					extra={
						<g>
							<Waves f={f} x={980} y={760} dir={-90} color="#fff" damp={1} n={5} />
							{f >= W0 && <Person kind="dad" id="z15p" x={px} y={G + 8} scale={0.2} silhouette="#2a3560" walk={pwalk} />}
						</g>
					}
				/>
				</Layer>
			</Stage16>
			<Vig k={0.45} />
			<Chip f={f} at={nobody + 4} x={760} y={300} text="НИКТО НЕ УСЛЫШИТ" color={RED} size={56} />
			{f >= man + 14 && (
				<div style={{position: 'absolute', left: (px - 960) * CAM15.s + 960 - 170, top: 70, transform: `translate(-50%,0) scale(${pop(f, man + 14, 10)})`, background: '#fff', color: INK, borderRadius: 20, padding: '6px 18px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, border: '5px solid #16161c'}}>
					…тишина
				</div>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 16. mistake two: he bangs on the lid =====
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const n = 16;
	const punch = Math.abs(Math.sin(f / 3.2));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translate(0,${punch ** 10 * 7}px)`}}>
				<Stage16 bg="#060a1e">
					<Layer cam={CLOSE}>
						<Section f={f} id="z16" face={{eyes: 'wide', brows: 'angry', mouth: 'open', look: [0, -0.6]}} armR={arm([150, -400], [200 + punch * 70, -420], {fist: true})} />
						{punch > 0.85 && (
							<g transform="translate(1100,800)">
								<path d="M 0,-34 L 9,-11 L 34,-15 L 15,4 L 26,26 L 0,14 L -26,26 L -15,4 L -34,-15 L -9,-11 Z" fill="#ffd84a" />
							</g>
						)}
					</Layer>
				</Stage16>
			</AbsoluteFill>
			<Vig k={0.55} />
			<StopChobi n={n} f={f} at={2} to={len(n) - 18} label="ОШИБКА №2 · КРЫШКА" />
		</AbsoluteFill>
	);
};

// ============================================================ 17. breathes faster; tonnes of earth on the lid =====
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const n = 17;
	const tons = w(n, 'тонны') - 8;
	const cam = camAt(f, 0, tons, {s: 2.2, cx: 950, cy: 900}, FULL);
	const push = Math.abs(Math.sin(f / 4));
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={cam}>
					<Section
						f={f}
						id="z17"
						face={{eyes: 'wide', brows: 'angry', mouth: 'open', look: [0, -0.6], sweat: 0.6}}
						armR={arm([150, -400], [220 + push * 40, -420], {fist: true})}
						extra={
							f >= tons ? (
								<g>
									{[0, 1, 2].map((k) => (
										<g key={k} transform={`translate(${COFFIN.x - 220 + k * 220},${COFFIN.y - 60 - (k % 2) * 140}) scale(${pop(f, tons + k * 5, 10) * 1.3})`}>
											<Weight text="1 Т" />
										</g>
									))}
									{[-1, 0, 1].map((k) => (
										<path key={`a${k}`} d={`M ${COFFIN.x + k * 300},${G + 120} l 0,${COFFIN.y - G - 220} m -24,-30 l 24,30 l 24,-30`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
									))}
								</g>
							) : null
						}
					/>
				</Layer>
			</Stage16>
			<Vig k={0.45} />
			<Chip f={f} at={4} x={560} y={160} text="ДЫШИТ ЧАЩЕ" color={RED} size={46} to={tons - 4} />
			<Plaque f={f} at={tons + 4} x={960} y={140} text="НА КРЫШКЕ — ТОННЫ ЗЕМЛИ" color="#a0662e" size={50} />
		</AbsoluteFill>
	);
};

// ============================================================ 18. the board cracks — the earth pours in =====
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const n = 18;
	const crack = w(n, 'треснет') - 6;
	const pour = w(n, 'хлынет') - 6;
	const c = interpolate(f, [crack, crack + 10], [0, 1], clamp);
	const lvl = interpolate(f, [pour, len(n)], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section
						f={f}
						id="z18"
						crack={c}
						face={{eyes: 'wide', brows: 'raised', mouth: 'o', look: [0, -0.6]}}
						inside={
							f >= pour ? (
								<g>
									<path d={`M ${COFFIN.x - 60},${COFFIN.y + 30} L ${COFFIN.x - 20},${COFFIN.y + 30} L ${COFFIN.x + 40 + lvl * 160},${COFFIN.y + COFFIN.h - 16} L ${COFFIN.x - 140 - lvl * 200},${COFFIN.y + COFFIN.h - 16} Z`} fill="#6b4a2e" />
									{Array.from({length: 18}).map((_, i) => {
										const t = ((f / 6 + i / 18) % 1);
										return <circle key={i} cx={COFFIN.x - 50 + ((i * 37) % 60)} cy={COFFIN.y + 30 + t * 190} r={5 + (i % 3) * 2} fill="#8a6440" />;
									})}
								</g>
							) : null
						}
					/>
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<Chip f={f} at={crack + 4} x={560} y={170} text="ТРЕСК!" color="#a0662e" size={50} />
			<Plaque f={f} at={pour + 6} x={1300} y={170} text="ЗЕМЛЯ ЗАНИМАЕТ ВОЗДУХ" color={RED} size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 19. in a film he punches through; in life the earth falls on the chest =====
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const n = 19;
	const life = w(n, 'жизни') - 6;
	const t = interpolate(f, [life, life + 14], [0, 1], {...clamp, easing: ease3});
	const fall = interpolate(f, [life + 10, len(n)], [0, 1], clamp);
	const up = interpolate(f, [4, life - 10], [0, 1], {...clamp, easing: ease3});
	return (
		<AbsoluteFill style={{background: '#0b0b10'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{/* «В КИНО»: film edges, daylight, a bony fist bursts out of the ground */}
				<g opacity={1 - t * 0.55}>
					<rect x={80} y={180} width={820} height={620} rx={20} fill="#9fd2f6" />
					<rect x={80} y={560} width={820} height={240} fill="#6b4a2e" />
					<rect x={80} y={548} width={820} height={20} fill="#3f6a38" />
					{[200, 300, 400, 500, 600, 700].map((y) => (
						<g key={y}>
							<rect x={92} y={y} width={24} height={34} rx={4} fill="#0b0b10" />
							<rect x={864} y={y} width={24} height={34} rx={4} fill="#0b0b10" />
						</g>
					))}
					<g transform={`translate(490,${640 - up * 170})`}>
						<rect x={-34} y={0} width={68} height={200} rx={30} fill={BONE} stroke={BONE_D} strokeWidth={6} />
						<rect x={-56} y={-60} width={112} height={90} rx={36} fill={BONE} stroke={BONE_D} strokeWidth={6} />
						{[-30, 0, 30].map((x) => (
							<circle key={x} cx={x} cy={-60} r={18} fill={BONE} stroke={BONE_D} strokeWidth={5} />
						))}
					</g>
					{up > 0.6 && <path d="M 400,560 l -40,-50 M 580,560 l 40,-50 M 450,540 l -10,-70 M 530,540 l 10,-70" stroke="#6b4a2e" strokeWidth={14} strokeLinecap="round" />}
				</g>
				{/* «В ЖИЗНИ»: the loose earth falls in on his chest */}
				<g opacity={0.35 + t * 0.65}>
					<rect x={1020} y={180} width={820} height={620} rx={20} fill="#2a1a0e" />
					<g transform="translate(1430,560)">
						<g transform="rotate(-90)">
							<You x={0} y={300} s={0.62} f={f} face={{eyes: 'closed', brows: 'worried', mouth: 'open'}} />
						</g>
					</g>
					<path d={`M 1180,${300 + fall * 180} C 1300,${260 + fall * 160} 1560,${260 + fall * 160} 1700,${300 + fall * 180} L 1700,180 L 1180,180 Z`} fill="#6b4a2e" />
					{Array.from({length: 14}).map((_, i) => {
						const tt = ((f / 7 + i / 14) % 1);
						return <circle key={i} cx={1250 + ((i * 53) % 420)} cy={200 + tt * 300} r={6 + (i % 3) * 3} fill="#8a6440" opacity={t} />;
					})}
					{fall > 0.3 && (
						<g transform="translate(1430,450)" opacity={Math.min(1, (fall - 0.3) * 3)}>
							<path d="M 0,-60 L 0,40 M -26,14 L 0,40 L 26,14" stroke={RED} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					)}
				</g>
			</svg>
			<Chip f={f} at={2} x={490} y={130} text="В КИНО" color="#8a5ad8" size={52} />
			<Chip f={f} at={life} x={1430} y={130} text="В ЖИЗНИ" color={RED} size={52} />
			<Chip f={f} at={w(n, 'давит') - 4} x={1430} y={740} text="ЗЕМЛЯ ДАВИТ НА ГРУДЬ" color="#a0662e" size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 20. mistake three: the lighter =====
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const n = 20;
	const lit = f >= 6 ? pop(f, 6, 6) : 0;
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z20" light={0.25 + lit * 0.6} face={{eyes: 'wide', brows: 'raised', mouth: 'open', look: [0, -0.6]}} armR={arm([110, -400], [104, -480], {fist: true, item: <Lighter f={f} lit={lit} s={0.7} />, itemAng: 90})} />
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<StopChobi n={n} f={f} at={2} to={len(n) - 18} label="ОШИБКА №3 · ОГОНЬ" />
		</AbsoluteFill>
	);
};

// ============================================================ 21. the flame breathes too: O₂ in, CO₂ out =====
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const n = 21;
	const burn = w(n, 'сжигает') - 6;
	const co2 = w(n, 'углекислый') - 6;
	const molecule = (x: number, y: number, kind: 'o2' | 'co2', k: number) => (
		<g key={k} transform={`translate(${x},${y})`}>
			{kind === 'o2' ? (
				<g>
					<circle cx={-14} r={16} fill="#5fb0f0" stroke="#fff" strokeWidth={3} />
					<circle cx={14} r={16} fill="#5fb0f0" stroke="#fff" strokeWidth={3} />
				</g>
			) : (
				<g>
					<circle cx={-24} r={14} fill="#9aa1ae" stroke="#fff" strokeWidth={3} />
					<circle r={18} fill="#4a4f5a" stroke="#fff" strokeWidth={3} />
					<circle cx={24} r={14} fill="#9aa1ae" stroke="#fff" strokeWidth={3} />
				</g>
			)}
		</g>
	);
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z21" light={0.85} face={{eyes: 'wide', brows: 'worried', mouth: 'open', look: [0, -0.6]}} armR={arm([110, -400], [104, -480], {fist: true, item: <Lighter f={f} lit={1} s={0.7} />, itemAng: 90})} />
				</Layer>
			</Stage16>
			<Vig k={0.5} />
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{f >= burn &&
					[0, 1, 2, 3].map((k) => {
						const t = ((f - burn) / 26 + k / 4) % 1;
						return molecule(1500 - t * 420, 300 + k * 40, 'o2', k);
					})}
				{f >= co2 &&
					[0, 1, 2, 3].map((k) => {
						const t = ((f - co2) / 26 + k / 4) % 1;
						return molecule(1080 - t * 420, 620 + k * 40, 'co2', k + 10);
					})}
			</svg>
			<Chip f={f} at={burn + 2} x={1520} y={230} text="O₂ СГОРАЕТ" color="#3a78e0" size={46} />
			<Chip f={f} at={co2 + 2} x={500} y={820} text="CO₂ ПРИБАВЛЯЕТСЯ" color="#4a4f5a" size={46} />
		</AbsoluteFill>
	);
};

// ============================================================ 22. need light? the phone screen — light without fire =====
export const S22: React.FC = () => {
	const f = useCurrentFrame();
	const n = 22;
	const phone = w(n, 'экран') - 6;
	const glow = interpolate(f, [phone, phone + 8], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Section f={f} id="z22" light={glow * 0.5} face={{eyes: 'open', brows: 'neutral', mouth: 'tight', look: [0, -0.6]}} armR={armTo(1, f, phone - 6, 'down', arm([110, -400], [104, -480], {fist: true, item: <Phone glow={glow} s={0.6} />, itemAng: 90}), 10)} />
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(520,260) scale(${pop(f, 2, 10)})`}>
					<circle r={70} fill="#fff" stroke={INK} strokeWidth={6} />
					<g transform="translate(0,20)">
						<Lighter f={f} lit={1} s={0.55} />
					</g>
					<path d="M -46,-46 L 46,46 M 46,-46 L -46,46" stroke={RED} strokeWidth={14} strokeLinecap="round" />
				</g>
				{f >= phone && (
					<g transform={`translate(1400,260) scale(${pop(f, phone, 10)})`}>
						<circle r={70} fill="#fff" stroke={INK} strokeWidth={6} />
						<Phone glow={1} s={0.55} />
						<path d="M 40,40 l 16,16 l 34,-40" stroke="#3aa86a" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</g>
				)}
			</svg>
			<Chip f={f} at={w(n, 'свет') + 30} x={1400} y={400} text="СВЕТ БЕЗ ОГНЯ" color="#3aa86a" size={46} />
		</AbsoluteFill>
	);
};
