/**
 * Moteur audio : effets sonores et musiques 100 % synthétisés (Web Audio),
 * mixés dans un bus enregistrable pour l'export vidéo.
 */
import { MUSICS } from './data.js';

class AudioEngine {
  constructor() { this.ctx = null; this.session = null; }

  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC({ latencyHint: 'interactive' });
    const ctx = this.ctx;
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.attack.value = 0.003; this.comp.release.value = 0.2;
    this.master.connect(this.comp);
    this.comp.connect(ctx.destination);
    this.recDest = ctx.createMediaStreamDestination();
    this.comp.connect(this.recDest);
    // Bruit blanc réutilisable
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  get now() { return this.ensure().currentTime; }
  get stream() { this.ensure(); return this.recDest.stream; }

  /** Ouvre une « session » de lecture : tout ce qui est programmé dedans s'arrête d'un coup. */
  openSession() {
    this.closeSession();
    const ctx = this.ensure();
    const bus = ctx.createGain(); bus.connect(this.master);
    const voice = ctx.createGain(); voice.gain.value = 1; voice.connect(bus);
    const sfx = ctx.createGain(); sfx.gain.value = 0.55; sfx.connect(bus);
    const music = ctx.createGain(); music.gain.value = 0.16; music.connect(bus);
    this.session = { bus, voice, sfx, music, nodes: [] };
    return this.session;
  }
  closeSession() {
    if (!this.session) return;
    const s = this.session; this.session = null;
    try { s.bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02); } catch (e) { /* ignore */ }
    setTimeout(() => { try { s.bus.disconnect(); } catch (e) { /* ignore */ } }, 120);
    s.nodes.forEach(n => { try { n.stop(); } catch (e) { /* ignore */ } });
  }
  track(node) { if (this.session) this.session.nodes.push(node); return node; }

  /* ---------- briques de synthèse ---------- */
  osc(type, freq, t, dur, dest, gain = 0.5, a = 0.005, rel = null) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (rel ?? dur));
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + (rel ?? dur) + 0.05);
    this.track(o);
    return { o, g };
  }
  noiseSrc(t, dur, dest, gain = 0.4, filterType = 'bandpass', freq = 1000, q = 1) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
    this.track(s);
    return { s, f, g };
  }

  /* ---------- effets sonores ---------- */
  sfx(name, t, dest) {
    const ctx = this.ensure();
    dest = dest || (this.session ? this.session.sfx : this.master);
    t = Math.max(t ?? ctx.currentTime, ctx.currentTime);
    const fn = SFX_SYNTH[name];
    if (fn) fn(this, t, dest);
  }

  /** Durée approximative d'un effet (pour le minutage). */
  static sfxLen(name) { return SFX_LEN[name] || 0.5; }

  playBuffer(buffer, t, dest, rate = 1) {
    const ctx = this.ensure();
    const s = ctx.createBufferSource(); s.buffer = buffer; s.playbackRate.value = rate;
    s.connect(dest || this.session.voice);
    s.start(Math.max(t, ctx.currentTime));
    return this.track(s);
  }

  /** Baisse la musique pendant les répliques. */
  duck(ranges, base = 0.16, low = 0.07) {
    if (!this.session) return;
    const g = this.session.music.gain;
    ranges.forEach(([a, b]) => {
      g.setTargetAtTime(low, a, 0.05);
      g.setTargetAtTime(base, b, 0.15);
    });
  }

  /* ---------- musique générative ---------- */
  music(style, t0, duration, dest) {
    const def = MUSICS[style];
    if (!def || !def.bpm) return;
    const gen = MUSIC_GEN[style];
    if (gen) gen(this, t0, duration, dest || this.session.music, 60 / def.bpm / 4);
  }
}

/* ===================================================================== */
/*                          EFFETS SONORES                               */
/* ===================================================================== */
const SFX_LEN = { boom: 1.2, whoosh: 0.5, boing: 0.6, ding: 1.0, scratch: 0.45, klaxon: 1.0, triste: 2.0, roulement: 1.4,
  cash: 0.8, miaou: 0.7, feulement: 0.8, criquets: 1.6, pop: 0.15, glitch: 0.4, fanfare: 1.2, suspense: 1.6 };

