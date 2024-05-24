import { useAuth } from "@clerk/nextjs";
import { applyAliases, useGetAliases } from "@studio/store/zustand/CFS/alias";
import type { UseChatHelpers } from "ai/react/dist";
import type { Dispatch, SetStateAction } from "react";
import { flushSync } from "react-dom";
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
      flushSync(() => setToken(token));
      const aliasesAppliedValue = applyAliases(value, aliases);
      await append({ id, content: aliasesAppliedValue, role: "user" });
    }
  };
};
