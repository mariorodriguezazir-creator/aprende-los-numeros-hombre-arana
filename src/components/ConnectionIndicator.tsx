import { useOnlineStatus } from '../hooks/useOnlineStatus'

export const ConnectionIndicator = () => {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/90 border border-yellow-600 text-yellow-300 text-sm font-nunito font-semibold shadow-lg"
    >
      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
      Sin conexión — trazo offline
    </div>
  )
}
