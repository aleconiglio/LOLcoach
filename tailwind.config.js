/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hextech: {
          black: '#010a13',
          dark: '#091428',
          navy: '#0a1428',
          blue: '#0e1f40',
          card: '#0a172c',
          gold: '#c8aa6e',
          'gold-light': '#f0e6d2',
          'gold-dark': '#785a28',
          'gold-bright': '#f0b232',
          accent: '#005a82',
          cyan: '#00a0ba',
          danger: '#e84057',
          success: '#12b260',
          warning: '#ff9900',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hextech-gold': '0 0 15px rgba(200, 170, 110, 0.3)',
        'hextech-cyan': '0 0 15px rgba(0, 160, 186, 0.4)',
        'hextech-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'hextech-gradient': 'linear-gradient(135deg, #091428 0%, #0a1428 50%, #010a13 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f0e6d2 0%, #c8aa6e 50%, #785a28 100%)',
      }
    },
  },
  plugins: [],
}
