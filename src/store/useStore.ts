import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import { NUMBER_METADATA } from '../data/numbers'
import {
  VIDEO_UNLOCK_MILESTONES,
  type AppState,
  type AppStateSnapshot,
  type ExerciseStatus,
  type LegacyAppStateV0,
  type NumberProgress,
  type PersistedAppState,
} from '../types'

const STORE_NAME = 'azir-numeros-progress'
const STORE_VERSION = 1

const memoryStorageState = new Map<string, string>()

const memoryStorage: StateStorage = {
  getItem: (name) => memoryStorageState.get(name) ?? null,
  setItem: (name, value) => {
    memoryStorageState.set(name, value)
  },
  removeItem: (name) => {
    memoryStorageState.delete(name)
  },
}

const createPersistStorage = (): StateStorage => {
  if (typeof window === 'undefined') {
    return memoryStorage
  }

  try {
    const storage = window.localStorage
    const testKey = '__azir-numeros-storage-test__'

    storage.setItem(testKey, 'ok')
    storage.removeItem(testKey)

    return storage
  } catch (error) {
    console.warn('localStorage no está disponible. Se usará persistencia en memoria.', error)
    return memoryStorage
  }
}

const getTimestamp = () => new Date().toISOString()

const normalizeStatus = (value: unknown): ExerciseStatus =>
  value === 'completed' ? 'completed' : 'pending'

const normalizeCount = (value: unknown): number => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return Math.floor(parsed)
}

const createInitialNumbers = (): NumberProgress[] =>
  NUMBER_METADATA.map((numberMeta) => ({
    number: numberMeta.value,
    digitTracing: 'pending',
    wordTracing: 'pending',
    voice: 'pending',
    attempts: {
      digitTracing: 0,
      wordTracing: 0,
      voice: 0,
    },
  }))

const isNumberComplete = (progress: NumberProgress) =>
  progress.digitTracing === 'completed' &&
  progress.wordTracing === 'completed' &&
  progress.voice === 'completed'

const resolveCurrentNumber = (numbers: NumberProgress[]): number =>
  numbers.find((numberProgress) => !isNumberComplete(numberProgress))?.number ??
  numbers.at(-1)?.number ??
  1

const createInitialState = (): AppStateSnapshot => {
  const numbers = createInitialNumbers()

  return {
    childName: '',
    currentNumber: resolveCurrentNumber(numbers),
    numbers,
    unlockedVideos: [],
    isMusicEnabled: true,
    lastSession: getTimestamp(),
  }
}

const normalizeUnlockedVideos = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const milestoneSet = new Set<number>()

  value.forEach((item) => {
    const numericValue = Number(item)

    if (VIDEO_UNLOCK_MILESTONES.includes(numericValue as (typeof VIDEO_UNLOCK_MILESTONES)[number])) {
      milestoneSet.add(numericValue)
    }
  })

  return Array.from(milestoneSet).sort((left, right) => left - right)
}

const normalizeNumbers = (value: unknown): NumberProgress[] => {
  const initialNumbers = createInitialNumbers()

  if (!Array.isArray(value)) {
    return initialNumbers
  }

  return initialNumbers.map((initialProgress) => {
    const persistedProgress = value.find(
      (candidate): candidate is Partial<NumberProgress> =>
        typeof candidate === 'object' &&
        candidate !== null &&
        Number((candidate as NumberProgress).number) === initialProgress.number,
    )

    if (!persistedProgress) {
      return initialProgress
    }

    const normalizedProgress: NumberProgress = {
      number: initialProgress.number,
      digitTracing: normalizeStatus(persistedProgress.digitTracing),
      wordTracing: normalizeStatus(persistedProgress.wordTracing),
      voice: normalizeStatus(persistedProgress.voice),
      attempts: {
        digitTracing: normalizeCount(persistedProgress.attempts?.digitTracing),
        wordTracing: normalizeCount(persistedProgress.attempts?.wordTracing),
        voice: normalizeCount(persistedProgress.attempts?.voice),
      },
      completedAt:
        typeof persistedProgress.completedAt === 'string' && persistedProgress.completedAt.length > 0
          ? persistedProgress.completedAt
          : undefined,
    }

    if (isNumberComplete(normalizedProgress) && !normalizedProgress.completedAt) {
      normalizedProgress.completedAt = getTimestamp()
    }

    return normalizedProgress
  })
}

