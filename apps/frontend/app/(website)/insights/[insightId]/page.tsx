"use client";
import RGL, { type Layout, WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);

import { useViewStore } from "@/store/view";
import type {
  ChartWidgetData,
  PrimitiveWidgetData,
  TableWidgetData,
} from "@codemod-com/api-types";
import type { Widget } from "@codemod-com/database";
import type { SortingState } from "@tanstack/react-table";
import { get } from "lodash-es";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Fragment, type ReactNode, useEffect, useMemo, useState } from "react";
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
import { useInsight } from "../hooks/useInsight";
import SecondaryHeader from "./components/SecondaryHeader";
import type { DynamicLineChartProps } from "./types";

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

  const [sortingState, setSortingState] = useState<SortingState>([]);

  const usedCodemods = useMemo(
    () =>
      widget.data.map(({ value }) => {
        const matchObj = value.match(/`(\w+)\.(.+)`/);
        if (matchObj?.length === 3) {
          return value.match(/`(\w+)\.(.+)`/)?.at(1)!;
        }
      }),
    [widget.data],
  );

  return (
    <>
      <h2 className="font-semibold">{widget.title}</h2>

      <DataTable<any>
        columns={widget.data.map(({ title, value, color, icon }) => ({
          id: title,
          accessorFn: (cellData, i) => {
            const regexp = /`(\w+)\.(.+)`/;
            const matchObj = value.match(regexp);

            // biome-ignore lint: it's ok
            if (matchObj && matchObj[1] && matchObj[2]) {
              const codemodRun = insight.data?.codemodRuns.find(
                (run) => run.data.codemod.name === matchObj[1],
              );

              if (!codemodRun) return value;
              const { data, status } = codemodRun.data;

              if (status === "done" && data && typeof data === "object") {
                const replacementValue =
                  get(Array.isArray(data) ? data[i] : data, matchObj[2]) ?? "?";

                return value.replace(regexp, replacementValue);
              }
            }

            return value;
          },
          header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
              <div
                role="button"
                className="whitespace-nowrap px-0 flex gap-xs flex-nowrap items-center"
                onClick={() => column.toggleSorting(isSorted === "asc")}
              >
                {title}
                {isSorted === "asc" ? (
                  <ArrowUp />
                ) : isSorted === "desc" ? (
                  <ArrowDown />
                ) : null}
              </div>
            );
          },
        }))}
        data={Array.from({
          length: Math.max(
            ...(insight.data?.codemodRuns
              .filter((run) => usedCodemods.includes(run.data.codemod.name))
              .map((run) => {
                const resultData = run.data?.data;

                if (Array.isArray(resultData)) {
                  return resultData.length;
                }

                return 1;
              }) ?? []),
          ),
        })}
      />
    </>
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
      : acc.concat(current);
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
    <>
      <h2 className="font-semibold">{widget.title}</h2>

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
    </>
  );
};

