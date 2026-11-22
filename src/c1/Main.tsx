import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXC1} from './SFX';
import {SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// «Откуда взялись чипсы» — 9:16; the picture follows the voice (scripts/fit-voiceover.py --part c1)
export const RC1 = makeRemap(edit as never, TOTAL);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);

export const Chips1: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((sh) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(sh.index).padStart(2, '0')}`];
				const from = Math.round(RC1.fwd(sh.from));
				const to = Math.round(RC1.fwd(sh.from + sh.duration));
				return (
					<Sequence key={sh.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${sh.index}`}>
						<Retimed r={RC1} newFrom={from} oldFrom={sh.from} oldDur={sh.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<Captions captions={VOICE_CAPTIONS} />
		<SFXC1 r={RC1} />
	</AbsoluteFill>
);

export const Chips1Audio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXC1 r={RC1} />
	</AbsoluteFill>
);
