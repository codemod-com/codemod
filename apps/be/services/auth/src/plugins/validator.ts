import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { type BaseSchema, ValiError, parse } from "valibot";

declare module "fastify" {
  interface FastifyInstance {
    validate: (
      schema: ValidationSchema,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

interface ValidationSchema {
  body?: BaseSchema;
  query?: BaseSchema;
  params?: BaseSchema;
  headers?: BaseSchema;
}

type ValidateFunction = (
  schema: ValidationSchema,
) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const validate: ValidateFunction = (schema) => async (request, _) => {
    try {
      if (schema.body) {
        request.body = parse(schema.body, request.body);
      }
      if (schema.query) {
        request.query = parse(schema.query, request.query);
      }
      if (schema.params) {
        request.params = parse(schema.params, request.params);
      }
      if (schema.headers) {
        request.headers = parse(schema.headers, request.headers);
      }
    } catch (error) {
      if (error instanceof ValiError) {
        throw new ValiError(error.issues);
      }
    }
  };

  server.decorate("validate", validate);
};

export const validator = fp(plugin);
