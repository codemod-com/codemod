import { initApp } from "./init.js";
import { protectedRoutes, publicRoutes } from "./routes/index.js";

export const runServer = async () =>
  await initApp([publicRoutes, protectedRoutes]);
