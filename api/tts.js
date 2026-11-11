// POST /api/tts — doublage IA premium (OpenAI Text-to-Speech). Renvoie un MP3.
import { rateLimit, readBody, send } from './_lib.js';

const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return send(res, 501, { error: 'OPENAI_API_KEY non configurée' });
  if (!rateLimit(req, 80)) return send(res, 429, { error: 'Trop de requêtes, patiente une minute' });

  const body = readBody(req);
  const text = String(body.text || '').slice(0, 400).trim();
  if (!text) return send(res, 400, { error: 'Texte vide' });
  const voice = VOICES.includes(body.voice) ? body.voice : 'coral';
  const instructions = String(body.instructions || 'Voix expressive et drôle, en français.').slice(0, 600);
  const speed = Math.min(1.6, Math.max(0.7, Number(body.speed) || 1));

  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice, input: text, instructions, speed, response_format: 'mp3',
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      return send(res, 502, { error: `OpenAI : ${err.slice(0, 200)}` });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(200);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.end(buf);
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}
