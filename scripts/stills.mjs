// Fast preview: bundle once, render many stills, glue into a contact sheet.
// usage: node scripts/stills.mjs out/sheet.png 100 200 300 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [out, ...frames] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), enableCaching: true});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'PapaVakhta', puppeteerInstance: browser});
fs.mkdirSync(path.join(root, 'out/frames'), {recursive: true});
const files = [];
for (const fr of frames) {
	const file = path.join(root, `out/frames/${fr}.jpeg`);
	await renderStill({composition, serveUrl, output: file, frame: Number(fr), scale: 0.4, imageFormat: 'jpeg', puppeteerInstance: browser, overwrite: true});
	files.push(file);
}
await browser.close({silent: true});
execFileSync('python3', ['-c', `
import sys
from PIL import Image
ims=[Image.open(f) for f in sys.argv[2:]]
w,h=ims[0].size
o=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): o.paste(im,(i*w,0))
o.save(sys.argv[1])
`, out, ...files]);
console.log('wrote', out);
