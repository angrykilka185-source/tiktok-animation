// «Что будет, если ты попадёшь в СССР» — shots 41…78: the queue, bottles, jeans, the bus, the payphone, the
// switchboard, the yard in the evening, the TV, the cinema, the cassette, prices, flats, the pioneer camp, the night,
// 1 %, home — two kopecks and a pioneer badge in your pocket — and the end card.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Lay, Set3D} from '../components/Layers3D';
import {Fact, HandPhone, Phone, Stamp, Tag, YOU} from '../w1/kit';
import {Battery} from '../w1/hud';
import {Bedside, Cassette, CoinSlot, Duvet, Gastronom, Insert, Jeans, ModernPillow} from '../w1/late';
import {FarW, GREEN, H, HEAVY, mv, P81, pBox, Price, RED, SANS, W, YEL, You} from './kit';
import {FLOOR, Living81, Room81, TubeTV} from './home';
import {Booth, BusInside, BusStop, Camp, Car81, Cinema81, Compostor, Fire, Bugle, Kopeck2, PioneerBadge, Street81, Switchboard, Ticket, Yard81} from './town';
import {FlatQueue, SalaryEnvelope} from './school';
import {SHOTS} from './timeline';
import {w} from './voice';

const L = (n: number) => SHOTS[n - 1].duration;
const CALM: Face = {eyes: 'open', brows: 'neutral', mouth: 'flat', blush: false};
const SMILE: Face = {eyes: 'open', brows: 'neutral', mouth: 'smile', blush: false};
const WIDE: Face = {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false};
const LAUGH: Face = {eyes: 'happy', brows: 'raised', mouth: 'grin', blush: false};

const Shot: React.FC<{f: number; len: number; far: React.ReactNode; bg: string; m: {x?: [number, number]; y?: [number, number]; z?: [number, number]}; blur?: number; vig?: number; children?: React.ReactNode}> = ({f, len, far, bg, m, blur = 3, vig = 0.5, children}) => (
	<Set3D cam={mv(f, len, m)} bg={bg} far={<FarW>{far}</FarW>} blur={blur} vig={vig}>
		{children}
	</Set3D>
);
const At: React.FC<{z: number; x: number; y: number; s: number; wide?: number; children: React.ReactNode}> = ({z, x, y, s, wide, children}) => (
	<Lay z={z} box={pBox(x, y, s, wide)}>
		{children}
	</Lay>
);
// the vertical «ГАСТРОНОМ» of «XX век» fitted into the wide frame
const GastronomW: React.FC<{dusk?: number}> = ({dusk = 0}) => (
	<g transform="translate(240,-180) scale(0.78)">
		<Gastronom dusk={dusk} />
	</g>
);
const kids = (k: number) => (['k', 'k', 'f', 'k', 'm'] as const)[k % 5];
// kids' hair (varied: dark, brown, fair)
const KH = ['#5a3a28', '#2a2220', '#7a4a2c', '#d6a24a', '#3a2a20', '#8a5a32'];

// ===================================================== the queue ===========
// 41. A queue outside the «Гастроном». «What are they giving?» — «They've thrown out sausage!» (очередь, выбросили)
export const S41: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(41);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<GastronomW />} bg="#9fbad2" m={{x: [-220, 160], z: [0, 90]}}>
				<Lay z={-420} box={[-500, 300, 2900, 900]}>
					{Array.from({length: 13}).map((_, k) => (
						<P81 key={k} n={k} who={(['m', 'f', 'f', 'm', 'k'] as const)[k % 5]} id={`u1q41${k}`} x={-300 + k * 190} y={1060 + (k % 2) * 14} scale={0.7} breathe={f + k * 7} headTurn={-0.4} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.6, 0], blush: false}} />
					))}
				</Lay>
			</Shot>
			<Bubble x={760} y={330} text="Что дают?" from={w(41, 'что', -2)} to={len} />
			<Bubble x={1300} y={500} text="Колбасу выбросили!" from={w(41, 'колбасу', -2)} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 42. «Выбросили» — the goods suddenly appear on sale. In an hour they're gone. (появился, через час)
export const S42: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(42);
	const gone = f >= w(42, 'через', -2);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<GastronomW />} bg="#9fbad2" m={{x: [0, 0], y: [80, 60], z: [300, 360]}} blur={9}>
				<Lay z={-240} box={[460, 160, 1000, 760]}>
					<rect x={560} y={220} width={800} height={560} fill="#f4f0e8" stroke="#8a6a44" strokeWidth={14} />
					<text x={960} y={420} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={100} fill={gone ? '#8a8f96' : '#c8282a'}>
						КОЛБАСА
					</text>
					{gone && <line x1={600} y1={390} x2={1320} y2={390} stroke="#c8282a" strokeWidth={16} />}
					<text x={960} y={620} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={70} fill="#2a2c30">
						{gone ? 'ЗАКОНЧИЛАСЬ' : 'ЕСТЬ!'}
					</text>
				</Lay>
			</Shot>
			{gone && <Stamp f={f} at={w(42, 'через', -2)} x={1500} y={260} text="+1 ЧАС" rot={8} color={RED} size={80} />}
		</AbsoluteFill>
	);
};

// 43. Everyone holds a net bag («авоська»). Plastic bags are washed and dried. (авоськами, моют, сушат)
const Avoska: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M -60,-260 Q 0,-330 60,-260" stroke="#3a3a3a" strokeWidth={8} fill="none" />
		<path d="M -120,-240 L 120,-240 L 150,40 Q 0,110 -150,40 Z" fill="none" stroke="#5a8a3a" strokeWidth={6} />
		{Array.from({length: 7}).map((_, k) => (
			<path key={k} d={`M ${-130 + k * 40},-240 L ${-150 + k * 50},60`} stroke="#5a8a3a" strokeWidth={4} />
		))}
		{Array.from({length: 6}).map((_, k) => (
			<path key={`h${k}`} d={`M ${-125 - k * 4},${-200 + k * 46} L ${125 + k * 4},${-200 + k * 46}`} stroke="#5a8a3a" strokeWidth={4} />
		))}
		<rect x={-100} y={-180} width={90} height={60} rx={20} fill="#c8843a" />
		<rect x={10} y={-200} width={50} height={140} rx={10} fill="#f4f4f0" />
		<rect x={10} y={-200} width={50} height={20} fill="#c8c4b8" />
		<rect x={-60} y={-90} width={140} height={90} rx={8} fill="#c9a54a" />
	</g>
);
export const S43: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(43);
	const {i, t} = seg(f, [w(43, 'пакеты', -6)]);
	if (i === 0) {
		return (
			<Shot f={f} len={len} far={<GastronomW />} bg="#9fbad2" m={{x: [-30, 30], z: [200, 260]}} blur={10}>
				<Lay z={-220} box={[500, 140, 920, 900]}>
					<g transform={`translate(960,${780 + Math.sin(f / 9) * 10}) rotate(${Math.sin(f / 12) * 4})`}>
						<Avoska s={2.0} />
					</g>
				</Lay>
			</Shot>
		);
	}
	return (
		<AbsoluteFill>
			<Shot f={t} len={len - w(43, 'пакеты', -6)} far={<Yard81 f={f} />} bg="#8fb4d8" m={{x: [-40, 40], z: [160, 220]}} blur={8}>
				<Lay z={-260} box={[200, 120, 1500, 800]}>
					<path d="M 260,300 L 1660,300" stroke="#e8e4d8" strokeWidth={6} />
					{Array.from({length: 6}).map((_, k) => (
						<g key={k} transform={`translate(${380 + k * 230},300) rotate(${Math.sin(f / 10 + k) * 4})`}>
							<path d="M -70,0 L 70,0 L 80,260 L -80,260 Z" fill={['#e8f0f8', '#f4e8d8', '#e8f4e8'][k % 3]} opacity={0.75} />
							<rect x={-30} y={-14} width={12} height={28} fill="#d8b040" />
						</g>
					))}
				</Lay>
			</Shot>
			<Fact x={960} f={f} at={w(43, 'моют', -2)} text="ПАКЕТ — ВЕЩЬ МНОГОРАЗОВАЯ" y={170} />
		</AbsoluteFill>
	);
};

