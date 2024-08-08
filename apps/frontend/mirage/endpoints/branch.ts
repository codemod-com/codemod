import type { Server } from "miragejs";
import { GH_BRANCH_LIST } from "../../mocks/endpoints/gh-run";

import type { AppRegistry } from "..";

export const branchEndpoints = (server: Server<AppRegistry>) => {
  // @TODO why branch endpoint is post?
  server.post(GH_BRANCH_LIST, (schema) => schema.all("branch").models);
};
