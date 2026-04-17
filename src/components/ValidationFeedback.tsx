import { useEffect, useRef } from 'react'
import { animateSpiderError, animateSpiderSuccess } from '../lib/animations'

interface ValidationFeedbackProps {
  type: 'success' | 'error' | null
  message: string
  visible: boolean
}

export const ValidationFeedback = ({ type, message, visible }: ValidationFeedbackProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !visible || !type) return

    if (type === 'success') {
      void animateSpiderSuccess(ref.current)
    } else if (type === 'error') {
      void animateSpiderError(ref.current)
    }
  }, [type, visible, message])

  if (!visible || !type) return null

  const isSuccess = type === 'success'

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={[
        'relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-nunito font-semibold text-base',
        isSuccess
          ? 'bg-yellow-900/30 border-yellow-500 text-yellow-200'
          : 'bg-red-950/50 border-spider-red text-red-300',
      ].join(' ')}
    >
      {isSuccess && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(234,179,8,0.08) 50%, transparent 60%)',
          }}
        />
      )}
      <span className="text-2xl relative z-10" aria-hidden="true">{isSuccess ? '🕸️' : '🕷️'}</span>
      <span className="relative z-10">{message}</span>
    </div>
  )
}
