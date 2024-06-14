import type { FastifyInstance } from "fastify";

export const gracefulShutdown = (server: FastifyInstance) => {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

  const shutdown = async (signal: string) => {
    server.log.info(`${signal} received.`);
    try {
      await server.close();
      server.log.info("Server closed successfully.");
      process.exit(0);
    } catch (error) {
      server.log.error(`Server closing error: ${error}`);
      process.exit(1);
    }
  };

  signals.forEach((signal) => {
    process.on(signal, () => shutdown(signal));
  });
};
