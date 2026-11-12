import React from 'react';
import {Composition} from 'remotion';
import {Main, R1} from './Main';
import {Main2, R2} from './p2/Main';
import {Main3, R3} from './p3/Main';
import {Golosovye1, RG1} from './g1/Main';
import {Golosovye2, RG2} from './g2/Main';
import {FPS, H, SHOTS, W} from './timeline';
import * as Scenes from './scenes';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="PapaVakhta" component={Main} durationInFrames={R1.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta2" component={Main2} durationInFrames={R2.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta3" component={Main3} durationInFrames={R3.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye1" component={Golosovye1} durationInFrames={RG1.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye2" component={Golosovye2} durationInFrames={RG2.total} fps={FPS} width={W} height={H} />
		{/* every shot on its own for quick previews */}
		{SHOTS.map((s) => {
			const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
			return C ? <Composition key={s.index} id={`Shot${s.index}`} component={C} durationInFrames={s.duration} fps={FPS} width={W} height={H} /> : null;
		})}
	</>
);
