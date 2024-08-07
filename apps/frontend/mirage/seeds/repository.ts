import type { Server } from "miragejs";
import type { AppRegistry } from "..";

export const createRepositories = (server: Server<AppRegistry>) => {
  server.createList("repository", 20);
};
