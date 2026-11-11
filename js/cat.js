/**
 * Personnage du chat dessiné en vectoriel (cohérent d'une scène à l'autre) :
 * pelage, émotions exagérées, bouche qui parle, accessoires.
 */
import { FURS } from './data.js';

const TAU = Math.PI * 2;
const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); };

/**
 * @param c   contexte 2D
 * @param o   { x, y, s, fur, emo, acc, t, talk, bounce, look }
 */
export function drawCat(c, o) {
  const fur = FURS[o.fur] || FURS.roux;
  const emo = o.emo || 'neutre';
  const t = o.t || 0;
  const acc = o.acc || {};
  c.save();
  // Respiration + réactions exagérées
  let bob = Math.sin(t * 2.4) * 6;
  let sx = 1, sy = 1, shake = 0, tilt = 0;
  if (emo === 'rire') { bob = -Math.abs(Math.sin(t * 9)) * 26; }
  if (emo === 'panique') shake = Math.sin(t * 55) * 9;
  if (emo === 'colere') { shake = Math.sin(t * 40) * 4; sy = 1.03; }
  if (emo === 'choque') { const k = Math.max(0, 1 - (o.local || 0) / 0.25); sy = 1 + 0.12 * k; sx = 1 - 0.06 * k; }
  if (emo === 'fier') tilt = -0.06;
  if (emo === 'dodo') { sy = 1 + Math.sin(t * 1.6) * 0.02; bob = 0; }
  c.translate(o.x + shake, o.y + bob * (o.s || 1));
  c.scale((o.s || 1) * sx, (o.s || 1) * sy);
  const outline = 'rgba(30,20,25,0.92)';
  c.lineJoin = 'round'; c.lineCap = 'round';

  // ---------- Queue ----------
  const wag = Math.sin(t * (emo === 'colere' ? 8 : 2.2)) * (emo === 'colere' ? 60 : 35);
  c.lineWidth = 64; c.strokeStyle = outline;
  const tail = () => { c.beginPath(); c.moveTo(150, -70); c.bezierCurveTo(330, -40, 330 + wag * 0.3, -260, 250 + wag, -380); };
  tail(); c.stroke();
  c.lineWidth = 50; c.strokeStyle = fur.mask ? fur.dark : fur.base; tail(); c.stroke();
  if (fur.stripes) { c.lineWidth = 50; c.strokeStyle = fur.dark; c.setLineDash([16, 26]); tail(); c.stroke(); c.setLineDash([]); }

  // ---------- Corps ----------
  c.lineWidth = 10; c.strokeStyle = outline;
  c.beginPath();
  c.moveTo(-150, 0);
  c.bezierCurveTo(-250, -40, -230, -300, -120, -330);
  c.lineTo(120, -330);
  c.bezierCurveTo(230, -300, 250, -40, 150, 0);
  c.closePath();
  c.fillStyle = fur.base; c.fill(); c.stroke();
  c.save(); c.clip();
  ell(c, 0, -120, 120, 170); c.fillStyle = fur.light; c.fill();
  if (fur.stripes) {
    c.strokeStyle = fur.dark; c.lineWidth = 16;
    [-1, 1].forEach(side => { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(side * 240, -250 + k * 70); c.quadraticCurveTo(side * 170, -230 + k * 70, side * 150, -190 + k * 70); c.stroke(); } });
  }
  if (fur.patches) { c.fillStyle = fur.patches[0]; ell(c, -160, -180, 90, 110); c.fill(); c.fillStyle = fur.patches[1]; ell(c, 170, -90, 80, 90); c.fill(); }
  c.restore();
  // Pattes
  const pawCol = fur.mask ? fur.dark : fur.patches ? '#FFFFFF' : fur.light;
  [-75, 75].forEach(px => { ell(c, px, -10, 62, 38); c.fillStyle = pawCol; c.fill(); c.lineWidth = 9; c.strokeStyle = outline; c.stroke();
    c.lineWidth = 5; [-18, 0, 18].forEach(d => { c.beginPath(); c.moveTo(px + d, -8); c.lineTo(px + d, 14); c.stroke(); }); });

  // ---------- Cou (accessoires portés sur le corps) ----------
  drawNeck(c, acc.cou, t);

  // ---------- Tête ----------
  c.save();
  c.translate(0, -420);
  c.rotate(tilt + (emo === 'suspicieux' ? Math.sin(t * 1.5) * 0.04 : 0));
  // Oreilles
  const earFlop = emo === 'pleure' || emo === 'dodo' ? 0.35 : emo === 'colere' ? 0.25 : 0;
  [-1, 1].forEach(side => {
    c.save(); c.scale(side, 1); c.rotate(earFlop);
    c.beginPath(); c.moveTo(-205, -70); c.lineTo(-180, -265); c.lineTo(-55, -165); c.closePath();
    c.fillStyle = fur.mask ? fur.dark : fur.base; c.fill(); c.lineWidth = 10; c.strokeStyle = outline; c.stroke();
    c.beginPath(); c.moveTo(-180, -95); c.lineTo(-168, -215); c.lineTo(-90, -155); c.closePath();
    c.fillStyle = '#FF9FB2'; c.fill();
    c.restore();
  });
  // Crâne
  ell(c, 0, 0, 238, 198); c.fillStyle = fur.base; c.fill(); c.lineWidth = 10; c.strokeStyle = outline; c.stroke();
  c.save(); ell(c, 0, 0, 238, 198); c.clip();
  if (fur.mask) { const g = c.createRadialGradient(0, 40, 20, 0, 40, 200); g.addColorStop(0, fur.dark); g.addColorStop(0.55, fur.dark + 'CC'); g.addColorStop(1, fur.base + '00'); c.fillStyle = g; c.fillRect(-240, -200, 480, 400); }
  if (fur.patches) { c.fillStyle = fur.patches[0]; ell(c, -150, -90, 120, 100); c.fill(); c.fillStyle = fur.patches[1]; ell(c, 170, -110, 100, 90); c.fill(); }
  if (fur.stripes) { c.strokeStyle = fur.dark; c.lineWidth = 15; [-45, 0, 45].forEach(d => { c.beginPath(); c.moveTo(d, -195); c.lineTo(d * 0.8, -120); c.stroke(); });
    [-1, 1].forEach(sd => { for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(sd * 240, -10 + k * 45); c.lineTo(sd * 185, -5 + k * 45); c.stroke(); } }); }
  // museau clair
  ell(c, 0, 70, 120, 85); c.fillStyle = fur.mask ? 'rgba(0,0,0,0)' : fur.light; c.fill();
  c.restore();

  // Joues roses
  if (['amour', 'rire', 'gourmand'].includes(emo)) { c.fillStyle = 'rgba(255,90,130,0.45)'; ell(c, -150, 55, 42, 26); c.fill(); ell(c, 150, 55, 42, 26); c.fill(); }
  // Teinte de colère
  if (emo === 'colere') { c.save(); ell(c, 0, 0, 238, 198); c.clip(); c.fillStyle = `rgba(255,30,30,${0.18 + 0.1 * Math.sin(t * 10)})`; c.fillRect(-240, -200, 480, 400); c.restore(); }

  drawEyes(c, emo, t, o.local || 0, o.look || 0);
  drawMouth(c, emo, t, o.talk || 0);

  // Moustaches
  c.strokeStyle = 'rgba(30,20,25,0.85)'; c.lineWidth = 5;
  [-1, 1].forEach(sd => { [-14, 6, 26].forEach((dy, k) => { c.beginPath(); c.moveTo(sd * 95, 55 + dy * 0.5); c.quadraticCurveTo(sd * 190, 40 + dy, sd * 285, 30 + dy * 1.6 + (k - 1) * 6 + Math.sin(t * 3 + k) * 3); c.stroke(); }); });

  drawFace(c, acc.visage, t, emo);
  drawHat(c, acc.tete, t);
  drawEmotionExtras(c, emo, t, o.local || 0);
  c.restore(); // tête
  c.restore();
}

