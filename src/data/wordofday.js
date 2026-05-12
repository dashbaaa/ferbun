/**
 * wordofday.js — Banque de 60 mots pour le "Mot du Jour" (Peyva Rojê)
 * L'index du jour = daysSinceEpoch % WORDS.length → même mot pour tous les utilisateurs.
 */

export const WORD_OF_DAY_BANK = [
  // ── Nature ──────────────────────────────────────────────────────────────────
  {
    kd: "Çiya", phonetic: "çi-ya", fr: "Montagne",
    example_kd: "Çiya hevalê kurdan in.",
    example_fr: "Les montagnes sont les amis des Kurdes.",
    cultural: "Proverbe kurde célèbre : le peuple kurde a longtemps trouvé refuge et liberté dans les montagnes.",
  },
  {
    kd: "Roj", phonetic: "roj", fr: "Soleil / Jour",
    example_kd: "Roj hat, tarî çû.",
    example_fr: "Le soleil est venu, l'obscurité est partie.",
    cultural: "Le soleil (roj) est un symbole central du Newroz, le Nouvel An kurde fêté le 21 mars.",
  },
  {
    kd: "Av", phonetic: "av", fr: "Eau",
    example_kd: "Av jiyan e.",
    example_fr: "L'eau, c'est la vie.",
  },
  {
    kd: "Agir", phonetic: "a-gir", fr: "Feu",
    example_kd: "Agirê Newrozê dibiriqe.",
    example_fr: "Le feu du Newroz brille.",
    cultural: "Le feu du Newroz symbolise la victoire contre l'oppression, allumé sur les collines chaque 21 mars.",
  },
  {
    kd: "Bahoz", phonetic: "ba-hoz", fr: "Tempête",
    example_kd: "Bahoz tê, xwe amade bike.",
    example_fr: "La tempête arrive, prépare-toi.",
  },
  {
    kd: "Çem", phonetic: "çem", fr: "Rivière / Fleuve",
    example_kd: "Çem ji çiyayê mezin tê.",
    example_fr: "La rivière vient de la grande montagne.",
  },
  {
    kd: "Heyv", phonetic: "heyv", fr: "Lune",
    example_kd: "Heyv şeva tarî ronî dike.",
    example_fr: "La lune éclaire la nuit sombre.",
  },
  {
    kd: "Stêr", phonetic: "stêr", fr: "Étoile",
    example_kd: "Stêrên ezman bêhejmar in.",
    example_fr: "Les étoiles du ciel sont innombrables.",
  },
  {
    kd: "Baran", phonetic: "ba-ran", fr: "Pluie",
    example_kd: "Baran dibare, erdê şîn dibe.",
    example_fr: "La pluie tombe, la terre devient verte.",
  },
  {
    kd: "Berf", phonetic: "berf", fr: "Neige",
    example_kd: "Berf li çiyê dibare.",
    example_fr: "La neige tombe sur la montagne.",
  },
  {
    kd: "Kulîlk", phonetic: "ku-lîlk", fr: "Fleur",
    example_kd: "Kulîlkên biharê xweş in.",
    example_fr: "Les fleurs du printemps sont belles.",
  },
  {
    kd: "Dar", phonetic: "dar", fr: "Arbre / Bois",
    example_kd: "Dara mezin siya xweş dide.",
    example_fr: "Le grand arbre donne une belle ombre.",
  },
  {
    kd: "Ezman", phonetic: "ez-man", fr: "Ciel",
    example_kd: "Ezman şîn û xweş e.",
    example_fr: "Le ciel est bleu et beau.",
  },
  {
    kd: "Siruşt", phonetic: "si-ruşt", fr: "Nature",
    example_kd: "Siruşta Kurdistanê gelek xweş e.",
    example_fr: "La nature du Kurdistan est très belle.",
  },
  {
    kd: "Zevî", phonetic: "ze-vî", fr: "Champ / Terre cultivée",
    example_kd: "Bavê min li zevîyê kar dike.",
    example_fr: "Mon père travaille dans le champ.",
  },

  // ── Peuple & Culture ─────────────────────────────────────────────────────────
  {
    kd: "Azadî", phonetic: "a-za-dî", fr: "Liberté",
    example_kd: "Azadî ji bo her kesî ye.",
    example_fr: "La liberté est pour tout le monde.",
    cultural: "Mot central de la culture et de la poésie kurdes, présent dans des centaines de chants et poèmes.",
  },
  {
    kd: "Welat", phonetic: "we-lat", fr: "Patrie / Pays natal",
    example_kd: "Welatê min di dilê min de ye.",
    example_fr: "Ma patrie est dans mon coeur.",
    cultural: "Mot très chargé émotionnellement pour la diaspora kurde, souvent chanté et récité.",
  },
  {
    kd: "Ziman", phonetic: "zi-man", fr: "Langue",
    example_kd: "Zimanê dayikê giranbiha ye.",
    example_fr: "La langue maternelle est précieuse.",
    cultural: "La langue est considérée comme l'âme du peuple kurde (ruhe millet).",
  },
  {
    kd: "Newroz", phonetic: "new-roz", fr: "Nouvel An kurde (21 mars)",
    example_kd: "Newroz pîrozbûn!",
    example_fr: "Bonne année — Joyeux Newroz !",
    cultural: "Fête du printemps et du renouveau célébrée le 21 mars par des millions de Kurdes dans le monde.",
  },
  {
    kd: "Dengbêj", phonetic: "deng-bêj", fr: "Barde / Chanteur traditionnel",
    example_kd: "Dengbêj çîroka kurdî distrê.",
    example_fr: "Le barde chante l'histoire kurde.",
    cultural: "Les dengbêj sont les gardiens de la mémoire orale kurde, transmettant l'histoire en chantant.",
  },
  {
    kd: "Govend", phonetic: "go-vend", fr: "Danse en cercle traditionnelle",
    example_kd: "Em govend dikin.",
    example_fr: "Nous dansons le govend.",
    cultural: "Danse collective traditionnelle où les participants se tiennent par les doigts ou les épaules.",
  },
  {
    kd: "Çand", phonetic: "çand", fr: "Culture",
    example_kd: "Çanda kurdan dewlemend e.",
    example_fr: "La culture kurde est riche.",
  },
  {
    kd: "Dîrok", phonetic: "dî-rok", fr: "Histoire",
    example_kd: "Dîroka kurdan dirêj e.",
    example_fr: "L'histoire des Kurdes est longue.",
  },
  {
    kd: "Bijî", phonetic: "bi-jî", fr: "Vive ! / Longue vie !",
    example_kd: "Bijî Kurdistan!",
    example_fr: "Vive le Kurdistan !",
    cultural: "Cri de ralliement et d'affection, utilisé comme les Vive ! français.",
  },
  {
    kd: "Kurd", phonetic: "kurd", fr: "Kurde (peuple)",
    example_kd: "Ez Kurd im û zimanê xwe hezdikim.",
    example_fr: "Je suis Kurde et j'aime ma langue.",
  },
  {
    kd: "Serbilindî", phonetic: "ser-bi-lin-dî", fr: "Fierté / Dignité",
    example_kd: "Serbilindiya kurdan zêde ye.",
    example_fr: "La fierté des Kurdes est grande.",
  },
  {
    kd: "Serxwebûn", phonetic: "ser-xwe-bûn", fr: "Indépendance / Souveraineté",
    example_kd: "Serxwebûn armanca gelek kurdan e.",
    example_fr: "L'indépendance est l'aspiration de beaucoup de Kurdes.",
  },
  {
    kd: "Şervan", phonetic: "çer-van", fr: "Guerrier / Combattant",
    example_kd: "Şervanên kurd wêrek in.",
    example_fr: "Les combattants kurdes sont courageux.",
  },

  // ── Sentiments & Valeurs ─────────────────────────────────────────────────────
  {
    kd: "Heval", phonetic: "he-val", fr: "Ami / Camarade",
    example_kd: "Heval ji birayê xwînê çêtir e.",
    example_fr: "Un ami est mieux qu'un frère de sang.",
    cultural: "Heval est l'un des mots les plus utilisés entre Kurdes, terme d'affection et de solidarité.",
  },
  {
    kd: "Evîn", phonetic: "e-vîn", fr: "Amour",
    example_kd: "Evîn hêza herî mezin e.",
    example_fr: "L'amour est la force la plus grande.",
  },
  {
    kd: "Hêvî", phonetic: "hê-vî", fr: "Espoir",
    example_kd: "Hêvî jiyanê dewlemend dike.",
    example_fr: "L'espoir enrichit la vie.",
  },
  {
    kd: "Aştî", phonetic: "aş-tî", fr: "Paix",
    example_kd: "Aştî xwesteka her mirovî ye.",
    example_fr: "La paix est le souhait de chaque être humain.",
  },
  {
    kd: "Hêz", phonetic: "hêz", fr: "Force / Puissance",
    example_kd: "Hêza mirov di dilê wî de ye.",
    example_fr: "La force d'un homme est dans son coeur.",
  },
  {
    kd: "Dilsozî", phonetic: "dil-so-zî", fr: "Loyauté / Fidélité",
    example_kd: "Dilsozî bingeha dostaniyê ye.",
    example_fr: "La loyauté est la base de l'amitié.",
  },
  {
    kd: "Kêfxweşî", phonetic: "kêf-xwe-çî", fr: "Joie / Bonheur",
    example_kd: "Kêfxweşî û şahî ji dilê we re.",
    example_fr: "Joie et bonheur pour votre coeur.",
  },
  {
    kd: "Xemgînî", phonetic: "xem-gî-nî", fr: "Tristesse / Mélancolie",
    example_kd: "Xemgînî jî beşek ji jiyanê ye.",
    example_fr: "La tristesse aussi fait partie de la vie.",
  },
  {
    kd: "Dilgermî", phonetic: "dil-ger-mî", fr: "Chaleur / Sincérité",
    example_kd: "Dilgermiya te spas.",
    example_fr: "Merci pour ta sincérité.",
  },
  {
    kd: "Azwerî", phonetic: "az-we-rî", fr: "Nostalgie / Désir ardent",
    example_kd: "Azweriya welêt di dilê min de ye.",
    example_fr: "La nostalgie de la patrie est dans mon coeur.",
    cultural: "Sentiment très présent dans la poésie et les chants de la diaspora kurde.",
  },
  {
    kd: "Serkeftin", phonetic: "ser-kef-tin", fr: "Victoire / Succès",
    example_kd: "Serkeftin ya xebatê ye.",
    example_fr: "La victoire appartient au travail.",
  },

  // ── Vie quotidienne ──────────────────────────────────────────────────────────
  {
    kd: "Mal", phonetic: "mal", fr: "Maison / Foyer",
    example_kd: "Malê min cihê ewlekariyê ye.",
    example_fr: "Ma maison est un lieu de sécurité.",
  },
  {
    kd: "Nan", phonetic: "nan", fr: "Pain",
    example_kd: "Nan û xwê li ser xwana me ye.",
    example_fr: "Le pain et le sel sont sur notre table.",
    cultural: "Le pain (nan) est sacré dans la culture kurde — le partager signifie l'hospitalité.",
  },
  {
    kd: "Bajar", phonetic: "ba-jar", fr: "Ville",
    example_kd: "Bajara mezin gelek mirov tê de dijîn.",
    example_fr: "Beaucoup de gens vivent dans la grande ville.",
  },
  {
    kd: "Gund", phonetic: "gund", fr: "Village",
    example_kd: "Gund kûçik û xweş bûn.",
    example_fr: "Les villages étaient petits et beaux.",
  },
  {
    kd: "Rê", phonetic: "rê", fr: "Chemin / Route",
    example_kd: "Rêya dirêj bi gav dest pê dike.",
    example_fr: "Un long chemin commence par un pas.",
  },
  {
    kd: "Pirtûk", phonetic: "pir-tûk", fr: "Livre",
    example_kd: "Pirtûk hevalê herî baş e.",
    example_fr: "Le livre est le meilleur ami.",
  },
  {
    kd: "Dibistan", phonetic: "di-bis-tan", fr: "École",
    example_kd: "Zarok li dibistanê fêr dibin.",
    example_fr: "Les enfants apprennent à l'école.",
  },
  {
    kd: "Kar", phonetic: "kar", fr: "Travail",
    example_kd: "Kar jiyan e.",
    example_fr: "Le travail, c'est la vie.",
  },
  {
    kd: "Şev", phonetic: "çev", fr: "Nuit",
    example_kd: "Şev dirêj û tarî ye.",
    example_fr: "La nuit est longue et sombre.",
  },
  {
    kd: "Êvar", phonetic: "ê-var", fr: "Soir",
    example_kd: "Êvar em li dora xwanê kom dibin.",
    example_fr: "Le soir, nous nous réunissons autour de la table.",
  },
  {
    kd: "Berbang", phonetic: "ber-bang", fr: "Aube / Aurore",
    example_kd: "Berbang hat, çûk dest bi stranbêjiyê kirin.",
    example_fr: "L'aube est venue, les oiseaux ont commencé à chanter.",
  },

  // ── Corps & Esprit ────────────────────────────────────────────────────────────
  {
    kd: "Dil", phonetic: "dil", fr: "Coeur",
    example_kd: "Dil ne derewan dike.",
    example_fr: "Le coeur ne ment pas.",
    cultural: "Dil signifie aussi amour dans les expressions courantes : Dilê min = mon amour.",
  },
  {
    kd: "Jiyan", phonetic: "ji-yan", fr: "Vie",
    example_kd: "Jiyan kurt e, dem biparêze.",
    example_fr: "La vie est courte, préserve le temps.",
  },
  {
    kd: "Ruh", phonetic: "rouh", fr: "Âme / Esprit",
    example_kd: "Ziman ruha miletê ye.",
    example_fr: "La langue est l'âme du peuple.",
  },
  {
    kd: "Xewn", phonetic: "xewn", fr: "Rêve",
    example_kd: "Xewnên mezin jiyanê xweş dikin.",
    example_fr: "Les grands rêves rendent la vie belle.",
  },
  {
    kd: "Mirov", phonetic: "mi-rov", fr: "Être humain / Personne",
    example_kd: "Mirov divê ji hev re alîkar be.",
    example_fr: "Les êtres humains doivent s'entraider.",
  },
  {
    kd: "Mêjî", phonetic: "mê-jî", fr: "Cerveau / Intelligence",
    example_kd: "Mêjî girantir ji mişk e.",
    example_fr: "L'intelligence est plus puissante que les muscles.",
  },

  // ── Divers ────────────────────────────────────────────────────────────────────
  {
    kd: "Xwedê", phonetic: "xwe-dê", fr: "Dieu",
    example_kd: "Xwedê mezin e.",
    example_fr: "Dieu est grand.",
    cultural: "Expression souvent utilisée : Xwedê şukir = Dieu merci.",
  },
  {
    kd: "Spas", phonetic: "spas", fr: "Merci / Gratitude",
    example_kd: "Ji bo her tiştî spas.",
    example_fr: "Merci pour tout.",
  },
  {
    kd: "Mezin", phonetic: "me-zin", fr: "Grand / Aîné",
    example_kd: "Mezinên malbatê rêzdar in.",
    example_fr: "Les aînés de la famille sont respectables.",
  },
  {
    kd: "Vegerîn", phonetic: "ve-ge-rîn", fr: "Retour / Rentrer",
    example_kd: "Vegerîna malê xweş e.",
    example_fr: "Le retour à la maison est doux.",
    cultural: "Thème récurrent dans la poésie et la musique de la diaspora kurde.",
  },
  {
    kd: "Bijarte", phonetic: "bi-jar-te", fr: "Choix / Élu",
    example_kd: "Fêrbûn bijarteyeke mezin e.",
    example_fr: "Apprendre est un grand choix.",
  },
  {
    kd: "Bext", phonetic: "bext", fr: "Chance / Destin",
    example_kd: "Bext bi xebatê tê.",
    example_fr: "La chance vient avec le travail.",
  },
]

/**
 * Retourne le mot du jour basé sur la date courante.
 * Même index pour tous les utilisateurs le même jour.
 */
export function getWordOfDay() {
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000)
  const idx = daysSinceEpoch % WORD_OF_DAY_BANK.length
  return WORD_OF_DAY_BANK[idx]
}
