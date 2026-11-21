// «Что будет, если ты попадёшь в СССР» — один день в 1981 году, 16:9. The authoring timeline = the voice
// (scripts/fit-voiceover.py --part u1); until the narration is voiced these are estimates from the text length.
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [4.7, 5.1, 5.833, 3.633, 4.133, 4.567, 3.633, 3.567, 4.233, 4.333, 3.8, 4.9, 6.3, 5.9, 3.133, 5.433, 4.867, 5.067, 4.667, 6.567, 5.667, 4.8, 5.1, 5.067, 4.433, 5.333, 4.233, 4.467, 5.2, 4.467, 5.5, 5.4, 6.567, 3.0, 3.6, 4.9, 5.767, 4.4, 4.433, 5.5, 4.1, 5.4, 5.0, 6.0, 5.467, 5.533, 5.233, 6.0, 7.2, 4.667, 4.767, 4.867, 5.2, 6.767, 5.5, 4.933, 3.433, 4.267, 4.533, 4.533, 4.933, 6.2, 5.3, 6.033, 5.867, 6.867, 6.1, 4.6, 5.467, 5.967, 6.4, 5.033, 3.433, 5.467, 5.133, 2.833, 4.467, 12.967];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