// 44. Empty bottles are returned: 15 kopecks for a milk bottle; that's how kids save for ice cream. (бутылки, пятнадцать)
export const S44: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(44);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [60, -60], z: [60, 140]}}>
				<Lay z={-420} box={[300, 200, 1400, 900]}>
					<rect x={560} y={420} width={800} height={600} fill="#9a8e7a" />
					<rect x={600} y={460} width={720} height={80} fill="#2a5a8a" />
					<text x={960} y={514} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={44} fill="#fff">
						ПРИЁМ СТЕКЛОТАРЫ
					</text>
					<rect x={760} y={640} width={400} height={200} fill="#3a4a58" />
					{Array.from({length: 8}).map((_, k) => (
						<g key={k} transform={`translate(${790 + k * 46},840)`}>
							<rect x={-14} y={-130} width={28} height={130} rx={8} fill="#e8f0f4" opacity={0.85} />
							<rect x={-8} y={-160} width={16} height={34} fill="#e8f0f4" opacity={0.85} />
							<rect x={-10} y={-164} width={20} height={8} fill={k % 2 ? '#c8c4b8' : '#4a8ac8'} />
						</g>
					))}
				</Lay>
				<At z={-280} x={520} y={1160} s={0.86}>
					<Person kind="boy" id="u1bottles" colors={{top: '#c8402a', topDark: '#a83a2a', pants: '#2c3a66', hair: '#d6a24a'}} x={520} y={1160} scale={0.86} breathe={f} headTurn={0.4} face={LAUGH} armR={{target: [220, -560], bend: -1}} itemR={<g><rect x={-14} y={-130} width={28} height={130} rx={8} fill="#e8f0f4" /><rect x={-10} y={-166} width={20} height={36} fill="#e8f0f4" /></g>} />
				</At>
			</Shot>
			<Price f={f} at={w(44, 'пятнадцать', -2)} x={1460} y={260} what="БУТЫЛКА" price="15 коп." />
		</AbsoluteFill>
	);
};

// 45. You film the queue. A woman in a headscarf asks sternly: «Which newspaper are you from?» (снимаешь, газеты)
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(45);
	const turn = interpolate(f, [w(45, 'женщина', -4), w(45, 'женщина', 6)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<GastronomW />} bg="#9fbad2" m={{x: [40, -40], z: [60, 150]}}>
				<At z={-380} x={1320} y={1100} s={0.9}>
					<Person kind="mom" id="u1aunt" plain hem={0.6} colors={{top: '#5a4a6a', topDark: '#5a4a6a', hair: '#7a6a5a'}} hat={{type: 'scarf', color: '#b8402e'}} x={1320} y={1100} scale={0.9} breathe={f} headTurn={-0.6 * turn} face={{eyes: 'narrow', brows: 'angry', mouth: turn > 0.5 ? 'tight' : 'flat', blush: false, look: [-0.9 * turn, 0]}} armL={turn > 0.5 ? {target: [-300, -700], bend: 1} : undefined} />
				</At>
				<At z={-260} x={520} y={1200} s={1.0}>
					<You id="u1s45" x={520} y={1200} scale={1.0} breathe={f} headTurn={0.4} face={{...(turn > 0.5 ? {eyes: 'wide', brows: 'worried', mouth: 'o'} : SMILE), look: [0.7, -0.1], blush: false} as Face} armR={{target: [280, -760], bend: -1}} itemR={<HandPhone s={1.2} />} />
				</At>
			</Shot>
			<Bubble x={1240} y={300} text="Ты из какой газеты?" from={w(45, 'спрашивает', 12)} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 46. Real jeans — only from black marketeers, and they cost a month's salary. (фарцовщиков, зарплата)
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(46);
	const open = interpolate(f, [w(46, 'джинсы', -4), w(46, 'джинсы', 12)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-40, 40], z: [120, 200]}} blur={7}>
				<At z={-300} x={1100} y={1100} s={0.86}>
					<P81 n={3} who="m" id="u1farc" x={1100} y={1100} scale={0.86} breathe={f} headTurn={-0.5} face={{eyes: Math.floor(f / 20) % 3 === 2 ? 'closed' : 'narrow', brows: 'raised', mouth: 'smile', blush: false, look: [-0.8, 0]}} armL={{target: [-330 - 120 * open, -880], bend: 1}} />
					{open > 0 && (
						<g opacity={open} transform="translate(1100,1100) scale(0.86)">
							<path d={`M -150,-1210 L ${-150 - 220 * open},-1130 L ${-150 - 240 * open},-560 L -130,-600 Z`} fill="#5a3a2a" />
							<Jeans x={-150 - 130 * open} y={-1060} s={1.15} />
						</g>
					)}
				</At>
			</Shot>
			<Price f={f} at={w(46, 'зарплата', -6)} x={500} y={300} what="ДЖИНСЫ" price="≈ 1 ЗАРПЛАТА" color={RED} />
		</AbsoluteFill>
	);
};

// ======================================================= the bus ===========
// 47. Home by bus. Coins are passed through the whole bus: «Pass it on for a ticket!» (автобусе, передайте)
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(47);
	const coin = lerp(f, w(47, 'монетки', -4), len, 260, 1700);
	const hands = [400, 760, 1120, 1480];
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<BusInside f={f} />} bg="#e8d8a8" m={{x: [-40, 40], z: [40, 120]}} blur={2}>
				<Lay z={-360} box={[-200, 300, 2300, 900]}>
					{hands.map((hx, k) => (
						<P81 key={k} n={k + 4} who={(['m', 'f', 'm', 'f'] as const)[k]} id={`u1bus${k}`} x={hx} y={1180} scale={0.86} breathe={f + k * 5} headTurn={0.3} face={{...(Math.abs(coin - hx) < 160 ? SMILE : CALM), look: [0.5, 0]}} armR={Math.abs(coin - hx) < 200 ? {target: [200, -900], bend: -1} : undefined} />
					))}
					<circle cx={coin} cy={1180 - 900 * 0.86 - 10} r={16} fill="#c9a26a" stroke="#8a6a3a" strokeWidth={4} />
				</Lay>
			</Shot>
			<Bubble x={960} y={260} text="Передайте на билетик!" from={w(47, 'передайте', -2)} to={len} />
		</AbsoluteFill>
	);
};

