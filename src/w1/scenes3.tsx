// «Что будет, если ты попадёшь в XX век» — shots 43…69: 1961 (12 April, the cosmonaut boys, the computer hall),
// 1971 (the queue, the flashlight, the payphone, the tape recorders, the TV evening), 1981 (the bear balloon, the
// cassette and the pencil, the yard), 1991 (the flag, the first mobile network, the kiosk), 1 %, 0 %, 2001, home.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Far, Lay, personBox, Set3D} from '../components/Layers3D';
import {Battery, Jump} from './hud';
import {Arrive, Fact, Folk, Glow, GREEN, HandPhone, HEAVY, Phone, RED, rnd, SANS, Stamp, Tag, YEL, YearTitle, You, YOU} from './kit';
import {BearBalloon, Bedside, BrickPhone, Cassette, CoinSlot, Duvet, Embankment, Fireworks, FlagTower, Gastronom, Insert, Jeans, Kiosk, LivingRoom70, ModernPillow, MonthPage, Payphone, Reel, Stadium, Yard80} from './late';
import {EVM, HandSign, Helmet, Street61} from './mid';
import {CrowdRow} from './old';
import {OldTown} from './streets';
import {SHOTS} from './timeline';

const L = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.sin);
const WIDE: Face = {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false};
const CALM: Face = {eyes: 'open', brows: 'neutral', mouth: 'flat', blush: false};
const SMILE: Face = {eyes: 'open', brows: 'neutral', mouth: 'smile', blush: false};
const LAUGH: Face = {eyes: 'happy', brows: 'raised', mouth: 'grin', blush: false};

// 43. 40 %. The jump to 1961.
export const S43: React.FC = () => <Jump len={L(43)} fromYear={1951} toYear={1961} fromPct={50} toPct={40} />;

// ===================================================================== 1961 ==
// 44. 1961. 12 April. People run out into the streets: Gagarin is in space! (двенадцатое@60, выбегают@113, Гагарин@152)
export const S44: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(44);
	const run = (k: number) => lerp(f, 100 + k * 4, 150 + k * 4, 0, 1, Easing.out(Easing.cubic));
	const signs = interpolate(f, [148, 162], [0, 1], clamp);
	const people = [
		{who: 'm' as const, n: 0, from: -300, to: 250},
		{who: 'f' as const, n: 1, from: -400, to: 400},
		{who: 'k' as const, n: 2, from: 1400, to: 640},
		{who: 'm' as const, n: 3, from: 1500, to: 900},
	];
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 60, E), y: lerp(f, 0, len, 40, -40, E), z: lerp(f, 0, len, 0, 120, E)}} bg="#8fb8e0" far={<Far><Street61 f={f} /></Far>} vig={0.52}>
				<Lay z={-800} box={[-500, 900, 2100, 700]}>
					<CrowdRow era={1961} x0={-200} dx={190} n={10} y={1400} s={0.42} id="w1s44c" seed={3} f={f} face={() => (f > 120 ? LAUGH : SMILE)} />
				</Lay>
				<Lay z={-420} box={[-700, 500, 2500, 1500]}>
					{people.map((p, k) => {
						const x = lerp(run(k), 0, 1, p.from, p.to, Easing.linear);
						const sc = p.who === 'k' ? 0.66 : 0.82;
						const holds = k % 2 === 0 && signs > 0;
						const hy = 1880 - (1080 + 160 * signs) * sc;
						return (
							<g key={k}>
								<Folk era={1961} n={p.n} who={p.who} id={`w1s44p${k}`} x={x} y={1880} scale={sc} walk={run(k) < 1 ? f * 0.45 : undefined} breathe={f} face={f > 150 ? LAUGH : {...SMILE, eyes: 'wide'}} armR={holds ? {target: [190, -1080 - 160 * signs], bend: -1} : undefined} />
								{holds && (
									<g transform={`translate(${x + 190 * sc},${hy}) scale(${sc})`}>
										<HandSign text={k === 0 ? 'УРА!\nГАГАРИН!' : 'ЧЕЛОВЕК\nВ КОСМОСЕ!'} w={420} />
									</g>
								)}
							</g>
						);
					})}
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1961} sub="12 АПРЕЛЯ" hold={70} color="#ff6a5a" />
		</AbsoluteFill>
	);
};

// 45. Strangers hug each other. You laugh with everybody. (обнимаются@31, смеёшься@63)
export const S45: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(45);
	const hug = interpolate(f, [8, 26], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, 40, -40, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#8fb8e0" far={<Far><Street61 f={f} /></Far>} vig={0.52}>
				<Lay z={-520} box={[200, 700, 1300, 1300]}>
					<Folk era={1961} n={2} who="m" id="w1s45a" x={lerp(hug, 0, 1, 640, 740)} y={1800} scale={0.82} breathe={f} headTurn={0.5} face={LAUGH} armR={{target: [lerp(hug, 0, 1, 150, 300), -820], bend: -1}} />
					<Folk era={1961} n={1} who="f" id="w1s45b" x={lerp(hug, 0, 1, 1080, 940)} y={1800} scale={0.8} breathe={f + 7} headTurn={-0.5} face={LAUGH} armL={{target: [lerp(hug, 0, 1, -150, -300), -820], bend: 1}} />
					<Folk era={1961} n={4} who="m" id="w1s45c" x={300} y={1760} scale={0.78} breathe={f + 3} face={LAUGH} armL={{target: [-120, -1150], bend: 1}} armR={{target: [120, -1150], bend: -1}} />
				</Lay>
				<Lay z={-260} box={personBox(170, 2000, 1.08)}>
					<You id="w1you45" x={170} y={2000} scale={1.08} breathe={f} headTurn={0.3} face={f >= 56 ? {...LAUGH, mouth: Math.floor(f / 5) % 2 ? 'grin' : 'open'} : SMILE} armR={f >= 56 ? {target: [200, -1200], bend: -1} : undefined} />
				</Lay>
			</Set3D>
		</AbsoluteFill>
	);
};

