import { FetchError, extendedFetch } from "@codemod-com/utilities";

export const retryingClient = async (
  url: string,
  options?: RequestInit & { retries?: number },
) => {
  let retryCount = options?.retries ?? DEFAULT_RETRY_COUNT;
  while (retryCount > 0) {
    try {
      const response = await extendedFetch(url, options);
      return response;
    } catch (err) {
      retryCount -= 1;
      if (retryCount === 0) {
        throw err;
      }
    }
  }

  throw new FetchError("Failed to fetch");
};

export const DEFAULT_RETRY_COUNT = 5;
