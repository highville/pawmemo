import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fbf9f5",
        surface: "#ffffff",
        "surface-soft": "#f5f3ef",
        "surface-muted": "#efeeea",
        "surface-line": "#e4e2de",
        primary: "#332920",
        "primary-soft": "#f1dfd1",
        "primary-muted": "#d4c4b6",
        secondary: "#566342",
        "secondary-soft": "#d7e5bb",
        tertiary: "#4a1d11",
        coral: "#ffb5a1",
        error: "#ba1a1a",
        outline: "#7f756e",
        ink: "#1b1c1a"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        ambient: "0 10px 20px rgba(74, 63, 53, 0.05)",
        lift: "0 18px 40px rgba(74, 63, 53, 0.12)"
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
