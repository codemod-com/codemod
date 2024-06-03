import { randomBytes } from "node:crypto";
import type { OrganizationMembership, User } from "@clerk/backend";
import type { TelemetrySender } from "@codemod-com/telemetry";
import type { CodemodListResponse } from "@codemod-com/utilities";
import type { FastifyRequest } from "fastify";
import type { CustomHandler } from "../customHandler.js";
import {
  parseClientIdentifierSchema,
  parseListCodemodsQuery,
} from "../schemata/schema.js";
import type { CodemodService } from "../services/CodemodService.js";
import type { TelemetryEvents } from "../telemetry.js";

export const getCodemodsListHandler: CustomHandler<CodemodListResponse> =
  async ({
    request,
    codemodService,
    telemetryService,
  }: {
    request: FastifyRequest & {
      user?: User;
      organizations?: OrganizationMembership[];
      allowedNamespaces?: string[];
    };
    codemodService: CodemodService;
    telemetryService: TelemetrySender<TelemetryEvents>;
  }) => {
    const { search } = parseListCodemodsQuery(request.query);

    const userId = request.user?.id;
    const distinctId = userId ?? randomBytes(16).toString("hex");

    const clientIdentifier = request.headers["x-client-identifier"]
      ? parseClientIdentifierSchema(request.headers["x-client-identifier"])
      : "UNKNOWN";

    // we are not interested in events without searchTerm
    if (search !== undefined) {
      telemetryService.sendEvent(
        {
          kind: "listNames",
          searchTerm: search,
        },
        {
          cloudRole: clientIdentifier,
          distinctId,
        },
      );
    }

    if (!userId) {
      return codemodService.getCodemodsList(null, search, []);
    }

    return codemodService.getCodemodsList(
      userId,
      search,
      request?.allowedNamespaces,
    );
  };
