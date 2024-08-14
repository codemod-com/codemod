import type { IncomingMessage, ServerResponse } from "node:http";
import { OpenAIStream } from "ai";
import { ChatGPTAPI, type ChatMessage } from "chatgpt";
import * as openAiEdge from "openai-edge";
import { environment } from "../dev-utils/configs.js";
import { corsDisableHeaders } from "../dev-utils/cors.js";
import type { Instance } from "../fastifyInstance.js";
import { parseSendChatBody, roles } from "../schemata/schema.js";
import { ClaudeService } from "../services/claudeService.js";
import { ReplicateService } from "../services/replicateService.js";

const { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY, NODE_ENV } =
  environment;

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

export const getSendChatPath = (instance: Instance) =>
  instance.post(
    "/sendChat",
    { preHandler: instance.authenticate },
    async (request, reply) => {
      const { messages, engine } = parseSendChatBody(request.body);
      if (!messages[0]) {
        return reply.code(400).send();
      }

      const systemPrompt = {
        role: roles[0],
        content:
          "You are a helpful assistant with an expertise in coding, different programming languages, code migrations, and jscodeshift. You will help the user write a codemod using jscodeshift given a pair of a before and an after code snippet. If the question is related to programming, code migrations, and codemods, DO NOT answer. Instead, say: I am here to help with questions specifically about code migrations and codemods. If you have any questions related to those topics, feel free to ask!",
      };
      messages.unshift(systemPrompt);

      let completion: string | ChatMessage | null = null;
      try {
        if (engine === "claude-2.0" || engine === "claude-instant-1.2") {
          completion = await claudeService.complete(
            engine,
            messages[0].content,
          );
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
          const headers = corsDisableHeaders;

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
    },
  );

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
