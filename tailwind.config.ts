import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fff8ef",
        surface: "#fffdf8",
        "surface-soft": "#fff3e5",
        "surface-muted": "#f7eadb",
        "surface-line": "#ead9c5",
        primary: "#4a2f22",
        "primary-soft": "#f7dcc7",
        "primary-muted": "#d9bda6",
        secondary: "#6f7f52",
        "secondary-soft": "#e4efc8",
        tertiary: "#8b4a35",
        coral: "#ffad93",
        error: "#ba1a1a",
        outline: "#8a7464",
        ink: "#3a2a22"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        ambient: "0 12px 30px rgba(121, 82, 52, 0.07)",
        lift: "0 22px 55px rgba(121, 82, 52, 0.16)"
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
