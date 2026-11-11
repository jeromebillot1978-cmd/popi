/**
 * Gamification : score de viralité /100, courbe de rétention estimée,
 * suggestions d'amélioration applicables en un clic.
 */
import { PERSONAS, CTAS } from './data.js';
import { decorate, splitBeat, wordCount, newId, makeMeta, fill, getConcept, HOOK_TRIGGERS } from './story.js';


export const LEVELS = [
  { min: 85, label: "👑 Roi d'Internet", cls: 'lvl-4' },
  { min: 70, label: '🦁 Lion viral', cls: 'lvl-3' },
  { min: 50, label: '😼 Matou prometteur', cls: 'lvl-2' },
  { min: 0, label: '🐣 Chaton timide', cls: 'lvl-1' },
];

export function analyze(project, tl) {
  const beats = tl.beats;
  const crit = [];
  const add = (id, label, pts, max, tip, fix) => crit.push({ id, label, pts: Math.round(Math.max(0, Math.min(max, pts))), max, tip, fix, ok: pts >= max * 0.99 });
  const hook = beats.find(b => b.role === 'hook') || beats[0];
  const hookWords = wordCount(hook.t);

  // 1. Hook (20)
  add('hook_duree', 'Hook en moins de 2 secondes', hook.dur <= 2.05 ? 8 : hook.dur <= 2.6 ? 5 : 2, 8,
    `Ton hook dure ${hook.dur.toFixed(1)} s. Les spectateurs décident en 2 s.`, 'hook_court');
  add('hook_mots', 'Hook court et percutant (≤ 9 mots)', hookWords <= 9 ? 4 : hookWords <= 12 ? 2 : 0, 4, `${hookWords} mots dans le hook.`, 'hook_court');
  add('hook_intrigue', 'Hook qui crée de la curiosité', HOOK_TRIGGERS.test(hook.t) ? 4 : 1, 4, 'Ajoute un POV, une question ou un chiffre choc.', 'hook_court');
  add('hook_titre', 'Titre affiché à l’écran dès la 1re seconde', project.overlay ? 4 : 0, 4, 'Le texte en haut de l’écran retient ceux qui regardent sans le son.', 'hook_titre');

  // 2. Rythme (15)
  const avg = tl.duration / beats.length;
  const cutsPer10 = beats.length / tl.duration * 10;
  add('rythme', 'Séquences courtes (≤ 2,6 s en moyenne)', avg <= 2.6 ? 8 : avg <= 3.2 ? 5 : 2, 8, `Moyenne actuelle : ${avg.toFixed(1)} s par séquence.`, 'rythme');
  add('coupes', 'Changements de plan fréquents (≥ 3,5 / 10 s)', cutsPer10 >= 3.5 ? 7 : cutsPer10 >= 2.5 ? 4 : 1, 7, `${cutsPer10.toFixed(1)} changements toutes les 10 s.`, 'rythme');

  // 3. Durée (10)
  const d = tl.duration;
  const durPts = d >= 12 && d <= 35 ? 10 : d > 35 && d <= 50 ? 6 : d < 12 && d >= 8 ? 6 : 2;
  add('duree', 'Durée idéale (12 – 35 s)', durPts, 10, `Durée actuelle : ${d.toFixed(0)} s.`, d > 35 ? 'duree_longue' : 'chute');

  // 4. Humour (15)
  const last2 = beats.slice(-3);
  const hasTwist = beats.some(b => b.role === 'twist') && last2.some(b => b.role === 'twist');
  add('chute', 'Chute inattendue à la fin', hasTwist ? 7 : 0, 7, 'Une fin absurde donne envie de revoir et de partager.', 'chute');
  const hlCount = beats.reduce((a, b) => a + (b.t.match(/\*[^*]+\*/g) || []).length, 0);
  add('mots_comiques', 'Passages comiques mis en évidence (≥ 4)', hlCount >= 4 ? 4 : hlCount * 1, 4, `${hlCount} passage(s) en couleur. Entoure les mots drôles d'*astérisques*.`, 'mots_comiques');
  const c = getConcept(project.conceptId);
  const absurd = ((c ? c.absurde : 3) + (PERSONAS[project.personaId]?.absurde || 3)) / 10;
  add('absurde', 'Niveau d’absurde', 4 * absurd, 4, 'Les personnages extrêmes (criminel, milliardaire…) et les idées folles performent mieux.', null);

  // 5. Effets (15)
  const fxCov = beats.filter(b => b.fx && b.fx !== 'aucun').length / beats.length;
  add('sons', 'Effets sonores sur la majorité des plans', fxCov >= 0.7 ? 7 : fxCov >= 0.45 ? 4 : 1, 7, `${Math.round(fxCov * 100)} % des séquences ont un son.`, 'sons');
  const memes = beats.filter(b => b.m && b.m !== 'aucun').length;
  add('memes', 'Mèmes intégrés (≥ 3)', memes >= 3 ? 4 : memes * 1.3, 4, `${memes} mème(s) dans la vidéo.`, 'memes');
  const camKinds = new Set(beats.map(b => b.cam)).size;
  add('cameras', 'Caméra variée (≥ 4 mouvements)', camKinds >= 4 ? 4 : camKinds, 4, `${camKinds} mouvement(s) de caméra différents.`, 'cameras');

  // 6. CTA (10)
  const cta = beats[beats.length - 1];
  const hasCta = cta && cta.role === 'cta';
  add('cta', 'CTA final', hasCta ? 6 : 0, 6, 'Termine par un appel à l’action drôle.', 'cta');
  add('cta_engage', 'CTA qui pousse à commenter / s’abonner', hasCta && /abonne|like|comment|écris|identifie|partage/i.test(cta.t) ? 4 : 0, 4, 'Demande un commentaire précis (ex. « écris MIAOU »).', 'cta');

  // 7. Publication (10)
  const tl_ = (project.title || '').length;
  add('titre', 'Titre viral (≤ 70 caractères + emoji)', tl_ > 0 && tl_ <= 70 && /\p{Extended_Pictographic}/u.test(project.title) ? 4 : tl_ ? 2 : 0, 4, 'Un titre court avec un emoji est plus cliquable.', 'meta');
  const nt = (project.hashtags || []).length;
  add('hashtags', '4 à 7 hashtags dont #chat', nt >= 4 && nt <= 7 && project.hashtags.includes('#chat') ? 3 : nt ? 1 : 0, 3, `${nt} hashtag(s).`, 'meta');
  add('description', 'Description avec question', /\?|👇/.test(project.description || '') ? 3 : 0, 3, 'Une question en description multiplie les commentaires.', 'meta');

  // 8. Boucle (5)
  add('boucle', 'Fin qui boucle (revisionnage)', project.loop ? 5 : 0, 5, 'Une coupe sèche à la fin donne envie de revoir la vidéo.', 'boucle');

  const score = Math.min(100, crit.reduce((a, x) => a + x.pts, 0));
  const level = LEVELS.find(l => score >= l.min);
  const hookPts = crit.filter(x => x.id.startsWith('hook')).reduce((a, x) => a + x.pts, 0);
  const ret = retention(tl, hookPts, hasTwist);
  return { score, level, crit, ...ret };
}

