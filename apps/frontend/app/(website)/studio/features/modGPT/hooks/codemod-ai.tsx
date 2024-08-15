import type { Message } from "ai";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";

import { fetchStream } from "../api/fetch-stream";
import type { CodemodAIOutput } from "../types";

export const useCodemodAi = () => {
  const { getToken } = useAuth();
  // @TODO: use from persistent zustand
  const [messages, setMessages] = useState<
    (Pick<Message, "role" | "content"> & CodemodAIOutput)[]
  >([]);
  const { signal, abort } = new AbortController();

  useEffect(() => {
    return abort;
  }, [abort]);

  const send = useCallback(async () => {
    const token = await getToken();
    if (token === null) {
      console.error("unauth");
      return;
    }

    await fetchStream({
      url: env.NEXT_PUBLIC_AI_API_URL,
      token,
      options: { signal },
      onChunk: async (rawData) => {
        const data = JSON.parse(rawData) as CodemodAIOutput;

        if (data.execution_status === "error") {
          toast.error(`Codemod AI error: ${data.message}`);
          return abort();
        }

        if (data.execution_status === "finished" && "codemod" in data) {
          // toast.success("Codemod copied to the right pane", {
          //   position: "top-center",
          //   duration: 12000,
          // });
          return setMessages((prev) => [
            ...prev,
            {
              ...data,
              role: "assistant",
              content: `\`\`\`ts ${data.codemod}\`\`\``,
            },
          ]);
        }

        if (data.execution_status === "finished" && "before" in data) {
          // setIsTestCaseGenerated(false);
          return setMessages((prev) => [
            ...prev,
            {
              ...data,
              role: "assistant",
              content: `Test cases created and added to a new test tab`,
            },
          ]);
          // addPair(undefined, data);
        }

        return setMessages((prev) => [
          ...prev,
          {
            ...data,
            role: "assistant",
            content: data.message,
          },
        ]);
      },
    });
  }, [getToken, signal, abort]);

  return { send, abort, messages };
};
