import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, SignPlaques} from './components/Overlays';
import {SFX} from './SFX';
import * as Scenes from './scenes';
import {SHOTS} from './timeline';

export const Main: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		{SHOTS.map((s) => {
			const C = (Scenes as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
			return (
				<Sequence key={s.index} from={s.from} durationInFrames={s.duration} name={`Кадр ${s.index}`}>
					{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
				</Sequence>
			);
		})}
		<HUD />
		<Captions />
		<SignPlaques />
		<SFX />
	</AbsoluteFill>
);
