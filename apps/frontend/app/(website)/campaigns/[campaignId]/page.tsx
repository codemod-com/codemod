"use client";
import { useMirageServer } from "@/hooks/useMirageServer";
import { useViewStore } from "@/store/view";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ChartTile } from "./components/ChartTile";
import SecondaryHeader from "./components/SecondaryHeader";
import { TableTile } from "./components/TableTile";
import {
  type GetExecutionStatusResponse,
  useCodemodRunResult,
} from "./hooks/useCodemodRunExecutionStatus";
import { useRunCodemodMutation } from "./hooks/useRunCodemodMutation";
import { type Widget, useWidgets } from "./hooks/useWidgets";

const getWidgetComponentByType = (kind: Widget["kind"]) => {
  switch (kind) {
    case "Table":
      return TableTile;
    case "Chart":
      return ChartTile;
    default:
      return null;
  }
};

const getWidgetPropsFromStatus = (
  widgetCodemodStatus: GetExecutionStatusResponse[number],
) => {
  const { status } = widgetCodemodStatus;

  let data = [];

  if (status === "success") {
    try {
      data = JSON.parse(widgetCodemodStatus.result);
    } catch (e) {
      console.log("Unable to parse codemod run result");
    }
  }

  return {
    loading: status === "in_progress",
    data,
    error: status === "errored" ? widgetCodemodStatus.message : null,
    statusMessage:
      status === "in_progress"
        ? `Loading ${widgetCodemodStatus.progress} / 100`
        : "",
  };
};

const CampaignPage = () => {
  useMirageServer(true);

  const { campaignId } = useParams<{ campaignId: string }>();
  const { selectedRepos } = useViewStore();

  const widgets = useWidgets(campaignId);

  const { executionIds, runCodemodMutation } = useRunCodemodMutation();

  const runCodemod = async (workflow: string) =>
    await runCodemodMutation.mutateAsync({
      codemods: [
        { name: workflow, engine: "workflow", args: { repos: selectedRepos } },
      ],
    });

  const codemodRunResults = useCodemodRunResult(
    executionIds.map(({ id }) => id),
  );

  // refresh all
  useEffect(() => {
    runCodemodMutation.mutateAsync({
      codemods: widgets.map((widget) => ({
        name: widget.workflow,
        engine: "workflow",
        args: { repos: selectedRepos },
      })),
    });
  }, [widgets]);

  return (
    <>
      <SecondaryHeader />
      <div className="w-full">
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-6">
              {widgets.map((widget) => {
                const Component = getWidgetComponentByType(widget.kind);

                const widgetCodemodRunStatus = codemodRunResults.find(
                  (result) => result.codemod === widget.workflow,
                );

                const widgetProps = widgetCodemodRunStatus
                  ? getWidgetPropsFromStatus(widgetCodemodRunStatus)
                  : { loading: false, data: [], error: "" };

                const getData = () => runCodemod(widget.workflow);

                return Component ? (
                  <Component
                    key={widget.id}
                    title={widget.title}
                    getData={getData}
                    {...widgetProps}
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
