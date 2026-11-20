// «Голосовые из завтра» — часть 5 «Побег» (the viewers chose to run). 21 shots on the timeline of src/g5/timeline.ts
// (= the voice, see scripts/fit-voiceover.py --part g5).
// You pull your hand away — «Зря», in your own voice. You run; he only walks, and never falls behind. Max grabs you at
// the stairs: «Ты же только что был в классе!» You hide in the cloakroom — a new voice message: everyone who takes him
// for you makes him stronger and you more transparent; your hand is see-through. «If mom doesn't know you — you vanish.
// Run home.» Past the lift (the first voice message), the 7th floor, the doorbell under a see-through finger. Mom opens
// the door and looks at you like at a stranger — and HE comes out of the kitchen with your mug: «Мам, кто там?» Two sons,
// one face. «Кто из вас… мой?» Finale: tell mom a secret only you two know, or play her the voice messages.
// Phone UI from part 1, recap / mom / finale from part 2, Max from 2b, the landing / front door from 3, the corridor /
// the double's grin from 4. Shot in the «3D camera» of «Ты с какого района?»: flat layers at real depths (Scene3D), the
// camera moves between them, the background is soft (depth of field).
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Cam3, Card3D, PERSP, Scene3D} from '../components/Scene3D';
import {Stage} from '../components/Stage';
import {vignette} from '../r1/scenes';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import * as G2B from '../g2b/scenes';
import * as G3 from '../g3/scenes';
import * as G4 from '../g4/scenes';
import envJson from './env.json';

const {YELLOW, RED, PHONE_BG, Phone, ChatScreen, VoiceBubble, LiftLanding, rnd, focus} = G1;
const {Recap, MOM, Finale, Hall} = G2;
const {Max} = G2B;
const {FrontDoor, DOUBLE_FACE} = G3;
const {Corridor, ProfileHand, GRIN, SMILE, KID_COLS} = G4;

const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

const SCARED: Face = {eyes: 'wide', pupil: 0.5, brows: 'worried', mouth: 'o', look: [0, 0], blush: false};
// how much of you is left (1 = all of you; you fade as people take him for you)
const GHOST = 0.55;

// ======================================================= the 3D camera =====
// Like «Ты с какого района?»: every flat layer of a set stands at its own depth in CSS 3D and the camera moves between
// them — near layers slide faster than far ones, the background is soft (depth of field). A layer is drawn in the flat
// 1080×1920 picture coordinates of the 2D scenes and placed so that the resting camera sees it exactly where the flat
// picture had it; any camera move then gives parallax.
type Box = [number, number, number, number];
const kz = (z: number) => PERSP / (PERSP - z);
const Lay: React.FC<{z: number; box: Box; res?: number; blur?: number; children: React.ReactNode}> = ({z, box, res, blur, children}) => {
	const k = kz(z);
	const [bx, by, bw, bh] = box;
	return (
		<Card3D x={(bx + bw / 2 - 540) / k} y={(by + bh / 2 - 960) / k} z={z} w={bw / k} h={bh / k} anchor="center" view={box} res={res ?? Math.max(1, Math.round(1 / k))} blur={blur}>
			{children}
		</Card3D>
	);
};
// a person's layer: a box around a figure standing at (x, y) with scale s
const personBox = (x: number, y: number, s: number, wide = 520): Box => [x - wide * s, y - 1260 * s, 2 * wide * s, 1320 * s];
// the stage: far pass (blurred) + near layers + the lens vignette
const Set3D: React.FC<{cam: Cam3; bg: string; far: React.ReactNode; blur?: number; vig?: number; children?: React.ReactNode}> = ({cam, bg, far, blur = 3, vig = 0.55, children}) => (
	<AbsoluteFill>
		<Scene3D cam={cam} bg={bg} far={far} farBlur={blur}>
			{children}
		</Scene3D>
		{vignette(vig)}
	</AbsoluteFill>
);
// a far set layer (the whole flat background, rasterised a bit smaller: it is blurred anyway)
const Far: React.FC<{z?: number; box?: Box; children: React.ReactNode}> = ({z = -1400, box = [-460, -300, 2000, 2600], children}) => (
	<Lay z={z} box={box} res={Math.round(1 / kz(z)) + 1}>
		{children}
	</Lay>
);

// ======================================================= scene pieces =====
// the corridor of part 4, a little brighter
const CorridorLit: React.FC = () => (
	<g>
		<Corridor />
		<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" opacity={0.35} />
	</g>
);

