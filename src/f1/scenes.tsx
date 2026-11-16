// «Фильм про тебя» — часть 1 (продолжение «Папа вернулся с вахты»). 20 shots on the timeline of
// src/f1/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part f1).
// The hero is the son from «Папа»; the film on the cinema screen shows real shots of «Папа».
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Colors, Face, Head, Person} from '../components/Person';
import {Cam, Stage} from '../components/Stage';
import * as P1a from '../scenes/S01_S05';
import * as P6 from '../p6/scenes';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';

const {YELLOW, RED, rnd} = G1;
const {Finale} = G2;

const CASHIER: Colors = {hair: '#d9b45a', top: '#7a1f2c', topDark: '#5e1622', pants: '#f2c3a0', shoes: '#2a1a1a', skin: '#f2c3a0'};
const SEAT = '#a82a2a';
const SEAT_D = '#7e1d1d';

// play a scene from its frame `at` (the film on the screen)
const Play: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => (
	<Sequence from={-at} layout="none">
		{children}
	</Sequence>
);

// ======================================================= scene pieces =====
// a cinema seat seen from the front; (x, y) = front edge of the cushion
const Seat: React.FC<{x: number; y: number; s: number; up?: number}> = ({x, y, s, up = 0}) => (
	<g>
		<rect x={x - 64 * s} y={y - 200 * s} width={128 * s} height={196 * s} rx={30 * s} fill={SEAT_D} />
		<rect x={x - 54 * s} y={y - 186 * s} width={108 * s} height={150 * s} rx={22 * s} fill={SEAT} />
		{/* the cushion, folded up when `up` = 1 */}
		<g transform={`translate(${x},${y - 30 * s}) scale(1,${1 - 0.8 * up})`}>
			<rect x={-68 * s} y={0} width={136 * s} height={50 * s} rx={14 * s} fill={SEAT} stroke={SEAT_D} strokeWidth={4 * s} />
		</g>
		<rect x={x - 82 * s} y={y - 70 * s} width={16 * s} height={110 * s} rx={6 * s} fill="#2a2226" />
		<rect x={x + 66 * s} y={y - 70 * s} width={16 * s} height={110 * s} rx={6 * s} fill="#2a2226" />
	</g>
);
const ROWS = 9;
const rowY = (k: number) => 1820 - (k - 1) * 118; // k = 1 is the row nearest to the screen
const rowS = (k: number) => 1.05 - 0.06 * (k - 1);
const seatX = (k: number, i: number) => 540 + (i - 0.5) * 205 * rowS(k); // i = …,-1,0,1,2,… ; 0 and 1 are the middle seats
const SON_SEAT = 0;
const DAD_SEAT = 1;

// somebody sitting in a seat of row k (hips on the cushion)
const Sitter: React.FC<{kind: 'son' | 'dad'; k: number; i: number; id: string; f: number; face?: Face; back?: boolean; silhouette?: string; headTurn?: number; lean?: number}> = ({kind, k, i, id, f, face, back, silhouette, headTurn, lean = 0}) => {
	const s = rowS(k) * (kind === 'son' ? 0.78 : 0.74);
	const leg = kind === 'son' ? 330 : 470;
	const hip = rowY(k) - 26 * rowS(k);
	return (
		<g transform={lean ? `rotate(${lean} ${seatX(k, i)} ${hip})` : undefined}>
			<Person kind={kind} id={id} x={seatX(k, i)} y={hip + leg * s} scale={s} hideLegs back={back} silhouette={silhouette} breathe={f} headTurn={headTurn} face={face} armL={{target: [-80, -(leg + 60)], bend: 1}} armR={{target: [80, -(leg + 60)], bend: -1}} />
		</g>
	);
};

