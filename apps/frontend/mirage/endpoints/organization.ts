import type { Server } from "miragejs";
import { GH_ORGANIZATION_LIST } from "../../mocks/endpoints/gh-run";

import type { AppRegistry } from "..";

export const organizationEndpoints = (server: Server<AppRegistry>) => {
  server.get(
    GH_ORGANIZATION_LIST,
    (schema) => schema.all("organization").models,
  );
};
