/**
 * Voix : miaou-parlé synthétique, doublage FR gratuit (eSpeak/meSpeak),
 * doublage IA premium (via /api/tts) et voix du navigateur (aperçu).
 * Produit aussi la ligne de temps (minutage mot par mot).
 */
import { audio } from './audio.js';
import { VOICE_STYLES, NARRATOR_STYLES } from './data.js';
import { parseWords, plain } from './story.js';

const cache = new Map();
const CACHE_MAX = 120;
function remember(key, val) {
  cache.set(key, val);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return val;
}

/* ---------- Texte prononçable ---------- */
export function speakable(text) {
  return plain(text)
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/\bPOV\b\s*:?/g, 'Point de vue :')
    .replace(/(\d+)\s*%/g, '$1 pour cent')
    .replace(/€/g, ' euros')
    .replace(/[«»"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- Choix du style selon l'orateur ---------- */
export function styleFor(beat, settings) {
  if (beat.s === 'chat') return { kind: 'chat', ...(VOICE_STYLES[settings.catVoice] || VOICE_STYLES.chaton) };
  const key = beat.s === 'humain' ? 'humain' : 'narrateur';
  return { kind: key, ...(NARRATOR_STYLES[key]) };
}

/* ---------- Chargement paresseux de meSpeak (1,8 Mo, mis en cache) ---------- */
let espeakPromise = null;
export function loadEspeak() {
  if (window.meSpeak) return Promise.resolve(window.meSpeak);
  if (espeakPromise) return espeakPromise;
  espeakPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('../vendor/mespeak-fr.js', import.meta.url).href;
    s.async = true;
    s.onload = () => (window.meSpeak ? resolve(window.meSpeak) : reject(new Error('meSpeak indisponible')));
    s.onerror = () => { espeakPromise = null; reject(new Error('Chargement de la voix impossible')); };
    document.head.appendChild(s);
  });
  return espeakPromise;
}

async function renderEspeak(text, es) {
  const m = await loadEspeak();
  const data = m.speak(text, { rawdata: true, pitch: es.pitch, speed: es.speed, variant: es.variant, amplitude: 120, wordgap: 0 });
  if (!data) throw new Error('Synthèse vide');
  const ctx = audio.ensure();
  return ctx.decodeAudioData(data.slice ? data.slice(0) : data);
}

async function renderAI(text, ai, speed) {
  const r = await fetch('/api/tts', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: ai.voice, instructions: ai.instr, speed }),
  });
  if (!r.ok) throw new Error((await r.text()).slice(0, 160) || 'Erreur TTS');
  const ab = await r.arrayBuffer();
  return audio.ensure().decodeAudioData(ab);
}

/* ---------- Miaou-parlé : un « miaou » par syllabe, minutage exact ---------- */
const VOWELS = /[aeiouyàâäéèêëîïôöûùüœæ]+/gi;
const FORMANTS = { a: [800, 1250], e: [520, 1650], é: [420, 2100], i: [300, 2300], o: [520, 900], u: [330, 1900], ou: [320, 780], y: [300, 2200] };
function formantFor(v) {
  v = v.toLowerCase();
  if (v.includes('ou')) return FORMANTS.ou;
  const c = v[0];
  if ('aàâä'.includes(c)) return FORMANTS.a;
  if ('éèêë'.includes(c)) return FORMANTS['é'];
  if ('iîï'.includes(c)) return FORMANTS.i;
  if ('oôöœ'.includes(c)) return FORMANTS.o;
  if ('uûùü'.includes(c)) return FORMANTS.u;
  if (c === 'y') return FORMANTS.y;
  return FORMANTS.e;
}

export function miaouPlan(text, speed = 1) {
  const words = parseWords(text);
  let t = 0.06;
  const plan = [];
  words.forEach((wd, wi) => {
    const groups = (wd.w.match(VOWELS) || ['a']).slice(0, 4);
    const start = t;
    const syl = [];
    groups.forEach((g, gi) => {
      const d = (0.105 + (gi === groups.length - 1 ? 0.035 : 0)) / speed;
      syl.push({ t, d, v: g, accent: gi === groups.length - 1 });
      t += d;
    });
    const end = t;
    let gap = 0.045 / speed;
    if (/[,;:]$/.test(wd.w)) gap += 0.13 / speed;
    if (/[.!?…]$/.test(wd.w)) gap += 0.22 / speed;
    plan.push({ ...wd, start, end, syl, q: /\?$/.test(wd.w), ex: /!$/.test(wd.w) || wd.hl, last: wi === words.length - 1 });
    t += gap;
  });
  return { plan, dur: t + 0.05 };
}

