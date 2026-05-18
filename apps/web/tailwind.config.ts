import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: "#0077cc", 600: "#0066b3" },
        surface: { DEFAULT: "#0f172a", raised: "#1e293b", border: "#334155" },
      },
      fontFamily: { mono: ["JetBrains Mono", "Fira Code", "monospace"] },
    },
  },
  plugins: [],
};
export default config;
