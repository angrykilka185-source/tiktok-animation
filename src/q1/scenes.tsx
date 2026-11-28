// «Что лучше: длинные или короткие?» — Чоби and Гога ask the viewers which videos they like better.
// 7 shots on the timeline of src/q1/timeline.ts, 1080×1920, on the channel's white page with the warm floor
// (the same look as Чоби's pages in the «Каково это» films). Чоби speaks (the voice), Гога answers with his face,
// his phone and little labels. Everything that happens on a word is timed on the voice (w(n, 'слово')).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Choby, type ArmSpec, type Pose} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import {arm, armTo, Chip, You} from '../z2/kit';
import {shotStart} from './timeline';
import {jawAt, w} from './voice';

export const INK = '#16161c';
export const RED = '#e8352e';
export const RED_D = '#8f1416';
export const BLUE = '#1d5fd1';
export const BLUE_D = '#0f3a8a';
const YEL = '#ffd34a';
const ORANGE = '#f08a2a';
const GREEN = '#2f9a5a';
const FLOOR_Y = 1390; // where the warm floor starts
const FEET = 1500; // the line the heroes stand on

const ease = Easing.inOut(Easing.cubic);
const blinkAt = (g: number) => {
	const ph = (g + 40) % 113;
	return ph < 6 ? 1 - Math.abs(ph - 2.5) / 3 : 0;
};
type Arm = Pose | ArmSpec;

// ------------------------------------------------------------------------------------------------ pieces -----
// the white page: a floor, drifting specks, the shadows of the heroes ([x, half-width]); a soft colour behind one side
const Page: React.FC<{g: number; shadows?: [number, number][]; glow?: 'blue' | 'red'; glowK?: number}> = ({g, shadows = [], glow, glowK = 1}) => (
	<AbsoluteFill style={{background: '#ffffff'}}>
		{glow && (
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 70% 42% at ${glow === 'blue' ? '30%' : '70%'} 56%, ${glow === 'blue' ? 'rgba(29,95,209,0.14)' : 'rgba(232,53,46,0.14)'} 0%, rgba(255,255,255,0) 100%)`,
					opacity: glowK,
				}}
			/>
		)}
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id="q1Floor" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffffff" />
					<stop offset="100%" stopColor="#f6efe3" />
				</linearGradient>
			</defs>
			<rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill="url(#q1Floor)" />
			{Array.from({length: 20}).map((_, i) => {
				const x = ((i * 263 + g * (0.7 + (i % 3) * 0.35)) % 1200) - 60;
				const y = ((i * 137) % 1650) + 90 + Math.sin((g + i * 30) / 50) * 14;
				return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#e6d2ae" opacity={0.7} />;
			})}
			{shadows.map(([x, rx], i) => (
				<ellipse key={i} cx={x} cy={FEET + 8} rx={rx} ry={rx * 0.11} fill="#000" opacity={0.1} />
			))}
		</svg>
	</AbsoluteFill>
);

// heavy text with a hard edge under it (the channel's titles)
// (a plain string is sized down to fit the width: the heavy Cyrillic capitals are ≈ 0.8 em wide)
const Heavy: React.FC<{size: number; color?: string; edge?: string; maxW?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size: want, color = INK, edge, maxW = 980, style, children}) => {
	const size = typeof children === 'string' ? Math.min(want, Math.floor(maxW / (children.length * 0.8))) : want;
	return (
		<div
			style={{
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: size,
				lineHeight: 1.02,
				color,
				whiteSpace: 'nowrap',
				textAlign: 'center',
				textShadow: edge ? `0 ${Math.max(4, Math.round(size * 0.055))}px 0 ${edge}` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};
// something that pops in (a spring with an overshoot) at (x, y), centred
const PopAt: React.FC<{f: number; at: number; x?: number; y: number; rot?: number; from?: number; children: React.ReactNode}> = ({f, at, x = 540, y, rot = 0, from = 0.55, children}) =>
	f < at ? null : <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${from + (1 - from) * pop(f, at, 11)})`}}>{children}</div>;