// 48. A ticket — 5 kopecks; you punch it yourself: an inspector may come in at any moment. (пять копеек, компостером, контролёр)
export const S48: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(48);
	const press = interpolate(f, [w(48, 'компостером', -8), w(48, 'компостером', -2), w(48, 'компостером', 6)], [0, 1, 0], clamp);
	const holes = f >= w(48, 'компостером', -2) ? 1 : 0;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<BusInside f={f} />} bg="#e8d8a8" m={{x: [-20, 20], z: [160, 220]}} blur={10}>
				<Lay z={-220} box={[400, 0, 1120, 1080]}>
					<g transform="translate(720,560) scale(1.15)">
						<Compostor press={press} />
					</g>
					<g transform={`translate(1260,${620 - press * 30}) rotate(-8) scale(1.3)`}>
						<Ticket holes={holes} />
					</g>
				</Lay>
			</Shot>
			<Price f={f} at={w(48, 'пять', -2)} x={1500} y={230} what="БИЛЕТ" price="5 коп." />
			<Fact x={960} f={f} at={w(48, 'контролёр', -2)} text="КОНТРОЛЁР — В ЛЮБОЙ МОМЕНТ" y={170} color={RED} />
		</AbsoluteFill>
	);
};

// 49. Battery 50 %. You need to call mum. Not everyone has a home phone — the waiting list takes years. (пятьдесят, телефон, годы)
const DialPhone: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M -170,0 L -130,-170 L 130,-170 L 170,0 Z" fill="#c8282a" />
		<circle cx={0} cy={-100} r={70} fill="#f4f0e8" />
		{Array.from({length: 10}).map((_, k) => {
			const a = (k / 10) * Math.PI * 1.6 - Math.PI * 1.3;
			return <circle key={k} cx={Math.cos(a) * 48} cy={-100 + Math.sin(a) * 48} r={12} fill="#2a2c30" />;
		})}
		<path d="M -190,-190 Q 0,-260 190,-190 L 170,-150 Q 0,-200 -170,-150 Z" fill="#a81e1e" />
	</g>
);
export const S49: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(49);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Living81 night={0} />} bg="#c9b890" m={{x: [-30, 30], z: [180, 240]}} blur={10}>
				<Lay z={-220} box={[500, 300, 920, 700]}>
					<ellipse cx={960} cy={900} rx={320} ry={50} fill="#f4f0e8" />
					<g transform="translate(960,880) scale(1.6)">
						<DialPhone />
					</g>
				</Lay>
			</Shot>
			<Fact x={960} f={f} at={w(49, 'домашний', -2)} text="ТЕЛЕФОН ДОМА — НЕ У ВСЕХ" y={170} />
			<Stamp f={f} at={w(49, 'годы', -4)} x={1520} y={560} text="ОЧЕРЕДЬ" sub="НА ГОДЫ" rot={-8} size={84} />
		</AbsoluteFill>
	);
};

// 50. The payphone at the corner: two kopecks and a dial you turn one digit at a time. (две копейки, диск)
export const S50: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(50);
	const {i, t} = seg(f, [w(50, 'две', -4)]);
	if (i === 0) {
		return (
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [100, 0], z: [40, 140]}}>
				<Lay z={-380} box={[800, 100, 800, 1000]}>
					<Booth x={1200} y={1020} s={1.1} />
				</Lay>
				<At z={-260} x={lerp(f, 0, w(50, 'две', -4), 400, 760)} y={1200} s={1.0}>
					<You id="u1s50" x={lerp(f, 0, w(50, 'две', -4), 400, 760)} y={1200} scale={1.0} walk={f * 0.28} headTurn={0.5} face={{...SMILE, look: [0.8, 0]}} />
				</At>
			</Shot>
		);
	}
	return (
		<Set3D cam={mv(t, len - w(50, 'две', -4), {y: [-30, 30], z: [0, 80]})} bg="#6a6f76" far={<FarW><g transform="translate(420,-470) scale(1.0)"><CoinSlot coin={interpolate(t, [4, 20], [0, 1], clamp)} /></g></FarW>} blur={0.2} vig={0.62} />
	);
};

// 51. The first payphone doesn't work. The second swallows the coin. The third — a dial tone! (первый, второй, гудки)
export const S51: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(51);
	const which = f < w(51, 'второй', -4) ? 0 : f < w(51, 'третий', -4) ? 1 : 2;
	const x = [420, 960, 1500][which];
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-200, 200], z: [40, 100]}}>
				<Lay z={-380} box={[0, 100, 1920, 1000]}>
					{[420, 960, 1500].map((bx) => (
						<Booth key={bx} x={bx} y={1000} s={0.9} />
					))}
					<rect x={300} y={480} width={240} height={70} fill="#f4f0e8" stroke="#c8282a" strokeWidth={6} transform="rotate(-6 420 515)" />
					<text x={420} y={528} textAnchor="middle" fontFamily="'DejaVu Sans', sans-serif" fontWeight={900} fontSize={30} fill="#c8282a" transform="rotate(-6 420 515)">
						НЕ РАБОТАЕТ
					</text>
				</Lay>
				<At z={-260} x={x + 200} y={1200} s={0.96}>
					<You id="u1s51" x={x + 200} y={1200} scale={0.96} breathe={f} headTurn={-0.4} face={which === 2 ? {...LAUGH} : which === 1 ? {eyes: 'narrow', brows: 'angry', mouth: 'tight', blush: false} : {eyes: 'open', brows: 'worried', mouth: 'frown', blush: false}} />
				</At>
			</Shot>
			{which === 2 &&
				[0, 1, 2].map((k) => {
					const t = (((f - w(51, 'третий', -4)) / 12 + k / 3) % 1);
					return <div key={k} style={{position: 'absolute', left: 1500 - 80 - t * 160, top: 480 - 80 - t * 160, width: 160 + t * 320, height: 160 + t * 320, border: `8px solid ${GREEN}`, borderRadius: '50%', opacity: (1 - t) * 0.7}} />;
				})}
			{which === 1 && <Stamp f={f} at={w(51, 'второй', -2)} x={960} y={260} text="−2 коп." rot={-6} size={70} />}
		</AbsoluteFill>
	);
};

// 52. Long-distance calls often go through the operator — the call is booked in advance. (телефонистку, заказывают)
export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(52);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Switchboard f={f} />} bg="#c8c4b0" m={{x: [-80, 80], z: [40, 120]}}>
				<At z={-300} x={960} y={1260} s={1.1}>
					<Person kind="mom" id="u1oper" plain hem={0.6} hideLegs colors={{top: '#3a5a8a', topDark: '#3a5a8a', hair: '#3a2a20'}} back x={960} y={1260} scale={1.1} armL={{target: [-160, -900 + Math.sin(f / 6) * 40], bend: 1}} armR={{target: [200, -800], bend: -1}} />
					<path d={`M ${960 - 96},${1260 - 1150} Q 960,${1260 - 1260} ${960 + 96},${1260 - 1150}`} stroke="#2a2c30" strokeWidth={14} fill="none" />
				</At>
			</Shot>
			<Bubble x={960} y={280} text="Междугородний? Ждите вызова!" from={w(52, 'через', -2)} to={len} />
		</AbsoluteFill>
	);
};

