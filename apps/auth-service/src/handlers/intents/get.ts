import { prisma } from "@codemod-com/database";
import { decryptWithIv } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { object, parse, string } from "valibot";
import { environment } from "../../util";

export type GetLoginIntentReply = { token: string };

export const getAccessTokenParamsSchema = object({
  id: string(),
});

export const ivSchema = object({
  iv: string(),
});

export const getLoginIntent: RouteHandler<{
  Reply: GetLoginIntentReply;
}> = async (request, reply) => {
  const { id } = parse(getAccessTokenParamsSchema, request.params);
  const { iv: ivStr } = parse(ivSchema, request.query);

  const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
  const iv = Buffer.from(ivStr, "base64url");

  const result = await prisma.userLoginIntent.findFirst({
    where: {
      id: decryptWithIv(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(id, "base64url"),
      ).toString(),
    },
  });

  if (result === null) {
    reply.code(400).send();
    return;
  }

  if (result.token === null) {
    reply.code(400).send();
    return;
  }

  const decryptedToken = decryptWithIv(
    "aes-256-cbc",
    { key, iv },
    Buffer.from(result.token, "base64url"),
  ).toString();

  await prisma.userLoginIntent.delete({
    where: { id: result.id },
  });

  reply.type("application/json").code(200);
  return { token: decryptedToken };
};
