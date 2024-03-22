import "dotenv/config";

import { OutgoingHttpHeaders } from "node:http";
import { clerkPlugin, createClerkClient, getAuth } from "@clerk/fastify";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import { Codemod, CodemodVersion, Prisma } from "@prisma/client";
import { OpenAIStream } from "ai";
import Fastify, { FastifyPluginCallback, RouteHandlerMethod } from "fastify";
import Fuse from "fuse.js";
import * as openAiEdge from "openai-edge";
import { buildSafeChromaService } from "./chroma.js";
import { ClaudeService } from "./claudeService.js";
import { COMPLETION_PARAMS } from "./constants.js";
import {
	CustomHandler,
	ForbiddenError,
	UnauthorizedError,
} from "./customHandler.js";
import { buildDataAccessLayer } from "./db/dataAccessLayer.js";
import { prisma } from "./db/prisma.js";
import { buildAccessTokenHandler } from "./handlers/buildAccessTokenHandler.js";
import { revokeTokenHandler } from "./handlers/revokeTokenHandler.js";
import { validationHandler } from "./handlers/validationHandler.js";
import { publishHandler } from "./publishHandler.js";
import { ReplicateService } from "./replicateService.js";
import { parseEnvironment } from "./schemata/env.js";
import {
	parseGetCodemodBySlugParams,
	parseGetCodemodLatestVersionQuery,
	parseGetCodemodsQuery,
	parseListCodemodsQuery,
} from "./schemata/query.js";
import {
	parseCreateIssueBody,
	parseCreateIssueParams,
	parseSendChatBody,
	parseSendMessageBody,
} from "./schemata/schema.js";
import { Auth } from "./services/Auth.js";
import { GithubProvider } from "./services/GithubProvider.js";
import { SourceControl } from "./services/SourceControl.js";
import {
	CLAIM_ISSUE_CREATION,
	TokenExpiredError,
	TokenInsufficientClaimsError,
	TokenNotFoundError,
	TokenNotVerifiedError,
	TokenRevokedError,
	TokenService,
} from "./services/tokenService.js";
import { areClerkKeysSet, getCustomAccessToken } from "./util.js";

const getSourceControlProvider = (
	provider: "github",
	repo: string,
	oAuthToken: string,
) => {
	switch (provider) {
		case "github": {
			return new GithubProvider(repo, oAuthToken);
		}
	}
};

export const environment = parseEnvironment(process.env);

const X_CODEMOD_ACCESS_TOKEN = (
	environment.X_CODEMOD_ACCESS_TOKEN ?? ""
).toLocaleLowerCase();
const X_INTUITA_ACCESS_TOKEN = (
	environment.X_INTUITA_ACCESS_TOKEN ?? ""
).toLocaleLowerCase();

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

	await fastify.register(cors, {
		origin: (origin, cb) => {
			if (!origin) {
				cb(null, true);
				return;
			}

			const hostname = new URL(origin).hostname.replace(/^www\./, "");

			if (hostname === "localhost" || hostname === "codemod.studio") {
				cb(null, true);
				return;
			}

			cb(new Error("Not allowed"), false);
		},
		methods: ["POST", "PUT", "PATCH", "GET", "DELETE", "OPTIONS"],
		exposedHeaders: [
			X_CODEMOD_ACCESS_TOKEN,
			// TODO deprecated
			X_INTUITA_ACCESS_TOKEN,
			"x-clerk-auth-reason",
			"x-clerk-auth-message",
		],
		allowedHeaders: [
			X_CODEMOD_ACCESS_TOKEN,
			// TODO deprecated
			X_INTUITA_ACCESS_TOKEN,
			"Content-Type",
			"Authorization",
		],
	} satisfies FastifyCorsOptions);

	await fastify.register(fastifyRateLimit, {
		max: 100,
		timeWindow: 60 * 1000, // 1 minute
	});

	await fastify.register(fastifyMultipart);

	for (const plugin of toRegister) {
		await fastify.register(plugin);
	}

	await fastify.listen({ port, host: "0.0.0.0" });

	return fastify;
};

const dataAccessLayer = await buildDataAccessLayer();

const { ChatGPTAPI } = await import("chatgpt");

const chromaService = await buildSafeChromaService(environment);

