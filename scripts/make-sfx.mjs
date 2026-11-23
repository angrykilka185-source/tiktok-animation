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

// ---------- «Голосовые из завтра» ----------
// lift arrival chime
write('lift_ding', room(add(ping([1318.5, 2637], 1.2, 0.35), ping([1046.5, 2093], 1.0, 0.3), 0.18, 0.9), 0.3), 0.6);
// lift doors sliding (motor hum + rumble)
{
	const dur = 1.4;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const env = Math.sin((Math.PI * t) / dur) ** 0.7;
		x[i] = (Math.sin(2 * Math.PI * 95 * t) * 0.3 + noise() * 0.5) * env;
	}
	const y = add(lowpass(x, 900), click(0.03, 1500, 4), 1.25, 0.6);
	write('lift_doors', room(y, 0.25), 0.6);
}
// alarm bell in the lift
{
	const dur = 2.4;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const gate = Math.sin(2 * Math.PI * 22 * t) > 0 ? 1 : 0.2;
		x[i] = (Math.sin(2 * Math.PI * 1150 * t) + 0.6 * Math.sin(2 * Math.PI * 2310 * t)) * gate * Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.1);
	}
	write('alarm', room(x, 0.35, 1.4), 0.45);
}
// digital glitch (message disappearing)
{
	const dur = 0.7;
	const x = buf(dur);
	let hold = 0;
	for (let i = 0; i < x.length; i++) {
		if (i % 600 === 0) hold = rnd() < 0.5 ? noise() : 0;
		x[i] = (hold * 0.8 + Math.sign(Math.sin(2 * Math.PI * (300 + 2000 * rnd()) * i / SR)) * 0.15) * (rnd() < 0.7 ? 1 : 0);
	}
	write('glitch', bandpass(x, 200, 7000), 0.6);
}
// small dog barking (two yaps)
{
	const x = buf(0.8);
	const yap = (at, f0) => {
		const dur = 0.13;
		const y = buf(dur);
		let ph = 0;
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			ph += (2 * Math.PI * f0 * (1.15 - (0.45 * t) / dur)) / SR;
			const e = Math.min(1, t / 0.008) * Math.exp(-t / 0.06);
			let s = 0;
			for (let h = 1; h <= 8; h++) s += Math.sin(ph * h) / h;
			y[i] = (s * 0.8 + noise() * 0.35) * e;
		}
		add(x, reso(y, 1400, 2.5), at, 1);
	};
	yap(0, 620);
	yap(0.24, 560);
	write('bark', room(x, 0.25, 0.8), 0.7);
}
// lift crash: metal bang + rattle
{
	const x = buf(1.6);
	add(x, thump(55, 0.6, 0.18, 0.6), 0, 1);
	const m = buf(1.4);
	for (let i = 0; i < m.length; i++) {
		const t = i / SR;
		const e = Math.exp(-t / 0.35);
		m[i] =
			(Math.sin(2 * Math.PI * 347 * t) + 0.8 * Math.sin(2 * Math.PI * 523 * t) + 0.6 * Math.sin(2 * Math.PI * 811 * t) + 0.4 * Math.sin(2 * Math.PI * 1290 * t)) * e * 0.4 +
			noise() * Math.exp(-t / 0.05) * 0.8;
	}
	add(x, m, 0, 0.8);
	for (let k = 0; k < 6; k++) add(x, click(0.03, 900 + 400 * k, 3), 0.15 + k * 0.09 + rnd() * 0.04, 0.5 * (1 - k / 7));
	write('crash', room(lowpass(x, 6000), 0.3, 1.3), 0.95);
}
// ball bouncing on a gym floor (3 bounces)
{
	const x = buf(1.6);
	[0, 0.55, 0.95].forEach((at, k) => {
		add(x, thump(120, 0.25, 0.05, 0.4), at, 1 - k * 0.25);
		add(x, ping([340, 680], 0.2, 0.05, 0.4), at, 0.5 - k * 0.12);
	});
	write('ball', room(x, 0.35, 1.5), 0.8);
}
// phone keyboard taps
{
	const x = buf(0.8);
	for (let k = 0; k < 7; k++) add(x, click(0.012, 2400 + rnd() * 800, 2), k * 0.09 + rnd() * 0.02, 0.5);
	write('typing', x, 0.35);
}

// ---------- «Голосовые из завтра», серия 2 ----------
// PE whistle (pea whistle: a tone with a fast warble)
{
	const dur = 0.9;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = 2750 + 180 * Math.sin(2 * Math.PI * 34 * t) + 60 * Math.sin(2 * Math.PI * 7 * t);
		ph += (2 * Math.PI * f) / SR;
		const e = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.06) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 34 * t));
		x[i] = (Math.sin(ph) + 0.25 * Math.sin(2 * ph) + 0.15 * noise()) * e;
	}
	write('whistle', room(x, 0.3, 1.5), 0.5);
}
// glass shatter: a crash and many tinkling shards
{
	const x = buf(1.6);
	add(x, thump(70, 0.35, 0.08, 0.7), 0, 0.8);
	const burst = buf(0.5);
	for (let i = 0; i < burst.length; i++) burst[i] = noise() * Math.exp(-i / SR / 0.08);
	add(x, highpass(burst, 2500), 0, 0.9);
	for (let k = 0; k < 40; k++) {
		const f = 3000 + rnd() * 6000;
		add(x, ping([f, f * 1.51], 0.12 + rnd() * 0.2, 0.03 + rnd() * 0.05, 0.4), 0.02 + rnd() * 0.9 * rnd(), 0.25 + 0.3 * rnd());
	}
	write('glass', room(x, 0.3, 1.4), 0.9);
}
// electric sparks: irregular crackle
{
	const x = buf(1.0);
	for (let k = 0; k < 26; k++) add(x, click(0.008 + rnd() * 0.02, 1500 + rnd() * 5000, 2), rnd() * 0.9, 0.3 + rnd() * 0.7);
	write('sparks', x, 0.6);
}
// playback slowed down: a falling pitch sweep
{
	const dur = 0.9;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * 520 * Math.pow(0.35, t / dur)) / SR;
		x[i] = (Math.sin(ph) + 0.4 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.2);
	}
	write('slowdown', lowpass(x, 2500), 0.45);
}

// ---------- «Папа вернулся с вахты», часть 5 ----------
// finger snap
{
	const x = buf(0.35);
	add(x, click(0.012, 2200, 3), 0, 1);
	const n = buf(0.06);
	for (let i = 0; i < n.length; i++) n[i] = noise() * Math.exp(-i / SR / 0.012);
	add(x, bandpass(n, 1200, 5000), 0.002, 0.8);
	write('snap', room(x, 0.2, 0.8), 0.8);
}
// the front door slams
{
	const x = buf(1.2);
	add(x, thump(60, 0.5, 0.12, 0.5), 0, 1);
	add(x, click(0.04, 600, 2), 0.005, 0.8);
	for (let k = 0; k < 4; k++) add(x, click(0.02, 1800 + 300 * k, 3), 0.06 + k * 0.05, 0.3);
	write('slam', room(x, 0.35, 1.3), 0.95);
}

