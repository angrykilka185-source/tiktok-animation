// «Что будет, если ты попадёшь в XX век» — a standalone film (~5.5 min). 69 shots on the timeline of src/w1/timeline.ts
// (= the voice, scripts/fit-voiceover.py --part w1). You wake up in 1901 with your phone at 100 % and a message:
// every ten per cent is ten years forward; when the phone dies, you go home. Ten decades, a hundred years, one charge.
// Shot in the «3D camera» of «Ты с какого района?»: flat layers at real depths, the background soft (depth of field).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, lerp, pop, seg} from '../anim';
import {Bubble} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {Far, Lay, personBox, Set3D} from '../components/Layers3D';
import {Jump} from './hud';
import {Arrive, Fact, Folk, Glow, GREEN, HandPhone, HEAVY, Phone, RED, rnd, SANS, scr, SERIF, Stamp, Tag, YEL, You, YOU, zoomT} from './kit';
import {Bakery, Cab, Calendar, CrowdRow, GY, House, KeroseneLamp, Room1901, Sky, Street, StreetLamp, WaterCart} from './old';
import {OldTown} from './streets';
import {SHOTS} from './timeline';

export * from './scenes2';

const L = (n: number) => SHOTS[n - 1].duration;
const E = Easing.inOut(Easing.sin);
const WIDE: Face = {eyes: 'wide', pupil: 0.6, brows: 'raised', mouth: 'o', blush: false};
const CALM: Face = {eyes: 'open', brows: 'neutral', mouth: 'flat', blush: false};
const SMILE: Face = {eyes: 'open', brows: 'neutral', mouth: 'smile', blush: false};
const LAUGH: Face = {eyes: 'happy', brows: 'raised', mouth: 'grin', blush: false};

