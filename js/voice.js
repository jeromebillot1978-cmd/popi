/**
 * Voix — moteur entièrement neuf.
 *
 *  • Synthèse : voix neuronales Piper (gratuites, calculées dans le navigateur,
 *    worker dédié) ou voix IA premium OpenAI (/api/tts, clé requise).
 *  • Post-traitement identique pour les deux moteurs :
 *      1. découpe en phrases → minutage exact de chaque phrase ;
 *      2. suppression des blancs parasites (début, fin, pauses trop longues) ;
 *      3. accentuation des mots comiques (micro-pause « de comédien » + volume) ;
 *      4. hauteur de voix + effet vocal léger (rendu hors-ligne, donc
 *         l'aperçu et la vidéo exportée sont strictement identiques) ;
 *      5. volume harmonisé (niveau cible commun + limiteur doux), fondus anti-clic ;
 *      6. minutage mot par mot pour les sous-titres.
 *  • Aucun mot coupé : chaque réplique dure exactement la longueur de sa voix.
 */
import { audio } from './audio.js';
import { VOICES, VOICE_MODELS } from './data.js';
import { parseWords, plain } from './story.js';
import { resolveCast } from './casting.js';

const OUT_SR = 44100;

/* ====================== Worker Piper ====================== */
let worker = null;
let seq = 0;
const pending = new Map();
let modelProgress = () => {};
export function onModelProgress(cb) { modelProgress = cb || (() => {}); }

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./piper-worker.js', import.meta.url));
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'progress') { modelProgress(m.model, m.loaded, m.total); return; }
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    if (m.type === 'error') p.reject(new Error(m.error)); else p.resolve(m);
  };
  worker.onerror = (e) => {
    pending.forEach((p) => p.reject(new Error(e.message || 'Moteur de voix indisponible')));
    pending.clear(); worker = null;
  };
  return worker;
}
function call(msg) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...msg, id });
  });
}
export const voiceCacheInfo = () => call({ type: 'cacheInfo' });
export async function clearModelCache() { await call({ type: 'clearCache' }); clearVoiceCache(); }
export const preloadModel = (model) => call({ type: 'preload', model });

