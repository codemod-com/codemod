import { type Clerk } from "@clerk/backend";
import { type TokenService } from "./services/tokenService.js";

export type CustomHandler<T> = (args: {
	tokenService: TokenService;
	getAccessTokenOrThrow: () => string;
	setAccessToken: (token: string) => void;
	clerkClient: ReturnType<typeof Clerk> | null;
	getClerkUserId: () => Promise<string>;
	now: () => number;
}) => Promise<T>;

export class InternalServerError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}
