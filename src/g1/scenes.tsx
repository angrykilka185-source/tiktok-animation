// «Голосовые из завтра» — серия 1 «Не садись в лифт». 14 shots, authored on the
// timeline of src/g1/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part g1).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg, shake} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {PlankFloor, Wallpaper, WindowBox} from '../components/Set';
import {Cam, Stage, toScreen} from '../components/Stage';
import {Phone as PhoneBase, SANS} from '../scenes/S12_S16';
import envJson from './env.json';

const YELLOW = '#ffd34a';
const RED = '#ff3b30';
const NIGHT = '#0b1638';
const BLUE = '#2d6cdf';
const NEIGHBOUR = {hair: '#d6d2dc', top: '#7a4e8a', topDark: '#5e3a6c', pants: '#d9b49a', shoes: '#3a2a30'};
const PHONE_BG = 'radial-gradient(circle at 50% 55%, #1c2a4a 0%, #05070f 65%)';

// the hero's phone: his red sleeve and hand
const Phone: React.FC<React.ComponentProps<typeof PhoneBase>> = (p) => <PhoneBase sleeve="#cf4a3c" skin="#e8b48e" {...p} />;

// loudness of a fitted voice line, frame by frame (scripts: see src/g1/env.json)
const ENV = envJson as Record<string, number[]>;
const level = (k: string, i: number) => {
	const a = ENV[k];
	if (!a || i < 0 || i >= a.length) return 0;
	return a[Math.floor(i)];
};

const rnd = (i: number) => {
	const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
	return v - Math.floor(v);
};
const BARS = Array.from({length: 26}, (_, i) => 0.2 + 0.8 * rnd(i) * (0.6 + 0.4 * Math.sin(i / 3)));

// place the phone so that a point of its screen (cx, cy) lands on (X, Y) at zoom s
const focus = (w: number, cx: number, cy: number, X: number, Y: number, s: number) => {
	const h = w * 2.05;
	return {x: X - s * (cx + 16 - w / 2), y: Y - s * (cy + 16 - h / 2)};
};

// ============================================================ phone UI ======
const PlayIcon: React.FC = () => <div style={{width: 0, height: 0, borderTop: '20px solid transparent', borderBottom: '20px solid transparent', borderLeft: '32px solid #fff', marginLeft: 8}} />;
const PauseIcon: React.FC = () => (
	<div style={{display: 'flex', gap: 10}}>
		<div style={{width: 11, height: 36, borderRadius: 3, background: '#fff'}} />
		<div style={{width: 11, height: 36, borderRadius: 3, background: '#fff'}} />
	</div>
);
const Mic: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<rect x={8.5} y={2} width={7} height={12} rx={3.5} fill={color} />
		<path d="M 5,11 a 7,7 0 0 0 14,0" stroke={color} strokeWidth={2} fill="none" />
		<rect x={11} y={18} width={2} height={4} fill={color} />
	</svg>
);

const StatusBar: React.FC<{time: string}> = ({time}) => (
	<div style={{position: 'absolute', left: 54, right: 44, top: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 27, color: '#fff', zIndex: 3}}>
		<span>{time}</span>
		<span style={{display: 'flex', gap: 6, alignItems: 'flex-end'}}>
			{[10, 15, 20, 25].map((h) => (
				<span key={h} style={{width: 6, height: h, background: '#fff', borderRadius: 2}} />
			))}
			<span style={{width: 46, height: 24, border: '3px solid #fff', borderRadius: 7, marginLeft: 10, padding: 2, boxSizing: 'border-box', display: 'flex'}}>
				<span style={{width: '62%', background: '#fff', borderRadius: 2}} />
			</span>
		</span>
	</div>
);

const OwnHeader: React.FC<{typing?: boolean}> = ({typing}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 200, background: '#1b1d22', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 18, fontFamily: SANS, boxSizing: 'border-box', zIndex: 2}}>
		<div style={{fontSize: 64, lineHeight: '84px', color: '#5aa0ff', fontWeight: 600}}>‹</div>
		<div style={{width: 84, height: 84, borderRadius: 42, background: '#8a5a32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, flex: 'none'}}>Я</div>
		<div>
			<div style={{fontWeight: 900, fontSize: 40, color: '#f2f2f2'}}>Мой номер</div>
			<div style={{fontWeight: 600, fontSize: 26, color: typing ? '#5aa0ff' : '#8b93a3'}}>{typing ? 'печатает…' : '+7 9•• •••-47-12'}</div>
		</div>
	</div>
);

const ChatScreen: React.FC<{time: string; typing?: boolean; input?: string; caret?: boolean; children?: React.ReactNode}> = ({time, typing, input, caret, children}) => (
	<div style={{position: 'absolute', inset: 0, background: '#0f1115', overflow: 'hidden'}}>
		<div style={{position: 'absolute', top: 214, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#6b7280'}}>сегодня</div>
		{children}
		<OwnHeader typing={typing} />
		<StatusBar time={time} />
		{input !== undefined && (
			<div style={{position: 'absolute', left: 20, right: 20, bottom: 40, height: 86, borderRadius: 43, background: '#22252c', display: 'flex', alignItems: 'center', padding: '0 32px', fontFamily: SANS, fontSize: 36, fontWeight: 700, color: input ? '#fff' : '#6b7280', boxSizing: 'border-box'}}>
				{input || 'Сообщение'}
				{caret && <span style={{width: 3, height: 42, background: '#5aa0ff', marginLeft: 4}} />}
			</div>
		)}
	</div>
);

// voice message bubble: play button + waveform + length + send time
const VoiceBubble: React.FC<{top: number; f: number; progress?: number; lvl?: number; sent?: string; ring?: number; redTail?: number}> = ({
	top,
	f,
	progress = 0,
	lvl = 0,
	sent = '23:59',
	ring = 0,
	redTail = 0,
}) => {
	const playing = progress > 0 && progress < 1;
	const secs = playing ? Math.min(7, Math.floor(progress * 7)) : 7;
	return (
		<div style={{position: 'absolute', left: 24, top, width: 560, background: '#262a33', borderRadius: '34px 34px 34px 8px', padding: '22px 24px 14px', boxSizing: 'border-box', fontFamily: SANS}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<div style={{position: 'relative', width: 92, height: 92, flex: 'none'}}>
					{playing && <div style={{position: 'absolute', inset: -16 * lvl, borderRadius: '50%', background: 'rgba(90,160,255,0.35)'}} />}
					<div style={{position: 'absolute', inset: 0, borderRadius: 46, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{playing ? <PauseIcon /> : <PlayIcon />}</div>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 6, height: 84, flex: 1}}>
					{BARS.map((b, i) => {
						const x = (i + 0.5) / BARS.length;
						const wob = playing ? lvl * 26 * (0.55 + 0.45 * Math.sin(f * 0.9 + i * 1.7)) : 0;
						const red = redTail > 0 && x > 1 - 0.3 * redTail;
						return (
							<div
								key={i}
								style={{width: 9, height: Math.min(84, 10 + 50 * b + wob), borderRadius: 5, background: red ? RED : x <= progress ? '#9cc2ff' : '#59606f', boxShadow: red ? '0 0 12px rgba(255,59,48,0.9)' : undefined}}
							/>
						);
					})}
				</div>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 25, fontWeight: 700, color: '#8b93a3'}}>
				<span>0:0{secs}</span>
				<span style={{position: 'relative', padding: '2px 10px', borderRadius: 10, background: ring > 0 ? `rgba(255,59,48,${0.9 * Math.min(1, ring)})` : 'transparent', color: ring > 0.5 ? '#fff' : '#8b93a3'}}>
					{sent}
					{ring > 0 && (
						<div style={{position: 'absolute', inset: '-16px -24px', border: `6px solid ${RED}`, borderRadius: '50%', transform: `scale(${0.6 + 0.4 * ring}) rotate(-6deg)`, opacity: Math.min(1, ring)}} />
					)}
				</span>
			</div>
		</div>
	);
};

const TextBubble: React.FC<{top: number; text: string; out?: boolean; time: string; p?: number; timeRed?: boolean}> = ({top, text, out, time, p = 1, timeRed}) => (
	<div
		style={{
			position: 'absolute',
			top,
			...(out ? {right: 24} : {left: 24}),
			maxWidth: 520,
			background: out ? BLUE : '#262a33',
			borderRadius: out ? '30px 30px 8px 30px' : '30px 30px 30px 8px',
			padding: '18px 26px 12px',
			fontFamily: SANS,
			fontSize: 42,
			fontWeight: 800,
			color: '#fff',
			transform: `scale(${p})`,
			transformOrigin: out ? '100% 100%' : '0% 100%',
			boxSizing: 'border-box',
		}}
	>
		{text}
		<div style={{fontSize: 23, fontWeight: 700, color: timeRed ? '#ff6a5f' : out ? '#cfe0ff' : '#8b93a3', textAlign: 'right', marginTop: 4}}>{time}</div>
	</div>
);

const TypingDots: React.FC<{f: number; top: number}> = ({f, top}) => (
	<div style={{position: 'absolute', left: 24, top, background: '#262a33', borderRadius: '30px 30px 30px 8px', padding: '26px 30px', display: 'flex', gap: 12}}>
		{[0, 1, 2].map((k) => (
			<div key={k} style={{width: 18, height: 18, borderRadius: 9, background: '#9aa3b2', opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - k * 5) / 4))}} />
		))}
	</div>
);

