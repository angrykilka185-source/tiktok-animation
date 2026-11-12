import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {CAPTIONS, CLOCK, SIGN_FLY, SIGNS, shotStart} from '../timeline';
import {HAS_VOICE, VOICE_CAPTIONS} from '../voice';

const HEAVY = "'Montserrat', 'DejaVu Sans', sans-serif";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// ------------------------------- HUD ---------------------------------------
const COUNTER_X = 1040; // right edge
const COUNTER_Y = 96;
export const SLOT_POS = (n: number) => ({x: COUNTER_X - 404 + 24 + (n - 1) * 60 + 22, y: COUNTER_Y + 70});

export const signsDone = (f: number) => SIGNS.filter((s) => f >= s.at + s.hold + SIGN_FLY).length;

export const HUD: React.FC = () => {
	const f = useCurrentFrame();
	let idx = 0;
	CLOCK.forEach((c, i) => {
		if (f >= c.from) idx = i;
	});
	const clock = CLOCK[idx];
	const flip = pop(f, clock.from, 14);
	const dot = Math.floor(f / 15) % 2 === 0;
	const showCounter = f >= shotStart(3) - 4;
	const cIn = pop(f, shotStart(3) - 4, 13);
	const done = signsDone(f);
	const night = f >= shotStart(10) && f < shotStart(12);
	const hudIn = pop(f, 8, 13);

	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
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
					fontSize: 40,
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
						width: 404,
						transform: `translateX(${(1 - cIn) * 460}px)`,
						background: 'rgba(14,14,16,0.9)',
						border: '4px solid #e0342b',
						borderRadius: 14,
						padding: '10px 18px 14px',
						boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
						boxSizing: 'border-box',
					}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: HEAVY, fontWeight: 900, fontSize: 30, letterSpacing: 1}}>
						<span style={{color: '#ff4a3d'}}>ОН ИЛИ НЕ ОН?</span>
						<span style={{color: '#f4efe6'}}>{done}/6</span>
					</div>
					<div style={{display: 'flex', gap: 16, marginTop: 10}}>
						{[1, 2, 3, 4, 5, 6].map((n) => {
							const s = SIGNS[n - 1];
							const land = s.at + s.hold + SIGN_FLY;
							const filled = f >= land;
							const p = filled ? pop(f, land, 9) : 0;
							return (
								<div
									key={n}
									style={{
										width: 44,
										height: 40,
										borderRadius: 8,
										background: filled ? '#e0342b' : 'rgba(255,255,255,0.08)',
										border: '3px solid ' + (filled ? '#ff6b5f' : 'rgba(255,255,255,0.18)'),
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										transform: `scale(${filled ? 0.6 + 0.4 * p : 1})`,
										boxSizing: 'border-box',
									}}
								>
									{filled && <Cross size={24} />}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

const Cross: React.FC<{size: number; color?: string; width?: number}> = ({size, color = '#fff', width = 5}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M 4,4 L 20,20 M 20,4 L 4,20" stroke={color} strokeWidth={width} strokeLinecap="round" />
	</svg>
);

// ----------------------------- sign plaque ---------------------------------
export const SignPlaques: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			{SIGNS.map((s) => {
				if (f < s.at || f > s.at + s.hold + SIGN_FLY) return null;
				const t = f - s.at;
				const p = pop(f, s.at, 10);
				const fly = interpolate(t, [s.hold, s.hold + SIGN_FLY], [0, 1], clamp);
				const flyE = fly * fly;
				const cx = 540, cy = 650;
				const target = SLOT_POS(s.n);
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
							ПРИЗНАК №{s.n}
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
								background: '#e8392f',
								border: '6px solid #fff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `translateY(-50%) scale(${xp}) rotate(${(1 - xp) * 90}deg)`,
								boxSizing: 'border-box',
							}}
						>
							<Cross size={54} width={5.5} />
						</div>
					</div>
				);
			})}
		</>
	);
};

// ------------------------------ captions -----------------------------------
const CapWords: React.FC<{words: {w: string; at: number}[]}> = ({words}) => {
	const f = useCurrentFrame();
	const len = words.reduce((a, w) => a + w.w.length + 1, 0);
	return (
		<div
			style={{
				position: 'absolute',
				left: 40,
				width: 860,
				top: 1175,
				textAlign: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: len > 16 ? 80 : 94,
				lineHeight: 1.05,
				color: '#fff',
			}}
		>
			{words.map((w, i) => {
				const p = pop(f, w.at, 12);
				const active = f >= w.at;
				return (
					<span
						key={i + w.w}
						style={{
							display: 'inline-block',
							margin: '0 12px',
							transform: `scale(${active ? 0.75 + 0.25 * p : 0.95})`,
							opacity: active ? 1 : 0.35,
							color: active ? '#fff' : '#c9c3d6',
							textShadow:
								'0 6px 0 rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.55), 3px 3px 0 #2a2a33, -3px 3px 0 #2a2a33, 3px -3px 0 #2a2a33, -3px -3px 0 #2a2a33',
						}}
					>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

export const Captions: React.FC = () => {
	const f = useCurrentFrame();
	if (HAS_VOICE) {
		const ch = VOICE_CAPTIONS.find((c) => f >= c.from - 2 && f < c.to);
		return ch ? <CapWords words={ch.words} /> : null;
	}
	const c = CAPTIONS.find((c) => f >= c.from && f < c.to);
	if (!c) return null;
	const chunks = c.text.split('|');
	const len = (c.to - c.from) / chunks.length;
	const ci = Math.min(chunks.length - 1, Math.floor((f - c.from) / len));
	const chunkStart = c.from + ci * len;
	const words = chunks[ci].split(' ');
	const per = Math.min(7, (len * 0.55) / words.length);
	const big = chunks[ci].length > 16 ? 76 : 92;
	return (
		<div
			style={{
				position: 'absolute',
				left: 40,
				width: 860,
				top: (c.y ?? 1235) - 60,
				textAlign: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: big,
				lineHeight: 1.05,
				color: '#fff',
				textTransform: 'uppercase',
			}}
		>
			{words.map((w, i) => {
				const at = chunkStart + i * per;
				const p = pop(f, at, 12);
				const active = f >= at;
				return (
					<span
						key={i + w}
						style={{
							display: 'inline-block',
							margin: '0 12px',
							transform: `scale(${active ? 0.7 + 0.3 * p : 0.95})`,
							opacity: active ? 1 : 0.35,
							color: active ? '#fff' : '#c9c3d6',
							textShadow:
								'0 6px 0 rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.55), 3px 3px 0 #2a2a33, -3px 3px 0 #2a2a33, 3px -3px 0 #2a2a33, -3px -3px 0 #2a2a33',
						}}
					>
						{w}
					</span>
				);
			})}
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
