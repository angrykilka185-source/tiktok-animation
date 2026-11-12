import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions, HUD, RuleCards, SignPlaques} from './components/Overlays';
import {SFX} from './SFX';
import * as Scenes from './scenes';
import {SHOTS, shotStart} from './timeline';
import {VOICE} from './voice';

// rule cards appear with the narrator's "Правило …" lines
const rule = (n: number, id: string, title: string, icon: 'eye' | 'shh', maxTo: number) => {
	const l = VOICE.find((v) => v.id === id)!;
	return {n, title, icon, from: l.at - 4, to: Math.min(maxTo, l.at + Math.round(l.duration * 30) + 16)};
};
const RULES = [rule(1, 'a13', 'НЕ ПОДАВАЙ ВИДУ', 'eye', shotStart(7)), rule(2, 'a18', 'МАМЕ — НИ СЛОВА', 'shh', shotStart(10) + 4)];

export const Main: React.FC = () => (
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
		<HUD />
		<Captions />
		<SignPlaques />
		<SFX />
	</AbsoluteFill>
);