/* ====================== Texte ====================== */
export function speakable(text) {
  return plain(text)
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/\bPOV\b\s*:?/g, 'Point de vue :')
    .replace(/(\d+)\s*%/g, '$1 pour cent')
    .replace(/€/g, ' euros')
    .replace(/[«»"“”]/g, '')
    .replace(/\s*…\s*/g, '… ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Découpe une réplique en phrases (mots affichés + texte prononcé). */
function chunksOf(text) {
  const words = parseWords(text);
  const chunks = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push({ ...w, i });
    if (/[.!?…]["»)]*$/.test(w.w) || i === words.length - 1) { chunks.push(cur); cur = []; }
  });
  const out = [];
  for (const c of chunks) {
    const say = speakable(c.map((w) => w.w).join(' '));
    if (!/[\p{L}\p{N}]/u.test(say)) { if (out.length) out[out.length - 1].words.push(...c); continue; }
    out.push({ words: c, say: /[.!?…]$/.test(say) ? say : say + '.' });
  }
  return { words, chunks: out };
}

/* ====================== Analyse du signal ====================== */
const FRAME = 0.01;
function envelope(pcm, sr) {
  const n = Math.max(1, Math.round(sr * FRAME));
  const env = new Float32Array(Math.ceil(pcm.length / n));
  for (let f = 0; f < env.length; f++) {
    let s = 0; const a = f * n, b = Math.min(pcm.length, a + n);
    for (let i = a; i < b; i++) s += pcm[i] * pcm[i];
    env[f] = Math.sqrt(s / Math.max(1, b - a));
  }
  return env;
}
function silenceThreshold(env) {
  let max = 0; for (const v of env) if (v > max) max = v;
  return Math.max(max * 0.018, 0.0025); // ≈ -35 dB sous le pic de la phrase
}

/**
 * Nettoie une phrase : retire les blancs au début/à la fin et raccourcit
 * les pauses internes trop longues. Renvoie le signal + la liste des pauses.
 */
function tighten(pcm, sr, maxGap) {
  const env = envelope(pcm, sr);
  const thr = silenceThreshold(env);
  const n = Math.round(sr * FRAME);
  let a = 0; while (a < env.length && env[a] < thr) a++;
  let b = env.length - 1; while (b > a && env[b] < thr) b--;
  if (a >= env.length) return { pcm: new Float32Array(0), gaps: [] };
  const start = Math.max(0, (a - 2) * n);
  const end = Math.min(pcm.length, (b + 7) * n); // marge de fin : on ne mange jamais un « s » final
  const pieces = []; const gaps = [];
  let segStart = start; let outLen = 0;
  const minGapF = 6; const maxGapF = Math.round(maxGap / FRAME);
  for (let f = a; f <= b; f++) {
    if (env[f] >= thr) continue;
    let g = f; while (g <= b && env[g] < thr) g++;
    const len = g - f;
    if (len >= minGapF) {
      const keep = Math.min(len, maxGapF);
      const cutA = (f + Math.floor(keep / 2)) * n;
      const cutB = (g - Math.ceil(keep / 2)) * n;
      pieces.push([segStart, cutA]); outLen += cutA - segStart;
      gaps.push({ t0: (outLen - Math.floor(keep / 2) * n) / sr, t1: (outLen + Math.ceil(keep / 2) * n) / sr });
      segStart = cutB;
    } else if (len >= 4) {
      gaps.push({ t0: (outLen + (f * n - segStart)) / sr, t1: (outLen + (g * n - segStart)) / sr });
    }
    f = g;
  }
  pieces.push([segStart, end]); outLen += end - segStart;
  const out = new Float32Array(outLen);
  let o = 0; const fade = Math.round(sr * 0.004);
  for (const [p, q] of pieces) {
    out.set(pcm.subarray(p, q), o);
    // micro-fondus aux coutures : aucun clic
    for (let i = 0; i < fade && o + i < out.length; i++) out[o + i] *= i / fade;
    for (let i = 0; i < fade && q - p - 1 - i >= 0; i++) out[o + q - p - 1 - i] *= i / fade;
    o += q - p;
  }
  return { pcm: out, gaps };
}

/* Poids d'un mot ≈ nombre de phonèmes (ou de lettres si le découpage diffère) */
function wordWeights(words, phonemes) {
  const clean = (w) => speakable(w).replace(/[^\p{L}\p{N}]/gu, '');
  const spoken = words.filter((w) => clean(w.w));
  let ph = null;
  if (phonemes && phonemes.length) {
    ph = phonemes.join('').split(/[\s.,;:!?…]+/).filter(Boolean).map((p) => p.replace(/[ˈˌː̃]/g, '').length);
    if (ph.length !== spoken.length) ph = null;
  }
  let k = 0;
  return words.map((w) => {
    const c = clean(w.w);
    if (!c) return 0.2;
    const base = ph ? ph[k++] * 1.0 : c.length * 0.8;
    return base + 1.2;
  });
}

/** Répartit les mots sur le temps « parlé » (les pauses ne comptent pas). */
function timeWords(words, phonemes, dur, gaps) {
  const weights = wordWeights(words, phonemes);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const voiced = Math.max(0.05, dur - gaps.reduce((s, g) => s + (g.t1 - g.t0), 0));
  const toReal = (v) => { // temps parlé → temps réel
    let t = v;
    for (const g of gaps) { if (g.t0 <= t + 1e-6) t += g.t1 - g.t0; else break; }
    return Math.min(dur, t);
  };
  let acc = 0;
  const out = words.map((w, i) => {
    const s = toReal(acc / total * voiced);
    acc += weights[i];
    const e = toReal(acc / total * voiced);
    return { w: w.w, hl: w.hl, start: s, end: e };
  });
  // Ponctuation : la fin du mot colle au début de la pause la plus proche
  out.forEach((w, i) => {
    if (i === out.length - 1 || !/[,;:]$/.test(w.w)) return;
    const g = gaps.reduce((best, x) => (Math.abs(x.t0 - w.end) < Math.abs((best ? best.t0 : 1e9) - w.end) ? x : best), null);
    if (g && Math.abs(g.t0 - w.end) < 0.25) { w.end = g.t0; out[i + 1].start = g.t1; }
  });
  return out;
}

/** Recalage : chaque frontière entre deux mots glisse vers le creux d'énergie le plus proche. */
function snapWords(words, pcm, sr) {
  const env = envelope(pcm, sr);
  const win = 9; // ±90 ms
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1], w = words[i];
    if (w.start - prev.end > 0.03) continue; // déjà séparés par une vraie pause
    const f0 = Math.round(w.start / FRAME);
    const lo = Math.max(Math.round(prev.start / FRAME) + 4, f0 - win);
    const hi = Math.min(Math.round(w.end / FRAME) - 4, f0 + win, env.length - 1);
    let best = f0, bv = Infinity;
    for (let f = lo; f <= hi; f++) { const v = env[f] * (1 + Math.abs(f - f0) * 0.04); if (v < bv) { bv = v; best = f; } }
    if (bv < Infinity) { const t = best * FRAME; prev.end = t; w.start = t; }
  }
  return words;
}

/** Micro-pause avant chaque mot comique + léger renfort de volume sur le mot. */
function accentuate(pcm, sr, words, pause) {
  const hits = words.map((w, i) => ({ w, i })).filter(({ w, i }) => w.hl && i > 0);
  if (!hits.length) return { pcm, words };
  const env = envelope(pcm, sr);
  const voicedMed = [...env].filter((v) => v > silenceThreshold(env)).sort((a, b) => a - b);
  const med = voicedMed[Math.floor(voicedMed.length / 2)] || 0.05;
  const inserts = [];
  let prevHl = false;
  words.forEach((w, i) => {
    if (!w.hl || i === 0 || prevHl) { prevHl = !!w.hl; return; }
    prevHl = true;
    const f0 = Math.round(w.start / FRAME);
    let best = -1; let bv = Infinity;
    for (let f = Math.max(0, f0 - 6); f <= Math.min(env.length - 1, f0 + 6); f++) if (env[f] < bv) { bv = env[f]; best = f; }
    if (best >= 0 && bv < med * 0.35) inserts.push({ at: best * FRAME, word: i });
  });
  // Renfort de volume (+2 dB) sur les mots comiques
  const gain = new Float32Array(pcm.length).fill(1);
  words.forEach((w) => {
    if (!w.hl) return;
    const a = Math.floor(w.start * sr), b = Math.min(pcm.length, Math.ceil(w.end * sr));
    const ramp = Math.round(sr * 0.02);
    for (let i = a; i < b; i++) gain[i] = 1 + 0.26 * Math.min(1, (i - a) / ramp, (b - i) / ramp);
  });
  for (let i = 0; i < pcm.length; i++) pcm[i] *= gain[i];
  if (!inserts.length) return { pcm, words };
  const add = Math.round(pause * sr);
  const out = new Float32Array(pcm.length + add * inserts.length);
  let src = 0, dst = 0;
  inserts.sort((x, y) => x.at - y.at).forEach(({ at }) => {
    const cut = Math.round(at * sr);
    out.set(pcm.subarray(src, cut), dst); dst += cut - src; src = cut;
    dst += add; // silence
  });
  out.set(pcm.subarray(src), dst);
  // Décalage des mots (calculé sur les temps d'origine)
  const before = (t) => inserts.filter((x) => x.at <= t + 1e-4).length * pause;
  const shifted = words.map((w, i) => {
    const ins = inserts.find((x) => x.word === i);
    const start = ins ? ins.at + before(ins.at) : w.start + before(w.start);
    return { ...w, start, end: Math.max(start + 0.05, w.end + before(w.end - 1e-3)) };
  });
  shifted.forEach((w, i) => { if (i < shifted.length - 1 && w.end > shifted[i + 1].start) w.end = Math.max(w.start + 0.03, inserts.some((x) => x.word === i + 1) ? shifted[i + 1].start - pause : shifted[i + 1].start); });
  return { pcm: out, words: shifted };
}

/* ====================== Effets vocaux ====================== */
function curve(k) {
  const n = 2048; const c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  return c;
}
function impulse(ctx, secs, decay) {
  const len = Math.round(ctx.sampleRate * secs);
  const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  let r = 12345;
  for (let i = 0; i < len; i++) { r = (r * 1103515245 + 12345) & 0x7fffffff; d[i] = ((r / 0x7fffffff) * 2 - 1) * Math.pow(1 - i / len, decay); }
  return b;
}
function chainFx(ctx, src, name) {
  const nodes = [];
  const biq = (type, f, gain = 0, Q = 0.8) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.gain.value = gain; b.Q.value = Q; nodes.push(b); return b; };
  const drive = (k) => { const w = ctx.createWaveShaper(); w.curve = curve(k); w.oversample = '2x'; nodes.push(w); return w; };
  const lfo = (param, rate, depth) => { const o = ctx.createOscillator(); o.frequency.value = rate; const g = ctx.createGain(); g.gain.value = depth; o.connect(g); g.connect(param); o.start(0); };
  const wet = ctx.createGain(); wet.gain.value = 0; // envoi effets (écho/réverb)
  const sendEcho = (time, fb, amount) => {
    const d = ctx.createDelay(1); d.delayTime.value = time; const f = ctx.createGain(); f.gain.value = fb;
    const g = ctx.createGain(); g.gain.value = amount; d.connect(f); f.connect(d); d.connect(g); return [d, g];
  };
  const sendVerb = (secs, decay, amount) => { const c = ctx.createConvolver(); c.buffer = impulse(ctx, secs, decay); const g = ctx.createGain(); g.gain.value = amount; c.connect(g); return [c, g]; };
  const chain = [biq('highpass', 75, 0, 0.7)];
  const sends = [];
  switch (name) {
    case 'tiktok': chain.push(biq('peaking', 3000, 3, 0.9), biq('highshelf', 9000, 2)); break;
    case 'chat': chain.push(biq('highpass', 160), biq('peaking', 4200, 3, 1)); lfo(src.detune, 5.2, 12); break;
    case 'folle': chain.push(biq('peaking', 2500, 3, 1)); lfo(src.detune, 3.1, 110); lfo(src.detune, 0.7, 70); sends.push(sendEcho(0.13, 0.25, 0.18)); break;
    case 'proche': chain.push(biq('lowshelf', 160, 3), biq('peaking', 2800, 2, 1)); break;
    case 'theatre': chain.push(biq('peaking', 2200, 3, 0.8)); sends.push(sendVerb(1.3, 3.5, 0.13)); break;
    case 'genie': chain.push(biq('peaking', 2600, 3, 1)); sends.push(sendEcho(0.11, 0.18, 0.2)); break;
    case 'meme': chain.push(biq('lowshelf', 130, 6), drive(5), biq('peaking', 3000, 3, 1)); break;
    case 'cowboy': chain.push(biq('highpass', 260), biq('lowpass', 3800), biq('peaking', 1200, 4, 1), drive(4)); sends.push(sendEcho(0.09, 0.1, 0.16)); break;
    case 'mamie': chain.push(biq('peaking', 2500, 2, 1)); lfo(src.detune, 6.2, 28); break;
    case 'papy': chain.push(biq('lowpass', 4200), biq('lowshelf', 180, 3), drive(2.5)); lfo(src.detune, 4.6, 16); break;
    case 'robot': break; // traité à part (modulation en anneau + filtre en peigne)
    case 'perroquet': chain.push(biq('highpass', 300), biq('peaking', 2600, 4, 1.2), drive(1.5)); break;
    case 'influenceur': chain.push(biq('peaking', 3500, 4, 0.9), biq('highshelf', 8000, 3)); break;
    case 'drame': chain.push(biq('lowshelf', 140, 4), biq('peaking', 2500, 3, 1)); sends.push(sendVerb(1.8, 2.8, 0.17)); break;
    case 'radio': chain.push(biq('lowshelf', 110, 2), biq('peaking', 3000, 4, 0.9)); sends.push(sendVerb(0.35, 4, 0.08)); break;
    default: break;
  }
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -22; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.12; comp.knee.value = 8;
  let node = src;
  if (name === 'robot') {
    const ring = ctx.createGain(); ring.gain.value = 0; lfo(ring.gain, 70, 0.45);
    const dry = ctx.createGain(); dry.gain.value = 0.8; const mix = ctx.createGain();
    src.connect(ring); src.connect(dry); ring.connect(mix); dry.connect(mix);
    const comb = ctx.createDelay(0.05); comb.delayTime.value = 0.005; const fb = ctx.createGain(); fb.gain.value = 0.3;
    mix.connect(comb); comb.connect(fb); fb.connect(comb);
    const out = ctx.createGain(); mix.connect(out); comb.connect(out);
    node = out;
  }
  for (const n of chain) { node.connect(n); node = n; }
  node.connect(comp);
  for (const [inp, out] of sends) { node.connect(inp); out.connect(comp); }
  void wet; void nodes;
  return comp;
}