/* ---------- Yeux ---------- */
function drawEyes(c, emo, t, local, look) {
  const blink = (t % 3.7) < 0.12 && !['choque', 'panique'].includes(emo);
  const ex = 92, ey = -10;
  const white = (x, rx, ry) => { ell(c, x, ey, rx, ry); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 7; c.strokeStyle = '#1E1419'; c.stroke(); };
  const pupil = (x, rx, ry, dx = 0, dy = 0) => { ell(c, x + dx, ey + dy, rx, ry); c.fillStyle = '#1E1419'; c.fill(); ell(c, x + dx - rx * 0.35, ey + dy - ry * 0.4, rx * 0.32, ry * 0.25); c.fillStyle = '#FFFFFF'; c.fill(); };
  const closedArc = (x, up) => { c.beginPath(); if (up) c.arc(x, ey + 15, 42, Math.PI * 1.1, Math.PI * 1.9); else c.arc(x, ey - 20, 42, Math.PI * 0.15, Math.PI * 0.85); c.lineWidth = 11; c.strokeStyle = '#1E1419'; c.stroke(); };


  if (blink && !['dodo', 'rire', 'fier', 'amour'].includes(emo)) { [-ex, ex].forEach(x => { c.beginPath(); c.moveTo(x - 42, ey); c.quadraticCurveTo(x, ey + 14, x + 42, ey); c.lineWidth = 10; c.strokeStyle = '#1E1419'; c.stroke(); }); return; }

  switch (emo) {
    case 'choque': case 'panique': {
      const k = 1 + 0.25 * Math.max(0, 1 - local / 0.3);
      [-ex, ex].forEach(x => { white(x, 62 * k, 72 * k); pupil(x, 9, 9, Math.sin(t * 30) * (emo === 'panique' ? 6 : 1)); });
      c.lineWidth = 10; c.strokeStyle = '#1E1419';
      [-ex, ex].forEach(x => { c.beginPath(); c.moveTo(x - 45, ey - 105); c.quadraticCurveTo(x, ey - 135, x + 45, ey - 105); c.stroke(); });
      break;
    }
    case 'malicieux': {
      [-ex, ex].forEach((x, i) => { white(x, 50, 52); pupil(x, 22, 30, i ? 6 : 6, 6); });
      [-ex, ex].forEach((x, i) => lidBar(c, x, ey, 50, 52, 0.5, i ? -0.18 : 0.18));
      break;
    }
    case 'colere': {
      [-ex, ex].forEach(x => { white(x, 48, 46); ell(c, x, ey + 4, 8, 30); c.fillStyle = '#1E1419'; c.fill(); });
      c.lineWidth = 16; c.strokeStyle = '#1E1419';
      [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * (ex + 55), ey - 75); c.lineTo(sd * (ex - 45), ey - 40); c.stroke(); });
      break;
    }
    case 'dodo': [-ex, ex].forEach(x => closedArc(x, false)); break;
    case 'rire': case 'fier': [-ex, ex].forEach(x => closedArc(x, true)); break;
    case 'amour': {
      const p = 1 + Math.sin(t * 8) * 0.08;
      [-ex, ex].forEach(x => heart(c, x, ey + 5, 52 * p, '#FF2D6F'));
      break;
    }
    case 'pleure': {
      [-ex, ex].forEach(x => { white(x, 56, 62); pupil(x, 30, 38, 0, 8); ell(c, x, ey + 30, 50, 22); c.fillStyle = 'rgba(80,170,255,0.55)'; c.fill(); });
      c.lineWidth = 9; c.strokeStyle = '#1E1419';
      [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * (ex + 45), ey - 80); c.lineTo(sd * (ex - 40), ey - 100); c.stroke(); });
      break;
    }
    case 'gourmand': {
      [-ex, ex].forEach(x => { white(x, 56, 62); pupil(x, 34, 44, 0, 4); star(c, x - 8, ey - 4, 14, '#FFFFFF'); });
      break;
    }
    case 'suspicieux': {
      const d = Math.sin(t * 2) > 0 ? 14 : -14;
      white(-ex, 50, 52); pupil(-ex, 20, 26, d, 4);
      white(ex, 50, 52); pupil(ex, 20, 26, d, 4);
      lidBar(c, -ex, ey, 50, 52, 0.55, 0.08);
      c.lineWidth = 11; c.strokeStyle = '#1E1419'; c.beginPath(); c.moveTo(ex - 45, ey - 85); c.quadraticCurveTo(ex, ey - 120, ex + 45, ey - 90); c.stroke();
      break;
    }
    default: {
      [-ex, ex].forEach(x => { white(x, 50, 56); pupil(x, 30, 40, look * 12, 4); });
    }
  }
}

