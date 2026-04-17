import { useState } from 'react'

interface YouTubeEmbedProps {
  videoId: string
  title: string
  autoplay?: boolean
  fillContainer?: boolean
}

export const YouTubeEmbed = ({ videoId, title, autoplay = false, fillContainer = false }: YouTubeEmbedProps) => {
  const [loaded, setLoaded] = useState(false)

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`

  return (
    <div
      className={[
        'relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-white/10',
        fillContainer ? 'h-full w-full' : 'w-full aspect-video',
      ].join(' ')}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-spider-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        className={['w-full h-full transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0'].join(' ')}
      />
    </div>
  )
}
