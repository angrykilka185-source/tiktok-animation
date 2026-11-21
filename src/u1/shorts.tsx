// Vertical shorts (1080×1920) cut from «Что будет, если ты попадёшь в СССР» — teasers for the full film.
// Each short plays a run of the film's shots (the original vector scenes, drawn in a virtual 1920×1080 frame and
// scaled into a band across the middle), with a hook title above, big captions below and, at the end, a card
// with the film's cover: «ПОЛНОЕ ВИДЕО — НА КАНАЛЕ». The style follows the cover: white, black and red.
// Render: scripts/render-parallel.sh SssrShort1 SssrShort1Audio out/sssr-short-1.mp4   (… up to SssrShort5)
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {CoverSssr} from '../covers/Sssr';
import {starD} from '../w1/old';
import {HUD81} from './kit';
import {HUD_SHOW, HUD_TICKS, RU1, Sssr1Picture} from './Main';
import {SFXU1} from './SFX';
import {shotStart, SHOTS} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

const RED = '#d8282a';
const RED_D = '#8f1416';
const INK = '#16161c';
const BLUE = '#1d5fd1'; // the quotes (the message on the phone, what people say)

// the layout of the vertical frame
const VY = 560; // the band with the film
const VH = 740;
const K = VH / 1080; // the film's scale in the band
const SRC_W = 1080 / K; // how much of the film's width the band shows (the middle ≈ 1576 of 1920 px)
const CAP_Y = VY + VH + 44; // the captions
export const CTA = 96; // the end card, frames

type Short = {
	shots: [number, number]; // the film's shots, first..last (inclusive)
	hook: string[]; // the title lines; a line starting with «*» is red
	cta: string[]; // the end card headline (lines, «*» = red)
	// where the band looks, per shot (the film's x of its centre; default 960): a number, or a pan that ends on a word
	// (a price tag or a stamp near the edge of the 16:9 frame comes into the band)
	framing?: Record<number, number | Pan>;
};
type Pan = {from: number; to: number; word: string; add?: number};

