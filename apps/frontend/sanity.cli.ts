import { loadEnvConfig } from "@next/env";
import { defineCliConfig } from "sanity/cli";
import { env } from "./env";

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(__dirname, dev, { info: () => null, error: console.error });

// @TODO report top-level await bug
// Using a dynamic import here as `loadEnvConfig` needs to run before this file is loaded
// const { projectId, dataset } = await import('@/lib/sanity.api')
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({ api: { projectId, dataset } });
