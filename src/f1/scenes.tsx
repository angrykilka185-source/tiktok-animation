// «Фильм про тебя» — часть 1 (продолжение «Папа вернулся с вахты»), версия 2: в кино идёт обычный мультик
// про космос, потом сбой — и на экране твоя жизнь. Этого не замечает никто, кроме тебя.
// 19 shots on the timeline of src/f1/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part f1).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Colors, Face, Head, Kind, Person, SPECS} from '../components/Person';
import {Cam, Stage, toScreen} from '../components/Stage';
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
export const Play: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => (
	<Sequence from={-at} layout="none">
		{children}
	</Sequence>
);

// ======================================================= scene pieces =====
// a cinema seat seen from the front; (x, y) = front edge of the cushion
export const Seat: React.FC<{x: number; y: number; s: number; up?: number}> = ({x, y, s, up = 0}) => (
	<g>
		<rect x={x - 64 * s} y={y - 200 * s} width={128 * s} height={196 * s} rx={30 * s} fill={SEAT_D} />
		<rect x={x - 54 * s} y={y - 186 * s} width={108 * s} height={150 * s} rx={22 * s} fill={SEAT} />
		<g transform={`translate(${x},${y - 30 * s}) scale(1,${1 - 0.8 * up})`}>
			<rect x={-68 * s} y={0} width={136 * s} height={50 * s} rx={14 * s} fill={SEAT} stroke={SEAT_D} strokeWidth={4 * s} />
		</g>
		<rect x={x - 82 * s} y={y - 70 * s} width={16 * s} height={110 * s} rx={6 * s} fill="#2a2226" />
		<rect x={x + 66 * s} y={y - 70 * s} width={16 * s} height={110 * s} rx={6 * s} fill="#2a2226" />
	</g>
);
export const AISLE = 140; // a cross aisle in front of row 7: nobody in front hides you and dad
export const rowY = (k: number) => 1820 - (k - 1) * 118 + (k <= 6 ? AISLE : 0); // k = 1 is the row nearest to the screen
export const rowS = (k: number) => 1.05 - 0.06 * (k - 1);
// seats i = -3..4; 0 and 1 are the middle ones. Even rows are staggered half a seat to the left
// (so the seat «right behind you» in row 8 shows beside your head)
export const seatX = (k: number, i: number) => 540 + (i - 0.5 - (k % 2 === 0 ? 0.5 : 0)) * 205 * rowS(k);
export const SEATS = [-3, -2, -1, 0, 1, 2, 3, 4];
export const SON_SEAT = 0;
export const DAD_SEAT = 1;
// people in the seats, relative to the row's perspective scale (heads and shoulders above the seat backs)
export const VSCALE: Record<Kind, number> = {son: 0.64, girl: 0.64, teen: 0.62, mom: 0.6, dad: 0.6};

// popcorn in a striped bucket; (x, y) = bottom centre
export const Popcorn: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[-30, -6, 18, 38, -18, 8, 30].map((px, k) => (
			<circle key={k} cx={px * 0.9} cy={-112 - (k > 3 ? 18 : 0)} r={18} fill="#fff3c4" stroke="#e8c870" strokeWidth={3} />
		))}
		<path d="M -50,-110 L 50,-110 L 40,0 L -40,0 Z" fill="#fff" />
		{[-34, -10, 14, 36].map((sx) => (
			<path key={sx} d={`M ${sx},-110 L ${sx * 0.8 + 6},0 L ${sx * 0.8 - 4},0 L ${sx - 10},-110 Z`} fill="#d63b2f" />
		))}
	</g>
);

type Arm = {target: [number, number]; bend?: 1 | -1; ku?: number; kf?: number};
// one of the two heroes sitting in a seat of row k (hips on the cushion)
export const Sitter: React.FC<{kind: 'son' | 'dad'; k: number; i: number; id: string; f: number; face?: Face; back?: boolean; silhouette?: string; headTurn?: number; lean?: number; armL?: Arm; armR?: Arm; popcorn?: boolean}> = ({
	kind,
	k,
	i,
	id,
	f,
	face,
	back,
	silhouette,
	headTurn,
	lean = 0,
	armL,
	armR,
	popcorn = false,
}) => {
	const s = rowS(k) * VSCALE[kind];
	const leg = SPECS[kind].leg;
	const hip = rowY(k) - 26 * rowS(k);
	const x = seatX(k, i);
	return (
		<g transform={lean ? `rotate(${lean} ${x} ${hip})` : undefined}>
			<Person kind={kind} id={id} x={x} y={hip + leg * s} scale={s} hideLegs back={back} silhouette={silhouette} breathe={f} headTurn={headTurn} face={face} armL={armL ?? {target: [-80, -(leg + 60)], bend: 1}} armR={armR ?? {target: [80, -(leg + 60)], bend: -1}} />
			{popcorn && <Popcorn x={x - 40 * s} y={hip - 20 * s} s={s * 0.9} />}
		</g>
	);
};
// dad's ticket, left on his seat when he is gone
export const SeatTicket: React.FC = () => (
	<g transform={`translate(${seatX(7, DAD_SEAT)},${rowY(7) - 18}) rotate(-8) scale(${rowS(7)})`}>
		<rect x={-34} y={-12} width={68} height={26} rx={3} fill="#f4e6c4" />
		<rect x={18} y={-12} width={2} height={26} fill="#c9b48a" />
	</g>
);

// where a hero's face is in the scene (for spotlights and labels)
export const faceAt = (kind: 'son' | 'dad', k: number, i: number) => {
	const sp = SPECS[kind];
	const s = rowS(k) * VSCALE[kind];
	const hip = rowY(k) - 26 * rowS(k);
	return {x: seatX(k, i), y: hip - (sp.torso + sp.neck - 10 + sp.hh * 0.85) * s, r: sp.hh * s};
};

