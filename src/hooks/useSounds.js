import { useCallback } from 'react'
import { playSuccess, playError, playStreak, playCompletion } from '../lib/sounds'

/**
 * Hook useSounds
 *
 * Expose les quatre effets sonores de feedback.
 * Le AudioContext est initialisé de façon paresseuse au premier appel
 * (doit survenir après un geste utilisateur — pas de problème puisque
 * les sons se déclenchent toujours sur un clic ou une interaction).
 *
 * Usage :
 *   const { success, error, streak, completion } = useSounds()
 *   success()       // bonne réponse
 *   error()         // mauvaise réponse
 *   streak(n)       // série de n bonnes réponses
 *   completion()    // quiz / leçon terminé(e)
 */
export function useSounds() {
  const success    = useCallback(() => { try { playSuccess()     } catch {} }, [])
  const error      = useCallback(() => { try { playError()       } catch {} }, [])
  const streak     = useCallback((n) => { try { playStreak(n)    } catch {} }, [])
  const completion = useCallback(() => { try { playCompletion()  } catch {} }, [])

  return { success, error, streak, completion }
}
