// X-ray covers for «Каково это — попасть в давку», in the manner of «ЗАКОПАЛИ» and «ЗАДРАЛ» (a radiograph cut out on
// the white page, one hand-written word, a thin arrow): a crowd pressed shoulder to shoulder — seven people, the one in
// the middle screaming, his chest squeezed narrow between the neighbours who lean into him; the arrow points at his ribs.
// public/covers/xray-crowd.jpg is computed by scripts/xray-cover/crowd.sh: the same open CT scan (TotalSegmentator
// s1380, CC BY 4.0) rendered front-on and turned a quarter, mouth open and closed, then laid side by side with
// stage_crowd.py — where the bodies overlap, the X-ray paths add up, as in a real radiograph.
// Render: npx remotion still CoverDavkaXray out/cover/davka-xray.png
import React from 'react';
import {XrayCover} from './kit';

export const CoverDavkaXray: React.FC = () => <XrayCover img="covers/xray-crowd.jpg" word="СДАВИЛИ" arrow={{a: [1188, 222], c: [1175, 560], b: [1072, 905]}} />;
export const CoverDavkaXrayB: React.FC = () => <XrayCover img="covers/xray-crowd.jpg" word="НЕ ВДОХНУТЬ" size={170} spacing={14} top={36} arrow={{a: [1188, 222], c: [1175, 560], b: [1072, 905]}} />;
