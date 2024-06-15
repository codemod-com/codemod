export {
  VSCODE_PREFIX,
  CURSOR_PREFIX,
} from "../../../constants";

export let CUSTOMER_STORY_TAG = {
  value: "customer-stories",
  label: "Customer Stories",
} as const;

export let REGISTRY_FILTER_TYPES = {
  useCase: "category",
  framework: "framework",
  owner: "author",
} as const;

export let STATIC_HEADER_ROUTES = ["/registry"];

// For /studio
export let LEARN_KEY = "learn";
export let ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_DEPRECATED =
  "accessTokenRequested"; // For backwards-compatibility
export let ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY =
  "accessTokenRequestedByCLI";
export let ACCESS_TOKEN_COMMANDS = [
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
] as const;
export let TWO_MINS_IN_MS = 2 * 60 * 1000;
