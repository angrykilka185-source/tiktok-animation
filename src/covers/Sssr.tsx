// Cover (YouTube thumbnail, 1280×720, white background) for «Что будет, если ты попадёшь в СССР»:
// the title on the left («В СССР» big and red), on the right — you in the Soviet school uniform with the pioneer tie,
// shocked, the phone up beside the head: «НЕТ СЕТИ» (it is 1981). A 2-kopeck coin and the pioneer badge as stickers.
// Render: npx remotion still CoverSssr out/cover/sssr.png --scale=1.5  (→ 1920×1080)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {SPECS, type ArmPose} from '../components/Person';
import {You} from '../u1/kit';
import {Kopeck2, PioneerBadge} from '../u1/town';
import {starD} from '../w1/old';

const RED = '#d8282a';
const RED_D = '#8f1416';
const INK = '#16161c';

// the hero: feet at (HX, HY), scale HS (the head top lands at y ≈ 95)
const HX = 990;
const HY = 1182;
const HS = 1.15;
const toLocal = (sx: number, sy: number): [number, number] => [(sx - HX) / HS, (sy - HY) / HS];

// an arm of the hero (screen coords): bends at `elbow`, the hand ends at `hand` (the upper arm and the forearm are
// foreshortened to fit, ku / kf), so the elbow stays close to the body
const armTo = (side: -1 | 1, elbow: [number, number], hand: [number, number]): ArmPose => {
	const sp = SPECS.teen;
	const sx = HX + side * (sp.shoulderW / 2 - sp.armW / 2 + 4) * HS;
	const sy = HY + (-sp.leg - sp.torso + sp.armW / 2) * HS;
	const l1 = Math.hypot(elbow[0] - sx, elbow[1] - sy) / HS;
	const l2 = Math.hypot(hand[0] - elbow[0], hand[1] - elbow[1]) / HS;
	const cross = (hand[0] - sx) * (elbow[1] - sy) - (hand[1] - sy) * (elbow[0] - sx);
	return {target: toLocal(hand[0], hand[1]), bend: cross > 0 ? 1 : -1, ku: l1 / sp.upper, kf: (l2 - sp.armW * 0.56 * 0.8) / sp.fore};
};

// the phone in screen space (beside your head, on the right): centre and tilt; phone-local → screen
const PH = {x: 1170, y: 268, rot: 7};
const phonePt = (lx: number, ly: number): [number, number] => {
	const a = (PH.rot * Math.PI) / 180;
	return [PH.x + lx * Math.cos(a) - ly * Math.sin(a), PH.y + lx * Math.sin(a) + ly * Math.cos(a)];
};

const NoSignalPhone: React.FC = () => (
	<g transform={`translate(${PH.x},${PH.y}) rotate(${PH.rot})`}>
		<rect x={-64} y={-124} width={128} height={248} rx={20} fill={INK} />
		<rect x={-56} y={-112} width={112} height={224} rx={13} fill="#f3f5fa" />
		{/* status bar: the signal bars (empty) and the battery at 100% */}
		{[0, 1, 2, 3].map((k) => (
			<rect key={k} x={-44 + k * 8} y={-92 - k * 3} width={5} height={7 + k * 3} rx={1} fill="#b9bec9" />
		))}
		<rect x={14} y={-99} width={26} height={12} rx={3} fill="none" stroke={INK} strokeWidth={2} />
		<rect x={40} y={-96} width={3} height={6} rx={1} fill={INK} />
		<rect x={16} y={-97} width={22} height={8} rx={1.5} fill="#3fbf5a" />
		{/* the big crossed-out antenna, then «НЕТ СЕТИ» — all in the upper part of the screen (the hand holds the bottom) */}
		<g transform="translate(0,-50)">
			{[0, 1, 2, 3].map((k) => (
				<rect key={k} x={-30 + k * 16} y={14 - k * 12} width={11} height={16 + k * 12} rx={2} fill="#9aa1ae" />
			))}
			<line x1={-36} y1={-30} x2={36} y2={34} stroke={RED} strokeWidth={9} strokeLinecap="round" />
		</g>
		<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			НЕТ
		</text>
		<text x={0} y={47} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={INK}>
			СЕТИ
		</text>
	</g>
);