// ====================================================== the evening yard =====
// 53. Evening: everyone's in the yard. The boys kick a ball, the girls jump the rubber band. (мяч, резинку)
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(53);
	const ball = {x: 700 + Math.sin(f / 10) * 380, y: 1010 - Math.abs(Math.sin(f / 6)) * 120};
	const jump = Math.abs(Math.sin(f / 5)) * 80;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.3} />} bg="#8fb4d8" m={{x: [-120, 120], z: [0, 90]}}>
				<Lay z={-420} box={[-200, 300, 1300, 800]}>
					{[0, 1, 2].map((k) => (
						<Person key={k} kind="boy" id={`u1fb${k}`} colors={{top: ['#c8402a', '#2a6aa8', '#e8e4d8'][k], topDark: ['#a8362a', '#2a5a98', '#c8c4b8'][k], pants: '#2c3a66', hair: KH[k]}} x={360 + k * 320 + Math.sin(f / 9 + k) * 60} y={1040} scale={0.68} walk={f * 0.4 + k} face={LAUGH} />
					))}
					<circle cx={ball.x} cy={ball.y} r={26} fill="#f4f4f0" stroke="#2a2c30" strokeWidth={4} />
				</Lay>
				<Lay z={-420} box={[1100, 300, 1100, 800]}>
					<Person kind="girl" id="u1rb1" plain colors={{top: '#e07a3a', topDark: '#c86a2a', pants: '#2a2226', hair: KH[4]}} x={1300} y={1040} scale={0.66} breathe={f} headTurn={0.4} face={SMILE} />
					<Person kind="girl" id="u1rb2" plain colors={{top: '#5aa08a', topDark: '#4a907a', pants: '#2a2226', hair: '#7a4a2c'}} x={1820} y={1040} scale={0.66} breathe={f + 5} headTurn={-0.4} face={SMILE} />
					<path d="M 1320,1000 L 1800,1000 M 1320,1020 L 1800,1020" stroke="#f4f0e8" strokeWidth={5} />
					<g transform={`translate(0,${-jump})`}>
						<Person kind="girl" id="u1rb3" plain colors={{top: '#a83a5a', topDark: '#983050', pants: '#2a2226', hair: '#5a3a28'}} x={1560} y={1040} scale={0.64} face={LAUGH} />
					</g>
				</Lay>
			</Shot>
			<Tag f={f} at={w(53, 'резинку', -2)} x={1560} y={1000} tx={1560} ty={300} text="РЕЗИНКА" />
		</AbsoluteFill>
	);
};

// 54. Dodgeball, cossacks and robbers, «the sea is rough». No computers — and nobody is bored. («море волнуется раз»)
export const S54: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(54);
	const freeze = f >= w(54, 'море', -2);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.4} />} bg="#8fb4d8" m={{x: [100, -100], z: [40, 120]}}>
				<Lay z={-400} box={[-200, 300, 2300, 800]}>
					{Array.from({length: 6}).map((_, k) => {
						const who = kids(k);
						const pose = freeze ? {armL: {target: [-200 - k * 20, -700 - (k % 3) * 120], bend: 1}, armR: {target: [180 + k * 10, -500 - (k % 2) * 300], bend: -1}} : {};
						return (
							<Person key={k} kind={who === 'f' ? 'girl' : 'boy'} id={`u1sea${k}`} plain={who === 'f'} colors={{top: ['#c8402a', '#2a6aa8', '#e07a3a', '#5aa08a', '#e8e4d8', '#a83a5a'][k], topDark: ['#a8362a', '#2a5a98', '#c86a2a', '#4a907a', '#c8c4b8', '#983050'][k], pants: '#2c3a66', hair: KH[k % 6]}} x={160 + k * 330} y={1050} scale={0.66} walk={freeze ? undefined : f * 0.45 + k} breathe={f} headTilt={freeze ? (k % 2 ? 12 : -12) : 0} face={freeze ? {eyes: 'closed', mouth: 'tight', brows: 'raised', blush: true} : LAUGH} {...(pose as object)} />
						);
					})}
				</Lay>
			</Shot>
			{freeze && <Stamp f={f} at={w(54, 'море', -2)} x={960} y={250} text="«МОРЕ ВОЛНУЕТСЯ РАЗ…»" rot={-4} color={YEL} size={60} />}
		</AbsoluteFill>
	);
};

// 55. Chewing gum is rare; an insert from foreign gum is a real treasure. (жвачка, сокровище)
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(55);
	const fan = interpolate(f, [w(55, 'вкладыш', -6), w(55, 'вкладыш', 10)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.45} />} bg="#8fb4d8" m={{x: [-30, 30], z: [180, 240]}} blur={9}>
				<Lay z={-240} box={[300, 200, 1320, 860]}>
					{[0, 1, 2].map((k) => (
						<Insert key={k} x={960 + (k - 1) * 260 * fan} y={560 - Math.abs(k - 1) * 30} rot={(k - 1) * 14 * fan} k={k} />
					))}
					<g transform="translate(960,880)">
						<ellipse cx={0} cy={0} rx={220} ry={120} fill="#e8b48e" />
						{[-150, -60, 40, 130].map((fx, k) => (
							<rect key={k} x={fx - 30} y={-170 + Math.abs(k - 1.5) * 16} width={60} height={150} rx={30} fill="#e8b48e" />
						))}
					</g>
				</Lay>
			</Shot>
			<Stamp f={f} at={w(55, 'сокровище', -4)} x={1500} y={260} text="СОКРОВИЩЕ" rot={8} color={YEL} size={70} />
		</AbsoluteFill>
	);
};

// 56. You show the kids a game on the phone — in a minute the whole yard is around you. (игру, весь двор)
export const S56: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(56);
	const gather = (k: number) => lerp(f, 6 + k * 6, w(56, 'весь', 8), 0, 1, Easing.out(Easing.cubic));
	const ring = [
		{x0: -200, x: 520, y: 1050, s: 0.7},
		{x0: 2200, x: 1400, y: 1050, s: 0.7},
		{x0: -300, x: 300, y: 1000, s: 0.6},
		{x0: 2300, x: 1640, y: 1000, s: 0.6},
		{x0: -400, x: 760, y: 980, s: 0.56},
		{x0: 2400, x: 1180, y: 980, s: 0.56},
	];
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.5} />} bg="#8fb4d8" m={{x: [-40, 40], z: [40, 140]}}>
				<Lay z={-420} box={[-500, 300, 2900, 800]}>
					{ring.map((r, k) => {
						const x = lerp(gather(k), 0, 1, r.x0, r.x, Easing.linear);
						return <Person key={k} kind={k % 2 ? 'girl' : 'boy'} id={`u1ring${k}`} plain={k % 2 === 1} colors={{top: ['#c8402a', '#2a6aa8', '#e07a3a', '#5aa08a', '#e8e4d8', '#a83a5a'][k], topDark: ['#a8362a', '#2a5a98', '#c86a2a', '#4a907a', '#c8c4b8', '#983050'][k], pants: '#2c3a66', hair: KH[k % 6]}} x={x} y={r.y} scale={r.s} walk={gather(k) < 1 ? f * 0.45 : undefined} breathe={f} headTurn={x < 960 ? 0.5 : -0.5} face={{...WIDE, look: [x < 960 ? 0.7 : -0.7, 0.5]}} />;
					})}
				</Lay>
				<At z={-280} x={960} y={1220} s={1.0}>
					<You id="u1s56" x={960} y={1220} scale={1.0} breathe={f} face={{...LAUGH, look: [0, 0.6]}} armR={{target: [150, -560], bend: -1}} itemR={<HandPhone s={1.4} screen="#3ac569" />} />
				</At>
			</Shot>
		</AbsoluteFill>
	);
};

