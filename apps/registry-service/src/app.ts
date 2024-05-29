import "dotenv/config";
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

console.log(process.env.CLERK_PUBLISH_KEY);

import codemodRoutes from "./modules/codemod/codemod.route";

fastify.register(codemodRoutes);

await fastify.listen({ port: 8080, host: "0.0.0.0" });
