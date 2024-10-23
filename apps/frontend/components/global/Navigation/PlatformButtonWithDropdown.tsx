import Icon from "@/components/shared/Icon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlatformButtonWithDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function handleMouseEnter(event: React.MouseEvent) {
    event.preventDefault();
    setOpen(true);
  }

  function handleMouseLeave(event: React.MouseEvent) {
    event.preventDefault();
    setOpen(false);
  }

  useEffect(() => {
    router.prefetch("/");
    setOpen(false);
  }, [pathname]);

  return (
    <DropdownMenu.Root open={open} modal={false}>
      <DropdownMenu.Trigger
        className="select-none py-px"
        name="Navigation Button"
        aria-label="Hover for context menu"
        onMouseEnter={handleMouseEnter}
      >
        <span className="cursor-pointer flex items-center gap-2">
          <span className="font-medium body-s-medium">{"Platform"}</span>
          {open ? (
            <Icon name="chevron-up" className="w-3" />
          ) : (
            <Icon name="chevron-down" className="w-3" />
          )}
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          side="bottom"
          sideOffset={16}
          onMouseLeave={handleMouseLeave}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          className="z-[99] min-w-[250px] animate-slideDownAndFade select-none rounded-[8px] border-[1px] border-border-light bg-primary-dark p-s shadow-sm dark:border-border-dark dark:bg-primary-light dark:shadow-none"
        >
          <div className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
            Build
          </div>
          <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-s dark:border-b-border-dark">
            <DropdownMenu.Item asChild>
              <Link
                href="/studio"
                prefetch
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <Icon name="codemod-studio" className="h-5 w-5" />
                <span>Codemod Studio</span>
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <div className="body-s-medium pt-s font-medium text-secondary-light dark:text-secondary-dark">
            Share/Discover
          </div>
          <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-s dark:border-b-border-dark">
            <DropdownMenu.Item asChild>
              <Link
                href="/registry"
                prefetch
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <Icon name="layers-2" className="h-5 w-5" />
                <span>Codemod Registry</span>
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <div className="body-s-medium pt-s font-medium text-secondary-light dark:text-secondary-dark">
            Run
          </div>
          <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-s dark:border-b-border-dark">         
            <DropdownMenu.Item asChild>
              <a
                href="https://marketplace.visualstudio.com/items?itemName=codemod.codemod-vscode-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <Icon name="vscode" className="h-4 w-4" />
                <span>VS Code Extension</span>
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href="https://go.codemod.com/cli-docs"
                prefetch
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <Icon name="terminal" className="h-5 w-5" />
                <span>CLI</span>
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <div className="body-s-medium pt-s font-medium text-secondary-light dark:text-secondary-dark">
            Migrate at Scale
          </div>
          <DropdownMenu.Group className="pt-s">
            <DropdownMenu.Item asChild>
              <Link
                href="/contact"
                prefetch
                className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
              >
                <Icon name="codemod-studio" className="h-5 w-5" />
                <span>Private Alpha (Contact Us)</span>
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
