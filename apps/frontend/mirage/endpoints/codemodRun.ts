import { Response, type Server } from "miragejs";
import { RUN_CODEMOD } from "../../mocks/endpoints/gh-run";

import type { AppRegistry } from "..";

let currentId = 0;

export const codemodRunEndpoints = (server: Server<AppRegistry>) => {
  server.post(RUN_CODEMOD, () => {
    currentId++;
    return new Response(
      200,
      {},
      {
        codemodRunIds: [
          { id: currentId.toString(), workflow: "drift_analyzer" },
        ],
      },
    );
  });
};