// ---------- «Папа вернулся с вахты», часть 6 ----------
// a dog howling far away
{
	const dur = 2.4;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f0 = 520 + 180 * Math.sin(Math.min(1, t / 1.6) * Math.PI) - 90 * Math.max(0, t - 1.6);
		ph += (2 * Math.PI * f0 * (1 + 0.02 * Math.sin(2 * Math.PI * 5.5 * t))) / SR;
		const e = Math.min(1, t / 0.25) * Math.min(1, (dur - t) / 0.5);
		x[i] = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph)) * e;
	}
	write('howl', room(lowpass(x, 1800), 0.6, 2.0), 0.35);
}

// ---------- «Фильм про тебя», часть 1 ----------
// a full cinema hall applauding
{
	const dur = 4.2;
	const x = buf(dur);
	for (let p = 0; p < 34; p++) {
		const rate = 3.2 + rnd() * 2.2;
		const fc = 900 + rnd() * 1800;
		const g = 0.4 + rnd() * 0.6;
		let t = rnd() * 0.35;
		while (t < dur - 0.05) {
			const c = buf(0.03);
			for (let i = 0; i < c.length; i++) c[i] = noise() * Math.exp(-i / SR / (0.004 + rnd() * 0.002));
			const e = Math.min(1, t / 0.4) * Math.min(1, (dur - t) / 1.2);
			add(x, reso(c, fc, 1.6), t, g * e);
			t += (1 / rate) * (0.85 + 0.3 * rnd());
		}
	}
	write('applause', room(bandpass(x, 300, 7000), 0.35, 1.8), 0.6);
}
// crunching popcorn (three bites)
{
	const x = buf(0.9);
	for (let b = 0; b < 3; b++) {
		const n = buf(0.09);
		for (let i = 0; i < n.length; i++) n[i] = (rnd() < 0.08 ? noise() * 2 : noise() * 0.25) * Math.exp(-i / SR / 0.03);
		add(x, bandpass(n, 1500, 7000), b * 0.27 + rnd() * 0.02, 1 - 0.15 * b);
	}
	write('crunch', room(x, 0.15, 0.8), 0.7);
}
// the cartoon's cheerful theme: a square-wave tune over a bouncy bass (original, procedural)
{
	const bpm = 160;
	const e8 = 60 / bpm / 2;
	const tune = [72, 76, 79, 84, 83, 79, 76, 79, 77, 81, 84, 81, 79, 76, 74, 71, 72, 76, 79, 84, 86, 84, 83, 81, 79, 77, 76, 74, 72, 0, 72, 0];
	const bass = [48, 55, 53, 55, 48, 55, 43, 50];
	const dur = tune.length * e8 + 0.3;
	const x = buf(dur);
	const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
	const note = (m, len, vol, square) => {
		const y = buf(len);
		let ph = 0;
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			ph += hz(m) / SR;
			const w = square ? (ph % 1 < 0.5 ? 1 : -1) : 2 * Math.abs(2 * (ph % 1) - 1) - 1;
			y[i] = w * vol * Math.min(1, t / 0.004) * Math.exp(-t / (len * 0.8));
		}
		return y;
	};
	tune.forEach((m, k) => m && add(x, note(m, e8 * 0.95, 0.35, true), k * e8));
	bass.forEach((m, k) => add(x, note(m, e8 * 3.6, 0.6, false), k * e8 * 4));
	for (let k = 0; k < tune.length; k += 2) add(x, click(0.02, 7000, 2), k * e8, 0.15);
	write('toon', room(lowpass(x, 5000), 0.2, 1.2), 0.5);
}

// ---------- «Папа вернулся с вахты», часть 7 ----------
// a police siren coming closer (yelp: a fast up-down sweep), a little echo off the blocks of flats
{
	const dur = 6.5;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const sweep = 0.5 - 0.5 * Math.cos(2 * Math.PI * t * 3.2);
		const f0 = 720 + 640 * sweep;
		ph += (2 * Math.PI * f0) / SR;
		const e = Math.min(1, t / 2.5) * Math.min(1, (dur - t) / 0.8);
		x[i] = (Math.sin(ph) + 0.45 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * e;
	}
	write('siren', room(lowpass(x, 3200), 0.45, 2.2), 0.5);
}

// ---------- «Фильм про тебя», часть 2 ----------
// the film projector: the claw clicking 24 times a second over the motor hum (loops cleanly at 4 s)
{
	const dur = 4;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = 0.18 * Math.sin(2 * Math.PI * 100 * t) + 0.08 * Math.sin(2 * Math.PI * 200 * t) + 0.05 * Math.sin(2 * Math.PI * 300 * t) + 0.03 * noise();
	}
	for (let k = 0; k < dur * 24; k++) {
		const c = click(0.012, 2400 + 600 * rnd(), 4);
		add(x, c, k / 24, 0.55 + 0.15 * rnd());
		add(x, click(0.008, 900, 2), k / 24 + 0.018, 0.25);
	}
	write('projector', room(bandpass(x, 60, 6000), 0.12, 0.6), 0.6);
}
// a full hall laughing: many voices, each a few «ha»s (a buzz through «a» formants), with room echo
{
	const dur = 3.2;
	const x = buf(dur);
	for (let v = 0; v < 14; v++) {
		const f0 = 150 + rnd() * 160;
		let t = rnd() * 0.6;
		const n = 3 + Math.floor(rnd() * 4);
		for (let h = 0; h < n && t < dur - 0.3; h++) {
			const len = 0.11 + rnd() * 0.06;
			const y = buf(len);
			let ph = 0;
			for (let i = 0; i < y.length; i++) {
				const tt = i / SR;
				ph += (f0 * (1 - 0.15 * tt / len) * (1 - 0.04 * h)) / SR;
				const saw = 2 * (ph % 1) - 1;
				y[i] = (saw * 0.7 + noise() * 0.5) * Math.sin(Math.PI * Math.min(1, tt / len));
			}
			const vowel = reso(reso(y, 750 + rnd() * 150, 6), 1150 + rnd() * 200, 5);
			add(x, vowel, t, (0.6 + 0.4 * rnd()) * (1 - 0.1 * h));
			t += len + 0.04 + rnd() * 0.05;
		}
	}
	write('laugh', room(bandpass(x, 200, 4500), 0.4, 1.6), 0.5);
}