// somebody else in the audience (plain clothes; kids sit right in front of you and dad, so nobody hides your faces)
const VCOL = ['#3b6fd6', '#d65a3b', '#3d8b5a', '#8a5ab8', '#e0a526', '#2a9a9a', '#c4628a', '#5a5f66', '#7a8a3a'];
const VHAIR = ['#2a1a12', '#8a5a32', '#e8c060', '#c27b3a', '#1f1a1a', '#a6a6a6', '#5a3a2a'];
const VKINDS = ['son', 'girl', 'mom', 'dad', 'teen', 'mom', 'dad'] as const;
type Mood = 'laugh' | 'watch' | 'clap';
export const Viewer: React.FC<{k: number; i: number; f: number; mood: Mood; idp: string}> = ({k, i, f, mood, idp}) => {
	const seed = k * 11 + (i + 3) * 7;
	const front = k === 6 && (i === SON_SEAT || i === DAD_SEAT);
	const kind: Kind = front ? (i === SON_SEAT ? 'girl' : 'son') : VKINDS[Math.floor(rnd(seed) * VKINDS.length)];
	const sp = SPECS[kind];
	const s = rowS(k) * VSCALE[kind];
	const hip = rowY(k) - 26 * rowS(k);
	const x = seatX(k, i);
	const bob = mood !== 'watch' ? -Math.abs(Math.sin(f / 3 + seed)) * 6 : 0;
	const c = Math.floor(rnd(seed + 1) * VCOL.length);
	const colors: Colors = {top: VCOL[c], topDark: VCOL[(c + 4) % VCOL.length], hair: VHAIR[Math.floor(rnd(seed + 2) * VHAIR.length)]};
	const clap = mood === 'clap' ? Math.abs(Math.sin(f / 2.2 + seed)) : 0;
	const chest = -(sp.leg + sp.torso * 0.55);
	const face: Face =
		mood === 'watch'
			? {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0, -0.15], blush: false}
			: {eyes: 'happy', mouth: mood === 'clap' ? 'smile' : rnd(seed + 7) < 0.3 ? 'o' : 'grin', brows: 'raised', blush: false};
	const arms =
		mood === 'clap'
			? {armL: {target: [-12 - 46 * clap, chest] as [number, number], bend: 1 as const, ku: 0.75, kf: 0.75}, armR: {target: [12 + 46 * clap, chest] as [number, number], bend: -1 as const, ku: 0.75, kf: 0.75}}
			: mood === 'laugh'
				? {armL: {target: [-30, -(sp.leg + sp.torso * 0.25)] as [number, number], bend: 1 as const, ku: 0.75, kf: 0.75}, armR: {target: [70, -(sp.leg + 40)] as [number, number], bend: -1 as const}}
				: {armL: {target: [-70, -(sp.leg + 50)] as [number, number], bend: 1 as const}, armR: {target: [70, -(sp.leg + 50)] as [number, number], bend: -1 as const}};
	return (
		<g>
			<Person kind={kind} id={`${idp}${k}_${i}`} colors={colors} x={x} y={hip + sp.leg * s + bob} scale={s} hideLegs plain shade={false} face={face} armL={arms.armL} armR={arms.armR} />
			{rnd(seed + 5) > 0.72 && mood !== 'clap' && <Popcorn x={x + 46 * s} y={hip - 16 * s} s={s * 0.75} />}
		</g>
	);
};

// the hall seen from the screen: rows of red seats (full of people if `full`), the projector beam.
// children = the heroes in row 7; row8 = whoever is in the seat right behind you
// dim = 0..1 darkens everybody but the heroes (they are what the shot is about)
export const HallFront: React.FC<{f: number; idp: string; full?: boolean; mood?: Mood; light?: number; dim?: number; children?: React.ReactNode; row8?: React.ReactNode; emptyBehind?: boolean; behindUp?: number; behindRing?: number; hideRow7?: boolean; behindOnly?: boolean}> = ({
	f,
	idp,
	full = true,
	mood = 'laugh',
	light = 1,
	dim = 0,
	children,
	row8,
	emptyBehind = true,
	behindUp = 0,
	behindRing = 0,
	hideRow7 = false,
	behindOnly = false,
}) => {
	const fid = `${idp}dim`;
	const m = 1 - 0.7 * dim;
	const row = (k: number) => (
		<g key={k}>
			<g filter={dim > 0 ? `url(#${fid})` : undefined}>
				{SEATS.map((i) => (
					<Seat key={i} x={seatX(k, i)} y={rowY(k)} s={rowS(k)} up={k === 8 && i === SON_SEAT ? behindUp : 0} />
				))}
				{full &&
					SEATS.map((i) => {
						if (k === 7 && (i === SON_SEAT || i === DAD_SEAT)) return null;
						if (k === 8 && i === SON_SEAT && emptyBehind) return null;
						return <Viewer key={`v${i}`} k={k} i={i} f={f} mood={mood} idp={idp} />;
					})}
			</g>
			{k === 8 && row8}
			{k === 7 && children}
			{k === 7 && (
				<g>
					<rect x={seatX(7, -3) - 140} y={rowY(7) - 90} width={70} height={56} rx={8} fill="#c9b37a" />
					<text x={seatX(7, -3) - 105} y={rowY(7) - 47} fontSize={40} fontFamily={HEAVY} fontWeight={900} fill="#3a2a1a" textAnchor="middle">
						7
					</text>
				</g>
			)}
		</g>
	);
	return (
		<g>
			{dim > 0 && (
				<defs>
					<filter id={fid} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values={`${m} 0 0 0 ${0.02 * dim}  0 ${m} 0 0 ${0.03 * dim}  0 0 ${m + 0.06 * dim} 0 ${0.07 * dim}  0 0 0 1 0`} />
					</filter>
				</defs>
			)}
			<rect x={-600} y={-600} width={2300} height={3200} fill="#1d161b" />
			{Array.from({length: 16}).map((_, k) => (
				<rect key={k} x={-600 + k * 150} y={-600} width={70} height={1600} fill="#241b21" />
			))}
			<rect x={490} y={190} width={100} height={60} rx={6} fill="#fff6d8" />
			<path d="M 500,240 L 580,240 L 1500,1900 L -420,1900 Z" fill="#fff6d8" opacity={0.06} />
			{Array.from({length: 18}).map((_, k) => (
				<circle key={k} cx={540 + (rnd(k) - 0.5) * 700 * rnd(k + 9)} cy={300 + ((f * (2 + rnd(k)) + rnd(k + 3) * 1400) % 1500)} r={2 + rnd(k + 5) * 3} fill="#fff6d8" opacity={0.35} />
			))}
			{[11, 10, 9, 8].map(row)}
			{!hideRow7 && !behindOnly && row(7)}
			{!behindOnly && [6, 5, 4, 3, 2, 1].map(row)}
			{behindRing > 0 && <ellipse cx={seatX(8, SON_SEAT)} cy={rowY(8) - 100 * rowS(8)} rx={80 * (0.6 + 0.4 * behindRing)} ry={105 * (0.6 + 0.4 * behindRing)} fill="none" stroke={RED} strokeWidth={10} opacity={Math.min(1, behindRing)} />}
			<rect x={-600} y={-600} width={2300} height={3200} fill="#6f8cff" opacity={0.07 + 0.03 * Math.sin(f / 3)} />
			<rect x={-600} y={-600} width={2300} height={3200} fill="#000" opacity={0.22 + 0.5 * (1 - light)} />
		</g>
	);
};

