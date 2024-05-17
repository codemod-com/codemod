import { mdxAdapter } from './mdx';
import { vue3SFCAdapter } from './vue3SFC';

export let ADAPTERS_BY_EXTNAME_MAP: Record<string, any> = {
	'.mdx': mdxAdapter,
	'.vue': vue3SFCAdapter,
};

export let getAdapterByExtname = (extname: string) => {
	return ADAPTERS_BY_EXTNAME_MAP[extname] ?? null;
};

export { mdxAdapter, vue3SFCAdapter };
