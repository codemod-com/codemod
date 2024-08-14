"use client";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/widgets/CustomTable";
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
  }: {
    runCodemod(args: any): Promise<any>;
    isLoading: boolean;
    error: string;
  }) =>
  (widget: Widget) => {
    switch (widget.kind) {
      case "Table": {
        return (
          <CustomTable
            title={widget.title}
            data={widget.data}
            workflow={widget.workflow}
            // @TODO show loading indicator only for specific widgets
            loading={isLoading}
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
  const { campaignId } = useParams();
  const repos = useSelectedRepos();

  const widgets = useWidgets(campaignId as string);

  const { executionIds, runCodemodMutation } = useRunCodemodMutation();

  const runCodemod = async (request: any) =>
    await runCodemodMutation.mutateAsync(request);

  const { isLoading, error, result } = useCodemodRunResult(executionIds);

  const renderWidget = getRenderWidget({
    runCodemod,
    isLoading,
    error,
    result,
    executionIds,
  });

  const refreshAll = async () => {
    const request = {
      workflows: widgets.map(({ workflow }) => workflow),
      repo: repos,
    };

    await runCodemodMutation.mutateAsync(request);
  };

  // refresh if no data stored
  useEffect(() => {
    const storedData = getPersistedWidgetData();

    if (storedData === null) {
      refreshAll();
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
