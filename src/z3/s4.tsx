// «Каково это — оказаться погребённым заживо» — shots 65–67: the rescue dogs smell a person under metres of rubble;
// people are found alive days later (Bangladesh, 2013: seventeen days); the main thing is to hold on.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, pop} from '../anim';
import {Person} from '../components/Person';
import {Chip, HEAVY, INK, Plaque, RED, Rubble, Stage16, Vig, YEL, You} from './kit';
import {SHOTS} from './timeline';
import {w} from './voice';

const len = (n: number) => SHOTS[n - 1].duration;

// a rescue dog in an orange vest, sniffing (its nose at the origin's left); `run` — the trot phase (the legs swing)
const Dog: React.FC<{f: number; run?: number}> = ({f, run}) => (
	<g>
		<path d={`M 150,-60 q 50,${-30 + Math.sin(f / 3) * 14} 70,-60`} stroke="#8a5a2e" strokeWidth={16} fill="none" strokeLinecap="round" />
		<ellipse cx={60} cy={-60} rx={110} ry={50} fill="#a0662e" />
		<rect x={0} y={-104} width={120} height={70} rx={14} fill="#f08a2a" stroke={INK} strokeWidth={4} />
		<text x={60} y={-58} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={22} fill="#fff">
			SOS
		</text>
		{[-10, 30, 100, 140].map((x, k) => (
			<rect key={x} x={x} y={-30} width={20} height={60} rx={8} fill="#8a5a2e" transform={run === undefined ? undefined : `rotate(${Math.sin(run + (k % 2 ? Math.PI : 0) + (k > 1 ? Math.PI / 2 : 0)) * 24} ${x + 10} -30)`} />
		))}
		<g transform={`translate(-50,${-80 + Math.sin(f / 4) * 6})`}>
			<ellipse cx={0} cy={0} rx={50} ry={40} fill="#a0662e" />
			<ellipse cx={-48} cy={10} rx={26} ry={18} fill="#a0662e" />
			<circle cx={-70} cy={6} r={9} fill={INK} />
			<circle cx={-10} cy={-10} r={6} fill={INK} />
			<path d="M 10,-34 C 40,-50 50,-10 26,4 Z" fill="#6a4020" />
		</g>
	</g>
);

// ============================================================ 65. the dogs smell a person under metres of rubble =====
export const S65: React.FC = () => {
	const f = useCurrentFrame();
	const n = 65;
	const dogs = w(n, 'собаки') - 8;
	const smell = w(n, 'чуют') - 6;
	// the dog trots in from the right over the rubble and stops above Гога
	const D0 = dogs - 20;
	const D1 = dogs + 14;
	const dx = interpolate(f, [D0, D1], [2150, 1060], {...clamp, easing: (t) => t * (1.5 - 0.5 * t)});
	const trot = f >= D0 && f < D1 ? (10 * Math.PI * (f - D0)) / (D1 - D0) : undefined;
	return (
		<AbsoluteFill>
			<Stage16 bg="#3a3a40">
				<Rubble />
				<rect x={700} y={520} width={520} height={300} fill="#141418" />
				<g transform="translate(1180,700) rotate(-90)">
					<You x={0} y={0} s={0.42} f={f} face={{eyes: 'open', brows: 'worried', mouth: 'tight', look: [0, -0.6]}} />
				</g>
				{f >= D0 && (
					<g transform={`translate(${dx},${270 + (trot === undefined ? 0 : -Math.abs(Math.sin(trot)) * 8)})`}>
						<Dog f={f} run={trot} />
					</g>
				)}
				{f >= smell &&
					[0, 1, 2].map((k) => {
						const t = ((f - smell) / 24 + k / 3) % 1;
						return <path key={k} d={`M ${960 - 30 + k * 30},${560 - t * 260} q 20,-20 0,-40 q -20,-20 0,-40`} stroke="#ffd36a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={(1 - t) * 0.9} />;
					})}
			</Stage16>
			<Vig k={0.4} />
			<Chip f={f} at={dogs + 4} x={560} y={180} text="СОБАКИ-СПАСАТЕЛИ" color="#f08a2a" size={48} />
			<Chip f={f} at={smell + 8} x={560} y={290} text="ЧУЮТ ЧЕРЕЗ МЕТРЫ ОБЛОМКОВ" color="#16161c" size={38} />
		</AbsoluteFill>
	);
};

// ============================================================ 66. found alive days later; Bangladesh 2013: seventeen days =====
export const S66: React.FC = () => {
	const f = useCurrentFrame();
	const n = 66;
	const year = w(n, 'тысячи') - 6;
	const seventeen = w(n, 'семнадцать') - 10;
	const day = Math.max(1, Math.round(interpolate(f, [year, seventeen], [1, 17], clamp)));
	return (
		<AbsoluteFill style={{background: '#eef2f6'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
				<g transform="translate(560,540)">
					<rect x={-230} y={-260} width={460} height={500} rx={30} fill="#fff" stroke={INK} strokeWidth={8} />
					<rect x={-230} y={-260} width={460} height={120} rx={30} fill={RED} />
					<rect x={-230} y={-170} width={460} height={30} fill={RED} />
					<text x={0} y={-180} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#fff">
						ДЕНЬ
					</text>
					<text x={0} y={120} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={230} fill={day >= 17 ? RED : INK}>
						{day}
					</text>
				</g>
				{f >= year && (
					<g transform={`translate(1340,420) scale(${pop(f, year, 11)})`}>
						<rect x={-150} y={-100} width={300} height={200} rx={10} fill="#0a7a4a" stroke={INK} strokeWidth={6} />
						<circle cx={-20} cy={0} r={60} fill="#e8352e" />
						<text x={0} y={170} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={48} fill={INK}>
							БАНГЛАДЕШ · 2013
						</text>
					</g>
				)}
			</svg>
			<Plaque f={f} at={2} x={960} y={110} text="НАХОДЯТ ЖИВЫМИ И ЧЕРЕЗ ДНИ" color="#3aa86a" size={48} />
			<Chip f={f} at={seventeen + 6} x={1340} y={800} text="17 ДНЕЙ ПОД ОБЛОМКАМИ — ЖИВА" color={RED} size={40} />
		</AbsoluteFill>
	);
};

// ============================================================ 67. «Главное — дождаться» =====
export const S67: React.FC = () => {
	const f = useCurrentFrame();
	const beam = interpolate(f, [0, 20], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Stage16 bg="#3a3a40">
				<Rubble />
				<rect x={700} y={520} width={520} height={300} fill="#141418" />
				<path d={`M 1010,70 L ${930 - beam * 60},700 L ${1090 + beam * 60},700 Z`} fill="#fff6c8" opacity={0.35 * beam} />
				<g transform="translate(1180,700) rotate(-90)">
					<You x={0} y={0} s={0.42} f={f} face={{eyes: 'open', brows: 'raised', mouth: 'smile', look: [0, -0.8]}} />
				</g>
				<Person kind="dad" id="z67r" x={1010} y={196} scale={0.15} colors={{top: '#f08a2a', topDark: '#d47222', pants: '#2a3040', shoes: '#1d1410', hair: '#3a2a20', skin: '#e8c8a0'}} hat={{type: 'peak', color: '#f2c230'}} face={{eyes: 'open', mouth: 'open', brows: 'raised', blush: false, look: [0, 0.8]}} />
			</Stage16>
			<Vig k={0.4} />
			<Chip f={f} at={2} x={560} y={210} text="ДОЖДАТЬСЯ" color="#3aa86a" size={60} />
		</AbsoluteFill>
	);
};

export const _Y = YEL;
