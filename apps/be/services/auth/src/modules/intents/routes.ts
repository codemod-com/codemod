import type { FastifyInstance } from "fastify";
import { createIntent, getIntent, populateIntent } from "./controllers";

import type {
  GetIntentParams,
  GetIntentQuery,
  PopulateIntentQuery,
} from "./schemas";

import { getIntentValidator, populateIntentValidator } from "./validators";

export async function intentRoutes(server: FastifyInstance) {
  server.post("/intents", createIntent);

  server.get<{ Params: GetIntentParams; Querystring: GetIntentQuery }>(
    "/intents/:id",
    getIntentValidator(server),
    getIntent,
  );

  server.post<{ Querystring: PopulateIntentQuery }>(
    "/intents/populate",
    populateIntentValidator(server),
    populateIntent,
  );
}
