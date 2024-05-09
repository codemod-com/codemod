import type { Instance } from "../fastifyInstance";

export const getVersionPath = (instance: Instance) =>
  instance.get("/version", async (_, reply) => {
    const packageJson = await import(
      new URL("../package.json", import.meta.url).href,
      { assert: { type: "json" } }
    );
    reply.type("application/json").code(200);
    return { version: packageJson.default.version };
  });
