import Icon, { TechLogo } from "@/components/shared/Icon";
import { cn } from "@/utils";
import { useAuth, useSession } from "@clerk/nextjs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import sendMessage from "@studio/api/sendMessage";
import { Button } from "@studio/components/ui/button";
import { Dialog, DialogContent } from "@studio/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@studio/components/ui/tabs";
import { useCopyToClipboard } from "@studio/hooks/useCopyToClipboard";
import { DownloadIcon } from "@studio/icons/Download";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { downloadProject } from "@studio/utils/download";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

export const generateCodemodHumanNamePrompt = (codemod: string) => `
You are a jscodeshift codemod and javascript expert. 
Come up with a precise name to be used for the following jscodeshift codemod below.
If the codemod is aimed at making any changes to a particular framework or library, the format
should be "framework/version/name", where framework is the name of the framework or library,
version is a major version (meaning one or two digits), and name is a short name for the codemod
written in kebab-case. If you can't determine which framework this is for, you can just return the name
written in kebab-case.
Do not return any text other than the codemod name.
\`\`\`
${codemod}
\`\`\`
`;

function DropdownButton({ onPressCLIRun }: { onPressCLIRun: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open}>
      <DropdownMenu.Trigger
        className="select-none py-px"
        name="Navigation Button"
        aria-label="Hover for context menu"
        onClick={() => setOpen(!open)}
      >
        <Button
          size="xs"
          variant="default"
          className="text-white flex gap-1"
          hint={
            <p className="font-normal">
              Choose how you want to run your codemod
            </p>
          }
        >
          Run
          {open ? (
            <Icon name="chevron-up" className="w-3" />
          ) : (
            <Icon name="chevron-down" className="w-3" />
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          side="bottom"
          sideOffset={16}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          className="z-[99] min-w-[250px] animate-slideDownAndFade select-none rounded-[8px] border-[1px] border-border-light bg-primary-dark p-s shadow-sm dark:border-border-dark dark:bg-primary-light dark:shadow-none"
        >
          <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-s dark:border-b-border-dark">
            <DropdownMenu.Item asChild>
              <Button
                size="lg"
                variant="outline"
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
                onClick={onPressCLIRun}
              >
                <DownloadIcon />
                <span>locally via CLI</span>
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <DropdownMenu.Group className="flex flex-col border-b-border-light py-s dark:border-b-border-dark">
            <DropdownMenu.Item asChild>
              <Button
                size="lg"
                variant="outline"
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <TechLogo
                  className="text-black h-[16px] w-[16px]"
                  name="github"
                />

                <span>remotely on Github</span>
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const DownloadZip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const modStore = useModStore();
  const snippetStore = useSnippetStore();
  const engine = snippetStore.engine;

  const { session } = useSession();
  const { getToken } = useAuth();

  const handleClick = async () => {
    setIsDownloading(true);
    if (!modStore.internalContent) {
      return;
    }

    const token = await getToken();

    const humanCodemodName = await getHumanCodemodName(
      modStore.internalContent,
      token,
    );

    await downloadProject({
      name: humanCodemodName,
      codemodBody: modStore.internalContent,
      cases: [
        {
          before: snippetStore.inputSnippet,
          after: snippetStore.afterSnippet,
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
      <DropdownButton onPressCLIRun={handleClick} />

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

async function getHumanCodemodName(
  codemod: string,
  token: string | null,
): Promise<string> {
  if (token === null) {
    return "codemod";
  }

  try {
    if (!codemod) {
      throw new Error("codemod content not found");
    }

    let codemodName = "";
    if (token !== null) {
      // Ask LLM to come up with a name for the given codemod
      const codemodNameOrError = await sendMessage({
        message: generateCodemodHumanNamePrompt(codemod),
        token,
      });

      if (codemodNameOrError.isLeft()) {
        console.error(codemodNameOrError.getLeft());
      } else {
        codemodName = codemodNameOrError.get().text;
      }
    }

    return codemodName;
  } catch (error) {
    console.error(error);

    return "codemod";
  }
}
