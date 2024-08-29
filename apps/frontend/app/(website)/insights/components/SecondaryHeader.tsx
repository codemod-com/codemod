"use client";
import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import { useViewStore } from "@/store/view";
import { Separator } from "@studio/components/ui/separator";
import { AlignJustify, Folder, Plus, Settings } from "lucide-react";
import { useInsights } from "../hooks/useInsights";
import InsightsCounter from "./InsightsCounter";
import SearchBox from "./SearchBox";

type Props = {
  selectedRepoName: string;
  onOpenRepoSelector(): void;
  onAddNewInsight(): void;
};

const SecondaryHeader = ({
  selectedRepoName,
  onOpenRepoSelector,
  onAddNewInsight,
}: Props) => {
  const { data: insightsData } = useInsights();
  const { toggleSidebar, setInsightsSearchTerm } = useViewStore();

  return (
    <div className="flex w-full py-[6px] px-[16px] items-center flex-row gap-2 flex-grow h-[40px] bg-emphasis-light dark:bg-emphasis-dark">
      <AlignJustify role="button" onClick={toggleSidebar} />
      <Separator
        orientation="vertical"
        className="bg-border-light dark:bg-border-dark mx-[8px]"
      />
      <Button
        intent="secondary-icon-only"
        className="!px-[6px] !py-[6px]"
        onClick={() => {}}
      >
        <Icon name="filter" className="!w-[16px] !h-[16px]" />
      </Button>
      <SearchBox
        placeholder="Search for insights"
        onSearch={setInsightsSearchTerm}
      />
      <Separator
        orientation="vertical"
        className="bg-border-light dark:bg-border-dark mx-[8px]"
      />
      <Button
        intent="secondary"
        className="!py-xxs !px-xs"
        onClick={onOpenRepoSelector}
      >
        <span className="flex flex-row flex-nowrap max-w-[280px] gap-xs items-center">
          <span className="font-regular">Repository:</span>
          <Folder size={16} className="min-w-[16px] min-h-[16px]" />
          <span className="text-ellipsis overflow-hidden text-nowrap">
            {selectedRepoName ?? "Select Repository"}
          </span>
        </span>
      </Button>
      {/* Buttons padding is different then in other place @TODO check why */}
      <Button intent="secondary" className="!py-xxs !px-xs">
        <span className="flex flex-row flex-nowrap gap-xs items-center">
          <Settings size={16} /> Display
        </span>
      </Button>
      <Button
        intent="secondary"
        className="!py-xxs !px-xs"
        onClick={onAddNewInsight}
      >
        <span className="flex flex-row flex-nowrap gap-xs items-center">
          <Plus size={16} /> Add
        </span>
      </Button>
      <Separator
        orientation="vertical"
        className="bg-border-light dark:bg-border-dark mx-[8px]"
      />
      <InsightsCounter insightCount={insightsData?.total ?? 0} />
    </div>
  );
};

export default SecondaryHeader;
