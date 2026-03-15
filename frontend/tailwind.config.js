/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#050505",
          dark: "#0a0a0b",
          gray: "#1a1a1c",
          cyan: "#00f3ff",
          magenta: "#ff00ff",
          yellow: "#f3ff00",
          blue: "#0062ff",
          purple: "#7000ff",
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00f3ff, 0 0 20px #00f3ff',
        'neon-magenta': '0 0 5px #ff00ff, 0 0 20px #ff00ff',
        'neon-blue': '0 0 5px #0062ff, 0 0 20px #0062ff',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #050505 0%, #1a1a1c 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00f3ff 0%, #ff00ff 100%)',
      },
      animation: {
        'glitch': 'glitch 1s infinite linear alternate-reverse',
        'pulse-neon': 'pulse-neon 2s infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.8, filter: 'brightness(1.5)' },
        }
      }
    },
  },
  plugins: [],
}
