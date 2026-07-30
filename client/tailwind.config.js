/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        ink: 'var(--ink)',
        accent: 'var(--accent)',
        'accent-secondary': 'var(--accent-secondary)',
        surface: 'var(--surface)',
        border: 'var(--border)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        brutal: '4px 4px 0px var(--border)',
        'brutal-sm': '2px 2px 0px var(--border)',
        'brutal-lg': '6px 6px 0px var(--border)',
        'brutal-accent': '4px 4px 0px var(--accent)',
      },
    },
  },
  plugins: [],
};
