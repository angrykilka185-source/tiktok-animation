import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFX4} from './SFX';
import {EP4, SHOTS, shotStart, TOTAL} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part 4)
export const R4 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EP4, R4);

// rule 5 appears with its line, until the next shot
const r5 = VOICE.find((v) => v.id === 'd16')!;
const RULES = [{n: 5, title: 'НЕ ПОВОРАЧИВАЙСЯ К НЕМУ СПИНОЙ', icon: 'eye' as const, from: r5.at - 4, to: Math.round(R4.fwd(shotStart(15)))}];

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Main4: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(R4.fwd(s.from));
				const to = Math.round(R4.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={R4} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
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
		<SFX4 r={R4} />
	</AbsoluteFill>
);
