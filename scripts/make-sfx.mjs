// Procedural sound-effect generator: no samples, no music, no voice.
// Writes 44.1 kHz mono 16-bit WAV files into public/sfx/.
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'sfx');
fs.mkdirSync(OUT, {recursive: true});

// deterministic random
let seed = 12345;
const rnd = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));

// simple one-pole filters
const lowpass = (x, fc) => {
	const a = Math.exp((-2 * Math.PI * fc) / SR);
	let y = 0;
	const out = new Float32Array(x.length);
	for (let i = 0; i < x.length; i++) out[i] = y = (1 - a) * x[i] + a * y;
	return out;
};
const highpass = (x, fc) => {
	const lp = lowpass(x, fc);
	return x.map((v, i) => v - lp[i]);
};
const bandpass = (x, lo, hi) => lowpass(highpass(x, lo), hi);

// biquad resonant bandpass
const reso = (x, f, q) => {
	const w = (2 * Math.PI * f) / SR;
	const alpha = Math.sin(w) / (2 * q);
	const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
	const out = new Float32Array(x.length);
	let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
	for (let i = 0; i < x.length; i++) {
		const y = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0;
		x2 = x1; x1 = x[i]; y2 = y1; y1 = y;
		out[i] = y;
	}
	return out;
};

const add = (dst, src, at = 0, gain = 1) => {
	const o = Math.floor(at * SR);
	for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
	return dst;
};

// tiny feedback-delay "room"
const room = (x, mix = 0.25, size = 1) => {
	const out = new Float32Array(x.length);
	const taps = [0.023, 0.031, 0.041, 0.053].map((t) => Math.floor(t * size * SR));
	const lines = taps.map((n) => ({buf: new Float32Array(n), i: 0}));
	for (let i = 0; i < x.length; i++) {
		let wet = 0;
		for (const l of lines) {
			const d = l.buf[l.i];
			wet += d;
			l.buf[l.i] = x[i] + d * 0.62;
			l.i = (l.i + 1) % l.buf.length;
		}
		out[i] = x[i] * (1 - mix) + wet * 0.25 * mix;
	}
	return out;
};

const normalize = (x, peak = 0.9) => {
	let m = 0;
	for (const v of x) m = Math.max(m, Math.abs(v));
	if (m === 0) return x;
	return x.map((v) => (v / m) * peak);
};

const fade = (x, inS = 0.005, outS = 0.02) => {
	const a = Math.floor(inS * SR), b = Math.floor(outS * SR);
	for (let i = 0; i < a && i < x.length; i++) x[i] *= i / a;
	for (let i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= i / b;
	return x;
};

const write = (name, x, peak = 0.9) => {
	x = fade(normalize(x, peak));
	const n = x.length;
	const b = Buffer.alloc(44 + n * 2);
	b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8);
	b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
	b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
	b.write('data', 36); b.writeUInt32LE(n * 2, 40);
	for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
	fs.writeFileSync(path.join(OUT, name + '.wav'), b);
	console.log('sfx', name, (n / SR).toFixed(2) + 's');
};

// ---------- building blocks ----------
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

const ping = (freqs, dur, decay, gain = 1) => {
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		let v = 0;
		freqs.forEach((f, k) => (v += Math.sin(2 * Math.PI * f * t) * Math.exp(-t / (decay / (1 + k * 0.4))) / (k + 1)));
		x[i] = v * gain * Math.min(1, t / 0.001);
	}
	return x;
};

const click = (dur = 0.02, f = 3000, q = 3) => {
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) x[i] = noise() * Math.exp(-i / SR / 0.003);
	return reso(x, f, q);
};

const thump = (f0 = 90, dur = 0.25, d = 0.06, noiseAmt = 0.3) => {
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = f0 * (1 + 1.5 * Math.exp(-t / 0.015));
		ph += (2 * Math.PI * f) / SR;
		x[i] = Math.sin(ph) * Math.exp(-t / d) + noise() * noiseAmt * Math.exp(-t / 0.01);
	}
	return lowpass(x, 1200);
};

const step = (f0 = 70) => {
	const x = thump(f0, 0.22, 0.05, 0.5);
	add(x, lowpass(click(0.05, 1800, 1.5), 4000), 0.005, 0.25);
	return x;
};

// ---------- sounds ----------

