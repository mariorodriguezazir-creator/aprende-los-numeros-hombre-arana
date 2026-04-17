/**
 * Decoración SVG de telaraña Spider-Man para esquinas de pantalla.
 * Se usa con `position: fixed` o dentro de un contenedor `relative`.
 */

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface SpiderWebDecorProps {
  corner: Corner
  size?: number
  opacity?: number
  className?: string
}

const ROTATIONS: Record<Corner, number> = {
  'top-left': 0,
  'top-right': 90,
  'bottom-right': 180,
  'bottom-left': 270,
}

export const SpiderWebDecor = ({
  corner,
  size = 120,
  opacity = 0.12,
  className = '',
}: SpiderWebDecorProps) => {
  const rotation = ROTATIONS[corner]

  const positionClass: Record<Corner, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }

  return (
    <div
      className={`absolute ${positionClass[corner]} pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Líneas radiales desde la esquina superior-izquierda */}
        <line x1="0" y1="0" x2="120" y2="0" stroke="white" strokeWidth="1.2" />
        <line x1="0" y1="0" x2="120" y2="40" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="120" y2="80" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="100" y2="120" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="60" y2="120" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="20" y2="120" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="120" stroke="white" strokeWidth="1.2" />
        {/* Arcos concéntricos */}
        <path d="M 25,0 Q 25,25 0,25" stroke="white" strokeWidth="1" fill="none" />
        <path d="M 50,0 Q 50,50 0,50" stroke="white" strokeWidth="1" fill="none" />
        <path d="M 75,0 Q 75,75 0,75" stroke="white" strokeWidth="1" fill="none" />
        <path d="M 100,0 Q 100,100 0,100" stroke="white" strokeWidth="1" fill="none" />
        <path d="M 120,0 Q 120,120 0,120" stroke="white" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}
