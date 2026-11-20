// «Что будет, если ты попадёшь в XX век» — a long standalone film. Each 10 % of the phone's battery = 10 years.
// Authoring timeline = the voice (scripts/fit-voiceover.py --part w1).
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [5.9, 4.7, 5.1, 5.067, 3.9, 6.767, 5.633, 6.867, 4.067, 6.633, 3.133, 5.7, 5.6, 5.8, 2.633, 5.9, 4.767, 5.733, 5.133, 5.767, 5.2, 2.167, 5.7, 4.4, 5.167, 6.333, 4.9, 2.1, 6.367, 5.1, 5.5, 5.0, 4.033, 2.167, 5.967, 6.133, 5.767, 2.4, 4.9, 7.067, 3.267, 2.333, 2.0, 6.667, 3.667, 3.233, 5.467, 2.0, 7.633, 4.233, 3.667, 3.867, 4.233, 2.067, 7.233, 3.8, 6.067, 4.833, 1.967, 5.767, 6.2, 3.967, 2.667, 5.333, 3.4, 2.3, 5.6, 4.3, 11.167];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