// ========================================================== shot helpers =====
// the old street as the far set
const TownFar: React.FC<{era: 1901 | 1911 | 1921; f: number; dusk?: number}> = ({era, f, dusk}) => (
	<Far>
		<OldTown era={era} f={f} dusk={dusk} />
	</Far>
);
// the phone held in front of you (screen space) over a blurred place
const PhoneOver: React.FC<{f: number; len: number; far: React.ReactNode; bg: string; w?: number; y?: number; rot?: number; children: React.ReactNode}> = ({f, len, far, bg, w = 560, y = 900, rot = -2, children}) => {
	const rise = lerp(f, 0, 14, 260, 0, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 40, E), y: 0, z: lerp(f, 0, len, 0, 90, E)}} bg={bg} far={far} blur={10} vig={0.7} />
			<AbsoluteFill style={{background: 'rgba(8,10,18,0.35)'}} />
			<Phone x={540} y={y + rise} w={w} rot={rot + lerp(f, 0, len, 0, 2)}>
				{children}
			</Phone>
		</AbsoluteFill>
	);
};
// the top status line of your phone: no network, the battery
const PhoneStatus: React.FC<{pct: number; time?: string}> = ({pct, time = '7:03'}) => (
	<div style={{position: 'absolute', left: 40, right: 34, top: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#fff', zIndex: 3}}>
		<span>{time}</span>
		<span style={{display: 'flex', alignItems: 'center', gap: 10}}>
			<span style={{fontSize: 22, color: '#ffb3ad'}}>Нет сети</span>
			<span style={{width: 44, height: 22, border: '3px solid #fff', borderRadius: 6, padding: 2, boxSizing: 'border-box', display: 'flex'}}>
				<span style={{width: `${pct}%`, background: pct > 20 ? '#fff' : RED, borderRadius: 2}} />
			</span>
			<span style={{fontSize: 22}}>{pct}%</span>
		</span>
	</div>
);
// a crossed-out icon (no motors, no music)
const NoIcon: React.FC<{f: number; at: number; x: number; y: number; kind: 'car' | 'note'}> = ({f, at, x, y, kind}) => {
	if (f < at) return null;
	const p = pop(f, at, 12);
	return (
		<svg width={220} height={220} viewBox="-110 -110 220 220" style={{position: 'absolute', left: x - 110, top: y - 110, transform: `scale(${p})`}}>
			<circle r={96} fill="rgba(14,14,18,0.86)" stroke="#fff" strokeWidth={8} />
			{kind === 'car' ? (
				<g fill="#fff">
					<path d="M -60,20 L -50,-10 Q -40,-34 -10,-34 L 20,-34 Q 44,-34 52,-10 L 62,20 Z" />
					<rect x={-66} y={14} width={132} height={26} rx={8} />
					<circle cx={-38} cy={44} r={14} fill="#1d1d24" stroke="#fff" strokeWidth={6} />
					<circle cx={38} cy={44} r={14} fill="#1d1d24" stroke="#fff" strokeWidth={6} />
				</g>
			) : (
				<g fill="#fff">
					<ellipse cx={-24} cy={38} rx={22} ry={16} transform="rotate(-20 -24 38)" />
					<ellipse cx={34} cy={24} rx={22} ry={16} transform="rotate(-20 34 24)" />
					<rect x={-6} y={-50} width={8} height={88} />
					<rect x={52} y={-64} width={8} height={88} />
					<path d="M -6,-50 L 60,-64 L 60,-40 L -6,-26 Z" />
				</g>
			)}
			<line x1={-70} y1={-70} x2={70} y2={70} stroke={RED} strokeWidth={16} strokeLinecap="round" />
		</svg>
	);
};

// ===================================================================== 1901 ==
// 1. You wake up to the clatter of hooves: horses instead of cars outside, kerosene instead of street lights.
// (просыпаешься@9, копыт@45, лошади@101, керосин@155)
const Pillow: React.FC = () => (
	<g>
		<rect x={-600} y={-600} width={2300} height={3200} fill="#e9e1cf" />
		{Array.from({length: 18}).map((_, k) => (
			<rect key={k} x={-600} y={-600 + k * 180} width={2300} height={6} fill="#d8ccb2" />
		))}
		<rect x={150} y={360} width={780} height={520} rx={120} fill="#f7f3ea" />
		<path d="M 190,620 Q 540,560 890,620" stroke="#e2dccd" strokeWidth={10} fill="none" />
	</g>
);
const Quilt: React.FC<{lift: number}> = ({lift}) => (
	<g transform={`translate(0,${lift})`}>
		<path d="M -300,1180 Q 540,1080 1380,1180 L 1380,2400 L -300,2400 Z" fill="#c9a227" />
		{Array.from({length: 6}).map((_, r) =>
			Array.from({length: 8}).map((__, c) => (
				<rect key={`${r}-${c}`} x={-260 + c * 210} y={1190 + r * 210} width={200} height={200} fill={['#a8402e', '#4a6a8a', '#7a8a4a', '#8a4a6a', '#c9783a', '#4a7a6a'][(r * 3 + c) % 6]} opacity={0.9} />
			)),
		)}
		<path d="M -300,1180 Q 540,1080 1380,1180" stroke="#f4ecd8" strokeWidth={22} fill="none" />
	</g>
);
const WindowFrame: React.FC = () => (
	<g>
		<path d="M -600,-600 L 1700,-600 L 1700,2600 L -600,2600 Z M 140,240 L 940,240 L 940,1340 L 140,1340 Z" fill="#8a5e3a" fillRule="evenodd" />
		{Array.from({length: 24}).map((_, k) => (
			<rect key={k} x={-600} y={-560 + k * 90} width={2300} height={10} fill="#6e4a2c" opacity={0.6} />
		))}
		<rect x={120} y={220} width={840} height={30} fill="#5a3a22" />
		<rect x={120} y={1330} width={840} height={40} fill="#5a3a22" />
		<rect x={530} y={240} width={20} height={1100} fill="#5a3a22" />
		<rect x={140} y={760} width={800} height={18} fill="#5a3a22" />
		<rect x={80} y={1360} width={920} height={60} fill="#6a4628" />
		<path d="M 140,240 C 220,600 160,1000 230,1340 L 140,1340 Z" fill="#c9bca2" />
		<path d="M 940,240 C 860,600 920,1000 850,1340 L 940,1340 Z" fill="#c9bca2" />
		{/* a geranium on the sill */}
		<g transform="translate(760,1360)">
			<path d="M -60,0 L -46,-110 L 46,-110 L 60,0 Z" fill="#b8643a" />
			{[-40, 0, 40, -20, 24].map((dx, k) => (
				<circle key={k} cx={dx} cy={-150 - (k % 2) * 40} r={30} fill="#3a7a3a" />
			))}
			{[-30, 20, 0].map((dx, k) => (
				<circle key={k} cx={dx} cy={-200 - k * 18} r={18} fill="#d8303a" />
			))}
		</g>
	</g>
);
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [60, 124]);
	if (i === 0) {
		const open = t < 10 ? 1 : t < 14 ? 0.5 : 0;
		const look = interpolate(t, [34, 44], [0, -0.85], clamp);
		const face: Face = t < 36 ? {eyes: 'open', blink: open, brows: 'neutral', mouth: 'flat', blush: false, look: [look, 0], glasses: false} : {...WIDE, look: [-0.85, -0.1], glasses: false};
		return (
			<Set3D cam={{x: lerp(t, 0, 60, 20, -30), y: 0, z: lerp(t, 0, 60, 60, 160)}} bg="#e9e1cf" far={<Far z={-900}><Pillow /></Far>} blur={2} vig={0.62}>
				<Lay z={-420} box={[60, 260, 960, 1200]}>
					<Bust kind="teen" id="w1wake" colors={YOU} x={540} y={760} scale={2.3} face={face} tilt={lerp(t, 30, 44, 0, -8)} turn={look} />
				</Lay>
				<Lay z={-300} box={[-300, 1000, 1680, 1400]}>
					<Quilt lift={0} />
				</Lay>
			</Set3D>
		);
	}
	if (i === 1) {
		const len = 64;
		const cabX = lerp(t, 6, len, -900, 1500, Easing.linear);
		return (
			<Set3D cam={{x: lerp(t, 0, len, -40, 40), y: 0, z: lerp(t, 0, len, 0, 80)}} bg="#a9c3d6" far={<TownFar era={1901} f={t} />} blur={3} vig={0.6}>
				<Lay z={-1000} box={[-700, 900, 2500, 900]}>
					<g transform={`translate(${cabX},1500) scale(1.25)`}>
						<Cab id="w1c1" phase={t * 0.42} />
					</g>
				</Lay>
				<Lay z={-200} box={[-600, -600, 2300, 3200]}>
					<WindowFrame />
				</Lay>
			</Set3D>
		);
	}
	const len = 53;
	return (
		<Set3D cam={{x: 0, y: lerp(t, 0, len, 260, -120, E), z: lerp(t, 0, len, 40, 120)}} bg="#a9c3d6" far={<TownFar era={1901} f={t} dusk={0.25} />} blur={6} vig={0.66}>
			<Lay z={-260} box={[200, -300, 700, 2400]}>
				<g transform="translate(540,1900) scale(1.9)">
					<StreetLamp x={0} y={0} kind="kerosene" lit={interpolate(t, [28, 36], [0.4, 1], clamp)} id="w1l1" />
				</g>
			</Lay>
		</Set3D>
	);
};

