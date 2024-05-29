import type { ChalkInstance } from "chalk";
import wrapAnsi from "wrap-ansi";

export function colorLongString(text: string, color: ChalkInstance) {
  return color(wrapAnsi(text, 60, { hard: true }));
}
