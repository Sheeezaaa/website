/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fd',
          100: '#e0ebfb',
          200: '#bfd6f7',
          300: '#8eb8f1',
          400: '#5593e9',
          500: '#2d72df',
          600: '#1b56c4',
          700: '#1544a0',
          800: '#143b83',
          900: '#0a1a3a',
          950: '#040b1b',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          accent: '#d4af37',
          light: '#f9e79f',
          dark: '#9a7b1c',
        },
      },
      fontFamily: {
        heading: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-metallic': 'linear-gradient(135deg, #FFF2B2 0%, #D4AF37 50%, #AA7C11 100%)',
        'navy-radial': 'radial-gradient(circle at 50% 20%, #1544a0 0%, #040b1b 80%)',
      },
      boxShadow: {
        'gold-sm': '0 0 15px -3px rgba(212, 175, 55, 0.3)',
        'gold-md': '0 0 25px -4px rgba(212, 175, 55, 0.45)',
        'gold-lg': '0 10px 40px -10px rgba(212, 175, 55, 0.5)',
        'navy-card': '0 10px 30px -5px rgba(4, 11, 27, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
