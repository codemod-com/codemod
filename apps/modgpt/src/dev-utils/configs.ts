import { parseEnvironment } from "../schemata/env";

export const environment = parseEnvironment(process.env);
export const isDevelopment = environment.NODE_ENV === "development";