const SFX_SYNTH = {
  boom(A, t, dest) {
    const ctx = A.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.9);
    const ws = ctx.createWaveShaper(); ws.curve = distCurve(18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(ws); ws.connect(g); g.connect(dest); o.start(t); o.stop(t + 1.4);
    A.track(o);
    A.noiseSrc(t, 0.25, dest, 0.5, 'lowpass', 400, 0.7);
  },
  whoosh(A, t, dest) {
    const n = A.noiseSrc(t, 0.5, dest, 0.7, 'bandpass', 300, 2.5);
    n.f.frequency.exponentialRampToValueAtTime(3500, t + 0.22);
    n.f.frequency.exponentialRampToValueAtTime(500, t + 0.5);
    n.g.gain.cancelScheduledValues(t);
    n.g.gain.setValueAtTime(0.0001, t); n.g.gain.exponentialRampToValueAtTime(0.7, t + 0.2); n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  },
  boing(A, t, dest) {
    const ctx = A.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.12); o.frequency.exponentialRampToValueAtTime(260, t + 0.6);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 17;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(80, t); lg.gain.exponentialRampToValueAtTime(2, t + 0.6);
    lfo.connect(lg); lg.connect(o.frequency);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    o.connect(g); g.connect(dest); o.start(t); lfo.start(t); o.stop(t + 0.7); lfo.stop(t + 0.7);
    A.track(o); A.track(lfo);
  },
  ding(A, t, dest) {
    A.osc('sine', 1318.5, t, 1.1, dest, 0.45, 0.003);
    A.osc('sine', 1975.5, t + 0.12, 1.0, dest, 0.35, 0.003);
    A.osc('sine', 3951, t + 0.12, 0.4, dest, 0.08, 0.002);
  },
  scratch(A, t, dest) {
    const ctx = A.ctx;
    const n = A.noiseSrc(t, 0.42, dest, 0.6, 'bandpass', 1200, 4);
    n.f.frequency.setValueCurveAtTime(new Float32Array([600, 2600, 900, 3200, 700, 1800]), t, 0.4);
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueCurveAtTime(new Float32Array([200, 520, 180, 600, 150]), t, 0.4);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.45); A.track(o);
  },
  klaxon(A, t, dest) {
    const ctx = A.ctx;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(dest);
    [0, 0.3, 0.6].forEach((dt, k) => {
      const len = k === 2 ? 0.45 : 0.22;
      [466, 587, 698].forEach(f => A.osc('sawtooth', f, t + dt, len, lp, 0.16, 0.01));
    });
  },
  triste(A, t, dest) {
    const ctx = A.ctx;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.connect(dest);
    const notes = [[392, 0.38], [370, 0.38], [349, 0.38], [330, 1.1]];
    let tt = t;
    notes.forEach(([f, d], i) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, tt);
      if (i === 3) {
        const lfo = ctx.createOscillator(); lfo.frequency.value = 6;
        const lg = ctx.createGain(); lg.gain.value = 9; lfo.connect(lg); lg.connect(o.frequency);
        lfo.start(tt); lfo.stop(tt + d + 0.05); A.track(lfo);
        o.frequency.linearRampToValueAtTime(f * 0.94, tt + d);
      }
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.28, tt + 0.04);
      g.gain.setValueAtTime(0.28, tt + d - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, tt + d);
      o.connect(g); g.connect(lp); o.start(tt); o.stop(tt + d + 0.02); A.track(o);
      tt += d;
    });
  },
  roulement(A, t, dest) {
    for (let k = 0; k < 34; k++) {
      const tt = t + k * 0.035;
      A.noiseSrc(tt, 0.05, dest, 0.08 + 0.4 * (k / 34), 'bandpass', 1900, 1.2);
    }
    A.noiseSrc(t + 1.2, 0.9, dest, 0.5, 'highpass', 4000, 0.5);
    SFX_SYNTH.boom(A, t + 1.2, dest);
  },
  cash(A, t, dest) {
    A.noiseSrc(t, 0.08, dest, 0.5, 'highpass', 3000, 1);
    A.noiseSrc(t + 0.09, 0.12, dest, 0.35, 'bandpass', 5000, 3);
    A.osc('sine', 2093, t + 0.18, 0.7, dest, 0.35, 0.002);
    A.osc('sine', 2637, t + 0.18, 0.7, dest, 0.3, 0.002);
  },
  miaou(A, t, dest) { meow(A, t, dest, 520, 0.6, 0.55); },
  feulement(A, t, dest) {
    const n = A.noiseSrc(t, 0.8, dest, 0.5, 'highpass', 2800, 0.6);
    n.g.gain.cancelScheduledValues(t);
    n.g.gain.setValueAtTime(0.0001, t); n.g.gain.exponentialRampToValueAtTime(0.5, t + 0.12); n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    const ctx = A.ctx;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 85;
    const am = ctx.createOscillator(); am.frequency.value = 28;
    const amg = ctx.createGain(); amg.gain.value = 0.12; am.connect(amg);
    const g = ctx.createGain(); g.gain.value = 0.0001; amg.connect(g.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.75);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    o.connect(lp); lp.connect(g); g.connect(dest);
    o.start(t); am.start(t); o.stop(t + 0.8); am.stop(t + 0.8); A.track(o); A.track(am);
  },
  criquets(A, t, dest) {
    for (let grp = 0; grp < 4; grp++) {
      for (let k = 0; k < 3; k++) {
        const tt = t + grp * 0.4 + k * 0.045;
        A.osc('sine', 4600, tt, 0.035, dest, 0.12, 0.004);
      }
    }
  },
  pop(A, t, dest) {
    const ctx = A.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.09);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.14); A.track(o);
  },
  glitch(A, t, dest) {
    for (let k = 0; k < 10; k++) {
      const tt = t + k * 0.034;
      if (k % 3 === 2) A.noiseSrc(tt, 0.03, dest, 0.3, 'highpass', 2000, 1);
      else A.osc('square', 150 + Math.random() * 1800, tt, 0.03, dest, 0.12, 0.002);
    }
  },
  fanfare(A, t, dest) {
    const ctx = A.ctx;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(dest);
    [[523, 0], [659, 0.1], [784, 0.2]].forEach(([f, dt]) => A.osc('sawtooth', f, t + dt, 0.12, lp, 0.14, 0.01));
    [523, 659, 784, 1047].forEach(f => A.osc('sawtooth', f, t + 0.32, 0.8, lp, 0.1, 0.02));
  },
  suspense(A, t, dest) {
    const ctx = A.ctx;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(dest);
    [[0, 0.2], [0.26, 0.2], [0.52, 1.1]].forEach(([dt, d], i) => {
      const base = i === 2 ? 185 : 196;
      [base, base * 1.5, base / 2].forEach(f => A.osc('sawtooth', f, t + dt, d, lp, 0.12, 0.01));
    });
  },
};

