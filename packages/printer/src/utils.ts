import type { ChalkInstance } from "chalk";

export function colorLongString(text: string, color: ChalkInstance) {
  const lines = text.split("\n");
  return lines.map((line) => color(line)).join("\n");
}
