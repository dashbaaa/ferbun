import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DashboardBanner } from '../components/Backgrounds'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  BookOpen, MessageCircle, CreditCard, AlignLeft,
  Flame, Star, Target, Trophy, Zap, Calendar, TrendingUp, Plus, CheckCircle2, Clock, Lock,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getRecentActivity, getDueFlashcards, getLessonProgress,
  LEVELS, calcLevel, createFlashcard, getFlashcards, getDailyChallengeResult,
} from '../lib/db'
import { LESSONS } from '../data/lessons'
import { getWordOfDay } from '../data/wordofday'
import { getNextUTCMidnight, todayISO } from '../data/dailychallenge'

// ─── Messages motivants en kurmandji ─────────────────────────────────────────
const MOTIVATIONS = [
  { kd: 'Her roj pêşve here!',               fr: 'Avance chaque jour !' },
  { kd: 'Tu dikarî, heval!',                 fr: 'Tu peux le faire, ami !' },
  { kd: 'Zanîn ronahiya jiyanê ye.',          fr: 'Le savoir est la lumière de la vie.' },
  { kd: 'Dewam bike, serkeftin nêzîkê te ye!', fr: 'Continue, la réussite est proche !' },
  { kd: 'Kurmandji bi dilxweşî fêr bibe.',   fr: 'Apprends le kurmandji avec joie.' },
  { kd: 'Gav bi gav, mêrik!',                fr: 'Pas à pas, courage !' },
  { kd: 'Zimanê xwe ji bîr neke.',           fr: "N'oublie pas ta langue." },
]

// ─── Hook compteur animé (0 → target en ~1s) ─────────────────────────────────
function useAnimatedCounter(target, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!target || target === 0) { setValue(0); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return value
}

