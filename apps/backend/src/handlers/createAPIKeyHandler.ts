import {
  type CreateAPIKeyResponse,
  createAPIKeyRequestSchema,
} from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import type { RouteHandler } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { parse } from "valibot";
import { createApiKey } from "../services/UnkeyService.js";

export const createAPIKeyHandler: RouteHandler<{
  Reply: CreateAPIKeyResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const user = request.user!;

  const uuid = uuidv4();

  const apiKey = await createApiKey({
    externalId: user.id,
    apiKeyData: parse(createAPIKeyRequestSchema, request.body),
    uuid,
  });

  await prisma.apiKey.create({
    data: {
      externalId: user.id,
      uuid,
      keyId: apiKey.keyId,
    },
  });

  const reply: CreateAPIKeyResponse = { key: apiKey.key, uuid };
  return reply;
};
