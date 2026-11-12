import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from './components/Overlays';
import edit from './edit.json';
import {KickLayer, makeRemap, remapEpisode, Retimed} from './edit';
import {SFX} from './SFX';
import * as Scenes from './scenes';
import {EP1, SHOTS, shotStart, TOTAL} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py)
export const R1 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EP1, R1);

// rule cards appear with the narrator's "Правило …" lines
const rule = (n: number, id: string, title: string, icon: 'eye' | 'shh', maxTo: number) => {
	const l = VOICE.find((v) => v.id === id)!;
	return {n, title, icon, from: l.at - 4, to: Math.min(maxTo, l.at + Math.round(l.duration * 30) + 16)};
};
const RULES = [rule(1, 'a13', 'НЕ ПОДАВАЙ ВИДУ', 'eye', Math.round(R1.fwd(shotStart(7)))), rule(2, 'a18', 'МАМЕ — НИ СЛОВА', 'shh', Math.round(R1.fwd(shotStart(10))) + 4)];

// camera punch on the first red word of every caption
const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Main: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(R1.fwd(s.from));
				const to = Math.round(R1.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={R1} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<RuleCards rules={RULES} />
		<HUD ep={EP} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFX r={R1} />
	</AbsoluteFill>
);