/** Paupière : couvre la partie haute de l'œil (regard malicieux / suspicieux). */
function lidBar(c, x, y, rx, ry, frac, slant) {
  c.save();
  ell(c, x, y, rx + 1, ry + 1); c.clip();
  c.translate(x, y); c.rotate(slant);
  c.fillStyle = 'rgba(40,25,30,0.92)';
  c.fillRect(-rx - 20, -ry - 20, rx * 2 + 40, (ry * 2 + 20) * frac);
  c.restore();
  c.save(); c.translate(x, y); c.rotate(slant);
  c.beginPath(); c.moveTo(-rx - 4, -ry + (ry * 2 + 20) * frac - 20); c.lineTo(rx + 4, -ry + (ry * 2 + 20) * frac - 20);
  c.lineWidth = 10; c.strokeStyle = '#1E1419'; c.stroke(); c.restore();
}

/* ---------- Bouche ---------- */
function drawMouth(c, emo, t, talk) {
  // Nez
  c.beginPath(); c.moveTo(-22, 32); c.lineTo(22, 32); c.lineTo(0, 54); c.closePath();
  c.fillStyle = '#FF7A95'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#1E1419'; c.stroke();
  c.lineWidth = 7; c.strokeStyle = '#1E1419';
  const open = (w, h, tongue = true) => {
    c.beginPath(); c.ellipse(0, 70 + h * 0.5, w, Math.max(4, h), 0, 0, TAU);
    c.fillStyle = '#5A1225'; c.fill(); c.stroke();
    if (tongue && h > 14) { c.save(); c.clip(); ell(c, 0, 70 + h * 1.25, w * 0.65, h * 0.6); c.fillStyle = '#FF6F8E'; c.fill(); c.restore(); }
  };
  if (talk > 0.05) { open(30 + talk * 18, 8 + talk * 34); return; }
  switch (emo) {
    case 'choque': case 'panique': open(38, 46 + Math.sin(t * 20) * (emo === 'panique' ? 8 : 2)); break;
    case 'rire': open(62, 44); break;
    case 'colere': {
      c.beginPath(); c.moveTo(-60, 92); c.quadraticCurveTo(0, 60, 60, 92); c.closePath(); c.fillStyle = '#5A1225'; c.fill(); c.stroke();
      c.fillStyle = '#FFFFFF'; [-30, 30].forEach(x => { c.beginPath(); c.moveTo(x - 10, 78); c.lineTo(x + 10, 78); c.lineTo(x, 100); c.closePath(); c.fill(); });
      break;
    }
    case 'pleure': c.beginPath(); c.moveTo(-45, 95); c.quadraticCurveTo(-22, 70 + Math.sin(t * 14) * 4, 0, 88); c.quadraticCurveTo(22, 70 + Math.cos(t * 14) * 4, 45, 95); c.stroke(); break;
    case 'malicieux': case 'fier': c.beginPath(); c.moveTo(-50, 72); c.quadraticCurveTo(10, 110, 62, 60); c.stroke(); break;
    case 'gourmand': {
      wMouth(c);
      ell(c, 14, 100, 22, 30); c.fillStyle = '#FF6F8E'; c.fill(); c.lineWidth = 5; c.stroke();
      const d = (t * 0.9) % 1; ell(c, -40, 100 + d * 70, 9, 13); c.fillStyle = `rgba(120,200,255,${1 - d})`; c.fill();
      break;
    }
    case 'suspicieux': c.beginPath(); c.moveTo(-40, 85); c.lineTo(40, 80); c.stroke(); break;
    case 'dodo': ell(c, 0, 80, 10, 8); c.stroke(); break;
    default: wMouth(c);
  }
}
function wMouth(c) { c.beginPath(); c.moveTo(-48, 66); c.quadraticCurveTo(-24, 96, 0, 66); c.quadraticCurveTo(24, 96, 48, 66); c.stroke(); }

