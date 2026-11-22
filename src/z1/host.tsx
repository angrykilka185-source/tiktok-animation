// Чоби hosts «Каково это — замёрзнуть насмерть»: he stands in the corner of the frame and tells the story with the
// voice-over — the jaw follows the loudness of the voice (env.json, scripts/voice-env.py), he blinks, looks at the
// scene, points with his pointer, raises a finger on the rules («запомни»), shivers with you in the ice water (and
// stops when your shivering stops), gets sleepy at 32°, waves at «подпишись».
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Choby} from '../components/Choby';
import envJson from './env.json';
import {VOICE} from './voice';

const ENV = envJson as Record<string, number[]>;

// loudness of the voice at output frame F (0 silence … ~1 loud speech)
const level = (F: number) => {
	for (const l of VOICE) {
		const a = ENV[l.id];
		if (a && F >= l.at && F < l.at + a.length) return a[F - l.at];
	}
	return 0;
};

type ArmR = 'pointer' | 'wave' | 'point' | 'down' | 'hip';
// gestures by shot (the rest: the pointer towards the scene)
const ARM_R: Record<number, ArmR> = {5: 'point', 18: 'point', 47: 'point', 55: 'point', 66: 'point', 77: 'point', 78: 'wave'};
// he looks at the viewer here (the rest: at the scene, up and to the right)
const AT_VIEWER = new Set([1, 2, 4, 5, 18, 47, 55, 66, 75, 76, 77, 78]);
// shots where he steps aside to the right corner, or leaves the frame, so nothing important is covered
export const HOST_SIDE: Record<number, 'R' | 'hide'> = {};

export const HostChoby: React.FC<{shotAt: (n: number) => number; wordAt: (n: number, word: string) => number; shots: number}> = ({shotAt, wordAt, shots}) => {
	const F = useCurrentFrame();
	let n = 1;
	while (n < shots && F >= shotAt(n + 1)) n++;
	const lv = (level(F - 1) + 2 * level(F) + level(F + 1)) / 4;
	const jaw = Math.min(1, lv * 0.85);
	// blinks: every 3–4.5 s, 6 frames
	const cyc = [0, 97, 214, 319, 452, 561, 690, 801, 925, 1049];
	const ph = F % 1100;
	const b0 = cyc.find((c) => ph >= c && ph < c + 6);
	let blink = b0 !== undefined ? 1 - Math.abs(ph - b0 - 2.5) / 3 : 0;
	// cold: the cheeks turn blue in the water, he shivers with you until your shivering stops (32°)
	const stop = wordAt(33, 'прекращается');
	const shiver = n >= 13 && (n < 33 || (n === 33 && F < stop)) ? 0.55 : 0;
	const cold = n >= 12 && n <= 45 ? 0.7 : 0;
	if (n === 35 || n === 36) blink = Math.max(blink, 0.45); // sleepy, like you
	const armR: ArmR = ARM_R[n] ?? 'pointer';
	const look: [number, number] = AT_VIEWER.has(n) ? [0.1, 0.1] : [0.6, -0.3];
	// he pops in at the start
	const pop = interpolate(F, [4, 22], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const side = HOST_SIDE[n];
	if (side === 'hide') return null;
	const x = side === 'R' ? 1750 : 170;
	const k = 0.44;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{filter: 'drop-shadow(0 0 2px #1d2024) drop-shadow(0 0 2px #1d2024) drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
				<ellipse cx={x} cy={1070} rx={92} ry={12} fill="#000" opacity={0.28} />
				{side === 'R' ? (
					<Choby x={x} y={1072 + pop * 360} s={k} jaw={jaw} look={[-look[0], look[1]]} blink={blink} armR="hip" armL={armR === 'pointer' ? 'pointer' : armR === 'wave' ? 'wave' : armR === 'point' ? 'point' : 'hip'} shiver={shiver} cold={cold} f={F} />
				) : (
					<Choby x={x} y={1072 + pop * 360} s={k} jaw={jaw} look={look} blink={blink} armR={armR} armL="hip" shiver={shiver} cold={cold} f={F} />
				)}
			</svg>
		</AbsoluteFill>
	);
};
