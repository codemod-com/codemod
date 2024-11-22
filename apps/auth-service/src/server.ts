import "dotenv/config";
import { decodeJwt, jwtVerificationResult } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import {
  decryptWithIv,
  encryptWithIv,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";

import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, {
  type FastifyRequest,
  type FastifyPluginCallback,
} from "fastify";

import axios from "axios";
import { environment } from "./util.js";

import { Issuer, generators } from "openid-client";
import { object, optional, parse, string } from "valibot";
import type { GetScopedTokenResponse } from "../../../packages/api-types/dist/responses.js";
import { createLoginIntent } from "./handlers/intents/create.js";
import { getLoginIntent } from "./handlers/intents/get.js";
import { populateLoginIntent } from "./handlers/intents/populate.js";

type ZitadelUserInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  locale: string;
  updated_at: number;
  preferred_username: string;
  email: string;
  email_verified: boolean;
};

export const initApp = async (toRegister: FastifyPluginCallback[]) => {
  const { PORT: port } = environment;
  if (Number.isNaN(port)) {
    throw new Error(`Invalid port ${port}`);
  }

  const fastify = Fastify({
    logger: true,
  });

  const handleProcessExit = (code: 0 | 1) => {
    fastify.close();

    setTimeout(() => {
      process.exit(code);
    }, 1000).unref();
  };

  process.on("uncaughtException", (error) => {
    console.error(error);
    handleProcessExit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error(reason);
    handleProcessExit(1);
  });

  process.on("SIGTERM", (signal) => {
    console.log(signal);
    handleProcessExit(0);
  });

  process.on("SIGINT", (signal) => {
    console.log(signal);
    handleProcessExit(0);
  });

  fastify.addHook("onRequest", (request, reply, done) => {
    reply.header("Access-Control-Allow-Origin", "false");
    done();
  });

  const ALLOWED_ORIGINS = [
    /^https?:\/\/.*-codemod\.vercel\.app$/,
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/codemod\.com$/,
    /^https?:\/\/staging.codemod\.com$/,
  ];

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      if (ALLOWED_ORIGINS.some((or) => or.test(origin))) {
        cb(null, true);
        return;
      }

      cb(new Error("Not allowed"), false);
    },
    methods: ["POST", "PUT", "PATCH", "GET", "DELETE", "OPTIONS"],
    exposedHeaders: ["x-clerk-auth-reason", "x-clerk-auth-message"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "access-control-allow-origin",
    ],
  } satisfies FastifyCorsOptions);

  await fastify.register(fastifyRateLimit, {
    max: 1000,
    timeWindow: 60 * 1000,
  });

  for (const plugin of toRegister) {
    await fastify.register(plugin);
  }

  await fastify.listen({ port, host: "0.0.0.0" });

  return fastify;
};

const issuer = await Issuer.discover(environment.AUTH_OPENID_ISSUER);

const client = new issuer.Client({
  client_id: environment.CLIENT_ID,
  redirect_uris: [environment.REDIRECT_URL],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
});

export const populateAccessTokenQuerySchema = object({
  sessionId: optional(string()),
  iv: optional(string()),
});

