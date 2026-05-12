/**
 * Contenu des 10 leçons thématiques — Kurmandji
 * Chaque leçon contient : vocabulaire, phrases d'exemple et métadonnées.
 * Les exercices sont générés dynamiquement depuis le vocabulaire.
 */

// ─── Utilitaires ──────────────────────────────────────────────────────────────
export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

/**
 * Génère 5 exercices variés à partir du vocabulaire et des exemples d'une leçon.
 * Types : mc-kd-fr, mc-fr-kd, matching, fill-blank, write
 */
export function generateExercises(lesson) {
  const v   = shuffle(lesson.vocabulary)   // vocabulaire mélangé
  const ex  = lesson.examples
  const all = lesson.vocabulary            // toutes les entrées (non mélangées pour options)
  const exercises = []

  // ── 1. QCM kurmandji → français ──────────────────────────────────────────
  const wrongsFr = shuffle(all.filter(x => x.kd !== v[0].kd)).slice(0, 3).map(x => x.fr)
  exercises.push({
    type: 'mc-kd-fr',
    question: v[0].kd,
    phonetic: v[0].phonetic,
    correct: v[0].fr,
    options: shuffle([v[0].fr, ...wrongsFr]),
  })

  // ── 2. QCM français → kurmandji ──────────────────────────────────────────
  const wrongsKd = shuffle(all.filter(x => x.kd !== v[1].kd)).slice(0, 3).map(x => x.kd)
  exercises.push({
    type: 'mc-fr-kd',
    question: v[1].fr,
    correct: v[1].kd,
    options: shuffle([v[1].kd, ...wrongsKd]),
  })

  // ── 3. Association (4 paires) ─────────────────────────────────────────────
  exercises.push({
    type: 'matching',
    pairs: v.slice(2, 6).map(x => ({ kd: x.kd, fr: x.fr })),
  })

  // ── 4. Compléter la phrase ────────────────────────────────────────────────
  // Cherche un exemple contenant un mot du vocabulaire à remplacer
  let fillAdded = false
  for (const example of ex) {
    const target = all.find(w => example.kd.includes(w.kd) && w.kd.length > 2)
    if (target) {
      const opts = shuffle(all.filter(x => x.kd !== target.kd)).slice(0, 2).map(x => x.kd)
      exercises.push({
        type: 'fill-blank',
        sentence_kd: example.kd.replace(target.kd, '___'),
        sentence_fr: example.fr,
        correct: target.kd,
        options: shuffle([target.kd, ...opts]),
      })
      fillAdded = true
      break
    }
  }
  if (!fillAdded) {
    // Fallback : QCM supplémentaire
    const wIdx = v[6] ? 6 : 0
    const wFr2 = shuffle(all.filter(x => x.kd !== v[wIdx].kd)).slice(0, 3).map(x => x.fr)
    exercises.push({
      type: 'mc-kd-fr',
      question: v[wIdx].kd,
      phonetic: v[wIdx].phonetic,
      correct: v[wIdx].fr,
      options: shuffle([v[wIdx].fr, ...wFr2]),
    })
  }

  // ── 5. Écrire ─────────────────────────────────────────────────────────────
  const wIdx = v[7] ? 7 : 1
  exercises.push({
    type: 'write',
    question: v[wIdx].fr,
    correct: v[wIdx].kd,
    phonetic: v[wIdx].phonetic,
  })

  // ── 6 & 7. Remettre les mots dans le bon ordre ────────────────────────────
  const eligible = ex.filter(e => e.kd.trim().split(/\s+/).length >= 3)
  const woExamples = shuffle(eligible).slice(0, 2)
  for (const example of woExamples) {
    const tokens = example.kd.trim().split(/\s+/)
    let shuffledTokens = shuffle(tokens)
    // S'assurer que l'ordre diffère de l'original (au moins 1 mot déplacé)
    let tries = 0
    while (shuffledTokens.join(' ') === tokens.join(' ') && tries < 10) {
      shuffledTokens = shuffle(tokens)
      tries++
    }
    exercises.push({
      type: 'word-order',
      sentence_fr: example.fr,
      tokens,
      shuffled: shuffledTokens,
    })
  }

  return exercises
}

