// Vertical shorts (1080×1920) cut from «Каково это — оказаться погребённым заживо» — teasers for the full film.
// The same layout as the USSR shorts (src/u1/shorts.tsx): each short plays a run of the film's shots (the original
// vector scenes and Чоби's pages, drawn in a virtual 1920×1080 frame and scaled into a band across the middle), with
// a hook title above, big captions below and, at the end, a card with the film's cover: «ПОЛНОЕ ВИДЕО — НА КАНАЛЕ».
// The counters of the film («ОШИБКИ ГОГИ», the air) sit in the corners of what the band shows.
// Render: scripts/render-parallel.sh ZakopanShort1 ZakopanShort1Audio out/zakopan-short-1.mp4   (… up to 6)
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {CoverZakopan2m} from '../covers/Zakopan';
import {RZ3, ZakopanHud, ZakopanScenes} from './Main';
import {SFXZ3} from './SFX';
import {shotStart, SHOTS} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

const RED = '#e8352e';
const RED_D = '#8f1416';
const INK = '#16161c';
const SOIL = '#5a3a1e';
const BLUE = '#1d5fd1';

// the layout of the vertical frame
const VY = 560; // the band with the film
const VH = 740;
const K = VH / 1080; // the film's scale in the band
const SRC_W = 1080 / K; // how much of the film's width the band shows (the middle ≈ 1576 of 1920 px)
const CAP_Y = VY + VH + 44; // the captions
export const CTA = 96; // the end card, frames

type Pan = {from: number; to: number; word: string; add?: number};
// a shot whose picture is a little wider than the band is shown slightly smaller; the thin strips left above and
// below it take the colours of the scene's top and bottom edges (no black bars)
type Zoom = {cx: number; zoom: number; top: string; bottom: string};
type Short = {
	shots: [number, number]; // the film's shots, first..last (inclusive)
	hook: string[]; // the title lines; a line starting with «*» is red
	cta: string[]; // the end card headline (lines, «*» = red)
	framing?: Record<number, number | Pan | Zoom>; // where the band looks, per shot (the film's x of its centre; default 960)
};

export const SHORTS: Short[] = [
	// «два метра земли»: the band pans right to the depth mark; «Стоп, Гога!»: the list of mistakes on the left and
	// Чоби on the right are a little wider than the band
	{
		shots: [1, 5],
		hook: ['ТЫ ПРОСНУЛСЯ', '*В ГРОБУ'],
		cta: ['ЧТО ДЕЛАТЬ', '*ДАЛЬШЕ?'],
		framing: {2: {from: 960, to: 1100, word: 'два', add: -8}, 5: {cx: 945, zoom: 0.95, top: '#2e2925', bottom: '#1d1916'}},
	},
	// Чоби's pages: the CO₂ gauge stands by the right edge
	{
		shots: [8, 12],
		hook: ['СКОЛЬКО ВОЗДУХА', '*В ГРОБУ?'],
		cta: ['КАК ЕГО', '*СБЕРЕЧЬ?'],
		framing: {10: 1000, 11: 1000, 12: 1000},
	},
	// «а сторож дежурил днём и ночью»: the band pans right to the watchman and his label
	{
		shots: [32, 37],
		hook: ['ЗАЧЕМ В ГРОБ', '*КЛАЛИ', '*КОЛОКОЛЬЧИК'],
		cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ИСТОРИИ'],
		framing: {37: {from: 960, to: 1060, word: 'сторож', add: -8}},
	},
	// Gogol's testament: the scroll reaches the right edge
	{
		shots: [38, 41],
		hook: ['ГОГОЛЯ', '*ПОХОРОНИЛИ', '*ЖИВЫМ?'],
		cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ИСТОРИИ'],
		framing: {40: 1020},
	},
	// the survival chart on Чоби's last page reaches the right edge
	{
		shots: [46, 51],
		hook: ['ПОД ЛАВИНОЙ:', '*15 МИНУТ', '*НА СПАСЕНИЕ'],
		cta: ['А ЕЩЁ', '*6 ОШИБОК'],
		framing: {51: 1010},
	},
	// the three rules of shot 54 stand across the whole width
	{
		shots: [52, 55],
		hook: ['ЯМА НА ПЛЯЖЕ', '*МОЖЕТ УБИТЬ'],
		cta: ['А ЕЩЁ', '*6 ОШИБОК'],
		framing: {
			54: {cx: 989, zoom: 0.945, top: '#fff7e4', bottom: '#f0cf8a'},
		},
	},
];

// the run of the film a short plays: output frames [a, b)
export const shortRange = (n: number) => {
	const sh = SHORTS[n - 1];
	const first = SHOTS[sh.shots[0] - 1];
	const last = SHOTS[sh.shots[1] - 1];
	const a = Math.round(RZ3.fwd(first.from));
	const b = Math.round(RZ3.fwd(last.from + last.duration));
	return {a, b, len: b - a};
};
export const shortDuration = (n: number) => shortRange(n).len + CTA;

// one line of the title, sized to fit the width (the heavy Cyrillic capitals are ≈ 0.8 em wide)
const fit = (t: string, max: number, width = 980) => Math.min(max, Math.floor(width / (t.length * 0.8)));

