import { cn } from "@/utils";
import { useAuth, useSession } from "@clerk/nextjs";
import { getHumanCodemodName } from "@studio/api/getHumanCodemodName";
import { Button } from "@studio/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@studio/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@studio/components/ui/tabs";
import { useCopyToClipboard } from "@studio/hooks/useCopyToClipboard";
import { DownloadIcon } from "@studio/icons/Download";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { downloadProject } from "@studio/utils/download";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

export const DownloadZip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const modStore = useModStore();
  const snippetStore = useSnippetsStore();
  const engine = snippetStore.engine;

  const { session } = useSession();
  const { getToken } = useAuth();

  const handleClick = async () => {
    setIsDownloading(true);
    if (!modStore.content) {
      return;
    }

    const token = await getToken();

    const humanCodemodName = await getHumanCodemodName(modStore.content, token);

    await downloadProject({
      name: humanCodemodName,
      codemodBody: modStore.content,
      cases: [
        {
          before: snippetStore.getSelectedEditors().beforeSnippet,
          after: snippetStore.getSelectedEditors().afterSnippet,
        },
      ],
      engine,
      username: session?.user.username ?? null,
    });

    setIsDownloading(false);
    setIsOpen(true);
  };

  if (engine === "ts-morph") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="xs"
          variant="unstyled"
          className="text-white flex gap-1"
          hint={
            <p className="font-normal">
              Download a ZIP archive to use this codemod locally
            </p>
          }
          isLoading={isDownloading}
          disabled={!modStore.content || isDownloading}
          onClick={handleClick}
          id="download-zip-button"
        >
          <DownloadIcon />
          Download and Run Locally
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-white">
        <p>
          Unzip the codemod package into your preferred folder, copy its path,
          update the command below with the copied path, and run it.
        </p>

        <Tabs defaultValue="npm">
          <TabsList>
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          </TabsList>

          <TabsContent value="npm">
            <InstructionsContent pm="npm" />
          </TabsContent>
          <TabsContent value="pnpm">
            <InstructionsContent pm="pnpm" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function InstructionsContent({ pm }: { pm: "pnpm" | "npm" }) {
  const npxDialect = useMemo(() => {
    if (pm === "pnpm") {
      return "pnpm dlx";
    }

    return "npx";
  }, [pm]);

  return (
    <div className="space-y-1">
      <CopyTerminalCommands
        text={`${npxDialect} codemod --source <codemod_path> --target <target_path>`}
      />
    </div>
  );
}

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
