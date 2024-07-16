import type { GetCodemodResponse } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import type { UserDataPopulatedRequest } from "~/plugins/authPlugin.js";
import { processHandlerError } from "~/types/errors.js";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";

export const getCodemodHandler: RouteHandler<{
  Reply: GetCodemodResponse;
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