/* ---------- Extras d'émotion ---------- */
function drawEmotionExtras(c, emo, t, local) {
  if (emo === 'dodo') {
    c.font = '900 70px "Luckiest Guy", sans-serif'; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#1E1419'; c.lineWidth = 8;
    for (let k = 0; k < 3; k++) { const p = (t * 0.5 + k / 3) % 1; const x = 190 + p * 120, y = -170 - p * 220; c.globalAlpha = 1 - p; c.font = `900 ${50 + k * 18}px "Luckiest Guy", sans-serif`; c.strokeText('Z', x, y); c.fillText('Z', x, y); }
    c.globalAlpha = 1;
  }
  if (emo === 'pleure') {
    c.fillStyle = 'rgba(70,160,255,0.85)';
    [-1, 1].forEach(sd => { for (let k = 0; k < 4; k++) { const p = (t * 1.4 + k / 4) % 1; ell(c, sd * (110 + p * 60), 40 + p * 260, 14, 20); c.fill(); } });
  }
  if (emo === 'choque' || emo === 'panique') {
    const p = (t * 1.2) % 1;
    drop(c, 210, -120 + p * 90, 1 - p * 0.6);
    if (emo === 'panique') drop(c, -220, -100 + ((t * 1.5 + 0.5) % 1) * 90, 0.9);
    if (local < 0.5) { c.save(); c.globalAlpha = 1 - local * 2; c.strokeStyle = '#FFE14D'; c.lineWidth = 12;
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 280, Math.sin(a) * 240); c.lineTo(Math.cos(a) * 340, Math.sin(a) * 300); c.stroke(); } c.restore(); }
  }
  if (emo === 'colere') {
    for (let k = 0; k < 2; k++) { const p = (t * 1.3 + k * 0.5) % 1; c.globalAlpha = 1 - p; c.fillStyle = '#FFFFFF';
      [-1, 1].forEach(sd => { ell(c, sd * (170 + p * 40), -200 - p * 150, 30 + p * 30, 22 + p * 20); c.fill(); }); }
    c.globalAlpha = 1;
    angerMark(c, 150, -150, 1 + Math.sin(t * 12) * 0.1);
  }
  if (emo === 'amour') { for (let k = 0; k < 4; k++) { const p = (t * 0.6 + k / 4) % 1; c.globalAlpha = 1 - p; heart(c, Math.sin(k * 2.3) * 230, -180 - p * 260, 26 + k * 4, '#FF4F8B'); } c.globalAlpha = 1; }
  if (emo === 'fier' || emo === 'gourmand') { const p = (t * 2) % 1; star(c, -230, -180, 18 + p * 10, '#FFE14D'); star(c, 240, -60, 14 + (1 - p) * 10, '#FFE14D'); }
  if (emo === 'suspicieux') { c.font = '900 110px "Luckiest Guy", sans-serif'; c.fillStyle = '#FFE14D'; c.strokeStyle = '#1E1419'; c.lineWidth = 10; const y = -230 + Math.sin(t * 3) * 10; c.strokeText('?', 220, y); c.fillText('?', 220, y); }
}
function drop(c, x, y, a = 1) { c.save(); c.globalAlpha = a; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 26, y + 6, x, y + 22); c.quadraticCurveTo(x - 26, y + 6, x, y - 34); c.fillStyle = '#7CC8FF'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#1E1419'; c.stroke(); c.restore(); }
function angerMark(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#FF2D2D'; c.lineWidth = 12;
  for (let k = 0; k < 4; k++) { c.save(); c.rotate(k * Math.PI / 2); c.beginPath(); c.moveTo(10, -30); c.quadraticCurveTo(12, -12, 30, -10); c.stroke(); c.restore(); } c.restore(); }
