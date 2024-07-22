import { parseEnvironment } from "../schemata/env.js";

export const environment = parseEnvironment(process.env);
export const isDevelopment = environment.NODE_ENV === "development";
