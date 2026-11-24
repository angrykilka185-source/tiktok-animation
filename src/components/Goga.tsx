// Гога — Чоби's brother, the one all the things in the films happen to (he gets lost in the desert, falls into the icy
// water…) while Чоби explains them. The same family of cute skeletons — the round head, the big shiny eyes, the
// heart-shaped nose, the pink cheeks — but his own look: no glasses and no mortarboard; a red cap turned to the side
// with «Г» on it, brows that show what he feels, freckles, a plaster on his cheek (things do happen to him), a gap in
// his smile; an open orange vest (the ribs stay in sight, so the heart, the brain, the vessels can still be shown on
// him), blue shorts, white trainers with a red stripe. Same units and props as Choby (feet at (x, y), shoulders at
// (±62, −380), the head centre at y − 560·s; walk, back, bust, sweat, frost, shiver…), plus:
//   brows   -1 worried … 0 … 1 cheeky (the left brow goes up), or 'raised' (surprised) / 'angry'
//   hot 0…1 — a red flush;  noCap — without the cap;  pack — a backpack (the straps in front, the bag from behind,
//   a rolled sleeping bag on top);  outfit — 'vest' (his own), 'none' (only the shorts), 'robe' (a white desert robe and
//   a head scarf: the way the nomads dress), 'winter' (a puffy jacket, snow trousers, boots, a knitted hat, mittens, a scarf)
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
	pack: '#2e4f96',
	packD: '#243f7a',
	roll: '#3aa86a',
	robe: '#f7f3ea',
	robeD: '#e3dccb',
	robeLine: '#bfb59f',
};
export type Brows = number | 'raised' | 'angry';

