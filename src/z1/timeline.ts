// «Каково это — замёрзнуть насмерть» — 16:9. Authoring timeline = the voice (scripts/fit-voiceover.py --part z1);
// until the author's recording is fitted these are estimates from the text length.
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [4.7, 4.86, 8.22, 6.22, 3.9, 8.54, 6.62, 5.66, 6.38, 6.22, 5.02, 7.58, 3.34, 8.06, 8.06, 7.98, 11.66, 6.54, 3.9, 7.18, 8.3, 5.26, 6.86, 5.18, 7.1, 9.82, 5.1, 4.22, 5.26, 5.18, 5.9, 5.98, 5.66, 6.86, 5.66, 4.78, 6.54, 8.78, 7.9, 11.66, 3.82, 8.62, 5.1, 7.98, 11.42, 8.94, 5.82, 9.18, 4.46, 9.74, 7.1, 7.34, 7.58, 3.34, 9.82, 8.06, 9.66, 8.86, 9.58, 4.22, 10.62, 5.9, 8.86, 5.98, 7.5, 5.02, 5.02, 3.9, 6.54, 6.86, 10.06, 6.7, 4.7, 5.74, 5.98, 7.82, 5.58, 7.1];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
