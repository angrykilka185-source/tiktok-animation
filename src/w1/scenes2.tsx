// «Что будет, если ты попадёшь в XX век» — shots 16…42: 1911 (the car, the tram, the cinema, the biplane, the
// photographer), 1921 (Soviet Russia, rallies, money in thousands, rations, the literacy class), 1931 (the radio, the
// five-year plan, the library, the abacus, лапта), 1941 (22 June, the departure), 1951 (rebuilt cities, the first TV).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Far, Lay, personBox, Set3D} from '../components/Layers3D';
import {Jump} from './hud';
import {Arrive, Fact, Folk, Glow, HandPhone, HEAVY, Phone, RED, rnd, SANS, scr, SERIF, Stamp, Tag, YEL, YearTitle, You, YOU} from './kit';
import {Abacus, Bat, BreadCard, Drawer, Industry, KVN, Library, Room30, SOLDIER, Street40, Tarelka, TVRoom, Rebuild, Tractor, Yard30} from './mid';
import {Bakery, Banknote, Banner, BigCamera, Biplane, Car1911, Cinema, Classroom, CrowdRow, Desk, Poster, Sky, Studio, Tram, WallFlag} from './old';
import {OldTown} from './streets';
import {SHOTS} from './timeline';

export * from './scenes3';

const L = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.sin);
const WIDE: Face = {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false};
const CALM: Face = {eyes: 'open', brows: 'neutral', mouth: 'flat', blush: false};
const SMILE: Face = {eyes: 'open', brows: 'neutral', mouth: 'smile', blush: false};
const SAD: Face = {eyes: 'open', brows: 'sad', mouth: 'frown', blush: false};

const TownFar: React.FC<{era: 1901 | 1911 | 1921; f: number; dusk?: number}> = ({era, f, dusk}) => (
	<Far>
		<OldTown era={era} f={f} dusk={dusk} />
	</Far>
);

// ===================================================================== 1911 ==
// 16. 1911. A motor car drives down the street — passers-by turn round as at a miracle. (автомобиль@74, оборачиваются@120)
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(16);
	const carX = lerp(f, 56, len, -1300, 1500, Easing.linear);
	const watch = (x: number) => Math.max(-1, Math.min(1, (carX - x) / 500));
	const kidX = f > 120 ? lerp(f, 120, len, 640, 1100, Easing.in(Easing.quad)) : 640;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 80, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#a9c3d6" far={<TownFar era={1911} f={f} />} vig={0.58}>
				<Lay z={-900} box={[-700, 900, 2500, 600]}>
					<CrowdRow era={1911} x0={-180} dx={240} n={8} y={1330} s={0.34} id="w1s16c" seed={2} f={f} look={(k) => watch(-180 + k * 240) * 0.8} />
				</Lay>
				<Lay z={-380} box={[-1400, 1300, 3200, 700]}>
					{f >= 56 && (
						<g transform={`translate(${carX},1900) scale(1.05)`}>
							<Car1911 id="w1car" wheel={f * 14} />
						</g>
					)}
				</Lay>
				<Lay z={-620} box={[-200, 700, 1500, 1200]}>
					{[
						{who: 'm' as const, n: 2, x: 140},
						{who: 'f' as const, n: 0, x: 380},
						{who: 'm' as const, n: 5, x: 860},
					].map((p, k) => (
						<Folk key={k} era={1911} n={p.n} who={p.who} id={`w1s16p${k}`} x={p.x} y={1660} scale={0.62} breathe={f + k * 9} headTurn={watch(p.x) * 0.9} face={f > 100 ? {...WIDE, look: [watch(p.x), 0]} : {...CALM, look: [watch(p.x) * 0.5, 0]}} />
					))}
					<Folk era={1911} n={1} who="k" id="w1s16k" x={kidX} y={1680} scale={0.5} walk={f > 120 ? f * 0.45 : undefined} headTurn={watch(kidX)} face={{...WIDE, mouth: 'open', look: [watch(kidX), 0]}} armR={f > 110 ? {target: [300, -620], bend: -1} : undefined} />
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1911} sub="РОССИЙСКАЯ ИМПЕРИЯ" hold={44} />
		</AbsoluteFill>
	);
};

