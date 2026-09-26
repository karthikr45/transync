import type { Config } from "tailwindcss";
import standards from "./UI-STANDARDS.json";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: standards.designTokens.brand,
      },
    },
  },
  plugins: [],
};
export default config;
