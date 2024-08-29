import { env } from "@/env";
import { type Registry, type Server, createServer } from "miragejs";
import type Schema from "miragejs/orm/schema";

import {
  branchEndpoints,
  codemodRunEndpoints,
  executionStatusEndpoints,
  insightEndpoints,
  repositoryEndpoints,
} from "./endpoints";
import {
  branchFactory,
  dashboardFactory,
  insightFactory,
  repositoryFactory,
} from "./factories";
import {
  branchModel,
  dashboardModel,
  insightModel,
  repositoryModel,
} from "./models";
import { createBranches, createInsights, createRepositories } from "./seeds";

const models = {
  insight: insightModel,
  dashboard: dashboardModel,
  repository: repositoryModel,
  branch: branchModel,
};
const factories = {
  insight: insightFactory,
  dashboard: dashboardFactory,
  repository: repositoryFactory,
  branch: branchFactory,
};

export type AppRegistry = Registry<typeof models, typeof factories>;
export type AppSchema = Schema<AppRegistry>;
export type AppServer = Server<AppRegistry>;

export const runServer = (environment: string) =>
  createServer({
    environment,
    factories,
    models,
    routes() {
      this.urlPrefix = env.NEXT_PUBLIC_API_URL;
      this.timing = 250;

      insightEndpoints(this);
      repositoryEndpoints(this);
      branchEndpoints(this);
      codemodRunEndpoints(this);
      executionStatusEndpoints(this);

      // Needed because Chrome recognizes that the Mirage Response is not a real response
      // with setting instantiateStreaming to null we fallback to legacy WebAssembly instantiation
      // this works with the Mirage Response, therefore the app can start
      // for more details see: https://github.com/miragejs/miragejs/issues/339
      Object.defineProperty(window.WebAssembly, "instantiateStreaming", {
        value: null,
      });
      const oldPassthroughRequests = (
        this.pretender as any
      ).passthroughRequest.bind(this.pretender);

      (this.pretender as any).passthroughRequest = (
        verb: "GET" | "POST" | "PUT" | "DELETE",
        path: string,
        request: any,
      ) => {
        // Needed because responseType is not set correctly in Mirages passthrough
        // for more details see: https://github.com/miragejs/ember-cli-mirage/issues/1915
        if (verb === "GET" && path.match(/\.wasm$/)) {
          console.log("Set responseType for wasm correctly");
          request.responseType = "arraybuffer";
        }
        return oldPassthroughRequests(verb, path, request);
      };

      this.passthrough("https://summary-walrus-25.clerk.accounts.dev/**");
      this.passthrough("http://localhost:3000/_next/**");
    },
    seeds(server) {
      createInsights(server);
      createBranches(server);
      createRepositories(server);
    },
  });