// 57. The bravest one whispers: «Is it… Japanese?» (японский)
export const S57: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(57);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.55} />} bg="#8fb4d8" m={{x: [-20, 20], z: [200, 260]}} blur={9}>
				<Lay z={-240} box={[300, 100, 1320, 980]}>
					<g transform="translate(860,470)">
						<Bust kind="boy" id="u1brave" colors={{top: '#c8402a', topDark: '#a8362a', hair: '#b4542a'}} scale={2.1} face={{eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: f > w(57, 'японский', -4) ? 'o' : 'flat', blush: true, look: [0.5, 0.5]}} tilt={-6} />
					</g>
				</Lay>
			</Shot>
			<Bubble x={1300} y={330} text="Это… японский?" from={w(57, 'это', -2)} to={len} tail="left" whisper />
		</AbsoluteFill>
	);
};

// 58. The yard is like one big family: everyone knows everyone. (семья)
export const S58: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(58);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.6} />} bg="#8fb4d8" m={{x: [-160, 160], z: [20, 100]}}>
				<Lay z={-440} box={[-200, 300, 2300, 800]}>
					<P81 n={0} who="m" id="u1fam1" x={300} y={1040} scale={0.7} breathe={f} headTurn={0.5} face={LAUGH} armR={{target: [220, -800], bend: -1}} />
					<P81 n={1} who="f" id="u1fam2" x={560} y={1040} scale={0.7} breathe={f + 4} headTurn={-0.5} face={LAUGH} />
					<g transform="translate(1100,1040) scale(0.8)">
						<Car81 kind="sedan" color="#c8402a" />
					</g>
					<P81 n={2} who="m" id="u1fam3" x={1360} y={1040} scale={0.7} breathe={f + 8} headTurn={-0.4} face={SMILE} armL={{target: [-240, -500], bend: 1}} />
					<path d="M 1560,620 L 2100,620" stroke="#e8e4d8" strokeWidth={4} />
					{Array.from({length: 4}).map((_, k) => (
						<rect key={k} x={1600 + k * 120} y={624} width={90} height={110 + (k % 2) * 30} fill={['#f4f4f0', '#c8d8f0', '#f0d8d8', '#e8e8c8'][k]} transform={`rotate(${Math.sin(f / 9 + k) * 3} ${1645 + k * 120} 624)`} />
					))}
					<P81 n={3} who="f" id="u1fam4" x={1840} y={1040} scale={0.7} breathe={f + 12} headTurn={-0.3} face={SMILE} armL={{target: [-120, -900], bend: 1}} />
				</Lay>
			</Shot>
		</AbsoluteFill>
	);
};

// 59. From a window: «Home! Dinner!» — and the yard empties in a minute. (домой, пустеет)
export const S59: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(59);
	const run = interpolate(f, [w(59, 'двор', -6), len], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.8} />} bg="#2e3060" m={{x: [0, 0], y: [-120, 0], z: [60, 120]}}>
				<Lay z={-420} box={[-500, 300, 2900, 800]}>
					{Array.from({length: 5}).map((_, k) => (
						<Person key={k} kind="boy" id={`u1home${k}`} colors={{top: ['#c8402a', '#2a6aa8', '#e07a3a', '#5aa08a', '#e8e4d8'][k], pants: '#2c3a66', hair: KH[(k + 2) % 6]}} x={300 + k * 330 + (k % 2 ? 1 : -1) * run * 1400} y={1040} scale={0.66} walk={f * 0.5 + k} face={SMILE} />
					))}
				</Lay>
			</Shot>
			<Bubble x={560} y={260} text="Домой! Ужинать!" from={w(59, 'домой', -2)} to={len} />
		</AbsoluteFill>
	);
};

// ============================================================ the TV ========
// 60. At home — the TV. First it warms up for a minute: it has tubes. (телевизор, прогревается, ламповый)
const TVShot: React.FC<{f: number; len: number; warm: number; show: 'night' | 'news' | 'cartoon' | 'film' | 'none'; channel?: 1 | 2; family?: boolean; close?: boolean}> = ({f, len, warm, show, channel = 1, family = true, close = false}) => (
	<Shot f={f} len={len} far={<Living81 night={0.6} />} bg="#c9b890" m={close ? {x: [60, 100], y: [-60, -80], z: [260, 330]} : {x: [-60, 60], z: [0, 100]}} blur={close ? 9 : 3} vig={0.66}>
		<Lay z={-400} box={[900, 200, 1300, 900]}>
			<TubeTV x={1480} y={FLOOR + 40} s={1.15} warm={warm} show={show} channel={channel} f={f} />
		</Lay>
		{family && (
			<Lay z={-320} box={[-300, 300, 1300, 900]}>
				{[
					{who: 'm' as const, n: 1, x: 340, leg: 470},
					{who: 'f' as const, n: 0, x: 580, leg: 400},
					{who: 'k' as const, n: 2, x: 800, leg: 336},
				].map((p, k) => {
					const sc = p.who === 'k' ? 0.62 : 0.76;
					return <P81 key={k} n={p.n} who={p.who} id={`u1tv${k}`} x={p.x} y={730 + p.leg * sc} scale={sc} breathe={f + k * 8} hideLegs headTurn={0.6} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, look: [0.9, 0]}} />;
				})}
			</Lay>
		)}
	</Shot>
);
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(60);
	const warm = interpolate(f, [w(60, 'прогревается'), w(60, 'ламповый', 6)], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<TVShot f={f} len={len} warm={warm} show="film" />
			<Tag f={f} at={w(60, 'ламповый', -2)} x={1430} y={560} tx={1420} ty={190} text="ЛАМПОВЫЙ" />
		</AbsoluteFill>
	);
};

// 61. Usually — two channels. To switch, you get up and turn the knob. (две программы, крутишь ручку)
export const S61: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(61);
	const ch: 1 | 2 = f >= w(61, 'крутишь', 4) ? 2 : 1;
	return (
		<AbsoluteFill>
			<TVShot f={f} len={len} warm={1} show={ch === 1 ? 'film' : 'cartoon'} channel={ch} family={false} close />
			<Fact x={960} f={f} at={w(61, 'две', -2)} text="2 ПРОГРАММЫ" y={170} color={YEL} />
		</AbsoluteFill>
	);
};

// 62. The little ones watch «Спокойной ночи, малыши!»; at nine the whole country watches «Время». (малыши, Время)
export const S62: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(62);
	const news = f >= w(62, 'девять', -4);
	return (
		<AbsoluteFill>
			<TVShot f={f} len={len} warm={1} show={news ? 'news' : 'night'} />
			{news && <Fact x={960} f={f} at={w(62, 'девять', -4)} text="21:00 · ПРОГРАММА «ВРЕМЯ»" y={170} />}
		</AbsoluteFill>
	);
};

