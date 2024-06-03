import { getAuth } from "@clerk/fastify";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import type { RouteHandler } from "fastify";
import { decrypt, encrypt } from "~/crypto/crypto.js";
import { prisma } from "~/db/prisma.js";
import { environment } from "~/util.js";
import { parseBuildAccessTokenQuery } from "../schemata/schema.js";

export type PopulateLoginIntentResponse =
  | { message: string }
  | { success: true };

export const populateLoginIntent: RouteHandler<{
  Reply: PopulateLoginIntentResponse;
}> = async (request, reply) => {
  const { sessionId, iv: ivStr } = parseBuildAccessTokenQuery(request.query);

  if (
    !isNeitherNullNorUndefined(sessionId) ||
    !isNeitherNullNorUndefined(ivStr)
  ) {
    return reply.status(400).send({
      message: "Missing required parameters",
    });
  }

  const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
  const iv = Buffer.from(ivStr, "base64url");

  const { getToken } = getAuth(request);
  const token = await getToken();

  if (token === null) {
    return reply.status(401).send({
      message: "Unauthorized",
    });
  }

  const decryptedSessionId = decrypt(
    "aes-256-cbc",
    { key, iv },
    Buffer.from(sessionId, "base64url"),
  ).toString();

  await prisma.userLoginIntent.update({
    where: { id: decryptedSessionId },
    data: {
      token: encrypt("aes-256-cbc", { key, iv }, Buffer.from(token)).toString(
        "base64url",
      ),
    },
  });

  return reply.status(200).send({
    success: true,
  });
};
