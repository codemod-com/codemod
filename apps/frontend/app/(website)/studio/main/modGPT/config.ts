import {
  CODEMOD_AI_FEATURE_FLAG,
  CODEMOD_MOD_SERVICE_FEATURE_FLAG,
  FEATURE_FLAG_QUERY_KEY,
} from "@/utils/strings";
import { isServer } from "@studio/config";
import { SEND_CHAT } from "@studio/constants";

export const isDevelopment = process.env.NODE_ENV === "development";

export const shouldUseCodemodAi = isServer
  ? false
  : new URLSearchParams(window?.location.search)
      .get(FEATURE_FLAG_QUERY_KEY)
      ?.split(",")
      .includes(CODEMOD_AI_FEATURE_FLAG);

export const shouldUseModService = isServer
  ? false
  : new URLSearchParams(window?.location.search)
      .get(FEATURE_FLAG_QUERY_KEY)
      ?.split(",")
      .includes(CODEMOD_MOD_SERVICE_FEATURE_FLAG);

if (shouldUseCodemodAi) console.info("Experimental AI service active");
if (shouldUseModService) console.info("Experimental mogGPT service active");

export const codemodAiWsServer = isDevelopment
  ? "ws://127.0.0.1:8000"
  : "wss://backend.codemod.com/ws";

const prodGptServer = shouldUseModService
  ? "https://backend.codemod.com/modgpt"
  : "https://backend.codemod.com";

export const modGptServer = `${
  isDevelopment ? "http://0.0.0.0:8082" : prodGptServer
}/${SEND_CHAT}`;

export const devToken = process.env.DEV_TOKEN;
