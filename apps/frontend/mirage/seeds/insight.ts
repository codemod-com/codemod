import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createInsights = (server: Server<AppRegistry>) => {
  server.create("insight", {
    name: "[Auto generated] Project dependency freshness",
    owner: "Alex",
  });
  server.create("insight", {
    name: "React 17 to 18 Migration",
    owner: "Alex",
  });
};
