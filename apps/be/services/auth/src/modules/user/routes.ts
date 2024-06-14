import type { FastifyInstance } from "fastify";
import { getUser } from "./user.controllers";
import { bearerTokenHeadersValidator } from "./user.validators";

export async function userRoutes(server: FastifyInstance) {
  server.get("/user/me", bearerTokenHeadersValidator(server), getUser);
}
