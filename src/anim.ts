import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timeline';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const lerp = (f: number, a: number, b: number, from: number, to: number, ease = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [from, to], {...clamp, easing: ease});

export const pop = (f: number, at: number, damping = 11) => spring({frame: f - at, fps: FPS, config: {damping, stiffness: 170, mass: 0.7}});

// natural blinking: closure 0..1 for a given frame; seed offsets characters
export const blinkAt = (f: number, seed = 0, every = 95) => {
	const t = (f + seed * 37) % every;
	if (t < 0 || t > 6) return 0;
	return t < 3 ? t / 3 : (6 - t) / 3;
};

// camera transform: zoom `s` centred on scene point (cx, cy)
export const cam = (s: number, cx: number, cy: number, rot = 0) =>
	`translate(540,960) rotate(${rot}) scale(${s}) translate(${-cx},${-cy})`;

// deterministic shake
export const shake = (f: number, at: number, amp = 14, len = 12) => {
	const t = f - at;
	if (t < 0 || t > len) return [0, 0];
	const k = (1 - t / len) * amp;
	return [Math.sin(t * 2.7) * k, Math.cos(t * 3.3) * k];
};
