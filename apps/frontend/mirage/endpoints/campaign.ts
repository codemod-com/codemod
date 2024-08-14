import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const campaignEndpoints = (server: Server<AppRegistry>) => {
  server.get("/campaigns/", (schema) => schema.all("campaign").models);
};