export function heart(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s / 50, s / 50);
  c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-60, -20, -30, -62, 0, -30); c.bezierCurveTo(30, -62, 60, -20, 0, 18); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1E1419'; c.stroke(); c.restore();
}
export function star(c, x, y, r, col) {
  c.save(); c.translate(x, y); c.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = i % 2 ? r * 0.35 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = col; c.fill(); c.restore();
}

/* ---------- Accessoires ---------- */
function drawHat(c, k, t) {
  if (!k || k === 'aucun') return;
  c.lineWidth = 9; c.strokeStyle = '#1E1419';
  switch (k) {
    case 'bonnet_nuit': {
      const flop = Math.sin(t * 2) * 20;
      c.beginPath(); c.moveTo(-170, -150); c.quadraticCurveTo(-40, -330, 120 + flop, -300); c.quadraticCurveTo(260 + flop, -260, 250 + flop, -150); c.quadraticCurveTo(150, -200, 170, -150); c.closePath();
      c.fillStyle = '#4F6BFF'; c.fill(); c.stroke();
      c.fillStyle = '#FFE14D'; [[-60, -220], [40, -260], [120, -200]].forEach(([x, y]) => star(c, x, y, 18, '#FFE14D'));
      ell(c, 0, -150, 185, 30); c.fillStyle = '#FFFFFF'; c.fill(); c.stroke();
      ell(c, 255 + flop, -140, 32, 32); c.fill(); c.stroke();
      break;
    }
    case 'toque': {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.rect(-120, -260, 240, 110); c.fill(); c.stroke();
      [[-90, -300], [0, -330], [90, -300]].forEach(([x, y]) => { ell(c, x, y, 85, 75); c.fill(); c.stroke(); });
      c.fillRect(-115, -300, 230, 140);
      c.beginPath(); c.moveTo(-120, -150); c.lineTo(120, -150); c.stroke();
      break;
    }
    case 'haut_de_forme': {
      c.fillStyle = '#16161C';
      ell(c, 0, -165, 200, 34); c.fill(); c.stroke();
      c.beginPath(); c.rect(-115, -420, 230, 255); c.fill(); c.stroke();
      c.fillStyle = '#E8213C'; c.fillRect(-113, -230, 226, 42);
      ell(c, 0, -420, 115, 22); c.fillStyle = '#2A2A33'; c.fill(); c.stroke();
      break;
    }
    case 'bonnet': {
      c.fillStyle = '#1C1C22';
      c.beginPath(); c.moveTo(-200, -120); c.quadraticCurveTo(-190, -330, 0, -330); c.quadraticCurveTo(190, -330, 200, -120); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#2E2E36'; c.fillRect(-205, -170, 410, 60); c.strokeRect(-205, -170, 410, 60);
      break;
    }
    case 'chapeau_paille': {
      ell(c, 0, -150, 300, 55); c.fillStyle = '#F2C66D'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-140, -160); c.quadraticCurveTo(-130, -300, 0, -300); c.quadraticCurveTo(130, -300, 140, -160); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#FF4F8B'; c.fillRect(-138, -200, 276, 34);
      break;
    }
    case 'bandeau': {
      c.fillStyle = '#FF2D55'; c.beginPath(); c.moveTo(-232, -60); c.quadraticCurveTo(0, -150, 232, -60); c.lineTo(228, -10); c.quadraticCurveTo(0, -100, -228, -10); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(225, -40); c.lineTo(300, -10 + Math.sin(t * 6) * 15); c.lineTo(290, 30 + Math.sin(t * 6) * 15); c.closePath(); c.fill(); c.stroke();
      break;
    }
    case 'couronne': {
      c.fillStyle = '#FFCC2E';
      c.beginPath(); c.moveTo(-150, -150); c.lineTo(-160, -300); c.lineTo(-80, -220); c.lineTo(0, -320); c.lineTo(80, -220); c.lineTo(160, -300); c.lineTo(150, -150); c.closePath(); c.fill(); c.stroke();
      [[-80, -180, '#FF2D55'], [0, -190, '#2EE6FF'], [80, -180, '#3CFF6B']].forEach(([x, y, col]) => { ell(c, x, y, 16, 16); c.fillStyle = col; c.fill(); c.lineWidth = 5; c.stroke(); });
      break;
    }
  }
}

