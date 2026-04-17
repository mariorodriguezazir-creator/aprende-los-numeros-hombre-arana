import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useAppStore } from '../store/useStore'
import { SPRING_EASE } from '../lib/animations'
import { SpiderWebDecor } from '../components/SpiderWebDecor'

export const SplashScreen = () => {
  const navigate = useNavigate()
  const childName = useAppStore((s) => s.childName)
  const logoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => {
      void navigate(childName ? '/home' : '/setup', { replace: true })
    }})

    tl.fromTo(
      logoRef.current,
      { scale: 0, rotation: -15 },
      { scale: 1, rotation: 0, duration: 0.7, ease: SPRING_EASE },
    )
    .fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: SPRING_EASE },
      '-=0.3',
    )
    .to({}, { duration: 1.2 })

    return () => {
      tl.kill()
    }
  }, [navigate, childName])

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center gap-6 px-4">
      <SpiderWebDecor corner="top-left" size={140} opacity={0.15} />
      <SpiderWebDecor corner="top-right" size={140} opacity={0.15} />
      <SpiderWebDecor corner="bottom-left" size={140} opacity={0.15} />
      <SpiderWebDecor corner="bottom-right" size={140} opacity={0.15} />

      <div ref={logoRef} className="text-8xl select-none" aria-hidden="true">
        🕷️
      </div>
      <h1
        ref={titleRef}
        className="font-bangers text-5xl text-spider-red tracking-widest text-center"
      >
        Azir Números
      </h1>
      <p className="font-nunito text-white/50 text-sm">Aprendé los números con Spider-Man</p>
    </div>
  )
}
