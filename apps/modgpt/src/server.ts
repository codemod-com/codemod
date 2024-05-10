import { initApp } from "./init";
import { protectedRoutes, publicRoutes } from "./routes";

export const runServer = async () =>
  await initApp([publicRoutes, protectedRoutes]);
