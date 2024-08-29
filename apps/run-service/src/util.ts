import { parseEnvironment } from "./schemata/env.js";

export const environment = parseEnvironment(process.env);
