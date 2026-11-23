// «Каково это — оказаться погребённым заживо» — shots 30–42: lying still with the phone; today it is almost impossible;
// two hundred years ago (taphophobia, the doctors, Poe, Washington and Andersen, the safety coffin with its bell, the
// German waiting halls); Гога and the legend of Gogol; «Гога, просыпайся» — it was a nightmare.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop} from '../anim';
import {Person} from '../components/Person';
import {arm, BigTitle, Bedroom, Bell, camAt, Chip, COFFIN, Coffin, G, HEAVY, inCoffin, INK, Layer, NightTop, OldCard, Phone, Plaque, RED, Rope, Soil, Stage16, Vig, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;
const ease3 = (t: number) => t * t * (3 - 2 * t);
const CLOSE = {s: 2.25, cx: 950, cy: 905};
const FULL = {s: 0.85, cx: 960, cy: 660};
const SEPIA = '#efe0bf';
const SEPIA_D = '#7a5a32';

// old paper: warm, with a vignette and faint fibres
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: SEPIA}}>
		<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 40}).map((_, i) => (
				<path key={i} d={`M ${(i * 211) % 1920},${(i * 137) % 1080} q 30,6 60,0`} stroke="#d9c49a" strokeWidth={2} fill="none" opacity={0.6} />
			))}
			{children}
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(80,50,10,0) 50%, rgba(80,50,10,0.45) 100%)'}} />
	</AbsoluteFill>
);

// ============================================================ 30. lie still, save strength; the phone: call, write, send the location =====
export const S30: React.FC = () => {
	const f = useCurrentFrame();
	const n = 30;
	const phone = w(n, 'телефон') - 6;
	const icons = [w(n, 'звонить') - 4, w(n, 'писать') - 4, w(n, 'геолокацию') - 8];
	return (
		<AbsoluteFill>
			<Stage16 bg="#060a1e">
				<Layer cam={CLOSE}>
					<Coffin id="z30c" light={0.45}>
						<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
							<You x={0} y={0} s={inCoffin.s} f={f} face={{eyes: 'narrow', brows: 'neutral', mouth: 'tight', look: [0, -0.6]}} armR={f >= phone ? arm([110, -400], [104, -480], {fist: true, item: <Phone glow={1} s={0.6} />, itemAng: 90}) : 'down'} />
						</g>
					</Coffin>
				</Layer>
			</Stage16>
			<Vig k={0.55} />
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				{icons.map((at, k) =>
					f >= at ? (
						<g key={k} transform={`translate(${640 + k * 320},150) scale(${pop(f, at, 10)})`}>
							<circle r={62} fill={['#3aa86a', '#2f86e0', RED][k]} stroke="#fff" strokeWidth={6} />
							{k === 0 && <path d="M -22,-26 C -30,-6 -12,22 20,30 L 30,18 L 16,6 L 6,14 C -4,10 -12,0 -14,-10 L -6,-18 L -14,-30 Z" fill="#fff" />}
							{k === 1 && <path d="M -30,-18 L 30,-18 L 30,18 L -6,18 L -20,32 L -18,18 L -30,18 Z" fill="#fff" />}
							{k === 2 && <path d="M 0,34 C -16,10 -26,-2 -26,-14 C -26,-30 -14,-40 0,-40 C 14,-40 26,-30 26,-14 C 26,-2 16,10 0,34 Z M 0,-24 a 10,10 0 1 0 0.1,0 Z" fill="#fff" fillRule="evenodd" />}
						</g>
					) : null,
				)}
			</svg>
			<Plaque f={f} at={2} x={960} y={190} text="ЛЕЖАТЬ НЕПОДВИЖНО" color="#3aa86a" size={46} to={icons[0] - 4} />
		</AbsoluteFill>
	);
};

