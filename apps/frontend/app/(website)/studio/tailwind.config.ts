import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    maxHeight: {
      "1/3": "33.3%",
    },
    extend: {
      zIndex: {
        1: "1",
        // add 10,000 to avoid conflicts with other libraries
        10000: "10000",
      },
      colors: {
        // @TODO refine palette when design is finished
        "gray-bg": "#F0F0F0",
        "gray-bg-light": "#FFFFFF",
        "gray-lighter": "#F5F5F5",
        "gray-light": "#3D3D3D",
        "gray-light-darker": "#D9D9D9",

        "gray-dark": "#313030",
        "gray-darker": "#262525",
        primary: "#3366FF",
        "primary-light": "#598BFF",
        "primary-dark": "#274BDB",
        // Text
        "gray-text-dark-normal": colors.gray[300],
        "gray-text-normal": colors.gray[600],
        "gray-text-title": colors.gray[900],
        "gray-text-dark-title": colors.gray[100],
        highlight: "#ffff0040",
        warning: "#ff9800",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          pressed: "hsl(var(--accent-pressed))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
