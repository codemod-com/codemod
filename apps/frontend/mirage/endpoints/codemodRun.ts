import { Response, type Server } from "miragejs";
import { RUN_CODEMOD } from "../../mocks/endpoints/gh-run";

import type { AppRegistry } from "..";

export const codemodRunEndpoints = (server: Server<AppRegistry>) => {
  server.post(
    RUN_CODEMOD,
    () =>
      new Response(
        200,
        {},
        {
          codemodRunIds: [{ id: "1", workflow: "drift_analyzer" }],
        },
      ),
  );
};
