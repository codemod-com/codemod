"use client";

import { useViewStore } from "@/store/view";
import type {
  ChartWidgetData,
  PrimitiveWidgetData,
  TableWidgetData,
} from "@codemod-com/api-types";
import type { Widget } from "@codemod-com/database";
import { useParams } from "next/navigation";
import { useMemo } from "react";
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

// const getTableWidgetColumns = (data: TableWidgetData) => {
//   const columnKeySet = new Set<string>();
//   data.forEach((row) => {
//     Object.keys(row).forEach((key) => columnKeySet.add(key));
//   });

//   return Array.from(columnKeySet);
// };

// type TableWidgetProps = {
//   widget: Widget & { kind: "table"; data: TableWidgetData };
// };
// const TableWidget = ({ widget }: TableWidgetProps) => {
//   const columns = getTableWidgetColumns(widget.data);
//   return (
//     <Table.Root>
//       <Table.Header>
//         <Table.Row align="start">
//           {columns.map((col) => (
//             <Table.ColumnHeaderCell key={col}>{col}</Table.ColumnHeaderCell>
//           ))}
//         </Table.Row>
//       </Table.Header>

//       <Table.Body>
//         {widget.data.map((row, i) => (
//           <Table.Row
//             // how to add color? there is no JIT in tailwind
//             // className={cn("", )}
//             key={`${row.value}-${i}`}
//           >
//             {Object.entries(row).map(([k, v]) => (
//               <Table.Cell key={k}>{v}</Table.Cell>
//             ))}
//           </Table.Row>
//         ))}
//       </Table.Body>
//     </Table.Root>
//   );
// };

// function getFormattedValue(options: {
//   val: any;
//   key: string;
//   title: string;
//   row: any;
//   column: any;
// }) {
//   const { val, key, title, row, column } = options;

//   const numberVal = Number(val);

//   if (!numberVal) {
//     return val;
//   }

//   if (key.toLowerCase().includes("count")) {
//     return numberVal;
//   }
//   if (
//     title.toLowerCase().includes("exchange") ||
//     column.columnDef.accessorKey.includes("USD")
//   ) {
//     return formatFiat(numberVal, "USD");
//   }

//   const currency = row.original.Currency || "USD";
//   if (
//     title.toLowerCase().includes("crypto") &&
//     !column.columnDef.accessorKey.includes("USD")
//   ) {
//     if (column.columnDef.accessorKey.includes("Rate")) {
//       return formatFiat(numberVal, "USD");
//     }

//     return formatCrypto(numberVal, currency);
//   }

//   if (["BTC", "ETH", "LTC", "BNB"].includes(currency)) {
//     return formatCrypto(numberVal, currency);
//   }

//   return formatFiat(numberVal, currency);
// }

type TableWidgetProps = {
  widget: Widget & { kind: "table"; data: TableWidgetData };
};
const TableWidget = ({ widget }: TableWidgetProps) => {
  const { selectedRepos } = useViewStore();
  const insight = useInsight(widget.insightId);

  const filteredCodemodRuns = useMemo(
    () =>
      insight.data?.codemodRuns.filter(
        (run) =>
          run.repoUrl && selectedRepos.includes(run.repoUrl) && run.data.data,
      ),
    [selectedRepos, insight.data?.codemodRuns],
  );

  return (
    <>
      {widget.data.map(
        ({ title, value, color, icon }) => `${title} - ${value}`,
      )}
    </>
    // <DataTable
    //   columns={widget.data.map(({ title, value, color, icon }) => ({
    //     id: title,
    //     accessorFn: (row, i) => {
    //       const regexp = /`(\w+)\.(\w+)`/;
    //       const matchObj = value.match(regexp);

    //       // biome-ignore lint: it's ok
    //       if (matchObj && matchObj[1] && matchObj[2]) {
    //         const codemodRun = insight.data?.codemodRuns.find(
    //           (run) => run.data.codemod.name === matchObj[1],
    //         );

    //         if (!codemodRun) return row;
    //         const data = codemodRun.data.data;

    //         if (codemodRun.data.status === "done" && codemodRun.data.data) {
    //           if (typeof codemodRun.data.data === "object") {
    //             const replacementValue = get(
    //               Array.isArray(data) ? data[i] : data,
    //               matchObj[2],
    //             );

    //             return row;
    //           }
    //         }

    //         return codemodRun.data.data ?? null;
    //       }

    //       return row;
    //     },
    //     // header: () => {
    //     //   return <div className="whitespace-nowrap">{title}</div>;
    //     // },
    //     // cell: ({ row, column }) => {
    //     //   // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     //   // const val = (row.original as any)[key];
    //     //   // const numberVal = Number(val);
    //     //   // // const val =
    //     //   // //   key === "Equity exc. Credit"
    //     //   // //     ? row.getValue("Profit")
    //     //   // //     : row.getValue(key);
    //     //   // if (val === undefined) {
    //     //   //   return null;
    //     //   // }

    //     //   return (
    //     //     <div className={cn("whitespace-nowrap")}>
    //     //       {/* {getFormattedValue({ val, key, title, row, column })} */}
    //     //     </div>
    //     //   );
    //     // },
    //   }))}
    //   data={insight.data?.codemodRuns[0]?.data.data}
    // />
    // <Table.Root>
    //   <Table.Header>
    //     <Table.Row align="start">
    //       {widget.data.map((userDataPoint) => (
    //         <Table.ColumnHeaderCell key={userDataPoint.title}>
    //           {userDataPoint.title}
    //         </Table.ColumnHeaderCell>
    //       ))}
    //     </Table.Row>
    //   </Table.Header>

    //   <Table.Body>
    //     {widget.data.map((userDataPoint, i) => (
    //       <Table.Row
    //         // how to add color? there is no JIT in tailwind
    //         // className={cn("", )}
    //         key={`${userDataPoint.value}-${i}`}
    //       >
    //         {/* {Object.entries(row).map(([k, v]) => (
    //           <Table.Cell key={k}>{v}</Table.Cell>
    //         ))} */}
    //       </Table.Row>
    //     ))}
    //   </Table.Body>
    // </Table.Root>
  );
};

type ChartWidgetProps = {
  widget: Widget & { kind: "chart"; data: ChartWidgetData };
};
const ChartWidget = ({ widget }: ChartWidgetProps) => {
  return (
    <div>{widget.data.y.map(({ title, value }) => `${title} - ${value}`)}</div>
  );
};

type PrimitiveWidgetProps = {
  widget: Widget & { kind: "chart"; data: PrimitiveWidgetData };
};
const PrimitiveWidget = ({ widget }: PrimitiveWidgetProps) => {
  if (widget.data.heading) {
    return <h1>{widget.data.heading}</h1>;
  }

  return (
    <div>{Object.entries(widget.data).map(([k, v]) => `${k} - ${v}`)}</div>
  );
};

const Widget = (props: { widget: Widget }) => {
  if (props.widget.kind === "table") {
    return <TableWidget {...(props as TableWidgetProps)} />;
  }

  if (props.widget.kind === "chart") {
    return <ChartWidget {...(props as ChartWidgetProps)} />;
  }

  return <PrimitiveWidget {...(props as PrimitiveWidgetProps)} />;
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
          <Widget widget={widget} key={widget.id} />
        ))}
      </div>
    </>
  );
};

export default InsightPage;
