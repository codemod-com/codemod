import toast from "react-hot-toast";

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