export const CoverSssr: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#ffffff', overflow: 'hidden'}}>
			<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
				<defs>
					{/* a "sticker": white outline + a soft shadow under it */}
					<filter id="cv-stk" x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
						<feMorphology in="SourceAlpha" operator="dilate" radius={6} result="d" />
						<feFlood floodColor="#ffffff" />
						<feComposite in2="d" operator="in" result="outline" />
						<feGaussianBlur in="d" stdDeviation={7} result="b" />
						<feOffset in="b" dx={0} dy={9} result="sh" />
						<feFlood floodColor="#3a0a0a" floodOpacity={0.22} />
						<feComposite in2="sh" operator="in" result="shadow" />
						<feMerge>
							<feMergeNode in="shadow" />
							<feMergeNode in="outline" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<radialGradient id="cv-fade" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0.35" stopColor="#fff" />
						<stop offset="1" stopColor="#000" />
					</radialGradient>
					<mask id="cv-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1280} height={720}>
						<circle cx={HX} cy={330} r={640} fill="url(#cv-fade)" />
					</mask>
					<radialGradient id="cv-disc" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#ffe6e2" />
						<stop offset="0.75" stopColor="#fff1ef" />
						<stop offset="1" stopColor="#fff1ef" stopOpacity={0} />
					</radialGradient>
				</defs>
				{/* behind you (the background stays white): a faint red glow, the rays and a big star */}
				<circle cx={HX} cy={330} r={430} fill="url(#cv-disc)" />
				<g mask="url(#cv-mask)">
					{Array.from({length: 16}).map((_, k) => {
						const a = (k / 16) * Math.PI * 2 + 0.1;
						const R = 1000;
						return <path key={k} d={`M ${HX},330 L ${HX + Math.cos(a) * R},${330 + Math.sin(a) * R} L ${HX + Math.cos(a + 0.12) * R},${330 + Math.sin(a + 0.12) * R} Z`} fill={RED} opacity={0.05} />;
					})}
					<path d={starD(HX, 300, 330)} fill={RED} opacity={0.06} />
				</g>
				{/* you: the school uniform and the pioneer tie; shocked; the phone up beside your head, the elbow at your side */}
				<g filter="url(#cv-stk)">
					<NoSignalPhone />
					<You
						id="cvyou"
						x={HX}
						y={HY}
						scale={HS}
						face={{eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: 'o', blush: true, look: [-0.15, 0.05]}}
						armR={armTo(1, [1152, 572], phonePt(-4, 100))}
					/>
				</g>
				{/* the stickers: the 2-kopeck coin (the soda water, the payphone) and the pioneer badge */}
				<g filter="url(#cv-stk)">
					<g transform="translate(640,652) rotate(-14) scale(0.5)">
						<Kopeck2 />
					</g>
				</g>
				<g filter="url(#cv-stk)">
					<g transform="translate(772,612) rotate(-10) scale(0.34)">
						<PioneerBadge />
					</g>
				</g>
			</svg>
			{/* the title — at the top */}
			<div style={{position: 'absolute', left: 46, top: 34, fontFamily: HEAVY, fontWeight: 900, color: INK, lineHeight: 1.14, whiteSpace: 'nowrap'}}>
				<div style={{fontSize: 70}}>ЧТО БУДЕТ, ЕСЛИ</div>
				<div style={{fontSize: 70}}>ТЫ ПОПАДЁШЬ</div>
				<div style={{fontSize: 205, color: RED, marginTop: 6, marginLeft: -8, letterSpacing: -3, lineHeight: 0.95, textShadow: `0 9px 0 ${RED_D}`}}>В СССР</div>
				<div style={{display: 'flex', gap: 16, marginTop: 34}}>
					{['1981', '1 ДЕНЬ', '1 ЗАРЯД'].map((t, k) => (
						<div key={t} style={{background: k === 0 ? RED : INK, color: '#fff', fontSize: 42, padding: '9px 24px 11px', borderRadius: 16}}>
							{t}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