// keys jingling + insert + turn
{
	const x = buf(1.6);
	for (let k = 0; k < 14; k++) {
		const f = 2600 + rnd() * 3800;
		add(x, ping([f, f * 1.47, f * 2.13], 0.25, 0.04 + rnd() * 0.05, 0.5), rnd() * 0.7, 0.4 + rnd() * 0.4);
	}
	// scrape of insertion
	const s = buf(0.35);
	for (let i = 0; i < s.length; i++) s[i] = noise() * (0.5 + 0.5 * Math.sin(i / SR * 2 * Math.PI * 38)) * 0.6;
	add(x, bandpass(s, 1500, 6000), 0.8, 0.6);
	add(x, click(0.03, 2500, 4), 1.2, 1);
	add(x, click(0.03, 1800, 4), 1.28, 0.8);
	write('keys', room(x, 0.2));
}

// lock click (two-stage latch)
{
	const x = buf(0.5);
	add(x, click(0.04, 1600, 5), 0.0, 1);
	add(x, thump(180, 0.1, 0.02, 0.2), 0.0, 0.5);
	add(x, click(0.04, 2400, 6), 0.11, 0.9);
	add(x, thump(140, 0.1, 0.02, 0.2), 0.11, 0.4);
	write('lock', room(x, 0.3));
}

// door creak: stick-slip pulse train with wandering pitch
{
	const dur = 1.8;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = 26 + 18 * Math.sin(t * 2.1) + 12 * Math.sin(t * 7.3) + 6 * noise() * 0.1;
		ph += f / SR;
		const pulse = Math.exp(-((ph % 1) * 40));
		const amp = Math.sin(Math.PI * Math.min(1, t / dur)) ** 0.6;
		x[i] = pulse * amp;
	}
	let y = add(add(reso(x, 640, 8), reso(x, 1310, 10), 0, 0.6), reso(x, 2100, 12), 0, 0.3);
	write('creak', room(y, 0.35, 1.3));
}

// short floor creak
{
	const dur = 0.7;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (40 + 30 * Math.sin(t * 9)) / SR;
		x[i] = Math.exp(-((ph % 1) * 30)) * Math.sin((Math.PI * t) / dur);
	}
	write('floorcreak', room(add(reso(x, 420, 6), reso(x, 900, 8), 0, 0.5), 0.3));
}

// cloth slap (towel drop)
{
	const x = buf(0.45);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = noise() * env(t, 0.012, 0.05);
	}
	let y = lowpass(highpass(x, 120), 1800);
	add(y, thump(70, 0.2, 0.04, 0), 0.01, 0.4);
	write('cloth', room(y, 0.15));
}

// gasp (sharp inhale)
{
	const dur = 0.75;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const a = t < 0.12 ? t / 0.12 : Math.exp(-(t - 0.12) / 0.25);
		x[i] = noise() * a;
	}
	let y = add(reso(x, 1200, 2), reso(x, 2600, 3), 0, 0.7);
	add(y, highpass(x, 3000), 0, 0.3);
	write('gasp', room(y, 0.2), 0.7);
}

// footsteps (4 steps)
{
	const x = buf(2.0);
	[0, 0.45, 0.9, 1.35].forEach((t, k) => add(x, step(65 + (k % 2) * 8), t, 1 - k * 0.05));
	write('steps', room(x, 0.3));
}
// slow steps (2)
{
	const x = buf(1.6);
	[0, 0.75].forEach((t) => add(x, step(60), t, 1));
	write('steps_slow', room(x, 0.35));
}

// pat on shoulder
{
	const x = buf(0.3);
	for (let i = 0; i < x.length; i++) x[i] = noise() * Math.exp(-i / SR / 0.018);
	let y = add(bandpass(x, 300, 2500), thump(110, 0.2, 0.03, 0), 0, 0.6);
	write('pat', room(y, 0.15));
}

// plate on table (ceramic clink + thud)
{
	const x = buf(1.0);
	add(x, thump(120, 0.3, 0.05, 0.2), 0, 0.8);
	add(x, ping([2140, 3410, 5230, 6890], 0.9, 0.18), 0.003, 0.5);
	add(x, ping([2210, 3600], 0.5, 0.08), 0.09, 0.25);
	write('plate', room(x, 0.25));
}

// gulp of water
{
	const x = buf(0.9);
	const gulp = (at, f0) => {
		const g = buf(0.18);
		let ph = 0;
		for (let i = 0; i < g.length; i++) {
			const t = i / SR;
			ph += (2 * Math.PI * (f0 + 500 * t)) / SR;
			g[i] = Math.sin(ph) * Math.sin((Math.PI * t) / 0.18) ** 2;
		}
		add(x, g, at);
	};
	gulp(0.05, 180); gulp(0.38, 160);
	for (let k = 0; k < 6; k++) add(x, ping([700 + rnd() * 900], 0.06, 0.012, 0.3), 0.02 + rnd() * 0.6);
	write('gulp', room(lowpass(x, 2500), 0.15));
}

