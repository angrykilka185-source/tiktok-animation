import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, kick, lerp, pop, seg} from '../anim';
import {Cross, HEAVY} from '../components/Overlays';
import {Bust, Hand, Person} from '../components/Person';
import {Fridge, PlankFloor, Wallpaper, WindowBox, Tiles} from '../components/Set';
import {Cam, Stage} from '../components/Stage';

export const SANS = "'Montserrat', 'DejaVu Sans', sans-serif";

// Phone in hand (HTML for crisp UI). `children` = screen content.
export const Phone: React.FC<{x: number; y: number; w: number; scale?: number; rot?: number; sleeve?: string; skin?: string; children: React.ReactNode}> = ({
	x,
	y,
	w,
	scale = 1,
	rot = 0,
	sleeve = '#f0a032',
	skin = '#f2c3a0',
	children,
}) => {
	const h = w * 2.05;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`}}>
			{/* hand behind the phone: plain ovals like the rest of the film */}
			<div style={{position: 'absolute', right: -50, top: h * 0.5, width: 120, height: 170, borderRadius: '50%', background: skin}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: w * 0.13, background: '#15161a', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}} />
			<div style={{position: 'absolute', inset: 16, borderRadius: w * 0.11, overflow: 'hidden', background: '#0f1218'}}>{children}</div>
			<div style={{position: 'absolute', left: '50%', top: 30, width: w * 0.28, height: 30, marginLeft: -w * 0.14, borderRadius: 15, background: '#000'}} />
			<div style={{position: 'absolute', left: -150, top: h * 0.66, width: 170, height: h * 0.6, borderRadius: 70, background: sleeve, transform: 'rotate(8deg)'}} />
			<div style={{position: 'absolute', left: -78, top: h * 0.6, width: 130, height: 160, borderRadius: '50%', background: skin, transform: 'rotate(-20deg)'}} />
		</div>
	);
};

export const Wallpaper2: React.FC<{sky: string; dim?: number}> = ({sky, dim = 0}) => (
	<Stage cam={{s: 1, cx: 540, cy: 960}} light={{glow: 0.45, vignette: 0.6}}>
		<g style={{filter: 'blur(14px)'}}>
			<Wallpaper id="s12wp" x={-200} y={-200} w={1500} h={2400} base="#f0dcb0" line="#dfc490" />
			<WindowBox x={560} y={260} w={420} h={560} sky={sky} />
			<rect x={-200} y={1300} width={1500} height={800} fill="#b9824d" />
		</g>
		<rect x={-200} y={-200} width={1500} height={2400} fill="#000" opacity={dim} />
	</Stage>
);

// --------------------------------------------------------------- SHOT 12 ---
export const S12: React.FC = () => {
	const f = useCurrentFrame();
	const pulses = [3, 22, 48, 67];
	const buzzing = pulses.some((p) => f >= p && f < p + 13);
	const jx = buzzing ? Math.sin(f * 2.9) * 9 : 0;
	const jr = buzzing ? Math.sin(f * 3.7) * 2 : 0;
	const rise = lerp(f, 0, 16, 300, 0, Easing.out(Easing.cubic));
	const note = pop(f, 6, 11);
	const punch = f >= 70 ? 1.75 * kick(f - 70, 0.1) : 1;
	return (
		<AbsoluteFill>
			<Wallpaper2 sky="url(#skyMorning)" />
			<Phone x={540 + jx} y={(f >= 70 ? 1130 : 1000) + rise} w={560} rot={(f >= 70 ? 0 : -4) + jr} scale={punch}>
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#2b3f6e,#13192b)'}} />
				<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800}}>
					<div style={{fontSize: 30, opacity: 0.8}}>вторник, 12 ноября</div>
					<div style={{fontSize: 150, lineHeight: 1}}>07:10</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 22,
						right: 22,
						top: 420,
						transform: `scale(${note})`,
						background: 'rgba(245,245,250,0.92)',
						borderRadius: 30,
						padding: '22px 24px',
						display: 'flex',
						gap: 18,
						alignItems: 'center',
						fontFamily: SANS,
					}}
				>
					<div style={{width: 76, height: 76, borderRadius: 18, background: '#3ac569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#fff', fontWeight: 900}}>✉</div>
					<div>
						<div style={{fontWeight: 900, fontSize: 34, color: '#111'}}>Папа (вахта)</div>
						<div style={{fontWeight: 600, fontSize: 28, color: '#444'}}>Новое сообщение</div>
					</div>
				</div>
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 13 ---
export const S13: React.FC = () => {
	const f = useCurrentFrame();
	const typing = f < 30;
	const msg = pop(f, 30, 12);
	const mark = lerp(f, 92, 108, 0, 1);
	const zoom = f < 90 ? lerp(f, 0, 90, 1.0, 1.06) : lerp(f, 90, 180, 1.5, 1.62) * kick(f - 90, 0.1);
	const Hi: React.FC<{children: React.ReactNode}> = ({children}) => (
		<span style={{background: `linear-gradient(90deg, rgba(255,214,60,0.85) ${mark * 100}%, transparent ${mark * 100}%)`, borderRadius: 6, padding: '0 4px'}}>{children}</span>
	);
	return (
		<AbsoluteFill>
			<Wallpaper2 sky="url(#skyMorning)" dim={0.25} />
			<Phone x={f < 90 ? 500 : 560} y={f < 90 ? 1080 : 1110} w={700} scale={zoom}>
				<div style={{position: 'absolute', inset: 0, background: '#e9e3da'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 190, background: '#f7f7f9', display: 'flex', alignItems: 'flex-end', padding: '0 30px 22px', gap: 20, fontFamily: SANS, boxSizing: 'border-box'}}>
					<div style={{width: 84, height: 84, borderRadius: 42, background: '#33506e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40}}>П</div>
					<div>
						<div style={{fontWeight: 900, fontSize: 40, color: '#111'}}>Папа (вахта)</div>
						<div style={{fontWeight: 600, fontSize: 26, color: '#3a8f5c'}}>{typing ? 'печатает…' : 'в сети'}</div>
					</div>
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: '#777', fontWeight: 600}}>Сегодня</div>
				<div style={{position: 'absolute', left: 28, top: 300, maxWidth: 520, background: '#fff', borderRadius: '30px 30px 30px 6px', padding: '18px 26px', fontFamily: SANS, fontSize: 32, fontWeight: 600, color: '#222'}}>
					Как вы там? Скоро буду!
					<div style={{fontSize: 20, color: '#999', textAlign: 'right'}}>вчера 21:04</div>
				</div>
				{typing ? (
					<div style={{position: 'absolute', left: 28, top: 470, background: '#fff', borderRadius: 30, padding: '24px 30px', display: 'flex', gap: 12}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#999', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 5) / 6))}} />
						))}
					</div>
				) : (
					<div
						style={{
							position: 'absolute',
							left: 28,
							top: 470,
							width: 560,
							background: '#fff',
							borderRadius: '30px 30px 30px 6px',
							padding: '22px 28px',
							fontFamily: SANS,
							fontSize: 40,
							lineHeight: 1.3,
							fontWeight: 700,
							color: '#111',
							transform: `scale(${msg})`,
							transformOrigin: '0% 100%',
							boxSizing: 'border-box',
						}}
					>
						Сынок, рейс задержали, <Hi>прилечу завтра</Hi>. Маме не говори, сюрприз.
						<div style={{fontSize: 22, color: '#999', textAlign: 'right', fontWeight: 600}}>07:10</div>
					</div>
				)}
			</Phone>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- SHOT 14 ---
// Your face: pupils shrink → extreme close-up of the eyes.
export const S14: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [88]);
	const pupil = interpolate(f, [10, 20], [1.1, 0.35], {...clamp, easing: Easing.out(Easing.cubic)});
	const beat = Math.max(0, 1 - Math.abs(f - 12) / 10);
	const cam: Cam = i === 0 ? {s: lerp(f, 0, 88, 1.0, 1.12) + beat * 0.05, cx: 540, cy: 960} : {s: lerp(t, 0, 62, 1.0, 1.12) * kick(t), cx: 540, cy: 960};
	return (
		<Stage cam={cam} light={{glow: 0.1, vignette: 0.8}} bg="#2a1a14">
			<rect x={-500} y={-500} width={2200} height={3000} fill="#7a5a44" />
			{i === 0 ? (
				<Bust kind="son" id="s14" x={540} y={900} scale={4.2} face={{eyes: 'wide', pupil, look: [0, 0], brows: 'worried', mouth: 'o', sweat: lerp(f, 20, 88, 0.2, 1), blush: false}} />
			) : (
				<Bust kind="son" id="s14b" x={540} y={1000} scale={7.5} face={{eyes: 'wide', pupil: 0.35, look: [Math.sin(t / 4) > 0 ? 0.5 : -0.5, 0], brows: 'worried', mouth: 'o', sweat: 1, blush: false}} />
			)}
			<rect x={-500} y={-500} width={2200} height={3000} fill="url(#redVignette)" opacity={0.35 + beat * 0.5 + lerp(f, 20, 150, 0, 0.35)} />
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 15 ---
// "Dad" walks into the kitchen smiling, looking at the phone.
export const S15: React.FC = () => {
	const f = useCurrentFrame();
	const {i, t} = seg(f, [92]);
	if (i === 1) {
		return (
			<Stage cam={{s: lerp(t, 0, 88, 1.0, 1.15) * kick(t), cx: 540, cy: 900, rot: lerp(t, 0, 88, 0, -5)}} light={{glow: 0.15, vignette: 0.85, tint: '#5a0000', tintOpacity: lerp(t, 0, 88, 0.15, 0.32)}} bg="#2a1d18">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1d18" />
				<rect x={-500} y={-500} width={420} height={3000} fill="#6e3f22" />
				<rect x={1160} y={-500} width={420} height={3000} fill="#6e3f22" />
				<Bust kind="dad" id="s15cu" x={540} y={880} scale={3.6} face={{eyes: 'open', mouth: 'grin', look: [-0.7, 0.9], pupil: 0.7, brows: 'flat', stubble: true, blush: false}} />
			</Stage>
		);
	}
	const k = lerp(f, 0, 56, 0, 1, Easing.out(Easing.quad));
	const walking = f < 56;
	const dadY = 1310 + 90 * k;
	const dadS = 0.62 + 0.18 * k;
	const zoom = lerp(f, 56, 92, 1.0, 1.25, Easing.inOut(Easing.cubic));
	const headY = dadY - 1024 * dadS;
	const cam: Cam = {s: zoom, cx: 550, cy: 960 + (headY + 200 - 960) * lerp(f, 56, 92, 0, 1, Easing.inOut(Easing.cubic))};
	const grin = f > 62;
	return (
		<Stage
			cam={cam}
			light={{glow: 0.2, vignette: 0.7, tint: '#5a0000', tintOpacity: lerp(f, 60, 92, 0, 0.15)}}
		>
			<Wallpaper id="s15wp" x={-1000} y={-1000} w={3200} h={2300} base="#f0dcb0" line="#dfc490" />
			<Tiles y={780} h={520} />
			<rect x={380} y={600} width={360} height={700} fill="#2a1d18" />
			<rect x={360} y={580} width={20} height={720} fill="#6e3f22" />
			<rect x={740} y={580} width={20} height={720} fill="#6e3f22" />
			<rect x={360} y={580} width={400} height={20} fill="#6e3f22" />
			<Fridge x={880} y={520} h={780} />
			<PlankFloor y={1300} color="#b9824d" seam="#9a6638" />
			<Person
				kind="dad"
				id="s15dad"
				x={560}
				y={dadY}
				scale={dadS}
				walk={walking ? f / 4 : undefined}
				face={{eyes: grin ? 'open' : 'open', mouth: grin ? 'grin' : 'smile', look: grin ? [-0.7, 0.8] : [0, 0.2], brows: grin ? 'flat' : 'neutral', stubble: true, blush: false}}
				armL={{shoulder: walking ? Math.sin(f / 4) * 12 : 3, elbow: -3}}
				armR={{shoulder: walking ? -Math.sin(f / 4) * 12 : -3, elbow: 3}}
			/>
			{/* foreground: the son's hand holding the glowing phone */}
			<g transform={`translate(${250 + Math.sin(f / 9) * 4},${1560 + lerp(f, 60, 70, 0, -20)}) rotate(-12)`}>
				<rect x={-170} y={60} width={150} height={700} rx={60} fill="#d8862a" />
				<rect x={-150} y={-260} width={300} height={560} rx={44} fill="#15161a" />
				<rect x={-134} y={-244} width={268} height={528} rx={34} fill="#e9e3da" />
				<rect x={-134} y={-244} width={268} height={70} rx={20} fill="#f7f7f9" />
				<rect x={-118} y={-130} width={220} height={120} rx={20} fill="#fff" />
				<rect x={-104} y={-110} width={190} height={14} rx={7} fill="#c9c9cf" />
				<rect x={-104} y={-84} width={150} height={14} rx={7} fill="#f2cc4a" />
				<rect x={-104} y={-58} width={170} height={14} rx={7} fill="#c9c9cf" />
				<g transform="translate(-160,40) rotate(-80) scale(2.4)">
					<Hand r={24} skin="#f2c3a0" grip thumb={1} />
				</g>
				<rect x={-150} y={-260} width={300} height={560} rx={44} fill="#cfe6ff" opacity={0.08} />
			</g>
		</Stage>
	);
};

// --------------------------------------------------------------- SHOT 16 ---
// Finale: choose. Countdown 3-2-1.
export const S16: React.FC = () => {
	const f = useCurrentFrame();
	const flash = lerp(f, 0, 10, 0.9, 0);
	const title = pop(f, 6, 10);
	const c1 = pop(f, 8, 11);
	const c2 = pop(f, 40, 11);
	const nums = [
		{n: '3', at: 150},
		{n: '2', at: 180},
		{n: '1', at: 210},
	];
	const cur = [...nums].reverse().find((x) => f >= x.at);
	const final = f >= 236;
	const fp = pop(f, 236, 9);
	const pulse = final ? 1 + Math.sin((f - 236) / 4) * 0.03 : 1;
	// during the countdown the two answers blink in turn, like a vote
	const counting = f >= 150 && f < 236;
	const hot = counting ? (Math.floor((f - 150) / 15) % 2 === 0 ? 1 : 2) : 0;
	const endCard = interpolate(f, [252, 260], [0, 1], clamp);
	const card = (p: number, top: number, num: string, text: string, color: string, icon: string, idx: number) => (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top,
				width: 720,
				transform: `translateX(${(1 - p) * -800}px) scale(${pulse * (hot === idx ? 1.04 : 1)})`,
				background: hot === idx ? color : '#121214',
				border: `7px solid ${color}`,
				borderRadius: 28,
				padding: '26px 30px',
				display: 'flex',
				gap: 26,
				alignItems: 'center',
				boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
				boxSizing: 'border-box',
			}}
		>
			<div style={{minWidth: 110, height: 110, borderRadius: 55, background: color, color: '#fff', fontFamily: HEAVY, fontWeight: 900, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{num}</div>
			<div style={{fontFamily: HEAVY, fontWeight: 900, fontSize: 52, color: '#fff', lineHeight: 1.08}}>
				{text}
				<div style={{fontSize: 30, color, marginTop: 6}}>{icon}</div>
			</div>
		</div>
	);
	return (
		<AbsoluteFill>
			<Stage cam={{s: lerp(f, 0, 300, 1.0, 1.12), cx: 540, cy: 900}} light={{glow: 0, vignette: 0.9, tint: '#3a0000', tintOpacity: 0.35}} bg="#0a0505">
				<rect x={-500} y={-500} width={2200} height={3000} fill="#2a1d18" />
				<Bust kind="dad" id="s16" x={540} y={760} scale={3.6} face={{eyes: 'open', mouth: 'grin', look: [0, 0], pupil: 0.6, brows: 'flat', stubble: true, blush: false}} />
				<rect x={-500} y={-500} width={2200} height={3000} fill="#000" opacity={0.55} />
			</Stage>
			<div
				style={{
					position: 'absolute',
					top: 300,
					width: '100%',
					textAlign: 'center',
					fontFamily: HEAVY,
					fontWeight: 900,
					fontSize: 108,
					color: '#fff',
					transform: `scale(${title})`,
					textShadow: '0 8px 0 #7a0d0d, 0 0 30px rgba(255,40,40,0.6)',
				}}
			>
				ОН ИЛИ <span style={{color: '#ff3b30'}}>НЕ ОН?</span>
				<div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18}}>
					{[0, 1, 2, 3, 4, 5].map((i) => {
						const p = pop(f, 18 + i * 4, 9);
						return (
							<div key={i} style={{width: 74, height: 74, borderRadius: 14, background: '#e0342b', border: '4px solid #ff8a80', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
								<Cross size={40} width={5} />
							</div>
						);
					})}
				</div>
			</div>
			{card(c1, 680, '1', 'СКАЗАТЬ МАМЕ', '#3b82f6', 'всё рассказать прямо сейчас', 1)}
			<div style={{position: 'absolute', left: 60, width: 720, top: 905, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, fontSize: 44, color: '#e7c44a', opacity: c2}}>ИЛИ</div>
			{card(c2, 970, '2', 'ЗАДАТЬ КОНТРОЛЬНЫЙ ВОПРОС', '#e0342b', 'то, что знает только папа', 2)}
			{cur && !final && (
				<div
					style={{
						position: 'absolute',
						left: 420,
						top: 1340,
						width: 200,
						height: 200,
						marginLeft: -100,
						borderRadius: 100,
						background: '#e7c44a',
						border: '8px solid #111',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: HEAVY,
						fontWeight: 900,
						fontSize: 140,
						color: '#111',
						transform: `scale(${pop(f, cur.at, 8) * interpolate(f, [cur.at + 22, cur.at + 30], [1, 0.6], clamp)})`,
					}}
				>
					{cur.n}
				</div>
			)}
			{final && (
				<div style={{position: 'absolute', left: 40, width: 760, top: 1290, textAlign: 'center', fontFamily: HEAVY, fontWeight: 900, transform: `scale(${fp})`}}>
					<div style={{fontSize: 96, color: '#e7c44a', textShadow: '0 6px 0 #000'}}>ВЫБИРАЙ!</div>
					<div style={{fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000', marginTop: 6}}>ПИШИ 1 ИЛИ 2 В КОММЕНТАРИЯХ</div>
				</div>
			)}
			{endCard > 0 && (
				<AbsoluteFill style={{opacity: endCard, background: 'radial-gradient(circle at 50% 42%, #4a0d10 0%, #1a0607 55%, #0a0304 100%)'}}>
					<div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: HEAVY, fontWeight: 900}}>
						<div style={{fontSize: 36, letterSpacing: 12, color: '#ff4a3d'}}>ПАПА ВЕРНУЛСЯ С ВАХТЫ</div>
						<div style={{fontSize: 190, lineHeight: 1, color: '#fff', marginTop: 18, transform: `scale(${pop(f, 254, 10)})`}}>ЧАСТЬ 2</div>
						<div style={{fontSize: 56, color: '#ff3b30', marginTop: 8}}>СКОРО</div>
						<div style={{fontSize: 44, color: '#fff', marginTop: 70}}>СКАЗАТЬ МАМЕ ИЛИ СПРОСИТЬ?</div>
						<div style={{fontSize: 32, color: '#b9a9aa', marginTop: 10, letterSpacing: 2}}>ПИШИ В КОММЕНТАРИЯХ</div>
						<div
							style={{
								display: 'inline-block',
								marginTop: 60,
								background: '#ff2d3d',
								borderRadius: 60,
								padding: '22px 70px',
								fontSize: 52,
								color: '#fff',
								boxShadow: '0 0 40px rgba(255,45,61,0.6)',
								transform: `scale(${1 + Math.sin(f / 5) * 0.04})`,
							}}
						>
							ПОДПИШИСЬ
						</div>
					</div>
				</AbsoluteFill>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};
