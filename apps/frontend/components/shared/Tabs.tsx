"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useState } from "react";

export type TabsProps = {
  items: {
    id: string;
    label: string;
  }[];
  children: React.ReactNode;
  listClassName?: string;
};

export default function Tabs({ items, children, listClassName }: TabsProps) {
  const [activeTab, setActiveTab] = useState(items[0].id);

  return (
    <RadixTabs.Root
      defaultValue={items[0].id}
      onValueChange={(newValue) => setActiveTab(newValue as string)}
      className="w-full"
    >
      <RadixTabs.List
        className={cx(
          "flex max-w-fit items-center rounded-[8px] border-[1px] border-border-light p-xxs dark:border-border-dark",
          listClassName,
        )}
      >
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.id}
            value={item.id}
            onClick={() => setActiveTab(item.id)}
            className="body-s-medium group relative flex items-center gap-xs rounded-[4px] px-[12px] py-xxs font-medium text-primary-light transition-colors duration-300 data-[state=active]:text-primary-light dark:text-primary-dark"
          >
            {activeTab === item.id && (
              <motion.span
                aria-hidden
                className="body-s-medium absolute inset-0 flex h-full w-full items-center gap-xs rounded-[4px] bg-gradient-to-br from-accent to-[#EEFDC2] px-[12px] py-xxs group-data-[state=active]:bg-gradient-to-br group-data-[state=active]:from-accent group-data-[state=active]:to-[#EEFDC2]"
                layoutId="activeTab"
                transition={{ type: "ease-out", duration: 0.3 }}
              />
            )}
            <span className="z-[1]">{item.label}</span>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export function TabContent({
  children,
  forId,
}: {
  children: React.ReactNode;
  forId: string;
}) {
  return <RadixTabs.Content value={forId}>{children}</RadixTabs.Content>;
}
