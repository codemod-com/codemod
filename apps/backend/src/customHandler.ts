import { type Clerk } from "@clerk/backend";
import { FastifyReply, FastifyRequest } from "fastify";
import { Environment } from "./schemata/env.js";
import { CodemodService } from "./services/codemodService.js";
import { type TokenService } from "./services/tokenService.js";

export type CustomHandler<T> = (args: {
	tokenService: TokenService;
	codemodService: CodemodService;
	getAccessTokenOrThrow: () => string;
	setAccessToken: (token: string) => void;
	clerkClient: ReturnType<typeof Clerk> | null;
	getClerkUserId: () => Promise<string>;
	now: () => number;
	environment: Environment;
	request: FastifyRequest;
	reply: FastifyReply;
}) => Promise<T>;

export class InternalServerError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}