// 63. Cartoons only on schedule. Missed it — wait for a rerun, maybe in a year. (расписанию, через год)
export const S63: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(63);
	return (
		<AbsoluteFill>
			<TVShot f={f} len={len} warm={1} show="cartoon" />
			<div style={{position: 'absolute', left: 360, top: 300, transform: `translate(-50%,-50%) rotate(-4deg) scale(${pop(f, w(63, 'расписанию', -4), 12)})`, background: '#f4f0e8', border: '4px solid #8a8f96', padding: '18px 30px', fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 30, color: '#2a2c30', lineHeight: 1.5, boxShadow: '0 12px 24px rgba(0,0,0,0.35)'}}>
				<div style={{fontWeight: 900, fontSize: 34}}>ПРОГРАММА ТВ</div>
				<div>18.00 — Новости</div>
				<div style={{color: RED, border: `4px solid ${RED}`, borderRadius: 40, padding: '0 10px'}}>18.15 — Мультфильмы</div>
				<div>18.45 — Концерт</div>
			</div>
			<Stamp f={f} at={w(63, 'через', -2)} x={1500} y={760} text="ПОВТОР — ЧЕРЕЗ ГОД?" rot={-5} size={54} />
		</AbsoluteFill>
	);
};

// 64. Want a film — wait until it's on. Or go to the cinema: a children's show is 10 kopecks. (кинотеатр, десять копеек)
export const S64: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(64);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Cinema81 />} bg="#8fb4d8" m={{x: [-80, 80], z: [0, 100]}}>
				<Lay z={-400} box={[-200, 300, 1600, 800]}>
					{Array.from({length: 6}).map((_, k) => (
						<Person key={k} kind={k % 2 ? 'girl' : 'boy'} id={`u1cin${k}`} plain={k % 2 === 1} colors={{top: ['#c8402a', '#2a6aa8', '#e07a3a', '#5aa08a', '#e8e4d8', '#a83a5a'][k], topDark: ['#a8362a', '#2a5a98', '#c86a2a', '#4a907a', '#c8c4b8', '#983050'][k], pants: '#2c3a66', hair: KH[k % 6]}} x={160 + k * 200} y={1040} scale={0.62} breathe={f + k * 5} headTurn={0.6} face={{...SMILE, look: [0.7, 0]}} />
					))}
				</Lay>
			</Shot>
			<Price f={f} at={w(64, 'десять', -2)} x={1520} y={950} what="ДЕТСКИЙ СЕАНС" price="10 коп." />
		</AbsoluteFill>
	);
};

// 65. Songs are caught on the radio and recorded on cassette; rewound with a pencil to save the batteries. (кассету, карандашом)
export const S65: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(65);
	const pencil = interpolate(f, [w(65, 'перематывают', -6), w(65, 'перематывают', 10)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const turn = f > w(65, 'перематывают', 10) ? (f - w(65, 'перематывают', 10)) * 14 : 0;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Living81 night={0.6} />} bg="#c9b890" m={{x: [-30, 30], z: [160, 220]}} blur={12}>
				<Lay z={-220} box={[400, 0, 1120, 1080]}>
					<g transform="translate(960,560) scale(0.95) translate(-540,-900)">
						<Cassette chew={0} pencil={pencil} turn={turn} />
					</g>
				</Lay>
			</Shot>
			<Fact x={960} f={f} at={w(65, 'беречь', -4)} text="БАТАРЕЙКИ — БЕРЕЧЬ!" y={170} color={YEL} />
		</AbsoluteFill>
	);
};

// =========================================================== prices =========
// 66. Battery 20 %. You count the prices: the fare 5 kopecks, a loaf of bread about 20. (двадцать, проезд, буханка)
export const S66: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(66);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Street81 f={f} />} bg="#8fb4d8" m={{x: [-60, 60], z: [60, 120]}} blur={8} vig={0.66} />
			<AbsoluteFill style={{background: 'rgba(10,12,24,0.35)'}} />
			<Price f={f} at={w(66, 'проезд', -2)} x={620} y={420} what="ПРОЕЗД" price="5 коп." />
			<Price f={f} at={w(66, 'буханка', -2)} x={1300} y={600} what="БУХАНКА ХЛЕБА" price="≈ 20 коп." />
		</AbsoluteFill>
	);
};

// 67. The average salary — about 170 roubles; a colour TV costs several salaries. (ста семидесяти, несколько зарплат)
export const S67: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(67);
	const n = Math.min(4, Math.max(0, Math.floor(interpolate(f, [w(67, 'несколько', -10), w(67, 'несколько', 24)], [0, 4.99], clamp))));
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Living81 night={0.2} />} bg="#c9b890" m={{x: [-30, 30], z: [120, 180]}} blur={9} vig={0.6}>
				<Lay z={-240} box={[200, 100, 1520, 900]}>
					<TubeTV x={1340} y={900} s={1.1} warm={1} show="film" f={f} />
					{Array.from({length: Math.max(1, n)}).map((_, k) => (
						<SalaryEnvelope key={k} x={520 + (k % 2) * 40} y={760 - k * 120} s={0.8} />
					))}
				</Lay>
			</Shot>
			<Price f={f} at={w(67, 'зарплата', -2)} x={520} y={180} what="ЗАРПЛАТА" price="≈ 170 руб." color={GREEN} />
			{n >= 2 && <Stamp f={f} at={w(67, 'несколько', -2)} x={1340} y={180} text="ЦВЕТНОЙ ТВ ≈ 4 ЗАРПЛАТЫ" rot={-4} size={50} />}
		</AbsoluteFill>
	);
};

// 68. Flats are given for free — but you can wait ten years in the queue for one. (бесплатно, десять лет)
export const S68: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(68);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} dusk={0.6} />} bg="#2e3060" m={{x: [-30, 30], z: [160, 220]}} blur={10}>
				<Lay z={-220} box={[460, 120, 1000, 860]}>
					<g transform="translate(960,560) scale(1.0)">
						<FlatQueue hi={interpolate(f, [w(68, 'десять', -6), w(68, 'десять', 4)], [0, 1], clamp)} />
					</g>
				</Lay>
			</Shot>
			<Stamp f={f} at={w(68, 'бесплатно', -2)} x={300} y={560} text="БЕСПЛАТНО" rot={-8} color={GREEN} size={60} />
			<Stamp f={f} at={w(68, 'десять', -2)} x={1580} y={760} text="~10 ЛЕТ" rot={6} size={80} />
		</AbsoluteFill>
	);
};

