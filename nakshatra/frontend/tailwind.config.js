/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000511',
        cosmos: '#020B18',
        nebula: '#061628',
        stardust: '#0D2137',
        saffron: '#FF6B00',
        gold: '#FFB347',
        goldenrod: '#DAA520',
        amber: '#FFBF00',
        champagne: '#F7E7CE',
        celestial: '#6B21A8',
        astral: '#9333EA',
        ethereal: '#C084FC',
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        devanagari: ['"Noto Serif Devanagari"', 'serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at center, #061628 0%, #000511 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #FFB347 0%, #DAA520 50%, #FF6B00 100%)',
        'aurora-glow': 'linear-gradient(135deg, #6B21A8 0%, #2563EB 50%, #0D9488 100%)',
        'card-surface': 'linear-gradient(135deg, #0D2137 0%, #061628 100%)',
        'saffron-dawn': 'linear-gradient(180deg, #FF6B00 0%, #FFB347 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(255, 179, 71, 0.4)',
        'cosmic-glow': '0 0 30px rgba(147, 51, 234, 0.3)',
        'card-depth': '0 4px 24px rgba(0, 0, 0, 0.6)',
        'saffron-glow': '0 0 25px rgba(255, 107, 0, 0.5)',
      },
      animation: {
        'cosmic-pulse': 'pulse 3s ease-in-out infinite',
        'star-twinkle': 'twinkle 4s ease-in-out infinite alternate',
        'mandala-spin': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 179, 71, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 179, 71, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