// 2. The calendar on the wall: 1901 — the first year of the 20th century. (тысяча@40, первый@67, двадцатого@108)
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(2);
	const hi = interpolate(f, [40, 52], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, 120, -330, E), y: lerp(f, 0, len, 40, -560, E), z: lerp(f, 0, len, 0, 360, E)}} bg="#9a6e44" far={<Far z={-1300}><Room1901 id="w1r2" calendar={false} /></Far>} blur={4} vig={0.62}>
				<Lay z={-700} box={[120, 300, 320, 400]}>
					<Calendar x={150} y={330} hi={hi} />
				</Lay>
				<Lay z={-220} box={personBox(860, 2050, 1.25)}>
					<You id="w1you2" x={860} y={2050} scale={1.25} back breathe={f} />
				</Lay>
			</Set3D>
			<Stamp f={f} at={104} x={540} y={1460} text="XX ВЕК" sub="ПЕРВЫЙ ГОД" rot={-6} color={YEL} size={120} />
		</AbsoluteFill>
	);
};

// 3. Your phone: 100 % and one message without a sender. (телефон@30, сто@51, сообщение@106)
const LockScreen: React.FC<{f: number; pct: number; big: number; notif: number}> = ({f, pct, big, notif}) => (
	<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #3a4a7a 0%, #161d38 55%, #070a14 100%)', fontFamily: SANS, color: '#fff'}}>
		<PhoneStatus pct={pct} />
		<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
			<div style={{fontSize: 30, fontWeight: 700, opacity: 0.85}}>??.??.????</div>
			<div style={{fontSize: 150, fontWeight: 800, lineHeight: 1.05}}>7:03</div>
		</div>
		{big > 0 && (
			<div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${big})`}}>
				<div style={{width: 250, height: 120, border: '9px solid #fff', borderRadius: 26, padding: 10, boxSizing: 'border-box', position: 'relative', boxShadow: `0 0 50px ${GREEN}`}}>
					<div style={{width: '100%', height: '100%', background: GREEN, borderRadius: 12}} />
					<div style={{position: 'absolute', right: -26, top: 34, width: 16, height: 36, background: '#fff', borderRadius: '0 8px 8px 0'}} />
				</div>
				<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 96, color: GREEN, marginTop: 10}}>100%</div>
			</div>
		)}
		<div style={{position: 'absolute', left: 22, right: 22, top: 250, transform: `translateY(${(1 - notif) * -260}px)`, opacity: notif, background: 'rgba(245,245,250,0.96)', borderRadius: 30, padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'center', boxSizing: 'border-box'}}>
			<div style={{width: 80, height: 80, borderRadius: 40, background: '#2a2a33', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontWeight: 900, fontSize: 46}}>?</div>
			<div style={{flex: 1}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<span style={{fontWeight: 900, fontSize: 32, color: '#111'}}>Без отправителя</span>
					<span style={{fontSize: 22, color: '#666', fontWeight: 600}}>сейчас</span>
				</div>
				<div style={{fontWeight: 600, fontSize: 27, color: '#444', marginTop: 4}}>1 новое сообщение</div>
			</div>
		</div>
		<div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontSize: 24, fontWeight: 700, opacity: 0.6 + 0.2 * Math.sin(f / 9)}}>смахните вверх</div>
	</div>
);
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(3);
	return (
		<PhoneOver f={f} len={len} far={<Far z={-1300}><Room1901 id="w1r3" /></Far>} bg="#9a6e44">
			<LockScreen f={f} pct={100} big={f >= 51 ? pop(f, 51, 11) * interpolate(f, [100, 108], [1, 0], clamp) : 0} notif={lerp(f, 104, 116, 0, 1, Easing.out(Easing.back(1.4)))} />
		</PhoneOver>
	);
};

// 4. The message, word by word as the voice reads it.
const MSG: [number, string][] = [
	[6, 'Каждые'],
	[17, 'десять'],
	[29, 'процентов —'],
	[51, 'десять'],
	[63, 'лет'],
	[70, 'вперёд.'],
	[90, 'Сядет'],
	[100, 'телефон —'],
	[122, 'вернёшься'],
	[138, 'домой.'],
];
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(4);
	const words = MSG.filter(([at]) => f >= at - 2).map(([, w]) => w);
	return (
		<PhoneOver f={f} len={len} far={<Far z={-1300}><Room1901 id="w1r4" /></Far>} bg="#9a6e44" w={600} y={940}>
			<div style={{position: 'absolute', inset: 0, background: '#0f1115', fontFamily: SANS}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 200, background: '#1b1d22', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 18, boxSizing: 'border-box'}}>
					<div style={{width: 84, height: 84, borderRadius: 42, background: '#2a2a33', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 46}}>?</div>
					<div>
						<div style={{fontWeight: 900, fontSize: 38, color: '#f2f2f2'}}>Без отправителя</div>
						<div style={{fontWeight: 600, fontSize: 24, color: '#8b93a3'}}>номер скрыт</div>
					</div>
				</div>
				<PhoneStatus pct={100} />
				<div style={{position: 'absolute', top: 236, width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#6b7280'}}>сегодня</div>
				<div style={{position: 'absolute', left: 24, top: 290, maxWidth: 470, background: '#262a33', borderRadius: '30px 30px 30px 8px', padding: '20px 26px', fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.2, transform: `scale(${pop(f, 2, 12)})`, transformOrigin: '0% 100%'}}>
					{words.length ? words.join(' ') : '…'}
				</div>
			</div>
		</PhoneOver>
	);
};

// 5. The title: a hundred years, one phone. Let's go. (сто@4, один@30, поехали@62)
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(5);
	const bar = lerp(f, 6, 34, 0, 1, Easing.out(Easing.cubic));
	const go = interpolate(f, [62, len - 4], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const t1 = pop(f, 2, 12);
	const ph = pop(f, 30, 11);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2a2f55 0%, #0d1028 58%, #04050c 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + go * 3.5})`, transformOrigin: '160px 1240px'}}>
				<div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${t1})`}}>
					<div style={{fontSize: 64, color: '#fff', lineHeight: 1.1}}>ЧТО БУДЕТ, ЕСЛИ ТЫ</div>
					<div style={{fontSize: 64, color: '#fff', lineHeight: 1.1}}>ПОПАДЁШЬ</div>
					<div style={{fontSize: 190, color: YEL, lineHeight: 1, marginTop: 10, textShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>В XX ВЕК</div>
				</div>
				<svg width={1080} height={400} style={{position: 'absolute', left: 0, top: 1100}}>
					<line x1={160} y1={140} x2={160 + 760 * bar} y2={140} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
					{Array.from({length: 11}).map((_, k) =>
						bar * 10 >= k ? (
							<g key={k}>
								<circle cx={160 + k * 76} cy={140} r={k === 0 || k === 10 ? 22 : 13} fill={k === 0 ? YEL : '#fff'} />
								{(k === 0 || k === 10) && (
									<text x={160 + k * 76} y={220} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={48} fill="#fff">
										{1901 + k * 10}
									</text>
								)}
							</g>
						) : null,
					)}
				</svg>
				{f >= 30 && (
					<div style={{position: 'absolute', left: 540, top: 1500, transform: `translate(-50%,0) scale(${ph})`, display: 'flex', alignItems: 'center', gap: 24, fontFamily: HEAVY, fontWeight: 900, fontSize: 56, color: '#fff'}}>
						<div style={{width: 64, height: 120, borderRadius: 14, border: '7px solid #fff', boxSizing: 'border-box', padding: 6, display: 'flex', alignItems: 'flex-end'}}>
							<div style={{width: '100%', height: '100%', background: GREEN, borderRadius: 4}} />
						</div>
						1 ТЕЛЕФОН · 100%
					</div>
				)}
			</div>
			{go > 0.5 && <AbsoluteFill style={{background: '#fffaf0', opacity: (go - 0.5) * 2}} />}
		</AbsoluteFill>
	);
};

// 6. The first thing you hear is silence: no motors, no music. Wheels on cobblestones and the peddlers' cries.
// (тишина@44, моторов@71, музыки@97, колёса@129, крики@165)
const Peddler: React.FC<{x: number; y: number; s: number; f: number; id: string}> = ({x, y, s, f, id}) => (
	<g>
		<Person kind="dad" id={id} plain colors={{top: '#b8402e', topDark: '#b8402e', pants: '#3a3530', hair: '#5a3a28'}} boots="#1a1a1c" apron="#f4f0e8" moustache="#5a3a28" x={x} y={y} scale={s} walk={f * 0.25} armL={{target: [-130, -1190], bend: 1}} armR={{target: [130, -1190], bend: -1}} face={{eyes: 'open', mouth: Math.floor(f / 6) % 2 ? 'open' : 'o', brows: 'raised', blush: false}} />
		<g transform={`translate(${x},${y - 1225 * s}) scale(${s})`}>
			<ellipse cx={0} cy={0} rx={190} ry={30} fill="#8a5a34" />
			{[-120, -60, 0, 60, 120].map((dx, k) => (
				<path key={k} d={`M ${dx - 34},-6 A 34,30 0 0 1 ${dx + 34},-6 Z`} fill={k % 2 ? '#c9843a' : '#b8743a'} />
			))}
		</g>
	</g>
);
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(6);
	const cabX = lerp(f, 118, 200, -1100, 1700, Easing.linear);
	const pedX = lerp(f, 150, len, 1350, 880, Easing.out(Easing.cubic));
	const look = Math.sin(f / 26) * 0.6;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -60, 60, E), y: 0, z: lerp(f, 0, len, 0, 130, E)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
				<Lay z={-1000} box={[-700, 700, 2500, 800]}>
					<StreetLamp x={-120} y={1300} kind="kerosene" lit={0.5} id="w1s6a" />
					<StreetLamp x={1210} y={1300} kind="kerosene" lit={0.5} id="w1s6b" />
					<CrowdRow era={1901} x0={-60} dx={210} n={6} y={1320} s={0.32} id="w1s6c" f={f} />
				</Lay>
				<Lay z={-650} box={[-700, 900, 2500, 800]}>
					{f >= 118 && (
						<g transform={`translate(${cabX},1560) scale(1.15)`}>
							<Cab id="w1c6" phase={f * 0.42} />
						</g>
					)}
				</Lay>
				<Lay z={-420} box={personBox(pedX, 1820, 0.62, 700)}>{f >= 150 && <Peddler x={pedX} y={1820} s={0.62} f={f} id="w1ped" />}</Lay>
				<Lay z={-260} box={personBox(330, 1950, 1.0)}>
					<You id="w1you6" x={330} y={1950} scale={1.0} breathe={f} headTurn={look} face={{...CALM, eyes: 'wide', pupil: 0.8, look: [look, -0.1]}} />
				</Lay>
			</Set3D>
			<NoIcon f={f} at={71} x={330} y={330} kind="car" />
			<NoIcon f={f} at={97} x={750} y={330} kind="note" />
			<Bubble x={880} y={1060} text="Калачи горячие!" from={170} to={len} tail="right" />
		</AbsoluteFill>
	);
};

// 7. Caps, boots and long skirts around you — and everyone stares at your hoodie like at a foreigner.
// (картузы@23, сапоги@43, юбки@65, на тебя@104, иностранца@146)
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(7);
	const turn = interpolate(f, [104, 116], [0, 1], clamp);
	const youX = lerp(f, 100, 140, 1500, 1010, Easing.out(Easing.cubic));
	const camX = lerp(f, 0, 100, -160, 40, E) + lerp(f, 100, len, 0, 90, E);
	const cam7 = {x: camX, y: 0, z: lerp(f, 0, len, 40, 120, E)};
	const capP = scr(cam7, -420, 160, 905);
	const bootP = scr(cam7, -420, 182, 1770);
	const skirtP = scr(cam7, -420, 440, 1640);
	const people: {who: 'm' | 'f' | 'k'; n: number; x: number}[] = [
		{who: 'm', n: 0, x: 160},
		{who: 'f', n: 1, x: 420},
		{who: 'm', n: 3, x: 640},
		{who: 'k', n: 2, x: 820},
	];
	return (
		<AbsoluteFill>
			<Set3D cam={cam7} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
				<Lay z={-900} box={[-700, 900, 2500, 600]}>
					<CrowdRow era={1901} x0={-200} dx={230} n={8} y={1340} s={0.36} id="w1s7c" seed={3} f={f} look={() => turn * 0.8} />
				</Lay>
				<Lay z={-420} box={[-300, 700, 1500, 1200]}>
					{people.map((p, k) => (
						<Folk key={k} era={1901} n={p.n} who={p.who} id={`w1s7p${k}`} x={p.x} y={1800} scale={p.who === 'k' ? 0.62 : 0.78} breathe={f + k * 11} headTurn={turn * 0.9} face={turn > 0.5 ? {...WIDE, look: [0.9, 0]} : {...CALM, look: [0.2 - k * 0.1, 0]}} armR={p.who === 'k' && f >= 146 ? {target: [330, -600], bend: -1} : undefined} />
					))}
				</Lay>
				<Lay z={-260} box={personBox(youX, 1960, 1.0)}>
					{f >= 100 && <You id="w1you7" x={youX} y={1960} scale={1.0} breathe={f} walk={f < 140 ? f * 0.3 : undefined} headTurn={-0.5} face={{...CALM, brows: 'worried', look: [-0.7, 0]}} />}
				</Lay>
			</Set3D>
			<Tag f={f} at={23} x={capP.x} y={capP.y} tx={capP.x + 150} ty={560} text="КАРТУЗ" />
			<Tag f={f} at={43} x={bootP.x} y={bootP.y} tx={bootP.x + 170} ty={1560} text="САПОГИ" />
			<Tag f={f} at={65} x={skirtP.x} y={skirtP.y} tx={skirtP.x + 230} ty={1460} text="ДЛИННЫЕ ЮБКИ" />
		</AbsoluteFill>
	);
};

// 8. The signs use unusual letters: «ять» and the hard sign at the end of words — they'll be abolished in 1918.
// (ять@69, твёрдый@79, отменят@148, восемнадцатом@174)
const SIGN = ['Х', 'Л', 'Ѣ', 'Б', 'Ъ'];
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(8);
	const morph = interpolate(f, [150, 168], [0, 1], clamp);
	const ring = (at: number) => (f >= at ? pop(f, at, 10) : 0);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -50, 50, E), y: 0, z: lerp(f, 0, len, 0, 90, E)}} bg="#a9c3d6" far={<Far z={-1600}><g transform="translate(540,960) scale(1.6) translate(-300,-1000)"><OldTown era={1901} f={f} /></g></Far>} blur={9} vig={0.62}>
				<Lay z={-300} box={[-100, 560, 1280, 560]}>
					<rect x={-40} y={600} width={1160} height={460} rx={16} fill="#1f3a2a" stroke="#c9a54a" strokeWidth={14} />
					<rect x={-10} y={630} width={1100} height={400} rx={8} fill="none" stroke="#c9a54a" strokeWidth={4} opacity={0.6} />
				</Lay>
			</Set3D>
			<div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', gap: 6, fontFamily: SERIF, fontWeight: 700, fontSize: 250, lineHeight: 1, color: '#f0d27a', textShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
				{SIGN.map((ch, k) => {
					const isYat = k === 2;
					const isEr = k === 4;
					const rr = isYat ? ring(69) : isEr ? ring(79) : 0;
					return (
						<div key={k} style={{position: 'relative', width: isEr ? 200 * (1 - morph) + 1 : 200, textAlign: 'center', opacity: isEr ? 1 - morph : 1}}>
							{isYat ? (
								<>
									<span style={{opacity: 1 - morph}}>Ѣ</span>
									<span style={{position: 'absolute', left: 0, right: 0, top: 0, opacity: morph, color: '#fff'}}>Е</span>
								</>
							) : (
								ch
							)}
							{rr > 0 && <div style={{position: 'absolute', left: -20, right: -20, top: -10, bottom: -20, border: `10px solid ${RED}`, borderRadius: '50%', transform: `scale(${rr}) rotate(-6deg)`, opacity: 1 - morph * 0.6}} />}
						</div>
					);
				})}
			</div>
			<Tag f={f} at={70} x={520} y={960} tx={330} ty={1500} text="«ЯТЬ»" />
			<Tag f={f} at={84} x={860} y={960} tx={760} ty={1500} text="ТВЁРДЫЙ ЗНАК" />
			<Stamp f={f} at={150} x={540} y={470} text="1918" sub="РЕФОРМА ОРФОГРАФИИ" rot={-5} />
		</AbsoluteFill>
	);
};

// 9. The phone says «Нет сети» — and there won't be one for 90 more years. (нет сети@32, девяносто@91)
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(9);
	const raise = lerp(f, 0, 16, 0, 1, Easing.out(Easing.cubic));
	const sway = Math.sin(f / 7) * 40 * raise;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, 40, -40, E), y: 0, z: lerp(f, 0, len, 60, 160, E)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
				<Lay z={-260} box={personBox(560, 2080, 1.12)}>
					<You id="w1you9" x={560} y={2080} scale={1.12} breathe={f} headTilt={-6} face={{...CALM, brows: 'worried', look: [0.4, -0.9]}} armR={{target: [150 + sway, -1080 - 160 * raise], bend: -1}} itemR={<HandPhone s={1.3} />} />
				</Lay>
			</Set3D>
			{f >= 26 && (
				<div style={{position: 'absolute', left: 540, top: 420, transform: `translate(-50%,-50%) scale(${pop(f, 26, 12)})`, background: 'rgba(14,14,18,0.92)', border: `5px solid ${RED}`, borderRadius: 24, padding: '18px 34px', display: 'flex', alignItems: 'center', gap: 22, fontFamily: SANS, fontWeight: 900, fontSize: 54, color: '#fff'}}>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 6}}>
						{[16, 26, 36, 46].map((h) => (
							<div key={h} style={{width: 11, height: h, background: '#4a4f5c', borderRadius: 3}} />
						))}
					</div>
					Нет сети
				</div>
			)}
			<Fact f={f} at={92} text="СЛЕДУЮЩАЯ СЕТЬ — ЧЕРЕЗ 90 ЛЕТ" y={560} />
		</AbsoluteFill>
	);
};

// 10. Light comes from kerosene lamps; electricity only in rich houses and on the main streets of big cities.
// (керосиновых@25, электричество@66, богатых@110, главных@144)
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(10);
	const {i, t} = seg(f, [62]);
	if (i === 0) {
		return (
			<Set3D cam={{x: lerp(t, 0, 62, -30, 30), y: 0, z: lerp(t, 0, 62, 120, 40)}} bg="#2a1e18" far={<Far z={-1200}><Room1901 id="w1r10" lamp={0} /></Far>} blur={6} vig={0.72}>
				<rect x={0} y={0} width={0} height={0} />
				<Lay z={-240} box={[140, 500, 800, 1300]}>
					<KeroseneLamp x={540} y={1500} s={2.6} flame={interpolate(t, [10, 30], [0.15, 1], clamp)} id="w1k10" />
				</Lay>
			</Set3D>
		);
	}
	const lamps = interpolate(t, [80, 92], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len - 62, -120, 80, E), y: 0, z: lerp(t, 0, len - 62, 0, 110, E)}} bg="#2a2a50" far={<Far><Sky top="#1a1a3a" bottom="#c8784a" /><House x={-440} w={460} floors={2} color="#6a5e4e" lit={0.8} seed={5} /><House x={30} w={420} floors={2} color="#5e5244" lit={0.7} seed={6} shop={{text: 'ЛАВКА', bg: '#2a2a2a'}} /><rect x={-600} y={-600} width={1100} height={3200} fill="#141a3a" opacity={0.3} /><Glow id="w1man" x={1000} y={760} r={700} color="#fff6d8" o={0.55} /><House x={500} w={1000} floors={3} color="#9a8e78" trim="#d8ccb0" arch lit={1} litColor="#fffbe8" seed={7} /><Street dark={0.45} /></Far>} vig={0.62}>
				<Lay z={-700} box={[-600, 400, 2300, 1000]}>
					<StreetLamp x={-180} y={1330} kind="kerosene" lit={0.9} id="w1s10a" />
					<StreetLamp x={640} y={1330} kind="electric" lit={lamps} id="w1s10b" />
					<StreetLamp x={1240} y={1330} kind="electric" lit={lamps} id="w1s10c" />
				</Lay>
				<Lay z={-280} box={personBox(240, 1950, 0.98)}>
					<You id="w1you10" x={240} y={1950} scale={0.98} breathe={t} back headTurn={0.3} />
				</Lay>
			</Set3D>
			<Tag f={t} at={6} x={800} y={760} tx={760} ty={480} text="ЭЛЕКТРИЧЕСТВО" />
			<Tag f={t} at={82} x={780} y={940} tx={860} ty={1180} text="ГЛАВНЫЕ УЛИЦЫ" color={YEL} />
		</AbsoluteFill>
	);
};

// 11. Water is carried in buckets — or bought from the water carrier. (вёдрами@24, водовоза@73)
const Yoke: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => {
	const sw = Math.sin(f / 5) * 4;
	return (
		<g transform={`translate(${x},${y - 790 * s}) scale(${s})`}>
			<path d="M -300,40 Q 0,-30 300,40" stroke="#7a5232" strokeWidth={22} fill="none" strokeLinecap="round" />
			{[-1, 1].map((d) => (
				<g key={d} transform={`translate(${d * 290},40) rotate(${sw * d})`}>
					<line x1={0} y1={0} x2={0} y2={200} stroke="#3a2a1e" strokeWidth={6} />
					<path d="M -70,200 L 70,200 L 56,340 L -56,340 Z" fill="#8a8f96" />
					<ellipse cx={0} cy={200} rx={70} ry={14} fill="#5a7a9a" />
					<rect x={-70} y={230} width={140} height={12} fill="#6a6f76" />
				</g>
			))}
		</g>
	);
};
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(11);
	const wx = lerp(f, 0, len, 140, 760, Easing.linear);
	const cx = lerp(f, 40, len, -1200, 360, Easing.out(Easing.quad));
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -40, 60, E), y: 0, z: lerp(f, 0, len, 0, 70, E)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
				<Lay z={-800} box={[-1300, 800, 2900, 900]}>
					{f >= 40 && (
						<g>
							<g transform={`translate(${cx},1540) scale(1.25)`}>
								<WaterCart phase={f * 0.32} />
							</g>
							<Folk era={1901} n={4} who="m" id="w1vod" x={cx - 640} y={1550} scale={0.5} walk={f * 0.3} />
						</g>
					)}
				</Lay>
				<Lay z={-330} box={personBox(wx, 1880, 0.9, 700)}>
					<Folk era={1901} n={2} who="f" id="w1yoke" x={wx} y={1880} scale={0.9} walk={f * 0.28} armL={{target: [-200, -800], bend: 1}} armR={{target: [200, -800], bend: -1}} />
					<Yoke x={wx} y={1880} s={0.9} f={f} />
				</Lay>
			</Set3D>
			<Tag f={f} at={73} x={Math.max(120, cx * 0.85 + 300)} y={1000} tx={540} ty={760} text="ВОДОВОЗ" />
		</AbsoluteFill>
	);
};

// 12. You try to explain the internet. They listen politely — and twirl a finger at the temple.
// (интернет@58, вежливо@92, крутят@129)
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(12);
	const twirl = f >= 126 ? Math.sin((f - 126) / 2.2) * 26 : 0;
	const gest = Math.sin(f / 6) * 50;
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(f, 0, len, -80, 50, E), y: 0, z: lerp(f, 0, len, 0, 110, E)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
				<Lay z={-460} box={[300, 700, 1100, 1200]}>
					<Folk era={1901} n={2} who="k" id="w1s12k" x={560} y={1760} scale={0.6} breathe={f} headTurn={-0.6} face={{...(f > 126 ? LAUGH : CALM), look: [-0.7, 0]}} />
					<Folk era={1901} n={1} who="f" id="w1s12w" x={940} y={1760} scale={0.78} breathe={f + 20} headTurn={-0.6} face={{...(f > 132 ? {...SMILE, eyes: 'narrow'} : SMILE), look: [-0.8, 0]} as Face} />
					<Folk era={1901} n={0} who="m" id="w1s12m" x={740} y={1780} scale={0.82} breathe={f + 9} headTurn={-0.5} face={{...(f > 126 ? {eyes: 'narrow', mouth: 'smile', brows: 'raised', blush: false} : SMILE), look: [-0.8, 0]} as Face} armR={f >= 120 ? {target: [118 + twirl * 0.5, -1040 + twirl * 0.5], bend: 1} : undefined} />
				</Lay>
				<Lay z={-250} box={personBox(240, 1960, 1.02)}>
					<You id="w1you12" x={240} y={1960} scale={1.02} breathe={f} headTurn={0.5} face={{eyes: 'open', mouth: f < 120 && Math.floor(f / 5) % 2 === 0 ? 'open' : 'smile', brows: 'raised', blush: false, look: [0.8, 0]}} armR={{target: [270 + gest * 0.4, -760 + gest], bend: -1}} itemR={<HandPhone s={1.2} />} armL={f < 110 ? {target: [-60 - gest * 0.3, -640], bend: 1} : undefined} />
				</Lay>
			</Set3D>
			<Bubble x={430} y={760} text="Интернет — это…" from={8} to={60} />
			<Bubble x={430} y={760} text="…как почта, только за секунду!" from={62} to={124} />
		</AbsoluteFill>
	);
};

// 13. The bakery: the shop keeper studies your coin — it's from the 21st century. (булочную@24, монету@89, двадцать@122)
const Coin: React.FC<{hi: number}> = ({hi}) => (
	<svg width={700} height={700} viewBox="-350 -350 700 700">
		<circle r={300} fill="#c9ccd2" stroke="#8a8f96" strokeWidth={18} />
		<circle r={262} fill="none" stroke="#9aa0a8" strokeWidth={6} strokeDasharray="6 10" />
		<text y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={170} fill="#6a6f76">
			10
		</text>
		<text y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#6a6f76">
			РУБЛЕЙ
		</text>
		<text y={170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill={hi > 0.5 ? RED : '#6a6f76'}>
			2025
		</text>
		{hi > 0 && <ellipse cx={0} cy={138} rx={160 * hi} ry={74 * hi} fill="none" stroke={RED} strokeWidth={12} />}
		<ellipse cx={-110} cy={-150} rx={90} ry={40} fill="#fff" opacity={0.3} transform="rotate(-30 -110 -150)" />
	</svg>
);
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(13);
	const {i, t} = seg(f, [104]);
	if (i === 0) {
		const lift = interpolate(t, [58, 74], [0, 1], clamp);
		return (
			<Set3D cam={{x: lerp(t, 0, 104, -60, 40, E), y: 0, z: lerp(t, 0, 104, 0, 120, E)}} bg="#e8d6b0" far={<Far><Bakery /></Far>} vig={0.6}>
				<Lay z={-520} box={personBox(660, 1880, 0.95)}>
					<Folk era={1901} n={0} who="m" id="w1baker" x={660} y={1880} scale={0.95} apron="#f4f0e8" breathe={t} headTurn={-0.3} face={lift > 0.5 ? {eyes: 'narrow', brows: 'angry', mouth: 'tight', blush: false, look: [-0.3, -0.4]} : {...CALM, look: [-0.6, 0.2]}} armR={{target: [120 - 60 * lift, -760 - 300 * lift], bend: -1}} itemR={lift > 0.2 ? <circle r={20} fill="#c9ccd2" stroke="#8a8f96" strokeWidth={5} /> : undefined} />
				</Lay>
				<Lay z={-380} box={[-600, 1060, 2300, 700]}>
					<rect x={-600} y={1100} width={2300} height={70} fill="#7a5232" />
					<rect x={-600} y={1170} width={2300} height={600} fill="#6a4628" />
					{Array.from({length: 9}).map((_, k) => (
						<rect key={k} x={-560 + k * 260} y={1210} width={220} height={500} rx={10} fill="#5a3a22" />
					))}
				</Lay>
				<Lay z={-220} box={personBox(170, 2080, 1.12)}>
					<You id="w1you13" x={170} y={2080} scale={1.12} back breathe={t} armR={t < 60 ? {target: [260, -780], bend: -1} : undefined} />
				</Lay>
			</Set3D>
		);
	}
	const hi = interpolate(t, [16, 26], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: lerp(t, 0, len - 104, -30, 30), y: 0, z: lerp(t, 0, len - 104, 0, 60)}} bg="#e8d6b0" far={<Far><Bakery /></Far>} blur={12} vig={0.7} />
			<div style={{position: 'absolute', left: 540, top: 860, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * pop(t, 0, 12)}) rotate(${lerp(t, 0, 60, -8, 4)}deg)`}}>
				<Coin hi={hi} />
			</div>
			<Stamp f={t} at={30} x={540} y={1560} text="XXI ВЕК" rot={-6} />
		</AbsoluteFill>
	);
};

