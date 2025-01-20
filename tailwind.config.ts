import type { Config } from 'tailwindcss';

export default {
  content: ['./src/{app,components,features/*/components}/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        screens: {
          '2xl': '1280px'
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
      }
    }
  },
  plugins: []
} satisfies Config;