// the school cloakroom: a long rail of hooks with jackets, a bench with bags, a window (the back layer)
const JACKETS = ['#3b5f8a', '#7a3b3b', '#2f6e47', '#8a7a3b', '#4a4a58', '#a85a2a', '#3b3b6e', '#6e3b5f', '#2a6e6e'];
const Jacket: React.FC<{x: number; c: string; w?: number; h?: number; rot?: number}> = ({x, c, w = 190, h = 470, rot = 0}) => (
	<g transform={`translate(${x},430) rotate(${rot})`}>
		<path d={`M ${-w * 0.32},0 Q 0,-34 ${w * 0.32},0 L ${w / 2},${h * 0.18} L ${w / 2 + 14},${h} L ${-w / 2 - 14},${h} L ${-w / 2},${h * 0.18} Z`} fill={c} />
		<path d={`M ${-w * 0.32},0 Q 0,-34 ${w * 0.32},0 L ${w * 0.22},${h * 0.16} Q 0,${h * 0.05} ${-w * 0.22},${h * 0.16} Z`} fill="#000" opacity={0.18} />
		<line x1={0} y1={h * 0.12} x2={0} y2={h} stroke="#000" strokeWidth={5} opacity={0.2} />
		<rect x={-w / 2 - 14} y={h - 26} width={w + 28} height={26} fill="#000" opacity={0.12} />
	</g>
);
const CloakBack: React.FC = () => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#eadfc3" />
		<rect x={-500} y={1180} width={2200} height={1400} fill="#a98a62" />
		<rect x={-500} y={1170} width={2200} height={12} fill="#8f7350" />
		<rect x={760} y={-120} width={300} height={260} fill="#f4f1ea" />
		<rect x={776} y={-104} width={268} height={228} fill="#bfe0f5" />
		<ellipse cx={910} cy={420} rx={360} ry={240} fill="#fff7d6" opacity={0.25} />
		<rect x={-500} y={392} width={2200} height={18} fill="#8f969e" />
		{Array.from({length: 12}).map((_, k) => (
			<path key={k} d={`M ${-430 + k * 200},402 q 0,40 22,40`} stroke="#6d747c" strokeWidth={8} fill="none" />
		))}
		{JACKETS.map((c, k) => (k === 4 || k === 5 ? null : <Jacket key={k} x={-380 + k * 200} c={c} />))}
		<rect x={-500} y={1000} width={2200} height={34} rx={8} fill="#b8864e" />
		{[-300, 120, 860].map((x, k) => (
			<rect key={k} x={x} y={890} width={150} height={110} rx={20} fill={['#2d6cdf', '#e0a526', '#8a5ab8'][k]} />
		))}
		<rect x={-500} y={1034} width={2200} height={10} fill="#8f6a3e" />
	</g>
);
// the two jackets in front of you; `gap` 0…1 = you push them apart, `sway` = they swing on their hooks
const CloakFront: React.FC<{gap: number; sway?: number}> = ({gap, sway = 0}) => (
	<g>
		<Jacket x={430 - gap * 55} c={JACKETS[4]} rot={sway} />
		<Jacket x={650 + gap * 55} c={JACKETS[5]} rot={-sway * 0.8} />
	</g>
);

// your hand, palm towards you, fingers up (art centred on the palm); drawn half see-through by the caller
const Palm: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-70} y={90} width={140} height={360} rx={50} fill="#cf4a3c" />
		<rect x={-76} y={80} width={152} height={40} rx={14} fill="#b83d30" />
		<ellipse cx={0} cy={20} rx={92} ry={108} fill="#e8b48e" />
		{[-60, -22, 18, 56].map((fx, k) => (
			<rect key={k} x={fx - 18} y={-176 + Math.abs(k - 1.5) * 14} width={36} height={130} rx={18} fill="#e8b48e" />
		))}
		<rect x={-130} y={-30} width={44} height={110} rx={22} fill="#e8b48e" transform="rotate(-38 -108 25)" />
		<path d="M -50,40 q 40,26 90,4" stroke="#c98a6a" strokeWidth={6} fill="none" opacity={0.5} />
	</g>
);
// close-ups are drawn zoomed into the flat picture around (cx, cy)
const zoomT = (s: number, cx: number, cy: number) => `translate(540,960) scale(${s}) translate(${-cx},${-cy})`;
// the coat hooks, close (for the see-through hand)
const HookWall: React.FC = () => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#eadfc3" />
		<rect x={-500} y={392} width={2200} height={18} fill="#8f969e" />
		<path d="M 520,402 q 0,52 30,52" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
		<path d="M 580,454 q 18,0 18,-22" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
		<path d="M 760,402 q 0,52 30,52" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
		<Jacket x={330} c={JACKETS[2]} w={150} h={360} />
		<Jacket x={830} c={JACKETS[6]} w={150} h={360} />
	</g>
);

// the school stairs: steps going up to the right, a railing; a window
const SchoolStairs: React.FC = () => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" />
		<rect x={-500} y={1100} width={2200} height={1500} fill="#a8c3a0" />
		<rect x={80} y={-80} width={340} height={420} fill="#f4f1ea" />
		<rect x={98} y={-62} width={304} height={384} fill="#bfe0f5" />
		<rect x={244} y={-62} width={12} height={384} fill="#f4f1ea" />
		{Array.from({length: 9}).map((_, k) => (
			<g key={k}>
				<rect x={560 + k * 110} y={1560 - k * 95} width={1400} height={30} fill="#c9b48a" />
				<rect x={560 + k * 110} y={1590 - k * 95} width={1400} height={65} fill="#b8a37a" />
			</g>
		))}
		<path d="M 600,1250 L 1600,390" stroke="#6a4a3a" strokeWidth={22} strokeLinecap="round" />
		{Array.from({length: 9}).map((_, k) => (
			<line key={k} x1={640 + k * 110} y1={1235 - k * 95} x2={640 + k * 110} y2={1520 - k * 95} stroke="#5a5f66" strokeWidth={8} />
		))}
	</g>
);

