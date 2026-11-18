// «Фильм про тебя» — часть 2 (зрители выбрали: искать папу). Ты выбегаешь из зала, фойе пустое, со всех афиш
// смотришь ты; папин рингтон над залом — кинобудка; папа на экране, внутри фильма; плёнка кончается; за спиной — он.
// 17 shots on the timeline of src/f2/timeline.ts (≈ the final edit, see scripts/fit-voiceover.py --part f2).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {HEAVY, MONO} from '../components/Overlays';
import {Bust, Face, Person} from '../components/Person';
import {GlobalDefs} from '../components/Set';
import {Stage} from '../components/Stage';
import {DAD_SEAT, FilmHall, HallFront, HeadSil, Label, rowS, rowY, ScreenView, SeatTicket, seatX, Sitter, SON_SEAT, Ticket} from '../f1/scenes';
import * as G1 from '../g1/scenes';
import * as G2 from '../g2/scenes';
import {Handset} from '../g3/scenes';
import {Glint, Shadow} from '../p4/scenes';
import {Phone} from '../scenes/S12_S16';

const {YELLOW, RED, rnd, StatusBar} = G1;
const {Finale, Recap} = G2;
const HAND = "'Segoe Print', 'Comic Sans MS', cursive";
const SCARED: Face = {eyes: 'wide', pupil: 0.45, mouth: 'o', brows: 'worried', look: [0, 0], sweat: 0.6, blush: false};

// ============================================================ pieces ======
// you run along the aisle in front of row 7 to the green «ВЫХОД»; the hall laughs at the screen.
// The camera follows you; the audience is darker so you stand out.
const RunHall: React.FC<{t: number; idp: string}> = ({t, idp}) => {
	const k = lerp(t, 0, 62, 0, 1, Easing.inOut(Easing.quad));
	const sx = 560 + 470 * k;
	const s = rowS(7) * 0.64;
	const feet = rowY(7) + 78;
	return (
		<Stage cam={{s: 1.7, cx: 560 + 340 * k, cy: rowY(7) - 120}} light={{glow: 0, vignette: 0.8}} bg="#1d161b">
			<defs>
				<radialGradient id={`${idp}spot`} cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#fff2cc" stopOpacity={0.35} />
					<stop offset="1" stopColor="#fff2cc" stopOpacity={0} />
				</radialGradient>
			</defs>
			<HallFront f={t} idp={`${idp}v`} dim={0.78} mood="laugh">
				{/* the exit on the right wall */}
				<rect x={970} y={760} width={150} height={360} fill="#0d0a0c" />
				<rect x={985} y={775} width={120} height={345} fill="#2a3a2e" />
				<rect x={960} y={690} width={170} height={56} rx={8} fill="#17c45a" style={{filter: 'drop-shadow(0 0 18px #17c45a)'}} />
				<text x={1045} y={730} fontSize={34} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
					ВЫХОД
				</text>
				<ellipse cx={sx} cy={feet - 200} rx={190} ry={300} fill={`url(#${idp}spot)`} />
				<Person kind="son" id={`${idp}s`} x={sx} y={feet} scale={s} walk={t * 0.75} face={{...SCARED, look: [0.8, 0]}} headTurn={0.4} />
			</HallFront>
		</Stage>
	);
};

// the cinema foyer: red carpet, an empty box office, the popcorn machine, posters
const POSTER_BG = 'linear-gradient(180deg, #3a0d14 0%, #12060a 70%, #050304 100%)';
const Poster: React.FC<{w: number; h: number; id: string; look?: [number, number]; when?: number}> = ({w, h, id, look = [0, 0], when = 1}) => (
	<div style={{position: 'relative', width: w, height: h, background: '#c9a24a', padding: w * 0.03, boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.6)'}}>
		<div style={{position: 'relative', width: '100%', height: '100%', background: POSTER_BG, overflow: 'hidden'}}>
			<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: -w * 0.03, top: -w * 0.03}}>
				<GlobalDefs />
				<Bust kind="son" id={id} x={w / 2} y={h * 0.6} scale={w / 300} face={{eyes: 'wide', pupil: 0.5, mouth: 'flat', brows: 'worried', look, blush: false}} />
			</svg>
			<div style={{position: 'absolute', top: h * 0.04, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: YELLOW, fontSize: w * 0.105, lineHeight: 1, textShadow: '0 4px 0 #000', letterSpacing: 1}}>ФИЛЬМ ПРО ТЕБЯ</div>
			<div style={{position: 'absolute', bottom: h * 0.035, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, color: '#fff', fontSize: w * 0.09, textShadow: '0 4px 0 #000'}}>
				<span style={{borderBottom: `${w * 0.012}px solid ${RED}`, paddingBottom: 2, opacity: when}}>СЕГОДНЯ</span>
			</div>
		</div>
	</div>
);

