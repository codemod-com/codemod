import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

const colorPalette = {
  // @TODO refine palette when design is finished
  "gray-bg": "#F0F0F0",
  "gray-bg-light": "#FFFFFF",
  "gray-lighter": "#F5F5F5",
  "gray-light": "#3D3D3D",
  "gray-light-darker": "#D9D9D9",

  "gray-dark": "#313030",
  "gray-darker": "#262525",
  "primary-light": "#598BFF",
  "primary-dark": "#274BDB",
  // Text
  "gray-text-dark-normal": colors.gray[300],
  "gray-text-normal": colors.gray[600],
  "gray-text-title": colors.gray[900],
  "gray-text-dark-title": colors.gray[100],
  highlight: "#ffff0040",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  foreground: "hsl(var(--foreground))",
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  // accent: {
  // 	DEFAULT: "hsl(var(--accent))",
  // 	foreground: "hsl(var(--accent-foreground))",
  // 	pressed: "hsl(var(--accent-pressed))",
  // },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  accent: "#D6FF62",
  background: {
    DEFAULT: "hsl(var(--background))",
    light: "#0B151E1A",
    dark: "#0B151E",
  },
  primary: {
    DEFAULT: "#3366FF",
    light: "#0B151E",
    dark: "#FFFFFF",
  },
  primaryHover: {
    light: "#323A41",
    dark: "#FFFFFFE5",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
    light: "#0B151E99",
    dark: "#FFFFFF99",
  },
  tertiary: {
    light: "#0B151E66",
    dark: "#FFFFFF59",
  },
  border: {
    DEFAULT: "hsl(var(--border))",
    light: "#0B151E1A",
    dark: "#FFFFFF26",
  },
  emphasis: {
    light: "#0B151E0D",
    dark: "#FFFFFF1A",
  },
  success: {
    light: "#A2DB00",
    dark: "#A2DB00",
  },
  successSecondary: {
    light: "#A2DB0026",
    dark: "#A2DB0033",
  },
  error: {
    light: "#EF0000",
    dark: "#FF3333",
  },
  errorSecondary: {
    light: "#EF00001A",
    dark: "#211820",
  },
  info: {
    light: "#00A0E4",
    dark: "#00A0E4",
  },
  infoSecondary: {
    light: "#00A0E426",
    dark: "#00A0E433",
  },
  warning: {
    DEFAULT: "#ff9800",
    light: "#FEA800",
    dark: "#FEA800",
  },
  warningSecondary: {
    light: "#FEA80026",
    dark: "#FEA80033",
  },
};