const LockScreen: React.FC<{notif: number; ring?: number; time?: string}> = ({notif, ring = 0, time = '23:41'}) => (
	<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #2a3c6e 0%, #121a33 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
		<div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
			<div style={{fontSize: 32, fontWeight: 700, opacity: 0.85}}>четверг, 12 ноября</div>
			<div style={{fontSize: 170, fontWeight: 800, lineHeight: 1.05}}>{time}</div>
		</div>
		<div
			style={{
				position: 'absolute',
				left: 22,
				right: 22,
				top: 430,
				transform: `scale(${notif})`,
				transformOrigin: '50% 0%',
				background: 'rgba(245,245,250,0.95)',
				borderRadius: 30,
				padding: '22px 24px',
				display: 'flex',
				gap: 18,
				alignItems: 'center',
				boxSizing: 'border-box',
			}}
		>
			<div style={{width: 80, height: 80, borderRadius: 20, background: '#3ac569', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
				<Mic size={50} />
			</div>
			<div style={{flex: 1}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<span style={{position: 'relative', fontWeight: 900, fontSize: 36, color: ring > 0.5 ? RED : '#111'}}>
						Мой номер
						{ring > 0 && <div style={{position: 'absolute', inset: '-14px -22px', border: `6px solid ${RED}`, borderRadius: '50%', transform: `scale(${0.6 + 0.4 * ring}) rotate(-4deg)`, opacity: Math.min(1, ring)}} />}
					</span>
					<span style={{fontSize: 24, color: '#666', fontWeight: 600}}>сейчас</span>
				</div>
				<div style={{fontWeight: 600, fontSize: 29, color: '#444', marginTop: 4}}>Голосовое сообщение (0:07)</div>
			</div>
		</div>
	</div>
);

const Empty: React.FC<{p: number}> = ({p}) => (
	<div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', fontFamily: SANS, opacity: p}}>
		<div style={{width: 140, height: 140, borderRadius: 70, background: '#1d2027', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Mic size={74} color="#3a3f4a" />
		</div>
		<div style={{fontSize: 38, fontWeight: 800, color: '#8b93a3', marginTop: 26}}>Сообщений нет</div>
	</div>
);

// the messages tear into slices and colour fringes, then vanish
const Glitch: React.FC<{f: number; from: number; to: number; children: React.ReactNode}> = ({f, from, to, children}) => {
	const fade = interpolate(f, [to - 10, to], [1, 0], clamp);
	const blink = Math.floor((f - from) / 2) % 3 === 2 ? 0.25 : 1;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: fade * blink}}>
			{Array.from({length: 9}).map((_, k) => {
				const y0 = 240 + k * 56;
				const dx = (rnd(f * 7 + k) - 0.5) * 90 * (rnd(f + k * 3) > 0.4 ? 1 : 0.1);
				return (
					<div key={k} style={{position: 'absolute', inset: 0, clipPath: `inset(${y0}px 0 calc(100% - ${y0 + 56}px) 0)`, transform: `translateX(${dx}px)`}}>
						{children}
					</div>
				);
			})}
			<div style={{position: 'absolute', inset: 0, transform: 'translateX(12px)', opacity: 0.55, filter: 'sepia(1) saturate(7) hue-rotate(-45deg)', mixBlendMode: 'screen'}}>{children}</div>
			<div style={{position: 'absolute', inset: 0, transform: 'translateX(-12px)', opacity: 0.55, filter: 'sepia(1) saturate(7) hue-rotate(150deg)', mixBlendMode: 'screen'}}>{children}</div>
		</div>
	);
};

// ======================================================= scene pieces =====
const PhoneLight: React.FC<{id: string; x: number; y: number; r: number; o?: number}> = ({id, x, y, r, o = 1}) => (
	<g>
		<defs>
			<radialGradient id={id}>
				<stop offset="0%" stopColor="#cfe0ff" stopOpacity={0.5} />
				<stop offset="45%" stopColor="#9fbaff" stopOpacity={0.16} />
				<stop offset="100%" stopColor="#9fbaff" stopOpacity={0} />
			</radialGradient>
		</defs>
		<circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />
	</g>
);

// Your room at night, the bed seen from the side, the phone on the bedside table.
const Bedroom: React.FC<{f: number; id: string; glow: number; buzz: boolean; eyes: 'closed' | 'open' | 'wide'}> = ({f, id, glow, buzz, eyes}) => {
	const jx = buzz ? Math.sin(f * 2.9) * 5 : 0;
	const face: Face =
		eyes === 'closed'
			? {eyes: 'closed', mouth: 'flat', brows: 'neutral', blush: false}
			: {eyes: eyes === 'wide' ? 'wide' : 'open', look: [0, 0.85], pupil: eyes === 'wide' ? 0.6 : 1, mouth: eyes === 'wide' ? 'o' : 'flat', brows: eyes === 'wide' ? 'raised' : 'worried', blush: false};
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#232c52" />
			<Wallpaper id={`${id}wp`} x={-400} y={-400} w={1880} h={1850} base="#2c3863" line="#27325b" />
			{/* football poster */}
			<rect x={150} y={470} width={230} height={300} rx={8} fill="#c4513c" />
			<circle cx={265} cy={598} r={70} fill="#f4f1ec" />
			<path d="M 265,562 l 30,22 l -12,36 l -36,0 l -12,-36 Z" fill="#2a2a2a" />
			<text x={265} y={735} fontSize={36} fontFamily={HEAVY} fontWeight={900} fill="#f4f1ec" textAnchor="middle">
				ГОЛ!
			</text>
			{/* window with the moon */}
			<WindowBox x={560} y={440} w={360} h={420} sky="url(#skyNight)" curtain={false} />
			<circle cx={830} cy={528} r={68} fill="#f3eecb" opacity={0.12} />
			<circle cx={830} cy={528} r={40} fill="#f3eecb" />
			{[
				[610, 480],
				[690, 560],
				[640, 700],
				[880, 760],
				[790, 680],
			].map(([sx, sy], k) => (
				<circle key={k} cx={sx} cy={sy} r={3 + (k % 2)} fill="#fff" opacity={0.45 + 0.5 * Math.abs(Math.sin(f / 9 + k))} />
			))}
			<path d="M 520,410 L 600,410 Q 580,650 600,900 L 520,900 Z" fill="#3b3f6e" />
			<path d="M 960,410 L 880,410 Q 900,650 880,900 L 960,900 Z" fill="#3b3f6e" />
			<path d="M 560,860 L 920,860 L 1060,1450 L 420,1450 Z" fill="#9fb7ff" opacity={0.06} />
			<PlankFloor y={1450} color="#3a2c2a" seam="#2a1f1e" />
			{/* bed */}
			<rect x={36} y={960} width={74} height={500} rx={16} fill="#6b4a33" />
			<rect x={90} y={1248} width={690} height={100} rx={20} fill="#dcd8e8" />
			<ellipse cx={215} cy={1222} rx={128} ry={48} fill="#eeecf6" />
			<defs>
				<clipPath id={`${id}clip`}>
					<rect x={-400} y={-400} width={735} height={2800} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}clip)`}>
				<g transform="rotate(-90 228 1176)">
					<Bust kind="teen" id={`${id}b`} x={228} y={1176} scale={0.95} face={face} />
				</g>
			</g>
			<path d="M 300,1350 L 296,1130 C 300,1050 390,1010 470,1030 C 540,1050 570,1100 630,1108 C 700,1116 760,1150 785,1240 L 792,1350 Z" fill="#4b69a6" />
			<path d="M 296,1130 C 300,1080 330,1052 372,1046" stroke="#6f8cc8" strokeWidth={22} fill="none" strokeLinecap="round" />
			<path d="M 470,1062 C 520,1090 560,1140 600,1150" stroke="#3d5890" strokeWidth={6} fill="none" opacity={0.7} />
			<rect x={60} y={1340} width={740} height={64} rx={10} fill="#6b4a33" />
			<rect x={80} y={1400} width={30} height={52} fill="#5a3d2a" />
			<rect x={750} y={1400} width={30} height={52} fill="#5a3d2a" />
			{/* bedside table, alarm clock, phone */}
			<rect x={790} y={1190} width={220} height={262} fill="#6b4a33" />
			<rect x={780} y={1172} width={240} height={24} rx={5} fill="#7d5a40" />
			<rect x={808} y={1290} width={184} height={6} fill="#5a3d2a" />
			<circle cx={900} cy={1250} r={9} fill="#d8b25a" />
			<rect x={800} y={1098} width={130} height={74} rx={14} fill="#16171c" />
			<g transform={`translate(${960 + jx},1172) rotate(8)`}>
				<rect x={-34} y={-128} width={68} height={128} rx={10} fill="#111" />
			</g>
			{/* night */}
			<rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.42} />
			<text x={865} y={1150} fontSize={40} fontFamily={MONO} fontWeight={700} fill={RED} textAnchor="middle" style={{filter: 'drop-shadow(0 0 6px rgba(255,59,48,0.9))'}}>
				23:41
			</text>
			<g transform={`translate(${960 + jx},1172) rotate(8)`}>
				<rect x={-28} y={-122} width={56} height={116} rx={7} fill={glow > 0 ? '#cfe2ff' : '#0d0f14'} />
				{glow > 0 && <rect x={-24} y={-102} width={48} height={22} rx={5} fill="#3ac569" />}
			</g>
			{buzz && (
				<g stroke="#cfe2ff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8}>
					<path d="M 905,1060 q -14,24 0,48" />
					<path d="M 1022,1070 q 14,24 0,48" />
				</g>
			)}
			{glow > 0 && <PhoneLight id={`${id}glow`} x={960} y={1110} r={900} o={glow} />}
		</g>
	);
};

// Stairwell landing with the lift (walls: white top, green bottom, like in old blocks).
const LiftLanding: React.FC<{f: number; id: string; open?: number; floor?: string; err?: boolean; win?: boolean; stencil?: string; jolt?: number; btn?: boolean}> = ({
	f,
	id,
	open = 0,
	floor = '7',
	err = false,
	win = true,
	stencil,
	jolt = 0,
	btn = false,
}) => {
	const o = Math.max(0, Math.min(1, open));
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={1400} fill="#e6e9dd" />
			<rect x={-400} y={1000} width={1880} height={460} fill="#5f9a83" />
			<rect x={-400} y={994} width={1880} height={10} fill="#4a7a66" />
			<rect x={-400} y={1460} width={1880} height={1000} fill="#9a6e52" />
			{[1510, 1580, 1680, 1820, 2000].map((ly) => (
				<rect key={ly} x={-400} y={ly} width={1880} height={5} fill="#86604a" />
			))}
			{[-300, -60, 180, 420, 660, 900, 1140, 1380].map((lx) => (
				<line key={lx} x1={540 + (lx - 540) * 0.5} y1={1460} x2={lx + (lx - 540) * 0.6} y2={2400} stroke="#86604a" strokeWidth={5} />
			))}
			{win && <WindowBox x={70} y={420} w={300} h={380} sky="url(#skyMorning)" curtain={false} />}
			{stencil && (
				<g fill="#5f9a83" fontFamily={HEAVY} fontWeight={900} textAnchor="middle">
					<text x={180} y={820} fontSize={260}>
						{stencil}
					</text>
					<text x={180} y={890} fontSize={54} letterSpacing={8}>
						ЭТАЖ
					</text>
				</g>
			)}
			{/* the lift */}
			<rect x={470} y={640} width={440} height={820} fill="#8b939c" />
			<rect x={500} y={670} width={380} height={790} fill="#f4e2b4" />
			<rect x={600} y={670} width={6} height={790} fill="#e2cd98" />
			<rect x={780} y={670} width={6} height={790} fill="#e2cd98" />
			<ellipse cx={690} cy={690} rx={150} ry={24} fill="#fffbe8" />
			<rect x={500} y={1150} width={380} height={16} fill="#d8dde2" />
			<rect x={500} y={1420} width={380} height={40} fill="#7a5a42" />
			<defs>
				<clipPath id={`${id}open`}>
					<rect x={500} y={670} width={380} height={790} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${id}open)`}>
				<rect x={500 - 190 * o + jolt} y={670} width={190} height={790} fill="#b3bcc5" />
				<rect x={530 - 190 * o + jolt} y={670} width={20} height={790} fill="#c4ccd4" />
				<rect x={690 + 190 * o + jolt} y={670} width={190} height={790} fill="#a9b2bb" />
				<rect x={720 + 190 * o + jolt} y={670} width={20} height={790} fill="#bbc3cb" />
				{o < 0.02 && <rect x={688 + jolt} y={670} width={4} height={790} fill="#7d858e" />}
			</g>
			<rect x={630} y={560} width={120} height={64} rx={8} fill="#121316" />
			<text x={690} y={608} fontSize={46} fontFamily={MONO} fontWeight={700} fill={RED} textAnchor="middle" opacity={err ? (Math.floor(f / 3) % 2 ? 1 : 0.15) : 1}>
				{err ? '!' : floor}
			</text>
			<rect x={940} y={1030} width={56} height={100} rx={8} fill="#a7afb7" />
			<circle cx={968} cy={1080} r={17} fill={btn ? '#ffb347' : '#e1e5e9'} />
			{btn && <circle cx={968} cy={1080} r={30} fill="#ffb347" opacity={0.35} />}
			{o > 0 && <path d="M 500,1460 L 880,1460 L 1030,1800 L 350,1800 Z" fill="#ffe9a8" opacity={0.4 * o} />}
		</g>
	);
};