// ---------- «Что будет, если ты попадёшь в XX век» ----------
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// horse hooves on cobblestones: a trot (two clops close together, twice a second) over a soft cart rumble; loops at 4 s
{
	const dur = 4;
	const x = buf(dur);
	for (let k = 0; k < 8; k++) {
		for (const off of [0, 0.11]) {
			const c = buf(0.09);
			for (let i = 0; i < c.length; i++) c[i] = noise() * Math.exp(-i / SR / 0.012);
			add(x, reso(c, 1300 + rnd() * 500, 5), k * 0.5 + off + rnd() * 0.02, 0.9 - off * 2);
			add(x, thump(150, 0.12, 0.02, 0.2), k * 0.5 + off, 0.5);
		}
	}
	const r = buf(dur);
	for (let i = 0; i < r.length; i++) r[i] = noise() * (0.6 + 0.4 * Math.sin((2 * Math.PI * 7 * i) / SR));
	add(x, lowpass(lowpass(r, 260), 260), 0, 0.5);
	write('hooves', room(x, 0.2, 1.2), 0.7);
}
// a street crowd murmuring (many voices, no words); loops at 6 s
{
	const dur = 6;
	const x = buf(dur);
	for (let v = 0; v < 26; v++) {
		const f0 = 110 + rnd() * 140;
		let t = rnd() * 0.5;
		while (t < dur - 0.3) {
			const len = 0.18 + rnd() * 0.5;
			const y = buf(len);
			let ph = 0;
			const fa = 500 + rnd() * 500;
			const fb = 1000 + rnd() * 900;
			for (let i = 0; i < y.length; i++) {
				const tt = i / SR;
				ph += (f0 * (1 + 0.08 * Math.sin(tt * 9 + v))) / SR;
				y[i] = ((2 * (ph % 1) - 1) * 0.6 + noise() * 0.3) * Math.sin(Math.PI * Math.min(1, tt / len));
			}
			add(x, reso(reso(y, fa, 4), fb, 3), t, 0.3 + 0.4 * rnd());
			t += len + 0.05 + rnd() * 0.4;
		}
	}
	write('crowd', room(lowpass(bandpass(x, 150, 3000), 2200), 0.35, 1.6), 0.5);
}
// the tram bell: two strikes of a small bell (inharmonic partials)
{
	const x = buf(1.6);
	const bell = () => {
		const y = buf(1.2);
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			y[i] = [1, 2.76, 5.4, 8.9].reduce((a, r, k) => a + Math.sin(2 * Math.PI * 1480 * r * t) * Math.exp(-t / (0.5 / (1 + k))) / (1 + k), 0) * Math.min(1, t / 0.001);
		}
		return y;
	};
	add(x, bell(), 0, 1);
	add(x, bell(), 0.22, 0.8);
	write('tram_bell', room(x, 0.25, 1.2), 0.6);
}
// the cinema piano player: a little ragtime (original, procedural): oom-pah bass + chords + a melody; loops at 8 s
{
	const bpm = 120;
	const q = 60 / bpm;
	const dur = 16 * q;
	const x = buf(dur + 0.6);
	const key = (m, len, vol) => {
		const y = buf(len);
		const f = hz(m);
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			let v = 0;
			for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * t * (1 + 0.0015 * (h % 2 ? 1 : -1))) * Math.exp(-t * (1.5 + h * 1.2)) / h;
			v += 0.5 * Math.sin(2 * Math.PI * f * 1.004 * t) * Math.exp(-t * 2);
			y[i] = v * vol * Math.min(1, t / 0.003);
		}
		return y;
	};
	const bars = [
		[48, [52, 55, 60]],
		[43, [52, 55, 60]],
		[53, [57, 60, 65]],
		[48, [52, 55, 60]],
		[50, [53, 57, 62]],
		[43, [53, 55, 59]],
		[48, [52, 55, 60]],
		[43, [50, 55, 59]],
	];
	bars.forEach(([b, ch], k) => {
		const t0 = k * 2 * q;
		add(x, key(b, q, 0.5), t0);
		ch.forEach((m) => add(x, key(m, q * 0.8, 0.22), t0 + q));
		add(x, key(b - 5, q, 0.45), t0 + q * 1.0 - q + q);
	});
	const mel = [72, 0, 76, 79, 81, 79, 76, 72, 74, 0, 77, 81, 79, 77, 74, 71, 72, 76, 79, 84, 83, 81, 79, 77, 76, 74, 72, 71, 72, 0, 0, 0];
	mel.forEach((m, k) => m && add(x, key(m, q * 0.6, 0.32), k * (q / 2)));
	write('piano', room(lowpass(x, 5000), 0.3, 1.5), 0.55);
}
// a loudspeaker on the wall: a muffled voice (no words) through hiss and crackle; loops at 4 s
{
	const dur = 4;
	const x = buf(dur);
	let t = 0.1;
	while (t < dur - 0.3) {
		const len = 0.12 + rnd() * 0.22;
		const y = buf(len);
		let ph = 0;
		const f0 = 120 + rnd() * 40;
		for (let i = 0; i < y.length; i++) {
			const tt = i / SR;
			ph += (f0 * (1 + 0.1 * Math.sin(tt * 14))) / SR;
			y[i] = (2 * (ph % 1) - 1) * Math.sin(Math.PI * Math.min(1, tt / len));
		}
		add(x, reso(reso(y, 700 + rnd() * 300, 5), 1300 + rnd() * 400, 4), t, 0.8);
		t += len + 0.03 + (rnd() < 0.15 ? 0.3 : 0.05);
	}
	for (let i = 0; i < x.length; i++) x[i] += noise() * 0.06;
	for (let k = 0; k < 30; k++) add(x, click(0.004, 2500, 2), rnd() * dur, 0.3 * rnd());
	write('radio', bandpass(x, 350, 2800), 0.5);
}
// fireworks: launches whistling up, bursts and crackle
{
	const dur = 4.5;
	const x = buf(dur);
	for (let k = 0; k < 5; k++) {
		const t0 = k * 0.8 + rnd() * 0.2;
		const w = buf(0.6);
		let ph = 0;
		for (let i = 0; i < w.length; i++) {
			const tt = i / SR;
			ph += (2 * Math.PI * (900 + 1600 * tt)) / SR;
			w[i] = Math.sin(ph) * 0.25 * Math.min(1, tt / 0.05) * (1 - tt / 0.6);
		}
		add(x, w, t0, 0.6);
		add(x, thump(60, 0.6, 0.12, 0.8), t0 + 0.6, 1);
		for (let j = 0; j < 30; j++) add(x, click(0.006, 2000 + rnd() * 4000, 2), t0 + 0.7 + rnd() * 0.9, 0.25 * rnd());
	}
	write('fireworks', room(x, 0.4, 2.2), 0.8);
}
// an old motor car: a slow putt-putt engine; and its rubber bulb horn
{
	const dur = 3;
	const x = buf(dur);
	for (let k = 0; k < dur * 11; k++) add(x, thump(70, 0.12, 0.03, 0.5), k / 11 + rnd() * 0.01, 0.7 + 0.3 * rnd());
	const n = buf(dur);
	for (let i = 0; i < n.length; i++) n[i] = noise() * 0.15;
	add(x, bandpass(n, 300, 1500), 0, 1);
	write('engine', room(lowpass(x, 1800), 0.2, 1.2), 0.6);
	const h = buf(0.7);
	let ph = 0;
	for (let i = 0; i < h.length; i++) {
		const t = i / SR;
		const f = t < 0.3 ? 420 + 60 * Math.sin(t * 30) : 380;
		ph += f / SR;
		h[i] = (2 * (ph % 1) - 1) * Math.min(1, t / 0.02) * Math.min(1, (0.7 - t) / 0.1) * (t > 0.32 && t < 0.38 ? 0.2 : 1);
	}
	write('horn', room(reso(h, 900, 2), 0.25, 1.2), 0.5);
}
// a biplane passing: a propeller drone with a little doppler
{
	const dur = 4;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const f = 95 * (1 + 0.08 * Math.cos((Math.PI * t) / dur));
		ph += f / SR;
		const e = Math.sin((Math.PI * t) / dur);
		x[i] = ((2 * (ph % 1) - 1) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 26 * t)) + noise() * 0.2) * e;
	}
	write('plane', room(lowpass(x, 1400), 0.2, 1.4), 0.5);
}
// a camera shutter (with the flash)
{
	const x = buf(0.5);
	add(x, click(0.02, 3500, 3), 0, 1);
	add(x, click(0.02, 2500, 3), 0.06, 0.8);
	const w = buf(0.4);
	for (let i = 0; i < w.length; i++) w[i] = Math.sin((2 * Math.PI * (3000 + 4000 * (i / w.length)) * i) / SR) * 0.1 * (1 - i / w.length);
	add(x, w, 0.08, 0.6);
	write('shutter', room(x, 0.15, 0.8), 0.7);
}
// abacus beads clicking fast
{
	const x = buf(2.2);
	let t = 0.02;
	while (t < 2.1) {
		add(x, reso(click(0.03, 1800, 2), 2200 + rnd() * 800, 8), t, 0.5 + 0.5 * rnd());
		t += 0.05 + rnd() * 0.08;
	}
	write('abacus', room(x, 0.2, 0.9), 0.6);
}
// a coin dropping into the payphone
{
	const x = buf(1.2);
	add(x, ping([2400, 3900, 6100], 0.6, 0.18, 0.8), 0, 1);
	for (let k = 0; k < 5; k++) add(x, ping([1800 + rnd() * 600, 3000], 0.2, 0.05, 0.4), 0.18 + k * 0.07 + rnd() * 0.02, 0.6 - k * 0.1);
	add(x, thump(200, 0.1, 0.02, 0.4), 0.6, 0.4);
	write('coin', room(x, 0.3, 1.0), 0.6);
}
// a tape recorder running: motor hum and tape hiss; loops at 2 s
{
	const dur = 2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = 0.25 * Math.sin(2 * Math.PI * 50 * t) + 0.1 * Math.sin(2 * Math.PI * 100 * t) + noise() * 0.12;
	}
	write('tape', bandpass(x, 40, 9000), 0.35);
}
// winding a cassette with a pencil: soft plastic ratchet clicks
{
	const x = buf(1.6);
	for (let k = 0; k < 24; k++) add(x, reso(click(0.015, 2500, 3), 3200, 6), k * 0.065, 0.5 + 0.2 * rnd());
	write('wind', room(x, 0.15, 0.7), 0.5);
}
// a crowd cheering: hundreds of «a-a-a» voices swelling, with applause
{
	const dur = 4;
	const x = buf(dur);
	for (let v = 0; v < 40; v++) {
		const f0 = 160 + rnd() * 240;
		const y = buf(dur);
		let ph = 0;
		const s0 = rnd() * 0.6;
		for (let i = 0; i < y.length; i++) {
			const t = i / SR;
			ph += (f0 * (1 + 0.06 * Math.sin(t * 5 + v) + 0.04 * t)) / SR;
			const e = Math.min(1, Math.max(0, (t - s0) / 0.4)) * Math.min(1, (dur - t) / 1.2);
			y[i] = ((2 * (ph % 1) - 1) * 0.6 + noise() * 0.4) * e;
		}
		add(x, reso(reso(y, 700 + rnd() * 200, 3), 1100 + rnd() * 300, 3), 0, 0.15);
	}
	write('cheer', room(bandpass(x, 200, 5000), 0.45, 2.0), 0.6);
}
// the time warp: a riser (noise sweeping up + a rising tone) that ends in a soft burst
{
	const dur = 1.8;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const u = t / dur;
		ph += (2 * Math.PI * (200 + 1600 * u * u)) / SR;
		x[i] = (Math.sin(ph) * 0.4 + noise() * 0.5 * u) * u * u;
	}
	const y = buf(dur);
	let lp = 0;
	for (let i = 0; i < y.length; i++) {
		const u = i / y.length;
		const a = Math.exp((-2 * Math.PI * (300 + 6000 * u)) / SR);
		lp = (1 - a) * x[i] + a * lp;
		y[i] = lp;
	}
	write('warp', room(y, 0.3, 1.6), 0.6);
}
// winter wind; loops at 6 s
{
	const dur = 6;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) x[i] = noise();
	const y = reso(x, 500, 1.5);
	for (let i = 0; i < y.length; i++) {
		const t = i / SR;
		y[i] *= 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / dur) ** 2 + 0.2 * Math.sin(2 * Math.PI * 0.7 * t);
	}
	write('wind_cold', lowpass(y, 1200), 0.4);
}
// the phone's low-battery warning: two short falling tones
{
	const x = buf(0.6);
	add(x, ping([1200, 2400], 0.18, 0.08, 0.6), 0, 1);
	add(x, ping([900, 1800], 0.25, 0.1, 0.6), 0.2, 1);
	write('lowbat', x, 0.5);
}
// hammers on a building site, far away; loops at 4 s
{
	const dur = 4;
	const x = buf(dur);
	for (let k = 0; k < 14; k++) add(x, ping([1900 + rnd() * 400, 3200], 0.2, 0.04, 0.6), rnd() * (dur - 0.2), 0.3 + 0.4 * rnd());
	write('hammers', room(lowpass(x, 3000), 0.5, 2.2), 0.4);
}

