import type { ListAPIKeysResponse } from "@codemod-com/api-types";
import type { UserDataPopulatedRequest } from "@codemod-com/auth";
import type { RouteHandler } from "fastify";
import { listApiKeys } from "../services/UnkeyService.js";

export const listAPIKeysHandler: RouteHandler<{
  Reply: ListAPIKeysResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const user = request.user!;

  const apiKeys = await listApiKeys({ externalId: user.id });

  return {
    keys: apiKeys.keys.map(({ start, name, createdAt, expires }) => ({
      start,
      name,
      createdAt,
      expiresAt: expires,
    })),
  };
};