/** Hauteur + effet, rendu hors-ligne (aperçu = export). */
async function renderVoice(pcm, sr, voice, pitch) {
  const tail = ['theatre', 'drame', 'genie', 'folle', 'cowboy', 'radio'].includes(voice.fx) ? 0.35 : 0.04;
  const len = Math.ceil((pcm.length / sr / pitch + tail) * OUT_SR);
  const ctx = new OfflineAudioContext(1, len, OUT_SR);
  const buf = ctx.createBuffer(1, pcm.length, sr);
  buf.copyToChannel(pcm, 0);
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = pitch;
  chainFx(ctx, src, voice.fx).connect(ctx.destination);
  src.start(0);
  const out = await ctx.startRendering();
  return out.getChannelData(0);
}

/** Volume harmonisé : même niveau perçu pour toutes les voix + limiteur doux. */
function normalize(data, speechEnd) {
  const env = envelope(data, OUT_SR);
  const thr = silenceThreshold(env);
  let s = 0, n = 0;
  for (const v of env) if (v > thr) { s += v * v; n++; }
  const rms = Math.sqrt(s / Math.max(1, n)) || 0.05;
  const g = Math.min(8, 0.16 / rms); // ≈ -16 dBFS de niveau de parole
  const knee = 0.8;
  for (let i = 0; i < data.length; i++) {
    let x = data[i] * g; const a = Math.abs(x);
    if (a > knee) x = Math.sign(x) * (knee + (1 - knee) * Math.tanh((a - knee) / (1 - knee)));
    data[i] = x;
  }
  // fin : on garde la queue d'effet utile puis fondu
  let last = env.length - 1; const floor = thr * 0.25;
  while (last > 0 && env[last] < floor) last--;
  const end = Math.min(data.length, Math.max(Math.round(speechEnd * OUT_SR), (last + 2) * Math.round(OUT_SR * FRAME)));
  const out = data.slice(0, end);
  const fi = Math.round(OUT_SR * 0.005), fo = Math.min(out.length, Math.round(OUT_SR * 0.03));
  for (let i = 0; i < fi && i < out.length; i++) out[i] *= i / fi;
  for (let i = 0; i < fo; i++) out[out.length - 1 - i] *= i / fo;
  return out;
}

