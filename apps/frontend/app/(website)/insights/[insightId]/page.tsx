"use client";
import { useViewStore } from "@/store/view";
import type { Widget } from "@codemod-com/database";
import { useParams } from "next/navigation";
// import { useEffect } from "react";
import { useInsight } from "../hooks/useInsight";
// import { ChartTile } from "./components/ChartTile";
import SecondaryHeader from "./components/SecondaryHeader";

// const getWidgetComponentByType = (kind: Widget["kind"]) => {
//   switch (kind) {
//     case "Table":
//       return TableTile;
//     case "Chart":
//       return ChartTile;
//     default:
//       return null;
//   }
// };

// const getWidgetPropsFromStatus = (
//   widgetCodemodStatus: GetExecutionStatusResponse[number],
// ) => {
//   const { status } = widgetCodemodStatus;

//   let data = [];

//   if (status === "success") {
//     try {
//       data = JSON.parse(widgetCodemodStatus.result);
//     } catch (e) {
//       console.log("Unable to parse codemod run result");
//     }
//   }

//   return {
//     loading: status === "in_progress",
//     data,
//     error: status === "errored" ? widgetCodemodStatus.message : null,
//     statusMessage:
//       status === "in_progress"
//         ? `Loading ${widgetCodemodStatus.progress} / 100`
//         : "",
//   };
// };

const TableWidget = ({ widget }: { widget: Widget & { kind: "table" } }) => {};
const ChartWidget = () => {};
const PrimitiveWidget = () => {};

const Widget = ({ widget }: { widget: Widget }) => {
  if (widget.kind === "table") {
  }

  if (widget.kind === "chart") {
  }

  return <
};

const InsightPage = () => {
  // useMirageServer(true);

  const { insightId } = useParams<{ insightId: string }>();
  const { selectedRepos } = useViewStore();

  const insightQuery = useInsight(insightId);

  if (insightQuery.isLoading) {
    return <div>Loading...</div>;
  }

  // insightQuery.data?.widgets.map((widget) => {
  //   console.log(widget);
  // });

  // const { executionIds, runCodemodMutation } = useRunCodemodMutation();

  // const runCodemod = async (workflow: string) =>
  //   await runCodemodMutation.mutateAsync({
  //     codemods: [
  //       { name: workflow, engine: "workflow", args: { repos: selectedRepos } },
  //     ],
  //   });

  // const codemodRunResults = useCodemodRunResult(executionIds);

  // refresh all
  // useEffect(() => {
  //   runCodemodMutation.mutateAsync({
  //     codemods: widgets.map((widget) => ({
  //       name: widget.workflow,
  //       engine: "workflow",
  //       args: { repos: selectedRepos },
  //     })),
  //   });
  // }, [widgets]);

  return (
    <>
      <SecondaryHeader />
      <div className="w-full">
        {insightQuery.data?.widgets.map((widget) => (
          <Widget />
        ))}
      </div>
    </>
  );
};

export default InsightPage;
