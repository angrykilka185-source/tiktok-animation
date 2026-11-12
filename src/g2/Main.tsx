import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Captions, HEAVY, HUD, SignPlaques} from '../components/Overlays';
import {KickLayer, makeRemap, remapEpisode, Retimed} from '../edit';
import edit from './edit.json';
import * as Scenes from './scenes';
import {SFXG2} from './SFX';
import {EPG2, SHOTS, TOTAL} from './timeline';
import {VOICE_CAPTIONS} from './voice';

// the picture follows the voice-over (see scripts/fit-voiceover.py --part g2)
export const RG2 = makeRemap(edit, TOTAL);
const EP = remapEpisode(EPG2, RG2);

const KICKS = VOICE_CAPTIONS.map((c) => c.words.find((w) => w.red)?.at).filter((t): t is number => t !== undefined);

// series title under the HUD for the first seconds
const SeriesBadge: React.FC = () => {
	const f = useCurrentFrame();
	if (f > 124) return null;
	const p = pop(f, 10, 12);
	const out = interpolate(f, [108, 122], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', top: 232, width: '100%', display: 'flex', justifyContent: 'center', opacity: out}}>
			<div style={{transform: `scale(${p})`, background: 'rgba(14,14,16,0.9)', border: '4px solid #ffd34a', borderRadius: 16, padding: '10px 30px', fontFamily: HEAVY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 2, textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>
				ГОЛОСОВЫЕ <span style={{color: '#ffd34a'}}>ИЗ ЗАВТРА</span>
				<div style={{fontSize: 26, color: '#ff4a3d', letterSpacing: 8, marginTop: 2}}>СЕРИЯ 2</div>
			</div>
		</div>
	);
};

export const Golosovye2: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<KickLayer times={KICKS}>
			{SHOTS.map((s) => {
				const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
				const from = Math.round(RG2.fwd(s.from));
				const to = Math.round(RG2.fwd(s.from + s.duration));
				return (
					<Sequence key={s.index} from={from} durationInFrames={Math.max(1, to - from)} name={`Кадр ${s.index}`}>
						<Retimed r={RG2} newFrom={from} oldFrom={s.from} oldDur={s.duration}>
							{C ? <C /> : <AbsoluteFill style={{background: '#333'}} />}
						</Retimed>
					</Sequence>
				);
			})}
		</KickLayer>
		<HUD ep={EP} />
		<SeriesBadge />
		<Captions captions={VOICE_CAPTIONS} />
		<SignPlaques ep={EP} />
		<SFXG2 r={RG2} />
	</AbsoluteFill>
);
