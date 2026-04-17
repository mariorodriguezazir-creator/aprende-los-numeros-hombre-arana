export const EXERCISE_TYPES = ['digitTracing', 'wordTracing', 'voice'] as const
export const EXERCISE_STATUS = ['pending', 'completed'] as const
export const VIDEO_UNLOCK_MILESTONES = [10, 20, 30, 40, 50] as const

export type ExerciseType = (typeof EXERCISE_TYPES)[number]
export type ExerciseStatus = (typeof EXERCISE_STATUS)[number]
export type TracingMode = 'digit' | 'word'

export interface NumberMeta {
  value: number
  digit: string
  word: string
  synonyms: string[]
}

export interface ExerciseAttempts {
  digitTracing: number
  wordTracing: number
  voice: number
}

export interface NumberProgress {
  number: number
  digitTracing: ExerciseStatus
  wordTracing: ExerciseStatus
  voice: ExerciseStatus
  attempts: ExerciseAttempts
  completedAt?: string
}

export interface AppStateSnapshot {
  childName: string
  currentNumber: number
  numbers: NumberProgress[]
  unlockedVideos: number[]
  isMusicEnabled: boolean
  lastSession: string
}

export interface LegacyAppStateV0 {
  childName?: string
  currentNumber?: number
  numbers?: NumberProgress[]
  progress?: NumberProgress[]
  unlockedVideos?: number[]
  videosUnlocked?: number[]
  isMusicEnabled?: boolean
  lastSession?: string
}

export interface AppActions {
  setChildName: (name: string) => void
  completeExercise: (number: number, type: ExerciseType) => void
  incrementAttempts: (number: number, type: ExerciseType) => void
  unlockVideo: (milestone: number) => void
  toggleMusic: () => void
  resetProgress: () => void
}

export type AppState = AppStateSnapshot & AppActions

export interface PersistMetadata {
  version: number
  migratedAt: string
}

export type PersistedAppState = AppStateSnapshot & {
  metadata?: PersistMetadata
}
