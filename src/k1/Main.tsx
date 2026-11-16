import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXK1} from './SFX';
import {EPK1, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part k1)
export const RK1 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EPK1, RK1);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Knopka1: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RK1.fwd(s.from));
				const to = Math.round(RK1.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RK1} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD ep={EP} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFXK1 r={RK1} />
	</AbsoluteFill>
);
