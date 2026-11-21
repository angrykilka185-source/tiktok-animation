// «Что будет, если ты попадёшь в СССР» — inside the school (16:9 art): the classroom with the green board, the
// canteen, the workshop (труд), the waste-paper collection; small close-up props (the diary, the notebook and the pen,
// the book coupon, the salary envelope, the flat waiting list).
import React from 'react';
import {rnd} from '../w1/kit';
import {FLOOR} from './home';

const SANSB = "'DejaVu Sans', sans-serif";
const HAND = "'DejaVu Serif', serif";

// the green board with the date written in chalk (as every Soviet lesson began)
export const Class81: React.FC<{written?: number}> = ({written = 1}) => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#e0dcc8" />
		<rect x={-800} y={-600} width={3600} height={900} fill="#d8e0d0" />
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill="#8a6a44" />
		{/* windows on the left */}
		{[-640, -260].map((wx) => (
			<g key={wx}>
				<rect x={wx} y={40} width={300} height={560} fill="#f4f0e8" />
				<rect x={wx + 16} y={56} width={268} height={528} fill="#a8d0f0" />
				<rect x={wx + 144} y={56} width={12} height={528} fill="#f4f0e8" />
				<rect x={wx + 16} y={300} width={268} height={10} fill="#f4f0e8" />
			</g>
		))}
		{/* portraits above the board (frames with generic silhouettes) */}
		{Array.from({length: 4}).map((_, k) => (
			<g key={k} transform={`translate(${380 + k * 300},40)`}>
				<rect x={0} y={0} width={150} height={190} fill="#c9a54a" />
				<rect x={14} y={14} width={122} height={162} fill="#e8e4d8" />
				<circle cx={75} cy={80} r={34} fill="#8a8f96" />
				<path d="M 26,176 Q 75,110 124,176 Z" fill="#8a8f96" />
			</g>
		))}
		{/* the board */}
		<rect x={380} y={270} width={1160} height={500} fill="#2e5a44" stroke="#6a4628" strokeWidth={20} />
		<text x={960} y={370} textAnchor="middle" fontFamily={HAND} fontStyle="italic" fontSize={56} fill="#f4f0e8" opacity={written}>
			Пятнадцатое мая.
		</text>
		<text x={960} y={450} textAnchor="middle" fontFamily={HAND} fontStyle="italic" fontSize={56} fill="#f4f0e8" opacity={written}>
			Классная работа.
		</text>
		<rect x={380} y={770} width={1160} height={24} fill="#6a4628" />
		<rect x={500} y={772} width={70} height={18} fill="#f4f0e8" />
		<rect x={1300} y={764} width={120} height={30} rx={6} fill="#7a7a6a" />
		{/* the globe */}
		<g transform="translate(1760,620)">
			<rect x={-60} y={180} width={120} height={20} fill="#5a3a22" />
			<rect x={-8} y={60} width={16} height={130} fill="#5a3a22" />
			<circle cx={0} cy={0} r={100} fill="#4a8ac8" />
			<path d="M -60,-50 Q -20,-80 20,-40 Q 40,0 0,30 Q -50,40 -60,-50 Z M 30,40 Q 70,30 80,60 Q 60,80 30,40 Z" fill="#6aa84a" />
		</g>
	</g>
);
// a school desk (парта) with its sloping lid; `open` 0…1 lifts the lid
export const Parta: React.FC<{x: number; y: number; s?: number; open?: number}> = ({x, y, s = 1, open = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-230} y={-10} width={460} height={30} fill="#2a5a3a" />
		<g transform={`rotate(${-open * 40} -230 -10)`}>
			<path d="M -230,-10 L 230,-10 L 220,-40 L -220,-40 Z" fill="#3a7a4a" />
		</g>
		<rect x={-220} y={20} width={440} height={130} fill="#2a5a3a" />
		<rect x={-200} y={150} width={20} height={120} fill="#2a2c30" />
		<rect x={180} y={150} width={20} height={120} fill="#2a2c30" />
		<rect x={-240} y={180} width={480} height={26} fill="#8a6a44" />
	</g>
);
// the canteen: the serving counter with pies, faceted glasses of compote, long tables
export const Canteen81: React.FC = () => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#e8e4d4" />
		<rect x={-800} y={-600} width={3600} height={1000} fill="#d8ecd8" />
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill="#9a8a72" />
		{Array.from({length: 30}).map((_, k) => (
			<rect key={k} x={-800 + k * 120} y={FLOOR} width={118} height={1000} fill={k % 2 ? '#a8987e' : '#8f7f66'} />
		))}
		<rect x={200} y={120} width={1520} height={80} fill="#c8282a" />
		<text x={960} y={180} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={56} fill="#fff" letterSpacing={8}>
			СТОЛОВАЯ
		</text>
		{/* the counter */}
		<rect x={-200} y={480} width={2320} height={60} fill="#c9c4b8" />
		<rect x={-200} y={540} width={2320} height={FLOOR - 540} fill="#a8a49a" />
		{Array.from({length: 7}).map((_, k) => (
			<g key={k} transform={`translate(${-100 + k * 330},470)`}>
				<rect x={-110} y={-20} width={220} height={22} rx={6} fill="#a8b0b8" />
				{[-60, 0, 60].map((px) => (
					<path key={px} d={`M ${px - 34},-20 Q ${px},-70 ${px + 34},-20 Z`} fill="#c8843a" />
				))}
			</g>
		))}
		{Array.from({length: 8}).map((_, k) => (
			<g key={k} transform={`translate(${-60 + k * 280},400)`}>
				<path d="M -26,0 L -22,-80 L 22,-80 L 26,0 Z" fill="#d8a0a0" opacity={0.85} />
				<path d="M -28,2 L -24,-82 L 24,-82 L 28,2 Z" fill="none" stroke="#dfeaf0" strokeWidth={4} />
			</g>
		))}
	</g>
);
// a pie and a faceted glass of compote (close-up props, local coords)
export const PieCompote: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		<path d="M -200,0 Q -110,-130 -20,0 Z" fill="#c8843a" />
		<path d="M -170,-30 Q -110,-90 -50,-30" stroke="#e8b06a" strokeWidth={8} fill="none" />
		<g transform="translate(110,0)">
			<path d="M -70,0 L -60,-220 L 60,-220 L 70,0 Z" fill="#c86a6a" opacity={0.75} />
			<path d="M -72,2 L -62,-224 L 62,-224 L 72,2 Z" fill="none" stroke="#e8f4f8" strokeWidth={6} />
			{[-40, -14, 14, 40].map((k) => (
				<line key={k} x1={k * 1.1} y1={-4} x2={k} y2={-200} stroke="#e8f4f8" strokeWidth={4} opacity={0.7} />
			))}
			<circle cx={-10} cy={-60} r={22} fill="#a84a4a" />
			<circle cx={22} cy={-36} r={16} fill="#a84a4a" />
		</g>
	</g>
);
// the workshop: a workbench with a vice and shavings (boys), a sewing machine (girls)
export const Workshop81: React.FC = () => (
	<g>
		<rect x={-800} y={-600} width={3600} height={2400} fill="#c8c0a8" />
		<rect x={-800} y={FLOOR} width={3600} height={1000} fill="#8a7a62" />
		{Array.from({length: 6}).map((_, k) => (
			<g key={k} transform={`translate(${-300 + k * 280},120)`}>
				<rect x={0} y={0} width={20} height={120} fill="#6a5a4a" />
				<path d="M -40,120 L 60,120 L 40,240 L -20,240 Z" fill={['#8a8f96', '#6a6f76', '#5a3a22'][k % 3]} />
			</g>
		))}
		<rect x={-300} y={560} width={1300} height={40} fill="#a8865e" />
		<rect x={-280} y={600} width={40} height={FLOOR - 600} fill="#6a4628" />
		<rect x={940} y={600} width={40} height={FLOOR - 600} fill="#6a4628" />
		<g transform="translate(160,560)">
			<rect x={-60} y={-90} width={120} height={90} fill="#5a5f66" />
			<rect x={-90} y={-110} width={180} height={26} fill="#6a6f76" />
		</g>
		{Array.from({length: 16}).map((_, k) => (
			<path key={k} d={`M ${300 + rnd(k) * 500},${555 - rnd(k * 3) * 20} q 20,-20 40,0`} stroke="#e8c890" strokeWidth={5} fill="none" />
		))}
		{/* the sewing machine */}
		<g transform="translate(1500,560)">
			<rect x={-300} y={0} width={600} height={40} fill="#a8865e" />
			<rect x={-280} y={40} width={30} height={FLOOR - 600} fill="#3a3a3a" />
			<rect x={250} y={40} width={30} height={FLOOR - 600} fill="#3a3a3a" />
			<path d="M -180,0 L -180,-160 Q -180,-200 -140,-200 L 160,-200 Q 200,-200 200,-160 L 200,-110 L 100,-110 L 100,0 Z" fill="#1a1c20" />
			<rect x={-160} y={-190} width={300} height={14} fill="#c9a54a" />
			<text x={20} y={-140} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={30} fill="#c9a54a" fontStyle="italic">
				Чайка
			</text>
			<circle cx={190} cy={-150} r={36} fill="#3a3a3a" />
		</g>
	</g>
);
// a stool (табуретка) being planed — `done` 0…1
export const Stool: React.FC<{done: number}> = ({done}) => (
	<g>
		<rect x={-140} y={-210} width={280} height={36} fill="#d8b47a" />
		{done > 0.3 && <rect x={-120} y={-174} width={24} height={174 * Math.min(1, done)} fill="#c8a06a" />}
		{done > 0.5 && <rect x={96} y={-174} width={24} height={174 * Math.min(1, done)} fill="#c8a06a" />}
	</g>
);
// the waste-paper collection: bundles of newspapers on a platform scale, the sign
export const Scrap81: React.FC<{kg?: number}> = ({kg = 20}) => (
	<g>
		<rect x={-800} y={-600} width={3600} height={1400} fill="#9fc4e0" />
		<rect x={-800} y={300} width={3600} height={500} fill="#d8cdb8" />
		{Array.from({length: 14}).map((_, k) => (
			<rect key={k} x={-760 + k * 260} y={360} width={140} height={200} fill="#8ea4b6" />
		))}
		<rect x={-800} y={760} width={3600} height={1000} fill="#8a8478" />
		<rect x={400} y={280} width={1120} height={110} fill="#c8282a" />
		<text x={960} y={356} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={64} fill="#fff" letterSpacing={6}>
			СБОР МАКУЛАТУРЫ
		</text>
		{/* the scale */}
		<g transform="translate(960,900)">
			<rect x={-260} y={-30} width={520} height={30} fill="#5a5f66" />
			<rect x={180} y={-420} width={30} height={390} fill="#5a5f66" />
			<rect x={120} y={-480} width={150} height={80} rx={8} fill="#f4f0e8" stroke="#5a5f66" strokeWidth={6} />
			<text x={195} y={-424} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight={700} fontSize={42} fill="#2a2c30">
				{kg} кг
			</text>
		</g>
	</g>
);
// a tied bundle of newspapers (centre-bottom at the origin)
export const Bundle: React.FC<{s?: number}> = ({s = 1}) => (
	<g transform={`scale(${s})`}>
		{Array.from({length: 6}).map((_, k) => (
			<rect key={k} x={-120 + (k % 2) * 6} y={-30 - k * 26} width={240} height={26} fill={k % 2 ? '#e8e0c8' : '#d8d0b8'} stroke="#b8b0a0" strokeWidth={2} />
		))}
		<line x1={-40} y1={0} x2={-40} y2={-186} stroke="#8a6a3a" strokeWidth={6} />
		<line x1={40} y1={0} x2={40} y2={-186} stroke="#8a6a3a" strokeWidth={6} />
	</g>
);
// the coupon for a book (талон / абонемент) — screen-space card
export const BookCoupon: React.FC = () => (
	<g>
		<rect x={-300} y={-180} width={600} height={360} rx={10} fill="#f0e6c8" stroke="#8a6a3a" strokeWidth={6} />
		<rect x={-270} y={-150} width={540} height={300} fill="none" stroke="#c8a06a" strokeWidth={3} strokeDasharray="10 6" />
		<text x={0} y={-80} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={42} fill="#6a3a1e">
			АБОНЕМЕНТ
		</text>
		<text x={0} y={-24} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={28} fill="#6a3a1e">
			на приобретение книги
		</text>
		<text x={0} y={60} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={54} fill="#c8282a">
			20 кг
		</text>
		<text x={0} y={110} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={24} fill="#6a3a1e">
			макулатуры
		</text>
	</g>
);
// the school diary (дневник) open: grades and the parent's signature line
export const Diary: React.FC<{grades?: number[]; sign?: number}> = ({grades = [5, 4, 2, 5, 3], sign = 0}) => (
	<g>
		<rect x={-520} y={-320} width={1040} height={640} rx={14} fill="#2a4a7a" />
		<rect x={-500} y={-300} width={490} height={600} fill="#f4f0e8" />
		<rect x={10} y={-300} width={490} height={600} fill="#f4f0e8" />
		<line x1={0} y1={-300} x2={0} y2={300} stroke="#c8c4b8" strokeWidth={6} />
		{['Математика', 'Русский язык', 'Физика', 'История', 'География'].map((sub, k) => (
			<g key={sub}>
				<line x1={-490} y1={-220 + k * 90} x2={-20} y2={-220 + k * 90} stroke="#8ab0d8" strokeWidth={2} />
				<text x={-480} y={-232 + k * 90} fontFamily={HAND} fontStyle="italic" fontSize={34} fill="#2a3a6a">
					{sub}
				</text>
				<text x={-70} y={-226 + k * 90} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={56} fill="#c8282a">
					{grades[k]}
				</text>
			</g>
		))}
		<text x={250} y={-200} textAnchor="middle" fontFamily={SANSB} fontWeight={700} fontSize={30} fill="#5a5f66">
			Подпись родителей
		</text>
		<line x1={60} y1={-110} x2={440} y2={-110} stroke="#8a8f96" strokeWidth={3} />
		{sign > 0 && <path d="M 80,-120 C 120,-180 150,-80 190,-140 C 220,-180 240,-100 290,-130 L 380,-140" stroke="#2a3a8a" strokeWidth={6} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - sign)} />}
	</g>
);
// a squared notebook (2 копейки) and a ballpoint pen (35 копеек) — the price tags are drawn by the caller
export const NotebookPen: React.FC = () => (
	<g>
		<rect x={-420} y={-280} width={460} height={600} rx={8} fill="#2a8a6a" />
		<rect x={-400} y={-260} width={420} height={560} fill="#f4f4f0" />
		{Array.from({length: 26}).map((_, k) => (
			<line key={`h${k}`} x1={-400} y1={-260 + k * 22} x2={20} y2={-260 + k * 22} stroke="#a8c8e8" strokeWidth={2} />
		))}
		{Array.from({length: 20}).map((_, k) => (
			<line key={`v${k}`} x1={-400 + k * 22} y1={-260} x2={-400 + k * 22} y2={300} stroke="#a8c8e8" strokeWidth={2} />
		))}
		<text x={-190} y={-180} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={38} fill="#2a8a6a">
			ТЕТРАДЬ
		</text>
		<g transform="translate(240,0) rotate(-30)">
			<rect x={-18} y={-300} width={36} height={520} rx={16} fill="#e8e4d8" stroke="#8a8f96" strokeWidth={4} />
			<path d="M -18,220 L 18,220 L 0,280 Z" fill="#8a8f96" />
			<rect x={-20} y={-320} width={40} height={60} rx={10} fill="#2a5aa8" />
			<line x1={0} y1={-260} x2={0} y2={200} stroke="#2a5aa8" strokeWidth={6} />
		</g>
	</g>
);
// the salary envelope and «≈ 4 salaries» for a colour TV
export const SalaryEnvelope: React.FC<{x?: number; y?: number; s?: number}> = ({x = 0, y = 0, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-200} y={-120} width={400} height={240} fill="#f0e6c8" stroke="#8a6a3a" strokeWidth={6} />
		<path d="M -200,-120 L 0,20 L 200,-120" stroke="#8a6a3a" strokeWidth={6} fill="none" />
		<text x={0} y={90} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={40} fill="#6a3a1e">
			≈ 170 руб.
		</text>
	</g>
);
// the flat waiting list on a notice board
export const FlatQueue: React.FC<{hi?: number}> = ({hi = 0}) => (
	<g>
		<rect x={-420} y={-360} width={840} height={720} fill="#c8a06a" />
		<rect x={-390} y={-330} width={780} height={660} fill="#f4f0e8" />
		<text x={0} y={-262} textAnchor="middle" fontFamily={SANSB} fontWeight={900} fontSize={40} fill="#2a2c30">
			ОЧЕРЕДЬ НА КВАРТИРУ
		</text>
		{Array.from({length: 11}).map((_, k) => (
			<g key={k}>
				<text x={-360} y={-200 + k * 48} fontFamily="'JetBrains Mono', monospace" fontWeight={700} fontSize={28} fill="#4a4f56">
					{`${1240 + k}.`}
				</text>
				<rect x={-250} y={-222 + k * 48} width={300 + rnd(k) * 260} height={20} rx={4} fill="#c8c4b8" />
				<text x={300} y={-200 + k * 48} fontFamily="'JetBrains Mono', monospace" fontWeight={700} fontSize={28} fill="#4a4f56">
					{1971 + Math.floor(k / 2)}
				</text>
			</g>
		))}
		{hi > 0 && <rect x={-370} y={-222 + 9 * 48 - 6} width={740} height={44} fill="none" stroke="#c8282a" strokeWidth={6} opacity={hi} />}
	</g>
);
