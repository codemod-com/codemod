import {
  type DeleteAPIKeysResponse,
  deleteAPIKeysRequestSchema,
} from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parse } from "valibot";
import { deleteApiKeys, listApiKeys } from "../services/UnkeyService.js";

export const deleteAPIKeysHandler: RouteHandler<{
  Reply: DeleteAPIKeysResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const user = request.user!;

  const { uuid } = parse(deleteAPIKeysRequestSchema, request.params);

  const keysToDelete = await prisma.apiKey.findMany({
    where: { externalId: user.id, uuid },
  });

  const keysInfo = await listApiKeys({ externalId: user.id });

  await deleteApiKeys({ keyIds: keysToDelete.map((key) => key.keyId) });

  await prisma.apiKey.deleteMany({
    where: {
      externalId: user.id,
      keyId: { in: keysToDelete.map((key) => key.keyId) },
    },
  });

  const reply: DeleteAPIKeysResponse = {
    keys: keysToDelete
      .map(({ uuid }) => keysInfo.keys.find((k) => k.meta?.uuid === uuid))
      .filter((key) => !!key)
      .map(({ start, name }) => ({ start, name })),
  };
  return reply;
};
