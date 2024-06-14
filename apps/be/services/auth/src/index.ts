import "dotenv/config";

import { createService } from "./app";
import { errorHandler, logger, validator } from "./plugins";

import { intentRoutes } from "./modules/intents/intents.routes";
import { tokenRoutes } from "./modules/token/token.routes";
import { userRoutes } from "./modules/user/user.routes";

const service = await createService({
  name: "AuthService",
  plugins: [
    { plugin: logger },
    { plugin: errorHandler },
    { plugin: validator },
  ],
  routes: [tokenRoutes, intentRoutes, userRoutes],
});

await service.run();
