// «Что будет, если ты попадёшь в СССР» — один день в 1981 году, 16:9. The authoring timeline = the voice
// (scripts/fit-voiceover.py --part u1); until the narration is voiced these are estimates from the text length.
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [5.86, 5.5, 5.64, 5.0, 4.57, 4.21, 3.71, 4.07, 5.0, 5.29, 4.07, 6.0, 6.5, 6.64, 4.29, 6.29, 5.93, 5.57, 4.64, 7.5, 5.36, 5.21, 5.29, 5.5, 5.57, 5.86, 4.64, 5.29, 6.29, 4.93, 6.57, 6.5, 6.43, 3.29, 3.97, 5.43, 6.14, 5.14, 5.29, 6.14, 4.64, 6.5, 5.71, 7.0, 6.86, 6.0, 6.14, 6.93, 8.0, 5.36, 5.21, 6.14, 5.71, 6.86, 5.57, 6.07, 3.54, 4.64, 4.86, 4.93, 5.57, 7.07, 6.21, 6.57, 7.29, 7.0, 7.36, 5.71, 5.5, 6.5, 6.96, 5.21, 3.43, 5.86, 5.86, 3.07, 4.59, 11.36];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
