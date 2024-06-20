import { useAuth, useSession } from "@clerk/nextjs";
import {
  getCodemodProjectFiles,
  isTypeScriptProjectFiles,
} from "@codemod-com/utilities";
import { getHumanCodemodName } from "@studio/api/getHumanCodemodName";
import { Button } from "@studio/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@studio/components/ui/dropdown-menu";
import { Separator } from "@studio/components/ui/separator";
import { ToastAction } from "@studio/components/ui/toast";
import { useToast } from "@studio/components/ui/use-toast";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import initSwc, { transform } from "@swc/wasm-web";
import { ChevronDownIcon, ChevronUpIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { DownloadZip } from "./DownloadZip";

export const RunOptions = () => {
  const [open, setOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const modStore = useModStore();
  const { engine, inputSnippet, afterSnippet } = useSnippetStore();

  const { session } = useSession();
  const { getToken } = useAuth();

  const { toast } = useToast();

  const handleClick = async () => {
    setIsPublishing(true);

    if (!session) {
      return toast({
        variant: "destructive",
        title: "Please first log in to use this feature",
        action: <ToastAction altText="Goto login page">Log in</ToastAction>,
      });
    }
    if (!modStore.internalContent) {
      return;
    }

    const token = await getToken();

    const humanCodemodName = await getHumanCodemodName(
      modStore.internalContent,
      token,
    );

    const files = getCodemodProjectFiles({
      name: humanCodemodName,
      codemodBody: modStore.internalContent,
      cases: [{ before: inputSnippet, after: afterSnippet }],
      engine,
      username: session.user.username ?? session.user.fullName,
    });

    // Pre-built file
    if (isTypeScriptProjectFiles(files)) {
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

      // zip.file(
      //   "dist/index.cjs",
      //   `/*! @license\n${files.LICENSE}\n*/\n${compiled}`,
      // );
    }

    setIsPublishing(false);
    setIsOpen(true);
  };

  return (
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

      <DropdownMenu open={open} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="unstyled"
            size="xs"
            role="list"
            className="p-0 pr-4 z-10"
            onClick={(e) => {
              setOpen((prev) => !prev);
            }}
          >
            {open ? (
              <ChevronUpIcon className="text-white w-3" />
            ) : (
              <ChevronDownIcon className="text-white w-3" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem className="h-7 bg-white">
            <DownloadZip />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="absolute inset-0 bg-transparent peer-hover:bg-gray-700 transition-colors" />
    </div>
  );
};
