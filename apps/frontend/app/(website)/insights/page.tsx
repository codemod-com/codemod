"use client";

import Tabs, { TabContent } from "@/components/shared/Tabs";
import { useMemo, useState } from "react";

import AddNewInsightDialog from "./components/AddNewInsight";
import InsightsTable from "./components/InsightsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";

import { useAuth } from "@/app/auth/useAuth";
import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { ChartBar, GithubLogo } from "@phosphor-icons/react";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { Card } from "../studio/src/components/ui/card";
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
  const insightsQuery = useInsights();

  const { selectedRepos, setSelectedRepos } = useViewStore();
  const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  const [addNewInsightModalOpen, setAddNewInsightModalOpen] = useState(false);

  const { mutateAsync } = useCreateInsightMutation();

  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return (
      <Card className="flex flex-col md:flex-row items-center p-6 space-y-6 md:space-y-0 md:space-x-6 bg-white shadow-lg rounded-lg w-1/2 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <ChartBar className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Codemod Insights</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Build or modify auto-generated dashboards to manage and track
            external, internal, and incremental migrations across your entire
            stack, all powered by codemods.
          </p>

          <Separator className="my-2 bg-gray-400 h-[1px] opacity-75" />

          <p className="mt-4 text-sm">Connect your GitHub to get started.</p>
          <Link href="/auth/sign-in">
            <Button
              className="mt-4 flex items-center justify-center space-x-2 flex-nowrap w-full"
              loadingOpacity={false}
              intent="primary"
              role="link"
            >
              <GithubLogo className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </Button>
          </Link>
        </div>

        <div className="flex-1">
          <img
            src="/insights-preview.png"
            alt="Insights Preview"
            className=""
          />
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setRepoSelectorOpen(true)}
          onAddNewInsight={() => setAddNewInsightModalOpen(true)}
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
                <InsightsTable />
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
