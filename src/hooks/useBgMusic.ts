import { useEffect } from 'react'

import { useAppStore } from '../store/useStore'

let audioInstance: HTMLAudioElement | null = null

const getAudio = (): HTMLAudioElement | null => {
  if (!audioInstance && typeof window !== 'undefined') {
    audioInstance = new Audio('/audio/bg-music.mp3')
    audioInstance.loop = true
    audioInstance.volume = 0.3
  }

  return audioInstance
}

/**
 * Montar en AppLayout — controla play/pause según isMusicEnabled del store.
 */
export const useBgMusic = (): void => {
  const isMusicEnabled = useAppStore((state) => state.isMusicEnabled)

  useEffect(() => {
    const audio = getAudio()

    if (!audio) return

    if (isMusicEnabled) {
      void audio.play().catch(() => {
        // Autoplay policy: el navegador puede bloquear antes de interacción del usuario
      })
    } else {
      audio.pause()
    }
  }, [isMusicEnabled])
}

/**
 * Montar en rutas que tienen su propio audio (VoiceScreen, VideoRewardScreen).
 * Pausa la música al entrar y la reanuda al salir.
 */
export const usePauseMusicOnRoute = (): void => {
  useEffect(() => {
    const audio = getAudio()

    if (!audio) return

    const wasPlaying = !audio.paused
    audio.pause()

    return () => {
      if (wasPlaying) {
        void audio.play().catch(() => {})
      }
    }
  }, [])
}
