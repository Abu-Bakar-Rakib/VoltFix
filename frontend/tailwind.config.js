/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        volt: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // High-Voltage Radiant Amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          accent: '#06b6d4', // Cyber Electric Cyan
        },
        electric: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Electric Surge Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        cobalt: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          bg: '#080C14', // Deep Obsidian Celestial
          surface: '#0D1322',
          card: '#121A2D',
          cardHover: '#18233C',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Hind Siliguri"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Sora', '"Plus Jakarta Sans"', '"Hind Siliguri"', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-volt': '0 0 25px -4px rgba(245, 158, 11, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.5)',
        'glow-electric': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'card': '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 16px 36px -8px rgba(15, 23, 42, 0.12)',
        'card-dark': '0 12px 30px -10px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
};
