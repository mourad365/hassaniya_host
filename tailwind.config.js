/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './client/index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Sand scale (warm neutrals)
        sand: {
          50: 'hsl(var(--sand-50))',
          100: 'hsl(var(--sand-100))',
          200: 'hsl(var(--sand-200))',
          300: 'hsl(var(--sand-300))',
          400: 'hsl(var(--sand-400))',
          500: 'hsl(var(--sand-500))',
          600: 'hsl(var(--sand-600))',
          700: 'hsl(var(--sand-700))',
          800: 'hsl(var(--sand-800))',
          900: 'hsl(var(--sand-900))',
        },
        // Desert scale (warm earth tones)
        desert: {
          50: 'hsl(var(--desert-50))',
          100: 'hsl(var(--desert-100))',
          200: 'hsl(var(--desert-200))',
          300: 'hsl(var(--desert-300))',
          400: 'hsl(var(--desert-400))',
          500: 'hsl(var(--desert-500))',
          600: 'hsl(var(--desert-600))',
          700: 'hsl(var(--desert-700))',
          800: 'hsl(var(--desert-800))',
          900: 'hsl(var(--desert-900))',
        },
        // Heritage Colors
        heritage: {
          gold: 'hsl(var(--heritage-gold))',
          blue: 'hsl(var(--oasis-blue))',
          black: 'hsl(var(--tent-black))',
          brown: 'hsl(var(--deep-brown))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        arabic: 'var(--font-arabic)',
        'modern-arabic': 'var(--font-modern-arabic)',
        sans: 'var(--font-sans)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