// Чоби: talks on the voice, blinks, sways a little
const Host: React.FC<{n: number; f: number; x: number; s: number; armR?: Arm; armL?: Arm; look?: [number, number]; tilt?: number; lean?: number; extra?: Partial<React.ComponentProps<typeof Choby>>}> = ({
	n,
	f,
	x,
	s,
	armR = 'down',
	armL = 'down',
	look = [0, 0],
	tilt,
	lean = 0,
	extra,
}) => {
	const g = shotStart(n) + f;
	const jaw = jawAt(n, f);
	return (
		<g transform={`rotate(${lean} ${x} ${FEET})`}>
			<Choby x={x} y={FEET} s={s} jaw={jaw} blink={blinkAt(g)} look={look} tilt={tilt ?? Math.sin(g / 23) * 3 + (jaw - 0.25) * 3} armR={armR} armL={armL} f={g} {...extra} />
		</g>
	);
};
// Гога: his own face and arms (the same character as in the films)
type GFace = {eyes?: string; mouth?: string; brows?: string; look?: [number, number]; sweat?: number; pupil?: number};
const Goga: React.FC<{n: number; f: number; x: number; s: number; face?: GFace; armR?: Arm; armL?: Arm; tilt?: number; lean?: number}> = ({n, f, x, s, face, armR = 'down', armL = 'down', tilt = 0, lean = 0}) => (
	<g transform={`rotate(${lean} ${x} ${FEET})`}>
		<You x={x} y={FEET} s={s} f={shotStart(n) + f} face={face} tilt={tilt} armR={armR} armL={armL} />
	</g>
);

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
		{children}
	</svg>
);

// a phone in Гога's hand: a feed of short videos that flips up on every swipe (swipes: the frames)
const PHONE_CLIP = 'q1-phone-screen';
const FEED_COLORS = ['#ff6b5e', '#3a9be6', '#ffd34a', '#2f9a5a', '#a45bd8'];
const PhoneItem: React.FC<{f: number; swipes: number[]; k?: number}> = ({f, swipes, k = 1.5}) => {
	// how many cards have flipped by now (a swipe takes 7 frames)
	const idx = swipes.reduce((a, s) => a + interpolate(f, [s, s + 7], [0, 1], {...clamp, easing: ease}), 0);
	const base = Math.floor(idx);
	const fr = idx - base;
	const H = 232;
	return (
		<g transform={`scale(${k})`}>
			<defs>
				<clipPath id={PHONE_CLIP}>
					<rect x={-56} y={-236} width={112} height={H} rx={9} />
				</clipPath>
			</defs>
			<rect x={-66} y={-246} width={132} height={252} rx={18} fill="#16161c" />
			<g clipPath={`url(#${PHONE_CLIP})`}>
				{[0, 1].map((j) => {
					const i = base + j;
					const y = -236 + (j - fr) * H;
					const prog = j === 0 ? 0.35 + 0.65 * fr : 0.35 * (1 - fr);
					return (
						<g key={j} transform={`translate(0 ${y})`}>
							<rect x={-56} y={0} width={112} height={H} fill={FEED_COLORS[i % FEED_COLORS.length]} />
							<circle cx={0} cy={H * 0.42} r={26} fill="#fff" opacity={0.9} />
							<path d={`M -8,${H * 0.42 - 14} L 16,${H * 0.42} L -8,${H * 0.42 + 14} Z`} fill={FEED_COLORS[i % FEED_COLORS.length]} />
							{[0, 1, 2].map((q) => (
								<circle key={q} cx={42} cy={H * 0.62 + q * 22} r={7} fill="#fff" opacity={0.85} />
							))}
							<rect x={-56} y={H - 8} width={112} height={8} fill="#fff" opacity={0.35} />
							<rect x={-56} y={H - 8} width={112 * Math.min(1, prog)} height={8} fill="#fff" />
						</g>
					);
				})}
			</g>
		</g>
	);
};

