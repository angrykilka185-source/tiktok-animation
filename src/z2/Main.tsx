import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {HUDJ, type JTick} from './kit';
import * as Scenes from './scenes';
import {CHOBI_SHOTS} from './chobi';
import {CHOBI_FIRST, CHOBI_LAST, IRIS} from './chobiKit';
import {SFXZ2} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// «Каково это — умереть от жажды» — 16:9; the picture follows the voice (scripts/fit-voiceover.py --part z2)
export const RZ2 = makeRemap(edit as never, TOTAL);
const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);
const at = (n: number, word: string | number, add = 0) => Math.round(RZ2.fwd(s(n) + w(n, word, add)));

// water lost, hours without water, the air — along the desert part
const TICKS: JTick[] = [
	{at: 0, loss: 0, hours: 0, air: 45},
	{at: at(15, 'потерял'), loss: 1.5, hours: 3, len: 60},
	{at: at(20, 0), loss: 2.5, hours: 5, len: 60},
	{at: at(25, 0), loss: 4, hours: 10, air: 36, len: 40},
	{at: at(30, 'садится'), loss: 4.5, hours: 12, air: 12, len: 90},
	{at: at(34, 0), loss: 7, hours: 30, air: 46, len: 40},
	{at: at(39, 0), loss: 8, hours: 34, len: 60},
	{at: at(43, 0), loss: 10, hours: 52, air: 47, len: 40},
];

export const Zhazhda: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((sh) => {
				const n = sh.index;
				const ch = CHOBI_SHOTS[n];
				const C = ch ?? (Scenes as unknown as Record<string, React.FC>)[`S${String(n).padStart(2, '0')}`];
				// a scene plays on under the circle that opens onto Чоби's page; his last page of a visit closes over the next shot
				const extra = (!ch && CHOBI_FIRST.has(n + 1)) || (ch && CHOBI_LAST.has(n) && n < SHOTS.length) ? IRIS : 0;
				const from = Math.round(RZ2.fwd(sh.from));
				const to = Math.round(RZ2.fwd(sh.from + sh.duration)) + extra;
				return (
					<Sequence key={n} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${n}${ch ? ' · Чоби' : ''}`} style={ch ? {zIndex: 2} : undefined}>
						<Retimed r={RZ2} newFrom={from} oldFrom={sh.from} oldDur={sh.duration + extra}>
							{C ? <C /> : <AbsoluteFill style={{background: '#223', color: '#fff', fontSize: 80, alignItems: 'center', justifyContent: 'center'}}>{n}</AbsoluteFill>}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUDJ ticks={TICKS} show={[at(11, 0), Math.round(RZ2.fwd(s(48)))]} />
		<Captions captions={VOICE_CAPTIONS} wide solid />
		<SFXZ2 r={RZ2} />
	</AbsoluteFill>
);

export const ZhazhdaAudio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXZ2 r={RZ2} />
	</AbsoluteFill>
);
