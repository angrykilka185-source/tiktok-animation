// Part 1 narration (see voiceCore.ts for the logic).
import cfg from './voice-lines.json';
import timings from './voice-timings.json';
import {shotStart} from './timeline';
import {makeVoice, Timing, VoiceCfg} from './voiceCore';

export type {CapChunk, CapWord, VoiceLine} from './voiceCore';

export const TIMINGS = ((timings as unknown as {lines?: Record<string, Timing>}).lines ?? {}) as Record<string, Timing>;

export const {VOICE, HAS_VOICE, VOICE_CAPTIONS} = makeVoice(cfg as VoiceCfg, TIMINGS, shotStart, 'voice');
