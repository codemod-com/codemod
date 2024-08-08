import type { Server } from "miragejs";
import { GH_REPO_LIST } from "../../mocks/endpoints/gh-run";

import type { AppRegistry } from "..";

export const repositoryEndpoints = (server: Server<AppRegistry>) => {
  server.get(GH_REPO_LIST, (schema) => schema.all("repository").models);
};
