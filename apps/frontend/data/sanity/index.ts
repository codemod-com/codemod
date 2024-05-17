import type {
  AboutPagePayload,
  BlogArticlePayload,
  CareersPagePayload,
  ContactPagePayload,
  GlobalPagePayload,
  Job,
  ModularPagePayload,
  PricingPagePayload,
  RouteProps,
  TextPagePayload,
} from "@/types";
import type * as queryStore from "@sanity/react-loader";
import { loadQuery, loadRoute } from "./loadQuery";
import {
  ABOUT_PAGE_QUERY,
  BLOG_ARTICLE_QUERY,
  CAREERS_PAGE_QUERY,
  CONTACT_PAGE_QUERY,
  GLOBAL_QUERY,
  JOB_QUERY,
  PAGE_QUERY,
  PRICING_PAGE_QUERY,
  TEXT_PAGE_QUERY,
} from "./queries";

export function loadModularPage(pathname: string) {
  return loadQuery<ModularPagePayload | null>({
    query: PAGE_QUERY,
    params: { pathname, locale: "en" },
    tags: [`page:en${pathname}`],
  });
}

export function loadTextPage(pathname: string) {
  return loadQuery<TextPagePayload | null>({
    query: TEXT_PAGE_QUERY,
    params: { pathname, locale: "en" },
    tags: [`textPage:en${pathname}`],
  });
}
export function loadBlogArticlePage(pathname: string) {
  return loadQuery<BlogArticlePayload | null>({
    query: BLOG_ARTICLE_QUERY,
    params: { pathname, locale: "en" },
    tags: [`blog.article:en${pathname}`],
  });
}

export function loadGlobalData(locale: string) {
  return loadQuery<GlobalPagePayload | null>({
    query: GLOBAL_QUERY,
    params: { locale },
    tags: [],
  });
}

export async function loadSanityPageByRouteProps({
  params: { path },
}: RouteProps): Promise<
  | queryStore.QueryResponseInitial<ModularPagePayload | null>
  | queryStore.QueryResponseInitial<BlogArticlePayload | null>
  | queryStore.QueryResponseInitial<TextPagePayload | null>
> {
  let pathname: string;

  if (Array.isArray(path)) {
    pathname = `/${path.join("/")}`;
  } else {
    pathname = `/${path}`;
  }

  let routeData = await loadRoute(pathname);
  let documentType = routeData.data?.routeData._type;

  switch (documentType) {
    case "modularPage":
      return loadModularPage(pathname);
    case "textPage":
      return loadTextPage(pathname);
    case "blog.article":
    case "blog.customerStory":
      return loadBlogArticlePage(pathname);

    // %CLI/INJECT-LOADER%
    default:
      console.warn("Invalid document type:", documentType);
      return loadModularPage(pathname);
  }
}

export async function loadContactPage(pathname: string) {
  return loadQuery<ContactPagePayload | null>({
    query: CONTACT_PAGE_QUERY,
    params: { pathname },
    tags: [`contactPage:en${pathname}`],
  });
}

export async function loadPricingPage(pathname: string) {
  return loadQuery<PricingPagePayload>({
    query: PRICING_PAGE_QUERY,
    params: { pathname },
    tags: [`pricingPage:en${pathname}`],
  });
}

export async function loadAboutPage(pathname: string) {
  return loadQuery<AboutPagePayload>({
    query: ABOUT_PAGE_QUERY,
    params: { pathname },
    tags: [`aboutPage:en${pathname}`],
  });
}

export async function loadCareersPage(pathname: string) {
  return loadQuery<CareersPagePayload>({
    query: CAREERS_PAGE_QUERY,
    params: { pathname },
    tags: [`careers:en${pathname}`],
  });
}

export async function loadJobListingPage(pathname: string) {
  return loadQuery<Job>({
    query: JOB_QUERY,
    params: { pathname },
    tags: [`job:en${pathname}`],
  });
}
