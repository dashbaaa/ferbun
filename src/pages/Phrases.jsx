import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, ChevronLeft, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PHRASE_CATEGORIES } from '../data/phrases'
import { getFavorites, toggleFavorite } from '../lib/db'
import { KurdishMarketBg, KilimBand } from '../components/Backgrounds'

// ─── Phrase Item ───────────────────────────────────────────────────────────────

function PhraseItem({ phrase, isFav, onToggleFav }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-gray-900 leading-snug">{phrase.kd}</p>
        <p className="text-xs font-mono text-kurdish-green mt-0.5">/{phrase.phonetic}/</p>
        <p className="text-sm text-gray-500 mt-1">{phrase.fr}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onToggleFav(phrase.id)}
        className="shrink-0 mt-0.5 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart
          size={18}
          className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-400 transition-colors'}
        />
      </motion.button>
    </motion.div>
  )
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({ category, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left w-full transition-all duration-200 ${category.color} ${category.border}`}
    >
      <div className="text-4xl mb-3">{category.icon}</div>
      <p className={`font-display font-bold text-base ${category.text}`}>{category.title_kd}</p>
      <p className="text-sm text-gray-500 mt-0.5">{category.title_fr}</p>
      <p className="text-xs text-gray-400 mt-2">{category.phrases.length} phrases</p>
    </motion.button>
  )
}

// ─── Category View ─────────────────────────────────────────────────────────────

function CategoryView({ category, favorites, onToggleFav, onBack }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return category.phrases
    const q = search.toLowerCase()
    return category.phrases.filter(p =>
      p.kd.toLowerCase().includes(q) ||
      p.fr.toLowerCase().includes(q) ||
      p.phonetic.toLowerCase().includes(q)
    )
  }, [category.phrases, search])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">{category.title_kd}</h2>
            <p className="text-xs text-slate-500">{category.title_fr}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Phrases */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>Aucune phrase trouvée.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(phrase => (
            <PhraseItem
              key={phrase.id}
              phrase={phrase}
              isFav={favorites.has(phrase.id)}
              onToggleFav={onToggleFav}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Favorites View ────────────────────────────────────────────────────────────

function FavoritesView({ favorites, onToggleFav }) {
  const [search, setSearch] = useState('')

  const allPhrases = useMemo(() =>
    PHRASE_CATEGORIES.flatMap(c => c.phrases), [])

  const favPhrases = useMemo(() =>
    allPhrases.filter(p => favorites.has(p.id)), [allPhrases, favorites])

  const filtered = useMemo(() => {
    if (!search.trim()) return favPhrases
    const q = search.toLowerCase()
    return favPhrases.filter(p =>
      p.kd.toLowerCase().includes(q) ||
      p.fr.toLowerCase().includes(q) ||
      p.phonetic.toLowerCase().includes(q)
    )
  }, [favPhrases, search])

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans les favoris..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {favorites.size === 0 ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
          <Heart size={40} className="opacity-30" />
          <div>
            <p className="font-medium text-slate-600">Aucun favori</p>
            <p className="text-sm mt-1">Appuyez sur ♡ dans une phrase pour la sauvegarder ici.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>Aucune phrase trouvée.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {filtered.map(phrase => (
              <PhraseItem
                key={phrase.id}
                phrase={phrase}
                isFav={true}
                onToggleFav={onToggleFav}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ─── Main Phrases Page ─────────────────────────────────────────────────────────

export default function Phrases() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState(null) // category object or null
  const [tab, setTab] = useState('categories') // 'categories' | 'favorites'
  const [globalSearch, setGlobalSearch] = useState('')

  // Load favorites from Supabase
  useEffect(() => {
    if (!user) return
    getFavorites(user.id).then(setFavorites)
  }, [user])

  const handleToggleFav = useCallback(async (phraseId) => {
    if (!user) return
    const isFav = favorites.has(phraseId)
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(phraseId)
      else next.add(phraseId)
      return next
    })
    await toggleFavorite(user.id, phraseId, isFav)
  }, [user, favorites])

  // Global search across all categories
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null
    const q = globalSearch.toLowerCase()
    return PHRASE_CATEGORIES.flatMap(c =>
      c.phrases
        .filter(p =>
          p.kd.toLowerCase().includes(q) ||
          p.fr.toLowerCase().includes(q) ||
          p.phonetic.toLowerCase().includes(q)
        )
        .map(p => ({ ...p, _category: c }))
    )
  }, [globalSearch])

  // If a category is selected (and not doing global search), show its detail view
  if (activeCategory && !globalSearch) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <CategoryView
          category={activeCategory}
          favorites={favorites}
          onToggleFav={handleToggleFav}
          onBack={() => setActiveCategory(null)}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-full">
      <KurdishMarketBg />
      <KilimBand />
    <div className="relative z-10 max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Hevok — Phrases</h1>
        <p className="text-white/50 text-sm mt-1">
          {PHRASE_CATEGORIES.reduce((s, c) => s + c.phrases.length, 0)} phrases essentielles
        </p>
      </div>

      {/* Global search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Rechercher dans toutes les catégories..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kurdish-green/40 text-slate-800 text-sm"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Global search results */}
      {searchResults !== null ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">{searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}</p>
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune phrase trouvée.</div>
          ) : (
            searchResults.map(phrase => (
              <PhraseItem
                key={phrase.id}
                phrase={phrase}
                isFav={favorites.has(phrase.id)}
                onToggleFav={handleToggleFav}
              />
            ))
          )}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setTab('categories')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === 'categories'
                  ? 'bg-kurdish-green text-white shadow-md'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              Catégories
            </button>
            <button
              onClick={() => setTab('favorites')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'favorites'
                  ? 'bg-kurdish-green text-white shadow-md'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              <Heart size={14} className={favorites.size > 0 ? 'fill-red-500 text-red-500' : ''} />
              Favoris
              {favorites.size > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-1.5 rounded-full">
                  {favorites.size}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === 'categories' ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {PHRASE_CATEGORIES.map(cat => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <FavoritesView
                  favorites={favorites}
                  onToggleFav={handleToggleFav}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
    <KilimBand flip />
    </div>
  )
}
