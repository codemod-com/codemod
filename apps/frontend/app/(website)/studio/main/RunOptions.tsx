import { useAuth, useSession } from "@clerk/nextjs";
import {
  CODEMOD_VERSION_EXISTS,
  getCodemodProjectFiles,
  isApiError,
  isTypeScriptProjectFiles,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { getHumanCodemodName } from "@studio/api/getHumanCodemodName";
import { Button } from "@studio/components/ui/button";
import { Dialog, DialogContent } from "@studio/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";
import { Separator } from "@studio/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@studio/components/ui/tabs";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import initSwc, { transform } from "@swc/wasm-web";
import { ChevronDownIcon, ChevronUpIcon, PlayIcon } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as semver from "semver";
import { publishCodemod } from "../src/api/publishCodemod";
import { DownloadZip } from "./DownloadZip";
import { CopyTerminalCommands } from "./TerminalCommands";

export const RunOptions = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedName, setPublishedName] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const modStore = useModStore();
  const { engine, inputSnippet, afterSnippet } = useSnippetStore();

  const { session } = useSession();
  const { getToken } = useAuth();

  const handleClick = async () => {
    setIsPublishing(true);

    if (!modStore.internalContent) {
      setIsPublishing(false);
      return;
    }

    const token = await getToken();

    if (!session || !token) {
      setIsPublishing(false);
      console.log("logged out");
      return toast.error("Please first log in to use this feature", {
        position: "top-center",
        duration: 12000,
      });
    }

    const humanCodemodName = await getHumanCodemodName(
      modStore.internalContent,
      token,
    );

    setPublishedName(humanCodemodName);

    const files = getCodemodProjectFiles({
      name: humanCodemodName,
      codemodBody: modStore.internalContent,
      cases: [{ before: inputSnippet, after: afterSnippet }],
      engine,
      username: session.user.username ?? session.user.fullName,
    });

    if (!isTypeScriptProjectFiles(files)) {
      setIsPublishing(false);
      return toast.error("Invalid codemod type", {
        position: "top-center",
        duration: 12000,
      });
    }

    await initSwc();
    const { code: compiled } = await transform(files["src/index.ts"], {
      minify: true,
      module: { type: "commonjs" },
      jsc: {
        target: "es5",
        loose: false,
        parser: { syntax: "typescript", tsx: true },
      },
    });

    const publishResult = await publishCodemod({
      files: {
        mainFile: `/*! @license\n${files.LICENSE}\n*/\n${compiled}`,
        codemodRc: files[".codemodrc.json"],
      },
      mainFileName: "index.cjs",
      token,
    });

    setIsPublishing(false);

    if (!publishResult || publishResult.isLeft()) {
      const error = publishResult?.getLeft();

      if (!isApiError(error)) {
        setIsPublishing(false);
        return toast.error(
          "Failed to publish your codemod with an unexpected error.",
          { position: "top-center", duration: 12000 },
        );
      }

      if (error.error === CODEMOD_VERSION_EXISTS) {
        const codemodRc = parseCodemodConfig(
          JSON.parse(files[".codemodrc.json"]),
        );

        const retryResult = await publishCodemod({
          files: {
            mainFile: `/*! @license\n${files.LICENSE}\n*/\n${compiled}`,
            codemodRc: JSON.stringify({
              ...codemodRc,
              version: semver.inc(codemodRc.version, "patch"),
            }),
          },
          mainFileName: "index.cjs",
          token,
        });

        if (!retryResult || retryResult.isLeft()) {
          const retryError = retryResult?.getLeft();

          setIsPublishing(false);

          console.error(
            isApiError(retryError)
              ? retryError.errorText
              : "Unknown error. Contact Codemod team.",
          );

          return toast.error(
            "Failed to publish your codemod. Open console for more information.",
            { position: "top-center", duration: 12000 },
          );
        }
      }
    }

    setIsPublishing(false);
    setDialogOpen(true);
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <p>
            We have published your codemod to the Codemod Registry. You can now
            run it via CLI using the command below.
          </p>

          <Tabs defaultValue="npm">
            <TabsList>
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            </TabsList>

            <TabsContent value="npm">
              <InstructionsContent pm="npm" codemodName={publishedName} />
            </TabsContent>
            <TabsContent value="pnpm">
              <InstructionsContent pm="pnpm" codemodName={publishedName} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="rounded-md bg-black flex gap-1 h-7 items-center relative overflow-hidden">
        <Button
          size="xs"
          variant="outline"
          className="text-white flex gap-1 bg-inherit border-none hover:bg-gray-700 pl-4 z-10 peer"
          hint={
            <p className="font-normal">
              Will publish the codemod to the Codemod Registry
            </p>
          }
          isLoading={isPublishing}
          disabled={!modStore.internalContent || isPublishing}
          onClick={handleClick}
          id="run-codemod-button"
        >
          <PlayIcon className="w-3" />
          Run via CLI
        </Button>

        <Separator orientation="vertical" className="mx-2 h-2/3 z-10" />

        <DropdownMenu open={dropdownOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="unstyled"
              size="xs"
              role="list"
              className="p-0 pr-4 z-10"
              onClick={(e) => {
                setDropdownOpen((prev) => !prev);
              }}
            >
              {dropdownOpen ? (
                <ChevronUpIcon className="text-white w-3" />
              ) : (
                <ChevronDownIcon className="text-white w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-white" align="end">
            <DropdownMenuItem asChild>
              <DownloadZip />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="absolute inset-0 bg-transparent peer-hover:bg-gray-700 transition-colors" />
      </div>
    </>
  );
};

function InstructionsContent({
  pm,
  codemodName,
}: { pm: "pnpm" | "npm"; codemodName: string | null }) {
  const npxDialect = useMemo(() => {
    if (pm === "pnpm") {
      return "pnpm dlx";
    }

    return "npx";
  }, [pm]);

  if (!codemodName) {
    return null;
  }

  return (
    <div className="space-y-1">
      <CopyTerminalCommands text={`${npxDialect} codemod ${codemodName}`} />
    </div>
  );
}
