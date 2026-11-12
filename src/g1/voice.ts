import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {makeVoice, Timing, VoiceCfg} from '../voiceCore';
import {shotStart} from './timeline';

const T = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;

export const {VOICE, HAS_VOICE, VOICE_CAPTIONS} = makeVoice(cfg as VoiceCfg, T, shotStart, 'voice-g1');
