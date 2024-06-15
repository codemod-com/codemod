import { env } from "@/env";
import type {
  AutomationAPISearchResponse,
  AutomationResponse,
} from "@/types/object.types";
import { vercelStegaSplit } from "@vercel/stega";
import { buildRegistryIndexDataQuery } from "./queries";

let DEFAULT_FETCH_OPTIONS = {
  next: {
    revalidate: 120,
  },
  timeout: 8000,
};

export async function fetchWithTimeout(
  resource: string,
  options?: Partial<RequestInit>,
) {
  let mergedOptions = { ...DEFAULT_FETCH_OPTIONS, ...options };
  let { timeout } = mergedOptions;

  let controller = new AbortController();
  let id = setTimeout(() => controller.abort(), timeout);

  let response = await fetch(resource, {
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
  let baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  let { cleaned: url } = vercelStegaSplit(`${baseUrl}/${pathname}`);
  try {
    // API is regularly unstable, handle timeout errors
    let response = await fetchWithTimeout(url, options);

    let data =
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
  let baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  let registryIndexQuery = buildRegistryIndexDataQuery({
    pageNumber,
    entriesPerPage,
    searchParams,
  });

  let url = `${baseUrl}?${registryIndexQuery}`;
  try {
    let response = await fetchWithTimeout(url);
    let data = response.status === 200 ? await response.json() : null;

    return data;
  } catch (error) {
    return null;
  }
}
