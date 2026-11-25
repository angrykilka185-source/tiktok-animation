// «Каково это — оказаться погребённым заживо» — a white X-ray cover (in the manner of a viral «ОТОРВАЛО» thumbnail):
// a radiograph of a coffin seen from above — a screaming skull (the jaw open) and two hands pressed against the lid —
// cut out on a white page, one hand-written word on top and a thin hand-drawn arrow at the hand.
// The radiograph (public/covers/xray-a.jpg) is computed, not drawn: scripts/xray-cover/ projects a real open CT scan
// (TotalSegmentator dataset, subject s1380, Wasserthal et al., CC BY 4.0) with the jaw opened and the arms re-posed,
// adds hands built from bone shapes with the same X-ray physics, and the coffin (wood, nails, handles).
// The word is set in Neucha (SIL OFL, Cyrillic).
// Render: npx remotion still CoverXrayA out/cover/xray-a.png
import React from 'react';
import {XrayCover} from './kit';

// the arrow runs from the end of the word over the coffin's corner down to the fingers of the right hand
// (the middle fingertip of that hand is at about 1288, 578)
export const CoverXrayA: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЗАКОПАЛИ" arrow={{a: [1585, 150], c: [1700, 420], b: [1312, 552]}} />;
// «Й» has a breve above the cap height, so this word sits lower
export const CoverXrayB: React.FC = () => <XrayCover img="covers/xray-a.jpg" word="ЖИВОЙ" spacing={40} top={44} arrow={{a: [1345, 165], c: [1580, 330], b: [1312, 552]}} />;