// 17. The electric tram rings along the rails; the conductor tears you off a paper ticket. (звенит@20, отрывает@89)
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(17);
	const {i, t} = seg(f, [70]);
	if (i === 0) {
		const tx = lerp(t, 0, 60, 1900, 560, Easing.out(Easing.cubic));
		return (
			<Set3D cam={{x: lerp(t, 0, 70, 60, -40), y: 0, z: lerp(t, 0, 70, 0, 80)}} bg="#a9c3d6" far={<TownFar era={1911} f={f} />} vig={0.58}>
				<Lay z={-760} box={[-900, 300, 3000, 1400]}>
					<g transform={`translate(${tx},1560) scale(1.3)`}>
						<Tram id="w1tram" wheel={(1900 - tx) * 0.6} />
					</g>
				</Lay>
				<Lay z={-300} box={personBox(160, 1960, 1.0)}>
					<You id="w1you17" x={160} y={1960} scale={1.0} breathe={f} headTurn={0.6} face={{...SMILE, look: [0.8, -0.1]}} />
				</Lay>
			</Set3D>
		);
	}
	const tear = interpolate(t, [16, 34], [0, 1], clamp);
	const give = interpolate(t, [38, 54], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len - 70, -30, 30), y: 0, z: lerp(t, 0, len - 70, 40, 120)}} bg="#efe2c0" far={<Far z={-1200}><rect x={-600} y={-600} width={2300} height={3200} fill="#efe2c0" />{Array.from({length: 6}).map((_, k) => <rect key={k} x={-500 + k * 380} y={300} width={300} height={500} rx={20} fill="#9ab0c0" />)}<rect x={-600} y={1100} width={2300} height={1600} fill="#8a5a3a" /></Far>} blur={6} vig={0.64}>
				<Lay z={-380} box={personBox(700, 2000, 1.15)}>
					<Person kind="dad" id="w1cond" plain kneePatch={false} colors={{top: '#2a3a5a', topDark: '#2a3a5a', pants: '#2a3a5a'}} moustache="#5a4030" hat={{type: 'peak', color: '#2a3a5a', band: '#a8302a'}} x={700} y={2000} scale={1.15} breathe={t} headTurn={-0.4} face={{...SMILE, look: [-0.6, 0.3]}} armL={{target: [-260 - 140 * give, -900 + 60 * give], bend: 1}} itemL={tear > 0.5 ? <rect x={-30} y={-16} width={60} height={36} fill="#f4e6c0" stroke="#8a7a52" strokeWidth={3} /> : undefined} />
					<circle cx={700 - 40} cy={2000 - 640 * 1.15} r={40} fill="#f4e6c0" stroke="#8a7a52" strokeWidth={8} />
					<path d={`M ${700 - 120},${2000 - 1010 * 1.15} L ${700 - 40},${2000 - 640 * 1.15}`} stroke="#5a3a22" strokeWidth={10} />
				</Lay>
			</Set3D>
			{give > 0.6 && (
				<div style={{position: 'absolute', left: 300, top: 1500, transform: `translate(-50%,-50%) scale(${pop(t, 50, 12)}) rotate(-6deg)`, background: '#f4e6c0', border: '5px solid #8a7a52', padding: '14px 30px', fontFamily: SERIF, fontWeight: 700, color: '#4a3a1e', textAlign: 'center', boxShadow: '0 12px 24px rgba(0,0,0,0.35)'}}>
					<div style={{fontSize: 30, letterSpacing: 2}}>ГОРОДСКОЙ ТРАМВАЙ</div>
					<div style={{fontSize: 52}}>БИЛЕТЪ</div>
					<div style={{fontSize: 30}}>№ 004175</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 18. In the evening — the cinema. Silent films; under the screen a piano player. (синематограф@33, без звука@80, тапёр@140)
const Taper: React.FC<{f: number; play: boolean; id: string}> = ({f, play, id}) => (
	<Person kind="dad" id={id} plain hideLegs colors={{top: '#2a2a30', topDark: '#2a2a30', hair: '#5a4030'}} moustache="#5a4030" back x={0} y={0} scale={0.6} armL={{target: [-100 + (play ? Math.sin(f / 2) * 30 : 0), -560 + (play ? Math.abs(Math.sin(f / 3)) * -30 : 0)], bend: 1}} armR={{target: [110 + (play ? Math.sin(f / 2.4 + 1) * 30 : 0), -560 + (play ? Math.abs(Math.sin(f / 3 + 1)) * -30 : 0)], bend: -1}} />
);
export const S18: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(18);
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 62, -60, 60), y: 0, z: lerp(t, 0, 62, 0, 140)}} bg="#2a2a50" far={<TownFar era={1911} f={f} dusk={1} />} vig={0.64}>
					<Lay z={-300} box={personBox(lerp(t, 0, 62, 400, 560), 1980, 1.0)}>
						<You id="w1you18" x={lerp(t, 0, 62, 400, 560)} y={1980} scale={1.0} back walk={t * 0.28} />
					</Lay>
				</Set3D>
			</AbsoluteFill>
		);
	}
	const len2 = len - 62;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len2, 80, -120, E), y: lerp(t, 0, len2, 0, 120, E), z: lerp(t, 0, len2, 0, 120, E)}} bg="#16131a" far={<Far z={-1200}><Cinema film={f} taper={<g transform="translate(180,1250)"><Taper f={f} play id="w1tap" /></g>} /></Far>} blur={2} vig={0.7} />
			{t >= 18 && (
				<div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,-50%) scale(${pop(t, 18, 12)})`, background: 'rgba(14,14,18,0.9)', border: `5px solid ${RED}`, borderRadius: 20, padding: '10px 28px', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#fff', display: 'flex', gap: 16, alignItems: 'center'}}>
					<svg width={60} height={50} viewBox="0 0 60 50">
						<path d="M 4,16 L 18,16 L 34,2 L 34,48 L 18,34 L 4,34 Z" fill="#fff" />
						<path d="M 42,14 L 58,36 M 58,14 L 42,36" stroke={RED} strokeWidth={6} strokeLinecap="round" />
					</svg>
					БЕЗ ЗВУКА
				</div>
			)}
			<Tag f={t} at={76} x={300} y={1080} tx={560} ty={1520} text="ТАПЁР" />
		</AbsoluteFill>
	);
};

// 19. You play a video with sound — the hall falls silent: where does the voice come from? (видео@24, замолкает@67, голос@140)
export const S19: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(19);
	const heads = interpolate(f, [96, 112], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 100, E)}} bg="#16131a" far={<Far z={-1200}><Cinema film={f < 67 ? f : 67} heads={heads} sound={interpolate(f, [60, 70], [0, 1], clamp)} taper={<g transform="translate(180,1250)"><Taper f={f} play={f < 62} id="w1tap19" /></g>} /></Far>} blur={3} vig={0.7}>
				<Lay z={-260} box={personBox(560, 2100, 1.2)}>
					<You id="w1you19" x={560} y={2100} scale={1.2} back armR={{target: [200, -1000], bend: -1}} itemR={<HandPhone s={1.4} screen="#ffd34a" />} />
					{f >= 10 &&
						[0, 1, 2].map((k) => {
							const tt = ((f / 14 + k / 3) % 1);
							return <circle key={k} cx={800} cy={880} r={60 + tt * 260} fill="none" stroke="#ffd34a" strokeWidth={8} opacity={(1 - tt) * 0.6} />;
						})}
				</Lay>
			</Set3D>
			{f >= 126 &&
				[[240, 860], [520, 780], [860, 860]].map(([x, y], k) => (
					<div key={k} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f, 126 + k * 5, 10)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 110, color: YEL, textShadow: '0 6px 0 rgba(0,0,0,0.5)'}}>
						?
					</div>
				))}
		</AbsoluteFill>
	);
};

// 20. The first aeroplanes: wood, fabric and wire. Half a century more to space. (самолёты@37, дерево@61, ткань@83, проволока@97, полвека@152)
export const S20: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(20);
	const {i, t} = seg(f, [52, 118]);
	if (i === 0) {
		const px = lerp(t, 0, 52, -300, 900, Easing.linear);
		return (
			<Set3D cam={{x: lerp(t, 0, 52, -40, 40), y: lerp(t, 0, 52, 40, -60), z: 40}} bg="#a9c3d6" far={<Far><Sky top="#8fb4d8" bottom="#efe8d8" /><rect x={-600} y={1240} width={2300} height={1400} fill="#8a9a5a" /><rect x={-600} y={1240} width={2300} height={30} fill="#7a8a4a" /></Far>} vig={0.55}>
				<Lay z={-900} box={[-700, 200, 2500, 900]}>
					<g transform={`translate(${px},${560 - t * 2}) scale(0.7) rotate(-4)`}>
						<Biplane prop={f * 1.3} />
					</g>
				</Lay>
				<Lay z={-380} box={[-300, 900, 1700, 1000]}>
					<CrowdRow era={1911} x0={-80} dx={220} n={6} y={1860} s={0.7} id="w1s20c" seed={4} f={f} face={() => ({eyes: 'wide', mouth: 'o', brows: 'raised', look: [0.3, -0.9]})} look={() => 0.2} />
				</Lay>
			</Set3D>
		);
	}
	if (i === 1) {
		const lenB = 66;
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, lenB, -60, 60), y: 0, z: lerp(t, 0, lenB, 0, 60)}} bg="#8fb4d8" far={<Far><Sky top="#8fb4d8" bottom="#e8eef2" /></Far>} vig={0.5}>
					<Lay z={-300} box={[-100, 500, 1280, 900]}>
						<g transform={`translate(560,${900 + Math.sin(t / 8) * 12}) scale(1.55) rotate(-3)`}>
							<Biplane prop={f * 1.3} />
						</g>
					</Lay>
				</Set3D>
				<Tag f={t} at={9} x={440} y={900} tx={300} ty={560} text="ДЕРЕВО" />
				<Tag f={t} at={31} x={700} y={780} tx={800} ty={500} text="ТКАНЬ" />
				<Tag f={t} at={45} x={260} y={980} tx={360} ty={1520} text="ПРОВОЛОКА" />
			</AbsoluteFill>
		);
	}
	const sp = interpolate(t, [0, 40], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${sp > 0.5 ? '#0a1030' : '#5a80b0'} 0%, #8fb4d8 100%)`}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #050816 0%, #1a2450 60%, #5a80b0 100%)', opacity: sp}} />
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{Array.from({length: 60}).map((_, k) => (
					<circle key={k} cx={rnd(k) * 1080} cy={rnd(k * 3) * 1300} r={2 + rnd(k * 7) * 3} fill="#fff" opacity={sp * (0.4 + 0.6 * rnd(k * 5))} />
				))}
				<g transform={`translate(${lerp(t, 0, 55, 380, 720)},${lerp(t, 0, 55, 1400, 900)}) scale(0.28) rotate(-20)`}>
					<Biplane prop={f * 1.3} />
				</g>
			</svg>
			<Fact f={t} at={6} text="ДО ПОЛЁТА В КОСМОС — 50 ЛЕТ" y={420} />
		</AbsoluteFill>
	);
};