async function renderMiaou(text, m, speed, seed = 1) {
  const sr = 44100;
  const { plan, dur } = miaouPlan(text, speed);
  const ctx = new OfflineAudioContext(1, Math.ceil((dur + 0.25) * sr), sr);
  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination);
  let rnd = seed * 9301 + 49297;
  const rand = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
  const type = m.wave === 'square' ? 'square' : m.wave === 'saw' ? 'sawtooth' : 'triangle';
  plan.forEach(w => {
    w.syl.forEach((s, si) => {
      let f = m.f0 * (0.88 + rand() * 0.28);
      if (w.ex) f *= 1.18;
      if (w.q && w.last && s.accent) f *= 1.35;
      const o = ctx.createOscillator(); o.type = type;
      const peak = f * (s.accent ? m.range : 1 + (m.range - 1) * 0.5);
      o.frequency.setValueAtTime(f * 0.9, s.t);
      o.frequency.linearRampToValueAtTime(peak, s.t + s.d * 0.45);
      o.frequency.exponentialRampToValueAtTime(Math.max(60, f * (w.q && w.last ? 1.2 : 0.78)), s.t + s.d);
      const [F1, F2] = formantFor(s.v);
      const b1 = ctx.createBiquadFilter(); b1.type = 'bandpass'; b1.Q.value = 5;
      const b2 = ctx.createBiquadFilter(); b2.type = 'bandpass'; b2.Q.value = 7;
      // ouverture « m » → voyelle
      b1.frequency.setValueAtTime(si === 0 ? 260 : F1, s.t); b1.frequency.linearRampToValueAtTime(F1, s.t + s.d * 0.3);
      b2.frequency.setValueAtTime(F2 * (si === 0 ? 0.7 : 1), s.t); b2.frequency.linearRampToValueAtTime(F2, s.t + s.d * 0.3);
      const g = ctx.createGain();
      const amp = w.ex ? 0.95 : 0.7;
      g.gain.setValueAtTime(0.0001, s.t);
      g.gain.exponentialRampToValueAtTime(amp, s.t + Math.min(0.03, s.d * 0.3));
      g.gain.setValueAtTime(amp, s.t + s.d * 0.65);
      g.gain.exponentialRampToValueAtTime(0.0001, s.t + s.d + 0.02);
      const dry = ctx.createGain(); dry.gain.value = 0.08;
      o.connect(b1); o.connect(b2); o.connect(dry);
      b1.connect(g); b2.connect(g); dry.connect(g); g.connect(out);
      o.start(s.t); o.stop(s.t + s.d + 0.04);
    });
  });
  const buffer = await ctx.startRendering();
  return { buffer, words: plan.map(w => ({ w: w.w, hl: w.hl, start: w.start, end: w.end })), dur };
}

/* ---------- Minutage des mots pour une voix TTS ---------- */
function speechBounds(buffer) {
  const d = buffer.getChannelData(0);
  const thr = 0.02;
  let a = 0, b = d.length - 1;
  while (a < d.length && Math.abs(d[a]) < thr) a++;
  while (b > a && Math.abs(d[b]) < thr) b--;
  return [a / buffer.sampleRate, b / buffer.sampleRate];
}
function distributeWords(text, s0, s1) {
  const words = parseWords(text);
  const weights = words.map(w => w.w.replace(/[^\p{L}\p{N}]/gu, '').length + 2 + (/[.!?,;:…]$/.test(w.w) ? 3 : 0));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let t = s0;
  return words.map((w, i) => {
    const d = (s1 - s0) * weights[i] / total;
    const r = { w: w.w, hl: w.hl, start: t, end: t + d };
    t += d; return r;
  });
}
const estimateDur = (text, rate = 1) => Math.max(0.9, parseWords(text).length * 0.3 / rate + 0.25);

/* ---------- Préparation de toutes les voix d'un projet ---------- */
/**
 * Retourne, pour chaque séquence : { buffer|null, rate, dur, words[] } (temps relatifs au début de la séquence).
 */