function drawFace(c, k, t, emo) {
  if (!k || k === 'aucun') return;
  c.lineWidth = 9; c.strokeStyle = '#1E1419';
  switch (k) {
    case 'lunettes_soleil': {
      // Réaction exagérée : les lunettes glissent et les yeux apparaissent
      if (['choque', 'panique', 'amour', 'pleure', 'gourmand'].includes(emo)) { c.translate(0, 78); c.rotate(0.06); }
      c.fillStyle = '#0D0D12';
      [-92, 92].forEach(x => { c.beginPath(); c.roundRect(x - 75, -60, 150, 95, 26); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(x - 50, -45); c.lineTo(x - 20, -45); c.lineTo(x - 50, 0); c.closePath(); c.fill(); c.fillStyle = '#0D0D12'; });
      c.beginPath(); c.moveTo(-18, -30); c.quadraticCurveTo(0, -45, 18, -30); c.stroke();
      break;
    }
    case 'lunettes_rondes': {
      c.lineWidth = 11;
      [-92, 92].forEach(x => { ell(c, x, -10, 68, 68); c.stroke(); c.fillStyle = 'rgba(180,230,255,0.18)'; c.fill(); });
      c.beginPath(); c.moveTo(-26, -20); c.quadraticCurveTo(0, -40, 26, -20); c.stroke();
      break;
    }
    case 'monocle': {
      c.strokeStyle = '#D9A400'; c.lineWidth = 11; ell(c, 92, -10, 70, 70); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(150, 30); c.quadraticCurveTo(190, 160, 120, 250); c.stroke();
      break;
    }
    case 'masque': {
      c.fillStyle = '#0D0D12';
      c.beginPath(); c.moveTo(-240, -40); c.quadraticCurveTo(0, -110, 240, -40); c.lineTo(235, 40); c.quadraticCurveTo(0, 0, -235, 40); c.closePath(); c.fill();
      // les yeux restent visibles
      if (!['dodo', 'rire', 'fier', 'amour'].includes(emo)) {
        [-92, 92].forEach(x => { ell(c, x, -10, 40, 36); c.fillStyle = '#FFFFFF'; c.fill(); ell(c, x + 6, -6, 16, 20); c.fillStyle = '#1E1419'; c.fill(); });
      }
      c.beginPath(); c.moveTo(235, 0); c.lineTo(300, 30 + Math.sin(t * 5) * 15); c.lineTo(290, 70 + Math.sin(t * 5) * 15); c.closePath(); c.fillStyle = '#0D0D12'; c.fill();
      break;
    }
  }
}

