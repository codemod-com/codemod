import "dotenv/config";
import type { ZitatelUserInfo } from "@codemod-com/api-types";
import { prisma } from "@codemod-com/database";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyPluginCallback } from "fastify";

import { decodeJwt, jwtVerificationResult } from "@codemod-com/auth";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import axios from "axios";
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

const routes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
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
      const { data } = await axios.get<ZitatelUserInfo | object>(
        `${process.env.ZITADEL_URL}/oidc/v1/userinfo`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          timeout: 5000,
        },
      );

      if (!("name" in data)) {
        return null;
      }

      return data.preferred_username;
    } catch (err) {
      return null;
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

    const result = jwtVerificationResult(jwtToken);

    if (!result) {
      return reply
        .status(401)
        .send({ message: "JWT token verification failed" });
    }

    try {
      const { data } = await axios.get<ZitatelUserInfo | object>(
        `${process.env.ZITADEL_URL}/oidc/v1/userinfo`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          timeout: 5000,
        },
      );

      if (!("name" in data)) {
        return null;
      }

      const organizations = await prisma.organization.findMany({
        where: {
          users: {
            hasSome: [data.preferred_username],
          },
        },
      });

      const allowedNamespaces = [
        ...organizations.map(({ slug }) => slug),
      ].filter(isNeitherNullNorUndefined);

      if (data.preferred_username) {
        allowedNamespaces.unshift(data.preferred_username);

        if (environment.VERIFIED_PUBLISHERS.includes(data.preferred_username)) {
          allowedNamespaces.push("codemod-com");
        }
      }

      return data as ZitatelUserInfo;
    } catch (err) {
      return null;
    }
  });

  done();
};

export const runServer = async () => await initApp([routes]);
