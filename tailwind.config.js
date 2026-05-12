/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kurdish: {
          green:        '#1B7D4E',
          'green-light': '#E8F5EE',
          'green-dark':  '#145F3C',
          red:           '#E74C5E',
          'red-light':   '#F87080',
          yellow:        '#D4940A',
          'yellow-light':'#FEF3C7',
          cream:         '#FAFAF7',
          'dark-bg':     '#111827',
          'dark-card':   '#1A2535',
          'dark-border': '#2D3F55',
          sidebar:       '#1A2332',
          gold:          '#D4940A',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-kurdish':    'linear-gradient(135deg, #1B7D4E 0%, #145F3C 100%)',
        'gradient-warm':       'linear-gradient(135deg, #D4940A 0%, #B87A08 100%)',
        'gradient-sidebar':    'linear-gradient(160deg, #1A2332 0%, #1F2E44 100%)',
        'gradient-card-green': 'linear-gradient(135deg, #1B7D4E 0%, #0A4D30 100%)',
        'gradient-card-gold':  'linear-gradient(135deg, #D4940A 0%, #B87A08 100%)',
      },
      boxShadow: {
        'card':       '0 1px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)',
        'green-glow': '0 4px 20px rgba(27,125,78,0.28)',
        'gold-glow':  '0 4px 20px rgba(212,148,10,0.28)',
        'red-glow':   '0 4px 16px rgba(231,76,94,0.28)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        wave: {
          '0%':        { transform: 'rotate(0deg)' },
          '15%':       { transform: 'rotate(14deg)' },
          '30%':       { transform: 'rotate(-8deg)' },
          '45%':       { transform: 'rotate(14deg)' },
          '60%':       { transform: 'rotate(-4deg)' },
          '75%, 100%': { transform: 'rotate(0deg)' },
        },
        'xp-float': {
          '0%':   { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-48px)', opacity: '0' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)',   opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        float:          'float 3s ease-in-out infinite',
        wave:           'wave 1.5s ease-in-out',
        'xp-float':     'xp-float 1.2s ease-out forwards',
        'scale-in':     'scale-in 0.2s ease-out',
        'slide-up':     'slide-up 0.25s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer:        'shimmer 2s linear infinite',
        'confetti-fall':'confetti-fall var(--duration, 2.5s) ease-in forwards',
      },
    },
  },
  plugins: [],
}