// fork clink
{
	const x = buf(0.9);
	add(x, ping([3120, 4870, 7020, 9300], 0.9, 0.22), 0, 1);
	add(x, click(0.02, 5000, 2), 0, 0.5);
	write('fork', room(x, 0.25));
}

// clock ticking (tick-tock for 6 s)
{
	const x = buf(6.2);
	for (let k = 0; k < 12; k++) add(x, click(0.03, k % 2 ? 2600 : 3300, 10), 0.05 + k * 0.5, k % 2 ? 0.7 : 1);
	write('tick', room(x, 0.25), 0.6);
}

// heartbeat (lub-dub) - single beat, and a loop of 6s accelerating
const beat = (gain = 1) => {
	const x = buf(0.6);
	add(x, thump(48, 0.35, 0.07, 0.05), 0, 1 * gain);
	add(x, thump(55, 0.3, 0.05, 0.05), 0.2, 0.7 * gain);
	return x;
};
{
	const x = buf(6.2);
	let t = 0.1, period = 0.95;
	while (t < 5.8) {
		add(x, beat(0.6 + (t / 6) * 0.4), t);
		t += period;
		period = Math.max(0.5, period * 0.92);
	}
	write('heart', lowpass(x, 400), 0.95);
}
{
	// one huge heartbeat with long tail
	const x = buf(2.2);
	add(x, thump(40, 1.2, 0.18, 0.1), 0, 1);
	add(x, thump(46, 1.0, 0.14, 0.05), 0.26, 0.75);
	write('heart_big', room(lowpass(x, 350), 0.45, 2.2), 0.98);
}

// wall bump
{
	const x = buf(0.8);
	add(x, thump(65, 0.7, 0.12, 0.6), 0, 1);
	add(x, thump(130, 0.3, 0.04, 0.3), 0.005, 0.4);
	write('bump', room(x, 0.3, 1.2));
}

// sign stamp: sharp click + punchy hit
{
	const x = buf(0.6);
	add(x, click(0.03, 4200, 3), 0, 1);
	add(x, click(0.03, 2400, 3), 0.012, 0.7);
	add(x, thump(95, 0.4, 0.07, 0.4), 0.0, 0.9);
	// short whoosh lead-in tail
	const w = buf(0.25);
	for (let i = 0; i < w.length; i++) w[i] = noise() * Math.exp(-i / SR / 0.06);
	add(x, bandpass(w, 2000, 9000), 0, 0.25);
	write('stamp', room(x, 0.2));
}

// whoosh (transition)
{
	const dur = 0.5;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = noise() * Math.sin((Math.PI * t) / dur) ** 2;
	}
	// sweeping resonance
	const out = new Float32Array(x.length);
	const chunk = 512;
	for (let s = 0; s < x.length; s += chunk) {
		const f = 400 + 3000 * (s / x.length);
		const seg = reso(x.slice(Math.max(0, s - 2048), s + chunk), f, 1.2);
		out.set(seg.slice(seg.length - Math.min(chunk, x.length - s)), s);
	}
	write('whoosh', out, 0.6);
}

// whisper without words: syllable-modulated hiss
{
	const dur = 3.2;
	const x = buf(dur);
	const sylls = [];
	let t = 0.1;
	while (t < dur - 0.3) {
		const l = 0.09 + rnd() * 0.16;
		sylls.push([t, l, 0.5 + rnd() * 0.5]);
		t += l + 0.03 + (rnd() < 0.2 ? 0.25 : 0.02);
	}
	for (let i = 0; i < x.length; i++) {
		const tt = i / SR;
		let a = 0;
		for (const [s, l, g] of sylls) if (tt >= s && tt < s + l) a = g * Math.sin((Math.PI * (tt - s)) / l);
		x[i] = noise() * a;
	}
	let y = add(add(reso(x, 2400, 2.5), reso(x, 4300, 3), 0, 0.8), reso(x, 1100, 2), 0, 0.4);
	write('whisper', room(y, 0.2), 0.6);
}

