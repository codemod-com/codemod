"use client";

import { useViewStore } from "@/store/view";
import type {
  ChartWidgetData,
  PrimitiveWidgetData,
  TableWidgetData,
} from "@codemod-com/api-types";
import type { Widget } from "@codemod-com/database";
import { get } from "lodash-es";
import { useParams } from "next/navigation";
import type React from "react";
import { Fragment, type ReactNode, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { v4 as uuidv4 } from "uuid";
import { DataTable } from "../components/table/table";
// import { useEffect } from "react";
import { useInsight } from "../hooks/useInsight";
// import { ChartTile } from "./components/ChartTile";
import SecondaryHeader from "./components/SecondaryHeader";
import type { DynamicLineChartProps } from "./types";

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
    <DataTable
      columns={widget.data.map(({ title, value, color, icon }) => ({
        id: title,
        accessorFn: (cellData, i) => {
          const regexp = /`(\w+)\.(\w+)`/;
          const matchObj = value.match(regexp);

          // biome-ignore lint: it's ok
          if (matchObj && matchObj[1] && matchObj[2]) {
            const codemodRun = insight.data?.codemodRuns.find(
              (run) => run.data.codemod.name === matchObj[1],
            );

            if (!codemodRun) return value;
            const { data, status } = codemodRun.data;

            if (status === "done" && data) {
              if (typeof data === "object") {
                const replacementValue = get(
                  Array.isArray(data) ? data[i] : data,
                  matchObj[2],
                );

                return value.replace(regexp, replacementValue);
              }
            }

            return value;
          }

          return value;
        },
        // header: () => {
        //   return <div className="whitespace-nowrap">{title}</div>;
        // },
        // cell: ({ row, column }) => {
        //   // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //   // const val = (row.original as any)[key];
        //   // const numberVal = Number(val);
        //   // // const val =
        //   // //   key === "Equity exc. Credit"
        //   // //     ? row.getValue("Profit")
        //   // //     : row.getValue(key);
        //   // if (val === undefined) {
        //   //   return null;
        //   // }

        //   return (
        //     <div className={cn("whitespace-nowrap")}>
        //       {/* {getFormattedValue({ val, key, title, row, column })} */}
        //     </div>
        //   );
        // },
      }))}
      data={
        insight.data?.codemodRuns.find(
          (run) => run.data.codemod.name === "drift_analyzer",
        )?.data.data
      }
    />
  );
};

