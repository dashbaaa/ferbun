import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getDueFlashcards, getFlashcards, updateFlashcard, recordActivity } from '../lib/db'
import { calculateNextReview } from '../lib/spaced-repetition'
import { useSounds } from '../hooks/useSounds'
import { LEVELS, calcLevel } from '../lib/db'
import { KurdishLogoIcon } from './KurdishLogo'
import { GlobalBlobs } from './Backgrounds'
import {
  BookOpen, MessageCircle, CreditCard, AlignLeft,
  MessageSquare, LayoutDashboard, LogOut,
  Sun, Moon, Heart, RotateCcw, Timer, X, ArrowUp,
} from 'lucide-react'

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Tableau de bord', sublabel: 'Pêşkeftin' },
  { path: '/lessons',    icon: BookOpen,         label: 'Leçons',          sublabel: 'Dersên'    },
  { path: '/flashcards', icon: CreditCard,       label: 'Flashcards',      sublabel: 'Kartên'    },
  { path: '/chat',       icon: MessageCircle,    label: 'Tuteur IA',       sublabel: 'Mamostê'   },
  { path: '/alphabet',   icon: AlignLeft,        label: 'Alphabet',        sublabel: 'Alfabe'    },
  { path: '/phrases',    icon: MessageSquare,    label: 'Phrases',         sublabel: 'Hevok'     },
]
const BOTTOM_NAV = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Accueil'   },
  { path: '/lessons',    icon: BookOpen,         label: 'Leçons'    },
  { path: '/flashcards', icon: CreditCard,       label: 'Cartes'    },
  { path: '/alphabet',   icon: AlignLeft,        label: 'Alphabet'  },
  { path: '/phrases',    icon: MessageSquare,    label: 'Phrases'   },
]

// ─── Countdown cœurs ──────────────────────────────────────────────────────────
function useCountdown(nextHeartAt) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    if (!nextHeartAt) { setTimeLeft(''); return }
    function update() {
      const diff = nextHeartAt - Date.now()
      if (diff <= 0) { setTimeLeft(''); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [nextHeartAt])
  return timeLeft
}

