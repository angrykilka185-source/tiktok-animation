import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {HUD20, Mark} from './hud';
import {Grade} from './kit';
import * as Scenes from './scenes';
import {SFXW1} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// «Что будет, если ты попадёшь в XX век» — the picture follows the voice-over (scripts/fit-voiceover.py --part w1)
export const RW1 = makeRemap(edit, TOTAL);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

// which decade each shot is in (for the colour grade); the jump shots and the title have none
const ERA_OF: number[] = [];
const ERAS: [number, number][] = [
	[1, 1901], [16, 1911], [23, 1921], [29, 1931], [35, 1941], [39, 1951], [44, 1961], [49, 1971], [55, 1981], [60, 1991], [65, 2026],
];
SHOTS.forEach((sh) => {
	let e = 1901;
	for (const [n, y] of ERAS) if (sh.index >= n) e = y;
	ERA_OF[sh.index] = e;
});
const JUMPS = [15, 22, 28, 34, 38, 43, 48, 54, 59];
const NO_GRADE = new Set([3, 4, 5, 63, 64, 66, 67, 69, ...JUMPS]);

// the HUD: the year and the battery from the first street shot until the phone dies
const MARKS: Mark[] = [
	{at: 0, year: 1901, pct: 100},
	...JUMPS.map((j, k) => ({at: s(j + 1), year: 1911 + k * 10, pct: 90 - k * 10})),
	{at: s(63), year: 1991, pct: 1},
];
const SHOW: [number, number][] = [];
{
	let a = s(6);
	for (const j of [...JUMPS, 63]) {
		SHOW.push([a, s(j)]);
		a = s(j + 1);
	}
}
export const W1_MARKS = MARKS;

export const Vek20: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((sh) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(sh.index).padStart(2, '0')}`];
				const from = Math.round(RW1.fwd(sh.from));
				const to = Math.round(RW1.fwd(sh.from + sh.duration));
				return (
					<Sequence key={sh.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${sh.index}`}>
						<Retimed r={RW1} newFrom={from} oldFrom={sh.from} oldDur={sh.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
							{!NO_GRADE.has(sh.index) && <Grade era={ERA_OF[sh.index]} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD20 marks={MARKS.map((m) => ({...m, at: Math.round(RW1.fwd(m.at))}))} show={SHOW.map(([a, b]) => [Math.round(RW1.fwd(a)), Math.round(RW1.fwd(b))] as [number, number])} />
		<Captions captions={VOICE_CAPTIONS} />
		<SFXW1 r={RW1} />
	</AbsoluteFill>
);

// the same sound without the picture (a fast audio-only render)
export const Vek20Audio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXW1 r={RW1} />
	</AbsoluteFill>
);