// the hall seen from the screen: rows of red seats, the projector beam; who sits in row 7 is given as children
const HallFront: React.FC<{f: number; light?: number; children?: React.ReactNode; row8?: React.ReactNode; dadSeatUp?: number}> = ({f, light = 1, children, row8, dadSeatUp = 0}) => {
	const seatsOf = (k: number) => (
		<g key={k}>
			{[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
				<Seat key={i} x={seatX(k, i)} y={rowY(k)} s={rowS(k)} up={k === 7 && i === DAD_SEAT ? dadSeatUp : 0} />
			))}
		</g>
	);
	return (
		<g>
			<rect x={-600} y={-600} width={2300} height={3200} fill="#1d161b" />
			{Array.from({length: 16}).map((_, k) => (
				<rect key={k} x={-600 + k * 150} y={-600} width={70} height={1600} fill="#241b21" />
			))}
			<rect x={490} y={190} width={100} height={60} rx={6} fill="#fff6d8" />
			<path d="M 500,240 L 580,240 L 1500,1900 L -420,1900 Z" fill="#fff6d8" opacity={0.06} />
			{Array.from({length: 18}).map((_, k) => (
				<circle key={k} cx={540 + (rnd(k) - 0.5) * 700 * rnd(k + 9)} cy={300 + ((f * (2 + rnd(k)) + rnd(k + 3) * 1400) % 1500)} r={2 + rnd(k + 5) * 3} fill="#fff6d8" opacity={0.35} />
			))}
			{[9, 8].map(seatsOf)}
			{row8}
			{seatsOf(7)}
			{children}
			<g>
				<rect x={seatX(7, -3) - 140} y={rowY(7) - 90} width={70} height={56} rx={8} fill="#c9b37a" />
				<text x={seatX(7, -3) - 105} y={rowY(7) - 47} fontSize={40} fontFamily={HEAVY} fontWeight={900} fill="#3a2a1a" textAnchor="middle">
					7
				</text>
			</g>
			{[6, 5, 4, 3, 2, 1].map(seatsOf)}
			{/* the screen light on the audience */}
			<rect x={-600} y={-600} width={2300} height={3200} fill="#6f8cff" opacity={0.07 + 0.03 * Math.sin(f / 3)} />
			<rect x={-600} y={-600} width={2300} height={3200} fill="#000" opacity={0.25 + 0.5 * (1 - light)} />
		</g>
	);
};

// the cinema screen seen from behind the audience; `children` is the film (a 1080×1920 scene, middle band shown)
const ScreenView: React.FC<{f: number; children?: React.ReactNode; zoom?: number; dark?: number; heads?: 'both' | 'son' | 'none'}> = ({f, children, zoom = 1, dark = 0, heads = 'both'}) => {
	const flick = 0.94 + 0.06 * rnd(Math.floor(f / 2));
	return (
		<AbsoluteFill style={{background: '#050507', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 700px'}}>
				<div style={{position: 'absolute', left: -40, top: 140, width: 1160, height: 1120, background: '#0b0b0e', boxShadow: '0 0 160px rgba(160,180,255,0.25)'}} />
				<div style={{position: 'absolute', left: 0, top: 170, width: 1080, height: 1060, overflow: 'hidden', filter: `saturate(0.85) contrast(1.05) brightness(${flick})`}}>
					<div style={{position: 'absolute', left: 0, top: -430, width: 1080, height: 1920}}>{children}</div>
					<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 5px)'}} />
					<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
					{dark > 0 && <AbsoluteFill style={{background: '#000', opacity: dark}} />}
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{/* the light spilling from the screen onto the seats */}
					<defs>
						<linearGradient id="f1spill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#9fb4ff" stopOpacity={0.25 * (1 - dark)} />
							<stop offset="100%" stopColor="#9fb4ff" stopOpacity={0} />
						</linearGradient>
					</defs>
					<rect x={0} y={1230} width={1080} height={690} fill="url(#f1spill)" />
					{/* backs of the seats: row 6 far, row 7 ours, row 8 near the camera */}
					{[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
						<rect key={`r6${i}`} x={540 + (i - 0.5) * 175 - 75} y={1300} width={150} height={150} rx={30} fill="#2a0e10" />
					))}
					{heads !== 'none' && (
						<g>
							<Person kind="son" id="f1sv1" x={470} y={1295 + 735.6 * 0.62} scale={0.62} hideLegs back silhouette="#0d0a0c" />
							{heads === 'both' && <Person kind="dad" id="f1sv2" x={650} y={1265 + 1024.4 * 0.6} scale={0.6} hideLegs back silhouette="#0d0a0c" />}
						</g>
					)}
					{[-2, -1, 0, 1, 2, 3].map((i) => (
						<rect key={`r7${i}`} x={540 + (i - 0.5) * 230 - 100} y={1400} width={200} height={260} rx={40} fill="#1f0a0c" />
					))}
					{[-1, 0, 1, 2].map((i) => (
						<rect key={`r8${i}`} x={540 + (i - 0.5) * 330 - 150} y={1680} width={300} height={320} rx={56} fill="#140607" />
					))}
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// the entrance of your block at dusk (as the film shows it)
const Entrance: React.FC = () => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#2b2f5a" />
		<rect x={-200} y={-200} width={1480} height={1700} fill="#bdb6a6" />
		{Array.from({length: 4}).flatMap((_, r) =>
			Array.from({length: 4}).map((__, c) => (
				<rect key={`${r}-${c}`} x={-120 + c * 360} y={-100 + r * 260} width={150} height={150} fill={rnd(r * 5 + c) > 0.5 ? '#ffd98a' : '#4a5270'} />
			)),
		)}
		<rect x={360} y={1020} width={360} height={480} fill="#3a4a3a" />
		<rect x={380} y={1040} width={150} height={460} fill="#4a5e4a" />
		<rect x={550} y={1040} width={150} height={460} fill="#4a5e4a" />
		<rect x={320} y={980} width={440} height={40} fill="#8a8478" />
		<circle cx={540} cy={950} r={20} fill="#fff6c8" />
		<circle cx={540} cy={950} r={90} fill="#fff6c8" opacity={0.2} />
		<rect x={730} y={1180} width={60} height={90} rx={8} fill="#2a2d33" />
		<rect x={500} y={900} width={80} height={40} rx={6} fill="#2a5a8a" />
		<text x={540} y={930} fontSize={30} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
			3
		</text>
		<rect x={-400} y={1500} width={1880} height={900} fill="#4a4a50" />
		<rect x={820} y={1400} width={260} height={30} fill="#7a5a3a" />
		<rect x={840} y={1430} width={16} height={70} fill="#5a3a2a" />
		<rect x={1040} y={1430} width={16} height={70} fill="#5a3a2a" />
	</g>
);

// a film title card on the screen, «Папа» style
const FilmTitle: React.FC<{t: number; big: string; small?: string; color?: string; size?: number}> = ({t, big, small, color = '#fff', size = 120}) => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a10 0%, #1a1208 58%, #070503 100%)'}}>
		<div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
			{small && <div style={{fontSize: 40, letterSpacing: 12, color: '#ff4a3d', opacity: interpolate(t, [0, 8], [0, 1], clamp)}}>{small}</div>}
			<div style={{fontSize: size, lineHeight: 1.05, color, marginTop: 16, transform: `scale(${pop(t, 2, 12)})`, textShadow: '0 8px 0 rgba(0,0,0,0.5)', whiteSpace: 'pre-line'}}>{big}</div>
		</div>
	</AbsoluteFill>
);

