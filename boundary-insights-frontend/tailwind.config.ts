import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Courier New"', 'monospace'],
      },
      colors: {
        background: "#020617",
        surface: "#020617",
        card: "#020617",
        primary: {
          DEFAULT: "#22c55e",
          foreground: "#020617"
        },
        accent: {
          DEFAULT: "#22c55e"
        },
        // Modern Dashboard colors
        green: {
          primary: '#0F6D4E',
          dark: '#145C44',
          light: '#2FBF8F',
          soft: '#E6F4EF',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    }
  },
  plugins: []
};

export default config;

