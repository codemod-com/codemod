import type { ApiResponse, GetCodemodResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import type { RouteHandler } from "fastify";
import { parseGetCodemodBySlugParams } from "#schemata/schema.js";
import { codemodService } from "#services/CodemodService.js";
import { processHandlerError } from "#types/errors.js";

export const getCodemodHandler: RouteHandler<{
  Reply: ApiResponse<GetCodemodResponse>;
}> = async (request: UserDataPopulatedRequest, reply) => {
  const { criteria } = parseGetCodemodBySlugParams(request.params);

  try {
    return await codemodService.getCodemod(
      criteria,
      request.allowedNamespaces ?? [],
    );
  } catch (err) {
    processHandlerError(err, reply, "Failed to retrieve codemod");
  }
};
