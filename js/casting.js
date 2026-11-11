/**
 * Casting automatique : analyse le script et choisit, pour chaque rôle
 * (chat, narrateur, humain), la voix qui maximise l'humour et la rétention.
 *
 * Score = affinité avec le personnage du chat + le thème + les émotions
 * du script + l'énergie du texte (! ? mots comiques) + contraste entre rôles.
 */
import { VOICES, PERSONAS } from './data.js';
import { plain } from './story.js';

/* Affinités personnage → voix (le chat est la star) */
const PERSONA_FIT = {
  paresseux:   { sarcastique: 5, papy: 4, robot: 2, dramatique: 1 },
  gourmand:    { chat_drole: 5, folle: 3, mamie: 2, meme: 2 },
  jaloux:      { theatrale: 5, dramatique: 3, sarcastique: 2, chat_drole: 1 },
  genie:       { genie: 5, robot: 3, sarcastique: 2 },
  criminel:    { cowboy: 4, sarcastique: 4, dramatique: 3, genie: 1 },
  influenceur: { influenceur: 5, meme: 3, folle: 2, presentateur: 1 },
  milliardaire:{ sarcastique: 4, theatrale: 3, genie: 2, cowboy: 1 },
  dramatique:  { dramatique: 5, theatrale: 4, folle: 2 },
  sportif:     { presentateur: 5, influenceur: 3, cowboy: 2 },
  philosophe:  { genie: 5, theatrale: 3, sarcastique: 2 },
  espion:      { robot: 4, dramatique: 4, sarcastique: 2, cowboy: 1 },
  grincheux:   { papy: 5, sarcastique: 4, cowboy: 1 },
};

/* Affinités thème (concept) → voix, par rôle */
const THEME_FIT = {
  president:      { chat: { theatrale: 2, genie: 1 }, narrateur: { dramatique: 3, presentateur: 2, narrateur_tiktok: 2 } },
  restaurant:     { chat: { chat_drole: 2, sarcastique: 1 }, narrateur: { narrateur_tiktok: 3 } },
  patron:         { chat: { sarcastique: 2, papy: 1 }, narrateur: { narrateur_tiktok: 3, sarcastique: 1 } },
  internet:       { chat: { meme: 3, robot: 2 }, narrateur: { narrateur_tiktok: 3, meme: 2 } },
  travailler:     { chat: { sarcastique: 2, papy: 2 }, narrateur: { narrateur_tiktok: 3 } },
  vacances:       { chat: { influenceur: 2, chat_drole: 1 }, narrateur: { narrateur_tiktok: 3, presentateur: 1 } },
  influenceur:    { chat: { influenceur: 3, meme: 1 }, narrateur: { narrateur_tiktok: 3, meme: 1 } },
  loto:           { chat: { folle: 3, cowboy: 1 }, narrateur: { presentateur: 3, narrateur_tiktok: 2 } },
  entretien:      { chat: { genie: 2, sarcastique: 2 }, narrateur: { narrateur_tiktok: 3, robot: 1 } },
  braquage:       { chat: { cowboy: 3, sarcastique: 2 }, narrateur: { dramatique: 4, narrateur_tiktok: 1 } },
  crypto:         { chat: { meme: 3, folle: 2, genie: 1 }, narrateur: { narrateur_tiktok: 2, meme: 2 } },
  tribunal:       { chat: { theatrale: 3, sarcastique: 1 }, narrateur: { dramatique: 4, theatrale: 1 } },
  chiot:          { chat: { dramatique: 2, theatrale: 2, sarcastique: 1 }, narrateur: { narrateur_tiktok: 3, dramatique: 1 } },
  sport:          { chat: { presentateur: 2, papy: 1 }, narrateur: { presentateur: 4 } },
  service_client: { chat: { robot: 3, sarcastique: 1 }, narrateur: { narrateur_tiktok: 3, robot: 1 } },
  rendez_vous:    { chat: { theatrale: 2, chat_drole: 1 }, narrateur: { narrateur_tiktok: 3, mamie: 1 } },
};

/* Émotions dominantes → voix qui les rendent drôles */
const EMO_FIT = {
  panique: { folle: 2, dramatique: 1, perroquet: 1 },
  choque: { dramatique: 1, folle: 1, theatrale: 1 },
  colere: { papy: 2, cowboy: 1 },
  pleure: { theatrale: 2, dramatique: 1 },
  rire: { influenceur: 1, folle: 1, meme: 1 },
  fier: { genie: 1, presentateur: 1, theatrale: 1 },
  malicieux: { sarcastique: 1, cowboy: 1 },
  suspicieux: { sarcastique: 1, robot: 1 },
  dodo: { papy: 1, sarcastique: 1 },
  gourmand: { chat_drole: 2 },
  amour: { mamie: 1, theatrale: 1 },
};