// a mug in a hand (hand-local coords)
const Mug: React.FC = () => (
	<g transform="translate(-8,-30)">
		<rect x={-30} y={-46} width={60} height={70} rx={8} fill="#f4f1ea" />
		<path d="M 30,-34 q 26,0 26,20 q 0,20 -26,20" stroke="#f4f1ea" strokeWidth={10} fill="none" />
		<rect x={-30} y={-28} width={60} height={14} fill={RED} />
	</g>
);

// the wall by your door with the doorbell (`press` 0…1), and your see-through finger (separate layer)
const DoorWall: React.FC<{press: number}> = ({press}) => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#d9d6c6" />
		<rect x={-500} y={1240} width={2200} height={1400} fill="#5f8f74" />
		<rect x={-500} y={1232} width={2200} height={12} fill="#4a7560" />
		<rect x={-500} y={-500} width={600} height={3000} fill="#4a2e22" />
		<rect x={-500} y={-500} width={580} height={3000} fill="#7a4a36" />
		{Array.from({length: 2}).flatMap((_, cx) => Array.from({length: 12}).map((__, cy) => <circle key={`${cx}-${cy}`} cx={-60 + cx * 100} cy={-280 + cy * 180} r={9} fill="#5a3426" />))}
		<rect x={130} y={-500} width={40} height={3000} fill="#3a2a20" />
		<rect x={440} y={760} width={200} height={240} rx={18} fill="#efe9d6" stroke="#bcb39a" strokeWidth={6} />
		<circle cx={540} cy={880} r={56} fill="#2a2b30" />
		<circle cx={540} cy={880 + 6 * press} r={40} fill={press > 0.5 ? '#ffb347' : '#e9e6dc'} />
		{press > 0.5 && <circle cx={540} cy={880} r={90} fill="#ffb347" opacity={0.25} />}
	</g>
);
const Finger: React.FC<{press: number; ghost: number}> = ({press, ghost}) => (
	<g opacity={ghost}>
		<g transform={`translate(${560 + 30 * (1 - press)},${960 + 160 * (1 - press)}) rotate(-12)`}>
			<rect x={-46} y={-60} width={92} height={420} rx={46} fill="#e8b48e" />
			<ellipse cx={0} cy={-56} rx={40} ry={30} fill="#f0c6a2" />
			<rect x={-110} y={300} width={220} height={500} rx={70} fill="#cf4a3c" />
		</g>
	</g>
);

// the hall from inside (far layer): the open front door and you outside on the landing — pale, with a glow (fading)
const HallBack: React.FC<{f: number; id: string; open: number; you?: number}> = ({f, id, open, you = GHOST}) => (
	<g>
		<Hall id={id} noBag />
		<FrontDoor id={`${id}d`} open={open} light={1}>
			<g opacity={0.45}>
				<ellipse cx={575} cy={1060} rx={170} ry={420} fill="#9fe8ff" opacity={0.35} />
			</g>
			<g opacity={Math.min(1, you + 0.2)}>
				<Person kind="teen" id={`${id}you`} x={575} y={1450} scale={0.86} breathe={f} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.5, 0], blush: false}} />
			</g>
		</FrontDoor>
	</g>
);
const MOM_X = 800;
const MOM_Y = 1720;
const MomLay: React.FC<{f: number; id: string; look: number; face: Face}> = ({f, id, look, face}) => (
	<Lay z={-430} box={personBox(MOM_X, MOM_Y, 1.0)}>
		<Person kind="mom" id={id} colors={MOM} x={MOM_X} y={MOM_Y} scale={1.0} breathe={f} headTurn={look} face={face} armL={{target: [-150, -560], bend: 1}} />
	</Lay>
);
const HimLay: React.FC<{f: number; id: string; p: number; talk?: boolean}> = ({f, id, p, talk = false}) => {
	const x = lerp(p, 0, 1, 1280, 900, Easing.out(Easing.cubic));
	return (
		<Lay z={-380} box={personBox(x, 1760, 1.02)}>
			<Person kind="teen" id={id} x={x} y={1760} scale={1.02} breathe={f} walk={p < 1 ? f * 0.3 : undefined} headTurn={-0.5} face={{...SMILE, mouth: talk ? 'o' : 'smile', look: [-0.7, 0.05]}} armR={{target: [110, -440], bend: -1}} itemR={<Mug />} />
		</Lay>
	);
};
const HallFar: React.FC<{f: number; id: string; open: number}> = ({f, id, open}) => (
	<Far z={-1400} box={[-420, -60, 1900, 2300]}>
		<HallBack f={f} id={id} open={open} />
	</Far>
);

// a close-up in 3D: a face near the lens, the place far behind it, blurred
const Close3D: React.FC<{f: number; len: number; far: React.ReactNode; bg: string; push?: [number, number]; children: React.ReactNode; box?: Box}> = ({f, len, far, bg, push = [0, 120], children, box = [-60, 140, 1200, 1780]}) => (
	<Set3D cam={{x: lerp(f, 0, len, -30, 30), y: 0, z: lerp(f, 0, len, push[0], push[1])}} bg={bg} far={far} blur={7} vig={0.65}>
		<Lay z={-160} box={box}>
			{children}
		</Lay>
	</Set3D>
);

