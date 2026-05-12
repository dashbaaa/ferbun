/**
 * db.js — Couche d'abstraction Supabase pour Fêrbûn
 *
 * Toutes les opérations de base de données sont centralisées ici.
 * Chaque fonction gère ses erreurs et retourne null en cas d'échec
 * pour éviter les crashs si les tables n'existent pas encore.
 *
 * Tables requises dans Supabase :
 * ─────────────────────────────────────────────────────────────────────────────
 * lesson_progress :
 *   id uuid PK, user_id uuid FK profiles, lesson_id int,
 *   score int, completed bool, step text, updated_at timestamptz
 *
 * flashcards :
 *   id uuid PK, user_id uuid FK profiles, front_fr text, back_kd text,
 *   phonetic text, lesson_id int, easiness_factor float default 2.5,
 *   interval int default 0, repetitions int default 0,
 *   next_review date, mastered bool default false, created_at timestamptz
 *
 * daily_activity :
 *   id uuid PK, user_id uuid FK profiles, date date,
 *   xp_gained int default 0, lessons_done int default 0,
 *   cards_reviewed int default 0
 *   UNIQUE (user_id, date)
 *
 * favorite_phrases :
 *   id uuid PK, user_id uuid FK profiles, phrase_id text, created_at timestamptz
 *   UNIQUE (user_id, phrase_id)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase'

// ─── Leçons ───────────────────────────────────────────────────────────────────

/** Retourne toutes les progressions de leçons d'un utilisateur */
export async function getLessonProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    // Transformer en map { lessonId: progressData }
    return Object.fromEntries((data || []).map(p => [p.lesson_id, p]))
  } catch {
    return {}
  }
}

/** Sauvegarde ou met à jour la progression d'une leçon */
export async function saveLessonProgress(userId, lessonId, { score, completed, step }) {
  try {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        score,
        completed,
        step,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })
    if (error) throw error
  } catch (e) {
    console.warn('saveLessonProgress:', e.message)
  }
}

// ─── XP et profil ─────────────────────────────────────────────────────────────

/** Ajoute des XP au profil et met à jour le niveau */
export async function addXP(userId, amount, currentXp) {
  try {
    const newXp = (currentXp || 0) + amount
    const level = calcLevel(newXp)
    const { data, error } = await supabase
      .from('profiles')
      .update({ xp: newXp, level })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e) {
    console.warn('addXP:', e.message)
    return null
  }
}

/** Calcule le niveau kurmandji selon les XP */
export function calcLevel(xp) {
  if (xp >= 1001) return 'expert'
  if (xp >= 601)  return 'advanced'
  if (xp >= 301)  return 'intermediate'
  if (xp >= 101)  return 'novice'
  return 'beginner'
}

/** Métadonnées de niveau affichables */
export const LEVELS = {
  beginner:     { label: 'Destpêker', fr: 'Débutant',      min: 0,    max: 100,  next: 100  },
  novice:       { label: 'Nûner',     fr: 'Novice',         min: 101,  max: 300,  next: 300  },
  intermediate: { label: 'Navîn',     fr: 'Intermédiaire',  min: 301,  max: 600,  next: 600  },
  advanced:     { label: 'Pêşketî',   fr: 'Avancé',         min: 601,  max: 1000, next: 1000 },
  expert:       { label: 'Şareza',    fr: 'Expert',         min: 1001, max: 9999, next: 9999 },
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/** Met à jour le streak quotidien et retourne le nouveau profil */
export async function updateStreak(userId, currentStreak) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    // Vérifie si déjà actif aujourd'hui
    const { data: act } = await supabase
      .from('daily_activity')
      .select('date')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (act) return null // déjà compté aujourd'hui

    // Vérifie si actif hier
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const { data: yest } = await supabase
      .from('daily_activity')
      .select('date')
      .eq('user_id', userId)
      .eq('date', yesterday)
      .maybeSingle()

    const newStreak = yest ? (currentStreak || 0) + 1 : 1
    await supabase.from('profiles').update({ current_streak: newStreak }).eq('id', userId)
    return newStreak
  } catch (e) {
    console.warn('updateStreak:', e.message)
    return null
  }
}

// ─── Activité quotidienne ──────────────────────────────────────────────────────

