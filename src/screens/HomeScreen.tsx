import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useStore'
import { NumberTile } from '../components/NumberTile'
import { ProgressBar } from '../components/ProgressBar'
import { ConnectionIndicator } from '../components/ConnectionIndicator'
import { animatePageIn, animateStagger } from '../lib/animations'
import { SpiderWebDecor } from '../components/SpiderWebDecor'

export const HomeScreen = () => {
  const navigate = useNavigate()
  const childName = useAppStore((s) => s.childName)
  const numbers = useAppStore((s) => s.numbers)
  const currentNumber = useAppStore((s) => s.currentNumber)
  const pageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pageRef.current) animatePageIn(pageRef.current)
    if (gridRef.current) {
      const tiles = gridRef.current.querySelectorAll('button')
      animateStagger(Array.from(tiles), 0.03)
    }
  }, [])

  const handleTileClick = (number: number) => {
    void navigate(`/tracing/${number}`)
  }

  return (
    <div ref={pageRef} className="relative overflow-hidden min-h-screen bg-[#0A0A1A] flex flex-col px-4 py-6">
      <SpiderWebDecor corner="top-left" size={110} opacity={0.10} />
      <SpiderWebDecor corner="top-right" size={110} opacity={0.10} />
      <SpiderWebDecor corner="bottom-left" size={110} opacity={0.10} />
      <SpiderWebDecor corner="bottom-right" size={110} opacity={0.10} />

      <ConnectionIndicator />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-bangers text-3xl text-spider-red tracking-wider">
            Hola, {childName || 'héroe'} 🕷️
          </h1>
          <p className="font-nunito text-white/60 text-sm">Elegí un número</p>
        </div>
        <div className="text-4xl" aria-hidden="true">🕷️</div>
      </div>

      <div className="mb-6">
        <ProgressBar numbers={numbers} />
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-5 gap-3 place-items-center"
        role="list"
        aria-label="Números del 1 al 50"
      >
        {numbers.map((progress) => (
          <div key={progress.number} role="listitem">
            <NumberTile
              progress={progress}
              isCurrent={progress.number === currentNumber}
              onClick={handleTileClick}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
