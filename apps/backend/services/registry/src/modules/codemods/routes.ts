import type { FastifyInstance } from "fastify";

import type {
  GetCodemodDownloadLinkQuery,
  GetCodemodParams,
  GetCodemodsListParams,
} from "./schemas";

import {
  getCodemod,
  getCodemodDownloadLink,
  getCodemodsList,
} from "./controllers";

import {
  getCodemodDownloadLinkHooks,
  getCodemodHooks,
  getCodemodsListHooks,
} from "./hooks";

export async function codemodRoutes(server: FastifyInstance) {
  server.get<{ Params: GetCodemodParams }>(
    "/codemods/:slug",
    getCodemodHooks(server),
    getCodemod,
  );

  server.get<{ Params: GetCodemodsListParams }>(
    "/codemods/list",
    getCodemodsListHooks(server),
    getCodemodsList,
  );

  server.get<{ Querystring: GetCodemodDownloadLinkQuery }>(
    "/codemods/download",
    getCodemodDownloadLinkHooks(server),
    getCodemodDownloadLink,
  );
}
