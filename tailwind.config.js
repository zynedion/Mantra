/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          bubble: 'rgba(18, 18, 24, 0.95)',
          settings: '#0f0f14',
          input: '#1a1a24',
          card: '#1e1e2a',
          hover: '#252533',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#9090a8',
          muted: '#55556a',
          original: '#c8c8e0',
        },
        accent: {
          DEFAULT: '#5b8cf5',
          hover: '#7aa3ff',
          dim: 'rgba(91, 140, 245, 0.15)',
        },
        ai: {
          DEFAULT: '#a855f7',
          hover: '#c084fc',
          dim: 'rgba(168, 85, 247, 0.15)',
        },
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '13px',
        md: '14px',
        lg: '16px',
        xl: '20px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.3',
        normal: '1.5',
      },
      boxShadow: {
        bubble: '0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)',
        settings: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 24px rgba(0, 0, 0, 0.5)',
        button: '0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
