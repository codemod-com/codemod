const globalHooks: ((options: RequestInit) => RequestInit)[] = [];

export class FetchError extends Error {
  public code?: string;

  constructor(
    message: string,
    public response?: Response,
  ) {
    super(message);
  }
}

export function isFetchError(error: unknown): error is FetchError {
  return error instanceof FetchError;
}

export const addGlobalHook = (hook: (options: RequestInit) => RequestInit) => {
  globalHooks.push(hook);
};

export const extendedFetch = async (
  url: string,
  initialOptions: RequestInit = {},
) => {
  let options = initialOptions;
  try {
    for (const hook of globalHooks) {
      options = hook(options);
    }
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new FetchError("Failed to fetch", response);
    }

    return response;
  } catch (e) {
    if (isFetchError(e)) {
      throw e;
    }

    throw new FetchError("Failed to fetch");
  }
};
