import "dotenv/config";
import { decodeJwt, jwtVerificationResult } from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";

import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, {
  type FastifyRequest,
  type FastifyPluginCallback,
} from "fastify";

import axios from "axios";
import { environment } from "./util.js";

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
        `${process.env.ZITADEL_URL}/oidc/v1/userinfo`,
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

  done();
};

export const runServer = async () => await initApp([routes]);
