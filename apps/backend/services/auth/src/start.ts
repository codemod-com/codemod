import "dotenv/config";

import { createService } from "./app";

import { errorHandler } from "./plugins/error-handler";
import { logger } from "./plugins/logger";
import { validator } from "./plugins/validator";

import { intentRoutes } from "./modules/intents/routes";
import { tokenRoutes } from "./modules/tokens/routes";

const service = await createService({
  name: "auth",
  plugins: [
    { plugin: logger },
    { plugin: errorHandler },
    { plugin: validator },
  ],
  routes: [tokenRoutes, intentRoutes],
});

await service.run();
