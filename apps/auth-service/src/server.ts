import "dotenv/config";

import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, {
  type FastifyRequest,
  type FastifyPluginCallback,
} from "fastify";

import { createClerkClient } from "@clerk/backend";
import { clerkPlugin, getAuth } from "@clerk/fastify";

import {
  type GetScopedTokenResponse,
  isNeitherNullNorUndefined,
} from "@codemod-com/utilities";
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

  await fastify.register(fastifyMultipart);

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
  instance.register(clerkPlugin, {
    publishableKey: environment.CLERK_PUBLISH_KEY,
    secretKey: environment.CLERK_SECRET_KEY,
    jwtKey: environment.CLERK_JWT_KEY,
  });

  instance.get("/verifyToken", async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.status(401).send({ message: "Invalid token" });
    }

    return reply.status(200).send({ message: "User is authenticated" });
  });

  instance.get("/verifyClientToken", async (request, reply) => {
    const { userId, sessionClaims } = getAuth(request);

    if (!userId && sessionClaims?.client !== "CLI") {
      return reply.status(401).send({ message: "Invalid token" });
    }

    return reply.status(200).send({ message: "User is authenticated" });
  });

  instance.get("/userData", async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.status(401).send({ message: "Invalid token" });
    }

    const user = await clerkClient.users.getUser(userId);
    const organizations = (
      await clerkClient.users.getOrganizationMembershipList({ userId })
    ).data.map((organization) => organization);
    const allowedNamespaces = [
      ...organizations.map(({ organization }) => organization.slug),
    ].filter(isNeitherNullNorUndefined);

    if (user.username) {
      allowedNamespaces.push(user.username);

      if (environment.VERIFIED_PUBLISHERS.includes(user.username)) {
        allowedNamespaces.push("codemod-com", "codemod.com");
      }
    }

    return reply.status(200).send({
      user,
      organizations,
      allowedNamespaces,
    });
  });

  instance.get<{ Reply: GetScopedTokenResponse | { message: string } }>(
    "/clientToken",
    async (request, reply) => {
      const { userId, sessionId } = getAuth(request);

      if (!userId && !sessionId) {
        return reply.status(401).send({ message: "Invalid token" });
      }

      const { jwt } = await clerkClient.sessions.getToken(
        sessionId,
        environment.CLI_TOKEN_TEMPLATE,
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
