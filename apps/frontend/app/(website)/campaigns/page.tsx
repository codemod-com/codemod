"use client";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import type { GithubRepository } from "@codemod-com/api-types";
import { useState } from "react";
import AddNewCampaignDialog from "./components/AddNewCampaign";
import CampaignsTable from "./components/CampaignsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";
import { useCampaignTabsConfig } from "./hooks/useCampaigTabsConfig";
import { useCampaigns } from "./hooks/useCampaigns";

const InsightsPage = () => {
  const tabsConfig = useCampaignTabsConfig();
  const campaigns = useCampaigns();

  const [repo, setRepo] = useState<GithubRepository | null>(null);
  const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  const [addNewCampaignModalOpen, setAddNewCampaignModalOpen] = useState(false);
  // useEffect(() => {
  //   if (!repo) {
  //     setOpen(true);
  //   }
  // }, [repo]);

  console.log(campaigns, "????");
  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setRepoSelectorOpen(true)}
          onAddNewCampaign={() => setAddNewCampaignModalOpen(true)}
          campaignCount={0}
          selectedRepoName={repo?.name ?? "Select Repository"}
        />
        <div className="flex w-full justify-start">
          <Tabs
            listClassName="h-[28px]"
            items={tabsConfig.map(({ kind, label }) => ({ id: kind, label }))}
          >
            {tabsConfig.map(({ kind, label }) => (
              <TabContent forId={kind} key={label}>
                <CampaignsTable
                  campaigns={campaigns?.data?.data ?? []}
                  type={kind}
                />
              </TabContent>
            ))}
          </Tabs>
        </div>
      </div>

      <RepositorySelector
        open={repoSelectorOpen}
        onConfirm={(repo) => {
          setRepo(repo);
          setRepoSelectorOpen(false);
        }}
        onOpenChange={setRepoSelectorOpen}
      />
      <AddNewCampaignDialog
        onAddCampaign={() => {}}
        open={addNewCampaignModalOpen}
        onOpenChange={setAddNewCampaignModalOpen}
      />
    </>
  );
};

export default InsightsPage;
