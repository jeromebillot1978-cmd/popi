/**
 * Lecteur : synchronise rendu canvas + audio (horloge Web Audio),
 * et exporte la vidéo (MediaRecorder, MP4 si le navigateur le permet, sinon WebM).
 */
import { audio } from './audio.js';
import { speakBrowser } from './voice.js';

const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.640028,mp4a.40.2',
  'video/mp4;codecs=avc1.4D401F,mp4a.40.2',
  'video/mp4;codecs=avc1.42E01F,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4;codecs=avc3.42E01F,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];
export function bestMime() {
  if (!window.MediaRecorder) return null;
  return MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) || null;
}

export class Player {
  constructor(renderer, { onTime, onEnd, getOpts }) {
    this.r = renderer; this.onTime = onTime; this.onEnd = onEnd; this.getOpts = getOpts;
    this.tl = null; this.project = null; this.playing = false; this.t = 0; this.raf = 0; this.timers = [];
  }

  load(tl, project) { this.stop(); this.tl = tl; this.project = project; this.t = 0; this.draw(0); }
  setProject(project) { this.project = project; if (!this.playing) this.draw(this.t); }
  draw(t) { this.t = t; return this.r.render(t, this.tl, this.project, this.getOpts()); }
  seek(t) { if (this.playing) this.stop(); this.draw(t); this.onTime && this.onTime(t, this.tl); }

  /** Lecture (aperçu) ou enregistrement (export). */
  play({ record = false, from = 0, settings } = {}) {
    if (!this.tl) return Promise.resolve(null);
    this.stop();
    const ctx = audio.ensure();
    const ses = audio.openSession();
    const tl = this.tl;
    if (from >= tl.duration - 0.05) from = 0;
    const lead = record ? 0.35 : 0.08;
    const t0 = ctx.currentTime + lead - from; // temps audio correspondant à t = 0
    this.t0 = t0; this.playing = true;

    // Voix
    const duck = [];
    tl.beats.forEach(b => {
      const v = b.voice;
      if (b.end <= from) return;
      if (v && v.buffer) {
        const rel = Math.max(0, from - b.start);
        const src = ctx.createBufferSource(); src.buffer = v.buffer; src.playbackRate.value = v.rate || 1;
        src.connect(ses.voice);
        src.start(t0 + b.start + rel, rel * (v.rate || 1));
        audio.track(src);
        duck.push([t0 + b.start, t0 + b.start + v.dur]);
      } else if (settings && settings.engine === 'navigateur' && !record && b.start >= from - 0.05) {
        const ms = (t0 + b.start - ctx.currentTime) * 1000;
        this.timers.push(setTimeout(() => { if (this.playing) { speechSynthesis.cancel(); speakBrowser(b, settings, this.project.viral); } }, Math.max(0, ms)));
      }
    });
    // Effets sonores
    tl.sfx.forEach(s => { if (s.t >= from) audio.sfx(s.name, t0 + s.t, ses.sfx); });
    // Musique
    if (settings && settings.music && settings.music !== 'aucune') {
      audio.music(settings.music, t0 + from, tl.duration - from, ses.music);
      audio.duck(duck);
    }

    let recorder = null, chunks = [], mime = null;
    const done = new Promise(resolve => { this._resolve = resolve; });
    if (record) {
      mime = bestMime();
      if (!mime) { this.stop(); return Promise.reject(new Error("Ton navigateur ne permet pas l'export vidéo. Utilise Chrome, Edge ou Firefox récent.")); }
      const fps = 30;
      const vStream = this.r.canvas.captureStream(fps);
      this._vStream = vStream;
      const stream = new MediaStream([...vStream.getVideoTracks(), ...audio.stream.getAudioTracks()]);
      const hd = this.r.canvas.width >= 1000;
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: hd ? 9_000_000 : 5_500_000, audioBitsPerSecond: 160_000 });
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        vStream.getTracks().forEach(tr => tr.stop());
        const type = mime.split(';')[0];
        this._resolve({ blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm' });
      };
      recorder.start(250);
      this.recorder = recorder;
    }

    const tick = () => {
      if (!this.playing) return;
      const t = ctx.currentTime - t0;
      if (t >= tl.duration) { this.finish(); return; }
      this.draw(Math.max(from, t));
      this.onTime && this.onTime(Math.max(from, t), tl);
      this.raf = document.hidden ? setTimeout(tick, 33) : requestAnimationFrame(tick);
    };
    this.draw(from);
    tick();
    if (!record) this._resolve(null);
    return done;
  }

  finish() {
    const rec = this.recorder;
    this.playing = false;
    cancelAnimationFrame(this.raf); clearTimeout(this.raf);
    this.timers.forEach(clearTimeout); this.timers = [];
    this.draw(this.tl.duration - 0.001);
    setTimeout(() => audio.closeSession(), 200);
    if (rec && rec.state !== 'inactive') setTimeout(() => rec.stop(), 150);
    this.recorder = null;
    this.onEnd && this.onEnd(!!rec);
  }

  stop() {
    const was = this.playing;
    this.playing = false;
    cancelAnimationFrame(this.raf); clearTimeout(this.raf);
    this.timers.forEach(clearTimeout); this.timers = [];
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    audio.closeSession();
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.ondataavailable = null; this.recorder.onstop = null; this.recorder.stop();
      if (this._vStream) this._vStream.getTracks().forEach(tr => tr.stop());
      this._resolve && this._resolve(null);
    }
    this.recorder = null;
    if (was && this.onEnd) this.onEnd(false, true);
  }
}
