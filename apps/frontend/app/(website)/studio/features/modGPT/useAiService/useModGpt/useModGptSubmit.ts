import { useAuth } from "@auth/useAuth";
import { getHeadersWithAuth } from "@chatbot/useAiService/useModGpt/utils";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import type { UseChatHelpers } from "ai/react/dist";
import type { Dispatch, SetStateAction } from "react";

export let useModGptSubmit = ({
  id,
  append,
  setToken,
  isLoading,
}: {
  id?: string;
  setToken: Dispatch<SetStateAction<string | null>>;
} & Pick<UseChatHelpers, "append" | "isLoading">) => {
  let { getToken } = useAuth();
  let aliases = useGetAliases();
  return async (value: string) => {
    if (!isLoading) {
      let token = await getToken();
      setToken(token);
      let aliasesAppliedValue = applyAliases(value, aliases);
      await append(
        { id, content: aliasesAppliedValue, role: "user" },
        { options: { headers: getHeadersWithAuth(token) } },
      );
    }
  };
};
