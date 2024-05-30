import type { TelemetrySender } from "@codemod-com/telemetry";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Environment } from "./schemata/env.js";
import type { CodemodService } from "./services/codemodService.js";
import type { TelemetryEvents } from "./telemetry.js";

export type CustomHandler<T> = (args: {
  codemodService: CodemodService;
  telemetryService: TelemetrySender<TelemetryEvents>;
  now: () => number;
  environment: Environment;
  request: FastifyRequest;
  reply: FastifyReply;
}) => Promise<T>;

export class InternalServerError extends Error {}
export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}