/** Normalise un mot kurde pour comparaison tolérante aux diacritiques */
export function normalizeKd(str) {
  return str
    .toLowerCase()
    .replace(/ê/g, 'e').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/ç/g, 'c').replace(/ş/g, 's').replace(/x/g, 'h')
    .trim()
}

// ─── Les 10 leçons ────────────────────────────────────────────────────────────
export const LESSONS = [
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title_kd: 'Silav û Oxir',
    title_fr: 'Salutations & Au revoir',
    icon: '👋',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    vocabulary: [
      { kd: 'Silav',          fr: 'Salut',                       phonetic: 'si-lav' },
      { kd: 'Rojbaş',         fr: 'Bonjour',                     phonetic: 'roj-bash' },
      { kd: 'Êvarbaş',        fr: 'Bonsoir',                     phonetic: 'ê-var-bash' },
      { kd: 'Şevbaş',         fr: 'Bonne nuit',                  phonetic: 'chev-bash' },
      { kd: 'Oxir',           fr: 'Au revoir',                   phonetic: 'o-xir' },
      { kd: 'Bi xatirê te',   fr: 'Au revoir (formel)',          phonetic: 'bi xa-ti-rê té' },
      { kd: 'Çawa yî?',       fr: 'Comment vas-tu ?',            phonetic: 'cha-wa yî' },
      { kd: 'Ez baş im',      fr: 'Je vais bien',                phonetic: 'ez bash im' },
      { kd: 'Spas',           fr: 'Merci',                       phonetic: 'spas' },
      { kd: 'Kerem bike',     fr: "De rien / S'il te plaît",     phonetic: 'ke-rem bi-ké' },
      { kd: 'Baş e',          fr: "D'accord / C'est bien",       phonetic: 'bash é' },
      { kd: 'Hevallo',        fr: 'Mon ami(e)',                  phonetic: 'he-val-lo' },
    ],
    examples: [
      { kd: 'Silav, ez Diyar im.',         fr: 'Salut, je suis Diyar.',               phonetic: 'si-lav, ez di-yar im' },
      { kd: 'Rojbaş! Çawa yî?',            fr: 'Bonjour ! Comment vas-tu ?',           phonetic: 'roj-bash! cha-wa yî?' },
      { kd: 'Ez baş im, spas. Tu çawa yî?',fr: 'Je vais bien, merci. Et toi ?',       phonetic: 'ez bash im, spas. tu cha-wa yî?' },
      { kd: 'Bi xatirê te, hevallo.',      fr: 'Au revoir, mon ami.',                  phonetic: 'bi xa-ti-rê té, he-val-lo' },
      { kd: 'Şevbaş, xewên xweş.',         fr: 'Bonne nuit, fais de beaux rêves.',     phonetic: 'chev-bash, xe-wên xwech' },
      { kd: 'Kerem bike, rûne.',            fr: "De rien, assieds-toi.",                phonetic: 'ke-rem bi-ké, rû-né' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title_kd: 'Malbat',
    title_fr: 'La famille',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-rose-400 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    vocabulary: [
      { kd: 'Dê / Dayik',  fr: 'Mère',               phonetic: 'dê / da-yik' },
      { kd: 'Bav / Bab',   fr: 'Père',                phonetic: 'bav / bab' },
      { kd: 'Bira',        fr: 'Frère',               phonetic: 'bi-ra' },
      { kd: 'Xwişk',       fr: 'Sœur',                phonetic: 'khwichk' },
      { kd: 'Kur',         fr: 'Fils / Garçon',       phonetic: 'kour' },
      { kd: 'Keç',         fr: 'Fille',               phonetic: 'ketch' },
      { kd: 'Bapîr',       fr: 'Grand-père',          phonetic: 'ba-pîr' },
      { kd: 'Dapîr',       fr: 'Grand-mère',          phonetic: 'da-pîr' },
      { kd: 'Mam',         fr: 'Oncle (paternel)',    phonetic: 'mam' },
      { kd: 'Xal',         fr: 'Oncle (maternel)',    phonetic: 'xal' },
      { kd: 'Met',         fr: 'Tante (paternelle)',  phonetic: 'met' },
      { kd: 'Xaltî',       fr: 'Tante (maternelle)',  phonetic: 'xal-tî' },
      { kd: 'Jin',         fr: 'Femme / Épouse',      phonetic: 'jin' },
      { kd: 'Mêr',         fr: 'Mari',                phonetic: 'mêr' },
    ],
    examples: [
      { kd: 'Malbata min mezin e.',         fr: 'Ma famille est grande.',              phonetic: 'mal-ba-ta min me-zin é' },
      { kd: 'Bav û dê min li malê ne.',     fr: 'Mon père et ma mère sont à la maison.', phonetic: 'bav û dê min li ma-lê né' },
      { kd: 'Birayê min du sal ji min mezintir e.', fr: 'Mon frère a deux ans de plus que moi.', phonetic: 'bi-ra-yê min du sal ji min me-zin-tir é' },
      { kd: 'Xwişka min li Stenbolê dixwîne.', fr: 'Ma sœur étudie à Istanbul.',       phonetic: 'khwichk-a min li sten-bo-lê di-khwî-né' },
      { kd: 'Bapîr û dapîra min bi hev re dijîn.', fr: 'Mon grand-père et ma grand-mère vivent ensemble.', phonetic: 'ba-pîr û da-pî-ra min bi hev ré di-jîn' },
      { kd: 'Keça mam û metê min kêfxweş e.', fr: "La fille de mon oncle et de ma tante est joyeuse.", phonetic: 'ke-ça mam û me-tê min kêf-xwech é' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title_kd: 'Hejmar',
    title_fr: 'Les nombres',
    icon: '🔢',
    color: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    vocabulary: [
      { kd: 'Yek',    fr: '1 — Un',      phonetic: 'yek' },
      { kd: 'Du',     fr: '2 — Deux',    phonetic: 'dou' },
      { kd: 'Sê',     fr: '3 — Trois',   phonetic: 'sê' },
      { kd: 'Çar',    fr: '4 — Quatre',  phonetic: 'tchar' },
      { kd: 'Pênc',   fr: '5 — Cinq',    phonetic: 'pênts' },
      { kd: 'Şeş',    fr: '6 — Six',     phonetic: 'chéch' },
      { kd: 'Heft',   fr: '7 — Sept',    phonetic: 'heft' },
      { kd: 'Heşt',   fr: '8 — Huit',    phonetic: 'hecht' },
      { kd: 'Neh',    fr: '9 — Neuf',    phonetic: 'neh' },
      { kd: 'Deh',    fr: '10 — Dix',    phonetic: 'deh' },
      { kd: 'Bîst',   fr: '20 — Vingt',  phonetic: 'bîst' },
      { kd: 'Sî',     fr: '30 — Trente', phonetic: 'sî' },
      { kd: 'Çil',    fr: '40 — Quarante', phonetic: 'tchil' },
      { kd: 'Pêncî',  fr: '50 — Cinquante', phonetic: 'pên-tsî' },
      { kd: 'Sed',    fr: '100 — Cent',  phonetic: 'sed' },
    ],
    examples: [
      { kd: 'Malbata min pênc kes in.',       fr: 'Ma famille est composée de cinq personnes.', phonetic: 'mal-ba-ta min pênts kes in' },
      { kd: 'Ez bîst û deh salî me.',         fr: "J'ai trente ans.",                phonetic: 'ez bîst û deh sa-lî mé' },
      { kd: 'Sed peyv fêr bibe!',             fr: 'Apprends cent mots !',            phonetic: 'sed peyv fêr bi-bé' },
      { kd: 'Yek, du, sê — em diçin!',        fr: 'Un, deux, trois — on y va !',     phonetic: 'yek, dou, sê — em di-tchin' },
      { kd: 'Biha çil û pênc e.',             fr: 'Le prix est quarante-cinq.',       phonetic: 'bi-ha tchil û pênts é' },
      { kd: 'Heft roj heft tişt fêr bibe.',   fr: 'Apprends sept choses en sept jours.', phonetic: 'heft roj heft tichht fêr bi-bé' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title_kd: 'Reng',
    title_fr: 'Les couleurs',
    icon: '🎨',
    color: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    vocabulary: [
      { kd: 'Sor',       fr: 'Rouge',    phonetic: 'sor' },
      { kd: 'Kesk',      fr: 'Vert',     phonetic: 'kesk' },
      { kd: 'Şîn',       fr: 'Bleu',     phonetic: 'chîn' },
      { kd: 'Zer',       fr: 'Jaune',    phonetic: 'zer' },
      { kd: 'Reş',       fr: 'Noir',     phonetic: 'rech' },
      { kd: 'Spî',       fr: 'Blanc',    phonetic: 'spî' },
      { kd: 'Qehweyî',   fr: 'Marron',   phonetic: 'qeh-wey-yî' },
      { kd: 'Pembe',     fr: 'Rose',     phonetic: 'pem-bé' },
      { kd: 'Gewr',      fr: 'Gris',     phonetic: 'gewhr' },
      { kd: 'Porteqalî', fr: 'Orange',   phonetic: 'por-te-qa-lî' },
      { kd: 'Mor',       fr: 'Violet',   phonetic: 'mor' },
      { kd: 'Xweş',      fr: 'Beau / Belle',  phonetic: 'khwech' },
    ],
    examples: [
      { kd: 'Gula sor gelek xweş e.',           fr: 'La rose rouge est très belle.',     phonetic: 'gou-la sor ge-lek khwech é' },
      { kd: 'Ala Kurdistanê sor, spî û kesk e.', fr: 'Le drapeau du Kurdistan est rouge, blanc et vert.', phonetic: 'a-la Kur-dis-ta-nê sor, spî û kesk é' },
      { kd: 'Çavên wê şîn in.',                 fr: 'Ses yeux sont bleus.',              phonetic: 'tcha-vên wê chîn in' },
      { kd: 'Zivistan spî ye.',                  fr: "L'hiver est blanc.",                phonetic: 'zi-vis-tan spî yé' },
      { kd: 'Roj zer e.',                        fr: 'Le soleil est jaune.',              phonetic: 'roj zer é' },
      { kd: 'Şev reş e.',                        fr: 'La nuit est noire.',                phonetic: 'chev rech é' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title_kd: 'Xwarin û Vexwarin',
    title_fr: 'Nourriture & Boissons',
    icon: '🍽️',
    color: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    vocabulary: [
      { kd: 'Nan',      fr: 'Pain',       phonetic: 'nan' },
      { kd: 'Av',       fr: 'Eau',        phonetic: 'av' },
      { kd: 'Çay',      fr: 'Thé',        phonetic: 'tchay' },
      { kd: 'Şîr',      fr: 'Lait',       phonetic: 'chîr' },
      { kd: 'Goşt',     fr: 'Viande',     phonetic: 'gocht' },
      { kd: 'Birinc',   fr: 'Riz',        phonetic: 'bi-rinc' },
      { kd: 'Mast',     fr: 'Yaourt',     phonetic: 'mast' },
      { kd: 'Penîr',    fr: 'Fromage',    phonetic: 'pe-nîr' },
      { kd: 'Fêkî',     fr: 'Fruit',      phonetic: 'fê-kî' },
      { kd: 'Sebze',    fr: 'Légume',     phonetic: 'seb-zé' },
      { kd: 'Rûn',      fr: 'Beurre',     phonetic: 'rûn' },
      { kd: 'Şekir',    fr: 'Sucre',      phonetic: 'che-kir' },
      { kd: 'Xwê',      fr: 'Sel',        phonetic: 'khwê' },
      { kd: 'Tirs',     fr: 'Concombre',  phonetic: 'tirs' },
      { kd: 'Firingî',  fr: 'Tomate',     phonetic: 'fi-rin-gî' },
    ],
    examples: [
      { kd: 'Çay û nan amade ye.',           fr: 'Le thé et le pain sont prêts.',      phonetic: 'tchay û nan a-ma-dé yé' },
      { kd: 'Ez dixwazim çay vexwim.',       fr: 'Je veux boire du thé.',              phonetic: 'ez di-khwa-zim tchay ve-khwim' },
      { kd: 'Nan gelek girîng e.',           fr: 'Le pain est très important.',        phonetic: 'nan ge-lek gi-rîng é' },
      { kd: 'Goşt û birinc xwarina me ye.', fr: 'La viande et le riz, c\'est notre nourriture.', phonetic: 'gocht û bi-rinc khwa-ri-na mé yé' },
      { kd: 'Penîr û mast bi hev re.',       fr: 'Le fromage et le yaourt ensemble.', phonetic: 'pe-nîr û mast bi hev ré' },
      { kd: 'Fêkî û sebze ji tenduristiyê re baş in.', fr: 'Les fruits et légumes sont bons pour la santé.', phonetic: 'fê-kî û seb-zé ji ten-du-ris-ti-yê ré bach in' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title_kd: 'Laş û Tendûrûstî',
    title_fr: 'Corps & Santé',
    icon: '💪',
    color: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    vocabulary: [
      { kd: 'Ser',    fr: 'Tête',       phonetic: 'ser' },
      { kd: 'Çav',    fr: 'Œil',        phonetic: 'tchav' },
      { kd: 'Guh',    fr: 'Oreille',    phonetic: 'gouh' },
      { kd: 'Poz',    fr: 'Nez',        phonetic: 'poz' },
      { kd: 'Dev',    fr: 'Bouche',     phonetic: 'dev' },
      { kd: 'Dest',   fr: 'Main',       phonetic: 'dest' },
      { kd: 'Pê',     fr: 'Pied',       phonetic: 'pê' },
      { kd: 'Dil',    fr: 'Cœur',       phonetic: 'dil' },
      { kd: 'Pişt',   fr: 'Dos',        phonetic: 'picht' },
      { kd: 'Zik',    fr: 'Ventre',     phonetic: 'zik' },
      { kd: 'Stû',    fr: 'Cou',        phonetic: 'stû' },
      { kd: 'Gir',    fr: 'Bras',       phonetic: 'gir' },
      { kd: 'Tilî',   fr: 'Doigt',      phonetic: 'ti-lî' },
      { kd: 'Çerm',   fr: 'Peau',       phonetic: 'tcherm' },
    ],
    examples: [
      { kd: 'Sera min diêşe.',             fr: "J'ai mal à la tête.",            phonetic: 'se-ra min di-ê-ché' },
      { kd: 'Çavên te gelek xweş in.',     fr: 'Tes yeux sont très beaux.',      phonetic: 'tcha-vên té ge-lek khwech in' },
      { kd: 'Zika min diêşe.',             fr: "J'ai mal au ventre.",            phonetic: 'zi-ka min di-ê-ché' },
      { kd: 'Destên te germ in.',          fr: 'Tes mains sont chaudes.',        phonetic: 'des-tên té germ in' },
      { kd: 'Dil ji her tiştî girîngtir e.', fr: 'Le cœur est plus important que tout.', phonetic: 'dil ji her tich-tî gi-rîng-tir é' },
      { kd: 'Pêyên wî mezin in.',          fr: 'Ses pieds sont grands.',         phonetic: 'pê-yên wî me-zin in' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title_kd: 'Mal û Ode',
    title_fr: 'Maison & Pièces',
    icon: '🏠',
    color: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-800',
    vocabulary: [
      { kd: 'Mal',      fr: 'Maison',          phonetic: 'mal' },
      { kd: 'Ode',      fr: 'Chambre',         phonetic: 'o-dé' },
      { kd: 'Metbex',   fr: 'Cuisine',         phonetic: 'met-bex' },
      { kd: 'Serşok',   fr: 'Salle de bain',   phonetic: 'ser-chok' },
      { kd: 'Salon',    fr: 'Salon',           phonetic: 'sa-lon' },
      { kd: 'Derî',     fr: 'Porte',           phonetic: 'de-rî' },
      { kd: 'Pencere',  fr: 'Fenêtre',         phonetic: 'pen-tche-ré' },
      { kd: 'Textê',    fr: 'Lit',             phonetic: 'tex-tê' },
      { kd: 'Kursî',    fr: 'Chaise',          phonetic: 'kour-sî' },
      { kd: 'Mase',     fr: 'Table',           phonetic: 'ma-sé' },
      { kd: 'Dolav',    fr: 'Armoire',         phonetic: 'do-lav' },
      { kd: 'Bax',      fr: 'Jardin',          phonetic: 'bax' },
      { kd: 'Hewş',     fr: 'Cour',            phonetic: 'hewch' },
      { kd: 'Ban',      fr: 'Toit',            phonetic: 'ban' },
    ],
    examples: [
      { kd: 'Mala me mezin e.',              fr: 'Notre maison est grande.',           phonetic: 'ma-la mé me-zin é' },
      { kd: 'Pencere veke, hewa xweş e.',    fr: 'Ouvre la fenêtre, l\'air est bon.',  phonetic: 'pen-tche-ré ve-ké, he-wa khwech é' },
      { kd: 'Oda min li jor e.',             fr: 'Ma chambre est en haut.',            phonetic: 'o-da min li jor é' },
      { kd: 'Li metbexê nan çêdikim.',       fr: 'Je fais du pain dans la cuisine.',   phonetic: 'li met-be-xê nan tchê-di-kim' },
      { kd: 'Kursî li ber maseyê ye.',       fr: 'La chaise est devant la table.',     phonetic: 'kour-sî li ber ma-se-yê yé' },
      { kd: 'Baxê me gulên gelek hene.',     fr: 'Notre jardin a beaucoup de fleurs.', phonetic: 'ba-xê mé gou-lên ge-lek hé-né' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title_kd: 'Demsal û Hewa',
    title_fr: 'Saisons & Météo',
    icon: '🌤️',
    color: 'from-sky-400 to-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-200 dark:border-sky-800',
    vocabulary: [
      { kd: 'Bihar',     fr: 'Printemps', phonetic: 'bi-har' },
      { kd: 'Havîn',     fr: 'Été',       phonetic: 'ha-vîn' },
      { kd: 'Payîz',     fr: 'Automne',   phonetic: 'pa-yîz' },
      { kd: 'Zivistan',  fr: 'Hiver',     phonetic: 'zi-vis-tan' },
      { kd: 'Tav',       fr: 'Soleil',    phonetic: 'tav' },
      { kd: 'Baran',     fr: 'Pluie',     phonetic: 'ba-ran' },
      { kd: 'Berf',      fr: 'Neige',     phonetic: 'berf' },
      { kd: 'Ba',        fr: 'Vent',      phonetic: 'ba' },
      { kd: 'Ewr',       fr: 'Nuage',     phonetic: 'ewhr' },
      { kd: 'Germ',      fr: 'Chaud',     phonetic: 'germ' },
      { kd: 'Sar',       fr: 'Froid',     phonetic: 'sar' },
      { kd: 'Hênik',     fr: 'Frais',     phonetic: 'hê-nik' },
      { kd: 'Şil',       fr: 'Humide',    phonetic: 'chil' },
      { kd: 'Zuwa',      fr: 'Sec',       phonetic: 'zu-wa' },
    ],
    examples: [
      { kd: 'Îro hewa gelek germ e.',         fr: "Aujourd'hui il fait très chaud.",   phonetic: 'î-ro he-wa ge-lek germ é' },
      { kd: 'Bihar hema tê.',                 fr: 'Le printemps arrive bientôt.',      phonetic: 'bi-har he-ma tê' },
      { kd: 'Zivistan sar û berfîn e.',       fr: "L'hiver est froid et neigeux.",     phonetic: 'zi-vis-tan sar û ber-fîn é' },
      { kd: 'Baran dibare, em diçin nav malê.', fr: 'Il pleut, nous rentrons.',        phonetic: 'ba-ran di-ba-ré, em di-tchin nav ma-lê' },
      { kd: 'Havîn tav gelek tîj e.',         fr: "En été le soleil est fort.",        phonetic: 'ha-vîn tav ge-lek tîj é' },
      { kd: 'Payîz ewrên tarî anî.',          fr: "L'automne a amené des nuages sombres.", phonetic: 'pa-yîz ewh-rên ta-rî a-nî' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title_kd: 'Bazarî û Kirîn',
    title_fr: 'Au marché & Achats',
    icon: '🛒',
    color: 'from-lime-500 to-lime-700',
    bg: 'bg-lime-50 dark:bg-lime-900/20',
    border: 'border-lime-200 dark:border-lime-800',
    vocabulary: [
      { kd: 'Bazar',         fr: 'Marché',       phonetic: 'ba-zar' },
      { kd: 'Dikan',         fr: 'Magasin',      phonetic: 'di-kan' },
      { kd: 'Biha',          fr: 'Prix',         phonetic: 'bi-ha' },
      { kd: 'Kirîn',         fr: 'Acheter',      phonetic: 'ki-rîn' },
      { kd: 'Firotin',       fr: 'Vendre',       phonetic: 'fi-ro-tin' },
      { kd: 'Pere',          fr: 'Argent',       phonetic: 'pe-ré' },
      { kd: 'Erzan',         fr: 'Pas cher',     phonetic: 'er-zan' },
      { kd: 'Buha',          fr: 'Cher',         phonetic: 'bu-ha' },
      { kd: 'Çiqas e?',      fr: 'Combien ?',    phonetic: 'tchi-qas é' },
      { kd: 'Ez dixwazim',   fr: 'Je veux',      phonetic: 'ez di-khwa-zim' },
      { kd: 'Ev bes e',      fr: "C'est assez",  phonetic: 'ev bes é' },
      { kd: 'Kêmtir',        fr: 'Moins',        phonetic: 'kêm-tir' },
      { kd: 'Zêdetir',       fr: 'Plus',         phonetic: 'zê-de-tir' },
      { kd: 'Poşet',         fr: 'Sac',          phonetic: 'po-chet' },
    ],
    examples: [
      { kd: 'Ev çiqas e?',                   fr: 'Combien ça coûte ?',             phonetic: 'ev tchi-qas é?' },
      { kd: 'Gelek buha ye, kêmtir bike.',   fr: "C'est trop cher, fais moins.",   phonetic: 'ge-lek bu-ha yé, kêm-tir bi-ké' },
      { kd: 'Ez dixwazim du kîlo firingî.',  fr: 'Je veux deux kilos de tomates.', phonetic: 'ez di-khwa-zim dou kî-lo fi-rin-gî' },
      { kd: 'Ev erzan e, spas.',             fr: "C'est pas cher, merci.",          phonetic: 'ev er-zan é, spas' },
      { kd: 'Poşetek bidê min, kerem bike.', fr: 'Donne-moi un sac, s.t.p.',       phonetic: 'po-che-tek bi-dê min, ke-rem bi-ké' },
      { kd: 'Bazarê sibê ye.',               fr: 'Le marché est demain matin.',     phonetic: 'ba-za-rê si-bê yé' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 10,
    title_kd: 'Rêwîtî û Cih',
    title_fr: 'Voyage & Lieux',
    icon: '✈️',
    color: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    vocabulary: [
      { kd: 'Rê',         fr: 'Route / Chemin', phonetic: 'rê' },
      { kd: 'Tirên',      fr: 'Train',          phonetic: 'ti-rên' },
      { kd: 'Otobûs',     fr: 'Bus',            phonetic: 'o-to-bûs' },
      { kd: 'Balafir',    fr: 'Avion',          phonetic: 'ba-la-fir' },
      { kd: 'Otêl',       fr: 'Hôtel',          phonetic: 'o-têl' },
      { kd: 'Hewageh',    fr: 'Aéroport',       phonetic: 'he-wa-geh' },
      { kd: 'Wistgeh',    fr: 'Gare',           phonetic: 'wist-geh' },
      { kd: 'Li ku?',     fr: 'Où ?',           phonetic: 'li kou?' },
      { kd: 'Nêzîk',      fr: 'Proche',         phonetic: 'nê-zîk' },
      { kd: 'Dûr',        fr: 'Loin',           phonetic: 'dûr' },
      { kd: 'Rast',       fr: 'Droite',         phonetic: 'rast' },
      { kd: 'Çep',        fr: 'Gauche',         phonetic: 'tchep' },
      { kd: 'Rasterast',  fr: 'Tout droit',     phonetic: 'ras-te-rast' },
      { kd: 'Pasaport',   fr: 'Passeport',      phonetic: 'pa-sa-port' },
    ],
    examples: [
      { kd: 'Wistgeh li ku ye?',             fr: 'Où est la gare ?',              phonetic: 'wist-geh li kou yé?' },
      { kd: 'Rasterast here, piştre çep.',   fr: 'Vas tout droit, puis à gauche.', phonetic: 'ras-te-rast hé-ré, pich-tré tchep' },
      { kd: 'Balafir du saet dereng e.',     fr: "L'avion a deux heures de retard.", phonetic: 'ba-la-fir dou sa-et de-reng é' },
      { kd: 'Otêl nêzîkê bazêr e.',         fr: "L'hôtel est proche du marché.",  phonetic: 'o-têl nê-zî-kê ba-zêr é' },
      { kd: 'Pasaporta min li otêlê ye.',    fr: 'Mon passeport est à l\'hôtel.',  phonetic: 'pa-sa-por-ta min li o-têlê yé' },
      { kd: 'Rê dûr e, em bisûre herin.',   fr: 'Le chemin est long, partons vite.', phonetic: 'rê dûr é, em bi-sou-ré he-rin' },
    ],
  },
]
