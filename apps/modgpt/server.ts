import { OpenAIStream } from "ai";
import { ChatGPTAPI } from "chatgpt";
import "dotenv/config";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import * as openAiEdge from "openai-edge";
import { ClaudeService } from "./claudeService";
import { ReplicateService } from "./replicateService";

const OpenAIConfiguration = openAiEdge.Configuration;
// Load environment variables
const environment = {
  OPEN_AI_API_KEY: process.env.OPENAI_API_KEY,
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
};

const COMPLETION_PARAMS = {
  top_p: 0.1,
  temperature: 0.2,
  model: "gpt-4",
};

// Initialize services
const chatGptApi = new ChatGPTAPI({
  apiKey: environment.OPEN_AI_API_KEY,
  completionParams: COMPLETION_PARAMS,
});

const claudeService = new ClaudeService(environment.CLAUDE_API_KEY, 1024);
const replicateService = new ReplicateService(environment.REPLICATE_API_KEY);
const openAiEdgeApi = new openAiEdge.OpenAIApi(
  new OpenAIConfiguration({ apiKey: environment.OPEN_AI_API_KEY }),
);

// Initialize Fastify
const fastify: FastifyInstance = Fastify({
  logger: true,
  trustProxy: true, // Optional: Trust the reverse proxy when running locally with proxy setups
});

// Disable CORS
fastify.register(require("@fastify/cors"), () => false);

// Define the types for the incoming request body
interface ChatRequestBody {
  messages: { role: string; content: string }[];
  engine: string;
}

// This interface extends the generic FastifyRequest to include your specific body type
interface ChatRequest
  extends FastifyRequest<{
    Body: ChatRequestBody;
  }> {}

fastify.post<ChatRequest>("/sendChat", async (request, reply) => {
  const { messages, engine } = request.body;

  if (!messages[0]) {
    reply.code(400).send({ error: "Message content missing" });
    return;
  }

  try {
    if (["claude-2.0", "claude-instant-1.2"].includes(engine)) {
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
    } else if (engine.startsWith("gpt")) {
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
    }
  } catch (error) {
    reply.code(500).send({ error: "Internal server error" });
    console.error(error);
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running at http://0.0.0.0:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
