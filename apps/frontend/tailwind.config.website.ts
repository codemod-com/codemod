import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
	darkMode: "selector",
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./intro-template/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		...defaultTheme,
		extend: {
			colors: {
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
			},
			fontFamily: {
				regular: "var(--satoshi-regular)",
				medium: "var(--satoshi-medium)",
				bold: "var(--satoshi-bold)",
				mono: ["var(--inconsolata)"],
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
					"32px",
					{
						fontWeight: "700",
						lineHeight: "40px",
						letterSpacing: "-0.96px",
					},
				],
				mdHeadingMobile: [
					"24px",
					{
						fontWeight: "700",
						lineHeight: "32px",
						letterSpacing: "-0.72px",
					},
				],
				smHeading: [
					"24px",
					{
						fontWeight: "700",
						lineHeight: "32px",
						letterSpacing: "-0.72px",
					},
				],
				smHeadingMobile: [
					"20px",
					{
						fontWeight: "700",
						lineHeight: "28px",
						letterSpacing: "-0.6px",
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
						lineHeight: "26px",
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
				"flip-x": "flip-x .6s cubic-bezier(0, 0, 0.58, 1)",
				slideDownAndFade:
					"slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				"fade-in":
					"fade-in var(--fade-in-duration, 200ms) cubic-bezier(0.16, 1, 0.3, 1)",
				"fade-out": "fade-out 200ms cubic-bezier(0.16, 1, 0.3, 1)",
				"slide-left": "slideLeft infinite 60s linear",
				"slide-right": "slideRight infinite 60s linear",
			},
			keyframes: {
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
	plugins: [require("@tailwindcss/typography")],
} satisfies Config;