// 21. You show the photographer your selfie. He is silent for a long time — then asks where it was developed.
// (фотографу@28, селфи@52, молчит@85, проявляли@135)
export const S21: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(21);
	const show = interpolate(f, [40, 54], [0, 1], clamp);
	const face: Face = f < 66 ? {...SMILE, look: [-0.7, 0.2]} : f < 106 ? {eyes: 'wide', pupil: 0.45, brows: 'raised', mouth: 'flat', blush: false, look: [-0.6, 0.3]} : {eyes: 'narrow', brows: 'raised', mouth: 'o', blush: false, look: [-0.6, 0.3]};
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, 60, -40, E), y: 0, z: lerp(f, 0, len, 0, 140, E)}} bg="#5a4a3e" far={<Far><Studio /></Far>} vig={0.64}>
				<Lay z={-560} box={[-400, 600, 900, 1300]}>
					<g transform="translate(60,1800) scale(1.2)">
						<BigCamera cloth={Math.sin(f / 20)} />
					</g>
				</Lay>
				<Lay z={-420} box={personBox(720, 1860, 0.9)}>
					<Person kind="dad" id="w1foto" plain kneePatch={false} colors={{top: '#4a3a2c', topDark: '#4a3a2c', pants: '#2a2a2e', hair: '#2a2220'}} moustache="#2a2220" x={720} y={1860} scale={0.9} breathe={f} headTurn={-0.5} face={face} armL={{target: [-120, -760], bend: 1}} />
				</Lay>
				<Lay z={-240} box={personBox(280, 2080, 1.15)}>
					<You id="w1you21" x={280} y={2080} scale={1.15} breathe={f} headTurn={0.5} face={{...SMILE, look: [0.8, 0]}} armR={{target: [300, -700 - 60 * show], bend: -1}} itemR={<HandPhone s={1.4} />} />
				</Lay>
			</Set3D>
			{show > 0 && f < 104 && (
				<div style={{position: 'absolute', left: 300, top: 660, transform: `translate(-50%,-50%) scale(${show}) rotate(-4deg)`}}>
					<div style={{width: 300, height: 420, borderRadius: 34, background: '#15161a', padding: 12, boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
						<svg width={276} height={396} viewBox="0 0 276 396" style={{borderRadius: 24}}>
							<rect width={276} height={396} fill="#7ac0f0" />
							<rect y={270} width={276} height={126} fill="#6aa84a" />
							<g transform="translate(138,330)">
								<Bust kind="teen" id="w1selfie" colors={YOU} scale={0.9} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false, glasses: false}} y={-150} />
							</g>
						</svg>
					</div>
				</div>
			)}
			<Bubble x={760} y={640} text="А где проявляли?" from={108} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 22. 80 %. The jump to 1921.
export const S22: React.FC = () => <Jump len={L(22)} fromYear={1911} toYear={1921} fromPct={90} toPct={80} />;

// ===================================================================== 1921 ==
// 23. 1921. No more tsar: instead of the empire — Soviet Russia. (царя@58, империи@110, Советская@133)
export const S23: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(23);
	const cam = {x: lerp(f, 0, len, -40, 40, E), y: lerp(f, 30, 140, 260, -40, E), z: lerp(f, 0, len, 160, 40, E)};
	return (
		<AbsoluteFill>
			<Set3D cam={cam} bg="#b8c0c4" far={<TownFar era={1921} f={f} />} vig={0.6}>
				<Lay z={-500} box={[-300, 900, 1700, 1000]}>
					<CrowdRow era={1921} x0={-100} dx={240} n={6} y={1780} s={0.66} id="w1s23c" seed={2} f={f} />
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1921} sub="РСФСР" hold={46} color="#ff6a5a" />
			<Fact f={f} at={60} to={128} text="ИМПЕРИИ БОЛЬШЕ НЕТ" y={300} color={RED} />
		</AbsoluteFill>
	);
};

// 24. Red flags and posters everywhere; the city is noisy with rallies. (флаги@39, плакаты@54, митингами@100)
const Tribune: React.FC<{f: number}> = ({f}) => (
	<g>
		<rect x={-260} y={-300} width={520} height={300} fill="#c8282a" />
		<rect x={-280} y={-320} width={560} height={30} fill="#8a1e1e" />
		<g transform="translate(0,-300)">
			<Person kind="dad" id="w1orator" plain kneePatch={false} colors={{top: '#2a2422', topDark: '#2a2422', pants: '#2a2422', hair: '#3a2a20'}} cap="#2a2422" x={0} y={0} scale={0.6} breathe={f} face={{eyes: 'narrow', brows: 'angry', mouth: Math.floor(f / 5) % 2 ? 'open' : 'o', blush: false}} armR={{target: [200, -900 + Math.sin(f / 6) * 50], bend: -1}} />
		</g>
	</g>
);
export const S24: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(24);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, 80, -80, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#b8c0c4" far={<TownFar era={1921} f={f} />} vig={0.6}>
				<Lay z={-800} box={[-300, 800, 1600, 1000]}>
					<g transform="translate(560,1500)">
						<Tribune f={f} />
					</g>
				</Lay>
				<Lay z={-420} box={[-400, 600, 1900, 1400]}>
					{Array.from({length: 4}).map((_, k) => (
						<g key={k}>
							<line x1={-60 + k * 380} y1={1700} x2={-60 + k * 380} y2={900} stroke="#5a3a22" strokeWidth={10} />
							<WallFlag x={-60 + k * 380} y={1050} wave={f / 7 + k} />
						</g>
					))}
					<CrowdRow era={1921} x0={-200} dx={200} n={9} y={1880} s={0.82} id="w1s24c" seed={5} f={f} back />
				</Lay>
			</Set3D>
			<Tag f={f} at={40} x={440} y={760} tx={300} ty={520} text="КРАСНЫЕ ФЛАГИ" color={RED} />
		</AbsoluteFill>
	);
};

