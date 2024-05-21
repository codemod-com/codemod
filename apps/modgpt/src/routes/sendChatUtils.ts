import type { IncomingMessage, ServerResponse } from "node:http";
import { getAuth } from "@clerk/fastify";
import { OpenAIStream } from "ai";
import { ChatGPTAPI, type ChatMessage } from "chatgpt";
import type { FastifyPluginCallback } from "fastify";
import * as openAiEdge from "openai-edge";
import {
  areClerkKeysSet,
  clerkApplied,
  environment,
} from "../dev-utils/configs";
import { isDevelopment } from "../dev-utils/configs";
import { corsDisableHeaders, getCorsDisabledHeaders } from "../dev-utils/cors";
import type { Instance } from "../fastifyInstance";
import { parseSendChatBody } from "../schemata/schema";
import { ClaudeService } from "../services/claudeService";
import { ReplicateService } from "../services/replicateService";

const { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY, NODE_ENV } =
  environment;
export const OpenAIConfiguration = openAiEdge.Configuration;

export const COMPLETION_PARAMS = {
  top_p: 0.1,
  temperature: 0.2,
  model: "gpt-4",
};

export const chatGptApi = new ChatGPTAPI({
  apiKey: OPEN_AI_API_KEY,
  completionParams: COMPLETION_PARAMS,
});
export const claudeService = new ClaudeService(CLAUDE_API_KEY, 1024);
export const replicateService = new ReplicateService(REPLICATE_API_KEY);
export const openAiEdgeApi = new openAiEdge.OpenAIApi(
  new OpenAIConfiguration({ apiKey: OPEN_AI_API_KEY }),
);

export async function pushStreamToReply(
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
