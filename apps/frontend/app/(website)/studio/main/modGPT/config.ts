import { isDevelopment } from "@/config";
import {
  CODEMOD_AI_FEATURE_FLAG,
  FEATURE_FLAG_QUERY_KEY,
} from "@/utils/strings";
import { isServer } from "@studio/config";
import { SEND_CHAT } from "@studio/constants";

export const shouldUseCodemodAi = isServer
  ? false
  : new URLSearchParams(window.location.search)
      .get(FEATURE_FLAG_QUERY_KEY)
      ?.split(",")
      .includes(CODEMOD_AI_FEATURE_FLAG);

if (shouldUseCodemodAi) console.info("Experimental AI services active");
export const codemodAiWsServer = isDevelopment
  ? "ws://127.0.0.1:8000/ws"
  : "wss://backend.codemod.com/ws";

const prodGptServer = shouldUseCodemodAi
  ? "https://backend.codemod.com/modgpt"
  : "https://backend.codemod.com";
export const modGptServer = `${
  isDevelopment ? "http://0.0.0.0:8081" : prodGptServer
}/${SEND_CHAT}`;
