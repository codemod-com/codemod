import { clerkPlugin } from "@clerk/fastify";
import type { FastifyInstance } from "fastify";
import {
  getCodemodBySlugHandler,
  searchCodemodsHandler,
} from "./codemod.handler";

const codemodRoutes = async (fastify: FastifyInstance) => {
  fastify.register(clerkPlugin, {
    publishableKey: process.env.CLERK_PUBLISH_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    jwtKey: process.env.CLERK_JWT_KEY,
  });
  fastify.get("/codemods/:slug", getCodemodBySlugHandler);
  fastify.get("/codemods", searchCodemodsHandler);
};

export default codemodRoutes;
