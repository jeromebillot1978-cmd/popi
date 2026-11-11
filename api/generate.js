// POST /api/generate — scénario humoristique écrit par une IA (Anthropic Claude ou OpenAI).
// Le navigateur garde toujours le moteur local en secours.
import { rateLimit, readBody, send } from './_lib.js';

const SCENES = 'salon, cuisine, bureau, palais, restaurant, plage, espace, coffre, studio, nuit, chambre, labo, internet, tribunal, salle_sport';
const EMOTIONS = 'neutre, choque, malicieux, colere, dodo, amour, pleure, rire, fier, gourmand, suspicieux, panique';
const SFX = 'boom, whoosh, boing, ding, scratch, klaxon, triste, roulement, cash, miaou, feulement, criquets, pop, glitch, fanfare, suspense, aucun';
const MEMES = 'cercle_rouge, lunettes, stonks, plot_twist, degats, bruh, yeux, feu, pluie_billets, coeurs, censure, criquets_txt, mission_echouee, carton_temps, rayons, confettis, aucun';
const CAMS = 'punch, zoom_lent, recul, secousse, panoramique, dutch, rebond';

const SYSTEM = `Tu es un auteur comique spécialiste des vidéos virales TikTok, YouTube Shorts et Instagram Reels mettant en scène un chat.
Ton humour : absurde, rapide, situations du quotidien vues par un chat, chutes inattendues. Toujours bienveillant : pas de vulgarité, pas de violence réelle, pas de politique partisane, pas de marques, pas de personnes réelles.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format :
{
  "title": "titre viral ≤ 70 caractères avec 1 ou 2 emojis",
  "overlay": "texte court affiché à l'écran pendant le hook, MAJUSCULES, ≤ 40 caractères",
  "description": "description TikTok (1 à 2 phrases) qui se termine par une question pour faire commenter",
  "hashtags": ["#chat", "#chatdrole", "... 5 à 7 au total"],
  "beats": [
    { "role": "hook|setup|escalade|twist|cta", "s": "chat|narrateur|humain", "t": "réplique", "e": "émotion", "sc": "décor", "fx": "son", "m": "mème", "cam": "caméra" }
  ]
}
Règles :
- 1er beat = "hook" : ≤ 9 mots, se lit en moins de 2 secondes, crée une curiosité immédiate (POV, chiffre choc, situation absurde).
- Puis "setup" (1-2), "escalade" (3-5, dialogues courts et répliques cultes du chat), UN "twist" (chute inattendue et absurde), et le dernier beat = "cta" humoristique dit par le chat (ex. menace mignonne pour s'abonner, demander d'écrire un mot en commentaire).
- Chaque réplique ≤ 14 mots, en français naturel, écrite pour être dite à voix haute (nombres en toutes lettres).
- Entoure 1 ou 2 mots comiques par réplique d'astérisques, ex. "Je mets *tout le budget* en croquettes."
- Utilise le nom du chat. Varie les décors et les émotions (réactions exagérées).
- Valeurs autorisées : décors [${SCENES}] ; émotions [${EMOTIONS}] ; sons [${SFX}] ; mèmes [${MEMES}] (3 à 5 mèmes au total) ; caméras [${CAMS}].`;

function userPrompt(b) {
  const len = { court: '7 beats (≈ 15 s)', moyen: '9 beats (≈ 25 s)', long: '11 beats (≈ 40 s)' }[b.longueur] || '9 beats';
  return `Idée : « ${b.idee} »
Nom du chat : ${b.nom}
Personnalité du chat : ${b.personnalite}
Longueur : ${len}
Mode viral : ${b.viral ? 'oui (rythme très rapide, effet sonore sur chaque beat)' : 'non'}
Pour t'inspirer du ton (ne recopie pas) : ${JSON.stringify((b.exemple || []).slice(0, 5))}
Écris un scénario original, plus drôle et plus absurde que l'exemple.`;
}

function extractJson(text) {
  const a = text.indexOf('{'), z = text.lastIndexOf('}');
  if (a < 0 || z < a) throw new Error('Réponse IA non JSON');
  return JSON.parse(text.slice(a, z + 1));
}

async function withAnthropic(key, body) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt(body) }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status} : ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  return extractJson((j.content || []).map(c => c.text || '').join(''));
}

async function withOpenAI(key, body) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt(body) }],
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status} : ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  return extractJson(j.choices?.[0]?.message?.content || '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const ak = process.env.ANTHROPIC_API_KEY, ok = process.env.OPENAI_API_KEY;
  if (!ak && !ok) return send(res, 501, { error: 'Aucune clé API configurée' });
  if (!rateLimit(req, 12)) return send(res, 429, { error: 'Trop de requêtes, patiente une minute' });

  const raw = readBody(req);
  const body = {
    idee: String(raw.idee || 'Mon chat fait une bêtise').slice(0, 120),
    nom: String(raw.nom || 'Moustache').slice(0, 24),
    personnalite: String(raw.personnalite || 'Paresseux').slice(0, 30),
    longueur: ['court', 'moyen', 'long'].includes(raw.longueur) ? raw.longueur : 'moyen',
    viral: !!raw.viral,
    exemple: Array.isArray(raw.exemple) ? raw.exemple.slice(0, 6).map(b => ({ role: String(b.role || '').slice(0, 10), s: String(b.s || '').slice(0, 10), t: String(b.t || '').slice(0, 160) })) : [],
  };
  try {
    const out = ak ? await withAnthropic(ak, body) : await withOpenAI(ok, body);
    if (!Array.isArray(out.beats) || out.beats.length < 3) throw new Error('Scénario incomplet');
    send(res, 200, out);
  } catch (e) {
    send(res, 502, { error: e.message });
  }
}
