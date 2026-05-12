import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Alphabet from './pages/Alphabet'
import Lessons from './pages/Lessons'
import Flashcards from './pages/Flashcards'
import Phrases from './pages/Phrases'
import DailyChallenge from './pages/DailyChallenge'
import { getRandomCitation } from './data/citations'

// ─── Modal Citations ───────────────────────────────────────────────────────────
function CitationModal({ onClose }) {
  const citation = useState(() => getRandomCitation())[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(10,30,20,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="bg-white dark:bg-kurdish-dark-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Bandeau dégradé */}
        <div className="bg-gradient-to-br from-kurdish-green-dark via-kurdish-green to-teal-500 px-6 pt-8 pb-10 text-white text-center">
          <div className="text-3xl mb-4">📖</div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">
            Gotinên Zimanê Dayikê
          </p>
          {/* Citation en kurmandji */}
          <blockquote className="text-xl font-display font-semibold leading-snug mb-2">
            &ldquo;{citation.kd}&rdquo;
          </blockquote>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 text-center">
          {/* Traduction */}
          <p className="text-gray-600 dark:text-gray-300 text-base italic mb-2">
            &ldquo;{citation.fr}&rdquo;
          </p>
          {/* Source */}
          {citation.source && (
            <p className="text-xs text-gray-400 mb-5">— {citation.source}</p>
          )}

          {/* Bouton principal */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full btn-primary mb-3"
          >
            Destpêke — Commencer
          </motion.button>

          {/* Option désactiver */}
          <button
            onClick={() => {
              localStorage.setItem('ferbun_citations_enabled', 'false')
              onClose()
            }}
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Ne plus afficher les citations
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Protection des routes + citation post-login ──────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [showCitation, setShowCitation] = useState(false)

  useEffect(() => {
    if (!user) return
    // Afficher la citation une fois par session, sauf si désactivée
    const enabled    = localStorage.getItem('ferbun_citations_enabled') !== 'false'
    const shownThisSession = sessionStorage.getItem('ferbun_citation_shown') === '1'
    if (enabled && !shownThisSession) {
      sessionStorage.setItem('ferbun_citation_shown', '1')
      setShowCitation(true)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-kurdish-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kurdish-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return (
    <>
      <Layout>{children}</Layout>
      <AnimatePresence>
        {showCitation && (
          <CitationModal onClose={() => setShowCitation(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Placeholder modules à venir ─────────────────────────────────────────────
function ComingSoon({ title }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500">Ce module est en cours de développement</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
      } />
      <Route path="/auth" element={
        user ? <Navigate to="/dashboard" replace /> : <Auth />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/alphabet" element={
        <ProtectedRoute><Alphabet /></ProtectedRoute>
      } />
      <Route path="/lessons" element={
        <ProtectedRoute><Lessons /></ProtectedRoute>
      } />
      <Route path="/flashcards" element={
        <ProtectedRoute><Flashcards /></ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute><ComingSoon title="Tuteur IA — Mamostê" /></ProtectedRoute>
      } />
      <Route path="/phrases" element={
        <ProtectedRoute><Phrases /></ProtectedRoute>
      } />
      <Route path="/daily-challenge" element={
        <ProtectedRoute><DailyChallenge /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
