import "dotenv/config";

import { createService } from "./app";
import { errorHandler, logger, validator } from "./plugins";

import { codemodRoutes } from "./modules/codemods/routes";
import { searchRoutes } from "./modules/search/routes";

const service = await createService({
  name: "RegistryService",
  plugins: [
    { plugin: logger },
    { plugin: errorHandler },
    { plugin: validator },
  ],
  routes: [codemodRoutes, searchRoutes],
});

await service.run();
