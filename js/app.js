/**
 * Chatastrophe Studio — interface et orchestration.
 */
import {
  CONCEPTS, CATEGORIES, PERSONAS, FURS, ACCESSORIES, EMOTIONS, SFX, MEMES, CAMERAS, SCENES,
  VOICES, VOICE_ROLES, VOICE_ENGINES, VOICE_MODELS, MUSICS,
} from './data.js';
import { generateLocal, normalizeProject, newId, plain, getConcept } from './story.js';
import { prepareVoices, buildTimeline, sampleVoice, onModelProgress, voiceCacheInfo, clearModelCache, clearVoiceCache } from './voice.js';
import { resolveCast } from './casting.js';
import { audio } from './audio.js';
import { Renderer } from './render.js';
import { clearSceneCache } from './scenes.js';
import { Player, bestMime } from './player.js';
import { analyze, applyFix } from './viral.js';

/* ====================== État ====================== */
const LS = 'chatastrophe:v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } })();

const state = {
  sel: { mode: 'lib', conceptId: 'president', freeTopic: '', cat: 'tous', ...(saved.sel || {}) },
  look: { nom: 'Moustache', fur: 'roux', personaId: 'milliardaire', personaTouched: false, acc: { tete: 'auto', visage: 'auto', cou: 'auto' }, longueur: 'moyen', ...(saved.look || {}) },
  settings: { engine: 'piper', autoVoice: true, voices: { chat: 'auto', narrateur: 'auto' }, voiceRole: 'chat', accent: true, music: 'comedie', viral: true, loop: true, subMode: 'groupe', quality: '720', handle: '', scriptEngine: 'local', ...(saved.settings || {}) },
  project: saved.project || null,
  tl: null, analysis: null, cast: null, api: { generate: false, tts: false },
  best: Number(localStorage.getItem(LS + ':best') || 0),
  token: 0,
};

// Migration : l'ancien moteur (miaou / eSpeak / voix du navigateur) n'existe plus
if (!VOICE_ENGINES[state.settings.engine]) state.settings.engine = 'piper';
if (!state.settings.voices || typeof state.settings.voices !== 'object') state.settings.voices = { chat: 'auto', narrateur: 'auto' };
delete state.settings.catVoice; delete state.settings.voiceTouched;

