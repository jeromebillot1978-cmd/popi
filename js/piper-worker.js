/* ==========================================================
   Chatastrophe Studio — moteur de voix neuronales (Piper)
   Tourne dans un Web Worker : l'interface ne gèle jamais.

   1. Phonémiseur eSpeak-ng (WebAssembly)  → texte → phonèmes
   2. Modèle neuronal VITS « Piper » (ONNX Runtime Web) → audio 22/44 kHz
   Modèles français libres (rhasspy/piper-voices) téléchargés UNE fois,
   puis gardés dans le cache du navigateur (Cache Storage).
   ========================================================== */
/* global ort, createPiperPhonemize */

const ORT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
const PHON_URL = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/';
const HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/';
const CACHE = 'chatastrophe-voix-v1';

const MODELS = {
  siwis: 'siwis/medium/fr_FR-siwis-medium',
  tom: 'tom/medium/fr_FR-tom-medium',
  upmc: 'upmc/medium/fr_FR-upmc-medium',
};

let libs = null;
let phon = null;           // module eSpeak réutilisable
const sessions = {};       // modèle → { session, config }
let queue = Promise.resolve();

function loadLibs() {
  if (!libs) {
    libs = (async () => {
      importScripts(ORT_URL + 'ort.wasm.min.js', PHON_URL + 'piper_phonemize.js');
      ort.env.wasm.wasmPaths = ORT_URL;
      ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
    })().catch((e) => { libs = null; throw e; });
  }
  return libs;
}

/* ---------- Téléchargement avec progression + cache permanent ---------- */
async function fetchCached(url, onProgress) {
  let cache = null;
  try { cache = await caches.open(CACHE); } catch (e) { /* navigation privée : pas de cache */ }
  if (cache) {
    const hit = await cache.match(url);
    if (hit) return new Uint8Array(await hit.arrayBuffer());
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement de la voix impossible (${res.status})`);
  const total = Number(res.headers.get('content-length')) || 0;
  let data;
  if (res.body && total && onProgress) {
    const reader = res.body.getReader();
    data = new Uint8Array(total);
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (got + value.length > data.length) { const bigger = new Uint8Array(got + value.length); bigger.set(data); data = bigger; }
      data.set(value, got); got += value.length;
      onProgress(got, total);
    }
    data = data.subarray(0, got);
  } else {
    data = new Uint8Array(await res.arrayBuffer());
  }
  if (cache) { try { await cache.put(url, new Response(data)); } catch (e) { /* quota : on continue sans cache */ } }
  return data;
}

async function getPhonemizer() {
  if (phon) return phon;
  const outs = [];
  const mod = await createPiperPhonemize({
    print: (d) => outs.push(d),
    printErr: () => {},
    locateFile: (u) => PHON_URL + u,
  });
  phon = { mod, outs };
  return phon;
}

async function phonemize(sentences) {
  const p = await getPhonemizer();
  p.outs.length = 0;
  p.mod.callMain(['-l', 'fr', '--input', JSON.stringify(sentences.map((text) => ({ text }))), '--espeak_data', '/espeak-ng-data']);
  return p.outs.map((o) => JSON.parse(o));
}

async function getSession(model) {
  if (sessions[model]) return sessions[model];
  const path = MODELS[model];
  if (!path) throw new Error('Voix inconnue : ' + model);
  const cfg = JSON.parse(new TextDecoder().decode(await fetchCached(HF + path + '.onnx.json')));
  const bytes = await fetchCached(HF + path + '.onnx', (loaded, total) => postMessage({ type: 'progress', model, loaded, total }));
  const session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  sessions[model] = { session, cfg };
  return sessions[model];
}

/* ---------- Synthèse : une piste par phrase (minutage exact des phrases) ---------- */
async function synth({ model, speaker = 0, sentences, scales }) {
  await loadLibs();
  const [{ session, cfg }, phonemes] = await Promise.all([getSession(model), phonemize(sentences)]);
  const out = [];
  for (const ph of phonemes) {
    const ids = ph.phoneme_ids;
    const feeds = {
      input: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
      input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
      scales: new ort.Tensor('float32', Float32Array.from([scales.noise, scales.length, scales.noiseW]), [3]),
    };
    if (cfg.num_speakers > 1) feeds.sid = new ort.Tensor('int64', BigInt64Array.from([BigInt(speaker)]), [1]);
    const r = await session.run(feeds);
    const pcm = r.output.data;
    out.push({ pcm: new Float32Array(pcm), phonemes: ph.phonemes });
  }
  return { sampleRate: cfg.audio.sample_rate, parts: out };
}

async function cacheInfo() {
  try {
    const cache = await caches.open(CACHE);
    const keys = await cache.keys();
    let bytes = 0;
    const models = new Set();
    for (const k of keys) {
      const r = await cache.match(k);
      bytes += (await r.arrayBuffer()).byteLength;
      const m = Object.entries(MODELS).find(([, p]) => k.url.includes(p) && k.url.endsWith('.onnx'));
      if (m) models.add(m[0]);
    }
    return { bytes, models: [...models] };
  } catch (e) { return { bytes: 0, models: [] }; }
}

self.onmessage = (e) => {
  const msg = e.data;
  queue = queue.then(async () => {
    try {
      if (msg.type === 'synth') {
        const res = await synth(msg);
        postMessage({ type: 'done', id: msg.id, ...res }, res.parts.map((p) => p.pcm.buffer));
      } else if (msg.type === 'preload') {
        await loadLibs(); await getSession(msg.model); await getPhonemizer();
        postMessage({ type: 'done', id: msg.id });
      } else if (msg.type === 'cacheInfo') {
        postMessage({ type: 'done', id: msg.id, ...(await cacheInfo()) });
      } else if (msg.type === 'clearCache') {
        for (const k of Object.keys(sessions)) { try { await sessions[k].session.release(); } catch (er) { /* rien */ } delete sessions[k]; }
        try { await caches.delete(CACHE); } catch (er) { /* rien */ }
        postMessage({ type: 'done', id: msg.id });
      }
    } catch (err) {
      postMessage({ type: 'error', id: msg.id, error: String(err && err.message || err) });
    }
  });
};
