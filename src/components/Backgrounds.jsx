// ─── Blobs fixes globaux (z-index 0, position: fixed) ────────────────────────
// À placer une seule fois dans Layout, ils s'affichent sur toutes les pages
export function GlobalBlobs() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Vert émeraude — haut gauche */}
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: '#10B981', opacity: 0.15, filter: 'blur(120px)',
      }} />
      {/* Doré — haut droite */}
      <div style={{
        position: 'absolute', top: -150, right: -150,
        width: 500, height: 500, borderRadius: '50%',
        background: '#F59E0B', opacity: 0.12, filter: 'blur(100px)',
      }} />
      {/* Bleu ciel — bas centre */}
      <div style={{
        position: 'absolute', bottom: -250, left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: '#0EA5E9', opacity: 0.10, filter: 'blur(130px)',
      }} />
    </div>
  )
}

// ─── Bannière dashboard : dégradé vert + montagnes blanches (200px) ───────────
export function DashboardBanner() {
  return (
    <div
      className="w-full relative overflow-hidden flex-shrink-0"
      style={{
        height: 200,
        background: 'linear-gradient(100deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
        borderRadius: '0 0 24px 24px',
      }}
      aria-hidden="true"
    >
      {/* Overlay latéral pour la profondeur */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 45%, rgba(0,0,0,0.06) 100%)',
        }}
      />

      {/* Montagnes en silhouette blanche */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        {/* Couche lointaine */}
        <path
          d="M0,200 L0,100 L100,65 L180,90 L260,48 L340,85 L420,58 L500,85 L580,52 L660,82 L740,55 L820,82 L900,54 L980,80 L1060,56 L1140,80 L1220,62 L1300,80 L1380,66 L1440,75 L1440,200 Z"
          fill="white"
          fillOpacity="0.07"
        />
        {/* Couche intermédiaire */}
        <path
          d="M0,200 L0,128 L75,96 L148,120 L215,82 L288,112 L358,88 L432,116 L508,90 L582,118 L658,92 L732,118 L808,90 L882,116 L958,93 L1032,115 L1108,95 L1184,115 L1260,98 L1336,115 L1440,102 L1440,200 Z"
          fill="white"
          fillOpacity="0.13"
        />
        {/* Couche proche */}
        <path
          d="M0,200 L0,155 L60,128 L118,148 L180,118 L242,142 L304,122 L370,150 L435,128 L500,152 L565,130 L630,152 L696,132 L762,154 L828,134 L895,155 L962,136 L1030,155 L1098,138 L1168,156 L1238,140 L1310,157 L1440,145 L1440,200 Z"
          fill="white"
          fillOpacity="0.20"
        />
      </svg>

      {/* Soleil discret en haut à droite */}
      <div
        className="absolute"
        style={{
          top: 20, right: 60,
          width: 60, height: 60, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,100,0.55) 0%, rgba(255,180,50,0.15) 50%, transparent 70%)',
        }}
      />
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
        width: 480, height: 480, borderRadius: '50%',
        background: '#10B981', opacity: 0.20, filter: 'blur(90px)',
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
        background: '#6366F1', opacity: 0.10, filter: 'blur(100px)',
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
        background: '#0D9488', opacity: 0.10, filter: 'blur(90px)',
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
        background: '#F97316', opacity: 0.10, filter: 'blur(90px)',
      }}
    />
  )
}

// ─── Footer décoratif montagnes (bas de page Leçons) ─────────────────────────
export function MountainFooter({ color = '#D4EDE0' }) {
  return (
    <div className="relative w-full overflow-hidden pointer-events-none mt-8" style={{ height: 64 }} aria-hidden="true">
      <svg viewBox="0 0 800 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path
          d="M0,64 L0,50 L90,28 L160,44 L240,16 L320,40 L400,22 L480,44 L560,18 L640,42 L720,28 L800,40 L800,64 Z"
          fill={color} opacity="0.6"
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
                stroke="#1B7D4E" strokeWidth="0.7" fill="none" strokeOpacity="0.22"
              />
              <circle cx={x + 7} cy={10} r="1" fill="#1B7D4E" fillOpacity="0.12" />
            </g>
          )
        })}
        <line x1="0" y1="1"  x2="800" y2="1"  stroke="#1B7D4E" strokeWidth="0.5" strokeOpacity="0.12" />
        <line x1="0" y1="19" x2="800" y2="19" stroke="#1B7D4E" strokeWidth="0.5" strokeOpacity="0.12" />
      </svg>
    </div>
  )
}

// ─── Stubs de compatibilité (anciens noms gardés pour ne pas casser les imports) ─
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