/* ====================== Moteurs ====================== */
async function synthPiper(voice, says, lenScale) {
  const res = await call({
    type: 'synth', model: voice.model, speaker: voice.spk || 0, sentences: says,
    scales: { noise: voice.noise, length: lenScale, noiseW: voice.noiseW },
  });
  return { sr: res.sampleRate, parts: res.parts };
}

async function synthAI(voice, text, chunks, speed) {
  const hl = chunks.flatMap((c) => c.words.filter((w) => w.hl).map((w) => speakable(w.w))).filter(Boolean);
  const instructions = `${voice.ai.instr} Français de France. Rythme rapide de vidéo TikTok, énergie élevée, intonations très expressives.${hl.length ? ` Accentue fortement : « ${hl.join(' », « ')} ».` : ''}`;
  const r = await fetch('/api/tts', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voice.ai.voice, instructions, speed }),
  });
  if (!r.ok) {
    let msg = 'Erreur voix IA';
    try { msg = (await r.json()).error || msg; } catch (e) { /* rien */ }
    throw new Error(msg);
  }
  const decoded = await audio.ensure().decodeAudioData(await r.arrayBuffer());
  return { sr: decoded.sampleRate, parts: [{ pcm: decoded.getChannelData(0).slice(), phonemes: null }] };
}

