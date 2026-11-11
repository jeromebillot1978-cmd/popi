/**
 * Chatastrophe Studio — Bibliothèque de contenus
 * Concepts, personnages, scènes, émotions, effets, mèmes, voix, musiques.
 * Les mots entre *astérisques* sont les passages comiques mis en évidence.
 * {nom} est remplacé par le nom du chat.
 */

/* ---------- Pelages ---------- */
export const FURS = {
  roux:    { label: 'Roux tigré',  base: '#F39A3D', dark: '#C96A1B', light: '#FFD9A8', stripes: true },
  noir:    { label: 'Noir',        base: '#2B2B33', dark: '#121217', light: '#4A4A56', stripes: false },
  gris:    { label: 'Gris',        base: '#9AA3B2', dark: '#6B7484', light: '#D5DAE3', stripes: true },
  blanc:   { label: 'Blanc',       base: '#F4F1EC', dark: '#CFC8BD', light: '#FFFFFF', stripes: false },
  siamois: { label: 'Siamois',     base: '#EFE0C8', dark: '#5A4033', light: '#FBF3E6', mask: true },
  calico:  { label: 'Calico',      base: '#F7F1E8', dark: '#2B2B33', light: '#FFFFFF', patches: ['#F39A3D', '#2B2B33'] },
  tabby:   { label: 'Tigré brun',  base: '#A57C52', dark: '#5E4127', light: '#E3C9A6', stripes: true },
};

/* ---------- Émotions (réactions exagérées) ---------- */
export const EMOTIONS = {
  neutre:     { label: '😐 Neutre',      fx: 'pop',      cam: 'zoom_lent' },
  choque:     { label: '😱 Choqué',      fx: 'boom',     cam: 'punch' },
  malicieux:  { label: '😏 Malicieux',   fx: 'ding',     cam: 'dutch' },
  colere:     { label: '😾 En colère',   fx: 'feulement',cam: 'secousse' },
  dodo:       { label: '😴 Endormi',     fx: 'criquets', cam: 'zoom_lent' },
  amour:      { label: '😻 Amoureux',    fx: 'pop',      cam: 'rebond' },
  pleure:     { label: '😿 Pleure',      fx: 'triste',   cam: 'recul' },
  rire:       { label: '😹 Rit',         fx: 'boing',    cam: 'rebond' },
  fier:       { label: '😼 Fier',        fx: 'fanfare',  cam: 'panoramique' },
  gourmand:   { label: '🤤 Gourmand',    fx: 'miaou',    cam: 'punch' },
  suspicieux: { label: '🤨 Suspicieux',  fx: 'suspense', cam: 'zoom_lent' },
  panique:    { label: '🙀 Panique',     fx: 'klaxon',   cam: 'secousse' },
};

/* ---------- Effets sonores (synthétisés, aucun fichier) ---------- */
export const SFX = {
  aucun:     '— Aucun',
  boom:      '💥 Boom dramatique',
  whoosh:    '💨 Whoosh',
  boing:     '🪀 Boing',
  ding:      '🔔 Ding',
  scratch:   '💿 Disque rayé',
  klaxon:    '📯 Klaxon',
  triste:    '🎺 Trombone triste',
  roulement: '🥁 Roulement de tambour',
  cash:      '💰 Tiroir-caisse',
  miaou:     '🐱 Miaou',
  feulement: '😾 Feulement',
  criquets:  '🦗 Criquets',
  pop:       '🫧 Pop',
  glitch:    '📺 Glitch',
  fanfare:   '🎉 Fanfare',
  suspense:  '🎻 Suspense',
};

/* ---------- Mèmes intégrés (dessinés, libres de droits) ---------- */
export const MEMES = {
  aucun:           '— Aucun',
  cercle_rouge:    '🔴 Cercle rouge + flèche',
  lunettes:        '😎 Lunettes qui tombent',
  stonks:          '📈 Graphique qui monte',
  plot_twist:      '🌀 PLOT TWIST',
  degats:          '💔 Dégâts émotionnels',
  bruh:            '😑 BRUH.',
  yeux:            '👁️ Regard insistant',
  feu:             '🔥 Flammes',
  pluie_billets:   '💸 Pluie de billets',
  coeurs:          '💕 Cœurs',
  censure:         '⬛ CENSURÉ',
  criquets_txt:    '🦗 *bruit de criquets*',
  mission_echouee: '❌ Mission échouée',
  carton_temps:    '⏳ Quelques heures plus tard…',
  rayons:          '⚡ Rayons manga',
  confettis:       '🎊 Confettis',
};

/* ---------- Mouvements de caméra ---------- */
export const CAMERAS = {
  punch:       '🎯 Zoom coup de poing',
  zoom_lent:   '🔍 Zoom lent',
  recul:       '↩️ Recul (dézoom)',
  secousse:    '📳 Secousse',
  panoramique: '↔️ Panoramique',
  dutch:       '📐 Plan incliné',
  rebond:      '🏀 Rebond',
};

/* ---------- Décors ---------- */
export const SCENES = {
  salon:      '🛋️ Salon',
  cuisine:    '🍳 Cuisine',
  bureau:     '💼 Bureau',
  palais:     '🏛️ Palais présidentiel',
  restaurant: '🍽️ Restaurant',
  plage:      '🏝️ Plage',
  espace:     '🚀 Espace',
  coffre:     '💰 Salle des coffres',
  studio:     '📱 Studio influenceur',
  nuit:       '🌙 Ville la nuit',
  chambre:    '🛏️ Chambre',
  labo:       '🧪 Laboratoire',
  internet:   '💻 Internet',
  tribunal:   '⚖️ Tribunal',
  salle_sport:'🏋️ Salle de sport',
};

/* ---------- Accessoires ---------- */
export const ACCESSORIES = {
  tete:   { aucun: 'Aucun', bonnet_nuit: 'Bonnet de nuit', toque: 'Toque de chef', haut_de_forme: 'Haut-de-forme', bonnet: 'Bonnet noir', chapeau_paille: 'Chapeau de paille', bandeau: 'Bandeau de sport', couronne: 'Couronne' },
  visage: { aucun: 'Aucun', lunettes_soleil: 'Lunettes de soleil', lunettes_rondes: 'Lunettes rondes', monocle: 'Monocle', masque: 'Masque de voleur' },
  cou:    { aucun: 'Aucun', cravate: 'Cravate', echarpe: 'Écharpe tricolore', chaine_or: 'Chaîne en or', noeud_pap: 'Nœud papillon', bavoir: 'Bavoir' },
};

