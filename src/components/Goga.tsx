// Гога — Чоби's brother, the one all the things in the films happen to (he gets lost in the desert, falls into the icy
// water…) while Чоби explains them. The same family of cute skeletons — the round head, the big shiny eyes, the
// heart-shaped nose, the pink cheeks — but his own look: no glasses and no mortarboard; a red cap turned to the side
// with «Г» on it, brows that show what he feels, freckles, a plaster on his cheek (things do happen to him), a gap in
// his smile; an open orange vest (the ribs stay in sight, so the heart, the brain, the vessels can still be shown on
// him), blue shorts, white trainers with a red stripe. Same units and props as Choby (feet at (x, y), shoulders at
// (±62, −380), the head centre at y − 560·s), plus:
//   brows  -1 worried … 0 … 1 cheeky (the left brow goes up);  hot 0…1 — a red flush;  noCap — without the cap
import React from 'react';
import {Choby} from './Choby';

export const GOGA = {
	cap: '#e8413f',
	capD: '#c22d2f',
	capL: '#ff7a6c',
	vest: '#f59a2b',
	vestD: '#dc7c16',
	vestLine: '#b5600c',
	vestEdge: '#fff1d6',
	shorts: '#2f66d6',
	shortsD: '#2553b5',
	shortsLine: '#1c3f8c',
	shoe: '#ffffff',
	shoeD: '#e4e8ee',
	sole: '#c3c8d2',
	stripe: '#e8413f',
	brow: '#2a2226',
	freckle: '#cf8f63',
};

const mix = (a: string, b: string, t: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// the red cap, turned a little to the side: the visor sticks out to the right, «Г» on the front panel; snow and icicles in the frost
export const GogaCap: React.FC<{frost?: number}> = ({frost = 0}) => (
	<g transform="translate(0,-14)">
		{/* the visor */}
		<path d="M 60,-652 C 126,-670 214,-668 254,-646 C 234,-622 166,-620 104,-640 Z" fill={GOGA.capD} />
		<path d="M 104,-640 C 166,-620 234,-622 254,-646 C 240,-632 170,-628 112,-644 Z" fill="#8f1c1e" opacity={0.55} />
		{/* the crown, the shade on its right half, a shine */}
		<path d="M -142,-636 C -150,-708 -88,-748 0,-748 C 88,-748 150,-708 142,-636 Q 0,-648 -142,-636 Z" fill={GOGA.cap} />
		<path d="M 0,-748 C 88,-748 150,-708 142,-636 Q 70,-644 0,-642 Z" fill={GOGA.capD} />
		<path d="M -116,-690 C -96,-726 -56,-740 -20,-742" stroke={GOGA.capL} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.85} />
		{/* the seams and the button */}
		<path d="M 0,-748 C -34,-728 -52,-696 -56,-644 M 0,-748 C 34,-728 52,-696 56,-644" stroke="#9c1f25" strokeWidth={3.5} fill="none" opacity={0.45} />
		<circle cx={0} cy={-748} r={11} fill={GOGA.capD} />
		{/* the band */}
		<path d="M -142,-636 Q 0,-648 142,-636 L 141,-624 Q 0,-636 -141,-624 Z" fill="#a8232a" />
		{/* the badge with «Г» */}
		<circle cx={50} cy={-694} r={27} fill="#fff" stroke="#a8232a" strokeWidth={4} />
		<path d="M 40,-680 L 40,-708 L 62,-708" stroke={GOGA.cap} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		{frost > 0 && (
			<g opacity={Math.min(1, frost * 1.3)}>
				<path d="M -118,-708 C -84,-750 84,-750 118,-708 C 92,-720 62,-712 40,-724 C 16,-712 -14,-722 -36,-712 C -60,-722 -92,-714 -118,-708 Z" fill="#f4fbff" />
				{[124, 156, 188, 220].map((ix, k) => (
					<path key={k} d={`M ${ix - 7},${-632 - (ix - 120) * 0.06} L ${ix + 7},${-632 - (ix - 120) * 0.06} L ${ix},${-632 + (16 + (k % 2) * 12) * Math.min(1, frost * 1.4)} Z`} fill="#dff2ff" />
				))}
			</g>
		)}
	</g>
);

