import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXT2} from './SFX';
import {SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// «ТГК открыт» — the 700-subscribers video. The picture follows the voice-over (scripts/fit-voiceover.py --part t2)
export const RT2 = makeRemap(edit, TOTAL);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

export const TgkOpen: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RT2.fwd(s.from));
				const to = Math.round(RT2.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RT2} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<Captions captions={VOICE_CAPTIONS} />
		<SFXT2 r={RT2} />
	</AbsoluteFill>
);

// the same sound without the picture (a fast audio-only render)
export const TgkOpenAudio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXT2 r={RT2} />
	</AbsoluteFill>
);
