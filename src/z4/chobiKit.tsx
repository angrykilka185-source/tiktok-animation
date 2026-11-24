// Чоби's page for «Каково это — умереть от лап медведя» (the same as in «погребённым заживо», src/z3/chobiKit.tsx): the white page with
// the circle that opens and closes a visit, his talking, blinking and breathing on the film's clock, the arm poses that
// glide from one to the next on the words, the titles and the list lines. The scenes themselves are in chobi.tsx.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {armPose, Choby, mixArm, type ArmSpec, type Pose} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import envJson from './env.json';
import {ICE, Plaque, RED, YEL} from './kit';
import {shotStart, SHOTS} from './timeline';
import {VOICE, w} from './voice';

const ENV = envJson as Record<string, number[]>;
export const len = (n: number) => SHOTS[n - 1].duration;
export const INK = '#16161c';
// where he stands, and his own units → the screen
export const HX = 590;
export const FEET = 860;
export const S = 0.95;
export const px = (u: number) => HX + u * S;
export const py = (v: number) => FEET + v * S;

// the visits: the shots that join into one stay on his page
export const CHOBI_VISITS = [[6], [12, 13], [21, 22], [28], [31, 32, 33], [41], [49], [56], [61, 62, 63], [65, 66]];
export const CHOBI_FIRST = new Set(CHOBI_VISITS.map((v) => v[0]));
export const CHOBI_LAST = new Set(CHOBI_VISITS.map((v) => v[v.length - 1]));
export const IRIS = 12;

// ---------------------------------------------------------------------------------------------- helpers -----
// the voice of shot n at shot-local frame f → how far the jaw opens
export const jawAt = (n: number, f: number) => {
	const l = VOICE.find((v) => v.shot === n);
	const a = l ? ENV[l.id] : undefined;
	if (!l || !a) return 0;
	const i0 = Math.floor(f - (l.at - shotStart(n)));
	const g = (i: number) => (i >= 0 && i < a.length ? a[i] : 0);
	return Math.min(1, ((g(i0 - 1) + 2 * g(i0) + g(i0 + 1)) / 4) * 0.9);
};
export const blinkAt = (g: number) => {
	const ph = (g + 40) % 113;
	return ph < 6 ? 1 - Math.abs(ph - 2.5) / 3 : 0;
};
export const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
export const ease = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: Easing.inOut(Easing.sin)});

// an arm that moves through poses: [frame, pose] keys, each move takes `dur` frames and starts from wherever the arm
// was at that moment (so a move that cuts into another one never jumps)
export type Key = [number, Pose | ArmSpec];
export const armAt = (side: 1 | -1, f: number, keys: Key[], g: number, dur = 9): ArmSpec => {
	let i = 0;
	while (i + 1 < keys.length && f >= keys[i + 1][0]) i++;
	const cur = armPose(side, keys[i][1], g);
	if (i === 0) return cur;
	const t = sm((f - keys[i][0]) / dur);
	if (t >= 1) return cur;
	return mixArm(armAt(side, keys[i][0], keys.slice(0, i), g, dur), cur, t);
};
// a right-arm pose for the left arm
export const mirror = (a: ArmSpec): ArmSpec => ({...a, el: [-a.el[0], a.el[1]], ha: [-a.ha[0], a.ha[1]], hang: -(a.hang ?? 0)});

// his own poses (the right arm; the shoulder is at (62, −380), the upper arm ≈ 70, the forearm ≈ 85)
export const PRESENT: ArmSpec = {el: [125, -335], ha: [198, -372], hang: 243}; // an open palm towards the page: «вот»
export const SHRUG: ArmSpec = {el: [100, -320], ha: [168, -372], hang: 232};
export const TEN: ArmSpec = {el: [118, -352], ha: [140, -440], hang: 194}; // a hand up with the fingers spread
export const HEART_PT: ArmSpec = {el: [136, -364], ha: [66, -326], hang: 61, finger: true}; // a finger at his heart
export const SPREAD: ArmSpec = {el: [112, -318], ha: [150, -246], hang: -28}; // the arms a little away from the body
export const RAISE: ArmSpec = {el: [132, -350], ha: [166, -432], hang: 202}; // the hand up before his eyes
export const GRAB: ArmSpec = {el: [135, -400], ha: [205, -450], hang: 234}; // reaching up and out
export const HUG: ArmSpec = {el: [100, -318], ha: [18, -345], hang: 108, fist: true}; // the fists pressed to the chest: brr
export const FAN: ArmSpec = {el: [128, -380], ha: [160, -462], hang: 200}; // fanning his face
export const EAT_REST: ArmSpec = {el: [112, -318], ha: [128, -390], hang: 193, fist: true};
export const EAT_BITE: ArmSpec = {el: [125, -346], ha: [96, -420], hang: 159, fist: true};
export const PHONE_SHOW: ArmSpec = {el: [120, -338], ha: [150, -420], hang: 200, fist: true};
export const PHONE_IN: ArmSpec = {el: [83, -311], ha: [0, -290], hang: 76, fist: true};
export const REACH: ArmSpec = {el: [122, -420], ha: [170, -495], hang: -147}; // after the cap (used on the left)

