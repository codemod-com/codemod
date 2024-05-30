import { parseEnvironment } from "./schemata/env.js";

export const buildTimeoutPromise = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export const environment = parseEnvironment(process.env);
