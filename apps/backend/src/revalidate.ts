import { buildCodemodSlug } from "@codemod-com/utilities";

import type { Environment } from "./schemata/env.js";

export const buildRevalidateHelper =
  (environment: Environment) => async (name: string) => {
    const slug = buildCodemodSlug(name);

    const revalidateURL = new URL(`${environment.FRONTEND_URL}/api/revalidate`);

    revalidateURL.searchParams.set("path", `registry/${slug}`);

    const revalidateTagURL = new URL(
      `${environment.FRONTEND_URL}/api/revalidate-tag`,
    );

    revalidateTagURL.searchParams.set("tag", `codemod-${slug}`);

    try {
      await fetch(revalidateTagURL.toString());
      await fetch(revalidateURL.toString());

      console.info(`Successfully revalidated ${slug}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(
        `Failed to revalidate the page: ${slug}. Reason: ${message}`,
      );
    }
  };