// 46. Boys in the yard argue who will be the first cosmonaut. (спорят@32, космонавтом@73)
export const S46: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(46);
	const boy = (x: number, k: number, turn: number, talk: boolean) => {
		const s = 1.0;
		const headY = 1800 - (336 + 304 + 32) * s - 94 * 0.85 * s;
		return (
			<g key={k}>
				<Folk era={1961} n={k} who="k" id={`w1s46b${k}`} x={x} y={1800} scale={s} breathe={f + k * 6} headTurn={turn} face={{eyes: 'narrow', brows: 'angry', mouth: talk ? 'open' : 'tight', blush: true, look: [turn, 0]}} armR={k === 0 ? {target: [150, -900 + Math.sin(f / 3) * 30], bend: -1} : undefined} armL={k === 1 ? {target: [-150, -900 + Math.sin(f / 3) * 30], bend: 1} : undefined} />
				<Helmet x={x} y={headY - 10} s={s * 1.05} />
			</g>
		);
	};
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40), y: 0, z: lerp(f, 0, len, 0, 100)}} bg="#9fbad2" far={<Far><Yard80 f={f} /></Far>} vig={0.56}>
				<Lay z={-320} box={[-200, 700, 1500, 1400]}>
					{boy(330, 0, 0.6, f >= 30 && f < 60)}
					{boy(760, 1, -0.6, f >= 60)}
				</Lay>
			</Set3D>
			<Bubble x={330} y={720} text="Я буду первым!" from={30} to={len} />
			<Bubble x={760} y={560} text="Нет, я!" from={58} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 47. In your pocket is a computer stronger than any computer of that time — and nobody to tell. (ЭВМ@78, некому@150)
export const S47: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(47);
	const shrug = interpolate(f, [130, 142], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 60, E), y: 0, z: lerp(f, 0, len, 0, 120, E)}} bg="#dde2e0" far={<Far><EVM f={f} /></Far>} vig={0.56}>
				<Lay z={-600} box={[-300, 800, 1700, 1100]}>
					{[0, 1].map((k) => (
						<Person key={k} kind="mom" id={`w1s47o${k}`} plain colors={{top: '#f4f4f0', topDark: '#f4f4f0', hair: ['#5a3a28', '#2a2220'][k]}} hem={0.5} x={300 + k * 560} y={1700} scale={0.66} breathe={f + k * 9} back={k === 1} headTurn={k ? 0 : 0.4} face={CALM} />
					))}
				</Lay>
				<Lay z={-260} box={personBox(540, 2060, 1.12)}>
					<You id="w1you47" x={540} y={2060} scale={1.12} breathe={f} headTurn={Math.sin(f / 20) * 0.5 * shrug} face={shrug > 0.5 ? {eyes: 'open', brows: 'sad', mouth: 'smile', blush: false, look: [Math.sin(f / 20), 0]} : {...SMILE, look: [0, -0.3]}} armL={shrug > 0 ? {target: [-150 - 150 * shrug, -470 - 60 * shrug], bend: -1} : undefined} armR={shrug > 0 ? {target: [150 + 150 * shrug, -470 - 60 * shrug], bend: 1} : undefined} />
					<Glow id="w1pock" x={620} y={1400} r={240} color="#7fd0ff" o={0.7} />
				</Lay>
			</Set3D>
			<Fact f={f} at={54} to={128} text="ЭВМ: ДЕСЯТКИ ТЫСЯЧ ОПЕРАЦИЙ В СЕКУНДУ" y={320} color="#9aa3b2" />
			<Fact f={f} at={70} to={128} text="ТВОЙ ТЕЛЕФОН: МИЛЛИАРДЫ" y={430} color="#7fd0ff" />
		</AbsoluteFill>
	);
};

// 48. 30 %. The jump to 1971.
export const S48: React.FC = () => <Jump len={L(48)} fromYear={1961} toYear={1971} fromPct={40} toPct={30} />;

// ===================================================================== 1971 ==
// 49. 1971. A new word — «дефицит». A queue for sausage; jeans through connections. (дефицит@94, очередь@152, джинсы@176)
export const S49: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(49);
	const {i, t} = seg(f, [170]);
	if (i === 0) {
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 170, -120, 160, E), y: 0, z: lerp(t, 0, 170, 0, 90, E)}} bg="#9fbad2" far={<Far><Gastronom /></Far>} vig={0.56}>
					<Lay z={-480} box={[-600, 800, 2300, 1300]}>
						<CrowdRow era={1971} x0={-520} dx={150} n={14} y={1820} s={0.74} id="w1s49q" seed={2} f={t} look={() => -0.4} face={() => ({eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.6, 0]})} />
					</Lay>
				</Set3D>
				<Arrive f={f} />
				<YearTitle f={f} year={1971} sub="СССР" hold={44} color="#ff6a5a" />
				<Stamp f={t} at={92} x={540} y={600} text="ДЕФИЦИТ" rot={-7} size={110} />
			</AbsoluteFill>
		);
	}
	const open = interpolate(t, [6, 18], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len - 170, -30, 30), y: 0, z: lerp(t, 0, len - 170, 40, 120)}} bg="#9fbad2" far={<Far><Gastronom /></Far>} blur={7} vig={0.64}>
				<Lay z={-380} box={personBox(700, 1980, 1.08, 760)}>
					<Folk era={1971} n={3} who="m" id="w1farc" x={700} y={1980} scale={1.08} breathe={t} headTurn={-0.5} face={{eyes: Math.floor(t / 20) % 3 === 2 ? 'closed' : 'narrow', brows: 'raised', mouth: 'smile', blush: false, look: [-0.8, 0]}} armL={{target: [-320 - 120 * open, -900], bend: 1}} />
					{open > 0 && (
						<g opacity={open}>
							<path d={`M ${700 - 160},${1980 - 1230} L ${700 - 160 - 210 * open},${1980 - 1150} L ${700 - 160 - 230 * open},${1980 - 560} L ${700 - 140},${1980 - 600} Z`} fill="#5a3a2a" />
							<Jeans x={700 - 160 - 120 * open} y={1980 - 1080} s={1.1} />
						</g>
					)}
				</Lay>
				<Lay z={-240} box={personBox(200, 2060, 1.12)}>
					<You id="w1you49" x={200} y={2060} scale={1.12} breathe={t} headTurn={0.5} face={{...WIDE, look: [0.8, 0]}} />
				</Lay>
			</Set3D>
			<Tag f={t} at={30} x={480} y={1080} tx={420} ty={500} text="ДЖИНСЫ — ПО ЗНАКОМСТВУ" />
		</AbsoluteFill>
	);
};

