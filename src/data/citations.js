/**
 * citations.js — 30 citations inspirantes sur la langue maternelle et l'identité kurde
 * Affichées en modal après connexion (une par session, aléatoire).
 */

export const CITATIONS = [
  // ── Proverbes kurdes ─────────────────────────────────────────────────────────
  {
    kd: "Zimanê dayikê, ruhê miletê ye.",
    fr: "La langue maternelle est l'âme d'un peuple.",
    source: "Proverbe kurde",
  },
  {
    kd: "Ziman mal e, bê ziman em bê mal in.",
    fr: "La langue est un foyer, sans langue nous sommes sans foyer.",
    source: "Proverbe kurde",
  },
  {
    kd: "Zimanê te, dîroka te ye.",
    fr: "Ta langue, c'est ton histoire.",
    source: "Proverbe kurde",
  },
  {
    kd: "Mirovê ku zimanê xwe ji bîr dike, koka xwe ji bîr dike.",
    fr: "Celui qui oublie sa langue oublie ses racines.",
    source: "Proverbe kurde",
  },
  {
    kd: "Çiya hevalê kurdan in.",
    fr: "Les montagnes sont les amis des Kurdes.",
    source: "Proverbe kurde",
  },
  {
    kd: "Heval ji birayê xwînê çêtir e.",
    fr: "Un ami est mieux qu'un frère de sang.",
    source: "Proverbe kurde",
  },
  {
    kd: "Bê ziman, bê ruh î.",
    fr: "Sans langue, tu es sans âme.",
    source: "Proverbe kurde",
  },
  {
    kd: "Zimanê mirov, nîşana dilê wî ye.",
    fr: "La langue d'un homme est le reflet de son coeur.",
    source: "Proverbe kurde",
  },
  {
    kd: "Welatê te li ku ye? Li zimanê te ye.",
    fr: "Où est ta patrie ? Elle est dans ta langue.",
    source: "Proverbe kurde",
  },
  {
    kd: "Zimanê ku tê de mêteng dibê, dikeve.",
    fr: "La langue dans laquelle on cesse de penser, meurt.",
    source: "Proverbe kurde",
  },

  // ── Citations sur l'apprentissage et la langue ────────────────────────────────
  {
    kd: "Hîn bûna zimanê dayikê ne tenê fêrbûn e, ew vegerîna malê ye.",
    fr: "Apprendre sa langue maternelle, ce n'est pas seulement apprendre, c'est rentrer chez soi.",
    source: "Sagesse kurde",
  },
  {
    kd: "Her peyv ku hîn dibî, cotek bask in da ku bifirî.",
    fr: "Chaque mot que tu apprends est une paire d'ailes pour t'envoler.",
    source: "Sagesse kurde",
  },
  {
    kd: "Ziman dariştina dîrokê ye.",
    fr: "La langue est le tissu de l'histoire.",
    source: "Sagesse kurde",
  },
  {
    kd: "Fêrbûn ne xisletekê ye, jiyanek e.",
    fr: "Apprendre n'est pas une habitude, c'est une façon de vivre.",
    source: "Proverbe kurde",
  },
  {
    kd: "Zarokek bi zimanê xwe mezin dibe, mirovek bi zimanê xwe dimîne.",
    fr: "Un enfant grandit avec sa langue, un homme reste lui-même grâce à sa langue.",
    source: "Sagesse kurde",
  },

  // ── Citations de personnalités kurdes ─────────────────────────────────────────
  {
    kd: "Kurdî zimanê dilê min e.",
    fr: "Le kurde est la langue de mon coeur.",
    source: "Ahmadê Xanî (poète kurde, 1651–1707)",
  },
  {
    kd: "Me ziman û çand heye, ji ber vê me jiyan heye.",
    fr: "Nous avons une langue et une culture, c'est pourquoi nous avons une vie.",
    source: "Sagesse populaire kurde",
  },
  {
    kd: "Xezîneya herî mezin a kurdan zimanê wan e.",
    fr: "Le plus grand trésor des Kurdes, c'est leur langue.",
    source: "Cigerxwîn (poète kurde, 1903–1984)",
  },
  {
    kd: "Dema tu bi kurdî diaxivî, bapîrên xwe diafirînî.",
    fr: "Quand tu parles en kurde, tu fais revivre tes ancêtres.",
    source: "Sagesse kurde",
  },
  {
    kd: "Ji bo kurdan, ziman ne tenê ragihandin e — ew berxwedan e.",
    fr: "Pour les Kurdes, la langue n'est pas seulement communication — c'est résistance.",
    source: "Réflexion contemporaine",
  },

  // ── Citations universelles adaptées ──────────────────────────────────────────
  {
    kd: "Zimanek nû, jiyaneke nû.",
    fr: "Une nouvelle langue, c'est une nouvelle vie.",
    source: "Proverbe tchèque (adapté en kurde)",
  },
  {
    kd: "Kesê ku zimanekî nizane, welatekî nabîne.",
    fr: "Celui qui ne connaît pas une langue ne voit pas un pays.",
    source: "Goethe (adapté en kurde)",
  },
  {
    kd: "Ziman pira di navbera mirovan de ye.",
    fr: "La langue est le pont entre les êtres humains.",
    source: "Sagesse universelle",
  },
  {
    kd: "Fêrbûna zimanan deriyên nû vedikin.",
    fr: "Apprendre des langues ouvre de nouvelles portes.",
    source: "Sagesse universelle",
  },

  // ── Citations sur l'identité et les racines ───────────────────────────────────
  {
    kd: "Ziman bîranîn e — bê ziman, bê bîranîn.",
    fr: "La langue, c'est la mémoire — sans langue, pas de mémoire.",
    source: "Réflexion kurde",
  },
  {
    kd: "Her mirov bi zimanê xwe ye.",
    fr: "Chaque homme est fait de sa langue.",
    source: "Proverbe kurde",
  },
  {
    kd: "Azadiya herî mezin azadiya zimanê dayikê ye.",
    fr: "La plus grande liberté est la liberté de la langue maternelle.",
    source: "Sagesse kurde",
  },
  {
    kd: "Ev ziman ya me ye, em jî divê ziman biparêzin.",
    fr: "Cette langue est la nôtre, nous devons aussi protéger la langue.",
    source: "Proverbe kurde",
  },
  {
    kd: "Roj û roj derbas dibe, lê ziman dimîne.",
    fr: "Les jours passent, mais la langue demeure.",
    source: "Proverbe kurde",
  },
  {
    kd: "Dengê zimanê dayikê dengê malê ye.",
    fr: "Le son de la langue maternelle est le son du foyer.",
    source: "Sagesse populaire kurde",
  },
]

/**
 * Retourne une citation aléatoire, différente de la dernière montrée.
 */
export function getRandomCitation() {
  const lastKey = "ferbun_last_citation"
  const last = parseInt(sessionStorage.getItem(lastKey) ?? "-1", 10)

  let idx
  do {
    idx = Math.floor(Math.random() * CITATIONS.length)
  } while (idx === last && CITATIONS.length > 1)

  sessionStorage.setItem(lastKey, String(idx))
  return CITATIONS[idx]
}
