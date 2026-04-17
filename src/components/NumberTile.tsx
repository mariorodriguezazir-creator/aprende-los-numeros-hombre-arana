import { useRef } from 'react'
import gsap from 'gsap'
import type { NumberProgress } from '../types'
import { SPRING_EASE } from '../lib/animations'

interface NumberTileProps {
  progress: NumberProgress
  isCurrent: boolean
  onClick: (number: number) => void
}

const getStatusIcon = (progress: NumberProgress): string => {
  const allDone =
    progress.digitTracing === 'completed' &&
    progress.wordTracing === 'completed' &&
    progress.voice === 'completed'

  if (allDone) return '⭐'

  const doneParts = [progress.digitTracing, progress.wordTracing, progress.voice].filter(
    (s) => s === 'completed',
  ).length

  if (doneParts > 0) return '🔄'
  return ''
}

export const NumberTile = ({ progress, isCurrent, onClick }: NumberTileProps) => {
  const ref = useRef<HTMLButtonElement>(null)

  const allDone =
    progress.digitTracing === 'completed' &&
    progress.wordTracing === 'completed' &&
    progress.voice === 'completed'

  const isLocked = !isCurrent && !allDone &&
    !([progress.digitTracing, progress.wordTracing, progress.voice].some((s) => s === 'completed'))

  const handlePointerDown = () => {
    if (ref.current) gsap.to(ref.current, { scale: 0.9, duration: 0.1, ease: 'power2.out' })
  }

  const handlePointerUp = () => {
    if (ref.current) gsap.to(ref.current, { scale: 1, duration: 0.35, ease: SPRING_EASE })
  }

  return (
    <button
      ref={ref}
      onClick={() => !isLocked && onClick(progress.number)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={isLocked}
      aria-label={`Número ${progress.number}${allDone ? ', completado' : isCurrent ? ', actual' : ''}`}
      className={[
        'relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl',
        'font-fredoka text-2xl font-bold transition-colors select-none',
        'border-2',
        isCurrent
          ? 'bg-spider-red border-red-700 text-white shadow-lg shadow-red-900/50 ring-2 ring-red-400'
          : allDone
            ? 'bg-green-800/60 border-green-600 text-green-300'
            : isLocked
              ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-spider-blue/60 border-blue-700 text-white',
      ].join(' ')}
    >
      {progress.number}
      {getStatusIcon(progress) && (
        <span className="absolute -top-1.5 -right-1.5 text-sm leading-none" aria-hidden="true">
          {getStatusIcon(progress)}
        </span>
      )}
    </button>
  )
}
