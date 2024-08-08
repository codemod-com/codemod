import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createBranches = (server: Server<AppRegistry>) => {
  server.createList("branch", 100);
};