// 50. You switch on your phone's flashlight. The queue gasps: «Импортный!» (фонарик@41, ахает@77, импортный@96)
export const S50: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(50);
	const beam = interpolate(f, [38, 44], [0, 1], clamp);
	const turn = interpolate(f, [58, 70], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#2a3058" far={<Far><Gastronom dusk={1} /></Far>} vig={0.66}>
				<Lay z={-480} box={[-300, 700, 1800, 1300]}>
					<CrowdRow era={1971} x0={400} dx={170} n={5} y={1820} s={0.78} id="w1s50q" seed={6} f={f} look={() => -0.7 * turn} face={(k) => (turn > 0.5 ? {eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: k % 2 ? 'o' : 'open', look: [-0.9, 0]} : {eyes: 'open', mouth: 'flat', brows: 'neutral', look: [-0.5, 0]})} />
				</Lay>
				<Lay z={-260} box={[-600, 300, 2300, 1900]}>
					<You id="w1you50" x={220} y={2040} scale={1.1} breathe={f} headTurn={0.4} face={{...SMILE, look: [0.6, 0]}} armR={{target: [330, -950], bend: -1}} itemR={<HandPhone s={1.3} />} />
					{beam > 0 && (
						<g opacity={beam}>
							<path d="M 560,960 L 1700,560 L 1700,1360 Z" fill="#fffbe0" opacity={0.35} />
							<Glow id="w1beam" x={560} y={960} r={240} color="#fffbe0" o={0.9} />
						</g>
					)}
				</Lay>
			</Set3D>
			<Bubble x={760} y={760} text="Импортный!" from={94} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 51. You can call from the payphone on the corner: a call costs two kopecks. (автомата@31, две копейки@82)
export const S51: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(51);
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		return (
			<Set3D cam={{x: lerp(t, 0, 58, -60, 40), y: 0, z: lerp(t, 0, 58, 0, 110)}} bg="#9fbad2" far={<Far><Gastronom /></Far>} vig={0.58}>
				<Lay z={-500} box={[500, 600, 600, 1300]}>
					<g transform="translate(620,880)">
						<Payphone />
					</g>
				</Lay>
				<Lay z={-280} box={personBox(lerp(t, 0, 58, 160, 380), 2020, 1.08)}>
					<You id="w1you51" x={lerp(t, 0, 58, 160, 380)} y={2020} scale={1.08} walk={t * 0.28} headTurn={0.5} face={{...CALM, look: [0.8, 0]}} />
				</Lay>
			</Set3D>
		);
	}
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: lerp(t, 0, len - 58, -30, 30), z: lerp(t, 0, len - 58, 0, 80)}} bg="#6a6f76" far={<Far z={-1000}><CoinSlot coin={interpolate(t, [18, 34], [0, 1], clamp)} /></Far>} blur={0.2} vig={0.62} />
			<Stamp f={t} at={26} x={540} y={1560} text="2 КОПЕЙКИ" rot={-6} color={YEL} size={80} />
		</AbsoluteFill>
	);
};

// 52. The most popular songs are copied from tape recorder to tape recorder. (переписывают@38, магнитофон@92)
export const S52: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(52);
	const notes = f >= 36;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 100, E)}} bg="#c9b890" far={<Far><LivingRoom70 f={f} tvGlow={0} /></Far>} blur={6} vig={0.62}>
				<Lay z={-380} box={[-200, 800, 1500, 1000]}>
					<rect x={-200} y={1300} width={1500} height={40} fill="#6a4628" />
					<Reel x={260} y={1290} f={f} s={0.9} />
					<Reel x={820} y={1290} f={f} s={0.9} c="#c9c0b0" />
					<path d="M 380,1330 C 480,1460 600,1460 700,1330" stroke="#1a1c20" strokeWidth={8} fill="none" />
					{notes &&
						Array.from({length: 6}).map((_, k) => {
							const tt = (((f - 36) / 40 + k / 6) % 1);
							const x = 260 + tt * 560;
							const y = 1040 - Math.sin(tt * Math.PI) * 260;
							return (
								<g key={k} transform={`translate(${x},${y})`} opacity={Math.sin(tt * Math.PI)}>
									<ellipse cx={0} cy={0} rx={22} ry={16} fill={YEL} transform="rotate(-20)" />
									<rect x={16} y={-80} width={8} height={80} fill={YEL} />
								</g>
							);
						})}
				</Lay>
				<Lay z={-240} box={[-300, 900, 1700, 1300]}>
					<Folk era={1971} n={0} who="k" id="w1s52a" x={60} y={2100} scale={1.0} breathe={f} headTilt={Math.sin(f / 5) * 6} face={{eyes: 'closed', mouth: 'smile', brows: 'neutral', blush: false}} />
					<Folk era={1971} n={2} who="k" id="w1s52b" x={1020} y={2100} scale={1.0} breathe={f + 5} headTilt={Math.sin(f / 5 + 1) * 6} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: false}} />
				</Lay>
			</Set3D>
		</AbsoluteFill>
	);
};

