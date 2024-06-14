import type {
  FastifyError,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
} from "fastify";
import { ValiError } from "valibot";

import fp from "fastify-plugin";

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const errors = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    422: "Validation Error",
    500: "Internal Server Error",
  };

  server.setErrorHandler(
    async (error: FastifyError, _, reply: FastifyReply) => {
      let statusCode: number = error?.statusCode ?? 500;
      let message: string = error.message;
      let name: string = errors[statusCode];

      server.log.error(error);

      if (error instanceof ValiError) {
        statusCode = 403;
        name = "Validation Error";
        message = `${error.message}: ${error.issues
          .map((issue) => issue.path?.map((path) => path.key).join("."))
          .join(", ")}`;
      }

      if (statusCode === 500) {
        reply.type("application/json").code(statusCode);
        return { statusCode, error: name };
      }

      reply.type("application/json").code(statusCode);
      return { statusCode, error: name, message };
    },
  );

  server.setNotFoundHandler(async (_, reply: FastifyReply) => {
    reply.type("application/json").code(404);
    return {
      statusCode: 404,
      error: "Not Found",
    };
  });
};

export const errorHandler = fp(plugin);