const Foyer: React.FC<{t: number; idp: string}> = ({t, idp}) => (
	<AbsoluteFill style={{background: '#14080b', overflow: 'hidden'}}>
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<GlobalDefs />
			<defs>
				<linearGradient id={`${idp}carpet`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#5a1018" />
					<stop offset="1" stopColor="#8a1c24" />
				</linearGradient>
				<radialGradient id={`${idp}lamp`} cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#ffd98a" stopOpacity={0.45} />
					<stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
				</radialGradient>
			</defs>
			{/* wall with dark stripes and a gold trim */}
			<rect x={0} y={250} width={1080} height={1100} fill="#4a1820" />
			{Array.from({length: 12}).map((_, k) => (
				<rect key={k} x={k * 96} y={250} width={44} height={1100} fill="#40141b" />
			))}
			<rect x={0} y={250} width={1080} height={16} fill="#b38a3a" />
			<rect x={0} y={1060} width={1080} height={10} fill="#b38a3a" />
			<rect x={0} y={1070} width={1080} height={280} fill="#3a1016" />
			{[180, 540, 900].map((x) => (
				<g key={x}>
					<circle cx={x} cy={330} r={22} fill="#ffe7b0" />
					<circle cx={x} cy={330} r={160} fill={`url(#${idp}lamp)`} />
				</g>
			))}
			{/* carpet */}
			<path d="M 0,1350 L 1080,1350 L 1080,1920 L 0,1920 Z" fill={`url(#${idp}carpet)`} />
			<path d="M 380,1350 L 700,1350 L 900,1920 L 180,1920 Z" fill="#a8232c" opacity={0.6} />
			{/* the box office on the left: nobody */}
			<rect x={40} y={620} width={380} height={730} fill="#5a3a22" />
			<rect x={60} y={560} width={340} height={70} fill="#2a1a10" />
			<text x={230} y={610} fontSize={46} fontFamily={HEAVY} fontWeight={900} fill="#e8c46a" textAnchor="middle">
				КАССА
			</text>
			<rect x={80} y={680} width={300} height={300} fill="#1c2a3a" />
			<rect x={80} y={680} width={300} height={300} fill="#8fb0c8" opacity={0.12} />
			<g transform={`translate(230,880) rotate(${Math.sin(t / 14) * 6})`}>
				<rect x={-60} y={-110} width={120} height={120} rx={20} fill="#2a2a30" />
				<rect x={-70} y={0} width={140} height={30} rx={10} fill="#2a2a30" />
				<rect x={-6} y={30} width={12} height={60} fill="#1a1a1e" />
			</g>
			<rect x={70} y={980} width={320} height={26} fill="#3a2414" />
			{/* the popcorn machine on the right */}
			<rect x={720} y={1000} width={300} height={350} fill="#b8222a" />
			<rect x={735} y={760} width={270} height={250} fill="#ffe08a" opacity={0.9} />
			{Array.from({length: 40}).map((_, k) => (
				<circle key={k} cx={750 + rnd(k) * 240} cy={1000 - rnd(k + 50) * 120} r={9} fill="#fff6d0" stroke="#e8c870" strokeWidth={2} />
			))}
			<rect x={735} y={760} width={270} height={250} fill="none" stroke="#7a1218" strokeWidth={14} />
			<rect x={720} y={700} width={300} height={66} fill="#7a1218" />
			<text x={870} y={748} fontSize={40} fontFamily={HEAVY} fontWeight={900} fill={YELLOW} textAnchor="middle">
				ПОПКОРН
			</text>
			{/* velvet rope */}
			{[300, 540, 780].map((x) => (
				<g key={x}>
					<rect x={x - 8} y={1300} width={16} height={190} fill="#c9a24a" />
					<circle cx={x} cy={1296} r={16} fill="#e8c46a" />
				</g>
			))}
			<path d="M 300,1320 Q 420,1400 540,1320 Q 660,1400 780,1320" stroke="#9a1820" strokeWidth={14} fill="none" />
			{/* you, alone */}
			<Person kind="son" id={`${idp}son`} x={540} y={1800} scale={0.62} face={{...SCARED, look: [Math.sin(t / 9) > 0 ? 0.8 : -0.8, 0]}} headTurn={Math.sin(t / 9) > 0 ? 0.5 : -0.5} breathe={t} />
		</svg>
		{/* two small posters on the back wall */}
		<div style={{position: 'absolute', left: 470, top: 520, transform: 'scale(0.5)', transformOrigin: '0 0'}}>
			<Poster w={240} h={360} id={`${idp}p1`} />
		</div>
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
	</AbsoluteFill>
);

// a mobile call screen: outgoing to dad, or incoming «Тигрёнок» on dad's phone
const Call: React.FC<{f: number; out?: boolean}> = ({f, out = true}) => (
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #23304f 0%, #0c1120 100%)', fontFamily: HEAVY, color: '#fff', overflow: 'hidden'}}>
		<StatusBar time="19:42" />
		<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
			<div style={{fontSize: 30, fontWeight: 800, color: '#aeb6c8'}}>{out ? 'вызов…' : 'входящий вызов…'}</div>
			<div style={{fontSize: 70, fontWeight: 900, marginTop: 10}}>{out ? 'Папа' : 'Тигрёнок'}</div>
		</div>
		<div style={{position: 'absolute', left: '50%', top: 470, width: 230, height: 230, marginLeft: -115}}>
			{[0, 1, 2].map((k) => {
				const p = ((f + k * 12) % 36) / 36;
				return <div key={k} style={{position: 'absolute', inset: -90 * p, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.5)', opacity: 1 - p}} />;
			})}
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: out ? '#33506e' : '#f0a032', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 900}}>{out ? 'П' : 'Т'}</div>
		</div>
		<div style={{position: 'absolute', bottom: 120, left: 0, right: 0, display: 'flex', justifyContent: out ? 'center' : 'space-around'}}>
			<div style={{width: 140, height: 140, borderRadius: 70, background: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Handset size={70} rot={135} />
			</div>
			{!out && (
				<div style={{width: 140, height: 140, borderRadius: 70, background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${Math.sin(f / 3) * 6}px)`}}>
					<Handset size={70} />
				</div>
			)}
		</div>
	</div>
);

// the film projector: two reels on top, the lamp house at the back, the lens to the left; (x, y) = lens tip
const Projector: React.FC<{x: number; y: number; s: number; t: number; feed?: number; beam?: boolean}> = ({x, y, s, t, feed = 1, beam = false}) => {
	const reel = (cx: number, cy: number, r: number, fill: number, a: number) => (
		<g transform={`translate(${cx},${cy})`}>
			<circle r={r} fill="#8a9098" />
			<circle r={r * (0.28 + 0.66 * fill)} fill="#2a2420" />
			<g transform={`rotate(${a})`}>
				{[0, 60, 120, 180, 240, 300].map((d) => (
					<path key={d} d={`M 0,0 L ${r * 0.9 * Math.cos((d * Math.PI) / 180)},${r * 0.9 * Math.sin((d * Math.PI) / 180)}`} stroke="#b9bfc6" strokeWidth={r * 0.1} opacity={0.75} />
				))}
				<circle r={r * 0.22} fill="#5a6068" />
				<circle r={r * 0.08} fill="#1a1a1e" />
			</g>
			<circle r={r} fill="none" stroke="#5a6068" strokeWidth={r * 0.05} />
		</g>
	);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			{beam && <path d="M 0,-26 L -900,-260 L -900,240 L 0,26 Z" fill="#fff6d8" opacity={0.13 + 0.03 * Math.sin(t)} />}
			{/* film path from the reels into the body */}
			<path d="M 120,-300 L 160,-90 M 330,-300 L 300,-90" stroke="#3a2a20" strokeWidth={8} />
			{reel(130, -330, 150 * 0.9, feed, t * 14)}
			{reel(330, -330, 150 * 0.9, 1 - 0.7 * feed, t * 9)}
			{/* lens barrel */}
			<rect x={0} y={-36} width={110} height={72} rx={10} fill="#2a2f36" />
			<ellipse cx={0} cy={0} rx={14} ry={34} fill="#fff6d8" opacity={0.9} />
			{/* body + lamp house */}
			<rect x={100} y={-100} width={300} height={200} rx={22} fill="#3a4048" />
			<rect x={120} y={-80} width={120} height={70} rx={8} fill="#2a2f36" />
			<rect x={380} y={-170} width={170} height={300} rx={18} fill="#454c55" />
			{[0, 1, 2, 3, 4].map((k) => (
				<rect key={k} x={405} y={-140 + k * 40} width={120} height={14} rx={7} fill="#2a2f36" />
			))}
			<rect x={440} y={-240} width={50} height={80} fill="#3a4048" />
			<circle cx={470} cy={60} r={10} fill={Math.floor(t / 4) % 2 ? '#ff4a3d' : '#7a1a14'} />
			{/* the stand */}
			<rect x={220} y={100} width={80} height={420} fill="#2a2f36" />
			<rect x={120} y={500} width={280} height={40} rx={10} fill="#22262c" />
		</g>
	);
};

// inside the projection booth: green walls, the porthole on the left, the projector, film cans, a chair
const Booth: React.FC<{t: number; idp: string; phone?: number; feed?: number; you?: boolean; him?: number}> = ({t, idp, phone = 0, feed = 1, you = false, him = 0}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
		<GlobalDefs />
		<rect x={0} y={0} width={1080} height={1920} fill="#26332e" />
		{Array.from({length: 9}).map((_, k) => (
			<rect key={k} x={k * 130} y={0} width={4} height={1500} fill="#1e2925" />
		))}
		<rect x={0} y={1500} width={1080} height={420} fill="#1a1512" />
		<rect x={0} y={1500} width={1080} height={10} fill="#3a322a" />
		{/* the porthole to the hall, beam going out */}
		<rect x={30} y={640} width={150} height={120} fill="#0a0c10" stroke="#5a6068" strokeWidth={10} />
		<rect x={36} y={646} width={138} height={108} fill="#9fb4ff" opacity={0.1 + 0.05 * Math.sin(t / 3)} />
		{/* the lamp over it */}
		<rect x={520} y={0} width={8} height={260} fill="#111" />
		<path d="M 470,260 L 578,260 L 600,320 L 448,320 Z" fill="#3a4048" />
		<ellipse cx={524} cy={322} rx={70} ry={10} fill="#ffe7a8" opacity={0.7} />
		<path d="M 454,322 L 594,322 L 820,1500 L 230,1500 Z" fill="#ffe7a8" opacity={0.07} />
		{/* film cans */}
		{[0, 1, 2, 3].map((k) => (
			<g key={k} transform={`translate(${880 - (k % 2) * 20},${1480 - k * 46})`}>
				<ellipse cx={0} cy={0} rx={110} ry={26} fill="#6a7078" />
				<rect x={-110} y={-36} width={220} height={36} fill="#7a8088" />
				<ellipse cx={0} cy={-36} rx={110} ry={26} fill="#9aa0a8" />
			</g>
		))}
		<Projector x={190} y={700} s={1} t={t} feed={feed} beam />
		{/* a chair with dad's phone */}
		<g transform="translate(860,1180)">
			<rect x={-110} y={-260} width={30} height={430} fill="#3a2a1a" />
			<rect x={-110} y={-260} width={200} height={30} fill="#4a3624" />
			<rect x={-120} y={0} width={240} height={34} rx={8} fill="#5a4230" />
			<rect x={-110} y={34} width={22} height={290} fill="#3a2a1a" />
			<rect x={88} y={34} width={22} height={290} fill="#3a2a1a" />
			{phone > 0 && (
				<g transform={`translate(${Math.sin(t * 2.6) * 4 * phone},-8) rotate(-8)`}>
					<rect x={-50} y={-20} width={100} height={20} rx={6} fill="#15161a" />
					<rect x={-46} y={-19} width={92} height={14} rx={4} fill="#7fc8ff" opacity={0.6 + 0.4 * phone} />
					<ellipse cx={0} cy={-60} rx={140} ry={60} fill="#7fc8ff" opacity={0.15 * phone} />
				</g>
			)}
		</g>
		{you && <Person kind="son" id={`${idp}you`} x={330} y={1900} scale={1.05} back breathe={t} />}
		{him > 0 && (
			<g opacity={Math.min(1, him)}>
				<Shadow id={`${idp}him`} x={720 - 160 * him} y={1990} scale={1.0} />
				<Glint x={720 - 160 * him} y={1990} scale={1.0} o={Math.min(1, him)} />
			</g>
		)}
	</svg>
);

// the film on the screen: dad inside it, pressing his hands against the screen from the inside
const DadInFilm: React.FC<{t: number; idp: string; knocks?: number[]; shout?: boolean}> = ({t, idp, knocks = [], shout = true}) => {
	const hit = knocks.filter((k) => t >= k && t < k + 16).map((k) => t - k)[0];
	const push = hit !== undefined ? Math.exp(-hit / 4) : 0;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #e8eef8 0%, #9fb0c8 45%, #3a4660 100%)'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<g transform={`translate(0,${-20 * push}) scale(${1 + 0.03 * push})`} style={{transformOrigin: '540px 960px'}}>
					<Bust kind="dad" id={`${idp}d`} x={540} y={980} scale={2.6} face={{eyes: 'wide', pupil: 0.5, mouth: shout ? (Math.floor(t / 5) % 2 ? 'open' : 'o') : 'o', brows: 'worried', stubble: true, blush: false}} />
					{/* his palms flat on the screen */}
					{[-1, 1].map((sd) => (
						<g key={sd} transform={`translate(${540 + sd * 310},${930 - 10 * push})`}>
							<ellipse rx={78} ry={98} fill="#e9b892" />
							{[-36, -12, 12, 36].map((fx, i) => (
								<rect key={i} x={fx - 11} y={-170 + Math.abs(fx) * 0.6} width={22} height={90} rx={11} fill="#e9b892" />
							))}
							<rect x={-sd * 92 - 10} y={-40} width={20} height={64} rx={10} fill="#e9b892" transform={`rotate(${-sd * 40})`} />
						</g>
					))}
				</g>
				{hit !== undefined &&
					[-1, 1].map((sd) => (
						<circle key={sd} cx={540 + sd * 310} cy={900} r={90 + hit * 18} fill="none" stroke="#fff" strokeWidth={8} opacity={Math.max(0, 1 - hit / 16)} />
					))}
			</svg>
		</AbsoluteFill>
	);
};

// the booth wall with the porthole; through it — the hall and its screen (`film` on it); zoom = into the porthole
const Porthole: React.FC<{f: number; zoom?: number; children: React.ReactNode; bob?: number}> = ({f, zoom = 1, children, bob = 0}) => (
	<AbsoluteFill style={{background: '#26332e', overflow: 'hidden'}}>
		<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 760px'}}>
			<div style={{position: 'absolute', left: 150, top: 470, width: 780, height: 600, overflow: 'hidden', background: '#000'}}>
				<div style={{position: 'absolute', left: -150, top: -470, width: 1080, height: 1920, transform: 'scale(0.86)', transformOrigin: '540px 760px'}}>
					<ScreenView f={f} heads="both" bob={bob}>
						{children}
					</ScreenView>
				</div>
				<AbsoluteFill style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)'}} />
			</div>
			<div style={{position: 'absolute', left: 130, top: 450, width: 820, height: 640, border: '20px solid #5a6068', boxSizing: 'border-box', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'}} />
			{/* the beam going out over the hall */}
			<div style={{position: 'absolute', left: 150, top: 470, width: 780, height: 600, background: 'radial-gradient(circle at 92% 8%, rgba(255,246,216,0.35) 0%, transparent 45%)'}} />
		</AbsoluteFill>
	</AbsoluteFill>
);

// the ticket back: «Не досматривай» and, under it, a new line coming through (write = 0..1)
const TicketNew: React.FC<{write: number}> = ({write}) => (
	<div style={{position: 'absolute', left: 90, top: 470, width: 900, height: 520, borderRadius: 18, background: '#efe2c0', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: 680, top: 0, bottom: 0, borderLeft: '6px dashed #c9b48a'}} />
		<div style={{position: 'absolute', left: 50, top: 60, fontFamily: HAND, fontWeight: 700, fontStyle: 'italic', fontSize: 72, color: '#1f2a6a', transform: 'rotate(-5deg)', whiteSpace: 'nowrap'}}>Не досматривай</div>
		<div style={{position: 'absolute', left: 56, top: 230, fontFamily: HAND, fontWeight: 700, fontStyle: 'italic', fontSize: 46, lineHeight: 1.25, color: '#7a1a1a', transform: 'rotate(-3deg)', clipPath: `inset(0 ${100 - 100 * Math.min(1, write * 2)}% 0 0)`, whiteSpace: 'nowrap'}}>
			Когда плёнка кончится,
		</div>
		<div style={{position: 'absolute', left: 56, top: 300, fontFamily: HAND, fontWeight: 700, fontStyle: 'italic', fontSize: 46, lineHeight: 1.25, color: '#7a1a1a', transform: 'rotate(-3deg)', clipPath: `inset(0 ${100 - 100 * Math.max(0, write * 2 - 1)}% 0 0)`, whiteSpace: 'nowrap'}}>
			я останусь здесь навсегда
		</div>
		<AbsoluteFill style={{background: 'radial-gradient(circle at 30% 60%, rgba(122,26,26,0.12) 0%, transparent 50%)', opacity: write}} />
	</div>
);

// ============================================================== SHOTS =======
// 1. Recap of part 1: dad vanished from the seat next to you; only his ticket: «Не досматривай».
export const S01: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	return (
		<Recap f={f} label="◀◀ ЧАСТЬ 1">
			{i === 0 ? (
				<Stage cam={{s: lerp(t, 0, 84, 2.8, 3.1), cx: 540, cy: 920}} light={{glow: 0, vignette: 0.85}} bg="#1d161b">
					<HallFront f={t} idp="f2s1v" dim={0.55}>
						<Sitter kind="son" k={7} i={SON_SEAT} id="f2s1s" f={t} headTurn={0.5} face={{eyes: 'wide', pupil: 0.5, mouth: 'o', brows: 'raised', look: [0.9, 0], blush: false}} />
						<SeatTicket />
						<ellipse cx={seatX(7, DAD_SEAT)} cy={rowY(7) - 75} rx={78} ry={104} fill="none" stroke={RED} strokeWidth={6} opacity={Math.min(1, pop(t, 30, 10))} />
					</HallFront>
				</Stage>
			) : (
				<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a2030 0%, #08060a 75%)'}}>
					<div style={{position: 'absolute', inset: 0, transform: `rotate(-3deg) scale(${lerp(t, 0, 72, 1.0, 1.06)})`}}>
						<Ticket side="back" write={1} />
					</div>
				</AbsoluteFill>
			)}
		</Recap>
	);
};

// 2. Title: part 2. You chose: look for dad.
export const S02: React.FC = () => {
	const f = useCurrentFrame();
	const a = pop(f, 2, 10);
	const b = pop(f, 10, 10);
	const c = pop(f, 26, 11);
	const d = pop(f, 42, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a1a10 0%, #160a06 58%, #050302 100%)'}}>
			<div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
				<div style={{fontSize: 36, letterSpacing: 10, color: YELLOW}}>ФИЛЬМ ПРО ТЕБЯ</div>
				<div style={{fontSize: 180, lineHeight: 1, color: '#fff', marginTop: 14, transform: `scale(${a})`}}>ЧАСТЬ 2</div>
				<div style={{fontSize: 76, color: RED, marginTop: 10, transform: `scale(${b})`, textShadow: '0 5px 0 rgba(0,0,0,0.5)'}}>КИНОБУДКА</div>
				<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, background: 'rgba(14,14,16,0.92)', border: '6px solid #3b82f6', borderRadius: 24, padding: '12px 34px 16px', transform: `scale(${c})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
					<div style={{fontSize: 30, color: '#9cc2ff', letterSpacing: 4}}>ВЫ ВЫБРАЛИ</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
						<div style={{width: 66, height: 66, borderRadius: 33, background: '#3b82f6', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>
						<div style={{fontSize: 54, color: '#fff'}}>ИСКАТЬ ПАПУ</div>
					</div>
				</div>
				<div>
					<div style={{display: 'inline-block', marginTop: 34, background: YELLOW, color: '#111', borderRadius: 18, padding: '10px 32px', fontSize: 36, transform: `scale(${d})`}}>ЧАСТЬ 1 — В ПРОФИЛЕ</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 3. You run out of the hall.
export const S03: React.FC = () => {
	const f = useCurrentFrame();
	return <RunHall t={f} idp="f2s3" />;
};

// 4. On the screen behind you — you run out too: the film follows you.
export const S04: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(-210px)'}}>
					<ScreenView f={f} heads="son">
						<RunHall t={f + 4} idp="f2s4a" />
					</ScreenView>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)'}}>
				<div style={{position: 'absolute', inset: 0, transform: 'translateY(380px)'}}>
					<RunHall t={f} idp="f2s4b" />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: '#fff'}} />
			<Label p={pop(f, 2, 10)} x={40} y={190} text="НА ЭКРАНЕ" color={YELLOW} />
			<Label p={pop(f, 10, 10)} x={40} y={1000} text="НА САМОМ ДЕЛЕ" color={RED} />
		</AbsoluteFill>
	);
};

// 5. The foyer: not a soul.
export const S05: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{transform: `scale(${lerp(f, 0, 60, 1.0, 1.05)})`}}>
			<Foyer t={f} idp="f2s5" />
		</AbsoluteFill>
	);
};

