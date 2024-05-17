import { isDevelopment } from "@/config";
import {
  CODEMOD_AI_FEATURE_FLAG,
  FEATURE_FLAG_QUERY_KEY,
} from "@/utils/strings";
import { isServer } from "@studio/config";
import { SEND_CHAT } from "@studio/constants";

export let shouldUseCodemodAi = isServer
  ? false
  : new URLSearchParams(window.location.search)
      .get(FEATURE_FLAG_QUERY_KEY)
      ?.split(",")
      .includes(CODEMOD_AI_FEATURE_FLAG);

if (shouldUseCodemodAi) console.info("Experimental AI services active");
export let codemodAiWsServer = isDevelopment
  ? "ws://127.0.0.1:8000/ws"
  : "wss://backend.codemod.com/ws";

let prodGptServer = shouldUseCodemodAi
  ? "https://backend.codemod.com/modgpt"
  : "https://backend.codemod.com";
export let modGptServer = `${
  shouldUseCodemodAi ? "http://0.0.0.0:9999" : prodGptServer
}/${SEND_CHAT}`;
