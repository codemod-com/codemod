import { randomBytes } from "node:crypto";
import { createClerkClient } from "@clerk/backend";
import { decryptWithIv, encryptWithIv } from "@codemod-com/utilities";
import type { FastifyReply, FastifyRequest } from "fastify";

import type {
  GetIntentParams,
  GetIntentQuery,
  PopulateIntentQuery,
} from "./schemas";

import { clerkOptions } from "../../config/clerk";
import { env } from "../../config/env";

const clerk = createClerkClient(clerkOptions);

export async function getIntent(
  request: FastifyRequest<{
    Params: GetIntentParams;
    Querystring: GetIntentQuery;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { iv } = request.query;

  const keyBuffer = Buffer.from(env.ENCRYPTION_KEY, "base64url");
  const ivBuffer = Buffer.from(iv, "base64url");

  const result = await prisma.userLoginIntent.findFirst({
    where: {
      id: decryptWithIv(
        "aes-256-cbc",
        { key: keyBuffer, iv: ivBuffer },
        Buffer.from(id, "base64url"),
      ).toString(),
    },
  });

  if (result === null) {
    return reply.code(400).send();
  }

  if (result.token === null) {
    return reply.code(400).send();
  }

  const decryptedToken = decryptWithIv(
    "aes-256-cbc",
    { key: keyBuffer, iv: ivBuffer },
    Buffer.from(result.token, "base64url"),
  ).toString();

  await prisma.userLoginIntent.delete({
    where: { id: result.id },
  });

  reply.type("application/json").code(200);
  return { token: decryptedToken };
}

export async function createIntent(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const result = await prisma.userLoginIntent.create({});

  const key = Buffer.from(env.ENCRYPTION_KEY, "base64url");
  const iv = randomBytes(16);
  const encryptedSessionId = encryptWithIv(
    "aes-256-cbc",
    { key, iv },
    Buffer.from(result.id),
  ).toString("base64url");

  reply.type("application/json").code(200);
  return { id: encryptedSessionId, iv: iv.toString("base64url") };
}

export async function populateIntent(
  request: FastifyRequest<{ Querystring: PopulateIntentQuery }>,
  reply: FastifyReply,
) {
  const { sessionId, iv } = request.query;

  const keyBuffer = Buffer.from(env.ENCRYPTION_KEY, "base64url");
  const ivBuffer = Buffer.from(iv, "base64url");

  const { jwt: token } = await clerk.sessions.getToken(
    sessionId,
    env.APP_TOKEN_NAME,
  );

  if (token === null) {
    return reply.status(401).send();
  }

  const decryptedSessionId = decryptWithIv(
    "aes-256-cbc",
    { key: keyBuffer, iv: ivBuffer },
    Buffer.from(sessionId, "base64url"),
  ).toString();

  await prisma.userLoginIntent.update({
    where: { id: decryptedSessionId },
    data: {
      token: encryptWithIv(
        "aes-256-cbc",
        { key: keyBuffer, iv: ivBuffer },
        Buffer.from(token),
      ).toString("base64url"),
    },
  });

  reply.type("application/json").code(200);
  return { success: true };
}