// 6. From every poster — you: «Фильм про тебя. Сегодня».
export const S06: React.FC = () => {
	const f = useCurrentFrame();
	const pan = lerp(f, 0, 132, 140, -140, Easing.inOut(Easing.sin));
	const when = interpolate(f, [86, 96], [0.3, 1], clamp);
	return (
		<AbsoluteFill style={{background: '#2a0c12', overflow: 'hidden'}}>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, #40141b 0px, #40141b 44px, #4a1820 44px, #4a1820 96px)'}} />
			{[-1, 0, 1].map((k) => (
				<div key={k} style={{position: 'absolute', left: 540 + k * 600 + pan - 260, top: 330, transform: `scale(${k === 0 ? 1 : 0.92})`}}>
					<Poster w={520} h={780} id={`f2s6p${k + 1}`} look={[-k * 0.6 - pan / 400, 0]} when={when} />
				</div>
			))}
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,0.65) 100%)'}} />
		</AbsoluteFill>
	);
};

// 7. You call dad — and somewhere above the hall his ringtone plays.
export const S07: React.FC = () => {
	const f = useCurrentFrame();
	const up = lerp(f, 52, 76, 0, 1);
	return (
		<AbsoluteFill style={{background: '#14080b', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translateY(${360 * up}px)`}}>
				<Foyer t={f} idp="f2s7" />
			</AbsoluteFill>
			{f >= 56 &&
				Array.from({length: 7}).map((_, k) => {
					const tt = f - 56 - k * 6;
					if (tt < 0) return null;
					return (
						<div key={k} style={{position: 'absolute', left: 300 + rnd(k) * 480 + Math.sin(tt / 6 + k) * 30, top: 380 - tt * 2.2, fontFamily: HEAVY, fontSize: 70 + rnd(k + 3) * 40, color: YELLOW, opacity: Math.max(0, 1 - tt / 60), textShadow: '0 0 20px rgba(255,211,74,0.7)'}}>
							{k % 2 ? '♫' : '♪'}
						</div>
					);
				})}
			<Phone x={560} y={1150 + 700 * up} w={540} rot={-4}>
				<Call f={f} out />
			</Phone>
		</AbsoluteFill>
	);
};

// 8. There: the door of the projection booth; the beam comes out of it onto the screen.
export const S08: React.FC = () => {
	const f = useCurrentFrame();
	const lit = 0.85 + 0.15 * Math.sin(f * 1.7);
	return (
		<AbsoluteFill style={{background: '#0d0a0c', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				<g transform={`translate(0,${lerp(f, 0, 100, 120, 0)})`}>
					{/* the back wall of the hall */}
					<rect x={0} y={0} width={1080} height={1500} fill="#1d161b" />
					{Array.from({length: 8}).map((_, k) => (
						<rect key={k} x={k * 150} y={0} width={70} height={1500} fill="#241b21" />
					))}
					{/* the booth window and the beam into the hall */}
					<rect x={360} y={420} width={150} height={100} fill="#fff6d8" opacity={lit} />
					<rect x={350} y={410} width={170} height={120} fill="none" stroke="#3a3238" strokeWidth={12} />
					<path d="M 380,470 L 490,470 L 1250,1900 L -300,1900 Z" fill="#fff6d8" opacity={0.08 * lit} />
					{Array.from({length: 26}).map((_, k) => (
						<circle key={k} cx={430 + (rnd(k) - 0.5) * 900 * rnd(k + 7)} cy={600 + ((f * (1.5 + rnd(k)) + rnd(k + 3) * 1300) % 1300)} r={2 + rnd(k + 5) * 3} fill="#fff6d8" opacity={0.4} />
					))}
					{/* the narrow stairs up the side wall to the door */}
					{Array.from({length: 9}).map((_, k) => (
						<rect key={k} x={1000 - k * 34} y={1240 - k * 76} width={130} height={22} fill="#3a3036" />
					))}
					<rect x={660} y={300} width={170} height={300} fill="#3a2a22" stroke="#5a463a" strokeWidth={10} />
					<rect x={672} y={312} width={146} height={276} fill="#4a362a" />
					<circle cx={800} cy={460} r={10} fill="#c9a24a" />
					<rect x={600} y={200} width={290} height={70} rx={8} fill="#b8222a" />
					<text x={745} y={248} fontSize={36} fontFamily={HEAVY} fontWeight={900} fill="#fff" textAnchor="middle">
						КИНОБУДКА
					</text>
					<rect x={688} y={360} width={114} height={78} rx={4} fill="#f2e9d0" />
					<text x={745} y={388} fontSize={14} fontFamily={HEAVY} fontWeight={900} fill="#b8222a" textAnchor="middle">
						ПОСТОРОННИМ
					</text>
					<text x={745} y={408} fontSize={14} fontFamily={HEAVY} fontWeight={900} fill="#b8222a" textAnchor="middle">
						ВХОД
					</text>
					<text x={745} y={428} fontSize={14} fontFamily={HEAVY} fontWeight={900} fill="#b8222a" textAnchor="middle">
						ВОСПРЕЩЁН
					</text>
					{/* the last rows: heads facing the screen */}
					{[-2, -1, 0, 1, 2, 3].map((i) => (
						<HeadSil key={i} x={540 + (i - 0.5) * 200} y={1560} s={0.8} />
					))}
					<rect x={0} y={1650} width={1080} height={400} fill="#0d0a0c" />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// 9. A narrow staircase; the projector chirps like a cricket.
export const S09: React.FC = () => {
	const f = useCurrentFrame();
	const k = lerp(f, 0, 100, 0, 1, Easing.linear);
	const flick = 0.75 + 0.25 * Math.abs(Math.sin(f * 2.3));
	return (
		<AbsoluteFill style={{background: '#0b0a0c', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				{/* walls converging up to the door */}
				<path d="M 0,0 L 400,420 L 400,1920 L 0,1920 Z" fill="#2a2228" />
				<path d="M 1080,0 L 680,420 L 680,1920 L 1080,1920 Z" fill="#231c21" />
				<rect x={400} y={160} width={280} height={260} fill="#3a2a22" />
				<rect x={418} y={176} width={244} height={244} fill="#ffe7a8" opacity={0.25 + 0.5 * flick} />
				<path d="M 418,420 L 662,420 L 1000,1920 L 80,1920 Z" fill="#ffe7a8" opacity={0.05 * flick} />
				{/* the steps */}
				{Array.from({length: 12}).map((_, i) => {
					const y = 420 + i * i * 10.5 + i * 12;
					const w = 280 + i * 64;
					return <rect key={i} x={540 - w / 2} y={y} width={w} height={14 + i * 3} fill="#4a3c44" />;
				})}
				<rect x={540 - 330} y={1500} width={660} height={420} fill="#3a2e36" />
				<Person kind="son" id="f2s9you" x={540} y={lerp(k, 0, 1, 2100, 1500)} scale={lerp(k, 0, 1, 1.05, 0.62)} back walk={f * 0.35} breathe={f} />
			</svg>
		</AbsoluteFill>
	);
};

// 10. Inside — nobody. Only dad's phone. On its screen — your call.
export const S10: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [84]);
	if (i === 0) {
		return (
			<AbsoluteFill style={{background: '#26332e', overflow: 'hidden'}}>
				<AbsoluteFill style={{transform: `scale(${lerp(t, 0, 84, 1.12, 1.2) * kick(t)})`, transformOrigin: '560px 900px'}}>
					<Booth t={t} idp="f2s10" phone={1} />
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: '#1a1512', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #5a4230 0%, #2a1e14 70%)'}} />
			<div style={{position: 'absolute', left: 540, top: 880, width: 560, height: 1148, transform: `translate(-50%,-50%) rotate(${-8 + Math.sin(t * 2.6) * 1.2}deg) scale(${lerp(t, 0, 60, 0.92, 1.0)})`}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 72, background: '#15161a', boxShadow: '0 30px 60px rgba(0,0,0,0.55)'}} />
				<div style={{position: 'absolute', inset: 16, borderRadius: 60, overflow: 'hidden'}}>
					<Call f={t} out={false} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

// 11. Through the porthole — the hall. And dad: on the screen, inside the film.
export const S11: React.FC = () => {
	const f = useCurrentFrame();
	const zoom = lerp(f, 30, 120, 1.0, 1.9, Easing.inOut(Easing.cubic));
	return (
		<Porthole f={f} zoom={zoom}>
			<DadInFilm t={f} idp="f2s11" shout={false} />
		</Porthole>
	);
};

// 12. He knocks from the inside and shouts something. And the hall laughs.
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<ScreenView f={f} zoom={lerp(f, 0, 126, 1.0, 1.08)} heads="both" bob={f > 60 ? 16 : 0}>
			<DadInFilm t={f} idp="f2s12" knocks={[8, 30, 52]} />
		</ScreenView>
	);
};

// 13. A new line comes through on the ticket: «Когда плёнка кончится, я останусь здесь навсегда».
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a2030 0%, #08060a 75%)'}}>
			<div style={{position: 'absolute', inset: 0, transform: `rotate(-2deg) scale(${lerp(f, 0, 168, 1.0, 1.06)})`}}>
				<TicketNew write={lerp(f, 30, 130, 0, 1, Easing.linear)} />
			</div>
		</AbsoluteFill>
	);
};

// 14. And there's film for a couple of minutes.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#1e2925', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(${lerp(f, 0, 72, 40, 0)},0)`}>
					<Projector x={-160} y={1300} s={2.3} t={f * 1.6} feed={0.08} />
				</g>
			</svg>
			<div style={{position: 'absolute', left: 120, top: 330, background: 'rgba(14,14,16,0.85)', border: `5px solid ${RED}`, borderRadius: 14, padding: '6px 22px', fontFamily: MONO, fontWeight: 700, fontSize: 44, color: '#fff', transform: `scale(${pop(f, 10, 10)})`, transformOrigin: '0 0'}}>
				ПЛЁНКА ПОЧТИ КОНЧИЛАСЬ
			</div>
		</AbsoluteFill>
	);
};

// 15. The steps creak behind you. Somebody is coming up. Slowly.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const up = lerp(f, 0, 108, 0, 1, Easing.inOut(Easing.quad));
	return (
		<AbsoluteFill style={{background: '#0b0a0c', overflow: 'hidden'}}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<GlobalDefs />
				{/* looking down the stairwell from the booth door */}
				<path d="M 0,0 L 1080,0 L 1080,1920 L 0,1920 Z" fill="#1a1518" />
				<path d="M 160,0 L 920,0 L 700,1500 L 380,1500 Z" fill="#2a2228" />
				{Array.from({length: 12}).map((_, i) => {
					const y = 1700 - i * i * 9 - i * 30;
					const w = 760 - i * 36;
					return <rect key={i} x={540 - w / 2} y={y} width={w} height={18} fill="#3a3036" />;
				})}
				<rect x={380} y={1480} width={320} height={40} fill="#ffe7a8" opacity={0.25} />
				{/* his shadow climbing the wall */}
				<g transform={`translate(${760 - 140 * up},${1300 - 700 * up}) scale(${0.6 + 1.6 * up}) skewX(-12)`} opacity={0.85}>
					<ellipse cx={0} cy={0} rx={70} ry={86} fill="#050406" />
					<path d="M -160,240 Q -150,90 -40,80 L 40,80 Q 150,90 160,240 L 160,520 L -160,520 Z" fill="#050406" />
				</g>
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 70%, transparent 30%, rgba(0,0,0,0.75) 100%)'}} />
		</AbsoluteFill>
	);
};