// ---------- «Что будет, если ты попадёшь в СССР» ----------
// the iron alarm clock: a hammer rattling between two bells
{
	const dur = 3;
	const x = buf(dur);
	for (let k = 0; k < dur * 18; k++) {
		const f0 = k % 2 ? 2350 : 2600;
		add(x, ping([f0, f0 * 2.7, f0 * 4.1], 0.12, 0.05, 0.7), k / 18, 0.6 + 0.2 * rnd());
	}
	write('alarm_bell', room(x, 0.2, 0.9), 0.6);
}
// the electric school bell
{
	const dur = 2.2;
	const x = buf(dur);
	for (let k = 0; k < dur * 30; k++) add(x, ping([1900, 1900 * 2.6], 0.05, 0.02, 0.8), k / 30, 0.7);
	write('school_bell', room(x, 0.35, 1.6), 0.55);
}
// soda water: the pour and the fizz
{
	const dur = 2.4;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = noise() * 0.5 * Math.min(1, t / 0.1) * Math.min(1, (dur - t) / 0.5);
	}
	const y = bandpass(x, 600, 5000);
	for (let k = 0; k < 160; k++) add(y, ping([3000 + rnd() * 5000], 0.03, 0.006, 0.4), rnd() * dur, 0.3 * rnd());
	write('soda', room(y, 0.15, 0.8), 0.5);
}
// a rotary dial: the pulses of a digit and the spring returning
{
	const x = buf(1.4);
	for (let k = 0; k < 6; k++) add(x, click(0.01, 1800, 3), 0.1 + k * 0.1, 0.7);
	const w = buf(0.6);
	let ph = 0;
	for (let i = 0; i < w.length; i++) {
		ph += (2 * Math.PI * (300 + 100 * Math.sin(i / SR * 40))) / SR;
		w[i] = Math.sin(ph) * 0.12 * Math.sin((Math.PI * i) / w.length);
	}
	add(x, bandpass(w, 200, 2000), 0.75, 1);
	write('dial', room(x, 0.2, 0.8), 0.55);
}
// the dial tone heard in the receiver (425 Hz): two long beeps
{
	const x = buf(3.4);
	for (const t0 of [0.1, 1.9]) {
		const y = buf(1.0);
		for (let i = 0; i < y.length; i++) y[i] = Math.sin((2 * Math.PI * 425 * i) / SR) * Math.min(1, i / SR / 0.02) * Math.min(1, (y.length - i) / SR / 0.02);
		add(x, y, t0, 0.8);
	}
	write('gudki', bandpass(x, 300, 3400), 0.45);
}
// a yard guitar: strummed chords (Karplus–Strong strings), an original little progression; loops at 8 s
{
	const dur = 8;
	const x = buf(dur + 1);
	const pluck = (f, len, amp) => {
		const n = Math.floor(SR / f);
		const line = new Float32Array(n).map(() => noise());
		const y = buf(len);
		let p = 0;
		for (let i = 0; i < y.length; i++) {
			const a = line[p];
			const b = line[(p + 1) % n];
			line[p] = 0.996 * 0.5 * (a + b);
			y[i] = a * amp;
			p = (p + 1) % n;
		}
		return y;
	};
	const chords = [
		[57, 64, 69, 72, 76],
		[50, 57, 62, 65, 69],
		[52, 59, 64, 68, 71],
		[57, 64, 69, 72, 76],
	];
	chords.forEach((ch, c) => {
		for (let s = 0; s < 4; s++) {
			const t0 = c * 2 + s * 0.5;
			const down = s % 2 === 0;
			ch.forEach((m, j) => add(x, pluck(hz(m), 1.6, 0.18), t0 + (down ? j : ch.length - j) * 0.012, down ? 1 : 0.7));
		}
	});
	write('guitar', room(lowpass(x, 4500), 0.3, 1.4), 0.5);
}
// night: crickets; loops at 6 s
{
	const dur = 6;
	const x = buf(dur);
	for (let c = 0; c < 4; c++) {
		const f0 = 4200 + c * 500;
		let t = rnd() * 0.5;
		while (t < dur - 0.3) {
			for (let k = 0; k < 3; k++) add(x, ping([f0], 0.03, 0.01, 0.5), t + k * 0.045, 0.4);
			t += 0.5 + rnd() * 0.6;
		}
	}
	write('crickets', room(x, 0.3, 1.5), 0.3);
}
// a bugle call (an original little fanfare)
{
	const notes = [[67, 0.25], [72, 0.25], [76, 0.25], [79, 0.6], [76, 0.25], [79, 0.9]];
	let t = 0.05;
	const x = buf(3.2);
	for (const [m, len] of notes) {
		const y = buf(len + 0.1);
		let ph = 0;
		for (let i = 0; i < y.length; i++) {
			const tt = i / SR;
			ph += hz(m) / SR;
			const saw = 2 * (ph % 1) - 1;
			y[i] = saw * Math.min(1, tt / 0.03) * Math.min(1, (len + 0.1 - tt) / 0.08) * (1 + 0.04 * Math.sin(tt * 30));
		}
		add(x, lowpass(y, 3000), t, 0.6);
		t += len;
	}
	write('bugle', room(x, 0.35, 2.0), 0.5);
}
// a bus: a low diesel rumble with a little gear whine; loops at 4 s
{
	const dur = 4;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (42 + 3 * Math.sin(t * 1.3))) / SR;
		x[i] = Math.sin(ph) * 0.5 + Math.sin(ph * 2) * 0.25 + noise() * 0.15 + Math.sin(2 * Math.PI * 620 * t) * 0.02;
	}
	write('bus', lowpass(x, 1200), 0.45);
}
// kids playing in a yard: high voices, shouts and laughs (no words); loops at 5 s
{
	const dur = 5;
	const x = buf(dur);
	for (let v = 0; v < 10; v++) {
		const f0 = 280 + rnd() * 160;
		let t = rnd() * 0.8;
		while (t < dur - 0.4) {
			const len = 0.12 + rnd() * 0.35;
			const y = buf(len);
			let ph = 0;
			for (let i = 0; i < y.length; i++) {
				const tt = i / SR;
				ph += (f0 * (1 + 0.15 * Math.sin(tt * 12 + v) - 0.1 * tt / len)) / SR;
				y[i] = ((2 * (ph % 1) - 1) * 0.6 + noise() * 0.3) * Math.sin(Math.PI * Math.min(1, tt / len));
			}
			add(x, reso(reso(y, 900 + rnd() * 300, 5), 1600 + rnd() * 500, 4), t, 0.3 + 0.4 * rnd());
			t += len + 0.15 + rnd() * 0.7;
		}
	}
	write('kids', room(bandpass(x, 250, 5000), 0.4, 1.8), 0.5);
}

