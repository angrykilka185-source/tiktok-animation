import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {HUDZ, type AirTick} from './kit';
import * as Scenes from './scenes';
import {CHOBI_SHOTS} from './chobi';
import {CHOBI_FIRST, CHOBI_LAST, IRIS} from './chobiKit';
import {SFXZ3} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// «Каково это — оказаться погребённым заживо» — 16:9; the picture follows the voice (scripts/fit-voiceover.py --part z3)
export const RZ3 = makeRemap(edit as never, TOTAL);
const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);
const at = (n: number, word: string | number, add = 0) => Math.round(RZ3.fwd(s(n) + w(n, word, add)));

// the frames where Чоби names each of Гога's seven mistakes
export const MIST = [at(13, 'кричит'), at(16, 'колотит'), at(20, 'зажигалка'), at(45, 'ошибка'), at(54, 'ошибка'), at(59, 'ошибка'), at(62, 'ошибка')];
// the air left in the coffin (minutes): about two hours — and every mistake eats some of it
const AIR: AirTick[] = [
	{at: 0, min: 125},
	{at: at(14, 'воздух'), min: 104, len: 40},
	{at: at(17, 'дышит'), min: 88, len: 40},
	{at: at(21, 'сжигает'), min: 68, len: 50},
	{at: at(26, 'паника'), min: 57, len: 40},
];
const Hud: React.FC = () => {
	const f = useCurrentFrame();
	return <HUDZ f={f} mist={MIST} show={[at(13, 0), Math.round(RZ3.fwd(s(68)))]} air={{show: [Math.round(RZ3.fwd(s(7))) + 6, Math.round(RZ3.fwd(s(32)))], ticks: AIR}} />;
};

// the picture alone (the scenes and Чоби's pages, with the camera kicks) — also played inside the vertical shorts,
// where `only` keeps just the shots of the run (nothing of the shots around it shows through a circle)
export const ZakopanScenes: React.FC<{only?: [number, number]}> = ({only}) => (
	<KickLayer times={KICKS}>
		{SHOTS.filter((sh) => !only || (sh.index >= only[0] && sh.index <= only[1])).map((sh) => {
			const n = sh.index;
			const ch = CHOBI_SHOTS[n];
			const C = ch ?? (Scenes as unknown as Record<string, React.FC>)[`S${String(n).padStart(2, '0')}`];
			// a scene plays on under the circle that opens onto Чоби's page; his last page of a visit closes over the next shot
			const extra = (!ch && CHOBI_FIRST.has(n + 1)) || (ch && CHOBI_LAST.has(n) && n < SHOTS.length) ? IRIS : 0;
			const from = Math.round(RZ3.fwd(sh.from));
			const to = Math.round(RZ3.fwd(sh.from + sh.duration)) + extra;
			return (
				<Sequence key={n} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${n}${ch ? ' · Чоби' : ''}`} style={ch ? {zIndex: 2} : undefined}>
					<Retimed r={RZ3} newFrom={from} oldFrom={sh.from} oldDur={sh.duration + extra}>
						{C ? <C /> : <AbsoluteFill style={{background: '#223', color: '#fff', fontSize: 80, alignItems: 'center', justifyContent: 'center'}}>{n}</AbsoluteFill>}
					</Retimed>
				</Sequence>
			);
		})}
	</KickLayer>
);
export const ZakopanHud = Hud;

export const Zakopan: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<ZakopanScenes />
		<Hud />
		<Captions captions={VOICE_CAPTIONS} wide solid />
		<SFXZ3 r={RZ3} />
	</AbsoluteFill>
);

export const ZakopanAudio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXZ3 r={RZ3} />
	</AbsoluteFill>
);
