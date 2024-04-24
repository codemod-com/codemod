import type {
  AutomationAPIListResponse,
  AutomationResponse,
} from "@/types/object.types";
import { vercelStegaSplit } from "@vercel/stega";
import { buildRegistryIndexDataQuery } from "./queries";

export async function loadCodemod(pathname: string) {
  const baseUrl = process.env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const { cleaned: url } = vercelStegaSplit(`${baseUrl}/${pathname}`);
  const response = await fetch(url, {
    // @ts-ignore - only used in Next.js route context
    next: { revalidate: 120 },
  });

  const data =
    // API is regularly unstable, so we need to handle errors as they are preventing builds on vercel
    response.status === 200
      ? await response.json()
      : await new Promise((resolve) => resolve({ error: "Not found" }));
  return data as Promise<AutomationResponse | { error: string }>;
}

export async function loadRegistryAPIData({
  pageNumber,
  searchParams,
  entriesPerPage,
}: {
  pageNumber: number;
  searchParams: URLSearchParams;
  entriesPerPage: number;
}): Promise<AutomationAPIListResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const registryIndexQuery = buildRegistryIndexDataQuery({
    pageNumber,
    entriesPerPage,
    searchParams,
  });

  const url = `${baseUrl}?${registryIndexQuery}`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}