// side view of a flight of stairs going down to the left
const STAIRS_D = (() => {
	let d = 'M 1480,1200 L 700,1200';
	for (let k = 1; k <= 9; k++) {
		const xk = 700 - 50 * (k - 1);
		const yk = 1200 + (400 / 9) * k;
		d += ` L ${xk},${yk} L ${xk - 50},${yk}`;
	}
	return d + ' L -400,1600 L -400,2400 L 1480,2400 Z';
})();
const Stairs: React.FC<{stencil: string}> = ({stencil}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={1400} fill="#e6e9dd" />
		<rect x={-400} y={1000} width={1880} height={1400} fill="#5f9a83" />
		<rect x={-400} y={994} width={1880} height={10} fill="#4a7a66" />
		<g fill="#5f9a83" fontFamily={HEAVY} fontWeight={900} textAnchor="middle">
			<text x={960} y={760} fontSize={240}>
				{stencil}
			</text>
			<text x={960} y={830} fontSize={50} letterSpacing={8}>
				ЭТАЖ
			</text>
		</g>
		<path d={STAIRS_D} fill="#b9ab9b" />
		<path d="M 720,1232 L 250,1650 L 250,1700 L 720,1284 Z" fill="#a39585" />
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={700 - 50 * k - 3} y={1200 + (400 / 9) * k} width={6} height={400 / 9} fill="#8f8273" />
		))}
	</g>
);
const Railing: React.FC = () => (
	<g>
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={675 - 50 * k - 4} y={842 + (400 / 9) * k} width={8} height={402} fill="#3a3d42" />
		))}
		{[760, 860, 960, 1060, 1160].map((bx) => (
			<rect key={bx} x={bx - 4} y={820} width={8} height={380} fill="#3a3d42" />
		))}
		<path d="M 250,1220 L 700,820 L 1480,820" stroke="#6b3e2a" strokeWidth={20} fill="none" strokeLinejoin="round" />
	</g>
);

