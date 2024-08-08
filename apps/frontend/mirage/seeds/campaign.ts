import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createCampaigns = (server: Server<AppRegistry>) => {
  server.createList("campaign", 3).forEach((campaign) => {
    server.createList("dashboard", 2, { campaign });
  });
};
