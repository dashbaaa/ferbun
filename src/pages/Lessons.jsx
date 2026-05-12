/**
 * Lessons.jsx — Module Leçons (Dersên)
 *
 * Structure : grille de sélection → vue leçon → vocabulaire → exemples → exercices → résultats
 * 10 leçons thématiques progressives avec 3 étapes chacune.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSounds } from '../hooks/useSounds'
import { LESSONS, generateExercises, shuffle, normalizeKd } from '../data/lessons'
import { getLessonProgress, saveLessonProgress, addXP, recordActivity, updateStreak, seedFlashcardsFromLesson } from '../lib/db'
import { HeartsEmptyScreen, EarnHeartModal } from '../components/Layout'
import Confetti from '../components/Confetti'
import {
  Lock, ChevronRight, ChevronLeft, RotateCcw, Trophy,
  BookOpen, Zap, CheckCircle2, XCircle, Star, ArrowRight,
} from 'lucide-react'
import { MountainFooter, LessonsBlob } from '../components/Backgrounds'

export const XP_PER_CORRECT = 10
const XP_BONUS_PERFECT = 50

// ─── Helpers visuels ──────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-kurdish-green' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-gray-100 dark:bg-kurdish-dark-border rounded-full h-2">
      <motion.div
        className={`h-2 rounded-full ${color}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

// ─── Grille des leçons ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function LessonsGrid({ progress, onSelect }) {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100%' }}>
      <LessonsBlob />
    <div className="relative z-10 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Dersên — Leçons</h1>
        <p className="text-slate-500 mt-1">10 leçons thématiques · débloque-les une par une</p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {LESSONS.map((lesson, i) => {
          const prog     = progress[lesson.id]
          const score    = prog?.score ?? 0
          const done     = prog?.completed ?? false
          const prevDone = i === 0 || (progress[LESSONS[i - 1].id]?.completed && (progress[LESSONS[i - 1].id]?.score ?? 0) >= 70)
          const locked   = !prevDone

          return (
            <motion.button
              key={lesson.id}
              variants={cardVariants}
              onClick={() => !locked && onSelect(lesson)}
              disabled={locked}
              whileHover={!locked ? { y: -3, boxShadow: '0 12px 32px rgba(16,185,129,0.12)' } : {}}
              whileTap={!locked ? { scale: 0.98 } : {}}
              className={`
                relative text-left rounded-3xl border bg-white p-5 overflow-hidden
                transition-all duration-200
                ${locked
                  ? 'opacity-55 cursor-not-allowed border-gray-100 shadow-sm'
                  : 'cursor-pointer border-gray-100 hover:border-kurdish-green/30'
                }
                ${done ? 'ring-2 ring-kurdish-green/30' : ''}
              `}
            >
              {/* Fond dégradé subtil */}
              <div className={`absolute inset-0 bg-gradient-to-br ${lesson.color} opacity-[0.07]`} />
              {/* Bordure gauche thématique colorée */}
              {!locked && (
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${lesson.color}`} />
              )}

              {/* Overlay flou pour les cartes verrouillées */}
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 rounded-3xl z-10">
                  <div className="w-10 h-10 rounded-full bg-kurdish-gold/15 border border-kurdish-gold/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-kurdish-gold" />
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-4xl p-2.5 rounded-2xl ${lesson.bg} shadow-sm`}>
                    {lesson.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-mono text-gray-400">#{lesson.id}</span>
                    {done && (
                      <span className="text-xs bg-kurdish-green/10 text-kurdish-green px-2.5 py-0.5 rounded-full font-semibold">
                        ✓ {score}%
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-bold text-gray-900 text-base mb-0.5">{lesson.title_kd}</h3>
                <p className="text-sm text-gray-500 mb-3">{lesson.title_fr}</p>

                {/* Barre de progression fine en bas */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${score}%`,
                      background: score >= 70 ? '#1B7D4E' : score > 0 ? '#D4940A' : 'transparent',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>{lesson.vocabulary.length} mots</span>
                  {score > 0 && <span className="font-medium">{score}%</span>}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
      <MountainFooter color="#D4EDE0" />
    </div>
    </div>
  )
}

// ─── Étape 1 : Vocabulaire ────────────────────────────────────────────────────
function VocabStep({ lesson, onNext }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const total = lesson.vocabulary.length
  const word  = lesson.vocabulary[idx]

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Vocabulaire — {idx + 1} / {total}</span>
          <span className="text-kurdish-green font-medium">{lesson.title_kd}</span>
        </div>
        <ProgressBar value={idx + 1} max={total} />
      </div>

      {/* Carte flip */}
      <div
        className="relative w-full h-52 cursor-pointer mb-4"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Recto */}
          <div className="absolute inset-0 card flex flex-col items-center justify-center backface-hidden select-none">
            <span className="text-4xl font-display font-bold text-kurdish-green mb-2">{word.kd}</span>
            <span className="text-sm font-mono text-gray-400">{word.phonetic}</span>
            <span className="text-xs text-gray-300 mt-4">Appuie pour voir la traduction</span>
          </div>
          {/* Verso */}
          <div
            className="absolute inset-0 card flex flex-col items-center justify-center select-none"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
            <span className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">{word.fr}</span>
            <span className="text-sm font-mono text-kurdish-green">{word.kd}</span>
            <span className="text-xs font-mono text-gray-400 mt-1">{word.phonetic}</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false) }}
          disabled={idx === 0}
          className="btn-secondary flex items-center gap-2 flex-1 justify-center disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
        {idx < total - 1 ? (
          <button
            onClick={() => { setIdx(i => i + 1); setFlipped(false) }}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary flex items-center gap-2 flex-1 justify-center">
            Continuer <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Étape 2 : Exemples de phrases ───────────────────────────────────────────
function ExamplesStep({ lesson, onNext }) {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-1">
        Phrases d'exemple
      </h2>
      <p className="text-gray-500 text-sm mb-4">Lis ces phrases, puis passe aux exercices.</p>

      <div className="space-y-3 mb-6">
        {lesson.examples.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card border-l-4 border-kurdish-green/50"
          >
            <p className="font-semibold text-kurdish-green text-base mb-0.5">{ex.kd}</p>
            <p className="text-xs font-mono text-gray-400 mb-1">{ex.phonetic}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{ex.fr}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={onNext} className="btn-primary w-full flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" /> Commencer les exercices
      </button>
    </div>
  )
}

// ─── Exercice QCM (kurmandji → français ou inverse) ──────────────────────────
export function McExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null)

  function pick(opt) {
    if (selected) return
    setSelected(opt)
    setTimeout(() => onAnswer(opt === exercise.correct), 700)
  }

  const isKdToFr = exercise.type === 'mc-kd-fr'
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        {isKdToFr ? 'Que signifie ce mot en français ?' : 'Comment dit-on ça en kurmandji ?'}
      </p>
      <div className="text-center mb-6">
        <span className="text-4xl font-display font-bold text-kurdish-green">{exercise.question}</span>
        {exercise.phonetic && (
          <p className="text-sm font-mono text-gray-400 mt-1">{exercise.phonetic}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((opt, i) => {
          const isChosen = selected === opt
          const isRight  = opt === exercise.correct
          return (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={!!selected}
              className={`
                relative p-5 rounded-2xl border-2 text-sm font-semibold text-left transition-all min-h-[64px]
                ${!selected
                  ? 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green hover:bg-kurdish-green/5 active:scale-[0.98]'
                  : isRight
                    ? 'answer-correct'
                    : isChosen
                      ? 'answer-wrong'
                      : 'border-gray-200 dark:border-kurdish-dark-border opacity-40'
                }
              `}
            >
              {selected && isRight  && <CheckCircle2 className="w-4 h-4 absolute top-2.5 right-2.5 text-kurdish-green" />}
              {selected && isChosen && !isRight && <XCircle className="w-4 h-4 absolute top-2.5 right-2.5 text-red-500" />}
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exercice Association ─────────────────────────────────────────────────────
export function MatchingExercise({ exercise, onAnswer }) {
  const [pairs]         = useState(() => exercise.pairs)
  const [leftItems]     = useState(() => shuffle(pairs.map(p => p.kd)))
  const [rightItems]    = useState(() => shuffle(pairs.map(p => p.fr)))
  const [selLeft,  setSelLeft]  = useState(null)
  const [selRight, setSelRight] = useState(null)
  const [matched,  setMatched]  = useState([]) // [{kd,fr}]
  const [wrong,    setWrong]    = useState(false)

  useEffect(() => {
    if (selLeft && selRight) {
      const pair = pairs.find(p => p.kd === selLeft)
      if (pair && pair.fr === selRight) {
        const newMatched = [...matched, { kd: selLeft, fr: selRight }]
        setMatched(newMatched)
        setSelLeft(null); setSelRight(null)
        if (newMatched.length === pairs.length) {
          setTimeout(() => onAnswer(true), 400)
        }
      } else {
        setWrong(true)
        setTimeout(() => { setSelLeft(null); setSelRight(null); setWrong(false) }, 600)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selLeft, selRight])

  const isMatchedKd = (kd) => matched.some(m => m.kd === kd)
  const isMatchedFr = (fr) => matched.some(m => m.fr === fr)

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Associe chaque mot à sa traduction
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map(kd => (
            <button
              key={kd}
              onClick={() => !isMatchedKd(kd) && setSelLeft(kd)}
              className={`w-full p-3 rounded-xl border-2 text-sm font-bold transition-all
                ${isMatchedKd(kd) ? 'border-kurdish-green bg-kurdish-green/10 text-kurdish-green opacity-60 cursor-default'
                  : selLeft === kd ? 'border-kurdish-green bg-kurdish-green/10 text-kurdish-green'
                  : wrong && selLeft === kd ? 'border-red-400'
                  : 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green cursor-pointer'
                }
              `}
            >{kd}</button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map(fr => (
            <button
              key={fr}
              onClick={() => !isMatchedFr(fr) && selLeft && setSelRight(fr)}
              className={`w-full p-3 rounded-xl border-2 text-sm transition-all
                ${isMatchedFr(fr) ? 'border-kurdish-green bg-kurdish-green/10 text-kurdish-green opacity-60 cursor-default'
                  : selRight === fr ? 'border-kurdish-green bg-kurdish-green/10'
                  : wrong && selRight === fr ? 'border-red-400'
                  : selLeft ? 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green cursor-pointer'
                  : 'border-gray-200 dark:border-kurdish-dark-border opacity-50 cursor-default'
                }
              `}
            >{fr}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3">
        {matched.length} / {pairs.length} paires trouvées
      </p>
    </div>
  )
}

// ─── Exercice Compléter la phrase ─────────────────────────────────────────────
export function FillBlankExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null)

  function pick(opt) {
    if (selected) return
    setSelected(opt)
    setTimeout(() => onAnswer(opt === exercise.correct), 700)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Complète la phrase kurmandji
      </p>
      <div className="bg-kurdish-green/5 border border-kurdish-green/20 rounded-2xl p-4 mb-2 text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">{exercise.sentence_kd}</p>
      </div>
      <p className="text-sm text-gray-400 text-center mb-5 italic">{exercise.sentence_fr}</p>
      <div className="grid grid-cols-3 gap-3">
        {exercise.options.map((opt, i) => {
          const isChosen = selected === opt
          const isRight  = opt === exercise.correct
          return (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={!!selected}
              className={`
                p-4 rounded-2xl border-2 text-sm font-bold transition-all min-h-[56px]
                ${!selected ? 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green hover:bg-kurdish-green/5 active:scale-[0.97]'
                  : isRight  ? 'answer-correct'
                  : isChosen ? 'answer-wrong'
                  : 'border-gray-200 dark:border-kurdish-dark-border opacity-40'
                }
              `}
            >{opt}</button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exercice Écrire ──────────────────────────────────────────────────────────
function WriteExercise({ exercise, onAnswer }) {
  const [input,    setInput]    = useState('')
  const [result,   setResult]   = useState(null) // 'correct' | 'wrong'
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() {
    if (!input.trim() || result) return
    const userNorm    = normalizeKd(input)
    const correctNorm = normalizeKd(exercise.correct)
    const ok = userNorm === correctNorm || input.trim().toLowerCase() === exercise.correct.toLowerCase()
    setResult(ok ? 'correct' : 'wrong')
    setTimeout(() => onAnswer(ok), 800)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Écris ce mot en kurmandji
      </p>
      <div className="text-center mb-6">
        <span className="text-3xl font-semibold text-gray-800 dark:text-white">{exercise.question}</span>
      </div>
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        disabled={!!result}
        placeholder="Tape le mot kurmandji…"
        className={`
          w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-semibold mb-3 outline-none transition-all
          bg-white dark:bg-kurdish-dark-card dark:text-white
          ${result === 'correct' ? 'border-kurdish-green bg-kurdish-green/5 text-kurdish-green'
            : result === 'wrong' ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
            : 'border-gray-200 dark:border-kurdish-dark-border focus:border-kurdish-green'
          }
        `}
      />
      {result === 'wrong' && (
        <p className="text-sm text-center text-amber-600 mb-3">
          La bonne réponse était : <strong className="text-kurdish-green">{exercise.correct}</strong>
          <span className="text-gray-400 ml-1">({exercise.phonetic})</span>
        </p>
      )}
      {!result && (
        <button onClick={submit} disabled={!input.trim()} className="btn-primary w-full">
          Valider
        </button>
      )}
    </div>
  )
}

// ─── Exercice Remettre dans l'ordre ──────────────────────────────────────────
// onAnswer(true)  → bonne réponse (parent gère son + XP + avance)
// onSkip()        → l'utilisateur passe après erreur (parent avance sans re-pénaliser)
export function WordOrderExercise({ exercise, onAnswer, onSkip }) {
  const makeAvailable = () => exercise.shuffled.map((token, i) => ({ token, id: i }))

  const [available, setAvailable] = useState(makeAvailable)
  const [placed,    setPlaced]    = useState([])
  const [status,    setStatus]    = useState('idle') // 'idle' | 'wrong' | 'correct'
  const [penalized, setPenalized] = useState(false)  // cœur déjà perdu pour cet exercice

  const { loseHeart } = useAuth()
  const sounds        = useSounds()
  const allPlaced     = available.length === 0

  function placeWord(item) {
    if (status !== 'idle') return
    setAvailable(prev => prev.filter(w => w.id !== item.id))
    setPlaced(prev => [...prev, item])
  }

  function removeWord(item) {
    if (status !== 'idle') return
    setPlaced(prev => prev.filter(w => w.id !== item.id))
    setAvailable(prev => [...prev, item])
  }

  function verify() {
    const ok = placed.map(w => w.token).join(' ') === exercise.tokens.join(' ')
    setStatus(ok ? 'correct' : 'wrong')
    if (ok) {
      // Le parent joue le son succès et avance
      setTimeout(() => onAnswer(true), 900)
    } else {
      // Son d'erreur + perte de cœur immédiate (une seule fois par exercice)
      sounds.error()
      if (!penalized) {
        loseHeart()
        setPenalized(true)
      }
    }
  }

  function retry() {
    setAvailable(makeAvailable())
    setPlaced([])
    setStatus('idle')
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Remets les mots dans le bon ordre
      </p>

      {/* Traduction française */}
      <div className="bg-kurdish-green/5 border border-kurdish-green/20 rounded-2xl p-4 mb-5 text-center">
        <p className="text-base font-medium text-gray-700 dark:text-gray-200 italic">
          &ldquo;{exercise.sentence_fr}&rdquo;
        </p>
      </div>

      {/* Zone de construction */}
      <div className={`
        min-h-[60px] rounded-2xl border-2 p-3 mb-2 flex flex-wrap gap-2 items-center transition-colors duration-300
        ${status === 'correct' ? 'border-kurdish-green bg-kurdish-green/5'
          : status === 'wrong'   ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
          : placed.length > 0    ? 'border-kurdish-green/40 bg-gray-50 dark:bg-kurdish-dark-card'
          : 'border-dashed border-gray-300 dark:border-kurdish-dark-border bg-gray-50/50 dark:bg-kurdish-dark-card/50'
        }
      `}>
        {placed.length === 0 && (
          <p className="text-sm text-gray-400 mx-auto select-none">
            Clique sur les mots ci-dessous…
          </p>
        )}
        <AnimatePresence>
          {placed.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => removeWord(item)}
              disabled={status !== 'idle'}
              className={`
                px-4 py-2 rounded-full text-sm font-bold select-none transition-colors
                ${status === 'correct'
                  ? 'bg-kurdish-green text-white cursor-default'
                  : status === 'wrong'
                    ? 'bg-red-400 text-white cursor-default'
                    : 'bg-kurdish-green text-white hover:bg-kurdish-green/80 active:scale-95'
                }
              `}
            >
              {item.token}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Correction affichée si erreur */}
      <AnimatePresence>
        {status === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-3"
          >
            <p className="text-xs text-gray-400 mb-0.5">Bonne réponse :</p>
            <p className="font-bold text-kurdish-green">{exercise.tokens.join(' ')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips disponibles */}
      <div className="flex flex-wrap gap-2 mb-5 min-h-[48px] justify-center">
        <AnimatePresence>
          {available.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => placeWord(item)}
              disabled={status !== 'idle'}
              className="
                px-4 py-2 rounded-full border-2 border-kurdish-green text-kurdish-green
                text-sm font-bold select-none
                hover:bg-kurdish-green hover:text-white active:scale-95 transition-colors
                min-h-[44px] min-w-[44px]
              "
            >
              {item.token}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Bouton Vérifier (apparaît quand tous les mots sont placés) */}
      <AnimatePresence>
        {status === 'idle' && allPlaced && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={verify}
            className="btn-primary w-full"
          >
            Vérifier
          </motion.button>
        )}
      </AnimatePresence>

      {/* Succès */}
      {status === 'correct' && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-2 text-kurdish-green font-bold py-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Parfait ! +{XP_PER_CORRECT} XP
        </motion.div>
      )}

      {/* Erreur : boutons réessayer / passer */}
      {status === 'wrong' && (
        <div className="flex gap-3">
          <button
            onClick={retry}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Réessayer
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-kurdish-dark-border
              text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-kurdish-dark-border transition-colors"
          >
            Passer
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Module Exercices (orchestrateur) ─────────────────────────────────────────
function ExercisesStep({ lesson, onComplete }) {
  const [exercises] = useState(() => generateExercises(lesson))
  const [current,  setCurrent]  = useState(0)
  const [score,    setScore]    = useState(0)
  const [streak,   setStreak]   = useState(0)
  const [finished, setFinished] = useState(false)
  const sounds = useSounds()
  const { hearts, nextHeartAt, loseHeart } = useAuth()
  const [showEarnHeart, setShowEarnHeart] = useState(false)

  // Bloquer si 0 cœurs
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

  // Avance sans pénalité (word-order déjà penalisé dans le composant)
  function handleSkip() {
    setStreak(0)
    const next = current + 1
    if (next >= exercises.length) {
      setTimeout(() => { sounds.completion(); setFinished(true) }, 500)
    } else {
      setTimeout(() => setCurrent(next), 300)
    }
  }

  function handleAnswer(correct) {
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(s => s + 1)
      if (newStreak >= 3) sounds.streak(newStreak)
      else sounds.success()
    } else {
      setStreak(0)
      sounds.error()
      loseHeart()
    }

    const next = current + 1
    if (next >= exercises.length) {
      setTimeout(() => {
        sounds.completion()
        setFinished(true)
      }, 500)
    } else {
      setTimeout(() => setCurrent(next), 500)
    }
  }

  if (finished) {
    const pct     = Math.round((score / exercises.length) * 100)
    const xp      = score * XP_PER_CORRECT + (pct === 100 ? XP_BONUS_PERFECT : 0)
    const emoji   = pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 40 ? '💪' : '📚'
    const msg     = pct === 100 ? 'Parfait ! Bonus +50 XP !'
                  : pct >= 70  ? 'Très bien ! Leçon débloquée.'
                  : pct >= 40  ? 'Pas mal ! Encore un effort.'
                  : 'Continue à pratiquer !'
    const stars   = pct === 100 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0
    return (
      <>
        {pct >= 70 && <Confetti count={pct === 100 ? 60 : 35} />}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm mx-auto rounded-3xl overflow-hidden shadow-card"
        >
          {/* Header gradient */}
          <div className={`px-6 pt-8 pb-10 text-center ${pct >= 70 ? 'bg-gradient-to-br from-kurdish-green to-emerald-600' : 'bg-gradient-to-br from-kurdish-gold to-amber-500'}`}>
            <div className="text-5xl mb-3">{emoji}</div>
            <div className="flex justify-center gap-1 mb-3">
              {[0, 1, 2].map(i => (
                <Star key={i} className={`w-7 h-7 ${i < stars ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />
              ))}
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-1">
              {score} / {exercises.length}
            </h2>
            <p className="text-white/80 text-sm">{pct}% de réussite</p>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-5">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">{msg}</p>
            <div className="flex items-center justify-center gap-2 mb-4 text-kurdish-green font-bold text-xl">
              <Zap className="w-5 h-5" /> +{xp} XP
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 70 ? '#1B7D4E' : pct >= 40 ? '#D4940A' : '#E74C5E',
                }}
              />
            </div>
            <button onClick={() => onComplete(pct, xp)} className="btn-primary w-full flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" /> Terminer la leçon
            </button>
          </div>
        </motion.div>
      </>
    )
  }

  const ex       = exercises[current]
  const progress = ((current) / exercises.length) * 100

  return (
    <div>
      {/* En-tête vert avec vague */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #1B7D4E 0%, #2E9E6B 100%)', paddingBottom: 32 }}>
        <div className="max-w-lg mx-auto px-4 pt-5 pb-2">
          <div className="flex justify-between text-white/90 text-sm mb-3">
            <span className="font-bold">Exercice {current + 1} / {exercises.length}</span>
            <span className="font-semibold">{score} ✓</span>
          </div>
          <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white/80 rounded-full" animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 32" preserveAspectRatio="none" style={{ height: 32 }}>
          <path d="M0,32 L0,16 Q180,0 360,16 Q540,32 720,16 Q900,0 1080,16 Q1260,32 1440,16 L1440,32 Z" fill="#FAFAF7" />
        </svg>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5" style={{ background: 'linear-gradient(180deg, rgba(200,230,201,0.2) 0%, transparent 50%)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="card"
        >
          {ex.type === 'mc-kd-fr'    && <McExercise exercise={ex} onAnswer={handleAnswer} />}
          {ex.type === 'mc-fr-kd'    && <McExercise exercise={ex} onAnswer={handleAnswer} />}
          {ex.type === 'matching'    && <MatchingExercise exercise={ex} onAnswer={handleAnswer} />}
          {ex.type === 'fill-blank'  && <FillBlankExercise exercise={ex} onAnswer={handleAnswer} />}
          {ex.type === 'write'       && <WriteExercise exercise={ex} onAnswer={handleAnswer} />}
          {ex.type === 'word-order'  && <WordOrderExercise exercise={ex} onAnswer={handleAnswer} onSkip={handleSkip} />}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Vue d'une leçon (orchestration des 3 étapes) ─────────────────────────────
function LessonView({ lesson, progress, onBack, onComplete }) {
  const initStep = progress?.step && progress.step !== 'done' ? progress.step : 'vocab'
  const [step, setStep] = useState(initStep)

  const steps = ['vocab', 'examples', 'exercises']
  const stepIdx = steps.indexOf(step)

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* En-tête leçon */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-kurdish-dark-border transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className={`p-2 rounded-xl text-2xl ${lesson.bg}`}>{lesson.icon}</div>
        <div>
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{lesson.title_kd}</h2>
          <p className="text-sm text-gray-500">{lesson.title_fr}</p>
        </div>
        <div className="ml-auto flex gap-1">
          {steps.map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full ${i <= stepIdx ? 'bg-kurdish-green' : 'bg-gray-200 dark:bg-kurdish-dark-border'}`} />
          ))}
        </div>
      </div>

      {/* Étapes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'vocab'     && <VocabStep     lesson={lesson} onNext={() => setStep('examples')} />}
          {step === 'examples'  && <ExamplesStep  lesson={lesson} onNext={() => setStep('exercises')} />}
          {step === 'exercises' && <ExercisesStep lesson={lesson} onComplete={onComplete} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Lessons() {
  const { user, profile, updateProfile } = useAuth()
  const [progress,  setProgress]  = useState({})
  const [selected,  setSelected]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  // Chargement de la progression
  useEffect(() => {
    if (!user) return
    getLessonProgress(user.id).then(p => { setProgress(p); setLoading(false) })
  }, [user])

  async function handleComplete(lesson, pct, xpGained) {
    const completed = pct >= 70
    const newProg = { ...progress, [lesson.id]: { score: pct, completed, step: 'done' } }
    setProgress(newProg)

    // Sauvegarde Supabase
    await saveLessonProgress(user.id, lesson.id, { score: pct, completed, step: 'done' })
    await recordActivity(user.id, { xpGained, lessonsDone: 1 })
    await updateStreak(user.id, profile?.current_streak)
    const newProfile = await addXP(user.id, xpGained, profile?.xp)
    if (newProfile) await updateProfile({ xp: newProfile.xp, level: newProfile.level, current_streak: newProfile.current_streak })

    // Seed les flashcards si leçon réussie
    if (completed) await seedFlashcardsFromLesson(user.id, lesson)

    setSelected(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-kurdish-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (selected) {
    return (
      <LessonView
        lesson={selected}
        progress={progress[selected.id]}
        onBack={() => setSelected(null)}
        onComplete={(pct, xp) => handleComplete(selected, pct, xp)}
      />
    )
  }

  return <LessonsGrid progress={progress} onSelect={setSelected} />
}
