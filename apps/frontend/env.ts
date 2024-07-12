import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DUBCO_WORKSPACE_ID: z.string().optional(),
    DUBCO_API_TOKEN: z.string().optional(),
    SANITY_API_TOKEN: z.string(),
    SANITY_REVALIDATE_SECRET: z.string().optional(),
    HUBSPOT_PORTAL_ID: z.string(),
    HUBSPOT_JOB_FORM_ID: z.string(),
    HUBSPOT_CONTACT_FORM_ID: z.string(),
    HUBSPOT_NEWSLETTER_FORM_ID: z.string(),
    IS_PREVIEW: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_AUTH_API_URL: z.string(),
    NEXT_PUBLIC_AI_API_URL: z.string(),
    NEXT_PUBLIC_WS_URL: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
    NEXT_PUBLIC_SANITY_DATASET: z.string(),
    NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional(),
    NEXT_PUBLIC_SITE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().optional(),
    NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DUBCO_WORKSPACE_ID: process.env.DUBCO_WORKSPACE_ID,
    DUBCO_API_TOKEN: process.env.DUBCO_API_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    NEXT_PUBLIC_AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_SITE_DOMAIN: process.env.NEXT_PUBLIC_SITE_DOMAIN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT:
      process.env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT,
    HUBSPOT_PORTAL_ID: process.env.HUBSPOT_PORTAL_ID,
    HUBSPOT_JOB_FORM_ID: process.env.HUBSPOT_JOB_FORM_ID,
    HUBSPOT_CONTACT_FORM_ID: process.env.HUBSPOT_CONTACT_FORM_ID,
    HUBSPOT_NEWSLETTER_FORM_ID: process.env.HUBSPOT_NEWSLETTER_FORM_ID,
    IS_PREVIEW: process.env.IS_PREVIEW,
  },
});
