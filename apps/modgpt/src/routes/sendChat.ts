import type { IncomingMessage, ServerResponse } from 'node:http';
import { OpenAIStream } from 'ai';
import { ChatGPTAPI, type ChatMessage } from 'chatgpt';
import * as openAiEdge from 'openai-edge';
import { environment, isDevelopment } from '../dev-utils/configs';
import { corsDisableHeaders } from '../dev-utils/cors';
import type { Instance } from '../fastifyInstance';
import { parseSendChatBody } from '../schemata/schema';
import { ClaudeService } from '../services/claudeService';
import { ReplicateService } from '../services/replicateService';

let { OPEN_AI_API_KEY, CLAUDE_API_KEY, REPLICATE_API_KEY, NODE_ENV } =
	environment;

let OpenAIConfiguration = openAiEdge.Configuration;

let COMPLETION_PARAMS = {
	top_p: 0.1,
	temperature: 0.2,
	model: 'gpt-4',
};

let chatGptApi = new ChatGPTAPI({
	apiKey: OPEN_AI_API_KEY,
	completionParams: COMPLETION_PARAMS,
});
let claudeService = new ClaudeService(CLAUDE_API_KEY, 1024);
let replicateService = new ReplicateService(REPLICATE_API_KEY);
let openAiEdgeApi = new openAiEdge.OpenAIApi(
	new OpenAIConfiguration({ apiKey: OPEN_AI_API_KEY }),
);

export let getSendChatPath = (instance: Instance) =>
	instance.post('/sendChat', async (request, reply) => {
		let { messages, engine } = parseSendChatBody(request.body);
		if (!messages[0]) {
			return reply.code(400).send();
		}

		let completion: string | ChatMessage | null = null;
		try {
			if (engine === 'claude-2.0' || engine === 'claude-instant-1.2') {
				completion = await claudeService.complete(
					engine,
					messages[0].content,
				);
			} else if (engine === 'replit-code-v1-3b') {
				completion = await replicateService.complete(
					messages[0].content,
				);
			} else if (engine === 'gpt-4-with-chroma') {
				let prompt = messages
					.map(({ content, role }) => `${role}: ${content}`)
					.join('\n');
				completion = await chatGptApi.sendMessage(prompt);
			} else if (openAiEdgeApi) {
				let response = await openAiEdgeApi.createChatCompletion({
					...COMPLETION_PARAMS,
					model: engine,
					messages: messages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					stream: true,
				});
				let headers = corsDisableHeaders;

				let stream = OpenAIStream(response);
				reply.raw.writeHead(200, headers);
				reply.hijack();
				let reader = stream.getReader();
				await pushStreamToReply(reader, reply.raw);
			} else {
				throw new Error(
					'You need to provide the OPEN_AI_API_KEY to use this endpoint',
				);
			}

			if (!reply.sent && completion) {
				reply.type('text/plain; charset=utf-8').send(completion);
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
	let { done, value } = await reader.read();
	if (done) {
		response.end();
		return;
	}
	response.write(value);
	await pushStreamToReply(reader, response);
}
