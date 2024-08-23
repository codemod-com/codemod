"use client";

import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import { useViewStore } from "@/store/view";
import { Separator } from "@studio/components/ui/separator";
import { AlignJustify, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

const SecondaryHeader = () => {
  const { toggleSidebar } = useViewStore();

  return (
    <div className="flex w-full py-[6px] px-[16px] items-center flex-row gap-2 flex-grow h-[40px] bg-emphasis-light dark:bg-emphasis-dark">
      <AlignJustify role="button" onClick={toggleSidebar} />
      <Separator
        orientation="vertical"
        className="bg-border-light dark:bg-border-dark mx-[8px]"
      />
      <Link
        className="flex items-center gap-2 text-secondary-light whitespace-nowrap"
        href={"/insights"}
        prefetch
      >
        <Icon name="arrow-left" className="w-4" />
        All insights
      </Link>
      <Separator
        orientation="vertical"
        className="bg-border-light dark:bg-border-dark mx-[8px]"
      />
      <Button intent="inline">
        <div className="flex items-center gap-2">
          React 18.3.1 migration Insight <LinkIcon size={16} />
        </div>
      </Button>
    </div>
  );
};

export default SecondaryHeader;
