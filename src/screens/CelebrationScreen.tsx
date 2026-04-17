import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { useAppStore } from '../store/useStore'
import { NUMBER_METADATA_BY_VALUE } from '../data/numbers'
import { VIDEO_UNLOCK_MILESTONES } from '../types'
import { Button } from '../components/Button'
import { animateCelebration, SPRING_EASE } from '../lib/animations'

export const CelebrationScreen = () => {
  const { number: numberParam } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const unlockedVideos = useAppStore((s) => s.unlockedVideos)

  const number = Number(numberParam)
  const meta = NUMBER_METADATA_BY_VALUE[number]
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const nextNumber = number + 1
  const hasNext = nextNumber <= 50

  const isMilestone = (VIDEO_UNLOCK_MILESTONES as readonly number[]).includes(number)
  const videoUnlocked = isMilestone && unlockedVideos.includes(number)

  useEffect(() => {
    if (!meta) {
      void navigate('/home', { replace: true })
      return
    }

    if (heroRef.current) animateCelebration(heroRef.current)
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: SPRING_EASE },
      )
    }
  }, [meta, navigate])

  if (!meta) return null

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center px-4 py-6 gap-8">
      <div ref={heroRef} className="text-center space-y-2">
        <div className="text-8xl" aria-hidden="true">⭐</div>
        <h1 className="font-bangers text-5xl text-spider-red tracking-wider">
          ¡Bien hecho!
        </h1>
        <p className="font-nunito text-white/80 text-lg">
          Completaste el número{' '}
          <span className="font-fredoka text-spider-red text-2xl">{meta.digit}</span>
          {' '}({meta.word})
        </p>
      </div>

      <div ref={contentRef} className="flex flex-col items-center gap-4 w-full max-w-xs">
        {videoUnlocked && (
          <div
            className="w-full p-5 rounded-2xl text-center space-y-3"
            style={{
              background: 'linear-gradient(135deg, #1a1000 0%, #2d1f00 100%)',
              boxShadow: '0 0 0 2px #FFD700, 0 0 20px rgba(255,215,0,0.25)',
              animation: 'pulse-gold 2s ease-in-out infinite',
            }}
          >
            <div className="text-4xl" aria-hidden="true">🏆</div>
            <p
              className="font-bangers text-3xl tracking-widest"
              style={{ color: '#FFD700', textShadow: '0 0 12px rgba(255,215,0,0.5)' }}
            >
              ¡SUPER PREMIO!
            </p>
            <p className="font-nunito text-yellow-300/80 text-sm">
              ¡Completaste {number} números! Tu video te espera 🎬
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => void navigate(`/video/${number}`)}
              className="w-full"
            >
              🕷️ ¡Ver mi premio!
            </Button>
          </div>
        )}

        {hasNext && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => void navigate(`/tracing/${nextNumber}`)}
            className="w-full"
          >
            ¡Siguiente número! →
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={() => void navigate('/home')}
          className="w-full"
        >
          Volver al inicio 🏠
        </Button>
      </div>
    </div>
  )
}