// 25. Money lost its value: prices in thousands of roubles; bread is handed out by ration. (тысячах@74, пайкам@137)
const Prices: React.FC<{f: number}> = ({f}) => {
	const steps = ['500', '1 000', '3 000', '10 000'];
	const k = Math.min(steps.length - 1, Math.floor(interpolate(f, [30, 92], [0, steps.length - 0.01], clamp)));
	return (
		<div style={{position: 'absolute', left: 540, top: 470, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#2a3a30', border: '10px solid #6a4628', padding: '20px 40px', textAlign: 'center', fontFamily: SERIF, color: '#f4f0e8', boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>
			<div style={{fontSize: 44, letterSpacing: 6}}>ЦЕНА</div>
			<div style={{position: 'relative', fontSize: 120, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
				{steps[k]} р.
				{k > 0 && <div style={{position: 'absolute', left: -20, top: -50, fontSize: 50, color: '#ff8a7a', textDecoration: 'line-through', opacity: 0.8}}>{steps[k - 1]}</div>}
			</div>
		</div>
	);
};
export const S25: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(25);
	const {i, t} = seg(f, [100]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 100, -40, 40), y: 0, z: lerp(t, 0, 100, 0, 90)}} bg="#b8c0c4" far={<TownFar era={1921} f={f} />} blur={9} vig={0.66}>
					<Lay z={-220} box={[-200, 900, 1500, 1200]}>
						{[0, 1, 2, 3, 4].map((k) => (
							<Banknote key={k} x={540 + (k - 2) * 60} y={1500 - k * 26} rot={-20 + k * 10} value="10 000" />
						))}
					</Lay>
				</Set3D>
				<Prices f={t} />
			</AbsoluteFill>
		);
	}
	const give = interpolate(t, [26, 40], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len - 100, 60, -30), y: 0, z: lerp(t, 0, len - 100, 0, 90)}} bg="#b8c0c4" far={<TownFar era={1921} f={f} />} vig={0.62}>
				<Lay z={-600} box={[-200, 500, 1500, 1100]}>
					<rect x={330} y={760} width={460} height={420} fill="#5a3a22" />
					<rect x={360} y={900} width={400} height={260} fill="#2a1e14" />
					<rect x={300} y={700} width={520} height={90} fill="#c8282a" />
					<text x={560} y={762} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={50} fill="#f4ecd8">
						ВЫДАЧА ПАЙКОВ
					</text>
					<rect x={360} y={1120} width={400} height={40} fill="#6a4628" />
					<g transform={`translate(${560 - 120 * give},1110)`}>
						<path d="M -40,10 A 40,30 0 0 1 40,10 Z" fill="#8a6a3a" />
					</g>
				</Lay>
				<Lay z={-360} box={[-400, 700, 1900, 1300]}>
					<CrowdRow era={1921} x0={-160} dx={170} n={6} y={1900} s={0.85} id="w1s25q" seed={3} f={t} back />
				</Lay>
			</Set3D>
			<Tag f={t} at={30} x={560} y={1060} tx={560} ty={520} text="ХЛЕБ — ПО ПАЙКАМ" />
		</AbsoluteFill>
	);
};

// 26. All over the country people learn to read — the «ликбез». Adults sit at the desks with children.
// (ликбез@101, взрослые@122, детьми@176)
export const S26: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(26);
	const cam = {x: lerp(f, 110, 170, 0, 120, E), y: lerp(f, 110, 170, -80, 260, E), z: lerp(f, 0, len, 0, 140, E)};
	const write = (k: number) => Math.sin(f / 4 + k) * 10;
	return (
		<AbsoluteFill>
			<Set3D cam={cam} bg="#d8cfb8" far={<Far><Classroom /></Far>} vig={0.6}>
				<Lay z={-700} box={personBox(940, 1500, 0.66)}>
					<Folk era={1921} n={3} who="f" id="w1teach" x={940} y={1500} scale={0.66} breathe={f} headTurn={-0.4} face={{...SMILE, look: [-0.6, 0]}} armR={{target: [-60, -760], bend: -1}} armL={{target: [-300, -700 + Math.sin(f / 9) * 30], bend: 1}} />
				</Lay>
				<Lay z={-420} box={[-300, 1100, 1700, 1200]}>
					{[
						{x: 140, who: 'm' as const, n: 0, beard: '#8a8a86'},
						{x: 420, who: 'k' as const, n: 1},
						{x: 700, who: 'f' as const, n: 4},
						{x: 960, who: 'k' as const, n: 3},
					].map((p, k) => (
						<g key={k}>
							<Folk era={p.who === 'm' ? 1901 : 1921} n={p.n} who={p.who} id={`w1s26s${k}`} x={p.x} y={1980} scale={p.who === 'k' ? 0.62 : 0.74} breathe={f + k * 7} headTilt={10} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, look: [0, 0.9]}} armR={{target: [60 + write(k), -560], bend: -1}} />
							<Desk x={p.x} y={1640} w={300} />
						</g>
					))}
				</Lay>
			</Set3D>
			<Fact f={f} at={100} text="ЛИКБЕЗ — ЛИКВИДАЦИЯ БЕЗГРАМОТНОСТИ" y={330} />
		</AbsoluteFill>
	);
};

// 27. You try to explain food delivery — they look at you as if you're mad. (доставка@61, сумасшедшего@122)
export const S27: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(27);
	const stare = interpolate(f, [90, 104], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -50, 50, E), y: 0, z: lerp(f, 0, len, 0, 120, E)}} bg="#b8c0c4" far={<TownFar era={1921} f={f} />} vig={0.6}>
				<Lay z={-440} box={[200, 600, 1300, 1300]}>
					{[
						{who: 'm' as const, n: 0, x: 560},
						{who: 'f' as const, n: 2, x: 780},
						{who: 'm' as const, n: 2, x: 980},
					].map((p, k) => (
						<Folk key={k} era={1921} n={p.n} who={p.who} id={`w1s27p${k}`} x={p.x} y={1800} scale={0.8} breathe={f + k * 7} headTurn={-0.6 * stare} face={stare > 0.5 ? {eyes: k === 1 ? 'narrow' : 'wide', pupil: 0.5, brows: k === 1 ? 'angry' : 'raised', mouth: k === 2 ? 'o' : 'flat', blush: false, look: [-0.9, 0]} : {...CALM, look: [-0.3, 0]}} />
					))}
				</Lay>
				<Lay z={-240} box={personBox(250, 2000, 1.08)}>
					<You id="w1you27" x={250} y={2000} scale={1.08} breathe={f} headTurn={0.5} face={{eyes: 'open', mouth: f < 88 && Math.floor(f / 5) % 2 === 0 ? 'open' : 'smile', brows: 'raised', blush: false, look: [0.8, 0]}} armR={{target: [300, -720], bend: -1}} itemR={<HandPhone s={1.3} screen="#ff7a4a" />} />
				</Lay>
			</Set3D>
			{f >= 40 && f < 120 && (
				<div style={{position: 'absolute', left: 300, top: 620, transform: `translate(-50%,-50%) scale(${pop(f, 40, 12)})`, width: 300, height: 220, borderRadius: 30, background: '#ff7a4a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, color: '#fff', fontSize: 40, boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
					<svg width={140} height={90} viewBox="0 0 140 90">
						<path d="M 10,40 Q 70,-10 130,40 Z" fill="#f4c06a" />
						<rect x={10} y={44} width={120} height={14} rx={6} fill="#6a3a1e" />
						<rect x={14} y={60} width={112} height={8} fill="#3aa84a" />
						<path d="M 10,72 Q 70,96 130,72 L 130,66 L 10,66 Z" fill="#f4c06a" />
					</svg>
					ДОСТАВКА
				</div>
			)}
			<Bubble x={430} y={860} text="Еду привозят домой!" from={58} to={len} />
		</AbsoluteFill>
	);
};