// a head-and-shoulders silhouette of somebody in the audience, seen from behind
export const HeadSil: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M -110,140 Q -110,60 -40,50 L 40,50 Q 110,60 110,140 L 110,240 L -110,240 Z" fill="#0d0a0c" />
		<ellipse cx={0} cy={0} rx={62} ry={74} fill="#0d0a0c" />
	</g>
);

// the cinema screen seen over the audience; `children` is the film (a 1080×1920 scene, its middle band shown)
export const ScreenView: React.FC<{f: number; children?: React.ReactNode; zoom?: number; dark?: number; heads?: 'both' | 'son'; bob?: number}> = ({f, children, zoom = 1, dark = 0, heads = 'both', bob = 0}) => {
	const b = (i: number) => (bob ? -Math.abs(Math.sin(f / 2.2 + i * 1.7)) * bob : 0); // heads shaking with laughter
	const flick = 0.94 + 0.06 * rnd(Math.floor(f / 2));
	return (
		<AbsoluteFill style={{background: '#050507', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 700px'}}>
				<div style={{position: 'absolute', left: -40, top: 140, width: 1160, height: 1120, background: '#0b0b0e', boxShadow: '0 0 160px rgba(160,180,255,0.25)'}} />
				<div style={{position: 'absolute', left: 0, top: 170, width: 1080, height: 1060, overflow: 'hidden', filter: `saturate(0.9) contrast(1.05) brightness(${flick})`}}>
					<div style={{position: 'absolute', left: 0, top: -430, width: 1080, height: 1920}}>{children}</div>
					<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 5px)'}} />
					<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
					{dark > 0 && <AbsoluteFill style={{background: '#000', opacity: dark}} />}
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id="f1spill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#9fb4ff" stopOpacity={0.25 * (1 - dark)} />
							<stop offset="100%" stopColor="#9fb4ff" stopOpacity={0} />
						</linearGradient>
					</defs>
					<rect x={0} y={1230} width={1080} height={690} fill="url(#f1spill)" />
					{/* a full hall: heads of the rows in front of the camera */}
					{[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
						<HeadSil key={`a${i}`} x={540 + (i - 0.5) * 175} y={1290 + (i % 2) * 6 + b(i)} s={0.42} />
					))}
					{[-2, -1, 2, 3].map((i) => (
						<HeadSil key={`b${i}`} x={540 + (i - 0.5) * 210} y={1345 + b(i + 9)} s={0.6} />
					))}
					<HeadSil x={470} y={1340} s={0.52} />
					{heads === 'both' && <HeadSil x={660} y={1318} s={0.66} />}
					{[-1, 0, 1, 2].map((i) => (
						<rect key={`r7${i}`} x={540 + (i - 0.5) * 230 - 100} y={1430} width={200} height={240} rx={40} fill="#1f0a0c" />
					))}
					{[-1, 0, 1, 2].map((i) => (
						<HeadSil key={`c${i}`} x={540 + (i - 0.5) * 330} y={1690 + b(i + 4) * 1.6} s={1.0} />
					))}
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// a film title card on the screen, «Папа» style
export const FilmTitle: React.FC<{t: number; big: string; small?: string; color?: string; size?: number}> = ({t, big, small, color = '#fff', size = 120}) => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a10 0%, #1a1208 58%, #070503 100%)'}}>
		<div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
			{small && <div style={{fontSize: 40, letterSpacing: 12, color: '#ff4a3d', opacity: interpolate(t, [0, 8], [0, 1], clamp)}}>{small}</div>}
			<div style={{fontSize: size, lineHeight: 1.05, color, marginTop: 16, transform: `scale(${pop(t, 2, 12)})`, textShadow: '0 8px 0 rgba(0,0,0,0.5)', whiteSpace: 'pre-line'}}>{big}</div>
		</div>
	</AbsoluteFill>
);

// the cartoon everybody came for: a rocket with a little green alien over a ringed planet
const SpaceToon: React.FC<{t: number; end?: boolean}> = ({t, end = false}) => {
	const loop = (t % 150) / 150;
	const rx = -260 + 1600 * loop;
	const ry = 1080 - 300 * loop + Math.sin(t / 6) * 30;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 30% 35%, #2f45a8 0%, #101a52 55%, #070a24 100%)'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{Array.from({length: 70}).map((_, k) => (
					<circle key={k} cx={rnd(k + 2) * 1080} cy={400 + rnd(k + 40) * 1150} r={2 + rnd(k) * 4} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 7 + k))} />
				))}
				<g transform="translate(800,760)">
					<circle r={170} fill="#f2a65a" />
					<path d="M -165,-40 Q 0,-10 165,-40 M -150,50 Q 0,80 150,50" stroke="#d8823a" strokeWidth={22} fill="none" />
					<ellipse rx={270} ry={52} fill="none" stroke="#ffd98a" strokeWidth={16} transform="rotate(-14)" />
				</g>
				{!end && (
					<g transform={`translate(${rx},${ry}) rotate(-18)`}>
						{[0, 1, 2].map((k) => (
							<path key={k} d={`M -150,${-28 + k * 28} L ${-230 - 40 * rnd(t + k)},${-14 + k * 14} L -150,${4 + k * 28} Z`} fill={k === 1 ? '#ffd34a' : '#ff7a2a'} />
						))}
						<path d="M -150,-60 L 90,-60 Q 200,0 90,60 L -150,60 Z" fill="#f4f4f6" />
						<path d="M 90,-60 Q 200,0 90,60 Z" fill="#e0342b" />
						<path d="M -150,-60 L -190,-110 L -100,-60 Z M -150,60 L -190,110 L -100,60 Z" fill="#e0342b" />
						<circle cx={10} cy={0} r={38} fill="#7fc8ff" stroke="#9aa0a8" strokeWidth={8} />
						<circle cx={10} cy={8} r={22} fill="#5fd06a" />
						<circle cx={2} cy={4} r={5} fill="#111" />
						<circle cx={18} cy={4} r={5} fill="#111" />
						<path d="M 4,14 Q 10,20 16,14" stroke="#111" strokeWidth={3} fill="none" />
						<path d="M 4,-12 L 0,-28 M 16,-12 L 22,-28" stroke="#5fd06a" strokeWidth={4} />
					</g>
				)}
			</svg>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: end ? 150 : 64, color: end ? '#fff' : YELLOW, letterSpacing: 4, textShadow: '0 6px 0 #1a1a5a'}}>{end ? 'КОНЕЦ' : 'ЗВЁЗДНЫЙ ПАТРУЛЬ'}</div>
		</AbsoluteFill>
	);
};

