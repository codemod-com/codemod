import { type Clerk } from "@clerk/backend";
import { type FastifyRequest } from "fastify";
import { type CodemodService } from "./services/codemodService.js";
import { type TokenService } from "./services/tokenService.js";

export type CustomHandler<T> = (args: {
	tokenService: TokenService;
	codemodService: CodemodService;
	getAccessTokenOrThrow: () => string;
	setAccessToken: (token: string) => void;
	clerkClient: ReturnType<typeof Clerk> | null;
	getClerkUserId: () => Promise<string>;
	now: () => number;
	getRequest: () => FastifyRequest;
}) => Promise<T>;

export class InternalServerError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}
