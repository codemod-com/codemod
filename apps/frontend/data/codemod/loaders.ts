import { env } from "@/env";
import type {
  AutomationAPISearchResponse,
  AutomationResponse,
} from "@/types/object.types";
import { vercelStegaSplit } from "@vercel/stega";
import { buildRegistryIndexDataQuery } from "./queries";

export async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options as { timeout: number };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    next: {
      revalidate: 0,
    },
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export async function loadCodemod(pathname: string) {
  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const { cleaned: url } = vercelStegaSplit(`${baseUrl}/${pathname}`);
  try {
    // API is regularly unstable, handle timeout errors
    const response = await fetchWithTimeout(url, {
      // @ts-ignore - only used in Next.js route context
      next: { revalidate: 120 },
      timout: 8000,
    });

    const data =
      // API is regularly unstable, handle bad gateway errors returning HTML instead of JSON
      response.status === 200 ? await response.json() : { error: "Not found" };
    return data as Promise<AutomationResponse | { error: string }>;
  } catch (error) {
    return { error: "Not found" };
  }
}

export async function loadRegistryAPIData({
  pageNumber,
  searchParams,
  entriesPerPage,
}: {
  pageNumber: number;
  searchParams: URLSearchParams;
  entriesPerPage: number;
}): Promise<AutomationAPISearchResponse | null> {
  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const registryIndexQuery = buildRegistryIndexDataQuery({
    pageNumber,
    entriesPerPage,
    searchParams,
  });

  const url = `${baseUrl}?${registryIndexQuery}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = response.status === 200 ? await response.json() : null;

    return data;
  } catch (error) {
    return null;
  }
}
