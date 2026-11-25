// X-ray covers for «Каково это — умереть от лап медведя», in the manner of the «ЗАКОПАЛИ» cover (a radiograph cut out
// on the white page, one hand-written word, a thin arrow): seen from the side, a person stands facing the bear and
// screams (the jaw wide open) — a brown bear's paw (the thick forearm, five digits, long hooked claws) is right in front
// of the face, the claws a finger's breadth away.
// public/covers/xray-bear.jpg is computed by scripts/xray-cover/ (bear.sh): the person is the same open CT scan
// (TotalSegmentator s1380, CC BY 4.0) seen from the side, the arms lowered; the paw is built from bone shapes with the
// same X-ray physics, the claws as a bony core inside a keratin sheath.
// Render: npx remotion still CoverMedvedXray out/cover/medved-xray.png
import React from 'react';
import {XrayCover} from './kit';

// the word sits over the skull; the arrow runs from its end over the paw down to the upper claw, by the face
export const CoverMedvedXray: React.FC = () => <XrayCover img="covers/xray-bear.jpg" word="ЗАДРАЛ" cx={800} arrow={{a: [1190, 150], c: [1290, 380], b: [1150, 600]}} />;
export const CoverMedvedXrayB: React.FC = () => <XrayCover img="covers/xray-bear.jpg" word="ОДИН УДАР" size={176} spacing={14} cx={790} arrow={{a: [1290, 140], c: [1330, 380], b: [1150, 600]}} />;
