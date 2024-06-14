import { client } from "@/data/sanity/client";
import * as queryStore from "@sanity/react-loader";
import { draftMode } from "next/headers";
import type { QueryParams } from "sanity";

import { env } from "@/env";
import type {
  BlogIndexPayload,
  NotFoundPayload,
  RegistryIndexPayload,
  RoutePayload,
} from "@/types";
import type {
  AutomationFilterIconDictionary,
  AutomationStories,
  GlobalLabels,
} from "@/types/object.types";
import {
  AUTOMATION_PAGE_QUERY,
  NOT_FOUND_DOC_QUERY,
  ROUTE_QUERY,
  buildBlogIndexQuery,
  buildRegistryIndexQuery,
} from "./queries";

let serverClientSet = false;

function initClient() {
  const serverClient = client.withConfig({
    token: env.SANITY_API_TOKEN,
    stega: {
      enabled: draftMode().isEnabled,
    },
  });

  if (!serverClientSet) {
    queryStore.setServerClient(serverClient);
    serverClientSet = true;
  }

  const usingCdn = serverClient.config().useCdn;

  return {
    queryStore,
    usingCdn,
  };
}

interface LoadQueryParams {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number;
}

// Automatically handle draft mode
export function loadQuery<T>({
  query,
  params = {},
  tags = [],
  revalidate,
}: LoadQueryParams) {
  const { queryStore } = initClient();
  const isDraftMode = draftMode().isEnabled;

  return queryStore.loadQuery<T>(query, params, {
    perspective: isDraftMode ? "previewDrafts" : "published",
    next: {
      revalidate: isDraftMode ? 0 : revalidate ?? 120,
      tags,
    },
  });
}

export function loadNotFound(locale: string) {
  return loadQuery<NotFoundPayload | null>({
    query: NOT_FOUND_DOC_QUERY,
    params: { locale },
    tags: [`notFound:${locale}`],
  });
}

// Loader for routes
export function loadRoute(pathname: string) {
  return loadQuery<RoutePayload | null>({
    query: ROUTE_QUERY,
    params: { pathname },
    tags: [`route:en${pathname}`],
  });
}

export function loadAutomationPage(aTags: string[], revalidate?: number) {
  return loadQuery<{
    automationStories: AutomationStories;
    filterIconDictionary: AutomationFilterIconDictionary;
    globalLabels?: GlobalLabels["codemodPage"];
  }>({
    query: AUTOMATION_PAGE_QUERY,
    params: { aTags },
    tags: aTags.map((t) => `route:en${t}`),
    revalidate,
  });
}

export function loadBlogIndex({
  pageNumber,
  pathParam,
}: {
  pageNumber: number;
  pathParam?: string;
}) {
  const blogIndexDocQuery = buildBlogIndexQuery({
    infiniteLoading: true,
    pathParam,
    sortBy: "publishDate",
    sortOrder: "desc",
    pageNumber,
    entriesPerPage: 10,
  });

  return loadQuery<BlogIndexPayload | null>({
    query: blogIndexDocQuery,
    params: { locale: "en", pathname: "/blog" },
    tags: [`blogIndex:en`],
  });
}
export function loadRegistryIndex() {
  const registryIndexQuery = buildRegistryIndexQuery();

  return loadQuery<RegistryIndexPayload | null>({
    query: registryIndexQuery,
    params: { locale: "en", pathname: "/registry" },
    tags: [`registryIndex:en`],
  });
}
