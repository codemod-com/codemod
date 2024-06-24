import type { FastifyInstance } from "fastify";
import type { SearchQuery } from "./schemas";

import { filters, search } from "./controllers";
import { searchHook } from "./hooks";

export async function searchRoutes(server: FastifyInstance) {
  server.get<{ Querystring: SearchQuery }>(
    "/filters",
    searchHook(server),
    filters,
  );

  server.get<{ Querystring: SearchQuery }>(
    "/search",
    searchHook(server),
    search,
  );
}
