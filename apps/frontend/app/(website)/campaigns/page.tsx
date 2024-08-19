"use client";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import { useState } from "react";

import AddNewCampaignDialog from "./components/AddNewCampaign";
import CampaignsTable from "./components/CampaignsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";

import { useViewStore } from "@/store/view";
import { useCampaignTabsConfig } from "./hooks/useCampaigTabsConfig";
import { useCampaigns } from "./hooks/useCampaigns";
import { useCreateCampaignMutation } from "./hooks/useCreateCampaignMutation";

const CampaignsPage = () => {
  const tabsConfig = useCampaignTabsConfig();
  const campaigns = useCampaigns();

  const { selectedRepos, setSelectedRepos } = useViewStore();
  const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  const [addNewCampaignModalOpen, setAddNewCampaignModalOpen] = useState(false);

  const { mutateAsync } = useCreateCampaignMutation();

  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setRepoSelectorOpen(true)}
          onAddNewCampaign={() => setAddNewCampaignModalOpen(true)}
          campaignCount={campaigns.data?.length ?? 0}
          selectedRepoName={selectedRepos.join(",") ?? "Select Repository"}
        />
        <div className="flex w-full justify-start">
          <Tabs
            listClassName="h-[28px]"
            items={tabsConfig.map(({ kind, label }) => ({ id: kind, label }))}
          >
            {tabsConfig.map(({ kind, label }) => (
              <TabContent forId={kind} key={label}>
                <CampaignsTable campaigns={campaigns?.data ?? []} type={kind} />
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
      <AddNewCampaignDialog
        onAddCampaign={mutateAsync}
        open={addNewCampaignModalOpen}
        onOpenChange={setAddNewCampaignModalOpen}
      />
    </>
  );
};

export default CampaignsPage;
