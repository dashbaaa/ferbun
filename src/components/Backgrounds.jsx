// ─── Blobs fixes globaux ───────────────────────────────────────────────────────
export function GlobalBlobs() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Vert émeraude — haut gauche */}
      <div style={{
        position: 'absolute', top: -200, left: -150,
        width: 700, height: 700, borderRadius: '50%',
        background: '#10B981', opacity: 0.20, filter: 'blur(130px)',
      }} />
      {/* Doré — haut droite */}
      <div style={{
        position: 'absolute', top: -120, right: -200,
        width: 620, height: 620, borderRadius: '50%',
        background: '#F59E0B', opacity: 0.16, filter: 'blur(120px)',
      }} />
      {/* Violet — bas centre */}
      <div style={{
        position: 'absolute', bottom: -300, left: '50%',
        transform: 'translateX(-50%)',
        width: 900, height: 700, borderRadius: '50%',
        background: '#6366F1', opacity: 0.13, filter: 'blur(150px)',
      }} />
      {/* Cyan — milieu droite */}
      <div style={{
        position: 'absolute', top: '35%', right: -120,
        width: 450, height: 450, borderRadius: '50%',
        background: '#0EA5E9', opacity: 0.11, filter: 'blur(110px)',
      }} />
    </div>
  )
}