// 69. And in summer — the pioneer camp: the bugle in the morning, the line-up and the evening campfire. (лагерь, горн, костёр)
export const S69: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(69);
	const night = f >= w(69, 'вечерний', -6);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Camp f={f} night={night ? 1 : 0} />} bg={night ? '#0a1030' : '#8fb4d8'} m={{x: [-80, 80], z: [20, 100]}}>
				<Lay z={-420} box={[-200, 300, 2300, 800]}>
					{night ? (
						<g>
							<g transform="translate(960,1000)">
								<Fire f={f} s={1.0} />
							</g>
							{[560, 760, 1160, 1360].map((px, k) => (
								<Person key={k} kind={k % 2 ? 'girl' : 'boy'} id={`u1fire${k}`} plain={k % 2 === 1} colors={{top: '#e8e4d8', topDark: '#c8c4b8', pants: '#2c3a66', hair: KH[k % 6]}} pioneer x={px} y={1040} scale={0.62} breathe={f + k * 6} headTurn={px < 960 ? 0.5 : -0.5} face={{...SMILE, look: [px < 960 ? 0.6 : -0.6, 0.3]}} />
							))}
						</g>
					) : (
						<g>
							{[300, 480, 660, 1260, 1440, 1620].map((px, k) => (
								<Person key={k} kind={k % 2 ? 'girl' : 'boy'} id={`u1line${k}`} plain={k % 2 === 1} colors={{top: '#e8e4d8', topDark: '#c8c4b8', pants: '#2c3a66', hair: KH[k % 6]}} pioneer x={px} y={1040} scale={0.6} breathe={f + k * 6} face={SMILE} />
							))}
							<Person kind="boy" id="u1bugle" colors={{top: '#e8e4d8', topDark: '#c8c4b8', pants: '#2c3a66', hair: KH[1]}} pioneer x={960} y={1060} scale={0.66} breathe={f} face={{eyes: 'closed', mouth: 'o', brows: 'neutral', blush: true}} armR={{target: [40, -620], bend: -1}} itemR={<g transform="rotate(200)"><Bugle /></g>} />
						</g>
					)}
				</Lay>
			</Shot>
			<Tag f={f} at={w(69, 'горн', -2)} to={w(69, 'вечерний', -6)} x={1000} y={560} tx={1300} ty={200} text="ГОРН" />
		</AbsoluteFill>
	);
};

// ========================================================== the night =======
// 70. Night. Battery 10 %. You go out on the balcony and film the yard to say goodbye. (десять процентов, балкон)
export const S70: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(70);
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} night={1} />} bg="#0a1030" m={{x: [-60, 60], y: [-40, 0], z: [0, 90]}} vig={0.7}>
				<Lay z={-240} box={[-300, 560, 2600, 600]}>
					<rect x={-300} y={760} width={2600} height={30} fill="#3a3c44" />
					{Array.from({length: 40}).map((_, k) => (
						<rect key={k} x={-300 + k * 66} y={780} width={10} height={320} fill="#2a2c34" />
					))}
					<rect x={-300} y={1000} width={2600} height={100} fill="#2a2c34" />
				</Lay>
				<At z={-200} x={1400} y={1320} s={1.15}>
					<You id="u1s70" x={1400} y={1320} scale={1.15} back headTurn={-0.2} armR={{target: [120, -1060], bend: -1}} itemR={<HandPhone s={1.2} />} />
				</At>
			</Shot>
		</AbsoluteFill>
	);
};

// 71. Windows glow. Someone plays the guitar in the yard. It smells of lilac and somebody's cutlets. (гитаре, сиренью)
const Guitar: React.FC = () => (
	<g>
		<ellipse cx={0} cy={0} rx={70} ry={56} fill="#c8843a" />
		<ellipse cx={-70} cy={0} rx={50} ry={42} fill="#c8843a" />
		<circle cx={-20} cy={0} r={16} fill="#3a2a1e" />
		<rect x={30} y={-10} width={220} height={20} fill="#5a3a22" />
	</g>
);
export const S71: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(71);
	const strum = Math.sin(f / 3) * 20;
	return (
		<AbsoluteFill>
			<Shot f={f} len={len} far={<Yard81 f={f} night={1} />} bg="#0a1030" m={{x: [-100, 100], y: [-40, 40], z: [40, 120]}} vig={0.66}>
				<Lay z={-420} box={[300, 400, 1300, 700]}>
					<rect x={600} y={880} width={700} height={30} fill="#5a4a3a" />
					<rect x={620} y={910} width={20} height={130} fill="#2a2c34" />
					<rect x={1260} y={910} width={20} height={130} fill="#2a2c34" />
					<P81 n={2} who="m" id="u1guitar" hideLegs x={900} y={880 + 470 * 0.74} scale={0.74} breathe={f} headTilt={8} face={{eyes: 'closed', mouth: 'smile', brows: 'neutral', blush: false}} armR={{target: [120 + strum, -500], bend: -1}} armL={{target: [-200, -560], bend: 1}} />
					<g transform="translate(870,800) rotate(-12) scale(0.8)">
						<Guitar />
					</g>
					{f > 10 &&
						Array.from({length: 4}).map((_, k) => {
							const t = (((f - 10) / 40 + k / 4) % 1);
							return (
								<g key={k} transform={`translate(${960 + Math.sin(t * 6 + k) * 50},${500 - t * 300})`} opacity={Math.sin(t * Math.PI)}>
									<ellipse cx={0} cy={0} rx={18} ry={13} fill={YEL} transform="rotate(-20)" />
									<rect x={13} y={-64} width={6} height={64} fill={YEL} />
								</g>
							);
						})}
				</Lay>
			</Shot>
		</AbsoluteFill>
	);
};

// 72. Silence before sleep. No notifications. Only the alarm clock ticks. (тишина, тикает)
export const S72: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(72);
	return (
		<Shot f={f} len={len} far={<Room81 night={1} />} bg="#1a1a30" m={{x: [-40, 40], z: [80, 160]}} blur={6} vig={0.75}>
			<Lay z={-300} box={[560, 300, 800, 780]}>
				<rect x={660} y={860} width={600} height={260} fill="#2a2420" />
				<g transform="translate(960,860) scale(2.0)">
					<g>
						<path d="M -60,0 L -80,30 M 60,0 L 80,30" stroke="#1a1a1a" strokeWidth={10} />
						<circle cx={0} cy={-36} r={84} fill="#6a1a1a" />
						<circle cx={0} cy={-36} r={68} fill="#8a8678" />
						<line x1={0} y1={-36} x2={Math.sin(f / 30) * 50} y2={-36 - Math.cos(f / 30) * 50} stroke="#1a1a1a" strokeWidth={4} />
						<circle cx={-48} cy={-108} r={34} fill="#5a5850" />
						<circle cx={48} cy={-108} r={34} fill="#5a5850" />
					</g>
				</g>
			</Lay>
		</Shot>
	);
};

// 73. One per cent. The screen goes dark. (один процент, гаснет)
export const S73: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(73);
	const off = interpolate(f, [w(73, 'гаснет', -2), w(73, 'гаснет', 14)], [0, 1], clamp);
	const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(f / 4));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Phone x={960} y={560} w={420} rot={-2}>
				<div style={{position: 'absolute', inset: 0, background: '#0b0c10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: 1 - off}}>
					<div style={{opacity: pulse}}>
						<Battery pct={3} w={220} h={100} stroke={8} color={RED} glow={0.8} />
					</div>
					<div style={{fontSize: 100, color: RED, marginTop: 16}}>1%</div>
				</div>
			</Phone>
			<AbsoluteFill style={{background: '#000', opacity: off * 0.85}} />
		</AbsoluteFill>
	);
};

