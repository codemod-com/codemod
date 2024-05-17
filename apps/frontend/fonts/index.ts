import { cx } from "cva";
import localFont from "next/font/local";

let satoshiRegular = localFont({
  src: "./Satoshi-Regular.woff2",
  display: "swap",
  variable: "--satoshi-regular",
  weight: "400",
});

let satoshiMedium = localFont({
  src: "./Satoshi-Medium.woff2",
  display: "swap",
  variable: "--satoshi-medium",
  weight: "500",
});

let satoshiBold = localFont({
  src: "./Satoshi-Bold.woff2",
  display: "swap",
  variable: "--satoshi-bold",
  weight: "700",
});

let globalFontsVariables = cx(
  satoshiRegular.variable,
  satoshiMedium.variable,
  satoshiBold.variable,
);

export default globalFontsVariables;
