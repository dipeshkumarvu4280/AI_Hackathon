/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        root: '#EEF3FA',
        bgsec: '#F1F5F9',
        surface: {
          DEFAULT: '#FFFFFF',
          primary: '#F8FAFC',
          secondary: '#F1F5F9',
          softBlue: '#E8F0FE',
          elevated: '#F8FAFC',
          hover: '#F1F5F9',
        },
        border: {
          DEFAULT: '#CBD5E1',
          subtle: '#E2E8F0',
          hover: '#94A3B8',
        },
        sidebar: {
          bg: '#FFFFFF',
          border: '#CBD5E1',
        },
        accent: {
          primary: '#2563EB',
          secondary: '#0D9488',
          hover: '#1D4ED8',
        },
        txt: {
          primary: '#14213D',
          heading: '#14213D',
          section: '#172554',
          card: '#1E293B',
          body: '#334155',
          secondary: '#475569',
          muted: '#64748B',
          disabled: '#94A3B8',
        },
        brand: {
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
          950: '#14213d',
        },
        navy: {
          950: '#14213D',
          900: '#1E293B',
          850: '#334155',
          800: '#475569',
          750: '#64748B',
          700: '#94A3B8',
        },
        slate: {
          850: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        '3d-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        '3d-md': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
        '3d-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
        '3d-hover': '0 10px 25px -5px rgba(37, 99, 235, 0.08), 0 8px 10px -6px rgba(37, 99, 235, 0.04)',
        'glow-brand': '0 4px 14px rgba(37, 99, 235, 0.15)',
        'glow-indigo': '0 4px 14px rgba(99, 102, 241, 0.15)',
        'glow-cyan': '0 4px 14px rgba(13, 148, 136, 0.15)',
        'glow-emerald': '0 4px 14px rgba(22, 163, 74, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
