import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createOrganization = (server: Server<AppRegistry>) => {
  server.createList("organization", 5);
};
