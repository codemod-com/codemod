import {
  type ApiResponse,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "@codemod-com/api-types";
import type { MultipartFile } from "@fastify/multipart";
import OpenAI from "openai";

import { corsDisableHeaders } from "src/dev-utils/cors.js";
import { environment } from "../dev-utils/configs.js";
import type { Instance } from "../fastifyInstance.js";
import { parseSendChatBody } from "../schemata/schema.js";
import { ClaudeService } from "../services/claudeService.js";
import { ReplicateService } from "../services/replicateService.js";

const { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY, NODE_ENV } =
  environment;

const claudeService = new ClaudeService(CLAUDE_API_KEY, 1024);
const replicateService = new ReplicateService(REPLICATE_API_KEY);

const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
});

export const getSendChatPath = (instance: Instance) =>
  instance.post<{
    Reply: ApiResponse<
      Awaited<ReturnType<typeof openai.chat.completions.create>> | string
    >;
  }>(
    "/sendChat",
    { preHandler: instance.authenticate },
    async (request, reply) => {
      const { messages, engine } = parseSendChatBody(request.body);

      const systemPrompt: (typeof messages)[number] = {
        role: "system",
        content:
          "Please focus on providing assistance primarily with code-related tasks, including but not limited to programming, debugging, software, algorithm design, code optimization, code migration, and codemod generation. Additionally, address related topics such as best practices, tool recommendations, technical documentation, and explanations of programming concepts. Avoid discussions unrelated to coding and technical topics unless they are to clarify or enhance the understanding of the code-related matter at hand.",
      };
      messages.unshift(systemPrompt);

      let completion:
        | Awaited<ReturnType<typeof openai.chat.completions.create>>
        | string
        | null = null;

      try {
        switch (engine) {
          case "claude-2.0":
          case "claude-instant-1.2":
            completion = await claudeService.complete(
              engine,
              messages[0].content,
            );
            break;
          case "replit-code-v1-3b":
            completion = await replicateService.complete(messages[0].content);
            break;
          case "gpt-4-with-chroma":
            completion = await openai.chat.completions.create({
              messages,
              model: engine ?? "gpt-4",
            });
            break;
        }

        if (completion) {
          return reply.type("text/plain; charset=utf-8").send(completion);
        }

        const files: MultipartFile[] = [];
        for await (const multipartFile of request.files({
          // 15 MB
          limits: { fileSize: 1024 * 1024 * 15 },
        })) {
          files.push(multipartFile);
        }

        if (files.length > 1) {
          return reply.status(400).send({
            errorText: "Only one file is allowed",
            error: BAD_REQUEST,
          });
        }

        if (files[0]) {
          await openai.files.create({
            file: await OpenAI.toFile(files[0].toBuffer(), "codemod.zip"),
            purpose: "fine-tune",
          });
        }

        const stream = await openai.chat.completions.create({
          top_p: 0.1,
          temperature: 0.2,
          model: engine ?? "gpt-4",
          messages,
          stream: true,
        });

        reply.raw.writeHead(200, corsDisableHeaders);
        for await (const chunk of stream) {
          reply.raw.write(chunk.choices[0]?.delta.content ?? "");
        }

        reply.raw.end();
      } catch (error) {
        console.error(error);
        reply.send({
          errorText: (error as Error).message,
          error: INTERNAL_SERVER_ERROR,
        });
      }
    },
  );