const sourceControl = new SourceControl();
const auth = environment.CLERK_SECRET_KEY
	? new Auth(environment.CLERK_SECRET_KEY)
	: null;

const chatGptApi =
	environment.OPEN_AI_API_KEY !== undefined
		? new ChatGPTAPI({
				apiKey: environment.OPEN_AI_API_KEY,
				completionParams: {
					...COMPLETION_PARAMS,
				},
		  })
		: null;

const openAiEdgeApi =
	environment.OPEN_AI_API_KEY !== undefined
		? new openAiEdge.OpenAIApi(
				new openAiEdge.Configuration({
					apiKey: environment.OPEN_AI_API_KEY,
				}),
		  )
		: null;

const tokenService = new TokenService(
	dataAccessLayer,
	environment.ENCRYPTION_KEY ?? "",
	environment.SIGNATURE_PRIVATE_KEY ?? "",
	environment.PEPPER ?? "",
);

const clerkClient = areClerkKeysSet(environment)
	? createClerkClient({
			publishableKey: environment.CLERK_PUBLISH_KEY,
			secretKey: environment.CLERK_SECRET_KEY,
			jwtKey: environment.CLERK_JWT_KEY,
	  })
	: null;

const wrapRequestHandlerMethod =
	<T>(handler: CustomHandler<T>): RouteHandlerMethod =>
	async (request, reply) => {
		const getAccessTokenOrThrow = () => {
			const accessToken = getCustomAccessToken(environment, request.headers);

			if (accessToken === null) {
				throw new UnauthorizedError();
			}

			return accessToken;
		};

		const setAccessToken = (accessToken: string) => {
			reply.header(X_INTUITA_ACCESS_TOKEN, accessToken);
			reply.header(X_CODEMOD_ACCESS_TOKEN, accessToken);
		};

		const getClerkUserId = async (): Promise<string> => {
			const { userId } = getAuth(request);

			if (!userId) {
				throw new UnauthorizedError();
			}

			return userId;
		};

		const now = () => Date.now();

		try {
			const data = await handler({
				tokenService,
				getAccessTokenOrThrow,
				setAccessToken,
				clerkClient,
				getClerkUserId,
				now,
			});

			reply.type("application/json").code(200);

			return data;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				reply.type("application/json").code(400);

				return {
					error: "Token expired",
				};
			}

			if (error instanceof TokenRevokedError) {
				reply.type("application/json").code(400);
				return {
					error: "Token revoked",
				};
			}
			if (error instanceof TokenNotFoundError) {
				reply.type("application/json").code(400);
				return {
					error: "Token not found",
				};
			}
			if (error instanceof TokenInsufficientClaimsError) {
				reply.type("application/json").code(400);
				return {
					error: "Token has insufficient claims",
				};
			}
			if (error instanceof TokenNotVerifiedError) {
				reply.type("application/json").code(400);
				return {
					error: "Token not verified",
				};
			}

			if (error instanceof UnauthorizedError) {
				reply.code(401).send();
				return;
			}

			if (error instanceof ForbiddenError) {
				reply.code(403).send();
				return;
			}

			reply.code(500).send();
			return;
		}
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

	instance.get("/codemods", async (request, reply) => {
		const query = parseGetCodemodsQuery(request.query);

		const search = query.search;
		const category = query.category;
		const author = query.author;
		const verified = query.verified;

		const page = query.page || 1;
		const size = query.size || 10;
		const skip = (page - 1) * size;

		const filterClauses: Prisma.CodemodWhereInput["AND"] = [];

		if (search) {
			filterClauses.push({
				OR: [
					{
						name: {
							contains: search,
							mode: "insensitive" as Prisma.QueryMode,
						},
					},
					{
						shortDescription: {
							contains: search,
							mode: "insensitive" as Prisma.QueryMode,
						},
					},
					{ tags: { has: search } },
				],
			});
		}

		if (isNeitherNullNorUndefined(category)) {
			filterClauses.push({ useCaseCategory: category });
		}

		if (isNeitherNullNorUndefined(author)) {
			filterClauses.push({ author });
		}

		if (isNeitherNullNorUndefined(verified)) {
			filterClauses.push({ verified });
		}

		const whereClause: Prisma.CodemodWhereInput = {
			AND: filterClauses,
		};

		const [codemods, total] = await Promise.all([
			prisma.codemod.findMany({
				where: whereClause,
				orderBy: {
					updatedAt: "desc",
				},
				skip,
				take: size,
			}),
			prisma.codemod.count({ where: whereClause }),
		]);

		reply.type("application/json").code(200);
		return { total, data: codemods, page, size };
	});

	instance.get("/codemods/filters", async (_, reply) => {
		const [frameworks, groupedUseCases, groupedOwners] = await Promise.all([
			prisma.tag.findMany({
				where: {
					classification: "frameworkOrLanguage",
				},
			}),
			prisma.codemod.groupBy({
				by: ["useCaseCategory"],
				_count: {
					_all: true,
				},
			}),
			prisma.codemod.groupBy({
				by: ["author"],
				_count: {
					_all: true,
				},
			}),
		]);

		const useCaseFilters = groupedUseCases.map(
			({ useCaseCategory, _count }) => ({
				name: useCaseCategory,
				count: _count._all,
			}),
		);

		const ownerFilters = groupedOwners.map(({ author, _count }) => ({
			name: author,
			count: _count._all,
		}));

		const frameworkFilters = await Promise.all(
			frameworks.map(async (framework) => {
				const count = await prisma.codemod.count({
					where: {
						tags: {
							hasSome: framework.aliases,
						},
					},
				});
				return {
					name: framework.displayName,
					count,
				};
			}),
		);

		reply.type("application/json").code(200);
		return { useCaseFilters, ownerFilters, frameworkFilters };
	});

	instance.get("/codemods/:slug", async (request, reply) => {
		const { slug } = parseGetCodemodBySlugParams(request.params);

		const codemod = await prisma.codemod.findFirst({
			where: {
				slug,
			},
			include: {
				versions: true,
			},
		});

		if (!codemod) {
			reply.status(404).send({ message: "Codemod not found" });
			return;
		}

		reply.type("application/json").code(200);
		return codemod;
	});

	instance.get("/codemods/downloadLink", async (request, reply) => {
		const { name } = parseGetCodemodLatestVersionQuery(request.query);

		const codemod = await prisma.codemod.findFirst({
			where: {
				name,
			},
			include: {
				versions: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});

		const downloadLink = codemod?.versions[0]?.bucketLink;

		if (!downloadLink) {
			reply.status(404).send({ message: "Codemod not found" });
			return;
		}

		reply.type("application/json").code(200);
		return { link: downloadLink };
	});

	type ShortCodemodInfo = Pick<Codemod, "name" | "author"> &
		Pick<CodemodVersion, "engine">;

	instance.get(
		"/codemods/list",
		async (request, reply): Promise<ShortCodemodInfo[]> => {
			const accessToken = getCustomAccessToken(environment, request.headers);

			let codemodData: ShortCodemodInfo[];

			if (isNeitherNullNorUndefined(accessToken)) {
				const _userId = await tokenService.findUserIdMetadataFromToken(
					accessToken,
					BigInt(Date.now()),
					CLAIM_ISSUE_CREATION,
				);

				// TODO: custom logic based on user auth
				const dbCodemods = await prisma.codemod.findMany();

				const codemods = await Promise.all(
					dbCodemods.map(async (codemod) => {
						const latestVersion = await prisma.codemodVersion.findFirst({
							where: {
								codemodId: codemod.id,
							},
							orderBy: {
								createdAt: "desc",
							},
						});

						if (!latestVersion) {
							return null;
						}

						return {
							name: codemod.name,
							engine: latestVersion?.engine,
							author: codemod.author,
							tags: latestVersion.tags,
							verified: codemod.verified,
						};
					}),
				);

				codemodData = codemods.filter(Boolean);
			} else {
				const dbCodemods = await prisma.codemod.findMany();

				const codemods = await Promise.all(
					dbCodemods.map(async (codemod) => {
						const latestVersion = await prisma.codemodVersion.findFirst({
							where: {
								codemodId: codemod.id,
							},
							orderBy: {
								createdAt: "desc",
							},
						});

						if (!latestVersion) {
							return null;
						}

						return {
							name: codemod.name,
							engine: latestVersion?.engine,
							author: codemod.author,
							tags: latestVersion.tags,
						};
					}),
				);

				codemodData = codemods.filter(Boolean);
			}

			const query = parseListCodemodsQuery(request.query);

			if (query.search) {
				const fuse = new Fuse(codemodData, {
					keys: ["name", "tags"],
					isCaseSensitive: false,
				});

				codemodData = fuse.search(query.search).map((res) => res.item);
			}

			reply.type("application/json").code(200);
			return codemodData;
		},
	);

	instance.post(
		"/validateAccessToken",
		wrapRequestHandlerMethod(validationHandler),
	);

	instance.delete("/revokeToken", wrapRequestHandlerMethod(revokeTokenHandler));

	instance.post("/sourceControl/:provider/issues", async (request, reply) => {
		if (!auth) {
			throw new Error("This endpoint requires auth configuration.");
		}

		const { provider } = parseCreateIssueParams(request.params);

		const { repo, title, body } = parseCreateIssueBody(request.body);

		const accessToken = getCustomAccessToken(environment, request.headers);

		if (accessToken === null) {
			return reply.code(401).send();
		}

		const userId = await tokenService.findUserIdMetadataFromToken(
			accessToken,
			BigInt(Date.now()),
			CLAIM_ISSUE_CREATION,
		);

		const oAuthToken = await auth.getOAuthToken(userId, provider);

		const sourceControlProvider = getSourceControlProvider(
			provider,
			repo,
			oAuthToken,
		);

		const result = await sourceControl.createIssue(sourceControlProvider, {
			title,
			body,
		});

		reply.type("application/json").code(200);
		return result;
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

	const claudeService = new ClaudeService(
		environment.CLAUDE_API_KEY ?? null,
		1024,
	);

	const replicateService = new ReplicateService(
		environment.REPLICATE_API_KEY ?? null,
	);

	instance.post(
		"/buildAccessToken",
		wrapRequestHandlerMethod(buildAccessTokenHandler),
	);

	instance.post("/sendMessage", async (request, reply) => {
		if (areClerkKeysSet(environment)) {
			const { userId } = getAuth(request);
			if (!userId) {
				return reply.code(401).send();
			}
		} else {
			console.warn("No Clerk keys set. Authentication is disabled.");
		}

		if (chatGptApi === null) {
			throw new Error("The Chat GPT API requires the authentication key");
		}

		const { message, parentMessageId } = parseSendMessageBody(request.body);

		const options: {
			parentMessageId?: string;
		} = {};

		if (parentMessageId) {
			options.parentMessageId = parentMessageId;
		}

		const result = await chatGptApi.sendMessage(message, options);

		reply.type("application/json").code(200);
		return result;
	});

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
			// chat history is not supported. passing all messages as single prompt.
			const prompt = messages
				.map(({ content, role }) => `${role}: ${content}`)
				.join("\n");

			const completion = await chromaService.complete(prompt);

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
			messages: messages.slice(),
			stream: true,
		});

		const stream = OpenAIStream(response);

		// the following code is inspired by the implementation of the streamToResponse function
		// available here: https://github.com/vercel-labs/ai/blob/164b33d963250a53bbaaabb7b68d143f81541a7a/packages/core/streams/streaming-text-response.ts#L22C17-L22C33

		reply.hijack();

		const replyHeaders = reply.getHeaders();

		const headers: OutgoingHttpHeaders = {};

		Object.keys(replyHeaders).forEach((key) => {
			const value = replyHeaders[key];

			if (value === undefined || typeof value === "number") {
				return;
			}

			headers[key] = value;
		});

		headers["Content-Type"] = "text/plain; charset=utf-8";

		reply.raw.writeHead(200, headers);

		const reader = stream.getReader();

		const writeToReplyRaw = async () => {
			const { done, value } = await reader.read();

			if (done) {
				reply.raw.end();
				return;
			}

			reply.raw.write(value);

			await writeToReplyRaw();
		};

		await writeToReplyRaw();

		return;
	});

	instance.post("/publish", publishHandler(environment, tokenService));

	done();
};

// @ts-expect-error setup a display name not to trigger require.cache down the line
protectedRoutes[Symbol.for("fastify.display-name")] = "protectedRoutes";
// @ts-expect-error setup a display name not to trigger require.cache down the line
publicRoutes[Symbol.for("fastify.display-name")] = "publicRoutes";

export const runServer = async () =>
	await initApp([publicRoutes, protectedRoutes]);
