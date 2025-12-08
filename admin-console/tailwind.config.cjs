/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#1a1a1a',
        },
        brand: {
          forest: '#1a330b',
          'forest-light': '#2a4a1b',
          accent: '#52991f',
          'accent-light': '#6bb32f',
          'accent-dark': '#3d7216',
        },
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
        },
      },
      borderRadius: {
        'card': '0.75rem',
        'card-lg': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1a330b 0%, #52991f 100%)',
        'gradient-accent': 'linear-gradient(135deg, #52991f 0%, #6bb32f 100%)',
      },
    },
  },
  plugins: [],
}
