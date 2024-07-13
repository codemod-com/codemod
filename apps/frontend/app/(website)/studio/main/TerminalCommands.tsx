import { cn } from "@/utils";
import { Button } from "@studio/components/ui/button";
import { useCopyToClipboard } from "@studio/hooks/useCopyToClipboard";
import { Check, Copy } from "lucide-react";

export function CopyTerminalCommands({ text }: { text: string }) {
  const { isCopied, copy } = useCopyToClipboard({ timeout: 2000 });

  return (
    <div className="flex items-center justify-between rounded-md bg-secondary p-2 text-secondary-foreground">
      <code>{text}</code>

      <Button
        size="unstyled"
        variant="unstyled"
        className="space-x-2"
        onClick={() => copy(text)}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy
            className={cn(
              "h-4 w-4 cursor-pointer transition-colors hover:text-primary-light",
              isCopied && "text-primary-light",
            )}
          />
        )}
      </Button>
    </div>
  );
}
