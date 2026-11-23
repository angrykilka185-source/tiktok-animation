// «Каково это — оказаться погребённым заживо» — 16:9. Authoring timeline = the voice (scripts/fit-voiceover.py --part z3)
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [6.533, 8.6, 2.133, 5.333, 6.2, 13.333, 7.9, 5.267, 5.0, 5.467, 11.1, 4.667, 3.033, 6.267, 8.8, 3.6, 6.933, 5.533, 9.833, 2.667, 8.633, 4.233, 3.4, 6.667, 9.6, 7.867, 1.933, 18.7, 9.567, 8.2, 11.1, 6.767, 7.6, 6.167, 11.533, 11.033, 10.8, 8.933, 4.633, 8.967, 8.1, 3.4, 10.167, 3.633, 7.1, 13.2, 8.2, 4.667, 8.267, 12.133, 7.6, 8.5, 11.167, 8.9, 5.633, 3.8, 7.467, 7.167, 12.3, 3.233, 5.667, 6.667, 6.9, 14.533, 6.333, 10.567, 1.0, 4.5, 12.933, 2.833, 8.567, 4.033, 9.067];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
