/**
 * Décors dessinés (statiques mis en cache + animations légères).
 * Repère logique : 1080 × 1920, marge de 260 px pour les mouvements de caméra.
 */
export const W = 1080, H = 1920, M = 260;
const TAU = Math.PI * 2;
const OUT = '#1E1419';

const lg = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
const box = (c, x, y, w, h, fill, r = 0, lw = 8) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = OUT; c.stroke(); } };
const circ = (c, x, y, r, fill, lw = 0) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = OUT; c.stroke(); } };
const txt = (c, s, x, y, size, fill, stroke = OUT, lw = 0, font = '"Luckiest Guy", "Fredoka", sans-serif') => {
  c.font = `${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = fill; c.fillText(s, x, y);
};
const floor = (c, y, col1, col2, planks = true) => {
  c.fillStyle = lg(c, y, H + M, [[0, col1], [1, col2]]); c.fillRect(-M, y, W + 2 * M, H + M - y);
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(-M, y, W + 2 * M, 14);
  if (planks) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 4; for (let k = 1; k < 6; k++) { const yy = y + k * k * 22; c.beginPath(); c.moveTo(-M, yy); c.lineTo(W + M, yy); c.stroke(); } }
};
const windowSky = (c, x, y, w, h, night = false) => {
  box(c, x - 16, y - 16, w + 32, h + 32, '#FFFFFF', 18, 8);
  c.fillStyle = night ? lg(c, y, y + h, [[0, '#0B1240'], [1, '#33246B']]) : lg(c, y, y + h, [[0, '#6FD3FF'], [1, '#C8F1FF']]);
  c.fillRect(x, y, w, h);
  if (night) { circ(c, x + w * 0.7, y + h * 0.3, 40, '#FFF6C9'); } else { [[0.3, 0.35], [0.7, 0.6]].forEach(([a, b]) => { circ(c, x + w * a, y + h * b, 34, '#FFFFFF'); circ(c, x + w * a + 40, y + h * b + 6, 28, '#FFFFFF'); circ(c, x + w * a - 36, y + h * b + 8, 24, '#FFFFFF'); }); }
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 14; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
};
const skyline = (c, yBase, col, lit = false, seed = 3) => {
  let x = -M;
  let k = seed;
  while (x < W + M) {
    k = (k * 9301 + 49297) % 233280; const w = 90 + (k % 90); const h = 220 + (k % 380);
    c.fillStyle = col; c.fillRect(x, yBase - h, w, h + 400);
    if (lit) { c.fillStyle = '#FFE27A'; for (let yy = yBase - h + 30; yy < yBase - 40; yy += 56) for (let xx = x + 16; xx < x + w - 24; xx += 36) { if (((xx * 7 + yy * 13) | 0) % 5 < 2) c.fillRect(xx, yy, 18, 26); } }
    x += w + 8;
  }
};
const plant = (c, x, y) => {
  c.fillStyle = '#2FAF5F'; [[-50, -150, -0.5], [0, -190, 0], [50, -150, 0.5], [-25, -120, -0.25], [25, -120, 0.25]].forEach(([dx, dy, r]) => { c.save(); c.translate(x + dx * 0.3, y - 60); c.rotate(r); c.beginPath(); c.ellipse(0, dy / 2, 26, -dy / 2, 0, 0, TAU); c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.restore(); });
  box(c, x - 55, y - 80, 110, 100, '#E8743B', 14);
};

/* ---------- Peintres statiques ---------- */
const PAINT = {
  salon(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#FFC98F'], [1, '#FFE3C2']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    c.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = -M; x < W + M; x += 120) c.fillRect(x, -M, 50, 1440 + M);
    windowSky(c, 120, 330, 330, 420);
    box(c, 640, 360, 280, 200, '#7C5CFF', 10); txt(c, '🐟', 780, 460, 120, '#FFFFFF');
    box(c, -80, 1080, 1240, 290, '#E8434F', 60); box(c, -40, 980, 1160, 180, '#FF6670', 60);
    floor(c, 1440, '#C98A55', '#8C5A33');
    plant(c, 1000, 1440);
    c.fillStyle = '#FFE14D'; c.beginPath(); c.moveTo(60, 820); c.lineTo(170, 820); c.lineTo(140, 900); c.lineTo(90, 900); c.closePath(); c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke();
    c.fillStyle = OUT; c.fillRect(110, 900, 10, 180);
  },
  cuisine(c) {
    c.fillStyle = '#E9FBFF'; c.fillRect(-M, -M, W + 2 * M, 1460 + M);
    for (let y = 600; y < 1100; y += 70) for (let x = -M; x < W + M; x += 70) { c.fillStyle = ((x + y) / 70) % 2 ? '#BFEFFF' : '#FFFFFF'; c.fillRect(x, y, 70, 70); }
    box(c, 760, 220, 300, 980, '#F4F7FA', 30); c.fillStyle = OUT; c.fillRect(790, 560, 240, 8); box(c, 800, 380, 26, 120, '#9AA3B2', 8, 4); box(c, 800, 640, 26, 160, '#9AA3B2', 8, 4);
    box(c, -100, 1080, 860, 380, '#F39A3D', 16); box(c, -110, 1050, 880, 50, '#FFFFFF', 12);
    [[150, 380], [300, 340], [450, 390]].forEach(([x, r]) => { c.strokeStyle = OUT; c.lineWidth = 6; c.beginPath(); c.moveTo(x, 200); c.lineTo(x, r - 60); c.stroke(); circ(c, x, r, 60, '#3A3A44', 7); });
    floor(c, 1460, '#FFFFFF', '#D9D9E0', false);
    for (let y = 1460; y < H + M; y += 90) for (let x = -M; x < W + M; x += 90) if (((x + y) / 90) % 2) { c.fillStyle = '#2B2B33'; c.fillRect(x, y, 90, 90); }
  },
  bureau(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#9FB4D9'], [1, '#D4DEEF']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    box(c, 80, 240, 920, 560, '#7FD2FF', 20);
    c.save(); c.beginPath(); c.rect(80, 240, 920, 560); c.clip(); skyline(c, 820, '#5A6E9A', true, 7); c.restore();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 12; [386, 693].forEach(x => { c.beginPath(); c.moveTo(x, 240); c.lineTo(x, 800); c.stroke(); });
    box(c, -60, 1120, 1200, 70, '#8B5A3C', 10); c.fillStyle = '#6B4029'; c.fillRect(-40, 1190, 60, 300); c.fillRect(1060, 1190, 60, 300);
    box(c, 640, 880, 330, 220, '#22232B', 16); box(c, 660, 900, 290, 175, '#2EE6FF', 8, 0); box(c, 780, 1100, 70, 30, '#22232B', 4);
    txt(c, 'RÉUNION 9H', 805, 960, 38, '#1E1419'); txt(c, '🐾', 805, 1025, 60, '#1E1419');
    floor(c, 1440, '#7C8796', '#5A6371', false);
    plant(c, 110, 1120);
  },
  palais(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#F7EBD3'], [1, '#EAD6AE']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    box(c, 260, 260, 560, 640, '#C7A24A', 16); box(c, 290, 290, 500, 580, '#FFF7E6', 10, 6);
    txt(c, '🐈', 540, 560, 260, '#000');
    [[-M, 1], [W + M, -1]].forEach(([x, d]) => { c.fillStyle = '#B5122B'; c.beginPath(); c.moveTo(x, -M); c.lineTo(x + d * 420, -M); c.quadraticCurveTo(x + d * 220, 700, x + d * 330, 1440); c.lineTo(x, 1440); c.closePath(); c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 10; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + d * 90 * k, -M); c.quadraticCurveTo(x + d * 70 * k, 700, x + d * 90 * k, 1440); c.stroke(); } });
    [[110], [970]].forEach(([x]) => { c.fillStyle = '#C7A24A'; c.fillRect(x - 6, 700, 12, 740); ['#1F3FBF', '#FFFFFF', '#E8213C'].forEach((col, i) => { c.fillStyle = col; c.fillRect(x + 6 + i * 40, 720, 40, 170); }); });
    box(c, 360, 1150, 360, 300, '#8B5A3C', 14); circ(c, 540, 1260, 60, '#FFCC2E', 7); txt(c, '🐾', 540, 1262, 70, '#000');
    floor(c, 1440, '#F2F2F2', '#BDBDC7', false);
    c.strokeStyle = 'rgba(0,0,0,0.08)'; c.lineWidth = 5; for (let x = -M; x < W + M; x += 140) { c.beginPath(); c.moveTo(x, 1440); c.lineTo(x - 300, H + M); c.stroke(); }
  },
  restaurant(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#5B1530'], [1, '#8E2747']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    box(c, 640, 300, 360, 470, '#1E2A22', 14); txt(c, 'MENU', 820, 370, 64, '#FFFFFF');
    ['PÂTÉE ......... 400€', 'THON .......... 999€', 'CARTON ....... OFFERT'].forEach((s, i) => txt(c, s, 820, 470 + i * 90, 34, '#FFE27A', OUT, 0, '"Fredoka", sans-serif'));
    [[180, 1120], [540, 1170], [900, 1120]].forEach(([x, y], i) => { if (i === 1) return; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y, 170, 50, 0, 0, TAU); c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); c.fillRect(x - 170, y, 340, 170); c.strokeRect(x - 170, y, 340, 170); box(c, x - 12, y - 110, 24, 80, '#FFF6C9', 6, 5); });
    floor(c, 1440, '#6B3B2A', '#3B1E15');
  },
  plage(c) {
    c.fillStyle = lg(c, -M, 1050, [[0, '#2EA8FF'], [1, '#B9ECFF']]); c.fillRect(-M, -M, W + 2 * M, 1050 + M);
    c.fillStyle = lg(c, 900, 1250, [[0, '#0E8BD9'], [1, '#41C5F0']]); c.fillRect(-M, 960, W + 2 * M, 320);
    c.fillStyle = lg(c, 1250, H + M, [[0, '#FFE29A'], [1, '#F5C76A']]); c.fillRect(-M, 1250, W + 2 * M, H + M - 1250);
    c.save(); c.translate(130, 1250); c.fillStyle = '#9C6B3C'; c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(30, -400, 60, -700); c.lineTo(84, -700); c.quadraticCurveTo(50, -400, 22, 0); c.closePath(); c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke();
    c.fillStyle = '#2FAF5F'; for (let k = 0; k < 6; k++) { c.save(); c.translate(72, -700); c.rotate(-Math.PI / 2 + (k - 2.5) * 0.55); c.beginPath(); c.ellipse(130, 0, 140, 34, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); } c.restore();
    c.save(); c.translate(860, 1330); c.fillStyle = OUT; c.fillRect(-6, -330, 12, 330);
    ['#FF2D55', '#FFFFFF', '#FF2D55', '#FFFFFF'].forEach((col, i) => { c.beginPath(); c.moveTo(0, -340); c.arc(0, -340, 260, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); }); c.restore();
  },
  espace(c) {
    c.fillStyle = lg(c, -M, H + M, [[0, '#05051A'], [0.6, '#1B0F45'], [1, '#3A1A6B']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    circ(c, 860, 420, 150, '#FF8A3D', 8); c.save(); c.translate(860, 420); c.rotate(-0.35); c.beginPath(); c.ellipse(0, 0, 260, 50, 0, 0, TAU); c.lineWidth = 20; c.strokeStyle = '#FFD27A'; c.stroke(); c.restore();
    circ(c, 200, 700, 90, '#C9B79C', 7); [[180, 670, 14], [230, 720, 18], [170, 740, 10]].forEach(([x, y, r]) => circ(c, x, y, r, '#8E7A5E'));
    c.fillStyle = '#6B5BAA'; c.beginPath(); c.ellipse(540, 1700, 900, 380, 0, 0, TAU); c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke();
    [[300, 1520, 60], [760, 1580, 80], [520, 1800, 50]].forEach(([x, y, r]) => { c.fillStyle = '#4E4285'; c.beginPath(); c.ellipse(x, y, r * 1.6, r * 0.6, 0, 0, TAU); c.fill(); });
  },
  coffre(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#0F3D2E'], [1, '#1F6B4F']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    circ(c, 540, 620, 380, '#9AA3B2', 10); circ(c, 540, 620, 300, '#C9D0DB', 8); circ(c, 540, 620, 80, '#6B7484', 8);
    for (let k = 0; k < 6; k++) { c.save(); c.translate(540, 620); c.rotate(k * Math.PI / 3); box(c, -14, -260, 28, 180, '#6B7484', 8, 5); c.restore(); }
    const bar = (x, y) => { c.fillStyle = '#FFCC2E'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 150, y); c.lineTo(x + 130, y - 50); c.lineTo(x + 20, y - 50); c.closePath(); c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); };
    [[-60, 1440], [90, 1440], [10, 1390], [860, 1440], [1010, 1440], [935, 1390]].forEach(([x, y]) => bar(x, y));
    floor(c, 1440, '#2B2B33', '#16161C', false);
  },
  studio(c) {
    c.fillStyle = lg(c, -M, H + M, [[0, '#FF7AC8'], [0.6, '#B36BFF'], [1, '#6A3DE8']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    box(c, 640, 250, 330, 120, '#1E1419', 30); txt(c, '● LIVE', 805, 312, 64, '#FF2D55');
    c.save(); c.translate(160, 1400); c.fillStyle = OUT; c.fillRect(-8, -700, 16, 700); c.beginPath(); c.moveTo(0, 0); c.lineTo(-120, 120); c.moveTo(0, 0); c.lineTo(120, 120); c.lineWidth = 12; c.strokeStyle = OUT; c.stroke();
    box(c, -70, -860, 140, 240, '#22232B', 24); box(c, -56, -846, 112, 212, '#2EE6FF', 14, 0); c.restore();
    floor(c, 1500, '#FFB3E0', '#E07AC0', false);
  },
  nuit(c) {
    c.fillStyle = lg(c, -M, 1400, [[0, '#070B2A'], [1, '#2B1D5C']]); c.fillRect(-M, -M, W + 2 * M, 1400 + M);
    circ(c, 820, 330, 110, '#FFF6C9', 0); circ(c, 860, 300, 100, '#121A45', 0);
    skyline(c, 1380, '#151236', true, 11);
    c.fillStyle = '#2A2440'; c.fillRect(-M, 1380, W + 2 * M, H + M - 1380); c.fillStyle = '#3B3358'; c.fillRect(-M, 1380, W + 2 * M, 30);
  },
  chambre(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#3B2D73'], [1, '#6A4FA8']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    windowSky(c, 640, 300, 320, 380, true);
    box(c, -100, 1000, 700, 140, '#F4F1EC', 30); box(c, -120, 1110, 820, 280, '#FF7AA8', 30); box(c, -130, 940, 60, 500, '#8B5A3C', 10);
    floor(c, 1440, '#8C6AB8', '#5A3F86');
  },
  labo(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#0F4C5C'], [1, '#1F7A8C']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    box(c, 120, 260, 840, 430, '#1E3A2E', 16); ['E = mc😺', '∑ siestes = ∞', 'croquette² > thon'].forEach((s, i) => txt(c, s, 540, 350 + i * 120, 62, '#F4F1EC', OUT, 0, '"Fredoka", sans-serif'));
    box(c, -60, 1120, 1200, 60, '#C9D0DB', 8);
    [[120, '#3CFF6B'], [300, '#FF4FD8'], [820, '#2EE6FF'], [980, '#FFE14D']].forEach(([x, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - 30, 980); c.lineTo(x - 30, 1040); c.lineTo(x - 70, 1120); c.lineTo(x + 70, 1120); c.lineTo(x + 30, 1040); c.lineTo(x + 30, 980); c.closePath(); c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); });
    floor(c, 1440, '#DDE6EA', '#AFC0C7', false);
  },
  internet(c) {
    c.fillStyle = lg(c, -M, H + M, [[0, '#0A0A23'], [1, '#1A1240']]); c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    c.strokeStyle = 'rgba(46,230,255,0.15)'; c.lineWidth = 3; for (let x = -M; x < W + M; x += 80) { c.beginPath(); c.moveTo(x, -M); c.lineTo(x, H + M); c.stroke(); } for (let y = -M; y < H + M; y += 80) { c.beginPath(); c.moveTo(-M, y); c.lineTo(W + M, y); c.stroke(); }
  },
  tribunal(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#7A4A2A'], [1, '#A8683D']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 8; for (let x = -M; x < W + M; x += 150) { c.beginPath(); c.moveTo(x, -M); c.lineTo(x, 1440); c.stroke(); }
    circ(c, 540, 380, 150, '#FFCC2E', 9); txt(c, '⚖️', 540, 385, 170, '#000');
    box(c, 100, 760, 880, 340, '#5A3420', 18); box(c, 80, 720, 920, 60, '#8B5A3C', 10); txt(c, 'COUR SUPRÊME DES CROQUETTES', 540, 930, 46, '#FFE27A', OUT, 0);
    box(c, 160, 1180, 760, 260, '#6B4029', 14);
    floor(c, 1440, '#4A2C1A', '#2E1A0F');
  },
  salle_sport(c) {
    c.fillStyle = lg(c, -M, 1440, [[0, '#3A3A44'], [1, '#5A5A66']]); c.fillRect(-M, -M, W + 2 * M, 1440 + M);
    box(c, 100, 260, 880, 150, '#FF6A1A', 20); txt(c, 'PAS DE SIESTE = PAS DE GAINS', 540, 336, 52, '#FFFFFF', OUT, 8);
    box(c, 140, 480, 800, 560, '#AFC7D9', 10); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(200, 1040); c.lineTo(420, 480); c.lineTo(520, 480); c.lineTo(300, 1040); c.closePath(); c.fill();
    const db = (x, y) => { box(c, x - 90, y - 8, 180, 16, '#9AA3B2', 6, 4); box(c, x - 110, y - 40, 34, 80, '#22232B', 8, 5); box(c, x + 76, y - 40, 34, 80, '#22232B', 8, 5); };
    box(c, -40, 1150, 330, 30, '#8B5A3C', 8); db(130, 1110); box(c, 790, 1150, 330, 30, '#8B5A3C', 8); db(950, 1110);
    floor(c, 1440, '#22232B', '#111118', false);
  },
};

/* ---------- Animations légères par décor ---------- */
const ANIM = {
  plage(c, t) {
    circ(c, 860, 260, 110 + Math.sin(t * 2) * 6, '#FFE14D');
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 8;
    for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = -M; x <= W + M; x += 30) { const y = 1010 + k * 80 + Math.sin(x / 60 + t * 2 + k) * 10; x === -M ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
  },
  espace(c, t) {
    for (let k = 0; k < 70; k++) { const x = (k * 137.5) % (W + 2 * M) - M, y = (k * 241.7) % 1300 - M; const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + k)); c.globalAlpha = a; circ(c, x, y, 2 + (k % 3), '#FFFFFF'); }
    c.globalAlpha = 1;
    c.save(); c.translate(-50 + ((t * 120) % (W + 300)), 900 - ((t * 60) % 500)); c.rotate(-0.7); box(c, -30, -80, 60, 160, '#F4F1EC', 30, 6); c.fillStyle = '#FF6A1A'; c.beginPath(); c.moveTo(-20, 80); c.lineTo(0, 140 + Math.sin(t * 30) * 15); c.lineTo(20, 80); c.fill(); c.restore();
  },
  studio(c, t) {
    c.save(); c.globalAlpha = 0.85 + Math.sin(t * 4) * 0.1; c.lineWidth = 46; c.strokeStyle = '#FFF6E8'; c.beginPath(); c.arc(540, 980, 460, 0, TAU); c.stroke(); c.restore();
  },
  nuit(c, t) { if (Math.sin(t * 1.3) > 0.2) { c.fillStyle = '#FF2D55'; circ(c, 120 + Math.sin(t) * 10, 220, 10, '#FF2D55'); } },
  internet(c, t) {
    c.font = '28px monospace'; c.fillStyle = 'rgba(60,255,107,0.45)'; c.textAlign = 'center';
    for (let k = 0; k < 14; k++) { const x = k * 90 - 40; const y = ((t * 220 + k * 157) % (H + 200)) - 100; c.fillText('10110', x, y); }
    const pop = (x, y, w, h, title, lines, col, ph) => { const s = 1 + Math.sin(t * 3 + ph) * 0.02; c.save(); c.translate(x, y); c.rotate(Math.sin(ph) * 0.06); c.scale(s, s); box(c, 0, 0, w, h, '#F4F7FA', 14); box(c, 0, 0, w, 50, col, 14); txt(c, title, w / 2, 27, 28, '#FFFFFF', OUT, 0, '"Fredoka", sans-serif'); lines.forEach((ln, i) => txt(c, ln, w / 2, 50 + (h - 50) / 2 + (i - (lines.length - 1) / 2) * 38, 32, OUT, OUT, 0, '"Fredoka", sans-serif')); c.restore(); };
    pop(-30, 800, 330, 170, 'ERREUR 404', ['Croquettes', 'introuvables'], '#FF2D55', 0);
    pop(790, 930, 320, 170, 'BRAVO !', ['Vous avez', 'gagné un thon'], '#3C9BFF', 1.3);
    pop(-20, 1290, 300, 150, 'ALERTE', ['Humain détecté 👀'], '#FF9F1A', 2.1);
  },
  cuisine(c, t) { for (let k = 0; k < 3; k++) { const p = (t * 0.6 + k / 3) % 1; c.globalAlpha = 0.5 * (1 - p); circ(c, 300 + Math.sin(t + k) * 30, 300 - p * 200, 30 + p * 40, '#FFFFFF'); } c.globalAlpha = 1; },
  restaurant(c, t) { [180, 900].forEach((x, i) => { const f = 1 + Math.sin(t * 14 + i) * 0.15; c.fillStyle = '#FFB300'; c.beginPath(); c.ellipse(x, 1000, 12 * f, 26 * f, 0, 0, TAU); c.fill(); });
    for (let k = 0; k < 9; k++) { const on = Math.sin(t * 3 + k) > -0.3; circ(c, 60 + k * 120, 140 + Math.sin(k) * 20, 16, on ? '#FFE27A' : '#7A5A3A'); } },
  labo(c, t) { [[120, '#3CFF6B'], [300, '#FF4FD8'], [820, '#2EE6FF'], [980, '#FFE14D']].forEach(([x, col], i) => { const p = (t * 0.9 + i * 0.3) % 1; c.globalAlpha = 1 - p; circ(c, x + Math.sin(t * 4 + i) * 10, 960 - p * 160, 10 + p * 8, col); }); c.globalAlpha = 1; },
  palais(c, t) { c.save(); c.translate(540, -40); c.rotate(Math.sin(t) * 0.02); c.strokeStyle = '#C7A24A'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -200); c.lineTo(0, 80); c.stroke();
    for (let k = -3; k <= 3; k++) { circ(c, k * 60, 120 + Math.abs(k) * -8, 18, '#FFF6C9', 4); } c.restore(); },
};

/* ---------- Cache des décors statiques (à la résolution de rendu, 6 max) ---------- */
const cache = new Map();
let cacheScale = 1;
export function setSceneScale(scale) { if (scale !== cacheScale) { cacheScale = scale; cache.clear(); } }
export function sceneCanvas(name) {
  if (cache.has(name)) { const v = cache.get(name); cache.delete(name); cache.set(name, v); return v; }
  const cv = document.createElement('canvas');
  cv.width = Math.round((W + 2 * M) * cacheScale); cv.height = Math.round((H + 2 * M) * cacheScale);
  const c = cv.getContext('2d');
  c.scale(cacheScale, cacheScale);
  c.translate(M, M);
  (PAINT[name] || PAINT.salon)(c);
  cache.set(name, cv);
  if (cache.size > 6) cache.delete(cache.keys().next().value);
  return cv;
}
export function clearSceneCache() { cache.clear(); }

export function drawScene(c, name, t) {
  c.drawImage(sceneCanvas(name), -M, -M, W + 2 * M, H + 2 * M);
  const a = ANIM[name];
  if (a) a(c, t);
}
