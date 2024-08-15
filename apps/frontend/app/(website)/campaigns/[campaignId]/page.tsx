"use client";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/widgets/CustomTable";
import { useMirageServer } from "@/hooks/useMirageServer";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import SecondaryHeader from "./components/SecondaryHeader";
import { useCodemodRunResult } from "./hooks/useCodemodRunResult";
import { useRunCodemodMutation } from "./hooks/useRunCodemodMutation";
import { useSelectedRepos } from "./hooks/useSelectedRepos";
import { type Widget, useWidgets } from "./hooks/useWidgets";

const getRenderWidget =
  ({
    runCodemod,
    isLoading,
    error,
    executionIds,
  }: {
    runCodemod(args: any): Promise<any>;
    isLoading: boolean;
    error: string;
    executionIds: { id: string; workflow: string }[];
  }) =>
  (widget: Widget) => {
    const activeWorkflows = executionIds.map(({ workflow }) => workflow);

    switch (widget.kind) {
      case "Table": {
        return (
          <CustomTable
            title={widget.title}
            data={widget.data}
            workflow={widget.workflow}
            // @TODO currently workflow can be used once on the dashboard, so we can find needed widget by workflow name, later we will need to associate the workflow with specific widget
            loading={isLoading && activeWorkflows.includes(widget.workflow)}
            error={error}
            getData={runCodemod}
          />
        );
      }
      default:
        return null;
    }
  };

// @TODO
const getPersistedWidgetData = () => null;

const CampaignPage = () => {
  useMirageServer(true);
  const { campaignId } = useParams();
  const repos = useSelectedRepos();

  const widgets = useWidgets(campaignId as string);

  const { executionIds, runCodemodMutation } = useRunCodemodMutation();

  const runCodemod = async (workflow: any) =>
    await runCodemodMutation.mutateAsync({
      workflows: [workflow],
      repos,
    });

  const { isLoading, error, result } = useCodemodRunResult(
    executionIds.map(({ id }) => id),
  );

  const renderWidget = getRenderWidget({
    runCodemod,
    isLoading,
    error,
    result,
    executionIds,
  });

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
            <div className="p-6">{widgets.map(renderWidget)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPage;
