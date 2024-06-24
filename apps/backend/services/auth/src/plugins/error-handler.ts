import type {
  FastifyError,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
} from "fastify";
import { ValiError } from "valibot";

import fp from "fastify-plugin";

const ERRORS: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  422: "Validation Error",
  500: "Internal Server Error",
};

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.setErrorHandler(
    async (error: FastifyError, _, reply: FastifyReply) => {
      let statusCode: number = error?.statusCode ?? 500;
      let errorName: string = ERRORS[statusCode] ?? "Unknown error";
      let errorMessage: string = error.message ?? "Stack trace is unavailable!";

      server.log.error(error);

      if (error instanceof ValiError) {
        statusCode = 403;
        errorName = "Validation Error";
        errorMessage = `${error.message}: ${error.issues
          .map((issue) => issue.path?.map((path) => path.key).join("."))
          .join(", ")}`;
      }

      if (statusCode === 500) {
        reply.type("application/json").code(statusCode);
        return { statusCode, error: name };
      }

      reply.type("application/json").code(statusCode);
      return { statusCode, errorName, errorMessage };
    },
  );

  server.setNotFoundHandler(async (_, reply: FastifyReply) => {
    reply.type("application/json").code(404);
    return {
      statusCode: 404,
      error: "Resource cannot be found",
    };
  });
};

export const errorHandler = fp(plugin);
