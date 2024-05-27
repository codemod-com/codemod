import { useAuth } from "@auth/useAuth";
import { getHeadersWithAuth } from "@chatbot/useAiService/useModGpt/utils";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import type { UseChatHelpers } from "ai/react/dist";
import type { Dispatch, SetStateAction } from "react";

export const useModGptSubmit = ({
  id,
  append,
  setToken,
  isLoading,
}: {
  id?: string;
  setToken: Dispatch<SetStateAction<string | null>>;
} & Pick<UseChatHelpers, "append" | "isLoading">) => {
  const { getToken } = useAuth();
  const aliases = useGetAliases();
  return async (value: string) => {
    if (!isLoading) {
      const token = await getToken();
      setToken(token);
      const aliasesAppliedValue = applyAliases(value, aliases);
      await append(
        { id, content: aliasesAppliedValue, role: "user" },
        { options: { headers: getHeadersWithAuth(token) } },
      );
    }
  };
};
