import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useStore'
import { NUMBER_METADATA_BY_VALUE } from '../data/numbers'
import { VIDEO_UNLOCK_MILESTONES } from '../types'
import { usePauseMusicOnRoute } from '../hooks/useBgMusic'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { NumberGuide } from '../components/NumberGuide'
import { MicButton } from '../components/MicButton'
import { ValidationFeedback } from '../components/ValidationFeedback'
import { Button } from '../components/Button'
import { SpiderWebDecor } from '../components/SpiderWebDecor'
import { animatePageIn } from '../lib/animations'

export const VoiceScreen = () => {
  const { number: numberParam } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const completeExercise = useAppStore((s) => s.completeExercise)
  const incrementAttempts = useAppStore((s) => s.incrementAttempts)
  const unlockVideo = useAppStore((s) => s.unlockVideo)

  usePauseMusicOnRoute()

  const number = Number(numberParam)
  const meta = NUMBER_METADATA_BY_VALUE[number]
  const pageRef = useRef<HTMLDivElement>(null)

  const { state, transcript, matchResult, error, isSupported, start, reset } = useVoiceRecognition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [done, setDone] = useState(false)
  const [showSkip, setShowSkip] = useState(false)

  const getErrorMessage = (err: string | null, tx: string | null): string => {
    if (err?.includes('network') || err?.includes('service-not-allowed')) {
      return 'Tu dispositivo no tiene reconocimiento de voz disponible. Podés saltar este paso.'
    }
    if (tx) return `Dijiste: "${tx}". ¡Intentá de nuevo! 💪`
    return err ?? '¡Intentá de nuevo! 💪'
  }

  useEffect(() => {
    if (!meta) {
      void navigate('/home', { replace: true })
      return
    }
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [meta, navigate])

  useEffect(() => {
    if (state === 'success' && matchResult) {
      completeExercise(number, 'voice')
      setDone(true)
      setFeedback({ type: 'success', message: '¡Perfecto! Dijiste el número bien 🌟' })

      for (const milestone of VIDEO_UNLOCK_MILESTONES) {
        if (number === milestone) {
          unlockVideo(milestone)
          setTimeout(() => void navigate(`/celebration/${number}`), 1500)
          return
        }
      }
      setTimeout(() => void navigate(`/celebration/${number}`), 1500)
    } else if (state === 'error') {
      incrementAttempts(number, 'voice')
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, transcript),
      })
      setShowSkip(true)
    }
  }, [state, matchResult, error, transcript, number, completeExercise, incrementAttempts, unlockVideo, navigate])

  if (!meta) return null

  const handleMicClick = () => {
    reset()
    setFeedback(null)
    void start(meta.word, [...(meta.synonyms ?? []), String(number)])
  }

  return (
    <div ref={pageRef} className="relative overflow-hidden min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-6 gap-6">
      <SpiderWebDecor corner="top-left" />
      <SpiderWebDecor corner="top-right" />
      <div className="w-full flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => void navigate(`/tracing/${number}`)}>
          ← Volver
        </Button>
        <h1 className="font-bangers text-2xl text-spider-red tracking-wider flex-1 text-center">
          ¡Decí el número!
        </h1>
      </div>

      <NumberGuide digit={meta.digit} word={meta.word} size="md" />

      <p className="font-nunito text-white/70 text-center text-base max-w-xs">
        Tocá el micrófono y decí el número en voz alta
      </p>

      {isSupported ? (
        <MicButton state={state} onClick={handleMicClick} disabled={done} />
      ) : (
        <p className="font-nunito text-yellow-400 text-sm text-center">
          Tu navegador no soporta reconocimiento de voz. Usá Chrome o Safari.
        </p>
      )}

      {transcript && (
        <p className="font-nunito text-white/50 text-sm text-center">
          Escuché: <span className="text-white font-semibold">&ldquo;{transcript}&rdquo;</span>
        </p>
      )}

      <ValidationFeedback
        type={feedback?.type ?? null}
        message={feedback?.message ?? ''}
        visible={feedback !== null}
      />

      {(!isSupported || showSkip) && (
        <Button
          variant="secondary"
          size="md"
          onClick={() => void navigate(`/celebration/${number}`)}
        >
          {!isSupported ? 'Continuar sin voz →' : 'Saltar este ejercicio →'}
        </Button>
      )}
    </div>
  )
}