interface ExtendedDynamicLineChartProps extends DynamicLineChartProps {
  title: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: TooltipPayloadItem[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const uniquePayload = payload.reduce<TooltipPayloadItem[]>(
      (acc, current) => {
        if (!acc.find((item) => item.name === current.name)) {
          acc.push(current);
        }
        return acc;
      },
      [],
    );

    return (
      <div className="custom-tooltip bg-white p-4 shadow-md rounded">
        <p className="label">{`${new Date(label || "").toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          },
        )}`}</p>
        {uniquePayload.map((pld, index) => (
          <p
            key={index}
            style={{ color: pld.color }}
          >{`${pld.name}: ${pld.value.toFixed(2)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

interface LegendPayloadItem {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: { value: string; color: string }[];
}

const CustomLegend: React.FC<CustomLegendProps> = ({ payload = [] }) => {
  const uniquePayload = payload.reduce<LegendPayloadItem[]>((acc, current) => {
    return acc.some((item) => item.value === current.value)
      ? acc
      : [...acc, current];
  }, []);

  return (
    <ul className="flex flex-wrap relative justify-center space-x-4">
      {uniquePayload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <span
            style={{
              backgroundColor: entry.color,
              width: "10px",
              height: "10px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const colorConfig = [
  {
    line: "#60A5FA",
    gradientStart: "#93C5FD",
    gradientEnd: "#EFF6FF",
  },
  {
    line: "#4ADE80",
    gradientStart: "#86EFAC",
    gradientEnd: "#ECFDF5",
  },
];

type ChartWidgetProps = {
  widget: Widget & { kind: "chart"; data: ChartWidgetData };
};
// @TODO: Currently supports only one data set
const ChartWidget = ({ widget }: ChartWidgetProps) => {
  const insight = useInsight(widget.insightId);

  const codemodRun = insight.data?.codemodRuns.find(
    (run) => run.data.codemod.name === "chart_analyzer",
  );
  if (!codemodRun) return null;
  const { data, status } = codemodRun.data;

  const xDataKey = "timestamp";
  const yDataKeys = widget.data.y.map(({ value }) => {
    const regexp = /`(\w+)\.(\w+)`/;
    const matchObj = value.match(regexp);

    // biome-ignore lint: it's ok
    if (matchObj && matchObj[1] && matchObj[2]) {
      if (status === "done" && data) {
        if (typeof data === "object") {
          return matchObj[2];
        }
      }
    }
  });

  return (
    <ResponsiveContainer height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xDataKey}
          // type="number"
          // scale="time"
          domain={["auto", "auto"]}
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          }
          padding={{ left: 30, right: 30 }}
        />
        <YAxis domain={["auto", "auto"]} padding={{ top: 20, bottom: 20 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        {widget.data.y.map((yData, index) => {
          const gradientId = `gradient-${uuidv4()}`;
          const color = colorConfig[index % colorConfig.length];

          return (
            <Fragment key={yData.title}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={color.gradientStart}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={color.gradientEnd}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey={yDataKeys[index]}
                stroke={color.line}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
              <Area
                type="monotone"
                dataKey={yDataKeys[index]}
                stroke="none"
                fill={`url(#${gradientId})`}
              />
            </Fragment>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

type PrimitiveWidgetProps = {
  widget: Widget & { kind: "chart"; data: PrimitiveWidgetData };
};
const PrimitiveWidget = ({ widget }: PrimitiveWidgetProps) => {
  const insight = useInsight(widget.insightId);
  const { title } = widget;

  const formattedWidgetData: PrimitiveWidgetData = useMemo(() => {
    const { ...widgetData } = widget.data;
    console.log(widgetData);
    Object.keys(widgetData).forEach((key) => {
      const regexp = /`(\w+)\.(\w+)`/;
      const matchObj = widgetData[key].match(regexp);

      // biome-ignore lint: it's ok
      if (matchObj && matchObj[1] && matchObj[2]) {
        const codemodRun = insight.data?.codemodRuns.find(
          (run) => run.data.codemod.name === matchObj[1],
        );

        if (!codemodRun) return widgetData[key];
        const { data, status } = codemodRun.data;

        if (status === "done" && data) {
          if (typeof data === "object") {
            const replacementValue = get(
              Array.isArray(data) ? data[0] : data,
              matchObj[2],
            );

            widgetData[key] = widgetData[key].replace(regexp, replacementValue);
          }
        }
      }
    });

    return widgetData;
  }, [insight.data?.codemodRuns, widget.data]);

  const Contents: ReactNode[] = [
    <h3 key={`widget-${title}-title`}>{widget.title}</h3>,
  ];
  if (formattedWidgetData.heading) {
    Contents.push(
      <h4 key={`widget-${title}-heading`} className="text-xl text-black">
        {formattedWidgetData.heading}
      </h4>,
    );
  }

  if (formattedWidgetData.text) {
    Contents.push(
      <p key={`widget-${title}-main`}>{formattedWidgetData.text}</p>,
    );
  }

  if (formattedWidgetData.description) {
    Contents.push(
      <p key={`widget-${title}-description`}>
        {formattedWidgetData.description}
      </p>,
    );
  }

  return <div className="flex flex-col gap-2">{Contents}</div>;
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
    <div className="bg-emphasis-light dark:bg-emphasis-dark h-full">
      <SecondaryHeader />
      <div className="w-full flex gap-4 flex-wrap">
        {insightQuery.data?.widgets.map((widget) => (
          <div
            key={widget.id}
            className="rounded-lg px-4 py-3 bg-white overflow-hidden w-full h-full"
          >
            <Widget widget={widget} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightPage;
