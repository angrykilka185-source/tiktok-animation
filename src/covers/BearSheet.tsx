// The bear's poses side by side with Гога for scale (a check sheet for «Каково это — умереть от лап медведя»).
// Render: npx remotion still BearSheet out/cover/bear.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bear, BearFront, BearUp} from '../components/Bear';
import {You} from '../z2/kit';

const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
	<text x={x} y={y} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={24} fill="#555">
		{t}
	</text>
);

export const BearSheet: React.FC = () => (
	<AbsoluteFill style={{background: '#eef3ea'}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			<line x1={0} y1={480} x2={1920} y2={480} stroke="#cfd8c8" strokeWidth={3} />
			<line x1={0} y1={1010} x2={1920} y2={1010} stroke="#cfd8c8" strokeWidth={3} />
			{/* row 1: Гога for scale, on all fours, walking, galloping, standing up */}
			<You x={110} y={480} s={0.55} f={40} face={{eyes: 'open', mouth: 'flat', brows: 'neutral'}} />
			<Bear x={420} y={480} s={0.62} pose="stand4" />
			<Label x={420} y={520} t="stand4" />
			<Bear x={860} y={480} s={0.62} pose="walk" ph={1.2} />
			<Label x={860} y={520} t="walk" />
			<Bear x={1300} y={480} s={0.62} pose="run" ph={1.0} mouth={0.6} ears="back" />
			<Label x={1300} y={520} t="run + mouth + ears back" />
			<BearUp x={1700} y={480} s={0.62} up={1} />
			<Label x={1700} y={520} t="BearUp (sniff)" />
			{/* row 2: lying asleep, the front, a cub, a polar bear, a thin shatun, a paw slap */}
			<Bear x={220} y={1010} s={0.55} pose="lie" eyes="closed" />
			<Label x={220} y={1050} t="lie" />
			<BearFront x={620} y={1010} s={0.62} mouth={0.8} ears="back" />
			<Label x={620} y={1050} t="BearFront roar" />
			<Bear x={950} y={1010} s={0.36} pose="walk" ph={0.4} fur="cub" />
			<Label x={950} y={1050} t="cub" />
			<Bear x={1260} y={1010} s={0.6} pose="stand4" fur="polar" />
			<Label x={1260} y={1050} t="polar" />
			<Bear x={1660} y={1010} s={0.6} pose="stand4" thin slap={0.5} head={10} />
			<Label x={1660} y={1050} t="thin + slap" />
		</svg>
	</AbsoluteFill>
);
