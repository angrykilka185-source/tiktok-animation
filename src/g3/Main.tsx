import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXG3} from './SFX';
import {EPG3, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part g3)
export const RG3 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EPG3, RG3);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Golosovye3: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RG3.fwd(s.from));
				const to = Math.round(RG3.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RG3} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD ep={EP} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFXG3 r={RG3} />
	</AbsoluteFill>
);
