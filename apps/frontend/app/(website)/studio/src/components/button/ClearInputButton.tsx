import { cn } from "@/utils";
import { Backspace as BackspaceIcon } from "@phosphor-icons/react";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button } from "@studio/components/ui/button";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

type Props = { className?: string };

const ClearInputButton = ({ className }: Props) => {
  const { setContent } = useModStore();
  const { clearAll } = useSnippetsStore();
  return (
    <Tooltip
      trigger={
        <Button
          className={cn("flex items-center justify-center", className)}
          onClick={() => {
            clearAll();
            setContent("");
          }}
          size="sm"
          variant="outline"
        >
          <BackspaceIcon className="h-4 w-4" />
          <span className="sr-only">Clear Inputs</span>
        </Button>
      }
      content={<p className="font-normal">Clear all inputs</p>}
    />
  );
};

export default ClearInputButton;