type PrimitiveWidgetProps = {
  widget: Widget & { kind: "chart"; data: PrimitiveWidgetData };
};
const PrimitiveWidget = ({ widget }: PrimitiveWidgetProps) => {
  const insight = useInsight(widget.insightId);
  const { title } = widget;

  const formattedWidgetData: PrimitiveWidgetData = useMemo(() => {
    const { ...widgetData } = Array.isArray(widget.data)
      ? widget.data[0]
      : widget.data;

    Object.keys(widgetData).forEach((key) => {
      try {
        const regexp = /`(\w+)\.(.+)`/;
        const matchObj = widgetData[key].match(regexp);

        // biome-ignore lint: it's ok
        if (matchObj && matchObj[1] && matchObj[2]) {
          const codemodRun = insight.data?.codemodRuns.find(
            (run) => run.data.codemod.name === matchObj[1],
          );

          if (!codemodRun) return;
          const { data, status } = codemodRun.data;

          if (status === "done" && data) {
            if (typeof data === "object") {
              const replacementValue =
                get(Array.isArray(data) ? data[0] : data, matchObj[2]) ?? "?";

              widgetData[key] = widgetData[key].replace(
                regexp,
                replacementValue,
              );
            }
          }
        }
      } catch {
        // Do nothing
      }
    });

    return widgetData;
  }, [insight.data?.codemodRuns, widget.data]);

  const Contents: ReactNode[] = [
    <h2 key={`widget-${title}-title`} className="font-semibold">
      {title}
    </h2>,
  ];
  if (formattedWidgetData.heading) {
    Contents.push(
      <h4
        key={`widget-${title}-heading`}
        className="text-lgHeading text-primary-light dark:text-primary-dark font-bold"
      >
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

  return <div className="justify-between flex flex-col h-full">{Contents}</div>;
};

const Widget = (props: { widget: Widget }) => {
  const { insightId } = useParams<{ insightId: string }>();
  const insight = useInsight(insightId);

  let Content: ReactNode;
  if (props.widget.kind === "table") {
    Content = <TableWidget {...(props as TableWidgetProps)} />;
  } else if (props.widget.kind === "chart") {
    Content = <ChartWidget {...(props as ChartWidgetProps)} />;
  } else {
    Content = <PrimitiveWidget {...(props as PrimitiveWidgetProps)} />;
  }

  const usedCodemods = useMemo(() => {
    const used: (string | undefined)[] = [];
    try {
      if (Array.isArray(props.widget.data)) {
        used.push(
          ...props.widget.data.map(({ value }) => {
            const matchObj = value.match(/`(\w+)\.(.+)`/);
            if (matchObj?.length === 3) {
              return value.match(/`(\w+)\.(.+)`/)?.at(1)!;
            }
          }),
        );
      }

      used.push(
        ...Object.keys(props.widget.data).map((key) => {
          const matchObj = props.widget.data[key].match(/`(\w+)\.(.+)`/);
          if (matchObj?.length === 3) {
            return props.widget.data[key].match(/`(\w+)\.(.+)`/)?.at(1)!;
          }
        }),
      );
    } catch (err) {}

    return [...new Set(used.filter(Boolean))];
  }, [props.widget.data]);

  const isLoading = useMemo(
    () =>
      usedCodemods.some(
        (c) =>
          insight.data?.codemodRuns.findIndex(
            (run) => run.data.codemod.name === c,
          ) === -1 ||
          insight.data?.codemodRuns.find((run) => run.data.codemod.name === c)
            ?.data?.status !== "done",
      ),
    [usedCodemods, insight.data?.codemodRuns],
  );

  if (isLoading) {
    Content = (
      <div className="flex h-full w-full justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl px-4 py-3 bg-white dark:bg-gray-darker overflow-hidden w-full h-full">
      {Content}
    </div>
  );
};

// const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

const InsightPage = () => {
  // useMirageServer(true);

  const { insightId } = useParams<{ insightId: string }>();
  const { selectedRepos } = useViewStore();
  const [layout, setLayout] = useState<Layout[]>([]);

  const insightQuery = useInsight(insightId);

  useEffect(() => {
    const generatedLayout: Layout[] = [];
    let currentX = 0;
    let currentY = 0;

    insightQuery.data?.widgets.forEach((widget, i) => {
      let w: number;
      let h: number;

      if (widget.kind === "table" || widget.kind === "chart") {
        w = 12;
        h = 9;
      } else {
        w = 4;
        h = 4;
      }

      if (currentX + w > 12) {
        currentX = 0;
        currentY += h;
      }

      generatedLayout.push({
        x: currentX,
        y: currentY,
        w: w,
        h: h,
        i: i.toString(),
        resizeHandles: ["se"],
      });

      currentX += w;
    });

    setLayout(generatedLayout);
  }, [insightQuery.data?.widgets]);

  console.log(layout);
  return (
    <div className="flex-1 bg-emphasis-light dark:bg-emphasis-dark w-full">
      <SecondaryHeader />

      <div className="px-4 py-2">
        <ReactGridLayout
          layout={layout}
          onLayoutChange={setLayout}
          rowHeight={30}
          // preventCollision={true}
          // compactType="horizontal"
          cols={12}
        >
          {insightQuery.data?.widgets.map((w, i) => (
            <div key={i}>
              <Widget widget={w} />
            </div>
          ))}
        </ReactGridLayout>
      </div>
    </div>
  );
};

export default InsightPage;
