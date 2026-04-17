import { useEffect, useRef } from 'react'
import { useTracing } from '../hooks/useTracing'
import type { TracingMode } from '../services/gemini'
import { Button } from './Button'
import { ValidationFeedback } from './ValidationFeedback'

interface TracingCanvasProps {
  expected: string
  mode: TracingMode
  guideText: string
  onSuccess: (feedback: string) => void
  onError: (feedback: string) => void
  disabled?: boolean
}

const STROKE_COLOR = '#FFFFFF'
const STROKE_WIDTH = 12

const getCanvasDimensions = (mode: TracingMode) =>
  mode === 'word' ? { width: 360, height: 180 } : { width: 300, height: 300 }

const getGuideFontSize = (text: string, mode: TracingMode): string => {
  const len = text.length
  if (mode === 'digit') {
    if (len <= 1) return '150px'
    if (len <= 3) return '100px'
    if (len <= 5) return '68px'
    if (len <= 8) return '50px'
    return '36px'
  }
  // word mode — canvas is wider (360px) so font can be larger
  if (len <= 3) return '100px'
  if (len <= 5) return '80px'
  if (len <= 7) return '62px'
  if (len <= 9) return '50px'
  if (len <= 11) return '42px'
  return '36px'
}

const initCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = STROKE_COLOR
  ctx.lineWidth = STROKE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

export const TracingCanvas = ({
  expected,
  mode,
  guideText,
  onSuccess,
  onError,
  disabled = false,
}: TracingCanvasProps) => {
  const {
    canvasRef,
    state,
    result,
    error,
    hasStrokes,
    startDrawing,
    draw,
    stopDrawing,
    validate,
    clear,
  } = useTracing()
  const initialized = useRef(false)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const { width: canvasW, height: canvasH } = getCanvasDimensions(mode)
  const isWordMode = mode === 'word'
  const wrapperClass = isWordMode
    ? 'aspect-[2/1] w-full'
    : 'aspect-square w-full max-w-[300px]'

  useEffect(() => {
    if (canvasRef.current && !initialized.current) {
      initCanvas(canvasRef.current)
      initialized.current = true
    }
  }, [canvasRef])

  useEffect(() => {
    if (state === 'success' && result) {
      onSuccessRef.current(result.feedback)
    } else if (state === 'error') {
      onErrorRef.current(result?.feedback ?? error ?? '¡Intentalo de nuevo! 💪')
    }
  }, [state, result, error])

  const handleValidate = () => {
    void validate(expected, mode)
  }

  const isValidating = state === 'validating'
  const showFeedback = state === 'success' || state === 'error'
  const feedbackMessage =
    state === 'success'
      ? (result?.feedback ?? '¡Excelente! 🕸️')
      : (result?.feedback ?? error ?? '¡Intentalo de nuevo! 💪')

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-white/50 font-nunito text-sm text-center">
        Trazá: <span className="font-fredoka text-white text-lg">{guideText}</span>
      </div>

      {/* Canvas wrapper — relative para el overlay de feedback */}
      <div className={`relative rounded-2xl overflow-hidden border-2 border-white/20 bg-white/5 ${wrapperClass}`}>
        {/* Texto guía translúcido de fondo */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="font-fredoka leading-none text-white/10"
            style={{ fontSize: getGuideFontSize(guideText, mode) }}
          >
            {guideText}
          </span>
        </div>

        {/* Canvas de dibujo */}
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className={[
            'touch-none cursor-crosshair block w-full h-full',
            disabled || isValidating ? 'pointer-events-none' : '',
          ].join(' ')}
          onPointerDown={disabled ? undefined : startDrawing}
          onPointerMove={disabled ? undefined : draw}
          onPointerUp={disabled ? undefined : stopDrawing}
          onPointerLeave={disabled ? undefined : stopDrawing}
          aria-label={`Área de trazo para ${guideText}`}
        />

        {/* Feedback como overlay absoluto — no suma altura al flujo */}
        {showFeedback && (
          <div className="absolute inset-x-0 bottom-0 p-2 z-10">
            <ValidationFeedback
              type={state === 'success' ? 'success' : 'error'}
              message={feedbackMessage}
              visible
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={clear}
          disabled={disabled || isValidating || !hasStrokes}
          aria-label="Borrar trazo"
        >
          🗑️ Borrar
        </Button>
        <Button
          variant="primary"
          size="md"
          loading={isValidating}
          onClick={handleValidate}
          disabled={disabled || !hasStrokes}
          aria-label="Validar trazo"
        >
          ✓ Validar
        </Button>
      </div>
    </div>
  )
}