// ─── Variantes d'animation stagger ───────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Mot du Jour ──────────────────────────────────────────────────────────────
function WordOfDay({ userId }) {
  const word      = useMemo(() => getWordOfDay(), [])
  const [added,   setAdded]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!userId) return
    getFlashcards(userId).then(cards => {
      if (cards.some(c => c.back_text === word.kd)) setAdded(true)
    })
  }, [userId, word.kd])

  async function addToFlashcards() {
    if (added || loading || !userId) return
    setLoading(true)
    setError(false)
    const card = await createFlashcard(userId, {
      front_text: word.fr,
      back_text:  word.kd,
      phonetic:   word.phonetic,
      source:     'mot_du_jour',
    })
    setLoading(false)
    if (card) setAdded(true)
    else setError(true)
  }

  return (
    <motion.div variants={itemVariants}
      className="relative overflow-hidden rounded-3xl shadow-lg text-white kurdish-pattern"
      style={{ background: 'linear-gradient(135deg, #1B7D4E 0%, #0D5C35 60%, #0A4A2A 100%)' }}
    >
      {/* Bordure dorée subtile */}
      <div className="absolute inset-0 rounded-3xl border border-kurdish-gold/20 pointer-events-none" />

      {/* Soleil décoratif en filigrane */}
      <div className="absolute top-3 right-4 opacity-[0.07] select-none pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-28 h-28" fill="none">
          <circle cx="40" cy="40" r="14" stroke="white" strokeWidth="2" />
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
            const r = (a * Math.PI) / 180
            return <line key={i}
              x1={40 + 18 * Math.cos(r)} y1={40 + 18 * Math.sin(r)}
              x2={40 + 26 * Math.cos(r)} y2={40 + 26 * Math.sin(r)}
              stroke="white" strokeWidth="2" strokeLinecap="round"
            />
          })}
        </svg>
      </div>

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">☀️</span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            Peyva Rojê — Mot du Jour
          </span>
        </div>

        <div className="mb-1 overflow-hidden">
          <span className="block text-5xl font-display font-bold leading-none tracking-tight break-all"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
            {word.kd}
          </span>
        </div>
        <p className="text-sm font-mono text-white/60 mb-1">/{word.phonetic}/</p>
        <p className="text-2xl font-semibold text-white/90 mb-4">{word.fr}</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-3 border border-white/15">
          <p className="text-sm font-medium italic leading-relaxed">
            &ldquo;{word.example_kd}&rdquo;
          </p>
          <p className="text-xs text-white/60 mt-1">{word.example_fr}</p>
        </div>

        {word.cultural && (
          <div className="bg-kurdish-gold/15 border border-kurdish-gold/30 rounded-2xl px-3 py-2.5 mb-4 flex gap-2">
            <span className="text-sm flex-shrink-0">💡</span>
            <p className="text-xs text-white/80 leading-relaxed">{word.cultural}</p>
          </div>
        )}

        <div className="flex flex-col items-start gap-1">
          <button
            onClick={addToFlashcards}
            disabled={added || loading}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-md
              ${added
                ? 'bg-white/15 text-white/80 border border-white/25 cursor-default'
                : error
                  ? 'bg-kurdish-red text-white hover:bg-red-500 active:scale-95'
                  : 'bg-white text-kurdish-green hover:bg-white/90 active:scale-95 hover:shadow-green-glow'
              }
            `}
          >
            {added   ? <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> ✓ Ajouté aux flashcards</>
            : loading ? <span className="animate-pulse">Ajout en cours…</span>
            : error   ? <><Plus className="w-4 h-4" /> Réessayer</>
            :           <><Plus className="w-4 h-4" /> Ajouter aux flashcards</>}
          </button>
          {error && (
            <p className="text-xs text-red-200 pl-1">Erreur — vérifie ta connexion et réessaie.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Timer défi ───────────────────────────────────────────────────────────────
function useDailyCountdown() {
  const targetMs = getNextUTCMidnight()
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

// ─── Défi Quotidien Card ──────────────────────────────────────────────────────
function DailyChallengeCard({ userId }) {
  const [result,  setResult]  = useState(undefined)
  const countdown = useDailyCountdown()

  useEffect(() => {
    if (!userId) return
    getDailyChallengeResult(userId, todayISO()).then(r => setResult(r ?? null))
  }, [userId])

  const done = !!result
  const pct  = done ? Math.round((result.score / result.total) * 100) : null
  const emoji = !done ? '⚡' : pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '📚'

  return (
    <motion.div variants={itemVariants}
      className="relative overflow-hidden rounded-3xl shadow-lg text-white"
      style={{ background: 'linear-gradient(135deg, #D4940A 0%, #B87A08 60%, #9E6A06 100%)' }}
    >
      {/* ⚡ animé en fond */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1 right-2 text-[110px] leading-none select-none pointer-events-none"
      >⚡</motion.div>

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <motion.span
            animate={!done ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg"
          >{emoji}</motion.span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            Pirs a Rojê — Défi Quotidien
          </span>
        </div>

        {result === undefined ? (
          <div className="h-16 flex items-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : done ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              {[
                { label: 'Score', value: `${result.score}/${result.total}` },
                { label: 'Précision', value: `${pct}%` },
                { label: 'XP', value: `+${result.xp_gained}` },
              ].map((s, i) => (
                <div key={i} className="text-center flex-1">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/15 border border-white/20 rounded-2xl px-3 py-2.5 flex items-center gap-2">
              <Clock size={13} className="text-white/70" />
              <span className="text-xs text-white/70">Prochain défi dans</span>
              <span className="font-mono font-bold text-sm ml-auto">{countdown}</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl font-bold mb-1">10 questions · Une chance par jour</p>
            <p className="text-sm text-white/70 mb-4">
              Gagne jusqu'à <span className="font-bold text-white">+100 XP</span> avec ≥ 80 % !
            </p>
            <div className="bg-white/15 border border-white/20 rounded-2xl px-3 py-2.5 flex items-center gap-2 mb-4">
              <Clock size={13} className="text-white/70" />
              <span className="text-xs text-white/70">Expire dans</span>
              <span className="font-mono font-bold text-sm ml-auto">{countdown}</span>
            </div>
            <Link
              to="/daily-challenge"
              className="block w-full bg-white text-kurdish-gold font-bold text-center px-4 py-3 rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-md"
            >
              ⚡ Relever le défi
            </Link>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Stat cards animées ───────────────────────────────────────────────────────
function AnimatedStatCard({ icon: Icon, rawValue, label, iconBg }) {
  const isNumeric = typeof rawValue === 'number'
  const animated  = useAnimatedCounter(isNumeric ? rawValue : 0)
  const display   = isNumeric ? animated : rawValue

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(27,125,78,0.15)' }}
      className="rounded-3xl p-4 text-center transition-shadow"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconBg} mx-auto mb-2.5 flex items-center justify-center shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{display}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </motion.div>
  )
}

function AnimatedStatCards({ profile, dueCount }) {
  const cards = [
    { icon: Flame,  rawValue: profile?.current_streak || 0, label: 'Jours de suite',
      iconBg: 'from-orange-400 to-red-500' },
    { icon: Star,   rawValue: profile?.xp || 0,             label: 'Points XP',
      iconBg: 'from-amber-400 to-yellow-500' },
    { icon: Target, rawValue: dueCount > 0 ? dueCount : '✓', label: dueCount > 0 ? 'Cartes dues' : 'Cartes OK',
      iconBg: 'from-kurdish-green to-emerald-600' },
  ]
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
      {cards.map((s, i) => <AnimatedStatCard key={i} {...s} />)}
    </motion.div>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { path: '/lessons',    icon: BookOpen,      label: 'Commencer une leçon',  sublabel: 'Dersekê destpêke',
    gradient: 'from-kurdish-green to-kurdish-green-dark', glow: 'shadow-green-glow' },
  { path: '/flashcards', icon: CreditCard,    label: 'Réviser les cartes',   sublabel: 'Kartên nûve bike',
    gradient: 'from-amber-400 to-orange-500', glow: 'shadow-gold-glow' },
  { path: '/phrases',    icon: MessageCircle, label: 'Phrases du quotidien', sublabel: 'Gotinên rojane',
    gradient: 'from-blue-500 to-cyan-600', glow: '' },
  { path: '/alphabet',   icon: AlignLeft,     label: "Apprendre l'alphabet", sublabel: 'Alfabeyê fêr bibe',
    gradient: 'from-violet-500 to-purple-600', glow: '' },
]

// ─── Badges ───────────────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_lesson', icon: '🎓', label: 'Première leçon',    check: (p, lp) => Object.values(lp).some(l => l.completed) },
  { id: 'streak_3',     icon: '🔥', label: 'Série de 3 jours',  check: (p)     => (p?.current_streak || 0) >= 3 },
  { id: 'streak_7',     icon: '⚡', label: "Série d'une semaine",check: (p)     => (p?.current_streak || 0) >= 7 },
  { id: 'xp_100',       icon: '⭐', label: '100 XP',             check: (p)     => (p?.xp || 0) >= 100 },
  { id: 'xp_500',       icon: '🌟', label: '500 XP',             check: (p)     => (p?.xp || 0) >= 500 },
  { id: 'all_lessons',  icon: '🏆', label: 'Toutes les leçons', check: (p, lp) => LESSONS.every(l => lp[l.id]?.completed) },
]

function BadgeGrid({ profile, lessonProgress }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {BADGES.map((badge, i) => {
        const earned = badge.check(profile, lessonProgress)
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all overflow-hidden ${
              earned
                ? 'border-kurdish-gold/40 badge-glow'
                : 'opacity-35 grayscale'
            }`}
            style={earned
              ? { background: 'rgba(212,148,10,0.12)' }
              : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }
            }
          >
            {/* Effet shine animé sur les badges débloqués */}
            {earned && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'badge-shine 3s ease-in-out infinite',
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            )}
            <span className="text-2xl relative z-10">{badge.icon}</span>
            <span className="text-xs text-center text-white/70 leading-tight font-medium relative z-10">{badge.label}</span>
            {!earned && <Lock size={10} className="text-slate-400" />}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Barre de niveau ──────────────────────────────────────────────────────────
