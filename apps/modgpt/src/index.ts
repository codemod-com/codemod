import fastifyCors from "@fastify/cors";
import { OpenAIStream } from "ai";
import { ChatGPTAPI } from "chatgpt";
import "dotenv/config";
import Fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type RouteGenericInterface,
} from "fastify";
import * as openAiEdge from "openai-edge";
import { parseSendChatBody } from "./schemata/schema";
import { ClaudeService } from "./services/claudeService";
import { ReplicateService } from "./services/replicateService";
import { environment } from "./util";

const { PORT, OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY } =
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

const fastify: FastifyInstance = Fastify({
  logger: true,
  trustProxy: true,
});

fastify.register(fastifyCors, { origin: false });

interface ChatRequestBody {
  messages: { role: string; content: string }[];
  engine: string;
}

interface ChatRequest extends FastifyRequest<RouteGenericInterface> {
  Body: ChatRequestBody;
}

fastify.get("/version", async (_, reply) => {
  const packageJson = await import(
    new URL("../package.json", import.meta.url).href,
    { assert: { type: "json" } }
  );
  reply.type("application/json").code(200);
  return { version: packageJson.default.version };
});

fastify.post<ChatRequest>("/sendChat", async (request, reply) => {
  const { messages, engine } = parseSendChatBody(request.body);

  if (!messages[0]) {
    reply.code(400).send({ error: "Message content missing" });
    return;
  }

  try {
    if (engine === "claude-2.0" || engine === "claude-instant-1.2") {
      const completion = await claudeService.complete(
        engine,
        messages[0].content,
      );
      reply.type("text/plain; charset=utf-8").send(completion ?? "");
    } else if (engine === "replit-code-v1-3b") {
      const completion = await replicateService.complete(messages[0].content);
      reply.type("text/plain; charset=utf-8").send(completion ?? "");
    } else if (engine === "gpt-4-with-chroma") {
      const prompt = messages
        .map(({ content, role }) => `${role}: ${content}`)
        .join("\n");
      const completion = await chatGptApi.sendMessage(prompt);
      reply.type("text/plain; charset=utf-8").send(completion ?? "");
    }

    const response = await openAiEdgeApi.createChatCompletion({
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
  } catch (error) {
    reply.code(500).send({ error: "Internal server error" });
    console.error(error);
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`[ModGPT]: Server is running at PORT: ß${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
