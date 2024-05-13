import { isDevelopment } from "@/config";
import { isServer } from "@studio/config";
import { SEND_CHAT } from "@studio/constants";

export const shouldUseCodemodAi = isServer
  ? false
  : localStorage.getItem("codemodai") === "true";
if (shouldUseCodemodAi) console.info("Experimental AI services active");
export const codemodAiWsServer = isDevelopment
  ? "ws://127.0.0.1:8000/ws"
  : "wss://backend.codemod.com/ws";

const prodGptServer = shouldUseCodemodAi
  ? "https://backend.codemod.com/modgpt"
  : process.env.NEXT_PUBLIC_BASE_URL;
export const modGptServer = `${
  shouldUseCodemodAi ? "http://0.0.0.0:9999" : prodGptServer
}/${SEND_CHAT}`;
