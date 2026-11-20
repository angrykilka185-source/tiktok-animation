// «Голосовые из завтра» — часть 5 «Побег» (the viewers chose to run). 21 shots on the timeline of src/g5/timeline.ts
// (= the voice, see scripts/fit-voiceover.py --part g5).
// You pull your hand away — «Зря», in your own voice. You run; he only walks, and never falls behind. Max grabs you at
// the stairs: «Ты же только что был в классе!» You hide in the cloakroom — a new voice message: everyone who takes him
// for you makes him stronger and you more transparent; your hand is see-through. «If mom doesn't know you — you vanish.
// Run home.» Past the lift (the first voice message), the 7th floor, the doorbell under a see-through finger. Mom opens
// the door and looks at you like at a stranger — and HE comes out of the kitchen with your mug: «Мам, кто там?» Two sons,
// one face. «Кто из вас… мой?» Finale: tell mom a secret only you two know, or play her the voice messages.
// Phone UI from part 1, recap / mom / finale from part 2, Max from 2b, the landing / front door / warm close-ups from 3,
// the corridor / the double's grin from 4.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Bubble, HEAVY} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Stage} from '../components/Stage';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import * as G2B from '../g2b/scenes';
import * as G3 from '../g3/scenes';
import * as G4 from '../g4/scenes';
import envJson from './env.json';

const {YELLOW, RED, PHONE_BG, Phone, ChatScreen, VoiceBubble, LiftLanding, rnd, focus} = G1;
const {Recap, MOM, Finale, Hall} = G2;
const {Max} = G2B;
const {FrontDoor, WarmClose, DOUBLE_FACE} = G3;
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

// ======================================================= scene pieces =====
// the double in the corridor with his hand held out (you: the back of your head, bottom left).
// `back` 0…1 = you step back from his hand, `face` = his face
const OfferBack: React.FC<{f: number; back: number; face: Face; reach?: number; mine?: number}> = ({f, back, face, reach = 1, mine = -1}) => {
	const X = 700;
	const Y = 1900;
	const S = 1.5;
	const tgt: [number, number] = [-110 - 290 * reach, -380 - 220 * reach];
	return (
		<g>
			<Corridor />
			<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" opacity={0.35} />
			<Person kind="teen" id="g5offer" x={X} y={Y} scale={S} breathe={f} headTurn={-0.45} face={face} armL={{target: tgt, bend: -1}} armR={{target: [110, -380], bend: -1}} />
			{reach > 0.35 && <ProfileHand x={X + tgt[0] * S} y={Y + tgt[1] * S} s={S * 0.9} />}
			{mine >= 0 && mine < 1 && (
				<g transform={`translate(${X + tgt[0] * S - 105 - 620 * mine},${Y + tgt[1] * S + 20 + 420 * mine})`}>
					<rect x={-980} y={-50} width={900} height={100} rx={44} fill="#cf4a3c" />
					<g transform="scale(-1,1)">
						<ProfileHand x={0} y={0} s={S * 0.9} />
					</g>
				</g>
			)}
			<Person kind="teen" id="g5you" back x={40 - 160 * back} y={2780 + 260 * back} scale={2.0 + 0.3 * back} />
		</g>
	);
};

