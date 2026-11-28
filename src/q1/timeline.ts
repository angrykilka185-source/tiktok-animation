// «Что лучше: длинные или короткие?» — Чоби и Гога спрашивают зрителей, какие видео им нравятся больше (9:16, ≈25 с).
// Authoring timeline ≈ the final edit (scripts/fit-voiceover.py --part q1 retimes the picture to the voice).
import {FPS, makeShots} from '../timeline';

export const SHOT_SECONDS = [2.6, 4.6, 3.8, 2.8, 4.4, 3.6, 3.0];
const built = makeShots(SHOT_SECONDS);
export const SHOTS = built.shots;
export const TOTAL = built.total;
export const shotStart = built.shotStart;
export {FPS};
