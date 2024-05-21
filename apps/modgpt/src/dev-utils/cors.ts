import type { FastifyCorsOptions } from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { environment, isDevelopment } from "./configs";

const ALLOWED_ORIGINS = [
  /^https?:\/\/.*-codemod\.vercel\.app$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/codemod\.com$/,
];

export const corsDisableHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
};

export const getCorsDisabledHeaders = (fastify: FastifyInstance) => {
  fastify.options("/sendChat", (request, reply) => {
    reply.status(204).headers(corsDisableHeaders).send();
  });
};

const X_CODEMOD_ACCESS_TOKEN = (
  environment.X_CODEMOD_ACCESS_TOKEN ?? ""
).toLocaleLowerCase();

export const corsOptions: FastifyCorsOptions = isDevelopment
  ? { origin: false }
  : {
      origin: (origin, cb) => {
        if (!origin) {
          cb(null, true);
          return;
        }

        if (ALLOWED_ORIGINS.some((or) => or.test(origin))) {
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
    };