// the ticket: front (title, hall, row, seat, price) or back (dad's handwriting); write = 0..1 how much is written
const Ticket: React.FC<{side: 'front' | 'back'; write?: number}> = ({side, write = 1}) => (
	<div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 420, borderRadius: 18, background: side === 'front' ? '#f4e6c4' : '#efe2c0', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: HEAVY, fontWeight: 900, color: '#3a2a1a', overflow: 'hidden', boxSizing: 'border-box', padding: '34px 50px'}}>
		<div style={{position: 'absolute', left: 600, top: 0, bottom: 0, borderLeft: '6px dashed #c9b48a'}} />
		{side === 'front' ? (
			<>
				<div style={{fontSize: 28, letterSpacing: 6, color: '#a8322a'}}>КИНОТЕАТР «ОКТЯБРЬ»</div>
				<div style={{fontSize: 50, lineHeight: 1.05, marginTop: 14, width: 520}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
				<div style={{fontSize: 32, marginTop: 24, fontFamily: MONO}}>ЗАЛ 1 · РЯД 7 · МЕСТА 13–14</div>
				<div style={{position: 'absolute', left: 618, top: 120, width: 160, textAlign: 'center', fontSize: 40, lineHeight: 1.1}}>
					ЦЕНА
					<div style={{fontSize: 90, color: '#a8322a'}}>0 ₽</div>
				</div>
			</>
		) : (
			<div style={{position: 'absolute', left: 60, top: 120, fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontWeight: 700, fontStyle: 'italic', fontSize: 92, color: '#1f2a6a', transform: 'rotate(-6deg)', clipPath: `inset(0 ${100 - 100 * write}% 0 0)`, whiteSpace: 'nowrap'}}>
				Не досматривай
			</div>
		)}
	</div>
);

