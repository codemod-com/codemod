import type { FastifyCorsOptions } from "@fastify/cors";

export const corsOptions: FastifyCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      /^https?:\/\/.*-codemod\.vercel\.app$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/codemod\.com$/,
    ];

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.some((or) => or.test(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed"), false);
  },
  methods: ["POST", "PUT", "PATCH", "GET", "DELETE", "OPTIONS"],
  exposedHeaders: ["x-clerk-auth-reason", "x-clerk-auth-message"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "access-control-allow-origin",
  ],
};