// the school cloakroom: a long rail of hooks with jackets, a bench with bags, a window
const JACKETS = ['#3b5f8a', '#7a3b3b', '#2f6e47', '#8a7a3b', '#4a4a58', '#a85a2a', '#3b3b6e', '#6e3b5f', '#2a6e6e'];
const Jacket: React.FC<{x: number; c: string; w?: number; h?: number}> = ({x, c, w = 190, h = 470}) => (
	<g transform={`translate(${x},430)`}>
		<path d={`M ${-w * 0.32},0 Q 0,-34 ${w * 0.32},0 L ${w / 2},${h * 0.18} L ${w / 2 + 14},${h} L ${-w / 2 - 14},${h} L ${-w / 2},${h * 0.18} Z`} fill={c} />
		<path d={`M ${-w * 0.32},0 Q 0,-34 ${w * 0.32},0 L ${w * 0.22},${h * 0.16} Q 0,${h * 0.05} ${-w * 0.22},${h * 0.16} Z`} fill="#000" opacity={0.18} />
		<line x1={0} y1={h * 0.12} x2={0} y2={h} stroke="#000" strokeWidth={5} opacity={0.2} />
		<rect x={-w / 2 - 14} y={h - 26} width={w + 28} height={26} fill="#000" opacity={0.12} />
	</g>
);
const Cloakroom: React.FC<{f: number; you?: number; youFace?: Face; gap?: number}> = ({f, you = 0, youFace = SCARED, gap = 0}) => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#eadfc3" />
		<rect x={-500} y={1180} width={2200} height={1400} fill="#a98a62" />
		<rect x={-500} y={1170} width={2200} height={12} fill="#8f7350" />
		{/* the window, high up */}
		<rect x={760} y={-120} width={300} height={260} fill="#f4f1ea" />
		<rect x={776} y={-104} width={268} height={228} fill="#bfe0f5" />
		<ellipse cx={910} cy={420} rx={360} ry={240} fill="#fff7d6" opacity={0.25} />
		{/* the rail and the hooks */}
		<rect x={-500} y={392} width={2200} height={18} fill="#8f969e" />
		{Array.from({length: 12}).map((_, k) => (
			<path key={k} d={`M ${-430 + k * 200},402 q 0,40 22,40`} stroke="#6d747c" strokeWidth={8} fill="none" />
		))}
		{/* jackets; the gap in the middle opens for you */}
		{JACKETS.map((c, k) => {
			const x = -380 + k * 200;
			const off = k === 4 ? -gap * 70 : k === 5 ? gap * 70 : 0;
			return k === 4 || k === 5 ? null : <Jacket key={k} x={x + off} c={c} />;
		})}
		{you > 0 && (
			<g opacity={you}>
				<Bust kind="teen" id="g5cloakyou" x={540} y={700} scale={1.25} face={youFace} />
			</g>
		)}
		<Jacket x={420 - gap * 70} c={JACKETS[4]} />
		<Jacket x={660 + gap * 70} c={JACKETS[5]} />
		{/* the bench and the bags */}
		<rect x={-500} y={1000} width={2200} height={34} rx={8} fill="#b8864e" />
		{[-300, 120, 860].map((x, k) => (
			<rect key={k} x={x} y={890} width={150} height={110} rx={20} fill={['#2d6cdf', '#e0a526', '#8a5ab8'][k]} />
		))}
		<rect x={-500} y={1034} width={2200} height={10} fill="#8f6a3e" />
		<g opacity={0.35 + 0.1 * Math.sin(f / 20)}>
			<rect x={-500} y={-500} width={2200} height={3000} fill="#3a2a10" opacity={0.08} />
		</g>
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

// the doorbell next to your door, close up; `press` 0…1; your see-through finger
const Doorbell: React.FC<{press: number; ghost: number}> = ({press, ghost}) => (
	<g>
		<rect x={-500} y={-500} width={2200} height={3000} fill="#d9d6c6" />
		<rect x={-500} y={1240} width={2200} height={1400} fill="#5f8f74" />
		<rect x={-500} y={1232} width={2200} height={12} fill="#4a7560" />
		{/* the edge of your door: quilted leatherette */}
		<rect x={-500} y={-500} width={600} height={3000} fill="#4a2e22" />
		<rect x={-500} y={-500} width={580} height={3000} fill="#7a4a36" />
		{Array.from({length: 2}).flatMap((_, cx) => Array.from({length: 12}).map((__, cy) => <circle key={`${cx}-${cy}`} cx={-60 + cx * 100} cy={-280 + cy * 180} r={9} fill="#5a3426" />))}
		<rect x={130} y={-500} width={40} height={3000} fill="#3a2a20" />
		{/* the bell */}
		<rect x={440} y={760} width={200} height={240} rx={18} fill="#efe9d6" stroke="#bcb39a" strokeWidth={6} />
		<circle cx={540} cy={880} r={56} fill="#2a2b30" />
		<circle cx={540} cy={880 + 6 * press} r={40} fill={press > 0.5 ? '#ffb347' : '#e9e6dc'} />
		{press > 0.5 && <circle cx={540} cy={880} r={90} fill="#ffb347" opacity={0.25} />}
		<g opacity={ghost}>
			<g transform={`translate(${560 + 30 * (1 - press)},${960 + 160 * (1 - press)}) rotate(-12)`}>
				<rect x={-46} y={-60} width={92} height={420} rx={46} fill="#e8b48e" />
				<ellipse cx={0} cy={-56} rx={40} ry={30} fill="#f0c6a2" />
				<rect x={-110} y={300} width={220} height={500} rx={70} fill="#cf4a3c" />
			</g>
		</g>
	</g>
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
	return (
		<Stage cam={{s: lerp(f, 0, 107, 1.04, 1.14) * kick(f, 0.04), cx: lerp(f, 0, 30, 380, 560), cy: 1000}} light={{glow: 0.2, vignette: 0.6 + 0.2 * fade}} bg="#e9e3d2">
			<OfferBack f={f} back={back} face={face} reach={1 - 0.6 * fade} mine={lerp(f, 8, 24, 0, 1, Easing.in(Easing.cubic))} />
		</Stage>
	);
};