const normalizePersistedState = (
  persistedState?: Partial<PersistedAppState> | Partial<LegacyAppStateV0> | null,
): AppStateSnapshot => {
  const initialState = createInitialState()

  if (!persistedState || typeof persistedState !== 'object') {
    return initialState
  }

  const legacyState = persistedState as Partial<LegacyAppStateV0>
  const numbers = normalizeNumbers(persistedState?.numbers ?? legacyState.progress)
  const unlockedVideos = normalizeUnlockedVideos(
    persistedState?.unlockedVideos ?? legacyState.videosUnlocked,
  )

  return {
    childName:
      typeof persistedState.childName === 'string' ? persistedState.childName.trim() : initialState.childName,
    currentNumber: resolveCurrentNumber(numbers),
    numbers,
    unlockedVideos,
    isMusicEnabled:
      typeof persistedState.isMusicEnabled === 'boolean'
        ? persistedState.isMusicEnabled
        : initialState.isMusicEnabled,
    lastSession:
      typeof persistedState.lastSession === 'string' && persistedState.lastSession.length > 0
        ? persistedState.lastSession
        : initialState.lastSession,
  }
}

const updateNumberProgress = (
  numbers: NumberProgress[],
  number: number,
  updater: (current: NumberProgress) => NumberProgress,
): NumberProgress[] => numbers.map((item) => (item.number === number ? updater(item) : item))

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...createInitialState(),
      setChildName: (name) => {
        set(() => ({
          childName: name.trim(),
          lastSession: getTimestamp(),
        }))
      },
      completeExercise: (number, type) => {
        set((state) => {
          const numbers = updateNumberProgress(state.numbers, number, (current) => {
            const updatedProgress: NumberProgress = {
              ...current,
              [type]: 'completed',
            }

            return {
              ...updatedProgress,
              completedAt: isNumberComplete(updatedProgress)
                ? current.completedAt ?? getTimestamp()
                : undefined,
            }
          })

          return {
            numbers,
            currentNumber: resolveCurrentNumber(numbers),
            lastSession: getTimestamp(),
          }
        })
      },
      incrementAttempts: (number, type) => {
        set((state) => ({
          numbers: updateNumberProgress(state.numbers, number, (current) => ({
            ...current,
            attempts: {
              ...current.attempts,
              [type]: current.attempts[type] + 1,
            },
          })),
          lastSession: getTimestamp(),
        }))
      },
      unlockVideo: (milestone) => {
        set((state) => {
          if (
            !VIDEO_UNLOCK_MILESTONES.includes(
              milestone as (typeof VIDEO_UNLOCK_MILESTONES)[number],
            )
          ) {
            return state
          }

          return {
            unlockedVideos: Array.from(new Set([...state.unlockedVideos, milestone])).sort(
              (left, right) => left - right,
            ),
            lastSession: getTimestamp(),
          }
        })
      },
      toggleMusic: () => {
        set((state) => ({
          isMusicEnabled: !state.isMusicEnabled,
        }))
      },
      resetProgress: () => ({
        ...createInitialState(),
      }),
    }),
    {
      name: STORE_NAME,
      version: STORE_VERSION,
      storage: createJSONStorage(createPersistStorage),
      partialize: (state) => ({
        childName: state.childName,
        currentNumber: state.currentNumber,
        numbers: state.numbers,
        unlockedVideos: state.unlockedVideos,
        isMusicEnabled: state.isMusicEnabled,
        lastSession: state.lastSession,
        metadata: {
          version: STORE_VERSION,
          migratedAt: getTimestamp(),
        },
      }),
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return normalizePersistedState(persistedState as Partial<LegacyAppStateV0>)
        }

        return normalizePersistedState(persistedState as Partial<PersistedAppState>)
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState as Partial<PersistedAppState>),
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('No se pudo hidratar el store persistido. Se restaurará el estado inicial.', error)
        }
      },
    },
  ),
)

export const appStoreInitialState = createInitialState()
export const appStoreVersion = STORE_VERSION