function distCurve(k) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  return c;
}

/** Miaou synthétique : glissando + formants i → a → ou. */
export function meow(A, t, dest, f0 = 520, dur = 0.6, gain = 0.5) {
  const ctx = A.ctx;
  const o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(f0 * 0.85, t);
  o.frequency.linearRampToValueAtTime(f0 * 1.35, t + dur * 0.35);
  o.frequency.exponentialRampToValueAtTime(f0 * 0.75, t + dur);
  const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6;
  f1.frequency.setValueAtTime(350, t); f1.frequency.linearRampToValueAtTime(900, t + dur * 0.4); f1.frequency.linearRampToValueAtTime(380, t + dur);
  const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8;
  f2.frequency.setValueAtTime(2300, t); f2.frequency.linearRampToValueAtTime(1300, t + dur * 0.4); f2.frequency.linearRampToValueAtTime(800, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.05);
  g.gain.setValueAtTime(gain, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05); A.track(o);
}

/* ===================================================================== */
/*                          MUSIQUES GÉNÉRATIVES                          */
/* ===================================================================== */
const N = (semi, base = 261.63) => base * Math.pow(2, semi / 12);

function pluck(A, f, t, dest, gain = 0.25, len = 0.18, type = 'triangle') { A.osc(type, f, t, len, dest, gain, 0.004); }
function kick(A, t, dest, gain = 0.8) {
  const ctx = A.ctx; const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.32); A.track(o);
}
const hat = (A, t, dest, g = 0.08) => A.noiseSrc(t, 0.04, dest, g, 'highpass', 7000, 0.7);
const snare = (A, t, dest, g = 0.25) => { A.noiseSrc(t, 0.14, dest, g, 'bandpass', 1800, 0.8); A.osc('triangle', 190, t, 0.08, dest, g * 0.6); };
const wood = (A, t, dest, g = 0.18) => A.osc('sine', 1600, t, 0.05, dest, g, 0.002);

function loopSteps(t0, duration, step, cb) {
  const total = Math.ceil(duration / step);
  for (let i = 0; i < total; i++) cb(i, t0 + i * step);
}

