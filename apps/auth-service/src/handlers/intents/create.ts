import { randomBytes } from "node:crypto";
import { encryptWithIv } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { environment } from "../../util";

export type CreateLoginIntentReply = { id: string; iv: string };

export const createLoginIntent: RouteHandler<{
  Reply: CreateLoginIntentReply;
}> = async (_request, reply) => {
  const result = await prisma.userLoginIntent.create({});

  const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
  const iv = randomBytes(16);
  const encryptedSessionId = encryptWithIv(
    "aes-256-cbc",
    { key, iv },
    Buffer.from(result.id),
  ).toString("base64url");

  reply.type("application/json").code(200);
  return { id: encryptedSessionId, iv: iv.toString("base64url") };
};
