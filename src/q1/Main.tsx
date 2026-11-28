import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {pop} from '../anim';
import {HEAVY} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXQ1} from './SFX';
import {SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';
import {useCurrentFrame} from 'remotion';

// «Что лучше: длинные или короткие?» — the picture follows the voice-over (scripts/fit-voiceover.py --part q1)
export const RQ1 = makeRemap(edit, TOTAL);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);

// the captions of the voice: dark on the white page, the words light up as they are said (red = the key word)
const CAP_Y = 1585;
const Caps: React.FC = () => {
	const f = useCurrentFrame();
	const ch = VOICE_CAPTIONS.find((c) => f >= c.from - 2 && f < c.to);
	if (!ch) return null;
	const len = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
	const longest = Math.max(...ch.words.map((x) => x.w.length));
	const fs = longest > 12 ? Math.min(84, Math.floor(920 / (longest * 0.74))) : len > 18 ? 84 : 96;
	return (
		<div style={{position: 'absolute', left: 40, width: 1000, top: CAP_Y, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: fs, lineHeight: 1.1, textTransform: 'uppercase'}}>
			{ch.words.map((x, i) => {
				const p = pop(f, x.at, 12);
				const active = f >= x.at;
				return (
					<span key={i + x.w} style={{display: 'inline-block', margin: '0 10px', transform: `scale(${active ? 0.8 + 0.2 * p : 0.96})`, color: active ? (x.red ? '#e8352e' : x.quote ? '#1d5fd1' : '#16161c') : '#cacad2'}}>
						{x.w.replace(/-/g, '‑')}
					</span>
				);
			})}
		</div>
	);
};

export const FormatOpros: React.FC = () => (
	<AbsoluteFill style={{background: '#fff'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RQ1.fwd(s.from));
				const to = Math.round(RQ1.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RQ1} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<Caps />
		<SFXQ1 r={RQ1} />
	</AbsoluteFill>
);