// tap water (running + droplets)
{
	const dur = 5.2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) x[i] = noise();
	let y = bandpass(x, 600, 5000);
	y = y.map((v, i) => v * 0.35 * Math.min(1, i / SR / 0.3));
	for (let k = 0; k < 120; k++) {
		const f = 500 + rnd() * 1800;
		const b = buf(0.04);
		let ph = 0;
		for (let i = 0; i < b.length; i++) {
			ph += (2 * Math.PI * f * (1 + i / b.length)) / SR;
			b[i] = Math.sin(ph) * Math.exp(-i / SR / 0.01);
		}
		add(y, b, rnd() * (dur - 0.1), 0.25);
	}
	write('water', room(y, 0.2), 0.5);
}

// slow heavy breathing (2 cycles)
{
	const dur = 6.2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const c = (t % 3.0) / 3.0;
		const a = c < 0.45 ? Math.sin((Math.PI * c) / 0.45) * 0.8 : c < 0.95 ? Math.sin((Math.PI * (c - 0.45)) / 0.5) : 0;
		x[i] = noise() * a;
	}
	let y = add(reso(x, 500, 1.5), reso(x, 1300, 2), 0, 0.5);
	write('breath', room(lowpass(y, 2000), 0.3), 0.6);
}

// fridge hum
{
	const dur = 6.2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] =
			Math.sin(2 * Math.PI * 50 * t) * 0.6 +
			Math.sin(2 * Math.PI * 100 * t) * 0.4 +
			Math.sin(2 * Math.PI * 150 * t) * 0.15 +
			Math.sin(2 * Math.PI * 200.5 * t) * 0.1 +
			noise() * 0.04;
		x[i] *= 0.85 + 0.15 * Math.sin(t * 1.3);
	}
	write('fridge', lowpass(x, 900), 0.45);
}

// phone vibration bursts
{
	const x = buf(3.6);
	[0.1, 0.75, 1.6, 2.25].forEach((s) => {
		const b = buf(0.45);
		for (let i = 0; i < b.length; i++) {
			const t = i / SR;
			const sq = Math.sign(Math.sin(2 * Math.PI * 165 * t)) * 0.5 + Math.sin(2 * Math.PI * 330 * t) * 0.3;
			b[i] = sq * Math.min(1, t / 0.01) * Math.min(1, (0.45 - t) / 0.02);
		}
		add(x, b, s);
		// rattle on table
		const r = buf(0.45);
		for (let i = 0; i < r.length; i++) r[i] = noise() * (Math.sin(2 * Math.PI * 82 * i / SR) > 0.7 ? 1 : 0) * 0.3;
		add(x, bandpass(r, 800, 4000), s, 0.6);
	});
	write('vibrate', lowpass(x, 3500), 0.8);
}

// message notification (two-tone)
{
	const x = buf(1.0);
	add(x, ping([1318.5, 2637], 0.6, 0.14), 0, 1);
	add(x, ping([1760, 3520], 0.7, 0.2), 0.13, 1);
	write('message', room(x, 0.2), 0.75);
}

// countdown beep / final beep
{
	const x = ping([880, 1760], 0.35, 0.09);
	write('beep', x, 0.6);
	const y = ping([1320, 2640], 0.8, 0.25);
	write('beep_final', y, 0.7);
}

// sub boom for the reveal
{
	const x = buf(2.0);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (35 + 60 * Math.exp(-t / 0.08))) / SR;
		x[i] = Math.sin(ph) * Math.exp(-t / 0.5) + noise() * 0.3 * Math.exp(-t / 0.03);
	}
	write('boom', room(lowpass(x, 600), 0.4, 2), 0.95);
}

// reverse swell into reveal
{
	const dur = 1.4;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = noise() * (t / dur) ** 3;
	}
	write('swell', bandpass(x, 200, 6000), 0.6);
}

// UI pop (for name tags)
{
	const x = buf(0.25);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (500 + 1400 * Math.min(1, t / 0.05))) / SR;
		x[i] = Math.sin(ph) * Math.exp(-t / 0.05);
	}
	write('pop', x, 0.5);
}

// low tension bed (not music): detuned low drones + rumble + faint air, 92 s
{
	const dur = 92;
	const x = buf(dur);
	const tones = [
		[55, 0.5, 0.031],
		[55.35, 0.35, 0.047],
		[82.4, 0.22, 0.023],
		[110.6, 0.12, 0.061],
		[164.8, 0.05, 0.017],
	];
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		let v = 0;
		for (const [f, a, lfo] of tones) v += Math.sin(2 * Math.PI * f * t) * a * (0.65 + 0.35 * Math.sin(2 * Math.PI * lfo * t + f));
		x[i] = v;
	}
	const rumble = lowpass(lowpass(Float32Array.from({length: x.length}, () => noise()), 180), 180);
	const air = bandpass(Float32Array.from({length: x.length}, () => noise()), 2500, 4500);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] += rumble[i] * 1.6 + air[i] * 0.04 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t));
	}
	write('drone', x, 0.6);
}

