import type { IncomingMessage, ServerResponse } from "node:http";
import { getAuth } from "@clerk/fastify";
import { OpenAIStream } from "ai";
import { ChatGPTAPI } from "chatgpt";
import type { FastifyPluginCallback } from "fastify";
import * as openAiEdge from "openai-edge";
import { areClerkKeysSet, environment } from "../dev-utils/configs";
import { isDevelopment } from "../dev-utils/configs";
import { getCorsDisabledHeaders } from "../dev-utils/cors";
import { type Instance, fastify } from "../fastifyInstance";
import { parseSendChatBody } from "../schemata/schema";
import { ClaudeService } from "../services/claudeService";
import { ReplicateService } from "../services/replicateService";

const { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY, NODE_ENV } =
  environment;

const OpenAIConfiguration = openAiEdge.Configuration;

const COMPLETION_PARAMS = {
  top_p: 0.1,
  temperature: 0.2,
  model: "gpt-4",
};

const headers = isDevelopment
  ? getCorsDisabledHeaders(fastify)
  : { "Access-Control-Allow-Origin": "false" };

const chatGptApi = new ChatGPTAPI({
  apiKey: OPEN_AI_API_KEY,
  completionParams: COMPLETION_PARAMS,
});
const claudeService = new ClaudeService(CLAUDE_API_KEY, 1024);
const replicateService = new ReplicateService(REPLICATE_API_KEY);
const openAiEdgeApi = new openAiEdge.OpenAIApi(
  new OpenAIConfiguration({ apiKey: OPEN_AI_API_KEY }),
);

export const getSendChatPath = (instance: Instance) =>
  instance.post("/sendChat", async (request, reply) => {
    if (!isDevelopment && areClerkKeysSet(environment)) {
      const { userId } = getAuth(request);
      if (!userId) {
        reply.code(401).send();
        return;
      }
    } else {
      console.warn("No Clerk keys set. Authentication is disabled.");
    }

    const { messages, engine } = parseSendChatBody(request.body);
    if (!messages[0]) {
      return reply.code(400).send();
    }

    let completion: string | null;
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

async function pushStreamToReply(
  reader: ReadableStreamDefaultReader,
  response: ServerResponse<IncomingMessage>,
) {
  const { done, value } = await reader.read();
  if (done) {
    response.end();
    return;
  }
  response.write(value);
  await pushStreamToReply(reader, response);
}
