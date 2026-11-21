import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../components/Overlays';
import {KickLayer, makeRemap, Retimed} from '../edit';
import edit from './edit.json';
import {Grade81, HUD81, Tick} from './kit';
import * as Scenes from './scenes';
import {SFXU1} from './SFX';
import {shotStart as s, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS, w} from './voice';

// «Что будет, если ты попадёшь в СССР» — 16:9; the picture follows the voice-over (scripts/fit-voiceover.py --part u1)
export const RU1 = makeRemap(edit as never, TOTAL);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((x) => x.red)?.at).filter((t): t is number => t !== undefined);

// the clock of the day and the battery (each «Батарея — …» line moves it on)
const TICKS: Tick[] = [
	{at: s(8), time: '07:00', pct: 100},
	{at: s(16), time: '07:40', pct: 100},
	{at: s(20) + w(20, 'девяносто'), time: '07:50', pct: 90},
	{at: s(22), time: '08:20', pct: 90},
	{at: s(28), time: '11:10', pct: 90},
	{at: s(31), time: '12:30', pct: 90},
	{at: s(32), time: '14:00', pct: 90},
	{at: s(34), time: '15:20', pct: 90},
	{at: s(40) + w(40, 'семьдесят'), time: '15:40', pct: 70},
	{at: s(41), time: '16:10', pct: 70},
	{at: s(47), time: '17:05', pct: 70},
	{at: s(49) + w(49, 'пятьдесят'), time: '17:30', pct: 50},
	{at: s(53), time: '18:30', pct: 50},
	{at: s(60), time: '20:40', pct: 50},
	{at: s(62) + w(62, 'девять'), time: '21:00', pct: 50},
	{at: s(66) + w(66, 'двадцать'), time: '22:10', pct: 20},
	{at: s(70) + w(70, 'десять'), time: '23:30', pct: 10},
];
const NIGHT = new Set([70, 71, 72, 73]);
const NO_GRADE = new Set([5, 6, 7, 14, 73, 77, 78]);

export const Sssr1: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((sh) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(sh.index).padStart(2, '0')}`];
				const from = Math.round(RU1.fwd(sh.from));
				const to = Math.round(RU1.fwd(sh.from + sh.duration));
				return (
					<Sequence key={sh.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${sh.index}`}>
						<Retimed r={RU1} newFrom={from} oldFrom={sh.from} oldDur={sh.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
							{!NO_GRADE.has(sh.index) && sh.index < 74 && <Grade81 night={NIGHT.has(sh.index) ? 1 : 0} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD81 ticks={TICKS.map((t) => ({...t, at: Math.round(RU1.fwd(t.at))}))} show={[Math.round(RU1.fwd(s(8))), Math.round(RU1.fwd(s(73)))]} />
		<Captions captions={VOICE_CAPTIONS} wide />
		<SFXU1 r={RU1} />
	</AbsoluteFill>
);

export const Sssr1Audio: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<SFXU1 r={RU1} />
	</AbsoluteFill>
);