/* ---------- Personnalités ---------- */
export const PERSONAS = {
  paresseux: {
    nom: 'Paresseux', emoji: '😴', voix: 'matou', emo: 'dodo', absurde: 3,
    acc: { tete: 'bonnet_nuit' },
    lignes: [
      "Pause. Ça fait *quatre minutes* que je suis réveillé.",
      "Je ne suis pas paresseux. Je suis *en mode économie d'énergie*.",
      "Réveille-moi quand il y a *de la nourriture*. Ou jamais.",
    ],
  },
  gourmand: {
    nom: 'Gourmand', emoji: '🍗', voix: 'chaton', emo: 'gourmand', absurde: 3,
    acc: { cou: 'bavoir' },
    lignes: [
      "J'ai mangé il y a *deux minutes*. Je meurs de faim.",
      "C'est quoi ce bruit ? *Un sachet ?* J'ARRIVE.",
      "Mon plat préféré ? *Le tien.*",
    ],
  },
  jaloux: {
    nom: 'Jaloux', emoji: '😒', voix: 'diva', emo: 'suspicieux', absurde: 3,
    acc: {},
    lignes: [
      "Tu as caressé *un autre chat* ? Je sens son odeur.",
      "Ton téléphone a plus d'attention que *moi*. Il va tomber.",
      "Ce coussin, tu l'aimes plus que moi. *Je vais le détruire.*",
    ],
  },
  genie: {
    nom: 'Génie', emoji: '🧠', voix: 'genie', emo: 'fier', absurde: 4,
    acc: { visage: 'lunettes_rondes', cou: 'noeud_pap' },
    lignes: [
      "J'ai calculé la trajectoire parfaite pour faire tomber *ton verre*.",
      "Mon QI ? *Trop élevé* pour vos machines.",
      "J'ai résolu la physique quantique : *la boîte est vide ET pleine*.",
    ],
  },
  criminel: {
    nom: 'Criminel', emoji: '🕶️', voix: 'mafieux', emo: 'malicieux', absurde: 5,
    acc: { visage: 'masque', tete: 'bonnet' },
    lignes: [
      "Tu n'as rien vu. *Je n'étais pas là.*",
      "Je vais te faire une offre que tu ne peux pas refuser : *du thon*.",
      "Mon casier judiciaire est aussi long que *ma queue*.",
    ],
  },
  influenceur: {
    nom: 'Influenceur', emoji: '📱', voix: 'influenceur', emo: 'rire', absurde: 4,
    acc: { visage: 'lunettes_soleil' },
    lignes: [
      "N'oubliez pas de *liker*, c'est gratuit et ça me nourrit.",
      "Attends, je refais la prise. *J'avais une moustache de travers.*",
      "Aujourd'hui je teste *le carton le plus cher du monde*.",
    ],
  },
  milliardaire: {
    nom: 'Milliardaire', emoji: '💎', voix: 'matou', emo: 'fier', absurde: 5,
    acc: { tete: 'haut_de_forme', visage: 'monocle', cou: 'chaine_or' },
    lignes: [
      "Ma litière est en *or massif*. Logique.",
      "J'ai acheté le soleil. Pour avoir *ma place au chaud*.",
      "Pauvre humain. Tu achètes encore *tes croquettes toi-même* ?",
    ],
  },
  dramatique: {
    nom: 'Drama queen', emoji: '🎭', voix: 'diva', emo: 'pleure', absurde: 4,
    acc: {},
    lignes: [
      "Ma gamelle est à moitié vide. *C'est la fin du monde.*",
      "Personne ne m'aime. Tu m'as caressé il y a *trente secondes*.",
      "Je vais écrire mes mémoires. Chapitre un : *la trahison de l'aspirateur*.",
    ],
  },
  sportif: {
    nom: 'Sportif', emoji: '💪', voix: 'influenceur', emo: 'fier', absurde: 3,
    acc: { tete: 'bandeau' },
    lignes: [
      "Échauffement : *trois étirements* et une sieste.",
      "Je cours quarante kilomètres par nuit. *Dans le couloir.*",
      "No pain, no gain. Sauf pour *le pain*. Je le veux.",
    ],
  },
  philosophe: {
    nom: 'Philosophe', emoji: '🤔', voix: 'genie', emo: 'suspicieux', absurde: 4,
    acc: { visage: 'lunettes_rondes' },
    lignes: [
      "Si je fais tomber un verre et que personne ne regarde… *est-ce vraiment ma faute* ?",
      "Je dors, *donc je suis*.",
      "Qu'est-ce que le bonheur ? *Un carton vide.*",
    ],
  },
  espion: {
    nom: 'Espion', emoji: '🕵️', voix: 'mafieux', emo: 'suspicieux', absurde: 4,
    acc: { visage: 'lunettes_soleil', cou: 'cravate' },
    lignes: [
      "Mon nom est Chat. *{nom} Chat.*",
      "Mission du jour : infiltrer *le placard à croquettes*.",
      "Ce message s'autodétruira. *Je vais le faire tomber.*",
    ],
  },
  grincheux: {
    nom: 'Grincheux', emoji: '😾', voix: 'matou', emo: 'colere', absurde: 3,
    acc: {},
    lignes: [
      "Il est six heures. *Pourquoi tu dors encore* ? Je veux manger.",
      "Non. Peu importe la question. *Non.*",
      "J'ai vu quelqu'un sourire ce matin. *Ça m'a gâché la journée.*",
    ],
  },
};

/* ---------- Concepts (bibliothèque d'idées) ---------- */
// s = qui parle (chat | narrateur | humain), t = texte, e = émotion, sc = décor, fx = son, m = mème
export const CATEGORIES = {
  tous: '✨ Tous', pouvoir: '👑 Pouvoir', argent: '💰 Argent', travail: '💼 Travail',
  quotidien: '🏠 Quotidien', voyage: '🏝️ Voyage', tech: '💻 Tech', crime: '🕶️ Crime', amour: '💘 Amour',
};

