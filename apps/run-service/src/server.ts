import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyPluginCallback } from "fastify";

import {
  type UserDataPopulatedRequest,
  getAuthPlugin,
} from "@codemod-com/auth";

import {
  parseCodemodRunBody,
  parseCodemodStatusParams,
} from "./schemata/schema.js";
import { queue, redis } from "./services/Redis.js";
import { environment } from "./util.js";

export enum TaskManagerJobs {
  CODEMOD_RUN = "CODEMOD_RUN",
}

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
    timeWindow: 60 * 1000, // 1 minute
  });

  const authPlugin = await getAuthPlugin(environment.AUTH_SERVICE_URL);
  await fastify.register(authPlugin);

  await fastify.register(fastifyMultipart);

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

  instance.get("/version", async (request, reply) => {
    const packageJson = await import(
      new URL("../package.json", import.meta.url).href,
      { assert: { type: "json" } }
    );

    reply.type("application/json").code(200);
    return { version: packageJson.default.version };
  });

  instance.post(
    "/codemodRun",
    { preHandler: [instance.authenticate, instance.getUserData] },
    async (request: UserDataPopulatedRequest, reply) => {
      if (!queue) {
        throw new Error("Queue service is not running.");
      }

      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send();
      }

      const { codemodSource, codemodEngine, repoUrl, branch } =
        parseCodemodRunBody(request.body);

      const job = await queue.add(TaskManagerJobs.CODEMOD_RUN, {
        codemodSource,
        codemodEngine,
        userId,
        repoUrl,
        branch,
      });

      if (!job.id) {
        return reply.code(500).send();
      }

      reply.type("application/json").code(200);
      return { success: true, codemodRunId: job.id };
    },
  );

  instance.get(
    "/codemodRun/status/:jobId",
    { preHandler: instance.authenticate },
    async (request, reply) => {
      if (!redis) {
        throw new Error("Redis service is not running.");
      }

      const { jobId } = parseCodemodStatusParams(request.params);

      const data = await redis.get(`job-${jobId}::status`);
      reply.type("application/json").code(200);
      return {
        success: true,
        result: data
          ? (JSON.parse(data) as {
              status: string;
              message?: string;
              link?: string;
              progress?: { processed: number; total: number };
            })
          : null,
      };
    },
  );

  done();
};

export const runServer = async () => await initApp([routes]);