const MUSIC_GEN = {
  comedie(A, t0, dur, dest, st) {
    const prog = [[0, 4, 7], [7, 11, 14], [5, 9, 12], [7, 11, 14]]; // I V IV V
    const mel = [12, 14, 16, 12, 19, 16, 14, 12, 11, 12, 14, 7, 9, 11, 12, 7];
    loopSteps(t0, dur, st, (i, t) => {
      const bar = Math.floor(i / 16) % 4, s = i % 16, ch = prog[bar];
      if (s % 8 === 0) pluck(A, N(ch[0] - 12, 130.81), t, dest, 0.5, 0.25);
      if (s % 8 === 4) pluck(A, N(ch[2] - 12, 130.81), t, dest, 0.4, 0.2);
      if (s % 4 === 2) { pluck(A, N(ch[1]), t, dest, 0.14, 0.12); wood(A, t, dest, 0.08); }
      if (s % 2 === 0 && (i * 7) % 5 !== 0) pluck(A, N(mel[(i / 2) % 16 | 0]), t, dest, 0.12, 0.14, 'sine');
    });
  },
  phonk(A, t0, dur, dest, st) {
    const bell = [0, 0, 3, 0, 7, 0, 5, 3, 0, 0, 3, 0, 10, 8, 7, 5];
    const bass = [0, -1, -1, 0, -1, -1, 0, -1, -4, -1, -1, -4, -1, -1, -2, -1];
    loopSteps(t0, dur, st, (i, t) => {
      const s = i % 16;
      if (s % 2 === 0) hat(A, t, dest, 0.05);
      if (s === 0 || s === 10) kick(A, t, dest, 0.7);
      if (s === 4 || s === 12) snare(A, t, dest, 0.2);
      const b = bass[s]; if (b > -1 || b === -4) A.osc('sine', N((b === -4 ? -5 : b) - 24, 220), t, 0.35, dest, 0.45, 0.005);
      if (s % 2 === 0 && bell[s] !== undefined && (s % 4 === 0 || i % 3 === 0)) {
        A.osc('square', N(bell[s], 540), t, 0.12, dest, 0.05, 0.002);
        A.osc('square', N(bell[s], 800), t, 0.12, dest, 0.04, 0.002);
      }
    });
  },
  suspense(A, t0, dur, dest, st) {
    const tip = [0, 1, 3, 4, 7, 6, 4, 3, 0, 1, 3, 4, 8, 7, 4, 3];
    loopSteps(t0, dur, st, (i, t) => {
      const s = i % 16;
      if (s % 4 === 0) pluck(A, N(s === 8 ? -5 : 0, 82.4), t, dest, 0.5, 0.25);
      if (s % 2 === 0) pluck(A, N(tip[s], 329.6), t, dest, 0.13, 0.09);
      if (s === 14) wood(A, t, dest, 0.12);
    });
  },
  epique(A, t0, dur, dest, st) {
    const prog = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]; // i VI III VII
    loopSteps(t0, dur, st, (i, t) => {
      const bar = Math.floor(i / 16) % 4, s = i % 16, ch = prog[bar];
      if (s === 0) { ch.forEach(n => A.osc('sawtooth', N(n - 12, 220), t, st * 16, dest, 0.05, 0.3)); kick(A, t, dest, 0.9); }
      if (s === 8 || s === 11) kick(A, t, dest, 0.6);
      if (s % 2 === 0) pluck(A, N(ch[s % 3], 220), t, dest, 0.09, 0.12, 'sawtooth');
    });
  },
  lofi(A, t0, dur, dest, st) {
    const prog = [[0, 4, 7, 11], [9, 12, 16, 19], [2, 5, 9, 12], [7, 11, 14, 17]];
    loopSteps(t0, dur, st, (i, t) => {
      const bar = Math.floor(i / 16) % 4, s = i % 16, ch = prog[bar];
      if (s === 0) ch.forEach(n => A.osc('sine', N(n - 12), t, st * 14, dest, 0.07, 0.02));
      if (s === 0 || s === 7 || s === 10) kick(A, t, dest, 0.45);
      if (s === 4 || s === 12) snare(A, t, dest, 0.1);
      if (s % 2 === 0) hat(A, t, dest, 0.025);
    });
  },
};

export const audio = new AudioEngine();
export { AudioEngine };
