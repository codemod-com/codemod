import { randomBytes } from "node:crypto";
import { prisma } from "@codemod-com/database";
import {
  type CodemodListResponse,
  type CodemodRunResponse,
  type User,
  decryptWithIv,
  encryptWithIv,
} from "@codemod-com/utilities";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify, {
  type FastifyPluginCallback,
  type FastifyRequest,
} from "fastify";
import {
  type GetCodemodDownloadLinkResponse,
  getCodemodDownloadLink,
} from "./handlers/getCodemodDownloadLink.js";
import { getCodemodHandler } from "./handlers/getCodemodHandler.js";
import { getCodemodsHandler } from "./handlers/getCodemodsHandler.js";
import { getCodemodsListHandler } from "./handlers/getCodemodsListHandler.js";
import authPlugin from "./plugins/authPlugin.js";
import {
  type PublishHandlerResponse,
  publishHandler,
} from "./publishHandler.js";
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
} from "./schemata/schema.js";
import { GithubProvider } from "./services/GithubProvider.js";
import { queue, redis } from "./services/Redis.js";
import { sourceControl } from "./services/SourceControl.js";
import {
  type UnPublishHandlerResponse,
  unpublishHandler,
} from "./unpublishHandler.js";
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

const routes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
  });

  instance.get<{ Reply: { version: string } }>(
    "/version",
    async (request, reply) => {
      const packageJson = await import(
        new URL("../package.json", import.meta.url).href,
        { assert: { type: "json" } }
      );

      reply.type("application/json").code(200);
      return { version: packageJson.default.version };
    },
  );

  instance.get("/codemods/:criteria", getCodemodHandler);

  instance.get("/codemods", getCodemodsHandler);

  instance.get<{ Reply: GetCodemodDownloadLinkResponse }>(
    "/codemods/downloadLink",
    { preHandler: [instance.getUserData] },
    getCodemodDownloadLink,
  );

  instance.get<{ Reply: CodemodListResponse }>(
    "/codemods/list",
    { preHandler: [instance.getUserData] },
    getCodemodsListHandler,
  );

  instance.get<{ Reply: { before: string; after: string } }>(
    "/diffs/:id",
    async (request, reply) => {
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
        before = decryptWithIv(
          "aes-256-cbc",
          { key, iv },
          Buffer.from(codeDiff.before, "base64url"),
        ).toString();
        after = decryptWithIv(
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
    },
  );

  instance.post<{ Reply: { id: string; iv: string } }>(
    "/diffs",
    async (request, reply) => {
      const body = parseDiffCreationBody(request.body);

      const iv = randomBytes(16);
      const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");

      const codeDiff = await prisma.codeDiff.create({
        data: {
          name: body.name,
          source: body.source,
          before: encryptWithIv(
            "aes-256-cbc",
            { key, iv },
            Buffer.from(body.before),
          ).toString("base64url"),
          after: encryptWithIv(
            "aes-256-cbc",
            { key, iv },
            Buffer.from(body.after),
          ).toString("base64url"),
        },
      });

      reply.type("application/json").code(200);
      return { id: codeDiff.id, iv: iv.toString("base64url") };
    },
  );

  instance.post<{
    Reply: { html_url: string };
  }>(
    "/sourceControl/:provider/issues",
    { preHandler: instance.getOAuthToken },
    async (
      request: FastifyRequest & {
        token?: string;
      },
      reply,
    ) => {
      const { provider } = parseCreateIssueParams(request.params);
      const { repoUrl, title, body } = parseCreateIssueBody(request.body);

      const sourceControlProvider = getSourceControlProvider(
        provider,
        request.token!,
        repoUrl,
      );

      const result = await sourceControl.createIssue(sourceControlProvider, {
        title,
        body,
      });

      reply.type("application/json").code(200);
      return result;
    },
  );

  instance.post<{
    Reply: PublishHandlerResponse;
  }>("/publish", { preHandler: instance.getUserData }, publishHandler);

  instance.post<{ Reply: UnPublishHandlerResponse }>(
    "/unpublish",
    { preHandler: instance.getUserData },
    unpublishHandler,
  );

  instance.get(
    "/sourceControl/:provider/user/repos",
    { preHandler: instance.getOAuthToken },
    async (
      request: FastifyRequest & {
        token?: string;
      },
      reply,
    ) => {
      const { provider } = parseGetUserRepositoriesParams(request.params);

      const sourceControlProvider = getSourceControlProvider(
        provider,
        request.token!,
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
    { preHandler: instance.getOAuthToken },
    async (
      request: FastifyRequest & {
        token?: string;
      },
      reply,
    ) => {
      const { provider } = parseGetRepoBranchesParams(request.params);
      const { repoUrl } = parseGetRepoBranchesBody(request.body);

      const sourceControlProvider = getSourceControlProvider(
        provider,
        request.token!,
        repoUrl,
      );

      const result = await sourceControl.getBranches(sourceControlProvider);

      reply.type("application/json").code(200);
      return result;
    },
  );
  done();
};

export const runServer = async () => await initApp([routes]);