const routes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
  });

  instance.get("/intents/:id", getLoginIntent);

  instance.post("/intents", createLoginIntent);

  instance.post("/populateLoginIntent", populateLoginIntent);

  instance.get("/callback", async (request, reply) => {
    const params = client.callbackParams(request.raw);
    const receivedState = params.state;

    const { sessionId, ivStr, codeVerifier } = JSON.parse(
      receivedState as string,
    );

    const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
    const iv = Buffer.from(ivStr, "base64url");

    const decryptedSessionId = decryptWithIv(
      "aes-256-cbc",
      { key, iv },
      Buffer.from(sessionId, "base64url"),
    ).toString();

    const { access_token } = await client.callback(
      environment.REDIRECT_URL,
      params,
      {
        code_verifier: codeVerifier,
        state: receivedState,
      },
    );

    await prisma.userLoginIntent.update({
      where: { id: decryptedSessionId },
      data: {
        token: encryptWithIv(
          "aes-256-cbc",
          { key, iv },
          Buffer.from(access_token!),
        ).toString("base64url"),
      },
    });
  });

  instance.get("/authUrl", async (request, reply) => {
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

    const decryptedSessionId = decryptWithIv(
      "aes-256-cbc",
      { key, iv },
      Buffer.from(sessionId, "base64url"),
    ).toString();

    const loginIntent = await prisma.userLoginIntent.findFirst({
      where: { id: decryptedSessionId },
    });

    if (!loginIntent) {
      return reply.status(404).send({
        success: false,
        message: "Login intent not found",
      });
    }

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const state = JSON.stringify({
      sessionId,
      ivStr,
      decryptedSessionId,
      codeVerifier,
    });

    const authorizationUrl = client.authorizationUrl({
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });

    return reply.status(200).send({ url: authorizationUrl });
  });

  instance.get("/verifyToken", async (request, reply) => {
    const authHeader = request.headers.authorization;

    const jwtToken =
      typeof authHeader === "string"
        ? authHeader.replace("Bearer ", "")
        : undefined;

    if (!jwtToken) {
      return reply.status(401).send({ message: "No JWT token" });
    }

    const parsedToken = decodeJwt(jwtToken);

    if (!parsedToken) {
      return reply.status(401).send({ message: "Invalid JWT token" });
    }

    const kid = parsedToken.header.kid;

    if (!kid) {
      return reply.status(401).send({ message: "No kid in JWT token" });
    }

    const result = await jwtVerificationResult(jwtToken);

    if (!result) {
      return reply
        .status(401)
        .send({ message: "JWT token verification failed" });
    }

    try {
      const { data: user } = await axios.get<ZitadelUserInfo>(
        `${process.env.ZITADEL_URL}/oidc/v1/userinfo`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          timeout: 5000,
        },
      );

      if (!user.sub) {
        return reply.status(401).send({ message: "User was not found" });
      }

      return reply.status(200).send({ id: user.sub });
    } catch (err) {
      return reply.status(500).send({ message: "Internal server error" });
    }
  });

  instance.get("/userData", async (request, reply) => {
    const authHeader = request.headers.authorization;

    const jwtToken =
      typeof authHeader === "string"
        ? authHeader.replace("Bearer ", "")
        : undefined;

    if (!jwtToken) {
      return reply.status(401).send({ message: "No JWT token" });
    }

    const parsedToken = decodeJwt(jwtToken);

    if (!parsedToken) {
      return reply.status(401).send({ message: "Invalid JWT token" });
    }

    const kid = parsedToken.header.kid;

    if (!kid) {
      return reply.status(401).send({ message: "No kid in JWT token" });
    }

    const result = await jwtVerificationResult(jwtToken);

    if (!result) {
      return reply
        .status(401)
        .send({ message: "JWT token verification failed" });
    }

    try {
      const { data: user } = await axios.get<ZitadelUserInfo>(
        `${environment.ZITADEL_URL}/oidc/v1/userinfo`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          timeout: 5000,
        },
      );

      if (!user.sub) {
        return reply.status(401).send({ message: "User was not found" });
      }

      const organizations = await prisma.organization.findMany({
        where: {
          users: {
            has: user.preferred_username,
          },
        },
      });

      const allowedNamespaces = [
        ...organizations.map(({ slug }) => slug),
      ].filter(isNeitherNullNorUndefined);

      if (user.preferred_username) {
        allowedNamespaces.unshift(user.preferred_username);

        if (environment.VERIFIED_PUBLISHERS.includes(user.preferred_username)) {
          allowedNamespaces.push("codemod-com");
        }
      }

      return reply.status(200).send({
        user: {
          id: user.sub,
          username: user.preferred_username,
          firstName: user.given_name,
          lastName: user.family_name,
          locale: user.locale,
          email: user.email,
          emailVerified: user.email_verified,
        },
        organizations,
        allowedNamespaces,
      });
    } catch (err) {
      return reply.status(500).send({ message: "Internal server error" });
    }
  });

  interface RevokeTokenParams {
    client_id: string;
  }

  instance.delete<{ Params: RevokeTokenParams }>(
    "/revokeToken",
    async (request: FastifyRequest<{ Params: RevokeTokenParams }>, reply) => {
      const authHeader = request.headers.authorization;

      const jwtToken =
        typeof authHeader === "string"
          ? authHeader.replace("Bearer ", "")
          : undefined;

      if (!jwtToken) {
        return reply.status(401).send({ message: "No JWT token" });
      }

      const parsedToken = decodeJwt(jwtToken);

      if (!parsedToken) {
        return reply.status(401).send({ message: "Invalid JWT token" });
      }

      const kid = parsedToken.header.kid;

      if (!kid) {
        return reply.status(401).send({ message: "No kid in JWT token" });
      }

      const result = await jwtVerificationResult(jwtToken);

      if (!result) {
        return reply
          .status(401)
          .send({ message: "JWT token verification failed" });
      }

      const clientId = request.params.client_id;

      if (!clientId) {
        return reply
          .status(401)
          .send({ success: false, error: "Invalid client ID" });
      }

      try {
        await axios.get(`${process.env.ZITADEL_URL}/v2/revoke`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
          params: { client_id: clientId, token: jwtToken },
          timeout: 5000,
        });
      } catch (err) {
        console.error("Failed to revoke session:\n", err);
        return reply
          .status(500)
          .send({ success: false, error: "Failed to revoke session" });
      }

      return reply.status(200).send({ success: true });
    },
  );

  instance.get<{ Reply: GetScopedTokenResponse | { message: string } }>(
    "/appToken",
    async (request, reply) => {
      const authHeader = request.headers.authorization;

      const jwt =
        typeof authHeader === "string" ? authHeader.replace("Bearer ", "") : "";

      return reply.status(200).send({ token: jwt });
    },
  );
  done();
};

export const runServer = async () => await initApp([routes]);
