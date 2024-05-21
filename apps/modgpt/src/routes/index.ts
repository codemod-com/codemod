import { clerkPlugin, getAuth } from "@clerk/fastify";
import { OpenAIStream } from "ai";
import type { ChatMessage } from "chatgpt";
import Fastify, {
  type FastifyInstance,
  type FastifyPluginCallback,
} from "fastify";
import {
  areClerkKeysSet,
  clerkApplied,
  environment,
  isDevelopment,
} from "../dev-utils/configs";
import { corsDisableHeaders } from "../dev-utils/cors";
import { parseSendChatBody } from "../schemata/schema";
import { getRootPath } from "./root";
import {
  COMPLETION_PARAMS,
  chatGptApi,
  claudeService,
  openAiEdgeApi,
  pushStreamToReply,
  replicateService,
} from "./sendChatUtils";
import { getVersionPath } from "./version";

export const publicRoutes: FastifyPluginCallback = (instance, _opts, done) => {
  [getRootPath, getVersionPath].forEach((f) => f(instance));
  instance.options("/sendChat", (request, reply) => {
    reply.status(204).headers(corsDisableHeaders).send();
  });
  done();
};

export const protectedRoutes: FastifyPluginCallback = (
  instance,
  _opts,
  done,
) => {
  instance.post("/sendChat", async (request, reply) => {
    if (!isDevelopment && clerkApplied) {
      const { userId } = getAuth(request);
      if (!userId) {
        reply.code(401).send();
        return;
      }
    } else {
      if (!clerkApplied)
        console.warn("No Clerk keys set. Authentication is disabled.");
      if (isDevelopment) console.info("ENV set to development");
    }

    const { messages, engine } = parseSendChatBody(request.body);
    if (!messages[0]) {
      return reply.code(400).send();
    }

    let completion: string | ChatMessage | null = null;
    try {
      if (engine === "claude-2.0" || engine === "claude-instant-1.2") {
        completion = await claudeService.complete(engine, messages[0].content);
      } else if (engine === "replit-code-v1-3b") {
        completion = await replicateService.complete(messages[0].content);
      } else if (engine === "gpt-4-with-chroma") {
        const prompt = messages
          .map(({ content, role }) => `${role}: ${content}`)
          .join("\n");
        completion = await chatGptApi.sendMessage(prompt);
      } else if (openAiEdgeApi) {
        const response = await openAiEdgeApi.createChatCompletion({
          ...COMPLETION_PARAMS,
          model: engine,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
        });
        const headers = isDevelopment
          ? corsDisableHeaders
          : { "Access-Control-Allow-Origin": "false" };

        const stream = OpenAIStream(response);
        reply.raw.writeHead(200, headers);
        reply.hijack();
        const reader = stream.getReader();
        await pushStreamToReply(reader, reply.raw);
      } else {
        throw new Error(
          "You need to provide the OPEN_AI_API_KEY to use this endpoint",
        );
      }

      if (!reply.sent && completion) {
        reply.type("text/plain; charset=utf-8").send(completion);
      }
    } catch (error) {
      console.error(error);
      reply.send(error);
    }
  });
  done();
};
