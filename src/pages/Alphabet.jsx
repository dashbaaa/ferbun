import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import alphabetData from '../data/alphabet.json'
import { useSounds } from '../hooks/useSounds'
import { useAuth } from '../contexts/AuthContext'
import { HeartsEmptyScreen, EarnHeartModal } from '../components/Layout'
import { KurdishBorderTop, AlphabetBlob, KilimBand } from '../components/Backgrounds'
import {
  Star, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, Trophy, BookOpen, Zap,
} from 'lucide-react'

// ─── Onglets ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'alfabe',   label: 'Alfabe',            sublabel: 'Toutes les lettres' },
  { id: 'specials', label: 'Lettres spéciales',  sublabel: 'Focus sur les 8 clés' },
  { id: 'quiz',     label: 'Quiz',               sublabel: 'Teste tes connaissances' },
]

// ─── Styles de difficulté ─────────────────────────────────────────────────────
const DIFFICULTY_STYLES = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}
const DIFFICULTY_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

// ─── Mélanger un tableau ──────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ─── Construire les options MCQ ───────────────────────────────────────────────
function buildOptions(correctLetter, allLetters, mode) {
  const getLabel = (l) => {
    if (mode === 'letter-to-ipa')  return l.ipa
    if (mode === 'ipa-to-letter')  return l.letter
    if (mode === 'letter-to-word') return l.example_words[0].word
    return l.ipa
  }
  const correct = { label: getLabel(correctLetter), isCorrect: true }
  const wrongs  = shuffle(allLetters.filter(l => l.letter !== correctLetter.letter))
                    .slice(0, 3)
                    .map(l => ({ label: getLabel(l), isCorrect: false }))
  return shuffle([correct, ...wrongs])
}


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  COMPOSANT : Fiche détaillée d'une lettre (onglet Alfabe)               ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function LetterDetail({ letter, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="mt-2 p-4 bg-white dark:bg-kurdish-dark-card rounded-2xl border-2 border-kurdish-green/30 shadow-xl col-span-full"
    >
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Lettre */}
          <div className="flex flex-col items-center gap-1.5">
            <span className={`text-5xl font-display font-bold leading-none ${letter.special ? 'text-kurdish-green' : 'text-gray-800 dark:text-white'}`}>
              {letter.letter}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm bg-gray-100 dark:bg-kurdish-dark-border px-2 py-0.5 rounded-lg text-gray-600 dark:text-gray-300">
                {letter.ipa}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[letter.difficulty]}`}>
                {DIFFICULTY_LABELS[letter.difficulty]}
              </span>
              {letter.special && (
                <span className="text-xs bg-kurdish-green/10 text-kurdish-green px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Spéciale
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{letter.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none ml-4 flex-shrink-0"
        >×</button>
      </div>

      {/* Astuce */}
      <div className="bg-kurdish-yellow/10 border border-kurdish-yellow/30 rounded-xl p-3 mb-3 flex items-start gap-2">
        <span className="text-lg flex-shrink-0">💡</span>
        <p className="text-sm text-gray-700 dark:text-gray-200">{letter.phonetic_hint}</p>
      </div>

      {/* Exemples de mots */}
      <div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Exemples de mots
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {letter.example_words.map((ex, i) => (
            <div key={i} className="bg-gray-50 dark:bg-kurdish-dark-border rounded-xl p-3">
              <div className="font-bold text-kurdish-green text-base mb-0.5">
                {ex.word.split('').map((char, ci) => {
                  const isTarget = char.toLowerCase() === letter.lower || char === letter.letter
                  return (
                    <span key={ci} className={isTarget ? 'underline decoration-2 decoration-kurdish-green' : ''}>
                      {char}
                    </span>
                  )
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{ex.phonetic}</div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">{ex.translation}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  COMPOSANT : Carte lettre spéciale (onglet Spéciales)                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function SpecialLetterCard({ letter }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="flex items-start gap-4 mb-4">
        {/* Tuile lettre */}
        <div className="w-16 h-16 bg-gradient-kurdish rounded-2xl flex flex-col items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-3xl font-display font-bold text-white leading-none">{letter.letter}</span>
          <span className="text-white/70 text-xs">{letter.lower}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-sm bg-gray-100 dark:bg-kurdish-dark-border px-2 py-1 rounded-lg font-medium">
              {letter.ipa}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[letter.difficulty]}`}>
              {DIFFICULTY_LABELS[letter.difficulty]}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{letter.description}</p>
        </div>
      </div>

      {/* Son court */}
      <div className="bg-kurdish-green/5 dark:bg-kurdish-green/10 border border-kurdish-green/20 rounded-xl px-4 py-2 mb-3 text-sm font-medium text-kurdish-green">
        🔊 {letter.short_sound}
      </div>

      {/* Astuce */}
      <div className="bg-kurdish-yellow/10 border border-kurdish-yellow/30 rounded-xl p-3 mb-4 text-sm text-gray-700 dark:text-gray-200">
        💡 <span className="font-medium">Astuce :</span> {letter.phonetic_hint}
      </div>

      {/* Exemples avec toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-kurdish-green hover:text-kurdish-green-dark transition-colors w-full"
      >
        <span>Exemples de mots</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {letter.example_words.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-kurdish-dark-border rounded-xl px-4 py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-kurdish-green truncate">{ex.word}</span>
                    <span className="text-gray-400 text-xs hidden sm:inline">/{ex.phonetic}/</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 flex-shrink-0">{ex.translation}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  COMPOSANT : Module Quiz                                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function QuizModule({ allLetters }) {
  const [quizState,     setQuizState]     = useState('config')
  const [mode,          setMode]          = useState('letter-to-ipa')
  const [scope,         setScope]         = useState('specials')
  const [questions,     setQuestions]     = useState([])
  const [current,       setCurrent]       = useState(0)
  const [selected,      setSelected]      = useState(null)
  const [score,         setScore]         = useState(0)
  const [mistakes,      setMistakes]      = useState([])
  const [showEarnHeart, setShowEarnHeart] = useState(false)

  const streakRef = useRef(0)
  const sounds    = useSounds()
  const { hearts, nextHeartAt, loseHeart } = useAuth()

  const specialLetters = allLetters.filter(l => l.special)
  const pool = scope === 'specials' ? specialLetters : allLetters

  // Bloquer si 0 cœurs (seulement pendant le quiz, pas la config)
  if (quizState === 'playing' && hearts === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <HeartsEmptyScreen
          nextHeartAt={nextHeartAt}
          onEarnClick={() => setShowEarnHeart(true)}
        />
        {showEarnHeart && (
          <EarnHeartModal onClose={() => setShowEarnHeart(false)} />
        )}
      </div>
    )
  }

  function startQuiz() {
    const qs = shuffle(pool).map(letter => ({
      letter,
      options: buildOptions(letter, pool.length >= 4 ? pool : allLetters, mode),
    }))
    setQuestions(qs)
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setMistakes([])
    streakRef.current = 0
    setQuizState('playing')
  }

  function handleAnswer(option) {
    if (selected !== null) return
    setSelected(option)
    if (option.isCorrect) {
      setScore(s => s + 1)
      streakRef.current += 1
      if (streakRef.current >= 3) {
        sounds.streak(streakRef.current)
      } else {
        sounds.success()
      }
    } else {
      setMistakes(m => [...m, questions[current].letter])
      streakRef.current = 0
      sounds.error()
      loseHeart()
    }
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      sounds.completion()
      setQuizState('finished')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  const q        = questions[current]
  const progress = questions.length > 0 ? ((current + (selected ? 1 : 0)) / questions.length) * 100 : 0

  // ── Configuration ──────────────────────────────────────────────────────
  if (quizState === 'config') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Configurer le quiz</h2>

          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Type de question</div>
            <div className="space-y-2">
              {[
                { id: 'letter-to-ipa',  icon: '🔤', title: 'Lettre → Phonétique', desc: 'Vois une lettre, choisis sa transcription IPA' },
                { id: 'ipa-to-letter',  icon: '/a/', title: 'Phonétique → Lettre', desc: 'Lis une transcription IPA, identifie la lettre' },
                { id: 'letter-to-word', icon: '📝',  title: 'Lettre → Mot exemple', desc: 'Vois une lettre, trouve le mot qui la contient' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setMode(opt.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    mode === opt.id
                      ? 'border-kurdish-green bg-kurdish-green/5'
                      : 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green/40'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">{opt.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</div>
                  </div>
                  {mode === opt.id && <CheckCircle2 className="w-5 h-5 text-kurdish-green ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Lettres à tester</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'specials', icon: '⭐', title: 'Lettres spéciales', count: specialLetters.length },
                { id: 'all',      icon: '🔤', title: 'Toutes les lettres', count: allLetters.length },
              ].map(opt => (
                <button key={opt.id} onClick={() => setScope(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    scope === opt.id
                      ? 'border-kurdish-green bg-kurdish-green/5'
                      : 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green/40'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white text-center">{opt.title}</div>
                  <span className="text-xs text-gray-400">{opt.count} questions</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startQuiz} className="btn-primary w-full flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" /> Commencer — Destpêke !
          </button>
        </div>
      </div>
    )
  }

  // ── Résultats ──────────────────────────────────────────────────────────
  if (quizState === 'finished') {
    const pct   = Math.round((score / questions.length) * 100)
    const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 40 ? '💪' : '📚'
    const msg   = pct === 100 ? 'Parfait ! Tu maîtrises ces lettres !'
                : pct >= 70  ? 'Très bien ! Continue comme ça.'
                : pct >= 40  ? 'Pas mal ! Encore un peu de pratique.'
                : 'Continue à pratiquer — tu vas y arriver !'

    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card text-center"
        >
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">
            {score} / {questions.length}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">{pct}% de bonnes réponses</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-6">{msg}</p>

          <div className="w-full bg-gray-100 dark:bg-kurdish-dark-border rounded-full h-3 mb-6">
            <div className="h-3 rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 70 ? '#21A366' : pct >= 40 ? '#F5C518' : '#C8102E' }}
            />
          </div>

          {mistakes.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 text-left">
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                Lettres à retravailler :
              </div>
              <div className="flex flex-wrap gap-2">
                {mistakes.map(l => (
                  <div key={l.letter} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-kurdish-dark-card rounded-lg border border-red-200 dark:border-red-800">
                    <span className="font-bold text-kurdish-green text-base">{l.letter}</span>
                    <span className="text-gray-400 font-mono text-xs">{l.ipa}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={startQuiz} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Recommencer
            </button>
            <button onClick={() => setQuizState('config')} className="btn-secondary flex-1">
              Changer
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Question en cours ──────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto">
      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {current + 1} / {questions.length}</span>
          <span className="font-semibold text-kurdish-green">{score} correct{score > 1 ? 's' : ''}</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-kurdish-dark-border rounded-full h-2">
          <motion.div
            className="h-2 bg-kurdish-green rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="card"
        >
          {/* Question */}
          <div className="text-center mb-8">
            {mode === 'letter-to-ipa' && (
              <>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Quelle est la transcription phonétique de cette lettre ?
                </div>
                <div className="text-8xl font-display font-bold text-kurdish-green mb-2">
                  {q.letter.letter}
                </div>
                <div className="text-gray-400 text-sm">{q.letter.lower}</div>
              </>
            )}
            {mode === 'ipa-to-letter' && (
              <>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Quelle lettre correspond à cette transcription ?
                </div>
                <div className="bg-kurdish-green/5 border border-kurdish-green/20 rounded-2xl p-5 inline-block">
                  <div className="text-3xl font-mono font-bold text-kurdish-green mb-1">
                    {q.letter.ipa}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{q.letter.short_sound}</div>
                </div>
              </>
            )}
            {mode === 'letter-to-word' && (
              <>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Quel mot commence par cette lettre ?
                </div>
                <div className="text-8xl font-display font-bold text-kurdish-green mb-2">
                  {q.letter.letter}
                </div>
                <div className="text-gray-400 text-sm font-mono">{q.letter.ipa}</div>
              </>
            )}
          </div>

          {/* Options MCQ */}
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isChosen  = selected?.label === opt.label
              const showRight = selected && opt.isCorrect
              const showWrong = selected && isChosen && !opt.isCorrect

              return (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
                  className={`
                    relative p-5 rounded-2xl border-2 text-sm font-semibold transition-all text-left min-h-[60px]
                    ${!selected
                      ? 'border-gray-200 dark:border-kurdish-dark-border hover:border-kurdish-green hover:bg-kurdish-green/5 active:scale-[0.98]'
                      : showRight
                        ? 'answer-correct'
                        : showWrong
                          ? 'answer-wrong'
                          : 'border-gray-200 dark:border-kurdish-dark-border opacity-50'
                    }
                  `}
                >
                  {showRight && <CheckCircle2 className="w-4 h-4 text-kurdish-green absolute top-2 right-2" />}
                  {showWrong && <XCircle      className="w-4 h-4 text-red-500     absolute top-2 right-2" />}
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className={`rounded-xl p-3 mb-4 text-sm ${selected.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}>
                  <div className="mb-1">
                    {selected.isCorrect ? (
                      <span>✅ <strong>Exact !</strong>{' '}
                        {mode === 'letter-to-ipa'  && <>{q.letter.letter} → <span className="font-mono">{q.letter.ipa}</span></>}
                        {mode === 'ipa-to-letter'  && <><span className="font-mono">{q.letter.ipa}</span> → {q.letter.letter}</>}
                        {mode === 'letter-to-word' && <>{q.letter.letter} → <strong>{q.letter.example_words[0].word}</strong></>}
                      </span>
                    ) : (
                      <span>💡 Bonne réponse :{' '}
                        <strong>
                          {mode === 'letter-to-ipa'  && <span className="font-mono">{q.letter.ipa}</span>}
                          {mode === 'ipa-to-letter'  && q.letter.letter}
                          {mode === 'letter-to-word' && q.letter.example_words[0].word}
                        </strong>
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-80">{q.letter.phonetic_hint}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    Exemple : <strong>{q.letter.example_words[0].word}</strong> = {q.letter.example_words[0].translation}
                  </div>
                </div>

                <button onClick={nextQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
                  {current + 1 >= questions.length
                    ? <><Trophy className="w-4 h-4" /> Voir les résultats</>
                    : <>Question suivante <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  PAGE PRINCIPALE : Alphabet                                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝
export default function Alphabet() {
  const [activeTab, setActiveTab]           = useState('alfabe')
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [filterSpecials, setFilterSpecials] = useState(false)

  const allLetters     = alphabetData.letters
  const specialLetters = allLetters.filter(l => l.special)
  const displayLetters = filterSpecials ? specialLetters : allLetters

  function toggleLetter(letter) {
    setSelectedLetter(prev => prev?.letter === letter.letter ? null : letter)
  }

  useEffect(() => {
    setSelectedLetter(null)
    setFilterSpecials(false)
  }, [activeTab])

  return (
    <div className="relative overflow-hidden min-h-full">
      <AlphabetBlob />
      <div className="relative z-10 p-4 sm:p-6 max-w-5xl mx-auto">
      <KurdishBorderTop />

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Alfabe — L'alphabet kurmandji
        </h1>
        <p className="text-gray-500 mt-1">
          31 lettres latines · {specialLetters.length} lettres spéciales essentielles
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-kurdish-green shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div>{tab.label}</div>
            <div className="text-xs font-normal opacity-60 hidden sm:block">{tab.sublabel}</div>
          </button>
        ))}
      </div>

      {/* ══ ONGLET 1 : ALFABE ══════════════════════════════════════════════ */}
      {activeTab === 'alfabe' && (
        <div>
          {/* Raccourcis lettres spéciales */}
          <div className="card mb-6 bg-gradient-to-r from-kurdish-green/5 to-transparent border-kurdish-green/20">
            <h2 className="font-semibold text-kurdish-green mb-3 flex items-center gap-2 text-sm">
              <Star className="w-4 h-4" />
              Lettres spéciales — cliquer pour les détails
            </h2>
            <div className="flex flex-wrap gap-2">
              {specialLetters.map(l => (
                <button key={l.letter}
                  onClick={() => { toggleLetter(l); setFilterSpecials(false) }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-sm ${
                    selectedLetter?.letter === l.letter
                      ? 'border-kurdish-green bg-kurdish-green/10'
                      : 'bg-white dark:bg-kurdish-dark-card border-kurdish-green/30 hover:border-kurdish-green'
                  }`}
                >
                  <span className="font-bold text-kurdish-green">{l.letter}</span>
                  <span className="text-xs text-gray-400 font-mono">{l.ipa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFilterSpecials(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !filterSpecials
                  ? 'bg-kurdish-green text-white'
                  : 'bg-white dark:bg-kurdish-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-kurdish-dark-border'
              }`}
            >Toutes ({allLetters.length})</button>
            <button onClick={() => setFilterSpecials(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterSpecials
                  ? 'bg-kurdish-green text-white'
                  : 'bg-white dark:bg-kurdish-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-kurdish-dark-border'
              }`}
            >Spéciales ({specialLetters.length})</button>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {displayLetters.map(letter => (
              <div key={letter.letter}>
                <button
                    onClick={() => toggleLetter(letter)}
                    className={`
                      w-full card p-3 text-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer
                      ${selectedLetter?.letter === letter.letter
                        ? 'ring-2 ring-kurdish-green shadow-green-glow bg-kurdish-green/5 border-kurdish-green/30'
                        : letter.special
                          ? 'border-kurdish-green/20 hover:border-kurdish-green hover:shadow-card'
                          : 'hover:border-gray-200 hover:shadow-card'
                      }
                    `}
                  >
                    <div className={`text-2xl sm:text-3xl font-display font-bold leading-none mb-1 ${
                      letter.special ? 'text-kurdish-green' : 'text-gray-800 dark:text-white'
                    }`}>
                      {letter.letter}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{letter.ipa}</div>
                    {letter.special && (
                      <div className="mt-1.5">
                        <span className="text-[10px] bg-kurdish-green/10 text-kurdish-green px-1.5 py-0.5 rounded-full">★</span>
                      </div>
                    )}
                  </button>
              </div>
            ))}
          </div>

          {/* Fiche détaillée */}
          <AnimatePresence>
            {selectedLetter && (
              <LetterDetail
                key={selectedLetter.letter}
                letter={selectedLetter}
                onClose={() => setSelectedLetter(null)}
              />
            )}
          </AnimatePresence>

          {/* Note culturelle */}
          <div className="mt-8 card bg-kurdish-yellow/10 border-kurdish-yellow/30">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-kurdish-yellow" />
              À savoir sur l'alphabet kurmandji
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Le kurmandji utilise un alphabet latin standardisé depuis les années 1930, grâce au linguiste
              Jeladet Ali Bedirkhan. Avant cela, il était écrit en perso-arabe. Les lettres avec diacritiques
              (ê, î, û, ç, ş) sont essentielles car elles distinguent des mots entièrement différents.
            </p>
          </div>
        </div>
      )}

      {/* ══ ONGLET 2 : LETTRES SPÉCIALES ═══════════════════════════════════ */}
      {activeTab === 'specials' && (
        <div>
          <div className="bg-kurdish-green/5 dark:bg-kurdish-green/10 border border-kurdish-green/20 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Ces <strong>{specialLetters.length} lettres</strong> sont absentes ou différentes du français.
              Cliquez sur une carte pour voir les exemples et l'astuce de prononciation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialLetters.map(letter => (
              <SpecialLetterCard key={letter.letter} letter={letter} />
            ))}
          </div>

          {/* Tableau récapitulatif */}
          <div className="mt-8 card overflow-hidden">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Tableau récapitulatif</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-kurdish-dark-border">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Lettre</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Son</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium hidden sm:table-cell">Équivalent</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Exemple</th>
                  </tr>
                </thead>
                <tbody>
                  {specialLetters.map(l => (
                      <tr key={l.letter} className="border-b border-gray-50 dark:border-kurdish-dark-border/50 hover:bg-gray-50 dark:hover:bg-kurdish-dark-border/30 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-xl font-bold text-kurdish-green font-display">{l.letter}</span>
                          <span className="text-gray-400 ml-1 text-xs font-mono">{l.ipa}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-gray-300 font-medium">{l.short_sound}</td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 text-xs max-w-[140px] hidden sm:table-cell">{l.phonetic_hint}</td>
                        <td className="py-3 pr-4">
                          <span className="font-bold text-kurdish-green">{l.example_words[0].word}</span>
                          <span className="text-gray-400 text-xs ml-1">= {l.example_words[0].translation}</span>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ ONGLET 3 : QUIZ ════════════════════════════════════════════════ */}
      {activeTab === 'quiz' && (
        <QuizModule allLetters={allLetters} />
      )}
      <KilimBand flip />
    </div>
    </div>
  )
}