/* ====================== Une réplique ====================== */
const cache = new Map();
const CACHE_MAX = 80;
export function clearVoiceCache() { cache.clear(); }

async function renderLine({ text, voiceId, engine, viral, hook, accent, lenMul = 1 }) {
  const voice = VOICES[voiceId] || VOICES.narrateur_tiktok;
  const { chunks } = chunksOf(text);
  if (!chunks.length) return null;
  const tempo = (viral ? 0.93 : 1) * lenMul;
  const maxGap = viral ? 0.11 : 0.2;
  const sentencePause = viral ? 0.09 : 0.17;
  let pitch = voice.pitch;
  let raw;
  if (engine === 'ia') {
    pitch = voice.pitch > 1.3 ? 1.16 : voice.pitch < 0.86 ? 0.94 : 1;
    const speed = Math.min(1.6, Math.max(0.8, (1 / (voice.len * tempo)) / pitch));
    raw = await synthAI(voice, chunks.map((c) => c.say).join(' '), chunks, speed);
    raw.single = true;
  } else {
    raw = await synthPiper(voice, chunks.map((c) => c.say), voice.len * tempo * pitch);
  }
  const sr = raw.sr;
  // Assemblage des phrases + minutage des mots
  const pieces = []; let words = []; let t = 0;
  const groups = raw.single ? [{ part: raw.parts[0], words: chunks.flatMap((c) => c.words) }] : chunks.map((c, i) => ({ part: raw.parts[i], words: c.words }));
  groups.forEach((g, i) => {
    if (!g.part) return;
    const tight = tighten(g.part.pcm, sr, maxGap * pitch);
    let pcm = tight.pcm; const dur = pcm.length / sr;
    let ws = snapWords(timeWords(g.words, g.part.phonemes, dur, tight.gaps), pcm, sr);
    if (accent) { const r = accentuate(pcm, sr, ws, (viral ? 0.075 : 0.1) * pitch); pcm = r.pcm; ws = r.words; }
    words.push(...ws.map((w) => ({ ...w, start: w.start + t, end: w.end + t })));
    pieces.push(pcm); t += pcm.length / sr;
    if (i < groups.length - 1) { const gap = new Float32Array(Math.round(sentencePause * pitch * sr)); pieces.push(gap); t += gap.length / sr; }
  });
  const total = pieces.reduce((s, p) => s + p.length, 0);
  const pcm = new Float32Array(total);
  let o = 0; for (const p of pieces) { pcm.set(p, o); o += p.length; }
  const speechEnd = total / sr / pitch;
  const data = normalize(await renderVoice(pcm, sr, voice, pitch), speechEnd);
  const buffer = audio.ensure().createBuffer(1, data.length, OUT_SR);
  buffer.copyToChannel(data, 0);
  words = words.map((w) => ({ w: w.w, hl: w.hl, start: w.start / pitch, end: Math.min(speechEnd, w.end / pitch) }));
  return { buffer, rate: 1, dur: speechEnd + 0.03, words, voiceId };
}

