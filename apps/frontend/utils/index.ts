import { type ClassValue, clsx } from "clsx";
import { any, flip, includes } from "ramda";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const anyElementExists = <T = string>(arrayA: T[], arrayB: T[]) =>
  any(flip(includes)(arrayA), arrayB);

export { cn };
export * from "./getBlocksToc";
export * from "./getImageProps";
export * from "./openLink";