// the picture tears: shifted slices, colour fringes, colour bars and noise, then black
export const BrokenFeed: React.FC<{t: number; jerk: number; bars: number; black: number; children: React.ReactNode}> = ({t, jerk, bars, black, children}) => (
	<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
		{jerk <= 0 && children}
		{jerk > 0 && Array.from({length: 12}).map((_, k) => {
			const y0 = 430 + k * 90;
			const dx = (rnd(t * 7 + k) - 0.5) * 220 * jerk * (rnd(t + k * 3) > 0.35 ? 1 : 0.1);
			return (
				<div key={k} style={{position: 'absolute', inset: 0, clipPath: `inset(${y0}px 0 calc(100% - ${y0 + 90}px) 0)`, transform: `translateX(${dx}px)`}}>
					{children}
				</div>
			);
		})}
		{jerk > 0 && <AbsoluteFill style={{background: '#ff004c', mixBlendMode: 'screen', opacity: 0.25 * jerk, transform: `translateX(${14 * jerk}px)`}} />}
		{bars > 0 && (
			<AbsoluteFill style={{opacity: bars, display: 'flex'}}>
				{['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</AbsoluteFill>
		)}
		{bars > 0 &&
			Array.from({length: 40}).map((_, k) => (
				<div key={k} style={{position: 'absolute', left: rnd(t * 13 + k) * 1080, top: 430 + rnd(t * 17 + k) * 1060, width: 40 + rnd(k + t) * 260, height: 6 + rnd(t + k * 5) * 18, background: rnd(k * t) > 0.5 ? '#fff' : '#000', opacity: 0.7 * bars}} />
			))}
		{black > 0 && <AbsoluteFill style={{background: '#000', opacity: black}} />}
	</AbsoluteFill>
);

// the ticket: front (the cartoon, hall, row, seat, price) or back (dad's handwriting); write = 0..1
export const Ticket: React.FC<{side: 'front' | 'back'; write?: number}> = ({side, write = 1}) => (
	<div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 420, borderRadius: 18, background: side === 'front' ? '#f4e6c4' : '#efe2c0', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: HEAVY, fontWeight: 900, color: '#3a2a1a', overflow: 'hidden', boxSizing: 'border-box', padding: '34px 50px'}}>
		<div style={{position: 'absolute', left: 600, top: 0, bottom: 0, borderLeft: '6px dashed #c9b48a'}} />
		{side === 'front' ? (
			<>
				<div style={{fontSize: 28, letterSpacing: 6, color: '#a8322a'}}>КИНОТЕАТР «ОКТЯБРЬ»</div>
				<div style={{fontSize: 52, lineHeight: 1.05, marginTop: 14, width: 520}}>ЗВЁЗДНЫЙ ПАТРУЛЬ</div>
				<div style={{fontSize: 30, marginTop: 6, color: '#7a6a4a'}}>мультфильм · 6+</div>
				<div style={{fontSize: 32, marginTop: 20, fontFamily: MONO}}>ЗАЛ 1 · РЯД 7 · МЕСТА 13–14</div>
				<div style={{position: 'absolute', left: 618, top: 120, width: 160, textAlign: 'center', fontSize: 40, lineHeight: 1.1}}>
					ЦЕНА
					<div style={{fontSize: 60, color: '#a8322a', whiteSpace: 'nowrap', marginLeft: -10, marginRight: -10}}>250 ₽</div>
				</div>
			</>
		) : (
			<div style={{position: 'absolute', left: 60, top: 120, fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontWeight: 700, fontStyle: 'italic', fontSize: 80, color: '#1f2a6a', transform: 'rotate(-6deg)', clipPath: `inset(0 ${100 - 100 * write}% 0 0)`, whiteSpace: 'nowrap'}}>
				Не досматривай
			</div>
		)}
	</div>
);

