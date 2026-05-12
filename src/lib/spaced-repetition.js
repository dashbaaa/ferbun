/**
 * Algorithme SM-2 pour la répétition espacée
 * Basé sur l'algorithme original de SuperMemo 2
 */

// Qualité de réponse : 0-5
// 0-1 : mauvais (réinitialise)
// 2 : correct avec difficulté
// 3 : correct avec effort
// 4 : correct facilement
// 5 : parfait

export function calculateNextReview(card, quality) {
  let { easinessFactor, interval, repetitions } = card

  // Qualité entre 0 et 5
  quality = Math.max(0, Math.min(5, quality))

  if (quality < 2) {
    // Réponse incorrecte : recommencer depuis le début
    repetitions = 0
    interval = 1
  } else {
    // Réponse correcte
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easinessFactor)
    }
    repetitions += 1
  }

  // Mise à jour du facteur de facilité (EF)
  easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easinessFactor = Math.max(1.3, easinessFactor) // EF minimum = 1.3

  // Calculer la prochaine date de révision
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReview: nextReview.toISOString(),
  }
}

export const QUALITY_LABELS = {
  0: { label: 'À revoir', color: 'red', value: 0 },
  1: { label: 'Difficile', color: 'orange', value: 2 },
  2: { label: 'Moyen', color: 'yellow', value: 3 },
  3: { label: 'Facile', color: 'green', value: 5 },
}
