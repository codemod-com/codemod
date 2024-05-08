import "dotenv/config";

import { clerkPlugin, getAuth } from "@clerk/fastify";
import cors, { fastifyCors, type FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import { OpenAIStream } from "ai";
import { ChatGPTAPI } from "chatgpt";
import "dotenv/config";
import Fastify, {
  type FastifyInstance,
  type FastifyPluginCallback,
} from "fastify";
import * as openAiEdge from "openai-edge";

import { parseSendChatBody } from "./schemata/schema";
import { areClerkKeysSet, environment } from "./util";

import { ClaudeService } from "./services/claudeService";
import { ReplicateService } from "./services/replicateService";

const { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY } = environment;

const OpenAIConfiguration = openAiEdge.Configuration;

const COMPLETION_PARAMS = {
  top_p: 0.1,
  temperature: 0.2,
  model: "gpt-4",
};

const chatGptApi = new ChatGPTAPI({
  apiKey: OPEN_AI_API_KEY,
  completionParams: COMPLETION_PARAMS,
});

const claudeService = new ClaudeService(CLAUDE_API_KEY, 1024);
const replicateService = new ReplicateService(REPLICATE_API_KEY);
const openAiEdgeApi = new openAiEdge.OpenAIApi(
  new OpenAIConfiguration({ apiKey: OPEN_AI_API_KEY }),
);

const X_CODEMOD_ACCESS_TOKEN = (
  environment.X_CODEMOD_ACCESS_TOKEN ?? ""
).toLocaleLowerCase();

const fastify: FastifyInstance = Fastify({
  logger: true,
  trustProxy: true,
});

fastify.register(fastifyCors, { origin: false });

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
    exposedHeaders: [
      X_CODEMOD_ACCESS_TOKEN,
      "x-clerk-auth-reason",
      "x-clerk-auth-message",
    ],
    allowedHeaders: [
      X_CODEMOD_ACCESS_TOKEN,
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

  for (const plugin of toRegister) {
    await fastify.register(plugin);
  }

  await fastify.listen({ port, host: "0.0.0.0" });

  return fastify;
};

const publicRoutes: FastifyPluginCallback = (instance, _opts, done) => {
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
  });

  instance.get("/version", async (_, reply) => {
    const packageJson = await import(
      new URL("../package.json", import.meta.url).href,
      { assert: { type: "json" } }
    );
    reply.type("application/json").code(200);
    return { version: packageJson.default.version };
  });

  done();
};

const protectedRoutes: FastifyPluginCallback = (instance, _opts, done) => {
  if (areClerkKeysSet(environment)) {
    const clerkOptions = {
      publishableKey: environment.CLERK_PUBLISH_KEY,
      secretKey: environment.CLERK_SECRET_KEY,
      jwtKey: environment.CLERK_JWT_KEY,
    };

    instance.register(clerkPlugin, clerkOptions);
  } else {
    console.warn("No Clerk keys set. Authentication is disabled.");
  }

  instance.post("/sendChat", async (request, reply) => {
    if (areClerkKeysSet(environment)) {
      const { userId } = getAuth(request);
      if (!userId) {
        return reply.code(401).send();
      }
    } else {
      console.warn("No Clerk keys set. Authentication is disabled.");
    }

    const { messages, engine } = parseSendChatBody(request.body);

    if (!messages[0]) {
      return reply.code(400).send();
    }

    if (engine === "claude-2.0" || engine === "claude-instant-1.2") {
      const completion = await claudeService.complete(
        engine,
        messages[0].content,
      );

      reply.type("text/plain; charset=utf-8").code(200);
      return completion ?? "";
    }

    if (engine === "replit-code-v1-3b") {
      const completion = await replicateService.complete(messages[0].content);

      reply.type("text/plain; charset=utf-8").code(200);
      return completion ?? "";
    }

    if (engine === "gpt-4-with-chroma") {
      const prompt = messages
        .map(({ content, role }) => `${role}: ${content}`)
        .join("\n");

      const completion = await chatGptApi.sendMessage(prompt);

      reply.type("text/plain; charset=utf-8").code(200);
      return completion ?? "";
    }

    if (openAiEdgeApi === null) {
      throw new Error(
        "You need to provide the OPEN_AI_API_KEY to use this endpoint",
      );
    }

    const response = await openAiEdgeApi.createChatCompletion({
      ...COMPLETION_PARAMS,
      model: engine,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    const stream = OpenAIStream(response);

    reply.hijack();
    const headers = { "Content-Type": "text/plain; charset=utf-8" };
    reply.raw.writeHead(200, headers);

    const reader = stream.getReader();

    const pushToReply = async () => {
      const { done, value } = await reader.read();
      if (done) {
        reply.raw.end();
        return;
      }
      reply.raw.write(value);
      await pushToReply();
    };

    await pushToReply();
  });

  done();
};

export const runServer = async () =>
  await initApp([publicRoutes, protectedRoutes]);
