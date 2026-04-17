/**
 * Levenshtein-based fuzzy matching for voice recognition validation.
 *
 * No external dependencies — runs in ~2ms locally.
 * Used to compare what the child said with the expected number word,
 * tolerating typical pronunciation errors and phonetic variations.
 */

/**
 * Normalizes a string for comparison:
 * - Lowercases
 * - Trims whitespace
 * - Removes diacritics (tildes, etc.) so "dieciséis" == "dieciseis"
 * - Collapses multiple spaces into one
 */
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

/**
 * Computes the Levenshtein edit distance between two strings.
 * Uses the standard DP matrix approach — O(n*m) time, O(n*m) space.
 */
const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length
  const n = b.length

  // Edge cases
  if (m === 0) return n
  if (n === 0) return m

  // Build matrix
  const matrix: number[][] = Array.from({ length: n + 1 }, (_, i) => {
    const row = new Array<number>(m + 1).fill(0)
    row[0] = i
    return row
  })

  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j - 1], // substitution
          matrix[i][j - 1],     // insertion
          matrix[i - 1][j],     // deletion
        )
      }
    }
  }

  return matrix[n][m]
}

// --- Public API ---

export interface MatchResult {
  /** Whether the input is considered a match */
  match: boolean
  /** Raw edit distance (lower = more similar) */
  distance: number
  /** Similarity ratio 0–1 (higher = more similar) */
  ratio: number
  /** Which candidate matched best */
  matchedCandidate: string
  /** Normalized versions of input and best candidate */
  normalized: {
    input: string
    candidate: string
  }
}

/**
 * Maximum edit distance to still consider a match.
 * 2 allows for one misheard letter + one extra/missing letter.
 */
const MAX_DISTANCE = 2

/**
 * Minimum similarity ratio to consider a match (0–1).
 * 0.75 means at least 75% of characters match.
 */
const MIN_RATIO = 0.75

/**
 * Matches a voice recognition transcript against a target word and its synonyms.
 *
 * @param input - Raw transcript from Web Speech API
 * @param target - Expected canonical form (e.g. "dieciséis")
 * @param synonyms - Accepted alternate forms (e.g. ["dieciseis", "diesiseis"])
 * @returns MatchResult with match decision and debug metadata
 *
 * @example
 * matchVoiceInput('Diesiseis', 'dieciséis', ['dieciseis'])
 * // → { match: true, distance: 1, ratio: 0.9, ... }
 */
export const matchVoiceInput = (
  input: string,
  target: string,
  synonyms: string[] = [],
): MatchResult => {
  const normalizedInput = normalize(input)
  const candidates = [target, ...synonyms].map((s) => ({ raw: s, normalized: normalize(s) }))

  let bestDistance = Infinity
  let bestCandidate = candidates[0]

  for (const candidate of candidates) {
    const distance = levenshteinDistance(normalizedInput, candidate.normalized)
    if (distance < bestDistance) {
      bestDistance = distance
      bestCandidate = candidate
    }
  }

  const maxLen = Math.max(normalizedInput.length, bestCandidate.normalized.length)
  const ratio = maxLen === 0 ? 1 : 1 - bestDistance / maxLen
  const match = bestDistance <= MAX_DISTANCE || ratio >= MIN_RATIO

  return {
    match,
    distance: bestDistance,
    ratio: Math.round(ratio * 1000) / 1000,
    matchedCandidate: bestCandidate.raw,
    normalized: {
      input: normalizedInput,
      candidate: bestCandidate.normalized,
    },
  }
}

/** Quick boolean helper — use when you only need the pass/fail decision */
export const isVoiceMatch = (
  input: string,
  target: string,
  synonyms: string[] = [],
): boolean => matchVoiceInput(input, target, synonyms).match
