// «Каково это — замёрзнуть насмерть» — the sound: the author's voice, the sea, the wind, the effects (procedural)
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import type {Remap} from '../edit';
import {VOICE} from './voice';

export const SFXZ1: React.FC<{r: Remap}> = ({r}) => (
	<>
		{VOICE.filter((l) => l.hasAudio).map((l) => (
			<Sequence key={l.id} from={l.at} durationInFrames={Math.min(Math.ceil(l.duration * 30) + 20, r.total - l.at)} name={`voice ${l.id}`}>
				<Audio src={staticFile(l.src)} volume={1} />
			</Sequence>
		))}
	</>
);
