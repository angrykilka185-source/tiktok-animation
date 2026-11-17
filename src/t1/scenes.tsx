// «Открывать ТГК?» — the heroes of the channel's series ask the viewers whether to open a Telegram channel.
// 7 shots on the timeline of src/t1/timeline.ts.
import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop} from '../anim';
import {Bubble, HEAVY} from '../components/Overlays';
import {ArmPose, Bust, Face, Kind, Person} from '../components/Person';
import {Baseboard, GlobalDefs, PlankFloor, Wallpaper} from '../components/Set';
import {Stage, toScreen} from '../components/Stage';
import {NightDoor} from '../covers/PapaFilm';
import {Phone} from '../g1/scenes';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const CH_BLUE = '#3a9be6'; // the channel UI accent

const rnd = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

// "dad" lit red, like on the film cover
const RedLit: React.FC<{id: string}> = ({id}) => (
	<filter id={id} colorInterpolationFilters="sRGB">
		<feColorMatrix type="matrix" values="0.92 0 0 0 0  0 0.68 0 0 0  0 0 0.7 0 0  0 0 0 1 0" />
	</filter>
);

const CREEPY: Face = {eyes: 'stare', mouth: 'grin', look: [0, 0.15], pupil: 0.4, brows: 'flat', stubble: true, blush: false};

// ------------------------------------------------------------------ pieces ---
// the night hallway with "dad" standing in the open front door (the film cover, vertical)
const DoorScene: React.FC<{id: string; zoom?: number; arm?: ArmPose; item?: React.ReactNode; son?: boolean; glow?: number}> = ({id, zoom = 1, arm, item, son = true, glow = 0}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
		<GlobalDefs />
		<defs>
			<RedLit id={`${id}-red`} />
			<radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#8fd8ff" stopOpacity={0.55} />
				<stop offset="1" stopColor="#8fd8ff" stopOpacity={0} />
			</radialGradient>
			<radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
				<stop offset="0.55" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={0.75} />
			</radialGradient>
		</defs>
		<g transform={`translate(540,760) scale(${zoom}) translate(-540,-760)`}>
			<NightDoor id={`${id}-door`} door={{cx: 540, top: 250, k: 2.0}} w={1080} h={1920} />
			<g filter={`url(#${id}-red)`}>
				<Person kind="dad" id={`${id}-dad`} x={540} y={540 + 1024 * 1.42} scale={1.42} headTilt={-6} face={CREEPY} armR={arm} itemR={item} />
			</g>
			{/* phone light on his face */}
			{glow > 0 && <ellipse cx={600} cy={640} rx={260} ry={300} fill={`url(#${id}-glow)`} opacity={glow} style={{mixBlendMode: 'screen'}} />}
		</g>
		{son && (
			<Bust kind="son" id={`${id}-son`} x={250} y={1660} scale={2.0} face={{eyes: 'wide', pupil: 0.35, look: [0.7, -0.6], brows: 'worried', mouth: 'o', sweat: 1, blush: false}} />
		)}
		<rect x={0} y={0} width={1080} height={1920} fill={`url(#${id}-vig)`} />
	</svg>
);

// the cosy room where the heroes gather
const Room: React.FC<{id: string}> = ({id}) => (
	<>
		<Wallpaper id={`${id}-wp`} x={-400} y={-400} w={1900} h={1900} base="#e9cfa0" line="#d5b47e" />
		<PlankFloor y={1500} />
		<Baseboard y={1500} />
		<ellipse cx={540} cy={1730} rx={520} ry={90} fill="#000" opacity={0.18} />
	</>
);

type Hero = {kind: Kind; id: string; x: number; tag: string; sub?: string; color: string; at: number; tagY: number};
const HEROES: Hero[] = [
	{kind: 'son', id: 'hs', x: 385, tag: 'ВАХТА', color: '#f0a032', at: 8, tagY: 480},
	{kind: 'teen', id: 'ht', x: 695, tag: 'ГОЛОСОВЫЕ', sub: 'ИЗ ЗАВТРА', color: '#cf4a3c', at: 34, tagY: 380},
];
const FEET = 1720;
const HS = 0.92;

const Heroes: React.FC<{f: number; faces: Record<Kind, Face>; appear?: boolean}> = ({f, faces, appear = true}) => (
	<>
		{HEROES.map((h, i) => {
			const p = appear ? pop(f, h.at, 12) : 1;
			if (p <= 0.001) return null;
			return (
				<g key={h.id} transform={`translate(0,${(1 - p) * 500})`} opacity={Math.min(1, p * 1.5)}>
					<Person kind={h.kind} id={`${h.id}-${i}`} x={h.x} y={FEET} scale={HS} face={faces[h.kind]} breathe={f + i * 17} />
				</g>
			);
		})}
	</>
);

