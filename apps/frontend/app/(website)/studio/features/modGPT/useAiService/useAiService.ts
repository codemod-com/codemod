import { onResponse } from "@/app/(website)/studio/features/modgpt/utils";
import { SEND_CHAT } from "@/app/(website)/studio/src/constants";
import {
  applyAliases,
  useGetAliases,
} from "@/app/(website)/studio/src/store/CFS/alias";
import { useAuth } from "@/app/auth/useAuth";
import { env } from "@/env";
import { useModStore } from "@studio/store/mod";
import { useChat } from "ai/react";
import { getHeadersWithAuth } from "../utils";

export const useModGPT = (): ReturnType<typeof useChat> => {
  const { setCurrentCommand } = useModStore();

  // const token = await getToken();
  const { getToken } = useAuth();
  const aliases = useGetAliases();

  const chatInstance = useChat({
    api: `${env.NEXT_PUBLIC_AI_API_URL}/${SEND_CHAT}`,
    // initialMessages,
    // id,
    onResponse,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    // body: { engine },
  });

  const modGptSubmit = async (value: string) => {
    const token = await getToken();
    const aliasesAppliedValue = applyAliases(value, aliases);
    await append(
      { id, content: aliasesAppliedValue, role: "user" },
      { options: { headers: getHeadersWithAuth(token) } },
    );
  };

  // const handleStop = useCallback(() => {
  //   setCurrentCommand(null);
  //   global.stop();
  // }, [setCurrentCommand, global.stop]);

  // return {...chatInstance, append: modGptSubmit, handleStop};
  // const initialMessages = useInitialMss();

  // const [messages, setMessages] = useState<LLMMessage[]>([]);

  // useEffect(() => {
  //   setMessages(initialMessages);
  // }, [initialMessages]);

  // const {
  //   isLoading: modGptLoading,
  //   modGptSubmit,
  //   messages: modGPTMessages,
  //   setMessages: setModGPTMessages,
  //   append: appendModGPTMessages,
  //   setToken,
  //   ...restMod
  // } = useModGPT({ initialMessages: [], engine });

  // const {
  //   // wsMessage: codemodAIMessage,
  //   autogenerateTestCases,
  //   startIterativeCodemodGeneration,
  //   serviceBusy,
  //   // stopCodemodAi,
  //   isTestCaseGenerated,
  // } = useCodemodAI({
  //   messages,
  //   engine,
  //   setToken,
  // });

  // const lastModGptMss = modGPTMessages?.at(-1);
  // const lastMss = messages?.at(-1);

  // useEffect(() => {
  //   if (!codemodAIMessage) return;

  //   const updateMessages =
  //     lastMss?.role === "assistant"
  //       ? () =>
  //           messages.with(-1, {
  //             ...lastMss,
  //             content: `${lastMss.content}\n\n${codemodAIMessage.content}`,
  //           })
  //       : (m: LLMMessage[]) => [...m, codemodAIMessage];
  //   setMessages(updateMessages);

  //   if (codemodAIMessage.codemod) {
  //     showCodemodCopiedToast();
  //     appendModGPTMessages({
  //       name: "app",
  //       role: "user",
  //       content: `This is a codemod generated: ${codemodAIMessage.codemod}. Remember it. Reply with just a single sentence - asking if a user wants to know more about generated codemod"`,
  //     });
  //     setCodemod(codemodAIMessage.codemod);
  //   }
  // }, [codemodAIMessage]);

  // useEffect(() => {
  //   if (!lastModGptMss?.content) return;

  //   const index = messages.findIndex(({ id }) => id === lastModGptMss.id);
  //   const updateMessages =
  //     index > -1
  //       ? () => messages.with(index, lastModGptMss)
  //       : (m: LLMMessage[]) => [...m, lastModGptMss];
  //   setMessages(updateMessages);
  // }, [lastModGptMss?.content]);

  // const resetMessages = () => {
  //   setMessages([]);
  //   localStorage.removeItem("frozenMessages");
  // };

  // const isLoading = serviceBusy || modGptLoading;
  // useSaveMssgsToLocalStorage({ messages, isLoading });

  // return {
  //   ...restMod,
  //   handleStop: () => (serviceBusy ? stopCodemodAi() : restMod.handleStop()),
  //   resetMessages,
  //   isLoading,
  //   messages,
  //   setMessages,
  //   modGptSubmit,
  //   startIterativeCodemodGeneration,
  //   autogenerateTestCases,
  //   isTestCaseGenerated,
  // };
};
