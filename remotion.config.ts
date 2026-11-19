import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
// big 3D (CSS) layers: let Chrome finish rasterising before it takes the frame — without this, parts of large
// layers (the back walls, the houses) are sometimes missing for a single frame and the background flickers
Config.setChromiumFlags({'run-all-compositor-stages-before-draw': true});
// Use the preinstalled headless Chromium if present (cloud/CI); otherwise Remotion downloads its own.
import fs from 'node:fs';
const local = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
