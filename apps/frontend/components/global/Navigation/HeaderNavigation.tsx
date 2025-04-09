import Icon from "@/components/shared/Icon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, type Variants, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import HoverArrow from "../HoverArrow";
import { NavigationDropdown } from "./NavigationDropdown";

export type DropdownProps = {
  animationVariants?: Variants;
  label: string;
  items: {
    href: string;
    icon: JSX.Element;
    label: string;
    description?: string;
  }[];
};

export default function HeaderDropdown({
  label,
  items,
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
            <span className="font-medium body-s-medium">{label}</span>
            <Icon
              name="chevron-down"
              className={`w-3 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
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
            <span className="font-medium body-s-medium">{label}</span>
            <Icon
              name="chevron-down"
              className={`w-4 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
            />
          </motion.div>
        </div>
      )}
    >
      <AnimatePresence mode="popLayout">
        <DropdownMenu.Group className="flex flex-col space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenu.Item asChild>
                <Link
                  href={item.href}
                  prefetch
                  className="body-s-medium flex items-center gap-3 group rounded-[8px] font-medium text-primary-light focus:outline-none dark:text-primary-dark"
                >
                  <div className="p-2 transition-colors group-hover:bg-accent border border-border-light dark:border-border-dark rounded-[6px]">
                    {item.icon}
                  </div>
                  <div className="group flex flex-col">
                    <span className="font-medium">
                      {item.label}
                      <HoverArrow className="ml-2" />
                    </span>
                    <span className="body-xs opacity-50 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </DropdownMenu.Item>
            </motion.div>
          ))}
        </DropdownMenu.Group>
      </AnimatePresence>
    </NavigationDropdown>
  );
}