// ===================================================== «Каково это — замёрзнуть насмерть» =====
// beds that loop without a seam: the tail is cross-faded into the head, and no fade on the ends
const loopify = (x, xf) => {
	const n = Math.floor(xf * SR);
	const out = x.slice(0, x.length - n);
	for (let i = 0; i < n; i++) {
		const a = i / n;
		out[i] = out[i] * a + x[x.length - n + i] * (1 - a);
	}
	return out;
};
const writeLoop = (name, x, peak = 0.9) => {
	x = normalize(x, peak);
	const n = x.length;
	const b = Buffer.alloc(44 + n * 2);
	b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8);
	b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
	b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
	b.write('data', 36); b.writeUInt32LE(n * 2, 40);
	for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
	fs.writeFileSync(path.join(OUT, name + '.wav'), b);
	console.log('sfx', name, (n / SR).toFixed(2) + 's (loop)');
};
const noiseBuf = (n) => Float32Array.from({length: n}, () => noise());
const chirp = (f, len, rise, d) => {
	const b = buf(len);
	let ph = 0;
	for (let i = 0; i < b.length; i++) {
		ph += (2 * Math.PI * f * (1 + (rise * i) / b.length)) / SR;
		b[i] = Math.sin(ph) * Math.exp(-i / SR / d);
	}
	return b;
};
// the open sea at night: a deep swell every 4 s and the wash of the crests; loops at 8 s
{
	const dur = 9;
	const x = buf(dur);
	const lo = lowpass(lowpass(noiseBuf(x.length), 350), 350);
	const hi = bandpass(noiseBuf(x.length), 700, 3500);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const sw = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 4);
		const sw2 = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / (8 / 3) + 1.3);
		x[i] = lo[i] * (0.6 + 0.4 * sw) * 3 + hi[i] * (sw * sw2) ** 2 * 0.35;
	}
	writeLoop('sea', loopify(room(lowpass(x, 2200), 0.2, 1.4), 1), 0.5);
}
// a body falls into the water: the slap, the spray, the bubbles
{
	const dur = 1.5;
	const x = buf(dur);
	add(x, thump(55, 0.5, 0.12, 0.6), 0, 1.0);
	const spray = bandpass(noiseBuf(x.length), 900, 7000);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] += spray[i] * (t < 0.01 ? t / 0.01 : Math.exp(-(t - 0.01) / 0.18)) * 0.9;
	}
	for (let k = 0; k < 26; k++) add(x, chirp(250 + rnd() * 700, 0.06, 1.2, 0.015), 0.12 + rnd() ** 1.5 * 1.2, 0.35 * (1 - k / 30));
	write('splash', room(lowpass(x, 6000), 0.3, 1.2), 0.85);
}
// ice cracks: sharp snaps, the falling «ping» of a frozen lake, a low boom
{
	const dur = 1.4;
	const x = buf(dur);
	let t = 0;
	for (let k = 0; k < 9; k++) {
		add(x, click(0.04, 2200 + rnd() * 2600, 3), t, 0.9 - k * 0.07);
		add(x, lowpass(click(0.06, 600 + rnd() * 300, 2), 1500), t, 0.5);
		t += 0.015 + rnd() * (k < 4 ? 0.03 : 0.09);
	}
	const p = buf(0.9);
	let ph = 0;
	for (let i = 0; i < p.length; i++) {
		const tt = i / SR;
		ph += (2 * Math.PI * (700 + 1600 * Math.exp(-tt / 0.08))) / SR;
		p[i] = Math.sin(ph) * Math.exp(-tt / 0.25) * 0.35;
	}
	add(x, p, 0.02);
	add(x, thump(42, 1.0, 0.3, 0.2), 0, 0.8);
	write('ice_crack', room(x, 0.35, 1.6), 0.85);
}
// the hull of a sinking ship groans: a low buzzing moan going down, creaks on top
{
	const dur = 3.6;
	const x = buf(dur);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (52 - 14 * (t / dur) + 3 * Math.sin(2 * Math.PI * 0.7 * t))) / SR;
		const saw = ((ph / (2 * Math.PI)) % 1) * 2 - 1;
		const a = Math.sin(Math.PI * Math.min(1, t / dur)) ** 0.7 * (0.7 + 0.3 * Math.sin(2 * Math.PI * 1.3 * t));
		x[i] = (saw * 0.6 + noise() * 0.25) * a;
	}
	const y = add(reso(x, 180, 3), reso(x, 420, 5), 0, 0.7);
	add(y, reso(x, 900, 8), 0, 0.25);
	for (let k = 0; k < 5; k++) add(y, lowpass(click(0.12, 500 + rnd() * 400, 6), 2000), 0.3 + rnd() * 2.8, 0.4);
	write('groan', room(lowpass(y, 1400), 0.45, 2.2), 0.8);
}
// teeth chattering
{
	const dur = 1.6;
	const x = buf(dur);
	let t = 0.02;
	while (t < dur - 0.05) {
		add(x, click(0.012, 2600 + rnd() * 1200, 4), t, 0.5 + rnd() * 0.5);
		t += 0.055 + rnd() * 0.03;
	}
	write('chatter', bandpass(x, 1200, 6000), 0.5);
}
// the iceberg scrapes along the hull somewhere below: a muffled grinding
{
	const dur = 2.8;
	const x = buf(dur);
	const g = bandpass(noiseBuf(x.length), 150, 1400);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const a = Math.sin((Math.PI * t) / dur) ** 0.6;
		const jit = 0.55 + 0.45 * Math.abs(Math.sin(2 * Math.PI * 7 * t + Math.sin(2 * Math.PI * 1.7 * t) * 3));
		ph += (2 * Math.PI * (1100 + 250 * Math.sin(2 * Math.PI * 0.9 * t))) / SR;
		x[i] = g[i] * a * jit * 1.4 + Math.sin(ph) * a * 0.08 * jit;
	}
	add(x, thump(40, 1.2, 0.4, 0.1), 0.05, 0.6);
	write('scrape', room(lowpass(x, 2200), 0.4, 1.8), 0.7);
}
// one slow heartbeat (lub-dub)
write('heart_one', lowpass(beat(1), 400), 0.95);
// a heart monitor: one beep, and the flat line
{
	const x = buf(0.16);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = Math.sin(2 * Math.PI * 980 * t) * Math.min(1, t / 0.004) * Math.min(1, (0.16 - t) / 0.03);
	}
	write('ecg', x, 0.35);
	const dur = 2.8;
	const y = buf(dur);
	for (let i = 0; i < y.length; i++) {
		const t = i / SR;
		y[i] = Math.sin(2 * Math.PI * 980 * t) * Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.3);
	}
	write('flat', y, 0.3);
}
// bubbles going up
{
	const dur = 1.6;
	const x = buf(dur);
	for (let k = 0; k < 34; k++) add(x, chirp(220 + rnd() * 600, 0.07, 1.4, 0.018), rnd() * (dur - 0.1), 0.3 + rnd() * 0.3);
	write('bubbles', room(lowpass(x, 2500), 0.3, 1.3), 0.6);
}
// a steamship's whistle far away (the «Carpathia»)
{
	const dur = 3.2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const a = Math.min(1, t / 0.25) * Math.min(1, (dur - t) / 0.6);
		const vib = 1 + 0.002 * Math.sin(2 * Math.PI * 5 * t);
		const v = [110, 138.6, 165].reduce((s, f, k) => s + Math.sin(2 * Math.PI * f * t * vib) / (k + 1), 0);
		x[i] = (v * 0.5 + noise() * 0.12) * a;
	}
	write('steam_horn', room(lowpass(x, 1200), 0.5, 2.6), 0.55);
}
// fast shallow breathing after the cold shock
{
	const dur = 3.2;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const c = (t % 0.4) / 0.4;
		const a = c < 0.4 ? Math.sin((Math.PI * c) / 0.4) : c < 0.85 ? Math.sin((Math.PI * (c - 0.4)) / 0.45) * 0.7 : 0;
		x[i] = noise() * a;
	}
	const y = add(reso(x, 600, 1.6), reso(x, 1500, 2), 0, 0.6);
	write('pant', room(lowpass(y, 2600), 0.25), 0.55);
}
// a rescue helicopter: the rotor beat; loops at 4 s
{
	const dur = 5;
	const x = buf(dur);
	const n = lowpass(noiseBuf(x.length), 600);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const p = (t * 5.5) % 1;
		x[i] = n[i] * (0.25 + Math.exp(-p / 0.06) * 1.2) + Math.sin(2 * Math.PI * 38 * t) * 0.15;
	}
	writeLoop('heli', loopify(room(x, 0.2, 1.4), 1), 0.55);
}
// a phone keypad: 1-1-2
{
	const x = buf(1.0);
	[[697, 1209], [697, 1209], [697, 1336]].forEach(([a, b], k) => {
		const tone = buf(0.16);
		for (let i = 0; i < tone.length; i++) {
			const t = i / SR;
			tone[i] = (Math.sin(2 * Math.PI * a * t) + Math.sin(2 * Math.PI * b * t)) * 0.5 * Math.min(1, t / 0.004) * Math.min(1, (0.16 - t) / 0.01);
		}
		add(x, tone, 0.05 + k * 0.28);
	});
	write('dtmf112', x, 0.4);
}
// a spoon stirring tea in a cup
{
	const x = buf(1.3);
	for (let k = 0; k < 4; k++) add(x, ping([2900 + rnd() * 300, 4100, 6300], 0.4, 0.07, 0.5), 0.05 + k * 0.27 + rnd() * 0.04);
	write('spoon', room(x, 0.2, 0.7), 0.45);
}
// a gust of icy wind with a faint howl
{
	const dur = 3;
	const x = noiseBuf(Math.ceil(dur * SR));
	const y = reso(x, 700, 1.2);
	const h = reso(x, 420, 12);
	for (let i = 0; i < y.length; i++) {
		const t = i / SR;
		y[i] = y[i] * Math.sin((Math.PI * t) / dur) ** 1.5 + h[i] * Math.sin((Math.PI * t) / dur) ** 2 * 0.6;
	}
	write('gust', room(lowpass(y, 2500), 0.3, 1.5), 0.6);
}
// far voices calling in the dark over the water (no words); loops at 6 s
{
	const dur = 7;
	const x = buf(dur);
	for (let k = 0; k < 14; k++) {
		const male = rnd() < 0.5;
		const f0 = male ? 150 + rnd() * 60 : 280 + rnd() * 90;
		const L = 0.6 + rnd() * 0.9;
		const v = buf(L);
		let ph = 0;
		for (let i = 0; i < v.length; i++) {
			const t = i / SR;
			const u = t / L;
			ph += (2 * Math.PI * f0 * (1 + 0.25 * Math.sin(Math.PI * u) - 0.15 * u) * (1 + 0.01 * Math.sin(2 * Math.PI * 6 * t))) / SR;
			const saw = ((ph / (2 * Math.PI)) % 1) * 2 - 1;
			v[i] = (saw + noise() * 0.3) * Math.sin(Math.PI * u) ** 0.8;
		}
		const fa = rnd() < 0.5 ? [800, 1200] : [550, 950];
		const y = add(reso(v, fa[0], 5), reso(v, fa[1], 6), 0, 0.6);
		add(x, y, rnd() * (dur - L - 1), 0.4 + rnd() * 0.6);
	}
	writeLoop('cries', loopify(room(lowpass(x, 1800), 0.55, 2.6), 1), 0.4);
}

