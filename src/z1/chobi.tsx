// Чоби's own scenes in «Каково это — замёрзнуть насмерть». Now and then the film cuts to a white page where the host
// (src/components/Choby.tsx) shows it on himself: the heart in his ribcage, the vessels shrinking, the fingers going
// numb, the shivering, the hoarfrost, the false heat, the slowing heart; the rules on the board; the wind that takes his
// cap, the scarf, the sandwich that falls through his ribs; «подпишись». Each scene replaces the picture of one shot (the
// same narration, the same length). He talks with the voice (the jaw follows its loudness, env.json), blinks, breathes,
// nods, and every gesture glides from one pose to the next on the words. A visit opens with a circle that grows around
// him (he springs up from the floor) and closes the same way; the shots of one visit join without a seam (the same spot,
// the same pose at the cut, the snow and the breathing run on the film's clock).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {armPose, Choby, mixArm, type ArmSpec, type Pose} from '../components/Choby';
import {HEAVY} from '../components/Overlays';
import envJson from './env.json';
import {ICE, Plaque, RED, YEL} from './kit';
import {Heater} from './s2';
import {shotStart, SHOTS} from './timeline';
import {VOICE, w} from './voice';

const ENV = envJson as Record<string, number[]>;
const len = (n: number) => SHOTS[n - 1].duration;
const INK = '#16161c';
// where he stands, and his own units → the screen
const HX = 590;
const FEET = 860;
const S = 0.95;
const px = (u: number) => HX + u * S;
const py = (v: number) => FEET + v * S;

// the visits: the shots that join into one stay on his page
export const CHOBI_VISITS = [[4], [17, 18], [20, 21], [25], [34], [39], [42], [55], [63, 64, 65], [78]];
export const CHOBI_FIRST = new Set(CHOBI_VISITS.map((v) => v[0]));
export const CHOBI_LAST = new Set(CHOBI_VISITS.map((v) => v[v.length - 1]));
export const IRIS = 12;

// ---------------------------------------------------------------------------------------------- helpers -----
// the voice of shot n at shot-local frame f → how far the jaw opens
const jawAt = (n: number, f: number) => {
	const l = VOICE.find((v) => v.shot === n);
	const a = l ? ENV[l.id] : undefined;
	if (!l || !a) return 0;
	const i0 = Math.floor(f - (l.at - shotStart(n)));
	const g = (i: number) => (i >= 0 && i < a.length ? a[i] : 0);
	return Math.min(1, ((g(i0 - 1) + 2 * g(i0) + g(i0 + 1)) / 4) * 0.9);
};
const blinkAt = (g: number) => {
	const ph = (g + 40) % 113;
	return ph < 6 ? 1 - Math.abs(ph - 2.5) / 3 : 0;
};
const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
const ease = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: Easing.inOut(Easing.sin)});

// an arm that moves through poses: [frame, pose] keys, each move takes `dur` frames and starts from wherever the arm
// was at that moment (so a move that cuts into another one never jumps)
type Key = [number, Pose | ArmSpec];
const armAt = (side: 1 | -1, f: number, keys: Key[], g: number, dur = 9): ArmSpec => {
	let i = 0;
	while (i + 1 < keys.length && f >= keys[i + 1][0]) i++;
	const cur = armPose(side, keys[i][1], g);
	if (i === 0) return cur;
	const t = sm((f - keys[i][0]) / dur);
	if (t >= 1) return cur;
	return mixArm(armAt(side, keys[i][0], keys.slice(0, i), g, dur), cur, t);
};
// a right-arm pose for the left arm
const mirror = (a: ArmSpec): ArmSpec => ({...a, el: [-a.el[0], a.el[1]], ha: [-a.ha[0], a.ha[1]], hang: -(a.hang ?? 0)});

// his own poses (the right arm; the shoulder is at (62, −380), the upper arm ≈ 70, the forearm ≈ 85)
const PRESENT: ArmSpec = {el: [125, -335], ha: [198, -372], hang: 243}; // an open palm towards the page: «вот»
const SHRUG: ArmSpec = {el: [100, -320], ha: [168, -372], hang: 232};
const TEN: ArmSpec = {el: [118, -352], ha: [140, -440], hang: 194}; // a hand up with the fingers spread
const HEART_PT: ArmSpec = {el: [136, -364], ha: [66, -326], hang: 61, finger: true}; // a finger at his heart
const SPREAD: ArmSpec = {el: [112, -318], ha: [150, -246], hang: -28}; // the arms a little away from the body
const RAISE: ArmSpec = {el: [132, -350], ha: [166, -432], hang: 202}; // the hand up before his eyes
const GRAB: ArmSpec = {el: [135, -400], ha: [205, -450], hang: 234}; // reaching up and out
const HUG: ArmSpec = {el: [100, -318], ha: [18, -345], hang: 108, fist: true}; // the fists pressed to the chest: brr
const FAN: ArmSpec = {el: [128, -380], ha: [160, -462], hang: 200}; // fanning his face
const EAT_REST: ArmSpec = {el: [112, -318], ha: [128, -390], hang: 193, fist: true};
const EAT_BITE: ArmSpec = {el: [125, -346], ha: [96, -420], hang: 159, fist: true};
const PHONE_SHOW: ArmSpec = {el: [120, -338], ha: [150, -420], hang: 200, fist: true};
const PHONE_IN: ArmSpec = {el: [83, -311], ha: [0, -290], hang: 76, fist: true};
const REACH: ArmSpec = {el: [122, -420], ha: [170, -495], hang: -147}; // after the cap (used on the left)

// the film's clock, his talking, blinking, breathing; he springs up from the floor on the first shot of a visit
const useHost = (n: number) => {
	const f = useCurrentFrame();
	const g = shotStart(n) + f;
	const k = CHOBI_FIRST.has(n) ? pop(f, 2, 10) : 1;
	const jaw = jawAt(n, f);
	return {f, g, k, jaw, blink: blinkAt(g), tilt: Math.sin(g / 23) * 3 + (jaw - 0.25) * 3, b: 1 + 0.012 * Math.sin(g / 14)};
};
// stands him on the floor: k — the spring of the entrance, b — breathing, lean — degrees, dy — a hop
const Stand: React.FC<{k: number; b?: number; lean?: number; dy?: number; children: React.ReactNode}> = ({k, b = 1, lean = 0, dy = 0, children}) => (
	<g transform={`translate(${HX},${FEET + dy}) rotate(${lean}) scale(${k},${k * b}) translate(${-HX},${-FEET})`}>{children}</g>
);