// 14. He calls the policeman. You run — and accidentally snap a photo with the flash. The crowd gasps.
// (городового@16, бежишь@49, вспышкой@114, ахает@154)
const Gorodovoy: React.FC<{x: number; y: number; s: number; f: number; id: string; run?: boolean}> = ({x, y, s, f, id, run}) => (
	<Person kind="dad" id={id} plain colors={{top: '#1c1e24', topDark: '#1c1e24', pants: '#1c1e24', hair: '#3a2a20'}} boots="#0e0e10" moustache="#3a2a20" hat={{type: 'peak', color: '#1c1e24', band: '#d8762a'}} x={x} y={y} scale={s} walk={run ? f * 0.45 : undefined} breathe={f} face={{eyes: 'narrow', brows: 'angry', mouth: 'open', blush: false, look: [-0.6, 0]}} armL={{target: [-160, -1010], bend: 1}} itemL={<rect x={-8} y={-30} width={16} height={40} rx={4} fill="#c9a54a" />} />
);
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const len = L(14);
	const {i, t} = seg(f, [44, 114]);
	if (i === 0) {
		const gx = lerp(t, 6, 44, 1500, 900, Easing.out(Easing.cubic));
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, 44, -30, 30), y: 0, z: lerp(t, 0, 44, 60, 120)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
					<Lay z={-420} box={personBox(300, 1700, 0.85)}>
						<Folk era={1901} n={0} who="m" id="w1bk14" x={300} y={1700} scale={0.85} apron="#f4f0e8" breathe={t} headTurn={0.6} face={{eyes: 'narrow', brows: 'angry', mouth: 'open', blush: false, look: [0.9, 0]}} armR={{target: [220, -900], bend: -1}} />
					</Lay>
					<Lay z={-300} box={personBox(gx, 1880, 0.9)}>
						<Gorodovoy x={gx} y={1880} s={0.9} f={t} id="w1gor" run={t < 40} />
					</Lay>
				</Set3D>
				<Bubble x={330} y={640} text="Городовой!" from={4} to={44} />
			</AbsoluteFill>
		);
	}
	if (i === 1) {
		const len1 = 70;
		const flash = interpolate(t, [62, 66, 70], [0, 1, 1], clamp);
		return (
			<AbsoluteFill>
				<Set3D cam={{x: lerp(t, 0, len1, 300, -200, Easing.linear), y: 0, z: 60}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.6}>
					<Lay z={-500} box={personBox(lerp(t, 0, len1, 1100, 520, Easing.linear), 1800, 0.8)}>
						<Gorodovoy x={lerp(t, 0, len1, 1100, 520, Easing.linear)} y={1800} s={0.8} f={f} id="w1gor2" run />
					</Lay>
					<Lay z={-260} box={personBox(lerp(t, 0, len1, 760, 140, Easing.linear), 1960, 1.0, 700)}>
						<You id="w1you14" x={lerp(t, 0, len1, 760, 140, Easing.linear)} y={1960} scale={1.0} walk={f * 0.5} headTurn={0.6} face={{...WIDE, look: [0.8, 0]}} armR={{target: [380, -1060], bend: -1}} itemR={<HandPhone s={1.3} flash={t >= 60 ? interpolate(t, [60, 64, 70], [0, 1, 0.6], clamp) : 0} />} />
					</Lay>
				</Set3D>
				{flash > 0 && <AbsoluteFill style={{background: '#fffbe8', opacity: flash}} />}
			</AbsoluteFill>
		);
	}
	// the crowd frozen by the flash (this is the photo you will find at home)
	const fade = interpolate(t, [0, 10], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<Set3D cam={{x: 0, y: 0, z: lerp(t, 0, len - 114, 0, 70)}} bg="#a9c3d6" far={<TownFar era={1901} f={f} />} vig={0.65}>
				<Lay z={-400} box={[-200, 700, 1500, 1200]}>
					<CrowdRow era={1901} x0={20} dx={200} n={6} y={1760} s={0.74} id="w1s14c" seed={1} f={0} face={(k) => ({eyes: 'wide', pupil: 0.5, mouth: k % 2 ? 'o' : 'open', brows: 'raised', look: [0, 0]})} />
				</Lay>
			</Set3D>
			{fade > 0 && <AbsoluteFill style={{background: '#fffbe8', opacity: fade}} />}
		</AbsoluteFill>
	);
};

// 15. 90 %. The jump to 1911.
export const S15: React.FC = () => <Jump len={L(15)} fromYear={1901} toYear={1911} fromPct={100} toPct={90} />;

// keep the imports used by the later shots in scenes2.tsx happy
export const _KEEP = {Glow, rnd, zoomT, YEL, GY, Arrive};
