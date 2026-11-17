// «Открывать ТГК?» — a 30-second poll with the heroes of the channel's series.
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part t1 retimes it to the voice).
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [3.2, 5.0, 3.6, 5.2, 3.8, 3.0, 1.8, 10];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
