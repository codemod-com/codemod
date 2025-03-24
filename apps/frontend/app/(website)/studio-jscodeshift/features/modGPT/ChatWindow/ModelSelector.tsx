import { cn } from "@/utils";
import { type LLMEngine, llmEngines } from "@codemod-com/utilities";
import { useTheme } from "@context/useTheme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { useCFSStore } from "app/(website)/studio-jscodeshift/src/store/CFS";

export const EngineSelector = () => {
  const {
    AIAssistant: { engine },
    setEngine,
  } = useCFSStore();

  const handleEngineChange = (e: LLMEngine) => {
    setEngine(e);
  };

  const { isDark } = useTheme();
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
        {llmEngines.map((e) => (
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
