import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {HUDZ, ZTick} from './kit';
import * as Scenes from './scenes';
import {SFXZ1} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// «Каково это — замёрзнуть насмерть» — 16:9; the picture follows the author's voice (scripts/fit-voiceover.py --part z1)
export const RZ1 = makeRemap(edit as never, TOTAL);
const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);
const at = (n: number, word: string | number, add = 0) => Math.round(RZ1.fwd(s(n) + w(n, word, add)));

// the body temperature and the time in the water (story time) along the Titanic part
const TICKS: ZTick[] = [
	{at: 0, temp: 36.6, mins: 0},
	{at: at(13, 0), temp: 36.6, mins: 0, len: 10},
	{at: at(13, 0) + 1, temp: 36.6, mins: 1, len: Math.max(30, at(19, 0) - at(13, 0))},
	{at: at(19, 0), temp: 36.4, mins: 10, len: Math.max(30, at(25, 0) - at(19, 0))},
	{at: at(26, 'тридцать'), temp: 35, mins: 20, len: 50},
	{at: at(29, 0), temp: 34, mins: 30, len: Math.max(30, at(33, 0) - at(29, 0))},
	{at: at(33, 'тридцать'), temp: 32, mins: 40, len: 50},
	{at: at(37, 0), temp: 30.5, mins: 48, len: Math.max(30, at(41, 0) - at(37, 0))},
	{at: at(41, 'двадцать'), temp: 28, mins: 55, len: 50},
];

export const Zamerznut: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((sh) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(sh.index).padStart(2, '0')}`];
				const from = Math.round(RZ1.fwd(sh.from));
				const to = Math.round(RZ1.fwd(sh.from + sh.duration));
				return (
					<Sequence key={sh.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${sh.index}`}>
						<Retimed r={RZ1} newFrom={from} oldFrom={sh.from} oldDur={sh.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#223'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUDZ ticks={TICKS} show={[Math.round(RZ1.fwd(s(3))) + 6, Math.round(RZ1.fwd(s(46)))]} timer={[at(13, 0), Math.round(RZ1.fwd(s(46)))]} />
		<Captions captions={VOICE_CAPTIONS} wide solid />
		<SFXZ1 r={RZ1} />
	</AbsoluteFill>
);

export const ZamerznutAudio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXZ1 r={RZ1} />
	</AbsoluteFill>
);
