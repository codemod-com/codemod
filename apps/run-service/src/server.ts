import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyPluginCallback } from "fastify";

import {
  type ApiResponse,
  type CodemodRunJobData,
  type CodemodRunResponse,
  type CodemodRunStatus,
  type CodemodRunStatusResponse,
  UNAUTHORIZED,
} from "@codemod-com/api-types";
import {
  type UserDataPopulatedRequest,
  getAuthPlugin,
} from "@codemod-com/auth";
import { prisma } from "@codemod-com/database";
import {
  parseCodemodRunBody,
  parseCodemodStatusData,
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

  instance.post<{ Reply: ApiResponse<CodemodRunResponse> }>(
    "/codemodRun",
    { preHandler: [instance.authenticate, instance.getUserData] },
    async (request: UserDataPopulatedRequest, reply) => {
      if (!queue) {
        throw new Error("Queue service is not running.");
      }

      const userId = request.user?.id;
      if (!userId) {
        return reply
          .code(401)
          .send({ error: UNAUTHORIZED, errorText: "Unauthorized" });
      }

      const { codemods, repoUrl, branch } = parseCodemodRunBody(request.body);

      const created: (CodemodRunResponse["data"][number] | null)[] =
        await Promise.all(
          codemods.map(async (codemod) => {
            if (!queue) return null;

            const data = {
              userId,
              repoUrl,
              branch,
              ...codemod,
            } satisfies CodemodRunJobData;

            const job = await queue.add(TaskManagerJobs.CODEMOD_RUN, data);

            if (!job.id) return null;
            await prisma.codemodRun.create({
              data: {
                jobId: job.id,
                ownerId: userId,
                data: {
                  status: "progress",
                  codemod,
                  id: job.id,
                  progress: {
                    processed: 0,
                    total: 0,
                    percentage: 0,
                  },
                },
                repoUrl,
                branch,
              },
            });

            return { jobId: job.id, codemodName: codemod.name };
          }),
        );

      reply.type("application/json").code(200);
      return reply
        .code(401)
        .send({ success: true, data: created.filter(Boolean) });
    },
  );

  instance.get<{ Reply: CodemodRunStatusResponse }>(
    "/codemodRun/status/:jobId",
    { preHandler: instance.authenticate },
    async (request, reply) => {
      if (!redis) {
        throw new Error("Redis service is not running.");
      }

      const { ids } = parseCodemodStatusParams(request.params);

      const data: (CodemodRunStatus | null)[] = await Promise.all(
        ids.map(async (id) => {
          if (!redis) return null;
          const redisData = await redis.get(`job-${id}::status`);
          if (!redisData) return null;

          let parsed: CodemodRunStatus;
          try {
            parsed = parseCodemodStatusData(JSON.parse(redisData));
          } catch (err) {
            return null;
          }

          if (parsed.status === "done" || parsed.status === "error") {
            await prisma.codemodRun.update({
              where: { jobId: id },
              data: { data: parsed },
            });
          }

          return parsed;
        }),
      );

      return reply
        .type("application/json")
        .code(200)
        .send({ success: true, data: data.filter(Boolean) });
    },
  );

  done();
};

export const runServer = async () => await initApp([routes]);
