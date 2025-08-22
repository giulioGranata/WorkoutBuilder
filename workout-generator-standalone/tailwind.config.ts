import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          300: "hsl(220 14% 83%)",
          400: "hsl(220 9% 66%)",
          500: "hsl(220 9% 46%)",
          600: "hsl(220 9% 26%)",
          700: "hsl(220 13% 18%)",
          850: "hsl(222 84% 5%)",
          900: "hsl(224 71% 4%)",
        },
        emerald: {
          500: "hsl(160 84% 39%)",
          600: "hsl(158 64% 52%)",
          700: "hsl(158 64% 42%)",
        },
        blue: {
          500: "hsl(221 83% 53%)",
          600: "hsl(221 83% 53%)",
          700: "hsl(221 83% 43%)",
        },
        yellow: {
          500: "hsl(48 96% 53%)",
        },
        purple: {
          500: "hsl(271 81% 56%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;