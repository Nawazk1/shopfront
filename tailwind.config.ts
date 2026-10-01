import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#215844',
          dark: '#173f31',
        },
        accent: '#df7655',
        ink: '#202923',
        canvas: '#f5f5f0',
      },
    },
  },
  plugins: [],
};

export default config;