// ===================================================== «Каково это — умереть от жажды» =====
// the desert wind: a warm low rush with a thin hiss of sand on the swells; loops at 8 s
{
	const dur = 9;
	const x = buf(dur);
	const lo = lowpass(lowpass(noiseBuf(x.length), 260), 260);
	const mid = reso(noiseBuf(x.length), 480, 0.7);
	const hiss = bandpass(noiseBuf(x.length), 1200, 5000);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const sw = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / 4.5 + 0.4);
		const g = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 3 + 1.1);
		x[i] = lo[i] * 2.2 * (0.7 + 0.3 * sw) + mid[i] * 0.55 * sw + hiss[i] * 0.3 * (sw * g) ** 2;
	}
	writeLoop('desert_wind', loopify(room(highpass(highpass(lowpass(x, 3000), 140), 140), 0.15, 1.2), 1), 0.45);
}
// a sandstorm: a roar that surges in gusts, and the grit of sand; loops at 6 s
{
	const dur = 7;
	const x = buf(dur);
	const roar = lowpass(lowpass(noiseBuf(x.length), 500), 700);
	const body = reso(noiseBuf(x.length), 650, 0.7);
	const grit = bandpass(noiseBuf(x.length), 1800, 8000);
	let gv = 0.6;
	let target = 0.6;
	for (let i = 0; i < x.length; i++) {
		if (i % 6615 === 0) target = 0.35 + rnd() * 0.65;
		gv += (target - gv) * 0.00008;
		x[i] = roar[i] * 6 * gv + body[i] * 0.5 * gv + grit[i] * 0.3 * gv * gv;
	}
	writeLoop('sandstorm', loopify(room(x, 0.2, 1.6), 1), 0.6);
}
// one drop of water: a small rising «plip»
{
	const x = buf(0.5);
	const d = buf(0.25);
	let ph = 0;
	for (let i = 0; i < d.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (650 + 1100 * Math.min(1, t / 0.05))) / SR;
		d[i] = Math.sin(ph) * Math.min(1, t / 0.002) * Math.exp(-t / 0.05);
	}
	add(x, d, 0.01, 1);
	write('drip', room(x, 0.3, 0.8), 0.5);
}
// water poured into a glass: the stream and the bubbles, rising in pitch as it fills
{
	const dur = 2.2;
	const x = buf(dur);
	const stream = bandpass(noiseBuf(x.length), 500, 4000);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = stream[i] * 0.35 * Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.3);
	}
	for (let k = 0; k < 26; k++) {
		const t0 = 0.05 + rnd() * (dur - 0.4);
		add(x, chirp(500 + (t0 / dur) * 900 + rnd() * 250, 0.06, 0.5, 0.018), t0, 0.35 + rnd() * 0.3);
	}
	write('pour', room(x, 0.25, 0.8), 0.5);
}
// heat: a dry sizzle with tiny crackles
{
	const dur = 1.6;
	const x = buf(dur);
	const h = highpass(noiseBuf(x.length), 3000);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = h[i] * 0.25 * Math.sin((Math.PI * t) / dur) ** 0.7 * (0.7 + 0.3 * Math.sin(2 * Math.PI * 9 * t));
	}
	for (let k = 0; k < 70; k++) add(x, click(0.004, 4000 + rnd() * 3000, 4), 0.05 + rnd() * (dur - 0.15), 0.2 + rnd() * 0.5);
	write('sizzle', x, 0.35);
}
// a kettle comes to the boil and whistles
{
	const dur = 1.8;
	const x = buf(dur);
	const br = reso(noiseBuf(x.length), 2300, 18);
	let ph = 0;
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		ph += (2 * Math.PI * (2050 + 250 * Math.min(1, t / 0.5) + 15 * Math.sin(2 * Math.PI * 5 * t))) / SR;
		x[i] = (Math.sin(ph) * 0.5 + br[i] * 0.4) * Math.min(1, t / 0.45) * Math.min(1, (dur - t) / 0.15);
	}
	write('kettle', room(x, 0.2, 0.8), 0.2);
}
// bats: high squeaks and the flutter of wings
{
	const dur = 1.3;
	const x = buf(dur);
	for (let k = 0; k < 9; k++) add(x, chirp(3800 + rnd() * 2000, 0.05, -0.35, 0.02), 0.05 + rnd() * 1.0, 0.4 + rnd() * 0.5);
	const fl = lowpass(noiseBuf(x.length), 900);
	for (let i = 0; i < fl.length; i++) {
		const t = i / SR;
		fl[i] *= (0.5 + 0.5 * Math.sin(2 * Math.PI * 18 * t)) * Math.sin((Math.PI * t) / dur) * 2.5;
	}
	add(x, fl, 0, 1);
	write('bats', room(x, 0.35, 1.2), 0.45);
}
// the mirage: a glassy shimmer that trembles
{
	const dur = 2.4;
	const x = buf(dur);
	[1046, 1318, 1568, 2093].forEach((f, k) => {
		for (let i = 0; i < x.length; i++) {
			const t = i / SR;
			x[i] += Math.sin(2 * Math.PI * f * t + k) * (0.5 + 0.5 * Math.sin(2 * Math.PI * (5 + k) * t)) * Math.sin((Math.PI * t) / dur) ** 1.5 * 0.25;
		}
	});
	write('shimmer', room(x, 0.45, 1.8), 0.3);
}
// a pinch of salt from a shaker
{
	const x = buf(0.8);
	for (let k = 0; k < 3; k++) {
		const b = bandpass(noiseBuf(Math.ceil(0.09 * SR)), 3000, 9000);
		for (let i = 0; i < b.length; i++) b[i] *= Math.sin((Math.PI * i) / b.length);
		add(x, b, 0.03 + k * 0.2, 0.8);
	}
	write('salt', x, 0.35);
}
// a small fire at night: a low rumble and crackles
{
	const dur = 2.5;
	const x = buf(dur);
	const r = lowpass(lowpass(noiseBuf(x.length), 400), 400);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] = r[i] * 2.5 * Math.min(1, t / 0.2) * Math.min(1, (dur - t) / 0.4);
	}
	for (let k = 0; k < 60; k++) add(x, click(0.006 + rnd() * 0.01, 1500 + rnd() * 3500, 2), 0.05 + rnd() * (dur - 0.3), 1 + rnd() * 2);
	write('fire', x, 0.4);
}
// a glint of sunlight off a mirror
{
	const x = buf(0.8);
	add(x, ping([2800, 4200, 6300], 0.7, 0.15, 0.6), 0.01);
	write('glint', room(x, 0.3, 1), 0.35);
}

