import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { KurdishLogoFull } from '../components/KurdishLogo'

// Pre-computed star positions (deterministic, no randomness on re-render)
const STARS = Array.from({ length: 55 }, (_, i) => {
  const seed = i * 9301 + 49297
  const rand = (n) => ((seed * n) % 1000) / 1000
  return {
    x: (rand(1) * 98 + 1).toFixed(2),
    y: (rand(2) * 58 + 1).toFixed(2),
    r: (0.5 + rand(3) * 1.4).toFixed(2),
    opacity: (0.3 + rand(4) * 0.7).toFixed(2),
    dur: (2 + rand(5) * 4).toFixed(1),
    delay: -(rand(6) * 6).toFixed(1),
  }
})

const QUOTES = [
  { kd: 'Zanîn ronahiya jiyanê ye.', fr: 'Le savoir est la lumière de la vie.' },
  { kd: 'Her roj pêşve here!', fr: 'Avance chaque jour !' },
  { kd: 'Kurmandji bi dilxweşî fêr bibe.', fr: 'Apprends le kurmandji avec joie.' },
  { kd: 'Zimanê xwe ji bîr neke.', fr: 'N\'oublie pas ta langue.' },
]
const quote = QUOTES[new Date().getDay() % QUOTES.length]

// Floating label input
function FloatingInput({ id, type = 'text', label, value, onChange, children, ...rest }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
        className="
          peer w-full px-4 pt-6 pb-2 rounded-xl
          bg-white/10 border border-white/25
          text-white text-sm
          placeholder-transparent
          focus:outline-none focus:border-white/60 focus:bg-white/15
          transition-all duration-200
        "
        {...rest}
      />
      <label
        htmlFor={id}
        className="
          absolute left-4 top-4 text-white/55 text-sm
          transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/55
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/90
          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-white/80
        "
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Auth() {
  const [mode,         setMode]         = useState('signin')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [displayName,  setDisplayName]  = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        if (displayName.trim().length < 2) throw new Error('Le prénom doit contenir au moins 2 caractères')
        await signUp(email, password, displayName)
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">

      {/* ── Sky gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D1F] via-[#0C2040] to-[#0D3B2F]" />

      {/* ── Stars ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: var(--op); }
            50% { opacity: calc(var(--op) * 0.15); }
          }
        `}</style>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="white"
            style={{
              '--op': s.opacity,
              animation: `twinkle ${s.dur}s ${s.delay}s infinite ease-in-out`,
              opacity: s.opacity,
            }}
          />
        ))}
      </svg>

      {/* ── Mountain layers (far → close) ── */}
      {/* Far — very dark teal */}
      <svg className="absolute bottom-0 w-full pointer-events-none" viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,420 L0,340 L100,260 L200,310 L320,210 L440,290 L560,240 L680,300 L800,220 L920,290 L1040,230 L1160,280 L1280,240 L1440,300 L1440,420 Z"
              fill="#091E38" />
      </svg>
      {/* Mid — dark navy-green */}
      <svg className="absolute bottom-0 w-full pointer-events-none" viewBox="0 0 1440 360" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,360 L0,310 L80,255 L180,290 L280,230 L380,270 L500,220 L620,265 L740,215 L860,270 L980,225 L1100,265 L1220,235 L1340,270 L1440,290 L1440,360 Z"
              fill="#071829" />
      </svg>
      {/* Near — very dark foreground */}
      <svg className="absolute bottom-0 w-full pointer-events-none" viewBox="0 0 1440 280" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,280 L0,250 L60,215 L140,240 L220,200 L300,235 L400,205 L500,238 L600,208 L700,240 L800,212 L900,244 L1000,215 L1100,245 L1200,218 L1300,246 L1440,255 L1440,280 Z"
              fill="#040F19" />
      </svg>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <KurdishLogoFull />
        </div>

        {/* Glassmorphism card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {/* Onglets */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-7 border border-white/10">
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-kurdish-green shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <FloatingInput
                id="displayName"
                label="Prénom / Navê we"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            )}

            <FloatingInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <FloatingInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            >
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </FloatingInput>

            {error && (
              <div className="bg-red-500/20 text-red-200 text-sm px-4 py-3 rounded-xl border border-red-400/30">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-kurdish-green/20 text-green-200 text-sm px-4 py-3 rounded-xl border border-kurdish-green/30">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kurdish-green hover:bg-kurdish-green-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-1 active:scale-[0.98] shadow-lg"
              style={{ boxShadow: '0 4px 20px rgba(27,125,78,0.4)' }}
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : mode === 'signin' ? 'Têketin — Se connecter' : 'Destpêkirin — Commencer'}
            </button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-white/45 text-sm mt-5">
              Pas de compte ?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-kurdish-green font-semibold hover:text-green-300 transition-colors"
              >
                Inscrivez-vous gratuitement
              </button>
            </p>
          )}
        </div>

        {/* Quote du jour */}
        <div className="text-center mt-6 px-4">
          <p className="text-white/40 text-xs italic">
            &ldquo;{quote.kd}&rdquo;
          </p>
          <p className="text-white/25 text-xs mt-0.5">{quote.fr}</p>
        </div>
      </div>
    </div>
  )
}
