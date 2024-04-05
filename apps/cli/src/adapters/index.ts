import { mdxAdapter } from "./mdx";
import { vueCFSAdapter } from "./vueCFS";

export const ADAPTERS_BY_EXTNAME_MAP: Record<string, any> = {
	".mdx": mdxAdapter,
	".vue": vueCFSAdapter,
};

export const getAdapterByExtname = (extname: string) => {
	return ADAPTERS_BY_EXTNAME_MAP[extname] ?? null;
};

export { mdxAdapter, vueCFSAdapter };
