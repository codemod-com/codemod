import { cn } from "@/utils";
import { shouldUseCodemodAi } from "@chatbot/config";
import { useTheme } from "@context/useTheme";
import { type LLMEngine, llmEngines } from "@shared/consts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { useCFSStore } from "@studio/store/zustand/CFS";

let legacyEngines = [
  "gpt-4",
  "claude-2.0",
  "claude-instant-1.2",
  "replit-code-v1-3b",
  "gpt-4-with-chroma",
];

export let EngineSelector = () => {
  let {
    AIAssistant: { engine },
    setEngine,
  } = useCFSStore();

  let handleEngineChange = (e: LLMEngine) => {
    setEngine(e);
  };

  let _llmEngines = shouldUseCodemodAi ? llmEngines : legacyEngines;
  let { isDark } = useTheme();
  return (
    <Select onValueChange={handleEngineChange} value={engine}>
      <SelectTrigger className="flex w-full select-none items-center font-semibold">
        <span
          className={cn("mr-[0.75rem] text-xs font-light text-slate-500", {
            "text-slate-200": isDark,
          })}
        >
          LLM:
        </span>
        <SelectValue placeholder={engine} />
      </SelectTrigger>
      <SelectContent>
        {_llmEngines.map((e) => (
          <SelectItem
            key={e}
            value={e}
            className={cn({
              "font-semibold": engine === e,
            })}
          >
            {e}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
