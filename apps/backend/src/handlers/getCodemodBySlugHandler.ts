import type { RouteHandler } from "fastify";
import { codemodService } from "~/services/CodemodService";
import type { Codemod } from "../../prisma/client";
import { parseGetCodemodBySlugParams } from "../schemata/schema.js";

export const getCodemodBySlugHandler: RouteHandler<{ Reply: Codemod }> = async (
  request,
) => {
  const { slug } = parseGetCodemodBySlugParams(request.params);

  return codemodService.getCodemodBySlug(slug);
};