export async function prepareVoices(project, settings, onProgress = () => {}) {
  const engine = settings.engine;
  const vf = project.viral ? 1.12 : 1;
  const out = [];
  let warned = null;
  for (let i = 0; i < project.beats.length; i++) {
    const beat = project.beats[i];
    const st = styleFor(beat, settings);
    const text = speakable(beat.t);
    onProgress(i, project.beats.length);
    const key = [engine, beat.s, settings.catVoice, beat.t, vf, beat.role === 'hook'].join('|');
    if (cache.has(key)) { out.push(cache.get(key)); continue; }

    let res = null;
    const useMiaou = engine === 'miaou' && beat.s === 'chat';
    try {
      if (!text || engine === 'aucune' || engine === 'navigateur') {
        const dur = estimateDur(beat.t, (st.rate || 1) * vf);
        res = { buffer: null, rate: 1, dur, words: distributeWords(beat.t, 0.05, dur - 0.1) };
      } else if (useMiaou) {
        let sp = vf * (st.rate || 1);
        if (project.viral && beat.role === 'hook') sp = Math.max(sp, miaouPlan(beat.t, 1).dur / 1.75);
        const r = await renderMiaou(beat.t, st.m, sp, i + 1);
        res = { buffer: r.buffer, rate: 1, dur: r.dur, words: r.words };
      } else {
        let buffer, rate = (st.rate || 1) * vf;
        if (engine === 'ia') {
          try { buffer = await renderAI(text, st.ai, Math.min(1.5, vf)); rate = st.kind === 'chat' ? Math.max(1, st.rate) : 1; }
          catch (e) { warned = warned || e.message; buffer = await renderEspeak(text, st.es); }
        } else {
          buffer = await renderEspeak(text, st.es);
        }
        const [s0, s1] = speechBounds(buffer);
        // Mode viral : le hook doit tenir en moins de 2 s → on accélère (effet « voix pressée » assumé)
        if (project.viral && beat.role === 'hook' && (s1 - s0) / rate > 1.75) rate = Math.min(1.7, (s1 - s0) / 1.75);
        res = { buffer, rate, dur: (s1 + 0.08) / rate, words: distributeWords(beat.t, s0 / rate, s1 / rate) };
      }
    } catch (e) {
      // Dernier recours : miaou-parlé (toujours disponible)
      warned = warned || e.message;
      const m = (VOICE_STYLES[settings.catVoice] || VOICE_STYLES.chaton).m;
      const r = await renderMiaou(beat.t, beat.s === 'chat' ? m : { f0: 210, range: 1.1, wave: 'saw' }, vf, i + 1);
      res = { buffer: r.buffer, rate: 1, dur: r.dur, words: r.words };
    }
    out.push(remember(key, res));
  }
  onProgress(project.beats.length, project.beats.length);
  return { voices: out, warning: warned };
}

/* ---------- Ligne de temps ---------- */
export function buildTimeline(project, voices) {
  const pad = project.viral ? 0.14 : 0.4;
  let t = 0;
  const beats = project.beats.map((b, i) => {
    const v = voices[i] || { dur: estimateDur(b.t), words: distributeWords(b.t, 0.05, estimateDur(b.t) - 0.1), buffer: null, rate: 1 };
    const dur = Math.max(project.viral ? 1.0 : 1.4, v.dur + pad);
    const r = { ...b, index: i, start: t, end: t + dur, dur, voice: v, words: v.words.map(w => ({ ...w, start: w.start + t, end: w.end + t })) };
    t += dur;
    return r;
  });
  const sfx = beats.filter(b => b.fx && b.fx !== 'aucun').map(b => ({ t: b.start + 0.02, name: b.fx }));
  if (project.viral) sfx.push(...beats.slice(1).filter(b => b.fx === 'aucun' || !b.fx).map(b => ({ t: b.start, name: 'whoosh' })));
  return { duration: t + (project.loop ? 0.25 : 0.5), beats, sfx };
}

/* ---------- Voix du navigateur (aperçu) ---------- */
const BROWSER_PITCH = { chaton: 2, matou: 0.4, diva: 1.6, genie: 1.2, mafieux: 0.3, influenceur: 1.8, narrateur: 0.9, humain: 1.1 };
export function speakBrowser(beat, settings, viral) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(speakable(beat.t));
  u.lang = 'fr-FR';
  const key = beat.s === 'chat' ? settings.catVoice : beat.s === 'humain' ? 'humain' : 'narrateur';
  u.pitch = BROWSER_PITCH[key] ?? 1;
  u.rate = (viral ? 1.15 : 1.0) * (key === 'influenceur' ? 1.25 : key === 'matou' || key === 'mafieux' ? 0.9 : 1.05);
  const fr = speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith('fr'));
  if (fr.length) u.voice = fr[(beat.s === 'chat' ? 0 : 1) % fr.length];
  speechSynthesis.speak(u);
}
