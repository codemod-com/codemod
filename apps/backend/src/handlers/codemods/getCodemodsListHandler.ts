import { randomBytes } from "node:crypto";
import type { CodemodListResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import type { RouteHandler } from "fastify";
import {
  parseClientIdentifierSchema,
  parseListCodemodsQuery,
} from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";
import { telemetryService } from "../services/TelemetryService.js";

export const getCodemodsListHandler: RouteHandler<{
  Reply: CodemodListResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const query = parseListCodemodsQuery(request.query);

  if (!request.user) {
    return codemodService.getCodemodsList(query);
  }

  const { id: userId, username } = request.user;
  const distinctId = userId ?? randomBytes(16).toString("hex");

  const clientIdentifier = request.headers["x-client-identifier"]
    ? parseClientIdentifierSchema(request.headers["x-client-identifier"])
    : "UNKNOWN";

  if (query.search !== undefined) {
    telemetryService.sendEvent(
      { kind: "listNames", searchTerm: query.search },
      { cloudRole: clientIdentifier, distinctId },
    );
  }

  return codemodService.getCodemodsList({
    username,
    whitelisted: request.allowedNamespaces ?? [],
    ...query,
  });
};