const estimateDur = (text) => Math.max(0.9, parseWords(text).length * 0.28 + 0.2);
function silentLine(text) {
  const dur = estimateDur(text);
  const words = parseWords(text);
  const step = (dur - 0.1) / Math.max(1, words.length);
  return { buffer: null, rate: 1, dur, words: words.map((w, i) => ({ w: w.w, hl: w.hl, start: 0.05 + i * step, end: 0.05 + (i + 1) * step })) };
}

/* ====================== Projet complet ====================== */
/**
 * @returns {{ voices:Array, warning:string|null, cast:object, auto:object }}
 */
export async function prepareVoices(project, settings, onProgress = () => {}) {
  const { cast, auto } = resolveCast(project, settings);
  let engine = settings.engine;
  const out = [];
  let warning = null;
  const n = project.beats.length;
  for (let i = 0; i < n; i++) {
    const beat = project.beats[i];
    onProgress(i, n);
    const role = beat.s === 'chat' ? 'chat' : beat.s === 'humain' ? 'humain' : 'narrateur';
    const voiceId = cast[role];
    const hook = project.viral && beat.role === 'hook';
    const accent = settings.accent !== false;
    const key = [engine, voiceId, beat.t, project.viral, hook, accent].join('|');
    if (engine === 'aucune' || !speakable(beat.t)) { out.push(silentLine(beat.t)); continue; }
    if (cache.has(key)) { out.push(cache.get(key)); continue; }
    let res = null;
    try {
      res = await renderLine({ text: beat.t, voiceId, engine, viral: project.viral, accent });
      // Mode viral : le hook doit tenir en moins de 2 s → débit naturellement plus rapide
      if (res && hook && res.dur > 1.9) {
        const mul = Math.max(0.72, 1.85 / res.dur);
        res = await renderLine({ text: beat.t, voiceId, engine, viral: true, accent, lenMul: mul });
      }
    } catch (e) {
      if (engine === 'ia') {
        warning = `Voix IA indisponible (${e.message}) : voix neuronales gratuites utilisées`;
        engine = 'piper';
        i--; continue;
      }
      warning = `Voix indisponible (${e.message})`;
      res = null;
    }
    if (!res) { out.push(silentLine(beat.t)); continue; }
    cache.set(key, res);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    out.push(res);
  }
  onProgress(n, n);
  return { voices: out, warning, cast, auto };
}

