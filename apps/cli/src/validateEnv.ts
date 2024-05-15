import path from "node:path";
import dotenv from "dotenv";
import { object, parse, string } from "valibot";

dotenv.config({
  path: path.resolve(
    __dirname,
    "..",
    process.env.NODE_ENV === "production" ? ".env" : ".env.local",
  ),
});

const envSchema = object({
  NODE_ENV: string().oneOf(["development", "production"]).required(),
  PORT: string().required(),
  DATABASE_URL: string().required(),
});

const validateEnv = (input: unknown) => parse(envSchema, input);

export const ENV = validateEnv(process.env);
