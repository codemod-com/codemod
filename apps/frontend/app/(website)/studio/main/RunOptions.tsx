import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@studio/components/ui/button";
import { Separator } from "@studio/components/ui/separator";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DownloadZip } from "./DownloadZip";

export const RunOptions = () => {
  const [open, setOpen] = useState(false);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    setOpen((prev) => !prev);
  }

  console.log("open", open);

  return (
    <DropdownMenu.Root open={open} modal={false}>
      <DropdownMenu.Trigger
        className="select-none py-px flex gap-1"
        name="Run button"
        aria-label="Click for run options"
        onClick={handleClick}
      >
        <Button
          size="xs"
          variant="default"
          className="text-white flex gap-1 bg-black"
          // hint={
          //   <p className="font-normal">
          //     Will publish the codemod to the Codemod Registry
          //   </p>
          // }
          // isLoading={isDownloading}
          // disabled={!modStore.internalContent || isDownloading}
          onClick={handleClick}
          id="run-codemod-button"
        >
          <PlayIcon className="w-3" />
          Run via CLI
          <Separator orientation="vertical" className="mx-2 h-2/3" />
          <Button variant="unstyled" role="list" className="p-0">
            {open ? (
              <ChevronUpIcon className="text-white w-3 mr-1" />
            ) : (
              <ChevronDownIcon className="text-white w-3 mr-1" />
            )}
          </Button>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="start"
        side="bottom"
        sideOffset={16}
        // onMouseLeave={handleMouseLeave}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={() => setOpen(false)}
        onPointerDownOutside={() => setOpen(false)}
        className="z-[99] min-w-[250px] animate-slideDownAndFade select-none rounded-[8px] border-[1px] border-border-light bg-primary-dark p-s shadow-sm dark:border-border-dark dark:bg-primary-light dark:shadow-none"
      >
        <DropdownMenu.Item asChild>
          <DownloadZip />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