/** Enregistre une activité du jour (XP, leçons, cartes) */
export async function recordActivity(userId, { xpGained = 0, lessonsDone = 0, cardsReviewed = 0 }) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data: existing } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('daily_activity')
        .update({
          xp_earned:          existing.xp_earned          + xpGained,
          lessons_completed:  existing.lessons_completed   + lessonsDone,
          flashcards_reviewed: existing.flashcards_reviewed + cardsReviewed,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('daily_activity').insert({
        user_id:             userId,
        date:                today,
        xp_earned:           xpGained,
        lessons_completed:   lessonsDone,
        flashcards_reviewed: cardsReviewed,
      })
    }
  } catch (e) {
    console.warn('recordActivity:', e.message)
  }
}

/** Retourne l'activité des N derniers jours */
export async function getRecentActivity(userId, days = 30) {
  try {
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('daily_activity')
      .select('date, xp_earned, lessons_completed, flashcards_reviewed')
      .eq('user_id', userId)
      .gte('date', from)
      .order('date', { ascending: true })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

/** Retourne toutes les flashcards d'un utilisateur */
export async function getFlashcards(userId) {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

/** Retourne les flashcards à réviser aujourd'hui */
export async function getDueFlashcards(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .or(`next_review.is.null,next_review.lte.${today}`)
      .order('next_review', { ascending: true, nullsFirst: true })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

/** Met à jour une flashcard après révision (données SM-2) */
export async function updateFlashcard(cardId, smData) {
  try {
    const { error } = await supabase
      .from('flashcards')
      .update({
        easiness_factor: smData.easinessFactor,
        interval:        smData.interval,
        repetitions:     smData.repetitions,
        next_review:     smData.nextReview?.slice(0, 10),
        mastered:        smData.repetitions >= 3 && smData.interval >= 21,
      })
      .eq('id', cardId)
    if (error) throw error
  } catch (e) {
    console.warn('updateFlashcard:', e.message)
  }
}

/** Crée une nouvelle flashcard
 *
 * Le champ `source` est optionnel — il nécessite la migration Supabase :
 *   ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;
 */
export async function createFlashcard(userId, { front_text, back_text, phonetic, lesson_id = null, source = null }) {
  try {
    const payload = {
      user_id:         userId,
      front_text,
      back_text,
      phonetic,
      lesson_id,
      easiness_factor: 2.5,
      interval:        0,
      repetitions:     0,
      next_review:     new Date().toISOString().slice(0, 10),
      mastered:        false,
    }

    // Tente d'inclure `source` ; si la colonne n'existe pas encore, on réessaie sans.
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({ ...payload, source })
        .select()
        .single()
      if (error) throw error
      return data
    } catch {
      // Fallback sans le champ source (colonne peut-être absente)
      const { data, error } = await supabase
        .from('flashcards')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    }
  } catch (e) {
    console.warn('createFlashcard:', e.message)
    return null
  }
}

/** Ajoute les cartes d'une leçon complétée (si pas déjà présentes) */
export async function seedFlashcardsFromLesson(userId, lesson) {
  try {
    // Vérifie quelles cartes existent déjà
    const { data: existing } = await supabase
      .from('flashcards')
      .select('back_text')
      .eq('user_id', userId)
      .eq('lesson_id', lesson.id)
    const existingSet = new Set((existing || []).map(c => c.back_text))

    const newCards = lesson.vocabulary
      .filter(v => !existingSet.has(v.kd))
      .map(v => ({
        user_id:         userId,
        front_text:      v.fr,
        back_text:       v.kd,
        phonetic:        v.phonetic,
        lesson_id:       lesson.id,
        easiness_factor: 2.5,
        interval:        0,
        repetitions:     0,
        next_review:     new Date().toISOString().slice(0, 10),
        mastered:        false,
      }))

    if (newCards.length > 0) {
      await supabase.from('flashcards').insert(newCards)
    }
  } catch (e) {
    console.warn('seedFlashcards:', e.message)
  }
}

// ─── Cœurs (Hearts) ──────────────────────────────────────────────────────────
//
// SQL requis dans Supabase (à exécuter une seule fois) :
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hearts INTEGER DEFAULT 5;
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hearts_last_update TIMESTAMPTZ DEFAULT NOW();
//
// Mécanique : 1 cœur régénéré toutes les 30 minutes, max 5.

const HEART_REGEN_MS   = 30 * 60 * 1000  // 30 minutes
const MAX_HEARTS       = 5

/**
 * Calcule les cœurs actuels en tenant compte de la régénération depuis
 * la dernière mise à jour, et persiste si des cœurs ont été regagnés.
 * Retourne { hearts, nextHeartAt }
 */
export async function syncHearts(userId, storedHearts, heartsLastUpdate) {
  const stored   = storedHearts  ?? MAX_HEARTS
  const lastUpd  = heartsLastUpdate ? new Date(heartsLastUpdate) : new Date()
  const now      = new Date()
  const elapsed  = now - lastUpd
  const regenned = stored >= MAX_HEARTS ? 0 : Math.floor(elapsed / HEART_REGEN_MS)
  const current  = Math.min(MAX_HEARTS, stored + regenned)

  // Persiste si regen a eu lieu
  if (regenned > 0) {
    try {
      await supabase
        .from('profiles')
        .update({ hearts: current, hearts_last_update: now.toISOString() })
        .eq('id', userId)
    } catch {}
  }

  const nextHeartAt = current < MAX_HEARTS
    ? new Date(lastUpd.getTime() + (regenned + 1) * HEART_REGEN_MS)
    : null

  return { hearts: current, nextHeartAt }
}

/** Décrémente les cœurs de 1. Retourne le nouveau nombre de cœurs. */
export async function dbLoseHeart(userId, currentHearts) {
  const newHearts = Math.max(0, currentHearts - 1)
  const now = new Date().toISOString()
  try {
    await supabase
      .from('profiles')
      .update({ hearts: newHearts, hearts_last_update: now })
      .eq('id', userId)
  } catch (e) {
    console.warn('dbLoseHeart:', e.message)
  }
  return newHearts
}

/** Incrémente les cœurs de 1 (max 5). Retourne le nouveau nombre. */
export async function dbGainHeart(userId, currentHearts) {
  const newHearts = Math.min(MAX_HEARTS, currentHearts + 1)
  const now = new Date().toISOString()
  try {
    await supabase
      .from('profiles')
      .update({ hearts: newHearts, hearts_last_update: now })
      .eq('id', userId)
  } catch (e) {
    console.warn('dbGainHeart:', e.message)
  }
  return newHearts
}

// ─── Défi Quotidien ───────────────────────────────────────────────────────────

/** Retourne le résultat du défi d'un jour donné (null si pas encore fait) */
export async function getDailyChallengeResult(userId, dateISO) {
  try {
    const { data, error } = await supabase
      .from('daily_challenge_results')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateISO)
      .maybeSingle()
    if (error) throw error
    return data
  } catch {
    return null
  }
}

/** Sauvegarde le résultat du défi du jour */
export async function saveDailyChallengeResult(userId, { date, score, total, xpGained }) {
  try {
    const { error } = await supabase
      .from('daily_challenge_results')
      .upsert({
        user_id:      userId,
        date,
        score,
        total,
        xp_gained:    xpGained,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' })
    if (error) throw error
  } catch (e) {
    console.warn('saveDailyChallengeResult:', e.message)
  }
}

// ─── Phrases favorites ────────────────────────────────────────────────────────

/** Retourne les IDs des phrases favorites d'un utilisateur */
export async function getFavorites(userId) {
  try {
    const { data, error } = await supabase
      .from('favorite_phrases')
      .select('phrase_id')
      .eq('user_id', userId)
    if (error) throw error
    return new Set((data || []).map(f => f.phrase_id))
  } catch {
    return new Set()
  }
}

/** Ajoute ou retire une phrase des favoris */
export async function toggleFavorite(userId, phraseId, isFav) {
  try {
    if (isFav) {
      await supabase
        .from('favorite_phrases')
        .delete()
        .eq('user_id', userId)
        .eq('phrase_id', phraseId)
    } else {
      await supabase
        .from('favorite_phrases')
        .insert({ user_id: userId, phrase_id: phraseId })
    }
  } catch (e) {
    console.warn('toggleFavorite:', e.message)
  }
}

// ─── Classement du défi quotidien ────────────────────────────────────────────

/**
 * Retourne le top-10 des scores du défi quotidien pour une date donnée.
 * Utilise la fonction RPC `get_daily_leaderboard` (SECURITY DEFINER).
 */
export async function getDailyLeaderboard(dateISO) {
  try {
    const { data, error } = await supabase.rpc('get_daily_leaderboard', { day_date: dateISO })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}
