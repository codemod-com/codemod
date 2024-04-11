import "dotenv/config";

import { randomBytes } from "node:crypto";
import { OutgoingHttpHeaders } from "node:http";
import { OrganizationMembership, User } from "@clerk/backend";
import { clerkPlugin, createClerkClient, getAuth } from "@clerk/fastify";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import { OpenAIStream } from "ai";
import Fastify, { FastifyPluginCallback, RouteHandlerMethod } from "fastify";
import * as openAiEdge from "openai-edge";
import { buildSafeChromaService } from "./chroma.js";
import { ClaudeService } from "./claudeService.js";
import { COMPLETION_PARAMS } from "./constants.js";
import { decrypt, encrypt } from "./crypto/crypto.js";
import {
	CustomHandler,
	ForbiddenError,
	UnauthorizedError,
} from "./customHandler.js";
import { prisma } from "./db/prisma.js";
import { buildAccessTokenHandler } from "./handlers/buildAccessTokenHandler.js";
import { getCodemodBySlugHandler } from "./handlers/getCodemodBySlugHandler.js";
import { getCodemodDownloadLink } from "./handlers/getCodemodDownloadLink.js";
import { getCodemodsHandler } from "./handlers/getCodemodsHandler.js";
import { getCodemodsListHandler } from "./handlers/getCodemodsListHandler.js";
import { revokeTokenHandler } from "./handlers/revokeTokenHandler.js";
import { validationHandler } from "./handlers/validationHandler.js";
import { publishHandler } from "./publishHandler.js";
import { ReplicateService } from "./replicateService.js";
import {
	parseCreateIssueBody,
	parseCreateIssueParams,
	parseDiffCreationBody,
	parseGetCodeDiffParams,
	parseGetUserRepositoriesParams,
	parseIv,
	parseSendChatBody,
	parseSendMessageBody,
	parseValidateIntentParams,
} from "./schemata/schema.js";
import { Auth } from "./services/Auth.js";
import { GithubProvider } from "./services/GithubProvider.js";
import { SourceControl } from "./services/SourceControl.js";
import {
	CodemodNotFoundError,
	CodemodService,
} from "./services/codemodService.js";
import {
	CLAIM_ISSUE_CREATION,
	TokenExpiredError,
	TokenInsufficientClaimsError,
	TokenNotFoundError,
	TokenNotVerifiedError,
	TokenRevokedError,
	TokenService,
} from "./services/tokenService.js";
import { areClerkKeysSet, environment, getCustomAccessToken } from "./util.js";

const getSourceControlProvider = (
	provider: "github",
	oAuthToken: string,
	repo: string | null,
) => {
	switch (provider) {
		case "github": {
			return new GithubProvider(oAuthToken, repo);
		}
	}
};

const X_CODEMOD_ACCESS_TOKEN = (
	environment.X_CODEMOD_ACCESS_TOKEN ?? ""
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

	fastify.addHook("onRequest", (request, reply, done) => {
		reply.header("Access-Control-Allow-Origin", "false");
		done();
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
			"x-clerk-auth-reason",
			"x-clerk-auth-message",
		],
		allowedHeaders: [
			X_CODEMOD_ACCESS_TOKEN,
			"Content-Type",
			"Authorization",
			"access-control-allow-origin",
		],
	} satisfies FastifyCorsOptions);

	await fastify.register(fastifyRateLimit, {
		max: 1000,
		timeWindow: 60 * 1000, // 1 minute
	});

	await fastify.register(fastifyMultipart);

	for (const plugin of toRegister) {
		await fastify.register(plugin);
	}

	await fastify.listen({ port, host: "0.0.0.0" });

	return fastify;
};

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
	prisma,
	environment.ENCRYPTION_KEY ?? "",
	environment.SIGNATURE_PRIVATE_KEY ?? "",
	environment.PEPPER ?? "",
);