// 28. 70 %. The jump to 1931.
export const S28: React.FC = () => <Jump len={L(28)} fromYear={1921} toYear={1931} fromPct={80} toPct={70} />;

// ===================================================================== 1931 ==
// 29. 1931. A black «тарелка» on the wall; the news only comes from it. (радиотарелка@95, новости@139)
export const S29: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(29);
	const sound = interpolate(f, [136, 146], [0, 1], clamp);
	const push = interpolate(f, [88, 130], [0, 1], {...clamp, easing: E});
	const cam = {x: lerp(push, 0, 1, 0, -170), y: lerp(push, 0, 1, 0, -560), z: lerp(push, 0, 1, 0, 420) + lerp(f, 0, len, 0, 40)};
	return (
		<AbsoluteFill>
			<Set3D cam={cam} bg="#c9b48a" far={<Far z={-1200}><Room30 f={f} /></Far>} blur={3} vig={0.62}>
				<Lay z={-700} box={[260, 300, 320, 330]}>
					<Tarelka x={420} y={460} r={110} sound={sound} f={f} />
				</Lay>
				<Lay z={-380} box={[-200, 900, 1500, 1000]}>
					<Folk era={1931} n={0} who="m" id="w1s29d" x={220} y={1880} scale={0.72} breathe={f} headTurn={0.3} face={{...CALM, look: [0.4, -0.6]}} />
					<Folk era={1931} n={2} who="f" id="w1s29m" x={520} y={1880} scale={0.72} breathe={f + 9} face={{...CALM, look: [-0.2, -0.7]}} />
					<Folk era={1931} n={1} who="k" id="w1s29k" x={780} y={1890} scale={0.6} breathe={f + 4} headTurn={-0.3} face={{...SMILE, look: [-0.5, -0.8]}} />
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1931} sub="СССР" hold={46} color="#ff6a5a" />
			<Bubble x={560} y={760} text="Говорит Москва!" from={140} to={len} dark />
		</AbsoluteFill>
	);
};

// 30. The whole country lives by five-year plans: factories, power stations, the first tractors.
// (пятилетками@30, заводы@73, электростанции@87, тракторы@134)
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(30);
	const {i, t} = seg(f, [56]);
	if (i === 0) {
		return (
			<Set3D cam={{x: 0, y: lerp(t, 0, 56, 60, -40), z: lerp(t, 0, 56, 0, 120)}} bg="#d8cdb4" far={<Far><rect x={-600} y={-600} width={2300} height={3200} fill="#c9bca2" /></Far>} vig={0.6}>
				<Lay z={-300} box={[120, 160, 840, 1000]}>
					<Poster x={170} y={200} w={740} h={900} text={'ПЯТИЛЕТКУ —\nВ 4 ГОДА!'} art="gear" bg="#e8dcc0" />
				</Lay>
			</Set3D>
		);
	}
	const len2 = len - 56;
	const tr = lerp(t, 60, len2, -700, 520, Easing.out(Easing.quad));
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len2, 140, -60, E), y: lerp(t, 0, len2, -60, 40, E), z: lerp(t, 0, len2, 0, 100, E)}} bg="#9fb8cc" far={<Far><Industry f={f} /></Far>} vig={0.56}>
				<Lay z={-300} box={[-900, 1300, 2600, 700]}>
					{t >= 56 && (
						<g transform={`translate(${tr},1820) scale(1.05)`}>
							<Tractor rot={t * 6} id="w1tr" driver={<g transform="translate(40,-170)"><Folk era={1931} n={1} who="f" id="w1trd" hideLegs x={0} y={0} scale={0.4} face={{...SMILE, look: [0.6, 0]}} armR={{target: [150, -300], bend: -1}} /></g>} />
						</g>
					)}
				</Lay>
			</Set3D>
			<Tag f={t} at={17} x={700} y={1000} tx={720} ty={620} text="ЗАВОДЫ" />
			<Tag f={t} at={31} x={160} y={880} tx={240} ty={480} text="ЭЛЕКТРОСТАНЦИИ" />
			<Tag f={t} at={78} x={Math.max(120, Math.min(980, tr * 0.9 + 200))} y={1560} tx={540} ty={1530} text="ТРАКТОР" color={RED} />
		</AbsoluteFill>
	);
};

