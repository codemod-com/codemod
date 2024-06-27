import { env } from "@/env";
import { extendedFetch, isFetchError } from "@codemod-com/utilities";
import toast from "react-hot-toast";

const createClient =
  (baseUrl: string) => async (path: string, options?: RequestInit) => {
    try {
      return await extendedFetch(`${baseUrl}${path}`, {
        signal: AbortSignal.timeout(60000),
        ...options,
      });
    } catch (error) {
      if (isFetchError(error) && error.response?.status) {
        toast.error(
          ((await error.response.json()) as { message?: string })?.message ??
            "Network Error",
          {
            position: "top-center",
          },
        );
      }
      throw error;
    }
  };

const apiClient = createClient(env.NEXT_PUBLIC_API_URL);

// mostly for local dev, in prod they should be on the same domain.
// later we need to figure out how to do this in a better way
const authApiClient = createClient(env.NEXT_PUBLIC_AUTH_API_URL);

export { apiClient, authApiClient };
