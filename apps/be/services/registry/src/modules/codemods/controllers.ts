import { type Prisma, prisma } from "@codemod-com/database";

import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetCodemodParams } from "./schemas";

export async function getCodemod(
  request: FastifyRequest<{ Params: GetCodemodParams }>,
  reply: FastifyReply,
) {
  const { slug } = request.params;

  const codemod = await prisma.codemod.findFirst({
    where: {
      slug,
    },
    include: {
      versions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!codemod) {
    reply.type("application/json").code(404);
    return { error: "Codemod not found" };
  }

  reply.type("application/json").code(200);
  return { codemod };
}
