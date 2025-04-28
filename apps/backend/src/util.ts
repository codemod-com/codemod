import { configDotenv } from "dotenv";
import { parseEnvironment } from "./schemata/env.js";

configDotenv();

export const buildTimeoutPromise = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export const environment = parseEnvironment(process.env);
