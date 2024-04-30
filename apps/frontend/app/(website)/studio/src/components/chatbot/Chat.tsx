import { env } from "@/env";
import { cn } from "@/utils";
import { useAuth } from "@clerk/nextjs";
import { SEND_CHAT } from "@studio/constants/apiEndpoints";
import {
  freezeMessage,
  parseFrozenMessages,
  unfreezeMessage,
} from "@studio/schemata/chatSchemata";
import { useCodemodExecutionError } from "@studio/store/zustand/log";
import { useChat } from "ai/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import toast from "react-hot-toast";

import { useCFSStore } from "@studio/store/zustand/CFS";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import { autoGenerateCodemodPrompt } from "@studio/store/zustand/CFS/prompts";
import { useModStore } from "@studio/store/zustand/mod";
import ChatList from "./ChatList";
import { ChatPanel } from "./ChatPanel";
import ChatScrollAnchor from "./ChatScrollAnchor";
import EngineSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";



type Props = ReturnType<typeof useModGPT> & { className: string}

const Chat = ({ modGPT: {
  id,
  isLoading,
  handleStop,
  append,
  reload,
  messages,
  input,
  setInput,
  setMessages,
  setToken
}, className }: Props) => {
  return (
    <>
      <div className={ cn("h-full", className) }>
        { messages.length > 0 && isSignedIn ? (
          <>
            <div className="mb-4 ml-auto w-1/3">
              <EngineSelector/>
            </div>
            <ChatList messages={ messages }/>
            <ChatScrollAnchor trackVisibility={ isLoading }/>
          </>
        ) : (
          <WelcomeScreen/>
        ) }
      </div>
      <ChatPanel
        id={ id }
        isLoading={ isLoading }
        stop={ handleStop }
        append={ append }
        reload={ reload }
        messages={ messages }
        input={ input }
        setInput={ setInput }
        setMessages={ setMessages }
        setToken={ setToken }
      />
    </>
  );
};

Chat.displayName = "Chat";

export default Chat;
