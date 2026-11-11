/**
 * Moteur de scénarios : génération locale, décoration automatique (mode viral),
 * métadonnées (titre, description, hashtags) et normalisation des scénarios IA.
 */
import {
  CONCEPTS, PERSONAS, GENERIC, CTAS, ENGAGEMENT, BASE_TAGS,
  EMOTIONS, SFX, MEMES, CAMERAS, SCENES,
} from './data.js';

/* ---------- Aléatoire reproductible ---------- */
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pickR = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function sampleOrdered(rng, arr, n) {
  if (n >= arr.length) return arr.slice();
  const idx = arr.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, n).sort((a, b) => a - b).map(i => arr[i]);
}

let _id = 0;
export const newId = () => `b${Date.now().toString(36)}${(_id++).toString(36)}`;

/* ---------- Texte ---------- */
export function fill(text, ctx) {
  return String(text || '')
    .replace(/\{nom\}/g, ctx.nom || 'Moustache')
    .replace(/\{sujet\}/g, ctx.sujet || 'fait une bêtise');
}
export const plain = (t) => String(t || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

/** Découpe un texte en mots, en repérant les passages *comiques*. */
export function parseWords(text) {
  const out = [];
  let hl = false;
  const tokens = String(text || '').replace(/\*/g, ' * ').split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    if (tok === '*') { hl = !hl; continue; }
    // Colle la ponctuation isolée au mot précédent (« quoi ? » → « quoi ? »)
    if (/^[?!:;»…]+$/.test(tok) && out.length) { out[out.length - 1].w += ' ' + tok; continue; }
    if (/^[.,]+$/.test(tok) && out.length) { out[out.length - 1].w += tok; continue; }
    out.push({ w: tok, hl });
  }
  return out;
}
export const wordCount = (t) => parseWords(t).length;

/* ---------- Détection de décor pour une idée libre ---------- */
const SCENE_KEYWORDS = [
  [/espace|astronaute|lune|fusée|planète|mars/i, 'espace'],
  [/cuisin|chef|gâteau|recette|pâtiss|manger|repas/i, 'cuisine'],
  [/restaurant|serveur|resto/i, 'restaurant'],
  [/plage|vacances|mer|surf|soleil|piscine/i, 'plage'],
  [/travail|bureau|patron|réunion|boss|entreprise|stagiaire/i, 'bureau'],
  [/riche|argent|banque|loto|million|or\b|trésor/i, 'coffre'],
  [/président|roi|reine|ministre|élection|maire|dictateur/i, 'palais'],
  [/influen|youtube|stream|vidéo|tiktok|star|célèbre|chanteur/i, 'studio'],
  [/vole|voleur|braqu|police|crime|espion|agent|mafia/i, 'nuit'],
  [/procès|juge|avocat|tribunal/i, 'tribunal'],
  [/sport|muscu|courir|marathon|foot|boxe|gym/i, 'salle_sport'],
  [/science|savant|invent|chimie|robot|laboratoire|génie/i, 'labo'],
  [/internet|ordinateur|ia\b|intelligence|hack|jeu vidéo|gamer|crypto/i, 'internet'],
  [/dort|sieste|lit|rêve|nuit/i, 'chambre'],
];
export function guessScenes(sujet) {
  const found = SCENE_KEYWORDS.filter(([re]) => re.test(sujet)).map(([, s]) => s);
  const main = found[0] || 'salon';
  return [main, found[1] || 'salon', main, 'nuit'];
}

/** Mots qui déclenchent la curiosité dans un hook. */
export const HOOK_TRIGGERS = /\?|POV|personne|jamais|attends|regarde|incroyable|\d|😱|😳|🤯|!|vient d|a gagné|a découvert|a ouvert|a remplacé|devenu|erreur|sans moi|n'était prêt|fin\b/i;

/* ---------- Génération locale ---------- */
const LENGTHS = { court: { setup: 1, esc: 2 }, moyen: { setup: 2, esc: 3 }, long: { setup: 2, esc: 5 } };

export function getConcept(id) { return CONCEPTS.find(c => c.id === id) || null; }

