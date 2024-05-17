import { ChromaClient } from 'chromadb';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { findFunctionComponent } from './chromaSnippets/findFunctionComponent.js';
import { findPositionAfterImports } from './chromaSnippets/findPositionAfterImports.js';
import type { Environment } from './schemata/env.js';

let buildChromaService = async (environment: Environment) => {
	if (environment.OPEN_AI_API_KEY === undefined) {
		return {
			complete: () => {
				throw new Error(
					'You cannot run the Chroma service without providing an API key',
				);
			},
		};
	}

	let model = new OpenAI({
		openAIApiKey: environment.OPEN_AI_API_KEY,
		modelName: 'gpt-4',
		topP: 0.1,
		temperature: 0.2,
		// IMPORTANT!
		maxTokens: -1,
	});

	let COLLECTION_NAME = 'codemod_snippets';

	let c = new ChromaClient();
	c.deleteCollection({ name: COLLECTION_NAME });

	let vectorStore = await Chroma.fromTexts(
		[findFunctionComponent, findPositionAfterImports],
		[],
		new OpenAIEmbeddings({ openAIApiKey: environment.OPEN_AI_API_KEY }),
		{
			collectionName: COLLECTION_NAME,
			url: environment.CHROMA_BACKEND_URL,
		},
	);

	let chain = ConversationalRetrievalQAChain.fromLLM(
		model,
		vectorStore.asRetriever({ k: 1 }),
	);

	let complete = async (prompt: string): Promise<string | null> => {
		let abortController = new AbortController();

		let timeout = 60_000;

		let runOutputPromise = await chain.call({
			question: `
				${prompt} 
				 Remember to injected the SNIPPET functions value into the result codemod.
				 `,
			chat_history: '',
			timeout,
			signal: abortController.signal,
		});

		let timeoutPromise = new Promise<null>((resolve) => {
			setTimeout(() => {
				resolve(null);
			}, timeout);
		});

		let output = await Promise.race([runOutputPromise, timeoutPromise]);

		abortController.abort();

		return output !== null ? output.text : null;
	};

	return {
		complete,
	};
};

export let buildSafeChromaService = async (environment: Environment) => {
	try {
		return await buildChromaService(environment);
	} catch (error) {
		console.error(error);

		return {
			complete: () => null,
		};
	}
};
