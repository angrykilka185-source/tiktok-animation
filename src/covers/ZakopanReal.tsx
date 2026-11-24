// Hard-hitting YouTube covers for «Каково это — оказаться погребённым заживо» (1920×1080): a photorealistic still of a
// (fictional) man buried alive — generated with Seedream 5 Pro in ElevenLabs, saved in public/covers/ — with a short
// provocative headline on top, for a thumbnail A/B test («Тест и сравнение» in YouTube Studio).
//   CoverPitA — the face up close in the coffin, «Я ЖИВ!!!», the air timer
//   CoverPitB — the grave in section, «ТЫ ПРОСНУЛСЯ ЗДЕСЬ» and a red arrow to the coffin, «2 МЕТРА»
//   CoverPitC — the face up close, «НЕ КРИЧИ!» (why? — screaming burns the air: the video answers)
// Render: npx remotion still CoverPitA out/cover/pit-a.png
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {HEAVY} from '../components/Overlays';

const RED = '#ff2a1f';
const INK = '#0c0d10';

// a word with a heavy black outline and a drop shadow (reads at thumbnail size)
const Big: React.FC<{text: string; size: number; color?: string; stroke?: number; style?: React.CSSProperties}> = ({text, size, color = '#ffffff', stroke = 0.09, style}) => (
	<div
		style={{
			fontFamily: HEAVY,
			fontWeight: 900,
			fontSize: size,
			lineHeight: 0.95,
			color,
			WebkitTextStroke: `${Math.round(size * stroke)}px ${INK}`,
			paintOrder: 'stroke fill',
			textShadow: `0 ${Math.round(size * 0.06)}px ${Math.round(size * 0.12)}px rgba(0,0,0,0.75)`,
			whiteSpace: 'nowrap',
			letterSpacing: -1,
			...style,
		}}
	>
		{text}
	</div>
);

// the stopwatch chip «2 ЧАСА ВОЗДУХА»
const Timer: React.FC<{x: number; y: number; text?: string; rot?: number}> = ({x, y, text = '2 ЧАСА ВОЗДУХА', rot = -3}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, display: 'flex', alignItems: 'center', gap: 22, background: RED, border: '8px solid #ffffff', borderRadius: 26, padding: '12px 34px 14px 22px', boxShadow: '0 14px 40px rgba(0,0,0,0.6)'}}>
		<svg width={74} height={84} viewBox="-37 -46 74 84">
			<circle r={32} fill="#ffffff" />
			<circle r={24} fill="none" stroke={RED} strokeWidth={7} />
			<rect x={-8} y={-46} width={16} height={12} rx={4} fill="#ffffff" />
			<path d="M 0,-14 L 0,0 L 11,8" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
		</svg>
		<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: '#ffffff', whiteSpace: 'nowrap', letterSpacing: -1}}>{text}</div>
	</div>
);

// a thick red hand-drawn arrow from (x1, y1) to (x2, y2), bending through (cx, cy)
const Arrow: React.FC<{a: [number, number]; c: [number, number]; b: [number, number]}> = ({a, c, b}) => {
	const ang = Math.atan2(b[1] - c[1], b[0] - c[0]);
	const head = (s: number) => `M ${b[0] + Math.cos(ang + Math.PI - 0.5) * s},${b[1] + Math.sin(ang + Math.PI - 0.5) * s} L ${b[0]},${b[1]} L ${b[0] + Math.cos(ang + Math.PI + 0.5) * s},${b[1] + Math.sin(ang + Math.PI + 0.5) * s}`;
	return (
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			<path d={`M ${a[0]},${a[1]} Q ${c[0]},${c[1]} ${b[0]},${b[1]}`} stroke="#ffffff" strokeWidth={46} fill="none" strokeLinecap="round" />
			<path d={head(92)} stroke="#ffffff" strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={`M ${a[0]},${a[1]} Q ${c[0]},${c[1]} ${b[0]},${b[1]}`} stroke={RED} strokeWidth={28} fill="none" strokeLinecap="round" />
			<path d={head(92)} stroke={RED} strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

const Photo: React.FC<{src: string; veil?: string}> = ({src, veil}) => (
	<>
		<Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
		{veil && <AbsoluteFill style={{background: veil}} />}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
	</>
);
// the bottom-left darkened for the headline (the face, the hands and the scratches stay bright)
const LOW = 'linear-gradient(10deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0) 52%)';
// a red ring round a detail
const Ring: React.FC<{x: number; y: number; rx: number; ry: number}> = ({x, y, rx, ry}) => (
	<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
		<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke="#ffffff" strokeWidth={20} transform={`rotate(-12 ${x} ${y})`} />
		<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={RED} strokeWidth={11} transform={`rotate(-12 ${x} ${y})`} />
	</svg>
);

// 1) the face up close: «Я ЖИВ!!!», the scratches circled, the air timer
export const CoverPitA: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Photo src="covers/pit-a.jpg" veil={LOW} />
		<Ring x={640} y={470} rx={130} ry={170} />
		<div style={{position: 'absolute', left: 56, top: 790, display: 'flex', gap: 40}}>
			<Big text="Я" size={210} />
			<Big text="ЖИВ!!!" size={210} color={RED} />
		</div>
		<Timer x={56} y={50} />
	</AbsoluteFill>
);

// 2) the grave in section: «ТЫ ПРОСНУЛСЯ ЗДЕСЬ» and an arrow down into the coffin
export const CoverPitB: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Photo src="covers/pit-b.jpg" veil="linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 55%)" />
		<div style={{position: 'absolute', left: 56, top: 470}}>
			<Big text="ТЫ ПРОСНУЛСЯ" size={116} />
			<Big text="ЗДЕСЬ" size={200} color={RED} style={{marginTop: 4}} />
		</div>
		<Arrow a={[810, 770]} c={[1010, 975]} b={[1290, 885]} />
		<Timer x={56} y={900} rot={-2} />
	</AbsoluteFill>
);

// 3) the face up close: «НЕ КРИЧИ!» — why? screaming burns the air (the video answers)
export const CoverPitC: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Photo src="covers/pit-a.jpg" veil={LOW} />
		<div style={{position: 'absolute', left: 56, top: 800, display: 'flex', gap: 36}}>
			<Big text="НЕ" size={190} />
			<Big text="КРИЧИ!" size={190} color={RED} />
		</div>
		<Timer x={56} y={50} text="ВОЗДУХА НА 2 ЧАСА" />
	</AbsoluteFill>
);
