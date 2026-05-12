/**
 * DailyChallenge.jsx — Pirs a Rojê (Défi Quotidien)
 *
 * 10 exercices déterministes par jour, identiques pour tous les utilisateurs.
 * Récompenses : +100 XP si ≥ 80 %, +50 XP si ≥ 50 %, +10 XP sinon.
 * Une seule tentative par jour.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSounds } from '../hooks/useSounds'
import {
  generateDailyChallenge,
  getTodayIndex,
  getNextUTCMidnight,
  todayISO,
} from '../data/dailychallenge'
import {
  getDailyChallengeResult,
  saveDailyChallengeResult,
  addXP,
  recordActivity,
  getDailyLeaderboard,
} from '../lib/db'
import {
  McExercise,
  MatchingExercise,
  FillBlankExercise,
  WordOrderExercise,
  XP_PER_CORRECT,
} from './Lessons'
import { HeartsEmptyScreen, EarnHeartModal } from '../components/Layout'
import { Zap, Trophy, Clock, ArrowLeft, CheckCircle2, Medal, Star } from 'lucide-react'
import Confetti from '../components/Confetti'

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(targetMs) {
  const [rem, setRem] = useState(() => Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setRem(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(id)
  }, [targetMs])
  const h = Math.floor(rem / 3600000)
  const m = Math.floor((rem % 3600000) / 60000)
  const s = Math.floor((rem % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Classement du jour ──────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉']

function Leaderboard({ dateISO, delayMs = 0 }) {
  const [entries, setEntries] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      getDailyLeaderboard(dateISO).then(setEntries)
    }, delayMs)
    return () => clearTimeout(timer)
  }, [dateISO, delayMs])

  if (entries === null) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-amber-200 rounded w-1/2 mb-3" />
        {[0, 1, 2].map(i => (
          <div key={i} className="h-8 bg-amber-100 rounded mb-2" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={15} className="text-amber-600" />
        <p className="font-semibold text-amber-800 text-sm">
          Classement du jour &middot; {entries.length} joueur{entries.length > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
              i < 3 ? 'bg-amber-100' : 'bg-white border border-amber-100'
            }`}
          >
            <span className="w-6 text-center font-bold shrink-0">
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </span>
            <span className="flex-1 font-medium text-slate-700 truncate">
              {entry.display_name || 'Anonyme'}
            </span>
            <span className="text-slate-400 text-xs shrink-0">
              {entry.score}/{entry.total}
            </span>
            <span className="text-emerald-600 font-semibold text-xs shrink-0">
              +{entry.xp_gained} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Résultats déjà faits ─────────────────────────────────────────────────────

function AlreadyDoneScreen({ result }) {
  const nextMidnight = getNextUTCMidnight()
  const countdown    = useCountdown(nextMidnight)
  const pct          = Math.round((result.score / result.total) * 100)
  const emoji        = pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '📚'

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl overflow-hidden shadow-lg"
      >
        {/* Header doré */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 px-6 pt-8 pb-10 text-white">
          <div className="text-5xl mb-3">{emoji}</div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Pirs a Rojê — Défi du jour
          </p>
          <p className="text-3xl font-bold mb-1">Déjà complété !</p>
          <p className="text-white/80 text-sm">Reviens demain pour le prochain défi.</p>
        </div>

        {/* Corps */}
        <div className="bg-white px-6 py-6">
          {/* Score */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-500">{result.score}/{result.total}</p>
              <p className="text-xs text-slate-400 mt-1">Score</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-500">{pct}%</p>
              <p className="text-xs text-slate-400 mt-1">Précision</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-500">+{result.xp_gained}</p>
              <p className="text-xs text-slate-400 mt-1">XP gagnés</p>
            </div>
          </div>

          {/* Classement */}
          <Leaderboard dateISO={result.date} />

          {/* Countdown */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4 mb-5">
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <Clock size={16} />
              <span className="text-sm font-medium">Prochain défi dans</span>
            </div>
            <p className="text-3xl font-mono font-bold text-amber-600 text-center mt-1">
              {countdown}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-2xl transition-colors"
          >
            <ArrowLeft size={16} /> Retour au tableau de bord
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Écran résultats de fin de session ────────────────────────────────────────

function ChallengeResults({ score, total, xpGained, onBack, saving }) {
  const pct   = Math.round((score / total) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : pct >= 30 ? '💪' : '📚'
  const msg   = pct >= 80 ? 'Excellent ! Tu maîtrises le kurmandji !'
              : pct >= 50 ? 'Bien joué ! Continue comme ça.'
              : 'C\'est un bon début. Reviens pratiquer !'
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1
  const nextMidnight = getNextUTCMidnight()
  const countdown    = useCountdown(nextMidnight)

  return (
    <>
      {pct >= 80 && <Confetti count={60} />}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg mx-auto px-4 py-8 text-center"
      >
        <div className="rounded-3xl overflow-hidden shadow-lg">
          {/* Header doré */}
          <div className="bg-gradient-to-br from-kurdish-gold via-amber-400 to-orange-400 px-6 pt-8 pb-10 text-white">
            <div className="text-6xl mb-3">{emoji}</div>
            {/* Stars */}
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2].map(i => (
                <Star key={i} className={`w-7 h-7 ${i < stars ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
              Défi complété !
            </p>
            <p className="text-2xl font-bold mb-2">{msg}</p>
          </div>

          {/* Corps */}
          <div className="bg-white px-6 py-6">
            {/* Score */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-kurdish-gold">{score}/{total}</p>
                <p className="text-xs text-gray-400 mt-1">Bonnes réponses</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl font-bold text-kurdish-gold">{pct}%</p>
                <p className="text-xs text-gray-400 mt-1">Précision</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl font-bold text-kurdish-green">+{xpGained}</p>
                <p className="text-xs text-gray-400 mt-1">XP gagnés</p>
              </div>
            </div>

            {/* XP bonus badge */}
            {xpGained >= 100 && (
              <div className="bg-kurdish-green/5 border border-kurdish-green/20 rounded-2xl px-4 py-3 mb-4 text-sm text-kurdish-green text-center">
                <CheckCircle2 className="inline w-4 h-4 mr-1" />
                Bonus ≥ 80 % : +100 XP !
              </div>
            )}

            {/* Classement (délai 1.5 s pour laisser la DB sauvegarder) */}
            <div className="mb-4">
              <Leaderboard dateISO={new Date().toISOString().slice(0, 10)} delayMs={1500} />
            </div>

            {/* Countdown */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Clock size={16} />
                <span className="text-sm font-medium">Prochain défi dans</span>
              </div>
              <p className="text-3xl font-mono font-bold text-kurdish-gold text-center mt-1">
                {countdown}
              </p>
            </div>

            <button
              onClick={onBack}
              disabled={saving}
              className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? <span className="text-sm">Sauvegarde en cours…</span>
                : <><ArrowLeft size={16} /> Retour au tableau de bord</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Session de défi ──────────────────────────────────────────────────────────

function ChallengeSession({ exercises, onComplete }) {
  const [current,       setCurrent]      = useState(0)
  const [score,         setScore]        = useState(0)
  const [streak,        setStreak]       = useState(0)
  const [finished,      setFinished]     = useState(false)
  const [showEarnHeart, setShowEarnHeart] = useState(false)

  const sounds              = useSounds()
  const { hearts, nextHeartAt, loseHeart } = useAuth()

  if (hearts === 0) {
    return (
      <>
        <HeartsEmptyScreen
          nextHeartAt={nextHeartAt}
          onEarnClick={() => setShowEarnHeart(true)}
        />
        {showEarnHeart && (
          <EarnHeartModal onClose={() => setShowEarnHeart(false)} />
        )}
      </>
    )
  }

  const ex    = exercises[current]
  const total = exercises.length

  function handleSkip() {
    setStreak(0)
    advance(score)
  }

  function handleAnswer(correct) {
    const newScore = correct ? score + 1 : score
    if (correct) {
      const ns = streak + 1
      setStreak(ns)
      if (ns >= 3) sounds.streak(ns)
      else sounds.success()
    } else {
      setStreak(0)
      sounds.error()
      loseHeart()
    }
    advance(newScore)
  }

  function advance(newScore) {
    const next = current + 1
    if (next >= total) {
      setTimeout(() => {
        sounds.completion()
        setScore(newScore)
        setFinished(true)
        onComplete(newScore, total)
      }, 500)
    } else {
      setScore(newScore)
      setTimeout(() => setCurrent(next), 400)
    }
  }

  if (finished) return null

  const typeLabel = {
    'mc-kd-fr':   'QCM — Kurmandji → Français',
    'mc-fr-kd':   'QCM — Français → Kurmandji',
    'word-order': 'Remet les mots dans l\'ordre',
    'matching':   'Association',
    'fill-blank': 'Complète la phrase',
  }[ex.type] ?? ex.type

  return (
    <div>
      {/* En-tête doré avec vague */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #D4940A 0%, #E8A82A 100%)', paddingBottom: 32 }}>
        <div className="max-w-lg mx-auto px-4 pt-5 pb-2">
          <div className="flex items-center justify-between text-white/90 text-sm mb-3">
            <span className="font-bold tracking-wide">⚡ Pirs a Rojê</span>
            <span className="font-mono">{current + 1} / {total}</span>
          </div>
          <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              animate={{ width: `${((current) / total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="text-xs text-white/60 mt-1.5">{typeLabel}</p>
        </div>
        {/* Vague de séparation */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 32" preserveAspectRatio="none" style={{ height: 32 }}>
          <path d="M0,32 L0,16 Q180,0 360,16 Q540,32 720,16 Q900,0 1080,16 Q1260,32 1440,16 L1440,32 Z" fill="#060D1A" />
        </svg>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

      {/* Exercice actif */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl p-6"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {ex.type === 'mc-kd-fr' || ex.type === 'mc-fr-kd'
            ? <McExercise exercise={ex} onAnswer={handleAnswer} />
            : ex.type === 'word-order'
            ? <WordOrderExercise exercise={ex} onAnswer={handleAnswer} onSkip={handleSkip} />
            : ex.type === 'matching'
            ? <MatchingExercise exercise={ex} onAnswer={handleAnswer} />
            : ex.type === 'fill-blank'
            ? <FillBlankExercise exercise={ex} onAnswer={handleAnswer} />
            : null
          }
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DailyChallenge() {
  const { user, profile }           = useAuth()
  const navigate                    = useNavigate()
  const [result,     setResult]     = useState(undefined) // undefined = chargement
  const [done,       setDone]       = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [xpGained,   setXpGained]  = useState(0)
  const [saving,     setSaving]     = useState(false)
  const savePromiseRef              = useRef(null)

  const exercises = useMemo(() => generateDailyChallenge(getTodayIndex()), [])
  const today     = todayISO()

  useEffect(() => {
    if (!user) return
    getDailyChallengeResult(user.id, today).then(r => setResult(r))
  }, [user, today])

  async function handleComplete(score, total) {
    if (!user) return
    const pct = score / total
    const xp  = pct >= 0.8 ? 100 : pct >= 0.5 ? 50 : 10

    setFinalScore(score)
    setXpGained(xp)
    setDone(true)
    setSaving(true)

    // Lance les sauvegardes et garde une référence pour attendre avant de naviguer
    savePromiseRef.current = Promise.all([
      saveDailyChallengeResult(user.id, { date: today, score, total, xpGained: xp }),
      addXP(user.id, xp, profile?.xp || 0),
      recordActivity(user.id, { xpGained: xp }),
    ]).finally(() => setSaving(false))

    await savePromiseRef.current
  }

  async function handleBack() {
    // Attend la fin des sauvegardes si encore en cours
    if (savePromiseRef.current) {
      await savePromiseRef.current
    }
    navigate('/dashboard')
  }

  // Chargement
  if (result === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Déjà fait aujourd'hui (chargé depuis DB)
  if (result && !done) {
    return <AlreadyDoneScreen result={result} />
  }

  // Fin de session — affiche les résultats
  if (done && finalScore !== null) {
    return (
      <ChallengeResults
        score={finalScore}
        total={exercises.length}
        xpGained={xpGained}
        saving={saving}
        onBack={handleBack}
      />
    )
  }

  // Session en cours
  return (
    <div>
      <ChallengeSession exercises={exercises} onComplete={handleComplete} />
    </div>
  )
}
