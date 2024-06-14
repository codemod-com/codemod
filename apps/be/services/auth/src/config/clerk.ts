import type { ClerkFastifyOptions } from "@clerk/fastify";

import { env } from "../utils/";

export const clerkOptions: ClerkFastifyOptions = {
  publishableKey: env.CLERK_PUBLISH_KEY,
  secretKey: env.CLERK_SECRET_KEY,
  jwtKey: env.CLERK_JWT_KEY,
};