function retention(tl, hookPts, hasTwist) {
  const pts = [];
  let v = 100;
  const step = 0.25;
  const weak = [];
  for (let t = 0; t <= tl.duration + 0.001; t += step) {
    const b = tl.beats.find(x => t >= x.start && t < x.end) || tl.beats[tl.beats.length - 1];
    let decay;
    if (t < 2) decay = (55 - hookPts * 2) / 2;             // le décrochage initial dépend du hook
    else decay = 1.5;
    const lt = t - b.start;
    if (lt > 2.8) decay += 1.6;                              // séquence trop longue
    if (lt < 0.5 && ((b.fx && b.fx !== 'aucun') || (b.m && b.m !== 'aucun'))) decay -= 0.9; // effet qui relance l'attention
    if (b.role === 'twist') decay *= 0.5;                    // curiosité de la chute
    if (t > 35) decay += 0.9;
    v = Math.max(3, v - Math.max(0.1, decay) * step);
    pts.push([t, v]);
  }
  tl.beats.forEach(b => { if (b.dur > 3.1) weak.push({ t: b.start, label: `Séquence ${b.index + 1} trop longue (${b.dur.toFixed(1)} s)` }); });
  const completion = Math.round(v * (hasTwist ? 1 : 0.85));
  return { curve: pts, completion, hold3s: Math.round((pts.find(p => p[0] >= 3) || pts[pts.length - 1])[1]), weak };
}