function LevelBar({ xp }) {
  const level = calcLevel(xp || 0)
  const meta  = LEVELS[level]
  const pct   = Math.min(100, Math.round(((xp - meta.min) / (meta.next - meta.min)) * 100))
  const labelMap = {
    beginner: 'Destpêker', novice: 'Nûner', intermediate: 'Navîn',
    advanced: 'Pêşketî',   expert: 'Şareza',
  }

  return (
    <motion.div variants={itemVariants} className="rounded-3xl p-5"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-white/40 font-medium uppercase tracking-wide">Niveau actuel</p>
          <p className="text-xl font-bold text-white mt-0.5">
            {labelMap[level] || level}
            <span className="text-white/40 font-normal text-base ml-2">· {meta.fr}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-kurdish-green">{xp || 0}</p>
          <p className="text-xs text-white/40">XP</p>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #1B7D4E 0%, #2DC572 100%)', boxShadow: '0 0 12px rgba(27,125,78,0.6)' }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-white/35">
        <span>{meta.min} XP</span>
        <span className="font-medium text-emerald-400">{pct}%</span>
        <span>{meta.next} XP</span>
      </div>
    </motion.div>
  )
}

// ─── Graphique XP ─────────────────────────────────────────────────────────────
const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function XPChart({ activity }) {
  const data = useMemo(() => {
    const map = Object.fromEntries(activity.map(a => [a.date, a.xp_earned]))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return { day: DAY_LABELS[d.getDay()], xp: map[key] || 0, isToday: i === 6 }
    })
  }, [activity])

  const maxXp = Math.max(...data.map(d => d.xp), 10)

  return (
    <motion.div variants={itemVariants} className="rounded-3xl p-5 overflow-hidden min-w-0"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,125,78,0.2)' }}>
          <TrendingUp size={16} className="text-emerald-400" />
        </div>
        <h3 className="font-semibold text-white/80">XP cette semaine</h3>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, maxXp * 1.3]} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }}
            contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, background: 'rgba(10,20,35,0.92)', color: 'white', backdropFilter: 'blur(12px)' }}
            formatter={(v) => [`${v} XP`, '']}
          />
          <Bar dataKey="xp" radius={[6, 6, 0, 0]} maxBarSize={32}>
            {data.map((entry, i) => (
              <Cell key={i} fill={
                entry.isToday ? '#1B7D4E'
                : entry.xp > 0 ? 'rgba(52,211,153,0.6)'
                : 'rgba(255,255,255,0.07)'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ─── Calendrier d'activité ────────────────────────────────────────────────────
function ActivityCalendar({ activity }) {
  const cells = useMemo(() => {
    const map = Object.fromEntries(activity.map(a => [a.date, a.xp_earned]))
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i))
      const key = d.toISOString().slice(0, 10)
      const xp = map[key] || 0
      return { key, xp, day: d.getDate(), isToday: i === 29 }
    })
  }, [activity])

  function cellClass(xp, isToday) {
    if (isToday && xp === 0) return 'ring-2 ring-white/30' + ' ' + 'bg-white/10'
    if (xp === 0)  return 'bg-white/[0.07]'
    if (xp < 20)  return 'bg-kurdish-green/25'
    if (xp < 60)  return 'bg-kurdish-green/55'
    return 'bg-kurdish-green'
  }

  return (
    <motion.div variants={itemVariants} className="rounded-3xl p-5"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,125,78,0.2)' }}>
          <Calendar size={16} className="text-emerald-400" />
        </div>
        <h3 className="font-semibold text-white/80">Activité (30 jours)</h3>
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {cells.map(cell => (
          <div
            key={cell.key}
            title={`${cell.key}: ${cell.xp} XP`}
            className={`aspect-square rounded-md transition-all hover:scale-110 ${cellClass(cell.xp, cell.isToday)}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-white/35">Moins</span>
        {['bg-white/8', 'bg-kurdish-green/25', 'bg-kurdish-green/55', 'bg-kurdish-green'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-white/35">Plus</span>
      </div>
    </motion.div>
  )
}

// ─── Leçons récentes ─────────────────────────────────────────────────────────
function RecentLessons({ lessonProgress }) {
  const recent = useMemo(() =>
    LESSONS.filter(l => lessonProgress[l.id]).slice(0, 3),
    [lessonProgress]
  )
  if (recent.length === 0) return null

  return (
    <motion.div variants={itemVariants} className="rounded-3xl p-5"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(27,125,78,0.2)' }}>
            <BookOpen size={16} className="text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white/80">Leçons récentes</h3>
        </div>
        <Link to="/lessons" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
          Voir tout →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {recent.map(lesson => {
          const progress = lessonProgress[lesson.id]
          const pct = progress?.score || 0
          return (
            <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-2xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-2xl">{lesson.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{lesson.title_fr}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <div className="h-full bg-kurdish-green rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-white/45 shrink-0">{pct}%</span>
                </div>
              </div>
              {progress?.completed && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile } = useAuth()
  const [activity,       setActivity]       = useState([])
  const [dueCount,       setDueCount]       = useState(0)
  const [lessonProgress, setLessonProgress] = useState({})
  const [loading,        setLoading]        = useState(true)
  const [waveActive,     setWaveActive]     = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecentActivity(user.id, 30),
      getDueFlashcards(user.id),
      getLessonProgress(user.id),
    ]).then(([act, due, lp]) => {
      setActivity(act)
      setDueCount(due.length)
      setLessonProgress(lp)
      setLoading(false)
    })
    // Lancer l'animation wave au chargement
    setTimeout(() => setWaveActive(true), 400)
  }, [user])

  const hour = new Date().getHours()
  const greeting   = hour < 12 ? 'Beyanîbaş' : hour < 18 ? 'Êvarbaş' : 'Şevbaş'
  const greetingFr = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const motivation = useMemo(() => {
    return MOTIVATIONS[(new Date().getDate() + (profile?.current_streak || 0)) % MOTIVATIONS.length]
  }, [profile?.current_streak])

  return (
    <div className="relative min-h-full">
      {/* Bannière pleine largeur */}
      <DashboardBanner />

    <motion.div
      className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Greeting ── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2">
          <motion.span
            className="text-3xl cursor-pointer select-none"
            animate={waveActive ? { rotate: [0, 14, -8, 14, -4, 0] } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            onClick={() => setWaveActive(v => !v)}
          >👋</motion.span>
          <div>
            <h1 className="text-3xl font-bold"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {greeting}, {profile?.display_name || 'Heval'} !
            </h1>
            <p className="text-white/45 text-sm mt-0.5">
              {greetingFr} — continuons l'apprentissage du kurmandji
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Mot du jour ── */}
      <WordOfDay userId={user?.id} />

      {/* ── Défi Quotidien ── */}
      <DailyChallengeCard userId={user?.id} />

      {/* ── Stats (avec compteurs animés) ── */}
      <AnimatedStatCards profile={profile} dueCount={dueCount} />

      {/* ── Barre de niveau ── */}
      {!loading && <LevelBar xp={profile?.xp || 0} />}

      {/* ── Quick actions ── */}
      <motion.div variants={itemVariants}>
        <h2 className="font-semibold text-white/50 mb-3 text-sm uppercase tracking-wide">Continuer l'apprentissage</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.path}
              to={action.path}
              className={`bg-gradient-to-br ${action.gradient} ${action.glow} text-white rounded-3xl p-4 flex items-center gap-3 hover:opacity-92 active:scale-[0.97] transition-all shadow-md`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <action.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">{action.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{action.sublabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Charts ── */}
      {!loading && activity.length > 0 && (
        <>
          <XPChart activity={activity} />
          <ActivityCalendar activity={activity} />
        </>
      )}

      {/* ── Leçons récentes ── */}
      {!loading && <RecentLessons lessonProgress={lessonProgress} />}

      {/* ── Badges ── */}
      {!loading && (
        <motion.div variants={itemVariants} className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,148,10,0.2)' }}>
              <Trophy size={16} className="text-amber-400" />
            </div>
            <h3 className="font-semibold text-white/80">Badges</h3>
          </div>
          <BadgeGrid profile={profile} lessonProgress={lessonProgress} />
        </motion.div>
      )}

      {/* ── Message motivant du jour ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{ background: 'rgba(27,125,78,0.10)', border: '1px solid rgba(27,125,78,0.25)' }}
      >
        <span className="text-2xl select-none">🌄</span>
        <div>
          <p className="font-display font-semibold text-emerald-400 text-sm italic">
            &ldquo;{motivation.kd}&rdquo;
          </p>
          <p className="text-xs text-white/40 mt-0.5">{motivation.fr}</p>
        </div>
      </motion.div>

      {/* ── Banner bienvenue ── */}
      {(!profile?.xp || profile.xp === 0) && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 text-white shadow-lg overflow-hidden relative kurdish-pattern"
          style={{ background: 'linear-gradient(135deg, #1B7D4E 0%, #0A4A2A 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} />
            <h3 className="font-bold text-xl">Xêr hatî — Bienvenue !</h3>
          </div>
          <p className="text-white/75 text-sm mb-4">
            Commence par l'alphabet kurmandji pour te familiariser avec les lettres spéciales,
            puis explore ta première leçon.
          </p>
          <Link
            to="/alphabet"
            className="inline-flex items-center gap-1.5 bg-white text-kurdish-green font-semibold px-5 py-2.5 rounded-2xl text-sm hover:bg-white/90 transition-colors shadow-md"
          >
            Commencer par l'alphabet →
          </Link>
        </motion.div>
      )}
    </motion.div>
    </div>
  )
}
