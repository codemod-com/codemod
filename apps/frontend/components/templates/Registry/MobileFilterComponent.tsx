"use client";
import { useTranslation } from "react-i18next";

import { Drawer } from "vaul";

import Button from "@/components/shared/Button";
import { useRegistryFilters } from "@/hooks/useRegistryFilters";
import type { RegistryIndexPayload } from "@/types";
import React from "react";
import FilterSection from "./FilterSection";
import { useSidebar } from "./context";

export default function MobileFilterComponent({
  placeholders,
  automationFilters,
  filterIconDictionary,
}: {
  placeholders?: RegistryIndexPayload["placeholders"];
  automationFilters?: RegistryIndexPayload["automationFilters"];
  filterIconDictionary?: RegistryIndexPayload["filterIconDictionary"];
}) {
const { t } = useTranslation("../components/templates/Registry");

  const { mobileOpen, toggleSidebar } = useSidebar();
  const { toggleFilters } = useRegistryFilters();

  return (
    <div className="block lg:hidden">
      <Drawer.Root
        open={mobileOpen}
        onClose={() => {
          if (mobileOpen) {
            toggleSidebar();
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay
            onClick={() => {
              if (mobileOpen) {
                toggleSidebar();
              }
            }}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <Drawer.Content className="scrollbar-color fixed bottom-0 left-0 right-0 z-50 flex max-h-[80%] flex-col rounded-t-[10px] bg-white pt-4 dark:bg-background-dark">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-6 overflow-auto rounded-t-[10px] pl-4 pr-1">
              {automationFilters?.map((section, i, arr) => (
                <React.Fragment key={`${(section?.title || "") + i}`}>
                  <FilterSection
                    placeholders={placeholders}
                    filterIconDictionary={filterIconDictionary}
                    {...section}
                  />
                  {i === arr.length - 1 && <div className="pb-10" />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between gap-[10px] border-t px-6 py-4 dark:border-white/15">
              <Button
                className="w-full"
                intent="secondary"
                onClick={() => {
                  toggleFilters(true);
                  toggleSidebar();
                }}
              >{t('clear-and-close')}</Button>
              <Button
                className="w-full"
                intent="primary"
                onClick={() => toggleSidebar()}
              >{t('apply-filters')}</Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