// ============================================================= home =========
// 74. You open your eyes — at home. The phone is charging. 2026. (дома, зарядке, две тысячи двадцать шестой)
export const S74: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(74);
	const {i, t} = seg(f, [w(74, 'телефон', -6)]);
	if (i === 0) {
		const from = interpolate(t, [0, 12], [1, 0], clamp);
		return (
			<AbsoluteFill>
				<Set3D cam={mv(t, len, {x: [-20, 20], z: [60, 140]})} bg="#dfe4ea" far={<FarW><g transform="translate(420,-200) scale(1.0)"><ModernPillow /></g></FarW>} blur={2} vig={0.58}>
					<Lay z={-420} box={[360, 100, 1200, 980]}>
						<g transform="translate(960,470)">
							<Bust kind="teen" id="u1wake2" colors={YOU} scale={1.8} face={t < 10 ? {eyes: 'closed', mouth: 'flat', blush: false, glasses: false} : {...WIDE, glasses: false, look: [0.4, -0.2]}} />
						</g>
						<g transform="translate(960,1000) scale(1.0) translate(-540,-1180)">
							<Duvet />
						</g>
					</Lay>
				</Set3D>
				{from > 0 && <AbsoluteFill style={{background: '#000', opacity: from}} />}
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill>
			<Set3D cam={mv(t, len - w(74, 'телефон', -6), {x: [30, -30], z: [0, 120]})} bg="#c9d4e0" far={<FarW><g transform="translate(420,-380) scale(1.0)"><Bedside f={f} /></g></FarW>} blur={6} vig={0.6}>
				<Lay z={-260} box={[300, 200, 1320, 800]}>
					<g transform="translate(960,700) scale(2.4) translate(-180,-995)">
						<Bedside f={f} />
					</g>
				</Lay>
			</Set3D>
			<Fact x={960} f={f} at={w(74, 'две', -2)} text="2026" y={170} color={GREEN} />
		</AbsoluteFill>
	);
};

// 75. A dream? You put your hand in your pocket — two kopecks and a pioneer badge. (приснилось, две копейки, значок)
export const S75: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(75);
	const open = interpolate(f, [w(75, 'две', -10), w(75, 'две', 4)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const badge = f >= w(75, 'значок', -6) ? pop(f, w(75, 'значок', -6), 11) : 0;
	return (
		<AbsoluteFill>
			<Set3D cam={mv(f, len, {x: [-20, 20], z: [120, 180]})} bg="#c9d4e0" far={<FarW><g transform="translate(420,-380)"><Bedside f={f} /></g></FarW>} blur={12} vig={0.66} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(960,${lerp(open, 0, 1, 1300, 720)})`}>
					<ellipse cx={0} cy={140} rx={360} ry={200} fill="#e8b48e" />
					{[-260, -120, 40, 190].map((fx, k) => (
						<rect key={k} x={fx - 46} y={-40 + Math.abs(k - 1.5) * 30 + (1 - open) * 80} width={92} height={220} rx={46} fill="#e8b48e" />
					))}
					<rect x={-240} y={300} width={480} height={400} rx={100} fill={YOU.top} />
					<g transform="translate(-120,70)">
						<Kopeck2 s={0.9} />
					</g>
					{badge > 0 && (
						<g transform={`translate(150,40) scale(${0.7 * badge})`}>
							<PioneerBadge />
						</g>
					)}
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 76. So it wasn't a dream. (не приснилось)
export const S76: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(76);
	return (
		<Set3D cam={mv(f, len, {x: [-20, 20], z: [80, 160]})} bg="#dfe4ea" far={<FarW><g transform="translate(420,-200)"><ModernPillow /></g></FarW>} blur={4} vig={0.6}>
			<Lay z={-420} box={[360, 100, 1200, 980]}>
				<g transform="translate(960,470)">
					<Bust kind="teen" id="u1smile" colors={YOU} scale={1.8} face={{eyes: 'happy', mouth: 'smile', brows: 'raised', blush: true, glasses: false}} />
				</g>
				<g transform="translate(960,1000) translate(-540,-1180)">
					<Duvet />
				</g>
			</Lay>
		</Set3D>
	);
};

// 77. Two kopecks — exactly what a call home cost. (две копейки, звонок)
export const S77: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #3a2a1a 0%, #120a06 70%)'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<g transform="translate(960,520)">
					<Kopeck2 s={2.0} spin={f / 14} />
				</g>
			</svg>
			<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 60, color: '#fff', opacity: interpolate(f, [w(77, 'ровно', -4), w(77, 'ровно', 8)], [0, 1], clamp)}}>
				2 КОПЕЙКИ = <span style={{color: YEL}}>ЗВОНОК ДОМОЙ</span>
			</div>
		</AbsoluteFill>
	);
};

// 78. The end card: would you like to live a day in the USSR? Write in the comments. Early access — in my Telegram.
export const S78: React.FC = () => {
	const f = useCurrentFrame();
	const q = pop(f, 6, 12);
	const promo = f >= w(78, 'ранний', -6) ? pop(f, w(78, 'ранний', -6), 12) : 0;
	const pulse = 1 + 0.04 * Math.sin(f / 6);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #5a1a1a 0%, #2a0a0e 60%, #0c0306 100%)', fontFamily: HEAVY, fontWeight: 900}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(1560,${560 + (1 - pop(f, 20, 12)) * 500})`}>
					<Bust kind="teen" id="u1end" colors={{top: '#2c3a66', topDark: '#243056', hair: YOU.hair}} plain scale={1.5} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: true, glasses: false}} tilt={Math.sin(f / 14) * 4} />
				</g>
				<g transform={`translate(340,${600 + (1 - pop(f, 30, 12)) * 500}) scale(0.9)`}>
					<PioneerBadge />
				</g>
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', transform: `scale(${q})`}}>
				<div style={{fontSize: 74, color: '#fff'}}>А ТЫ БЫ ХОТЕЛ</div>
				<div style={{fontSize: 92, color: YEL}}>ПРОЖИТЬ ДЕНЬ В СССР?</div>
			</div>
			{f >= w(78, 'пиши', -4) && (
				<div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) scale(${pop(f, w(78, 'пиши', -4), 12)})`, background: '#fff', color: '#111', borderRadius: 26, padding: '16px 44px', fontSize: 50, whiteSpace: 'nowrap'}}>ПИШИ В КОММЕНТАРИЯХ ↓</div>
			)}
			{promo > 0 && (
				<div style={{position: 'absolute', left: 960, top: 780, transform: `translate(-50%,-50%) scale(${promo * pulse})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 22, background: '#2aa3e0', color: '#fff', borderRadius: 60, padding: '20px 46px', fontSize: 50, boxShadow: '0 16px 40px rgba(42,163,224,0.45)'}}>
						<svg width={60} height={60} viewBox="0 0 24 24">
							<circle cx={12} cy={12} r={12} fill="#fff" />
							<path d="M 5.5,11.6 L 17.5,7 Q 18.4,6.7 18.1,7.8 L 16.1,16.9 Q 15.8,17.9 15,17.3 L 12,15.1 L 10.5,16.5 Q 10.2,16.8 10.1,16.3 L 10.3,13.6 L 15.2,9.2 Q 15.5,8.9 15,9.1 L 9,12.9 L 6.1,12 Q 5,11.7 5.5,11.6 Z" fill="#2aa3e0" />
						</svg>
						РАННИЙ ДОСТУП — В ТГК
					</div>
					<div style={{fontSize: 36, color: '#fff', marginTop: 16, fontFamily: SANS, fontWeight: 800}}>ссылка в профиле</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

export const _KEEP_U2 = {BusStop, Car81, Room81, CALM, Fact, Glow: null};
