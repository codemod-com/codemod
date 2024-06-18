import { randomBytes } from "node:crypto";
import type { CodemodListResponse } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import type { UserDataPopulatedRequest } from "~/plugins/authPlugin.js";
import { telemetryService } from "~/services/TelemetryService.js";
import { codemodService } from "~/services/СodemodService.js";
import {
  parseClientIdentifierSchema,
  parseListCodemodsQuery,
} from "../schemata/schema.js";

export const getCodemodsListHandler: RouteHandler<{
  Reply: CodemodListResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const { search } = parseListCodemodsQuery(request.query);

  if (!request.user?.id) {
    return codemodService.getCodemodsList(null, search, []);
  }

  const userId = request.user?.id;
  const distinctId = userId ?? randomBytes(16).toString("hex");

  const clientIdentifier = request.headers["x-client-identifier"]
    ? parseClientIdentifierSchema(request.headers["x-client-identifier"])
    : "UNKNOWN";

  if (search !== undefined) {
    telemetryService.sendEvent(
      { kind: "listNames", searchTerm: search },
      { cloudRole: clientIdentifier, distinctId },
    );
  }

  return codemodService.getCodemodsList(
    userId,
    search,
    request?.allowedNamespaces,
  );
};
