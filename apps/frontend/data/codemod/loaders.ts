import type {
  AutomationAPISearchResponse,
  AutomationResponse,
} from "@/types/object.types";
import { vercelStegaSplit } from "@vercel/stega";
import { buildRegistryIndexDataQuery } from "./queries";

export async function fetchWithTimeout(resource, options = {}) {
  let { timeout = 8000 } = options as { timeout: number };

  let controller = new AbortController();
  let id = setTimeout(() => controller.abort(), timeout);

  let response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export async function loadCodemod(pathname: string) {
  let baseUrl = process.env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  let { cleaned: url } = vercelStegaSplit(`${baseUrl}/${pathname}`);
  try {
    // API is regularly unstable, handle timeout errors
    let response = await fetchWithTimeout(url, {
      // @ts-ignore - only used in Next.js route context
      next: { revalidate: 120 },
      timout: 8000,
    });

    let data =
      // API is regularly unstable, handle bad gateway errors returning HTML instead of JSON
      response.status === 200
        ? await response.json()
        : await new Promise((resolve) => resolve({ error: "Not found" }));
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
  let baseUrl = process.env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
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
