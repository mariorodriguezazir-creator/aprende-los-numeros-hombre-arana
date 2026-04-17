import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { useAppStore } from '../store/useStore'
import { getVideoForMilestone } from '../data/videos'
import { usePauseMusicOnRoute } from '../hooks/useBgMusic'
import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { SpiderWebDecor } from '../components/SpiderWebDecor'
import { Button } from '../components/Button'
import { SPRING_EASE } from '../lib/animations'

export const VideoRewardScreen = () => {
  const { milestone: milestoneParam } = useParams<{ milestone: string }>()
  const navigate = useNavigate()
  const unlockedVideos = useAppStore((s) => s.unlockedVideos)

  usePauseMusicOnRoute()

  const milestone = Number(milestoneParam)
  const video = getVideoForMilestone(milestone)
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!video || !unlockedVideos.includes(milestone)) {
      void navigate('/home', { replace: true })
      return
    }

    const tl = gsap.timeline()
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { scale: 0.3, opacity: 0, y: -40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
      )
    }
    if (videoRef.current) {
      tl.fromTo(
        videoRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: SPRING_EASE },
        '-=0.2',
      )
    }
    if (btnRef.current) {
      tl.fromTo(
        btnRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: SPRING_EASE },
        '-=0.1',
      )
    }
  }, [video, milestone, unlockedVideos, navigate])

  if (!video || !unlockedVideos.includes(milestone)) return null

  return (
    <div
      ref={pageRef}
      className="relative overflow-hidden flex flex-col items-center px-4 py-4 gap-4"
      style={{
        height: '100dvh',
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0A0A1A 60%)',
      }}
    >
      {/* Decoraciones telaraña */}
      <SpiderWebDecor corner="top-left" opacity={0.18} />
      <SpiderWebDecor corner="top-right" opacity={0.18} />
      <SpiderWebDecor corner="bottom-left" opacity={0.1} />
      <SpiderWebDecor corner="bottom-right" opacity={0.1} />

      {/* Header épico */}
      <div ref={headerRef} className="shrink-0 text-center space-y-1 pt-2">
        <div className="text-4xl mb-1" aria-hidden="true">🏆</div>
        <h1
          className="font-bangers text-3xl tracking-widest"
          style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}
        >
          ¡MISIÓN CUMPLIDA!
        </h1>
        <h2 className="font-bangers text-xl text-spider-red tracking-wider">{video.title}</h2>
        <p className="font-nunito text-white/60 text-xs">{video.description}</p>
      </div>

      {/* Video con borde dorado — ocupa todo el espacio disponible */}
      <div
        ref={videoRef}
        className="flex-1 min-h-0 w-full rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 0 3px #FFD700, 0 0 30px rgba(255,215,0,0.3), 0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <YouTubeEmbed videoId={video.youtubeId} title={video.title} autoplay fillContainer />
      </div>

      {/* Botón continuar */}
      <div ref={btnRef} className="shrink-0 w-full">
        <Button
          variant="primary"
          size="lg"
          onClick={() => void navigate('/home')}
          className="w-full"
        >
          ¡Seguir aprendiendo! 🕷️
        </Button>
      </div>
    </div>
  )
}
