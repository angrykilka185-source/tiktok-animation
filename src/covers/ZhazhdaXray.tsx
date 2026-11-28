// X-ray covers for «Каково это — умереть от жажды», in the manner of «ЗАКОПАЛИ», «ЗАДРАЛ» and «СДАВИЛИ» (a radiograph cut
// out on the white page, one hand-written word, a thin arrow): a person seen from the side, the jaw open in a dry
// gasp, one arm stretched out with the fingers apart — towards a glass of water that stands just out of reach; the
// arrow points at the glass.
// public/covers/xray-thirst.jpg is computed by scripts/xray-cover/thirst.sh: the same open CT scan (TotalSegmentator
// s1380, CC BY 4.0) seen from the side with one arm reaching, the forearm and hand built from bone shapes with the same
// X-ray physics (the hand lies flat, palm to the viewer), and the glass (walls and water) in the same projection.
// Render: npx remotion still CoverZhazhdaXray out/cover/zhazhda-xray.png
import React from 'react';
import {XrayCover} from './kit';

export const CoverZhazhdaXray: React.FC = () => <XrayCover img="covers/xray-thirst.jpg" word="ЖАЖДА" cx={960} arrow={{a: [1500, 150], c: [1640, 300], b: [1660, 440]}} />;
export const CoverZhazhdaXrayB: React.FC = () => <XrayCover img="covers/xray-thirst.jpg" word="ПИТЬ…" cx={960} arrow={{a: [1500, 150], c: [1640, 300], b: [1660, 440]}} />;
