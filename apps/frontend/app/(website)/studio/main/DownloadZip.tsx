import Icon, { TechLogo } from "@/components/shared/Icon";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { cn } from "@/utils";
import { CODEMOD_RUN_FEATURE_FLAG } from "@/utils/strings";
import { useUser } from "@clerk/nextjs";
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
import { useLocalStorage } from "@studio/hooks/useLocalStorage";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { downloadProject } from "@studio/utils/download";
import type { GHBranch, GithubRepository } from "be-types";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useMemo, useState } from "react";
import {
  RepositoryModal,
  getButtonPropsByStatus,
  useExecutionStatus,
  useOpenRepoModalAfterSignIn,
} from "../features/GHRun";
import { UserPromptModal } from "../features/GHRun/components/UserPromptModal";
import { useCodemodExecution } from "../features/GHRun/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "../src/hooks/useEnsureUserSigned";
import { useModal } from "../src/hooks/useModal";

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

function DropdownButton({
  onPressCLIRun,
  onPressGHRun,
}: {
  onPressCLIRun: (event: MouseEvent<HTMLButtonElement>) => void;
  onPressGHRun: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [runPlatform, setRunPlatform] = useState<"cli" | "github">("cli");
  const ffs = useFeatureFlags();
  const isGHRunEnabled = ffs.includes(CODEMOD_RUN_FEATURE_FLAG);

  return (
    <DropdownMenu.Root open={open}>
      <DropdownMenu.Trigger
        className="select-none py-px"
        name="Navigation Button"
        aria-label="Hover for context menu"
      >
        <Button
          size="xs"
          variant="default"
          className="text-white flex gap-1 bg-[#0B151E] hover:bg-[#0B151E] hover:bg-opacity-90"
          onClick={(e) => {
            if (runPlatform === "cli") {
              onPressCLIRun(e);
            } else if (runPlatform === "github") {
              onPressGHRun(e);
            }
          }}
        >
          {runPlatform === "cli" ? (
            <Icon name="terminal" className="h-5 w-5" />
          ) : (
            <TechLogo
              className="text-black h-5 w-5"
              name="github"
              pathClassName="fill-white"
            />
          )}
          Run in {runPlatform === "cli" ? "CLI" : "Github"}
          <Button
            size="xs"
            variant="default"
            className="text-white flex bg-transparent hover:bg-transparent"
            hint={
              <p className="font-normal">
                Choose how you want to run your codemod
              </p>
            }
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <span className="mr-2">|</span>
            {open ? (
              <Icon name="chevron-up" className="w-3" />
            ) : (
              <Icon name="chevron-down" className="w-3" />
            )}
          </Button>
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
          className="z-[99] min-w-[250px] animate-slideDownAndFade select-none rounded-[8px] border-[1px] border-border-light bg-primary-dark shadow-sm dark:border-border-dark dark:bg-primary-light dark:shadow-none"
        >
          <DropdownMenu.Group className="flex">
            <DropdownMenu.Item asChild>
              <Button
                size="lg"
                variant="outline"
                className="py-m w-full body-s-large flex flex-row items-center gap-xs p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark border-none"
                style={{ justifyContent: "flex-start" }}
                onClick={(e) => {
                  setRunPlatform("cli");
                  onPressCLIRun(e);
                }}
              >
                <Icon name="terminal" className="h-5 w-5" />
                <span>Run in CLI</span>
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <DropdownMenu.Group className="flex">
            <DropdownMenu.Item asChild>
              <Button
                size="lg"
                variant="outline"
                className="py-m w-full body-s-large flex flex-row items-center gap-xs p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark border-none"
                style={{ justifyContent: "flex-start" }}
                disabled={!isGHRunEnabled}
                onClick={(e) => {
                  setRunPlatform("github");
                  onPressGHRun(e);
                }}
                hint={
                  isGHRunEnabled ? null : (
                    <p className="font-normal">
                      This feature is not available yet. Stay tuned for updates.
                    </p>
                  )
                }
              >
                <TechLogo
                  className="text-black h-[16px] w-[16px]"
                  name="github"
                />
                <span>Run in Github</span>
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const DownloadZip = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  const [codemodExecutionId, setCodemodExecutionId, clearExecutionId] =
    useLocalStorage("codemodExecutionId");
  const [branchesToShow, setBranchesToShow] = useState<GHBranch[]>([]);

  const {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
    areReposLoading,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  const showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  const {
    showModal: showUserPromptModal,
    hideModal: hideUserPromptModal,
    isModalShown: isUserPromptModalShown,
  } = useModal();

  const codemodRunStatus = useExecutionStatus({
    codemodExecutionId,
    clearExecutionId,
  });
  const status = codemodRunStatus?.result?.status ?? null;
  const { text, hintText } = getButtonPropsByStatus(status);
  const { onCodemodRun } = useCodemodExecution({
    codemodExecutionId,
    setCodemodExecutionId,
  });

  const handlePressGHRun = (event: MouseEvent<HTMLButtonElement>) => {
    const githubAccount = user?.externalAccounts.find(
      (account) => account.provider === "github",
    );

    if (!githubAccount) {
      return;
    }

    if (githubAccount.approvedScopes.includes("repo")) {
      showRepoModalToSignedUser(event);
      return;
    }
    showUserPromptModal();
  };

  const onApprove = async () => {
    const githubAccount = user?.externalAccounts.find(
      (account) => account.provider === "github",
    );

    if (!githubAccount) {
      return;
    }

    try {
      const res = await githubAccount.reauthorize({
        redirectUrl: window.location.href,
        additionalScopes: ["repo"],
      });
      if (res.verification?.externalVerificationRedirectURL) {
        router.push(res.verification.externalVerificationRedirectURL.href);
        return;
      }

      throw new Error("externalVerificationRedirectURL not found");
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  const modStore = useModStore();
  const snippetStore = useSnippetStore();
  const engine = snippetStore.engine;

  const { session } = useSession();
  const { getToken } = useAuth();

  const handlePressCLIRun = async () => {
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

    setIsOpen(true);
  };

  if (engine === "ts-morph") {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DropdownButton
          onPressCLIRun={handlePressCLIRun}
          onPressGHRun={handlePressGHRun}
        />

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
      <RepositoryModal
        onCodemodRun={onCodemodRun}
        branchesToShow={branchesToShow}
        setBranchesToShow={setBranchesToShow}
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        areReposLoading={areReposLoading}
      />
      <UserPromptModal
        isModalShown={isUserPromptModalShown}
        onApprove={onApprove}
        onReject={hideUserPromptModal}
      />
    </>
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
