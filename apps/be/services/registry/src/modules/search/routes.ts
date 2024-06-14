import type { FastifyInstance } from "fastify";
import type { SearchQuery } from "./schemas";

import { filters, search } from "./controllers";
import { searchValidator } from "./validators";

export async function searchRoutes(server: FastifyInstance) {
  server.get<{ Querystring: SearchQuery }>(
    "/filters",
    searchValidator(server),
    filters,
  );

  server.get<{ Querystring: SearchQuery }>(
    "/search",
    searchValidator(server),
    search,
  );
}