// his face: brows, freckles on the left cheek, a plaster on the right cheekbone, the gap in his smile, a red flush in the heat
export const GogaFace: React.FC<{brows?: number; hot?: number}> = ({brows = 0, hot = 0}) => {
	const brow = (sd: 1 | -1) => {
		let yo = -624;
		let yi = -626;
		if (brows < 0) {
			yo = lerp(-624, -615, -brows);
			yi = lerp(-626, -636, -brows);
		} else if (sd < 0) {
			yo = lerp(-624, -636, brows);
			yi = lerp(-626, -632, brows);
		} else {
			yo = lerp(-624, -621, brows);
			yi = lerp(-626, -622, brows);
		}
		const [ox, ix] = [sd * 98, sd * 26];
		return <path key={sd} d={`M ${ox},${yo} Q ${(ox + ix) / 2},${Math.min(yo, yi) - 9} ${ix},${yi}`} stroke={GOGA.brow} strokeWidth={13} strokeLinecap="round" fill="none" />;
	};
	return (
		<g>
			{/* the gap in his smile: one upper tooth is missing */}
			<rect x={8.5} y={-467} width={11} height={14} rx={3} fill="#3a2226" />
			{hot > 0 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 98} cy={-498} rx={40} ry={22} fill="#ff3a3a" opacity={0.32 * hot} />)}
			{[[-120, -506], [-104, -494], [-90, -508], [-112, -484]].map(([fx, fy], k) => (
				<circle key={k} cx={fx} cy={fy} r={3.6} fill={GOGA.freckle} />
			))}
			<g transform="translate(124,-528) rotate(-32)">
				<rect x={-34} y={-12} width={68} height={24} rx={11} fill="#f2c79b" stroke="#d49a63" strokeWidth={3} />
				<rect x={-11} y={-9} width={22} height={18} rx={4} fill="#e6b583" />
				{[-24, -18, 18, 24].map((dx, k) => (
					<circle key={k} cx={dx} cy={k % 2 ? 4 : -4} r={1.7} fill="#d49a63" />
				))}
			</g>
			{brow(-1)}
			{brow(1)}
		</g>
	);
};

// the open orange vest over blue shorts (the arms go over it)
export const GogaClothes: React.FC = () => (
	<g>
		<path d="M -78,-228 L 78,-228 L 86,-140 C 64,-131 28,-131 10,-140 L 0,-174 L -10,-140 C -28,-131 -64,-131 -86,-140 Z" fill={GOGA.shorts} stroke={GOGA.shortsLine} strokeWidth={4} strokeLinejoin="round" />
		<path d="M 0,-228 L 78,-228 L 86,-140 C 64,-131 28,-131 10,-140 L 0,-174 Z" fill={GOGA.shortsD} />
		<rect x={-80} y={-236} width={160} height={16} rx={6} fill={GOGA.shortsLine} />
		{[1, -1].map((sd) => (
			<g key={sd} transform={`scale(${sd},1)`}>
				<path d="M -46,-408 L -76,-402 C -98,-396 -106,-376 -106,-354 L -102,-224 C -102,-212 -94,-204 -82,-204 L -50,-204 C -54,-280 -60,-346 -46,-408 Z" fill={sd > 0 ? GOGA.vest : GOGA.vestD} stroke={GOGA.vestLine} strokeWidth={4} strokeLinejoin="round" />
				<path d="M -48,-400 C -60,-344 -55,-280 -52,-210" stroke={GOGA.vestEdge} strokeWidth={6} strokeLinecap="round" fill="none" />
				<rect x={-96} y={-302} width={34} height={32} rx={5} fill="none" stroke={GOGA.vestLine} strokeWidth={3.5} />
				<path d="M -97,-303 L -61,-303 L -63,-290 L -95,-290 Z" fill={GOGA.vestLine} opacity={0.55} />
			</g>
		))}
	</g>
);

// white trainers with a red stripe, the toes outwards
export const GogaShoes: React.FC = () => (
	<g>
		{[-1, 1].map((sd) => (
			<g key={sd} transform={`translate(${sd * 46},-16) scale(${sd},1)`}>
				<path d="M -30,9 L 48,9 C 56,9 58,0 54,-4 L -33,-4 C -37,0 -37,9 -30,9 Z" fill={GOGA.sole} />
				<path d="M -33,-2 C -37,-22 -25,-34 -8,-34 C 6,-34 12,-26 20,-22 C 36,-17 52,-14 54,-4 L -33,-4 Z" fill={sd < 0 ? GOGA.shoe : GOGA.shoeD} stroke="#b4bac6" strokeWidth={3.5} strokeLinejoin="round" />
				<path d="M -16,-15 C 2,-9 22,-11 42,-11" stroke={GOGA.stripe} strokeWidth={6} strokeLinecap="round" fill="none" />
				<path d="M -5,-30 L 5,-24 M 3,-32 L 13,-26" stroke="#9aa0ab" strokeWidth={3} strokeLinecap="round" />
			</g>
		))}
	</g>
);

type ChobyProps = React.ComponentProps<typeof Choby>;
export const Goga: React.FC<Omit<ChobyProps, 'glasses' | 'tie' | 'hat' | 'face' | 'torso' | 'shoes' | 'cap' | 'cheek'> & {brows?: number; hot?: number; noCap?: boolean}> = ({
	brows = 0.5,
	hot = 0,
	noCap = false,
	frost = 0,
	armR = 'down',
	armL = 'down',
	...rest
}) => (
	<Choby
		{...rest}
		frost={frost}
		armR={armR}
		armL={armL}
		glasses={false}
		tie={false}
		cap={false}
		hat={noCap ? undefined : <GogaCap frost={frost} />}
		face={<GogaFace brows={brows} hot={hot} />}
		torso={<GogaClothes />}
		shoes={<GogaShoes />}
		cheek={hot > 0 ? mix('#f0868e', '#ff3030', hot) : undefined}
	/>
);
