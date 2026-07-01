import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Class-based dark mode — toggled via a "dark" class on <html>
  darkMode: 'class',
  theme: {
    extend: {
      // ---- Custom Font Families ----
      fontFamily: {
        sans:        ['Inter', 'system-ui', 'sans-serif'],
        handwritten: ['Patrick Hand', 'cursive'],
        caveat:      ['Caveat', 'cursive'],
      },

      // ---- Extended Colour Palette ----
      colors: {
        // Paper / parchment tones
        paper: {
          50:  '#fdfcf7',
          100: '#faf8f0',
          200: '#f3f0e6',
          300: '#e8e4d8',
          400: '#d4cfc0',
        },
        // Severity
        severity: {
          low:      '#22c55e',
          moderate: '#f59e0b',
          high:     '#ef4444',
        },
        // Urgency
        urgency: {
          selfCare:    '#3b82f6',
          visitDoctor: '#f59e0b',
          emergency:   '#dc2626',
        },
        // Sketch ink
        ink: {
          dark:   '#1e293b',
          mid:    '#475569',
          light:  '#94a3b8',
        },
      },

      // ---- Shadows ----
      boxShadow: {
        sketch:    '4px 5px 0px rgba(0,0,0,0.10)',
        'sketch-md':'5px 6px 0px rgba(0,0,0,0.12)',
        'sketch-lg':'6px 8px 0px rgba(0,0,0,0.14)',
        'sketch-xl':'8px 12px 0px rgba(0,0,0,0.16)',
        'sketch-dark':'4px 5px 0px rgba(0,0,0,0.40)',
      },

      // ---- Border Radii ----
      borderRadius: {
        sketch: '255px 15px 225px 15px/15px 225px 15px 255px',
        'sketch-b': '15px 225px 15px 255px/255px 15px 225px 15px',
      },

      // ---- Animations ----
      animation: {
        'wobble':       'wobble 3.5s ease-in-out infinite',
        'wobble-slow':  'wobble 5s ease-in-out infinite',
        'pop-in':       'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up':     'slide-up-fade 0.5s ease-out forwards',
        'draw-in':      'draw-in 0.8s ease forwards',
        'fade-in':      'fade-in 0.4s ease forwards',
        'spin-slow':    'spin 3s linear infinite',
        'bounce-dot':   'bounce-dot 1.2s ease-in-out infinite',
        'pulse-gentle': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      // ---- Keyframes ----
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%':       { transform: 'rotate(1deg)'  },
        },
        'pop-in': {
          '0%':   { transform: 'scale(0.85) rotate(-3deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.05) rotate(1deg)',  opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)',     opacity: '1' },
        },
        'slide-up-fade': {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'draw-in': {
          from: { 'clip-path': 'inset(0 100% 0 0)' },
          to:   { 'clip-path': 'inset(0 0% 0 0)'   },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.4' },
          '40%':           { transform: 'scale(1)', opacity: '1'   },
        },
      },
    },
  },
  plugins: [],
}

export default config
