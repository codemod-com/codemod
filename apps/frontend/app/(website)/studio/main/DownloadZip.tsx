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
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { downloadProject } from "@studio/utils/download";
import { DownloadIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyTerminalCommands } from "./TerminalCommands";

export const DownloadZip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const modStore = useModStore();
  const snippetStore = useSnippetsStore();
  const engine = snippetStore.engine;

  const { session } = useSession();
  const { getToken } = useAuth();

  const allSnippets = snippetStore.getAllSnippets();
  const cases = useMemo(
    () =>
      allSnippets.before.reduce(
        (acc, before, i) => {
          const after = allSnippets.after[i];
          if (!after) {
            return acc;
          }

          return acc.concat({ before, after });
        },
        [] as { before: string; after: string }[],
      ),
    [allSnippets],
  );

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
      cases,
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
          variant="outline"
          className="flex gap-1 border-none"
          isLoading={isDownloading}
          disabled={!modStore.content || isDownloading}
          onClick={handleClick}
          id="download-zip-button"
        >
          <DownloadIcon className="h-4" />
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
