/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        macblue: {
          DEFAULT: "#0A84FF",
          hover: "#1E90FF",
        },
        success: "#32D74B",
        warning: "#FF9F0A",
        danger: "#FF453A",
      },
      borderRadius: {
        window: "24px",
        card: "18px",
        btn: "12px",
        input: "12px",
      },
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        macos: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      transitionDuration: {
        hover: "120ms",
        layout: "220ms",
        modal: "260ms",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        glow: "0 0 0 4px rgba(10,132,255,0.18)",
      },
    },
  },
  plugins: [],
};
