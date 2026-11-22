// «Откуда взялись чипсы» — the sound: the two voices, a quiet room tone and the effects (procedural, scripts/make-sfx.mjs)
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {VOICE} from './voice';

export const SFXC1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{VOICE.filter((l) => l.hasAudio).map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.min(Math.ceil(l.duration * 30) + 20, r.total - l.at)} name={`voice ${l.id}`}>
				<Audio src={staticFile(l.src)} volume={1} />
			</Sequence>
		))}
	</>
);
export const _K = {interpolate};
