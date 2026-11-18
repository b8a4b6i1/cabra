import { LOOP, TAU, hash, T } from './config.js';

/**
 * 8-bit sound: pulse + triangle + noise through the WebAudio API, no samples.
 * Everything is triggered by the visual clock crossing a time, so seeking or freezing (?t=) is silent
 * and the soundtrack always matches what is on screen.
 */
const MIDI = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORD_ROOT = [45, 41, 48, 43];            // Am F C G, one bar = 2 s
const CHORD_IV = [[0, 3, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12]];
const PENTA = [0, 3, 5, 7, 10];                // minor pentatonic for the melody
const STEP = 0.25;                              // eighth note at 60 bpm; one chord = 8 steps = 4 s

export function createAudio() {
  let ctx = null, master = null, sfxBus = null, musicMode = false, noiseBuf = null, enabled = true, last = 0, unlocked = false;
  const waves = {};
  const pulseWave = (d) => {
    if (waves[d]) return waves[d];
    const N = 24, re = new Float32Array(N + 1), im = new Float32Array(N + 1);
    for (let n = 1; n <= N; n++) im[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d); // sine series of a pulse with duty d
    return (waves[d] = ctx.createPeriodicWave(re, im));
  };
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination); sfxBus = ctx.createGain(); sfxBus.gain.value = 0.38; sfxBus.connect(master); // sound effects mix well below the music
    const len = ctx.sampleRate * 1.5; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0);
    let v = 0; for (let i = 0; i < len; i++) { if (i % 3 === 0) v = Math.random() * 2 - 1; d[i] = Math.round(v * 8) / 8; } // sample-and-hold, 3-bit crush
  }
  const tone = (freq, dur, { type = 'pulse', duty = 0.5, vol = 0.5, slide = 0, attack = 0.005, rel = 0.05, vib = 0, at = 0 } = {}) => {
    if (!ctx || !enabled) return; const t0 = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    if (type === 'pulse') o.setPeriodicWave(pulseWave(duty)); else o.type = type;
    o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * Math.pow(2, slide)), t0 + dur);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = freq * vib; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + rel); }
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.setValueAtTime(vol, t0 + Math.max(attack, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
    o.connect(g); g.connect(musicMode ? master : sfxBus); o.start(t0); o.stop(t0 + dur + rel + 0.02);
  };
  const noise = (dur, { vol = 0.4, hp = 2000, lp = 9000, slide = 0, at = 0 } = {}) => {
    if (!ctx || !enabled) return; const t0 = ctx.currentTime + at, s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true; f.type = 'highpass'; f.frequency.value = hp; f2.type = 'lowpass'; f2.frequency.setValueAtTime(lp, t0); if (slide) f2.frequency.exponentialRampToValueAtTime(Math.max(80, lp * Math.pow(2, slide)), t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(f); f.connect(f2); f2.connect(g); g.connect(musicMode ? master : sfxBus); s.start(t0); s.stop(t0 + dur + 0.02);
  };
  // ---------------------------------------------------------------- sound effects
  const sfx = {
    vanish: () => { for (let k = 0; k < 8; k++) tone(MIDI(96 - k * 3), 0.14, { duty: 0.125, vol: 0.2, at: k * 0.07, rel: 0.1 }); noise(0.8, { vol: 0.18, hp: 3000, lp: 9000, slide: -2 }); },
    appear: () => { for (let k = 0; k < 8; k++) tone(MIDI(72 + k * 3), 0.2, { duty: 0.125, vol: 0.2, at: k * 0.09, rel: 0.15 }); [60, 67, 72, 76].forEach((m) => tone(MIDI(m), 1.6, { type: 'triangle', vol: 0.3, rel: 0.5, at: 0.5 })); },
    click: () => { noise(0.012, { vol: 0.35, hp: 2500 }); tone(1800, 0.015, { duty: 0.5, vol: 0.12, rel: 0.005 }); },
    sounder: () => { noise(0.02, { vol: 0.3, hp: 1200, lp: 4000 }); tone(MIDI(55), 0.04, { type: 'triangle', vol: 0.3 }); },
    clink: () => { tone(MIDI(96), 0.08, { duty: 0.125, vol: 0.1, rel: 0.05 }); tone(MIDI(100), 0.1, { duty: 0.125, vol: 0.08, at: 0.05, rel: 0.06 }); },
    tick: () => noise(0.01, { vol: 0.08, hp: 4000 }),
    gasp: () => { tone(MIDI(70), 0.12, { duty: 0.25, vol: 0.2, slide: 0.6 }); },
    page: () => { noise(0.25, { vol: 0.12, hp: 2500, lp: 8000, slide: -1 }); },
    bell: () => { [72, 79].forEach((m, i) => tone(MIDI(m), 1.4, { duty: 0.125, vol: 0.18, rel: 0.7, at: i * 0.02 })); },
    cluck: () => { tone(MIDI(79), 0.05, { duty: 0.25, vol: 0.12, slide: 0.5 }); tone(MIDI(83), 0.07, { duty: 0.25, vol: 0.1, at: 0.07, slide: -0.4 }); },
    clang: () => { tone(MIDI(88), 0.12, { duty: 0.125, vol: 0.1, rel: 0.1 }); noise(0.05, { vol: 0.12, hp: 3000 }); },
    type: () => { noise(0.012, { vol: 0.22, hp: 1500, lp: 5000 }); tone(900, 0.01, { duty: 0.5, vol: 0.05, rel: 0.004 }); },
    scratch: () => noise(0.06, { vol: 0.05, hp: 3500, lp: 7000 }),
    whoosh: () => { for (let k = 0; k < 10; k++) tone(MIDI(72 + k * 2), 0.12, { duty: 0.125, vol: 0.1, at: k * 0.08, rel: 0.1 }); noise(0.9, { vol: 0.08, hp: 2500, lp: 8000, slide: 1 }); },
    chime: () => { [84, 88, 91].forEach((m, i) => tone(MIDI(m), 0.5, { duty: 0.125, vol: 0.1, at: i * 0.1, rel: 0.3 })); },
    laugh: () => { for (let k = 0; k < 4; k++) tone(MIDI(40 + (k % 2) * 3), 0.1, { duty: 0.25, vol: 0.2, at: k * 0.16, slide: -0.3 }); },
    roar: () => { noise(1.6, { vol: 0.3, hp: 200, lp: 3000, slide: -1.5 }); tone(MIDI(33), 1.5, { type: 'triangle', vol: 0.4, rel: 0.6, slide: -0.5 }); },
    dust: () => { noise(2.6, { vol: 0.1, hp: 1500, lp: 6000, slide: 0.8 }); [72, 79, 84, 88].forEach((m, i) => tone(MIDI(m), 1.2, { type: 'triangle', vol: 0.12, at: i * 0.5, rel: 0.5 })); },
    chirp: () => { const f = 1800 + 900 * Math.random(); tone(f, 0.05, { duty: 0.25, vol: 0.06, slide: 0.5 }); tone(f * 1.3, 0.06, { duty: 0.25, vol: 0.05, at: 0.08, slide: -0.4 }); },
    screech: () => { tone(MIDI(88), 0.4, { duty: 0.25, vol: 0.12, slide: -0.8, vib: 0.02 }); noise(0.3, { vol: 0.08, hp: 2500, lp: 7000, slide: -1 }); },
    caw: () => { tone(MIDI(76), 0.12, { duty: 0.125, vol: 0.1, slide: 0.4 }); tone(MIDI(72), 0.15, { duty: 0.125, vol: 0.1, at: 0.14, slide: -0.5 }); },
    snap: () => { noise(0.04, { vol: 0.25, hp: 1500, lp: 6000 }); tone(MIDI(52), 0.06, { duty: 0.25, vol: 0.2, slide: -0.6 }); },
    creak: () => { tone(MIDI(40), 1.2, { duty: 0.125, vol: 0.12, slide: 0.35, vib: 0.03 }); noise(0.6, { vol: 0.06, hp: 400, lp: 1800 }); },
    crack: () => { noise(0.18, { vol: 0.4, hp: 500, lp: 5000, slide: -1 }); tone(MIDI(36), 0.2, { duty: 0.25, vol: 0.3, slide: -0.5 }); },
    thud: () => { noise(0.25, { vol: 0.35, hp: 60, lp: 700, slide: -1 }); tone(MIDI(30), 0.3, { type: 'triangle', vol: 0.4, slide: -0.5 }); },
    hit: () => { noise(0.2, { vol: 0.3, hp: 300, lp: 3000, slide: -1 }); tone(MIDI(45), 0.3, { duty: 0.25, vol: 0.25, slide: -0.7 }); },
    oracle: () => { [76, 83, 88, 95].forEach((m, i) => tone(MIDI(m), 0.9, { type: 'triangle', vol: 0.12, at: i * 0.12, rel: 0.5 })); },
    shush: () => noise(0.5, { vol: 0.07, hp: 2500, lp: 8000, slide: -1 }),
    howl: () => { tone(MIDI(40), 1.4, { duty: 0.25, vol: 0.14, slide: 0.3, vib: 0.02 }); noise(1.2, { vol: 0.05, hp: 200, lp: 900 }); },
    water: (lp = 2200, hp = 250) => noise(0.7, { vol: 0.06, hp, lp }),
    drip: () => { tone(MIDI(96 + Math.floor(Math.random() * 6)), 0.05, { duty: 0.125, vol: 0.07, slide: -0.5 }); },
    rattle: () => { for (let k = 0; k < 4; k++) noise(0.02, { vol: 0.09, hp: 4500, at: k * 0.05 }); },
    oilbird: () => { for (let k = 0; k < 5; k++) tone(MIDI(70 + (k % 2) * 3), 0.07, { duty: 0.5, vol: 0.06, at: k * 0.09, slide: 0.2 }); noise(0.4, { vol: 0.03, hp: 1200, lp: 3500 }); },
    bat: () => tone(5200, 0.03, { duty: 0.125, vol: 0.03, slide: -0.3 }),
    gulp: () => { tone(MIDI(48), 0.12, { type: 'triangle', vol: 0.25, slide: -0.4 }); },
    hit: () => { tone(MIDI(31), 0.9, { type: 'triangle', vol: 0.45, slide: -0.6, rel: 0.4 }); [88, 95, 100].forEach((m, i) => tone(MIDI(m), 0.6, { duty: 0.125, vol: 0.06, at: 0.05 + i * 0.06, rel: 0.4 })); noise(0.5, { vol: 0.12, hp: 600, lp: 4000, slide: -1 }); },
    possess: () => { [45, 52, 57, 64, 69].forEach((m, i) => tone(MIDI(m), 3.2, { type: 'triangle', vol: 0.24, at: i * 0.12, rel: 1.4 })); noise(2.2, { vol: 0.14, hp: 300, lp: 6000, slide: 1 }); },
    chant: (m) => { tone(MIDI(m), 0.6, { duty: 0.25, vol: 0.12, vib: 0.01, rel: 0.2 }); tone(MIDI(m - 12), 0.6, { type: 'triangle', vol: 0.18, rel: 0.2 }); },
  };
  const crossed = (a, b, x) => x > a && x <= b;
  const s2 = {
    crick: () => { for (let k = 0; k < 3; k++) tone(3200 + 200 * Math.random(), 0.018, { duty: 0.25, vol: 0.025, at: k * 0.05, rel: 0.005 }); },
    owl: () => { tone(MIDI(57), 0.3, { type: 'triangle', vol: 0.12, slide: -0.1, rel: 0.15 }); tone(MIDI(55), 0.45, { type: 'triangle', vol: 0.1, at: 0.4, rel: 0.25 }); },
    drum: (acc) => { noise(0.08, { vol: acc ? 0.28 : 0.18, hp: 80, lp: 700, slide: -1 }); tone(MIDI(acc ? 36 : 40), 0.18, { type: 'triangle', vol: acc ? 0.3 : 0.2, slide: -0.6, rel: 0.05 }); },
    clack: () => { noise(0.015, { vol: 0.12, hp: 1500, lp: 5000 }); },
    bleat: (k = 0) => { tone(MIDI(66 + k * 2), 0.5, { duty: 0.25, vol: 0.09, slide: -0.2, vib: 0.05, rel: 0.1 }); noise(0.4, { vol: 0.03, hp: 600, lp: 2400 }); },
    baa: () => { tone(MIDI(60), 0.6, { duty: 0.125, vol: 0.08, slide: -0.15, vib: 0.04, rel: 0.12 }); },
    cluck: () => { sfx.cluck && sfx.cluck(); },
    creak: () => { sfx.creak && sfx.creak(); },
    chant: (m, len = 2.0) => { tone(MIDI(m), len, { duty: 0.25, vol: 0.09, vib: 0.012, attack: 0.15, rel: 0.4 }); tone(MIDI(m - 12), len, { type: 'triangle', vol: 0.12, attack: 0.15, rel: 0.4 }); },
    shimmer: () => { for (let k = 0; k < 14; k++) tone(MIDI(100 - k * 2.5), 0.2, { duty: 0.125, vol: 0.06, at: k * 0.1, rel: 0.2 }); },
    hum: (m) => { tone(MIDI(m), 6, { type: 'triangle', vol: 0.12, attack: 1.5, rel: 2, vib: 0.006 }); tone(MIDI(m + 7), 6, { type: 'triangle', vol: 0.07, attack: 2, rel: 2 }); },
    pop: () => { tone(MIDI(96), 0.06, { duty: 0.5, vol: 0.07, slide: -0.6, rel: 0.02 }); },
    rise: () => { for (let k = 0; k < 18; k++) tone(MIDI(60 + k * 2), 0.5, { type: 'triangle', vol: 0.05, at: k * 0.33, rel: 0.4 }); noise(6, { vol: 0.06, hp: 400, lp: 7000, slide: 1.5 }); },
    gate: () => { tone(MIDI(38), 1.1, { duty: 0.125, vol: 0.1, slide: 0.35, vib: 0.03, rel: 0.2 }); noise(0.7, { vol: 0.05, hp: 300, lp: 1800 }); },
    roar: () => { tone(MIDI(33), 1.4, { duty: 0.25, vol: 0.12, slide: -0.4, vib: 0.03, rel: 0.4 }); noise(1.2, { vol: 0.08, hp: 150, lp: 2000, slide: -1 }); },
  };
  // the prayer: a modal motif that the cult hums; its melody is "lost", so it wanders and never lands on the same note twice
  const MOT = [57, 60, 62, 60, 57, 55, 57, 59, 60, 62, 64, 62, 60, 57];
  const stepNote = (s) => {
    const t = s * STEP, bar = Math.floor(s / 8), pos = s % 8, root = [45, 43, 40, 38][bar % 4];
    if (pos === 0) { tone(MIDI(root - 12), 4.2, { type: 'triangle', vol: 0.26, rel: 1.3 }); tone(MIDI(root + 7 - 12), 4.0, { type: 'triangle', vol: 0.1, rel: 1.3 }); }
    if (t >= T.dance0 - 1 && t < T.dance1 + 2) { if (pos % 4 === 0) s2.drum(pos === 0); if (pos % 4 === 2 && bar % 2) s2.drum(false); }
    if (t >= T.mask1 && t < T.dance1 + 2 && pos === 0) s2.chant(MOT[(bar * 3) % MOT.length], 3.6);
    if (t >= T.dance0 + 4 && t < T.dance1 && pos === 4) s2.chant(MOT[(bar * 3 + 1) % MOT.length] + 12 * ((bar >> 2) % 2 === 1 ? 0 : 0), 1.8);
    if (t >= T.sky0 && t < T.rise1 && pos % 2 === 1) tone(MIDI(root + 36 + [0, 3, 7, 10, 12][(s * 3 + bar) % 5]), 0.4, { duty: 0.125, vol: 0.04, rel: 0.3 });
  };
  function fire(a, b) {
    musicMode = true; for (let s = Math.floor(a / STEP) + 1; s <= Math.floor(b / STEP); s++) stepNote(s); musicMode = false;
    for (let q = 0.4; q < 90; q += 0.35) if (crossed(a, b, q) && hash(q * 9) > 0.45) s2.crick();
    for (const q of [9, 33, 61, 85]) if (crossed(a, b, q)) s2.owl();
    for (let q = 0.1; q < 90; q += 0.9) if (crossed(a, b, q) && hash(q * 11) > 0.6) noise(0.08, { vol: 0.05, hp: 800, lp: 3500 });      // fire crackle
    for (let q = T.mask0; q < T.mask1; q += 0.3) if (crossed(a, b, q)) s2.clack();
    if (crossed(a, b, T.gate)) s2.gate(); if (crossed(a, b, 83)) s2.gate();
    for (let k = 0; k < 10; k++) { const q = T.free0 + 0.6 * k + 1.0; if (crossed(a, b, q)) (k % 3 === 0 ? s2.bleat(k % 4) : k % 3 === 1 ? s2.baa() : (sfx.cluck && sfx.cluck())); }
    for (let q = T.free1; q < T.rise0; q += 3.7 + 2 * hash(q * 5)) if (crossed(a, b, q)) (hash(q * 3) > 0.5 ? s2.bleat(Math.floor(hash(q) * 3)) : sfx.cluck && sfx.cluck());
    if (crossed(a, b, T.sky0 + 0.5)) s2.shimmer(); if (crossed(a, b, T.sky0)) s2.hum(45); if (crossed(a, b, T.land)) { s2.shimmer(); s2.hum(48); }
    for (let k = 0; k < 5; k++) if (crossed(a, b, T.land + 2 + 0.7 * k)) s2.pop();
    if (crossed(a, b, T.vision0)) s2.roar();
    if (crossed(a, b, T.rise0)) s2.rise(); if (crossed(a, b, T.rise1 + 1)) sfx.chime && sfx.chime();
    for (let q = T.pen0; q < T.pen1; q += 1.3) if (crossed(a, b, q)) (hash(q * 7) > 0.5 ? s2.baa() : sfx.cluck && sfx.cluck());
  }
  function update(t) {
    if (!ctx || !enabled || ctx.state !== 'running') { last = t; return; }
    if (t < last - 1) { last = t; return; }
    if (t - last > 0.5 || t === last) { last = t; return; }
    fire(last, t); last = t;
  }
  function unlock() { init(); if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {}); unlocked = true; }
  return { update, unlock, setLamps() {}, setEnabled(v) { enabled = v; if (ctx) { if (v && ctx.state === 'suspended') ctx.resume(); master.gain.value = v ? 0.22 : 0; } }, get enabled() { return enabled; }, get running() { return !!ctx && ctx.state === 'running'; } };
}
