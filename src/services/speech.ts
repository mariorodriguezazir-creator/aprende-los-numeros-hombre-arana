/**
 * Web Speech API wrapper for voice recognition.
 *
 * Provides a Promise-based interface over the native SpeechRecognition API.
 * Configured for Spanish (es-ES), optimized for young children:
 * - No interim results (reduces confusion)
 * - Multiple alternatives (improves accuracy)
 * - Generous error messages in Spanish
 *
 * Browser support: Chrome, Edge, Safari 15+. Firefox NOT supported.
 * Check `isSpeechRecognitionSupported()` before using.
 */

// --- Status ---

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'error'

// --- Results ---

export interface SpeechResult {
  /** Best transcript from the recognition engine */
  transcript: string
  /** Confidence score 0–1 (may be 0 in some browsers) */
  confidence: number
  /** All alternatives returned by the engine */
  alternatives: Array<{ transcript: string; confidence: number }>
}

// --- Errors ---

export type SpeechErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'service-not-allowed'
  | 'aborted'
  | 'unknown'

export class SpeechRecognitionError extends Error {
  readonly code: SpeechErrorCode

  constructor(message: string, code: SpeechErrorCode) {
    super(message)
    this.name = 'SpeechRecognitionError'
    this.code = code
  }
}

// --- Browser Detection ---

/**
 * Returns true if the current browser supports the Web Speech API.
 * Must be called in a browser context (not SSR).
 */
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

// --- Error Messages ---

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'Permiso de micrófono denegado. Tocá el candado en la barra del navegador y permitir el micrófono.',
  'no-speech':
    'No escuché nada. Hablá más fuerte y cerca del micrófono.',
  'audio-capture':
    'No se pudo acceder al micrófono. Asegurate de que esté conectado.',
  'network':
    'Error de red durante el reconocimiento de voz. Verificá la conexión a internet.',
  'service-not-allowed':
    'El servicio de reconocimiento de voz no está disponible en este momento.',
  'aborted':
    'El reconocimiento de voz fue cancelado.',
}

const getErrorMessage = (errorCode: string): string =>
  ERROR_MESSAGES[errorCode] ?? `Error de reconocimiento de voz: ${errorCode}`

// --- Core API ---

export interface SpeechRecognitionOptions {
  /** BCP-47 language tag. Defaults to 'es-ES'. */
  lang?: string
  /** Max number of alternatives to request. Defaults to 3. */
  maxAlternatives?: number
  /** Callback fired when recognition status changes */
  onStatusChange?: (status: SpeechStatus) => void
}

/**
 * Starts a one-shot voice recognition session and returns the best transcript.
 *
 * @param options - Optional configuration
 * @returns Promise resolving with the SpeechResult
 * @throws SpeechRecognitionError if not supported or an error occurs
 *
 * @example
 * const result = await recognizeSpeech({ onStatusChange: setStatus })
 * console.log(result.transcript) // "veintidós"
 */
export const recognizeSpeech = (options: SpeechRecognitionOptions = {}): Promise<SpeechResult> => {
  const { lang = 'es-ES', maxAlternatives = 3, onStatusChange } = options

  return new Promise((resolve, reject) => {
    const Constructor = getSpeechRecognitionConstructor()

    if (!Constructor) {
      reject(
        new SpeechRecognitionError(
          'El reconocimiento de voz no está disponible en este navegador. Usá Chrome o Safari.',
          'not-supported',
        ),
      )
      return
    }

    const recognition = new Constructor()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = maxAlternatives
    recognition.continuous = false

    let settled = false

    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true
        fn()
      }
    }

    recognition.onstart = () => {
      onStatusChange?.('listening')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      onStatusChange?.('processing')

      const resultList = event.results[0]
      if (!resultList || resultList.length === 0) {
        settle(() =>
          reject(
            new SpeechRecognitionError(
              'No se obtuvo ningún resultado de reconocimiento.',
              'no-speech',
            ),
          ),
        )
        return
      }

      // Collect all alternatives
      const alternatives: SpeechResult['alternatives'] = []
      for (let i = 0; i < resultList.length; i++) {
        const alt = resultList[i]
        alternatives.push({
          transcript: alt.transcript.trim(),
          confidence: alt.confidence,
        })
      }

      // Best alternative = highest confidence (index 0 is already the best in most browsers,
      // but we re-sort just in case)
      const best = [...alternatives].sort((a, b) => b.confidence - a.confidence)[0]

      settle(() =>
        resolve({
          transcript: best.transcript,
          confidence: best.confidence,
          alternatives,
        }),
      )
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onStatusChange?.('error')
      const code = event.error as SpeechErrorCode
      settle(() =>
        reject(new SpeechRecognitionError(getErrorMessage(event.error), code)),
      )
    }

    recognition.onend = () => {
      onStatusChange?.('idle')
      // If we ended without resolving/rejecting (e.g. silence timeout), treat as no-speech
      settle(() =>
        reject(
          new SpeechRecognitionError(
            'No escuché nada. Intentá de nuevo.',
            'no-speech',
          ),
        ),
      )
    }

    try {
      recognition.start()
    } catch (error) {
      settle(() =>
        reject(
          new SpeechRecognitionError(
            'No se pudo iniciar el reconocimiento de voz.',
            'unknown',
          ),
        ),
      )
    }
  })
}
