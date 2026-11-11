# 🐱🎬 Chatastrophe Studio

Générateur de vidéos **humoristiques de chats** pour TikTok, YouTube Shorts et Instagram Reels.
Remplace complètement l'ancienne application « ViralForge ».

Tout tourne **dans le navigateur** : scénario, voix, sous-titres, rendu, export vidéo. Les clés API sont **optionnelles** : elles servent seulement au mode « IA en ligne ».

---

## ✨ Fonctionnalités

| Domaine | Ce que fait l'application |
|---|---|
| **Interface** | Thème chat (pattes, oreilles, couleurs vives), animations, aperçu vidéo en direct dans un téléphone, responsive mobile |
| **Idées** | Bibliothèque de 16 concepts (président, restaurant, patron, Internet, télétravail, vacances, influenceur, loto, entretien, braquage, crypto, tribunal, chiot, sport, service client, rendez-vous) + idée libre « Mon chat… » |
| **Personnages** | 12 personnalités (paresseux, gourmand, jaloux, génie, criminel, influenceur, milliardaire, drama queen, sportif, philosophe, espion, grincheux), 7 pelages, accessoires automatiques ou manuels |
| **Scénarios** | Structure virale hook → mise en place → escalade → chute → CTA, humour absurde, dialogues chat / narrateur / humain, bouton 🎲 pour une autre version |
| **Voix** | 15 voix comiques (Narrateur TikTok, Chat drôle, Folle, Sarcastique, Théâtrale, Génie absurde, Mème, Cowboy, Mamie, Papy, Robot, Perroquet, Influenceur, Dramatique, Présentateur) en voix neuronales françaises gratuites (Piper) ou IA premium OpenAI · casting automatique · accentuation des mots drôles · volume harmonisé |
| **Sous-titres** | Mot par mot, couleurs dynamiques, passages *comiques* mis en évidence avec un éclat (écrire `*mot*`), étiquette de qui parle |
| **Vidéo** | Chat dessiné identique dans chaque scène, 15 décors, 12 émotions exagérées, 7 mouvements de caméra, transitions, 16 mèmes intégrés |
| **Mode viral** | Hook < 2 s, découpe automatique des répliques longues, coupes fréquentes, bruitage sur chaque plan, titre à l'écran, CTA drôle, fin en boucle |
| **Son** | 16 bruitages et 5 musiques générés en direct (aucun fichier audio, aucun droit d'auteur), musique qui baisse quand quelqu'un parle |
| **Publication** | Titre viral, texte à l'écran, description avec question, hashtags, export vidéo MP4/WebM, sous-titres `.srt`, script `.txt` |
| **Gamification** | Score de viralité sur 100, niveaux (🐣 → 👑), courbe de rétention estimée, suggestions avec bouton « Corriger » et « Tout optimiser », record personnel |

---

## 🚀 Déployer sur Vercel (sans coder)

### Option A — Glisser-déposer (le plus simple)
1. Va sur <https://vercel.com/new>.
2. Choisis **« Deploy without Git »** / dépose le dossier `chatastrophe` (dézippé).
3. Framework : **Other**. Ne change rien d'autre (pas de commande de build).
4. Clique **Deploy**. C'est en ligne.

### Option B — Avec GitHub (mises à jour automatiques)
1. Crée un dépôt GitHub (ex. `tiktok-1`) et envoie-y **le contenu** du dossier `chatastrophe`.
2. Sur Vercel : **Add New → Project → Import** ton dépôt → Framework **Other** → **Deploy**.
3. Pour remplacer l'ancienne app `tiktok-1-rho.vercel.app`, importe le nouveau code **dans le même projet Vercel** (ou remplace les fichiers du dépôt déjà relié).

### (Facultatif) Activer l'IA en ligne
Dans Vercel → ton projet → **Settings → Environment Variables**, ajoute :

| Variable | Rôle |
|---|---|
| `ANTHROPIC_API_KEY` | Scénarios écrits par Claude (prioritaire) |
| `OPENAI_API_KEY` | Scénarios (si pas de clé Anthropic) **et** doublage IA premium |
| `ANTHROPIC_MODEL` | facultatif, défaut `claude-sonnet-5-5` |
| `OPENAI_MODEL` | facultatif, défaut `gpt-4o-mini` |
| `OPENAI_TTS_MODEL` | facultatif, défaut `gpt-4o-mini-tts` |

Puis **Redeploy**. Les options « ✨ IA en ligne » et « Doublage FR IA premium » se débloquent automatiquement. Les clés ne sont jamais envoyées au navigateur.
Sans clé, tout fonctionne quand même avec le moteur local gratuit.

---

## 🎬 Utilisation
1. **L'idée** : choisis un concept (ou écris « Mon chat… »).
2. **Le chat** : nom, pelage, personnalité, durée.
3. **Voix & son** : moteur de voix, « Choisir automatiquement la meilleure voix » (ou une voix par rôle, ▶ pour écouter), accentuation des mots drôles, musique.
4. **Réglages viraux** : mode viral, boucle, sous-titres, qualité, ton @.
5. **✨ Générer la vidéo** → l'aperçu démarre.
6. Modifie le script séquence par séquence (texte, émotion, décor, son, mème, caméra) : l'aperçu se met à jour.
7. Onglet **🔥 Viralité** : corrige les points faibles.
8. **🎬 Exporter la vidéo** (garde l'onglet visible pendant l'enregistrement, en temps réel ; Échap = annuler ; si l'onglet est masqué, l'export reprend tout seul au retour). Seule la vidéo finale est téléchargée : aucune copie ni fichier temporaire n'est conservé.
9. Onglet **📲 Publier** : copie le titre, la description et les hashtags.

**Navigateur conseillé : Chrome ou Edge récent sur ordinateur** (export MP4 H.264). Sur les navigateurs qui ne savent pas faire de MP4, l'export se fait en WebM (accepté par YouTube ; à convertir pour Instagram).

---

## 🗂️ Structure
```
index.html          interface
css/style.css       design
js/app.js           orchestration de l'interface
js/data.js          bibliothèque : concepts, personnages, voix, effets, mèmes
js/story.js         génération des scénarios, titres, hashtags
js/voice.js         voix : synthèse, nettoyage des blancs, accents, effets, volume, minutage mot par mot
js/piper-worker.js  moteur neuronal Piper (Web Worker, cache des modèles)
js/casting.js       choix automatique de la meilleure voix par rôle
js/audio.js         bruitages et musiques synthétisés
js/cat.js           dessin du chat (émotions, accessoires)
js/scenes.js        décors
js/render.js        rendu vidéo (caméra, mèmes, sous-titres, hook, CTA)
js/player.js        lecture et export vidéo
js/viral.js         score de viralité et corrections
api/                fonctions serverless facultatives (IA)
fonts/              polices Luckiest Guy et Fredoka (licence OFL)
```

## ⚖️ Licences
- Voix neuronales : modèles **Piper** `fr_FR-siwis-medium`, `fr_FR-tom-medium`, `fr_FR-upmc-medium` (<https://huggingface.co/rhasspy/piper-voices>, voir la fiche MODEL_CARD de chaque modèle pour sa licence ; Siwis : CC-BY 4.0), chargés depuis HuggingFace au premier usage puis gardés dans le cache du navigateur.
- Moteur : ONNX Runtime Web (MIT) et phonémiseur `piper_phonemize` / eSpeak-ng (GPL v3), chargés depuis le CDN jsDelivr à l'exécution (non inclus dans ce dépôt).
- Polices Luckiest Guy et Fredoka : **SIL Open Font License** (`fonts/LICENSE-OFL.txt`).
- Graphismes, sons et musiques : générés par le code, sans ressource externe.

## ℹ️ À savoir
- Le score de viralité est une **estimation** basée sur les bonnes pratiques (hook, rythme, chute, effets, CTA), pas une garantie de vues.
- D'après un site tiers, OpenAI aurait annoncé l'arrêt de certains modèles TTS en janvier 2027 : si le doublage IA cesse de marcher, change `OPENAI_TTS_MODEL`.
