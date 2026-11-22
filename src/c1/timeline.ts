// «Откуда взялись чипсы» — история продукта, 9:16. Authoring timeline = the voice
// (scripts/fit-voiceover.py --part c1); until the voice is fitted these are estimates from the text length.
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [2.567, 2.9, 2.2, 3.1, 4.833, 3.0, 4.067, 4.1, 2.7, 4.2, 5.0, 3.8, 6.767, 7.467, 3.133, 7.567, 5.933, 1.567, 2.9, 6.133, 4.967, 3.733, 2.867, 5.233, 1.767, 6.867, 1.6, 3.5, 1.6, 7.033];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
