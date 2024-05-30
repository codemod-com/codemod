import { randomBytes } from "node:crypto";
import { PostHogSender } from "@codemod-com/telemetry";
import type { CodemodRunResponse } from "@codemod-com/utilities";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import { Queue } from "bullmq";
import Fastify, {
  type FastifyPluginCallback,
  type RouteHandlerMethod,
} from "fastify";
import Redis from "ioredis";
import { decrypt, encrypt } from "./crypto/crypto.js";
import {
  type CustomHandler,
  ForbiddenError,
  UnauthorizedError,
} from "./customHandler.js";
import { prisma } from "./db/prisma.js";
import { getCodemodBySlugHandler } from "./handlers/getCodemodBySlugHandler.js";
import { getCodemodDownloadLink } from "./handlers/getCodemodDownloadLink.js";
import { getCodemodsHandler } from "./handlers/getCodemodsHandler.js";
import { getCodemodsListHandler } from "./handlers/getCodemodsListHandler.js";
import authPlugin from "./plugins/authPlugin.js";
import { publishHandler } from "./publishHandler.js";
import {
  parseCodemodRunBody,
  parseCodemodStatusParams,
  parseCreateIssueBody,
  parseCreateIssueParams,
  parseDiffCreationBody,
  parseGetCodeDiffParams,
  parseGetRepoBranchesBody,
  parseGetRepoBranchesParams,
  parseGetUserRepositoriesParams,
  parseIv,
  parseValidateIntentParams,
} from "./schemata/schema.js";
import { GithubProvider } from "./services/GithubProvider.js";
import { SourceControl } from "./services/SourceControl.js";
import {
  CodemodNotFoundError,
  CodemodService,
} from "./services/codemodService.js";
import type { TelemetryEvents } from "./telemetry.js";
import { unpublishHandler } from "./unpublishHandler.js";
import { environment } from "./util.js";

export enum TaskManagerJobs {
  CODEMOD_RUN = "CODEMOD_RUN",
}

const getSourceControlProvider = (
  provider: "github",
  oAuthToken: string,
  repoUrl: string | null,
) => {
  switch (provider) {
    case "github": {
      return new GithubProvider(oAuthToken, repoUrl);
    }
  }
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

  await fastify.register(fastifyMultipart);
  await fastify.register(authPlugin);

  for (const plugin of toRegister) {
    await fastify.register(plugin);
  }

  await fastify.listen({ port, host: "0.0.0.0" });

  return fastify;
};

const sourceControl = new SourceControl();

const telemetryService = new PostHogSender<TelemetryEvents>({
  cloudRole: "",
  distinctId: "",
});

const codemodService = new CodemodService(prisma);

const redis = environment.REDIS_HOST
  ? new Redis({
      host: String(environment.REDIS_HOST),
      port: Number(environment.REDIS_PORT),
      maxRetriesPerRequest: null,
    })
  : null;

const queue = redis
  ? new Queue(environment.TASK_MANAGER_QUEUE_NAME ?? "", {
      connection: redis,
    })
  : null;

const wrapRequestHandlerMethod =
  <T>(handler: CustomHandler<T>): RouteHandlerMethod =>
  async (request, reply) => {
    const now = () => Date.now();

    try {
      const data = await handler({
        codemodService,
        telemetryService,
        now,
        request,
        reply,
        environment,
      });

      reply.type("application/json").code(200);

      return data;
    } catch (error) {
      if (error instanceof CodemodNotFoundError) {
        reply.type("application/json").code(400);
        return {
          error: "Codemod not found",
        };
      }

      if (error instanceof UnauthorizedError) {
        reply.code(401).send();
        return;
      }

      if (error instanceof ForbiddenError) {
        reply.code(403).send();
        return;
      }

      reply.code(500).send();
      console.error(error);
      return;
    }
  };