const Tag: React.FC<{x: number; y: number; text: string; sub?: string; color: string; p: number}> = ({x, y, text, sub, color, p}) =>
	p <= 0.001 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`}}>
			<div
				style={{
					background: '#111',
					border: `5px solid ${color}`,
					borderRadius: 16,
					padding: '8px 20px',
					textAlign: 'center',
					fontFamily: HEAVY,
					fontWeight: 900,
					color: '#fff',
					whiteSpace: 'nowrap',
					boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
					lineHeight: 1.05,
				}}
			>
				<div style={{fontSize: 36, letterSpacing: 1}}>{text}</div>
				{sub && <div style={{fontSize: 26, color}}>{sub}</div>}
			</div>
		</div>
	);

const HAPPY: Record<Kind, Face> = {
	girl: {eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0, 0]},
	son: {eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0, 0]},
	teen: {eyes: 'open', mouth: 'smile', brows: 'neutral', look: [0, 0]},
	dad: {},
	mom: {},
};
const HOPE: Record<Kind, Face> = {
	girl: {eyes: 'wide', mouth: 'smile', brows: 'raised', look: [0, 0], pupil: 0.8},
	son: {eyes: 'wide', mouth: 'o', brows: 'raised', look: [0, 0], pupil: 0.8},
	teen: {eyes: 'wide', mouth: 'smile', brows: 'raised', look: [0, 0], pupil: 0.8},
	dad: {},
	mom: {},
};

// the hand of the son from «Вахта» (orange sleeve), pointing up-left
const Finger: React.FC<{x: number; y: number; s?: number; sleeve?: string}> = ({x, y, s = 1, sleeve = '#f0a032'}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s}) rotate(-28deg)`, transformOrigin: '0 0'}}>
		<div style={{position: 'absolute', left: -38, top: -20, width: 76, height: 300, borderRadius: 38, background: '#f2c3a0', boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.08)'}} />
		<div style={{position: 'absolute', left: -96, top: 220, width: 200, height: 260, borderRadius: 70, background: '#f2c3a0'}} />
		<div style={{position: 'absolute', left: -140, top: 400, width: 280, height: 700, borderRadius: 90, background: sleeve}} />
	</div>
);

