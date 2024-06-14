import type { Codemod } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";
import { codemodService } from "../services/codemodService";

export const getCodemodBySlugHandler: RouteHandler<{ Reply: Codemod }> = async (
  request,
) => {
  const { slug } = parseGetCodemodBySlugParams(request.params);

  return codemodService.getCodemodBySlug(slug);
};
