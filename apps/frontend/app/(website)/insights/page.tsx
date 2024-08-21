"use client";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import { useMemo, useState } from "react";

import AddNewInsightDialog from "./components/AddNewInsight";
import InsightsTable from "./components/InsightsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";

import { useViewStore } from "@/store/view";
import { useCreateInsightMutation } from "./hooks/useCreateInsightMutation";
import { useInsights } from "./hooks/useInsights";

export type InsightsTabsConfig = [
  { id: "my"; label: "All" },
  { id: "all_available"; label: "Recommended" },
  { id: "featured"; label: "Featured" },
];

const InsightsPage = () => {
  const tabsConfig = useMemo(
    () =>
      [
        { id: "my", label: "All" },
        { id: "all_available", label: "Recommended" },
        { id: "featured", label: "Featured" },
      ] satisfies InsightsTabsConfig,
    [],
  );
  const insights = useInsights();

  const { selectedRepos, setSelectedRepos } = useViewStore();
  const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  const [addNewInsightModalOpen, setAddNewInsightModalOpen] = useState(false);

  const { mutateAsync } = useCreateInsightMutation();

  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setRepoSelectorOpen(true)}
          onAddNewInsight={() => setAddNewInsightModalOpen(true)}
          insightCount={insights.data?.length ?? 0}
          selectedRepoName={selectedRepos.join(",") ?? "Select Repository"}
        />
        <div className="flex w-full justify-start">
          <Tabs
            listClassName="h-[28px] border-none"
            itemClassName="group-data-[state=active]:bg-none group-data-[state=active]:border-b-2 group-data-[state=active]:border-gray-darker rounded-none"
            items={tabsConfig}
          >
            {tabsConfig.map(({ id, label }) => (
              <TabContent forId={id} key={label}>
                <InsightsTable insights={insights?.data ?? []} type={id} />
              </TabContent>
            ))}
          </Tabs>
        </div>
      </div>

      <RepositorySelector
        open={repoSelectorOpen}
        onConfirm={(repo) => {
          setSelectedRepos([repo]);
          setRepoSelectorOpen(false);
        }}
        onOpenChange={setRepoSelectorOpen}
      />
      <AddNewInsightDialog
        onAddInsight={mutateAsync}
        open={addNewInsightModalOpen}
        onOpenChange={setAddNewInsightModalOpen}
      />
    </>
  );
};

export default InsightsPage;
