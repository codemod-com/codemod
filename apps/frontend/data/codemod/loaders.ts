import { env } from "@/env";
import type {
  AutomationAPISearchResponse,
  AutomationResponse,
} from "@/types/object.types";
import { vercelStegaSplit } from "@vercel/stega";
import { buildRegistryIndexDataQuery } from "./queries";

const DEFAULT_FETCH_OPTIONS = {
  next: {
    revalidate: 120,
  },
  timeout: 8000,
};

export async function fetchWithTimeout(
  resource: string,
  options?: Partial<RequestInit>,
) {
  const mergedOptions = { ...DEFAULT_FETCH_OPTIONS, ...options };
  const { timeout } = mergedOptions;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...mergedOptions,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export async function loadCodemod(
  pathname: string,
  options?: Partial<RequestInit>,
) {
  console.log("test");
  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const { cleaned: url } = vercelStegaSplit(`${baseUrl}/${pathname}`);
  try {
    // API is regularly unstable, handle timeout errors
    const response = await fetchWithTimeout(url, options);

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
