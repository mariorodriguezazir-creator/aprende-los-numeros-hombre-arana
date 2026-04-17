/**
 * Gemini multimodal API client for tracing validation.
 *
 * Sends a canvas snapshot (PNG base64) to Gemini and asks it to evaluate
 * whether the child's tracing matches the expected number/word.
 *
 * Uses the REST API directly (no SDK) to avoid extra dependencies.
 * Model is configurable via VITE_GEMINI_MODEL_ID env var.
 *
 * IMPORTANT: This service is ONLY for image validation (tracing).
 * Voice validation uses Levenshtein (levenshtein.ts) — no API needed.
 */

// --- Config ---

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const getApiKey = (): string => import.meta.env.VITE_GEMINI_API_KEY ?? ''
const getModelId = (): string =>
  import.meta.env.VITE_GEMINI_MODEL_ID ?? 'gemini-3-flash-preview'

// --- Types ---

interface GeminiPart {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

interface GeminiRequest {
  contents: Array<{ parts: GeminiPart[] }>
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
    responseMimeType?: string
    thinkingConfig?: {
      thinkingBudget?: number
    }
  }
}

interface GeminiRawValidation {
  valid: boolean
  feedback: string
  confidence: 'high' | 'medium' | 'low'
}

// --- Public Types ---

export type TracingMode = 'digit' | 'word'

export interface TracingValidationResult {
  /** Whether the tracing is accepted */
  valid: boolean
  /** Short encouraging message in Spanish for a 5-year-old */
  feedback: string
  /** How confident Gemini is in its assessment */
  confidence: 'high' | 'medium' | 'low'
}

export type GeminiErrorCode =
  | 'no-api-key'
  | 'offline'
  | 'network-error'
  | 'api-error'
  | 'parse-error'

export class GeminiValidationError extends Error {
  readonly code: GeminiErrorCode
  readonly statusCode: number | undefined

  constructor(message: string, code: GeminiErrorCode, statusCode?: number) {
    super(message)
    this.name = 'GeminiValidationError'
    this.code = code
    this.statusCode = statusCode
  }
}

// --- Prompt Builder ---

const buildValidationPrompt = (expected: string, mode: TracingMode): string => {
  const subject =
    mode === 'digit'
      ? `el dígito numérico "${expected}"`
      : `la palabra "${expected}"`

  return `Sos un asistente educativo amigable para niños de 5 años que aprenden a escribir números en español.

Analizá la imagen adjunta. El niño intentó trazar con el dedo ${subject} en una pantalla táctil.

Respondé ÚNICAMENTE con un JSON válido con este formato exacto (sin texto adicional):
{
  "valid": true,
  "feedback": "¡Muy bien!",
  "confidence": "high"
}

Reglas estrictas:
- "valid": true si el trazo se asemeja razonablemente a ${subject}. Sé generoso — los niños de 5 años no trazan perfecto.
- "valid": false solo si el trazo no tiene ningún parecido con ${subject} (está en blanco, es un garabato sin forma, o es claramente otro carácter).
- "feedback": mensaje MUY corto (máximo 6 palabras), positivo y alentador en español rioplatense. Si "valid" es false, igual alentá al niño a intentar de nuevo.
- "confidence": "high" si estás muy seguro, "medium" si hay algo de ambigüedad, "low" si la imagen es difícil de interpretar.
- No incluyas ningún texto fuera del JSON.`
}

// --- Base64 Extraction ---

const extractBase64FromDataUrl = (dataUrl: string): string => {
  const parts = dataUrl.split(',')
  if (parts.length !== 2 || !parts[1]) {
    throw new GeminiValidationError(
      'El data URL del canvas no tiene el formato esperado.',
      'parse-error',
    )
  }
  return parts[1]
}

// --- Response Parser ---

const parseGeminiResponse = (data: unknown): TracingValidationResult => {
  const responseData = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const candidates = responseData?.candidates
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new GeminiValidationError(
      'La respuesta de Gemini no contiene candidatos.',
      'parse-error',
    )
  }

  const text = candidates[0]?.content?.parts?.[0]?.text

  if (typeof text !== 'string') {
    throw new GeminiValidationError(
      'La respuesta de Gemini no contiene texto.',
      'parse-error',
    )
  }

  let parsed: GeminiRawValidation
  try {
    // Gemini sometimes wraps JSON in markdown code fences — strip them
    const cleaned = text
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()
    parsed = JSON.parse(cleaned) as GeminiRawValidation
  } catch {
    throw new GeminiValidationError(
      `No se pudo parsear la respuesta de Gemini: "${text.slice(0, 100)}"`,
      'parse-error',
    )
  }

  const VALID_CONFIDENCES = ['high', 'medium', 'low'] as const

  return {
    valid: Boolean(parsed.valid),
    feedback:
      typeof parsed.feedback === 'string' && parsed.feedback.trim().length > 0
        ? parsed.feedback.trim()
        : parsed.valid
          ? '¡Muy bien!'
          : '¡Intentalo de nuevo!',
    confidence: VALID_CONFIDENCES.includes(parsed.confidence)
      ? parsed.confidence
      : 'medium',
  }
}

// --- Public API ---

/**
 * Returns true if Gemini validation is available:
 * - API key is configured
 * - Browser is online
 */
export const isGeminiAvailable = (): boolean =>
  Boolean(getApiKey()) && (typeof navigator === 'undefined' || navigator.onLine)

/**
 * Validates a child's tracing by sending the canvas image to Gemini.
 *
 * @param canvasDataUrl - Data URL (png) from canvas.toDataURL('image/png')
 * @param expected - The expected digit or word (e.g. "5" or "cinco")
 * @param mode - Whether we're validating a digit or a word tracing
 * @returns TracingValidationResult with valid flag, feedback, and confidence
 * @throws GeminiValidationError on any failure
 *
 * @example
 * const result = await validateTracing(canvas.toDataURL(), '5', 'digit')
 * if (result.valid) { // accept the tracing }
 */
export const validateTracing = async (
  canvasDataUrl: string,
  expected: string,
  mode: TracingMode,
): Promise<TracingValidationResult> => {
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new GeminiValidationError(
      'La API key de Gemini no está configurada. Agregá VITE_GEMINI_API_KEY al archivo .env.',
      'no-api-key',
    )
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new GeminiValidationError(
      'Sin conexión a internet. El trazo no puede ser validado sin conexión.',
      'offline',
    )
  }

  const base64Data = extractBase64FromDataUrl(canvasDataUrl)
  const modelId = getModelId()

  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          { text: buildValidationPrompt(expected, mode) },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1, // Low temperature = more deterministic validation
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  let response: Response
  try {
    response = await fetch(
      `${GEMINI_API_BASE}/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15_000), // 15s timeout — generous for mobile
      },
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GeminiValidationError(
        'La validación tardó demasiado. Intentá de nuevo.',
        'network-error',
      )
    }
    throw new GeminiValidationError(
      'Error de red al contactar a Gemini. Verificá tu conexión.',
      'network-error',
    )
  }

  if (!response.ok) {
    throw new GeminiValidationError(
      `Error de la API de Gemini (${response.status}): ${response.statusText}`,
      'api-error',
      response.status,
    )
  }

  const data: unknown = await response.json()
  return parseGeminiResponse(data)
}

/**
 * Fallback result when Gemini is unavailable (offline mode).
 * Optimistic: marks tracing as valid so kids can keep playing offline.
 */
export const getOfflineFallbackResult = (): TracingValidationResult => ({
  valid: true,
  feedback: '¡Guardado! Validaremos cuando vuelvas a conectarte.',
  confidence: 'low',
})