const Dust: React.FC<{t: number}> = ({t}) => (
	<g>
		{Array.from({length: 18}).map((_, k) => (
			<circle key={k} cx={470 + rnd(k + 3) * 460} cy={600 + t * (5 + rnd(k + 40) * 7) + rnd(k + 70) * 80} r={3 + rnd(k + 90) * 6} fill="#cfc6b8" opacity={Math.max(0, 1 - t / 30)} />
		))}
	</g>
);

// small fluffy dog; local origin = body centre
const Dog: React.FC<{bark?: number}> = ({bark = 0}) => (
	<g>
		<path d="M 70,-10 C 125,-40 115,-95 72,-82" stroke="#e8c79a" strokeWidth={28} fill="none" strokeLinecap="round" />
		<ellipse cx={0} cy={10} rx={95} ry={70} fill="#f1d9b5" />
		<rect x={-62} y={52} width={28} height={48} rx={13} fill="#e8c79a" />
		<rect x={30} y={52} width={28} height={48} rx={13} fill="#e8c79a" />
		<g transform={`translate(-60,-60) rotate(${-bark * 10})`}>
			<path d="M -52,-28 L -44,-98 L -10,-52 Z" fill="#e8c79a" />
			<path d="M 52,-28 L 44,-98 L 10,-52 Z" fill="#e8c79a" />
			<circle cx={0} cy={0} r={62} fill="#f6e3c4" />
			<ellipse cx={0} cy={28} rx={30} ry={22} fill="#fff4e2" />
			<circle cx={-22} cy={-8} r={9} fill="#1a1a1a" />
			<circle cx={22} cy={-8} r={9} fill="#1a1a1a" />
			<ellipse cx={0} cy={15} rx={10} ry={7} fill="#1a1a1a" />
			{bark > 0 ? <ellipse cx={0} cy={38} rx={15} ry={4 + 12 * bark} fill="#7a2e26" /> : <path d="M -10,32 Q 0,40 10,32" stroke="#1a1a1a" strokeWidth={3} fill="none" />}
		</g>
	</g>
);

// the neighbour holding her dog against her chest
const Neighbour: React.FC<{id: string; x: number; y: number; scale: number; bark: number; face: Face; breathe?: number}> = ({id, x, y, scale, bark, face, breathe}) => (
	<g>
		<Person kind="mom" id={id} colors={NEIGHBOUR} x={x} y={y} scale={scale} face={face} breathe={breathe} armL={{target: [-70, -600], bend: 1, kf: 0.9}} armR={{target: [80, -575], bend: -1, kf: 0.9}} />
		<g transform={`translate(${x + 10 * scale},${y - 600 * scale}) scale(${scale * 0.9})`}>
			<Dog bark={bark} />
		</g>
	</g>
);

// the stuck cabin seen from inside
const Cabin: React.FC<{f: number}> = ({f}) => {
	const alarm = Math.floor(f / 5) % 2 === 0;
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={1920} fill="#c9a77a" />
			{[-200, 0, 200, 400, 600, 800, 1000, 1200].map((px) => (
				<rect key={px} x={px} y={-400} width={6} height={1920} fill="#b8956a" />
			))}
			<rect x={-400} y={-400} width={1880} height={640} fill="#e6e1d6" />
			<rect x={-400} y={234} width={1880} height={10} fill="#b9b2a4" />
			<rect x={300} y={150} width={480} height={50} rx={10} fill="#fffbe8" />
			<rect x={-400} y={1130} width={1880} height={22} fill="#d8dde2" />
			<rect x={-400} y={1520} width={1880} height={900} fill="#5a4a3e" />
			<rect x={850} y={700} width={140} height={430} rx={12} fill="#c0c6cc" />
			{Array.from({length: 10}).map((_, k) => (
				<g key={k}>
					<circle cx={890 + (k % 2) * 60} cy={760 + Math.floor(k / 2) * 62} r={18} fill="#e8ecef" />
					<text x={890 + (k % 2) * 60} y={768 + Math.floor(k / 2) * 62} fontSize={20} fontFamily={SANS} fontWeight={800} fill="#555" textAnchor="middle">
						{9 - k}
					</text>
				</g>
			))}
			<circle cx={920} cy={1080} r={34} fill={RED} opacity={alarm ? 0.5 : 0.15} />
			<circle cx={920} cy={1080} r={22} fill={alarm ? '#ff5a4f' : '#a8241c'} />
			<path d="M 910,1090 q 10,-28 20,0 Z" fill="#fff" />
		</g>
	);
};

// cutaway: the shaft between the 3rd and the 2nd floor, the cabin stuck in the middle
const Cutaway: React.FC<{f: number; id: string; cabinY: number}> = ({f, id, cabinY}) => {
	const alarm = Math.floor(f / 5) % 2 === 0;
	const storeys: [string, number, number][] = [
		['4', -400, 180],
		['3', 220, 780],
		['2', 820, 1360],
		['1', 1400, 1940],
	];
	return (
		<g>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#141824" />
			{storeys.map(([n, top, bottom]) => (
				<g key={n}>
					<rect x={-400} y={top} width={940} height={bottom - top} fill="#e6e9dd" />
					<rect x={-400} y={top + (bottom - top) * 0.62} width={940} height={(bottom - top) * 0.38} fill="#5f9a83" />
					<text x={110} y={bottom - 40} fontSize={150} fontFamily={HEAVY} fontWeight={900} fill={n === '3' || n === '2' ? '#2f5a48' : '#9fb8ad'} textAnchor="middle">
						{n}
					</text>
					<rect x={920} y={top} width={560} height={bottom - top} fill="#1d2230" />
				</g>
			))}
			{[180, 780, 1360, 1940].map((y) => (
				<g key={y}>
					<rect x={-400} y={y} width={940} height={40} fill="#8a8f99" />
					<rect x={920} y={y} width={560} height={40} fill="#3a404d" />
				</g>
			))}
			<rect x={560} y={-400} width={340} height={2800} fill="#232833" />
			<rect x={540} y={-400} width={20} height={2800} fill="#8a8f99" />
			<rect x={900} y={-400} width={20} height={2800} fill="#8a8f99" />
			{/* landing doors on the 3rd and 2nd floor */}
			<rect x={540} y={480} width={20} height={300} fill="#c4ccd4" />
			<rect x={540} y={1060} width={20} height={300} fill="#c4ccd4" />
			{/* you, on the 3rd floor */}
			<Person kind="teen" id={`${id}son`} x={330} y={780} scale={0.28} backpack face={{eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.9, 0]}} headTurn={0.6} />
			{/* cables + cabin */}
			<line x1={705} y1={-400} x2={705} y2={cabinY} stroke="#9aa0aa" strokeWidth={5} />
			<line x1={755} y1={-400} x2={755} y2={cabinY} stroke="#9aa0aa" strokeWidth={5} />
			<rect x={590} y={cabinY} width={280} height={290} fill="#c9a77a" stroke="#4a4f59" strokeWidth={10} />
			<rect x={650} y={cabinY + 14} width={160} height={12} rx={4} fill={Math.floor(f / 4) % 3 === 0 ? '#6a6458' : '#fffbe8'} />
			<Neighbour id={`${id}nb`} x={700} y={cabinY + 282} scale={0.22} bark={0} face={{eyes: 'wide', mouth: 'o', brows: 'worried'}} />
			<circle cx={730} cy={cabinY - 14} r={50} fill={RED} opacity={alarm ? 0.35 : 0} />
			<circle cx={730} cy={cabinY - 14} r={14} fill={alarm ? '#ff5a4f' : '#6a1a14'} />
			{f < 16 &&
				[590, 870].map((cx) =>
					Array.from({length: 7}).map((_, k) => {
						const a = -Math.PI / 2 + (k - 3) * 0.38;
						const r0 = 10 + f * 6;
						return <line key={`${cx}-${k}`} x1={cx + Math.cos(a) * r0} y1={cabinY + Math.sin(a) * r0} x2={cx + Math.cos(a) * (r0 + 22)} y2={cabinY + Math.sin(a) * (r0 + 22)} stroke={YELLOW} strokeWidth={5} strokeLinecap="round" opacity={1 - f / 16} />;
					}),
				)}
		</g>
	);
};