// the phone in your hand, turned in 3D in front of the blurred cloakroom
const Phone3D: React.FC<{f: number; len: number; children: React.ReactNode}> = ({f, len, children}) => (
	<AbsoluteFill>
		<Scene3D cam={{x: lerp(f, 0, len, -40, 40), y: 300, z: lerp(f, 0, len, 0, 90)}} bg="#eadfc3" far={<Far z={-1200}>{<CloakBack />}</Far>} farBlur={12} />
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(12,16,30,0.55) 0%, rgba(4,6,12,0.85) 75%)'}} />
		<AbsoluteFill style={{perspective: '1300px', perspectiveOrigin: '540px 960px'}}>
			<AbsoluteFill style={{transform: `rotateY(${lerp(f, 0, len, -9, -3)}deg) rotateX(${lerp(f, 0, len, 5, 2)}deg)`, transformOrigin: '540px 1000px'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	</AbsoluteFill>
);

// ============================================================== SHOTS =======
// 1. Recap: you turned the phone off — and overslept (09:20); at school HE sat at your desk. (проспал@47, он@120)
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [66]);
	return (
		<Recap f={t} label="◀◀ ЧАСТЬ 4">
			{i === 0 ? (
				<Freeze frame={112}>
					<G4.S07 />
				</Freeze>
			) : (
				<Freeze frame={64}>
					<G4.S10 />
				</Freeze>
			)}
		</Recap>
	);
};

// 2. Recap: the voice message warned: «Не давай ему до себя дотронуться». (дотронуться@81)
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 4">
			<Freeze frame={222}>
				<G4.S15 />
			</Freeze>
		</Recap>
	);
};

// 3. Recap: and he held out his hand: «Давай поменяемся обратно?» (поменяемся@51)
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 4">
			<Freeze frame={96}>
				<G4.S18 />
			</Freeze>
		</Recap>
	);
};

