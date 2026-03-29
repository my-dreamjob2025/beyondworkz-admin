/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bw: {
          primary: "#2563eb",
          "primary-dark": "#1d4ed8",
          accent: "#f97316",
        },
      },
    },
  },
  plugins: [],
};