// a format card for the vote: a big number, the name and a tiny picture (a long bar / a short bar)
const FormatCard: React.FC<{f: number; at: number; x: number; y: number; num: string; label: string; color: string; edge: string; long: boolean; rot?: number}> = ({
	f,
	at,
	x,
	y,
	num,
	label,
	color,
	edge,
	long,
	rot = 0,
}) => {
	if (f < at) return null;
	const p = pop(f, at, 10);
	const wob = Math.sin((f - at) / 5) * Math.max(0, 1 - (f - at) / 40) * 2;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 460,
				height: 560,
				transform: `translate(-50%,-50%) rotate(${rot + wob}deg) scale(${0.5 + 0.5 * p})`,
				background: color,
				borderRadius: 52,
				boxShadow: `0 18px 0 ${edge}, 0 36px 60px rgba(30,20,10,0.22)`,
				textAlign: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				color: '#fff',
			}}
		>
			<svg width={460} height={150} viewBox="0 0 460 150" style={{position: 'absolute', left: 0, top: 18}}>
				<rect x={70} y={64} width={320} height={22} rx={11} fill="#fff" opacity={0.35} />
				<rect x={70} y={64} width={long ? 250 : 70} height={22} rx={11} fill="#fff" />
				<circle cx={70 + (long ? 250 : 70)} cy={75} r={19} fill="#fff" />
				<text x={70} y={125} fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" opacity={0.9}>
					{long ? '0:00' : '0:00'}
				</text>
				<text x={390} y={125} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" opacity={0.9}>
					{long ? '9:03' : '0:30'}
				</text>
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, fontSize: 290, lineHeight: 1, textShadow: `0 10px 0 ${edge}`}}>{num}</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 58, fontSize: label.length > 8 ? 64 : 72, lineHeight: 1, letterSpacing: 1}}>{label}</div>
		</div>
	);
};

