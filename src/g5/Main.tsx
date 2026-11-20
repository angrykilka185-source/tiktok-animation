import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXG5} from './SFX';
import {EPG5, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// «Голосовые из завтра» — часть 5 «Побег». The picture follows the voice-over (scripts/fit-voiceover.py --part g5)
export const RG5 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EPG5, RG5);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const Golosovye5: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RG5.fwd(s.from));
				const to = Math.round(RG5.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RG5} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD ep={EP} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFXG5 r={RG5} />
	</AbsoluteFill>
);

// the same sound without the picture (a fast audio-only render)
export const Golosovye5Audio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXG5 r={RG5} />
	</AbsoluteFill>
);