// 53. A couple of channels on TV. In the evening the whole family watches the same thing. (программ@33, одно и то же@101)
export const S53: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(53);
	const ch = f < 30 ? 1 : 2;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, 50, 300, 0, E) + lerp(f, 50, len, 0, -60, E), y: 0, z: lerp(f, 0, 50, 260, 0, E) + lerp(f, 50, len, 0, 60, E)}} bg="#c9b890" far={<Far><LivingRoom70 f={f} channel={ch} /></Far>} vig={0.62}>
				<Lay z={-380} box={[-200, 700, 1300, 1000]}>
					{[
						{who: 'm' as const, n: 1, x: 40, leg: 470},
						{who: 'f' as const, n: 0, x: 240, leg: 400},
						{who: 'f' as const, n: 3, x: 430, leg: 400},
						{who: 'k' as const, n: 2, x: 600, leg: 336},
					].map((p, k) => {
						const sc = p.who === 'k' ? 0.6 : 0.74;
						return <Folk key={k} era={1971} n={p.n} who={p.who} id={`w1s53f${k}`} x={p.x} y={1070 + p.leg * sc} scale={sc} breathe={f + k * 8} headTurn={0.6} face={{eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, look: [0.9, 0]}} hideLegs />;
					})}
				</Lay>
			</Set3D>
			<Tag f={f} at={30} x={1000} y={900} tx={800} ty={520} text="2 ПРОГРАММЫ" />
		</AbsoluteFill>
	);
};

// 54. 20 %. The jump to 1981.
export const S54: React.FC = () => <Jump len={L(54)} fromYear={1971} toYear={1981} fromPct={30} toPct={20} />;

// ===================================================================== 1981 ==
// 55. 1981. A year ago Moscow hosted the Olympics — everyone still remembers the bear. (Олимпиада@104, Мишку@202)
export const S55: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(55);
	const rise = lerp(f, 100, len, 0, 1, Easing.inOut(Easing.quad));
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: lerp(f, 90, len, 0, -260, E), z: lerp(f, 0, len, 0, 90, E)}} bg="#2a2a5a" far={<Far><Stadium /></Far>} vig={0.6}>
				<Lay z={-700} box={[-300, -400, 1700, 2000]}>
					<g transform={`translate(${560 + Math.sin(f / 30) * 60},${1360 - rise * 1100}) scale(${1.1 - rise * 0.35})`}>
						<BearBalloon sway={Math.sin(f / 24) * 5} />
					</g>
				</Lay>
				<Lay z={-300} box={[-300, 1100, 1700, 1100]}>
					<CrowdRow era={1981} x0={-80} dx={240} n={6} y={2080} s={0.8} id="w1s55c" seed={4} f={f} back />
				</Lay>
			</Set3D>
			<Arrive f={f} />
			<YearTitle f={f} year={1981} sub="СССР" hold={44} color="#ff6a5a" />
			<Fact f={f} at={78} text="МОСКВА · ОЛИМПИАДА-80" y={420} />
		</AbsoluteFill>
	);
};

// 56. Cassettes are in. The tape got chewed — wind it back with a pencil. (кассеты@17, зажевало@40, карандашом@95)
export const S56: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(56);
	const chew = interpolate(f, [36, 58], [0, 1], clamp) * interpolate(f, [86, len], [1, 0.3], clamp);
	const pencil = interpolate(f, [70, 86], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const turn = f > 86 ? (f - 86) * 14 : 0;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -30, 30), y: lerp(f, 0, len, 0, 60), z: lerp(f, 0, len, 0, 80)}} bg="#2a5a6a" far={<Far><Yard80 /></Far>} blur={12} vig={0.66}>
				<Lay z={-240} box={[-100, 300, 1280, 1700]}>
					<Cassette chew={chew} pencil={pencil} turn={turn} />
				</Lay>
			</Set3D>
		</AbsoluteFill>
	);
};

// 57. Yards: rubber band, hopscotch, «cossacks and robbers». You are called home only when it gets dark.
// (резинки@24, классики@45, казаки-разбойники@67, домой@114, стемнеет@161)
export const S57: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(57);
	const dusk = interpolate(f, [110, 165], [0, 1], clamp);
	const jump = Math.abs(Math.sin(f / 5)) * 90;
	const hop = Math.abs(Math.sin(f / 6)) * 70;
	const runX = lerp(f, 60, 120, -300, 1400, Easing.linear);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -80, 80, E), y: 0, z: lerp(f, 0, len, 0, 100, E)}} bg="#9fbad2" far={<Far><Yard80 dusk={dusk} f={f} /></Far>} vig={0.56 + dusk * 0.15}>
				<Lay z={-560} box={[-300, 900, 1700, 1000]}>
					{/* the rubber band between two girls, a third one jumping */}
					<Folk era={1981} n={1} who="f" id="w1s57a" x={40} y={1720} scale={0.6} breathe={f} headTurn={0.4} face={SMILE} />
					<Folk era={1981} n={2} who="f" id="w1s57b" x={420} y={1720} scale={0.6} breathe={f + 5} headTurn={-0.4} face={SMILE} />
					<path d="M 60,1650 L 400,1650 M 60,1690 L 400,1690" stroke="#f4f0e8" strokeWidth={5} />
					<g transform={`translate(0,${-jump})`}>
						<Folk era={1981} n={3} who="f" id="w1s57c" x={230} y={1720} scale={0.58} breathe={f} face={LAUGH} />
					</g>
					<g transform={`translate(0,${-hop})`}>
						<Folk era={1981} n={0} who="f" id="w1s57d" x={720} y={1600} scale={0.5} breathe={f} face={LAUGH} />
					</g>
				</Lay>
				<Lay z={-360} box={[-700, 900, 2600, 1200]}>
					{f >= 60 && f < 124 && [0, 1, 2].map((k) => <Folk key={k} era={1981} n={k} who="k" id={`w1s57r${k}`} x={runX - k * 200} y={1980} scale={0.72} walk={f * 0.5 + k} breathe={f} face={LAUGH} />)}
				</Lay>
			</Set3D>
			<Tag f={f} at={24} to={108} x={240} y={1430} tx={300} ty={520} text="РЕЗИНКИ" />
			<Tag f={f} at={45} to={108} x={720} y={1500} tx={800} ty={680} text="КЛАССИКИ" />
			<Bubble x={300} y={560} text="Домой!" from={118} to={len} />
		</AbsoluteFill>
	);
};

