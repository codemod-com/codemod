import { client } from "@/data/sanity/client";
import { env } from "@/env";
import { groq } from "next-sanity";

export type RedirectSetting = {
  source: string;
  destination: string;
  permanent?: boolean;
};

let sanityClient = client.withConfig({
  token: env.SANITY_API_TOKEN,
  perspective: "published",
  useCdn: true,
  stega: false,
});

let REDIRECT_QUERY = groq`
*[_type == "settings"][0].redirects[@.source in $paths][0]
`;

export async function getRedirect(
  source: string,
): Promise<RedirectSetting | null> {
  return sanityClient.fetch(
    REDIRECT_QUERY,
    { paths: getPathVariations(source) },
    {
      next: {
        tags: ["settings"],
        revalidate: process.env.NODE_ENV === "production" ? 120 : 0,
      },
    },
  );
}

function getPathVariations(path: string): string[] {
  if (typeof path !== "string") return [];

  let slashless = path.trim();
  if (slashless.startsWith("/")) {
    slashless = slashless.slice(1);
  }
  if (slashless.endsWith("/")) {
    slashless = slashless.slice(0, -1);
  }

  return [
    slashless,
    // /slash-on-both-ends/
    `/${slashless}/`,
    // trailing/
    `${slashless}/`,
    // /leading
    `/${slashless}`,
  ];
}
