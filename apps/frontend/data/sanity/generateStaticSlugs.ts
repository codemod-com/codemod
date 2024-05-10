import "server-only";

import { groq } from "next-sanity";

import { client } from "@/data/sanity/client";
import { env } from "@/env";

// Used in `generateStaticParams`
export function generateStaticPaths(types: string[]) {
  return client
    .withConfig({
      token: env.SANITY_API_TOKEN,
      perspective: "published",
      useCdn: false,
      stega: false,
    })
    .fetch<string[]>(
      groq`*[_type in $types && defined(pathname.current)][].pathname.current`,
      { types },
      {
        next: {
          tags: types,
        },
      },
    );
}
