import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RotateCcw, BookOpen, CheckCircle2, Clock, Star, ChevronLeft, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSounds } from '../hooks/useSounds'
import Confetti from '../components/Confetti'
import { StarryNightBg, KilimBand } from '../components/Backgrounds'
import {
  getFlashcards,
  getDueFlashcards,
  updateFlashcard,
  createFlashcard,
  recordActivity,
} from '../lib/db'
import { calculateNextReview, QUALITY_LABELS } from '../lib/spaced-repetition'

// ─── Flip Card ─────────────────────────────────────────────────────────────────

function FlipCard({ card, flipped, onFlip }) {
  return (
    <div
      className="w-full max-w-md mx-auto cursor-pointer"
      style={{ perspective: 1200, height: 240 }}
      onClick={onFlip}
    >
      <motion.div
        style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front — French */}
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="rounded-2xl bg-white border-2 border-slate-200 shadow-lg flex flex-col items-center justify-center p-8 gap-3"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Français</span>
          <p className="text-3xl font-bold text-slate-800 text-center">{card.front_text}</p>
          <span className="text-sm text-slate-400 mt-2">Toucher pour révéler</span>
        </div>

        {/* Back — Kurdish */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
          className="rounded-2xl bg-gradient-to-br from-kurdish-green to-emerald-700 border-2 border-kurdish-green/50 shadow-lg flex flex-col items-center justify-center p-8 gap-3"
        >
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Kurmandji</span>
          <p className="text-4xl font-bold text-white text-center">{card.back_text}</p>
          {card.phonetic && (
            <p className="text-lg text-white/70 font-mono">/{card.phonetic}/</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Rating Buttons ────────────────────────────────────────────────────────────

const RATINGS = [
  { quality: 0, label: 'À revoir',  icon: '❌', bg: 'bg-red-50 hover:bg-red-100',     text: 'text-red-700',     border: 'border-red-200'     },
  { quality: 2, label: 'Difficile', icon: '🤔', bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-700', border: 'border-orange-200'  },
  { quality: 3, label: 'Bien',      icon: '👍', bg: 'bg-blue-50 hover:bg-blue-100',    text: 'text-blue-700',   border: 'border-blue-200'    },
  { quality: 5, label: 'Facile',    icon: '⭐', bg: 'bg-kurdish-green/5 hover:bg-kurdish-green/10', text: 'text-kurdish-green', border: 'border-kurdish-green/30' },
]

// ─── Review Session ────────────────────────────────────────────────────────────

function ReviewSession({ cards, onDone }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([]) // { card, quality }
  const [done, setDone] = useState(false)
  const { success, error: playError } = useSounds()

  const current = cards[index]

  const rate = useCallback(async (quality) => {
    const smData = calculateNextReview({
      easinessFactor: current.easiness_factor ?? 2.5,
      interval: current.interval ?? 0,
      repetitions: current.repetitions ?? 0,
    }, quality)

    await updateFlashcard(current.id, smData)

    if (quality >= 3) success()
    else playError()

    const newResults = [...results, { card: current, quality }]
    setResults(newResults)

    const next = index + 1
    if (next >= cards.length) {
      await recordActivity(current.user_id, { cardsReviewed: cards.length })
      setDone(true)
      onDone(newResults)
    } else {
      setIndex(next)
      setFlipped(false)
    }
  }, [current, index, results, success, playError, onDone])

  if (done) return null

  const progress = index / cards.length

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-kurdish-green rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-gray-400 w-16 text-right font-mono">{index}/{cards.length}</span>
      </div>

      {/* Card */}
      <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

      {/* Actions */}
      <AnimatePresence>
        {!flipped ? (
          <motion.button
            key="reveal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setFlipped(true)}
            className="w-full max-w-md mx-auto btn-primary"
          >
            Révéler la réponse
          </motion.button>
        ) : (
          <motion.div
            key="ratings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-2 max-w-md mx-auto w-full"
          >
            {RATINGS.map(r => (
              <button
                key={r.quality}
                onClick={() => rate(r.quality)}
                className={`py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 flex flex-col items-center gap-1 ${r.bg} ${r.text} ${r.border}`}
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-xs">{r.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <p className="text-center text-xs text-slate-400">
        {flipped ? 'Évaluez votre mémorisation honnêtement' : 'Essayez de vous souvenir avant de retourner'}
      </p>
    </div>
  )
}

// ─── Session Results ───────────────────────────────────────────────────────────

function SessionResults({ results, onRestart, onClose }) {
  const good  = results.filter(r => r.quality >= 3).length
  const total = results.length
  const pct   = Math.round((good / total) * 100)
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1

  return (
    <>
      {pct >= 80 && <Confetti count={50} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl overflow-hidden shadow-card"
      >
        {/* Header */}
        <div className={`px-6 pt-8 pb-10 text-center ${pct >= 80 ? 'bg-gradient-to-br from-kurdish-green to-emerald-700' : 'bg-gradient-to-br from-kurdish-gold to-amber-600'}`}>
          <div className="text-5xl mb-3">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <div className="flex justify-center gap-1 mb-3">
            {[0, 1, 2].map(i => (
              <Star key={i} className={`w-6 h-6 ${i < stars ? 'text-white fill-white' : 'text-white/30 fill-white/30'}`} />
            ))}
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-1">Session terminée !</h2>
          <p className="text-white/70 text-sm">{total} cartes révisées</p>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-6 flex flex-col gap-4">
          {/* Score circle */}
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${pct >= 80 ? 'border-kurdish-green/30 bg-kurdish-green/5' : 'border-kurdish-gold/30 bg-kurdish-gold/5'}`}>
              <span className={`text-2xl font-bold ${pct >= 80 ? 'text-kurdish-green' : 'text-kurdish-gold'}`}>{pct}%</span>
              <span className="text-xs text-gray-400">réussi</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-kurdish-green/5 border border-kurdish-green/20 p-3 text-center">
              <p className="text-2xl font-bold text-kurdish-green">{good}</p>
              <p className="text-xs text-kurdish-green/70">Bien mémorisé</p>
            </div>
            <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{total - good}</p>
              <p className="text-xs text-red-500">À retravailler</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <RotateCcw size={16} /> Recommencer
            </button>
            <button onClick={onClose} className="btn-primary flex-1">Terminer</button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Add Card Form ─────────────────────────────────────────────────────────────

function AddCardForm({ userId, onAdded, onClose }) {
  const [fr, setFr] = useState('')
  const [kd, setKd] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fr.trim() || !kd.trim()) return
    setSaving(true)
    const card = await createFlashcard(userId, {
      front_text: fr.trim(),
      back_text: kd.trim(),
      phonetic: phonetic.trim() || null,
    })
    setSaving(false)
    if (card) {
      onAdded(card)
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Nouvelle carte</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Français *</label>
            <input
              type="text"
              value={fr}
              onChange={e => setFr(e.target.value)}
              placeholder="ex: bonjour"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Kurmandji *</label>
            <input
              type="text"
              value={kd}
              onChange={e => setKd(e.target.value)}
              placeholder="ex: rojbaş"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phonétique</label>
            <input
              type="text"
              value={phonetic}
              onChange={e => setPhonetic(e.target.value)}
              placeholder="ex: rodʒˈbaʃ"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !fr.trim() || !kd.trim()}
            className="w-full btn-primary mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Ajout...' : 'Ajouter la carte'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Stats Banner ──────────────────────────────────────────────────────────────

function StatsBanner({ total, due, mastered }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl bg-white border border-gray-100 p-4 text-center shadow-card flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mb-1">
          <BookOpen className="w-4 h-4 text-gray-500" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{total}</p>
        <p className="text-xs text-gray-400">Total</p>
      </div>
      <div className="rounded-2xl bg-kurdish-gold/5 border border-kurdish-gold/20 p-4 text-center shadow-sm flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-kurdish-gold/15 flex items-center justify-center mb-1">
          <Clock className="w-4 h-4 text-kurdish-gold" />
        </div>
        <p className="text-2xl font-bold text-kurdish-gold">{due}</p>
        <p className="text-xs text-kurdish-gold/70">À réviser</p>
      </div>
      <div className="rounded-2xl bg-kurdish-green/5 border border-kurdish-green/20 p-4 text-center shadow-sm flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-kurdish-green/15 flex items-center justify-center mb-1">
          <Star className="w-4 h-4 text-kurdish-green" />
        </div>
        <p className="text-2xl font-bold text-kurdish-green">{mastered}</p>
        <p className="text-xs text-kurdish-green/70">Maîtrisées</p>
      </div>
    </div>
  )
}

// ─── Card List Item ────────────────────────────────────────────────────────────

function CardItem({ card }) {
  const isDue = !card.next_review || card.next_review <= new Date().toISOString().slice(0, 10)
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{card.front_text}</p>
        <p className="text-sm text-emerald-700 truncate">{card.back_text}</p>
      </div>
      {card.mastered ? (
        <span className="shrink-0 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Maîtrisée</span>
      ) : isDue ? (
        <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">À réviser</span>
      ) : (
        <span className="shrink-0 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
          J+{card.interval ?? 0}
        </span>
      )}
    </div>
  )
}

// ─── Main Flashcards Page ──────────────────────────────────────────────────────

export default function Flashcards() {
  const { user } = useAuth()
  const { completion } = useSounds()

  const [allCards, setAllCards] = useState([])
  const [dueCards, setDueCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('home') // 'home' | 'session' | 'results' | 'list'
  const [sessionResults, setSessionResults] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [all, due] = await Promise.all([
      getFlashcards(user.id),
      getDueFlashcards(user.id),
    ])
    setAllCards(all)
    setDueCards(due)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const handleSessionDone = useCallback((results) => {
    setSessionResults(results)
    setView('results')
    completion()
  }, [completion])

  const handleAddCard = useCallback((newCard) => {
    setAllCards(prev => [...prev, newCard])
    setDueCards(prev => [...prev, newCard])
  }, [])

  const mastered = allCards.filter(c => c.mastered).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Results view ──
  if (view === 'results' && sessionResults) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <SessionResults
          results={sessionResults}
          onRestart={() => { load(); setView('session') }}
          onClose={() => { load(); setView('home') }}
        />
      </div>
    )
  }

  // ── Active session ──
  if (view === 'session') {
    if (dueCards.length === 0) {
      return (
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-6 text-center">
          <CheckCircle2 size={56} className="text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Aucune carte à réviser</h2>
            <p className="text-slate-500 mt-1">Revenez demain ou ajoutez de nouvelles cartes.</p>
          </div>
          <button
            onClick={() => setView('home')}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Retour
          </button>
        </div>
      )
    }

    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Révision</h1>
        </div>
        <ReviewSession
          key={dueCards[0]?.id}
          cards={dueCards}
          onDone={handleSessionDone}
        />
      </div>
    )
  }

  // ── Card list view ──
  if (view === 'list') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Toutes les cartes ({allCards.length})</h1>
        </div>

        {allCards.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>Aucune carte. Complétez des leçons ou ajoutez-en manuellement.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allCards.map(card => <CardItem key={card.id} card={card} />)}
          </div>
        )}
      </div>
    )
  }

  // ── Home view ──
  return (
    <div className="relative min-h-full">
      <StarryNightBg />
      <KilimBand />
    <div className="relative z-10 max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Flashcards</h1>
          <p className="text-white/50 text-sm mt-0.5">Répétition espacée SM-2</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Stats */}
      <StatsBanner total={allCards.length} due={dueCards.length} mastered={mastered} />

      {/* Start review CTA */}
      {dueCards.length > 0 ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => setView('session')}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-kurdish-green to-emerald-600 text-white font-bold text-lg shadow-green-glow hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw size={22} />
          Réviser {dueCards.length} carte{dueCards.length > 1 ? 's' : ''}
        </motion.button>
      ) : (
        <div className="w-full py-5 rounded-2xl bg-kurdish-green/5 border border-kurdish-green/20 text-kurdish-green font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle2 size={20} />
          Tout est à jour — revenez demain
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setView('list')}
          className="py-4 rounded-2xl bg-white border border-gray-100 hover:border-kurdish-green/30 hover:shadow-card transition-all flex flex-col items-center gap-2 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <BookOpen size={20} className="text-gray-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Toutes les cartes</span>
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="py-4 rounded-2xl bg-white border border-gray-100 hover:border-kurdish-green/30 hover:shadow-card transition-all flex flex-col items-center gap-2 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-kurdish-green/10 flex items-center justify-center">
            <Plus size={20} className="text-kurdish-green" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Nouvelle carte</span>
        </button>
      </div>

      {/* Next review info */}
      {dueCards.length === 0 && allCards.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-white/45 justify-center">
          <Clock size={15} />
          <span>Prochain rappel dans {(() => {
            const next = allCards
              .filter(c => c.next_review)
              .map(c => c.next_review)
              .sort()[0]
            if (!next) return '—'
            const days = Math.ceil((new Date(next) - new Date()) / 86400000)
            return days <= 0 ? 'aujourd\'hui' : days === 1 ? 'demain' : `${days} jours`
          })()}</span>
        </div>
      )}

      {/* Empty state */}
      {allCards.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Star size={40} className="mx-auto mb-3 text-white/20" />
          <p className="font-medium text-white/70">Aucune carte pour l'instant</p>
          <p className="text-sm mt-1 text-white/45">Les cartes sont ajoutées automatiquement quand vous complétez des leçons.</p>
        </div>
      )}

      {/* Add form modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddCardForm
            userId={user?.id}
            onAdded={handleAddCard}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
    <KilimBand flip />
    </div>
  )
}