const colorsT = {
  accent: "#D6FF62",
  background: {
    light: "#0B151E1A",
    dark: "#0B151E",
  },
  primary: {
    light: "#0B151E",
    dark: "#FFFFFF",
  },
  primaryHover: {
    light: "#323A41",
    dark: "#FFFFFFE5",
  },
  secondary: {
    light: "#0B151E99",
    dark: "#FFFFFF99",
  },
  tertiary: {
    light: "#0B151E66",
    dark: "#FFFFFF59",
  },
  border: {
    light: "#0B151E1A",
    dark: "#FFFFFF26",
  },
  emphasis: {
    light: "#0B151E0D",
    dark: "#FFFFFF1A",
  },
  success: {
    light: "#A2DB00",
    dark: "#A2DB00",
  },
  successSecondary: {
    light: "#A2DB0026",
    dark: "#A2DB0033",
  },
  error: {
    light: "#EF0000",
    dark: "#FF3333",
  },
  errorSecondary: {
    light: "#EF00001A",
    dark: "#211820",
  },
  info: {
    light: "#00A0E4",
    dark: "#00A0E4",
  },
  infoSecondary: {
    light: "#00A0E426",
    dark: "#00A0E433",
  },
  warning: {
    light: "#FEA800",
    dark: "#FEA800",
  },
  warningSecondary: {
    light: "#FEA80026",
    dark: "#FEA80033",
  },
};
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./intro-template/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...defaultTheme,

    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      gradient: {
        to: {
          backgroundPosition: "var(--bg-size) 0",
        },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      gradient: "gradient 8s linear infinite",
    },
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
      colors: colorPalette,
      fontFamily: {
        regular: "var(--font-sans)",
        medium: "var(--font-sans)",
        bold: "var(--font-sans)",
        mono: ["var(--font-geist-mono)"],
      },
      fontSize: {
        xlHeading: [
          "60px",
          {
            fontWeight: "700",
            lineHeight: "64px",
            letterSpacing: "-1.8px",
          },
        ],
        xlHeadingMobile: [
          "40px",
          {
            fontWeight: "700",
            lineHeight: "44px",
            letterSpacing: "-1.2px",
          },
        ],
        lgHeading: [
          "40px",
          {
            fontWeight: "700",
            lineHeight: "48px",
            letterSpacing: "-1.2px",
          },
        ],
        lgHeadingMobile: [
          "32px",
          {
            fontWeight: "700",
            lineHeight: "40px",
            letterSpacing: "-0.96px",
          },
        ],
        mdHeading: [
          "28px",
          {
            fontWeight: "700",
            lineHeight: "36px",
            letterSpacing: "-0.96px",
          },
        ],
        mdHeadingMobile: [
          "24px",
          {
            fontWeight: "700",
            lineHeight: "32px",
            letterSpacing: "-0.96px",
          },
        ],
        smHeading: [
          "20px",
          {
            fontWeight: "700",
            lineHeight: "26px",
            letterSpacing: "-0.4px",
          },
        ],
        smHeadingMobile: [
          "16px",
          {
            fontWeight: "700",
            lineHeight: "24px",
            letterSpacing: "-0.32px",
          },
        ],
        xsHeading: [
          "18px",
          {
            fontWeight: "700",
            lineHeight: "26px",
          },
        ],
        bodyLgMedium: [
          "18px",
          {
            fontWeight: "500",
            lineHeight: "26px",
          },
        ],
        bodyLgRegular: [
          "18px",
          {
            fontWeight: "400",
            lineHeight: "27px",
          },
        ],
        bodyMdMedium: [
          "16px",
          {
            fontWeight: "500",
            lineHeight: "24px",
          },
        ],
        bodyMdRegular: [
          "16px",
          {
            fontWeight: "400",
            lineHeight: "24px",
          },
        ],
        bodySmMedium: [
          "14px",
          {
            fontWeight: "500",
            lineHeight: "20px",
            letterSpacing: "0.14px",
          },
        ],
        bodySmRegular: [
          "14px",
          {
            fontWeight: "400",
            lineHeight: "20px",
            letterSpacing: "0.14px",
          },
        ],
        bodyXsMedium: [
          "12px",
          {
            fontWeight: "500",
            lineHeight: "16px",
            letterSpacing: "0.12px",
          },
        ],
        bodyXsRegular: [
          "12px",
          {
            fontWeight: "400",
            lineHeight: "16px",
            letterSpacing: "0.12px",
          },
        ],
        code: [
          "14px",
          {
            fontWeight: "400",
            lineHeight: "20px",
          },
        ],
        codeMobile: [
          "14px",
          {
            fontWeight: "400",
            lineHeight: "20px",
          },
        ],
        tag: [
          "11px",
          {
            fontWeight: "400",
            lineHeight: "1",
            letterSpacing: "1.1px",
          },
        ],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        s: "16px",
        m: "24px",
        l: "32px",
        xl: "32px",
        "2xl": "60px",
        xxxl: "64px",
      },
      content: {
        check: 'url("/icons/check.svg")',
      },
      animation: {
        spin: "spin 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flip-x": "flip-x .6s cubic-bezier(0, 0, 0.58, 1)",
        slideDownAndFade:
          "slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in":
          "fade-in var(--fade-in-duration, 200ms) cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left": "slideLeft infinite 60s linear",
        "slide-right": "slideRight infinite 60s linear",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        slideLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },

        "flip-x": {
          "0%": {
            transform: "rotateY(0deg), translateZ(0)",
          },
          "100%": {
            transform: "rotateY(-180deg) translateZ(2px)",
          },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
} satisfies Config;