// ------------------------------------------------------------------- SHOTS ---
// 1. It looks like a new episode: "dad" in the doorway … STOP (pause).
const STOP = 22;
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const frozen = f >= STOP;
	const jolt = frozen && f < STOP + 7 ? (rnd(f) - 0.5) * 60 : 0;
	const stamp = pop(f, STOP + 2, 9);
	return (
		<AbsoluteFill style={{background: '#05060b', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `translateX(${jolt}px)`, filter: frozen ? 'grayscale(0.8) contrast(1.15) brightness(0.75)' : undefined}}>
				{frozen ? (
					<Freeze frame={STOP}>
						<DoorScene id="t1s1" zoom={lerp(STOP, 0, 90, 1.0, 1.08)} />
					</Freeze>
				) : (
					<DoorScene id="t1s1" zoom={lerp(f, 0, 90, 1.0, 1.08)} />
				)}
			</div>
			{/* the episode HUD clock, like in the series */}
			<div style={{position: 'absolute', left: 36, top: 54, background: 'rgba(10,12,20,0.75)', border: '3px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '8px 18px', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff', display: 'flex', alignItems: 'center', gap: 12}}>
				<div style={{width: 16, height: 16, borderRadius: 8, background: RED, opacity: frozen ? 1 : f % 30 < 18 ? 1 : 0.2}} />
				ДЕНЬ 4 · 03:00
			</div>
			{frozen && (
				<>
					{/* VHS pause: scan lines + the pause sign */}
					<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 7px)'}} />
					<div style={{position: 'absolute', right: 44, top: 50, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#fff', textShadow: '0 3px 0 #000'}}>
						<div style={{display: 'flex', gap: 8}}>
							<div style={{width: 14, height: 44, background: '#fff', boxShadow: '0 3px 0 #000'}} />
							<div style={{width: 14, height: 44, background: '#fff', boxShadow: '0 3px 0 #000'}} />
						</div>
						ПАУЗА
					</div>
					<div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,-50%) rotate(-8deg) scale(${2.2 - 1.2 * stamp})`, opacity: Math.min(1, stamp * 2)}}>
						<div style={{border: `12px solid ${RED}`, borderRadius: 22, padding: '4px 44px', fontFamily: HEAVY, fontWeight: 900, fontSize: 170, color: RED, letterSpacing: 8, background: 'rgba(20,0,0,0.45)', lineHeight: 1.1}}>СТОП</div>
					</div>
				</>
			)}
		</AbsoluteFill>
	);
};

// 2. The heroes of all our stories gather to ask you one thing.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const cam = {s: lerp(f, 0, 150, 1.42, 1.48), cx: 540, cy: 1170};
	return (
		<AbsoluteFill>
			<Stage cam={cam} light={{glow: 0.35, vignette: 0.75}} bg="#2a1d14">
				<Room id="t1s2" />
				<Heroes f={f} faces={HAPPY} />
			</Stage>
			{HEROES.map((h) => {
				const p = toScreen(cam, h.x, 0);
				return <Tag key={h.id} x={p.x} y={h.tagY} text={h.tag} sub={h.sub} color={h.color} p={pop(f, h.at + 6, 10)} />;
			})}
		</AbsoluteFill>
	);
};

// 3. "Should we open our Telegram channel or not?" — the son from «Вахта» and a big button.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const reach = lerp(f, 14, 64, 0, 1, Easing.out(Easing.cubic));
	const hover = Math.sin(f / 3.2) * 6 * reach; // the hand hesitates over the button
	const glow = 0.6 + 0.4 * Math.sin(f / 6);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1f4a5a 0%, #0c1c2a 55%, #050a12 100%)', overflow: 'hidden'}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<Bust kind="son" id="t1s3s" x={540} y={760 + lerp(f, 0, 100, 10, 0)} scale={2.3} tilt={lerp(f, 30, 70, 0, -6)} face={{eyes: 'open', mouth: f > 60 ? 'smile' : 'o', brows: 'raised', look: [0, f > 40 ? 0.15 : 0.6], pupil: 0.9, blush: false}} />
			</svg>
			<Bubble x={560} y={330} text="ОТКРЫВАЕМ ТГК?" from={6} to={104} />
			{/* the button on a steel plate */}
			<div style={{position: 'absolute', left: 540, top: 1600, transform: 'translate(-50%,-50%)'}}>
				<div style={{width: 470, height: 470, borderRadius: 60, background: 'linear-gradient(160deg, #c9ced6 0%, #8b929c 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 4px 0 rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							width: 340,
							height: 340,
							borderRadius: 170,
							background: 'radial-gradient(circle at 40% 35%, #ff7a6b 0%, #e5281c 55%, #a3120b 100%)',
							border: '14px solid #6d0b06',
							boxShadow: `0 0 ${50 + 40 * glow}px rgba(255,59,48,${0.45 + 0.3 * glow}), inset 0 -12px 0 rgba(0,0,0,0.2)`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							textAlign: 'center',
							fontFamily: HEAVY,
							fontWeight: 900,
							fontSize: 56,
							lineHeight: 1.0,
							color: '#fff',
							textShadow: '0 4px 0 rgba(0,0,0,0.35)',
						}}
					>
						ОТКРЫТЬ
						<br />
						ТГК
					</div>
				</div>
			</div>
			<Finger x={lerp(reach, 0, 1, 980, 700) + hover} y={lerp(reach, 0, 1, 2150, 1560) + hover * 0.5} s={1.05} />
		</AbsoluteFill>
	);
};

// the channel screen in the phone of the boy from «Голосовые из завтра»
const Lock: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<rect x={4} y={10} width={16} height={12} rx={2.5} fill="#fff" />
		<path d="M 7.5,10 V 7 a 4.5,4.5 0 0 1 9,0 V 10" stroke="#fff" strokeWidth={2.6} fill="none" />
	</svg>
);

const ChannelScreen: React.FC<{f: number}> = ({f}) => {
	const p1 = pop(f, 14, 11);
	const p2 = pop(f, 76, 11);
	const bar = lerp(f, 92, 116, 0, 1, Easing.out(Easing.cubic));
	const opts = [
		{n: '1', t: 'открыть дверь', v: 64},
		{n: '2', t: 'не открывать', v: 36},
	];
	return (
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f1c2c 0%, #13243a 100%)', fontFamily: HEAVY}}>
			{/* header */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: '#17263a', display: 'flex', alignItems: 'center', gap: 18, padding: '40px 24px 0', boxSizing: 'border-box'}}>
				<div style={{width: 76, height: 76, borderRadius: 38, background: '#05070d', border: `3px solid ${CH_BLUE}`, position: 'relative', flexShrink: 0}}>
					<div style={{position: 'absolute', left: 20, top: 32, width: 12, height: 8, borderRadius: 6, background: '#fff'}} />
					<div style={{position: 'absolute', left: 44, top: 32, width: 12, height: 8, borderRadius: 6, background: '#fff'}} />
				</div>
				<div style={{color: '#fff', fontWeight: 900}}>
					<div style={{fontSize: 34}}>НАШ ТГК</div>
					<div style={{fontSize: 21, color: '#8aa6c4', fontWeight: 800}}>канал · скоро откроется</div>
				</div>
			</div>
			{/* post 1: new episodes before everyone */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 180, transform: `scale(${p1})`, transformOrigin: '10% 0%', background: '#1d2d44', borderRadius: 22, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
				<div style={{height: 230, position: 'relative', background: 'radial-gradient(circle at 60% 45%, #f4d79a 0%, #8a5a2c 26%, #1b1530 52%, #070812 100%)'}}>
					{/* a silhouette in a lit doorway — the next episode */}
					<div style={{position: 'absolute', left: 300, top: 40, width: 110, height: 190, background: '#0a0b10', borderRadius: '55px 55px 8px 8px'}} />
					<div style={{position: 'absolute', left: 331, top: 84, width: 14, height: 9, borderRadius: 6, background: '#fff'}} />
					<div style={{position: 'absolute', left: 365, top: 84, width: 14, height: 9, borderRadius: 6, background: '#fff'}} />
					<div style={{position: 'absolute', left: 18, top: 18, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.65)', borderRadius: 14, padding: '8px 16px', color: '#fff', fontWeight: 900, fontSize: 26}}>
						<Lock size={28} />
						РАНЬШЕ ВСЕХ
					</div>
				</div>
				<div style={{padding: '16px 22px 20px', color: '#fff', fontWeight: 900, fontSize: 32}}>
					НОВАЯ СЕРИЯ
					<div style={{fontSize: 22, color: '#8aa6c4', fontWeight: 800, marginTop: 4}}>здесь — за день до ТикТока</div>
				</div>
			</div>
			{/* post 2: the vote, where the story goes */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 520, transform: `scale(${p2})`, transformOrigin: '10% 0%', background: '#1d2d44', borderRadius: 22, padding: '20px 22px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
				<div style={{color: '#8aa6c4', fontSize: 20, fontWeight: 800}}>ОПРОС</div>
				<div style={{color: '#fff', fontSize: 31, fontWeight: 900, marginTop: 4}}>КУДА ПОЙДЁТ СЮЖЕТ?</div>
				{opts.map((o, i) => (
					<div key={o.n} style={{marginTop: 16}}>
						<div style={{display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 25, fontWeight: 900}}>
							<span>
								{o.n} — {o.t}
							</span>
							<span>{Math.round(o.v * bar)}%</span>
						</div>
						<div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.12)', marginTop: 6}}>
							<div style={{height: 14, borderRadius: 7, width: `${o.v * bar}%`, background: i === 0 ? CH_BLUE : '#e0342b'}} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// 4. New episodes before everyone and votes on where the story goes.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const rise = lerp(f, 0, 16, 260, 0, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2a2140 0%, #0d0b18 60%, #05050b 100%)', overflow: 'hidden'}}>
			<Phone x={540} y={860 + rise} w={640} rot={-3 + lerp(f, 0, 156, 0, 2)} scale={lerp(f, 0, 156, 1.0, 1.04)}>
				<ChannelScreen f={f} />
			</Phone>
		</AbsoluteFill>
	);
};

// 5. "We'll open it when there are seven hundred of us." — the subscriber goal.
const GOAL = 700;
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const k = lerp(f, 4, 62, 0, 1, Easing.out(Easing.cubic));
	const done = f >= 62;
	const burst = pop(f, 62, 8);
	const shine = done ? 0.5 + 0.5 * Math.sin((f - 62) / 4) : 0;
	const W = 860;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2a55 0%, #0a1024 55%, #04060d 100%)', overflow: 'hidden'}}>
			{/* the two heroes peek in from the bottom, cheering */}
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<Bust kind="son" id="t1s5s" x={260} y={1700 - 40 * burst} scale={1.6} face={{eyes: done ? 'happy' : 'wide', mouth: done ? 'open' : 'o', brows: 'raised', look: [0.4, -0.6], blush: false}} />
				<Bust kind="teen" id="t1s5t" x={830} y={1720 - 40 * burst} scale={1.6} face={{eyes: done ? 'happy' : 'wide', mouth: done ? 'open' : 'o', brows: 'raised', look: [-0.4, -0.6], blush: false}} />
			</svg>
			<div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 50, color: '#9fb3d9', letterSpacing: 6}}>ОТКРОЕМ ТГК НА</div>
				<div style={{fontSize: 290, lineHeight: 1, color: done ? YELLOW : '#fff', transform: `scale(${done ? 1 + 0.12 * (1 - burst) + 0.03 * shine : 1})`, textShadow: done ? '0 12px 0 #6b4a00, 0 0 60px rgba(255,211,74,0.55)' : '0 10px 0 #000'}}>
					{Math.round(GOAL * k)}
				</div>
				<div style={{fontSize: 70, color: '#fff', marginTop: -6, textShadow: '0 6px 0 #000'}}>ПОДПИСЧИКОВ</div>
			</div>
			{/* the bar with the lock at the goal */}
			<div style={{position: 'absolute', left: (1080 - W) / 2, top: 820, width: W, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.12)', border: '4px solid rgba(255,255,255,0.25)', boxSizing: 'border-box'}}>
				<div style={{height: '100%', width: `${100 * k}%`, borderRadius: 28, background: done ? YELLOW : CH_BLUE, boxShadow: done ? '0 0 30px rgba(255,211,74,0.7)' : 'none'}} />
			</div>
			<div style={{position: 'absolute', left: (1080 + W) / 2, top: 848, transform: `translate(-50%,-50%) scale(${1 + 0.25 * burst * (done ? 1 : 0)})`}}>
				<div style={{width: 130, height: 130, borderRadius: 65, background: done ? YELLOW : '#1b2550', border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={70} height={70} viewBox="0 0 24 24">
						<rect x={4} y={10} width={16} height={12} rx={2.5} fill={done ? '#111' : '#fff'} />
						<path d={done ? 'M 7.5,10 V 7 a 4.5,4.5 0 0 1 9,0' : 'M 7.5,10 V 7 a 4.5,4.5 0 0 1 9,0 V 10'} stroke={done ? '#111' : '#fff'} strokeWidth={2.6} fill="none" transform={done ? 'translate(5,-2) rotate(20 12 7)' : undefined} />
					</svg>
				</div>
				<div style={{position: 'absolute', top: 140, left: '50%', transform: 'translateX(-50%)', fontFamily: HEAVY, fontWeight: 900, fontSize: 38, color: done ? YELLOW : '#fff', whiteSpace: 'nowrap'}}>ТГК</div>
			</div>
		</AbsoluteFill>
	);
};

// a small phone in "dad"'s hand (hand-local coordinates)
const DadPhone: React.FC = () => (
	<g transform="rotate(50)">
		<rect x={-38} y={-150} width={76} height={150} rx={12} fill="#15161a" />
		<rect x={-32} y={-144} width={64} height={138} rx={8} fill="#8fd8ff" />
		<path d="M -14,-80 L -3,-68 L 16,-94" stroke="#0b3a55" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</g>
);

// 6. "And he, it seems, has already subscribed." (+1 to the counter)
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const sub = pop(f, 46, 10);
	return (
		<AbsoluteFill style={{background: '#05060b', overflow: 'hidden'}}>
			<DoorScene id="t1s6" zoom={lerp(f, 0, 90, 1.06, 1.14)} son={false} arm={{target: [105, -770], bend: 1}} item={<DadPhone />} glow={0.8 + 0.2 * Math.sin(f / 4)} />
			{sub > 0.001 && (
				<div style={{position: 'absolute', left: 540, top: 240, transform: `translate(-50%,-50%) scale(${sub})`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, background: CH_BLUE, borderRadius: 60, padding: '18px 40px', fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
						<svg width={46} height={46} viewBox="0 0 24 24">
							<path d="M 4,13 L 10,19 L 20,5" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						ВЫ ПОДПИСАНЫ
					</div>
				</div>
			)}
			{f >= 52 && (
				<div style={{position: 'absolute', left: 800, top: 330 - lerp(f, 52, 84, 0, 90), opacity: interpolate(f, [52, 58, 76, 86], [0, 1, 1, 0], clamp), fontFamily: HEAVY, fontWeight: 900, fontSize: 80, color: YELLOW, textShadow: '0 5px 0 #000'}}>+1</div>
			)}
		</AbsoluteFill>
	);
};

// 7. "So — are we opening it?" — the heroes, close, hopeful.
const GroupClose: React.FC<{f: number; q?: number}> = ({f, q = 0}) => (
	<AbsoluteFill>
		<Stage cam={{s: 1.5 * kick(f, 0.05), cx: 540, cy: 990}} light={{glow: 0.35, vignette: 0.8}} bg="#2a1d14">
			<Room id="t1s6" />
			<Heroes f={f} faces={HOPE} appear={false} />
		</Stage>
		{q > 0.001 && (
			<div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%,-50%) scale(${q}) rotate(${Math.sin(f / 5) * 5}deg)`, fontFamily: HEAVY, fontWeight: 900, fontSize: 300, color: YELLOW, textShadow: '0 12px 0 #6b4a00, 0 0 40px rgba(255,211,74,0.5)'}}>?</div>
		)}
	</AbsoluteFill>
);

