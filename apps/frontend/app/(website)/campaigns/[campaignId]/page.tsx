"use client";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/widgets/CustomTable";
import { useMirageServer } from "@/hooks/useMirageServer";
import { useViewStore } from "@/store/view";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import SecondaryHeader from "./components/SecondaryHeader";
import { useCodemodRunResult } from "./hooks/useCodemodRunExecutionStatus";
import { useRunCodemodMutation } from "./hooks/useRunCodemodMutation";
import { type Widget, useWidgets } from "./hooks/useWidgets";

const getWidgetComponentByType = (kind: Widget["kind"]) => {
  switch (kind) {
    case "Table":
      return CustomTable;
    default:
      return null;
  }
};

// @TODO
const getPersistedWidgetData = () => null;

const CampaignPage = () => {
  // @TODO
  useMirageServer(true);

  const { campaignId } = useParams<{ campaignId: string }>();
  const { selectedRepos } = useViewStore();

  const widgets = useWidgets(campaignId);

  const { executionIds, runCodemodMutation } = useRunCodemodMutation();

  const runCodemod = async (workflow: string) =>
    await runCodemodMutation.mutateAsync({
      codemods: [workflow],
      repos: selectedRepos,
    });

  const codemodRunResults = useCodemodRunResult(
    executionIds.map(({ id }) => id),
  );

  // const refreshAll = async () => {
  //   const request = {
  //     workflows: widgets.map(({ workflow }) => workflow),
  //     repos,
  //   };

  //   await runCodemodMutation.mutateAsync(request);
  // };

  // refresh if no data stored
  useEffect(() => {
    const storedData = getPersistedWidgetData();

    if (storedData === null) {
      // refreshAll();
    }
  }, []);

  return (
    <>
      <SecondaryHeader />
      <div className="w-full">
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-6">
              {widgets.map((widget) => {
                const Component = getWidgetComponentByType(widget.kind);
                // const activeWorkflows = executionIds.map(
                //   ({ codemod }) => codemod,
                // );

                return Component ? (
                  <Component
                    key={widget.id}
                    title={widget.title}
                    data={widget.data}
                    workflow={widget.workflow}
                    loading={false}
                    error={"error"}
                    getData={runCodemod}
                  />
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPage;