// ─── Affichage cœurs ─────────────────────────────────────────────────────────
function HeartsDisplay({ hearts, nextHeartAt, onEarnClick, dark = false }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const countdown = useCountdown(nextHeartAt)

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(t => !t)}
        onBlur={() => setTimeout(() => setShowTooltip(false), 150)}
        className="flex items-center gap-0.5 focus:outline-none"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            animate={i === hearts && hearts < 5 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`text-[15px] leading-none select-none inline-block ${
              i < hearts && hearts <= 2 ? 'heart-low' : ''
            }`}
            style={i < hearts && hearts <= 2 ? { animationDelay: `${i * 0.15}s` } : {}}
          >
            {i < hearts ? '❤️' : '🖤'}
          </motion.span>
        ))}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-9 z-50 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
          >
            <p className="font-bold text-gray-800 text-sm mb-1">{hearts} / 5 cœurs</p>
            {hearts < 5 && countdown ? (
              <>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <Timer className="w-3 h-3" /> Prochain cœur dans {countdown}
                </p>
                <button
                  onClick={() => { setShowTooltip(false); onEarnClick() }}
                  className="w-full text-xs bg-kurdish-green text-white rounded-xl py-2 font-semibold hover:bg-kurdish-green-dark transition-colors"
                >
                  Réviser pour gagner ❤️
                </button>
              </>
            ) : hearts === 5 ? (
              <p className="text-xs text-kurdish-green font-medium">Cœurs au maximum ✓</p>
            ) : (
              <p className="text-xs text-gray-400">Calcul en cours…</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Écran 0 cœurs (export) ──────────────────────────────────────────────────
export function HeartsEmptyScreen({ nextHeartAt, onEarnClick }) {
  const countdown = useCountdown(nextHeartAt)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
    >
      <div className="text-7xl mb-4">💔</div>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Dilên te qedîyan !</h2>
      <p className="text-gray-500 mb-1 max-w-xs">
        Tes cœurs sont épuisés ! Attends la régénération ou révise tes flashcards pour en gagner.
      </p>
      {countdown && (
        <div className="flex items-center gap-2 text-kurdish-green font-bold text-xl my-4">
          <Timer className="w-5 h-5" />
          <span>{countdown}</span>
          <span className="text-sm font-normal text-gray-400">avant le prochain cœur</span>
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onEarnClick}
        className="mt-2 btn-primary flex items-center gap-2"
      >
        <Heart className="w-4 h-4" /> Réviser pour gagner un ❤️
      </motion.button>
      <p className="text-xs text-gray-400 mt-3">Réussis 8/10 cartes pour récupérer un cœur.</p>
    </motion.div>
  )
}

// ─── Modal "Gagner un cœur" ───────────────────────────────────────────────────
export function EarnHeartModal({ onClose }) {
  const { user, gainHeart } = useAuth()
  const sounds = useSounds()
  const [phase,   setPhase]   = useState('loading')
  const [cards,   setCards]   = useState([])
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [earned,  setEarned]  = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      let due = await getDueFlashcards(user.id)
      if (due.length < 5) due = await getFlashcards(user.id)
      const shuffled = [...due].sort(() => Math.random() - 0.5).slice(0, 10)
      if (shuffled.length === 0) { setPhase('no-cards'); return }
      setCards(shuffled)
      setPhase('playing')
    }
    load()
  }, [user])

  const total   = cards.length
  const current = cards[index]

  const rate = useCallback(async (quality) => {
    if (!current) return
    const ok = quality >= 3
    if (ok) { sounds.success(); setCorrect(c => c + 1) } else { sounds.error() }
    await updateFlashcard(current.id, calculateNextReview({
      easinessFactor: current.easiness_factor ?? 2.5,
      interval:       current.interval        ?? 0,
      repetitions:    current.repetitions     ?? 0,
    }, quality))
    const next = index + 1
    if (next >= total) {
      const finalCorrect = correct + (ok ? 1 : 0)
      if (finalCorrect >= Math.ceil(total * 0.8)) { await gainHeart(); setEarned(true); sounds.completion() }
      await recordActivity(user.id, { cardsReviewed: total })
      setPhase('done')
    } else {
      setIndex(next)
      setFlipped(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, index, correct, total])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900">Réviser pour un ❤️</h3>
            <p className="text-xs text-gray-400">Réussis 8/{total || 10} cartes minimum</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {phase === 'loading' && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-kurdish-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {phase === 'no-cards' && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune carte disponible pour réviser.</p>
            <button onClick={onClose} className="btn-primary">Fermer</button>
          </div>
        )}
        {phase === 'playing' && current && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-kurdish-green rounded-full transition-all duration-300"
                  style={{ width: `${(index / total) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{index}/{total}</span>
            </div>
            <div className="relative w-full cursor-pointer" style={{ perspective: 1200, height: 160 }}
              onClick={() => setFlipped(f => !f)}>
              <motion.div
                style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                  className="rounded-2xl bg-kurdish-green-light border-2 border-kurdish-green/20 flex flex-col items-center justify-center gap-2 p-6">
                  <span className="text-xs font-semibold text-kurdish-green/60 uppercase tracking-wide">Français</span>
                  <p className="text-2xl font-bold text-gray-800 text-center">{current.front_text}</p>
                  <span className="text-xs text-gray-300">Toucher pour révéler</span>
                </div>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
                  className="rounded-2xl bg-gradient-to-br from-kurdish-green to-kurdish-green-dark flex flex-col items-center justify-center gap-2 p-6">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">Kurmandji</span>
                  <p className="text-3xl font-display font-bold text-white text-center">{current.back_text}</p>
                  {current.phonetic && <p className="text-sm font-mono text-white/70">/{current.phonetic}/</p>}
                </div>
              </motion.div>
            </div>
            <AnimatePresence>
              {flipped && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-4 gap-2">
                  {[
                    { q: 0, label: '❌ Raté',      cls: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' },
                    { q: 2, label: '🤔 Difficile', cls: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' },
                    { q: 3, label: '👍 Bien',       cls: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
                    { q: 5, label: '⭐ Facile',     cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
                  ].map(r => (
                    <button key={r.q} onClick={() => rate(r.q)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-colors ${r.cls}`}>
                      {r.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {phase === 'done' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4">
            <div className="text-5xl mb-3">{earned ? '❤️' : '💔'}</div>
            <h4 className="font-bold text-xl text-gray-900 mb-1">{correct}/{total} réussies</h4>
            {earned
              ? <p className="text-kurdish-green font-medium mb-4">Bravo ! Tu as regagné un cœur !</p>
              : <p className="text-gray-500 mb-4">Il fallait {Math.ceil(total * 0.8)}/{total}. Continue !</p>
            }
            <button onClick={onClose} className="btn-primary w-full">
              {earned ? 'Super, merci !' : 'Fermer'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Sidebar Logo ─────────────────────────────────────────────────────────────
function SidebarLogo() {
  return (
    <div className="p-5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <KurdishLogoIcon size={40} className="flex-shrink-0" />
        <div>
          <h1 className="font-display font-bold text-xl text-white tracking-tight">Fêrbûn</h1>
          <p className="text-xs text-kurdish-green font-medium tracking-wider">Kurmandji</p>
        </div>
      </div>
    </div>
  )
}

// ─── Mountain motif (décoratif, bas de sidebar) ───────────────────────────────
function SidebarMountains() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 256 80" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0,80 L0,65 L30,44 L48,56 L72,30 L96,52 L116,36 L140,56 L160,38 L184,56 L204,40 L228,58 L256,46 L256,80 Z"
          fill="white"
          fillOpacity="0.04"
        />
      </svg>
    </div>
  )
}

// ─── Layout principal ─────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [darkMode,      setDarkMode]      = useState(false)
  const [showEarnModal, setShowEarnModal] = useState(false)
  const { profile, signOut, hearts, nextHeartAt } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [showScrollTop, setShowScrollTop] = useState(false)

  const toggleDark = () => {
    setDarkMode(d => !d)
    document.documentElement.classList.toggle('dark')
  }

  useEffect(() => {
    const main = document.getElementById('main-scroll')
    if (!main) return
    const onScroll = () => setShowScrollTop(main.scrollTop > 300)
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // Initiales + couleur d'avatar déterministe
  const name     = profile?.display_name || 'Ku'
  const initials = name.slice(0, 2).toUpperCase()
  const avatarColors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600', 'from-amber-400 to-orange-500']
  const avatarGradient = avatarColors[initials.charCodeAt(0) % avatarColors.length]

  // Barre de niveau
  const xp    = profile?.xp || 0
  const level = calcLevel(xp)
  const meta  = LEVELS[level]
  const pct   = Math.min(100, Math.round(((xp - meta.min) / (meta.next - meta.min)) * 100))

  const levelLabels = {
    beginner: 'Destpêker', novice: 'Nûner', intermediate: 'Navîn',
    advanced: 'Pêşketî',   expert: 'Şareza',
  }

  return (
    <div className="h-screen app-bg flex overflow-hidden">

      {/* ── Blobs fixes globaux ── */}
      <GlobalBlobs />

      {/* ── Overlay mobile ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══════════ SIDEBAR (desktop always, mobile as drawer) ════════════ */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-64 h-screen flex flex-col flex-shrink-0 overflow-hidden
          bg-gradient-sidebar
          border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarLogo />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3.5 py-3 rounded-xl
                  transition-all duration-150 group overflow-hidden
                  ${isActive
                    ? 'text-white border-l-[3px] border-kurdish-gold bg-white/10 ml-[-1px] pl-[calc(0.875rem-2px)]'
                    : 'text-white/55 hover:text-white/90 hover:bg-white/7 border-l-[3px] border-transparent ml-[-1px] pl-[calc(0.875rem-2px)]'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-kurdish-green/20 to-transparent pointer-events-none" />
                )}
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 relative z-10 transition-colors
                  ${isActive ? 'text-kurdish-green' : 'text-white/50 group-hover:text-white/80'}`}
                  style={{ width: 18, height: 18 }}
                />
                <div className="flex-1 min-w-0 relative z-10">
                  <div className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </div>
                  <div className={`text-[11px] leading-none mt-0.5
                    ${isActive ? 'text-kurdish-green/80' : 'text-white/30 group-hover:text-white/50'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Cœurs */}
        <div className="px-3 pb-2">
          <div className="bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">Dil — Cœurs</span>
            <HeartsDisplay
              hearts={hearts}
              nextHeartAt={nextHeartAt}
              onEarnClick={() => setShowEarnModal(true)}
              dark
            />
          </div>
        </div>

        {/* Séparateur doré */}
        <div className="mx-4 mb-1 h-px bg-gradient-to-r from-transparent via-kurdish-gold/30 to-transparent" />

        {/* Profil */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/6 transition-colors">
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {profile?.display_name || 'Utilisateur'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Badge niveau coloré */}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  level === 'beginner'    ? 'bg-green-500/80 text-white' :
                  level === 'novice'      ? 'bg-blue-400/80 text-white' :
                  level === 'intermediate'? 'bg-blue-600/80 text-white' :
                  level === 'advanced'    ? 'bg-amber-500/80 text-white' :
                                           'bg-red-500/80 text-white'
                }`}>
                  {levelLabels[level] || level}
                </span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/40">{xp} XP</span>
              </div>
            </div>
          </div>

          {/* Mini barre de niveau */}
          <div className="mx-2 mt-1.5 mb-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-kurdish-green rounded-full"
              />
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={toggleDark}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white/40 hover:text-white/80 hover:bg-white/8 rounded-xl transition-colors text-xs"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {darkMode ? 'Clair' : 'Sombre'}
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quitter
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ═══════════ Contenu principal ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-10 border-b border-white/10 px-4 flex items-center justify-between shadow-sm" style={{ background: '#1A2332', height: 56 }}>
          {/* Spacer gauche pour centrer le logo */}
          <div className="w-10 flex-shrink-0" />
          {/* Logo centré */}
          <div className="flex items-center gap-2">
            <KurdishLogoIcon size={26} />
            <span className="font-display font-bold text-white text-base">Fêrbûn</span>
          </div>
          {/* Droite : cœurs + avatar */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <HeartsDisplay hearts={hearts} nextHeartAt={nextHeartAt} onEarnClick={() => setShowEarnModal(true)} dark />
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-md`}>
              <span className="text-[10px] font-bold text-white">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main id="main-scroll" className="flex-1 overflow-auto lg:pb-0 relative pb-nav-safe">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>

          {/* Bouton retour en haut */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed lg:bottom-6 right-4 z-30 w-10 h-10 rounded-full bg-kurdish-green text-white shadow-lg flex items-center justify-center hover:bg-kurdish-green-dark active:scale-95 transition-colors"
                style={{ bottom: 'calc(65px + env(safe-area-inset-bottom, 0px) + 16px)' }}
                style={{ boxShadow: '0 4px 16px rgba(27,125,78,0.35)' }}
                aria-label="Retour en haut"
              >
                <ArrowUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ═══════════ Bottom nav mobile ═══════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-white/10"
        style={{ background: '#1A2332', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-[65px] px-2">
          {BOTTOM_NAV.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-kurdish-green/15' : ''}`}>
                  <item.icon
                    style={{ width: 22, height: 22 }}
                    className={isActive ? 'text-kurdish-green' : 'text-white/45'}
                  />
                </div>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-kurdish-green font-semibold' : 'text-white/45'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ═══════════ Modal cœur ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEarnModal && (
          <EarnHeartModal onClose={() => setShowEarnModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
