// Part 2 narration; the opening lines are reused from part 1.
import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {TIMINGS as P1_TIMINGS} from '../voice';
import {makeVoice, Timing, VoiceCfg} from '../voiceCore';
import {shotStart} from './timeline';

const T = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;

export const {VOICE, HAS_VOICE, VOICE_CAPTIONS} = makeVoice(cfg as VoiceCfg, T, shotStart, 'voice2', {timings: P1_TIMINGS, audioDir: 'voice'});
