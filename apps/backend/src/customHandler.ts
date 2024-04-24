import type { Clerk, OrganizationMembership, User } from "@clerk/backend";
import type { TelemetrySender } from "@codemod-com/telemetry";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Environment } from "./schemata/env.js";
import type { CodemodService } from "./services/codemodService.js";
import type { TokenService } from "./services/tokenService.js";
import type { TelemetryEvents } from "./telemetry.js";

export type CustomHandler<T> = (args: {
	tokenService: TokenService;
	codemodService: CodemodService;
	telemetryService: TelemetrySender<TelemetryEvents>;
	getAccessToken: () => string | null;
	setAccessToken: (token: string) => void;
	clerkClient: ReturnType<typeof Clerk> | null;
	getClerkUserId: () => Promise<string>;
	getClerkUserData: (userId: string) => Promise<{
		user: User;
		organizations: OrganizationMembership[];
		allowedNamespaces: string[];
	} | null>;
	now: () => number;
	environment: Environment;
	request: FastifyRequest;
	reply: FastifyReply;
}) => Promise<T>;

export class InternalServerError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}
