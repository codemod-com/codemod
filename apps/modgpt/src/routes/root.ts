import type { Instance } from "../fastifyInstance";

export const getRootPath = (instance: Instance) =>
  instance.get("/", async (_, reply) => {
    reply.type("application/json").code(200);
    return { data: {} };
  });
