// «ТГК открыт» — the 700-subscribers video: the Telegram channel is open (the payoff of the poll in src/t1).
// Authoring timeline = the voice (scripts/fit-voiceover.py --part t2).
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [2.4, 4.1, 3.233, 5.067, 1.833, 7.367];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