// 31. No search engine, no videos — only the library and its paper card catalogue. (поисковика@47, видео@77, библиотека@109, каталог@147)
export const S31: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(31);
	const {i, t} = seg(f, [96, 128]);
	if (i === 0) {
		const typed = 'как устроен телефон'.slice(0, Math.floor(interpolate(t, [4, 40], [0, 19], clamp)));
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 96, -30, 30), y: 0, z: 40}} bg="#d8cdb4" far={<Far><Library /></Far>} blur={10} vig={0.7} />
				<AbsoluteFill style={{background: 'rgba(8,10,18,0.3)'}} />
				<Phone x={540} y={940} w={560} rot={-2}>
					<div style={{position: 'absolute', inset: 0, background: '#f4f6f8', fontFamily: SANS}}>
						<div style={{position: 'absolute', left: 30, right: 30, top: 120, height: 90, borderRadius: 45, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 34, fontWeight: 700, color: '#222'}}>
							{typed}
							<span style={{width: 3, height: 40, background: '#2d6cdf', marginLeft: 4, opacity: Math.floor(t / 8) % 2}} />
						</div>
						{t >= 44 && (
							<div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${pop(t, 44, 12)})`}}>
								<div style={{fontSize: 120, color: RED, fontWeight: 900}}>✕</div>
								<div style={{fontSize: 40, fontWeight: 900, color: '#222'}}>Нет подключения</div>
							</div>
						)}
						{t >= 70 && (
							<div style={{position: 'absolute', left: 60, right: 60, top: 620, height: 260, borderRadius: 20, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(t, 70, 12)})`}}>
								<div style={{width: 0, height: 0, borderTop: '40px solid transparent', borderBottom: '40px solid transparent', borderLeft: '64px solid #555'}} />
								<div style={{position: 'absolute', fontSize: 160, color: RED, fontWeight: 900}}>✕</div>
							</div>
						)}
					</div>
				</Phone>
			</AbsoluteFill>
		);
	}
	if (i === 1) {
		return (
			<Set3D cam={{x: lerp(t, 0, 32, -80, 0), y: 0, z: lerp(t, 0, 32, 0, 120)}} bg="#d8cdb4" far={<Far><Library pull={interpolate(t, [10, 30], [0, 1], clamp)} /></Far>} vig={0.6}>
				<Lay z={-260} box={personBox(240, 2020, 1.05)}>
					<You id="w1you31" x={240} y={2020} scale={1.05} back walk={t < 24 ? t * 0.28 : undefined} />
				</Lay>
			</Set3D>
		);
	}
	return (
		<Set3D cam={{x: 0, y: lerp(t, 0, len - 128, 40, -40), z: lerp(t, 0, len - 128, 0, 120)}} bg="#5a3a22" far={<Far z={-1200}><Library pull={1} /></Far>} blur={10} vig={0.66}>
			<Lay z={-240} box={[100, 600, 880, 900]}>
				<Drawer flip={interpolate(t, [4, 34], [0, 9], clamp)} />
			</Lay>
		</Set3D>
	);
};

// 32. You show the boys a calculator. They count on an abacus — and are barely behind. (калькулятор@41, счётах@91, отстают@129)
export const S32: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(32);
	const run = interpolate(f, [70, 118], [0, 1], clamp);
	const slide = Array.from({length: 10}).map((_, r) => Math.min(1, Math.max(0, run * 3 - r * 0.22)) * (0.2 + 0.8 * rnd(r + 7)));
	const done = f >= 118;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 100, E)}} bg="#9fbad2" far={<Far><Yard30 f={f} /></Far>} vig={0.58}>
				<Lay z={-420} box={personBox(780, 1900, 0.82)}>
					<Folk era={1931} n={0} who="k" id="w1s32a" x={600} y={1880} scale={0.66} breathe={f} headTurn={-0.3} face={{...(done ? {eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false} : {eyes: 'narrow', mouth: 'tight', brows: 'neutral', blush: false}), look: [0, 0.9]}} />
					<Folk era={1931} n={2} who="k" id="w1s32b" x={900} y={1900} scale={0.7} breathe={f + 5} headTilt={8} face={{...(done ? {eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false} : {eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false}), look: [-0.4, 0.9]}} armL={{target: [-170, -560], bend: 1}} armR={{target: [100, -560], bend: -1}} />
					<Abacus x={820} y={1480} s={0.45} slide={slide} />
				</Lay>
				<Lay z={-260} box={personBox(240, 2040, 1.08)}>
					<You id="w1you32" x={240} y={2040} scale={1.08} breathe={f} headTurn={0.5} face={{...(done ? {eyes: 'wide', mouth: 'o', brows: 'raised', blush: false} : SMILE), look: [0.8, 0.2]}} armR={{target: [300, -700], bend: -1}} itemR={<HandPhone s={1.3} screen="#e8eef4" />} />
				</Lay>
			</Set3D>
			{f >= 36 && (
				<div style={{position: 'absolute', left: 280, top: 600, transform: `translate(-50%,-50%) scale(${pop(f, 36, 12)})`, background: '#1a1c22', borderRadius: 26, padding: '16px 28px', fontFamily: SANS, fontWeight: 900, color: '#fff', textAlign: 'right', minWidth: 300, boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>
					<div style={{fontSize: 34, color: '#9aa3b2'}}>347 × 12</div>
					<div style={{fontSize: 70}}>= 4164</div>
				</div>
			)}
			{done && (
				<div style={{position: 'absolute', left: 820, top: 560, transform: `translate(-50%,-50%) scale(${pop(f, 118, 12)})`, background: '#e8dcc0', border: '6px solid #8a5a34', borderRadius: 20, padding: '10px 26px', fontFamily: SERIF, fontWeight: 700, color: '#4a2a12', fontSize: 64}}>
					4164
				</div>
			)}
			<Stamp f={f} at={126} x={540} y={430} text="ПОЧТИ НИЧЬЯ!" rot={-4} color={YEL} size={54} />
		</AbsoluteFill>
	);
};

// 33. Then they invite you to play лапта — almost baseball, only ours. (лапту@48, бейсбол@83)
export const S33: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(33);
	const swing = interpolate(f, [56, 64], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const ball = f < 64 ? {x: lerp(f, 30, 64, 1000, 470, Easing.linear), y: lerp(f, 30, 64, 1400, 1300)} : {x: lerp(f, 64, len, 470, 1300, Easing.out(Easing.quad)), y: 1300 - Math.sin(interpolate(f, [64, len], [0, Math.PI * 0.8], clamp)) * 900};
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 80, E), y: lerp(f, 60, len, 0, -120, E), z: lerp(f, 0, len, 0, 80, E)}} bg="#9fbad2" far={<Far><Yard30 f={f} /></Far>} vig={0.56}>
				<Lay z={-560} box={[200, 700, 1400, 1300]}>
					<Folk era={1931} n={1} who="k" id="w1s33p" x={1040} y={1760} scale={0.6} breathe={f} headTurn={-0.5} face={{...SMILE, look: [-0.8, 0]}} armR={f < 34 ? {target: [160, -820], bend: -1} : undefined} />
					<Folk era={1931} n={4} who="k" id="w1s33q" x={860} y={1700} scale={0.54} breathe={f + 5} face={f > 70 ? {eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false} : SMILE} armL={f > 70 ? {target: [-160, -760], bend: 1} : undefined} armR={f > 70 ? {target: [160, -760], bend: -1} : undefined} />
				</Lay>
				<Lay z={-280} box={personBox(330, 2000, 1.05)}>
					<You id="w1you33" x={330} y={2000} scale={1.05} breathe={f} headTurn={0.5} face={{...(f > 66 ? {eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false} : {eyes: 'narrow', mouth: 'tight', brows: 'angry', blush: false}), look: [0.8, 0]}} armR={{target: [lerp(swing, 0, 1, -40, 380), lerp(swing, 0, 1, -1060, -820)], bend: -1}} itemR={<g transform={`rotate(${lerp(swing, 0, 1, 160, 270)})`}><Bat /></g>} />
				</Lay>
				<Lay z={-300} box={[-200, 200, 1800, 1700]}>
					<circle cx={ball.x} cy={ball.y} r={22} fill="#f4f0e8" stroke="#8a7a62" strokeWidth={4} />
				</Lay>
			</Set3D>
			<Tag f={f} at={48} x={300} y={760} tx={330} ty={500} text="ЛАПТА" />
			<Fact f={f} at={84} text="ПОЧТИ БЕЙСБОЛ — ТОЛЬКО НАШ" y={330} />
		</AbsoluteFill>
	);
};