export const S07: React.FC = () => {
	const f = useCurrentFrame();
	return <GroupClose f={f} q={pop(f, 8, 9)} />;
};

// 8. The choice: 1 — yes, 2 — no; three, two, one.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 50, 11);
	const nums = [
		{n: '3', at: 120},
		{n: '2', at: 150},
		{n: '1', at: 180},
	];
	const cur = [...nums].reverse().find((x) => f >= x.at);
	const final = f >= 206;
	const fp = pop(f, 206, 9);
	const pulse = final ? 1 + Math.sin((f - 206) / 4) * 0.03 : 1;
	const hot = f >= 120 && f < 206 ? (Math.floor((f - 120) / 15) % 2 === 0 ? 1 : 2) : 0;
	const card = (p: number, top: number, num: string, text: string, color: string, sub: string, idx: number) => (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top,
				width: 960,
				transform: `translateX(${(1 - p) * -1000}px) scale(${pulse * (hot === idx ? 1.04 : 1)})`,
				background: hot === idx ? color : '#121214',
				border: `7px solid ${color}`,
				borderRadius: 28,
				padding: '26px 30px',
				display: 'flex',
				gap: 26,
				alignItems: 'center',
				boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
				boxSizing: 'border-box',
			}}
		>
			<div style={{minWidth: 110, height: 110, borderRadius: 55, background: color, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</div>
			<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 1.08}}>
				{text}
				<div style={{fontSize: 32, color: hot === idx ? '#fff' : color, marginTop: 6}}>{sub}</div>
			</div>
		</div>
	);
	return (
		<AbsoluteFill>
			<Freeze frame={50}>
				<GroupClose f={50} />
			</Freeze>
			<AbsoluteFill style={{background: 'rgba(3,4,10,0.72)'}} />
			<div style={{position: 'absolute', top: 280, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #6b4a00, 0 0 30px rgba(255,211,74,0.45)', lineHeight: 1.05}}>
				ОТКРЫВАТЬ <span style={{color: YELLOW}}>ТГК?</span>
				<div style={{fontSize: 40, color: YELLOW, marginTop: 14, letterSpacing: 2, textShadow: '0 4px 0 #000'}}>ОТКРОЕМ НА 700 ПОДПИСЧИКОВ</div>
			</div>
			{card(c1, 600, '1', 'ДА, ОТКРЫВАЙ!', '#3b82f6', 'хочу серии раньше всех', 1)}
			<div style={{position: 'absolute', left: 0, width: '100%', top: 830, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: YELLOW, opacity: c2}}>ИЛИ</div>
			{card(c2, 900, '2', 'НЕТ, НЕ НАДО', '#e0342b', 'мне и тут страшно', 2)}
			{cur && !final && (
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 1230,
						width: 220,
						height: 220,
						marginLeft: -110,
						borderRadius: 110,
						background: YELLOW,
						border: '8px solid #111',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 150,
						color: '#111',
						transform: `scale(${pop(f, cur.at, 8) * interpolate(f, [cur.at + 22, cur.at + 30], [1, 0.6], clamp)})`,
					}}
				>
					{cur.n}
				</div>
			)}
			{final && (
				<div style={{position: 'absolute', left: 0, width: '100%', top: 1200, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${fp})`}}>
					<div style={{fontSize: 110, color: YELLOW, textShadow: '0 6px 0 #000'}}>ВЫБИРАЙ!</div>
					<div style={{fontSize: 48, color: '#fff', textShadow: '0 4px 0 #000', marginTop: 8}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
				</div>
			)}
		</AbsoluteFill>
	);
};
