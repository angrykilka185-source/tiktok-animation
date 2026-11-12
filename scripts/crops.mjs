// usage: node scripts/crops.mjs out.png "frame:x,y,w,h" ...   (full-res crops, glued horizontally, 0.6 scale)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [out, ...specs] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), enableCaching: true});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await openBrowser('chrome', {browserExecutable: fs.existsSync(exe) ? exe : null});
const composition = await selectComposition({serveUrl, id: 'PapaVakhta', puppeteerInstance: browser});
fs.mkdirSync(path.join(root, 'out/frames'), {recursive: true});
const args = [];
for (const sp of specs) {
	const [fr, box] = sp.split(':');
	const file = path.join(root, `out/frames/full_${fr}.png`);
	if (!fs.existsSync(file) || process.env.FRESH !== '0') await renderStill({composition, serveUrl, output: file, frame: Number(fr), imageFormat: 'png', puppeteerInstance: browser, overwrite: true});
	args.push(file, box ?? '0,0,1080,1920');
}
await browser.close({silent: true});
execFileSync('python3', ['-c', `
import sys
from PIL import Image
out=sys.argv[1]; a=sys.argv[2:]
ims=[]
for i in range(0,len(a),2):
    x,y,w,h=map(int,a[i+1].split(','))
    im=Image.open(a[i]).crop((x,y,x+w,y+h))
    s=min(1.0, 700/h)
    ims.append(im.resize((int(w*s),int(h*s))))
W=sum(i.width for i in ims); H=max(i.height for i in ims)
o=Image.new('RGB',(W,H),'black'); x=0
for im in ims: o.paste(im,(x,0)); x+=im.width
o.save(out)
`, out, ...args]);
console.log('wrote', out);
