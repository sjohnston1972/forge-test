/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        pulseglow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        slidein: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseglow: 'pulseglow 1.6s ease-in-out infinite',
        slidein: 'slidein 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
