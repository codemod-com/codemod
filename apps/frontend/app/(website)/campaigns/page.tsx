"use client";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import { useMirageServer } from "@/hooks/useMirageServer";
import type { GithubRepository } from "@codemod-com/api-types";
import { useEffect, useState } from "react";
import CampaignsTable from "./components/CampaignsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";
import { useCampaignTabsConfig } from "./hooks/useCampaigTabsConfig";

const InsightsPage = () => {
  useMirageServer(true);
  const tabsConfig = useCampaignTabsConfig();

  const [repo, setRepo] = useState<GithubRepository | null>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!repo) {
      setOpen(true);
    }
  }, [repo]);

  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setOpen(true)}
          campaignCount={0}
          selectedRepoName={repo?.name ?? "Select Repository"}
        />
        <div className="flex w-full justify-start">
          {!repo ? (
            <p className="text-center">Please select repository to continue</p>
          ) : (
            <Tabs
              listClassName="h-[28px]"
              items={tabsConfig.map(({ kind, label }) => ({ id: kind, label }))}
            >
              {tabsConfig.map(({ kind }) => (
                <TabContent forId={kind}>
                  <CampaignsTable campaigns={[]} type={kind} />
                </TabContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
      <RepositorySelector
        open={open}
        onConfirm={(repo) => {
          setRepo(repo);
          setOpen(false);
        }}
        onOpenChange={setOpen}
      />
    </>
  );
};

export default InsightsPage;