export const CONCEPTS = [
  {
    id: 'president', titre: 'Mon chat devient président', emoji: '🏛️', cat: 'pouvoir', absurde: 5,
    scenes: ['palais', 'bureau', 'palais', 'nuit'], acc: { cou: 'echarpe' }, persona: 'milliardaire',
    hooks: [
      "POV : ton chat vient d'être élu *président* 🇫🇷",
      "Mon chat a gagné l'élection. Avec *100 %* des croquettes.",
      "Personne n'avait prévu ça : {nom} est *président*.",
    ],
    setup: [
      { s: 'narrateur', t: "Premier jour au palais. {nom} entre dans le bureau présidentiel.", e: 'fier', sc: 'palais', fx: 'fanfare' },
      { s: 'narrateur', t: "Discours d'investiture. Le pays entier *retient son souffle*.", e: 'fier', sc: 'palais', fx: 'roulement' },
    ],
    escalade: [
      { s: 'chat', t: "Décret numéro un : la sieste devient *obligatoire*.", e: 'malicieux', fx: 'ding' },
      { s: 'chat', t: "Décret numéro deux : les aspirateurs sont *interdits*. Pour toujours.", e: 'colere', fx: 'boom', m: 'feu' },
      { s: 'humain', t: "Monsieur le président, et pour l'économie ?", e: 'neutre' },
      { s: 'chat', t: "Je mets *tout le budget* en croquettes. Question suivante.", e: 'fier', fx: 'cash', m: 'pluie_billets' },
      { s: 'narrateur', t: "Conseil des ministres : il fait tomber le verre du Premier ministre. *Exprès.*", e: 'malicieux', fx: 'scratch', m: 'cercle_rouge' },
      { s: 'chat', t: "Le 49.3 ? Non. Moi, j'utilise le *49 miaou*.", e: 'malicieux', fx: 'boom', m: 'lunettes' },
    ],
    twist: [
      { s: 'narrateur', t: "Six mois plus tard, cote de popularité : *98 %*. Record historique.", e: 'fier', fx: 'fanfare', m: 'stonks' },
      { s: 'narrateur', t: "Il a démissionné au bout d'une heure. Motif : *le soleil avait bougé*.", e: 'dodo', fx: 'triste', m: 'mission_echouee' },
      { s: 'chat', t: "Et maintenant… je déclare la guerre au *chien du voisin*.", e: 'colere', fx: 'klaxon', m: 'feu' },
    ],
    titres: ["Mon chat est devenu président et c'est n'importe quoi 😭", "{nom} président : son premier décret 😹🇫🇷", "Si mon chat gouvernait le pays…"],
    tags: ['#chatpresident', '#sieste'],
  },
  {
    id: 'restaurant', titre: 'Mon chat ouvre un restaurant', emoji: '🍽️', cat: 'argent', absurde: 4,
    scenes: ['restaurant', 'cuisine', 'restaurant'], acc: { tete: 'toque' }, persona: 'gourmand',
    hooks: [
      "Mon chat a ouvert un restaurant. Les clients ne sont *jamais* revenus.",
      "POV : tu réserves une table chez *Chef {nom}* 🍽️",
      "Le restaurant le plus *bizarre* de France est tenu par un chat.",
    ],
    setup: [
      { s: 'narrateur', t: "Grande ouverture de « Chez {nom} ». Spécialité de la maison : *la pâtée*.", e: 'fier', sc: 'restaurant', fx: 'fanfare' },
      { s: 'humain', t: "Bonsoir, je voudrais voir la carte, s'il vous plaît.", e: 'neutre', sc: 'restaurant' },
    ],
    escalade: [
      { s: 'chat', t: "La carte ? Il n'y a qu'*un seul plat*. Et c'est le mien.", e: 'malicieux', fx: 'boom' },
      { s: 'chat', t: "Le poisson est frais. Je l'ai volé *ce matin* au voisin.", e: 'fier', sc: 'cuisine', fx: 'ding' },
      { s: 'humain', t: "Euh… il y a un poil dans mon assiette.", e: 'suspicieux' },
      { s: 'chat', t: "Ce n'est pas un poil. C'est *ma signature*.", e: 'fier', fx: 'pop', m: 'lunettes' },
      { s: 'narrateur', t: "Le chef goûte chaque plat. Puis il *mange tout*.", e: 'gourmand', sc: 'cuisine', fx: 'miaou' },
      { s: 'chat', t: "L'addition : quatre cents euros. Et une *caresse*. Pas sur le ventre.", e: 'malicieux', fx: 'cash', m: 'pluie_billets' },
    ],
    twist: [
      { s: 'narrateur', t: "Critique gastronomique : cinq étoiles. Il n'a *rien mangé*, il a juste reçu un ronron.", e: 'amour', fx: 'fanfare', m: 'coeurs' },
      { s: 'narrateur', t: "Le restaurant a fermé le soir même. Le chef s'est *endormi dans le panier à pain*.", e: 'dodo', fx: 'triste', m: 'mission_echouee' },
      { s: 'chat', t: "Fermé ce soir. *Un carton* vient d'être livré. Priorités.", e: 'fier', fx: 'scratch', m: 'bruh' },
    ],
    titres: ["Mon chat a ouvert un restaurant… les avis sont terribles 😂", "Chef {nom} : la pire expérience gastronomique 🍽️😹", "J'ai dîné dans le restaurant de mon chat"],
    tags: ['#chefchat', '#restaurant'],
  },
  {
    id: 'patron', titre: 'Mon chat remplace mon patron', emoji: '💼', cat: 'travail', absurde: 4,
    scenes: ['bureau', 'bureau', 'salon'], acc: { cou: 'cravate' }, persona: 'grincheux',
    hooks: [
      "Mon chat a remplacé mon patron. Je *regrette* l'ancien.",
      "POV : ton nouveau manager est un *chat* 💼",
      "Premier jour avec mon nouveau boss. Il a *des moustaches*.",
    ],
    setup: [
      { s: 'narrateur', t: "Lundi, neuf heures. {nom} convoque toute l'équipe.", e: 'fier', sc: 'bureau', fx: 'ding' },
      { s: 'chat', t: "Asseyez-vous. Pas sur *mon clavier*, c'est ma place.", e: 'colere', sc: 'bureau', fx: 'boom' },
    ],
    escalade: [
      { s: 'chat', t: "Nouvel horaire : on travaille de trois à *quatre heures du matin*. En courant partout.", e: 'malicieux', fx: 'whoosh', m: 'rayons' },
      { s: 'humain', t: "Patron, je pourrais avoir une augmentation ?", e: 'neutre' },
      { s: 'chat', t: "Bien sûr. Tu es payé *en sachets fraîcheur* maintenant.", e: 'fier', fx: 'cash' },
      { s: 'narrateur', t: "Réunion importante : il s'assoit sur l'ordinateur et *éteint le serveur*.", e: 'malicieux', fx: 'glitch', m: 'cercle_rouge' },
      { s: 'chat', t: "Ton rapport ? Je l'ai *poussé de la table*. Recommence.", e: 'malicieux', fx: 'scratch', m: 'bruh' },
      { s: 'chat', t: "Entretien annuel : tu n'as *pas assez ronronné* cette année.", e: 'suspicieux', fx: 'triste' },
    ],
    twist: [
      { s: 'narrateur', t: "Bilan du trimestre : productivité *+300 %*. Plus personne n'ose faire de pause.", e: 'fier', fx: 'fanfare', m: 'stonks' },
      { s: 'narrateur', t: "Vendredi, il a licencié tout le monde. Sauf *le distributeur de croquettes*.", e: 'malicieux', fx: 'boom', m: 'degats' },
      { s: 'narrateur', t: "Et l'ancien patron ? Il est devenu *son coussin*.", e: 'dodo', fx: 'criquets', m: 'criquets_txt' },
    ],
    titres: ["Mon chat a remplacé mon patron… et c'est pire 💼😹", "Le pire manager du monde a des moustaches", "Mon nouveau boss est un chat (ça se passe mal)"],
    tags: ['#travail', '#boss'],
  },
  {
    id: 'internet', titre: 'Mon chat découvre Internet', emoji: '💻', cat: 'tech', absurde: 4,
    scenes: ['nuit', 'internet', 'internet', 'salon'], acc: {}, persona: 'genie',
    hooks: [
      "Mon chat a découvert Internet. On a *perdu le contrôle*.",
      "POV : ton chat trouve le *Wi-Fi* pour la première fois 📶",
      "J'ai laissé mon ordinateur allumé *une seule nuit*.",
    ],
    setup: [
      { s: 'narrateur', t: "Trois heures du matin. Une *lumière bleue* dans le salon.", e: 'suspicieux', sc: 'nuit', fx: 'suspense' },
      { s: 'chat', t: "Hmm. Que se passe-t-il si j'appuie sur *toutes les touches* ?", e: 'malicieux', sc: 'internet', fx: 'glitch' },
    ],
    escalade: [
      { s: 'narrateur', t: "Il a commandé *quarante-sept kilos* de papier bulle.", e: 'choque', fx: 'boom', m: 'cercle_rouge' },
      { s: 'chat', t: "Je viens de lire les commentaires. *Les humains sont fous.*", e: 'choque', fx: 'scratch', m: 'yeux' },
      { s: 'chat', t: "J'ai créé un compte. Deux millions d'abonnés. Toi, tu en as *douze*.", e: 'malicieux', fx: 'ding', m: 'stonks' },
      { s: 'narrateur', t: "Il passe des heures à regarder… des vidéos de *chats*.", e: 'amour', fx: 'pop', m: 'coeurs' },
      { s: 'chat', t: "J'ai changé ton mot de passe. C'est *croquettes123*. Ou pas.", e: 'malicieux', fx: 'glitch' },
      { s: 'narrateur', t: "Il a laissé un avis *une étoile* au vétérinaire. Avec photos.", e: 'colere', fx: 'klaxon' },
    ],
    twist: [
      { s: 'narrateur', t: "Le lendemain, Internet était en panne dans toute la rue. Il avait *mâché la box*.", e: 'malicieux', fx: 'glitch', m: 'mission_echouee' },
      { s: 'chat', t: "J'ai lu tout Internet. Conclusion : *le carton reste supérieur*.", e: 'fier', fx: 'fanfare', m: 'lunettes' },
      { s: 'narrateur', t: "Puis il a découvert *la webcam*. Il nous observe depuis.", e: 'suspicieux', fx: 'suspense', m: 'yeux' },
    ],
    titres: ["Mon chat a découvert Internet et il est incontrôlable 💻", "J'ai laissé mon chat seul avec le Wi-Fi 😱", "Ce que fait mon chat sur Internet la nuit…"],
    tags: ['#internet', '#geek'],
  },
  {
    id: 'travailler', titre: 'Mon chat essaie de travailler', emoji: '⌨️', cat: 'travail', absurde: 3,
    scenes: ['bureau', 'bureau', 'salon'], acc: { visage: 'lunettes_rondes' }, persona: 'paresseux',
    hooks: [
      "Mon chat essaie de travailler. Ça a duré *trois secondes*.",
      "POV : ton chat fait du *télétravail* 💻",
      "Le télétravail avec un chat, c'est *ça*.",
    ],
    setup: [
      { s: 'narrateur', t: "Huit heures cinquante-neuf. {nom} allume l'ordinateur. *Ambitieux.*", e: 'fier', sc: 'bureau', fx: 'ding' },
      { s: 'chat', t: "Aujourd'hui, je deviens *productif*. Rien ne peut m'arrêter.", e: 'fier', sc: 'bureau', fx: 'fanfare' },
    ],
    escalade: [
      { s: 'narrateur', t: "Neuf heures une : première pause. *Bien méritée.*", e: 'dodo', fx: 'criquets', m: 'carton_temps' },
      { s: 'chat', t: "Visio importante. Je montre *mes fesses* à la caméra. C'est professionnel.", e: 'malicieux', fx: 'boing', m: 'censure' },
      { s: 'chat', t: "Un mail urgent ? Je l'ai *supprimé*. Ça me stressait.", e: 'malicieux', fx: 'pop' },
      { s: 'narrateur', t: "Il a tapé un rapport de quarante pages. Que la lettre *J*.", e: 'fier', fx: 'glitch', m: 'bruh' },
      { s: 'chat', t: "Une mouche. *TOUT LE MONDE À TERRE !*", e: 'panique', fx: 'klaxon', m: 'rayons' },
      { s: 'chat', t: "Je travaille dur. Regarde, je suis *couché sur le clavier*.", e: 'dodo', fx: 'boing' },
    ],
    twist: [
      { s: 'narrateur', t: "Bilan : *zéro tâche*, quatorze siestes… et une promotion.", e: 'fier', fx: 'fanfare', m: 'stonks' },
      { s: 'narrateur', t: "Son patron l'a appelé en visio. C'était *le chat du voisin*.", e: 'choque', fx: 'boom', m: 'plot_twist' },
      { s: 'chat', t: "Le travail, c'est pour les *chiens*. Moi, je suis consultant.", e: 'malicieux', fx: 'scratch', m: 'lunettes' },
    ],
    titres: ["Mon chat essaie de travailler (échec total) 💻😹", "Le télétravail avec un chat, la vérité", "Mon chat est plus productif que moi… ou pas"],
    tags: ['#teletravail', '#travail'],
  },
  {
    id: 'vacances', titre: 'Mon chat part en vacances', emoji: '🏝️', cat: 'voyage', absurde: 3,
    scenes: ['salon', 'plage', 'plage', 'salon'], acc: { visage: 'lunettes_soleil', tete: 'chapeau_paille' }, persona: 'dramatique',
    hooks: [
      "Mon chat part en vacances. *Sans moi.*",
      "POV : ton chat réserve un *tout compris* avec ta carte 🏝️",
      "Mon chat a vu une pub pour la plage. *Erreur fatale.*",
    ],
    setup: [
      { s: 'narrateur', t: "{nom} prépare sa valise. Contenu : *une chaussette* et ta carte bleue.", e: 'malicieux', sc: 'salon', fx: 'pop' },
      { s: 'chat', t: "Destination : *le plus grand bac à sable du monde*.", e: 'fier', sc: 'plage', fx: 'fanfare' },
    ],
    escalade: [
      { s: 'narrateur', t: "Arrivée à la plage. Il découvre *la mer*.", e: 'choque', fx: 'boom', m: 'cercle_rouge' },
      { s: 'chat', t: "Pourquoi l'eau *bouge* ? Qui a autorisé ça ?", e: 'panique', fx: 'klaxon', m: 'rayons' },
      { s: 'chat', t: "Je réclame un *transat à l'ombre*, un poisson grillé et le silence.", e: 'fier', fx: 'ding' },
      { s: 'narrateur', t: "Sieste au soleil : *sept heures*. Sans bouger d'un poil.", e: 'dodo', fx: 'criquets', m: 'carton_temps' },
      { s: 'chat', t: "Cette mouette me regarde. *Elle a choisi la guerre.*", e: 'colere', fx: 'feulement', m: 'feu' },
      { s: 'chat', t: "Un cocktail ? Non. Juste *un verre d'eau que je vais renverser*.", e: 'malicieux', fx: 'scratch' },
    ],
    twist: [
      { s: 'narrateur', t: "Retour à la maison. Son meilleur souvenir : *le carton de la valise*.", e: 'amour', fx: 'pop', m: 'coeurs' },
      { s: 'narrateur', t: "Prix total du voyage : *trois mille deux cents euros*. Payés avec ma carte.", e: 'choque', fx: 'cash', m: 'degats' },
      { s: 'chat', t: "Plus jamais. *Le rebord de la fenêtre*, c'était mieux.", e: 'pleure', fx: 'triste', m: 'mission_echouee' },
    ],
    titres: ["Mon chat est parti en vacances avec MA carte bleue 🏝️💸", "Les vacances de mon chat ont mal tourné 😭", "J'ai emmené mon chat à la plage (mauvaise idée)"],
    tags: ['#vacances', '#plage'],
  },
  {
    id: 'influenceur', titre: 'Mon chat devient influenceur', emoji: '📱', cat: 'tech', absurde: 4,
    scenes: ['studio', 'studio', 'salon'], acc: { visage: 'lunettes_soleil' }, persona: 'influenceur',
    hooks: [
      "Mon chat est devenu influenceur. Il m'a *bloqué*.",
      "POV : ton chat a *plus d'abonnés* que toi 📱",
      "Mon chat signe des autographes. *Avec ses griffes.*",
    ],
    setup: [
      { s: 'chat', t: "Salut la *famille* ! C'est {nom}, on se retrouve pour une nouvelle vidéo !", e: 'rire', sc: 'studio', fx: 'fanfare' },
      { s: 'narrateur', t: "Le studio est prêt : ring light, micro… et *trois cartons*.", e: 'fier', sc: 'studio', fx: 'ding' },
    ],
    escalade: [
      { s: 'chat', t: "Aujourd'hui, ma routine beauté. Étape un : *me lécher partout*.", e: 'fier', fx: 'pop', m: 'lunettes' },
      { s: 'chat', t: "Code promo *MIAOU10* : moins dix pour cent sur les croquettes de luxe.", e: 'malicieux', fx: 'cash', m: 'pluie_billets' },
      { s: 'humain', t: "{nom}, tu me fais un câlin pour la vidéo ?", e: 'neutre' },
      { s: 'chat', t: "Pas sans contrat. Mon agent va t'appeler. *Mon agent, c'est le chien.*", e: 'malicieux', fx: 'scratch', m: 'bruh' },
      { s: 'narrateur', t: "Placement de produit pour un aspirateur. Il le *détruit en direct*.", e: 'colere', fx: 'boom', m: 'degats' },
      { s: 'chat', t: "Nouveau challenge : faire tomber *un objet par jour*. Rejoignez-moi.", e: 'malicieux', fx: 'whoosh', m: 'feu' },
    ],
    twist: [
      { s: 'narrateur', t: "Il a gagné le prix de l'influenceur de l'année. Il a *dormi* pendant la cérémonie.", e: 'dodo', fx: 'fanfare', m: 'confettis' },
      { s: 'narrateur', t: "Puis il m'a acheté une maison. *Une niche.*", e: 'malicieux', fx: 'boom', m: 'plot_twist' },
      { s: 'chat', t: "Merci pour les vues. Grâce à vous, j'ai acheté *mille cartons vides*.", e: 'amour', fx: 'pop', m: 'coeurs' },
    ],
    titres: ["Mon chat est devenu influenceur et il me snobe 📱😹", "La routine beauté de mon chat influenceur", "Mon chat a plus d'abonnés que moi (c'est vexant)"],
    tags: ['#influenceur', '#chatstar'],
  },
  {
    id: 'loto', titre: 'Mon chat gagne au loto', emoji: '💰', cat: 'argent', absurde: 5,
    scenes: ['salon', 'coffre', 'coffre', 'plage'], acc: { tete: 'haut_de_forme', cou: 'chaine_or' }, persona: 'milliardaire',
    hooks: [
      "Mon chat a gagné au *loto*. Il ne me reconnaît plus.",
      "POV : ton chat devient *millionnaire* du jour au lendemain 💰",
      "Mon chat a joué au loto. *Jackpot.*",
    ],
    setup: [
      { s: 'narrateur', t: "Il a marché sur le ticket. Les six numéros. *Le jackpot.*", e: 'choque', sc: 'salon', fx: 'boom', m: 'cercle_rouge' },
      { s: 'chat', t: "Je suis riche. À partir de maintenant, tu m'appelles *Monsieur*.", e: 'fier', sc: 'coffre', fx: 'cash' },
    ],
    escalade: [
      { s: 'chat', t: "Première dépense : une *piscine de croquettes*. Olympique.", e: 'gourmand', sc: 'coffre', fx: 'cash', m: 'pluie_billets' },
      { s: 'chat', t: "J'ai engagé un majordome. *C'est toi.* Commence par la litière.", e: 'malicieux', fx: 'boom' },
      { s: 'narrateur', t: "Il achète un yacht. Puis refuse de monter dessus. *Il y a de l'eau.*", e: 'panique', fx: 'klaxon', sc: 'plage' },
      { s: 'chat', t: "J'ai acheté le *pointeur laser* le plus cher du monde. Il est en or.", e: 'fier', fx: 'ding', m: 'lunettes' },
      { s: 'chat', t: "Mon conseiller dit de diversifier. J'ai *tout misé sur le thon*.", e: 'malicieux', fx: 'cash', m: 'stonks' },
    ],
    twist: [
      { s: 'narrateur', t: "Une semaine plus tard, il avait *tout perdu*. Il a parié sur le chien du voisin.", e: 'pleure', fx: 'triste', m: 'mission_echouee' },
      { s: 'narrateur', t: "Il a acheté la maison. Et m'a *mis dehors*. Je dors dans son ancien carton.", e: 'malicieux', fx: 'boom', m: 'degats' },
      { s: 'chat', t: "L'argent ne fait pas le bonheur. Mais il achète *beaucoup de thon*.", e: 'fier', fx: 'fanfare', m: 'stonks' },
    ],
    titres: ["Mon chat a gagné au loto et m'a mis à la porte 💰😹", "Mon chat est devenu millionnaire (il est insupportable)", "Ce que mon chat a acheté avec le jackpot…"],
    tags: ['#loto', '#millionnaire'],
  },
  {
    id: 'entretien', titre: "Mon chat passe un entretien d'embauche", emoji: '👔', cat: 'travail', absurde: 4,
    scenes: ['bureau'], acc: { cou: 'cravate' }, persona: 'genie',
    hooks: [
      "Mon chat passe un *entretien d'embauche*. Le recruteur pleure.",
      "POV : tu fais passer un entretien à un *chat* 👔",
      "« Quelles sont vos qualités ? » La réponse de mon chat m'a *détruit*.",
    ],
    setup: [
      { s: 'humain', t: "Bonjour {nom}. Parlez-moi de vous.", e: 'neutre', sc: 'bureau' },
      { s: 'chat', t: "Je suis un *leader naturel*. J'ai dirigé trois canapés.", e: 'fier', sc: 'bureau', fx: 'ding' },
    ],
    escalade: [
      { s: 'humain', t: "Quel est votre plus grand défaut ?", e: 'neutre' },
      { s: 'chat', t: "Je suis *trop parfait*. Et je mords.", e: 'malicieux', fx: 'boom', m: 'lunettes' },
      { s: 'humain', t: "Où vous voyez-vous dans cinq ans ?", e: 'neutre' },
      { s: 'chat', t: "Sur *votre chaise*. Elle est encore chaude.", e: 'malicieux', fx: 'scratch', m: 'cercle_rouge' },
      { s: 'chat', t: "Mes prétentions salariales : *un rayon de soleil* et l'imprimante pour dormir.", e: 'fier', fx: 'cash' },
      { s: 'narrateur', t: "Il a renversé le café du recruteur. *En le regardant dans les yeux.*", e: 'malicieux', fx: 'scratch', m: 'yeux' },
    ],
    twist: [
      { s: 'narrateur', t: "Il a été embauché. *Directeur général.* Le recruteur est devenu son coussin.", e: 'fier', fx: 'fanfare', m: 'stonks' },
      { s: 'chat', t: "Finalement, je refuse le poste. Je voulais juste *le carton de l'imprimante*.", e: 'fier', fx: 'boom', m: 'plot_twist' },
      { s: 'narrateur', t: "Résultat : refusé. Motif : *s'est endormi pendant le test*.", e: 'dodo', fx: 'triste', m: 'mission_echouee' },
    ],
    titres: ["Mon chat passe un entretien d'embauche 👔😹", "Le recruteur n'était pas prêt pour mon chat", "« Votre plus grand défaut ? » — mon chat :"],
    tags: ['#entretien', '#emploi'],
  },
  {
    id: 'braquage', titre: 'Mon chat organise un braquage', emoji: '🕶️', cat: 'crime', absurde: 5,
    scenes: ['nuit', 'cuisine', 'cuisine', 'nuit'], acc: { visage: 'masque', tete: 'bonnet' }, persona: 'criminel',
    hooks: [
      "Mon chat a organisé le *braquage du siècle*. La cible : le frigo.",
      "POV : tu découvres que ton chat est un *cerveau du crime* 🕶️",
      "Trois heures du matin. Mon chat enfile *une cagoule*.",
    ],
    setup: [
      { s: 'narrateur', t: "Opération *Thon Rouge*. Heure H : trois heures du matin.", e: 'suspicieux', sc: 'nuit', fx: 'suspense' },
      { s: 'chat', t: "Le plan est simple : on entre, on prend le jambon, *on accuse le chien*.", e: 'malicieux', sc: 'nuit', fx: 'roulement' },
    ],
    escalade: [
      { s: 'chat', t: "Les lasers sont activés. Heureusement, *j'adore les lasers*.", e: 'fier', sc: 'cuisine', fx: 'whoosh', m: 'rayons' },
      { s: 'narrateur', t: "Il ouvre le frigo. *L'alarme se déclenche.* C'était juste la lumière.", e: 'panique', fx: 'klaxon', m: 'cercle_rouge' },
      { s: 'chat', t: "Personne ne bouge. *Ce jambon est à moi.*", e: 'colere', fx: 'boom', m: 'feu' },
      { s: 'narrateur', t: "Son complice, le hamster, a *tout balancé* en deux minutes.", e: 'choque', fx: 'scratch', m: 'degats' },
      { s: 'chat', t: "Je n'ai rien fait. *Ces moustaches ont un alibi.*", e: 'suspicieux', fx: 'ding', m: 'lunettes' },
      { s: 'narrateur', t: "Butin : un jambon, deux saucisses et *ton doudou*.", e: 'fier', fx: 'cash' },
    ],
    twist: [
      { s: 'narrateur', t: "Le lendemain, la police a arrêté *le chien*. Le crime parfait.", e: 'malicieux', fx: 'boom', m: 'plot_twist' },
      { s: 'narrateur', t: "Trahi par une preuve accablante : *il a ronronné pendant l'interrogatoire*.", e: 'amour', fx: 'triste', m: 'mission_echouee' },
      { s: 'chat', t: "Le jambon était une diversion. Le vrai butin ? *Ta place sur le canapé.*", e: 'fier', fx: 'fanfare', m: 'lunettes' },
    ],
    titres: ["Mon chat a braqué le frigo à 3h du matin 🕶️😹", "Le braquage du siècle (par mon chat)", "J'ai découvert que mon chat est un cerveau du crime"],
    tags: ['#braquage', '#chatcriminel'],
  },
  {
    id: 'crypto', titre: 'Mon chat lance sa cryptomonnaie', emoji: '📈', cat: 'argent', absurde: 5,
    scenes: ['internet', 'bureau', 'espace', 'bureau'], acc: { visage: 'lunettes_soleil' }, persona: 'genie',
    hooks: [
      "Mon chat a lancé sa *cryptomonnaie* : le MiaouCoin.",
      "POV : ton chat devient *trader* à trois heures du matin 📈",
      "Mon chat a investi toutes mes économies. *Dans le thon.*",
    ],
    setup: [
      { s: 'chat', t: "Le *MiaouCoin* va changer le monde. Ou au moins ma gamelle.", e: 'fier', sc: 'internet', fx: 'fanfare' },
      { s: 'narrateur', t: "Il passe la nuit devant les graphiques. Il *griffe l'écran* quand ça baisse.", e: 'colere', sc: 'bureau', fx: 'feulement' },
    ],
    escalade: [
      { s: 'chat', t: "Ça monte ! *Ça monte !* Direction la Lune !", e: 'rire', sc: 'espace', fx: 'whoosh', m: 'stonks' },
      { s: 'chat', t: "Le livre blanc du projet ? C'est *une photo de mes pattes*.", e: 'fier', fx: 'pop', m: 'lunettes' },
      { s: 'narrateur', t: "Il a acheté la Lune. Il dit qu'elle ressemble à *une croquette*.", e: 'gourmand', sc: 'espace', fx: 'ding' },
      { s: 'chat', t: "Achète, achète ! Ah non. *Vends tout !*", e: 'panique', fx: 'klaxon', m: 'rayons' },
      { s: 'narrateur', t: "Sa stratégie d'investissement : *dormir dix-huit heures par jour*.", e: 'dodo', fx: 'criquets' },
    ],
    twist: [
      { s: 'narrateur', t: "Le MiaouCoin s'est effondré. Valeur actuelle : *une moustache*.", e: 'pleure', fx: 'triste', m: 'mission_echouee' },
      { s: 'narrateur', t: "Il a tout revendu à temps. Il est plus riche que *toute la rue*.", e: 'fier', fx: 'cash', m: 'pluie_billets' },
      { s: 'chat', t: "Ce n'était pas une arnaque. C'était *un test*. Tu as échoué.", e: 'malicieux', fx: 'boom', m: 'degats' },
    ],
    titres: ["Mon chat a lancé sa crypto et c'est le chaos 📈😹", "Le MiaouCoin : l'investissement le plus absurde", "Mon chat trader à 3h du matin"],
    tags: ['#crypto', '#trading'],
  },
  {
    id: 'tribunal', titre: 'Mon chat passe au tribunal', emoji: '⚖️', cat: 'crime', absurde: 4,
    scenes: ['tribunal'], acc: { cou: 'noeud_pap' }, persona: 'dramatique',
    hooks: [
      "Mon chat est *au tribunal*. Accusé d'avoir fait tomber quatre cents verres.",
      "POV : ton chat est accusé et il a pris *le meilleur avocat* ⚖️",
      "Le procès du siècle : *{nom} contre l'aspirateur*.",
    ],
    setup: [
      { s: 'narrateur', t: "Affaire numéro neuf : *le vase de mamie*. L'accusé se présente.", e: 'suspicieux', sc: 'tribunal', fx: 'roulement' },
      { s: 'humain', t: "L'accusé a-t-il quelque chose à déclarer ?", e: 'neutre', sc: 'tribunal' },
    ],
    escalade: [
      { s: 'chat', t: "Votre honneur, ce vase *me regardait de travers*.", e: 'colere', fx: 'boom' },
      { s: 'chat', t: "J'invoque mon droit de garder le silence. Et de *dormir dans le box*.", e: 'dodo', fx: 'criquets', m: 'carton_temps' },
      { s: 'narrateur', t: "Pièce à conviction numéro un : *une vidéo de surveillance*.", e: 'choque', fx: 'suspense', m: 'cercle_rouge' },
      { s: 'chat', t: "Ce n'est pas moi. C'est *mon jumeau maléfique*.", e: 'suspicieux', fx: 'scratch', m: 'bruh' },
      { s: 'narrateur', t: "Témoin de l'accusation : *le poisson rouge*. Il n'a rien dit.", e: 'neutre', fx: 'criquets', m: 'criquets_txt' },
      { s: 'chat', t: "Objection ! *Je suis trop mignon* pour aller en prison.", e: 'amour', fx: 'pop', m: 'coeurs' },
    ],
    twist: [
      { s: 'narrateur', t: "Verdict : acquitté. Le juge a été *corrompu avec un ronron*.", e: 'amour', fx: 'fanfare', m: 'coeurs' },
      { s: 'narrateur', t: "Condamné à vingt ans… *de câlins*. Il a fait appel.", e: 'pleure', fx: 'triste', m: 'degats' },
      { s: 'chat', t: "Le juge, c'était *moi* depuis le début.", e: 'malicieux', fx: 'boom', m: 'plot_twist' },
    ],
    titres: ["Mon chat est passé au tribunal ⚖️😹", "Le procès du siècle : mon chat contre le vase", "Mon chat plaide non coupable (il est coupable)"],
    tags: ['#tribunal', '#proces'],
  },
  {
    id: 'chiot', titre: 'Mon chat rencontre le nouveau chiot', emoji: '🐶', cat: 'amour', absurde: 3,
    scenes: ['salon', 'salon', 'chambre'], acc: {}, persona: 'jaloux',
    hooks: [
      "Nouveau chiot. Mon chat a appelé *son avocat*.",
      "POV : ton chat découvre que tu as *un nouveau chouchou* 🐶",
      "Mon chat a vu le chiot. *Erreur fatale.*",
    ],
    setup: [
      { s: 'narrateur', t: "Jour un : le chiot arrive. {nom} observe. *Il ne cligne pas des yeux.*", e: 'suspicieux', sc: 'salon', fx: 'suspense', m: 'yeux' },
      { s: 'chat', t: "Alors on me *remplace* ? Après tout ce que j'ai fait tomber pour toi ?", e: 'pleure', sc: 'salon', fx: 'triste' },
    ],
    escalade: [
      { s: 'chat', t: "Ce chiot est *suspect*. Il est content *tout le temps*.", e: 'suspicieux', fx: 'scratch' },
      { s: 'narrateur', t: "Il a affiché un plan au mur : *Opération Retour à l'envoyeur*.", e: 'malicieux', fx: 'roulement' },
      { s: 'chat', t: "Soyons clairs : *le canapé*, c'est mon territoire.", e: 'colere', fx: 'feulement', m: 'feu' },
      { s: 'narrateur', t: "Le chiot lui apporte un jouet. {nom} le *pousse par terre*. Lentement.", e: 'malicieux', fx: 'boing' },
      { s: 'chat', t: "Tu lui as fait un câlin. *Devant moi.* Je note tout.", e: 'pleure', fx: 'boom', m: 'degats' },
      { s: 'narrateur', t: "Il a posté une annonce : *chiot à donner, très bruyant*.", e: 'malicieux', fx: 'glitch', m: 'cercle_rouge' },
    ],
    twist: [
      { s: 'narrateur', t: "Jour trente : on les a retrouvés *endormis ensemble*. Il nie tout.", e: 'amour', fx: 'pop', m: 'coeurs' },
      { s: 'narrateur', t: "Le chiot obéit maintenant… *au chat*. Il lui apporte ses croquettes.", e: 'fier', fx: 'fanfare', m: 'plot_twist' },
      { s: 'chat', t: "J'ai fait ma valise. Je pars vivre *chez la voisine*. Elle a du thon.", e: 'fier', fx: 'whoosh', m: 'mission_echouee' },
    ],
    titres: ["Mon chat rencontre notre nouveau chiot (il est jaloux) 🐶😾", "Mon chat a déclaré la guerre au chiot", "Jour 1 vs Jour 30 : mon chat et le chiot"],
    tags: ['#chiot', '#jaloux'],
  },
  {
    id: 'sport', titre: 'Mon chat se met au sport', emoji: '🏋️', cat: 'quotidien', absurde: 3,
    scenes: ['salle_sport', 'salon', 'salle_sport'], acc: { tete: 'bandeau' }, persona: 'sportif',
    hooks: [
      "Mon chat s'est mis au *sport*. Il a tenu quatre secondes.",
      "POV : ton chat devient *coach sportif* 💪",
      "Mon chat veut un *corps de rêve* pour l'été.",
    ],
    setup: [
      { s: 'chat', t: "Nouvelle année, nouveau moi. Aujourd'hui, *je deviens athlète*.", e: 'fier', sc: 'salle_sport', fx: 'fanfare' },
      { s: 'narrateur', t: "Programme d'entraînement : *dormir sur le tapis de course*.", e: 'dodo', sc: 'salle_sport', fx: 'criquets' },
    ],
    escalade: [
      { s: 'chat', t: "Une pompe… *deux pompes*… Je suis épuisé. Pause.", e: 'panique', fx: 'boing' },
      { s: 'chat', t: "Séance de cardio : je cours dans le couloir *à trois heures du matin*.", e: 'malicieux', sc: 'salon', fx: 'whoosh', m: 'rayons' },
      { s: 'narrateur', t: "Il a soulevé un haltère. C'était *un raisin sec*.", e: 'fier', fx: 'ding', m: 'cercle_rouge' },
      { s: 'chat', t: "Mon régime : *zéro croquette*. Juste du thon. Et des croquettes.", e: 'gourmand', fx: 'pop' },
      { s: 'humain', t: "Allez {nom}, encore une série !", e: 'neutre' },
      { s: 'chat', t: "Une série de plus et *je griffe ton tapis de yoga*.", e: 'colere', fx: 'feulement', m: 'feu' },
    ],
    twist: [
      { s: 'narrateur', t: "Résultat après un mois : *deux kilos de plus*. Que du muscle, selon lui.", e: 'fier', fx: 'fanfare', m: 'stonks' },
      { s: 'narrateur', t: "Il a gagné une médaille d'or. En *sieste olympique*.", e: 'dodo', fx: 'fanfare', m: 'confettis' },
      { s: 'chat', t: "Le sport, c'est *mauvais pour le dos*. Je l'ai lu sur Internet.", e: 'fier', fx: 'scratch', m: 'bruh' },
    ],
    titres: ["Mon chat s'est mis au sport (il a abandonné) 💪😹", "Le programme fitness de mon chat", "Mon chat coach sportif : la pire séance"],
    tags: ['#sport', '#fitness'],
  },
  {
    id: 'service_client', titre: 'Mon chat appelle le service client', emoji: '📞', cat: 'quotidien', absurde: 4,
    scenes: ['salon', 'bureau', 'salon'], acc: {}, persona: 'grincheux',
    hooks: [
      "Mon chat appelle le *service client*. Personne n'en est sorti indemne.",
      "POV : ton chat réclame un *remboursement* 📞",
      "Mon chat a appelé le fabricant de croquettes. *Il est furieux.*",
    ],
    setup: [
      { s: 'humain', t: "Service client bonjour, en quoi puis-je vous aider ?", e: 'neutre', sc: 'bureau', fx: 'ding' },
      { s: 'chat', t: "Votre croquette numéro quatre mille était *légèrement moins croquante*.", e: 'colere', sc: 'salon', fx: 'boom' },
    ],
    escalade: [
      { s: 'humain', t: "Pour les croquettes, tapez un. Pour une réclamation, tapez deux.", e: 'neutre' },
      { s: 'narrateur', t: "Il a marché sur le téléphone. Il a tapé *un, deux, deux, deux, deux, deux*.", e: 'malicieux', fx: 'glitch', m: 'bruh' },
      { s: 'chat', t: "Je veux parler à votre *supérieur*. Et à son chat.", e: 'colere', fx: 'scratch' },
      { s: 'humain', t: "Votre appel est important pour nous. Temps d'attente : *trois heures*.", e: 'neutre', fx: 'criquets', m: 'carton_temps' },
      { s: 'chat', t: "Trois heures ? Parfait. *Je fais une sieste* en attendant.", e: 'dodo', fx: 'boing' },
      { s: 'chat', t: "Je demande un dédommagement : *un camion de thon*. Et des excuses chantées.", e: 'fier', fx: 'cash', m: 'pluie_billets' },
    ],
    twist: [
      { s: 'narrateur', t: "Ils ont livré *une palette entière* de croquettes. Il ne joue qu'avec le carton.", e: 'fier', fx: 'fanfare', m: 'confettis' },
      { s: 'narrateur', t: "Le conseiller a démissionné. Il est devenu *moine*.", e: 'choque', fx: 'triste', m: 'degats' },
      { s: 'chat', t: "En fait, j'avais appelé *le mauvais numéro*. C'était le vétérinaire.", e: 'panique', fx: 'boom', m: 'plot_twist' },
    ],
    titres: ["Mon chat appelle le service client 📞😾", "Le conseiller n'était pas prêt pour mon chat", "Mon chat exige un remboursement (c'est tendu)"],
    tags: ['#serviceclient', '#reclamation'],
  },
  {
    id: 'rendez_vous', titre: 'Mon chat a un premier rendez-vous', emoji: '💘', cat: 'amour', absurde: 4,
    scenes: ['salon', 'restaurant', 'nuit', 'restaurant'], acc: { cou: 'noeud_pap' }, persona: 'dramatique',
    hooks: [
      "Mon chat a un *premier rendez-vous*. C'est un désastre.",
      "POV : ton chat s'inscrit sur une *appli de rencontre* 💘",
      "Mon chat est tombé amoureux. *De l'aspirateur.*",
    ],
    setup: [
      { s: 'narrateur', t: "{nom} a mis son plus beau nœud papillon. Et *trois litres de parfum*.", e: 'fier', sc: 'salon', fx: 'ding' },
      { s: 'chat', t: "Ce soir, je rencontre *Minouche*. Douze kilomètres à vol de souris.", e: 'amour', sc: 'restaurant', fx: 'pop', m: 'coeurs' },
    ],
    escalade: [
      { s: 'chat', t: "Bonsoir. Tu viens souvent… *sur ce toit* ?", e: 'malicieux', sc: 'nuit', fx: 'boing' },
      { s: 'narrateur', t: "Il commande le plat le plus cher. Puis il *mange celui de Minouche*.", e: 'gourmand', sc: 'restaurant', fx: 'scratch', m: 'bruh' },
      { s: 'chat', t: "Je suis indépendant, mystérieux… et *je dors dix-huit heures par jour*.", e: 'fier', fx: 'ding', m: 'lunettes' },
      { s: 'narrateur', t: "Silence gênant. Il fait tomber *la bougie*. Exprès.", e: 'malicieux', fx: 'criquets', m: 'criquets_txt' },
      { s: 'chat', t: "On se fait *un bisou de nez* ? C'est très sérieux chez nous.", e: 'amour', fx: 'pop', m: 'coeurs' },
    ],
    twist: [
      { s: 'narrateur', t: "Minouche est partie. *Avec le serveur.* Un berger allemand.", e: 'pleure', fx: 'triste', m: 'degats' },
      { s: 'narrateur', t: "Ils se sont mariés le lendemain. *Dans un carton.*", e: 'amour', fx: 'fanfare', m: 'confettis' },
      { s: 'chat', t: "Finalement, mon vrai grand amour, *c'est le radiateur*.", e: 'amour', fx: 'boom', m: 'plot_twist' },
    ],
    titres: ["Le premier rendez-vous de mon chat a mal tourné 💘😹", "Mon chat drague (c'est gênant)", "Mon chat a un date et c'est un désastre"],
    tags: ['#amour', '#rencontre'],
  },
];

