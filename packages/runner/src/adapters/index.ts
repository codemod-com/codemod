import { mdxAdapter } from "./mdx.js";
import { vue3SFCAdapter } from "./vue3SFC.js";

export const ADAPTERS_BY_EXTNAME_MAP: Record<string, any> = {
  ".mdx": mdxAdapter,
  ".vue": vue3SFCAdapter,
};

export const getAdapterByExtname = (extname: string) => {
  return ADAPTERS_BY_EXTNAME_MAP[extname] ?? null;
};

export { mdxAdapter, vue3SFCAdapter };
