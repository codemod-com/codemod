import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";
import type { CodemodAIOutput } from "../types";

export const useCodemodAi = () => {
  const { getToken } = useAuth();
  // @TODO: use from persistent zustand
  const [messages, setMessages] = useState<CodemodAIOutput[]>([]);
  const { signal, abort } = new AbortController();

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
          // const showCodemodCopiedToast = () =>
          // toast.success("Codemod copied to the right pane", {
          //   position: "top-center",
          //   duration: 12000,
          // });
          return setMessages((prev) => [
            ...prev,
            data,
            // {
            //   codemod: data.codemod,
            //   content: `\`\`\`ts ${data.codemod}\`\`\``,
            //   role: "assistant",
            //   id: Date.now().toString(),
            // },
          ]);
        }

        if (data.execution_status === "finished" && "before" in data) {
          // setIsTestCaseGenerated(false);
          return setMessages((prev) => [
            ...prev,
            data,
            // {
            //   content: `Test cases created and added to a new test tab`,
            //   role: "assistant",
            //   id: Date.now().toString(),
            // },
          ]);
          // addPair(undefined, data);
        }

        return setMessages((prev) => [
          ...prev,
          data,
          // {
          //   content: data.message,
          //   role: "assistant",
          //   id: Date.now().toString(),
          // },
        ]);
      },
    });
  }, [getToken, signal, abort]);

  return { send, messages };
};
