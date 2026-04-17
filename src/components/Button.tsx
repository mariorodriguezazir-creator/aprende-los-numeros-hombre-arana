import { useRef } from 'react'
import gsap from 'gsap'
import { SPRING_EASE } from '../lib/animations'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-spider-red text-white hover:bg-red-700 border-2 border-red-900 shadow-lg shadow-red-900/30',
  secondary: 'bg-spider-blue text-white hover:bg-blue-900 border-2 border-blue-900 shadow-lg shadow-blue-900/30',
  ghost: 'bg-transparent text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10',
  danger: 'bg-red-900 text-white hover:bg-red-950 border-2 border-red-950',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-2xl',
  xl: 'px-8 py-4 text-xl rounded-2xl',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null)

  const handlePointerDown = () => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 0.94, duration: 0.1, ease: 'power2.out' })
    }
  }

  const handlePointerUp = () => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1, duration: 0.3, ease: SPRING_EASE })
    }
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={[
        'font-nunito font-bold transition-colors select-none active:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}
