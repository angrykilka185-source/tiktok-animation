// Cover (YouTube thumbnail, 1280×720, white background) for «Что будет, если ты попадёшь в СССР»:
// the title on the left («В СССР» big and red), on the right — you in the Soviet school uniform with the pioneer tie,
// shocked, showing the viewer your phone: «НЕТ СЕТИ» (it is 1981). A 2-kopeck coin and the pioneer badge as stickers.
// Render: npx remotion still CoverSssr out/cover/sssr.png --scale=1.5  (→ 1920×1080)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEAVY} from '../components/Overlays';
import {SPECS} from '../components/Person';
import {You} from '../u1/kit';
import {Kopeck2, PioneerBadge} from '../u1/town';
import {starD} from '../w1/old';

const RED = '#d8282a';
const RED_D = '#8f1416';
const INK = '#16161c';

// the hero: feet at (HX, HY), scale HS (the head top lands at y ≈ 95)
const HX = 1000;
const HY = 1182;
const HS = 1.15;
const toLocal = (sx: number, sy: number): [number, number] => [(sx - HX) / HS, (sy - HY) / HS];

// the phone in screen space: centre, tilt; GRIP = where your hand holds it (phone-local)
const PH = {x: 808, y: 292, rot: -8};
const GRIP: [number, number] = [-60, 98];
const gripScreen = (): [number, number] => {
	const a = (PH.rot * Math.PI) / 180;
	return [PH.x + GRIP[0] * Math.cos(a) - GRIP[1] * Math.sin(a), PH.y + GRIP[0] * Math.sin(a) + GRIP[1] * Math.cos(a)];
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
		{/* the big crossed-out antenna */}
		<g transform="translate(0,-42)">
			{[0, 1, 2, 3].map((k) => (
				<rect key={k} x={-30 + k * 16} y={14 - k * 12} width={11} height={16 + k * 12} rx={2} fill="#9aa1ae" />
			))}
			<line x1={-36} y1={-30} x2={36} y2={34} stroke={RED} strokeWidth={9} strokeLinecap="round" />
		</g>
		<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={29} fill={INK}>
			НЕТ
		</text>
		<text x={0} y={62} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={29} fill={INK}>
			СЕТИ
		</text>
	</g>
);

export const CoverSssr: React.FC = () => {
	const [gx, gy] = gripScreen();
	const r = SPECS.teen.armW * 0.56 * HS; // the hand oval, as Person draws it
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
				{/* you: the school uniform and the pioneer tie; shocked, showing the phone */}
				<g filter="url(#cv-stk)">
					<You
						id="cvyou"
						x={HX}
						y={HY}
						scale={HS}
						face={{eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: 'o', blush: true, look: [-0.15, 0.05]}}
						armL={{target: toLocal(gx, gy), bend: -1}}
					/>
					<NoSignalPhone />
					{/* your fingers over the edge of the phone */}
					<ellipse cx={gx} cy={gy} rx={r * 0.98} ry={r * 1.1} fill={SPECS.teen.skin} transform={`rotate(${PH.rot} ${gx} ${gy})`} />
				</g>
				{/* the stickers: the 2-kopeck coin (the soda water, the payphone) and the pioneer badge */}
				<g filter="url(#cv-stk)">
					<g transform="translate(1196,548) rotate(-12) scale(0.55)">
						<Kopeck2 />
					</g>
				</g>
				<g filter="url(#cv-stk)">
					<g transform="translate(1196,150) rotate(12) scale(0.36)">
						<PioneerBadge />
					</g>
				</g>
			</svg>
			{/* the title */}
			<div style={{position: 'absolute', left: 46, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900, color: INK, lineHeight: 1.04, whiteSpace: 'nowrap'}}>
				<div style={{fontSize: 52}}>ЧТО БУДЕТ,</div>
				<div style={{fontSize: 52}}>ЕСЛИ ТЫ ПОПАДЁШЬ</div>
				<div style={{fontSize: 166, color: RED, marginTop: 10, marginLeft: -6, letterSpacing: -2, lineHeight: 0.95, textShadow: `0 8px 0 ${RED_D}`}}>В СССР</div>
				<div style={{display: 'flex', gap: 14, marginTop: 30}}>
					{['1981', '1 ДЕНЬ', '1 ЗАРЯД'].map((t, k) => (
						<div key={t} style={{background: k === 0 ? RED : INK, color: '#fff', fontSize: 36, padding: '8px 20px 10px', borderRadius: 14}}>
							{t}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