const routes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
  });

  instance.get(
    "/version",
    { preHandler: instance.getUserData },
    async (request, reply) => {
      const packageJson = await import(
        new URL("../package.json", import.meta.url).href,
        { assert: { type: "json" } }
      );

      console.log(request.user);
      reply.type("application/json").code(200);
      return { version: packageJson.default.version };
    },
  );

  instance.get(
    "/codemods/:slug",
    wrapRequestHandlerMethod(getCodemodBySlugHandler),
  );

  instance.get("/codemods", wrapRequestHandlerMethod(getCodemodsHandler));

  instance.get(
    "/codemods/downloadLink",
    wrapRequestHandlerMethod(getCodemodDownloadLink),
  );

  instance.get(
    "/codemods/list",
    wrapRequestHandlerMethod(getCodemodsListHandler),
  );

  instance.get("/diffs/:id", async (request, reply) => {
    const { id } = parseGetCodeDiffParams(request.params);
    const { iv: ivStr } = parseIv(request.query);

    const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
    const iv = Buffer.from(ivStr, "base64url");

    const codeDiff = await prisma.codeDiff.findUnique({
      where: { id },
    });

    if (!codeDiff) {
      reply.code(400).send();
      return;
    }

    let before: string;
    let after: string;
    try {
      before = decrypt(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(codeDiff.before, "base64url"),
      ).toString();
      after = decrypt(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(codeDiff.after, "base64url"),
      ).toString();
    } catch (err) {
      reply.code(400).send();
      return;
    }

    reply.type("application/json").code(200);
    return { before, after };
  });

  instance.post("/diffs", async (request, reply) => {
    const body = parseDiffCreationBody(request.body);

    const iv = randomBytes(16);
    const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");

    const codeDiff = await prisma.codeDiff.create({
      data: {
        name: body.name,
        source: body.source,
        before: encrypt(
          "aes-256-cbc",
          { key, iv },
          Buffer.from(body.before),
        ).toString("base64url"),
        after: encrypt(
          "aes-256-cbc",
          { key, iv },
          Buffer.from(body.after),
        ).toString("base64url"),
      },
    });

    reply.type("application/json").code(200);
    return { id: codeDiff.id, iv: iv.toString("base64url") };
  });

  instance.get(
    "/intents/:id",
    { preHandler: instance.authenticateCLI },
    async (request, reply) => {
      const { id } = parseValidateIntentParams(request.params);
      const { iv: ivStr } = parseIv(request.query);

      const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
      const iv = Buffer.from(ivStr, "base64url");

      const result = await prisma.userLoginIntent.findFirst({
        where: {
          id: decrypt(
            "aes-256-cbc",
            { key, iv },
            Buffer.from(id, "base64url"),
          ).toString(),
        },
      });

      if (result === null) {
        reply.code(400).send();
        return;
      }

      if (result.token === null) {
        reply.code(400).send();
        return;
      }

      const decryptedToken = decrypt(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(result.token, "base64url"),
      ).toString();

      await prisma.userLoginIntent.delete({
        where: { id: result.id },
      });

      reply.type("application/json").code(200);
      return { token: decryptedToken };
    },
  );

  instance.post(
    "/intents",
    { preHandler: instance.authenticateCLI },
    async (_request, reply) => {
      const result = await prisma.userLoginIntent.create({});

      const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
      const iv = randomBytes(16);
      const encryptedSessionId = encrypt(
        "aes-256-cbc",
        { key, iv },
        Buffer.from(result.id),
      ).toString("base64url");

      reply.type("application/json").code(200);
      return { id: encryptedSessionId, iv: iv.toString("base64url") };
    },
  );

  instance.post("/sourceControl/:provider/issues", async (request, reply) => {
    if (!auth) {
      throw new Error("This endpoint requires auth configuration.");
    }

    const { provider } = parseCreateIssueParams(request.params);

    const { repoUrl, title, body } = parseCreateIssueBody(request.body);

    const accessToken = getCustomAccessToken(environment, request.headers);

    if (accessToken === null) {
      return reply.code(401).send();
    }

    const userId = await tokenService.findUserIdMetadataFromToken(
      accessToken,
      BigInt(Date.now()),
      CLAIM_ISSUE_CREATION,
    );

    const oAuthToken = await auth.getOAuthToken(userId, provider);

    const sourceControlProvider = getSourceControlProvider(
      provider,
      oAuthToken,
      repoUrl,
    );

    const result = await sourceControl.createIssue(sourceControlProvider, {
      title,
      body,
    });

    reply.type("application/json").code(200);
    return result;
  });

  instance.post("/publish", wrapRequestHandlerMethod(publishHandler));

  instance.post("/unpublish", wrapRequestHandlerMethod(unpublishHandler));

  instance.get(
    "/sourceControl/:provider/user/repos",
    async (request, reply) => {
      if (!auth) {
        throw new Error("This endpoint requires auth configuration.");
      }

      // getting userId from clerk directly should be safe
      const { userId } = getAuth(request);

      if (!userId) {
        return reply.code(401).send();
      }

      const { provider } = parseGetUserRepositoriesParams(request.params);

      const oAuthToken = await auth.getOAuthToken(userId, provider);

      const sourceControlProvider = getSourceControlProvider(
        provider,
        oAuthToken,
        null,
      );

      const result = await sourceControl.getUserRepositories(
        sourceControlProvider,
      );
      reply.type("application/json").code(200);
      return result;
    },
  );

  instance.post(
    "/sourceControl/:provider/repo/branches",
    async (request, reply) => {
      if (!auth) {
        throw new Error("This endpoint requires auth configuration.");
      }

      // getting userId from clerk directly should be safe
      const { userId } = getAuth(request);

      if (!userId) {
        return reply.code(401).send();
      }

      const { provider } = parseGetRepoBranchesParams(request.params);
      const { repoUrl } = parseGetRepoBranchesBody(request.body);

      const oAuthToken = await auth.getOAuthToken(userId, provider);

      const sourceControlProvider = getSourceControlProvider(
        provider,
        oAuthToken,
        repoUrl,
      );

      const result = await sourceControl.getBranches(sourceControlProvider);

      reply.type("application/json").code(200);
      return result;
    },
  );

  instance.post(
    "/codemodRun",
    async (request, reply): Promise<CodemodRunResponse> => {
      if (!auth) {
        throw new Error("This endpoint requires auth configuration.");
      }

      if (!queue) {
        throw new Error("Queue service is not running.");
      }

      const { userId } = getAuth(request);

      if (!userId) {
        return reply.code(401).send();
      }

      const { codemodName, codemodSource, codemodEngine, repoUrl, branch } =
        parseCodemodRunBody(request.body);

      const job = await queue.add(TaskManagerJobs.CODEMOD_RUN, {
        codemodName,
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

  instance.get("/codemodRun/status/:jobId", async (request, reply) => {
    if (!auth) {
      throw new Error("This endpoint requires auth configuration.");
    }

    if (!redis) {
      throw new Error("Redis service is not running.");
    }

    const { userId } = getAuth(request);

    if (!userId) {
      return reply.code(401).send();
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
  });

  done();
};

export const runServer = async () => await initApp([routes]);