/* ====================== DOM ====================== */
const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => (k === 'class' ? (e.className = v) : e.setAttribute(k, v))); if (html) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const options = (dict, sel, extra = []) => [...extra, ...Object.entries(dict)].map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(typeof v === 'string' ? v : v.label)}</option>`).join('');
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const canvas = $('stage');
const renderer = new Renderer(canvas);
const player = new Player(renderer, {
  onTime: (t, tl) => onTime(t, tl),
  onEnd: (recorded, aborted) => { setPlayIcon(false); if (!recorded && !aborted) { $('bigPlay').hidden = false; } },
  getOpts: () => ({ subMode: state.settings.subMode, handle: state.settings.handle }),
});

function lookProject() {
  return { ...(state.project || {}), fur: state.look.fur, acc: resolvedAcc(), nom: state.look.nom, viral: state.settings.viral, loop: state.settings.loop, overlay: state.project ? state.project.overlay : '' };
}

/* ====================== Construction de l'interface ====================== */
function buildIdeas() {
  $('catFilters').innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `<button class="chip${k === state.sel.cat ? ' active' : ''}" data-cat="${k}">${v}</button>`).join('');
  const list = CONCEPTS.filter(c => state.sel.cat === 'tous' || c.cat === state.sel.cat);
  $('conceptGrid').innerHTML = list.map(c => `
    <button class="concept${c.id === state.sel.conceptId && state.sel.mode === 'lib' ? ' active' : ''}" data-concept="${c.id}">
      <span class="e">${c.emoji}</span><b>${esc(c.titre)}</b><small>${CATEGORIES[c.cat]} · ${'🔥'.repeat(c.absurde)}</small>
    </button>`).join('');
  const ex = ['devient astronaute', 'apprend à conduire', 'fait ses impôts', 'devient DJ', 'se fait cloner', 'passe à la télé', 'devient pompier', 'invente une machine à remonter le temps'];
  $('freeExamples').innerHTML = ex.map(e => `<button class="chip" data-ex="${esc(e)}">${esc(e)}</button>`).join('');
  $('freeTopic').value = state.sel.freeTopic;
  switchIdeaTab(state.sel.mode);
  updateSummaries();
}
function switchIdeaTab(mode) {
  state.sel.mode = mode;
  document.querySelectorAll('[data-ideatab]').forEach(b => b.classList.toggle('active', b.dataset.ideatab === mode));
  $('ideaLib').hidden = mode !== 'lib'; $('ideaFree').hidden = mode !== 'free';
  document.querySelectorAll('.concept').forEach(b => b.classList.toggle('active', mode === 'lib' && b.dataset.concept === state.sel.conceptId));
  updateSummaries();
}

function buildLook() {
  $('catName').value = state.look.nom;
  $('length').value = state.look.longueur;
  $('furs').innerHTML = Object.entries(FURS).map(([k, f]) => {
    const bg = f.patches ? `conic-gradient(${f.patches[0]} 0 33%, ${f.base} 0 66%, ${f.patches[1]} 0)` : f.mask ? `radial-gradient(circle at 50% 60%, ${f.dark} 0 40%, ${f.base} 42%)` : f.stripes ? `repeating-linear-gradient(45deg, ${f.base} 0 7px, ${f.dark} 7px 11px)` : f.base;
    return `<button class="swatch${k === state.look.fur ? ' active' : ''}" data-fur="${k}" title="${f.label}" aria-label="${f.label}" style="background:${bg}"></button>`;
  }).join('');
  $('personas').innerHTML = Object.entries(PERSONAS).map(([k, p]) => `<button class="chip${k === state.look.personaId ? ' active' : ''}" data-persona="${k}">${p.emoji} ${p.nom}</button>`).join('');
  [['accTete', 'tete'], ['accVisage', 'visage'], ['accCou', 'cou']].forEach(([id, slot]) => {
    $(id).innerHTML = options(ACCESSORIES[slot], state.look.acc[slot], [['auto', '✨ Auto']]);
  });
}

function buildVoice() {
  const st = state.settings;
  $('voiceEngine').innerHTML = Object.entries(VOICE_ENGINES).map(([k, v]) => `<option value="${k}"${k === st.engine ? ' selected' : ''}${v.needsApi && !state.api[v.needsApi] ? ' disabled' : ''}>${esc(v.label)}</option>`).join('');
  $('autoVoice').checked = st.autoVoice;
  $('accentMode').checked = st.accent !== false;
  $('music').innerHTML = options(MUSICS, st.music);
  $('roleTabs').innerHTML = ['chat', 'narrateur'].map(r => `<button type="button" role="tab" class="chip${r === st.voiceRole ? ' active' : ''}" data-role="${r}" aria-selected="${r === st.voiceRole}">${VOICE_ROLES[r].emoji} Voix ${r === 'chat' ? 'du chat' : 'du narrateur'}</button>`).join('');
  $('voiceGrid').innerHTML = Object.entries(VOICES).map(([id, v]) => `<div class="vcard" role="option" tabindex="0" data-voice="${id}" title="${esc(v.desc)}">
      <span class="ve">${v.emoji}</span><span class="vl"><b>${esc(v.label)}</b><small>${esc(v.desc)}</small></span>
      <button type="button" class="vplay" data-play="${id}" aria-label="Écouter ${esc(v.label)}">▶</button>
    </div>`).join('');
  voiceHint(); renderCast();
}
function effEngine() { return state.settings.engine === 'ia' && !state.api.tts ? 'piper' : state.settings.engine; }
/** Voix effectives (auto ou manuelles) + mise en avant dans la grille. */
function renderCast() {
  const st = state.settings;
  const proj = state.project && state.project.beats ? state.project : null;
  const r = proj ? resolveCast(proj, st) : null;
  const cast = r ? r.cast : null;
  const role = st.voiceRole;
  const manual = st.voices[role];
  const current = cast ? cast[role] : (manual && manual !== 'auto' ? manual : null);
  document.querySelectorAll('.vcard').forEach(c => {
    const on = c.dataset.voice === current;
    c.classList.toggle('active', on); c.setAttribute('aria-selected', on);
    c.classList.toggle('auto', on && (st.autoVoice || !manual || manual === 'auto'));
  });
  document.querySelectorAll('#roleTabs [data-role]').forEach(b => { const on = b.dataset.role === role; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  if (!cast) { $('castBox').innerHTML = '<span class="muted">🎬 Génère une vidéo : le casting des voix s’affichera ici.</span>'; return; }
  const roles = ['chat', 'narrateur', 'humain'].filter(k => proj.beats.some(b => (b.s === 'chat' ? 'chat' : b.s === 'humain' ? 'humain' : 'narrateur') === k));
  $('castBox').innerHTML = roles.map(k => {
    const v = VOICES[cast[k]]; const isAuto = st.autoVoice || k === 'humain' || !st.voices[k] || st.voices[k] === 'auto';
    return `<div class="castline"><span>${VOICE_ROLES[k].emoji} ${VOICE_ROLES[k].label}</span><b>${v.emoji} ${esc(v.label)}</b>${isAuto ? `<em>🎯 ${esc(r.auto.why[k] || 'choix auto')}</em>` : '<em>✋ choisie par toi</em>'}</div>`;
  }).join('');
}
function voiceHint() {
  const e = state.settings.engine;
  const hints = {
    piper: '🧠 Voix neuronales françaises (Piper), fluides et naturelles, calculées dans ton navigateur : gratuites, sans compte, incluses dans la vidéo. Au premier usage d’une voix, son modèle est téléchargé une seule fois (63 à 77 Mo), ensuite tout est instantané.',
    ia: '✨ Voix OpenAI ultra-expressives : chaque voix comique reçoit une consigne de jeu (accent, émotion, rythme). Clé OPENAI_API_KEY requise sur Vercel. En cas de souci, bascule automatique sur les voix neuronales gratuites.',
    aucune: '🔇 Pas de voix : seulement musique, bruitages et sous-titres (style « vidéo muette »).',
  };
  $('voiceHint').textContent = hints[e] || '';
  refreshVoiceCache();
}
async function refreshVoiceCache() {
  if (state.settings.engine !== 'piper') { $('voiceCache').innerHTML = ''; return; }
  try {
    const info = await voiceCacheInfo();
    if (!info.bytes) { $('voiceCache').textContent = '💾 Aucune voix téléchargée pour l’instant.'; return; }
    $('voiceCache').innerHTML = `💾 Voix gardées dans ce navigateur : ${(info.bytes / 1048576).toFixed(0)} Mo (${info.models.map(m => VOICE_MODELS[m] ? VOICE_MODELS[m].label : m).join(', ')}) · <button type="button" class="linkbtn" id="btnClearVoices">Libérer l’espace</button>`;
    $('btnClearVoices').onclick = async () => { await clearModelCache(); toast('🧹 Voix supprimées du navigateur (re-téléchargées si besoin).', 'ok'); refreshVoiceCache(); };
  } catch (e) { $('voiceCache').textContent = ''; }
}

async function previewVoice(id, btn) {
  if (btn.classList.contains('loading')) return;
  audio.ensure();
  if (player.playing) { player.stop(); setPlayIcon(false); }
  btn.classList.add('loading'); btn.textContent = '…';
  try {
    const engine = effEngine() === 'aucune' ? 'piper' : effEngine();
    const r = await sampleVoice(id, engine);
    if (r && r.buffer) { const ses = audio.openSession(); audio.playBuffer(r.buffer, audio.now + 0.05, ses.voice); }
  } catch (e) { toast(`Voix indisponible : ${e.message}`, 'err'); }
  busy(false);
  btn.classList.remove('loading'); btn.textContent = '▶';
}

function buildSettings() {
  const s = state.settings;
  $('viralMode').checked = s.viral; $('loopMode').checked = s.loop; $('subMode').value = s.subMode;
  $('quality').value = s.quality; $('handle').value = s.handle;
  $('scriptEngine').value = s.scriptEngine === 'ia' && state.api.generate ? 'ia' : 'local';
  $('scriptEngine').querySelector('[value=ia]').disabled = !state.api.generate;
  $('engineBadge').textContent = $('scriptEngine').value === 'ia' ? '✨ IA en ligne' : '🧠 Local';
  $('engineBadge').classList.toggle('ia', $('scriptEngine').value === 'ia');
  $('bestBadge').textContent = state.best ? `🏆 Record ${state.best}/100` : '🏆 Pas encore de record';
}

function updateSummaries() {
  const c = getConcept(state.sel.conceptId);
  $('ideaSummary').textContent = state.sel.mode === 'free' ? `Mon chat ${state.sel.freeTopic || '…'}` : (c ? c.titre : '—');
  const p = PERSONAS[state.look.personaId];
  $('catSummary').textContent = `${state.look.nom} · ${p.emoji} ${p.nom}`;
  const vs = state.settings.voices[state.settings.voiceRole];
  $('voiceSummary').textContent = state.settings.engine === 'aucune' ? '🔇 Sans voix' : state.settings.autoVoice || !VOICES[vs] ? '🎯 Casting auto' : `${VOICES[vs].emoji} ${VOICES[vs].label}`;
  $('viralSummary').textContent = state.settings.viral ? '🔥 Mode viral ON' : 'Mode viral OFF';
}

function resolvedAcc() {
  const c = state.sel.mode === 'lib' ? getConcept(state.project ? state.project.conceptId : state.sel.conceptId) : null;
  const p = PERSONAS[state.look.personaId] || {};
  const auto = { ...(p.acc || {}), ...(c ? c.acc : {}) };
  const out = {};
  ['tete', 'visage', 'cou'].forEach(k => { const v = state.look.acc[k]; out[k] = v === 'auto' ? (auto[k] || 'aucun') : v; });
  return out;
}

/* ====================== Événements ====================== */
function bind() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.ideatab) switchIdeaTab(t.dataset.ideatab);
    if (t.dataset.cat) { state.sel.cat = t.dataset.cat; buildIdeas(); }
    if (t.dataset.concept) {
      state.sel.conceptId = t.dataset.concept; state.sel.mode = 'lib';
      const c = getConcept(t.dataset.concept);
      if (c && !state.look.personaTouched) selectPersona(c.persona, false);
      switchIdeaTab('lib'); pulseGenerate(); redrawLook();
    }
    if (t.dataset.ex) { $('freeTopic').value = t.dataset.ex; state.sel.freeTopic = t.dataset.ex; updateSummaries(); pulseGenerate(); }
    if (t.dataset.fur) { state.look.fur = t.dataset.fur; document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === t)); redrawLook(); save(); }
    if (t.dataset.persona) selectPersona(t.dataset.persona, true);
    if (t.dataset.tab) switchTab(t.dataset.tab);
    if (t.dataset.copy) copy($(t.dataset.copy).value);
  });

  $('btnRandomIdea').onclick = () => {
    const list = CONCEPTS.filter(c => state.sel.cat === 'tous' || c.cat === state.sel.cat);
    const c = list[Math.floor(Math.random() * list.length)];
    state.sel.conceptId = c.id;
    if (!state.look.personaTouched) selectPersona(c.persona, false);
    buildIdeas(); generate();
  };
  $('freeTopic').addEventListener('input', e => { state.sel.freeTopic = e.target.value; updateSummaries(); });
  $('freeTopic').addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
  $('catName').addEventListener('input', e => { state.look.nom = e.target.value.trim() || 'Moustache'; updateSummaries(); });
  $('catName').addEventListener('change', () => { if (state.project) { renameCat(); } });
  $('length').onchange = e => { state.look.longueur = e.target.value; save(); };
  [['accTete', 'tete'], ['accVisage', 'visage'], ['accCou', 'cou']].forEach(([id, slot]) => { $(id).onchange = e => { state.look.acc[slot] = e.target.value; redrawLook(); save(); }; });

  $('voiceEngine').onchange = e => { state.settings.engine = e.target.value; voiceHint(); updateSummaries(); if (state.project) rebuild(); save(); };
  $('autoVoice').onchange = e => { state.settings.autoVoice = e.target.checked; renderCast(); updateSummaries(); if (state.project) rebuild(); save(); };
  $('accentMode').onchange = e => { state.settings.accent = e.target.checked; if (state.project) rebuild(); save(); };
  $('roleTabs').onclick = e => { const b = e.target.closest('[data-role]'); if (!b) return; state.settings.voiceRole = b.dataset.role; renderCast(); updateSummaries(); save(); };
  const pickVoice = (card) => {
    const st = state.settings;
    st.voices[st.voiceRole] = card.dataset.voice;
    if (st.autoVoice) { st.autoVoice = false; $('autoVoice').checked = false; toast('✋ Casting manuel : ta voix est utilisée (réactive le mode auto quand tu veux).'); }
    renderCast(); updateSummaries(); save();
    if (state.project) rebuild();
  };
  $('voiceGrid').addEventListener('click', e => {
    const play = e.target.closest('[data-play]');
    if (play) { e.stopPropagation(); previewVoice(play.dataset.play, play); return; }
    const card = e.target.closest('.vcard'); if (card) pickVoice(card);
  });
  $('voiceGrid').addEventListener('keydown', e => { const card = e.target.closest('.vcard'); if (card && (e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-play]')) { e.preventDefault(); pickVoice(card); } });
  $('music').onchange = e => { state.settings.music = e.target.value; updateSummaries(); save(); };
  onModelProgress((model, loaded, total) => {
    const m = VOICE_MODELS[model];
    busy(true, `⬇️ Téléchargement de la voix ${m ? m.label : model} — une seule fois — ${Math.round(loaded / total * 100)} %`, loaded / total);
    if (loaded >= total) setTimeout(refreshVoiceCache, 1500);
  });

  $('viralMode').onchange = e => { state.settings.viral = e.target.checked; updateSummaries(); if (state.project) { state.project.viral = e.target.checked; rebuild(); } save(); };
  $('loopMode').onchange = e => { state.settings.loop = e.target.checked; if (state.project) { state.project.loop = e.target.checked; rebuild(); } save(); };
  $('subMode').onchange = e => { state.settings.subMode = e.target.value; player.draw(player.t); save(); };
  $('quality').onchange = e => { state.settings.quality = e.target.value; save(); };
  $('handle').addEventListener('input', e => { state.settings.handle = e.target.value.replace(/[^\w.@-]/g, ''); player.draw(player.t); });
  $('handle').addEventListener('change', save);
  $('scriptEngine').onchange = e => { state.settings.scriptEngine = e.target.value; buildSettings(); save(); };

  $('btnGenerate').onclick = () => generate();
  $('btnReroll').onclick = () => generate(true);
  $('btnPlay').onclick = togglePlay;
  $('bigPlay').onclick = () => { $('bigPlay').hidden = true; play(0); };
  canvas.addEventListener('click', () => { if (state.tl && !state.exporting) togglePlay(); });
  $('scrub').addEventListener('input', e => { if (!state.tl) return; player.seek(e.target.value / 1000 * state.tl.duration); setPlayIcon(false); });
  $('showSafe').onchange = e => { $('safeZones').hidden = !e.target.checked; };
  $('btnExport').onclick = exportVideo;
  $('btnAddBeat').onclick = () => { const last = state.project.beats[state.project.beats.length - 1]; const at = last && last.role === 'cta' ? state.project.beats.length - 1 : state.project.beats.length;
    state.project.beats.splice(at, 0, { id: newId(), role: 'escalade', s: 'chat', t: 'Nouvelle réplique *drôle* ici.', e: 'malicieux', sc: last ? last.sc : 'salon', fx: 'pop', m: 'aucun', cam: 'punch' }); renderBeats(); rebuild(); };
  $('btnFixAll').onclick = fixAll;

  // Publication
  ['pubTitle', 'pubDesc', 'pubTags', 'pubOverlay'].forEach(id => $(id).addEventListener('input', onPubEdit));
  $('btnCopyAll').onclick = () => copy(`${$('pubDesc').value}\n\n${$('pubTags').value}`);
  $('btnDlVideo').onclick = exportVideo;
  $('btnDlSrt').onclick = () => download(new Blob([makeSrt()], { type: 'text/plain' }), `${slug()}.srt`);
  $('btnDlTxt').onclick = () => download(new Blob([makeTxt()], { type: 'text/plain' }), `${slug()}-script.txt`);

  // Export : onglet masqué = enregistrement saccadé → on l'arrête et on le relance au retour
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.recording) { state.restartExport = true; player.stop(); }
    else if (!document.hidden && state.restartExport && !state.exporting) { state.restartExport = false; toast('🔁 Te revoilà : l’export reprend depuis le début.'); exportVideo(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.recording) { state.cancelExport = true; player.stop(); return; }
    if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && state.tl) { e.preventDefault(); togglePlay(); }
  });
}

function selectPersona(id, touched) {
  state.look.personaId = id;
  if (touched) state.look.personaTouched = true;
  document.querySelectorAll('[data-persona]').forEach(b => b.classList.toggle('active', b.dataset.persona === id));
  updateSummaries(); redrawLook(); save();
}
function switchTab(tab) {
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; });
}
function pulseGenerate() { const b = $('btnGenerate'); b.classList.add('pulse'); }
function redrawLook() {
  if (state.project) { Object.assign(state.project, { fur: state.look.fur, acc: resolvedAcc() }); player.setProject(lookProject()); }
  else idle();
}
function renameCat() {
  // Remplace l'ancien nom par le nouveau dans le script existant
  const old = state.project.nom;
  if (!old || old === state.look.nom) return;
  const re = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  state.project.beats.forEach(b => { b.t = b.t.replace(re, state.look.nom); });
  ['title', 'description'].forEach(k => { state.project[k] = (state.project[k] || '').replace(re, state.look.nom); });
  state.project.nom = state.look.nom;
  renderBeats(); renderPub(); rebuild();
}

/* ====================== Aperçu d'attente ====================== */
let idleRaf = 0;
function idle() {
  cancelAnimationFrame(idleRaf);
  const loop = () => { if (state.tl) return; renderer.poster({ fur: state.look.fur, acc: resolvedAcc() }); idleRaf = requestAnimationFrame(loop); };
  loop();
}

/* ====================== Génération ====================== */
async function generate(reroll = false) {
  audio.ensure();
  player.stop();
  $('btnGenerate').classList.remove('pulse');
  const isFree = state.sel.mode === 'free';
  if (isFree && !state.sel.freeTopic.trim()) { toast('✍️ Écris d’abord la suite de « Mon chat… »', 'err'); $('freeTopic').focus(); return; }
  const opts = {
    conceptId: isFree ? 'libre' : state.sel.conceptId,
    sujet: isFree ? state.sel.freeTopic : '',
    personaId: state.look.personaId, nom: state.look.nom,
    viral: state.settings.viral, longueur: state.look.longueur,
    seed: reroll ? Math.floor(Math.random() * 1e9) : Date.now(),
  };
  busy(true, '✍️ Écriture du scénario…', 0.08);
  let proj = generateLocal(opts);
  if (state.settings.scriptEngine === 'ia' && state.api.generate) {
    try {
      busy(true, '✨ L’IA écrit un scénario absurde…', 0.15);
      const c = getConcept(opts.conceptId);
      const r = await fetchJson('/api/generate', {
        idee: isFree ? `Mon chat ${opts.sujet}` : c.titre, personnalite: PERSONAS[opts.personaId].nom, nom: opts.nom,
        viral: opts.viral, longueur: opts.longueur, exemple: proj.beats.map(b => ({ role: b.role, s: b.s, t: b.t })),
      }, 45000);
      proj = normalizeProject(r, proj);
      toast('✨ Scénario écrit par l’IA', 'ok');
    } catch (e) {
      toast(`IA indisponible (${e.message}) : scénario local utilisé.`, 'err');
    }
  }
  proj.viral = state.settings.viral; proj.loop = state.settings.loop;
  proj.fur = state.look.fur;
  state.project = proj;
  renderBeats(); renderPub();
  $('btnReroll').disabled = false;
  await rebuild({ autoplay: true, fresh: true });
}

/** Recalcule voix + ligne de temps + score, puis met à jour l'aperçu. */
async function rebuild({ autoplay = false, seekTo = null, fresh = false } = {}) {
  if (!state.project) return;
  const token = ++state.token;
  const p = state.project;
  Object.assign(p, { fur: state.look.fur, acc: resolvedAcc(), nom: state.look.nom, viral: state.settings.viral, loop: state.settings.loop });
  const t0 = performance.now();
  const showBusy = setTimeout(() => busy(true, '🎙️ Doublage des voix…', 0.2), fresh ? 0 : 300);
  let res;
  try {
    res = await prepareVoices(p, { ...state.settings, engine: effEngine() }, (i, n) => { if (token === state.token) busy(true, `🎙️ Doublage des voix… ${i}/${n}`, 0.2 + 0.75 * (i / n)); });
  } catch (e) { clearTimeout(showBusy); busy(false); status(`Erreur voix : ${e.message}`, 'err'); return; }
  clearTimeout(showBusy);
  if (token !== state.token) return;
  if (res.warning) toast(`⚠️ ${res.warning}`, 'err');
  renderCast();
  const tl = buildTimeline(p, res.voices);
  state.tl = tl;
  cancelAnimationFrame(idleRaf);
  player.load(tl, lookProject());
  const prevScore = state.analysis ? state.analysis.score : null;
  state.analysis = analyze(p, tl);
  busy(false);
  renderViral(prevScore, fresh);
  updateBeatMeta();
  ['btnPlay', 'scrub', 'btnExport', 'btnDlVideo', 'btnDlSrt', 'btnDlTxt', 'btnFixAll'].forEach(id => { $(id).disabled = false; });
  $('btnAddBeat').hidden = false;
  status(`✅ Vidéo prête : ${tl.beats.length} séquences · ${tl.duration.toFixed(1)} s · ${(performance.now() - t0).toFixed(0)} ms`, 'ok');
  save();
  if (seekTo != null) player.seek(seekTo);
  if (autoplay) { $('bigPlay').hidden = true; play(0); } else if (seekTo == null) { $('bigPlay').hidden = false; }
}

/* ====================== Script (séquences) ====================== */
const ROLES = { hook: '🪝 Hook', setup: '🎬 Mise en place', escalade: '📈 Escalade', twist: '🌀 Chute', cta: '📣 CTA' };
const SPEAKERS = { chat: '🐱 Chat', narrateur: '🎙️ Narrateur', humain: '👤 Humain' };
function renderBeats() {
  const box = $('beats');
  const p = state.project;
  if (!p) return;
  box.innerHTML = '';
  p.beats.forEach((b, i) => {
    const card = el('div', { class: 'beat', 'data-id': b.id });
    card.innerHTML = `
      <div class="beat-head">
        <span class="idx">#${i + 1}</span>
        <select data-k="role" class="role ${b.role}" title="Rôle">${options(ROLES, b.role)}</select>
        <select data-k="s" title="Qui parle">${options(SPEAKERS, b.s)}</select>
        <span class="dur" data-dur>—</span>
        <button class="ib" data-act="play" title="Lire depuis ici">▶️</button>
        <button class="ib" data-act="up" title="Monter">⬆️</button>
        <button class="ib" data-act="down" title="Descendre">⬇️</button>
        <button class="ib" data-act="del" title="Supprimer">🗑️</button>
      </div>
      <textarea data-k="t" rows="2" aria-label="Texte de la séquence ${i + 1}">${esc(b.t)}</textarea>
      <div class="beat-opts">
        <select data-k="e" title="Émotion">${options(EMOTIONS, b.e)}</select>
        <select data-k="sc" title="Décor">${options(SCENES, b.sc)}</select>
        <select data-k="fx" title="Effet sonore">${options(SFX, b.fx || 'aucun')}</select>
        <select data-k="m" title="Mème">${options(MEMES, b.m || 'aucun')}</select>
        <select data-k="cam" title="Caméra">${options(CAMERAS, b.cam)}</select>
      </div>`;
    box.appendChild(card);
  });
}
let editTimer = 0;
$('beats').addEventListener('input', (e) => {
  const card = e.target.closest('.beat'); if (!card || !state.project) return;
  const b = state.project.beats.find(x => x.id === card.dataset.id); if (!b) return;
  const k = e.target.dataset.k; if (!k) return;
  b[k] = e.target.value;
  if (k === 'role') e.target.className = 'role ' + b.role;
  clearTimeout(editTimer);
  const delay = k === 't' ? 650 : 50;
  editTimer = setTimeout(() => {
    const tb = state.tl && state.tl.beats.find(x => x.id === b.id);
    rebuild({ seekTo: tb ? tb.start + Math.min(0.6, tb.dur / 2) : null });
  }, delay);
});
$('beats').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const card = btn.closest('.beat'); const beats = state.project.beats;
  const i = beats.findIndex(x => x.id === card.dataset.id);
  const act = btn.dataset.act;
  if (act === 'play') { const tb = state.tl.beats[i]; if (tb) play(tb.start); return; }
  if (act === 'up' && i > 0) [beats[i - 1], beats[i]] = [beats[i], beats[i - 1]];
  else if (act === 'down' && i < beats.length - 1) [beats[i + 1], beats[i]] = [beats[i], beats[i + 1]];
  else if (act === 'del') { if (beats.length <= 2) { toast('Il faut au moins 2 séquences.', 'err'); return; } beats.splice(i, 1); }
  else return;
  renderBeats(); rebuild();
});
function updateBeatMeta() {
  if (!state.tl) return;
  state.tl.beats.forEach(b => {
    const card = document.querySelector(`.beat[data-id="${b.id}"]`);
    if (card) { const d = card.querySelector('[data-dur]'); d.textContent = `${b.dur.toFixed(1)} s`; d.style.color = b.dur > 3.1 ? 'var(--red)' : ''; }
  });
}
let curBeat = null;
function onTime(t, tl) {
  $('scrub').value = Math.round(t / tl.duration * 1000);
  $('time').textContent = `${fmt(t)} / ${fmt(tl.duration)}`;
  const b = tl.beats.find(x => t >= x.start && t < x.end);
  if (b && b.id !== curBeat) {
    curBeat = b.id;
    document.querySelectorAll('.beat.current').forEach(x => x.classList.remove('current'));
    const card = document.querySelector(`.beat[data-id="${b.id}"]`);
    if (card) {
      card.classList.add('current');
      // Défilement interne du panneau seulement (jamais de la page, surtout sur mobile)
      const box = card.closest('.results');
      if (player.playing && !card.contains(document.activeElement) && box && box.scrollHeight > box.clientHeight + 4 && getComputedStyle(box).overflowY === 'auto') {
        const top = card.offsetTop - box.offsetTop;
        if (top < box.scrollTop + 60 || top > box.scrollTop + box.clientHeight - 160) box.scrollTo({ top: top - 80, behavior: 'smooth' });
      }
    }
  }
  if (state.exporting) busy(null, `🔴 Enregistrement… ${Math.round(t / tl.duration * 100)} %`, t / tl.duration);
}

/* ====================== Lecture ====================== */
function play(from) {
  if (!state.tl) return;
  audio.ensure();
  $('bigPlay').hidden = true;
  setPlayIcon(true);
  player.play({ from: from ?? player.t, settings: state.settings });
}
function togglePlay() { if (player.playing) { player.stop(); setPlayIcon(false); } else play(player.t >= state.tl.duration - 0.1 ? 0 : player.t); }
function setPlayIcon(on) { $('btnPlay').textContent = on ? '⏸' : '▶'; $('btnPlay').setAttribute('aria-label', on ? 'Pause' : 'Lecture'); }

/* ====================== Export ====================== */
async function exportVideo() {
  if (!state.tl || state.exporting) return;
  if (!bestMime()) { toast("Ton navigateur ne sait pas exporter la vidéo. Utilise Chrome ou Edge sur ordinateur.", 'err'); return; }
  audio.ensure();
  player.stop();
  state.exporting = true; state.cancelExport = false; state.restartExport = false;
  ['btnExport', 'btnGenerate', 'btnPlay', 'scrub', 'btnDlVideo'].forEach(id => { $(id).disabled = true; });
  let res = null;
  try {
    const q = Number(state.settings.quality);
    if (q !== 720) { renderer.setQuality(q); clearSceneCache(); }
    busy(true, '🔴 Enregistrement… garde cet onglet affiché (Échap = annuler)', 0);
    $('busy').style.background = 'rgba(20,10,25,.35)';
    state.recording = true;
    res = await player.play({ record: true, from: 0, settings: state.settings });
    state.recording = false;
    if (!res) {
      if (state.restartExport) { status('⏸️ Export en pause : l’onglet a été masqué. Il reprendra tout seul à ton retour.', ''); return; }
      if (state.cancelExport) { toast('Export annulé.'); status('Export annulé.', ''); return; }
      throw new Error('Enregistrement interrompu');
    }
    // Un seul fichier : la vidéo finale. Rien n'est gardé ensuite (ni copie, ni morceaux, ni URL).
    download(res.blob, `${slug()}.${res.ext}`);
    const mb = (res.blob.size / 1048576).toFixed(1);
    res = null;
    clearVoiceCache(); // rendus vocaux intermédiaires libérés (la vidéo en cours reste jouable)
    toast(`🎉 Vidéo téléchargée (${mb} Mo)`, 'gold');
    status('✅ Vidéo téléchargée. Onglet « Publier » pour le titre et les hashtags.', 'ok');
    switchTab('pub');
  } catch (e) {
    status(`❌ Export impossible : ${e.message}`, 'err');
    toast(`Export impossible : ${e.message}`, 'err');
  } finally {
    state.recording = false;
    $('busy').style.background = '';
    busy(false);
    if (renderer.canvas.width !== 720) { renderer.setQuality(720); clearSceneCache(); }
    state.exporting = false;
    ['btnExport', 'btnGenerate', 'btnPlay', 'scrub', 'btnDlVideo'].forEach(id => { $(id).disabled = false; });
    player.draw(0);
  }
}
function download(blob, name) {
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const slug = () => 'chatastrophe-' + plain(state.project?.title || 'video').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function makeSrt() {
  const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, se = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(se).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const out = []; let n = 1;
  state.tl.beats.forEach(b => {
    for (let i = 0; i < b.words.length; i += 3) {
      const g = b.words.slice(i, i + 3);
      const end = i + 3 < b.words.length ? b.words[i + 3].start : b.end;
      out.push(`${n++}\n${ts(g[0].start)} --> ${ts(end)}\n${g.map(w => w.w).join(' ')}\n`);
    }
  });
  return out.join('\n');
}
function makeTxt() {
  const p = state.project;
  const sp = { chat: (p.nom || 'Chat').toUpperCase(), narrateur: 'NARRATEUR', humain: 'MOI' };
  return [`TITRE : ${p.title}`, `TEXTE À L'ÉCRAN : ${p.overlay}`, '', `DESCRIPTION : ${p.description}`, `HASHTAGS : ${p.hashtags.join(' ')}`, '', 'SCRIPT', '------',
    ...state.tl.beats.map((b, i) => `${i + 1}. [${fmt(b.start)}] (${ROLES[b.role]}) ${sp[b.s]} : ${plain(b.t)}`)].join('\n');
}

