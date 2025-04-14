import { cn } from "@/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, type Variants, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
    category?: string;
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

  const groupedItems = items.reduce<Record<string, DropdownProps["items"]>>(
    (acc, item) => {
      const category = item.category || "__none";
      acc[category] = acc[category] || [];
      acc[category].push(item);
      return acc;
    },
    {},
  );

  return (
    <NavigationDropdown
      sideOffset={0}
      align="center"
      trigger={(open) => (
        <div className="cursor-pointer group select-none lg:py-2">
          <div className="lg:flex hidden items-center gap-2">
            <span className="font-medium body-s-medium">{label}</span>
            <ChevronDown
              className={cn(
                "size-4 transform transition-transform duration-200 group-hover:rotate-180",
                { "rotate-180": open },
              )}
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
            <ChevronDown
              className={cn(
                "size-4 transform transition-transform duration-200 group-hover:rotate-180",
                { "rotate-180": open },
              )}
            />
          </motion.div>
        </div>
      )}
    >
      <AnimatePresence mode="popLayout">
        {Object.entries(groupedItems).map(([category, group]) => (
          <DropdownMenu.Group key={category} className="flex flex-col">
            {category !== "__none" && (
              <div className="body-s-medium font-medium text-secondary-light my-1.5 dark:text-secondary-dark">
                {category}
              </div>
            )}
            {group.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href={item.href}
                    prefetch
                    className="body-s-medium my-1 flex items-center gap-3 group rounded-[8px] font-medium text-primary-light focus:outline-none dark:text-primary-dark"
                  >
                    <div className="p-2 transition-colors group-hover:bg-accent border border-border-light dark:border-border-dark rounded-[6px]">
                      {item.icon}
                    </div>
                    <div className="group flex flex-1 flex-col">
                      <span className="flex w-full items-center justify-between font-medium">
                        {item.label}
                        <HoverArrow className="ml-2" />
                      </span>
                      {item.description && (
                        <span className="body-xs opacity-50 group-hover:opacity-100 transition-opacity">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenu.Item>
              </motion.div>
            ))}
          </DropdownMenu.Group>
        ))}
      </AnimatePresence>
    </NavigationDropdown>
  );
}