export function generateLocal(opts) {
  const {
    conceptId, sujet = '', personaId = 'paresseux', nom = 'Moustache',
    viral = true, longueur = 'moyen', seed = Date.now(),
  } = opts;
  const rng = makeRng(seed);
  const concept = conceptId && conceptId !== 'libre' ? getConcept(conceptId) : null;
  const persona = PERSONAS[personaId] || PERSONAS.paresseux;
  const src = concept || GENERIC;
  const ctx = { nom, sujet: sujet.trim().replace(/^mon chat\s+/i, '').replace(/[.!?]+$/, '') || 'fait une bêtise' };
  const L = LENGTHS[longueur] || LENGTHS.moyen;
  const scenes = concept ? concept.scenes : guessScenes(ctx.sujet);

  // Hook : en mode viral, on garde le plus percutant (le plus court)
  let hookText;
  if (viral) {
    const short = (h) => (wordCount(h) <= 9 ? 0 : 1);
    const sorted = src.hooks.slice().sort((a, b) => (short(a) - short(b)) || (HOOK_TRIGGERS.test(b) - HOOK_TRIGGERS.test(a)) || (wordCount(a) - wordCount(b)));
    hookText = rng() < 0.6 ? sorted[0] : pickR(rng, sorted.slice(0, 2));
  } else hookText = pickR(rng, src.hooks);

  const beats = [];
  const push = (role, line, fallbackScene) => beats.push({
    id: newId(), role,
    s: line.s || 'chat',
    t: fill(line.t, ctx),
    e: line.e || persona.emo,
    sc: line.sc || fallbackScene,
    fx: line.fx || '', m: line.m || '', cam: line.cam || '',
  });

  push('hook', { s: 'narrateur', t: hookText, e: 'choque', fx: 'boom', m: viral ? 'rayons' : '' }, scenes[0]);
  sampleOrdered(rng, src.setup, L.setup).forEach(l => push('setup', l, scenes[0]));
  const esc = sampleOrdered(rng, src.escalade, L.esc);
  esc.forEach((l, i) => push('escalade', l, scenes[Math.min(1 + Math.floor(i / 2), scenes.length - 1)]));
  // Réplique de personnalité, insérée avant la chute
  push('escalade', { s: 'chat', t: pickR(rng, persona.lignes), e: persona.emo }, scenes[Math.min(2, scenes.length - 1)]);
  push('twist', pickR(rng, src.twist), scenes[scenes.length - 1]);
  push('cta', { s: 'chat', t: pickR(rng, CTAS), e: 'malicieux', fx: 'pop', cam: 'rebond' }, scenes[scenes.length - 1]);

  // Mode viral : une réplique longue devient deux plans (plus de coupes, rythme plus rapide)
  if (viral) {
    for (let i = beats.length - 1; i > 0; i--) {
      if (beats[i].role !== 'cta' && wordCount(beats[i].t) > 10) beats.splice(i, 1, ...splitBeat(beats[i]));
    }
  }
  decorate(beats, { viral, rng });

  const meta = makeMeta({ concept, persona, ctx, hookText, rng });
  return {
    conceptId: concept ? concept.id : 'libre', sujet: ctx.sujet, personaId, nom,
    acc: { ...persona.acc, ...(concept ? concept.acc : {}) },
    beats, ...meta, seed,
  };
}

/* ---------- Décoration automatique (sons, mèmes, caméra) ---------- */
const CAM_KEYS = Object.keys(CAMERAS);
export function decorate(beats, { viral = true, rng = Math.random, force = false } = {}) {
  let lastCam = '';
  let memeCount = beats.filter(b => b.m && b.m !== 'aucun').length;
  beats.forEach((b, i) => {
    const emo = EMOTIONS[b.e] || EMOTIONS.neutre;
    if (!b.fx || force) {
      // En mode viral, chaque séquence a son effet sonore ; sinon une sur deux.
      const key = viral || i % 2 === 0 || b.role !== 'escalade';
      b.fx = key && !(b.s === 'humain' && !viral) ? emo.fx : 'aucun';
    }
    if (!b.cam || force) {
      let cam = emo.cam;
      if (b.role === 'hook' || b.role === 'twist') cam = 'punch';
      if (b.role === 'cta') cam = 'rebond';
      if (cam === lastCam) cam = CAM_KEYS[(CAM_KEYS.indexOf(cam) + 1 + Math.floor(rng() * 3)) % CAM_KEYS.length];
      b.cam = cam;
    }
    lastCam = b.cam;
  });
  // Mode viral : au moins 3 mèmes répartis dans la vidéo
  if (viral && memeCount < 3) {
    const pool = ['cercle_rouge', 'bruh', 'lunettes', 'yeux', 'rayons', 'degats'];
    for (const b of beats) {
      if (memeCount >= 3) break;
      if ((!b.m || b.m === 'aucun') && b.role === 'escalade' && b.s !== 'humain') { b.m = pool[Math.floor(rng() * pool.length)]; memeCount++; }
    }
  }
  beats.forEach(b => { if (!b.m) b.m = 'aucun'; });
  return beats;
}

