// YouTube covers for «Каково это — умереть от лап медведя» (1280×720, on the channel's white page, like «ОН ЖИВ!»):
// a poster shot — Гога in front, screaming, his hands on his cheeks; behind him the bear from the film has reared up
// on its hind legs, roaring (angry brows, the wide jaw, fangs), the claws of one paw raised right over his head.
//   CoverMedved  — «НЕ / БЕГИ!» (mistake two: you never run from a bear — the video says why)
//   CoverMedvedB — «50 КМ/Ч» (that is how fast it runs: you cannot outrun it)
//   CoverMedvedC — «ЛЕЧЬ ИЛИ ДРАТЬСЯ?» (play dead or fight back — the video says when which)
// Render: npx remotion still CoverMedved out/cover/medved.png --scale=1.5   (→ 1920×1080)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BearUp} from '../components/Bear';
import {hangTo} from '../z2/kit';
import {You} from '../z4/kit';
import {AliveWord} from './kit';

// the shot: Гога (feet below the frame) and the bear behind him, both with a soft shadow on the white page
const Shot: React.FC<{id: string; children?: React.ReactNode}> = ({id, children}) => (
	<AbsoluteFill style={{background: '#ffffff', overflow: 'hidden'}}>
		<svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
			<defs>
				<filter id={`${id}-sh`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
					<feGaussianBlur in="SourceAlpha" stdDeviation={14} />
					<feOffset dx={10} dy={16} result="b" />
					<feFlood floodColor="#2a1a0e" floodOpacity={0.28} />
					<feComposite in2="b" operator="in" />
					<feMerge>
						<feMergeNode />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<g filter={`url(#${id}-sh)`}>
				<BearUp x={BEAR.x} y={BEAR.y} s={BEAR.s} ears="back" arms={1.62} head={-6} angry roar claw={2.6} />
			</g>
			<g filter={`url(#${id}-sh)`}>
				<You
					x={GOGA.x}
					y={GOGA.y}
					s={GOGA.s}
					f={0}
					blink={0}
					tilt={-5}
					face={{eyes: 'wide', mouth: 'o', brows: 'worried', look: [0.7, -0.6], sweat: 1, pupil: 0.7}}
					armL={{el: [-156, -350], ha: [-118, -492], hang: hangTo(0.3, -1), front: true}}
					armR={{el: [156, -350], ha: [118, -492], hang: hangTo(-0.3, -1), front: true}}
				/>
			</g>
			{children}
		</svg>
	</AbsoluteFill>
);
const BEAR = {x: 905, y: 1010, s: 1.5};
const GOGA = {x: 610, y: 1000, s: 0.95};

export const CoverMedved: React.FC = () => (
	<Shot id="cm1">
		<AliveWord x={56} y={300} w={210} size={150} text="НЕ" onWhite />
		<AliveWord x={50} y={480} w={360} size={170} text="БЕГИ!" red onWhite />
	</Shot>
);

export const CoverMedvedB: React.FC = () => (
	<Shot id="cm2">
		<AliveWord x={50} y={330} w={250} size={210} text="50" red onWhite />
		<AliveWord x={56} y={470} w={330} size={124} text="КМ/Ч" onWhite />
	</Shot>
);

// «ЛЕЧЬ ИЛИ ДРАТЬСЯ?» — when to play dead and when to fight back: the video answers
export const CoverMedvedC: React.FC = () => (
	<Shot id="cm3">
		<AliveWord x={54} y={262} w={300} size={136} text="ЛЕЧЬ" onWhite />
		<AliveWord x={58} y={356} w={150} size={82} text="ИЛИ" onWhite />
		<AliveWord x={46} y={486} w={366} size={112} text="ДРАТЬСЯ?" red onWhite />
	</Shot>
);
