// X-ray covers for «Каково это — умереть от лап медведя», in the manner of the «ЗАКОПАЛИ» cover (a radiograph cut out
// on the white page, one hand-written word, a thin arrow): a person screams (the jaw wide open) while a brown bear's
// paw — the thick forearm, five digits and long hooked claws — has sunk its claws into the shoulder by the neck.
// public/covers/xray-bear.jpg is computed by scripts/xray-cover/ (bear.sh): the person is the same open CT scan
// (TotalSegmentator s1380, CC BY 4.0) with the arms lowered; the paw is built from bone shapes with the same X-ray
// physics, the claws as a bony core inside a keratin sheath.
// Render: npx remotion still CoverMedvedXray out/cover/medved-xray.png
import React from 'react';
import {XrayCover} from './kit';

// the word sits over the skull; the arrow runs from its end through the gap between the head and the paw to the claws
export const CoverMedvedXray: React.FC = () => <XrayCover img="covers/xray-bear.jpg" word="ЗАДРАЛ" cx={820} arrow={{a: [1212, 150], c: [1085, 300], b: [1058, 470]}} />;
export const CoverMedvedXrayB: React.FC = () => <XrayCover img="covers/xray-bear.jpg" word="ОДИН УДАР" size={176} spacing={14} cx={800} arrow={{a: [1300, 140], c: [1110, 280], b: [1058, 470]}} />;
