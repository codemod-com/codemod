import Icon from "@/components/shared/Icon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { NavigationDropdown } from "./NavigationDropdown";

type DropdownProps = {
  animationVariants?: Record<string, any>;
};

export default function PlatformButtonWithDropdown({
  animationVariants,
}: DropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.prefetch("/");
  }, [pathname]);

  return (
    <NavigationDropdown
      align="center"
      trigger={(open: boolean) => (
        <div className="cursor-pointer">
          <div className="lg:flex hidden items-center gap-2">
            <span className="font-medium body-s-medium">{"Platform"}</span>
            <Icon
              name="chevron-down"
              className={`w-3 transform transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {/* Mobile */}
          <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="lg:hidden flex justify-between items-center bg-primary-dark rounded-[8px] p-s dark:bg-primary-light transition-colors hover:bg-primary-light/5 dark:hover:bg-primary-dark/5"
          >
            <span className="font-medium body-s-medium">{"Platform"}</span>
            <Icon
              name="chevron-down"
              className={`w-4 transform transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </motion.div>
        </div>
      )}
    >
      <div className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
        Build
      </div>
      <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-2 dark:border-b-border-dark">
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
        Discover
      </div>
      <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-2 dark:border-b-border-dark">
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
      <DropdownMenu.Group className="flex flex-col border-b-[1px] border-b-border-light py-2 dark:border-b-border-dark">
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
        Scale
      </div>

      <DropdownMenu.Group className="pt-2">
        <DropdownMenu.Item asChild>
          <Link
            href="/contact"
            prefetch
            className="body-s-medium flex items-center gap-xs rounded-[8px] p-xs font-medium text-primary-light focus:outline-none data-[highlighted]:bg-emphasis-light dark:text-primary-dark dark:data-[highlighted]:bg-emphasis-dark"
          >
            <Icon name="codemod-studio" className="h-5 w-5" />
            <span>Private Alpha - Contact Us</span>
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </NavigationDropdown>
  );
}
