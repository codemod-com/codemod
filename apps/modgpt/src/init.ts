import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyPluginCallback } from "fastify";
import { clerkApplied, environment, isDevelopment } from "./dev-utils/configs";
import { corsOptions, getCorsDisabledHeaders } from "./dev-utils/cors";

export const initApp = async (toRegister: FastifyPluginCallback[]) => {
  const { PORT: port } = environment;
  if (Number.isNaN(port)) {
    throw new Error(`Invalid port ${port}`);
  }

  const fastify = Fastify({
    logger: true,
  });

  if (!isDevelopment && clerkApplied) {
    const clerkOptions = {
      publishableKey: environment.CLERK_PUBLISH_KEY,
      secretKey: environment.CLERK_SECRET_KEY,
      jwtKey: environment.CLERK_JWT_KEY,
    };

    fastify.register(clerkPlugin, clerkOptions);
  } else {
    if (!clerkApplied)
      console.warn("No Clerk keys set. Authentication is disabled.");
    if (isDevelopment) console.info("ENV set to development");
  }

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

  await fastify.register(cors, corsOptions);

  await fastify.register(fastifyRateLimit, {
    max: 1000,
    timeWindow: 60 * 1000, // 1 minute
  });

  await fastify.register(fastifyMultipart);

  for (const plugin of toRegister) {
    await fastify.register(plugin);
  }

  await fastify.listen({ port, host: "0.0.0.0" });

  return fastify;
};
