// GET /api/status — indique au navigateur quelles options IA sont disponibles (sans jamais exposer les clés).
import { send } from './_lib.js';

export default function handler(req, res) {
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const openai = !!process.env.OPENAI_API_KEY;
  send(res, 200, {
    generate: anthropic || openai,
    tts: openai,
    provider: anthropic ? 'anthropic' : openai ? 'openai' : null,
  });
}
