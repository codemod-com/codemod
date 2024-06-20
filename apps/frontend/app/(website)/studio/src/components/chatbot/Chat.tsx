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

interface Props extends React.ComponentProps<"div"> {
  id?: string;
}

let buildCodemodFromLLMResponse = (LLMResponse: string): string | null => {
  let CODE_BLOCK_REGEXP = /```typescript(.+?)```/gs;
  let match = CODE_BLOCK_REGEXP.exec(LLMResponse);

  if (match === null || match.length < 1) {
    return null;
  }

  return match.at(1)?.trim() ?? null;
};

let Chat = ({ id, className }: Props) => {
  let { command, setCurrentCommand, setContent } = useModStore();
  let {
    AIAssistant: { engine },
  } = useCFSStore();

  let executedCommand = useRef(false);

  let [token, setToken] = useState<string | null>(null);

  let initialMessages = useMemo(() => {
    try {
      if (typeof localStorage === "undefined") {
        return [];
      }

      let stringifiedFrozenMessages = localStorage.getItem("frozenMessages");

      if (stringifiedFrozenMessages === null) {
        return [];
      }

      return parseFrozenMessages(JSON.parse(stringifiedFrozenMessages)).map(
        (frozenMessage) => unfreezeMessage(frozenMessage),
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  let {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
  } = useChat({
    api: `${env.NEXT_PUBLIC_API_URL}${SEND_CHAT}`,
    initialMessages,
    id,
    onFinish({ content }) {
      if (command !== "learn") {
        return;
      }

      setCurrentCommand(null);

      let codemodSourceCode = buildCodemodFromLLMResponse(content);

      if (codemodSourceCode !== null) {
        setContent(codemodSourceCode);

        toast.success("Auto-updated codemod based on AI response.");
      }
    },
    onResponse(response) {
      if (response.status === 400) {
        toast.error("The request you made could not be completed.");
      }

      if (response.status === 401) {
        toast.error("You are unauthorized to make this request.");
      }

      if (response.status === 403) {
        toast.error("You are not allowed to make this request.");
      }

      if (response.status === 429) {
        toast.error(
          "You have exceeded the available request quota. Please resume after one minute.",
        );
      }

      if (response.status === 500) {
        toast.error("The server has encountered an error. Please retry later.");
      }
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: {
      engine,
    },
  });
  let { getToken, isSignedIn } = useAuth();
  let codemodExecutionError = useCodemodExecutionError();

  let aliases = useGetAliases();

  let handleSelectPrompt = async (value: string) => {
    let t = await getToken();
    flushSync(() => {
      setToken(t);
    });

    let aliasesAppliedValue = applyAliases(value, aliases);
    await append({
      id,
      content: aliasesAppliedValue,
      role: "user",
      name: "prompt",
    });
  };

  useEffect(() => {
    if (
      isSignedIn &&
      command === "learn" &&
      aliases.$BEFORE !== null &&
      aliases.$AFTER !== null &&
      !isLoading &&
      // ensure this block called once
      !executedCommand.current
    ) {
      executedCommand.current = true;
      setMessages([]);
      handleSelectPrompt(autoGenerateCodemodPrompt);
    }
  }, [
    setMessages,
    handleSelectPrompt,
    command,
    aliases.$BEFORE,
    aliases.$AFTER,
    isLoading,
    isSignedIn,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let frozenMessages = messages.map((message) => freezeMessage(message));

    try {
      localStorage.setItem("frozenMessages", JSON.stringify(frozenMessages));
    } catch (error) {
      console.error(error);
    }
  }, [messages, isLoading]);

  let handleStop = useCallback(() => {
    setCurrentCommand(null);

    stop();
  }, [setCurrentCommand, stop]);

  return (
    <>
      <div className={cn("h-full", className)}>
        {messages.length > 0 && isSignedIn ? (
          <>
            <div className="mb-4 ml-auto w-1/3">
              <EngineSelector />
            </div>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={handleStop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        setMessages={setMessages}
        setToken={setToken}
      />
    </>
  );
};

Chat.displayName = "Chat";

export default Chat;