/* ---------- Corrections automatiques ---------- */
export function applyFix(id, project) {
  const beats = project.beats;
  const concept = getConcept(project.conceptId);
  const persona = PERSONAS[project.personaId] || PERSONAS.paresseux;
  const ctx = { nom: project.nom, sujet: project.sujet };
  switch (id) {
    case 'hook_court': {
      const hook = beats.find(b => b.role === 'hook') || beats[0];
      const options = (concept ? concept.hooks : ['POV : ton chat {sujet} 😳']).map(h => fill(h, ctx))
        .filter(h => HOOK_TRIGGERS.test(h) && wordCount(h) <= 9).sort((a, b) => wordCount(a) - wordCount(b));
      if (options.length && options[0] !== hook.t) hook.t = options[0];
      else {
        let w = hook.t.replace(/^POV\s*:\s*/i, '').split(/\s+/).slice(0, 7).join(' ').replace(/[,;:.]$/, '');
        if ((w.match(/\*/g) || []).length % 2) w += '*';
        hook.t = 'POV : ' + w + ' 😱';
      }
      hook.cam = 'punch'; hook.fx = 'boom';
      return 'Hook raccourci et rendu plus percutant.';
    }
    case 'hook_titre': {
      project.overlay = (concept ? concept.titre + ' ' + concept.emoji : `MON CHAT ${project.sujet} 😳`).toUpperCase();
      return 'Titre ajouté en haut de l’écran.';
    }
    case 'rythme': {
      let n = 0;
      for (let i = beats.length - 1; i >= 0; i--) {
        if (wordCount(beats[i].t) > 9 && beats[i].role !== 'cta') { beats.splice(i, 1, ...splitBeat(beats[i])); n++; }
      }
      project.viral = true;
      decorate(beats, { viral: true });
      return n ? `${n} séquence(s) découpée(s), rythme accéléré.` : 'Mode viral activé : rythme accéléré.';
    }
    case 'duree_longue': {
      const esc = beats.map((b, i) => [b, i]).filter(([b]) => b.role === 'escalade');
      const toRemove = esc.slice(1, Math.max(1, esc.length - 2)).slice(0, 2).map(([, i]) => i).sort((a, b) => b - a);
      toRemove.forEach(i => beats.splice(i, 1));
      return `${toRemove.length} séquence(s) retirée(s) pour raccourcir.`;
    }
    case 'chute': {
      const tw = (concept ? concept.twist : [{ s: 'narrateur', t: "Il a réussi. *Du premier coup.* Personne ne sait comment.", e: 'fier', fx: 'fanfare', m: 'stonks' }]);
      const line = tw[Math.floor(Math.random() * tw.length)];
      const pos = beats.length && beats[beats.length - 1].role === 'cta' ? beats.length - 1 : beats.length;
      beats.splice(pos, 0, { id: newId(), role: 'twist', s: line.s, t: fill(line.t, ctx), e: line.e, sc: beats[pos - 1]?.sc || 'salon', fx: line.fx || 'boom', m: line.m || 'plot_twist', cam: 'punch' });
      return 'Chute inattendue ajoutée avant le CTA.';
    }
    case 'mots_comiques': {
      let n = 0;
      beats.forEach(b => {
        if (/\*/.test(b.t)) return;
        const w = b.t.split(/\s+/);
        if (w.length < 3) return;
        // met en évidence les 2 derniers mots (souvent la chute de la phrase)
        const tail = w.splice(-2).join(' ');
        const m = tail.match(/^(.*?)([.!?,…]*)$/);
        b.t = w.join(' ') + ' *' + m[1] + '*' + m[2]; n++;
      });
      return n ? `${n} passage(s) comique(s) mis en couleur.` : 'Les passages comiques sont déjà marqués.';
    }
    case 'sons': decorate(beats.map(b => { b.fx = ''; return b; }), { viral: true }); return 'Effets sonores ajoutés sur chaque plan.';
    case 'memes': {
      const pool = ['cercle_rouge', 'bruh', 'lunettes', 'yeux', 'degats', 'rayons', 'stonks'];
      let n = 0;
      beats.forEach((b, i) => { if ((!b.m || b.m === 'aucun') && b.role !== 'cta' && b.role !== 'hook' && n < 3 && i % 2 === 1) { b.m = pool[(i + n) % pool.length]; n++; } });
      return `${n} mème(s) ajouté(s).`;
    }
    case 'cameras': beats.forEach(b => { b.cam = ''; }); decorate(beats, { viral: true }); return 'Mouvements de caméra variés.';
    case 'cta': {
      if (beats[beats.length - 1]?.role === 'cta' && /abonne|like|comment|écris|identifie|partage/i.test(beats[beats.length - 1].t)) return 'CTA déjà présent.';
      const t = fill(CTAS[Math.floor(Math.random() * CTAS.length)], ctx);
      if (beats[beats.length - 1]?.role === 'cta') beats[beats.length - 1].t = t;
      else beats.push({ id: newId(), role: 'cta', s: 'chat', t, e: 'malicieux', sc: beats[beats.length - 1]?.sc || 'salon', fx: 'pop', m: 'aucun', cam: 'rebond' });
      return 'CTA humoristique ajouté.';
    }
    case 'meta': {
      const hook = beats.find(b => b.role === 'hook') || beats[0];
      Object.assign(project, makeMeta({ concept, persona, ctx, hookText: hook.t }), { overlay: project.overlay || undefined });
      if (!project.overlay) applyFix('hook_titre', project);
      return 'Titre, description et hashtags optimisés.';
    }
    case 'boucle': project.loop = true; return 'Fin en boucle activée.';
    default: return '';
  }
}

