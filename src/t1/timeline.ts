// «Открывать ТГК?» — a 30-second poll with the heroes of the channel's series.
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part t1 retimes it to the voice).
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [3.0, 3.267, 2.433, 4.267, 2.9, 1.933, 1.233, 9.467];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