/* ====================== Viralité ====================== */
function renderViral(prev, fresh) {
  const a = state.analysis; if (!a) return;
  const ring = $('ringFg');
  ring.style.strokeDashoffset = String(326.7 * (1 - a.score / 100));
  ring.style.stroke = a.score >= 85 ? '#FFE14D' : a.score >= 70 ? '#FF9F1A' : a.score >= 50 ? '#45AAF2' : '#FF4D5E';
  countUp($('scoreNum'), a.score);
  $('scoreTab').textContent = a.score;
  const lv = $('levelBadge'); lv.textContent = a.level.label; lv.className = 'level ' + a.level.cls;
  $('kHold').textContent = a.hold3s + ' %'; $('kComp').textContent = a.completion + ' %'; $('kDur').textContent = state.tl.duration.toFixed(0) + ' s';
  drawRetention(a);
  const list = a.crit.slice().sort((x, y) => (x.ok - y.ok) || ((y.max - y.pts) - (x.max - x.pts)));
  $('criteria').innerHTML = list.map(c => `
    <li class="${c.ok ? 'ok' : ''}">
      <span class="ic">${c.ok ? '✅' : c.pts >= c.max / 2 ? '🟡' : '⚠️'}</span>
      <span class="tx">${esc(c.label)}${c.ok ? '' : `<small>${esc(c.tip)}</small>`}</span>
      <span class="pts">${c.pts}/${c.max}</span>
      ${!c.ok && c.fix ? `<button class="btn small" data-fix="${c.fix}">Corriger</button>` : ''}
    </li>`).join('');
  $('btnFixAll').disabled = !a.crit.some(c => !c.ok && c.fix);
  if (prev != null && !fresh && a.score !== prev) toast(`${a.score > prev ? '📈 +' : '📉 '}${a.score - prev} point(s) de viralité → ${a.score}/100`, a.score > prev ? 'ok' : '');
  if (a.score > state.best) {
    const first = !state.best;
    state.best = a.score; localStorage.setItem(LS + ':best', String(a.score)); buildSettings();
    if (!first) toast(`🏆 Nouveau record : ${a.score}/100 !`, 'gold');
  }
  if (a.score >= 85 && prev != null && prev < 85) { confetti(); toast("👑 Niveau « Roi d'Internet » atteint !", 'gold'); }
}
$('criteria').addEventListener('click', e => {
  const b = e.target.closest('[data-fix]'); if (!b) return;
  const msg = applyFix(b.dataset.fix, state.project);
  syncAfterFix(); if (msg) toast('⚡ ' + msg, 'ok');
});
function fixAll() {
  const order = ['hook_court', 'hook_titre', 'chute', 'cta', 'mots_comiques', 'rythme', 'duree_longue', 'sons', 'memes', 'cameras', 'meta', 'boucle'];
  const todo = new Set(state.analysis.crit.filter(c => !c.ok && c.fix).map(c => c.fix));
  let n = 0;
  order.forEach(f => { if (todo.has(f)) { applyFix(f, state.project); n++; } });
  syncAfterFix(); toast(`⚡ ${n} optimisation(s) appliquée(s)`, 'ok');
}
function syncAfterFix() {
  state.settings.viral = state.project.viral; state.settings.loop = state.project.loop;
  $('viralMode').checked = state.settings.viral; $('loopMode').checked = state.settings.loop;
  renderBeats(); renderPub(); rebuild({ seekTo: 0 });
}
function drawRetention(a) {
  const svg = $('retention'); const d = state.tl.duration;
  const X = t => (t / d) * 316 + 2, Y = v => 112 - v * 1.02;
  const pts = a.curve.map(([t, v]) => `${X(t).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const beatsLines = state.tl.beats.map(b => `<line x1="${X(b.start)}" x2="${X(b.start)}" y1="6" y2="114" stroke="rgba(255,255,255,.08)"/>`).join('');
  const weak = a.weak.map(w => `<circle cx="${X(w.t)}" cy="${Y((a.curve.find(p => p[0] >= w.t) || [0, 50])[1])}" r="4" fill="#FF4D5E"><title>${esc(w.label)}</title></circle>`).join('');
  svg.innerHTML = `<defs><linearGradient id="rg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF9F1A" stop-opacity=".55"/><stop offset="1" stop-color="#FF4F8B" stop-opacity="0"/></linearGradient></defs>
    ${beatsLines}<line x1="${X(3)}" x2="${X(3)}" y1="6" y2="114" stroke="#FFE14D" stroke-dasharray="3 3" opacity=".7"/>
    <text x="${X(3) + 3}" y="16" fill="#FFE14D" font-size="9">3 s</text>
    <polygon points="2,112 ${pts} ${X(d)},112" fill="url(#rg)"/>
    <polyline points="${pts}" fill="none" stroke="#FF9F1A" stroke-width="2.5" vector-effect="non-scaling-stroke"/>${weak}`;
}
function countUp(node, to) {
  const from = Number(node.textContent) || 0; const t0 = performance.now();
  const step = (now) => { const k = Math.min(1, (now - t0) / 700); node.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ====================== Publication ====================== */
function renderPub() {
  const p = state.project; if (!p) return;
  $('pubTitle').value = p.title || ''; $('pubDesc').value = p.description || '';
  $('pubTags').value = (p.hashtags || []).join(' '); $('pubOverlay').value = p.overlay || '';
}
let pubTimer = 0;
function onPubEdit() {
  const p = state.project; if (!p) return;
  p.title = $('pubTitle').value; p.description = $('pubDesc').value; p.overlay = $('pubOverlay').value.toUpperCase();
  p.hashtags = $('pubTags').value.split(/[\s,]+/).filter(Boolean).map(h => '#' + h.replace(/^#+/, ''));
  player.setProject(lookProject());
  clearTimeout(pubTimer);
  pubTimer = setTimeout(() => { const prev = state.analysis.score; state.analysis = analyze(p, state.tl); renderViral(prev); save(); }, 500);
}

/* ====================== Utilitaires UI ====================== */
let busyOn = false;
function busy(on, text, progress) {
  if (on === true) busyOn = true; if (on === false) busyOn = false;
  $('busy').hidden = !busyOn;
  if (text) $('busyText').textContent = text;
  if (progress != null) $('busyBar').style.width = Math.round(progress * 100) + '%';
}
function status(msg, cls = '') { const s = $('status'); s.textContent = msg; s.className = 'status ' + cls; }
function toast(msg, cls = '') {
  const t = el('div', { class: 'toast ' + cls }); t.textContent = msg; $('toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s, transform .4s'; t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; setTimeout(() => t.remove(), 400); }, 3600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('📋 Copié !', 'ok'); }
  catch (e) { const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('📋 Copié !', 'ok'); }
}
function confetti() {
  const cv = $('confetti'); const c = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#FFE14D', '#FF4F8B', '#3CDB7B', '#2EE6FF', '#FF9F1A'];
  const parts = Array.from({ length: 160 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, r: Math.random() * 6, c: cols[(Math.random() * 5) | 0], s: 6 + Math.random() * 8 }));
  const t0 = performance.now();
  const step = (now) => {
    c.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += 0.1; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); });
    if (now - t0 < 3500) requestAnimationFrame(step); else c.clearRect(0, 0, cv.width, cv.height);
  };
  requestAnimationFrame(step);
}
async function fetchJson(url, body, timeout = 8000) {
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    return j;
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'délai dépassé' : e.message); }
  finally { clearTimeout(tm); }
}
function save() {
  try { localStorage.setItem(LS, JSON.stringify({ sel: state.sel, look: state.look, settings: state.settings, project: state.project })); } catch (e) { /* stockage plein ou bloqué */ }
}

/* ====================== Démarrage ====================== */
async function checkApi() {
  if (location.protocol === 'file:') return;
  try {
    const s = await fetchJson('/api/status', null, 2500);
    state.api = { generate: !!s.generate, tts: !!s.tts };
  } catch (e) { state.api = { generate: false, tts: false }; }
  if (!state.api.tts && state.settings.engine === 'ia') state.settings.engine = 'piper';
  buildVoice(); buildSettings();
}

async function start() {
  buildIdeas(); buildLook(); buildVoice(); buildSettings(); bind(); updateSummaries();
  idle();
  try { await Promise.all([document.fonts.load('80px "Luckiest Guy"'), document.fonts.load('600 40px "Fredoka"')]); clearSceneCache(); } catch (e) { /* polices système */ }
  checkApi();
  // Reprise du dernier projet
  if (state.project && Array.isArray(state.project.beats) && state.project.beats.length) {
    renderBeats(); renderPub(); $('btnReroll').disabled = false;
    rebuild().catch(() => {});
  }
}
start();
