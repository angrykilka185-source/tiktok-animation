// Vertical shorts (1080×1920) cut from a 16:9 «Каково это» film — teasers for the full film (first made for
// «погребённым заживо», src/z3/shorts.tsx, after the USSR shorts, src/u1/shorts.tsx). Each short plays a run of the
// film's shots (the original vector scenes and Чоби's pages, drawn in a virtual 1920×1080 frame and scaled into a
// band across the middle), with a hook title above, big captions below and, at the end, a card with the film's
// cover: «ПОЛНОЕ ВИДЕО — УЖЕ НА КАНАЛЕ». The film's counters sit in the corners of what the band shows.
// A film module describes itself once (Film) and lists its runs (FilmShortSpec); makeFilmShorts builds the rest.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import type {Remap} from '../edit';
import type {Shot} from '../timeline';
import type {CapChunk} from '../voiceCore';
import {HEAVY} from './Overlays';

const RED = '#e8352e';
const RED_D = '#8f1416';
const INK = '#16161c';
const BLUE = '#1d5fd1';

// the layout of the vertical frame
const VY = 560; // the band with the film
const VH = 740;
const K = VH / 1080; // the film's scale in the band
const SRC_W = 1080 / K; // how much of the film's width the band shows (the middle ≈ 1576 of 1920 px)
const CAP_Y = VY + VH + 44; // the captions
export const CTA = 96; // the end card, frames

// a shot whose picture is a little wider than the band is shown slightly smaller; the thin strips left above and
// below it take the colours of the scene's top and bottom edges (no black bars)
type Zoom = {cx: number; zoom: number; top: string; bottom: string};
// the band glides (18 frames) from one view to another at a word of the shot's line (no word: at the shot's start);
// a view is the film's x of the band's centre, or that and a zoom
type PanView = number | {cx: number; zoom: number};
type Pan = {from: PanView; to: PanView; word?: string | number; add?: number; top?: string; bottom?: string};
export type FilmShortSpec = {
	shots: [number, number]; // the film's shots, first..last (inclusive)
	hook: string[]; // the title lines; a line starting with «*» is red
	cta: string[]; // the end card headline (lines, «*» = red)
	framing?: Record<number, number | Pan | Zoom>; // where the band looks, per shot (the film's x of its centre; default 960)
	// the film's counters in the band's corners: on (default), off where they would only cover the titles, or only over
	// the shots [first, last] where they tick (they fade out after)
	hud?: boolean | [number, number];
};

export type Film = {
	kicker: [string, string]; // the film's title on the pill above the hook: the plain part, the red part
	tint: string; // the faint rays behind the title
	r: Remap; // the film's authoring frames → its output frames (the picture follows the voice)
	shots: Shot[];
	shotStart: (n: number) => number;
	w: (n: number, key: string | number, add?: number) => number; // shot-local frame of a word of shot n's line
	captions: CapChunk[];
	// the picture alone (scenes, Чоби's pages, camera kicks), only the shots of the run: nothing from the shots
	// around it (the circle closing Чоби's last page over the next shot, a scene under the circle opening his page)
	Scenes: React.FC<{only?: [number, number]}>;
	Hud: React.FC; // the film's counters, laid out over a 1920×1080 frame
	Sound: React.FC; // the film's whole sound track
	Cover: React.FC; // the film's cover
	coverSize: [number, number]; // the cover's own frame
};

