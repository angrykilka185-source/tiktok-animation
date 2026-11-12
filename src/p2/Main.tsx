import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from '../components/Overlays';
import * as Scenes from './scenes';
import {SFX2} from './SFX';
import {EP2, SHOTS, shotStart} from './timeline';
import {VOICE, VOICE_CAPTIONS} from './voice';

// rule 3 appears with its line, until the cut to the door handle
const r3 = VOICE.find((v) => v.id === 'b16')!;
const RULES = [{n: 3, title: 'НОЧЬЮ ЗАПИРАЙ ДВЕРЬ', icon: 'lock' as const, from: r3.at - 4, to: shotStart(14) + 70}];

export const Main2: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		{SHOTS.map((s) => {
			const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
			return (
				<Sequence key={s.index} from={s.from} durationInFrames={s.duration} name={`Кадр ${s.index}`}>
					{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
				</Sequence>
			);
		})}
		<RuleCards rules={RULES} />
		<HUD ep={EP2} />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP2} />
		<SFX2 />
	</AbsoluteFill>
);
