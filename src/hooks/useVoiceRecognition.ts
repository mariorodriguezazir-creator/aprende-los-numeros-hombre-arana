import { useCallback, useState } from 'react'
import { matchVoiceInput, type MatchResult } from '../services/levenshtein'
import { isSpeechRecognitionSupported, recognizeSpeech, SpeechRecognitionError, type SpeechResult, type SpeechStatus } from '../services/speech'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'not-supported'

export interface UseVoiceRecognitionReturn {
  state: VoiceState
  transcript: string | null
  matchResult: MatchResult | null
  error: string | null
  isSupported: boolean
  start: (target: string, synonyms?: string[]) => Promise<void>
  reset: () => void
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const isSupported = isSpeechRecognitionSupported()
  const [state, setState] = useState<VoiceState>(isSupported ? 'idle' : 'not-supported')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async (target: string, synonyms: string[] = []) => {
    if (!isSupported) return

    setError(null)
    setTranscript(null)
    setMatchResult(null)

    try {
      const speechResult: SpeechResult = await recognizeSpeech({
        lang: 'es-ES',
        maxAlternatives: 3,
        onStatusChange: (status: SpeechStatus) => {
          if (status === 'listening') setState('listening')
          else if (status === 'processing') setState('processing')
          else if (status === 'idle') { /* handled below */ }
        },
      })

      setTranscript(speechResult.transcript)

      // Try matching against all alternatives returned by speech API
      // Pick the best match across all alternatives
      const candidates = [speechResult.transcript, ...speechResult.alternatives.map(a => a.transcript)]
      let bestMatch: MatchResult | null = null

      for (const candidate of candidates) {
        const match = matchVoiceInput(candidate, target, synonyms)
        if (!bestMatch || match.distance < bestMatch.distance) {
          bestMatch = match
        }
      }

      setMatchResult(bestMatch)
      setState(bestMatch?.match ? 'success' : 'error')
    } catch (err) {
      const message = err instanceof SpeechRecognitionError ? err.message : 'Error desconocido al reconocer la voz.'
      setError(message)
      setState('error')
    }
  }, [isSupported])

  const reset = useCallback(() => {
    setState(isSupported ? 'idle' : 'not-supported')
    setTranscript(null)
    setMatchResult(null)
    setError(null)
  }, [isSupported])

  return { state, transcript, matchResult, error, isSupported, start, reset }
}