const mix = (a: string, b: string, t: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// the red cap, turned a little to the side: the visor sticks out to the right, «Г» on the front panel; snow and icicles
// in the frost. From behind: the visor to the left, the strap over the arch at the back.
export const GogaCap: React.FC<{frost?: number; back?: boolean}> = ({frost = 0, back = false}) => (
	<g transform={`translate(0,-14)${back ? ' scale(-1,1)' : ''}`}>
		{/* the visor */}
		<path d="M 60,-652 C 126,-670 214,-668 254,-646 C 234,-622 166,-620 104,-640 Z" fill={GOGA.capD} />
		<path d="M 104,-640 C 166,-620 234,-622 254,-646 C 240,-632 170,-628 112,-644 Z" fill="#8f1c1e" opacity={0.55} />
		{/* the crown, the shade on its right half, a shine */}
		<path d="M -142,-636 C -150,-708 -88,-748 0,-748 C 88,-748 150,-708 142,-636 Q 0,-648 -142,-636 Z" fill={GOGA.cap} />
		<path d={back ? 'M 0,-748 C -88,-748 -150,-708 -142,-636 Q -70,-644 0,-642 Z' : 'M 0,-748 C 88,-748 150,-708 142,-636 Q 70,-644 0,-642 Z'} fill={GOGA.capD} />
		<path d={back ? 'M 116,-690 C 96,-726 56,-740 20,-742' : 'M -116,-690 C -96,-726 -56,-740 -20,-742'} stroke={GOGA.capL} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.85} />
		{/* the seams and the button */}
		<path d="M 0,-748 C -34,-728 -52,-696 -56,-644 M 0,-748 C 34,-728 52,-696 56,-644" stroke="#9c1f25" strokeWidth={3.5} fill="none" opacity={0.45} />
		<circle cx={0} cy={-748} r={11} fill={GOGA.capD} />
		{/* the band */}
		<path d="M -142,-636 Q 0,-648 142,-636 L 141,-624 Q 0,-636 -141,-624 Z" fill="#a8232a" />
		{back ? (
			// the arch at the back and its strap
			<g>
				<path d="M -38,-630 C -36,-672 36,-672 38,-630 Z" fill="#a8232a" />
				<path d="M -30,-634 C -28,-664 28,-664 30,-634 Z" fill="#e9e2d2" />
				<rect x={-34} y={-650} width={68} height={12} rx={5} fill={GOGA.capD} />
				<rect x={-8} y={-652} width={16} height={16} rx={3} fill="#d9d9de" />
			</g>
		) : (
			// the badge with «Г»
			<g>
				<circle cx={50} cy={-694} r={27} fill="#fff" stroke="#a8232a" strokeWidth={4} />
				<path d="M 40,-680 L 40,-708 L 62,-708" stroke={GOGA.cap} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			</g>
		)}
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

// a white head scarf (with the robe): wrapped over the top of the skull, the ends hang behind
const HeadScarf: React.FC = () => (
	<g>
		<path d="M -156,-600 C -166,-700 -90,-742 0,-742 C 90,-742 166,-700 156,-600 C 120,-626 60,-640 0,-640 C -60,-640 -120,-626 -156,-600 Z" fill={GOGA.robe} stroke={GOGA.robeLine} strokeWidth={4} />
		<path d="M 0,-742 C 90,-742 166,-700 156,-600 C 120,-626 60,-640 0,-640 Z" fill={GOGA.robeD} />
		<path d="M -150,-618 C -90,-646 90,-646 150,-618 L 152,-600 C 90,-628 -90,-628 -152,-600 Z" fill="#c9a86a" />
	</g>
);
const ScarfTails: React.FC = () => (
	<g>
		<path d="M -150,-600 C -176,-520 -170,-450 -140,-400 L -96,-420 C -112,-470 -120,-530 -110,-600 Z" fill={GOGA.robeD} stroke={GOGA.robeLine} strokeWidth={4} />
		<path d="M 150,-600 C 176,-520 170,-450 140,-400 L 96,-420 C 112,-470 120,-530 110,-600 Z" fill={GOGA.robeD} stroke={GOGA.robeLine} strokeWidth={4} />
	</g>
);

// his face: brows, freckles on the left cheek, a plaster on the right cheekbone, the gap in his smile, a red flush in the heat
export const GogaFace: React.FC<{brows?: Brows; hot?: number}> = ({brows = 0, hot = 0}) => {
	const brow = (sd: 1 | -1) => {
		let yo = -624;
		let yi = -626;
		if (brows === 'raised') {
			yo = -632;
			yi = -637;
		} else if (brows === 'angry') {
			yo = -634;
			yi = -617;
		} else if (brows < 0) {
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
			{[
				[-120, -506],
				[-104, -494],
				[-90, -508],
				[-112, -484],
			].map(([fx, fy], k) => (
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

const Shorts: React.FC<{back?: boolean}> = ({back}) => (
	<g>
		<path d="M -78,-228 L 78,-228 L 86,-140 C 64,-131 28,-131 10,-140 L 0,-174 L -10,-140 C -28,-131 -64,-131 -86,-140 Z" fill={GOGA.shorts} stroke={GOGA.shortsLine} strokeWidth={4} strokeLinejoin="round" />
		<path d="M 0,-228 L 78,-228 L 86,-140 C 64,-131 28,-131 10,-140 L 0,-174 Z" fill={GOGA.shortsD} />
		<rect x={-80} y={-236} width={160} height={16} rx={6} fill={GOGA.shortsLine} />
		{back && [-1, 1].map((sd) => <rect key={sd} x={sd > 0 ? 22 : -62} y={-212} width={40} height={30} rx={6} fill="none" stroke={GOGA.shortsLine} strokeWidth={3.5} />)}
	</g>
);

// winter: a puffy orange jacket (quilted, a zip), dark-blue snow trousers, brown boots with fur tops, a red knitted hat
// with a white cuff and a pompom, red mittens and the striped scarf
export const WINTER = {
	jacket: '#f08a2a',
	jacketD: '#d26f16',
	jacketLine: '#a4520a',
	sleeves: {c: '#f08a2a', d: '#d26f16', line: '#a4520a'},
	pants: {c: '#2b4f9e', d: '#22407f', line: '#16295a'},
	boot: '#6a4026',
	bootD: '#55321c',
	bootLine: '#3a2414',
	fur: '#f3ead8',
};
const Jacket: React.FC<{back?: boolean}> = ({back}) => (
	<g>
		<path d="M -84,-418 C -112,-410 -120,-380 -118,-340 L -114,-168 C -114,-152 -102,-142 -86,-142 L 86,-142 C 102,-142 114,-152 114,-168 L 118,-340 C 120,-380 112,-410 84,-418 Z" fill={WINTER.jacket} stroke={WINTER.jacketLine} strokeWidth={5} strokeLinejoin="round" />
		<path d="M 0,-418 L 84,-418 C 112,-410 120,-380 118,-340 L 114,-168 C 114,-152 102,-142 86,-142 L 0,-142 Z" fill={WINTER.jacketD} />
		{[-358, -300, -242].map((y) => (
			<path key={y} d={`M -116,${y} C -40,${y + 9} 40,${y + 9} 116,${y}`} stroke={WINTER.jacketLine} strokeWidth={4} fill="none" opacity={0.55} />
		))}
		{!back && <path d="M 0,-412 L 0,-150" stroke={WINTER.jacketLine} strokeWidth={5} />}
		{!back && <rect x={-7} y={-396} width={14} height={22} rx={4} fill="#d8d8de" stroke={WINTER.jacketLine} strokeWidth={3} />}
		<rect x={-114} y={-168} width={228} height={26} rx={11} fill={WINTER.jacketLine} opacity={0.75} />
	</g>
);
// a winter boot with a fur top, the toe outwards (from behind: the heel)
export const WinterBoot: React.FC<{side: 1 | -1; back?: boolean}> = ({side, back}) => (
	<g transform={`translate(${side * 46},-16) scale(${side},1)`}>
		{back ? (
			<g>
				<path d="M -40,10 L 36,10 C 42,10 44,2 40,-2 L -42,-2 C -46,2 -46,10 -40,10 Z" fill={WINTER.bootLine} />
				<path d="M -40,0 L -36,-56 L 32,-56 L 36,0 Z" fill={side < 0 ? WINTER.boot : WINTER.bootD} stroke={WINTER.bootLine} strokeWidth={4} strokeLinejoin="round" />
				<rect x={-44} y={-70} width={84} height={22} rx={10} fill={WINTER.fur} stroke="#cfc4ad" strokeWidth={3} />
			</g>
		) : (
			<g>
				<path d="M -34,10 L 52,10 C 60,10 62,0 58,-4 L -37,-4 C -41,0 -41,10 -34,10 Z" fill={WINTER.bootLine} />
				<path d="M -36,-2 L -32,-58 L 18,-58 L 20,-30 C 38,-24 56,-18 58,-4 L -36,-4 Z" fill={side < 0 ? WINTER.boot : WINTER.bootD} stroke={WINTER.bootLine} strokeWidth={4} strokeLinejoin="round" />
				<rect x={-40} y={-72} width={66} height={22} rx={10} fill={WINTER.fur} stroke="#cfc4ad" strokeWidth={3} />
			</g>
		)}
	</g>
);
// the red knitted hat with a white cuff and a pompom (it turns with the head; «Г» on the cuff in front)
export const Beanie: React.FC<{back?: boolean}> = ({back}) => (
	<g transform="translate(0,-10)">
		<circle cx={0} cy={-790} r={30} fill="#fbf7ee" stroke="#cfc4ad" strokeWidth={4} />
		<path d="M -146,-646 C -156,-724 -92,-772 0,-772 C 92,-772 156,-724 146,-646 Z" fill={GOGA.cap} stroke="#9c1f25" strokeWidth={4} />
		<path d={back ? 'M 0,-772 C -92,-772 -156,-724 -146,-646 L 0,-646 Z' : 'M 0,-772 C 92,-772 156,-724 146,-646 L 0,-646 Z'} fill={GOGA.capD} />
		{[-96, -48, 0, 48, 96].map((x) => (
			<path key={x} d={`M ${x},-656 C ${x * 0.94},-704 ${x * 0.7},-742 ${x * 0.34},-764`} stroke="#9c1f25" strokeWidth={3.5} fill="none" opacity={0.35} />
		))}
		<rect x={-158} y={-676} width={316} height={46} rx={21} fill="#fbf7ee" stroke="#cfc4ad" strokeWidth={4} />
		{!back && (
			<text x={0} y={-640} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight={900} fontSize={34} fill={GOGA.cap}>
				Г
			</text>
		)}
	</g>
);

// what he wears over the bones (drawn under the arms)
export const GogaClothes: React.FC<{outfit?: 'vest' | 'none' | 'robe' | 'winter'; back?: boolean; pack?: boolean}> = ({outfit = 'vest', back = false, pack = false}) => {
	if (outfit === 'robe')
		return (
			<g>
				<path d="M -70,-410 L 70,-410 C 96,-330 112,-220 118,-112 C 60,-100 -60,-100 -118,-112 C -112,-220 -96,-330 -70,-410 Z" fill={GOGA.robe} stroke={GOGA.robeLine} strokeWidth={4} strokeLinejoin="round" />
				<path d="M 0,-410 L 70,-410 C 96,-330 112,-220 118,-112 C 80,-104 40,-102 0,-102 Z" fill={GOGA.robeD} />
				{!back && <path d="M -26,-410 L 0,-350 L 26,-410" stroke={GOGA.robeLine} strokeWidth={5} fill="none" strokeLinejoin="round" />}
				<path d="M -60,-246 C -20,-238 20,-238 60,-246" stroke="#c9a86a" strokeWidth={10} fill="none" strokeLinecap="round" />
			</g>
		);
	const vest =
		outfit === 'vest' &&
		(back ? (
			<g>
				<path d="M -76,-408 L 76,-408 C 98,-402 106,-380 106,-354 L 102,-224 C 102,-212 94,-204 82,-204 L -82,-204 C -94,-204 -102,-212 -102,-224 L -106,-354 C -106,-380 -98,-402 -76,-408 Z" fill={GOGA.vest} stroke={GOGA.vestLine} strokeWidth={4} strokeLinejoin="round" />
				<path d="M 0,-408 L 76,-408 C 98,-402 106,-380 106,-354 L 102,-224 C 102,-212 94,-204 82,-204 L 0,-204 Z" fill={GOGA.vestD} />
				<path d="M -100,-352 C -40,-342 40,-342 100,-352" stroke={GOGA.vestLine} strokeWidth={3.5} fill="none" opacity={0.7} />
			</g>
		) : (
			[1, -1].map((sd) => (
				<g key={sd} transform={`scale(${sd},1)`}>
					<path d="M -46,-408 L -76,-402 C -98,-396 -106,-376 -106,-354 L -102,-224 C -102,-212 -94,-204 -82,-204 L -50,-204 C -54,-280 -60,-346 -46,-408 Z" fill={sd > 0 ? GOGA.vest : GOGA.vestD} stroke={GOGA.vestLine} strokeWidth={4} strokeLinejoin="round" />
					<path d="M -48,-400 C -60,-344 -55,-280 -52,-210" stroke={GOGA.vestEdge} strokeWidth={6} strokeLinecap="round" fill="none" />
					<rect x={-96} y={-302} width={34} height={32} rx={5} fill="none" stroke={GOGA.vestLine} strokeWidth={3.5} />
					<path d="M -97,-303 L -61,-303 L -63,-290 L -95,-290 Z" fill={GOGA.vestLine} opacity={0.55} />
				</g>
			))
		));
	const bag =
		pack &&
		(back ? (
			<g>
				<rect x={-94} y={-440} width={188} height={210} rx={34} fill={GOGA.pack} stroke="#18284c" strokeWidth={5} />
				<rect x={0} y={-440} width={94} height={210} rx={0} fill={GOGA.packD} opacity={0.6} />
				<rect x={-62} y={-330} width={124} height={80} rx={18} fill={GOGA.packD} stroke="#18284c" strokeWidth={4} />
				<path d="M -50,-312 L 50,-312" stroke="#f2c230" strokeWidth={5} strokeLinecap="round" />
				{/* the rolled sleeping bag on top */}
				<rect x={-104} y={-478} width={208} height={48} rx={24} fill={GOGA.roll} stroke="#1f6a3e" strokeWidth={5} />
				{[-50, 0, 50].map((rx) => (
					<line key={rx} x1={rx} y1={-476} x2={rx} y2={-432} stroke="#1f6a3e" strokeWidth={4} opacity={0.6} />
				))}
			</g>
		) : (
			<g>
				{[-1, 1].map((sd) => (
					<path key={sd} d={`M ${sd * 40},-410 C ${sd * 66},-404 ${sd * 72},-380 ${sd * 70},-350 L ${sd * 66},-262 L ${sd * 48},-262 L ${sd * 52},-350 C ${sd * 54},-372 ${sd * 48},-392 ${sd * 30},-400 Z`} fill={GOGA.pack} stroke="#18284c" strokeWidth={4} strokeLinejoin="round" />
				))}
				<rect x={-62} y={-344} width={124} height={14} rx={6} fill={GOGA.packD} stroke="#18284c" strokeWidth={3.5} />
				<rect x={-12} y={-348} width={24} height={22} rx={5} fill="#d9d9de" stroke="#18284c" strokeWidth={3} />
			</g>
		));
	return (
		<g>
			{outfit === 'winter' ? <Jacket back={back} /> : <Shorts back={back} />}
			{vest}
			{bag}
		</g>
	);
};

// the robe's wide sleeves (drawn over the arms)
const RobeSleeves: React.FC = () => (
	<g>
		{[-1, 1].map((sd) => (
			<path key={sd} d={`M ${sd * 56},-408 C ${sd * 96},-404 ${sd * 118},-360 ${sd * 122},-300 L ${sd * 74},-292 C ${sd * 70},-340 ${sd * 62},-376 ${sd * 40},-396 Z`} fill={sd < 0 ? GOGA.robe : GOGA.robeD} stroke={GOGA.robeLine} strokeWidth={4} strokeLinejoin="round" />
		))}
	</g>
);

// a white trainer with a red stripe, the toe outwards (from behind: the heel with a red tab)
export const GogaShoe: React.FC<{side: 1 | -1; back?: boolean}> = ({side, back}) => (
	<g transform={`translate(${side * 46},-16) scale(${side},1)`}>
		{back ? (
			<g>
				<path d="M -36,8 L 30,8 C 38,8 40,0 36,-4 L -38,-4 C -42,0 -42,8 -36,8 Z" fill={GOGA.sole} />
				<path d="M -38,-2 C -40,-24 -22,-34 -4,-34 C 14,-34 32,-24 34,-2 Z" fill={side < 0 ? GOGA.shoe : GOGA.shoeD} stroke="#b4bac6" strokeWidth={3.5} />
				<rect x={-10} y={-36} width={20} height={20} rx={5} fill={GOGA.stripe} />
			</g>
		) : (
			<g>
				<path d="M -30,9 L 48,9 C 56,9 58,0 54,-4 L -33,-4 C -37,0 -37,9 -30,9 Z" fill={GOGA.sole} />
				<path d="M -33,-2 C -37,-22 -25,-34 -8,-34 C 6,-34 12,-26 20,-22 C 36,-17 52,-14 54,-4 L -33,-4 Z" fill={side < 0 ? GOGA.shoe : GOGA.shoeD} stroke="#b4bac6" strokeWidth={3.5} strokeLinejoin="round" />
				<path d="M -16,-15 C 2,-9 22,-11 42,-11" stroke={GOGA.stripe} strokeWidth={6} strokeLinecap="round" fill="none" />
				<path d="M -5,-30 L 5,-24 M 3,-32 L 13,-26" stroke="#9aa0ab" strokeWidth={3} strokeLinecap="round" />
			</g>
		)}
	</g>
);

type ChobyProps = React.ComponentProps<typeof Choby>;
export type GogaProps = Omit<ChobyProps, 'glasses' | 'tie' | 'hat' | 'face' | 'torso' | 'shoe' | 'cap' | 'cheek' | 'cloak'> & {
	brows?: Brows;
	hot?: number;
	noCap?: boolean;
	pack?: boolean;
	outfit?: 'vest' | 'none' | 'robe' | 'winter';
};
export const Goga: React.FC<GogaProps> = ({brows = 0.5, hot = 0, noCap = false, pack = false, outfit = 'vest', frost = 0, armR = 'down', armL = 'down', back = false, behind, ...rest}) => {
	const robe = outfit === 'robe';
	const winter = outfit === 'winter';
	return (
		<Choby
			{...rest}
			frost={frost}
			armR={armR}
			armL={armL}
			back={back}
			glasses={false}
			tie={false}
			cap={false}
			hat={robe ? <HeadScarf /> : noCap ? undefined : winter ? <Beanie back={back} /> : <GogaCap frost={frost} back={back} />}
			face={<GogaFace brows={brows} hot={hot} />}
			torso={<GogaClothes outfit={outfit} back={back} pack={pack} />}
			cloak={robe ? <RobeSleeves /> : undefined}
			behind={
				<>
					{behind}
					{robe && <ScarfTails />}
				</>
			}
			shoe={(sd) => (winter ? <WinterBoot side={sd} back={back} /> : <GogaShoe side={sd} back={back} />)}
			scarf={winter || rest.scarf}
			mittens={winter || rest.mittens}
			sleeves={winter ? WINTER.sleeves : rest.sleeves}
			pants={winter ? WINTER.pants : rest.pants}
			cheek={hot > 0 ? mix('#f0868e', '#ff3030', hot) : undefined}
		/>
	);
};
