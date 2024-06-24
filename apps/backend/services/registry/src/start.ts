import "dotenv/config";

import { createService } from "./app";

import { auth } from "./plugins/auth";
import { errorHandler } from "./plugins/error-handler";
import { logger } from "./plugins/logger";
import { validator } from "./plugins/validator";

import { codemodRoutes } from "./modules/codemods/routes";
import { searchRoutes } from "./modules/search/routes";

const service = await createService({
  name: "registry",
  plugins: [
    { plugin: logger },
    { plugin: errorHandler },
    { plugin: validator },
    { plugin: auth },
  ],
  routes: [codemodRoutes, searchRoutes],
});

await service.run();
