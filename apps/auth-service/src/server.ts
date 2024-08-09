import "dotenv/config";

import { createClerkClient } from "@clerk/backend";
import { clerkPlugin, getAuth } from "@clerk/fastify";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyPluginCallback } from "fastify";

import type {
  GetScopedTokenResponse,
  RevokeScopedTokenResponse,
} from "@codemod-com/api-types";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";

import { createLoginIntent } from "./handlers/intents/create.js";
import { getLoginIntent } from "./handlers/intents/get.js";
import { populateLoginIntent } from "./handlers/intents/populate.js";
import { environment } from "./util.js";

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

const clerkClient = createClerkClient({
  publishableKey: environment.CLERK_PUBLISH_KEY,
  secretKey: environment.CLERK_SECRET_KEY,
  jwtKey: environment.CLERK_JWT_KEY,
});

const routes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: { status: 200 } };
  });

  instance.register(clerkPlugin, {
    publishableKey: environment.CLERK_PUBLISH_KEY,
    secretKey: environment.CLERK_SECRET_KEY,
    jwtKey: environment.CLERK_JWT_KEY,
  });

  instance.get("/intents/:id", getLoginIntent);

  instance.post("/intents", createLoginIntent);

  instance.post("/populateLoginIntent", populateLoginIntent);

  instance.get("/verifyToken", async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.status(401).send({ message: "Invalid token" });
    }

    return reply.status(200).send({ userId });
  });

  instance.get("/userData", async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.status(200).send({});
    }

    const user = await clerkClient.users.getUser(userId);
    const organizations = (
      await clerkClient.users.getOrganizationMembershipList({ userId })
    ).data.map((organization) => organization);
    const allowedNamespaces = [
      ...organizations.map(({ organization }) => organization.slug),
    ].filter(isNeitherNullNorUndefined);

    if (user.username) {
      allowedNamespaces.unshift(user.username);

      if (environment.VERIFIED_PUBLISHERS.includes(user.username)) {
        allowedNamespaces.push("codemod-com");
      }
    }

    return reply.status(200).send({
      user,
      organizations,
      allowedNamespaces,
    });
  });

  instance.delete<{ Reply: RevokeScopedTokenResponse }>(
    "/revokeToken",
    async (request, reply) => {
      const { userId, sessionId } = getAuth(request);

      if (!userId && !sessionId) {
        return reply
          .status(401)
          .send({ success: false, error: "Invalid token" });
      }

      try {
        await clerkClient.sessions.revokeSession(sessionId);
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
      const { userId, sessionId } = getAuth(request);

      if (!userId && !sessionId) {
        return reply.status(401).send({ message: "Invalid token" });
      }

      const { jwt } = await clerkClient.sessions.getToken(
        sessionId,
        environment.APP_TOKEN_TEMPLATE,
      );

      return reply.status(200).send({ token: jwt });
    },
  );

  instance.get("/oAuthToken", async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.status(401).send({ message: "Invalid token" });
    }

    const { data } = await clerkClient.users.getUserOauthAccessToken(
      userId,
      "oauth_github",
    );

    const token = data[0]?.token;

    return reply.status(200).send({ token });
  });

  done();
};

export const runServer = async () => await initApp([routes]);