// the cinema at dusk: neon «КИНО», the poster of the cartoon
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
			<rect x={600} y={700} width={300} height={430} fill="#101a52" stroke="#d9c27a" strokeWidth={12} />
			<circle cx={800} cy={800} r={50} fill="#f2a65a" />
			<path d="M 650,1010 L 760,960 L 770,990 Z" fill="#f4f4f6" />
			<text x={750} y={1080} fontSize={28} fontFamily={HEAVY} fontWeight={900} fill={YELLOW} textAnchor="middle">
				ЗВЁЗДНЫЙ
			</text>
			<text x={750} y={1112} fontSize={28} fontFamily={HEAVY} fontWeight={900} fill={YELLOW} textAnchor="middle">
				ПАТРУЛЬ
			</text>
			<rect x={330} y={1080} width={340} height={400} fill="#3a4a5a" />
			<rect x={340} y={1090} width={155} height={390} fill="#8fb0c8" opacity={0.6} />
			<rect x={505} y={1090} width={155} height={390} fill="#8fb0c8" opacity={0.6} />
			<rect x={-400} y={1480} width={1880} height={900} fill="#4a4a50" />
			<rect x={-400} y={1480} width={1880} height={16} fill="#5d5d66" />
		</g>
	);
};

// the entrance of your block at dusk (as the film shows it)
const Entrance: React.FC = () => (
	<g>
		<rect x={-400} y={-400} width={1880} height={2800} fill="#2b2f5a" />
		<rect x={-200} y={-200} width={1480} height={1700} fill="#bdb6a6" />
		{Array.from({length: 4}).flatMap((_, r) =>
			Array.from({length: 4}).map((__, c) => <rect key={`${r}-${c}`} x={-120 + c * 360} y={-100 + r * 260} width={150} height={150} fill={rnd(r * 5 + c) > 0.5 ? '#ffd98a' : '#4a5270'} />),
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

// the hall as the film shows it (full, like the real one)
export const FilmHall: React.FC<{t: number; idp: string; sonBack?: boolean; dad?: boolean; ring?: number; shadow?: number; zoom?: number}> = ({t, idp, sonBack = false, dad = true, ring = 0, shadow = 0, zoom = 1.7}) => (
	<Stage cam={{s: zoom, cx: 540, cy: 900}} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
		<HallFront
			f={t}
			idp={`${idp}v`}
			mood="laugh"
			dim={0.45}
			row8={
				shadow > 0 ? (
					<g transform={`translate(${-36 * Math.min(1, shadow)},${123 * Math.min(1, shadow)})`}>
						<Sitter kind="dad" k={8} i={SON_SEAT} id={`${idp}x`} f={t} silhouette="#050406" lean={8 * Math.min(1, shadow)} />
					</g>
				) : null
			}
		>
			<Sitter kind="son" k={7} i={SON_SEAT} id={`${idp}s`} f={t} back={sonBack} face={{eyes: 'open', mouth: 'flat', brows: 'worried', look: [0, 0]}} />
			{dad && <Sitter kind="dad" k={7} i={DAD_SEAT} id={`${idp}d`} f={t} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', stubble: true}} />}
			{ring > 0 && <ellipse cx={seatX(7, DAD_SEAT)} cy={rowY(7) - 75} rx={78 * (0.6 + 0.4 * ring)} ry={104 * (0.6 + 0.4 * ring)} fill="none" stroke={RED} strokeWidth={8} opacity={Math.min(1, ring)} />}
		</HallFront>
	</Stage>
);

export const Label: React.FC<{p: number; x: number; y: number; text: string; color: string}> = ({p, x, y, text, color}) =>
	p > 0.01 ? <div style={{position: 'absolute', left: x, top: y, transform: `scale(${p})`, transformOrigin: '0 0', background: 'rgba(14,14,16,0.9)', border: `5px solid ${color}`, borderRadius: 14, padding: '4px 20px', fontFamily: HEAVY, fontWeight: 900, fontSize: 42, color}}>{text}</div> : null;

// ============================================================== SHOTS =======
// 1. A week since the real dad came back → he takes you to the cinema.
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [100]);
	if (i === 0) {
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

// 2. The cashier yawns and sells you two tickets for a cartoon about space.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [52]);
	if (i === 1) {
		return (
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #5a3a2a 0%, #1a100a 75%)'}}>
				<div style={{transform: `rotate(-3deg) scale(${lerp(t, 0, 65, 1.0, 1.06) * kick(t)})`, position: 'absolute', inset: 0}}>
					<Ticket side="front" />
				</div>
			</AbsoluteFill>
		);
	}
	const yawn = Math.sin(Math.min(1, Math.max(0, (t - 4) / 34)) * Math.PI);
	return (
		<Stage cam={{s: lerp(t, 0, 52, 1.0, 1.08) * kick(t), cx: 540, cy: 900}} light={{glow: 0.2, vignette: 0.7}} bg="#2a1a14">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#3a2418" />
			<rect x={140} y={360} width={800} height={900} rx={20} fill="#1a1a20" />
			<Bust kind="mom" id="f1s2c" colors={CASHIER} x={540} y={800} scale={3.0} face={{eyes: yawn > 0.3 ? 'closed' : 'narrow', brows: 'flat', mouth: 'flat', blush: false}} />
			{yawn > 0.05 && <ellipse cx={540} cy={800 + 0.6 * 98 * 3.0} rx={47 * yawn} ry={67 * yawn} fill="#5a1a14" />}
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

// 3. A full hall. Popcorn. Everybody laughs (the cartoon on the screen).
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [34]);
	if (i === 0) {
		return (
			<ScreenView f={f} zoom={lerp(t, 0, 34, 1.0, 1.04)}>
				<SpaceToon t={f + 20} />
			</ScreenView>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 56, 1.0, 1.55, Easing.inOut(Easing.cubic)), cx: 540, cy: lerp(t, 0, 56, 1080, 960, Easing.inOut(Easing.cubic))}} light={{glow: 0, vignette: 0.75}} bg="#1d161b">
			<HallFront f={t} idp="f1s3v" dim={0.2}>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s3s" f={t} face={{eyes: 'happy', mouth: 'grin', brows: 'raised'}} />
				<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s3d" f={t} popcorn face={{eyes: 'happy', mouth: 'grin', brows: 'raised', stubble: true}} armL={{target: [-40, -560], bend: 1, ku: 0.7, kf: 0.7}} />
			</HallFront>
		</Stage>
	);
};

// 4. Suddenly the picture jerks. Stripes. The sound is gone.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const jerk = f >= 22 && f < 44 ? 0.6 + 0.4 * rnd(f) : f >= 44 && f < 60 ? 0.3 : 0;
	const bars = interpolate(f, [58, 64, 80, 86], [0, 1, 1, 0], clamp);
	const black = interpolate(f, [84, 90], [0, 1], clamp);
	return (
		<ScreenView f={f} zoom={1.06} dark={0}>
			<BrokenFeed t={f} jerk={jerk} bars={bars} black={black}>
				<Freeze frame={f < 22 ? f + 54 : 76}>
					<SpaceToon t={f < 22 ? f + 54 : 76} />
				</Freeze>
			</BrokenFeed>
		</ScreenView>
	);
};

