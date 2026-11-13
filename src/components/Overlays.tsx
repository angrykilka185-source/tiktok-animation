import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Sign, SIGN_FLY} from '../timeline';
import {CapChunk, CapWord} from '../voiceCore';

const HEAVY = "'Montserrat', 'DejaVu Sans', sans-serif";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// Everything an episode needs for its HUD and plaques.
export type Episode = {
	clock: {from: number; text: string}[];
	signs: Sign[];
	slots: number; // number of boxes in the "ОН ИЛИ НЕ ОН?" counter
	counterFrom: number; // frame when the counter slides in
	hideFrom: number; // frame when the HUD fades out (end card)
	night: [number, number][]; // frame ranges with the night colour on the clock
	prefilled?: number; // boxes already filled at the start (signs from earlier parts)
	counterTitle?: string; // default «ОН ИЛИ НЕ ОН?»
	mark?: 'cross' | 'check'; // what a filled box shows
	accent?: string; // colour of the counter frame / filled boxes
	plaqueLabel?: string; // default «ПРИЗНАК»
	pending?: {n: number; at: number}[]; // boxes that show «?» from frame `at` (not checked yet)
};

// ------------------------------- HUD ---------------------------------------
const COUNTER_X = 1040; // right edge
const COUNTER_Y = 96;
const geom = (slots: number) => {
	if (slots <= 3) {
		// few wide boxes in a compact counter
		const gap = 16;
		const boxW = 300;
		return {w: (boxW - 44 - (slots - 1) * gap) / slots, gap, boxW, left: COUNTER_X - boxW};
	}
	const w = slots > 9 ? 26 : slots > 6 ? 34 : 44;
	const gap = slots > 9 ? 6 : slots > 6 ? 9 : 16;
	const boxW = slots > 6 ? 44 + slots * w + (slots - 1) * gap : 404;
	return {w, gap, boxW, left: COUNTER_X - boxW};
};
export const slotPos = (slots: number, n: number) => {
	const g = geom(slots);
	return {x: g.left + 4 + 18 + (n - 1) * (g.w + g.gap) + g.w / 2, y: COUNTER_Y + 70};
};

export const signsDone = (signs: Sign[], f: number, prefilled = 0) => prefilled + signs.filter((s) => s.n > prefilled && f >= s.at + s.hold + SIGN_FLY).length;

