import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFX2} from './SFX';
import {EP2, SHOTS, shotStart, TOTAL} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part 2)
export const R2 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EP2, R2);

// rule 3 appears with its line, until the cut to the door handle
const r3 = VOICE.find((v) => v.id === 'b16')!;
const RULES = [{n: 3, title: 'НОЧЬЮ ЗАПИРАЙ ДВЕРЬ', icon: 'lock' as const, from: r3.at - 4, to: Math.round(R2.fwd(shotStart(14) + 70))}];

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Main2: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(R2.fwd(s.from));
				const to = Math.round(R2.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={R2} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
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
		<SFX2 r={R2} />
	</AbsoluteFill>
);