// 34. 60 %. The jump to 1941.
export const S34: React.FC = () => <Jump len={L(34)} fromYear={1931} toYear={1941} fromPct={70} toPct={60} />;

// ===================================================================== 1941 ==
// 35. 1941. 22 June. From the radio: the war has begun. (двадцать второе@53, радиотарелки@106, война@165)
export const S35: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(35);
	const sound = interpolate(f, [102, 112], [0, 1], clamp);
	const dark = interpolate(f, [140, 170], [0, 0.35], clamp);
	const fear = f > 150;
	const push = interpolate(f, [98, 132], [0, 1], {...clamp, easing: E});
	const cam = {x: lerp(push, 0, 1, 0, -120), y: lerp(push, 0, 1, 0, -380), z: lerp(push, 0, 1, 0, 260) + lerp(f, 0, len, 0, 40)};
	const cal = interpolate(f, [50, 58, 92, 100], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={cam} bg="#c9b48a" far={<Far z={-1200}><Room30 f={f} sound={sound} dark={dark} calendar="1941" /></Far>} blur={3} vig={0.66 + dark * 0.4}>
				<Lay z={-380} box={[-200, 900, 1500, 1000]}>
					<Folk era={1941} n={1} who="m" id="w1s35d" x={240} y={1880} scale={0.72} breathe={f} headTurn={0.3} face={fear ? {...SAD, look: [0.4, -0.6]} : {...CALM, look: [0.4, -0.6]}} />
					<Folk era={1941} n={0} who="f" id="w1s35m" x={520} y={1880} scale={0.72} breathe={f + 9} face={fear ? {eyes: 'wide', pupil: 0.5, brows: 'worried', mouth: 'o', blush: false, look: [-0.2, -0.7]} : {...CALM, look: [-0.2, -0.7]}} armR={fear ? {target: [40, -800], bend: -1} : undefined} />
					<Folk era={1941} n={2} who="k" id="w1s35k" x={780} y={1890} scale={0.58} breathe={f + 4} headTurn={-0.3} face={fear ? {...SAD, look: [-0.5, -0.8]} : {...SMILE, look: [-0.5, -0.8]}} />
				</Lay>
			</Set3D>
			<Arrive f={f} len={14} />
			<YearTitle f={f} year={1941} sub="СССР" hold={40} color="#ff6a5a" />
			{cal > 0 && (
				<div style={{position: 'absolute', left: 540, top: 600, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * cal}) rotate(-3deg)`, opacity: cal, width: 420, background: '#f4ecd8', border: '8px solid #8a6a44', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>
					<div style={{background: '#a8302a', color: '#fff', fontSize: 44, padding: '10px 0'}}>ИЮНЬ 1941</div>
					<div style={{fontSize: 210, color: '#a8302a', lineHeight: 1.05}}>22</div>
					<div style={{fontSize: 40, color: '#2a2220', paddingBottom: 16}}>ВОСКРЕСЕНЬЕ</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 36. You know what nobody around knows: victory will come — 9 May 1945. (победа@90, девятого мая@128)
export const S36: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(36);
	const light = interpolate(f, [88, 110], [0, 1], clamp);
	const date = interpolate(f, [124, 140], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -30, 30, E), y: 0, z: lerp(f, 0, len, 0, 120, E)}} bg="#8a7a5a" far={<Far z={-1200}><Room30 f={f} dark={0.3} calendar="1941" /></Far>} blur={8} vig={0.72}>
				<Lay z={-240} box={[60, 260, 960, 1700]}>
					<Bust kind="teen" id="w1you36" colors={YOU} x={540} y={980} scale={2.2} face={{eyes: 'open', brows: f > 100 ? 'worried' : 'sad', mouth: f > 110 ? 'tight' : 'flat', blush: false, glasses: false, look: [0.3, 0.1]}} turn={0.2} />
					<Glow id="w1v36" x={600} y={900} r={700} color="#fff3c0" o={0.4 * light} />
				</Lay>
			</Set3D>
			{date > 0 && (
				<div style={{position: 'absolute', left: 540, top: 360, transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * date})`, opacity: date, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, whiteSpace: 'nowrap'}}>
					<div style={{fontSize: 96, color: '#ff5a4a', textShadow: '0 6px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,90,74,0.4)'}}>9 МАЯ 1945</div>
					<div style={{fontSize: 48, color: '#fff', letterSpacing: 12, marginTop: 4, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>ПОБЕДА</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

// 37. But you can't tell anyone. You watch the fathers leave for the front — and yesterday's schoolboys.
// (уходят@92, фронт@108, отцы@118, школьники@153)
export const S37: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(37);
	const {i, t} = seg(f, [112]);
	if (i === 0) {
		const march = t * 1.6;
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 112, -40, 40), y: 0, z: lerp(t, 0, 112, 0, 100)}} bg="#9fbad2" far={<Far><Street40 dark={0.25} /></Far>} vig={0.66}>
					<Lay z={-900} box={[-400, 800, 1900, 800]}>
						{Array.from({length: 10}).map((_, k) => (
							<Person key={k} kind="dad" id={`w1s37f${k}`} {...SOLDIER} x={260 + (k % 5) * 120} y={1360 - Math.floor(k / 5) * 40 - march * 0.2} scale={0.3} back walk={t * 0.3 + k} backpack />
						))}
					</Lay>
					<Lay z={-560} box={[-400, 800, 1900, 1100]}>
						{Array.from({length: 6}).map((_, k) => (
							<Person key={k} kind="dad" id={`w1s37m${k}`} {...SOLDIER} x={300 + (k % 3) * 170} y={1660 - Math.floor(k / 3) * 70 - march * 0.6} scale={0.5} back walk={t * 0.3 + k * 1.3} backpack />
						))}
					</Lay>
					<Lay z={-320} box={[-400, 900, 1900, 1200]}>
						<Folk era={1941} n={0} who="f" id="w1s37w" x={60} y={1960} scale={0.95} breathe={t} headTurn={0.4} face={SAD} armR={{target: [200, -1100 + Math.sin(t / 4) * 40], bend: -1}} />
						<Folk era={1941} n={1} who="k" id="w1s37k" x={240} y={1980} scale={0.7} breathe={t + 5} headTurn={0.5} face={SAD} armR={{target: [180, -800 + Math.sin(t / 3) * 40], bend: -1}} />
						<Folk era={1941} n={3} who="f" id="w1s37w2" x={980} y={1960} scale={0.92} breathe={t + 9} headTurn={-0.4} face={SAD} armL={{target: [-200, -1060 + Math.sin(t / 4 + 1) * 40], bend: 1}} />
					</Lay>
				</Set3D>
			</AbsoluteFill>
		);
	}
	const len2 = len - 112;
	return (
		<Set3D cam={{x: lerp(t, 0, len2, 60, -60), y: 0, z: lerp(t, 0, len2, 0, 60)}} bg="#9fbad2" far={<Far><Street40 dark={0.3} /></Far>} blur={6} vig={0.7}>
			<Lay z={-420} box={[-300, 500, 1700, 1600]}>
				{[0, 1, 2].map((k) => (
					<Person key={k} kind="son" id={`w1s37y${k}`} {...SOLDIER} colors={{...SOLDIER.colors, hair: ['#5a3a28', '#b4542a', '#2a2220'][k]}} x={lerp(t, 0, len2, 1200, 600, Easing.linear) - k * 330} y={1960 - k * 20} scale={1.1 - k * 0.06} walk={t * 0.3 + k} headTurn={-0.6} face={{eyes: 'open', brows: 'neutral', mouth: k === 1 ? 'tight' : 'flat', blush: true, look: [-0.7, 0]}} backpack />
				))}
			</Lay>
		</Set3D>
	);
};

