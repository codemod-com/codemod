import { cn } from "@/utils";
import { useTheme } from "@context/useTheme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { useCFSStore } from "@studio/store/zustand/CFS";
import { type Engine, LLM_ENGINES } from "../../store/zustand/CFS";

let EngineSelector = () => {
  let {
    AIAssistant: { engine },
    setEngine,
  } = useCFSStore();

  let handleEngineChange = (e: Engine) => {
    setEngine(e);
  };

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
        {LLM_ENGINES.map((e) => (
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

export default EngineSelector;