// gym (PE lesson)
const Gym: React.FC<{ball?: {x: number; y: number; s: number; rot: number}; shadow?: number}> = ({ball, shadow = 1}) => (
	<g>
		<rect x={-400} y={-400} width={1880} height={1300} fill="#dfe6d8" />
		<rect x={-400} y={900} width={1880} height={560} fill="#8fb3a0" />
		<rect x={-400} y={895} width={1880} height={10} fill="#6f9482" />
		{[100, 430, 760].map((wx) => (
			<g key={wx}>
				<rect x={wx} y={250} width={230} height={190} fill="url(#sky)" />
				<rect x={wx} y={250} width={230} height={190} fill="none" stroke="#f4efe6" strokeWidth={12} />
				<rect x={wx + 109} y={250} width={12} height={190} fill="#f4efe6" />
			</g>
		))}
		{[60, 160, 260].map((bx) => (
			<rect key={bx} x={bx} y={520} width={16} height={940} fill="#b9773d" />
		))}
		{Array.from({length: 14}).map((_, k) => (
			<rect key={k} x={60} y={560 + k * 64} width={216} height={10} rx={5} fill="#d39a5c" />
		))}
		<rect x={690} y={470} width={300} height={190} rx={6} fill="#f7f7f2" stroke="#c0392b" strokeWidth={8} />
		<rect x={790} y={560} width={100} height={80} fill="none" stroke="#c0392b" strokeWidth={6} />
		<path d="M 770,680 L 790,770 M 810,680 L 815,770 M 840,680 L 840,770 M 870,680 L 865,770 M 910,680 L 890,770" stroke="#f4f4f4" strokeWidth={5} />
		<ellipse cx={840} cy={680} rx={74} ry={14} fill="none" stroke="#e8541e" strokeWidth={9} />
		<PlankFloor y={1460} color="#d29a5a" seam="#b9844a" />
		<ellipse cx={540} cy={1720} rx={540} ry={120} fill="none" stroke="#f4f1ec" strokeWidth={10} opacity={0.8} />
		{ball && (
			<g>
				<ellipse cx={ball.x} cy={1480} rx={70 * Math.min(ball.s, 1)} ry={14 * Math.min(ball.s, 1)} fill="#000" opacity={0.25 * shadow} />
				<g transform={`translate(${ball.x},${ball.y}) scale(${ball.s}) rotate(${ball.rot})`}>
					<circle r={86} fill="#e8742a" />
					<path d="M -86,0 L 86,0 M 0,-86 L 0,86" stroke="#4a220c" strokeWidth={6} />
					<path d="M -60,-62 C -20,-30 -20,30 -60,62 M 60,-62 C 20,-30 20,30 60,62" stroke="#4a220c" strokeWidth={6} fill="none" />
					<circle r={86} fill="none" stroke="#4a220c" strokeWidth={4} />
				</g>
			</g>
		)}
	</g>
);

// "vision of tomorrow": red tint, scan lines, jumps, a timestamp
const Vision: React.FC<{f: number; label: string; children: React.ReactNode}> = ({f, label, children}) => {
	const jump = Math.floor(f / 3) % 7 === 3 ? 14 : 0;
	const flash = interpolate(f, [0, 6], [0.8, 0], clamp);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translateX(${jump}px)`, filter: 'saturate(0.6) contrast(1.15)'}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{background: '#ff2a1f', mixBlendMode: 'multiply', opacity: 0.45}} />
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 6px)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(50,0,0,0.85) 100%)'}} />
			<div style={{position: 'absolute', left: 40, top: 236, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#ff8a80', textShadow: '0 0 12px rgba(255,60,50,0.9)', opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0.6}}>
				● {label}
			</div>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// red "no entry" sign stamped over something (screen coords)
const NoSign: React.FC<{p: number; x: number; y: number; r: number}> = ({p, x, y, r}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -30}deg)`, opacity: Math.min(1, p * 2)}}>
			<svg width={2 * r} height={2 * r} viewBox="-100 -100 200 200" style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
				<circle r={84} fill="none" stroke={RED} strokeWidth={20} />
				<line x1={-59} y1={-59} x2={59} y2={59} stroke={RED} strokeWidth={20} />
			</svg>
		</div>
	) : null;

// big close-up of your face, lit by the phone
const FaceClose: React.FC<{t: number; id: string; face: Face; red?: number; zoom?: [number, number]}> = ({t, id, face, red = 0, zoom = [1, 1.1]}) => (
	<Stage cam={{s: lerp(t, 0, 45, zoom[0], zoom[1]) * kick(t), cx: 540, cy: 960}} light={{glow: 0, vignette: 0.85}} bg="#05070f">
		<rect x={-500} y={-500} width={2200} height={3000} fill="#1c2747" />
		<Bust kind="teen" id={id} x={540} y={1000} scale={6.6} face={{blush: false, ...face}} />
		<rect x={-500} y={-500} width={2200} height={3000} fill={NIGHT} opacity={0.35} />
		<PhoneLight id={`${id}pl`} x={640} y={1900} r={1300} />
		{red > 0 && <rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={red} />}
	</Stage>
);

// ============================================================== SHOTS =======
// 1. 23:41, the phone lights up on the bedside table → lock screen: «Мой номер».
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [68]);
	if (i === 0) {
		const buzz = (t >= 8 && t < 22) || (t >= 30 && t < 44);
		return (
			<Stage cam={{s: lerp(t, 0, 68, 1.05, 1.15), cx: 560, cy: 1130}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<Bedroom f={t} id="g1s1" glow={interpolate(t, [8, 12], [0, 1], clamp)} buzz={buzz} eyes={t < 26 ? 'closed' : 'open'} />
			</Stage>
		);
	}
	const buzz = t >= 4 && t < 18;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + (buzz ? Math.sin(t * 2.9) * 8 : 0)} y={1000} w={680} scale={lerp(t, 0, 61, 1.0, 1.1) * kick(t)}>
				<LockScreen notif={pop(t, 4, 12)} ring={pop(t, 30, 12)} />
			</Phone>
		</AbsoluteFill>
	);
};

// 2. You press play… → your own voice: your eyes go wide.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		const rip = interpolate(t, [26, 42], [0, 1], clamp);
		const touch = t >= 20 && t < 32;
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={540} y={1000} w={680} scale={lerp(t, 0, 62, 1.0, 1.12) * kick(t)}>
					<ChatScreen time="23:41">
						<VoiceBubble top={250} f={t} progress={t >= 28 ? interpolate(t, [28, 62], [0.01, 0.16], clamp) : 0} lvl={t >= 30 ? 0.5 + 0.5 * Math.abs(Math.sin(t / 3)) : 0} />
					</ChatScreen>
					{touch && <div style={{position: 'absolute', left: 94 - 40, top: 318 - 40, width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.45)'}} />}
					{rip > 0 && rip < 1 && (
						<div style={{position: 'absolute', left: 94 - 80 * rip, top: 318 - 80 * rip, width: 160 * rip, height: 160 * rip, borderRadius: '50%', border: '6px solid #fff', opacity: 1 - rip, boxSizing: 'border-box'}} />
					)}
				</Phone>
			</AbsoluteFill>
		);
	}
	return (
		<FaceClose
			t={t}
			id="g1s2"
			face={{
				eyes: t < 7 ? 'open' : 'wide',
				pupil: interpolate(t, [24, 36], [1, 0.45], {...clamp, easing: Easing.out(Easing.cubic)}),
				look: [0.15, 0.5],
				brows: t < 7 ? 'neutral' : 'raised',
				mouth: t < 26 ? 'flat' : 'o',
			}}
		/>
	);
};