// 38. 50 %. The quiet jump to 1951 (the counter stops at 9 May 1945).
export const S38: React.FC = () => <Jump len={L(38)} fromYear={1941} toYear={1951} fromPct={60} toPct={50} calm />;

// ===================================================================== 1951 ==
// 39. 1951. The war is behind. Cities are rebuilt anew. (война@61, отстраивают@106)
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(39);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -80, 60, E), y: lerp(f, 0, len, 80, -100, E), z: lerp(f, 0, len, 0, 120, E)}} bg="#a9c3d6" far={<Far><Rebuild f={f} /></Far>} vig={0.56}>
				<Lay z={-400} box={[-300, 800, 1700, 1200]}>
					<CrowdRow era={1951} x0={-60} dx={250} n={5} y={1860} s={0.74} id="w1s39c" seed={1} f={f} face={() => SMILE} />
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1951} sub="СССР" hold={44} color="#ff6a5a" />
		</AbsoluteFill>
	);
};

// 40. The neighbours have a miracle: the first TV. A screen the size of a palm, and a water lens in front of it.
// (телевизор@59, экран@84, ладонь@101, линза@142, больше@197)
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(40);
	const {i, t} = seg(f, [80, 138]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 80, -60, 40), y: 0, z: lerp(t, 0, 80, 0, 110)}} bg="#d8c8a0" far={<Far><TVRoom f={f} lens={0} /></Far>} vig={0.6}>
					<Lay z={-420} box={[-300, 800, 1700, 1200]}>
						<Folk era={1951} n={0} who="m" id="w1s40d" x={120} y={1880} scale={0.82} breathe={t} headTurn={0.5} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false}} armR={{target: [300, -900], bend: -1}} />
						<Folk era={1951} n={1} who="f" id="w1s40m" x={940} y={1880} scale={0.8} breathe={t + 6} headTurn={-0.5} face={{...SMILE, look: [-0.8, 0]}} />
					</Lay>
				</Set3D>
				<Stamp f={t} at={30} x={540} y={420} text="ЧУДО!" color={YEL} rot={-6} />
			</AbsoluteFill>
		);
	}
	const lens = i === 2 ? interpolate(t, [0, 16], [0, 1], clamp) : 0;
	const lenX = i === 1 ? 58 : len - 138;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, lenX, -20, 20), y: 0, z: lerp(t, 0, lenX, 0, 60)}} bg="#d8c8a0" far={<Far z={-1300}><TVRoom f={f} lens={0} /></Far>} blur={9} vig={0.66}>
				<Lay z={-260} box={[-100, 300, 1280, 1500]}>
					<KVN x={540} y={1560} s={2.6} f={f} lens={lens} />
					{i === 1 && (
						<g transform={`translate(${lerp(t, 0, 20, 1200, 860, Easing.out(Easing.cubic))},880)`}>
							<rect x={-60} y={60} width={120} height={500} rx={50} fill={YOU.top} />
							<ellipse cx={0} cy={0} rx={110} ry={150} fill="#e8b48e" />
							{[-70, -25, 20, 64].map((fx, k) => (
								<rect key={k} x={fx - 20} y={-230 + Math.abs(k - 1.5) * 14} width={40} height={140} rx={20} fill="#e8b48e" />
							))}
						</g>
					)}
				</Lay>
			</Set3D>
			{i === 1 && <Tag f={t} at={8} x={540} y={1060} tx={540} ty={460} text="ЭКРАН — С ЛАДОНЬ" />}
			{i === 2 && <Tag f={t} at={6} x={700} y={840} tx={720} ty={440} text="ЛИНЗА С ВОДОЙ" />}
		</AbsoluteFill>
	);
};

// 41. Bread cards were abolished already — back in 1947. (карточки@18, отменили@39, сорок седьмом@71)
export const S41: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(41);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40), y: 0, z: lerp(f, 0, len, 0, 90)}} bg="#e8d6b0" far={<Far><Bakery /></Far>} blur={8} vig={0.64}>
				<Lay z={-260} box={[140, 640, 800, 640]}>
					<g transform="translate(540,960) rotate(-4)">
						<BreadCard />
					</g>
				</Lay>
			</Set3D>
			<Stamp f={f} at={38} x={540} y={980} text="ОТМЕНЕНЫ" sub="ДЕКАБРЬ 1947" rot={-10} size={96} />
		</AbsoluteFill>
	);
};

// 42. The whole stairwell gathers to watch it. (весь подъезд@47)
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(42);
	const rows: {y: number; s: number; n: number; x0: number; dx: number; z: number}[] = [
		{y: 1360, s: 0.52, n: 7, x0: -80, dx: 200, z: -800},
		{y: 1600, s: 0.64, n: 6, x0: -40, dx: 230, z: -600},
		{y: 1900, s: 0.8, n: 5, x0: 20, dx: 260, z: -400},
	];
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40), y: 0, z: lerp(f, 0, len, 0, 100)}} bg="#3a3428" far={<Far><rect x={-600} y={-600} width={2300} height={3200} fill="#4a4030" />{Array.from({length: 24}).map((_, k) => <rect key={k} x={-600 + k * 100} y={-600} width={40} height={2000} fill="#3e3628" />)}<Glow id="w1s42g" x={540} y={1100} r={900} color="#bfe3f2" o={0.35} /></Far>} vig={0.72}>
				{rows.map((r, k) => (
					<Lay key={k} z={r.z} box={[-300, 600, 1700, 1500]}>
						<CrowdRow era={1951} x0={r.x0} dx={r.dx} n={r.n} y={r.y} s={r.s} id={`w1s42r${k}`} seed={k * 3 + 1} f={f} face={(j) => ({eyes: 'wide', pupil: 0.55, brows: 'raised', mouth: j % 2 ? 'o' : 'smile', look: [0, 0.2]})} />
					</Lay>
				))}
			</Set3D>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, rgba(191,227,242,0.18) 0%, transparent 60%)'}} />
		</AbsoluteFill>
	);
};

export const _KEEP2 = {Banner, scr, interpolate};
