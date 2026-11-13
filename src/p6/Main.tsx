import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFX6} from './SFX';
import {EP6, SHOTS, shotStart, TOTAL} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part 6)
export const R6 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EP6, R6);

// rule 4 again: film everything (shot 7, until the next shot)
const r4 = VOICE.find((v) => v.id === 'f09')!;
const RULES = [{n: 4, title: 'СНИМАЙ ВСЁ НА ВИДЕО', icon: 'rec' as const, from: r4.at + 30, to: Math.round(R6.fwd(shotStart(8)))}];

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Main6: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(R6.fwd(s.from));
				const to = Math.round(R6.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={R6} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
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
		<SFX6 r={R6} />
	</AbsoluteFill>
);