// 58. You play music from your phone. A boy your age whispers: «Is that… a tape recorder?» (музыку@22, шепчет@77, магнитофон@119)
export const S58: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(58);
	const lean = interpolate(f, [56, 76], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 120, E)}} bg="#1e2450" far={<Far><Yard80 dusk={1} f={f} /></Far>} vig={0.66}>
				<Lay z={-300} box={[-300, 800, 1700, 1400]}>
					<rect x={-200} y={1680} width={1500} height={40} fill="#6a4a2a" />
					<rect x={-200} y={1720} width={1500} height={24} fill="#5a3a22" />
					<You id="w1you58" x={330} y={2060} scale={1.0} breathe={f} hideLegs headTurn={0.3} face={{...SMILE, look: [0.3, 0.6]}} armR={{target: [250, -760], bend: -1}} itemR={<HandPhone s={1.2} />} />
					<Folk era={1981} n={1} who="k" id="w1s58b" x={760 - 90 * lean} y={2060} scale={0.98} hideLegs breathe={f} headTilt={-10 * lean} headTurn={-0.5} face={{eyes: 'wide', pupil: 0.55, brows: 'raised', mouth: f > 92 ? 'o' : 'flat', blush: true, look: [-0.8, 0.6]}} />
					{f >= 22 &&
						Array.from({length: 4}).map((_, k) => {
							const tt = (((f - 22) / 36 + k / 4) % 1);
							return (
								<g key={k} transform={`translate(${560 + Math.sin(tt * 6 + k) * 40},${1200 - tt * 420})`} opacity={Math.sin(tt * Math.PI)}>
									<ellipse cx={0} cy={0} rx={20} ry={14} fill={YEL} transform="rotate(-20)" />
									<rect x={14} y={-70} width={7} height={70} fill={YEL} />
								</g>
							);
						})}
				</Lay>
			</Set3D>
			<Bubble x={600} y={720} text="Это что… магнитофон?" from={92} to={len} tail="right" whisper />
		</AbsoluteFill>
	);
};

// 59. 10 %. The jump to 1991.
export const S59: React.FC = () => <Jump len={L(59)} fromYear={1981} toYear={1991} fromPct={20} toPct={10} />;

// ===================================================================== 1991 ==
// 60. 1991. The country changes again: by the end of the year the Soviet Union will be gone. (меняется@79, Союза@142, не станет@155)
const MONTHS = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
export const S60: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(60);
	const {i, t} = seg(f, [102]);
	if (i === 0) {
		const m = Math.min(11, Math.floor(interpolate(t, [50, 96], [0, 11.99], clamp)));
		const flip = t >= 50 && m < 11 ? ((t - 50) % 4) / 4 : 0;
		return (
			<AbsoluteFill>
				<Set3D cam={{x: 0, y: 0, z: lerp(t, 0, 102, 0, 80)}} bg="#3a3a52" far={<Far><rect x={-600} y={-600} width={2300} height={3200} fill="#4a4a62" /></Far>} vig={0.66}>
					<Lay z={-300} box={[220, 600, 640, 700]}>
						<g transform="translate(540,960) scale(1.3)">
							<MonthPage month={MONTHS[m]} />
							{flip > 0 && (
								<g transform={`translate(0,${-260}) rotate(${-flip * 50}) translate(0,${260 - flip * 400})`} opacity={1 - flip}>
									<MonthPage month={MONTHS[Math.max(0, m - 1)]} />
								</g>
							)}
						</g>
					</Lay>
				</Set3D>
				<Arrive f={f} />
				<YearTitle f={f} year={1991} sub="СССР" hold={44} color="#ff6a5a" />
			</AbsoluteFill>
		);
	}
	const len2 = len - 102;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len2, -30, 30), y: lerp(t, 0, len2, 60, -60), z: lerp(t, 0, len2, 0, 100)}} bg="#141a3a" far={<Far><FlagTower f={f} down={interpolate(t, [10, 52], [0, 1], clamp)} up={interpolate(t, [50, len2], [0, 0.9], clamp)} /></Far>} blur={1} vig={0.66} />
			<Fact f={t} at={4} text="25 ДЕКАБРЯ 1991" y={330} color={RED} />
		</AbsoluteFill>
	);
};

