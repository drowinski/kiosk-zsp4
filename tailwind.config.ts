import type { Config } from 'tailwindcss';

export default {
  content: ['./src/{app,components,features/*/components}/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        screens: {
          '2xl': '1024px'
        }
      },
      colors: {
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--color-muted))'
        },
        card: {
          DEFAULT: 'hsl(var(--color-card))',
          foreground: 'hsl(var(--color-card-foreground))'
        },
        danger: 'hsl(var(--color-danger))'
      },
      fontFamily: {
        sans: [
          '"Nunito"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      },
      keyframes: {
        'scale-in': {
          '0%': { scale: '95%' },
          '100%': { scale: '100%' }
        },
        'fade-in': {
          '0%': { opacity: '0%' },
          '100%': { opacity: '100%' }
        }
      },
      animation: {
        'gallery-detail-scale-in': 'scale-in 50ms ease-in-out',
        'gallery-detail-fade-in': 'fade-in 50ms linear'
      }
    }
  },
  plugins: []
} satisfies Config;