// the cinema at dusk: neon «КИНО», the poster of the film
const CinemaFront: React.FC<{f: number}> = ({f}) => {
	const neon = Math.floor(f / 5) % 13 === 7 ? 0.4 : 1;
	return (
		<g>
			<defs>
				<linearGradient id="f1dusk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#1d2350" />
					<stop offset="100%" stopColor="#7a4a6a" />
				</linearGradient>
			</defs>
			<rect x={-400} y={-400} width={1880} height={1400} fill="url(#f1dusk)" />
			<rect x={40} y={380} width={1000} height={1100} fill="#c9b9a0" />
			<rect x={20} y={360} width={1040} height={40} fill="#9a8a72" />
			{[120, 300, 780, 960].map((x) => (
				<rect key={x} x={x - 30} y={400} width={60} height={1080} fill="#b5a58c" />
			))}
			<text x={540} y={560} fontSize={150} fontFamily={HEAVY} fontWeight={900} fill="#ff4a5a" textAnchor="middle" opacity={neon} style={{filter: `drop-shadow(0 0 ${18 * neon}px #ff2a4a)`}}>
				КИНО
			</text>
			{/* the poster */}
			<rect x={600} y={700} width={300} height={430} fill="#1a1208" stroke="#d9c27a" strokeWidth={12} />
			<text x={750} y={770} fontSize={30} fontFamily={HEAVY} fontWeight={900} fill="#ff4a3d" textAnchor="middle">
				ПАПА
			</text>
			<text x={750} y={806} fontSize={22} fontFamily={HEAVY} fontWeight={900} fill="#ffc25a" textAnchor="middle">
				ВЕРНУЛСЯ С ВАХТЫ
			</text>
			<rect x={700} y={860} width={100} height={220} fill="#3a2a20" />
			<Person kind="dad" id="f1post" x={750} y={1080} scale={0.2} silhouette="#0a0806" />
			{/* doors */}
			<rect x={330} y={1080} width={340} height={400} fill="#3a4a5a" />
			<rect x={340} y={1090} width={155} height={390} fill="#8fb0c8" opacity={0.6} />
			<rect x={505} y={1090} width={155} height={390} fill="#8fb0c8" opacity={0.6} />
			<rect x={-400} y={1480} width={1880} height={900} fill="#4a4a50" />
			<rect x={-400} y={1480} width={1880} height={16} fill="#5d5d66" />
		</g>
	);
};

// ============================================================== SHOTS =======
// 1. A week since the real dad came back → he takes you to the cinema.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [100]);
	if (i === 0) {
		// a photo from that week: dad is home
		const p = pop(t, 2, 12);
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a1a 0%, #120c08 70%)'}}>
				<div style={{position: 'absolute', left: 190, top: 300, width: 700, height: 800, background: '#f7f3ea', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', transform: `rotate(${-4 + 2 * (1 - p)}deg) scale(${0.9 + 0.1 * p})`, padding: 34, boxSizing: 'border-box'}}>
					<div style={{position: 'relative', width: 632, height: 600, overflow: 'hidden', background: '#d9c7a0'}}>
						<svg width={632} height={600} viewBox="230 560 632 600">
							<G2.Hall id="f1s1h" noBag />
							<Person kind="dad" id="f1s1d" x={640} y={1500} scale={0.82} breathe={t} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', stubble: true}} armL={{target: [-170, -620], bend: 1}} />
							<Person kind="son" id="f1s1s" x={470} y={1500} scale={0.85} breathe={t} face={{eyes: 'happy', mouth: 'grin', brows: 'raised'}} />
						</svg>
					</div>
					<div style={{marginTop: 18, textAlign: 'center', fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontStyle: 'italic', fontWeight: 700, fontSize: 60, color: '#2a3a6a'}}>Папа дома!</div>
				</div>
			</AbsoluteFill>
		);
	}
	const w = lerp(t, 0, 50, 0, 1, Easing.linear);
	return (
		<Stage cam={{s: lerp(t, 0, 50, 0.95, 1.05) * kick(t), cx: 540, cy: 1050}} light={{glow: 0.2, vignette: 0.6}} bg="#1d2350">
			<CinemaFront f={t} />
			<Person kind="dad" id="f1s1d2" x={170 + 250 * w} y={1545} scale={0.37} walk={t * 0.35} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', stubble: true, look: [0.6, 0]}} />
			<Person kind="son" id="f1s1s2" x={60 + 250 * w} y={1550} scale={0.38} walk={t * 0.4} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0.6, -0.2]}} />
		</Stage>
	);
};

