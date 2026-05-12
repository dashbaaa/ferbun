/**
 * sounds.js — Moteur audio Web Audio API pour Fêrbun
 *
 * Tous les sons sont synthétisés avec des oscillateurs + enveloppes ADSR.
 * Aucun fichier audio externe. Style Duolingo : courts, satisfaisants, motivants.
 *
 * API publique :
 *   playSuccess()    bonne réponse (simple)
 *   playError()      mauvaise réponse (doux, pas agressif)
 *   playStreak(n)    série de bonnes réponses (n = longueur de la série)
 *   playCompletion() fin de quiz / leçon complète
 */

let _ctx     = null
let _unlocked = false

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// iOS Safari blocks AudioContext until a user gesture.
// Playing a 1-sample silent buffer inside touchstart forces the context into
// 'running' state synchronously — .resume() alone is async and too slow.
function _unlockAudio() {
  if (_unlocked) return
  _unlocked = true
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)() } catch { return }
  }
  try {
    const buf = _ctx.createBuffer(1, 1, 22050)
    const src = _ctx.createBufferSource()
    src.buffer = buf
    src.connect(_ctx.destination)
    src.start(0)
  } catch { /* ignore */ }
  _ctx.resume().catch(() => {})
}
if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', _unlockAudio, { passive: true })
  document.addEventListener('click',      _unlockAudio)
}

/**
 * Joue une note avec enveloppe ADSR simplifiée.
 *
 * @param {number}  freq       Fréquence en Hz
 * @param {number}  t0         Temps de départ (ctx.currentTime + offset)
 * @param {number}  dur        Durée totale en secondes
 * @param {string}  type       Type d'oscillateur : 'sine' | 'triangle' | 'square'
 * @param {number}  peak       Volume crête (0–1)
 * @param {number}  freqEnd    Si défini, glissement de fréquence vers cette valeur
 */
function note(freq, t0, dur, type = 'sine', peak = 0.28, freqEnd = null) {
  const c    = ctx()
  const osc  = c.createOscillator()
  const gain = c.createGain()

  osc.connect(gain)
  gain.connect(c.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd !== null) {
    osc.frequency.linearRampToValueAtTime(freqEnd, t0 + dur)
  }

  const atk = 0.006
  const rel = Math.min(0.07, dur * 0.35)

  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + atk)
  gain.gain.setValueAtTime(peak, t0 + dur - rel)
  gain.gain.linearRampToValueAtTime(0, t0 + dur)

  osc.start(t0)
  osc.stop(t0 + dur + 0.01)
}

// ─── Succès — bonne réponse ───────────────────────────────────────────────────
// Deux notes ascendantes vives : E5 → G#5 (tierce majeure vers quinte)
// Courtes et punchy, style "ding-ding"
export function playSuccess() {
  const c   = ctx()
  const now = c.currentTime
  note(659.25, now,       0.11, 'sine', 0.26)   // E5
  note(830.61, now + 0.09, 0.18, 'sine', 0.22)  // G#5
}

// ─── Erreur — mauvaise réponse ────────────────────────────────────────────────
// Descente douce triangle : E4 → A3 — une sorte de "womp" bienveillant
// Triangle wave = plus rond/doux que sine, beaucoup moins agressif que sawtooth
export function playError() {
  const c   = ctx()
  const now = c.currentTime
  note(330, now, 0.32, 'triangle', 0.16, 210)
}

// ─── Streak — série de bonnes réponses ────────────────────────────────────────
// 3 notes rapides ascendantes avec une couleur qui s'intensifie selon n
//   n = 3  → C5 G5 C6   (léger)
//   n = 5+ → C5 E5 G5 C6 + harmonie (plus festif)
export function playStreak(n = 3) {
  const c   = ctx()
  const now = c.currentTime

  if (n >= 5) {
    // Petit arpège C majeur avec harmonie
    note(523.25,  now,         0.08, 'sine', 0.22)  // C5
    note(659.25,  now + 0.06,  0.08, 'sine', 0.20)  // E5
    note(783.99,  now + 0.12,  0.08, 'sine', 0.20)  // G5
    note(1046.50, now + 0.18,  0.18, 'sine', 0.24)  // C6
    // Harmonie tierce (E6) en arrière-plan
    note(1318.51, now + 0.18,  0.18, 'sine', 0.08)  // E6
  } else {
    // Trio C5 → G5 → C6
    note(523.25,  now,         0.07, 'sine', 0.20)  // C5
    note(783.99,  now + 0.065, 0.07, 'sine', 0.20)  // G5
    note(1046.50, now + 0.13,  0.13, 'sine', 0.22)  // C6
  }
}

// ─── Complétion — fin de quiz / leçon ────────────────────────────────────────
// Fanfare ascendante C5 → E5 → G5 → C6, suivie d'un accord final satisfaisant.
// Mélodie + harmonie doublée une octave en dessous pour de la profondeur.
export function playCompletion() {
  const c   = ctx()
  const now = c.currentTime

  // Mélodie principale
  note(523.25,  now,        0.13, 'sine', 0.22)  // C5
  note(659.25,  now + 0.11, 0.13, 'sine', 0.22)  // E5
  note(783.99,  now + 0.22, 0.13, 'sine', 0.22)  // G5
  note(1046.50, now + 0.35, 0.42, 'sine', 0.24)  // C6 (tenu)

  // Contrechant une octave en dessous (plus doux)
  note(261.63,  now,        0.13, 'triangle', 0.10) // C4
  note(329.63,  now + 0.11, 0.13, 'triangle', 0.10) // E4
  note(391.99,  now + 0.22, 0.13, 'triangle', 0.10) // G4
  note(523.25,  now + 0.35, 0.42, 'triangle', 0.12) // C5 (tenu)

  // Petit éclat brillant sur le dernier accord : G6 très doux
  note(1567.98, now + 0.35, 0.3, 'sine', 0.05)    // G6 (tierce supérieure)
}
