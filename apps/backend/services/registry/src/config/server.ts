import type { FastifyListenOptions } from "fastify";
import { env } from "./env";

export const serverOptions: FastifyListenOptions = {
  host: "0.0.0.0",
  port: env.REGISTRY_PORT,
};
