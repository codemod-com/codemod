import {
  type ApiResponse,
  CODEMOD_NOT_FOUND,
  type GetCodemodResponse,
  INTERNAL_SERVER_ERROR,
} from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { CodemodNotFoundError, processHandlerError } from "~/types/errors.js";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";
import { codemodService } from "../services/CodemodService.js";

export const getCodemodHandler: RouteHandler<{
  Reply: ApiResponse<GetCodemodResponse>;
}> = async (request, reply) => {
  const { criteria } = parseGetCodemodBySlugParams(request.params);

  try {
    return await codemodService.getCodemod(criteria);
  } catch (err) {
    processHandlerError(err, reply, "Failed to retrieve codemod");
  }
};
