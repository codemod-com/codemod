import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const campaignEndpoints = (server: Server<AppRegistry>) => {
  server.get("/campaigns/", (schema) => schema.all("campaign").models);
  server.post("/campaign", (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return schema.create("campaign", body).attrs;
  });
};