/* Mots du script qui appellent une voix précise */
const KEYWORDS = [
  [/\b(mamie|grand-m[eè]re|tricot)/i, { mamie: 4 }],
  [/\b(papy|grand-p[eè]re|de mon temps)/i, { papy: 4 }],
  [/\b(shérif|cowboy|saloon|far ?west|partenaire)/i, { cowboy: 4 }],
  [/\b(robot|algorithme|bug|ia\b|intelligence artificielle|analyse)/i, { robot: 3 }],
  [/\b(perroquet|coco|répète)/i, { perroquet: 4 }],
  [/\b(abonnez|la team|story|followers?|like)/i, { influenceur: 2 }],
  [/\b(théorie|calculs?|science|scientifique|quantique)/i, { genie: 3 }],
  [/\b(mème|meme|wifi|wi-fi|hack)/i, { meme: 2 }],
  [/\b(ô |tragédie|destin|désespoir)/i, { theatrale: 3 }],
  [/\b(ce jour-là|soudain|personne n'était prêt|catastrophe)/i, { dramatique: 3 }],
];

/* Voix qui conviennent à chaque rôle (bonus de base) */
const ROLE_BASE = {
  chat: { chat_drole: 2, sarcastique: 1.5, folle: 1, theatrale: 1, genie: 1, meme: 1, cowboy: 0.5, papy: 0.5, influenceur: 1, perroquet: 0.3, robot: 0.5, dramatique: 0.5, mamie: 0.2, presentateur: 0.2, narrateur_tiktok: 0 },
  narrateur: { narrateur_tiktok: 3, presentateur: 1.5, dramatique: 1.5, sarcastique: 0.8, meme: 0.5, theatrale: 0.5, robot: 0.3 },
  humain: { narrateur_tiktok: 1, influenceur: 1, mamie: 1, papy: 1, sarcastique: 1, presentateur: 0.6, folle: 0.6 },
};

function add(score, table, w = 1) {
  for (const [k, v] of Object.entries(table || {})) score[k] = (score[k] || 0) + v * w;
}

/**
 * @returns {{ chat:string, narrateur:string, humain:string, why:{chat:string,narrateur:string,humain:string} }}
 */
export function autoCast(project) {
  const beats = project.beats || [];
  const persona = PERSONAS[project.personaId] ? project.personaId : 'paresseux';
  const theme = THEME_FIT[project.conceptId] || null;
  const text = beats.map((b) => plain(b.t)).join(' ');
  const excl = (text.match(/!/g) || []).length / Math.max(1, beats.length);
  const emos = {};
  beats.filter((b) => b.s === 'chat').forEach((b) => { emos[b.e] = (emos[b.e] || 0) + 1; });
  const result = {}; const why = {};
  const taken = new Set();

  for (const role of ['chat', 'narrateur', 'humain']) {
    const score = {};
    const reasons = {};
    add(score, ROLE_BASE[role]);
    if (role === 'chat') {
      add(score, PERSONA_FIT[persona], 1.3);
      for (const k of Object.keys(PERSONA_FIT[persona] || {})) reasons[k] = `colle au personnage « ${PERSONAS[persona].nom} »`;
      for (const [e, n] of Object.entries(emos)) add(score, EMO_FIT[e], Math.min(2, n) * 0.7);
    }
    if (theme && theme[role === 'humain' ? 'narrateur' : role]) {
      add(score, theme[role === 'humain' ? 'narrateur' : role], role === 'humain' ? 0.3 : 1);
      for (const k of Object.keys(theme[role] || {})) reasons[k] = reasons[k] || 'idéale pour ce thème';
    }
    const roleText = beats.filter((b) => (b.s || 'narrateur') === role).map((b) => plain(b.t)).join(' ');
    for (const [re, tbl] of KEYWORDS) if (re.test(roleText)) { add(score, tbl); for (const k of Object.keys(tbl)) reasons[k] = 'le texte l’appelle'; }
    // Script très énergique → voix rapides et punchy
    if (excl > 0.6) add(score, { influenceur: 1, folle: 1, presentateur: 1, narrateur_tiktok: 0.5 });
    // Contraste : deux rôles avec la même voix = moins drôle, et on alterne homme/femme
    for (const v of taken) score[v] = (score[v] || 0) - 6;
    if (role !== 'chat' && result.chat) {
      const gChat = VOICES[result.chat].g;
      for (const [k, v] of Object.entries(VOICES)) if (v.g !== gChat) score[k] = (score[k] || 0) + 0.6;
    }
    const best = Object.entries(score).filter(([k]) => VOICES[k]).sort((a, b) => b[1] - a[1])[0][0];
    result[role] = best; taken.add(best);
    why[role] = reasons[best] || (role === 'narrateur' ? 'rythme TikTok rapide et lisible' : 'contraste avec les autres voix');
  }
  return { ...result, why };
}

/** Voix effectives (auto ou choisies) pour chaque rôle. */
export function resolveCast(project, settings) {
  const auto = autoCast(project);
  const v = settings.voices || {};
  const pick = (role) => (settings.autoVoice || !v[role] || v[role] === 'auto' || !VOICES[v[role]] ? auto[role] : v[role]);
  const cast = { chat: pick('chat'), narrateur: pick('narrateur') };
  // L'humain prend la voix auto, sauf si elle double une voix choisie à la main
  cast.humain = [cast.chat, cast.narrateur].includes(auto.humain)
    ? Object.keys(VOICES).find((k) => k !== cast.chat && k !== cast.narrateur && VOICES[k].g !== VOICES[cast.chat].g) || auto.humain
    : auto.humain;
  return { cast, auto };
}
