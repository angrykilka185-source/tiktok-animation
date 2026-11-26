import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {HUDB} from './kit';
import * as Scenes from './scenes';
import {CHOBI_SHOTS} from './chobi';
import {CHOBI_FIRST, CHOBI_LAST, IRIS, OpenPage} from './chobiKit';
import {SFXZ4} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// «Каково это — умереть от лап медведя» — 16:9; the picture follows the voice (scripts/fit-voiceover.py --part z4)
export const RZ4 = makeRemap(edit as never, TOTAL);
const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);
const at = (n: number, word: string | number, add = 0) => Math.round(RZ4.fwd(s(n) + w(n, word, add)));

// the frames where Чоби names each of Гога's six mistakes
export const MIST = [at(14, 'ошибка'), at(18, 'ошибка'), at(24, 'ошибка'), at(35, 'ошибка'), at(40, 'ошибка'), at(45, 'ошибка')];
const Hud: React.FC = () => {
	const f = useCurrentFrame();
	return <HUDB f={f} mist={MIST} show={[at(14, 0), Math.round(RZ4.fwd(s(61)))]} />;
};

// the picture alone (the scenes and Чоби's pages, with the camera kicks) — also played inside the vertical shorts,
// where `only` keeps just the shots of the run (nothing of the shots around it shows through a circle) and a run
// that begins on Чоби's page finds it already open
export const MedvedScenes: React.FC<{only?: [number, number]}> = ({only}) => (
	<OpenPage.Provider value={only?.[0] ?? 0}>
		<KickLayer times={KICKS}>
			{SHOTS.filter((sh) => !only || (sh.index >= only[0] && sh.index <= only[1])).map((sh) => {
				const n = sh.index;
				const ch = CHOBI_SHOTS[n];
				const C = ch ?? (Scenes as unknown as Record<string, React.FC>)[`S${String(n).padStart(2, '0')}`];
				// a scene plays on under the circle that opens onto Чоби's page; his last page of a visit closes over the next shot
				const extra = (!ch && CHOBI_FIRST.has(n + 1)) || (ch && CHOBI_LAST.has(n) && n < SHOTS.length) ? IRIS : 0;
				const from = Math.round(RZ4.fwd(sh.from));
				const to = Math.round(RZ4.fwd(sh.from + sh.duration)) + extra;
				return (
					<Sequence key={n} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${n}${ch ? ' · Чоби' : ''}`} style={ch ? {zIndex: 2} : undefined}>
						<Retimed r={RZ4} newFrom={from} oldFrom={sh.from} oldDur={sh.duration + extra}>
							{C ? <C /> : <AbsoluteFill style={{background: '#223', color: '#fff', fontSize: 80, alignItems: 'center', justifyContent: 'center'}}>{n}</AbsoluteFill>}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
	</OpenPage.Provider>
);
export const MedvedHud = Hud;

export const Medved: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<MedvedScenes />
		<Hud />
		<Captions captions={VOICE_CAPTIONS} wide solid />
		<SFXZ4 r={RZ4} />
	</AbsoluteFill>
);

export const MedvedAudio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXZ4 r={RZ4} />
	</AbsoluteFill>
);