const codemodService = new CodemodService(prisma);

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
		const getAccessToken = () =>
			getCustomAccessToken(environment, request.headers);

		const setAccessToken = (accessToken: string) => {
			reply.header(X_CODEMOD_ACCESS_TOKEN, accessToken);
		};

		const getClerkUserId = async (): Promise<string> => {
			const { userId } = getAuth(request);

			if (!userId) {
				throw new UnauthorizedError();
			}

			return userId;
		};

		const getClerkUserData = async (
			userId: string,
		): Promise<{
			user: User;
			organizations: OrganizationMembership[];
			allowedNamespaces: string[];
		} | null> => {
			if (clerkClient === null) {
				return null;
			}

			const user = await clerkClient.users.getUser(userId);
			const userOrganizations =
				await clerkClient.users.getOrganizationMembershipList({ userId });
			const userAllowedNamespaces = [
				user.username,
				...userOrganizations.map((org) => org.organization.slug),
			].filter(isNeitherNullNorUndefined);

			return {
				user,
				organizations: userOrganizations,
				allowedNamespaces: userAllowedNamespaces,
			};
		};

		const now = () => Date.now();

		try {
			const data = await handler({
				tokenService,
				codemodService,
				getAccessToken,
				setAccessToken,
				clerkClient,
				getClerkUserId,
				getClerkUserData,
				now,
				request,
				reply,
				environment,
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

			if (error instanceof CodemodNotFoundError) {
				reply.type("application/json").code(400);
				return {
					error: "Codemod not found",
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
			console.error(error);
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

	instance.get(
		"/codemods/:slug",
		wrapRequestHandlerMethod(getCodemodBySlugHandler),
	);

	instance.get("/codemods", wrapRequestHandlerMethod(getCodemodsHandler));

	instance.get(
		"/codemods/downloadLink",
		wrapRequestHandlerMethod(getCodemodDownloadLink),
	);
	instance.get(
		"/codemods/list",
		wrapRequestHandlerMethod(getCodemodsListHandler),
	);

	instance.post(
		"/validateAccessToken",
		wrapRequestHandlerMethod(validationHandler),
	);

	instance.get("/diffs/:id", async (request, reply) => {
		const { id } = parseGetCodeDiffParams(request.params);
		const { iv: ivStr } = parseIv(request.query);

		const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
		const iv = Buffer.from(ivStr, "base64url");

		const codeDiff = await prisma.codeDiff.findUnique({
			where: { id },
		});

		if (!codeDiff) {
			reply.code(400).send();
			return;
		}

		let before: string;
		let after: string;
		try {
			before = decrypt(
				"aes-256-cbc",
				{ key, iv },
				Buffer.from(codeDiff.before, "base64url"),
			).toString();
			after = decrypt(
				"aes-256-cbc",
				{ key, iv },
				Buffer.from(codeDiff.after, "base64url"),
			).toString();
		} catch (err) {
			reply.code(400).send();
			return;
		}

		reply.type("application/json").code(200);
		return { before, after };
	});

	instance.post("/diffs", async (request, reply) => {
		const body = parseDiffCreationBody(request.body);

		const iv = randomBytes(16);
		const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");

		const codeDiff = await prisma.codeDiff.create({
			data: {
				name: body.name,
				source: body.source,
				before: encrypt(
					"aes-256-cbc",
					{ key, iv },
					Buffer.from(body.before),
				).toString("base64url"),
				after: encrypt(
					"aes-256-cbc",
					{ key, iv },
					Buffer.from(body.after),
				).toString("base64url"),
			},
		});

		reply.type("application/json").code(200);
		return { id: codeDiff.id, iv: iv.toString("base64url") };
	});

	instance.delete("/revokeToken", wrapRequestHandlerMethod(revokeTokenHandler));

	instance.get("/intents/:id", async (request, reply) => {
		if (!auth) {
			throw new Error("This endpoint requires auth configuration.");
		}

		const { id } = parseValidateIntentParams(request.params);
		const { iv: ivStr } = parseIv(request.query);

		const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
		const iv = Buffer.from(ivStr, "base64url");

		const result = await prisma.userLoginIntent.findFirst({
			where: {
				id: decrypt(
					"aes-256-cbc",
					{ key, iv },
					Buffer.from(id, "base64url"),
				).toString(),
			},
		});

		if (result === null) {
			reply.code(400).send();
			return;
		}

		if (result.token === null) {
			reply.code(400).send();
			return;
		}

		const decryptedToken = decrypt(
			"aes-256-cbc",
			{ key, iv },
			Buffer.from(result.token, "base64url"),
		).toString();

		await prisma.userLoginIntent.delete({
			where: { id: result.id },
		});

		reply.type("application/json").code(200);
		return { token: decryptedToken };
	});

	instance.post("/intents", async (_request, reply) => {
		if (!auth) {
			throw new Error("This endpoint requires auth configuration.");
		}

		const result = await prisma.userLoginIntent.create({});

		const key = Buffer.from(environment.ENCRYPTION_KEY, "base64url");
		const iv = randomBytes(16);
		const encryptedSessionId = encrypt(
			"aes-256-cbc",
			{ key, iv },
			Buffer.from(result.id),
		).toString("base64url");

		reply.type("application/json").code(200);
		return { id: encryptedSessionId, iv: iv.toString("base64url") };
	});

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
			oAuthToken,
			repo,
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

	instance.get(
		"/sourceControl/:provider/user/repos",
		async (request, reply) => {
			if (!auth) {
				throw new Error("This endpoint requires auth configuration.");
			}

			// getting userId from clerk directly should be safe
			const { userId } = getAuth(request);

			if (!userId) {
				return reply.code(401).send();
			}

			const { provider } = parseGetUserRepositoriesParams(request.params);

			const oAuthToken = await auth.getOAuthToken(userId, provider);

			const sourceControlProvider = getSourceControlProvider(
				provider,
				oAuthToken,
				null,
			);

			const result = await sourceControl.getUserRepositories(
				sourceControlProvider,
			);

			reply.type("application/json").code(200);
			return result;
		},
	);

	done();
};

// @ts-expect-error setup a display name not to trigger require.cache down the line
protectedRoutes[Symbol.for("fastify.display-name")] = "protectedRoutes";
// @ts-expect-error setup a display name not to trigger require.cache down the line
publicRoutes[Symbol.for("fastify.display-name")] = "publicRoutes";

export const runServer = async () =>
	await initApp([publicRoutes, protectedRoutes]);
