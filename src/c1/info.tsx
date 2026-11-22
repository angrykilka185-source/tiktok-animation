// «Откуда взялись чипсы» — the explainer shots (20–24, 26). WORK IN PROGRESS: placeholders (the bag on a warm
// background) until the infographics are drawn.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {lerp} from '../anim';
import {Stage} from '../components/Stage';
import {ChipsBag} from './kit';
import {SHOTS} from './timeline';

const Placeholder: React.FC<{n: number}> = ({n}) => {
	const f = useCurrentFrame();
	return (
		<Stage cam={{s: lerp(f, 0, SHOTS[n - 1].duration, 1, 1.06), cx: 540, cy: 960}} bg="#fbf3e3">
			<rect x={-300} y={-300} width={1700} height={2600} fill="#fbf3e3" />
			<g transform="translate(540,760)">
				<ChipsBag s={1.4} open={1} cut={n === 26 ? 1 : 0} gas="n2" id={`c1i${n}`} />
			</g>
		</Stage>
	);
};
export const S20: React.FC = () => <Placeholder n={20} />;
export const S21: React.FC = () => <Placeholder n={21} />;
export const S22: React.FC = () => <Placeholder n={22} />;
export const S23: React.FC = () => <Placeholder n={23} />;
export const S24: React.FC = () => <Placeholder n={24} />;
export const S26: React.FC = () => <Placeholder n={26} />;
