"use client";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import type { GithubRepository } from "@codemod-com/api-types";
import { useState } from "react";
import CampaignsTable from "./components/InsightsTable";
import RepositorySelector from "./components/RepositorySelector";
import SecondaryHeader from "./components/SecondaryHeader";
import { useInsightTabsConfig } from "./hooks/useInsightsTabsConfig";
import { useCreateWorkflowRun } from "./hooks/useWorkflowRun";
import { useWorkflowRun } from "./hooks/useWorkflowRunData";

const InsightsPage = () => {
  const tabsConfig = useInsightTabsConfig();

  const [repo, setRepo] = useState<GithubRepository | null>();
  const [open, setOpen] = useState(false);

  const { workflowRunId, onWorkflowRunStart } = useCreateWorkflowRun("1");

  const workflowRun = useWorkflowRun(workflowRunId ?? "");

  // const { data } = useWorkflowRunArtifacts(
  //   workflowRunId ?? "",
  //   workflowRun?.state === "done",
  // );

  // const insights = data?.data?.[0] ?? null;

  // useEffect(() => {
  //   if (repo === null) {
  //     return;
  //   }

  //   onWorkflowRunStart(repo);
  // }, [repo, onWorkflowRunStart]);

  // useEffect(() => {
  //   if (!repo) {
  //     setOpen(true);
  //   }
  // }, [repo]);

  return (
    <>
      <div className="relative flex flex-col items-center justify-center">
        <SecondaryHeader
          onOpenRepoSelector={() => setOpen(true)}
          // insightsCount={insights?.migrations.length ?? 0}
          insightsCount={0}
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
              {/* {workflowRun?.state === "queued" ||
                (workflowRun?.state === "in_progress" &&
                  "Generating insights...")}
              {workflowRun?.state === "errored" && "Something went wrong..."} */}
              {/* {workflowRun?.state === "done" && insights
                ?  */}
              {tabsConfig.map(({ kind }) => (
                <TabContent forId={kind}>
                  <CampaignsTable insights={[]} type={kind} />
                </TabContent>
              ))}
              {/* : null} */}
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
