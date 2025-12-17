/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        substrate: 'hsl(240, 5%, 8%)',
        surface: 'hsla(240, 5%, 12%, 0.8)',
        border: 'hsla(0, 0%, 100%, 0.08)',
        'text-primary': 'hsl(0, 0%, 90%)',
        'text-muted': 'hsl(0, 0%, 50%)',
        'mach-1': '#00F0FF',
        'mach-2': '#FFC107',
        'mach-3': '#FF5722',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        data: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
};

