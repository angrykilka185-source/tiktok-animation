// Time remap between the authored timeline ("old" frames: scenes, effects, plaques)
// and the final edit ("new" frames) that follows the voice-over (scripts/fit-voiceover.py).
import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import type {Episode} from './components/Overlays';

export type Edit = {anchors: number[][]; total: number};

const lerpSeg = (x: number, a: number[], b: number[]) => a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);

export const makeRemap = (edit: Edit | null, oldTotal: number) => {
	const A = edit && edit.anchors.length >= 2 ? edit.anchors : [[0, 0], [oldTotal, oldTotal]];
	const fwd = (o: number) => {
		for (let i = 0; i < A.length - 1; i++) if (o <= A[i + 1][0]) return lerpSeg(o, A[i], A[i + 1]);
		const l = A[A.length - 1];
		return l[1] + (o - l[0]);
	};
	const inv = (n: number) => {
		const B = A.map(([o, nn]) => [nn, o]);
		for (let i = 0; i < B.length - 1; i++) if (n <= B[i + 1][0]) return lerpSeg(n, B[i], B[i + 1]);
		const l = B[B.length - 1];
		return l[1] + (n - l[0]);
	};
	return {fwd, inv, total: edit?.total ?? oldTotal};
};
export type Remap = ReturnType<typeof makeRemap>;

// plays a scene authored on the old timeline at the new timing.
// (A shifted <Sequence> instead of <Freeze>: Freeze moves the timeline position and
// Remotion clamps it to the composition length, which broke the last shot.)
export const Retimed: React.FC<{r: Remap; newFrom: number; oldFrom: number; oldDur: number; children: React.ReactNode}> = ({r, newFrom, oldFrom, oldDur, children}) => {
	const f = useCurrentFrame();
	const old = Math.max(0, Math.min(oldDur - 1, Math.round(r.inv(newFrom + f) - oldFrom)));
	return React.createElement(Sequence, {from: f - old, layout: 'none', children});
};

export const remapEpisode = (ep: Episode, r: Remap): Episode => ({
	clock: ep.clock.map((c) => ({...c, from: Math.round(r.fwd(c.from))})),
	signs: ep.signs.map((s) => {
		const at = Math.round(r.fwd(s.at));
		return {...s, at, hold: Math.max(6, Math.round(r.fwd(s.at + s.hold)) - at)};
	}),
	slots: ep.slots,
	counterFrom: Math.round(r.fwd(ep.counterFrom)),
	hideFrom: Math.round(r.fwd(ep.hideFrom)),
	night: ep.night.map(([a, b]) => [Math.round(r.fwd(a)), Math.round(r.fwd(b))] as [number, number]),
	prefilled: ep.prefilled,
});

// small camera "punch" on the key (red) words, like in the reference
export const KickLayer: React.FC<{times: number[]; children: React.ReactNode}> = ({times, children}) => {
	const f = useCurrentFrame();
	let p = 0;
	for (const t of times) if (f >= t && f < t + 24) p = Math.max(p, Math.exp(-(f - t) / 5));
	return React.createElement('div', {style: {position: 'absolute', inset: 0, transform: `scale(${1 + 0.035 * p})`}}, children);
};