export const SHORTS: Short[] = [
	{shots: [1, 7], hook: ['ТЫ ПРОСЫПАЕШЬСЯ', '*В 1981 ГОДУ'], cta: ['ЧТО БУДЕТ', '*ДАЛЬШЕ?']},
	{shots: [22, 31], hook: ['С ТЕЛЕФОНОМ', '*В СОВЕТСКУЮ', '*ШКОЛУ'], cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ДНЯ'], framing: {24: 1045}},
	{shots: [34, 42], hook: ['ГАЗИРОВКА', '*ИЗ ОДНОГО', '*СТАКАНА'], cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ДНЯ'], framing: {35: {from: 935, to: 985, word: 'три', add: -16}, 37: 885}},
	{shots: [47, 52], hook: ['ПОЗВОНИТЬ МАМЕ', '*ЗА 2 КОПЕЙКИ'], cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ДНЯ'], framing: {49: {from: 960, to: 1062, word: 'годы', add: -20}}},
	{
		shots: [60, 68],
		hook: ['КВАРТИРА', 'БЕСПЛАТНО,', '*НО ЖДАТЬ 10 ЛЕТ'],
		cta: ['ЭТО ЛИШЬ', '*ЧАСТЬ ДНЯ'],
		framing: {63: {from: 892, to: 1127, word: 'через', add: -16}, 64: 1035, 67: {from: 1000, to: 1085, word: 'несколько', add: -16}, 68: {from: 790, to: 1040, word: 'десять', add: -16}},
	},
];

// the run of the film a short plays: output frames [a, b)
export const shortRange = (n: number) => {
	const sh = SHORTS[n - 1];
	const first = SHOTS[sh.shots[0] - 1];
	const last = SHOTS[sh.shots[1] - 1];
	const a = Math.round(RU1.fwd(first.from));
	const b = Math.round(RU1.fwd(last.from + last.duration));
	return {a, b, len: b - a};
};
export const shortDuration = (n: number) => shortRange(n).len + CTA;

// one line of the title, sized to fit the width (the heavy Cyrillic capitals are ≈ 0.8 em wide)
const fit = (t: string, max: number, width = 980) => Math.min(max, Math.floor(width / (t.length * 0.8)));

const Kicker: React.FC = () => (
	<div style={{position: 'absolute', top: 168, width: '100%', textAlign: 'center'}}>
		<div style={{display: 'inline-block', background: INK, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 32, letterSpacing: 1, padding: '12px 28px 13px', borderRadius: 40}}>
			ЧТО БУДЕТ, ЕСЛИ ТЫ ПОПАДЁШЬ <span style={{color: '#ff6b5e'}}>В СССР</span>
		</div>
	</div>
);

// the faint red rays and star behind the title (the cover's look)
const Backdrop: React.FC = () => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
		<defs>
			<radialGradient id="sh-fade" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0.2" stopColor="#fff" />
				<stop offset="1" stopColor="#000" />
			</radialGradient>
			<mask id="sh-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
				<circle cx={540} cy={360} r={620} fill="url(#sh-fade)" />
			</mask>
		</defs>
		<g mask="url(#sh-mask)">
			{Array.from({length: 18}).map((_, k) => {
				const a = (k / 18) * Math.PI * 2;
				const R = 1100;
				return <path key={k} d={`M 540,360 L ${540 + Math.cos(a) * R},${360 + Math.sin(a) * R} L ${540 + Math.cos(a + 0.11) * R},${360 + Math.sin(a + 0.11) * R} Z`} fill={RED} opacity={0.05} />;
			})}
			<path d={starD(540, 380, 300)} fill={RED} opacity={0.05} />
		</g>
	</svg>
);

const Hook: React.FC<{lines: string[]; s?: number}> = ({lines, s: given}) => {
	const f = useCurrentFrame();
	// visible from the very first frame (the feed shows it), it just settles in
	const s = given ?? interpolate(f, [0, 10], [1.07, 1], clamp);
	const cap = lines.length > 2 ? 96 : 120;
	return (
		<div style={{position: 'absolute', top: 236, height: VY - 236 - 18, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: HEAVY, fontWeight: 900, lineHeight: 1.06, whiteSpace: 'nowrap', transform: `scale(${s})`}}>
			{lines.map((l, i) => {
				const red = l.startsWith('*');
				const t = red ? l.slice(1) : l;
				return (
					<div key={i} style={{fontSize: fit(t, cap), color: red ? RED : INK, textShadow: red ? `0 7px 0 ${RED_D}` : undefined}}>
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
	const len = ch.words.reduce((a, w) => a + w.w.length + 1, 0);
	const longest = Math.max(...ch.words.map((w) => w.w.length));
	const fs = longest > 12 ? Math.min(80, Math.floor(880 / (longest * 0.74))) : len > 18 ? 80 : 92;
	return (
		<div style={{position: 'absolute', left: 50, width: 880, top: CAP_Y, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: fs, lineHeight: 1.1, textTransform: 'uppercase'}}>
			{ch.words.map((w, i) => {
				const p = pop(f, w.at, 12);
				const active = f >= w.at;
				const color = w.red ? RED : w.quote ? BLUE : INK;
				return (
					<span key={i + w.w} style={{display: 'inline-block', margin: '0 10px', transform: `scale(${active ? 0.8 + 0.2 * p : 0.96})`, color: active ? color : '#cacad2'}}>
						{w.w.replace(/-/g, '‑')}
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
			<div style={{position: 'absolute', left: (1080 - CW) / 2, top: VY + (VH - CH) / 2, width: CW, height: CH, borderRadius: 26, overflow: 'hidden', boxShadow: '0 22px 50px rgba(40,10,10,0.28)', transform: `scale(${0.85 + 0.15 * pIn}) rotate(${(1 - pIn) * -3}deg)`}}>
				<div style={{position: 'absolute', width: 1280, height: 720, transform: `scale(${CW / 1280})`, transformOrigin: '0 0'}}>
					<CoverSssr />
				</div>
			</div>
			<div style={{position: 'absolute', left: 50, width: 880, top: CAP_Y + 10, textAlign: 'center', transform: `scale(${pBtn * pulse})`}}>
				<div style={{display: 'inline-block', background: RED, color: '#fff', fontFamily: HEAVY, fontWeight: 900, borderRadius: 30, padding: '20px 44px 24px', boxShadow: `0 9px 0 ${RED_D}`}}>
					<div style={{fontSize: 70, lineHeight: 1}}>▶ ПОЛНОЕ ВИДЕО</div>
					<div style={{fontSize: 42, lineHeight: 1, marginTop: 12, opacity: 0.95}}>УЖЕ НА КАНАЛЕ</div>
				</div>
			</div>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// the band's centre at a film frame
const cxAt = (f: number, framing: Short['framing']) => {
	const sh = SHOTS.find((x) => f >= Math.round(RU1.fwd(x.from)) && f < Math.round(RU1.fwd(x.from + x.duration)));
	const spec = sh && framing?.[sh.index];
	if (spec === undefined) return 960;
	if (typeof spec === 'number') return spec;
	const at = Math.round(RU1.fwd(shotStart(sh!.index) + w(sh!.index, spec.word, spec.add ?? 0)));
	return interpolate(f, [at, at + 18], [spec.from, spec.to], {...clamp, easing: Easing.inOut(Easing.cubic)});
};

// the film in its virtual 1920×1080 frame, scaled into the band (the film's frame numbers)
const FilmBand: React.FC<{framing: Short['framing']}> = ({framing}) => {
	const f = useCurrentFrame();
	const crop = cxAt(f, framing) - SRC_W / 2; // the film's x at the left edge of the band
	return (
		<Sequence width={1920} height={1080} name="кадр 16:9" style={{transform: `translateX(${-crop * K}px) scale(${K})`, transformOrigin: '0 0'}}>
			<Sssr1Picture />
			{/* the clock and the battery, in the corners of what the band shows */}
			<div style={{position: 'absolute', left: crop, top: 0, width: SRC_W, height: 1080}}>
				<HUD81 ticks={HUD_TICKS} show={HUD_SHOW} />
			</div>
		</Sequence>
	);
};

// the sound: the film's own track for the run, then a whoosh and a pop on the end card
const ShortSound: React.FC<{n: number}> = ({n}) => {
	const {a, b, len} = shortRange(n);
	return (
		<>
			<Sequence from={-a} durationInFrames={b} name="звук фильма">
				<SFXU1 r={RU1} />
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

export const SssrShort: React.FC<{n: number}> = ({n}) => {
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
			<div style={{position: 'absolute', left: 0, top: VY, width: 1080, height: VH, overflow: 'hidden', background: '#000', boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}>
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

export const SssrShortAudio: React.FC<{n: number}> = ({n}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<ShortSound n={n} />
	</AbsoluteFill>
);