/* ---------- Gabarit générique pour une idée libre ---------- */
export const GENERIC = {
  hooks: [
    "Mon chat {sujet}. *Personne* n'était prêt.",
    "POV : ton chat {sujet} 😳",
    "J'ai filmé mon chat qui {sujet}. *Regarde jusqu'à la fin.*",
  ],
  setup: [
    { s: 'narrateur', t: "Tout a commencé un mardi. {nom} avait *ce regard*.", e: 'suspicieux', fx: 'suspense' },
    { s: 'chat', t: "J'ai pris ma décision. *C'est mon destin.*", e: 'fier', fx: 'fanfare' },
  ],
  escalade: [
    { s: 'chat', t: "Je suis né pour ça. Enfin, *né pour dormir*, mais aussi pour ça.", e: 'fier', fx: 'ding' },
    { s: 'narrateur', t: "Premier problème : *il n'a pas de pouces*.", e: 'choque', fx: 'boom', m: 'cercle_rouge' },
    { s: 'chat', t: "Ne me regarde pas comme ça. *Je suis un professionnel.*", e: 'malicieux', fx: 'scratch', m: 'lunettes' },
    { s: 'narrateur', t: "Deuxième problème : il s'est *endormi au milieu*.", e: 'dodo', fx: 'criquets', m: 'carton_temps' },
    { s: 'chat', t: "Tout se passe *exactement comme prévu*.", e: 'fier', fx: 'boom', m: 'feu' },
    { s: 'narrateur', t: "Les voisins ont appelé *les pompiers*. Deux fois.", e: 'panique', fx: 'klaxon', m: 'rayons' },
  ],
  twist: [
    { s: 'narrateur', t: "Finalement, il a tout abandonné. Il a trouvé *un carton*. Fin.", e: 'amour', fx: 'triste', m: 'mission_echouee' },
    { s: 'narrateur', t: "Il a réussi. *Du premier coup.* Personne ne sait comment.", e: 'fier', fx: 'fanfare', m: 'stonks' },
    { s: 'chat', t: "Et maintenant, humain… *c'est ton tour*.", e: 'malicieux', fx: 'boom', m: 'plot_twist' },
  ],
  titres: ["Mon chat {sujet} (ça tourne mal) 😹", "POV : ton chat {sujet}", "J'ai filmé mon chat qui {sujet} 😳"],
};

