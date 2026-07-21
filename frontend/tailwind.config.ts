import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'ring-pulse': {
          '0%': { transform: 'scale(0.55)', opacity: '0.55' },
          '80%': { opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        'drift-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(6deg)' },
        },
        'drift-slower': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-5deg)' },
        },
      },
      animation: {
        'ring-pulse': 'ring-pulse 3.9s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        'drift-slow': 'drift-slow 9s ease-in-out infinite',
        'drift-slower': 'drift-slower 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;