// the film's clock, his talking, blinking, breathing; he springs up from the floor on the first shot of a visit
export const useHost = (n: number) => {
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const k = CHOBI_FIRST.has(n) ? pop(f, 2, 10) : 1;
	const jaw = jawAt(n, f);
	return {f, g, k, jaw, blink: blinkAt(g), tilt: Math.sin(g / 23) * 3 + (jaw - 0.25) * 3, b: 1 + 0.012 * Math.sin(g / 14)};
};
// stands him on the floor: k — the spring of the entrance, b — breathing, lean — degrees, dy — a hop
export const Stand: React.FC<{k: number; b?: number; lean?: number; dy?: number; children: React.ReactNode}> = ({k, b = 1, lean = 0, dy = 0, children}) => (
	<g transform={`translate(${HX},${FEET + dy}) rotate(${lean}) scale(${k},${k * b}) translate(${-HX},${-FEET})`}>{children}</g>
);

// the white page: a warm floor, drifting specks of sand, his shadow; the circle that opens and closes a visit
export const Page: React.FC<{n: number; f: number; snow?: boolean; shadow?: number; sx?: number; children?: React.ReactNode; html?: React.ReactNode}> = ({n, f, snow = true, shadow = 1, sx = HX, children, html}) => {
	const g = shotStart(n) + f;
	const L = len(n);
	let r = 1e4;
	if (CHOBI_FIRST.has(n)) r = Math.min(r, interpolate(f, [0, IRIS], [0, 1500], {...clamp, easing: Easing.inOut(Easing.cubic)}));
	if (CHOBI_LAST.has(n)) {
		const o = n === SHOTS.length ? L - IRIS - 4 : L;
		r = Math.min(r, interpolate(f, [o, o + IRIS], [1500, 0], {...clamp, easing: Easing.in(Easing.cubic)}));
	}
	const cy = py(-560);
	const clip = r < 1500 ? `circle(${Math.max(0, r).toFixed(1)}px at ${HX}px ${cy}px)` : undefined;
	return (
		<>
			<AbsoluteFill style={{clipPath: clip, WebkitClipPath: clip}}>
				<AbsoluteFill style={{background: '#ffffff'}} />
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id={`chFloor${n}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#ffffff" />
							<stop offset="100%" stopColor="#f6efe3" />
						</linearGradient>
					</defs>
					<rect x={0} y={800} width={1920} height={280} fill={`url(#chFloor${n})`} />
					{snow &&
						Array.from({length: 22}).map((_, i) => {
							const x = ((i * 263 + g * (0.7 + (i % 3) * 0.35)) % 2000) - 40;
							const y = ((i * 137) % 860) + 60 + Math.sin((g + i * 30) / 50) * 14;
							return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#e6d2ae" opacity={0.75} />;
						})}
					<ellipse cx={sx} cy={FEET + 6} rx={150 * shadow} ry={16 * shadow} fill="#000" opacity={0.1} />
					{/* a puff of dust when he springs up */}
					{CHOBI_FIRST.has(n) &&
						f >= 2 &&
						f < 22 &&
						[-1, -0.4, 0.4, 1].map((d, i) => {
							const t = (f - 2) / 20;
							return <circle key={i} cx={HX + d * (60 + t * 130)} cy={FEET - 6 - t * 26 * (1 - Math.abs(d) * 0.3)} r={20 * (1 - t * 0.5)} fill="#eadfcc" opacity={1 - t} />;
						})}
					{children}
				</svg>
				{html}
			</AbsoluteFill>
			{clip && r > 2 && (
				<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
					<circle cx={HX} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={10} />
				</svg>
			)}
		</>
	);
};

export const Title: React.FC<{text: string; x: number; y: number; size: number; color?: string; at: number; f: number}> = ({text, x, y, size, color = INK, at, f}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f, at, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05}}>{text}</div>
	);