// 5. When the picture comes back — your entrance. Your flat. You.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [34, 112, 146]);
	const flick = i === 1 && t < 10 ? (Math.floor(t / 2) % 2 === 0 ? 0.8 : 0) : 0;
	let film: React.ReactNode;
	if (i === 0) film = <AbsoluteFill style={{background: '#000'}} />;
	else if (i === 1)
		film = (
			<Stage cam={{s: lerp(t, 0, 78, 1.0, 1.08), cx: 540, cy: 1100}} light={{glow: 0.2, vignette: 0.6}} bg="#2b2f5a">
				<Entrance />
			</Stage>
		);
	else if (i === 2)
		film = (
			<Freeze frame={20}>
				<P1a.S01 />
			</Freeze>
		);
	else
		film = (
			<Stage cam={{s: kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.6}} bg="#d9c7a0">
				<rect x={-400} y={-400} width={1880} height={2800} fill="#e8d6b0" />
				<Bust kind="son" id="f1s5b" x={540} y={1000} scale={5.2} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [0, 0]}} />
			</Stage>
		);
	return (
		<ScreenView f={f} zoom={1.12} dark={flick}>
			{film}
		</ScreenView>
	);
};

// 6. There you open the door — and there's dad. Only not the real one.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const stamp = pop(f, 90, 9);
	return (
		<AbsoluteFill>
			<ScreenView f={f} zoom={1.14}>
				<Play at={100 + f}>
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
	const {i, t} = seg(f, [34, 48, 66, 126]);
	const tag = (text: string) => (
		<div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,0) scale(${pop(t, 1, 9)})`, background: 'rgba(14,14,16,0.92)', border: `5px solid ${YELLOW}`, borderRadius: 14, padding: '4px 22px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: YELLOW, whiteSpace: 'nowrap'}}>{text}</div>
	);
	let film: React.ReactNode;
	if (i === 0)
		film = (
			<Play at={160 + t}>
				<P1a.S01 />
			</Play>
		);
	else if (i === 1)
		film = (
			<Freeze frame={60}>
				<P1a.S04 />
			</Freeze>
		);
	else if (i === 2)
		film = (
			<Freeze frame={60}>
				<P1a.S03 />
			</Freeze>
		);
	else if (i === 3)
		film = (
			<Play at={20 + t}>
				<P6.S10 />
			</Play>
		);
	else film = <FilmTitle t={t} small="СЕКРЕТНОЕ СЛОВО" big="«КАРАСЬ»" color={YELLOW} />;
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

// 8. You look round: the hall laughs as if the cartoon were still on. Nobody notices anything.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [36]);
	if (i === 0) {
		const turn = Math.sin(t / 5) * 0.8;
		return (
			<Stage cam={{s: lerp(t, 0, 36, 1.0, 1.06) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05060a">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#141220" />
				<Bust kind="son" id="f1s8b" x={540} y={1000} scale={6.0} turn={turn} face={{eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', look: [turn, 0], blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#7f9bff" opacity={0.12 + 0.05 * Math.sin(t / 2)} />
			</Stage>
		);
	}
	const spot = interpolate(t, [50, 62], [0, 1], clamp);
	const cam = {s: lerp(t, 0, 111, 1.7, 2.0), cx: 520, cy: 940};
	const fc = faceAt('son', 7, SON_SEAT);
	const sp = toScreen(cam, fc.x, fc.y);
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
				<HallFront f={t} idp="f1s8v" dim={0.15 + 0.5 * spot}>
					<Sitter kind="son" k={7} i={SON_SEAT} id="f1s8s" f={t} face={{eyes: 'wide', pupil: 0.6, mouth: 'flat', brows: 'worried', look: [-0.4, 0]}} />
					<Sitter kind="dad" k={7} i={DAD_SEAT} id="f1s8d" f={t} popcorn face={{eyes: 'happy', mouth: 'grin', brows: 'raised', stubble: true}} armL={{target: [-40, -560], bend: 1, ku: 0.7, kf: 0.7}} />
				</HallFront>
			</Stage>
			{spot > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at ${sp.x}px ${sp.y + 60}px, transparent ${170 * cam.s * 0.6}px, rgba(0,0,0,${0.5 * spot}) ${330 * cam.s * 0.6}px)`}} />}
		</AbsoluteFill>
	);
};

