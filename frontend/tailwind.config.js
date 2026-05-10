/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        traffic: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#ef4444',
        },
        incident: {
          reported: '#f59e0b',
          in_progress: '#3b82f6',
          resolved: '#10b981',
        }
      }
    },
  },
  plugins: [],
}