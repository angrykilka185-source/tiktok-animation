import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFX3} from './SFX';
import {EP3, SHOTS, shotStart, TOTAL} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part 3)
export const R3 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EP3, R3);

// rule 4 appears with its line, until the next shot
const r4 = VOICE.find((v) => v.id === 'c11')!;
const RULES = [{n: 4, title: 'СНИМАЙ ВСЁ НА ВИДЕО', icon: 'rec' as const, from: r4.at - 4, to: Math.round(R3.fwd(shotStart(10)))}];

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Main3: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(R3.fwd(s.from));
				const to = Math.round(R3.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={R3} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
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
		<SFX3 r={R3} />
	</AbsoluteFill>
);
