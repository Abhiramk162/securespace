import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        navy: {
          950: '#0A1018',
          900: '#101820',
          800: '#18232D',
          700: '#202C37',
          600: '#2A3A48',
          500: '#374959',
        },
        emerald: {
          DEFAULT: '#20B486',
          light: '#27C996',
          dark: '#189970',
          muted: '#20B48620',
        },
        cyan: {
          DEFAULT: '#48C8D5',
          light: '#5ED6E2',
          dark: '#38B4C0',
          muted: '#48C8D520',
        },
        // Severity colors
        critical: '#EF4444',
        high: '#F97316',
        medium: '#EAB308',
        low: '#3B82F6',
        info: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'radial-gradient(ellipse 80% 50% at 50% -20%, #20B48620, transparent)',
        'gradient-card': 'linear-gradient(135deg, #202C37 0%, #18232D 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #20B486 0%, #48C8D5 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #20B48640' },
          '100%': { boxShadow: '0 0 20px #20B48680' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4)',
        'emerald': '0 0 20px rgba(32,180,134,0.3)',
        'cyan': '0 0 20px rgba(72,200,213,0.3)',
      },
      borderColor: {
        DEFAULT: '#2A3A48',
      },
    },
  },
  plugins: [],
};

export default config;