/** Écoute d'une voix (phrase d'exemple propre à chaque voix). */
export async function sampleVoice(voiceId, engine = 'piper') {
  const v = VOICES[voiceId];
  return renderLine({ text: v.sample, voiceId, engine, viral: true, accent: true });
}

export function modelsFor(cast) {
  return [...new Set(Object.values(cast).map((id) => VOICES[id] && VOICES[id].model).filter(Boolean))].map((m) => ({ id: m, ...VOICE_MODELS[m] }));
}

/* ====================== Ligne de temps ====================== */
export function buildTimeline(project, voices) {
  const pad = project.viral ? 0.06 : 0.22;
  let t = 0;
  const beats = project.beats.map((b, i) => {
    const v = voices[i] || silentLine(b.t);
    const dur = Math.max(project.viral ? 0.9 : 1.3, v.dur + pad);
    const r = { ...b, index: i, start: t, end: t + dur, dur, voice: v, words: v.words.map((w) => ({ ...w, start: w.start + t, end: w.end + t })) };
    t += dur;
    return r;
  });
  const sfx = beats.filter((b) => b.fx && b.fx !== 'aucun').map((b) => ({ t: b.start + 0.02, name: b.fx }));
  if (project.viral) sfx.push(...beats.slice(1).filter((b) => b.fx === 'aucun' || !b.fx).map((b) => ({ t: b.start, name: 'whoosh' })));
  return { duration: t + (project.loop ? 0.25 : 0.5), beats, sfx };
}