// 2. Free tickets → the cashier: «Этот фильм — про вас».
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [48]);
	if (i === 0) {
		const stamp = pop(t, 24, 9);
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #5a3a2a 0%, #1a100a 75%)'}}>
				<div style={{transform: `rotate(-3deg) scale(${lerp(t, 0, 48, 1.0, 1.06) * kick(t)})`, position: 'absolute', inset: 0}}>
					<Ticket side="front" />
				</div>
				{stamp > 0.01 && (
					<div style={{position: 'absolute', left: 560, top: 940, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * -20 - 8}deg)`, opacity: Math.min(1, stamp * 2), border: `8px solid ${RED}`, color: RED, borderRadius: 16, padding: '4px 26px', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, background: 'rgba(255,240,230,0.85)'}}>
						БЕСПЛАТНО
					</div>
				)}
			</AbsoluteFill>
		);
	}
	const talk = t >= 34 && t < 72 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 81, 1.0, 1.12) * kick(t), cx: 540, cy: 900}} light={{glow: 0.2, vignette: 0.7}} bg="#2a1a14">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#3a2418" />
			<rect x={140} y={360} width={800} height={900} rx={20} fill="#1a1a20" />
			<Bust kind="mom" id="f1s2c" colors={CASHIER} x={540} y={820} scale={3.6} face={{eyes: 'stare', pupil: 0.6, brows: 'raised', mouth: talk ? 'o' : 'grin', look: [0, 0], blush: false}} />
			<rect x={140} y={360} width={800} height={900} rx={20} fill="#bfe0ff" opacity={0.12} />
			<path d="M 200,420 L 420,420 L 260,700 Z" fill="#fff" opacity={0.12} />
			<rect x={100} y={1200} width={880} height={120} fill="#7a4a2c" />
			<rect x={380} y={1180} width={320} height={40} rx={10} fill="#2a1a10" />
			<text x={540} y={340} fontSize={52} fontFamily={HEAVY} fontWeight={900} fill={YELLOW} textAnchor="middle">
				КАССА
			</text>
		</Stage>
	);
};

// 3. The hall is empty. Only the two of you. Row seven.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const z = lerp(f, 20, 80, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<Stage cam={{s: 0.8 + 0.5 * z, cx: 540, cy: 1180 + (1000 - 1180) * z}} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
			<HallFront f={f}>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s3s" f={f} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0.5, -0.2]}} />
				<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s3d" f={f} face={{eyes: 'open', mouth: 'smile', brows: 'neutral', stubble: true, look: [-0.4, -0.2]}} />
			</HallFront>
		</Stage>
	);
};

// 4. The lights go down. On the screen: «Папа вернулся с вахты».
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const on = interpolate(f, [24, 40], [1, 0], clamp);
	return (
		<ScreenView f={f} dark={on} zoom={lerp(f, 0, 126, 1.0, 1.08)}>
			{f >= 60 ? <FilmTitle t={f - 60} small="ПАПА" big={'ВЕРНУЛСЯ\nС ВАХТЫ'} /> : <AbsoluteFill style={{background: '#0b0b0e'}} />}
		</ScreenView>
	);
};

// 5. You see your entrance. Your flat. Yourself.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44, 76]);
	return (
		<ScreenView f={f} zoom={1.12}>
			{i === 0 ? (
				<Stage cam={{s: lerp(t, 0, 44, 1.0, 1.08), cx: 540, cy: 1100}} light={{glow: 0.2, vignette: 0.6}} bg="#2b2f5a">
					<Entrance />
				</Stage>
			) : i === 1 ? (
				<Freeze frame={20}>
					<P1a.S01 />
				</Freeze>
			) : (
				<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.6}} bg="#d9c7a0">
					<rect x={-400} y={-400} width={1880} height={2800} fill="#e8d6b0" />
					<Bust kind="son" id="f1s5b" x={540} y={1000} scale={5.2} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0, 0]}} />
				</Stage>
			)}
		</ScreenView>
	);
};

// 6. There you open the door — and there's dad. Only not the real one.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const stamp = pop(f, 76, 9);
	return (
		<AbsoluteFill>
			<ScreenView f={f} zoom={1.14}>
				<Play at={110 + f}>
					<P1a.S01 />
				</Play>
			</ScreenView>
			{stamp > 0.01 && (
				<div style={{position: 'absolute', left: 540, top: 560, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * -20 - 6}deg)`, opacity: Math.min(1, stamp * 2), border: `9px solid ${RED}`, color: RED, borderRadius: 18, padding: '6px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 84, background: 'rgba(10,10,12,0.75)'}}>
					НЕ ОН
				</div>
			)}
		</AbsoluteFill>
	);
};

