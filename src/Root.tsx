import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {Main2} from './p2/Main';
import {TOTAL as TOTAL2} from './p2/timeline';
import {FPS, H, SHOTS, TOTAL, W} from './timeline';
import * as Scenes from './scenes';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="PapaVakhta" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta2" component={Main2} durationInFrames={TOTAL2} fps={FPS} width={W} height={H} />
		{/* every shot on its own for quick previews */}
		{SHOTS.map((s) => {
			const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
			return C ? <Composition key={s.index} id={`Shot${s.index}`} component={C} durationInFrames={s.duration} fps={FPS} width={W} height={H} /> : null;
		})}
	</>
);