// the white page: a light floor, slow snowflakes, his shadow; the circle that opens and closes a visit
const Page: React.FC<{n: number; f: number; snow?: boolean; shadow?: number; children?: React.ReactNode; html?: React.ReactNode}> = ({n, f, snow = true, shadow = 1, children, html}) => {
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
							<stop offset="100%" stopColor="#edf1f6" />
						</linearGradient>
					</defs>
					<rect x={0} y={800} width={1920} height={280} fill={`url(#chFloor${n})`} />
					{snow &&
						Array.from({length: 24}).map((_, i) => {
							const x = (i * 263 + 40) % 1920;
							const y = ((i * 137 + g * (0.6 + (i % 3) * 0.25)) % 1180) - 60;
							return (
								<g key={i} transform={`translate(${x + Math.sin((g + i * 20) / 40) * 20},${y}) rotate(${g + i * 30})`} stroke="#d6e6f4" strokeWidth={4} strokeLinecap="round">
									<path d="M 0,-12 L 0,12 M -10,-6 L 10,6 M -10,6 L 10,-6" />
								</g>
							);
						})}
					<ellipse cx={HX} cy={FEET + 6} rx={150 * shadow} ry={16 * shadow} fill="#000" opacity={0.1} />
					{/* a puff of snow dust when he springs up */}
					{CHOBI_FIRST.has(n) &&
						f >= 2 &&
						f < 22 &&
						[-1, -0.4, 0.4, 1].map((d, i) => {
							const t = (f - 2) / 20;
							return <circle key={i} cx={HX + d * (60 + t * 130)} cy={FEET - 6 - t * 26 * (1 - Math.abs(d) * 0.3)} r={20 * (1 - t * 0.5)} fill="#e3e8ef" opacity={1 - t} />;
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

const Title: React.FC<{text: string; x: number; y: number; size: number; color?: string; at: number; f: number}> = ({text, x, y, size, color = INK, at, f}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f, at, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05}}>{text}</div>
	);
// a list line with a green tick or a red cross (dark text for the white page)
const Line: React.FC<{f: number; at: number; x: number; y: number; text: string; ok?: boolean; size?: number}> = ({f, at, x, y, text, ok = true, size = 50}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(0,-50%) scale(${pop(f, at, 12)})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22, fontFamily: HEAVY, fontWeight: 900, fontSize: size, color: INK, whiteSpace: 'nowrap'}}>
			<div style={{width: 64, height: 64, flex: '0 0 64px', borderRadius: 16, background: ok ? '#3aa86a' : RED, color: '#fff', textAlign: 'center', lineHeight: '66px', fontSize: 44}}>{ok ? '✓' : '✕'}</div>
			{text}
		</div>
	);

