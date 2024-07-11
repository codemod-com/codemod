import { useAuth, useSession } from "@clerk/nextjs";
import {
  CODEMOD_VERSION_EXISTS,
  buildCodemodSlug,
  getCodemodProjectFiles,
  isApiError,
  isTypeScriptProjectFiles,
  parseCodemodConfig,
} from "@codemod-com/utilities";
import { getCodemod } from "@studio/api/getCodemod";
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
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
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
  const { engine, getAllSnippets } = useSnippetsStore();

  const { session } = useSession();
  const { getToken } = useAuth();

  const handleClick = async () => {
    setIsPublishing(true);

    if (!modStore.content) {
      setIsPublishing(false);
      return;
    }

    const token = await getToken();

    if (!session || !token) {
      setIsPublishing(false);
      return toast.error("Please first log in to use this feature", {
        position: "top-center",
        duration: 12000,
      });
    }

    const humanCodemodName = await getHumanCodemodName(modStore.content, token);

    const codemodResponse = await getCodemod({
      name: buildCodemodSlug(humanCodemodName),
      token,
    });

    if (codemodResponse.isLeft()) {
      setIsPublishing(false);
      return;
    }

    const allSnippets = getAllSnippets();

    const files = getCodemodProjectFiles({
      name: humanCodemodName,
      codemodBody: modStore.content,
      cases: allSnippets.before.reduce(
        (acc, before, i) => {
          const after = allSnippets.after[i];
          if (!after) {
            return acc;
          }

          return acc.concat({ before, after });
        },
        [] as { before: string; after: string }[],
      ),
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

    const codemodRc = parseCodemodConfig(JSON.parse(files[".codemodrc.json"]));

    const latestVersion = codemodResponse.get().versions.at(-1)?.version;
    if (!latestVersion) {
      setIsPublishing(false);
      return toast.error("Unexpected error occurred", {
        position: "top-center",
        duration: 12000,
      });
    }
    if (semver.lte(codemodRc.version, latestVersion)) {
      codemodRc.version =
        semver.inc(latestVersion, "patch") ?? codemodRc.version;
      files[".codemodrc.json"] = JSON.stringify(codemodRc, null, 2);
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

    if (publishResult.isLeft()) {
      return;
    }

    setPublishedName(publishResult.get().name);
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
          isLoading={true}
          disabled={!modStore.content || isPublishing}
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
