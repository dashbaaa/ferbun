// Client pour les appels à l'API Anthropic via le backend
// Les appels directs à l'API Anthropic se font côté serveur pour protéger la clé API

export async function sendChatMessage(messages, userLevel = 'beginner') {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userLevel }),
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la communication avec le tuteur')
  }

  return response.json()
}

export async function generateExercise(topic, level) {
  const response = await fetch('/api/exercise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, level }),
  })

  if (!response.ok) {
    throw new Error('Erreur lors de la génération de l\'exercice')
  }

  return response.json()
}