// ============================================================ 4. «Сегодня ты узнаешь, каково это…» =====
const CHIPS: [string, string][] = [
	['36,6°', RED],
	['35°', '#8a5ad8'],
	['32°', '#3a78e0'],
	['28°', '#1e3a8a'],
];
export const C04: React.FC = () => {
	const n = 4;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const t = w(n, 'каково') - 4;
	const chips = w(n, 'шаг') - 4;
	const armR = armAt(1, f, [[0, 'wave'], [t - 8, PRESENT]], g);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Title f={f} at={t} x={1345} y={335} size={74} text="КАКОВО ЭТО —" />
					<Title f={f} at={t + 6} x={1345} y={430} size={74} color="#2f7fd0" text="ЗАМЁРЗНУТЬ НАСМЕРТЬ" />
					{CHIPS.map(([v, c], i) =>
						f < chips + i * 7 ? null : (
							<div key={v} style={{position: 'absolute', left: 1345 + (i - 1.5) * 170, top: 570, transform: `translate(-50%,-50%) scale(${pop(f, chips + i * 7, 10)})`, background: c, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, padding: '10px 22px', borderRadius: 16}}>
								{v}
							</div>
						),
					)}
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={f < t ? [0.1, 0.1] : [0.75, -0.2]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 17. the rule «1 — 10 — 1»: he counts on his fingers =====
const Card: React.FC<{f: number; at: number; x: number; big: string; unit: string; text: string; color: string}> = ({f, at, x, big, unit, text, color}) =>
	f < at ? null : (
		<div style={{position: 'absolute', left: x, top: 510, transform: `translate(-50%,-50%) scale(${pop(f, at, 12)})`, width: 280, height: 360, background: '#fff', border: `8px solid ${color}`, borderRadius: 28, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: INK, boxShadow: '0 12px 30px rgba(0,0,0,0.12)'}}>
			<div style={{fontSize: 160, lineHeight: 1, marginTop: 24, color}}>{big}</div>
			<div style={{fontSize: 40}}>{unit}</div>
			<div style={{fontSize: 26, marginTop: 20, color: '#5a6270', padding: '0 16px', lineHeight: 1.2}}>{text}</div>
		</div>
	);
export const C17: React.FC = () => {
	const n = 17;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const rule = w(n, 'правилу') - 6;
	const one = w(n, 'одна') - 4;
	const ten = w(n, 'десяти') - 4;
	const hour = w(n, 'час') - 4;
	const armR = armAt(1, f, [[0, 'down'], [rule, PRESENT], [one - 8, 'point'], [ten - 8, TEN], [hour - 8, 'point']], g);
	const armL = armAt(-1, f, [[0, 'hip'], [ten - 8, mirror(TEN)], [hour - 8, 'hip']], g);
	// a little hop of joy on «десяти» (both hands up)
	const hp = interpolate(f, [ten - 2, ten + 12], [0, 1], clamp);
	const hop = hp > 0 && hp < 1 ? -Math.sin(hp * Math.PI) * 18 : 0;
	const look: [number, number] = f < rule ? [0.1, 0.1] : f < ten - 4 ? [0.7, -0.1] : f < hour - 4 ? [0.85, -0.05] : [0.95, 0];
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			shadow={k * (1 + hop / 120)}
			html={
				<>
					<Title f={f} at={rule} x={1370} y={240} size={60} text="ПРАВИЛО «1 — 10 — 1»" />
					<Card f={f} at={one} x={1060} big="1" unit="МИНУТА" text="справиться с дыханием" color="#3a8ad8" />
					<Card f={f} at={ten} x={1370} big="10" unit="МИНУТ" text="руки и ноги слушаются" color="#e0a020" />
					<Card f={f} at={hour} x={1680} big="1" unit="ЧАС" text="до потери сознания" color={RED} />
				</>
			}
		>
			<rect x={880} y={172} width={980} height={620} rx={26} fill="#f6f8fa" stroke="#d8dee6" strokeWidth={6} />
			<Stand k={k} b={b} dy={hop}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={look} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 18. «не секундомер, а подсказка… не паникуй. Дыши.» =====
export const C18: React.FC = () => {
	const n = 18;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const shrug = w(n, 'секундомер') - 8;
	const remember = w(n, 'запомни') - 6;
	const panic = w(n, 'паникуй') - 6;
	const br = w(n, 'дыши') - 6;
	const armR = armAt(1, f, [[0, 'point'], [shrug, SHRUG], [remember, 'point'], [br, 'down']], g);
	const armL = armAt(-1, f, [[0, 'hip'], [shrug, mirror(SHRUG)], [remember, 'hip'], [br, 'down']], g);
	const breath = f < br ? 0 : Math.sin(Math.min(1, (f - br) / 40) * Math.PI);
	const watch = f < shrug ? 0 : pop(f, shrug, 12) * (1 - ease(f, remember, remember + 8, 0, 1));
	const look: [number, number] = f >= shrug && f < remember ? [0.55, -0.45] : f >= br ? [0.05, -0.1] : [0.1, 0.1];
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={panic} x={1370} y={330} text="НЕ ПАНИКУЙ" sub="В ПЕРВУЮ МИНУТУ" color={RED} size={70} />
					<Plaque f={f} at={br} x={1370} y={540} text="ДЫШИ" color={ICE} size={90} />
				</>
			}
		>
			{watch > 0.01 && (
				<g transform={`translate(1370,440) scale(${watch})`}>
					<rect x={-22} y={-166} width={44} height={34} rx={9} fill={INK} />
					<circle r={130} fill="#fff" stroke={INK} strokeWidth={12} />
					{Array.from({length: 12}).map((_, i) => (
						<line key={i} x1={0} y1={-104} x2={0} y2={-88} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30})`} />
					))}
					<line x1={0} y1={0} x2={0} y2={-80} stroke={RED} strokeWidth={9} strokeLinecap="round" transform={`rotate(${Math.sin(g / 6) * 40})`} />
					<text x={0} y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={RED}>
						?
					</text>
				</g>
			)}
			{breath > 0 && <circle cx={HX} cy={py(-330)} r={150 + breath * 150} fill="none" stroke="#9fd0ff" strokeWidth={8} opacity={breath * 0.8} />}
			<Stand k={k} b={b * (1 + breath * 0.02)}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} chest={1 + breath * 0.18} look={look} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 20. the body saves the heart and the brain =====
export const C20: React.FC = () => {
	const n = 20;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const heartAt = w(n, 'сердце') - 6;
	const brainAt = w(n, 'мозг') - 6;
	const squeeze = w(n, 'сжимает') - 6;
	const inward = w(n, 'тёплая') - 4;
	const armR = armAt(1, f, [[0, 'down'], [heartAt, HEART_PT], [brainAt, 'point'], [squeeze, SPREAD]], g);
	const armL = armAt(-1, f, [[0, 'down'], [squeeze, mirror(SPREAD)]], g);
	const beat = Math.max(0, Math.sin((g / 23) * Math.PI * 2)) ** 3;
	const reach = ease(f, squeeze + 4, squeeze + 44, 1, 0.2);
	const core = ease(f, inward, inward + 16, 0, 1);
	const brain = ease(f, brainAt, brainAt + 10, 0, 0.85) * (1 - ease(f, squeeze, squeeze + 24, 0, 1));
	const look: [number, number] = f < heartAt ? [0.1, 0.1] : f < brainAt ? [-0.2, 0.8] : f < squeeze ? [0.2, -0.9] : f < inward ? [0.75, 0.55] : [0.1, 0.1];
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={heartAt + 4} x={1190} y={230} text="СЕРДЦЕ" color={RED} size={52} />
					<Plaque f={f} at={brainAt + 4} x={1530} y={230} text="МОЗГ" color="#f39aa8" size={52} />
					<Plaque f={f} at={squeeze + 4} x={1370} y={470} text="СОСУДЫ В РУКАХ И НОГАХ СЖИМАЮТСЯ" color={ICE} size={40} />
					<Plaque f={f} at={inward} x={1370} y={590} text="ТЁПЛАЯ КРОВЬ — ВНУТРЬ, К ОРГАНАМ" color={YEL} size={40} />
				</>
			}
		>
			<defs>
				<radialGradient id="c20core">
					<stop offset="0%" stopColor="#ff5a4a" stopOpacity={0.55} />
					<stop offset="100%" stopColor="#ff5a4a" stopOpacity={0} />
				</radialGradient>
			</defs>
			{core > 0 && <circle cx={HX} cy={py(-330)} r={190} fill="url(#c20core)" opacity={core} />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} heart={{beat, size: 1 + core * 0.2}} heartOver brain={brain} capAt={brain > 0.01 ? [0, -130 * (brain / 0.85), -6 * (brain / 0.85)] : undefined} vessels={{warm: 1, reach}} cold={ease(f, squeeze + 10, squeeze + 40, 0, 0.6)} look={look} armR={armR} armL={armL} />
			</Stand>
			{/* the warm blood goes inside: arrows from the arms to the chest */}
			{core > 0 &&
				[-1, 1].map((sd) => (
					<g key={sd} opacity={core} stroke={RED} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round">
						<path d={`M ${px(sd * 215)},${py(-235)} Q ${px(sd * 200)},${py(-330)} ${px(sd * 120)},${py(-338)}`} />
						<path d={`M ${px(sd * 132)},${py(-358)} L ${px(sd * 112)},${py(-338)} L ${px(sd * 136)},${py(-318)}`} />
					</g>
				))}
		</Page>
	);
};

// ============================================================ 21. «пальцы деревенеют…» =====
export const C21: React.FC = () => {
	const n = 21;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const smart = w(n, 'умно') - 6;
	const numb = w(n, 'деревенеют') - 6;
	const fist = w(n, 'сжать') - 4;
	const vest = w(n, 'застегнуть') - 4;
	const rope = w(n, 'схватиться') - 6;
	// he tries to make a fist: the fingers hardly bend
	const raise: ArmSpec = {...RAISE, curl: f >= fist && f < rope ? 0.34 * Math.abs(Math.sin((f - fist) / 5)) : 0};
	const grab: ArmSpec = {...GRAB, curl: 0.1 + (f >= rope + 10 ? 0.14 * Math.abs(Math.sin((f - rope) / 5)) : 0)};
	const armR = armAt(1, f, [[0, SPREAD], [smart, 'point'], [numb - 8, raise], [rope, grab]], g);
	const armL = armAt(-1, f, [[0, mirror(SPREAD)], [smart, 'hip']], g);
	const look: [number, number] = f < numb - 8 ? [0.1, 0.1] : f < rope ? [0.8, 0.45] : [0.9, -0.2];
	const drop = ease(f, rope - 6, rope + 6, -620, 0);
	const rx = px(232) + Math.sin(g / 12) * 4;
	// the heart and the warm glow of the shot before fade away
	const was = 1 - ease(f, 0, 16, 0, 1);
	const beat = Math.max(0, Math.sin((g / 23) * Math.PI * 2)) ** 3;
	return (
		<Page
			n={n}
			f={f}
			html={
				<>
					<Plaque f={f} at={numb} x={1370} y={210} text="ПАЛЬЦЫ ДЕРЕВЕНЕЮТ" color={ICE} size={52} />
					<Line f={f} at={fist} x={1000} y={360} ok={false} size={46} text="НЕ СЖАТЬ КУЛАК" />
					<Line f={f} at={vest} x={1000} y={470} ok={false} size={46} text="НЕ ЗАСТЕГНУТЬ ЖИЛЕТ" />
					<Line f={f} at={rope + 4} x={1000} y={580} ok={false} size={46} text="НЕ СХВАТИТЬСЯ ЗА ВЕРЁВКУ" />
				</>
			}
		>
			<defs>
				<radialGradient id="c21core">
					<stop offset="0%" stopColor="#ff5a4a" stopOpacity={0.55} />
					<stop offset="100%" stopColor="#ff5a4a" stopOpacity={0} />
				</radialGradient>
			</defs>
			{was > 0 && <circle cx={HX} cy={py(-330)} r={190} fill="url(#c21core)" opacity={was} />}
			{f >= rope - 6 && <path d={`M ${rx},${-30 + drop} Q ${rx + 8},${260 + drop} ${rx - 4},${530 + drop}`} stroke="#b08850" strokeWidth={14} fill="none" strokeLinecap="round" />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} cold={0.6} heart={was > 0 ? {beat, size: 1.2 * was} : undefined} heartOver handFrost={ease(f, numb, numb + 24, 0, 0.95)} vessels={{warm: 1, reach: ease(f, 0, 20, 0.2, 0)}} look={look} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 25. the shivering — «твой внутренний обогреватель» =====
export const C25: React.FC = () => {
	const n = 25;
	const {f, g, k, jaw, blink, b} = useHost(n);
	const brr = w(n, 'дрожь') - 4;
	const heat = w(n, 'обогреватель') - 6;
	const mus = w(n, 'мышцы') - 4;
	const warmUp = w(n, 'сокращаются') - 4;
	const on = ease(f, heat, heat + 10, 0, 1);
	const wv = ease(f, warmUp, warmUp + 10, 0, 1);
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={brr} x={1370} y={200} text="ДРОЖЬ" color={ICE} size={64} />
					<Plaque f={f} at={mus} x={1370} y={760} text="МЫШЦЫ ВЫРАБАТЫВАЮТ ТЕПЛО" color="#ff8a4a" size={40} />
				</>
			}
		>
			{f >= heat && <g transform={`translate(1370,470) scale(${0.8 * pop(f, heat, 12)})`}>{<Heater on={on} />}</g>}
			{/* the trembling marks (they quiver, they do not blink) */}
			{[0, 1, 2, 3].map((i) => {
				const sd = i % 2 ? 1 : -1;
				const q = Math.sin(g * 0.9 + i * 1.7) * 5;
				return <path key={i} d={`M ${px(sd * (178 + (i > 1 ? 26 : 0))) + sd * q},${py(-540 + i * 64)} l ${sd * 30},0`} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={0.75} />;
			})}
			{/* the warmth of the muscles rising off his shoulders */}
			{wv > 0 &&
				[-1, 1].map((sd) =>
					[0, 1].map((i) => {
						const t = ((g + i * 21 + (sd > 0 ? 10 : 0)) % 42) / 42;
						return <path key={`${sd}${i}`} d={`M ${px(sd * (95 + i * 24))},${py(-430) - t * 90} q 12,-16 0,-32 q -12,-16 0,-32`} stroke="#ff8a5a" strokeWidth={7} fill="none" strokeLinecap="round" opacity={wv * (1 - t)} />;
					}),
				)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} f={g} shiver={1.2} cold={0.85} look={[0.25, 0.05]} armR={HUG} armL={mirror(HUG)} />
			</Stand>
		</Page>
	);
};

// ============================================================ 34. «стало легче… силы кончились… выключился» =====
export const C34: React.FC = () => {
	const n = 34;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const easy = w(n, 'легче') - 4;
	const weak = w(n, 'силы') - 6;
	const off = w(n, 'выключился') - 4;
	const on = f < off ? 1 : interpolate(f, [off, off + 12], [1, 0], clamp);
	const shiver = 1.2 * (1 - ease(f, easy, easy + 14, 0, 1));
	const slump = ease(f, weak, weak + 18, 0, 1);
	const armR = armAt(1, f, [[0, HUG], [easy, 'down']], g, 12);
	const armL = armAt(-1, f, [[0, mirror(HUG)], [easy, 'down']], g, 12);
	const look: [number, number] = f < easy ? [0.25, 0.05] : f < weak ? [0.05, -0.05] : [0.15, 0.6];
	return (
		<Page
			n={n}
			f={f}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={easy} to={weak - 10} x={1370} y={200} text="СТАЛО ЛЕГЧЕ?" color="#9fd8ff" size={52} />
					<Plaque f={f} at={weak} x={1370} y={200} text="СИЛЫ КОНЧИЛИСЬ" color="#7aa8f0" size={52} />
					<Plaque f={f} at={off} x={1370} y={760} text="ОБОГРЕВАТЕЛЬ ВЫКЛЮЧИЛСЯ" color="#8a94a6" size={44} />
				</>
			}
		>
			<g transform="translate(1370,470) scale(0.8)">
				<Heater on={on} />
			</g>
			<Stand k={k} b={b * (1 - 0.03 * slump)}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={Math.max(blink, slump * 0.45)} tilt={tilt * (1 - slump) + slump * 9} f={g} shiver={shiver} cold={0.85} frost={ease(f, off, off + 50, 0, 0.85)} look={look} armR={armR} armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 39. the false heat: «ему жарко» =====
export const C39: React.FC = () => {
	const n = 39;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const relax = w(n, 'расслабляются') - 6;
	const skin = w(n, 'приливает') - 4;
	const hot = w(n, 'кажется') - 4;
	const open = ease(f, relax, relax + 16, 0, 1);
	const melt = ease(f, relax, relax + 30, 0, 1);
	const flush = ease(f, skin - 4, skin + 14, 0, 1);
	const heatT = ease(f, hot, hot + 10, 0, 1);
	const fan: ArmSpec = {...FAN, hang: 200 + Math.sin(g / 2.4) * 28};
	const armR = armAt(1, f, [[0, 'down'], [hot, fan]], g);
	const look: [number, number] = f < relax ? [0.1, 0.1] : f < hot ? [0.3, 0.7] : [0.1, 0.05];
	const bub = f >= hot ? pop(f, hot + 2, 11) : 0;
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={relax + 4} x={1400} y={470} text="СОСУДЫ РАССЛАБЛЯЮТСЯ" color={RED} size={44} />
					<Plaque f={f} at={skin} x={1400} y={590} text="КРОВЬ ПРИЛИВАЕТ К КОЖЕ" color="#ff8a6a" size={44} />
				</>
			}
		>
			<defs>
				<radialGradient id="c39glow">
					<stop offset="0%" stopColor="#ff5a4a" stopOpacity={0.4} />
					<stop offset="100%" stopColor="#ff5a4a" stopOpacity={0} />
				</radialGradient>
			</defs>
			{flush > 0 && <ellipse cx={HX} cy={py(-390)} rx={330} ry={430} fill="url(#c39glow)" opacity={flush} />}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} frost={0.85 * (1 - melt)} cold={0.9 * (1 - melt)} vessels={{warm: open, reach: 0.2 + 0.8 * open}} sweat={heatT} look={look} armR={armR} armL="hip" />
			</Stand>
			{/* steam off his head */}
			{heatT > 0 &&
				[0, 1, 2].map((i) => {
					const t = ((g + i * 13) % 40) / 40;
					return <circle key={i} cx={px(-70 + i * 70) + Math.sin((g + i * 9) / 6) * 8} cy={py(-720) - t * 120} r={18 + t * 22} fill="#dfe4ea" opacity={heatT * (1 - t) * 0.9} />;
				})}
			{/* «ЖАРКО?!» in a speech bubble */}
			{bub > 0.01 && (
				<g transform={`translate(${px(160)},${py(-610)}) scale(${bub}) translate(${-px(160)},${-py(-610)})`}>
					<path d={`M ${px(250)},${py(-655)} L ${px(160)},${py(-610)} L ${px(290)},${py(-640)} Z`} fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
					<rect x={px(240)} y={py(-800)} width={440} height={140} rx={40} fill="#fff" stroke={INK} strokeWidth={8} />
					<rect x={px(250)} y={py(-668)} width={60} height={16} fill="#fff" />
					<text x={px(240) + 220} y={py(-800) + 96} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={RED}>
						ЖАРКО?!
					</text>
				</g>
			)}
		</Page>
	);
};

// ============================================================ 42. the slowing heart =====
// the heartbeats of the sound track (SFX.tsx: beats(s(42) + 8, [0, 30, 64, 108, 150, 210]))
const BEATS42 = [8, 38, 72, 116, 158, 218];
const ECG_K: [number, number][] = [
	[0, 0],
	[0.6, -14],
	[1.4, 110],
	[2.2, -45],
	[3, 0],
	[6, 0],
	[8, 22],
	[10, 0],
];
const ecgAt = (t: number) => {
	let v = 0;
	for (const bt of BEATS42) {
		const d = t - bt;
		if (d <= 0 || d >= 10) continue;
		for (let i = 0; i < ECG_K.length - 1; i++) {
			const [a, va] = ECG_K[i];
			const [c, vc] = ECG_K[i + 1];
			if (d >= a && d < c) v += va + ((d - a) / (c - a)) * (vc - va);
		}
	}
	return v;
};
export const C42: React.FC = () => {
	const n = 42;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const L = len(n);
	const pulse = (t: number) => (t < 0 ? 0 : t < 3 ? t / 3 : Math.exp(-(t - 3) / 4));
	const beat = Math.max(...BEATS42.map((bt) => pulse(f - bt)));
	const past = BEATS42.filter((bt) => bt <= f);
	const bpm = past.length >= 2 ? Math.round(1800 / (past[past.length - 1] - past[past.length - 2])) : 64;
	// the monitor sweeps from left to right over the shot
	const X0 = 950;
	const WD = 820;
	const Y0 = 450;
	const pts: string[] = [];
	for (let t = 0; t <= Math.min(f, L); t += 0.25) pts.push(`${(X0 + (t / L) * WD).toFixed(1)},${(Y0 - ecgAt(t)).toFixed(1)}`);
	const hx = X0 + (Math.min(f, L) / L) * WD;
	return (
		<Page n={n} f={f} shadow={k} html={<Plaque f={f} at={w(n, 'ниже') - 4} x={1360} y={735} text="НИЖЕ 28° — СЕРДЦЕ МОЖЕТ ОСТАНОВИТЬСЯ" color={RED} size={34} />}>
			<rect x={920} y={170} width={880} height={450} rx={30} fill="#06140c" stroke="#1e4a2e" strokeWidth={8} />
			{Array.from({length: 9}).map((_, i) => (
				<line key={i} x1={950 + i * 102.5} y1={200} x2={950 + i * 102.5} y2={590} stroke="#0e2a1a" strokeWidth={2} />
			))}
			<polyline points={pts.join(' ')} fill="none" stroke="#5aff8a" strokeWidth={6} strokeLinejoin="round" />
			<circle cx={hx} cy={Y0 - ecgAt(Math.min(f, L))} r={9} fill="#c8ffd6" />
			<text x={1770} y={250} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontWeight={900} fontSize={58} fill="#5aff8a">
				♥ {bpm}
			</text>
			<text x={1770} y={284} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={22} fill="#3aa860">
				УД/МИН
			</text>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={Math.max(blink, 0.3)} tilt={5 + tilt * 0.4} f={g} heart={{beat, size: 1.15}} heartOver frost={0.55} cold={1} look={[-0.3, 0.75]} armR={HEART_PT} armL="down" />
			</Stand>
		</Page>
	);
};

// ============================================================ 55. «Никто не мёртв, пока он не тёплый и мёртвый» =====
export const C55: React.FC = () => {
	const n = 55;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const slow = w(n, 'замедлил') - 4;
	const brainAt = w(n, 'мозгу') - 6;
	const o2 = w(n, 'кислорода') - 6;
	const rule = w(n, 'правило') - 6;
	const gone = ease(f, rule - 8, rule + 2, 0, 1);
	const brain = ease(f, brainAt, brainAt + 10, 0, 0.85) * (1 - ease(f, rule, rule + 12, 0, 1));
	const armR = armAt(1, f, [[0, 'down'], [rule, 'point']], g);
	const look: [number, number] = f < brainAt ? [0.6, -0.1] : f < rule ? [0.2, -0.9] : [0.1, 0.1];
	// a clock whose hand runs down
	const ang = f < slow ? 0 : 720 * (1 - Math.exp(-(f - slow) / 45));
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={slow + 6} to={rule - 10} x={1370} y={620} text="ХОЛОД ЗАМЕДЛЯЕТ ВСЁ" color={ICE} size={44} />
					<Plaque f={f} at={o2} to={rule - 10} x={1370} y={730} text="МОЗГУ НУЖНО МЕНЬШЕ КИСЛОРОДА" color="#7fc4ff" size={40} />
					{f >= rule && (
						<div style={{position: 'absolute', left: 1370, top: 430, transform: `translate(-50%,-50%) scale(${pop(f, rule, 14)})`, width: 920, padding: '40px 30px', background: '#fffaf0', border: '6px solid #e8dcc0', borderRadius: 26, textAlign: 'center', fontFamily: "'PT Serif', Georgia, serif", fontWeight: 700, fontSize: 56, lineHeight: 1.25, color: INK, boxShadow: '0 12px 30px rgba(0,0,0,0.12)'}}>
							«Никто не мёртв,
							<br />
							пока он не <span style={{color: RED}}>тёплый</span> и мёртвый»
							<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 26, color: '#8a8070', marginTop: 18, letterSpacing: 2}}>ПРАВИЛО ВРАЧЕЙ</div>
						</div>
					)}
				</>
			}
		>
			{f >= slow && gone < 1 && (
				<g transform={`translate(1370,400) scale(${pop(f, slow, 12) * (1 - gone)})`}>
					<circle r={130} fill="#fff" stroke={INK} strokeWidth={12} />
					{Array.from({length: 12}).map((_, i) => (
						<line key={i} x1={0} y1={-104} x2={0} y2={-88} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30})`} />
					))}
					<line x1={0} y1={0} x2={0} y2={-84} stroke="#3a78e0" strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang})`} />
					<circle r={12} fill={INK} />
				</g>
			)}
			{/* O₂ by his head: it shrinks */}
			{f >= o2 && gone < 1 && (
				<g transform={`translate(${px(270)},${py(-700)}) scale(${pop(f, o2, 12) * ease(f, o2 + 6, o2 + 36, 1, 0.6) * (1 - gone)})`}>
					<circle r={82} fill="#e8f4ff" stroke="#3a8ad8" strokeWidth={8} />
					<text x={0} y={25} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={72} fill="#3a8ad8">
						O₂
					</text>
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} brain={brain} capAt={brain > 0.01 ? [0, -130 * (brain / 0.85), -6 * (brain / 0.85)] : undefined} cold={0.4} look={look} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 63. the wind and the wet clothes =====
const Streaks: React.FC<{g: number; o: number}> = ({g, o}) =>
	o <= 0 ? null : (
		<g opacity={o}>
			{Array.from({length: 12}).map((_, i) => {
				const t = ((g * 9 + i * 173) % 2400) / 2400;
				const yy = 140 + ((i * 97) % 620);
				return <path key={i} d={`M ${2000 - t * 2400},${yy} q -60,-12 -160,0 q -60,12 -120,-6`} stroke="#bcd0e2" strokeWidth={6} fill="none" strokeLinecap="round" />;
			})}
		</g>
	);
export const C63: React.FC = () => {
	const n = 63;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const windAt = w(n, 'ветер') - 6;
	const wetAt = w(n, 'мокрая') - 4;
	const blow = w(n, 'сдувает') - 4;
	const fast = w(n, 'ткань') - 4;
	const wind = ease(f, windAt, windAt + 12, 0, 1);
	const fly = interpolate(f, [blow, blow + 26], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const strip = ease(f, blow, blow + 24, 0, 1);
	const armL = armAt(-1, f, [[0, 'hip'], [blow + 2, mirror(REACH)], [blow + 36, 'hip']], g);
	const look: [number, number] = f >= blow && f < blow + 30 ? [-0.9, -0.7] : [0.3, -0.1];
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			shadow={k}
			html={
				<>
					<Plaque f={f} at={windAt + 4} x={1150} y={630} text="ВЕТЕР" color={ICE} size={50} />
					<Plaque f={f} at={wetAt + 4} x={1590} y={630} text="МОКРАЯ ОДЕЖДА" color="#7fc4ff" size={50} />
					<Plaque f={f} at={fast} x={1370} y={760} text="ТЕПЛО УХОДИТ В РАЗЫ БЫСТРЕЕ" color={RED} size={40} />
				</>
			}
		>
			<Streaks g={g} o={wind} />
			{f >= windAt && (
				<g transform={`translate(1150,410) scale(${pop(f, windAt, 12)})`} stroke="#5a8fc8" strokeWidth={16} fill="none" strokeLinecap="round">
					<path d="M -140,-70 L 60,-70 C 120,-70 120,-150 60,-150 C 20,-150 14,-110 30,-100" />
					<path d="M -160,0 L 110,0 C 170,0 170,-80 110,-80" />
					<path d="M -140,70 L 40,70 C 100,70 100,150 40,150 C 0,150 -6,110 10,100" />
				</g>
			)}
			{f >= wetAt && (
				<g transform={`translate(1590,410) scale(${pop(f, wetAt, 12)})`}>
					<path d="M -120,-130 L 120,-130 L 160,-60 L 110,-36 L 110,140 L -110,140 L -110,-36 L -160,-60 Z" fill="#7aa8d8" stroke="#3a6aa8" strokeWidth={8} strokeLinejoin="round" />
					{[0, 1, 2, 3].map((i) => {
						const t = ((g + i * 9) % 30) / 30;
						return <path key={i} d="M 0,-14 C 8,-2 8,8 0,10 C -8,8 -8,-2 0,-14 Z" fill="#3a8ad8" opacity={1 - t} transform={`translate(${-75 + i * 50},${150 + t * 60})`} />;
					})}
				</g>
			)}
			{/* the warm air around him that the wind strips away */}
			<defs>
				<radialGradient id="c63warm">
					<stop offset="0%" stopColor="#ffb070" stopOpacity={0.5} />
					<stop offset="100%" stopColor="#ffb070" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={HX - strip * 420} cy={py(-390)} rx={260} ry={440} fill="url(#c63warm)" opacity={(1 - strip) * Math.max(0.5, wind)} />
			<Stand k={k} b={b} lean={4 * wind}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={Math.max(blink, 0.3 * wind)} tilt={tilt} f={g} cold={0.5} cap={fly < 1} capAt={fly > 0 ? [-fly * 1150, -fly * 420 - Math.sin(fly * Math.PI) * 140, -fly * 620] : undefined} look={look} armR="down" armL={armL} />
			</Stand>
		</Page>
	);
};

// ============================================================ 64. «одевайся слоями…» =====
export const C64: React.FC = () => {
	const n = 64;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const layers = w(n, 'слоями') - 6;
	const calm = ease(f, 0, 14, 1, 0);
	// the cap the wind took falls back onto his head
	const capY = interpolate(f, [2, 38], [-900, 0], {...clamp, easing: Easing.bounce});
	const armR = armAt(1, f, [[0, 'down'], [layers, 'point']], g);
	const poof = (at: number, x: number, y: number) =>
		f >= at && f < at + 12 ? <circle cx={x} cy={y} r={30 + (f - at) * 9} fill="none" stroke={YEL} strokeWidth={8} opacity={1 - (f - at) / 12} /> : null;
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Line f={f} at={layers} x={960} y={330} text="ОДЕВАЙСЯ СЛОЯМИ" />
					<Line f={f} at={w(n, 'потей') - 4} x={960} y={460} text="НЕ ПОТЕЙ НА МОРОЗЕ" />
					<Line f={f} at={w(n, 'промокла') - 4} x={960} y={590} text="ПРОМОКЛО — ПЕРЕОДЕНЬСЯ" />
				</>
			}
		>
			<Streaks g={g} o={calm} />
			{poof(layers + 2, HX, py(-400))}
			{poof(layers + 8, px(-90), py(-226))}
			{poof(layers + 8, px(116), py(-420))}
			<Stand k={k} b={b} lean={4 * calm}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} capAt={f < 38 ? [0, capY, 0] : undefined} scarf={f >= layers + 2} mittens={f >= layers + 8} look={f < 30 ? [0.05, -0.9] : [0.6, -0.1]} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// ============================================================ 65. the sandwich, and the phone in the «inner pocket» =====
const Sandwich: React.FC<{bites: number}> = ({bites}) => {
	const x0 = -46 + bites * 22;
	const wd = 92 - bites * 22;
	return (
		<g>
			<rect x={x0} y={-20} width={wd} height={18} rx={9} fill="#e8b46a" stroke="#b8843a" strokeWidth={3} />
			<rect x={x0 - 2} y={-4} width={wd + 4} height={10} rx={5} fill="#6ab04a" />
			<rect x={x0} y={6} width={wd} height={10} rx={4} fill="#e0705a" />
			<rect x={x0} y={16} width={wd} height={18} rx={9} fill="#e8b46a" stroke="#b8843a" strokeWidth={3} />
		</g>
	);
};
const PhoneItem: React.FC = () => (
	<g transform="translate(0,-40)">
		<rect x={-24} y={-42} width={48} height={84} rx={9} fill="#16171b" />
		<rect x={-19} y={-36} width={38} height={70} rx={6} fill="#5a9ae8" />
	</g>
);
export const C65: React.FC = () => {
	const n = 65;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const eat = Math.max(2, w(n, 'ешь') - 8);
	const fuel = w(n, 'топливо') - 4;
	const phone = w(n, 'телефон') - 10;
	const pocket = w(n, 'внутреннем') - 4;
	const batAt = w(n, 'батарея') - 6;
	const drain = w(n, 'садится') - 4;
	const b1 = eat + 10;
	const b2 = Math.max(fuel, b1 + 26);
	const phoneArm: ArmSpec = {...PHONE_SHOW, item: <PhoneItem />};
	const phoneIn: ArmSpec = {...PHONE_IN, item: <PhoneItem />};
	let armR = armAt(
		1,
		f,
		[
			[0, 'point'],
			[eat, EAT_REST],
			[b1, EAT_BITE],
			[b1 + 12, EAT_REST],
			[b2, EAT_BITE],
			[b2 + 12, EAT_REST],
			[phone, phoneArm],
			[pocket, phoneIn],
			[pocket + 20, 'down'],
		],
		g,
	);
	// the phone slides in behind the ribs
	const inside = f >= pocket + 12;
	if (inside && f < pocket + 20) armR = {...armR, item: undefined};
	const bites = (f >= b1 + 6 ? 1 : 0) + (f >= b2 + 6 ? 1 : 0);
	const chew = [b1, b2].some((bt) => f >= bt + 4 && f < bt + 18) ? 0.3 + 0.3 * Math.abs(Math.sin(f / 2)) : 0;
	const sw = f < eat ? 0 : pop(f, eat, 12) * (1 - ease(f, phone, phone + 6, 0, 1));
	const crumbs = [b1, b2].map((bt) =>
		f >= bt + 8 && f < bt + 36
			? Array.from({length: 5}).map((_, i) => {
					const t = (f - bt - 8) / 28;
					return <circle key={`${bt}${i}`} cx={-22 + i * 11} cy={-420 + 380 * t * t} r={5} fill="#c8903a" opacity={1 - t * 0.5} />;
				})
			: null,
	);
	const bat = Math.round(interpolate(f, [drain, drain + 34], [46, 15], clamp));
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			html={
				<>
					<Plaque f={f} at={fuel} x={1370} y={200} text="ЕДА = ТОПЛИВО ДЛЯ ДРОЖИ" color="#ff8a3a" size={44} />
					<Plaque f={f} at={pocket} x={1370} y={760} text="ТЕЛЕФОН — ВО ВНУТРЕННИЙ КАРМАН" color={ICE} size={38} />
				</>
			}
		>
			{f >= batAt && (
				<g transform={`translate(1370,470) scale(${pop(f, batAt, 12)})`}>
					<rect x={-110} y={-200} width={220} height={400} rx={30} fill="#14161c" />
					<rect x={-94} y={-180} width={188} height={360} rx={20} fill="#1e2a40" />
					<g transform="translate(0,-110)" stroke="#bfe4ff" strokeWidth={6} strokeLinecap="round">
						<path d="M 0,-30 L 0,30 M -26,-15 L 26,15 M -26,15 L 26,-15" />
					</g>
					<rect x={-56} y={-26} width={102} height={52} rx={10} fill="none" stroke="#fff" strokeWidth={8} />
					<rect x={48} y={-10} width={10} height={20} rx={3} fill="#fff" />
					<rect x={-48} y={-18} width={86 * (bat / 100)} height={36} rx={6} fill={bat > 30 ? '#3aa86a' : RED} />
					<text x={0} y={100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={48} fill="#fff">
						{bat}%
					</text>
				</g>
			)}
			<Stand k={k} b={b}>
				<Choby
					x={HX}
					y={FEET}
					s={S}
					jaw={Math.max(jaw, chew)}
					blink={blink}
					tilt={tilt}
					f={g}
					scarf
					mittens
					inner={
						<>
							{crumbs}
							{inside && (
								<g transform="translate(0,-290)">
									<PhoneItem />
								</g>
							)}
						</>
					}
					outer={sw > 0.01 ? <g transform={`translate(${armR.ha[0] - 40},${armR.ha[1] - 24}) scale(${sw * 1.3})`}>{<Sandwich bites={bites} />}</g> : undefined}
					look={f < phone ? [0.4, 0.3] : f < pocket + 20 ? [0.1, 0.7] : [0.6, -0.1]}
					armR={armR}
					armL="hip"
				/>
			</Stand>
		</Page>
	);
};

// ============================================================ 78. «подпишись» =====
export const C78: React.FC = () => {
	const n = 78;
	const {f, g, k, jaw, blink, tilt, b} = useHost(n);
	const press = w(n, 'подпишись') - 6;
	const tgk = w(n, 'тгк') - 8;
	const link = w(n, 'ссылка') - 4;
	const armR = armAt(1, f, [[0, 'wave'], [press, PRESENT], [tgk, 'point'], [link + 14, 'wave']], g);
	const click = press + 22;
	const done = f >= click + 2;
	const cur = interpolate(f, [press + 6, press + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const pressK = f >= click && f < click + 5 ? 0.93 : 1;
	const look: [number, number] = f >= press && f < tgk ? [0.8, -0.1] : [0.1, 0.1];
	return (
		<Page
			n={n}
			f={f}
			snow={false}
			shadow={k}
			html={
				<>
					{f >= 6 && <div style={{position: 'absolute', left: 1370, top: 240, transform: `translate(-50%,-50%) scale(${pop(f, 6, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 150, color: INK, textShadow: `9px 9px 0 ${YEL}`}}>CHOBI</div>}
					{f >= press && (
						<div style={{position: 'absolute', left: 1370, top: 460, transform: `translate(-50%,-50%) scale(${pop(f, press, 12) * pressK})`, background: done ? '#e4e4ea' : RED, color: done ? INK : '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 62, padding: '20px 56px 24px', borderRadius: 60, whiteSpace: 'nowrap', boxShadow: done ? 'none' : '0 8px 0 #8f1416'}}>
							{done ? 'ВЫ ПОДПИСАНЫ ✓' : 'ПОДПИСАТЬСЯ'}
						</div>
					)}
					{f >= press + 6 && f < click + 30 && (
						<svg width={80} height={90} viewBox="0 0 80 90" style={{position: 'absolute', left: 1760 - cur * 330, top: 760 - cur * 270, opacity: interpolate(f, [click + 20, click + 30], [1, 0], clamp)}}>
							<path d="M 6,4 L 6,70 L 22,56 L 34,84 L 46,78 L 34,52 L 56,52 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
						</svg>
					)}
					{f >= tgk && <div style={{position: 'absolute', left: 1370, top: 640, transform: `translate(-50%,-50%) scale(${pop(f, tgk, 12)})`, background: '#2a9ad8', color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, padding: '14px 38px', borderRadius: 22, whiteSpace: 'nowrap'}}>РАННИЙ ДОСТУП — В ТГК</div>}
					{f >= link && <div style={{position: 'absolute', left: 1370, top: 730, transform: `translate(-50%,-50%) scale(${pop(f, link, 12)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 34, color: '#6a7280', letterSpacing: 2, whiteSpace: 'nowrap'}}>ССЫЛКА В ПРОФИЛЕ</div>}
				</>
			}
		>
			<Stand k={k} b={b}>
				<Choby x={HX} y={FEET} s={S} jaw={jaw} blink={blink} tilt={tilt} f={g} look={look} armR={armR} armL="hip" />
			</Stand>
		</Page>
	);
};

// which shots Чоби takes over
export const CHOBI_SHOTS: Partial<Record<number, React.FC>> = {4: C04, 17: C17, 18: C18, 20: C20, 21: C21, 25: C25, 34: C34, 39: C39, 42: C42, 55: C55, 63: C63, 64: C64, 65: C65, 78: C78};
