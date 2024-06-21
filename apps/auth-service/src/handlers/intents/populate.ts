import { getAuth } from "@clerk/fastify";
import { prisma } from "@codemod-com/database";
import {
  decryptWithIv,
  encryptWithIv,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { object, optional, parse, string } from "valibot";
import { environment } from "../../util";

export type PopulateLoginIntentReply =
  | { success: true }
  | { message: string; success: false };

export const populateAccessTokenQuerySchema = object({
  sessionId: optional(string()),
  iv: optional(string()),
});

export const populateLoginIntent: RouteHandler<{
  Reply: PopulateLoginIntentReply;
}> = async (request, reply) => {
  const { sessionId, iv: ivStr } = parse(
    populateAccessTokenQuerySchema,
    request.query,
  );

  if (
    !isNeitherNullNorUndefined(sessionId) ||
    !isNeitherNullNorUndefined(ivStr)
  ) {
    return reply.status(400).send({
      success: false,
      message: "Missing required parameters",
    });
  }

  const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
  const iv = Buffer.from(ivStr, "base64url");

  const { getToken } = getAuth(request);
  const token = await getToken();

  if (token === null) {
    return reply.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }

  const decryptedSessionId = decryptWithIv(
    "aes-256-cbc",
    { key, iv },
    Buffer.from(sessionId, "base64url"),
  ).toString();

  await prisma.userLoginIntent.update({
    where: { id: decryptedSessionId },
    data: {
      token: encryptWithIv(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(token),
      ).toString("base64url"),
    },
  });

  return reply.status(200).send({
    success: true,
  });
};