const Kicker: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			top: 168,
			width: '100%',
			textAlign: 'center',
		}}
	>
		<div
			style={{
				display: 'inline-block',
				background: INK,
				color: '#fff',
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: 30,
				letterSpacing: 1,
				padding: '12px 26px 13px',
				borderRadius: 40,
			}}
		>
			КАКОВО ЭТО — ОКАЗАТЬСЯ <span style={{color: '#ff6b5e'}}>ПОГРЕБЁННЫМ ЗАЖИВО</span>
		</div>
	</div>
);

// faint rays of earth colour behind the title
const Backdrop: React.FC = () => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
		<defs>
			<radialGradient id="zs-fade" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0.2" stopColor="#fff" />
				<stop offset="1" stopColor="#000" />
			</radialGradient>
			<mask id="zs-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
				<circle cx={540} cy={360} r={620} fill="url(#zs-fade)" />
			</mask>
		</defs>
		<g mask="url(#zs-mask)">
			{Array.from({length: 18}).map((_, k) => {
				const a = (k / 18) * Math.PI * 2;
				const R = 1100;
				return <path key={k} d={`M 540,360 L ${540 + Math.cos(a) * R},${360 + Math.sin(a) * R} L ${540 + Math.cos(a + 0.11) * R},${360 + Math.sin(a + 0.11) * R} Z`} fill={SOIL} opacity={0.06} />;
			})}
		</g>
	</svg>
);

const Hook: React.FC<{lines: string[]; s?: number}> = ({lines, s: given}) => {
	const f = useCurrentFrame();
	// visible from the very first frame (the feed shows it), it just settles in
	const s = given ?? interpolate(f, [0, 10], [1.07, 1], clamp);
	const cap = lines.length > 2 ? 96 : 120;
	return (
		<div
			style={{
				position: 'absolute',
				top: 236,
				height: VY - 236 - 18,
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				lineHeight: 1.06,
				whiteSpace: 'nowrap',
				transform: `scale(${s})`,
			}}
		>
			{lines.map((l, i) => {
				const red = l.startsWith('*');
				const t = red ? l.slice(1) : l;
				return (
					<div
						key={i}
						style={{
							fontSize: fit(t, cap),
							color: red ? RED : INK,
							textShadow: red ? `0 7px 0 ${RED_D}` : undefined,
						}}
					>
						{t}
					</div>
				);
			})}
		</div>
	);
};

// the captions of the voice, dark on white (the film's frame numbers: drawn inside the film's Sequence)
// (only the lines that start inside the short: the tail of the line before it is not shown)
const ShortCaptions: React.FC<{from: number}> = ({from}) => {
	const f = useCurrentFrame();
	const ch = VOICE_CAPTIONS.find((c) => c.from >= from - 2 && f >= c.from - 2 && f < c.to);
	if (!ch) return null;
	const len = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
	const longest = Math.max(...ch.words.map((x) => x.w.length));
	const fs = longest > 12 ? Math.min(80, Math.floor(880 / (longest * 0.74))) : len > 18 ? 80 : 92;
	return (
		<div
			style={{
				position: 'absolute',
				left: 50,
				width: 880,
				top: CAP_Y,
				textAlign: 'center',
				fontFamily: HEAVY,
				fontWeight: 900,
				fontSize: fs,
				lineHeight: 1.1,
				textTransform: 'uppercase',
			}}
		>
			{ch.words.map((x, i) => {
				const p = pop(f, x.at, 12);
				const active = f >= x.at;
				const color = x.red ? RED : x.quote ? BLUE : INK;
				return (
					<span
						key={i + x.w}
						style={{
							display: 'inline-block',
							margin: '0 10px',
							transform: `scale(${active ? 0.8 + 0.2 * p : 0.96})`,
							color: active ? color : '#cacad2',
						}}
					>
						{x.w.replace(/-/g, '‑')}
					</span>
				);
			})}
		</div>
	);
};

// the end card: the headline, the film's cover, the button
const EndCard: React.FC<{headline: string[]}> = ({headline}) => {
	const f = useCurrentFrame();
	const pIn = pop(f, 0, 13);
	const pBtn = pop(f, 8, 11);
	const pulse = 1 + 0.035 * Math.sin(Math.max(0, f - 20) / 4.5);
	const flash = interpolate(f, [0, 8], [0.9, 0], clamp);
	const CW = 960;
	const CH = CW * (720 / 1280);
	return (
		<AbsoluteFill style={{background: '#fff'}}>
			<Backdrop />
			<Kicker />
			<Hook lines={headline} s={0.7 + 0.3 * pIn} />
			<div
				style={{
					position: 'absolute',
					left: (1080 - CW) / 2,
					top: VY + (VH - CH) / 2,
					width: CW,
					height: CH,
					borderRadius: 26,
					overflow: 'hidden',
					boxShadow: '0 22px 50px rgba(40,10,10,0.28)',
					transform: `scale(${0.85 + 0.15 * pIn}) rotate(${(1 - pIn) * -3}deg)`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: 1280,
						height: 720,
						transform: `scale(${CW / 1280})`,
						transformOrigin: '0 0',
					}}
				>
					<CoverZakopan2m />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 50,
					width: 880,
					top: CAP_Y + 10,
					textAlign: 'center',
					transform: `scale(${pBtn * pulse})`,
				}}
			>
				<div
					style={{
						display: 'inline-block',
						background: RED,
						color: '#fff',
						fontFamily: HEAVY,
						fontWeight: 900,
						borderRadius: 30,
						padding: '20px 44px 24px',
						boxShadow: `0 9px 0 ${RED_D}`,
					}}
				>
					<div style={{fontSize: 70, lineHeight: 1}}>▶ ПОЛНОЕ ВИДЕО</div>
					<div
						style={{
							fontSize: 42,
							lineHeight: 1,
							marginTop: 12,
							opacity: 0.95,
						}}
					>
						УЖЕ НА КАНАЛЕ
					</div>
				</div>
			</div>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// where the band looks at a film frame: the film's x of its centre and the zoom (1 = the band's full height)
