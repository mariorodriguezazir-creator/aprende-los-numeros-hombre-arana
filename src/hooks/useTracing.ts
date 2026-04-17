import { useCallback, useRef, useState } from 'react'
import { getOfflineFallbackResult, GeminiValidationError, isGeminiAvailable, validateTracing, type TracingMode, type TracingValidationResult } from '../services/gemini'

export type TracingState = 'idle' | 'drawing' | 'validating' | 'success' | 'error'

export interface UseTracingReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  state: TracingState
  result: TracingValidationResult | null
  error: string | null
  isDrawing: boolean
  startDrawing: (e: React.PointerEvent<HTMLCanvasElement>) => void
  draw: (e: React.PointerEvent<HTMLCanvasElement>) => void
  stopDrawing: () => void
  validate: (expected: string, mode: TracingMode) => Promise<void>
  clear: () => void
  hasStrokes: boolean
}

export const useTracing = (): UseTracingReturn => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [state, setState] = useState<TracingState>('idle')
  const [result, setResult] = useState<TracingValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    return { canvas, ctx }
  }, [])

  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const data = getContext()
    if (!data) return
    const { canvas, ctx } = data

    e.currentTarget.setPointerCapture(e.pointerId)
    const point = getCanvasPoint(e, canvas)
    lastPoint.current = point

    ctx.beginPath()
    ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = ctx.strokeStyle
    ctx.fill()

    setIsDrawing(true)
    setHasStrokes(true)
    setState('drawing')
  }, [getContext, getCanvasPoint])

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const data = getContext()
    if (!data) return
    const { canvas, ctx } = data

    const point = getCanvasPoint(e, canvas)
    const prev = lastPoint.current

    if (prev) {
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }

    lastPoint.current = point
  }, [isDrawing, getContext, getCanvasPoint])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    lastPoint.current = null
  }, [])

  const validate = useCallback(async (expected: string, mode: TracingMode) => {
    const data = getContext()
    if (!data || !hasStrokes) return
    const { canvas } = data

    setState('validating')
    setError(null)

    try {
      const dataUrl = canvas.toDataURL('image/png')
      let validationResult: TracingValidationResult

      if (isGeminiAvailable()) {
        validationResult = await validateTracing(dataUrl, expected, mode)
      } else {
        validationResult = getOfflineFallbackResult()
      }

      setResult(validationResult)
      setState(validationResult.valid ? 'success' : 'error')
    } catch (err) {
      if (err instanceof GeminiValidationError && err.code === 'offline') {
        const fallback = getOfflineFallbackResult()
        setResult(fallback)
        setState('success')
      } else {
        const message = err instanceof Error ? err.message : 'Error desconocido al validar el trazo.'
        setError(message)
        setState('error')
      }
    }
  }, [getContext, hasStrokes])

  const clear = useCallback(() => {
    const data = getContext()
    if (!data) return
    const { canvas, ctx } = data
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    setResult(null)
    setError(null)
    setState('idle')
    lastPoint.current = null
  }, [getContext])

  return {
    canvasRef,
    state,
    result,
    error,
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    validate,
    clear,
    hasStrokes,
  }
}