// 4. Title card: part 5, what the viewers chose. (убежать@29)
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 26, 11);
	const d = pop(f, 42, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 58%, #04060d 100%)'}}>
			<div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 10, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
				<div style={{fontSize: 180, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 5</div>
				<div style={{fontSize: 76, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>ПОБЕГ</div>
				<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, background: 'rgba(14,14,16,0.92)', border: '6px solid #e0342b', borderRadius: 24, padding: '12px 34px 16px', transform: `scale(${c})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
					<div style={{fontSize: 30, color: '#ff9c94', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
						<div style={{width: 66, height: 66, borderRadius: 33, background: '#e0342b', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2</div>
						<div style={{fontSize: 54, color: '#fff'}}>УБЕЖАТЬ</div>
					</div>
				</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 34, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 32px', fontSize: 36, transform: `scale(${d})`}}>ЧАСТИ 1–4 — В ПРОФИЛЕ</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 5. You pull your hand away. His smile slowly fades. (отдёргиваешь@8, улыбка@57, гаснет@89)
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const back = lerp(f, 6, 26, 0, 1, Easing.out(Easing.cubic));
	const fade = interpolate(f, [60, 92], [0, 1], clamp);
	const face: Face = fade < 0.35 ? {...GRIN, look: [-0.8, 0.05]} : fade < 0.75 ? {...SMILE, look: [-0.8, 0.05]} : {...DOUBLE_FACE, look: [-0.8, 0.05]};
	const reach = 1 - 0.6 * fade;
	const mine = lerp(f, 8, 24, 0, 1, Easing.in(Easing.cubic));
	const X = 700;
	const Y = 1900;
	const S = 1.5;
	const tgt: [number, number] = [-110 - 290 * reach, -380 - 220 * reach];
	const cam: Cam3 = {x: lerp(f, 0, 107, -230, -20), y: 40, z: lerp(f, 0, 107, 0, 170) + 40 * (kick(f, 0.04) - 1) * 25};
	return (
		<Set3D cam={cam} bg="#e9e3d2" far={<Far><CorridorLit /></Far>} vig={0.6 + 0.2 * fade}>
			<Lay z={-480} box={[-420, 120, 1700, 1880]}>
				<Person kind="teen" id="g5offer" x={X} y={Y} scale={S} breathe={f} headTurn={-0.45} face={face} armL={{target: tgt, bend: -1}} armR={{target: [110, -380], bend: -1}} />
				{reach > 0.35 && <ProfileHand x={X + tgt[0] * S} y={Y + tgt[1] * S} s={S * 0.9} />}
				{mine < 1 && (
					<g transform={`translate(${X + tgt[0] * S - 105 - 620 * mine},${Y + tgt[1] * S + 20 + 420 * mine})`}>
						<rect x={-980} y={-50} width={900} height={100} rx={44} fill="#cf4a3c" />
						<g transform="scale(-1,1)">
							<ProfileHand x={0} y={0} s={S * 0.9} />
						</g>
					</g>
				)}
			</Lay>
			<Lay z={200} box={[-760, 1240, 1500, 2000]}>
				<Person kind="teen" id="g5you" back x={40 - 160 * back} y={2780 + 260 * back} scale={2.0 + 0.3 * back} />
			</Lay>
		</Set3D>
	);
};

// 6. «Зря», — he says. In your voice. (Зря@4, говорит@12, Твоим@53)
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const talk = f >= 3 && f < 14 && Math.floor(f / 4) % 2 === 0;
	const glitch = f >= 52;
	const jit = glitch ? (rnd(f * 3) - 0.5) * 14 : 0;
	const shot = (
		<Close3D f={f} len={82} bg="#e9e3d2" far={<Far z={-1600}><g transform="translate(-60,-200) scale(1.6)"><CorridorLit /></g></Far>}>
			<Bust kind="teen" id="g5s6d" x={540} y={1060} scale={5.2} face={{...DOUBLE_FACE, mouth: talk ? 'o' : 'flat', look: [0, 0.05]}} />
		</Close3D>
	);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${jit}px)`}}>{shot}</AbsoluteFill>
			{glitch && (
				<>
					<AbsoluteFill style={{opacity: 0.35, mixBlendMode: 'screen', transform: `translateX(${-14 + jit}px)`, filter: 'hue-rotate(160deg)'}}>{shot}</AbsoluteFill>
					<AbsoluteFill style={{background: '#ff0030', mixBlendMode: 'multiply', opacity: 0.18}} />
				</>
			)}
			<Bubble x={700} y={560} text="ЗРЯ." from={4} to={48} tail="left" dark />
		</AbsoluteFill>
	);
};

// 7. You run down the corridor. Behind you — your own footsteps. (бежишь@7, за спиной@53, шаги@87)
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const come = lerp(f, 0, 102, 0, 1, Easing.in(Easing.quad));
	const bob = Math.abs(Math.sin(f * 0.45)) * 18;
	const ys = 0.5 + 1.25 * come;
	const yx = 540 + Math.sin(f * 0.45) * 30;
	const yy = 1400 + 900 * come - bob;
	return (
		<Set3D cam={{x: Math.sin(f * 0.45) * 16, y: bob * 0.6, z: lerp(f, 0, 102, 0, 110)}} bg="#e9e3d2" far={<Far><CorridorLit /></Far>}>
			<Lay z={-1150} box={personBox(540, 1150, 0.26)}>
				<Person kind="teen" id="g5s7d" x={540} y={1150} scale={0.26} walk={f * 0.25} face={{...SMILE, look: [0, 0]}} />
			</Lay>
			<Lay z={-1000} box={[60, 780, 960, 560]}>
				<Person kind="son" id="g5s7k1" colors={KID_COLS[2]} x={300} y={1260} scale={0.33} breathe={f} face={{eyes: 'open', mouth: 'o', brows: 'raised', look: [0.6, 0]}} />
				<Person kind="girl" id="g5s7k2" colors={KID_COLS[1]} x={800} y={1270} scale={0.34} breathe={f + 7} face={{eyes: 'open', mouth: 'o', brows: 'raised', look: [-0.6, 0]}} />
			</Lay>
			<Lay z={-260} box={personBox(yx, yy, ys)}>
				<Person kind="teen" id="g5s7you" x={yx} y={yy} scale={ys} walk={f * 0.9} face={SCARED} />
			</Lay>
		</Set3D>
	);
};

// 8. He doesn't run. He just walks. And somehow doesn't fall behind. (бежит@12, идёт@49, отстаёт@87)
// the camera pulls back through the corridor (you keep running) — and he stays exactly the same size
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: 30, z: lerp(f, 0, 105, 420, -380, Easing.linear)}} bg="#e9e3d2" far={<Far><CorridorLit /></Far>} blur={2.5} />
			<AbsoluteFill>
				<Stage cam={{s: 1, cx: 540, cy: 960}} light={{glow: 0, vignette: 0.45}} bg="transparent">
					<Person kind="teen" id="g5s8d" x={540} y={1560} scale={0.78} walk={f * 0.22} breathe={f} face={{...DOUBLE_FACE, look: [0, 0.05]}} />
				</Stage>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// 9. At the stairs Max grabs you: «Ты чего? Ты же только что был в классе!» (Макс@43, «Ты чего?»@58, «Ты же…»@80)
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const grab = lerp(f, 30, 44, 0, 1, Easing.out(Easing.cubic));
	const talk = ((f >= 56 && f < 70) || (f >= 78 && f < 116)) && Math.floor(f / 4) % 2 === 0;
	const tug = f >= 44 ? Math.sin((f - 44) * 0.8) * 10 * Math.exp(-(f - 44) / 20) : 0;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, 121, -40, 80), y: 150, z: lerp(f, 0, 121, 0, 150)}} bg="#e9e3d2" far={<Far z={-1300}><SchoolStairs /></Far>} vig={0.6}>
				<Lay z={-440} box={[-220, 420, 1580, 1460]}>
					<Person kind="teen" id="g5s9you" x={400 + tug} y={1780} scale={1.1} breathe={f} headTurn={0.5} face={{...SCARED, look: [0.7, 0]}} armR={{target: [190 + 40 * grab, -470], bend: -1}} />
					<Max
						id="g5s9max"
						x={760}
						y={1800}
						s={1.12}
						f={f}
						face={{eyes: 'open', brows: 'raised', mouth: talk ? 'open' : 'o', look: [-0.8, 0]}}
						arms={{armL: {target: [lerp(grab, 0, 1, -60, -250), lerp(grab, 0, 1, -330, -470)], bend: 1}, armR: {target: [80, -360], bend: -1}}}
					/>
				</Lay>
			</Set3D>
			<Bubble x={700} y={640} text="ТЫ ЧЕГО?" from={56} to={78} tail="right" />
			<Bubble x={600} y={640} text="ТЫ ЖЕ ТОЛЬКО ЧТО" from={80} to={101} tail="right" />
			<Bubble x={640} y={640} text="БЫЛ В КЛАССЕ!" from={101} to={121} tail="right" />
		</AbsoluteFill>
	);
};

