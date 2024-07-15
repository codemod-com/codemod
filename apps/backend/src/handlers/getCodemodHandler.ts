import type { ApiResponse, GetCodemodResponse } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { processHandlerError } from "~/types/errors.js";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";

export const getCodemodHandler: RouteHandler<{
  Reply: ApiResponse<GetCodemodResponse>;
}> = async (request, reply) => {
  const { criteria } = parseGetCodemodBySlugParams(request.params);

  try {
    return await codemodService.getCodemod(criteria);
  } catch (err) {
    console.log(err);
    processHandlerError(err, reply, "Failed to retrieve codemod");
  }
};
