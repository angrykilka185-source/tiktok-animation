// «Каково это — замёрзнуть насмерть» — 16:9. Authoring timeline = the voice (scripts/fit-voiceover.py --part z1);
// until the author's recording is fitted these are estimates from the text length.
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [5.467, 5.667, 8.5, 7.567, 4.9, 8.3, 6.1, 5.833, 6.267, 5.7, 6.133, 8.6, 3.367, 7.967, 8.033, 8.033, 12.2, 7.367, 3.633, 7.233, 8.733, 4.7, 6.333, 5.0, 6.833, 9.467, 5.3, 4.4, 5.833, 5.1, 5.2, 5.9, 6.0, 6.6, 6.133, 4.767, 7.567, 7.3, 7.2, 12.333, 3.633, 7.933, 4.633, 8.067, 11.667, 8.967, 5.767, 9.4, 5.233, 9.433, 6.667, 7.033, 6.3, 2.767, 10.333, 7.5, 9.567, 8.533, 9.333, 4.3, 9.567, 5.333, 9.2, 6.033, 7.833, 5.067, 5.767, 3.033, 5.9, 6.1, 8.4, 7.567, 4.667, 5.667, 7.067, 8.233, 4.4, 8.8];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