// 3. The voice message plays: «…в 8:15 не садись в лифт» → vision of tomorrow.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [68]);
	if (i === 0) {
		const s = lerp(t, 0, 68, 1.55, 1.72) * kick(t, 0.05);
		const p = focus(680, 304, 330, 540, 760, s);
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="23:41">
						<VoiceBubble top={250} f={t} progress={interpolate(t, [6, 132], [0.14, 0.98], clamp)} lvl={level('g03', t - 6)} />
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	const c: Cam = {s: lerp(t, 0, 70, 1.05, 1.16), cx: 690, cy: 1000};
	const sp = toScreen(c, 690, 1050);
	return (
		<Vision f={t} label="ЗАВТРА · 08:15">
			<Stage cam={c} light={{glow: 0.1, vignette: 0.6}} bg="#000">
				<LiftLanding f={t} id="g1s3" floor="1" win={false} />
			</Stage>
			<NoSign p={pop(t, 36, 9)} x={sp.x} y={sp.y} r={250} />
		</Vision>
	);
};

// 4. Sent at 23:59 (circled) → the alarm clock: it is 23:41 now.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [106]);
	if (i === 0) {
		const z = lerp(t, 4, 46, 0, 1, Easing.inOut(Easing.cubic));
		const s = (1 + 0.75 * z + 0.002 * Math.max(0, t - 50)) * (t >= 50 ? kick(t - 50, 0.06) : 1);
		const p = focus(680, 512, 387, 728 + (680 - 728) * z, 706 + (760 - 706) * z, s);
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="23:41">
						<VoiceBubble top={250} f={t} progress={1} ring={pop(t, 50, 10)} />
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	const colon = Math.floor(f / 15) % 2 === 0;
	const sent = pop(t, 2, 12);
	const now = pop(t, 7, 10);
	return (
		<Stage
			cam={{s: lerp(t, 0, 74, 1.0, 1.08) * kick(t) * (t >= 27 ? kick(t - 27, 0.06) : 1), cx: 540, cy: 940}}
			light={{glow: 0, vignette: 0.85}}
			bg="#05070f"
			overlay={
				<>
					<div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', transform: `scale(${sent})`}}>
						<span style={{display: 'inline-block', background: RED, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 46, borderRadius: 16, padding: '10px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>ОТПРАВЛЕНО: 23:59</span>
					</div>
					<div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 58, color: '#fff', letterSpacing: 6, transform: `scale(${now})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>СЕЙЧАС</div>
				</>
			}
		>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#1a2140" />
			<rect x={-400} y={1130} width={1880} height={1300} fill="#3d2a20" />
			<rect x={-400} y={1130} width={1880} height={14} fill="#53392b" />
			<rect x={150} y={680} width={780} height={430} rx={60} fill="#121317" />
			<rect x={182} y={712} width={716} height={366} rx={40} fill="#08080a" />
			<text x={540} y={975} fontSize={220} fontFamily={MONO} fontWeight={700} fill={RED} textAnchor="middle" style={{filter: 'drop-shadow(0 0 18px rgba(255,59,48,0.8))'}}>
				{`23${colon ? ':' : ' '}41`}
			</text>
			<rect x={-400} y={-400} width={1880} height={2800} fill={NIGHT} opacity={0.15} />
		</Stage>
	);
};

// 5. «Кто это?» → «Ты. Просто не садись.» (sent at 23:59 again).
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const typed = 'Кто это?'.slice(0, Math.max(0, Math.min(8, Math.floor((f - 6) / 2))));
	const sent = f >= 24;
	const typing = f >= 40 && f < 88;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540} y={1000} w={680} scale={lerp(f, 0, 138, 1.06, 1.16) * kick(f) * (f >= 88 ? kick(f - 88, 0.05) : 1)}>
				<ChatScreen time="23:41" typing={typing} input={sent ? '' : typed} caret={!sent && Math.floor(f / 8) % 2 === 0}>
					<VoiceBubble top={250} f={f} progress={1} />
					{sent && <TextBubble out top={440} text="Кто это?" time="23:41" p={pop(f, 24, 11)} />}
					{typing && <TypingDots f={f} top={570} />}
					{f >= 88 && <TextBubble top={570} text="Ты. Просто не садись." time="23:59" p={pop(f, 88, 11)} timeRed />}
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 6. Morning, 8:14, you're late: you run to the lift, the doors open.
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const running = f < 50;
	const x = lerp(f, 0, 50, -160, 320, Easing.out(Easing.quad));
	return (
		<Stage cam={{s: lerp(f, 0, 135, 1.0, 1.12) * kick(f), cx: 600, cy: 1000}} light={{glow: 0.35, vignette: 0.5}} bg="#e6e9dd">
			<LiftLanding f={f} id="g1s6" open={lerp(f, 92, 122, 0, 1)} floor={f < 34 ? '5' : f < 64 ? '6' : '7'} btn />
			<Person
				kind="teen"
				id="g1s6son"
				x={x}
				y={1490}
				scale={0.95}
				backpack
				walk={running ? f * 0.62 : undefined}
				breathe={running ? undefined : f}
				headTurn={running ? 0 : 0.5}
				face={running ? {eyes: 'open', brows: 'worried', mouth: 'open', look: [0.6, 0]} : {eyes: 'open', brows: 'worried', mouth: 'flat', look: [0.9, -0.1]}}
			/>
		</Stage>
	);
};

// 7. The voice in your head → you take the stairs.
const Echo: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		{[
			{x: 540, y: 340, s: 0.78, d: 0},
			{x: 580, y: 480, s: 0.62, d: 8},
			{x: 500, y: 610, s: 0.5, d: 16},
		].map((e, k) => {
			const p = interpolate(f - e.d, [0, 30], [0, 1], clamp);
			return (
				<div
					key={k}
					style={{
						position: 'absolute',
						left: e.x,
						top: e.y - p * 40,
						transform: `translate(-50%,-50%) scale(${e.s * (0.9 + 0.2 * p)})`,
						opacity: Math.sin(Math.PI * p) * 0.8,
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 64,
						color: YELLOW,
						whiteSpace: 'nowrap',
						textShadow: '0 5px 0 rgba(0,0,0,0.35), 3px 3px 0 #22222a, -3px 3px 0 #22222a, 3px -3px 0 #22222a, -3px -3px 0 #22222a',
						filter: k > 0 ? 'blur(1px)' : undefined,
					}}
				>
					«НЕ САДИСЬ В ЛИФТ»
				</div>
			);
		})}
	</AbsoluteFill>
);
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Stage cam={{s: lerp(t, 0, 56, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.75}} bg="#e6e9dd">
					<rect x={-500} y={-500} width={2200} height={3000} fill="#e6e9dd" />
					<rect x={-500} y={1250} width={1100} height={1300} fill="#5f9a83" />
					<rect x={640} y={150} width={900} height={2000} fill="#f4e2b4" />
					<rect x={760} y={150} width={8} height={2000} fill="#e2cd98" />
					<rect x={600} y={150} width={40} height={2000} fill="#8b939c" />
					<Bust kind="teen" id="g1s7" x={450} y={1080} scale={4.8} turn={0.35} face={{eyes: 'open', look: [0.9, 0], brows: 'worried', mouth: 'flat', blush: false}} />
				</Stage>
				<Echo f={t} />
			</AbsoluteFill>
		);
	}
	const x = lerp(t, 0, 37, 860, 430, Easing.linear);
	const y = x >= 700 ? 1200 : 1200 + (700 - x) * (400 / 450);
	return (
		<Stage cam={{s: 0.95 * kick(t), cx: lerp(t, 0, 37, 640, 570), cy: 1130}} light={{glow: 0.3, vignette: 0.55}} bg="#e6e9dd">
			<Stairs stencil="6" />
			<Person kind="teen" id="g1s7son" x={x} y={y} scale={0.85} backpack walk={t * 0.45} face={{eyes: 'open', brows: 'worried', mouth: 'flat', look: [-0.6, 0.3]}} />
			<Railing />
		</Stage>
	);
};

// 8. 3rd floor. CRASH. → cutaway: the cabin stuck between the floors.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [50]);
	if (i === 0) {
		const hit = t >= 34;
		const [sx, sy] = shake(t, 34, 26, 14);
		const bump = hit ? Math.exp(-(t - 34) / 4) : 0;
		return (
			<Stage cam={{s: 1.05 * kick(t), cx: 560 + sx, cy: 1000 + sy}} light={{glow: 0.3, vignette: 0.6}} bg="#e6e9dd">
				<LiftLanding f={t} id="g1s8" floor={t < 14 ? '5' : t < 26 ? '4' : '3'} err={hit} win={false} stencil="3" jolt={hit ? Math.sin(t * 3) * 8 * bump : 0} />
				<Person
					kind="teen"
					id="g1s8son"
					x={400}
					y={1490 - 30 * bump}
					scale={0.95}
					backpack
					breathe={t}
					headTurn={0.5}
					face={hit ? {eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: 'o', look: [0.9, -0.2]} : {eyes: 'open', brows: 'neutral', mouth: 'flat', look: [0.9, -0.3]}}
				/>
				{hit && <Dust t={t - 34} />}
				{hit && <rect x={-400} y={-400} width={1880} height={2800} fill="#fff" opacity={interpolate(t, [34, 40], [0.55, 0], clamp)} />}
			</Stage>
		);
	}
	const fall = t < 6 ? -40 + (40 * t) / 6 : 10 * Math.sin((t - 6) * 1.1) * Math.exp(-(t - 6) / 7);
	return (
		<Stage cam={{s: lerp(t, 0, 58, 1.0, 1.06) * kick(t), cx: 540, cy: 805}} light={{glow: 0, vignette: 0.7}} bg="#141824">
			<Cutaway f={t} id="g1s8b" cabinY={650 + fall} />
		</Stage>
	);
};

// 9. Inside: the neighbour and her dog, the light flickers, the alarm button.
const Flicker: React.FC<{f: number}> = ({f}) => {
	const off = f % 23 < 3 || (f % 41 > 33 && f % 41 < 37);
	return (
		<>
			<rect x={-400} y={-400} width={1880} height={2800} fill="#000" opacity={off ? 0.5 : 0.08} />
			<rect x={-400} y={-400} width={1880} height={2800} fill={RED} opacity={Math.floor(f / 5) % 2 === 0 ? 0.08 : 0} />
		</>
	);
};
const Gav: React.FC<{f: number; at: number; x: number; y: number; size?: number}> = ({f, at, x, y, size = 80}) =>
	f >= at && f < at + 22 ? (
		<text x={x} y={y} fontSize={size} fontFamily={HEAVY} fontWeight={900} fill="#fff" stroke="#22222a" strokeWidth={8} paintOrder="stroke" textAnchor="middle" transform={`rotate(-8 ${x} ${y}) scale(1)`} opacity={interpolate(f, [at + 14, at + 22], [1, 0], clamp)}>
			ГАВ!
		</text>
	) : null;
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [48]);
	const barking = (a: number) => (t >= a && t < a + 6 ? 1 : t >= a + 9 && t < a + 14 ? 0.8 : 0);
	if (i === 0) {
		return (
			<Stage cam={{s: lerp(t, 0, 48, 1.0, 1.06) * kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.7}} bg="#2a2018">
				<Cabin f={f} />
				<Neighbour id="g1s9nb" x={470} y={1650} scale={1.0} bark={barking(20)} breathe={t} face={{eyes: 'wide', brows: 'worried', mouth: 'wobble', look: [0.1, 0.2]}} />
				<Gav f={t} at={20} x={250} y={820} />
				<Flicker f={f} />
			</Stage>
		);
	}
	return (
		<Stage cam={{s: lerp(t, 0, 48, 1.0, 1.08) * kick(t), cx: 540, cy: 960}} light={{glow: 0.2, vignette: 0.75}} bg="#2a2018">
			<rect x={-400} y={-400} width={1880} height={2800} fill="#c9a77a" />
			{[-200, 100, 400, 700, 1000].map((px) => (
				<rect key={px} x={px} y={-400} width={8} height={2800} fill="#b8956a" />
			))}
			<Bust kind="mom" id="g1s9nbc" colors={NEIGHBOUR} x={660} y={780} scale={2.9} face={{eyes: 'wide', brows: 'worried', mouth: 'wobble', look: [-0.4, 0.2], blush: false}} />
			<g transform="translate(330,1120) scale(2.1)">
				<Dog bark={barking(14)} />
			</g>
			<Gav f={t} at={14} x={300} y={760} size={110} />
			<Gav f={t} at={23} x={430} y={640} size={86} />
			<Flicker f={f} />
		</Stage>
	);
};

// 10. You open the chat: the voice message glitches away. «Сообщений нет».
const DayBlur: React.FC = () => (
	<Stage cam={{s: 1, cx: 540, cy: 960}} light={{glow: 0.3, vignette: 0.6}} bg="#e6e9dd">
		<g style={{filter: 'blur(16px)'}}>
			<rect x={-200} y={-200} width={1500} height={1300} fill="#e6e9dd" />
			<rect x={-200} y={1100} width={1500} height={1200} fill="#5f9a83" />
			<WindowBox x={640} y={300} w={360} h={460} sky="url(#skyMorning)" curtain={false} />
		</g>
		<rect x={-200} y={-200} width={1500} height={2400} fill="#000" opacity={0.3} />
	</Stage>
);
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const G0 = 40;
	const G1 = 62;
	const msgs = (
		<>
			<VoiceBubble top={250} f={f} progress={1} />
			<TextBubble out top={440} text="Кто это?" time="23:41" />
			<TextBubble top={570} text="Ты. Просто не садись." time="23:59" timeRed />
		</>
	);
	const glitching = f >= G0 && f < G1;
	return (
		<AbsoluteFill>
			<DayBlur />
			<Phone x={540 + (glitching ? (rnd(f) - 0.5) * 18 : 0)} y={1000} w={680} scale={lerp(f, 0, 105, 1.04, 1.14) * kick(f)}>
				<ChatScreen time="08:21">
					{f < G0 && msgs}
					{glitching && (
						<Glitch f={f} from={G0} to={G1}>
							{msgs}
						</Glitch>
					)}
					{f >= G1 && <Empty p={interpolate(f, [G1, G1 + 10], [0, 1], clamp)} />}
				</ChatScreen>
			</Phone>
		</AbsoluteFill>
	);
};

// 11. Night again, 23:41 on the clock, the phone buzzes → «Мой номер» again.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [100]);
	if (i === 0) {
		const z = lerp(t, 56, 70, 0, 1, Easing.inOut(Easing.cubic));
		const punch = t >= 21 && t < 38 ? kick(t - 21, 0.06) : 1;
		const buzz = (t >= 70 && t < 84) || (t >= 88 && t < 100);
		return (
			<Stage cam={{s: (2.5 + (1.12 - 2.5) * z) * punch, cx: 865 + (575 - 865) * z, cy: 1135 + (1130 - 1135) * z}} light={{glow: 0, vignette: 0.8}} bg="#05070f">
				<Bedroom f={t} id="g1s11" glow={interpolate(t, [70, 74], [0, 1], clamp)} buzz={buzz} eyes={t < 76 ? 'open' : 'wide'} />
			</Stage>
		);
	}
	const buzz = t >= 2 && t < 16;
	return (
		<AbsoluteFill style={{background: PHONE_BG}}>
			<Phone x={540 + (buzz ? Math.sin(t * 2.9) * 8 : 0)} y={1000} w={680} scale={lerp(t, 0, 38, 1.0, 1.1) * kick(t)}>
				<LockScreen notif={pop(t, 2, 12)} ring={pop(t, 16, 12)} />
			</Phone>
		</AbsoluteFill>
	);
};

// 12. Second message: «Завтра на физре не трогай мяч…» → vision: the gym, the ball.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [24, 86]);
	if (i === 0) {
		const s = lerp(t, 0, 24, 1.55, 1.62) * kick(t, 0.05);
		const p = focus(680, 304, 330, 540, 760, s);
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="23:41">
						<VoiceBubble top={250} f={t} progress={interpolate(t, [6, 119], [0.04, 0.98], clamp)} lvl={level('g12', t - 6)} />
					</ChatScreen>
				</Phone>
			</AbsoluteFill>
		);
	}
	if (i === 2) return <FaceClose t={t} id="g1s12c" zoom={[1.0, 1.08]} face={{eyes: 'open', look: [-0.85, 0.15], brows: 'worried', mouth: 'flat'}} />;
	// the ball bounces once (t = 14) and flies at you, then hangs in front of you
	const fly = interpolate(t, [14, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const bs = 0.6 + 1.7 * fly + 0.002 * Math.max(0, t - 30);
	const bx = t < 14 ? 990 - 6 * t : 906 + (540 - 906) * fly;
	const floorY = 1460 + 40 * 0.6 - 86 * 0.6;
	const by = t < 14 ? floorY - (14 - t) ** 2 * 2.2 : floorY + (760 - floorY) * fly + (t > 30 ? 10 * Math.sin((t - 30) / 7) : 0);
	const c: Cam = {s: lerp(t, 0, 83, 1.0, 1.06), cx: 540, cy: 960};
	const sp = toScreen(c, bx, by);
	return (
		<Vision f={t} label="ЗАВТРА · ФИЗРА">
			<Stage cam={c} light={{glow: 0.2, vignette: 0.6}} bg="#000">
				<Gym ball={{x: bx, y: by, s: bs, rot: t * 7 - Math.max(0, t - 30) * 5}} shadow={1 - fly} />
			</Stage>
			<NoSign p={pop(t, 34, 9)} x={sp.x} y={sp.y} r={250} />
		</Vision>
	);
};

// 13. At the very end of the recording — a whisper. Not your voice.
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		const s = lerp(t, 0, 62, 1.7, 1.95);
		const sh = t >= 44 ? (rnd(t) - 0.5) * 10 : 0;
		const p = focus(680, 304, 330, 540 + sh, 760, s);
		const progress = interpolate(t, [0, 50], [0.86, 1], clamp);
		return (
			<AbsoluteFill style={{background: PHONE_BG}}>
				<Phone x={p.x} y={p.y} w={680} scale={s}>
					<ChatScreen time="23:42">
						<VoiceBubble top={250} f={t} progress={progress} lvl={t >= 40 ? 0.15 + 0.15 * rnd(t) : 0.3 + 0.3 * Math.abs(Math.sin(t / 2))} redTail={interpolate(t, [36, 56], [0, 1], clamp)} />
					</ChatScreen>
				</Phone>
				<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 35%, rgba(90,0,0,0.85) 100%)', opacity: interpolate(t, [30, 58], [0, 1], clamp)}} />
			</AbsoluteFill>
		);
	}
	return (
		<FaceClose
			t={t}
			id="g1s13"
			red={interpolate(t, [0, 20], [0.5, 0.95], clamp)}
			zoom={[1.05, 1.2]}
			face={{eyes: 'wide', pupil: interpolate(t, [4, 16], [0.9, 0.3], {...clamp, easing: Easing.out(Easing.cubic)}), look: [0.1, 0.4], brows: 'worried', mouth: 'o', sweat: 1}}
		/>
	);
};

// 14. Finale: obey yourself from tomorrow, or take the ball? Countdown, end card.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 80, 11);
	const nums = [
		{n: '3', at: 150},
		{n: '2', at: 180},
		{n: '1', at: 210},
	];
	const cur = [...nums].reverse().find((x) => f >= x.at);
	const final = f >= 236;
	const fp = pop(f, 236, 9);
	const pulse = final ? 1 + Math.sin((f - 236) / 4) * 0.03 : 1;
	const counting = f >= 150 && f < 236;
	const hot = counting ? (Math.floor((f - 150) / 15) % 2 === 0 ? 1 : 2) : 0;
	const endCard = interpolate(f, [252, 260], [0, 1], clamp);
	const card = (p: number, top: number, num: string, text: string, color: string, sub: string, idx: number) => (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top,
				width: 720,
				transform: `translateX(${(1 - p) * -800}px) scale(${pulse * (hot === idx ? 1.04 : 1)})`,
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
			<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 54, color: '#fff', lineHeight: 1.08}}>
				{text}
				<div style={{fontSize: 30, color: hot === idx ? '#fff' : color, marginTop: 6}}>{sub}</div>
			</div>
		</div>
	);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 300, 1.0, 1.1), cx: 540, cy: 1000}} light={{glow: 0, vignette: 0.9}} bg="#05070f">
				<Gym />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#000" opacity={0.62} />
				<path d="M 800,-100 L 940,-100 L 1110,1640 L 630,1640 Z" fill="#fff6d8" opacity={0.07} />
				<ellipse cx={870} cy={1620} rx={210} ry={40} fill="#fff6d8" opacity={0.12} />
				<g transform={`translate(870,${1534 - Math.abs(Math.sin(f / 9)) * 30}) scale(1.0) rotate(${f * 0.6})`}>
					<circle r={86} fill="#e8742a" />
					<path d="M -86,0 L 86,0 M 0,-86 L 0,86" stroke="#4a220c" strokeWidth={6} />
					<path d="M -60,-62 C -20,-30 -20,30 -60,62 M 60,-62 C 20,-30 20,30 60,62" stroke="#4a220c" strokeWidth={6} fill="none" />
				</g>
			</Stage>
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 86, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 0 #6b4a00, 0 0 30px rgba(255,211,74,0.45)'}}>
				ЧТО <span style={{color: YELLOW}}>ВЫБЕРЕШЬ?</span>
				<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18}}>
					<span style={{fontSize: 34, color: YELLOW, marginRight: 8}}>СБЫЛОСЬ</span>
					{[0, 1].map((k) => (
						<div
							key={k}
							style={{
								width: 96,
								height: 56,
								borderRadius: 12,
								background: k === 0 ? YELLOW : `rgba(255,211,74,${0.18 + 0.12 * Math.sin(f / 5)})`,
								border: `3px solid ${k === 0 ? '#fff3c4' : YELLOW}`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `scale(${pop(f, 18 + k * 4, 9) * (k === 1 ? 1 + 0.06 * Math.sin(f / 5) : 1)})`,
								boxSizing: 'border-box',
								fontSize: 44,
								color: YELLOW,
								textShadow: 'none',
							}}
						>
							{k === 0 ? (
								<svg width={34} height={34} viewBox="0 0 24 24">
									<path d="M 4,13 L 10,19 L 20,5" stroke="#111" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							) : (
								'?'
							)}
						</div>
					))}
				</div>
			</div>
			{card(c1, 680, '1', 'ПОСЛУШАТЬСЯ', '#3b82f6', 'и не трогать мяч', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: YELLOW, opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ВЗЯТЬ МЯЧ', '#e0342b', 'и проверить, что будет', 2)}
			{cur && !final && (
				<div
					style={{
						position: 'absolute',
						left: 420,
						top: 1340,
						width: 200,
						height: 200,
						marginLeft: -100,
						borderRadius: 100,
						background: YELLOW,
						border: '8px solid #111',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 140,
						color: '#111',
						transform: `scale(${pop(f, cur.at, 8) * interpolate(f, [cur.at + 22, cur.at + 30], [1, 0.6], clamp)})`,
					}}
				>
					{cur.n}
				</div>
			)}
			{final && (
				<div style={{position: 'absolute', left: 40, width: 760, top: 1290, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${fp})`}}>
					<div style={{fontSize: 96, color: YELLOW, textShadow: '0 6px 0 #000'}}>ВЫБИРАЙ!</div>
					<div style={{fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000', marginTop: 6}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
				</div>
			)}
			{endCard > 0 && (
				<AbsoluteFill style={{opacity: endCard, background: 'radial-gradient(circle at 50% 42%, #1d2a55 0%, #0a1024 55%, #04060d 100%)'}}>
					<div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{fontSize: 40, letterSpacing: 8, color: YELLOW}}>ГОЛОСОВЫЕ ИЗ ЗАВТРА</div>
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>СЕРИЯ 2</div>
						<div style={{fontSize: 56, color: RED, marginTop: 8}}>СКОРО</div>
						<div style={{display: 'inline-block', marginTop: 50, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 30px', fontSize: 38}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
						<div style={{fontSize: 30, color: '#9fb0d6', marginTop: 30, letterSpacing: 1}}>
							ЛИФТ — <span style={{color: '#7ee08a'}}>СБЫЛОСЬ</span> · МЯЧ — <span style={{color: YELLOW}}>ПОД ВОПРОСОМ</span>
						</div>
						<div style={{display: 'inline-block', marginTop: 46, background: '#ff2d3d', borderRadius: 60, padding: '22px 70px', fontSize: 52, color: '#fff', boxShadow: '0 0 40px rgba(255,45,61,0.6)', transform: `scale(${1 + Math.sin(f / 5) * 0.04})`}}>
							ПОДПИШИСЬ
						</div>
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};
