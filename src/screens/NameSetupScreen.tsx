import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useStore'
import { Button } from '../components/Button'
import { animatePageIn } from '../lib/animations'

export const NameSetupScreen = () => {
  const navigate = useNavigate()
  const setChildName = useAppStore((s) => s.setChildName)
  const [name, setName] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pageRef.current) animatePageIn(pageRef.current)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setChildName(trimmed)
    void navigate('/home', { replace: true })
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#0A0A1A] flex flex-col items-center justify-center px-6 gap-8"
    >
      <div className="text-6xl" aria-hidden="true">🕷️</div>

      <div className="text-center space-y-2">
        <h1 className="font-bangers text-4xl text-spider-red tracking-wider">
          ¡Bienvenido!
        </h1>
        <p className="font-nunito text-white/70 text-base">
          ¿Cómo te llamás, héroe?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre..."
          maxLength={20}
          autoFocus
          className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-3 font-nunito text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-spider-red transition-colors"
          aria-label="Ingresá tu nombre"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!name.trim()}
          className="w-full"
        >
          ¡Empezar! 🚀
        </Button>
      </form>
    </div>
  )
}