// 10. You tear free and hide in the cloakroom, between other people's jackets. (прячешься@30, раздевалке@49, курток@89)
// you squeeze in behind the hanging jackets (a whole boy, your size): they swing, only your face peeks out between them,
// your trainers show under the hems
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const step = lerp(f, 22, 46, 0, 1, Easing.out(Easing.cubic));
	const x = lerp(step, 0, 1, 1180, 540);
	const gap = interpolate(f, [40, 52, 74, 90], [0, 0.5, 0.5, 0.32], clamp);
	const sway = f >= 40 ? Math.sin((f - 40) / 3.2) * 7 * Math.exp(-(f - 40) / 26) : 0;
	return (
		<Set3D cam={{x: lerp(f, 0, 105, -50, 50), y: 270, z: lerp(f, 0, 105, 110, 320)}} bg="#eadfc3" far={<Far z={-1200}><CloakBack /></Far>} blur={2.5} vig={0.6}>
			<Lay z={-720} box={personBox(x, 1180, 0.66)}>
				<Person kind="teen" id="g5cloakyou" x={x} y={1180} scale={0.66} breathe={f} walk={step < 1 ? f * 0.5 : undefined} face={{...SCARED, mouth: 'tight', look: [step < 1 ? 0.6 : 0.4, 0]}} />
			</Lay>
			<Lay z={-600} box={[150, 360, 760, 600]}>
				<CloakFront gap={gap} sway={sway} />
			</Lay>
		</Set3D>
	);
};

// 11. The phone vibrates. A new voice message from «Мой номер». (вибрирует@17, голосовое@52, «Мой номер»@77)
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const buzz = f < 34 ? Math.sin(f * 3.1) * 9 * (1 - f / 34) : 0;
	const s = lerp(f, 0, 96, 1.25, 1.4) * kick(f);
	const p = focus(680, 304, 330, 540, 760, s);
	return (
		<Phone3D f={f} len={96}>
			<Phone x={p.x + buzz} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:48">
					<VoiceBubble top={250} f={f} progress={1} sent="09:36" />
					{f >= 38 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: `translateY(${(1 - pop(f, 38, 10)) * 60}px)`, opacity: Math.min(1, pop(f, 38, 10))}}>
							<VoiceBubble top={470} f={f} progress={0} sent="09:48" ring={pop(f, 74, 10)} />
						</div>
					)}
				</ChatScreen>
			</Phone>
		</Phone3D>
	);
};

// 12. «Слушай. Каждый, кто примет его за тебя, делает его сильнее. А тебя — прозрачнее». (сильнее@100, прозрачнее@144)
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 170, 1.4, 1.55);
	const p = focus(680, 304, 560, 540, 760, s);
	return (
		<Phone3D f={f} len={170}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:48">
					<VoiceBubble top={250} f={f} progress={1} sent="09:36" />
					<VoiceBubble top={470} f={f} progress={interpolate(f, [6, 166], [0.03, 0.98], clamp)} lvl={level('g12', f - 6)} sent="09:48" />
				</ChatScreen>
			</Phone>
		</Phone3D>
	);
};

// 13. You raise your hand — and see the coat hook through it. (руку@28, сквозь@57, крючок@75)
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const up = lerp(f, 2, 30, 0, 1, Easing.out(Easing.cubic));
	const ghost = interpolate(f, [36, 62], [1, 0.38], clamp);
	const shimmer = 0.04 * Math.sin(f / 5);
	const Z = zoomT(2.3, 540, 520);
	return (
		<Set3D cam={{x: lerp(f, 0, 108, -40, 40), y: lerp(f, 0, 108, 50, -20), z: lerp(f, 0, 108, 0, 130)}} bg="#eadfc3" far={<Far z={-900} box={[-300, -300, 1680, 2520]}><g transform={Z}><HookWall /></g></Far>} blur={2} vig={0.6}>
			<Lay z={-140} box={[60, 160, 960, 1900]}>
				<g transform={Z}>
					<g opacity={ghost + shimmer}>
						<Palm x={548} y={lerp(up, 0, 1, 980, 520)} s={0.62} rot={-6} />
					</g>
					{ghost < 0.9 && (
						<g opacity={(1 - ghost) * 0.5}>
							<ellipse cx={548} cy={520} rx={110} ry={140} fill="none" stroke="#9fe8ff" strokeWidth={4} />
						</g>
					)}
				</g>
			</Lay>
		</Set3D>
	);
};