export const makeFilmShorts = (film: Film, SHORTS: FilmShortSpec[]) => {
	const {r, shots: SHOTS, shotStart, w} = film;

	// the run of the film a short plays: output frames [a, b)
	const shortRange = (n: number) => {
		const sh = SHORTS[n - 1];
		const first = SHOTS[sh.shots[0] - 1];
		const last = SHOTS[sh.shots[1] - 1];
		const a = Math.round(r.fwd(first.from));
		const b = Math.round(r.fwd(last.from + last.duration));
		return {a, b, len: b - a};
	};
	const shortDuration = (n: number) => shortRange(n).len + CTA;

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
				{film.kicker[0]} <span style={{color: '#ff6b5e'}}>{film.kicker[1]}</span>
			</div>
		</div>
	);

	// faint rays behind the title
	const Backdrop: React.FC = () => (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
			<defs>
				<radialGradient id="fs-fade" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0.2" stopColor="#fff" />
					<stop offset="1" stopColor="#000" />
				</radialGradient>
				<mask id="fs-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
					<circle cx={540} cy={360} r={620} fill="url(#fs-fade)" />
				</mask>
			</defs>
			<g mask="url(#fs-mask)">
				{Array.from({length: 18}).map((_, k) => {
					const a = (k / 18) * Math.PI * 2;
					const R = 1100;
					return <path key={k} d={`M 540,360 L ${540 + Math.cos(a) * R},${360 + Math.sin(a) * R} L ${540 + Math.cos(a + 0.11) * R},${360 + Math.sin(a + 0.11) * R} Z`} fill={film.tint} opacity={0.06} />;
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
		const ch = film.captions.find((c) => c.from >= from - 2 && f >= c.from - 2 && f < c.to);
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
		const [cw, chh] = film.coverSize;
		const CW = 960;
		const CH = CW * (chh / cw);
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
							width: cw,
							height: chh,
							transform: `scale(${CW / cw})`,
							transformOrigin: '0 0',
						}}
					>
						<film.Cover />
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

	type View = Partial<Zoom> & {cx: number; zoom: number};
	// where the band looks at a film frame: the film's x of its centre and the zoom (1 = the band's full height)
	const viewAt = (f: number, framing: FilmShortSpec['framing']): View => {
		const sh = SHOTS.find((x) => f >= Math.round(r.fwd(x.from)) && f < Math.round(r.fwd(x.from + x.duration)));
		const spec = sh && framing?.[sh.index];
		if (spec === undefined) return {cx: 960, zoom: 1};
		if (typeof spec === 'number') return {cx: spec, zoom: 1};
		if ('zoom' in spec) return spec;
		const n = sh!.index;
		const at = Math.round(r.fwd(shotStart(n) + (spec.word === undefined ? (spec.add ?? 0) : w(n, spec.word, spec.add ?? 0))));
		const [a, b] = [spec.from, spec.to].map((v) => (typeof v === 'number' ? {cx: v, zoom: 1} : v));
		const glide = {...clamp, easing: Easing.inOut(Easing.cubic)};
		return {
			cx: interpolate(f, [at, at + 18], [a.cx, b.cx], glide),
			zoom: a.zoom === b.zoom ? a.zoom : interpolate(f, [at, at + 18], [a.zoom, b.zoom], glide),
			top: spec.top,
			bottom: spec.bottom,
		};
	};

	// the film in its virtual 1920×1080 frame, scaled into the band (the film's frame numbers)
	const FilmBand: React.FC<{sh: FilmShortSpec}> = ({sh}) => {
		const f = useCurrentFrame();
		const {cx, zoom, top, bottom} = viewAt(f, sh.framing);
		const k = K * zoom;
		const srcW = SRC_W / zoom;
		const crop = cx - srcW / 2; // the film's x at the left edge of the band
		const ty = (VH - 1080 * k) / 2; // a zoomed-out shot sits in the middle of the band's height
		let hudOn = sh.hud === false ? 0 : 1;
		if (Array.isArray(sh.hud)) {
			const [h0, h1] = [SHOTS[sh.hud[0] - 1], SHOTS[sh.hud[1] - 1]];
			const [t0, t1] = [Math.round(r.fwd(h0.from)), Math.round(r.fwd(h1.from + h1.duration))];
			hudOn = interpolate(f, [t0 - 10, t0, t1, t1 + 10], [0, 1, 1, 0], clamp);
		}
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
					<film.Scenes only={sh.shots} />
					{/* the counters, in the corners of what the band shows */}
					{hudOn > 0 && (
						<div style={{position: 'absolute', left: crop, top: 0, width: srcW, height: 1080, opacity: hudOn < 1 ? hudOn : undefined}}>
							<film.Hud />
						</div>
					)}
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
					<film.Sound />
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

	const Short: React.FC<{n: number}> = ({n}) => {
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
						<FilmBand sh={sh} />
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

	const ShortAudio: React.FC<{n: number}> = ({n}) => (
		<AbsoluteFill style={{background: '#000'}}>
			<ShortSound n={n} />
		</AbsoluteFill>
	);

	return {SHORTS, shortRange, shortDuration, Short, ShortAudio};
};
