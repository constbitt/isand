import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
          'fade-in': {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
          'fade-out': {
              '0%': { opacity: '1' },
              '100%': { opacity: '0' },
          },
      },
      animation: {
          'fade-in': 'fade-in 1s ease-in-out',
          'fade-out': 'fade-out 1s ease-in-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          dark: '#656565',
          light: '#F6F6F6',
        },
        ice: '#FCFCFC',
        red: '#FF0000',
        blue: {
          main: '#1b4596',
          light: "rgb(34, 139, 230)"
        },
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
    },
  },
  plugins: [],
}
export default config
