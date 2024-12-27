import Icon from "@/components/shared/Icon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FileUp, Languages, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import HoverArrow from "../HoverArrow";
import { NavigationDropdown } from "./NavigationDropdown";

export default function SolutionButtonWithDropdown() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.prefetch("/");
  }, [pathname]);

  return (
    <NavigationDropdown
      align="center"
      trigger={(open: boolean) => (
        <span className="cursor-pointer flex items-center gap-2">
          <span className="font-medium body-s-medium">{"Solution"}</span>
          <Icon
            name="chevron-down"
            className={`w-3 transform transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </span>
      )}
    >
      <DropdownMenu.Group className="flex flex-col space-y-4">
        <DropdownMenu.Item asChild>
          <Link
            href="/i18n"
            prefetch
            className="body-s-medium flex items-center gap-3 group rounded-[8px] font-medium text-primary-light focus:outline-none dark:text-primary-dark"
          >
            <div className="p-2 transition-colors group-hover:bg-accent border border-border-light dark:border-border-dark rounded-[6px]">
              <Languages className="size-5 transition-colors group-hover:text-black" />
            </div>
            <div className="group flex flex-col">
              <span className="font-medium">
                Localization
                <HoverArrow className="ml-2" />
              </span>

              <span className="body-xs opacity-50 group-hover:opacity-100 transition-opacity">
                Replace hard-coded strings with i18n keys
              </span>
            </div>
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link
            href="/upgrades"
            prefetch
            className="body-s-medium flex items-center gap-3 group rounded-[8px] font-medium text-primary-light focus:outline-none dark:text-primary-dark"
          >
            <div className="p-2 transition-colors group-hover:bg-accent border border-border-light dark:border-border-dark rounded-[6px]">
              <FileUp className="size-5 transition-colors group-hover:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                Upgrades
                <HoverArrow className="ml-2" />
              </span>

              <span className="body-xs opacity-50 group-hover:opacity-100 transition-opacity">
                Upgrade packages
              </span>
            </div>
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link
            href="/security"
            prefetch
            className="body-s-medium flex items-center gap-3 group rounded-[8px] font-medium text-primary-light focus:outline-none dark:text-primary-dark"
          >
            <div className="p-2 transition-colors group-hover:bg-accent border border-border-light dark:border-border-dark rounded-[6px]">
              <ShieldAlert className="size-5 transition-colors group-hover:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                Security
                <HoverArrow className="ml-2" />
              </span>
              <span className="body-xs opacity-50 group-hover:opacity-100 transition-opacity">
                Fix security issues
              </span>
            </div>
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </NavigationDropdown>
  );
}
