import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createCampaigns = (server: Server<AppRegistry>) => {
  server.create("campaign", {
    name: "[Auto generated] Project dependency freshness",
    owner: "Alex",
  });
  server.create("campaign", {
    name: "React 17 to 18 Migration",
    owner: "Alex",
  });
};
