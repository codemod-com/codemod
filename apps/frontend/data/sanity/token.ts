import "server-only";

import { env } from "@/env";

export const token = env.SANITY_API_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}