// 6. «Зря», — he says. In your voice. (Зря@4, говорит@12, Твоим@53)
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const talk = f >= 3 && f < 14 && Math.floor(f / 4) % 2 === 0;
	const glitch = f >= 52;
	const jit = glitch ? (rnd(f * 3) - 0.5) * 14 : 0;
	const head = (
		<Stage cam={{s: lerp(f, 0, 82, 1.0, 1.08), cx: 540, cy: 960}} light={{glow: 0.1, vignette: 0.75}} bg="#e9e3d2">
			<g transform="translate(-60,-200) scale(1.6)">
				<Corridor />
			</g>
			<rect x={-500} y={-500} width={2200} height={3000} fill="#e9e3d2" opacity={0.55} />
			<Bust kind="teen" id="g5s6d" x={540} y={1060} scale={5.2} face={{...DOUBLE_FACE, mouth: talk ? 'o' : 'flat', look: [0, 0.05]}} />
		</Stage>
	);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `translateX(${jit}px)`}}>{head}</AbsoluteFill>
			{glitch && (
				<>
					<AbsoluteFill style={{opacity: 0.35, mixBlendMode: 'screen', transform: `translateX(${-14 + jit}px)`, filter: 'hue-rotate(160deg)'}}>{head}</AbsoluteFill>
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
	return (
		<Stage cam={{s: 1.0 + 0.03 * Math.sin(f * 0.9), cx: 540 + Math.sin(f * 0.45) * 10, cy: 1000 + bob * 0.4}} light={{glow: 0.2, vignette: 0.6}} bg="#e9e3d2">
			<Corridor />
			<Person kind="son" id="g5s7k1" colors={KID_COLS[2]} x={300} y={1260} scale={0.33} breathe={f} face={{eyes: 'open', mouth: 'o', brows: 'raised', look: [0.6, 0]}} />
			<Person kind="girl" id="g5s7k2" colors={KID_COLS[1]} x={800} y={1270} scale={0.34} breathe={f + 7} face={{eyes: 'open', mouth: 'o', brows: 'raised', look: [-0.6, 0]}} />
			<Person kind="teen" id="g5s7d" x={540} y={1150} scale={0.26} walk={f * 0.25} face={{...SMILE, look: [0, 0]}} />
			<Person kind="teen" id="g5s7you" x={540 + Math.sin(f * 0.45) * 30} y={1400 + 900 * come - bob} scale={0.5 + 1.25 * come} walk={f * 0.9} face={SCARED} />
		</Stage>
	);
};

// 8. He doesn't run. He just walks. And somehow doesn't fall behind. (бежит@12, идёт@49, отстаёт@87)
// the corridor runs away from the camera (you keep running) — and he stays exactly the same size
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const zoom = lerp(f, 0, 105, 1.5, 0.92, Easing.linear);
	return (
		<AbsoluteFill>
			<Stage cam={{s: zoom, cx: 540, cy: 1000}} light={{glow: 0.2, vignette: 0.55}} bg="#e9e3d2">
				<Corridor />
			</Stage>
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
		<Stage cam={{s: lerp(f, 0, 121, 1.0, 1.08) * kick(f), cx: 560, cy: 1080}} light={{glow: 0.25, vignette: 0.6}} bg="#e9e3d2">
			<SchoolStairs />
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
		</Stage>
			<Bubble x={700} y={640} text="ТЫ ЧЕГО?" from={56} to={78} tail="right" />
			<Bubble x={600} y={640} text="ТЫ ЖЕ ТОЛЬКО ЧТО" from={80} to={101} tail="right" />
			<Bubble x={640} y={640} text="БЫЛ В КЛАССЕ!" from={101} to={121} tail="right" />
		</AbsoluteFill>
	);
};

// 10. You tear free and hide in the cloakroom, between other people's jackets. (раздевалке@49, курток@89)
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const gap = interpolate(f, [30, 46, 70, 84], [0, 1, 1, 0.35], clamp);
	const you = interpolate(f, [36, 46], [0, 1], clamp);
	return (
		<Stage cam={{s: lerp(f, 0, 105, 1.0, 1.12) * kick(f), cx: 540, cy: 760}} light={{glow: 0.3, vignette: 0.6}} bg="#eadfc3">
			<Cloakroom f={f} you={you} gap={gap} youFace={{...SCARED, mouth: 'tight', look: [0.6, 0]}} />
		</Stage>
	);
};