function drawNeck(c, k, t) {
  if (!k || k === 'aucun') return;
  c.lineWidth = 8; c.strokeStyle = '#1E1419';
  switch (k) {
    case 'cravate': {
      c.fillStyle = '#E8213C';
      c.beginPath(); c.moveTo(-30, -300); c.lineTo(30, -300); c.lineTo(18, -268); c.lineTo(-18, -268); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-18, -268); c.lineTo(18, -268); c.lineTo(48, -110); c.lineTo(0, -60); c.lineTo(-48, -110); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 8; c.beginPath(); c.moveTo(-25, -200); c.lineTo(28, -170); c.moveTo(-35, -150); c.lineTo(35, -120); c.stroke();
      break;
    }
    case 'echarpe': {
      const cols = ['#1F3FBF', '#FFFFFF', '#E8213C'];
      cols.forEach((col, i) => { c.save(); c.beginPath(); c.moveTo(-200 + i * 40, -330); c.lineTo(-160 + i * 40, -330); c.lineTo(230 + i * 40 - 120, -10); c.lineTo(190 + i * 40 - 120, -10); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.stroke(); c.restore(); });
      ell(c, 115, -20, 30, 20); c.fillStyle = '#FFCC2E'; c.fill(); c.stroke();
      break;
    }
    case 'chaine_or': {
      c.strokeStyle = '#FFCC2E'; c.lineWidth = 14; c.setLineDash([16, 8]);
      c.beginPath(); c.moveTo(-120, -320); c.quadraticCurveTo(0, -120, 120, -320); c.stroke(); c.setLineDash([]);
      ell(c, 0, -190, 50, 50); c.fillStyle = '#FFCC2E'; c.fill(); c.lineWidth = 7; c.strokeStyle = '#1E1419'; c.stroke();
      c.font = '900 60px "Luckiest Guy", sans-serif'; c.fillStyle = '#B07C00'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 0, -186);
      break;
    }
    case 'noeud_pap': {
      c.fillStyle = '#E8213C';
      c.beginPath(); c.moveTo(0, -300); c.lineTo(-80, -345); c.lineTo(-80, -255); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -300); c.lineTo(80, -345); c.lineTo(80, -255); c.closePath(); c.fill(); c.stroke();
      ell(c, 0, -300, 22, 22); c.fill(); c.stroke();
      break;
    }
    case 'bavoir': {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.moveTo(-120, -320); c.quadraticCurveTo(0, -260, 120, -320); c.quadraticCurveTo(140, -120, 0, -90); c.quadraticCurveTo(-140, -120, -120, -320); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#2EA8FF'; c.beginPath(); c.ellipse(-10, -190, 45, 22, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(30, -190); c.lineTo(65, -215); c.lineTo(65, -165); c.closePath(); c.fill();
      break;
    }
  }
}
