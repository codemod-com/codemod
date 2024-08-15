import { onResponse } from "@/app/(website)/studio/features/modgpt/utils";
import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import {
  applyAliases,
  useGetAliases,
} from "@/app/(website)/studio/src/store/CFS/alias";
import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";
import type { LLMEngine } from "@codemod-com/utilities";
import { useChat } from "ai/react";

export const useModGPT = (engine: LLMEngine): ReturnType<typeof useChat> => {
  const { getToken } = useAuth();

  const chat = useChat({
    api: `${env.NEXT_PUBLIC_AI_API_URL}/${SEND_CHAT}`,
    onResponse,
    body: { engine },
  });

  const aliases = useGetAliases();

  return {
    ...chat,
    append: async (message) => {
      const token = await getToken();
      const aliasesAppliedValue = applyAliases(message.content, aliases);

      return chat.append(
        { content: aliasesAppliedValue, role: "user" },
        {
          options: {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        },
      );
    },
  };
};