// 61. St Petersburg launches the country's first mobile network. Your phone doesn't even see it — it's analogue.
// (сотовую сеть@55, не видит@136, аналоговая@158)
export const S61: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(61);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 60, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#8aa0b8" far={<Far><Embankment f={f} /></Far>} vig={0.56}>
				<Lay z={-440} box={personBox(780, 1900, 0.92)}>
					<Person kind="dad" id="w1brick" plain kneePatch={false} colors={{top: '#2a2a30', topDark: '#2a2a30', pants: '#2a2a30', hair: '#2a2220'}} x={780} y={1900} scale={0.92} breathe={f} headTurn={-0.3} face={{eyes: 'open', brows: 'raised', mouth: Math.floor(f / 5) % 2 && f < 90 ? 'open' : 'smile', blush: false, look: [-0.5, 0]}} armL={{target: [-80, -1020], bend: 1}} itemL={<BrickPhone s={1.2} />} />
				</Lay>
				<Lay z={-250} box={personBox(240, 2040, 1.08)}>
					<You id="w1you61" x={240} y={2040} scale={1.08} breathe={f} headTurn={0.4} face={{...(f > 130 ? {eyes: 'open', brows: 'worried', mouth: 'frown', blush: false} : WIDE), look: [0.6, f > 96 ? 0.6 : 0]}} armR={f > 92 ? {target: [260, -880], bend: -1} : undefined} itemR={f > 92 ? <HandPhone s={1.3} /> : undefined} />
				</Lay>
			</Set3D>
			<Bubble x={760} y={700} text="Алло! Алло!" from={30} to={92} tail="right" />
			<Fact f={f} at={56} to={130} text="1991 · ПЕРВАЯ СОТОВАЯ СЕТЬ" y={330} />
			{f >= 132 && (
				<div style={{position: 'absolute', left: 300, top: 640, transform: `translate(-50%,-50%) scale(${pop(f, 132, 12)})`, background: 'rgba(14,14,18,0.92)', border: `5px solid ${RED}`, borderRadius: 22, padding: '14px 30px', fontFamily: SANS, fontWeight: 900, fontSize: 48, color: '#fff'}}>
					Нет сети
				</div>
			)}
			<Tag f={f} at={152} x={720} y={900} tx={760} ty={500} text="АНАЛОГОВАЯ" color={RED} />
		</AbsoluteFill>
	);
};

// 62. On the counters: gum with inserts and video cassettes with action films. (жвачка@27, вкладышами@42, видеокассеты@66)
export const S62: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(62);
	const fan = interpolate(f, [30, 50], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 60, E), y: lerp(f, 0, len, 40, -60, E), z: lerp(f, 0, len, 0, 120, E)}} bg="#8a8a96" far={<Far><Kiosk /></Far>} vig={0.58}>
				<Lay z={-240} box={[-100, 1200, 1280, 800]}>
					{fan > 0 &&
						[0, 1, 2].map((k) => <Insert key={k} x={540 + (k - 1) * 150 * fan} y={1620 - Math.abs(k - 1) * 20} rot={(k - 1) * 18 * fan} k={k} />)}
				</Lay>
			</Set3D>
			<Tag f={f} at={30} x={540} y={1560} tx={760} ty={1460} text="ВКЛАДЫШИ" />
			<Tag f={f} at={66} x={360} y={420} tx={540} ty={300} text="ВИДЕОКАССЕТЫ" />
		</AbsoluteFill>
	);
};

