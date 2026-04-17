import type { JSX } from 'react'

import { useAppStore } from '../store/useStore'

export const MusicToggle = (): JSX.Element => {
  const isMusicEnabled = useAppStore((state) => state.isMusicEnabled)
  const toggleMusic = useAppStore((state) => state.toggleMusic)

  return (
    <button
      onClick={toggleMusic}
      className="fixed top-4 right-4 z-50 h-10 w-10 flex items-center justify-center rounded-full border border-white/20 bg-spider-blue/80 text-xl text-white shadow-lg transition-transform active:scale-95"
      aria-label={isMusicEnabled ? 'Silenciar música' : 'Activar música'}
    >
      {isMusicEnabled ? '🎵' : '🔇'}
    </button>
  )
}
