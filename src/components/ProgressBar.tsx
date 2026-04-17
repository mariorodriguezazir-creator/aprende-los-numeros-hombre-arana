import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { NumberProgress } from '../types'

interface ProgressBarProps {
  numbers: NumberProgress[]
}

const calcPercent = (numbers: NumberProgress[]): number => {
  if (numbers.length === 0) return 0
  const totalExercises = numbers.length * 3
  const completed = numbers.reduce(
    (acc, n) =>
      acc +
      (n.digitTracing === 'completed' ? 1 : 0) +
      (n.wordTracing === 'completed' ? 1 : 0) +
      (n.voice === 'completed' ? 1 : 0),
    0,
  )
  return Math.round((completed / totalExercises) * 100)
}

export const ProgressBar = ({ numbers }: ProgressBarProps) => {
  const fillRef = useRef<HTMLDivElement>(null)
  const percent = calcPercent(numbers)

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        width: `${percent}%`,
        duration: 0.6,
        ease: 'power2.out',
      })
    }
  }, [percent])

  return (
    <div className="w-full" aria-label={`Progreso: ${percent}%`} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-nunito text-xs text-white/60">Progreso</span>
        <span className="font-fredoka text-sm text-spider-red">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          ref={fillRef}
          className="h-full bg-spider-red rounded-full"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}
