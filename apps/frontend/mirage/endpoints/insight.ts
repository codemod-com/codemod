import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const insightEndpoints = (server: Server<AppRegistry>) => {
  server.get("/insights/", (schema) => schema.all("insight").models);
  server.post("/insight", (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return schema.create("insight", body).attrs;
  });
};
