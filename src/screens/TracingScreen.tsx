import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useStore'
import { NUMBER_METADATA_BY_VALUE } from '../data/numbers'
import { VIDEO_UNLOCK_MILESTONES } from '../types'
import { NumberGuide } from '../components/NumberGuide'
import { TracingCanvas } from '../components/TracingCanvas'
import { Button } from '../components/Button'
import { ConnectionIndicator } from '../components/ConnectionIndicator'
import { SpiderWebDecor } from '../components/SpiderWebDecor'
import { animatePageIn } from '../lib/animations'

type Step = 'digit' | 'word'

export const TracingScreen = () => {
  const { number: numberParam } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const completeExercise = useAppStore((s) => s.completeExercise)
  const incrementAttempts = useAppStore((s) => s.incrementAttempts)
  const unlockVideo = useAppStore((s) => s.unlockVideo)
  const numbers = useAppStore((s) => s.numbers)

  const number = Number(numberParam)
  const meta = NUMBER_METADATA_BY_VALUE[number]
  const pageRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>('digit')
  const [stepDone, setStepDone] = useState<Record<Step, boolean>>({ digit: false, word: false })

  useEffect(() => {
    if (!meta) {
      void navigate('/home', { replace: true })
      return
    }
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [meta, navigate])

  if (!meta) return null

  const handleSuccess = (_message: string) => {
    const exerciseType = step === 'digit' ? 'digitTracing' : 'wordTracing'
    completeExercise(number, exerciseType)
    setStepDone((prev) => ({ ...prev, [step]: true }))

    const progressAfter = numbers.find((n) => n.number === number)
    if (progressAfter) {
      for (const milestone of VIDEO_UNLOCK_MILESTONES) {
        if (number === milestone) {
          unlockVideo(milestone)
        }
      }
    }

    setTimeout(() => {
      if (step === 'digit') {
        setStep('word')
      } else {
        void navigate(`/voice/${number}`)
      }
    }, 1500)
  }

  const handleError = (_message: string) => {
    incrementAttempts(number, step === 'digit' ? 'digitTracing' : 'wordTracing')
  }

  const currentGuide = step === 'digit' ? meta.digit : meta.word
  const currentMode = step === 'digit' ? 'digit' : 'word'

  return (
    <div
      ref={pageRef}
      className="relative overflow-hidden min-h-screen bg-[#0A0A1A] flex flex-col items-center px-4 py-4 gap-4"
    >
      <SpiderWebDecor corner="top-left" />
      <SpiderWebDecor corner="top-right" />
      <ConnectionIndicator />

      <div className="w-full flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => void navigate('/home')}>
          ← Volver
        </Button>
        <h1 className="font-bangers text-2xl text-spider-red tracking-wider flex-1 text-center">
          Trazo: {step === 'digit' ? 'Número' : 'Palabra'}
        </h1>
      </div>

      <div className="flex gap-3">
        {(['digit', 'word'] as Step[]).map((s) => (
          <div
            key={s}
            className={[
              'h-2 w-12 rounded-full transition-colors',
              stepDone[s] ? 'bg-green-500' : s === step ? 'bg-spider-red' : 'bg-white/20',
            ].join(' ')}
          />
        ))}
      </div>

      <NumberGuide digit={meta.digit} word={meta.word} size="sm" />

      <TracingCanvas
        key={step}
        expected={currentGuide}
        mode={currentMode}
        guideText={currentGuide}
        onSuccess={handleSuccess}
        onError={handleError}
        disabled={stepDone[step]}
      />
    </div>
  )
}
