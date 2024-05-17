import "server-only";

import { env } from "@/env";

export let token = env.SANITY_API_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}