// 7. Everything that happened: borscht, «тигрёнок», garage 17 — even your word «карась».
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [33, 47, 66, 125]);
	const tag = (text: string) => (
		<div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,0) scale(${pop(t, 1, 9)})`, background: 'rgba(14,14,16,0.92)', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '4px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: YELLOW, whiteSpace: 'nowrap'}}>{text}</div>
	);
	let film: React.ReactNode;
	if (i === 0) {
		film = (
			<Play at={160 + t}>
				<P1a.S01 />
			</Play>
		);
	} else if (i === 1) {
		film = (
			<Freeze frame={60}>
				<P1a.S04 />
			</Freeze>
		);
	} else if (i === 2) {
		film = (
			<Freeze frame={60}>
				<P1a.S03 />
			</Freeze>
		);
	} else if (i === 3) {
		film = (
			<Play at={20 + t}>
				<P6.S10 />
			</Play>
		);
	} else {
		film = <FilmTitle t={t} small="СЕКРЕТНОЕ СЛОВО" big="«КАРАСЬ»" color={YELLOW} />;
	}
	return (
		<AbsoluteFill>
			<ScreenView f={f} zoom={1.14}>
				{film}
			</ScreenView>
			{i === 1 && tag('БОРЩ')}
			{i === 2 && tag('«ТИГРЁНОК»')}
			{i === 3 && tag('ГАРАЖ №17')}
		</AbsoluteFill>
	);
};

// 8. Nobody knew that but the two of you → «Пап, кто это снял?» Dad says nothing.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [64]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 64, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05060a">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#141220" />
				<Bust kind="son" id="f1s8b" x={540} y={1000} scale={6.0} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [0, -0.3], blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#7f9bff" opacity={0.12 + 0.05 * Math.sin(t / 2)} />
			</Stage>
		);
	}
	const whisper = t >= 26 && t < 64 && Math.floor(t / 4) % 2 === 0;
	return (
		<Stage cam={{s: lerp(t, 0, 110, 2.15, 2.3) * kick(t), cx: 600, cy: 860}} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
			<HallFront f={t}>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s8s" f={t} headTurn={0.5} face={{eyes: 'wide', mouth: whisper ? 'o' : 'flat', brows: 'worried', look: [0.9, 0]}} />
				<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s8d" f={t} face={{eyes: 'stare', pupil: 0.7, mouth: 'flat', brows: 'flat', stubble: true, look: [0, -0.2]}} />
			</HallFront>
		</Stage>
	);
};

// the hall as the film shows it: you two in row 7 (or what the film says will happen)
const FilmHall: React.FC<{t: number; sonBack?: boolean; dad?: boolean; ring?: number; shadow?: number; zoom?: number; idp?: string}> = ({t, sonBack = false, dad = true, ring = 0, shadow = 0, zoom = 1.25, idp = 'f1fh'}) => {
	const c: Cam = {s: zoom, cx: 600, cy: 900};
	return (
		<Stage cam={c} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
			<HallFront
				f={t}
				row8={
					shadow > 0 ? (
						<g opacity={Math.min(1, shadow * 1.5)} transform={`translate(${-46 * Math.min(1, shadow)},${110 * Math.min(1, shadow)})`}>
							<Sitter kind="dad" k={8} i={SON_SEAT} id={`${idp}x`} f={t} silhouette="#050406" lean={10 * Math.min(1, shadow)} />
						</g>
					) : null
				}
			>
				<Sitter kind="son" k={7} i={SON_SEAT} id={`${idp}s`} f={t} back={sonBack} face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [0, 0]}} />
				{dad && <Sitter kind="dad" k={7} i={DAD_SEAT} id={`${idp}d`} f={t} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', stubble: true, look: [0, 0]}} />}
				{ring > 0 && <ellipse cx={seatX(7, DAD_SEAT)} cy={rowY(7) - 170} rx={110 * (0.6 + 0.4 * ring)} ry={170 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={12} opacity={Math.min(1, ring)} />}
			</HallFront>
		</Stage>
	);
};

// 9. Suddenly the screen shows this very hall. Row seven. You and dad. It's now.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const now = f >= 124;
	return (
		<AbsoluteFill>
			<ScreenView f={f} zoom={lerp(f, 0, 150, 1.12, 1.22)}>
				<FilmHall t={f} />
				{now && (
					<div style={{position: 'absolute', left: 70, top: 720, fontFamily: MONO, fontWeight: 700, fontSize: 52, color: '#ff4a3d', textShadow: '0 0 12px rgba(255,60,50,0.9)', opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0.5}}>● СЕЙЧАС</div>
				)}
			</ScreenView>
			{now && f < 132 && <AbsoluteFill style={{background: '#fff', opacity: 0.25}} />}
		</AbsoluteFill>
	);
};

// 10. On the screen you slowly turn round. And dad's seat beside you is empty.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={1.2}>
			<FilmHall t={f} sonBack={f >= 40} dad={false} ring={pop(f, 112, 10)} />
		</ScreenView>
	);
};

// 11. You look to the side. Dad is here. He sits and doesn't blink.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Stage cam={{s: lerp(f, 0, 105, 3.0, 3.3) * kick(f), cx: 660, cy: 820}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
			<HallFront f={f}>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s11s" f={f} headTurn={0.5} face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [0.9, 0]}} />
				<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s11d" f={f} face={{eyes: 'stare', pupil: 0.6, mouth: 'flat', brows: 'flat', stubble: true, look: [0, -0.2]}} />
			</HallFront>
		</Stage>
	);
};

// 12. Behind you a seat creaks. Somebody sits down right behind you.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const sit = lerp(f, 40, 62, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<Stage cam={{s: lerp(f, 0, 99, 1.9, 2.05) * kick(f), cx: 560, cy: 860}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
			<HallFront
				f={f}
				row8={
					f >= 36 ? (
						<g transform={`translate(0,${-140 * (1 - sit)})`}>
							<Sitter kind="dad" k={8} i={SON_SEAT} id="f1s12x" f={f} silhouette="#050406" />
						</g>
					) : null
				}
			>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s12s" f={f} face={{eyes: 'wide', pupil: f >= 48 ? 0.5 : 1, mouth: f >= 48 ? 'o' : 'flat', brows: 'raised', look: [0, -0.3]}} />
				<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s12d" f={f} face={{eyes: 'stare', pupil: 0.6, mouth: 'flat', brows: 'flat', stubble: true, look: [0, -0.2]}} />
			</HallFront>
		</Stage>
	);
};

// 13. On the screen a dark figure leans to your ear…
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={lerp(f, 0, 90, 1.2, 1.32)}>
			<FilmHall t={f} zoom={1.7} shadow={lerp(f, 20, 70, 0.3, 1)} />
		</ScreenView>
	);
};

// 14. «Привет, тигрёнок» (a whisper right at your ear).
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const words = [
		{w: 'ПРИВЕТ,', at: 8},
		{w: 'ТИГРЁНОК', at: 24},
	];
	const jit = (k: number) => (rnd(f * 3 + k) - 0.5) * 10;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 57, 1.0, 1.08) * kick(f), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#030304">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#0d0c14" />
				<Bust kind="son" id="f1s14b" x={460} y={1080} scale={5.4} turn={-0.3} face={{eyes: 'wide', pupil: 0.45, brows: 'raised', mouth: 'flat', look: [0.8, 0], blush: false}} />
				<g transform="translate(1030,1010) scale(4.2)">
					<Head kind="dad" silhouette="#020203" uid="f1s14x" />
				</g>
				<rect x={-500} y={-500} width={2200} height={3000} fill="#7f9bff" opacity={0.08} />
			</Stage>
			<div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 130, lineHeight: 1.1}}>
				{words.map((x, k) =>
					f >= x.at ? (
						<div key={k} style={{position: 'relative', transform: `scale(${pop(f, x.at, 9)}) translateX(${jit(k)}px)`}}>
							<span style={{position: 'absolute', left: 0, right: 0, color: '#00e5ff', opacity: 0.5, transform: 'translateX(-8px)'}}>{x.w}</span>
							<span style={{position: 'relative', color: k === 0 ? '#fff' : RED, textShadow: '6px 0 0 rgba(255,0,60,0.5)'}}>{x.w}</span>
						</div>
					) : (
						<div key={k} style={{height: 143}} />
					),
				)}
			</div>
		</AbsoluteFill>
	);
};

// 15. Not from the speakers → right behind your back.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [44]);
	if (i === 0) {
		const x = pop(t, 22, 9);
		return (
			<AbsoluteFill>
				<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
					<rect x={-400} y={-400} width={1880} height={2800} fill="#1d161b" />
					{[200, 880].map((cx) => (
						<g key={cx}>
							<rect x={cx - 150} y={560} width={300} height={560} rx={20} fill="#2a2a30" />
							<circle cx={cx} cy={720} r={90} fill="#121216" stroke="#3a3a42" strokeWidth={10} />
							<circle cx={cx} cy={980} r={60} fill="#121216" stroke="#3a3a42" strokeWidth={10} />
						</g>
					))}
				</Stage>
				{x > 0.01 &&
					[200, 880].map((cx) => (
						<svg key={cx} width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
							<g transform={`translate(${cx},840) scale(${x})`} stroke={RED} strokeWidth={26} strokeLinecap="round">
								<line x1={-150} y1={-150} x2={150} y2={150} />
								<line x1={150} y1={-150} x2={-150} y2={150} />
							</g>
						</svg>
					))}
			</AbsoluteFill>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 55, 1.0, 1.1) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#030304">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#0d0c14" />
			<Bust kind="son" id="f1s15b" x={540} y={1060} scale={6.0} face={{eyes: 'wide', pupil: 0.4, brows: 'raised', mouth: 'o', look: [-0.95, 0.1], blush: false}} />
			{[0, 1, 2].map((k) => {
				const p = ((t + k * 9) % 27) / 27;
				return <path key={k} d={`M ${100 - 40 * p},${900 - 60 * p} q -40,40 0,80 q 40,40 0,80`} stroke="#cfd8ff" strokeWidth={10} fill="none" opacity={0.6 * (1 - p)} />;
			})}
			<rect x={-500} y={-500} width={2200} height={3000} fill="#7f9bff" opacity={0.1} />
		</Stage>
	);
};

// 16. You turn round — nobody behind. The seat folds up as if someone just got up.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const up = lerp(f, 30, 60, 0, 1, Easing.out(Easing.cubic));
	const [sx, sy] = shake(f, 0, 14, 8);
	return (
		<Stage cam={{s: 1.7 * kick(f), cx: 540 + sx, cy: 1000 + sy}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#1d161b" />
			{[-2, -1, 0, 1, 2].map((i) => (
				<Seat key={i} x={540 + i * 200} y={1300} s={1.3} up={i === 0 ? up : 0} />
			))}
			<rect x={-400} y={-400} width={1880} height={2800} fill="#000" opacity={0.25} />
		</Stage>
	);
};

// 17. You turn back — dad's seat is empty. Just like on the screen.
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 80, 2.2, 2.4) * kick(t), cx: 600, cy: 870}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
				<HallFront f={t} dadSeatUp={0}>
					<Sitter kind="son" k={7} i={SON_SEAT} id="f1s17s" f={t} headTurn={0.5} face={{eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'raised', look: [0.9, 0]}} />
				</HallFront>
			</Stage>
		);
	}
	// the film | for real
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(-470px)'}}>
					<FilmHall t={t} sonBack dad={false} zoom={1.6} idp="f1s17top" />
				</div>
				<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 6px)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(490px)'}}>
					<FilmHall t={t} dad={false} zoom={1.6} idp="f1s17bot" />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: '#fff'}} />
			<div style={{position: 'absolute', left: 40, top: 300, background: 'rgba(14,14,16,0.9)', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '4px 20px', fontFamily: HEAVY, fontWeight: 900, fontSize: 42, color: YELLOW, transform: `scale(${pop(t, 2, 10)})`}}>НА ЭКРАНЕ</div>
			<div style={{position: 'absolute', left: 40, top: 1000, background: 'rgba(14,14,16,0.9)', border: `5px solid ${RED}`, borderRadius: 14, padding: '4px 20px', fontFamily: HEAVY, fontWeight: 900, fontSize: 42, color: RED, transform: `scale(${pop(t, 10, 10)})`}}>НА САМОМ ДЕЛЕ</div>
		</AbsoluteFill>
	);
};

// 18. On the seat lies only his ticket. On the back, in dad's handwriting: «Не досматривай».
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 56, 2.6, 2.9) * kick(t), cx: 540, cy: 1330}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
				<rect x={-400} y={-400} width={1880} height={2800} fill="#1d161b" />
				<Seat x={540} y={1300} s={1.3} />
				<g transform="translate(540,1262) rotate(-8)">
					<rect x={-70} y={-24} width={140} height={60} rx={6} fill="#f4e6c4" />
					<rect x={40} y={-24} width={4} height={60} fill="#c9b48a" />
				</g>
				<rect x={-400} y={-400} width={1880} height={2800} fill="#7f9bff" opacity={0.08} />
			</Stage>
		);
	}
	const flip = t < 10 ? Math.cos((t / 10) * Math.PI) : -1;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a2030 0%, #08060a 75%)'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scaleX(${Math.max(0.03, Math.abs(flip))}) rotate(-3deg) scale(${lerp(t, 0, 97, 1.0, 1.08)})`}}>
				<Ticket side={flip > 0 ? 'front' : 'back'} write={lerp(t, 44, 76, 0, 1, Easing.linear)} />
			</div>
		</AbsoluteFill>
	);
};