// 16. On the screen in the hall — you in this booth. And behind you — him.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const him = lerp(f, 40, 110, 0, 1);
	return (
		<Porthole f={f} zoom={lerp(f, 0, 132, 1.0, 1.35, Easing.inOut(Easing.cubic))}>
			<AbsoluteFill style={{background: '#26332e'}}>
				<Booth t={f} idp="f2s16" you him={him} />
			</AbsoluteFill>
		</Porthole>
	);
};

// 17. Finale: switch off the projector before the film runs out — or step into the beam, into the film, after dad?
export const S17: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Finale
			next="ЧАСТЬ 3"
			series="ФИЛЬМ ПРО ТЕБЯ"
			boxes={5}
			boxLabel="КАК В ФИЛЬМЕ"
			opt1={{text: 'ВЫКЛЮЧИТЬ ПРОЕКТОР', sub: 'пока плёнка не кончилась'}}
			opt2={{text: 'ШАГНУТЬ В ЛУЧ', sub: 'в фильм, за папой'}}
			tallyLine={
				<>
					СБЫЛОСЬ КАК В ФИЛЬМЕ: <span style={{color: '#7ee08a'}}>4</span> · ДАЛЬШЕ — <span style={{color: YELLOW}}>ПОД ВОПРОСОМ</span>
				</>
			}
			bg={
				<AbsoluteFill>
					<Booth t={f} idp="f2s17" feed={0.06} />
					<AbsoluteFill style={{background: '#000', opacity: 0.6}} />
				</AbsoluteFill>
			}
		/>
	);
};
