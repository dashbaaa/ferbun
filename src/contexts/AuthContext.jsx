import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { syncHearts, dbLoseHeart, dbGainHeart } from '../lib/db'

const AuthContext = createContext({})

const HEART_REGEN_MS = 30 * 60 * 1000
const MAX_HEARTS     = 5

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null)
  const [profile,      setProfile]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [hearts,       setHearts]       = useState(MAX_HEARTS)
  const [nextHeartAt,  setNextHeartAt]  = useState(null)

  // Ref pour accéder aux valeurs courantes dans les callbacks sans re-créer les fonctions
  const heartsRef      = useRef(MAX_HEARTS)
  const userRef        = useRef(null)
  const regenTimerRef  = useRef(null)

  heartsRef.current = hearts
  userRef.current   = user

  // ─── Planifie le prochain tick de régénération ──────────────────────────────
  const scheduleRegen = useCallback((nextAt) => {
    if (regenTimerRef.current) clearTimeout(regenTimerRef.current)
    if (!nextAt) return
    const delay = Math.max(0, nextAt - Date.now())
    regenTimerRef.current = setTimeout(async () => {
      if (!userRef.current) return
      const cur = heartsRef.current
      if (cur >= MAX_HEARTS) return
      const newH = Math.min(MAX_HEARTS, cur + 1)
      setHearts(newH)
      heartsRef.current = newH
      const now = new Date()
      try {
        await supabase
          .from('profiles')
          .update({ hearts: newH, hearts_last_update: now.toISOString() })
          .eq('id', userRef.current.id)
      } catch {}
      if (newH < MAX_HEARTS) {
        const next = new Date(now.getTime() + HEART_REGEN_MS)
        setNextHeartAt(next)
        scheduleRegen(next)
      } else {
        setNextHeartAt(null)
      }
    }, delay)
  }, [])

  // ─── Auth state ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      userRef.current = currentUser

      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setProfile(null)
        setHearts(MAX_HEARTS)
        setNextHeartAt(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (regenTimerRef.current) clearTimeout(regenTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Synchro des cœurs quand le profil change ───────────────────────────────
  useEffect(() => {
    if (!profile || !user) return
    syncHearts(user.id, profile.hearts, profile.hearts_last_update).then(({ hearts: h, nextHeartAt: next }) => {
      setHearts(h)
      heartsRef.current = h
      setNextHeartAt(next)
      scheduleRegen(next)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  // ─── Fetch du profil ────────────────────────────────────────────────────────
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
  }

  // ─── Authentification ───────────────────────────────────────────────────────
  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').insert({
        id:           data.user.id,
        display_name: displayName,
        username:     email.split('@')[0],
        hearts:       MAX_HEARTS,
        hearts_last_update: new Date().toISOString(),
      })
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function updateProfile(updates) {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  // ─── Gestion des cœurs ──────────────────────────────────────────────────────

  /** Perd 1 cœur (mauvaise réponse). */
  async function loseHeart() {
    if (!user) return
    const cur = heartsRef.current
    const newH = await dbLoseHeart(user.id, cur)
    setHearts(newH)
    heartsRef.current = newH

    if (newH < MAX_HEARTS) {
      const next = new Date(Date.now() + HEART_REGEN_MS)
      setNextHeartAt(next)
      scheduleRegen(next)
    }
  }

  /** Gagne 1 cœur (session de révision réussie). */
  async function gainHeart() {
    if (!user) return
    const cur = heartsRef.current
    if (cur >= MAX_HEARTS) return
    const newH = await dbGainHeart(user.id, cur)
    setHearts(newH)
    heartsRef.current = newH

    if (newH >= MAX_HEARTS) {
      setNextHeartAt(null)
      if (regenTimerRef.current) clearTimeout(regenTimerRef.current)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      hearts,
      nextHeartAt,
      signUp,
      signIn,
      signOut,
      updateProfile,
      loseHeart,
      gainHeart,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