// ============================================================ 31. the honest truth; and the good news: a heart monitor =====
export const S31: React.FC = () => {
	const f = useCurrentFrame();
	const n = 31;
	const good = w(n, 'хорошая') - 6;
	const t = interpolate(f, [good, good + 14], [0, 1], {...clamp, easing: ease3});
	const ecg = (x0: number, f0: number) => {
		let d = '';
		for (let x = 0; x <= 600; x += 6) {
			const ph = ((x + f0 * 8) % 200) / 200;
			const y = ph > 0.42 && ph < 0.46 ? -70 : ph > 0.46 && ph < 0.5 ? 40 : ph > 0.5 && ph < 0.53 ? -16 : 0;
			d += `${x === 0 ? 'M' : 'L'} ${x0 + x},${y} `;
		}
		return d;
	};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: 1 - t}}>
				<Stage16 bg="#060a1e">
					<Layer cam={FULL}>
						<NightTop id="z31n" f={f} />
						<Soil />
						<Coffin id="z31c" light={0.15}>
							<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
								<You x={0} y={0} s={inCoffin.s} f={f} face={{eyes: 'closed', brows: 'worried', mouth: 'tight'}} />
							</g>
						</Coffin>
					</Layer>
				</Stage16>
				<Vig k={0.6} />
				<Chip f={f} at={4} x={960} y={140} text="ШАНСОВ МАЛО" color={RED} size={56} to={good - 4} />
			</AbsoluteFill>
			{t > 0 && (
				<AbsoluteFill style={{opacity: t, background: '#eaf3f8'}}>
					<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
						<g transform="translate(960,520)">
							<rect x={-360} y={-230} width={720} height={420} rx={30} fill="#1d2430" stroke="#16161c" strokeWidth={10} />
							<rect x={-330} y={-200} width={660} height={300} rx={14} fill="#0b1a14" />
							<path d={ecg(-300, f)} transform="translate(0,-50)" stroke="#4adf8a" strokeWidth={8} fill="none" strokeLinejoin="round" />
							<text x={-300} y={160} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#4adf8a">
								♥ 72
							</text>
							<rect x={-60} y={190} width={120} height={70} fill="#9aa4b0" />
							<rect x={-200} y={250} width={400} height={30} rx={10} fill="#9aa4b0" />
						</g>
					</svg>
					<Plaque f={f} at={good + 20} x={960} y={175} text="СЕГОДНЯ — ПОЧТИ НЕВОЗМОЖНО" color="#3aa86a" size={54} />
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

// ============================================================ 32. two hundred years ago: taphophobia =====
export const S32: React.FC = () => {
	const f = useCurrentFrame();
	const n = 32;
	const word = w(n, 'тафофобия') - 6;
	return (
		<Paper>
			<text x={960} y={250} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={140} fill={SEPIA_D} opacity={interpolate(f, [2, 14], [0, 1], clamp)}>
				≈ 1820
			</text>
			{f >= word && (
				<g transform={`translate(960,560) scale(${pop(f, word, 12)})`}>
					<text x={0} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill="#3a2a14">
						ТАФОФОБИЯ
					</text>
					<text x={0} y={90} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={SEPIA_D}>
						страх быть похороненным заживо
					</text>
				</g>
			)}
		</Paper>
	);
};

// ============================================================ 33. the doctors could not always tell death from a deep faint =====
export const S33: React.FC = () => {
	const f = useCurrentFrame();
	const n = 33;
	const faint = w(n, 'обморока') - 8;
	const q = w(n, 'показаться') - 8;
	return (
		<AbsoluteFill>
			<Paper>
				{/* a candle-lit room: a bed, a man lying still, the doctor with a little mirror at his nose */}
				<rect x={360} y={600} width={1000} height={80} rx={16} fill="#8a6440" />
				<rect x={340} y={460} width={50} height={300} rx={10} fill="#6a4a2a" />
				<rect x={400} y={560} width={220} height={60} rx={26} fill="#fbf3e0" stroke={SEPIA_D} strokeWidth={4} />
				<path d="M 560,600 C 760,570 1140,580 1340,600 L 1340,660 L 560,660 Z" fill="#c9b28a" stroke={SEPIA_D} strokeWidth={4} />
				<g transform="translate(900,586) rotate(-90)">
					<Person kind="dad" id="z33a" x={0} y={0} scale={0.32} hideLegs colors={{top: '#fbf3e0', topDark: '#e8dcc0', pants: '#c9b28a', shoes: '#7a5a32', hair: '#5a3a22', skin: '#e8d2b0'}} face={{eyes: 'closed', mouth: 'flat', brows: 'neutral', blush: false}} />
				</g>
				<Person kind="dad" id="z33d" x={1500} y={860} scale={0.42} colors={{top: '#3a2a20', topDark: '#2a1e16', pants: '#3a2a20', shoes: '#1d1410', hair: '#6a6a6a', skin: '#e8c8a0'}} hat={{type: 'top', color: '#1d1410'}} beard="#8a8a8a" plain kneePatch={false} face={{eyes: 'narrow', mouth: 'flat', brows: 'worried', blush: false, look: [-0.8, 0.3]}} armL={{target: [-300, -560], bend: 1}} itemL={<g><circle r={26} fill="#dfe8ee" stroke="#7a5a32" strokeWidth={5} /><rect x={-5} y={24} width={10} height={40} fill="#7a5a32" /></g>} />
				<g transform="translate(1660,420)">
					<rect x={-14} y={0} width={28} height={90} rx={6} fill="#fbf3e0" stroke={SEPIA_D} strokeWidth={4} />
					<path d={`M 0,-44 C 14,-20 12,-4 0,0 C -12,-4 -14,-20 0,-44 Z`} fill="#ffb84a" transform={`scale(${1 + Math.sin(f / 3) * 0.06})`} />
				</g>
				{f >= faint && (
					<g transform={`translate(960,300) scale(${pop(f, faint, 11)})`}>
						<text x={-250} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#3a2a14">
							ОБМОРОК
						</text>
						<text x={0} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill={RED}>
							=?
						</text>
						<text x={240} y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#3a2a14">
							СМЕРТЬ
						</text>
					</g>
				)}
				{f >= q && (
					<text x={760} y={470} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={RED} opacity={pop(f, q, 10)}>
						?
					</text>
				)}
			</Paper>
		</AbsoluteFill>
	);
};

// ============================================================ 34. Edgar Poe, «The Premature Burial» =====
export const S34: React.FC = () => {
	const f = useCurrentFrame();
	const n = 34;
	const fashion = w(n, 'модным') - 10;
	return (
		<Paper>
			<g transform={`translate(760,500) rotate(-4) scale(${pop(f, 2, 12) * 0.9})`}>
				<rect x={-260} y={-330} width={520} height={660} rx={18} fill="#5a2a1e" stroke="#2a120c" strokeWidth={10} />
				<rect x={-230} y={-300} width={460} height={600} rx={10} fill="none" stroke="#c9a35a" strokeWidth={5} />
				<text x={0} y={-150} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#e6c88a">
					ПРЕЖДЕВРЕМЕННОЕ
				</text>
				<text x={0} y={-100} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#e6c88a">
					ПОГРЕБЕНИЕ
				</text>
				<path d="M -60,40 C -40,-30 40,-30 60,40 L 60,120 L -60,120 Z" fill="#2a120c" />
				<circle cx={0} cy={30} r={8} fill="#e6c88a" />
				<text x={0} y={220} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#e6c88a">
					ЭДГАР ПО · 1844
				</text>
			</g>
			{f >= fashion && (
				<g transform={`translate(1380,440) scale(${pop(f, fashion, 11)})`}>
					{[0, 1, 2].map((k) => (
						<g key={k} transform={`translate(${(k - 1) * 140},${(k % 2) * 60})`}>
							<rect x={-50} y={-70} width={100} height={140} rx={8} fill="#7a3a2a" stroke="#2a120c" strokeWidth={5} />
							<rect x={-36} y={-50} width={72} height={20} fill="#e6c88a" opacity={0.7} />
						</g>
					))}
					<text x={0} y={180} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#3a2a14">
						МОДНЫЙ СТРАХ
					</text>
				</g>
			)}
		</Paper>
	);
};

// ============================================================ 35. Washington: not before three days; Andersen: «I only seem dead» =====
export const S35: React.FC = () => {
	const f = useCurrentFrame();
	const n = 35;
	const three = w(n, 'через') - 6;
	const andersen = w(n, 'андерсен') - 10;
	const note = w(n, 'записку') - 6;
	return (
		<Paper>
			<g transform={`translate(560,500) rotate(-3) scale(${pop(f, 2, 12)})`}>
				<OldCard id="z35a" caption="ДЖ. ВАШИНГТОН" sub="1799">
					<path d="M -90,170 C -90,90 -50,60 0,60 C 50,60 90,90 90,170 Z" fill="#3a2a20" />
					<ellipse cx={0} cy={-20} rx={58} ry={70} fill="#e8c8a0" />
					<path d="M -60,-30 C -66,-96 66,-96 60,-30 C 64,-6 76,20 70,40 C 60,10 56,-20 50,-40 C 20,-70 -20,-70 -50,-40 C -56,-20 -60,10 -70,40 C -76,20 -64,-6 -60,-30 Z" fill="#f4f4f4" />
				</OldCard>
			</g>
			{f >= three && (
				<g transform={`translate(560,170) scale(${pop(f, three, 11)})`}>
					<rect x={-215} y={-50} width={430} height={100} rx={20} fill={RED} />
					<text x={0} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#fff">
						ЖДАТЬ 3 ДНЯ
					</text>
				</g>
			)}
			{f >= andersen && (
				<g transform={`translate(1360,500) rotate(3) scale(${pop(f, andersen, 12)})`}>
					<OldCard id="z35b" caption="Г. Х. АНДЕРСЕН" sub="1875">
						<path d="M -90,170 C -90,90 -50,60 0,60 C 50,60 90,90 90,170 Z" fill="#2a2a30" />
						<ellipse cx={0} cy={-20} rx={56} ry={74} fill="#e8c8a0" />
						<path d="M -58,-36 C -70,-100 70,-100 58,-36 C 40,-70 -40,-70 -58,-36 Z" fill="#8a6a4a" />
						<path d="M -60,-30 C -80,-20 -78,20 -62,30 M 60,-30 C 80,-20 78,20 62,30" stroke="#8a6a4a" strokeWidth={16} fill="none" strokeLinecap="round" />
					</OldCard>
				</g>
			)}
			{f >= note && (
				<g transform={`translate(1360,180) rotate(-4) scale(${pop(f, note, 11)})`}>
					<rect x={-370} y={-60} width={740} height={120} rx={8} fill="#fffaf0" stroke={SEPIA_D} strokeWidth={5} />
					<text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#3a2a14">
						«Я ТОЛЬКО КАЖУСЬ МЁРТВЫМ»
					</text>
				</g>
			)}
		</Paper>
	);
};

// ============================================================ 36. the safety coffin: a tube, a flag and a bell on top =====
export const S36: React.FC = () => {
	const f = useCurrentFrame();
	const n = 36;
	const tube = w(n, 'трубкой') - 6;
	const flag = w(n, 'флажком') - 6;
	const bell = w(n, 'колокольчиком') - 6;
	const pull = w(n, 'дёрнул') - 4;
	const ring = f >= pull ? Math.sin((f - pull) / 2.2) * 26 * Math.max(0, 1 - (f - pull) / 90) : 0;
	const up = interpolate(f, [pull, pull + 12], [0, 1], clamp);
	const bx = 1260;
	return (
		<AbsoluteFill style={{filter: 'sepia(0.75) saturate(1.2)'}}>
			<Stage16 bg="#060a1e">
				<Layer cam={FULL}>
					<NightTop id="z36n" f={f} />
					<Soil />
					{f >= tube && <rect x={bx - 14} y={G - 80} width={28} height={COFFIN.y - G + 90} fill="#9aa4b0" stroke="#3a3d44" strokeWidth={5} opacity={pop(f, tube, 10)} />}
					{f >= flag && (
						<g transform={`translate(${bx - 120},${G - 30})`}>
							<rect x={-6} y={-200} width={12} height={200} fill="#6a4a2a" />
							<path d={`M 6,${-200 + (1 - up) * 140} l 90,24 l -90,24 Z`} fill={RED} opacity={pop(f, flag, 10)} />
						</g>
					)}
					{f >= bell && (
						<g transform={`translate(${bx + 110},${G - 40})`}>
							<rect x={-60} y={-230} width={120} height={14} fill="#6a4a2a" />
							<rect x={-6} y={-230} width={12} height={230} fill="#6a4a2a" />
							<g transform={`translate(0,-216) scale(${pop(f, bell, 10)})`}>
								<Bell swing={ring} s={0.8} />
							</g>
						</g>
					)}
					{f >= pull && <Rope a={[bx + 110, G - 100]} b={[COFFIN.x + 120, COFFIN.y + 120]} sag={-10} />}
					<Coffin id="z36c" light={0.3}>
						<g transform={`translate(${inCoffin.x},${inCoffin.y}) rotate(-90)`}>
							<You x={0} y={0} s={inCoffin.s} f={f} face={{eyes: f >= pull ? 'wide' : 'closed', brows: 'raised', mouth: f >= pull ? 'open' : 'tight', look: [0, -0.6]}} armR={f >= pull ? arm([150, -400], [230 - Math.abs(Math.sin(f / 4)) * 30, -430], {fist: true}) : 'down'} />
						</g>
					</Coffin>
				</Layer>
			</Stage16>
			<Vig k={0.5} />
			<Plaque f={f} at={2} x={760} y={130} text="«БЕЗОПАСНЫЙ ГРОБ»" color={YEL} size={52} />
			{f >= pull + 8 && <div style={{position: 'absolute', left: 1440, top: 130, transform: `translate(-50%,-50%) scale(${pop(f, pull + 8, 9)})`, fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 0 #000'}}>ДЗЫНЬ!</div>}
		</AbsoluteFill>
	);
};

// ============================================================ 37. the German waiting halls: strings from the fingers to bells, a watchman =====
export const S37: React.FC = () => {
	const f = useCurrentFrame();
	const n = 37;
	const strings = w(n, 'пальцам') - 8;
	const guard = w(n, 'сторож') - 8;
	// the guard walks in from the right with his lamp (six steps, both feet down when he stops)
	const G0 = guard - 36;
	const gx = interpolate(f, [G0, guard + 4], [2120, 1700], {...clamp, easing: (t) => t * (1.4 - 0.4 * t)});
	const gwalk = f >= G0 && f < guard + 4 ? (6 * Math.PI * (f - G0)) / (guard + 4 - G0) : undefined;
	return (
		<AbsoluteFill style={{filter: 'sepia(0.7)'}}>
			<Paper>
				<rect x={0} y={760} width={1920} height={320} fill="#b89a6a" />
				{/* a beam under the ceiling: the bells hang from it */}
				{f >= strings && <rect x={60} y={150} width={1420} height={24} rx={6} fill="#6a4a2a" opacity={pop(f, strings, 10)} />}
				{[0, 1, 2].map((k) => {
					const x = 300 + k * 460;
					return (
						<g key={k}>
							<rect x={x - 180} y={640} width={360} height={60} rx={10} fill="#8a6440" />
							<rect x={x - 190} y={680} width={20} height={110} fill="#6a4a2a" />
							<rect x={x + 170} y={680} width={20} height={110} fill="#6a4a2a" />
							{/* a person lies under the sheet: the body's outline, the head on the pillow */}
							<ellipse cx={x - 152} cy={630} rx={30} ry={14} fill="#fffaf0" stroke={SEPIA_D} strokeWidth={3} />
							<path d={`M ${x - 130},640 C ${x - 120},596 ${x - 40},590 ${x + 10},606 C ${x + 60},620 ${x + 110},598 ${x + 170},612 L ${x + 170},640 Z`} fill="#fbf3e0" stroke={SEPIA_D} strokeWidth={4} />
							<ellipse cx={x - 150} cy={612} rx={30} ry={26} fill="#e8d2b0" stroke={SEPIA_D} strokeWidth={2} />
							<path d={`M ${x - 176},604 C ${x - 172},584 ${x - 128},582 ${x - 124},600 C ${x - 140},594 ${x - 160},594 ${x - 176},604 Z`} fill="#6a4a2a" />
							{f >= strings && <Rope a={[x + 100, 628]} b={[x + 100, 240]} sag={0} />}
							{f >= strings && <line x1={x + 100} y1={174} x2={x + 100} y2={212} stroke="#6a4a2a" strokeWidth={5} />}
							{/* the hand under the sheet with the string tied to a finger */}
							<ellipse cx={x + 100} cy={634} rx={13} ry={9} fill="#e8d2b0" stroke={SEPIA_D} strokeWidth={2} />
							{f >= strings && (
								<g transform={`translate(${x + 100},210) scale(${pop(f, strings + k * 4, 10)})`}>
									<Bell s={0.5} swing={Math.sin(f / 9 + k) * 3} />
								</g>
							)}
						</g>
					);
				})}
				{f >= G0 && (
					<g>
						<Person kind="dad" id="z37g" x={gx} y={900} scale={0.42} walk={gwalk} colors={{top: '#3a4a6a', topDark: '#2a3a5a', pants: '#2a3040', shoes: '#1d1410', hair: '#5a4a3a', skin: '#e8c8a0'}} hat={{type: 'kepi', color: '#2a3a5a'}} moustache="#5a4a3a" plain kneePatch={false} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, look: [-0.6, 0]}} armR={{target: [140, -560], bend: 1}} itemR={<g><rect x={-16} y={-30} width={32} height={46} rx={6} fill="#ffcf6a" stroke="#3a2a14" strokeWidth={4} /><circle cy={-8} r={22} fill="#ffcf6a" opacity={0.4} /></g>} />
					</g>
				)}
			</Paper>
			<Plaque f={f} at={2} x={960} y={110} text="«ДОМА ОЖИДАНИЯ» · ГЕРМАНИЯ" color={YEL} size={48} />
			<Chip f={f} at={guard + 4} x={1560} y={360} text="СТОРОЖ ДЕНЬ И НОЧЬ" color="#3a4a6a" size={38} />
		</AbsoluteFill>
	);
};

// Gogol in a little old card: a bob of dark hair, a long nose, a moustache
const Gogol: React.FC = () => (
	<g>
		<path d="M -100,170 C -100,90 -54,58 0,58 C 54,58 100,90 100,170 Z" fill="#2a2a30" />
		<rect x={-24} y={30} width={48} height={40} fill="#e8c8a0" />
		<ellipse cx={0} cy={-20} rx={54} ry={68} fill="#e8c8a0" />
		<path d="M -62,40 C -84,-30 -60,-100 0,-100 C 60,-100 84,-30 62,40 C 60,0 56,-40 40,-60 C 10,-76 -10,-76 -40,-60 C -56,-40 -60,0 -62,40 Z" fill="#3a2a1e" />
		<path d="M 0,-30 L 10,10 L -2,14" stroke="#b88a60" strokeWidth={5} fill="none" strokeLinecap="round" />
		<path d="M -26,26 C -10,16 10,16 26,26" stroke="#3a2a1e" strokeWidth={9} fill="none" strokeLinecap="round" />
		{[-1, 1].map((sd) => (
			<ellipse key={sd} cx={sd * 20} cy={-22} rx={6} ry={4} fill="#2a1e14" />
		))}
	</g>
);
// a thought bubble over Гога's head (world coords)
const Thought: React.FC<{x: number; y: number; p: number; children: React.ReactNode}> = ({x, y, p, children}) => (
	<g transform={`translate(${x},${y}) scale(${p})`}>
		<circle cx={-250} cy={250} r={18} fill="#fff" />
		<circle cx={-200} cy={200} r={28} fill="#fff" />
		<ellipse cx={0} cy={0} rx={330} ry={230} fill="#fff" stroke="#16161c" strokeWidth={6} />
		{children}
	</g>
);

// ============================================================ 38. Гога is sure Gogol was buried like that: the skull turned =====
export const S38: React.FC = () => {
	const f = useCurrentFrame();
	const n = 38;
	const gogol = w(n, 'гоголя') - 6;
	const grave = w(n, 'вскрыли') - 6;
	const turned = w(n, 'повёрнут') - 6;
	const rot = interpolate(f, [turned, turned + 14], [0, 70], {...clamp, easing: ease3});
	return (
		<AbsoluteFill style={{background: '#f4f1ea'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={860} width={1920} height={220} fill="#e6dfd0" />
				<You x={420} y={1000} s={0.9} f={f} brows={1} face={{eyes: 'open', mouth: 'smile', look: [0.6, -0.4]}} armR={arm([120, -350], [180, -430], {})} />
				{f >= gogol && (
					<Thought x={1180} y={420} p={pop(f, gogol, 12)}>
						<g transform={`translate(${f >= grave ? -170 : 0},0) scale(0.62)`}>
							<OldCard id="z38g" caption="Н. В. ГОГОЛЬ" sub="1852">
								<Gogol />
							</OldCard>
						</g>
						{f >= grave && (
							<g transform={`translate(150,10) scale(${pop(f, grave, 10)})`}>
								<text x={0} y={-120} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#3a2a14">
									1931
								</text>
								<rect x={-110} y={-90} width={220} height={150} rx={10} fill="#6e4224" stroke="#2a180a" strokeWidth={6} />
								<g transform={`translate(0,-10) rotate(${rot})`}>
									<circle r={46} fill="#f3eee2" stroke="#bdb29c" strokeWidth={5} />
									{[-1, 1].map((sd) => (
										<ellipse key={sd} cx={sd * 17} cy={-6} rx={11} ry={13} fill="#16161c" />
									))}
									<rect x={-16} y={22} width={32} height={10} rx={3} fill="#16161c" />
								</g>
							</g>
						)}
					</Thought>
				)}
			</svg>
			<Chip f={f} at={turned + 8} x={1330} y={760} text="ЧЕРЕП ПОВЁРНУТ?!" color={RED} size={44} />
		</AbsoluteFill>
	);
};

// ============================================================ 39. «Гога, это легенда. И нет, вы с Гоголем не родственники.» =====
export const S39: React.FC = () => {
	const f = useCurrentFrame();
	const n = 39;
	const legend = w(n, 'легенда') - 4;
	const rel = w(n, 'родственники') - 10;
	return (
		<AbsoluteFill style={{background: '#f4f1ea'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<rect x={0} y={860} width={1920} height={220} fill="#e6dfd0" />
				<You x={560} y={1000} s={0.9} f={f} brows={f >= rel ? -1 : 0} face={{eyes: 'open', mouth: f >= rel ? 'o' : 'flat', look: [0.6, -0.2]}} />
				<g transform="translate(1260,520) scale(0.8)">
					<OldCard id="z39g" caption="Н. В. ГОГОЛЬ" sub="1809–1852">
						<Gogol />
					</OldCard>
				</g>
				{f >= rel && (
					<g transform={`translate(910,520) scale(${pop(f, rel, 10)})`}>
						<circle r={70} fill={RED} stroke="#fff" strokeWidth={6} />
						<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={90} fill="#fff">
							≠
						</text>
					</g>
				)}
			</svg>
			{f >= legend && (
				<div style={{position: 'absolute', left: 1260, top: 250, transform: `translate(-50%,-50%) rotate(-10deg) scale(${pop(f, legend, 9)})`, border: '12px solid #fff', background: RED, color: '#fff', borderRadius: 20, padding: '6px 34px 12px', fontFamily: HEAVY, fontWeight: 900, fontSize: 90, boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>ЛЕГЕНДА</div>
			)}
			<Chip f={f} at={rel + 4} x={875} y={700} text="НЕ РОДСТВЕННИКИ" color="#16161c" size={34} />
		</AbsoluteFill>
	);
};

// ============================================================ 40. Gogol's will: not to be buried until … =====
export const S40: React.FC = () => {
	const f = useCurrentFrame();
	const n = 40;
	const will = w(n, 'завещании') - 6;
	const quote = w(n, 'не') + 10;
	const unroll = interpolate(f, [will, will + 18], [0, 1], {...clamp, easing: ease3});
	return (
		<Paper>
			<g transform="translate(470,540) scale(0.85)">
				<OldCard id="z40g" caption="Н. В. ГОГОЛЬ" sub="боялся этого всю жизнь">
					<Gogol />
				</OldCard>
			</g>
			{f >= will && (
				<g transform="translate(1260,540)">
					<rect x={-380} y={-300 * unroll} width={760} height={600 * unroll} fill="#fffaf0" stroke={SEPIA_D} strokeWidth={6} />
					<rect x={-400} y={-300 * unroll - 30} width={800} height={40} rx={20} fill="#d9c49a" stroke={SEPIA_D} strokeWidth={5} />
					<rect x={-400} y={300 * unroll - 10} width={800} height={40} rx={20} fill="#d9c49a" stroke={SEPIA_D} strokeWidth={5} />
					{unroll > 0.8 && (
						<g opacity={(unroll - 0.8) * 5}>
							<text x={0} y={-180} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#3a2a14">
								ЗАВЕЩАНИЕ
							</text>
							{[0, 1, 2].map((k) => (
								<line key={k} x1={-300} y1={-100 + k * 50} x2={300 - k * 60} y2={-100 + k * 50} stroke="#c9b28a" strokeWidth={6} />
							))}
						</g>
					)}
					{f >= quote && (
						<g transform={`translate(0,140) scale(${pop(f, quote, 10)})`}>
							<text x={0} y={-20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill={RED}>
								«не хоронить, пока не появятся
							</text>
							<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill={RED}>
								явные признаки разложения»
							</text>
						</g>
					)}
				</g>
			)}
		</Paper>
	);
};

// ============================================================ 41. the witnesses said different things; historians: a myth =====
export const S41: React.FC = () => {
	const f = useCurrentFrame();
	const n = 41;
	const wit = w(n, 'свидетели') - 4;
	const myth = w(n, 'мифом') - 6;
	const said = ['«Череп повёрнут!»', '«Всё было на месте»', '«Черепа не было!»'];
	return (
		<Paper>
			{/* the three witnesses stand there from the start; what each of them said pops up in turn */}
			{said.map((t, k) => (
				<g key={k} transform={`translate(${400 + k * 560},${300 + (k % 2) * 90})`}>
						<Person kind="dad" id={`z41w${k}`} x={0} y={420} scale={0.34} colors={{top: ['#3a2a20', '#2a3a4a', '#4a3a2a'][k], topDark: '#1d1410', pants: '#2a2a30', shoes: '#1d1410', hair: '#5a4a3a', skin: '#e8c8a0'}} plain kneePatch={false} hat={k === 1 ? {type: 'peak', color: '#2a3a4a'} : undefined} face={{eyes: 'open', mouth: 'open', brows: k === 2 ? 'raised' : 'neutral', blush: false}} />
					{f >= wit + k * 12 && (
						<g transform={`scale(${pop(f, wit + k * 12, 10)})`}>
							<rect x={-200} y={-120} width={400} height={90} rx={20} fill="#fffaf0" stroke={SEPIA_D} strokeWidth={5} />
							<path d="M -20,-30 L 0,0 L 20,-30 Z" fill="#fffaf0" stroke={SEPIA_D} strokeWidth={5} />
							<text x={0} y={-62} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#3a2a14">
								{t}
							</text>
						</g>
					)}
				</g>
			))}
			{f >= myth && (
				<g transform={`translate(960,190) rotate(-6) scale(${pop(f, myth, 9)})`}>
					<rect x={-180} y={-70} width={360} height={140} rx={22} fill={RED} stroke="#fff" strokeWidth={12} />
					<text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill="#fff">
						МИФ
					</text>
				</g>
			)}
		</Paper>
	);
};

// ============================================================ 42. «Гога, просыпайся. Это был просто кошмар.» =====
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const n = 42;
	const wake = w(n, 'просыпайся') - 4;
	const up = interpolate(f, [wake, wake + 10], [0, 1], {...clamp, easing: ease3});
	const light = interpolate(f, [wake, wake + 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#1e2440">
				<Bedroom f={f} light={light} />
				<g transform={`translate(560,${820 - up * 40})`}>
					<You x={0} y={0} s={0.66} f={f} bust face={{eyes: up > 0.5 ? 'wide' : 'closed', brows: up > 0.5 ? 'raised' : 'worried', mouth: up > 0.5 ? 'o' : 'tight', look: [0.4, 0], sweat: up > 0.5 ? 1 : 0}} />
				</g>
				<path d={`M 520,${640 - up * 10} C 700,${600 - up * 20} 1100,600 1300,640 L 1300,720 L 520,720 Z`} fill="#4f7fd8" />
			</Stage16>
			<Plaque f={f} at={w(n, 'кошмар') - 6} x={990} y={300} text="ПРОСТО КОШМАР" color={YEL} size={50} />
		</AbsoluteFill>
	);
};

export const BigT = BigTitle;
