import type { ChalkInstance } from "chalk";
import wrapAnsi from "wrap-ansi";

export function colorLongString(
  text: string,
  color: ChalkInstance,
  columns?: number,
) {
  return color(wrapAnsi(text, columns ?? 60, { hard: true }));
}
