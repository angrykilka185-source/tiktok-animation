import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXR2} from './SFX';
import {EPR2, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// «Ты с какого района?» — серия 2 «Прописка». The picture follows the voice-over (scripts/fit-voiceover.py --part r2)
export const RR2 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EPR2, RR2);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Rayon2: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RR2.fwd(s.from));
				const to = Math.round(RR2.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RR2} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD ep={EP} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFXR2 r={RR2} />
	</AbsoluteFill>
);

// the same sound without the picture (a fast audio-only render of the 3D episode)
export const Rayon2Audio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXR2 r={RR2} />
	</AbsoluteFill>
);
