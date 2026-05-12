/**
 * dailychallenge.js — Génération déterministe du Défi Quotidien (Pirs a Rojê)
 *
 * Le même dayIndex produit toujours les mêmes 10 exercices pour tous les utilisateurs.
 * PRNG : XorShift32 seeded — simple, rapide, reproductible.
 */

import { LESSONS } from './lessons'

// ─── PRNG seeded (XorShift32) ─────────────────────────────────────────────────
function seededRandom(seed) {
  // Garantit un état non-zéro
  let s = (seed ^ 0xdeadbeef) >>> 0 || 1
  return function next() {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    s = s >>> 0
    return s / 4294967296
  }
}

function seededShuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Pools globaux ────────────────────────────────────────────────────────────
const ALL_VOCAB    = LESSONS.flatMap(l => l.vocabulary.map(v => ({ ...v, lessonId: l.id })))
const ALL_EXAMPLES = LESSONS.flatMap(l => l.examples.map(e => ({ ...e, lessonId: l.id })))

/**
 * Génère 10 exercices déterministes pour un dayIndex donné.
 * Types : mc-kd-fr (×3), mc-fr-kd (×3), word-order (×2), matching (×1), fill-blank (×1)
 */
export function generateDailyChallenge(dayIndex) {
  const rng = seededRandom(dayIndex * 2654435761)

  const vocab    = seededShuffle(ALL_VOCAB,    rng)
  const examples = seededShuffle(ALL_EXAMPLES, rng)

  const exercises = []

  // ── 1–3 : QCM kurmandji → français ────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const w = vocab[i]
    const wrongs = seededShuffle(ALL_VOCAB.filter(v => v.kd !== w.kd), rng).slice(0, 3).map(v => v.fr)
    exercises.push({
      type:     'mc-kd-fr',
      question: w.kd,
      phonetic: w.phonetic,
      correct:  w.fr,
      options:  seededShuffle([w.fr, ...wrongs], rng),
    })
  }

  // ── 4–6 : QCM français → kurmandji ────────────────────────────────────────
  for (let i = 3; i < 6; i++) {
    const w = vocab[i]
    const wrongs = seededShuffle(ALL_VOCAB.filter(v => v.kd !== w.kd), rng).slice(0, 3).map(v => v.kd)
    exercises.push({
      type:     'mc-fr-kd',
      question: w.fr,
      correct:  w.kd,
      options:  seededShuffle([w.kd, ...wrongs], rng),
    })
  }

  // ── 7–8 : Remettre dans l'ordre ───────────────────────────────────────────
  const eligible = examples.filter(e => e.kd.trim().split(/\s+/).length >= 3)
  let woCount = 0
  for (const ex of eligible) {
    if (woCount >= 2) break
    const tokens = ex.kd.trim().split(/\s+/)
    let shuffledTok = seededShuffle(tokens, rng)
    let tries = 0
    while (shuffledTok.join(' ') === tokens.join(' ') && tries < 10) {
      shuffledTok = seededShuffle(tokens, rng)
      tries++
    }
    exercises.push({ type: 'word-order', sentence_fr: ex.fr, tokens, shuffled: shuffledTok })
    woCount++
  }

  // ── 9 : Association (4 paires) ───────────────────────────────────────────
  const matchVocab = seededShuffle(ALL_VOCAB, rng).slice(0, 4)
  exercises.push({
    type:  'matching',
    pairs: matchVocab.map(v => ({ kd: v.kd, fr: v.fr })),
  })

  // ── 10 : Compléter la phrase ─────────────────────────────────────────────
  let fillAdded = false
  for (const ex of examples) {
    const target = ALL_VOCAB.find(w => ex.kd.includes(w.kd) && w.kd.length > 2)
    if (target) {
      const opts = seededShuffle(ALL_VOCAB.filter(v => v.kd !== target.kd), rng).slice(0, 2).map(v => v.kd)
      exercises.push({
        type:        'fill-blank',
        sentence_kd: ex.kd.replace(target.kd, '___'),
        sentence_fr: ex.fr,
        correct:     target.kd,
        options:     seededShuffle([target.kd, ...opts], rng),
      })
      fillAdded = true
      break
    }
  }

  // Fallback pour atteindre 10
  if (!fillAdded) {
    const w = vocab[9]
    const wrongs = seededShuffle(ALL_VOCAB.filter(v => v.kd !== w.kd), rng).slice(0, 3).map(v => v.fr)
    exercises.push({
      type: 'mc-kd-fr', question: w.kd, phonetic: w.phonetic,
      correct: w.fr, options: seededShuffle([w.fr, ...wrongs], rng),
    })
  }

  return exercises.slice(0, 10)
}

/** Index du jour courant (UTC, partagé entre tous les utilisateurs) */
export function getTodayIndex() {
  return Math.floor(Date.now() / 86_400_000)
}

/** Timestamp de la prochaine minuit UTC */
export function getNextUTCMidnight() {
  return (getTodayIndex() + 1) * 86_400_000
}

/** Date ISO du jour courant (YYYY-MM-DD) */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