// ===================================================== «Каково это — оказаться погребённым заживо» =====
// earth pouring in: a gritty low rush with little stones
{
	const dur = 2.4;
	const x = buf(dur);
	const lo = lowpass(lowpass(noiseBuf(x.length), 300), 500);
	const grit = bandpass(noiseBuf(x.length), 900, 4000);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const e = Math.min(1, t / 0.15) * Math.min(1, (dur - t) / 0.5);
		x[i] = (lo[i] * 4 + grit[i] * 0.35) * e;
	}
	for (let k = 0; k < 40; k++) add(x, click(0.01, 600 + rnd() * 1600, 2), 0.05 + rnd() * (dur - 0.4), 0.4 + rnd() * 0.6);
	write('dirt', room(x, 0.25, 1.2), 0.55);
}
// a lighter: the flint click, the soft whoosh of the flame
{
	const x = buf(0.9);
	add(x, click(0.02, 3200, 6), 0.02, 1);
	add(x, click(0.015, 2400, 5), 0.05, 0.6);
	const fl = bandpass(noiseBuf(Math.ceil(0.7 * SR)), 300, 2500);
	for (let i = 0; i < fl.length; i++) {
		const t = i / SR;
		fl[i] *= Math.min(1, t / 0.08) * Math.exp(-Math.max(0, t - 0.1) / 0.25) * 0.5;
	}
	add(x, fl, 0.08, 1);
	write('lighter', room(x, 0.15, 0.6), 0.45);
}
// a hand bell ringing
{
	const x = buf(1.8);
	for (let k = 0; k < 4; k++) add(x, ping([1320, 2640, 3960, 1980], 1.2, 0.5, 0.7), k * 0.16, 1 - k * 0.15);
	write('bell', room(x, 0.3, 1.4), 0.4);
}
// a stone knocking on a metal pipe: three clanks
{
	const x = buf(1.2);
	for (let k = 0; k < 3; k++) add(x, ping([980, 2450, 4100], 0.35, 0.12, 0.8), 0.03 + k * 0.32, 1);
	write('clank', room(x, 0.2, 1.2), 0.45);
}
// a shovel in wet sand: two scrapes
{
	const x = buf(1.3);
	for (let k = 0; k < 2; k++) {
		const s = bandpass(noiseBuf(Math.ceil(0.35 * SR)), 500, 3500);
		for (let i = 0; i < s.length; i++) s[i] *= Math.sin((Math.PI * i) / s.length) * 0.7;
		add(x, s, 0.05 + k * 0.55, 1);
		add(x, thump(110, 0.2, 0.05, 0.4), 0.38 + k * 0.55, 0.5);
	}
	write('dig', x, 0.4);
}
// gas leaking from a pipe: a steady hiss
{
	const dur = 2.5;
	const x = highpass(noiseBuf(Math.ceil(dur * SR)), 2500);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		x[i] *= Math.min(1, t / 0.2) * Math.min(1, (dur - t) / 0.4) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 3 * t));
	}
	write('hiss', x, 0.3);
}
// a calm slow breath in through the nose, and out (the box breathing): soft air, no voice
for (const [name, rising] of [
	['inhale', true],
	['exhale', false],
]) {
	const dur = 2.6;
	const x = buf(dur);
	for (let i = 0; i < x.length; i++) {
		const t = i / SR;
		const c = t / dur;
		const a = rising ? Math.sin((Math.PI / 2) * Math.min(1, c / 0.8)) * Math.min(1, (1 - c) / 0.12) : Math.min(1, c / 0.06) * (1 - c) ** 1.4;
		x[i] = noise() * a;
	}
	const y = add(reso(x, rising ? 900 : 600, 1.2), reso(x, rising ? 2200 : 1500, 1.8), 0, 0.4);
	write(name, room(lowpass(y, rising ? 3200 : 2400), 0.25), 0.35);
}
// a fist on the coffin lid from inside: one dull wooden thud
{
	const x = buf(0.7);
	add(x, thump(85, 0.35, 0.07, 0.4), 0, 1);
	add(x, reso(click(0.05, 340, 1), 360, 5), 0, 0.5);
	write('thud', room(lowpass(x, 1800), 0.35, 0.9), 0.8);
}
