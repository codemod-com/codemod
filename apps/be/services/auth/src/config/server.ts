import type { FastifyListenOptions } from "fastify";
import { env } from "../utils";

export const serverOptions: FastifyListenOptions = {
  host: "0.0.0.0",
  port: env.AUTH_SERVICE_PORT,
};
