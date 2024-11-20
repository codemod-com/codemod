import {
  type CreateAPIKeyResponse,
  createAPIKeyRequestSchema,
} from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { parse } from "valibot";
import { createApiKey } from "../services/UnkeyService.js";

export const createAPIKeyHandler: RouteHandler<{
  Reply: CreateAPIKeyResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const user = request.user!;

  const apiKey = await createApiKey({
    externalId: user.id,
    apiKeyData: parse(createAPIKeyRequestSchema, request.body),
  });

  await prisma.apiKey.create({
    data: {
      ...apiKey,
      externalId: user.id,
    },
  });

  return { key: apiKey.key };
};