// 11. The phone vibrates. A new voice message from «Мой номер». (вибрирует@17, голосовое@52, «Мой номер»@77)
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const buzz = f < 34 ? Math.sin(f * 3.1) * 9 * (1 - f / 34) : 0;
	const s = lerp(f, 0, 96, 1.25, 1.4) * kick(f);
	const p = focus(680, 304, 330, 540, 760, s);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
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
		</AbsoluteFill>
	);
};

// 12. «Слушай. Каждый, кто примет его за тебя, делает его сильнее. А тебя — прозрачнее». (сильнее@100, прозрачнее@144)
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 170, 1.4, 1.55);
	const p = focus(680, 304, 560, 540, 760, s);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:48">
					<VoiceBubble top={250} f={f} progress={1} sent="09:36" />
					<VoiceBubble top={470} f={f} progress={interpolate(f, [6, 166], [0.03, 0.98], clamp)} lvl={level('g12', f - 6)} sent="09:48" />
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 13. You raise your hand — and see the coat hook through it. (руку@28, сквозь@57, крючок@75)
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const up = lerp(f, 2, 30, 0, 1, Easing.out(Easing.cubic));
	const ghost = interpolate(f, [36, 62], [1, 0.38], clamp);
	const shimmer = 0.04 * Math.sin(f / 5);
	return (
		<Stage cam={{s: lerp(f, 0, 108, 2.2, 2.45), cx: 540, cy: 520}} light={{glow: 0.3, vignette: 0.65}} bg="#eadfc3">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#eadfc3" />
			<rect x={-500} y={392} width={2200} height={18} fill="#8f969e" />
			<path d="M 520,402 q 0,52 30,52" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
			<path d="M 580,454 q 18,0 18,-22" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
			<path d="M 760,402 q 0,52 30,52" stroke="#6d747c" strokeWidth={10} fill="none" strokeLinecap="round" />
			<Jacket x={330} c={JACKETS[2]} w={150} h={360} />
			<Jacket x={830} c={JACKETS[6]} w={150} h={360} />
			<g opacity={ghost + shimmer}>
				<Palm x={548} y={lerp(up, 0, 1, 980, 520)} s={0.62} rot={-6} />
			</g>
			{ghost < 0.9 && (
				<g opacity={(1 - ghost) * 0.5}>
					<ellipse cx={548} cy={520} rx={110} ry={140} fill="none" stroke="#9fe8ff" strokeWidth={4} />
				</g>
			)}
		</Stage>
	);
};

// 14. «Если тебя не узнает мама — ты исчезнешь совсем. Беги домой. Сейчас». (мама@42, совсем@79, Сейчас@119)
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const s = lerp(f, 0, 141, 1.45, 1.6) * kick(f, 0.04);
	const p = focus(680, 304, 560, 540, 760, s);
	const now = pop(f, 118, 9);
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={p.x} y={p.y} w={680} scale={s}>
				<ChatScreen time="09:49">
					<VoiceBubble top={250} f={f} progress={1} sent="09:36" />
					<VoiceBubble top={470} f={f} progress={interpolate(f, [6, 136], [0.03, 0.98], clamp)} lvl={level('g14', f - 6)} sent="09:48" redTail={interpolate(f, [100, 130], [0, 1], clamp)} />
				</ChatScreen>
			</Phone>
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
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 118, 1.0, 1.08) * kick(f), cx: 600, cy: 1080}} light={{glow: 0.25, vignette: 0.6}} bg="#e6e9dd">
				<LiftLanding f={f} id="g5s15" floor="1" stencil="1" btn={f > 40 && f < 70} />
				<g opacity={ghostly}>
					<Person kind="teen" id="g5s15you" x={lerp(run, 0, 1, -160, 1260)} y={1700} scale={0.95} walk={f * 0.85} face={{...SCARED, look: [0.6, 0]}} />
				</g>
			</Stage>
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
		return (
			<Stage cam={{s: lerp(t, 0, 34, 1.0, 1.06) * kick(t), cx: 360, cy: 900}} light={{glow: 0.25, vignette: 0.6}} bg="#e6e9dd">
				<LiftLanding f={t} id="g5s16" floor="7" stencil="7" />
			</Stage>
		);
	}
	const press = interpolate(t, [6, 14, 30, 38], [0, 1, 1, 0.2], clamp);
	const ghost = interpolate(t, [20, 70], [0.7, 0.4], clamp);
	return (
		<Stage cam={{s: lerp(t, 0, 89, 1.25, 1.4), cx: 540, cy: 900}} light={{glow: 0.25, vignette: 0.65}} bg="#d9d6c6">
			<Doorbell press={press} ghost={ghost} />
		</Stage>
	);
};

