import type { MetadataRoute } from "next";
import { groq } from "next-sanity";

import { fetchWithTimeout } from "@/data/codemod/loaders";
import { client } from "@/data/sanity/client";
import { env } from "@/env";
import { PublishStatus } from "@/types";
import type { AutomationAPIListResponse } from "@/types/object.types";
import { pathToAbsUrl } from "@/utils/urls";

let sanityClient = client.withConfig({
  token: env.SANITY_API_TOKEN,
  perspective: "published",
  useCdn: false,
  stega: false,
});

type SanityRoute = {
  pathname: string;
  lastModified: string | null;
};

let SITEMAP_QUERY = groq`
  *[
    (pathname.current != null && publishStatus == "${PublishStatus.public}")
  ] {
    "pathname": pathname.current,
    "lastModified": _updatedAt,
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publicSanityRoutes = await sanityClient.fetch<SanityRoute[] | null>(
    SITEMAP_QUERY,
    {},
    {
      next: {
        revalidate: 0,
      },
    },
  );
  let baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;

  let res = await fetchWithTimeout(`${baseUrl}/list`);
  let allAutomations: AutomationAPIListResponse[] =
    res.status === 200 ? await res.json() : [];

  return (
    publicSanityRoutes?.map((route) => ({
      url: pathToAbsUrl(route.pathname) || "",
      lastModified: route.lastModified || undefined,
    })) ?? []
  ).concat(
    allAutomations.map((automation) => ({
      url: pathToAbsUrl(`/registry/${automation.slug}`) || "",
      lastModified: automation.updatedAt || undefined,
    })) || [],
  );
}
