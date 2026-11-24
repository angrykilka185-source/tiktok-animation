// «Каково это — умереть от лап медведя» — 16:9. Authoring timeline = the voice (scripts/fit-voiceover.py --part z4)
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [7.4, 6.7, 4.467, 4.967, 7.067, 13.2, 11.933, 10.033, 6.267, 6.9, 6.367, 8.9, 8.7, 6.167, 6.4, 10.633, 8.2, 3.067, 10.367, 7.733, 7.167, 13.167, 2.967, 10.067, 5.033, 2.7, 10.967, 7.633, 10.767, 3.1, 13.433, 10.033, 5.0, 8.9, 3.167, 7.3, 9.3, 7.867, 7.5, 7.533, 7.767, 9.967, 6.567, 11.567, 7.7, 6.9, 7.133, 4.367, 5.6, 6.467, 7.5, 9.933, 12.4, 9.8, 8.067, 8.267, 11.667, 9.8, 6.133, 6.2, 3.167, 22.233, 2.533, 9.633, 3.467, 9.433];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