// ----------------------------------------------------------------------------------------------- 1. a quarrel -----
// «Стоп! У нас с Гогой спор.» — the two stand face to face, hands on hips, a spark between them
export const S01: React.FC = () => {
	const n = 1;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const stop = Math.max(0, w(n, 'стоп') - 4);
	const spor = w(n, 'спор');
	const k = f >= spor ? Math.max(0, 1 - (f - spor) / 14) : 0;
	return (
		<AbsoluteFill>
			<Page
				g={g}
				shadows={[
					[290, 150],
					[790, 150],
				]}
			/>
			<PopAt f={f} at={stop} y={240} rot={-5} from={1.5}>
				<Heavy size={150} color={RED} edge={RED_D}>
					СТОП!
				</Heavy>
			</PopAt>
			<PopAt f={f} at={spor} y={470} from={1.35}>
				<Heavy size={250} color={INK} edge="#9aa0aa" style={{transform: `translate(${Math.sin(f * 2.1) * 9 * k}px, 0)`}}>
					СПОР
				</Heavy>
			</PopAt>
			<Stage>
				<Host n={n} f={f} x={290} s={0.95} armR="hip" armL="hip" look={[0.9, 0.05]} tilt={6} lean={2} />
				<Goga n={n} f={f} x={790} s={0.95} face={{eyes: 'narrow', mouth: 'flat', brows: 'angry', look: [-0.9, 0.1]}} armR="hip" armL="hip" tilt={-6} lean={-2} />
				{/* a spark between them */}
				<g opacity={f >= 6 && g % 6 < 4 ? 1 : 0.15} transform="translate(540 1030)">
					<path d="M -22,-120 L 24,-30 L -6,-26 L 30,70 L -34,-10 L -2,-14 Z" fill={YEL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
				</g>
			</Stage>
			<Chip f={f} at={stop + 8} x={290} y={745} text="ДЛИННЫЕ!" color={BLUE} size={52} />
			<Chip f={f} at={spor + 6} x={790} y={745} text="КОРОТКИЕ!" color={RED} size={52} />
		</AbsoluteFill>
	);
};

// -------------------------------------------------------------------------------------- 2. Чоби: long videos -----
// «Я за длинные видео. Девять минут, подробности, источники!» — a player bar fills up to 9:03, Гога yawns
export const S02: React.FC = () => {
	const n = 2;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tLong = w(n, 'длинные');
	const tNine = w(n, 'девять');
	const tDet = w(n, 'подробности');
	const tSrc = w(n, 'источники');
	const prog = interpolate(f, [tNine - 2, tSrc + 18], [0, 1], {...clamp, easing: ease});
	const sec = Math.round(prog * 543);
	const TX = 120;
	const TW = 840;
	return (
		<AbsoluteFill>
			<Page
				g={g}
				glow="blue"
				shadows={[
					[400, 170],
					[905, 95],
				]}
			/>
			<PopAt f={f} at={tLong} y={250} from={1.4}>
				<Heavy size={190} color={BLUE} edge={BLUE_D}>
					ДЛИННЫЕ
				</Heavy>
			</PopAt>
			{/* the player bar */}
			<div style={{position: 'absolute', left: 0, top: 0, opacity: f >= tNine - 8 ? 1 : 0}}>
				<svg width={1080} height={700} viewBox="0 0 1080 700" style={{position: 'absolute', left: 0, top: 0}}>
					<rect x={TX} y={455} width={TW} height={34} rx={17} fill="#e3e3ea" />
					<rect x={TX} y={455} width={TW * prog} height={34} rx={17} fill={RED} />
					{[0.12, 0.27, 0.43, 0.58, 0.74, 0.88].map((c) => (
						<rect key={c} x={TX + TW * c - 3} y={455} width={6} height={34} fill="#fff" />
					))}
					<circle cx={TX + TW * prog} cy={472} r={26} fill={RED} stroke="#fff" strokeWidth={7} />
					<text x={TX} y={545} fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={INK}>
						{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
					</text>
					<text x={TX + TW} y={545} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={INK} opacity={0.55}>
						9:03
					</text>
				</svg>
			</div>
			<Chip f={f} at={tNine} x={540} y={395} text="9 МИНУТ" color={BLUE} size={58} />
			<Chip f={f} at={tDet} x={300} y={610} text="ПОДРОБНОСТИ" color={GREEN} size={52} />
			<Chip f={f} at={tSrc} x={780} y={725} text="ИСТОЧНИКИ" color={ORANGE} size={52} />
			<Stage>
				<Host n={n} f={f} x={400} s={1.05} armR={armTo(1, f, tDet - 6, 'pointer', 'pointer')} armL="hip" look={[0.2, -0.15]} tilt={-3} />
				<Goga n={n} f={f} x={905} s={0.6} face={{eyes: 'closed', mouth: f > tNine ? 'open' : 'flat', brows: 'neutral'}} armR="down" armL="down" tilt={7} />
			</Stage>
			{/* Гога dozes off */}
			{[0, 1, 2].map((i) => {
				const t = ((g + i * 22) % 66) / 66;
				return (
					<div key={i} style={{position: 'absolute', left: 930 + t * 34, top: 1010 - t * 190, opacity: f > tNine ? Math.sin(Math.PI * t) : 0, transform: `translate(-50%,-50%) scale(${0.7 + i * 0.3})`}}>
						<Heavy size={72} color={BLUE} edge="#9aa0aa">
							Z
						</Heavy>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------------------------- 3. Гога: short videos -----
// «А Гога за короткие. Тридцать секунд — и дальше!» — a phone and a feed that flips faster and faster
export const S03: React.FC = () => {
	const n = 3;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tShort = w(n, 'короткие');
	const tThirty = w(n, 'тридцать');
	const tNext = w(n, 'дальше');
	const swipes = [tThirty + 4, w(n, 'секунд') + 6, tNext - 8, tNext + 6, tNext + 18];
	const left = Math.max(0, 30 - Math.floor(Math.max(0, f - tThirty) / 2.4));
	const PH = <PhoneItem f={f} swipes={swipes} k={1.25} />;
	const PHONE_ARM: ArmSpec = arm([150, -325], [222, -335], {fist: true, item: PH, itemAng: 6});
	return (
		<AbsoluteFill>
			<Page
				g={g}
				glow="red"
				shadows={[
					[185, 95],
					[600, 170],
				]}
			/>
			<PopAt f={f} at={tShort} y={250} from={1.4}>
				<Heavy size={186} color={RED} edge={RED_D}>
					КОРОТКИЕ
				</Heavy>
			</PopAt>
			<Chip f={f} at={tThirty} x={540} y={420} text={f >= tThirty + 40 ? 'ГОТОВО!' : `0:${String(left).padStart(2, '0')}`} color={ORANGE} size={66} />
			<Stage>
				<Host n={n} f={f} x={185} s={0.6} armR="down" armL="hip" look={[0.7, 0.2]} tilt={-6} extra={{sweat: f > tThirty ? 0.9 : 0.3}} />
				<Goga n={n} f={f} x={600} s={1.05} face={{eyes: 'open', mouth: f >= tNext - 8 ? 'open' : 'smile', brows: 'raised', look: [0.9, -0.2]}} armR={armTo(1, f, 0, 'down', PHONE_ARM, 12)} armL="hip" tilt={5} />
			</Stage>
			{swipes.slice(2).map((s, i) => (
				<Chip key={s} f={f} at={s + 2} x={[330, 340, 360][i]} y={[640, 780, 920][i]} to={s + 24} text={['ДАЛЬШЕ!', 'ДАЛЬШЕ!!', 'ДАЛЬШЕ!!!'][i]} color={RED} size={[54, 66, 78][i]} />
			))}
		</AbsoluteFill>
	);
};

// -------------------------------------------------------------------------------------------- 4. the question -----
// «Так что лучше? Решать тебе.» — the scales: a long film on one pan, a short one on the other
export const S04: React.FC = () => {
	const n = 4;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tBetter = w(n, 'лучше');
	const tYou = w(n, 'тебе');
	// the beam swings, then settles level on «тебе»
	const swing = f < tBetter ? 0 : Math.exp(-(f - tBetter) / 26) * Math.sin((f - tBetter) / 4.2) * 9;
	const theta = (swing * Math.PI) / 180;
	const PX = 540;
	const PY = 735;
	const R = 280;
	const L = [PX - R * Math.cos(theta), PY - R * Math.sin(theta)];
	const Rt = [PX + R * Math.cos(theta), PY + R * Math.sin(theta)];
	const Pan: React.FC<{c: number[]; long: boolean}> = ({c, long}) => (
		<g transform={`translate(${c[0]} ${c[1]})`}>
			<path d="M 0,0 L -100,215 M 0,0 L 100,215" stroke={INK} strokeWidth={5} fill="none" />
			<path d="M -130,215 L 130,215 Q 120,262 0,262 Q -120,262 -130,215 Z" fill="#c9ccd6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
			<g transform="translate(0 150)">
				<rect x={-86} y={-66} width={172} height={120} rx={20} fill={long ? BLUE : RED} stroke={INK} strokeWidth={5} />
				<path d="M -16,-36 L 24,-6 L -16,24 Z" fill="#fff" />
				<text x={0} y={46} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#fff" stroke={INK} strokeWidth={1}>
					{long ? '9:03' : '0:30'}
				</text>
			</g>
		</g>
	);
	return (
		<AbsoluteFill>
			<Page
				g={g}
				shadows={[
					[135, 78],
					[945, 78],
				]}
			/>
			<PopAt f={f} at={4} y={235} from={1.3}>
				<Heavy size={200} color={INK} edge="#9aa0aa">
					ЧТО
				</Heavy>
			</PopAt>
			<PopAt f={f} at={tBetter} y={445} from={1.35}>
				<Heavy size={220} color={RED} edge={RED_D}>
					ЛУЧШЕ?
				</Heavy>
			</PopAt>
			<Stage>
				{/* the scales */}
				<rect x={PX - 14} y={PY} width={28} height={600} rx={10} fill="#8d93a3" stroke={INK} strokeWidth={5} />
				<path d={`M ${PX - 150},1400 L ${PX + 150},1400 L ${PX + 110},1340 L ${PX - 110},1340 Z`} fill="#8d93a3" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
				<line x1={L[0]} y1={L[1]} x2={Rt[0]} y2={Rt[1]} stroke={INK} strokeWidth={26} strokeLinecap="round" />
				<line x1={L[0]} y1={L[1]} x2={Rt[0]} y2={Rt[1]} stroke="#c9ccd6" strokeWidth={16} strokeLinecap="round" />
				<circle cx={PX} cy={PY} r={26} fill={YEL} stroke={INK} strokeWidth={5} />
				<Pan c={L} long />
				<Pan c={Rt} long={false} />
				<Host n={n} f={f} x={135} s={0.62} armR={f >= tYou - 4 ? armTo(1, f, tYou - 4, 'down', 'pointer', 8) : 'down'} armL="hip" look={[0.2, 0.1]} tilt={-3} />
				<Goga
					n={n}
					f={f}
					x={945}
					s={0.62}
					face={{eyes: 'open', mouth: 'smile', brows: f >= tYou ? 'neutral' : 'worried', look: [-0.3, 0.1]}}
					armR="down"
					armL={f >= tYou - 4 ? armTo(-1, f, tYou - 4, 'down', 'point', 8) : 'down'}
					tilt={4}
				/>
			</Stage>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------------------------------------- 5. the vote -----
// «Пиши в комментариях: один — длинные. Два — короткие.»
export const S05: React.FC = () => {
	const n = 5;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tWrite = w(n, 'пиши');
	const tOne = w(n, 'один');
	const tTwo = w(n, 'два');
	return (
		<AbsoluteFill>
			<Page
				g={g}
				shadows={[
					[235, 85],
					[845, 85],
				]}
			/>
			<PopAt f={f} at={tWrite} y={225} from={1.3}>
				<Heavy size={120} color={INK} edge="#9aa0aa">
					ПИШИ В
				</Heavy>
			</PopAt>
			<PopAt f={f} at={tWrite + 6} y={355} from={1.3}>
				<Heavy size={118} color={RED} edge={RED_D}>
					КОММЕНТАРИЯХ
				</Heavy>
			</PopAt>
			<FormatCard f={f} at={tOne} x={285} y={770} num="1" label="ДЛИННЫЕ" color={BLUE} edge={BLUE_D} long rot={-3} />
			<FormatCard f={f} at={tTwo} x={795} y={770} num="2" label="КОРОТКИЕ" color={RED} edge={RED_D} long={false} rot={3} />
			<Stage>
				<Host n={n} f={f} x={235} s={0.56} armR={f >= tOne ? armTo(1, f, tOne, 'down', 'wave', 8) : 'down'} armL="hip" look={[0.3, -0.1]} tilt={-3} />
				<Goga
					n={n}
					f={f}
					x={845}
					s={0.56}
					face={{eyes: 'open', mouth: f >= tTwo ? 'open' : 'smile', brows: 'raised', look: [-0.3, -0.1]}}
					armR="down"
					armL={f >= tTwo ? armTo(-1, f, tTwo, 'down', 'wave', 8) : 'down'}
					tilt={3}
				/>
			</Stage>
		</AbsoluteFill>
	);
};

// ----------------------------------------------------------------------------------------- 6. a tug of war -----
// «Что победит — таких видео мы и будем делать чаще.» — they pull a rope, the flag goes back and forth
export const S06: React.FC = () => {
	const n = 6;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tWin = w(n, 'победит');
	const tOften = w(n, 'чаще');
	const shift = f < tWin ? 0 : Math.sin((f - tWin) / 9) * Math.min(1, (f - tWin) / 10) * (f >= tOften ? Math.max(0, 1 - (f - tOften) / 14) : 1);
	const FX = 540 + shift * 150;
	const ROPE_Y = 1255;
	const PULL = [
		{x: 300, s: 0.8},
		{x: 780, s: 0.8},
	];
	return (
		<AbsoluteFill>
			<Page
				g={g}
				shadows={[
					[PULL[0].x, 130],
					[PULL[1].x, 130],
				]}
			/>
			<PopAt f={f} at={tWin} y={300} from={1.3}>
				<Heavy size={200} color={INK} edge="#9aa0aa">
					КТО
				</Heavy>
			</PopAt>
			<PopAt f={f} at={tWin + 4} y={520} from={1.3}>
				<Heavy size={200} color={RED} edge={RED_D}>
					ПОБЕДИТ?
				</Heavy>
			</PopAt>
			<Stage>
				<line x1={FX} y1={ROPE_Y - 240} x2={FX} y2={ROPE_Y + 230} stroke={INK} strokeWidth={5} strokeDasharray="14 12" opacity={0.35} />
				<Host n={n} f={f} x={PULL[0].x} s={PULL[0].s} armR={arm([150, -330], [265, -300], {fist: true})} armL="hip" look={[0.7, 0.1]} tilt={-4 - shift * 3} lean={-7 + shift * 5} />
				<Goga
					n={n}
					f={f}
					x={PULL[1].x}
					s={PULL[1].s}
					face={{eyes: 'open', mouth: 'open', brows: 'angry', look: [-0.7, 0.1]}}
					armL={arm([-150, -330], [-265, -300], {fist: true})}
					armR="hip"
					tilt={4 - shift * 3}
					lean={7 + shift * 5}
				/>
				{/* the rope and the flag */}
				<path d={`M -30,${ROPE_Y} Q ${FX},${ROPE_Y + 36} 1110,${ROPE_Y}`} stroke="#5a3a1e" strokeWidth={22} fill="none" strokeLinecap="round" />
				<path d={`M -30,${ROPE_Y} Q ${FX},${ROPE_Y + 36} 1110,${ROPE_Y}`} stroke="#c9a26a" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="22 14" />
				<g transform={`translate(${FX} ${ROPE_Y + 22})`}>
					<line x1={0} y1={0} x2={0} y2={56} stroke={INK} strokeWidth={6} />
					<path d="M 0,56 L 62,86 L 0,116 Z" fill={YEL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
				</g>
			</Stage>
			<PopAt f={f} at={tOften} x={FX} y={1000} from={1.6}>
				<Heavy size={200} color={RED} edge={RED_D}>
					?
				</Heavy>
			</PopAt>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------------------------- 7. the finish -----
// «Голосуй, пока Гога не пролистал!» — and Гога flicks the whole video away like a short: the next one slides in from
// below — the first frame of this very video again, so the short loops without a seam
export const S07: React.FC = () => {
	const n = 7;
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const tVote = w(n, 'голосуй');
	const tSwipe = w(n, 'пролистал');
	const sw = interpolate(f, [tSwipe + 8, tSwipe + 20], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const flick = interpolate(f, [tSwipe + 4, tSwipe + 12], [0, 1], {...clamp, easing: ease});
	const SWIPE_ARM: ArmSpec = arm([130, -340 + flick * -70], [190, -380 + flick * -150], {finger: true});
	return (
		<AbsoluteFill style={{background: '#fff'}}>
			{sw > 0 && (
				<AbsoluteFill style={{transform: `translateY(${(1 - sw) * 1920}px)`}}>
					<Freeze frame={0}>
						<S01 />
					</Freeze>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{transform: `translateY(${-sw * 1920}px)`}}>
				<Page
					g={g}
					shadows={[
						[260, 140],
						[800, 140],
					]}
				/>
				<PopAt f={f} at={tVote} y={330} from={1.4}>
					<Heavy size={230} color={RED} edge={RED_D}>
						ГОЛОСУЙ!
					</Heavy>
				</PopAt>
				<PopAt f={f} at={tVote + 8} y={650}>
					<div style={{background: '#fff', border: `8px solid ${INK}`, borderRadius: 48, padding: '14px 52px 20px', boxShadow: '0 12px 0 rgba(0,0,0,0.12)', position: 'relative'}}>
						<Heavy size={110} color={INK}>
							<span style={{color: BLUE}}>1</span> или <span style={{color: RED}}>2</span>?
						</Heavy>
					</div>
				</PopAt>
				<Stage>
					<Host n={n} f={f} x={260} s={0.95} armR={f >= tSwipe ? armTo(1, f, tSwipe, 'pointer', 'down', 8) : 'pointer'} armL="hip" look={[0.5, -0.1]} tilt={-2} />
					<Goga
						n={n}
						f={f}
						x={800}
						s={0.95}
						face={{eyes: 'open', mouth: f >= tSwipe ? 'open' : 'smile', brows: f >= tSwipe ? 'raised' : 'neutral', look: [-0.2, -0.1]}}
						armL={f >= tSwipe - 6 ? armTo(-1, f, tSwipe - 6, 'down', mirrorArm(SWIPE_ARM), 8) : 'down'}
						armR="down"
						tilt={3}
					/>
				</Stage>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// the same arm on the other side (x mirrored)
const mirrorArm = (a: ArmSpec): ArmSpec => ({...a, el: [-a.el[0], a.el[1]], ha: [-a.ha[0], a.ha[1]], hang: -(a.hang ?? 0)});