/* ---------- CTA finaux humoristiques ---------- */
export const CTAS = [
  "Abonne-toi, sinon je fais tomber *ton téléphone*. Je plaisante. *Quoique.*",
  "Like, ou je vomis *sur ton oreiller* ce soir.",
  "Écris *MIAOU* en commentaire si tu veux la partie deux.",
  "Abonne-toi. C'est {nom} qui l'ordonne. *Maintenant.*",
  "Identifie quelqu'un dont le chat est *encore pire* que moi.",
  "Si tu scrolles, je fais *pipi dans ta chaussure*.",
  "Abonne-toi pour la suite. Il me reste *huit vies* à raconter.",
];

export const ENGAGEMENT = [
  "Ton chat ferait pareil ? 👇",
  "Identifie quelqu'un qui a un chat comme ça 😹",
  "Partie 2 ? Écris MIAOU 🐾",
  "Ton chat aurait fait quoi à sa place ? 👀",
  "Tu veux la suite ? Abonne-toi 🐱",
];

export const BASE_TAGS = ['#chat', '#chatdrole', '#humour', '#pourtoi', '#catsoftiktok', '#fyp', '#cat', '#drole', '#viral', '#chatmignon'];

/* ---------- Voix ---------- */
// es = réglages eSpeak (doublage FR gratuit), m = réglages « miaou-parlé », ai = voix IA (OpenAI), rate = accélération finale
export const VOICE_STYLES = {
  chaton:      { label: '🐣 Chaton mignon',      es: { variant: 'f5', pitch: 99, speed: 175 }, rate: 1.12, m: { f0: 620, range: 1.5, wave: 'tri' },
                 ai: { voice: 'shimmer', instr: "Voix de petit chaton très mignon, aiguë, enjouée et un peu capricieuse, en français." } },
  matou:       { label: '😼 Gros matou blasé',   es: { variant: 'm3', pitch: 12, speed: 140 }, rate: 0.95, m: { f0: 190, range: 1.25, wave: 'saw' },
                 ai: { voice: 'onyx', instr: "Voix grave de gros chat blasé et paresseux, lente, pleine de mépris, en français." } },
  diva:        { label: '🎭 Diva dramatique',    es: { variant: 'f2', pitch: 80, speed: 150 }, rate: 1.05, m: { f0: 460, range: 1.9, wave: 'tri' },
                 ai: { voice: 'coral', instr: "Voix de diva théâtrale ultra dramatique, qui exagère chaque émotion, en français." } },
  genie:       { label: '🧠 Génie robotique',    es: { variant: 'klatt2', pitch: 55, speed: 165 }, rate: 1.0, m: { f0: 330, range: 1.1, wave: 'square' },
                 ai: { voice: 'echo', instr: "Voix de petit génie arrogant et très sûr de lui, articulée et rapide, en français." } },
  mafieux:     { label: '🕶️ Parrain chuchoté',  es: { variant: 'whisper', pitch: 25, speed: 130 }, rate: 0.95, m: { f0: 170, range: 1.15, wave: 'saw' },
                 ai: { voice: 'ash', instr: "Voix de parrain de la mafia, rauque, lente, menaçante et chuchotée, en français." } },
  influenceur: { label: '📱 Influenceur surexcité', es: { variant: 'f4', pitch: 75, speed: 200 }, rate: 1.15, m: { f0: 520, range: 1.7, wave: 'tri' },
                 ai: { voice: 'nova', instr: "Voix d'influenceur surexcité, très rapide, énergique, qui crie presque, en français." } },
};

