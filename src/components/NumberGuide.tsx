import { useEffect, useRef } from 'react'
import { animateIn } from '../lib/animations'

interface NumberGuideProps {
  digit: string
  word: string
  size?: 'sm' | 'md' | 'lg'
}

const DIGIT_SIZE: Record<string, string> = {
  sm: 'text-6xl',
  md: 'text-8xl',
  lg: 'text-[160px]',
}

const WORD_SIZE: Record<string, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export const NumberGuide = ({ digit, word, size = 'md' }: NumberGuideProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      animateIn(ref.current)
    }
  }, [digit])

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <span
        className={`font-fredoka leading-none text-spider-white drop-shadow-[0_0_20px_rgba(217,28,28,0.6)] ${DIGIT_SIZE[size]}`}
      >
        {digit}
      </span>
      <span className={`font-bangers tracking-wider text-spider-red uppercase ${WORD_SIZE[size]}`}>
        {word}
      </span>
    </div>
  )
}
