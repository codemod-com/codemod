export const DEFAULT_INCLUDE_PATTERNS = ['**/*.*'] as const;
export const DEFAULT_EXCLUDE_PATTERNS = ['**/node_modules/**/*.*'] as const;
export const DEFAULT_INPUT_DIRECTORY_PATH = process.cwd();
export const DEFAULT_FILE_LIMIT = 7_000;
// TODO: change to --prettier instead of --usePrettier
export const DEFAULT_USE_PRETTIER = true;
// TODO: change to --no-cache instead of opting-in to cache
export const DEFAULT_USE_CACHE = false;
// TODO: change to --json instead of --useJson
export const DEFAULT_USE_JSON = false;
export const DEFAULT_THREAD_COUNT = 4;
// TODO: change to --dry instead of --dryRun
export const DEFAULT_DRY_RUN = false;

export const APP_INSIGHTS_INSTRUMENTATION_STRING =
	'InstrumentationKey=d9f8ad27-50df-46e3-8acf-81ea279c8444;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/';
export const APP_INSIGHTS_TAG = 'CLI';
