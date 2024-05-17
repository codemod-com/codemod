import { env } from "./env";

export let isDevelopment = process.env.NODE_ENV === "development";

let publicConfig = {
  sanity: {
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "",
    // Not exposed to the front-end, used solely by the server
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2023-06-21",
    studioUrl: "/manage",
  },
  siteName: "Codemod",
  siteDomain: env.NEXT_PUBLIC_SITE_DOMAIN ?? "",
  baseUrl: env.NEXT_PUBLIC_BASE_URL ?? "",
};

export default publicConfig;
