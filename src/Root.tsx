import React from 'react';
import {Composition} from 'remotion';
import {Main, R1} from './Main';
import {Main2, R2} from './p2/Main';
import {Main3, R3} from './p3/Main';
import {Main4, R4} from './p4/Main';
import {Main5, R5} from './p5/Main';
import {Main6, R6} from './p6/Main';
import {Main7, R7} from './p7/Main';
import {Golosovye1, RG1} from './g1/Main';
import {Golosovye2, RG2} from './g2/Main';
import {Golosovye2b, RG2B} from './g2b/Main';
import {Golosovye3, RG3} from './g3/Main';
import {Golosovye4, RG4} from './g4/Main';
import {Golosovye5, Golosovye5Audio, RG5} from './g5/Main';
import {RT2, TgkOpen, TgkOpenAudio} from './t2/Main';
import {Knopka1, RK1} from './k1/Main';
import {Film1, RF1} from './f1/Main';
import {CoverPapaFilm, CoverPapaFilmV} from './covers/PapaFilm';
import {CoverSssr} from './covers/Sssr';
import {CoverZamerznut, CoverZamerznutB} from './covers/Zamerznut';
import {CoverZakopan, CoverZakopan2m, CoverZakopanB, CoverZakopanV, CoverZakopanZhivoj} from './covers/Zakopan';
import {CoverMedved, CoverMedvedB, CoverMedvedC} from './covers/Medved';
import {CoverMedvedXray, CoverMedvedXrayB} from './covers/MedvedXray';
import {CoverDavkaXray, CoverDavkaXrayB} from './covers/DavkaXray';
import {HostConcepts} from './covers/Hosts';
import {ChannelAvatar, ChannelBanner} from './covers/Channel';
import {ChannelAvatarW, ChannelBannerW} from './covers/ChannelW';
import {GogaSheet} from './covers/Goga';
import {CoverXrayA, CoverXrayB} from './covers/ZakopanXray';
import {CoverPitA, CoverPitB, CoverPitC} from './covers/ZakopanReal';
import {BearSheet} from './covers/BearSheet';
import {TgkOpros, RT1} from './t1/Main';
import {Film2, RF2} from './f2/Main';
import {Rayon1, Rayon1Audio, RR1} from './r1/Main';
import {Rayon2, Rayon2Audio, RR2} from './r2/Main';
import {RW1, Vek20, Vek20Audio} from './w1/Main';
import {RU1, Sssr1, Sssr1Audio} from './u1/Main';
import {SHORTS, shortDuration, SssrShort, SssrShortAudio} from './u1/shorts';
import {SHORTS as Z_SHORTS, shortDuration as zShortDuration, ZakopanShort, ZakopanShortAudio} from './z3/shorts';
import {SHORTS as M_SHORTS, shortDuration as mShortDuration, MedvedShort, MedvedShortAudio} from './z4/shorts';
import {Chips1, Chips1Audio, RC1} from './c1/Main';
import {RZ1, Zamerznut, ZamerznutAudio, ZamerznutChobi} from './z1/Main';
import {RZ2, Zhazhda, ZhazhdaAudio} from './z2/Main';
import {RZ3, Zakopan, ZakopanAudio} from './z3/Main';
import {Medved, MedvedAudio, RZ4} from './z4/Main';
import {FPS, H, SHOTS, W} from './timeline';
import * as Scenes from './scenes';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="PapaVakhta" component={Main} durationInFrames={R1.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta2" component={Main2} durationInFrames={R2.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta3" component={Main3} durationInFrames={R3.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta4" component={Main4} durationInFrames={R4.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta5" component={Main5} durationInFrames={R5.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta6" component={Main6} durationInFrames={R6.total} fps={FPS} width={W} height={H} />
		<Composition id="PapaVakhta7" component={Main7} durationInFrames={R7.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye1" component={Golosovye1} durationInFrames={RG1.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye2" component={Golosovye2} durationInFrames={RG2.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye2b" component={Golosovye2b} durationInFrames={RG2B.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye3" component={Golosovye3} durationInFrames={RG3.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye4" component={Golosovye4} durationInFrames={RG4.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye5" component={Golosovye5} durationInFrames={RG5.total} fps={FPS} width={W} height={H} />
		<Composition id="Golosovye5Audio" component={Golosovye5Audio} durationInFrames={RG5.total} fps={FPS} width={W} height={H} />
		<Composition id="TgkOpen" component={TgkOpen} durationInFrames={RT2.total} fps={FPS} width={W} height={H} />
		<Composition id="TgkOpenAudio" component={TgkOpenAudio} durationInFrames={RT2.total} fps={FPS} width={W} height={H} />
		<Composition id="Knopka1" component={Knopka1} durationInFrames={RK1.total} fps={FPS} width={W} height={H} />
		<Composition id="Film1" component={Film1} durationInFrames={RF1.total} fps={FPS} width={W} height={H} />
		<Composition id="Film2" component={Film2} durationInFrames={RF2.total} fps={FPS} width={W} height={H} />
		<Composition id="Rayon1" component={Rayon1} durationInFrames={RR1.total} fps={FPS} width={W} height={H} />
		<Composition id="Rayon1Audio" component={Rayon1Audio} durationInFrames={RR1.total} fps={FPS} width={W} height={H} />
		<Composition id="Rayon2" component={Rayon2} durationInFrames={RR2.total} fps={FPS} width={W} height={H} />
		<Composition id="Rayon2Audio" component={Rayon2Audio} durationInFrames={RR2.total} fps={FPS} width={W} height={H} />
		<Composition id="Vek20" component={Vek20} durationInFrames={RW1.total} fps={FPS} width={W} height={H} />
		<Composition id="Vek20Audio" component={Vek20Audio} durationInFrames={RW1.total} fps={FPS} width={W} height={H} />
		<Composition id="Sssr1" component={Sssr1} durationInFrames={RU1.total} fps={FPS} width={1920} height={1080} />
		<Composition id="Sssr1Audio" component={Sssr1Audio} durationInFrames={RU1.total} fps={FPS} width={1920} height={1080} />
		{SHORTS.map((_, i) => (
			<React.Fragment key={i}>
				<Composition id={`SssrShort${i + 1}`} component={SssrShort} defaultProps={{n: i + 1}} durationInFrames={shortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
				<Composition id={`SssrShort${i + 1}Audio`} component={SssrShortAudio} defaultProps={{n: i + 1}} durationInFrames={shortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
			</React.Fragment>
		))}
		{/* promo shorts from «Погребённым заживо» */}
		{Z_SHORTS.map((_, i) => (
			<React.Fragment key={`zs${i}`}>
				<Composition id={`ZakopanShort${i + 1}`} component={ZakopanShort} defaultProps={{n: i + 1}} durationInFrames={zShortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
				<Composition id={`ZakopanShort${i + 1}Audio`} component={ZakopanShortAudio} defaultProps={{n: i + 1}} durationInFrames={zShortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
			</React.Fragment>
		))}
		{/* promo shorts from «Умереть от лап медведя» */}
		{M_SHORTS.map((_, i) => (
			<React.Fragment key={`ms${i}`}>
				<Composition id={`MedvedShort${i + 1}`} component={MedvedShort} defaultProps={{n: i + 1}} durationInFrames={mShortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
				<Composition id={`MedvedShort${i + 1}Audio`} component={MedvedShortAudio} defaultProps={{n: i + 1}} durationInFrames={mShortDuration(i + 1)} fps={FPS} width={1080} height={1920} />
			</React.Fragment>
		))}
		<Composition id="TgkOpros" component={TgkOpros} durationInFrames={RT1.total} fps={FPS} width={W} height={H} />
		{/* covers for the long video (all parts as one film) */}
		<Composition id="CoverPapaFilm" component={CoverPapaFilm} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverPapaFilmV" component={CoverPapaFilmV} durationInFrames={1} fps={FPS} width={W} height={H} />
		<Composition id="Zamerznut" component={Zamerznut} durationInFrames={RZ1.total} fps={FPS} width={1920} height={1080} />
		<Composition id="ZamerznutAudio" component={ZamerznutAudio} durationInFrames={RZ1.total} fps={FPS} width={1920} height={1080} />
		<Composition id="ZamerznutChobi" component={ZamerznutChobi} durationInFrames={RZ1.total} fps={FPS} width={1920} height={1080} />
		<Composition id="Zhazhda" component={Zhazhda} durationInFrames={RZ2.total} fps={FPS} width={1920} height={1080} />
		<Composition id="ZhazhdaAudio" component={ZhazhdaAudio} durationInFrames={RZ2.total} fps={FPS} width={1920} height={1080} />
		<Composition id="Zakopan" component={Zakopan} durationInFrames={RZ3.total} fps={FPS} width={1920} height={1080} />
		<Composition id="ZakopanAudio" component={ZakopanAudio} durationInFrames={RZ3.total} fps={FPS} width={1920} height={1080} />
		<Composition id="Medved" component={Medved} durationInFrames={RZ4.total} fps={FPS} width={1920} height={1080} />
		<Composition id="MedvedAudio" component={MedvedAudio} durationInFrames={RZ4.total} fps={FPS} width={1920} height={1080} />
		<Composition id="Chips1" component={Chips1} durationInFrames={RC1.total} fps={FPS} width={W} height={H} />
		<Composition id="Chips1Audio" component={Chips1Audio} durationInFrames={RC1.total} fps={FPS} width={W} height={H} />
		<Composition id="CoverSssr" component={CoverSssr} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZamerznut" component={CoverZamerznut} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZamerznutB" component={CoverZamerznutB} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZakopan" component={CoverZakopan} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZakopanB" component={CoverZakopanB} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZakopan2m" component={CoverZakopan2m} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZakopanZhivoj" component={CoverZakopanZhivoj} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverZakopanV" component={CoverZakopanV} durationInFrames={1} fps={FPS} width={1080} height={1920} />
		<Composition id="CoverMedved" component={CoverMedved} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverMedvedB" component={CoverMedvedB} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverMedvedC" component={CoverMedvedC} durationInFrames={1} fps={FPS} width={1280} height={720} />
		<Composition id="CoverMedvedXray" component={CoverMedvedXray} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverMedvedXrayB" component={CoverMedvedXrayB} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverDavkaXray" component={CoverDavkaXray} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverDavkaXrayB" component={CoverDavkaXrayB} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverPitA" component={CoverPitA} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverPitB" component={CoverPitB} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverPitC" component={CoverPitC} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverXrayA" component={CoverXrayA} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="CoverXrayB" component={CoverXrayB} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="HostConcepts" component={HostConcepts} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="ChannelAvatar" component={ChannelAvatar} durationInFrames={1} fps={FPS} width={1024} height={1024} />
		<Composition id="ChannelBanner" component={ChannelBanner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
		<Composition id="ChannelAvatarW" component={ChannelAvatarW} durationInFrames={1} fps={FPS} width={1024} height={1024} />
		<Composition id="ChannelBannerW" component={ChannelBannerW} durationInFrames={1} fps={FPS} width={2560} height={1440} />
		<Composition id="GogaSheet" component={GogaSheet} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		<Composition id="BearSheet" component={BearSheet} durationInFrames={1} fps={FPS} width={1920} height={1080} />
		{/* every shot on its own for quick previews */}
		{SHOTS.map((s) => {
			const C = (Scenes as unknown as Record<string, React.FC>)[`S${String(s.index).padStart(2, '0')}`];
			return C ? <Composition key={s.index} id={`Shot${s.index}`} component={C} durationInFrames={s.duration} fps={FPS} width={W} height={H} /> : null;
		})}
	</>
);