// ─── Bannière dashboard sombre avec montagnes ─────────────────────────────────
export function DashboardBanner() {
  return (
    <div
      className="w-full relative overflow-hidden flex-shrink-0"
      style={{
        height: 180,
        background: 'linear-gradient(135deg, #060D1A 0%, #0A1F15 45%, #0B2014 100%)',
        borderRadius: '0 0 28px 28px',
      }}
      aria-hidden="true"
    >
      {/* Glow vert */}
      <div style={{
        position: 'absolute', top: -80, left: '15%',
        width: 400, height: 280,
        background: 'radial-gradient(ellipse, rgba(27,125,78,0.40) 0%, transparent 70%)',
      }} />
      {/* Glow gold */}
      <div style={{
        position: 'absolute', top: -60, right: '10%',
        width: 280, height: 200,
        background: 'radial-gradient(ellipse, rgba(212,148,10,0.25) 0%, transparent 70%)',
      }} />

      {/* Grille futuriste */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Montagnes silhouette */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path
          d="M0,180 L0,110 L100,75 L180,100 L260,58 L340,95 L420,68 L500,95 L580,62 L660,92 L740,65 L820,92 L900,64 L980,90 L1060,66 L1140,90 L1220,72 L1300,90 L1380,76 L1440,85 L1440,180 Z"
          fill="rgba(255,255,255,0.03)"
        />
        <path
          d="M0,180 L0,138 L75,106 L148,130 L215,92 L288,122 L358,98 L432,126 L508,100 L582,128 L658,102 L732,128 L808,100 L882,126 L958,103 L1032,125 L1108,105 L1184,125 L1260,108 L1336,125 L1440,112 L1440,180 Z"
          fill="rgba(255,255,255,0.05)"
        />
        <path
          d="M0,180 L0,155 L60,135 L118,152 L180,122 L242,148 L304,128 L370,156 L435,136 L500,158 L565,138 L630,158 L696,140 L762,160 L828,142 L895,161 L962,144 L1030,161 L1098,146 L1168,162 L1238,148 L1310,163 L1440,154 L1440,180 Z"
          fill="rgba(27,125,78,0.14)"
        />
      </svg>

      {/* Ligne de glow verte en bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(27,125,78,0.5), rgba(212,148,10,0.3), transparent)',
      }} />
    </div>
  )
}

// ─── Blob page Leçons ─────────────────────────────────────────────────────────
export function LessonsBlob() {
  return (
    <div
      className="absolute pointer-events-none"
      aria-hidden="true"
      style={{
        top: -80, right: -80,
        width: 500, height: 500, borderRadius: '50%',
        background: '#10B981', opacity: 0.15, filter: 'blur(100px)',
      }}
    />
  )
}

// ─── Blob page Flashcards ─────────────────────────────────────────────────────
export function FlashcardsBlob() {
  return (
    <div
      className="absolute pointer-events-none"
      aria-hidden="true"
      style={{
        top: -100, left: '50%',
        transform: 'translateX(-50%)',
        width: 560, height: 400, borderRadius: '50%',
        background: '#6366F1', opacity: 0.15, filter: 'blur(110px)',
      }}
    />
  )
}

// ─── Blob page Alphabet ───────────────────────────────────────────────────────
export function AlphabetBlob() {
  return (
    <div
      className="absolute pointer-events-none"
      aria-hidden="true"
      style={{
        top: -60, left: -60,
        width: 500, height: 500, borderRadius: '50%',
        background: '#0D9488', opacity: 0.15, filter: 'blur(100px)',
      }}
    />
  )
}

// ─── Blob page Phrases ────────────────────────────────────────────────────────
export function PhrasesBlob() {
  return (
    <div
      className="absolute pointer-events-none"
      aria-hidden="true"
      style={{
        top: -80, right: -80,
        width: 460, height: 460, borderRadius: '50%',
        background: '#F97316', opacity: 0.13, filter: 'blur(100px)',
      }}
    />
  )
}

// ─── Footer décoratif montagnes ───────────────────────────────────────────────
export function MountainFooter({ color = 'rgba(27,125,78,0.15)' }) {
  return (
    <div className="relative w-full overflow-hidden pointer-events-none mt-8" style={{ height: 64 }} aria-hidden="true">
      <svg viewBox="0 0 800 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path
          d="M0,64 L0,50 L90,28 L160,44 L240,16 L320,40 L400,22 L480,44 L560,18 L640,42 L720,28 L800,40 L800,64 Z"
          fill={color} opacity="0.7"
        />
        <path
          d="M0,64 L0,56 L60,46 L130,56 L200,38 L270,52 L350,40 L430,56 L510,40 L590,54 L670,42 L740,54 L800,48 L800,64 Z"
          fill={color} opacity="0.4"
        />
      </svg>
    </div>
  )
}

// ─── Bordure décorative kurde pour Alphabet ───────────────────────────────────
export function KurdishBorderTop() {
  return (
    <div className="w-full overflow-hidden pointer-events-none mb-4" aria-hidden="true">
      <svg viewBox="0 0 800 20" preserveAspectRatio="none" className="w-full" style={{ height: 20 }}>
        {Array.from({ length: 22 }, (_, i) => {
          const x = i * 38 + 10
          return (
            <g key={i}>
              <path
                d={`M${x},10 L${x + 7},4 L${x + 14},10 L${x + 7},16 Z`}
                stroke="#1B7D4E" strokeWidth="0.7" fill="none" strokeOpacity="0.35"
              />
              <circle cx={x + 7} cy={10} r="1" fill="#1B7D4E" fillOpacity="0.20" />
            </g>
          )
        })}
        <line x1="0" y1="1"  x2="800" y2="1"  stroke="#1B7D4E" strokeWidth="0.5" strokeOpacity="0.20" />
        <line x1="0" y1="19" x2="800" y2="19" stroke="#1B7D4E" strokeWidth="0.5" strokeOpacity="0.20" />
      </svg>
    </div>
  )
}

// ─── Stubs de compatibilité ───────────────────────────────────────────────────
export function KurdishMountainBanner() { return <DashboardBanner /> }
export function NightSkyBanner()        { return <DashboardBanner /> }
export function DashboardBlobs()        { return null }
export function MountainBanner()        { return null }
export function KilimBand()             { return null }
export function SidebarKilim()          { return null }
export function FloatingShapes()        { return null }
export function DiamondPatternBg()      { return null }
export function KurdishValleyBg()       { return null }
export function ScriptoriumBg()         { return null }
export function StarryNightBg()         { return null }
export function KurdishMarketBg()       { return null }