// 63. The battery blinks red. One per cent. (мигает@19, один процент@53)
export const S63: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(63);
	const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(f / 4));
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: 0, z: lerp(f, 0, len, 0, 60)}} bg="#8a8a96" far={<Far><Kiosk /></Far>} blur={12} vig={0.75} />
			<AbsoluteFill style={{background: 'rgba(30,6,6,0.45)'}} />
			<Phone x={540} y={940} w={580} rot={-2}>
				<div style={{position: 'absolute', inset: 0, background: '#0b0c10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900}}>
					<div style={{opacity: pulse}}>
						<Battery pct={4} w={300} h={140} stroke={10} color={RED} glow={0.8} />
					</div>
					<div style={{fontSize: 130, color: RED, marginTop: 20, transform: `scale(${f >= 53 ? pop(f, 53, 10) : 1})`}}>{f >= 50 ? '1%' : '2%'}</div>
					<div style={{fontSize: 34, color: '#ffb3ad', marginTop: 10, fontFamily: SANS}}>Низкий заряд</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// 64. Zero. For a second you see fireworks: 2001… and darkness. (ноль@4, салют@54, две тысячи первый@71, темнота@115)
export const S64: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(64);
	const {i, t} = seg(f, [22]);
	if (i === 0) {
		const off = interpolate(t, [10, 22], [0, 1], clamp);
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<Phone x={540} y={940} w={580} rot={-2}>
					<div style={{position: 'absolute', inset: 0, background: '#0b0c10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 900, opacity: 1 - off}}>
						<Battery pct={0} w={300} h={140} stroke={10} color={RED} />
						<div style={{fontSize: 130, color: RED, marginTop: 20}}>0%</div>
					</div>
				</Phone>
				<AbsoluteFill style={{background: '#000', opacity: off * 0.8}} />
			</AbsoluteFill>
		);
	}
	const fadeIn = interpolate(t, [0, 12], [0, 1], clamp);
	const dark = interpolate(t, [86, 100], [0, 1], clamp);
	const year = interpolate(t, [44, 56], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Set3D cam={{x: 0, y: lerp(t, 0, len - 22, 60, -60), z: lerp(t, 0, len - 22, 0, 80)}} bg="#060a1c" far={<Far><Fireworks f={t} o={fadeIn} /></Far>} blur={0.5} vig={0.6} />
			{year > 0 && (
				<div style={{position: 'absolute', left: 540, top: 700, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * year})`, opacity: year * (1 - dark), fontFamily: HEAVY, fontWeight: 900, fontSize: 250, color: '#fff', textShadow: '0 0 60px #ffd34a, 0 0 120px #ff7a4a'}}>
					2001
				</div>
			)}
			{dark > 0 && <AbsoluteFill style={{background: '#000', opacity: dark}} />}
		</AbsoluteFill>
	);
};

// ===================================================================== home ==
// 65. You open your eyes — at home. The phone is on its charger. (глаза@25, дома@41, зарядке@85)
export const S65: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(65);
	const {i, t} = seg(f, [58]);
	if (i === 0) {
		const from = interpolate(t, [0, 10], [1, 0], clamp);
		const eyes: Face = t < 8 ? {eyes: 'closed', mouth: 'flat', blush: false, glasses: false} : t < 22 ? {eyes: 'open', blink: t < 12 ? 0.6 : 0, mouth: 'flat', brows: 'worried', blush: false, glasses: false} : {...WIDE, glasses: false, look: [0.5, -0.2]};
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 58, -20, 20), y: 0, z: lerp(t, 0, 58, 60, 160)}} bg="#dfe4ea" far={<Far z={-900}><ModernPillow /></Far>} blur={2} vig={0.58}>
					<Lay z={-420} box={[60, 260, 960, 1200]}>
						<Bust kind="teen" id="w1home" colors={YOU} x={540} y={760} scale={2.3} face={eyes} turn={t > 22 ? 0.4 : 0} />
					</Lay>
					<Lay z={-300} box={[-300, 1000, 1680, 1400]}>
						<Duvet />
					</Lay>
				</Set3D>
				{from > 0 && <AbsoluteFill style={{background: '#000', opacity: from}} />}
			</AbsoluteFill>
		);
	}
	return (
		<Set3D cam={{x: lerp(t, 0, len - 58, 30, -30), y: 0, z: lerp(t, 0, len - 58, 0, 120)}} bg="#c9d4e0" far={<Far><Bedside f={f} /></Far>} blur={8} vig={0.6}>
			<Lay z={-260} box={[-100, 700, 1280, 900]}>
				<g transform="translate(540,1180) scale(2.6) translate(-180,-995)">
					<Bedside f={f} />
				</g>
			</Lay>
		</Set3D>
	);
};

// the photo you took in 1901 (S14): the bakery, the crowd frozen by the flash — and you in front of them
const BakeryPhoto: React.FC<{zoom?: number}> = ({zoom = 0}) => (
	<svg width="100%" height="100%" viewBox={`${-80 + zoom * 120} ${380 + zoom * 760} ${1240 - zoom * 760} ${1560 - zoom * 960}`} preserveAspectRatio="xMidYMid slice" style={{filter: 'sepia(0.9) contrast(1.08) brightness(0.95)'}}>
		<OldTown era={1901} />
		<CrowdRow era={1901} x0={100} dx={190} n={5} y={1640} s={0.62} id="w1ph" seed={1} face={(k) => ({eyes: 'wide', pupil: 0.5, mouth: k % 2 ? 'o' : 'open', brows: 'raised', look: [0, 0]})} />
		<You id="w1phyou" x={300} y={1900} scale={0.86} walk={1.2} headTurn={0.5} face={{eyes: 'wide', pupil: 0.5, brows: 'raised', mouth: 'o', blush: false, look: [0.5, 0]}} />
	</svg>
);

// 66. A dream? You open the gallery… (приснилось@4, галерею@51)
export const S66: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(66);
	const tap = interpolate(f, [48, 56], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: 0, z: lerp(f, 0, len, 0, 60)}} bg="#c9d4e0" far={<Far><Bedside f={f} /></Far>} blur={10} vig={0.66} />
			<Phone x={540} y={940} w={580} rot={-2}>
				<div style={{position: 'absolute', inset: 0, background: '#0f1115', fontFamily: SANS}}>
					<div style={{position: 'absolute', left: 30, top: 70, fontSize: 46, fontWeight: 900, color: '#fff'}}>Галерея</div>
					<div style={{position: 'absolute', left: 6, right: 6, top: 150, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6}}>
						{Array.from({length: 15}).map((_, k) => (
							<div key={k} style={{height: 170, background: k === 0 ? '#a08060' : `hsl(${(k * 47) % 360}, 45%, ${40 + (k % 3) * 10}%)`, position: 'relative', overflow: 'hidden', outline: k === 0 && tap > 0 ? `${6 * tap}px solid ${YEL}` : undefined}}>
								{k === 0 && <BakeryPhoto />}
							</div>
						))}
					</div>
					{f >= 40 && <div style={{position: 'absolute', left: 90, top: 230, width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.35)', transform: `scale(${0.6 + tap})`, opacity: 1 - tap * 0.6}} />}
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// 67. …a photo: 1901, the bakery. And in the crowd — you. (фото@15, тысяча девятьсот первый@34, булочная@72, ты@125)
export const S67: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(67);
	const zoom = interpolate(f, [98, 124], [0, 1], {...clamp, easing: E});
	const ring = f >= 122 ? pop(f, 122, 10) : 0;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: 0, z: lerp(f, 0, len, 0, 40)}} bg="#c9d4e0" far={<Far><Bedside f={f} /></Far>} blur={12} vig={0.7} />
			<Phone x={540} y={940} w={620} rot={-1}>
				<div style={{position: 'absolute', inset: 0, background: '#000'}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 110, bottom: 110}}>
						<BakeryPhoto zoom={zoom} />
					</div>
					{f >= 30 && (
						<div style={{position: 'absolute', left: 24, bottom: 130, background: 'rgba(0,0,0,0.6)', color: '#ffd34a', fontFamily: 'monospace', fontWeight: 700, fontSize: 34, padding: '6px 14px', borderRadius: 8, transform: `scale(${pop(f, 30, 12)})`, transformOrigin: '0 100%'}}>1901</div>
					)}
					{ring > 0 && <div style={{position: 'absolute', left: 190, top: 90, width: 280, height: 330, border: `10px solid ${RED}`, borderRadius: '50%', transform: `scale(${ring}) rotate(-6deg)`}} />}
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// 68. You look at the photo and smile. A hundred years — one charge. (улыбаешься@44, сто лет@75, один заряд@105)
export const S68: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(68);
	const title = f >= 72 ? pop(f, 72, 12) : 0;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -30, 30), y: 0, z: lerp(f, 0, len, 40, 140)}} bg="#dfe4ea" far={<Far z={-900}><ModernPillow /></Far>} blur={4} vig={0.6}>
				<Lay z={-420} box={[60, 260, 960, 1200]}>
					<Bust kind="teen" id="w1home2" colors={YOU} x={540} y={760} scale={2.3} face={f > 40 ? {eyes: 'happy', mouth: 'smile', brows: 'neutral', blush: true, glasses: false} : {eyes: 'open', mouth: 'flat', brows: 'neutral', blush: false, glasses: false, look: [0, 0.6]}} />
					<Glow id="w1scr" x={540} y={1000} r={500} color="#7fb2ff" o={0.35} />
				</Lay>
				<Lay z={-300} box={[-300, 1000, 1680, 1400]}>
					<Duvet />
				</Lay>
			</Set3D>
			{title > 0 && (
				<div style={{position: 'absolute', left: 540, top: 1500, transform: `translate(-50%,-50%) scale(${title})`, display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(14,14,18,0.9)', borderRadius: 28, padding: '20px 36px', fontFamily: HEAVY, fontWeight: 900, fontSize: 64, color: '#fff', whiteSpace: 'nowrap'}}>
					100 ЛЕТ =
					<Battery pct={100} w={130} h={66} stroke={6} color={GREEN} />
					1 ЗАРЯД
				</div>
			)}
		</AbsoluteFill>
	);
};

// 69. The end card: which year would you fall into? Write in the comments. Early access — in my Telegram (link in the
// profile header). (какой год@19, комментариях@57, ранний доступ@87, ТГК@161, шапке@186)
const DECADES: {y: number; icon: string}[] = [
	{y: 1901, icon: '🐎'},
	{y: 1911, icon: '🚋'},
	{y: 1921, icon: '🚩'},
	{y: 1931, icon: '📻'},
	{y: 1941, icon: '⭐'},
	{y: 1951, icon: '📺'},
	{y: 1961, icon: '🚀'},
	{y: 1971, icon: '☎️'},
	{y: 1981, icon: '📼'},
	{y: 1991, icon: '📱'},
];
export const S69: React.FC = () => {
	const f = useCurrentFrame();
	const q = pop(f, 6, 12);
	const promo = f >= 84 ? pop(f, 84, 12) : 0;
	const pulse = 1 + 0.04 * Math.sin(f / 6);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #2a2f55 0%, #0d1028 58%, #04050c 100%)', fontFamily: HEAVY, fontWeight: 900}}>
			<div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', transform: `scale(${q})`}}>
				<div style={{fontSize: 70, color: '#fff', lineHeight: 1.1}}>А В КАКОЙ ГОД</div>
				<div style={{fontSize: 70, color: YEL, lineHeight: 1.1}}>ПОПАЛ БЫ ТЫ?</div>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 470, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18}}>
				{DECADES.map((d, k) => {
					const p = pop(f, 12 + k * 4, 12);
					return (
						<div key={d.y} style={{background: 'rgba(255,255,255,0.08)', border: '4px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '14px 0 10px', textAlign: 'center', transform: `scale(${p})`}}>
							<div style={{fontSize: 64, fontFamily: "'Noto Color Emoji', sans-serif", lineHeight: 1.1}}>{d.icon}</div>
							<div style={{fontSize: 34, color: '#fff', marginTop: 6}}>{d.y}</div>
						</div>
					);
				})}
			</div>
			{f >= 48 && (
				<div style={{position: 'absolute', left: 540, top: 930, transform: `translate(-50%,-50%) scale(${pop(f, 48, 12)})`, background: '#fff', color: '#111', borderRadius: 26, padding: '16px 40px', fontSize: 50, whiteSpace: 'nowrap'}}>
					ПИШИ В КОММЕНТАРИЯХ ↓
				</div>
			)}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(540,${1150 + (1 - pop(f, 30, 12)) * 400})`}>
					<Bust kind="teen" id="w1end" colors={YOU} scale={1.25} face={{eyes: 'happy', mouth: 'grin', brows: 'raised', blush: true, glasses: false}} tilt={Math.sin(f / 14) * 4} />
				</g>
			</svg>
			{promo > 0 && (
				<div style={{position: 'absolute', left: 540, top: 1500, transform: `translate(-50%,-50%) scale(${promo * pulse})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 22, background: '#2aa3e0', color: '#fff', borderRadius: 60, padding: '22px 46px', fontSize: 52, boxShadow: '0 16px 40px rgba(42,163,224,0.45)'}}>
						<svg width={64} height={64} viewBox="0 0 24 24">
							<circle cx={12} cy={12} r={12} fill="#fff" />
							<path d="M 5.5,11.6 L 17.5,7 Q 18.4,6.7 18.1,7.8 L 16.1,16.9 Q 15.8,17.9 15,17.3 L 12,15.1 L 10.5,16.5 Q 10.2,16.8 10.1,16.3 L 10.3,13.6 L 15.2,9.2 Q 15.5,8.9 15,9.1 L 9,12.9 L 6.1,12 Q 5,11.7 5.5,11.6 Z" fill="#2aa3e0" />
						</svg>
						РАННИЙ ДОСТУП — В ТГК
					</div>
					<div style={{display: 'inline-block', fontSize: 40, color: '#fff', marginTop: 18, fontFamily: SANS, fontWeight: 800, background: 'rgba(10,12,24,0.88)', borderRadius: 20, padding: '8px 26px'}}>ссылка в шапке профиля</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

export const _KEEP3 = {rnd, Tag, CALM};
