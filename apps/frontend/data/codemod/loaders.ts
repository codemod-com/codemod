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
  isOldRegistry: boolean = false,
) {
  const baseUrl = isOldRegistry
    ? env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT_OLD
    : env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
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
  searchParams: string | URLSearchParams;
  entriesPerPage: number;
}): Promise<AutomationAPISearchResponse | null> {
  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const registryIndexQuery = buildRegistryIndexDataQuery({
    pageNumber,
    entriesPerPage,
    searchParams,
  });

  // Ensure we target the new OpenAPI search endpoint
  const normalizedBase = baseUrl?.replace(/\/$/, "") || "";
  const searchEndpoint = normalizedBase.endsWith("/search")
    ? normalizedBase
    : `${normalizedBase}/search`;
  const url = registryIndexQuery
    ? `${searchEndpoint}?${registryIndexQuery}`
    : `${searchEndpoint}`;
  try {
    if (!normalizedBase) return null;
    const response = await fetchWithTimeout(url, {
      headers: { Accept: "application/json" },
    });
    if (response.status !== 200) return null;

    type OpenRegistrySearchPackage = {
      id: string;
      name: string;
      scope: string | null;
      display_name: string | null;
      description: string | null;
      author: string;
      keywords: string[];
      category: string | null;
      visibility: string;
      access: "public" | "private";
      latest_version: string | null;
      download_count: number;
      is_legacy: boolean;
      star_count: number;
      created_at: string; // date-time
      updated_at: string; // date-time
      owner: {
        id: string;
        username: string;
        name: string;
        avatar_url?: string | null;
      };
      organization: {
        id: string;
        name: string;
        slug: string;
        avatar_url?: string | null;
      } | null;
    };
    type OpenRegistrySearchResponse = {
      total: number;
      packages: OpenRegistrySearchPackage[];
    };

    const raw = (await response.json()) as OpenRegistrySearchResponse;

    const mapped: AutomationAPISearchResponse = {
      data: raw.packages?.map((pkg, index) => ({
        id: index, // synthetic numeric id for list keys
        slug: pkg.name,
        shortDescription: pkg.description || "",
        useCaseCategory: pkg.category || undefined,
        tags: pkg.keywords || [],
        engine: "",
        applicability: { from: [], to: [] },
        name: pkg.display_name || pkg.name,
        featured: false,
        verified: false,
        private: pkg.access === "private",
        author: pkg.owner?.username || pkg.author || "",
        amountOfUses: pkg.download_count || 0,
        totalTimeSaved: 0,
        openedPrs: pkg.star_count || 0,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,
        frameworks: [],
        versions: [],
        pkg: {
          id: pkg.id,
          name: pkg.name,
          displayName: pkg.display_name,
          description: pkg.description,
          scope: pkg.scope,
          visibility: pkg.visibility,
          access: pkg.access,
          latestVersion: pkg.latest_version,
          downloadCount: pkg.download_count,
          keywords: pkg.keywords,
          starCount: pkg.star_count,
          author: pkg.author,
          createdAt: pkg.created_at,
          updatedAt: pkg.updated_at,
        },
        owner: {
          id: pkg.owner?.id ?? null,
          username: pkg.owner?.username ?? null,
          name: pkg.owner?.name ?? null,
          avatarUrl: pkg.owner?.avatar_url ?? null,
        },
        organization: pkg.organization
          ? {
              id: pkg.organization.id ?? null,
              name: pkg.organization.name ?? null,
              slug: pkg.organization.slug ?? null,
              avatarUrl: pkg.organization.avatar_url ?? null,
            }
          : null,
        isLegacy: pkg.is_legacy,
      })),
      filters: [],
      total: raw.total,
      page: pageNumber,
      size: entriesPerPage,
    };

    return mapped;
  } catch (error) {
    return null;
  }
}
