/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo-500
          dark: '#4F46E5',   // Indigo-600
          light: '#A5B4FC',  // Indigo-300
        },
        accent: {
          DEFAULT: '#F59E42', // Orange-400
          dark: '#EA580C',   // Orange-600
          light: '#FED7AA',  // Orange-200
        },
        background: '#F8FAFC', // Slate-50
        foreground: '#171717', // Neutral-900
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
