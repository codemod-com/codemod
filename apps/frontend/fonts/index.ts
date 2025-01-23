import { cx } from "cva";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";

export const SansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});
export const geistMono = GeistMono;

const globalFontsVariables = cx(SansFont.className, geistMono.variable);

export default globalFontsVariables;