export const NARRATOR_STYLES = {
  narrateur: { label: '🎙️ Narrateur documentaire', es: { variant: 'm1', pitch: 38, speed: 185 }, rate: 1.0,
               ai: { voice: 'fable', instr: "Narrateur de documentaire animalier, sérieux et solennel, en français." } },
  humain:    { label: '👤 Humain dépassé', es: { variant: 'f1', pitch: 60, speed: 185 }, rate: 1.0,
               ai: { voice: 'sage', instr: "Voix d'humain fatigué et dépassé par son chat, naturelle, en français." } },
};

export const VOICE_ENGINES = {
  miaou:      { label: '🐾 Miaou-parlé + narrateur FR (gratuit, exporté)', export: true },
  espeak:     { label: '🗣️ Doublage FR synthétique (gratuit, exporté)', export: true },
  ia:         { label: '✨ Doublage FR IA premium (clé API, exporté)', export: true, needsApi: 'tts' },
  navigateur: { label: '🌐 Voix du navigateur (aperçu uniquement)', export: false },
  aucune:     { label: '🔇 Sans voix (sous-titres seuls)', export: true },
};

/* ---------- Musiques ---------- */
export const MUSICS = {
  comedie:  { label: '🎻 Comédie pizzicato', bpm: 128 },
  phonk:    { label: '🥁 Phonk drôle (tendance)', bpm: 140 },
  suspense: { label: '🕵️ Suspense ridicule', bpm: 96 },
  epique:   { label: '⚔️ Épique exagéré', bpm: 110 },
  lofi:     { label: '☕ Lo-fi chill', bpm: 84 },
  aucune:   { label: '🔇 Sans musique', bpm: 0 },
};
