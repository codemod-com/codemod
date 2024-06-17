import type { FastifyInstance } from "fastify";
import { getUser } from "./controllers";
import { bearerTokenHeadersValidator } from "./validators";

export async function userRoutes(server: FastifyInstance) {
  server.get("/user/me", bearerTokenHeadersValidator(server), getUser);
}