// 9. «Пап, ты это видишь?» Dad crunches his popcorn: «Смешной, да?»
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const ask = f < 36;
	const eat = f >= 36 && f < 82;
	const munch = f >= 50 && f < 80 && Math.floor(f / 4) % 2 === 0;
	const talk = f >= 84 && f < 110 && Math.floor(f / 4) % 2 === 0;
	// the hand: into the bucket, to the mouth, back
	const hx = interpolate(f, [36, 42, 50, 74, 82], [80, -25, 10, 10, 80], clamp);
	const hy = interpolate(f, [36, 42, 50, 74, 82], [-530, -610, -975, -975, -530], clamp);
	const cam = {s: lerp(f, 0, 117, 3.1, 3.25) * kick(f), cx: 540, cy: 900};
	const dadFace = toScreen(cam, faceAt('dad', 7, DAD_SEAT).x, faceAt('dad', 7, DAD_SEAT).y);
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
				<HallFront f={f} idp="f1s9v" dim={0.55}>
					<Sitter kind="son" k={7} i={SON_SEAT} id="f1s9s" f={f} headTurn={0.5} face={{eyes: 'wide', mouth: ask && Math.floor(f / 4) % 2 === 0 ? 'o' : 'flat', brows: 'worried', look: [0.9, 0]}} />
					<Sitter
						kind="dad"
						k={7}
						i={DAD_SEAT}
						id="f1s9d"
						f={f}
						popcorn
						face={{eyes: 'happy', mouth: talk ? 'o' : munch ? 'tight' : 'grin', brows: 'raised', stubble: true, look: [0, -0.2]}}
						armL={{target: [-40, -560], bend: 1, ku: 0.7, kf: 0.7}}
						armR={eat ? {target: [hx, hy], bend: -1} : undefined}
					/>
				</HallFront>
			</Stage>
			{munch && (
				<div style={{position: 'absolute', left: dadFace.x - 40, top: dadFace.y - 300, transform: `rotate(10deg) scale(${pop(f, 50, 8)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: '#fff3c4', textShadow: '0 5px 0 #000'}}>ХРУСТЬ</div>
			)}
		</AbsoluteFill>
	);
};

// 10. Suddenly the screen shows this very hall. Row seven. You and dad. It's now.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const now = f >= 132;
	const jerk = f >= 34 && f < 46 ? 0.5 + 0.5 * rnd(f) : 0;
	return (
		<AbsoluteFill>
			<ScreenView f={f} zoom={lerp(f, 0, 159, 1.12, 1.22)}>
				<BrokenFeed t={f} jerk={jerk} bars={0} black={0}>
					{f >= 40 ? (
						<FilmHall t={f} idp="f1s10" />
					) : (
						<Play at={60 + f}>
							<P6.S10 />
						</Play>
					)}
				</BrokenFeed>
				{now && (
					<div style={{position: 'absolute', left: 170, top: 560, padding: '6px 22px', borderRadius: 12, background: 'rgba(0,0,0,0.7)', border: '4px solid #ff4a3d', fontFamily: MONO, fontWeight: 700, fontSize: 64, color: '#ff4a3d', textShadow: '0 0 12px rgba(255,60,50,0.9)', transform: `scale(${pop(f, 132, 8)})`, transformOrigin: '0 50%'}}>
						<span style={{opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0.35}}>●</span> СЕЙЧАС
					</div>
				)}
			</ScreenView>
			{now && f < 140 && <AbsoluteFill style={{background: '#fff', opacity: 0.25}} />}
		</AbsoluteFill>
	);
};

// 11. On the screen you turn round. And dad's seat beside you is empty.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={1.2}>
			<FilmHall t={f} idp="f1s11" sonBack={f >= 20} dad={f < 54 || (f < 62 && f % 4 < 2)} ring={pop(f, 92, 10)} />
		</ScreenView>
	);
};

// 12. Behind you a seat creaks. Somebody sits down right behind you (in the only empty seat).
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	// a dark figure comes along row 8 from the left, stops at the only empty seat (right behind you) and sits down
	const k8 = rowS(8);
	const sc = k8 * VSCALE.dad;
	const seat = seatX(8, SON_SEAT);
	const floor = rowY(8) + 120 * k8; // the floor between rows 7 and 8
	const hipStand = floor - SPECS.dad.leg * sc;
	const hipSeat = rowY(8) - 26 * k8;
	const x = lerp(f, 0, 40, 170, seat, Easing.out(Easing.sin));
	const walking = f < 40;
	const ph = (Math.min(f, 40) / 40) * 4 * Math.PI; // two strides, ends with the feet together
	const sit = lerp(f, 50, 70, 0, 1, Easing.inOut(Easing.cubic));
	const sw = walking ? Math.sin(ph) * 22 : 0;
	const armA = (side: 1 | -1) => ({
		target: [side * (160 - 80 * sit) - sw * side, -440 - 90 * sit] as [number, number],
		bend: (side === -1 ? 1 : -1) as 1 | -1,
	});
	return (
		<Stage cam={{s: interpolate(f, [0, 60, 111], [2.3, 2.6, 2.7], clamp) * kick(f), cx: lerp(f, 0, 60, 470, 500), cy: lerp(f, 0, 60, 870, 885)}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
			<defs>
				<clipPath id="f1s12clip">
					<rect x={-600} y={-600} width={2300} height={rowY(8) + 30 * k8 + 600} />
				</clipPath>
			</defs>
			<HallFront
				dim={0.55}
				f={f}
				idp="f1s12v"
				row8={
					<g clipPath="url(#f1s12clip)">
						<Person kind="dad" id="f1s12x" silhouette="#050406" x={x} y={floor + (hipSeat - hipStand) * sit} scale={sc} walk={walking ? ph : undefined} breathe={f} armL={armA(-1)} armR={armA(1)} />
					</g>
				}
			>
				<Sitter kind="son" k={7} i={SON_SEAT} id="f1s12s" f={f} face={{eyes: 'wide', pupil: f >= 56 ? 0.5 : 1, mouth: f >= 56 ? 'o' : 'flat', brows: 'raised', look: [f >= 16 && f < 56 ? -0.5 : 0, -0.3]}} />
				<SeatTicket />
			</HallFront>
		</Stage>
	);
};

// 13. On the screen a dark figure leans to your ear…
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={lerp(f, 0, 99, 1.2, 1.32)}>
			<FilmHall t={f} idp="f1s13" zoom={2.3} dad={false} shadow={lerp(f, 24, 80, 0.01, 1, Easing.inOut(Easing.sin))} />
		</ScreenView>
	);
};

// 14. «Привет, тигрёнок» (a whisper right at your ear).
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const words = [
		{w: 'ПРИВЕТ,', at: 6},
		{w: 'ТИГРЁНОК', at: 23},
	];
	const jit = (k: number) => (rnd(f * 3 + k) - 0.5) * 10;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 60, 1.0, 1.08) * kick(f), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.9}} bg="#030304">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#0d0c14" />
				<Bust kind="son" id="f1s14b" x={620} y={1080} scale={5.4} turn={0.3} face={{eyes: 'wide', pupil: 0.45, brows: 'raised', mouth: 'flat', look: [-0.8, 0], blush: false}} />
				<g transform="translate(50,1010) scale(4.2)">
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

// 15. You turn round — nobody behind you. The only empty seat in the whole full hall (it folds up).
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const [sx, sy] = shake(f, 0, 14, 8);
	const out = lerp(f, 70, 130, 0, 1, Easing.inOut(Easing.cubic));
	const seat = seatX(8, SON_SEAT);
	return (
		<Stage cam={{s: (2.6 - 1.25 * out) * kick(f), cx: seat + (520 - seat) * out + sx, cy: 900 + 60 * out + sy}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
			<HallFront f={f} idp="f1s15v" dim={0.2} behindOnly behindUp={lerp(f, 30, 60, 0, 1, Easing.out(Easing.cubic))} behindRing={pop(f, 112, 10)} />
			{/* the backs of your own row: you look back over them */}
			<rect x={-600} y={rowY(7) + 120} width={2300} height={1000} fill="#0e090b" />
			{[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
				<g key={i}>
					<rect x={seatX(7, i) - 68} y={rowY(7) + 20} width={136} height={420} rx={40} fill="#4a181d" stroke="#240b0f" strokeWidth={5} />
					<rect x={seatX(7, i) - 52} y={rowY(7) + 30} width={104} height={16} rx={8} fill="#6a242a" />
				</g>
			))}
		</Stage>
	);
};

// 16. You turn back — dad's seat is empty. Just like on the screen.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [80]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 80, 3.0, 3.2) * kick(t), cx: 540, cy: 920}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
				<HallFront f={t} idp="f1s16v" dim={0.55}>
					<Sitter kind="son" k={7} i={SON_SEAT} id="f1s16s" f={t} headTurn={0.5} face={{eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'raised', look: [0.9, 0]}} />
					<SeatTicket />
					{t >= 58 && <ellipse cx={seatX(7, DAD_SEAT)} cy={rowY(7) - 75} rx={78 * (0.6 + 0.4 * pop(t, 58, 10))} ry={104 * (0.6 + 0.4 * pop(t, 58, 10))} fill="none" stroke={RED} strokeWidth={6} opacity={Math.min(1, pop(t, 58, 10))} />}
				</HallFront>
			</Stage>
		);
	}
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(-470px)'}}>
					<FilmHall t={t} idp="f1s16top" sonBack dad={false} zoom={2.0} />
				</div>
				<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 6px)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(490px)'}}>
					<FilmHall t={t} idp="f1s16bot" dad={false} zoom={2.0} />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: '#fff'}} />
			<Label p={pop(t, 2, 10)} x={40} y={300} text="НА ЭКРАНЕ" color={YELLOW} />
			<Label p={pop(t, 10, 10)} x={40} y={1000} text="НА САМОМ ДЕЛЕ" color={RED} />
		</AbsoluteFill>
	);
};

// 17. On the seat — his ticket. On the back, in dad's handwriting: «Не досматривай».
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [50]);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 50, 2.6, 2.9) * kick(t), cx: 540, cy: 1330}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
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
				<Ticket side={flip > 0 ? 'front' : 'back'} write={lerp(t, 40, 72, 0, 1, Easing.linear)} />
			</div>
		</AbsoluteFill>
	);
};

// 18. «Продолжение следует» → the hall applauds → for them it was a cartoon about space.
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [88, 130]);
	if (i === 0) {
		return (
			<ScreenView f={f} zoom={lerp(t, 0, 88, 1.0, 1.06)} heads="son">
				{t >= 20 ? <FilmTitle t={t - 20} big={'ПРОДОЛЖЕНИЕ\nСЛЕДУЕТ…'} size={84} /> : <AbsoluteFill style={{background: '#0b0b0e'}} />}
			</ScreenView>
		);
	}
	if (i === 1) {
		return (
			<Stage cam={{s: lerp(t, 0, 42, 1.5, 1.65), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
				<HallFront f={t} idp="f1s18v" mood="clap" dim={0.3}>
					<Sitter kind="son" k={7} i={SON_SEAT} id="f1s18s" f={t} face={{eyes: 'wide', pupil: 0.5, mouth: 'flat', brows: 'worried', look: [0, 0]}} />
				</HallFront>
			</Stage>
		);
	}
	// what they saw | what you saw
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(-110px)'}}>
					<SpaceToon t={t} end />
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(640px)'}}>
					<FilmTitle t={30} big={'ПРОДОЛЖЕНИЕ\nСЛЕДУЕТ…'} size={84} />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: '#fff'}} />
			<Label p={pop(t, 2, 10)} x={40} y={230} text="ОНИ ВИДЕЛИ" color={YELLOW} />
			<Label p={pop(t, 10, 10)} x={40} y={1000} text="ТЫ ВИДЕЛ" color={RED} />
		</AbsoluteFill>
	);
};

// 19. Finale: run out and look for dad, or stay and watch the film to the end?
export const S19: React.FC = () => {
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

// (the Cam type is used by the stage helpers above)
export type _Cam = Cam;
