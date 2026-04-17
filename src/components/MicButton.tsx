import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { VoiceState } from '../hooks/useVoiceRecognition'

interface MicButtonProps {
  state: VoiceState
  onClick: () => void
  disabled?: boolean
}

export const MicButton = ({ state, onClick, disabled = false }: MicButtonProps) => {
  const pulseRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  useEffect(() => {
    if (!pulseRef.current) return

    if (isListening) {
      gsap.to(pulseRef.current, {
        scale: 1.6,
        opacity: 0,
        duration: 1,
        repeat: -1,
        ease: 'power2.out',
      })
    } else {
      gsap.killTweensOf(pulseRef.current)
      gsap.set(pulseRef.current, { scale: 1, opacity: 0 })
    }
  }, [isListening])

  const stateColors: Record<VoiceState, string> = {
    idle: 'bg-spider-blue border-blue-700',
    listening: 'bg-spider-red border-red-900 shadow-lg shadow-red-500/50',
    processing: 'bg-yellow-600 border-yellow-800',
    success: 'bg-green-600 border-green-800',
    error: 'bg-red-900 border-red-950',
    'not-supported': 'bg-gray-700 border-gray-800',
  }

  const stateIcons: Record<VoiceState, string> = {
    idle: '🎤',
    listening: '🔴',
    processing: '⏳',
    success: '✅',
    error: '❌',
    'not-supported': '🚫',
  }

  return (
    <div className="relative flex items-center justify-center">
      <div
        ref={pulseRef}
        className="absolute w-20 h-20 rounded-full bg-spider-red opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled || isListening || isProcessing || state === 'not-supported'}
        aria-label={isListening ? 'Escuchando...' : 'Hablar'}
        className={[
          'relative w-20 h-20 rounded-full border-4 text-3xl',
          'transition-all duration-200 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          stateColors[state],
        ].join(' ')}
      >
        {stateIcons[state]}
      </button>
    </div>
  )
}
