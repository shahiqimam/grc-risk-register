import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16202a',
        muted: '#667085',
        panel: '#ffffff',
        line: '#d8dee5',
        accent: '#0f766e',
        warning: '#b45309',
        danger: '#b42318'
      }
    }
  },
  plugins: []
};

export default config;