export const HUD: React.FC<{ep: Episode}> = ({ep}) => {
	const f = useCurrentFrame();
	let idx = 0;
	ep.clock.forEach((c, i) => {
		if (f >= c.from) idx = i;
	});
	const clock = ep.clock[idx];
	const flip = pop(f, clock.from, 14);
	const dot = Math.floor(f / 15) % 2 === 0;
	const showCounter = f >= ep.counterFrom;
	const cIn = pop(f, ep.counterFrom, 13);
	const done = signsDone(ep.signs, f, ep.prefilled ?? 0);
	const night = ep.night.some(([a, b]) => f >= a && f < b);
	const hudIn = pop(f, 8, 13);
	const hudOut = interpolate(f, [ep.hideFrom, ep.hideFrom + 8], [1, 0], clamp);
	const g = geom(ep.slots);

	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: hudOut}}>
			{/* clock */}
			<div
				style={{
					position: 'absolute',
					left: 18,
					top: COUNTER_Y,
					transform: `translateX(${(1 - hudIn) * -420}px) scaleY(${idx === 0 ? 1 : 0.6 + 0.4 * flip})`,
					transformOrigin: 'left center',
					background: 'rgba(14,14,16,0.88)',
					border: '4px solid #e7c44a',
					borderRadius: 14,
					padding: '10px 26px 10px 22px',
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					fontFamily: MONO,
					fontWeight: 700,
					fontSize: ep.slots > 6 ? 36 : 40,
					color: night ? '#b9c9ff' : '#f4efe6',
					boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
				}}
			>
				<div style={{width: 18, height: 18, borderRadius: 9, background: '#ff3b30', opacity: dot ? 1 : 0.25}} />
				{clock.text}
			</div>
			{/* counter */}
			{showCounter && (
				<div
					style={{
						position: 'absolute',
						right: 1080 - COUNTER_X,
						top: COUNTER_Y - 10,
						width: g.boxW,
						transform: `translateX(${(1 - cIn) * 460}px)`,
						background: 'rgba(14,14,16,0.9)',
						border: `4px solid ${ep.accent ?? '#e0342b'}`,
						borderRadius: 14,
						padding: '10px 18px 14px',
						boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
						boxSizing: 'border-box',
					}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: HEAVY, fontWeight: 900, fontSize: 30, letterSpacing: 1}}>
						<span style={{color: ep.accent ?? '#ff4a3d'}}>{ep.counterTitle ?? 'ОН ИЛИ НЕ ОН?'}</span>
						<span style={{color: '#f4efe6'}}>
							{done}/{ep.slots}
						</span>
					</div>
					<div style={{display: 'flex', gap: g.gap, marginTop: 10}}>
						{Array.from({length: ep.slots}, (_, k) => k + 1).map((n) => {
							const s = ep.signs.find((x) => x.n === n);
							const land = n <= (ep.prefilled ?? 0) ? -1000 : s ? s.at + s.hold + SIGN_FLY : Infinity;
							const filled = f >= land;
							const p = filled ? pop(f, land, 9) : 0;
							const pend = ep.pending?.find((x) => x.n === n);
							const q = !filled && !!pend && f >= pend.at;
							const qp = q ? pop(f, pend!.at, 8) : 0;
							const qPulse = q ? 0.5 + 0.5 * Math.sin((f - pend!.at) / 5) : 0;
							return (
								<div
									key={n}
									style={{
										width: g.w,
										height: 40,
										borderRadius: 8,
										background: filled ? ep.accent ?? '#e0342b' : q ? `rgba(255,211,74,${0.14 + 0.16 * qPulse})` : 'rgba(255,255,255,0.08)',
										border: '3px solid ' + (filled ? '#ffffff88' : q ? ep.accent ?? '#ffd34a' : 'rgba(255,255,255,0.18)'),
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										transform: `scale(${filled ? 0.6 + 0.4 * p : q ? (0.5 + 0.5 * qp) * (1 + 0.05 * qPulse) : 1})`,
										boxSizing: 'border-box',
									}}
								>
									{filled && (ep.mark === 'check' ? <Check size={g.w > 40 ? 24 : 20} /> : <Cross size={g.w > 40 ? 24 : 20} />)}
									{q && <span style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 30, lineHeight: 1, color: ep.accent ?? '#ffd34a'}}>?</span>}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

const Check: React.FC<{size: number; color?: string}> = ({size, color = '#111'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M 4,13 L 10,19 L 20,5" stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Cross: React.FC<{size: number; color?: string; width?: number}> = ({size, color = '#fff', width = 5}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M 4,4 L 20,20 M 20,4 L 4,20" stroke={color} strokeWidth={width} strokeLinecap="round" />
	</svg>
);

// ----------------------------- sign plaque ---------------------------------
export const SignPlaques: React.FC<{ep: Episode}> = ({ep}) => {
	const f = useCurrentFrame();
	return (
		<>
			{ep.signs.map((s) => {
				if (f < s.at || f > s.at + s.hold + SIGN_FLY) return null;
				const t = f - s.at;
				const p = pop(f, s.at, 10);
				const fly = interpolate(t, [s.hold, s.hold + SIGN_FLY], [0, 1], clamp);
				const flyE = fly * fly;
				const cx = 540, cy = s.y ?? 650;
				const target = slotPos(ep.slots, s.n);
				const x = cx + (target.x - cx) * flyE;
				const y = cy + (target.y - cy) * flyE - Math.sin(fly * Math.PI) * 120;
				const sc = (0.5 + 0.5 * p) * (1 - 0.92 * flyE);
				const xp = pop(f, s.at + 10, 8);
				const lines = s.title.split('\n');
				return (
					<div
						key={s.n}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: 820,
							transform: `translate(-50%,-50%) scale(${sc}) rotate(${(1 - p) * -4}deg)`,
							background: '#121214',
							border: '7px solid #e0342b',
							borderRadius: 26,
							padding: '30px 40px 34px',
							boxShadow: '0 0 0 4px rgba(0,0,0,0.6), 0 18px 40px rgba(0,0,0,0.45)',
							opacity: 1 - fly * 0.3,
							boxSizing: 'border-box',
						}}
					>
						<div
							style={{
								fontFamily: HEAVY,
								fontWeight: 900,
								fontSize: 40,
								letterSpacing: 12,
								color: '#ff9a2e',
								textAlign: 'center',
								marginRight: 120,
							}}
						>
							{ep.plaqueLabel ?? 'ПРИЗНАК'} №{s.n}
						</div>
						<div
							style={{
								fontFamily: HEAVY,
								fontWeight: 900,
								fontSize: lines.some((l) => l.length > 12) ? 60 : 72,
								lineHeight: 1.08,
								color: '#fff',
								textAlign: 'center',
								marginTop: 10,
								marginRight: 120,
							}}
						>
							{lines.map((l) => (
								<div key={l}>{l}</div>
							))}
						</div>
						<div
							style={{
								position: 'absolute',
								right: 40,
								top: '50%',
								width: 112,
								height: 112,
								borderRadius: 56,
								background: ep.accent ?? '#e8392f',
								border: '6px solid #fff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `translateY(-50%) scale(${xp}) rotate(${(1 - xp) * 90}deg)`,
								boxSizing: 'border-box',
							}}
						>
							{ep.mark === 'check' ? <Check size={54} /> : <Cross size={54} width={5.5} />}
						</div>
					</div>
				);
			})}
		</>
	);
};

// ------------------------------ captions -----------------------------------
// Reference style: 2-3 words, upcoming words dimmed, key words red, quotes yellow.
const RED = '#ff3b30';
const QUOTE = '#ffd34a';
const CapWords: React.FC<{words: CapWord[]}> = ({words}) => {
	const f = useCurrentFrame();
	const len = words.reduce((a, w) => a + w.w.length + 1, 0);
	return (
		<div
			style={{
				position: 'absolute',
				left: 30,
				width: 880,
				top: 1170,
				textAlign: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: len > 18 ? 78 : 92,
				lineHeight: 1.05,
				color: '#fff',
				textTransform: 'uppercase',
			}}
		>
			{words.map((w, i) => {
				const p = pop(f, w.at, 12);
				const active = f >= w.at;
				const color = w.red ? RED : w.quote ? QUOTE : '#fff';
				return (
					<span
						key={i + w.w}
						style={{
							display: 'inline-block',
							margin: '0 11px',
							transform: `scale(${active ? 0.78 + 0.22 * p : 0.96})`,
							opacity: active ? 1 : 0.4,
							color: active ? color : '#cfc9db',
							textShadow:
								'0 6px 0 rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.55), 3px 3px 0 #22222a, -3px 3px 0 #22222a, 3px -3px 0 #22222a, -3px -3px 0 #22222a',
						}}
					>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

export const Captions: React.FC<{captions: CapChunk[]}> = ({captions}) => {
	const f = useCurrentFrame();
	const ch = captions.find((c) => f >= c.from - 2 && f < c.to);
	return ch ? <CapWords words={ch.words} /> : null;
};

// ------------------------------ rule cards ---------------------------------
export const RuleCards: React.FC<{rules: {n: number; title: string; icon: 'eye' | 'shh' | 'lock' | 'rec'; from: number; to: number}[]}> = ({rules}) => {
	const f = useCurrentFrame();
	const r = rules.find((x) => f >= x.from && f < x.to);
	if (!r) return null;
	const p = pop(f, r.from, 12);
	const out = interpolate(f, [r.to - 8, r.to], [1, 0], clamp);
	const ip = pop(f, r.from + 8, 10);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: out}}>
			<div style={{position: 'absolute', inset: 0, background: 'rgba(8,8,12,0.55)'}} />
			<div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${p})`}}>
				<div
					style={{
						display: 'inline-block',
						background: '#111',
						border: '5px solid #f4efe6',
						borderRadius: 18,
						padding: '8px 38px',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 54,
						letterSpacing: 2,
						color: '#fff',
					}}
				>
					ПРАВИЛО {r.n}
				</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 70, color: RED, marginTop: 18, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>{r.title}</div>
			</div>
			<div style={{position: 'absolute', left: 540, top: 820, transform: `translate(-50%,-50%) scale(${ip})`}}>
				<svg width={260} height={260} viewBox="0 0 100 100">
					{r.icon === 'rec' ? (
						<g fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
							<rect x={10} y={26} width={58} height={48} rx={10} />
							<path d="M 68,42 L 90,30 L 90,70 L 68,58 Z" />
							<circle cx={30} cy={50} r={9} fill={RED} stroke={RED} />
						</g>
					) : r.icon === 'lock' ? (
						<g fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
							<rect x={22} y={44} width={56} height={42} rx={8} />
							<path d="M 34,44 L 34,32 Q 34,14 50,14 Q 66,14 66,32 L 66,44" />
							<circle cx={50} cy={64} r={6} fill={RED} stroke={RED} />
						</g>
					) : r.icon === 'eye' ? (
						<g fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
							<path d="M 8,50 Q 50,12 92,50 Q 50,88 8,50 Z" />
							<circle cx={50} cy={50} r={13} fill="#fff" />
							<path d="M 18,84 L 82,16" stroke={RED} strokeWidth={8} />
						</g>
					) : (
						<g fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
							<path d="M 16,30 Q 16,16 30,16 L 70,16 Q 84,16 84,30 L 84,58 Q 84,72 70,72 L 44,72 L 28,86 L 30,72 Q 16,72 16,58 Z" />
							<path d="M 34,44 L 66,44" stroke={RED} strokeWidth={8} />
						</g>
					)}
				</svg>
			</div>
		</div>
	);
};

// ------------------------- name tags & bubbles -----------------------------
export const NameTag: React.FC<{
	x: number;
	y: number;
	title: string;
	sub?: string;
	at: number;
	pin?: number; // length of the pin line downward
	hang?: boolean; // hang from a string from the top of the screen
	color?: string;
	to?: number;
}> = ({x, y, title, sub, at, pin = 0, hang, color = '#e7c44a', to = 1e9}) => {
	const f = useCurrentFrame();
	const p = pop(f, at, 10) * interpolate(f, [to - 6, to], [1, 0], clamp);
	if (f < at || f > to) return null;
	const swing = hang ? Math.sin((f - at) / 9) * 3 * Math.exp(-(f - at) / 40) : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${swing}deg) scale(${p})`, transformOrigin: hang ? '50% -400px' : '50% 50%'}}>
			{hang && <div style={{position: 'absolute', left: '50%', bottom: '100%', width: 4, height: 600, background: color, marginLeft: -2}} />}
			<div
				style={{
					background: '#111',
					border: `6px solid ${color}`,
					borderRadius: 18,
					padding: sub ? '10px 30px 12px' : '8px 30px',
					textAlign: 'center',
					fontFamily: HEAVY,
					fontWeight: 900,
					color: '#fff',
					boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
					whiteSpace: 'nowrap',
				}}
			>
				<div style={{fontSize: 64, lineHeight: 1.05, letterSpacing: 2}}>{title}</div>
				{sub && <div style={{fontSize: 34, color: color, letterSpacing: 1}}>{sub}</div>}
			</div>
			{pin > 0 && (
				<>
					<div style={{position: 'absolute', left: '50%', top: '100%', width: 4, height: pin, background: color, marginLeft: -2}} />
					<div style={{position: 'absolute', left: '50%', top: `calc(100% + ${pin}px)`, width: 20, height: 20, borderRadius: 10, background: color, marginLeft: -10, marginTop: -6}} />
				</>
			)}
		</div>
	);
};

export const Bubble: React.FC<{x: number; y: number; text: string; from: number; to: number; tail?: 'left' | 'right'; whisper?: boolean; dark?: boolean}> = ({
	x,
	y,
	text,
	from,
	to,
	tail = 'left',
	whisper,
	dark,
}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const p = pop(f, from, 11);
	const out = interpolate(f, [to - 6, to], [1, 0], clamp);
	const chars = Math.floor(interpolate(f, [from + 3, from + 3 + text.length * 1.2], [0, text.length], clamp));
	const bg = dark ? '#16161a' : '#ffffff';
	const fg = dark ? '#ff5a4f' : '#1b1b1f';
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%,-100%) scale(${p * out})`,
				transformOrigin: tail === 'left' ? '15% 110%' : '85% 110%',
			}}
		>
			<div
				style={{
					background: bg,
					border: whisper ? '5px dashed #8a8a96' : `5px solid ${dark ? '#ff5a4f' : '#1b1b1f'}`,
					borderRadius: 40,
					padding: '22px 38px',
					fontFamily: HEAVY,
					fontWeight: 800,
					fontStyle: whisper ? 'italic' : 'normal',
					fontSize: 52,
					color: whisper ? '#55555f' : fg,
					whiteSpace: 'nowrap',
					boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
					position: 'relative',
				}}
			>
				<span>{text.slice(0, chars)}</span>
				<span style={{opacity: 0}}>{text.slice(chars)}</span>
				<svg
					width={70}
					height={60}
					viewBox="0 0 70 60"
					style={{position: 'absolute', top: '100%', marginTop: -6, [tail === 'left' ? 'left' : 'right']: 50, transform: tail === 'right' ? 'scaleX(-1)' : undefined}}
				>
					<path d="M 4,0 L 50,0 L 6,56 Z" fill={bg} />
					<path d="M 4,2 L 6,56 L 50,2" fill="none" stroke={whisper ? '#8a8a96' : dark ? '#ff5a4f' : '#1b1b1f'} strokeWidth={5} strokeDasharray={whisper ? '10 8' : undefined} />
				</svg>
			</div>
		</div>
	);
};

export {HEAVY, MONO, Cross};