// ---------- part 2 ----------
// tape rewind: fast chirps rising
{
	const dur = 1.2;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = 900 + 2600 * (t / dur) + 300 * Math.sin(2 * Math.PI * 23 * t);
		ph += (2 * Math.PI * f) / SR;
		x[i] = (Math.sign(Math.sin(ph)) * 0.25 + noise() * 0.25) * Math.sin((Math.PI * t) / dur) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 31 * t));
	}
	write('rewind', bandpass(x, 400, 6000), 0.5);
}
// lake: water lapping against a boat (5 s)
{
	const dur = 5.2;
	const x = buf(dur);
	const n = lowpass(Float32Array.from({length: x.length}, () => noise()), 900);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = n[i] * (0.4 + 0.6 * Math.max(0, Math.sin(2 * Math.PI * 0.55 * t)) ** 2);
	}
	for (let k = 0; k < 18; k++) add(x, ping([400 + rnd() * 500], 0.08, 0.02, 0.4), rnd() * (dur - 0.2));
	write('lake', room(x, 0.25), 0.55);
}
// paper tear
{
	const dur = 0.9;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const crackle = rnd() < 0.02 ? 1 : 0.25;
		x[i] = noise() * crackle * Math.sin((Math.PI * t) / dur) ** 0.5;
	}
	write('tear', room(bandpass(x, 1500, 9000), 0.15), 0.8);
}
// door handle: metallic creak + latch click
{
	const dur = 1.6;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (60 + 40 * Math.sin(t * 5)) / SR;
		x[i] = Math.exp(-((ph % 1) * 50)) * Math.sin((Math.PI * Math.min(t, 1.3)) / 1.3) * 0.8;
	}
	let y = add(reso(x, 1800, 14), reso(x, 3100, 16), 0, 0.6);
	add(y, click(0.04, 2200, 5), 1.35, 1.4);
	write('handle', room(y, 0.3), 0.7);
}
// electric flicker / buzz
{
	const dur = 1.0;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const gate = Math.sin(2 * Math.PI * 7 * t) > 0.2 ? 1 : 0.1;
		x[i] = (Math.sign(Math.sin(2 * Math.PI * 100 * t)) * 0.5 + noise() * 0.3) * gate;
	}
	write('flicker', lowpass(x, 2500), 0.4);
}

// ---------- part 3 ----------
// an original marimba-like ringtone (two phrases)
const ringtone = () => {
	const notes = [659, 784, 1047, 784, 659, 784, 1047, 1319];
	const x = buf(3.3);
	for (let rep = 0; rep < 2; rep++) {
		notes.forEach((f, k) => {
			const n = buf(0.35);
			for (let i = 0; i < n.length; i++) {
				const t = i / SR;
				n[i] = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.02)) * Math.exp(-t / 0.12);
			}
			add(x, n, rep * 1.6 + k * 0.17, 0.8);
		});
	}
	return x;
};
write('ringtone', room(ringtone(), 0.15), 0.7);
// the same ringtone heard through a closed door
write('ringtone_door', room(lowpass(lowpass(ringtone(), 700), 900), 0.5, 1.6), 0.6);
// three knocks on a wooden door
{
	const x = buf(1.6);
	[0, 0.42, 0.84].forEach((t0) => {
		add(x, thump(110, 0.25, 0.05, 0.3), t0, 1);
		add(x, reso(click(0.05, 400, 1), 420, 6), t0, 0.6);
	});
	write('knock', room(x, 0.3), 0.9);
}
// camera "record" beep
{
	const x = buf(0.4);
	add(x, ping([1000], 0.12, 0.05), 0, 1);
	add(x, ping([1500], 0.15, 0.06), 0.13, 1);
	write('recbeep', x, 0.5);
}
// light switch
{
	const x = buf(0.3);
	add(x, click(0.03, 3200, 4), 0, 1);
	add(x, click(0.03, 1900, 4), 0.03, 0.6);
	write('switch', room(x, 0.2), 0.7);
}
// call ended / declined tone
{
	const x = buf(0.7);
	add(x, ping([620, 1240], 0.25, 0.15), 0, 1);
	add(x, ping([470, 940], 0.35, 0.18), 0.27, 1);
	write('decline', x, 0.55);
}
