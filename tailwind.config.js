/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'spider-red': '#D91C1C',
        'spider-blue': '#1A3A8F',
        'spider-white': '#FFFFFF',
        'spider-dark': '#0A0A1A',
        'spider-surface': '#0F2060',
        success: '#22C55E',
        error: '#FF6B6B',
      },
      fontFamily: {
        bangers: ['"Bangers"', 'cursive'],
        nunito: ['"Nunito"', 'sans-serif'],
        fredoka: ['"Fredoka One"', '"Fredoka"', 'sans-serif'],
      },
      boxShadow: {
        spider: '0 18px 60px rgba(10, 10, 26, 0.35)',
        glow: '0 0 0 1px rgba(217, 28, 28, 0.3), 0 12px 48px rgba(217, 28, 28, 0.25)',
      },
      backgroundImage: {
        'spider-grid':
          'radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, rgba(26,58,143,0.24), rgba(10,10,26,0.96))',
      },
      backgroundSize: {
        grid: '22px 22px, 100% 100%',
      },
    },
  },
  plugins: [],
}

export default config