// 19. The screen lights up: «Продолжение следует». You are alone in the hall.
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={lerp(f, 0, 105, 1.0, 1.06)} heads="son">
			{f >= 18 ? <FilmTitle t={f - 18} big={'ПРОДОЛЖЕНИЕ\nСЛЕДУЕТ…'} size={84} /> : <AbsoluteFill style={{background: '#0b0b0e'}} />}
		</ScreenView>
	);
};

// 20. Finale: run out and look for dad, or stay and watch the film to the end?
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="ЧАСТЬ 2"
			series="ФИЛЬМ ПРО ТЕБЯ"
			boxes={3}
			boxLabel="КАК В ФИЛЬМЕ"
			opt1={{text: 'ИСКАТЬ ПАПУ', sub: 'выбежать из зала'}}
			opt2={{text: 'ДОСМОТРЕТЬ', sub: 'фильм до конца'}}
			tallyLine={
				<>
					СБЫЛОСЬ КАК В ФИЛЬМЕ: <span style={{color: '#7ee08a'}}>2</span> · ДАЛЬШЕ — <span style={{color: YELLOW}}>ПОД ВОПРОСОМ</span>
				</>
			}
			bg={
				<AbsoluteFill>
					<ScreenView f={f} heads="son">
						<FilmTitle t={30} big="" />
					</ScreenView>
					<AbsoluteFill style={{background: '#000', opacity: 0.55}} />
				</AbsoluteFill>
			}
		/>
	);
};