// 14. «Если тебя не узнает мама — ты исчезнешь совсем. Беги домой. Сейчас». (мама@42, совсем@79, Сейчас@119)
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 141, 1.45, 1.6) * kick(f, 0.04);
	const p = focus(680, 304, 560, 540, 760, s);
	const now = pop(f, 118, 9);
	return (
		<AbsoluteFill>
			<Phone3D f={f} len={141}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="09:49">
						<VoiceBubble top={250} f={f} progress={1} sent="09:36" />
						<VoiceBubble top={470} f={f} progress={interpolate(f, [6, 136], [0.03, 0.98], clamp)} lvl={level('g14', f - 6)} sent="09:48" redTail={interpolate(f, [100, 130], [0, 1], clamp)} />
					</ChatScreen>
				</Phone>
			</Phone3D>
			{now > 0.01 && (
				<div style={{position: 'absolute', top: 1040, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${now}) rotate(-3deg)`}}>
					<div style={{background: 'rgba(14,14,16,0.94)', border: `6px solid ${RED}`, borderRadius: 22, padding: '12px 34px', fontFamily: HEAVY, fontWeight: 900, fontSize: 56, color: '#fff'}}>
						БЕГИ <span style={{color: RED}}>ДОМОЙ</span>
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 15. You run home. Past the lift: you remember the first voice message. (домой@19, Лифт@37, первое голосовое@87)
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const run = lerp(f, 0, 100, 0, 1, Easing.linear);
	const mem = pop(f, 84, 10);
	const ghostly = interpolate(f, [0, 118], [0.75, 0.62], clamp);
	const x = lerp(run, 0, 1, -160, 1260);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, 118, -260, 300), y: 120, z: lerp(f, 0, 118, 0, 110)}} bg="#e6e9dd" far={<Far z={-1300} box={[-420, -120, 1920, 2400]}><LiftLanding f={f} id="g5s15" floor="1" stencil="1" btn={f > 40 && f < 70} /></Far>} blur={2.5} vig={0.6}>
				<Lay z={-440} box={personBox(x, 1700, 0.95)}>
					<g opacity={ghostly}>
						<Person kind="teen" id="g5s15you" x={x} y={1700} scale={0.95} walk={f * 0.85} face={{...SCARED, look: [0.6, 0]}} />
					</g>
				</Lay>
			</Set3D>
			{mem > 0.01 && (
				<div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${mem}) rotate(-4deg)`}}>
					<div style={{background: 'rgba(14,14,16,0.92)', border: `6px solid ${YELLOW}`, borderRadius: 22, padding: '10px 30px 14px', fontFamily: HEAVY, fontWeight: 900, textAlign: 'center'}}>
						<div style={{fontSize: 28, letterSpacing: 4, color: YELLOW}}>ПЕРВОЕ ГОЛОСОВОЕ</div>
						<div style={{fontSize: 56, color: '#fff'}}>«НЕ САДИСЬ В ЛИФТ»</div>
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 16. The seventh floor. You press the doorbell. Your finger — almost see-through. (этаж@20, звонок@51, прозрачный@100)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [34]);
	if (i === 0) {
		return <Set3D cam={{x: lerp(t, 0, 34, -380, -320), y: -40, z: lerp(t, 0, 34, 0, 260)}} bg="#e6e9dd" far={<Far z={-1300} box={[-420, -120, 1920, 2400]}><LiftLanding f={t} id="g5s16" floor="7" stencil="7" /></Far>} blur={1.5} vig={0.6} />;
	}
	const press = interpolate(t, [6, 14, 30, 38], [0, 1, 1, 0.2], clamp);
	const ghost = interpolate(t, [20, 70], [0.7, 0.4], clamp);
	const Z = zoomT(1.3, 540, 900);
	return (
		<Set3D cam={{x: lerp(t, 0, 89, -40, 40), y: 0, z: lerp(t, 0, 89, 0, 140)}} bg="#d9d6c6" far={<Far z={-800} box={[-300, -300, 1680, 2520]}><g transform={Z}><DoorWall press={press} /></g></Far>} blur={1.2} vig={0.65}>
			<Lay z={-150} box={[300, 760, 700, 1200]}>
				<g transform={Z}>
					<Finger press={press} ghost={ghost} />
				</g>
			</Lay>
		</Set3D>
	);
};

// 17. Mom opens the door. And looks at you as if at a stranger. (открывает@12, смотрит@44, чужого@81)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 0, 10, 0, 1, Easing.out(Easing.cubic));
	const frown = f > 50;
	return (
		<Set3D cam={{x: lerp(f, 0, 98, 60, 200), y: 140, z: lerp(f, 0, 98, 0, 160)}} bg="#cdb88f" far={<HallFar f={f} id="g5s17" open={open} />} blur={2.5} vig={0.6}>
			<MomLay f={f} id="g5s17mom" look={-0.5} face={{eyes: 'open', brows: frown ? 'worried' : 'raised', mouth: frown ? 'flat' : 'o', look: [-0.8, 0.1], blush: false}} />
		</Set3D>
	);
};

