import type { FastifyInstance } from "fastify";
import type { GetCodemodParams } from "./schemas";

import { getCodemod } from "./controllers";
import { getCodemodValidator } from "./validators";

export async function codemodRoutes(server: FastifyInstance) {
  server.get<{ Params: GetCodemodParams }>(
    "/codemods/:slug",
    getCodemodValidator(server),
    getCodemod,
  );
}
