import useDebounce from "@/app/(website)/studio/src/hooks/useDebounce";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type React from "react";
import { useState } from "react";

interface NavigationDropdownProps {
  trigger: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end" | undefined;
  side?: "bottom" | "top" | "right" | "left" | undefined;
  sideOffset?: number;
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  trigger,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 16,
}) => {
  const [open, setOpen] = useState(false);
  const debouncedOpen = useDebounce<boolean>(open, 150);

  function handleMouseEnter(event: any) {
    event.preventDefault();
    setOpen(true);
  }

  function handleMouseLeave(event: any) {
    event.preventDefault();
    setOpen(false);
  }

  return (
    <DropdownMenu.Root
      open={debouncedOpen}
      modal={false}
      onOpenChange={setOpen}
    >
      <DropdownMenu.Trigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger(open)}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          sideOffset={sideOffset}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={handleMouseLeave}
          onPointerDownOutside={handleMouseLeave}
          className="z-[99] min-w-[250px] animate-slideDownAndFade select-none rounded-[8px] border-[1px] border-border-light bg-primary-dark/80 backdrop-blur-lg p-s shadow-sm dark:border-border-dark dark:bg-primary-light/90 dark:shadow-none"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
