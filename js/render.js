/**
 * Rendu vidéo image par image sur canvas (aperçu en direct = export) :
 * caméra dynamique, transitions, mèmes, sous-titres TikTok, hook et CTA.
 */
import { drawScene, setSceneScale, W, H } from './scenes.js';
import { drawCat, heart } from './cat.js';

const TAU = Math.PI * 2;
const FONT = '"Luckiest Guy", "Fredoka", "Arial Black", sans-serif';
const UI_FONT = '"Fredoka", "Segoe UI", sans-serif';
const PALETTE = ['#FFE500', '#3CFF6B', '#FF4FD8', '#2EE6FF', '#FF9F1A'];
const FOCUS = { x: 540, y: 1085 };
const CAT = { x: 540, y: 1560, s: 1.12 };
const SUB_Y = 650;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeBack = (x) => { x = clamp(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

function outlined(c, s, x, y, size, fill, opts = {}) {
  const { stroke = '#1E1419', lw = Math.max(6, size * 0.16), font = FONT, align = 'center', shadow = true } = opts;
  c.font = `${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (shadow) { c.save(); c.fillStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = lw; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.strokeText(s, x + size * 0.05, y + size * 0.07); c.restore(); }
  c.lineWidth = lw; c.strokeStyle = stroke; c.strokeText(s, x, y);
  c.fillStyle = fill; c.fillText(s, x, y);
}

/* ---------- Caméra ---------- */
function camera(kind, lt, dur) {
  const p = clamp(lt / dur);
  switch (kind) {
    case 'punch': return { s: 1 + 0.32 * easeBack(lt / 0.2) + 0.06 * p, ox: 0, oy: 40 * easeOut(lt / 0.2), rot: 0 };
    case 'zoom_lent': return { s: 1.04 + 0.14 * p, ox: 0, oy: 20 * p, rot: 0 };
    case 'recul': return { s: 1.5 - 0.42 * easeOut(lt / 0.7), ox: 0, oy: 60 * (1 - easeOut(lt / 0.7)), rot: 0 };
    case 'secousse': { const a = 22 * Math.max(0.25, 1 - lt / 0.8); return { s: 1.14, ox: Math.sin(lt * 61) * a, oy: Math.cos(lt * 47) * a, rot: Math.sin(lt * 33) * 0.012 }; }
    case 'panoramique': return { s: 1.16, ox: -70 + 140 * p, oy: 0, rot: 0 };
    case 'dutch': return { s: 1.18 + 0.05 * p, ox: 0, oy: 0, rot: -0.11 * easeOut(lt / 0.35) };
    case 'rebond': return { s: 1.08 + 0.06 * Math.abs(Math.sin(lt * 7)) * Math.max(0.2, 1 - lt / 1.5), ox: 0, oy: 0, rot: 0 };
    default: return { s: 1.05, ox: 0, oy: 0, rot: 0 };
  }
}

/* ---------- Découpage des sous-titres ---------- */
function chunks(beat, mode) {
  const key = mode + beat.start;
  if (beat._chunks && beat._chunksKey === key) return beat._chunks;
  const out = [];
  let cur = [];
  const maxW = mode === 'mot' ? 1 : 3;
  beat.words.forEach((w, i) => {
    cur.push({ ...w, i });
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
    if (cur.length >= maxW || len > 15 || /[.!?,:;…]$/.test(w.w)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  beat._chunks = out; beat._chunksKey = key;
  return out;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext('2d', { alpha: false });
    this.setQuality(720);
  }
  /** @param p largeur de la vidéo verticale : 720 → 720×1280, 1080 → 1080×1920 */
  setQuality(p) {
    this.k = p / W;
    this.canvas.width = Math.round(W * this.k);
    this.canvas.height = Math.round(H * this.k);
    setSceneScale(this.k);
  }

  /** Image d'attente (aucun projet). */
  poster(look) {
    const c = this.c; c.setTransform(this.k, 0, 0, this.k, 0, 0);
    const t = performance.now() / 1000;
    drawScene(c, 'salon', t);
    drawCat(c, { ...CAT, fur: look.fur, emo: 'malicieux', acc: look.acc, t, local: 1 });
    outlined(c, 'CHATASTROPHE', 540, 330, 120, '#FFE500');
    outlined(c, 'STUDIO 🎬', 540, 460, 84, '#FFFFFF');
    outlined(c, 'Choisis une idée et clique sur', 540, 650, 46, '#FFFFFF', { font: UI_FONT, lw: 10 });
    outlined(c, '« GÉNÉRER LA VIDÉO »', 540, 720, 56, '#3CFF6B');
  }

  /** Dessine l'image au temps t. */
  render(t, tl, project, opts = {}) {
    const c = this.c;
    c.setTransform(this.k, 0, 0, this.k, 0, 0);
    if (!tl || !tl.beats.length) { this.poster(project); return null; }
    t = clamp(t, 0, tl.duration - 0.001);
    let b = tl.beats.find(x => t >= x.start && t < x.end) || tl.beats[tl.beats.length - 1];
    const lt = t - b.start;
    const viral = project.viral;

    // Mouvement de bouche si le chat parle
    let talk = 0;
    if (b.s === 'chat') {
      const w = b.words.find(x => t >= x.start && t <= x.end + 0.03);
      if (w) talk = 0.35 + 0.65 * Math.abs(Math.sin((t - w.start) * 26));
    }

    // Caméra + transition
    const cam = camera(b.cam, lt, b.dur);
    let s = cam.s, ox = cam.ox, oy = cam.oy;
    if (viral && b.index > 0 && lt < 0.14) { const k = 1 - lt / 0.14; s *= 1 + 0.18 * k; ox += (b.index % 2 ? 1 : -1) * 160 * k * k; }

    c.save();
    c.translate(FOCUS.x + ox, FOCUS.y + oy);
    c.rotate(cam.rot);
    c.scale(s, s);
    c.translate(-FOCUS.x, -FOCUS.y);

    drawScene(c, b.sc, t);
    if (b.m === 'rayons' || ((b.e === 'choque' || b.e === 'panique') && lt < 0.9)) this.rays(c, t, b.m === 'rayons' ? 1 : 1 - lt / 0.9);
    // Ombre au sol
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(CAT.x + 30, CAT.y + 10, 300, 46, 0, 0, TAU); c.fill();
    drawCat(c, { ...CAT, fur: project.fur, emo: b.e, acc: project.acc, t, talk, local: lt, look: Math.sin(t * 0.7) });
    this.worldMemes(c, b, lt, t);
    c.restore();

    this.screenMemes(c, b, lt, t);
    this.vignette(c);
    this.titleBanner(c, b, lt, t, project);
    if (b.role === 'cta') this.cta(c, lt, t);
    this.subtitles(c, b, t, project, opts);
    if (opts.handle) outlined(c, '@' + opts.handle.replace(/^@/, ''), 540, 1700, 40, 'rgba(255,255,255,0.85)', { font: UI_FONT, lw: 8, shadow: false });

    // Flash de coupe
    if (viral && b.index > 0 && lt < 0.07) { c.fillStyle = `rgba(255,255,255,${0.35 * (1 - lt / 0.07)})`; c.fillRect(0, 0, W, H); }
    return b;
  }

  vignette(c) {
    if (!this._vig) { const g = c.createRadialGradient(540, 960, 500, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); this._vig = g; }
    c.fillStyle = this._vig; c.fillRect(0, 0, W, H);
  }

  rays(c, t, a) {
    c.save(); c.globalAlpha = 0.5 * clamp(a); c.translate(FOCUS.x, FOCUS.y); c.rotate(t * 0.4);
    c.fillStyle = '#FFFFFF';
    for (let k = 0; k < 18; k++) { c.rotate(TAU / 18); c.beginPath(); c.moveTo(0, 0); c.lineTo(1600, -90); c.lineTo(1600, 90); c.closePath(); c.globalAlpha = 0.18 * clamp(a); c.fill(); }
    c.restore();
  }

  /* ---------- Mèmes dans la scène ---------- */
  worldMemes(c, b, lt, t) {
    const m = b.m;
    if (m === 'cercle_rouge' && lt > 0.12) {
      const k = easeBack((lt - 0.12) / 0.25);
      c.save(); c.strokeStyle = '#FF1E1E'; c.lineWidth = 18; c.beginPath(); c.ellipse(FOCUS.x, FOCUS.y - 20, 300 * k, 270 * k, 0, 0, TAU); c.stroke();
      const a = clamp((lt - 0.25) / 0.2); if (a > 0) {
        c.globalAlpha = a; c.lineWidth = 22; c.beginPath(); c.moveTo(1010, 520); c.lineTo(830, 790); c.stroke();
        c.fillStyle = '#FF1E1E'; c.beginPath(); c.moveTo(800, 840); c.lineTo(790, 740); c.lineTo(880, 790); c.closePath(); c.fill();
      }
      c.restore();
    }
    if (m === 'lunettes') {
      const y = -400 + (FOCUS.y - 10 + 400) * easeOut(lt / 0.55);
      const px = 26, rows = ['1111111111111111', '1111111111111111', '0112211001122110', '0111111001111110', '0011110000111100'];
      c.save(); c.translate(FOCUS.x - 8 * px, y - 2 * px);
      rows.forEach((r, yi) => [...r].forEach((ch, xi) => { if (ch === '0') return; c.fillStyle = ch === '2' ? '#FFFFFF' : '#000000'; c.fillRect(xi * px, yi * px, px + 1, px + 1); }));
      c.restore();
    }
    if (m === 'censure') {
      const j = Math.sin(t * 30) * 4;
      c.save(); c.translate(FOCUS.x + j, CAT.y - 170); c.rotate(-0.04); c.fillStyle = '#000'; c.fillRect(-330, -80, 660, 160);
      outlined(c, 'CENSURÉ', 0, 4, 96, '#FFFFFF', { stroke: '#000', shadow: false }); c.restore();
    }
    if (m === 'coeurs') {
      for (let k = 0; k < 10; k++) { const p = (lt * 0.55 + hash(k)) % 1; c.globalAlpha = 1 - p; heart(c, 540 + (hash(k + 9) - 0.5) * 760, 1500 - p * 900, 40 + hash(k + 3) * 40, k % 2 ? '#FF4F8B' : '#FF2D55'); }
      c.globalAlpha = 1;
    }
  }

  /* ---------- Mèmes à l'écran ---------- */
  screenMemes(c, b, lt, t) {
    const m = b.m;
    switch (m) {
      case 'plot_twist': {
        if (lt > 1.6) break;
        const k = easeBack(lt / 0.35), a = lt > 1.3 ? 1 - (lt - 1.3) / 0.3 : 1;
        c.save(); c.globalAlpha = a; c.translate(540, 1000); c.rotate((1 - k) * 3 - 0.08); c.scale(k, k);
        outlined(c, 'PLOT TWIST', -10, 0, 150, '#2EE6FF', { shadow: false });
        outlined(c, 'PLOT TWIST', 10, 0, 150, '#FF2D55', { shadow: false });
        outlined(c, 'PLOT TWIST', 0, 0, 150, '#FFFFFF');
        c.restore(); break;
      }
      case 'degats': {
        const k = easeBack(lt / 0.3);
        c.save(); c.translate(540 + Math.sin(t * 40) * 6, 900); c.rotate(-0.09); c.scale(k, k);
        outlined(c, 'DÉGÂTS', 0, -60, 120, '#FF2D55'); outlined(c, 'ÉMOTIONNELS 💔', 0, 60, 92, '#FFFFFF'); c.restore(); break;
      }
      case 'bruh': {
        c.fillStyle = `rgba(0,0,0,${0.35 * clamp(lt / 0.3)})`; c.fillRect(0, 0, W, H);
        const s = 1 + lt * 0.08;
        c.save(); c.translate(540, 900); c.scale(s, s); outlined(c, 'BRUH.', 0, 0, 190, '#FFFFFF'); c.restore(); break;
      }
      case 'yeux': {
        const s = 1 + Math.sin(t * 6) * 0.06;
        c.save(); c.translate(890, 830); c.scale(s, s); c.font = '120px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👁️👄👁️', 0, 0); c.restore(); break;
      }
      case 'stonks': {
        const p = easeOut(lt / 0.8);
        const pts = [[60, 1560], [300, 1380], [430, 1450], [680, 1120], [800, 1190], [1020, 760]];
        c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
        const total = pts.length - 1, upto = p * total;
        c.beginPath(); c.moveTo(...pts[0]);
        for (let i = 1; i <= Math.ceil(upto); i++) { const f = Math.min(1, upto - (i - 1)); const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; c.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); }
        c.lineWidth = 46; c.strokeStyle = '#1E1419'; c.stroke(); c.lineWidth = 30; c.strokeStyle = '#18E05B'; c.stroke();
        if (p > 0.95) { c.fillStyle = '#18E05B'; c.beginPath(); c.moveTo(1050, 700); c.lineTo(960, 740); c.lineTo(1040, 820); c.closePath(); c.fill(); c.lineWidth = 8; c.strokeStyle = '#1E1419'; c.stroke(); }
        c.translate(780, 860); c.rotate(-0.2); outlined(c, 'STONKS 📈', 0, 0, 96, '#18E05B'); c.restore(); break;
      }
      case 'pluie_billets': {
        c.font = '86px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let k = 0; k < 16; k++) { const p = (lt * 0.5 + hash(k)) % 1; c.save(); c.translate(hash(k + 4) * W, -100 + p * (H + 200)); c.rotate(Math.sin(t * 3 + k) * 0.5); c.fillText(k % 3 ? '💸' : '💰', 0, 0); c.restore(); }
        break;
      }
      case 'confettis': {
        for (let k = 0; k < 70; k++) { const p = (lt * 0.45 + hash(k)) % 1; c.save(); c.translate(hash(k + 2) * W + Math.sin(t * 2 + k) * 40, -40 + p * (H + 80)); c.rotate(t * 4 + k); c.fillStyle = PALETTE[k % PALETTE.length]; c.fillRect(-14, -8, 28, 16); c.restore(); }
        break;
      }
      case 'feu': {
        for (let x = -40; x < W + 80; x += 85) {
          const h = 220 + Math.sin(t * 9 + x) * 60 + hash(x) * 80;
          [['#FF3B1F', 1], ['#FF9F1A', 0.7], ['#FFE14D', 0.4]].forEach(([col, f]) => {
            c.fillStyle = col; c.beginPath(); c.moveTo(x - 70 * f, H); c.quadraticCurveTo(x - 50 * f, H - h * f * 0.6, x + Math.sin(t * 7 + x) * 20, H - h * f); c.quadraticCurveTo(x + 50 * f, H - h * f * 0.6, x + 70 * f, H); c.closePath(); c.fill();
          });
        }
        break;
      }
      case 'criquets_txt': {
        c.globalAlpha = clamp(lt / 0.4);
        outlined(c, '*bruit de criquets* 🦗', 540, 860, 60, '#FFFFFF', { font: UI_FONT, lw: 10 });
        c.globalAlpha = 1; break;
      }
      case 'mission_echouee': {
        if (lt < 0.25) break;
        c.fillStyle = 'rgba(30,30,40,0.42)'; c.fillRect(0, 0, W, H);
        const k = easeBack((lt - 0.25) / 0.3);
        c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(-0.05);
        c.fillStyle = '#FF2D55'; c.beginPath(); c.roundRect(-460, -110, 920, 220, 30); c.fill(); c.lineWidth = 10; c.strokeStyle = '#1E1419'; c.stroke();
        outlined(c, '❌ MISSION ÉCHOUÉE', 0, 6, 86, '#FFFFFF', { shadow: false }); c.restore(); break;
      }
      case 'carton_temps': {
        if (lt > 1.05) break;
        const a = lt > 0.85 ? 1 - (lt - 0.85) / 0.2 : 1;
        c.save(); c.globalAlpha = a;
        const g = c.createRadialGradient(540, 960, 50, 540, 960, 1200); g.addColorStop(0, '#FFE873'); g.addColorStop(1, '#FF9F1A');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.translate(540, 960); c.rotate(t * 0.3); c.fillStyle = 'rgba(255,255,255,0.25)';
        for (let k = 0; k < 14; k++) { c.rotate(TAU / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(1500, -100); c.lineTo(1500, 100); c.closePath(); c.fill(); }
        c.restore();
        c.save(); c.globalAlpha = a; c.translate(540, 960); c.rotate(-0.06);
        outlined(c, 'QUELQUES HEURES', 0, -70, 104, '#7A3B00', { stroke: '#FFFFFF' }); outlined(c, 'PLUS TARD…', 0, 60, 120, '#7A3B00', { stroke: '#FFFFFF' });
        c.restore(); break;
      }
    }
  }

  /* ---------- Titre (hook) ---------- */
  titleBanner(c, b, lt, t, project) {
    const text = (project.overlay || '').trim();
    if (!text) return;
    if (b.role === 'hook') {
      const k = easeBack(lt / 0.3);
      const lines = wrap(c, text, 900, `82px ${FONT}`, 2);
      c.save(); c.translate(540, 300); c.rotate(-0.035 + Math.sin(t * 5) * 0.01); c.scale(k, k);
      const h = lines.length * 92 + 50;
      c.fillStyle = '#FFE500'; c.beginPath(); c.roundRect(-500, -h / 2, 1000, h, 34); c.fill(); c.lineWidth = 12; c.strokeStyle = '#1E1419'; c.stroke();
      lines.forEach((ln, i) => outlined(c, ln, 0, -((lines.length - 1) * 92) / 2 + i * 92 + 6, 82, '#1E1419', { stroke: '#FFE500', lw: 2, shadow: false }));
      c.restore();
    } else if (project.viral && b.role !== 'cta' && !(b.m === 'carton_temps' && lt < 1.05)) {
      c.font = `44px ${FONT}`;
      const tw = Math.min(980, c.measureText(text).width + 60);
      c.save(); c.translate(540, 290);
      c.fillStyle = 'rgba(20,14,25,0.72)'; c.beginPath(); c.roundRect(-tw / 2, -40, tw, 80, 40); c.fill();
      c.fillStyle = '#FFE500'; c.textAlign = 'center'; c.textBaseline = 'middle';
      let s = text; while (c.measureText(s).width > 920 && s.length > 4) s = s.slice(0, -2);
      c.fillText(s === text ? s : s + '…', 0, 4); c.restore();
    }
  }

  /* ---------- CTA final ---------- */
  cta(c, lt, t) {
    const k = easeBack(lt / 0.35);
    const pulse = 1 + Math.sin(t * 9) * 0.04;
    c.save(); c.translate(540, 360); c.scale(k * pulse, k * pulse); c.rotate(-0.03);
    c.fillStyle = '#FF2D55'; c.beginPath(); c.roundRect(-380, -85, 760, 170, 85); c.fill(); c.lineWidth = 12; c.strokeStyle = '#1E1419'; c.stroke();
    outlined(c, "S'ABONNER 🐾", 0, 6, 92, '#FFFFFF', { shadow: false });
    c.restore();
    // patte qui « clique »
    const tap = Math.abs(Math.sin(t * 4));
    c.save(); c.translate(820, 470 - tap * 30); c.rotate(-0.5); c.font = '130px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🐾', 0, 0); c.restore();
  }

  /* ---------- Sous-titres mot par mot ---------- */
  subtitles(c, b, t, project, opts) {
    const mode = opts.subMode || 'groupe';
    if (mode === 'aucun' || !b.words.length) return;
    const groups = chunks(b, mode);
    let active = -1;
    for (let i = 0; i < b.words.length; i++) if (t >= b.words[i].start - 0.02) active = i;
    if (active < 0) return;
    const g = groups.find(gr => gr.some(w => w.i === active)) || groups[groups.length - 1];

    // Étiquette de l'orateur
    const tags = { chat: [`🐱 ${(project.nom || 'Le chat').toUpperCase()}`, '#FF9F1A'], narrateur: ['🎙️ NARRATEUR', '#7C5CFF'], humain: ['👤 MOI', '#18C964'] };
    const [label, col] = tags[b.s] || tags.chat;
    c.font = `40px ${FONT}`;
    const lw = c.measureText(label).width + 50;
    c.save(); c.translate(540, SUB_Y - 125); c.fillStyle = col; c.beginPath(); c.roundRect(-lw / 2, -34, lw, 68, 34); c.fill(); c.lineWidth = 7; c.strokeStyle = '#1E1419'; c.stroke();
    c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, 0, 3); c.restore();

    const size = mode === 'mot' ? 150 : 108;
    c.font = `${size}px ${FONT}`;
    const space = size * 0.34;
    // Échelle de chaque mot (le mot prononcé grossit), puis mise en page sans chevauchement
    const items = g.map(w => {
      const isActive = w.i === active;
      let sc = 1, fill = '#FFFFFF', rot = 0;
      if (isActive) { sc = 1.06 + 0.18 * Math.max(0, 1 - (t - w.start) / 0.13); fill = PALETTE[w.i % PALETTE.length]; }
      if (w.hl) { fill = isActive ? '#FF2D55' : '#FFE500'; if (isActive) { sc *= 1.06; rot = Math.sin(t * 22) * 0.05; } }
      const up = w.w.toUpperCase();
      return { ...w, up, isActive, sc, fill, rot, base: c.measureText(up).width, pad: w.hl && isActive ? 64 : 0 };
    });
    const total = items.reduce((a, it) => a + it.base * it.sc + it.pad, 0) + space * (items.length - 1);
    const fit = Math.min(1, 980 / total);
    let x = 540 - (total * fit) / 2;
    items.forEach(it => {
      const ww = (it.base * it.sc + it.pad) * fit;
      c.save(); c.translate(x + ww / 2, SUB_Y + (it.isActive ? -6 : 0)); c.rotate(it.rot); c.scale(it.sc * fit, it.sc * fit);
      if (it.hl && it.isActive) { // éclat comique derrière le mot
        c.save(); c.fillStyle = '#FFE500'; c.beginPath();
        const R = it.base / 2 + 46; for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, r = k % 2 ? R * 0.72 : R; c.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.55); }
        c.closePath(); c.fill(); c.lineWidth = 8; c.strokeStyle = '#1E1419'; c.stroke(); c.restore();
      }
      outlined(c, it.up, 0, 0, size, it.fill, { lw: size * 0.15 });
      c.restore();
      x += ww + space * fit;
    });
  }
}

function wrap(c, text, maxW, font, maxLines) {
  c.font = font;
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (c.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { const rest = lines.slice(maxLines - 1).join(' '); lines.length = maxLines - 1; lines.push(rest.length > 26 ? rest.slice(0, 25) + '…' : rest); }
  return lines;
}