// the hall from inside: mom at the open front door, you outside on the landing (see-through), HIM coming from the kitchen
const HallScene: React.FC<{f: number; id: string; open: number; momLook: number; momFace: Face; him?: number; himTalk?: boolean; you?: number}> = ({f, id, open, momLook, momFace, him = -1, himTalk = false, you = GHOST}) => {
	const hx = him < 0 ? 0 : lerp(him, 0, 1, 1280, 900, Easing.out(Easing.cubic));
	return (
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
			<Person kind="mom" id={`${id}mom`} colors={MOM} x={800} y={1720} scale={1.0} breathe={f} headTurn={momLook} face={momFace} armL={{target: [-150, -560], bend: 1}} />
			{him >= 0 && (
				<Person
					kind="teen"
					id={`${id}him`}
					x={hx}
					y={1760}
					scale={1.02}
					breathe={f}
					walk={him < 1 ? f * 0.3 : undefined}
					headTurn={-0.5}
					face={{...SMILE, mouth: himTalk ? 'o' : 'smile', look: [-0.7, 0.05]}}
					armR={{target: [110, -440], bend: -1}}
					itemR={<Mug />}
				/>
			)}
		</g>
	);
};

// 17. Mom opens the door. And looks at you as if at a stranger. (открывает@12, смотрит@44, чужого@81)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const open = lerp(f, 0, 10, 0, 1, Easing.out(Easing.cubic));
	const frown = f > 50;
	return (
		<Stage cam={{s: lerp(f, 0, 98, 1.0, 1.1) * kick(f), cx: 640, cy: 1060}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
			<HallScene f={f} id="g5s17" open={open} momLook={-0.5} momFace={{eyes: 'open', brows: frown ? 'worried' : 'raised', mouth: frown ? 'flat' : 'o', look: [-0.8, 0.1], blush: false}} />
		</Stage>
	);
};

// 18. And out of the kitchen comes HIM. Already home. With your mug: «Мам, кто там?» (он@36, дома@55, кружкой@83, «Мам@101)
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const him = lerp(f, 4, 48, 0, 1);
	const talk = f >= 100 && f < 126 && Math.floor(f / 4) % 2 === 0;
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 131, 1.0, 1.06), cx: 760, cy: 1060}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
				<HallScene f={f} id="g5s18" open={1} momLook={f > 30 ? 0.45 : -0.5} momFace={{eyes: 'open', brows: 'raised', mouth: 'flat', look: [f > 30 ? 0.8 : -0.8, 0.1], blush: false}} him={him} himTalk={talk} />
			</Stage>
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
			<Stage cam={{s: lerp(f, 0, 72, 1.0, 1.05), cx: 700, cy: 1060}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
				<HallScene f={f} id="g5s19" open={1} momLook={look} momFace={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [f < 40 ? 0.8 : -0.8, 0.1], blush: false}} him={1} />
			</Stage>
		);
	}
	// two faces side by side: yours (fading) and his
	const one = pop(t, 30, 10);
	return (
		<AbsoluteFill style={{background: '#cdb88f'}}>
			<AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
				<WarmClose id="g5s19l" t={t} len={59} zoom={[1, 1.06]}>
					<g opacity={GHOST}>
						<Bust kind="teen" id="g5s19you" x={520} y={1000} scale={5.2} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.3, 0.05], blush: false}} />
					</g>
				</WarmClose>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}>
				<WarmClose id="g5s19r" t={t} len={59} zoom={[1, 1.06]}>
					<Bust kind="teen" id="g5s19him" x={560} y={1000} scale={5.2} face={{...SMILE, look: [-0.3, 0.05]}} />
				</WarmClose>
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
		<WarmClose id="g5s20" t={f} len={52} zoom={[1.02, 1.12]}>
			<Bust kind="mom" id="g5s20b" colors={MOM} x={540} y={1000} scale={5.6} tilt={-4} face={{eyes: 'open', brows: 'worried', mouth: talk ? 'o' : 'flat', look: [0, 0.1], blush: false, tears: interpolate(f, [10, 50], [0, 0.7], clamp)}} />
		</WarmClose>
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
					<Stage cam={{s: lerp(f, 0, 422, 1.0, 1.06), cx: 700, cy: 1060}} light={{glow: 0.3, vignette: 0.6}} bg="#cdb88f">
						<HallScene f={f} id="g5s21" open={1} momLook={0} momFace={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [0, 0.1], blush: false}} him={1} />
					</Stage>
					<AbsoluteFill style={{background: '#000', opacity: 0.6}} />
				</AbsoluteFill>
			}
		/>
	);
};