/* ---------- Métadonnées ---------- */
export function makeMeta({ concept, persona, ctx, hookText, rng = Math.random }) {
  const src = concept || GENERIC;
  let title = plain(fill(pickR(rng, src.titres), ctx));
  if (!/\p{Extended_Pictographic}/u.test(title)) title += ' ' + (concept ? concept.emoji : '😹') + '😹';
  const personaTag = '#chat' + persona.nom.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
  const tags = [...new Set([
    '#chat', '#chatdrole', '#humour',
    ...(concept ? concept.tags : []), personaTag,
    ...sampleOrdered(rng, BASE_TAGS.slice(3), 2),
  ])].slice(0, 7);
  const hookPlain = plain(fill(hookText, ctx));
  const description = `${hookPlain} ${pickR(rng, ENGAGEMENT)}`;
  const overlay = (concept ? concept.titre : `Mon chat ${ctx.sujet}`).toUpperCase() + ' ' + (concept ? concept.emoji : '😳');
  return { title, description, hashtags: tags, overlay };
}

/* ---------- Normalisation d'un scénario IA ---------- */
const pickKey = (v, dict, def) => (v && Object.prototype.hasOwnProperty.call(dict, v) ? v : def);
export function normalizeProject(raw, base) {
  const beatsIn = Array.isArray(raw?.beats) ? raw.beats : [];
  const roles = ['hook', 'setup', 'escalade', 'twist', 'cta'];
  const beats = beatsIn.slice(0, 16).map((b, i) => ({
    id: newId(),
    role: roles.includes(b.role) ? b.role : (i === 0 ? 'hook' : i === beatsIn.length - 1 ? 'cta' : 'escalade'),
    s: ['chat', 'narrateur', 'humain'].includes(b.s || b.speaker) ? (b.s || b.speaker) : 'chat',
    t: String(b.t || b.text || '').slice(0, 220),
    e: pickKey(b.e || b.emotion, EMOTIONS, 'neutre'),
    sc: pickKey(b.sc || b.scene, SCENES, 'salon'),
    fx: pickKey(b.fx || b.sfx, SFX, ''),
    m: pickKey(b.m || b.meme, MEMES, ''),
    cam: pickKey(b.cam || b.camera, CAMERAS, ''),
  })).filter(b => b.t.trim());
  if (beats.length < 3) throw new Error('Scénario IA incomplet');
  decorate(beats, { viral: base.viral });
  const tags = (Array.isArray(raw.hashtags) ? raw.hashtags : [])
    .map(h => '#' + String(h).replace(/^#+/, '').replace(/\s+/g, '')).filter(h => h.length > 1).slice(0, 8);
  return {
    ...base,
    beats,
    title: plain(raw.title || base.title || 'Mon chat a encore fait des siennes 😹').slice(0, 100),
    description: plain(raw.description || base.description || '').slice(0, 300),
    hashtags: tags.length ? tags : ['#chat', '#chatdrole', '#humour', '#pourtoi'],
    overlay: plain(raw.overlay || base.overlay || '').toUpperCase().slice(0, 48),
  };
}

/** Coupe une séquence trop longue en deux (utilisé par les suggestions). */
export function splitBeat(beat) {
  const words = beat.t.split(/\s+/);
  let cut = Math.ceil(words.length / 2);
  const punct = words.findIndex((w, i) => i >= 3 && i < words.length - 2 && /[.,!?;:…]$/.test(w));
  if (punct > 0) cut = punct + 1;
  // Évite de couper au milieu d'un passage *comique*
  const first = words.slice(0, cut).join(' ');
  const opens = (first.match(/\*/g) || []).length % 2 === 1;
  const a = { ...beat, t: opens ? first + '*' : first };
  const b = { ...beat, id: newId(), role: beat.role === 'hook' ? 'setup' : beat.role, t: (opens ? '*' : '') + words.slice(cut).join(' '), cam: '', fx: beat.fx };
  return [a, b];
}