// 18. And out of the kitchen comes HIM. Already home. With your mug: «Мам, кто там?» (он@36, дома@55, кружкой@83, «Мам@101)
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const him = lerp(f, 4, 48, 0, 1);
	const talk = f >= 100 && f < 126 && Math.floor(f / 4) % 2 === 0;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, 131, 240, 340), y: 140, z: lerp(f, 0, 131, 0, 110)}} bg="#cdb88f" far={<HallFar f={f} id="g5s18" open={1} />} blur={2.5} vig={0.6}>
				<MomLay f={f} id="g5s18mom" look={f > 30 ? 0.45 : -0.5} face={{eyes: 'open', brows: 'raised', mouth: 'flat', look: [f > 30 ? 0.8 : -0.8, 0.1], blush: false}} />
				<HimLay f={f} id="g5s18him" p={him} talk={talk} />
			</Set3D>
			<Bubble x={720} y={760} text="МАМ, КТО ТАМ?" from={100} to={131} tail="right" />
		</AbsoluteFill>
	);
};

// 19. Mom looks at him. Then at you. Two sons. One face. (него@29, тебя@59, сына@84, лицо@115)
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [72]);
	if (i === 0) {
		const look = f < 40 ? 0.45 : -0.5;
		return (
			<Set3D cam={{x: lerp(f, 0, 72, 300, 120), y: 140, z: lerp(f, 0, 72, 60, 160)}} bg="#cdb88f" far={<HallFar f={f} id="g5s19" open={1} />} blur={2.5} vig={0.6}>
				<MomLay f={f} id="g5s19mom" look={look} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [f < 40 ? 0.8 : -0.8, 0.1], blush: false}} />
				<HimLay f={f} id="g5s19him" p={1} />
			</Set3D>
		);
	}
	// two faces side by side: yours (fading) and his — each a 3D close-up in the hall
	const one = pop(t, 30, 10);
	const hall = (id: string) => (
		<Far z={-1600}>
			<g transform="translate(-200,-300) scale(1.5)">
				<HallBack f={t} id={id} open={1} />
			</g>
		</Far>
	);
	return (
		<AbsoluteFill style={{background: '#cdb88f'}}>
			<AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
				<Close3D f={t} len={59} bg="#cdb88f" far={hall('g5s19hl')}>
					<g opacity={GHOST}>
						<Bust kind="teen" id="g5s19you" x={520} y={1000} scale={5.2} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.3, 0.05], blush: false}} />
					</g>
				</Close3D>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}>
				<Close3D f={t} len={59} bg="#cdb88f" far={hall('g5s19hr')}>
					<Bust kind="teen" id="g5s19him" x={560} y={1000} scale={5.2} face={{...SMILE, look: [-0.3, 0.05]}} />
				</Close3D>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 536, top: 0, width: 8, height: 1920, background: '#111'}} />
			{one > 0.01 && (
				<div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,0.5)', transform: `scale(${one})`}}>
					ОДНО <span style={{color: RED}}>ЛИЦО</span>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 20. «Кто из вас… мой?» (mom, close) (вас@21, мой@37)
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const talk = f >= 3 && f < 46 && Math.floor(f / 4) % 2 === 0;
	return (
		<Close3D
			f={f}
			len={52}
			bg="#cdb88f"
			push={[20, 150]}
			far={
				<Far z={-1600}>
					<g transform="translate(-200,-300) scale(1.5)">
						<HallBack f={f} id="g5s20h" open={1} />
					</g>
				</Far>
			}
		>
			<Bust kind="mom" id="g5s20b" colors={MOM} x={540} y={1000} scale={5.6} tilt={-4} face={{eyes: 'open', brows: 'worried', mouth: talk ? 'o' : 'flat', look: [0, 0.1], blush: false, tears: interpolate(f, [10, 50], [0, 0.7], clamp)}} />
		</Close3D>
	);
};

// 21. Finale: tell mom a secret only you two know — or play her the voice messages? Countdown, end card, the channel.
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="ЧАСТЬ 6"
			boxes={6}
			opt1={{text: 'СКАЗАТЬ СЕКРЕТ', sub: 'который знаете только вы'}}
			opt2={{text: 'ВКЛЮЧИТЬ ГОЛОСОВЫЕ', sub: 'пусть мама послушает'}}
			tally={{done: '5 ИЗ 6', rest: 'ШЕСТОЕ'}}
			promo="700 ПОДПИСЧИКОВ — ОТКРЫВАЮ ТГК"
			promoAt={285}
			bg={
				<AbsoluteFill>
					<Set3D cam={{x: lerp(f, 0, 422, 140, 260), y: 140, z: lerp(f, 0, 422, 40, 120)}} bg="#cdb88f" far={<HallFar f={f} id="g5s21" open={1} />} blur={2.5} vig={0.6}>
						<MomLay f={f} id="g5s21mom" look={0} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0, 0.1], blush: false}} />
						<HimLay f={f} id="g5s21him" p={1} />
					</Set3D>
					<AbsoluteFill style={{background: '#000', opacity: 0.6}} />
				</AbsoluteFill>
			}
		/>
	);
};
