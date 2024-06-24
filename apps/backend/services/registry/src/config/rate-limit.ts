import type { FastifyRateLimitOptions } from "@fastify/rate-limit";

export const rateLimitOptions: FastifyRateLimitOptions = {
  max: 1000,
  timeWindow: 60 * 1000,
};