const viewAt = (f: number, framing: Short['framing']) => {
	const sh = SHOTS.find((x) => f >= Math.round(RZ3.fwd(x.from)) && f < Math.round(RZ3.fwd(x.from + x.duration)));
	const spec = sh && framing?.[sh.index];
	if (spec === undefined) return {cx: 960, zoom: 1} as Partial<Zoom> & {cx: number; zoom: number};
	if (typeof spec === 'number')
		return {cx: spec, zoom: 1} as Partial<Zoom> & {
			cx: number;
			zoom: number;
		};
	if ('zoom' in spec) return spec as Partial<Zoom> & {cx: number; zoom: number};
	const at = Math.round(RZ3.fwd(shotStart(sh!.index) + w(sh!.index, spec.word, spec.add ?? 0)));
	return {
		cx: interpolate(f, [at, at + 18], [spec.from, spec.to], {
			...clamp,
			easing: Easing.inOut(Easing.cubic),
		}),
		zoom: 1,
	} as Partial<Zoom> & {cx: number; zoom: number};
};

// the film in its virtual 1920×1080 frame, scaled into the band (the film's frame numbers)
const FilmBand: React.FC<{framing: Short['framing']}> = ({framing}) => {
	const f = useCurrentFrame();
	const {cx, zoom, top, bottom} = viewAt(f, framing);
	const k = K * zoom;
	const srcW = SRC_W / zoom;
	const crop = cx - srcW / 2; // the film's x at the left edge of the band
	const ty = (VH - 1080 * k) / 2; // a zoomed-out shot sits in the middle of the band's height
	return (
		<>
			{top && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 1080,
						height: VH,
						background: `linear-gradient(${top} 0 50%, ${bottom} 50% 100%)`,
					}}
				/>
			)}
			<Sequence
				width={1920}
				height={1080}
				name="кадр 16:9"
				style={{
					transform: `translate(${-crop * k}px, ${ty}px) scale(${k})`,
					transformOrigin: '0 0',
				}}
			>
				<ZakopanScenes />
				{/* the counters, in the corners of what the band shows */}
				<div
					style={{
						position: 'absolute',
						left: crop,
						top: 0,
						width: srcW,
						height: 1080,
					}}
				>
					<ZakopanHud />
				</div>
			</Sequence>
		</>
	);
};

// the sound: the film's own track for the run, then a whoosh and a pop on the end card
const ShortSound: React.FC<{n: number}> = ({n}) => {
	const {a, b, len} = shortRange(n);
	return (
		<>
			<Sequence from={-a} durationInFrames={b} name="звук фильма">
				<SFXZ3 r={RZ3} />
			</Sequence>
			<Sequence from={len} durationInFrames={CTA} name="концовка: whoosh">
				<Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
			</Sequence>
			<Sequence from={len + 8} durationInFrames={CTA - 8} name="концовка: pop">
				<Audio src={staticFile('sfx/pop.wav')} volume={0.45} />
			</Sequence>
		</>
	);
};

export const ZakopanShort: React.FC<{n: number}> = ({n}) => {
	const sh = SHORTS[n - 1];
	const {a, b, len} = shortRange(n);
	return (
		<AbsoluteFill style={{background: '#fff'}}>
			<Backdrop />
			<Kicker />
			<Sequence durationInFrames={len} name="заголовок">
				<Hook lines={sh.hook} />
			</Sequence>
			{/* the band with the film */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: VY,
					width: 1080,
					height: VH,
					overflow: 'hidden',
					background: '#000',
					boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
				}}
			>
				<Sequence from={-a} durationInFrames={b} name="фильм">
					<FilmBand framing={sh.framing} />
				</Sequence>
			</div>
			<Sequence from={-a} durationInFrames={b} name="субтитры">
				<ShortCaptions from={a} />
			</Sequence>
			<Sequence from={len} durationInFrames={CTA} name="концовка">
				<EndCard headline={sh.cta} />
			</Sequence>
			<ShortSound n={n} />
		</AbsoluteFill>
	);
};

export const ZakopanShortAudio: React.FC<{n: number}> = ({n}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<ShortSound n={n} />
	</AbsoluteFill>
);
