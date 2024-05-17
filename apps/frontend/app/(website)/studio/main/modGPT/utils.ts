import type { Aliases } from "@studio/store/zustand/CFS/alias";
import {
  autoGenerateCodemodPrompt,
  fixCodemodBlockNoDebugInfoPrompt,
} from "@studio/store/zustand/CFS/prompts";
import { useCodemodExecutionError } from "@studio/store/zustand/log";
import toast from "react-hot-toast";
import { shouldUseCodemodAi } from "./config";

const errorResponses = {
  400: "The request you made could not be completed.",
  401: "You are unauthorized to make this request.",
  403: "You are not allowed to make this request.",
  429: "You have exceeded the available request quota. Please resume after one minute.",
  500: "The server has encountered an error. Please retry later.",
} as const;

type ErrorCodes = keyof typeof errorResponses;

export function onResponse(response: Response) {
  const errorMessage = errorResponses[response.status as ErrorCodes];
  if (errorMessage) {
    toast.error(errorMessage);
  }
}

export const buildCodemodFromLLMResponse = (
  LLMResponse: string,
): string | null => {
  const CODE_BLOCK_REGEXP = /```typescript(.+?)```/gs;
  const match = CODE_BLOCK_REGEXP.exec(LLMResponse);

  if (match === null || match.length < 1) {
    return null;
  }

  return match.at(1)?.trim() ?? null;
};

export const getOrderedAliasList = (aliases: Aliases) =>
  Object.entries(aliases)
    .filter(([, alias]) => alias !== null)
    .sort(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0))
    .map(([key, value]) => [key, value?.value ?? ""]);

export const usePrompts = (aliases: Aliases) => {
  const codemodExecutionError = useCodemodExecutionError();
  const prompts = [
    shouldUseCodemodAi
      ? null
      : [
          "Build a codemod to transform before to after",
          autoGenerateCodemodPrompt,
        ],
  ].filter(Boolean);

  const codemodHighlightedValue = aliases.$HIGHLIGHTED_IN_CODEMOD?.value ?? "";

  if (codemodHighlightedValue !== "") {
    prompts.unshift([
      "Regenerate specified code block",
      fixCodemodBlockNoDebugInfoPrompt,
    ]);
  }

  if (codemodExecutionError) {
    prompts.unshift(["Fix codemod error", codemodExecutionError]);
  }

  return prompts;
};