// a list line with a green tick or a red cross (dark text for the white page)
export const Line: React.FC<{f: number; at: number; x: number; y: number; text: string; ok?: boolean; size?: number}> = ({f, at, x, y, text, ok = true, size = 50}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(0,-50%) scale(${pop(f, at, 12)})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color: INK, whiteSpace: 'nowrap'}}>
			<div style={{width: 64, height: 64, flex: '0 0 64px', borderRadius: 16, background: ok ? '#3aa86a' : RED, color: '#fff', textAlign: 'center', lineHeight: '66px', fontSize: 44}}>{ok ? '✓' : '✕'}</div>
			{text}
		</div>
	);

// Чоби walks into a story shot from the right — all of him, his feet on the bottom edge, his shadow under him — stops,
// raises his palm towards Гога («Стоп, Гога!», a bubble from his mouth) and names the mistake; he talks with the voice and
// walks back out at `to` (out of the frame by to + STOP_WALK)
export const STOP_WALK = 14;
const STOP_S = 0.8; // his size in the story shots
const STOP_FEET = 1032; // where his feet stand
const STOP_X = 1650; // where he stops
export const StopChobi: React.FC<{n: number; f: number; at: number; to: number; label?: string; labelAt?: number; bubble?: string}> = ({n, f, at, to, label, labelAt = 0, bubble = 'СТОП, ГОГА!'}) => {
	if (f < at - 1 || f > to + STOP_WALK + 1) return null;
	const W = STOP_WALK;
	const inT = sm((f - at) / W);
	const outT = sm((f - to) / W);
	const x = 2160 - (2160 - STOP_X) * inT + (2160 - STOP_X) * outT;
	// three steps in, three steps out: the phase runs 0 → 3π, so both feet are down when he stops or sets off
	const walkIn = f >= at && f < at + W;
	const walkOut = f >= to && f < to + W;
	const walk = walkIn ? (3 * Math.PI * (f - at)) / W : walkOut ? (3 * Math.PI * (f - to)) / W : undefined;
	const g = shotStart(n) + f;
	const stand = at + W;
	// the palm comes up once he stands, and goes down before he leaves
	const palm: ArmSpec = {el: [-118, -352], ha: [-140, -440], hang: -194};
	const armL = f >= stand && f < to ? armAt(-1, f, [[0, 'down'], [stand, palm], [to - 8, 'down']], g, 8) : 'down';
	const say = f >= stand && f < to ? pop(f, stand + 2, 10) * (1 - sm((f - (to - 8)) / 8)) : 0;
	// his head (the bubble's tail points at his mouth)
	const headX = x;
	const headY = STOP_FEET - STOP_S * 600;
	const bx = headX - 250;
	const by = headY - 150;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<ellipse cx={x} cy={STOP_FEET + 4} rx={105} ry={18} fill="#000" opacity={0.28} />
				<Choby x={x} y={STOP_FEET} s={STOP_S} jaw={jawAt(n, f)} blink={blinkAt(g)} f={g} armL={armL} armR="down" look={[-0.8, 0.1]} tilt={walk === undefined ? -4 : 0} walk={walk} />
				{say > 0.02 && <path d={`M ${bx + 110},${by + 40} L ${headX - 118},${headY - 10} L ${bx + 180},${by + 34} Z`} fill="#fff" stroke="#16161c" strokeWidth={7} strokeLinejoin="round" opacity={Math.min(1, say * 1.5)} />}
			</svg>
			{say > 0.02 && (
				<div style={{position: 'absolute', left: bx, top: by, transform: `translate(-50%,-50%) scale(${say})`, transformOrigin: '70% 100%', background: '#fff', color: RED, border: '7px solid #16161c', borderRadius: 26, padding: '8px 24px', fontFamily: HEAVY, fontWeight: 900, fontSize: 50, whiteSpace: 'nowrap', boxShadow: '0 10px 26px rgba(0,0,0,0.35)'}}>
					{bubble}
				</div>
			)}
			{label && say > 0.02 && f >= Math.max(stand + 8, labelAt) && (
				<div style={{position: 'absolute', left: bx - 40, top: by - 100, transform: `translate(-50%,-50%) rotate(-3deg) scale(${pop(f, Math.max(stand + 8, labelAt), 10) * Math.min(1, say * 1.2)})`, background: RED, color: '#fff', border: '5px solid #fff', borderRadius: 14, padding: '6px 20px', fontFamily: HEAVY, fontWeight: 900, fontSize: 36, whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>
					{label}
				</div>
			)}
		</AbsoluteFill>
	);
};
